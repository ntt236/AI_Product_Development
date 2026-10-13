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

### `learning_paths`
`id`, `user_id`, `goal_id references goals(id) on delete set null`, `title`, `description`, `status` (`proposed`, `active`, `paused`, `completed`, `rejected`, `archived`), `source` (`ai`, `user`, `template`), `current_version integer default 1`, timestamps.

### `learning_path_versions`
`id`, `learning_path_id references learning_paths(id) on delete cascade`, `version_number`, `change_reason`, `created_by`, `snapshot jsonb`, `created_at`; unique (`learning_path_id`, `version_number`). Mọi lần user chỉnh lộ trình tạo version mới; AI không ghi đè thay đổi của user.

### `learning_path_items`
`id`, `learning_path_id`, `version_number`, `parent_id uuid`, `item_type` (`milestone`, `module`, `topic`, `activity`), `title`, `description`, `content_item_id`, `position`, `estimated_minutes`, `status`, `metadata jsonb`.

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

## 6. Thứ tự tạo bảng
**Phase 1:** `profiles`, `goals`, `learner_preferences`, `content_items`, `exercises`, `assessments`, `assessment_questions`, `assessment_attempts`, `assessment_answers`, `assessment_results`, `learner_skill_profiles`.

**Phase 2:** `learner_knowledge_mastery`, `learning_events`, `learning_evidence`, `learning_paths`, `learning_path_versions`, `learning_path_items`, `daily_plans`, `daily_plan_activities`, `vocabulary_items`, `user_vocabulary`.

**Phase 3:** TOEIC tables, `ai_generations`, `ai_feedback`, `recommendations`, content tables chuyên biệt.

Đây là logical schema, chưa phải migration hoàn chỉnh. Trước khi chạy SQL thật cần bổ sung trigger `updated_at`, kiểm tra foreign key, RLS đầy đủ và test quyền truy cập.
