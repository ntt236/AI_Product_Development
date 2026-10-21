import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUserProfile } from '@/modules/profile/services';
import { Navbar } from '@/components/layout/navbar';
import { getSkillsCatalog } from '@/modules/skills/services';
import { getUserStreak } from '@/modules/streak/services';
import { SkillsView } from './skills-view';

export const metadata = {
  title: '4 Kỹ năng (Four Skills) — AI English Learning Platform',
  description: 'Luyện tập toàn diện 4 kỹ năng Listening, Reading, Writing, Speaking tích hợp AI Tutor.',
};

export default async function SkillsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const profile = await getCurrentUserProfile();
  if (!profile?.onboarding_completed_at) {
    redirect('/onboarding');
  }

  const catalog = await getSkillsCatalog();
  const streak = await getUserStreak(user.id);

  return (
    <div className="min-h-screen bg-background text-foreground pb-16">
      <Navbar
        displayName={profile.display_name || undefined}
        email={user.email}
        activePath="skills"
        streak={{
          currentStreak: streak.currentStreak,
          hasStudiedToday: streak.hasStudiedToday,
        }}
      />

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 pt-6 max-w-7xl">
        <SkillsView catalog={catalog} />
      </main>
    </div>
  );
}
