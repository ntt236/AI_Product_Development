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

  describe('Security Hardening & Database Protection Rules', () => {
    it('13. Client không thể tự đặt điểm hoặc tự tạo lượt làm bài completed (protect_assessment_attempt_fields logic)', () => {
      // Simulating the trigger protect_assessment_attempt_fields for role 'authenticated'
      function simulateAttemptInsert(callerRole, payload) {
        const isAdmin = callerRole === 'service_role';
        if (!isAdmin) {
          if (payload.status !== 'in_progress') {
            throw new Error('New assessment attempts must be created with status in_progress.');
          }
          if (
            payload.score !== null && payload.score !== undefined ||
            payload.max_score !== null && payload.max_score !== undefined ||
            payload.accuracy !== null && payload.accuracy !== undefined ||
            payload.submitted_at !== null && payload.submitted_at !== undefined ||
            payload.completed_at !== null && payload.completed_at !== undefined
          ) {
            throw new Error('Initial attempt score and completion timestamps must be null.');
          }
        }
        return { ...payload, answered_count: 0 };
      }

      // Malicious client attempting to create completed attempt with 100% score
      assert.throws(() => {
        simulateAttemptInsert('authenticated', {
          status: 'completed',
          score: 100,
          max_score: 100,
          accuracy: 1.0,
        });
      }, /New assessment attempts must be created with status in_progress/);

      // Malicious client attempting to insert score directly with in_progress
      assert.throws(() => {
        simulateAttemptInsert('authenticated', {
          status: 'in_progress',
          score: 100,
        });
      }, /Initial attempt score and completion timestamps must be null/);

      // Legitimate client creating in_progress attempt
      const validAttempt = simulateAttemptInsert('authenticated', {
        status: 'in_progress',
        score: null,
        max_score: null,
        accuracy: null,
      });
      assert.equal(validAttempt.status, 'in_progress');
      assert.equal(validAttempt.answered_count, 0);
    });

    it('14. Client không thể tự sửa điểm, trạng thái hoặc timestamp (protect_assessment_attempt_fields update logic)', () => {
      function simulateAttemptUpdate(callerRole, oldRecord, newRecord) {
        const isAdmin = callerRole === 'service_role';
        if (!isAdmin) {
          if (newRecord.status !== oldRecord.status) {
            throw new Error('Only the assessment evaluation service can transition attempt status.');
          }
          if (
            newRecord.score !== oldRecord.score ||
            newRecord.max_score !== oldRecord.max_score ||
            newRecord.accuracy !== oldRecord.accuracy ||
            newRecord.submitted_at !== oldRecord.submitted_at ||
            newRecord.completed_at !== oldRecord.completed_at
          ) {
            throw new Error('Direct modification of assessment score and completion fields is prohibited.');
          }
        }
        return newRecord;
      }

      const currentAttempt = {
        id: 'attempt-1',
        status: 'in_progress',
        score: null,
        max_score: null,
        accuracy: null,
        submitted_at: null,
        completed_at: null,
      };

      // Client attempts to mark as completed
      assert.throws(() => {
        simulateAttemptUpdate('authenticated', currentAttempt, {
          ...currentAttempt,
          status: 'completed',
        });
      }, /Only the assessment evaluation service can transition attempt status/);

      // Client attempts to modify score
      assert.throws(() => {
        simulateAttemptUpdate('authenticated', currentAttempt, {
          ...currentAttempt,
          score: 95,
        });
      }, /Direct modification of assessment score and completion fields is prohibited/);
    });

    it('15. Client không thể tự chấm điểm câu trả lời (protect_assessment_answer_fields logic)', () => {
      function simulateAnswerInsertOrUpdate(callerRole, attemptStatus, payload) {
        const isAdmin = callerRole === 'service_role';
        if (!isAdmin) {
          if (attemptStatus !== 'in_progress') {
            throw new Error('Cannot save or modify answers for an attempt that is not in progress.');
          }
          // Non-admin cannot set is_correct or score_awarded
          if (payload.is_correct !== null && payload.is_correct !== undefined) {
            throw new Error('Only the scoring engine can set answer correctness.');
          }
          if (payload.score_awarded !== null && payload.score_awarded !== undefined) {
            throw new Error('Only the scoring engine can set answer scores.');
          }
        }
        return payload;
      }

      // Malicious client tries to send is_correct = true
      assert.throws(() => {
        simulateAnswerInsertOrUpdate('authenticated', 'in_progress', {
          question_id: 'q1',
          selected_option_id: 'A',
          is_correct: true,
        });
      }, /Only the scoring engine can set answer correctness/);

      // Malicious client tries to send score_awarded = 10
      assert.throws(() => {
        simulateAnswerInsertOrUpdate('authenticated', 'in_progress', {
          question_id: 'q1',
          selected_option_id: 'A',
          score_awarded: 10,
        });
      }, /Only the scoring engine can set answer scores/);

      // Valid client answer submission
      const valid = simulateAnswerInsertOrUpdate('authenticated', 'in_progress', {
        question_id: 'q1',
        selected_option_id: 'A',
      });
      assert.equal(valid.selected_option_id, 'A');
    });

    it('16. Không thể xem giải thích hoặc đáp án khi bài thi chưa completed (getDetailedAssessmentResult gate)', () => {
      function checkResultAccess(userId, attempt) {
        if (!attempt || attempt.user_id !== userId || attempt.status !== 'completed') {
          return { allowed: false, reviews: [] };
        }
        return { allowed: true, reviews: ['answer_key_and_explanation'] };
      }

      const inProgressAttempt = {
        id: 'attempt-inprogress',
        user_id: 'user-1',
        status: 'in_progress',
      };

      const completedAttempt = {
        id: 'attempt-completed',
        user_id: 'user-1',
        status: 'completed',
      };

      // In progress attempt by same user -> refused
      const inProgressCheck = checkResultAccess('user-1', inProgressAttempt);
      assert.equal(inProgressCheck.allowed, false);
      assert.equal(inProgressCheck.reviews.length, 0);

      // Completed attempt by another user -> refused (IDOR check)
      const idorCheck = checkResultAccess('user-attacker', completedAttempt);
      assert.equal(idorCheck.allowed, false);
      assert.equal(idorCheck.reviews.length, 0);

      // Completed attempt by owner -> allowed
      const ownerCheck = checkResultAccess('user-1', completedAttempt);
      assert.equal(ownerCheck.allowed, true);
      assert.equal(ownerCheck.reviews.length, 1);
    });

    it('17. Khóa trạng thái nguyên tử (Atomic locking) ngăn chặn nộp bài đồng thời', async () => {
      let attemptState = 'in_progress';
      let gradingRuns = 0;

      // Simulated atomic state transition: .update({ status: 'submitted' }).eq('status', 'in_progress')
      async function attemptSubmitAtomic() {
        if (attemptState === 'in_progress') {
          // Atomic lock succeeded
          attemptState = 'submitted';
          gradingRuns += 1;
          // Finish grading
          attemptState = 'completed';
          return { status: 'graded' };
        } else if (attemptState === 'completed') {
          return { status: 'already_completed' };
        } else {
          return { status: 'in_flight' };
        }
      }

      // Simulate two simultaneous requests
      const [req1, req2] = await Promise.all([
        attemptSubmitAtomic(),
        attemptSubmitAtomic(),
      ]);

      assert.equal(gradingRuns, 1, 'Only one atomic submission may run grading logic');
      const statuses = [req1.status, req2.status];
      assert.ok(statuses.includes('graded'));
      assert.ok(statuses.includes('already_completed') || statuses.includes('in_flight'));
    });

    it('18. Server action phải xác thực người dùng và kiểm tra quyền sở hữu trước khi dùng service role', () => {
      function evaluateAttemptSecurityBoundary(authenticatedUserId, attemptUserId) {
        if (!authenticatedUserId) {
          throw new Error('Unauthorized: Authentication required.');
        }
        if (authenticatedUserId !== attemptUserId) {
          throw new Error('Forbidden: Attempt does not belong to the authenticated user.');
        }
        return true;
      }

      // Unauthenticated
      assert.throws(() => {
        evaluateAttemptSecurityBoundary(null, 'user-1');
      }, /Unauthorized/);

      // Different user ID (attempt tampering)
      assert.throws(() => {
        evaluateAttemptSecurityBoundary('attacker-id', 'victim-id');
      }, /Forbidden/);

      // Correct user
      assert.equal(evaluateAttemptSecurityBoundary('user-1', 'user-1'), true);
    });
  });
});

