import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getToeicFormBySlug, getOrCreateToeicAttempt } from '@/modules/toeic/services';
import { ExamRoom } from '@/app/(app)/toeic/test/[slug]/exam-room';

export const metadata = {
  title: 'Phòng thi trực tuyến TOEIC — EngRise',
  description: 'Môi trường làm bài thi TOEIC mô phỏng chuẩn ETS với đồng hồ đếm ngược, audio chuẩn bản xứ và tự động lưu bài.',
};

interface ToeicTestPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function ToeicTestPage({ params }: ToeicTestPageProps) {
  const { slug } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { form, questions } = await getToeicFormBySlug(slug);
  if (!form) {
    redirect('/toeic');
  }

  const { attempt, savedAnswers, isResumed } = await getOrCreateToeicAttempt(user.id, form.id);

  // If attempt was already submitted, redirect directly to result page
  if (attempt.status === 'submitted') {
    redirect(`/toeic/result/${attempt.id}`);
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <ExamRoom
        form={form}
        questions={questions || []}
        attempt={attempt}
        initialSavedAnswers={savedAnswers || {}}
        isResumed={isResumed || false}
      />
    </div>
  );
}
