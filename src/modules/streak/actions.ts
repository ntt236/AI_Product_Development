'use server';

import { createClient } from '@/lib/supabase/server';
import { getUserStreak } from './services';
import type { StreakInfo } from './types';

/**
 * Server action to get current authenticated user's streak info
 */
export async function getUserStreakAction(): Promise<StreakInfo> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      lastStudyDate: null,
      hasStudiedToday: false,
      streakStatus: 'not_started',
    };
  }

  return getUserStreak(user.id);
}
