import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

// Import the scoring engine logic directly
import {
  calculateAssessmentScore,
  mapAccuracyToCEFR,
  SCORING_VERSION,
} from '../../src/modules/assessment/scoring.ts';

const mockQuestions = [
  {
    id: 'q1',
    assessment_id: 'test-assessment',
    skill: 'vocabulary',
    category: 'occupations',
    difficulty: 1,
    level: 'a1',
    question_type: 'multiple_choice',
    prompt: 'She works at a hospital. She is a ______.',
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
    id: 'q2',
    assessment_id: 'test-assessment',
    skill: 'grammar',
    category: 'past_tense',
    difficulty: 1,
    level: 'a1',
    question_type: 'multiple_choice',
    prompt: 'Yesterday we ______ to the cinema.',
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
    id: 'q3',
    assessment_id: 'test-assessment',
    skill: 'reading',
    category: 'detail',
    difficulty: 2,
    level: 'a2',
    question_type: 'multiple_choice',
    prompt: 'What must patrons present?',
    context_text: 'Present a valid member card at desk.',
    audio_url: null,
    options: [
      { id: 'A', text: 'Member card' },
      { id: 'B', text: 'Passport' },
    ],
    position: 3,
    weight: 1.0,
  },
  {
    id: 'q4',
    assessment_id: 'test-assessment',
    skill: 'listening',
    category: 'dialogue',
    difficulty: 2,
    level: 'a2',
    question_type: 'multiple_choice',
    prompt: 'What did the barista say?',
    context_text: 'Barista: Certainly!',
    audio_url: null,
    options: [
      { id: 'A', text: 'Would you like pastry?' },
      { id: 'B', text: 'Goodbye' },
    ],
    position: 4,
    weight: 1.0,
  },
];

const mockOfficialAnswers = [
  { question_id: 'q1', correct_option_id: 'A', explanation: 'Hospital worker = nurse' },
  { question_id: 'q2', correct_option_id: 'B', explanation: 'Yesterday = went' },
  { question_id: 'q3', correct_option_id: 'A', explanation: 'Notice states member card' },
  { question_id: 'q4', correct_option_id: 'A', explanation: 'Standard polite reply' },
];

describe('Assessment Scoring Engine', () => {
  it('1. Chấm đúng tất cả câu trả lời chính xác (100% score)', () => {
    const userAnswers = [
      { questionId: 'q1', selectedOptionId: 'A' },
      { questionId: 'q2', selectedOptionId: 'B' },
      { questionId: 'q3', selectedOptionId: 'A' },
      { questionId: 'q4', selectedOptionId: 'A' },
    ];

    const result = calculateAssessmentScore(mockQuestions, mockOfficialAnswers, userAnswers);

    assert.equal(result.totalQuestions, 4);
    assert.equal(result.correctAnswers, 4);
    assert.equal(result.totalScore, 4);
    assert.equal(result.maxScore, 4);
    assert.equal(result.accuracy, 1.0);
    assert.equal(result.overallLevel, 'b2');
    assert.equal(result.scoringVersion, SCORING_VERSION);

    // Verify per-skill breakdown
    assert.equal(result.skillScores.vocabulary.correctCount, 1);
    assert.equal(result.skillScores.vocabulary.accuracy, 1.0);
    assert.equal(result.skillScores.grammar.correctCount, 1);
    assert.equal(result.skillScores.reading.correctCount, 1);
    assert.equal(result.skillScores.listening.correctCount, 1);
  });

  it('2. Chấm sai các câu trả lời không chính xác', () => {
    const userAnswers = [
      { questionId: 'q1', selectedOptionId: 'C' }, // Wrong (pilot instead of nurse)
      { questionId: 'q2', selectedOptionId: 'A' }, // Wrong (go instead of went)
      { questionId: 'q3', selectedOptionId: 'A' }, // Correct
      { questionId: 'q4', selectedOptionId: 'B' }, // Wrong
    ];

    const result = calculateAssessmentScore(mockQuestions, mockOfficialAnswers, userAnswers);

    assert.equal(result.correctAnswers, 1);
    assert.equal(result.totalScore, 1);
    assert.equal(result.accuracy, 0.25);
    assert.equal(result.overallLevel, 'pre_a1');
    assert.equal(result.skillScores.vocabulary.correctCount, 0);
    assert.equal(result.skillScores.grammar.correctCount, 0);
    assert.equal(result.skillScores.reading.correctCount, 1);
    assert.equal(result.skillScores.listening.correctCount, 0);
  });

  it('3. Tính điểm từng kỹ năng độc lập', () => {
    const userAnswers = [
      { questionId: 'q1', selectedOptionId: 'A' }, // Vocab: 100%
      { questionId: 'q2', selectedOptionId: 'D' }, // Grammar: 0%
      { questionId: 'q3', selectedOptionId: 'A' }, // Reading: 100%
      { questionId: 'q4', selectedOptionId: 'B' }, // Listening: 0%
    ];

    const result = calculateAssessmentScore(mockQuestions, mockOfficialAnswers, userAnswers);

    assert.equal(result.skillScores.vocabulary.accuracy, 1.0);
    assert.equal(result.skillScores.grammar.accuracy, 0.0);
    assert.equal(result.skillScores.reading.accuracy, 1.0);
    assert.equal(result.skillScores.listening.accuracy, 0.0);
    assert.equal(result.accuracy, 0.5);
    assert.equal(result.overallLevel, 'a2');
  });

  it('4. Bỏ qua ID câu hỏi không hợp lệ và xử lý câu chưa trả lời', () => {
    const userAnswers = [
      { questionId: 'q1', selectedOptionId: 'A' },
      { questionId: 'invalid_question_999', selectedOptionId: 'B' },
      // q2, q3, q4 omitted
    ];

    const result = calculateAssessmentScore(mockQuestions, mockOfficialAnswers, userAnswers);

    assert.equal(result.correctAnswers, 1);
    assert.equal(result.totalScore, 1);
    assert.equal(result.accuracy, 0.25);
    assert.equal(result.scoredAnswers.find((a) => a.questionId === 'q2').isCorrect, false);
    assert.equal(result.scoredAnswers.find((a) => a.questionId === 'q3').isCorrect, false);
  });

  it('5. Không phân biệt chữ hoa/thường cho selectedOptionId', () => {
    const userAnswers = [
      { questionId: 'q1', selectedOptionId: 'a' }, // lower-case 'a' matches 'A'
      { questionId: 'q2', selectedOptionId: ' b ' }, // spaced lower-case ' b '
      { questionId: 'q3', selectedOptionId: 'A' },
      { questionId: 'q4', selectedOptionId: 'a' },
    ];

    const result = calculateAssessmentScore(mockQuestions, mockOfficialAnswers, userAnswers);

    assert.equal(result.correctAnswers, 4);
    assert.equal(result.accuracy, 1.0);
  });

  it('6. Map accuracy sang CEFR level chuẩn xác', () => {
    assert.equal(mapAccuracyToCEFR(0.95), 'b2');
    assert.equal(mapAccuracyToCEFR(0.85), 'b2');
    assert.equal(mapAccuracyToCEFR(0.75), 'b1');
    assert.equal(mapAccuracyToCEFR(0.70), 'b1');
    assert.equal(mapAccuracyToCEFR(0.60), 'a2');
    assert.equal(mapAccuracyToCEFR(0.50), 'a2');
    assert.equal(mapAccuracyToCEFR(0.40), 'a1');
    assert.equal(mapAccuracyToCEFR(0.35), 'a1');
    assert.equal(mapAccuracyToCEFR(0.20), 'pre_a1');
    assert.equal(mapAccuracyToCEFR(0.0), 'pre_a1');
  });

  it('7. Trả về strengths và weaknesses có ý nghĩa thực tế', () => {
    const userAnswers = [
      { questionId: 'q1', selectedOptionId: 'A' }, // Vocab: Correct
      { questionId: 'q2', selectedOptionId: 'C' }, // Grammar: Wrong
      { questionId: 'q3', selectedOptionId: 'A' }, // Reading: Correct
      { questionId: 'q4', selectedOptionId: 'B' }, // Listening: Wrong
    ];

    const result = calculateAssessmentScore(mockQuestions, mockOfficialAnswers, userAnswers);

    assert.ok(result.strengths.length > 0);
    assert.ok(result.weaknesses.length > 0);
    assert.ok(result.recommendations.length > 0);
  });
});
