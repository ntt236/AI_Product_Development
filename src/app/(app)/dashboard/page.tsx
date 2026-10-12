import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUserProfile } from '@/modules/profile/services';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { LogoutButton } from '@/components/auth/logout-button';
import { GOAL_OPTIONS } from '@/modules/onboarding/constants';

export const metadata = {
  title: 'Dashboard — AI English Learning Platform',
  description: 'Trung tâm học tập và tiến độ cá nhân',
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const profile = await getCurrentUserProfile();

  // If user has not completed onboarding, guide them to onboarding
  if (!profile?.onboarding_completed_at) {
    redirect('/onboarding');
  }

  // Fetch active goals
  const { data: goals } = await supabase
    .from('goals')
    .select('*')
    .eq('user_id', user.id)
    .eq('status', 'active');

  // Fetch preferences
  const { data: preferences } = await supabase
    .from('learner_preferences')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle();

  const primaryGoal = goals?.find((g) => g.priority === 'primary');
  const secondaryGoals = goals?.filter((g) => g.priority === 'secondary') || [];

  const getGoalDetails = (type?: string) => {
    return GOAL_OPTIONS.find((g) => g.type === type);
  };

  return (
    <div className="container">
      {/* Navigation Header */}
      <header className="navbar">
        <Link href="/" className="nav-brand">
          <span>🌱</span>
          <span>AI English Platform</span>
        </Link>
        <div className="nav-user">
          <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            Xin chào, <strong>{profile?.display_name || user.email?.split('@')[0]}</strong>
          </span>
          <LogoutButton />
        </div>
      </header>

      {/* Main Dashboard Hero */}
      <div className="header" style={{ textAlign: 'left', marginBottom: '2.5rem' }}>
        <div className="hero-badge">
          <span>●</span>
          <span>Learner Workspace</span>
        </div>
        <h1 className="title" style={{ fontSize: '2.25rem' }}>
          Hồ sơ học tập của bạn
        </h1>
        <p className="subtitle" style={{ margin: '0' }}>
          Thông tin mục tiêu và thiết lập cá nhân hóa cho hành trình chinh phục tiếng Anh.
        </p>
      </div>

      {/* Profile & Goals Grid */}
      <div className="grid">
        {/* Profile Info Card */}
        <Card title="Thông tin người học">
          <ul className="status-list">
            <li className="status-item">
              <div>
                <div className="status-label">Tên hiển thị</div>
                <div className="status-desc">{profile?.display_name || 'Chưa đặt'}</div>
              </div>
              <Badge variant="default">Tài khoản</Badge>
            </li>
            <li className="status-item">
              <div>
                <div className="status-label">Email tài khoản</div>
                <div className="status-desc">{user.email}</div>
              </div>
              <Badge variant="success">Đã xác thực</Badge>
            </li>
            <li className="status-item">
              <div>
                <div className="status-label">Trình độ ước lượng (CEFR)</div>
                <div className="status-desc">
                  {profile?.estimated_level
                    ? profile.estimated_level.toUpperCase()
                    : 'Chưa đánh giá (Chờ Placement Test)'}
                </div>
              </div>
              <Badge variant="info">
                {profile?.estimated_level ? profile.estimated_level.toUpperCase() : 'Chờ test'}
              </Badge>
            </li>
            <li className="status-item">
              <div>
                <div className="status-label">Trạng thái Onboarding</div>
                <div className="status-desc">
                  Hoàn tất: {profile?.onboarding_completed_at ? new Date(profile.onboarding_completed_at).toLocaleDateString('vi-VN') : 'N/A'}
                </div>
              </div>
              <Badge variant="success">Hoàn thành</Badge>
            </li>
          </ul>
        </Card>

        {/* Learning Goals Card */}
        <Card title="Mục tiêu & Lịch học">
          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
              MỤC TIÊU CHÍNH (PRIMARY)
            </div>
            {primaryGoal ? (
              <div
                style={{
                  padding: '0.85rem 1rem',
                  borderRadius: '8px',
                  background: 'rgba(16, 185, 129, 0.1)',
                  border: '1px solid rgba(16, 185, 129, 0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <strong>{getGoalDetails(primaryGoal.goal_type)?.title || primaryGoal.title}</strong>
                  {primaryGoal.target_toeic_score && (
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      Mục tiêu TOEIC: {primaryGoal.target_toeic_score} điểm
                    </div>
                  )}
                </div>
                <Badge variant="success">Ưu tiên 1</Badge>
              </div>
            ) : (
              <div style={{ color: 'var(--text-secondary)' }}>Chưa chọn mục tiêu chính</div>
            )}
          </div>

          {secondaryGoals.length > 0 && (
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                MỤC TIÊU BỔ TRỢ ({secondaryGoals.length})
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {secondaryGoals.map((sg) => (
                  <span
                    key={sg.id}
                    style={{
                      padding: '0.35rem 0.75rem',
                      borderRadius: '6px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid var(--border-color)',
                      fontSize: '0.85rem',
                    }}
                  >
                    {getGoalDetails(sg.goal_type)?.title || sg.title}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.06)', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>THỜI LƯỢNG MỖI NGÀY</div>
              <strong style={{ color: 'var(--accent-cyan)' }}>{preferences?.daily_minutes || 30} phút / ngày</strong>
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>TẦN SUẤT HỌC</div>
              <strong>{preferences?.preferred_study_days?.length || 5} ngày / tuần</strong>
            </div>
          </div>

          <div style={{ marginTop: '1.5rem', textAlign: 'right' }}>
            <Link href="/onboarding" className="btn btn-secondary btn-sm">
              ✏️ Chỉnh sửa mục tiêu &amp; thời gian
            </Link>
          </div>
        </Card>
      </div>

      {/* Next Up: Phase 2 Placement Assessment Banner */}
      <div className="loop-banner" style={{ marginTop: '1rem' }}>
        <h3 className="loop-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span>🚀</span>
          <span>Bước tiếp theo: Phase 2 — Placement Assessment</span>
        </h3>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.25rem', maxWidth: '720px' }}>
          Bạn đã hoàn thành thiết lập mục tiêu! Bước kế tiếp là làm bài kiểm tra đánh giá năng lực ban đầu (Placement Test) để hệ thống đo lường chính xác các kỹ năng (Từ vựng, Ngữ pháp, Nghe, Đọc) và sinh Lộ trình học thích ứng (Adaptive Learning Path).
        </p>
        <div>
          <button className="btn btn-primary" disabled style={{ opacity: 0.7, cursor: 'default' }}>
            📝 Làm bài kiểm tra đầu vào (Mở ở Phase 2)
          </button>
        </div>
      </div>
    </div>
  );
}
