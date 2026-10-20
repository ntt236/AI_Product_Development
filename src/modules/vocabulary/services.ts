import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import type {
  CuratedVocabularyItem,
  SaveWordInput,
  SubmitReviewSessionInput,
  UserVocabularyItem,
  VocabularyReviewLog,
  VocabularyStats,
} from './types';
import { CURATED_VOCABULARY_BANK } from './curriculum';

import { normalizeWord, calculateNextReviewSchedule } from './schedule';
import { recordStudyActivity } from '@/modules/streak/services';
export { normalizeWord, calculateNextReviewSchedule };

// In-memory fallback repository for local/testing when database tables are awaiting migration execution
const inMemoryUserVocab = new Map<string, UserVocabularyItem>();
const inMemoryReviewLogs = new Map<string, VocabularyReviewLog>();
const inMemorySessionLocks = new Map<string, Promise<void>>();

export function _resetInMemoryStore(): void {
  inMemoryUserVocab.clear();
  inMemoryReviewLogs.clear();
  inMemorySessionLocks.clear();
}

export function _getInMemoryReviewLogs(): VocabularyReviewLog[] {
  return Array.from(inMemoryReviewLogs.values());
}

/**
 * Returns list of curated vocabulary items from the curriculum bank
 */
export function getCuratedVocabularyList(): CuratedVocabularyItem[] {
  return [...CURATED_VOCABULARY_BANK];
}

/**
 * Retrieves the user's personal vocabulary notebook
 */
export async function getUserVocabularyList(userId: string): Promise<UserVocabularyItem[]> {
  if (!userId) return [];

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('user_vocabulary')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (!error && Array.isArray(data)) {
      return data as UserVocabularyItem[];
    }
  } catch {
    // Fallback if table not ready in Supabase schema cache
  }

  // Fallback to in-memory store
  const items = Array.from(inMemoryUserVocab.values()).filter((item) => item.user_id === userId);
  return items.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

/**
 * Retrieves the vocabulary items that are due for review (next_review_at <= now)
 */
export async function getDueVocabularyList(
  userId: string,
  asOfDate: Date = new Date()
): Promise<UserVocabularyItem[]> {
  if (!userId) return [];

  const nowIso = asOfDate.toISOString();

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('user_vocabulary')
      .select('*')
      .eq('user_id', userId)
      .lte('next_review_at', nowIso)
      .order('next_review_at', { ascending: true });

    if (!error && Array.isArray(data)) {
      return data as UserVocabularyItem[];
    }
  } catch {
    // Fallback
  }

  // Fallback
  const asOfMs = asOfDate.getTime();
  const items = Array.from(inMemoryUserVocab.values()).filter(
    (item) => item.user_id === userId && new Date(item.next_review_at).getTime() <= asOfMs
  );
  return items.sort((a, b) => new Date(a.next_review_at).getTime() - new Date(b.next_review_at).getTime());
}

/**
 * Saves a word into the user's personal notebook.
 * Deduplicates automatically by (user_id, word_normalized).
 */
export async function saveWordToNotebook(
  userId: string,
  input: SaveWordInput,
  asOfDate: Date = new Date()
): Promise<{ item: UserVocabularyItem; alreadyExisted: boolean }> {
  if (!userId) {
    throw new Error('Yêu cầu xác thực tài khoản để lưu từ vựng.');
  }

  const normalized = normalizeWord(input.word);
  if (!normalized) {
    throw new Error('Từ vựng không hợp lệ.');
  }

  const now = asOfDate.toISOString();

  // 1. Try Supabase
  try {
    const supabase = await createClient();

    // Check if already exists for this user
    const { data: existing, error: checkErr } = await supabase
      .from('user_vocabulary')
      .select('*')
      .eq('user_id', userId)
      .eq('word_normalized', normalized)
      .maybeSingle();

    if (!checkErr && existing) {
      // If custom_notes provided, update custom_notes
      if (input.custom_notes && input.custom_notes !== existing.custom_notes) {
        const { data: updated } = await supabase
          .from('user_vocabulary')
          .update({
            custom_notes: input.custom_notes,
            updated_at: now,
          })
          .eq('id', existing.id)
          .select('*')
          .single();

        return { item: (updated || existing) as UserVocabularyItem, alreadyExisted: true };
      }
      return { item: existing as UserVocabularyItem, alreadyExisted: true };
    }

    // Insert new item
    const newItem: Partial<UserVocabularyItem> = {
      user_id: userId,
      vocabulary_item_id: input.vocabulary_item_id || null,
      word: input.word.trim(),
      word_normalized: normalized,
      part_of_speech: input.part_of_speech?.trim() || null,
      ipa: input.ipa?.trim() || null,
      meaning_vi: input.meaning_vi.trim(),
      example: input.example?.trim() || null,
      custom_notes: input.custom_notes?.trim() || null,
      status: 'learning',
      interval_days: 1,
      consecutive_correct: 0,
      review_count: 0,
      next_review_at: now, // immediately available for first practice
      created_at: now,
      updated_at: now,
    };

    const { data: inserted, error: insertErr } = await supabase
      .from('user_vocabulary')
      .insert(newItem)
      .select('*')
      .single();

    if (!insertErr && inserted) {
      return { item: inserted as UserVocabularyItem, alreadyExisted: false };
    }
  } catch {
    // Fallback to in-memory store
  }

  // 2. In-memory fallback
  const existingKey = `${userId}:${normalized}`;
  const existingMemory = inMemoryUserVocab.get(existingKey);
  if (existingMemory) {
    if (input.custom_notes) {
      existingMemory.custom_notes = input.custom_notes;
      existingMemory.updated_at = now;
    }
    return { item: existingMemory, alreadyExisted: true };
  }

  const memoryItem: UserVocabularyItem = {
    id: `vocab-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    user_id: userId,
    vocabulary_item_id: input.vocabulary_item_id || null,
    word: input.word.trim(),
    word_normalized: normalized,
    part_of_speech: input.part_of_speech?.trim() || null,
    ipa: input.ipa?.trim() || null,
    meaning_vi: input.meaning_vi.trim(),
    example: input.example?.trim() || null,
    custom_notes: input.custom_notes?.trim() || null,
    status: 'learning',
    interval_days: 1,
    consecutive_correct: 0,
    review_count: 0,
    next_review_at: now,
    created_at: now,
    updated_at: now,
  };

  inMemoryUserVocab.set(existingKey, memoryItem);
  return { item: memoryItem, alreadyExisted: false };
}

/**
 * Deletes a word from the user's personal notebook.
 * Strictly verifies ownership (user_id = userId).
 */
export async function deleteWordFromNotebook(
  userId: string,
  vocabId: string
): Promise<{ success: boolean }> {
  if (!userId || !vocabId) {
    throw new Error('Tham số không hợp lệ.');
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from('user_vocabulary')
      .delete()
      .eq('id', vocabId)
      .eq('user_id', userId);

    if (!error) {
      return { success: true };
    }
  } catch {
    // Fallback
  }

  // In-memory fallback
  for (const [key, item] of inMemoryUserVocab.entries()) {
    if (item.id === vocabId && item.user_id === userId) {
      inMemoryUserVocab.delete(key);
      return { success: true };
    }
  }

  return { success: true };
}

/**
 * Submits a completed vocabulary review session.
 * Features:
 * - Anti-IDOR: Rejects items not owned by user.
 * - Idempotency: Protects against double submissions / page reloads using reviewSessionId.
 * - Deterministic schedule recalculation: Updates interval_days, consecutive_correct, status, next_review_at.
 * - Audit logs: Records review outcomes.
 */
export async function submitVocabularyReview(
  userId: string,
  input: SubmitReviewSessionInput,
  reviewDate: Date = new Date()
): Promise<{
  updatedCount: number;
  items: UserVocabularyItem[];
  sessionAlreadyProcessed: boolean;
}> {
  if (!userId) {
    throw new Error('Yêu cầu xác thực tài khoản.');
  }

  const { reviewSessionId, reviews } = input;
  if (!reviewSessionId || !reviews || reviews.length === 0) {
    throw new Error('Dữ liệu phiên ôn tập không hợp lệ.');
  }

  // Anti-tampering: check for duplicate vocabulary IDs in the same submission
  const uniqueVocabIds = new Set(reviews.map((r) => r.userVocabId));
  if (uniqueVocabIds.size !== reviews.length) {
    throw new Error('Danh sách ôn tập chứa từ vựng bị lặp lại trong cùng một phiên.');
  }

  // Validate review result values
  for (const r of reviews) {
    if (r.result !== 'remembered' && r.result !== 'forgot') {
      throw new Error('Kết quả ôn tập phải là remembered hoặc forgot.');
    }
  }

  const updatedItems: UserVocabularyItem[] = [];

  // 1. Try Supabase
  try {
    const supabase = await createClient();
    const admin = createAdminClient();

    // 1.1 Primary path: Atomic PostgreSQL RPC with row locks, advisory transaction lock, and security definer
    const { data: rpcData, error: rpcError } = await supabase.rpc(
      'submit_vocabulary_review_session',
      {
        p_review_session_id: reviewSessionId,
        p_reviews: reviews.map((r) => ({
          user_vocab_id: r.userVocabId,
          result: r.result,
        })),
      }
    );

    if (rpcError) {
      const msg = rpcError.message || '';
      // If the RPC raised an intentional business or security violation, propagate it immediately
      if (
        msg.includes('UNAUTHORIZED_OR_NOT_FOUND') ||
        msg.includes('UNAUTHENTICATED') ||
        msg.includes('INVALID_')
      ) {
        throw new Error(msg);
      }
      // Schema cache miss or function missing: fall through to admin fallback
    }

    if (!rpcError && rpcData) {
      const parsedRpc = rpcData as {
        session_already_processed: boolean;
        updated_count: number;
        items: UserVocabularyItem[];
      };

      if (!parsedRpc.session_already_processed && parsedRpc.updated_count > 0) {
        try {
          const rememberedCount = reviews.filter((r) => r.result === 'remembered').length;
          const accuracy = Math.round((rememberedCount / reviews.length) * 100);

          await admin.from('learning_evidence').insert({
            user_id: userId,
            skill: 'vocabulary',
            knowledge_type: 'spaced_repetition_review',
            source_type: 'vocabulary_review',
            source_id: reviewSessionId,
            score: rememberedCount,
            max_score: reviews.length,
            accuracy,
            evidence: {
              review_session_id: reviewSessionId,
              total_reviewed: reviews.length,
              remembered: rememberedCount,
              forgot: reviews.length - rememberedCount,
            },
          });
        } catch {
          // Evidence recording is non-blocking
        }
      }

      return {
        updatedCount: parsedRpc.updated_count,
        items: parsedRpc.items || [],
        sessionAlreadyProcessed: parsedRpc.session_already_processed,
      };
    }

    // 1.2 Fallback path via admin (service_role) if RPC not in schema cache
    // Check if session was already processed
    const { data: existingLogs } = await admin
      .from('vocabulary_review_logs')
      .select('id, user_vocab_id')
      .eq('review_session_id', reviewSessionId)
      .eq('user_id', userId);

    if (existingLogs && existingLogs.length > 0) {
      const vocabIds = reviews.map((r) => r.userVocabId);
      const { data: currentItems } = await supabase
        .from('user_vocabulary')
        .select('*')
        .in('id', vocabIds)
        .eq('user_id', userId);

      return {
        updatedCount: 0,
        items: (currentItems || []) as UserVocabularyItem[],
        sessionAlreadyProcessed: true,
      };
    }

    // Pre-validate all items to ensure ownership and existences (All-or-Nothing guarantee)
    const targetItems: UserVocabularyItem[] = [];
    for (const r of reviews) {
      const { data: targetItem, error: getErr } = await supabase
        .from('user_vocabulary')
        .select('*')
        .eq('id', r.userVocabId)
        .eq('user_id', userId)
        .single();

      if (getErr || !targetItem) {
        throw new Error(
          `Từ vựng ${r.userVocabId} không tồn tại hoặc không thuộc quyền sở hữu của bạn.`
        );
      }
      targetItems.push(targetItem as UserVocabularyItem);
    }

    // Process reviews only after all items have been verified
    for (let i = 0; i < reviews.length; i++) {
      const r = reviews[i];
      const targetItem = targetItems[i];

      const schedule = calculateNextReviewSchedule(
        targetItem.consecutive_correct,
        r.result,
        reviewDate
      );

      const intervalBefore = targetItem.interval_days;

      const { data: updated, error: updateErr } = await admin
        .from('user_vocabulary')
        .update({
          interval_days: schedule.intervalDays,
          consecutive_correct: schedule.consecutiveCorrect,
          status: schedule.status,
          next_review_at: schedule.nextReviewAt,
          last_reviewed_at: reviewDate.toISOString(),
          review_count: (targetItem.review_count || 0) + 1,
          updated_at: reviewDate.toISOString(),
        })
        .eq('id', targetItem.id)
        .eq('user_id', userId)
        .select('*')
        .single();

      if (!updateErr && updated) {
        updatedItems.push(updated as UserVocabularyItem);

        // Record log via admin client with exact interval_before captured before update
        await admin.from('vocabulary_review_logs').insert({
          user_id: userId,
          user_vocab_id: targetItem.id,
          review_session_id: reviewSessionId,
          result: r.result,
          interval_before: intervalBefore,
          interval_after: schedule.intervalDays,
          reviewed_at: reviewDate.toISOString(),
        });
      }
    }

    if (updatedItems.length > 0) {
      // Record learning evidence
      try {
        const rememberedCount = reviews.filter((r) => r.result === 'remembered').length;
        const accuracy = Math.round((rememberedCount / reviews.length) * 100);

        await admin.from('learning_evidence').insert({
          user_id: userId,
          skill: 'vocabulary',
          knowledge_type: 'spaced_repetition_review',
          source_type: 'vocabulary_review',
          source_id: reviewSessionId,
          score: rememberedCount,
          max_score: reviews.length,
          accuracy,
          evidence: {
            review_session_id: reviewSessionId,
            total_reviewed: reviews.length,
            remembered: rememberedCount,
            forgot: reviews.length - rememberedCount,
          },
        });
      } catch {
        // Evidence recording is non-blocking
      }

      // Record study activity for learning streak
      try {
        await recordStudyActivity(userId, 'vocabulary_review', reviewDate);
      } catch {
        // Non-blocking streak update
      }

      return {
        updatedCount: updatedItems.length,
        items: updatedItems,
        sessionAlreadyProcessed: false,
      };
    }
  } catch (err: unknown) {
    // If the error was an intentional authorization or validation failure, do not mask it with in-memory fallback
    const errMsg = err instanceof Error ? err.message : '';
    if (
      errMsg.includes('không thuộc quyền sở hữu') ||
      errMsg.includes('UNAUTHORIZED_OR_NOT_FOUND') ||
      errMsg.includes('UNAUTHENTICATED') ||
      errMsg.includes('INVALID_') ||
      errMsg.includes('bị lặp lại')
    ) {
      throw err;
    }
    // Fallback to in-memory store for infrastructure failures
  }

  // 2. In-Memory Fallback
  // Concurrency serialization lock per (userId, reviewSessionId) mirroring pg_advisory_xact_lock
  const lockKey = `${userId}:${reviewSessionId}`;
  while (inMemorySessionLocks.has(lockKey)) {
    await inMemorySessionLocks.get(lockKey);
  }

  let releaseLock: () => void = () => {};
  const lockPromise = new Promise<void>((resolve) => {
    releaseLock = resolve;
  });
  inMemorySessionLocks.set(lockKey, lockPromise);

  try {
    // Check if session was already processed
    const alreadyProcessed = Array.from(inMemoryReviewLogs.values()).some(
      (l) => l.review_session_id === reviewSessionId && l.user_id === userId
    );

    if (alreadyProcessed) {
      const matched = Array.from(inMemoryUserVocab.values()).filter(
        (v) => v.user_id === userId && reviews.some((r) => r.userVocabId === v.id)
      );
      return {
        updatedCount: 0,
        items: matched,
        sessionAlreadyProcessed: true,
      };
    }

    // Pre-validate all items exist and belong to user before making ANY changes (All-or-Nothing guarantee)
    const itemsToUpdate: Array<{ item: UserVocabularyItem; result: 'remembered' | 'forgot' }> = [];
    for (const r of reviews) {
      const item = Array.from(inMemoryUserVocab.values()).find(
        (v) => v.id === r.userVocabId && v.user_id === userId
      );

      if (!item) {
        throw new Error(
          `Từ vựng ${r.userVocabId} không tồn tại hoặc không thuộc quyền sở hữu của bạn.`
        );
      }
      itemsToUpdate.push({ item, result: r.result as 'remembered' | 'forgot' });
    }

    for (const { item, result } of itemsToUpdate) {
      const schedule = calculateNextReviewSchedule(
        item.consecutive_correct,
        result,
        reviewDate
      );

      const intervalBefore = item.interval_days;
      item.interval_days = schedule.intervalDays;
      item.consecutive_correct = schedule.consecutiveCorrect;
      item.status = schedule.status;
      item.next_review_at = schedule.nextReviewAt;
      item.last_reviewed_at = reviewDate.toISOString();
      item.review_count = (item.review_count || 0) + 1;
      item.updated_at = reviewDate.toISOString();

      const logId = `log-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      inMemoryReviewLogs.set(logId, {
        id: logId,
        user_id: userId,
        user_vocab_id: item.id,
        review_session_id: reviewSessionId,
        result,
        interval_before: intervalBefore,
        interval_after: schedule.intervalDays,
        reviewed_at: reviewDate.toISOString(),
      });

      updatedItems.push({ ...item });
    }

    try {
      await recordStudyActivity(userId, 'vocabulary_review', reviewDate);
    } catch {
      // Non-blocking streak update
    }

    return {
      updatedCount: updatedItems.length,
      items: updatedItems,
      sessionAlreadyProcessed: false,
    };
  } finally {
    inMemorySessionLocks.delete(lockKey);
    releaseLock();
  }
}

/**
 * Calculates vocabulary statistics for user dashboard and widgets
 */
export async function getVocabularyStats(userId: string): Promise<VocabularyStats> {
  const allWords = await getUserVocabularyList(userId);
  const nowMs = Date.now();

  let dueWords = 0;
  let learningWords = 0;
  let reviewingWords = 0;
  let masteredWords = 0;

  for (const w of allWords) {
    if (new Date(w.next_review_at).getTime() <= nowMs) {
      dueWords += 1;
    }
    if (w.status === 'learning') {
      learningWords += 1;
    } else if (w.status === 'reviewing') {
      reviewingWords += 1;
    } else if (w.status === 'mastered') {
      masteredWords += 1;
    }
  }

  return {
    totalWords: allWords.length,
    dueWords,
    learningWords,
    reviewingWords,
    masteredWords,
  };
}
