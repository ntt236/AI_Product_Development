-- ==============================================================================
-- Migration: Learning Streak & Calendar-Day Review Boundary
-- Version: 20261020_streak_and_calendar_schedule
-- Description:
--   1. Adds streak columns to `public.profiles`: `current_streak`, `longest_streak`, `last_study_date`.
--   2. Updates `submit_vocabulary_review_session` RPC to:
--      - Calculate next review based on Vietnam calendar-day boundary (00:00:00 local time).
--      - Advance learner's daily study streak atomically with transaction locks.
-- ==============================================================================

-- 1. Add streak columns to public.profiles
alter table public.profiles
  add column if not exists current_streak integer not null default 0 check (current_streak >= 0),
  add column if not exists longest_streak integer not null default 0 check (longest_streak >= 0),
  add column if not exists last_study_date date;

create index if not exists idx_profiles_last_study_date on public.profiles(last_study_date);

-- 2. Update Atomic Review Session RPC with Calendar-Day Boundary & Streak Engine
create or replace function public.submit_vocabulary_review_session(
  p_review_session_id uuid,
  p_reviews jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid;
  v_log_count integer;
  v_review record;
  v_user_vocab record;
  v_updated_json jsonb;
  v_consecutive integer;
  v_new_interval integer;
  v_interval_before integer;
  v_new_status text;
  v_next_review_at timestamptz;
  v_now timestamptz := pg_catalog.now();
  v_today_date date;
  v_profile record;
  v_new_streak integer;
  v_new_longest integer;
  v_updated_items jsonb := '[]'::jsonb;
begin
  -- 1. Ensure authenticated caller
  v_user_id := auth.uid();
  if v_user_id is null then
    raise exception 'UNAUTHENTICATED: Yêu cầu đăng nhập.';
  end if;

  if p_review_session_id is null or p_reviews is null or pg_catalog.jsonb_array_length(p_reviews) = 0 then
    raise exception 'INVALID_INPUT: Dữ liệu phiên ôn tập không hợp lệ.';
  end if;

  -- Validate no duplicate user_vocab_id in the same submission payload
  if (
    select pg_catalog.count(distinct (elem->>'user_vocab_id'))
    from pg_catalog.jsonb_array_elements(p_reviews) as elem
  ) <> pg_catalog.jsonb_array_length(p_reviews) then
    raise exception 'INVALID_INPUT: Danh sách ôn tập chứa từ vựng bị lặp lại trong cùng một phiên.';
  end if;

  -- 2. Advisory Transaction Lock on Session (Chống race condition / gửi trùng đồng thời)
  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtext('vocab_review_session:' || v_user_id::text || ':' || p_review_session_id::text)
  );

  -- 3. Idempotency Guard: Check if session was already processed
  select pg_catalog.count(*) into v_log_count
  from public.vocabulary_review_logs
  where user_id = v_user_id and review_session_id = p_review_session_id;

  if v_log_count > 0 then
    select pg_catalog.coalesce(pg_catalog.jsonb_agg(pg_catalog.to_jsonb(uv)), '[]'::jsonb) into v_updated_items
    from public.user_vocabulary uv
    where uv.user_id = v_user_id
      and uv.id in (
        select (elem->>'user_vocab_id')::uuid
        from pg_catalog.jsonb_array_elements(p_reviews) as elem
      );

    return pg_catalog.jsonb_build_object(
      'session_already_processed', true,
      'updated_count', 0,
      'items', v_updated_items
    );
  end if;

  -- 4. Atomic processing with row-level locks
  for v_review in
    select 
      (elem->>'user_vocab_id')::uuid as user_vocab_id,
      (elem->>'result')::text as result
    from pg_catalog.jsonb_array_elements(p_reviews) as elem
  loop
    if v_review.result not in ('remembered', 'forgot') then
      raise exception 'INVALID_RESULT: Kết quả ôn tập phải là remembered hoặc forgot.';
    end if;

    select * into v_user_vocab
    from public.user_vocabulary
    where id = v_review.user_vocab_id and user_id = v_user_id
    for update;

    if not found then
      raise exception 'UNAUTHORIZED_OR_NOT_FOUND: Từ vựng % không tồn tại hoặc không thuộc quyền sở hữu của bạn.', v_review.user_vocab_id;
    end if;

    v_interval_before := v_user_vocab.interval_days;

    -- Calculate deterministic schedule progression
    if v_review.result = 'remembered' then
      v_consecutive := v_user_vocab.consecutive_correct + 1;
      if v_consecutive = 1 then
        v_new_interval := 1;
        v_new_status := 'learning';
      elsif v_consecutive = 2 then
        v_new_interval := 3;
        v_new_status := 'learning';
      elsif v_consecutive = 3 then
        v_new_interval := 7;
        v_new_status := 'reviewing';
      elsif v_consecutive = 4 then
        v_new_interval := 14;
        v_new_status := 'reviewing';
      else
        v_new_interval := 30;
        v_new_status := 'mastered';
      end if;
    else
      v_consecutive := 0;
      v_new_interval := 1;
      v_new_status := 'learning';
    end if;

    -- Calendar-Day Boundary: sets next_review_at to 00:00:00 Vietnam time (UTC+7) on the target day
    v_next_review_at := ((v_now at time zone 'Asia/Ho_Chi_Minh')::date + v_new_interval)::timestamp at time zone 'Asia/Ho_Chi_Minh';

    -- Update user_vocabulary atomically
    update public.user_vocabulary
    set
      interval_days = v_new_interval,
      consecutive_correct = v_consecutive,
      status = v_new_status,
      next_review_at = v_next_review_at,
      last_reviewed_at = v_now,
      review_count = v_user_vocab.review_count + 1,
      updated_at = v_now
    where id = v_user_vocab.id
    returning pg_catalog.to_jsonb(user_vocabulary.*) into v_updated_json;

    v_updated_items := v_updated_items || pg_catalog.jsonb_build_array(v_updated_json);

    -- Insert into immutable review logs
    insert into public.vocabulary_review_logs (
      user_id,
      user_vocab_id,
      review_session_id,
      result,
      interval_before,
      interval_after,
      reviewed_at
    ) values (
      v_user_id,
      v_user_vocab.id,
      p_review_session_id,
      v_review.result,
      v_interval_before,
      v_new_interval,
      v_now
    );
  end loop;

  -- 5. Advance Daily Study Streak on public.profiles atomically
  v_today_date := (v_now at time zone 'Asia/Ho_Chi_Minh')::date;
  select * into v_profile
  from public.profiles
  where id = v_user_id
  for update;

  if found then
    if v_profile.last_study_date is null then
      v_new_streak := 1;
      v_new_longest := pg_catalog.greatest(v_profile.longest_streak, 1);
    elsif v_profile.last_study_date = v_today_date then
      v_new_streak := v_profile.current_streak;
      v_new_longest := v_profile.longest_streak;
    elsif v_profile.last_study_date = (v_today_date - 1) then
      v_new_streak := v_profile.current_streak + 1;
      v_new_longest := pg_catalog.greatest(v_profile.longest_streak, v_new_streak);
    else
      v_new_streak := 1;
      v_new_longest := pg_catalog.greatest(v_profile.longest_streak, 1);
    end if;

    update public.profiles
    set
      current_streak = v_new_streak,
      longest_streak = v_new_longest,
      last_study_date = v_today_date,
      updated_at = v_now
    where id = v_user_id;
  end if;

  return pg_catalog.jsonb_build_object(
    'session_already_processed', false,
    'updated_count', pg_catalog.jsonb_array_length(v_updated_items),
    'items', v_updated_items
  );
end;
$$;
