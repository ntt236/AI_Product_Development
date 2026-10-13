import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { startOrResumePlacementAction } from '@/modules/assessment/actions';
import { AssessmentTestRunner } from '@/modules/assessment/components/test-runner';

export const metadata = {
  title: 'Làm bài kiểm tra đầu vào — Placement Assessment',
  description: 'Đang làm bài kiểm tra đánh giá trình độ tiếng Anh',
};

export default async function AssessmentTestPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?redirectTo=/assessment/test');
  }

  const response = await startOrResumePlacementAction();

  if (!response.success || !response.attemptId || !response.questions) {
    return (
      <div className="container" style={{ textAlign: 'center', paddingTop: '5rem' }}>
        <h2 style={{ color: '#ef4444', marginBottom: '1rem' }}>Không thể tải bài kiểm tra</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
          {response.error || 'Đã xảy ra lỗi không xác định. Vui lòng thử lại sau.'}
        </p>
        <Link href="/assessment" className="btn btn-secondary">
          ← Quay lại trang giới thiệu
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Test Page Top Header */}
      <header
        style={{
          borderBottom: '1px solid var(--border-color)',
          backgroundColor: 'var(--bg-secondary)',
          padding: '0.85rem 1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '1.25rem' }}>🎯</span>
          <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>
            Placement Test — Đánh giá năng lực tiếng Anh
          </span>
        </div>

        <Link
          href="/dashboard"
          className="btn btn-secondary btn-sm"
          style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}
        >
          Tạm dừng &amp; Về Dashboard
        </Link>
      </header>

      {/* Interactive Test Runner */}
      <AssessmentTestRunner
        attemptId={response.attemptId}
        questions={response.questions}
        initialAnswers={response.savedAnswers || {}}
        timeLimitSeconds={response.timeLimitSeconds || null}
      />
    </div>
  );
}
