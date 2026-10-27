import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUserProfile } from '@/modules/profile/services';
import { Navbar } from '@/components/layout/navbar';
import { getToeicForms } from '@/modules/toeic/services';
import { getUserStreak } from '@/modules/streak/services';
import { ToeicHubView } from './toeic-hub-view';

export const metadata = {
  title: 'Luyện thi TOEIC & Thi thử Mock Test — EngRise',
  description: 'Luyện thi TOEIC theo chuẩn ETS: Luyện tập theo từng Part (Part 1-7), Đề thi thử đầy đủ 120 phút (200 câu), quy đổi điểm 10-990 và phân tích điểm yếu.',
};

export default async function ToeicPage() {
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

  const forms = await getToeicForms();
  const streak = await getUserStreak(user.id);

  // Fetch user's latest submitted TOEIC attempt for scorecard preview
  const { data: latestAttempt } = await supabase
    .from('assessment_attempts')
    .select('id, score, started_at, submitted_at, metadata, total_questions')
    .eq('user_id', user.id)
    .eq('status', 'submitted')
    .order('submitted_at', { ascending: false })
    .limit(1)
    .maybeSingle();

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
        <ToeicHubView
          forms={forms}
          targetScore={
            profile.estimated_level === 'b2' ? 800
            : profile.estimated_level === 'b1' ? 650
            : profile.estimated_level === 'a2' ? 550
            : profile.estimated_level === 'a1' ? 450
            : 750
          }
          latestAttempt={latestAttempt ? {
            id: latestAttempt.id,
            score: Number(latestAttempt.score) || 10,
            submittedAt: latestAttempt.submitted_at,
            metadata: latestAttempt.metadata || {},
          } : null}
        />
      </main>
    </div>
  );
}
