import { redirect, notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getCurrentUserProfile } from '@/modules/profile/services';
import { Navbar } from '@/components/layout/navbar';
import { getContentItemWithExercises } from '@/modules/daily-plan/services';
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

  return (
    <div className="container">
      <Navbar
        displayName={profile?.display_name || undefined}
        email={user.email}
        activePath="daily-plan"
      />

      <PracticeSessionView
        task={task}
        contentItem={contentItem}
        exercises={exercises}
      />
    </div>
  );
}
