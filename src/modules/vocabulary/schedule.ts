import type {
  ReviewScheduleCalculation,
  VocabularyReviewResult,
  VocabularyStatus,
} from './types';

export const DEFAULT_TIMEZONE = 'Asia/Ho_Chi_Minh';

/**
 * Normalizes a word for case-insensitive and whitespace-trimmed matching
 */
export function normalizeWord(word: string): string {
  return word.trim().toLowerCase();
}

/**
 * Formats a date as 'YYYY-MM-DD' representing local calendar day in given timezone
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
    return date.toISOString().split('T')[0];
  }
}

/**
 * Computes 00:00:00 local time on the target day (today + intervalDays)
 * Ensures that studying at any hour today (e.g. 23:30) makes the item available
 * at the start of tomorrow morning.
 */
export function calculateNextCalendarReviewDate(
  intervalDays: number,
  baseDate: Date = new Date(),
  timezone: string = DEFAULT_TIMEZONE
): Date {
  const localDateStr = getLocalDateString(baseDate, timezone);
  const [year, month, day] = localDateStr.split('-').map(Number);
  const targetDate = new Date(Date.UTC(year, month - 1, day + intervalDays));
  const targetYear = targetDate.getUTCFullYear();
  const targetMonth = String(targetDate.getUTCMonth() + 1).padStart(2, '0');
  const targetDay = String(targetDate.getUTCDate()).padStart(2, '0');
  return new Date(`${targetYear}-${targetMonth}-${targetDay}T00:00:00+07:00`);
}

/**
 * Deterministic schedule calculator:
 * - forgot: resets consecutive_correct to 0, interval = 1 day, status = 'learning'
 * - remembered:
 *   - consecutive 1: interval = 1 day, status = 'learning'
 *   - consecutive 2: interval = 3 days, status = 'learning'
 *   - consecutive 3: interval = 7 days, status = 'reviewing'
 *   - consecutive 4: interval = 14 days, status = 'reviewing'
 *   - consecutive >= 5: interval = 30 days, status = 'mastered'
 *
 * Options:
 * - calendarDay: true (default) -> sets nextReviewAt to 00:00:00 of the target calendar day
 * - calendarDay: false -> sets nextReviewAt to exact baseDate + intervalDays * 24h
 */
export function calculateNextReviewSchedule(
  currentConsecutive: number,
  result: VocabularyReviewResult,
  baseDate: Date = new Date(),
  options?: { calendarDay?: boolean; timezone?: string }
): ReviewScheduleCalculation {
  const calendarDay = options?.calendarDay ?? true;
  const timezone = options?.timezone ?? DEFAULT_TIMEZONE;

  if (result === 'forgot') {
    const nextReview = calendarDay
      ? calculateNextCalendarReviewDate(1, baseDate, timezone)
      : new Date(baseDate.getTime() + 1 * 24 * 60 * 60 * 1000);

    return {
      intervalDays: 1,
      consecutiveCorrect: 0,
      status: 'learning',
      nextReviewAt: nextReview.toISOString(),
    };
  }

  const nextConsecutive = Math.max(0, currentConsecutive) + 1;
  let intervalDays = 1;
  let status: VocabularyStatus = 'learning';

  if (nextConsecutive === 1) {
    intervalDays = 1;
    status = 'learning';
  } else if (nextConsecutive === 2) {
    intervalDays = 3;
    status = 'learning';
  } else if (nextConsecutive === 3) {
    intervalDays = 7;
    status = 'reviewing';
  } else if (nextConsecutive === 4) {
    intervalDays = 14;
    status = 'reviewing';
  } else {
    // 5 or more consecutive correct recalls
    intervalDays = 30;
    status = 'mastered';
  }

  const nextReview = calendarDay
    ? calculateNextCalendarReviewDate(intervalDays, baseDate, timezone)
    : new Date(baseDate.getTime() + intervalDays * 24 * 60 * 60 * 1000);

  return {
    intervalDays,
    consecutiveCorrect: nextConsecutive,
    status,
    nextReviewAt: nextReview.toISOString(),
  };
}
