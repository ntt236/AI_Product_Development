import {
  ToeicPart,
  ToeicSection,
  ToeicPartScore,
  ToeicDetailedAnswerReview,
  ClientToeicQuestion,
} from './types';
import { calculateToeicScaledScores } from './conversion-table';

export const TOEIC_PART_NAMES: Record<number, { name: string; section: ToeicSection }> = {
  1: { name: 'Part 1: Photographs', section: 'listening' },
  2: { name: 'Part 2: Question-Response', section: 'listening' },
  3: { name: 'Part 3: Short Conversations', section: 'listening' },
  4: { name: 'Part 4: Short Talks', section: 'listening' },
  5: { name: 'Part 5: Incomplete Sentences', section: 'reading' },
  6: { name: 'Part 6: Text Completion', section: 'reading' },
  7: { name: 'Part 7: Reading Comprehension', section: 'reading' }
};

/**
 * Maps database category (e.g. 'toeic_part_1', 'toeic_part_5') to Part number (1..7).
 */
export function parsePartNumberFromCategory(category: string, skill: string): number {
  const match = category?.match(/part_(\d)/i);
  if (match) return parseInt(match[1], 10);
  if (skill === 'listening') return 1;
  return 5;
}

export interface RawAnswerKey {
  questionId: string;
  correctOptionId: string;
  explanation: string;
  transcriptText?: string | null;
}

export interface EvaluationOutcome {
  listeningRawScore: number;
  readingRawScore: number;
  estimatedListeningScore: number;
  estimatedReadingScore: number;
  estimatedTotalScore: number;
  totalCorrect: number;
  totalQuestions: number;
  overallAccuracy: number;
  partScores: Record<string, ToeicPartScore>;
  reviews: ToeicDetailedAnswerReview[];
  scoringVersion: string;
  disclaimer: string;
}

/**
 * Pure function to evaluate a TOEIC submission.
 * Completely deterministic and unit testable.
 */
export function evaluateToeicSubmission(params: {
  questions: ClientToeicQuestion[];
  answerKeys: Map<string, RawAnswerKey>;
  userAnswers: Record<string, string>; // questionId -> selectedOptionId
}): EvaluationOutcome {
  const { questions, answerKeys, userAnswers } = params;

  let listeningCorrect = 0;
  let listeningTotal = 0;
  let readingCorrect = 0;
  let readingTotal = 0;

  const partStats: Record<number, { total: number; correct: number }> = {
    1: { total: 0, correct: 0 },
    2: { total: 0, correct: 0 },
    3: { total: 0, correct: 0 },
    4: { total: 0, correct: 0 },
    5: { total: 0, correct: 0 },
    6: { total: 0, correct: 0 },
    7: { total: 0, correct: 0 }
  };

  const reviews: ToeicDetailedAnswerReview[] = [];

  for (const q of questions) {
    const key = answerKeys.get(q.id);
    const selected = userAnswers[q.id]?.trim() || null;
    const correctOptionId = key ? key.correctOptionId.trim() : '';
    const isCorrect = Boolean(selected && correctOptionId && selected.toUpperCase() === correctOptionId.toUpperCase());

    const partNum = q.partNumber as ToeicPart;
    if (partStats[partNum]) {
      partStats[partNum].total += 1;
      if (isCorrect) partStats[partNum].correct += 1;
    }

    if (q.section === 'listening') {
      listeningTotal += 1;
      if (isCorrect) listeningCorrect += 1;
    } else {
      readingTotal += 1;
      if (isCorrect) readingCorrect += 1;
    }

    reviews.push({
      questionId: q.id,
      questionNumber: q.questionNumber,
      partNumber: q.partNumber,
      section: q.section,
      prompt: q.prompt,
      contextText: q.contextText ?? null,
      audioUrl: q.audioUrl ?? null,
      imageUrl: q.imageUrl ?? null,
      options: q.options,
      selectedOptionId: selected,
      correctOptionId,
      isCorrect,
      explanation: key?.explanation || 'Không có giải thích chi tiết cho câu hỏi này.',
      transcriptText: key?.transcriptText ?? null
    });
  }

  // Calculate scaled scores
  const scoreResult = calculateToeicScaledScores({
    listeningCorrect,
    listeningTotal,
    readingCorrect,
    readingTotal
  });

  // Build partScores breakdown
  const partScores: Record<string, ToeicPartScore> = {};
  for (let p = 1; p <= 7; p++) {
    const stat = partStats[p];
    if (stat && stat.total > 0) {
      const info = TOEIC_PART_NAMES[p];
      partScores[`part_${p}`] = {
        partNumber: p,
        partName: info?.name || `Part ${p}`,
        section: info?.section || (p <= 4 ? 'listening' : 'reading'),
        total: stat.total,
        correct: stat.correct,
        accuracy: Math.round((stat.correct / stat.total) * 100)
      };
    }
  }

  const totalQuestions = questions.length;
  const totalCorrect = listeningCorrect + readingCorrect;
  const overallAccuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;

  return {
    listeningRawScore: scoreResult.listeningRawScore,
    readingRawScore: scoreResult.readingRawScore,
    estimatedListeningScore: scoreResult.estimatedListeningScore,
    estimatedReadingScore: scoreResult.estimatedReadingScore,
    estimatedTotalScore: scoreResult.estimatedTotalScore,
    totalCorrect,
    totalQuestions,
    overallAccuracy,
    partScores,
    reviews,
    scoringVersion: scoreResult.scoringVersion,
    disclaimer: scoreResult.disclaimer
  };
}
