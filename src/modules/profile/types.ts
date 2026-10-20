export type CEFRLevel =
  | 'pre_a1'
  | 'a1'
  | 'a2'
  | 'b1'
  | 'b2'
  | 'c1'
  | 'c2';

export interface Profile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  native_language: string;
  timezone: string;
  estimated_level: CEFRLevel | null;
  onboarding_completed_at: string | null;
  current_streak?: number;
  longest_streak?: number;
  last_study_date?: string | null;
  created_at: string;
  updated_at: string;
}
