'use server';

import { createClient } from '@/lib/supabase/server';
import { onboardingSchema, type OnboardingInput } from './schemas';
import { GOAL_OPTIONS } from './constants';

export interface OnboardingState {
  primaryGoal: string;
  secondaryGoals: string[];
  targetToeicScore?: number | null;
  dailyMinutes: number;
  studyDays: number[];
  isCompleted: boolean;
}

/**
 * Fetches user's saved onboarding selections if previously set.
 * Allows the user to view or edit their choices.
 */
export async function getOnboardingState(): Promise<OnboardingState | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  // 1. Fetch profile status
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('onboarding_completed_at')
    .eq('id', user.id)
    .maybeSingle();

  if (profileError) {
    console.error('Lỗi truy vấn profiles:', profileError.message);
  }

  // 2. Fetch active goals
  const { data: goals, error: goalsError } = await supabase
    .from('goals')
    .select('*')
    .eq('user_id', user.id)
    .eq('status', 'active');

  if (goalsError) {
    console.error('Lỗi truy vấn goals:', goalsError.message);
  }

  // 3. Fetch preferences (maybeSingle is valid when a new user has not set preferences yet)
  const { data: preferences, error: prefError } = await supabase
    .from('learner_preferences')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle();

  if (prefError) {
    console.error('Lỗi truy vấn learner_preferences:', prefError.message);
  }

  const primaryGoalObj = goals?.find((g) => g.priority === 'primary');
  const secondaryGoalObjs = goals?.filter((g) => g.priority === 'secondary') || [];

  return {
    primaryGoal: primaryGoalObj?.goal_type || 'foundation',
    secondaryGoals: secondaryGoalObjs.map((g) => g.goal_type),
    targetToeicScore: primaryGoalObj?.target_toeic_score || null,
    dailyMinutes: preferences?.daily_minutes || 30,
    studyDays: preferences?.preferred_study_days || [1, 2, 3, 4, 5],
    isCompleted: Boolean(profile?.onboarding_completed_at),
  };
}

/**
 * Saves onboarding data to database:
 * 1. Upserts learner_preferences
 * 2. Archives existing goals and inserts new primary + secondary goals
 * 3. Marks profile.onboarding_completed_at
 */
export async function saveOnboardingAction(
  rawInput: OnboardingInput
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: 'Phiên làm việc hết hạn. Vui lòng đăng nhập lại.' };
  }

  const parsed = onboardingSchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || 'Dữ liệu không hợp lệ.',
    };
  }

  const data = parsed.data;

  try {
    // 1. Upsert learner_preferences
    const { error: prefError } = await supabase
      .from('learner_preferences')
      .upsert({
        user_id: user.id,
        daily_minutes: data.dailyMinutes,
        preferred_study_days: data.studyDays,
        updated_at: new Date().toISOString(),
      });

    if (prefError) {
      return { success: false, error: `Lỗi lưu sở thích: ${prefError.message}` };
    }

    // 2. Archive older goals of this user before inserting new active ones
    await supabase
      .from('goals')
      .update({ status: 'archived', updated_at: new Date().toISOString() })
      .eq('user_id', user.id)
      .eq('status', 'active');

    // 3. Prepare primary goal
    const primaryOption = GOAL_OPTIONS.find((g) => g.type === data.primaryGoal);
    const goalsToInsert = [
      {
        user_id: user.id,
        goal_type: data.primaryGoal,
        title: primaryOption?.title || 'Mục tiêu chính',
        priority: 'primary',
        status: 'active',
        target_toeic_score: data.primaryGoal === 'toeic' ? data.targetToeicScore : null,
      },
    ];

    // Prepare secondary goals (filter out duplicate of primary)
    for (const secType of data.secondaryGoals) {
      if (secType !== data.primaryGoal) {
        const secOption = GOAL_OPTIONS.find((g) => g.type === secType);
        goalsToInsert.push({
          user_id: user.id,
          goal_type: secType,
          title: secOption?.title || 'Mục tiêu phụ',
          priority: 'secondary',
          status: 'active',
          target_toeic_score: null,
        });
      }
    }

    const { error: goalError } = await supabase.from('goals').insert(goalsToInsert);
    if (goalError) {
      return { success: false, error: `Lỗi lưu mục tiêu: ${goalError.message}` };
    }

    // 4. Mark profile onboarding completed
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        onboarding_completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    if (profileError) {
      return { success: false, error: `Lỗi cập nhật hồ sơ: ${profileError.message}` };
    }

    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Lỗi hệ thống';
    return { success: false, error: message };
  }
}
