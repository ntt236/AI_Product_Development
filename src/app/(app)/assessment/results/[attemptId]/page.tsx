import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { getDetailedAssessmentResult } from '@/modules/assessment/services';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { AssessmentSkill } from '@/modules/assessment/types';

interface PageProps {
  params: Promise<{ attemptId: string }>;
}

const CEFR_DESCRIPTIONS: Record<string, { label: string; desc: string; color: string }> = {
  pre_a1: {
    label: 'Pre-A1 (Mới bắt đầu / Mất gốc)',
    desc: 'Cần củng cố từ vựng cơ bản và các cấu trúc câu đơn giản nhất.',
    color: '#94a3b8',
  },
  a1: {
    label: 'A1 (Sơ cấp cơ bản)',
    desc: 'Hiểu các từ ngữ thông dụng và ngữ cảnh giao tiếp cực kỳ quen thuộc.',
    color: '#38bdf8',
  },
  a2: {
    label: 'A2 (Sơ trung cấp)',
    desc: 'Giao tiếp trong các tình huống đơn giản hàng ngày và hiểu thông tin cơ bản.',
    color: '#3b82f6',
  },
  b1: {
    label: 'B1 (Trung cấp độc lập)',
    desc: 'Tự tin xử lý tình huống du lịch, công việc thường nhật và diễn đạt ý kiến cá nhân.',
    color: '#10b981',
  },
  b2: {
    label: 'B2 (Trung cao cấp)',
    desc: 'Hiểu các văn bản phức tạp, nắm bắt ý trừu tượng và phản xạ giao tiếp trôi chảy.',
    color: '#f59e0b',
  },
  c1: {
    label: 'C1 (Cao cấp)',
    desc: 'Sử dụng ngôn ngữ linh hoạt cho các mục đích xã hội, học thuật và chuyên môn.',
    color: '#8b5cf6',
  },
  c2: {
    label: 'C2 (Thành thạo chuyên sâu)',
    desc: 'Làm chủ ngôn ngữ toàn diện như người bản ngữ có học thức.',
    color: '#ec4899',
  },
};

export async function generateMetadata({ params }: PageProps) {
  const { attemptId } = await params;
  return {
    title: `Kết quả đánh giá — ${attemptId.slice(0, 8)}`,
    description: 'Báo cáo chi tiết kết quả bài kiểm tra đánh giá năng lực tiếng Anh',
  };
}

export default async function AssessmentResultPage({ params }: PageProps) {
  const { attemptId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?redirectTo=/assessment/results/${attemptId}`);
  }

  const { result, attempt, reviews } = await getDetailedAssessmentResult(user.id, attemptId);

  if (!result || !attempt) {
    return (
      <div className="container" style={{ textAlign: 'center', paddingTop: '5rem' }}>
        <h2 style={{ color: '#ef4444', marginBottom: '1rem' }}>Không tìm thấy kết quả bài thi</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
          Lượt làm bài này chưa được nộp hoặc bạn không có quyền xem kết quả.
        </p>
        <Link href="/dashboard" className="btn btn-secondary">
          ← Quay lại Dashboard
        </Link>
      </div>
    );
  }

  const levelInfo = CEFR_DESCRIPTIONS[result.overall_level] || {
    label: result.overall_level.toUpperCase(),
    desc: 'Trình độ tiếng Anh ước tính của bạn.',
    color: 'var(--accent-cyan)',
  };

  const skillsList: AssessmentSkill[] = ['vocabulary', 'grammar', 'reading', 'listening'];

  return (
    <div className="container" style={{ maxWidth: '1000px', paddingBottom: '5rem' }}>
      {/* Top Navbar */}
      <header className="navbar" style={{ marginBottom: '2rem' }}>
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

      {/* Main Hero Score Banner */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.95) 100%)',
          border: '1px solid rgba(56, 189, 248, 0.3)',
          borderRadius: '16px',
          padding: '2.5rem',
          marginBottom: '2.5rem',
          textAlign: 'center',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
        }}
      >
        <div className="hero-badge" style={{ margin: '0 auto 1rem' }}>
          <span>🎉</span>
          <span>Đánh giá hoàn tất</span>
        </div>

        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.5rem', color: '#ffffff' }}>
          Trình độ ước tính của bạn
        </h1>

        {/* Big CEFR Level Badge */}
        <div style={{ margin: '1.25rem 0' }}>
          <span
            style={{
              display: 'inline-block',
              fontSize: '3.5rem',
              fontWeight: 900,
              letterSpacing: '0.05em',
              color: levelInfo.color,
              textShadow: `0 0 30px ${levelInfo.color}66`,
              padding: '0.5rem 2rem',
              borderRadius: '12px',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              border: `2px solid ${levelInfo.color}44`,
            }}
          >
            {result.overall_level.toUpperCase()}
          </span>
          <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#f1f5f9', marginTop: '0.5rem' }}>
            {levelInfo.label}
          </div>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '560px', margin: '0.5rem auto 0', fontSize: '0.95rem' }}>
            {levelInfo.desc}
          </p>
        </div>

        {/* Quick Stats Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '1rem',
            marginTop: '2rem',
            paddingTop: '1.5rem',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>SỐ CÂU ĐÚNG</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--accent-emerald)' }}>
              {result.correct_answers} / {result.total_questions}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>ĐỘ CHÍNH XÁC</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>
              {Math.round(result.accuracy * 100)}%
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>ĐIỂM TỔNG</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#ffffff' }}>
              {result.total_score} / {result.max_score}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>NGÀY HOÀN THÀNH</div>
            <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
              {new Date(result.created_at).toLocaleDateString('vi-VN')}
            </div>
          </div>
        </div>
      </div>

      {/* Skill Breakdown Grid */}
      <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-primary)' }}>
        📊 Năng lực theo từng kỹ năng
      </h2>

      <div className="grid" style={{ marginBottom: '2.5rem' }}>
        {skillsList.map((skillKey) => {
          const s = result.skill_scores[skillKey];
          if (!s) return null;
          const pct = Math.round(s.accuracy * 100);

          return (
            <Card key={skillKey} title={s.title}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                  Đúng {s.correctCount}/{s.totalQuestions} câu
                </span>
                <Badge variant={pct >= 70 ? 'success' : pct >= 50 ? 'info' : 'warning'}>
                  Cấp độ {s.estimatedLevel.toUpperCase()}
                </Badge>
              </div>

              {/* Progress bar */}
              <div
                style={{
                  width: '100%',
                  height: '10px',
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  borderRadius: '999px',
                  overflow: 'hidden',
                  marginBottom: '0.5rem',
                }}
              >
                <div
                  style={{
                    width: `${pct}%`,
                    height: '100%',
                    backgroundColor: pct >= 70 ? 'var(--accent-emerald)' : pct >= 50 ? 'var(--accent-cyan)' : 'var(--accent-amber)',
                    borderRadius: '999px',
                  }}
                />
              </div>

              <div style={{ textAlign: 'right', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {pct}%
              </div>
            </Card>
          );
        })}
      </div>

      {/* Strengths & Weaknesses */}
      <div className="grid" style={{ marginBottom: '2.5rem' }}>
        <Card title="💪 Điểm mạnh nổi bật">
          <ul style={{ paddingLeft: '1.25rem', color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.8 }}>
            {result.strengths.map((st, i) => (
              <li key={i} style={{ color: 'var(--accent-emerald)' }}>
                <span style={{ color: 'var(--text-primary)' }}>{st}</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card title="🎯 Điểm cần ưu tiên cải thiện">
          <ul style={{ paddingLeft: '1.25rem', color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.8 }}>
            {result.weaknesses.map((w, i) => (
              <li key={i} style={{ color: 'var(--accent-amber)' }}>
                <span style={{ color: 'var(--text-primary)' }}>{w}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {/* Next Steps / Phase 3 Integration Card */}
      <div
        className="loop-banner"
        style={{
          borderRadius: '16px',
          padding: '2rem',
          marginBottom: '3rem',
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(6, 78, 59, 0.2) 100%)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
        }}
      >
        <h3 className="loop-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span>🚀</span>
          <span>Khuyến nghị tiếp theo cho Lộ trình học (Phase 3)</span>
        </h3>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.25rem', fontSize: '0.95rem' }}>
          Hồ sơ năng lực của bạn đã được lưu vào hệ thống (`profiles.estimated_level = {result.overall_level.toUpperCase()}`).
          Ở Phase 3, hệ thống sẽ tự động tổng hợp mục tiêu từ Onboarding cùng kết quả bài kiểm tra này để sinh ra <strong>Lộ trình học thích ứng (Adaptive Learning Path)</strong> và kế hoạch hàng ngày (Daily Plan).
        </p>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <Link href="/dashboard" className="btn btn-primary">
            Quay lại Dashboard học tập
          </Link>
          <Link href="/assessment/test" className="btn btn-secondary">
            Làm lại bài kiểm tra
          </Link>
        </div>
      </div>

      {/* Detailed Question Review & Explanations Accordion */}
      <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-primary)' }}>
        🔍 Xem lại chi tiết từng câu hỏi &amp; Giải thích đáp án
      </h2>

      <div style={{ display: 'grid', gap: '1.25rem' }}>
        {reviews.map((rev, idx) => {
          return (
            <div
              key={rev.question.id}
              className="card"
              style={{
                padding: '1.5rem',
                borderLeft: rev.isCorrect
                  ? '4px solid var(--accent-emerald)'
                  : '4px solid #ef4444',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>Câu {idx + 1}</span>
                  <Badge variant={rev.isCorrect ? 'success' : 'warning'}>
                    {rev.isCorrect ? '✓ Chính xác' : '✗ Chưa đúng'}
                  </Badge>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    [{rev.question.skill.toUpperCase()}] Cấp độ {rev.question.level.toUpperCase()}
                  </span>
                </div>

                <div style={{ fontSize: '0.85rem' }}>
                  Bạn chọn:{' '}
                  <strong style={{ color: rev.isCorrect ? 'var(--accent-emerald)' : '#ef4444' }}>
                    {rev.selectedOptionId || 'Chưa trả lời'}
                  </strong>
                  {' | '}Đáp án đúng:{' '}
                  <strong style={{ color: 'var(--accent-emerald)' }}>{rev.correctOptionId}</strong>
                </div>
              </div>

              {rev.question.context_text && (
                <div
                  style={{
                    padding: '0.75rem 1rem',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(255, 255, 255, 0.03)',
                    marginBottom: '1rem',
                    fontSize: '0.9rem',
                    color: 'var(--text-secondary)',
                    whiteSpace: 'pre-line',
                  }}
                >
                  {rev.question.context_text}
                </div>
              )}

              <p style={{ fontWeight: 600, marginBottom: '1rem', color: 'var(--text-primary)' }}>
                {rev.question.prompt}
              </p>

              {/* Options display */}
              <div style={{ display: 'grid', gap: '0.5rem', marginBottom: '1rem' }}>
                {rev.question.options.map((opt) => {
                  const isUserPick = rev.selectedOptionId === opt.id;
                  const isCorrectPick = rev.correctOptionId === opt.id;

                  let optBg = 'rgba(255, 255, 255, 0.02)';
                  let optBorder = '1px solid rgba(255, 255, 255, 0.06)';
                  if (isCorrectPick) {
                    optBg = 'rgba(16, 185, 129, 0.15)';
                    optBorder = '1px solid rgba(16, 185, 129, 0.4)';
                  } else if (isUserPick && !rev.isCorrect) {
                    optBg = 'rgba(239, 68, 68, 0.15)';
                    optBorder = '1px solid rgba(239, 68, 68, 0.4)';
                  }

                  return (
                    <div
                      key={opt.id}
                      style={{
                        padding: '0.65rem 1rem',
                        borderRadius: '8px',
                        background: optBg,
                        border: optBorder,
                        fontSize: '0.9rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                      }}
                    >
                      <strong style={{ color: isCorrectPick ? 'var(--accent-emerald)' : isUserPick ? '#ef4444' : 'var(--text-muted)' }}>
                        {opt.id}.
                      </strong>
                      <span style={{ color: '#e2e8f0' }}>{opt.text}</span>
                      {isCorrectPick && (
                        <span style={{ marginLeft: 'auto', fontSize: '0.8rem', color: 'var(--accent-emerald)', fontWeight: 600 }}>
                          Đáp án đúng
                        </span>
                      )}
                      {isUserPick && !isCorrectPick && (
                        <span style={{ marginLeft: 'auto', fontSize: '0.8rem', color: '#ef4444', fontWeight: 600 }}>
                          Lựa chọn của bạn
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Detailed Explanation */}
              <div
                style={{
                  padding: '0.85rem 1rem',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(56, 189, 248, 0.06)',
                  border: '1px solid rgba(56, 189, 248, 0.2)',
                  fontSize: '0.9rem',
                  color: '#bae6fd',
                }}
              >
                💡 <strong>Giải thích chi tiết:</strong> {rev.explanation}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
