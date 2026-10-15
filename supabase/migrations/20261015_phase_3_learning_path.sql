-- ==============================================================================
-- Migration: Phase 3 — Learner Profile & Adaptive Learning Path
-- Version: 20261015_phase_3_learning_path
-- Description:
--   1. Creates `public.learning_paths` for personalized learning journeys.
--   2. Creates `public.learning_path_versions` (immutable snapshots for audit & anti-overwrite).
--   3. Creates `public.learning_path_items` (hierarchical Milestones, Modules, Topics).
--   4. Enforces strict parent-child learning path integrity via Composite Foreign Key.
--   5. Enforces hierarchy rules (Milestone -> Module -> Topic) via trigger.
--   6. Enforces single active path per user via partial unique index.
--   7. Implements atomic RPC functions for path activation and customization with optimistic locking.
--   8. Enforces Least Privilege RLS: authenticated role has SELECT ONLY; mutations via server/RPC.
-- ==============================================================================

-- 1. Table: public.learning_paths
create table if not exists public.learning_paths (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  goal_id uuid references public.goals(id) on delete set null,
  title text not null,
  description text,
  target_level text not null check (
    target_level in ('pre_a1', 'a1', 'a2', 'b1', 'b2', 'c1', 'c2')
  ),
  total_estimated_minutes integer not null default 0 check (total_estimated_minutes >= 0),
  estimated_weeks integer not null default 4 check (estimated_weeks between 1 and 52),
  status text not null default 'proposed' check (
    status in ('proposed', 'active', 'paused', 'completed', 'rejected', 'archived')
  ),
  is_user_modified boolean not null default false,
  current_version integer not null default 1 check (current_version >= 1),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Partial unique index: Guarantees a learner can have AT MOST ONE active path at any given time
create unique index if not exists uq_user_single_active_path 
  on public.learning_paths(user_id) 
  where (status = 'active');

create index if not exists idx_learning_paths_user_status 
  on public.learning_paths(user_id, status);

create index if not exists idx_learning_paths_user_created 
  on public.learning_paths(user_id, created_at desc);

drop trigger if exists set_learning_paths_updated_at on public.learning_paths;
create trigger set_learning_paths_updated_at
  before update on public.learning_paths
  for each row
  execute function public.handle_updated_at();

-- 2. Table: public.learning_path_versions (Immutable Snapshot History)
create table if not exists public.learning_path_versions (
  id uuid primary key default gen_random_uuid(),
  learning_path_id uuid not null references public.learning_paths(id) on delete cascade,
  version_number integer not null check (version_number >= 1),
  change_reason text not null,
  created_by text not null default 'system' check (created_by in ('user', 'system', 'ai')),
  snapshot jsonb not null,
  created_at timestamptz not null default now(),
  constraint uq_learning_path_version unique (learning_path_id, version_number)
);

create index if not exists idx_learning_path_versions_path 
  on public.learning_path_versions(learning_path_id, version_number desc);

-- 3. Table: public.learning_path_items (Milestones, Modules, Topics)
create table if not exists public.learning_path_items (
  id uuid primary key default gen_random_uuid(),
  learning_path_id uuid not null references public.learning_paths(id) on delete cascade,
  parent_id uuid,
  item_type text not null check (item_type in ('milestone', 'module', 'topic')),
  title text not null,
  description text,
  skill text check (
    skill is null or skill in ('vocabulary', 'grammar', 'reading', 'listening', 'speaking', 'writing', 'toeic')
  ),
  target_level text check (
    target_level is null or target_level in ('pre_a1', 'a1', 'a2', 'b1', 'b2', 'c1', 'c2')
  ),
  position integer not null check (position >= 1),
  estimated_minutes integer not null default 0 check (
    (item_type = 'topic' and estimated_minutes between 5 and 180) or
    (item_type in ('milestone', 'module') and estimated_minutes >= 0)
  ),
  content_status text not null default 'planned_curriculum' check (
    content_status in ('available', 'planned_curriculum')
  ),
  status text not null default 'locked' check (
    status in ('locked', 'available', 'in_progress', 'completed', 'skipped')
  ),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  -- Composite unique key to serve as target for Composite Foreign Key
  constraint uq_learning_path_items_path_id unique (learning_path_id, id),

  -- COMPOSITE FOREIGN KEY: Mathematically guarantees parent and child belong to the EXACT SAME learning_path_id
  constraint fk_learning_path_items_parent 
    foreign key (learning_path_id, parent_id) 
    references public.learning_path_items(learning_path_id, id) 
    on delete cascade,

  -- Structural constraint: Milestones MUST have parent_id null; Non-milestones MUST have parent_id not null
  constraint chk_milestone_parent_null 
    check (
      (item_type = 'milestone' and parent_id is null) or 
      (item_type <> 'milestone' and parent_id is not null)
    )
);

create index if not exists idx_learning_path_items_path_parent 
  on public.learning_path_items(learning_path_id, parent_id, position);

drop trigger if exists set_learning_path_items_updated_at on public.learning_path_items;
create trigger set_learning_path_items_updated_at
  before update on public.learning_path_items
  for each row
  execute function public.handle_updated_at();

-- ==============================================================================
-- 4. Tree Hierarchy Validation Trigger
-- ==============================================================================

create or replace function public.validate_learning_path_item_hierarchy()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
declare
  v_parent_type text;
begin
  -- Prevent direct self-reference
  if new.parent_id is not null and new.parent_id = new.id then
    raise exception 'Hạng mục không thể tự làm cha của chính mình.';
  end if;

  -- Validate Milestone
  if new.item_type = 'milestone' then
    if new.parent_id is not null then
      raise exception 'Milestone cấp cao nhất không được phép có parent_id.';
    end if;
    return new;
  end if;

  -- Validate Non-Milestone parent type
  select item_type into v_parent_type
  from public.learning_path_items
  where id = new.parent_id and learning_path_id = new.learning_path_id;

  if v_parent_type is null then
    raise exception 'Không tìm thấy hạng mục cha trong cùng lộ trình học.';
  end if;

  if new.item_type = 'module' and v_parent_type <> 'milestone' then
    raise exception 'Hạng mục Module bắt buộc phải có cha là Milestone (nhận được: %)', v_parent_type;
  end if;

  if new.item_type = 'topic' and v_parent_type <> 'module' then
    raise exception 'Hạng mục Topic bắt buộc phải có cha là Module (nhận được: %)', v_parent_type;
  end if;

  return new;
end;
$$;

drop trigger if exists check_learning_path_item_hierarchy on public.learning_path_items;
create trigger check_learning_path_item_hierarchy
  before insert or update on public.learning_path_items
  for each row
  execute function public.validate_learning_path_item_hierarchy();

-- ==============================================================================
-- 5. Atomic State Transition & Customization Database Functions (RPC)
-- ==============================================================================

-- RPC 1: Atomically activate a proposed learning path, archiving any currently active path
create or replace function public.activate_learning_path(
  p_path_id uuid,
  p_user_id uuid default null
)
returns jsonb
language plpgsql
security definer set search_path = ''
as $$
declare
  v_caller_id uuid;
  v_path record;
  v_first_milestone_id uuid;
  v_first_module_id uuid;
begin
  -- Resolve caller identity safely
  if p_user_id is not null and public.is_admin_or_service_role() then
    v_caller_id := p_user_id;
  else
    v_caller_id := auth.uid();
  end if;

  if v_caller_id is null then
    raise exception 'Unauthorized: Yêu cầu xác thực danh tính.';
  end if;

  -- Serialize concurrent activations for the caller to prevent race conditions
  perform 1
  from public.learning_paths
  where user_id = v_caller_id
  for update;

  -- Verify target path ownership
  select * into v_path
  from public.learning_paths
  where id = p_path_id and user_id = v_caller_id
  for update;

  if not found then
    raise exception 'Không tìm thấy lộ trình học hoặc bạn không có quyền truy cập.';
  end if;

  -- Reject reactivation of terminal states
  if v_path.status in ('completed', 'rejected', 'archived') then
    raise exception 'Không thể kích hoạt lại lộ trình ở trạng thái kết thúc (%): thao tác bị từ chối.', v_path.status;
  end if;

  if v_path.status = 'active' then
    -- Idempotent return if already active
    return jsonb_build_object('success', true, 'path_id', p_path_id, 'status', 'active', 'message', 'Lộ trình đã ở trạng thái kích hoạt.');
  end if;

  if v_path.status <> 'proposed' and v_path.status <> 'paused' then
    raise exception 'Chỉ có thể kích hoạt lộ trình đang ở trạng thái proposed hoặc paused (hiện tại: %)', v_path.status;
  end if;

  -- 1. Archive any existing active path for this user
  update public.learning_paths
  set status = 'archived',
      updated_at = now()
  where user_id = v_caller_id 
    and status = 'active'
    and id <> p_path_id;

  -- 2. Activate the target path
  update public.learning_paths
  set status = 'active',
      updated_at = now()
  where id = p_path_id and user_id = v_caller_id;

  -- 3. Progressively unlock Milestone 1, its first Module, and its first Topic
  -- 3a. Find and unlock Milestone 1
  select id into v_first_milestone_id
  from public.learning_path_items
  where learning_path_id = p_path_id
    and parent_id is null
    and item_type = 'milestone'
    and position = 1;

  if v_first_milestone_id is not null then
    update public.learning_path_items
    set status = 'available',
        updated_at = now()
    where id = v_first_milestone_id
      and status = 'locked';

    -- 3b. Find and unlock Module 1 under Milestone 1
    select id into v_first_module_id
    from public.learning_path_items
    where learning_path_id = p_path_id
      and parent_id = v_first_milestone_id
      and item_type = 'module'
      and position = 1;

    if v_first_module_id is not null then
      update public.learning_path_items
      set status = 'available',
          updated_at = now()
      where id = v_first_module_id
        and status = 'locked';

      -- 3c. Unlock Topic 1 under Module 1
      update public.learning_path_items
      set status = 'available',
          updated_at = now()
      where learning_path_id = p_path_id
        and parent_id = v_first_module_id
        and item_type = 'topic'
        and position = 1
        and status = 'locked';
    end if;
  end if;

  return jsonb_build_object('success', true, 'path_id', p_path_id, 'status', 'active');
exception
  when unique_violation then
    raise exception 'Xung đột kích hoạt: Người dùng đã có một lộ trình học đang hoạt động.';
end;
$$;

-- Drop any previous signature of save_learning_path_customization
drop function if exists public.save_learning_path_customization(uuid, integer, text, text, jsonb, uuid);
drop function if exists public.save_learning_path_customization(uuid, integer, text, uuid[], text, uuid);

-- RPC 2: Atomically customize path structure, persist item positions, enforce optimistic versioning & write immutable snapshot
create or replace function public.save_learning_path_customization(
  p_path_id uuid,
  p_expected_version integer,
  p_change_reason text,
  p_reordered_item_ids uuid[],
  p_created_by text default 'user',
  p_user_id uuid default null
)
returns jsonb
language plpgsql
security definer set search_path = ''
as $$
declare
  v_caller_id uuid;
  v_path record;
  v_new_version integer;
  v_distinct_count integer;
  v_found_count integer;
  v_target_parent_id uuid;
  v_target_type text;
  v_total_sibling_count integer;
  v_idx integer;
  v_snapshot jsonb;
  v_creator text;
begin
  -- 1. Resolve caller identity safely
  if p_user_id is not null and public.is_admin_or_service_role() then
    v_caller_id := p_user_id;
  else
    v_caller_id := auth.uid();
  end if;

  if v_caller_id is null then
    raise exception 'Unauthorized: Yêu cầu xác thực danh tính.';
  end if;

  -- 2. Prevent ordinary users from forging system/ai creator metadata
  if public.is_admin_or_service_role() then
    v_creator := coalesce(p_created_by, 'system');
  else
    v_creator := 'user';
  end if;

  -- 3. Lock path row FOR UPDATE and verify ownership
  select * into v_path
  from public.learning_paths
  where id = p_path_id and user_id = v_caller_id
  for update;

  if not found then
    raise exception 'Không tìm thấy lộ trình học hoặc bạn không có quyền truy cập.';
  end if;

  -- Terminal state protection: Completed, rejected or archived paths cannot be structurally altered
  if v_path.status in ('completed', 'rejected', 'archived') then
    raise exception 'Không thể chỉnh sửa cấu trúc của lộ trình đã kết thúc hoặc lưu trữ (hiện tại: %).', v_path.status;
  end if;

  -- 4. Optimistic concurrency check
  if v_path.current_version <> p_expected_version then
    raise exception 'Xung đột phiên bản: Lộ trình đã được cập nhật từ một phiên làm việc khác (hiện tại: v%, gửi lên: v%). Vui lòng tải lại trang.', 
      v_path.current_version, p_expected_version;
  end if;

  -- 5. Validate input array: non-empty check
  if p_reordered_item_ids is null or array_length(p_reordered_item_ids, 1) is null or array_length(p_reordered_item_ids, 1) < 1 then
    raise exception 'Danh sách hạng mục tùy chỉnh không được để trống.';
  end if;

  -- 6. Reject duplicate item IDs in p_reordered_item_ids
  select count(distinct id) into v_distinct_count
  from unnest(p_reordered_item_ids) as u(id);

  if v_distinct_count <> array_length(p_reordered_item_ids, 1) then
    raise exception 'Danh sách hạng mục tùy chỉnh chứa ID bị trùng lặp.';
  end if;

  -- 7. Validate single sibling-group contract & anti-cross-parent tampering
  -- Fetch target parent_id and item_type from the first item
  select parent_id, item_type into v_target_parent_id, v_target_type
  from public.learning_path_items
  where learning_path_id = p_path_id
    and id = p_reordered_item_ids[1];

  if not found then
    raise exception 'Phát hiện hạng mục không hợp lệ hoặc không thuộc lộ trình này: %', p_reordered_item_ids[1];
  end if;

  -- Ensure all reordered items belong to this path, have the exact same parent_id and same item_type
  select count(*) into v_found_count
  from public.learning_path_items
  where learning_path_id = p_path_id
    and id = any(p_reordered_item_ids)
    and parent_id is not distinct from v_target_parent_id
    and item_type = v_target_type;

  if v_found_count <> array_length(p_reordered_item_ids, 1) then
    raise exception 'Toàn bộ các hạng mục tùy chỉnh phải cùng thuộc lộ trình và cùng một nhóm cha (sibling group).';
  end if;

  -- 8. Completeness check: Ensure omitted items cannot accidentally retain conflicting or unexpected positions
  select count(*) into v_total_sibling_count
  from public.learning_path_items
  where learning_path_id = p_path_id
    and parent_id is not distinct from v_target_parent_id
    and item_type = v_target_type;

  if v_total_sibling_count <> array_length(p_reordered_item_ids, 1) then
    raise exception 'Danh sách tùy chỉnh phải bao gồm toàn bộ % hạng mục trong cùng nhóm cha (nhận được: %).', 
      v_total_sibling_count, array_length(p_reordered_item_ids, 1);
  end if;

  -- 9. Atomically update item positions for the sibling group
  for v_idx in 1 .. array_length(p_reordered_item_ids, 1) loop
    update public.learning_path_items
    set position = v_idx,
        updated_at = now()
    where id = p_reordered_item_ids[v_idx]
      and learning_path_id = p_path_id;
  end loop;

  v_new_version := v_path.current_version + 1;

  -- 10. Construct deterministic hierarchical snapshot directly from verified database items (Anti-forgery)
  select jsonb_build_object(
    'title', v_path.title,
    'description', v_path.description,
    'target_level', v_path.target_level,
    'total_estimated_minutes', v_path.total_estimated_minutes,
    'estimated_weeks', v_path.estimated_weeks,
    'version_number', v_new_version,
    'change_reason', coalesce(nullif(trim(p_change_reason), ''), 'Người học tùy chỉnh cấu trúc lộ trình'),
    'created_by', v_creator,
    'generated_at', now(),
    'milestones', coalesce(
      (
        select jsonb_agg(
          jsonb_build_object(
            'id', m.id,
            'title', m.title,
            'description', m.description,
            'position', m.position,
            'status', m.status,
            'content_status', m.content_status,
            'modules', coalesce(
              (
                select jsonb_agg(
                  jsonb_build_object(
                    'id', mod.id,
                    'title', mod.title,
                    'description', mod.description,
                    'skill', mod.skill,
                    'position', mod.position,
                    'status', mod.status,
                    'content_status', mod.content_status,
                    'topics', coalesce(
                      (
                        select jsonb_agg(
                          jsonb_build_object(
                            'id', t.id,
                            'title', t.title,
                            'description', t.description,
                            'skill', t.skill,
                            'target_level', t.target_level,
                            'position', t.position,
                            'estimated_minutes', t.estimated_minutes,
                            'content_status', t.content_status,
                            'status', t.status
                          ) order by t.position asc
                        )
                        from public.learning_path_items t
                        where t.learning_path_id = p_path_id
                          and t.parent_id = mod.id
                          and t.item_type = 'topic'
                      ), '[]'::jsonb
                    )
                  ) order by mod.position asc
                )
                from public.learning_path_items mod
                where mod.learning_path_id = p_path_id
                  and mod.parent_id = m.id
                  and mod.item_type = 'module'
              ), '[]'::jsonb
            )
          ) order by m.position asc
        )
        from public.learning_path_items m
        where m.learning_path_id = p_path_id
          and m.parent_id is null
          and m.item_type = 'milestone'
      ), '[]'::jsonb
    )
  ) into v_snapshot;

  -- 11. Insert immutable snapshot into learning_path_versions
  insert into public.learning_path_versions (
    learning_path_id,
    version_number,
    change_reason,
    created_by,
    snapshot
  ) values (
    p_path_id,
    v_new_version,
    coalesce(nullif(trim(p_change_reason), ''), 'Người học tùy chỉnh cấu trúc lộ trình'),
    v_creator,
    v_snapshot
  );

  -- 12. Increment path version and flag as user modified
  update public.learning_paths
  set current_version = v_new_version,
      is_user_modified = (is_user_modified or v_creator = 'user'),
      updated_at = now()
  where id = p_path_id and user_id = v_caller_id;

  return jsonb_build_object(
    'success', true, 
    'path_id', p_path_id, 
    'new_version', v_new_version
  );
end;
$$;

-- ==============================================================================
-- 6. Row Level Security (RLS) Configuration (Least Privilege)
-- ==============================================================================

alter table public.learning_paths enable row level security;
alter table public.learning_path_versions enable row level security;
alter table public.learning_path_items enable row level security;

-- Force RLS on all 3 tables
alter table public.learning_paths force row level security;
alter table public.learning_path_versions force row level security;
alter table public.learning_path_items force row level security;

-- Policies for public.learning_paths
drop policy if exists "Users can read own learning paths" on public.learning_paths;
create policy "Users can read own learning paths"
  on public.learning_paths for select
  using (auth.uid() = user_id);

-- Policies for public.learning_path_versions
drop policy if exists "Users can read own learning path versions" on public.learning_path_versions;
create policy "Users can read own learning path versions"
  on public.learning_path_versions for select
  using (
    exists (
      select 1 from public.learning_paths p
      where p.id = learning_path_versions.learning_path_id and p.user_id = auth.uid()
    )
  );

-- Policies for public.learning_path_items
drop policy if exists "Users can read own learning path items" on public.learning_path_items;
create policy "Users can read own learning path items"
  on public.learning_path_items for select
  using (
    exists (
      select 1 from public.learning_paths p
      where p.id = learning_path_items.learning_path_id and p.user_id = auth.uid()
    )
  );

-- ==============================================================================
-- 7. Explicit Permissions (Grants & Revokes)
-- ==============================================================================

-- Revoke all table-level access from public and anon
revoke all on table public.learning_paths from public, anon;
revoke all on table public.learning_path_versions from public, anon;
revoke all on table public.learning_path_items from public, anon;

-- Revoke direct mutation rights from authenticated role (Anti-Bypass)
revoke insert, update, delete on table public.learning_paths from authenticated;
revoke insert, update, delete on table public.learning_path_versions from authenticated;
revoke insert, update, delete on table public.learning_path_items from authenticated;

-- Role authenticated can ONLY SELECT own records via RLS
grant select on table public.learning_paths to authenticated;
grant select on table public.learning_path_versions to authenticated;
grant select on table public.learning_path_items to authenticated;

-- Service role has full permissions for server-side evaluation & RPC logic
grant all on table public.learning_paths to service_role;
grant all on table public.learning_path_versions to service_role;
grant all on table public.learning_path_items to service_role;

-- Revoke EXECUTE from public and anon on Phase 3 functions
revoke execute on function public.validate_learning_path_item_hierarchy() from public, anon;
revoke execute on function public.activate_learning_path(uuid, uuid) from public, anon;
revoke execute on function public.save_learning_path_customization(uuid, integer, text, uuid[], text, uuid) from public, anon;

-- Grant EXECUTE on controlled RPC functions to authenticated and service_role
grant execute on function public.activate_learning_path(uuid, uuid) to authenticated, service_role;
grant execute on function public.save_learning_path_customization(uuid, integer, text, uuid[], text, uuid) to authenticated, service_role;
