-- ============================================================================
-- Migration: 20261017_phase_5_ai_tutor.sql
-- Description: Phase 5 — AI Tutor & Generative Assistance Infrastructure
--   - public.ai_generations: Audit logging of AI requests, prompt versions,
--     latency, token usage, and status.
--   - public.ai_rate_limits: Persistent server-side sliding-window rate limiting.
--   - check_and_increment_ai_rate_limit(): Atomic rate limiter function.
-- Security:
--   - Least-privilege RLS policies.
--   - SECURITY DEFINER SET search_path = '' for all functions.
--   - Revocation of direct mutation rights from authenticated/anon roles.
-- ============================================================================

-- 1. Table: public.ai_generations
create table if not exists public.ai_generations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  feature text not null,
  provider text not null,
  model text not null,
  prompt_version text not null,
  status text not null check (status in ('success', 'error', 'fallback')),
  latency_ms integer not null default 0,
  prompt_tokens integer,
  completion_tokens integer,
  total_tokens integer,
  estimated_cost numeric(10,6),
  error_code text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

comment on table public.ai_generations is 'Audit log for AI provider calls, prompt versions, latency, and token metrics';

create index if not exists idx_ai_generations_user_created 
  on public.ai_generations(user_id, created_at desc);

create index if not exists idx_ai_generations_feature_status 
  on public.ai_generations(feature, status, created_at desc);

-- 2. Table: public.ai_rate_limits
create table if not exists public.ai_rate_limits (
  user_id uuid not null references auth.users(id) on delete cascade,
  window_start timestamptz not null,
  request_count integer not null default 1,
  created_at timestamptz not null default now(),
  primary key (user_id, window_start)
);

comment on table public.ai_rate_limits is 'Persistent rate limiting window tracker for AI operations';

create index if not exists idx_ai_rate_limits_window 
  on public.ai_rate_limits(window_start);

-- 3. Atomic Rate Limiter Stored Procedure
create or replace function public.check_and_increment_ai_rate_limit(
  p_user_id uuid,
  p_window_start timestamptz,
  p_max_requests integer
)
returns table (allowed boolean, current_count integer)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_count integer;
begin
  if p_user_id is null then
    raise exception 'check_and_increment_ai_rate_limit: p_user_id cannot be null';
  end if;

  if p_window_start is null then
    raise exception 'check_and_increment_ai_rate_limit: p_window_start cannot be null';
  end if;

  if p_max_requests is null or p_max_requests <= 0 then
    raise exception 'check_and_increment_ai_rate_limit: p_max_requests must be greater than 0';
  end if;

  if p_window_start > (now() + interval '5 minutes') then
    raise exception 'check_and_increment_ai_rate_limit: p_window_start cannot be in the future';
  end if;

  insert into public.ai_rate_limits (user_id, window_start, request_count)
  values (p_user_id, p_window_start, 1)
  on conflict (user_id, window_start)
  do update set request_count = public.ai_rate_limits.request_count + 1
  returning public.ai_rate_limits.request_count into v_count;

  if v_count <= p_max_requests then
    return query select true, v_count;
  else
    return query select false, v_count;
  end if;
end;
$$;

comment on function public.check_and_increment_ai_rate_limit is 'Server-only atomic rate limit checker and counter incrementer';

-- 4. Operational Maintenance: Cleanup expired rate limit windows
create or replace function public.cleanup_expired_ai_rate_limits(
  p_older_than interval default interval '1 day'
)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_deleted integer;
begin
  delete from public.ai_rate_limits
  where window_start < (now() - p_older_than);
  get diagnostics v_deleted = row_count;
  return v_deleted;
end;
$$;

comment on function public.cleanup_expired_ai_rate_limits is 'Deletes rate limit tracker rows older than the specified retention window (default 1 day)';

-- 5. Enable Row Level Security (RLS)
alter table public.ai_generations enable row level security;
alter table public.ai_rate_limits enable row level security;

alter table public.ai_generations force row level security;
alter table public.ai_rate_limits force row level security;

-- 6. RLS Policies
-- Users can only read their own AI generations (e.g. for tutor history)
drop policy if exists "Users can read own ai generations" on public.ai_generations;
create policy "Users can read own ai generations"
  on public.ai_generations for select
  using (auth.uid() = user_id);

-- ai_rate_limits is strictly internal; no direct read or write by authenticated users
-- All interactions must go through server-side service_role execution

-- 7. Permissions and Role Grants (Least Privilege)
-- Explicitly revoke all table permissions from public, anon, and authenticated
revoke all on table public.ai_generations from public, anon, authenticated;
revoke all on table public.ai_rate_limits from public, anon, authenticated;

-- Authenticated can only SELECT their own ai_generations via RLS
grant select on table public.ai_generations to authenticated;

-- Service role has full administrative access for backend logging and rate limiting
grant all on table public.ai_generations to service_role;
grant all on table public.ai_rate_limits to service_role;

-- Stored function execution:
-- CRITICAL SECURITY: Revoke execute from authenticated, anon, and public to prevent DoS or quota spoofing.
-- Only service_role (invoked via server-side createAdminClient) is permitted to call rate limit RPCs.
revoke all on function public.check_and_increment_ai_rate_limit(uuid, timestamptz, integer) from public, anon, authenticated;
grant execute on function public.check_and_increment_ai_rate_limit(uuid, timestamptz, integer) to service_role;

revoke all on function public.cleanup_expired_ai_rate_limits(interval) from public, anon, authenticated;
grant execute on function public.cleanup_expired_ai_rate_limits(interval) to service_role;
