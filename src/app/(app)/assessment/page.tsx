import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import {
  getPlacementAssessmentWithQuestions,
  getUserLatestAssessmentResult,
} from '@/modules/assessment/services';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const metadata = {
  title: 'Đánh giá trình độ đầu vào — Placement Assessment',
  description: 'Đo lường năng lực tiếng Anh ban đầu và xác định trình độ CEFR ước tính',
};

export default async function AssessmentIntroPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?redirectTo=/assessment');
  }

  // 1. Fetch assessment data
  const { assessment, questions } = await getPlacementAssessmentWithQuestions();

  // 2. Check for existing attempts
  const { data: inProgressAttempt } = await supabase
    .from('assessment_attempts')
    .select('id, answered_count, total_questions, started_at')
    .eq('user_id', user.id)
    .eq('status', 'in_progress')
    .order('started_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  // 3. Fetch latest completed result if any
  const latestResult = await getUserLatestAssessmentResult(user.id);

  return (
    <div className="container">
      {/* Navigation Header */}
      <header className="navbar">
        <Link href="/dashboard" className="nav-brand">
          <span>🌱</span>
          <span>AI English Platform</span>
        </Link>
        <div className="nav-user">
          <Link href="/dashboard" className="btn btn-secondary btn-sm">
            ← Về Dashboard
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <div className="header" style={{ textAlign: 'left', marginBottom: '2.5rem' }}>
        <div className="hero-badge">
          <span>🎯</span>
          <span>Placement Assessment</span>
        </div>
        <h1 className="title" style={{ fontSize: '2.25rem' }}>
          Đánh giá trình độ tiếng Anh đầu vào
        </h1>
        <p className="subtitle" style={{ margin: '0' }}>
          Hệ thống sẽ đo lường toàn diện các kỹ năng cốt lõi để xác định cấp độ ước tính và chuẩn bị dữ liệu cho Lộ trình học thích ứng (Phase 3).
        </p>
      </div>

      {/* Main Grid: Status & Information */}
      <div className="grid">
        {/* Test Overview Card */}
        <Card title="Cấu trúc & Quy tắc bài thi">
          <ul className="status-list">
            <li className="status-item">
              <div>
                <div className="status-label">Số lượng câu hỏi</div>
                <div className="status-desc">{assessment?.total_questions || questions.length || 16} câu hỏi trắc nghiệm</div>
              </div>
              <Badge variant="default">16 câu</Badge>
            </li>
            <li className="status-item">
              <div>
                <div className="status-label">Kỹ năng đánh giá</div>
                <div className="status-desc">Từ vựng (Vocabulary), Ngữ pháp (Grammar), Đọc hiểu (Reading), Nghe/Hội thoại (Listening)</div>
              </div>
              <Badge variant="info">4 Kỹ năng</Badge>
            </li>
            <li className="status-item">
              <div>
                <div className="status-label">Thời gian làm bài ước tính</div>
                <div className="status-desc">20 - 25 phút (Tự do điều hướng giữa các câu)</div>
              </div>
              <Badge variant="default">~25 phút</Badge>
            </li>
            <li className="status-item">
              <div>
                <div className="status-label">Lưu tiến độ &amp; Khôi phục</div>
                <div className="status-desc">Hệ thống tự động lưu từng câu. Bạn có thể tạm dừng và tiếp tục làm bài bất kỳ lúc nào.</div>
              </div>
              <Badge variant="success">Tự động lưu</Badge>
            </li>
          </ul>
        </Card>

        {/* Current State / Action Card */}
        <Card title="Trạng thái làm bài của bạn">
          {inProgressAttempt ? (
            <div>
              <div
                style={{
                  padding: '1rem',
                  borderRadius: '10px',
                  background: 'rgba(56, 189, 248, 0.1)',
                  border: '1px solid rgba(56, 189, 248, 0.25)',
                  marginBottom: '1.25rem',
                }}
              >
                <div style={{ color: 'var(--accent-cyan)', fontWeight: 600, marginBottom: '0.25rem' }}>
                  ⏳ Bạn có một bài làm đang dang dở
                </div>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                  Đã hoàn thành: <strong>{inProgressAttempt.answered_count} / {inProgressAttempt.total_questions}</strong> câu.
                </div>
              </div>

              <Link
                href="/assessment/test"
                className="btn btn-primary"
                style={{ width: '100%', textAlign: 'center', display: 'block' }}
              >
                Tiếp tục làm bài thi →
              </Link>
            </div>
          ) : latestResult ? (
            <div>
              <div
                style={{
                  padding: '1rem',
                  borderRadius: '10px',
                  background: 'rgba(16, 185, 129, 0.1)',
                  border: '1px solid rgba(16, 185, 129, 0.25)',
                  marginBottom: '1.25rem',
                }}
              >
                <div style={{ color: 'var(--accent-emerald)', fontWeight: 600, marginBottom: '0.25rem' }}>
                  ✓ Bạn đã hoàn thành bài kiểm tra đầu vào
                </div>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                  Trình độ ước lượng: <strong style={{ color: '#ffffff' }}>{latestResult.overall_level.toUpperCase()}</strong> | Điểm: {latestResult.correct_answers}/{latestResult.total_questions} ({Math.round(latestResult.accuracy * 100)}%)
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <Link
                  href={`/assessment/results/${latestResult.attempt_id}`}
                  className="btn btn-secondary"
                  style={{ width: '100%', textAlign: 'center' }}
                >
                  📊 Xem chi tiết kết quả &amp; giải thích đáp án
                </Link>

                <Link
                  href="/assessment/test"
                  className="btn btn-primary"
                  style={{ width: '100%', textAlign: 'center' }}
                >
                  🔄 Làm lại bài kiểm tra (Thử thách mới)
                </Link>
              </div>
            </div>
          ) : (
            <div>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
                Bạn chưa thực hiện bài kiểm tra đầu vào nào. Hãy dành khoảng 20 phút tập trung để làm bài kiểm tra khách quan và chính xác nhất.
              </p>

              <Link
                href="/assessment/test"
                className="btn btn-primary"
                style={{ width: '100%', textAlign: 'center', display: 'block' }}
              >
                🚀 Bắt đầu làm bài kiểm tra ngay
              </Link>
            </div>
          )}

          <div
            style={{
              marginTop: '1.5rem',
              padding: '0.75rem',
              borderRadius: '8px',
              backgroundColor: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid var(--border-color)',
              fontSize: '0.8rem',
              color: 'var(--text-muted)',
              lineHeight: 1.5,
            }}
          >
            ℹ️ <strong>Lưu ý học thuật:</strong> Cấp độ CEFR trong hệ thống là chỉ số ước tính nội bộ (Pre-A1 đến B2) dựa trên thuật toán chấm điểm độc lập nhằm hỗ trợ cá nhân hóa bài học, không phải chứng chỉ quốc tế chính thức.
          </div>
        </Card>
      </div>
    </div>
  );
}
