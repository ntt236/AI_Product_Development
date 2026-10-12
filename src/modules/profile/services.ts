import 'server-only';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import type { Profile } from './types';

/**
 * Retrieves the current authenticated user's profile from database.
 * If user has just registered and trigger has not yet executed or is in progress,
 * ensures an initial record exists using authorized server recovery.
 */
export async function getCurrentUserProfile(): Promise<Profile | null> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return null;
  }

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error || !profile) {
    // Attempt fallback insert using admin client in case an older user was created without a profile
    try {
      const adminClient = createAdminClient();
      const fallbackDisplayName =
        (user.user_metadata?.display_name as string | undefined) ||
        user.email?.split('@')[0] ||
        'Learner';

      const { data: createdProfile } = await adminClient
        .from('profiles')
        .insert({
          id: user.id,
          display_name: fallbackDisplayName,
        })
        .select('*')
        .single();

      return createdProfile as Profile | null;
    } catch {
      return null;
    }
  }

  return profile as Profile;
}

/**
 * Updates basic profile information.
 * Disallows updating system-level fields like `id` or `estimated_level`.
 */
export async function updateProfile(
  updates: Partial<Pick<Profile, 'display_name' | 'avatar_url' | 'native_language' | 'timezone'>>
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Chưa đăng nhập.' };
  }

  const { error } = await supabase
    .from('profiles')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}
