-- ==============================================================================
-- Migration: Phase 4 — Daily Plan, Content Delivery & Practice Engine
-- Version: 20261016_phase_4_daily_plan_practice
-- Description:
--   1. Creates `public.content_items` for curated lessons and foundational study content.
--   2. Creates `public.practice_exercises` for interactive practice questions.
--   3. Creates `public.practice_exercise_answers` (SERVER-ONLY private answer key).
--   4. Creates `public.daily_plans` and `public.daily_plan_tasks` for daily learning plans.
--   5. Creates `public.practice_submissions` for persisted activity results.
--   6. Creates `public.learning_events` and `public.learning_evidence` for audit trail & telemetry.
--   7. Seeds real, validated foundational curriculum for Daily Routine (Vocab) and Present Simple (Grammar).
--   8. Enforces strict Least Privilege RLS: authenticated can SELECT own records; answers remain confidential.
-- ==============================================================================

-- 1. Table: public.content_items
create table if not exists public.content_items (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text,
  content_type text not null check (
    content_type in ('lesson', 'grammar', 'vocabulary_set', 'reading', 'listening', 'practice')
  ),
  skill text not null check (
    skill in ('vocabulary', 'grammar', 'reading', 'listening', 'speaking', 'writing', 'toeic')
  ),
  level text not null check (
    level in ('pre_a1', 'a1', 'a2', 'b1', 'b2', 'c1', 'c2')
  ),
  estimated_minutes integer not null default 15 check (estimated_minutes > 0),
  body jsonb not null default '{}'::jsonb,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_content_items_skill_level 
  on public.content_items(skill, level, is_published);

drop trigger if exists set_content_items_updated_at on public.content_items;
create trigger set_content_items_updated_at
  before update on public.content_items
  for each row
  execute function public.handle_updated_at();

-- 2. Table: public.practice_exercises
create table if not exists public.practice_exercises (
  id uuid primary key default gen_random_uuid(),
  content_item_id uuid not null references public.content_items(id) on delete cascade,
  exercise_type text not null check (
    exercise_type in ('multiple_choice', 'fill_blank')
  ),
  prompt text not null,
  context_text text,
  options jsonb not null default '[]'::jsonb,
  position integer not null check (position >= 1),
  weight numeric(4,2) not null default 1.0 check (weight > 0),
  created_at timestamptz not null default now(),
  constraint uq_practice_exercises_position unique (content_item_id, position)
);

create index if not exists idx_practice_exercises_content 
  on public.practice_exercises(content_item_id, position);

-- 3. Table: public.practice_exercise_answers (SERVER-ONLY CONFIDENTIAL TABLE)
create table if not exists public.practice_exercise_answers (
  exercise_id uuid primary key references public.practice_exercises(id) on delete cascade,
  correct_option_id text not null,
  explanation text not null,
  created_at timestamptz not null default now()
);

-- 4. Table: public.daily_plans
create table if not exists public.daily_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  learning_path_id uuid references public.learning_paths(id) on delete set null,
  plan_date date not null,
  target_minutes integer not null default 30 check (target_minutes > 0),
  completed_minutes integer not null default 0 check (completed_minutes >= 0),
  status text not null default 'planned' check (
    status in ('planned', 'in_progress', 'completed', 'partially_completed', 'skipped')
  ),
  generation_reason jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint uq_user_daily_plan_date unique (user_id, plan_date)
);

create index if not exists idx_daily_plans_user_date 
  on public.daily_plans(user_id, plan_date desc);

drop trigger if exists set_daily_plans_updated_at on public.daily_plans;
create trigger set_daily_plans_updated_at
  before update on public.daily_plans
  for each row
  execute function public.handle_updated_at();

-- 5. Table: public.daily_plan_tasks
create table if not exists public.daily_plan_tasks (
  id uuid primary key default gen_random_uuid(),
  daily_plan_id uuid not null references public.daily_plans(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  learning_path_item_id uuid references public.learning_path_items(id) on delete set null,
  content_item_id uuid references public.content_items(id) on delete set null,
  title text not null,
  description text,
  activity_type text not null check (
    activity_type in ('lesson', 'practice', 'review', 'assessment')
  ),
  skill text check (
    skill is null or skill in ('vocabulary', 'grammar', 'reading', 'listening', 'speaking', 'writing', 'toeic')
  ),
  position integer not null check (position >= 1),
  estimated_minutes integer not null default 15 check (estimated_minutes > 0),
  content_status text not null default 'planned_curriculum' check (
    content_status in ('available', 'planned_curriculum')
  ),
  status text not null default 'pending' check (
    status in ('pending', 'in_progress', 'completed', 'skipped')
  ),
  score numeric(5,2),
  accuracy numeric(5,4),
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_daily_plan_tasks_plan_pos 
  on public.daily_plan_tasks(daily_plan_id, position);

create index if not exists idx_daily_plan_tasks_user_status 
  on public.daily_plan_tasks(user_id, status);

drop trigger if exists set_daily_plan_tasks_updated_at on public.daily_plan_tasks;
create trigger set_daily_plan_tasks_updated_at
  before update on public.daily_plan_tasks
  for each row
  execute function public.handle_updated_at();

-- 6. Table: public.practice_submissions
create table if not exists public.practice_submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  daily_plan_task_id uuid references public.daily_plan_tasks(id) on delete set null,
  content_item_id uuid not null references public.content_items(id) on delete cascade,
  answers jsonb not null default '[]'::jsonb,
  score numeric(5,2) not null,
  max_score numeric(5,2) not null,
  accuracy numeric(5,4) not null,
  feedback jsonb not null default '{}'::jsonb,
  duration_seconds integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists idx_practice_submissions_user 
  on public.practice_submissions(user_id, created_at desc);

create index if not exists idx_practice_submissions_content 
  on public.practice_submissions(content_item_id);

-- 7. Table: public.learning_events (Telemetry & Audit)
create table if not exists public.learning_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  event_type text not null check (
    event_type in ('plan_generated', 'task_started', 'task_completed', 'task_skipped', 'task_reordered', 'practice_submitted', 'lesson_viewed')
  ),
  entity_type text not null check (
    entity_type in ('daily_plan', 'daily_plan_task', 'content_item', 'practice_submission')
  ),
  entity_id uuid not null,
  payload jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now()
);

create index if not exists idx_learning_events_user_type 
  on public.learning_events(user_id, event_type, occurred_at desc);

-- 8. Table: public.learning_evidence
create table if not exists public.learning_evidence (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  skill text not null check (
    skill in ('vocabulary', 'grammar', 'reading', 'listening', 'speaking', 'writing', 'toeic')
  ),
  source_type text not null check (
    source_type in ('placement_assessment', 'practice_exercise', 'lesson_quiz', 'review')
  ),
  source_id uuid not null,
  score numeric(6,2) not null,
  max_score numeric(6,2) not null,
  accuracy numeric(5,4) not null,
  duration_seconds integer not null default 0,
  evidence jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_learning_evidence_user_skill 
  on public.learning_evidence(user_id, skill, created_at desc);

-- ==============================================================================
-- 9. Row Level Security (RLS) Configuration
-- ==============================================================================

alter table public.content_items enable row level security;
alter table public.practice_exercises enable row level security;
alter table public.practice_exercise_answers enable row level security;
alter table public.daily_plans enable row level security;
alter table public.daily_plan_tasks enable row level security;
alter table public.practice_submissions enable row level security;
alter table public.learning_events enable row level security;
alter table public.learning_evidence enable row level security;

alter table public.content_items force row level security;
alter table public.practice_exercises force row level security;
alter table public.practice_exercise_answers force row level security;
alter table public.daily_plans force row level security;
alter table public.daily_plan_tasks force row level security;
alter table public.practice_submissions force row level security;
alter table public.learning_events force row level security;
alter table public.learning_evidence force row level security;

-- Policies for public.content_items (Published content is readable by all authenticated users)
drop policy if exists "Published content items are readable by authenticated" on public.content_items;
create policy "Published content items are readable by authenticated"
  on public.content_items for select
  using (is_published = true);

-- Policies for public.practice_exercises (Readable by authenticated users)
drop policy if exists "Practice exercises are readable by authenticated" on public.practice_exercises;
create policy "Practice exercises are readable by authenticated"
  on public.practice_exercises for select
  using (
    exists (
      select 1 from public.content_items c
      where c.id = practice_exercises.content_item_id and c.is_published = true
    )
  );

-- Policies for public.practice_exercise_answers: NO SELECT POLICY for authenticated/anon!
-- Client cannot read answers directly. Only service_role has access.

-- Policies for public.daily_plans
drop policy if exists "Users can read own daily plans" on public.daily_plans;
create policy "Users can read own daily plans"
  on public.daily_plans for select
  using (auth.uid() = user_id);

-- Policies for public.daily_plan_tasks
drop policy if exists "Users can read own daily plan tasks" on public.daily_plan_tasks;
create policy "Users can read own daily plan tasks"
  on public.daily_plan_tasks for select
  using (auth.uid() = user_id);

-- Policies for public.practice_submissions
drop policy if exists "Users can read own practice submissions" on public.practice_submissions;
create policy "Users can read own practice submissions"
  on public.practice_submissions for select
  using (auth.uid() = user_id);

-- Policies for public.learning_events
drop policy if exists "Users can read own learning events" on public.learning_events;
create policy "Users can read own learning events"
  on public.learning_events for select
  using (auth.uid() = user_id);

-- Policies for public.learning_evidence
drop policy if exists "Users can read own learning evidence" on public.learning_evidence;
create policy "Users can read own learning evidence"
  on public.learning_evidence for select
  using (auth.uid() = user_id);

-- ==============================================================================
-- 10. Explicit Permissions (Grants & Revokes)
-- ==============================================================================

-- Revoke all table-level access from public and anon
revoke all on table public.content_items from public, anon;
revoke all on table public.practice_exercises from public, anon;
revoke all on table public.practice_exercise_answers from public, anon;
revoke all on table public.daily_plans from public, anon;
revoke all on table public.daily_plan_tasks from public, anon;
revoke all on table public.practice_submissions from public, anon;
revoke all on table public.learning_events from public, anon;
revoke all on table public.learning_evidence from public, anon;

-- Revoke direct mutation rights from authenticated role (Anti-Bypass)
revoke insert, update, delete on table public.content_items from authenticated;
revoke insert, update, delete on table public.practice_exercises from authenticated;
revoke all on table public.practice_exercise_answers from authenticated;
revoke insert, update, delete on table public.daily_plans from authenticated;
revoke insert, update, delete on table public.daily_plan_tasks from authenticated;
revoke insert, update, delete on table public.practice_submissions from authenticated;
revoke insert, update, delete on table public.learning_events from authenticated;
revoke insert, update, delete on table public.learning_evidence from authenticated;

-- Role authenticated can ONLY SELECT own records via RLS
grant select on table public.content_items to authenticated;
grant select on table public.practice_exercises to authenticated;
grant select on table public.daily_plans to authenticated;
grant select on table public.daily_plan_tasks to authenticated;
grant select on table public.practice_submissions to authenticated;
grant select on table public.learning_events to authenticated;
grant select on table public.learning_evidence to authenticated;

-- Service role has full permissions for server-side evaluation & RPC logic
grant all on table public.content_items to service_role;
grant all on table public.practice_exercises to service_role;
grant all on table public.practice_exercise_answers to service_role;
grant all on table public.daily_plans to service_role;
grant all on table public.daily_plan_tasks to service_role;
grant all on table public.practice_submissions to service_role;
grant all on table public.learning_events to service_role;
grant all on table public.learning_evidence to service_role;

-- ==============================================================================
-- 11. Seed Real Curated Foundational Content for Phase 4
-- ==============================================================================

-- Content 1: Vocabulary — Sinh hoạt hàng ngày (Daily Routine)
insert into public.content_items (
  id,
  slug,
  title,
  description,
  content_type,
  skill,
  level,
  estimated_minutes,
  body,
  is_published
) values (
  '11111111-1111-4111-a111-000000000001'::uuid,
  'vocab-daily-routine',
  'Từ vựng sinh hoạt hàng ngày (Daily Routine)',
  'Học và thực hành 6 từ vựng cốt lõi về hoạt động sinh hoạt, thói quen và thời gian biểu mỗi ngày.',
  'vocabulary_set',
  'vocabulary',
  'a1',
  15,
  '{
    "overview": "Bài học cung cấp từ vựng nền tảng về sinh hoạt hàng ngày, giúp bạn miêu tả các hoạt động từ sáng đến tối một cách tự nhiên.",
    "words": [
      {
        "word": "wake up",
        "ipa": "/weɪk ʌp/",
        "part_of_speech": "phrasal verb",
        "meaning_vi": "thức giấc, mở mắt tỉnh dậy",
        "example": "I usually wake up at 6:00 AM every morning.",
        "note": "Phân biệt với \"get up\" (rời khỏi giường)."
      },
      {
        "word": "have breakfast",
        "ipa": "/hæv ˈbrekfəst/",
        "part_of_speech": "verb phrase",
        "meaning_vi": "ăn sáng",
        "example": "She has breakfast with her family before going to work.",
        "note": "Dùng have/eat breakfast, không dùng \"drink breakfast\"."
      },
      {
        "word": "commute",
        "ipa": "/kəˈmjuːt/",
        "part_of_speech": "verb / noun",
        "meaning_vi": "đi lại đều đặn giữa nhà và nơi làm việc",
        "example": "He commutes to the office by bus every weekday.",
        "note": "Danh từ: a 30-minute commute."
      },
      {
        "word": "prepare",
        "ipa": "/prɪˈpeər/",
        "part_of_speech": "verb",
        "meaning_vi": "chuẩn bị, sửa soạn",
        "example": "They prepare dinner together in the evening.",
        "note": "Cấu trúc: prepare for something hoặc prepare something."
      },
      {
        "word": "schedule",
        "ipa": "/ˈskedʒuːl/",
        "part_of_speech": "noun / verb",
        "meaning_vi": "lịch trình, thời gian biểu",
        "example": "I need to check my daily schedule for the meeting.",
        "note": "Cụm từ phổ biến: on schedule (đúng giờ), ahead of schedule (sớm hơn lịch)."
      },
      {
        "word": "relax",
        "ipa": "/rɪˈlæks/",
        "part_of_speech": "verb",
        "meaning_vi": "thư giãn, nghỉ ngơi",
        "example": "After a long working day, I relax by listening to music.",
        "note": "Tính từ miêu tả: relaxing (êm đềm), relaxed (cảm giác thư thái)."
      }
    ]
  }'::jsonb,
  true
) on conflict (slug) do update set
  title = excluded.title,
  description = excluded.description,
  body = excluded.body,
  updated_at = now();

-- Practice Exercises for Content 1 (Vocab)
-- Exercise 1
insert into public.practice_exercises (
  id, content_item_id, exercise_type, prompt, context_text, options, position, weight
) values (
  '11111111-2222-4111-a111-000000000001'::uuid,
  '11111111-1111-4111-a111-000000000001'::uuid,
  'multiple_choice',
  'Chọn từ phù hợp nhất để điền vào chỗ trống: "My alarm rings at 6:30 AM, but I usually ________ five minutes before that."',
  null,
  '[
    {"id": "opt_1a", "text": "wake up"},
    {"id": "opt_1b", "text": "commute"},
    {"id": "opt_1c", "text": "prepare"},
    {"id": "opt_1d", "text": "schedule"}
  ]'::jsonb,
  1,
  1.0
) on conflict (content_item_id, position) do update set prompt = excluded.prompt, options = excluded.options;

insert into public.practice_exercise_answers (exercise_id, correct_option_id, explanation) values (
  '11111111-2222-4111-a111-000000000001'::uuid,
  'opt_1a',
  '"wake up" có nghĩa là thức giấc, mở mắt tỉnh dậy khi chuông báo thức reo. Các đáp án khác (commute: đi lại làm việc, prepare: chuẩn bị, schedule: lịch trình) không phù hợp ngữ cảnh.'
) on conflict (exercise_id) do update set correct_option_id = excluded.correct_option_id, explanation = excluded.explanation;

-- Exercise 2
insert into public.practice_exercises (
  id, content_item_id, exercise_type, prompt, context_text, options, position, weight
) values (
  '11111111-2222-4111-a111-000000000002'::uuid,
  '11111111-1111-4111-a111-000000000001'::uuid,
  'multiple_choice',
  'Từ "commute" trong câu sau mang ý nghĩa gì? "It takes me 45 minutes to commute to downtown every morning."',
  'Đoạn ngữ cảnh: Cuộc sống hàng ngày của người đi làm tại đô thị lớn.',
  '[
    {"id": "opt_2a", "text": "Nấu ăn tại nhà"},
    {"id": "opt_2b", "text": "Di chuyển đi làm từ nhà đến chỗ làm"},
    {"id": "opt_2c", "text": "Tập thể dục buổi sáng"},
    {"id": "opt_2d", "text": "Đi ngủ sớm"}
  ]'::jsonb,
  2,
  1.0
) on conflict (content_item_id, position) do update set prompt = excluded.prompt, options = excluded.options;

insert into public.practice_exercise_answers (exercise_id, correct_option_id, explanation) values (
  '11111111-2222-4111-a111-000000000002'::uuid,
  'opt_2b',
  '"commute" là động từ chỉ việc đi lại đều đặn hàng ngày giữa nơi ở và nơi làm việc hoặc trường học.'
) on conflict (exercise_id) do update set correct_option_id = excluded.correct_option_id, explanation = excluded.explanation;

-- Exercise 3
insert into public.practice_exercises (
  id, content_item_id, exercise_type, prompt, context_text, options, position, weight
) values (
  '11111111-2222-4111-a111-000000000003'::uuid,
  '11111111-1111-4111-a111-000000000001'::uuid,
  'multiple_choice',
  'Chọn cụm từ chính xác: "It is important to ________ a healthy meal before taking an exam."',
  null,
  '[
    {"id": "opt_3a", "text": "have breakfast with"},
    {"id": "opt_3b", "text": "relax to"},
    {"id": "opt_3c", "text": "prepare"},
    {"id": "opt_3d", "text": "wake"}
  ]'::jsonb,
  3,
  1.0
) on conflict (content_item_id, position) do update set prompt = excluded.prompt, options = excluded.options;

insert into public.practice_exercise_answers (exercise_id, correct_option_id, explanation) values (
  '11111111-2222-4111-a111-000000000003'::uuid,
  'opt_3c',
  '"prepare a healthy meal" có nghĩa là chuẩn bị / nấu một bữa ăn bổ dưỡng. Cấu trúc "prepare + noun" rất phổ biến trong sinh hoạt.'
) on conflict (exercise_id) do update set correct_option_id = excluded.correct_option_id, explanation = excluded.explanation;

-- Exercise 4
insert into public.practice_exercises (
  id, content_item_id, exercise_type, prompt, context_text, options, position, weight
) values (
  '11111111-2222-4111-a111-000000000004'::uuid,
  '11111111-1111-4111-a111-000000000001'::uuid,
  'multiple_choice',
  'Điền từ vào chỗ trống: "The train arrived right on ________, exactly at 8:00 AM."',
  null,
  '[
    {"id": "opt_4a", "text": "schedule"},
    {"id": "opt_4b", "text": "relax"},
    {"id": "opt_4c", "text": "routine"},
    {"id": "opt_4d", "text": "commute"}
  ]'::jsonb,
  4,
  1.0
) on conflict (content_item_id, position) do update set prompt = excluded.prompt, options = excluded.options;

insert into public.practice_exercise_answers (exercise_id, correct_option_id, explanation) values (
  '11111111-2222-4111-a111-000000000004'::uuid,
  'opt_4a',
  'Thành ngữ "on schedule" có nghĩa là đúng tiến độ, đúng lịch trình đã định sẵn.'
) on conflict (exercise_id) do update set correct_option_id = excluded.correct_option_id, explanation = excluded.explanation;

-- Exercise 5
insert into public.practice_exercises (
  id, content_item_id, exercise_type, prompt, context_text, options, position, weight
) values (
  '11111111-2222-4111-a111-000000000005'::uuid,
  '11111111-1111-4111-a111-000000000001'::uuid,
  'multiple_choice',
  'Chọn phương án đúng nhất: "On Sunday afternoons, Sarah likes to ________ on the sofa with a warm cup of tea."',
  null,
  '[
    {"id": "opt_5a", "text": "commute"},
    {"id": "opt_5b", "text": "schedule"},
    {"id": "opt_5c", "text": "relax"},
    {"id": "opt_5d", "text": "prepare"}
  ]'::jsonb,
  5,
  1.0
) on conflict (content_item_id, position) do update set prompt = excluded.prompt, options = excluded.options;

insert into public.practice_exercise_answers (exercise_id, correct_option_id, explanation) values (
  '11111111-2222-4111-a111-000000000005'::uuid,
  'opt_5c',
  '"relax" nghĩa là nghỉ ngơi, thư thái. Ngữ cảnh "ngồi sofa uống trà chiều Chủ nhật" diễn tả sự thư giãn trọn vẹn.'
) on conflict (exercise_id) do update set correct_option_id = excluded.correct_option_id, explanation = excluded.explanation;


-- Content 2: Grammar — Hiện tại đơn (Present Simple)
insert into public.content_items (
  id,
  slug,
  title,
  description,
  content_type,
  skill,
  level,
  estimated_minutes,
  body,
  is_published
) values (
  '11111111-1111-4111-a111-000000000002'::uuid,
  'grammar-present-simple',
  'Ngữ pháp: Thì Hiện tại đơn (Present Simple)',
  'Quy tắc chia động từ, câu phủ định, nghi vấn và các trạng từ tần suất chỉ thói quen trong thì Hiện tại đơn.',
  'grammar',
  'grammar',
  'a1',
  15,
  '{
    "overview": "Thì Hiện tại đơn dùng để diễn đạt thói quen hàng ngày, sự thật hiển nhiên hoặc chân lý.",
    "rules": [
      {
        "name": "Khẳng định (Affirmative)",
        "formula": "S + V(s/es) + O",
        "explanation": "Chủ ngữ số nhiều (I/You/We/They): động từ giữ nguyên. Chủ ngữ số ít (He/She/It): thêm -s hoặc -es vào động từ.",
        "examples": [
          "I play tennis every weekend.",
          "She works at an international school."
        ]
      },
      {
        "name": "Phủ định (Negative)",
        "formula": "S + do/does not + V(nguyên thể)",
        "explanation": "Dùng don''t cho I/You/We/They; dùng doesn''t cho He/She/It. Động từ chính quay về dạng nguyên thể không chia.",
        "examples": [
          "They do not (don''t) live in London.",
          "He does not (doesn''t) drink coffee."
        ]
      },
      {
        "name": "Nghi vấn (Question)",
        "formula": "Do/Does + S + V(nguyên thể)?",
        "explanation": "Đảo trợ động từ Do/Does lên đầu câu hỏi Yes/No.",
        "examples": [
          "Do you speak English?",
          "Does she wake up early?"
        ]
      },
      {
        "name": "Dấu hiệu nhận biết",
        "formula": "Trạng từ tần suất: always, usually, often, sometimes, rarely, never, every day/week",
        "explanation": "Trạng từ tần suất đứng trước động từ thường và đứng sau động từ to be.",
        "examples": [
          "He always arrives on time.",
          "She is usually busy on Mondays."
        ]
      }
    ]
  }'::jsonb,
  true
) on conflict (slug) do update set
  title = excluded.title,
  description = excluded.description,
  body = excluded.body,
  updated_at = now();

-- Practice Exercises for Content 2 (Grammar)
-- Exercise 1
insert into public.practice_exercises (
  id, content_item_id, exercise_type, prompt, context_text, options, position, weight
) values (
  '11111111-2222-4111-a111-000000000006'::uuid,
  '11111111-1111-4111-a111-000000000002'::uuid,
  'multiple_choice',
  'Chọn dạng đúng của động từ: "My sister ________ to the office by bus every morning."',
  null,
  '[
    {"id": "opt_6a", "text": "go"},
    {"id": "opt_6b", "text": "goes"},
    {"id": "opt_6c", "text": "going"},
    {"id": "opt_6d", "text": "went"}
  ]'::jsonb,
  1,
  1.0
) on conflict (content_item_id, position) do update set prompt = excluded.prompt, options = excluded.options;

insert into public.practice_exercise_answers (exercise_id, correct_option_id, explanation) values (
  '11111111-2222-4111-a111-000000000006'::uuid,
  'opt_6b',
  'Chủ ngữ "My sister" là ngôi thứ ba số ít (she), động từ kết thúc bằng đuôi "-o" nên thêm "-es" thành "goes".'
) on conflict (exercise_id) do update set correct_option_id = excluded.correct_option_id, explanation = excluded.explanation;

-- Exercise 2
insert into public.practice_exercises (
  id, content_item_id, exercise_type, prompt, context_text, options, position, weight
) values (
  '11111111-2222-4111-a111-000000000007'::uuid,
  '11111111-1111-4111-a111-000000000002'::uuid,
  'multiple_choice',
  'Chọn câu phủ định chính xác: "He eats meat."',
  null,
  '[
    {"id": "opt_7a", "text": "He don''t eat meat."},
    {"id": "opt_7b", "text": "He doesn''t eats meat."},
    {"id": "opt_7c", "text": "He doesn''t eat meat."},
    {"id": "opt_7d", "text": "He isn''t eat meat."}
  ]'::jsonb,
  2,
  1.0
) on conflict (content_item_id, position) do update set prompt = excluded.prompt, options = excluded.options;

insert into public.practice_exercise_answers (exercise_id, correct_option_id, explanation) values (
  '11111111-2222-4111-a111-000000000007'::uuid,
  'opt_7c',
  'Trong câu phủ định ngôi thứ ba số ít, ta dùng trợ động từ "does not" (doesn''t) và động từ chính giữ nguyên thể "eat" (không thêm -s).'
) on conflict (exercise_id) do update set correct_option_id = excluded.correct_option_id, explanation = excluded.explanation;

-- Exercise 3
insert into public.practice_exercises (
  id, content_item_id, exercise_type, prompt, context_text, options, position, weight
) values (
  '11111111-2222-4111-a111-000000000008'::uuid,
  '11111111-1111-4111-a111-000000000002'::uuid,
  'multiple_choice',
  'Chọn phương án đúng để hoàn thành câu hỏi: "________ your parents live in Da Nang?"',
  null,
  '[
    {"id": "opt_8a", "text": "Do"},
    {"id": "opt_8b", "text": "Does"},
    {"id": "opt_8c", "text": "Are"},
    {"id": "opt_8d", "text": "Is"}
  ]'::jsonb,
  3,
  1.0
) on conflict (content_item_id, position) do update set prompt = excluded.prompt, options = excluded.options;

insert into public.practice_exercise_answers (exercise_id, correct_option_id, explanation) values (
  '11111111-2222-4111-a111-000000000008'::uuid,
  'opt_8a',
  '"your parents" là danh từ số nhiều (bố mẹ = they), nên trợ động từ trong câu hỏi Hiện tại đơn với động từ thường "live" là "Do".'
) on conflict (exercise_id) do update set correct_option_id = excluded.correct_option_id, explanation = excluded.explanation;

-- Exercise 4
insert into public.practice_exercises (
  id, content_item_id, exercise_type, prompt, context_text, options, position, weight
) values (
  '11111111-2222-4111-a111-000000000009'::uuid,
  '11111111-1111-4111-a111-000000000002'::uuid,
  'multiple_choice',
  'Chọn vị trí trạng từ chỉ tần suất đúng nhất trong câu:',
  null,
  '[
    {"id": "opt_9a", "text": "She always is late for class."},
    {"id": "opt_9b", "text": "She is always late for class."},
    {"id": "opt_9c", "text": "She is late always for class."},
    {"id": "opt_9d", "text": "Always she is late for class."}
  ]'::jsonb,
  4,
  1.0
) on conflict (content_item_id, position) do update set prompt = excluded.prompt, options = excluded.options;

insert into public.practice_exercise_answers (exercise_id, correct_option_id, explanation) values (
  '11111111-2222-4111-a111-000000000009'::uuid,
  'opt_9b',
  'Quy tắc vị trí trạng từ tần suất (always, usually...): đứng SAU động từ to be ("is always") và đứng TRƯỚC động từ thường.'
) on conflict (exercise_id) do update set correct_option_id = excluded.correct_option_id, explanation = excluded.explanation;

-- Exercise 5
insert into public.practice_exercises (
  id, content_item_id, exercise_type, prompt, context_text, options, position, weight
) values (
  '11111111-2222-4111-a111-000000000010'::uuid,
  '11111111-1111-4111-a111-000000000002'::uuid,
  'multiple_choice',
  'Hoàn chỉnh câu sau: "Water ________ at 100 degrees Celsius under standard atmospheric pressure."',
  null,
  '[
    {"id": "opt_10a", "text": "boil"},
    {"id": "opt_10b", "text": "boils"},
    {"id": "opt_10c", "text": "is boiling"},
    {"id": "opt_10d", "text": "boiled"}
  ]'::jsonb,
  5,
  1.0
) on conflict (content_item_id, position) do update set prompt = excluded.prompt, options = excluded.options;

insert into public.practice_exercise_answers (exercise_id, correct_option_id, explanation) values (
  '11111111-2222-4111-a111-000000000010'::uuid,
  'opt_10b',
  'Diễn tả sự thật khoa học / chân lý hiển nhiên dùng thì Hiện tại đơn. "Water" là danh từ không đếm được (ngôi thứ ba số ít), động từ thêm -s thành "boils".'
) on conflict (exercise_id) do update set correct_option_id = excluded.correct_option_id, explanation = excluded.explanation;
