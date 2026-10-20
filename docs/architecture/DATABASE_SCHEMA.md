# DATABASE_SCHEMA.md

> Database được quản lý bằng **Supabase Database**. PostgreSQL là công nghệ bên dưới Supabase; không cần dựng một PostgreSQL server riêng.

## 1. Nguyên tắc
- Dùng `auth.users` của Supabase Auth làm nguồn tài khoản; không lưu mật khẩu riêng.
- Mọi dữ liệu riêng tư phải có `user_id` và RLS.
- Tách nội dung dùng chung khỏi tiến độ cá nhân.
- Backend tính điểm, quyền, mastery và trạng thái; AI chỉ giải thích/đề xuất.
- Lưu lịch sử bằng attempts/events thay vì chỉ ghi đè kết quả mới nhất.
- Dùng `timestamptz`; không lưu secret trong database hoặc logs.

## 2. Bảng và vai trò

| Nhóm | Bảng | Vai trò |
|---|---|---|
| Tài khoản | `profiles`, `goals`, `learner_preferences` | Hồ sơ, mục tiêu, sở thích |
| Nội dung | `content_items`, `exercises` | Bài học và bài tập dùng chung |
| Đánh giá | `assessments`, `assessment_questions`, `assessment_attempts`, `assessment_answers`, `assessment_results` | Placement/lesson assessment |
| Learner model | `learner_skill_profiles`, `learner_knowledge_mastery` | Năng lực tổng quát và mastery từng kiến thức |
| Evidence | `learning_events`, `learning_evidence` | Nhật ký và bằng chứng học tập |
| Lộ trình | `learning_paths`, `learning_path_versions`, `learning_path_items` | Lộ trình có version |
| Kế hoạch ngày | `daily_plans`, `daily_plan_activities` | Kế hoạch và trạng thái hoạt động |
| Ôn tập | `vocabulary_items`, `user_vocabulary` | Từ vựng chung và lịch ôn cá nhân |
| AI | `ai_generations`, `ai_feedback`, `recommendations` | Theo dõi usage và đề xuất |
| TOEIC (sau MVP) | `toeic_test_forms`, `toeic_test_questions`, `toeic_attempts`, `toeic_answers` | Luyện từng Part và full test |

Quy ước chung: UUID primary key, `created_at default now()`, `updated_at` được cập nhật bởi trigger hoặc server; dùng `CHECK` cho các trạng thái quan trọng.

## 3. Định nghĩa bảng cốt lõi

### `profiles`
- `id uuid primary key references auth.users(id) on delete cascade`
- `display_name text`, `avatar_url text`
- `native_language text not null default 'vi'`
- `timezone text not null default 'Asia/Ho_Chi_Minh'`
- `estimated_level text` — `pre_a1`, `a1`, `a2`, `b1`, `b2`, `c1`, `c2`; chỉ là ước lượng, không phải chứng chỉ CEFR.
- `onboarding_completed_at timestamptz`
- `created_at timestamptz not null default now()`, `updated_at timestamptz not null default now()`

### `goals`
- `id uuid primary key default gen_random_uuid()`
- `user_id uuid not null references auth.users(id) on delete cascade`
- `goal_type text not null` — `foundation`, `daily_communication`, `toeic`, `work`, `study`, `travel`, `other`
- `title text not null`, `target_level text`
- `target_toeic_score integer check (target_toeic_score between 10 and 990)`
- `weekly_minutes integer check (weekly_minutes > 0)`
- `priority text not null default 'secondary' check (priority in ('primary','secondary'))`
- `status text not null default 'active' check (status in ('active','paused','completed','archived'))`
- `target_date date`, timestamps
- Tạo unique partial index để mỗi user chỉ có một goal `primary` có status `active`; đổi primary trong transaction.

### `learner_preferences`
`user_id uuid primary key references auth.users(id) on delete cascade`, `daily_minutes integer default 30 check (daily_minutes between 5 and 240)`, `preferred_learning_style text`, `preferred_study_days smallint[]`, `reminder_enabled boolean default false`, `difficulty_preference text default 'adaptive'`, `updated_at timestamptz`.

### `learner_skill_profiles`
- `id uuid primary key default gen_random_uuid()`
- `user_id uuid not null references auth.users(id) on delete cascade`
- `skill text not null check (skill in ('listening','speaking','reading','writing','grammar','vocabulary','toeic'))`
- `estimated_level text`, `ability_score numeric(5,4) check (ability_score between 0 and 1)`
- `confidence numeric(5,4) check (confidence between 0 and 1)`
- `evidence_count integer not null default 0`, `last_assessed_at timestamptz`, `updated_at timestamptz`
- `unique(user_id, skill)`

### `learner_knowledge_mastery`
`id`, `user_id`, `knowledge_type`, `knowledge_id`, `mastery_score numeric(5,4) default 0`, `confidence numeric(5,4) default 0`, `attempt_count`, `correct_count`, `last_practiced_at`, `next_review_at`, `updated_at`; unique (`user_id`, `knowledge_type`, `knowledge_id`). Vì `knowledge_id` có thể trỏ nhiều loại nội dung, cân nhắc bảng `knowledge_items` nếu cần foreign key nghiêm ngặt.

### `content_items`
- `id uuid primary key default gen_random_uuid()`
- `content_type text not null check (content_type in ('lesson','grammar','vocabulary_set','listening','reading','speaking','writing','toeic'))`
- `title text not null`, `description text`, `level text`, `topic text`
- `difficulty smallint check (difficulty between 1 and 5)`, `estimated_minutes integer`
- `body jsonb not null default '{}'::jsonb`
- `source_type text not null default 'curated' check (source_type in ('curated','ai_generated','licensed','user_created'))`
- `is_published boolean not null default false`, `created_by uuid references auth.users(id)`, timestamps

### `exercises`
`id`, `content_item_id uuid references content_items(id) on delete cascade`, `exercise_type text`, `prompt text not null`, `instructions text`, `difficulty smallint`, `answer_key jsonb`, `explanation text`, `metadata jsonb default '{}'`, `is_published boolean default false`, timestamps. **Không trả `answer_key` về client trước khi nộp bài**; tốt nhất đọc đáp án qua server hoặc tách bảng đáp án riêng.

### `assessments`
`id`, `title`, `assessment_type` (`placement`, `lesson`, `skill`, `toeic`), `target_skill`, `level_min`, `level_max`, `time_limit_seconds`, `scoring_config jsonb`, `is_adaptive boolean`, `is_published boolean`, timestamps.

### `assessment_questions`
`id uuid primary key default gen_random_uuid()`, `assessment_id references assessments(id) on delete cascade`, `skill` (`vocabulary`, `grammar`, `reading`, `listening`), `category text`, `difficulty smallint`, `level text`, `question_type text`, `prompt text not null`, `context_text text`, `audio_url text`, `options jsonb` (chỉ chứa id & text, không chứa đáp án), `position integer`, `weight numeric(4,2) default 1.0`, `created_at timestamptz`. Unique (`assessment_id`, `position`).

### `assessment_question_answers` (Server-Only Confidential Table)
`question_id uuid primary key references assessment_questions(id) on delete cascade`, `correct_option_id text not null`, `explanation text not null`, `created_at timestamptz`. Bật RLS và **tuyệt đối không cấp policy SELECT cho role authenticated/anon**. Chỉ `service_role` và backend scoring engine mới được phép truy xuất.

### `assessment_attempts`
`id`, `user_id`, `assessment_id`, `status` (`in_progress`, `submitted`, `scored`, `abandoned`), `started_at`, `submitted_at`, `duration_seconds`, `raw_score`, `max_score`, `result_summary jsonb`.

### `assessment_answers`
`id`, `attempt_id references assessment_attempts(id) on delete cascade`, `question_id references assessment_questions(id)`, `answer jsonb`, `is_correct boolean`, `score_awarded numeric`, `time_spent_seconds`, `created_at`; unique (`attempt_id`, `question_id`).

### `assessment_results`
`id`, `attempt_id unique references assessment_attempts(id) on delete cascade`, `overall_level`, `skill_scores jsonb`, `strengths jsonb`, `weaknesses jsonb`, `confidence numeric(5,4)`, `scoring_version text`, `created_at`.

### `learning_paths` (Phase 3 Implemented)
- `id uuid primary key default gen_random_uuid()`
- `user_id uuid not null references auth.users(id) on delete cascade`
- `goal_id uuid references goals(id) on delete set null`
- `title text not null`
- `description text`
- `target_level text not null check (target_level in ('pre_a1','a1','a2','b1','b2','c1','c2'))`
- `total_estimated_minutes integer not null default 0 check (total_estimated_minutes >= 0)`
- `estimated_weeks integer not null default 1 check (estimated_weeks >= 1)`
- `status text not null default 'proposed' check (status in ('proposed','active','paused','completed','rejected','archived'))`
- `is_user_modified boolean not null default false`
- `current_version integer not null default 1 check (current_version >= 1)`
- `created_at timestamptz not null default now()`, `updated_at timestamptz not null default now()`
- Unique Partial Index: `uq_user_single_active_path ON public.learning_paths(user_id) WHERE (status = 'active')` đảm bảo mỗi user chỉ có tối đa một lộ trình active tại một thời điểm.
- Quyền: `authenticated` chỉ có SELECT; mọi INSERT/UPDATE/DELETE đi qua Server Actions và RPC functions an toàn.

### `learning_path_versions` (Phase 3 Implemented)
- `id uuid primary key default gen_random_uuid()`
- `learning_path_id uuid not null references learning_paths(id) on delete cascade`
- `version_number integer not null check (version_number >= 1)`
- `change_reason text not null`
- `created_by text not null default 'system' check (created_by in ('user','system','ai'))`
- `snapshot jsonb not null`
- `created_at timestamptz not null default now()`
- Unique: `(learning_path_id, version_number)`.
- Bản ghi là append-only: Client/authenticated không được phép UPDATE hay DELETE snapshot đã tạo. Mọi tùy chỉnh tạo version mới; AI không được tự ý ghi đè.

### `learning_path_items` (Phase 3 Implemented)
- `id uuid primary key default gen_random_uuid()`
- `learning_path_id uuid not null references learning_paths(id) on delete cascade`
- `parent_id uuid`
- `item_type text not null check (item_type in ('milestone','module','topic'))`
- `title text not null`
- `description text`
- `skill text check (skill is null or skill in ('vocabulary','grammar','reading','listening','speaking','writing','toeic'))`
- `target_level text check (target_level is null or target_level in ('pre_a1','a1','a2','b1','b2','c1','c2'))`
- `position integer not null check (position >= 1)`
- `estimated_minutes integer not null default 0 check (estimated_minutes >= 0)`
- `content_status text not null default 'planned_curriculum' check (content_status in ('available','planned_curriculum'))`
- `status text not null default 'locked' check (status in ('locked','available','in_progress','completed','skipped'))`
- `created_at timestamptz not null default now()`, `updated_at timestamptz not null default now()`
- Composite Unique: `uq_learning_path_items_path_id (learning_path_id, id)`
- Composite FK Tree Integrity: `fk_learning_path_items_parent (learning_path_id, parent_id) REFERENCES public.learning_path_items(learning_path_id, id) ON DELETE CASCADE` ngăn chặn triệt để liên kết chéo giữa các learning paths khác nhau ở cấp độ database.
- Trigger `validate_learning_path_item_hierarchy()`: milestone có parent_id NULL; module có parent là milestone; topic có parent là module.
- Quyền: `authenticated` chỉ có SELECT qua RLS; thao tác ghi qua Server Actions/RPC.

### Database RPC Functions (Phase 3 Implemented)
- `activate_learning_path(p_path_id uuid, p_user_id uuid default null)`:
  - `SECURITY DEFINER SET search_path = ''`: Toàn bộ đối tượng database được định danh schema tường minh (`public.*`, `pg_catalog.*`, `auth.*`).
  - Serialization: Thực thi `PERFORM 1 FROM public.learning_paths WHERE user_id = v_caller_id FOR UPDATE` để serialize các yêu cầu kích hoạt đồng thời, triệt tiêu race condition.
  - Bắt lỗi xung đột: Xử lý ngoại lệ `unique_violation` từ partial unique index `uq_user_single_active_path` và trả về thông báo lỗi thân thiện, bảo mật.
  - Chặn trạng thái kết thúc (Terminal states): Cấm kích hoạt lại các lộ trình có trạng thái `completed`, `rejected`, hoặc `archived`.
  - Chuyển lộ trình active cũ của user thành `archived` và kích hoạt `p_path_id` thành `active` trong một transaction duy nhất.
  - Mở khóa tuần tự (Progressive Unlock): Milestone 1, Module 1 (thuộc Milestone 1), và Topic 1 (thuộc Module 1) đồng thời chuyển sang trạng thái `available`; các hạng mục kế tiếp giữ nguyên `locked`.
  - Quyền: `REVOKE EXECUTE FROM public, anon; GRANT EXECUTE TO authenticated, service_role`.
- `save_learning_path_customization(p_path_id uuid, p_expected_version integer, p_change_reason text, p_reordered_item_ids uuid[], p_created_by text default 'user', p_user_id uuid default null)`:
  - `SECURITY DEFINER SET search_path = ''`: Schema-qualified objects, triệt tiêu nguy cơ search-path hijacking.
  - Khóa dòng `learning_paths` bằng `FOR UPDATE`.
  - Kiểm tra xung đột phiên bản lạc quan (`current_version = p_expected_version`).
  - Hợp đồng nhóm đồng cấp (Single Sibling-Group Contract): Mảng `p_reordered_item_ids` đại diện cho một nhóm đồng cấp hoàn chỉnh (`parent_id` và `item_type` hoàn toàn đồng nhất).
  - Nghiêm cấm ID trùng lặp, cấm sắp xếp chéo nhánh cha (cross-parent reordering), cấm trộn lẫn các cấp phân cấp (cross-hierarchy).
  - Kiểm tra tính toàn vẹn (Completeness check): Số lượng phần tử gửi lên phải đúng bằng tổng số siblings thực tế trong nhóm cha đó, ngăn chặn việc bỏ sót hạng mục gây xung đột vị trí.
  - Cập nhật trường `position` tuần tự trong `learning_path_items`.
  - Tự động sinh `snapshot` JSONB phân cấp xác định (deterministic hierarchy: Milestones -> Modules -> Topics theo `position asc`) trực tiếp từ database, chống client giả mạo dữ liệu.
  - Bắt buộc `created_by = 'user'` đối với người dùng thông thường; không thể mạo danh system/ai hoặc thay đổi `user_id`.
  - Ghi bản ghi bất biến vào `learning_path_versions` và tăng `current_version` trong transaction duy nhất.
  - Quyền: `REVOKE EXECUTE FROM public, anon; GRANT EXECUTE TO authenticated, service_role`.


### `daily_plans`
`id`, `user_id`, `plan_date date`, `available_minutes integer`, `status` (`planned`, `in_progress`, `completed`, `partially_completed`, `skipped`), `generation_reason jsonb`, timestamps; unique (`user_id`, `plan_date`).

### `daily_plan_activities`
`id`, `daily_plan_id`, `content_item_id`, `learning_path_item_id`, `title`, `activity_type`, `position`, `estimated_minutes`, `status` (`pending`, `in_progress`, `completed`, `skipped`, `replaced`), `started_at`, `completed_at`, `actual_minutes`, `result_summary jsonb`.

### `learning_events` và `learning_evidence`
- `learning_events`: `id`, `user_id`, `event_type`, `entity_type`, `entity_id`, `payload jsonb`, `occurred_at`.
- `learning_evidence`: `id`, `user_id`, `skill`, `knowledge_type`, `knowledge_id`, `source_type`, `source_id`, `score`, `max_score`, `accuracy`, `duration_seconds`, `evidence jsonb`, `created_at`.

### `vocabulary_items` và `user_vocabulary`
- `vocabulary_items`: `id`, `word`, `normalized_word`, `part_of_speech`, `ipa`, `meaning_vi`, `example_sentence`, `audio_url`, `level`, `topic`, `is_published`, timestamps.
- `user_vocabulary`: `id`, `user_id`, `vocabulary_item_id references vocabulary_items(id)`, `status`, `ease_factor numeric(4,2) default 2.5`, `interval_days`, `repetition_count`, `next_review_at`, `last_reviewed_at`, `last_quality smallint check (last_quality between 0 and 5)`; unique (`user_id`, `vocabulary_item_id`).

### `ai_generations`, `ai_feedback`, `recommendations`
- `ai_generations`: feature/provider/model/prompt_version/status/token usage/latency/cost/error code/timestamp.
- `ai_feedback`: user, feature, source, feedback type (`helpful`, `not_helpful`, `incorrect`, `dismissed`), comment, timestamp.
- `recommendations`: user, recommendation type, payload, reason, status (`proposed`, `accepted`, `rejected`, `expired`), created/acted timestamps.

### TOEIC — triển khai sau MVP
- `toeic_test_forms`: title, test type, time limit, scoring version, published flag.
- `toeic_test_questions`: form, exercise, part number, question number, passage group, points.
- `toeic_attempts`: user, form, status, started/submitted time, listening raw score, reading raw score, scaled score, scoring version.
- `toeic_answers`: attempt, question, answer, correctness, time spent.
Điểm quy đổi phải có versioned configuration. Không quảng cáo nội dung do hệ thống sinh là đề ETS chính thức.

## 4. RLS và bảo mật

Bật RLS trên mọi bảng chứa dữ liệu user. Ví dụ cho bảng `goals`:

```sql
alter table public.goals enable row level security;

create policy "Users read own goals"
on public.goals for select using (auth.uid() = user_id);

create policy "Users insert own goals"
on public.goals for insert with check (auth.uid() = user_id);

create policy "Users update own goals"
on public.goals for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users delete own goals"
on public.goals for delete using (auth.uid() = user_id);
```

Đây chỉ là mẫu cho bảng có `user_id`. Nội dung chung chỉ cho đọc bản đã publish; quản trị nội dung phải có policy riêng. Đảm bảo attempt thuộc user và không cho user đọc answer key. Không đưa service-role key hoặc AI key ra client. Lấy `user_id` từ session server, không tin giá trị client gửi. Test RLS bằng ít nhất hai tài khoản.

## 5. Index nên có

```sql
create index if not exists idx_goals_user_status on public.goals(user_id, status);
create index if not exists idx_attempts_user_started on public.assessment_attempts(user_id, started_at desc);
create index if not exists idx_daily_plans_user_date on public.daily_plans(user_id, plan_date desc);
create index if not exists idx_mastery_user_updated on public.learner_knowledge_mastery(user_id, updated_at desc);
create index if not exists idx_user_vocab_due on public.user_vocabulary(user_id, next_review_at);
create index if not exists idx_learning_events_user_time on public.learning_events(user_id, occurred_at desc);
```

## 6. Physical Tables Triển Khai Thực Tế

### Phase 4 — Daily Plan & Interactive Practice Tables (Migration: `20261016_phase_4_daily_plan_practice.sql`)

1. **`content_items`**:
   - `id uuid primary key default gen_random_uuid()`
   - `slug text not null unique`, `title text not null`, `description text`
   - `content_type text not null check (content_type in ('vocabulary_lesson', 'grammar_lesson', 'reading_comprehension', 'listening_practice'))`
   - `skill text not null check (skill in ('vocabulary', 'grammar', 'reading', 'listening', 'speaking', 'writing', 'toeic'))`
   - `target_level text not null default 'a1'`
   - `estimated_minutes integer not null check (estimated_minutes between 3 and 120)`
   - `content_status text not null default 'available' check (content_status in ('available', 'planned_curriculum'))`
   - `is_published boolean not null default true`
   - `metadata jsonb not null default '{}'::jsonb`
   - RLS: `authenticated` chỉ có quyền SELECT các bản ghi `is_published = true`.

2. **`practice_exercises`**:
   - `id uuid primary key default gen_random_uuid()`
   - `content_item_id uuid not null references public.content_items(id) on delete cascade`
   - `exercise_type text not null check (exercise_type in ('multiple_choice', 'fill_in_the_blank', 'sentence_ordering'))`
   - `prompt text not null`
   - `options jsonb not null default '[]'::jsonb` (danh sách phương án lựa chọn, không chứa cờ đáp án)
   - `position integer not null default 1`
   - `points integer not null default 10`
   - RLS: `authenticated` chỉ có quyền SELECT.

3. **`practice_exercise_answers` (SERVER-ONLY ZERO-TRUST ANSWER KEY)**:
   - `exercise_id uuid primary key references public.practice_exercises(id) on delete cascade`
   - `correct_answer text not null`
   - `explanation text`
   - **RLS & Security Policy**: **KHÔNG CÓ POLICY SELECT CHO AUTHENTICATED**. Quyền truy cập trực tiếp bị thu hồi hoàn toàn. Chỉ server-side backend (Admin Client/Server Actions) được truy vấn để tính điểm và tạo phản hồi sư phạm sau khi người học nộp bài.

4. **`daily_plans`**:
   - `id uuid primary key default gen_random_uuid()`
   - `user_id uuid not null references auth.users(id) on delete cascade`
   - `plan_date date not null default current_date`
   - `target_minutes integer not null default 30 check (target_minutes between 5 and 240)`
   - `status text not null default 'planned' check (status in ('planned', 'in_progress', 'partially_completed', 'completed', 'missed'))`
   - `generation_reason text not null default 'active_path_scheduled'`
   - Ràng buộc: `unique(user_id, plan_date)` (mỗi học viên duy nhất 1 kế hoạch mỗi ngày).
   - RLS: `authenticated` chỉ có quyền SELECT kế hoạch của chính mình (`auth.uid() = user_id`). Quyền ghi qua Server Actions.

5. **`daily_plan_tasks`**:
   - `id uuid primary key default gen_random_uuid()`
   - `daily_plan_id uuid not null references public.daily_plans(id) on delete cascade`
   - `learning_path_item_id uuid references public.learning_path_items(id) on delete set null`
   - `content_item_id uuid references public.content_items(id) on delete set null`
   - `position integer not null default 1`
   - `activity_type text not null check (activity_type in ('lesson', 'practice', 'review_srs', 'assessment'))`
   - `skill text check (skill in ('vocabulary', 'grammar', 'reading', 'listening', 'speaking', 'writing', 'toeic'))`
   - `title text not null`, `description text`
   - `estimated_minutes integer not null check (estimated_minutes between 1 and 120)`
   - `content_status text not null default 'available' check (content_status in ('available', 'planned_curriculum'))`
   - `status text not null default 'pending' check (status in ('pending', 'in_progress', 'completed', 'skipped'))`
   - `skip_reason text`
   - RLS: `authenticated` chỉ có quyền SELECT các task thuộc `daily_plans` của chính mình.

6. **`practice_submissions`**:
   - `id uuid primary key default gen_random_uuid()`
   - `user_id uuid not null references auth.users(id) on delete cascade`
   - `daily_plan_task_id uuid references public.daily_plan_tasks(id) on delete set null`
   - `content_item_id uuid not null references public.content_items(id) on delete cascade`
   - `raw_score integer not null default 0`, `max_score integer not null default 0`
   - `score_percentage numeric(5,2) not null default 0.00 check (score_percentage between 0 and 100)`
   - `time_spent_seconds integer not null default 0`
   - `user_answers jsonb not null default '[]'::jsonb`
   - `feedback_summary jsonb not null default '{}'::jsonb`
   - RLS: `authenticated` chỉ có quyền SELECT các bài nộp của chính mình.

7. **`learning_events` & `learning_evidence`**:
   - Ghi nhận lịch sử tương tác học tập và bằng chứng đánh giá năng lực theo từng kỹ năng, sẵn sàng cung cấp dữ liệu cho Adaptive Engine và Spaced Repetition (SRS).

### Phase 5 — AI Tutor & Usage Telemetry Tables (Migration: `20261017_phase_5_ai_tutor.sql`)

1. **`ai_generations`**:
   - `id uuid primary key default gen_random_uuid()`
   - `user_id uuid not null references auth.users(id) on delete cascade`
   - `feature text not null default 'exercise_explanation'`
   - `provider text not null default 'mock'`
   - `model text not null default 'mock-tutor-v1'`
   - `prompt_version text not null default 'tutor_exercise_explanation_v1'`
   - `status text not null default 'success' check (status in ('success', 'fallback', 'error'))`
   - `prompt_tokens integer not null default 0`, `completion_tokens integer not null default 0`, `total_tokens integer not null default 0`
   - `latency_ms integer not null default 0`
   - `estimated_cost_usd numeric(10,6) default 0.000000`
   - `error_code text`
   - `metadata jsonb not null default '{}'::jsonb` (chỉ lưu metadata câu hỏi/bài nộp, **tuyệt đối không lưu secret/API keys**)
   - `created_at timestamptz not null default now()`
   - Index: `idx_ai_generations_user_created`, `idx_ai_generations_feature_status`, `idx_ai_generations_prompt_version`.
   - RLS: `authenticated` chỉ có quyền SELECT lịch sử gọi của chính mình (`auth.uid() = user_id`). Quyền ghi thu hồi hoàn toàn khỏi `authenticated`/`anon` (chỉ backend admin/service role ghi).

2. **`ai_rate_limits`**:
   - `id uuid primary key default gen_random_uuid()`
   - `user_id uuid not null references auth.users(id) on delete cascade`
   - `window_start timestamptz not null`
   - `request_count integer not null default 1`
   - `created_at timestamptz not null default now()`, `updated_at timestamptz not null default now()`
   - Ràng buộc: `unique(user_id, window_start)`.
   - Atomic Stored Procedure: `public.check_and_increment_ai_rate_limit(p_user_id, p_window_start, p_max_requests)` chạy dưới quyền `SECURITY DEFINER SET search_path = ''` với kiểm tra tham số phòng thủ. **Quyền EXECUTE được thu hồi hoàn toàn khỏi public/anon/authenticated và chỉ cấp cho `service_role`** để triệt tiêu nguy cơ DoS quota từ client.
   - Operational Maintenance Function: `public.cleanup_expired_ai_rate_limits(p_older_than interval default interval '1 day')` cho phép dọn dẹp an toàn các cửa sổ rate limit đã hết hạn mà không ảnh hưởng tới cửa sổ đang hoạt động. Quyền EXECUTE chỉ cấp cho `service_role`.

### Phase 6 — Personal Vocabulary Notebook & Review Schedule Tables (Migration: `20261019_phase_6_vocabulary_review.sql`)

1. **`vocabulary_items`** (Curated Vocabulary Bank):
   - `id uuid primary key default gen_random_uuid()`
   - `content_item_id uuid references public.content_items(id) on delete set null`
   - `word text not null`, `word_normalized text not null` (chuẩn hóa `lower(trim(word))` để chống trùng lặp)
   - `part_of_speech text not null`, `ipa text not null`, `meaning_vi text not null`, `example text not null`, `note text`
   - `level text not null default 'a1'` check (`level in ('pre_a1', 'a1', 'a2', 'b1', 'b2', 'c1', 'c2')`)
   - `topic text not null default 'general'`
   - `is_published boolean not null default true`
   - Timestamps: `created_at`, `updated_at`
   - Ràng buộc: `unique(word_normalized)`
   - Indexes: `idx_vocabulary_items_topic`, `idx_vocabulary_items_level`
   - RLS: Role `authenticated` và `anon` chỉ có quyền SELECT các mục `is_published = true`. Quyền ghi thu hồi hoàn toàn khỏi client, chỉ `service_role` quản trị.

2. **`user_vocabulary`** (Personal Vocabulary Notebook):
   - `id uuid primary key default gen_random_uuid()`
   - `user_id uuid not null references auth.users(id) on delete cascade`
   - `vocabulary_item_id uuid references public.vocabulary_items(id) on delete set null` (tham chiếu ID từ điển curated)
   - `word text not null`, `word_normalized text not null`
   - `part_of_speech text`, `ipa text`, `meaning_vi text not null`, `example text`, `custom_notes text`
   - `status text not null default 'learning'` check (`status in ('learning', 'reviewing', 'mastered')`)
   - `interval_days integer not null default 1 check (interval_days >= 1)`
   - `consecutive_correct integer not null default 0 check (consecutive_correct >= 0)`
   - `review_count integer not null default 0 check (review_count >= 0)`
   - `last_reviewed_at timestamptz`
   - `next_review_at timestamptz not null default now()`
   - Timestamps: `created_at`, `updated_at`
   - Ràng buộc chống trùng lặp: `unique(user_id, word_normalized)`
   - Indexes:
     - `idx_user_vocabulary_user_due on public.user_vocabulary(user_id, next_review_at asc)`
     - `idx_user_vocabulary_user_status on public.user_vocabulary(user_id, status)`
   - RLS: `authenticated` chỉ có quyền SELECT, INSERT, UPDATE, DELETE các dòng thuộc quyền sở hữu của chính mình (`auth.uid() = user_id`).

3. **`vocabulary_review_logs`** (Review Audit Trail & Idempotency Guard):
   - `id uuid primary key default gen_random_uuid()`
   - `user_id uuid not null references auth.users(id) on delete cascade`
   - `user_vocab_id uuid not null references public.user_vocabulary(id) on delete cascade`
   - `review_session_id uuid not null`
   - `result text not null check (result in ('remembered', 'forgot'))`
   - `interval_before integer not null default 1`, `interval_after integer not null default 1`
   - `reviewed_at timestamptz not null default now()`
   - Ràng buộc chống trùng lặp review trong cùng phiên: `unique(review_session_id, user_vocab_id)`
   - Indexes:
     - `idx_vocab_review_logs_user_reviewed on public.vocabulary_review_logs(user_id, reviewed_at desc)`
     - `idx_vocab_review_logs_session on public.vocabulary_review_logs(review_session_id)`
   - RLS: `authenticated` chỉ có quyền SELECT và INSERT dòng của chính mình (`auth.uid() = user_id`). Quyền UPDATE và DELETE bị thu hồi hoàn toàn khỏi client nhằm đảm bảo tính bất biến của nhật ký học tập.

### Learning Streak & Calendar Schedule (Migration: `20261020_streak_and_calendar_schedule.sql`)

1. **`public.profiles` (Cột bổ sung)**:
   - `current_streak integer not null default 0 check (current_streak >= 0)`: Chuỗi số ngày học liên tiếp hiện tại.
   - `longest_streak integer not null default 0 check (longest_streak >= 0)`: Kỷ lục chuỗi ngày học cao nhất.
   - `last_study_date date`: Ngày học gần nhất theo định dạng ngày dương lịch (`YYYY-MM-DD`, theo múi giờ `timezone` của người dùng).
   - Index: `idx_profiles_last_study_date on public.profiles(last_study_date)`.

2. **Cập nhật RPC `submit_vocabulary_review_session`**:
   - Chuyển mốc ôn tập tiếp theo sang ranh giới đầu ngày (Calendar-day boundary):
     `v_next_review_at := ((v_now at time zone 'Asia/Ho_Chi_Minh')::date + v_new_interval)::timestamp at time zone 'Asia/Ho_Chi_Minh';`
   - Tự động cộng dồn và cập nhật `current_streak`, `longest_streak`, `last_study_date` trên bảng `public.profiles` nguyên tử trong cùng transaction khi phiên ôn tập thành công.
