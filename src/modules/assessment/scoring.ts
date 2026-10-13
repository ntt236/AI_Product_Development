import type { CEFRLevel } from '@/modules/profile/types';
import type {
  AssessmentSkill,
  ClientAssessmentQuestion,
  QuestionAnswerKey,
  SkillScoreSummary,
} from './types';

export const SCORING_VERSION = '1.0.0';

export const SKILL_TITLES: Record<AssessmentSkill, string> = {
  vocabulary: 'Từ vựng (Vocabulary)',
  grammar: 'Ngữ pháp (Grammar)',
  reading: 'Đọc hiểu (Reading)',
  listening: 'Nghe hiểu / Hội thoại (Listening)',
};

/**
 * Maps raw accuracy (0..1) to CEFR-inspired estimated proficiency level.
 * Note: This is an internal algorithmic estimate for adaptive learning guidance,
 * not an official CEFR certificate.
 */
export function mapAccuracyToCEFR(accuracy: number): CEFRLevel {
  if (accuracy >= 0.85) return 'b2';
  if (accuracy >= 0.70) return 'b1';
  if (accuracy >= 0.50) return 'a2';
  if (accuracy >= 0.35) return 'a1';
  return 'pre_a1';
}

export interface UserAnswerInput {
  questionId: string;
  selectedOptionId: string;
  timeSpentSeconds?: number;
}

export interface ScoredQuestionResult {
  questionId: string;
  selectedOptionId: string;
  correctOptionId: string;
  isCorrect: boolean;
  scoreAwarded: number;
  weight: number;
  skill: AssessmentSkill;
  timeSpentSeconds: number;
}

export interface CalculatedAssessmentScore {
  totalQuestions: number;
  answeredCount: number;
  correctAnswers: number;
  totalScore: number;
  maxScore: number;
  accuracy: number;
  overallLevel: CEFRLevel;
  skillScores: Record<AssessmentSkill, SkillScoreSummary>;
  scoredAnswers: ScoredQuestionResult[];
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  scoringVersion: string;
}

/**
 * Computes deterministic score and skill profile for an assessment attempt.
 * Completely client-independent and strictly verified against authoritative answer keys.
 */
export function calculateAssessmentScore(
  questions: ClientAssessmentQuestion[],
  officialAnswers: QuestionAnswerKey[],
  userAnswers: UserAnswerInput[]
): CalculatedAssessmentScore {
  const answerKeyMap = new Map<string, string>();
  for (const item of officialAnswers) {
    answerKeyMap.set(item.question_id, item.correct_option_id);
  }

  const userAnswerMap = new Map<string, UserAnswerInput>();
  for (const item of userAnswers) {
    userAnswerMap.set(item.questionId, item);
  }

  const scoredAnswers: ScoredQuestionResult[] = [];
  let totalScore = 0;
  let maxScore = 0;
  let correctCount = 0;

  const skillStats: Record<
    AssessmentSkill,
    { total: number; correct: number; totalWeight: number; scoreAwarded: number }
  > = {
    vocabulary: { total: 0, correct: 0, totalWeight: 0, scoreAwarded: 0 },
    grammar: { total: 0, correct: 0, totalWeight: 0, scoreAwarded: 0 },
    reading: { total: 0, correct: 0, totalWeight: 0, scoreAwarded: 0 },
    listening: { total: 0, correct: 0, totalWeight: 0, scoreAwarded: 0 },
  };

  for (const q of questions) {
    const correctOptionId = answerKeyMap.get(q.id) || '';
    const userSubmission = userAnswerMap.get(q.id);
    const selectedOptionId = userSubmission ? userSubmission.selectedOptionId.trim() : '';

    const isCorrect = Boolean(
      selectedOptionId &&
      correctOptionId &&
      selectedOptionId.toUpperCase() === correctOptionId.toUpperCase()
    );

    const weight = q.weight || 1.0;
    const scoreAwarded = isCorrect ? weight : 0;

    maxScore += weight;
    totalScore += scoreAwarded;
    if (isCorrect) correctCount++;

    const stats = skillStats[q.skill] || {
      total: 0,
      correct: 0,
      totalWeight: 0,
      scoreAwarded: 0,
    };
    stats.total += 1;
    stats.totalWeight += weight;
    if (isCorrect) stats.correct += 1;
    stats.scoreAwarded += scoreAwarded;

    scoredAnswers.push({
      questionId: q.id,
      selectedOptionId,
      correctOptionId,
      isCorrect,
      scoreAwarded,
      weight,
      skill: q.skill,
      timeSpentSeconds: userSubmission?.timeSpentSeconds || 0,
    });
  }

  const totalQuestions = questions.length;
  const answeredCount = userAnswers.filter((a) => a.selectedOptionId).length;
  const accuracy = maxScore > 0 ? Number((totalScore / maxScore).toFixed(4)) : 0;
  const overallLevel = mapAccuracyToCEFR(accuracy);

  // Compute Skill Scores
  const skillScores = {} as Record<AssessmentSkill, SkillScoreSummary>;
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const recommendations: string[] = [];

  const skillsList: AssessmentSkill[] = ['vocabulary', 'grammar', 'reading', 'listening'];

  for (const skill of skillsList) {
    const stats = skillStats[skill];
    const skillAccuracy = stats.total > 0 ? Number((stats.correct / stats.total).toFixed(4)) : 0;
    const estimatedSkillLevel = mapAccuracyToCEFR(skillAccuracy);

    skillScores[skill] = {
      skill,
      title: SKILL_TITLES[skill],
      totalQuestions: stats.total,
      correctCount: stats.correct,
      accuracy: skillAccuracy,
      estimatedLevel: estimatedSkillLevel,
    };

    if (skillAccuracy >= 0.70) {
      if (skill === 'vocabulary') strengths.push('Vốn từ vựng tương đối phong phú, nhận biết ngữ cảnh tốt');
      if (skill === 'grammar') strengths.push('Nắm chắc các cấu trúc ngữ pháp và thì cơ bản');
      if (skill === 'reading') strengths.push('Khả năng đọc hiểu chi tiết và bắt ý chính tốt');
      if (skill === 'listening') strengths.push('Phản xạ đối thoại và nhận diện ý giao tiếp tốt');
    } else if (skillAccuracy <= 0.50) {
      if (skill === 'vocabulary') {
        weaknesses.push('Cần mở rộng vốn từ vựng học thuật và collocations theo chủ đề');
        recommendations.push('Ôn luyện từ vựng cốt lõi hàng ngày qua Flashcards & ngữ cảnh thực tế');
      }
      if (skill === 'grammar') {
        weaknesses.push('Chưa vững các thì quá khứ và mệnh đề điều kiện phức tạp');
        recommendations.push('Hệ thống hóa lại các chuyên đề ngữ pháp nền tảng và bài tập ứng dụng');
      }
      if (skill === 'reading') {
        weaknesses.push('Kỹ năng đọc quét thông tin (scanning) và suy luận logic còn hạn chế');
        recommendations.push('Luyện tập các đoạn văn ngắn theo phương pháp Skimming & Scanning');
      }
      if (skill === 'listening') {
        weaknesses.push('Phản xạ ngữ điệu và giao tiếp thực tế cần được rèn luyện thêm');
        recommendations.push('Thực hành nghe hội thoại hàng ngày và luyện nói nhại (shadowing)');
      }
    }
  }

  // Ensure non-empty default feedback
  if (strengths.length === 0) {
    strengths.push('Tinh thần học tập nghiêm túc, sẵn sàng bắt đầu lộ trình bứt phá');
  }
  if (weaknesses.length === 0) {
    weaknesses.push('Cần duy trì độ chính xác cao khi tiếp cận các chủ đề nâng cao');
  }
  if (recommendations.length === 0) {
    recommendations.push('Bắt đầu lộ trình thích ứng được cá nhân hóa ở Phase 3 để duy trì phong độ');
  }

  return {
    totalQuestions,
    answeredCount,
    correctAnswers: correctCount,
    totalScore: Number(totalScore.toFixed(2)),
    maxScore: Number(maxScore.toFixed(2)),
    accuracy,
    overallLevel,
    skillScores,
    scoredAnswers,
    strengths,
    weaknesses,
    recommendations,
    scoringVersion: SCORING_VERSION,
  };
}
