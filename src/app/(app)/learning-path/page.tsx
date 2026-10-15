import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUserProfile } from '@/modules/profile/services';
import { Navbar } from '@/components/layout/navbar';
import { getUserLearningPath, getLearnerProfileSummary } from '@/modules/learning-path/services';
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

  // If user has not completed onboarding, guide them to onboarding
  if (!profile?.onboarding_completed_at) {
    redirect('/onboarding');
  }

  // Fetch learning path, items, versions, and profile summary
  const learningPathData = await getUserLearningPath(user.id);
  const learnerProfileSummary =
    learningPathData.profile || (await getLearnerProfileSummary(user.id));

  return (
    <div className="container">
      {/* Top Navbar */}
      <Navbar
        displayName={profile?.display_name || undefined}
        email={user.email}
        activePath="learning-path"
      />

      {/* Main Learning Path View */}
      <LearningPathView
        initialPath={learningPathData.path}
        initialItems={learningPathData.items}
        initialVersions={learningPathData.versions}
        profile={learnerProfileSummary}
      />
    </div>
  );
}
