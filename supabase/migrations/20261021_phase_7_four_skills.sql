-- ==============================================================================
-- Migration: Phase 7 — Four Skills Implementation (Listening, Reading, Writing, Speaking)
-- Version: 20261021_phase_7_four_skills
-- Description:
--   1. Updates check constraint on `public.content_items` to include 'writing' and 'speaking'.
--   2. Seeds authentic foundational content items for Reading, Writing, and Speaking:
--      - Reading: `reading-workplace-announcements-messages` (A1 / Business & Team Memo)
--      - Writing: `writing-introductory-email` (A1 / Self-Introduction & Routine)
--      - Speaking: `speaking-daily-life-introduction` (A1 / Text/Transcript-First)
--   3. Seeds objective practice exercises and confidential answers for Reading comprehension.
--   4. Configures rubric guidelines and prompt definitions for Writing and Speaking.
-- ==============================================================================

-- 1. Update check constraint on public.content_items for content_type
alter table public.content_items
  drop constraint if exists content_items_content_type_check;

alter table public.content_items
  add constraint content_items_content_type_check check (
    content_type in ('lesson', 'grammar', 'vocabulary_set', 'reading', 'listening', 'writing', 'speaking', 'practice')
  );

-- 2. Seed Reading Content Item: Workplace Announcements & Messages
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
  '22222222-1111-4111-a111-000000000001',
  'reading-workplace-announcements-messages',
  'Đọc hiểu Thông báo nội bộ và Kế hoạch công việc (Workplace Announcements & Messages)',
  'Luyện kỹ năng đọc quét thông tin (Scanning) và tìm ý chính qua email thông báo thay đổi giờ làm việc và kế hoạch liên hoan chào đón đồng nghiệp mới.',
  'reading',
  'reading',
  'a1',
  20,
  jsonb_build_object(
    'overview', 'Đọc hiểu văn bản công sở cơ bản; nắm bắt mục đích chính, các mốc thời gian cụ thể, hướng dẫn hành động và các lưu ý đặc biệt.',
    'reading_time_minutes', 5,
    'passage_title', 'Office Memo: Schedule Update & Welcoming Lunch',
    'passage_text', E'From: Lisa Nguyen (HR Department)\nTo: All Staff Members\nDate: Monday, October 20\nSubject: Office Hours Update & Welcoming Lunch for Alex Rivera\n\nDear Team,\n\nPlease read this message carefully regarding our upcoming schedule changes and team event.\n\n1. New Office Hours:\nStarting next Monday, November 3rd, our office working hours will officially change to 8:30 AM – 5:30 PM (Monday to Friday). The building reception will open at 8:00 AM for anyone who wishes to arrive early.\n\n2. Welcoming Lunch for Alex Rivera:\nWe are delighted to welcome our new software engineer, Alex Rivera, to the Engineering Team! We are organizing a team welcoming lunch this Friday, October 24th, at 12:15 PM.\n- Location: Green Garden Bistro (45 Oak Avenue, 2nd Floor).\n- Reservation Details: The company will cover all set meals.\n- Dietary Notice: Delicious vegetarian and gluten-free choices are available upon request.\n\nAction Required:\nPlease reply to this email before Thursday, October 23rd at 3:00 PM to confirm your attendance so that we can finalize our table reservation with the restaurant.\n\nThank you for your cooperation, and we look forward to seeing everyone this Friday!\n\nBest regards,\nLisa Nguyen\nHuman Resources Specialist',
    'vocabulary_highlights', jsonb_build_array(
      jsonb_build_object('word', 'regarding', 'meaning_vi', 'liên quan đến, về vấn đề', 'part_of_speech', 'preposition'),
      jsonb_build_object('word', 'upcoming', 'meaning_vi', 'sắp tới, chuẩn bị diễn ra', 'part_of_speech', 'adjective'),
      jsonb_build_object('word', 'reception', 'meaning_vi', 'quầy lễ tân, sảnh đón tiếp', 'part_of_speech', 'noun'),
      jsonb_build_object('word', 'confirm attendance', 'meaning_vi', 'xác nhận sự tham gia', 'part_of_speech', 'phrase'),
      jsonb_build_object('word', 'dietary notice', 'meaning_vi', 'lưu ý về chế độ ăn uống', 'part_of_speech', 'noun')
    ),
    'reading_tips', jsonb_build_array(
      'Đọc lướt (Skimming) dòng Subject và đoạn mở đầu để nắm mục đích thông báo trước khi đọc câu hỏi.',
      'Tìm kiếm các từ chỉ thời gian (ngày, giờ) và từ in hoa (tên người, địa điểm) để xác định vị trí thông tin cần tìm.',
      'Chú ý phần "Action Required" — đây thường là vị trí chứa câu trả lời cho yêu cầu hành động của nhân viên.'
    )
  ),
  true
) on conflict (slug) do update set
  title = excluded.title,
  description = excluded.description,
  content_type = excluded.content_type,
  skill = excluded.skill,
  level = excluded.level,
  estimated_minutes = excluded.estimated_minutes,
  body = excluded.body,
  is_published = excluded.is_published;

-- 3. Seed Reading Exercises & Server-Only Confidential Answers
insert into public.practice_exercises (
  id,
  content_item_id,
  exercise_type,
  prompt,
  context_text,
  options,
  position,
  weight
) values
(
  '22222222-2222-4111-a111-000000000011',
  '22222222-1111-4111-a111-000000000001',
  'multiple_choice',
  'Mục đích chính của bức email thông báo từ Lisa Nguyen là gì?',
  'Đọc lướt tiêu đề Subject và đoạn mở đầu của bức thư.',
  jsonb_build_array(
    jsonb_build_object('id', 'opt_r1a', 'text', 'Thông báo thay đổi giờ làm việc và tổ chức bữa trưa chào đón nhân viên mới'),
    jsonb_build_object('id', 'opt_r1b', 'text', 'Nhắc nhở nhân viên nộp báo cáo dự án trước thứ Năm'),
    jsonb_build_object('id', 'opt_r1c', 'text', 'Phỏng vấn tuyển dụng kỹ sư phần mềm mới cho công ty'),
    jsonb_build_object('id', 'opt_r1d', 'text', 'Khai trương nhà hàng Green Garden Bistro tại phố Oak')
  ),
  1,
  1.0
),
(
  '22222222-2222-4111-a111-000000000012',
  '22222222-1111-4111-a111-000000000001',
  'multiple_choice',
  'Khung giờ làm việc mới bắt đầu áp dụng từ khi nào?',
  'Tìm từ khóa "New Office Hours" trong mục số 1 của văn bản.',
  jsonb_build_array(
    jsonb_build_object('id', 'opt_r2a', 'text', 'Thứ Sáu, ngày 24 tháng 10'),
    jsonb_build_object('id', 'opt_r2b', 'text', 'Thứ Hai tuần tới, ngày 3 tháng 11'),
    jsonb_build_object('id', 'opt_r2c', 'text', 'Ngay trong ngày hôm nay, thứ Hai ngày 20 tháng 10'),
    jsonb_build_object('id', 'opt_r2d', 'text', 'Đầu tháng sau vào lúc 8:00 sáng')
  ),
  2,
  1.0
),
(
  '22222222-2222-4111-a111-000000000013',
  '22222222-1111-4111-a111-000000000001',
  'multiple_choice',
  'Bữa trưa chào đón Alex Rivera sẽ diễn ra vào thời gian và địa điểm nào?',
  'Tìm thông tin chi tiết về buổi liên hoan trong mục số 2.',
  jsonb_build_array(
    jsonb_build_object('id', 'opt_r3a', 'text', '12:15 PM thứ Sáu tại Green Garden Bistro'),
    jsonb_build_object('id', 'opt_r3b', 'text', '8:30 AM thứ Hai tại sảnh lễ tân tầng 1'),
    jsonb_build_object('id', 'opt_r3c', 'text', '3:00 PM thứ Năm tại phòng họp Engineering'),
    jsonb_build_object('id', 'opt_r3d', 'text', '5:30 PM thứ Sáu tại phố Oak Avenue')
  ),
  3,
  1.0
),
(
  '22222222-2222-4111-a111-000000000014',
  '22222222-1111-4111-a111-000000000001',
  'multiple_choice',
  'Nhân viên cần phải làm gì trước 3:00 PM thứ Năm?',
  'Chú ý phần "Action Required" ở cuối thư.',
  jsonb_build_array(
    jsonb_build_object('id', 'opt_r4a', 'text', 'Gặp mặt trực tiếp Alex Rivera để phân công công việc'),
    jsonb_build_object('id', 'opt_r4b', 'text', 'Thanh toán tiền suất ăn cho phòng nhân sự'),
    jsonb_build_object('id', 'opt_r4c', 'text', 'Phản hồi email để xác nhận có tham gia bữa trưa hay không'),
    jsonb_build_object('id', 'opt_r4d', 'text', 'Đăng ký đổi ca làm việc từ 8:30 AM sang 9:00 AM')
  ),
  4,
  1.0
),
(
  '22222222-2222-4111-a111-000000000015',
  '22222222-1111-4111-a111-000000000001',
  'multiple_choice',
  'Nhận định nào sau đây là ĐÚNG về bữa trưa theo thông báo?',
  'Đối chiếu thông tin mục "Dietary Notice" và "Reservation Details".',
  jsonb_build_array(
    jsonb_build_object('id', 'opt_r5a', 'text', 'Nhân viên phải tự trả 50% chi phí bữa ăn'),
    jsonb_build_object('id', 'opt_r5b', 'text', 'Nhà hàng có sẵn món chay và món không chứa gluten theo yêu cầu'),
    jsonb_build_object('id', 'opt_r5c', 'text', 'Bữa trưa chỉ dành riêng cho thành viên phòng Kỹ thuật phần mềm'),
    jsonb_build_object('id', 'opt_r5d', 'text', 'Mọi người phải mang theo đồ ăn trưa từ nhà')
  ),
  5,
  1.0
)
on conflict (content_item_id, position) do update set
  prompt = excluded.prompt,
  context_text = excluded.context_text,
  options = excluded.options,
  weight = excluded.weight;

-- Confidential Answers for Reading Exercises (Resolved dynamically by natural key to prevent foreign key desync)
do $$
declare
  v_reading_item_id uuid;
  v_ex_1_id uuid;
  v_ex_2_id uuid;
  v_ex_3_id uuid;
  v_ex_4_id uuid;
  v_ex_5_id uuid;
begin
  select id into v_reading_item_id 
  from public.content_items 
  where slug = 'reading-workplace-announcements-messages';

  if v_reading_item_id is not null then
    select id into v_ex_1_id from public.practice_exercises where content_item_id = v_reading_item_id and position = 1;
    select id into v_ex_2_id from public.practice_exercises where content_item_id = v_reading_item_id and position = 2;
    select id into v_ex_3_id from public.practice_exercises where content_item_id = v_reading_item_id and position = 3;
    select id into v_ex_4_id from public.practice_exercises where content_item_id = v_reading_item_id and position = 4;
    select id into v_ex_5_id from public.practice_exercises where content_item_id = v_reading_item_id and position = 5;

    if v_ex_1_id is not null then
      insert into public.practice_exercise_answers (exercise_id, correct_option_id, explanation)
      values (v_ex_1_id, 'opt_r1a', 'Ngay ở dòng Subject: "Office Hours Update & Welcoming Lunch for Alex Rivera", mục đích email nêu rõ cả hai nội dung: cập nhật giờ làm việc và bữa trưa chào đón đồng nghiệp.')
      on conflict (exercise_id) do update set correct_option_id = excluded.correct_option_id, explanation = excluded.explanation;
    end if;

    if v_ex_2_id is not null then
      insert into public.practice_exercise_answers (exercise_id, correct_option_id, explanation)
      values (v_ex_2_id, 'opt_r2b', 'Trong mục 1: "Starting next Monday, November 3rd, our office working hours will officially change to 8:30 AM – 5:30 PM", ngày áp dụng chính xác là thứ Hai tuần tới, ngày 3 tháng 11.')
      on conflict (exercise_id) do update set correct_option_id = excluded.correct_option_id, explanation = excluded.explanation;
    end if;

    if v_ex_3_id is not null then
      insert into public.practice_exercise_answers (exercise_id, correct_option_id, explanation)
      values (v_ex_3_id, 'opt_r3a', 'Trong mục 2: Thời gian là "this Friday, October 24th, at 12:15 PM" và địa điểm là "Green Garden Bistro (45 Oak Avenue, 2nd Floor)".')
      on conflict (exercise_id) do update set correct_option_id = excluded.correct_option_id, explanation = excluded.explanation;
    end if;

    if v_ex_4_id is not null then
      insert into public.practice_exercise_answers (exercise_id, correct_option_id, explanation)
      values (v_ex_4_id, 'opt_r4c', 'Phần Action Required nêu rõ: "Please reply to this email before Thursday, October 23rd at 3:00 PM to confirm your attendance so that we can finalize our table reservation".')
      on conflict (exercise_id) do update set correct_option_id = excluded.correct_option_id, explanation = excluded.explanation;
    end if;

    if v_ex_5_id is not null then
      insert into public.practice_exercise_answers (exercise_id, correct_option_id, explanation)
      values (v_ex_5_id, 'opt_r5b', 'Mục Dietary Notice ghi rõ: "Delicious vegetarian and gluten-free choices are available upon request" (Có sẵn món chay và không gluten khi có yêu cầu).')
      on conflict (exercise_id) do update set correct_option_id = excluded.correct_option_id, explanation = excluded.explanation;
    end if;
  end if;
end $$;

-- 4. Seed Writing Content Item: Introductory Email
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
  '22222222-1111-4111-a111-000000000002',
  'writing-introductory-email',
  'Luyện viết Email giới thiệu bản thân và Kế hoạch học tập (Self-Introduction Email)',
  'Luyện viết một email ngắn bằng tiếng Anh (50 - 120 từ) giới thiệu bản thân với nhóm học tập quốc tế hoặc đồng nghiệp mới, nhận phản hồi sư phạm chuyên sâu từ AI.',
  'practice',
  'writing',
  'a1',
  20,
  jsonb_build_object(
    'overview', 'Thực hành kỹ năng viết câu hoàn chỉnh, sắp xếp bố cục email trang trọng hoặc thân thiện, sử dụng từ vựng giới thiệu bản thân và chia động từ Hiện tại đơn chính xác.',
    'task_type', 'guided_writing',
    'min_words', 40,
    'max_words', 180,
    'target_words', '60-100 từ',
    'prompt_scenario', E'Bạn vừa tham gia một nhóm học tiếng Anh trực tuyến với bạn bè quốc tế. Hãy viết một email ngắn (60 - 100 từ) gửi đến các thành viên trong nhóm để làm quen.\n\nTrong bài viết của bạn, hãy đề cập đến 3 nội dung sau:\n1. Tên, nghề nghiệp/chuyên ngành và nơi bạn đang sinh sống.\n2. Thói quen hàng ngày và sở thích trong thời gian rảnh rỗi.\n3. Lý do bạn muốn cải thiện tiếng Anh và mong muốn khi học cùng nhóm.',
    'email_template_guide', jsonb_build_object(
      'greeting', 'Dear team, / Hi everyone,',
      'body_paragraphs', 'My name is... I am currently living in... In my free time, I really enjoy... I am learning English because...',
      'sign_off', 'Best regards, / Warm wishes, / Looking forward to studying together,'
    ),
    'useful_expressions', jsonb_build_array(
      'My name is [Name] and I am originally from [City/Country].',
      'I currently work as a [Job] / I am studying [Major] at [University].',
      'In my free time, I really enjoy [V-ing] and [V-ing].',
      'My daily routine usually starts at [Time] with [Activity].',
      'I want to improve my English speaking and listening skills because...',
      'I am really excited to practice English with all of you!'
    ),
    'rubric_criteria', jsonb_build_array(
      jsonb_build_object('key', 'task_achievement', 'name', 'Mức độ đáp ứng yêu cầu (Task Achievement)', 'weight', 25, 'description', 'Bao gồm đủ 3 điểm gợi ý, độ dài hợp lý từ 40 đến 180 từ.'),
      jsonb_build_object('key', 'grammar_accuracy', 'name', 'Độ chính xác ngữ pháp (Grammar Accuracy)', 'weight', 30, 'description', 'Chia động từ thì Hiện tại đơn đúng, câu có đầy đủ Chủ ngữ - Vị ngữ, giới từ chuẩn.'),
      jsonb_build_object('key', 'lexical_resource', 'name', 'Vốn từ vựng & Diễn đạt (Lexical Resource)', 'weight', 25, 'description', 'Sử dụng từ vựng đa dạng, tự nhiên, đúng ngữ cảnh về đời sống và nghề nghiệp.'),
      jsonb_build_object('key', 'coherence_organization', 'name', 'Bố cục & Tính mạch lạc (Coherence & Layout)', 'weight', 20, 'description', 'Có lời chào, phần thân bài phân đoạn rõ ràng và lời kết email phù hợp.')
    )
  ),
  true
) on conflict (slug) do update set
  title = excluded.title,
  description = excluded.description,
  content_type = excluded.content_type,
  skill = excluded.skill,
  level = excluded.level,
  estimated_minutes = excluded.estimated_minutes,
  body = excluded.body,
  is_published = excluded.is_published;

-- 5. Seed Speaking Content Item: Self-Introduction & Daily Life
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
  '22222222-1111-4111-a111-000000000003',
  'speaking-daily-life-introduction',
  'Luyện nói Phản xạ giới thiệu bản thân và Cuộc sống thường ngày (Self-Introduction & Daily Life)',
  'Luyện phản xạ nói theo phương pháp Transcript-First: Chuẩn bị nội dung nói, ghi lại lời thoại (40 - 150 từ) và nhận đánh giá từ AI về độ tự nhiên, ngữ pháp văn nói và từ nối.',
  'practice',
  'speaking',
  'a1',
  15,
  jsonb_build_object(
    'overview', 'Rèn luyện phản xạ giao tiếp cơ bản: trình bày trôi chảy một đoạn giới thiệu ngắn về bản thân, thói quen và sở thích trong ngữ cảnh giao tiếp tự nhiên.',
    'task_type', 'spoken_transcript',
    'min_words', 30,
    'max_words', 160,
    'target_words', '50-100 từ',
    'prompt_scenario', E'Hãy tưởng tượng bạn đang trong một buổi giao lưu câu lạc bộ tiếng Anh hoặc phỏng vấn làm quen. Người đối diện hỏi bạn:\n\n"Could you please introduce yourself, tell me about your daily routine, and share what you like to do in your free time?"\n\nBạn hãy chuẩn bị câu trả lời bằng lời nói, sau đó nhập chính xác transcript nội dung bạn vừa nói (khoảng 50 - 100 từ) vào khung bên dưới để AI phân tích độ tự nhiên và chỉ ra các điểm cần hoàn thiện.',
    'suggested_cue_points', jsonb_build_array(
      'Greeting and full name (Chào hỏi và họ tên).',
      'Where you live and current occupation (Nơi ở và công việc hiện tại).',
      'Your typical morning or evening routine (Thói quen buổi sáng hoặc buổi tối).',
      'One or two favorite hobbies with reasons (Một hoặc hai sở thích kèm lý do).'
    ),
    'conversational_tips', jsonb_build_array(
      'Sử dụng các từ nối tự nhiên trong văn nói: "Actually", "To be honest", "Usually", "After that", "Besides that".',
      'Không cần quá trang trọng; dùng câu ngắn, rõ nghĩa và nhịp điệu tự nhiên.',
      'Khi nói về sở thích, hãy dùng "I really enjoy..." hoặc "I am quite into..." thay vì lặp lại "I like...".'
    ),
    'rubric_criteria', jsonb_build_array(
      jsonb_build_object('key', 'relevance_fluency', 'name', 'Mức độ phù hợp & Mạch lạc (Relevance & Flow)', 'weight', 25, 'description', 'Trả lời đúng trọng tâm câu hỏi, câu từ liên kết mượt mà bằng các từ nối giao tiếp.'),
      jsonb_build_object('key', 'spoken_grammar', 'name', 'Ngữ pháp văn nói (Spoken Grammar)', 'weight', 30, 'description', 'Cấu trúc câu tự nhiên, chia đúng thì động từ, không mắc lỗi câu què hoặc câu cụt.'),
      jsonb_build_object('key', 'conversational_vocab', 'name', 'Từ vựng đàm thoại (Conversational Vocabulary)', 'weight', 25, 'description', 'Sử dụng cụm từ diễn đạt quen thuộc của người bản xứ (natural collocations).'),
      jsonb_build_object('key', 'naturalness_sample', 'name', 'Độ tự nhiên & Phản xạ (Naturalness)', 'weight', 20, 'description', 'Độ chân thực của câu trả lời so với ngữ cảnh giao tiếp đời thực.')
    )
  ),
  true
) on conflict (slug) do update set
  title = excluded.title,
  description = excluded.description,
  content_type = excluded.content_type,
  skill = excluded.skill,
  level = excluded.level,
  estimated_minutes = excluded.estimated_minutes,
  body = excluded.body,
  is_published = excluded.is_published;
