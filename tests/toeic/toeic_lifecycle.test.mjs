import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, statSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  convertListeningRawToScaled,
  convertReadingRawToScaled,
  calculateToeicScaledScores,
  TOEIC_SCORING_VERSION,
  TOEIC_LEGAL_DISCLAIMER,
} from '../../src/modules/toeic/conversion-table.ts';
import {
  evaluateToeicSubmission,
  TOEIC_PART_NAMES,
  parsePartNumberFromCategory,
} from '../../src/modules/toeic/scoring.ts';
import {
  generateFallbackToeicAnalysis,
} from '../../src/modules/toeic/evaluator.ts';
import {
  saveToeicAnswerSchema,
  submitToeicTestSchema,
} from '../../src/modules/toeic/types.ts';

describe('Phase 8 — TOEIC Preparation & Mock Exams Lifecycle Suite', () => {
  // =========================================================================
  // 1. Audio and Visual Media Assets Verification
  // =========================================================================
  it('1. Các file audio và SVG ảnh minh họa TOEIC thực tế tồn tại và có dung lượng chuẩn', () => {
    const audioFiles = [
      { name: 'part1_photo_1.wav', minSize: 100000 },
      { name: 'part1_photo_2.wav', minSize: 100000 },
      { name: 'part2_q7.wav', minSize: 100000 },
      { name: 'part2_q8.wav', minSize: 100000 },
      { name: 'part3_dialogue_1.wav', minSize: 300000 },
      { name: 'part4_talk_1.wav', minSize: 300000 },
    ];

    for (const af of audioFiles) {
      const p = join(process.cwd(), 'public', 'audio', 'toeic', af.name);
      assert.ok(existsSync(p), `File audio public/audio/toeic/${af.name} phải tồn tại`);
      const stat = statSync(p);
      assert.ok(
        stat.size >= af.minSize,
        `File ${af.name} phải có dung lượng >= ${af.minSize} bytes (thực tế: ${stat.size})`
      );
    }

    const svgFiles = ['part1_photo_1.svg', 'part1_photo_2.svg'];
    for (const sf of svgFiles) {
      const p = join(process.cwd(), 'public', 'images', 'toeic', sf);
      assert.ok(existsSync(p), `File SVG public/images/toeic/${sf} phải tồn tại`);
      const content = readFileSync(p, 'utf8');
      assert.ok(content.includes('<svg'), `File ${sf} phải là định dạng vector SVG hợp lệ`);
    }
  });

  // =========================================================================
  // 2. ETS Scaled Score Conversion & Bounds Checking (10–990)
  // =========================================================================
  it('2. Bảng quy đổi điểm ETS 10–990 tuân thủ cận min/max và disclaimer pháp lý', () => {
    // Listening scaled bounds [5, 495]
    assert.equal(convertListeningRawToScaled(0), 5, '0 câu Listening phải được 5 điểm');
    assert.equal(convertListeningRawToScaled(100), 495, '100 câu Listening phải đạt 495 điểm');
    assert.equal(convertListeningRawToScaled(-10), 5, 'Điểm âm phải được kẹp an toàn ở 5');
    assert.equal(convertListeningRawToScaled(150), 495, 'Điểm > 100 phải được kẹp ở 495');

    // Reading scaled bounds [5, 495]
    assert.equal(convertReadingRawToScaled(0), 5, '0 câu Reading phải được 5 điểm');
    assert.equal(convertReadingRawToScaled(100), 495, '100 câu Reading phải đạt 495 điểm');
    assert.equal(convertReadingRawToScaled(-5), 5, 'Điểm âm phải được kẹp an toàn ở 5');
    assert.equal(convertReadingRawToScaled(120), 495, 'Điểm > 100 phải được kẹp ở 495');

    // Total Scaled Score Calculation
    const maxScore = calculateToeicScaledScores({
      listeningCorrect: 100,
      listeningTotal: 100,
      readingCorrect: 100,
      readingTotal: 100,
    });
    assert.equal(maxScore.estimatedListeningScore, 495);
    assert.equal(maxScore.estimatedReadingScore, 495);
    assert.equal(maxScore.estimatedTotalScore, 990);
    assert.equal(maxScore.scoringVersion, TOEIC_SCORING_VERSION);
    assert.ok(maxScore.disclaimer.includes('ETS (10–990)'), 'Phải chứa tuyên bố điểm ước tính');

    const minScore = calculateToeicScaledScores({
      listeningCorrect: 0,
      listeningTotal: 100,
      readingCorrect: 0,
      readingTotal: 100,
    });
    assert.equal(minScore.estimatedListeningScore, 5);
    assert.equal(minScore.estimatedReadingScore, 5);
    assert.equal(minScore.estimatedTotalScore, 10);

    // Mini test scaling normalization
    const miniScore = calculateToeicScaledScores({
      listeningCorrect: 15,
      listeningTotal: 15, // 100% Listening in Mini Test
      readingCorrect: 15,
      readingTotal: 15, // 100% Reading in Mini Test
    });
    assert.equal(miniScore.listeningRawScore, 100);
    assert.equal(miniScore.readingRawScore, 100);
    assert.equal(miniScore.estimatedTotalScore, 990);
  });

  // =========================================================================
  // 3. Category & Part Number Resolution
  // =========================================================================
  it('3. Hàm phân giải parsePartNumberFromCategory nhận diện chuẩn xác 7 Part', () => {
    assert.equal(parsePartNumberFromCategory('toeic_part_1', 'listening'), 1);
    assert.equal(parsePartNumberFromCategory('toeic_part_2', 'listening'), 2);
    assert.equal(parsePartNumberFromCategory('toeic_part_3', 'listening'), 3);
    assert.equal(parsePartNumberFromCategory('toeic_part_4', 'listening'), 4);
    assert.equal(parsePartNumberFromCategory('toeic_part_5', 'reading'), 5);
    assert.equal(parsePartNumberFromCategory('toeic_part_6', 'reading'), 6);
    assert.equal(parsePartNumberFromCategory('toeic_part_7', 'reading'), 7);
    assert.equal(parsePartNumberFromCategory('unknown', 'listening'), 1);
    assert.equal(parsePartNumberFromCategory('unknown', 'reading'), 5);
  });

  // =========================================================================
  // 4. Deterministic Scoring Engine & Part Breakdown
  // =========================================================================
  it('4. Bộ chấm điểm server evaluateToeicSubmission tính toán chính xác số câu đúng và breakdown', () => {
    const mockQuestions = [
      {
        id: '11111111-1111-1111-1111-111111111101',
        formId: 'f1',
        section: 'listening',
        partNumber: 1,
        questionNumber: 1,
        prompt: 'Look at photo 1',
        options: [{ id: 'A', text: 'Opt A' }, { id: 'B', text: 'Opt B' }],
      },
      {
        id: '11111111-1111-1111-1111-111111111102',
        formId: 'f1',
        section: 'listening',
        partNumber: 2,
        questionNumber: 2,
        prompt: 'Question response 2',
        options: [{ id: 'A', text: 'Opt A' }, { id: 'B', text: 'Opt B' }, { id: 'C', text: 'Opt C' }],
      },
      {
        id: '11111111-1111-1111-1111-111111111103',
        formId: 'f1',
        section: 'reading',
        partNumber: 5,
        questionNumber: 3,
        prompt: 'Fill blank in sentence',
        options: [{ id: 'A', text: 'Opt A' }, { id: 'B', text: 'Opt B' }],
      },
      {
        id: '11111111-1111-1111-1111-111111111104',
        formId: 'f1',
        section: 'reading',
        partNumber: 7,
        questionNumber: 4,
        prompt: 'Reading passage question',
        options: [{ id: 'A', text: 'Opt A' }, { id: 'B', text: 'Opt B' }],
      },
    ];

    const mockAnswerKeys = new Map([
      ['11111111-1111-1111-1111-111111111101', { questionId: 'q1', correctOptionId: 'A', explanation: 'Exp 1' }],
      ['11111111-1111-1111-1111-111111111102', { questionId: 'q2', correctOptionId: 'B', explanation: 'Exp 2' }],
      ['11111111-1111-1111-1111-111111111103', { questionId: 'q3', correctOptionId: 'C', explanation: 'Exp 3' }],
      ['11111111-1111-1111-1111-111111111104', { questionId: 'q4', correctOptionId: 'A', explanation: 'Exp 4' }],
    ]);

    // Student got Q1 and Q4 correct; Q2 wrong; Q3 unanswered
    const userAnswers = {
      '11111111-1111-1111-1111-111111111101': 'A', // correct
      '11111111-1111-1111-1111-111111111102': 'A', // wrong (expected B)
      '11111111-1111-1111-1111-111111111104': 'A', // correct
      // Q3 missing
    };

    const outcome = evaluateToeicSubmission({
      questions: mockQuestions,
      answerKeys: mockAnswerKeys,
      userAnswers,
    });

    assert.equal(outcome.totalQuestions, 4);
    assert.equal(outcome.totalCorrect, 2);
    assert.equal(outcome.overallAccuracy, 50);

    // Part breakdown verification
    assert.equal(outcome.partScores.part_1.correct, 1);
    assert.equal(outcome.partScores.part_1.total, 1);
    assert.equal(outcome.partScores.part_1.accuracy, 100);

    assert.equal(outcome.partScores.part_2.correct, 0);
    assert.equal(outcome.partScores.part_2.total, 1);
    assert.equal(outcome.partScores.part_2.accuracy, 0);

    assert.equal(outcome.partScores.part_5.correct, 0);
    assert.equal(outcome.partScores.part_5.total, 1);
    assert.equal(outcome.partScores.part_5.accuracy, 0);

    assert.equal(outcome.partScores.part_7.correct, 1);
    assert.equal(outcome.partScores.part_7.total, 1);
    assert.equal(outcome.partScores.part_7.accuracy, 100);

    // Detailed reviews checks
    assert.equal(outcome.reviews.length, 4);
    assert.equal(outcome.reviews[0].isCorrect, true);
    assert.equal(outcome.reviews[1].isCorrect, false);
    assert.equal(outcome.reviews[2].isCorrect, false); // Unanswered is false
    assert.equal(outcome.reviews[3].isCorrect, true);
  });

  // =========================================================================
  // 5. AI Weakness Analysis Fallback Heuristic
  // =========================================================================
  it('5. Fallback Heuristic chẩn đoán điểm yếu tạo phân tích sư phạm và khuyến nghị bài học', () => {
    const analysis = generateFallbackToeicAnalysis({
      partScores: {
        part_1: { partNumber: 1, partName: 'Part 1: Photographs', section: 'listening', total: 6, correct: 5, accuracy: 83 },
        part_2: { partNumber: 2, partName: 'Part 2: Question-Response', section: 'listening', total: 10, correct: 8, accuracy: 80 },
        part_5: { partNumber: 5, partName: 'Part 5: Incomplete Sentences', section: 'reading', total: 15, correct: 6, accuracy: 40 },
        part_7: { partNumber: 7, partName: 'Part 7: Reading Comprehension', section: 'reading', total: 10, correct: 4, accuracy: 40 },
      },
      estimatedListeningScore: 350,
      estimatedReadingScore: 210,
      estimatedTotalScore: 560,
    });

    assert.ok(analysis.strongestParts.length > 0, 'Phải chỉ ra phần mạnh nhất');
    assert.ok(analysis.weakestParts.length > 0, 'Phải chỉ ra phần yếu nhất');
    assert.ok(analysis.weakestParts.some((p) => p.includes('Part 5') || p.includes('Part 7')));
    assert.ok(analysis.overallDiagnosis.includes('560/990'), 'Chẩn đoán phải nêu tổng điểm');
    assert.ok(analysis.targetedActionPlan.length >= 1, 'Kế hoạch hành động phải có ít nhất 1 mục');
    assert.ok(analysis.recommendedGeneralEnglishTopics.length >= 2, 'Phải liên kết tới bài học tổng quát');
  });

  // =========================================================================
  // 6. Zod Validation & Anti-IDOR Schemas
  // =========================================================================
  it('6. Zod schema kiểm tra chặt chẽ dữ liệu nộp câu hỏi và chặn input bất hợp lệ', () => {
    // Valid save answer
    const validSave = saveToeicAnswerSchema.safeParse({
      attemptId: '11111111-2222-3333-4444-555555555555',
      questionId: '22222222-3333-4444-5555-666666666666',
      selectedOptionId: 'B',
      timeSpentSeconds: 45,
    });
    assert.equal(validSave.success, true);

    // Invalid attemptId (empty string)
    const invalidSave = saveToeicAnswerSchema.safeParse({
      attemptId: '',
      questionId: '22222222-3333-4444-5555-666666666666',
      selectedOptionId: 'B',
    });
    assert.equal(invalidSave.success, false);

    // Valid submit test
    const validSubmit = submitToeicTestSchema.safeParse({
      attemptId: '11111111-2222-3333-4444-555555555555',
      timeSpentSeconds: 3600,
      answers: {
        '22222222-3333-4444-5555-666666666666': 'A',
      },
    });
    assert.equal(validSubmit.success, true);

    // Invalid submit test (negative time)
    const invalidSubmit = submitToeicTestSchema.safeParse({
      attemptId: '11111111-2222-3333-4444-555555555555',
      timeSpentSeconds: -10,
      answers: {},
    });
    assert.equal(invalidSubmit.success, false);
  });

  // =========================================================================
  // 7. Phase 8 Migration Hardening & Security Guardrails Verification
  // =========================================================================
  it('7. SQL Migration Phase 8 áp dụng đầy đủ ràng buộc toàn vẹn, Force RLS, Trigger chống gian lận và RPC', () => {
    const migrationPath = join(process.cwd(), 'supabase', 'migrations', '20261022_phase_8_toeic.sql');
    assert.ok(existsSync(migrationPath), 'File migration 20261022_phase_8_toeic.sql phải tồn tại');
    const sql = readFileSync(migrationPath, 'utf8');

    // Relational Integrity Constraints
    assert.ok(sql.includes('chk_toeic_test_forms_target_part'), 'Phải có ràng buộc target_part theo test_type');
    assert.ok(sql.includes('chk_toeic_questions_section_part'), 'Phải có ràng buộc section và part_number ăn khớp');
    assert.ok(sql.includes('chk_toeic_questions_options_array'), 'Phải có ràng buộc options là json array');
    assert.ok(sql.includes('chk_toeic_correct_option'), 'Phải có ràng buộc correct_option_id in A,B,C,D');
    assert.ok(sql.includes('chk_toeic_attempts_score_sum'), 'Phải có ràng buộc tổng điểm bằng nghe + đọc');
    assert.ok(sql.includes('chk_toeic_attempts_submitted_at'), 'Phải có ràng buộc submitted_at tương ứng với status');

    // Concurrency & Partial Unique Index
    assert.ok(
      sql.includes('uq_toeic_attempts_user_form_in_progress'),
      'Phải có partial unique index chặn nhiều bài thi in_progress đồng thời'
    );

    // Defense-in-depth Triggers
    assert.ok(sql.includes('protect_toeic_attempt_fields'), 'Phải có trigger hàm bảo vệ điểm số attempts');
    assert.ok(sql.includes('protect_toeic_answer_fields'), 'Phải có trigger hàm bảo vệ is_correct answers');

    // Strict RLS & Privilege revoking
    assert.ok(
      sql.includes('alter table public.toeic_question_answers force row level security;'),
      'Bảng đáp án phải bật FORCE ROW LEVEL SECURITY'
    );
    assert.ok(
      sql.includes('revoke all on table public.toeic_question_answers from public, anon, authenticated;'),
      'Phải revoke quyền đọc bảng đáp án từ client'
    );

    // Atomic Stored Procedure
    assert.ok(sql.includes('create or replace function public.submit_toeic_attempt'), 'Phải có RPC submit_toeic_attempt');
    assert.ok(sql.includes('security definer'), 'RPC phải khai báo security definer');
    assert.ok(sql.includes("set search_path = ''"), 'RPC phải set search_path rỗng chống path hijacking');
    assert.ok(sql.includes('for update'), 'RPC phải khóa row bằng FOR UPDATE tránh race condition');
  });

  // =========================================================================
  // 8. Server-Side Evaluation Privilege Compliance in services.ts
  // =========================================================================
  it('8. Service chấm thi submitToeicTest sử dụng admin client khi cập nhật kết quả và điểm số', () => {
    const servicesPath = join(process.cwd(), 'src', 'modules', 'toeic', 'services.ts');
    assert.ok(existsSync(servicesPath), 'File src/modules/toeic/services.ts phải tồn tại');
    const serviceCode = readFileSync(servicesPath, 'utf8');

    // Must use admin client to update assessment_attempts and assessment_answers
    assert.ok(
      serviceCode.includes("await admin\n    .from('assessment_attempts')\n    .update({"),
      'Cập nhật assessment_attempts trong submitToeicTest phải sử dụng admin client'
    );
    assert.ok(
      serviceCode.includes("await admin\n        .from('assessment_answers')\n        .upsert("),
      'Cập nhật assessment_answers trong submitToeicTest phải sử dụng admin client'
    );
  });
});

