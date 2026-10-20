import { redirect, notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getCurrentUserProfile } from '@/modules/profile/services';
import { Navbar } from '@/components/layout/navbar';
import { getContentItemWithExercises } from '@/modules/daily-plan/services';
import { getUserStreak } from '@/modules/streak/services';
import { PracticeSessionView } from './practice-session-view';

export const metadata = {
  title: 'Luyện tập bài học — AI English Learning Platform',
  description: 'Thực hành bài học và bài tập tương tác với chấm điểm tự động',
};

interface PracticePageProps {
  params: Promise<{ taskId: string }>;
}

export default async function PracticeSessionPage({ params }: PracticePageProps) {
  const { taskId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const profile = await getCurrentUserProfile();

  // Fetch task
  const adminClient = createAdminClient();
  const { data: task } = await adminClient
    .from('daily_plan_tasks')
    .select('id, user_id, title, skill, estimated_minutes, status, content_item_id')
    .eq('id', taskId)
    .maybeSingle();

  if (!task || task.user_id !== user.id) {
    redirect('/daily-plan');
  }

  if (!task.content_item_id) {
    redirect('/daily-plan');
  }

  // Fetch content item and exercises (without answer keys!)
  const { contentItem, exercises } = await getContentItemWithExercises(task.content_item_id);

  if (!contentItem || exercises.length === 0) {
    notFound();
  }

  const streak = await getUserStreak(user.id);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar
        displayName={profile?.display_name || undefined}
        email={user.email}
        activePath="daily-plan"
        streak={{
          currentStreak: streak.currentStreak,
          hasStudiedToday: streak.hasStudiedToday,
        }}
      />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <PracticeSessionView
          task={task}
          contentItem={contentItem}
          exercises={exercises}
        />
      </main>
    </div>
  );
}
