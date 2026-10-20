import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const envFile = fs.readFileSync('.env.local', 'utf8');
const env = {};
for (const line of envFile.split('\n')) {
  const idx = line.indexOf('=');
  if (idx > 0 && !line.startsWith('#')) {
    env[line.slice(0, idx).trim()] = line.slice(idx + 1).trim();
  }
}

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

async function main() {
  console.log('Seeding Phase 6 Curated Vocabulary and Content Item...');

  // 1. Content Item: vocab-office-communication
  const contentItem = {
    id: '11111111-1111-4111-a111-000000000004',
    slug: 'vocab-office-communication',
    title: 'Từ vựng Giao tiếp Nơi làm việc (Office Communication)',
    description: 'Học 6 từ vựng công sở thiết yếu về đồng nghiệp, hạn chót, phối hợp công việc và báo cáo.',
    content_type: 'vocabulary_set',
    skill: 'vocabulary',
    level: 'a1',
    estimated_minutes: 15,
    body: {
      overview: 'Nắm vững 6 từ vựng giao tiếp công sở trọng tâm giúp trao đổi công việc, lịch trình và phối hợp nhóm hiệu quả.',
      words: [
        {
          word: 'colleague',
          ipa: '/ˈkɒliːɡ/',
          part_of_speech: 'noun',
          meaning_vi: 'đồng nghiệp',
          example: 'I discussed the quarterly project with my colleague.',
          note: 'Chỉ người cùng làm việc trong một cơ quan, tổ chức.'
        },
        {
          word: 'deadline',
          ipa: '/ˈdedlaɪn/',
          part_of_speech: 'noun',
          meaning_vi: 'hạn chót hoàn thành',
          example: 'The strict project deadline is 5:00 PM this Friday.',
          note: 'Cụm từ phổ biến: meet the deadline (kịp hạn), miss the deadline (trễ hạn).'
        },
        {
          word: 'presentation',
          ipa: '/ˌpreznˈteɪʃn/',
          part_of_speech: 'noun',
          meaning_vi: 'bài thuyết trình, bài trình bày',
          example: 'She gave an impressive presentation to the new client.',
          note: 'Cụm từ hay dùng: give/deliver a presentation.'
        },
        {
          word: 'feedback',
          ipa: '/ˈfiːdbæk/',
          part_of_speech: 'noun (uncountable)',
          meaning_vi: 'ý kiến phản hồi, nhận xét',
          example: 'The manager provided constructive feedback on my work.',
          note: 'Danh từ không đếm được: some feedback, a piece of feedback.'
        },
        {
          word: 'collaborate',
          ipa: '/kəˈlæbəreɪt/',
          part_of_speech: 'verb',
          meaning_vi: 'hợp tác, phối hợp làm việc',
          example: 'Our team collaborates closely with software engineers.',
          note: 'Cấu trúc: collaborate with somebody on something.'
        },
        {
          word: 'postpone',
          ipa: '/pəʊstˈpəʊn/',
          part_of_speech: 'verb',
          meaning_vi: 'hoãn lại, dời lịch',
          example: 'We decided to postpone the kickoff meeting until next Monday.',
          note: 'Đồng nghĩa với phrasal verb "put off".'
        }
      ]
    },
    is_published: true,
  };

  const { error: itemErr } = await supabase.from('content_items').upsert(contentItem, { onConflict: 'slug' });
  if (itemErr) {
    console.error('Error upserting content item:', itemErr);
    process.exit(1);
  }
  console.log('✓ Upserted content item: vocab-office-communication');

  // Fetch actual persistent ID of content item by slug
  const { data: realContentItem } = await supabase
    .from('content_items')
    .select('id')
    .eq('slug', 'vocab-office-communication')
    .single();
  const actualContentId = realContentItem?.id || contentItem.id;

  // 2. Practice Exercises
  const exercises = [
    {
      id: '11111111-2222-4111-a111-000000000021',
      content_item_id: actualContentId,
      exercise_type: 'multiple_choice',
      prompt: 'Chọn từ phù hợp nhất: "I usually have lunch with my ________ from the marketing team."',
      options: [
        { id: 'opt_21a', text: 'colleague' },
        { id: 'opt_21b', text: 'deadline' },
        { id: 'opt_21c', text: 'presentation' },
        { id: 'opt_21d', text: 'postpone' }
      ],
      position: 1,
      weight: 1.0,
      answer: {
        correct_option_id: 'opt_21a',
        explanation: '"colleague" nghĩa là đồng nghiệp cùng cơ quan/phòng ban. Câu nói về việc ăn trưa cùng đồng nghiệp trong nhóm marketing.'
      }
    },
    {
      id: '11111111-2222-4111-a111-000000000022',
      content_item_id: actualContentId,
      exercise_type: 'multiple_choice',
      prompt: 'Cụm từ "meet the deadline" có ý nghĩa gì trong môi trường công sở?',
      context_text: 'Ngữ cảnh: Quản lý dự án nhắc nhở toàn đội về tiến độ bàn giao sản phẩm.',
      options: [
        { id: 'opt_22a', text: 'Hủy bỏ toàn bộ kế hoạch dự án' },
        { id: 'opt_22b', text: 'Hoàn thành công việc đúng hạn đã định' },
        { id: 'opt_22c', text: 'Kéo dài thời gian làm việc sang tuần sau' },
        { id: 'opt_22d', text: 'Từ chối nhận nhiệm vụ từ cấp trên' }
      ],
      position: 2,
      weight: 1.0,
      answer: {
        correct_option_id: 'opt_22b',
        explanation: '"meet the deadline" là thành ngữ công sở phổ biến, có nghĩa là kịp hạn, hoàn thành đúng thời hạn quy định.'
      }
    },
    {
      id: '11111111-2222-4111-a111-000000000023',
      content_item_id: actualContentId,
      exercise_type: 'multiple_choice',
      prompt: 'Điền từ phù hợp: "After the product demo, the clients gave us very positive ________."',
      options: [
        { id: 'opt_23a', text: 'feedback' },
        { id: 'opt_23b', text: 'commute' },
        { id: 'opt_23c', text: 'postpone' },
        { id: 'opt_23d', text: 'wake up' }
      ],
      position: 3,
      weight: 1.0,
      answer: {
        correct_option_id: 'opt_23a',
        explanation: '"feedback" là nhận xét, phản hồi. Khách hàng đã đưa ra những ý kiến phản hồi rất tích cực sau buổi giới thiệu sản phẩm.'
      }
    },
    {
      id: '11111111-2222-4111-a111-000000000024',
      content_item_id: actualContentId,
      exercise_type: 'multiple_choice',
      prompt: 'Chọn động từ chính xác: "Our designers and developers need to ________ closely to build great apps."',
      options: [
        { id: 'opt_24a', text: 'collaborate' },
        { id: 'opt_24b', text: 'deadline' },
        { id: 'opt_24c', text: 'breakfast' },
        { id: 'opt_24d', text: 'routine' }
      ],
      position: 4,
      weight: 1.0,
      answer: {
        correct_option_id: 'opt_24a',
        explanation: '"collaborate" là động từ chỉ sự cộng tác, hợp tác làm việc nhóm giữa các bộ phận thiết kế và lập trình.'
      }
    },
    {
      id: '11111111-2222-4111-a111-000000000025',
      content_item_id: actualContentId,
      exercise_type: 'multiple_choice',
      prompt: 'Từ "postpone" đồng nghĩa với cụm từ nào sau đây?',
      options: [
        { id: 'opt_25a', text: 'put off / delay' },
        { id: 'opt_25b', text: 'start immediately' },
        { id: 'opt_25c', text: 'wake up early' },
        { id: 'opt_25d', text: 'finish on time' }
      ],
      position: 5,
      weight: 1.0,
      answer: {
        correct_option_id: 'opt_25a',
        explanation: '"postpone" đồng nghĩa với "put off" hoặc "delay", mang nghĩa hoãn lại một sự kiện hoặc cuộc họp sang thời điểm sau.'
      }
    }
  ];

  for (const ex of exercises) {
    const { answer, ...exRow } = ex;
    const { error: exErr } = await supabase.from('practice_exercises').upsert(exRow, { onConflict: 'content_item_id, position' });
    if (exErr) {
      console.error(`Error upserting exercise ${ex.id}:`, exErr);
      process.exit(1);
    }

    // Resolve real exercise id in case it was already existing with different UUID
    const { data: realEx } = await supabase
      .from('practice_exercises')
      .select('id')
      .eq('content_item_id', actualContentId)
      .eq('position', ex.position)
      .single();
    const actualExerciseId = realEx?.id || ex.id;

    const { error: ansErr } = await supabase.from('practice_exercise_answers').upsert({
      exercise_id: actualExerciseId,
      correct_option_id: answer.correct_option_id,
      explanation: answer.explanation
    }, { onConflict: 'exercise_id' });

    if (ansErr) {
      console.error(`Error upserting answer for exercise ${actualExerciseId}:`, ansErr);
      process.exit(1);
    }
  }
  console.log(`✓ ${exercises.length} practice exercises and answer keys upserted`);

  // 3. Try to upsert vocabulary_items if table exists
  const { error: tableCheck } = await supabase.from('vocabulary_items').select('id').limit(1);
  if (!tableCheck) {
    console.log('Table vocabulary_items exists in Supabase. Upserting curated dictionary items...');

    // Resolve actual daily routine content item id
    const { data: routineItem } = await supabase
      .from('content_items')
      .select('id')
      .eq('slug', 'vocab-daily-routine')
      .maybeSingle();
    const actualRoutineId = routineItem?.id || '11111111-1111-4111-a111-000000000001';

    const vocabSeed = [
      {
        content_item_id: actualRoutineId,
        word: 'wake up',
        word_normalized: 'wake up',
        part_of_speech: 'phrasal verb',
        ipa: '/weɪk ʌp/',
        meaning_vi: 'thức giấc, mở mắt tỉnh dậy',
        example: 'I usually wake up at 6:00 AM every morning.',
        note: 'Phân biệt với "get up" (rời khỏi giường).',
        topic: 'daily_routine',
        level: 'a1'
      },
      {
        content_item_id: '11111111-1111-4111-a111-000000000001',
        word: 'have breakfast',
        word_normalized: 'have breakfast',
        part_of_speech: 'verb phrase',
        ipa: '/hæv ˈbrekfəst/',
        meaning_vi: 'ăn sáng',
        example: 'She has breakfast with her family before going to work.',
        note: 'Dùng have/eat breakfast, không dùng "drink breakfast".',
        topic: 'daily_routine',
        level: 'a1'
      },
      {
        content_item_id: '11111111-1111-4111-a111-000000000001',
        word: 'commute',
        word_normalized: 'commute',
        part_of_speech: 'verb',
        ipa: '/kəˈmjuːt/',
        meaning_vi: 'đi lại đều đặn giữa nhà và nơi làm việc',
        example: 'He commutes to the office by bus every weekday.',
        note: 'Danh từ: a 30-minute commute.',
        topic: 'daily_routine',
        level: 'a1'
      },
      {
        content_item_id: '11111111-1111-4111-a111-000000000001',
        word: 'prepare',
        word_normalized: 'prepare',
        part_of_speech: 'verb',
        ipa: '/prɪˈpeər/',
        meaning_vi: 'chuẩn bị, sửa soạn',
        example: 'They prepare dinner together in the evening.',
        note: 'Cấu trúc: prepare for something hoặc prepare something.',
        topic: 'daily_routine',
        level: 'a1'
      },
      {
        content_item_id: '11111111-1111-4111-a111-000000000001',
        word: 'schedule',
        word_normalized: 'schedule',
        part_of_speech: 'noun',
        ipa: '/ˈskedʒuːl/',
        meaning_vi: 'lịch trình, thời gian biểu',
        example: 'I need to check my daily schedule for the meeting.',
        note: 'Cụm từ phổ biến: on schedule (đúng giờ), ahead of schedule.',
        topic: 'daily_routine',
        level: 'a1'
      },
      {
        content_item_id: '11111111-1111-4111-a111-000000000001',
        word: 'relax',
        word_normalized: 'relax',
        part_of_speech: 'verb',
        ipa: '/rɪˈlæks/',
        meaning_vi: 'thư giãn, nghỉ ngơi',
        example: 'After a long working day, I relax by listening to music.',
        note: 'Tính từ miêu tả: relaxing (êm đềm), relaxed (thư thái).',
        topic: 'daily_routine',
        level: 'a1'
      },
      {
        content_item_id: actualContentId,
        word: 'colleague',
        word_normalized: 'colleague',
        part_of_speech: 'noun',
        ipa: '/ˈkɒliːɡ/',
        meaning_vi: 'đồng nghiệp',
        example: 'I discussed the quarterly project with my colleague.',
        note: 'Chỉ người cùng làm việc trong một cơ quan, tổ chức.',
        topic: 'office',
        level: 'a1'
      },
      {
        content_item_id: actualContentId,
        word: 'deadline',
        word_normalized: 'deadline',
        part_of_speech: 'noun',
        ipa: '/ˈdedlaɪn/',
        meaning_vi: 'hạn chót hoàn thành',
        example: 'The strict project deadline is 5:00 PM this Friday.',
        note: 'Cụm từ phổ biến: meet the deadline, miss the deadline.',
        topic: 'office',
        level: 'a1'
      },
      {
        content_item_id: actualContentId,
        word: 'presentation',
        word_normalized: 'presentation',
        part_of_speech: 'noun',
        ipa: '/ˌpreznˈteɪʃn/',
        meaning_vi: 'bài thuyết trình, bài trình bày',
        example: 'She gave an impressive presentation to the new client.',
        note: 'Cụm từ hay dùng: give/deliver a presentation.',
        topic: 'office',
        level: 'a1'
      },
      {
        content_item_id: actualContentId,
        word: 'feedback',
        word_normalized: 'feedback',
        part_of_speech: 'noun',
        ipa: '/ˈfiːdbæk/',
        meaning_vi: 'ý kiến phản hồi, nhận xét',
        example: 'The manager provided constructive feedback on my work.',
        note: 'Danh từ không đếm được: some feedback, a piece of feedback.',
        topic: 'office',
        level: 'a1'
      },
      {
        content_item_id: actualContentId,
        word: 'collaborate',
        word_normalized: 'collaborate',
        part_of_speech: 'verb',
        ipa: '/kəˈlæbəreɪt/',
        meaning_vi: 'hợp tác, phối hợp làm việc',
        example: 'Our team collaborates closely with software engineers.',
        note: 'Cấu trúc: collaborate with somebody on something.',
        topic: 'office',
        level: 'a1'
      },
      {
        content_item_id: actualContentId,
        word: 'postpone',
        word_normalized: 'postpone',
        part_of_speech: 'verb',
        ipa: '/pəʊstˈpəʊn/',
        meaning_vi: 'hoãn lại, dời lịch',
        example: 'We decided to postpone the kickoff meeting until next Monday.',
        note: 'Đồng nghĩa với phrasal verb "put off".',
        topic: 'office',
        level: 'a1'
      }
    ];

    const { error: vocabErr } = await supabase.from('vocabulary_items').upsert(vocabSeed, { onConflict: 'word_normalized' });
    if (vocabErr) {
      console.warn('Notice upserting vocabulary_items:', vocabErr.message);
    } else {
      console.log(`✓ ${vocabSeed.length} curated vocabulary items upserted into vocabulary_items table`);
    }
  } else {
    console.log('vocabulary_items table not in schema cache yet (SQL migration 20261019_phase_6_vocabulary_review.sql can be applied in Supabase SQL editor)');
  }

  console.log('Phase 6 seeding finished successfully!');
}

main().catch(err => {
  console.error('Fatal error seeding Phase 6:', err);
  process.exit(1);
});
