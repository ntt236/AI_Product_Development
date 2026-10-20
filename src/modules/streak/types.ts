export type StreakStatus =
  | 'active_today' // Already completed an activity today; flame is bright
  | 'at_risk' // Studied yesterday, hasn't studied today yet; flame needs feeding
  | 'broken' // Missed yesterday or longer; streak reset
  | 'not_started'; // Brand new user, no activity recorded yet

export interface StreakInfo {
  currentStreak: number;
  longestStreak: number;
  lastStudyDate: string | null; // 'YYYY-MM-DD'
  hasStudiedToday: boolean;
  streakStatus: StreakStatus;
}

export interface StreakUpdateResult {
  previousStreak: number;
  newStreak: number;
  longestStreak: number;
  lastStudyDate: string;
  isExtended: boolean;
  isAlreadyStudiedToday: boolean;
}

export type StudyActivityType =
  | 'practice'
  | 'vocabulary_review'
  | 'lesson'
  | 'listening_practice';
