import { z } from 'zod';

export const ExerciseExplanationRequestSchema = z.object({
  submissionId: z.string().uuid('ID bài nộp không hợp lệ.'),
  exerciseId: z.string().uuid('ID câu hỏi không hợp lệ.'),
  userQuery: z
    .string()
    .max(300, 'Câu hỏi thêm không được vượt quá 300 ký tự.')
    .optional(),
});

export type ExerciseExplanationRequest = z.infer<typeof ExerciseExplanationRequestSchema>;

export const AITutorExplanationSchema = z.object({
  explanation: z
    .string()
    .min(10, 'Lời giải thích quá ngắn.')
    .max(2000, 'Lời giải thích quá dài.'),
  rule_summary: z
    .string()
    .min(5, 'Tóm tắt quy tắc quá ngắn.')
    .max(800, 'Tóm tắt quy tắc quá dài.'),
  examples: z
    .array(z.string().min(5).max(400))
    .min(1, 'Cần ít nhất 1 ví dụ minh họa.')
    .max(5, 'Tối đa 5 ví dụ minh họa.'),
  next_step_tip: z
    .string()
    .min(5, 'Gợi ý ôn tập quá ngắn.')
    .max(800, 'Gợi ý ôn tập quá dài.'),
});

export type AITutorExplanation = z.infer<typeof AITutorExplanationSchema>;

export interface AITutorExplanationResponse {
  success: boolean;
  explanation?: AITutorExplanation;
  promptVersion?: string;
  model?: string;
  isFallback?: boolean;
  error?: string;
  errorCode?: string;
  retryAfterSeconds?: number;
}

export interface LearnerTutorContext {
  level: string;
  goalTitle: string;
  goalType: string;
}

export interface VerifiedExerciseContext {
  submissionId: string;
  exerciseId: string;
  lessonTitle: string;
  skill: string;
  prompt: string;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  teacherExplanation: string;
  userQuery?: string;
}
