import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUserProfile } from '@/modules/profile/services';
import { Navbar } from '@/components/layout/navbar';
import { getOrCreateTodayDailyPlan } from '@/modules/daily-plan/services';
import { DailyPlanView } from './daily-plan-view';

export const metadata = {
  title: 'Kế hoạch học tập hôm nay — AI English Learning Platform',
  description: 'Theo dõi nhiệm vụ, làm bài tập và ghi nhận tiến độ hàng ngày',
};

export default async function DailyPlanPage() {
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

  // Get or create today's daily plan
  const planResult = await getOrCreateTodayDailyPlan(user.id);

  return (
    <div className="container">
      <Navbar
        displayName={profile.display_name || undefined}
        email={user.email}
        activePath="daily-plan"
      />

      <DailyPlanView
        initialPlan={planResult.plan || null}
        error={planResult.error}
        userName={profile.display_name || user.email?.split('@')[0] || 'Học viên'}
      />
    </div>
  );
}
