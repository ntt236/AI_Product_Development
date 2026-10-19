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
  console.log('Seeding listening sample lesson...');

  // 1. Content Item
  const contentItem = {
    id: '11111111-1111-4111-a111-000000000003',
    slug: 'listening-daily-conversations-introducing-yourself',
    title: 'Luyện nghe Hội thoại chào hỏi và Hỏi thông tin cá nhân (Introducing Yourself)',
    description: 'Luyện nghe đoạn hội thoại giới thiệu bản thân giữa David và Sarah, nhận diện thông tin cá nhân, nơi chốn và sở thích qua các câu hỏi trắc nghiệm.',
    content_type: 'listening',
    skill: 'listening',
    level: 'a1',
    estimated_minutes: 20,
    body: {
      overview: 'Nghe hiểu cuộc hội thoại giới thiệu bản thân tự nhiên giữa 2 người bạn mới quen; nắm bắt các thông tin cốt lõi gồm tên gọi, nơi sinh/quê quán, nơi ở hiện tại và sở thích cá nhân.',
      audio_url: '/audio/daily-conversations-introducing-yourself.wav',
      audio_duration_seconds: 38,
      tips: [
        'Lắng nghe các cấu trúc bắt đầu câu như "My name is...", "I am originally from...", "I currently live in...".',
        'Chú ý phân biệt giữa nơi sinh (born in), quê gốc (originally from) và nơi ở hiện tại (currently live in).',
        'Để ý các từ khóa chỉ sở thích: "reading novels", "photography", "playing acoustic guitar", "cooking Italian food".'
      ],
      dialogue: [
        {
          speaker: 'David',
          text: 'Hello! My name is David. It is very nice to meet you.',
          translation_vi: 'Xin chào! Tôi tên là David. Rất vui được gặp bạn.'
        },
        {
          speaker: 'Sarah',
          text: 'Hi David! I am Sarah. Nice to meet you too.',
          translation_vi: 'Chào David! Tôi là Sarah. Rất vui được gặp bạn.'
        },
        {
          speaker: 'David',
          text: 'Where are you from, Sarah?',
          translation_vi: 'Bạn đến từ đâu vậy, Sarah?'
        },
        {
          speaker: 'Sarah',
          text: 'I am originally from Chicago, but I currently live in New York. How about you?',
          translation_vi: 'Tôi quê gốc ở Chicago, nhưng hiện tại tôi đang sống ở New York. Còn bạn thì sao?'
        },
        {
          speaker: 'David',
          text: 'I was born in London, but I moved to New York two years ago for work. What do you like to do in your free time?',
          translation_vi: 'Tôi sinh ra ở London, nhưng tôi đã chuyển đến New York cách đây hai năm để làm việc. Bạn thích làm gì trong thời gian rảnh rỗi?'
        },
        {
          speaker: 'Sarah',
          text: 'I love reading novels and doing photography on weekends. And you, David?',
          translation_vi: 'Tôi rất thích đọc tiểu thuyết và chụp ảnh vào dịp cuối tuần. Còn bạn thì sao, David?'
        },
        {
          speaker: 'David',
          text: 'In my free time, I really enjoy playing acoustic guitar and cooking Italian food. It was great talking with you, Sarah!',
          translation_vi: 'Vào thời gian rảnh, tôi rất thích chơi đàn acoustic guitar và nấu món ăn Ý. Thật tuyệt khi được trò chuyện cùng bạn, Sarah!'
        },
        {
          speaker: 'Sarah',
          text: 'Great talking with you too, David! Have a wonderful day!',
          translation_vi: 'Tôi cũng rất vui khi được trò chuyện với bạn, David! Chúc bạn một ngày tuyệt vời nhé!'
        }
      ],
      transcript: 'David: Hello! My name is David. It is very nice to meet you.\nSarah: Hi David! I am Sarah. Nice to meet you too.\nDavid: Where are you from, Sarah?\nSarah: I am originally from Chicago, but I currently live in New York. How about you?\nDavid: I was born in London, but I moved to New York two years ago for work. What do you like to do in your free time?\nSarah: I love reading novels and doing photography on weekends. And you, David?\nDavid: In my free time, I really enjoy playing acoustic guitar and cooking Italian food. It was great talking with you, Sarah!\nSarah: Great talking with you too, David! Have a wonderful day!'
    },
    is_published: true
  };

  const { error: itemErr } = await supabase.from('content_items').upsert(contentItem, { onConflict: 'slug' });
  if (itemErr) {
    console.error('Error upserting content item:', itemErr);
    process.exit(1);
  }
  console.log('✓ Content item upserted successfully');

  // 2. Exercises & Confidential Answers
  const exercises = [
    {
      id: '11111111-2222-4111-a111-000000000011',
      content_item_id: contentItem.id,
      exercise_type: 'multiple_choice',
      prompt: 'David sinh ra ở thành phố nào?',
      context_text: 'Nghe kỹ lời giới thiệu của David về nơi sinh và lý do chuyển đi.',
      options: [
        { id: 'opt_3a', text: 'London' },
        { id: 'opt_3b', text: 'New York' },
        { id: 'opt_3c', text: 'Chicago' },
        { id: 'opt_3d', text: 'Los Angeles' }
      ],
      position: 1,
      weight: 1.0,
      answer: {
        correct_option_id: 'opt_3a',
        explanation: 'Trong đoạn hội thoại, David nói: "I was born in London, but I moved to New York two years ago for work." Vì vậy, nơi David sinh ra là London.'
      }
    },
    {
      id: '11111111-2222-4111-a111-000000000012',
      content_item_id: contentItem.id,
      exercise_type: 'multiple_choice',
      prompt: 'Quê gốc (nơi xuất thân ban đầu) của Sarah ở đâu?',
      context_text: 'Chú ý cụm từ "originally from" trong câu trả lời của Sarah.',
      options: [
        { id: 'opt_4a', text: 'New York' },
        { id: 'opt_4b', text: 'Chicago' },
        { id: 'opt_4c', text: 'Boston' },
        { id: 'opt_4d', text: 'London' }
      ],
      position: 2,
      weight: 1.0,
      answer: {
        correct_option_id: 'opt_4b',
        explanation: 'Sarah nói rõ: "I am originally from Chicago, but I currently live in New York." Cụm từ "originally from" chỉ nơi xuất thân ban đầu (quê quán) là Chicago.'
      }
    },
    {
      id: '11111111-2222-4111-a111-000000000013',
      content_item_id: contentItem.id,
      exercise_type: 'multiple_choice',
      prompt: 'Hiện tại cả David và Sarah đều đang sinh sống tại thành phố nào?',
      context_text: 'So sánh nơi ở hiện tại của cả hai nhân vật được đề cập trong cuộc trò chuyện.',
      options: [
        { id: 'opt_5a', text: 'London' },
        { id: 'opt_5b', text: 'Chicago' },
        { id: 'opt_5c', text: 'New York' },
        { id: 'opt_5d', text: 'Seattle' }
      ],
      position: 3,
      weight: 1.0,
      answer: {
        correct_option_id: 'opt_5c',
        explanation: 'Sarah cho biết: "I currently live in New York", và David cũng cho biết: "I moved to New York two years ago for work." Như vậy cả hai hiện tại đều đang sinh sống tại New York.'
      }
    },
    {
      id: '11111111-2222-4111-a111-000000000014',
      content_item_id: contentItem.id,
      exercise_type: 'multiple_choice',
      prompt: 'Sarah thích làm gì vào thời gian rảnh rỗi hoặc cuối tuần?',
      context_text: 'Nghe câu trả lời của Sarah khi David hỏi: "What do you like to do in your free time?"',
      options: [
        { id: 'opt_6a', text: 'Nấu món Ý và làm vườn' },
        { id: 'opt_6b', text: 'Chơi đàn guitar và nghe nhạc' },
        { id: 'opt_6c', text: 'Đọc tiểu thuyết và chụp ảnh' },
        { id: 'opt_6d', text: 'Đi du lịch và leo núi' }
      ],
      position: 4,
      weight: 1.0,
      answer: {
        correct_option_id: 'opt_6c',
        explanation: 'Sarah trả lời: "I love reading novels and doing photography on weekends." (Đọc tiểu thuyết và chụp ảnh vào cuối tuần).'
      }
    },
    {
      id: '11111111-2222-4111-a111-000000000015',
      content_item_id: contentItem.id,
      exercise_type: 'multiple_choice',
      prompt: 'David có sở thích nào sau đây trong thời gian rảnh rỗi?',
      context_text: 'Nghe câu trả lời của David sau khi Sarah hỏi lại: "And you, David?"',
      options: [
        { id: 'opt_7a', text: 'Chơi đàn acoustic guitar và nấu món Ý' },
        { id: 'opt_7b', text: 'Chơi piano và vẽ tranh' },
        { id: 'opt_7c', text: 'Đi bơi và xem phim điện ảnh' },
        { id: 'opt_7d', text: 'Đọc sách lịch sử và chạy bộ' }
      ],
      position: 5,
      weight: 1.0,
      answer: {
        correct_option_id: 'opt_7a',
        explanation: 'David chia sẻ: "In my free time, I really enjoy playing acoustic guitar and cooking Italian food." (Chơi đàn acoustic guitar và nấu món ăn Ý).'
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

    const { error: ansErr } = await supabase.from('practice_exercise_answers').upsert({
      exercise_id: ex.id,
      correct_option_id: answer.correct_option_id,
      explanation: answer.explanation
    }, { onConflict: 'exercise_id' });

    if (ansErr) {
      console.error(`Error upserting answer for exercise ${ex.id}:`, ansErr);
      process.exit(1);
    }
  }

  // 3. Update existing learning path items
  const { data: updatedTopics, error: updateErr } = await supabase
    .from('learning_path_items')
    .update({
      content_status: 'available',
      metadata: { content_item_slug: 'listening-daily-conversations-introducing-yourself' },
      updated_at: new Date().toISOString()
    })
    .eq('skill', 'listening')
    .ilike('title', '%hội thoại chào hỏi%')
    .select('id, title, content_status');

  if (updateErr) {
    console.warn('Warning updating learning_path_items:', updateErr);
  } else {
    console.log(`✓ Synchronized ${updatedTopics?.length || 0} existing learning path topics to 'available'`);
  }

  console.log(`✓ ${exercises.length} exercises and answers upserted successfully`);
  console.log('Seeding completed successfully!');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
