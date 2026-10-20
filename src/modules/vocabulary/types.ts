import { z } from 'zod';

export type VocabularyStatus = 'learning' | 'reviewing' | 'mastered';
export type VocabularyReviewResult = 'remembered' | 'forgot';

export interface CuratedVocabularyItem {
  id: string;
  content_item_id?: string | null;
  content_item_slug?: string;
  word: string;
  word_normalized: string;
  part_of_speech: string;
  ipa: string;
  meaning_vi: string;
  example: string;
  note?: string;
  topic: string;
  level: string;
}

export interface UserVocabularyItem {
  id: string;
  user_id: string;
  vocabulary_item_id?: string | null;
  word: string;
  word_normalized: string;
  part_of_speech?: string | null;
  ipa?: string | null;
  meaning_vi: string;
  example?: string | null;
  custom_notes?: string | null;
  status: VocabularyStatus;
  interval_days: number;
  consecutive_correct: number;
  review_count: number;
  last_reviewed_at?: string | null;
  next_review_at: string;
  created_at: string;
  updated_at: string;
}

export interface VocabularyReviewLog {
  id: string;
  user_id: string;
  user_vocab_id: string;
  review_session_id: string;
  result: VocabularyReviewResult;
  interval_before: number;
  interval_after: number;
  reviewed_at: string;
}

export interface VocabularyStats {
  totalWords: number;
  dueWords: number;
  learningWords: number;
  reviewingWords: number;
  masteredWords: number;
}

export interface ReviewScheduleCalculation {
  intervalDays: number;
  consecutiveCorrect: number;
  status: VocabularyStatus;
  nextReviewAt: string;
}

// Validation schemas
export const SaveWordInputSchema = z.object({
  vocabulary_item_id: z.string().uuid().optional().nullable(),
  word: z.string().min(1, 'Từ vựng không được để trống').max(100),
  part_of_speech: z.string().max(50).optional().nullable(),
  ipa: z.string().max(100).optional().nullable(),
  meaning_vi: z.string().min(1, 'Nghĩa tiếng Việt không được để trống').max(500),
  example: z.string().max(1000).optional().nullable(),
  custom_notes: z.string().max(1000).optional().nullable(),
});

export type SaveWordInput = z.infer<typeof SaveWordInputSchema>;

export const ReviewSubmissionItemSchema = z.object({
  userVocabId: z.string().min(1),
  result: z.enum(['remembered', 'forgot']),
});

export const SubmitReviewSessionSchema = z.object({
  reviewSessionId: z.string().min(1),
  reviews: z.array(ReviewSubmissionItemSchema).min(1, 'Danh sách ôn tập không được rỗng'),
});

export type SubmitReviewSessionInput = z.infer<typeof SubmitReviewSessionSchema>;
