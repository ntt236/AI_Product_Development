-- ==============================================================================
-- Migration: Phase 1 — Authentication, Profiles & Onboarding (Hardened)
-- Version: 20261012_phase_1_auth_profile_onboarding
-- Description:
--   1. Creates `public.profiles` linked to `auth.users` with automated trigger.
--   2. Enforces strict privilege boundary on system-managed fields (`estimated_level`,
--      `onboarding_completed_at`, `id`) for both INSERT and UPDATE operations.
--   3. Restricts profile creation to database trigger (`handle_new_user`) and
--      authorized server admin contexts (disallowing direct client INSERT).
--   4. Creates `public.goals` with target_level CEFR checks and unique partial index
--      for primary active goals.
--   5. Creates `public.learner_preferences` with validated weekday representations
--      (bounded, 1..7, no duplicates).
--   6. Configures Row Level Security (RLS) policies for tenant data isolation.
-- ==============================================================================

-- 1. Helper functions

-- Helper: update updated_at timestamps
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Helper: explicit privilege boundary check
-- When called via PostgREST API: auth.jwt() is present; only role = 'service_role' is privileged.
-- When called in direct SQL (migrations, psql, Supabase SQL Editor): auth.jwt() is null,
-- and we inspect session_user (which does NOT change inside SECURITY DEFINER contexts).
-- Ordinary authenticated requests, anon, or untrusted/NULL JWT roles evaluate strictly to false.
create or replace function public.is_admin_or_service_role()
returns boolean
language plpgsql
stable
set search_path = public
as $$
begin
  -- 1. API request with JWT claim (PostgREST session)
  if auth.jwt() is not null then
    return coalesce(auth.jwt()->>'role', '') = 'service_role';
  end if;

  -- 2. Direct database connection outside PostgREST (migrations, dashboard SQL Editor)
  -- Use session_user because current_user switches to the function owner inside SECURITY DEFINER functions.
  return session_user in ('postgres', 'supabase_admin');
end;
$$;

-- Helper: validate preferred_study_days representation
-- Ensures days is an array of 1..7 elements, each element between 1 (Monday) and 7 (Sunday), with no duplicates.
create or replace function public.validate_study_days(days smallint[])
returns boolean
language plpgsql
immutable
set search_path = public
as $$
declare
  elem_count integer;
  distinct_count integer;
begin
  if days is null then
    return true;
  end if;

  elem_count := cardinality(days);
  if elem_count < 1 or elem_count > 7 then
    return false;
  end if;

  select count(distinct d) into distinct_count
  from unnest(days) as d
  where d between 1 and 7;

  return distinct_count = elem_count;
end;
$$;

-- 2. Table: public.profiles
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  native_language text not null default 'vi',
  timezone text not null default 'Asia/Ho_Chi_Minh',
  estimated_level text check (
    estimated_level is null or 
    estimated_level in ('pre_a1', 'a1', 'a2', 'b1', 'b2', 'c1', 'c2')
  ),
  onboarding_completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Trigger: update profiles.updated_at
drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
  before update on public.profiles
  for each row
  execute function public.handle_updated_at();

-- Trigger Function: protect privileged and system-managed fields on public.profiles
create or replace function public.protect_profile_fields()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  is_privileged boolean;
begin
  is_privileged := public.is_admin_or_service_role();

  -- Privileged callers (migrations, backend service_role, DB superuser) bypass user-level field locks
  if is_privileged then
    return new;
  end if;

  -- Guard INSERT operations by non-privileged roles (e.g. standard authenticated clients)
  if tg_op = 'INSERT' then
    if new.estimated_level is not null then
      raise exception 'Chỉ hệ thống đánh giá mới có quyền gán estimated_level.';
    end if;

    if new.onboarding_completed_at is not null then
      raise exception 'Không thể đặt onboarding_completed_at khi khởi tạo hồ sơ.';
    end if;

    return new;
  end if;

  -- Guard UPDATE operations by non-privileged roles
  if tg_op = 'UPDATE' then
    -- Disallow altering primary key id
    if new.id is distinct from old.id then
      raise exception 'Không thể thay đổi user id của profile.';
    end if;

    -- Disallow self-updating estimated_level
    if new.estimated_level is distinct from old.estimated_level then
      raise exception 'Không có quyền tự cập nhật estimated_level. Trường này do hệ thống đánh giá quản lý.';
    end if;

    -- Disallow clearing or modifying an already completed onboarding timestamp
    if old.onboarding_completed_at is not null and new.onboarding_completed_at is distinct from old.onboarding_completed_at then
      raise exception 'Không thể thay đổi hoặc hủy trạng thái hoàn thành onboarding đã thiết lập.';
    end if;

    -- If marking onboarding completed for the first time, enforce onboarding prerequisites
    if old.onboarding_completed_at is null and new.onboarding_completed_at is not null then
      if not exists (
        select 1 from public.goals
        where user_id = new.id and priority = 'primary' and status = 'active'
      ) or not exists (
        select 1 from public.learner_preferences
        where user_id = new.id
      ) then
        raise exception 'Không thể đánh dấu hoàn thành onboarding khi chưa thiết lập mục tiêu và thời gian học.';
      end if;

      if new.onboarding_completed_at > now() + interval '5 minutes' then
        raise exception 'Thời gian onboarding_completed_at không hợp lệ.';
      end if;
    end if;

    return new;
  end if;

  return new;
end;
$$;

drop trigger if exists check_profile_field_permissions on public.profiles;
create trigger check_profile_field_permissions
  before insert or update on public.profiles
  for each row
  execute function public.protect_profile_fields();

-- 3. Automatic Profile Creation Trigger on auth.users
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id,
    coalesce(
      nullif(trim(new.raw_user_meta_data->>'display_name'), ''),
      nullif(trim(new.raw_user_meta_data->>'full_name'), ''),
      split_part(new.email, '@', 1),
      'Learner'
    ),
    nullif(trim(new.raw_user_meta_data->>'avatar_url'), '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- 4. Table: public.goals
create table if not exists public.goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  goal_type text not null check (
    goal_type in (
      'foundation',
      'daily_communication',
      'general_english',
      'improve_listening',
      'improve_speaking',
      'improve_reading',
      'improve_writing',
      'build_vocabulary',
      'strengthen_grammar',
      'toeic',
      'work',
      'study',
      'travel',
      'other'
    )
  ),
  title text not null,
  target_level text check (
    target_level is null or 
    target_level in ('pre_a1', 'a1', 'a2', 'b1', 'b2', 'c1', 'c2')
  ),
  target_toeic_score integer check (target_toeic_score is null or (target_toeic_score between 10 and 990)),
  weekly_minutes integer check (weekly_minutes is null or weekly_minutes > 0),
  priority text not null default 'secondary' check (priority in ('primary', 'secondary')),
  status text not null default 'active' check (status in ('active', 'paused', 'completed', 'archived')),
  target_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Trigger: update goals.updated_at
drop trigger if exists set_goals_updated_at on public.goals;
create trigger set_goals_updated_at
  before update on public.goals
  for each row
  execute function public.handle_updated_at();

-- Partial index: only 1 active primary goal allowed per user
create unique index if not exists idx_goals_user_primary_active 
  on public.goals(user_id) 
  where (priority = 'primary' and status = 'active');

create index if not exists idx_goals_user_status 
  on public.goals(user_id, status);

-- 5. Table: public.learner_preferences
create table if not exists public.learner_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  daily_minutes integer not null default 30 check (daily_minutes between 5 and 240),
  preferred_learning_style text,
  preferred_study_days smallint[] default '{1,2,3,4,5}' check (
    public.validate_study_days(preferred_study_days)
  ),
  reminder_enabled boolean default false,
  difficulty_preference text default 'adaptive' check (
    difficulty_preference in ('easier', 'adaptive', 'challenging')
  ),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Trigger: update learner_preferences.updated_at
drop trigger if exists set_learner_preferences_updated_at on public.learner_preferences;
create trigger set_learner_preferences_updated_at
  before update on public.learner_preferences
  for each row
  execute function public.handle_updated_at();

-- ==============================================================================
-- 6. Row Level Security (RLS) Configuration
-- ==============================================================================

-- Enable RLS on all 3 tables
alter table public.profiles enable row level security;
alter table public.goals enable row level security;
alter table public.learner_preferences enable row level security;

-- Policies for public.profiles
drop policy if exists "Users can read own profile" on public.profiles;
create policy "Users can read own profile"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Note: Direct client INSERT policy ("Users can insert own profile") is intentionally removed.
-- Profile creation is strictly delegated to the `on_auth_user_created` trigger (security definer)
-- or authorized backend services (service_role).
drop policy if exists "Users can insert own profile" on public.profiles;

-- Policies for public.goals
drop policy if exists "Users can read own goals" on public.goals;
create policy "Users can read own goals"
  on public.goals for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own goals" on public.goals;
create policy "Users can insert own goals"
  on public.goals for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own goals" on public.goals;
create policy "Users can update own goals"
  on public.goals for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete own goals" on public.goals;
create policy "Users can delete own goals"
  on public.goals for delete
  using (auth.uid() = user_id);

-- Policies for public.learner_preferences
drop policy if exists "Users can read own preferences" on public.learner_preferences;
create policy "Users can read own preferences"
  on public.learner_preferences for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own preferences" on public.learner_preferences;
create policy "Users can insert own preferences"
  on public.learner_preferences for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own preferences" on public.learner_preferences;
create policy "Users can update own preferences"
  on public.learner_preferences for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ==============================================================================
-- 7. Table and Function Permissions (Grants)
-- ==============================================================================

grant usage on schema public to authenticated, anon, service_role;

-- Grant required table privileges (access remains strictly constrained by RLS)
grant select, update on table public.profiles to authenticated;
grant select, insert, update, delete on table public.goals to authenticated;
grant select, insert, update on table public.learner_preferences to authenticated;

-- Grant full table access to service_role for backend workflows
grant all on table public.profiles to service_role;
grant all on table public.goals to service_role;
grant all on table public.learner_preferences to service_role;

-- Grant execute privileges on helper functions
grant execute on function public.validate_study_days(smallint[]) to authenticated, anon, service_role;
grant execute on function public.is_admin_or_service_role() to authenticated, anon, service_role;
