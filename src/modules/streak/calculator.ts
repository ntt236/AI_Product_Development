import type { StreakInfo, StreakUpdateResult } from './types';

export const DEFAULT_TIMEZONE = 'Asia/Ho_Chi_Minh';

/**
 * Returns 'YYYY-MM-DD' representing the local calendar day in the given timezone.
 */
export function getLocalDateString(
  date: Date = new Date(),
  timezone: string = DEFAULT_TIMEZONE
): string {
  try {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(date);
  } catch {
    // Fallback if invalid timezone passed
    return date.toISOString().split('T')[0];
  }
}

/**
 * Returns the 'YYYY-MM-DD' string of the day preceding the given 'YYYY-MM-DD'.
 */
export function getYesterdayDateString(todayDateStr: string): string {
  const [year, month, day] = todayDateStr.split('-').map(Number);
  const prevDate = new Date(Date.UTC(year, month - 1, day - 1));
  const y = prevDate.getUTCFullYear();
  const m = String(prevDate.getUTCMonth() + 1).padStart(2, '0');
  const d = String(prevDate.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Pure calculation for updating streak when a study activity occurs on `todayStr`.
 */
export function computeStreakUpdate(
  currentStreak: number,
  longestStreak: number,
  lastStudyDate: string | null,
  todayStr: string
): StreakUpdateResult {
  // Case 1: First activity ever
  if (!lastStudyDate) {
    return {
      previousStreak: currentStreak,
      newStreak: 1,
      longestStreak: Math.max(longestStreak, 1),
      lastStudyDate: todayStr,
      isExtended: true,
      isAlreadyStudiedToday: false,
    };
  }

  // Case 2: Already completed an activity today
  if (lastStudyDate === todayStr) {
    return {
      previousStreak: currentStreak,
      newStreak: currentStreak,
      longestStreak,
      lastStudyDate: todayStr,
      isExtended: false,
      isAlreadyStudiedToday: true,
    };
  }

  const yesterdayStr = getYesterdayDateString(todayStr);

  // Case 3: Studied yesterday -> streak continues (+1)
  if (lastStudyDate === yesterdayStr) {
    const updated = currentStreak + 1;
    return {
      previousStreak: currentStreak,
      newStreak: updated,
      longestStreak: Math.max(longestStreak, updated),
      lastStudyDate: todayStr,
      isExtended: true,
      isAlreadyStudiedToday: false,
    };
  }

  // Case 4: Missed 1 or more days -> streak resets to 1
  return {
    previousStreak: currentStreak,
    newStreak: 1,
    longestStreak: Math.max(longestStreak, 1),
    lastStudyDate: todayStr,
    isExtended: true,
    isAlreadyStudiedToday: false,
  };
}

/**
 * Pure calculation for resolving current streak display state as of `todayStr`.
 */
export function resolveStreakDisplay(
  currentStreak: number,
  longestStreak: number,
  lastStudyDate: string | null,
  todayStr: string
): StreakInfo {
  if (!lastStudyDate) {
    return {
      currentStreak: 0,
      longestStreak: Math.max(0, longestStreak),
      lastStudyDate: null,
      hasStudiedToday: false,
      streakStatus: 'not_started',
    };
  }

  if (lastStudyDate === todayStr) {
    return {
      currentStreak,
      longestStreak: Math.max(longestStreak, currentStreak),
      lastStudyDate,
      hasStudiedToday: true,
      streakStatus: 'active_today',
    };
  }

  const yesterdayStr = getYesterdayDateString(todayStr);

  if (lastStudyDate === yesterdayStr) {
    // Has not studied today yet, but streak is still intact from yesterday
    return {
      currentStreak,
      longestStreak,
      lastStudyDate,
      hasStudiedToday: false,
      streakStatus: 'at_risk',
    };
  }

  // Last study was before yesterday -> streak is broken
  return {
    currentStreak: 0,
    longestStreak,
    lastStudyDate,
    hasStudiedToday: false,
    streakStatus: 'broken',
  };
}
