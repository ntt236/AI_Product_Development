import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

let env = {};
try {
  const envFile = fs.readFileSync('.env.local', 'utf8');
  for (const line of envFile.split('\n')) {
    const idx = line.indexOf('=');
    if (idx > 0 && !line.startsWith('#')) {
      env[line.slice(0, idx).trim()] = line.slice(idx + 1).trim();
    }
  }
} catch (e) {
  console.warn('Could not read .env.local:', e.message);
}

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false },
});

async function main() {
  console.log('Seeding Phase 7 Four Skills Content Items and Exercises...');

  // 1. Reading Content Item
  const readingItem = {
    id: '22222222-1111-4111-a111-000000000001',
    slug: 'reading-workplace-announcements-messages',
    title: 'Đọc hiểu Thông báo nội bộ và Kế hoạch công việc (Workplace Announcements & Messages)',
    description: 'Luyện kỹ năng đọc quét thông tin (Scanning) và tìm ý chính qua email thông báo thay đổi giờ làm việc và kế hoạch liên hoan chào đón đồng nghiệp mới.',
    content_type: 'reading',
    skill: 'reading',
    level: 'a1',
    estimated_minutes: 20,
    body: {
      overview: 'Đọc hiểu văn bản công sở cơ bản; nắm bắt mục đích chính, các mốc thời gian cụ thể, hướng dẫn hành động và các lưu ý đặc biệt.',
      reading_time_minutes: 5,
      passage_title: 'Office Memo: Schedule Update & Welcoming Lunch',
      passage_text: `From: Lisa Nguyen (HR Department)
To: All Staff Members
Date: Monday, October 20
Subject: Office Hours Update & Welcoming Lunch for Alex Rivera

Dear Team,

Please read this message carefully regarding our upcoming schedule changes and team event.

1. New Office Hours:
Starting next Monday, November 3rd, our office working hours will officially change to 8:30 AM – 5:30 PM (Monday to Friday). The building reception will open at 8:00 AM for anyone who wishes to arrive early.

2. Welcoming Lunch for Alex Rivera:
We are delighted to welcome our new software engineer, Alex Rivera, to the Engineering Team! We are organizing a team welcoming lunch this Friday, October 24th, at 12:15 PM.
- Location: Green Garden Bistro (45 Oak Avenue, 2nd Floor).
- Reservation Details: The company will cover all set meals.
- Dietary Notice: Delicious vegetarian and gluten-free choices are available upon request.

Action Required:
Please reply to this email before Thursday, October 23rd at 3:00 PM to confirm your attendance so that we can finalize our table reservation with the restaurant.

Thank you for your cooperation, and we look forward to seeing everyone this Friday!

Best regards,
Lisa Nguyen
Human Resources Specialist`,
      vocabulary_highlights: [
        { word: 'regarding', meaning_vi: 'liên quan đến, về vấn đề', part_of_speech: 'preposition' },
        { word: 'upcoming', meaning_vi: 'sắp tới, chuẩn bị diễn ra', part_of_speech: 'adjective' },
        { word: 'reception', meaning_vi: 'quầy lễ tân, sảnh đón tiếp', part_of_speech: 'noun' },
        { word: 'confirm attendance', meaning_vi: 'xác nhận sự tham gia', part_of_speech: 'phrase' },
        { word: 'dietary notice', meaning_vi: 'lưu ý về chế độ ăn uống', part_of_speech: 'noun' }
      ],
      reading_tips: [
        'Đọc lướt (Skimming) dòng Subject và đoạn mở đầu để nắm mục đích thông báo trước khi đọc câu hỏi.',
        'Tìm kiếm các từ chỉ thời gian (ngày, giờ) và từ in hoa (tên người, địa điểm) để xác định vị trí thông tin cần tìm.',
        'Chú ý phần "Action Required" — đây thường là vị trí chứa câu trả lời cho yêu cầu hành động của nhân viên.'
      ]
    },
    is_published: true,
  };

  const { error: rErr } = await supabase.from('content_items').upsert(readingItem, { onConflict: 'slug' });
  if (rErr) {
    console.error('Error upserting reading content item:', rErr);
  } else {
    console.log('✓ Reading content item upserted successfully');
  }

  // 2. Reading Exercises
  const readingExercises = [
    {
      id: '22222222-2222-4111-a111-000000000011',
      content_item_id: readingItem.id,
      exercise_type: 'multiple_choice',
      prompt: 'Mục đích chính của bức email thông báo từ Lisa Nguyen là gì?',
      context_text: 'Đọc lướt tiêu đề Subject và đoạn mở đầu của bức thư.',
      options: [
        { id: 'opt_r1a', text: 'Thông báo thay đổi giờ làm việc và tổ chức bữa trưa chào đón nhân viên mới' },
        { id: 'opt_r1b', text: 'Nhắc nhở nhân viên nộp báo cáo dự án trước thứ Năm' },
        { id: 'opt_r1c', text: 'Phỏng vấn tuyển dụng kỹ sư phần mềm mới cho công ty' },
        { id: 'opt_r1d', text: 'Khai trương nhà hàng Green Garden Bistro tại phố Oak' }
      ],
      position: 1,
      weight: 1.0,
    },
    {
      id: '22222222-2222-4111-a111-000000000012',
      content_item_id: readingItem.id,
      exercise_type: 'multiple_choice',
      prompt: 'Khung giờ làm việc mới bắt đầu áp dụng từ khi nào?',
      context_text: 'Tìm từ khóa "New Office Hours" trong mục số 1 của văn bản.',
      options: [
        { id: 'opt_r2a', text: 'Thứ Sáu, ngày 24 tháng 10' },
        { id: 'opt_r2b', text: 'Thứ Hai tuần tới, ngày 3 tháng 11' },
        { id: 'opt_r2c', text: 'Ngay trong ngày hôm nay, thứ Hai ngày 20 tháng 10' },
        { id: 'opt_r2d', text: 'Đầu tháng sau vào lúc 8:00 sáng' }
      ],
      position: 2,
      weight: 1.0,
    },
    {
      id: '22222222-2222-4111-a111-000000000013',
      content_item_id: readingItem.id,
      exercise_type: 'multiple_choice',
      prompt: 'Bữa trưa chào đón Alex Rivera sẽ diễn ra vào thời gian và địa điểm nào?',
      context_text: 'Tìm thông tin chi tiết về buổi liên hoan trong mục số 2.',
      options: [
        { id: 'opt_r3a', text: '12:15 PM thứ Sáu tại Green Garden Bistro' },
        { id: 'opt_r3b', text: '8:30 AM thứ Hai tại sảnh lễ tân tầng 1' },
        { id: 'opt_r3c', text: '3:00 PM thứ Năm tại phòng họp Engineering' },
        { id: 'opt_r3d', text: '5:30 PM thứ Sáu tại phố Oak Avenue' }
      ],
      position: 3,
      weight: 1.0,
    },
    {
      id: '22222222-2222-4111-a111-000000000014',
      content_item_id: readingItem.id,
      exercise_type: 'multiple_choice',
      prompt: 'Nhân viên cần phải làm gì trước 3:00 PM thứ Năm?',
      context_text: 'Chú ý phần "Action Required" ở cuối thư.',
      options: [
        { id: 'opt_r4a', text: 'Gặp mặt trực tiếp Alex Rivera để phân công công việc' },
        { id: 'opt_r4b', text: 'Thanh toán tiền suất ăn cho phòng nhân sự' },
        { id: 'opt_r4c', text: 'Phản hồi email để xác nhận có tham gia bữa trưa hay không' },
        { id: 'opt_r4d', text: 'Đăng ký đổi ca làm việc từ 8:30 AM sang 9:00 AM' }
      ],
      position: 4,
      weight: 1.0,
    },
    {
      id: '22222222-2222-4111-a111-000000000015',
      content_item_id: readingItem.id,
      exercise_type: 'multiple_choice',
      prompt: 'Nhận định nào sau đây là ĐÚNG về bữa trưa theo thông báo?',
      context_text: 'Đối chiếu thông tin mục "Dietary Notice" và "Reservation Details".',
      options: [
        { id: 'opt_r5a', text: 'Nhân viên phải tự trả 50% chi phí bữa ăn' },
        { id: 'opt_r5b', text: 'Nhà hàng có sẵn món chay và món không chứa gluten theo yêu cầu' },
        { id: 'opt_r5c', text: 'Bữa trưa chỉ dành riêng cho thành viên phòng Kỹ thuật phần mềm' },
        { id: 'opt_r5d', text: 'Mọi người phải mang theo đồ ăn trưa từ nhà' }
      ],
      position: 5,
      weight: 1.0,
    }
  ];

  for (const ex of readingExercises) {
    const { error: exErr } = await supabase.from('practice_exercises').upsert(ex, { onConflict: 'content_item_id,position' });
    if (exErr) console.error('Error upserting exercise:', ex.position, exErr);
  }
  console.log('✓ Reading exercises upserted successfully');

  // 3. Reading Answers (Server-Only, dynamic resolution by position)
  const { data: dbExercises } = await supabase
    .from('practice_exercises')
    .select('id, position')
    .eq('content_item_id', readingItem.id);

  const posToId = new Map(dbExercises?.map((e) => [e.position, e.id]));

  const readingAnswersTemplate = [
    {
      position: 1,
      correct_option_id: 'opt_r1a',
      explanation: 'Ngay ở dòng Subject: "Office Hours Update & Welcoming Lunch for Alex Rivera", mục đích email nêu rõ cả hai nội dung: cập nhật giờ làm việc và bữa trưa chào đón đồng nghiệp.'
    },
    {
      position: 2,
      correct_option_id: 'opt_r2b',
      explanation: 'Trong mục 1: "Starting next Monday, November 3rd, our office working hours will officially change to 8:30 AM – 5:30 PM", ngày áp dụng chính xác là thứ Hai tuần tới, ngày 3 tháng 11.'
    },
    {
      position: 3,
      correct_option_id: 'opt_r3a',
      explanation: 'Trong mục 2: Thời gian là "this Friday, October 24th, at 12:15 PM" và địa điểm là "Green Garden Bistro (45 Oak Avenue, 2nd Floor)".'
    },
    {
      position: 4,
      correct_option_id: 'opt_r4c',
      explanation: 'Phần Action Required nêu rõ: "Please reply to this email before Thursday, October 23rd at 3:00 PM to confirm your attendance so that we can finalize our table reservation".'
    },
    {
      position: 5,
      correct_option_id: 'opt_r5b',
      explanation: 'Mục Dietary Notice ghi rõ: "Delicious vegetarian and gluten-free choices are available upon request" (Có sẵn món chay và không gluten khi có yêu cầu).'
    }
  ];

  for (const tpl of readingAnswersTemplate) {
    const exId = posToId.get(tpl.position);
    if (exId) {
      const { error: ansErr } = await supabase.from('practice_exercise_answers').upsert({
        exercise_id: exId,
        correct_option_id: tpl.correct_option_id,
        explanation: tpl.explanation
      }, { onConflict: 'exercise_id' });
      if (ansErr) console.error('Error upserting answer:', exId, ansErr);
    }
  }
  console.log('✓ Reading confidential answers upserted successfully');

  // 4. Writing Content Item
  const writingItem = {
    id: '22222222-1111-4111-a111-000000000002',
    slug: 'writing-introductory-email',
    title: 'Luyện viết Email giới thiệu bản thân và Kế hoạch học tập (Self-Introduction Email)',
    description: 'Luyện viết một email ngắn bằng tiếng Anh (50 - 120 từ) giới thiệu bản thân với nhóm học tập quốc tế hoặc đồng nghiệp mới, nhận phản hồi sư phạm chuyên sâu từ AI.',
    content_type: 'practice',
    skill: 'writing',
    level: 'a1',
    estimated_minutes: 20,
    body: {
      overview: 'Thực hành kỹ năng viết câu hoàn chỉnh, sắp xếp bố cục email trang trọng hoặc thân thiện, sử dụng từ vựng giới thiệu bản thân và chia động từ Hiện tại đơn chính xác.',
      task_type: 'guided_writing',
      min_words: 40,
      max_words: 180,
      target_words: '60-100 từ',
      prompt_scenario: `Bạn vừa tham gia một nhóm học tiếng Anh trực tuyến với bạn bè quốc tế. Hãy viết một email ngắn (60 - 100 từ) gửi đến các thành viên trong nhóm để làm quen.\n\nTrong bài viết của bạn, hãy đề cập đến 3 nội dung sau:\n1. Tên, nghề nghiệp/chuyên ngành và nơi bạn đang sinh sống.\n2. Thói quen hàng ngày và sở thích trong thời gian rảnh rỗi.\n3. Lý do bạn muốn cải thiện tiếng Anh và mong muốn khi học cùng nhóm.`,
      email_template_guide: {
        greeting: 'Dear team, / Hi everyone,',
        body_paragraphs: 'My name is... I am currently living in... In my free time, I really enjoy... I am learning English because...',
        sign_off: 'Best regards, / Warm wishes, / Looking forward to studying together,'
      },
      useful_expressions: [
        'My name is [Name] and I am originally from [City/Country].',
        'I currently work as a [Job] / I am studying [Major] at [University].',
        'In my free time, I really enjoy [V-ing] and [V-ing].',
        'My daily routine usually starts at [Time] with [Activity].',
        'I want to improve my English speaking and listening skills because...',
        'I am really excited to practice English with all of you!'
      ],
      rubric_criteria: [
        { key: 'task_achievement', name: 'Mức độ đáp ứng yêu cầu (Task Achievement)', weight: 25, description: 'Bao gồm đủ 3 điểm gợi ý, độ dài hợp lý từ 40 đến 180 từ.' },
        { key: 'grammar_accuracy', name: 'Độ chính xác ngữ pháp (Grammar Accuracy)', weight: 30, description: 'Chia động từ thì Hiện tại đơn đúng, câu có đầy đủ Chủ ngữ - Vị ngữ, giới từ chuẩn.' },
        { key: 'lexical_resource', name: 'Vốn từ vựng & Diễn đạt (Lexical Resource)', weight: 25, description: 'Sử dụng từ vựng đa dạng, tự nhiên, đúng ngữ cảnh về đời sống và nghề nghiệp.' },
        { key: 'coherence_organization', name: 'Bố cục & Tính mạch lạc (Coherence & Layout)', weight: 20, description: 'Có lời chào, phần thân bài phân đoạn rõ ràng và lời kết email phù hợp.' }
      ]
    },
    is_published: true,
  };

  const { error: wErr } = await supabase.from('content_items').upsert(writingItem, { onConflict: 'slug' });
  if (wErr) {
    console.error('Error upserting writing content item:', wErr);
  } else {
    console.log('✓ Writing content item upserted successfully');
  }

  // 5. Speaking Content Item
  const speakingItem = {
    id: '22222222-1111-4111-a111-000000000003',
    slug: 'speaking-daily-life-introduction',
    title: 'Luyện nói Phản xạ giới thiệu bản thân và Cuộc sống thường ngày (Self-Introduction & Daily Life)',
    description: 'Luyện phản xạ nói theo phương pháp Transcript-First: Chuẩn bị nội dung nói, ghi lại lời thoại (40 - 150 từ) và nhận đánh giá từ AI về độ tự nhiên, ngữ pháp văn nói và từ nối.',
    content_type: 'practice',
    skill: 'speaking',
    level: 'a1',
    estimated_minutes: 15,
    body: {
      overview: 'Rèn luyện phản xạ giao tiếp cơ bản: trình bày trôi chảy một đoạn giới thiệu ngắn về bản thân, thói quen và sở thích trong ngữ cảnh giao tiếp tự nhiên.',
      task_type: 'spoken_transcript',
      min_words: 30,
      max_words: 160,
      target_words: '50-100 từ',
      prompt_scenario: `Hãy tưởng tượng bạn đang trong một buổi giao lưu câu lạc bộ tiếng Anh hoặc phỏng vấn làm quen. Người đối diện hỏi bạn:\n\n"Could you please introduce yourself, tell me about your daily routine, and share what you like to do in your free time?"\n\nBạn hãy chuẩn bị câu trả lời bằng lời nói, sau đó nhập chính xác transcript nội dung bạn vừa nói (khoảng 50 - 100 từ) vào khung bên dưới để AI phân tích độ tự nhiên và chỉ ra các điểm cần hoàn thiện.`,
      suggested_cue_points: [
        'Greeting and full name (Chào hỏi và họ tên).',
        'Where you live and current occupation (Nơi ở và công việc hiện tại).',
        'Your typical morning or evening routine (Thói quen buổi sáng hoặc buổi tối).',
        'One or two favorite hobbies with reasons (Một hoặc hai sở thích kèm lý do).'
      ],
      conversational_tips: [
        'Sử dụng các từ nối tự nhiên trong văn nói: "Actually", "To be honest", "Usually", "After that", "Besides that".',
        'Không cần quá trang trọng; dùng câu ngắn, rõ nghĩa và nhịp điệu tự nhiên.',
        'Khi nói về sở thích, hãy dùng "I really enjoy..." hoặc "I am quite into..." thay vì lặp lại "I like...".'
      ],
      rubric_criteria: [
        { key: 'relevance_fluency', name: 'Mức độ phù hợp & Mạch lạc (Relevance & Flow)', weight: 25, description: 'Trả lời đúng trọng tâm câu hỏi, câu từ liên kết mượt mà bằng các từ nối giao tiếp.' },
        { key: 'spoken_grammar', name: 'Ngữ pháp văn nói (Spoken Grammar)', weight: 30, description: 'Cấu trúc câu tự nhiên, chia đúng thì động từ, không mắc lỗi câu què hoặc câu cụt.' },
        { key: 'conversational_vocab', name: 'Từ vựng đàm thoại (Conversational Vocabulary)', weight: 25, description: 'Sử dụng cụm từ diễn đạt quen thuộc của người bản xứ (natural collocations).' },
        { key: 'naturalness_sample', name: 'Độ tự nhiên & Phản xạ (Naturalness)', weight: 20, description: 'Độ chân thực của câu trả lời so với ngữ cảnh giao tiếp đời thực.' }
      ]
    },
    is_published: true,
  };

  const { error: sErr } = await supabase.from('content_items').upsert(speakingItem, { onConflict: 'slug' });
  if (sErr) {
    console.error('Error upserting speaking content item:', sErr);
  } else {
    console.log('✓ Speaking content item upserted successfully');
  }

  console.log('\nAll Phase 7 Four Skills seeds applied successfully!');
}

main().catch((err) => {
  console.error('Fatal seeding error:', err);
  process.exit(1);
});
