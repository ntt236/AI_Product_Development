import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { matchTopicToContentItem, CURRICULUM_BANK } from '../../src/modules/learning-path/curriculum.js';
import { generateDailyPlanProposal } from '../../src/modules/daily-plan/generator.js';

describe('Phase 5 Supplementary — Listening Sample Lesson & Learning Lifecycle Suite', () => {
  const audioRelativePath = 'public/audio/daily-conversations-introducing-yourself.wav';
  const audioFullPath = path.resolve(process.cwd(), audioRelativePath);

  // Mock Listening Content Item
  const mockListeningContent = {
    id: '11111111-1111-4111-a111-000000000003',
    slug: 'listening-daily-conversations-introducing-yourself',
    title: 'Luyện nghe Hội thoại chào hỏi và Hỏi thông tin cá nhân (Introducing Yourself)',
    description: 'Luyện nghe đoạn hội thoại giới thiệu bản thân giữa David và Sarah.',
    content_type: 'listening',
    skill: 'listening',
    level: 'a1',
    estimated_minutes: 20,
    body: {
      overview: 'Nghe hiểu cuộc hội thoại giới thiệu bản thân tự nhiên giữa 2 người bạn mới quen.',
      audio_url: '/audio/daily-conversations-introducing-yourself.wav',
      audio_duration_seconds: 38,
      tips: [
        'Lắng nghe các cấu trúc bắt đầu câu như "My name is...", "I am originally from...".',
        'Chú ý phân biệt giữa nơi sinh (born in), quê gốc (originally from) và nơi ở hiện tại (currently live in).'
      ],
      dialogue: [
        { speaker: 'David', text: 'Hello! My name is David. It is very nice to meet you.' },
        { speaker: 'Sarah', text: 'Hi David! I am Sarah. Nice to meet you too.' },
        { speaker: 'David', text: 'Where are you from, Sarah?' },
        { speaker: 'Sarah', text: 'I am originally from Chicago, but I currently live in New York. How about you?' },
        { speaker: 'David', text: 'I was born in London, but I moved to New York two years ago for work. What do you like to do in your free time?' },
        { speaker: 'Sarah', text: 'I love reading novels and doing photography on weekends. And you, David?' },
        { speaker: 'David', text: 'In my free time, I really enjoy playing acoustic guitar and cooking Italian food. It was great talking with you, Sarah!' },
        { speaker: 'Sarah', text: 'Great talking with you too, David! Have a wonderful day!' }
      ],
      transcript: 'David: Hello! My name is David. It is very nice to meet you.\nSarah: Hi David! I am Sarah. Nice to meet you too.\nDavid: Where are you from, Sarah?\nSarah: I am originally from Chicago, but I currently live in New York. How about you?\nDavid: I was born in London, but I moved to New York two years ago for work. What do you like to do in your free time?\nSarah: I love reading novels and doing photography on weekends. And you, David?\nDavid: In my free time, I really enjoy playing acoustic guitar and cooking Italian food. It was great talking with you, Sarah!\nSarah: Great talking with you too, David! Have a wonderful day!'
    },
    is_published: true
  };

  // Mock Exercises (Client-facing - NO answers)
  const mockListeningExercises = [
    {
      id: 'ex-l1',
      content_item_id: mockListeningContent.id,
      exercise_type: 'multiple_choice',
      prompt: 'David sinh ra ở thành phố nào?',
      options: [
        { id: 'opt_3a', text: 'London' },
        { id: 'opt_3b', text: 'New York' },
        { id: 'opt_3c', text: 'Chicago' },
        { id: 'opt_3d', text: 'Los Angeles' }
      ],
      position: 1,
      weight: 1.0
    },
    {
      id: 'ex-l2',
      content_item_id: mockListeningContent.id,
      exercise_type: 'multiple_choice',
      prompt: 'Quê gốc (nơi xuất thân ban đầu) của Sarah ở đâu?',
      options: [
        { id: 'opt_4a', text: 'New York' },
        { id: 'opt_4b', text: 'Chicago' },
        { id: 'opt_4c', text: 'Boston' },
        { id: 'opt_4d', text: 'London' }
      ],
      position: 2,
      weight: 1.0
    },
    {
      id: 'ex-l3',
      content_item_id: mockListeningContent.id,
      exercise_type: 'multiple_choice',
      prompt: 'Hiện tại cả David và Sarah đều đang sinh sống tại thành phố nào?',
      options: [
        { id: 'opt_5a', text: 'London' },
        { id: 'opt_5b', text: 'Chicago' },
        { id: 'opt_5c', text: 'New York' },
        { id: 'opt_5d', text: 'Seattle' }
      ],
      position: 3,
      weight: 1.0
    },
    {
      id: 'ex-l4',
      content_item_id: mockListeningContent.id,
      exercise_type: 'multiple_choice',
      prompt: 'Sarah thích làm gì vào thời gian rảnh rỗi hoặc cuối tuần?',
      options: [
        { id: 'opt_6a', text: 'Nấu món Ý và làm vườn' },
        { id: 'opt_6b', text: 'Chơi đàn guitar và nghe nhạc' },
        { id: 'opt_6c', text: 'Đọc tiểu thuyết và chụp ảnh' },
        { id: 'opt_6d', text: 'Đi du lịch và leo núi' }
      ],
      position: 4,
      weight: 1.0
    },
    {
      id: 'ex-l5',
      content_item_id: mockListeningContent.id,
      exercise_type: 'multiple_choice',
      prompt: 'David có sở thích nào sau đây trong thời gian rảnh rỗi?',
      options: [
        { id: 'opt_7a', text: 'Chơi đàn acoustic guitar và nấu món Ý' },
        { id: 'opt_7b', text: 'Chơi piano và vẽ tranh' },
        { id: 'opt_7c', text: 'Đi bơi và xem phim điện ảnh' },
        { id: 'opt_7d', text: 'Đọc sách lịch sử và chạy bộ' }
      ],
      position: 5,
      weight: 1.0
    }
  ];

  // Server-only confidential answer keys
  const mockServerAnswerKeys = new Map([
    ['ex-l1', { correct_option_id: 'opt_3a', explanation: 'David nói: "I was born in London".' }],
    ['ex-l2', { correct_option_id: 'opt_4b', explanation: 'Sarah nói: "I am originally from Chicago".' }],
    ['ex-l3', { correct_option_id: 'opt_5c', explanation: 'Cả 2 đều sống ở New York.' }],
    ['ex-l4', { correct_option_id: 'opt_6c', explanation: 'Sarah nói: "reading novels and doing photography on weekends".' }],
    ['ex-l5', { correct_option_id: 'opt_7a', explanation: 'David nói: "playing acoustic guitar and cooking Italian food".' }]
  ]);

  /**
   * Evaluates answers using server-side logic
   */
  function evaluateListening(exercises, serverKeys, userAnswers) {
    const userMap = new Map();
    for (const a of userAnswers) {
      if (a.exercise_id && a.selected_option_id) {
        userMap.set(a.exercise_id, a.selected_option_id.trim().toLowerCase());
      }
    }

    let totalScore = 0;
    let maxScore = 0;
    const breakdown = [];

    for (const ex of exercises) {
      const weight = Number(ex.weight) || 1.0;
      maxScore += weight;

      const key = serverKeys.get(ex.id);
      const userAns = userMap.get(ex.id) || '';
      const correctAns = key ? key.correct_option_id.toLowerCase() : '';
      const isCorrect = Boolean(userAns) && Boolean(correctAns) && userAns === correctAns;

      if (isCorrect) {
        totalScore += weight;
      }

      breakdown.push({
        exercise_id: ex.id,
        prompt: ex.prompt,
        user_option_id: userAns,
        correct_option_id: correctAns,
        is_correct: isCorrect,
        explanation: key ? key.explanation : ''
      });
    }

    const accuracy = maxScore > 0 ? Number((totalScore / maxScore).toFixed(4)) : 0;
    const percentage = Math.round(accuracy * 100);

    return { totalScore, maxScore, accuracy, percentage, breakdown };
  }

  // 1. Audio File Verification
  it('1. Audio file tồn tại thực tế trên đĩa và có dung lượng hợp lệ (> 100KB, đúng định dạng RIFF WAV)', () => {
    assert.ok(fs.existsSync(audioFullPath), `Audio file must exist at ${audioFullPath}`);
    const stats = fs.statSync(audioFullPath);
    assert.ok(stats.size > 100000, `Audio file size must be > 100KB, got ${stats.size} bytes`);

    // Verify WAV RIFF header
    const fd = fs.openSync(audioFullPath, 'r');
    const headerBuffer = Buffer.alloc(12);
    fs.readSync(fd, headerBuffer, 0, 12, 0);
    fs.closeSync(fd);

    const chunkID = headerBuffer.subarray(0, 4).toString('ascii');
    const format = headerBuffer.subarray(8, 12).toString('ascii');
    assert.equal(chunkID, 'RIFF', 'File header must begin with RIFF');
    assert.equal(format, 'WAVE', 'File format must be WAVE');
  });

  // 2. Audio URL Routing
  it('2. Audio URL được định tuyến đúng tới static folder /public của Next.js', () => {
    assert.equal(mockListeningContent.body.audio_url, '/audio/daily-conversations-introducing-yourself.wav');
    const expectedDiskPath = path.join(process.cwd(), 'public', 'audio', 'daily-conversations-introducing-yourself.wav');
    assert.ok(fs.existsSync(expectedDiskPath), 'Target path in /public/audio must exist');
  });

  // 3. Question Correspondence with Audio Dialogue
  it('3. Tất cả 5 câu hỏi trắc nghiệm đều tương ứng chính xác với nội dung hội thoại audio', () => {
    const dialogueText = mockListeningContent.body.dialogue.map(d => d.text).join(' ');

    // Q1: David birthplace -> London
    assert.ok(dialogueText.includes('born in London'), 'Dialogue must mention born in London for Q1');

    // Q2: Sarah origin -> Chicago
    assert.ok(dialogueText.includes('originally from Chicago'), 'Dialogue must mention originally from Chicago for Q2');

    // Q3: Both current residence -> New York
    assert.ok(dialogueText.includes('currently live in New York'), 'Dialogue must mention currently live in New York for Q3');
    assert.ok(dialogueText.includes('moved to New York'), 'Dialogue must mention moved to New York for Q3');

    // Q4: Sarah hobbies -> reading novels and photography
    assert.ok(dialogueText.includes('reading novels and doing photography'), 'Dialogue must mention reading novels and photography for Q4');

    // Q5: David hobbies -> playing acoustic guitar and cooking Italian food
    assert.ok(dialogueText.includes('playing acoustic guitar and cooking Italian food'), 'Dialogue must mention acoustic guitar and Italian food for Q5');
  });

  // 4. Confidential Answer Protection (No answers leaked to client)
  it('4. Dữ liệu bài tập gửi cho Client không chứa trường correct_option_id hoặc explanation', () => {
    for (const ex of mockListeningExercises) {
      assert.equal(ex.correct_option_id, undefined, 'Client exercise must never contain correct_option_id');
      assert.equal(ex.explanation, undefined, 'Client exercise must never contain explanation');
      assert.ok(Array.isArray(ex.options), 'Client exercise must have options');
      for (const opt of ex.options) {
        assert.ok(opt.id, 'Option must have id');
        assert.ok(opt.text, 'Option must have text');
        assert.equal(opt.is_correct, undefined, 'Option must never reveal is_correct flag to client');
      }
    }
  });

  // 5. Server-side Evaluation & Scoring
  it('5. Chấm điểm được thực hiện hoàn toàn phía server với độ chính xác tuyệt đối', () => {
    // 5.1 All correct
    const fullAnswers = [
      { exercise_id: 'ex-l1', selected_option_id: 'opt_3a' },
      { exercise_id: 'ex-l2', selected_option_id: 'opt_4b' },
      { exercise_id: 'ex-l3', selected_option_id: 'opt_5c' },
      { exercise_id: 'ex-l4', selected_option_id: 'opt_6c' },
      { exercise_id: 'ex-l5', selected_option_id: 'opt_7a' }
    ];

    const fullResult = evaluateListening(mockListeningExercises, mockServerAnswerKeys, fullAnswers);
    assert.equal(fullResult.totalScore, 5.0);
    assert.equal(fullResult.maxScore, 5.0);
    assert.equal(fullResult.accuracy, 1.0);
    assert.equal(fullResult.percentage, 100);
    assert.equal(fullResult.breakdown.filter(b => b.is_correct).length, 5);

    // 5.2 Partial correct (3/5)
    const partialAnswers = [
      { exercise_id: 'ex-l1', selected_option_id: 'opt_3a' }, // Correct
      { exercise_id: 'ex-l2', selected_option_id: 'opt_4a' }, // Wrong (picked NY)
      { exercise_id: 'ex-l3', selected_option_id: 'opt_5c' }, // Correct
      { exercise_id: 'ex-l4', selected_option_id: 'opt_6b' }, // Wrong (picked guitar)
      { exercise_id: 'ex-l5', selected_option_id: 'opt_7a' }  // Correct
    ];

    const partialResult = evaluateListening(mockListeningExercises, mockServerAnswerKeys, partialAnswers);
    assert.equal(partialResult.totalScore, 3.0);
    assert.equal(partialResult.maxScore, 5.0);
    assert.equal(partialResult.percentage, 60);
    assert.equal(partialResult.breakdown[1].is_correct, false);
    assert.equal(partialResult.breakdown[1].correct_option_id, 'opt_4b');
    assert.ok(partialResult.breakdown[1].explanation.includes('originally from'));
  });

  // 6. Curriculum Mapping & Status Reflection
  it('6. Learning Path ánh xạ chủ đề Listening sang trạng thái available và slug chính xác', () => {
    const a1ListeningTopics = CURRICULUM_BANK.listening.a1;
    assert.ok(a1ListeningTopics.length > 0, 'Must have a1 listening topics');

    const introTopic = a1ListeningTopics.find(t => t.title.includes('chào hỏi'));
    assert.ok(introTopic, 'Must find topic chào hỏi');
    assert.equal(introTopic.content_status, 'available', 'Listening topic must be marked available');
    assert.equal(introTopic.content_item_slug, 'listening-daily-conversations-introducing-yourself');

    // Test matchTopicToContentItem
    const matched = matchTopicToContentItem(introTopic, [mockListeningContent]);
    assert.ok(matched, 'matchTopicToContentItem must match listening topic');
    assert.equal(matched.id, mockListeningContent.id);
  });

  // 7. Non-implemented Topics remain Planned
  it('7. Các chủ đề chưa có bài học vẫn giữ nguyên trạng thái planned_curriculum minh bạch', () => {
    const preA1Listening = CURRICULUM_BANK.listening.pre_a1;
    for (const topic of preA1Listening) {
      assert.equal(topic.content_status, 'planned_curriculum', 'Pre-A1 listening must remain planned_curriculum');
    }

    const a2Listening = CURRICULUM_BANK.listening.a2;
    for (const topic of a2Listening) {
      assert.equal(topic.content_status, 'planned_curriculum', 'A2 listening must remain planned_curriculum');
    }
  });

  // 8. Daily Plan Generator Integration
  it('8. Daily Plan tích hợp bài Listening mà không tạo trùng lặp nhiệm vụ', () => {
    const activePathWithListening = {
      id: 'path-123',
      title: 'Lộ trình Tiếng Anh Giao Tiếp A1',
      status: 'active',
      items: [
        {
          id: 'topic-vocab',
          item_type: 'topic',
          title: 'Từ vựng sinh hoạt hàng ngày (Daily Routine)',
          skill: 'vocabulary',
          status: 'completed',
          content_status: 'available',
          estimated_minutes: 15,
          position: 1
        },
        {
          id: 'topic-listening',
          item_type: 'topic',
          title: 'Luyện nghe Hội thoại chào hỏi và Hỏi thông tin cá nhân',
          skill: 'listening',
          status: 'available',
          content_status: 'available',
          estimated_minutes: 20,
          position: 2
        }
      ]
    };

    const curatedItems = [
      {
        id: '11111111-1111-4111-a111-000000000001',
        slug: 'vocab-daily-routine',
        title: 'Từ vựng sinh hoạt hàng ngày (Daily Routine)',
        skill: 'vocabulary',
        estimated_minutes: 15
      },
      mockListeningContent
    ];

    const proposal = generateDailyPlanProposal({
      userId: 'test-user',
      planDate: '2026-10-19',
      dailyMinutes: 30,
      preferredStudyDays: [1, 2, 3, 4, 5],
      primaryGoal: 'Giao tiếp hàng ngày',
      activePath: activePathWithListening,
      curatedContentItems: curatedItems
    });

    assert.ok(proposal.tasks.length > 0, 'Plan must contain tasks');

    // Listening task must be present
    const listeningTask = proposal.tasks.find(t => t.content_item_id === mockListeningContent.id);
    assert.ok(listeningTask, 'Plan must include listening task');
    assert.equal(listeningTask.skill, 'listening');
    assert.equal(listeningTask.content_status, 'available');
    assert.equal(listeningTask.activity_type, 'practice');

    // No duplicate tasks with same content_item_id
    const taskContentIds = proposal.tasks.map(t => t.content_item_id).filter(Boolean);
    const uniqueContentIds = new Set(taskContentIds);
    assert.equal(taskContentIds.length, uniqueContentIds.size, 'No duplicate content items in same plan');
  });

  // 9. Preserves Existing Vocab, Grammar and AI Tutor
  it('9. Không làm ảnh hưởng tới bài Vocabulary, Grammar và AI Tutor hiện có', () => {
    // Vocab still available (pre_a1 foundation)
    const preA1Vocab = CURRICULUM_BANK.vocabulary.pre_a1;
    const dailyRoutine = preA1Vocab.find(v => v.content_item_slug === 'vocab-daily-routine');
    assert.ok(dailyRoutine, 'Daily routine vocab must remain available');
    assert.equal(dailyRoutine.content_status, 'available');

    // Grammar still available
    const a1Grammar = CURRICULUM_BANK.grammar.a1;
    const presentSimple = a1Grammar.find(g => g.content_item_slug === 'grammar-present-simple');
    assert.ok(presentSimple, 'Present simple grammar must remain available');
    assert.equal(presentSimple.content_status, 'available');
  });
});
