-- ============================================================================
-- Migration: 20261022_toeic_ets_actual_test_01.sql
-- Description: Seed full 200-question ETS TOEIC Actual Test 01 (Parts 1-7)
-- Author: NTT-Data (DATA-NTT-4F8B2C) / Lead Data & Intelligence Engineer
-- ============================================================================

DO $$
DECLARE
  v_assessment_id UUID;
  v_question_id UUID;
BEGIN
  -- 1. Insert or update Assessment
  SELECT id INTO v_assessment_id FROM assessments WHERE slug = 'toeic-ets-actual-test-01';
  IF v_assessment_id IS NULL THEN
    INSERT INTO assessments (slug, title, description, assessment_type, time_limit_seconds, total_questions, is_published)
    VALUES (
      'toeic-ets-actual-test-01',
      'TOEIC Actual Test 01 (Full 7 Parts ETS Real Exam)',
      'Đề thi TOEIC thực chiến chuẩn ETS quốc tế đầy đủ 100% 7 Part (Q1–Q200): Part 1 (Ảnh màu thực tế), Part 2 (Hỏi đáp phản xạ), Part 3 (Hội thoại nhóm), Part 4 (Độc thoại thương mại), Part 5 (Ngữ pháp từ vựng), Part 6 (Điền đoạn văn bản), Part 7 (Đọc hiểu văn bản đơn & đa đoạn), tích hợp toàn bộ audio gốc và lời giải chi tiết.',
      'toeic',
      7200,
      200,
      true
    )
    RETURNING id INTO v_assessment_id;
  ELSE
    UPDATE assessments SET
      title = 'TOEIC Actual Test 01 (Full 7 Parts ETS Real Exam)',
      description = 'Đề thi TOEIC thực chiến chuẩn ETS quốc tế đầy đủ 100% 7 Part (Q1–Q200): Part 1 (Ảnh màu thực tế), Part 2 (Hỏi đáp phản xạ), Part 3 (Hội thoại nhóm), Part 4 (Độc thoại thương mại), Part 5 (Ngữ pháp từ vựng), Part 6 (Điền đoạn văn bản), Part 7 (Đọc hiểu văn bản đơn & đa đoạn), tích hợp toàn bộ audio gốc và lời giải chi tiết.',
      time_limit_seconds = 7200,
      total_questions = 200,
      is_published = true
    WHERE id = v_assessment_id;
  END IF;

  -- Question #1 (toeic_part_1)
  SELECT id INTO v_question_id FROM assessment_questions WHERE assessment_id = v_assessment_id AND position = 1;
  IF v_question_id IS NULL THEN
    INSERT INTO assessment_questions (assessment_id, skill, category, difficulty, level, question_type, prompt, context_text, audio_url, options, position, weight)
    VALUES (v_assessment_id, 'listening', 'toeic_part_1', 1, 'a2', 'multiple_choice', 'Look at the photograph marked number 1 in your test book and choose the best statement.', '/images/toeic/real_exam/toeic_part1_q1.png', '/audio/toeic/real_exam/toeic_p1_q1.mp3', '[{"id":"A","text":"They''re rowing the boat together."},{"id":"B","text":"They''re lifting the rubber boat."},{"id":"C","text":"They''re sitting at the water''s edge."},{"id":"D","text":"They''re swimming in the lake."}]'::jsonb, 1, 1.0)
    RETURNING id INTO v_question_id;
  ELSE
    UPDATE assessment_questions SET
      skill = 'listening',
      category = 'toeic_part_1',
      difficulty = 1,
      level = 'a2',
      prompt = 'Look at the photograph marked number 1 in your test book and choose the best statement.',
      context_text = '/images/toeic/real_exam/toeic_part1_q1.png',
      audio_url = '/audio/toeic/real_exam/toeic_p1_q1.mp3',
      options = '[{"id":"A","text":"They''re rowing the boat together."},{"id":"B","text":"They''re lifting the rubber boat."},{"id":"C","text":"They''re sitting at the water''s edge."},{"id":"D","text":"They''re swimming in the lake."}]'::jsonb
    WHERE id = v_question_id;
  END IF;

  -- Answer for #1
  DELETE FROM assessment_question_answers WHERE question_id = v_question_id;
  INSERT INTO assessment_question_answers (question_id, correct_option_id, explanation, transcript_text)
  VALUES (v_question_id, 'A', 'Đáp án đúng: A.

Bản dịch và ngữ nghĩa chi tiết:
(A) They''re rowing the boat together. — 他们正在一起划船。
(B) They''re lifting the rubber boat. — 他们正抬起橡皮艇。
(C) They''re sitting at the water''s edge. — 他们正坐在水边。
(D) They''re swimming in the lake. — 他们正在湖里游泳。', '(A) They''re rowing the boat together.
(B) They''re lifting the rubber boat.
(C) They''re sitting at the water''s edge.
(D) They''re swimming in the lake.');

  -- Question #2 (toeic_part_1)
  SELECT id INTO v_question_id FROM assessment_questions WHERE assessment_id = v_assessment_id AND position = 2;
  IF v_question_id IS NULL THEN
    INSERT INTO assessment_questions (assessment_id, skill, category, difficulty, level, question_type, prompt, context_text, audio_url, options, position, weight)
    VALUES (v_assessment_id, 'listening', 'toeic_part_1', 1, 'a2', 'multiple_choice', 'Look at the photograph marked number 2 in your test book and choose the best statement.', '/images/toeic/real_exam/toeic_part1_q2.png', '/audio/toeic/real_exam/toeic_p1_q2.mp3', '[{"id":"A","text":"Passengers are waiting at the airport."},{"id":"B","text":"There are planes flying overhead."},{"id":"C","text":"The airplanes are parked at the gate."},{"id":"D","text":"The planes have already landed."}]'::jsonb, 2, 1.0)
    RETURNING id INTO v_question_id;
  ELSE
    UPDATE assessment_questions SET
      skill = 'listening',
      category = 'toeic_part_1',
      difficulty = 1,
      level = 'a2',
      prompt = 'Look at the photograph marked number 2 in your test book and choose the best statement.',
      context_text = '/images/toeic/real_exam/toeic_part1_q2.png',
      audio_url = '/audio/toeic/real_exam/toeic_p1_q2.mp3',
      options = '[{"id":"A","text":"Passengers are waiting at the airport."},{"id":"B","text":"There are planes flying overhead."},{"id":"C","text":"The airplanes are parked at the gate."},{"id":"D","text":"The planes have already landed."}]'::jsonb
    WHERE id = v_question_id;
  END IF;

  -- Answer for #2
  DELETE FROM assessment_question_answers WHERE question_id = v_question_id;
  INSERT INTO assessment_question_answers (question_id, correct_option_id, explanation, transcript_text)
  VALUES (v_question_id, 'D', 'Đáp án đúng: D.

Bản dịch và ngữ nghĩa chi tiết:
(A) Passengers are waiting at the airport. — 乘客正在机场等候。
(B) There are planes flying overhead. — 空中有飞机飞过。
(C) The airplanes are parked at the gate. — 飞机停在登机口门前。
(D) The planes have already landed. — 飞机已经降落了。', '(A) Passengers are waiting at the airport.
(B) There are planes flying overhead.
(C) The airplanes are parked at the gate.
(D) The planes have already landed.');

  -- Question #3 (toeic_part_1)
  SELECT id INTO v_question_id FROM assessment_questions WHERE assessment_id = v_assessment_id AND position = 3;
  IF v_question_id IS NULL THEN
    INSERT INTO assessment_questions (assessment_id, skill, category, difficulty, level, question_type, prompt, context_text, audio_url, options, position, weight)
    VALUES (v_assessment_id, 'listening', 'toeic_part_1', 1, 'a2', 'multiple_choice', 'Look at the photograph marked number 3 in your test book and choose the best statement.', '/images/toeic/real_exam/toeic_part1_q3.png', '/audio/toeic/real_exam/toeic_p1_q3.mp3', '[{"id":"A","text":"The computer monitor is under the desk."},{"id":"B","text":"The shelves are filled with books."},{"id":"C","text":"There are books neatly arranged on top of the desk."},{"id":"D","text":"Papers are stacked on the floor."}]'::jsonb, 3, 1.0)
    RETURNING id INTO v_question_id;
  ELSE
    UPDATE assessment_questions SET
      skill = 'listening',
      category = 'toeic_part_1',
      difficulty = 1,
      level = 'a2',
      prompt = 'Look at the photograph marked number 3 in your test book and choose the best statement.',
      context_text = '/images/toeic/real_exam/toeic_part1_q3.png',
      audio_url = '/audio/toeic/real_exam/toeic_p1_q3.mp3',
      options = '[{"id":"A","text":"The computer monitor is under the desk."},{"id":"B","text":"The shelves are filled with books."},{"id":"C","text":"There are books neatly arranged on top of the desk."},{"id":"D","text":"Papers are stacked on the floor."}]'::jsonb
    WHERE id = v_question_id;
  END IF;

  -- Answer for #3
  DELETE FROM assessment_question_answers WHERE question_id = v_question_id;
  INSERT INTO assessment_question_answers (question_id, correct_option_id, explanation, transcript_text)
  VALUES (v_question_id, 'B', 'Đáp án đúng: B.

Bản dịch và ngữ nghĩa chi tiết:
(A) The computer monitor is under the desk. — 电脑显示器在书桌下面。
(B) The shelves are filled with books. — 书架上摆满了书。
(C) There are books neatly arranged on top of the desk. — 书整齐地摆放在书桌上面。
(D) Papers are stacked on the floor. — 文件堆放在地板上。', '(A) The computer monitor is under the desk.
(B) The shelves are filled with books.
(C) There are books neatly arranged on top of the desk.
(D) Papers are stacked on the floor.');

  -- Question #4 (toeic_part_1)
  SELECT id INTO v_question_id FROM assessment_questions WHERE assessment_id = v_assessment_id AND position = 4;
  IF v_question_id IS NULL THEN
    INSERT INTO assessment_questions (assessment_id, skill, category, difficulty, level, question_type, prompt, context_text, audio_url, options, position, weight)
    VALUES (v_assessment_id, 'listening', 'toeic_part_1', 1, 'a2', 'multiple_choice', 'Look at the photograph marked number 4 in your test book and choose the best statement.', '/images/toeic/real_exam/toeic_part1_q4.png', '/audio/toeic/real_exam/toeic_p1_q4.mp3', '[{"id":"A","text":"One woman is leaning back in her chair."},{"id":"B","text":"The man is handing some documents to the woman."},{"id":"C","text":"The people are sorting out the documents together."},{"id":"D","text":"The man is looking over some papers."}]'::jsonb, 4, 1.0)
    RETURNING id INTO v_question_id;
  ELSE
    UPDATE assessment_questions SET
      skill = 'listening',
      category = 'toeic_part_1',
      difficulty = 1,
      level = 'a2',
      prompt = 'Look at the photograph marked number 4 in your test book and choose the best statement.',
      context_text = '/images/toeic/real_exam/toeic_part1_q4.png',
      audio_url = '/audio/toeic/real_exam/toeic_p1_q4.mp3',
      options = '[{"id":"A","text":"One woman is leaning back in her chair."},{"id":"B","text":"The man is handing some documents to the woman."},{"id":"C","text":"The people are sorting out the documents together."},{"id":"D","text":"The man is looking over some papers."}]'::jsonb
    WHERE id = v_question_id;
  END IF;

  -- Answer for #4
  DELETE FROM assessment_question_answers WHERE question_id = v_question_id;
  INSERT INTO assessment_question_answers (question_id, correct_option_id, explanation, transcript_text)
  VALUES (v_question_id, 'D', 'Đáp án đúng: D.

Bản dịch và ngữ nghĩa chi tiết:
(A) One woman is leaning back in her chair. — 一位女士倚靠在椅子上。
(B) The man is handing some documents to the woman. — 男士正递给女士一些文件。
(C) The people are sorting out the documents together. — 人们正在一起分拣文件。
(D) The man is looking over some papers. — 男士正在查看一些文件。', '(A) One woman is leaning back in her chair.
(B) The man is handing some documents to the woman.
(C) The people are sorting out the documents together.
(D) The man is looking over some papers.');

  -- Question #5 (toeic_part_1)
  SELECT id INTO v_question_id FROM assessment_questions WHERE assessment_id = v_assessment_id AND position = 5;
  IF v_question_id IS NULL THEN
    INSERT INTO assessment_questions (assessment_id, skill, category, difficulty, level, question_type, prompt, context_text, audio_url, options, position, weight)
    VALUES (v_assessment_id, 'listening', 'toeic_part_1', 1, 'a2', 'multiple_choice', 'Look at the photograph marked number 5 in your test book and choose the best statement.', '/images/toeic/real_exam/toeic_part1_q5.png', '/audio/toeic/real_exam/toeic_p1_q5.mp3', '[{"id":"A","text":"They are serving food to the others."},{"id":"B","text":"They are preparing food in the kitchen."},{"id":"C","text":"They are arranging the plates on the table."},{"id":"D","text":"They are helping themselves to some food."}]'::jsonb, 5, 1.0)
    RETURNING id INTO v_question_id;
  ELSE
    UPDATE assessment_questions SET
      skill = 'listening',
      category = 'toeic_part_1',
      difficulty = 1,
      level = 'a2',
      prompt = 'Look at the photograph marked number 5 in your test book and choose the best statement.',
      context_text = '/images/toeic/real_exam/toeic_part1_q5.png',
      audio_url = '/audio/toeic/real_exam/toeic_p1_q5.mp3',
      options = '[{"id":"A","text":"They are serving food to the others."},{"id":"B","text":"They are preparing food in the kitchen."},{"id":"C","text":"They are arranging the plates on the table."},{"id":"D","text":"They are helping themselves to some food."}]'::jsonb
    WHERE id = v_question_id;
  END IF;

  -- Answer for #5
  DELETE FROM assessment_question_answers WHERE question_id = v_question_id;
  INSERT INTO assessment_question_answers (question_id, correct_option_id, explanation, transcript_text)
  VALUES (v_question_id, 'D', 'Đáp án đúng: D.

Bản dịch và ngữ nghĩa chi tiết:
(A) They are serving food to the others. — 他们正在给其他人供应食物。
(B) They are preparing food in the kitchen. — 他们正在厨房里准备食物。
(C) They are arranging the plates on the table. — 他们正在往桌上摆放盘子。
(D) They are helping themselves to some food. — 他们正在自己取用食物。', '(A) They are serving food to the others.
(B) They are preparing food in the kitchen.
(C) They are arranging the plates on the table.
(D) They are helping themselves to some food.');

  -- Question #6 (toeic_part_1)
  SELECT id INTO v_question_id FROM assessment_questions WHERE assessment_id = v_assessment_id AND position = 6;
  IF v_question_id IS NULL THEN
    INSERT INTO assessment_questions (assessment_id, skill, category, difficulty, level, question_type, prompt, context_text, audio_url, options, position, weight)
    VALUES (v_assessment_id, 'listening', 'toeic_part_1', 1, 'a2', 'multiple_choice', 'Look at the photograph marked number 6 in your test book and choose the best statement.', '/images/toeic/real_exam/toeic_part1_q6.png', '/audio/toeic/real_exam/toeic_p1_q6.mp3', '[{"id":"A","text":"He''s getting on the subway."},{"id":"B","text":"He''s reading a notice on the wall of the train station."},{"id":"C","text":"He''s strolling along the track."},{"id":"D","text":"He''s standing alone on the platform."}]'::jsonb, 6, 1.0)
    RETURNING id INTO v_question_id;
  ELSE
    UPDATE assessment_questions SET
      skill = 'listening',
      category = 'toeic_part_1',
      difficulty = 1,
      level = 'a2',
      prompt = 'Look at the photograph marked number 6 in your test book and choose the best statement.',
      context_text = '/images/toeic/real_exam/toeic_part1_q6.png',
      audio_url = '/audio/toeic/real_exam/toeic_p1_q6.mp3',
      options = '[{"id":"A","text":"He''s getting on the subway."},{"id":"B","text":"He''s reading a notice on the wall of the train station."},{"id":"C","text":"He''s strolling along the track."},{"id":"D","text":"He''s standing alone on the platform."}]'::jsonb
    WHERE id = v_question_id;
  END IF;

  -- Answer for #6
  DELETE FROM assessment_question_answers WHERE question_id = v_question_id;
  INSERT INTO assessment_question_answers (question_id, correct_option_id, explanation, transcript_text)
  VALUES (v_question_id, 'D', 'Đáp án đúng: D.

Bản dịch và ngữ nghĩa chi tiết:
(A) He''s getting on the subway. — 他正在上地铁。
(B) He''s reading a notice on the wall of the train station. — 他在看车站墙上的一则通知。
(C) He''s strolling along the track. — 他正沿着铁轨闲逛。
(D) He''s standing alone on the platform. — 他一个人站在站台上。', '(A) He''s getting on the subway.
(B) He''s reading a notice on the wall of the train station.
(C) He''s strolling along the track.
(D) He''s standing alone on the platform.');

  -- Question #7 (toeic_part_2)
  SELECT id INTO v_question_id FROM assessment_questions WHERE assessment_id = v_assessment_id AND position = 7;
  IF v_question_id IS NULL THEN
    INSERT INTO assessment_questions (assessment_id, skill, category, difficulty, level, question_type, prompt, context_text, audio_url, options, position, weight)
    VALUES (v_assessment_id, 'listening', 'toeic_part_2', 1, 'a2', 'multiple_choice', 'Why did you get back from your trip so early?', NULL, '/audio/toeic/real_exam/toeic_p2_q7.mp3', '[{"id":"A","text":"Because the meeting got canceled."},{"id":"B","text":"Next Friday at the earliest."},{"id":"C","text":"I''ll be taking the train."}]'::jsonb, 7, 1.0)
    RETURNING id INTO v_question_id;
  ELSE
    UPDATE assessment_questions SET
      skill = 'listening',
      category = 'toeic_part_2',
      difficulty = 1,
      level = 'a2',
      prompt = 'Why did you get back from your trip so early?',
      context_text = NULL,
      audio_url = '/audio/toeic/real_exam/toeic_p2_q7.mp3',
      options = '[{"id":"A","text":"Because the meeting got canceled."},{"id":"B","text":"Next Friday at the earliest."},{"id":"C","text":"I''ll be taking the train."}]'::jsonb
    WHERE id = v_question_id;
  END IF;

  -- Answer for #7
  DELETE FROM assessment_question_answers WHERE question_id = v_question_id;
  INSERT INTO assessment_question_answers (question_id, correct_option_id, explanation, transcript_text)
  VALUES (v_question_id, 'A', 'Đáp án đúng: A.

Transcript và giải thích:
### Q7 (正确答案：A)

**听力对话文本：**
- **Q:** Why did you come back from your trip so fast? (你为什么这么快就旅行回来了？)
- **A:** The meeting ended earlier than expected. (会议结束得比预计的早。)

**听力原文与选项：**
- **问题：** Why did you get back from your trip so early? (你为什么这么早就旅行回来了？)
- **选项：**
  - (A) Because the meeting got canceled. (因为会议取消了。)
  - (B) Next Friday at the earliest. (最早下周五。)
  - (C) I''ll be taking the train. (我会乘火车。)


', 'Why did you get back from your trip so early?
(A) Because the meeting got canceled.
(B) Next Friday at the earliest.
(C) I''ll be taking the train.');

  -- Question #8 (toeic_part_2)
  SELECT id INTO v_question_id FROM assessment_questions WHERE assessment_id = v_assessment_id AND position = 8;
  IF v_question_id IS NULL THEN
    INSERT INTO assessment_questions (assessment_id, skill, category, difficulty, level, question_type, prompt, context_text, audio_url, options, position, weight)
    VALUES (v_assessment_id, 'listening', 'toeic_part_2', 1, 'a2', 'multiple_choice', 'Will you be attending the seminar, or do you have too much work?', NULL, '/audio/toeic/real_exam/toeic_p2_q8.mp3', '[{"id":"A","text":"No, I will attend to it later."},{"id":"B","text":"I will definitely be there."},{"id":"C","text":"Sorry, but I didn''t see it."}]'::jsonb, 8, 1.0)
    RETURNING id INTO v_question_id;
  ELSE
    UPDATE assessment_questions SET
      skill = 'listening',
      category = 'toeic_part_2',
      difficulty = 1,
      level = 'a2',
      prompt = 'Will you be attending the seminar, or do you have too much work?',
      context_text = NULL,
      audio_url = '/audio/toeic/real_exam/toeic_p2_q8.mp3',
      options = '[{"id":"A","text":"No, I will attend to it later."},{"id":"B","text":"I will definitely be there."},{"id":"C","text":"Sorry, but I didn''t see it."}]'::jsonb
    WHERE id = v_question_id;
  END IF;

  -- Answer for #8
  DELETE FROM assessment_question_answers WHERE question_id = v_question_id;
  INSERT INTO assessment_question_answers (question_id, correct_option_id, explanation, transcript_text)
  VALUES (v_question_id, 'B', 'Đáp án đúng: B.

Transcript và giải thích:
### Q8 (正确答案：B)

**听力对话文本：**
- **Q:** Are you going to the seminar, or will you stay here to work? (你是要去参加讨论会，还是留在这里工作？)
- **A:** I should catch up on my work. (我应该把工作补上。)

**听力原文与选项：**
- **问题：** Will you be attending the seminar, or do you have too much work? (你是要去参加讨论会，还是你有很多工作要做？)
- **选项：**
  - (A) No, I will attend to it later. (不，我过会儿再处理。)
  - (B) I will definitely be there. (我一定会去。)
  - (C) Sorry, but I didn''t see it. (抱歉，我没有看到。)


', 'Will you be attending the seminar, or do you have too much work?
(A) No, I will attend to it later.
(B) I will definitely be there.
(C) Sorry, but I didn''t see it.');

  -- Question #9 (toeic_part_2)
  SELECT id INTO v_question_id FROM assessment_questions WHERE assessment_id = v_assessment_id AND position = 9;
  IF v_question_id IS NULL THEN
    INSERT INTO assessment_questions (assessment_id, skill, category, difficulty, level, question_type, prompt, context_text, audio_url, options, position, weight)
    VALUES (v_assessment_id, 'listening', 'toeic_part_2', 1, 'a2', 'multiple_choice', 'Why don''t you invite John to your party?', NULL, '/audio/toeic/real_exam/toeic_p2_q9.mp3', '[{"id":"A","text":"No, he isn''t."},{"id":"B","text":"Sure, I will be there."},{"id":"C","text":"That''s a good idea."}]'::jsonb, 9, 1.0)
    RETURNING id INTO v_question_id;
  ELSE
    UPDATE assessment_questions SET
      skill = 'listening',
      category = 'toeic_part_2',
      difficulty = 1,
      level = 'a2',
      prompt = 'Why don''t you invite John to your party?',
      context_text = NULL,
      audio_url = '/audio/toeic/real_exam/toeic_p2_q9.mp3',
      options = '[{"id":"A","text":"No, he isn''t."},{"id":"B","text":"Sure, I will be there."},{"id":"C","text":"That''s a good idea."}]'::jsonb
    WHERE id = v_question_id;
  END IF;

  -- Answer for #9
  DELETE FROM assessment_question_answers WHERE question_id = v_question_id;
  INSERT INTO assessment_question_answers (question_id, correct_option_id, explanation, transcript_text)
  VALUES (v_question_id, 'C', 'Đáp án đúng: C.

Transcript và giải thích:
### Q9 (正确答案：C)

**听力对话文本：**
- **Q:** How about asking John to your party? (邀请约翰参加你的聚会怎么样？)
- **A:** I''ve already invited him. (我已经邀请他了。)

**听力原文与选项：**
- **问题：** Why don''t you invite John to your party? (邀请约翰来参加你的聚会怎么样？)
- **选项：**
  - (A) No, he isn''t. (不，他不是。)
  - (B) Sure, I will be there. (当然，我会去的。)
  - (C) That''s a good idea. (那是个好主意。)


', 'Why don''t you invite John to your party?
(A) No, he isn''t.
(B) Sure, I will be there.
(C) That''s a good idea.');

  -- Question #10 (toeic_part_2)
  SELECT id INTO v_question_id FROM assessment_questions WHERE assessment_id = v_assessment_id AND position = 10;
  IF v_question_id IS NULL THEN
    INSERT INTO assessment_questions (assessment_id, skill, category, difficulty, level, question_type, prompt, context_text, audio_url, options, position, weight)
    VALUES (v_assessment_id, 'listening', 'toeic_part_2', 1, 'a2', 'multiple_choice', 'Could you show me where the men''s sportswear section is?', NULL, '/audio/toeic/real_exam/toeic_p2_q10.mp3', '[{"id":"A","text":"I like sports, too."},{"id":"B","text":"Go up to the next floor."},{"id":"C","text":"At 2 o''clock."}]'::jsonb, 10, 1.0)
    RETURNING id INTO v_question_id;
  ELSE
    UPDATE assessment_questions SET
      skill = 'listening',
      category = 'toeic_part_2',
      difficulty = 1,
      level = 'a2',
      prompt = 'Could you show me where the men''s sportswear section is?',
      context_text = NULL,
      audio_url = '/audio/toeic/real_exam/toeic_p2_q10.mp3',
      options = '[{"id":"A","text":"I like sports, too."},{"id":"B","text":"Go up to the next floor."},{"id":"C","text":"At 2 o''clock."}]'::jsonb
    WHERE id = v_question_id;
  END IF;

  -- Answer for #10
  DELETE FROM assessment_question_answers WHERE question_id = v_question_id;
  INSERT INTO assessment_question_answers (question_id, correct_option_id, explanation, transcript_text)
  VALUES (v_question_id, 'B', 'Đáp án đúng: B.

Transcript và giải thích:
### Q10 (正确答案：B)

**听力对话文本：**
- **Q:** Where can I find the men''s clothing section? (男士服装区在哪儿？)
- **A:** Take a look in aisle 7. (到7号通道看一看。)

**听力原文与选项：**
- **问题：** Could you show me where the men''s sportswear section is? (你能否告诉我男士运动服装区在哪儿？)
- **选项：**
  - (A) I like sports, too. (我也喜欢运动。)
  - (B) Go up to the next floor. (到楼上去。)
  - (C) At 2 o''clock. (在 2 点钟。)


', 'Could you show me where the men''s sportswear section is?
(A) I like sports, too.
(B) Go up to the next floor.
(C) At 2 o''clock.');

  -- Question #11 (toeic_part_2)
  SELECT id INTO v_question_id FROM assessment_questions WHERE assessment_id = v_assessment_id AND position = 11;
  IF v_question_id IS NULL THEN
    INSERT INTO assessment_questions (assessment_id, skill, category, difficulty, level, question_type, prompt, context_text, audio_url, options, position, weight)
    VALUES (v_assessment_id, 'listening', 'toeic_part_2', 1, 'a2', 'multiple_choice', 'How long is the drive to Tokyo from here?', NULL, '/audio/toeic/real_exam/toeic_p2_q11.mp3', '[{"id":"A","text":"Every other week."},{"id":"B","text":"It''s a great place."},{"id":"C","text":"Roughly an hour."}]'::jsonb, 11, 1.0)
    RETURNING id INTO v_question_id;
  ELSE
    UPDATE assessment_questions SET
      skill = 'listening',
      category = 'toeic_part_2',
      difficulty = 1,
      level = 'a2',
      prompt = 'How long is the drive to Tokyo from here?',
      context_text = NULL,
      audio_url = '/audio/toeic/real_exam/toeic_p2_q11.mp3',
      options = '[{"id":"A","text":"Every other week."},{"id":"B","text":"It''s a great place."},{"id":"C","text":"Roughly an hour."}]'::jsonb
    WHERE id = v_question_id;
  END IF;

  -- Answer for #11
  DELETE FROM assessment_question_answers WHERE question_id = v_question_id;
  INSERT INTO assessment_question_answers (question_id, correct_option_id, explanation, transcript_text)
  VALUES (v_question_id, 'C', 'Đáp án đúng: C.

Transcript và giải thích:
### Q11 (正确答案：C)

**听力对话文本：**
- **Q:** How far is Tokyo by car? (开车到东京有多远？)
- **A:** It''s around an hour from here. (从这儿走大概一个小时。注：在Part 2中，为帮助考生提高听懂题目的能力，添加了和试题相同或相似的表达方法。)

**听力原文与选项：**
- **问题：** How long is the drive to Tokyo from here? (从这里开车到东京需要多长时间？)
- **选项：**
  - (A) Every other week. (每隔一周。)
  - (B) It''s a great place. (那儿是个好地方。)
  - (C) Roughly an hour. (大约一个小时。)


', 'How long is the drive to Tokyo from here?
(A) Every other week.
(B) It''s a great place.
(C) Roughly an hour.');

  -- Question #12 (toeic_part_2)
  SELECT id INTO v_question_id FROM assessment_questions WHERE assessment_id = v_assessment_id AND position = 12;
  IF v_question_id IS NULL THEN
    INSERT INTO assessment_questions (assessment_id, skill, category, difficulty, level, question_type, prompt, context_text, audio_url, options, position, weight)
    VALUES (v_assessment_id, 'listening', 'toeic_part_2', 1, 'a2', 'multiple_choice', 'Who is going to attend the Mr. McKenzie''s retirement party?', NULL, '/audio/toeic/real_exam/toeic_p2_q12.mp3', '[{"id":"A","text":"He has not arrived yet."},{"id":"B","text":"Let''s go right now."},{"id":"C","text":"Everyone except Jill."}]'::jsonb, 12, 1.0)
    RETURNING id INTO v_question_id;
  ELSE
    UPDATE assessment_questions SET
      skill = 'listening',
      category = 'toeic_part_2',
      difficulty = 1,
      level = 'a2',
      prompt = 'Who is going to attend the Mr. McKenzie''s retirement party?',
      context_text = NULL,
      audio_url = '/audio/toeic/real_exam/toeic_p2_q12.mp3',
      options = '[{"id":"A","text":"He has not arrived yet."},{"id":"B","text":"Let''s go right now."},{"id":"C","text":"Everyone except Jill."}]'::jsonb
    WHERE id = v_question_id;
  END IF;

  -- Answer for #12
  DELETE FROM assessment_question_answers WHERE question_id = v_question_id;
  INSERT INTO assessment_question_answers (question_id, correct_option_id, explanation, transcript_text)
  VALUES (v_question_id, 'C', 'Đáp án đúng: C.

Transcript và giải thích:
### Q12 (正确答案：C)

**听力对话文本：**
- **Q:** Who is not coming to the retirement party for Mr. McKenzie? (谁不会来参加麦肯齐先生的退休聚会？)
- **A:** Ralph can''t make it. (拉尔夫来不了。)

**听力原文与选项：**
- **问题：** Who is going to attend the Mr. McKenzie''s retirement party? (谁会去参加麦肯齐先生的退休聚会？)
- **选项：**
  - (A) He has not arrived yet. (他还没有到。)
  - (B) Let''s go right now. (咱们这就走吧。)
  - (C) Everyone except Jill. (所有人，除了吉尔。)


', 'Who is going to attend the Mr. McKenzie''s retirement party?
(A) He has not arrived yet.
(B) Let''s go right now.
(C) Everyone except Jill.');

  -- Question #13 (toeic_part_2)
  SELECT id INTO v_question_id FROM assessment_questions WHERE assessment_id = v_assessment_id AND position = 13;
  IF v_question_id IS NULL THEN
    INSERT INTO assessment_questions (assessment_id, skill, category, difficulty, level, question_type, prompt, context_text, audio_url, options, position, weight)
    VALUES (v_assessment_id, 'listening', 'toeic_part_2', 1, 'a2', 'multiple_choice', 'Would you like to reserve the larger hall for the event?', NULL, '/audio/toeic/real_exam/toeic_p2_q13.mp3', '[{"id":"A","text":"Yes, I''ve already completed it."},{"id":"B","text":"It''s bigger than the others."},{"id":"C","text":"Yes, that would be fine."}]'::jsonb, 13, 1.0)
    RETURNING id INTO v_question_id;
  ELSE
    UPDATE assessment_questions SET
      skill = 'listening',
      category = 'toeic_part_2',
      difficulty = 1,
      level = 'a2',
      prompt = 'Would you like to reserve the larger hall for the event?',
      context_text = NULL,
      audio_url = '/audio/toeic/real_exam/toeic_p2_q13.mp3',
      options = '[{"id":"A","text":"Yes, I''ve already completed it."},{"id":"B","text":"It''s bigger than the others."},{"id":"C","text":"Yes, that would be fine."}]'::jsonb
    WHERE id = v_question_id;
  END IF;

  -- Answer for #13
  DELETE FROM assessment_question_answers WHERE question_id = v_question_id;
  INSERT INTO assessment_question_answers (question_id, correct_option_id, explanation, transcript_text)
  VALUES (v_question_id, 'C', 'Đáp án đúng: C.

Transcript và giải thích:
### Q13 (正确答案：C)

**听力对话文本：**
- **Q:** How about reserving a bigger hall for the party? (给这次聚会预订一个大一些的会堂怎么样？)
- **A:** No, I think the smaller hall will do. (没必要，我认为小一点儿的就可以了。)

**听力原文与选项：**
- **问题：** Would you like to reserve the larger hall for the event? (你想要为这次活动预订大一些的会堂吗？)
- **选项：**
  - (A) Yes, I''ve already completed it. (是的，我已经做完了。)
  - (B) It''s bigger than the others. (它比其他的大一些。)
  - (C) Yes, that would be fine. (行，那样可以。)


', 'Would you like to reserve the larger hall for the event?
(A) Yes, I''ve already completed it.
(B) It''s bigger than the others.
(C) Yes, that would be fine.');

  -- Question #14 (toeic_part_2)
  SELECT id INTO v_question_id FROM assessment_questions WHERE assessment_id = v_assessment_id AND position = 14;
  IF v_question_id IS NULL THEN
    INSERT INTO assessment_questions (assessment_id, skill, category, difficulty, level, question_type, prompt, context_text, audio_url, options, position, weight)
    VALUES (v_assessment_id, 'listening', 'toeic_part_2', 1, 'a2', 'multiple_choice', 'The bonuses will be paid this month, won''t they?', NULL, '/audio/toeic/real_exam/toeic_p2_q14.mp3', '[{"id":"A","text":"Yes, they will."},{"id":"B","text":"No, I paid the bill last month."},{"id":"C","text":"Payday is this Friday."}]'::jsonb, 14, 1.0)
    RETURNING id INTO v_question_id;
  ELSE
    UPDATE assessment_questions SET
      skill = 'listening',
      category = 'toeic_part_2',
      difficulty = 1,
      level = 'a2',
      prompt = 'The bonuses will be paid this month, won''t they?',
      context_text = NULL,
      audio_url = '/audio/toeic/real_exam/toeic_p2_q14.mp3',
      options = '[{"id":"A","text":"Yes, they will."},{"id":"B","text":"No, I paid the bill last month."},{"id":"C","text":"Payday is this Friday."}]'::jsonb
    WHERE id = v_question_id;
  END IF;

  -- Answer for #14
  DELETE FROM assessment_question_answers WHERE question_id = v_question_id;
  INSERT INTO assessment_question_answers (question_id, correct_option_id, explanation, transcript_text)
  VALUES (v_question_id, 'A', 'Đáp án đúng: A.

Transcript và giải thích:
### Q14 (正确答案：A)

**听力对话文本：**
- **Q:** We will receive a bonus this month, won''t we? (我们这个月会拿到奖金，是吗？)
- **A:** Yes, I think so. (是的，我认为是这样。)

**听力原文与选项：**
- **问题：** The bonuses will be paid this month, won''t they? (奖金会在这个月发放，是吗？)
- **选项：**
  - (A) Yes, they will. (是的，会的。)
  - (B) No, I paid the bill last month. (不，我上个月付了账单。)
  - (C) Payday is this Friday. (发工资日是在本周五。)


', 'The bonuses will be paid this month, won''t they?
(A) Yes, they will.
(B) No, I paid the bill last month.
(C) Payday is this Friday.');

  -- Question #15 (toeic_part_2)
  SELECT id INTO v_question_id FROM assessment_questions WHERE assessment_id = v_assessment_id AND position = 15;
  IF v_question_id IS NULL THEN
    INSERT INTO assessment_questions (assessment_id, skill, category, difficulty, level, question_type, prompt, context_text, audio_url, options, position, weight)
    VALUES (v_assessment_id, 'listening', 'toeic_part_2', 1, 'a2', 'multiple_choice', 'Should I go over the material once again before showing it to the client?', NULL, '/audio/toeic/real_exam/toeic_p2_q15.mp3', '[{"id":"A","text":"That''d be a wise thing to do."},{"id":"B","text":"He is expected to show up soon."},{"id":"C","text":"It''s about our new product."}]'::jsonb, 15, 1.0)
    RETURNING id INTO v_question_id;
  ELSE
    UPDATE assessment_questions SET
      skill = 'listening',
      category = 'toeic_part_2',
      difficulty = 1,
      level = 'a2',
      prompt = 'Should I go over the material once again before showing it to the client?',
      context_text = NULL,
      audio_url = '/audio/toeic/real_exam/toeic_p2_q15.mp3',
      options = '[{"id":"A","text":"That''d be a wise thing to do."},{"id":"B","text":"He is expected to show up soon."},{"id":"C","text":"It''s about our new product."}]'::jsonb
    WHERE id = v_question_id;
  END IF;

  -- Answer for #15
  DELETE FROM assessment_question_answers WHERE question_id = v_question_id;
  INSERT INTO assessment_question_answers (question_id, correct_option_id, explanation, transcript_text)
  VALUES (v_question_id, 'A', 'Đáp án đúng: A.

Transcript và giải thích:
### Q15 (正确答案：A)

**听力对话文本：**
- **Q:** Do you think it will be necessary to read over the material again before presenting it to the client? (你觉得在把材料交给客户之前有必要再读一遍吗？)
- **A:** It wouldn''t hurt to do that. (这么做没什么不好。)

**听力原文与选项：**
- **问题：** Should I go over the material once again before showing it to the client? (我应该在把材料给客户之前把它再看一遍吗？)
- **选项：**
  - (A) That''d be a wise thing to do. (那是个明智之举。)
  - (B) He is expected to show up soon. (他应该很快就来了。)
  - (C) It''s about our new product. (它是关于我们的新产品的。)

', 'Should I go over the material once again before showing it to the client?
(A) That''d be a wise thing to do.
(B) He is expected to show up soon.
(C) It''s about our new product.');

  -- Question #16 (toeic_part_2)
  SELECT id INTO v_question_id FROM assessment_questions WHERE assessment_id = v_assessment_id AND position = 16;
  IF v_question_id IS NULL THEN
    INSERT INTO assessment_questions (assessment_id, skill, category, difficulty, level, question_type, prompt, context_text, audio_url, options, position, weight)
    VALUES (v_assessment_id, 'listening', 'toeic_part_2', 1, 'a2', 'multiple_choice', 'What does he do for a living?', NULL, '/audio/toeic/real_exam/toeic_p2_q16.mp3', '[{"id":"A","text":"No, he moved last week."},{"id":"B","text":"He does it all the time."},{"id":"C","text":"He''s an accountant."}]'::jsonb, 16, 1.0)
    RETURNING id INTO v_question_id;
  ELSE
    UPDATE assessment_questions SET
      skill = 'listening',
      category = 'toeic_part_2',
      difficulty = 1,
      level = 'a2',
      prompt = 'What does he do for a living?',
      context_text = NULL,
      audio_url = '/audio/toeic/real_exam/toeic_p2_q16.mp3',
      options = '[{"id":"A","text":"No, he moved last week."},{"id":"B","text":"He does it all the time."},{"id":"C","text":"He''s an accountant."}]'::jsonb
    WHERE id = v_question_id;
  END IF;

  -- Answer for #16
  DELETE FROM assessment_question_answers WHERE question_id = v_question_id;
  INSERT INTO assessment_question_answers (question_id, correct_option_id, explanation, transcript_text)
  VALUES (v_question_id, 'C', 'Đáp án đúng: C.

Transcript và giải thích:
### Q16 (正确答案：C)

**听力对话文本：**
- **Q:** What is his occupation? (他的职业是什么？)
- **A:** He''s an engineer. (他是一位工程师。)

**听力原文与选项：**
- **问题：** What does he do for a living? (他以什么谋生？)
- **选项：**
  - (A) No, he moved last week. (不，他上周搬走了。)
  - (B) He does it all the time. (他总是这样做。)
  - (C) He''s an accountant. (他是一名会计。)


', 'What does he do for a living?
(A) No, he moved last week.
(B) He does it all the time.
(C) He''s an accountant.');

  -- Question #17 (toeic_part_2)
  SELECT id INTO v_question_id FROM assessment_questions WHERE assessment_id = v_assessment_id AND position = 17;
  IF v_question_id IS NULL THEN
    INSERT INTO assessment_questions (assessment_id, skill, category, difficulty, level, question_type, prompt, context_text, audio_url, options, position, weight)
    VALUES (v_assessment_id, 'listening', 'toeic_part_2', 1, 'a2', 'multiple_choice', 'Will you call the travel agency now or later?', NULL, '/audio/toeic/real_exam/toeic_p2_q17.mp3', '[{"id":"A","text":"Actually, I called them yesterday."},{"id":"B","text":"Yes, I travel a lot."},{"id":"C","text":"The flight should arrive soon."}]'::jsonb, 17, 1.0)
    RETURNING id INTO v_question_id;
  ELSE
    UPDATE assessment_questions SET
      skill = 'listening',
      category = 'toeic_part_2',
      difficulty = 1,
      level = 'a2',
      prompt = 'Will you call the travel agency now or later?',
      context_text = NULL,
      audio_url = '/audio/toeic/real_exam/toeic_p2_q17.mp3',
      options = '[{"id":"A","text":"Actually, I called them yesterday."},{"id":"B","text":"Yes, I travel a lot."},{"id":"C","text":"The flight should arrive soon."}]'::jsonb
    WHERE id = v_question_id;
  END IF;

  -- Answer for #17
  DELETE FROM assessment_question_answers WHERE question_id = v_question_id;
  INSERT INTO assessment_question_answers (question_id, correct_option_id, explanation, transcript_text)
  VALUES (v_question_id, 'A', 'Đáp án đúng: A.

Transcript và giải thích:
### Q17 (正确答案：A)

**听力对话文本：**
- **Q:** Will you get in touch with the travel agency now or in the afternoon? (你要现在联系旅行社还是下午联系？)
- **A:** I''ll try calling right now. (我现在就打电话。)

**听力原文与选项：**
- **问题：** Will you call the travel agency now or later? (你要现在给旅行社打电话还是待会儿打？)
- **选项：**
  - (A) Actually, I called them yesterday. (事实上，我昨天给他们打过电话了。)
  - (B) Yes, I travel a lot. (是的，我经常旅行。)
  - (C) The flight should arrive soon. (航班应该马上就到了。)


', 'Will you call the travel agency now or later?
(A) Actually, I called them yesterday.
(B) Yes, I travel a lot.
(C) The flight should arrive soon.');

  -- Question #18 (toeic_part_2)
  SELECT id INTO v_question_id FROM assessment_questions WHERE assessment_id = v_assessment_id AND position = 18;
  IF v_question_id IS NULL THEN
    INSERT INTO assessment_questions (assessment_id, skill, category, difficulty, level, question_type, prompt, context_text, audio_url, options, position, weight)
    VALUES (v_assessment_id, 'listening', 'toeic_part_2', 1, 'a2', 'multiple_choice', 'Don''t you need this note for your presentation?', NULL, '/audio/toeic/real_exam/toeic_p2_q18.mp3', '[{"id":"A","text":"Thanks, I almost forgot about it."},{"id":"B","text":"Actually, there was nobody present."},{"id":"C","text":"No, I didn''t take notes during the speech."}]'::jsonb, 18, 1.0)
    RETURNING id INTO v_question_id;
  ELSE
    UPDATE assessment_questions SET
      skill = 'listening',
      category = 'toeic_part_2',
      difficulty = 1,
      level = 'a2',
      prompt = 'Don''t you need this note for your presentation?',
      context_text = NULL,
      audio_url = '/audio/toeic/real_exam/toeic_p2_q18.mp3',
      options = '[{"id":"A","text":"Thanks, I almost forgot about it."},{"id":"B","text":"Actually, there was nobody present."},{"id":"C","text":"No, I didn''t take notes during the speech."}]'::jsonb
    WHERE id = v_question_id;
  END IF;

  -- Answer for #18
  DELETE FROM assessment_question_answers WHERE question_id = v_question_id;
  INSERT INTO assessment_question_answers (question_id, correct_option_id, explanation, transcript_text)
  VALUES (v_question_id, 'A', 'Đáp án đúng: A.

Transcript và giải thích:
### Q18 (正确答案：A)

**听力对话文本：**
- **Q:** Won''t you be needing this note to make your presentation? (你做报告不需要这份笔记吗？)
- **A:** Thanks, I was looking for that. (谢谢，我一直在找它呢。)

**听力原文与选项：**
- **问题：** Don''t you need this note for your presentation? (你做报告的时候不需要这份笔记吗？)
- **选项：**
  - (A) Thanks, I almost forgot about it. (谢谢，我几乎把它忘了。)
  - (B) Actually, there was nobody present. (事实上，没人到场。)
  - (C) No, I didn''t take notes during the speech. (不，我在演讲时没做笔记。)


', 'Don''t you need this note for your presentation?
(A) Thanks, I almost forgot about it.
(B) Actually, there was nobody present.
(C) No, I didn''t take notes during the speech.');

  -- Question #19 (toeic_part_2)
  SELECT id INTO v_question_id FROM assessment_questions WHERE assessment_id = v_assessment_id AND position = 19;
  IF v_question_id IS NULL THEN
    INSERT INTO assessment_questions (assessment_id, skill, category, difficulty, level, question_type, prompt, context_text, audio_url, options, position, weight)
    VALUES (v_assessment_id, 'listening', 'toeic_part_2', 1, 'a2', 'multiple_choice', 'Where should I put this box of ink cartridges, Ms. Fujimoto?', NULL, '/audio/toeic/real_exam/toeic_p2_q19.mp3', '[{"id":"A","text":"At the local stationery store."},{"id":"B","text":"Put it in the next room."},{"id":"C","text":"She is the receptionist."}]'::jsonb, 19, 1.0)
    RETURNING id INTO v_question_id;
  ELSE
    UPDATE assessment_questions SET
      skill = 'listening',
      category = 'toeic_part_2',
      difficulty = 1,
      level = 'a2',
      prompt = 'Where should I put this box of ink cartridges, Ms. Fujimoto?',
      context_text = NULL,
      audio_url = '/audio/toeic/real_exam/toeic_p2_q19.mp3',
      options = '[{"id":"A","text":"At the local stationery store."},{"id":"B","text":"Put it in the next room."},{"id":"C","text":"She is the receptionist."}]'::jsonb
    WHERE id = v_question_id;
  END IF;

  -- Answer for #19
  DELETE FROM assessment_question_answers WHERE question_id = v_question_id;
  INSERT INTO assessment_question_answers (question_id, correct_option_id, explanation, transcript_text)
  VALUES (v_question_id, 'B', 'Đáp án đúng: B.

Transcript và giải thích:
### Q19 (正确答案：B)

**听力对话文本：**
- **Q:** Is there a particular place where you want me to put this box, Ms. Fujimoto? (藤本女士，你想让我把这个箱子放在什么地方呢？)
- **A:** Just leave it there, please. (请你把它就放在那里吧。)

**听力原文与选项：**
- **问题：** Where should I put this box of ink cartridges, Ms. Fujimoto? (藤本女士，我应该把这箱墨盒放在哪儿？)
- **选项：**
  - (A) At the local stationery store. (在当地的文具店。)
  - (B) Put it in the next room. (把它放到隔壁房间。)
  - (C) She is the receptionist. (她是接待员。)


', 'Where should I put this box of ink cartridges, Ms. Fujimoto?
(A) At the local stationery store.
(B) Put it in the next room.
(C) She is the receptionist.');

  -- Question #20 (toeic_part_2)
  SELECT id INTO v_question_id FROM assessment_questions WHERE assessment_id = v_assessment_id AND position = 20;
  IF v_question_id IS NULL THEN
    INSERT INTO assessment_questions (assessment_id, skill, category, difficulty, level, question_type, prompt, context_text, audio_url, options, position, weight)
    VALUES (v_assessment_id, 'listening', 'toeic_part_2', 1, 'a2', 'multiple_choice', 'Who is good with computers?', NULL, '/audio/toeic/real_exam/toeic_p2_q20.mp3', '[{"id":"A","text":"Yes, it is very good."},{"id":"B","text":"The software came with it."},{"id":"C","text":"John is the person you are looking for."}]'::jsonb, 20, 1.0)
    RETURNING id INTO v_question_id;
  ELSE
    UPDATE assessment_questions SET
      skill = 'listening',
      category = 'toeic_part_2',
      difficulty = 1,
      level = 'a2',
      prompt = 'Who is good with computers?',
      context_text = NULL,
      audio_url = '/audio/toeic/real_exam/toeic_p2_q20.mp3',
      options = '[{"id":"A","text":"Yes, it is very good."},{"id":"B","text":"The software came with it."},{"id":"C","text":"John is the person you are looking for."}]'::jsonb
    WHERE id = v_question_id;
  END IF;

  -- Answer for #20
  DELETE FROM assessment_question_answers WHERE question_id = v_question_id;
  INSERT INTO assessment_question_answers (question_id, correct_option_id, explanation, transcript_text)
  VALUES (v_question_id, 'C', 'Đáp án đúng: C.

Transcript và giải thích:
### Q20 (正确答案：C)

**听力对话文本：**
- **Q:** Who knows anything about computers around here? (这里谁懂电脑？)
- **A:** Ralph is the expert here. (拉尔夫是这儿的专家。)

**听力原文与选项：**
- **问题：** Who is good with computers? (谁擅长使用电脑？)
- **选项：**
  - (A) Yes, it is very good. (是的，它很好。)
  - (B) The software came with it. (这个软件是配套的。)
  - (C) John is the person you are looking for. (约翰就是你要找的人。)


', 'Who is good with computers?
(A) Yes, it is very good.
(B) The software came with it.
(C) John is the person you are looking for.');

  -- Question #21 (toeic_part_2)
  SELECT id INTO v_question_id FROM assessment_questions WHERE assessment_id = v_assessment_id AND position = 21;
  IF v_question_id IS NULL THEN
    INSERT INTO assessment_questions (assessment_id, skill, category, difficulty, level, question_type, prompt, context_text, audio_url, options, position, weight)
    VALUES (v_assessment_id, 'listening', 'toeic_part_2', 1, 'a2', 'multiple_choice', 'Won''t we have to use the overhead projector at the meeting?', NULL, '/audio/toeic/real_exam/toeic_p2_q21.mp3', '[{"id":"A","text":"Yes, I will set it up soon."},{"id":"B","text":"It is a big project."},{"id":"C","text":"I''ll head over right now."}]'::jsonb, 21, 1.0)
    RETURNING id INTO v_question_id;
  ELSE
    UPDATE assessment_questions SET
      skill = 'listening',
      category = 'toeic_part_2',
      difficulty = 1,
      level = 'a2',
      prompt = 'Won''t we have to use the overhead projector at the meeting?',
      context_text = NULL,
      audio_url = '/audio/toeic/real_exam/toeic_p2_q21.mp3',
      options = '[{"id":"A","text":"Yes, I will set it up soon."},{"id":"B","text":"It is a big project."},{"id":"C","text":"I''ll head over right now."}]'::jsonb
    WHERE id = v_question_id;
  END IF;

  -- Answer for #21
  DELETE FROM assessment_question_answers WHERE question_id = v_question_id;
  INSERT INTO assessment_question_answers (question_id, correct_option_id, explanation, transcript_text)
  VALUES (v_question_id, 'A', 'Đáp án đúng: A.

Transcript và giải thích:
### Q21 (正确答案：A)

**听力对话文本：**
- **Q:** Will we be using the overhead projector at the meeting? (我们开会时要用投影仪吗？)
- **A:** Yes, please ask Jeff to get it ready. (是的，请让杰夫把它准备好。)

**听力原文与选项：**
- **问题：** Won''t we have to use the overhead projector at the meeting? (我们开会时不会用到投影仪吗？)
- **选项：**
  - (A) Yes, I will set it up soon. (是的，我会马上把它装好。)
  - (B) It is a big project. (那是一个大工程。)
  - (C) I''ll head over right now. (我会马上过去。)


', 'Won''t we have to use the overhead projector at the meeting?
(A) Yes, I will set it up soon.
(B) It is a big project.
(C) I''ll head over right now.');

  -- Question #22 (toeic_part_2)
  SELECT id INTO v_question_id FROM assessment_questions WHERE assessment_id = v_assessment_id AND position = 22;
  IF v_question_id IS NULL THEN
    INSERT INTO assessment_questions (assessment_id, skill, category, difficulty, level, question_type, prompt, context_text, audio_url, options, position, weight)
    VALUES (v_assessment_id, 'listening', 'toeic_part_2', 1, 'a2', 'multiple_choice', 'Where do you keep the sales report?', NULL, '/audio/toeic/real_exam/toeic_p2_q22.mp3', '[{"id":"A","text":"Yes, I will."},{"id":"B","text":"To the manager."},{"id":"C","text":"In the filing cabinet."}]'::jsonb, 22, 1.0)
    RETURNING id INTO v_question_id;
  ELSE
    UPDATE assessment_questions SET
      skill = 'listening',
      category = 'toeic_part_2',
      difficulty = 1,
      level = 'a2',
      prompt = 'Where do you keep the sales report?',
      context_text = NULL,
      audio_url = '/audio/toeic/real_exam/toeic_p2_q22.mp3',
      options = '[{"id":"A","text":"Yes, I will."},{"id":"B","text":"To the manager."},{"id":"C","text":"In the filing cabinet."}]'::jsonb
    WHERE id = v_question_id;
  END IF;

  -- Answer for #22
  DELETE FROM assessment_question_answers WHERE question_id = v_question_id;
  INSERT INTO assessment_question_answers (question_id, correct_option_id, explanation, transcript_text)
  VALUES (v_question_id, 'C', 'Đáp án đúng: C.

Transcript và giải thích:
### Q22 (正确答案：C)

**听力对话文本：**
- **Q:** Where can I find the sales report? (我在哪儿能找到销售报告？)
- **A:** Take a look in the filing cabinet. (到文件柜看一看。)

**听力原文与选项：**
- **问题：** Where do you keep the sales report? (你把销售报告放在哪儿了？)
- **选项：**
  - (A) Yes, I will. (是的，我会的。)
  - (B) To the manager. (给经理。)
  - (C) In the filing cabinet. (在文件柜里。)


', 'Where do you keep the sales report?
(A) Yes, I will.
(B) To the manager.
(C) In the filing cabinet.');

  -- Question #23 (toeic_part_2)
  SELECT id INTO v_question_id FROM assessment_questions WHERE assessment_id = v_assessment_id AND position = 23;
  IF v_question_id IS NULL THEN
    INSERT INTO assessment_questions (assessment_id, skill, category, difficulty, level, question_type, prompt, context_text, audio_url, options, position, weight)
    VALUES (v_assessment_id, 'listening', 'toeic_part_2', 1, 'a2', 'multiple_choice', 'Do you want to proofread this proposal, or would you prefer typing up the summary?', NULL, '/audio/toeic/real_exam/toeic_p2_q23.mp3', '[{"id":"A","text":"Thank you. That would be very nice of you."},{"id":"B","text":"Either is okay with me."},{"id":"C","text":"Yes, I read it over twice."}]'::jsonb, 23, 1.0)
    RETURNING id INTO v_question_id;
  ELSE
    UPDATE assessment_questions SET
      skill = 'listening',
      category = 'toeic_part_2',
      difficulty = 1,
      level = 'a2',
      prompt = 'Do you want to proofread this proposal, or would you prefer typing up the summary?',
      context_text = NULL,
      audio_url = '/audio/toeic/real_exam/toeic_p2_q23.mp3',
      options = '[{"id":"A","text":"Thank you. That would be very nice of you."},{"id":"B","text":"Either is okay with me."},{"id":"C","text":"Yes, I read it over twice."}]'::jsonb
    WHERE id = v_question_id;
  END IF;

  -- Answer for #23
  DELETE FROM assessment_question_answers WHERE question_id = v_question_id;
  INSERT INTO assessment_question_answers (question_id, correct_option_id, explanation, transcript_text)
  VALUES (v_question_id, 'B', 'Đáp án đúng: B.

Transcript và giải thích:
### Q23 (正确答案：B)

**听力对话文本：**
- **Q:** Would you rather read this proposal or type up the summary? (你愿意阅读这份提议还是输入这份总结？)
- **A:** What do you want me to do? (你想让我做什么？)

**听力原文与选项：**
- **问题：** Do you want to proofread this proposal, or would you prefer typing up the summary? (你是想校对这份提议，还是想输入这份总结？)
- **选项：**
  - (A) Thank you. That would be very nice of you. (谢谢你。你真好。)
  - (B) Either is okay with me. (两样都可以。)
  - (C) Yes, I read it over twice. (是的，我读过两遍了。)


', 'Do you want to proofread this proposal, or would you prefer typing up the summary?
(A) Thank you. That would be very nice of you.
(B) Either is okay with me.
(C) Yes, I read it over twice.');

  -- Question #24 (toeic_part_2)
  SELECT id INTO v_question_id FROM assessment_questions WHERE assessment_id = v_assessment_id AND position = 24;
  IF v_question_id IS NULL THEN
    INSERT INTO assessment_questions (assessment_id, skill, category, difficulty, level, question_type, prompt, context_text, audio_url, options, position, weight)
    VALUES (v_assessment_id, 'listening', 'toeic_part_2', 1, 'a2', 'multiple_choice', 'Didn''t you back up the work on your computer?', NULL, '/audio/toeic/real_exam/toeic_p2_q24.mp3', '[{"id":"A","text":"No, I came through the front door."},{"id":"B","text":"No, I forgot all about it."},{"id":"C","text":"I will give it back to you today."}]'::jsonb, 24, 1.0)
    RETURNING id INTO v_question_id;
  ELSE
    UPDATE assessment_questions SET
      skill = 'listening',
      category = 'toeic_part_2',
      difficulty = 1,
      level = 'a2',
      prompt = 'Didn''t you back up the work on your computer?',
      context_text = NULL,
      audio_url = '/audio/toeic/real_exam/toeic_p2_q24.mp3',
      options = '[{"id":"A","text":"No, I came through the front door."},{"id":"B","text":"No, I forgot all about it."},{"id":"C","text":"I will give it back to you today."}]'::jsonb
    WHERE id = v_question_id;
  END IF;

  -- Answer for #24
  DELETE FROM assessment_question_answers WHERE question_id = v_question_id;
  INSERT INTO assessment_question_answers (question_id, correct_option_id, explanation, transcript_text)
  VALUES (v_question_id, 'B', 'Đáp án đúng: B.

Transcript và giải thích:
### Q24 (正确答案：B)

**听力对话文本：**
- **Q:** Didn''t you save a copy of your work on your computer? (你没有把你的工作在电脑上备份吗？)
- **A:** No, I didn''t think it was necessary. (没有，我觉得没有必要。)

**听力原文与选项：**
- **问题：** Didn''t you back up the work on your computer? (你没有在电脑上把工作备份吗？)
- **选项：**
  - (A) No, I came through the front door. (不，我从前门过来的。)
  - (B) No, I forgot all about it. (没有，我全忘了。)
  - (C) I will give it back to you today. (我今天会把它还给你。)


', 'Didn''t you back up the work on your computer?
(A) No, I came through the front door.
(B) No, I forgot all about it.
(C) I will give it back to you today.');

  -- Question #25 (toeic_part_2)
  SELECT id INTO v_question_id FROM assessment_questions WHERE assessment_id = v_assessment_id AND position = 25;
  IF v_question_id IS NULL THEN
    INSERT INTO assessment_questions (assessment_id, skill, category, difficulty, level, question_type, prompt, context_text, audio_url, options, position, weight)
    VALUES (v_assessment_id, 'listening', 'toeic_part_2', 1, 'a2', 'multiple_choice', 'Could you let me know your decision later today?', NULL, '/audio/toeic/real_exam/toeic_p2_q25.mp3', '[{"id":"A","text":"I will give you a ring by 5 o''clock."},{"id":"B","text":"I''m sure it will not be too late."},{"id":"C","text":"It could go either way."}]'::jsonb, 25, 1.0)
    RETURNING id INTO v_question_id;
  ELSE
    UPDATE assessment_questions SET
      skill = 'listening',
      category = 'toeic_part_2',
      difficulty = 1,
      level = 'a2',
      prompt = 'Could you let me know your decision later today?',
      context_text = NULL,
      audio_url = '/audio/toeic/real_exam/toeic_p2_q25.mp3',
      options = '[{"id":"A","text":"I will give you a ring by 5 o''clock."},{"id":"B","text":"I''m sure it will not be too late."},{"id":"C","text":"It could go either way."}]'::jsonb
    WHERE id = v_question_id;
  END IF;

  -- Answer for #25
  DELETE FROM assessment_question_answers WHERE question_id = v_question_id;
  INSERT INTO assessment_question_answers (question_id, correct_option_id, explanation, transcript_text)
  VALUES (v_question_id, 'A', 'Đáp án đúng: A.

Transcript và giải thích:
### Q25 (正确答案：A)

**听力对话文本：**
- **Q:** How about calling me later to let me know how you decided? (过一会儿给我打电话，告诉我你的决定，好吗？)
- **A:** I''ll phone you before I go home. (我回家之前会给你打电话。)

**听力原文与选项：**
- **问题：** Could you let me know your decision later today? (今天晚些时候能告诉我你的决定吗？)
- **选项：**
  - (A) I will give you a ring by 5 o''clock. (我会在 5 点之前给你打电话。)
  - (B) I''m sure it will not be too late. (我肯定不会太晚的。)
  - (C) It could go either way. (两种办法都可以。)


', 'Could you let me know your decision later today?
(A) I will give you a ring by 5 o''clock.
(B) I''m sure it will not be too late.
(C) It could go either way.');

  -- Question #26 (toeic_part_2)
  SELECT id INTO v_question_id FROM assessment_questions WHERE assessment_id = v_assessment_id AND position = 26;
  IF v_question_id IS NULL THEN
    INSERT INTO assessment_questions (assessment_id, skill, category, difficulty, level, question_type, prompt, context_text, audio_url, options, position, weight)
    VALUES (v_assessment_id, 'listening', 'toeic_part_2', 1, 'a2', 'multiple_choice', 'Isn''t that where the new mall is going to be built?', NULL, '/audio/toeic/real_exam/toeic_p2_q26.mp3', '[{"id":"A","text":"You will be going there this afternoon."},{"id":"B","text":"I think you might be right."},{"id":"C","text":"Yes, the mall is close to here."}]'::jsonb, 26, 1.0)
    RETURNING id INTO v_question_id;
  ELSE
    UPDATE assessment_questions SET
      skill = 'listening',
      category = 'toeic_part_2',
      difficulty = 1,
      level = 'a2',
      prompt = 'Isn''t that where the new mall is going to be built?',
      context_text = NULL,
      audio_url = '/audio/toeic/real_exam/toeic_p2_q26.mp3',
      options = '[{"id":"A","text":"You will be going there this afternoon."},{"id":"B","text":"I think you might be right."},{"id":"C","text":"Yes, the mall is close to here."}]'::jsonb
    WHERE id = v_question_id;
  END IF;

  -- Answer for #26
  DELETE FROM assessment_question_answers WHERE question_id = v_question_id;
  INSERT INTO assessment_question_answers (question_id, correct_option_id, explanation, transcript_text)
  VALUES (v_question_id, 'B', 'Đáp án đúng: B.

Transcript và giải thích:
### Q26 (正确答案：B)

**听力对话文本：**
- **Q:** That is where the new mall is going to go up, isn''t it? (那里是新商场的建造地点，是吗？)
- **A:** Yes, that''s what I heard. (是的，我听说是这样。)

**听力原文与选项：**
- **问题：** Isn''t that where the new mall is going to be built? (那不是要建造新商场的地方吗？)
- **选项：**
  - (A) You will be going there this afternoon. (你今天下午会到那儿去。)
  - (B) I think you might be right. (我想你也许是对的。)
  - (C) Yes, the mall is close to here. (是的，商场离这里很近。)


', 'Isn''t that where the new mall is going to be built?
(A) You will be going there this afternoon.
(B) I think you might be right.
(C) Yes, the mall is close to here.');

  -- Question #27 (toeic_part_2)
  SELECT id INTO v_question_id FROM assessment_questions WHERE assessment_id = v_assessment_id AND position = 27;
  IF v_question_id IS NULL THEN
    INSERT INTO assessment_questions (assessment_id, skill, category, difficulty, level, question_type, prompt, context_text, audio_url, options, position, weight)
    VALUES (v_assessment_id, 'listening', 'toeic_part_2', 1, 'a2', 'multiple_choice', 'To whom should I be handing these receipts?', NULL, '/audio/toeic/real_exam/toeic_p2_q27.mp3', '[{"id":"A","text":"John will take them off your hands."},{"id":"B","text":"She gave them to me today."},{"id":"C","text":"To get a tax break."}]'::jsonb, 27, 1.0)
    RETURNING id INTO v_question_id;
  ELSE
    UPDATE assessment_questions SET
      skill = 'listening',
      category = 'toeic_part_2',
      difficulty = 1,
      level = 'a2',
      prompt = 'To whom should I be handing these receipts?',
      context_text = NULL,
      audio_url = '/audio/toeic/real_exam/toeic_p2_q27.mp3',
      options = '[{"id":"A","text":"John will take them off your hands."},{"id":"B","text":"She gave them to me today."},{"id":"C","text":"To get a tax break."}]'::jsonb
    WHERE id = v_question_id;
  END IF;

  -- Answer for #27
  DELETE FROM assessment_question_answers WHERE question_id = v_question_id;
  INSERT INTO assessment_question_answers (question_id, correct_option_id, explanation, transcript_text)
  VALUES (v_question_id, 'A', 'Đáp án đúng: A.

Transcript và giải thích:
### Q27 (正确答案：A)

**听力对话文本：**
- **Q:** Who looks after the receipts here? (这里谁负责收据？)
- **A:** John looks after the books here. (约翰在这儿负责账本。)

**听力原文与选项：**
- **问题：** To whom should I be handing these receipts? (我应该把这些收据交给谁？)
- **选项：**
  - (A) John will take them off your hands. (约翰会从你那里把它们拿走。)
  - (B) She gave them to me today. (她今天把它们给我了。)
  - (C) To get a tax break. (为了减免税。)


', 'To whom should I be handing these receipts?
(A) John will take them off your hands.
(B) She gave them to me today.
(C) To get a tax break.');

  -- Question #28 (toeic_part_2)
  SELECT id INTO v_question_id FROM assessment_questions WHERE assessment_id = v_assessment_id AND position = 28;
  IF v_question_id IS NULL THEN
    INSERT INTO assessment_questions (assessment_id, skill, category, difficulty, level, question_type, prompt, context_text, audio_url, options, position, weight)
    VALUES (v_assessment_id, 'listening', 'toeic_part_2', 1, 'a2', 'multiple_choice', 'What did you think of the movie we just saw?', NULL, '/audio/toeic/real_exam/toeic_p2_q28.mp3', '[{"id":"A","text":"I''ll see it this weekend."},{"id":"B","text":"At the theater in the mall."},{"id":"C","text":"It was very exciting."}]'::jsonb, 28, 1.0)
    RETURNING id INTO v_question_id;
  ELSE
    UPDATE assessment_questions SET
      skill = 'listening',
      category = 'toeic_part_2',
      difficulty = 1,
      level = 'a2',
      prompt = 'What did you think of the movie we just saw?',
      context_text = NULL,
      audio_url = '/audio/toeic/real_exam/toeic_p2_q28.mp3',
      options = '[{"id":"A","text":"I''ll see it this weekend."},{"id":"B","text":"At the theater in the mall."},{"id":"C","text":"It was very exciting."}]'::jsonb
    WHERE id = v_question_id;
  END IF;

  -- Answer for #28
  DELETE FROM assessment_question_answers WHERE question_id = v_question_id;
  INSERT INTO assessment_question_answers (question_id, correct_option_id, explanation, transcript_text)
  VALUES (v_question_id, 'C', 'Đáp án đúng: C.

Transcript và giải thích:
### Q28 (正确答案：C)

**听力对话文本：**
- **Q:** How did you like the movie we just saw? (你觉得我们刚才看的电影怎么样？)
- **A:** I thought it was quite good. (我觉得非常好。)

**听力原文与选项：**
- **问题：** What did you think of the movie we just saw? (你觉得我们刚才看的电影怎么样？)
- **选项：**
  - (A) I''ll see it this weekend. (这个周末我会去看。)
  - (B) At the theater in the mall. (在商厦的剧场。)
  - (C) It was very exciting. (非常精彩。)


', 'What did you think of the movie we just saw?
(A) I''ll see it this weekend.
(B) At the theater in the mall.
(C) It was very exciting.');

  -- Question #29 (toeic_part_2)
  SELECT id INTO v_question_id FROM assessment_questions WHERE assessment_id = v_assessment_id AND position = 29;
  IF v_question_id IS NULL THEN
    INSERT INTO assessment_questions (assessment_id, skill, category, difficulty, level, question_type, prompt, context_text, audio_url, options, position, weight)
    VALUES (v_assessment_id, 'listening', 'toeic_part_2', 1, 'a2', 'multiple_choice', 'Do I have to deliver it in person?', NULL, '/audio/toeic/real_exam/toeic_p2_q29.mp3', '[{"id":"A","text":"No, you can mail it in instead."},{"id":"B","text":"Yes, he works at the post office."},{"id":"C","text":"On the first basement floor."}]'::jsonb, 29, 1.0)
    RETURNING id INTO v_question_id;
  ELSE
    UPDATE assessment_questions SET
      skill = 'listening',
      category = 'toeic_part_2',
      difficulty = 1,
      level = 'a2',
      prompt = 'Do I have to deliver it in person?',
      context_text = NULL,
      audio_url = '/audio/toeic/real_exam/toeic_p2_q29.mp3',
      options = '[{"id":"A","text":"No, you can mail it in instead."},{"id":"B","text":"Yes, he works at the post office."},{"id":"C","text":"On the first basement floor."}]'::jsonb
    WHERE id = v_question_id;
  END IF;

  -- Answer for #29
  DELETE FROM assessment_question_answers WHERE question_id = v_question_id;
  INSERT INTO assessment_question_answers (question_id, correct_option_id, explanation, transcript_text)
  VALUES (v_question_id, 'A', 'Đáp án đúng: A.

Transcript và giải thích:
### Q29 (正确答案：A)

**听力对话文本：**
- **Q:** Do I have to take it down in person? (我必须亲自把它送到吗？)
- **A:** No, you can mail it if you''d like. (不，如果你愿意，可以邮寄。)

**听力原文与选项：**
- **问题：** Do I have to deliver it in person? (我必须本人送过来吗？)
- **选项：**
  - (A) No, you can mail it in instead. (不用，你可以邮寄过来。)
  - (B) Yes, he works at the post office. (是的，他在邮局工作。)
  - (C) On the first basement floor. (在地下一层。)


', 'Do I have to deliver it in person?
(A) No, you can mail it in instead.
(B) Yes, he works at the post office.
(C) On the first basement floor.');

  -- Question #30 (toeic_part_2)
  SELECT id INTO v_question_id FROM assessment_questions WHERE assessment_id = v_assessment_id AND position = 30;
  IF v_question_id IS NULL THEN
    INSERT INTO assessment_questions (assessment_id, skill, category, difficulty, level, question_type, prompt, context_text, audio_url, options, position, weight)
    VALUES (v_assessment_id, 'listening', 'toeic_part_2', 1, 'a2', 'multiple_choice', 'Should I schedule you for two this afternoon?', NULL, '/audio/toeic/real_exam/toeic_p2_q30.mp3', '[{"id":"A","text":"Yes, I have a full schedule today."},{"id":"B","text":"That would suit me fine."},{"id":"C","text":"No, there will be three of us."}]'::jsonb, 30, 1.0)
    RETURNING id INTO v_question_id;
  ELSE
    UPDATE assessment_questions SET
      skill = 'listening',
      category = 'toeic_part_2',
      difficulty = 1,
      level = 'a2',
      prompt = 'Should I schedule you for two this afternoon?',
      context_text = NULL,
      audio_url = '/audio/toeic/real_exam/toeic_p2_q30.mp3',
      options = '[{"id":"A","text":"Yes, I have a full schedule today."},{"id":"B","text":"That would suit me fine."},{"id":"C","text":"No, there will be three of us."}]'::jsonb
    WHERE id = v_question_id;
  END IF;

  -- Answer for #30
  DELETE FROM assessment_question_answers WHERE question_id = v_question_id;
  INSERT INTO assessment_question_answers (question_id, correct_option_id, explanation, transcript_text)
  VALUES (v_question_id, 'B', 'Đáp án đúng: B.

Transcript và giải thích:
### Q30 (正确答案：B)

**听力对话文本：**
- **Q:** Should I put you down for two o''clock today? (我可以把你安排在今天2点吗？)
- **A:** Sure, that is fine. (当然可以。)

**听力原文与选项：**
- **问题：** Should I schedule you for two this afternoon? (我可以把你安排在今天下午 2 点吗？)
- **选项：**
  - (A) Yes, I have a full schedule today. (是的，我今天的安排很满。)
  - (B) That would suit me fine. (那对我来说很合适。)
  - (C) No, there will be three of us. (不，我们一共三个人。)


', 'Should I schedule you for two this afternoon?
(A) Yes, I have a full schedule today.
(B) That would suit me fine.
(C) No, there will be three of us.');

  -- Question #31 (toeic_part_2)
  SELECT id INTO v_question_id FROM assessment_questions WHERE assessment_id = v_assessment_id AND position = 31;
  IF v_question_id IS NULL THEN
    INSERT INTO assessment_questions (assessment_id, skill, category, difficulty, level, question_type, prompt, context_text, audio_url, options, position, weight)
    VALUES (v_assessment_id, 'listening', 'toeic_part_2', 1, 'a2', 'multiple_choice', 'Please give me an answer as soon as you can.', NULL, '/audio/toeic/real_exam/toeic_p2_q31.mp3', '[{"id":"A","text":"I will call you this afternoon."},{"id":"B","text":"Sorry, I am late."},{"id":"C","text":"He will give it to me there."}]'::jsonb, 31, 1.0)
    RETURNING id INTO v_question_id;
  ELSE
    UPDATE assessment_questions SET
      skill = 'listening',
      category = 'toeic_part_2',
      difficulty = 1,
      level = 'a2',
      prompt = 'Please give me an answer as soon as you can.',
      context_text = NULL,
      audio_url = '/audio/toeic/real_exam/toeic_p2_q31.mp3',
      options = '[{"id":"A","text":"I will call you this afternoon."},{"id":"B","text":"Sorry, I am late."},{"id":"C","text":"He will give it to me there."}]'::jsonb
    WHERE id = v_question_id;
  END IF;

  -- Answer for #31
  DELETE FROM assessment_question_answers WHERE question_id = v_question_id;
  INSERT INTO assessment_question_answers (question_id, correct_option_id, explanation, transcript_text)
  VALUES (v_question_id, 'A', 'Đáp án đúng: A.

Transcript và giải thích:
### Q31 (正确答案：A)

**听力对话文本：**
- **Q:** Let me know your decision as soon as possible. (尽快告诉我你的决定。)
- **A:** I''ll let you know after lunch today. (我会在今天午饭后告诉你。Questions 32 through 34 refer to the following conversation.M1:Have you decided on whether you are going to apply for the jobthat''s opened up in marketing？（)

**听力原文与选项：**
- **问题：** Please give me an answer as soon as you can. (请你尽快给我答复。)
- **选项：**
  - (A) I will call you this afternoon. (我今天下午会给你打电话。)
  - (B) Sorry, I am late. (抱歉，我迟到了。)
 ', 'Please give me an answer as soon as you can.
(A) I will call you this afternoon.
(B) Sorry, I am late.
(C) He will give it to me there.');

  -- Question #32 (toeic_part_3)
  SELECT id INTO v_question_id FROM assessment_questions WHERE assessment_id = v_assessment_id AND position = 32;
  IF v_question_id IS NULL THEN
    INSERT INTO assessment_questions (assessment_id, skill, category, difficulty, level, question_type, prompt, context_text, audio_url, options, position, weight)
    VALUES (v_assessment_id, 'listening', 'toeic_part_3', 2, 'b1', 'multiple_choice', 'Who most likely are they?', 'Conversation Context (Questions 32 - 34)', '/audio/toeic/real_exam/toeic_p3_q32_34.mp3', '[{"id":"A","text":"A job candidate and an interviewer."},{"id":"B","text":"A marketing manager and a personnel manager."},{"id":"C","text":"Co-workers who work in the same department of a company."},{"id":"D","text":"A client and a shop employee."}]'::jsonb, 32, 1.0)
    RETURNING id INTO v_question_id;
  ELSE
    UPDATE assessment_questions SET
      skill = 'listening',
      category = 'toeic_part_3',
      difficulty = 2,
      level = 'b1',
      prompt = 'Who most likely are they?',
      context_text = 'Conversation Context (Questions 32 - 34)',
      audio_url = '/audio/toeic/real_exam/toeic_p3_q32_34.mp3',
      options = '[{"id":"A","text":"A job candidate and an interviewer."},{"id":"B","text":"A marketing manager and a personnel manager."},{"id":"C","text":"Co-workers who work in the same department of a company."},{"id":"D","text":"A client and a shop employee."}]'::jsonb
    WHERE id = v_question_id;
  END IF;

  -- Answer for #32
  DELETE FROM assessment_question_answers WHERE question_id = v_question_id;
  INSERT INTO assessment_question_answers (question_id, correct_option_id, explanation, transcript_text)
  VALUES (v_question_id, 'C', 'Đáp án đúng: C.

Đoạn hội thoại:
**M1:** Have you decided on whether you are going to apply for the job that''s opened up in marketing? (32)
**M2:** I thought it over, and I don''t think I am going to apply for it because the position doesn''t pay as much as I had thought. (33)
**M1:** That''s true, but there is a great chance for a quick promotion there. If I were you, I''d think it over again because in a couple of years you''ll be in much better situation than you would have been if you had stayed here.
**M2:** Hmm... I think you have a point there. Maybe I should try to see if I can get the position first. After all, I might not even be considered for it. (34)

Giải thích chi tiết:
#### Q32 (正确答案：C)
**问题：** Who most likely are they? (他们最有可能是谁？)
- (A) A job candidate and an interviewer. (职位候选人和面试官。)
- (B) A marketing manager and a personnel manager. (市场部经理和人事部经理。)
- (C) Co-workers who work in the same department of a company. (在公司同一个部门工作的同事。)
- (D) A client and a shop employee. (客户和店员。)

', '**M1:** Have you decided on whether you are going to apply for the job that''s opened up in marketing? (32)
**M2:** I thought it over, and I don''t think I am going to apply for it because the position doesn''t pay as much as I had thought. (33)
**M1:** That''s true, but there is a great chance for a quick promotion there. If I were you, I''d think it over again because in a couple of years you''ll be in much better situation than you would have been if you had stayed here.
**M2:** Hmm... I think you have a point there. Maybe I should try to see if I can get the position first. After all, I might not even be considered for it. (34)');

  -- Question #33 (toeic_part_3)
  SELECT id INTO v_question_id FROM assessment_questions WHERE assessment_id = v_assessment_id AND position = 33;
  IF v_question_id IS NULL THEN
    INSERT INTO assessment_questions (assessment_id, skill, category, difficulty, level, question_type, prompt, context_text, audio_url, options, position, weight)
    VALUES (v_assessment_id, 'listening', 'toeic_part_3', 2, 'b1', 'multiple_choice', 'Why is the man reluctant to transfer to another department?', 'Conversation Context (Questions 32 - 34)', '/audio/toeic/real_exam/toeic_p3_q32_34.mp3', '[{"id":"A","text":"He is happy with his current job."},{"id":"B","text":"He feels that he is not qualified for the open position."},{"id":"C","text":"He doesn''t like the people in the Marketing Department."},{"id":"D","text":"He would have to accept a pay cut if he got hired."}]'::jsonb, 33, 1.0)
    RETURNING id INTO v_question_id;
  ELSE
    UPDATE assessment_questions SET
      skill = 'listening',
      category = 'toeic_part_3',
      difficulty = 2,
      level = 'b1',
      prompt = 'Why is the man reluctant to transfer to another department?',
      context_text = 'Conversation Context (Questions 32 - 34)',
      audio_url = '/audio/toeic/real_exam/toeic_p3_q32_34.mp3',
      options = '[{"id":"A","text":"He is happy with his current job."},{"id":"B","text":"He feels that he is not qualified for the open position."},{"id":"C","text":"He doesn''t like the people in the Marketing Department."},{"id":"D","text":"He would have to accept a pay cut if he got hired."}]'::jsonb
    WHERE id = v_question_id;
  END IF;

  -- Answer for #33
  DELETE FROM assessment_question_answers WHERE question_id = v_question_id;
  INSERT INTO assessment_question_answers (question_id, correct_option_id, explanation, transcript_text)
  VALUES (v_question_id, 'D', 'Đáp án đúng: D.

Đoạn hội thoại:
**M1:** Have you decided on whether you are going to apply for the job that''s opened up in marketing? (32)
**M2:** I thought it over, and I don''t think I am going to apply for it because the position doesn''t pay as much as I had thought. (33)
**M1:** That''s true, but there is a great chance for a quick promotion there. If I were you, I''d think it over again because in a couple of years you''ll be in much better situation than you would have been if you had stayed here.
**M2:** Hmm... I think you have a point there. Maybe I should try to see if I can get the position first. After all, I might not even be considered for it. (34)

Giải thích chi tiết:
#### Q33 (正确答案：D)
**问题：** Why is the man reluctant to transfer to another department? (为什么男士不愿意调到另一个部门？)
- (A) He is happy with his current job. (他对现在的工作很满意。)
- (B) He feels that he is not qualified for the open position. (他觉得自己不能胜任这个空缺职位。)
- (C) He doesn''t like the people in the Marketing Department. (他不喜欢市场部的员工。)
- (D) He would have to accept a pay cut if he got hired. (他如果被聘用的话，就得接受降薪。)

', '**M1:** Have you decided on whether you are going to apply for the job that''s opened up in marketing? (32)
**M2:** I thought it over, and I don''t think I am going to apply for it because the position doesn''t pay as much as I had thought. (33)
**M1:** That''s true, but there is a great chance for a quick promotion there. If I were you, I''d think it over again because in a couple of years you''ll be in much better situation than you would have been if you had stayed here.
**M2:** Hmm... I think you have a point there. Maybe I should try to see if I can get the position first. After all, I might not even be considered for it. (34)');

  -- Question #34 (toeic_part_3)
  SELECT id INTO v_question_id FROM assessment_questions WHERE assessment_id = v_assessment_id AND position = 34;
  IF v_question_id IS NULL THEN
    INSERT INTO assessment_questions (assessment_id, skill, category, difficulty, level, question_type, prompt, context_text, audio_url, options, position, weight)
    VALUES (v_assessment_id, 'listening', 'toeic_part_3', 2, 'b1', 'multiple_choice', 'What will the man probably do?', 'Conversation Context (Questions 32 - 34)', '/audio/toeic/real_exam/toeic_p3_q32_34.mp3', '[{"id":"A","text":"Put in his application and face the outcome."},{"id":"B","text":"Talk to his boss about getting more details about the position."},{"id":"C","text":"Disregard the opportunity and wait for another time."},{"id":"D","text":"Work harder to be considered for the next promotion."}]'::jsonb, 34, 1.0)
    RETURNING id INTO v_question_id;
  ELSE
    UPDATE assessment_questions SET
      skill = 'listening',
      category = 'toeic_part_3',
      difficulty = 2,
      level = 'b1',
      prompt = 'What will the man probably do?',
      context_text = 'Conversation Context (Questions 32 - 34)',
      audio_url = '/audio/toeic/real_exam/toeic_p3_q32_34.mp3',
      options = '[{"id":"A","text":"Put in his application and face the outcome."},{"id":"B","text":"Talk to his boss about getting more details about the position."},{"id":"C","text":"Disregard the opportunity and wait for another time."},{"id":"D","text":"Work harder to be considered for the next promotion."}]'::jsonb
    WHERE id = v_question_id;
  END IF;

  -- Answer for #34
  DELETE FROM assessment_question_answers WHERE question_id = v_question_id;
  INSERT INTO assessment_question_answers (question_id, correct_option_id, explanation, transcript_text)
  VALUES (v_question_id, 'A', 'Đáp án đúng: A.

Đoạn hội thoại:
**M1:** Have you decided on whether you are going to apply for the job that''s opened up in marketing? (32)
**M2:** I thought it over, and I don''t think I am going to apply for it because the position doesn''t pay as much as I had thought. (33)
**M1:** That''s true, but there is a great chance for a quick promotion there. If I were you, I''d think it over again because in a couple of years you''ll be in much better situation than you would have been if you had stayed here.
**M2:** Hmm... I think you have a point there. Maybe I should try to see if I can get the position first. After all, I might not even be considered for it. (34)

Giải thích chi tiết:
#### Q34 (正确答案：A)
**问题：** What will the man probably do? (男士很可能怎么做？)
- (A) Put in his application and face the outcome. (递交他的申请，等待结果。)
- (B) Talk to his boss about getting more details about the position. (和老板谈谈，获取关于这个职位的更多信息。)
- (C) Disregard the opportunity and wait for another time. (不理会这次机会，等待下次。)
- (D) Work harder to be considered for the next promotion. (更加努力地工作，以便获得下一次提拔。)

**延伸表达与补充：**
- *', '**M1:** Have you decided on whether you are going to apply for the job that''s opened up in marketing? (32)
**M2:** I thought it over, and I don''t think I am going to apply for it because the position doesn''t pay as much as I had thought. (33)
**M1:** That''s true, but there is a great chance for a quick promotion there. If I were you, I''d think it over again because in a couple of years you''ll be in much better situation than you would have been if you had stayed here.
**M2:** Hmm... I think you have a point there. Maybe I should try to see if I can get the position first. After all, I might not even be considered for it. (34)');

  -- Question #35 (toeic_part_3)
  SELECT id INTO v_question_id FROM assessment_questions WHERE assessment_id = v_assessment_id AND position = 35;
  IF v_question_id IS NULL THEN
    INSERT INTO assessment_questions (assessment_id, skill, category, difficulty, level, question_type, prompt, context_text, audio_url, options, position, weight)
    VALUES (v_assessment_id, 'listening', 'toeic_part_3', 2, 'b1', 'multiple_choice', 'Who is the woman?', 'Conversation Context (Questions 35 - 37)', '/audio/toeic/real_exam/toeic_p3_q35_37.mp3', '[{"id":"A","text":"A visitor."},{"id":"B","text":"A building security guard."},{"id":"C","text":"A parking attendant."},{"id":"D","text":"An artist."}]'::jsonb, 35, 1.0)
    RETURNING id INTO v_question_id;
  ELSE
    UPDATE assessment_questions SET
      skill = 'listening',
      category = 'toeic_part_3',
      difficulty = 2,
      level = 'b1',
      prompt = 'Who is the woman?',
      context_text = 'Conversation Context (Questions 35 - 37)',
      audio_url = '/audio/toeic/real_exam/toeic_p3_q35_37.mp3',
      options = '[{"id":"A","text":"A visitor."},{"id":"B","text":"A building security guard."},{"id":"C","text":"A parking attendant."},{"id":"D","text":"An artist."}]'::jsonb
    WHERE id = v_question_id;
  END IF;

  -- Answer for #35
  DELETE FROM assessment_question_answers WHERE question_id = v_question_id;
  INSERT INTO assessment_question_answers (question_id, correct_option_id, explanation, transcript_text)
  VALUES (v_question_id, 'A', 'Đáp án đúng: A.

Đoạn hội thoại:
**W:** I have an appointment to meet with Mr. Ewing at 2. (35) Where can I park?
**M:** I''m sorry, but our underground parking lot is under renovation at the moment. There is free parking two blocks north of here, but there is a good chance that it might be a full house today because of the art exhibit. Your best bet is to turn your car around and drive back down this street to the intersection. (36) There is a pay lot there.
**W:** That''s quite a distance to walk back here. Do you think I would get a ticket if I just parked somewhere along this street? (37)
**M:** You can try, but I wouldn''t if I were you. I saw a car being towed away a few days ago. (37)

Giải thích chi tiết:
#### Q35 (正确答案：A)
**问题：** Who is the woman? (这位女士是谁？)
- (A) A visitor. (访客。)
- (B) A building security guard. (大楼保安。)
- (C) A parking attendant. (停车场服务员。)
- (D) An artist. (艺术家。)

', '**W:** I have an appointment to meet with Mr. Ewing at 2. (35) Where can I park?
**M:** I''m sorry, but our underground parking lot is under renovation at the moment. There is free parking two blocks north of here, but there is a good chance that it might be a full house today because of the art exhibit. Your best bet is to turn your car around and drive back down this street to the intersection. (36) There is a pay lot there.
**W:** That''s quite a distance to walk back here. Do you think I would get a ticket if I just parked somewhere along this street? (37)
**M:** You can try, but I wouldn''t if I were you. I saw a car being towed away a few days ago. (37)');

  -- Question #36 (toeic_part_3)
  SELECT id INTO v_question_id FROM assessment_questions WHERE assessment_id = v_assessment_id AND position = 36;
  IF v_question_id IS NULL THEN
    INSERT INTO assessment_questions (assessment_id, skill, category, difficulty, level, question_type, prompt, context_text, audio_url, options, position, weight)
    VALUES (v_assessment_id, 'listening', 'toeic_part_3', 2, 'b1', 'multiple_choice', 'What suggestion does the woman receive from the man?', 'Conversation Context (Questions 35 - 37)', '/audio/toeic/real_exam/toeic_p3_q35_37.mp3', '[{"id":"A","text":"See the art exhibit."},{"id":"B","text":"Park in the underground garage."},{"id":"C","text":"Turn back and drive down to the intersection."},{"id":"D","text":"Walk back to her house."}]'::jsonb, 36, 1.0)
    RETURNING id INTO v_question_id;
  ELSE
    UPDATE assessment_questions SET
      skill = 'listening',
      category = 'toeic_part_3',
      difficulty = 2,
      level = 'b1',
      prompt = 'What suggestion does the woman receive from the man?',
      context_text = 'Conversation Context (Questions 35 - 37)',
      audio_url = '/audio/toeic/real_exam/toeic_p3_q35_37.mp3',
      options = '[{"id":"A","text":"See the art exhibit."},{"id":"B","text":"Park in the underground garage."},{"id":"C","text":"Turn back and drive down to the intersection."},{"id":"D","text":"Walk back to her house."}]'::jsonb
    WHERE id = v_question_id;
  END IF;

  -- Answer for #36
  DELETE FROM assessment_question_answers WHERE question_id = v_question_id;
  INSERT INTO assessment_question_answers (question_id, correct_option_id, explanation, transcript_text)
  VALUES (v_question_id, 'C', 'Đáp án đúng: C.

Đoạn hội thoại:
**W:** I have an appointment to meet with Mr. Ewing at 2. (35) Where can I park?
**M:** I''m sorry, but our underground parking lot is under renovation at the moment. There is free parking two blocks north of here, but there is a good chance that it might be a full house today because of the art exhibit. Your best bet is to turn your car around and drive back down this street to the intersection. (36) There is a pay lot there.
**W:** That''s quite a distance to walk back here. Do you think I would get a ticket if I just parked somewhere along this street? (37)
**M:** You can try, but I wouldn''t if I were you. I saw a car being towed away a few days ago. (37)

Giải thích chi tiết:
#### Q36 (正确答案：C)
**问题：** What suggestion does the woman receive from the man? (女士从男士那里得到了什么建议？)
- (A) See the art exhibit. (观看艺术展。)
- (B) Park in the underground garage. (在地下车库停车。)
- (C) Turn back and drive down to the intersection. (掉头，开到十字路口。)
- (D) Walk back to her house. (走回家。)

', '**W:** I have an appointment to meet with Mr. Ewing at 2. (35) Where can I park?
**M:** I''m sorry, but our underground parking lot is under renovation at the moment. There is free parking two blocks north of here, but there is a good chance that it might be a full house today because of the art exhibit. Your best bet is to turn your car around and drive back down this street to the intersection. (36) There is a pay lot there.
**W:** That''s quite a distance to walk back here. Do you think I would get a ticket if I just parked somewhere along this street? (37)
**M:** You can try, but I wouldn''t if I were you. I saw a car being towed away a few days ago. (37)');

  -- Question #37 (toeic_part_3)
  SELECT id INTO v_question_id FROM assessment_questions WHERE assessment_id = v_assessment_id AND position = 37;
  IF v_question_id IS NULL THEN
    INSERT INTO assessment_questions (assessment_id, skill, category, difficulty, level, question_type, prompt, context_text, audio_url, options, position, weight)
    VALUES (v_assessment_id, 'listening', 'toeic_part_3', 2, 'b1', 'multiple_choice', 'What does the man imply when he says, “You can try, but I wouldn''t if I were you”?', 'Conversation Context (Questions 35 - 37)', '/audio/toeic/real_exam/toeic_p3_q35_37.mp3', '[{"id":"A","text":"The woman should drive back home."},{"id":"B","text":"The woman should buy a ticket to the exhibit."},{"id":"C","text":"The woman should pay for the towing fee."},{"id":"D","text":"The woman should park her car somewhere else."}]'::jsonb, 37, 1.0)
    RETURNING id INTO v_question_id;
  ELSE
    UPDATE assessment_questions SET
      skill = 'listening',
      category = 'toeic_part_3',
      difficulty = 2,
      level = 'b1',
      prompt = 'What does the man imply when he says, “You can try, but I wouldn''t if I were you”?',
      context_text = 'Conversation Context (Questions 35 - 37)',
      audio_url = '/audio/toeic/real_exam/toeic_p3_q35_37.mp3',
      options = '[{"id":"A","text":"The woman should drive back home."},{"id":"B","text":"The woman should buy a ticket to the exhibit."},{"id":"C","text":"The woman should pay for the towing fee."},{"id":"D","text":"The woman should park her car somewhere else."}]'::jsonb
    WHERE id = v_question_id;
  END IF;

  -- Answer for #37
  DELETE FROM assessment_question_answers WHERE question_id = v_question_id;
  INSERT INTO assessment_question_answers (question_id, correct_option_id, explanation, transcript_text)
  VALUES (v_question_id, 'D', 'Đáp án đúng: D.

Đoạn hội thoại:
**W:** I have an appointment to meet with Mr. Ewing at 2. (35) Where can I park?
**M:** I''m sorry, but our underground parking lot is under renovation at the moment. There is free parking two blocks north of here, but there is a good chance that it might be a full house today because of the art exhibit. Your best bet is to turn your car around and drive back down this street to the intersection. (36) There is a pay lot there.
**W:** That''s quite a distance to walk back here. Do you think I would get a ticket if I just parked somewhere along this street? (37)
**M:** You can try, but I wouldn''t if I were you. I saw a car being towed away a few days ago. (37)

Giải thích chi tiết:
#### Q37 (正确答案：D)
**问题：** What does the man imply when he says, “You can try, but I wouldn''t if I were you”? (男士说 “ 你可以试试，但是如果我是你，就不会这样做 ” ，他在暗示什么？)
- (A) The woman should drive back home. (女士应该开车回家。)
- (B) The woman should buy a ticket to the exhibit. (女士应该买一张展会门票。)
- (C) The woman should pay for the towing fee. (女士应该付拖车费。)
- (D) The woman should park her car somewhere else. (女士应该把车停在别的地方。)

**延伸', '**W:** I have an appointment to meet with Mr. Ewing at 2. (35) Where can I park?
**M:** I''m sorry, but our underground parking lot is under renovation at the moment. There is free parking two blocks north of here, but there is a good chance that it might be a full house today because of the art exhibit. Your best bet is to turn your car around and drive back down this street to the intersection. (36) There is a pay lot there.
**W:** That''s quite a distance to walk back here. Do you think I would get a ticket if I just parked somewhere along this street? (37)
**M:** You can try, but I wouldn''t if I were you. I saw a car being towed away a few days ago. (37)');

  -- Question #38 (toeic_part_3)
  SELECT id INTO v_question_id FROM assessment_questions WHERE assessment_id = v_assessment_id AND position = 38;
  IF v_question_id IS NULL THEN
    INSERT INTO assessment_questions (assessment_id, skill, category, difficulty, level, question_type, prompt, context_text, audio_url, options, position, weight)
    VALUES (v_assessment_id, 'listening', 'toeic_part_3', 2, 'b1', 'multiple_choice', 'Why does the man call the woman?', 'Conversation Context (Questions 38 - 40)', '/audio/toeic/real_exam/toeic_p3_q38_40.mp3', '[{"id":"A","text":"To ask for permission to do something."},{"id":"B","text":"To invite her to visit his shop."},{"id":"C","text":"To tell her that some work is done."},{"id":"D","text":"To explain what he did."}]'::jsonb, 38, 1.0)
    RETURNING id INTO v_question_id;
  ELSE
    UPDATE assessment_questions SET
      skill = 'listening',
      category = 'toeic_part_3',
      difficulty = 2,
      level = 'b1',
      prompt = 'Why does the man call the woman?',
      context_text = 'Conversation Context (Questions 38 - 40)',
      audio_url = '/audio/toeic/real_exam/toeic_p3_q38_40.mp3',
      options = '[{"id":"A","text":"To ask for permission to do something."},{"id":"B","text":"To invite her to visit his shop."},{"id":"C","text":"To tell her that some work is done."},{"id":"D","text":"To explain what he did."}]'::jsonb
    WHERE id = v_question_id;
  END IF;

  -- Answer for #38
  DELETE FROM assessment_question_answers WHERE question_id = v_question_id;
  INSERT INTO assessment_question_answers (question_id, correct_option_id, explanation, transcript_text)
  VALUES (v_question_id, 'C', 'Đáp án đúng: C.

Đoạn hội thoại:
**M:** Hello, Ms. Mercer. This is James Murdock from Speedy Auto Mechanics. The work on your vehicle has been completed. (38)
**W:** That''s excellent news. Unfortunately, I''m going to be in meetings all day, so I can''t pick it up until tomorrow.
**M:** If you give me your office address, I can have someone drop it off there. (39)
**W:** Would you do that for me? I''d really appreciate it. I work at 983 Emerson Lane.
**M:** All right, your car should be there in around an hour. I''ll have the driver call you when he arrives.
**W:** Great. And if he can give me the bill then, I''d appreciate it. (40)

Giải thích chi tiết:
#### Q38 (正确答案：C)
**问题：** Why does the man call the woman? (男士为什么给女士打电话？)
- (A) To ask for permission to do something. (请求允许做某事。)
- (B) To invite her to visit his shop. (邀请她参观他的商店。)
- (C) To tell her that some work is done. (告诉她某些工作已经完成。)
- (D) To explain what he did. (解释他的行为。)

', '**M:** Hello, Ms. Mercer. This is James Murdock from Speedy Auto Mechanics. The work on your vehicle has been completed. (38)
**W:** That''s excellent news. Unfortunately, I''m going to be in meetings all day, so I can''t pick it up until tomorrow.
**M:** If you give me your office address, I can have someone drop it off there. (39)
**W:** Would you do that for me? I''d really appreciate it. I work at 983 Emerson Lane.
**M:** All right, your car should be there in around an hour. I''ll have the driver call you when he arrives.
**W:** Great. And if he can give me the bill then, I''d appreciate it. (40)');

  -- Question #39 (toeic_part_3)
  SELECT id INTO v_question_id FROM assessment_questions WHERE assessment_id = v_assessment_id AND position = 39;
  IF v_question_id IS NULL THEN
    INSERT INTO assessment_questions (assessment_id, skill, category, difficulty, level, question_type, prompt, context_text, audio_url, options, position, weight)
    VALUES (v_assessment_id, 'listening', 'toeic_part_3', 2, 'b1', 'multiple_choice', 'What does the man offer to do?', 'Conversation Context (Questions 38 - 40)', '/audio/toeic/real_exam/toeic_p3_q38_40.mp3', '[{"id":"A","text":"Have a car delivered."},{"id":"B","text":"Lower a price."},{"id":"C","text":"Call the woman again later."},{"id":"D","text":"Reschedule an appointment."}]'::jsonb, 39, 1.0)
    RETURNING id INTO v_question_id;
  ELSE
    UPDATE assessment_questions SET
      skill = 'listening',
      category = 'toeic_part_3',
      difficulty = 2,
      level = 'b1',
      prompt = 'What does the man offer to do?',
      context_text = 'Conversation Context (Questions 38 - 40)',
      audio_url = '/audio/toeic/real_exam/toeic_p3_q38_40.mp3',
      options = '[{"id":"A","text":"Have a car delivered."},{"id":"B","text":"Lower a price."},{"id":"C","text":"Call the woman again later."},{"id":"D","text":"Reschedule an appointment."}]'::jsonb
    WHERE id = v_question_id;
  END IF;

  -- Answer for #39
  DELETE FROM assessment_question_answers WHERE question_id = v_question_id;
  INSERT INTO assessment_question_answers (question_id, correct_option_id, explanation, transcript_text)
  VALUES (v_question_id, 'A', 'Đáp án đúng: A.

Đoạn hội thoại:
**M:** Hello, Ms. Mercer. This is James Murdock from Speedy Auto Mechanics. The work on your vehicle has been completed. (38)
**W:** That''s excellent news. Unfortunately, I''m going to be in meetings all day, so I can''t pick it up until tomorrow.
**M:** If you give me your office address, I can have someone drop it off there. (39)
**W:** Would you do that for me? I''d really appreciate it. I work at 983 Emerson Lane.
**M:** All right, your car should be there in around an hour. I''ll have the driver call you when he arrives.
**W:** Great. And if he can give me the bill then, I''d appreciate it. (40)

Giải thích chi tiết:
#### Q39 (正确答案：A)
**问题：** What does the man offer to do? (男士主动提出做什么？)
- (A) Have a car delivered. (把车送过去。)
- (B) Lower a price. (降低价格。)
- (C) Call the woman again later. (稍后再给这位女士打电话。)
- (D) Reschedule an appointment. (重新安排一次会面。)

', '**M:** Hello, Ms. Mercer. This is James Murdock from Speedy Auto Mechanics. The work on your vehicle has been completed. (38)
**W:** That''s excellent news. Unfortunately, I''m going to be in meetings all day, so I can''t pick it up until tomorrow.
**M:** If you give me your office address, I can have someone drop it off there. (39)
**W:** Would you do that for me? I''d really appreciate it. I work at 983 Emerson Lane.
**M:** All right, your car should be there in around an hour. I''ll have the driver call you when he arrives.
**W:** Great. And if he can give me the bill then, I''d appreciate it. (40)');

  -- Question #40 (toeic_part_3)
  SELECT id INTO v_question_id FROM assessment_questions WHERE assessment_id = v_assessment_id AND position = 40;
  IF v_question_id IS NULL THEN
    INSERT INTO assessment_questions (assessment_id, skill, category, difficulty, level, question_type, prompt, context_text, audio_url, options, position, weight)
    VALUES (v_assessment_id, 'listening', 'toeic_part_3', 2, 'b1', 'multiple_choice', 'What does the woman request?', 'Conversation Context (Questions 38 - 40)', '/audio/toeic/real_exam/toeic_p3_q38_40.mp3', '[{"id":"A","text":"A refund."},{"id":"B","text":"The bill."},{"id":"C","text":"A discount coupon."},{"id":"D","text":"An itinerary."}]'::jsonb, 40, 1.0)
    RETURNING id INTO v_question_id;
  ELSE
    UPDATE assessment_questions SET
      skill = 'listening',
      category = 'toeic_part_3',
      difficulty = 2,
      level = 'b1',
      prompt = 'What does the woman request?',
      context_text = 'Conversation Context (Questions 38 - 40)',
      audio_url = '/audio/toeic/real_exam/toeic_p3_q38_40.mp3',
      options = '[{"id":"A","text":"A refund."},{"id":"B","text":"The bill."},{"id":"C","text":"A discount coupon."},{"id":"D","text":"An itinerary."}]'::jsonb
    WHERE id = v_question_id;
  END IF;

  -- Answer for #40
  DELETE FROM assessment_question_answers WHERE question_id = v_question_id;
  INSERT INTO assessment_question_answers (question_id, correct_option_id, explanation, transcript_text)
  VALUES (v_question_id, 'B', 'Đáp án đúng: B.

Đoạn hội thoại:
**M:** Hello, Ms. Mercer. This is James Murdock from Speedy Auto Mechanics. The work on your vehicle has been completed. (38)
**W:** That''s excellent news. Unfortunately, I''m going to be in meetings all day, so I can''t pick it up until tomorrow.
**M:** If you give me your office address, I can have someone drop it off there. (39)
**W:** Would you do that for me? I''d really appreciate it. I work at 983 Emerson Lane.
**M:** All right, your car should be there in around an hour. I''ll have the driver call you when he arrives.
**W:** Great. And if he can give me the bill then, I''d appreciate it. (40)

Giải thích chi tiết:
#### Q40 (正确答案：B)
**问题：** What does the woman request? (女士要求什么？)
- (A) A refund. (退款。)
- (B) The bill. (账单。)
- (C) A discount coupon. (一张打折券。)
- (D) An itinerary. (一个旅行计划。)

**延伸表达与补充：**
- **pick sth. up = fetch I''ve got to pick up my coat from the laundry.** (我得到洗衣店去取大衣了。)
- **drop sb./sth. off** (让某人下车；中途顺便将某物送交某处扩展表达：)
  - *例句：drop in (on sb.) Could you drop me off near the park?* (顺便拜访（某人）你可以让', '**M:** Hello, Ms. Mercer. This is James Murdock from Speedy Auto Mechanics. The work on your vehicle has been completed. (38)
**W:** That''s excellent news. Unfortunately, I''m going to be in meetings all day, so I can''t pick it up until tomorrow.
**M:** If you give me your office address, I can have someone drop it off there. (39)
**W:** Would you do that for me? I''d really appreciate it. I work at 983 Emerson Lane.
**M:** All right, your car should be there in around an hour. I''ll have the driver call you when he arrives.
**W:** Great. And if he can give me the bill then, I''d appreciate it. (40)');

  -- Question #41 (toeic_part_3)
  SELECT id INTO v_question_id FROM assessment_questions WHERE assessment_id = v_assessment_id AND position = 41;
  IF v_question_id IS NULL THEN
    INSERT INTO assessment_questions (assessment_id, skill, category, difficulty, level, question_type, prompt, context_text, audio_url, options, position, weight)
    VALUES (v_assessment_id, 'listening', 'toeic_part_3', 2, 'b1', 'multiple_choice', 'What is the man doing?', 'Conversation Context (Questions 41 - 43)', '/audio/toeic/real_exam/toeic_p3_q41_43.mp3', '[{"id":"A","text":"He is trying to buy some clothing."},{"id":"B","text":"He is looking for a bank."},{"id":"C","text":"He is preparing to start a business."},{"id":"D","text":"He is serving a customer."}]'::jsonb, 41, 1.0)
    RETURNING id INTO v_question_id;
  ELSE
    UPDATE assessment_questions SET
      skill = 'listening',
      category = 'toeic_part_3',
      difficulty = 2,
      level = 'b1',
      prompt = 'What is the man doing?',
      context_text = 'Conversation Context (Questions 41 - 43)',
      audio_url = '/audio/toeic/real_exam/toeic_p3_q41_43.mp3',
      options = '[{"id":"A","text":"He is trying to buy some clothing."},{"id":"B","text":"He is looking for a bank."},{"id":"C","text":"He is preparing to start a business."},{"id":"D","text":"He is serving a customer."}]'::jsonb
    WHERE id = v_question_id;
  END IF;

  -- Answer for #41
  DELETE FROM assessment_question_answers WHERE question_id = v_question_id;
  INSERT INTO assessment_question_answers (question_id, correct_option_id, explanation, transcript_text)
  VALUES (v_question_id, 'A', 'Đáp án đúng: A.

Đoạn hội thoại:
**M:** I am wondering if you carry men''s shirts in extra large here. (41) I''ve been looking through all the stores on this entire block for the last hour, but I haven''t had any luck with finding anything that fits me properly.
**W:** You''re in luck because we not only carry them but we also have clothes that are fashionable for people who need large-sized clothing here in the back section of the store.Follow me, and I am quite certain that you will be able to find something you like. （ 42, 43 ）
**M:** This is great. I am sure that many oversized people would find your store useful. It''s not easy for us big people to find clothes that we like. Have you been in business for long?
**W:** Yes, we''ve been around for a couple of years now, and we have a steady stream of customers coming into the store regularly.

Giải thích chi tiết:
#### Q41 (正确答案：A)
**问题：** What is the man doing? (男士在做什么？)
- (A) He is trying to buy some clothing. (他在试图买衣服。)
- (B) He is looking for a bank. (他在寻找一家银行。)
- (C) He is preparing to start a business. (他在准备开一家公司。)
- (D) He is serving a customer. (他在为一位顾客服务。)

', '**M:** I am wondering if you carry men''s shirts in extra large here. (41) I''ve been looking through all the stores on this entire block for the last hour, but I haven''t had any luck with finding anything that fits me properly.
**W:** You''re in luck because we not only carry them but we also have clothes that are fashionable for people who need large-sized clothing here in the back section of the store.Follow me, and I am quite certain that you will be able to find something you like. （ 42, 43 ）
**M:** This is great. I am sure that many oversized people would find your store useful. It''s not easy for us big people to find clothes that we like. Have you been in business for long?
**W:** Yes, we''ve been around for a couple of years now, and we have a steady stream of customers coming into the store regularly.');

  -- Question #42 (toeic_part_3)
  SELECT id INTO v_question_id FROM assessment_questions WHERE assessment_id = v_assessment_id AND position = 42;
  IF v_question_id IS NULL THEN
    INSERT INTO assessment_questions (assessment_id, skill, category, difficulty, level, question_type, prompt, context_text, audio_url, options, position, weight)
    VALUES (v_assessment_id, 'listening', 'toeic_part_3', 2, 'b1', 'multiple_choice', 'Where will the man most likely go next?', 'Conversation Context (Questions 41 - 43)', '/audio/toeic/real_exam/toeic_p3_q41_43.mp3', '[{"id":"A","text":"To another store."},{"id":"B","text":"To the back part of the store."},{"id":"C","text":"To a fashion show."},{"id":"D","text":"To see a customer."}]'::jsonb, 42, 1.0)
    RETURNING id INTO v_question_id;
  ELSE
    UPDATE assessment_questions SET
      skill = 'listening',
      category = 'toeic_part_3',
      difficulty = 2,
      level = 'b1',
      prompt = 'Where will the man most likely go next?',
      context_text = 'Conversation Context (Questions 41 - 43)',
      audio_url = '/audio/toeic/real_exam/toeic_p3_q41_43.mp3',
      options = '[{"id":"A","text":"To another store."},{"id":"B","text":"To the back part of the store."},{"id":"C","text":"To a fashion show."},{"id":"D","text":"To see a customer."}]'::jsonb
    WHERE id = v_question_id;
  END IF;

  -- Answer for #42
  DELETE FROM assessment_question_answers WHERE question_id = v_question_id;
  INSERT INTO assessment_question_answers (question_id, correct_option_id, explanation, transcript_text)
  VALUES (v_question_id, 'B', 'Đáp án đúng: B.

Đoạn hội thoại:
**M:** I am wondering if you carry men''s shirts in extra large here. (41) I''ve been looking through all the stores on this entire block for the last hour, but I haven''t had any luck with finding anything that fits me properly.
**W:** You''re in luck because we not only carry them but we also have clothes that are fashionable for people who need large-sized clothing here in the back section of the store.Follow me, and I am quite certain that you will be able to find something you like. （ 42, 43 ）
**M:** This is great. I am sure that many oversized people would find your store useful. It''s not easy for us big people to find clothes that we like. Have you been in business for long?
**W:** Yes, we''ve been around for a couple of years now, and we have a steady stream of customers coming into the store regularly.

Giải thích chi tiết:
#### Q42 (正确答案：B)
**问题：** Where will the man most likely go next? (男士下一步最有可能去哪儿？)
- (A) To another store. (去另一家商店。)
- (B) To the back part of the store. (到这家商店的后面去。)
- (C) To a fashion show. (去参加一个时装展。)
- (D) To see a customer. (去见一个顾客。)

', '**M:** I am wondering if you carry men''s shirts in extra large here. (41) I''ve been looking through all the stores on this entire block for the last hour, but I haven''t had any luck with finding anything that fits me properly.
**W:** You''re in luck because we not only carry them but we also have clothes that are fashionable for people who need large-sized clothing here in the back section of the store.Follow me, and I am quite certain that you will be able to find something you like. （ 42, 43 ）
**M:** This is great. I am sure that many oversized people would find your store useful. It''s not easy for us big people to find clothes that we like. Have you been in business for long?
**W:** Yes, we''ve been around for a couple of years now, and we have a steady stream of customers coming into the store regularly.');

  -- Question #43 (toeic_part_3)
  SELECT id INTO v_question_id FROM assessment_questions WHERE assessment_id = v_assessment_id AND position = 43;
  IF v_question_id IS NULL THEN
    INSERT INTO assessment_questions (assessment_id, skill, category, difficulty, level, question_type, prompt, context_text, audio_url, options, position, weight)
    VALUES (v_assessment_id, 'listening', 'toeic_part_3', 2, 'b1', 'multiple_choice', 'What is special about this place?', 'Conversation Context (Questions 41 - 43)', '/audio/toeic/real_exam/toeic_p3_q41_43.mp3', '[{"id":"A","text":"The items are reasonably priced."},{"id":"B","text":"It is located close to the man''s place."},{"id":"C","text":"It carries items that other stores don''t have."},{"id":"D","text":"It has been in business for many years."}]'::jsonb, 43, 1.0)
    RETURNING id INTO v_question_id;
  ELSE
    UPDATE assessment_questions SET
      skill = 'listening',
      category = 'toeic_part_3',
      difficulty = 2,
      level = 'b1',
      prompt = 'What is special about this place?',
      context_text = 'Conversation Context (Questions 41 - 43)',
      audio_url = '/audio/toeic/real_exam/toeic_p3_q41_43.mp3',
      options = '[{"id":"A","text":"The items are reasonably priced."},{"id":"B","text":"It is located close to the man''s place."},{"id":"C","text":"It carries items that other stores don''t have."},{"id":"D","text":"It has been in business for many years."}]'::jsonb
    WHERE id = v_question_id;
  END IF;

  -- Answer for #43
  DELETE FROM assessment_question_answers WHERE question_id = v_question_id;
  INSERT INTO assessment_question_answers (question_id, correct_option_id, explanation, transcript_text)
  VALUES (v_question_id, 'C', 'Đáp án đúng: C.

Đoạn hội thoại:
**M:** I am wondering if you carry men''s shirts in extra large here. (41) I''ve been looking through all the stores on this entire block for the last hour, but I haven''t had any luck with finding anything that fits me properly.
**W:** You''re in luck because we not only carry them but we also have clothes that are fashionable for people who need large-sized clothing here in the back section of the store.Follow me, and I am quite certain that you will be able to find something you like. （ 42, 43 ）
**M:** This is great. I am sure that many oversized people would find your store useful. It''s not easy for us big people to find clothes that we like. Have you been in business for long?
**W:** Yes, we''ve been around for a couple of years now, and we have a steady stream of customers coming into the store regularly.

Giải thích chi tiết:
#### Q43 (正确答案：C)
**问题：** What is special about this place? (这家店的特别之处是什么？)
- (A) The items are reasonably priced. (商品的价格合理。)
- (B) It is located close to the man''s place. (它离男士的住处很近。)
- (C) It carries items that other stores don''t have. (它有其他商店没有的商品。)
- (D) It has been in business for many years. (它经营好多年了。)

**延伸表达与补充：**
- **I am wondering if you carry ～ = I am wondering if you have ～ in stock = I', '**M:** I am wondering if you carry men''s shirts in extra large here. (41) I''ve been looking through all the stores on this entire block for the last hour, but I haven''t had any luck with finding anything that fits me properly.
**W:** You''re in luck because we not only carry them but we also have clothes that are fashionable for people who need large-sized clothing here in the back section of the store.Follow me, and I am quite certain that you will be able to find something you like. （ 42, 43 ）
**M:** This is great. I am sure that many oversized people would find your store useful. It''s not easy for us big people to find clothes that we like. Have you been in business for long?
**W:** Yes, we''ve been around for a couple of years now, and we have a steady stream of customers coming into the store regularly.');

  -- Question #44 (toeic_part_3)
  SELECT id INTO v_question_id FROM assessment_questions WHERE assessment_id = v_assessment_id AND position = 44;
  IF v_question_id IS NULL THEN
    INSERT INTO assessment_questions (assessment_id, skill, category, difficulty, level, question_type, prompt, context_text, audio_url, options, position, weight)
    VALUES (v_assessment_id, 'listening', 'toeic_part_3', 2, 'b1', 'multiple_choice', 'What is the man asking the woman about?', 'Conversation Context (Questions 44 - 46)', '/audio/toeic/real_exam/toeic_p3_q44_46.mp3', '[{"id":"A","text":"An error made in his paycheck."},{"id":"B","text":"A warning he had received at work."},{"id":"C","text":"The lunch menu at a restaurant he wants to go to."},{"id":"D","text":"A notification of an unpaid bill."}]'::jsonb, 44, 1.0)
    RETURNING id INTO v_question_id;
  ELSE
    UPDATE assessment_questions SET
      skill = 'listening',
      category = 'toeic_part_3',
      difficulty = 2,
      level = 'b1',
      prompt = 'What is the man asking the woman about?',
      context_text = 'Conversation Context (Questions 44 - 46)',
      audio_url = '/audio/toeic/real_exam/toeic_p3_q44_46.mp3',
      options = '[{"id":"A","text":"An error made in his paycheck."},{"id":"B","text":"A warning he had received at work."},{"id":"C","text":"The lunch menu at a restaurant he wants to go to."},{"id":"D","text":"A notification of an unpaid bill."}]'::jsonb
    WHERE id = v_question_id;
  END IF;

  -- Answer for #44
  DELETE FROM assessment_question_answers WHERE question_id = v_question_id;
  INSERT INTO assessment_question_answers (question_id, correct_option_id, explanation, transcript_text)
  VALUES (v_question_id, 'D', 'Đáp án đúng: D.

Đoạn hội thoại:
**M:** Why didn''t you take care of the electricity bill? I gave you my share of the bill and told you to pay it last Wednesday. We just got a second notice in the mail today. (44)
**W:** You are kidding me. I was busy on the day you asked me because I had to run an important errand for my boss, so I just couldn''t get to the bank on time. And then I completely forgot all about it on Thursday because of the seminar I had to attend. I only remembered it after lunch on Friday and went straight to the bank and paid it. (45)
**M:** I guess they must have sent out the notice before you paid then. I''ll call them and straighten this out. (46)
**W:** I am sorry, but I couldn''t help it. I''ll remember to take care of the bills early from now on.

Giải thích chi tiết:
#### Q44 (正确答案：D)
**问题：** What is the man asking the woman about? (男士在问女士什么？)
- (A) An error made in his paycheck. (他工资支票上的一个错误。)
- (B) A warning he had received at work. (他在工作中收到的一个警告。)
- (C) The lunch menu at a restaurant he wants to go to. (他想去的一家饭店的午餐菜单。)
- (D) A notification of an unpaid bill. (一个未付账单的通知单。)

', '**M:** Why didn''t you take care of the electricity bill? I gave you my share of the bill and told you to pay it last Wednesday. We just got a second notice in the mail today. (44)
**W:** You are kidding me. I was busy on the day you asked me because I had to run an important errand for my boss, so I just couldn''t get to the bank on time. And then I completely forgot all about it on Thursday because of the seminar I had to attend. I only remembered it after lunch on Friday and went straight to the bank and paid it. (45)
**M:** I guess they must have sent out the notice before you paid then. I''ll call them and straighten this out. (46)
**W:** I am sorry, but I couldn''t help it. I''ll remember to take care of the bills early from now on.');

  -- Question #45 (toeic_part_3)
  SELECT id INTO v_question_id FROM assessment_questions WHERE assessment_id = v_assessment_id AND position = 45;
  IF v_question_id IS NULL THEN
    INSERT INTO assessment_questions (assessment_id, skill, category, difficulty, level, question_type, prompt, context_text, audio_url, options, position, weight)
    VALUES (v_assessment_id, 'listening', 'toeic_part_3', 2, 'b1', 'multiple_choice', 'What will the man do?', 'Conversation Context (Questions 44 - 46)', '/audio/toeic/real_exam/toeic_p3_q44_46.mp3', '[{"id":"A","text":"Drop by the bank."},{"id":"B","text":"Take care of a misunderstanding."},{"id":"C","text":"Call another electrician."},{"id":"D","text":"Go on an errand."}]'::jsonb, 45, 1.0)
    RETURNING id INTO v_question_id;
  ELSE
    UPDATE assessment_questions SET
      skill = 'listening',
      category = 'toeic_part_3',
      difficulty = 2,
      level = 'b1',
      prompt = 'What will the man do?',
      context_text = 'Conversation Context (Questions 44 - 46)',
      audio_url = '/audio/toeic/real_exam/toeic_p3_q44_46.mp3',
      options = '[{"id":"A","text":"Drop by the bank."},{"id":"B","text":"Take care of a misunderstanding."},{"id":"C","text":"Call another electrician."},{"id":"D","text":"Go on an errand."}]'::jsonb
    WHERE id = v_question_id;
  END IF;

  -- Answer for #45
  DELETE FROM assessment_question_answers WHERE question_id = v_question_id;
  INSERT INTO assessment_question_answers (question_id, correct_option_id, explanation, transcript_text)
  VALUES (v_question_id, 'B', 'Đáp án đúng: B.

Đoạn hội thoại:
**M:** Why didn''t you take care of the electricity bill? I gave you my share of the bill and told you to pay it last Wednesday. We just got a second notice in the mail today. (44)
**W:** You are kidding me. I was busy on the day you asked me because I had to run an important errand for my boss, so I just couldn''t get to the bank on time. And then I completely forgot all about it on Thursday because of the seminar I had to attend. I only remembered it after lunch on Friday and went straight to the bank and paid it. (45)
**M:** I guess they must have sent out the notice before you paid then. I''ll call them and straighten this out. (46)
**W:** I am sorry, but I couldn''t help it. I''ll remember to take care of the bills early from now on.

Giải thích chi tiết:
#### Q45 (正确答案：B)
**问题：** What will the man do? (男士会做什么？)
- (A) Drop by the bank. (顺便去趟银行。)
- (B) Take care of a misunderstanding. (处理一个误会。)
- (C) Call another electrician. (给另一个电工打电话。)
- (D) Go on an errand. (去办事。)

', '**M:** Why didn''t you take care of the electricity bill? I gave you my share of the bill and told you to pay it last Wednesday. We just got a second notice in the mail today. (44)
**W:** You are kidding me. I was busy on the day you asked me because I had to run an important errand for my boss, so I just couldn''t get to the bank on time. And then I completely forgot all about it on Thursday because of the seminar I had to attend. I only remembered it after lunch on Friday and went straight to the bank and paid it. (45)
**M:** I guess they must have sent out the notice before you paid then. I''ll call them and straighten this out. (46)
**W:** I am sorry, but I couldn''t help it. I''ll remember to take care of the bills early from now on.');

  -- Question #46 (toeic_part_3)
  SELECT id INTO v_question_id FROM assessment_questions WHERE assessment_id = v_assessment_id AND position = 46;
  IF v_question_id IS NULL THEN
    INSERT INTO assessment_questions (assessment_id, skill, category, difficulty, level, question_type, prompt, context_text, audio_url, options, position, weight)
    VALUES (v_assessment_id, 'listening', 'toeic_part_3', 2, 'b1', 'multiple_choice', 'When was the bill taken care of?', 'Conversation Context (Questions 44 - 46)', '/audio/toeic/real_exam/toeic_p3_q44_46.mp3', '[{"id":"A","text":"Wednesday."},{"id":"B","text":"Thursday."},{"id":"C","text":"Friday."},{"id":"D","text":"This morning."}]'::jsonb, 46, 1.0)
    RETURNING id INTO v_question_id;
  ELSE
    UPDATE assessment_questions SET
      skill = 'listening',
      category = 'toeic_part_3',
      difficulty = 2,
      level = 'b1',
      prompt = 'When was the bill taken care of?',
      context_text = 'Conversation Context (Questions 44 - 46)',
      audio_url = '/audio/toeic/real_exam/toeic_p3_q44_46.mp3',
      options = '[{"id":"A","text":"Wednesday."},{"id":"B","text":"Thursday."},{"id":"C","text":"Friday."},{"id":"D","text":"This morning."}]'::jsonb
    WHERE id = v_question_id;
  END IF;

  -- Answer for #46
  DELETE FROM assessment_question_answers WHERE question_id = v_question_id;
  INSERT INTO assessment_question_answers (question_id, correct_option_id, explanation, transcript_text)
  VALUES (v_question_id, 'C', 'Đáp án đúng: C.

Đoạn hội thoại:
**M:** Why didn''t you take care of the electricity bill? I gave you my share of the bill and told you to pay it last Wednesday. We just got a second notice in the mail today. (44)
**W:** You are kidding me. I was busy on the day you asked me because I had to run an important errand for my boss, so I just couldn''t get to the bank on time. And then I completely forgot all about it on Thursday because of the seminar I had to attend. I only remembered it after lunch on Friday and went straight to the bank and paid it. (45)
**M:** I guess they must have sent out the notice before you paid then. I''ll call them and straighten this out. (46)
**W:** I am sorry, but I couldn''t help it. I''ll remember to take care of the bills early from now on.

Giải thích chi tiết:
#### Q46 (正确答案：C)
**问题：** When was the bill taken care of? (账单的费用是什么时候交的？)
- (A) Wednesday. (周三。)
- (B) Thursday. (周四。)
- (C) Friday. (周五。)
- (D) This morning. (今天上午。)

**延伸表达与补充：**
- **Why didn''t you take care of the electricity bill? = Why didn''t you pay the electricity bill? = Why wasn''t the electricity bill paid?** (你为什么没有交电费？)
- **I gave you my share of the bill. = I gave you the money for my', '**M:** Why didn''t you take care of the electricity bill? I gave you my share of the bill and told you to pay it last Wednesday. We just got a second notice in the mail today. (44)
**W:** You are kidding me. I was busy on the day you asked me because I had to run an important errand for my boss, so I just couldn''t get to the bank on time. And then I completely forgot all about it on Thursday because of the seminar I had to attend. I only remembered it after lunch on Friday and went straight to the bank and paid it. (45)
**M:** I guess they must have sent out the notice before you paid then. I''ll call them and straighten this out. (46)
**W:** I am sorry, but I couldn''t help it. I''ll remember to take care of the bills early from now on.');

  -- Question #47 (toeic_part_3)
  SELECT id INTO v_question_id FROM assessment_questions WHERE assessment_id = v_assessment_id AND position = 47;
  IF v_question_id IS NULL THEN
    INSERT INTO assessment_questions (assessment_id, skill, category, difficulty, level, question_type, prompt, context_text, audio_url, options, position, weight)
    VALUES (v_assessment_id, 'listening', 'toeic_part_3', 2, 'b1', 'multiple_choice', 'Why have the speakers been very busy?', 'Conversation Context (Questions 47 - 49)', '/audio/toeic/real_exam/toeic_p3_q47_49.mp3', '[{"id":"A","text":"It is a busy time of the year."},{"id":"B","text":"A sale has been going on."},{"id":"C","text":"Several workers resigned recently."},{"id":"D","text":"The company is expanding."}]'::jsonb, 47, 1.0)
    RETURNING id INTO v_question_id;
  ELSE
    UPDATE assessment_questions SET
      skill = 'listening',
      category = 'toeic_part_3',
      difficulty = 2,
      level = 'b1',
      prompt = 'Why have the speakers been very busy?',
      context_text = 'Conversation Context (Questions 47 - 49)',
      audio_url = '/audio/toeic/real_exam/toeic_p3_q47_49.mp3',
      options = '[{"id":"A","text":"It is a busy time of the year."},{"id":"B","text":"A sale has been going on."},{"id":"C","text":"Several workers resigned recently."},{"id":"D","text":"The company is expanding."}]'::jsonb
    WHERE id = v_question_id;
  END IF;

  -- Answer for #47
  DELETE FROM assessment_question_answers WHERE question_id = v_question_id;
  INSERT INTO assessment_question_answers (question_id, correct_option_id, explanation, transcript_text)
  VALUES (v_question_id, 'A', 'Đáp án đúng: A.

Đoạn hội thoại:
**W1:** I can''t believe how busy we''ve been. We''ve received so many orders in the past few days.
**W2:** Because it''s the holiday season, we probably won''t get much of a break for the next couple of months. (47)
**W1:** Everyone has been at the office long after normal working hours have finished this week, so I''ve heard several complaints. (48) Can''t we hire any more workers? (49)
**W2:** I''d love to, but I''m not sure if that''s possible. What do you think, Greg?
**M:** That''s already been taken care of. You''ll be training fifteen temporary employees in your department tomorrow. (49)
**W1:** Wow, I''m impressed. I''ve never seen management work this fast before.

Giải thích chi tiết:
#### Q47 (正确答案：A)
**问题：** Why have the speakers been very busy? (为何说话者一直这么忙？)
- (A) It is a busy time of the year. (这是一年中的繁忙时期。)
- (B) A sale has been going on. (特价销售一直在进行。)
- (C) Several workers resigned recently. (近期有几位员工辞职。)
- (D) The company is expanding. (这家公司在扩张。)

', '**W1:** I can''t believe how busy we''ve been. We''ve received so many orders in the past few days.
**W2:** Because it''s the holiday season, we probably won''t get much of a break for the next couple of months. (47)
**W1:** Everyone has been at the office long after normal working hours have finished this week, so I''ve heard several complaints. (48) Can''t we hire any more workers? (49)
**W2:** I''d love to, but I''m not sure if that''s possible. What do you think, Greg?
**M:** That''s already been taken care of. You''ll be training fifteen temporary employees in your department tomorrow. (49)
**W1:** Wow, I''m impressed. I''ve never seen management work this fast before.');

  -- Question #48 (toeic_part_3)
  SELECT id INTO v_question_id FROM assessment_questions WHERE assessment_id = v_assessment_id AND position = 48;
  IF v_question_id IS NULL THEN
    INSERT INTO assessment_questions (assessment_id, skill, category, difficulty, level, question_type, prompt, context_text, audio_url, options, position, weight)
    VALUES (v_assessment_id, 'listening', 'toeic_part_3', 2, 'b1', 'multiple_choice', 'What are some employees unhappy about?', 'Conversation Context (Questions 47 - 49)', '/audio/toeic/real_exam/toeic_p3_q47_49.mp3', '[{"id":"A","text":"Receiving low salaries."},{"id":"B","text":"Working overtime."},{"id":"C","text":"Having their vacations canceled."},{"id":"D","text":"Losing their bonuses."}]'::jsonb, 48, 1.0)
    RETURNING id INTO v_question_id;
  ELSE
    UPDATE assessment_questions SET
      skill = 'listening',
      category = 'toeic_part_3',
      difficulty = 2,
      level = 'b1',
      prompt = 'What are some employees unhappy about?',
      context_text = 'Conversation Context (Questions 47 - 49)',
      audio_url = '/audio/toeic/real_exam/toeic_p3_q47_49.mp3',
      options = '[{"id":"A","text":"Receiving low salaries."},{"id":"B","text":"Working overtime."},{"id":"C","text":"Having their vacations canceled."},{"id":"D","text":"Losing their bonuses."}]'::jsonb
    WHERE id = v_question_id;
  END IF;

  -- Answer for #48
  DELETE FROM assessment_question_answers WHERE question_id = v_question_id;
  INSERT INTO assessment_question_answers (question_id, correct_option_id, explanation, transcript_text)
  VALUES (v_question_id, 'B', 'Đáp án đúng: B.

Đoạn hội thoại:
**W1:** I can''t believe how busy we''ve been. We''ve received so many orders in the past few days.
**W2:** Because it''s the holiday season, we probably won''t get much of a break for the next couple of months. (47)
**W1:** Everyone has been at the office long after normal working hours have finished this week, so I''ve heard several complaints. (48) Can''t we hire any more workers? (49)
**W2:** I''d love to, but I''m not sure if that''s possible. What do you think, Greg?
**M:** That''s already been taken care of. You''ll be training fifteen temporary employees in your department tomorrow. (49)
**W1:** Wow, I''m impressed. I''ve never seen management work this fast before.

Giải thích chi tiết:
#### Q48 (正确答案：B)
**问题：** What are some employees unhappy about? (一些员工不满意什么？)
- (A) Receiving low salaries. (领取低薪。)
- (B) Working overtime. (超时工作。)
- (C) Having their vacations canceled. (取消休假。)
- (D) Losing their bonuses. (失去奖金。)

', '**W1:** I can''t believe how busy we''ve been. We''ve received so many orders in the past few days.
**W2:** Because it''s the holiday season, we probably won''t get much of a break for the next couple of months. (47)
**W1:** Everyone has been at the office long after normal working hours have finished this week, so I''ve heard several complaints. (48) Can''t we hire any more workers? (49)
**W2:** I''d love to, but I''m not sure if that''s possible. What do you think, Greg?
**M:** That''s already been taken care of. You''ll be training fifteen temporary employees in your department tomorrow. (49)
**W1:** Wow, I''m impressed. I''ve never seen management work this fast before.');

  -- Question #49 (toeic_part_3)
  SELECT id INTO v_question_id FROM assessment_questions WHERE assessment_id = v_assessment_id AND position = 49;
  IF v_question_id IS NULL THEN
    INSERT INTO assessment_questions (assessment_id, skill, category, difficulty, level, question_type, prompt, context_text, audio_url, options, position, weight)
    VALUES (v_assessment_id, 'listening', 'toeic_part_3', 2, 'b1', 'multiple_choice', 'What does the man imply when he says, “That''s already been taken care of”?', 'Conversation Context (Questions 47 - 49)', '/audio/toeic/real_exam/toeic_p3_q47_49.mp3', '[{"id":"A","text":"An orientation session has been scheduled."},{"id":"B","text":"A manager has been replaced."},{"id":"C","text":"New workers have been hired."},{"id":"D","text":"Hourly wages have been increased."}]'::jsonb, 49, 1.0)
    RETURNING id INTO v_question_id;
  ELSE
    UPDATE assessment_questions SET
      skill = 'listening',
      category = 'toeic_part_3',
      difficulty = 2,
      level = 'b1',
      prompt = 'What does the man imply when he says, “That''s already been taken care of”?',
      context_text = 'Conversation Context (Questions 47 - 49)',
      audio_url = '/audio/toeic/real_exam/toeic_p3_q47_49.mp3',
      options = '[{"id":"A","text":"An orientation session has been scheduled."},{"id":"B","text":"A manager has been replaced."},{"id":"C","text":"New workers have been hired."},{"id":"D","text":"Hourly wages have been increased."}]'::jsonb
    WHERE id = v_question_id;
  END IF;

  -- Answer for #49
  DELETE FROM assessment_question_answers WHERE question_id = v_question_id;
  INSERT INTO assessment_question_answers (question_id, correct_option_id, explanation, transcript_text)
  VALUES (v_question_id, 'C', 'Đáp án đúng: C.

Đoạn hội thoại:
**W1:** I can''t believe how busy we''ve been. We''ve received so many orders in the past few days.
**W2:** Because it''s the holiday season, we probably won''t get much of a break for the next couple of months. (47)
**W1:** Everyone has been at the office long after normal working hours have finished this week, so I''ve heard several complaints. (48) Can''t we hire any more workers? (49)
**W2:** I''d love to, but I''m not sure if that''s possible. What do you think, Greg?
**M:** That''s already been taken care of. You''ll be training fifteen temporary employees in your department tomorrow. (49)
**W1:** Wow, I''m impressed. I''ve never seen management work this fast before.

Giải thích chi tiết:
#### Q49 (正确答案：C)
**问题：** What does the man imply when he says, “That''s already been taken care of”? (当这位男士说 “That''s already been taken care of” ，他是在暗示什么？)
- (A) An orientation session has been scheduled. (新员工培训已经安排好。)
- (B) A manager has been replaced. (经理已被替代。)
- (C) New workers have been hired. (已经雇用了新员工。)
- (D) Hourly wages have been increased. (时薪上涨了。)

**延伸表达与补充：**
- **couple of** (几个扩展表达：)
', '**W1:** I can''t believe how busy we''ve been. We''ve received so many orders in the past few days.
**W2:** Because it''s the holiday season, we probably won''t get much of a break for the next couple of months. (47)
**W1:** Everyone has been at the office long after normal working hours have finished this week, so I''ve heard several complaints. (48) Can''t we hire any more workers? (49)
**W2:** I''d love to, but I''m not sure if that''s possible. What do you think, Greg?
**M:** That''s already been taken care of. You''ll be training fifteen temporary employees in your department tomorrow. (49)
**W1:** Wow, I''m impressed. I''ve never seen management work this fast before.');

  -- Question #50 (toeic_part_3)
  SELECT id INTO v_question_id FROM assessment_questions WHERE assessment_id = v_assessment_id AND position = 50;
  IF v_question_id IS NULL THEN
    INSERT INTO assessment_questions (assessment_id, skill, category, difficulty, level, question_type, prompt, context_text, audio_url, options, position, weight)
    VALUES (v_assessment_id, 'listening', 'toeic_part_3', 2, 'b1', 'multiple_choice', 'How far did the man''s team go in the tournament?', 'Conversation Context (Questions 50 - 52)', '/audio/toeic/real_exam/toeic_p3_q50_52.mp3', '[{"id":"A","text":"They reached the finals before getting defeated."},{"id":"B","text":"They got into the semifinals after beating the sales team."},{"id":"C","text":"They were defeated in the first round of the tournament."},{"id":"D","text":"They went all the way to the finals and won."}]'::jsonb, 50, 1.0)
    RETURNING id INTO v_question_id;
  ELSE
    UPDATE assessment_questions SET
      skill = 'listening',
      category = 'toeic_part_3',
      difficulty = 2,
      level = 'b1',
      prompt = 'How far did the man''s team go in the tournament?',
      context_text = 'Conversation Context (Questions 50 - 52)',
      audio_url = '/audio/toeic/real_exam/toeic_p3_q50_52.mp3',
      options = '[{"id":"A","text":"They reached the finals before getting defeated."},{"id":"B","text":"They got into the semifinals after beating the sales team."},{"id":"C","text":"They were defeated in the first round of the tournament."},{"id":"D","text":"They went all the way to the finals and won."}]'::jsonb
    WHERE id = v_question_id;
  END IF;

  -- Answer for #50
  DELETE FROM assessment_question_answers WHERE question_id = v_question_id;
  INSERT INTO assessment_question_answers (question_id, correct_option_id, explanation, transcript_text)
  VALUES (v_question_id, 'A', 'Đáp án đúng: A.

Đoạn hội thoại:
**W:** How did your team make out in the baseball tournament over the weekend?
**M:** You''re not going to believe this, but we made it all the way to the finals by beating the marketing team and then played the sales team in the finals. (50) You know, if it weren''t for John, our best player, leaving the game because of a sprained ankle, we could''ve won the whole thing. By the way, why didn''t you guys compete? We were expecting to play you guys.
**W:** Oh, our manager Susan is not a very big fan of baseball. She thinks that it''s a waste of time spending our weekends playing sports. (51)
**M:** You''ve got to be kidding. I can understand that she is not a big fan of baseball, but she should be thinking about the employees'' morale. I don''t know about you guys, but our guys were all pumped up after the weekend game. I guess some of the bosses don''t feel that company spirit is all that important. (52)

Giải thích chi tiết:
#### Q50 (正确答案：A)
**问题：** How far did the man''s team go in the tournament? (男士的球队在比赛中表现如何？)
- (A) They reached the finals before getting defeated. (他们打入决赛，最后输了。)
- (B) They got into the semifinals after beating the sales team. (他们打败销售队后进入了半决赛。)
- (C) They were defeated in the first round of the tournament. (他们在比赛的第一回合就被打败了。)
- (D) They went all the way to the finals and won. (他们一路打到决赛，最后赢了。)

', '**W:** How did your team make out in the baseball tournament over the weekend?
**M:** You''re not going to believe this, but we made it all the way to the finals by beating the marketing team and then played the sales team in the finals. (50) You know, if it weren''t for John, our best player, leaving the game because of a sprained ankle, we could''ve won the whole thing. By the way, why didn''t you guys compete? We were expecting to play you guys.
**W:** Oh, our manager Susan is not a very big fan of baseball. She thinks that it''s a waste of time spending our weekends playing sports. (51)
**M:** You''ve got to be kidding. I can understand that she is not a big fan of baseball, but she should be thinking about the employees'' morale. I don''t know about you guys, but our guys were all pumped up after the weekend game. I guess some of the bosses don''t feel that company spirit is all that important. (52)');

  -- Question #51 (toeic_part_3)
  SELECT id INTO v_question_id FROM assessment_questions WHERE assessment_id = v_assessment_id AND position = 51;
  IF v_question_id IS NULL THEN
    INSERT INTO assessment_questions (assessment_id, skill, category, difficulty, level, question_type, prompt, context_text, audio_url, options, position, weight)
    VALUES (v_assessment_id, 'listening', 'toeic_part_3', 2, 'b1', 'multiple_choice', 'According to the woman, why didn''t her team compete in the tournament?', 'Conversation Context (Questions 50 - 52)', '/audio/toeic/real_exam/toeic_p3_q50_52.mp3', '[{"id":"A","text":"Many of her staff members were out of town on business."},{"id":"B","text":"Her boss does not like baseball very much."},{"id":"C","text":"She fell down the stairs and broke her ankle."},{"id":"D","text":"Her team members were too busy with work."}]'::jsonb, 51, 1.0)
    RETURNING id INTO v_question_id;
  ELSE
    UPDATE assessment_questions SET
      skill = 'listening',
      category = 'toeic_part_3',
      difficulty = 2,
      level = 'b1',
      prompt = 'According to the woman, why didn''t her team compete in the tournament?',
      context_text = 'Conversation Context (Questions 50 - 52)',
      audio_url = '/audio/toeic/real_exam/toeic_p3_q50_52.mp3',
      options = '[{"id":"A","text":"Many of her staff members were out of town on business."},{"id":"B","text":"Her boss does not like baseball very much."},{"id":"C","text":"She fell down the stairs and broke her ankle."},{"id":"D","text":"Her team members were too busy with work."}]'::jsonb
    WHERE id = v_question_id;
  END IF;

  -- Answer for #51
  DELETE FROM assessment_question_answers WHERE question_id = v_question_id;
  INSERT INTO assessment_question_answers (question_id, correct_option_id, explanation, transcript_text)
  VALUES (v_question_id, 'B', 'Đáp án đúng: B.

Đoạn hội thoại:
**W:** How did your team make out in the baseball tournament over the weekend?
**M:** You''re not going to believe this, but we made it all the way to the finals by beating the marketing team and then played the sales team in the finals. (50) You know, if it weren''t for John, our best player, leaving the game because of a sprained ankle, we could''ve won the whole thing. By the way, why didn''t you guys compete? We were expecting to play you guys.
**W:** Oh, our manager Susan is not a very big fan of baseball. She thinks that it''s a waste of time spending our weekends playing sports. (51)
**M:** You''ve got to be kidding. I can understand that she is not a big fan of baseball, but she should be thinking about the employees'' morale. I don''t know about you guys, but our guys were all pumped up after the weekend game. I guess some of the bosses don''t feel that company spirit is all that important. (52)

Giải thích chi tiết:
#### Q51 (正确答案：B)
**问题：** According to the woman, why didn''t her team compete in the tournament? (根据女士所说，她们队为什么没有参加比赛？)
- (A) Many of her staff members were out of town on business. (她的很多同事都去外地出差了。)
- (B) Her boss does not like baseball very much. (她的老板不太喜欢棒球。)
- (C) She fell down the stairs and broke her ankle. (她从楼梯上摔下来，扭伤了脚。)
- (D) Her team members were too busy with work. (她的队员工作太忙了。)

', '**W:** How did your team make out in the baseball tournament over the weekend?
**M:** You''re not going to believe this, but we made it all the way to the finals by beating the marketing team and then played the sales team in the finals. (50) You know, if it weren''t for John, our best player, leaving the game because of a sprained ankle, we could''ve won the whole thing. By the way, why didn''t you guys compete? We were expecting to play you guys.
**W:** Oh, our manager Susan is not a very big fan of baseball. She thinks that it''s a waste of time spending our weekends playing sports. (51)
**M:** You''ve got to be kidding. I can understand that she is not a big fan of baseball, but she should be thinking about the employees'' morale. I don''t know about you guys, but our guys were all pumped up after the weekend game. I guess some of the bosses don''t feel that company spirit is all that important. (52)');

  -- Question #52 (toeic_part_3)
  SELECT id INTO v_question_id FROM assessment_questions WHERE assessment_id = v_assessment_id AND position = 52;
  IF v_question_id IS NULL THEN
    INSERT INTO assessment_questions (assessment_id, skill, category, difficulty, level, question_type, prompt, context_text, audio_url, options, position, weight)
    VALUES (v_assessment_id, 'listening', 'toeic_part_3', 2, 'b1', 'multiple_choice', 'What does the man mention about some of the managers in the company?', 'Conversation Context (Questions 50 - 52)', '/audio/toeic/real_exam/toeic_p3_q50_52.mp3', '[{"id":"A","text":"They don''t consider company morale to be very important."},{"id":"B","text":"They stress winning the tournament too much."},{"id":"C","text":"They worked very hard preparing for the tournament."},{"id":"D","text":"They waste too much time talking about sports."}]'::jsonb, 52, 1.0)
    RETURNING id INTO v_question_id;
  ELSE
    UPDATE assessment_questions SET
      skill = 'listening',
      category = 'toeic_part_3',
      difficulty = 2,
      level = 'b1',
      prompt = 'What does the man mention about some of the managers in the company?',
      context_text = 'Conversation Context (Questions 50 - 52)',
      audio_url = '/audio/toeic/real_exam/toeic_p3_q50_52.mp3',
      options = '[{"id":"A","text":"They don''t consider company morale to be very important."},{"id":"B","text":"They stress winning the tournament too much."},{"id":"C","text":"They worked very hard preparing for the tournament."},{"id":"D","text":"They waste too much time talking about sports."}]'::jsonb
    WHERE id = v_question_id;
  END IF;

  -- Answer for #52
  DELETE FROM assessment_question_answers WHERE question_id = v_question_id;
  INSERT INTO assessment_question_answers (question_id, correct_option_id, explanation, transcript_text)
  VALUES (v_question_id, 'A', 'Đáp án đúng: A.

Đoạn hội thoại:
**W:** How did your team make out in the baseball tournament over the weekend?
**M:** You''re not going to believe this, but we made it all the way to the finals by beating the marketing team and then played the sales team in the finals. (50) You know, if it weren''t for John, our best player, leaving the game because of a sprained ankle, we could''ve won the whole thing. By the way, why didn''t you guys compete? We were expecting to play you guys.
**W:** Oh, our manager Susan is not a very big fan of baseball. She thinks that it''s a waste of time spending our weekends playing sports. (51)
**M:** You''ve got to be kidding. I can understand that she is not a big fan of baseball, but she should be thinking about the employees'' morale. I don''t know about you guys, but our guys were all pumped up after the weekend game. I guess some of the bosses don''t feel that company spirit is all that important. (52)

Giải thích chi tiết:
#### Q52 (正确答案：A)
**问题：** What does the man mention about some of the managers in the company? (男士提到公司的一些经理时是怎么说的？)
- (A) They don''t consider company morale to be very important. (他们认为公司士气不是非常重要。)
- (B) They stress winning the tournament too much. (他们太注重赢得比赛了。)
- (C) They worked very hard preparing for the tournament. (他们努力准备这次比赛。)
- (D) They waste too much time talking about sports. (他们把太多时间浪费在谈论', '**W:** How did your team make out in the baseball tournament over the weekend?
**M:** You''re not going to believe this, but we made it all the way to the finals by beating the marketing team and then played the sales team in the finals. (50) You know, if it weren''t for John, our best player, leaving the game because of a sprained ankle, we could''ve won the whole thing. By the way, why didn''t you guys compete? We were expecting to play you guys.
**W:** Oh, our manager Susan is not a very big fan of baseball. She thinks that it''s a waste of time spending our weekends playing sports. (51)
**M:** You''ve got to be kidding. I can understand that she is not a big fan of baseball, but she should be thinking about the employees'' morale. I don''t know about you guys, but our guys were all pumped up after the weekend game. I guess some of the bosses don''t feel that company spirit is all that important. (52)');

  -- Question #53 (toeic_part_3)
  SELECT id INTO v_question_id FROM assessment_questions WHERE assessment_id = v_assessment_id AND position = 53;
  IF v_question_id IS NULL THEN
    INSERT INTO assessment_questions (assessment_id, skill, category, difficulty, level, question_type, prompt, context_text, audio_url, options, position, weight)
    VALUES (v_assessment_id, 'listening', 'toeic_part_3', 2, 'b1', 'multiple_choice', 'According to the woman, why has the company gone over its travel expenses budget this quarter?', 'Conversation Context (Questions 53 - 55)', '/audio/toeic/real_exam/toeic_p3_q53_55.mp3', '[{"id":"A","text":"Many employees are making unnecessary trips."},{"id":"B","text":"The staff members are staying at very expensive hotels."},{"id":"C","text":"The airline the company deal with has raised their fares."},{"id":"D","text":"The cost of insurance has more than doubled."}]'::jsonb, 53, 1.0)
    RETURNING id INTO v_question_id;
  ELSE
    UPDATE assessment_questions SET
      skill = 'listening',
      category = 'toeic_part_3',
      difficulty = 2,
      level = 'b1',
      prompt = 'According to the woman, why has the company gone over its travel expenses budget this quarter?',
      context_text = 'Conversation Context (Questions 53 - 55)',
      audio_url = '/audio/toeic/real_exam/toeic_p3_q53_55.mp3',
      options = '[{"id":"A","text":"Many employees are making unnecessary trips."},{"id":"B","text":"The staff members are staying at very expensive hotels."},{"id":"C","text":"The airline the company deal with has raised their fares."},{"id":"D","text":"The cost of insurance has more than doubled."}]'::jsonb
    WHERE id = v_question_id;
  END IF;

  -- Answer for #53
  DELETE FROM assessment_question_answers WHERE question_id = v_question_id;
  INSERT INTO assessment_question_answers (question_id, correct_option_id, explanation, transcript_text)
  VALUES (v_question_id, 'C', 'Đáp án đúng: C.

Đoạn hội thoại:
**M:** We seem to have already gone over our budget on travel expenses this quarter. Do you know the reason?
**W:** Well, the main reason is because the airline we deal with has raised their fares. (53) On top of that, we had to change the hotel we use because many of our staff complained about being robbed during their trips. So, we signed a contract with another chain, and they are a bit more expensive. (53)
**M:** Well, we are going to have to do something to tighten up around here. Tell you what; from now on I want you to make sure you allow only those staff members who must take trips to go on them. (54) This way, we should be able to keep down the cost a bit.
**W:** Actually, we have been doing that, but it''s hard to judge which trips should be allowed or not because everyone seems to have legitimate reasons for taking the trips. (55) I think we need to find other ways to cut costs. I''m meeting with the other managers today. Why don''t I bring up the issue at the meeting?

Giải thích chi tiết:
#### Q53 (正确答案：C)
**问题：** According to the woman, why has the company gone over its travel expenses budget this quarter? (根据女士所说，为什么公司这个季度的差旅费预算超支了？)
- (A) Many employees are making unnecessary trips. (很多员工的出差是不必要的。)
- (B) The staff members are staying at very expensive hotels. (员工住非常昂贵的宾馆。)
- (C) The airline the company deal with has raised their fares. (该公司合作的航空公司提高了票价。)
- (D) The cost of insura', '**M:** We seem to have already gone over our budget on travel expenses this quarter. Do you know the reason?
**W:** Well, the main reason is because the airline we deal with has raised their fares. (53) On top of that, we had to change the hotel we use because many of our staff complained about being robbed during their trips. So, we signed a contract with another chain, and they are a bit more expensive. (53)
**M:** Well, we are going to have to do something to tighten up around here. Tell you what; from now on I want you to make sure you allow only those staff members who must take trips to go on them. (54) This way, we should be able to keep down the cost a bit.
**W:** Actually, we have been doing that, but it''s hard to judge which trips should be allowed or not because everyone seems to have legitimate reasons for taking the trips. (55) I think we need to find other ways to cut costs. I''m meeting with the other managers today. Why don''t I bring up the issue at the meeting?');

  -- Question #54 (toeic_part_3)
  SELECT id INTO v_question_id FROM assessment_questions WHERE assessment_id = v_assessment_id AND position = 54;
  IF v_question_id IS NULL THEN
    INSERT INTO assessment_questions (assessment_id, skill, category, difficulty, level, question_type, prompt, context_text, audio_url, options, position, weight)
    VALUES (v_assessment_id, 'listening', 'toeic_part_3', 2, 'b1', 'multiple_choice', 'What does the man suggest they do to solve the problem?', 'Conversation Context (Questions 53 - 55)', '/audio/toeic/real_exam/toeic_p3_q53_55.mp3', '[{"id":"A","text":"Have more people work from their homes."},{"id":"B","text":"Discriminate against those planning to travel."},{"id":"C","text":"Work out a better deal with the airline company."},{"id":"D","text":"Get the workers to pay for their own meals."}]'::jsonb, 54, 1.0)
    RETURNING id INTO v_question_id;
  ELSE
    UPDATE assessment_questions SET
      skill = 'listening',
      category = 'toeic_part_3',
      difficulty = 2,
      level = 'b1',
      prompt = 'What does the man suggest they do to solve the problem?',
      context_text = 'Conversation Context (Questions 53 - 55)',
      audio_url = '/audio/toeic/real_exam/toeic_p3_q53_55.mp3',
      options = '[{"id":"A","text":"Have more people work from their homes."},{"id":"B","text":"Discriminate against those planning to travel."},{"id":"C","text":"Work out a better deal with the airline company."},{"id":"D","text":"Get the workers to pay for their own meals."}]'::jsonb
    WHERE id = v_question_id;
  END IF;

  -- Answer for #54
  DELETE FROM assessment_question_answers WHERE question_id = v_question_id;
  INSERT INTO assessment_question_answers (question_id, correct_option_id, explanation, transcript_text)
  VALUES (v_question_id, 'B', 'Đáp án đúng: B.

Đoạn hội thoại:
**M:** We seem to have already gone over our budget on travel expenses this quarter. Do you know the reason?
**W:** Well, the main reason is because the airline we deal with has raised their fares. (53) On top of that, we had to change the hotel we use because many of our staff complained about being robbed during their trips. So, we signed a contract with another chain, and they are a bit more expensive. (53)
**M:** Well, we are going to have to do something to tighten up around here. Tell you what; from now on I want you to make sure you allow only those staff members who must take trips to go on them. (54) This way, we should be able to keep down the cost a bit.
**W:** Actually, we have been doing that, but it''s hard to judge which trips should be allowed or not because everyone seems to have legitimate reasons for taking the trips. (55) I think we need to find other ways to cut costs. I''m meeting with the other managers today. Why don''t I bring up the issue at the meeting?

Giải thích chi tiết:
#### Q54 (正确答案：B)
**问题：** What does the man suggest they do to solve the problem? (男士建议他们怎样解决这个问题？)
- (A) Have more people work from their homes. (让更多的人在家办公。)
- (B) Discriminate against those planning to travel. (区别对待那些计划出差的人。)
- (C) Work out a better deal with the airline company. (和航空公司达成一个更好的合作方案。)
- (D) Get the workers to pay for their own meals. (让员工自己负担餐费。)

', '**M:** We seem to have already gone over our budget on travel expenses this quarter. Do you know the reason?
**W:** Well, the main reason is because the airline we deal with has raised their fares. (53) On top of that, we had to change the hotel we use because many of our staff complained about being robbed during their trips. So, we signed a contract with another chain, and they are a bit more expensive. (53)
**M:** Well, we are going to have to do something to tighten up around here. Tell you what; from now on I want you to make sure you allow only those staff members who must take trips to go on them. (54) This way, we should be able to keep down the cost a bit.
**W:** Actually, we have been doing that, but it''s hard to judge which trips should be allowed or not because everyone seems to have legitimate reasons for taking the trips. (55) I think we need to find other ways to cut costs. I''m meeting with the other managers today. Why don''t I bring up the issue at the meeting?');

  -- Question #55 (toeic_part_3)
  SELECT id INTO v_question_id FROM assessment_questions WHERE assessment_id = v_assessment_id AND position = 55;
  IF v_question_id IS NULL THEN
    INSERT INTO assessment_questions (assessment_id, skill, category, difficulty, level, question_type, prompt, context_text, audio_url, options, position, weight)
    VALUES (v_assessment_id, 'listening', 'toeic_part_3', 2, 'b1', 'multiple_choice', 'What does the woman say is the reason why the man''s suggestion won''t work?', 'Conversation Context (Questions 53 - 55)', '/audio/toeic/real_exam/toeic_p3_q53_55.mp3', '[{"id":"A","text":"People tend to get lazy working at home."},{"id":"B","text":"The management cannot judge which trips are absolutely necessary."},{"id":"C","text":"They are already getting a special rate from the airline company they deal with."},{"id":"D","text":"The rest of the managers at the company don''t think it''s a good idea."}]'::jsonb, 55, 1.0)
    RETURNING id INTO v_question_id;
  ELSE
    UPDATE assessment_questions SET
      skill = 'listening',
      category = 'toeic_part_3',
      difficulty = 2,
      level = 'b1',
      prompt = 'What does the woman say is the reason why the man''s suggestion won''t work?',
      context_text = 'Conversation Context (Questions 53 - 55)',
      audio_url = '/audio/toeic/real_exam/toeic_p3_q53_55.mp3',
      options = '[{"id":"A","text":"People tend to get lazy working at home."},{"id":"B","text":"The management cannot judge which trips are absolutely necessary."},{"id":"C","text":"They are already getting a special rate from the airline company they deal with."},{"id":"D","text":"The rest of the managers at the company don''t think it''s a good idea."}]'::jsonb
    WHERE id = v_question_id;
  END IF;

  -- Answer for #55
  DELETE FROM assessment_question_answers WHERE question_id = v_question_id;
  INSERT INTO assessment_question_answers (question_id, correct_option_id, explanation, transcript_text)
  VALUES (v_question_id, 'B', 'Đáp án đúng: B.

Đoạn hội thoại:
**M:** We seem to have already gone over our budget on travel expenses this quarter. Do you know the reason?
**W:** Well, the main reason is because the airline we deal with has raised their fares. (53) On top of that, we had to change the hotel we use because many of our staff complained about being robbed during their trips. So, we signed a contract with another chain, and they are a bit more expensive. (53)
**M:** Well, we are going to have to do something to tighten up around here. Tell you what; from now on I want you to make sure you allow only those staff members who must take trips to go on them. (54) This way, we should be able to keep down the cost a bit.
**W:** Actually, we have been doing that, but it''s hard to judge which trips should be allowed or not because everyone seems to have legitimate reasons for taking the trips. (55) I think we need to find other ways to cut costs. I''m meeting with the other managers today. Why don''t I bring up the issue at the meeting?

Giải thích chi tiết:
#### Q55 (正确答案：B)
**问题：** What does the woman say is the reason why the man''s suggestion won''t work? (女士为什么认为男士的提议不会起作用？)
- (A) People tend to get lazy working at home. (人们在家工作会变懒。)
- (B) The management cannot judge which trips are absolutely necessary. (管理者没法判断哪些出差是完全必要的。)
- (C) They are already getting a special rate from the airline company they deal with. (他们已经从合作的航空公司那里得到了优惠价。)
- (D) The rest', '**M:** We seem to have already gone over our budget on travel expenses this quarter. Do you know the reason?
**W:** Well, the main reason is because the airline we deal with has raised their fares. (53) On top of that, we had to change the hotel we use because many of our staff complained about being robbed during their trips. So, we signed a contract with another chain, and they are a bit more expensive. (53)
**M:** Well, we are going to have to do something to tighten up around here. Tell you what; from now on I want you to make sure you allow only those staff members who must take trips to go on them. (54) This way, we should be able to keep down the cost a bit.
**W:** Actually, we have been doing that, but it''s hard to judge which trips should be allowed or not because everyone seems to have legitimate reasons for taking the trips. (55) I think we need to find other ways to cut costs. I''m meeting with the other managers today. Why don''t I bring up the issue at the meeting?');

  -- Question #56 (toeic_part_3)
  SELECT id INTO v_question_id FROM assessment_questions WHERE assessment_id = v_assessment_id AND position = 56;
  IF v_question_id IS NULL THEN
    INSERT INTO assessment_questions (assessment_id, skill, category, difficulty, level, question_type, prompt, context_text, audio_url, options, position, weight)
    VALUES (v_assessment_id, 'listening', 'toeic_part_3', 2, 'b1', 'multiple_choice', 'Why does the man thank the woman?', 'Conversation Context (Questions 56 - 58)', '/audio/toeic/real_exam/toeic_p3_q56_58.mp3', '[{"id":"A","text":"She finished some work on time."},{"id":"B","text":"She worked hard on a project."},{"id":"C","text":"She assisted him with an interview."},{"id":"D","text":"She introduced a person to him."}]'::jsonb, 56, 1.0)
    RETURNING id INTO v_question_id;
  ELSE
    UPDATE assessment_questions SET
      skill = 'listening',
      category = 'toeic_part_3',
      difficulty = 2,
      level = 'b1',
      prompt = 'Why does the man thank the woman?',
      context_text = 'Conversation Context (Questions 56 - 58)',
      audio_url = '/audio/toeic/real_exam/toeic_p3_q56_58.mp3',
      options = '[{"id":"A","text":"She finished some work on time."},{"id":"B","text":"She worked hard on a project."},{"id":"C","text":"She assisted him with an interview."},{"id":"D","text":"She introduced a person to him."}]'::jsonb
    WHERE id = v_question_id;
  END IF;

  -- Answer for #56
  DELETE FROM assessment_question_answers WHERE question_id = v_question_id;
  INSERT INTO assessment_question_answers (question_id, correct_option_id, explanation, transcript_text)
  VALUES (v_question_id, 'D', 'Đáp án đúng: D.

Đoạn hội thoại:
**W:** How is your newest employee working out?
**M:** Do you mean Ted? He''s doing really well. Thanks so much for recommending him to me. (56)
**W:** We both worked at Lensman Technology a couple of years ago, so I''m familiar with the quality of the work he does. (57)
**M:** He definitely works harder than anyone else in my department. In fact, he''ll probably get a promotion pretty soon. (58)
**W:** Already? That''s rather fast, isn''t it?
**M:** Somewhat, but he should be rewarded for doing such good work. And it might inspire the others in my department to try a bit harder as well.

Giải thích chi tiết:
#### Q56 (正确答案：D)
**问题：** Why does the man thank the woman? (男士为何感谢女士？)
- (A) She finished some work on time. (她按时完成了一些工作。)
- (B) She worked hard on a project. (她为一个项目努力工作。)
- (C) She assisted him with an interview. (她协助他进行面试。)
- (D) She introduced a person to him. (她给他介绍了一个人。)

', '**W:** How is your newest employee working out?
**M:** Do you mean Ted? He''s doing really well. Thanks so much for recommending him to me. (56)
**W:** We both worked at Lensman Technology a couple of years ago, so I''m familiar with the quality of the work he does. (57)
**M:** He definitely works harder than anyone else in my department. In fact, he''ll probably get a promotion pretty soon. (58)
**W:** Already? That''s rather fast, isn''t it?
**M:** Somewhat, but he should be rewarded for doing such good work. And it might inspire the others in my department to try a bit harder as well.');

  -- Question #57 (toeic_part_3)
  SELECT id INTO v_question_id FROM assessment_questions WHERE assessment_id = v_assessment_id AND position = 57;
  IF v_question_id IS NULL THEN
    INSERT INTO assessment_questions (assessment_id, skill, category, difficulty, level, question_type, prompt, context_text, audio_url, options, position, weight)
    VALUES (v_assessment_id, 'listening', 'toeic_part_3', 2, 'b1', 'multiple_choice', 'How does the woman know Ted?', 'Conversation Context (Questions 56 - 58)', '/audio/toeic/real_exam/toeic_p3_q56_58.mp3', '[{"id":"A","text":"They attended the same college."},{"id":"B","text":"They are childhood friends."},{"id":"C","text":"They met at their current job."},{"id":"D","text":"They worked together before."}]'::jsonb, 57, 1.0)
    RETURNING id INTO v_question_id;
  ELSE
    UPDATE assessment_questions SET
      skill = 'listening',
      category = 'toeic_part_3',
      difficulty = 2,
      level = 'b1',
      prompt = 'How does the woman know Ted?',
      context_text = 'Conversation Context (Questions 56 - 58)',
      audio_url = '/audio/toeic/real_exam/toeic_p3_q56_58.mp3',
      options = '[{"id":"A","text":"They attended the same college."},{"id":"B","text":"They are childhood friends."},{"id":"C","text":"They met at their current job."},{"id":"D","text":"They worked together before."}]'::jsonb
    WHERE id = v_question_id;
  END IF;

  -- Answer for #57
  DELETE FROM assessment_question_answers WHERE question_id = v_question_id;
  INSERT INTO assessment_question_answers (question_id, correct_option_id, explanation, transcript_text)
  VALUES (v_question_id, 'D', 'Đáp án đúng: D.

Đoạn hội thoại:
**W:** How is your newest employee working out?
**M:** Do you mean Ted? He''s doing really well. Thanks so much for recommending him to me. (56)
**W:** We both worked at Lensman Technology a couple of years ago, so I''m familiar with the quality of the work he does. (57)
**M:** He definitely works harder than anyone else in my department. In fact, he''ll probably get a promotion pretty soon. (58)
**W:** Already? That''s rather fast, isn''t it?
**M:** Somewhat, but he should be rewarded for doing such good work. And it might inspire the others in my department to try a bit harder as well.

Giải thích chi tiết:
#### Q57 (正确答案：D)
**问题：** How does the woman know Ted? (女士是如何认识泰德的？)
- (A) They attended the same college. (他们是同一所大学的。)
- (B) They are childhood friends. (他们是儿时的朋友。)
- (C) They met at their current job. (他们是在现在的工作中认识的。)
- (D) They worked together before. (他们以前在一起工作。)

', '**W:** How is your newest employee working out?
**M:** Do you mean Ted? He''s doing really well. Thanks so much for recommending him to me. (56)
**W:** We both worked at Lensman Technology a couple of years ago, so I''m familiar with the quality of the work he does. (57)
**M:** He definitely works harder than anyone else in my department. In fact, he''ll probably get a promotion pretty soon. (58)
**W:** Already? That''s rather fast, isn''t it?
**M:** Somewhat, but he should be rewarded for doing such good work. And it might inspire the others in my department to try a bit harder as well.');

  -- Question #58 (toeic_part_3)
  SELECT id INTO v_question_id FROM assessment_questions WHERE assessment_id = v_assessment_id AND position = 58;
  IF v_question_id IS NULL THEN
    INSERT INTO assessment_questions (assessment_id, skill, category, difficulty, level, question_type, prompt, context_text, audio_url, options, position, weight)
    VALUES (v_assessment_id, 'listening', 'toeic_part_3', 2, 'b1', 'multiple_choice', 'What does the man say about Ted?', 'Conversation Context (Questions 56 - 58)', '/audio/toeic/real_exam/toeic_p3_q56_58.mp3', '[{"id":"A","text":"He has inspired other workers."},{"id":"B","text":"He is likely to get a better position."},{"id":"C","text":"He is considering a transfer."},{"id":"D","text":"He needs to start working harder."}]'::jsonb, 58, 1.0)
    RETURNING id INTO v_question_id;
  ELSE
    UPDATE assessment_questions SET
      skill = 'listening',
      category = 'toeic_part_3',
      difficulty = 2,
      level = 'b1',
      prompt = 'What does the man say about Ted?',
      context_text = 'Conversation Context (Questions 56 - 58)',
      audio_url = '/audio/toeic/real_exam/toeic_p3_q56_58.mp3',
      options = '[{"id":"A","text":"He has inspired other workers."},{"id":"B","text":"He is likely to get a better position."},{"id":"C","text":"He is considering a transfer."},{"id":"D","text":"He needs to start working harder."}]'::jsonb
    WHERE id = v_question_id;
  END IF;

  -- Answer for #58
  DELETE FROM assessment_question_answers WHERE question_id = v_question_id;
  INSERT INTO assessment_question_answers (question_id, correct_option_id, explanation, transcript_text)
  VALUES (v_question_id, 'B', 'Đáp án đúng: B.

Đoạn hội thoại:
**W:** How is your newest employee working out?
**M:** Do you mean Ted? He''s doing really well. Thanks so much for recommending him to me. (56)
**W:** We both worked at Lensman Technology a couple of years ago, so I''m familiar with the quality of the work he does. (57)
**M:** He definitely works harder than anyone else in my department. In fact, he''ll probably get a promotion pretty soon. (58)
**W:** Already? That''s rather fast, isn''t it?
**M:** Somewhat, but he should be rewarded for doing such good work. And it might inspire the others in my department to try a bit harder as well.

Giải thích chi tiết:
#### Q58 (正确答案：B)
**问题：** What does the man say about Ted? (关于泰德，男士说了什么？)
- (A) He has inspired other workers. (他激励了其他同事。)
- (B) He is likely to get a better position. (他可能会得到更好的职位。)
- (C) He is considering a transfer. (他正考虑调职。)
- (D) He needs to start working harder. (他需要开始更努力地工作。)

**延伸表达与补充：**
- **a couple of = a few** (几个)
  - *例句：He jogs a couple of miles every morning.* (他每天早上要慢跑几英里。)
- **be', '**W:** How is your newest employee working out?
**M:** Do you mean Ted? He''s doing really well. Thanks so much for recommending him to me. (56)
**W:** We both worked at Lensman Technology a couple of years ago, so I''m familiar with the quality of the work he does. (57)
**M:** He definitely works harder than anyone else in my department. In fact, he''ll probably get a promotion pretty soon. (58)
**W:** Already? That''s rather fast, isn''t it?
**M:** Somewhat, but he should be rewarded for doing such good work. And it might inspire the others in my department to try a bit harder as well.');

  -- Question #59 (toeic_part_3)
  SELECT id INTO v_question_id FROM assessment_questions WHERE assessment_id = v_assessment_id AND position = 59;
  IF v_question_id IS NULL THEN
    INSERT INTO assessment_questions (assessment_id, skill, category, difficulty, level, question_type, prompt, context_text, audio_url, options, position, weight)
    VALUES (v_assessment_id, 'listening', 'toeic_part_3', 2, 'b1', 'multiple_choice', 'For how many nights will the man stay at the hotel?', 'Conversation Context (Questions 59 - 61)', '/audio/toeic/real_exam/toeic_p3_q59_61.mp3', '[{"id":"A","text":"One."},{"id":"B","text":"Two."},{"id":"C","text":"Three."},{"id":"D","text":"Seven."}]'::jsonb, 59, 1.0)
    RETURNING id INTO v_question_id;
  ELSE
    UPDATE assessment_questions SET
      skill = 'listening',
      category = 'toeic_part_3',
      difficulty = 2,
      level = 'b1',
      prompt = 'For how many nights will the man stay at the hotel?',
      context_text = 'Conversation Context (Questions 59 - 61)',
      audio_url = '/audio/toeic/real_exam/toeic_p3_q59_61.mp3',
      options = '[{"id":"A","text":"One."},{"id":"B","text":"Two."},{"id":"C","text":"Three."},{"id":"D","text":"Seven."}]'::jsonb
    WHERE id = v_question_id;
  END IF;

  -- Answer for #59
  DELETE FROM assessment_question_answers WHERE question_id = v_question_id;
  INSERT INTO assessment_question_answers (question_id, correct_option_id, explanation, transcript_text)
  VALUES (v_question_id, 'B', 'Đáp án đúng: B.

Đoạn hội thoại:
**W:** Hello, sir, how can I be of service to you today?
**M:** Hi, my name is John Smith, and I am here to check in. I made a reservation for a single room for two nights three days ago. (59)
**W:** Ah... yes, Mr. Smith. We''ve been expecting you. I can see here that you requested a non-smoking room overlooking Lake Huron. You''ve also asked for your breakfast meal to be served in your room at 7 a.m. sharp, right? (60)
**M:** Yes, that is correct. I have to make a presentation at a business seminar at 9, (61) so I want to have some time to read over the materials beforehand.

Giải thích chi tiết:
#### Q59 (正确答案：B)
**问题：** For how many nights will the man stay at the hotel? (男士将在宾馆住几个晚上？)
- (A) One. (一个晚上。)
- (B) Two. (两个晚上。)
- (C) Three. (三个晚上。)
- (D) Seven. (七个晚上。)

', '**W:** Hello, sir, how can I be of service to you today?
**M:** Hi, my name is John Smith, and I am here to check in. I made a reservation for a single room for two nights three days ago. (59)
**W:** Ah... yes, Mr. Smith. We''ve been expecting you. I can see here that you requested a non-smoking room overlooking Lake Huron. You''ve also asked for your breakfast meal to be served in your room at 7 a.m. sharp, right? (60)
**M:** Yes, that is correct. I have to make a presentation at a business seminar at 9, (61) so I want to have some time to read over the materials beforehand.');

  -- Question #60 (toeic_part_3)
  SELECT id INTO v_question_id FROM assessment_questions WHERE assessment_id = v_assessment_id AND position = 60;
  IF v_question_id IS NULL THEN
    INSERT INTO assessment_questions (assessment_id, skill, category, difficulty, level, question_type, prompt, context_text, audio_url, options, position, weight)
    VALUES (v_assessment_id, 'listening', 'toeic_part_3', 2, 'b1', 'multiple_choice', 'What did the man request?', 'Conversation Context (Questions 59 - 61)', '/audio/toeic/real_exam/toeic_p3_q59_61.mp3', '[{"id":"A","text":"Room service."},{"id":"B","text":"A wake up call."},{"id":"C","text":"Valet parking."},{"id":"D","text":"Cleaning service."}]'::jsonb, 60, 1.0)
    RETURNING id INTO v_question_id;
  ELSE
    UPDATE assessment_questions SET
      skill = 'listening',
      category = 'toeic_part_3',
      difficulty = 2,
      level = 'b1',
      prompt = 'What did the man request?',
      context_text = 'Conversation Context (Questions 59 - 61)',
      audio_url = '/audio/toeic/real_exam/toeic_p3_q59_61.mp3',
      options = '[{"id":"A","text":"Room service."},{"id":"B","text":"A wake up call."},{"id":"C","text":"Valet parking."},{"id":"D","text":"Cleaning service."}]'::jsonb
    WHERE id = v_question_id;
  END IF;

  -- Answer for #60
  DELETE FROM assessment_question_answers WHERE question_id = v_question_id;
  INSERT INTO assessment_question_answers (question_id, correct_option_id, explanation, transcript_text)
  VALUES (v_question_id, 'A', 'Đáp án đúng: A.

Đoạn hội thoại:
**W:** Hello, sir, how can I be of service to you today?
**M:** Hi, my name is John Smith, and I am here to check in. I made a reservation for a single room for two nights three days ago. (59)
**W:** Ah... yes, Mr. Smith. We''ve been expecting you. I can see here that you requested a non-smoking room overlooking Lake Huron. You''ve also asked for your breakfast meal to be served in your room at 7 a.m. sharp, right? (60)
**M:** Yes, that is correct. I have to make a presentation at a business seminar at 9, (61) so I want to have some time to read over the materials beforehand.

Giải thích chi tiết:
#### Q60 (正确答案：A)
**问题：** What did the man request? (男士要求了什么？)
- (A) Room service. (客房服务。)
- (B) A wake up call. (叫醒服务。)
- (C) Valet parking. (代客停车。)
- (D) Cleaning service. (保洁服务。)

', '**W:** Hello, sir, how can I be of service to you today?
**M:** Hi, my name is John Smith, and I am here to check in. I made a reservation for a single room for two nights three days ago. (59)
**W:** Ah... yes, Mr. Smith. We''ve been expecting you. I can see here that you requested a non-smoking room overlooking Lake Huron. You''ve also asked for your breakfast meal to be served in your room at 7 a.m. sharp, right? (60)
**M:** Yes, that is correct. I have to make a presentation at a business seminar at 9, (61) so I want to have some time to read over the materials beforehand.');

  -- Question #61 (toeic_part_3)
  SELECT id INTO v_question_id FROM assessment_questions WHERE assessment_id = v_assessment_id AND position = 61;
  IF v_question_id IS NULL THEN
    INSERT INTO assessment_questions (assessment_id, skill, category, difficulty, level, question_type, prompt, context_text, audio_url, options, position, weight)
    VALUES (v_assessment_id, 'listening', 'toeic_part_3', 2, 'b1', 'multiple_choice', 'What will the man most likely be doing at 9 in the morning?', 'Conversation Context (Questions 59 - 61)', '/audio/toeic/real_exam/toeic_p3_q59_61.mp3', '[{"id":"A","text":"Giving a speech."},{"id":"B","text":"Having a meal."},{"id":"C","text":"Swimming in the lake."},{"id":"D","text":"Taking a flight out."}]'::jsonb, 61, 1.0)
    RETURNING id INTO v_question_id;
  ELSE
    UPDATE assessment_questions SET
      skill = 'listening',
      category = 'toeic_part_3',
      difficulty = 2,
      level = 'b1',
      prompt = 'What will the man most likely be doing at 9 in the morning?',
      context_text = 'Conversation Context (Questions 59 - 61)',
      audio_url = '/audio/toeic/real_exam/toeic_p3_q59_61.mp3',
      options = '[{"id":"A","text":"Giving a speech."},{"id":"B","text":"Having a meal."},{"id":"C","text":"Swimming in the lake."},{"id":"D","text":"Taking a flight out."}]'::jsonb
    WHERE id = v_question_id;
  END IF;

  -- Answer for #61
  DELETE FROM assessment_question_answers WHERE question_id = v_question_id;
  INSERT INTO assessment_question_answers (question_id, correct_option_id, explanation, transcript_text)
  VALUES (v_question_id, 'A', 'Đáp án đúng: A.

Đoạn hội thoại:
**W:** Hello, sir, how can I be of service to you today?
**M:** Hi, my name is John Smith, and I am here to check in. I made a reservation for a single room for two nights three days ago. (59)
**W:** Ah... yes, Mr. Smith. We''ve been expecting you. I can see here that you requested a non-smoking room overlooking Lake Huron. You''ve also asked for your breakfast meal to be served in your room at 7 a.m. sharp, right? (60)
**M:** Yes, that is correct. I have to make a presentation at a business seminar at 9, (61) so I want to have some time to read over the materials beforehand.

Giải thích chi tiết:
#### Q61 (正确答案：A)
**问题：** What will the man most likely be doing at 9 in the morning? (男士上午 9 点最有可能在做什么？)
- (A) Giving a speech. (做演讲。)
- (B) Having a meal. (吃饭。)
- (C) Swimming in the lake. (在湖里游泳。)
- (D) Taking a flight out. (乘飞机外出。)

**延伸表达与补充：**
- **How can I be of service to you today? = How can I help you today? = What can I do for you today?** (今天我能为您做些什么？)
- **read over the materials befor', '**W:** Hello, sir, how can I be of service to you today?
**M:** Hi, my name is John Smith, and I am here to check in. I made a reservation for a single room for two nights three days ago. (59)
**W:** Ah... yes, Mr. Smith. We''ve been expecting you. I can see here that you requested a non-smoking room overlooking Lake Huron. You''ve also asked for your breakfast meal to be served in your room at 7 a.m. sharp, right? (60)
**M:** Yes, that is correct. I have to make a presentation at a business seminar at 9, (61) so I want to have some time to read over the materials beforehand.');

  -- Question #62 (toeic_part_3)
  SELECT id INTO v_question_id FROM assessment_questions WHERE assessment_id = v_assessment_id AND position = 62;
  IF v_question_id IS NULL THEN
    INSERT INTO assessment_questions (assessment_id, skill, category, difficulty, level, question_type, prompt, context_text, audio_url, options, position, weight)
    VALUES (v_assessment_id, 'listening', 'toeic_part_3', 2, 'b1', 'multiple_choice', 'Why did the man call the woman?', 'Conversation Context (Questions 62 - 64)', '/audio/toeic/real_exam/toeic_p3_q62_64.mp3', '[{"id":"A","text":"To change a booking."},{"id":"B","text":"To check on a price."},{"id":"C","text":"To ask about the availability of a vehicle."},{"id":"D","text":"To provide his payment information."}]'::jsonb, 62, 1.0)
    RETURNING id INTO v_question_id;
  ELSE
    UPDATE assessment_questions SET
      skill = 'listening',
      category = 'toeic_part_3',
      difficulty = 2,
      level = 'b1',
      prompt = 'Why did the man call the woman?',
      context_text = 'Conversation Context (Questions 62 - 64)',
      audio_url = '/audio/toeic/real_exam/toeic_p3_q62_64.mp3',
      options = '[{"id":"A","text":"To change a booking."},{"id":"B","text":"To check on a price."},{"id":"C","text":"To ask about the availability of a vehicle."},{"id":"D","text":"To provide his payment information."}]'::jsonb
    WHERE id = v_question_id;
  END IF;

  -- Answer for #62
  DELETE FROM assessment_question_answers WHERE question_id = v_question_id;
  INSERT INTO assessment_question_answers (question_id, correct_option_id, explanation, transcript_text)
  VALUES (v_question_id, 'A', 'Đáp án đúng: A.

Đoạn hội thoại:
**W:** Thank you for calling Wendigo Rental Cars. How may I be of assistance?
**M:** Hello. My name is Maurice Dumond. I made a reservation with the booking code 8570-49AA, but I''d like to change it. (62)
**W:** Of course, Mr. Dumond. You''re listed as having reserved a sedan from July 10 to 15. What would you like to alter?
**M:** I need a larger vehicle that can fit seven people, but I''m not permitted to spend more than $65 a day. (63)
**W:** Good news. We have one type of vehicle that fits your request. Will you be picking it up at the airport? (64)
**M:** That''s correct. My flight''s arriving at 10 a.m., so I''ll probably get the car around noon.

Giải thích chi tiết:
#### Q62 (正确答案：A)
**问题：** Why did the man call the woman? (男士为什么要给女士打电话？)
- (A) To change a booking. (更改预约。)
- (B) To check on a price. (核实价格。)
- (C) To ask about the availability of a vehicle. (咨询可用的车辆。)
- (D) To provide his payment information. (提供他的付款信息。)

', '**W:** Thank you for calling Wendigo Rental Cars. How may I be of assistance?
**M:** Hello. My name is Maurice Dumond. I made a reservation with the booking code 8570-49AA, but I''d like to change it. (62)
**W:** Of course, Mr. Dumond. You''re listed as having reserved a sedan from July 10 to 15. What would you like to alter?
**M:** I need a larger vehicle that can fit seven people, but I''m not permitted to spend more than $65 a day. (63)
**W:** Good news. We have one type of vehicle that fits your request. Will you be picking it up at the airport? (64)
**M:** That''s correct. My flight''s arriving at 10 a.m., so I''ll probably get the car around noon.');

  -- Question #63 (toeic_part_3)
  SELECT id INTO v_question_id FROM assessment_questions WHERE assessment_id = v_assessment_id AND position = 63;
  IF v_question_id IS NULL THEN
    INSERT INTO assessment_questions (assessment_id, skill, category, difficulty, level, question_type, prompt, context_text, audio_url, options, position, weight)
    VALUES (v_assessment_id, 'listening', 'toeic_part_3', 2, 'b1', 'multiple_choice', 'Look at the graphic. Which vehicle will the man most likely to reserve?', 'Conversation Context (Questions 62 - 64)', '/audio/toeic/real_exam/toeic_p3_q62_64.mp3', '[{"id":"A","text":"Sedan."},{"id":"B","text":"SUV."},{"id":"C","text":"Minivan."},{"id":"D","text":"Van."}]'::jsonb, 63, 1.0)
    RETURNING id INTO v_question_id;
  ELSE
    UPDATE assessment_questions SET
      skill = 'listening',
      category = 'toeic_part_3',
      difficulty = 2,
      level = 'b1',
      prompt = 'Look at the graphic. Which vehicle will the man most likely to reserve?',
      context_text = 'Conversation Context (Questions 62 - 64)',
      audio_url = '/audio/toeic/real_exam/toeic_p3_q62_64.mp3',
      options = '[{"id":"A","text":"Sedan."},{"id":"B","text":"SUV."},{"id":"C","text":"Minivan."},{"id":"D","text":"Van."}]'::jsonb
    WHERE id = v_question_id;
  END IF;

  -- Answer for #63
  DELETE FROM assessment_question_answers WHERE question_id = v_question_id;
  INSERT INTO assessment_question_answers (question_id, correct_option_id, explanation, transcript_text)
  VALUES (v_question_id, 'C', 'Đáp án đúng: C.

Đoạn hội thoại:
**W:** Thank you for calling Wendigo Rental Cars. How may I be of assistance?
**M:** Hello. My name is Maurice Dumond. I made a reservation with the booking code 8570-49AA, but I''d like to change it. (62)
**W:** Of course, Mr. Dumond. You''re listed as having reserved a sedan from July 10 to 15. What would you like to alter?
**M:** I need a larger vehicle that can fit seven people, but I''m not permitted to spend more than $65 a day. (63)
**W:** Good news. We have one type of vehicle that fits your request. Will you be picking it up at the airport? (64)
**M:** That''s correct. My flight''s arriving at 10 a.m., so I''ll probably get the car around noon.

Giải thích chi tiết:
#### Q63 (正确答案：C)
**问题：** Look at the graphic. Which vehicle will the man most likely to reserve? (请看图表，对话中的男士最有可能预订哪一款车？)
- (A) Sedan. (轿车。)
- (B) SUV. (运动型多功能车。)
- (C) Minivan. (小客车。)
- (D) Van. (面包车。)

', '**W:** Thank you for calling Wendigo Rental Cars. How may I be of assistance?
**M:** Hello. My name is Maurice Dumond. I made a reservation with the booking code 8570-49AA, but I''d like to change it. (62)
**W:** Of course, Mr. Dumond. You''re listed as having reserved a sedan from July 10 to 15. What would you like to alter?
**M:** I need a larger vehicle that can fit seven people, but I''m not permitted to spend more than $65 a day. (63)
**W:** Good news. We have one type of vehicle that fits your request. Will you be picking it up at the airport? (64)
**M:** That''s correct. My flight''s arriving at 10 a.m., so I''ll probably get the car around noon.');

  -- Question #64 (toeic_part_3)
  SELECT id INTO v_question_id FROM assessment_questions WHERE assessment_id = v_assessment_id AND position = 64;
  IF v_question_id IS NULL THEN
    INSERT INTO assessment_questions (assessment_id, skill, category, difficulty, level, question_type, prompt, context_text, audio_url, options, position, weight)
    VALUES (v_assessment_id, 'listening', 'toeic_part_3', 2, 'b1', 'multiple_choice', 'What does the woman ask the man about?', 'Conversation Context (Questions 62 - 64)', '/audio/toeic/real_exam/toeic_p3_q62_64.mp3', '[{"id":"A","text":"When he wants to return the vehicle."},{"id":"B","text":"How he wants to pay."},{"id":"C","text":"Which type of insurance he wants."},{"id":"D","text":"Where he will get the vehicle."}]'::jsonb, 64, 1.0)
    RETURNING id INTO v_question_id;
  ELSE
    UPDATE assessment_questions SET
      skill = 'listening',
      category = 'toeic_part_3',
      difficulty = 2,
      level = 'b1',
      prompt = 'What does the woman ask the man about?',
      context_text = 'Conversation Context (Questions 62 - 64)',
      audio_url = '/audio/toeic/real_exam/toeic_p3_q62_64.mp3',
      options = '[{"id":"A","text":"When he wants to return the vehicle."},{"id":"B","text":"How he wants to pay."},{"id":"C","text":"Which type of insurance he wants."},{"id":"D","text":"Where he will get the vehicle."}]'::jsonb
    WHERE id = v_question_id;
  END IF;

  -- Answer for #64
  DELETE FROM assessment_question_answers WHERE question_id = v_question_id;
  INSERT INTO assessment_question_answers (question_id, correct_option_id, explanation, transcript_text)
  VALUES (v_question_id, 'D', 'Đáp án đúng: D.

Đoạn hội thoại:
**W:** Thank you for calling Wendigo Rental Cars. How may I be of assistance?
**M:** Hello. My name is Maurice Dumond. I made a reservation with the booking code 8570-49AA, but I''d like to change it. (62)
**W:** Of course, Mr. Dumond. You''re listed as having reserved a sedan from July 10 to 15. What would you like to alter?
**M:** I need a larger vehicle that can fit seven people, but I''m not permitted to spend more than $65 a day. (63)
**W:** Good news. We have one type of vehicle that fits your request. Will you be picking it up at the airport? (64)
**M:** That''s correct. My flight''s arriving at 10 a.m., so I''ll probably get the car around noon.

Giải thích chi tiết:
#### Q64 (正确答案：D)
**问题：** What does the woman ask the man about? (对话中的女士询问了男士什么？)
- (A) When he wants to return the vehicle. (他什么时候还车。)
- (B) How he wants to pay. (他如何付款。)
- (C) Which type of insurance he wants. (他想要哪种保险。)
- (D) Where he will get the vehicle. (他在哪里取车。)

**延伸表达与补充：**
- **be of assistance = be of help = to the good** (有帮助，有好处)
  - *例句：I will be of assistance where I can, my friend.*', '**W:** Thank you for calling Wendigo Rental Cars. How may I be of assistance?
**M:** Hello. My name is Maurice Dumond. I made a reservation with the booking code 8570-49AA, but I''d like to change it. (62)
**W:** Of course, Mr. Dumond. You''re listed as having reserved a sedan from July 10 to 15. What would you like to alter?
**M:** I need a larger vehicle that can fit seven people, but I''m not permitted to spend more than $65 a day. (63)
**W:** Good news. We have one type of vehicle that fits your request. Will you be picking it up at the airport? (64)
**M:** That''s correct. My flight''s arriving at 10 a.m., so I''ll probably get the car around noon.');

  -- Question #65 (toeic_part_3)
  SELECT id INTO v_question_id FROM assessment_questions WHERE assessment_id = v_assessment_id AND position = 65;
  IF v_question_id IS NULL THEN
    INSERT INTO assessment_questions (assessment_id, skill, category, difficulty, level, question_type, prompt, context_text, audio_url, options, position, weight)
    VALUES (v_assessment_id, 'listening', 'toeic_part_3', 2, 'b1', 'multiple_choice', 'What does the woman suggest about Mr. Whistler?', 'Conversation Context (Questions 65 - 67)', '/audio/toeic/real_exam/toeic_p3_q65_67.mp3', '[{"id":"A","text":"He is her direct supervisor."},{"id":"B","text":"He is coming from out of town."},{"id":"C","text":"He will be leading the meeting."},{"id":"D","text":"He sent some data to the man."}]'::jsonb, 65, 1.0)
    RETURNING id INTO v_question_id;
  ELSE
    UPDATE assessment_questions SET
      skill = 'listening',
      category = 'toeic_part_3',
      difficulty = 2,
      level = 'b1',
      prompt = 'What does the woman suggest about Mr. Whistler?',
      context_text = 'Conversation Context (Questions 65 - 67)',
      audio_url = '/audio/toeic/real_exam/toeic_p3_q65_67.mp3',
      options = '[{"id":"A","text":"He is her direct supervisor."},{"id":"B","text":"He is coming from out of town."},{"id":"C","text":"He will be leading the meeting."},{"id":"D","text":"He sent some data to the man."}]'::jsonb
    WHERE id = v_question_id;
  END IF;

  -- Answer for #65
  DELETE FROM assessment_question_answers WHERE question_id = v_question_id;
  INSERT INTO assessment_question_answers (question_id, correct_option_id, explanation, transcript_text)
  VALUES (v_question_id, 'B', 'Đáp án đúng: B.

Đoạn hội thoại:
**M:** Laurie, don''t we have a meeting to attend at 3:30 p.m.?
**W:** You didn''t read your e-mail yet, Steve? We were all notified that it has been postponed until tomorrow because Mr. Whistler''s flight was canceled this morning. (65)
**M:** Oh, I haven''t checked my inbox all day long.
**W:** You''d better take a look at it then. That e-mail contains some important information relevant to the meeting. (66)
**M:** Thanks for letting me know about that. You know, since we have some free time now, we ought to finish doing the employee evaluations. (67)
**W:** I agree. I''ll collect the files from my office and be back soon.

Giải thích chi tiết:
#### Q65 (正确答案：B)
**问题：** What does the woman suggest about Mr. Whistler? (从女士的话中可以了解惠斯勒先生什么？)
- (A) He is her direct supervisor. (他是她的直属上级。)
- (B) He is coming from out of town. (他将从外地赶来。)
- (C) He will be leading the meeting. (他将主持会议。)
- (D) He sent some data to the man. (他给对话中的男士发送了一些数据。)

', '**M:** Laurie, don''t we have a meeting to attend at 3:30 p.m.?
**W:** You didn''t read your e-mail yet, Steve? We were all notified that it has been postponed until tomorrow because Mr. Whistler''s flight was canceled this morning. (65)
**M:** Oh, I haven''t checked my inbox all day long.
**W:** You''d better take a look at it then. That e-mail contains some important information relevant to the meeting. (66)
**M:** Thanks for letting me know about that. You know, since we have some free time now, we ought to finish doing the employee evaluations. (67)
**W:** I agree. I''ll collect the files from my office and be back soon.');

  -- Question #66 (toeic_part_3)
  SELECT id INTO v_question_id FROM assessment_questions WHERE assessment_id = v_assessment_id AND position = 66;
  IF v_question_id IS NULL THEN
    INSERT INTO assessment_questions (assessment_id, skill, category, difficulty, level, question_type, prompt, context_text, audio_url, options, position, weight)
    VALUES (v_assessment_id, 'listening', 'toeic_part_3', 2, 'b1', 'multiple_choice', 'Look at the graphic. Which person''s e-mail will the man most likely check next?', 'Conversation Context (Questions 65 - 67)', '/audio/toeic/real_exam/toeic_p3_q65_67.mp3', '[{"id":"A","text":"Jeremy Jones''s."},{"id":"B","text":"Alice Chiu''s."},{"id":"C","text":"Craig Hamels''s."},{"id":"D","text":"Linda Bronson''s."}]'::jsonb, 66, 1.0)
    RETURNING id INTO v_question_id;
  ELSE
    UPDATE assessment_questions SET
      skill = 'listening',
      category = 'toeic_part_3',
      difficulty = 2,
      level = 'b1',
      prompt = 'Look at the graphic. Which person''s e-mail will the man most likely check next?',
      context_text = 'Conversation Context (Questions 65 - 67)',
      audio_url = '/audio/toeic/real_exam/toeic_p3_q65_67.mp3',
      options = '[{"id":"A","text":"Jeremy Jones''s."},{"id":"B","text":"Alice Chiu''s."},{"id":"C","text":"Craig Hamels''s."},{"id":"D","text":"Linda Bronson''s."}]'::jsonb
    WHERE id = v_question_id;
  END IF;

  -- Answer for #66
  DELETE FROM assessment_question_answers WHERE question_id = v_question_id;
  INSERT INTO assessment_question_answers (question_id, correct_option_id, explanation, transcript_text)
  VALUES (v_question_id, 'B', 'Đáp án đúng: B.

Đoạn hội thoại:
**M:** Laurie, don''t we have a meeting to attend at 3:30 p.m.?
**W:** You didn''t read your e-mail yet, Steve? We were all notified that it has been postponed until tomorrow because Mr. Whistler''s flight was canceled this morning. (65)
**M:** Oh, I haven''t checked my inbox all day long.
**W:** You''d better take a look at it then. That e-mail contains some important information relevant to the meeting. (66)
**M:** Thanks for letting me know about that. You know, since we have some free time now, we ought to finish doing the employee evaluations. (67)
**W:** I agree. I''ll collect the files from my office and be back soon.

Giải thích chi tiết:
#### Q66 (正确答案：B)
**问题：** Look at the graphic. Which person''s e-mail will the man most likely check next? (请看图表，对话中的男士接下来最有可能查看谁发的邮件？)
- (A) Jeremy Jones''s. (杰里米 · 琼斯的邮件。)
- (B) Alice Chiu''s. (爱丽丝 · 赵的邮件。)
- (C) Craig Hamels''s. (克雷格 · 哈梅尔斯的邮件。)
- (D) Linda Bronson''s. (琳达 · 布朗森的邮件。)

', '**M:** Laurie, don''t we have a meeting to attend at 3:30 p.m.?
**W:** You didn''t read your e-mail yet, Steve? We were all notified that it has been postponed until tomorrow because Mr. Whistler''s flight was canceled this morning. (65)
**M:** Oh, I haven''t checked my inbox all day long.
**W:** You''d better take a look at it then. That e-mail contains some important information relevant to the meeting. (66)
**M:** Thanks for letting me know about that. You know, since we have some free time now, we ought to finish doing the employee evaluations. (67)
**W:** I agree. I''ll collect the files from my office and be back soon.');

  -- Question #67 (toeic_part_3)
  SELECT id INTO v_question_id FROM assessment_questions WHERE assessment_id = v_assessment_id AND position = 67;
  IF v_question_id IS NULL THEN
    INSERT INTO assessment_questions (assessment_id, skill, category, difficulty, level, question_type, prompt, context_text, audio_url, options, position, weight)
    VALUES (v_assessment_id, 'listening', 'toeic_part_3', 2, 'b1', 'multiple_choice', 'What does the man suggest doing?', 'Conversation Context (Questions 65 - 67)', '/audio/toeic/real_exam/toeic_p3_q65_67.mp3', '[{"id":"A","text":"Meeting in the woman''s office."},{"id":"B","text":"Checking over some contracts."},{"id":"C","text":"Evaluating some workers."},{"id":"D","text":"Looking at job applications."}]'::jsonb, 67, 1.0)
    RETURNING id INTO v_question_id;
  ELSE
    UPDATE assessment_questions SET
      skill = 'listening',
      category = 'toeic_part_3',
      difficulty = 2,
      level = 'b1',
      prompt = 'What does the man suggest doing?',
      context_text = 'Conversation Context (Questions 65 - 67)',
      audio_url = '/audio/toeic/real_exam/toeic_p3_q65_67.mp3',
      options = '[{"id":"A","text":"Meeting in the woman''s office."},{"id":"B","text":"Checking over some contracts."},{"id":"C","text":"Evaluating some workers."},{"id":"D","text":"Looking at job applications."}]'::jsonb
    WHERE id = v_question_id;
  END IF;

  -- Answer for #67
  DELETE FROM assessment_question_answers WHERE question_id = v_question_id;
  INSERT INTO assessment_question_answers (question_id, correct_option_id, explanation, transcript_text)
  VALUES (v_question_id, 'C', 'Đáp án đúng: C.

Đoạn hội thoại:
**M:** Laurie, don''t we have a meeting to attend at 3:30 p.m.?
**W:** You didn''t read your e-mail yet, Steve? We were all notified that it has been postponed until tomorrow because Mr. Whistler''s flight was canceled this morning. (65)
**M:** Oh, I haven''t checked my inbox all day long.
**W:** You''d better take a look at it then. That e-mail contains some important information relevant to the meeting. (66)
**M:** Thanks for letting me know about that. You know, since we have some free time now, we ought to finish doing the employee evaluations. (67)
**W:** I agree. I''ll collect the files from my office and be back soon.

Giải thích chi tiết:
#### Q67 (正确答案：C)
**问题：** What does the man suggest doing? (对话中的男士建议做什么？)
- (A) Meeting in the woman''s office. (在女士的办公室里见面。)
- (B) Checking over some contracts. (检查一些合同。)
- (C) Evaluating some workers. (评估一些员工。)
- (D) Looking at job applications. (查看求职申请。)

**延伸表达与补充：**
- **take a look at = have a look at** (看一看；检查)
  - *例句：Let''s take a look at the tools available for each phase of this cycle.* (让', '**M:** Laurie, don''t we have a meeting to attend at 3:30 p.m.?
**W:** You didn''t read your e-mail yet, Steve? We were all notified that it has been postponed until tomorrow because Mr. Whistler''s flight was canceled this morning. (65)
**M:** Oh, I haven''t checked my inbox all day long.
**W:** You''d better take a look at it then. That e-mail contains some important information relevant to the meeting. (66)
**M:** Thanks for letting me know about that. You know, since we have some free time now, we ought to finish doing the employee evaluations. (67)
**W:** I agree. I''ll collect the files from my office and be back soon.');

  -- Question #68 (toeic_part_3)
  SELECT id INTO v_question_id FROM assessment_questions WHERE assessment_id = v_assessment_id AND position = 68;
  IF v_question_id IS NULL THEN
    INSERT INTO assessment_questions (assessment_id, skill, category, difficulty, level, question_type, prompt, context_text, audio_url, options, position, weight)
    VALUES (v_assessment_id, 'listening', 'toeic_part_3', 2, 'b1', 'multiple_choice', 'Why is the man unhappy?', 'Conversation Context (Questions 68 - 70)', '/audio/toeic/real_exam/toeic_p3_q68_70.mp3', '[{"id":"A","text":"A fee was higher than expected."},{"id":"B","text":"Employees are being fired."},{"id":"C","text":"Some results were negative."},{"id":"D","text":"His performance review was bad."}]'::jsonb, 68, 1.0)
    RETURNING id INTO v_question_id;
  ELSE
    UPDATE assessment_questions SET
      skill = 'listening',
      category = 'toeic_part_3',
      difficulty = 2,
      level = 'b1',
      prompt = 'Why is the man unhappy?',
      context_text = 'Conversation Context (Questions 68 - 70)',
      audio_url = '/audio/toeic/real_exam/toeic_p3_q68_70.mp3',
      options = '[{"id":"A","text":"A fee was higher than expected."},{"id":"B","text":"Employees are being fired."},{"id":"C","text":"Some results were negative."},{"id":"D","text":"His performance review was bad."}]'::jsonb
    WHERE id = v_question_id;
  END IF;

  -- Answer for #68
  DELETE FROM assessment_question_answers WHERE question_id = v_question_id;
  INSERT INTO assessment_question_answers (question_id, correct_option_id, explanation, transcript_text)
  VALUES (v_question_id, 'C', 'Đáp án đúng: C.

Đoạn hội thoại:
**W:** You look somewhat disappointed. Is there something wrong?
**M:** Baker Research sent us the results of the customer satisfaction survey we conducted last month. As you can see, the numbers are less than stellar. (68)
**W:** Wow, we got low marks on nearly everything. I think we''d better review the information together.
**M:** I agree. But let''s examine the top-rated one first to try to figure out what we''re doing correctly. (69)
**W:** That makes sense. Nobody''s using the conference room, so we can discuss the matter in there.
**M:** Okay. Let me grab a cup of coffee first. (70) This is probably going to be a lengthy meeting. Rosemary''s Survey Results

Giải thích chi tiết:
#### Q68 (正确答案：C)
**问题：** Why is the man unhappy? (对话中的男士为什么不开心？)
- (A) A fee was higher than expected. (某项费用比预期的高。)
- (B) Employees are being fired. (员工们将被解雇。)
- (C) Some results were negative. (一些结果不太理想。)
- (D) His performance review was bad. (他的业绩评价不好。)

', '**W:** You look somewhat disappointed. Is there something wrong?
**M:** Baker Research sent us the results of the customer satisfaction survey we conducted last month. As you can see, the numbers are less than stellar. (68)
**W:** Wow, we got low marks on nearly everything. I think we''d better review the information together.
**M:** I agree. But let''s examine the top-rated one first to try to figure out what we''re doing correctly. (69)
**W:** That makes sense. Nobody''s using the conference room, so we can discuss the matter in there.
**M:** Okay. Let me grab a cup of coffee first. (70) This is probably going to be a lengthy meeting. Rosemary''s Survey Results');

  -- Question #69 (toeic_part_3)
  SELECT id INTO v_question_id FROM assessment_questions WHERE assessment_id = v_assessment_id AND position = 69;
  IF v_question_id IS NULL THEN
    INSERT INTO assessment_questions (assessment_id, skill, category, difficulty, level, question_type, prompt, context_text, audio_url, options, position, weight)
    VALUES (v_assessment_id, 'listening', 'toeic_part_3', 2, 'b1', 'multiple_choice', 'Look at the graphic. What will the speakers talk about first?', 'Conversation Context (Questions 68 - 70)', '/audio/toeic/real_exam/toeic_p3_q68_70.mp3', '[{"id":"A","text":"Prices."},{"id":"B","text":"Selection."},{"id":"C","text":"Online store."},{"id":"D","text":"Overall."}]'::jsonb, 69, 1.0)
    RETURNING id INTO v_question_id;
  ELSE
    UPDATE assessment_questions SET
      skill = 'listening',
      category = 'toeic_part_3',
      difficulty = 2,
      level = 'b1',
      prompt = 'Look at the graphic. What will the speakers talk about first?',
      context_text = 'Conversation Context (Questions 68 - 70)',
      audio_url = '/audio/toeic/real_exam/toeic_p3_q68_70.mp3',
      options = '[{"id":"A","text":"Prices."},{"id":"B","text":"Selection."},{"id":"C","text":"Online store."},{"id":"D","text":"Overall."}]'::jsonb
    WHERE id = v_question_id;
  END IF;

  -- Answer for #69
  DELETE FROM assessment_question_answers WHERE question_id = v_question_id;
  INSERT INTO assessment_question_answers (question_id, correct_option_id, explanation, transcript_text)
  VALUES (v_question_id, 'C', 'Đáp án đúng: C.

Đoạn hội thoại:
**W:** You look somewhat disappointed. Is there something wrong?
**M:** Baker Research sent us the results of the customer satisfaction survey we conducted last month. As you can see, the numbers are less than stellar. (68)
**W:** Wow, we got low marks on nearly everything. I think we''d better review the information together.
**M:** I agree. But let''s examine the top-rated one first to try to figure out what we''re doing correctly. (69)
**W:** That makes sense. Nobody''s using the conference room, so we can discuss the matter in there.
**M:** Okay. Let me grab a cup of coffee first. (70) This is probably going to be a lengthy meeting. Rosemary''s Survey Results

Giải thích chi tiết:
#### Q69 (正确答案：C)
**问题：** Look at the graphic. What will the speakers talk about first? (请看图表，讲话者们会先谈论什么？)
- (A) Prices. (价格。)
- (B) Selection. (精选品。)
- (C) Online store. (在线商店。)
- (D) Overall. (综合。)

', '**W:** You look somewhat disappointed. Is there something wrong?
**M:** Baker Research sent us the results of the customer satisfaction survey we conducted last month. As you can see, the numbers are less than stellar. (68)
**W:** Wow, we got low marks on nearly everything. I think we''d better review the information together.
**M:** I agree. But let''s examine the top-rated one first to try to figure out what we''re doing correctly. (69)
**W:** That makes sense. Nobody''s using the conference room, so we can discuss the matter in there.
**M:** Okay. Let me grab a cup of coffee first. (70) This is probably going to be a lengthy meeting. Rosemary''s Survey Results');

  -- Question #70 (toeic_part_3)
  SELECT id INTO v_question_id FROM assessment_questions WHERE assessment_id = v_assessment_id AND position = 70;
  IF v_question_id IS NULL THEN
    INSERT INTO assessment_questions (assessment_id, skill, category, difficulty, level, question_type, prompt, context_text, audio_url, options, position, weight)
    VALUES (v_assessment_id, 'listening', 'toeic_part_3', 2, 'b1', 'multiple_choice', 'What will the man most likely do next?', 'Conversation Context (Questions 68 - 70)', '/audio/toeic/real_exam/toeic_p3_q68_70.mp3', '[{"id":"A","text":"Call Baker Research."},{"id":"B","text":"Get something to drink."},{"id":"C","text":"Set up the conference room."},{"id":"D","text":"Return to his office."}]'::jsonb, 70, 1.0)
    RETURNING id INTO v_question_id;
  ELSE
    UPDATE assessment_questions SET
      skill = 'listening',
      category = 'toeic_part_3',
      difficulty = 2,
      level = 'b1',
      prompt = 'What will the man most likely do next?',
      context_text = 'Conversation Context (Questions 68 - 70)',
      audio_url = '/audio/toeic/real_exam/toeic_p3_q68_70.mp3',
      options = '[{"id":"A","text":"Call Baker Research."},{"id":"B","text":"Get something to drink."},{"id":"C","text":"Set up the conference room."},{"id":"D","text":"Return to his office."}]'::jsonb
    WHERE id = v_question_id;
  END IF;

  -- Answer for #70
  DELETE FROM assessment_question_answers WHERE question_id = v_question_id;
  INSERT INTO assessment_question_answers (question_id, correct_option_id, explanation, transcript_text)
  VALUES (v_question_id, 'B', 'Đáp án đúng: B.

Đoạn hội thoại:
**W:** You look somewhat disappointed. Is there something wrong?
**M:** Baker Research sent us the results of the customer satisfaction survey we conducted last month. As you can see, the numbers are less than stellar. (68)
**W:** Wow, we got low marks on nearly everything. I think we''d better review the information together.
**M:** I agree. But let''s examine the top-rated one first to try to figure out what we''re doing correctly. (69)
**W:** That makes sense. Nobody''s using the conference room, so we can discuss the matter in there.
**M:** Okay. Let me grab a cup of coffee first. (70) This is probably going to be a lengthy meeting. Rosemary''s Survey Results

Giải thích chi tiết:
#### Q70 (正确答案：B)
**问题：** What will the man most likely do next? (对话中的男士接下来最有可能做什么？)
- (A) Call Baker Research. (给贝克研究所打电话。)
- (B) Get something to drink. (去拿喝的东西。)
- (C) Set up the conference room. (布置会议室。)
- (D) Return to his office. (返回他的办公室。)

**延伸表达与补充：**
- **figure out = work out** (解决；想出)
  - *例句：We need to work together to figure out what the data means.* (我们需要一起来找出这些数据意味着什么。)
- **make sen', '**W:** You look somewhat disappointed. Is there something wrong?
**M:** Baker Research sent us the results of the customer satisfaction survey we conducted last month. As you can see, the numbers are less than stellar. (68)
**W:** Wow, we got low marks on nearly everything. I think we''d better review the information together.
**M:** I agree. But let''s examine the top-rated one first to try to figure out what we''re doing correctly. (69)
**W:** That makes sense. Nobody''s using the conference room, so we can discuss the matter in there.
**M:** Okay. Let me grab a cup of coffee first. (70) This is probably going to be a lengthy meeting. Rosemary''s Survey Results');

  -- Question #71 (toeic_part_4)
  SELECT id INTO v_question_id FROM assessment_questions WHERE assessment_id = v_assessment_id AND position = 71;
  IF v_question_id IS NULL THEN
    INSERT INTO assessment_questions (assessment_id, skill, category, difficulty, level, question_type, prompt, context_text, audio_url, options, position, weight)
    VALUES (v_assessment_id, 'listening', 'toeic_part_4', 2, 'b1', 'multiple_choice', 'On which day does this message take place?', 'Talk Context (Questions 71 - 73)', '/audio/toeic/real_exam/toeic_p4_q71_73.mp3', '[{"id":"A","text":"Saturday."},{"id":"B","text":"Monday."},{"id":"C","text":"Friday."},{"id":"D","text":"Tuesday."}]'::jsonb, 71, 1.0)
    RETURNING id INTO v_question_id;
  ELSE
    UPDATE assessment_questions SET
      skill = 'listening',
      category = 'toeic_part_4',
      difficulty = 2,
      level = 'b1',
      prompt = 'On which day does this message take place?',
      context_text = 'Talk Context (Questions 71 - 73)',
      audio_url = '/audio/toeic/real_exam/toeic_p4_q71_73.mp3',
      options = '[{"id":"A","text":"Saturday."},{"id":"B","text":"Monday."},{"id":"C","text":"Friday."},{"id":"D","text":"Tuesday."}]'::jsonb
    WHERE id = v_question_id;
  END IF;

  -- Answer for #71
  DELETE FROM assessment_question_answers WHERE question_id = v_question_id;
  INSERT INTO assessment_question_answers (question_id, correct_option_id, explanation, transcript_text)
  VALUES (v_question_id, 'B', 'Đáp án đúng: B.

Bài nói:
Thank you for calling TC Telecom on this beautiful September Monday morning. (71) Currently, all of our operators are busy with other calls, (72) however, if you''d be kind enough to wait on the line, one of our operators will be with you very shortly. In the meantime, if you know the extension of the person you wish to contact, please press it on your phone now. If you are calling to check your account profile, please press 1. If you wish to delete or change a service, please press 2. (73) If you would like to get in touch with our billing services, press 3. If this is a call that needs the attention of a customer service representative, please continue holding, and talk to the operator.Thank you and we hope you have a great day. Remember, we here at TC Telecom value every call.

Giải thích chi tiết:
#### Q71 (正确答案：B)
**问题：** On which day does this message take place? (这条信息是周几发出的？)
- (A) Saturday. (周六。)
- (B) Monday. (周一。)
- (C) Friday. (周五。)
- (D) Tuesday. (周二。)

', 'Thank you for calling TC Telecom on this beautiful September Monday morning. (71) Currently, all of our operators are busy with other calls, (72) however, if you''d be kind enough to wait on the line, one of our operators will be with you very shortly. In the meantime, if you know the extension of the person you wish to contact, please press it on your phone now. If you are calling to check your account profile, please press 1. If you wish to delete or change a service, please press 2. (73) If you would like to get in touch with our billing services, press 3. If this is a call that needs the attention of a customer service representative, please continue holding, and talk to the operator.Thank you and we hope you have a great day. Remember, we here at TC Telecom value every call.');

  -- Question #72 (toeic_part_4)
  SELECT id INTO v_question_id FROM assessment_questions WHERE assessment_id = v_assessment_id AND position = 72;
  IF v_question_id IS NULL THEN
    INSERT INTO assessment_questions (assessment_id, skill, category, difficulty, level, question_type, prompt, context_text, audio_url, options, position, weight)
    VALUES (v_assessment_id, 'listening', 'toeic_part_4', 2, 'b1', 'multiple_choice', 'Why is the caller getting this message?', 'Talk Context (Questions 71 - 73)', '/audio/toeic/real_exam/toeic_p4_q71_73.mp3', '[{"id":"A","text":"All the lines are busy."},{"id":"B","text":"It is a national holiday."},{"id":"C","text":"Everyone is out to lunch."},{"id":"D","text":"It is after working hours."}]'::jsonb, 72, 1.0)
    RETURNING id INTO v_question_id;
  ELSE
    UPDATE assessment_questions SET
      skill = 'listening',
      category = 'toeic_part_4',
      difficulty = 2,
      level = 'b1',
      prompt = 'Why is the caller getting this message?',
      context_text = 'Talk Context (Questions 71 - 73)',
      audio_url = '/audio/toeic/real_exam/toeic_p4_q71_73.mp3',
      options = '[{"id":"A","text":"All the lines are busy."},{"id":"B","text":"It is a national holiday."},{"id":"C","text":"Everyone is out to lunch."},{"id":"D","text":"It is after working hours."}]'::jsonb
    WHERE id = v_question_id;
  END IF;

  -- Answer for #72
  DELETE FROM assessment_question_answers WHERE question_id = v_question_id;
  INSERT INTO assessment_question_answers (question_id, correct_option_id, explanation, transcript_text)
  VALUES (v_question_id, 'A', 'Đáp án đúng: A.

Bài nói:
Thank you for calling TC Telecom on this beautiful September Monday morning. (71) Currently, all of our operators are busy with other calls, (72) however, if you''d be kind enough to wait on the line, one of our operators will be with you very shortly. In the meantime, if you know the extension of the person you wish to contact, please press it on your phone now. If you are calling to check your account profile, please press 1. If you wish to delete or change a service, please press 2. (73) If you would like to get in touch with our billing services, press 3. If this is a call that needs the attention of a customer service representative, please continue holding, and talk to the operator.Thank you and we hope you have a great day. Remember, we here at TC Telecom value every call.

Giải thích chi tiết:
#### Q72 (正确答案：A)
**问题：** Why is the caller getting this message? (打电话者为什么会收到这条信息？)
- (A) All the lines are busy. (所有的线路都忙。)
- (B) It is a national holiday. (今天是国家法定假日。)
- (C) Everyone is out to lunch. (所有人都出去吃午饭了。)
- (D) It is after working hours. (现在是下班时间。)

', 'Thank you for calling TC Telecom on this beautiful September Monday morning. (71) Currently, all of our operators are busy with other calls, (72) however, if you''d be kind enough to wait on the line, one of our operators will be with you very shortly. In the meantime, if you know the extension of the person you wish to contact, please press it on your phone now. If you are calling to check your account profile, please press 1. If you wish to delete or change a service, please press 2. (73) If you would like to get in touch with our billing services, press 3. If this is a call that needs the attention of a customer service representative, please continue holding, and talk to the operator.Thank you and we hope you have a great day. Remember, we here at TC Telecom value every call.');

  -- Question #73 (toeic_part_4)
  SELECT id INTO v_question_id FROM assessment_questions WHERE assessment_id = v_assessment_id AND position = 73;
  IF v_question_id IS NULL THEN
    INSERT INTO assessment_questions (assessment_id, skill, category, difficulty, level, question_type, prompt, context_text, audio_url, options, position, weight)
    VALUES (v_assessment_id, 'listening', 'toeic_part_4', 2, 'b1', 'multiple_choice', 'What should those who wish to make a change in their service do?', 'Talk Context (Questions 71 - 73)', '/audio/toeic/real_exam/toeic_p4_q71_73.mp3', '[{"id":"A","text":"Stay on the line."},{"id":"B","text":"Call back another time."},{"id":"C","text":"Press a button on the phone."},{"id":"D","text":"Talk to an operator."}]'::jsonb, 73, 1.0)
    RETURNING id INTO v_question_id;
  ELSE
    UPDATE assessment_questions SET
      skill = 'listening',
      category = 'toeic_part_4',
      difficulty = 2,
      level = 'b1',
      prompt = 'What should those who wish to make a change in their service do?',
      context_text = 'Talk Context (Questions 71 - 73)',
      audio_url = '/audio/toeic/real_exam/toeic_p4_q71_73.mp3',
      options = '[{"id":"A","text":"Stay on the line."},{"id":"B","text":"Call back another time."},{"id":"C","text":"Press a button on the phone."},{"id":"D","text":"Talk to an operator."}]'::jsonb
    WHERE id = v_question_id;
  END IF;

  -- Answer for #73
  DELETE FROM assessment_question_answers WHERE question_id = v_question_id;
  INSERT INTO assessment_question_answers (question_id, correct_option_id, explanation, transcript_text)
  VALUES (v_question_id, 'C', 'Đáp án đúng: C.

Bài nói:
Thank you for calling TC Telecom on this beautiful September Monday morning. (71) Currently, all of our operators are busy with other calls, (72) however, if you''d be kind enough to wait on the line, one of our operators will be with you very shortly. In the meantime, if you know the extension of the person you wish to contact, please press it on your phone now. If you are calling to check your account profile, please press 1. If you wish to delete or change a service, please press 2. (73) If you would like to get in touch with our billing services, press 3. If this is a call that needs the attention of a customer service representative, please continue holding, and talk to the operator.Thank you and we hope you have a great day. Remember, we here at TC Telecom value every call.

Giải thích chi tiết:
#### Q73 (正确答案：C)
**问题：** What should those who wish to make a change in their service do? (那些想更改服务的人应该怎么做？)
- (A) Stay on the line. (继续等待。)
- (B) Call back another time. (换个时间再打。)
- (C) Press a button on the phone. (拨一个电话键。)
- (D) Talk to an operator. (与话务员通话。)

**延伸表达与补充：**
- **get in touch with ~ = get in contact with ~ = get through to ~** (与…取得联系)
  - *例句：Did you get in touch with your old sc', 'Thank you for calling TC Telecom on this beautiful September Monday morning. (71) Currently, all of our operators are busy with other calls, (72) however, if you''d be kind enough to wait on the line, one of our operators will be with you very shortly. In the meantime, if you know the extension of the person you wish to contact, please press it on your phone now. If you are calling to check your account profile, please press 1. If you wish to delete or change a service, please press 2. (73) If you would like to get in touch with our billing services, press 3. If this is a call that needs the attention of a customer service representative, please continue holding, and talk to the operator.Thank you and we hope you have a great day. Remember, we here at TC Telecom value every call.');

  -- Question #74 (toeic_part_4)
  SELECT id INTO v_question_id FROM assessment_questions WHERE assessment_id = v_assessment_id AND position = 74;
  IF v_question_id IS NULL THEN
    INSERT INTO assessment_questions (assessment_id, skill, category, difficulty, level, question_type, prompt, context_text, audio_url, options, position, weight)
    VALUES (v_assessment_id, 'listening', 'toeic_part_4', 2, 'b1', 'multiple_choice', 'Who would most likely be listening to this talk?', 'Talk Context (Questions 74 - 76)', '/audio/toeic/real_exam/toeic_p4_q74_76.mp3', '[{"id":"A","text":"Teachers at local schools."},{"id":"B","text":"Community residents."},{"id":"C","text":"Students from out of town."},{"id":"D","text":"Entertainers."}]'::jsonb, 74, 1.0)
    RETURNING id INTO v_question_id;
  ELSE
    UPDATE assessment_questions SET
      skill = 'listening',
      category = 'toeic_part_4',
      difficulty = 2,
      level = 'b1',
      prompt = 'Who would most likely be listening to this talk?',
      context_text = 'Talk Context (Questions 74 - 76)',
      audio_url = '/audio/toeic/real_exam/toeic_p4_q74_76.mp3',
      options = '[{"id":"A","text":"Teachers at local schools."},{"id":"B","text":"Community residents."},{"id":"C","text":"Students from out of town."},{"id":"D","text":"Entertainers."}]'::jsonb
    WHERE id = v_question_id;
  END IF;

  -- Answer for #74
  DELETE FROM assessment_question_answers WHERE question_id = v_question_id;
  INSERT INTO assessment_question_answers (question_id, correct_option_id, explanation, transcript_text)
  VALUES (v_question_id, 'B', 'Đáp án đúng: B.

Bài nói:
I''d like to welcome everyone to our special community event here on this Children''s Day. As I look around, I cannot help but say how wonderful it is to see many children from our community holding the hands of their parents and grandparents. (74) It provides me with great pleasure to see you all. Now, before we begin with the main attraction of the day, I''d like to remind all the parents that we will be holding classes every Thursday for those who wish to do a little extra for their children. (75) As most of you the parents know and agree, it is vital that we instill in our children the special qualities each and every single one of them possesses. We as parents should help our children achieve their dreams and visions. And for this reason, we have set up special classes for the parents to learn how to bring out the best in their children. If any parents are interested, please talk to us today. (76) Now, let''s get back to today''s agenda and bring out the person everyone here is waiting for. Would everyone give a big hand of applause for “Teddy the Clown”?

Giải thích chi tiết:
#### Q74 (正确答案：B)
**问题：** Who would most likely be listening to this talk? (谁最有可能在听这个讲话？)
- (A) Teachers at local schools. (当地学校的教师。)
- (B) Community residents. (社区居民。)
- (C) Students from out of town. (外地的学生。)
- (D) Entertainers. (演员。)

', 'I''d like to welcome everyone to our special community event here on this Children''s Day. As I look around, I cannot help but say how wonderful it is to see many children from our community holding the hands of their parents and grandparents. (74) It provides me with great pleasure to see you all. Now, before we begin with the main attraction of the day, I''d like to remind all the parents that we will be holding classes every Thursday for those who wish to do a little extra for their children. (75) As most of you the parents know and agree, it is vital that we instill in our children the special qualities each and every single one of them possesses. We as parents should help our children achieve their dreams and visions. And for this reason, we have set up special classes for the parents to learn how to bring out the best in their children. If any parents are interested, please talk to us today. (76) Now, let''s get back to today''s agenda and bring out the person everyone here is waiting for. Would everyone give a big hand of applause for “Teddy the Clown”?');

  -- Question #75 (toeic_part_4)
  SELECT id INTO v_question_id FROM assessment_questions WHERE assessment_id = v_assessment_id AND position = 75;
  IF v_question_id IS NULL THEN
    INSERT INTO assessment_questions (assessment_id, skill, category, difficulty, level, question_type, prompt, context_text, audio_url, options, position, weight)
    VALUES (v_assessment_id, 'listening', 'toeic_part_4', 2, 'b1', 'multiple_choice', 'How often will the class mentioned be held?', 'Talk Context (Questions 74 - 76)', '/audio/toeic/real_exam/toeic_p4_q74_76.mp3', '[{"id":"A","text":"Once a week."},{"id":"B","text":"Twice a week."},{"id":"C","text":"Three times a week."},{"id":"D","text":"Everyday."}]'::jsonb, 75, 1.0)
    RETURNING id INTO v_question_id;
  ELSE
    UPDATE assessment_questions SET
      skill = 'listening',
      category = 'toeic_part_4',
      difficulty = 2,
      level = 'b1',
      prompt = 'How often will the class mentioned be held?',
      context_text = 'Talk Context (Questions 74 - 76)',
      audio_url = '/audio/toeic/real_exam/toeic_p4_q74_76.mp3',
      options = '[{"id":"A","text":"Once a week."},{"id":"B","text":"Twice a week."},{"id":"C","text":"Three times a week."},{"id":"D","text":"Everyday."}]'::jsonb
    WHERE id = v_question_id;
  END IF;

  -- Answer for #75
  DELETE FROM assessment_question_answers WHERE question_id = v_question_id;
  INSERT INTO assessment_question_answers (question_id, correct_option_id, explanation, transcript_text)
  VALUES (v_question_id, 'A', 'Đáp án đúng: A.

Bài nói:
I''d like to welcome everyone to our special community event here on this Children''s Day. As I look around, I cannot help but say how wonderful it is to see many children from our community holding the hands of their parents and grandparents. (74) It provides me with great pleasure to see you all. Now, before we begin with the main attraction of the day, I''d like to remind all the parents that we will be holding classes every Thursday for those who wish to do a little extra for their children. (75) As most of you the parents know and agree, it is vital that we instill in our children the special qualities each and every single one of them possesses. We as parents should help our children achieve their dreams and visions. And for this reason, we have set up special classes for the parents to learn how to bring out the best in their children. If any parents are interested, please talk to us today. (76) Now, let''s get back to today''s agenda and bring out the person everyone here is waiting for. Would everyone give a big hand of applause for “Teddy the Clown”?

Giải thích chi tiết:
#### Q75 (正确答案：A)
**问题：** How often will the class mentioned be held? (被提到的课程多久举办一次？)
- (A) Once a week. (一周一次。)
- (B) Twice a week. (一周两次。)
- (C) Three times a week. (一周三次。)
- (D) Everyday. (每天。)

', 'I''d like to welcome everyone to our special community event here on this Children''s Day. As I look around, I cannot help but say how wonderful it is to see many children from our community holding the hands of their parents and grandparents. (74) It provides me with great pleasure to see you all. Now, before we begin with the main attraction of the day, I''d like to remind all the parents that we will be holding classes every Thursday for those who wish to do a little extra for their children. (75) As most of you the parents know and agree, it is vital that we instill in our children the special qualities each and every single one of them possesses. We as parents should help our children achieve their dreams and visions. And for this reason, we have set up special classes for the parents to learn how to bring out the best in their children. If any parents are interested, please talk to us today. (76) Now, let''s get back to today''s agenda and bring out the person everyone here is waiting for. Would everyone give a big hand of applause for “Teddy the Clown”?');

  -- Question #76 (toeic_part_4)
  SELECT id INTO v_question_id FROM assessment_questions WHERE assessment_id = v_assessment_id AND position = 76;
  IF v_question_id IS NULL THEN
    INSERT INTO assessment_questions (assessment_id, skill, category, difficulty, level, question_type, prompt, context_text, audio_url, options, position, weight)
    VALUES (v_assessment_id, 'listening', 'toeic_part_4', 2, 'b1', 'multiple_choice', 'What are those interested in the class asked to do?', 'Talk Context (Questions 74 - 76)', '/audio/toeic/real_exam/toeic_p4_q74_76.mp3', '[{"id":"A","text":"Sign up today at the community center."},{"id":"B","text":"Speak with the coordinators after the talk."},{"id":"C","text":"Deposit a check into the bank account."},{"id":"D","text":"Take an admissions test after the talk."}]'::jsonb, 76, 1.0)
    RETURNING id INTO v_question_id;
  ELSE
    UPDATE assessment_questions SET
      skill = 'listening',
      category = 'toeic_part_4',
      difficulty = 2,
      level = 'b1',
      prompt = 'What are those interested in the class asked to do?',
      context_text = 'Talk Context (Questions 74 - 76)',
      audio_url = '/audio/toeic/real_exam/toeic_p4_q74_76.mp3',
      options = '[{"id":"A","text":"Sign up today at the community center."},{"id":"B","text":"Speak with the coordinators after the talk."},{"id":"C","text":"Deposit a check into the bank account."},{"id":"D","text":"Take an admissions test after the talk."}]'::jsonb
    WHERE id = v_question_id;
  END IF;

  -- Answer for #76
  DELETE FROM assessment_question_answers WHERE question_id = v_question_id;
  INSERT INTO assessment_question_answers (question_id, correct_option_id, explanation, transcript_text)
  VALUES (v_question_id, 'B', 'Đáp án đúng: B.

Bài nói:
I''d like to welcome everyone to our special community event here on this Children''s Day. As I look around, I cannot help but say how wonderful it is to see many children from our community holding the hands of their parents and grandparents. (74) It provides me with great pleasure to see you all. Now, before we begin with the main attraction of the day, I''d like to remind all the parents that we will be holding classes every Thursday for those who wish to do a little extra for their children. (75) As most of you the parents know and agree, it is vital that we instill in our children the special qualities each and every single one of them possesses. We as parents should help our children achieve their dreams and visions. And for this reason, we have set up special classes for the parents to learn how to bring out the best in their children. If any parents are interested, please talk to us today. (76) Now, let''s get back to today''s agenda and bring out the person everyone here is waiting for. Would everyone give a big hand of applause for “Teddy the Clown”?

Giải thích chi tiết:
#### Q76 (正确答案：B)
**问题：** What are those interested in the class asked to do? (那些对这个课程感兴趣的人应该怎么做？)
- (A) Sign up today at the community center. (在社区中心登记。)
- (B) Speak with the coordinators after the talk. (在讲话结束后找课程协调人。)
- (C) Deposit a check into the bank account. (在银行账户里存一张支票。)
- (D) Take an admissions test after the talk. (在讲话结束后参加一项入学测试。)

**延伸表达与补充：**
- **I cannot help but say ~ = I am forced', 'I''d like to welcome everyone to our special community event here on this Children''s Day. As I look around, I cannot help but say how wonderful it is to see many children from our community holding the hands of their parents and grandparents. (74) It provides me with great pleasure to see you all. Now, before we begin with the main attraction of the day, I''d like to remind all the parents that we will be holding classes every Thursday for those who wish to do a little extra for their children. (75) As most of you the parents know and agree, it is vital that we instill in our children the special qualities each and every single one of them possesses. We as parents should help our children achieve their dreams and visions. And for this reason, we have set up special classes for the parents to learn how to bring out the best in their children. If any parents are interested, please talk to us today. (76) Now, let''s get back to today''s agenda and bring out the person everyone here is waiting for. Would everyone give a big hand of applause for “Teddy the Clown”?');

  -- Question #77 (toeic_part_4)
  SELECT id INTO v_question_id FROM assessment_questions WHERE assessment_id = v_assessment_id AND position = 77;
  IF v_question_id IS NULL THEN
    INSERT INTO assessment_questions (assessment_id, skill, category, difficulty, level, question_type, prompt, context_text, audio_url, options, position, weight)
    VALUES (v_assessment_id, 'listening', 'toeic_part_4', 2, 'b1', 'multiple_choice', 'What does the speaker mention is special about Mr. Rowe?', 'Talk Context (Questions 77 - 79)', '/audio/toeic/real_exam/toeic_p4_q77_79.mp3', '[{"id":"A","text":"He is the youngest person to head a company."},{"id":"B","text":"He has followed in the footsteps of his great father."},{"id":"C","text":"He made a lot of money by investing in stocks."},{"id":"D","text":"He is related to the company president."}]'::jsonb, 77, 1.0)
    RETURNING id INTO v_question_id;
  ELSE
    UPDATE assessment_questions SET
      skill = 'listening',
      category = 'toeic_part_4',
      difficulty = 2,
      level = 'b1',
      prompt = 'What does the speaker mention is special about Mr. Rowe?',
      context_text = 'Talk Context (Questions 77 - 79)',
      audio_url = '/audio/toeic/real_exam/toeic_p4_q77_79.mp3',
      options = '[{"id":"A","text":"He is the youngest person to head a company."},{"id":"B","text":"He has followed in the footsteps of his great father."},{"id":"C","text":"He made a lot of money by investing in stocks."},{"id":"D","text":"He is related to the company president."}]'::jsonb
    WHERE id = v_question_id;
  END IF;

  -- Answer for #77
  DELETE FROM assessment_question_answers WHERE question_id = v_question_id;
  INSERT INTO assessment_question_answers (question_id, correct_option_id, explanation, transcript_text)
  VALUES (v_question_id, 'A', 'Đáp án đúng: A.

Bài nói:
That was Mr. Smith with his insightful information about the types of investments out on the market today. Now, it is my pleasure to introduce the next speaker of the day, Mr. Sam Rowe. Mr. Rowe, who has been at the center of attention in the business world lately as the youngest person ever to become the Chief Executive Officer at Livetalk Communications, (77) credits the teachings of his father, Mark Rowe, for success. (78) According to Mr. Rowe, the work ethics and positive attitude displayed by his father during his childhood set the standards for the way he works today. He stresses the importance of our everyday attitude toward work and will give us some tips on how to make them become part of us. (79) Anyway, at the age of 35, he is the youngest person ever to hold the head position at Livetalk Communications. Here is Mr. Rowe.

Giải thích chi tiết:
#### Q77 (正确答案：A)
**问题：** What does the speaker mention is special about Mr. Rowe? (讲话者提到罗先生的特别之处是什么？)
- (A) He is the youngest person to head a company. (他是最年轻的公司领导。)
- (B) He has followed in the footsteps of his great father. (他一直追随他伟大父亲的足迹。)
- (C) He made a lot of money by investing in stocks. (他通过投资股票赚了很多钱。)
- (D) He is related to the company president. (他和公司总裁是亲戚。)

', 'That was Mr. Smith with his insightful information about the types of investments out on the market today. Now, it is my pleasure to introduce the next speaker of the day, Mr. Sam Rowe. Mr. Rowe, who has been at the center of attention in the business world lately as the youngest person ever to become the Chief Executive Officer at Livetalk Communications, (77) credits the teachings of his father, Mark Rowe, for success. (78) According to Mr. Rowe, the work ethics and positive attitude displayed by his father during his childhood set the standards for the way he works today. He stresses the importance of our everyday attitude toward work and will give us some tips on how to make them become part of us. (79) Anyway, at the age of 35, he is the youngest person ever to hold the head position at Livetalk Communications. Here is Mr. Rowe.');

  -- Question #78 (toeic_part_4)
  SELECT id INTO v_question_id FROM assessment_questions WHERE assessment_id = v_assessment_id AND position = 78;
  IF v_question_id IS NULL THEN
    INSERT INTO assessment_questions (assessment_id, skill, category, difficulty, level, question_type, prompt, context_text, audio_url, options, position, weight)
    VALUES (v_assessment_id, 'listening', 'toeic_part_4', 2, 'b1', 'multiple_choice', 'Who does Sam credit his success to?', 'Talk Context (Questions 77 - 79)', '/audio/toeic/real_exam/toeic_p4_q77_79.mp3', '[{"id":"A","text":"Mr. Smith."},{"id":"B","text":"One of the investors."},{"id":"C","text":"The company CEO."},{"id":"D","text":"His father."}]'::jsonb, 78, 1.0)
    RETURNING id INTO v_question_id;
  ELSE
    UPDATE assessment_questions SET
      skill = 'listening',
      category = 'toeic_part_4',
      difficulty = 2,
      level = 'b1',
      prompt = 'Who does Sam credit his success to?',
      context_text = 'Talk Context (Questions 77 - 79)',
      audio_url = '/audio/toeic/real_exam/toeic_p4_q77_79.mp3',
      options = '[{"id":"A","text":"Mr. Smith."},{"id":"B","text":"One of the investors."},{"id":"C","text":"The company CEO."},{"id":"D","text":"His father."}]'::jsonb
    WHERE id = v_question_id;
  END IF;

  -- Answer for #78
  DELETE FROM assessment_question_answers WHERE question_id = v_question_id;
  INSERT INTO assessment_question_answers (question_id, correct_option_id, explanation, transcript_text)
  VALUES (v_question_id, 'D', 'Đáp án đúng: D.

Bài nói:
That was Mr. Smith with his insightful information about the types of investments out on the market today. Now, it is my pleasure to introduce the next speaker of the day, Mr. Sam Rowe. Mr. Rowe, who has been at the center of attention in the business world lately as the youngest person ever to become the Chief Executive Officer at Livetalk Communications, (77) credits the teachings of his father, Mark Rowe, for success. (78) According to Mr. Rowe, the work ethics and positive attitude displayed by his father during his childhood set the standards for the way he works today. He stresses the importance of our everyday attitude toward work and will give us some tips on how to make them become part of us. (79) Anyway, at the age of 35, he is the youngest person ever to hold the head position at Livetalk Communications. Here is Mr. Rowe.

Giải thích chi tiết:
#### Q78 (正确答案：D)
**问题：** Who does Sam credit his success to? (萨姆把自己的成功归功于谁？)
- (A) Mr. Smith. (史密斯先生。)
- (B) One of the investors. (一位投资者。)
- (C) The company CEO. (公司的首席执行官。)
- (D) His father. (他的父亲。)

', 'That was Mr. Smith with his insightful information about the types of investments out on the market today. Now, it is my pleasure to introduce the next speaker of the day, Mr. Sam Rowe. Mr. Rowe, who has been at the center of attention in the business world lately as the youngest person ever to become the Chief Executive Officer at Livetalk Communications, (77) credits the teachings of his father, Mark Rowe, for success. (78) According to Mr. Rowe, the work ethics and positive attitude displayed by his father during his childhood set the standards for the way he works today. He stresses the importance of our everyday attitude toward work and will give us some tips on how to make them become part of us. (79) Anyway, at the age of 35, he is the youngest person ever to hold the head position at Livetalk Communications. Here is Mr. Rowe.');

  -- Question #79 (toeic_part_4)
  SELECT id INTO v_question_id FROM assessment_questions WHERE assessment_id = v_assessment_id AND position = 79;
  IF v_question_id IS NULL THEN
    INSERT INTO assessment_questions (assessment_id, skill, category, difficulty, level, question_type, prompt, context_text, audio_url, options, position, weight)
    VALUES (v_assessment_id, 'listening', 'toeic_part_4', 2, 'b1', 'multiple_choice', 'What will Mr. Rowe talk about?', 'Talk Context (Questions 77 - 79)', '/audio/toeic/real_exam/toeic_p4_q77_79.mp3', '[{"id":"A","text":"How to get in on the good investments."},{"id":"B","text":"How to make good business contacts."},{"id":"C","text":"How to climb up the corporate ladder."},{"id":"D","text":"How to become optimistic about work."}]'::jsonb, 79, 1.0)
    RETURNING id INTO v_question_id;
  ELSE
    UPDATE assessment_questions SET
      skill = 'listening',
      category = 'toeic_part_4',
      difficulty = 2,
      level = 'b1',
      prompt = 'What will Mr. Rowe talk about?',
      context_text = 'Talk Context (Questions 77 - 79)',
      audio_url = '/audio/toeic/real_exam/toeic_p4_q77_79.mp3',
      options = '[{"id":"A","text":"How to get in on the good investments."},{"id":"B","text":"How to make good business contacts."},{"id":"C","text":"How to climb up the corporate ladder."},{"id":"D","text":"How to become optimistic about work."}]'::jsonb
    WHERE id = v_question_id;
  END IF;

  -- Answer for #79
  DELETE FROM assessment_question_answers WHERE question_id = v_question_id;
  INSERT INTO assessment_question_answers (question_id, correct_option_id, explanation, transcript_text)
  VALUES (v_question_id, 'D', 'Đáp án đúng: D.

Bài nói:
That was Mr. Smith with his insightful information about the types of investments out on the market today. Now, it is my pleasure to introduce the next speaker of the day, Mr. Sam Rowe. Mr. Rowe, who has been at the center of attention in the business world lately as the youngest person ever to become the Chief Executive Officer at Livetalk Communications, (77) credits the teachings of his father, Mark Rowe, for success. (78) According to Mr. Rowe, the work ethics and positive attitude displayed by his father during his childhood set the standards for the way he works today. He stresses the importance of our everyday attitude toward work and will give us some tips on how to make them become part of us. (79) Anyway, at the age of 35, he is the youngest person ever to hold the head position at Livetalk Communications. Here is Mr. Rowe.

Giải thích chi tiết:
#### Q79 (正确答案：D)
**问题：** What will Mr. Rowe talk about? (罗先生会讲到什么内容？)
- (A) How to get in on the good investments. (如何参与赚钱的投资。)
- (B) How to make good business contacts. (如何建立良好的业务关系。)
- (C) How to climb up the corporate ladder. (如何在公司里步步高升。)
- (D) How to become optimistic about work. (如何对工作保持乐观的心态。)

**延伸表达与补充：**
- **center of attention = center of focus = main issue** (关注的焦点)
  - *例句：The firing', 'That was Mr. Smith with his insightful information about the types of investments out on the market today. Now, it is my pleasure to introduce the next speaker of the day, Mr. Sam Rowe. Mr. Rowe, who has been at the center of attention in the business world lately as the youngest person ever to become the Chief Executive Officer at Livetalk Communications, (77) credits the teachings of his father, Mark Rowe, for success. (78) According to Mr. Rowe, the work ethics and positive attitude displayed by his father during his childhood set the standards for the way he works today. He stresses the importance of our everyday attitude toward work and will give us some tips on how to make them become part of us. (79) Anyway, at the age of 35, he is the youngest person ever to hold the head position at Livetalk Communications. Here is Mr. Rowe.');

  -- Question #80 (toeic_part_4)
  SELECT id INTO v_question_id FROM assessment_questions WHERE assessment_id = v_assessment_id AND position = 80;
  IF v_question_id IS NULL THEN
    INSERT INTO assessment_questions (assessment_id, skill, category, difficulty, level, question_type, prompt, context_text, audio_url, options, position, weight)
    VALUES (v_assessment_id, 'listening', 'toeic_part_4', 2, 'b1', 'multiple_choice', 'What is the purpose of the speech?', 'Talk Context (Questions 80 - 82)', '/audio/toeic/real_exam/toeic_p4_q80_82.mp3', '[{"id":"A","text":"To invite people to a charitable function."},{"id":"B","text":"To introduce the next speaker."},{"id":"C","text":"To give thanks for the donations."},{"id":"D","text":"To announce an upcoming event."}]'::jsonb, 80, 1.0)
    RETURNING id INTO v_question_id;
  ELSE
    UPDATE assessment_questions SET
      skill = 'listening',
      category = 'toeic_part_4',
      difficulty = 2,
      level = 'b1',
      prompt = 'What is the purpose of the speech?',
      context_text = 'Talk Context (Questions 80 - 82)',
      audio_url = '/audio/toeic/real_exam/toeic_p4_q80_82.mp3',
      options = '[{"id":"A","text":"To invite people to a charitable function."},{"id":"B","text":"To introduce the next speaker."},{"id":"C","text":"To give thanks for the donations."},{"id":"D","text":"To announce an upcoming event."}]'::jsonb
    WHERE id = v_question_id;
  END IF;

  -- Answer for #80
  DELETE FROM assessment_question_answers WHERE question_id = v_question_id;
  INSERT INTO assessment_question_answers (question_id, correct_option_id, explanation, transcript_text)
  VALUES (v_question_id, 'B', 'Đáp án đúng: B.

Bài nói:
I''d like to thank the concerned citizens of Barrie County for coming to today''s environmental committee meeting. Like you, all council members here, including myself, take environmental safety seriously, which is why we have taken the time to arrange this public meeting and have also invited Gus Gieane, from the Ministry of Health, to our meeting to answer any questions or to discuss further any concerns you may have. （ 80, 81 ） Gus, the Director of Public Environmental Health and Safety at the Ministry, has brought with him today a list of things people can do to lower the levels of risk of public environmental health. (82) In recent times, the Ministry of Health has seen the status of the environment deteriorate, which in turn has had an adverse health affect on the citizens of Barrie County. The item that is on the top of Gus''s list is toxic sprays. (82) More and more, people are using toxic sprays to paint their cars and homes. However, after the toxic spray cans are used, they are irresponsibly tossed into the garbage without undergoing separate detoxification measures before they are thrown out. Mr. Gieane will now tell us more in detail about what we can do to help the environment.

Giải thích chi tiết:
#### Q80 (正确答案：B)
**问题：** What is the purpose of the speech? (这个讲话的目的何在？)
- (A) To invite people to a charitable function. (邀请人们参加一个慈善活动。)
- (B) To introduce the next speaker. (介绍下一位演讲者。)
- (C) To give thanks for the donations. (感谢捐赠行动。)
- (D) To announce an upcoming event. (宣布一个即将举行的活动。)

', 'I''d like to thank the concerned citizens of Barrie County for coming to today''s environmental committee meeting. Like you, all council members here, including myself, take environmental safety seriously, which is why we have taken the time to arrange this public meeting and have also invited Gus Gieane, from the Ministry of Health, to our meeting to answer any questions or to discuss further any concerns you may have. （ 80, 81 ） Gus, the Director of Public Environmental Health and Safety at the Ministry, has brought with him today a list of things people can do to lower the levels of risk of public environmental health. (82) In recent times, the Ministry of Health has seen the status of the environment deteriorate, which in turn has had an adverse health affect on the citizens of Barrie County. The item that is on the top of Gus''s list is toxic sprays. (82) More and more, people are using toxic sprays to paint their cars and homes. However, after the toxic spray cans are used, they are irresponsibly tossed into the garbage without undergoing separate detoxification measures before they are thrown out. Mr. Gieane will now tell us more in detail about what we can do to help the environment.');

  -- Question #81 (toeic_part_4)
  SELECT id INTO v_question_id FROM assessment_questions WHERE assessment_id = v_assessment_id AND position = 81;
  IF v_question_id IS NULL THEN
    INSERT INTO assessment_questions (assessment_id, skill, category, difficulty, level, question_type, prompt, context_text, audio_url, options, position, weight)
    VALUES (v_assessment_id, 'listening', 'toeic_part_4', 2, 'b1', 'multiple_choice', 'Who is Mr. Gieane?', 'Talk Context (Questions 80 - 82)', '/audio/toeic/real_exam/toeic_p4_q80_82.mp3', '[{"id":"A","text":"A Barrie County resident."},{"id":"B","text":"The mayor of Barrie County."},{"id":"C","text":"A government worker."},{"id":"D","text":"The president of a paint company."}]'::jsonb, 81, 1.0)
    RETURNING id INTO v_question_id;
  ELSE
    UPDATE assessment_questions SET
      skill = 'listening',
      category = 'toeic_part_4',
      difficulty = 2,
      level = 'b1',
      prompt = 'Who is Mr. Gieane?',
      context_text = 'Talk Context (Questions 80 - 82)',
      audio_url = '/audio/toeic/real_exam/toeic_p4_q80_82.mp3',
      options = '[{"id":"A","text":"A Barrie County resident."},{"id":"B","text":"The mayor of Barrie County."},{"id":"C","text":"A government worker."},{"id":"D","text":"The president of a paint company."}]'::jsonb
    WHERE id = v_question_id;
  END IF;

  -- Answer for #81
  DELETE FROM assessment_question_answers WHERE question_id = v_question_id;
  INSERT INTO assessment_question_answers (question_id, correct_option_id, explanation, transcript_text)
  VALUES (v_question_id, 'C', 'Đáp án đúng: C.

Bài nói:
I''d like to thank the concerned citizens of Barrie County for coming to today''s environmental committee meeting. Like you, all council members here, including myself, take environmental safety seriously, which is why we have taken the time to arrange this public meeting and have also invited Gus Gieane, from the Ministry of Health, to our meeting to answer any questions or to discuss further any concerns you may have. （ 80, 81 ） Gus, the Director of Public Environmental Health and Safety at the Ministry, has brought with him today a list of things people can do to lower the levels of risk of public environmental health. (82) In recent times, the Ministry of Health has seen the status of the environment deteriorate, which in turn has had an adverse health affect on the citizens of Barrie County. The item that is on the top of Gus''s list is toxic sprays. (82) More and more, people are using toxic sprays to paint their cars and homes. However, after the toxic spray cans are used, they are irresponsibly tossed into the garbage without undergoing separate detoxification measures before they are thrown out. Mr. Gieane will now tell us more in detail about what we can do to help the environment.

Giải thích chi tiết:
#### Q81 (正确答案：C)
**问题：** Who is Mr. Gieane? (基尼先生是谁？)
- (A) A Barrie County resident. (巴里县的一位居民。)
- (B) The mayor of Barrie County. (巴里县县长。)
- (C) A government worker. (一位政府工作人员。)
- (D) The president of a paint company. (涂料公司的总裁。)

', 'I''d like to thank the concerned citizens of Barrie County for coming to today''s environmental committee meeting. Like you, all council members here, including myself, take environmental safety seriously, which is why we have taken the time to arrange this public meeting and have also invited Gus Gieane, from the Ministry of Health, to our meeting to answer any questions or to discuss further any concerns you may have. （ 80, 81 ） Gus, the Director of Public Environmental Health and Safety at the Ministry, has brought with him today a list of things people can do to lower the levels of risk of public environmental health. (82) In recent times, the Ministry of Health has seen the status of the environment deteriorate, which in turn has had an adverse health affect on the citizens of Barrie County. The item that is on the top of Gus''s list is toxic sprays. (82) More and more, people are using toxic sprays to paint their cars and homes. However, after the toxic spray cans are used, they are irresponsibly tossed into the garbage without undergoing separate detoxification measures before they are thrown out. Mr. Gieane will now tell us more in detail about what we can do to help the environment.');

  -- Question #82 (toeic_part_4)
  SELECT id INTO v_question_id FROM assessment_questions WHERE assessment_id = v_assessment_id AND position = 82;
  IF v_question_id IS NULL THEN
    INSERT INTO assessment_questions (assessment_id, skill, category, difficulty, level, question_type, prompt, context_text, audio_url, options, position, weight)
    VALUES (v_assessment_id, 'listening', 'toeic_part_4', 2, 'b1', 'multiple_choice', 'What does the speaker imply when he says,“The item that is on the top of Gus''s list is toxic sprays”?', 'Talk Context (Questions 80 - 82)', '/audio/toeic/real_exam/toeic_p4_q80_82.mp3', '[{"id":"A","text":"According to Gus''s report, toxic sprays are most harmful to the environment."},{"id":"B","text":"According to Gus''s report, secondhand smoke is most harmful to the environment."},{"id":"C","text":"According to Gus''s report, gas fumes are most harmful to the environment."},{"id":"D","text":"According to Gus''s report, toxic chemicals are most harmful to the environment."}]'::jsonb, 82, 1.0)
    RETURNING id INTO v_question_id;
  ELSE
    UPDATE assessment_questions SET
      skill = 'listening',
      category = 'toeic_part_4',
      difficulty = 2,
      level = 'b1',
      prompt = 'What does the speaker imply when he says,“The item that is on the top of Gus''s list is toxic sprays”?',
      context_text = 'Talk Context (Questions 80 - 82)',
      audio_url = '/audio/toeic/real_exam/toeic_p4_q80_82.mp3',
      options = '[{"id":"A","text":"According to Gus''s report, toxic sprays are most harmful to the environment."},{"id":"B","text":"According to Gus''s report, secondhand smoke is most harmful to the environment."},{"id":"C","text":"According to Gus''s report, gas fumes are most harmful to the environment."},{"id":"D","text":"According to Gus''s report, toxic chemicals are most harmful to the environment."}]'::jsonb
    WHERE id = v_question_id;
  END IF;

  -- Answer for #82
  DELETE FROM assessment_question_answers WHERE question_id = v_question_id;
  INSERT INTO assessment_question_answers (question_id, correct_option_id, explanation, transcript_text)
  VALUES (v_question_id, 'A', 'Đáp án đúng: A.

Bài nói:
I''d like to thank the concerned citizens of Barrie County for coming to today''s environmental committee meeting. Like you, all council members here, including myself, take environmental safety seriously, which is why we have taken the time to arrange this public meeting and have also invited Gus Gieane, from the Ministry of Health, to our meeting to answer any questions or to discuss further any concerns you may have. （ 80, 81 ） Gus, the Director of Public Environmental Health and Safety at the Ministry, has brought with him today a list of things people can do to lower the levels of risk of public environmental health. (82) In recent times, the Ministry of Health has seen the status of the environment deteriorate, which in turn has had an adverse health affect on the citizens of Barrie County. The item that is on the top of Gus''s list is toxic sprays. (82) More and more, people are using toxic sprays to paint their cars and homes. However, after the toxic spray cans are used, they are irresponsibly tossed into the garbage without undergoing separate detoxification measures before they are thrown out. Mr. Gieane will now tell us more in detail about what we can do to help the environment.

Giải thích chi tiết:
#### Q82 (正确答案：A)
**问题：** What does the speaker imply when he says,“The item that is on the top of Gus''s list is toxic sprays”? (讲话者说 “ 在清单上排第一位的是有毒喷雾 ” ，他在暗示什么？)
- (A) According to Gus''s report, toxic sprays are most harmful to the environment. (根据格斯的报告，有毒喷雾对环境最有害。)
- (B) According to Gus''s report, secondhand smoke is most harmful to the environment. (根据格斯的报告，二手烟对环境最有害。)
- (C) According to Gus''s ', 'I''d like to thank the concerned citizens of Barrie County for coming to today''s environmental committee meeting. Like you, all council members here, including myself, take environmental safety seriously, which is why we have taken the time to arrange this public meeting and have also invited Gus Gieane, from the Ministry of Health, to our meeting to answer any questions or to discuss further any concerns you may have. （ 80, 81 ） Gus, the Director of Public Environmental Health and Safety at the Ministry, has brought with him today a list of things people can do to lower the levels of risk of public environmental health. (82) In recent times, the Ministry of Health has seen the status of the environment deteriorate, which in turn has had an adverse health affect on the citizens of Barrie County. The item that is on the top of Gus''s list is toxic sprays. (82) More and more, people are using toxic sprays to paint their cars and homes. However, after the toxic spray cans are used, they are irresponsibly tossed into the garbage without undergoing separate detoxification measures before they are thrown out. Mr. Gieane will now tell us more in detail about what we can do to help the environment.');

  -- Question #83 (toeic_part_4)
  SELECT id INTO v_question_id FROM assessment_questions WHERE assessment_id = v_assessment_id AND position = 83;
  IF v_question_id IS NULL THEN
    INSERT INTO assessment_questions (assessment_id, skill, category, difficulty, level, question_type, prompt, context_text, audio_url, options, position, weight)
    VALUES (v_assessment_id, 'listening', 'toeic_part_4', 2, 'b1', 'multiple_choice', 'What is the purpose of the announcement?', 'Talk Context (Questions 83 - 85)', '/audio/toeic/real_exam/toeic_p4_q83_85.mp3', '[{"id":"A","text":"To invite staff members to a company event."},{"id":"B","text":"To call for an emergency meeting."},{"id":"C","text":"To notify employees of future repair work on the elevator."},{"id":"D","text":"To guide the listeners to safety."}]'::jsonb, 83, 1.0)
    RETURNING id INTO v_question_id;
  ELSE
    UPDATE assessment_questions SET
      skill = 'listening',
      category = 'toeic_part_4',
      difficulty = 2,
      level = 'b1',
      prompt = 'What is the purpose of the announcement?',
      context_text = 'Talk Context (Questions 83 - 85)',
      audio_url = '/audio/toeic/real_exam/toeic_p4_q83_85.mp3',
      options = '[{"id":"A","text":"To invite staff members to a company event."},{"id":"B","text":"To call for an emergency meeting."},{"id":"C","text":"To notify employees of future repair work on the elevator."},{"id":"D","text":"To guide the listeners to safety."}]'::jsonb
    WHERE id = v_question_id;
  END IF;

  -- Answer for #83
  DELETE FROM assessment_question_answers WHERE question_id = v_question_id;
  INSERT INTO assessment_question_answers (question_id, correct_option_id, explanation, transcript_text)
  VALUES (v_question_id, 'D', 'Đáp án đúng: D.

Bài nói:
Could I have your attention everyone? An emergency situation has occurred on the tenth floor, and I ask everyone at this time to leave what you are doing and proceed toward the nearest exit out of the building. (83) This situation does not pose any immediate danger, but as a safety precaution, we are asking everyone to evacuate the building. So, please do not panic, but walk calmly to the nearest staircase out of the building. (84) Please do not take the elevators. Now, once you are outside, please make sure all the members of your department have arrived safely. If by any chance anyone is missing, please report the missing person to your immediate supervisors. (85) Thank you, and we will let you know the progress of the situation as it occurs.

Giải thích chi tiết:
#### Q83 (正确答案：D)
**问题：** What is the purpose of the announcement? (这个通知的目的是什么？)
- (A) To invite staff members to a company event. (邀请员工参加一个公司活动。)
- (B) To call for an emergency meeting. (召集一个紧急会议。)
- (C) To notify employees of future repair work on the elevator. (通知员工未来的电梯维修工作。)
- (D) To guide the listeners to safety. (引导听众抵达安全地带。)

', 'Could I have your attention everyone? An emergency situation has occurred on the tenth floor, and I ask everyone at this time to leave what you are doing and proceed toward the nearest exit out of the building. (83) This situation does not pose any immediate danger, but as a safety precaution, we are asking everyone to evacuate the building. So, please do not panic, but walk calmly to the nearest staircase out of the building. (84) Please do not take the elevators. Now, once you are outside, please make sure all the members of your department have arrived safely. If by any chance anyone is missing, please report the missing person to your immediate supervisors. (85) Thank you, and we will let you know the progress of the situation as it occurs.');

  -- Question #84 (toeic_part_4)
  SELECT id INTO v_question_id FROM assessment_questions WHERE assessment_id = v_assessment_id AND position = 84;
  IF v_question_id IS NULL THEN
    INSERT INTO assessment_questions (assessment_id, skill, category, difficulty, level, question_type, prompt, context_text, audio_url, options, position, weight)
    VALUES (v_assessment_id, 'listening', 'toeic_part_4', 2, 'b1', 'multiple_choice', 'What does the speaker ask the listeners to do?', 'Talk Context (Questions 83 - 85)', '/audio/toeic/real_exam/toeic_p4_q83_85.mp3', '[{"id":"A","text":"Immediately speak to their supervisors."},{"id":"B","text":"Take the elevator up to the tenth floor."},{"id":"C","text":"Walk patiently out of the building."},{"id":"D","text":"Read through the safety manual."}]'::jsonb, 84, 1.0)
    RETURNING id INTO v_question_id;
  ELSE
    UPDATE assessment_questions SET
      skill = 'listening',
      category = 'toeic_part_4',
      difficulty = 2,
      level = 'b1',
      prompt = 'What does the speaker ask the listeners to do?',
      context_text = 'Talk Context (Questions 83 - 85)',
      audio_url = '/audio/toeic/real_exam/toeic_p4_q83_85.mp3',
      options = '[{"id":"A","text":"Immediately speak to their supervisors."},{"id":"B","text":"Take the elevator up to the tenth floor."},{"id":"C","text":"Walk patiently out of the building."},{"id":"D","text":"Read through the safety manual."}]'::jsonb
    WHERE id = v_question_id;
  END IF;

  -- Answer for #84
  DELETE FROM assessment_question_answers WHERE question_id = v_question_id;
  INSERT INTO assessment_question_answers (question_id, correct_option_id, explanation, transcript_text)
  VALUES (v_question_id, 'C', 'Đáp án đúng: C.

Bài nói:
Could I have your attention everyone? An emergency situation has occurred on the tenth floor, and I ask everyone at this time to leave what you are doing and proceed toward the nearest exit out of the building. (83) This situation does not pose any immediate danger, but as a safety precaution, we are asking everyone to evacuate the building. So, please do not panic, but walk calmly to the nearest staircase out of the building. (84) Please do not take the elevators. Now, once you are outside, please make sure all the members of your department have arrived safely. If by any chance anyone is missing, please report the missing person to your immediate supervisors. (85) Thank you, and we will let you know the progress of the situation as it occurs.

Giải thích chi tiết:
#### Q84 (正确答案：C)
**问题：** What does the speaker ask the listeners to do? (讲话者让听众做什么？)
- (A) Immediately speak to their supervisors. (立刻和他们的主管联系。)
- (B) Take the elevator up to the tenth floor. (乘坐电梯到 10 层。)
- (C) Walk patiently out of the building. (耐心地走到楼外。)
- (D) Read through the safety manual. (读一遍安全手册。)

', 'Could I have your attention everyone? An emergency situation has occurred on the tenth floor, and I ask everyone at this time to leave what you are doing and proceed toward the nearest exit out of the building. (83) This situation does not pose any immediate danger, but as a safety precaution, we are asking everyone to evacuate the building. So, please do not panic, but walk calmly to the nearest staircase out of the building. (84) Please do not take the elevators. Now, once you are outside, please make sure all the members of your department have arrived safely. If by any chance anyone is missing, please report the missing person to your immediate supervisors. (85) Thank you, and we will let you know the progress of the situation as it occurs.');

  -- Question #85 (toeic_part_4)
  SELECT id INTO v_question_id FROM assessment_questions WHERE assessment_id = v_assessment_id AND position = 85;
  IF v_question_id IS NULL THEN
    INSERT INTO assessment_questions (assessment_id, skill, category, difficulty, level, question_type, prompt, context_text, audio_url, options, position, weight)
    VALUES (v_assessment_id, 'listening', 'toeic_part_4', 2, 'b1', 'multiple_choice', 'When should a listener talk to the boss?', 'Talk Context (Questions 83 - 85)', '/audio/toeic/real_exam/toeic_p4_q83_85.mp3', '[{"id":"A","text":"If someone is not present."},{"id":"B","text":"Right after the announcement."},{"id":"C","text":"Before the end of the day."},{"id":"D","text":"The first thing in the morning."}]'::jsonb, 85, 1.0)
    RETURNING id INTO v_question_id;
  ELSE
    UPDATE assessment_questions SET
      skill = 'listening',
      category = 'toeic_part_4',
      difficulty = 2,
      level = 'b1',
      prompt = 'When should a listener talk to the boss?',
      context_text = 'Talk Context (Questions 83 - 85)',
      audio_url = '/audio/toeic/real_exam/toeic_p4_q83_85.mp3',
      options = '[{"id":"A","text":"If someone is not present."},{"id":"B","text":"Right after the announcement."},{"id":"C","text":"Before the end of the day."},{"id":"D","text":"The first thing in the morning."}]'::jsonb
    WHERE id = v_question_id;
  END IF;

  -- Answer for #85
  DELETE FROM assessment_question_answers WHERE question_id = v_question_id;
  INSERT INTO assessment_question_answers (question_id, correct_option_id, explanation, transcript_text)
  VALUES (v_question_id, 'A', 'Đáp án đúng: A.

Bài nói:
Could I have your attention everyone? An emergency situation has occurred on the tenth floor, and I ask everyone at this time to leave what you are doing and proceed toward the nearest exit out of the building. (83) This situation does not pose any immediate danger, but as a safety precaution, we are asking everyone to evacuate the building. So, please do not panic, but walk calmly to the nearest staircase out of the building. (84) Please do not take the elevators. Now, once you are outside, please make sure all the members of your department have arrived safely. If by any chance anyone is missing, please report the missing person to your immediate supervisors. (85) Thank you, and we will let you know the progress of the situation as it occurs.

Giải thích chi tiết:
#### Q85 (正确答案：A)
**问题：** When should a listener talk to the boss? (听众在什么时候应该向领导报告？)
- (A) If someone is not present. (如果有人不在。)
- (B) Right after the announcement. (通知播放完毕后。)
- (C) Before the end of the day. (今天的工作结束之前。)
- (D) The first thing in the morning. (一大早。)

**延伸表达与补充：**
- **pose** (造成扩展表达：)
  - *例句：suggest reflect The gas leak poses an immediate threat to the people living in the apartmen', 'Could I have your attention everyone? An emergency situation has occurred on the tenth floor, and I ask everyone at this time to leave what you are doing and proceed toward the nearest exit out of the building. (83) This situation does not pose any immediate danger, but as a safety precaution, we are asking everyone to evacuate the building. So, please do not panic, but walk calmly to the nearest staircase out of the building. (84) Please do not take the elevators. Now, once you are outside, please make sure all the members of your department have arrived safely. If by any chance anyone is missing, please report the missing person to your immediate supervisors. (85) Thank you, and we will let you know the progress of the situation as it occurs.');

  -- Question #86 (toeic_part_4)
  SELECT id INTO v_question_id FROM assessment_questions WHERE assessment_id = v_assessment_id AND position = 86;
  IF v_question_id IS NULL THEN
    INSERT INTO assessment_questions (assessment_id, skill, category, difficulty, level, question_type, prompt, context_text, audio_url, options, position, weight)
    VALUES (v_assessment_id, 'listening', 'toeic_part_4', 2, 'b1', 'multiple_choice', 'What is the store celebrating?', 'Talk Context (Questions 86 - 88)', '/audio/toeic/real_exam/toeic_p4_q86_88.mp3', '[{"id":"A","text":"The opening of a new store."},{"id":"B","text":"A record year for sales."},{"id":"C","text":"The retirement of a staff member."},{"id":"D","text":"An important anniversary."}]'::jsonb, 86, 1.0)
    RETURNING id INTO v_question_id;
  ELSE
    UPDATE assessment_questions SET
      skill = 'listening',
      category = 'toeic_part_4',
      difficulty = 2,
      level = 'b1',
      prompt = 'What is the store celebrating?',
      context_text = 'Talk Context (Questions 86 - 88)',
      audio_url = '/audio/toeic/real_exam/toeic_p4_q86_88.mp3',
      options = '[{"id":"A","text":"The opening of a new store."},{"id":"B","text":"A record year for sales."},{"id":"C","text":"The retirement of a staff member."},{"id":"D","text":"An important anniversary."}]'::jsonb
    WHERE id = v_question_id;
  END IF;

  -- Answer for #86
  DELETE FROM assessment_question_answers WHERE question_id = v_question_id;
  INSERT INTO assessment_question_answers (question_id, correct_option_id, explanation, transcript_text)
  VALUES (v_question_id, 'D', 'Đáp án đúng: D.

Bài nói:
Home Furnishings is celebrating its 25th year in business with sales on all items throughout the store. (86) Starting from today lasting until Sunday, (87) we are slashing prices on carpets, beds, tables, drapes, and just about everything that you would find in your home. With up to 50% off the regular prices, you won''t want to miss this opportunity of a lifetime. So, if you are in the market for home furnishing items, don''t miss our sale of a lifetime. We''re located on 35 Main Street. We are open from 8 to 7 on weekdays and 9 to 6 on weekends. (88)

Giải thích chi tiết:
#### Q86 (正确答案：D)
**问题：** What is the store celebrating? (这家店在庆祝什么？)
- (A) The opening of a new store. (一家新店开张。)
- (B) A record year for sales. (年销售创纪录。)
- (C) The retirement of a staff member. (一位员工退休。)
- (D) An important anniversary. (一个重要的周年纪念日。)

', 'Home Furnishings is celebrating its 25th year in business with sales on all items throughout the store. (86) Starting from today lasting until Sunday, (87) we are slashing prices on carpets, beds, tables, drapes, and just about everything that you would find in your home. With up to 50% off the regular prices, you won''t want to miss this opportunity of a lifetime. So, if you are in the market for home furnishing items, don''t miss our sale of a lifetime. We''re located on 35 Main Street. We are open from 8 to 7 on weekdays and 9 to 6 on weekends. (88)');

  -- Question #87 (toeic_part_4)
  SELECT id INTO v_question_id FROM assessment_questions WHERE assessment_id = v_assessment_id AND position = 87;
  IF v_question_id IS NULL THEN
    INSERT INTO assessment_questions (assessment_id, skill, category, difficulty, level, question_type, prompt, context_text, audio_url, options, position, weight)
    VALUES (v_assessment_id, 'listening', 'toeic_part_4', 2, 'b1', 'multiple_choice', 'When does the sale begin?', 'Talk Context (Questions 86 - 88)', '/audio/toeic/real_exam/toeic_p4_q86_88.mp3', '[{"id":"A","text":"Today."},{"id":"B","text":"Friday."},{"id":"C","text":"Saturday."},{"id":"D","text":"Sunday."}]'::jsonb, 87, 1.0)
    RETURNING id INTO v_question_id;
  ELSE
    UPDATE assessment_questions SET
      skill = 'listening',
      category = 'toeic_part_4',
      difficulty = 2,
      level = 'b1',
      prompt = 'When does the sale begin?',
      context_text = 'Talk Context (Questions 86 - 88)',
      audio_url = '/audio/toeic/real_exam/toeic_p4_q86_88.mp3',
      options = '[{"id":"A","text":"Today."},{"id":"B","text":"Friday."},{"id":"C","text":"Saturday."},{"id":"D","text":"Sunday."}]'::jsonb
    WHERE id = v_question_id;
  END IF;

  -- Answer for #87
  DELETE FROM assessment_question_answers WHERE question_id = v_question_id;
  INSERT INTO assessment_question_answers (question_id, correct_option_id, explanation, transcript_text)
  VALUES (v_question_id, 'A', 'Đáp án đúng: A.

Bài nói:
Home Furnishings is celebrating its 25th year in business with sales on all items throughout the store. (86) Starting from today lasting until Sunday, (87) we are slashing prices on carpets, beds, tables, drapes, and just about everything that you would find in your home. With up to 50% off the regular prices, you won''t want to miss this opportunity of a lifetime. So, if you are in the market for home furnishing items, don''t miss our sale of a lifetime. We''re located on 35 Main Street. We are open from 8 to 7 on weekdays and 9 to 6 on weekends. (88)

Giải thích chi tiết:
#### Q87 (正确答案：A)
**问题：** When does the sale begin? (促销活动什么时候开始？)
- (A) Today. (今天。)
- (B) Friday. (周五。)
- (C) Saturday. (周六。)
- (D) Sunday. (周日。)

', 'Home Furnishings is celebrating its 25th year in business with sales on all items throughout the store. (86) Starting from today lasting until Sunday, (87) we are slashing prices on carpets, beds, tables, drapes, and just about everything that you would find in your home. With up to 50% off the regular prices, you won''t want to miss this opportunity of a lifetime. So, if you are in the market for home furnishing items, don''t miss our sale of a lifetime. We''re located on 35 Main Street. We are open from 8 to 7 on weekdays and 9 to 6 on weekends. (88)');

  -- Question #88 (toeic_part_4)
  SELECT id INTO v_question_id FROM assessment_questions WHERE assessment_id = v_assessment_id AND position = 88;
  IF v_question_id IS NULL THEN
    INSERT INTO assessment_questions (assessment_id, skill, category, difficulty, level, question_type, prompt, context_text, audio_url, options, position, weight)
    VALUES (v_assessment_id, 'listening', 'toeic_part_4', 2, 'b1', 'multiple_choice', 'When does the store open this Saturday?', 'Talk Context (Questions 86 - 88)', '/audio/toeic/real_exam/toeic_p4_q86_88.mp3', '[{"id":"A","text":"6 a.m."},{"id":"B","text":"7 a.m."},{"id":"C","text":"8 a.m."},{"id":"D","text":"9 a.m."}]'::jsonb, 88, 1.0)
    RETURNING id INTO v_question_id;
  ELSE
    UPDATE assessment_questions SET
      skill = 'listening',
      category = 'toeic_part_4',
      difficulty = 2,
      level = 'b1',
      prompt = 'When does the store open this Saturday?',
      context_text = 'Talk Context (Questions 86 - 88)',
      audio_url = '/audio/toeic/real_exam/toeic_p4_q86_88.mp3',
      options = '[{"id":"A","text":"6 a.m."},{"id":"B","text":"7 a.m."},{"id":"C","text":"8 a.m."},{"id":"D","text":"9 a.m."}]'::jsonb
    WHERE id = v_question_id;
  END IF;

  -- Answer for #88
  DELETE FROM assessment_question_answers WHERE question_id = v_question_id;
  INSERT INTO assessment_question_answers (question_id, correct_option_id, explanation, transcript_text)
  VALUES (v_question_id, 'D', 'Đáp án đúng: D.

Bài nói:
Home Furnishings is celebrating its 25th year in business with sales on all items throughout the store. (86) Starting from today lasting until Sunday, (87) we are slashing prices on carpets, beds, tables, drapes, and just about everything that you would find in your home. With up to 50% off the regular prices, you won''t want to miss this opportunity of a lifetime. So, if you are in the market for home furnishing items, don''t miss our sale of a lifetime. We''re located on 35 Main Street. We are open from 8 to 7 on weekdays and 9 to 6 on weekends. (88)

Giải thích chi tiết:
#### Q88 (正确答案：D)
**问题：** When does the store open this Saturday? (本周六商店几点开门？)
- (A) 6 a.m. (上午 6 点。)
- (B) 7 a.m. (上午 7 点。)
- (C) 8 a.m. (上午 8 点。)
- (D) 9 a.m. (上午 9 点。)

**延伸表达与补充：**
- **slash prices = cut prices = reduce prices** (降低价格)
  - *例句：The new bargain store is slashing prices on everything in the store.* (新开的折扣商店正在对店里的全部商品降价销售。)
- **if you are in the market for ~ = if you are looking f', 'Home Furnishings is celebrating its 25th year in business with sales on all items throughout the store. (86) Starting from today lasting until Sunday, (87) we are slashing prices on carpets, beds, tables, drapes, and just about everything that you would find in your home. With up to 50% off the regular prices, you won''t want to miss this opportunity of a lifetime. So, if you are in the market for home furnishing items, don''t miss our sale of a lifetime. We''re located on 35 Main Street. We are open from 8 to 7 on weekdays and 9 to 6 on weekends. (88)');

  -- Question #89 (toeic_part_4)
  SELECT id INTO v_question_id FROM assessment_questions WHERE assessment_id = v_assessment_id AND position = 89;
  IF v_question_id IS NULL THEN
    INSERT INTO assessment_questions (assessment_id, skill, category, difficulty, level, question_type, prompt, context_text, audio_url, options, position, weight)
    VALUES (v_assessment_id, 'listening', 'toeic_part_4', 2, 'b1', 'multiple_choice', 'When will the construction start?', 'Talk Context (Questions 89 - 91)', '/audio/toeic/real_exam/toeic_p4_q89_91.mp3', '[{"id":"A","text":"January 15."},{"id":"B","text":"January 25."},{"id":"C","text":"March 15."},{"id":"D","text":"March 25."}]'::jsonb, 89, 1.0)
    RETURNING id INTO v_question_id;
  ELSE
    UPDATE assessment_questions SET
      skill = 'listening',
      category = 'toeic_part_4',
      difficulty = 2,
      level = 'b1',
      prompt = 'When will the construction start?',
      context_text = 'Talk Context (Questions 89 - 91)',
      audio_url = '/audio/toeic/real_exam/toeic_p4_q89_91.mp3',
      options = '[{"id":"A","text":"January 15."},{"id":"B","text":"January 25."},{"id":"C","text":"March 15."},{"id":"D","text":"March 25."}]'::jsonb
    WHERE id = v_question_id;
  END IF;

  -- Answer for #89
  DELETE FROM assessment_question_answers WHERE question_id = v_question_id;
  INSERT INTO assessment_question_answers (question_id, correct_option_id, explanation, transcript_text)
  VALUES (v_question_id, 'B', 'Đáp án đúng: B.

Bài nói:
Attention, everyone! The parking lot on the west side of our building will be closed starting from this Friday, January 25, until March 15, due to construction. (89) Therefore, those employees who enter the building from Midland Avenue must use the south entrance from Jane Street. Also, we ask everyone to please park your cars in our underground garage (91) to allow our customers access to the parking spots on the ground floor. I know this will cause some inconvenience to our salespeople, (90) who come in and out of our building throughout the day. However, we do ask you to bear with this situation until the construction comes to its completion. Also, we''d like to make a suggestion for those employees who live near the office to leave their cars at home and take public transportation to work. One other option is to start carpooling. (91) Anyway, think about it, and if you have any great ideas, please go and speak with our receptionist Janice anytime.

Giải thích chi tiết:
#### Q89 (正确答案：B)
**问题：** When will the construction start? (施工什么时候开始？)
- (A) January 15. (1 月 15 日。)
- (B) January 25. (1 月 25 日。)
- (C) March 15. (3 月 15 日。)
- (D) March 25. (3 月 25 日。)

', 'Attention, everyone! The parking lot on the west side of our building will be closed starting from this Friday, January 25, until March 15, due to construction. (89) Therefore, those employees who enter the building from Midland Avenue must use the south entrance from Jane Street. Also, we ask everyone to please park your cars in our underground garage (91) to allow our customers access to the parking spots on the ground floor. I know this will cause some inconvenience to our salespeople, (90) who come in and out of our building throughout the day. However, we do ask you to bear with this situation until the construction comes to its completion. Also, we''d like to make a suggestion for those employees who live near the office to leave their cars at home and take public transportation to work. One other option is to start carpooling. (91) Anyway, think about it, and if you have any great ideas, please go and speak with our receptionist Janice anytime.');

  -- Question #90 (toeic_part_4)
  SELECT id INTO v_question_id FROM assessment_questions WHERE assessment_id = v_assessment_id AND position = 90;
  IF v_question_id IS NULL THEN
    INSERT INTO assessment_questions (assessment_id, skill, category, difficulty, level, question_type, prompt, context_text, audio_url, options, position, weight)
    VALUES (v_assessment_id, 'listening', 'toeic_part_4', 2, 'b1', 'multiple_choice', 'According to the speaker, who will be mostly affected by the construction?', 'Talk Context (Questions 89 - 91)', '/audio/toeic/real_exam/toeic_p4_q89_91.mp3', '[{"id":"A","text":"Sales staff."},{"id":"B","text":"Receptionists."},{"id":"C","text":"Customers."},{"id":"D","text":"Staff members without cars."}]'::jsonb, 90, 1.0)
    RETURNING id INTO v_question_id;
  ELSE
    UPDATE assessment_questions SET
      skill = 'listening',
      category = 'toeic_part_4',
      difficulty = 2,
      level = 'b1',
      prompt = 'According to the speaker, who will be mostly affected by the construction?',
      context_text = 'Talk Context (Questions 89 - 91)',
      audio_url = '/audio/toeic/real_exam/toeic_p4_q89_91.mp3',
      options = '[{"id":"A","text":"Sales staff."},{"id":"B","text":"Receptionists."},{"id":"C","text":"Customers."},{"id":"D","text":"Staff members without cars."}]'::jsonb
    WHERE id = v_question_id;
  END IF;

  -- Answer for #90
  DELETE FROM assessment_question_answers WHERE question_id = v_question_id;
  INSERT INTO assessment_question_answers (question_id, correct_option_id, explanation, transcript_text)
  VALUES (v_question_id, 'A', 'Đáp án đúng: A.

Bài nói:
Attention, everyone! The parking lot on the west side of our building will be closed starting from this Friday, January 25, until March 15, due to construction. (89) Therefore, those employees who enter the building from Midland Avenue must use the south entrance from Jane Street. Also, we ask everyone to please park your cars in our underground garage (91) to allow our customers access to the parking spots on the ground floor. I know this will cause some inconvenience to our salespeople, (90) who come in and out of our building throughout the day. However, we do ask you to bear with this situation until the construction comes to its completion. Also, we''d like to make a suggestion for those employees who live near the office to leave their cars at home and take public transportation to work. One other option is to start carpooling. (91) Anyway, think about it, and if you have any great ideas, please go and speak with our receptionist Janice anytime.

Giải thích chi tiết:
#### Q90 (正确答案：A)
**问题：** According to the speaker, who will be mostly affected by the construction? (根据讲话者的说法，谁受施工的影响最大？)
- (A) Sales staff. (销售人员。)
- (B) Receptionists. (接待员。)
- (C) Customers. (顾客。)
- (D) Staff members without cars. (没有车的员工。)

', 'Attention, everyone! The parking lot on the west side of our building will be closed starting from this Friday, January 25, until March 15, due to construction. (89) Therefore, those employees who enter the building from Midland Avenue must use the south entrance from Jane Street. Also, we ask everyone to please park your cars in our underground garage (91) to allow our customers access to the parking spots on the ground floor. I know this will cause some inconvenience to our salespeople, (90) who come in and out of our building throughout the day. However, we do ask you to bear with this situation until the construction comes to its completion. Also, we''d like to make a suggestion for those employees who live near the office to leave their cars at home and take public transportation to work. One other option is to start carpooling. (91) Anyway, think about it, and if you have any great ideas, please go and speak with our receptionist Janice anytime.');

  -- Question #91 (toeic_part_4)
  SELECT id INTO v_question_id FROM assessment_questions WHERE assessment_id = v_assessment_id AND position = 91;
  IF v_question_id IS NULL THEN
    INSERT INTO assessment_questions (assessment_id, skill, category, difficulty, level, question_type, prompt, context_text, audio_url, options, position, weight)
    VALUES (v_assessment_id, 'listening', 'toeic_part_4', 2, 'b1', 'multiple_choice', 'Which of the following is NOT mentioned by the speaker?', 'Talk Context (Questions 89 - 91)', '/audio/toeic/real_exam/toeic_p4_q89_91.mp3', '[{"id":"A","text":"All staff members should park in a specific place."},{"id":"B","text":"Some of the employees should commute by bus."},{"id":"C","text":"People who live close to the office should share a ride."},{"id":"D","text":"Sales reps should speak with the receptionist."}]'::jsonb, 91, 1.0)
    RETURNING id INTO v_question_id;
  ELSE
    UPDATE assessment_questions SET
      skill = 'listening',
      category = 'toeic_part_4',
      difficulty = 2,
      level = 'b1',
      prompt = 'Which of the following is NOT mentioned by the speaker?',
      context_text = 'Talk Context (Questions 89 - 91)',
      audio_url = '/audio/toeic/real_exam/toeic_p4_q89_91.mp3',
      options = '[{"id":"A","text":"All staff members should park in a specific place."},{"id":"B","text":"Some of the employees should commute by bus."},{"id":"C","text":"People who live close to the office should share a ride."},{"id":"D","text":"Sales reps should speak with the receptionist."}]'::jsonb
    WHERE id = v_question_id;
  END IF;

  -- Answer for #91
  DELETE FROM assessment_question_answers WHERE question_id = v_question_id;
  INSERT INTO assessment_question_answers (question_id, correct_option_id, explanation, transcript_text)
  VALUES (v_question_id, 'D', 'Đáp án đúng: D.

Bài nói:
Attention, everyone! The parking lot on the west side of our building will be closed starting from this Friday, January 25, until March 15, due to construction. (89) Therefore, those employees who enter the building from Midland Avenue must use the south entrance from Jane Street. Also, we ask everyone to please park your cars in our underground garage (91) to allow our customers access to the parking spots on the ground floor. I know this will cause some inconvenience to our salespeople, (90) who come in and out of our building throughout the day. However, we do ask you to bear with this situation until the construction comes to its completion. Also, we''d like to make a suggestion for those employees who live near the office to leave their cars at home and take public transportation to work. One other option is to start carpooling. (91) Anyway, think about it, and if you have any great ideas, please go and speak with our receptionist Janice anytime.

Giải thích chi tiết:
#### Q91 (正确答案：D)
**问题：** Which of the following is NOT mentioned by the speaker? (下面哪一项讲话者没有提到？)
- (A) All staff members should park in a specific place. (所有员工都应该把车停在一个确定的位置。)
- (B) Some of the employees should commute by bus. (一些员工应该乘公交车上班。)
- (C) People who live close to the office should share a ride. (住在公司附近的人应该拼车上班。)
- (D) Sales reps should speak with the receptionist. (销售代表应该去找接待员。)

**延伸表达', 'Attention, everyone! The parking lot on the west side of our building will be closed starting from this Friday, January 25, until March 15, due to construction. (89) Therefore, those employees who enter the building from Midland Avenue must use the south entrance from Jane Street. Also, we ask everyone to please park your cars in our underground garage (91) to allow our customers access to the parking spots on the ground floor. I know this will cause some inconvenience to our salespeople, (90) who come in and out of our building throughout the day. However, we do ask you to bear with this situation until the construction comes to its completion. Also, we''d like to make a suggestion for those employees who live near the office to leave their cars at home and take public transportation to work. One other option is to start carpooling. (91) Anyway, think about it, and if you have any great ideas, please go and speak with our receptionist Janice anytime.');

  -- Question #92 (toeic_part_4)
  SELECT id INTO v_question_id FROM assessment_questions WHERE assessment_id = v_assessment_id AND position = 92;
  IF v_question_id IS NULL THEN
    INSERT INTO assessment_questions (assessment_id, skill, category, difficulty, level, question_type, prompt, context_text, audio_url, options, position, weight)
    VALUES (v_assessment_id, 'listening', 'toeic_part_4', 2, 'b1', 'multiple_choice', 'What is causing the flight delays at Heathrow Airport?', 'Talk Context (Questions 92 - 94)', '/audio/toeic/real_exam/toeic_p4_q92_94.mp3', '[{"id":"A","text":"A flight accident."},{"id":"B","text":"The local weather."},{"id":"C","text":"A security alert."},{"id":"D","text":"The overbooking of flights."}]'::jsonb, 92, 1.0)
    RETURNING id INTO v_question_id;
  ELSE
    UPDATE assessment_questions SET
      skill = 'listening',
      category = 'toeic_part_4',
      difficulty = 2,
      level = 'b1',
      prompt = 'What is causing the flight delays at Heathrow Airport?',
      context_text = 'Talk Context (Questions 92 - 94)',
      audio_url = '/audio/toeic/real_exam/toeic_p4_q92_94.mp3',
      options = '[{"id":"A","text":"A flight accident."},{"id":"B","text":"The local weather."},{"id":"C","text":"A security alert."},{"id":"D","text":"The overbooking of flights."}]'::jsonb
    WHERE id = v_question_id;
  END IF;

  -- Answer for #92
  DELETE FROM assessment_question_answers WHERE question_id = v_question_id;
  INSERT INTO assessment_question_answers (question_id, correct_option_id, explanation, transcript_text)
  VALUES (v_question_id, 'B', 'Đáp án đúng: B.

Bài nói:
May I have your attention please? This announcement is for all passengers waiting for Flight 705, scheduled to depart for London at 2 o''clock. (93) We have just been informed by Heathrow Airport that airplanes are being suspended for traveling to and from the airport due to heavy fog passing through the region (92) and planes that are scheduled for arrival are being re-routed to other nearby airports. This, unfortunately, will also delay our flights scheduled to take off for London until further notice. In the meantime, the passengers that are affected are asked to take advantage of the refreshments we have set up in the lounge on the second floor. (94) Please show your ticket to the lounge attendant as you enter. For further announcements regarding the Heathrow situation, please check with the bulletin board display set up throughout the terminal. Thank you for your kind understanding.

Giải thích chi tiết:
#### Q92 (正确答案：B)
**问题：** What is causing the flight delays at Heathrow Airport? (希思罗机场的航班延误是什么原因？)
- (A) A flight accident. (一次飞行事故。)
- (B) The local weather. (当地的天气。)
- (C) A security alert. (一个安全警告。)
- (D) The overbooking of flights. (航班超额预订。)

', 'May I have your attention please? This announcement is for all passengers waiting for Flight 705, scheduled to depart for London at 2 o''clock. (93) We have just been informed by Heathrow Airport that airplanes are being suspended for traveling to and from the airport due to heavy fog passing through the region (92) and planes that are scheduled for arrival are being re-routed to other nearby airports. This, unfortunately, will also delay our flights scheduled to take off for London until further notice. In the meantime, the passengers that are affected are asked to take advantage of the refreshments we have set up in the lounge on the second floor. (94) Please show your ticket to the lounge attendant as you enter. For further announcements regarding the Heathrow situation, please check with the bulletin board display set up throughout the terminal. Thank you for your kind understanding.');

  -- Question #93 (toeic_part_4)
  SELECT id INTO v_question_id FROM assessment_questions WHERE assessment_id = v_assessment_id AND position = 93;
  IF v_question_id IS NULL THEN
    INSERT INTO assessment_questions (assessment_id, skill, category, difficulty, level, question_type, prompt, context_text, audio_url, options, position, weight)
    VALUES (v_assessment_id, 'listening', 'toeic_part_4', 2, 'b1', 'multiple_choice', 'When was the flight originally scheduled for take-off?', 'Talk Context (Questions 92 - 94)', '/audio/toeic/real_exam/toeic_p4_q92_94.mp3', '[{"id":"A","text":"12 o''clock."},{"id":"B","text":"2 o''clock."},{"id":"C","text":"5 o''clock."},{"id":"D","text":"7 o''clock."}]'::jsonb, 93, 1.0)
    RETURNING id INTO v_question_id;
  ELSE
    UPDATE assessment_questions SET
      skill = 'listening',
      category = 'toeic_part_4',
      difficulty = 2,
      level = 'b1',
      prompt = 'When was the flight originally scheduled for take-off?',
      context_text = 'Talk Context (Questions 92 - 94)',
      audio_url = '/audio/toeic/real_exam/toeic_p4_q92_94.mp3',
      options = '[{"id":"A","text":"12 o''clock."},{"id":"B","text":"2 o''clock."},{"id":"C","text":"5 o''clock."},{"id":"D","text":"7 o''clock."}]'::jsonb
    WHERE id = v_question_id;
  END IF;

  -- Answer for #93
  DELETE FROM assessment_question_answers WHERE question_id = v_question_id;
  INSERT INTO assessment_question_answers (question_id, correct_option_id, explanation, transcript_text)
  VALUES (v_question_id, 'B', 'Đáp án đúng: B.

Bài nói:
May I have your attention please? This announcement is for all passengers waiting for Flight 705, scheduled to depart for London at 2 o''clock. (93) We have just been informed by Heathrow Airport that airplanes are being suspended for traveling to and from the airport due to heavy fog passing through the region (92) and planes that are scheduled for arrival are being re-routed to other nearby airports. This, unfortunately, will also delay our flights scheduled to take off for London until further notice. In the meantime, the passengers that are affected are asked to take advantage of the refreshments we have set up in the lounge on the second floor. (94) Please show your ticket to the lounge attendant as you enter. For further announcements regarding the Heathrow situation, please check with the bulletin board display set up throughout the terminal. Thank you for your kind understanding.

Giải thích chi tiết:
#### Q93 (正确答案：B)
**问题：** When was the flight originally scheduled for take-off? (这个航班原定几点起飞？)
- (A) 12 o''clock. (12 点。)
- (B) 2 o''clock. (2 点。)
- (C) 5 o''clock. (5 点。)
- (D) 7 o''clock. (7 点。)

', 'May I have your attention please? This announcement is for all passengers waiting for Flight 705, scheduled to depart for London at 2 o''clock. (93) We have just been informed by Heathrow Airport that airplanes are being suspended for traveling to and from the airport due to heavy fog passing through the region (92) and planes that are scheduled for arrival are being re-routed to other nearby airports. This, unfortunately, will also delay our flights scheduled to take off for London until further notice. In the meantime, the passengers that are affected are asked to take advantage of the refreshments we have set up in the lounge on the second floor. (94) Please show your ticket to the lounge attendant as you enter. For further announcements regarding the Heathrow situation, please check with the bulletin board display set up throughout the terminal. Thank you for your kind understanding.');

  -- Question #94 (toeic_part_4)
  SELECT id INTO v_question_id FROM assessment_questions WHERE assessment_id = v_assessment_id AND position = 94;
  IF v_question_id IS NULL THEN
    INSERT INTO assessment_questions (assessment_id, skill, category, difficulty, level, question_type, prompt, context_text, audio_url, options, position, weight)
    VALUES (v_assessment_id, 'listening', 'toeic_part_4', 2, 'b1', 'multiple_choice', 'What is being offered to the passengers at the second floor lounge?', 'Talk Context (Questions 92 - 94)', '/audio/toeic/real_exam/toeic_p4_q92_94.mp3', '[{"id":"A","text":"A meal."},{"id":"B","text":"Accommodations."},{"id":"C","text":"Snacks and drinks."},{"id":"D","text":"Flight tickets."}]'::jsonb, 94, 1.0)
    RETURNING id INTO v_question_id;
  ELSE
    UPDATE assessment_questions SET
      skill = 'listening',
      category = 'toeic_part_4',
      difficulty = 2,
      level = 'b1',
      prompt = 'What is being offered to the passengers at the second floor lounge?',
      context_text = 'Talk Context (Questions 92 - 94)',
      audio_url = '/audio/toeic/real_exam/toeic_p4_q92_94.mp3',
      options = '[{"id":"A","text":"A meal."},{"id":"B","text":"Accommodations."},{"id":"C","text":"Snacks and drinks."},{"id":"D","text":"Flight tickets."}]'::jsonb
    WHERE id = v_question_id;
  END IF;

  -- Answer for #94
  DELETE FROM assessment_question_answers WHERE question_id = v_question_id;
  INSERT INTO assessment_question_answers (question_id, correct_option_id, explanation, transcript_text)
  VALUES (v_question_id, 'C', 'Đáp án đúng: C.

Bài nói:
May I have your attention please? This announcement is for all passengers waiting for Flight 705, scheduled to depart for London at 2 o''clock. (93) We have just been informed by Heathrow Airport that airplanes are being suspended for traveling to and from the airport due to heavy fog passing through the region (92) and planes that are scheduled for arrival are being re-routed to other nearby airports. This, unfortunately, will also delay our flights scheduled to take off for London until further notice. In the meantime, the passengers that are affected are asked to take advantage of the refreshments we have set up in the lounge on the second floor. (94) Please show your ticket to the lounge attendant as you enter. For further announcements regarding the Heathrow situation, please check with the bulletin board display set up throughout the terminal. Thank you for your kind understanding.

Giải thích chi tiết:
#### Q94 (正确答案：C)
**问题：** What is being offered to the passengers at the second floor lounge? (二楼休息室向乘客供应什么？)
- (A) A meal. (一顿饭。)
- (B) Accommodations. (住宿。)
- (C) Snacks and drinks. (点心和饮料。)
- (D) Flight tickets. (机票。)

**延伸表达与补充：**
- **We have just been informed ~ = We have just been told ~ = We have just heard the news ~** (我们刚刚接到通知，…)
  - *例句：I have just been informed of the good news.* (我刚刚接', 'May I have your attention please? This announcement is for all passengers waiting for Flight 705, scheduled to depart for London at 2 o''clock. (93) We have just been informed by Heathrow Airport that airplanes are being suspended for traveling to and from the airport due to heavy fog passing through the region (92) and planes that are scheduled for arrival are being re-routed to other nearby airports. This, unfortunately, will also delay our flights scheduled to take off for London until further notice. In the meantime, the passengers that are affected are asked to take advantage of the refreshments we have set up in the lounge on the second floor. (94) Please show your ticket to the lounge attendant as you enter. For further announcements regarding the Heathrow situation, please check with the bulletin board display set up throughout the terminal. Thank you for your kind understanding.');

  -- Question #95 (toeic_part_4)
  SELECT id INTO v_question_id FROM assessment_questions WHERE assessment_id = v_assessment_id AND position = 95;
  IF v_question_id IS NULL THEN
    INSERT INTO assessment_questions (assessment_id, skill, category, difficulty, level, question_type, prompt, context_text, audio_url, options, position, weight)
    VALUES (v_assessment_id, 'listening', 'toeic_part_4', 2, 'b1', 'multiple_choice', 'Why was the Brandywine Café closed?', 'Talk Context (Questions 95 - 97)', '/audio/toeic/real_exam/toeic_p4_q95_97.mp3', '[{"id":"A","text":"It failed a safety inspection."},{"id":"B","text":"The owner was on vacation."},{"id":"C","text":"It was being renovated."},{"id":"D","text":"The building was damaged by a storm."}]'::jsonb, 95, 1.0)
    RETURNING id INTO v_question_id;
  ELSE
    UPDATE assessment_questions SET
      skill = 'listening',
      category = 'toeic_part_4',
      difficulty = 2,
      level = 'b1',
      prompt = 'Why was the Brandywine Café closed?',
      context_text = 'Talk Context (Questions 95 - 97)',
      audio_url = '/audio/toeic/real_exam/toeic_p4_q95_97.mp3',
      options = '[{"id":"A","text":"It failed a safety inspection."},{"id":"B","text":"The owner was on vacation."},{"id":"C","text":"It was being renovated."},{"id":"D","text":"The building was damaged by a storm."}]'::jsonb
    WHERE id = v_question_id;
  END IF;

  -- Answer for #95
  DELETE FROM assessment_question_answers WHERE question_id = v_question_id;
  INSERT INTO assessment_question_answers (question_id, correct_option_id, explanation, transcript_text)
  VALUES (v_question_id, 'C', 'Đáp án đúng: C.

Bài nói:
The Brandywine Café is pleased to announce that the renovations on the building are complete, so we''ll be reopening for business this Saturday. (95) All weekend long, if you buy any type of beverage, you''ll get a free snack of your choice. So come to the corner of Madison Road and Lancaster Street and check out the new and improved Brandywine Café. We''ve even added fruit drinks to our menu since summer is rapidly approaching. Cool off by ordering a strawberry smoothie or other similar drink. (96) You can enjoy your drink at a table on the outdoor patio we added on the second floor. (97) Our hours are from 8 a.m. to 10 p.m. every day.

Giải thích chi tiết:
#### Q95 (正确答案：C)
**问题：** Why was the Brandywine Café closed? (白兰地咖啡店为什么歇业？)
- (A) It failed a safety inspection. (它未通过安全检查。)
- (B) The owner was on vacation. (店主去度假了。)
- (C) It was being renovated. (它进行了整修。)
- (D) The building was damaged by a storm. (它所在的建筑被暴风雨摧毁了。)

', 'The Brandywine Café is pleased to announce that the renovations on the building are complete, so we''ll be reopening for business this Saturday. (95) All weekend long, if you buy any type of beverage, you''ll get a free snack of your choice. So come to the corner of Madison Road and Lancaster Street and check out the new and improved Brandywine Café. We''ve even added fruit drinks to our menu since summer is rapidly approaching. Cool off by ordering a strawberry smoothie or other similar drink. (96) You can enjoy your drink at a table on the outdoor patio we added on the second floor. (97) Our hours are from 8 a.m. to 10 p.m. every day.');

  -- Question #96 (toeic_part_4)
  SELECT id INTO v_question_id FROM assessment_questions WHERE assessment_id = v_assessment_id AND position = 96;
  IF v_question_id IS NULL THEN
    INSERT INTO assessment_questions (assessment_id, skill, category, difficulty, level, question_type, prompt, context_text, audio_url, options, position, weight)
    VALUES (v_assessment_id, 'listening', 'toeic_part_4', 2, 'b1', 'multiple_choice', 'Look at the graphic. What is the price of the newest item on the menu?', 'Talk Context (Questions 95 - 97)', '/audio/toeic/real_exam/toeic_p4_q95_97.mp3', '[{"id":"A","text":"$3.50."},{"id":"B","text":"$4.00."},{"id":"C","text":"$4.50."},{"id":"D","text":"$5.00."}]'::jsonb, 96, 1.0)
    RETURNING id INTO v_question_id;
  ELSE
    UPDATE assessment_questions SET
      skill = 'listening',
      category = 'toeic_part_4',
      difficulty = 2,
      level = 'b1',
      prompt = 'Look at the graphic. What is the price of the newest item on the menu?',
      context_text = 'Talk Context (Questions 95 - 97)',
      audio_url = '/audio/toeic/real_exam/toeic_p4_q95_97.mp3',
      options = '[{"id":"A","text":"$3.50."},{"id":"B","text":"$4.00."},{"id":"C","text":"$4.50."},{"id":"D","text":"$5.00."}]'::jsonb
    WHERE id = v_question_id;
  END IF;

  -- Answer for #96
  DELETE FROM assessment_question_answers WHERE question_id = v_question_id;
  INSERT INTO assessment_question_answers (question_id, correct_option_id, explanation, transcript_text)
  VALUES (v_question_id, 'D', 'Đáp án đúng: D.

Bài nói:
The Brandywine Café is pleased to announce that the renovations on the building are complete, so we''ll be reopening for business this Saturday. (95) All weekend long, if you buy any type of beverage, you''ll get a free snack of your choice. So come to the corner of Madison Road and Lancaster Street and check out the new and improved Brandywine Café. We''ve even added fruit drinks to our menu since summer is rapidly approaching. Cool off by ordering a strawberry smoothie or other similar drink. (96) You can enjoy your drink at a table on the outdoor patio we added on the second floor. (97) Our hours are from 8 a.m. to 10 p.m. every day.

Giải thích chi tiết:
#### Q96 (正确答案：D)
**问题：** Look at the graphic. What is the price of the newest item on the menu? (请看图表。菜单上的最新产品是什么价格？)
- (A) $3.50. (3.50 美元。)
- (B) $4.00. (4.00 美元。)
- (C) $4.50. (4.50 美元。)
- (D) $5.00. (5.00 美元。)

', 'The Brandywine Café is pleased to announce that the renovations on the building are complete, so we''ll be reopening for business this Saturday. (95) All weekend long, if you buy any type of beverage, you''ll get a free snack of your choice. So come to the corner of Madison Road and Lancaster Street and check out the new and improved Brandywine Café. We''ve even added fruit drinks to our menu since summer is rapidly approaching. Cool off by ordering a strawberry smoothie or other similar drink. (96) You can enjoy your drink at a table on the outdoor patio we added on the second floor. (97) Our hours are from 8 a.m. to 10 p.m. every day.');

  -- Question #97 (toeic_part_4)
  SELECT id INTO v_question_id FROM assessment_questions WHERE assessment_id = v_assessment_id AND position = 97;
  IF v_question_id IS NULL THEN
    INSERT INTO assessment_questions (assessment_id, skill, category, difficulty, level, question_type, prompt, context_text, audio_url, options, position, weight)
    VALUES (v_assessment_id, 'listening', 'toeic_part_4', 2, 'b1', 'multiple_choice', 'What feature on the second floor is mentioned?', 'Talk Context (Questions 95 - 97)', '/audio/toeic/real_exam/toeic_p4_q95_97.mp3', '[{"id":"A","text":"Free computer terminals."},{"id":"B","text":"Outdoor seating."},{"id":"C","text":"A large-screen television."},{"id":"D","text":"More comfortable chairs."}]'::jsonb, 97, 1.0)
    RETURNING id INTO v_question_id;
  ELSE
    UPDATE assessment_questions SET
      skill = 'listening',
      category = 'toeic_part_4',
      difficulty = 2,
      level = 'b1',
      prompt = 'What feature on the second floor is mentioned?',
      context_text = 'Talk Context (Questions 95 - 97)',
      audio_url = '/audio/toeic/real_exam/toeic_p4_q95_97.mp3',
      options = '[{"id":"A","text":"Free computer terminals."},{"id":"B","text":"Outdoor seating."},{"id":"C","text":"A large-screen television."},{"id":"D","text":"More comfortable chairs."}]'::jsonb
    WHERE id = v_question_id;
  END IF;

  -- Answer for #97
  DELETE FROM assessment_question_answers WHERE question_id = v_question_id;
  INSERT INTO assessment_question_answers (question_id, correct_option_id, explanation, transcript_text)
  VALUES (v_question_id, 'B', 'Đáp án đúng: B.

Bài nói:
The Brandywine Café is pleased to announce that the renovations on the building are complete, so we''ll be reopening for business this Saturday. (95) All weekend long, if you buy any type of beverage, you''ll get a free snack of your choice. So come to the corner of Madison Road and Lancaster Street and check out the new and improved Brandywine Café. We''ve even added fruit drinks to our menu since summer is rapidly approaching. Cool off by ordering a strawberry smoothie or other similar drink. (96) You can enjoy your drink at a table on the outdoor patio we added on the second floor. (97) Our hours are from 8 a.m. to 10 p.m. every day.

Giải thích chi tiết:
#### Q97 (正确答案：B)
**问题：** What feature on the second floor is mentioned? (讲话中提及了二层的什么特征？)
- (A) Free computer terminals. (免费的电脑终端设备。)
- (B) Outdoor seating. (露天座位。)
- (C) A large-screen television. (一台大屏电视机。)
- (D) More comfortable chairs. (更加舒适的座椅。)

**延伸表达与补充：**
- **be pleased to~ = be happy to~** (乐于做/很高兴做…)
  - *例句：He is pleased to announce that he graduated from university.* (他很高兴地宣布自己大学毕业了。)', 'The Brandywine Café is pleased to announce that the renovations on the building are complete, so we''ll be reopening for business this Saturday. (95) All weekend long, if you buy any type of beverage, you''ll get a free snack of your choice. So come to the corner of Madison Road and Lancaster Street and check out the new and improved Brandywine Café. We''ve even added fruit drinks to our menu since summer is rapidly approaching. Cool off by ordering a strawberry smoothie or other similar drink. (96) You can enjoy your drink at a table on the outdoor patio we added on the second floor. (97) Our hours are from 8 a.m. to 10 p.m. every day.');

  -- Question #98 (toeic_part_4)
  SELECT id INTO v_question_id FROM assessment_questions WHERE assessment_id = v_assessment_id AND position = 98;
  IF v_question_id IS NULL THEN
    INSERT INTO assessment_questions (assessment_id, skill, category, difficulty, level, question_type, prompt, context_text, audio_url, options, position, weight)
    VALUES (v_assessment_id, 'listening', 'toeic_part_4', 2, 'b1', 'multiple_choice', 'What did the speaker''s company recently do?', 'Talk Context (Questions 98 - 100)', '/audio/toeic/real_exam/toeic_p4_q98_100.mp3', '[{"id":"A","text":"It expanded to a new city."},{"id":"B","text":"It changed the employee uniform."},{"id":"C","text":"It hired some new workers."},{"id":"D","text":"It gave raises to its employees."}]'::jsonb, 98, 1.0)
    RETURNING id INTO v_question_id;
  ELSE
    UPDATE assessment_questions SET
      skill = 'listening',
      category = 'toeic_part_4',
      difficulty = 2,
      level = 'b1',
      prompt = 'What did the speaker''s company recently do?',
      context_text = 'Talk Context (Questions 98 - 100)',
      audio_url = '/audio/toeic/real_exam/toeic_p4_q98_100.mp3',
      options = '[{"id":"A","text":"It expanded to a new city."},{"id":"B","text":"It changed the employee uniform."},{"id":"C","text":"It hired some new workers."},{"id":"D","text":"It gave raises to its employees."}]'::jsonb
    WHERE id = v_question_id;
  END IF;

  -- Answer for #98
  DELETE FROM assessment_question_answers WHERE question_id = v_question_id;
  INSERT INTO assessment_question_answers (question_id, correct_option_id, explanation, transcript_text)
  VALUES (v_question_id, 'C', 'Đáp án đúng: C.

Bài nói:
Hi, Blaine. This is Samantha. I just received word that we''ve hired some new employees, (98) so we need to prepare uniforms for each of them. As you know, the uniform consists of a shirt, a jacket, a pair of pants, and a pair of shoes. We''ve got eight employees who will be starting next week. (99) Please check to make sure that we have enough of each item. If we don''t, go ahead and order whatever we need from our regular supplier. Then, have the items delivered to me no later than Monday morning. (100) If you''ve got any questions, please let me know.

Giải thích chi tiết:
#### Q98 (正确答案：C)
**问题：** What did the speaker''s company recently do? (讲话者的公司最近发生了什么？)
- (A) It expanded to a new city. (它扩展到一座新的城市。)
- (B) It changed the employee uniform. (它更换了员工的制服。)
- (C) It hired some new workers. (它招募了一批新员工。)
- (D) It gave raises to its employees. (它给员工加薪了。)

', 'Hi, Blaine. This is Samantha. I just received word that we''ve hired some new employees, (98) so we need to prepare uniforms for each of them. As you know, the uniform consists of a shirt, a jacket, a pair of pants, and a pair of shoes. We''ve got eight employees who will be starting next week. (99) Please check to make sure that we have enough of each item. If we don''t, go ahead and order whatever we need from our regular supplier. Then, have the items delivered to me no later than Monday morning. (100) If you''ve got any questions, please let me know.');

  -- Question #99 (toeic_part_4)
  SELECT id INTO v_question_id FROM assessment_questions WHERE assessment_id = v_assessment_id AND position = 99;
  IF v_question_id IS NULL THEN
    INSERT INTO assessment_questions (assessment_id, skill, category, difficulty, level, question_type, prompt, context_text, audio_url, options, position, weight)
    VALUES (v_assessment_id, 'listening', 'toeic_part_4', 2, 'b1', 'multiple_choice', 'Look at the graphic. Which item should Blaine order more of?', 'Talk Context (Questions 98 - 100)', '/audio/toeic/real_exam/toeic_p4_q98_100.mp3', '[{"id":"A","text":"Shirt."},{"id":"B","text":"Jacket."},{"id":"C","text":"Pants."},{"id":"D","text":"Shoes."}]'::jsonb, 99, 1.0)
    RETURNING id INTO v_question_id;
  ELSE
    UPDATE assessment_questions SET
      skill = 'listening',
      category = 'toeic_part_4',
      difficulty = 2,
      level = 'b1',
      prompt = 'Look at the graphic. Which item should Blaine order more of?',
      context_text = 'Talk Context (Questions 98 - 100)',
      audio_url = '/audio/toeic/real_exam/toeic_p4_q98_100.mp3',
      options = '[{"id":"A","text":"Shirt."},{"id":"B","text":"Jacket."},{"id":"C","text":"Pants."},{"id":"D","text":"Shoes."}]'::jsonb
    WHERE id = v_question_id;
  END IF;

  -- Answer for #99
  DELETE FROM assessment_question_answers WHERE question_id = v_question_id;
  INSERT INTO assessment_question_answers (question_id, correct_option_id, explanation, transcript_text)
  VALUES (v_question_id, 'B', 'Đáp án đúng: B.

Bài nói:
Hi, Blaine. This is Samantha. I just received word that we''ve hired some new employees, (98) so we need to prepare uniforms for each of them. As you know, the uniform consists of a shirt, a jacket, a pair of pants, and a pair of shoes. We''ve got eight employees who will be starting next week. (99) Please check to make sure that we have enough of each item. If we don''t, go ahead and order whatever we need from our regular supplier. Then, have the items delivered to me no later than Monday morning. (100) If you''ve got any questions, please let me know.

Giải thích chi tiết:
#### Q99 (正确答案：B)
**问题：** Look at the graphic. Which item should Blaine order more of? (请看图表。布莱恩需要订购更多哪种物品？)
- (A) Shirt. (衬衫。)
- (B) Jacket. (夹克。)
- (C) Pants. (裤子。)
- (D) Shoes. (鞋。)

', 'Hi, Blaine. This is Samantha. I just received word that we''ve hired some new employees, (98) so we need to prepare uniforms for each of them. As you know, the uniform consists of a shirt, a jacket, a pair of pants, and a pair of shoes. We''ve got eight employees who will be starting next week. (99) Please check to make sure that we have enough of each item. If we don''t, go ahead and order whatever we need from our regular supplier. Then, have the items delivered to me no later than Monday morning. (100) If you''ve got any questions, please let me know.');

  -- Question #100 (toeic_part_4)
  SELECT id INTO v_question_id FROM assessment_questions WHERE assessment_id = v_assessment_id AND position = 100;
  IF v_question_id IS NULL THEN
    INSERT INTO assessment_questions (assessment_id, skill, category, difficulty, level, question_type, prompt, context_text, audio_url, options, position, weight)
    VALUES (v_assessment_id, 'listening', 'toeic_part_4', 2, 'b1', 'multiple_choice', 'What does the speaker request Blaine to do by Monday?', 'Talk Context (Questions 98 - 100)', '/audio/toeic/real_exam/toeic_p4_q98_100.mp3', '[{"id":"A","text":"Interview job applicants."},{"id":"B","text":"Deliver some clothing."},{"id":"C","text":"Visit a facility."},{"id":"D","text":"Prepare some documents."}]'::jsonb, 100, 1.0)
    RETURNING id INTO v_question_id;
  ELSE
    UPDATE assessment_questions SET
      skill = 'listening',
      category = 'toeic_part_4',
      difficulty = 2,
      level = 'b1',
      prompt = 'What does the speaker request Blaine to do by Monday?',
      context_text = 'Talk Context (Questions 98 - 100)',
      audio_url = '/audio/toeic/real_exam/toeic_p4_q98_100.mp3',
      options = '[{"id":"A","text":"Interview job applicants."},{"id":"B","text":"Deliver some clothing."},{"id":"C","text":"Visit a facility."},{"id":"D","text":"Prepare some documents."}]'::jsonb
    WHERE id = v_question_id;
  END IF;

  -- Answer for #100
  DELETE FROM assessment_question_answers WHERE question_id = v_question_id;
  INSERT INTO assessment_question_answers (question_id, correct_option_id, explanation, transcript_text)
  VALUES (v_question_id, 'B', 'Đáp án đúng: B.

Bài nói:
Hi, Blaine. This is Samantha. I just received word that we''ve hired some new employees, (98) so we need to prepare uniforms for each of them. As you know, the uniform consists of a shirt, a jacket, a pair of pants, and a pair of shoes. We''ve got eight employees who will be starting next week. (99) Please check to make sure that we have enough of each item. If we don''t, go ahead and order whatever we need from our regular supplier. Then, have the items delivered to me no later than Monday morning. (100) If you''ve got any questions, please let me know.

Giải thích chi tiết:
#### Q100 (正确答案：B)
**问题：** What does the speaker request Blaine to do by Monday? (讲话者要求布莱恩周一之前做什么？)
- (A) Interview job applicants. (面试求职者。)
- (B) Deliver some clothing. (转交一些衣物。)
- (C) Visit a facility. (查看一件设备。)
- (D) Prepare some documents. (准备一些文件。)

**延伸表达与补充：**
- **I just received word that~ = I heard that~** (我刚听说/得到消息称…)
  - *例句：I just received word that tomorrow would snow.* (我刚听说明天会下雪。)
', 'Hi, Blaine. This is Samantha. I just received word that we''ve hired some new employees, (98) so we need to prepare uniforms for each of them. As you know, the uniform consists of a shirt, a jacket, a pair of pants, and a pair of shoes. We''ve got eight employees who will be starting next week. (99) Please check to make sure that we have enough of each item. If we don''t, go ahead and order whatever we need from our regular supplier. Then, have the items delivered to me no later than Monday morning. (100) If you''ve got any questions, please let me know.');

  -- Question #101 (toeic_part_5)
  SELECT id INTO v_question_id FROM assessment_questions WHERE assessment_id = v_assessment_id AND position = 101;
  IF v_question_id IS NULL THEN
    INSERT INTO assessment_questions (assessment_id, skill, category, difficulty, level, question_type, prompt, context_text, audio_url, options, position, weight)
    VALUES (v_assessment_id, 'reading', 'toeic_part_5', 2, 'b1', 'multiple_choice', '------- you want to receive additional information regarding the services we offer, please log onto our website at www.healthclub.com today.', NULL, NULL, '[{"id":"A","text":"If"},{"id":"B","text":"For"},{"id":"C","text":"Despite"},{"id":"D","text":"Whether"}]'::jsonb, 101, 1.0)
    RETURNING id INTO v_question_id;
  ELSE
    UPDATE assessment_questions SET
      skill = 'reading',
      category = 'toeic_part_5',
      difficulty = 2,
      level = 'b1',
      prompt = '------- you want to receive additional information regarding the services we offer, please log onto our website at www.healthclub.com today.',
      context_text = NULL,
      audio_url = NULL,
      options = '[{"id":"A","text":"If"},{"id":"B","text":"For"},{"id":"C","text":"Despite"},{"id":"D","text":"Whether"}]'::jsonb
    WHERE id = v_question_id;
  END IF;

  -- Answer for #101
  DELETE FROM assessment_question_answers WHERE question_id = v_question_id;
  INSERT INTO assessment_question_answers (question_id, correct_option_id, explanation, transcript_text)
  VALUES (v_question_id, 'A', 'Đáp án đúng: A.

Phân tích ngữ pháp & từ vựng:
', NULL);

  -- Question #102 (toeic_part_5)
  SELECT id INTO v_question_id FROM assessment_questions WHERE assessment_id = v_assessment_id AND position = 102;
  IF v_question_id IS NULL THEN
    INSERT INTO assessment_questions (assessment_id, skill, category, difficulty, level, question_type, prompt, context_text, audio_url, options, position, weight)
    VALUES (v_assessment_id, 'reading', 'toeic_part_5', 2, 'b1', 'multiple_choice', 'Sandy Duncan was handpicked by the general manager to head the next project because of ------- experience in this field. 786 ``` ## PDF 第 16 页 ![PDF 第 16 页](images/read_page_16.png) ```text', NULL, NULL, '[{"id":"A","text":"her"},{"id":"B","text":"hers"},{"id":"C","text":"herself"},{"id":"D","text":"she"}]'::jsonb, 102, 1.0)
    RETURNING id INTO v_question_id;
  ELSE
    UPDATE assessment_questions SET
      skill = 'reading',
      category = 'toeic_part_5',
      difficulty = 2,
      level = 'b1',
      prompt = 'Sandy Duncan was handpicked by the general manager to head the next project because of ------- experience in this field. 786 ``` ## PDF 第 16 页 ![PDF 第 16 页](images/read_page_16.png) ```text',
      context_text = NULL,
      audio_url = NULL,
      options = '[{"id":"A","text":"her"},{"id":"B","text":"hers"},{"id":"C","text":"herself"},{"id":"D","text":"she"}]'::jsonb
    WHERE id = v_question_id;
  END IF;

  -- Answer for #102
  DELETE FROM assessment_question_answers WHERE question_id = v_question_id;
  INSERT INTO assessment_question_answers (question_id, correct_option_id, explanation, transcript_text)
  VALUES (v_question_id, 'A', 'Đáp án đúng: A.

Phân tích ngữ pháp & từ vựng:
Sandy Duncan was handpicked by the general manager to head the next project
because of ------- experience in this field.
(A) her
 (B) hers
(C) herself (D) she
▶
桑迪·邓肯被总经理特意选去执行下一个项目，因为在这个领域她的
经验很丰富。
▶
解析
 横线处需填入修饰名词experience的形容词性物主代词，故
选(A)。若备选答案为人称代词的不同形式，可根据上下文结构，直接选择
其适当形态，以节省解题时间。', NULL);

  -- Question #103 (toeic_part_5)
  SELECT id INTO v_question_id FROM assessment_questions WHERE assessment_id = v_assessment_id AND position = 103;
  IF v_question_id IS NULL THEN
    INSERT INTO assessment_questions (assessment_id, skill, category, difficulty, level, question_type, prompt, context_text, audio_url, options, position, weight)
    VALUES (v_assessment_id, 'reading', 'toeic_part_5', 2, 'b1', 'multiple_choice', 'The changes made in the working conditions at our company resulted in remarkable improvements in all aspects of our business and ------- more so in the morale of our employees.', NULL, NULL, '[{"id":"A","text":"all"},{"id":"B","text":"any"},{"id":"C","text":"even"},{"id":"D","text":"although"}]'::jsonb, 103, 1.0)
    RETURNING id INTO v_question_id;
  ELSE
    UPDATE assessment_questions SET
      skill = 'reading',
      category = 'toeic_part_5',
      difficulty = 2,
      level = 'b1',
      prompt = 'The changes made in the working conditions at our company resulted in remarkable improvements in all aspects of our business and ------- more so in the morale of our employees.',
      context_text = NULL,
      audio_url = NULL,
      options = '[{"id":"A","text":"all"},{"id":"B","text":"any"},{"id":"C","text":"even"},{"id":"D","text":"although"}]'::jsonb
    WHERE id = v_question_id;
  END IF;

  -- Answer for #103
  DELETE FROM assessment_question_answers WHERE question_id = v_question_id;
  INSERT INTO assessment_question_answers (question_id, correct_option_id, explanation, transcript_text)
  VALUES (v_question_id, 'C', 'Đáp án đúng: C.

Phân tích ngữ pháp & từ vựng:
The changes made in the working conditions at our company resulted in
remarkable improvements in all aspects of our business and ------- more so in the
morale of our employees.
(A) all (B) any
(C) even
 (D) although
▶
我公司工作条件的改善使得我们的经营在各个方面显著提高，甚至连
员工的士气也提高了。
▶
解析
 横线后的more在解题时起决定性作用。横线位于比较级前，
由此可以判断应填入修饰比较级的副词，故选(C)。此类副词还有even，
much，a lot等。', NULL);

  -- Question #104 (toeic_part_5)
  SELECT id INTO v_question_id FROM assessment_questions WHERE assessment_id = v_assessment_id AND position = 104;
  IF v_question_id IS NULL THEN
    INSERT INTO assessment_questions (assessment_id, skill, category, difficulty, level, question_type, prompt, context_text, audio_url, options, position, weight)
    VALUES (v_assessment_id, 'reading', 'toeic_part_5', 2, 'b1', 'multiple_choice', 'All commuters ------- the main highway to get to the center of the city will face delays of up to an hour today because of on-going construction.', NULL, NULL, '[{"id":"A","text":"use"},{"id":"B","text":"used"},{"id":"C","text":"using"},{"id":"D","text":"will use"}]'::jsonb, 104, 1.0)
    RETURNING id INTO v_question_id;
  ELSE
    UPDATE assessment_questions SET
      skill = 'reading',
      category = 'toeic_part_5',
      difficulty = 2,
      level = 'b1',
      prompt = 'All commuters ------- the main highway to get to the center of the city will face delays of up to an hour today because of on-going construction.',
      context_text = NULL,
      audio_url = NULL,
      options = '[{"id":"A","text":"use"},{"id":"B","text":"used"},{"id":"C","text":"using"},{"id":"D","text":"will use"}]'::jsonb
    WHERE id = v_question_id;
  END IF;

  -- Answer for #104
  DELETE FROM assessment_question_answers WHERE question_id = v_question_id;
  INSERT INTO assessment_question_answers (question_id, correct_option_id, explanation, transcript_text)
  VALUES (v_question_id, 'C', 'Đáp án đúng: C.

Phân tích ngữ pháp & từ vựng:
All commuters ------- the main highway to get to the center of the city will face
delays of up to an hour today because of on-going construction.
1220
```

## PDF 第 450 页

```text
(A) use (B) used
(C) using
 (D) will use
▶
所有走主路去市中心的通勤者今天都会因为正在进行的施工建设耽误
长达1小时。
▶
解析
 这是一道关于现在分词的问题。现在分词在保持动词特性的
同时，还起到形容词的作用，可修饰名词。横线前的commuters是整个句子
的主语，也是备选答案中use的主语。因句子的谓语动词是will face，横线
处应填入以the main highway为宾语、修饰commuters的动词。故现在分词
(C)using最恰当。
▼ Vocabulary Check
additional
附加的，另外的
regarding
关于
offer
提供
handpick
精选
head
领导，带领
experience
经验；经历
field
领域；场地
working conditions
工作条件
result in
导致，引起
remarkable
显著的；值得注意的
improvement
改进，改善
aspect
方面
morale
士气，民心
commuter
使用月、季票上下班者，通勤者
get to...
到达某地
1221
```

## PDF 第 451 页

```text
face
面临，面对
delay
耽搁，延迟
on-going
持续的；正在进行的
construction
建设', NULL);

  -- Question #105 (toeic_part_5)
  SELECT id INTO v_question_id FROM assessment_questions WHERE assessment_id = v_assessment_id AND position = 105;
  IF v_question_id IS NULL THEN
    INSERT INTO assessment_questions (assessment_id, skill, category, difficulty, level, question_type, prompt, context_text, audio_url, options, position, weight)
    VALUES (v_assessment_id, 'reading', 'toeic_part_5', 2, 'b1', 'multiple_choice', 'In order to become a member of the country club, applicants have to meet the strict ------- set by the club president.', NULL, NULL, '[{"id":"A","text":"require"},{"id":"B","text":"requires"},{"id":"C","text":"requiring"},{"id":"D","text":"requirements"}]'::jsonb, 105, 1.0)
    RETURNING id INTO v_question_id;
  ELSE
    UPDATE assessment_questions SET
      skill = 'reading',
      category = 'toeic_part_5',
      difficulty = 2,
      level = 'b1',
      prompt = 'In order to become a member of the country club, applicants have to meet the strict ------- set by the club president.',
      context_text = NULL,
      audio_url = NULL,
      options = '[{"id":"A","text":"require"},{"id":"B","text":"requires"},{"id":"C","text":"requiring"},{"id":"D","text":"requirements"}]'::jsonb
    WHERE id = v_question_id;
  END IF;

  -- Answer for #105
  DELETE FROM assessment_question_answers WHERE question_id = v_question_id;
  INSERT INTO assessment_question_answers (question_id, correct_option_id, explanation, transcript_text)
  VALUES (v_question_id, 'D', 'Đáp án đúng: D.

Phân tích ngữ pháp & từ vựng:
In order to become a member of the country club, applicants have to meet the
strict ------- set by the club president.
(A) require (B) requires
(C) requiring
(D) requirements
▶
为了成为乡村俱乐部的会员，申请人必须满足俱乐部主席制订的严格
要求。
▶
解析
 横线处所填单词被形容词strict修饰，且充当meet的宾语，
故名词(D)requirements为正确答案。', NULL);

  -- Question #106 (toeic_part_5)
  SELECT id INTO v_question_id FROM assessment_questions WHERE assessment_id = v_assessment_id AND position = 106;
  IF v_question_id IS NULL THEN
    INSERT INTO assessment_questions (assessment_id, skill, category, difficulty, level, question_type, prompt, context_text, audio_url, options, position, weight)
    VALUES (v_assessment_id, 'reading', 'toeic_part_5', 2, 'b1', 'multiple_choice', 'The outcome of our meeting today with the board of directors will ------- the course of action we will take this year. 787 ``` ## PDF 第 17 页 ![PDF 第 17 页](images/read_page_17.png) ```text', NULL, NULL, '[{"id":"A","text":"determine"},{"id":"B","text":"determines"},{"id":"C","text":"determining"},{"id":"D","text":"determination"}]'::jsonb, 106, 1.0)
    RETURNING id INTO v_question_id;
  ELSE
    UPDATE assessment_questions SET
      skill = 'reading',
      category = 'toeic_part_5',
      difficulty = 2,
      level = 'b1',
      prompt = 'The outcome of our meeting today with the board of directors will ------- the course of action we will take this year. 787 ``` ## PDF 第 17 页 ![PDF 第 17 页](images/read_page_17.png) ```text',
      context_text = NULL,
      audio_url = NULL,
      options = '[{"id":"A","text":"determine"},{"id":"B","text":"determines"},{"id":"C","text":"determining"},{"id":"D","text":"determination"}]'::jsonb
    WHERE id = v_question_id;
  END IF;

  -- Answer for #106
  DELETE FROM assessment_question_answers WHERE question_id = v_question_id;
  INSERT INTO assessment_question_answers (question_id, correct_option_id, explanation, transcript_text)
  VALUES (v_question_id, 'A', 'Đáp án đúng: A.

Phân tích ngữ pháp & từ vựng:
The outcome of our meeting today with the board of directors will ------- the
course of action we will take this year.
(A) determine
 (B) determines
(C) determining (D) determination
▶
今天我们和董事会的会议结果将决定我们今年的行动方案。
▶
解析
 本题需选择适当的词形。助动词will后应跟动词原形，以the
course of action为宾语。故(A)determine为正确答案。', NULL);

  -- Question #107 (toeic_part_5)
  SELECT id INTO v_question_id FROM assessment_questions WHERE assessment_id = v_assessment_id AND position = 107;
  IF v_question_id IS NULL THEN
    INSERT INTO assessment_questions (assessment_id, skill, category, difficulty, level, question_type, prompt, context_text, audio_url, options, position, weight)
    VALUES (v_assessment_id, 'reading', 'toeic_part_5', 2, 'b1', 'multiple_choice', 'The announcement of John Stanton’s retirement was not well received by most of the staff members, but Leslie, his long time friend and colleague, was extremely - ------ to hear that Mr. Stanton will now be able to enjoy some leisure time.', NULL, NULL, '[{"id":"A","text":"happiest"},{"id":"B","text":"happily"},{"id":"C","text":"happier"},{"id":"D","text":"happy"}]'::jsonb, 107, 1.0)
    RETURNING id INTO v_question_id;
  ELSE
    UPDATE assessment_questions SET
      skill = 'reading',
      category = 'toeic_part_5',
      difficulty = 2,
      level = 'b1',
      prompt = 'The announcement of John Stanton’s retirement was not well received by most of the staff members, but Leslie, his long time friend and colleague, was extremely - ------ to hear that Mr. Stanton will now be able to enjoy some leisure time.',
      context_text = NULL,
      audio_url = NULL,
      options = '[{"id":"A","text":"happiest"},{"id":"B","text":"happily"},{"id":"C","text":"happier"},{"id":"D","text":"happy"}]'::jsonb
    WHERE id = v_question_id;
  END IF;

  -- Answer for #107
  DELETE FROM assessment_question_answers WHERE question_id = v_question_id;
  INSERT INTO assessment_question_answers (question_id, correct_option_id, explanation, transcript_text)
  VALUES (v_question_id, 'D', 'Đáp án đúng: D.

Phân tích ngữ pháp & từ vựng:
The announcement of John Stanton’s retirement was not well received by most
of the staff members, but Leslie, his long time friend and colleague, was extremely -
------ to hear that Mr. Stanton will now be able to enjoy some leisure time.
(A) happiest (B) happily
(C) happier
(D) happy
▶
大多数员工不太能接受约翰·斯坦顿退休的消息，但是他的老朋友兼
同事莱斯利在听说他很快就能享受空闲时间时却非常高兴。
1222
```

## PDF 第 452 页

```text
▶
解析
 本题需选择适当的词形。横线处所填单词被副词extremely修
饰，且充当was的表语，故选形容词(D)happy。be happy to do sth.为固定
句型。', NULL);

  -- Question #108 (toeic_part_5)
  SELECT id INTO v_question_id FROM assessment_questions WHERE assessment_id = v_assessment_id AND position = 108;
  IF v_question_id IS NULL THEN
    INSERT INTO assessment_questions (assessment_id, skill, category, difficulty, level, question_type, prompt, context_text, audio_url, options, position, weight)
    VALUES (v_assessment_id, 'reading', 'toeic_part_5', 2, 'b1', 'multiple_choice', 'Because many of the warehouse workers were out sick today, Mr. Miller had to stock the goods on the shelves -------.', NULL, NULL, '[{"id":"A","text":"itself"},{"id":"B","text":"himself"},{"id":"C","text":"herself"},{"id":"D","text":"themselves"}]'::jsonb, 108, 1.0)
    RETURNING id INTO v_question_id;
  ELSE
    UPDATE assessment_questions SET
      skill = 'reading',
      category = 'toeic_part_5',
      difficulty = 2,
      level = 'b1',
      prompt = 'Because many of the warehouse workers were out sick today, Mr. Miller had to stock the goods on the shelves -------.',
      context_text = NULL,
      audio_url = NULL,
      options = '[{"id":"A","text":"itself"},{"id":"B","text":"himself"},{"id":"C","text":"herself"},{"id":"D","text":"themselves"}]'::jsonb
    WHERE id = v_question_id;
  END IF;

  -- Answer for #108
  DELETE FROM assessment_question_answers WHERE question_id = v_question_id;
  INSERT INTO assessment_question_answers (question_id, correct_option_id, explanation, transcript_text)
  VALUES (v_question_id, 'B', 'Đáp án đúng: B.

Phân tích ngữ pháp & từ vựng:
Because many of the warehouse workers were out sick today, Mr. Miller had
to stock the goods on the shelves -------.
(A) itself
(B) himself
(C) herself (D) themselves
▶
因为今天仓库里好多工人都请了病假，米勒先生不得不自己把货物摆
到货架上。
▶
解析
 备选答案均为反身代词，需要选出正确的人称。主句就算没
有横线处所需的反身代词也能构成完整的句子，这就意味着这里的反身代词
仅起到了强调主语行为的作用。因此，根据主语Mr. Miller，选择
(B)himself。
▼ Vocabulary Check
in order to do
为了做（某事）
applicant
申请者
meet the strict requirements
满足严格的要求
strict
严格的；严厉的
requirement
要求；需求
outcome
结果
determine
决定
the course of action
行动方针
announcement
宣布，宣告
retirement
退休
extremely
非常，很，极端地
1223
```

## PDF 第 453 页

```text
leisure time
空闲时间
warehouse
仓库
be out sick
请病假
stock
备货；贮存
goods
货物', NULL);

  -- Question #109 (toeic_part_5)
  SELECT id INTO v_question_id FROM assessment_questions WHERE assessment_id = v_assessment_id AND position = 109;
  IF v_question_id IS NULL THEN
    INSERT INTO assessment_questions (assessment_id, skill, category, difficulty, level, question_type, prompt, context_text, audio_url, options, position, weight)
    VALUES (v_assessment_id, 'reading', 'toeic_part_5', 2, 'b1', 'multiple_choice', 'Please accept our ------- apology for the inconvenience this delay is causing all the passengers here at Pearson International Airport.', NULL, NULL, '[{"id":"A","text":"sincere"},{"id":"B","text":"original"},{"id":"C","text":"estimated"},{"id":"D","text":"completed"}]'::jsonb, 109, 1.0)
    RETURNING id INTO v_question_id;
  ELSE
    UPDATE assessment_questions SET
      skill = 'reading',
      category = 'toeic_part_5',
      difficulty = 2,
      level = 'b1',
      prompt = 'Please accept our ------- apology for the inconvenience this delay is causing all the passengers here at Pearson International Airport.',
      context_text = NULL,
      audio_url = NULL,
      options = '[{"id":"A","text":"sincere"},{"id":"B","text":"original"},{"id":"C","text":"estimated"},{"id":"D","text":"completed"}]'::jsonb
    WHERE id = v_question_id;
  END IF;

  -- Answer for #109
  DELETE FROM assessment_question_answers WHERE question_id = v_question_id;
  INSERT INTO assessment_question_answers (question_id, correct_option_id, explanation, transcript_text)
  VALUES (v_question_id, 'A', 'Đáp án đúng: A.

Phân tích ngữ pháp & từ vựng:
Please accept our ------- apology for the inconvenience this delay is causing all
the passengers here at Pearson International Airport.
(A) sincere
 (B) original
(C) estimated (D) completed
▶
此次班机延误造成所有乘客都滞留在皮尔森国际机场，为此我们表示
真诚的歉意。
▶
解析
 本题需选择修饰名词apology的恰当形容词。真诚的道歉才能
使对方容易接受，故(A)sincere(真诚的)最恰当。', NULL);

  -- Question #110 (toeic_part_5)
  SELECT id INTO v_question_id FROM assessment_questions WHERE assessment_id = v_assessment_id AND position = 110;
  IF v_question_id IS NULL THEN
    INSERT INTO assessment_questions (assessment_id, skill, category, difficulty, level, question_type, prompt, context_text, audio_url, options, position, weight)
    VALUES (v_assessment_id, 'reading', 'toeic_part_5', 2, 'b1', 'multiple_choice', 'The majority of the contract ------- that took place during the year were handled by lawyers from a local law firm. 788 ``` ## PDF 第 18 页 ![PDF 第 18 页](images/read_page_18.png) ```text', NULL, NULL, '[{"id":"A","text":"negotiate"},{"id":"B","text":"negotiations"},{"id":"C","text":"negotiable"},{"id":"D","text":"negotiator"}]'::jsonb, 110, 1.0)
    RETURNING id INTO v_question_id;
  ELSE
    UPDATE assessment_questions SET
      skill = 'reading',
      category = 'toeic_part_5',
      difficulty = 2,
      level = 'b1',
      prompt = 'The majority of the contract ------- that took place during the year were handled by lawyers from a local law firm. 788 ``` ## PDF 第 18 页 ![PDF 第 18 页](images/read_page_18.png) ```text',
      context_text = NULL,
      audio_url = NULL,
      options = '[{"id":"A","text":"negotiate"},{"id":"B","text":"negotiations"},{"id":"C","text":"negotiable"},{"id":"D","text":"negotiator"}]'::jsonb
    WHERE id = v_question_id;
  END IF;

  -- Answer for #110
  DELETE FROM assessment_question_answers WHERE question_id = v_question_id;
  INSERT INTO assessment_question_answers (question_id, correct_option_id, explanation, transcript_text)
  VALUES (v_question_id, 'B', 'Đáp án đúng: B.

Phân tích ngữ pháp & từ vựng:
The majority of the contract ------- that took place during the year were handled
by lawyers from a local law firm.
(A) negotiate
(B) negotiations
(C) negotiable (D) negotiator
▶
今年的大部分合同谈判都是由一家当地律师事务所的律师处理的。
▶
解析
 the majority of...后应接名词或名词性短语，因此横线处
应填入名词。备选答案中有两个名词，因此要把握句意，选择适当的名词。
从“是由当地律师事务所的律师处理的”中可看出，(B)negotiations(谈
判)为正确答案。', NULL);

  -- Question #111 (toeic_part_5)
  SELECT id INTO v_question_id FROM assessment_questions WHERE assessment_id = v_assessment_id AND position = 111;
  IF v_question_id IS NULL THEN
    INSERT INTO assessment_questions (assessment_id, skill, category, difficulty, level, question_type, prompt, context_text, audio_url, options, position, weight)
    VALUES (v_assessment_id, 'reading', 'toeic_part_5', 2, 'b1', 'multiple_choice', 'It will be next to impossible to ------- a room at the Ashton Hotel this week because of the film festival.', NULL, NULL, '[{"id":"A","text":"reserve"},{"id":"B","text":"respond"},{"id":"C","text":"connect"},{"id":"D","text":"appoint"}]'::jsonb, 111, 1.0)
    RETURNING id INTO v_question_id;
  ELSE
    UPDATE assessment_questions SET
      skill = 'reading',
      category = 'toeic_part_5',
      difficulty = 2,
      level = 'b1',
      prompt = 'It will be next to impossible to ------- a room at the Ashton Hotel this week because of the film festival.',
      context_text = NULL,
      audio_url = NULL,
      options = '[{"id":"A","text":"reserve"},{"id":"B","text":"respond"},{"id":"C","text":"connect"},{"id":"D","text":"appoint"}]'::jsonb
    WHERE id = v_question_id;
  END IF;

  -- Answer for #111
  DELETE FROM assessment_question_answers WHERE question_id = v_question_id;
  INSERT INTO assessment_question_answers (question_id, correct_option_id, explanation, transcript_text)
  VALUES (v_question_id, 'A', 'Đáp án đúng: A.

Phân tích ngữ pháp & từ vựng:
It will be next to impossible to ------- a room at the Ashton Hotel this week
because of the film festival.
(A) reserve
 (B) respond
(C) connect (D) appoint
1224
```

## PDF 第 454 页

```text
▶
因为电影节，本周想在阿士顿酒店预订房间几乎不可能。
▶
解析
 四个备选答案都是动词，因此本题是一道动词词义辨析题。
从a room at the Ashton Hotel可以看出，要选有“预订”意义的动词，故
选(A)。next to impossible是almost impossible(几乎不可能)的意思。', NULL);

  -- Question #112 (toeic_part_5)
  SELECT id INTO v_question_id FROM assessment_questions WHERE assessment_id = v_assessment_id AND position = 112;
  IF v_question_id IS NULL THEN
    INSERT INTO assessment_questions (assessment_id, skill, category, difficulty, level, question_type, prompt, context_text, audio_url, options, position, weight)
    VALUES (v_assessment_id, 'reading', 'toeic_part_5', 2, 'b1', 'multiple_choice', 'The presentation of this evening’s winners will commence ------- at seven following dinner at six.', NULL, NULL, '[{"id":"A","text":"precise"},{"id":"B","text":"precision"},{"id":"C","text":"precisely"},{"id":"D","text":"preciseness"}]'::jsonb, 112, 1.0)
    RETURNING id INTO v_question_id;
  ELSE
    UPDATE assessment_questions SET
      skill = 'reading',
      category = 'toeic_part_5',
      difficulty = 2,
      level = 'b1',
      prompt = 'The presentation of this evening’s winners will commence ------- at seven following dinner at six.',
      context_text = NULL,
      audio_url = NULL,
      options = '[{"id":"A","text":"precise"},{"id":"B","text":"precision"},{"id":"C","text":"precisely"},{"id":"D","text":"preciseness"}]'::jsonb
    WHERE id = v_question_id;
  END IF;

  -- Answer for #112
  DELETE FROM assessment_question_answers WHERE question_id = v_question_id;
  INSERT INTO assessment_question_answers (question_id, correct_option_id, explanation, transcript_text)
  VALUES (v_question_id, 'C', 'Đáp án đúng: C.

Phân tích ngữ pháp & từ vựng:
The presentation of this evening’s winners will commence ------- at seven
following dinner at six.
(A) precise (B) precision
(C) precisely
 (D) preciseness
▶
6点的晚宴后，今晚的优胜者的演讲将于7点整开始。
▶
解析
 本题需选择适当的词形。commence既是及物动词，也是不及
物动词。根据主语the presentation和commence的关系，可判断出这里的
commence是不及物动词。因此横线处应选择可修饰动词的副词，故选(C)。
▼ Vocabulary Check
accept
接受
apology
道歉
inconvenience
不便；困难
cause
引起，使产生，成为
…
的原因
majority
多数，大多数
contract
合同
negotiation
谈判，磋商
take place
发生
handle
处理，操作
next to impossible(= almost impossible)
几乎不可能
reserve
预订
1225
```

## PDF 第 455 页

```text
respond
回答，响应
connect
连接；联系
appoint
任命，指派；分配
presentation
陈述，介绍
winner
胜利者，优胜者
commence
开始；倡导
precisely
正好；精确地；明确地
follow
接着；跟随', NULL);

  -- Question #113 (toeic_part_5)
  SELECT id INTO v_question_id FROM assessment_questions WHERE assessment_id = v_assessment_id AND position = 113;
  IF v_question_id IS NULL THEN
    INSERT INTO assessment_questions (assessment_id, skill, category, difficulty, level, question_type, prompt, context_text, audio_url, options, position, weight)
    VALUES (v_assessment_id, 'reading', 'toeic_part_5', 2, 'b1', 'multiple_choice', 'The new sports complex will accommodate an Olympic-sized swimming pool and other -------, including a fitness center and a spa, to name just a few.', NULL, NULL, '[{"id":"A","text":"facilities"},{"id":"B","text":"categories"},{"id":"C","text":"qualities"},{"id":"D","text":"supplies"}]'::jsonb, 113, 1.0)
    RETURNING id INTO v_question_id;
  ELSE
    UPDATE assessment_questions SET
      skill = 'reading',
      category = 'toeic_part_5',
      difficulty = 2,
      level = 'b1',
      prompt = 'The new sports complex will accommodate an Olympic-sized swimming pool and other -------, including a fitness center and a spa, to name just a few.',
      context_text = NULL,
      audio_url = NULL,
      options = '[{"id":"A","text":"facilities"},{"id":"B","text":"categories"},{"id":"C","text":"qualities"},{"id":"D","text":"supplies"}]'::jsonb
    WHERE id = v_question_id;
  END IF;

  -- Answer for #113
  DELETE FROM assessment_question_answers WHERE question_id = v_question_id;
  INSERT INTO assessment_question_answers (question_id, correct_option_id, explanation, transcript_text)
  VALUES (v_question_id, 'A', 'Đáp án đúng: A.

Phân tích ngữ pháp & từ vựng:
The new sports complex will accommodate an Olympic-sized swimming pool
and other -------, including a fitness center and a spa, to name just a few.
(A) facilities
 (B) categories
(C) qualities (D) supplies
▶
新体育场将设有一个奥运会规格的游泳池和其他设施，包括健身中
心、温泉浴场等。
▶
解析
 本题需选择适当的名词。应选择词义上能包含swimming
pool，fitness center和spa的名词。故答案为(A)facilities(设施，设
备)。', NULL);

  -- Question #114 (toeic_part_5)
  SELECT id INTO v_question_id FROM assessment_questions WHERE assessment_id = v_assessment_id AND position = 114;
  IF v_question_id IS NULL THEN
    INSERT INTO assessment_questions (assessment_id, skill, category, difficulty, level, question_type, prompt, context_text, audio_url, options, position, weight)
    VALUES (v_assessment_id, 'reading', 'toeic_part_5', 2, 'b1', 'multiple_choice', 'Our new product will be put through a number of ------- tests before being released to the public.', NULL, NULL, '[{"id":"A","text":"dependent"},{"id":"B","text":"founded"},{"id":"C","text":"withhold"},{"id":"D","text":"stringent"}]'::jsonb, 114, 1.0)
    RETURNING id INTO v_question_id;
  ELSE
    UPDATE assessment_questions SET
      skill = 'reading',
      category = 'toeic_part_5',
      difficulty = 2,
      level = 'b1',
      prompt = 'Our new product will be put through a number of ------- tests before being released to the public.',
      context_text = NULL,
      audio_url = NULL,
      options = '[{"id":"A","text":"dependent"},{"id":"B","text":"founded"},{"id":"C","text":"withhold"},{"id":"D","text":"stringent"}]'::jsonb
    WHERE id = v_question_id;
  END IF;

  -- Answer for #114
  DELETE FROM assessment_question_answers WHERE question_id = v_question_id;
  INSERT INTO assessment_question_answers (question_id, correct_option_id, explanation, transcript_text)
  VALUES (v_question_id, 'D', 'Đáp án đúng: D.

Phân tích ngữ pháp & từ vựng:
Our new product will be put through a number of ------- tests before being
released to the public.
(A) dependent (B) founded
(C) withhold
(D) stringent
▶
我们的新产品在投放市场前将通过一系列严格测试。
▶
解析
 备选答案主要由过去分词和形容词组成，因此本题是一道选
择适当形容词的题。横线处所填单词修饰名词tests，形容词
(D)stringent(严格的)符合语境，故为正确答案。选择修饰名词的形容词
1226
```

## PDF 第 456 页

```text
时，至少要知道名词的词义，才能作出正确选择。', NULL);

  -- Question #115 (toeic_part_5)
  SELECT id INTO v_question_id FROM assessment_questions WHERE assessment_id = v_assessment_id AND position = 115;
  IF v_question_id IS NULL THEN
    INSERT INTO assessment_questions (assessment_id, skill, category, difficulty, level, question_type, prompt, context_text, audio_url, options, position, weight)
    VALUES (v_assessment_id, 'reading', 'toeic_part_5', 2, 'b1', 'multiple_choice', 'Mr. Chan’s main role in the company for the next two weeks is to look ------- the right person to take over Mr. Shaw’s position when he leaves at the end of the month.', NULL, NULL, '[{"id":"A","text":"in"},{"id":"B","text":"for"},{"id":"C","text":"over"},{"id":"D","text":"from"}]'::jsonb, 115, 1.0)
    RETURNING id INTO v_question_id;
  ELSE
    UPDATE assessment_questions SET
      skill = 'reading',
      category = 'toeic_part_5',
      difficulty = 2,
      level = 'b1',
      prompt = 'Mr. Chan’s main role in the company for the next two weeks is to look ------- the right person to take over Mr. Shaw’s position when he leaves at the end of the month.',
      context_text = NULL,
      audio_url = NULL,
      options = '[{"id":"A","text":"in"},{"id":"B","text":"for"},{"id":"C","text":"over"},{"id":"D","text":"from"}]'::jsonb
    WHERE id = v_question_id;
  END IF;

  -- Answer for #115
  DELETE FROM assessment_question_answers WHERE question_id = v_question_id;
  INSERT INTO assessment_question_answers (question_id, correct_option_id, explanation, transcript_text)
  VALUES (v_question_id, 'B', 'Đáp án đúng: B.

Phân tích ngữ pháp & từ vựng:
Mr. Chan’s main role in the company for the next two weeks is to look -------
the right person to take over Mr. Shaw’s position when he leaves at the end of the
month.
(A) in
(B) for
(C) over (D) from
▶
未来两周里，陈先生在公司的主要职责就是寻找一个合适的人选在本
月末肖先生离职时接管他的工作。
▶
解析
 备选答案均为介词，横线前有动词look，应选择可与look搭
配的介词。句意要表达“找”的意思。故答案是(B)for，look for意为“寻
找”。', NULL);

  -- Question #116 (toeic_part_5)
  SELECT id INTO v_question_id FROM assessment_questions WHERE assessment_id = v_assessment_id AND position = 116;
  IF v_question_id IS NULL THEN
    INSERT INTO assessment_questions (assessment_id, skill, category, difficulty, level, question_type, prompt, context_text, audio_url, options, position, weight)
    VALUES (v_assessment_id, 'reading', 'toeic_part_5', 2, 'b1', 'multiple_choice', 'People unanimously agreed that John would have performed a great deal better under more ------- circumstances.', NULL, NULL, '[{"id":"A","text":"favorable"},{"id":"B","text":"favorably"},{"id":"C","text":"favorite"},{"id":"D","text":"favor"}]'::jsonb, 116, 1.0)
    RETURNING id INTO v_question_id;
  ELSE
    UPDATE assessment_questions SET
      skill = 'reading',
      category = 'toeic_part_5',
      difficulty = 2,
      level = 'b1',
      prompt = 'People unanimously agreed that John would have performed a great deal better under more ------- circumstances.',
      context_text = NULL,
      audio_url = NULL,
      options = '[{"id":"A","text":"favorable"},{"id":"B","text":"favorably"},{"id":"C","text":"favorite"},{"id":"D","text":"favor"}]'::jsonb
    WHERE id = v_question_id;
  END IF;

  -- Answer for #116
  DELETE FROM assessment_question_answers WHERE question_id = v_question_id;
  INSERT INTO assessment_question_answers (question_id, correct_option_id, explanation, transcript_text)
  VALUES (v_question_id, 'A', 'Đáp án đúng: A.

Phân tích ngữ pháp & từ vựng:
People unanimously agreed that John would have performed a great deal better
under more ------- circumstances.
(A) favorable
 (B) favorably
(C) favorite (D) favor
▶
人们一致认为，如果情况更有利的话，约翰会表现得更好。
▶
解析
 本题需选择适当的词形。横线位于比较级more和名词
circumstances之间，可判断出答案应为形容词。favorable(有利的)和
favorite(特别喜爱的)都是形容词，但根据上下文，“更有利的情况”更加
符合句意，故答案是(A)favorable。
▼ Vocabulary Check
sports complex
体育中心
accommodate
容纳
Olympic-sized
奥运会规格的
facility
设施
include
包括
1227
```

## PDF 第 457 页

```text
fitness center
健身中心
spa
温泉浴场
to name just a few
举些例子
put through
使通过；使经受
a number of
若干，一些，许多
stringent
严格的，严厉的
release
发售
role
作用；角色
look for
寻找
right
合适的；正确的
take over
接管，接替
leave
离职；离开
unanimously
无异议地，全体一致地
perform
执行，完成
favorable
有利的；良好的
circumstance
情况，形势；环境', NULL);

  -- Question #117 (toeic_part_5)
  SELECT id INTO v_question_id FROM assessment_questions WHERE assessment_id = v_assessment_id AND position = 117;
  IF v_question_id IS NULL THEN
    INSERT INTO assessment_questions (assessment_id, skill, category, difficulty, level, question_type, prompt, context_text, audio_url, options, position, weight)
    VALUES (v_assessment_id, 'reading', 'toeic_part_5', 2, 'b1', 'multiple_choice', 'After a long and difficult strike, the plant workers will show up to work ------- Monday.', NULL, NULL, '[{"id":"A","text":"starting on"},{"id":"B","text":"afterwards"},{"id":"C","text":"instead"},{"id":"D","text":"outside"}]'::jsonb, 117, 1.0)
    RETURNING id INTO v_question_id;
  ELSE
    UPDATE assessment_questions SET
      skill = 'reading',
      category = 'toeic_part_5',
      difficulty = 2,
      level = 'b1',
      prompt = 'After a long and difficult strike, the plant workers will show up to work ------- Monday.',
      context_text = NULL,
      audio_url = NULL,
      options = '[{"id":"A","text":"starting on"},{"id":"B","text":"afterwards"},{"id":"C","text":"instead"},{"id":"D","text":"outside"}]'::jsonb
    WHERE id = v_question_id;
  END IF;

  -- Answer for #117
  DELETE FROM assessment_question_answers WHERE question_id = v_question_id;
  INSERT INTO assessment_question_answers (question_id, correct_option_id, explanation, transcript_text)
  VALUES (v_question_id, 'A', 'Đáp án đúng: A.

Phân tích ngữ pháp & từ vựng:
After a long and difficult strike, the plant workers will show up to work -------
Monday.
(A) starting on
 (B) afterwards
(C) instead (D) outside
▶
经过长期、艰苦的罢工，工厂的工人将从下周一开始上班。
▶
解析
 本题根据备选答案很难把握题型，这时就需要仔细分析句
子。状语after a long and difficult strike(经过长期、艰苦的罢工)是
重要依据，句意是“长期的罢工后工人们将从星期一开始正常上班”，因此
1228
```

## PDF 第 458 页

```text
选择具有“开始”意义的(A)starting on。show up to work是“上班”的
意思。', NULL);

  -- Question #118 (toeic_part_5)
  SELECT id INTO v_question_id FROM assessment_questions WHERE assessment_id = v_assessment_id AND position = 118;
  IF v_question_id IS NULL THEN
    INSERT INTO assessment_questions (assessment_id, skill, category, difficulty, level, question_type, prompt, context_text, audio_url, options, position, weight)
    VALUES (v_assessment_id, 'reading', 'toeic_part_5', 2, 'b1', 'multiple_choice', 'Scarborough General Hospital has two ------- for certified x-ray technicians to start immediately.', NULL, NULL, '[{"id":"A","text":"open"},{"id":"B","text":"opener"},{"id":"C","text":"openings"},{"id":"D","text":"openness"}]'::jsonb, 118, 1.0)
    RETURNING id INTO v_question_id;
  ELSE
    UPDATE assessment_questions SET
      skill = 'reading',
      category = 'toeic_part_5',
      difficulty = 2,
      level = 'b1',
      prompt = 'Scarborough General Hospital has two ------- for certified x-ray technicians to start immediately.',
      context_text = NULL,
      audio_url = NULL,
      options = '[{"id":"A","text":"open"},{"id":"B","text":"opener"},{"id":"C","text":"openings"},{"id":"D","text":"openness"}]'::jsonb
    WHERE id = v_question_id;
  END IF;

  -- Answer for #118
  DELETE FROM assessment_question_answers WHERE question_id = v_question_id;
  INSERT INTO assessment_question_answers (question_id, correct_option_id, explanation, transcript_text)
  VALUES (v_question_id, 'C', 'Đáp án đúng: C.

Phân tích ngữ pháp & từ vựng:
Scarborough General Hospital has two ------- for certified x-ray technicians to
start immediately.
(A) open (B) opener
(C) openings
 (D) openness
▶
斯卡伯勒综合医院有两个注册X光技术员的职位空缺，马上就可以入
职。
▶
解析
 考查词形和词义。has需要一个宾语，因此横线处应填入被
two修饰的名词。除了(A)open外，其他选项均为名词，可一一代入后分析全
句，选择意思适当的名词。“斯卡伯勒综合医院有两个注册X光技术员的职
位空缺”最为恰当，故答案是(C)openings。', NULL);

  -- Question #119 (toeic_part_5)
  SELECT id INTO v_question_id FROM assessment_questions WHERE assessment_id = v_assessment_id AND position = 119;
  IF v_question_id IS NULL THEN
    INSERT INTO assessment_questions (assessment_id, skill, category, difficulty, level, question_type, prompt, context_text, audio_url, options, position, weight)
    VALUES (v_assessment_id, 'reading', 'toeic_part_5', 2, 'b1', 'multiple_choice', 'Mark’s Warehouse Clearance Store is having a sale with savings of up to 40 percent off on all clothing this weekend ------- celebration of its 25th anniversary.', NULL, NULL, '[{"id":"A","text":"in"},{"id":"B","text":"at"},{"id":"C","text":"on"},{"id":"D","text":"of"}]'::jsonb, 119, 1.0)
    RETURNING id INTO v_question_id;
  ELSE
    UPDATE assessment_questions SET
      skill = 'reading',
      category = 'toeic_part_5',
      difficulty = 2,
      level = 'b1',
      prompt = 'Mark’s Warehouse Clearance Store is having a sale with savings of up to 40 percent off on all clothing this weekend ------- celebration of its 25th anniversary.',
      context_text = NULL,
      audio_url = NULL,
      options = '[{"id":"A","text":"in"},{"id":"B","text":"at"},{"id":"C","text":"on"},{"id":"D","text":"of"}]'::jsonb
    WHERE id = v_question_id;
  END IF;

  -- Answer for #119
  DELETE FROM assessment_question_answers WHERE question_id = v_question_id;
  INSERT INTO assessment_question_answers (question_id, correct_option_id, explanation, transcript_text)
  VALUES (v_question_id, 'A', 'Đáp án đúng: A.

Phân tích ngữ pháp & từ vựng:
Mark’s Warehouse Clearance Store is having a sale with savings of up to 40
percent off on all clothing this weekend ------- celebration of its 25th anniversary.
(A) in
 (B) at
(C) on (D) of
▶
在25周年店庆之际，马克清仓商店本周末所有的衣服都将打折，最高
能打六折。
▶
解析
 本题需选择常用词组中的介词。“纪念…”的表达方式是in
celebration of...，要留意介词in。想提高有关常用词组的题目的正确
率，需要具备一定的语法知识和词汇量。', NULL);

  -- Question #120 (toeic_part_5)
  SELECT id INTO v_question_id FROM assessment_questions WHERE assessment_id = v_assessment_id AND position = 120;
  IF v_question_id IS NULL THEN
    INSERT INTO assessment_questions (assessment_id, skill, category, difficulty, level, question_type, prompt, context_text, audio_url, options, position, weight)
    VALUES (v_assessment_id, 'reading', 'toeic_part_5', 2, 'b1', 'multiple_choice', 'Probe Magazine conducted a survey asking one thousand employees who work in low-paying industries to express ------- their biggest concerns are.', NULL, NULL, '[{"id":"A","text":"how"},{"id":"B","text":"when"},{"id":"C","text":"what"},{"id":"D","text":"which"}]'::jsonb, 120, 1.0)
    RETURNING id INTO v_question_id;
  ELSE
    UPDATE assessment_questions SET
      skill = 'reading',
      category = 'toeic_part_5',
      difficulty = 2,
      level = 'b1',
      prompt = 'Probe Magazine conducted a survey asking one thousand employees who work in low-paying industries to express ------- their biggest concerns are.',
      context_text = NULL,
      audio_url = NULL,
      options = '[{"id":"A","text":"how"},{"id":"B","text":"when"},{"id":"C","text":"what"},{"id":"D","text":"which"}]'::jsonb
    WHERE id = v_question_id;
  END IF;

  -- Answer for #120
  DELETE FROM assessment_question_answers WHERE question_id = v_question_id;
  INSERT INTO assessment_question_answers (question_id, correct_option_id, explanation, transcript_text)
  VALUES (v_question_id, 'C', 'Đáp án đúng: C.

Phân tích ngữ pháp & từ vựng:
Probe Magazine conducted a survey asking one thousand employees who work
in low-paying industries to express ------- their biggest concerns are.
(A) how (B) when
(C) what
 (D) which
▶
《布罗伯杂志》对1000名低收入行业中的雇员进行了调查，调查他们
最关心的是什么。
▶
解析
 ______ their biggest concerns are是及物动词express的
宾语。their biggest concerns are是“主语＋be动词”的不完整结构，因
1229
```

## PDF 第 459 页

```text
此横线处所填单词在引导名词性从句的同时，还要作are的宾语，故答案为
(C)what。how和when后必须跟完整的句子，which虽然与what类似，但一般
用于限定的某个范围内的事物。
▼ Vocabulary Check
strike
罢工
plant
工厂
show up to work
上班
afterwards
然后，后来
general hospital
综合医院；总医院
opening (
职位
)
空缺
certified
被鉴定的
immediately
立刻，马上
have a sale
廉价出售
with savings of up to
节省到
clothing
衣服
in celebration of
为庆祝
…
anniversary
周年纪念日
conduct a survey
做调查
low-paying
工资低的
concern
关心的事', NULL);

  -- Question #121 (toeic_part_5)
  SELECT id INTO v_question_id FROM assessment_questions WHERE assessment_id = v_assessment_id AND position = 121;
  IF v_question_id IS NULL THEN
    INSERT INTO assessment_questions (assessment_id, skill, category, difficulty, level, question_type, prompt, context_text, audio_url, options, position, weight)
    VALUES (v_assessment_id, 'reading', 'toeic_part_5', 2, 'b1', 'multiple_choice', 'Should there be any requests for schedule changes, please notify us -------.', NULL, NULL, '[{"id":"A","text":"prompt"},{"id":"B","text":"prompted"},{"id":"C","text":"promptly"},{"id":"D","text":"prompting"}]'::jsonb, 121, 1.0)
    RETURNING id INTO v_question_id;
  ELSE
    UPDATE assessment_questions SET
      skill = 'reading',
      category = 'toeic_part_5',
      difficulty = 2,
      level = 'b1',
      prompt = 'Should there be any requests for schedule changes, please notify us -------.',
      context_text = NULL,
      audio_url = NULL,
      options = '[{"id":"A","text":"prompt"},{"id":"B","text":"prompted"},{"id":"C","text":"promptly"},{"id":"D","text":"prompting"}]'::jsonb
    WHERE id = v_question_id;
  END IF;

  -- Answer for #121
  DELETE FROM assessment_question_answers WHERE question_id = v_question_id;
  INSERT INTO assessment_question_answers (question_id, correct_option_id, explanation, transcript_text)
  VALUES (v_question_id, 'C', 'Đáp án đúng: C.

Phân tích ngữ pháp & từ vựng:
Should there be any requests for schedule changes, please notify us -------.
(A) prompt (B) prompted
(C) promptly
 (D) prompting
1230
```

## PDF 第 460 页

```text
▶
如果有任何改变计划的要求，请迅速通知我们。
▶
解析
 notify是及物动词，意为“通知”。表示“通知某人某
事”时使用双宾语结构，即“notify +通知内容(直接宾语) +通知对象(间
接宾语)”。但若可根据上下文推出直接宾语的内容，如本题，则可省略直
接宾语。横线前please notify us已构成完整的句子，故横线处应填入修饰
动词的副词，故选(C)。', NULL);

  -- Question #122 (toeic_part_5)
  SELECT id INTO v_question_id FROM assessment_questions WHERE assessment_id = v_assessment_id AND position = 122;
  IF v_question_id IS NULL THEN
    INSERT INTO assessment_questions (assessment_id, skill, category, difficulty, level, question_type, prompt, context_text, audio_url, options, position, weight)
    VALUES (v_assessment_id, 'reading', 'toeic_part_5', 2, 'b1', 'multiple_choice', 'For this weekend only, Bad Boys Electronics Store is celebrating its first year in business with up to thirty percent ------- on all items in the store.', NULL, NULL, '[{"id":"A","text":"retail"},{"id":"B","text":"market"},{"id":"C","text":"economy"},{"id":"D","text":"discounts"}]'::jsonb, 122, 1.0)
    RETURNING id INTO v_question_id;
  ELSE
    UPDATE assessment_questions SET
      skill = 'reading',
      category = 'toeic_part_5',
      difficulty = 2,
      level = 'b1',
      prompt = 'For this weekend only, Bad Boys Electronics Store is celebrating its first year in business with up to thirty percent ------- on all items in the store.',
      context_text = NULL,
      audio_url = NULL,
      options = '[{"id":"A","text":"retail"},{"id":"B","text":"market"},{"id":"C","text":"economy"},{"id":"D","text":"discounts"}]'::jsonb
    WHERE id = v_question_id;
  END IF;

  -- Answer for #122
  DELETE FROM assessment_question_answers WHERE question_id = v_question_id;
  INSERT INTO assessment_question_answers (question_id, correct_option_id, explanation, transcript_text)
  VALUES (v_question_id, 'D', 'Đáp án đúng: D.

Phân tích ngữ pháp & từ vựng:
For this weekend only, Bad Boys Electronics Store is celebrating its first year
in business with up to thirty percent ------- on all items in the store.
(A) retail (B) market
(C) economy
(D) discounts
▶
本周末，“坏男孩”电子商店一周年店庆，店内所有商品打折，折扣
高达30%。
▶
解析
 本题需选择符合句意的名词。留意横线前后的thirty
percent 和on all items，将备选答案的名词一一代入，选择和它们最匹配
的(D)discounts(折扣)。', NULL);

  -- Question #123 (toeic_part_5)
  SELECT id INTO v_question_id FROM assessment_questions WHERE assessment_id = v_assessment_id AND position = 123;
  IF v_question_id IS NULL THEN
    INSERT INTO assessment_questions (assessment_id, skill, category, difficulty, level, question_type, prompt, context_text, audio_url, options, position, weight)
    VALUES (v_assessment_id, 'reading', 'toeic_part_5', 2, 'b1', 'multiple_choice', 'The automobile parts we requested for our customer got here on -------.', NULL, NULL, '[{"id":"A","text":"authority"},{"id":"B","text":"condition"},{"id":"C","text":"schedule"},{"id":"D","text":"appointment"}]'::jsonb, 123, 1.0)
    RETURNING id INTO v_question_id;
  ELSE
    UPDATE assessment_questions SET
      skill = 'reading',
      category = 'toeic_part_5',
      difficulty = 2,
      level = 'b1',
      prompt = 'The automobile parts we requested for our customer got here on -------.',
      context_text = NULL,
      audio_url = NULL,
      options = '[{"id":"A","text":"authority"},{"id":"B","text":"condition"},{"id":"C","text":"schedule"},{"id":"D","text":"appointment"}]'::jsonb
    WHERE id = v_question_id;
  END IF;

  -- Answer for #123
  DELETE FROM assessment_question_answers WHERE question_id = v_question_id;
  INSERT INTO assessment_question_answers (question_id, correct_option_id, explanation, transcript_text)
  VALUES (v_question_id, 'C', 'Đáp án đúng: C.

Phân tích ngữ pháp & từ vựng:
The automobile parts we requested for our customer got here on -------.
(A) authority (B) condition
(C) schedule
 (D) appointment
▶
客户需要的汽车零件已经按时到货。
▶
解析
 本题需选择适当的名词。句子的主干为the automobile
parts got here(汽车零件到达此地)，显然on _____ 修饰got。分别代入备
选答案，可以看出on schedule(按照预定时间，准时)最恰当，故选(C)。', NULL);

  -- Question #124 (toeic_part_5)
  SELECT id INTO v_question_id FROM assessment_questions WHERE assessment_id = v_assessment_id AND position = 124;
  IF v_question_id IS NULL THEN
    INSERT INTO assessment_questions (assessment_id, skill, category, difficulty, level, question_type, prompt, context_text, audio_url, options, position, weight)
    VALUES (v_assessment_id, 'reading', 'toeic_part_5', 2, 'b1', 'multiple_choice', 'The advertisements printed in this magazine do not ------- imply endorsement by the management.', NULL, NULL, '[{"id":"A","text":"highly"},{"id":"B","text":"barely"},{"id":"C","text":"gradually"},{"id":"D","text":"necessarily"}]'::jsonb, 124, 1.0)
    RETURNING id INTO v_question_id;
  ELSE
    UPDATE assessment_questions SET
      skill = 'reading',
      category = 'toeic_part_5',
      difficulty = 2,
      level = 'b1',
      prompt = 'The advertisements printed in this magazine do not ------- imply endorsement by the management.',
      context_text = NULL,
      audio_url = NULL,
      options = '[{"id":"A","text":"highly"},{"id":"B","text":"barely"},{"id":"C","text":"gradually"},{"id":"D","text":"necessarily"}]'::jsonb
    WHERE id = v_question_id;
  END IF;

  -- Answer for #124
  DELETE FROM assessment_question_answers WHERE question_id = v_question_id;
  INSERT INTO assessment_question_answers (question_id, correct_option_id, explanation, transcript_text)
  VALUES (v_question_id, 'D', 'Đáp án đúng: D.

Phân tích ngữ pháp & từ vựng:
The advertisements printed in this magazine do not ------- imply endorsement
by the management.
(A) highly (B) barely
(C) gradually
(D) necessarily
▶
印在这本杂志上的广告不一定意味着管理者的认可。
▶
解析
 本题需选择符合句意的副词。横线处所填副词修饰动词
1231
```

## PDF 第 461 页

```text
imply(包含，意味，暗示)，根据句意，选择(D)necessarily(必定，必然
地)。
▼ Vocabulary Check
notify
通知，通告
celebrate
庆祝，祝贺
retail
零售
(
的
)
part
零件
request
要求，请求
authority
权力；当局；权威
appointment
任命，选派；约定
imply
暗示，意指；必然包含
endorsement
赞同，认可；宣传；背书
necessarily
必然地；必须地；必要地
barely
仅仅，几乎没有；赤裸裸地', NULL);

  -- Question #125 (toeic_part_5)
  SELECT id INTO v_question_id FROM assessment_questions WHERE assessment_id = v_assessment_id AND position = 125;
  IF v_question_id IS NULL THEN
    INSERT INTO assessment_questions (assessment_id, skill, category, difficulty, level, question_type, prompt, context_text, audio_url, options, position, weight)
    VALUES (v_assessment_id, 'reading', 'toeic_part_5', 2, 'b1', 'multiple_choice', 'The newly installed alarm system, which is directly connected to the police, will go off if the correct security code is not entered ------- 60 seconds of touching the keypad.', NULL, NULL, '[{"id":"A","text":"only"},{"id":"B","text":"under"},{"id":"C","text":"within"},{"id":"D","text":"directly"}]'::jsonb, 125, 1.0)
    RETURNING id INTO v_question_id;
  ELSE
    UPDATE assessment_questions SET
      skill = 'reading',
      category = 'toeic_part_5',
      difficulty = 2,
      level = 'b1',
      prompt = 'The newly installed alarm system, which is directly connected to the police, will go off if the correct security code is not entered ------- 60 seconds of touching the keypad.',
      context_text = NULL,
      audio_url = NULL,
      options = '[{"id":"A","text":"only"},{"id":"B","text":"under"},{"id":"C","text":"within"},{"id":"D","text":"directly"}]'::jsonb
    WHERE id = v_question_id;
  END IF;

  -- Answer for #125
  DELETE FROM assessment_question_answers WHERE question_id = v_question_id;
  INSERT INTO assessment_question_answers (question_id, correct_option_id, explanation, transcript_text)
  VALUES (v_question_id, 'C', 'Đáp án đúng: C.

Phân tích ngữ pháp & từ vựng:
The newly installed alarm system, which is directly connected to the police,
will go off if the correct security code is not entered ------- 60 seconds of touching
the keypad.
(A) only (B) under
(C) within
 (D) directly
▶
新安装的报警系统直接连着警察局，如果在接触键盘后60秒内不能输
入正确的安全密码，它就会报警。
▶
解析
 备选答案为副词和介词。首先应分析句子结构，判断横线处
应填入介词还是副词。乍一看应填入副词修饰被动结构is not entered，实
际上if从句是被动语态，_____ 60 seconds of touching the keypad应作
状语。因此横线处应填入介词，从而构成介宾短语作状语，故选(C)。
1232
```

## PDF 第 462 页

```text', NULL);

  -- Question #126 (toeic_part_5)
  SELECT id INTO v_question_id FROM assessment_questions WHERE assessment_id = v_assessment_id AND position = 126;
  IF v_question_id IS NULL THEN
    INSERT INTO assessment_questions (assessment_id, skill, category, difficulty, level, question_type, prompt, context_text, audio_url, options, position, weight)
    VALUES (v_assessment_id, 'reading', 'toeic_part_5', 2, 'b1', 'multiple_choice', 'The airline requested a ------- call to ensure a seat on my flight back home.', NULL, NULL, '[{"id":"A","text":"Option A"},{"id":"B","text":"Option B"},{"id":"C","text":"Option C"},{"id":"D","text":"Option D"}]'::jsonb, 126, 1.0)
    RETURNING id INTO v_question_id;
  ELSE
    UPDATE assessment_questions SET
      skill = 'reading',
      category = 'toeic_part_5',
      difficulty = 2,
      level = 'b1',
      prompt = 'The airline requested a ------- call to ensure a seat on my flight back home.',
      context_text = NULL,
      audio_url = NULL,
      options = '[{"id":"A","text":"Option A"},{"id":"B","text":"Option B"},{"id":"C","text":"Option C"},{"id":"D","text":"Option D"}]'::jsonb
    WHERE id = v_question_id;
  END IF;

  -- Answer for #126
  DELETE FROM assessment_question_answers WHERE question_id = v_question_id;
  INSERT INTO assessment_question_answers (question_id, correct_option_id, explanation, transcript_text)
  VALUES (v_question_id, 'D', 'Đáp án đúng: D.

Phân tích ngữ pháp & từ vựng:
The airline requested a ------- call to ensure a seat on my flight back home.
(A) confirm (B) confirmed
(C) confirming
(D) confirmation
▶
航空公司要求打一个确认电话，以确保我返家的航班有座位。
▶
解析
 本题需选择适当的词形。因a _____ call 是requested的宾
语，横线处应填入修饰call的形容词或与call共同构成名词短语的名
词。“确认电话”是一个复合名词，故(D)confirmation正确。', NULL);

  -- Question #127 (toeic_part_5)
  SELECT id INTO v_question_id FROM assessment_questions WHERE assessment_id = v_assessment_id AND position = 127;
  IF v_question_id IS NULL THEN
    INSERT INTO assessment_questions (assessment_id, skill, category, difficulty, level, question_type, prompt, context_text, audio_url, options, position, weight)
    VALUES (v_assessment_id, 'reading', 'toeic_part_5', 2, 'b1', 'multiple_choice', 'Select the word or phrase that best completes the sentence.', NULL, NULL, '[{"id":"A","text":"Option A"},{"id":"B","text":"Option B"},{"id":"C","text":"Option C"},{"id":"D","text":"Option D"}]'::jsonb, 127, 1.0)
    RETURNING id INTO v_question_id;
  ELSE
    UPDATE assessment_questions SET
      skill = 'reading',
      category = 'toeic_part_5',
      difficulty = 2,
      level = 'b1',
      prompt = 'Select the word or phrase that best completes the sentence.',
      context_text = NULL,
      audio_url = NULL,
      options = '[{"id":"A","text":"Option A"},{"id":"B","text":"Option B"},{"id":"C","text":"Option C"},{"id":"D","text":"Option D"}]'::jsonb
    WHERE id = v_question_id;
  END IF;

  -- Answer for #127
  DELETE FROM assessment_question_answers WHERE question_id = v_question_id;
  INSERT INTO assessment_question_answers (question_id, correct_option_id, explanation, transcript_text)
  VALUES (v_question_id, 'B', 'Đáp án đúng: B.

Phân tích ngữ pháp & từ vựng:
If the task is too complicated to figure out on ------- own, please don’t hesitate
to ask one of our representatives, who are here to help.
(A) you
(B) your
(C) yours (D) yourself
▶
如果这个任务太复杂，你不能独立完成，请不要客气，找一位我们的
代表帮忙。
▶
解析
 本题需选择适当的代词。on ______ own是“介词+…+名
词”结构的介词短语，横线处应填入修饰名词own的物主代词，故选(B)。on
one’s own表示“独立地”。', NULL);

  -- Question #128 (toeic_part_5)
  SELECT id INTO v_question_id FROM assessment_questions WHERE assessment_id = v_assessment_id AND position = 128;
  IF v_question_id IS NULL THEN
    INSERT INTO assessment_questions (assessment_id, skill, category, difficulty, level, question_type, prompt, context_text, audio_url, options, position, weight)
    VALUES (v_assessment_id, 'reading', 'toeic_part_5', 2, 'b1', 'multiple_choice', 'The hard work put in during his younger years made him become ------- sound in his later years.', NULL, NULL, '[{"id":"A","text":"finance"},{"id":"B","text":"finances"},{"id":"C","text":"financial"},{"id":"D","text":"financially"}]'::jsonb, 128, 1.0)
    RETURNING id INTO v_question_id;
  ELSE
    UPDATE assessment_questions SET
      skill = 'reading',
      category = 'toeic_part_5',
      difficulty = 2,
      level = 'b1',
      prompt = 'The hard work put in during his younger years made him become ------- sound in his later years.',
      context_text = NULL,
      audio_url = NULL,
      options = '[{"id":"A","text":"finance"},{"id":"B","text":"finances"},{"id":"C","text":"financial"},{"id":"D","text":"financially"}]'::jsonb
    WHERE id = v_question_id;
  END IF;

  -- Answer for #128
  DELETE FROM assessment_question_answers WHERE question_id = v_question_id;
  INSERT INTO assessment_question_answers (question_id, correct_option_id, explanation, transcript_text)
  VALUES (v_question_id, 'D', 'Đáp án đúng: D.

Phân tích ngữ pháp & từ vựng:
The hard work put in during his younger years made him become ------- sound
in his later years.
(A) finance (B) finances
(C) financial
(D) financially
▶
他年轻时的努力使他晚年的经济状况很好。
▶
解析
 本题需选择适当的词形。横线处应填入副词，修饰become的
表语sound(殷实的)，故选(D)。
▼ Vocabulary Check
install
安装
alarm system
警报系统
1233
```

## PDF 第 463 页

```text
go off
发出响声
enter
输入
(
信息
)
；进入
request
请求，要求
ensure
确保；保证
confirmation call
确认电话
task
任务，作业
complicated
复杂的
figure out
解决；计算出
on one’s own
独立地，独自地
hesitate
犹豫，踌躇
hard
艰苦的；困难的
sound
殷实的，资金充实的；健全的', NULL);

  -- Question #129 (toeic_part_5)
  SELECT id INTO v_question_id FROM assessment_questions WHERE assessment_id = v_assessment_id AND position = 129;
  IF v_question_id IS NULL THEN
    INSERT INTO assessment_questions (assessment_id, skill, category, difficulty, level, question_type, prompt, context_text, audio_url, options, position, weight)
    VALUES (v_assessment_id, 'reading', 'toeic_part_5', 2, 'b1', 'multiple_choice', 'Ms. Taylor has called the managers to ------- her in the main conference room to discuss next year’s budget.', NULL, NULL, '[{"id":"A","text":"met"},{"id":"B","text":"meet"},{"id":"C","text":"have met"},{"id":"D","text":"will meet"}]'::jsonb, 129, 1.0)
    RETURNING id INTO v_question_id;
  ELSE
    UPDATE assessment_questions SET
      skill = 'reading',
      category = 'toeic_part_5',
      difficulty = 2,
      level = 'b1',
      prompt = 'Ms. Taylor has called the managers to ------- her in the main conference room to discuss next year’s budget.',
      context_text = NULL,
      audio_url = NULL,
      options = '[{"id":"A","text":"met"},{"id":"B","text":"meet"},{"id":"C","text":"have met"},{"id":"D","text":"will meet"}]'::jsonb
    WHERE id = v_question_id;
  END IF;

  -- Answer for #129
  DELETE FROM assessment_question_answers WHERE question_id = v_question_id;
  INSERT INTO assessment_question_answers (question_id, correct_option_id, explanation, transcript_text)
  VALUES (v_question_id, 'B', 'Đáp án đúng: B.

Phân tích ngữ pháp & từ vựng:
Ms. Taylor has called the managers to ------- her in the main conference room
to discuss next year’s budget.
(A) met
(B) meet
(C) have met (D) will meet
▶
泰勒女士已经叫经理去主会议室见她，讨论明年的预算。
▶
解析
 本题需选择适当的动词。横线前有不定式符号to，应选择动
词原形，故选(B)meet。', NULL);

  -- Question #130 (toeic_part_5)
  SELECT id INTO v_question_id FROM assessment_questions WHERE assessment_id = v_assessment_id AND position = 130;
  IF v_question_id IS NULL THEN
    INSERT INTO assessment_questions (assessment_id, skill, category, difficulty, level, question_type, prompt, context_text, audio_url, options, position, weight)
    VALUES (v_assessment_id, 'reading', 'toeic_part_5', 2, 'b1', 'multiple_choice', '------- announcing his retirement, Mr. Kinsley has been busy trying to train his replacement.', NULL, NULL, '[{"id":"A","text":"Because"},{"id":"B","text":"Once"},{"id":"C","text":"Since"},{"id":"D","text":"While"}]'::jsonb, 130, 1.0)
    RETURNING id INTO v_question_id;
  ELSE
    UPDATE assessment_questions SET
      skill = 'reading',
      category = 'toeic_part_5',
      difficulty = 2,
      level = 'b1',
      prompt = '------- announcing his retirement, Mr. Kinsley has been busy trying to train his replacement.',
      context_text = NULL,
      audio_url = NULL,
      options = '[{"id":"A","text":"Because"},{"id":"B","text":"Once"},{"id":"C","text":"Since"},{"id":"D","text":"While"}]'::jsonb
    WHERE id = v_question_id;
  END IF;

  -- Answer for #130
  DELETE FROM assessment_question_answers WHERE question_id = v_question_id;
  INSERT INTO assessment_question_answers (question_id, correct_option_id, explanation, transcript_text)
  VALUES (v_question_id, 'C', 'Đáp án đúng: C.

Phân tích ngữ pháp & từ vựng:
------- announcing his retirement, Mr. Kinsley has been busy trying to train his
replacement.
(A) Because (B) Once
(C) Since
 (D) While
▶
自从宣布退休，金斯利先生就忙于培训他的接班人。
1234
```

## PDF 第 464 页

```text
▶
解析
 备选答案均为连词，可一一代入后选择最符合句意的选项。
根据前一分句内容(宣布退休)和后一分句内容(忙于培训他的接班人)，
(C)since(自…以来)最恰当。since announcing his retirement在意思上
相当于since he announced his retirement，前者使用现在分词来表达，
后者使用从句来表达。
▼ Vocabulary Check
conference room
会议室
discuss
讨论
budget
预算
announce
宣布
retirement
退休
be busy ~ing
忙于做某事
train
训练
replacement
接替者
Questions 131-134
 refer to the following article.
银行按揭利率将降低
加拿大最大的银行中有几家已经决定降低它们的按揭利率。皇家银行
透露，将全面降低主要按揭利率十分之一个百分点，同时道明加拿大信托
银行将对除了十年期贷款以外的按揭采取相同幅度的降息。蒙特利尔银行
也将降低四年期及更长期限的混合利率按揭十分之一个百分点。
最后，温哥华信托银行也已经加入行列，宣布计划降低利率。确切的
数字尚未公布。尽管如此，知情人预计降息幅度会和其他银行相同。', NULL);

  -- Question #131 (toeic_part_6)
  SELECT id INTO v_question_id FROM assessment_questions WHERE assessment_id = v_assessment_id AND position = 131;
  IF v_question_id IS NULL THEN
    INSERT INTO assessment_questions (assessment_id, skill, category, difficulty, level, question_type, prompt, context_text, audio_url, options, position, weight)
    VALUES (v_assessment_id, 'reading', 'toeic_part_6', 3, 'b2', 'multiple_choice', 'Select the best choice to fill in the blank (131) in the passage.', 'Questions 131-134
 refer to the following article.
Bank Mortgage Rates Will Fall
Several of Canada’s largest banks (131) -------- to decrease their mortgage
rates. Royal Ban
revealed its plan to cut key mortgage rates by a tenth of a percentage point
across the board, while TD Canada Trust will decrease its rates by the same
(132)-------- except for its 10-year rate.
The Bank of Montreal will also lower its fixed-rate mortgages on four-year
terms and longer by a tenth of a percentage point.
And lastly, Vancouver Trust has also jumped on the wagon by announcing
that it is planning to (133) -------- its rates. (134) --------. However, insiders are
predicting that the reduction rates will be similar to those of other banks.', NULL, '[{"id":"A","text":"decide"},{"id":"B","text":"deciding"},{"id":"C","text":"was decided"},{"id":"D","text":"have decided"}]'::jsonb, 131, 1.0)
    RETURNING id INTO v_question_id;
  ELSE
    UPDATE assessment_questions SET
      skill = 'reading',
      category = 'toeic_part_6',
      difficulty = 3,
      level = 'b2',
      prompt = 'Select the best choice to fill in the blank (131) in the passage.',
      context_text = 'Questions 131-134
 refer to the following article.
Bank Mortgage Rates Will Fall
Several of Canada’s largest banks (131) -------- to decrease their mortgage
rates. Royal Ban
revealed its plan to cut key mortgage rates by a tenth of a percentage point
across the board, while TD Canada Trust will decrease its rates by the same
(132)-------- except for its 10-year rate.
The Bank of Montreal will also lower its fixed-rate mortgages on four-year
terms and longer by a tenth of a percentage point.
And lastly, Vancouver Trust has also jumped on the wagon by announcing
that it is planning to (133) -------- its rates. (134) --------. However, insiders are
predicting that the reduction rates will be similar to those of other banks.',
      audio_url = NULL,
      options = '[{"id":"A","text":"decide"},{"id":"B","text":"deciding"},{"id":"C","text":"was decided"},{"id":"D","text":"have decided"}]'::jsonb
    WHERE id = v_question_id;
  END IF;

  -- Answer for #131
  DELETE FROM assessment_question_answers WHERE question_id = v_question_id;
  INSERT INTO assessment_question_answers (question_id, correct_option_id, explanation, transcript_text)
  VALUES (v_question_id, 'D', 'Đáp án đúng: D.

Phân tích ngữ cảnh & từ vựng:
Several of Canada’s largest banks ------- to decrease their mortgage rates.
1235
```

## PDF 第 465 页

```text
(A) decide (B) deciding
(C) was decided
(D) have decided
→本题需选择decide的适当形态。实施“决定”行为的主体是银行，应
使用主动语态。主语several of...banks是复数形式，为保持主谓一致，应
选(D)have decided。', NULL);

  -- Question #132 (toeic_part_6)
  SELECT id INTO v_question_id FROM assessment_questions WHERE assessment_id = v_assessment_id AND position = 132;
  IF v_question_id IS NULL THEN
    INSERT INTO assessment_questions (assessment_id, skill, category, difficulty, level, question_type, prompt, context_text, audio_url, options, position, weight)
    VALUES (v_assessment_id, 'reading', 'toeic_part_6', 3, 'b2', 'multiple_choice', 'Select the best choice to fill in the blank (132) in the passage.', 'Questions 131-134
 refer to the following article.
Bank Mortgage Rates Will Fall
Several of Canada’s largest banks (131) -------- to decrease their mortgage
rates. Royal Ban
revealed its plan to cut key mortgage rates by a tenth of a percentage point
across the board, while TD Canada Trust will decrease its rates by the same
(132)-------- except for its 10-year rate.
The Bank of Montreal will also lower its fixed-rate mortgages on four-year
terms and longer by a tenth of a percentage point.
And lastly, Vancouver Trust has also jumped on the wagon by announcing
that it is planning to (133) -------- its rates. (134) --------. However, insiders are
predicting that the reduction rates will be similar to those of other banks.', NULL, '[{"id":"A","text":"margin"},{"id":"B","text":"allowance"},{"id":"C","text":"space"},{"id":"D","text":"surplus"}]'::jsonb, 132, 1.0)
    RETURNING id INTO v_question_id;
  ELSE
    UPDATE assessment_questions SET
      skill = 'reading',
      category = 'toeic_part_6',
      difficulty = 3,
      level = 'b2',
      prompt = 'Select the best choice to fill in the blank (132) in the passage.',
      context_text = 'Questions 131-134
 refer to the following article.
Bank Mortgage Rates Will Fall
Several of Canada’s largest banks (131) -------- to decrease their mortgage
rates. Royal Ban
revealed its plan to cut key mortgage rates by a tenth of a percentage point
across the board, while TD Canada Trust will decrease its rates by the same
(132)-------- except for its 10-year rate.
The Bank of Montreal will also lower its fixed-rate mortgages on four-year
terms and longer by a tenth of a percentage point.
And lastly, Vancouver Trust has also jumped on the wagon by announcing
that it is planning to (133) -------- its rates. (134) --------. However, insiders are
predicting that the reduction rates will be similar to those of other banks.',
      audio_url = NULL,
      options = '[{"id":"A","text":"margin"},{"id":"B","text":"allowance"},{"id":"C","text":"space"},{"id":"D","text":"surplus"}]'::jsonb
    WHERE id = v_question_id;
  END IF;

  -- Answer for #132
  DELETE FROM assessment_question_answers WHERE question_id = v_question_id;
  INSERT INTO assessment_question_answers (question_id, correct_option_id, explanation, transcript_text)
  VALUES (v_question_id, 'A', 'Đáp án đúng: A.

Phân tích ngữ cảnh & từ vựng:
Royal Bank revealed its plan to cut key mortagage rates by a tenth of a
percentage point across the board, while TD Canada Trust will decrease its rates
by the same ------- except for its 10-year rate.
(A) margin
 (B) allowance
(C) space (D) surplus
→本题需选择符合句意的名词。本文主要是讲几个银行下调按揭利率的
内容，应选(A)margin(幅度)。', NULL);

  -- Question #133 (toeic_part_6)
  SELECT id INTO v_question_id FROM assessment_questions WHERE assessment_id = v_assessment_id AND position = 133;
  IF v_question_id IS NULL THEN
    INSERT INTO assessment_questions (assessment_id, skill, category, difficulty, level, question_type, prompt, context_text, audio_url, options, position, weight)
    VALUES (v_assessment_id, 'reading', 'toeic_part_6', 3, 'b2', 'multiple_choice', 'Select the best choice to fill in the blank (133) in the passage.', 'Questions 131-134
 refer to the following article.
Bank Mortgage Rates Will Fall
Several of Canada’s largest banks (131) -------- to decrease their mortgage
rates. Royal Ban
revealed its plan to cut key mortgage rates by a tenth of a percentage point
across the board, while TD Canada Trust will decrease its rates by the same
(132)-------- except for its 10-year rate.
The Bank of Montreal will also lower its fixed-rate mortgages on four-year
terms and longer by a tenth of a percentage point.
And lastly, Vancouver Trust has also jumped on the wagon by announcing
that it is planning to (133) -------- its rates. (134) --------. However, insiders are
predicting that the reduction rates will be similar to those of other banks.', NULL, '[{"id":"A","text":"turn down"},{"id":"B","text":"shorten"},{"id":"C","text":"reduce"},{"id":"D","text":"narrow"}]'::jsonb, 133, 1.0)
    RETURNING id INTO v_question_id;
  ELSE
    UPDATE assessment_questions SET
      skill = 'reading',
      category = 'toeic_part_6',
      difficulty = 3,
      level = 'b2',
      prompt = 'Select the best choice to fill in the blank (133) in the passage.',
      context_text = 'Questions 131-134
 refer to the following article.
Bank Mortgage Rates Will Fall
Several of Canada’s largest banks (131) -------- to decrease their mortgage
rates. Royal Ban
revealed its plan to cut key mortgage rates by a tenth of a percentage point
across the board, while TD Canada Trust will decrease its rates by the same
(132)-------- except for its 10-year rate.
The Bank of Montreal will also lower its fixed-rate mortgages on four-year
terms and longer by a tenth of a percentage point.
And lastly, Vancouver Trust has also jumped on the wagon by announcing
that it is planning to (133) -------- its rates. (134) --------. However, insiders are
predicting that the reduction rates will be similar to those of other banks.',
      audio_url = NULL,
      options = '[{"id":"A","text":"turn down"},{"id":"B","text":"shorten"},{"id":"C","text":"reduce"},{"id":"D","text":"narrow"}]'::jsonb
    WHERE id = v_question_id;
  END IF;

  -- Answer for #133
  DELETE FROM assessment_question_answers WHERE question_id = v_question_id;
  INSERT INTO assessment_question_answers (question_id, correct_option_id, explanation, transcript_text)
  VALUES (v_question_id, 'C', 'Đáp án đúng: C.

Phân tích ngữ cảnh & từ vựng:
Vancouver Trust has also jumped on the wagon by announcing that it is
planning to ------- its rates.
(A) turn down (B) shorten
(C) reduce
 (D) narrow
→本题需选择符合句意的动词。根据银行下调按揭利率的报道内容，应
选择具有“减少，缩减”词义的及物动词，且可以与后面的rates搭配，故
选(C)reduce。', NULL);

  -- Question #134 (toeic_part_6)
  SELECT id INTO v_question_id FROM assessment_questions WHERE assessment_id = v_assessment_id AND position = 134;
  IF v_question_id IS NULL THEN
    INSERT INTO assessment_questions (assessment_id, skill, category, difficulty, level, question_type, prompt, context_text, audio_url, options, position, weight)
    VALUES (v_assessment_id, 'reading', 'toeic_part_6', 3, 'b2', 'multiple_choice', 'Select the best choice to fill in the blank (134) in the passage.', 'Questions 131-134
 refer to the following article.
Bank Mortgage Rates Will Fall
Several of Canada’s largest banks (131) -------- to decrease their mortgage
rates. Royal Ban
revealed its plan to cut key mortgage rates by a tenth of a percentage point
across the board, while TD Canada Trust will decrease its rates by the same
(132)-------- except for its 10-year rate.
The Bank of Montreal will also lower its fixed-rate mortgages on four-year
terms and longer by a tenth of a percentage point.
And lastly, Vancouver Trust has also jumped on the wagon by announcing
that it is planning to (133) -------- its rates. (134) --------. However, insiders are
predicting that the reduction rates will be similar to those of other banks.', NULL, '[{"id":"A","text":"It has brought about unpredictable results."},{"id":"B","text":"The Canadian government doesn’t agree"},{"id":"C","text":"The exact numbers are still unknown."},{"id":"D","text":"Some other banks continue to follow its"}]'::jsonb, 134, 1.0)
    RETURNING id INTO v_question_id;
  ELSE
    UPDATE assessment_questions SET
      skill = 'reading',
      category = 'toeic_part_6',
      difficulty = 3,
      level = 'b2',
      prompt = 'Select the best choice to fill in the blank (134) in the passage.',
      context_text = 'Questions 131-134
 refer to the following article.
Bank Mortgage Rates Will Fall
Several of Canada’s largest banks (131) -------- to decrease their mortgage
rates. Royal Ban
revealed its plan to cut key mortgage rates by a tenth of a percentage point
across the board, while TD Canada Trust will decrease its rates by the same
(132)-------- except for its 10-year rate.
The Bank of Montreal will also lower its fixed-rate mortgages on four-year
terms and longer by a tenth of a percentage point.
And lastly, Vancouver Trust has also jumped on the wagon by announcing
that it is planning to (133) -------- its rates. (134) --------. However, insiders are
predicting that the reduction rates will be similar to those of other banks.',
      audio_url = NULL,
      options = '[{"id":"A","text":"It has brought about unpredictable results."},{"id":"B","text":"The Canadian government doesn’t agree"},{"id":"C","text":"The exact numbers are still unknown."},{"id":"D","text":"Some other banks continue to follow its"}]'::jsonb
    WHERE id = v_question_id;
  END IF;

  -- Answer for #134
  DELETE FROM assessment_question_answers WHERE question_id = v_question_id;
  INSERT INTO assessment_question_answers (question_id, correct_option_id, explanation, transcript_text)
  VALUES (v_question_id, 'C', 'Đáp án đúng: C.

Phân tích ngữ cảnh & từ vựng:
(A) It has brought about unpredictable results.
(B) The Canadian government doesn’t agree with it.
(C) The exact numbers are still unknown.
(D) Some other banks continue to follow its step.
→上句说的是温哥华信托银行降低利率的举措。下句以however开头，
指出“尽管如此，知情人预计降息幅度会和其他银行相同”。可知，本题应
选择描述降息幅度的选项(C)。
▼ Vocabulary Check
1236
```

## PDF 第 466 页

```text
mortgage
抵押，按揭
rate
利率，率
reveal
透露，泄露
cut
削减，降低
key
重要的，关键的
across the board
全面地
decrease
减少，减小
except for
除
…
以外
lower
降低
jump on the wagon
随波逐流
announce
宣布
plan to do
计划做某事
reduce
减少，降低
exact
确切的；准确的
unknown
未知的
insider
知情人，了解内幕者
predict
预计，预言
reduction
减少，降低
similar to
类似于
…
，与
…
相似
surplus
剩余，盈余
Questions 135-138
 refer to the following advertisement.
“
用伦敦人寿保险公司的简单财富策略在仅仅四年内净赚
250
1237
```

## PDF 第 467 页

```text
万美元
”
——
投资顾问简
·
布思和格伦达
·
杰克逊
如果你在寻找通往财务自由的方法但是不确定该怎么办，或者你现有
的投资项目没有好好运作且需要一次大规模重组，我们能助你一臂之力。
很多中等收入者表示过很难得到一个坦率、明确、没有偏见的意见来
实现他们的财务目标。有一对工作努力的夫妇以教书为生，在他们发现伦
敦生活的简单而有效的投资技术前，从未想过他们能从工资中获得更多的
好处。按照我们简单的策略去做，这对夫妇能积累起一小笔财富！现在，
我们也可以告诉你怎样积累财富。
伦敦人寿保险公司
·
金融计划
·
股票经纪业务
·
资产
·
金融', NULL);

  -- Question #135 (toeic_part_6)
  SELECT id INTO v_question_id FROM assessment_questions WHERE assessment_id = v_assessment_id AND position = 135;
  IF v_question_id IS NULL THEN
    INSERT INTO assessment_questions (assessment_id, skill, category, difficulty, level, question_type, prompt, context_text, audio_url, options, position, weight)
    VALUES (v_assessment_id, 'reading', 'toeic_part_6', 3, 'b2', 'multiple_choice', 'Select the best choice to fill in the blank (135) in the passage.', 'Questions 135-138
 refer to the following advertisement.
“A net worth of $2.5 million
in just 4 years using London Life’s
simple wealth strategy”
– Jane Booth and Glenda Jackson – Investment Advisers
If you’re looking to get on the (135) -------- to financial freedom but aren’t
sure of what steps to take or if your existing investment portfolio is not doing its
job and needs a major shake up, then we can help.
Many middle-income earners have expressed their opinions on how difficult
it is to get honest, straightforward, and unbiased advice that supports their
financial goals. According to one couple, they were working hard as teachers and
never thought that they could get ahead on their (136) -------- until they
discovered London Life’s simple (137) -------- effective investing techniques. By
following our simple strategy, we were able to amass a small fortune for the
795


## PDF 第 25 页

![PDF 第 25 页](images/read_page_25.png)



couple! (138) --------.
London Life
• FINANCIAL PLANNING • STOCKBROKING • PROPERTY • FINANCE', NULL, '[{"id":"A","text":"path"},{"id":"B","text":"access"},{"id":"C","text":"line"},{"id":"D","text":"track"}]'::jsonb, 135, 1.0)
    RETURNING id INTO v_question_id;
  ELSE
    UPDATE assessment_questions SET
      skill = 'reading',
      category = 'toeic_part_6',
      difficulty = 3,
      level = 'b2',
      prompt = 'Select the best choice to fill in the blank (135) in the passage.',
      context_text = 'Questions 135-138
 refer to the following advertisement.
“A net worth of $2.5 million
in just 4 years using London Life’s
simple wealth strategy”
– Jane Booth and Glenda Jackson – Investment Advisers
If you’re looking to get on the (135) -------- to financial freedom but aren’t
sure of what steps to take or if your existing investment portfolio is not doing its
job and needs a major shake up, then we can help.
Many middle-income earners have expressed their opinions on how difficult
it is to get honest, straightforward, and unbiased advice that supports their
financial goals. According to one couple, they were working hard as teachers and
never thought that they could get ahead on their (136) -------- until they
discovered London Life’s simple (137) -------- effective investing techniques. By
following our simple strategy, we were able to amass a small fortune for the
795


## PDF 第 25 页

![PDF 第 25 页](images/read_page_25.png)



couple! (138) --------.
London Life
• FINANCIAL PLANNING • STOCKBROKING • PROPERTY • FINANCE',
      audio_url = NULL,
      options = '[{"id":"A","text":"path"},{"id":"B","text":"access"},{"id":"C","text":"line"},{"id":"D","text":"track"}]'::jsonb
    WHERE id = v_question_id;
  END IF;

  -- Answer for #135
  DELETE FROM assessment_question_answers WHERE question_id = v_question_id;
  INSERT INTO assessment_question_answers (question_id, correct_option_id, explanation, transcript_text)
  VALUES (v_question_id, 'A', 'Đáp án đúng: A.

Phân tích ngữ cảnh & từ vựng:
If you’re looking to get on the ------- to financial freedom but aren’t sure of
what steps to take or if your existing investment portfolio is not doing its job and
needs a major shake up, then we can help.
(A) path
 (B) access
(C) line (D) track
→“寻找通往财务自由的方法”最恰当，故选(A)path。path除了可以
表示“小路”之外，还可表示“(实现某事所需要的)计划，成功的途
径”等。', NULL);

  -- Question #136 (toeic_part_6)
  SELECT id INTO v_question_id FROM assessment_questions WHERE assessment_id = v_assessment_id AND position = 136;
  IF v_question_id IS NULL THEN
    INSERT INTO assessment_questions (assessment_id, skill, category, difficulty, level, question_type, prompt, context_text, audio_url, options, position, weight)
    VALUES (v_assessment_id, 'reading', 'toeic_part_6', 3, 'b2', 'multiple_choice', 'Select the best choice to fill in the blank (136) in the passage.', 'Questions 135-138
 refer to the following advertisement.
“A net worth of $2.5 million
in just 4 years using London Life’s
simple wealth strategy”
– Jane Booth and Glenda Jackson – Investment Advisers
If you’re looking to get on the (135) -------- to financial freedom but aren’t
sure of what steps to take or if your existing investment portfolio is not doing its
job and needs a major shake up, then we can help.
Many middle-income earners have expressed their opinions on how difficult
it is to get honest, straightforward, and unbiased advice that supports their
financial goals. According to one couple, they were working hard as teachers and
never thought that they could get ahead on their (136) -------- until they
discovered London Life’s simple (137) -------- effective investing techniques. By
following our simple strategy, we were able to amass a small fortune for the
795


## PDF 第 25 页

![PDF 第 25 页](images/read_page_25.png)



couple! (138) --------.
London Life
• FINANCIAL PLANNING • STOCKBROKING • PROPERTY • FINANCE', NULL, '[{"id":"A","text":"costs"},{"id":"B","text":"prices"},{"id":"C","text":"charges"},{"id":"D","text":"wages"}]'::jsonb, 136, 1.0)
    RETURNING id INTO v_question_id;
  ELSE
    UPDATE assessment_questions SET
      skill = 'reading',
      category = 'toeic_part_6',
      difficulty = 3,
      level = 'b2',
      prompt = 'Select the best choice to fill in the blank (136) in the passage.',
      context_text = 'Questions 135-138
 refer to the following advertisement.
“A net worth of $2.5 million
in just 4 years using London Life’s
simple wealth strategy”
– Jane Booth and Glenda Jackson – Investment Advisers
If you’re looking to get on the (135) -------- to financial freedom but aren’t
sure of what steps to take or if your existing investment portfolio is not doing its
job and needs a major shake up, then we can help.
Many middle-income earners have expressed their opinions on how difficult
it is to get honest, straightforward, and unbiased advice that supports their
financial goals. According to one couple, they were working hard as teachers and
never thought that they could get ahead on their (136) -------- until they
discovered London Life’s simple (137) -------- effective investing techniques. By
following our simple strategy, we were able to amass a small fortune for the
795


## PDF 第 25 页

![PDF 第 25 页](images/read_page_25.png)



couple! (138) --------.
London Life
• FINANCIAL PLANNING • STOCKBROKING • PROPERTY • FINANCE',
      audio_url = NULL,
      options = '[{"id":"A","text":"costs"},{"id":"B","text":"prices"},{"id":"C","text":"charges"},{"id":"D","text":"wages"}]'::jsonb
    WHERE id = v_question_id;
  END IF;

  -- Answer for #136
  DELETE FROM assessment_question_answers WHERE question_id = v_question_id;
  INSERT INTO assessment_question_answers (question_id, correct_option_id, explanation, transcript_text)
  VALUES (v_question_id, 'D', 'Đáp án đúng: D.

Phân tích ngữ cảnh & từ vựng:
According to one couple, they were working hard as teachers and never
thought that they could get ahead on their ------- until they discovered...
(A) costs (B) prices
(C) charges
(D) wages
→根据前文可推断出这里应该是要描述“从他们的所得(工资)中…”，
故选(D)wages。', NULL);

  -- Question #137 (toeic_part_6)
  SELECT id INTO v_question_id FROM assessment_questions WHERE assessment_id = v_assessment_id AND position = 137;
  IF v_question_id IS NULL THEN
    INSERT INTO assessment_questions (assessment_id, skill, category, difficulty, level, question_type, prompt, context_text, audio_url, options, position, weight)
    VALUES (v_assessment_id, 'reading', 'toeic_part_6', 3, 'b2', 'multiple_choice', 'Select the best choice to fill in the blank (137) in the passage.', 'Questions 135-138
 refer to the following advertisement.
“A net worth of $2.5 million
in just 4 years using London Life’s
simple wealth strategy”
– Jane Booth and Glenda Jackson – Investment Advisers
If you’re looking to get on the (135) -------- to financial freedom but aren’t
sure of what steps to take or if your existing investment portfolio is not doing its
job and needs a major shake up, then we can help.
Many middle-income earners have expressed their opinions on how difficult
it is to get honest, straightforward, and unbiased advice that supports their
financial goals. According to one couple, they were working hard as teachers and
never thought that they could get ahead on their (136) -------- until they
discovered London Life’s simple (137) -------- effective investing techniques. By
following our simple strategy, we were able to amass a small fortune for the
795


## PDF 第 25 页

![PDF 第 25 页](images/read_page_25.png)



couple! (138) --------.
London Life
• FINANCIAL PLANNING • STOCKBROKING • PROPERTY • FINANCE', NULL, '[{"id":"A","text":"once"},{"id":"B","text":"still"},{"id":"C","text":"yet"},{"id":"D","text":"ever"}]'::jsonb, 137, 1.0)
    RETURNING id INTO v_question_id;
  ELSE
    UPDATE assessment_questions SET
      skill = 'reading',
      category = 'toeic_part_6',
      difficulty = 3,
      level = 'b2',
      prompt = 'Select the best choice to fill in the blank (137) in the passage.',
      context_text = 'Questions 135-138
 refer to the following advertisement.
“A net worth of $2.5 million
in just 4 years using London Life’s
simple wealth strategy”
– Jane Booth and Glenda Jackson – Investment Advisers
If you’re looking to get on the (135) -------- to financial freedom but aren’t
sure of what steps to take or if your existing investment portfolio is not doing its
job and needs a major shake up, then we can help.
Many middle-income earners have expressed their opinions on how difficult
it is to get honest, straightforward, and unbiased advice that supports their
financial goals. According to one couple, they were working hard as teachers and
never thought that they could get ahead on their (136) -------- until they
discovered London Life’s simple (137) -------- effective investing techniques. By
following our simple strategy, we were able to amass a small fortune for the
795


## PDF 第 25 页

![PDF 第 25 页](images/read_page_25.png)



couple! (138) --------.
London Life
• FINANCIAL PLANNING • STOCKBROKING • PROPERTY • FINANCE',
      audio_url = NULL,
      options = '[{"id":"A","text":"once"},{"id":"B","text":"still"},{"id":"C","text":"yet"},{"id":"D","text":"ever"}]'::jsonb
    WHERE id = v_question_id;
  END IF;

  -- Answer for #137
  DELETE FROM assessment_question_answers WHERE question_id = v_question_id;
  INSERT INTO assessment_question_answers (question_id, correct_option_id, explanation, transcript_text)
  VALUES (v_question_id, 'C', 'Đáp án đúng: C.

Phân tích ngữ cảnh & từ vựng:
...London Life’s simple ------- effective investing techniques.
(A) once (B) still
1238
```

## PDF 第 468 页

```text
(C) yet
 (D) ever
→simple和effective是具有相对意义的形容词，故选择可作并列连词
的(C)yet。', NULL);

  -- Question #138 (toeic_part_6)
  SELECT id INTO v_question_id FROM assessment_questions WHERE assessment_id = v_assessment_id AND position = 138;
  IF v_question_id IS NULL THEN
    INSERT INTO assessment_questions (assessment_id, skill, category, difficulty, level, question_type, prompt, context_text, audio_url, options, position, weight)
    VALUES (v_assessment_id, 'reading', 'toeic_part_6', 3, 'b2', 'multiple_choice', 'Select the best choice to fill in the blank (138) in the passage.', 'Questions 135-138
 refer to the following advertisement.
“A net worth of $2.5 million
in just 4 years using London Life’s
simple wealth strategy”
– Jane Booth and Glenda Jackson – Investment Advisers
If you’re looking to get on the (135) -------- to financial freedom but aren’t
sure of what steps to take or if your existing investment portfolio is not doing its
job and needs a major shake up, then we can help.
Many middle-income earners have expressed their opinions on how difficult
it is to get honest, straightforward, and unbiased advice that supports their
financial goals. According to one couple, they were working hard as teachers and
never thought that they could get ahead on their (136) -------- until they
discovered London Life’s simple (137) -------- effective investing techniques. By
following our simple strategy, we were able to amass a small fortune for the
795


## PDF 第 25 页

![PDF 第 25 页](images/read_page_25.png)



couple! (138) --------.
London Life
• FINANCIAL PLANNING • STOCKBROKING • PROPERTY • FINANCE', NULL, '[{"id":"A","text":"Now, we can show you how you can amass your fortune."},{"id":"B","text":"People can’t find effective investing techniques."},{"id":"C","text":"Middle-income earners have realized their financial goals."},{"id":"D","text":"The existing investment portfolio does a good job."}]'::jsonb, 138, 1.0)
    RETURNING id INTO v_question_id;
  ELSE
    UPDATE assessment_questions SET
      skill = 'reading',
      category = 'toeic_part_6',
      difficulty = 3,
      level = 'b2',
      prompt = 'Select the best choice to fill in the blank (138) in the passage.',
      context_text = 'Questions 135-138
 refer to the following advertisement.
“A net worth of $2.5 million
in just 4 years using London Life’s
simple wealth strategy”
– Jane Booth and Glenda Jackson – Investment Advisers
If you’re looking to get on the (135) -------- to financial freedom but aren’t
sure of what steps to take or if your existing investment portfolio is not doing its
job and needs a major shake up, then we can help.
Many middle-income earners have expressed their opinions on how difficult
it is to get honest, straightforward, and unbiased advice that supports their
financial goals. According to one couple, they were working hard as teachers and
never thought that they could get ahead on their (136) -------- until they
discovered London Life’s simple (137) -------- effective investing techniques. By
following our simple strategy, we were able to amass a small fortune for the
795


## PDF 第 25 页

![PDF 第 25 页](images/read_page_25.png)



couple! (138) --------.
London Life
• FINANCIAL PLANNING • STOCKBROKING • PROPERTY • FINANCE',
      audio_url = NULL,
      options = '[{"id":"A","text":"Now, we can show you how you can amass your fortune."},{"id":"B","text":"People can’t find effective investing techniques."},{"id":"C","text":"Middle-income earners have realized their financial goals."},{"id":"D","text":"The existing investment portfolio does a good job."}]'::jsonb
    WHERE id = v_question_id;
  END IF;

  -- Answer for #138
  DELETE FROM assessment_question_answers WHERE question_id = v_question_id;
  INSERT INTO assessment_question_answers (question_id, correct_option_id, explanation, transcript_text)
  VALUES (v_question_id, 'A', 'Đáp án đúng: A.

Phân tích ngữ cảnh & từ vựng:
(A) Now, we can show you how you can amass your fortune.
(B) People can’t find effective investing techniques.
(C) Middle-income earners have realized their financial goals.
(D) The existing investment portfolio does a good job.
→上句说该公司使用简单的策略就能解决文中夫妇面临的困境，帮助他
们积累财富。可知，横线处说“现在，我们也可以告诉你怎样积累财富”最
合适，以达到宣传目的，故选(A)。
▼ Vocabulary Check
net
净的
wealth
财富
strategy
策略，战略
investment
投资
adviser
顾问
look to
寻找
get on the path to
通往
…
的道路
financial
金融的，财务的
be sure of
对
…
有把握，确信
…
take steps
采取步骤，采取措施
existing
现有的
investment portfolio
投资业务，投资
组合
1239
```

## PDF 第 469 页

```text
do one’s job
运作；做好自己的工作
shake up
重大调整，重组
middle-income earners
中等收入者
express one’s opinion on
就
…
发表
自己的意见
honest
诚实的，坦率的
straightforward
明确的，直接的
unbiased
没有偏见的
support
帮助，支持
financial goals
财务目标
get ahead on
从
…
中受益；获得成功
effective
有效的
investing technique
投资技术
follow
遵循；跟随
amass
收集，积聚
fortune
财富
property
资产
Questions 139-142
 refer to the following notice.
促进本市自行车运动
自行车是世界上很多城市交通运输系统的重要组成部分。布法罗市认
识到这一点并制订了一个十年计划来促进本市的自行车运动。
这项城市发展计划包括为街道增设更多的自行车道。当然，这样做的
1240
```

## PDF 第 470 页

```text
目的是鼓励市民多使用自行车，以获得与其他大都市一样的效果，例如减
少污染和交通堵塞，同时也有益于市民的健康和社会的进步。
其他计划包括和周边城镇的自行车专用通道连接成网，以及建立一系
列公共项目，为骑车的人提供信息。
我们期待听到您对这些提议的建议。您可以登录我们的网站
www.
cityofbuffalo.gov.us
，或者去当地社区服务中心，或者拨打电话
755-9333
了
解更多信息并提交意见表。', NULL);

  -- Question #139 (toeic_part_6)
  SELECT id INTO v_question_id FROM assessment_questions WHERE assessment_id = v_assessment_id AND position = 139;
  IF v_question_id IS NULL THEN
    INSERT INTO assessment_questions (assessment_id, skill, category, difficulty, level, question_type, prompt, context_text, audio_url, options, position, weight)
    VALUES (v_assessment_id, 'reading', 'toeic_part_6', 3, 'b2', 'multiple_choice', 'Select the best choice to fill in the blank (139) in the passage.', 'Questions 139-142
 refer to the following notice.
Promoting Cycling in our City
796


## PDF 第 26 页

![PDF 第 26 页](images/read_page_26.png)



An essential element of the transportation system in many of the cities
around the world is cycling. The city of Buffalo recognizes this and has
developed a 10-year plan to promote more cycling in our city.
The city’s development plan includes the addition of more cycling (139) ----
---- to our streets. This, of course, is with the intention of encouraging greater
cycling (140) -------- by our citizens in an effort to mimic the benefits other
global cities have experienced, such as the reduction of pollution and traffic
congestion as well as health and social advantages.
Other plans include a (141) -------- network of bicycle lanes to be
interconnected to the surrounding towns as well as the setting up of a number of
social programs to provide information to the cyclists.
(142) --------. Further information and submission forms are available at our
website at:
www.cityofbuffalo.gov.us, by visiting your local Neighborhood Service
Center, or by calling 755-9333.', NULL, '[{"id":"A","text":"admission"},{"id":"B","text":"entrance"},{"id":"C","text":"access"},{"id":"D","text":"pass"}]'::jsonb, 139, 1.0)
    RETURNING id INTO v_question_id;
  ELSE
    UPDATE assessment_questions SET
      skill = 'reading',
      category = 'toeic_part_6',
      difficulty = 3,
      level = 'b2',
      prompt = 'Select the best choice to fill in the blank (139) in the passage.',
      context_text = 'Questions 139-142
 refer to the following notice.
Promoting Cycling in our City
796


## PDF 第 26 页

![PDF 第 26 页](images/read_page_26.png)



An essential element of the transportation system in many of the cities
around the world is cycling. The city of Buffalo recognizes this and has
developed a 10-year plan to promote more cycling in our city.
The city’s development plan includes the addition of more cycling (139) ----
---- to our streets. This, of course, is with the intention of encouraging greater
cycling (140) -------- by our citizens in an effort to mimic the benefits other
global cities have experienced, such as the reduction of pollution and traffic
congestion as well as health and social advantages.
Other plans include a (141) -------- network of bicycle lanes to be
interconnected to the surrounding towns as well as the setting up of a number of
social programs to provide information to the cyclists.
(142) --------. Further information and submission forms are available at our
website at:
www.cityofbuffalo.gov.us, by visiting your local Neighborhood Service
Center, or by calling 755-9333.',
      audio_url = NULL,
      options = '[{"id":"A","text":"admission"},{"id":"B","text":"entrance"},{"id":"C","text":"access"},{"id":"D","text":"pass"}]'::jsonb
    WHERE id = v_question_id;
  END IF;

  -- Answer for #139
  DELETE FROM assessment_question_answers WHERE question_id = v_question_id;
  INSERT INTO assessment_question_answers (question_id, correct_option_id, explanation, transcript_text)
  VALUES (v_question_id, 'C', 'Đáp án đúng: C.

Phân tích ngữ cảnh & từ vựng:
The city’s development plan includes the addition of more cycling ------- to our
streets.
(A) admission (B) entrance
(C) access
 (D) pass
→“更多的自行车道”最符合句意，故选(C)access。access除了“接
近”的意思之外，还包括“入口，通路”的意思，此时主要与to 连用。', NULL);

  -- Question #140 (toeic_part_6)
  SELECT id INTO v_question_id FROM assessment_questions WHERE assessment_id = v_assessment_id AND position = 140;
  IF v_question_id IS NULL THEN
    INSERT INTO assessment_questions (assessment_id, skill, category, difficulty, level, question_type, prompt, context_text, audio_url, options, position, weight)
    VALUES (v_assessment_id, 'reading', 'toeic_part_6', 3, 'b2', 'multiple_choice', 'Select the best choice to fill in the blank (140) in the passage.', 'Questions 139-142
 refer to the following notice.
Promoting Cycling in our City
796


## PDF 第 26 页

![PDF 第 26 页](images/read_page_26.png)



An essential element of the transportation system in many of the cities
around the world is cycling. The city of Buffalo recognizes this and has
developed a 10-year plan to promote more cycling in our city.
The city’s development plan includes the addition of more cycling (139) ----
---- to our streets. This, of course, is with the intention of encouraging greater
cycling (140) -------- by our citizens in an effort to mimic the benefits other
global cities have experienced, such as the reduction of pollution and traffic
congestion as well as health and social advantages.
Other plans include a (141) -------- network of bicycle lanes to be
interconnected to the surrounding towns as well as the setting up of a number of
social programs to provide information to the cyclists.
(142) --------. Further information and submission forms are available at our
website at:
www.cityofbuffalo.gov.us, by visiting your local Neighborhood Service
Center, or by calling 755-9333.', NULL, '[{"id":"A","text":"participate"},{"id":"B","text":"participation"},{"id":"C","text":"participates"},{"id":"D","text":"participated"}]'::jsonb, 140, 1.0)
    RETURNING id INTO v_question_id;
  ELSE
    UPDATE assessment_questions SET
      skill = 'reading',
      category = 'toeic_part_6',
      difficulty = 3,
      level = 'b2',
      prompt = 'Select the best choice to fill in the blank (140) in the passage.',
      context_text = 'Questions 139-142
 refer to the following notice.
Promoting Cycling in our City
796


## PDF 第 26 页

![PDF 第 26 页](images/read_page_26.png)



An essential element of the transportation system in many of the cities
around the world is cycling. The city of Buffalo recognizes this and has
developed a 10-year plan to promote more cycling in our city.
The city’s development plan includes the addition of more cycling (139) ----
---- to our streets. This, of course, is with the intention of encouraging greater
cycling (140) -------- by our citizens in an effort to mimic the benefits other
global cities have experienced, such as the reduction of pollution and traffic
congestion as well as health and social advantages.
Other plans include a (141) -------- network of bicycle lanes to be
interconnected to the surrounding towns as well as the setting up of a number of
social programs to provide information to the cyclists.
(142) --------. Further information and submission forms are available at our
website at:
www.cityofbuffalo.gov.us, by visiting your local Neighborhood Service
Center, or by calling 755-9333.',
      audio_url = NULL,
      options = '[{"id":"A","text":"participate"},{"id":"B","text":"participation"},{"id":"C","text":"participates"},{"id":"D","text":"participated"}]'::jsonb
    WHERE id = v_question_id;
  END IF;

  -- Answer for #140
  DELETE FROM assessment_question_answers WHERE question_id = v_question_id;
  INSERT INTO assessment_question_answers (question_id, correct_option_id, explanation, transcript_text)
  VALUES (v_question_id, 'B', 'Đáp án đúng: B.

Phân tích ngữ cảnh & từ vựng:
This, of course, is with the intention of encouraging greater cycling ------- by
our citizens in an effort to mimic the benefits other global cities have experienced...
(A) participate
(B) participation
(C) participates (D) participated
→横线处所填单词受形容词比较级greater修饰，充当encouraging的宾
语，故选名词(B)participation。', NULL);

  -- Question #141 (toeic_part_6)
  SELECT id INTO v_question_id FROM assessment_questions WHERE assessment_id = v_assessment_id AND position = 141;
  IF v_question_id IS NULL THEN
    INSERT INTO assessment_questions (assessment_id, skill, category, difficulty, level, question_type, prompt, context_text, audio_url, options, position, weight)
    VALUES (v_assessment_id, 'reading', 'toeic_part_6', 3, 'b2', 'multiple_choice', 'Select the best choice to fill in the blank (141) in the passage.', 'Questions 139-142
 refer to the following notice.
Promoting Cycling in our City
796


## PDF 第 26 页

![PDF 第 26 页](images/read_page_26.png)



An essential element of the transportation system in many of the cities
around the world is cycling. The city of Buffalo recognizes this and has
developed a 10-year plan to promote more cycling in our city.
The city’s development plan includes the addition of more cycling (139) ----
---- to our streets. This, of course, is with the intention of encouraging greater
cycling (140) -------- by our citizens in an effort to mimic the benefits other
global cities have experienced, such as the reduction of pollution and traffic
congestion as well as health and social advantages.
Other plans include a (141) -------- network of bicycle lanes to be
interconnected to the surrounding towns as well as the setting up of a number of
social programs to provide information to the cyclists.
(142) --------. Further information and submission forms are available at our
website at:
www.cityofbuffalo.gov.us, by visiting your local Neighborhood Service
Center, or by calling 755-9333.', NULL, '[{"id":"A","text":"coordination"},{"id":"B","text":"coordinating"},{"id":"C","text":"coordinated"},{"id":"D","text":"coordinates"}]'::jsonb, 141, 1.0)
    RETURNING id INTO v_question_id;
  ELSE
    UPDATE assessment_questions SET
      skill = 'reading',
      category = 'toeic_part_6',
      difficulty = 3,
      level = 'b2',
      prompt = 'Select the best choice to fill in the blank (141) in the passage.',
      context_text = 'Questions 139-142
 refer to the following notice.
Promoting Cycling in our City
796


## PDF 第 26 页

![PDF 第 26 页](images/read_page_26.png)



An essential element of the transportation system in many of the cities
around the world is cycling. The city of Buffalo recognizes this and has
developed a 10-year plan to promote more cycling in our city.
The city’s development plan includes the addition of more cycling (139) ----
---- to our streets. This, of course, is with the intention of encouraging greater
cycling (140) -------- by our citizens in an effort to mimic the benefits other
global cities have experienced, such as the reduction of pollution and traffic
congestion as well as health and social advantages.
Other plans include a (141) -------- network of bicycle lanes to be
interconnected to the surrounding towns as well as the setting up of a number of
social programs to provide information to the cyclists.
(142) --------. Further information and submission forms are available at our
website at:
www.cityofbuffalo.gov.us, by visiting your local Neighborhood Service
Center, or by calling 755-9333.',
      audio_url = NULL,
      options = '[{"id":"A","text":"coordination"},{"id":"B","text":"coordinating"},{"id":"C","text":"coordinated"},{"id":"D","text":"coordinates"}]'::jsonb
    WHERE id = v_question_id;
  END IF;

  -- Answer for #141
  DELETE FROM assessment_question_answers WHERE question_id = v_question_id;
  INSERT INTO assessment_question_answers (question_id, correct_option_id, explanation, transcript_text)
  VALUES (v_question_id, 'C', 'Đáp án đúng: C.

Phân tích ngữ cảnh & từ vựng:
Other plans include a ------ network of bicycle lanes to be interconnected to
the surrounding towns as well as the setting up of a number of social programs to
provide information to the cyclists.
(A) coordination (B) coordinating
(C) coordinated
 (D) coordinates
→横线处所填单词修饰名词network，应填用作形容词的过去分词，故
选(C)。', NULL);

  -- Question #142 (toeic_part_6)
  SELECT id INTO v_question_id FROM assessment_questions WHERE assessment_id = v_assessment_id AND position = 142;
  IF v_question_id IS NULL THEN
    INSERT INTO assessment_questions (assessment_id, skill, category, difficulty, level, question_type, prompt, context_text, audio_url, options, position, weight)
    VALUES (v_assessment_id, 'reading', 'toeic_part_6', 3, 'b2', 'multiple_choice', 'Select the best choice to fill in the blank (142) in the passage.', 'Questions 139-142
 refer to the following notice.
Promoting Cycling in our City
796


## PDF 第 26 页

![PDF 第 26 页](images/read_page_26.png)



An essential element of the transportation system in many of the cities
around the world is cycling. The city of Buffalo recognizes this and has
developed a 10-year plan to promote more cycling in our city.
The city’s development plan includes the addition of more cycling (139) ----
---- to our streets. This, of course, is with the intention of encouraging greater
cycling (140) -------- by our citizens in an effort to mimic the benefits other
global cities have experienced, such as the reduction of pollution and traffic
congestion as well as health and social advantages.
Other plans include a (141) -------- network of bicycle lanes to be
interconnected to the surrounding towns as well as the setting up of a number of
social programs to provide information to the cyclists.
(142) --------. Further information and submission forms are available at our
website at:
www.cityofbuffalo.gov.us, by visiting your local Neighborhood Service
Center, or by calling 755-9333.', NULL, '[{"id":"A","text":"Few people have realized the significance of cycling."},{"id":"B","text":"Cycling is beneficial to environmental protection."},{"id":"C","text":"Nowadays, more and more people like cycling in big cities."},{"id":"D","text":"The city wishes to hear your thoughts about its proposals."}]'::jsonb, 142, 1.0)
    RETURNING id INTO v_question_id;
  ELSE
    UPDATE assessment_questions SET
      skill = 'reading',
      category = 'toeic_part_6',
      difficulty = 3,
      level = 'b2',
      prompt = 'Select the best choice to fill in the blank (142) in the passage.',
      context_text = 'Questions 139-142
 refer to the following notice.
Promoting Cycling in our City
796


## PDF 第 26 页

![PDF 第 26 页](images/read_page_26.png)



An essential element of the transportation system in many of the cities
around the world is cycling. The city of Buffalo recognizes this and has
developed a 10-year plan to promote more cycling in our city.
The city’s development plan includes the addition of more cycling (139) ----
---- to our streets. This, of course, is with the intention of encouraging greater
cycling (140) -------- by our citizens in an effort to mimic the benefits other
global cities have experienced, such as the reduction of pollution and traffic
congestion as well as health and social advantages.
Other plans include a (141) -------- network of bicycle lanes to be
interconnected to the surrounding towns as well as the setting up of a number of
social programs to provide information to the cyclists.
(142) --------. Further information and submission forms are available at our
website at:
www.cityofbuffalo.gov.us, by visiting your local Neighborhood Service
Center, or by calling 755-9333.',
      audio_url = NULL,
      options = '[{"id":"A","text":"Few people have realized the significance of cycling."},{"id":"B","text":"Cycling is beneficial to environmental protection."},{"id":"C","text":"Nowadays, more and more people like cycling in big cities."},{"id":"D","text":"The city wishes to hear your thoughts about its proposals."}]'::jsonb
    WHERE id = v_question_id;
  END IF;

  -- Answer for #142
  DELETE FROM assessment_question_answers WHERE question_id = v_question_id;
  INSERT INTO assessment_question_answers (question_id, correct_option_id, explanation, transcript_text)
  VALUES (v_question_id, 'D', 'Đáp án đúng: D.

Phân tích ngữ cảnh & từ vựng:
(A) Few people have realized the significance of cycling.
1241
```

## PDF 第 471 页

```text
(B) Cycling is beneficial to environmental protection.
(C) Nowadays, more and more people like cycling in big cities.
(D) The city wishes to hear your thoughts about its proposals.
→下句提到“提交表格”，可知，横线处应填与“搜集公众建议”有关
的信息，故选(D)。
▼ Vocabulary Check
promote
促进
cycling
自行车运动
essential
必要的，必不可少的
element
组成部分，成分
transportation
运输，交通
recognize
认识到
develop
发展，开发
development plan
发展计划
include
包括，包含
addition
增加，添加
access
通路，进入
intention
目的，意图
encourage
鼓励，支持，激励
participation
参与，参加
in an effort to do
努力做某事
mimic
模仿；像，似
benefit
好处，益处
1242
```

## PDF 第 472 页

```text
experience
经历
such as
例如
reduction
缩小，减少，降低
pollution
污染
traffic congestion
交通堵塞
advantage
优点，优势；有利条件
coordinate
使协调，使搭配
interconnect
使互相连接
surrounding
周围的
setting up
建立，创立
a number of
若干，一些，许多
provide
提供
proposal
建议，提议
further
更多的，进一步的
submission
提交，递呈
form
表单，表格
available
可获得的
Questions 143-146
 refer to the following e-mail.
发件人：乔纳森
·
王［
mailto:jonathan.wong@hydetransport.com
］
发送时间：
2018
年
10
月
29
日，周一，上午
11:07
收件人：约翰
·
德弗罗；史蒂夫
·
特雷西；布雷恩
·
基布尔
抄送：阿尔弗莱德
·
陈；珍妮
·
李
1243
```

## PDF 第 473 页

```text
主题：访问全球物流公司
致全球物流公司：
我谨代表阿尔弗莱德
·
陈和台湾海德物流，对我们在访问全球物流公
司期间所受到的热情款待表示感谢。很荣幸能与你们见面并见识了你们的
运作和设备。你们的安全设备和技术投资给我们留下了深刻印象。
正如之前所谈到的，为了表示感谢，我们真诚地邀请你们在不久的将
来能访问台北。请在确定行程之后通知我。
第二步，我公司也希望进一步探索和贵公司的商业合作机会。作为你
们全球扩展计划的一部分，我们若能在台湾成为商业合作伙伴，双方都能
获得增效和利益。
再次感谢贵公司，期待你们的回信。
祝好！
计划部主任
乔纳森
·
王', NULL);

  -- Question #143 (toeic_part_6)
  SELECT id INTO v_question_id FROM assessment_questions WHERE assessment_id = v_assessment_id AND position = 143;
  IF v_question_id IS NULL THEN
    INSERT INTO assessment_questions (assessment_id, skill, category, difficulty, level, question_type, prompt, context_text, audio_url, options, position, weight)
    VALUES (v_assessment_id, 'reading', 'toeic_part_6', 3, 'b2', 'multiple_choice', 'Select the best choice to fill in the blank (143) in the passage.', 'Questions 143-146
 refer to the following email.', NULL, '[{"id":"A","text":"We were very happy to sign a commercial"},{"id":"B","text":"It was a pleasure meeting all of you and"},{"id":"C","text":"It was a great pity that our company did"},{"id":"D","text":"We cannot wait to sincerely cooperate"}]'::jsonb, 143, 1.0)
    RETURNING id INTO v_question_id;
  ELSE
    UPDATE assessment_questions SET
      skill = 'reading',
      category = 'toeic_part_6',
      difficulty = 3,
      level = 'b2',
      prompt = 'Select the best choice to fill in the blank (143) in the passage.',
      context_text = 'Questions 143-146
 refer to the following email.',
      audio_url = NULL,
      options = '[{"id":"A","text":"We were very happy to sign a commercial"},{"id":"B","text":"It was a pleasure meeting all of you and"},{"id":"C","text":"It was a great pity that our company did"},{"id":"D","text":"We cannot wait to sincerely cooperate"}]'::jsonb
    WHERE id = v_question_id;
  END IF;

  -- Answer for #143
  DELETE FROM assessment_question_answers WHERE question_id = v_question_id;
  INSERT INTO assessment_question_answers (question_id, correct_option_id, explanation, transcript_text)
  VALUES (v_question_id, 'B', 'Đáp án đúng: B.

Phân tích ngữ cảnh & từ vựng:
(A) We were very happy to sign a commercial contract with you.
(B) It was a pleasure meeting all of you and seeing your operations and setup.
(C) It was a great pity that our company did not do a good job last quarter.
(D) We cannot wait to sincerely cooperate with your company in the near
future.
→上句描述发件人作为宾客表达对招待方的感激之情，下句赞美招待方
的安全设备和技术投资。故横线处说“很荣幸能与你们见面并见识了你们的
运作和设备”最恰当。选项(B)为正确答案。', NULL);

  -- Question #144 (toeic_part_6)
  SELECT id INTO v_question_id FROM assessment_questions WHERE assessment_id = v_assessment_id AND position = 144;
  IF v_question_id IS NULL THEN
    INSERT INTO assessment_questions (assessment_id, skill, category, difficulty, level, question_type, prompt, context_text, audio_url, options, position, weight)
    VALUES (v_assessment_id, 'reading', 'toeic_part_6', 3, 'b2', 'multiple_choice', 'Select the best choice to fill in the blank (144) in the passage.', 'Questions 143-146
 refer to the following email.', NULL, '[{"id":"A","text":"secure"},{"id":"B","text":"secured"},{"id":"C","text":"securely"},{"id":"D","text":"to secure"}]'::jsonb, 144, 1.0)
    RETURNING id INTO v_question_id;
  ELSE
    UPDATE assessment_questions SET
      skill = 'reading',
      category = 'toeic_part_6',
      difficulty = 3,
      level = 'b2',
      prompt = 'Select the best choice to fill in the blank (144) in the passage.',
      context_text = 'Questions 143-146
 refer to the following email.',
      audio_url = NULL,
      options = '[{"id":"A","text":"secure"},{"id":"B","text":"secured"},{"id":"C","text":"securely"},{"id":"D","text":"to secure"}]'::jsonb
    WHERE id = v_question_id;
  END IF;

  -- Answer for #144
  DELETE FROM assessment_question_answers WHERE question_id = v_question_id;
  INSERT INTO assessment_question_answers (question_id, correct_option_id, explanation, transcript_text)
  VALUES (v_question_id, 'A', 'Đáp án đúng: A.

Phân tích ngữ cảnh & từ vựng:
We were very impressed with your ------- facility and your investment in
technology.
(A) secure
 (B) secured
(C) securely (D) to secure
1244
```

## PDF 第 474 页

```text
→横线处所填单词修饰facility，故形容词(A)secure为正确答案。', NULL);

  -- Question #145 (toeic_part_6)
  SELECT id INTO v_question_id FROM assessment_questions WHERE assessment_id = v_assessment_id AND position = 145;
  IF v_question_id IS NULL THEN
    INSERT INTO assessment_questions (assessment_id, skill, category, difficulty, level, question_type, prompt, context_text, audio_url, options, position, weight)
    VALUES (v_assessment_id, 'reading', 'toeic_part_6', 3, 'b2', 'multiple_choice', 'Select the best choice to fill in the blank (145) in the passage.', 'Questions 143-146
 refer to the following email.', NULL, '[{"id":"A","text":"prevalent"},{"id":"B","text":"surfacing"},{"id":"C","text":"foreseeable"},{"id":"D","text":"ongoing"}]'::jsonb, 145, 1.0)
    RETURNING id INTO v_question_id;
  ELSE
    UPDATE assessment_questions SET
      skill = 'reading',
      category = 'toeic_part_6',
      difficulty = 3,
      level = 'b2',
      prompt = 'Select the best choice to fill in the blank (145) in the passage.',
      context_text = 'Questions 143-146
 refer to the following email.',
      audio_url = NULL,
      options = '[{"id":"A","text":"prevalent"},{"id":"B","text":"surfacing"},{"id":"C","text":"foreseeable"},{"id":"D","text":"ongoing"}]'::jsonb
    WHERE id = v_question_id;
  END IF;

  -- Answer for #145
  DELETE FROM assessment_question_answers WHERE question_id = v_question_id;
  INSERT INTO assessment_question_answers (question_id, correct_option_id, explanation, transcript_text)
  VALUES (v_question_id, 'C', 'Đáp án đúng: C.

Phân tích ngữ cảnh & từ vựng:
As we discussed, we would like to extend our gratitude by inviting you to
Taipei when you are available in the ------- future.
(A) prevalent (B) surfacing
(C) foreseeable
 (D) ongoing
→选择可与future搭配的形容词，故选(C)foreseeable。in the
foreseeable future = in the near future(在不久的将来，近期)。', NULL);

  -- Question #146 (toeic_part_6)
  SELECT id INTO v_question_id FROM assessment_questions WHERE assessment_id = v_assessment_id AND position = 146;
  IF v_question_id IS NULL THEN
    INSERT INTO assessment_questions (assessment_id, skill, category, difficulty, level, question_type, prompt, context_text, audio_url, options, position, weight)
    VALUES (v_assessment_id, 'reading', 'toeic_part_6', 3, 'b2', 'multiple_choice', 'Select the best choice to fill in the blank (146) in the passage.', 'Questions 143-146
 refer to the following email.', NULL, '[{"id":"A","text":"tourism"},{"id":"B","text":"trip"},{"id":"C","text":"talk"},{"id":"D","text":"request"}]'::jsonb, 146, 1.0)
    RETURNING id INTO v_question_id;
  ELSE
    UPDATE assessment_questions SET
      skill = 'reading',
      category = 'toeic_part_6',
      difficulty = 3,
      level = 'b2',
      prompt = 'Select the best choice to fill in the blank (146) in the passage.',
      context_text = 'Questions 143-146
 refer to the following email.',
      audio_url = NULL,
      options = '[{"id":"A","text":"tourism"},{"id":"B","text":"trip"},{"id":"C","text":"talk"},{"id":"D","text":"request"}]'::jsonb
    WHERE id = v_question_id;
  END IF;

  -- Answer for #146
  DELETE FROM assessment_question_answers WHERE question_id = v_question_id;
  INSERT INTO assessment_question_answers (question_id, correct_option_id, explanation, transcript_text)
  VALUES (v_question_id, 'B', 'Đáp án đúng: B.

Phân tích ngữ cảnh & từ vựng:
Please let me know when you would like to schedule your -------.
(A) tourism
(B) trip
(C) talk (D) request
→上一句已经提示了想邀请对方到台北的想法，故横线处选择(B)trip
与其对应。tourism指“旅游业”。
▼ Vocabulary Check
on behalf of
代表
…
would like to do
愿意
/
意欲做某事
hospitality
款待；亲切，殷勤
operation
运转，运作
setup
设备，装备
be impressed with
对
…
印象深刻
secure
安全的；可靠的
facility
设施，设备
investment
投资
extend one’s gratitude
表达某人的感激之情
in the foreseeable future(=in the near future)
在可以预见的未来，在不久
1245
```

## PDF 第 475 页

```text
的将来
explore
探索
expand
扩展，发展
(
业务
)
synergy
增效作用，协同作用
advantage
利益；有利条件，优势
pursue
追求，致力于
business partnership
商业伙伴关系
look forward to
期待，盼望
response
回答，答复
Questions 147-150
 refer to the following letter.
2018
年
10
月
20
日
乔
·
费尔南德斯

先生
米德兰大街
1385
号
底特律，密歇根
亲爱的乔
·
费尔南德斯先生：
作为董事长，我很自豪地宣布本周五是我们乡村俱乐部成立
30
周年纪
念日，在过去的
30
年中，我们取得了巨大成功。所以，我们将为此举办一
个庆祝晚会。我们已经在猎鹰酒店预订了大堂，本周五晚
7
点将在那里举
办晚宴和舞会。
在这个特殊的夜晚，新会员将有机会聆听老会员的意见，并和老会员
在轻松的氛围中交流想法。将要继承我们的传统的新会员应该听一听老会
员的想法。
此外，晚餐将会非常丰盛。过去参加其他宴会时，我曾有幸在这家酒
店用过几次餐，这里的美味佳肴让我决定在这里举办我们的晚宴。我深信
我们所有的会员都会和我一样对这里的美食赞不绝口。不管怎样，我希望
1246
```

## PDF 第 476 页

```text
本周五我们所有的会员都能放松心情，好好享受。
因此，写这封信是为了正式邀请您和您的配偶或其他贵宾能出席这个
值得纪念的庆祝会。
若您不能出席，请通知我们。
真诚的，
杰夫
·
康奈利', NULL);

  -- Question #147 (toeic_part_7)
  SELECT id INTO v_question_id FROM assessment_questions WHERE assessment_id = v_assessment_id AND position = 147;
  IF v_question_id IS NULL THEN
    INSERT INTO assessment_questions (assessment_id, skill, category, difficulty, level, question_type, prompt, context_text, audio_url, options, position, weight)
    VALUES (v_assessment_id, 'reading', 'toeic_part_7', 3, 'b2', 'multiple_choice', 'What is the main purpose of this letter? 800 ``` ## PDF 第 30 页 ![PDF 第 30 页](images/read_page_30.png) ```text', 'Questions 147-150
 refer to the following letter.
October 20, 2018
Mr. Joe Fernandez
1385 Midland Ave.
Detroit, Michigan
Dear Mr. Fernandez,
As the president, I am proud to announce that this Friday marks the 30th
anniversary of our long and successful running country club. This, of course, calls
for a night of celebration. And for this reason, we have reserved the Grand Hall
at the Falcon Hotel this Friday at 7 p.m. for a night of fine dining and dancing. —
[1]—
On this special evening, the newest members of our club will get an
opportunity to listen to the thoughts of our older members and exchange ideas in
an informal atmosphere. —[2]—
Further, the food will be superb. —[3]— I’ve had a chance to dine at the
hotel several times in the past in other functions, and it was the food that
convinced me to hold our event there. I am quite certain that all of our members
will share my feeling. —[4]— Anyhow, I am looking forward to this Friday when
all of our members can let loose and have some fun.
Therefore, this is a letter officially to invite you and your spouse or
significant other to join us on this memorable evening.
Please let us know if you can’t attend.
Yours sincerely,
Jeff Connelly', NULL, '[{"id":"A","text":"To provide information about the club’s history"},{"id":"B","text":"To notify the members of a yearly meeting"},{"id":"C","text":"To welcome the newest member to the club"},{"id":"D","text":"To invite the members to an upcoming event"}]'::jsonb, 147, 1.0)
    RETURNING id INTO v_question_id;
  ELSE
    UPDATE assessment_questions SET
      skill = 'reading',
      category = 'toeic_part_7',
      difficulty = 3,
      level = 'b2',
      prompt = 'What is the main purpose of this letter? 800 ``` ## PDF 第 30 页 ![PDF 第 30 页](images/read_page_30.png) ```text',
      context_text = 'Questions 147-150
 refer to the following letter.
October 20, 2018
Mr. Joe Fernandez
1385 Midland Ave.
Detroit, Michigan
Dear Mr. Fernandez,
As the president, I am proud to announce that this Friday marks the 30th
anniversary of our long and successful running country club. This, of course, calls
for a night of celebration. And for this reason, we have reserved the Grand Hall
at the Falcon Hotel this Friday at 7 p.m. for a night of fine dining and dancing. —
[1]—
On this special evening, the newest members of our club will get an
opportunity to listen to the thoughts of our older members and exchange ideas in
an informal atmosphere. —[2]—
Further, the food will be superb. —[3]— I’ve had a chance to dine at the
hotel several times in the past in other functions, and it was the food that
convinced me to hold our event there. I am quite certain that all of our members
will share my feeling. —[4]— Anyhow, I am looking forward to this Friday when
all of our members can let loose and have some fun.
Therefore, this is a letter officially to invite you and your spouse or
significant other to join us on this memorable evening.
Please let us know if you can’t attend.
Yours sincerely,
Jeff Connelly',
      audio_url = NULL,
      options = '[{"id":"A","text":"To provide information about the club’s history"},{"id":"B","text":"To notify the members of a yearly meeting"},{"id":"C","text":"To welcome the newest member to the club"},{"id":"D","text":"To invite the members to an upcoming event"}]'::jsonb
    WHERE id = v_question_id;
  END IF;

  -- Answer for #147
  DELETE FROM assessment_question_answers WHERE question_id = v_question_id;
  INSERT INTO assessment_question_answers (question_id, correct_option_id, explanation, transcript_text)
  VALUES (v_question_id, 'D', 'Đáp án đúng: D.

Phân tích bài đọc & dẫn chứng:
What is the main purpose of this letter?
(A) To provide information about the club’s history
(B) To notify the members of a yearly meeting
(C) To welcome the newest member to the club
(D) To invite the members to an upcoming event
这封信的主要目的是什么？
(A)
介绍俱乐部的历史
(B)
通知会员参加年会
(C)
欢迎新会员入会
(D)
邀请会员参加一个即将举行的庆典
→一般在信件的开头和结尾都会叙述写信的目的。此信件为乡村俱乐部
30周年庆的邀请函。故答案为(D)。', NULL);

  -- Question #148 (toeic_part_7)
  SELECT id INTO v_question_id FROM assessment_questions WHERE assessment_id = v_assessment_id AND position = 148;
  IF v_question_id IS NULL THEN
    INSERT INTO assessment_questions (assessment_id, skill, category, difficulty, level, question_type, prompt, context_text, audio_url, options, position, weight)
    VALUES (v_assessment_id, 'reading', 'toeic_part_7', 3, 'b2', 'multiple_choice', 'Which of the following will NOT be part of the event?', 'Questions 147-150
 refer to the following letter.
October 20, 2018
Mr. Joe Fernandez
1385 Midland Ave.
Detroit, Michigan
Dear Mr. Fernandez,
As the president, I am proud to announce that this Friday marks the 30th
anniversary of our long and successful running country club. This, of course, calls
for a night of celebration. And for this reason, we have reserved the Grand Hall
at the Falcon Hotel this Friday at 7 p.m. for a night of fine dining and dancing. —
[1]—
On this special evening, the newest members of our club will get an
opportunity to listen to the thoughts of our older members and exchange ideas in
an informal atmosphere. —[2]—
Further, the food will be superb. —[3]— I’ve had a chance to dine at the
hotel several times in the past in other functions, and it was the food that
convinced me to hold our event there. I am quite certain that all of our members
will share my feeling. —[4]— Anyhow, I am looking forward to this Friday when
all of our members can let loose and have some fun.
Therefore, this is a letter officially to invite you and your spouse or
significant other to join us on this memorable evening.
Please let us know if you can’t attend.
Yours sincerely,
Jeff Connelly', NULL, '[{"id":"A","text":"Discussions"},{"id":"B","text":"Entertainment"},{"id":"C","text":"Presentations"},{"id":"D","text":"Dinner"}]'::jsonb, 148, 1.0)
    RETURNING id INTO v_question_id;
  ELSE
    UPDATE assessment_questions SET
      skill = 'reading',
      category = 'toeic_part_7',
      difficulty = 3,
      level = 'b2',
      prompt = 'Which of the following will NOT be part of the event?',
      context_text = 'Questions 147-150
 refer to the following letter.
October 20, 2018
Mr. Joe Fernandez
1385 Midland Ave.
Detroit, Michigan
Dear Mr. Fernandez,
As the president, I am proud to announce that this Friday marks the 30th
anniversary of our long and successful running country club. This, of course, calls
for a night of celebration. And for this reason, we have reserved the Grand Hall
at the Falcon Hotel this Friday at 7 p.m. for a night of fine dining and dancing. —
[1]—
On this special evening, the newest members of our club will get an
opportunity to listen to the thoughts of our older members and exchange ideas in
an informal atmosphere. —[2]—
Further, the food will be superb. —[3]— I’ve had a chance to dine at the
hotel several times in the past in other functions, and it was the food that
convinced me to hold our event there. I am quite certain that all of our members
will share my feeling. —[4]— Anyhow, I am looking forward to this Friday when
all of our members can let loose and have some fun.
Therefore, this is a letter officially to invite you and your spouse or
significant other to join us on this memorable evening.
Please let us know if you can’t attend.
Yours sincerely,
Jeff Connelly',
      audio_url = NULL,
      options = '[{"id":"A","text":"Discussions"},{"id":"B","text":"Entertainment"},{"id":"C","text":"Presentations"},{"id":"D","text":"Dinner"}]'::jsonb
    WHERE id = v_question_id;
  END IF;

  -- Answer for #148
  DELETE FROM assessment_question_answers WHERE question_id = v_question_id;
  INSERT INTO assessment_question_answers (question_id, correct_option_id, explanation, transcript_text)
  VALUES (v_question_id, 'C', 'Đáp án đúng: C.

Phân tích bài đọc & dẫn chứng:
Which of the following will NOT be part of the event?
(A) Discussions (B) Entertainment
(C) Presentations (D) Dinner
以下哪一项不属于本次庆典的活动？
(A)
讨论
 (B)
娱乐
1247
```

## PDF 第 477 页

```text
(C)
报告
 (D)
晚宴
→庆祝会的内容包括：在轻松的氛围中分享会员的意见及建议(A)、舞
会(B)和聚餐(D)。故答案为(C)。', NULL);

  -- Question #149 (toeic_part_7)
  SELECT id INTO v_question_id FROM assessment_questions WHERE assessment_id = v_assessment_id AND position = 149;
  IF v_question_id IS NULL THEN
    INSERT INTO assessment_questions (assessment_id, skill, category, difficulty, level, question_type, prompt, context_text, audio_url, options, position, weight)
    VALUES (v_assessment_id, 'reading', 'toeic_part_7', 3, 'b2', 'multiple_choice', 'According to Mr. Connelly, what led him to hold the event there?', 'Questions 147-150
 refer to the following letter.
October 20, 2018
Mr. Joe Fernandez
1385 Midland Ave.
Detroit, Michigan
Dear Mr. Fernandez,
As the president, I am proud to announce that this Friday marks the 30th
anniversary of our long and successful running country club. This, of course, calls
for a night of celebration. And for this reason, we have reserved the Grand Hall
at the Falcon Hotel this Friday at 7 p.m. for a night of fine dining and dancing. —
[1]—
On this special evening, the newest members of our club will get an
opportunity to listen to the thoughts of our older members and exchange ideas in
an informal atmosphere. —[2]—
Further, the food will be superb. —[3]— I’ve had a chance to dine at the
hotel several times in the past in other functions, and it was the food that
convinced me to hold our event there. I am quite certain that all of our members
will share my feeling. —[4]— Anyhow, I am looking forward to this Friday when
all of our members can let loose and have some fun.
Therefore, this is a letter officially to invite you and your spouse or
significant other to join us on this memorable evening.
Please let us know if you can’t attend.
Yours sincerely,
Jeff Connelly', NULL, '[{"id":"A","text":"It has become a tradition at the club."},{"id":"B","text":"He has special ties with the hotel staff."},{"id":"C","text":"The hotel is located close to the club."},{"id":"D","text":"He was impressed with its menu."}]'::jsonb, 149, 1.0)
    RETURNING id INTO v_question_id;
  ELSE
    UPDATE assessment_questions SET
      skill = 'reading',
      category = 'toeic_part_7',
      difficulty = 3,
      level = 'b2',
      prompt = 'According to Mr. Connelly, what led him to hold the event there?',
      context_text = 'Questions 147-150
 refer to the following letter.
October 20, 2018
Mr. Joe Fernandez
1385 Midland Ave.
Detroit, Michigan
Dear Mr. Fernandez,
As the president, I am proud to announce that this Friday marks the 30th
anniversary of our long and successful running country club. This, of course, calls
for a night of celebration. And for this reason, we have reserved the Grand Hall
at the Falcon Hotel this Friday at 7 p.m. for a night of fine dining and dancing. —
[1]—
On this special evening, the newest members of our club will get an
opportunity to listen to the thoughts of our older members and exchange ideas in
an informal atmosphere. —[2]—
Further, the food will be superb. —[3]— I’ve had a chance to dine at the
hotel several times in the past in other functions, and it was the food that
convinced me to hold our event there. I am quite certain that all of our members
will share my feeling. —[4]— Anyhow, I am looking forward to this Friday when
all of our members can let loose and have some fun.
Therefore, this is a letter officially to invite you and your spouse or
significant other to join us on this memorable evening.
Please let us know if you can’t attend.
Yours sincerely,
Jeff Connelly',
      audio_url = NULL,
      options = '[{"id":"A","text":"It has become a tradition at the club."},{"id":"B","text":"He has special ties with the hotel staff."},{"id":"C","text":"The hotel is located close to the club."},{"id":"D","text":"He was impressed with its menu."}]'::jsonb
    WHERE id = v_question_id;
  END IF;

  -- Answer for #149
  DELETE FROM assessment_question_answers WHERE question_id = v_question_id;
  INSERT INTO assessment_question_answers (question_id, correct_option_id, explanation, transcript_text)
  VALUES (v_question_id, 'D', 'Đáp án đúng: D.

Phân tích bài đọc & dẫn chứng:
According to Mr. Connelly, what led him to hold the event there?
(A) It has become a tradition at the club.
(B) He has special ties with the hotel staff.
(C) The hotel is located close to the club.
(D) He was impressed with its menu.
根据康奈利先生的说法，是什么让他在猎鹰酒店举办此次庆典的？
(A)
这已成为俱乐部的传统。
(B)
他和酒店员工有特殊关系。
(C)
酒店离俱乐部很近。
(D)
他对酒店的美食印象深刻。
→康奈利先生以前参加别的活动时发现这里的菜非常棒，所以将这家酒
店定为这次的庆典地点。故答案为(D)。', NULL);

  -- Question #150 (toeic_part_7)
  SELECT id INTO v_question_id FROM assessment_questions WHERE assessment_id = v_assessment_id AND position = 150;
  IF v_question_id IS NULL THEN
    INSERT INTO assessment_questions (assessment_id, skill, category, difficulty, level, question_type, prompt, context_text, audio_url, options, position, weight)
    VALUES (v_assessment_id, 'reading', 'toeic_part_7', 3, 'b2', 'multiple_choice', 'In which of the positions marked [1], [2], [3], and [4] does the following sentence best belong? “The newest members, who will be carrying on our tradition, should hear what the older members have to say.”', 'Questions 147-150
 refer to the following letter.
October 20, 2018
Mr. Joe Fernandez
1385 Midland Ave.
Detroit, Michigan
Dear Mr. Fernandez,
As the president, I am proud to announce that this Friday marks the 30th
anniversary of our long and successful running country club. This, of course, calls
for a night of celebration. And for this reason, we have reserved the Grand Hall
at the Falcon Hotel this Friday at 7 p.m. for a night of fine dining and dancing. —
[1]—
On this special evening, the newest members of our club will get an
opportunity to listen to the thoughts of our older members and exchange ideas in
an informal atmosphere. —[2]—
Further, the food will be superb. —[3]— I’ve had a chance to dine at the
hotel several times in the past in other functions, and it was the food that
convinced me to hold our event there. I am quite certain that all of our members
will share my feeling. —[4]— Anyhow, I am looking forward to this Friday when
all of our members can let loose and have some fun.
Therefore, this is a letter officially to invite you and your spouse or
significant other to join us on this memorable evening.
Please let us know if you can’t attend.
Yours sincerely,
Jeff Connelly', NULL, '[{"id":"A","text":"[1]"},{"id":"B","text":"[2]"},{"id":"C","text":"[3]"},{"id":"D","text":"[4]"}]'::jsonb, 150, 1.0)
    RETURNING id INTO v_question_id;
  ELSE
    UPDATE assessment_questions SET
      skill = 'reading',
      category = 'toeic_part_7',
      difficulty = 3,
      level = 'b2',
      prompt = 'In which of the positions marked [1], [2], [3], and [4] does the following sentence best belong? “The newest members, who will be carrying on our tradition, should hear what the older members have to say.”',
      context_text = 'Questions 147-150
 refer to the following letter.
October 20, 2018
Mr. Joe Fernandez
1385 Midland Ave.
Detroit, Michigan
Dear Mr. Fernandez,
As the president, I am proud to announce that this Friday marks the 30th
anniversary of our long and successful running country club. This, of course, calls
for a night of celebration. And for this reason, we have reserved the Grand Hall
at the Falcon Hotel this Friday at 7 p.m. for a night of fine dining and dancing. —
[1]—
On this special evening, the newest members of our club will get an
opportunity to listen to the thoughts of our older members and exchange ideas in
an informal atmosphere. —[2]—
Further, the food will be superb. —[3]— I’ve had a chance to dine at the
hotel several times in the past in other functions, and it was the food that
convinced me to hold our event there. I am quite certain that all of our members
will share my feeling. —[4]— Anyhow, I am looking forward to this Friday when
all of our members can let loose and have some fun.
Therefore, this is a letter officially to invite you and your spouse or
significant other to join us on this memorable evening.
Please let us know if you can’t attend.
Yours sincerely,
Jeff Connelly',
      audio_url = NULL,
      options = '[{"id":"A","text":"[1]"},{"id":"B","text":"[2]"},{"id":"C","text":"[3]"},{"id":"D","text":"[4]"}]'::jsonb
    WHERE id = v_question_id;
  END IF;

  -- Answer for #150
  DELETE FROM assessment_question_answers WHERE question_id = v_question_id;
  INSERT INTO assessment_question_answers (question_id, correct_option_id, explanation, transcript_text)
  VALUES (v_question_id, 'B', 'Đáp án đúng: B.

Phân tích bài đọc & dẫn chứng:
In which of the positions marked [1], [2], [3], and [4] does the following
sentence best belong?
“The newest members, who will be carrying on our tradition, should hear
what the older members have to say.”
(A) [1]
(B) [2]
(C) [3] (D) [4]
以下句子
“The newest members, who will be carrying on our tradition, should
hear what the older members have to say.”
位于标有
[1], [2], [3]
和
[4]
的哪处最合
适？
(A) [1] (B) [2]
(C) [3] (D) [4]
1248
```

## PDF 第 478 页

```text
→所给句子是说“将要继承我们的传统的新会员应该听一听老会员的想
法。”信中作者提到新会员和老会员的内容是在第二段。故答案为(B)。
▼ Vocabulary Check
celebration
庆祝，庆祝会
 reserve
预订
 opportunity
机会，机遇
 exchange
交换
 informal
非正式的，不拘礼的
 atmosphere
气氛
 tradition
传统，惯例
superb
极好的
 functions
社交聚会，宴会
 convince
说服
 officially
正式地
spouse
配偶，夫妻
 significant
重要的
 memorable
值得纪念的，难忘的
 notify
通知，通告
 yearly
每年的，一年一次的
 upcoming
即将来临的
 be impressed
with
对
…
印象深刻
Questions 151-152
 refer to the following text message chain.
霍莉
·
塞缪尔斯
 [
下午
3:31]
嗨，伯特。你记得要给新员工签合同吗？
伯特
·
麦迪逊
 [
下午
3:35]
我还没到办公室。我得去朴茨茅斯，去见我们的一位承包商。
霍莉
·
塞缪尔斯
 [
下午
3:36]
我都不知道。你觉得自己什么时候能回来？员工们明天就开始上班
了。
伯特
·
麦迪逊
 [
下午
3:38]
我今天本不打算去办公室，但我想我可以顺便去一趟。我
7
点左右
到。
霍莉
·
塞缪尔斯
 [
下午
3:39]
我会一直等你。如果你不能准时赶到，请告诉我一下。
伯特
·
麦迪逊
 [
下午
3:40]
当然。
1249
```

## PDF 第 479 页

```text', NULL);

  -- Question #151 (toeic_part_7)
  SELECT id INTO v_question_id FROM assessment_questions WHERE assessment_id = v_assessment_id AND position = 151;
  IF v_question_id IS NULL THEN
    INSERT INTO assessment_questions (assessment_id, skill, category, difficulty, level, question_type, prompt, context_text, audio_url, options, position, weight)
    VALUES (v_assessment_id, 'reading', 'toeic_part_7', 3, 'b2', 'multiple_choice', 'At 3:35 P.M., what does Mr. Madison imply when he writes,“I haven’t been in the office yet”?', 'Questions 151-152
 refer to the following text message chain.
801


## PDF 第 31 页

![PDF 第 31 页](images/read_page_31.png)



Holly Samuels [3:31 P.M.]
Hi, Burt. Did you remember to sign the contracts for the new employees?
Burt Madison [3:35 P.M.]
I haven’t been in the office yet. I had to visit Portsmouth to meet one of our
contractors.
Holly Samuels [3:36 P.M.]
I wasn’t aware of that. When do you think you’ll be back? The employees
start tomorrow.
Burt Madison [3:38 P.M.]
I wasn’t planning to visit the office today, but I guess I can drop by. I’ll be
there around seven.
Holly Samuels [3:39 P.M.]
I’ll be waiting. Let me know if you’re not going to make it there on time,
please.
Burt Madison [3:40 P.M.]
Sure.', NULL, '[{"id":"A","text":"He did not meet the new employees."},{"id":"B","text":"He will return to work tomorrow."},{"id":"C","text":"He forgot about a meeting."},{"id":"D","text":"He has not signed any contracts."}]'::jsonb, 151, 1.0)
    RETURNING id INTO v_question_id;
  ELSE
    UPDATE assessment_questions SET
      skill = 'reading',
      category = 'toeic_part_7',
      difficulty = 3,
      level = 'b2',
      prompt = 'At 3:35 P.M., what does Mr. Madison imply when he writes,“I haven’t been in the office yet”?',
      context_text = 'Questions 151-152
 refer to the following text message chain.
801


## PDF 第 31 页

![PDF 第 31 页](images/read_page_31.png)



Holly Samuels [3:31 P.M.]
Hi, Burt. Did you remember to sign the contracts for the new employees?
Burt Madison [3:35 P.M.]
I haven’t been in the office yet. I had to visit Portsmouth to meet one of our
contractors.
Holly Samuels [3:36 P.M.]
I wasn’t aware of that. When do you think you’ll be back? The employees
start tomorrow.
Burt Madison [3:38 P.M.]
I wasn’t planning to visit the office today, but I guess I can drop by. I’ll be
there around seven.
Holly Samuels [3:39 P.M.]
I’ll be waiting. Let me know if you’re not going to make it there on time,
please.
Burt Madison [3:40 P.M.]
Sure.',
      audio_url = NULL,
      options = '[{"id":"A","text":"He did not meet the new employees."},{"id":"B","text":"He will return to work tomorrow."},{"id":"C","text":"He forgot about a meeting."},{"id":"D","text":"He has not signed any contracts."}]'::jsonb
    WHERE id = v_question_id;
  END IF;

  -- Answer for #151
  DELETE FROM assessment_question_answers WHERE question_id = v_question_id;
  INSERT INTO assessment_question_answers (question_id, correct_option_id, explanation, transcript_text)
  VALUES (v_question_id, 'D', 'Đáp án đúng: D.

Phân tích bài đọc & dẫn chứng:
At 3:35 P.M., what does Mr. Madison imply when he writes,“I haven’t been in
the office yet”?
(A) He did not meet the new employees.
(B) He will return to work tomorrow.
(C) He forgot about a meeting.
(D) He has not signed the contracts.
下午
3
点
35
分，麦迪逊先生写道
“
我一直没在办公室
”
，他暗示了什么？
(A)
他没有见到新员工。
(B)
他明天回来上班。
(C)
他忘记开会了。
(D)
他还没有签署合同。
→塞缪尔斯女士询问麦迪逊先生是否已经给新员工签了合同，麦迪逊先
生回复说他还没到办公室，言外之意就是还没有给新入职的员工签合同。答
案是(D)。', NULL);

  -- Question #152 (toeic_part_7)
  SELECT id INTO v_question_id FROM assessment_questions WHERE assessment_id = v_assessment_id AND position = 152;
  IF v_question_id IS NULL THEN
    INSERT INTO assessment_questions (assessment_id, skill, category, difficulty, level, question_type, prompt, context_text, audio_url, options, position, weight)
    VALUES (v_assessment_id, 'reading', 'toeic_part_7', 3, 'b2', 'multiple_choice', 'What will Mr. Madison do in the evening?', 'Questions 151-152
 refer to the following text message chain.
801


## PDF 第 31 页

![PDF 第 31 页](images/read_page_31.png)



Holly Samuels [3:31 P.M.]
Hi, Burt. Did you remember to sign the contracts for the new employees?
Burt Madison [3:35 P.M.]
I haven’t been in the office yet. I had to visit Portsmouth to meet one of our
contractors.
Holly Samuels [3:36 P.M.]
I wasn’t aware of that. When do you think you’ll be back? The employees
start tomorrow.
Burt Madison [3:38 P.M.]
I wasn’t planning to visit the office today, but I guess I can drop by. I’ll be
there around seven.
Holly Samuels [3:39 P.M.]
I’ll be waiting. Let me know if you’re not going to make it there on time,
please.
Burt Madison [3:40 P.M.]
Sure.', NULL, '[{"id":"A","text":"Have dinner with his co-workers"},{"id":"B","text":"Send Ms. Samuels an e-mail"},{"id":"C","text":"Visit his workplace"},{"id":"D","text":"Meet a contractor"}]'::jsonb, 152, 1.0)
    RETURNING id INTO v_question_id;
  ELSE
    UPDATE assessment_questions SET
      skill = 'reading',
      category = 'toeic_part_7',
      difficulty = 3,
      level = 'b2',
      prompt = 'What will Mr. Madison do in the evening?',
      context_text = 'Questions 151-152
 refer to the following text message chain.
801


## PDF 第 31 页

![PDF 第 31 页](images/read_page_31.png)



Holly Samuels [3:31 P.M.]
Hi, Burt. Did you remember to sign the contracts for the new employees?
Burt Madison [3:35 P.M.]
I haven’t been in the office yet. I had to visit Portsmouth to meet one of our
contractors.
Holly Samuels [3:36 P.M.]
I wasn’t aware of that. When do you think you’ll be back? The employees
start tomorrow.
Burt Madison [3:38 P.M.]
I wasn’t planning to visit the office today, but I guess I can drop by. I’ll be
there around seven.
Holly Samuels [3:39 P.M.]
I’ll be waiting. Let me know if you’re not going to make it there on time,
please.
Burt Madison [3:40 P.M.]
Sure.',
      audio_url = NULL,
      options = '[{"id":"A","text":"Have dinner with his co-workers"},{"id":"B","text":"Send Ms. Samuels an e-mail"},{"id":"C","text":"Visit his workplace"},{"id":"D","text":"Meet a contractor"}]'::jsonb
    WHERE id = v_question_id;
  END IF;

  -- Answer for #152
  DELETE FROM assessment_question_answers WHERE question_id = v_question_id;
  INSERT INTO assessment_question_answers (question_id, correct_option_id, explanation, transcript_text)
  VALUES (v_question_id, 'C', 'Đáp án đúng: C.

Phân tích bài đọc & dẫn chứng:
What will Mr. Madison do in the evening?
(A) Have dinner with his co-workers
(B) Send Ms. Samuels an e-mail
(C) Visit his workplace
(D) Meet a contractor
麦迪逊先生将在晚上干什么？
(A)
和他的同事共进晚餐
(B)
给塞缪尔斯女士发电子邮件
(C)
到他的工作场所
(D)
见一位承包商
1250
```

## PDF 第 480 页

```text
→麦迪逊先生虽然说他今天本不打算去办公室，但后一句提到他可以顺
便去一趟，并和塞缪尔斯女士约好了时间——7点左右。答案为(C)。
▼ Vocabulary Check
sign
签署；在
…
上签字
 contract
合同；协议
 employee
雇员，受雇者
 yet
(
用于否定句和疑问句
)
尚
(
未
)
，还
 contractor
立约人；承包商
 be aware of
意
识到
 drop by
顺道拜访；造访
 make it
赶上
 on time
按时
 imply
暗示
 co-worker
同事
 workplace
工作场所
Questions 153-156
 refer to the following guidelines.
“
寄宿家庭网
”
学生指南
到达你新家的那一刻：
·
尽量记住寄宿家庭主人的名字。如果不知道该怎么称呼，可以大胆
地问他们。比如，如果在你的祖国直呼长辈的名字是不礼貌的，那就问问
是不是可以在名字前加上
“
先生
”
或
“
太太
”
。一些美国人不喜欢人们这样称
呼自己，因为这种称呼方式让他们觉得自己很老。
·
向寄宿家庭表达你的感激之情。但是不要送昂贵的礼物。尽管如
此，送他们一些你们国家有特色但不昂贵的手工艺品或者给主人家孩子们
一些小礼物是比较得体的做法。
·
寄宿家庭会比较好奇，想更多地了解你。带上你家人和朋友的照片
和他们分享。这也是打破僵局、拉近彼此距离的一种好方法。
·
在你安顿下来之后，寄宿家庭会帮你给你父母打电话报平安。
·
用完晚餐后，你可以早点跟主人道晚安。他们会很理解你由于长途
飞行和时差原因需要休息，所以不要犹豫。
第一天上学：
·
第一天上学时，寄宿家庭的主人会带你去学校，并帮你做好必要的
入学注册手续。
·
寄宿家庭的主人还会确保你认识上学和回家的路。他们会教你怎样
搭乘公共交通工具。
·
独自出门时，你应该一直带着地图和寄宿家庭的电话号码。
1251
```

## PDF 第 481 页

```text
·
万一迷路了并且无法联系到寄宿家庭，你可以联系
“
寄宿家庭网
”
。', NULL);

  -- Question #153 (toeic_part_7)
  SELECT id INTO v_question_id FROM assessment_questions WHERE assessment_id = v_assessment_id AND position = 153;
  IF v_question_id IS NULL THEN
    INSERT INTO assessment_questions (assessment_id, skill, category, difficulty, level, question_type, prompt, context_text, audio_url, options, position, weight)
    VALUES (v_assessment_id, 'reading', 'toeic_part_7', 3, 'b2', 'multiple_choice', 'Which of the following is NOT mentioned in the guideline?', 'Questions 153-156
 refer to the following guidelines.
“HOMESTAY NETWORK” STUDENT GUIDELINES
On arrival at your new home:
• Try to remember the names of your host family. If unsure about how to
address them, it is okay to ask how they would like to be called. For example, if it
is impolite in your country to call someone elder by their first name, ask if it’s
okay to add Mr. or Mrs. in front of their names. —[1]—
• Show your family that you are grateful for being your host. But do not give
expensive gifts. It is, however, considered appropriate to bring inexpensive
handcrafts from your country or a small gift for the children of the host family.
• Your host family will be curious to know more about you. —[2]— Bring
photos of your family and friends to share with them. This is also a great way to
break the ice with them. —[3]—
• After you get settled, your host family will help you make a call to your
parents to assure them that you have arrived safely.
• After you’ve had dinner, you may ask the host family to be excused early.
They will be fully aware of the fact that you might be jet-lagged, so feel free to
ask them.
On your first day of school:
• On your first day of school, your host family will take you to school and
help you with the necessary registration paperwork.
• Your host family will also make sure that you know your way to and from
school. They will also teach you how to use public transportation. —[4]—
• When traveling alone, you should at all times carry a map and the phone
number of your host family.
803


## PDF 第 33 页

![PDF 第 33 页](images/read_page_33.png)



• In case you are lost and cannot get in touch with your host family, you can
contact the“Homestay Network”.', NULL, '[{"id":"A","text":"Find out how you should address the host family"},{"id":"B","text":"Always be prepared for the unexpected"},{"id":"C","text":"Be prompt during meal times"},{"id":"D","text":"Establish a rapport with the host family"}]'::jsonb, 153, 1.0)
    RETURNING id INTO v_question_id;
  ELSE
    UPDATE assessment_questions SET
      skill = 'reading',
      category = 'toeic_part_7',
      difficulty = 3,
      level = 'b2',
      prompt = 'Which of the following is NOT mentioned in the guideline?',
      context_text = 'Questions 153-156
 refer to the following guidelines.
“HOMESTAY NETWORK” STUDENT GUIDELINES
On arrival at your new home:
• Try to remember the names of your host family. If unsure about how to
address them, it is okay to ask how they would like to be called. For example, if it
is impolite in your country to call someone elder by their first name, ask if it’s
okay to add Mr. or Mrs. in front of their names. —[1]—
• Show your family that you are grateful for being your host. But do not give
expensive gifts. It is, however, considered appropriate to bring inexpensive
handcrafts from your country or a small gift for the children of the host family.
• Your host family will be curious to know more about you. —[2]— Bring
photos of your family and friends to share with them. This is also a great way to
break the ice with them. —[3]—
• After you get settled, your host family will help you make a call to your
parents to assure them that you have arrived safely.
• After you’ve had dinner, you may ask the host family to be excused early.
They will be fully aware of the fact that you might be jet-lagged, so feel free to
ask them.
On your first day of school:
• On your first day of school, your host family will take you to school and
help you with the necessary registration paperwork.
• Your host family will also make sure that you know your way to and from
school. They will also teach you how to use public transportation. —[4]—
• When traveling alone, you should at all times carry a map and the phone
number of your host family.
803


## PDF 第 33 页

![PDF 第 33 页](images/read_page_33.png)



• In case you are lost and cannot get in touch with your host family, you can
contact the“Homestay Network”.',
      audio_url = NULL,
      options = '[{"id":"A","text":"Find out how you should address the host family"},{"id":"B","text":"Always be prepared for the unexpected"},{"id":"C","text":"Be prompt during meal times"},{"id":"D","text":"Establish a rapport with the host family"}]'::jsonb
    WHERE id = v_question_id;
  END IF;

  -- Answer for #153
  DELETE FROM assessment_question_answers WHERE question_id = v_question_id;
  INSERT INTO assessment_question_answers (question_id, correct_option_id, explanation, transcript_text)
  VALUES (v_question_id, 'C', 'Đáp án đúng: C.

Phân tích bài đọc & dẫn chứng:
Which of the following is NOT mentioned in the guideline?
(A) Find out how you should address the host family
(B) Always be prepared for the unexpected
(C) Be prompt during meal times
(D) Establish a rapport with the host family
下列哪一项指南中没有提及？
(A)
弄明白该怎样称呼寄宿家庭的主人
(B)
时刻为未知的情况做好准备
(C)
吃饭要迅速
(D)
和寄宿家庭建立起融洽的关系
→指南中提到了询问如何称呼寄宿家庭中的成员(A)，外出时要携带地
图和电话号码(B)，给寄宿家庭的家庭成员一些小礼物，或准备一些能一起
分享的照片，以便和他们拉近距离(D)。故答案为(C)。', NULL);

  -- Question #154 (toeic_part_7)
  SELECT id INTO v_question_id FROM assessment_questions WHERE assessment_id = v_assessment_id AND position = 154;
  IF v_question_id IS NULL THEN
    INSERT INTO assessment_questions (assessment_id, skill, category, difficulty, level, question_type, prompt, context_text, audio_url, options, position, weight)
    VALUES (v_assessment_id, 'reading', 'toeic_part_7', 3, 'b2', 'multiple_choice', 'What might be an appropriate present for the host family?', 'Questions 153-156
 refer to the following guidelines.
“HOMESTAY NETWORK” STUDENT GUIDELINES
On arrival at your new home:
• Try to remember the names of your host family. If unsure about how to
address them, it is okay to ask how they would like to be called. For example, if it
is impolite in your country to call someone elder by their first name, ask if it’s
okay to add Mr. or Mrs. in front of their names. —[1]—
• Show your family that you are grateful for being your host. But do not give
expensive gifts. It is, however, considered appropriate to bring inexpensive
handcrafts from your country or a small gift for the children of the host family.
• Your host family will be curious to know more about you. —[2]— Bring
photos of your family and friends to share with them. This is also a great way to
break the ice with them. —[3]—
• After you get settled, your host family will help you make a call to your
parents to assure them that you have arrived safely.
• After you’ve had dinner, you may ask the host family to be excused early.
They will be fully aware of the fact that you might be jet-lagged, so feel free to
ask them.
On your first day of school:
• On your first day of school, your host family will take you to school and
help you with the necessary registration paperwork.
• Your host family will also make sure that you know your way to and from
school. They will also teach you how to use public transportation. —[4]—
• When traveling alone, you should at all times carry a map and the phone
number of your host family.
803


## PDF 第 33 页

![PDF 第 33 页](images/read_page_33.png)



• In case you are lost and cannot get in touch with your host family, you can
contact the“Homestay Network”.', NULL, '[{"id":"A","text":"A toy train"},{"id":"B","text":"A bottle of whiskey"},{"id":"C","text":"A camera"},{"id":"D","text":"A cellular phone"}]'::jsonb, 154, 1.0)
    RETURNING id INTO v_question_id;
  ELSE
    UPDATE assessment_questions SET
      skill = 'reading',
      category = 'toeic_part_7',
      difficulty = 3,
      level = 'b2',
      prompt = 'What might be an appropriate present for the host family?',
      context_text = 'Questions 153-156
 refer to the following guidelines.
“HOMESTAY NETWORK” STUDENT GUIDELINES
On arrival at your new home:
• Try to remember the names of your host family. If unsure about how to
address them, it is okay to ask how they would like to be called. For example, if it
is impolite in your country to call someone elder by their first name, ask if it’s
okay to add Mr. or Mrs. in front of their names. —[1]—
• Show your family that you are grateful for being your host. But do not give
expensive gifts. It is, however, considered appropriate to bring inexpensive
handcrafts from your country or a small gift for the children of the host family.
• Your host family will be curious to know more about you. —[2]— Bring
photos of your family and friends to share with them. This is also a great way to
break the ice with them. —[3]—
• After you get settled, your host family will help you make a call to your
parents to assure them that you have arrived safely.
• After you’ve had dinner, you may ask the host family to be excused early.
They will be fully aware of the fact that you might be jet-lagged, so feel free to
ask them.
On your first day of school:
• On your first day of school, your host family will take you to school and
help you with the necessary registration paperwork.
• Your host family will also make sure that you know your way to and from
school. They will also teach you how to use public transportation. —[4]—
• When traveling alone, you should at all times carry a map and the phone
number of your host family.
803


## PDF 第 33 页

![PDF 第 33 页](images/read_page_33.png)



• In case you are lost and cannot get in touch with your host family, you can
contact the“Homestay Network”.',
      audio_url = NULL,
      options = '[{"id":"A","text":"A toy train"},{"id":"B","text":"A bottle of whiskey"},{"id":"C","text":"A camera"},{"id":"D","text":"A cellular phone"}]'::jsonb
    WHERE id = v_question_id;
  END IF;

  -- Answer for #154
  DELETE FROM assessment_question_answers WHERE question_id = v_question_id;
  INSERT INTO assessment_question_answers (question_id, correct_option_id, explanation, transcript_text)
  VALUES (v_question_id, 'A', 'Đáp án đúng: A.

Phân tích bài đọc & dẫn chứng:
What might be an appropriate present for the host family?
(A) A toy train
 (B) A bottle of whiskey
(C) A camera (D) A cellular phone
给寄宿家庭什么礼物合适？
(A)
一辆玩具火车
 (B)
一瓶威士忌
(C)
一部照相机
 (D)
一部手机
→文中提到，不太贵的手工艺品或给小孩的小礼物比较适合。故答案为
(A)。', NULL);

  -- Question #155 (toeic_part_7)
  SELECT id INTO v_question_id FROM assessment_questions WHERE assessment_id = v_assessment_id AND position = 155;
  IF v_question_id IS NULL THEN
    INSERT INTO assessment_questions (assessment_id, skill, category, difficulty, level, question_type, prompt, context_text, audio_url, options, position, weight)
    VALUES (v_assessment_id, 'reading', 'toeic_part_7', 3, 'b2', 'multiple_choice', 'What is implied by the guidelines?', 'Questions 153-156
 refer to the following guidelines.
“HOMESTAY NETWORK” STUDENT GUIDELINES
On arrival at your new home:
• Try to remember the names of your host family. If unsure about how to
address them, it is okay to ask how they would like to be called. For example, if it
is impolite in your country to call someone elder by their first name, ask if it’s
okay to add Mr. or Mrs. in front of their names. —[1]—
• Show your family that you are grateful for being your host. But do not give
expensive gifts. It is, however, considered appropriate to bring inexpensive
handcrafts from your country or a small gift for the children of the host family.
• Your host family will be curious to know more about you. —[2]— Bring
photos of your family and friends to share with them. This is also a great way to
break the ice with them. —[3]—
• After you get settled, your host family will help you make a call to your
parents to assure them that you have arrived safely.
• After you’ve had dinner, you may ask the host family to be excused early.
They will be fully aware of the fact that you might be jet-lagged, so feel free to
ask them.
On your first day of school:
• On your first day of school, your host family will take you to school and
help you with the necessary registration paperwork.
• Your host family will also make sure that you know your way to and from
school. They will also teach you how to use public transportation. —[4]—
• When traveling alone, you should at all times carry a map and the phone
number of your host family.
803


## PDF 第 33 页

![PDF 第 33 页](images/read_page_33.png)



• In case you are lost and cannot get in touch with your host family, you can
contact the“Homestay Network”.', NULL, '[{"id":"A","text":"Americans prefer to address each other formally."},{"id":"B","text":"Newly arrived students often get lost in the city."},{"id":"C","text":"Host families come from educated backgrounds."},{"id":"D","text":"Students will depend on the host family to settle in."}]'::jsonb, 155, 1.0)
    RETURNING id INTO v_question_id;
  ELSE
    UPDATE assessment_questions SET
      skill = 'reading',
      category = 'toeic_part_7',
      difficulty = 3,
      level = 'b2',
      prompt = 'What is implied by the guidelines?',
      context_text = 'Questions 153-156
 refer to the following guidelines.
“HOMESTAY NETWORK” STUDENT GUIDELINES
On arrival at your new home:
• Try to remember the names of your host family. If unsure about how to
address them, it is okay to ask how they would like to be called. For example, if it
is impolite in your country to call someone elder by their first name, ask if it’s
okay to add Mr. or Mrs. in front of their names. —[1]—
• Show your family that you are grateful for being your host. But do not give
expensive gifts. It is, however, considered appropriate to bring inexpensive
handcrafts from your country or a small gift for the children of the host family.
• Your host family will be curious to know more about you. —[2]— Bring
photos of your family and friends to share with them. This is also a great way to
break the ice with them. —[3]—
• After you get settled, your host family will help you make a call to your
parents to assure them that you have arrived safely.
• After you’ve had dinner, you may ask the host family to be excused early.
They will be fully aware of the fact that you might be jet-lagged, so feel free to
ask them.
On your first day of school:
• On your first day of school, your host family will take you to school and
help you with the necessary registration paperwork.
• Your host family will also make sure that you know your way to and from
school. They will also teach you how to use public transportation. —[4]—
• When traveling alone, you should at all times carry a map and the phone
number of your host family.
803


## PDF 第 33 页

![PDF 第 33 页](images/read_page_33.png)



• In case you are lost and cannot get in touch with your host family, you can
contact the“Homestay Network”.',
      audio_url = NULL,
      options = '[{"id":"A","text":"Americans prefer to address each other formally."},{"id":"B","text":"Newly arrived students often get lost in the city."},{"id":"C","text":"Host families come from educated backgrounds."},{"id":"D","text":"Students will depend on the host family to settle in."}]'::jsonb
    WHERE id = v_question_id;
  END IF;

  -- Answer for #155
  DELETE FROM assessment_question_answers WHERE question_id = v_question_id;
  INSERT INTO assessment_question_answers (question_id, correct_option_id, explanation, transcript_text)
  VALUES (v_question_id, 'D', 'Đáp án đúng: D.

Phân tích bài đọc & dẫn chứng:
What is implied by the guidelines?
1252
```

## PDF 第 482 页

```text
(A) Americans prefer to address each other formally.
(B) Newly arrived students often get lost in the city.
(C) Host families come from educated backgrounds.
(D) Students will depend on the host family to settle in.
指南暗示了什么？
(A)
美国人更喜欢正式地称呼彼此。
(B)
刚到的学生总是在城里迷路。
(C)
寄宿家庭有良好的教育背景。
(D)
学生要依靠寄宿家庭安顿下来。
→弄清楚寄宿家庭中成员的称呼、为拉近距离而送一些小礼物等行为，
都能说明借宿学生需要主人家的帮助。故答案为(D)。', NULL);

  -- Question #156 (toeic_part_7)
  SELECT id INTO v_question_id FROM assessment_questions WHERE assessment_id = v_assessment_id AND position = 156;
  IF v_question_id IS NULL THEN
    INSERT INTO assessment_questions (assessment_id, skill, category, difficulty, level, question_type, prompt, context_text, audio_url, options, position, weight)
    VALUES (v_assessment_id, 'reading', 'toeic_part_7', 3, 'b2', 'multiple_choice', 'In which of the positions marked [1], [2], [3], and [4] does the following sentence best belong? “Some Americans do not like to be addressed in this way because it makes them feel old.”', 'Questions 153-156
 refer to the following guidelines.
“HOMESTAY NETWORK” STUDENT GUIDELINES
On arrival at your new home:
• Try to remember the names of your host family. If unsure about how to
address them, it is okay to ask how they would like to be called. For example, if it
is impolite in your country to call someone elder by their first name, ask if it’s
okay to add Mr. or Mrs. in front of their names. —[1]—
• Show your family that you are grateful for being your host. But do not give
expensive gifts. It is, however, considered appropriate to bring inexpensive
handcrafts from your country or a small gift for the children of the host family.
• Your host family will be curious to know more about you. —[2]— Bring
photos of your family and friends to share with them. This is also a great way to
break the ice with them. —[3]—
• After you get settled, your host family will help you make a call to your
parents to assure them that you have arrived safely.
• After you’ve had dinner, you may ask the host family to be excused early.
They will be fully aware of the fact that you might be jet-lagged, so feel free to
ask them.
On your first day of school:
• On your first day of school, your host family will take you to school and
help you with the necessary registration paperwork.
• Your host family will also make sure that you know your way to and from
school. They will also teach you how to use public transportation. —[4]—
• When traveling alone, you should at all times carry a map and the phone
number of your host family.
803


## PDF 第 33 页

![PDF 第 33 页](images/read_page_33.png)



• In case you are lost and cannot get in touch with your host family, you can
contact the“Homestay Network”.', NULL, '[{"id":"A","text":"[1]"},{"id":"B","text":"[2]"},{"id":"C","text":"[3]"},{"id":"D","text":"[4]"}]'::jsonb, 156, 1.0)
    RETURNING id INTO v_question_id;
  ELSE
    UPDATE assessment_questions SET
      skill = 'reading',
      category = 'toeic_part_7',
      difficulty = 3,
      level = 'b2',
      prompt = 'In which of the positions marked [1], [2], [3], and [4] does the following sentence best belong? “Some Americans do not like to be addressed in this way because it makes them feel old.”',
      context_text = 'Questions 153-156
 refer to the following guidelines.
“HOMESTAY NETWORK” STUDENT GUIDELINES
On arrival at your new home:
• Try to remember the names of your host family. If unsure about how to
address them, it is okay to ask how they would like to be called. For example, if it
is impolite in your country to call someone elder by their first name, ask if it’s
okay to add Mr. or Mrs. in front of their names. —[1]—
• Show your family that you are grateful for being your host. But do not give
expensive gifts. It is, however, considered appropriate to bring inexpensive
handcrafts from your country or a small gift for the children of the host family.
• Your host family will be curious to know more about you. —[2]— Bring
photos of your family and friends to share with them. This is also a great way to
break the ice with them. —[3]—
• After you get settled, your host family will help you make a call to your
parents to assure them that you have arrived safely.
• After you’ve had dinner, you may ask the host family to be excused early.
They will be fully aware of the fact that you might be jet-lagged, so feel free to
ask them.
On your first day of school:
• On your first day of school, your host family will take you to school and
help you with the necessary registration paperwork.
• Your host family will also make sure that you know your way to and from
school. They will also teach you how to use public transportation. —[4]—
• When traveling alone, you should at all times carry a map and the phone
number of your host family.
803


## PDF 第 33 页

![PDF 第 33 页](images/read_page_33.png)



• In case you are lost and cannot get in touch with your host family, you can
contact the“Homestay Network”.',
      audio_url = NULL,
      options = '[{"id":"A","text":"[1]"},{"id":"B","text":"[2]"},{"id":"C","text":"[3]"},{"id":"D","text":"[4]"}]'::jsonb
    WHERE id = v_question_id;
  END IF;

  -- Answer for #156
  DELETE FROM assessment_question_answers WHERE question_id = v_question_id;
  INSERT INTO assessment_question_answers (question_id, correct_option_id, explanation, transcript_text)
  VALUES (v_question_id, 'A', 'Đáp án đúng: A.

Phân tích bài đọc & dẫn chứng:
In which of the positions marked [1], [2], [3], and [4] does the following
sentence best belong?
“Some Americans do not like to be addressed in this way because it makes
them feel old.”
(A) [1]
 (B) [2]
(C) [3] (D) [4]
以下句子
“Some Americans do not like to be addressed in this way because it
makes them feel old.”
位于标有
[1], [2], [3]
和
[4]
的哪处最合适？
(A) [1] (B) [2]
(C) [3] (D) [4]
→所给句子是说“一些美国人不喜欢人们这样称呼自己，因为这种称呼
方式让他们觉得自己很老。”指南中提到有关如何称呼寄宿家庭主人名字的
内容是在第一段。故答案为(A)。
▼ Vocabulary Check
guideline
指南，指导
 address
称呼
 grateful
感谢的，感激的
 appropriate
1253
```

## PDF 第 483 页

```text
适当的，合适的
 handcraft
手工艺品
 assure
使确信
 jet-lagged
有时差反应的
registration
登记，注册
 paperwork
文书工作
 prompt
迅速的，敏捷的
 rapport
融洽
(
关系
) settle in
安顿下来，适应
(
新环境
)
Questions 157-158
 refer to the following advertisement.
Pump It
特价
这个夏季用我们最先进的设备以及由我们的高级个人教练为你量身打
造的训练课程展示你最好的形象
如果你无法调动积极性，那么，
Pump It
就是你应该来的地方。
我们会为你安排一位私人教练，你将会进行有针对性的训练，在仅仅
12
个星期内得到完美身材。
在我们的训练中，你会得到以下所有好处：
·
业内顶尖教练的一对一帮助和专业指导
·
使用目前能买到的最先进的健身设备，包括重量训练器材、跑步
机、自行车，甚至还有男女分开的桑拿
·
各种连续的小组课程，比如有氧健身操、瑜伽、舞蹈健身操，以及
瘦腹、美臀、美腿训练等
·
目前不需要入会费并且每月的会员费价格合理
赶快来免费咨询吧，就从今天开始！
机不可失！
特价只到本周五
芝加哥圣乔治大街
310
号
601
室
电话：
755-3422
网站：
pumpitclub.com
1254
```

## PDF 第 484 页

```text', NULL);

  -- Question #157 (toeic_part_7)
  SELECT id INTO v_question_id FROM assessment_questions WHERE assessment_id = v_assessment_id AND position = 157;
  IF v_question_id IS NULL THEN
    INSERT INTO assessment_questions (assessment_id, skill, category, difficulty, level, question_type, prompt, context_text, audio_url, options, position, weight)
    VALUES (v_assessment_id, 'reading', 'toeic_part_7', 3, 'b2', 'multiple_choice', 'Who does this advertisement mainly target?', 'Questions 157-158
 refer to the following advertisement.
Pump It
special offer
Look your best this summer with our state of the art equipment and a tailor-made
training program made specially for you by one of our top rated personal trainers
If you are having a difficult time getting motivated, Pump It is where you
want to be.
With a personal trainer assigned to you, you’ll be placed in a tailor-made
program that will make you look your best in just 12 weeks.
With our program, you will get the full benefits of…
• Our one-on-one support and expert guidance by the top trainers in our
industry
• The use of the most updated fitness equipment money can buy, including
free weights, treadmills, bikes, and even a his and hers sauna
• Ongoing group classes, from aerobics to yoga to dancercise to ‘abs-butts-
thighs’,just to name a few
• For the time being, absolutely no joining fee and a very affordable monthly
membership rates
So come for a free consultation, and get started today!
Don’t miss out!
Offer is good until this Friday
310 St. George Street, Suite 601, Chicago
805


## PDF 第 35 页

![PDF 第 35 页](images/read_page_35.png)



T: 755-3422 W: pumpitclub.com', NULL, '[{"id":"A","text":"Anyone who failed at dieting during the summer"},{"id":"B","text":"People without much time on their hands"},{"id":"C","text":"Athletes training for upcoming competitions"},{"id":"D","text":"People who need a little nudge at getting into shape"}]'::jsonb, 157, 1.0)
    RETURNING id INTO v_question_id;
  ELSE
    UPDATE assessment_questions SET
      skill = 'reading',
      category = 'toeic_part_7',
      difficulty = 3,
      level = 'b2',
      prompt = 'Who does this advertisement mainly target?',
      context_text = 'Questions 157-158
 refer to the following advertisement.
Pump It
special offer
Look your best this summer with our state of the art equipment and a tailor-made
training program made specially for you by one of our top rated personal trainers
If you are having a difficult time getting motivated, Pump It is where you
want to be.
With a personal trainer assigned to you, you’ll be placed in a tailor-made
program that will make you look your best in just 12 weeks.
With our program, you will get the full benefits of…
• Our one-on-one support and expert guidance by the top trainers in our
industry
• The use of the most updated fitness equipment money can buy, including
free weights, treadmills, bikes, and even a his and hers sauna
• Ongoing group classes, from aerobics to yoga to dancercise to ‘abs-butts-
thighs’,just to name a few
• For the time being, absolutely no joining fee and a very affordable monthly
membership rates
So come for a free consultation, and get started today!
Don’t miss out!
Offer is good until this Friday
310 St. George Street, Suite 601, Chicago
805


## PDF 第 35 页

![PDF 第 35 页](images/read_page_35.png)



T: 755-3422 W: pumpitclub.com',
      audio_url = NULL,
      options = '[{"id":"A","text":"Anyone who failed at dieting during the summer"},{"id":"B","text":"People without much time on their hands"},{"id":"C","text":"Athletes training for upcoming competitions"},{"id":"D","text":"People who need a little nudge at getting into shape"}]'::jsonb
    WHERE id = v_question_id;
  END IF;

  -- Answer for #157
  DELETE FROM assessment_question_answers WHERE question_id = v_question_id;
  INSERT INTO assessment_question_answers (question_id, correct_option_id, explanation, transcript_text)
  VALUES (v_question_id, 'D', 'Đáp án đúng: D.

Phân tích bài đọc & dẫn chứng:
Who does this advertisement mainly target?
(A) Anyone who failed at dieting during the summer
(B) People without much time on their hands
(C) Athletes training for upcoming competitions
(D) People who need a little nudge at getting into shape
这个广告主要针对哪些顾客？
(A)
任何在夏季节食失败的人
(B)
没有很多业余时间的人
(C)
为即将到来的比赛做准备的运动员
(D)
一些需要敦促去强身健体的人
→广告中提到，这是面向无法积极坚持健身运动的一类人的针对性培训
项目。故答案为(D)。。', NULL);

  -- Question #158 (toeic_part_7)
  SELECT id INTO v_question_id FROM assessment_questions WHERE assessment_id = v_assessment_id AND position = 158;
  IF v_question_id IS NULL THEN
    INSERT INTO assessment_questions (assessment_id, skill, category, difficulty, level, question_type, prompt, context_text, audio_url, options, position, weight)
    VALUES (v_assessment_id, 'reading', 'toeic_part_7', 3, 'b2', 'multiple_choice', 'What is NOT offered in the advertisement?', 'Questions 157-158
 refer to the following advertisement.
Pump It
special offer
Look your best this summer with our state of the art equipment and a tailor-made
training program made specially for you by one of our top rated personal trainers
If you are having a difficult time getting motivated, Pump It is where you
want to be.
With a personal trainer assigned to you, you’ll be placed in a tailor-made
program that will make you look your best in just 12 weeks.
With our program, you will get the full benefits of…
• Our one-on-one support and expert guidance by the top trainers in our
industry
• The use of the most updated fitness equipment money can buy, including
free weights, treadmills, bikes, and even a his and hers sauna
• Ongoing group classes, from aerobics to yoga to dancercise to ‘abs-butts-
thighs’,just to name a few
• For the time being, absolutely no joining fee and a very affordable monthly
membership rates
So come for a free consultation, and get started today!
Don’t miss out!
Offer is good until this Friday
310 St. George Street, Suite 601, Chicago
805


## PDF 第 35 页

![PDF 第 35 页](images/read_page_35.png)



T: 755-3422 W: pumpitclub.com', NULL, '[{"id":"A","text":"Continuation of organized lessons"},{"id":"B","text":"Personalized coaching to suit individuals’ needs"},{"id":"C","text":"Free signup"},{"id":"D","text":"Annual membership discounts"}]'::jsonb, 158, 1.0)
    RETURNING id INTO v_question_id;
  ELSE
    UPDATE assessment_questions SET
      skill = 'reading',
      category = 'toeic_part_7',
      difficulty = 3,
      level = 'b2',
      prompt = 'What is NOT offered in the advertisement?',
      context_text = 'Questions 157-158
 refer to the following advertisement.
Pump It
special offer
Look your best this summer with our state of the art equipment and a tailor-made
training program made specially for you by one of our top rated personal trainers
If you are having a difficult time getting motivated, Pump It is where you
want to be.
With a personal trainer assigned to you, you’ll be placed in a tailor-made
program that will make you look your best in just 12 weeks.
With our program, you will get the full benefits of…
• Our one-on-one support and expert guidance by the top trainers in our
industry
• The use of the most updated fitness equipment money can buy, including
free weights, treadmills, bikes, and even a his and hers sauna
• Ongoing group classes, from aerobics to yoga to dancercise to ‘abs-butts-
thighs’,just to name a few
• For the time being, absolutely no joining fee and a very affordable monthly
membership rates
So come for a free consultation, and get started today!
Don’t miss out!
Offer is good until this Friday
310 St. George Street, Suite 601, Chicago
805


## PDF 第 35 页

![PDF 第 35 页](images/read_page_35.png)



T: 755-3422 W: pumpitclub.com',
      audio_url = NULL,
      options = '[{"id":"A","text":"Continuation of organized lessons"},{"id":"B","text":"Personalized coaching to suit individuals’ needs"},{"id":"C","text":"Free signup"},{"id":"D","text":"Annual membership discounts"}]'::jsonb
    WHERE id = v_question_id;
  END IF;

  -- Answer for #158
  DELETE FROM assessment_question_answers WHERE question_id = v_question_id;
  INSERT INTO assessment_question_answers (question_id, correct_option_id, explanation, transcript_text)
  VALUES (v_question_id, 'D', 'Đáp án đúng: D.

Phân tích bài đọc & dẫn chứng:
What is NOT offered in the advertisement?
(A) Continuation of organized lessons
(B) Personalized coaching to suit individuals’ needs
(C) Free signup
(D) Annual membership discounts
广告中没有提供下列哪一项？
(A)
延续有组织的课程
(B)
针对不同需求的个人训练
(C)
免费入会
(D)
会员年费的折扣
→广告中提到，有连续进行的有氧健身操、瑜伽和舞蹈健身操等课程
(A)，专业教练进行一对一指导(B)，无需入会费，会员费也不贵(C)。故答
1255
```

## PDF 第 485 页

```text
案为(D)。
▼ Vocabulary Check
equipment
设备，装备
 tailor-made
定做的
 motivated
有积极性的
 assigned
指定的
 benefit
好处，益处
 guidance
指导
 treadmill
跑步机
 absolutely
完全地；
绝对地
 affordable
付得起的
 membership
会员资格
 consultation
咨询，请教
athlete
运动员
 competition
比赛
 nudge
推进，敦促
 continuation
延续，继续
lesson
课程
 personalized
个人化的
Questions 159-161
 refer to the following information.', NULL);

  -- Question #159 (toeic_part_7)
  SELECT id INTO v_question_id FROM assessment_questions WHERE assessment_id = v_assessment_id AND position = 159;
  IF v_question_id IS NULL THEN
    INSERT INTO assessment_questions (assessment_id, skill, category, difficulty, level, question_type, prompt, context_text, audio_url, options, position, weight)
    VALUES (v_assessment_id, 'reading', 'toeic_part_7', 3, 'b2', 'multiple_choice', 'Where would this information most likely be posted?', 'Questions 159-161
 refer to the following information.
806


## PDF 第 36 页

![PDF 第 36 页](images/read_page_36.png)', NULL, '[{"id":"A","text":"At a bus stop"},{"id":"B","text":"In a hotel lobby"},{"id":"C","text":"At a shopping center"},{"id":"D","text":"At a post office"}]'::jsonb, 159, 1.0)
    RETURNING id INTO v_question_id;
  ELSE
    UPDATE assessment_questions SET
      skill = 'reading',
      category = 'toeic_part_7',
      difficulty = 3,
      level = 'b2',
      prompt = 'Where would this information most likely be posted?',
      context_text = 'Questions 159-161
 refer to the following information.
806


## PDF 第 36 页

![PDF 第 36 页](images/read_page_36.png)',
      audio_url = NULL,
      options = '[{"id":"A","text":"At a bus stop"},{"id":"B","text":"In a hotel lobby"},{"id":"C","text":"At a shopping center"},{"id":"D","text":"At a post office"}]'::jsonb
    WHERE id = v_question_id;
  END IF;

  -- Answer for #159
  DELETE FROM assessment_question_answers WHERE question_id = v_question_id;
  INSERT INTO assessment_question_answers (question_id, correct_option_id, explanation, transcript_text)
  VALUES (v_question_id, 'B', 'Đáp án đúng: B.

Phân tích bài đọc & dẫn chứng:
Where would this information most likely be posted?
(A) At a bus stop
(B) In a hotel lobby
(C) At a shopping center (D) At a post office
这些信息最可能张贴在哪里？
(A)
公交车站
 (B)
酒店大厅
(C)
购物中心
 (D)
邮局
1256
```

## PDF 第 486 页

```text
→表格最下端写有FOR MORE INFORMATION ASK AT FRONT DESK。答案是
(B)。', NULL);

  -- Question #160 (toeic_part_7)
  SELECT id INTO v_question_id FROM assessment_questions WHERE assessment_id = v_assessment_id AND position = 160;
  IF v_question_id IS NULL THEN
    INSERT INTO assessment_questions (assessment_id, skill, category, difficulty, level, question_type, prompt, context_text, audio_url, options, position, weight)
    VALUES (v_assessment_id, 'reading', 'toeic_part_7', 3, 'b2', 'multiple_choice', 'According to the information, which can be performed at 1 o’clock in the morning?', 'Questions 159-161
 refer to the following information.
806


## PDF 第 36 页

![PDF 第 36 页](images/read_page_36.png)', NULL, '[{"id":"A","text":"Withdrawing some cash"},{"id":"B","text":"Working out at the gym"},{"id":"C","text":"Getting medicine for a cold"},{"id":"D","text":"Getting pictures developed"}]'::jsonb, 160, 1.0)
    RETURNING id INTO v_question_id;
  ELSE
    UPDATE assessment_questions SET
      skill = 'reading',
      category = 'toeic_part_7',
      difficulty = 3,
      level = 'b2',
      prompt = 'According to the information, which can be performed at 1 o’clock in the morning?',
      context_text = 'Questions 159-161
 refer to the following information.
806


## PDF 第 36 页

![PDF 第 36 页](images/read_page_36.png)',
      audio_url = NULL,
      options = '[{"id":"A","text":"Withdrawing some cash"},{"id":"B","text":"Working out at the gym"},{"id":"C","text":"Getting medicine for a cold"},{"id":"D","text":"Getting pictures developed"}]'::jsonb
    WHERE id = v_question_id;
  END IF;

  -- Answer for #160
  DELETE FROM assessment_question_answers WHERE question_id = v_question_id;
  INSERT INTO assessment_question_answers (question_id, correct_option_id, explanation, transcript_text)
  VALUES (v_question_id, 'C', 'Đáp án đúng: C.

Phân tích bài đọc & dẫn chứng:
According to the information, which can be performed at 1 o’clock in the
morning?
(A) Withdrawing some cash
(B) Working out at the gym
(C) Getting medicine for a cold
(D) Getting pictures developed
根据提供的信息，凌晨
1
点钟能进行下列哪项活动？
(A)
取现金
(B)
去健身房锻炼
(C)
买感冒药
(D)
冲印照片
→药店24小时营业。答案是(C)。', NULL);

  -- Question #161 (toeic_part_7)
  SELECT id INTO v_question_id FROM assessment_questions WHERE assessment_id = v_assessment_id AND position = 161;
  IF v_question_id IS NULL THEN
    INSERT INTO assessment_questions (assessment_id, skill, category, difficulty, level, question_type, prompt, context_text, audio_url, options, position, weight)
    VALUES (v_assessment_id, 'reading', 'toeic_part_7', 3, 'b2', 'multiple_choice', 'What can be inferred from the information?', 'Questions 159-161
 refer to the following information.
806


## PDF 第 36 页

![PDF 第 36 页](images/read_page_36.png)', NULL, '[{"id":"A","text":"A ride to the airport is available very infrequently."},{"id":"B","text":"Packages can be sent during business hours."},{"id":"C","text":"Guests can get their suits pressed right from their rooms."},{"id":"D","text":"Help with the bags is available with just a phone call."}]'::jsonb, 161, 1.0)
    RETURNING id INTO v_question_id;
  ELSE
    UPDATE assessment_questions SET
      skill = 'reading',
      category = 'toeic_part_7',
      difficulty = 3,
      level = 'b2',
      prompt = 'What can be inferred from the information?',
      context_text = 'Questions 159-161
 refer to the following information.
806


## PDF 第 36 页

![PDF 第 36 页](images/read_page_36.png)',
      audio_url = NULL,
      options = '[{"id":"A","text":"A ride to the airport is available very infrequently."},{"id":"B","text":"Packages can be sent during business hours."},{"id":"C","text":"Guests can get their suits pressed right from their rooms."},{"id":"D","text":"Help with the bags is available with just a phone call."}]'::jsonb
    WHERE id = v_question_id;
  END IF;

  -- Answer for #161
  DELETE FROM assessment_question_answers WHERE question_id = v_question_id;
  INSERT INTO assessment_question_answers (question_id, correct_option_id, explanation, transcript_text)
  VALUES (v_question_id, 'B', 'Đáp án đúng: B.

Phân tích bài đọc & dẫn chứng:
What can be inferred from the information?
(A) A ride to the airport is available very infrequently.
(B) Packages can be sent during business hours.
(C) Guests can get their suits pressed right from their rooms.
(D) Help with the bags is available with just a phone call.
提供的信息暗示了什么？
(A)
去机场的班车班次很少。
(B)
营业时间可以邮寄包裹。
(C)
顾客能从他们的房间叫熨衣服务。
(D)
打电话就能有人帮忙提行李。
1257
```

## PDF 第 487 页

```text
→机场大巴每10分钟一趟，故排除(A)，信息中未提及熨衣服务，从房
间可叫的服务是冲洗照片，故排除(C)，可以叫前台帮忙搬运行李，而不是
打电话就有人帮忙，故排除(D)。答案是(B)。
▼ Vocabulary Check
vicinity
邻近；接近
 emergency
紧急情况，突然事件
 developing (
照片
)
冲印，显影
 ext.(=extension)
分机号码
 assistance
帮助，援助
 luggage
行李
gym
健身房
 basement
地下室
 perform
执行，完成
 withdraw
取
(
款
)
Questions 162-164
 refer to the following memorandum.
备忘录
致：销售人员
自：乔纳森
·
布莱尔
日期：
8
月
22
日
回复：新广告活动
今年的新婴儿服生产线让我们很激动。下面的内容是我们计划促销新
服装的市场策略总纲要。众所周知，这是我们第一次踏入这一市场，我们
期望得到良好的效益。此外，我们已经在全国最大的几家媒体发起了最大
型、最昂贵的广告活动。
欢迎各位同仁向市场营销部提出意见和想法。', NULL);

  -- Question #162 (toeic_part_7)
  SELECT id INTO v_question_id FROM assessment_questions WHERE assessment_id = v_assessment_id AND position = 162;
  IF v_question_id IS NULL THEN
    INSERT INTO assessment_questions (assessment_id, skill, category, difficulty, level, question_type, prompt, context_text, audio_url, options, position, weight)
    VALUES (v_assessment_id, 'reading', 'toeic_part_7', 3, 'b2', 'multiple_choice', 'What is the main purpose of the memorandum?', 'Questions 162-164
 refer to the following memorandum.
MEMORANDUM
TO: Marketing staff
FROM: Jonathan Blair
DATE: August 22
RE: New Advertising Campaign
We are very excited about our new line of infant clothes this year. The
following will give you a general outline of the marketing strategies we have
planned to help promote our new clothes. As you all know, this is our first
attempt in this market, and we are anticipating great results. And to add to this,
we have put together our biggest and most expensive ad campaign in several of
the country’s largest media.
808


## PDF 第 38 页

![PDF 第 38 页](images/read_page_38.png)



Everyone is encouraged to submit comments and ideas to the Marketing
Department.', NULL, '[{"id":"A","text":"To recruit talented people to work on an advertising project"},{"id":"B","text":"To announce the company’s future plans"},{"id":"C","text":"To inform the staff members about a television documentary"},{"id":"D","text":"To find a model spokesperson for the posters"}]'::jsonb, 162, 1.0)
    RETURNING id INTO v_question_id;
  ELSE
    UPDATE assessment_questions SET
      skill = 'reading',
      category = 'toeic_part_7',
      difficulty = 3,
      level = 'b2',
      prompt = 'What is the main purpose of the memorandum?',
      context_text = 'Questions 162-164
 refer to the following memorandum.
MEMORANDUM
TO: Marketing staff
FROM: Jonathan Blair
DATE: August 22
RE: New Advertising Campaign
We are very excited about our new line of infant clothes this year. The
following will give you a general outline of the marketing strategies we have
planned to help promote our new clothes. As you all know, this is our first
attempt in this market, and we are anticipating great results. And to add to this,
we have put together our biggest and most expensive ad campaign in several of
the country’s largest media.
808


## PDF 第 38 页

![PDF 第 38 页](images/read_page_38.png)



Everyone is encouraged to submit comments and ideas to the Marketing
Department.',
      audio_url = NULL,
      options = '[{"id":"A","text":"To recruit talented people to work on an advertising project"},{"id":"B","text":"To announce the company’s future plans"},{"id":"C","text":"To inform the staff members about a television documentary"},{"id":"D","text":"To find a model spokesperson for the posters"}]'::jsonb
    WHERE id = v_question_id;
  END IF;

  -- Answer for #162
  DELETE FROM assessment_question_answers WHERE question_id = v_question_id;
  INSERT INTO assessment_question_answers (question_id, correct_option_id, explanation, transcript_text)
  VALUES (v_question_id, 'B', 'Đáp án đúng: B.

Phân tích bài đọc & dẫn chứng:
What is the main purpose of the memorandum?
1258
```

## PDF 第 488 页

```text
(A) To recruit talented people to work on an advertising project
(B) To announce the company’s future plans
(C) To inform the staff members about a television documentary
(D) To find a model spokesperson for the posters
这个备忘录的主要目的是什么？
(A)
招募英才参加广告项目
(B)
宣布公司的未来计划
(C)
通知员工收看电视纪录片
(D)
寻找一位海报代言人
→备忘录介绍了即将上市的婴儿服的销售策略。答案是(B)。', NULL);

  -- Question #163 (toeic_part_7)
  SELECT id INTO v_question_id FROM assessment_questions WHERE assessment_id = v_assessment_id AND position = 163;
  IF v_question_id IS NULL THEN
    INSERT INTO assessment_questions (assessment_id, skill, category, difficulty, level, question_type, prompt, context_text, audio_url, options, position, weight)
    VALUES (v_assessment_id, 'reading', 'toeic_part_7', 3, 'b2', 'multiple_choice', 'Who is the target audience for the new products being launched?', 'Questions 162-164
 refer to the following memorandum.
MEMORANDUM
TO: Marketing staff
FROM: Jonathan Blair
DATE: August 22
RE: New Advertising Campaign
We are very excited about our new line of infant clothes this year. The
following will give you a general outline of the marketing strategies we have
planned to help promote our new clothes. As you all know, this is our first
attempt in this market, and we are anticipating great results. And to add to this,
we have put together our biggest and most expensive ad campaign in several of
the country’s largest media.
808


## PDF 第 38 页

![PDF 第 38 页](images/read_page_38.png)



Everyone is encouraged to submit comments and ideas to the Marketing
Department.', NULL, '[{"id":"A","text":"Babies"},{"id":"B","text":"Children"},{"id":"C","text":"Adults"},{"id":"D","text":"Seniors"}]'::jsonb, 163, 1.0)
    RETURNING id INTO v_question_id;
  ELSE
    UPDATE assessment_questions SET
      skill = 'reading',
      category = 'toeic_part_7',
      difficulty = 3,
      level = 'b2',
      prompt = 'Who is the target audience for the new products being launched?',
      context_text = 'Questions 162-164
 refer to the following memorandum.
MEMORANDUM
TO: Marketing staff
FROM: Jonathan Blair
DATE: August 22
RE: New Advertising Campaign
We are very excited about our new line of infant clothes this year. The
following will give you a general outline of the marketing strategies we have
planned to help promote our new clothes. As you all know, this is our first
attempt in this market, and we are anticipating great results. And to add to this,
we have put together our biggest and most expensive ad campaign in several of
the country’s largest media.
808


## PDF 第 38 页

![PDF 第 38 页](images/read_page_38.png)



Everyone is encouraged to submit comments and ideas to the Marketing
Department.',
      audio_url = NULL,
      options = '[{"id":"A","text":"Babies"},{"id":"B","text":"Children"},{"id":"C","text":"Adults"},{"id":"D","text":"Seniors"}]'::jsonb
    WHERE id = v_question_id;
  END IF;

  -- Answer for #163
  DELETE FROM assessment_question_answers WHERE question_id = v_question_id;
  INSERT INTO assessment_question_answers (question_id, correct_option_id, explanation, transcript_text)
  VALUES (v_question_id, 'A', 'Đáp án đúng: A.

Phân tích bài đọc & dẫn chứng:
Who is the target audience for the new products being launched?
(A) Babies
 (B) Children
(C) Adults (D) Seniors
即将发售的新产品是针对哪些顾客的？
(A)
婴儿
 (B)
儿童
(C)
成年人
 (D)
老年人
→新上市的产品是婴儿服，infant是a baby or very young child的意
思。答案是(A)。', NULL);

  -- Question #164 (toeic_part_7)
  SELECT id INTO v_question_id FROM assessment_questions WHERE assessment_id = v_assessment_id AND position = 164;
  IF v_question_id IS NULL THEN
    INSERT INTO assessment_questions (assessment_id, skill, category, difficulty, level, question_type, prompt, context_text, audio_url, options, position, weight)
    VALUES (v_assessment_id, 'reading', 'toeic_part_7', 3, 'b2', 'multiple_choice', 'What can be inferred from the memorandum?', 'Questions 162-164
 refer to the following memorandum.
MEMORANDUM
TO: Marketing staff
FROM: Jonathan Blair
DATE: August 22
RE: New Advertising Campaign
We are very excited about our new line of infant clothes this year. The
following will give you a general outline of the marketing strategies we have
planned to help promote our new clothes. As you all know, this is our first
attempt in this market, and we are anticipating great results. And to add to this,
we have put together our biggest and most expensive ad campaign in several of
the country’s largest media.
808


## PDF 第 38 页

![PDF 第 38 页](images/read_page_38.png)



Everyone is encouraged to submit comments and ideas to the Marketing
Department.', NULL, '[{"id":"A","text":"Local television is airing a special on the company."},{"id":"B","text":"The company is breaking into a new market."},{"id":"C","text":"An article about the company has been printed in the local paper."},{"id":"D","text":"The subway and bus strikes will affect the company."}]'::jsonb, 164, 1.0)
    RETURNING id INTO v_question_id;
  ELSE
    UPDATE assessment_questions SET
      skill = 'reading',
      category = 'toeic_part_7',
      difficulty = 3,
      level = 'b2',
      prompt = 'What can be inferred from the memorandum?',
      context_text = 'Questions 162-164
 refer to the following memorandum.
MEMORANDUM
TO: Marketing staff
FROM: Jonathan Blair
DATE: August 22
RE: New Advertising Campaign
We are very excited about our new line of infant clothes this year. The
following will give you a general outline of the marketing strategies we have
planned to help promote our new clothes. As you all know, this is our first
attempt in this market, and we are anticipating great results. And to add to this,
we have put together our biggest and most expensive ad campaign in several of
the country’s largest media.
808


## PDF 第 38 页

![PDF 第 38 页](images/read_page_38.png)



Everyone is encouraged to submit comments and ideas to the Marketing
Department.',
      audio_url = NULL,
      options = '[{"id":"A","text":"Local television is airing a special on the company."},{"id":"B","text":"The company is breaking into a new market."},{"id":"C","text":"An article about the company has been printed in the local paper."},{"id":"D","text":"The subway and bus strikes will affect the company."}]'::jsonb
    WHERE id = v_question_id;
  END IF;

  -- Answer for #164
  DELETE FROM assessment_question_answers WHERE question_id = v_question_id;
  INSERT INTO assessment_question_answers (question_id, correct_option_id, explanation, transcript_text)
  VALUES (v_question_id, 'B', 'Đáp án đúng: B.

Phân tích bài đọc & dẫn chứng:
What can be inferred from the memorandum?
(A) Local television is airing a special on the company.
(B) The company is breaking into a new market.
(C) An article about the company has been printed in the local paper.
(D) The subway and bus strikes will affect the company.
1259
```

## PDF 第 489 页

```text
从这个备忘录中可以推断出什么？
(A)
当地电视台为公司提供了特别服务。
(B)
公司正在进军新市场。
(C)
一篇关于该公司的报道已刊登在当地的报纸上。
(D)
地铁和公交员工的罢工会影响到该公司。
→这是该公司在婴儿服行业的第一次尝试。答案是(B)。
▼ Vocabulary Check
memorandum
备忘录，便笺
 advertising
广告
 infant
婴儿，幼儿
 promote
宣传，推销
 attempt
尝试
 anticipate
期望，盼望
 commercial
广告节目
 showing
放映
 feature
特载
 illustration
插图
 discount
折扣
 encourage
鼓励，支持
 recruit
征募
 documentary
纪录片
 spokesperson
代言人
 target
目标
 product
产品
 launch
上市
 strike
罢工
 affect
影响
Questions 165-167
 refer to the following notice.
你是否对豚草过敏？
你是否在夏末出现以下症状：
打喷嚏？
流鼻涕，鼻子痒？
眼睛红肿、流泪、发痒？
豚草过敏研究所正在进行一项研究并招募志愿者来参加药物实验测试。
通过资格审查程序的志愿者将获得补偿金。
联系电话：
905-629-3333(
分机
1)
或拨打免费电话
1-800-RIRA-5544
电子邮箱：
volunteer@researchinstitute-ragweed.com
正常工作时间：周一到周五上午
9
点至下午
6
点
1260
```

## PDF 第 490 页

```text
周六上午
9
点至下午
1
点
豚草过敏研究所
密西少哥市迪协路
4520
号
艾格零顿大街往南两个街区
www.researchinstitute-ragweed.com', NULL);

  -- Question #165 (toeic_part_7)
  SELECT id INTO v_question_id FROM assessment_questions WHERE assessment_id = v_assessment_id AND position = 165;
  IF v_question_id IS NULL THEN
    INSERT INTO assessment_questions (assessment_id, skill, category, difficulty, level, question_type, prompt, context_text, audio_url, options, position, weight)
    VALUES (v_assessment_id, 'reading', 'toeic_part_7', 3, 'b2', 'multiple_choice', 'What is the primary reason for taking out this notice?', 'Questions 165-167
 refer to the following notice.
Are you suffering from
RAGWEED ALLERGIES?
Are you one of those people who suffer from:
sneezing?
runny, itchy noses?
red, watery, itchy eyes?
during the latter part of the summer months…
The Research Institute of Ragweed Allergies is
currently conducting a study and is asking volunteers
to participate in testing an experimental drug.
Those who pass the qualification procedure
will receive compensation for his/her part in contributing to the study.
Call: 905-629-3333 (ext. 1) or Toll free: 1-800-RIRA-5544
E-mail: volunteer@researchinstitute-ragweed.com
810


## PDF 第 40 页

![PDF 第 40 页](images/read_page_40.png)



Regular hours of operation: Monday to Friday: 9 a.m. to 6 p.m.
Saturday: 9 a.m. to 1 p.m.
Research Institute of RA
4520 Dixie Rd in Missisauga
2 blocks south of Eglington Ave.
www.researchinstitute-ragweed.com', NULL, '[{"id":"A","text":"To announce a medical breakthrough in curing ragweed allergies"},{"id":"B","text":"To inform the public about the spread of a new type of an allergy"},{"id":"C","text":"To recruit people who are willing to come forward for a medical cause"},{"id":"D","text":"To provide the results of a test conducted by the research institute"}]'::jsonb, 165, 1.0)
    RETURNING id INTO v_question_id;
  ELSE
    UPDATE assessment_questions SET
      skill = 'reading',
      category = 'toeic_part_7',
      difficulty = 3,
      level = 'b2',
      prompt = 'What is the primary reason for taking out this notice?',
      context_text = 'Questions 165-167
 refer to the following notice.
Are you suffering from
RAGWEED ALLERGIES?
Are you one of those people who suffer from:
sneezing?
runny, itchy noses?
red, watery, itchy eyes?
during the latter part of the summer months…
The Research Institute of Ragweed Allergies is
currently conducting a study and is asking volunteers
to participate in testing an experimental drug.
Those who pass the qualification procedure
will receive compensation for his/her part in contributing to the study.
Call: 905-629-3333 (ext. 1) or Toll free: 1-800-RIRA-5544
E-mail: volunteer@researchinstitute-ragweed.com
810


## PDF 第 40 页

![PDF 第 40 页](images/read_page_40.png)



Regular hours of operation: Monday to Friday: 9 a.m. to 6 p.m.
Saturday: 9 a.m. to 1 p.m.
Research Institute of RA
4520 Dixie Rd in Missisauga
2 blocks south of Eglington Ave.
www.researchinstitute-ragweed.com',
      audio_url = NULL,
      options = '[{"id":"A","text":"To announce a medical breakthrough in curing ragweed allergies"},{"id":"B","text":"To inform the public about the spread of a new type of an allergy"},{"id":"C","text":"To recruit people who are willing to come forward for a medical cause"},{"id":"D","text":"To provide the results of a test conducted by the research institute"}]'::jsonb
    WHERE id = v_question_id;
  END IF;

  -- Answer for #165
  DELETE FROM assessment_question_answers WHERE question_id = v_question_id;
  INSERT INTO assessment_question_answers (question_id, correct_option_id, explanation, transcript_text)
  VALUES (v_question_id, 'C', 'Đáp án đúng: C.

Phân tích bài đọc & dẫn chứng:
What is the primary reason for taking out this notice?
(A) To announce a medical breakthrough in curing ragweed allergies
(B) To inform the public about the spread of a new type of an allergy
(C) To recruit people who are willing to come forward for a medical cause
(D) To provide the results of a test conducted by the research institute
发出这个通知的主要原因是什么？
(A)
宣布治疗豚草过敏的一项医学突破
(B)
通知公众一种新的过敏在蔓延
(C)
招募愿意参加医学测试的志愿者
(D)
提供研究所组织的一项测试的结果
→研究所为了进行新药物的临床试验，正在招募志愿者。答案是(C)。', NULL);

  -- Question #166 (toeic_part_7)
  SELECT id INTO v_question_id FROM assessment_questions WHERE assessment_id = v_assessment_id AND position = 166;
  IF v_question_id IS NULL THEN
    INSERT INTO assessment_questions (assessment_id, skill, category, difficulty, level, question_type, prompt, context_text, audio_url, options, position, weight)
    VALUES (v_assessment_id, 'reading', 'toeic_part_7', 3, 'b2', 'multiple_choice', 'What can be implied about Ragweed allergies from the notice?', 'Questions 165-167
 refer to the following notice.
Are you suffering from
RAGWEED ALLERGIES?
Are you one of those people who suffer from:
sneezing?
runny, itchy noses?
red, watery, itchy eyes?
during the latter part of the summer months…
The Research Institute of Ragweed Allergies is
currently conducting a study and is asking volunteers
to participate in testing an experimental drug.
Those who pass the qualification procedure
will receive compensation for his/her part in contributing to the study.
Call: 905-629-3333 (ext. 1) or Toll free: 1-800-RIRA-5544
E-mail: volunteer@researchinstitute-ragweed.com
810


## PDF 第 40 页

![PDF 第 40 页](images/read_page_40.png)



Regular hours of operation: Monday to Friday: 9 a.m. to 6 p.m.
Saturday: 9 a.m. to 1 p.m.
Research Institute of RA
4520 Dixie Rd in Missisauga
2 blocks south of Eglington Ave.
www.researchinstitute-ragweed.com', NULL, '[{"id":"A","text":"They’re most prevalent during the late summer months."},{"id":"B","text":"Research about them has been ongoing for the entire summer."},{"id":"C","text":"They have been the main public issue in recent months."},{"id":"D","text":"They affect a great number of people living in hot climates."}]'::jsonb, 166, 1.0)
    RETURNING id INTO v_question_id;
  ELSE
    UPDATE assessment_questions SET
      skill = 'reading',
      category = 'toeic_part_7',
      difficulty = 3,
      level = 'b2',
      prompt = 'What can be implied about Ragweed allergies from the notice?',
      context_text = 'Questions 165-167
 refer to the following notice.
Are you suffering from
RAGWEED ALLERGIES?
Are you one of those people who suffer from:
sneezing?
runny, itchy noses?
red, watery, itchy eyes?
during the latter part of the summer months…
The Research Institute of Ragweed Allergies is
currently conducting a study and is asking volunteers
to participate in testing an experimental drug.
Those who pass the qualification procedure
will receive compensation for his/her part in contributing to the study.
Call: 905-629-3333 (ext. 1) or Toll free: 1-800-RIRA-5544
E-mail: volunteer@researchinstitute-ragweed.com
810


## PDF 第 40 页

![PDF 第 40 页](images/read_page_40.png)



Regular hours of operation: Monday to Friday: 9 a.m. to 6 p.m.
Saturday: 9 a.m. to 1 p.m.
Research Institute of RA
4520 Dixie Rd in Missisauga
2 blocks south of Eglington Ave.
www.researchinstitute-ragweed.com',
      audio_url = NULL,
      options = '[{"id":"A","text":"They’re most prevalent during the late summer months."},{"id":"B","text":"Research about them has been ongoing for the entire summer."},{"id":"C","text":"They have been the main public issue in recent months."},{"id":"D","text":"They affect a great number of people living in hot climates."}]'::jsonb
    WHERE id = v_question_id;
  END IF;

  -- Answer for #166
  DELETE FROM assessment_question_answers WHERE question_id = v_question_id;
  INSERT INTO assessment_question_answers (question_id, correct_option_id, explanation, transcript_text)
  VALUES (v_question_id, 'A', 'Đáp án đúng: A.

Phân tích bài đọc & dẫn chứng:
What can be implied about Ragweed allergies from the notice?
(A) They’re most prevalent during the late summer months.
(B) Research about them has been ongoing for the entire summer.
(C) They have been the main public issue in recent months.
(D) They affect a great number of people living in hot climates.
从通知中能推断出有关豚草过敏的什么信息？
1261
```

## PDF 第 491 页

```text
(A)
它们在夏末很流行。
(B)
对它们的研究已经持续了整个夏天。
(C)
它们成为最近几个月的主要公共问题。
(D)
它们影响了很多居住在气候炎热地区的人们。
→根据通知开头可以推断出该过敏症在夏末盛行。答案是(A)。', NULL);

  -- Question #167 (toeic_part_7)
  SELECT id INTO v_question_id FROM assessment_questions WHERE assessment_id = v_assessment_id AND position = 167;
  IF v_question_id IS NULL THEN
    INSERT INTO assessment_questions (assessment_id, skill, category, difficulty, level, question_type, prompt, context_text, audio_url, options, position, weight)
    VALUES (v_assessment_id, 'reading', 'toeic_part_7', 3, 'b2', 'multiple_choice', 'Which of the following information is NOT found in the notice?', 'Questions 165-167
 refer to the following notice.
Are you suffering from
RAGWEED ALLERGIES?
Are you one of those people who suffer from:
sneezing?
runny, itchy noses?
red, watery, itchy eyes?
during the latter part of the summer months…
The Research Institute of Ragweed Allergies is
currently conducting a study and is asking volunteers
to participate in testing an experimental drug.
Those who pass the qualification procedure
will receive compensation for his/her part in contributing to the study.
Call: 905-629-3333 (ext. 1) or Toll free: 1-800-RIRA-5544
E-mail: volunteer@researchinstitute-ragweed.com
810


## PDF 第 40 页

![PDF 第 40 页](images/read_page_40.png)



Regular hours of operation: Monday to Friday: 9 a.m. to 6 p.m.
Saturday: 9 a.m. to 1 p.m.
Research Institute of RA
4520 Dixie Rd in Missisauga
2 blocks south of Eglington Ave.
www.researchinstitute-ragweed.com', NULL, '[{"id":"A","text":"A number where interested people could call"},{"id":"B","text":"The specific compensation each participant will receive for volunteering"},{"id":"C","text":"The subject of the study being conducted"},{"id":"D","text":"The conditions required for those who want to make a contribution"}]'::jsonb, 167, 1.0)
    RETURNING id INTO v_question_id;
  ELSE
    UPDATE assessment_questions SET
      skill = 'reading',
      category = 'toeic_part_7',
      difficulty = 3,
      level = 'b2',
      prompt = 'Which of the following information is NOT found in the notice?',
      context_text = 'Questions 165-167
 refer to the following notice.
Are you suffering from
RAGWEED ALLERGIES?
Are you one of those people who suffer from:
sneezing?
runny, itchy noses?
red, watery, itchy eyes?
during the latter part of the summer months…
The Research Institute of Ragweed Allergies is
currently conducting a study and is asking volunteers
to participate in testing an experimental drug.
Those who pass the qualification procedure
will receive compensation for his/her part in contributing to the study.
Call: 905-629-3333 (ext. 1) or Toll free: 1-800-RIRA-5544
E-mail: volunteer@researchinstitute-ragweed.com
810


## PDF 第 40 页

![PDF 第 40 页](images/read_page_40.png)



Regular hours of operation: Monday to Friday: 9 a.m. to 6 p.m.
Saturday: 9 a.m. to 1 p.m.
Research Institute of RA
4520 Dixie Rd in Missisauga
2 blocks south of Eglington Ave.
www.researchinstitute-ragweed.com',
      audio_url = NULL,
      options = '[{"id":"A","text":"A number where interested people could call"},{"id":"B","text":"The specific compensation each participant will receive for volunteering"},{"id":"C","text":"The subject of the study being conducted"},{"id":"D","text":"The conditions required for those who want to make a contribution"}]'::jsonb
    WHERE id = v_question_id;
  END IF;

  -- Answer for #167
  DELETE FROM assessment_question_answers WHERE question_id = v_question_id;
  INSERT INTO assessment_question_answers (question_id, correct_option_id, explanation, transcript_text)
  VALUES (v_question_id, 'B', 'Đáp án đúng: B.

Phân tích bài đọc & dẫn chứng:
Which of the following information is NOT found in the notice?
(A) A number where interested people could call
(B) The specific compensation each participant will receive for volunteering
(C) The subject of the study being conducted
(D) The conditions required for those who want to make a contribution
以下哪条信息通知中没有包括？
(A)
感兴趣的人们可拨打的电话号码
(B)
参加测试的志愿者能领到的补偿金的具体金额
(C)
研究的主题
(D)
想为研究作贡献的志愿者需要符合的条件
→通知中有联系电话和免费电话(A)，通知的内容与抗过敏药物的临床
试验有关(C)，满足一定条件的志愿者才能参加临床试验(D)。答案是(B)。
▼ Vocabulary Check
ragweed
豚草
 allergy
过敏
 suffer
患病，受病痛折磨
 sneeze
打喷嚏
 runny
流鼻涕的
 itchy
痒的
 watery (
眼睛
)
泪汪汪的
 institute
研究所，协会
 volunteer
志愿者
 participate
参加，参与
 experimental
实验的
 qualification
资格
procedure
程序，步骤
 compensation
补偿金
 contribute
贡献
 regular
正常的
medical
医学的
 breakthrough
突破，突破性进展
 cure
治疗，治愈
 spread
传
播，蔓延
 come forward
自告奋勇，自愿
 cause
事业，目标
 provide
提供
conduct
进行，实施
 prevalent
普遍的，流行的
 ongoing
持续进行的，进行中
的
 climate
气候
 specific
具体的
 participant
参加者，参与者
 condition
条件，
状况
 contribution
贡献
1262
```

## PDF 第 492 页

```text
Questions 168-169
 refer to the following advertisement.
信用有问题？
信用卡被拒？
我们可以帮你！
(
收账代理
)
·
逾期付款
·
收回资产
·
破产
·
高额债务
ICR
独家价值
1500
万美元的计算机搜索程序
世界上独一无二
信用调查机构会怎样不遵从加拿大消费报告法案，以及对此你能做些什
么。
“
我们合法地恢复你的信用。
”
“
所有的信息都会严格保密。
”
合并债务，每月低额偿还！
预约电话：
416-755-7898', NULL);

  -- Question #168 (toeic_part_7)
  SELECT id INTO v_question_id FROM assessment_questions WHERE assessment_id = v_assessment_id AND position = 168;
  IF v_question_id IS NULL THEN
    INSERT INTO assessment_questions (assessment_id, skill, category, difficulty, level, question_type, prompt, context_text, audio_url, options, position, weight)
    VALUES (v_assessment_id, 'reading', 'toeic_part_7', 3, 'b2', 'multiple_choice', 'Who is the intended audience of this advertisement?', 'Questions 168-169
 refer to the following advertisement.
811


## PDF 第 41 页

![PDF 第 41 页](images/read_page_41.png)



CREDIT PROBLEM?
CREDIT DENIED?
WE CAN HELP!
( COLLECTION AGENCIES)
• LATE PAYMENTS • REPOSSESSIONS
• BANKRUPTCIES • BIG DEBTS
ICR’S Exclusive $15-million Computer Search Program.
The only one of its kind in the world
How credit agencies may not in compliance
With the Canadian Consumer Reporting Act and what
you can do about it.
“WE REPAIR CREDIT… LEGALLY”
“All information is strictly confidential.”
Consolidate debts into lower monthly payments!
Call for an appointment:
416-755-7898
812


## PDF 第 42 页

![PDF 第 42 页](images/read_page_42.png)', NULL, '[{"id":"A","text":"People who are in legal trouble"},{"id":"B","text":"Anyone who is having financial problems"},{"id":"C","text":"Businesses that are in need of tax breaks"},{"id":"D","text":"Workers who must do their yearly income taxes"}]'::jsonb, 168, 1.0)
    RETURNING id INTO v_question_id;
  ELSE
    UPDATE assessment_questions SET
      skill = 'reading',
      category = 'toeic_part_7',
      difficulty = 3,
      level = 'b2',
      prompt = 'Who is the intended audience of this advertisement?',
      context_text = 'Questions 168-169
 refer to the following advertisement.
811


## PDF 第 41 页

![PDF 第 41 页](images/read_page_41.png)



CREDIT PROBLEM?
CREDIT DENIED?
WE CAN HELP!
( COLLECTION AGENCIES)
• LATE PAYMENTS • REPOSSESSIONS
• BANKRUPTCIES • BIG DEBTS
ICR’S Exclusive $15-million Computer Search Program.
The only one of its kind in the world
How credit agencies may not in compliance
With the Canadian Consumer Reporting Act and what
you can do about it.
“WE REPAIR CREDIT… LEGALLY”
“All information is strictly confidential.”
Consolidate debts into lower monthly payments!
Call for an appointment:
416-755-7898
812


## PDF 第 42 页

![PDF 第 42 页](images/read_page_42.png)',
      audio_url = NULL,
      options = '[{"id":"A","text":"People who are in legal trouble"},{"id":"B","text":"Anyone who is having financial problems"},{"id":"C","text":"Businesses that are in need of tax breaks"},{"id":"D","text":"Workers who must do their yearly income taxes"}]'::jsonb
    WHERE id = v_question_id;
  END IF;

  -- Answer for #168
  DELETE FROM assessment_question_answers WHERE question_id = v_question_id;
  INSERT INTO assessment_question_answers (question_id, correct_option_id, explanation, transcript_text)
  VALUES (v_question_id, 'B', 'Đáp án đúng: B.

Phân tích bài đọc & dẫn chứng:
Who is the intended audience of this advertisement?
(A) People who are in legal trouble
(B) Anyone who is having financial problems
(C) Businesses that are in need of tax breaks
(D) Workers who must do their yearly income taxes
1263
```

## PDF 第 493 页

```text
这则广告的受众是哪些人？
(A)
有法律麻烦的人
(B)
任何有经济问题的人
(C)
需要减税的企业
(D)
必须每年交个人所得税的工人
→根据广告内容，可联想到因信用问题经济活动受制约的一类人。答案
是(B)。', NULL);

  -- Question #169 (toeic_part_7)
  SELECT id INTO v_question_id FROM assessment_questions WHERE assessment_id = v_assessment_id AND position = 169;
  IF v_question_id IS NULL THEN
    INSERT INTO assessment_questions (assessment_id, skill, category, difficulty, level, question_type, prompt, context_text, audio_url, options, position, weight)
    VALUES (v_assessment_id, 'reading', 'toeic_part_7', 3, 'b2', 'multiple_choice', 'What type of service does the company offer?', 'Questions 168-169
 refer to the following advertisement.
811


## PDF 第 41 页

![PDF 第 41 页](images/read_page_41.png)



CREDIT PROBLEM?
CREDIT DENIED?
WE CAN HELP!
( COLLECTION AGENCIES)
• LATE PAYMENTS • REPOSSESSIONS
• BANKRUPTCIES • BIG DEBTS
ICR’S Exclusive $15-million Computer Search Program.
The only one of its kind in the world
How credit agencies may not in compliance
With the Canadian Consumer Reporting Act and what
you can do about it.
“WE REPAIR CREDIT… LEGALLY”
“All information is strictly confidential.”
Consolidate debts into lower monthly payments!
Call for an appointment:
416-755-7898
812


## PDF 第 42 页

![PDF 第 42 页](images/read_page_42.png)', NULL, '[{"id":"A","text":"It helps those who are in debt."},{"id":"B","text":"It lends money at low interest."},{"id":"C","text":"It invests in potential companies."},{"id":"D","text":"It provides legal counseling to people in trouble."}]'::jsonb, 169, 1.0)
    RETURNING id INTO v_question_id;
  ELSE
    UPDATE assessment_questions SET
      skill = 'reading',
      category = 'toeic_part_7',
      difficulty = 3,
      level = 'b2',
      prompt = 'What type of service does the company offer?',
      context_text = 'Questions 168-169
 refer to the following advertisement.
811


## PDF 第 41 页

![PDF 第 41 页](images/read_page_41.png)



CREDIT PROBLEM?
CREDIT DENIED?
WE CAN HELP!
( COLLECTION AGENCIES)
• LATE PAYMENTS • REPOSSESSIONS
• BANKRUPTCIES • BIG DEBTS
ICR’S Exclusive $15-million Computer Search Program.
The only one of its kind in the world
How credit agencies may not in compliance
With the Canadian Consumer Reporting Act and what
you can do about it.
“WE REPAIR CREDIT… LEGALLY”
“All information is strictly confidential.”
Consolidate debts into lower monthly payments!
Call for an appointment:
416-755-7898
812


## PDF 第 42 页

![PDF 第 42 页](images/read_page_42.png)',
      audio_url = NULL,
      options = '[{"id":"A","text":"It helps those who are in debt."},{"id":"B","text":"It lends money at low interest."},{"id":"C","text":"It invests in potential companies."},{"id":"D","text":"It provides legal counseling to people in trouble."}]'::jsonb
    WHERE id = v_question_id;
  END IF;

  -- Answer for #169
  DELETE FROM assessment_question_answers WHERE question_id = v_question_id;
  INSERT INTO assessment_question_answers (question_id, correct_option_id, explanation, transcript_text)
  VALUES (v_question_id, 'A', 'Đáp án đúng: A.

Phân tích bài đọc & dẫn chứng:
What type of service does the company offer?
(A) It helps those who are in debt.
(B) It lends money at low interest.
(C) It invests in potential companies.
(D) It provides legal counseling to people in trouble.
这家公司提供什么类型的服务？
(A)
它帮助那些债务缠身的人。
(B)
它提供低息贷款。
(C)
它投资有潜力的公司。
(D)
它为有困难的人提供法律咨询。
→文章中提到了逾期还款、破产等内容，而且提到合并债务以减少月偿
还额。答案是(A)。
▼ Vocabulary Check
deny
拒绝
 agency
代理，机构
 bankruptcy
破产，倒闭
 debt
债，债务
exclusive
独家的，专有的
 compliance
按照，遵照
 repair
恢复，修复
 legally
合法地
 strictly
严格地
 confidential
秘密的，机密的
 consolidate
合并
appointment
预约，约定
 tax breaks
减税，税额优惠
 income tax
所得税
 invest
投资
 potential
潜在的，可能的
 counseling
咨询服务
1264
```

## PDF 第 494 页

```text
Questions 170-173
 refer to the following online chat discussion.
玛丽亚
·
弗兰克纳
 [
下午
4:30]
你好，伯克先生。我与蒙特罗斯制造公司以及梅茨有限公司的会谈已
经结束。但如果您不介意，我想在德国的慕尼黑再待一个星期。
雷蒙德
·
伯克
 [
下午
4:31]
你打算休假去观光吗？
玛丽亚
·
弗兰克纳
 [
下午
4:32]
其实，蒙特罗斯制造公司的格雷戈尔
·
邦赫费尔将我介绍给了三个来
自不同公司的人员。他们都对购买我们的产品感兴趣。
雷蒙德
·
伯克
 [
下午
4:33]
这是个好消息。我同意你的请求，但是我会再派两个人过去帮你。稍
等一下。
雷蒙德
·
伯克
 [
下午
4:35]
莉萨和马克，收拾下你们的行李。你们要飞往国外的慕尼黑去帮玛丽
亚。你们会在那里待一个星期。
马克
·
沃特斯
 [
下午
4:37]
那我对接霍巴特先生的工作怎么办？
莉萨
·
默多克
 [
下午
4:38]
太好了。我会联系特雷纳先生，请他帮我们订今晚的机票。
雷蒙德
·
伯克
 [
下午
4:40]
我会和霍巴特先生商量的，马克。你和莉萨有语言技能（懂德语），
所以玛丽亚可能会需要你们的协助。这也将是一次不错的经历。现在，你
们三个讨论一下计划。给我发邮件汇报进展。', NULL);

  -- Question #170 (toeic_part_7)
  SELECT id INTO v_question_id FROM assessment_questions WHERE assessment_id = v_assessment_id AND position = 170;
  IF v_question_id IS NULL THEN
    INSERT INTO assessment_questions (assessment_id, skill, category, difficulty, level, question_type, prompt, context_text, audio_url, options, position, weight)
    VALUES (v_assessment_id, 'reading', 'toeic_part_7', 3, 'b2', 'multiple_choice', 'Where most likely is Ms. Francona?', 'Questions 170-173
 refer to the following online chat discussion.
Maria Francona [4:30 P.M.]
Hello, Mr. Burke. I completed my meetings with Montrose Manufacturing
and Metz, Inc. But if you don’t mind, I’d like to stay in Munich, Germany, for
another week.
Raymond Burke [4:31 P.M.]
Are you planning to take time off for sightseeing?
Maria Francona [4:32 P.M.]
Actually, Gregor Bonhoeffer at Montrose introduced me to people at three
different companies. Everyone’s interested in acquiring our products.
Raymond Burke [4:33 P.M.]
That’s good news. Your request is approved, but I’m sending two people to
help you. Hold on a moment.
Raymond Burke [4:35 P.M.]
813


## PDF 第 43 页

![PDF 第 43 页](images/read_page_43.png)



Lisa and Mark, pack your bags. You’re flying abroad to Munich to assist
Maria. You’ll be there for a week.
Mark Waters [4:37 P.M.]
What about my work with Mr. Hobart?
Lisa Murdoch [4:38 P.M.]
Excellent. I’ll contact Mr. Trainor and have him reserve tickets for us
tonight.
Raymond Burke [4:40 P.M.]
I’ll discuss it with him, Mark. You and Lisa have language skills, so Maria
might require your assistance. This will be a good experience as well. Now all
three of you should discuss your plans. Send me an e-mail to fill me in on what’s
going on.', NULL, '[{"id":"A","text":"In the office"},{"id":"B","text":"In another country"},{"id":"C","text":"At Montrose Manufacturing"},{"id":"D","text":"At a factory"}]'::jsonb, 170, 1.0)
    RETURNING id INTO v_question_id;
  ELSE
    UPDATE assessment_questions SET
      skill = 'reading',
      category = 'toeic_part_7',
      difficulty = 3,
      level = 'b2',
      prompt = 'Where most likely is Ms. Francona?',
      context_text = 'Questions 170-173
 refer to the following online chat discussion.
Maria Francona [4:30 P.M.]
Hello, Mr. Burke. I completed my meetings with Montrose Manufacturing
and Metz, Inc. But if you don’t mind, I’d like to stay in Munich, Germany, for
another week.
Raymond Burke [4:31 P.M.]
Are you planning to take time off for sightseeing?
Maria Francona [4:32 P.M.]
Actually, Gregor Bonhoeffer at Montrose introduced me to people at three
different companies. Everyone’s interested in acquiring our products.
Raymond Burke [4:33 P.M.]
That’s good news. Your request is approved, but I’m sending two people to
help you. Hold on a moment.
Raymond Burke [4:35 P.M.]
813


## PDF 第 43 页

![PDF 第 43 页](images/read_page_43.png)



Lisa and Mark, pack your bags. You’re flying abroad to Munich to assist
Maria. You’ll be there for a week.
Mark Waters [4:37 P.M.]
What about my work with Mr. Hobart?
Lisa Murdoch [4:38 P.M.]
Excellent. I’ll contact Mr. Trainor and have him reserve tickets for us
tonight.
Raymond Burke [4:40 P.M.]
I’ll discuss it with him, Mark. You and Lisa have language skills, so Maria
might require your assistance. This will be a good experience as well. Now all
three of you should discuss your plans. Send me an e-mail to fill me in on what’s
going on.',
      audio_url = NULL,
      options = '[{"id":"A","text":"In the office"},{"id":"B","text":"In another country"},{"id":"C","text":"At Montrose Manufacturing"},{"id":"D","text":"At a factory"}]'::jsonb
    WHERE id = v_question_id;
  END IF;

  -- Answer for #170
  DELETE FROM assessment_question_answers WHERE question_id = v_question_id;
  INSERT INTO assessment_question_answers (question_id, correct_option_id, explanation, transcript_text)
  VALUES (v_question_id, 'B', 'Đáp án đúng: B.

Phân tích bài đọc & dẫn chứng:
Where most likely is Ms. Francona?
1265
```

## PDF 第 495 页

```text
(A) In the office
(B) In another country
(C) At Montrose Manufacturing
(D) At a factory
弗兰克纳女士现在最有可能在哪里
?
(A)
在办公室
(B)
在另外一个国家
(C)
在蒙特罗斯制造公司
(D)
在一家工厂
→弗兰克纳女士在下午4:30提到，她想在德国慕尼黑再多待一个星期。
答案是(B)。', NULL);

  -- Question #171 (toeic_part_7)
  SELECT id INTO v_question_id FROM assessment_questions WHERE assessment_id = v_assessment_id AND position = 171;
  IF v_question_id IS NULL THEN
    INSERT INTO assessment_questions (assessment_id, skill, category, difficulty, level, question_type, prompt, context_text, audio_url, options, position, weight)
    VALUES (v_assessment_id, 'reading', 'toeic_part_7', 3, 'b2', 'multiple_choice', 'At 4:32 P.M., why does Ms. Francona write,“Everyone’s interested in acquiring our products”?', 'Questions 170-173
 refer to the following online chat discussion.
Maria Francona [4:30 P.M.]
Hello, Mr. Burke. I completed my meetings with Montrose Manufacturing
and Metz, Inc. But if you don’t mind, I’d like to stay in Munich, Germany, for
another week.
Raymond Burke [4:31 P.M.]
Are you planning to take time off for sightseeing?
Maria Francona [4:32 P.M.]
Actually, Gregor Bonhoeffer at Montrose introduced me to people at three
different companies. Everyone’s interested in acquiring our products.
Raymond Burke [4:33 P.M.]
That’s good news. Your request is approved, but I’m sending two people to
help you. Hold on a moment.
Raymond Burke [4:35 P.M.]
813


## PDF 第 43 页

![PDF 第 43 页](images/read_page_43.png)



Lisa and Mark, pack your bags. You’re flying abroad to Munich to assist
Maria. You’ll be there for a week.
Mark Waters [4:37 P.M.]
What about my work with Mr. Hobart?
Lisa Murdoch [4:38 P.M.]
Excellent. I’ll contact Mr. Trainor and have him reserve tickets for us
tonight.
Raymond Burke [4:40 P.M.]
I’ll discuss it with him, Mark. You and Lisa have language skills, so Maria
might require your assistance. This will be a good experience as well. Now all
three of you should discuss your plans. Send me an e-mail to fill me in on what’s
going on.', NULL, '[{"id":"A","text":"To request permission to fly to Munich"},{"id":"B","text":"To ask for assistance on an assignment"},{"id":"C","text":"To explain why she is extending her stay"},{"id":"D","text":"To justify the funds she is spending"}]'::jsonb, 171, 1.0)
    RETURNING id INTO v_question_id;
  ELSE
    UPDATE assessment_questions SET
      skill = 'reading',
      category = 'toeic_part_7',
      difficulty = 3,
      level = 'b2',
      prompt = 'At 4:32 P.M., why does Ms. Francona write,“Everyone’s interested in acquiring our products”?',
      context_text = 'Questions 170-173
 refer to the following online chat discussion.
Maria Francona [4:30 P.M.]
Hello, Mr. Burke. I completed my meetings with Montrose Manufacturing
and Metz, Inc. But if you don’t mind, I’d like to stay in Munich, Germany, for
another week.
Raymond Burke [4:31 P.M.]
Are you planning to take time off for sightseeing?
Maria Francona [4:32 P.M.]
Actually, Gregor Bonhoeffer at Montrose introduced me to people at three
different companies. Everyone’s interested in acquiring our products.
Raymond Burke [4:33 P.M.]
That’s good news. Your request is approved, but I’m sending two people to
help you. Hold on a moment.
Raymond Burke [4:35 P.M.]
813


## PDF 第 43 页

![PDF 第 43 页](images/read_page_43.png)



Lisa and Mark, pack your bags. You’re flying abroad to Munich to assist
Maria. You’ll be there for a week.
Mark Waters [4:37 P.M.]
What about my work with Mr. Hobart?
Lisa Murdoch [4:38 P.M.]
Excellent. I’ll contact Mr. Trainor and have him reserve tickets for us
tonight.
Raymond Burke [4:40 P.M.]
I’ll discuss it with him, Mark. You and Lisa have language skills, so Maria
might require your assistance. This will be a good experience as well. Now all
three of you should discuss your plans. Send me an e-mail to fill me in on what’s
going on.',
      audio_url = NULL,
      options = '[{"id":"A","text":"To request permission to fly to Munich"},{"id":"B","text":"To ask for assistance on an assignment"},{"id":"C","text":"To explain why she is extending her stay"},{"id":"D","text":"To justify the funds she is spending"}]'::jsonb
    WHERE id = v_question_id;
  END IF;

  -- Answer for #171
  DELETE FROM assessment_question_answers WHERE question_id = v_question_id;
  INSERT INTO assessment_question_answers (question_id, correct_option_id, explanation, transcript_text)
  VALUES (v_question_id, 'C', 'Đáp án đúng: C.

Phân tích bài đọc & dẫn chứng:
At 4:32 P.M., why does Ms. Francona write,“Everyone’s interested in
acquiring our products”?
(A) To request permission to fly to Munich
(B) To ask for assistance on an assignment
(C) To explain why she is extending her stay
(D) To justify the funds she is spending
在下午
4:32
，弗兰克纳女士为什么写道
“
他们都对购买我们的产品感兴
趣
”
？
(A)
为了请求允许她飞往慕尼黑
(B)
为了请求在一项任务上获得帮助
(C)
为了解释她为什么要求多待一段时间
(D)
为她的花销做出合理解释
→伯克先生以为弗兰克纳女士申请在慕尼黑再待一个星期是为了旅游观
光，弗兰克纳女士在回复中提到此句，是为了解释她为什么要多待一段时
1266
```

## PDF 第 496 页

```text
间。答案是(C)。', NULL);

  -- Question #172 (toeic_part_7)
  SELECT id INTO v_question_id FROM assessment_questions WHERE assessment_id = v_assessment_id AND position = 172;
  IF v_question_id IS NULL THEN
    INSERT INTO assessment_questions (assessment_id, skill, category, difficulty, level, question_type, prompt, context_text, audio_url, options, position, weight)
    VALUES (v_assessment_id, 'reading', 'toeic_part_7', 3, 'b2', 'multiple_choice', 'What is suggested about Mr. Waters and Ms. Murdoch?', 'Questions 170-173
 refer to the following online chat discussion.
Maria Francona [4:30 P.M.]
Hello, Mr. Burke. I completed my meetings with Montrose Manufacturing
and Metz, Inc. But if you don’t mind, I’d like to stay in Munich, Germany, for
another week.
Raymond Burke [4:31 P.M.]
Are you planning to take time off for sightseeing?
Maria Francona [4:32 P.M.]
Actually, Gregor Bonhoeffer at Montrose introduced me to people at three
different companies. Everyone’s interested in acquiring our products.
Raymond Burke [4:33 P.M.]
That’s good news. Your request is approved, but I’m sending two people to
help you. Hold on a moment.
Raymond Burke [4:35 P.M.]
813


## PDF 第 43 页

![PDF 第 43 页](images/read_page_43.png)



Lisa and Mark, pack your bags. You’re flying abroad to Munich to assist
Maria. You’ll be there for a week.
Mark Waters [4:37 P.M.]
What about my work with Mr. Hobart?
Lisa Murdoch [4:38 P.M.]
Excellent. I’ll contact Mr. Trainor and have him reserve tickets for us
tonight.
Raymond Burke [4:40 P.M.]
I’ll discuss it with him, Mark. You and Lisa have language skills, so Maria
might require your assistance. This will be a good experience as well. Now all
three of you should discuss your plans. Send me an e-mail to fill me in on what’s
going on.', NULL, '[{"id":"A","text":"They are able to speak German."},{"id":"B","text":"They have worked with Ms. Francona before."},{"id":"C","text":"They are employed at Metz, Inc."},{"id":"D","text":"They recently started their employment."}]'::jsonb, 172, 1.0)
    RETURNING id INTO v_question_id;
  ELSE
    UPDATE assessment_questions SET
      skill = 'reading',
      category = 'toeic_part_7',
      difficulty = 3,
      level = 'b2',
      prompt = 'What is suggested about Mr. Waters and Ms. Murdoch?',
      context_text = 'Questions 170-173
 refer to the following online chat discussion.
Maria Francona [4:30 P.M.]
Hello, Mr. Burke. I completed my meetings with Montrose Manufacturing
and Metz, Inc. But if you don’t mind, I’d like to stay in Munich, Germany, for
another week.
Raymond Burke [4:31 P.M.]
Are you planning to take time off for sightseeing?
Maria Francona [4:32 P.M.]
Actually, Gregor Bonhoeffer at Montrose introduced me to people at three
different companies. Everyone’s interested in acquiring our products.
Raymond Burke [4:33 P.M.]
That’s good news. Your request is approved, but I’m sending two people to
help you. Hold on a moment.
Raymond Burke [4:35 P.M.]
813


## PDF 第 43 页

![PDF 第 43 页](images/read_page_43.png)



Lisa and Mark, pack your bags. You’re flying abroad to Munich to assist
Maria. You’ll be there for a week.
Mark Waters [4:37 P.M.]
What about my work with Mr. Hobart?
Lisa Murdoch [4:38 P.M.]
Excellent. I’ll contact Mr. Trainor and have him reserve tickets for us
tonight.
Raymond Burke [4:40 P.M.]
I’ll discuss it with him, Mark. You and Lisa have language skills, so Maria
might require your assistance. This will be a good experience as well. Now all
three of you should discuss your plans. Send me an e-mail to fill me in on what’s
going on.',
      audio_url = NULL,
      options = '[{"id":"A","text":"They are able to speak German."},{"id":"B","text":"They have worked with Ms. Francona before."},{"id":"C","text":"They are employed at Metz, Inc."},{"id":"D","text":"They recently started their employment."}]'::jsonb
    WHERE id = v_question_id;
  END IF;

  -- Answer for #172
  DELETE FROM assessment_question_answers WHERE question_id = v_question_id;
  INSERT INTO assessment_question_answers (question_id, correct_option_id, explanation, transcript_text)
  VALUES (v_question_id, 'A', 'Đáp án đúng: A.

Phân tích bài đọc & dẫn chứng:
What is suggested about Mr. Waters and Ms. Murdoch?
(A) They are able to speak German.
(B) They have worked with Ms. Francona before.
(C) They are employed at Metz, Inc.
(D) They recently started their employment.
文中关于沃特斯先生和默多克女士暗示了哪些信息？
(A)
他们会说德语。
(B)
他们曾经和弗兰克纳女士合作过。
(C)
他们是梅茨有限公司的员工。
(D)
他们刚刚入职不久。
→伯克先生在下午4:40提到沃特斯和默多克有语言技能，言外之意是他
们懂德语。答案是(A)。', NULL);

  -- Question #173 (toeic_part_7)
  SELECT id INTO v_question_id FROM assessment_questions WHERE assessment_id = v_assessment_id AND position = 173;
  IF v_question_id IS NULL THEN
    INSERT INTO assessment_questions (assessment_id, skill, category, difficulty, level, question_type, prompt, context_text, audio_url, options, position, weight)
    VALUES (v_assessment_id, 'reading', 'toeic_part_7', 3, 'b2', 'multiple_choice', 'What does Mr. Burke request?', 'Questions 170-173
 refer to the following online chat discussion.
Maria Francona [4:30 P.M.]
Hello, Mr. Burke. I completed my meetings with Montrose Manufacturing
and Metz, Inc. But if you don’t mind, I’d like to stay in Munich, Germany, for
another week.
Raymond Burke [4:31 P.M.]
Are you planning to take time off for sightseeing?
Maria Francona [4:32 P.M.]
Actually, Gregor Bonhoeffer at Montrose introduced me to people at three
different companies. Everyone’s interested in acquiring our products.
Raymond Burke [4:33 P.M.]
That’s good news. Your request is approved, but I’m sending two people to
help you. Hold on a moment.
Raymond Burke [4:35 P.M.]
813


## PDF 第 43 页

![PDF 第 43 页](images/read_page_43.png)



Lisa and Mark, pack your bags. You’re flying abroad to Munich to assist
Maria. You’ll be there for a week.
Mark Waters [4:37 P.M.]
What about my work with Mr. Hobart?
Lisa Murdoch [4:38 P.M.]
Excellent. I’ll contact Mr. Trainor and have him reserve tickets for us
tonight.
Raymond Burke [4:40 P.M.]
I’ll discuss it with him, Mark. You and Lisa have language skills, so Maria
might require your assistance. This will be a good experience as well. Now all
three of you should discuss your plans. Send me an e-mail to fill me in on what’s
going on.', NULL, '[{"id":"A","text":"A reservation for a flight to Munich"},{"id":"B","text":"An update on some plans"},{"id":"C","text":"A copy of a signed contract"},{"id":"D","text":"Details on the negotiated deal"}]'::jsonb, 173, 1.0)
    RETURNING id INTO v_question_id;
  ELSE
    UPDATE assessment_questions SET
      skill = 'reading',
      category = 'toeic_part_7',
      difficulty = 3,
      level = 'b2',
      prompt = 'What does Mr. Burke request?',
      context_text = 'Questions 170-173
 refer to the following online chat discussion.
Maria Francona [4:30 P.M.]
Hello, Mr. Burke. I completed my meetings with Montrose Manufacturing
and Metz, Inc. But if you don’t mind, I’d like to stay in Munich, Germany, for
another week.
Raymond Burke [4:31 P.M.]
Are you planning to take time off for sightseeing?
Maria Francona [4:32 P.M.]
Actually, Gregor Bonhoeffer at Montrose introduced me to people at three
different companies. Everyone’s interested in acquiring our products.
Raymond Burke [4:33 P.M.]
That’s good news. Your request is approved, but I’m sending two people to
help you. Hold on a moment.
Raymond Burke [4:35 P.M.]
813


## PDF 第 43 页

![PDF 第 43 页](images/read_page_43.png)



Lisa and Mark, pack your bags. You’re flying abroad to Munich to assist
Maria. You’ll be there for a week.
Mark Waters [4:37 P.M.]
What about my work with Mr. Hobart?
Lisa Murdoch [4:38 P.M.]
Excellent. I’ll contact Mr. Trainor and have him reserve tickets for us
tonight.
Raymond Burke [4:40 P.M.]
I’ll discuss it with him, Mark. You and Lisa have language skills, so Maria
might require your assistance. This will be a good experience as well. Now all
three of you should discuss your plans. Send me an e-mail to fill me in on what’s
going on.',
      audio_url = NULL,
      options = '[{"id":"A","text":"A reservation for a flight to Munich"},{"id":"B","text":"An update on some plans"},{"id":"C","text":"A copy of a signed contract"},{"id":"D","text":"Details on the negotiated deal"}]'::jsonb
    WHERE id = v_question_id;
  END IF;

  -- Answer for #173
  DELETE FROM assessment_question_answers WHERE question_id = v_question_id;
  INSERT INTO assessment_question_answers (question_id, correct_option_id, explanation, transcript_text)
  VALUES (v_question_id, 'B', 'Đáp án đúng: B.

Phân tích bài đọc & dẫn chứng:
What does Mr. Burke request?
(A) A reservation for a flight to Munich
(B) An update on some plans
(C) A copy of a signed contract
(D) Details on the negotiated deal
伯克先生要求什么？
(A)
订飞往慕尼黑的机票
(B)
得知一些计划的最新进展
(C)
签署完毕的合同复印件
(D)
生意谈判细节
1267
```

## PDF 第 497 页

```text
→在线对话的最后伯克先生要求三人讨论一下计划，然后给他发邮件汇
报进展。答案是(B)。
▼ Vocabulary Check
manufacturing
制造业
 take time off
休假，请假
 sightseeing
观光
 acquire
得到，购得
 reserve
预订
 language skills
语言能力
 assistance
帮助
 experience
经历
 permission
许可
 extend
延长
 justify
对
…
做出解释，证明
…
是正当的
update
最新信息
 negotiate
谈判
Questions 174-175
 refer to the following menu.
中国
中国
免费菜肴
消费超过
40
美元
(
税前
)
可以免费得到菜单背后任意一道菜
(
限
8
美元或低于
8
美元的菜
)
此优惠不能和其他优惠同时使用。
免费鸡翅
消费超过
18
美元
(
税前
)
。一份订单只送一次。
此优惠不能和其他优惠同时使用。
点餐外带
特价
八折
此优惠不能和其他优惠同时使用。
只收现金。每日组合餐和套餐除外。
1268
```

## PDF 第 498 页

```text
简路
2145
号
(206) 755-1235', NULL);

  -- Question #174 (toeic_part_7)
  SELECT id INTO v_question_id FROM assessment_questions WHERE assessment_id = v_assessment_id AND position = 174;
  IF v_question_id IS NULL THEN
    INSERT INTO assessment_questions (assessment_id, skill, category, difficulty, level, question_type, prompt, context_text, audio_url, options, position, weight)
    VALUES (v_assessment_id, 'reading', 'toeic_part_7', 3, 'b2', 'multiple_choice', 'How can one receive a meal for free?', 'Questions 174-175
 refer to the following menu.
CHINA
CHINA
Free Dish
Choose any one dish from the menu on the back (restricted to $8 or less food
items) with any order over $40 (before taxes)
Not valid in conjunction with any other offers.
Free Chicken Wings
With any order over $18 (before tax). One per order only.
Not valid in conjunction with any other offers.
Pick Up
815


## PDF 第 45 页

![PDF 第 45 页](images/read_page_45.png)



Special
20% OFF
Not valid in conjunction with any other offers.
Cash payment only. Daily Combo & Complete Dinners excluded.
2145 Jane Rd.
(206) 755-1235', NULL, '[{"id":"A","text":"By paying for the meal in cash"},{"id":"B","text":"By ordering over a certain amount"},{"id":"C","text":"By picking up the food"},{"id":"D","text":"By coming to the restaurant at a certain hour"}]'::jsonb, 174, 1.0)
    RETURNING id INTO v_question_id;
  ELSE
    UPDATE assessment_questions SET
      skill = 'reading',
      category = 'toeic_part_7',
      difficulty = 3,
      level = 'b2',
      prompt = 'How can one receive a meal for free?',
      context_text = 'Questions 174-175
 refer to the following menu.
CHINA
CHINA
Free Dish
Choose any one dish from the menu on the back (restricted to $8 or less food
items) with any order over $40 (before taxes)
Not valid in conjunction with any other offers.
Free Chicken Wings
With any order over $18 (before tax). One per order only.
Not valid in conjunction with any other offers.
Pick Up
815


## PDF 第 45 页

![PDF 第 45 页](images/read_page_45.png)



Special
20% OFF
Not valid in conjunction with any other offers.
Cash payment only. Daily Combo & Complete Dinners excluded.
2145 Jane Rd.
(206) 755-1235',
      audio_url = NULL,
      options = '[{"id":"A","text":"By paying for the meal in cash"},{"id":"B","text":"By ordering over a certain amount"},{"id":"C","text":"By picking up the food"},{"id":"D","text":"By coming to the restaurant at a certain hour"}]'::jsonb
    WHERE id = v_question_id;
  END IF;

  -- Answer for #174
  DELETE FROM assessment_question_answers WHERE question_id = v_question_id;
  INSERT INTO assessment_question_answers (question_id, correct_option_id, explanation, transcript_text)
  VALUES (v_question_id, 'B', 'Đáp án đúng: B.

Phân tích bài đọc & dẫn chứng:
How can one receive a meal for free?
(A) By paying for the meal in cash
(B) By ordering over a certain amount
(C) By picking up the food
(D) By coming to the restaurant at a certain hour
怎样才能得到一份免费的食物？
(A)
用现金支付
(B)
消费超过一定数目
(C)
订餐自取
(D)
在某一时间去餐馆
→点餐总额超过40美元(税前)，可赠送菜单背面列出的任意一种菜品。
答案是(B)。', NULL);

  -- Question #175 (toeic_part_7)
  SELECT id INTO v_question_id FROM assessment_questions WHERE assessment_id = v_assessment_id AND position = 175;
  IF v_question_id IS NULL THEN
    INSERT INTO assessment_questions (assessment_id, skill, category, difficulty, level, question_type, prompt, context_text, audio_url, options, position, weight)
    VALUES (v_assessment_id, 'reading', 'toeic_part_7', 3, 'b2', 'multiple_choice', 'What can be inferred from the menu?', 'Questions 174-175
 refer to the following menu.
CHINA
CHINA
Free Dish
Choose any one dish from the menu on the back (restricted to $8 or less food
items) with any order over $40 (before taxes)
Not valid in conjunction with any other offers.
Free Chicken Wings
With any order over $18 (before tax). One per order only.
Not valid in conjunction with any other offers.
Pick Up
815


## PDF 第 45 页

![PDF 第 45 页](images/read_page_45.png)



Special
20% OFF
Not valid in conjunction with any other offers.
Cash payment only. Daily Combo & Complete Dinners excluded.
2145 Jane Rd.
(206) 755-1235', NULL, '[{"id":"A","text":"The restaurant accepts credit cards."},{"id":"B","text":"Delivery is not available during weekends."},{"id":"C","text":"Only one coupon can be used at one time."},{"id":"D","text":"All the food that is picked up is 20% off the regular price."}]'::jsonb, 175, 1.0)
    RETURNING id INTO v_question_id;
  ELSE
    UPDATE assessment_questions SET
      skill = 'reading',
      category = 'toeic_part_7',
      difficulty = 3,
      level = 'b2',
      prompt = 'What can be inferred from the menu?',
      context_text = 'Questions 174-175
 refer to the following menu.
CHINA
CHINA
Free Dish
Choose any one dish from the menu on the back (restricted to $8 or less food
items) with any order over $40 (before taxes)
Not valid in conjunction with any other offers.
Free Chicken Wings
With any order over $18 (before tax). One per order only.
Not valid in conjunction with any other offers.
Pick Up
815


## PDF 第 45 页

![PDF 第 45 页](images/read_page_45.png)



Special
20% OFF
Not valid in conjunction with any other offers.
Cash payment only. Daily Combo & Complete Dinners excluded.
2145 Jane Rd.
(206) 755-1235',
      audio_url = NULL,
      options = '[{"id":"A","text":"The restaurant accepts credit cards."},{"id":"B","text":"Delivery is not available during weekends."},{"id":"C","text":"Only one coupon can be used at one time."},{"id":"D","text":"All the food that is picked up is 20% off the regular price."}]'::jsonb
    WHERE id = v_question_id;
  END IF;

  -- Answer for #175
  DELETE FROM assessment_question_answers WHERE question_id = v_question_id;
  INSERT INTO assessment_question_answers (question_id, correct_option_id, explanation, transcript_text)
  VALUES (v_question_id, 'C', 'Đáp án đúng: C.

Phân tích bài đọc & dẫn chứng:
What can be inferred from the menu?
(A) The restaurant accepts credit cards.
(B) Delivery is not available during weekends.
(C) Only one coupon can be used at one time.
(D) All the food that is picked up is 20% off the regular price.
从菜单里能推断出什么信息？
(A)
餐馆接受信用卡付账。
(B)
周末不能送餐。
1269
```

## PDF 第 499 页

```text
(C)
一次只能用一张优惠券。
(D)
外带的所有食物都能打八折。
→not valid in conjunction with... 是“没有重复折扣”的意思。
答案是(C)。
▼ Vocabulary Check
valid
有效的
 in conjunction with
与
…
一起
 exclude
把
…
排除在外
 in cash
用现金付账
 regular price
正常价格
Questions 176-180
 refer to the following letter and e-mail message.
2018
年
6
月
3
日
苏珊娜
·
罗杰斯
超人体工学家具公司
销售和运输部门
莫里斯圈
107
号
58
室
摩拉宾，维多利亚

邮编：
3206
亲爱的罗杰斯女士：
我相信您知道我们公司从事组织会议、节日活动和其他大型公司活动
已有
15
年了，事实上，我们是这个行业的龙头。我们在过去
15
年里一直从
超人体工学家具公司购买和租用高级家具。而且我们从来没有对你们的服
务有过任何投诉。
我现在以个人名义写信给您，请您帮个忙。我们最近在贵公司下了一
个租用家具的订单
(
订单号
11-35698A)
，包括车展需要的椅子、桌子、隔板
和讲台。不幸的是，这个订单里有一个严重的错误。事实上这个展览的起
始日期要比订单里写的时间早一个星期。展会的开始日期实际上是
7
月
7
日。如果您能想办法把我们订的货在
7
号之前送到，我们将非常感激。如
果可能的话，我想在原订单的基础上增加
20
个易拉宝。
我知道这件事比较为难，但是鉴于我们长期合作的关系，我希望您能
帮我们这个忙。
1270
```

## PDF 第 500 页

```text
不便之处深表歉意。请您尽快联系我。
真诚的，
迈克尔
·
鲁宾逊
物业经理
mrobinson@btc.com
发件人：
srogers@uef.shipping.com
发送时间：
2018
年
6
月
8
日
收件人：
mrobinson@btc.com
主题：您的要求
亲爱的鲁宾逊先生：
感谢您的来信。我对您的不幸处境感到惊讶和担忧。当然，我会尽我
所能来帮助您。贵公司是我们自
1978
年营业以来最好的客户之一。
今天上午我亲自去了一趟我们的仓库，查看库存是否有您在
7
月
7
日到
7
月
14
日的展会上所需的所有物品。我很高兴地告诉您，我们能提供您原
订单上的所有物品。但是，您后来要求的物品我们恐怕没有办法租给您
了，因为另一个客户已订了在那个星期租用。
我建议您来我办公室讨论一下其他办法。我可以带您去我们的仓库，
您可以看看我们的存货清单。请尽快给我打电话安排时间。
祝好！
苏珊娜
·
罗杰斯
销售和运输部门
▼ Vocabulary Check
1271
```

## PDF 第 501 页

```text
ergonomic
人体工学的
 shipping (
货物的
)
运输
 organize
组织
 convention
大会，会议
 festival
节日；庆祝
 corporate
公司的
 purchase
购买
 complaint
投
诉，抱怨
 lectern
讲台
 exposition
博览会，展览会
 pop-up
有弹起装置的
inconvenience
不便，困难
 property
不动产，所有物
 unfortunate
不幸的
warehouse
仓库
 originally
本来，原来
 suggestion
建议，提议
 inventory
存货
清单，详细目录
 eventually
终于，最后
 outsource
外包
 process
进程，过程
apologize
道歉，认错', NULL);

  -- Question #176 (toeic_part_7)
  SELECT id INTO v_question_id FROM assessment_questions WHERE assessment_id = v_assessment_id AND position = 176;
  IF v_question_id IS NULL THEN
    INSERT INTO assessment_questions (assessment_id, skill, category, difficulty, level, question_type, prompt, context_text, audio_url, options, position, weight)
    VALUES (v_assessment_id, 'reading', 'toeic_part_7', 3, 'b2', 'multiple_choice', 'Why did Mr. Robinson write the letter?', 'Questions 176-180
 refer to the following letter and e-mail message.
June 3, 2018
Suzanne Rogers
Ultra-Ergonomic Furniture
Sales and Shipping Department
816


## PDF 第 46 页

![PDF 第 46 页](images/read_page_46.png)



Suite 58, 107 Morris Circle
Moorabbin, Victoria 3206
Dear Ms. Rogers,
As I’m sure you are aware, our company has been organizing conventions,
festivals, and other large corporate events for the last fifteen years, and in fact we
are leaders in the field. We have relied on Ultra-Ergonomic Furniture for
purchase and rental supplies of high-quality furniture for that entire period, and
we’ve never had any cause for complaints with regard to your services.
I am writing to you personally to ask a special favor. We recently made an
order with your company for the supply of rental furniture that includes chairs,
tables, partitions, and lecterns for an auto show (see order no. 11-35698A).
Unfortunately, a serious error was made. In fact the exposition begins one week
earlier than indicated on the order form. The starting date is actually July 7. I
would appreciate it very much if you could try to do everything you can to ensure
that our order be delivered to us on that date. Also, if possible, I’d like to add 20
Pop-up displays on top of our original order.
I realize that this is a big favor to ask, but on the basis of our long-term
business relationship, I hope that you will be able to find a way.
I’m really sorry for any inconvenience. Please contact me soon.
Yours sincerely,
Michael Robinson
Michael Robinson
Properties Manager
mrobinson@btc.com
From:
 srogers@uef.shipping.com
Sent:
 June 8, 2018
To:
 mrobinson@btc.com
817


## PDF 第 47 页

![PDF 第 47 页](images/read_page_47.png)



Subject:
 Your request
Dear Mr. Robinson,
Thank you for your letter. I was surprised, and of course concerned, that you
find yourself in this unfortunate situation. And of course I will do my best to help
you. Your company has been one of our best clients since we began operations in
1978.
Anyway, I personally took a trip down to our warehouse this morning to
have a closer look at our stock to see if we have all the things you need for your
convention — which I believe is from July 7 to July 14. I am happy to say that we
will be able to provide you with everything you originally requested. However,
as for the additional request you made, it won’t be possible because we have
already rented them out to another client during that week.
My suggestion is that you come down to my office to discuss other
possibilities. I can take you down to our warehouse, and you can look at our
inventory. So, please call me soon to arrange a time.
Kind regards,
Suzanne Rogers,
Sales and Shipping Department', NULL, '[{"id":"A","text":"To make a complaint about a late delivery"},{"id":"B","text":"To ask for a change in the delivery date"},{"id":"C","text":"To invite Ms. Rogers to an auto show"},{"id":"D","text":"To cancel an order he had made"}]'::jsonb, 176, 1.0)
    RETURNING id INTO v_question_id;
  ELSE
    UPDATE assessment_questions SET
      skill = 'reading',
      category = 'toeic_part_7',
      difficulty = 3,
      level = 'b2',
      prompt = 'Why did Mr. Robinson write the letter?',
      context_text = 'Questions 176-180
 refer to the following letter and e-mail message.
June 3, 2018
Suzanne Rogers
Ultra-Ergonomic Furniture
Sales and Shipping Department
816


## PDF 第 46 页

![PDF 第 46 页](images/read_page_46.png)



Suite 58, 107 Morris Circle
Moorabbin, Victoria 3206
Dear Ms. Rogers,
As I’m sure you are aware, our company has been organizing conventions,
festivals, and other large corporate events for the last fifteen years, and in fact we
are leaders in the field. We have relied on Ultra-Ergonomic Furniture for
purchase and rental supplies of high-quality furniture for that entire period, and
we’ve never had any cause for complaints with regard to your services.
I am writing to you personally to ask a special favor. We recently made an
order with your company for the supply of rental furniture that includes chairs,
tables, partitions, and lecterns for an auto show (see order no. 11-35698A).
Unfortunately, a serious error was made. In fact the exposition begins one week
earlier than indicated on the order form. The starting date is actually July 7. I
would appreciate it very much if you could try to do everything you can to ensure
that our order be delivered to us on that date. Also, if possible, I’d like to add 20
Pop-up displays on top of our original order.
I realize that this is a big favor to ask, but on the basis of our long-term
business relationship, I hope that you will be able to find a way.
I’m really sorry for any inconvenience. Please contact me soon.
Yours sincerely,
Michael Robinson
Michael Robinson
Properties Manager
mrobinson@btc.com
From:
 srogers@uef.shipping.com
Sent:
 June 8, 2018
To:
 mrobinson@btc.com
817


## PDF 第 47 页

![PDF 第 47 页](images/read_page_47.png)



Subject:
 Your request
Dear Mr. Robinson,
Thank you for your letter. I was surprised, and of course concerned, that you
find yourself in this unfortunate situation. And of course I will do my best to help
you. Your company has been one of our best clients since we began operations in
1978.
Anyway, I personally took a trip down to our warehouse this morning to
have a closer look at our stock to see if we have all the things you need for your
convention — which I believe is from July 7 to July 14. I am happy to say that we
will be able to provide you with everything you originally requested. However,
as for the additional request you made, it won’t be possible because we have
already rented them out to another client during that week.
My suggestion is that you come down to my office to discuss other
possibilities. I can take you down to our warehouse, and you can look at our
inventory. So, please call me soon to arrange a time.
Kind regards,
Suzanne Rogers,
Sales and Shipping Department',
      audio_url = NULL,
      options = '[{"id":"A","text":"To make a complaint about a late delivery"},{"id":"B","text":"To ask for a change in the delivery date"},{"id":"C","text":"To invite Ms. Rogers to an auto show"},{"id":"D","text":"To cancel an order he had made"}]'::jsonb
    WHERE id = v_question_id;
  END IF;

  -- Answer for #176
  DELETE FROM assessment_question_answers WHERE question_id = v_question_id;
  INSERT INTO assessment_question_answers (question_id, correct_option_id, explanation, transcript_text)
  VALUES (v_question_id, 'B', 'Đáp án đúng: B.

Phân tích bài đọc & dẫn chứng:
Why did Mr. Robinson write the letter?
(A) To make a complaint about a late delivery
(B) To ask for a change in the delivery date
(C) To invite Ms. Rogers to an auto show
(D) To cancel an order he had made
鲁宾逊先生为什么写这封信？
(A)
为了投诉货运延误
(B)
为了要求改变送货日期
(C)
为了邀请罗杰斯女士参加车展
(D)
为了取消他下的订单
→第一封信中提到，展会比订单中写的预定日期要提前一周，因此请求
提前配送。答案是(B)。', NULL);

  -- Question #177 (toeic_part_7)
  SELECT id INTO v_question_id FROM assessment_questions WHERE assessment_id = v_assessment_id AND position = 177;
  IF v_question_id IS NULL THEN
    INSERT INTO assessment_questions (assessment_id, skill, category, difficulty, level, question_type, prompt, context_text, audio_url, options, position, weight)
    VALUES (v_assessment_id, 'reading', 'toeic_part_7', 3, 'b2', 'multiple_choice', 'What service does Mr. Robinson’s business provide?', 'Questions 176-180
 refer to the following letter and e-mail message.
June 3, 2018
Suzanne Rogers
Ultra-Ergonomic Furniture
Sales and Shipping Department
816


## PDF 第 46 页

![PDF 第 46 页](images/read_page_46.png)



Suite 58, 107 Morris Circle
Moorabbin, Victoria 3206
Dear Ms. Rogers,
As I’m sure you are aware, our company has been organizing conventions,
festivals, and other large corporate events for the last fifteen years, and in fact we
are leaders in the field. We have relied on Ultra-Ergonomic Furniture for
purchase and rental supplies of high-quality furniture for that entire period, and
we’ve never had any cause for complaints with regard to your services.
I am writing to you personally to ask a special favor. We recently made an
order with your company for the supply of rental furniture that includes chairs,
tables, partitions, and lecterns for an auto show (see order no. 11-35698A).
Unfortunately, a serious error was made. In fact the exposition begins one week
earlier than indicated on the order form. The starting date is actually July 7. I
would appreciate it very much if you could try to do everything you can to ensure
that our order be delivered to us on that date. Also, if possible, I’d like to add 20
Pop-up displays on top of our original order.
I realize that this is a big favor to ask, but on the basis of our long-term
business relationship, I hope that you will be able to find a way.
I’m really sorry for any inconvenience. Please contact me soon.
Yours sincerely,
Michael Robinson
Michael Robinson
Properties Manager
mrobinson@btc.com
From:
 srogers@uef.shipping.com
Sent:
 June 8, 2018
To:
 mrobinson@btc.com
817


## PDF 第 47 页

![PDF 第 47 页](images/read_page_47.png)



Subject:
 Your request
Dear Mr. Robinson,
Thank you for your letter. I was surprised, and of course concerned, that you
find yourself in this unfortunate situation. And of course I will do my best to help
you. Your company has been one of our best clients since we began operations in
1978.
Anyway, I personally took a trip down to our warehouse this morning to
have a closer look at our stock to see if we have all the things you need for your
convention — which I believe is from July 7 to July 14. I am happy to say that we
will be able to provide you with everything you originally requested. However,
as for the additional request you made, it won’t be possible because we have
already rented them out to another client during that week.
My suggestion is that you come down to my office to discuss other
possibilities. I can take you down to our warehouse, and you can look at our
inventory. So, please call me soon to arrange a time.
Kind regards,
Suzanne Rogers,
Sales and Shipping Department', NULL, '[{"id":"A","text":"Selling and renting office furniture"},{"id":"B","text":"Manufacturing automobiles"},{"id":"C","text":"Arranging large, organized affairs"},{"id":"D","text":"Delivering heavy equipment"}]'::jsonb, 177, 1.0)
    RETURNING id INTO v_question_id;
  ELSE
    UPDATE assessment_questions SET
      skill = 'reading',
      category = 'toeic_part_7',
      difficulty = 3,
      level = 'b2',
      prompt = 'What service does Mr. Robinson’s business provide?',
      context_text = 'Questions 176-180
 refer to the following letter and e-mail message.
June 3, 2018
Suzanne Rogers
Ultra-Ergonomic Furniture
Sales and Shipping Department
816


## PDF 第 46 页

![PDF 第 46 页](images/read_page_46.png)



Suite 58, 107 Morris Circle
Moorabbin, Victoria 3206
Dear Ms. Rogers,
As I’m sure you are aware, our company has been organizing conventions,
festivals, and other large corporate events for the last fifteen years, and in fact we
are leaders in the field. We have relied on Ultra-Ergonomic Furniture for
purchase and rental supplies of high-quality furniture for that entire period, and
we’ve never had any cause for complaints with regard to your services.
I am writing to you personally to ask a special favor. We recently made an
order with your company for the supply of rental furniture that includes chairs,
tables, partitions, and lecterns for an auto show (see order no. 11-35698A).
Unfortunately, a serious error was made. In fact the exposition begins one week
earlier than indicated on the order form. The starting date is actually July 7. I
would appreciate it very much if you could try to do everything you can to ensure
that our order be delivered to us on that date. Also, if possible, I’d like to add 20
Pop-up displays on top of our original order.
I realize that this is a big favor to ask, but on the basis of our long-term
business relationship, I hope that you will be able to find a way.
I’m really sorry for any inconvenience. Please contact me soon.
Yours sincerely,
Michael Robinson
Michael Robinson
Properties Manager
mrobinson@btc.com
From:
 srogers@uef.shipping.com
Sent:
 June 8, 2018
To:
 mrobinson@btc.com
817


## PDF 第 47 页

![PDF 第 47 页](images/read_page_47.png)



Subject:
 Your request
Dear Mr. Robinson,
Thank you for your letter. I was surprised, and of course concerned, that you
find yourself in this unfortunate situation. And of course I will do my best to help
you. Your company has been one of our best clients since we began operations in
1978.
Anyway, I personally took a trip down to our warehouse this morning to
have a closer look at our stock to see if we have all the things you need for your
convention — which I believe is from July 7 to July 14. I am happy to say that we
will be able to provide you with everything you originally requested. However,
as for the additional request you made, it won’t be possible because we have
already rented them out to another client during that week.
My suggestion is that you come down to my office to discuss other
possibilities. I can take you down to our warehouse, and you can look at our
inventory. So, please call me soon to arrange a time.
Kind regards,
Suzanne Rogers,
Sales and Shipping Department',
      audio_url = NULL,
      options = '[{"id":"A","text":"Selling and renting office furniture"},{"id":"B","text":"Manufacturing automobiles"},{"id":"C","text":"Arranging large, organized affairs"},{"id":"D","text":"Delivering heavy equipment"}]'::jsonb
    WHERE id = v_question_id;
  END IF;

  -- Answer for #177
  DELETE FROM assessment_question_answers WHERE question_id = v_question_id;
  INSERT INTO assessment_question_answers (question_id, correct_option_id, explanation, transcript_text)
  VALUES (v_question_id, 'C', 'Đáp án đúng: C.

Phân tích bài đọc & dẫn chứng:
What service does Mr. Robinson’s business provide?
(A) Selling and renting office furniture
(B) Manufacturing automobiles
(C) Arranging large, organized affairs
(D) Delivering heavy equipment
鲁宾逊先生的公司提供什么服务？
(A)
销售和出租办公家具
1272
```

## PDF 第 502 页

```text
(B)
生产汽车
(C)
组织大型活动
(D)
运送沉重的设备
→第一封信第一段中提到，鲁宾逊先生的公司是一家组织会议、节日活
动和其他大型公司活动的公司。答案是(C)。', NULL);

  -- Question #178 (toeic_part_7)
  SELECT id INTO v_question_id FROM assessment_questions WHERE assessment_id = v_assessment_id AND position = 178;
  IF v_question_id IS NULL THEN
    INSERT INTO assessment_questions (assessment_id, skill, category, difficulty, level, question_type, prompt, context_text, audio_url, options, position, weight)
    VALUES (v_assessment_id, 'reading', 'toeic_part_7', 3, 'b2', 'multiple_choice', 'What does Suzanne say about Michael’s company?', 'Questions 176-180
 refer to the following letter and e-mail message.
June 3, 2018
Suzanne Rogers
Ultra-Ergonomic Furniture
Sales and Shipping Department
816


## PDF 第 46 页

![PDF 第 46 页](images/read_page_46.png)



Suite 58, 107 Morris Circle
Moorabbin, Victoria 3206
Dear Ms. Rogers,
As I’m sure you are aware, our company has been organizing conventions,
festivals, and other large corporate events for the last fifteen years, and in fact we
are leaders in the field. We have relied on Ultra-Ergonomic Furniture for
purchase and rental supplies of high-quality furniture for that entire period, and
we’ve never had any cause for complaints with regard to your services.
I am writing to you personally to ask a special favor. We recently made an
order with your company for the supply of rental furniture that includes chairs,
tables, partitions, and lecterns for an auto show (see order no. 11-35698A).
Unfortunately, a serious error was made. In fact the exposition begins one week
earlier than indicated on the order form. The starting date is actually July 7. I
would appreciate it very much if you could try to do everything you can to ensure
that our order be delivered to us on that date. Also, if possible, I’d like to add 20
Pop-up displays on top of our original order.
I realize that this is a big favor to ask, but on the basis of our long-term
business relationship, I hope that you will be able to find a way.
I’m really sorry for any inconvenience. Please contact me soon.
Yours sincerely,
Michael Robinson
Michael Robinson
Properties Manager
mrobinson@btc.com
From:
 srogers@uef.shipping.com
Sent:
 June 8, 2018
To:
 mrobinson@btc.com
817


## PDF 第 47 页

![PDF 第 47 页](images/read_page_47.png)



Subject:
 Your request
Dear Mr. Robinson,
Thank you for your letter. I was surprised, and of course concerned, that you
find yourself in this unfortunate situation. And of course I will do my best to help
you. Your company has been one of our best clients since we began operations in
1978.
Anyway, I personally took a trip down to our warehouse this morning to
have a closer look at our stock to see if we have all the things you need for your
convention — which I believe is from July 7 to July 14. I am happy to say that we
will be able to provide you with everything you originally requested. However,
as for the additional request you made, it won’t be possible because we have
already rented them out to another client during that week.
My suggestion is that you come down to my office to discuss other
possibilities. I can take you down to our warehouse, and you can look at our
inventory. So, please call me soon to arrange a time.
Kind regards,
Suzanne Rogers,
Sales and Shipping Department', NULL, '[{"id":"A","text":"It has been a loyal customer of her company for a number of years."},{"id":"B","text":"It will eventually get itself out of the unfortunate situation it is facing at the"},{"id":"C","text":"It should outsource some of the work to speed up the work process."},{"id":"D","text":"It needs to expand into other areas of business."}]'::jsonb, 178, 1.0)
    RETURNING id INTO v_question_id;
  ELSE
    UPDATE assessment_questions SET
      skill = 'reading',
      category = 'toeic_part_7',
      difficulty = 3,
      level = 'b2',
      prompt = 'What does Suzanne say about Michael’s company?',
      context_text = 'Questions 176-180
 refer to the following letter and e-mail message.
June 3, 2018
Suzanne Rogers
Ultra-Ergonomic Furniture
Sales and Shipping Department
816


## PDF 第 46 页

![PDF 第 46 页](images/read_page_46.png)



Suite 58, 107 Morris Circle
Moorabbin, Victoria 3206
Dear Ms. Rogers,
As I’m sure you are aware, our company has been organizing conventions,
festivals, and other large corporate events for the last fifteen years, and in fact we
are leaders in the field. We have relied on Ultra-Ergonomic Furniture for
purchase and rental supplies of high-quality furniture for that entire period, and
we’ve never had any cause for complaints with regard to your services.
I am writing to you personally to ask a special favor. We recently made an
order with your company for the supply of rental furniture that includes chairs,
tables, partitions, and lecterns for an auto show (see order no. 11-35698A).
Unfortunately, a serious error was made. In fact the exposition begins one week
earlier than indicated on the order form. The starting date is actually July 7. I
would appreciate it very much if you could try to do everything you can to ensure
that our order be delivered to us on that date. Also, if possible, I’d like to add 20
Pop-up displays on top of our original order.
I realize that this is a big favor to ask, but on the basis of our long-term
business relationship, I hope that you will be able to find a way.
I’m really sorry for any inconvenience. Please contact me soon.
Yours sincerely,
Michael Robinson
Michael Robinson
Properties Manager
mrobinson@btc.com
From:
 srogers@uef.shipping.com
Sent:
 June 8, 2018
To:
 mrobinson@btc.com
817


## PDF 第 47 页

![PDF 第 47 页](images/read_page_47.png)



Subject:
 Your request
Dear Mr. Robinson,
Thank you for your letter. I was surprised, and of course concerned, that you
find yourself in this unfortunate situation. And of course I will do my best to help
you. Your company has been one of our best clients since we began operations in
1978.
Anyway, I personally took a trip down to our warehouse this morning to
have a closer look at our stock to see if we have all the things you need for your
convention — which I believe is from July 7 to July 14. I am happy to say that we
will be able to provide you with everything you originally requested. However,
as for the additional request you made, it won’t be possible because we have
already rented them out to another client during that week.
My suggestion is that you come down to my office to discuss other
possibilities. I can take you down to our warehouse, and you can look at our
inventory. So, please call me soon to arrange a time.
Kind regards,
Suzanne Rogers,
Sales and Shipping Department',
      audio_url = NULL,
      options = '[{"id":"A","text":"It has been a loyal customer of her company for a number of years."},{"id":"B","text":"It will eventually get itself out of the unfortunate situation it is facing at the"},{"id":"C","text":"It should outsource some of the work to speed up the work process."},{"id":"D","text":"It needs to expand into other areas of business."}]'::jsonb
    WHERE id = v_question_id;
  END IF;

  -- Answer for #178
  DELETE FROM assessment_question_answers WHERE question_id = v_question_id;
  INSERT INTO assessment_question_answers (question_id, correct_option_id, explanation, transcript_text)
  VALUES (v_question_id, 'A', 'Đáp án đúng: A.

Phân tích bài đọc & dẫn chứng:
What does Suzanne say about Michael’s company?
(A) It has been a loyal customer of her company for a number of years.
(B) It will eventually get itself out of the unfortunate situation it is facing at the
moment.
(C) It should outsource some of the work to speed up the work process.
(D) It needs to expand into other areas of business.
苏珊娜提及了有关迈克尔的公司的什么内容？
(A)
它是她所在公司多年来的忠实客户。
(B)
它最终能走出目前面临的困境。
(C)
它应该将一些工作外包出去以加快工作进程。
(D)
它需要开拓其他领域的业务。
→本题与苏珊娜提及的内容有关，因此要在苏珊娜的邮件中寻找答案。
苏珊娜对迈克尔的公司是这样评价的：Your company has been one of our
best clients since...in 1978。答案是(A)。选项中one of our best
clients换成了a loyal customer of her company，since we began
operations in 1978换成了for a number of years。', NULL);

  -- Question #179 (toeic_part_7)
  SELECT id INTO v_question_id FROM assessment_questions WHERE assessment_id = v_assessment_id AND position = 179;
  IF v_question_id IS NULL THEN
    INSERT INTO assessment_questions (assessment_id, skill, category, difficulty, level, question_type, prompt, context_text, audio_url, options, position, weight)
    VALUES (v_assessment_id, 'reading', 'toeic_part_7', 3, 'b2', 'multiple_choice', 'What will probably happen when Ms. Rogers meet with Mr. Robinson?', 'Questions 176-180
 refer to the following letter and e-mail message.
June 3, 2018
Suzanne Rogers
Ultra-Ergonomic Furniture
Sales and Shipping Department
816


## PDF 第 46 页

![PDF 第 46 页](images/read_page_46.png)



Suite 58, 107 Morris Circle
Moorabbin, Victoria 3206
Dear Ms. Rogers,
As I’m sure you are aware, our company has been organizing conventions,
festivals, and other large corporate events for the last fifteen years, and in fact we
are leaders in the field. We have relied on Ultra-Ergonomic Furniture for
purchase and rental supplies of high-quality furniture for that entire period, and
we’ve never had any cause for complaints with regard to your services.
I am writing to you personally to ask a special favor. We recently made an
order with your company for the supply of rental furniture that includes chairs,
tables, partitions, and lecterns for an auto show (see order no. 11-35698A).
Unfortunately, a serious error was made. In fact the exposition begins one week
earlier than indicated on the order form. The starting date is actually July 7. I
would appreciate it very much if you could try to do everything you can to ensure
that our order be delivered to us on that date. Also, if possible, I’d like to add 20
Pop-up displays on top of our original order.
I realize that this is a big favor to ask, but on the basis of our long-term
business relationship, I hope that you will be able to find a way.
I’m really sorry for any inconvenience. Please contact me soon.
Yours sincerely,
Michael Robinson
Michael Robinson
Properties Manager
mrobinson@btc.com
From:
 srogers@uef.shipping.com
Sent:
 June 8, 2018
To:
 mrobinson@btc.com
817


## PDF 第 47 页

![PDF 第 47 页](images/read_page_47.png)



Subject:
 Your request
Dear Mr. Robinson,
Thank you for your letter. I was surprised, and of course concerned, that you
find yourself in this unfortunate situation. And of course I will do my best to help
you. Your company has been one of our best clients since we began operations in
1978.
Anyway, I personally took a trip down to our warehouse this morning to
have a closer look at our stock to see if we have all the things you need for your
convention — which I believe is from July 7 to July 14. I am happy to say that we
will be able to provide you with everything you originally requested. However,
as for the additional request you made, it won’t be possible because we have
already rented them out to another client during that week.
My suggestion is that you come down to my office to discuss other
possibilities. I can take you down to our warehouse, and you can look at our
inventory. So, please call me soon to arrange a time.
Kind regards,
Suzanne Rogers,
Sales and Shipping Department', NULL, '[{"id":"A","text":"They will drive down to the auto show together."},{"id":"B","text":"Ms. Rogers will apologize for her mistakes."},{"id":"C","text":"They will have a look around the warehouse."},{"id":"D","text":"Mr. Robinson will hand over a check."}]'::jsonb, 179, 1.0)
    RETURNING id INTO v_question_id;
  ELSE
    UPDATE assessment_questions SET
      skill = 'reading',
      category = 'toeic_part_7',
      difficulty = 3,
      level = 'b2',
      prompt = 'What will probably happen when Ms. Rogers meet with Mr. Robinson?',
      context_text = 'Questions 176-180
 refer to the following letter and e-mail message.
June 3, 2018
Suzanne Rogers
Ultra-Ergonomic Furniture
Sales and Shipping Department
816


## PDF 第 46 页

![PDF 第 46 页](images/read_page_46.png)



Suite 58, 107 Morris Circle
Moorabbin, Victoria 3206
Dear Ms. Rogers,
As I’m sure you are aware, our company has been organizing conventions,
festivals, and other large corporate events for the last fifteen years, and in fact we
are leaders in the field. We have relied on Ultra-Ergonomic Furniture for
purchase and rental supplies of high-quality furniture for that entire period, and
we’ve never had any cause for complaints with regard to your services.
I am writing to you personally to ask a special favor. We recently made an
order with your company for the supply of rental furniture that includes chairs,
tables, partitions, and lecterns for an auto show (see order no. 11-35698A).
Unfortunately, a serious error was made. In fact the exposition begins one week
earlier than indicated on the order form. The starting date is actually July 7. I
would appreciate it very much if you could try to do everything you can to ensure
that our order be delivered to us on that date. Also, if possible, I’d like to add 20
Pop-up displays on top of our original order.
I realize that this is a big favor to ask, but on the basis of our long-term
business relationship, I hope that you will be able to find a way.
I’m really sorry for any inconvenience. Please contact me soon.
Yours sincerely,
Michael Robinson
Michael Robinson
Properties Manager
mrobinson@btc.com
From:
 srogers@uef.shipping.com
Sent:
 June 8, 2018
To:
 mrobinson@btc.com
817


## PDF 第 47 页

![PDF 第 47 页](images/read_page_47.png)



Subject:
 Your request
Dear Mr. Robinson,
Thank you for your letter. I was surprised, and of course concerned, that you
find yourself in this unfortunate situation. And of course I will do my best to help
you. Your company has been one of our best clients since we began operations in
1978.
Anyway, I personally took a trip down to our warehouse this morning to
have a closer look at our stock to see if we have all the things you need for your
convention — which I believe is from July 7 to July 14. I am happy to say that we
will be able to provide you with everything you originally requested. However,
as for the additional request you made, it won’t be possible because we have
already rented them out to another client during that week.
My suggestion is that you come down to my office to discuss other
possibilities. I can take you down to our warehouse, and you can look at our
inventory. So, please call me soon to arrange a time.
Kind regards,
Suzanne Rogers,
Sales and Shipping Department',
      audio_url = NULL,
      options = '[{"id":"A","text":"They will drive down to the auto show together."},{"id":"B","text":"Ms. Rogers will apologize for her mistakes."},{"id":"C","text":"They will have a look around the warehouse."},{"id":"D","text":"Mr. Robinson will hand over a check."}]'::jsonb
    WHERE id = v_question_id;
  END IF;

  -- Answer for #179
  DELETE FROM assessment_question_answers WHERE question_id = v_question_id;
  INSERT INTO assessment_question_answers (question_id, correct_option_id, explanation, transcript_text)
  VALUES (v_question_id, 'C', 'Đáp án đúng: C.

Phân tích bài đọc & dẫn chứng:
What will probably happen when Ms. Rogers meet with Mr. Robinson?
(A) They will drive down to the auto show together.
(B) Ms. Rogers will apologize for her mistakes.
(C) They will have a look around the warehouse.
(D) Mr. Robinson will hand over a check.
1273
```

## PDF 第 503 页

```text
罗杰斯女士和鲁宾逊先生见面后可能会发生什么？
(A)
他们会一起驾车去看车展。
(B)
罗杰斯女士会为她的失误道歉。
(C)
他们会一起去查看仓库。
(D)
鲁宾逊先生会支付一张支票。
→第二封邮件中提到，追加的物品因租给了其他顾客故不能提供，他们
可以到仓库查看存货后再协商。答案是(C)。', NULL);

  -- Question #180 (toeic_part_7)
  SELECT id INTO v_question_id FROM assessment_questions WHERE assessment_id = v_assessment_id AND position = 180;
  IF v_question_id IS NULL THEN
    INSERT INTO assessment_questions (assessment_id, skill, category, difficulty, level, question_type, prompt, context_text, audio_url, options, position, weight)
    VALUES (v_assessment_id, 'reading', 'toeic_part_7', 3, 'b2', 'multiple_choice', 'Which of the following does Ms. Rogers say she will NOT be able to provide?', 'Questions 176-180
 refer to the following letter and e-mail message.
June 3, 2018
Suzanne Rogers
Ultra-Ergonomic Furniture
Sales and Shipping Department
816


## PDF 第 46 页

![PDF 第 46 页](images/read_page_46.png)



Suite 58, 107 Morris Circle
Moorabbin, Victoria 3206
Dear Ms. Rogers,
As I’m sure you are aware, our company has been organizing conventions,
festivals, and other large corporate events for the last fifteen years, and in fact we
are leaders in the field. We have relied on Ultra-Ergonomic Furniture for
purchase and rental supplies of high-quality furniture for that entire period, and
we’ve never had any cause for complaints with regard to your services.
I am writing to you personally to ask a special favor. We recently made an
order with your company for the supply of rental furniture that includes chairs,
tables, partitions, and lecterns for an auto show (see order no. 11-35698A).
Unfortunately, a serious error was made. In fact the exposition begins one week
earlier than indicated on the order form. The starting date is actually July 7. I
would appreciate it very much if you could try to do everything you can to ensure
that our order be delivered to us on that date. Also, if possible, I’d like to add 20
Pop-up displays on top of our original order.
I realize that this is a big favor to ask, but on the basis of our long-term
business relationship, I hope that you will be able to find a way.
I’m really sorry for any inconvenience. Please contact me soon.
Yours sincerely,
Michael Robinson
Michael Robinson
Properties Manager
mrobinson@btc.com
From:
 srogers@uef.shipping.com
Sent:
 June 8, 2018
To:
 mrobinson@btc.com
817


## PDF 第 47 页

![PDF 第 47 页](images/read_page_47.png)



Subject:
 Your request
Dear Mr. Robinson,
Thank you for your letter. I was surprised, and of course concerned, that you
find yourself in this unfortunate situation. And of course I will do my best to help
you. Your company has been one of our best clients since we began operations in
1978.
Anyway, I personally took a trip down to our warehouse this morning to
have a closer look at our stock to see if we have all the things you need for your
convention — which I believe is from July 7 to July 14. I am happy to say that we
will be able to provide you with everything you originally requested. However,
as for the additional request you made, it won’t be possible because we have
already rented them out to another client during that week.
My suggestion is that you come down to my office to discuss other
possibilities. I can take you down to our warehouse, and you can look at our
inventory. So, please call me soon to arrange a time.
Kind regards,
Suzanne Rogers,
Sales and Shipping Department', NULL, '[{"id":"A","text":"Chairs"},{"id":"B","text":"Tables"},{"id":"C","text":"Partitions"},{"id":"D","text":"Pop-up displays"}]'::jsonb, 180, 1.0)
    RETURNING id INTO v_question_id;
  ELSE
    UPDATE assessment_questions SET
      skill = 'reading',
      category = 'toeic_part_7',
      difficulty = 3,
      level = 'b2',
      prompt = 'Which of the following does Ms. Rogers say she will NOT be able to provide?',
      context_text = 'Questions 176-180
 refer to the following letter and e-mail message.
June 3, 2018
Suzanne Rogers
Ultra-Ergonomic Furniture
Sales and Shipping Department
816


## PDF 第 46 页

![PDF 第 46 页](images/read_page_46.png)



Suite 58, 107 Morris Circle
Moorabbin, Victoria 3206
Dear Ms. Rogers,
As I’m sure you are aware, our company has been organizing conventions,
festivals, and other large corporate events for the last fifteen years, and in fact we
are leaders in the field. We have relied on Ultra-Ergonomic Furniture for
purchase and rental supplies of high-quality furniture for that entire period, and
we’ve never had any cause for complaints with regard to your services.
I am writing to you personally to ask a special favor. We recently made an
order with your company for the supply of rental furniture that includes chairs,
tables, partitions, and lecterns for an auto show (see order no. 11-35698A).
Unfortunately, a serious error was made. In fact the exposition begins one week
earlier than indicated on the order form. The starting date is actually July 7. I
would appreciate it very much if you could try to do everything you can to ensure
that our order be delivered to us on that date. Also, if possible, I’d like to add 20
Pop-up displays on top of our original order.
I realize that this is a big favor to ask, but on the basis of our long-term
business relationship, I hope that you will be able to find a way.
I’m really sorry for any inconvenience. Please contact me soon.
Yours sincerely,
Michael Robinson
Michael Robinson
Properties Manager
mrobinson@btc.com
From:
 srogers@uef.shipping.com
Sent:
 June 8, 2018
To:
 mrobinson@btc.com
817


## PDF 第 47 页

![PDF 第 47 页](images/read_page_47.png)



Subject:
 Your request
Dear Mr. Robinson,
Thank you for your letter. I was surprised, and of course concerned, that you
find yourself in this unfortunate situation. And of course I will do my best to help
you. Your company has been one of our best clients since we began operations in
1978.
Anyway, I personally took a trip down to our warehouse this morning to
have a closer look at our stock to see if we have all the things you need for your
convention — which I believe is from July 7 to July 14. I am happy to say that we
will be able to provide you with everything you originally requested. However,
as for the additional request you made, it won’t be possible because we have
already rented them out to another client during that week.
My suggestion is that you come down to my office to discuss other
possibilities. I can take you down to our warehouse, and you can look at our
inventory. So, please call me soon to arrange a time.
Kind regards,
Suzanne Rogers,
Sales and Shipping Department',
      audio_url = NULL,
      options = '[{"id":"A","text":"Chairs"},{"id":"B","text":"Tables"},{"id":"C","text":"Partitions"},{"id":"D","text":"Pop-up displays"}]'::jsonb
    WHERE id = v_question_id;
  END IF;

  -- Answer for #180
  DELETE FROM assessment_question_answers WHERE question_id = v_question_id;
  INSERT INTO assessment_question_answers (question_id, correct_option_id, explanation, transcript_text)
  VALUES (v_question_id, 'D', 'Đáp án đúng: D.

Phân tích bài đọc & dẫn chứng:
Which of the following does Ms. Rogers say she will NOT be able to provide?
(A) Chairs
(B) Tables
(C) Partitions
(D) Pop-up displays
以下哪一项是罗杰斯女士说她没法提供的？
(A)
椅子
(B)
桌子
(C)
隔板
(D)
易拉宝
→鲁宾逊先生在第一封信中写道：I’d like to add 20 pop-up
displays...，罗杰斯女士在回信中写道：However, as for the
additional request you made, it won’t be possible。答案是(D)。
Questions 181-185
 refer to the following advertisement and e-mail message.
出售高级住宅
针对那些寻找独特房产的有眼光的客户，希尔房地产公司很高兴宣布
出售以下住宅，它们全部位于我市高档地区。
1274
```

## PDF 第 504 页

```text
圣罗莎
这套西班牙风情的美丽官邸建在一个缓坡上，占地半英亩。建于上世
纪二十年代的繁荣时期，它保留了很多原汁原味的建筑和历史特点，而厨
房和浴室的现代装潢很有品位。美丽的砂岩和绿草、鲜花相映成趣，在二
楼能看到海景。现在就打电话安排看房吧。
仓库改建公寓
如果你正在寻找一处坐落于繁华市区内安静、安全、中间带宁静庭院
的开放式公寓，那么，仓库改建公寓就是你理想的选择。机会不容错过。
这个三室两卫、设计出众的公寓能为你提供安静的环境和艺术空间，也可
以成为完美的聚会场所。现在就来看房吧。
维多利亚联排别墅
再也没有比这个建于
1885
年的三层维多利亚联排别墅更完美的了。它
坐落于宽敞的半圆形街道，与高雅的维多利亚公园相对，前院和高空露台
在冬日里不仅阳光充足而且避风。对于那些喜爱将舒适生活和高雅娱乐相
结合的人来说，这是绝佳的选择。宽敞的客厅连着一个华丽的餐厅和装修
现代的大厨房。整套别墅有三间楼上的卧室，其中两间自带卫生间，一层
还有一个供客人使用的卫生间。
若需详细信息及安排看房
(
需预约
)
，请拨打我们的办公电话
965-2254
或
965-2255
，或者发电子邮件到
johnconnor@thehills.com
。
收件人：
johnconnor@thehills.com
发件人：
lisabrown@kyu.com
主题：有兴趣的买家
亲爱的康纳先生：
我对你们最近的广告非常感兴趣。我在找一处能容纳我的艺术工作室
且有可能在里面举行我的私人作品展的房子。广告上列出的一处房子听上
去好像符合我的需求。因此我想尽快和你会面去看房。你能安排一个合适
的时间吗？这周除了周三晚上，其他时间我都可以。请尽快给我回信。
非常感谢您的关注。
1275
```

## PDF 第 505 页

```text
丽莎
·
布朗：
755-1207
▼ Vocabulary Check
prestige
名贵的，讲究派头的
 property
房地产，不动产
 discerning
有识
别力的；敏锐的
 real estate
房地产
 residence
住宅，宅邸
 upscale
高消费阶层
的，迎合高层次消费者的
 mansion
公寓
 sloping
倾斜的，有坡度的
 tastefully
风雅地，高雅地
 stunning
漂亮的
 sandstone
砂岩
 conversion
建筑
 vibrant
充满
活力的
 tranquil
安静的
 courtyard
庭院，天井
 endeavor
努力
 sophisticated
不
落俗套的
 semi-circular
半圆的
 adjoin
毗邻，邻接
 inspection
参观，视察
accommodate
容纳
 exhibition
展览
 attention
注意，关注
 architect
建筑师
coordinate
协调', NULL);

  -- Question #181 (toeic_part_7)
  SELECT id INTO v_question_id FROM assessment_questions WHERE assessment_id = v_assessment_id AND position = 181;
  IF v_question_id IS NULL THEN
    INSERT INTO assessment_questions (assessment_id, skill, category, difficulty, level, question_type, prompt, context_text, audio_url, options, position, weight)
    VALUES (v_assessment_id, 'reading', 'toeic_part_7', 3, 'b2', 'multiple_choice', 'For whom is this advertisement most likely intended?', 'Questions 181-185
 refer to the following advertisement and e-mail message.
Prestige Properties now Available
For discerning customers seeking unique properties, The Hills Real
819


## PDF 第 49 页

![PDF 第 49 页](images/read_page_49.png)



Estate Agency is pleased to announce the availability of the following
residences in the most upscale parts of our city:
Santa Rosa
This beautiful Spanish-style mansion extends over a gently sloping half-acre
block. Constructed during the boom period of the 1920s, it has retained many
original architectural and historical features while the kitchen and bathrooms
have been tastefully modernized. Stunning sandstone contrasts with green lawns
and colorful flower gardens, with views of the ocean from the second floor. Call
now, to arrange a viewing.
Warehouse Conversion
If you are seeking an open-plan style apartment located in the heart of the
vibrant inner city that is quiet and secure with a tranquil courtyard in its heart, this
is the property for you. Truly a unique opportunity, this 3-bedroom, 2-bathroom,
architect-designed conversion can offer tranquility and space for your artistic
endeavors or can open up to be the perfect party house. Inspect now.
Victorian Terrace
They don’t come much more sophisticated than this 3-story Victorian terrace
built in 1885. Located on a wide semi-circular street opposite elegant Victoria
Park, the front garden and wide upper-level balcony are bathed in generous
sunshine during the winter months while being protected from the wind. A rare
opportunity for those who love combining comfortable living with elegant
entertaining. A large living room adjoins a magnificent dining area served by a
modern kitchen with plenty of bench-space. Three upstairs bedrooms, two with
en-suite bathrooms, plus a guest bathroom on the ground floor, complete the
picture.
For further information and to arrange inspections (appointment only) please
call our office at 965-2254 or 965-2255 or e-mail at johnconnor@thehills.com
To:
 johnconnor@thehills.com
From:
 lisabrown@kyu.com
Subject:
 Interested buyer
820


## PDF 第 50 页

![PDF 第 50 页](images/read_page_50.png)



Dear Mr. Connor,
I was very interested by your recent advertisement. I am seeking a residence
that can accommodate an art studio and possibly hold private exhibitions for the
work I do. One of the listed places sounds like it could be suitable for my needs.
Therefore, I would like to meet with you soon to take a look at the place. Could
you please let me know when a good time for you is? I am okay anytime this week
except for Wednesday evening. Please get back to be as soon as possible.
Thanks so much for your attention.
Lisa Brown: 755-1207', NULL, '[{"id":"A","text":"Newlyweds who are looking for a cozy place"},{"id":"B","text":"People who have financially established themselves"},{"id":"C","text":"Anyone who is looking for a bargain"},{"id":"D","text":"Families with many children"}]'::jsonb, 181, 1.0)
    RETURNING id INTO v_question_id;
  ELSE
    UPDATE assessment_questions SET
      skill = 'reading',
      category = 'toeic_part_7',
      difficulty = 3,
      level = 'b2',
      prompt = 'For whom is this advertisement most likely intended?',
      context_text = 'Questions 181-185
 refer to the following advertisement and e-mail message.
Prestige Properties now Available
For discerning customers seeking unique properties, The Hills Real
819


## PDF 第 49 页

![PDF 第 49 页](images/read_page_49.png)



Estate Agency is pleased to announce the availability of the following
residences in the most upscale parts of our city:
Santa Rosa
This beautiful Spanish-style mansion extends over a gently sloping half-acre
block. Constructed during the boom period of the 1920s, it has retained many
original architectural and historical features while the kitchen and bathrooms
have been tastefully modernized. Stunning sandstone contrasts with green lawns
and colorful flower gardens, with views of the ocean from the second floor. Call
now, to arrange a viewing.
Warehouse Conversion
If you are seeking an open-plan style apartment located in the heart of the
vibrant inner city that is quiet and secure with a tranquil courtyard in its heart, this
is the property for you. Truly a unique opportunity, this 3-bedroom, 2-bathroom,
architect-designed conversion can offer tranquility and space for your artistic
endeavors or can open up to be the perfect party house. Inspect now.
Victorian Terrace
They don’t come much more sophisticated than this 3-story Victorian terrace
built in 1885. Located on a wide semi-circular street opposite elegant Victoria
Park, the front garden and wide upper-level balcony are bathed in generous
sunshine during the winter months while being protected from the wind. A rare
opportunity for those who love combining comfortable living with elegant
entertaining. A large living room adjoins a magnificent dining area served by a
modern kitchen with plenty of bench-space. Three upstairs bedrooms, two with
en-suite bathrooms, plus a guest bathroom on the ground floor, complete the
picture.
For further information and to arrange inspections (appointment only) please
call our office at 965-2254 or 965-2255 or e-mail at johnconnor@thehills.com
To:
 johnconnor@thehills.com
From:
 lisabrown@kyu.com
Subject:
 Interested buyer
820


## PDF 第 50 页

![PDF 第 50 页](images/read_page_50.png)



Dear Mr. Connor,
I was very interested by your recent advertisement. I am seeking a residence
that can accommodate an art studio and possibly hold private exhibitions for the
work I do. One of the listed places sounds like it could be suitable for my needs.
Therefore, I would like to meet with you soon to take a look at the place. Could
you please let me know when a good time for you is? I am okay anytime this week
except for Wednesday evening. Please get back to be as soon as possible.
Thanks so much for your attention.
Lisa Brown: 755-1207',
      audio_url = NULL,
      options = '[{"id":"A","text":"Newlyweds who are looking for a cozy place"},{"id":"B","text":"People who have financially established themselves"},{"id":"C","text":"Anyone who is looking for a bargain"},{"id":"D","text":"Families with many children"}]'::jsonb
    WHERE id = v_question_id;
  END IF;

  -- Answer for #181
  DELETE FROM assessment_question_answers WHERE question_id = v_question_id;
  INSERT INTO assessment_question_answers (question_id, correct_option_id, explanation, transcript_text)
  VALUES (v_question_id, 'B', 'Đáp án đúng: B.

Phân tích bài đọc & dẫn chứng:
For whom is this advertisement most likely intended?
(A) Newlyweds who are looking for a cozy place
(B) People who have financially established themselves
(C) Anyone who is looking for a bargain
(D) Families with many children
这则广告主要针对哪些顾客？
(A)
寻找舒适住所的新婚夫妇
(B)
有良好经济基础的人
(C)
任何在寻找特价房的人
(D)
有很多孩子的家庭
→第一篇文章是一则广告，主要是面向寻找独特房产的顾客介绍高级地
段的售房信息。答案是(B)。', NULL);

  -- Question #182 (toeic_part_7)
  SELECT id INTO v_question_id FROM assessment_questions WHERE assessment_id = v_assessment_id AND position = 182;
  IF v_question_id IS NULL THEN
    INSERT INTO assessment_questions (assessment_id, skill, category, difficulty, level, question_type, prompt, context_text, audio_url, options, position, weight)
    VALUES (v_assessment_id, 'reading', 'toeic_part_7', 3, 'b2', 'multiple_choice', 'Who is John Connor?', 'Questions 181-185
 refer to the following advertisement and e-mail message.
Prestige Properties now Available
For discerning customers seeking unique properties, The Hills Real
819


## PDF 第 49 页

![PDF 第 49 页](images/read_page_49.png)



Estate Agency is pleased to announce the availability of the following
residences in the most upscale parts of our city:
Santa Rosa
This beautiful Spanish-style mansion extends over a gently sloping half-acre
block. Constructed during the boom period of the 1920s, it has retained many
original architectural and historical features while the kitchen and bathrooms
have been tastefully modernized. Stunning sandstone contrasts with green lawns
and colorful flower gardens, with views of the ocean from the second floor. Call
now, to arrange a viewing.
Warehouse Conversion
If you are seeking an open-plan style apartment located in the heart of the
vibrant inner city that is quiet and secure with a tranquil courtyard in its heart, this
is the property for you. Truly a unique opportunity, this 3-bedroom, 2-bathroom,
architect-designed conversion can offer tranquility and space for your artistic
endeavors or can open up to be the perfect party house. Inspect now.
Victorian Terrace
They don’t come much more sophisticated than this 3-story Victorian terrace
built in 1885. Located on a wide semi-circular street opposite elegant Victoria
Park, the front garden and wide upper-level balcony are bathed in generous
sunshine during the winter months while being protected from the wind. A rare
opportunity for those who love combining comfortable living with elegant
entertaining. A large living room adjoins a magnificent dining area served by a
modern kitchen with plenty of bench-space. Three upstairs bedrooms, two with
en-suite bathrooms, plus a guest bathroom on the ground floor, complete the
picture.
For further information and to arrange inspections (appointment only) please
call our office at 965-2254 or 965-2255 or e-mail at johnconnor@thehills.com
To:
 johnconnor@thehills.com
From:
 lisabrown@kyu.com
Subject:
 Interested buyer
820


## PDF 第 50 页

![PDF 第 50 页](images/read_page_50.png)



Dear Mr. Connor,
I was very interested by your recent advertisement. I am seeking a residence
that can accommodate an art studio and possibly hold private exhibitions for the
work I do. One of the listed places sounds like it could be suitable for my needs.
Therefore, I would like to meet with you soon to take a look at the place. Could
you please let me know when a good time for you is? I am okay anytime this week
except for Wednesday evening. Please get back to be as soon as possible.
Thanks so much for your attention.
Lisa Brown: 755-1207', NULL, '[{"id":"A","text":"An architect"},{"id":"B","text":"A real estate agent"},{"id":"C","text":"An artist"},{"id":"D","text":"A history professor"}]'::jsonb, 182, 1.0)
    RETURNING id INTO v_question_id;
  ELSE
    UPDATE assessment_questions SET
      skill = 'reading',
      category = 'toeic_part_7',
      difficulty = 3,
      level = 'b2',
      prompt = 'Who is John Connor?',
      context_text = 'Questions 181-185
 refer to the following advertisement and e-mail message.
Prestige Properties now Available
For discerning customers seeking unique properties, The Hills Real
819


## PDF 第 49 页

![PDF 第 49 页](images/read_page_49.png)



Estate Agency is pleased to announce the availability of the following
residences in the most upscale parts of our city:
Santa Rosa
This beautiful Spanish-style mansion extends over a gently sloping half-acre
block. Constructed during the boom period of the 1920s, it has retained many
original architectural and historical features while the kitchen and bathrooms
have been tastefully modernized. Stunning sandstone contrasts with green lawns
and colorful flower gardens, with views of the ocean from the second floor. Call
now, to arrange a viewing.
Warehouse Conversion
If you are seeking an open-plan style apartment located in the heart of the
vibrant inner city that is quiet and secure with a tranquil courtyard in its heart, this
is the property for you. Truly a unique opportunity, this 3-bedroom, 2-bathroom,
architect-designed conversion can offer tranquility and space for your artistic
endeavors or can open up to be the perfect party house. Inspect now.
Victorian Terrace
They don’t come much more sophisticated than this 3-story Victorian terrace
built in 1885. Located on a wide semi-circular street opposite elegant Victoria
Park, the front garden and wide upper-level balcony are bathed in generous
sunshine during the winter months while being protected from the wind. A rare
opportunity for those who love combining comfortable living with elegant
entertaining. A large living room adjoins a magnificent dining area served by a
modern kitchen with plenty of bench-space. Three upstairs bedrooms, two with
en-suite bathrooms, plus a guest bathroom on the ground floor, complete the
picture.
For further information and to arrange inspections (appointment only) please
call our office at 965-2254 or 965-2255 or e-mail at johnconnor@thehills.com
To:
 johnconnor@thehills.com
From:
 lisabrown@kyu.com
Subject:
 Interested buyer
820


## PDF 第 50 页

![PDF 第 50 页](images/read_page_50.png)



Dear Mr. Connor,
I was very interested by your recent advertisement. I am seeking a residence
that can accommodate an art studio and possibly hold private exhibitions for the
work I do. One of the listed places sounds like it could be suitable for my needs.
Therefore, I would like to meet with you soon to take a look at the place. Could
you please let me know when a good time for you is? I am okay anytime this week
except for Wednesday evening. Please get back to be as soon as possible.
Thanks so much for your attention.
Lisa Brown: 755-1207',
      audio_url = NULL,
      options = '[{"id":"A","text":"An architect"},{"id":"B","text":"A real estate agent"},{"id":"C","text":"An artist"},{"id":"D","text":"A history professor"}]'::jsonb
    WHERE id = v_question_id;
  END IF;

  -- Answer for #182
  DELETE FROM assessment_question_answers WHERE question_id = v_question_id;
  INSERT INTO assessment_question_answers (question_id, correct_option_id, explanation, transcript_text)
  VALUES (v_question_id, 'B', 'Đáp án đúng: B.

Phân tích bài đọc & dẫn chứng:
Who is John Connor?
(A) An architect
1276
```

## PDF 第 506 页

```text
(B) A real estate agent
(C) An artist
(D) A history professor
约翰
·
康纳是做什么的？
(A)
建筑师
(B)
房地产经纪人
(C)
艺术家
(D)
历史教授
→广告的最后一句for further information... or e-mail at
johnconnor@thehills.com中提到了咨询地点和咨询方法等信息，而且第二
篇文章是一封向康纳咨询的邮件，因此可以推断康纳是房地产经纪人。', NULL);

  -- Question #183 (toeic_part_7)
  SELECT id INTO v_question_id FROM assessment_questions WHERE assessment_id = v_assessment_id AND position = 183;
  IF v_question_id IS NULL THEN
    INSERT INTO assessment_questions (assessment_id, skill, category, difficulty, level, question_type, prompt, context_text, audio_url, options, position, weight)
    VALUES (v_assessment_id, 'reading', 'toeic_part_7', 3, 'b2', 'multiple_choice', 'According to the e-mail, which of the following places will most likely suit Ms. Brown the most?', 'Questions 181-185
 refer to the following advertisement and e-mail message.
Prestige Properties now Available
For discerning customers seeking unique properties, The Hills Real
819


## PDF 第 49 页

![PDF 第 49 页](images/read_page_49.png)



Estate Agency is pleased to announce the availability of the following
residences in the most upscale parts of our city:
Santa Rosa
This beautiful Spanish-style mansion extends over a gently sloping half-acre
block. Constructed during the boom period of the 1920s, it has retained many
original architectural and historical features while the kitchen and bathrooms
have been tastefully modernized. Stunning sandstone contrasts with green lawns
and colorful flower gardens, with views of the ocean from the second floor. Call
now, to arrange a viewing.
Warehouse Conversion
If you are seeking an open-plan style apartment located in the heart of the
vibrant inner city that is quiet and secure with a tranquil courtyard in its heart, this
is the property for you. Truly a unique opportunity, this 3-bedroom, 2-bathroom,
architect-designed conversion can offer tranquility and space for your artistic
endeavors or can open up to be the perfect party house. Inspect now.
Victorian Terrace
They don’t come much more sophisticated than this 3-story Victorian terrace
built in 1885. Located on a wide semi-circular street opposite elegant Victoria
Park, the front garden and wide upper-level balcony are bathed in generous
sunshine during the winter months while being protected from the wind. A rare
opportunity for those who love combining comfortable living with elegant
entertaining. A large living room adjoins a magnificent dining area served by a
modern kitchen with plenty of bench-space. Three upstairs bedrooms, two with
en-suite bathrooms, plus a guest bathroom on the ground floor, complete the
picture.
For further information and to arrange inspections (appointment only) please
call our office at 965-2254 or 965-2255 or e-mail at johnconnor@thehills.com
To:
 johnconnor@thehills.com
From:
 lisabrown@kyu.com
Subject:
 Interested buyer
820


## PDF 第 50 页

![PDF 第 50 页](images/read_page_50.png)



Dear Mr. Connor,
I was very interested by your recent advertisement. I am seeking a residence
that can accommodate an art studio and possibly hold private exhibitions for the
work I do. One of the listed places sounds like it could be suitable for my needs.
Therefore, I would like to meet with you soon to take a look at the place. Could
you please let me know when a good time for you is? I am okay anytime this week
except for Wednesday evening. Please get back to be as soon as possible.
Thanks so much for your attention.
Lisa Brown: 755-1207', NULL, '[{"id":"A","text":"Santa Rosa"},{"id":"B","text":"Warehouse Conversion"},{"id":"C","text":"Victorian Terrace"},{"id":"D","text":"None of them"}]'::jsonb, 183, 1.0)
    RETURNING id INTO v_question_id;
  ELSE
    UPDATE assessment_questions SET
      skill = 'reading',
      category = 'toeic_part_7',
      difficulty = 3,
      level = 'b2',
      prompt = 'According to the e-mail, which of the following places will most likely suit Ms. Brown the most?',
      context_text = 'Questions 181-185
 refer to the following advertisement and e-mail message.
Prestige Properties now Available
For discerning customers seeking unique properties, The Hills Real
819


## PDF 第 49 页

![PDF 第 49 页](images/read_page_49.png)



Estate Agency is pleased to announce the availability of the following
residences in the most upscale parts of our city:
Santa Rosa
This beautiful Spanish-style mansion extends over a gently sloping half-acre
block. Constructed during the boom period of the 1920s, it has retained many
original architectural and historical features while the kitchen and bathrooms
have been tastefully modernized. Stunning sandstone contrasts with green lawns
and colorful flower gardens, with views of the ocean from the second floor. Call
now, to arrange a viewing.
Warehouse Conversion
If you are seeking an open-plan style apartment located in the heart of the
vibrant inner city that is quiet and secure with a tranquil courtyard in its heart, this
is the property for you. Truly a unique opportunity, this 3-bedroom, 2-bathroom,
architect-designed conversion can offer tranquility and space for your artistic
endeavors or can open up to be the perfect party house. Inspect now.
Victorian Terrace
They don’t come much more sophisticated than this 3-story Victorian terrace
built in 1885. Located on a wide semi-circular street opposite elegant Victoria
Park, the front garden and wide upper-level balcony are bathed in generous
sunshine during the winter months while being protected from the wind. A rare
opportunity for those who love combining comfortable living with elegant
entertaining. A large living room adjoins a magnificent dining area served by a
modern kitchen with plenty of bench-space. Three upstairs bedrooms, two with
en-suite bathrooms, plus a guest bathroom on the ground floor, complete the
picture.
For further information and to arrange inspections (appointment only) please
call our office at 965-2254 or 965-2255 or e-mail at johnconnor@thehills.com
To:
 johnconnor@thehills.com
From:
 lisabrown@kyu.com
Subject:
 Interested buyer
820


## PDF 第 50 页

![PDF 第 50 页](images/read_page_50.png)



Dear Mr. Connor,
I was very interested by your recent advertisement. I am seeking a residence
that can accommodate an art studio and possibly hold private exhibitions for the
work I do. One of the listed places sounds like it could be suitable for my needs.
Therefore, I would like to meet with you soon to take a look at the place. Could
you please let me know when a good time for you is? I am okay anytime this week
except for Wednesday evening. Please get back to be as soon as possible.
Thanks so much for your attention.
Lisa Brown: 755-1207',
      audio_url = NULL,
      options = '[{"id":"A","text":"Santa Rosa"},{"id":"B","text":"Warehouse Conversion"},{"id":"C","text":"Victorian Terrace"},{"id":"D","text":"None of them"}]'::jsonb
    WHERE id = v_question_id;
  END IF;

  -- Answer for #183
  DELETE FROM assessment_question_answers WHERE question_id = v_question_id;
  INSERT INTO assessment_question_answers (question_id, correct_option_id, explanation, transcript_text)
  VALUES (v_question_id, 'B', 'Đáp án đúng: B.

Phân tích bài đọc & dẫn chứng:
According to the e-mail, which of the following places will most likely suit
Ms. Brown the most?
(A) Santa Rosa
(B) Warehouse Conversion
(C) Victorian Terrace
(D) None of them
根据这封电子邮件，下列哪处房子最适合布朗女士？
(A)
圣罗莎
(B)
仓库改建公寓
(C)
维多利亚联排别墅
(D)
以上都不是
→布朗女士在邮件中提到需要一个能够实现美术工作室和展览室功能的
住宅。根据广告中描述的售房信息可知，仓库改建公寓最适合。答案是
(B)。
1277
```

## PDF 第 507 页

```text', NULL);

  -- Question #184 (toeic_part_7)
  SELECT id INTO v_question_id FROM assessment_questions WHERE assessment_id = v_assessment_id AND position = 184;
  IF v_question_id IS NULL THEN
    INSERT INTO assessment_questions (assessment_id, skill, category, difficulty, level, question_type, prompt, context_text, audio_url, options, position, weight)
    VALUES (v_assessment_id, 'reading', 'toeic_part_7', 3, 'b2', 'multiple_choice', 'What is the main purpose of the e-mail?', 'Questions 181-185
 refer to the following advertisement and e-mail message.
Prestige Properties now Available
For discerning customers seeking unique properties, The Hills Real
819


## PDF 第 49 页

![PDF 第 49 页](images/read_page_49.png)



Estate Agency is pleased to announce the availability of the following
residences in the most upscale parts of our city:
Santa Rosa
This beautiful Spanish-style mansion extends over a gently sloping half-acre
block. Constructed during the boom period of the 1920s, it has retained many
original architectural and historical features while the kitchen and bathrooms
have been tastefully modernized. Stunning sandstone contrasts with green lawns
and colorful flower gardens, with views of the ocean from the second floor. Call
now, to arrange a viewing.
Warehouse Conversion
If you are seeking an open-plan style apartment located in the heart of the
vibrant inner city that is quiet and secure with a tranquil courtyard in its heart, this
is the property for you. Truly a unique opportunity, this 3-bedroom, 2-bathroom,
architect-designed conversion can offer tranquility and space for your artistic
endeavors or can open up to be the perfect party house. Inspect now.
Victorian Terrace
They don’t come much more sophisticated than this 3-story Victorian terrace
built in 1885. Located on a wide semi-circular street opposite elegant Victoria
Park, the front garden and wide upper-level balcony are bathed in generous
sunshine during the winter months while being protected from the wind. A rare
opportunity for those who love combining comfortable living with elegant
entertaining. A large living room adjoins a magnificent dining area served by a
modern kitchen with plenty of bench-space. Three upstairs bedrooms, two with
en-suite bathrooms, plus a guest bathroom on the ground floor, complete the
picture.
For further information and to arrange inspections (appointment only) please
call our office at 965-2254 or 965-2255 or e-mail at johnconnor@thehills.com
To:
 johnconnor@thehills.com
From:
 lisabrown@kyu.com
Subject:
 Interested buyer
820


## PDF 第 50 页

![PDF 第 50 页](images/read_page_50.png)



Dear Mr. Connor,
I was very interested by your recent advertisement. I am seeking a residence
that can accommodate an art studio and possibly hold private exhibitions for the
work I do. One of the listed places sounds like it could be suitable for my needs.
Therefore, I would like to meet with you soon to take a look at the place. Could
you please let me know when a good time for you is? I am okay anytime this week
except for Wednesday evening. Please get back to be as soon as possible.
Thanks so much for your attention.
Lisa Brown: 755-1207', NULL, '[{"id":"A","text":"To receive information about an art exhibit"},{"id":"B","text":"To set up an appointment"},{"id":"C","text":"To put her apartment on the market"},{"id":"D","text":"To reply to an inquiry she received from the man"}]'::jsonb, 184, 1.0)
    RETURNING id INTO v_question_id;
  ELSE
    UPDATE assessment_questions SET
      skill = 'reading',
      category = 'toeic_part_7',
      difficulty = 3,
      level = 'b2',
      prompt = 'What is the main purpose of the e-mail?',
      context_text = 'Questions 181-185
 refer to the following advertisement and e-mail message.
Prestige Properties now Available
For discerning customers seeking unique properties, The Hills Real
819


## PDF 第 49 页

![PDF 第 49 页](images/read_page_49.png)



Estate Agency is pleased to announce the availability of the following
residences in the most upscale parts of our city:
Santa Rosa
This beautiful Spanish-style mansion extends over a gently sloping half-acre
block. Constructed during the boom period of the 1920s, it has retained many
original architectural and historical features while the kitchen and bathrooms
have been tastefully modernized. Stunning sandstone contrasts with green lawns
and colorful flower gardens, with views of the ocean from the second floor. Call
now, to arrange a viewing.
Warehouse Conversion
If you are seeking an open-plan style apartment located in the heart of the
vibrant inner city that is quiet and secure with a tranquil courtyard in its heart, this
is the property for you. Truly a unique opportunity, this 3-bedroom, 2-bathroom,
architect-designed conversion can offer tranquility and space for your artistic
endeavors or can open up to be the perfect party house. Inspect now.
Victorian Terrace
They don’t come much more sophisticated than this 3-story Victorian terrace
built in 1885. Located on a wide semi-circular street opposite elegant Victoria
Park, the front garden and wide upper-level balcony are bathed in generous
sunshine during the winter months while being protected from the wind. A rare
opportunity for those who love combining comfortable living with elegant
entertaining. A large living room adjoins a magnificent dining area served by a
modern kitchen with plenty of bench-space. Three upstairs bedrooms, two with
en-suite bathrooms, plus a guest bathroom on the ground floor, complete the
picture.
For further information and to arrange inspections (appointment only) please
call our office at 965-2254 or 965-2255 or e-mail at johnconnor@thehills.com
To:
 johnconnor@thehills.com
From:
 lisabrown@kyu.com
Subject:
 Interested buyer
820


## PDF 第 50 页

![PDF 第 50 页](images/read_page_50.png)



Dear Mr. Connor,
I was very interested by your recent advertisement. I am seeking a residence
that can accommodate an art studio and possibly hold private exhibitions for the
work I do. One of the listed places sounds like it could be suitable for my needs.
Therefore, I would like to meet with you soon to take a look at the place. Could
you please let me know when a good time for you is? I am okay anytime this week
except for Wednesday evening. Please get back to be as soon as possible.
Thanks so much for your attention.
Lisa Brown: 755-1207',
      audio_url = NULL,
      options = '[{"id":"A","text":"To receive information about an art exhibit"},{"id":"B","text":"To set up an appointment"},{"id":"C","text":"To put her apartment on the market"},{"id":"D","text":"To reply to an inquiry she received from the man"}]'::jsonb
    WHERE id = v_question_id;
  END IF;

  -- Answer for #184
  DELETE FROM assessment_question_answers WHERE question_id = v_question_id;
  INSERT INTO assessment_question_answers (question_id, correct_option_id, explanation, transcript_text)
  VALUES (v_question_id, 'B', 'Đáp án đúng: B.

Phân tích bài đọc & dẫn chứng:
What is the main purpose of the e-mail?
(A) To receive information about an art exhibit
(B) To set up an appointment
(C) To put her apartment on the market
(D) To reply to an inquiry she received from the man
这封电子邮件的主要目的是什么？
(A)
为了获得一个艺术展的信息
(B)
为了预约
(C)
为了出售她的公寓
(D)
为了回复男士的请求
→在书信和电子邮件中描述写信目的时常用Could you please..., Can
you..., I’d like to..., I was wondering if..., Is it possible...
等，而信中提到了想要约定看房时间。答案是(B)。', NULL);

  -- Question #185 (toeic_part_7)
  SELECT id INTO v_question_id FROM assessment_questions WHERE assessment_id = v_assessment_id AND position = 185;
  IF v_question_id IS NULL THEN
    INSERT INTO assessment_questions (assessment_id, skill, category, difficulty, level, question_type, prompt, context_text, audio_url, options, position, weight)
    VALUES (v_assessment_id, 'reading', 'toeic_part_7', 3, 'b2', 'multiple_choice', 'What can be implied about Ms. Brown?', 'Questions 181-185
 refer to the following advertisement and e-mail message.
Prestige Properties now Available
For discerning customers seeking unique properties, The Hills Real
819


## PDF 第 49 页

![PDF 第 49 页](images/read_page_49.png)



Estate Agency is pleased to announce the availability of the following
residences in the most upscale parts of our city:
Santa Rosa
This beautiful Spanish-style mansion extends over a gently sloping half-acre
block. Constructed during the boom period of the 1920s, it has retained many
original architectural and historical features while the kitchen and bathrooms
have been tastefully modernized. Stunning sandstone contrasts with green lawns
and colorful flower gardens, with views of the ocean from the second floor. Call
now, to arrange a viewing.
Warehouse Conversion
If you are seeking an open-plan style apartment located in the heart of the
vibrant inner city that is quiet and secure with a tranquil courtyard in its heart, this
is the property for you. Truly a unique opportunity, this 3-bedroom, 2-bathroom,
architect-designed conversion can offer tranquility and space for your artistic
endeavors or can open up to be the perfect party house. Inspect now.
Victorian Terrace
They don’t come much more sophisticated than this 3-story Victorian terrace
built in 1885. Located on a wide semi-circular street opposite elegant Victoria
Park, the front garden and wide upper-level balcony are bathed in generous
sunshine during the winter months while being protected from the wind. A rare
opportunity for those who love combining comfortable living with elegant
entertaining. A large living room adjoins a magnificent dining area served by a
modern kitchen with plenty of bench-space. Three upstairs bedrooms, two with
en-suite bathrooms, plus a guest bathroom on the ground floor, complete the
picture.
For further information and to arrange inspections (appointment only) please
call our office at 965-2254 or 965-2255 or e-mail at johnconnor@thehills.com
To:
 johnconnor@thehills.com
From:
 lisabrown@kyu.com
Subject:
 Interested buyer
820


## PDF 第 50 页

![PDF 第 50 页](images/read_page_50.png)



Dear Mr. Connor,
I was very interested by your recent advertisement. I am seeking a residence
that can accommodate an art studio and possibly hold private exhibitions for the
work I do. One of the listed places sounds like it could be suitable for my needs.
Therefore, I would like to meet with you soon to take a look at the place. Could
you please let me know when a good time for you is? I am okay anytime this week
except for Wednesday evening. Please get back to be as soon as possible.
Thanks so much for your attention.
Lisa Brown: 755-1207', NULL, '[{"id":"A","text":"She is an artist."},{"id":"B","text":"She buys and sells properties."},{"id":"C","text":"She is interested in taking out an ad."},{"id":"D","text":"She coordinates seminars and conferences for a living."}]'::jsonb, 185, 1.0)
    RETURNING id INTO v_question_id;
  ELSE
    UPDATE assessment_questions SET
      skill = 'reading',
      category = 'toeic_part_7',
      difficulty = 3,
      level = 'b2',
      prompt = 'What can be implied about Ms. Brown?',
      context_text = 'Questions 181-185
 refer to the following advertisement and e-mail message.
Prestige Properties now Available
For discerning customers seeking unique properties, The Hills Real
819


## PDF 第 49 页

![PDF 第 49 页](images/read_page_49.png)



Estate Agency is pleased to announce the availability of the following
residences in the most upscale parts of our city:
Santa Rosa
This beautiful Spanish-style mansion extends over a gently sloping half-acre
block. Constructed during the boom period of the 1920s, it has retained many
original architectural and historical features while the kitchen and bathrooms
have been tastefully modernized. Stunning sandstone contrasts with green lawns
and colorful flower gardens, with views of the ocean from the second floor. Call
now, to arrange a viewing.
Warehouse Conversion
If you are seeking an open-plan style apartment located in the heart of the
vibrant inner city that is quiet and secure with a tranquil courtyard in its heart, this
is the property for you. Truly a unique opportunity, this 3-bedroom, 2-bathroom,
architect-designed conversion can offer tranquility and space for your artistic
endeavors or can open up to be the perfect party house. Inspect now.
Victorian Terrace
They don’t come much more sophisticated than this 3-story Victorian terrace
built in 1885. Located on a wide semi-circular street opposite elegant Victoria
Park, the front garden and wide upper-level balcony are bathed in generous
sunshine during the winter months while being protected from the wind. A rare
opportunity for those who love combining comfortable living with elegant
entertaining. A large living room adjoins a magnificent dining area served by a
modern kitchen with plenty of bench-space. Three upstairs bedrooms, two with
en-suite bathrooms, plus a guest bathroom on the ground floor, complete the
picture.
For further information and to arrange inspections (appointment only) please
call our office at 965-2254 or 965-2255 or e-mail at johnconnor@thehills.com
To:
 johnconnor@thehills.com
From:
 lisabrown@kyu.com
Subject:
 Interested buyer
820


## PDF 第 50 页

![PDF 第 50 页](images/read_page_50.png)



Dear Mr. Connor,
I was very interested by your recent advertisement. I am seeking a residence
that can accommodate an art studio and possibly hold private exhibitions for the
work I do. One of the listed places sounds like it could be suitable for my needs.
Therefore, I would like to meet with you soon to take a look at the place. Could
you please let me know when a good time for you is? I am okay anytime this week
except for Wednesday evening. Please get back to be as soon as possible.
Thanks so much for your attention.
Lisa Brown: 755-1207',
      audio_url = NULL,
      options = '[{"id":"A","text":"She is an artist."},{"id":"B","text":"She buys and sells properties."},{"id":"C","text":"She is interested in taking out an ad."},{"id":"D","text":"She coordinates seminars and conferences for a living."}]'::jsonb
    WHERE id = v_question_id;
  END IF;

  -- Answer for #185
  DELETE FROM assessment_question_answers WHERE question_id = v_question_id;
  INSERT INTO assessment_question_answers (question_id, correct_option_id, explanation, transcript_text)
  VALUES (v_question_id, 'A', 'Đáp án đúng: A.

Phân tích bài đọc & dẫn chứng:
What can be implied about Ms. Brown?
(A) She is an artist.
(B) She buys and sells properties.
(C) She is interested in taking out an ad.
(D) She coordinates seminars and conferences for a living.
能推断出有关布朗女士的什么信息？
(A)
她是一个艺术家。
(B)
她买卖房产。
(C)
她有兴趣索取一份广告。
(D)
她靠协调研讨会和会议谋生。
→布朗女士邮件中提到：I am seeking a residence that can
1278
```

## PDF 第 508 页

```text
accommodate an art studio and possibly hold private exhibitions
for the work I do，可见她是位艺术家。答案是(A)。
Questions 186-190
 refer to the following schedule, e-mail, and memo.
佛罗伦萨工程公司
面试安排
所有面试须录音。须事先通知求职者面试是要录音的。如果求职者不
同意被录音，应终止面试。在面试结束后的两个小时内应以书面形式记录
下对于求职者的印象，然后送交到研发部门负责人手中。
收件人：卢西恩
·
鲍尔
<lball@gregorson.com>
发件人：布莱恩
·
斯蒂芬森
<brians@florentineengineering.com>
主题：工程师职位
日期：
6
月
25
日
亲爱的鲍尔先生：
经过慎重考虑，公司招聘委员会决定录用您，职位是工程师。如果接
受该职位，您将享有
57,000
美元的年薪、两周带薪年假、综合医疗保险以
及其他福利。薪资和福利与我们面试当天沟通的一致。
由于您需要从其他州搬过来住，我们会为您提供一定的经济支持。如
需了解更多细节，请联系人力资源部的利比
·
韦尔曼
1279
```

## PDF 第 509 页

```text
(libby_w@florentineengineering.com)
。
我们希望您能于
7
月
25
日入职。请在
7
月
1
日之前告知我们您的决定。
如果您对入职条件有任何疑问，请与我联系，我的电话号码是
 (803) 837-
3836
。
祝好！
布莱恩
·
斯蒂芬森
研发部总监
佛罗伦萨工程公司
收件人：利比
·
韦尔曼，人力资源部总监
发件人：布莱恩
·
斯蒂芬森
日期：
6
月
30
日
主题：工程师职位
鲍尔先生今天早上通知我，他拒绝接受我们为其提供的职位，虽然我
们又为其增加了
10,000
美元的年薪。既然如此，我们决定将此职位提供给
萨莉
·
麦克丹尼尔。她的面试官使我相信她是这一职位的最佳人选。我们
将为她提供和之前提供给鲍尔先生的一样的入职条件。您可能会收到一封
来自麦克丹尼尔女士的电子邮件，询问各种相关事项，尤其是要从其他州
搬过来这件事。
▼ Vocabulary Check
candidate
求职者，候选人
 interviewer
面试官
 record
录音
 inform
通知
applicant
申请人
 termination
终止
 impression
印象
 R&D Department
研发部门
consideration
考虑
 committee
委员会
 annual salary
年薪
 paid vacation
带薪假
期
 comprehensive
综合的，全面的
 identical
相同的，一致的
 financial
assistance
经济支持
 turn down
拒绝
 convince
说服
 terms
条件；项目
1280
```

## PDF 第 510 页

```text', NULL);

  -- Question #186 (toeic_part_7)
  SELECT id INTO v_question_id FROM assessment_questions WHERE assessment_id = v_assessment_id AND position = 186;
  IF v_question_id IS NULL THEN
    INSERT INTO assessment_questions (assessment_id, skill, category, difficulty, level, question_type, prompt, context_text, audio_url, options, position, weight)
    VALUES (v_assessment_id, 'reading', 'toeic_part_7', 3, 'b2', 'multiple_choice', 'What is indicated about Mr. Menendez?', 'Questions 186-190
 refer to the following schedule, e-mail, and memo.
Florentine Engineering
Interview Schedule
All interviews should be recorded. You must inform the applicants this is
being done. Failure to agree will result in the termination of the interview.
Impressions of the applicant should be written down within two hours of
completing the interview and then sent to the head of the R&D Department.
822


## PDF 第 52 页

![PDF 第 52 页](images/read_page_52.png)



To: Lucian Ball <lball@gregorson.com>
From: Brian Stephenson <brians@florentineengineering.com>
Subject: Engineering Position
_____________________________________________________________________
Date: June 25
Dear Mr. Ball,
After careful consideration, the hiring committee has decided to extend an
offer of employment to you for the engineering position. Should you accept our
offer, you will receive an annual salary of $57,000 as well as two weeks of paid
vacation, comprehensive medical insurance, and other benefits. These terms are
identical to the ones we discussed on the date of your interview.
As you will be moving from out of state, we can provide a limited amount of
financial assistance. Please contact Libby Wellman
(libby_w@florentineengineering.com) in the HR Department with more details.
We would like for you to start your employment on July 25. We request that
you inform us of your decision by July 1. You can contact me at (803) 837-3836
if you have any questions regarding the terms of your employment.
Regards,
Brian Stephenson
Director, R&D Department
Florentine Engineering
To: Libby Wellman, HR Director
From: Brian Stephenson
823


## PDF 第 53 页

![PDF 第 53 页](images/read_page_53.png)



Date: June 30
Subject: Engineering Position
I was informed by Mr. Ball this morning that he has turned down our offer of
employment even after we said we’d pay him an extra $10,000 a year in salary.
As such, we have decided to give the job to Sally McDaniel. Her interviewer
convinced me that she’s the best candidate for the position. We will be offering
her the same terms which we originally offered Mr. Ball. You may receive an e-
mail from Ms. McDaniel at some point inquiring about various matters,
particularly moving from another state.', NULL, '[{"id":"A","text":"His interview was not recorded."},{"id":"B","text":"He interviewed with Ms. Yates."},{"id":"C","text":"His interview was held in room 108."},{"id":"D","text":"He interviewed in the afternoon."}]'::jsonb, 186, 1.0)
    RETURNING id INTO v_question_id;
  ELSE
    UPDATE assessment_questions SET
      skill = 'reading',
      category = 'toeic_part_7',
      difficulty = 3,
      level = 'b2',
      prompt = 'What is indicated about Mr. Menendez?',
      context_text = 'Questions 186-190
 refer to the following schedule, e-mail, and memo.
Florentine Engineering
Interview Schedule
All interviews should be recorded. You must inform the applicants this is
being done. Failure to agree will result in the termination of the interview.
Impressions of the applicant should be written down within two hours of
completing the interview and then sent to the head of the R&D Department.
822


## PDF 第 52 页

![PDF 第 52 页](images/read_page_52.png)



To: Lucian Ball <lball@gregorson.com>
From: Brian Stephenson <brians@florentineengineering.com>
Subject: Engineering Position
_____________________________________________________________________
Date: June 25
Dear Mr. Ball,
After careful consideration, the hiring committee has decided to extend an
offer of employment to you for the engineering position. Should you accept our
offer, you will receive an annual salary of $57,000 as well as two weeks of paid
vacation, comprehensive medical insurance, and other benefits. These terms are
identical to the ones we discussed on the date of your interview.
As you will be moving from out of state, we can provide a limited amount of
financial assistance. Please contact Libby Wellman
(libby_w@florentineengineering.com) in the HR Department with more details.
We would like for you to start your employment on July 25. We request that
you inform us of your decision by July 1. You can contact me at (803) 837-3836
if you have any questions regarding the terms of your employment.
Regards,
Brian Stephenson
Director, R&D Department
Florentine Engineering
To: Libby Wellman, HR Director
From: Brian Stephenson
823


## PDF 第 53 页

![PDF 第 53 页](images/read_page_53.png)



Date: June 30
Subject: Engineering Position
I was informed by Mr. Ball this morning that he has turned down our offer of
employment even after we said we’d pay him an extra $10,000 a year in salary.
As such, we have decided to give the job to Sally McDaniel. Her interviewer
convinced me that she’s the best candidate for the position. We will be offering
her the same terms which we originally offered Mr. Ball. You may receive an e-
mail from Ms. McDaniel at some point inquiring about various matters,
particularly moving from another state.',
      audio_url = NULL,
      options = '[{"id":"A","text":"His interview was not recorded."},{"id":"B","text":"He interviewed with Ms. Yates."},{"id":"C","text":"His interview was held in room 108."},{"id":"D","text":"He interviewed in the afternoon."}]'::jsonb
    WHERE id = v_question_id;
  END IF;

  -- Answer for #186
  DELETE FROM assessment_question_answers WHERE question_id = v_question_id;
  INSERT INTO assessment_question_answers (question_id, correct_option_id, explanation, transcript_text)
  VALUES (v_question_id, 'D', 'Đáp án đúng: D.

Phân tích bài đọc & dẫn chứng:
What is indicated about Mr. Menendez?
(A) His interview was not recorded.
(B) He interviewed with Ms. Yates.
(C) His interview was held in room 108.
(D) He interviewed in the afternoon.
关于梅内德斯先生，文章暗示了什么？
(A)
他的面试没有被录音。
(B)
他与耶茨女士进行了面谈。
(C)
他的面试是在
108
号房间进行的。
(D)
他的面试是在下午进行的。
→从面试安排表中可以看出，梅内德斯先生的面试时间是6月11日下午
1:00。故答案为(D)。', NULL);

  -- Question #187 (toeic_part_7)
  SELECT id INTO v_question_id FROM assessment_questions WHERE assessment_id = v_assessment_id AND position = 187;
  IF v_question_id IS NULL THEN
    INSERT INTO assessment_questions (assessment_id, skill, category, difficulty, level, question_type, prompt, context_text, audio_url, options, position, weight)
    VALUES (v_assessment_id, 'reading', 'toeic_part_7', 3, 'b2', 'multiple_choice', 'What is NOT true about the offer of employment extended to Mr. Ball?', 'Questions 186-190
 refer to the following schedule, e-mail, and memo.
Florentine Engineering
Interview Schedule
All interviews should be recorded. You must inform the applicants this is
being done. Failure to agree will result in the termination of the interview.
Impressions of the applicant should be written down within two hours of
completing the interview and then sent to the head of the R&D Department.
822


## PDF 第 52 页

![PDF 第 52 页](images/read_page_52.png)



To: Lucian Ball <lball@gregorson.com>
From: Brian Stephenson <brians@florentineengineering.com>
Subject: Engineering Position
_____________________________________________________________________
Date: June 25
Dear Mr. Ball,
After careful consideration, the hiring committee has decided to extend an
offer of employment to you for the engineering position. Should you accept our
offer, you will receive an annual salary of $57,000 as well as two weeks of paid
vacation, comprehensive medical insurance, and other benefits. These terms are
identical to the ones we discussed on the date of your interview.
As you will be moving from out of state, we can provide a limited amount of
financial assistance. Please contact Libby Wellman
(libby_w@florentineengineering.com) in the HR Department with more details.
We would like for you to start your employment on July 25. We request that
you inform us of your decision by July 1. You can contact me at (803) 837-3836
if you have any questions regarding the terms of your employment.
Regards,
Brian Stephenson
Director, R&D Department
Florentine Engineering
To: Libby Wellman, HR Director
From: Brian Stephenson
823


## PDF 第 53 页

![PDF 第 53 页](images/read_page_53.png)



Date: June 30
Subject: Engineering Position
I was informed by Mr. Ball this morning that he has turned down our offer of
employment even after we said we’d pay him an extra $10,000 a year in salary.
As such, we have decided to give the job to Sally McDaniel. Her interviewer
convinced me that she’s the best candidate for the position. We will be offering
her the same terms which we originally offered Mr. Ball. You may receive an e-
mail from Ms. McDaniel at some point inquiring about various matters,
particularly moving from another state.', NULL, '[{"id":"A","text":"It would have completely paid for his move."},{"id":"B","text":"It contained several types of benefits."},{"id":"C","text":"It required him to start working in July."},{"id":"D","text":"It gave him some paid time off."}]'::jsonb, 187, 1.0)
    RETURNING id INTO v_question_id;
  ELSE
    UPDATE assessment_questions SET
      skill = 'reading',
      category = 'toeic_part_7',
      difficulty = 3,
      level = 'b2',
      prompt = 'What is NOT true about the offer of employment extended to Mr. Ball?',
      context_text = 'Questions 186-190
 refer to the following schedule, e-mail, and memo.
Florentine Engineering
Interview Schedule
All interviews should be recorded. You must inform the applicants this is
being done. Failure to agree will result in the termination of the interview.
Impressions of the applicant should be written down within two hours of
completing the interview and then sent to the head of the R&D Department.
822


## PDF 第 52 页

![PDF 第 52 页](images/read_page_52.png)



To: Lucian Ball <lball@gregorson.com>
From: Brian Stephenson <brians@florentineengineering.com>
Subject: Engineering Position
_____________________________________________________________________
Date: June 25
Dear Mr. Ball,
After careful consideration, the hiring committee has decided to extend an
offer of employment to you for the engineering position. Should you accept our
offer, you will receive an annual salary of $57,000 as well as two weeks of paid
vacation, comprehensive medical insurance, and other benefits. These terms are
identical to the ones we discussed on the date of your interview.
As you will be moving from out of state, we can provide a limited amount of
financial assistance. Please contact Libby Wellman
(libby_w@florentineengineering.com) in the HR Department with more details.
We would like for you to start your employment on July 25. We request that
you inform us of your decision by July 1. You can contact me at (803) 837-3836
if you have any questions regarding the terms of your employment.
Regards,
Brian Stephenson
Director, R&D Department
Florentine Engineering
To: Libby Wellman, HR Director
From: Brian Stephenson
823


## PDF 第 53 页

![PDF 第 53 页](images/read_page_53.png)



Date: June 30
Subject: Engineering Position
I was informed by Mr. Ball this morning that he has turned down our offer of
employment even after we said we’d pay him an extra $10,000 a year in salary.
As such, we have decided to give the job to Sally McDaniel. Her interviewer
convinced me that she’s the best candidate for the position. We will be offering
her the same terms which we originally offered Mr. Ball. You may receive an e-
mail from Ms. McDaniel at some point inquiring about various matters,
particularly moving from another state.',
      audio_url = NULL,
      options = '[{"id":"A","text":"It would have completely paid for his move."},{"id":"B","text":"It contained several types of benefits."},{"id":"C","text":"It required him to start working in July."},{"id":"D","text":"It gave him some paid time off."}]'::jsonb
    WHERE id = v_question_id;
  END IF;

  -- Answer for #187
  DELETE FROM assessment_question_answers WHERE question_id = v_question_id;
  INSERT INTO assessment_question_answers (question_id, correct_option_id, explanation, transcript_text)
  VALUES (v_question_id, 'A', 'Đáp án đúng: A.

Phân tích bài đọc & dẫn chứng:
What is NOT true about the offer of employment extended to Mr. Ball?
(A) It would have completely paid for his move.
(B) It contained several types of benefits.
(C) It required him to start working in July.
(D) It gave him some paid time off.
关于提供给鲍尔先生的职位，下面哪项表述是错误的
?
(A)
公司将承担他搬家的全部费用。
(B)
入职条件中包含好几项福利。
(C)
入职条件中要求他
7
月开始工作。
(D)
该职位提供带薪假期。
→邮件中提到，由于鲍尔先生需要从其他州搬过来住，所以公司会为他
提供一定的经济支持，但不是为其承担全部费用。故答案为(A)。
1281
```

## PDF 第 511 页

```text', NULL);

  -- Question #188 (toeic_part_7)
  SELECT id INTO v_question_id FROM assessment_questions WHERE assessment_id = v_assessment_id AND position = 188;
  IF v_question_id IS NULL THEN
    INSERT INTO assessment_questions (assessment_id, skill, category, difficulty, level, question_type, prompt, context_text, audio_url, options, position, weight)
    VALUES (v_assessment_id, 'reading', 'toeic_part_7', 3, 'b2', 'multiple_choice', 'What is suggested about Mr. Stephenson?', 'Questions 186-190
 refer to the following schedule, e-mail, and memo.
Florentine Engineering
Interview Schedule
All interviews should be recorded. You must inform the applicants this is
being done. Failure to agree will result in the termination of the interview.
Impressions of the applicant should be written down within two hours of
completing the interview and then sent to the head of the R&D Department.
822


## PDF 第 52 页

![PDF 第 52 页](images/read_page_52.png)



To: Lucian Ball <lball@gregorson.com>
From: Brian Stephenson <brians@florentineengineering.com>
Subject: Engineering Position
_____________________________________________________________________
Date: June 25
Dear Mr. Ball,
After careful consideration, the hiring committee has decided to extend an
offer of employment to you for the engineering position. Should you accept our
offer, you will receive an annual salary of $57,000 as well as two weeks of paid
vacation, comprehensive medical insurance, and other benefits. These terms are
identical to the ones we discussed on the date of your interview.
As you will be moving from out of state, we can provide a limited amount of
financial assistance. Please contact Libby Wellman
(libby_w@florentineengineering.com) in the HR Department with more details.
We would like for you to start your employment on July 25. We request that
you inform us of your decision by July 1. You can contact me at (803) 837-3836
if you have any questions regarding the terms of your employment.
Regards,
Brian Stephenson
Director, R&D Department
Florentine Engineering
To: Libby Wellman, HR Director
From: Brian Stephenson
823


## PDF 第 53 页

![PDF 第 53 页](images/read_page_53.png)



Date: June 30
Subject: Engineering Position
I was informed by Mr. Ball this morning that he has turned down our offer of
employment even after we said we’d pay him an extra $10,000 a year in salary.
As such, we have decided to give the job to Sally McDaniel. Her interviewer
convinced me that she’s the best candidate for the position. We will be offering
her the same terms which we originally offered Mr. Ball. You may receive an e-
mail from Ms. McDaniel at some point inquiring about various matters,
particularly moving from another state.', NULL, '[{"id":"A","text":"He has a master’s degree in civil engineering."},{"id":"B","text":"He received notes about Karen Myers on June 11."},{"id":"C","text":"He works in the same department as Ms. Wellman."},{"id":"D","text":"He conducted interviews with several individuals."}]'::jsonb, 188, 1.0)
    RETURNING id INTO v_question_id;
  ELSE
    UPDATE assessment_questions SET
      skill = 'reading',
      category = 'toeic_part_7',
      difficulty = 3,
      level = 'b2',
      prompt = 'What is suggested about Mr. Stephenson?',
      context_text = 'Questions 186-190
 refer to the following schedule, e-mail, and memo.
Florentine Engineering
Interview Schedule
All interviews should be recorded. You must inform the applicants this is
being done. Failure to agree will result in the termination of the interview.
Impressions of the applicant should be written down within two hours of
completing the interview and then sent to the head of the R&D Department.
822


## PDF 第 52 页

![PDF 第 52 页](images/read_page_52.png)



To: Lucian Ball <lball@gregorson.com>
From: Brian Stephenson <brians@florentineengineering.com>
Subject: Engineering Position
_____________________________________________________________________
Date: June 25
Dear Mr. Ball,
After careful consideration, the hiring committee has decided to extend an
offer of employment to you for the engineering position. Should you accept our
offer, you will receive an annual salary of $57,000 as well as two weeks of paid
vacation, comprehensive medical insurance, and other benefits. These terms are
identical to the ones we discussed on the date of your interview.
As you will be moving from out of state, we can provide a limited amount of
financial assistance. Please contact Libby Wellman
(libby_w@florentineengineering.com) in the HR Department with more details.
We would like for you to start your employment on July 25. We request that
you inform us of your decision by July 1. You can contact me at (803) 837-3836
if you have any questions regarding the terms of your employment.
Regards,
Brian Stephenson
Director, R&D Department
Florentine Engineering
To: Libby Wellman, HR Director
From: Brian Stephenson
823


## PDF 第 53 页

![PDF 第 53 页](images/read_page_53.png)



Date: June 30
Subject: Engineering Position
I was informed by Mr. Ball this morning that he has turned down our offer of
employment even after we said we’d pay him an extra $10,000 a year in salary.
As such, we have decided to give the job to Sally McDaniel. Her interviewer
convinced me that she’s the best candidate for the position. We will be offering
her the same terms which we originally offered Mr. Ball. You may receive an e-
mail from Ms. McDaniel at some point inquiring about various matters,
particularly moving from another state.',
      audio_url = NULL,
      options = '[{"id":"A","text":"He has a master’s degree in civil engineering."},{"id":"B","text":"He received notes about Karen Myers on June 11."},{"id":"C","text":"He works in the same department as Ms. Wellman."},{"id":"D","text":"He conducted interviews with several individuals."}]'::jsonb
    WHERE id = v_question_id;
  END IF;

  -- Answer for #188
  DELETE FROM assessment_question_answers WHERE question_id = v_question_id;
  INSERT INTO assessment_question_answers (question_id, correct_option_id, explanation, transcript_text)
  VALUES (v_question_id, 'B', 'Đáp án đúng: B.

Phân tích bài đọc & dẫn chứng:
What is suggested about Mr. Stephenson?
(A) He has a master’s degree in civil engineering.
(B) He received notes about Karen Myers on June 11.
(C) He works in the same department as Ms. Wellman.
(D) He conducted interviews with several individuals.
关于斯蒂芬森先生，文章暗示了什么？
(A)
他获得了土木工程专业的硕士学位。
(B)
他
6
月
11
日收到了有关凯伦
·
迈尔斯的信息。
(C)
他和韦尔曼女士在一个部门工作。
(D)
他面试了好几个求职者。
→面试安排表中显示，凯伦·迈尔斯在6月11日进行了面试，而面试结
束后的两小时内，对凯伦·迈尔斯的书面评价会被送到研发部的总监手中，
即斯蒂芬森先生那里。故答案为(B)。', NULL);

  -- Question #189 (toeic_part_7)
  SELECT id INTO v_question_id FROM assessment_questions WHERE assessment_id = v_assessment_id AND position = 189;
  IF v_question_id IS NULL THEN
    INSERT INTO assessment_questions (assessment_id, skill, category, difficulty, level, question_type, prompt, context_text, audio_url, options, position, weight)
    VALUES (v_assessment_id, 'reading', 'toeic_part_7', 3, 'b2', 'multiple_choice', 'Who most likely recommended that Ms. McDaniel be offered a job? 824 ``` ## PDF 第 54 页 ![PDF 第 54 页](images/read_page_54.png) ```text', 'Questions 186-190
 refer to the following schedule, e-mail, and memo.
Florentine Engineering
Interview Schedule
All interviews should be recorded. You must inform the applicants this is
being done. Failure to agree will result in the termination of the interview.
Impressions of the applicant should be written down within two hours of
completing the interview and then sent to the head of the R&D Department.
822


## PDF 第 52 页

![PDF 第 52 页](images/read_page_52.png)



To: Lucian Ball <lball@gregorson.com>
From: Brian Stephenson <brians@florentineengineering.com>
Subject: Engineering Position
_____________________________________________________________________
Date: June 25
Dear Mr. Ball,
After careful consideration, the hiring committee has decided to extend an
offer of employment to you for the engineering position. Should you accept our
offer, you will receive an annual salary of $57,000 as well as two weeks of paid
vacation, comprehensive medical insurance, and other benefits. These terms are
identical to the ones we discussed on the date of your interview.
As you will be moving from out of state, we can provide a limited amount of
financial assistance. Please contact Libby Wellman
(libby_w@florentineengineering.com) in the HR Department with more details.
We would like for you to start your employment on July 25. We request that
you inform us of your decision by July 1. You can contact me at (803) 837-3836
if you have any questions regarding the terms of your employment.
Regards,
Brian Stephenson
Director, R&D Department
Florentine Engineering
To: Libby Wellman, HR Director
From: Brian Stephenson
823


## PDF 第 53 页

![PDF 第 53 页](images/read_page_53.png)



Date: June 30
Subject: Engineering Position
I was informed by Mr. Ball this morning that he has turned down our offer of
employment even after we said we’d pay him an extra $10,000 a year in salary.
As such, we have decided to give the job to Sally McDaniel. Her interviewer
convinced me that she’s the best candidate for the position. We will be offering
her the same terms which we originally offered Mr. Ball. You may receive an e-
mail from Ms. McDaniel at some point inquiring about various matters,
particularly moving from another state.', NULL, '[{"id":"A","text":"Brian Stephenson"},{"id":"B","text":"Roger Scott"},{"id":"C","text":"Carter Vernon"},{"id":"D","text":"Jasmine Yates"}]'::jsonb, 189, 1.0)
    RETURNING id INTO v_question_id;
  ELSE
    UPDATE assessment_questions SET
      skill = 'reading',
      category = 'toeic_part_7',
      difficulty = 3,
      level = 'b2',
      prompt = 'Who most likely recommended that Ms. McDaniel be offered a job? 824 ``` ## PDF 第 54 页 ![PDF 第 54 页](images/read_page_54.png) ```text',
      context_text = 'Questions 186-190
 refer to the following schedule, e-mail, and memo.
Florentine Engineering
Interview Schedule
All interviews should be recorded. You must inform the applicants this is
being done. Failure to agree will result in the termination of the interview.
Impressions of the applicant should be written down within two hours of
completing the interview and then sent to the head of the R&D Department.
822


## PDF 第 52 页

![PDF 第 52 页](images/read_page_52.png)



To: Lucian Ball <lball@gregorson.com>
From: Brian Stephenson <brians@florentineengineering.com>
Subject: Engineering Position
_____________________________________________________________________
Date: June 25
Dear Mr. Ball,
After careful consideration, the hiring committee has decided to extend an
offer of employment to you for the engineering position. Should you accept our
offer, you will receive an annual salary of $57,000 as well as two weeks of paid
vacation, comprehensive medical insurance, and other benefits. These terms are
identical to the ones we discussed on the date of your interview.
As you will be moving from out of state, we can provide a limited amount of
financial assistance. Please contact Libby Wellman
(libby_w@florentineengineering.com) in the HR Department with more details.
We would like for you to start your employment on July 25. We request that
you inform us of your decision by July 1. You can contact me at (803) 837-3836
if you have any questions regarding the terms of your employment.
Regards,
Brian Stephenson
Director, R&D Department
Florentine Engineering
To: Libby Wellman, HR Director
From: Brian Stephenson
823


## PDF 第 53 页

![PDF 第 53 页](images/read_page_53.png)



Date: June 30
Subject: Engineering Position
I was informed by Mr. Ball this morning that he has turned down our offer of
employment even after we said we’d pay him an extra $10,000 a year in salary.
As such, we have decided to give the job to Sally McDaniel. Her interviewer
convinced me that she’s the best candidate for the position. We will be offering
her the same terms which we originally offered Mr. Ball. You may receive an e-
mail from Ms. McDaniel at some point inquiring about various matters,
particularly moving from another state.',
      audio_url = NULL,
      options = '[{"id":"A","text":"Brian Stephenson"},{"id":"B","text":"Roger Scott"},{"id":"C","text":"Carter Vernon"},{"id":"D","text":"Jasmine Yates"}]'::jsonb
    WHERE id = v_question_id;
  END IF;

  -- Answer for #189
  DELETE FROM assessment_question_answers WHERE question_id = v_question_id;
  INSERT INTO assessment_question_answers (question_id, correct_option_id, explanation, transcript_text)
  VALUES (v_question_id, 'C', 'Đáp án đúng: C.

Phân tích bài đọc & dẫn chứng:
Who most likely recommended that Ms. McDaniel be offered a job?
(A) Brian Stephenson
(B) Roger Scott
(C) Carter Vernon
(D) Jasmine Yates
谁最有可能建议公司为麦克丹尼尔女士提供一个职位？
(A)
布莱恩
·
斯蒂芬森
(B)
罗杰
·
斯科特
(C)
卡特
·
弗农
(D)
贾思敏
·
耶茨
→卡特·弗农是萨莉·麦克丹尼尔的面试官，他使斯蒂芬森先生相信麦
1282
```

## PDF 第 512 页

```text
克丹尼尔是工程师职务的最佳人选。故答案为(C)。', NULL);

  -- Question #190 (toeic_part_7)
  SELECT id INTO v_question_id FROM assessment_questions WHERE assessment_id = v_assessment_id AND position = 190;
  IF v_question_id IS NULL THEN
    INSERT INTO assessment_questions (assessment_id, skill, category, difficulty, level, question_type, prompt, context_text, audio_url, options, position, weight)
    VALUES (v_assessment_id, 'reading', 'toeic_part_7', 3, 'b2', 'multiple_choice', 'In the memo, the word“terms” in line 4 is closest in meaning to', 'Questions 186-190
 refer to the following schedule, e-mail, and memo.
Florentine Engineering
Interview Schedule
All interviews should be recorded. You must inform the applicants this is
being done. Failure to agree will result in the termination of the interview.
Impressions of the applicant should be written down within two hours of
completing the interview and then sent to the head of the R&D Department.
822


## PDF 第 52 页

![PDF 第 52 页](images/read_page_52.png)



To: Lucian Ball <lball@gregorson.com>
From: Brian Stephenson <brians@florentineengineering.com>
Subject: Engineering Position
_____________________________________________________________________
Date: June 25
Dear Mr. Ball,
After careful consideration, the hiring committee has decided to extend an
offer of employment to you for the engineering position. Should you accept our
offer, you will receive an annual salary of $57,000 as well as two weeks of paid
vacation, comprehensive medical insurance, and other benefits. These terms are
identical to the ones we discussed on the date of your interview.
As you will be moving from out of state, we can provide a limited amount of
financial assistance. Please contact Libby Wellman
(libby_w@florentineengineering.com) in the HR Department with more details.
We would like for you to start your employment on July 25. We request that
you inform us of your decision by July 1. You can contact me at (803) 837-3836
if you have any questions regarding the terms of your employment.
Regards,
Brian Stephenson
Director, R&D Department
Florentine Engineering
To: Libby Wellman, HR Director
From: Brian Stephenson
823


## PDF 第 53 页

![PDF 第 53 页](images/read_page_53.png)



Date: June 30
Subject: Engineering Position
I was informed by Mr. Ball this morning that he has turned down our offer of
employment even after we said we’d pay him an extra $10,000 a year in salary.
As such, we have decided to give the job to Sally McDaniel. Her interviewer
convinced me that she’s the best candidate for the position. We will be offering
her the same terms which we originally offered Mr. Ball. You may receive an e-
mail from Ms. McDaniel at some point inquiring about various matters,
particularly moving from another state.', NULL, '[{"id":"A","text":"negotiations"},{"id":"B","text":"periods"},{"id":"C","text":"opportunities"},{"id":"D","text":"conditions"}]'::jsonb, 190, 1.0)
    RETURNING id INTO v_question_id;
  ELSE
    UPDATE assessment_questions SET
      skill = 'reading',
      category = 'toeic_part_7',
      difficulty = 3,
      level = 'b2',
      prompt = 'In the memo, the word“terms” in line 4 is closest in meaning to',
      context_text = 'Questions 186-190
 refer to the following schedule, e-mail, and memo.
Florentine Engineering
Interview Schedule
All interviews should be recorded. You must inform the applicants this is
being done. Failure to agree will result in the termination of the interview.
Impressions of the applicant should be written down within two hours of
completing the interview and then sent to the head of the R&D Department.
822


## PDF 第 52 页

![PDF 第 52 页](images/read_page_52.png)



To: Lucian Ball <lball@gregorson.com>
From: Brian Stephenson <brians@florentineengineering.com>
Subject: Engineering Position
_____________________________________________________________________
Date: June 25
Dear Mr. Ball,
After careful consideration, the hiring committee has decided to extend an
offer of employment to you for the engineering position. Should you accept our
offer, you will receive an annual salary of $57,000 as well as two weeks of paid
vacation, comprehensive medical insurance, and other benefits. These terms are
identical to the ones we discussed on the date of your interview.
As you will be moving from out of state, we can provide a limited amount of
financial assistance. Please contact Libby Wellman
(libby_w@florentineengineering.com) in the HR Department with more details.
We would like for you to start your employment on July 25. We request that
you inform us of your decision by July 1. You can contact me at (803) 837-3836
if you have any questions regarding the terms of your employment.
Regards,
Brian Stephenson
Director, R&D Department
Florentine Engineering
To: Libby Wellman, HR Director
From: Brian Stephenson
823


## PDF 第 53 页

![PDF 第 53 页](images/read_page_53.png)



Date: June 30
Subject: Engineering Position
I was informed by Mr. Ball this morning that he has turned down our offer of
employment even after we said we’d pay him an extra $10,000 a year in salary.
As such, we have decided to give the job to Sally McDaniel. Her interviewer
convinced me that she’s the best candidate for the position. We will be offering
her the same terms which we originally offered Mr. Ball. You may receive an e-
mail from Ms. McDaniel at some point inquiring about various matters,
particularly moving from another state.',
      audio_url = NULL,
      options = '[{"id":"A","text":"negotiations"},{"id":"B","text":"periods"},{"id":"C","text":"opportunities"},{"id":"D","text":"conditions"}]'::jsonb
    WHERE id = v_question_id;
  END IF;

  -- Answer for #190
  DELETE FROM assessment_question_answers WHERE question_id = v_question_id;
  INSERT INTO assessment_question_answers (question_id, correct_option_id, explanation, transcript_text)
  VALUES (v_question_id, 'D', 'Đáp án đúng: D.

Phân tích bài đọc & dẫn chứng:
In the memo, the word“terms” in line 4 is closest in meaning to
(A) negotiations
(B) periods
(C) opportunities
(D) conditions
与备忘录中第
4
行的
“terms”
一词意思最接近的是
(A)
谈判
(B)
周期
(C)
机会
(D)
条件
→“terms”一词指的是提供给两位申请人的年薪、带薪假期、综合医
疗保险以及其他福利。故答案为(D)。
Questions 191-195
 refer to the following announcement, receipt, and e-mail.
请来参加富尔顿县年度资金筹集活动
日期：
7
月
11
日，周六
时间：上午
10:00
至下午
5:00
地点：兰霍恩大道
654
号富尔顿县社区中心
我们将出售多种商品，包括衣服、图书、工艺美术品、食品、家具和
玩具。
此次活动所得善款将归富尔顿县社区中心所有，并将被用于支付儿
童、青年和老人的特殊活动。
此次资金筹集活动的所有工作人员均为志愿者。
如需帮助，请致电卡洛
·
曼宁，电话号码为
 589-4822
。
1283
```

## PDF 第 513 页

```text
商品一经售出，概不退换。
富尔顿县资金筹集活动
7
月
11
日，周六，下午
12:16
302
号顾客
收银员：梅尔文
·
赖特
商品

价钱
两本书
 5
美元
/
本
3
个玩具
 3
美元
/
个
1
张桌子
 25
美元
合计
 44
美元
含税
 0
美元
付款金额
 50
美元
找零
 6
美元
收件人：卡洛
·
曼宁
 <carolm@fultoncounty.org>
发件人：格雷格
·
斯坦
 <gstein@sigma.com>
日期：
 7
月
12
日
主题：资金筹集活动
亲爱的曼宁女士：
我昨天参加了资金筹集活动。自从
10
年前从彭萨科拉搬到富尔顿县，
我每年都参加资金筹集活动。我非常喜欢此次活动，并且为自己和他人买
1284
```

## PDF 第 514 页

```text
了几件商品。不幸的是，我买的桌子有点问题。回到家以后，我把桌子安
装上，其中一条桌腿掉了，没法重新安上了，所以我没法使用这张桌子。
我想知道是否有可能为我退款。我明天会去社区中心上工艺美术品课，所
以也许我能下午去找您聊聊这事儿。
祝好！
格雷格
·
斯坦
▼ Vocabulary Check
annual
一年一次的
 fundraiser
资金募集活动，募捐
 proceeds
收入，收益
community
社区
 the elderly
老人
 volunteer
志愿者
 cashier
收银员
 item
商品
total
总计，总数
 amount
数额
 change
零钱，找头
 thoroughly
完全地，非常
purchase
购买
 reattach
重新安装
 refund
退款
 have a chat with sb.
与某人聊天', NULL);

  -- Question #191 (toeic_part_7)
  SELECT id INTO v_question_id FROM assessment_questions WHERE assessment_id = v_assessment_id AND position = 191;
  IF v_question_id IS NULL THEN
    INSERT INTO assessment_questions (assessment_id, skill, category, difficulty, level, question_type, prompt, context_text, audio_url, options, position, weight)
    VALUES (v_assessment_id, 'reading', 'toeic_part_7', 3, 'b2', 'multiple_choice', 'Which item will most likely NOT be sold at the fundraiser?', 'Questions 191-195
 refer to the following announcement, receipt, and e-mail.
825


## PDF 第 55 页

![PDF 第 55 页](images/read_page_55.png)



To: Carol Manning <carolm@fultoncounty.org>
From: Greg Stein <gstein@sigma.com>
Date: July 12
Subject: Fundraiser
_____________________________________________________________________
Dear Ms. Manning,
I attended the fundraiser yesterday just as I have been doing ever since I
moved to Fulton County from Pensacola ten years ago. I thoroughly enjoyed my
time at the event and made several purchases for myself and others. Unfortunately,
the desk which I bought has a problem. When I set it up at home, one of the legs
fell off. It can’t be reattached, so I can’t use it. I wonder if it would be possible to
826


## PDF 第 56 页

![PDF 第 56 页](images/read_page_56.png)



get my money refunded. I’ll be visiting the community center to attend my arts and
crafts class tomorrow, so perhaps I can have a chat with you in the afternoon.
Regards,
Greg Stein', NULL, '[{"id":"A","text":"A sofa"},{"id":"B","text":"A blouse"},{"id":"C","text":"A cake"},{"id":"D","text":"A necklace"}]'::jsonb, 191, 1.0)
    RETURNING id INTO v_question_id;
  ELSE
    UPDATE assessment_questions SET
      skill = 'reading',
      category = 'toeic_part_7',
      difficulty = 3,
      level = 'b2',
      prompt = 'Which item will most likely NOT be sold at the fundraiser?',
      context_text = 'Questions 191-195
 refer to the following announcement, receipt, and e-mail.
825


## PDF 第 55 页

![PDF 第 55 页](images/read_page_55.png)



To: Carol Manning <carolm@fultoncounty.org>
From: Greg Stein <gstein@sigma.com>
Date: July 12
Subject: Fundraiser
_____________________________________________________________________
Dear Ms. Manning,
I attended the fundraiser yesterday just as I have been doing ever since I
moved to Fulton County from Pensacola ten years ago. I thoroughly enjoyed my
time at the event and made several purchases for myself and others. Unfortunately,
the desk which I bought has a problem. When I set it up at home, one of the legs
fell off. It can’t be reattached, so I can’t use it. I wonder if it would be possible to
826


## PDF 第 56 页

![PDF 第 56 页](images/read_page_56.png)



get my money refunded. I’ll be visiting the community center to attend my arts and
crafts class tomorrow, so perhaps I can have a chat with you in the afternoon.
Regards,
Greg Stein',
      audio_url = NULL,
      options = '[{"id":"A","text":"A sofa"},{"id":"B","text":"A blouse"},{"id":"C","text":"A cake"},{"id":"D","text":"A necklace"}]'::jsonb
    WHERE id = v_question_id;
  END IF;

  -- Answer for #191
  DELETE FROM assessment_question_answers WHERE question_id = v_question_id;
  INSERT INTO assessment_question_answers (question_id, correct_option_id, explanation, transcript_text)
  VALUES (v_question_id, 'D', 'Đáp án đúng: D.

Phân tích bài đọc & dẫn chứng:
Which item will most likely NOT be sold at the fundraiser?
(A) A sofa
(B) A blouse
(C) A cake
(D) A necklace
哪种商品最不可能在资金筹集活动中出售？
(A)
一个沙发
(B)
一件罩衫
(C)
一块蛋糕
(D)
一条项链
→资金筹集活动中出售的商品包括衣服、图书、工艺美术品、食品、家
具和玩具，不包括珠宝首饰。故答案为(D)。', NULL);

  -- Question #192 (toeic_part_7)
  SELECT id INTO v_question_id FROM assessment_questions WHERE assessment_id = v_assessment_id AND position = 192;
  IF v_question_id IS NULL THEN
    INSERT INTO assessment_questions (assessment_id, skill, category, difficulty, level, question_type, prompt, context_text, audio_url, options, position, weight)
    VALUES (v_assessment_id, 'reading', 'toeic_part_7', 3, 'b2', 'multiple_choice', 'In the announcement, the word“proceeds” in line 12 is closest in meaning to', 'Questions 191-195
 refer to the following announcement, receipt, and e-mail.
825


## PDF 第 55 页

![PDF 第 55 页](images/read_page_55.png)



To: Carol Manning <carolm@fultoncounty.org>
From: Greg Stein <gstein@sigma.com>
Date: July 12
Subject: Fundraiser
_____________________________________________________________________
Dear Ms. Manning,
I attended the fundraiser yesterday just as I have been doing ever since I
moved to Fulton County from Pensacola ten years ago. I thoroughly enjoyed my
time at the event and made several purchases for myself and others. Unfortunately,
the desk which I bought has a problem. When I set it up at home, one of the legs
fell off. It can’t be reattached, so I can’t use it. I wonder if it would be possible to
826


## PDF 第 56 页

![PDF 第 56 页](images/read_page_56.png)



get my money refunded. I’ll be visiting the community center to attend my arts and
crafts class tomorrow, so perhaps I can have a chat with you in the afternoon.
Regards,
Greg Stein', NULL, '[{"id":"A","text":"budgets"},{"id":"B","text":"loans"},{"id":"C","text":"credits"},{"id":"D","text":"profits"}]'::jsonb, 192, 1.0)
    RETURNING id INTO v_question_id;
  ELSE
    UPDATE assessment_questions SET
      skill = 'reading',
      category = 'toeic_part_7',
      difficulty = 3,
      level = 'b2',
      prompt = 'In the announcement, the word“proceeds” in line 12 is closest in meaning to',
      context_text = 'Questions 191-195
 refer to the following announcement, receipt, and e-mail.
825


## PDF 第 55 页

![PDF 第 55 页](images/read_page_55.png)



To: Carol Manning <carolm@fultoncounty.org>
From: Greg Stein <gstein@sigma.com>
Date: July 12
Subject: Fundraiser
_____________________________________________________________________
Dear Ms. Manning,
I attended the fundraiser yesterday just as I have been doing ever since I
moved to Fulton County from Pensacola ten years ago. I thoroughly enjoyed my
time at the event and made several purchases for myself and others. Unfortunately,
the desk which I bought has a problem. When I set it up at home, one of the legs
fell off. It can’t be reattached, so I can’t use it. I wonder if it would be possible to
826


## PDF 第 56 页

![PDF 第 56 页](images/read_page_56.png)



get my money refunded. I’ll be visiting the community center to attend my arts and
crafts class tomorrow, so perhaps I can have a chat with you in the afternoon.
Regards,
Greg Stein',
      audio_url = NULL,
      options = '[{"id":"A","text":"budgets"},{"id":"B","text":"loans"},{"id":"C","text":"credits"},{"id":"D","text":"profits"}]'::jsonb
    WHERE id = v_question_id;
  END IF;

  -- Answer for #192
  DELETE FROM assessment_question_answers WHERE question_id = v_question_id;
  INSERT INTO assessment_question_answers (question_id, correct_option_id, explanation, transcript_text)
  VALUES (v_question_id, 'D', 'Đáp án đúng: D.

Phân tích bài đọc & dẫn chứng:
In the announcement, the word“proceeds” in line 12 is closest in meaning to
1285
```

## PDF 第 515 页

```text
(A) budgets
(B) loans
(C) credits
(D) profits
在通告中，第
12
行的
“proceeds”
一词的意思最接近
(A)
预算
(B)
贷款
(C)
存款
(D)
收益
→“proceeds”一词在此处是指“收入，获利”。故答案为(D)。', NULL);

  -- Question #193 (toeic_part_7)
  SELECT id INTO v_question_id FROM assessment_questions WHERE assessment_id = v_assessment_id AND position = 193;
  IF v_question_id IS NULL THEN
    INSERT INTO assessment_questions (assessment_id, skill, category, difficulty, level, question_type, prompt, context_text, audio_url, options, position, weight)
    VALUES (v_assessment_id, 'reading', 'toeic_part_7', 3, 'b2', 'multiple_choice', 'What is suggested about Mr. Wright?', 'Questions 191-195
 refer to the following announcement, receipt, and e-mail.
825


## PDF 第 55 页

![PDF 第 55 页](images/read_page_55.png)



To: Carol Manning <carolm@fultoncounty.org>
From: Greg Stein <gstein@sigma.com>
Date: July 12
Subject: Fundraiser
_____________________________________________________________________
Dear Ms. Manning,
I attended the fundraiser yesterday just as I have been doing ever since I
moved to Fulton County from Pensacola ten years ago. I thoroughly enjoyed my
time at the event and made several purchases for myself and others. Unfortunately,
the desk which I bought has a problem. When I set it up at home, one of the legs
fell off. It can’t be reattached, so I can’t use it. I wonder if it would be possible to
826


## PDF 第 56 页

![PDF 第 56 页](images/read_page_56.png)



get my money refunded. I’ll be visiting the community center to attend my arts and
crafts class tomorrow, so perhaps I can have a chat with you in the afternoon.
Regards,
Greg Stein', NULL, '[{"id":"A","text":"He received no money for working."},{"id":"B","text":"He purchased some toys."},{"id":"C","text":"He paid for the items with cash."},{"id":"D","text":"He enjoys reading books."}]'::jsonb, 193, 1.0)
    RETURNING id INTO v_question_id;
  ELSE
    UPDATE assessment_questions SET
      skill = 'reading',
      category = 'toeic_part_7',
      difficulty = 3,
      level = 'b2',
      prompt = 'What is suggested about Mr. Wright?',
      context_text = 'Questions 191-195
 refer to the following announcement, receipt, and e-mail.
825


## PDF 第 55 页

![PDF 第 55 页](images/read_page_55.png)



To: Carol Manning <carolm@fultoncounty.org>
From: Greg Stein <gstein@sigma.com>
Date: July 12
Subject: Fundraiser
_____________________________________________________________________
Dear Ms. Manning,
I attended the fundraiser yesterday just as I have been doing ever since I
moved to Fulton County from Pensacola ten years ago. I thoroughly enjoyed my
time at the event and made several purchases for myself and others. Unfortunately,
the desk which I bought has a problem. When I set it up at home, one of the legs
fell off. It can’t be reattached, so I can’t use it. I wonder if it would be possible to
826


## PDF 第 56 页

![PDF 第 56 页](images/read_page_56.png)



get my money refunded. I’ll be visiting the community center to attend my arts and
crafts class tomorrow, so perhaps I can have a chat with you in the afternoon.
Regards,
Greg Stein',
      audio_url = NULL,
      options = '[{"id":"A","text":"He received no money for working."},{"id":"B","text":"He purchased some toys."},{"id":"C","text":"He paid for the items with cash."},{"id":"D","text":"He enjoys reading books."}]'::jsonb
    WHERE id = v_question_id;
  END IF;

  -- Answer for #193
  DELETE FROM assessment_question_answers WHERE question_id = v_question_id;
  INSERT INTO assessment_question_answers (question_id, correct_option_id, explanation, transcript_text)
  VALUES (v_question_id, 'A', 'Đáp án đúng: A.

Phân tích bài đọc & dẫn chứng:
What is suggested about Mr. Wright?
(A) He received no money for working.
(B) He purchased some toys.
(C) He paid for the items with cash.
(D) He enjoys reading books.
关于赖特先生，文章暗示了什么？
(A)
他免费工作。
(B)
他买了一些玩具。
(C)
他用现金购买商品。
(D)
他喜欢读书。
→赖特先生是这次活动的收银员，而这次活动的所有工作人员都是志愿
者，即都是不赚钱的。故答案为(A)。', NULL);

  -- Question #194 (toeic_part_7)
  SELECT id INTO v_question_id FROM assessment_questions WHERE assessment_id = v_assessment_id AND position = 194;
  IF v_question_id IS NULL THEN
    INSERT INTO assessment_questions (assessment_id, skill, category, difficulty, level, question_type, prompt, context_text, audio_url, options, position, weight)
    VALUES (v_assessment_id, 'reading', 'toeic_part_7', 3, 'b2', 'multiple_choice', 'What does Mr. Stein indicate about last year’s fundraiser?', 'Questions 191-195
 refer to the following announcement, receipt, and e-mail.
825


## PDF 第 55 页

![PDF 第 55 页](images/read_page_55.png)



To: Carol Manning <carolm@fultoncounty.org>
From: Greg Stein <gstein@sigma.com>
Date: July 12
Subject: Fundraiser
_____________________________________________________________________
Dear Ms. Manning,
I attended the fundraiser yesterday just as I have been doing ever since I
moved to Fulton County from Pensacola ten years ago. I thoroughly enjoyed my
time at the event and made several purchases for myself and others. Unfortunately,
the desk which I bought has a problem. When I set it up at home, one of the legs
fell off. It can’t be reattached, so I can’t use it. I wonder if it would be possible to
826


## PDF 第 56 页

![PDF 第 56 页](images/read_page_56.png)



get my money refunded. I’ll be visiting the community center to attend my arts and
crafts class tomorrow, so perhaps I can have a chat with you in the afternoon.
Regards,
Greg Stein', NULL, '[{"id":"A","text":"It took place in the month of June."},{"id":"B","text":"He attended it."},{"id":"C","text":"It was canceled due to rain."},{"id":"D","text":"He was in Pensacola when it happened."}]'::jsonb, 194, 1.0)
    RETURNING id INTO v_question_id;
  ELSE
    UPDATE assessment_questions SET
      skill = 'reading',
      category = 'toeic_part_7',
      difficulty = 3,
      level = 'b2',
      prompt = 'What does Mr. Stein indicate about last year’s fundraiser?',
      context_text = 'Questions 191-195
 refer to the following announcement, receipt, and e-mail.
825


## PDF 第 55 页

![PDF 第 55 页](images/read_page_55.png)



To: Carol Manning <carolm@fultoncounty.org>
From: Greg Stein <gstein@sigma.com>
Date: July 12
Subject: Fundraiser
_____________________________________________________________________
Dear Ms. Manning,
I attended the fundraiser yesterday just as I have been doing ever since I
moved to Fulton County from Pensacola ten years ago. I thoroughly enjoyed my
time at the event and made several purchases for myself and others. Unfortunately,
the desk which I bought has a problem. When I set it up at home, one of the legs
fell off. It can’t be reattached, so I can’t use it. I wonder if it would be possible to
826


## PDF 第 56 页

![PDF 第 56 页](images/read_page_56.png)



get my money refunded. I’ll be visiting the community center to attend my arts and
crafts class tomorrow, so perhaps I can have a chat with you in the afternoon.
Regards,
Greg Stein',
      audio_url = NULL,
      options = '[{"id":"A","text":"It took place in the month of June."},{"id":"B","text":"He attended it."},{"id":"C","text":"It was canceled due to rain."},{"id":"D","text":"He was in Pensacola when it happened."}]'::jsonb
    WHERE id = v_question_id;
  END IF;

  -- Answer for #194
  DELETE FROM assessment_question_answers WHERE question_id = v_question_id;
  INSERT INTO assessment_question_answers (question_id, correct_option_id, explanation, transcript_text)
  VALUES (v_question_id, 'B', 'Đáp án đúng: B.

Phân tích bài đọc & dẫn chứng:
What does Mr. Stein indicate about last year’s fundraiser?
1286
```

## PDF 第 516 页

```text
(A) It took place in the month of June.
(B) He attended it.
(C) It was canceled due to rain.
(D) He was in Pensacola when it happened.
关于去年的资金募集活动，斯坦先生暗示了什么？
(A)
去年的资金募集活动是在
6
月进行的。
(B)
他参加了去年的资金募集活动。
(C)
去年的资金募集活动因为下雨取消了。
(D)
去年举办资金募集活动时，他在彭萨科拉。
→斯坦先生提到，“自从10年前从彭萨科拉搬到富尔顿县，我每年都参
加资金筹集活动。”故答案为(B)。', NULL);

  -- Question #195 (toeic_part_7)
  SELECT id INTO v_question_id FROM assessment_questions WHERE assessment_id = v_assessment_id AND position = 195;
  IF v_question_id IS NULL THEN
    INSERT INTO assessment_questions (assessment_id, skill, category, difficulty, level, question_type, prompt, context_text, audio_url, options, position, weight)
    VALUES (v_assessment_id, 'reading', 'toeic_part_7', 3, 'b2', 'multiple_choice', 'How will Ms. Manning most likely react to Mr. Stein’s request?', 'Questions 191-195
 refer to the following announcement, receipt, and e-mail.
825


## PDF 第 55 页

![PDF 第 55 页](images/read_page_55.png)



To: Carol Manning <carolm@fultoncounty.org>
From: Greg Stein <gstein@sigma.com>
Date: July 12
Subject: Fundraiser
_____________________________________________________________________
Dear Ms. Manning,
I attended the fundraiser yesterday just as I have been doing ever since I
moved to Fulton County from Pensacola ten years ago. I thoroughly enjoyed my
time at the event and made several purchases for myself and others. Unfortunately,
the desk which I bought has a problem. When I set it up at home, one of the legs
fell off. It can’t be reattached, so I can’t use it. I wonder if it would be possible to
826


## PDF 第 56 页

![PDF 第 56 页](images/read_page_56.png)



get my money refunded. I’ll be visiting the community center to attend my arts and
crafts class tomorrow, so perhaps I can have a chat with you in the afternoon.
Regards,
Greg Stein', NULL, '[{"id":"A","text":"By refusing to give him any money"},{"id":"B","text":"By giving him half of his money back"},{"id":"C","text":"By allowing him to exchange the item"},{"id":"D","text":"By letting him have all of the money he paid"}]'::jsonb, 195, 1.0)
    RETURNING id INTO v_question_id;
  ELSE
    UPDATE assessment_questions SET
      skill = 'reading',
      category = 'toeic_part_7',
      difficulty = 3,
      level = 'b2',
      prompt = 'How will Ms. Manning most likely react to Mr. Stein’s request?',
      context_text = 'Questions 191-195
 refer to the following announcement, receipt, and e-mail.
825


## PDF 第 55 页

![PDF 第 55 页](images/read_page_55.png)



To: Carol Manning <carolm@fultoncounty.org>
From: Greg Stein <gstein@sigma.com>
Date: July 12
Subject: Fundraiser
_____________________________________________________________________
Dear Ms. Manning,
I attended the fundraiser yesterday just as I have been doing ever since I
moved to Fulton County from Pensacola ten years ago. I thoroughly enjoyed my
time at the event and made several purchases for myself and others. Unfortunately,
the desk which I bought has a problem. When I set it up at home, one of the legs
fell off. It can’t be reattached, so I can’t use it. I wonder if it would be possible to
826


## PDF 第 56 页

![PDF 第 56 页](images/read_page_56.png)



get my money refunded. I’ll be visiting the community center to attend my arts and
crafts class tomorrow, so perhaps I can have a chat with you in the afternoon.
Regards,
Greg Stein',
      audio_url = NULL,
      options = '[{"id":"A","text":"By refusing to give him any money"},{"id":"B","text":"By giving him half of his money back"},{"id":"C","text":"By allowing him to exchange the item"},{"id":"D","text":"By letting him have all of the money he paid"}]'::jsonb
    WHERE id = v_question_id;
  END IF;

  -- Answer for #195
  DELETE FROM assessment_question_answers WHERE question_id = v_question_id;
  INSERT INTO assessment_question_answers (question_id, correct_option_id, explanation, transcript_text)
  VALUES (v_question_id, 'A', 'Đáp án đúng: A.

Phân tích bài đọc & dẫn chứng:
How will Ms. Manning most likely react to Mr. Stein’s request?
(A) By refusing to give him any money
(B) By giving him half of his money back
(C) By allowing him to exchange the item
(D) By letting him have all of the money he paid
曼宁女士将最有可能如何回应斯坦先生的请求？
(A)
拒绝给他退款
(B)
给他退一半的款
(C)
允许他调换商品
(D)
给他全额退款
→资金募集活动中的商品“一经售出，概不退换”，所以曼宁女士很有
可能不会给斯坦先生退款。故答案为(A)。
Questions 196-200
 refer to the following memo and e-mails.
1287
```

## PDF 第 517 页

```text
收件人：全体员工
发件人：丹妮尔
·
贾维斯
日期：
4
月
11
日
主题：休假
请注意，公司对于有关休假的政策做了一些调整。以下规定即刻生
效：
●
口头请假无效。休假须填写休假申请单，并提交给直接上级。休假
申请单可以从二楼的人力资源部获取。
●
休假申请须提前至少
10
天提交。因生病或家庭原因不能提前申请的
情况除外。
●
如连续休假
7
天以上，休假申请单上须说明请假人不在岗期间的详
细工作安排。
●
所有主管须在收到休假申请的
24
小时内给出答复，周五提交的除
外。周五提交的休假申请须在下个周一的中午之前给出答复。
收件人：雷吉娜
·
保罗
 <rpaul@vanderhouse.com>
发件人：克拉丽斯
·
瓦利恩特
 <cvaliant@vanderhouse.com>
主题：七月旅行
日期：
7
月
2
日，星期一
附件：人力资源部表格
190
亲爱的保罗女士：
又到了我和家人每年一次的夏季旅行时间了。今年，我们计划
7
月
15
日到
7
月
25
日期间去我的家乡旅行。我们这个大家庭里几乎所有人都会在
期间某个时候出现，因此如果你能批准我的休假请求就太好了。附件中是
我的休假申请单，我今天从人力资源部领取的。我将其扫描到了电脑里，
因为我知道你今天一天都不在办公室。
1288
```

## PDF 第 518 页

```text
另外，我想让你知道马可尼项目的工作进展顺利。我要求法院提供的
文件均已收到，目前我正在翻阅。如果我发现什么值得关注的事情，我会
立即通知你的。
祝好！
克拉丽斯
·
瓦利恩特
收件人：克拉丽斯
·
瓦利恩特
 <cvaliant@vanderhouse.com>
发件人：雷吉娜
·
保罗
 <rpaul@vanderhouse.com>
主题：答复：七月旅行
日期：
7
月
5
日，星期四
克拉丽斯：
我收到了你的邮件和你上传的休假申请单。遗憾的是，你在邮件中没
有写明在你休假期间由谁来接替你的工作。因此，我必须拒绝你的休假请
求。不过，如果你能在今天提供给我一个书面计划，我愿意重新考虑我的
答复。
真诚的，
雷吉娜
·
保罗
▼ Vocabulary Check
staff
员工
 revision
修订
 regarding
关于
 time off
休假
 immediately
立刻，
马上
 orally
口头上地
 form
表格
 fill out
填写
 submit
提交
 immediate supervisor
直接上级，直接领导
 obtain
获得
 department
部门
 in advance
提前
consecutive
连续的
 carry out
执行，完成
 extended family
大家庭
 attach
附上
scan
扫描
 courthouse
法院
 currently
目前
 look over
翻阅
 upload
上传
 normally
通常地
 decline
婉拒
 written plan
书面计划
 reconsider
重新考虑', NULL);

  -- Question #196 (toeic_part_7)
  SELECT id INTO v_question_id FROM assessment_questions WHERE assessment_id = v_assessment_id AND position = 196;
  IF v_question_id IS NULL THEN
    INSERT INTO assessment_questions (assessment_id, skill, category, difficulty, level, question_type, prompt, context_text, audio_url, options, position, weight)
    VALUES (v_assessment_id, 'reading', 'toeic_part_7', 3, 'b2', 'multiple_choice', 'According to the memo, what is NOT true about the company’s new official policy?', 'Questions 196 -200
 refer to the following.
To: All Staff Members
From: Danielle Jarvis
Date: April 11
Subject: Vacation
Please be advised that some revisions to the company’s official policy
regarding requesting time off have been made. The following are effective
immediately:
*Requests may no longer be made orally. Instead, a vacation request form
must be filled out and submitted to your immediate supervisor. Forms may be
obtained from the HR Department on the second floor.
*Requests for time off must be made at least ten days in advance. The only
exceptions that will be permitted are those for medical or family reasons.
*Requests for more than seven consecutive days off must include a detailed
plan explaining how the employee’s duties will be carried out while that person
is away.
*All supervisors who receive requests must respond within 24 hours except
for those requests made on a Friday. They must be answered by noon the
following Monday.
828


## PDF 第 58 页

![PDF 第 58 页](images/read_page_58.png)



To: Regina Paul <rpaul@vanderhouse.com>
From: Clarice Valiant <cvaliant@vanderhouse.com>
Subject: July Trip
Date: Monday, July 2
Attachment: HR_Form_190
_____________________________________________________________________
Dear Ms. Paul,
It’s time for my family to take our annual summer trip. This year, we are
planning to be in my hometown from July 15 to 25. Almost everyone in my
extended family intends to show up at some point, so it would be great if you saw
fit to approve my request for time off. I have attached the request form I picked up
from HR today. I scanned it onto my computer since I know you’re out of the
office all day.
In addition, I thought I’d let you know the work on the Marconi project is
going well. I received the files I requested from the courthouse, so I’m currently
looking over them. If I find anything of interest, I shall inform you at once.
Regards,
Clarice Valiant
To: Clarice Valiant <cvaliant@vanderhouse.com>
From: Regina Paul <rpaul@vanderhouse.com>
Subject: Re: July Trip
Date: Thursday, July 5
Clarice,
I received your e-mail and the form you uploaded. Unfortunately, you failed
to include any information regarding who will take care of the work you normally
do while you’re away. As a result, I must decline your request for time off.
However, if you can provide me with a written plan before the day is over, I will
829


## PDF 第 59 页

![PDF 第 59 页](images/read_page_59.png)



be open to reconsidering my response.
Sincerely,
Regina Paul', NULL, '[{"id":"A","text":"Employees need to make requests on paper."},{"id":"B","text":"Employees cannot take more than one consecutive week off."},{"id":"C","text":"Employees should get answers to their requests within a day."},{"id":"D","text":"Employees must make requests ten days before going on vacation."}]'::jsonb, 196, 1.0)
    RETURNING id INTO v_question_id;
  ELSE
    UPDATE assessment_questions SET
      skill = 'reading',
      category = 'toeic_part_7',
      difficulty = 3,
      level = 'b2',
      prompt = 'According to the memo, what is NOT true about the company’s new official policy?',
      context_text = 'Questions 196 -200
 refer to the following.
To: All Staff Members
From: Danielle Jarvis
Date: April 11
Subject: Vacation
Please be advised that some revisions to the company’s official policy
regarding requesting time off have been made. The following are effective
immediately:
*Requests may no longer be made orally. Instead, a vacation request form
must be filled out and submitted to your immediate supervisor. Forms may be
obtained from the HR Department on the second floor.
*Requests for time off must be made at least ten days in advance. The only
exceptions that will be permitted are those for medical or family reasons.
*Requests for more than seven consecutive days off must include a detailed
plan explaining how the employee’s duties will be carried out while that person
is away.
*All supervisors who receive requests must respond within 24 hours except
for those requests made on a Friday. They must be answered by noon the
following Monday.
828


## PDF 第 58 页

![PDF 第 58 页](images/read_page_58.png)



To: Regina Paul <rpaul@vanderhouse.com>
From: Clarice Valiant <cvaliant@vanderhouse.com>
Subject: July Trip
Date: Monday, July 2
Attachment: HR_Form_190
_____________________________________________________________________
Dear Ms. Paul,
It’s time for my family to take our annual summer trip. This year, we are
planning to be in my hometown from July 15 to 25. Almost everyone in my
extended family intends to show up at some point, so it would be great if you saw
fit to approve my request for time off. I have attached the request form I picked up
from HR today. I scanned it onto my computer since I know you’re out of the
office all day.
In addition, I thought I’d let you know the work on the Marconi project is
going well. I received the files I requested from the courthouse, so I’m currently
looking over them. If I find anything of interest, I shall inform you at once.
Regards,
Clarice Valiant
To: Clarice Valiant <cvaliant@vanderhouse.com>
From: Regina Paul <rpaul@vanderhouse.com>
Subject: Re: July Trip
Date: Thursday, July 5
Clarice,
I received your e-mail and the form you uploaded. Unfortunately, you failed
to include any information regarding who will take care of the work you normally
do while you’re away. As a result, I must decline your request for time off.
However, if you can provide me with a written plan before the day is over, I will
829


## PDF 第 59 页

![PDF 第 59 页](images/read_page_59.png)



be open to reconsidering my response.
Sincerely,
Regina Paul',
      audio_url = NULL,
      options = '[{"id":"A","text":"Employees need to make requests on paper."},{"id":"B","text":"Employees cannot take more than one consecutive week off."},{"id":"C","text":"Employees should get answers to their requests within a day."},{"id":"D","text":"Employees must make requests ten days before going on vacation."}]'::jsonb
    WHERE id = v_question_id;
  END IF;

  -- Answer for #196
  DELETE FROM assessment_question_answers WHERE question_id = v_question_id;
  INSERT INTO assessment_question_answers (question_id, correct_option_id, explanation, transcript_text)
  VALUES (v_question_id, 'B', 'Đáp án đúng: B.

Phân tích bài đọc & dẫn chứng:
According to the memo, what is NOT true about the company’s new official
1289
```

## PDF 第 519 页

```text
policy?
(A) Employees need to make requests on paper.
(B) Employees cannot take more than one consecutive week off.
(C) Employees should get answers to their requests within a day.
(D) Employees must make requests ten days before going on vacation.
根据备忘录，关于公司的新政策，下列哪项是不正确的？
(A)
员工需要以书面形式请假。
(B)
员工请假不能超过连续一周。
(C)
员工应在一天内得到假期申请的答复。
(D)
员工必须提前
10
天申请休假。
→备忘录中说如连续休假7天以上，休假申请单上须说明请假人不在岗
期间的详细工作安排。而不是说不能请假超过一周，故答案为(B)。', NULL);

  -- Question #197 (toeic_part_7)
  SELECT id INTO v_question_id FROM assessment_questions WHERE assessment_id = v_assessment_id AND position = 197;
  IF v_question_id IS NULL THEN
    INSERT INTO assessment_questions (assessment_id, skill, category, difficulty, level, question_type, prompt, context_text, audio_url, options, position, weight)
    VALUES (v_assessment_id, 'reading', 'toeic_part_7', 3, 'b2', 'multiple_choice', 'Why did Ms. Valiant request time off?', 'Questions 196 -200
 refer to the following.
To: All Staff Members
From: Danielle Jarvis
Date: April 11
Subject: Vacation
Please be advised that some revisions to the company’s official policy
regarding requesting time off have been made. The following are effective
immediately:
*Requests may no longer be made orally. Instead, a vacation request form
must be filled out and submitted to your immediate supervisor. Forms may be
obtained from the HR Department on the second floor.
*Requests for time off must be made at least ten days in advance. The only
exceptions that will be permitted are those for medical or family reasons.
*Requests for more than seven consecutive days off must include a detailed
plan explaining how the employee’s duties will be carried out while that person
is away.
*All supervisors who receive requests must respond within 24 hours except
for those requests made on a Friday. They must be answered by noon the
following Monday.
828


## PDF 第 58 页

![PDF 第 58 页](images/read_page_58.png)



To: Regina Paul <rpaul@vanderhouse.com>
From: Clarice Valiant <cvaliant@vanderhouse.com>
Subject: July Trip
Date: Monday, July 2
Attachment: HR_Form_190
_____________________________________________________________________
Dear Ms. Paul,
It’s time for my family to take our annual summer trip. This year, we are
planning to be in my hometown from July 15 to 25. Almost everyone in my
extended family intends to show up at some point, so it would be great if you saw
fit to approve my request for time off. I have attached the request form I picked up
from HR today. I scanned it onto my computer since I know you’re out of the
office all day.
In addition, I thought I’d let you know the work on the Marconi project is
going well. I received the files I requested from the courthouse, so I’m currently
looking over them. If I find anything of interest, I shall inform you at once.
Regards,
Clarice Valiant
To: Clarice Valiant <cvaliant@vanderhouse.com>
From: Regina Paul <rpaul@vanderhouse.com>
Subject: Re: July Trip
Date: Thursday, July 5
Clarice,
I received your e-mail and the form you uploaded. Unfortunately, you failed
to include any information regarding who will take care of the work you normally
do while you’re away. As a result, I must decline your request for time off.
However, if you can provide me with a written plan before the day is over, I will
829


## PDF 第 59 页

![PDF 第 59 页](images/read_page_59.png)



be open to reconsidering my response.
Sincerely,
Regina Paul', NULL, '[{"id":"A","text":"She plans to attend a family wedding."},{"id":"B","text":"She is taking a trip abroad."},{"id":"C","text":"She would like to visit the beach."},{"id":"D","text":"She wants to see her relatives."}]'::jsonb, 197, 1.0)
    RETURNING id INTO v_question_id;
  ELSE
    UPDATE assessment_questions SET
      skill = 'reading',
      category = 'toeic_part_7',
      difficulty = 3,
      level = 'b2',
      prompt = 'Why did Ms. Valiant request time off?',
      context_text = 'Questions 196 -200
 refer to the following.
To: All Staff Members
From: Danielle Jarvis
Date: April 11
Subject: Vacation
Please be advised that some revisions to the company’s official policy
regarding requesting time off have been made. The following are effective
immediately:
*Requests may no longer be made orally. Instead, a vacation request form
must be filled out and submitted to your immediate supervisor. Forms may be
obtained from the HR Department on the second floor.
*Requests for time off must be made at least ten days in advance. The only
exceptions that will be permitted are those for medical or family reasons.
*Requests for more than seven consecutive days off must include a detailed
plan explaining how the employee’s duties will be carried out while that person
is away.
*All supervisors who receive requests must respond within 24 hours except
for those requests made on a Friday. They must be answered by noon the
following Monday.
828


## PDF 第 58 页

![PDF 第 58 页](images/read_page_58.png)



To: Regina Paul <rpaul@vanderhouse.com>
From: Clarice Valiant <cvaliant@vanderhouse.com>
Subject: July Trip
Date: Monday, July 2
Attachment: HR_Form_190
_____________________________________________________________________
Dear Ms. Paul,
It’s time for my family to take our annual summer trip. This year, we are
planning to be in my hometown from July 15 to 25. Almost everyone in my
extended family intends to show up at some point, so it would be great if you saw
fit to approve my request for time off. I have attached the request form I picked up
from HR today. I scanned it onto my computer since I know you’re out of the
office all day.
In addition, I thought I’d let you know the work on the Marconi project is
going well. I received the files I requested from the courthouse, so I’m currently
looking over them. If I find anything of interest, I shall inform you at once.
Regards,
Clarice Valiant
To: Clarice Valiant <cvaliant@vanderhouse.com>
From: Regina Paul <rpaul@vanderhouse.com>
Subject: Re: July Trip
Date: Thursday, July 5
Clarice,
I received your e-mail and the form you uploaded. Unfortunately, you failed
to include any information regarding who will take care of the work you normally
do while you’re away. As a result, I must decline your request for time off.
However, if you can provide me with a written plan before the day is over, I will
829


## PDF 第 59 页

![PDF 第 59 页](images/read_page_59.png)



be open to reconsidering my response.
Sincerely,
Regina Paul',
      audio_url = NULL,
      options = '[{"id":"A","text":"She plans to attend a family wedding."},{"id":"B","text":"She is taking a trip abroad."},{"id":"C","text":"She would like to visit the beach."},{"id":"D","text":"She wants to see her relatives."}]'::jsonb
    WHERE id = v_question_id;
  END IF;

  -- Answer for #197
  DELETE FROM assessment_question_answers WHERE question_id = v_question_id;
  INSERT INTO assessment_question_answers (question_id, correct_option_id, explanation, transcript_text)
  VALUES (v_question_id, 'D', 'Đáp án đúng: D.

Phân tích bài đọc & dẫn chứng:
Why did Ms. Valiant request time off?
(A) She plans to attend a family wedding.
(B) She is taking a trip abroad.
(C) She would like to visit the beach.
(D) She wants to see her relatives.
瓦利恩特女士为什么要休假？
(A)
她计划参加一场家人的婚礼。
(B)
她要出国旅行。
(C)
她想去海滩。
(D)
她想见亲戚。
→瓦利恩特女士在邮件中提到“我们这个大家庭里几乎所有人都会在期
间某个时候出现”，由此可知，她休假是想要见亲戚。故答案为(D)。
1290
```

## PDF 第 520 页

```text', NULL);

  -- Question #198 (toeic_part_7)
  SELECT id INTO v_question_id FROM assessment_questions WHERE assessment_id = v_assessment_id AND position = 198;
  IF v_question_id IS NULL THEN
    INSERT INTO assessment_questions (assessment_id, skill, category, difficulty, level, question_type, prompt, context_text, audio_url, options, position, weight)
    VALUES (v_assessment_id, 'reading', 'toeic_part_7', 3, 'b2', 'multiple_choice', 'What did Ms. Valiant most likely do on July 2?', 'Questions 196 -200
 refer to the following.
To: All Staff Members
From: Danielle Jarvis
Date: April 11
Subject: Vacation
Please be advised that some revisions to the company’s official policy
regarding requesting time off have been made. The following are effective
immediately:
*Requests may no longer be made orally. Instead, a vacation request form
must be filled out and submitted to your immediate supervisor. Forms may be
obtained from the HR Department on the second floor.
*Requests for time off must be made at least ten days in advance. The only
exceptions that will be permitted are those for medical or family reasons.
*Requests for more than seven consecutive days off must include a detailed
plan explaining how the employee’s duties will be carried out while that person
is away.
*All supervisors who receive requests must respond within 24 hours except
for those requests made on a Friday. They must be answered by noon the
following Monday.
828


## PDF 第 58 页

![PDF 第 58 页](images/read_page_58.png)



To: Regina Paul <rpaul@vanderhouse.com>
From: Clarice Valiant <cvaliant@vanderhouse.com>
Subject: July Trip
Date: Monday, July 2
Attachment: HR_Form_190
_____________________________________________________________________
Dear Ms. Paul,
It’s time for my family to take our annual summer trip. This year, we are
planning to be in my hometown from July 15 to 25. Almost everyone in my
extended family intends to show up at some point, so it would be great if you saw
fit to approve my request for time off. I have attached the request form I picked up
from HR today. I scanned it onto my computer since I know you’re out of the
office all day.
In addition, I thought I’d let you know the work on the Marconi project is
going well. I received the files I requested from the courthouse, so I’m currently
looking over them. If I find anything of interest, I shall inform you at once.
Regards,
Clarice Valiant
To: Clarice Valiant <cvaliant@vanderhouse.com>
From: Regina Paul <rpaul@vanderhouse.com>
Subject: Re: July Trip
Date: Thursday, July 5
Clarice,
I received your e-mail and the form you uploaded. Unfortunately, you failed
to include any information regarding who will take care of the work you normally
do while you’re away. As a result, I must decline your request for time off.
However, if you can provide me with a written plan before the day is over, I will
829


## PDF 第 59 页

![PDF 第 59 页](images/read_page_59.png)



be open to reconsidering my response.
Sincerely,
Regina Paul', NULL, '[{"id":"A","text":"Went to the courthouse"},{"id":"B","text":"Visited the second floor"},{"id":"C","text":"Met Mr. Marconi"},{"id":"D","text":"Reserved some plane tickets"}]'::jsonb, 198, 1.0)
    RETURNING id INTO v_question_id;
  ELSE
    UPDATE assessment_questions SET
      skill = 'reading',
      category = 'toeic_part_7',
      difficulty = 3,
      level = 'b2',
      prompt = 'What did Ms. Valiant most likely do on July 2?',
      context_text = 'Questions 196 -200
 refer to the following.
To: All Staff Members
From: Danielle Jarvis
Date: April 11
Subject: Vacation
Please be advised that some revisions to the company’s official policy
regarding requesting time off have been made. The following are effective
immediately:
*Requests may no longer be made orally. Instead, a vacation request form
must be filled out and submitted to your immediate supervisor. Forms may be
obtained from the HR Department on the second floor.
*Requests for time off must be made at least ten days in advance. The only
exceptions that will be permitted are those for medical or family reasons.
*Requests for more than seven consecutive days off must include a detailed
plan explaining how the employee’s duties will be carried out while that person
is away.
*All supervisors who receive requests must respond within 24 hours except
for those requests made on a Friday. They must be answered by noon the
following Monday.
828


## PDF 第 58 页

![PDF 第 58 页](images/read_page_58.png)



To: Regina Paul <rpaul@vanderhouse.com>
From: Clarice Valiant <cvaliant@vanderhouse.com>
Subject: July Trip
Date: Monday, July 2
Attachment: HR_Form_190
_____________________________________________________________________
Dear Ms. Paul,
It’s time for my family to take our annual summer trip. This year, we are
planning to be in my hometown from July 15 to 25. Almost everyone in my
extended family intends to show up at some point, so it would be great if you saw
fit to approve my request for time off. I have attached the request form I picked up
from HR today. I scanned it onto my computer since I know you’re out of the
office all day.
In addition, I thought I’d let you know the work on the Marconi project is
going well. I received the files I requested from the courthouse, so I’m currently
looking over them. If I find anything of interest, I shall inform you at once.
Regards,
Clarice Valiant
To: Clarice Valiant <cvaliant@vanderhouse.com>
From: Regina Paul <rpaul@vanderhouse.com>
Subject: Re: July Trip
Date: Thursday, July 5
Clarice,
I received your e-mail and the form you uploaded. Unfortunately, you failed
to include any information regarding who will take care of the work you normally
do while you’re away. As a result, I must decline your request for time off.
However, if you can provide me with a written plan before the day is over, I will
829


## PDF 第 59 页

![PDF 第 59 页](images/read_page_59.png)



be open to reconsidering my response.
Sincerely,
Regina Paul',
      audio_url = NULL,
      options = '[{"id":"A","text":"Went to the courthouse"},{"id":"B","text":"Visited the second floor"},{"id":"C","text":"Met Mr. Marconi"},{"id":"D","text":"Reserved some plane tickets"}]'::jsonb
    WHERE id = v_question_id;
  END IF;

  -- Answer for #198
  DELETE FROM assessment_question_answers WHERE question_id = v_question_id;
  INSERT INTO assessment_question_answers (question_id, correct_option_id, explanation, transcript_text)
  VALUES (v_question_id, 'B', 'Đáp án đúng: B.

Phân tích bài đọc & dẫn chứng:
What did Ms. Valiant most likely do on July 2?
(A) Went to the courthouse
(B) Visited the second floor
(C) Met Mr. Marconi
(D) Reserved some plane tickets
瓦利恩特女士
7
月
2
日最有可能做了什么？
(A)
去了法院
(B)
去了二楼
(C)
见了马可尼先生
(D)
订了几张飞机票
→瓦利恩特女士是在7月2日发的邮件，其中提到，“附件中是我的休假
申请单，我今天从人力资源部领取的”，而人力资源部在二楼。故答案为
(B)。', NULL);

  -- Question #199 (toeic_part_7)
  SELECT id INTO v_question_id FROM assessment_questions WHERE assessment_id = v_assessment_id AND position = 199;
  IF v_question_id IS NULL THEN
    INSERT INTO assessment_questions (assessment_id, skill, category, difficulty, level, question_type, prompt, context_text, audio_url, options, position, weight)
    VALUES (v_assessment_id, 'reading', 'toeic_part_7', 3, 'b2', 'multiple_choice', 'What is indicated about Ms. Paul?', 'Questions 196 -200
 refer to the following.
To: All Staff Members
From: Danielle Jarvis
Date: April 11
Subject: Vacation
Please be advised that some revisions to the company’s official policy
regarding requesting time off have been made. The following are effective
immediately:
*Requests may no longer be made orally. Instead, a vacation request form
must be filled out and submitted to your immediate supervisor. Forms may be
obtained from the HR Department on the second floor.
*Requests for time off must be made at least ten days in advance. The only
exceptions that will be permitted are those for medical or family reasons.
*Requests for more than seven consecutive days off must include a detailed
plan explaining how the employee’s duties will be carried out while that person
is away.
*All supervisors who receive requests must respond within 24 hours except
for those requests made on a Friday. They must be answered by noon the
following Monday.
828


## PDF 第 58 页

![PDF 第 58 页](images/read_page_58.png)



To: Regina Paul <rpaul@vanderhouse.com>
From: Clarice Valiant <cvaliant@vanderhouse.com>
Subject: July Trip
Date: Monday, July 2
Attachment: HR_Form_190
_____________________________________________________________________
Dear Ms. Paul,
It’s time for my family to take our annual summer trip. This year, we are
planning to be in my hometown from July 15 to 25. Almost everyone in my
extended family intends to show up at some point, so it would be great if you saw
fit to approve my request for time off. I have attached the request form I picked up
from HR today. I scanned it onto my computer since I know you’re out of the
office all day.
In addition, I thought I’d let you know the work on the Marconi project is
going well. I received the files I requested from the courthouse, so I’m currently
looking over them. If I find anything of interest, I shall inform you at once.
Regards,
Clarice Valiant
To: Clarice Valiant <cvaliant@vanderhouse.com>
From: Regina Paul <rpaul@vanderhouse.com>
Subject: Re: July Trip
Date: Thursday, July 5
Clarice,
I received your e-mail and the form you uploaded. Unfortunately, you failed
to include any information regarding who will take care of the work you normally
do while you’re away. As a result, I must decline your request for time off.
However, if you can provide me with a written plan before the day is over, I will
829


## PDF 第 59 页

![PDF 第 59 页](images/read_page_59.png)



be open to reconsidering my response.
Sincerely,
Regina Paul', NULL, '[{"id":"A","text":"She works in the Human Resources Department."},{"id":"B","text":"She spends most of her time at the courthouse."},{"id":"C","text":"She failed to follow the company’s new policy."},{"id":"D","text":"She is employed as a lawyer at her company."}]'::jsonb, 199, 1.0)
    RETURNING id INTO v_question_id;
  ELSE
    UPDATE assessment_questions SET
      skill = 'reading',
      category = 'toeic_part_7',
      difficulty = 3,
      level = 'b2',
      prompt = 'What is indicated about Ms. Paul?',
      context_text = 'Questions 196 -200
 refer to the following.
To: All Staff Members
From: Danielle Jarvis
Date: April 11
Subject: Vacation
Please be advised that some revisions to the company’s official policy
regarding requesting time off have been made. The following are effective
immediately:
*Requests may no longer be made orally. Instead, a vacation request form
must be filled out and submitted to your immediate supervisor. Forms may be
obtained from the HR Department on the second floor.
*Requests for time off must be made at least ten days in advance. The only
exceptions that will be permitted are those for medical or family reasons.
*Requests for more than seven consecutive days off must include a detailed
plan explaining how the employee’s duties will be carried out while that person
is away.
*All supervisors who receive requests must respond within 24 hours except
for those requests made on a Friday. They must be answered by noon the
following Monday.
828


## PDF 第 58 页

![PDF 第 58 页](images/read_page_58.png)



To: Regina Paul <rpaul@vanderhouse.com>
From: Clarice Valiant <cvaliant@vanderhouse.com>
Subject: July Trip
Date: Monday, July 2
Attachment: HR_Form_190
_____________________________________________________________________
Dear Ms. Paul,
It’s time for my family to take our annual summer trip. This year, we are
planning to be in my hometown from July 15 to 25. Almost everyone in my
extended family intends to show up at some point, so it would be great if you saw
fit to approve my request for time off. I have attached the request form I picked up
from HR today. I scanned it onto my computer since I know you’re out of the
office all day.
In addition, I thought I’d let you know the work on the Marconi project is
going well. I received the files I requested from the courthouse, so I’m currently
looking over them. If I find anything of interest, I shall inform you at once.
Regards,
Clarice Valiant
To: Clarice Valiant <cvaliant@vanderhouse.com>
From: Regina Paul <rpaul@vanderhouse.com>
Subject: Re: July Trip
Date: Thursday, July 5
Clarice,
I received your e-mail and the form you uploaded. Unfortunately, you failed
to include any information regarding who will take care of the work you normally
do while you’re away. As a result, I must decline your request for time off.
However, if you can provide me with a written plan before the day is over, I will
829


## PDF 第 59 页

![PDF 第 59 页](images/read_page_59.png)



be open to reconsidering my response.
Sincerely,
Regina Paul',
      audio_url = NULL,
      options = '[{"id":"A","text":"She works in the Human Resources Department."},{"id":"B","text":"She spends most of her time at the courthouse."},{"id":"C","text":"She failed to follow the company’s new policy."},{"id":"D","text":"She is employed as a lawyer at her company."}]'::jsonb
    WHERE id = v_question_id;
  END IF;

  -- Answer for #199
  DELETE FROM assessment_question_answers WHERE question_id = v_question_id;
  INSERT INTO assessment_question_answers (question_id, correct_option_id, explanation, transcript_text)
  VALUES (v_question_id, 'C', 'Đáp án đúng: C.

Phân tích bài đọc & dẫn chứng:
What is indicated about Ms. Paul?
(A) She works in the Human Resources Department.
(B) She spends most of her time at the courthouse.
(C) She failed to follow the company’s new policy.
(D) She is employed as a lawyer at her company.
关于保罗女士，文章暗示了什么？
(A)
她在人力资源部工作。
(B)
她大多数时间都在法院。
(C)
她没有遵守公司的新政策。
(D)
她是公司的律师。
→公司规定，所有主管须在收到休假申请的24小时内给出答复，周五提
1291
```

## PDF 第 521 页

```text
交的休假申请须在下个周一的中午之前给出答复。保罗女士周一收到克拉丽
斯·瓦利恩特的休假申请，周四才给予回复，由此可知，她没有遵守公司的
新规定。故答案为(C)。', NULL);

  -- Question #200 (toeic_part_7)
  SELECT id INTO v_question_id FROM assessment_questions WHERE assessment_id = v_assessment_id AND position = 200;
  IF v_question_id IS NULL THEN
    INSERT INTO assessment_questions (assessment_id, skill, category, difficulty, level, question_type, prompt, context_text, audio_url, options, position, weight)
    VALUES (v_assessment_id, 'reading', 'toeic_part_7', 3, 'b2', 'multiple_choice', 'What does Ms. Paul suggest in the second e-mail?', 'Questions 196 -200
 refer to the following.
To: All Staff Members
From: Danielle Jarvis
Date: April 11
Subject: Vacation
Please be advised that some revisions to the company’s official policy
regarding requesting time off have been made. The following are effective
immediately:
*Requests may no longer be made orally. Instead, a vacation request form
must be filled out and submitted to your immediate supervisor. Forms may be
obtained from the HR Department on the second floor.
*Requests for time off must be made at least ten days in advance. The only
exceptions that will be permitted are those for medical or family reasons.
*Requests for more than seven consecutive days off must include a detailed
plan explaining how the employee’s duties will be carried out while that person
is away.
*All supervisors who receive requests must respond within 24 hours except
for those requests made on a Friday. They must be answered by noon the
following Monday.
828


## PDF 第 58 页

![PDF 第 58 页](images/read_page_58.png)



To: Regina Paul <rpaul@vanderhouse.com>
From: Clarice Valiant <cvaliant@vanderhouse.com>
Subject: July Trip
Date: Monday, July 2
Attachment: HR_Form_190
_____________________________________________________________________
Dear Ms. Paul,
It’s time for my family to take our annual summer trip. This year, we are
planning to be in my hometown from July 15 to 25. Almost everyone in my
extended family intends to show up at some point, so it would be great if you saw
fit to approve my request for time off. I have attached the request form I picked up
from HR today. I scanned it onto my computer since I know you’re out of the
office all day.
In addition, I thought I’d let you know the work on the Marconi project is
going well. I received the files I requested from the courthouse, so I’m currently
looking over them. If I find anything of interest, I shall inform you at once.
Regards,
Clarice Valiant
To: Clarice Valiant <cvaliant@vanderhouse.com>
From: Regina Paul <rpaul@vanderhouse.com>
Subject: Re: July Trip
Date: Thursday, July 5
Clarice,
I received your e-mail and the form you uploaded. Unfortunately, you failed
to include any information regarding who will take care of the work you normally
do while you’re away. As a result, I must decline your request for time off.
However, if you can provide me with a written plan before the day is over, I will
829


## PDF 第 59 页

![PDF 第 59 页](images/read_page_59.png)



be open to reconsidering my response.
Sincerely,
Regina Paul', NULL, '[{"id":"A","text":"Ms. Valiant should resubmit her request."},{"id":"B","text":"She was out of the country on business."},{"id":"C","text":"Ms. Valiant left some parts of the form blank."},{"id":"D","text":"She plans to take time off in late July."}]'::jsonb, 200, 1.0)
    RETURNING id INTO v_question_id;
  ELSE
    UPDATE assessment_questions SET
      skill = 'reading',
      category = 'toeic_part_7',
      difficulty = 3,
      level = 'b2',
      prompt = 'What does Ms. Paul suggest in the second e-mail?',
      context_text = 'Questions 196 -200
 refer to the following.
To: All Staff Members
From: Danielle Jarvis
Date: April 11
Subject: Vacation
Please be advised that some revisions to the company’s official policy
regarding requesting time off have been made. The following are effective
immediately:
*Requests may no longer be made orally. Instead, a vacation request form
must be filled out and submitted to your immediate supervisor. Forms may be
obtained from the HR Department on the second floor.
*Requests for time off must be made at least ten days in advance. The only
exceptions that will be permitted are those for medical or family reasons.
*Requests for more than seven consecutive days off must include a detailed
plan explaining how the employee’s duties will be carried out while that person
is away.
*All supervisors who receive requests must respond within 24 hours except
for those requests made on a Friday. They must be answered by noon the
following Monday.
828


## PDF 第 58 页

![PDF 第 58 页](images/read_page_58.png)



To: Regina Paul <rpaul@vanderhouse.com>
From: Clarice Valiant <cvaliant@vanderhouse.com>
Subject: July Trip
Date: Monday, July 2
Attachment: HR_Form_190
_____________________________________________________________________
Dear Ms. Paul,
It’s time for my family to take our annual summer trip. This year, we are
planning to be in my hometown from July 15 to 25. Almost everyone in my
extended family intends to show up at some point, so it would be great if you saw
fit to approve my request for time off. I have attached the request form I picked up
from HR today. I scanned it onto my computer since I know you’re out of the
office all day.
In addition, I thought I’d let you know the work on the Marconi project is
going well. I received the files I requested from the courthouse, so I’m currently
looking over them. If I find anything of interest, I shall inform you at once.
Regards,
Clarice Valiant
To: Clarice Valiant <cvaliant@vanderhouse.com>
From: Regina Paul <rpaul@vanderhouse.com>
Subject: Re: July Trip
Date: Thursday, July 5
Clarice,
I received your e-mail and the form you uploaded. Unfortunately, you failed
to include any information regarding who will take care of the work you normally
do while you’re away. As a result, I must decline your request for time off.
However, if you can provide me with a written plan before the day is over, I will
829


## PDF 第 59 页

![PDF 第 59 页](images/read_page_59.png)



be open to reconsidering my response.
Sincerely,
Regina Paul',
      audio_url = NULL,
      options = '[{"id":"A","text":"Ms. Valiant should resubmit her request."},{"id":"B","text":"She was out of the country on business."},{"id":"C","text":"Ms. Valiant left some parts of the form blank."},{"id":"D","text":"She plans to take time off in late July."}]'::jsonb
    WHERE id = v_question_id;
  END IF;

  -- Answer for #200
  DELETE FROM assessment_question_answers WHERE question_id = v_question_id;
  INSERT INTO assessment_question_answers (question_id, correct_option_id, explanation, transcript_text)
  VALUES (v_question_id, 'A', 'Đáp án đúng: A.

Phân tích bài đọc & dẫn chứng:
What does Ms. Paul suggest in the second e-mail?
(A) Ms. Valiant should resubmit her request.
(B) She was out of the country on business.
(C) Ms. Valiant left some parts of the form blank.
(D) She plans to take time off in late July.
在第二封电子邮件中，保罗女士暗示了什么？
(A)
瓦利恩特女士应该重新提交申请。
(B)
她因公外出，不在国内。
(C)
瓦利恩特女士的休假申请表有一些地方没填。
(D)
她计划
7
月底休假。
→保罗女士拒绝了瓦利恩特的休假申请，因为瓦利恩特在邮件中没有写
明在她休假期间由谁来接替她的工作。所以瓦利恩特应该重新提交申请。故
答案选(A)。
Answer Sheet
Test 01
1292
```

## PDF 第 522 页

```text
1293
```', NULL);

END $$;