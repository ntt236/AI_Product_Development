-- ==============================================================================
-- Migration: Phase 2 — Placement Assessment Security Hardening
-- Version: 20261014_phase_2_security_hardening
-- Description:
--   Hardens existing Phase 2 placement assessment tables against unauthorized writes,
--   scoring manipulation, completed attempt tampering, and question answer leaks:
--   1. Re-asserts is_admin_or_service_role() privilege boundary.
--   2. Enforces protect_assessment_attempt_fields() trigger:
--      - Guards INSERT: user_id = auth.uid(), status = 'in_progress', null scores/timestamps, answered_count = 0.
--      - Guards UPDATE: blocks non-service_role tampering of status, score, max_score, accuracy, timestamps.
--      - Blocks updating attempts if status is not 'in_progress'.
--   3. Enforces protect_assessment_answer_fields() trigger:
--      - Blocks non-privileged writes to is_correct and score_awarded.
--      - Verifies attempt ownership and ensures attempt is currently in_progress.
--      - Blocks reassigning answers to another attempt or question.
--   4. Adds update_attempt_answered_count() trigger:
--      - Automatically synchronizes answered_count on assessment_attempts on answer insert/delete.
--   5. Re-asserts strict RLS policies and FORCE ROW LEVEL SECURITY.
--   6. Explicit REVOKE & GRANT on all 7 assessment tables, stripping default privileges.
-- ==============================================================================

-- 1. Helper Function: is_admin_or_service_role
create or replace function public.is_admin_or_service_role()
returns boolean
language plpgsql
stable
set search_path = public
as $$
begin
  if auth.jwt() is not null then
    return coalesce(auth.jwt()->>'role', '') = 'service_role';
  end if;
  return session_user in ('postgres', 'supabase_admin');
end;
$$;

-- 2. Trigger Function: protect_assessment_attempt_fields
create or replace function public.protect_assessment_attempt_fields()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  is_privileged boolean;
begin
  is_privileged := public.is_admin_or_service_role();

  -- Privileged callers (service_role, migrations, DB superuser) bypass user locks
  if is_privileged then
    return new;
  end if;

  -- 1. Guard INSERT by regular clients
  if tg_op = 'INSERT' then
    if new.user_id is distinct from auth.uid() then
      raise exception 'Không thể tạo lượt làm bài cho người dùng khác.';
    end if;

    if new.status is distinct from 'in_progress' then
      raise exception 'Bài làm mới phải bắt đầu ở trạng thái in_progress.';
    end if;

    if new.score is not null or new.max_score is not null or new.accuracy is not null then
      raise exception 'Chỉ hệ thống chấm điểm mới có quyền thiết lập điểm số.';
    end if;

    if new.submitted_at is not null or new.completed_at is not null then
      raise exception 'Không thể tạo bài làm với trạng thái đã nộp hoặc đã hoàn thành.';
    end if;

    if coalesce(new.answered_count, 0) != 0 then
      raise exception 'answered_count khởi tạo phải bằng 0.';
    end if;

    return new;
  end if;

  -- 2. Guard UPDATE by regular clients
  if tg_op = 'UPDATE' then
    if old.status is distinct from 'in_progress' then
      raise exception 'Không thể chỉnh sửa lượt làm bài đã kết thúc.';
    end if;

    if new.id is distinct from old.id then
      raise exception 'Không thể thay đổi attempt id.';
    end if;

    if new.user_id is distinct from old.user_id then
      raise exception 'Không thể chuyển quyền sở hữu bài làm sang người dùng khác.';
    end if;

    if new.assessment_id is distinct from old.assessment_id then
      raise exception 'Không thể thay đổi bài đánh giá của lượt làm bài.';
    end if;

    if new.status is distinct from old.status then
      raise exception 'Chỉ hệ thống chấm điểm phía server mới có quyền thay đổi trạng thái hoàn thành.';
    end if;

    if new.score is distinct from old.score
       or new.max_score is distinct from old.max_score
       or new.accuracy is distinct from old.accuracy
       or new.submitted_at is distinct from old.submitted_at
       or new.completed_at is distinct from old.completed_at then
      raise exception 'Chỉ hệ thống chấm điểm mới có quyền cập nhật điểm số và thời điểm nộp bài.';
    end if;

    return new;
  end if;

  return new;
end;
$$;

drop trigger if exists check_assessment_attempt_permissions on public.assessment_attempts;
create trigger check_assessment_attempt_permissions
  before insert or update on public.assessment_attempts
  for each row
  execute function public.protect_assessment_attempt_fields();

-- 3. Trigger Function: protect_assessment_answer_fields
create or replace function public.protect_assessment_answer_fields()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  is_privileged boolean;
  v_attempt_status text;
  v_attempt_user_id uuid;
begin
  is_privileged := public.is_admin_or_service_role();

  -- Privileged callers (service_role, postgres) bypass client locks
  if is_privileged then
    return new;
  end if;

  -- Verify attempt status and ownership
  select status, user_id into v_attempt_status, v_attempt_user_id
  from public.assessment_attempts
  where id = new.attempt_id;

  if v_attempt_status is null then
    raise exception 'Không tìm thấy lượt làm bài tương ứng.';
  end if;

  if v_attempt_user_id is distinct from auth.uid() then
    raise exception 'Không có quyền ghi nhận câu trả lời cho bài làm của người khác.';
  end if;

  if v_attempt_status is distinct from 'in_progress' then
    raise exception 'Lượt làm bài đã kết thúc, không thể thêm hoặc sửa câu trả lời.';
  end if;

  -- 1. Guard INSERT
  if tg_op = 'INSERT' then
    if new.is_correct is not null or new.score_awarded is not null then
      raise exception 'Chỉ hệ thống chấm điểm mới có quyền ghi nhận tính đúng sai và điểm số.';
    end if;
    return new;
  end if;

  -- 2. Guard UPDATE
  if tg_op = 'UPDATE' then
    if new.id is distinct from old.id then
      raise exception 'Không thể thay đổi answer id.';
    end if;
    if new.attempt_id is distinct from old.attempt_id then
      raise exception 'Không thể chuyển câu trả lời sang attempt khác.';
    end if;
    if new.question_id is distinct from old.question_id then
      raise exception 'Không thể thay đổi question id của câu trả lời.';
    end if;

    if new.is_correct is distinct from old.is_correct
       or new.score_awarded is distinct from old.score_awarded then
      raise exception 'Chỉ hệ thống chấm điểm mới có quyền cập nhật tính đúng sai và điểm số.';
    end if;

    return new;
  end if;

  return new;
end;
$$;

drop trigger if exists check_assessment_answer_permissions on public.assessment_answers;
create trigger check_assessment_answer_permissions
  before insert or update on public.assessment_answers
  for each row
  execute function public.protect_assessment_answer_fields();

-- 4. Trigger Function: update_attempt_answered_count
create or replace function public.update_attempt_answered_count()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  target_attempt_id uuid;
begin
  if tg_op = 'INSERT' then
    target_attempt_id := new.attempt_id;
  elsif tg_op = 'DELETE' then
    target_attempt_id := old.attempt_id;
  end if;

  update public.assessment_attempts
  set answered_count = (
    select count(*) from public.assessment_answers where attempt_id = target_attempt_id
  ),
  updated_at = now()
  where id = target_attempt_id;

  return null;
end;
$$;

drop trigger if exists sync_assessment_answered_count on public.assessment_answers;
create trigger sync_assessment_answered_count
  after insert or delete on public.assessment_answers
  for each row
  execute function public.update_attempt_answered_count();

-- Backfill / sync answered_count on any existing attempts
update public.assessment_attempts a
set answered_count = (
  select count(*) from public.assessment_answers ans where ans.attempt_id = a.id
)
where a.answered_count is distinct from (
  select count(*) from public.assessment_answers ans where ans.attempt_id = a.id
);

-- 5. Row Level Security Policies (Idempotent Drop and Create)
alter table public.assessments enable row level security;
alter table public.assessment_questions enable row level security;
alter table public.assessment_question_answers enable row level security;
alter table public.assessment_attempts enable row level security;
alter table public.assessment_answers enable row level security;
alter table public.assessment_results enable row level security;
alter table public.learner_skill_profiles enable row level security;

-- Force RLS on all sensitive tables to guarantee protection
alter table public.assessment_question_answers force row level security;
alter table public.assessment_attempts force row level security;
alter table public.assessment_answers force row level security;
alter table public.assessment_results force row level security;
alter table public.learner_skill_profiles force row level security;

-- public.assessments
drop policy if exists "Published assessments are readable" on public.assessments;
create policy "Published assessments are readable"
  on public.assessments for select
  using (is_published = true);

-- public.assessment_questions
drop policy if exists "Questions of published assessments are readable" on public.assessment_questions;
create policy "Questions of published assessments are readable"
  on public.assessment_questions for select
  using (
    exists (
      select 1 from public.assessments a 
      where a.id = assessment_questions.assessment_id and a.is_published = true
    )
  );

-- public.assessment_question_answers
-- STRICT DEFENSE: NO SELECT / INSERT / UPDATE / DELETE POLICY FOR AUTHENTICATED OR ANON.
-- Table is completely inaccessible to clients.
drop policy if exists "Deny all client operations on answer keys" on public.assessment_question_answers;

-- public.assessment_attempts
drop policy if exists "Users can read own attempts" on public.assessment_attempts;
create policy "Users can read own attempts"
  on public.assessment_attempts for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own attempts" on public.assessment_attempts;
create policy "Users can insert own attempts"
  on public.assessment_attempts for insert
  with check (
    auth.uid() = user_id 
    and status = 'in_progress' 
    and score is null 
    and max_score is null 
    and accuracy is null 
    and submitted_at is null 
    and completed_at is null 
    and coalesce(answered_count, 0) = 0
  );

-- Drop legacy client update policy if it was applied previously
drop policy if exists "Users can update own in-progress attempts" on public.assessment_attempts;

-- public.assessment_answers
drop policy if exists "Users can read own answers" on public.assessment_answers;
create policy "Users can read own answers"
  on public.assessment_answers for select
  using (
    exists (
      select 1 from public.assessment_attempts a
      where a.id = assessment_answers.attempt_id and a.user_id = auth.uid()
    )
  );

drop policy if exists "Users can insert own answers while in-progress" on public.assessment_answers;
create policy "Users can insert own answers while in-progress"
  on public.assessment_answers for insert
  with check (
    is_correct is null
    and score_awarded is null
    and exists (
      select 1 from public.assessment_attempts a
      where a.id = assessment_answers.attempt_id 
        and a.user_id = auth.uid() 
        and a.status = 'in_progress'
    )
  );

drop policy if exists "Users can update own answers while in-progress" on public.assessment_answers;
create policy "Users can update own answers while in-progress"
  on public.assessment_answers for update
  using (
    exists (
      select 1 from public.assessment_attempts a
      where a.id = assessment_answers.attempt_id 
        and a.user_id = auth.uid() 
        and a.status = 'in_progress'
    )
  )
  with check (
    is_correct is null
    and score_awarded is null
    and exists (
      select 1 from public.assessment_attempts a
      where a.id = assessment_answers.attempt_id 
        and a.user_id = auth.uid() 
        and a.status = 'in_progress'
    )
  );

-- public.assessment_results
drop policy if exists "Users can read own results" on public.assessment_results;
create policy "Users can read own results"
  on public.assessment_results for select
  using (auth.uid() = user_id);

-- public.learner_skill_profiles
drop policy if exists "Users can read own skill profiles" on public.learner_skill_profiles;
create policy "Users can read own skill profiles"
  on public.learner_skill_profiles for select
  using (auth.uid() = user_id);

-- 6. Strict Explicit Permissions (Grants & Revokes)
grant usage on schema public to authenticated, anon, service_role;

-- Revoke all table-level access from public/anon/authenticated on private answer keys
revoke all on table public.assessment_question_answers from public, anon, authenticated;

-- Client permissions on assessments & questions: SELECT only
revoke insert, update, delete on table public.assessments from public, anon, authenticated;
grant select on table public.assessments to authenticated, anon;

revoke insert, update, delete on table public.assessment_questions from public, anon, authenticated;
grant select on table public.assessment_questions to authenticated, anon;

-- Client permissions on attempts: SELECT, INSERT only (UPDATE & DELETE strictly revoked)
revoke all on table public.assessment_attempts from public, anon;
revoke update, delete on table public.assessment_attempts from authenticated;
grant select, insert on table public.assessment_attempts to authenticated;

-- Client permissions on answers: SELECT, INSERT, UPDATE only (DELETE revoked)
revoke all on table public.assessment_answers from public, anon;
revoke delete on table public.assessment_answers from authenticated;
grant select, insert, update on table public.assessment_answers to authenticated;

-- Client permissions on results: SELECT only
revoke all on table public.assessment_results from public, anon;
revoke insert, update, delete on table public.assessment_results from authenticated;
grant select on table public.assessment_results to authenticated;

-- Client permissions on learner_skill_profiles: SELECT only
revoke all on table public.learner_skill_profiles from public, anon;
revoke insert, update, delete on table public.learner_skill_profiles from authenticated;
grant select on table public.learner_skill_profiles to authenticated;

-- Service role has full permissions for server-side evaluation engine
grant all on table public.assessments to service_role;
grant all on table public.assessment_questions to service_role;
grant all on table public.assessment_question_answers to service_role;
grant all on table public.assessment_attempts to service_role;
grant all on table public.assessment_answers to service_role;
grant all on table public.assessment_results to service_role;
grant all on table public.learner_skill_profiles to service_role;
