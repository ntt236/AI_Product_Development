import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUserProfile } from '@/modules/profile/services';
import { Navbar } from '@/components/layout/navbar';
import { getUserStreak } from '@/modules/streak/services';
import { getToeicResult } from '@/modules/toeic/services';
import { ResultView } from './result-view';

export const metadata = {
  title: 'Bảng điểm & Đánh giá năng lực TOEIC — EngRise',
  description: 'Báo cáo chi tiết kết quả thi thử TOEIC, quy đổi điểm 10–990 và phân tích điểm yếu từ AI Tutor.',
};

interface ToeicResultPageProps {
  params: Promise<{
    attemptId: string;
  }>;
}

export default async function ToeicResultPage({ params }: ToeicResultPageProps) {
  const { attemptId } = await params;

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

  const result = await getToeicResult(user.id, attemptId);
  if (!result) {
    redirect('/toeic');
  }

  const streak = await getUserStreak(user.id);

  return (
    <div className="min-h-screen bg-background text-foreground pb-16">
      <Navbar
        displayName={profile.display_name || undefined}
        email={user.email}
        activePath="toeic"
        streak={{
          currentStreak: streak.currentStreak,
          hasStudiedToday: streak.hasStudiedToday,
        }}
      />

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 pt-6 max-w-7xl">
        <ResultView resultView={result} />
      </main>
    </div>
  );
}
