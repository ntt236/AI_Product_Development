import type { CEFRLevel } from '@/modules/profile/types';

export type AssessmentSkill = 'vocabulary' | 'grammar' | 'reading' | 'listening';

export interface QuestionOption {
  id: string; // 'A' | 'B' | 'C' | 'D'
  text: string;
}

export interface Assessment {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  assessment_type: 'placement' | 'lesson' | 'skill' | 'toeic';
  time_limit_seconds: number | null;
  total_questions: number;
  is_published: boolean;
  version: number;
  created_at: string;
  updated_at: string;
}

/**
 * Public, client-safe question representation (no correct answer).
 */
export interface ClientAssessmentQuestion {
  id: string;
  assessment_id: string;
  skill: AssessmentSkill;
  category: string;
  difficulty: number;
  level: CEFRLevel;
  question_type: 'multiple_choice' | 'fill_blank';
  prompt: string;
  context_text: string | null;
  audio_url: string | null;
  options: QuestionOption[];
  position: number;
  weight: number;
}

/**
 * Server-only answer key.
 */
export interface QuestionAnswerKey {
  question_id: string;
  correct_option_id: string;
  explanation: string;
}

export type AttemptStatus = 'in_progress' | 'submitted' | 'completed' | 'abandoned';

export interface AssessmentAttempt {
  id: string;
  user_id: string;
  assessment_id: string;
  status: AttemptStatus;
  started_at: string;
  submitted_at: string | null;
  completed_at: string | null;
  total_questions: number;
  answered_count: number;
  score: number | null;
  max_score: number | null;
  accuracy: number | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface AssessmentAnswerRecord {
  id: string;
  attempt_id: string;
  question_id: string;
  selected_option_id: string;
  is_correct: boolean | null;
  score_awarded: number | null;
  time_spent_seconds: number | null;
  created_at: string;
  updated_at: string;
}

export interface SkillScoreSummary {
  skill: AssessmentSkill;
  title: string;
  totalQuestions: number;
  correctCount: number;
  accuracy: number; // 0..1
  estimatedLevel: CEFRLevel;
}

export interface AssessmentResult {
  id: string;
  attempt_id: string;
  user_id: string;
  overall_level: CEFRLevel;
  total_questions: number;
  correct_answers: number;
  total_score: number;
  max_score: number;
  accuracy: number;
  skill_scores: Record<AssessmentSkill, SkillScoreSummary>;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  scoring_version: string;
  created_at: string;
}

export interface DetailedAnswerReview {
  question: ClientAssessmentQuestion;
  selectedOptionId: string | null;
  correctOptionId: string;
  isCorrect: boolean;
  explanation: string;
}
