import type { AssessmentSkill } from '@/modules/assessment/types';
import type { CEFRLevel } from '@/modules/profile/types';

export type DailyPlanStatus =
  | 'planned'
  | 'in_progress'
  | 'completed'
  | 'partially_completed'
  | 'skipped';

export type DailyTaskStatus = 'pending' | 'in_progress' | 'completed' | 'skipped';

export type ActivityType = 'lesson' | 'practice' | 'review' | 'assessment';

export interface DailyPlanGenerationReason {
  primaryGoal?: string;
  studyDays?: number[];
  isScheduledDay?: boolean;
  activePathTitle?: string;
  source?: 'path_curriculum' | 'review_fallback' | 'starter_foundation';
  notes?: string;
}

export interface DailyPlanTask {
  id: string;
  daily_plan_id: string;
  user_id: string;
  learning_path_item_id?: string | null;
  content_item_id?: string | null;
  title: string;
  description?: string | null;
  activity_type: ActivityType;
  skill?: AssessmentSkill | 'toeic' | null;
  position: number;
  estimated_minutes: number;
  content_status: 'available' | 'planned_curriculum';
  status: DailyTaskStatus;
  score?: number | null;
  accuracy?: number | null;
  started_at?: string | null;
  completed_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface DailyPlan {
  id: string;
  user_id: string;
  learning_path_id?: string | null;
  plan_date: string; // YYYY-MM-DD
  target_minutes: number;
  completed_minutes: number;
  status: DailyPlanStatus;
  generation_reason: DailyPlanGenerationReason;
  tasks: DailyPlanTask[];
  created_at?: string;
  updated_at?: string;
}

export interface ContentVocabularyWord {
  word: string;
  ipa: string;
  part_of_speech: string;
  meaning_vi: string;
  example: string;
  note?: string;
}

export interface ContentGrammarRule {
  name: string;
  formula: string;
  explanation: string;
  examples: string[];
}

export interface ContentItemBody {
  overview?: string;
  words?: ContentVocabularyWord[];
  rules?: ContentGrammarRule[];
}

export interface ContentItem {
  id: string;
  slug: string;
  title: string;
  description?: string | null;
  content_type: 'lesson' | 'grammar' | 'vocabulary_set' | 'reading' | 'listening' | 'practice';
  skill: AssessmentSkill | 'toeic';
  level: CEFRLevel;
  estimated_minutes: number;
  body: ContentItemBody;
  is_published: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface PracticeExerciseOption {
  id: string;
  text: string;
}

export interface PracticeExerciseClient {
  id: string;
  content_item_id: string;
  exercise_type: 'multiple_choice' | 'fill_blank';
  prompt: string;
  context_text?: string | null;
  options: PracticeExerciseOption[];
  position: number;
  weight: number;
}

export interface UserPracticeAnswerInput {
  exercise_id: string;
  selected_option_id: string;
}

export interface QuestionFeedbackItem {
  exercise_id: string;
  prompt: string;
  user_answer: string;
  correct_answer: string;
  user_option_id?: string;
  correct_option_id?: string;
  is_correct: boolean;
  explanation: string;
}

export interface PracticeSubmissionResult {
  submission_id: string;
  task_id?: string | null;
  score: number;
  max_score: number;
  accuracy: number;
  percentage: number;
  breakdown: QuestionFeedbackItem[];
  new_task_status: DailyTaskStatus;
  plan_progress: {
    completed_tasks: number;
    total_tasks: number;
    completed_minutes: number;
    target_minutes: number;
    plan_status: DailyPlanStatus;
  };
}
