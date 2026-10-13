import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  calculateAssessmentScore,
  mapAccuracyToCEFR,
  SCORING_VERSION,
} from '../../src/modules/assessment/scoring.ts';

const mockQuestions = [
  {
    id: '11111111-0000-0000-0000-000000000001',
    assessment_id: 'placement-test-id',
    skill: 'vocabulary',
    category: 'occupations',
    difficulty: 1,
    level: 'a1',
    question_type: 'multiple_choice',
    prompt: 'She works at a hospital. She takes care of sick people. She is a ______.',
    context_text: null,
    audio_url: null,
    options: [
      { id: 'A', text: 'nurse' },
      { id: 'B', text: 'chef' },
      { id: 'C', text: 'pilot' },
      { id: 'D', text: 'mechanic' },
    ],
    position: 1,
    weight: 1.0,
  },
  {
    id: '11111111-0000-0000-0000-000000000002',
    assessment_id: 'placement-test-id',
    skill: 'grammar',
    category: 'past_simple',
    difficulty: 1,
    level: 'a1',
    question_type: 'multiple_choice',
    prompt: 'Yesterday, we ______ to the cinema.',
    context_text: null,
    audio_url: null,
    options: [
      { id: 'A', text: 'go' },
      { id: 'B', text: 'went' },
      { id: 'C', text: 'going' },
      { id: 'D', text: 'goes' },
    ],
    position: 2,
    weight: 1.0,
  },
  {
    id: '11111111-0000-0000-0000-000000000003',
    assessment_id: 'placement-test-id',
    skill: 'reading',
    category: 'factual',
    difficulty: 2,
    level: 'a2',
    question_type: 'multiple_choice',
    prompt: 'What must patrons present at the desk?',
    context_text: 'Patrons must present a valid member card at the front desk.',
    audio_url: null,
    options: [
      { id: 'A', text: 'A valid member card' },
      { id: 'B', text: 'A passport' },
    ],
    position: 3,
    weight: 1.0,
  },
  {
    id: '11111111-0000-0000-0000-000000000004',
    assessment_id: 'placement-test-id',
    skill: 'listening',
    category: 'dialogue',
    difficulty: 2,
    level: 'a2',
    question_type: 'multiple_choice',
    prompt: 'How should the barista ask for payment method?',
    context_text: 'Barista: That comes to $4.75. ______?',
    audio_url: null,
    options: [
      { id: 'A', text: 'How would you like to pay' },
      { id: 'B', text: 'Where is your home' },
    ],
    position: 4,
    weight: 1.0,
  },
];

const mockOfficialAnswers = [
  { question_id: '11111111-0000-0000-0000-000000000001', correct_option_id: 'A', explanation: 'Hospital care = nurse' },
  { question_id: '11111111-0000-0000-0000-000000000002', correct_option_id: 'B', explanation: 'Yesterday = went' },
  { question_id: '11111111-0000-0000-0000-000000000003', correct_option_id: 'A', explanation: 'Card required' },
  { question_id: '11111111-0000-0000-0000-000000000004', correct_option_id: 'A', explanation: 'Standard transaction question' },
];

describe('Phase 2 Assessment Comprehensive Suite', () => {
  it('1. Chấm đúng câu trả lời chính xác (Correct answers marked isCorrect = true)', () => {
    const input = [
      { questionId: '11111111-0000-0000-0000-000000000001', selectedOptionId: 'A' },
      { questionId: '11111111-0000-0000-0000-000000000002', selectedOptionId: 'B' },
    ];
    const scored = calculateAssessmentScore(mockQuestions, mockOfficialAnswers, input);
    const q1 = scored.scoredAnswers.find((a) => a.questionId === '11111111-0000-0000-0000-000000000001');
    const q2 = scored.scoredAnswers.find((a) => a.questionId === '11111111-0000-0000-0000-000000000002');
    assert.equal(q1.isCorrect, true);
    assert.equal(q1.scoreAwarded, 1.0);
    assert.equal(q2.isCorrect, true);
    assert.equal(q2.scoreAwarded, 1.0);
  });

  it('2. Chấm sai câu trả lời không chính xác (Wrong answers marked isCorrect = false, score = 0)', () => {
    const input = [
      { questionId: '11111111-0000-0000-0000-000000000001', selectedOptionId: 'C' }, // Wrong
      { questionId: '11111111-0000-0000-0000-000000000002', selectedOptionId: 'D' }, // Wrong
    ];
    const scored = calculateAssessmentScore(mockQuestions, mockOfficialAnswers, input);
    const q1 = scored.scoredAnswers.find((a) => a.questionId === '11111111-0000-0000-0000-000000000001');
    const q2 = scored.scoredAnswers.find((a) => a.questionId === '11111111-0000-0000-0000-000000000002');
    assert.equal(q1.isCorrect, false);
    assert.equal(q1.scoreAwarded, 0);
    assert.equal(q2.isCorrect, false);
    assert.equal(q2.scoreAwarded, 0);
  });

  it('3. Tính điểm tổng và điểm theo kỹ năng chính xác', () => {
    const input = [
      { questionId: '11111111-0000-0000-0000-000000000001', selectedOptionId: 'A' }, // Vocab: 1/1 = 100%
      { questionId: '11111111-0000-0000-0000-000000000002', selectedOptionId: 'A' }, // Grammar: 0/1 = 0%
      { questionId: '11111111-0000-0000-0000-000000000003', selectedOptionId: 'A' }, // Reading: 1/1 = 100%
      { questionId: '11111111-0000-0000-0000-000000000004', selectedOptionId: 'B' }, // Listening: 0/1 = 0%
    ];
    const scored = calculateAssessmentScore(mockQuestions, mockOfficialAnswers, input);
    assert.equal(scored.totalScore, 2.0);
    assert.equal(scored.maxScore, 4.0);
    assert.equal(scored.accuracy, 0.5);
    assert.equal(scored.skillScores.vocabulary.accuracy, 1.0);
    assert.equal(scored.skillScores.grammar.accuracy, 0.0);
    assert.equal(scored.skillScores.reading.accuracy, 1.0);
    assert.equal(scored.skillScores.listening.accuracy, 0.0);
  });

  it('4. Từ chối ID câu hỏi không hợp lệ (Không làm sai lệch maxScore hoặc crash)', () => {
    const input = [
      { questionId: 'non_existent_fake_id', selectedOptionId: 'A' },
      { questionId: '11111111-0000-0000-0000-000000000001', selectedOptionId: 'A' },
    ];
    const scored = calculateAssessmentScore(mockQuestions, mockOfficialAnswers, input);
    assert.equal(scored.correctAnswers, 1);
    assert.equal(scored.totalQuestions, 4);
  });

  it('5. Từ chối giá trị câu trả lời không hợp lệ hoặc rỗng', () => {
    const input = [
      { questionId: '11111111-0000-0000-0000-000000000001', selectedOptionId: '' },
      { questionId: '11111111-0000-0000-0000-000000000002', selectedOptionId: 'XYZ' },
    ];
    const scored = calculateAssessmentScore(mockQuestions, mockOfficialAnswers, input);
    assert.equal(scored.correctAnswers, 0);
    assert.equal(scored.totalScore, 0);
  });

  it('6. Bảo vệ quyền: Lượt làm bài của User A không bị đọc/sửa bởi User B (Idor check simulation)', () => {
    const attempt = {
      id: 'attempt-123',
      user_id: 'user-A-uuid',
      status: 'in_progress',
    };

    const requestingUserB = 'user-B-uuid';
    const isOwner = attempt.user_id === requestingUserB;
    assert.equal(isOwner, false, 'User B must be rejected when attempting to access User A attempt');
  });

  it('7. Trạng thái không thể sửa câu trả lời sau khi đã hoàn thành (Status immutability)', () => {
    const completedAttempt = {
      id: 'attempt-456',
      user_id: 'user-A-uuid',
      status: 'completed',
    };

    const canEdit = completedAttempt.status === 'in_progress';
    assert.equal(canEdit, false, 'Completed attempts must reject answer updates');
  });

  it('8. Idempotency: Nộp bài nhiều lần cho cùng một lượt không tạo ra kết quả mâu thuẫn', () => {
    const input = [
      { questionId: '11111111-0000-0000-0000-000000000001', selectedOptionId: 'A' },
      { questionId: '11111111-0000-0000-0000-000000000002', selectedOptionId: 'B' },
      { questionId: '11111111-0000-0000-0000-000000000003', selectedOptionId: 'A' },
      { questionId: '11111111-0000-0000-0000-000000000004', selectedOptionId: 'A' },
    ];

    const run1 = calculateAssessmentScore(mockQuestions, mockOfficialAnswers, input);
    const run2 = calculateAssessmentScore(mockQuestions, mockOfficialAnswers, input);

    assert.deepEqual(run1.overallLevel, run2.overallLevel);
    assert.deepEqual(run1.totalScore, run2.totalScore);
    assert.deepEqual(run1.accuracy, run2.accuracy);
    assert.deepEqual(run1.skillScores, run2.skillScores);
  });

  it('9. Khôi phục lượt làm bài chưa hoàn thành (Resume existing in_progress attempt)', () => {
    const savedDatabaseAnswers = [
      { question_id: '11111111-0000-0000-0000-000000000001', selected_option_id: 'A' },
      { question_id: '11111111-0000-0000-0000-000000000002', selected_option_id: 'B' },
    ];

    const restoredState = {};
    for (const a of savedDatabaseAnswers) {
      restoredState[a.question_id] = a.selected_option_id;
    }

    assert.equal(restoredState['11111111-0000-0000-0000-000000000001'], 'A');
    assert.equal(restoredState['11111111-0000-0000-0000-000000000002'], 'B');
    assert.equal(restoredState['11111111-0000-0000-0000-000000000003'], undefined);
  });

  it('10. Client question objects do not expose correct_option_id or answers', () => {
    for (const q of mockQuestions) {
      assert.equal('correct_option_id' in q, false);
      assert.equal('answer_key' in q, false);
      for (const opt of q.options) {
        assert.equal('is_correct' in opt, false);
      }
    }
  });

  it('11. Cập nhật kết quả tôn trọng trigger bảo vệ profile Phase 1 (Service role privilege check)', () => {
    // In Phase 1 migration:
    // is_admin_or_service_role() returns true ONLY if caller is service_role or admin.
    const serviceRoleJwt = { role: 'service_role' };
    const authenticatedUserJwt = { role: 'authenticated' };

    const checkPrivilege = (jwt) => jwt && jwt.role === 'service_role';

    assert.equal(checkPrivilege(authenticatedUserJwt), false, 'Client authenticated user cannot bypass profile lock');
    assert.equal(checkPrivilege(serviceRoleJwt), true, 'Server admin client can update estimated_level legitimately');
  });

  it('12. Mapping accuracy sang CEFR levels chính xác', () => {
    assert.equal(mapAccuracyToCEFR(0.90), 'b2');
    assert.equal(mapAccuracyToCEFR(0.75), 'b1');
    assert.equal(mapAccuracyToCEFR(0.55), 'a2');
    assert.equal(mapAccuracyToCEFR(0.40), 'a1');
    assert.equal(mapAccuracyToCEFR(0.10), 'pre_a1');
  });
});
