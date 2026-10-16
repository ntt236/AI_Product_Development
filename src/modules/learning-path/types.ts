import type { CEFRLevel } from '@/modules/profile/types';
import type { AssessmentSkill } from '@/modules/assessment/types';

export type LearningPathStatus =
  | 'proposed'
  | 'active'
  | 'paused'
  | 'completed'
  | 'rejected'
  | 'archived';

export type PathItemType = 'milestone' | 'module' | 'topic';

export type ContentStatus = 'available' | 'planned_curriculum';

export type PathItemStatus =
  | 'locked'
  | 'available'
  | 'in_progress'
  | 'completed'
  | 'skipped';

export type LearningSkill = AssessmentSkill | 'speaking' | 'writing' | 'toeic';

export interface LearningPath {
  id: string;
  user_id: string;
  goal_id: string | null;
  title: string;
  description: string | null;
  target_level: CEFRLevel;
  total_estimated_minutes: number;
  estimated_weeks: number;
  status: LearningPathStatus;
  is_user_modified: boolean;
  current_version: number;
  created_at: string;
  updated_at: string;
}

export interface LearningPathVersion {
  id: string;
  learning_path_id: string;
  version_number: number;
  change_reason: string;
  created_by: 'user' | 'system' | 'ai';
  snapshot: LearningPathSnapshot;
  created_at: string;
}

export interface LearningPathItem {
  id: string;
  learning_path_id: string;
  parent_id: string | null;
  item_type: PathItemType;
  title: string;
  description: string | null;
  skill: LearningSkill | null;
  target_level: CEFRLevel | null;
  position: number;
  estimated_minutes: number;
  content_status: ContentStatus;
  status: PathItemStatus;
  metadata?: Record<string, unknown>;
  created_at?: string;
  updated_at?: string;
}

export interface TopicItemDraft {
  title: string;
  description: string;
  skill: LearningSkill;
  target_level: CEFRLevel;
  estimated_minutes: number;
  content_status: ContentStatus;
  rationale?: string;
}

export interface ModuleDraft {
  title: string;
  description: string;
  skill?: LearningSkill;
  topics: TopicItemDraft[];
}

export interface MilestoneDraft {
  title: string;
  description: string;
  position: number;
  modules: ModuleDraft[];
}

export interface LearningPathSnapshot {
  title: string;
  description: string;
  target_level: CEFRLevel;
  total_estimated_minutes: number;
  estimated_weeks: number;
  milestones: MilestoneDraft[];
  generated_at: string;
}

export interface LearnerProfileSummary {
  userId: string;
  displayName: string;
  estimatedLevel: CEFRLevel;
  primaryGoalType: string;
  primaryGoalTitle: string;
  targetToeicScore?: number | null;
  secondaryGoals: string[];
  dailyMinutes: number;
  studyDays: number[];
  hasCompletedAssessment: boolean;
  skillProfiles: Record<
    AssessmentSkill,
    {
      abilityScore: number;
      level: CEFRLevel;
      confidence: number;
      evidenceCount: number;
    }
  >;
}

export type WeaknessSeverity = 'critical' | 'developing' | 'strength';

export interface SkillPriority {
  skill: AssessmentSkill;
  title: string;
  abilityScore: number; // 0..1
  goalWeight: number;   // 1.0..1.5
  priorityScore: number;
  severity: WeaknessSeverity;
  rationale: string;
}

export interface GeneratedPathProposal {
  title: string;
  description: string;
  targetLevel: CEFRLevel;
  totalEstimatedMinutes: number;
  weeklyAvailableMinutes: number;
  estimatedWeeks: number;
  isStarterPath: boolean;
  skillPriorities: SkillPriority[];
  milestones: MilestoneDraft[];
}
