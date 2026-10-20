-- ==============================================================================
-- Migration: Phase 6 — Personal Vocabulary Notebook & Review Schedule
-- Version: 20261019_phase_6_vocabulary_review
-- Description:
--   1. Creates `public.vocabulary_items` for curated dictionary words (curated vocabulary bank).
--   2. Seeds foundational curated vocabulary sets:
--      - "vocab-daily-routine" (6 words)
--      - "vocab-office-communication" (6 words + practice exercises + answers)
--   3. Creates `public.user_vocabulary` for personal vocabulary notebook with:
--      - Multi-tenant isolation (user_id)
--      - Deduplication constraint unique(user_id, word_normalized)
--      - Simple deterministic review schedule (interval_days, consecutive_correct, next_review_at)
--   4. Creates `public.vocabulary_review_logs` for audit trail & idempotency guard.
--   5. Enforces Zero-Trust Least Privilege RLS policies.
-- ==============================================================================

-- 1. Curated Vocabulary Bank: public.vocabulary_items
create table if not exists public.vocabulary_items (
  id uuid primary key default gen_random_uuid(),
  content_item_id uuid references public.content_items(id) on delete set null,
  word text not null check (char_length(trim(word)) > 0),
  word_normalized text not null check (char_length(trim(word_normalized)) > 0),
  part_of_speech text not null,
  ipa text not null,
  meaning_vi text not null check (char_length(trim(meaning_vi)) > 0),
  example text not null,
  note text,
  audio_url text,
  level text not null default 'a1' check (level in ('pre_a1', 'a1', 'a2', 'b1', 'b2', 'c1', 'c2')),
  topic text not null default 'general',
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint uq_vocabulary_items_word unique (word_normalized)
);

create index if not exists idx_vocabulary_items_content_item
  on public.vocabulary_items(content_item_id);

create index if not exists idx_vocabulary_items_topic 
  on public.vocabulary_items(topic, is_published);

create index if not exists idx_vocabulary_items_level 
  on public.vocabulary_items(level, is_published);

-- Trigger: auto-update updated_at on vocabulary_items
drop trigger if exists set_vocabulary_items_updated_at on public.vocabulary_items;
create trigger set_vocabulary_items_updated_at
  before update on public.vocabulary_items
  for each row
  execute function public.handle_updated_at();

-- RLS on vocabulary_items
alter table public.vocabulary_items enable row level security;
alter table public.vocabulary_items force row level security;

drop policy if exists "Allow read published vocabulary items" on public.vocabulary_items;
create policy "Allow read published vocabulary items"
  on public.vocabulary_items for select
  using (is_published = true);

revoke all on public.vocabulary_items from public;
grant select on public.vocabulary_items to authenticated, anon;
grant all on public.vocabulary_items to service_role;


--- 2. Seed Second Foundational Curated Content Item & Exercises (Dynamic Foreign Key Resolution)
do $$
declare
  v_office_comm_id uuid;
  v_daily_routine_id uuid;
  v_ex_1_id uuid;
  v_ex_2_id uuid;
  v_ex_3_id uuid;
  v_ex_4_id uuid;
  v_ex_5_id uuid;
begin
  -- 2.1 Content Item: vocab-office-communication
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
    '11111111-1111-4111-a111-000000000004'::uuid,
    'vocab-office-communication',
    'Từ vựng Giao tiếp Nơi làm việc (Office Communication)',
    'Học 6 từ vựng công sở thiết yếu về đồng nghiệp, hạn chót, phối hợp công việc và báo cáo.',
    'vocabulary_set',
    'vocabulary',
    'a1',
    15,
    '{
      "overview": "Nắm vững 6 từ vựng giao tiếp công sở trọng tâm giúp trao đổi công việc, lịch trình và phối hợp nhóm hiệu quả.",
      "words": [
        {
          "word": "colleague",
          "ipa": "/ˈkɒliːɡ/",
          "part_of_speech": "noun",
          "meaning_vi": "đồng nghiệp",
          "example": "I discussed the quarterly project with my colleague.",
          "note": "Chỉ người cùng làm việc trong một cơ quan, tổ chức."
        },
        {
          "word": "deadline",
          "ipa": "/ˈdedlaɪn/",
          "part_of_speech": "noun",
          "meaning_vi": "hạn chót hoàn thành",
          "example": "The strict project deadline is 5:00 PM this Friday.",
          "note": "Cụm từ phổ biến: meet the deadline (kịp hạn), miss the deadline (trễ hạn)."
        },
        {
          "word": "presentation",
          "ipa": "/ˌpreznˈteɪʃn/",
          "part_of_speech": "noun",
          "meaning_vi": "bài thuyết trình, bài trình bày",
          "example": "She gave an impressive presentation to the new client.",
          "note": "Cụm từ hay dùng: give/deliver a presentation."
        },
        {
          "word": "feedback",
          "ipa": "/ˈfiːdbæk/",
          "part_of_speech": "noun (uncountable)",
          "meaning_vi": "ý kiến phản hồi, nhận xét",
          "example": "The manager provided constructive feedback on my work.",
          "note": "Danh từ không đếm được: some feedback, a piece of feedback."
        },
        {
          "word": "collaborate",
          "ipa": "/kəˈlæbəreɪt/",
          "part_of_speech": "verb",
          "meaning_vi": "hợp tác, phối hợp làm việc",
          "example": "Our team collaborates closely with software engineers.",
          "note": "Cấu trúc: collaborate with somebody on something."
        },
        {
          "word": "postpone",
          "ipa": "/pəʊstˈpəʊn/",
          "part_of_speech": "verb",
          "meaning_vi": "hoãn lại, dời lịch",
          "example": "We decided to postpone the kickoff meeting until next Monday.",
          "note": "Đồng nghĩa với phrasal verb \"put off\"."
        }
      ]
    }'::jsonb,
    true
  ) on conflict (slug) do update set
    title = excluded.title,
    description = excluded.description,
    body = excluded.body,
    updated_at = now();

  -- Retrieve actual persistent ID (never assume hardcoded UUID if slug already existed with another id)
  select id into v_office_comm_id from public.content_items where slug = 'vocab-office-communication';
  select id into v_daily_routine_id from public.content_items where slug = 'vocab-daily-routine';

  -- 2.2 Practice Exercises & Answers for vocab-office-communication
  -- Exercise 1
  insert into public.practice_exercises (
    content_item_id, exercise_type, prompt, context_text, options, position, weight
  ) values (
    v_office_comm_id,
    'multiple_choice',
    'Chọn từ phù hợp nhất: "I usually have lunch with my ________ from the marketing team."',
    null,
    '[
      {"id": "opt_21a", "text": "colleague"},
      {"id": "opt_21b", "text": "deadline"},
      {"id": "opt_21c", "text": "presentation"},
      {"id": "opt_21d", "text": "postpone"}
    ]'::jsonb,
    1,
    1.0
  ) on conflict (content_item_id, position) do update set
    prompt = excluded.prompt,
    context_text = excluded.context_text,
    options = excluded.options,
    weight = excluded.weight;

  select id into v_ex_1_id from public.practice_exercises where content_item_id = v_office_comm_id and position = 1;

  insert into public.practice_exercise_answers (exercise_id, correct_option_id, explanation) values (
    v_ex_1_id,
    'opt_21a',
    '"colleague" nghĩa là đồng nghiệp cùng cơ quan/phòng ban. Câu nói về việc ăn trưa cùng đồng nghiệp trong nhóm marketing.'
  ) on conflict (exercise_id) do update set
    correct_option_id = excluded.correct_option_id,
    explanation = excluded.explanation;

  -- Exercise 2
  insert into public.practice_exercises (
    content_item_id, exercise_type, prompt, context_text, options, position, weight
  ) values (
    v_office_comm_id,
    'multiple_choice',
    'Cụm từ "meet the deadline" có ý nghĩa gì trong môi trường công sở?',
    'Ngữ cảnh: Quản lý dự án nhắc nhở toàn đội về tiến độ bàn giao sản phẩm.',
    '[
      {"id": "opt_22a", "text": "Hủy bỏ toàn bộ kế hoạch dự án"},
      {"id": "opt_22b", "text": "Hoàn thành công việc đúng hạn đã định"},
      {"id": "opt_22c", "text": "Kéo dài thời gian làm việc sang tuần sau"},
      {"id": "opt_22d", "text": "Từ chối nhận nhiệm vụ từ cấp trên"}
    ]'::jsonb,
    2,
    1.0
  ) on conflict (content_item_id, position) do update set
    prompt = excluded.prompt,
    context_text = excluded.context_text,
    options = excluded.options,
    weight = excluded.weight;

  select id into v_ex_2_id from public.practice_exercises where content_item_id = v_office_comm_id and position = 2;

  insert into public.practice_exercise_answers (exercise_id, correct_option_id, explanation) values (
    v_ex_2_id,
    'opt_22b',
    '"meet the deadline" là thành ngữ công sở phổ biến, có nghĩa là kịp hạn, hoàn thành đúng thời hạn quy định.'
  ) on conflict (exercise_id) do update set
    correct_option_id = excluded.correct_option_id,
    explanation = excluded.explanation;

  -- Exercise 3
  insert into public.practice_exercises (
    content_item_id, exercise_type, prompt, context_text, options, position, weight
  ) values (
    v_office_comm_id,
    'multiple_choice',
    'Điền từ phù hợp: "After the product demo, the clients gave us very positive ________."',
    null,
    '[
      {"id": "opt_23a", "text": "feedback"},
      {"id": "opt_23b", "text": "commute"},
      {"id": "opt_23c", "text": "postpone"},
      {"id": "opt_23d", "text": "wake up"}
    ]'::jsonb,
    3,
    1.0
  ) on conflict (content_item_id, position) do update set
    prompt = excluded.prompt,
    context_text = excluded.context_text,
    options = excluded.options,
    weight = excluded.weight;

  select id into v_ex_3_id from public.practice_exercises where content_item_id = v_office_comm_id and position = 3;

  insert into public.practice_exercise_answers (exercise_id, correct_option_id, explanation) values (
    v_ex_3_id,
    'opt_23a',
    '"feedback" là nhận xét, phản hồi. Khách hàng đã đưa ra những ý kiến phản hồi rất tích cực sau buổi giới thiệu sản phẩm.'
  ) on conflict (exercise_id) do update set
    correct_option_id = excluded.correct_option_id,
    explanation = excluded.explanation;

  -- Exercise 4
  insert into public.practice_exercises (
    content_item_id, exercise_type, prompt, context_text, options, position, weight
  ) values (
    v_office_comm_id,
    'multiple_choice',
    'Chọn động từ chính xác: "Our designers and developers need to ________ closely to build great apps."',
    null,
    '[
      {"id": "opt_24a", "text": "collaborate"},
      {"id": "opt_24b", "text": "deadline"},
      {"id": "opt_24c", "text": "breakfast"},
      {"id": "opt_24d", "text": "routine"}
    ]'::jsonb,
    4,
    1.0
  ) on conflict (content_item_id, position) do update set
    prompt = excluded.prompt,
    context_text = excluded.context_text,
    options = excluded.options,
    weight = excluded.weight;

  select id into v_ex_4_id from public.practice_exercises where content_item_id = v_office_comm_id and position = 4;

  insert into public.practice_exercise_answers (exercise_id, correct_option_id, explanation) values (
    v_ex_4_id,
    'opt_24a',
    '"collaborate" là động từ chỉ sự cộng tác, hợp tác làm việc nhóm giữa các bộ phận thiết kế và lập trình.'
  ) on conflict (exercise_id) do update set
    correct_option_id = excluded.correct_option_id,
    explanation = excluded.explanation;

  -- Exercise 5
  insert into public.practice_exercises (
    content_item_id, exercise_type, prompt, context_text, options, position, weight
  ) values (
    v_office_comm_id,
    'multiple_choice',
    'Từ "postpone" đồng nghĩa với cụm từ nào sau đây?',
    null,
    '[
      {"id": "opt_25a", "text": "put off / delay"},
      {"id": "opt_25b", "text": "start immediately"},
      {"id": "opt_25c", "text": "wake up early"},
      {"id": "opt_25d", "text": "finish on time"}
    ]'::jsonb,
    5,
    1.0
  ) on conflict (content_item_id, position) do update set
    prompt = excluded.prompt,
    context_text = excluded.context_text,
    options = excluded.options,
    weight = excluded.weight;

  select id into v_ex_5_id from public.practice_exercises where content_item_id = v_office_comm_id and position = 5;

  insert into public.practice_exercise_answers (exercise_id, correct_option_id, explanation) values (
    v_ex_5_id,
    'opt_25a',
    '"postpone" đồng nghĩa với "put off" hoặc "delay", mang nghĩa hoãn lại một sự kiện hoặc cuộc họp sang thời điểm sau.'
  ) on conflict (exercise_id) do update set
    correct_option_id = excluded.correct_option_id,
    explanation = excluded.explanation;

  -- 2.3 Seed Curated Words into public.vocabulary_items with dynamic foreign key resolution
  insert into public.vocabulary_items (
    content_item_id, word, word_normalized, part_of_speech, ipa, meaning_vi, example, note, topic, level
  ) values
  -- From Daily Routine
  (
    v_daily_routine_id,
    'wake up',
    'wake up',
    'phrasal verb',
    '/weɪk ʌp/',
    'thức giấc, mở mắt tỉnh dậy',
    'I usually wake up at 6:00 AM every morning.',
    'Phân biệt với "get up" (rời khỏi giường).',
    'daily_routine',
    'a1'
  ),
  (
    v_daily_routine_id,
    'have breakfast',
    'have breakfast',
    'verb phrase',
    '/hæv ˈbrekfəst/',
    'ăn sáng',
    'She has breakfast with her family before going to work.',
    'Dùng have/eat breakfast, không dùng "drink breakfast".',
    'daily_routine',
    'a1'
  ),
  (
    v_daily_routine_id,
    'commute',
    'commute',
    'verb',
    '/kəˈmjuːt/',
    'đi lại đều đặn giữa nhà và nơi làm việc',
    'He commutes to the office by bus every weekday.',
    'Danh từ: a 30-minute commute.',
    'daily_routine',
    'a1'
  ),
  (
    v_daily_routine_id,
    'prepare',
    'prepare',
    'verb',
    '/prɪˈpeər/',
    'chuẩn bị, sửa soạn',
    'They prepare dinner together in the evening.',
    'Cấu trúc: prepare for something hoặc prepare something.',
    'daily_routine',
    'a1'
  ),
  (
    v_daily_routine_id,
    'schedule',
    'schedule',
    'noun',
    '/ˈskedʒuːl/',
    'lịch trình, thời gian biểu',
    'I need to check my daily schedule for the meeting.',
    'Cụm từ phổ biến: on schedule (đúng giờ), ahead of schedule.',
    'daily_routine',
    'a1'
  ),
  (
    v_daily_routine_id,
    'relax',
    'relax',
    'verb',
    '/rɪˈlæks/',
    'thư giãn, nghỉ ngơi',
    'After a long working day, I relax by listening to music.',
    'Tính từ miêu tả: relaxing (êm đềm), relaxed (thư thái).',
    'daily_routine',
    'a1'
  ),
  -- From Office Communication
  (
    v_office_comm_id,
    'colleague',
    'colleague',
    'noun',
    '/ˈkɒliːɡ/',
    'đồng nghiệp',
    'I discussed the quarterly project with my colleague.',
    'Chỉ người cùng làm việc trong một cơ quan, tổ chức.',
    'office',
    'a1'
  ),
  (
    v_office_comm_id,
    'deadline',
    'deadline',
    'noun',
    '/ˈdedlaɪn/',
    'hạn chót hoàn thành',
    'The strict project deadline is 5:00 PM this Friday.',
    'Cụm từ phổ biến: meet the deadline, miss the deadline.',
    'office',
    'a1'
  ),
  (
    v_office_comm_id,
    'presentation',
    'presentation',
    'noun',
    '/ˌpreznˈteɪʃn/',
    'bài thuyết trình, bài trình bày',
    'She gave an impressive presentation to the new client.',
    'Cụm từ hay dùng: give/deliver a presentation.',
    'office',
    'a1'
  ),
  (
    v_office_comm_id,
    'feedback',
    'feedback',
    'noun',
    '/ˈfiːdbæk/',
    'ý kiến phản hồi, nhận xét',
    'The manager provided constructive feedback on my work.',
    'Danh từ không đếm được: some feedback, a piece of feedback.',
    'office',
    'a1'
  ),
  (
    v_office_comm_id,
    'collaborate',
    'collaborate',
    'verb',
    '/kəˈlæbəreɪt/',
    'hợp tác, phối hợp làm việc',
    'Our team collaborates closely with software engineers.',
    'Cấu trúc: collaborate with somebody on something.',
    'office',
    'a1'
  ),
  (
    v_office_comm_id,
    'postpone',
    'postpone',
    'verb',
    '/pəʊstˈpəʊn/',
    'hoãn lại, dời lịch',
    'We decided to postpone the kickoff meeting until next Monday.',
    'Đồng nghĩa với phrasal verb "put off".',
    'office',
    'a1'
  )
  on conflict (word_normalized) do update set
    content_item_id = coalesce(excluded.content_item_id, public.vocabulary_items.content_item_id),
    word = excluded.word,
    part_of_speech = excluded.part_of_speech,
    ipa = excluded.ipa,
    meaning_vi = excluded.meaning_vi,
    example = excluded.example,
    note = excluded.note,
    topic = excluded.topic,
    level = excluded.level,
    updated_at = now();
end;
$$;


-- 3. Personal Vocabulary Notebook: public.user_vocabulary
create table if not exists public.user_vocabulary (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  vocabulary_item_id uuid references public.vocabulary_items(id) on delete set null,
  word text not null check (char_length(trim(word)) > 0),
  word_normalized text not null check (char_length(trim(word_normalized)) > 0),
  part_of_speech text,
  ipa text,
  meaning_vi text not null check (char_length(trim(meaning_vi)) > 0),
  example text,
  custom_notes text,
  status text not null default 'learning' check (status in ('learning', 'reviewing', 'mastered')),
  interval_days integer not null default 1 check (interval_days >= 1 and interval_days <= 3650),
  consecutive_correct integer not null default 0 check (consecutive_correct >= 0 and consecutive_correct <= 100),
  review_count integer not null default 0 check (review_count >= 0),
  last_reviewed_at timestamptz,
  next_review_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint uq_user_vocabulary_user_word unique (user_id, word_normalized)
);

create index if not exists idx_user_vocabulary_vocab_item
  on public.user_vocabulary(vocabulary_item_id);

create index if not exists idx_user_vocabulary_user_due 
  on public.user_vocabulary(user_id, next_review_at asc);

create index if not exists idx_user_vocabulary_user_created 
  on public.user_vocabulary(user_id, created_at desc);

create index if not exists idx_user_vocabulary_user_status 
  on public.user_vocabulary(user_id, status);

-- Trigger: auto-update updated_at on user_vocabulary
drop trigger if exists set_user_vocabulary_updated_at on public.user_vocabulary;
create trigger set_user_vocabulary_updated_at
  before update on public.user_vocabulary
  for each row
  execute function public.handle_updated_at();

-- RLS on user_vocabulary
alter table public.user_vocabulary enable row level security;
alter table public.user_vocabulary force row level security;

drop policy if exists "Users can view own vocabulary" on public.user_vocabulary;
create policy "Users can view own vocabulary"
  on public.user_vocabulary for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own vocabulary" on public.user_vocabulary;
create policy "Users can insert own vocabulary"
  on public.user_vocabulary for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own vocabulary" on public.user_vocabulary;
create policy "Users can update own vocabulary"
  on public.user_vocabulary for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete own vocabulary" on public.user_vocabulary;
create policy "Users can delete own vocabulary"
  on public.user_vocabulary for delete
  using (auth.uid() = user_id);

revoke all on public.user_vocabulary from public, anon;
grant select, insert, update, delete on public.user_vocabulary to authenticated;
grant all on public.user_vocabulary to service_role;


-- 4. Vocabulary Review Logs & Idempotency: public.vocabulary_review_logs
create table if not exists public.vocabulary_review_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  user_vocab_id uuid not null references public.user_vocabulary(id) on delete cascade,
  review_session_id uuid not null,
  result text not null check (result in ('remembered', 'forgot')),
  interval_before integer not null default 1 check (interval_before >= 1),
  interval_after integer not null default 1 check (interval_after >= 1),
  reviewed_at timestamptz not null default now(),
  constraint uq_review_log_session_word unique (review_session_id, user_vocab_id)
);

create index if not exists idx_vocab_review_logs_vocab_id
  on public.vocabulary_review_logs(user_vocab_id);

create index if not exists idx_vocab_review_logs_user_reviewed 
  on public.vocabulary_review_logs(user_id, reviewed_at desc);

create index if not exists idx_vocab_review_logs_user_session 
  on public.vocabulary_review_logs(user_id, review_session_id);

create index if not exists idx_vocab_review_logs_session 
  on public.vocabulary_review_logs(review_session_id);

-- RLS on vocabulary_review_logs
alter table public.vocabulary_review_logs enable row level security;
alter table public.vocabulary_review_logs force row level security;

drop policy if exists "Users can view own review logs" on public.vocabulary_review_logs;
create policy "Users can view own review logs"
  on public.vocabulary_review_logs for select
  using (auth.uid() = user_id);

-- Immutable audit logs: completely revoked from client direct mutation (no insert, update, or delete from client)
revoke all on public.vocabulary_review_logs from public, anon;
revoke insert, update, delete on public.vocabulary_review_logs from authenticated;
grant select on public.vocabulary_review_logs to authenticated;
grant all on public.vocabulary_review_logs to service_role;


-- 5. Atomic Review Session Submission RPC (SECURITY DEFINER with empty search_path)
-- Ensures atomicity, anti-tampering, concurrency protection via advisory locks + row locks, and idempotency
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
  -- Khóa mức giao dịch nguyên tử theo cặp (user_id, review_session_id).
  -- Mọi request đồng thời cùng session_id buộc phải đợi request đầu tiên commit hoặc rollback.
  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtext('vocab_review_session:' || v_user_id::text || ':' || p_review_session_id::text)
  );

  -- 3. Idempotency Guard: Check if session was already processed
  select pg_catalog.count(*) into v_log_count
  from public.vocabulary_review_logs
  where user_id = v_user_id and review_session_id = p_review_session_id;

  if v_log_count > 0 then
    -- Return existing items without re-calculating or duplicate inserts
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
    -- Validate result value
    if v_review.result not in ('remembered', 'forgot') then
      raise exception 'INVALID_RESULT: Kết quả ôn tập phải là remembered hoặc forgot.';
    end if;

    -- Fetch item with row lock FOR UPDATE and strict ownership verification
    select * into v_user_vocab
    from public.user_vocabulary
    where id = v_review.user_vocab_id and user_id = v_user_id
    for update;

    -- Reject entire session if any word does not exist or does not belong to user (Anti-IDOR / No partial updates)
    if not found then
      raise exception 'UNAUTHORIZED_OR_NOT_FOUND: Từ vựng % không tồn tại hoặc không thuộc quyền sở hữu của bạn.', v_review.user_vocab_id;
    end if;

    -- Lưu interval_before từ bản ghi cũ TRƯỚC KHI CẬP NHẬT
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

    v_next_review_at := v_now + (v_new_interval || ' days')::interval;

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

    -- Insert into immutable review logs with exact interval_before saved before update
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

  return pg_catalog.jsonb_build_object(
    'session_already_processed', false,
    'updated_count', pg_catalog.jsonb_array_length(v_updated_items),
    'items', v_updated_items
  );
end;
$$;

revoke all on function public.submit_vocabulary_review_session(uuid, jsonb) from public;
grant execute on function public.submit_vocabulary_review_session(uuid, jsonb) to authenticated;
grant execute on function public.submit_vocabulary_review_session(uuid, jsonb) to service_role;
