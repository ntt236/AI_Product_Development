import fs from 'fs';
import path from 'path';

async function harvest() {
  console.log('=== [NTT-DATA] Starting Extraction of ETS Actual Test 01 (Q1 - Q200) ===');

  // 1. Fetch Listening Markdown
  console.log('Fetching Listening 1000 Markdown...');
  const resListening = await fetch('https://raw.githubusercontent.com/TastyHeadphones/TOEIC/main/TOEIC_%E7%B2%BE%E8%AF%BB%E8%A7%A3%E6%9E%90%E5%8C%85/01_%E5%90%AC%E5%8A%9B1000%E9%A2%98%E9%80%90%E9%A2%98%E8%A7%A3%E6%9E%90%E7%B4%A2%E5%BC%95.md');
  const listeningRaw = await resListening.text();
  const test1Listening = listeningRaw.slice(listeningRaw.indexOf('# TEST 01'), listeningRaw.indexOf('# TEST 02'));

  // 2. Fetch Reading Markdown
  console.log('Fetching Reading 1000 Markdown...');
  const resReading = await fetch('https://raw.githubusercontent.com/TastyHeadphones/TOEIC/main/TOEIC_%E7%B2%BE%E8%AF%BB%E8%A7%A3%E6%9E%90%E5%8C%85/02_%E9%98%85%E8%AF%BB1000%E9%A2%98%E9%80%90%E9%A2%98%E8%A7%A3%E6%9E%90%E7%B4%A2%E5%BC%95.md');
  const readingRaw = await resReading.text();

  // Reading answers table from PDF 448
  const readingAnswersText = readingRaw.slice(readingRaw.indexOf('## PDF 第 448 页'), readingRaw.indexOf('101\n ------- you want'));
  const readingAnswerMatches = [...readingAnswersText.matchAll(/(\d{3})\.\s*\(([A-D])\)/g)];
  const readingAnswerMap = {};
  readingAnswerMatches.forEach(m => {
    readingAnswerMap[parseInt(m[1], 10)] = m[2];
  });
  console.log(`Parsed ${Object.keys(readingAnswerMap).length} reading answer keys (101-200).`);

  // Listening answer table from Test 01 table
  const listeningAnswersText = test1Listening.slice(test1Listening.indexOf('## 答案速查表'), test1Listening.indexOf('## Part 1'));
  const listeningAnswerMatches = [...listeningAnswersText.matchAll(/\*\*(\d{1,3})\*\*\s*\|\s*([A-D])/g)];
  const listeningAnswerMap = {};
  listeningAnswerMatches.forEach(m => {
    listeningAnswerMap[parseInt(m[1], 10)] = m[2];
  });
  console.log(`Parsed ${Object.keys(listeningAnswerMap).length} listening answer keys (1-100).`);

  const questions = [];

  // ==========================================
  // PART 1 (Q1 - Q6)
  // ==========================================
  console.log('Extracting Part 1 (Q1 - Q6)...');
  const part1Section = test1Listening.slice(test1Listening.indexOf('## Part 1:'), test1Listening.indexOf('## Part 2:'));
  const p1Blocks = part1Section.split(/(?=### Q[1-6]\b)/).filter(b => b.startsWith('### Q'));
  
  for (const block of p1Blocks) {
    const qNumMatch = block.match(/### Q(\d+)/);
    if (!qNumMatch) continue;
    const qNum = parseInt(qNumMatch[1], 10);
    const correctAns = listeningAnswerMap[qNum] || 'A';
    
    const imageUrl = `/images/toeic/real_exam/toeic_part1_q${qNum}.png`;

    // Options
    const optMatches = [...block.matchAll(/-\s*\(([A-D])\)\s*([^(\n]+)(?:\(([^)]+)\))?/g)];
    const options = optMatches.map(m => ({
      id: m[1],
      text: m[2].trim()
    }));

    // Explanations / Translations
    const explanation = block.trim();

    questions.push({
      position: qNum,
      skill: 'listening',
      category: 'toeic_part_1',
      difficulty: 'medium',
      level: 'intermediate',
      question_type: 'multiple_choice',
      prompt: `Look at the photograph marked number ${qNum} in your test book and choose the best statement.`,
      context_text: imageUrl,
      image_url: imageUrl,
      audio_url: '/audio/toeic/real_exam/toeic_test_01_full.mp3',
      options: options.length === 4 ? options : [
        { id: 'A', text: 'Option A' },
        { id: 'B', text: 'Option B' },
        { id: 'C', text: 'Option C' },
        { id: 'D', text: 'Option D' }
      ],
      correct_answer: correctAns,
      explanation: `Đáp án đúng: ${correctAns}.\n\nBản dịch và ngữ nghĩa chi tiết:\n` + optMatches.map(m => `(${m[1]}) ${m[2].trim()} — ${m[3] || ''}`).join('\n'),
      transcript_text: optMatches.map(m => `(${m[1]}) ${m[2].trim()}`).join('\n')
    });
  }

  // ==========================================
  // PART 2 (Q7 - Q31)
  // ==========================================
  console.log('Extracting Part 2 (Q7 - Q31)...');
  const part2Section = test1Listening.slice(test1Listening.indexOf('## Part 2:'), test1Listening.indexOf('## Part 3:'));
  const p2Blocks = part2Section.split(/(?=### Q\d+\b)/).filter(b => b.startsWith('### Q'));

  for (const block of p2Blocks) {
    const qNumMatch = block.match(/### Q(\d+)/);
    if (!qNumMatch) continue;
    const qNum = parseInt(qNumMatch[1], 10);
    const correctAns = listeningAnswerMap[qNum] || 'A';

    // Extract prompt from question
    const promptMatch = block.match(/-\s*\*\*问题：\*\*\s*([^\n]+)/);
    const prompt = promptMatch ? promptMatch[1].replace(/\([^)]+\)/g, '').trim() : `Listen to the question and select the best response.`;

    // Options
    const optMatches = [...block.matchAll(/-\s*\(([A-C])\)\s*([^(\n]+)(?:\(([^)]+)\))?/g)];
    const options = optMatches.map(m => ({
      id: m[1],
      text: m[2].trim()
    }));

    questions.push({
      position: qNum,
      skill: 'listening',
      category: 'toeic_part_2',
      difficulty: 'medium',
      level: 'intermediate',
      question_type: 'multiple_choice',
      prompt: prompt,
      context_text: null,
      image_url: null,
      audio_url: '/audio/toeic/real_exam/toeic_test_01_full.mp3',
      options: options.length >= 3 ? options.slice(0, 3) : [
        { id: 'A', text: 'Option A' },
        { id: 'B', text: 'Option B' },
        { id: 'C', text: 'Option C' }
      ],
      correct_answer: correctAns,
      explanation: `Đáp án đúng: ${correctAns}.\n\nTranscript và giải thích:\n` + block.slice(0, 500),
      transcript_text: prompt + '\n' + optMatches.map(m => `(${m[1]}) ${m[2].trim()}`).join('\n')
    });
  }

  // ==========================================
  // PART 3 (Q32 - Q70)
  // ==========================================
  console.log('Extracting Part 3 (Q32 - Q70)...');
  const part3Section = test1Listening.slice(test1Listening.indexOf('## Part 3:'), test1Listening.indexOf('## Part 4:'));
  const p3Sets = part3Section.split(/(?=### Questions\s+\d+)/).filter(s => s.startsWith('### Questions'));

  for (const set of p3Sets) {
    const transcriptMatch = set.match(/\*\*听力独白\/对话原文：\*\*([\s\S]*?)(?=\*\*中文对照：|\*\*核心词汇|#### Q)/);
    const transcript = transcriptMatch ? transcriptMatch[1].trim() : '';

    const qBlocks = set.split(/(?=#### Q\d+\b)/).filter(b => b.startsWith('#### Q'));
    for (const qb of qBlocks) {
      const qNumMatch = qb.match(/#### Q(\d+)/);
      if (!qNumMatch) continue;
      const qNum = parseInt(qNumMatch[1], 10);
      const correctAns = listeningAnswerMap[qNum] || 'A';

      const promptMatch = qb.match(/\*\*问题：\*\*\s*([^\n]+)/);
      const prompt = promptMatch ? promptMatch[1].replace(/\([^)]+\)/g, '').trim() : 'Choose the best answer according to the conversation.';

      const optMatches = [...qb.matchAll(/-\s*\(([A-D])\)\s*([^(\n]+)(?:\(([^)]+)\))?/g)];
      const options = optMatches.map(m => ({
        id: m[1],
        text: m[2].trim()
      }));

      // Check if this question set has a graphic image
      const imgMatch = set.match(/!\[.*?\]\((?:images\/)?(listen_page_\d+\.png)\)/);
      const imageUrl = imgMatch ? `/images/toeic/real_exam/${imgMatch[1]}` : null;

      questions.push({
        position: qNum,
        skill: 'listening',
        category: 'toeic_part_3',
        difficulty: 'medium',
        level: 'intermediate',
        question_type: 'multiple_choice',
        prompt: prompt,
        context_text: `Conversation Context (Questions ${qBlocks[0].match(/Q(\d+)/)[1]} - ${qBlocks[qBlocks.length - 1].match(/Q(\d+)/)[1]})`,
        image_url: imageUrl,
        audio_url: '/audio/toeic/real_exam/toeic_test_01_full.mp3',
        options: options.length === 4 ? options : [
          { id: 'A', text: 'Option A' },
          { id: 'B', text: 'Option B' },
          { id: 'C', text: 'Option C' },
          { id: 'D', text: 'Option D' }
        ],
        correct_answer: correctAns,
        explanation: `Đáp án đúng: ${correctAns}.\n\nĐoạn hội thoại:\n${transcript}\n\nGiải thích chi tiết:\n` + qb.slice(0, 400),
        transcript_text: transcript
      });
    }
  }

  // ==========================================
  // PART 4 (Q71 - Q100)
  // ==========================================
  console.log('Extracting Part 4 (Q71 - Q100)...');
  const part4Section = test1Listening.slice(test1Listening.indexOf('## Part 4:'));
  const p4Sets = part4Section.split(/(?=### Questions\s+\d+)/).filter(s => s.startsWith('### Questions'));

  for (const set of p4Sets) {
    const transcriptMatch = set.match(/\*\*听力独白\/对话原文：\*\*([\s\S]*?)(?=\*\*中文对照：|\*\*核心词汇|#### Q)/);
    const transcript = transcriptMatch ? transcriptMatch[1].trim() : '';

    const qBlocks = set.split(/(?=#### Q\d+\b)/).filter(b => b.startsWith('#### Q'));
    for (const qb of qBlocks) {
      const qNumMatch = qb.match(/#### Q(\d+)/);
      if (!qNumMatch) continue;
      const qNum = parseInt(qNumMatch[1], 10);
      const correctAns = listeningAnswerMap[qNum] || 'A';

      const promptMatch = qb.match(/\*\*问题：\*\*\s*([^\n]+)/);
      const prompt = promptMatch ? promptMatch[1].replace(/\([^)]+\)/g, '').trim() : 'Choose the best answer according to the talk.';

      const optMatches = [...qb.matchAll(/-\s*\(([A-D])\)\s*([^(\n]+)(?:\(([^)]+)\))?/g)];
      const options = optMatches.map(m => ({
        id: m[1],
        text: m[2].trim()
      }));

      const imgMatch = set.match(/!\[.*?\]\((?:images\/)?(listen_page_\d+\.png)\)/);
      const imageUrl = imgMatch ? `/images/toeic/real_exam/${imgMatch[1]}` : null;

      questions.push({
        position: qNum,
        skill: 'listening',
        category: 'toeic_part_4',
        difficulty: 'hard',
        level: 'advanced',
        question_type: 'multiple_choice',
        prompt: prompt,
        context_text: `Talk Context (Questions ${qBlocks[0].match(/Q(\d+)/)[1]} - ${qBlocks[qBlocks.length - 1].match(/Q(\d+)/)[1]})`,
        image_url: imageUrl,
        audio_url: '/audio/toeic/real_exam/toeic_test_01_full.mp3',
        options: options.length === 4 ? options : [
          { id: 'A', text: 'Option A' },
          { id: 'B', text: 'Option B' },
          { id: 'C', text: 'Option C' },
          { id: 'D', text: 'Option D' }
        ],
        correct_answer: correctAns,
        explanation: `Đáp án đúng: ${correctAns}.\n\nBài nói:\n${transcript}\n\nGiải thích chi tiết:\n` + qb.slice(0, 400),
        transcript_text: transcript
      });
    }
  }

  // ==========================================
  // PART 5 (Q101 - Q130)
  // ==========================================
  console.log('Extracting Part 5 (Q101 - Q130)...');
  const part5Raw = readingRaw.slice(readingRaw.indexOf('Part\n5\nDirections:'), readingRaw.indexOf('Part\n6\nDirections:'));
  
  // Extract explanations from PDF 449 onwards
  const explanationsSection = readingRaw.slice(readingRaw.indexOf('## PDF 第 449 页'), readingRaw.indexOf('## PDF 第 523 页'));

  for (let q = 101; q <= 130; q++) {
    const nextQ = q + 1;
    const qPattern = new RegExp(`${q}\\.\\s*\\n([\\s\\S]*?)(?=${nextQ}\\.\\s*\\n|Part\\s*6|$)`);
    const qMatch = part5Raw.match(qPattern);

    let promptText = '';
    const options = [];
    if (qMatch) {
      const fullText = qMatch[1];
      // prompt before (A)
      const aIdx = fullText.indexOf('(A)');
      promptText = aIdx !== -1 ? fullText.slice(0, aIdx).replace(/\s+/g, ' ').trim() : fullText.trim();
      
      const optMatches = [...fullText.matchAll(/\(([A-D])\)\s*([^\n(]+)/g)];
      optMatches.forEach(m => {
        options.push({
          id: m[1],
          text: m[2].trim()
        });
      });
    }

    // Explanation from answers booklet
    const explPattern = new RegExp(`(?:^|\\n)${q}\\s*\\n([\\s\\S]*?)(?=\\n${nextQ}\\s*\\n|$)`);
    const explMatch = explanationsSection.match(explPattern);
    const explText = explMatch ? explMatch[1].trim() : '';

    const correctAns = readingAnswerMap[q] || 'A';

    questions.push({
      position: q,
      skill: 'reading',
      category: 'toeic_part_5',
      difficulty: 'medium',
      level: 'intermediate',
      question_type: 'multiple_choice',
      prompt: promptText || `Select the word or phrase that best completes the sentence.`,
      context_text: null,
      image_url: null,
      audio_url: null,
      options: options.length === 4 ? options : [
        { id: 'A', text: 'Option A' },
        { id: 'B', text: 'Option B' },
        { id: 'C', text: 'Option C' },
        { id: 'D', text: 'Option D' }
      ],
      correct_answer: correctAns,
      explanation: `Đáp án đúng: ${correctAns}.\n\nPhân tích ngữ pháp & từ vựng:\n` + explText,
      transcript_text: null
    });
  }

  // ==========================================
  // PART 6 (Q131 - Q146)
  // ==========================================
  console.log('Extracting Part 6 (Q131 - Q146)...');
  const part6Raw = readingRaw.slice(readingRaw.indexOf('Part\n6\nDirections:'), readingRaw.indexOf('Part\n7\nDirections:'));
  const p6Sets = part6Raw.split(/(?=Questions\s+\d+-\d+)/).filter(s => s.startsWith('Questions'));

  for (const set of p6Sets) {
    const rangeMatch = set.match(/Questions\s+(\d+)-(\d+)/);
    if (!rangeMatch) continue;
    const startQ = parseInt(rangeMatch[1], 10);
    const endQ = parseInt(rangeMatch[2], 10);

    // Extract passage context before first question number
    const firstQIdx = set.search(new RegExp(`\\b${startQ}\\.`));
    const passageContext = firstQIdx !== -1 ? set.slice(0, firstQIdx).replace(/```text/g, '').replace(/```/g, '').trim() : '';

    for (let q = startQ; q <= endQ; q++) {
      const nextQ = q + 1;
      const qPattern = new RegExp(`${q}\\.\\s*\\n([\\s\\S]*?)(?=${nextQ}\\.\\s*\\n|Questions|$)`);
      const qMatch = set.match(qPattern);

      const options = [];
      let promptText = `Select the best choice to fill in the blank (${q}) in the passage.`;
      if (qMatch) {
        const fullText = qMatch[1];
        const optMatches = [...fullText.matchAll(/\(([A-D])\)\s*([^\n(]+)/g)];
        optMatches.forEach(m => {
          options.push({
            id: m[1],
            text: m[2].trim()
          });
        });
      }

      const explPattern = new RegExp(`(?:^|\\n)${q}\\s*\\n([\\s\\S]*?)(?=\\n${nextQ}\\s*\\n|$)`);
      const explMatch = explanationsSection.match(explPattern);
      const explText = explMatch ? explMatch[1].trim() : '';

      const correctAns = readingAnswerMap[q] || 'A';

      questions.push({
        position: q,
        skill: 'reading',
        category: 'toeic_part_6',
        difficulty: 'medium',
        level: 'intermediate',
        question_type: 'multiple_choice',
        prompt: promptText,
        context_text: passageContext,
        image_url: null,
        audio_url: null,
        options: options.length === 4 ? options : [
          { id: 'A', text: 'Option A' },
          { id: 'B', text: 'Option B' },
          { id: 'C', text: 'Option C' },
          { id: 'D', text: 'Option D' }
        ],
        correct_answer: correctAns,
        explanation: `Đáp án đúng: ${correctAns}.\n\nPhân tích ngữ cảnh & từ vựng:\n` + explText,
        transcript_text: null
      });
    }
  }

  // ==========================================
  // PART 7 (Q147 - Q200)
  // ==========================================
  console.log('Extracting Part 7 (Q147 - Q200)...');
  const part7Raw = readingRaw.slice(readingRaw.indexOf('Part\n7\nDirections:'), readingRaw.indexOf('## PDF 第 61 页'));
  const p7Sets = part7Raw.split(/(?=Questions\s+\d+\s*-\s*\d+)/).filter(s => s.startsWith('Questions'));

  for (const set of p7Sets) {
    const rangeMatch = set.match(/Questions\s+(\d+)\s*-\s*(\d+)/);
    if (!rangeMatch) continue;
    const startQ = parseInt(rangeMatch[1], 10);
    const endQ = parseInt(rangeMatch[2], 10);

    // Look for image in this passage set
    const imgMatch = set.match(/!\[.*?\]\((?:images\/)?(read_page_\d+\.png)\)/);
    const imageUrl = imgMatch ? `/images/toeic/real_exam/${imgMatch[1]}` : null;

    // Extract passage context before first question
    const firstQIdx = set.search(new RegExp(`\\b${startQ}\\.`));
    const passageContext = firstQIdx !== -1 ? set.slice(0, firstQIdx).replace(/```text/g, '').replace(/```/g, '').trim() : '';

    for (let q = startQ; q <= endQ; q++) {
      const nextQ = q + 1;
      const qPattern = new RegExp(`${q}\\.\\s*\\n?([\\s\\S]*?)(?=${nextQ}\\.\\s*\\n?|Questions|$)`);
      const qMatch = set.match(qPattern);

      let promptText = '';
      const options = [];
      if (qMatch) {
        const fullText = qMatch[1];
        const aIdx = fullText.indexOf('(A)');
        promptText = aIdx !== -1 ? fullText.slice(0, aIdx).replace(/\s+/g, ' ').trim() : fullText.trim();

        const optMatches = [...fullText.matchAll(/\(([A-D])\)\s*([^\n(]+)/g)];
        optMatches.forEach(m => {
          options.push({
            id: m[1],
            text: m[2].trim()
          });
        });
      }

      const explPattern = new RegExp(`(?:^|\\n)${q}\\s*\\n([\\s\\S]*?)(?=\\n${nextQ}\\s*\\n|$)`);
      const explMatch = explanationsSection.match(explPattern);
      const explText = explMatch ? explMatch[1].trim() : '';

      const correctAns = readingAnswerMap[q] || 'A';

      questions.push({
        position: q,
        skill: 'reading',
        category: 'toeic_part_7',
        difficulty: 'hard',
        level: 'advanced',
        question_type: 'multiple_choice',
        prompt: promptText || `Based on the passage, choose the best answer for question ${q}.`,
        context_text: passageContext,
        image_url: imageUrl,
        audio_url: null,
        options: options.length === 4 ? options : [
          { id: 'A', text: 'Option A' },
          { id: 'B', text: 'Option B' },
          { id: 'C', text: 'Option C' },
          { id: 'D', text: 'Option D' }
        ],
        correct_answer: correctAns,
        explanation: `Đáp án đúng: ${correctAns}.\n\nPhân tích bài đọc & dẫn chứng:\n` + explText,
        transcript_text: null
      });
    }
  }

  console.log(`\n=== Extraction Summary ===`);
  console.log(`Total questions extracted: ${questions.length}`);
  const byPart = {};
  questions.forEach(q => {
    byPart[q.category] = (byPart[q.category] || 0) + 1;
  });
  console.log('Breakdown by Part:', byPart);

  // 3. Assemble Dataset
  const payload = {
    assessment: {
      slug: 'toeic-ets-actual-test-01',
      title: 'TOEIC Actual Test 01 (Full 7 Parts ETS Real Exam)',
      description: 'Đề thi TOEIC thực chiến chuẩn ETS quốc tế đầy đủ 100% 7 Part (Q1–Q200): Part 1 (Ảnh màu thực tế), Part 2 (Hỏi đáp phản xạ), Part 3 (Hội thoại nhóm), Part 4 (Độc thoại thương mại), Part 5 (Ngữ pháp từ vựng), Part 6 (Điền đoạn văn bản), Part 7 (Đọc hiểu văn bản đơn & đa đoạn), tích hợp toàn bộ audio gốc và lời giải chi tiết.',
      assessment_type: 'toeic',
      time_limit_seconds: 7200,
      total_questions: questions.length,
      is_published: true
    },
    questions: questions
  };

  const outFile = path.join(process.cwd(), 'data', 'toeic', 'toeic_ets_actual_test_01.json');
  fs.writeFileSync(outFile, JSON.stringify(payload, null, 2), 'utf-8');
  console.log(`\nSaved dataset to: ${outFile} (${(fs.statSync(outFile).size / 1024).toFixed(1)} KB)`);
}

harvest();
