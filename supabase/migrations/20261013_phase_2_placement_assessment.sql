-- ==============================================================================
-- Migration: Phase 2 — Placement Assessment & Scoring Engine
-- Version: 20261013_phase_2_placement_assessment
-- Description:
--   1. Creates `public.assessments` for assessment tests and metadata.
--   2. Creates `public.assessment_questions` with client-safe question prompts.
--   3. Creates `public.assessment_question_answers` (SERVER-ONLY private answer key).
--   4. Creates `public.assessment_attempts` and `public.assessment_answers`.
--   5. Creates `public.assessment_results` and `public.learner_skill_profiles`.
--   6. Enforces strict Row Level Security (RLS) isolating student data and hiding answers.
--   7. Seeds initial 16-question placement test (Vocab, Grammar, Reading, Listening).
-- ==============================================================================

-- 1. Table: public.assessments
create table if not exists public.assessments (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text,
  assessment_type text not null default 'placement' check (
    assessment_type in ('placement', 'lesson', 'skill', 'toeic')
  ),
  time_limit_seconds integer check (time_limit_seconds is null or time_limit_seconds > 0),
  total_questions integer not null default 0,
  is_published boolean not null default false,
  version integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists set_assessments_updated_at on public.assessments;
create trigger set_assessments_updated_at
  before update on public.assessments
  for each row
  execute function public.handle_updated_at();

-- 2. Table: public.assessment_questions
create table if not exists public.assessment_questions (
  id uuid primary key default gen_random_uuid(),
  assessment_id uuid not null references public.assessments(id) on delete cascade,
  skill text not null check (
    skill in ('vocabulary', 'grammar', 'reading', 'listening')
  ),
  category text not null,
  difficulty smallint not null default 2 check (difficulty between 1 and 5),
  level text not null check (
    level in ('pre_a1', 'a1', 'a2', 'b1', 'b2', 'c1', 'c2')
  ),
  question_type text not null default 'multiple_choice' check (
    question_type in ('multiple_choice', 'fill_blank')
  ),
  prompt text not null,
  context_text text,
  audio_url text,
  options jsonb not null default '[]'::jsonb,
  position integer not null default 1,
  weight numeric(4,2) not null default 1.0 check (weight > 0),
  created_at timestamptz not null default now(),
  constraint uq_assessment_questions_position unique (assessment_id, position)
);

create index if not exists idx_assessment_questions_assessment 
  on public.assessment_questions(assessment_id, position);

-- 3. Table: public.assessment_question_answers (SERVER-ONLY CONFIDENTIAL TABLE)
-- WARNING: This table MUST NOT be accessible to regular clients via RLS.
create table if not exists public.assessment_question_answers (
  question_id uuid primary key references public.assessment_questions(id) on delete cascade,
  correct_option_id text not null,
  explanation text not null,
  created_at timestamptz not null default now()
);

-- 4. Table: public.assessment_attempts
create table if not exists public.assessment_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  assessment_id uuid not null references public.assessments(id) on delete cascade,
  status text not null default 'in_progress' check (
    status in ('in_progress', 'submitted', 'completed', 'abandoned')
  ),
  started_at timestamptz not null default now(),
  submitted_at timestamptz,
  completed_at timestamptz,
  total_questions integer not null default 0,
  answered_count integer not null default 0,
  score numeric(6,2),
  max_score numeric(6,2),
  accuracy numeric(5,4),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists set_assessment_attempts_updated_at on public.assessment_attempts;
create trigger set_assessment_attempts_updated_at
  before update on public.assessment_attempts
  for each row
  execute function public.handle_updated_at();

create index if not exists idx_assessment_attempts_user_status 
  on public.assessment_attempts(user_id, status);

create index if not exists idx_assessment_attempts_user_created 
  on public.assessment_attempts(user_id, created_at desc);

-- 5. Table: public.assessment_answers (Learner Responses)
create table if not exists public.assessment_answers (
  id uuid primary key default gen_random_uuid(),
  attempt_id uuid not null references public.assessment_attempts(id) on delete cascade,
  question_id uuid not null references public.assessment_questions(id) on delete cascade,
  selected_option_id text not null,
  is_correct boolean,
  score_awarded numeric(6,2),
  time_spent_seconds integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint uq_assessment_answers_attempt_question unique (attempt_id, question_id)
);

drop trigger if exists set_assessment_answers_updated_at on public.assessment_answers;
create trigger set_assessment_answers_updated_at
  before update on public.assessment_answers
  for each row
  execute function public.handle_updated_at();

create index if not exists idx_assessment_answers_attempt 
  on public.assessment_answers(attempt_id);

-- 6. Table: public.assessment_results
create table if not exists public.assessment_results (
  id uuid primary key default gen_random_uuid(),
  attempt_id uuid not null unique references public.assessment_attempts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  overall_level text not null check (
    overall_level in ('pre_a1', 'a1', 'a2', 'b1', 'b2', 'c1', 'c2')
  ),
  total_questions integer not null,
  correct_answers integer not null,
  total_score numeric(6,2) not null,
  max_score numeric(6,2) not null,
  accuracy numeric(5,4) not null,
  skill_scores jsonb not null default '{}'::jsonb,
  strengths jsonb not null default '[]'::jsonb,
  weaknesses jsonb not null default '[]'::jsonb,
  recommendations jsonb not null default '[]'::jsonb,
  scoring_version text not null default '1.0.0',
  created_at timestamptz not null default now()
);

create index if not exists idx_assessment_results_user 
  on public.assessment_results(user_id, created_at desc);

-- 7. Table: public.learner_skill_profiles
create table if not exists public.learner_skill_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  skill text not null check (
    skill in ('listening', 'speaking', 'reading', 'writing', 'grammar', 'vocabulary', 'toeic')
  ),
  estimated_level text check (
    estimated_level is null or 
    estimated_level in ('pre_a1', 'a1', 'a2', 'b1', 'b2', 'c1', 'c2')
  ),
  ability_score numeric(5,4) check (
    ability_score is null or (ability_score between 0 and 1)
  ),
  confidence numeric(5,4) check (
    confidence is null or (confidence between 0 and 1)
  ),
  evidence_count integer not null default 0,
  last_assessed_at timestamptz,
  updated_at timestamptz not null default now(),
  constraint uq_learner_skill_profiles_user_skill unique (user_id, skill)
);

drop trigger if exists set_learner_skill_profiles_updated_at on public.learner_skill_profiles;
create trigger set_learner_skill_profiles_updated_at
  before update on public.learner_skill_profiles
  for each row
  execute function public.handle_updated_at();

-- ==============================================================================
-- 8. Row Level Security (RLS) Configuration
-- ==============================================================================

alter table public.assessments enable row level security;
alter table public.assessment_questions enable row level security;
alter table public.assessment_question_answers enable row level security;
alter table public.assessment_attempts enable row level security;
alter table public.assessment_answers enable row level security;
alter table public.assessment_results enable row level security;
alter table public.learner_skill_profiles enable row level security;

-- Policies for public.assessments
drop policy if exists "Published assessments are readable" on public.assessments;
create policy "Published assessments are readable"
  on public.assessments for select
  using (is_published = true);

-- Policies for public.assessment_questions (prompts and options are readable, answers are not here)
drop policy if exists "Questions of published assessments are readable" on public.assessment_questions;
create policy "Questions of published assessments are readable"
  on public.assessment_questions for select
  using (
    exists (
      select 1 from public.assessments a 
      where a.id = assessment_questions.assessment_id and a.is_published = true
    )
  );

-- Policies for public.assessment_question_answers
-- STRICT SECURITY: NO SELECT / INSERT / UPDATE / DELETE POLICY FOR AUTHENTICATED OR ANON.
-- Only backend operations using service_role or database admin bypass RLS to read answers.
-- Client attempts to select from assessment_question_answers will return 0 rows.

-- Policies for public.assessment_attempts
drop policy if exists "Users can read own attempts" on public.assessment_attempts;
create policy "Users can read own attempts"
  on public.assessment_attempts for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own attempts" on public.assessment_attempts;
create policy "Users can insert own attempts"
  on public.assessment_attempts for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own in-progress attempts" on public.assessment_attempts;
create policy "Users can update own in-progress attempts"
  on public.assessment_attempts for update
  using (auth.uid() = user_id and status = 'in_progress')
  with check (auth.uid() = user_id);

-- Policies for public.assessment_answers
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
    exists (
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
    exists (
      select 1 from public.assessment_attempts a
      where a.id = assessment_answers.attempt_id 
        and a.user_id = auth.uid() 
        and a.status = 'in_progress'
    )
  );

-- Policies for public.assessment_results
drop policy if exists "Users can read own results" on public.assessment_results;
create policy "Users can read own results"
  on public.assessment_results for select
  using (auth.uid() = user_id);

-- Policies for public.learner_skill_profiles
drop policy if exists "Users can read own skill profiles" on public.learner_skill_profiles;
create policy "Users can read own skill profiles"
  on public.learner_skill_profiles for select
  using (auth.uid() = user_id);

-- ==============================================================================
-- 9. Table and Function Permissions (Grants)
-- ==============================================================================

grant select on table public.assessments to authenticated, anon;
grant select on table public.assessment_questions to authenticated, anon;

grant select, insert, update on table public.assessment_attempts to authenticated;
grant select, insert, update on table public.assessment_answers to authenticated;
grant select on table public.assessment_results to authenticated;
grant select on table public.learner_skill_profiles to authenticated;

-- Service role has full permissions for backend scoring and administrative tasks
grant all on table public.assessments to service_role;
grant all on table public.assessment_questions to service_role;
grant all on table public.assessment_question_answers to service_role;
grant all on table public.assessment_attempts to service_role;
grant all on table public.assessment_answers to service_role;
grant all on table public.assessment_results to service_role;
grant all on table public.learner_skill_profiles to service_role;

-- ==============================================================================
-- 10. Seed Data: Placement Test Question Bank
-- ==============================================================================

do $$
declare
  v_assessment_id uuid;
  v_q1 uuid := '11111111-0000-0000-0000-000000000001'::uuid;
  v_q2 uuid := '11111111-0000-0000-0000-000000000002'::uuid;
  v_q3 uuid := '11111111-0000-0000-0000-000000000003'::uuid;
  v_q4 uuid := '11111111-0000-0000-0000-000000000004'::uuid;
  v_q5 uuid := '11111111-0000-0000-0000-000000000005'::uuid;
  v_q6 uuid := '11111111-0000-0000-0000-000000000006'::uuid;
  v_q7 uuid := '11111111-0000-0000-0000-000000000007'::uuid;
  v_q8 uuid := '11111111-0000-0000-0000-000000000008'::uuid;
  v_q9 uuid := '11111111-0000-0000-0000-000000000009'::uuid;
  v_q10 uuid := '11111111-0000-0000-0000-000000000010'::uuid;
  v_q11 uuid := '11111111-0000-0000-0000-000000000011'::uuid;
  v_q12 uuid := '11111111-0000-0000-0000-000000000012'::uuid;
  v_q13 uuid := '11111111-0000-0000-0000-000000000013'::uuid;
  v_q14 uuid := '11111111-0000-0000-0000-000000000014'::uuid;
  v_q15 uuid := '11111111-0000-0000-0000-000000000015'::uuid;
  v_q16 uuid := '11111111-0000-0000-0000-000000000016'::uuid;
begin
  -- Insert Placement Test Assessment
  insert into public.assessments (
    slug, title, description, assessment_type, time_limit_seconds, total_questions, is_published, version
  )
  values (
    'placement-test',
    'Bài đánh giá trình độ tiếng Anh đầu vào',
    'Bài kiểm tra 16 câu hỏi đo lường 4 kỹ năng: Từ vựng, Ngữ pháp, Đọc hiểu và Nghe hiểu/Hội thoại để xác định trình độ CEFR ước tính.',
    'placement',
    1500, -- 25 minutes
    16,
    true,
    1
  )
  on conflict (slug) do update set
    title = excluded.title,
    description = excluded.description,
    total_questions = excluded.total_questions,
    is_published = excluded.is_published
  returning id into v_assessment_id;

  -- 1. Vocabulary Questions (1..4)
  insert into public.assessment_questions (
    id, assessment_id, skill, category, difficulty, level, question_type, prompt, context_text, options, position, weight
  ) values
  (
    v_q1, v_assessment_id, 'vocabulary', 'occupations', 1, 'a1', 'multiple_choice',
    'She works at a hospital and takes care of sick patients. She is a ______.',
    null,
    '[{"id":"A","text":"nurse"},{"id":"B","text":"chef"},{"id":"C","text":"pilot"},{"id":"D","text":"mechanic"}]'::jsonb,
    1, 1.0
  ),
  (
    v_q2, v_assessment_id, 'vocabulary', 'phrasal_verbs', 2, 'a2', 'multiple_choice',
    'Could you please ______ the lights before leaving the meeting room?',
    null,
    '[{"id":"A","text":"turn on"},{"id":"B","text":"turn off"},{"id":"C","text":"look after"},{"id":"D","text":"give up"}]'::jsonb,
    2, 1.0
  ),
  (
    v_q3, v_assessment_id, 'vocabulary', 'business_context', 3, 'b1', 'multiple_choice',
    'The director decided to ______ the product launch until next month due to supply delays.',
    null,
    '[{"id":"A","text":"postpone"},{"id":"B","text":"accelerate"},{"id":"C","text":"maintain"},{"id":"D","text":"predict"}]'::jsonb,
    3, 1.0
  ),
  (
    v_q4, v_assessment_id, 'vocabulary', 'academic_verbs', 4, 'b2', 'multiple_choice',
    'Despite facing severe budget constraints, the engineering team managed to ______ an effective solution.',
    null,
    '[{"id":"A","text":"devise"},{"id":"B","text":"deteriorate"},{"id":"C","text":"disregard"},{"id":"D","text":"diminish"}]'::jsonb,
    4, 1.0
  )
  on conflict (id) do update set
    prompt = excluded.prompt,
    options = excluded.options,
    position = excluded.position;

  -- 2. Grammar Questions (5..8)
  insert into public.assessment_questions (
    id, assessment_id, skill, category, difficulty, level, question_type, prompt, context_text, options, position, weight
  ) values
  (
    v_q5, v_assessment_id, 'grammar', 'past_simple', 1, 'a1', 'multiple_choice',
    'Yesterday, my family and I ______ to the city center and visited the science museum.',
    null,
    '[{"id":"A","text":"go"},{"id":"B","text":"went"},{"id":"C","text":"going"},{"id":"D","text":"goes"}]'::jsonb,
    5, 1.0
  ),
  (
    v_q6, v_assessment_id, 'grammar', 'first_conditional', 2, 'a2', 'multiple_choice',
    'If the weather ______ nice this weekend, we will go camping in the national park.',
    null,
    '[{"id":"A","text":"is"},{"id":"B","text":"will be"},{"id":"C","text":"was"},{"id":"D","text":"being"}]'::jsonb,
    6, 1.0
  ),
  (
    v_q7, v_assessment_id, 'grammar', 'present_perfect_since', 3, 'b1', 'multiple_choice',
    'David has been living and working in Da Nang ______ he graduated from university.',
    null,
    '[{"id":"A","text":"for"},{"id":"B","text":"since"},{"id":"C","text":"while"},{"id":"D","text":"during"}]'::jsonb,
    7, 1.0
  ),
  (
    v_q8, v_assessment_id, 'grammar', 'third_conditional_inversion', 4, 'b2', 'multiple_choice',
    'Had the flight team received the weather warning earlier, they ______ a different route.',
    null,
    '[{"id":"A","text":"will choose"},{"id":"B","text":"would have chosen"},{"id":"C","text":"had chosen"},{"id":"D","text":"chose"}]'::jsonb,
    8, 1.0
  )
  on conflict (id) do update set
    prompt = excluded.prompt,
    options = excluded.options,
    position = excluded.position;

  -- 3. Reading Questions (9..12)
  insert into public.assessment_questions (
    id, assessment_id, skill, category, difficulty, level, question_type, prompt, context_text, options, position, weight
  ) values
  (
    v_q9, v_assessment_id, 'reading', 'factual_understanding', 2, 'a2', 'multiple_choice',
    'According to the library announcement, what must visitors present before borrowing books?',
    'Greenfield Community Library is open Monday to Saturday from 8:00 AM to 7:00 PM. All registered members may borrow up to five books for three weeks. To borrow materials, patrons must present a valid member card at the front desk. Late returns are subject to a fee of $0.50 per day.',
    '[{"id":"A","text":"A valid member card"},{"id":"B","text":"A cash deposit of $50"},{"id":"C","text":"A letter from their school"},{"id":"D","text":"Their national passport"}]'::jsonb,
    9, 1.0
  ),
  (
    v_q10, v_assessment_id, 'reading', 'detail_extraction', 3, 'b1', 'multiple_choice',
    'What happens if a borrowed book is returned past the three-week borrowing window?',
    'Greenfield Community Library is open Monday to Saturday from 8:00 AM to 7:00 PM. All registered members may borrow up to five books for three weeks. To borrow materials, patrons must present a valid member card at the front desk. Late returns are subject to a fee of $0.50 per day.',
    '[{"id":"A","text":"The membership is immediately cancelled."},{"id":"B","text":"A daily late fee of $0.50 is applied."},{"id":"C","text":"The patron must purchase a replacement copy."},{"id":"D","text":"The library closes early on Saturdays."}]'::jsonb,
    10, 1.0
  ),
  (
    v_q11, v_assessment_id, 'reading', 'main_idea', 3, 'b1', 'multiple_choice',
    'What is described as the primary benefit of flexible work arrangements in the excerpt?',
    'Recent workplace studies demonstrate that flexible work schedules significantly enhance employee satisfaction. By eliminating lengthy daily commutes, workers report lower stress levels and increased focus during peak productivity hours. However, experts stress that clear communication channels are essential to prevent isolation.',
    '[{"id":"A","text":"Saving money on corporate office catering."},{"id":"B","text":"Eliminating stressful commutes and improving focus."},{"id":"C","text":"Allowing employees to avoid speaking with colleagues."},{"id":"D","text":"Completely removing project deadlines."}]'::jsonb,
    11, 1.0
  ),
  (
    v_q12, v_assessment_id, 'reading', 'inference', 4, 'b2', 'multiple_choice',
    'What do experts emphasize to ensure flexible work arrangements remain effective?',
    'Recent workplace studies demonstrate that flexible work schedules significantly enhance employee satisfaction. By eliminating lengthy daily commutes, workers report lower stress levels and increased focus during peak productivity hours. However, experts stress that clear communication channels are essential to prevent isolation.',
    '[{"id":"A","text":"Relying solely on in-person monthly evaluations."},{"id":"B","text":"Establishing robust and clear communication channels."},{"id":"C","text":"Restricting work hours strictly to standard morning shifts."},{"id":"D","text":"Banning asynchronous collaboration tools."}]'::jsonb,
    12, 1.0
  )
  on conflict (id) do update set
    prompt = excluded.prompt,
    options = excluded.options,
    position = excluded.position;

  -- 4. Listening & Spoken Dialogue Questions (13..16)
  insert into public.assessment_questions (
    id, assessment_id, skill, category, difficulty, level, question_type, prompt, context_text, options, position, weight
  ) values
  (
    v_q13, v_assessment_id, 'listening', 'daily_interaction', 1, 'a1', 'multiple_choice',
    'Which response is the most natural reply for the barista to make?',
    'Customer: "Hi, could I get a medium hot latte with oat milk, please?"
Barista: "Certainly! ______"',
    '[{"id":"A","text":"Would you like any pastry with that today?"},{"id":"B","text":"Yes, I am twenty years old."},{"id":"C","text":"It is raining outside right now."},{"id":"D","text":"Where did you leave your luggage?"}]'::jsonb,
    13, 1.0
  ),
  (
    v_q14, v_assessment_id, 'listening', 'transactional_dialogue', 2, 'a2', 'multiple_choice',
    'How should the barista ask the customer for their payment preference?',
    'Customer: "That will be all, thank you. How much is it?"
Barista: "That comes to $4.75. ______?"
Customer: "I will pay with my credit card, please."',
    '[{"id":"A","text":"How would you like to pay"},{"id":"B","text":"Why are you ordering this"},{"id":"C","text":"Where is your office located"},{"id":"D","text":"When do you want to drink it"}]'::jsonb,
    14, 1.0
  ),
  (
    v_q15, v_assessment_id, 'listening', 'workplace_collaboration', 3, 'b1', 'multiple_choice',
    'What is the most constructive response from Mark to resolve the project delay?',
    'Emma: "We need to finalize the presentation deck before 4:00 PM, but two team members have not sent their slides yet."
Mark: "______"',
    '[{"id":"A","text":"I will give them a quick call now to see if they need help finishing."},{"id":"B","text":"Let us cancel the entire client contract immediately."},{"id":"C","text":"I do not think presentations are ever necessary."},{"id":"D","text":"The slides were deleted last year."}]'::jsonb,
    15, 1.0
  ),
  (
    v_q16, v_assessment_id, 'listening', 'professional_nuance', 4, 'b2', 'multiple_choice',
    'Which reply best demonstrates professional tact and constructive communication?',
    'Colleague A: "The client asked for three additional features that were not part of our agreed project scope."
Colleague B: "______"',
    '[{"id":"A","text":"We should prepare a brief estimate of the extra timeline and discuss budget adjustments with them."},{"id":"B","text":"Let us ignore their message and pretend we never received the email."},{"id":"C","text":"Tell them that feature requests are strictly forbidden under any circumstances."},{"id":"D","text":"We can just build everything for free overnight without testing."}]'::jsonb,
    16, 1.0
  )
  on conflict (id) do update set
    prompt = excluded.prompt,
    options = excluded.options,
    position = excluded.position;

  -- 5. Insert Official Private Answer Keys into assessment_question_answers
  insert into public.assessment_question_answers (
    question_id, correct_option_id, explanation
  ) values
  (
    v_q1, 'A',
    'Trong ngữ cảnh bệnh viện ("hospital") và chăm sóc bệnh nhân ("takes care of sick patients"), danh từ chính xác là "nurse" (y tá/điều dưỡng).'
  ),
  (
    v_q2, 'B',
    'Cụm động từ "turn off" có nghĩa là tắt (thiết bị điện, đèn). Ngữ cảnh "before leaving" yêu cầu tắt đèn trước khi rời phòng họp.'
  ),
  (
    v_q3, 'A',
    'Động từ "postpone" nghĩa là hoãn lại (đến một thời điểm sau). Các từ khác không phù hợp: accelerate (tăng tốc), maintain (duy trì), predict (dự đoán).'
  ),
  (
    v_q4, 'A',
    'Động từ "devise" nghĩa là phát minh, nghĩ ra (một giải pháp/kế hoạch). Phù hợp với cụm "devise an effective solution". Các từ khác mang nghĩa tiêu cực: deteriorate (xấu đi), diminish (giảm bớt).'
  ),
  (
    v_q5, 'B',
    'Dấu hiệu thời gian "Yesterday" chỉ hành động xảy ra trong quá khứ đơn, dạng quá khứ của động từ bất quy tắc "go" là "went".'
  ),
  (
    v_q6, 'A',
    'Mệnh đề điều kiện loại 1 (First Conditional) chỉ tình huống có thể xảy ra ở hiện tại/tương lai: If + S + V(hiện tại đơn), S + will + V-inf. Chủ ngữ số ít "the weather" đi với "is".'
  ),
  (
    v_q7, 'B',
    'Trong thì hiện tại hoàn thành tiếp diễn ("has been living"), ta dùng "since" đi kèm với mốc thời gian ("he graduated" - khi anh ấy tốt nghiệp).'
  ),
  (
    v_q8, 'B',
    'Cấu trúc đảo ngữ câu điều kiện loại 3 (Third Conditional Inversion): "Had + S + V3/ed, S + would have + V3/ed" diễn tả giả định trái ngược với quá khứ. Đáp án đúng là "would have chosen".'
  ),
  (
    v_q9, 'A',
    'Theo bài đọc: "To borrow materials, patrons must present a valid member card at the front desk", độc giả cần xuất trình thẻ thành viên hợp lệ.'
  ),
  (
    v_q10, 'B',
    'Theo đoạn văn: "Late returns are subject to a fee of $0.50 per day", việc trả sách trễ hạn sẽ bị tính phí 0.50 USD mỗi ngày.'
  ),
  (
    v_q11, 'B',
    'Đoạn văn nêu rõ lợi ích: "By eliminating lengthy daily commutes, workers report lower stress levels and increased focus during peak productivity hours".'
  ),
  (
    v_q12, 'B',
    'Đoạn văn nhấn mạnh: "However, experts stress that clear communication channels are essential to prevent isolation" (kênh giao tiếp rõ ràng là điều cốt lõi).'
  ),
  (
    v_q13, 'A',
    'Khi khách gọi đồ uống, câu phản hồi lịch sự và tự nhiên nhất của nhân viên thu ngân/pha chế là gợi ý dùng kèm đồ ăn nhẹ ("Would you like any pastry with that today?").'
  ),
  (
    v_q14, 'A',
    'Khi thông báo tổng tiền, nhân viên hỏi phương thức thanh toán bằng câu tiêu chuẩn: "How would you like to pay?" trước khi khách chọn thẻ hay tiền mặt.'
  ),
  (
    v_q15, 'A',
    'Giải pháp phối hợp công việc chuyên nghiệp và xây dựng nhất khi cận kề deadline là chủ động liên hệ hỗ trợ đồng nghiệp: "I will give them a quick call now to see if they need help finishing".'
  ),
  (
    v_q16, 'A',
    'Khi khách hàng yêu cầu thêm tính năng ngoài phạm vi hợp đồng (scope creep), cách xử lý chuẩn mực là ước tính tác động đến tiến độ và thương lượng điều chỉnh chi phí/ngân sách phù hợp.'
  )
  on conflict (question_id) do update set
    correct_option_id = excluded.correct_option_id,
    explanation = excluded.explanation;

end;
$$;
