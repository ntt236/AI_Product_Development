'use server';

import { createClient } from '@/lib/supabase/server';
import {
  SaveWordInputSchema,
  SubmitReviewSessionSchema,
  type SaveWordInput,
  type SubmitReviewSessionInput,
  type UserVocabularyItem,
} from './types';
import {
  deleteWordFromNotebook,
  getDueVocabularyList,
  getUserVocabularyList,
  getVocabularyStats,
  saveWordToNotebook,
  submitVocabularyReview,
} from './services';

export interface ActionResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Server action to save a word to the user's personal notebook
 */
export async function saveWordAction(
  input: SaveWordInput
): Promise<ActionResponse<{ item: UserVocabularyItem; alreadyExisted: boolean }>> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: 'Yêu cầu đăng nhập để lưu từ vựng.' };
    }

    const parsed = SaveWordInputSchema.safeParse(input);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues.map((i) => i.message).join(', '),
      };
    }

    const result = await saveWordToNotebook(user.id, parsed.data);
    return { success: true, data: result };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Lỗi hệ thống khi lưu từ vựng.',
    };
  }
}

/**
 * Server action to delete a word from personal notebook
 */
export async function deleteWordAction(
  vocabId: string
): Promise<ActionResponse<{ deletedId: string }>> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: 'Yêu cầu đăng nhập để xóa từ vựng.' };
    }

    if (!vocabId || typeof vocabId !== 'string') {
      return { success: false, error: 'Mã từ vựng không hợp lệ.' };
    }

    await deleteWordFromNotebook(user.id, vocabId);
    return { success: true, data: { deletedId: vocabId } };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Lỗi hệ thống khi xóa từ vựng.',
    };
  }
}

/**
 * Server action to submit a completed vocabulary review session
 */
export async function submitReviewSessionAction(
  input: SubmitReviewSessionInput
): Promise<ActionResponse<{ updatedCount: number; items: UserVocabularyItem[]; sessionAlreadyProcessed: boolean }>> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: 'Yêu cầu đăng nhập để gửi kết quả ôn tập.' };
    }

    const parsed = SubmitReviewSessionSchema.safeParse(input);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues.map((i) => i.message).join(', '),
      };
    }

    const result = await submitVocabularyReview(user.id, parsed.data);
    return { success: true, data: result };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Lỗi hệ thống khi gửi kết quả ôn tập.',
    };
  }
}

/**
 * Server action to fetch due vocabulary for current user
 */
export async function getDueVocabularyAction(): Promise<ActionResponse<UserVocabularyItem[]>> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: 'Yêu cầu đăng nhập.' };
    }

    const items = await getDueVocabularyList(user.id);
    return { success: true, data: items };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Lỗi khi tải danh sách từ cần ôn.',
    };
  }
}

/**
 * Server action to fetch all notebook words and statistics
 */
export async function getNotebookSummaryAction(): Promise<ActionResponse<{ items: UserVocabularyItem[]; stats: ReturnType<typeof getVocabularyStats> extends Promise<infer S> ? S : never }>> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: 'Yêu cầu đăng nhập.' };
    }

    const items = await getUserVocabularyList(user.id);
    const stats = await getVocabularyStats(user.id);

    return { success: true, data: { items, stats } };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Lỗi khi tải sổ từ vựng.',
    };
  }
}
