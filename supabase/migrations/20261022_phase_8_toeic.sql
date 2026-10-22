-- ==============================================================================
-- Migration: Phase 8 — Comprehensive TOEIC Preparation & Full-Length Mock Exams
-- Version: 20261022_phase_8_toeic
-- Reviewer: ntt-backend (Senior Database Architect & Security Specialist)
-- Description:
--   1. Creates `public.toeic_test_forms` with strict type, question count, and time bounds.
--   2. Creates `public.toeic_test_questions` with section/part alignment & array validation.
--   3. Creates `public.toeic_question_answers` (SERVER-ONLY CONFIDENTIAL table with FORCE RLS).
--   4. Creates `public.toeic_attempts` & `public.toeic_answers` with zero-trust integrity constraints.
--   5. Applies defense-in-depth triggers blocking client score tampering and answer forgery.
--   6. Enforces hardened Row Level Security (RLS) policies and strict RBAC grant/revoke matrix.
--   7. Implements atomic RPC `public.submit_toeic_attempt` with row-locking and idempotency.
-- ==============================================================================

-- ==============================================================================
-- 1. Table: public.toeic_test_forms
-- ==============================================================================
create table if not exists public.toeic_test_forms (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text,
  test_type text not null constraint chk_toeic_test_forms_type check (
    test_type in ('full_test', 'mini_test', 'part_practice')
  ),
  target_part integer constraint chk_toeic_test_forms_target_part check (
    (test_type = 'part_practice' and target_part is not null and target_part between 1 and 7) or
    (test_type <> 'part_practice' and target_part is null)
  ),
  time_limit_minutes integer not null default 120 constraint chk_toeic_test_forms_time_limit check (
    time_limit_minutes > 0 and time_limit_minutes <= 300
  ),
  total_questions integer not null default 200 constraint chk_toeic_test_forms_total_questions check (
    total_questions > 0 and total_questions <= 200
  ),
  is_published boolean not null default false,
  scoring_version text not null default 'toeic_v1',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists set_toeic_test_forms_updated_at on public.toeic_test_forms;
create trigger set_toeic_test_forms_updated_at
  before update on public.toeic_test_forms
  for each row
  execute function public.handle_updated_at();

create index if not exists idx_toeic_forms_published
  on public.toeic_test_forms(is_published, test_type);

-- ==============================================================================
-- 2. Table: public.toeic_test_questions
-- ==============================================================================
create table if not exists public.toeic_test_questions (
  id uuid primary key default gen_random_uuid(),
  form_id uuid not null references public.toeic_test_forms(id) on delete cascade,
  section text not null constraint chk_toeic_questions_section check (
    section in ('listening', 'reading')
  ),
  part_number integer not null constraint chk_toeic_questions_part check (
    part_number between 1 and 7
  ),
  question_number integer not null constraint chk_toeic_questions_number check (
    question_number between 1 and 200
  ),
  passage_group_id text, -- Groups multi-question sets (Part 3, 4, 6, 7)
  prompt text not null,
  context_text text, -- Reading passages or dialogue context
  audio_url text, -- Audio clip for listening sections
  image_url text, -- Photo for Part 1 photographs
  options jsonb not null default '[]'::jsonb constraint chk_toeic_questions_options_array check (
    jsonb_typeof(options) = 'array'
  ),
  weight numeric(4,2) not null default 1.0 constraint chk_toeic_questions_weight check (weight > 0),
  topic text,
  difficulty smallint not null default 2 constraint chk_toeic_questions_difficulty check (
    difficulty between 1 and 5
  ),
  created_at timestamptz not null default now(),
  constraint uq_toeic_test_questions_position unique (form_id, question_number),
  constraint chk_toeic_questions_section_part check (
    (section = 'listening' and part_number between 1 and 4) or
    (section = 'reading' and part_number between 5 and 7)
  )
);

create index if not exists idx_toeic_questions_form_part 
  on public.toeic_test_questions(form_id, part_number, question_number);

create index if not exists idx_toeic_questions_passage
  on public.toeic_test_questions(form_id, passage_group_id)
  where passage_group_id is not null;

-- ==============================================================================
-- 3. Table: public.toeic_question_answers (SERVER-ONLY CONFIDENTIAL TABLE)
-- WARNING: Zero client read/write permissions. Keys accessed exclusively via backend/RPC.
-- ==============================================================================
create table if not exists public.toeic_question_answers (
  question_id uuid primary key references public.toeic_test_questions(id) on delete cascade,
  correct_option_id text not null constraint chk_toeic_correct_option check (
    correct_option_id in ('A', 'B', 'C', 'D')
  ),
  explanation text not null,
  transcript_text text,
  created_at timestamptz not null default now()
);

-- ==============================================================================
-- 4. Table: public.toeic_attempts
-- ==============================================================================
create table if not exists public.toeic_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  form_id uuid not null references public.toeic_test_forms(id) on delete cascade,
  status text not null default 'in_progress' constraint chk_toeic_attempts_status check (
    status in ('in_progress', 'submitted', 'abandoned')
  ),
  test_type text not null constraint chk_toeic_attempts_test_type check (
    test_type in ('full_test', 'mini_test', 'part_practice')
  ),
  started_at timestamptz not null default now(),
  submitted_at timestamptz,
  time_spent_seconds integer not null default 0 constraint chk_toeic_attempts_time_spent check (
    time_spent_seconds >= 0
  ),
  listening_raw_score integer default 0 constraint chk_toeic_attempts_listening_raw check (
    listening_raw_score >= 0 and listening_raw_score <= 100
  ),
  reading_raw_score integer default 0 constraint chk_toeic_attempts_reading_raw check (
    reading_raw_score >= 0 and reading_raw_score <= 100
  ),
  estimated_listening_score integer default 5 constraint chk_toeic_attempts_listening_est check (
    estimated_listening_score >= 5 and estimated_listening_score <= 495
  ),
  estimated_reading_score integer default 5 constraint chk_toeic_attempts_reading_est check (
    estimated_reading_score >= 5 and estimated_reading_score <= 495
  ),
  estimated_total_score integer default 10 constraint chk_toeic_attempts_total_est check (
    estimated_total_score >= 10 and estimated_total_score <= 990
  ),
  part_scores jsonb not null default '{}'::jsonb,
  scoring_version text not null default 'toeic_v1',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint chk_toeic_attempts_score_sum check (
    (status = 'in_progress') or
    (status in ('submitted', 'abandoned') and estimated_total_score = estimated_listening_score + estimated_reading_score)
  ),
  constraint chk_toeic_attempts_submitted_at check (
    (status = 'in_progress' and submitted_at is null) or
    (status = 'submitted' and submitted_at is not null) or
    (status = 'abandoned')
  )
);

drop trigger if exists set_toeic_attempts_updated_at on public.toeic_attempts;
create trigger set_toeic_attempts_updated_at
  before update on public.toeic_attempts
  for each row
  execute function public.handle_updated_at();

-- Partial unique index: Prevent dangling concurrent in_progress attempts for the same form
create unique index if not exists uq_toeic_attempts_user_form_in_progress 
  on public.toeic_attempts(user_id, form_id) 
  where status = 'in_progress';

create index if not exists idx_toeic_attempts_user_status 
  on public.toeic_attempts(user_id, status);

create index if not exists idx_toeic_attempts_user_created 
  on public.toeic_attempts(user_id, created_at desc);

create index if not exists idx_toeic_attempts_form
  on public.toeic_attempts(form_id);

-- ==============================================================================
-- 5. Table: public.toeic_answers
-- ==============================================================================
create table if not exists public.toeic_answers (
  id uuid primary key default gen_random_uuid(),
  attempt_id uuid not null references public.toeic_attempts(id) on delete cascade,
  question_id uuid not null references public.toeic_test_questions(id) on delete cascade,
  selected_option_id text constraint chk_toeic_answers_selected_option check (
    selected_option_id is null or selected_option_id in ('A', 'B', 'C', 'D')
  ),
  is_correct boolean,
  time_spent_seconds integer default 0 constraint chk_toeic_answers_time_spent check (
    time_spent_seconds >= 0
  ),
  flagged_for_review boolean default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint uq_toeic_answers_attempt_question unique (attempt_id, question_id)
);

drop trigger if exists set_toeic_answers_updated_at on public.toeic_answers;
create trigger set_toeic_answers_updated_at
  before update on public.toeic_answers
  for each row
  execute function public.handle_updated_at();

create index if not exists idx_toeic_answers_attempt 
  on public.toeic_answers(attempt_id);

create index if not exists idx_toeic_answers_attempt_correct
  on public.toeic_answers(attempt_id, is_correct);

-- ==============================================================================
-- 6. DEFENSE-IN-DEPTH TRIGGERS (Anti-Tampering)
-- ==============================================================================

-- Trigger 1: Protect toeic_attempts score & submission status tampering
create or replace function public.protect_toeic_attempt_fields()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  -- Only allow score and submission status changes by service_role or RPC
  if auth.role() <> 'service_role' then
    if tg_op = 'INSERT' then
      if new.status <> 'in_progress'
         or new.submitted_at is not null
         or new.listening_raw_score <> 0
         or new.reading_raw_score <> 0
         or new.estimated_listening_score <> 5
         or new.estimated_reading_score <> 5
         or new.estimated_total_score <> 10 then
        raise exception 'Sinh viên không thể tự khởi tạo phiên thi đã hoàn thành hoặc có sẵn điểm số.';
      end if;
    elsif tg_op = 'UPDATE' then
      if new.status = 'submitted' and old.status <> 'submitted' then
        raise exception 'Chỉ hệ thống chấm điểm máy chủ (RPC/service_role) mới có quyền hoàn thành bài thi TOEIC.';
      end if;
      if new.listening_raw_score is distinct from old.listening_raw_score
         or new.reading_raw_score is distinct from old.reading_raw_score
         or new.estimated_listening_score is distinct from old.estimated_listening_score
         or new.estimated_reading_score is distinct from old.estimated_reading_score
         or new.estimated_total_score is distinct from old.estimated_total_score then
        raise exception 'Điểm thi chỉ có thể được cập nhật thông qua hệ thống chấm điểm máy chủ.';
      end if;
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists check_toeic_attempt_permissions on public.toeic_attempts;
create trigger check_toeic_attempt_permissions
  before insert or update on public.toeic_attempts
  for each row
  execute function public.protect_toeic_attempt_fields();

-- Trigger 2: Protect toeic_answers is_correct tampering
create or replace function public.protect_toeic_answer_fields()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.role() <> 'service_role' then
    if tg_op = 'INSERT' then
      if new.is_correct is not null then
        raise exception 'Chỉ hệ thống chấm điểm mới có quyền cập nhật tính đúng sai (is_correct).';
      end if;
    elsif tg_op = 'UPDATE' then
      if new.is_correct is distinct from old.is_correct then
        raise exception 'Chỉ hệ thống chấm điểm mới có quyền cập nhật tính đúng sai (is_correct).';
      end if;
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists check_toeic_answer_permissions on public.toeic_answers;
create trigger check_toeic_answer_permissions
  before insert or update on public.toeic_answers
  for each row
  execute function public.protect_toeic_answer_fields();

-- ==============================================================================
-- 7. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

alter table public.toeic_test_forms enable row level security;
alter table public.toeic_test_questions enable row level security;
alter table public.toeic_question_answers enable row level security;
alter table public.toeic_question_answers force row level security;
alter table public.toeic_attempts enable row level security;
alter table public.toeic_answers enable row level security;

-- Forms: Public can view published forms
drop policy if exists "Anyone can view published toeic forms" on public.toeic_test_forms;
create policy "Anyone can view published toeic forms"
  on public.toeic_test_forms
  for select
  using (is_published = true);

-- Questions: Public can view questions of published forms
drop policy if exists "Anyone can view published toeic questions" on public.toeic_test_questions;
create policy "Anyone can view published toeic questions"
  on public.toeic_test_questions
  for select
  using (
    exists (
      select 1 from public.toeic_test_forms f
      where f.id = toeic_test_questions.form_id
      and f.is_published = true
    )
  );

-- Question Answers: STRICTLY CONFIDENTIAL. Zero select permissions for public/authenticated users.
-- Only service_role can access this table during server-side evaluation.
drop policy if exists "No client access to toeic question answers" on public.toeic_question_answers;
create policy "No client access to toeic question answers"
  on public.toeic_question_answers
  for all
  using (false)
  with check (false);

-- Attempts: Students manage only their own attempts with initial state enforcement
drop policy if exists "Users can view their own toeic attempts" on public.toeic_attempts;
create policy "Users can view their own toeic attempts"
  on public.toeic_attempts
  for select
  using (auth.uid() = user_id);

drop policy if exists "Users can create their own toeic attempts" on public.toeic_attempts;
create policy "Users can create their own toeic attempts"
  on public.toeic_attempts
  for insert
  with check (
    auth.uid() = user_id
    and status = 'in_progress'
    and submitted_at is null
    and listening_raw_score = 0
    and reading_raw_score = 0
    and estimated_listening_score = 5
    and estimated_reading_score = 5
    and estimated_total_score = 10
    and exists (
      select 1 from public.toeic_test_forms f
      where f.id = toeic_attempts.form_id
      and f.is_published = true
    )
  );

drop policy if exists "Users can update their own in_progress toeic attempts" on public.toeic_attempts;
create policy "Users can update their own in_progress toeic attempts"
  on public.toeic_attempts
  for update
  using (
    auth.uid() = user_id
    and status = 'in_progress'
  )
  with check (
    auth.uid() = user_id
    and status in ('in_progress', 'abandoned')
    and submitted_at is null
    and listening_raw_score = 0
    and reading_raw_score = 0
    and estimated_listening_score = 5
    and estimated_reading_score = 5
    and estimated_total_score = 10
  );

-- Answers: Students manage answers through their own attempts (with Anti-IDOR question validation)
drop policy if exists "Users can view answers of their own attempts" on public.toeic_answers;
create policy "Users can view answers of their own attempts"
  on public.toeic_answers
  for select
  using (
    exists (
      select 1 from public.toeic_attempts a
      where a.id = toeic_answers.attempt_id
      and a.user_id = auth.uid()
    )
  );

drop policy if exists "Users can insert answers for their own in_progress attempts" on public.toeic_answers;
create policy "Users can insert answers for their own in_progress attempts"
  on public.toeic_answers
  for insert
  with check (
    is_correct is null
    and exists (
      select 1
      from public.toeic_attempts a
      join public.toeic_test_questions q on q.id = toeic_answers.question_id
      where a.id = toeic_answers.attempt_id
        and a.user_id = auth.uid()
        and a.status = 'in_progress'
        and q.form_id = a.form_id
    )
  );

drop policy if exists "Users can update answers for their own in_progress attempts" on public.toeic_answers;
create policy "Users can update answers for their own in_progress attempts"
  on public.toeic_answers
  for update
  using (
    exists (
      select 1 from public.toeic_attempts a
      where a.id = toeic_answers.attempt_id
      and a.user_id = auth.uid()
      and a.status = 'in_progress'
    )
  )
  with check (
    is_correct is null
    and exists (
      select 1 from public.toeic_attempts a
      where a.id = toeic_answers.attempt_id
      and a.user_id = auth.uid()
      and a.status = 'in_progress'
    )
  );

-- ==============================================================================
-- 8. EXPLICIT SQL PRIVILEGES MATRIX (RBAC)
-- ==============================================================================

-- Revoke all default public grants
revoke all on table public.toeic_test_forms from public, anon;
revoke all on table public.toeic_test_questions from public, anon;
revoke all on table public.toeic_question_answers from public, anon, authenticated;
revoke all on table public.toeic_attempts from public, anon;
revoke all on table public.toeic_answers from public, anon;

-- Anon: Read-only access to published forms and questions
grant select on table public.toeic_test_forms to anon;
grant select on table public.toeic_test_questions to anon;

-- Authenticated: Read published content, manage own attempts and answers
grant select on table public.toeic_test_forms to authenticated;
grant select on table public.toeic_test_questions to authenticated;
grant select, insert, update on table public.toeic_attempts to authenticated;
grant select, insert, update on table public.toeic_answers to authenticated;

-- Service Role: Unrestricted administrator
grant all on table public.toeic_test_forms to service_role;
grant all on table public.toeic_test_questions to service_role;
grant all on table public.toeic_question_answers to service_role;
grant all on table public.toeic_attempts to service_role;
grant all on table public.toeic_answers to service_role;

-- ==============================================================================
-- 9. ATOMIC STORED PROCEDURE: submit_toeic_attempt
-- ==============================================================================
create or replace function public.submit_toeic_attempt(
  p_attempt_id uuid,
  p_time_spent_seconds integer default 0
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_attempt record;
  v_caller_id uuid;
  v_is_service_role boolean;
  v_listening_correct integer := 0;
  v_reading_correct integer := 0;
  v_listening_total integer := 0;
  v_reading_total integer := 0;
  v_est_listening integer := 5;
  v_est_reading integer := 5;
  v_est_total integer := 10;
  v_part_scores jsonb;
  v_now timestamptz := now();
begin
  -- Identify caller
  v_caller_id := auth.uid();
  v_is_service_role := (auth.role() = 'service_role');

  -- 1. Lock attempt row FOR UPDATE
  select * into v_attempt
  from public.toeic_attempts
  where id = p_attempt_id
  for update;

  if not found then
    raise exception 'Không tìm thấy bài thi TOEIC (attempt_id: %).', p_attempt_id;
  end if;

  -- 2. Authorization check (Anti-IDOR)
  if not v_is_service_role and (v_caller_id is null or v_attempt.user_id <> v_caller_id) then
    raise exception 'Bạn không có quyền nộp bài thi này.';
  end if;

  -- 3. Idempotency guard: If already submitted, return existing result safely
  if v_attempt.status = 'submitted' then
    return jsonb_build_object(
      'attempt_id', v_attempt.id,
      'already_submitted', true,
      'listening_raw_score', v_attempt.listening_raw_score,
      'reading_raw_score', v_attempt.reading_raw_score,
      'estimated_listening_score', v_attempt.estimated_listening_score,
      'estimated_reading_score', v_attempt.estimated_reading_score,
      'estimated_total_score', v_attempt.estimated_total_score,
      'part_scores', v_attempt.part_scores,
      'submitted_at', v_attempt.submitted_at
    );
  end if;

  if v_attempt.status = 'abandoned' then
    raise exception 'Không thể nộp bài thi đã bị hủy bỏ.';
  end if;

  -- 4. Grade answers by comparing with confidential answer key
  update public.toeic_answers a
  set is_correct = (a.selected_option_id is not null and a.selected_option_id = k.correct_option_id),
      updated_at = v_now
  from public.toeic_question_answers k
  where a.attempt_id = p_attempt_id
    and a.question_id = k.question_id;

  -- 5. Calculate Listening & Reading raw scores and question totals
  select
    coalesce(count(*) filter (where q.section = 'listening'), 0),
    coalesce(count(*) filter (where q.section = 'reading'), 0),
    coalesce(count(*) filter (where q.section = 'listening' and a.is_correct = true), 0),
    coalesce(count(*) filter (where q.section = 'reading' and a.is_correct = true), 0)
  into v_listening_total, v_reading_total, v_listening_correct, v_reading_correct
  from public.toeic_test_questions q
  left join public.toeic_answers a
    on a.question_id = q.id and a.attempt_id = p_attempt_id
  where q.form_id = v_attempt.form_id;

  -- Normalize raw scores to ETS scale (bounds: 5 - 495)
  if v_listening_total > 0 then
    v_est_listening := 5 + round((v_listening_correct::numeric / v_listening_total::numeric) * 490.0 / 5.0) * 5;
    if v_est_listening > 495 then v_est_listening := 495; end if;
    if v_est_listening < 5 then v_est_listening := 5; end if;
  else
    v_est_listening := 5;
  end if;

  if v_reading_total > 0 then
    v_est_reading := 5 + round((v_reading_correct::numeric / v_reading_total::numeric) * 490.0 / 5.0) * 5;
    if v_est_reading > 495 then v_est_reading := 495; end if;
    if v_est_reading < 5 then v_est_reading := 5; end if;
  else
    v_est_reading := 5;
  end if;

  v_est_total := v_est_listening + v_est_reading;

  -- Build part scores breakdown
  select jsonb_object_agg(
    'part_' || sub.part_number,
    jsonb_build_object(
      'part_number', sub.part_number,
      'section', sub.section,
      'total', sub.total,
      'correct', sub.correct,
      'accuracy', case when sub.total > 0 then round((sub.correct::numeric / sub.total::numeric) * 100.0, 1) else 0 end
    )
  )
  into v_part_scores
  from (
    select
      q.part_number,
      q.section,
      count(q.id) as total,
      coalesce(count(q.id) filter (where a.is_correct = true), 0) as correct
    from public.toeic_test_questions q
    left join public.toeic_answers a
      on a.question_id = q.id and a.attempt_id = p_attempt_id
    where q.form_id = v_attempt.form_id
    group by q.part_number, q.section
    order by q.part_number
  ) sub;

  -- 6. Update attempt atomically
  update public.toeic_attempts
  set status = 'submitted',
      submitted_at = v_now,
      time_spent_seconds = greatest(p_time_spent_seconds, 0),
      listening_raw_score = case when v_listening_total > 0 then round((v_listening_correct::numeric / v_listening_total::numeric) * 100) else 0 end,
      reading_raw_score = case when v_reading_total > 0 then round((v_reading_correct::numeric / v_reading_total::numeric) * 100) else 0 end,
      estimated_listening_score = v_est_listening,
      estimated_reading_score = v_est_reading,
      estimated_total_score = v_est_total,
      part_scores = coalesce(v_part_scores, '{}'::jsonb),
      updated_at = v_now
  where id = p_attempt_id;

  return jsonb_build_object(
    'attempt_id', p_attempt_id,
    'already_submitted', false,
    'listening_raw_score', case when v_listening_total > 0 then round((v_listening_correct::numeric / v_listening_total::numeric) * 100) else 0 end,
    'reading_raw_score', case when v_reading_total > 0 then round((v_reading_correct::numeric / v_reading_total::numeric) * 100) else 0 end,
    'estimated_listening_score', v_est_listening,
    'estimated_reading_score', v_est_reading,
    'estimated_total_score', v_est_total,
    'part_scores', coalesce(v_part_scores, '{}'::jsonb),
    'submitted_at', v_now
  );
end;
$$;

revoke all on function public.submit_toeic_attempt(uuid, integer) from public, anon;
grant execute on function public.submit_toeic_attempt(uuid, integer) to authenticated, service_role;
