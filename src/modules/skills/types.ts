import { z } from 'zod';
import type { AssessmentSkill } from '@/modules/assessment/types';

export type FourSkill = AssessmentSkill | 'speaking' | 'writing';

export interface SkillItemCatalog {
  slug: string;
  title: string;
  description: string;
  skill: FourSkill;
  level: string;
  estimatedMinutes: number;
  status: 'ready' | 'planned';
  contentItemSlug?: string;
  badgeLabel: string;
  highlights?: string[];
  audioUrl?: string;
}

export interface WritingGrammarCorrection {
  error_quote: string;
  correction: string;
  explanation: string;
}

export interface WritingVocabularyEnhancement {
  original: string;
  suggestion: string;
  reason: string;
}

export interface WritingRubricScores {
  task_achievement: number; // 0-25
  grammar_accuracy: number; // 0-30
  lexical_resource: number; // 0-25
  coherence_organization: number; // 0-20
  total_score: number; // 0-100
}

export interface WritingEvaluationResult {
  overall_feedback: string;
  word_count: number;
  rubric_scores: WritingRubricScores;
  grammar_corrections: WritingGrammarCorrection[];
  vocabulary_enhancements: WritingVocabularyEnhancement[];
  improved_version: {
    text: string;
    rationale: string;
  };
  next_steps: string[];
  evaluation_source?: 'ai_provider' | 'fallback_heuristic';
}

export interface SpeakingGrammarCorrection {
  error_quote: string;
  correction: string;
  explanation: string;
}

export interface SpeakingVocabularyEnhancement {
  original: string;
  suggestion: string;
  reason: string;
}

export interface SpeakingRubricScores {
  relevance_fluency: number; // 0-25
  spoken_grammar: number; // 0-30
  conversational_vocab: number; // 0-25
  naturalness_sample: number; // 0-20
  total_score: number; // 0-100
}

export interface SpeakingEvaluationResult {
  overall_feedback: string;
  relevance_and_fluency: string;
  word_count: number;
  rubric_scores: SpeakingRubricScores;
  grammar_corrections: SpeakingGrammarCorrection[];
  vocabulary_enhancements: SpeakingVocabularyEnhancement[];
  sample_spoken_response: {
    text: string;
    key_phrases: string[];
    rationale: string;
  };
  next_steps: string[];
  evaluation_source?: 'ai_provider' | 'fallback_heuristic';
}

// Validation schemas for user input
export const submitWritingInputSchema = z.object({
  taskId: z.string().uuid().nullable().optional().or(z.literal('')),
  contentItemId: z.string().uuid(),
  essayText: z
    .string()
    .trim()
    .min(10, 'Bài viết phải có ít nhất 10 ký tự.')
    .max(3000, 'Bài viết vượt quá giới hạn 3000 ký tự.')
    .refine((val) => val.trim().split(/\s+/).filter(Boolean).length >= 10, {
      message: 'Bài viết của bạn quá ngắn (tối thiểu 10 từ). Hãy viết thêm để AI có thể đánh giá chi tiết.',
    }),
  durationSeconds: z.number().int().nonnegative().default(0),
});

export const submitSpeakingInputSchema = z.object({
  taskId: z.string().uuid().nullable().optional().or(z.literal('')),
  contentItemId: z.string().uuid(),
  transcriptText: z
    .string()
    .trim()
    .min(10, 'Transcript câu trả lời phải có ít nhất 10 ký tự.')
    .max(2500, 'Transcript vượt quá giới hạn 2500 ký tự.')
    .refine((val) => val.trim().split(/\s+/).filter(Boolean).length >= 10, {
      message: 'Transcript câu trả lời quá ngắn (tối thiểu 10 từ). Hãy nhập thêm nội dung.',
    }),
  durationSeconds: z.number().int().nonnegative().default(0),
});
