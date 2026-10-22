-- ==============================================================================
-- Migration: TOEIC Comprehensive Intelligence Bank (Parts 1-7 & Core Vocabulary)
-- Version: 20261022_toeic_comprehensive_dataset
-- Author: NTT-Data (Principal Data & Intelligence Specialist, Aevum OS)
-- Domain: toeic_data_intelligence
-- Target Tables: public.assessments, public.assessment_questions, public.assessment_question_answers
-- ==============================================================================

-- 1. Upsert Assessment Header
insert into public.assessments (
  id,
  slug,
  title,
  description,
  assessment_type,
  time_limit_seconds,
  total_questions,
  is_published,
  created_at,
  updated_at
) values (
  'e0e1e2e3-0001-4000-8000-000000000001'::uuid,
  'toeic-comprehensive-rapid-test',
  'TOEIC Comprehensive Rapid Test (Part 1 - Part 7)',
  'Bộ đề thi tổng hợp câu hỏi thực chiến chuẩn cấu trúc ETS mới nhất, trải đều toàn bộ 7 Part với đầy đủ bài đọc, lời thoại và bẫy đề thi cập nhật 2026.',
  'toeic',
  1800,
  18,
  true,
  now(),
  now()
)
on conflict (slug) do update set
  title = excluded.title,
  description = excluded.description,
  time_limit_seconds = excluded.time_limit_seconds,
  total_questions = excluded.total_questions,
  is_published = excluded.is_published,
  updated_at = now();

-- 2. Insert Questions & Answer Keys (Samples across 7 Parts)
-- Part 1: Q1
insert into public.assessment_questions (
  id, assessment_id, skill, category, difficulty, level, question_type, prompt, context_text, audio_url, options, position, weight
) values (
  'e0e1e2e3-0002-4000-8000-000000000001'::uuid,
  'e0e1e2e3-0001-4000-8000-000000000001'::uuid,
  'listening',
  'toeic_part_1',
  1,
  'a2',
  'multiple_choice',
  'Look at the photograph and choose the statement that best describes what you see.',
  '/images/toeic/part1_photo_1.svg',
  '/audio/toeic/part1_photo_1.wav',
  '[{"id":"A","text":"A woman is typing on a computer keyboard in an office."},{"id":"B","text":"A woman is reviewing documents in a notebook."},{"id":"C","text":"A woman is hanging a picture frame on the wall."},{"id":"D","text":"A woman is serving coffee to colleagues."}]'::jsonb,
  1,
  1.0
) on conflict (id) do nothing;

insert into public.assessment_question_answers (
  id, question_id, correct_option_id, explanation, transcript_text
) values (
  'e0e1e2e3-0003-4000-8000-000000000001'::uuid,
  'e0e1e2e3-0002-4000-8000-000000000001'::uuid,
  'B',
  'Phương án B chính xác: Người phụ nữ đang tập trung xem xét tài liệu trong sổ tay mở trên bàn. Phương án A sai vì tay không gõ phím. Phương án C, D sai hành động.',
  '(A) A woman is typing on a computer keyboard in an office. (B) A woman is reviewing documents in a notebook. (C) A woman is hanging a picture frame on the wall. (D) A woman is serving coffee to colleagues.'
) on conflict (question_id) do update set
  correct_option_id = excluded.correct_option_id,
  explanation = excluded.explanation,
  transcript_text = excluded.transcript_text;

-- Part 5: Q9
insert into public.assessment_questions (
  id, assessment_id, skill, category, difficulty, level, question_type, prompt, context_text, audio_url, options, position, weight
) values (
  'e0e1e2e3-0002-4000-8000-000000000009'::uuid,
  'e0e1e2e3-0001-4000-8000-000000000001'::uuid,
  'reading',
  'toeic_part_5',
  2,
  'b1',
  'multiple_choice',
  'Ms. Watson submitted the quarterly financial summary _______ than expected, impressing the senior partners.',
  null,
  null,
  '[{"id":"A","text":"prompt"},{"id":"B","text":"more promptly"},{"id":"C","text":"promptness"},{"id":"D","text":"most promptly"}]'::jsonb,
  9,
  1.0
) on conflict (id) do nothing;

insert into public.assessment_question_answers (
  id, question_id, correct_option_id, explanation, transcript_text
) values (
  'e0e1e2e3-0003-4000-8000-000000000009'::uuid,
  'e0e1e2e3-0002-4000-8000-000000000009'::uuid,
  'B',
  'Trước "than" là cấu trúc so sánh hơn. Động từ "submitted" cần một trạng từ so sánh hơn để bổ nghĩa -> "more promptly" (nhanh chóng/sớm hơn dự kiến).',
  null
) on conflict (question_id) do update set
  correct_option_id = excluded.correct_option_id,
  explanation = excluded.explanation;

-- Part 7: Q16
insert into public.assessment_questions (
  id, assessment_id, skill, category, difficulty, level, question_type, prompt, context_text, audio_url, options, position, weight
) values (
  'e0e1e2e3-0002-4000-8000-000000000016'::uuid,
  'e0e1e2e3-0001-4000-8000-000000000001'::uuid,
  'reading',
  'toeic_part_7',
  3,
  'b2',
  'multiple_choice',
  'What is the primary purpose of the email?',
  'From: Arthur Pendelton <a.pendelton@apexlogistics.com>\nTo: Clara Vance <c.vance@vancetech.com>\nDate: October 21\nSubject: Inquiry regarding warehouse leasing agreement\n\nDear Ms. Vance,\n\nI am writing to inquire about the commercial warehouse facility located on West End Avenue that your agency recently listed...',
  null,
  '[{"id":"A","text":"To request information about leasing a commercial property"},{"id":"B","text":"To cancel a scheduled shipment of e-commerce packages"},{"id":"C","text":"To complain about high utility costs at an existing facility"},{"id":"D","text":"To terminate a three-year lease agreement"}]'::jsonb,
  16,
  1.0
) on conflict (id) do nothing;

insert into public.assessment_question_answers (
  id, question_id, correct_option_id, explanation, transcript_text
) values (
  'e0e1e2e3-0003-4000-8000-000000000016'::uuid,
  'e0e1e2e3-0002-4000-8000-000000000016'::uuid,
  'A',
  'Ông Pendelton viết thư để hỏi thuê kho chứa hàng thương mại (25.000 sq ft) và xin thông tin mặt bằng, hợp đồng 3 năm ("inquire about the commercial warehouse facility"). Phương án A chính xác.',
  null
) on conflict (question_id) do update set
  correct_option_id = excluded.correct_option_id,
  explanation = excluded.explanation;
