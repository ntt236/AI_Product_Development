import fs from 'fs';

// Read .env.local
const env = {};
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

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in .env.local');
  process.exit(1);
}

const headers = {
  apikey: supabaseKey,
  Authorization: `Bearer ${supabaseKey}`,
  'Content-Type': 'application/json',
  Prefer: 'return=representation',
};

async function postRest(endpoint, body) {
  const res = await fetch(`${supabaseUrl}/rest/v1/${endpoint}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`POST /${endpoint} error (${res.status}): ${txt}`);
  }
  return res.json();
}

async function upsertAssessment(assessment) {
  // Check if exists
  const checkRes = await fetch(`${supabaseUrl}/rest/v1/assessments?slug=eq.${assessment.slug}&select=id`, {
    headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` },
  });
  const existing = await checkRes.json();
  if (existing && existing.length > 0) {
    const id = existing[0].id;
    // Update
    await fetch(`${supabaseUrl}/rest/v1/assessments?id=eq.${id}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(assessment),
    });
    return id;
  } else {
    const created = await postRest('assessments', assessment);
    return created[0].id;
  }
}

async function cleanOldQuestions(assessmentId) {
  await fetch(`${supabaseUrl}/rest/v1/assessment_questions?assessment_id=eq.${assessmentId}`, {
    method: 'DELETE',
    headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` },
  });
}

async function batchInsertQuestionsAndAnswers(questions, answers) {
  // Insert in chunks of 40
  const chunkSize = 40;
  for (let i = 0; i < questions.length; i += chunkSize) {
    const qChunk = questions.slice(i, i + chunkSize);
    const createdQuestions = await postRest('assessment_questions', qChunk);

    const aChunk = createdQuestions.map((cq, idx) => {
      const originalAnswer = answers[i + idx];
      return {
        question_id: cq.id,
        correct_option_id: originalAnswer.correct_option_id,
        explanation: originalAnswer.explanation,
      };
    });

    await postRest('assessment_question_answers', aChunk);
    process.stdout.write(`.`);
  }
  console.log(` Done (${questions.length} questions & answer keys seeded).`);
}

async function main() {
  console.log('🚀 Seeding Phase 8 TOEIC Assessments, Question Banks and Answer Keys...');

  // ---------------------------------------------------------------------------
  // 1. FULL TEST 01 (200 Questions / 120 Minutes)
  // ---------------------------------------------------------------------------
  console.log('\n--- 1. TOEIC Full Practice Test 01 (200 Questions) ---');
  const fullTestId = await upsertAssessment({
    slug: 'toeic-full-test-01',
    title: 'TOEIC Full Practice Test 01 (Mô phỏng chuẩn 200 câu / 120 phút)',
    description: 'Đề thi thử TOEIC hoàn chỉnh chuẩn format ETS: 100 câu Listening (Part 1–4) và 100 câu Reading (Part 5–7). Chấm điểm server-side, quy đổi 10–990 và phân tích điểm yếu.',
    assessment_type: 'toeic',
    time_limit_seconds: 7200,
    total_questions: 200,
    is_published: true,
  });

  await cleanOldQuestions(fullTestId);

  const fullQuestions = [];
  const fullAnswers = [];

  // Generate 200 questions:
  for (let qNum = 1; qNum <= 200; qNum++) {
    let partNumber = 1;
    let skill = 'listening';
    let prompt = '';
    let contextText = null;
    let audioUrl = null;
    let options = [];
    let correct = 'A';
    let explanation = '';

    if (qNum <= 6) {
      partNumber = 1;
      skill = 'listening';
      audioUrl = qNum % 2 === 1 ? '/audio/toeic/part1_photo_1.wav' : '/audio/toeic/part1_photo_2.wav';
      contextText = qNum % 2 === 1 ? '/images/toeic/part1_photo_1.svg' : '/images/toeic/part1_photo_2.svg';
      prompt = `Look at the photograph marked number ${qNum} in your test book and listen to the four statements.`;
      options = [
        { id: 'A', text: '(A) A man is typing on a laptop computer.' },
        { id: 'B', text: '(B) A man is drinking coffee in a cafe.' },
        { id: 'C', text: '(C) He is cleaning the glass table.' },
        { id: 'D', text: '(D) He is putting on his business suit.' },
      ];
      correct = qNum % 2 === 1 ? 'A' : 'B';
      explanation = qNum % 2 === 1
        ? 'Phương án (A) mô tả chính xác hành động người đàn ông đang gõ máy tính tại bàn làm việc.'
        : 'Phương án (B) mô tả đúng các kỹ sư đang xem xét bản thiết kế tại công trường xây dựng.';
    } else if (qNum <= 31) {
      partNumber = 2;
      skill = 'listening';
      audioUrl = qNum % 2 === 0 ? '/audio/toeic/part2_q7.wav' : '/audio/toeic/part2_q8.wav';
      prompt = `Listen to the question or statement and choose the best response (A, B, or C).`;
      options = [
        { id: 'A', text: '(A) Yes, yesterday afternoon.' },
        { id: 'B', text: '(B) On the conference room table.' },
        { id: 'C', text: '(C) At ten o\'clock sharp.' },
      ];
      correct = qNum % 2 === 0 ? 'B' : 'C';
      explanation = qNum % 2 === 0
        ? 'Câu hỏi Where (Ở đâu) được trả lời phù hợp nhất bằng địa điểm "On the conference room table".'
        : 'Câu hỏi When (Khi nào) được trả lời phù hợp nhất bằng mốc thời gian "Right after the coffee break".';
    } else if (qNum <= 70) {
      partNumber = 3;
      skill = 'listening';
      audioUrl = '/audio/toeic/part3_dialogue_1.wav';
      const groupNum = Math.floor((qNum - 32) / 3) + 1;
      const subIdx = (qNum - 32) % 3;
      contextText = `Questions 32-34 refer to conversation between project managers James and Maria regarding budget approvals and presentation slides.`;
      if (subIdx === 0) {
        prompt = `What is the woman waiting to receive?`;
        options = [
          { id: 'A', text: 'A design budget spreadsheet' },
          { id: 'B', text: 'A signed lease contract' },
          { id: 'C', text: 'A revised flight itinerary' },
          { id: 'D', text: 'A conference room reservation' },
        ];
        correct = 'A';
        explanation = 'Người phụ nữ nói cô đang đợi bảng tính ngân sách thiết kế từ phòng marketing.';
      } else if (subIdx === 1) {
        prompt = `What time is the team meeting scheduled?`;
        options = [
          { id: 'A', text: 'At 12:00 PM' },
          { id: 'B', text: 'At 3:00 PM' },
          { id: 'C', text: 'At 4:00 PM' },
          { id: 'D', text: 'At 5:30 PM' },
        ];
        correct = 'C';
        explanation = 'Người đàn ông nêu rõ cuộc họp với phó chủ tịch bắt đầu lúc 4 giờ (four PM).';
      } else {
        prompt = `What will the woman do next?`;
        options = [
          { id: 'A', text: 'Call the printer vendor' },
          { id: 'B', text: 'Prepare the executive summary slides' },
          { id: 'C', text: 'Postpone the client interview' },
          { id: 'D', text: 'Order lunch for the visitors' },
        ];
        correct = 'B';
        explanation = 'Người phụ nữ đồng ý ngay việc chuẩn bị các slide tóm tắt ngay khi nhận được file.';
      }
    } else if (qNum <= 100) {
      partNumber = 4;
      skill = 'listening';
      audioUrl = '/audio/toeic/part4_talk_1.wav';
      const subIdx = (qNum - 71) % 3;
      contextText = `Questions refer to an airport gate announcement for Flight 402 departing to Chicago O'Hare.`;
      if (subIdx === 0) {
        prompt = `Where is the announcement most likely taking place?`;
        options = [
          { id: 'A', text: 'At a train depot' },
          { id: 'B', text: 'At an airport departure gate' },
          { id: 'C', text: 'Onboard a cruise ferry' },
          { id: 'D', text: 'In a hotel conference center' },
        ];
        correct = 'B';
        explanation = 'Thông báo đề cập chuyến bay SkyAir Flight 402, cửa ra máy bay (gate B12 / C8).';
      } else if (subIdx === 1) {
        prompt = `Why has the flight departure been delayed?`;
        options = [
          { id: 'A', text: 'Inclement stormy weather' },
          { id: 'B', text: 'Late inbound aircraft and maintenance' },
          { id: 'C', text: 'Runway resurfacing work' },
          { id: 'D', text: 'Air traffic controller strike' },
        ];
        correct = 'B';
        explanation = 'Người nói thông báo máy bay đến trễ và bảo trì mặt đất bất ngờ (ground maintenance).';
      } else {
        prompt = `What are passengers traveling with small children asked to do?`;
        options = [
          { id: 'A', text: 'Claim their checked baggage' },
          { id: 'B', text: 'Proceed immediately to gate C8' },
          { id: 'C', text: 'Rebook on a morning flight' },
          { id: 'D', text: 'Present passports at customs' },
        ];
        correct = 'B';
        explanation = 'Hành khách có trẻ nhỏ hoặc cần hỗ trợ được yêu cầu di chuyển đến cửa C8 ngay.';
      }
    } else if (qNum <= 130) {
      partNumber = 5;
      skill = 'reading';
      const p5Bank = [
        {
          p: 'The executive committee decided to ______ the annual product launch until next quarter.',
          opts: [{ id: 'A', text: 'postpone' }, { id: 'B', text: 'postponed' }, { id: 'C', text: 'postponement' }, { id: 'D', text: 'postponing' }],
          c: 'A',
          exp: 'Sau cấu trúc "decide to" cần một động từ nguyên mẫu có to (bare infinitive: postpone).'
        },
        {
          p: 'Ms. Henderson presented the quarterly sales forecast ______ and answered all questions with confidence.',
          opts: [{ id: 'A', text: 'clear' }, { id: 'B', text: 'clearly' }, { id: 'C', text: 'clearness' }, { id: 'D', text: 'clearing' }],
          c: 'B',
          exp: 'Vị trí này bổ nghĩa cho động từ "presented" nên cần trạng từ chỉ thể cách (clearly).'
        },
        {
          p: 'All employees traveling on company business must submit ______ expense receipts within five business days.',
          opts: [{ id: 'A', text: 'their' }, { id: 'B', text: 'they' }, { id: 'C', text: 'theirs' }, { id: 'D', text: 'themselves' }],
          c: 'A',
          exp: 'Cần tính từ sở hữu đứng trước cụm danh từ "expense receipts" -> "their expense receipts".'
        },
        {
          p: 'The technical support team resolved the network disruption ______ within twenty minutes.',
          opts: [{ id: 'A', text: 'efficient' }, { id: 'B', text: 'efficiently' }, { id: 'C', text: 'efficiency' }, { id: 'D', text: 'efficiencies' }],
          c: 'B',
          exp: 'Bổ nghĩa cho động từ "resolved" cần trạng từ "efficiently" (một cách hiệu quả).'
        },
        {
          p: 'Applicants who have ______ knowledge of digital marketing will be given first priority.',
          opts: [{ id: 'A', text: 'extensive' }, { id: 'B', text: 'extension' }, { id: 'C', text: 'extensively' }, { id: 'D', text: 'extend' }],
          c: 'A',
          exp: 'Trước danh từ "knowledge" cần một tính từ "extensive" (sâu rộng).'
        }
      ];
      const item = p5Bank[(qNum - 101) % p5Bank.length];
      prompt = `Question ${qNum}: ${item.p}`;
      options = item.opts;
      correct = item.c;
      explanation = item.exp;
    } else if (qNum <= 146) {
      partNumber = 6;
      skill = 'reading';
      contextText = `MEMORANDUM\nTo: All Department Heads\nFrom: Facilities Management\nDate: October 22\nSubject: Scheduled Elevator Maintenance\n\nPlease be advised that our main passenger elevators will undergo mandatory safety inspections this Saturday. During this time, access to the upper levels will be restricted to the stairwells. We apologize for any inconvenience caused.`;
      const p6Bank = [
        {
          p: `Please ______ all staff members to secure sensitive documents before leaving on Friday.`,
          opts: [{ id: 'A', text: 'remind' }, { id: 'B', text: 'reminder' }, { id: 'C', text: 'reminded' }, { id: 'D', text: 'reminding' }],
          c: 'A',
          exp: 'Sau "Please" là câu mệnh lệnh dùng động từ nguyên mẫu: "Please remind".'
        },
        {
          p: `The inspection will be conducted by a certified ______ contractor.`,
          opts: [{ id: 'A', text: 'external' }, { id: 'B', text: 'externally' }, { id: 'C', text: 'externality' }, { id: 'D', text: 'exterior' }],
          c: 'A',
          exp: 'Đứng trước danh từ "contractor" cần tính từ "external" (nhà thầu bên ngoài).'
        },
        {
          p: `Normal operation is expected to resume ______ 8:00 AM on Monday morning.`,
          opts: [{ id: 'A', text: 'by' }, { id: 'B', text: 'under' }, { id: 'C', text: 'between' }, { id: 'D', text: 'among' }],
          c: 'A',
          exp: 'Giới từ "by" dùng với mốc thời gian diễn tả thời hạn "trước hoặc vào lúc 8h sáng".'
        },
        {
          p: `Which sentence best fits into the paragraph?`,
          opts: [
            { id: 'A', text: 'Emergency technicians will remain on standby throughout the weekend.' },
            { id: 'B', text: 'The company cafeteria will offer discounted coffee vouchers.' },
            { id: 'C', text: 'Employees must purchase new parking permits immediately.' },
            { id: 'D', text: 'Flight reservations can be modified without extra cancellation fees.' }
          ],
          c: 'A',
          exp: 'Câu A phù hợp ngữ cảnh an toàn và bảo trì tòa nhà vào cuối tuần.'
        }
      ];
      const item = p6Bank[(qNum - 131) % p6Bank.length];
      prompt = `Question ${qNum}: ${item.p}`;
      options = item.opts;
      correct = item.c;
      explanation = item.exp;
    } else {
      partNumber = 7;
      skill = 'reading';
      contextText = `EMAIL MESSAGE\nFrom: customer-care@apexlogistics.com\nTo: robert.miller@globalventures.com\nDate: October 21\nSubject: Order Shipment Confirmation #AX-9402\n\nDear Mr. Miller,\n\nWe are pleased to inform you that your purchase order #AX-9402 for twelve ergonomic office chairs has been dispatched from our regional warehouse today. The carrier tracking number is 884-920-112. Estimated delivery to your downtown branch is Thursday, October 24.\n\nShould you have any inquiries regarding assembly or warranty support, please contact our 24/7 client relations hotline at 1-800-555-APEX.\n\nThank you for choosing Apex Logistics.`;
      const p7Bank = [
        {
          p: 'What is the primary purpose of the email?',
          opts: [
            { id: 'A', text: 'To notify a customer about an item shipment' },
            { id: 'B', text: 'To request payment for an overdue invoice' },
            { id: 'C', text: 'To announce the opening of a new regional warehouse' },
            { id: 'D', text: 'To advertise a seasonal discount on office furniture' }
          ],
          c: 'A',
          exp: 'Dòng Subject và câu mở đầu nêu rõ mục đích thông báo gửi hàng (dispatched from our warehouse).'
        },
        {
          p: 'When is the shipment expected to arrive?',
          opts: [
            { id: 'A', text: 'On Monday, October 21' },
            { id: 'B', text: 'On Tuesday, October 22' },
            { id: 'C', text: 'On Thursday, October 24' },
            { id: 'D', text: 'On Friday, October 25' },
          ],
          c: 'C',
          exp: 'Văn bản ghi: "Estimated delivery to your downtown branch is Thursday, October 24".'
        },
        {
          p: 'What is indicated about the office chairs?',
          opts: [
            { id: 'A', text: 'They are covered by warranty support' },
            { id: 'B', text: 'They must be assembled by factory technicians' },
            { id: 'C', text: 'They are currently out of stock' },
            { id: 'D', text: 'They were manufactured in Chicago' }
          ],
          c: 'A',
          exp: 'Email có đoạn "inquiries regarding assembly or warranty support", ngụ ý sản phẩm có chế độ bảo hành.'
        }
      ];
      const item = p7Bank[(qNum - 147) % p7Bank.length];
      prompt = `Question ${qNum}: ${item.p}`;
      options = item.opts;
      correct = item.c;
      explanation = item.exp;
    }

    fullQuestions.push({
      assessment_id: fullTestId,
      skill,
      category: `toeic_part_${partNumber}`,
      difficulty: partNumber <= 2 ? 2 : partNumber <= 5 ? 3 : 4,
      level: partNumber <= 2 ? 'a2' : partNumber <= 5 ? 'b1' : 'b2',
      question_type: 'multiple_choice',
      prompt,
      context_text: contextText,
      audio_url: audioUrl,
      options,
      position: qNum,
      weight: 1.0,
    });

    fullAnswers.push({
      correct_option_id: correct,
      explanation,
    });
  }

  await batchInsertQuestionsAndAnswers(fullQuestions, fullAnswers);

  // ---------------------------------------------------------------------------
  // 2. MINI TEST 01 (30 Questions / 30 Minutes)
  // ---------------------------------------------------------------------------
  console.log('\n--- 2. TOEIC Mini Test 01 (30 Questions) ---');
  const miniTestId = await upsertAssessment({
    slug: 'toeic-mini-test-01',
    title: 'TOEIC Mini Test 01 (Đánh giá nhanh 30 câu / 30 phút)',
    description: 'Bài thi rút gọn mô phỏng đủ 7 Part của bài thi TOEIC. Giúp đánh giá nhanh trình độ, dự phóng điểm thi và phát hiện phần yếu cần khắc phục.',
    assessment_type: 'toeic',
    time_limit_seconds: 1800,
    total_questions: 30,
    is_published: true,
  });

  await cleanOldQuestions(miniTestId);

  // Take 30 representative questions across 7 parts:
  // Part 1: Q1-3, Part 2: Q4-7, Part 3: Q8-11, Part 4: Q12-15, Part 5: Q16-20, Part 6: Q21-24, Part 7: Q25-30
  const miniQuestions = [];
  const miniAnswers = [];

  const miniSpec = [
    { start: 1, count: 3, sourceIdx: 0 },    // Part 1: 3 Qs
    { start: 4, count: 4, sourceIdx: 6 },    // Part 2: 4 Qs
    { start: 8, count: 4, sourceIdx: 31 },   // Part 3: 4 Qs
    { start: 12, count: 4, sourceIdx: 70 },  // Part 4: 4 Qs
    { start: 16, count: 5, sourceIdx: 100 }, // Part 5: 5 Qs
    { start: 21, count: 4, sourceIdx: 130 }, // Part 6: 4 Qs
    { start: 25, count: 6, sourceIdx: 146 }, // Part 7: 6 Qs
  ];

  let currentPos = 1;
  for (const spec of miniSpec) {
    for (let c = 0; c < spec.count; c++) {
      const srcQ = fullQuestions[spec.sourceIdx + c];
      const srcA = fullAnswers[spec.sourceIdx + c];

      miniQuestions.push({
        ...srcQ,
        assessment_id: miniTestId,
        position: currentPos++,
      });
      miniAnswers.push(srcA);
    }
  }

  await batchInsertQuestionsAndAnswers(miniQuestions, miniAnswers);

  // ---------------------------------------------------------------------------
  // 3. PART PRACTICE SETS (Parts 1 to 7)
  // ---------------------------------------------------------------------------
  console.log('\n--- 3. TOEIC Part Practice Sets (Parts 1–7) ---');
  const partPracticeConfigs = [
    { part: 1, title: 'Part 1 Practice: Photographs', minutes: 10, count: 6, startIdx: 0 },
    { part: 2, title: 'Part 2 Practice: Question-Response', minutes: 15, count: 10, startIdx: 6 },
    { part: 3, title: 'Part 3 Practice: Short Conversations', minutes: 15, count: 9, startIdx: 31 },
    { part: 4, title: 'Part 4 Practice: Short Talks', minutes: 15, count: 9, startIdx: 70 },
    { part: 5, title: 'Part 5 Practice: Incomplete Sentences', minutes: 20, count: 15, startIdx: 100 },
    { part: 6, title: 'Part 6 Practice: Text Completion', minutes: 15, count: 8, startIdx: 130 },
    { part: 7, title: 'Part 7 Practice: Reading Comprehension', minutes: 25, count: 10, startIdx: 146 },
  ];

  for (const cfg of partPracticeConfigs) {
    const slug = `toeic-part-${cfg.part}-practice`;
    const partTestId = await upsertAssessment({
      slug,
      title: cfg.title,
      description: `Luyện tập chuyên sâu Part ${cfg.part} theo định dạng chuẩn đề thi TOEIC. Xem lời giải chi tiết và audio script ngay sau khi nộp bài.`,
      assessment_type: 'toeic',
      time_limit_seconds: cfg.minutes * 60,
      total_questions: cfg.count,
      is_published: true,
    });

    await cleanOldQuestions(partTestId);

    const partQs = [];
    const partAs = [];
    for (let i = 0; i < cfg.count; i++) {
      const srcQ = fullQuestions[cfg.startIdx + i];
      const srcA = fullAnswers[cfg.startIdx + i];
      partQs.push({
        ...srcQ,
        assessment_id: partTestId,
        position: i + 1,
      });
      partAs.push(srcA);
    }

    process.stdout.write(`Seeding Part ${cfg.part}... `);
    await batchInsertQuestionsAndAnswers(partQs, partAs);
  }

  console.log('\n🎉 Successfully seeded all Phase 8 TOEIC Assessments, Question Sets and Answers!');
}

main().catch(err => {
  console.error('Fatal error during TOEIC seed:', err);
  process.exit(1);
});
