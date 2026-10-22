import { z } from 'zod';

export type ToeicPart = 1 | 2 | 3 | 4 | 5 | 6 | 7;
export type ToeicSection = 'listening' | 'reading';
export type ToeicTestType = 'full_test' | 'mini_test' | 'part_practice';

export interface ToeicQuestionOption {
  id: string; // 'A' | 'B' | 'C' | 'D'
  text: string;
}

export interface ClientToeicQuestion {
  id: string;
  formId: string;
  section: ToeicSection;
  partNumber: number;
  questionNumber: number;
  prompt: string;
  contextText?: string | null;
  audioUrl?: string | null;
  imageUrl?: string | null;
  options: ToeicQuestionOption[];
  passageGroupId?: string | null;
  weight?: number;
}

export interface ToeicFormSummary {
  id: string;
  slug: string;
  title: string;
  description?: string | null;
  testType: ToeicTestType;
  targetPart?: number | null;
  timeLimitMinutes: number;
  totalQuestions: number;
  isPublished: boolean;
}

export interface ToeicPartScore {
  partNumber: number;
  partName: string;
  section: ToeicSection;
  total: number;
  correct: number;
  accuracy: number; // 0 to 100 percentage
}

export interface ToeicAttempt {
  id: string;
  userId: string;
  formId: string;
  status: 'in_progress' | 'submitted' | 'abandoned';
  testType: string;
  startedAt: string;
  submittedAt?: string | null;
  timeSpentSeconds: number;
  listeningRawScore: number;
  readingRawScore: number;
  estimatedListeningScore: number;
  estimatedReadingScore: number;
  estimatedTotalScore: number;
  partScores: Record<string, ToeicPartScore>;
  scoringVersion: string;
  metadata?: Record<string, unknown>;
}

export interface ToeicDetailedAnswerReview {
  questionId: string;
  questionNumber: number;
  partNumber: number;
  section: ToeicSection;
  prompt: string;
  contextText?: string | null;
  audioUrl?: string | null;
  imageUrl?: string | null;
  options: ToeicQuestionOption[];
  selectedOptionId: string | null;
  correctOptionId: string;
  isCorrect: boolean;
  explanation: string;
  transcriptText?: string | null;
}

export interface ToeicWeaknessAnalysis {
  strongestParts: string[];
  weakestParts: string[];
  overallDiagnosis: string;
  targetedActionPlan: string[];
  recommendedGeneralEnglishTopics: {
    title: string;
    skill: string;
    href: string;
  }[];
}

export interface ToeicResultView {
  attempt: ToeicAttempt;
  form: ToeicFormSummary;
  reviews: ToeicDetailedAnswerReview[];
  analysis: ToeicWeaknessAnalysis;
  disclaimer: string;
}

// Zod validation schemas
export const saveToeicAnswerSchema = z.object({
  attemptId: z.string().min(1, 'Mã lượt thi không hợp lệ'),
  questionId: z.string().min(1, 'Mã câu hỏi không hợp lệ'),
  selectedOptionId: z.string().max(10),
  timeSpentSeconds: z.number().int().nonnegative().optional()
});

export const submitToeicTestSchema = z.object({
  attemptId: z.string().min(1, 'Mã lượt thi không hợp lệ'),
  timeSpentSeconds: z.number().int().nonnegative().default(0),
  answers: z.record(z.string(), z.string())
});

export const askToeicAiTutorSchema = z.object({
  questionId: z.string().uuid('Mã câu hỏi không hợp lệ'),
  userPrompt: z.string().min(2, 'Vui lòng nhập câu hỏi ít nhất 2 ký tự').max(1000)
});
