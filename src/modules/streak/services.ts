import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import type { StreakInfo, StreakUpdateResult, StudyActivityType } from './types';
import {
  DEFAULT_TIMEZONE,
  getLocalDateString,
  computeStreakUpdate,
  resolveStreakDisplay,
} from './calculator';

// In-memory fallback map for unit tests and local mock isolation
export const inMemoryStreaks = new Map<
  string,
  { currentStreak: number; longestStreak: number; lastStudyDate: string | null; timezone: string }
>();

/**
 * Retrieves the current streak information for a user.
 */
export async function getUserStreak(
  userId: string,
  asOfDate: Date = new Date()
): Promise<StreakInfo> {
  if (!userId) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      lastStudyDate: null,
      hasStudiedToday: false,
      streakStatus: 'not_started',
    };
  }

  let currentStreak = 0;
  let longestStreak = 0;
  let lastStudyDate: string | null = null;
  let timezone = DEFAULT_TIMEZONE;

  try {
    const supabase = await createClient();
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('current_streak, longest_streak, last_study_date, timezone')
      .eq('id', userId)
      .maybeSingle();

    if (!error && profile) {
      currentStreak = profile.current_streak ?? 0;
      longestStreak = profile.longest_streak ?? 0;
      lastStudyDate = profile.last_study_date ?? null;
      timezone = profile.timezone || DEFAULT_TIMEZONE;
    } else {
      // Fallback to in-memory
      const mem = inMemoryStreaks.get(userId);
      if (mem) {
        currentStreak = mem.currentStreak;
        longestStreak = mem.longestStreak;
        lastStudyDate = mem.lastStudyDate;
        timezone = mem.timezone || DEFAULT_TIMEZONE;
      }
    }
  } catch {
    const mem = inMemoryStreaks.get(userId);
    if (mem) {
      currentStreak = mem.currentStreak;
      longestStreak = mem.longestStreak;
      lastStudyDate = mem.lastStudyDate;
      timezone = mem.timezone || DEFAULT_TIMEZONE;
    }
  }

  const todayStr = getLocalDateString(asOfDate, timezone);
  return resolveStreakDisplay(currentStreak, longestStreak, lastStudyDate, todayStr);
}

/**
 * Records a completed study activity and advances user's streak deterministically.
 * Triggered by: Daily Plan Practice, Vocabulary Review, Listening Practice.
 */
export async function recordStudyActivity(
  userId: string,
  activityType: StudyActivityType,
  asOfDate: Date = new Date()
): Promise<StreakUpdateResult> {
  if (!userId) {
    throw new Error('Yêu cầu xác thực tài khoản để ghi nhận hoạt động.');
  }

  let currentStreak = 0;
  let longestStreak = 0;
  let lastStudyDate: string | null = null;
  let timezone = DEFAULT_TIMEZONE;

  try {
    const admin = createAdminClient();
    const { data: profile, error } = await admin
      .from('profiles')
      .select('current_streak, longest_streak, last_study_date, timezone')
      .eq('id', userId)
      .maybeSingle();

    if (!error && profile) {
      currentStreak = profile.current_streak ?? 0;
      longestStreak = profile.longest_streak ?? 0;
      lastStudyDate = profile.last_study_date ?? null;
      timezone = profile.timezone || DEFAULT_TIMEZONE;
    } else {
      const mem = inMemoryStreaks.get(userId);
      if (mem) {
        currentStreak = mem.currentStreak;
        longestStreak = mem.longestStreak;
        lastStudyDate = mem.lastStudyDate;
        timezone = mem.timezone || DEFAULT_TIMEZONE;
      }
    }
  } catch {
    const mem = inMemoryStreaks.get(userId);
    if (mem) {
      currentStreak = mem.currentStreak;
      longestStreak = mem.longestStreak;
      lastStudyDate = mem.lastStudyDate;
      timezone = mem.timezone || DEFAULT_TIMEZONE;
    }
  }

  const todayStr = getLocalDateString(asOfDate, timezone);
  const update = computeStreakUpdate(currentStreak, longestStreak, lastStudyDate, todayStr);

  // If already studied today, return early without unnecessary writes
  if (update.isAlreadyStudiedToday) {
    return update;
  }

  const nowIso = asOfDate.toISOString();

  // 1. Try Supabase update
  try {
    const admin = createAdminClient();
    await admin
      .from('profiles')
      .update({
        current_streak: update.newStreak,
        longest_streak: update.longestStreak,
        last_study_date: update.lastStudyDate,
        updated_at: nowIso,
      })
      .eq('id', userId);

    // Telemetry event
    try {
      await admin.from('learning_events').insert({
        user_id: userId,
        event_type: 'streak_extended',
        entity_type: 'learning_streak',
        payload: {
          previous_streak: update.previousStreak,
          new_streak: update.newStreak,
          longest_streak: update.longestStreak,
          activity_type: activityType,
          study_date: update.lastStudyDate,
        },
      });
    } catch {
      // Non-blocking telemetry
    }
  } catch {
    // Database fallback
  }

  // Always update in-memory cache
  inMemoryStreaks.set(userId, {
    currentStreak: update.newStreak,
    longestStreak: update.longestStreak,
    lastStudyDate: update.lastStudyDate,
    timezone,
  });

  return update;
}
