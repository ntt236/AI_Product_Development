-- ==============================================================================
-- Migration: 20261019_phase_5_listening_sample.sql
-- Description: Triển khai bài Listening mẫu có thể học thực tế:
--              "Daily Conversations — Introducing Yourself"
-- Scope:       Hoàn thiện bổ sung cho Learning Path và Daily Plan.
--              Không thay đổi thứ tự và phạm vi chính thức của roadmap.
-- ==============================================================================

-- 1. Insert or update Content Item for Listening lesson
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
  '11111111-1111-4111-a111-000000000003'::uuid,
  'listening-daily-conversations-introducing-yourself',
  'Luyện nghe Hội thoại chào hỏi và Hỏi thông tin cá nhân (Introducing Yourself)',
  'Luyện nghe đoạn hội thoại giới thiệu bản thân giữa David và Sarah, nhận diện thông tin cá nhân, nơi chốn và sở thích qua các câu hỏi trắc nghiệm.',
  'listening',
  'listening',
  'a1',
  20,
  '{
    "overview": "Nghe hiểu cuộc hội thoại giới thiệu bản thân tự nhiên giữa 2 người bạn mới quen; nắm bắt các thông tin cốt lõi gồm tên gọi, nơi sinh/quê quán, nơi ở hiện tại và sở thích cá nhân.",
    "audio_url": "/audio/daily-conversations-introducing-yourself.wav",
    "audio_duration_seconds": 38,
    "tips": [
      "Lắng nghe các cấu trúc bắt đầu câu như \"My name is...\", \"I am originally from...\", \"I currently live in...\".",
      "Chú ý phân biệt giữa nơi sinh (born in), quê gốc (originally from) và nơi ở hiện tại (currently live in).",
      "Để ý các từ khóa chỉ sở thích: \"reading novels\", \"photography\", \"playing acoustic guitar\", \"cooking Italian food\"."
    ],
    "dialogue": [
      {
        "speaker": "David",
        "text": "Hello! My name is David. It is very nice to meet you.",
        "translation_vi": "Xin chào! Tôi tên là David. Rất vui được gặp bạn."
      },
      {
        "speaker": "Sarah",
        "text": "Hi David! I am Sarah. Nice to meet you too.",
        "translation_vi": "Chào David! Tôi là Sarah. Rất vui được gặp bạn."
      },
      {
        "speaker": "David",
        "text": "Where are you from, Sarah?",
        "translation_vi": "Bạn đến từ đâu vậy, Sarah?"
      },
      {
        "speaker": "Sarah",
        "text": "I am originally from Chicago, but I currently live in New York. How about you?",
        "translation_vi": "Tôi quê gốc ở Chicago, nhưng hiện tại tôi đang sống ở New York. Còn bạn thì sao?"
      },
      {
        "speaker": "David",
        "text": "I was born in London, but I moved to New York two years ago for work. What do you like to do in your free time?",
        "translation_vi": "Tôi sinh ra ở London, nhưng tôi đã chuyển đến New York cách đây hai năm để làm việc. Bạn thích làm gì trong thời gian rảnh rỗi?"
      },
      {
        "speaker": "Sarah",
        "text": "I love reading novels and doing photography on weekends. And you, David?",
        "translation_vi": "Tôi rất thích đọc tiểu thuyết và chụp ảnh vào dịp cuối tuần. Còn bạn thì sao, David?"
      },
      {
        "speaker": "David",
        "text": "In my free time, I really enjoy playing acoustic guitar and cooking Italian food. It was great talking with you, Sarah!",
        "translation_vi": "Vào thời gian rảnh, tôi rất thích chơi đàn acoustic guitar và nấu món ăn Ý. Thật tuyệt khi được trò chuyện cùng bạn, Sarah!"
      },
      {
        "speaker": "Sarah",
        "text": "Great talking with you too, David! Have a wonderful day!",
        "translation_vi": "Tôi cũng rất vui khi được trò chuyện với bạn, David! Chúc bạn một ngày tuyệt vời nhé!"
      }
    ],
    "transcript": "David: Hello! My name is David. It is very nice to meet you.\nSarah: Hi David! I am Sarah. Nice to meet you too.\nDavid: Where are you from, Sarah?\nSarah: I am originally from Chicago, but I currently live in New York. How about you?\nDavid: I was born in London, but I moved to New York two years ago for work. What do you like to do in your free time?\nSarah: I love reading novels and doing photography on weekends. And you, David?\nDavid: In my free time, I really enjoy playing acoustic guitar and cooking Italian food. It was great talking with you, Sarah!\nSarah: Great talking with you too, David! Have a wonderful day!"
  }'::jsonb,
  true
) on conflict (slug) do update set
  title = excluded.title,
  description = excluded.description,
  content_type = excluded.content_type,
  skill = excluded.skill,
  level = excluded.level,
  estimated_minutes = excluded.estimated_minutes,
  body = excluded.body,
  is_published = excluded.is_published,
  updated_at = now();

-- 2. Practice Exercises for Listening Lesson
-- Exercise 1: David's birthplace
insert into public.practice_exercises (
  id,
  content_item_id,
  exercise_type,
  prompt,
  context_text,
  options,
  position,
  weight
) values (
  '11111111-2222-4111-a111-000000000011'::uuid,
  '11111111-1111-4111-a111-000000000003'::uuid,
  'multiple_choice',
  'David sinh ra ở thành phố nào?',
  'Nghe kỹ lời giới thiệu của David về nơi sinh và lý do chuyển đi.',
  '[
    {"id": "opt_3a", "text": "London"},
    {"id": "opt_3b", "text": "New York"},
    {"id": "opt_3c", "text": "Chicago"},
    {"id": "opt_3d", "text": "Los Angeles"}
  ]'::jsonb,
  1,
  1.0
) on conflict (content_item_id, position) do update set
  prompt = excluded.prompt,
  context_text = excluded.context_text,
  options = excluded.options,
  weight = excluded.weight;

insert into public.practice_exercise_answers (
  exercise_id,
  correct_option_id,
  explanation
) values (
  '11111111-2222-4111-a111-000000000011'::uuid,
  'opt_3a',
  'Trong đoạn hội thoại, David nói: "I was born in London, but I moved to New York two years ago for work." Vì vậy, nơi David sinh ra là London.'
) on conflict (exercise_id) do update set
  correct_option_id = excluded.correct_option_id,
  explanation = excluded.explanation;

-- Exercise 2: Sarah's hometown
insert into public.practice_exercises (
  id,
  content_item_id,
  exercise_type,
  prompt,
  context_text,
  options,
  position,
  weight
) values (
  '11111111-2222-4111-a111-000000000012'::uuid,
  '11111111-1111-4111-a111-000000000003'::uuid,
  'multiple_choice',
  'Quê gốc (nơi xuất thân ban đầu) của Sarah ở đâu?',
  'Chú ý cụm từ "originally from" trong câu trả lời của Sarah.',
  '[
    {"id": "opt_4a", "text": "New York"},
    {"id": "opt_4b", "text": "Chicago"},
    {"id": "opt_4c", "text": "Boston"},
    {"id": "opt_4d", "text": "London"}
  ]'::jsonb,
  2,
  1.0
) on conflict (content_item_id, position) do update set
  prompt = excluded.prompt,
  context_text = excluded.context_text,
  options = excluded.options,
  weight = excluded.weight;

insert into public.practice_exercise_answers (
  exercise_id,
  correct_option_id,
  explanation
) values (
  '11111111-2222-4111-a111-000000000012'::uuid,
  'opt_4b',
  'Sarah nói rõ: "I am originally from Chicago, but I currently live in New York." Cụm từ "originally from" chỉ nơi xuất thân ban đầu (quê quán) là Chicago.'
) on conflict (exercise_id) do update set
  correct_option_id = excluded.correct_option_id,
  explanation = excluded.explanation;

-- Exercise 3: Current residence of both speakers
insert into public.practice_exercises (
  id,
  content_item_id,
  exercise_type,
  prompt,
  context_text,
  options,
  position,
  weight
) values (
  '11111111-2222-4111-a111-000000000013'::uuid,
  '11111111-1111-4111-a111-000000000003'::uuid,
  'multiple_choice',
  'Hiện tại cả David và Sarah đều đang sinh sống tại thành phố nào?',
  'So sánh nơi ở hiện tại của cả hai nhân vật được đề cập trong cuộc trò chuyện.',
  '[
    {"id": "opt_5a", "text": "London"},
    {"id": "opt_5b", "text": "Chicago"},
    {"id": "opt_5c", "text": "New York"},
    {"id": "opt_5d", "text": "Seattle"}
  ]'::jsonb,
  3,
  1.0
) on conflict (content_item_id, position) do update set
  prompt = excluded.prompt,
  context_text = excluded.context_text,
  options = excluded.options,
  weight = excluded.weight;

insert into public.practice_exercise_answers (
  exercise_id,
  correct_option_id,
  explanation
) values (
  '11111111-2222-4111-a111-000000000013'::uuid,
  'opt_5c',
  'Sarah cho biết: "I currently live in New York", và David cũng cho biết: "I moved to New York two years ago for work." Như vậy cả hai hiện tại đều đang sinh sống tại New York.'
) on conflict (exercise_id) do update set
  correct_option_id = excluded.correct_option_id,
  explanation = excluded.explanation;

-- Exercise 4: Sarah's hobbies
insert into public.practice_exercises (
  id,
  content_item_id,
  exercise_type,
  prompt,
  context_text,
  options,
  position,
  weight
) values (
  '11111111-2222-4111-a111-000000000014'::uuid,
  '11111111-1111-4111-a111-000000000003'::uuid,
  'multiple_choice',
  'Sarah thích làm gì vào thời gian rảnh rỗi hoặc cuối tuần?',
  'Nghe câu trả lời của Sarah khi David hỏi: "What do you like to do in your free time?"',
  '[
    {"id": "opt_6a", "text": "Nấu món Ý và làm vườn"},
    {"id": "opt_6b", "text": "Chơi đàn guitar và nghe nhạc"},
    {"id": "opt_6c", "text": "Đọc tiểu thuyết và chụp ảnh"},
    {"id": "opt_6d", "text": "Đi du lịch và leo núi"}
  ]'::jsonb,
  4,
  1.0
) on conflict (content_item_id, position) do update set
  prompt = excluded.prompt,
  context_text = excluded.context_text,
  options = excluded.options,
  weight = excluded.weight;

insert into public.practice_exercise_answers (
  exercise_id,
  correct_option_id,
  explanation
) values (
  '11111111-2222-4111-a111-000000000014'::uuid,
  'opt_6c',
  'Sarah trả lời: "I love reading novels and doing photography on weekends." (Đọc tiểu thuyết và chụp ảnh vào cuối tuần).'
) on conflict (exercise_id) do update set
  correct_option_id = excluded.correct_option_id,
  explanation = excluded.explanation;

-- Exercise 5: David's hobbies
insert into public.practice_exercises (
  id,
  content_item_id,
  exercise_type,
  prompt,
  context_text,
  options,
  position,
  weight
) values (
  '11111111-2222-4111-a111-000000000015'::uuid,
  '11111111-1111-4111-a111-000000000003'::uuid,
  'multiple_choice',
  'David có sở thích nào sau đây trong thời gian rảnh rỗi?',
  'Nghe câu trả lời của David sau khi Sarah hỏi lại: "And you, David?"',
  '[
    {"id": "opt_7a", "text": "Chơi đàn acoustic guitar và nấu món Ý"},
    {"id": "opt_7b", "text": "Chơi piano và vẽ tranh"},
    {"id": "opt_7c", "text": "Đi bơi và xem phim điện ảnh"},
    {"id": "opt_7d", "text": "Đọc sách lịch sử và chạy bộ"}
  ]'::jsonb,
  5,
  1.0
) on conflict (content_item_id, position) do update set
  prompt = excluded.prompt,
  context_text = excluded.context_text,
  options = excluded.options,
  weight = excluded.weight;

insert into public.practice_exercise_answers (
  exercise_id,
  correct_option_id,
  explanation
) values (
  '11111111-2222-4111-a111-000000000015'::uuid,
  'opt_7a',
  'David chia sẻ: "In my free time, I really enjoy playing acoustic guitar and cooking Italian food." (Chơi đàn acoustic guitar và nấu món ăn Ý).'
) on conflict (exercise_id) do update set
  correct_option_id = excluded.correct_option_id,
  explanation = excluded.explanation;

-- 3. Synchronize existing learning_path_items matching this topic to 'available'
update public.learning_path_items
set
  content_status = 'available',
  metadata = coalesce(metadata, '{}'::jsonb) || '{"content_item_slug": "listening-daily-conversations-introducing-yourself"}'::jsonb,
  updated_at = now()
where skill = 'listening'
  and (
    title ilike '%chào hỏi%' or
    title ilike '%thông tin cá nhân%' or
    title ilike '%introducing%'
  );
