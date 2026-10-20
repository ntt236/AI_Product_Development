import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUserProfile } from '@/modules/profile/services';
import { Navbar } from '@/components/layout/navbar';
import {
  getCuratedVocabularyList,
  getDueVocabularyList,
  getUserVocabularyList,
  getVocabularyStats,
} from '@/modules/vocabulary/services';
import { getUserStreak } from '@/modules/streak/services';
import { VocabularyView } from './vocabulary-view';

export const metadata = {
  title: 'Sổ từ vựng & Ôn tập — AI English Learning Platform',
  description: 'Quản lý sổ từ vựng cá nhân, củng cố phản xạ và lịch ôn tập giãn cách.',
};

export default async function VocabularyPage() {
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

  // Fetch vocabulary data for user
  const curated = getCuratedVocabularyList();
  const notebook = await getUserVocabularyList(user.id);
  const dueList = await getDueVocabularyList(user.id);
  const stats = await getVocabularyStats(user.id);
  const streak = await getUserStreak(user.id);

  return (
    <div className="min-h-screen bg-background pb-16">
      <Navbar
        displayName={profile.display_name || undefined}
        email={user.email}
        activePath="vocabulary"
        streak={{
          currentStreak: streak.currentStreak,
          hasStudiedToday: streak.hasStudiedToday,
        }}
      />

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 pt-6 max-w-7xl">
        <VocabularyView
          initialCurated={curated}
          initialNotebook={notebook}
          initialDue={dueList}
          initialStats={stats}
        />
      </main>
    </div>
  );
}
