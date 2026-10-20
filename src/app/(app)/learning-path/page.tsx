import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUserProfile } from '@/modules/profile/services';
import { Navbar } from '@/components/layout/navbar';
import { getUserLearningPath, getLearnerProfileSummary } from '@/modules/learning-path/services';
import { getUserStreak } from '@/modules/streak/services';
import { LearningPathView } from './learning-path-view';

export const metadata = {
  title: 'Lộ trình học cá nhân hóa — AI English Learning Platform',
  description: 'Khung 3 Milestones thích ứng theo trình độ và mục tiêu người học',
};

export default async function LearningPathPage() {
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

  // Fetch learning path, items, versions, and profile summary
  const learningPathData = await getUserLearningPath(user.id);
  const learnerProfileSummary =
    learningPathData.profile || (await getLearnerProfileSummary(user.id));
  const streak = await getUserStreak(user.id);

  return (
    <div className="min-h-screen bg-background pb-16">
      <Navbar
        displayName={profile?.display_name || undefined}
        email={user.email}
        activePath="learning-path"
        streak={{
          currentStreak: streak.currentStreak,
          hasStudiedToday: streak.hasStudiedToday,
        }}
      />

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 pt-6 max-w-7xl">
        <LearningPathView
          initialPath={learningPathData.path}
          initialItems={learningPathData.items}
          initialVersions={learningPathData.versions}
          profile={learnerProfileSummary}
        />
      </main>
    </div>
  );
}
