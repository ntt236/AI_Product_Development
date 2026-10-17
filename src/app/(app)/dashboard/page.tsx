import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUserProfile } from '@/modules/profile/services';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Navbar } from '@/components/layout/navbar';
import { GOAL_OPTIONS } from '@/modules/onboarding/constants';
import { getUserLatestAssessmentResult } from '@/modules/assessment/services';
import { getUserLearningPath } from '@/modules/learning-path/services';
import { getDailyPlan } from '@/modules/daily-plan/services';

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

  // Fetch latest assessment result
  const latestAssessment = await getUserLatestAssessmentResult(user.id);

  // Fetch learning path (Phase 3)
  const learningPathData = await getUserLearningPath(user.id);
  const currentPath = learningPathData.path;

  // Fetch today's daily plan (Phase 4)
  const todayPlan = await getDailyPlan(user.id);

  const primaryGoal = goals?.find((g) => g.priority === 'primary');
  const secondaryGoals = goals?.filter((g) => g.priority === 'secondary') || [];

  const getGoalDetails = (type?: string) => {
    return GOAL_OPTIONS.find((g) => g.type === type);
  };

  const renderPathStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="success">Đang hoạt động</Badge>;
      case 'proposed':
        return <Badge variant="info">Chờ duyệt (Proposed)</Badge>;
      case 'paused':
        return <Badge variant="warning">Đang tạm dừng</Badge>;
      case 'completed':
        return <Badge variant="success">Hoàn thành</Badge>;
      case 'rejected':
        return <Badge variant="default">Đã từ chối</Badge>;
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  };

  return (
    <div className="container">
      {/* Navigation Header */}
      <Navbar
        displayName={profile?.display_name || undefined}
        email={user.email}
        activePath="dashboard"
      />

      {/* Main Dashboard Hero */}
      <div className="header" style={{ textAlign: 'left', marginBottom: '2rem' }}>
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

      {/* Phase 4: Today's Learning Plan Card */}
      <div
        className="card"
        style={{
          marginBottom: '2rem',
          border: '1px solid rgba(16, 185, 129, 0.35)',
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(15, 23, 42, 0.95) 100%)',
          boxShadow: '0 8px 32px -4px rgba(0, 0, 0, 0.35)',
          borderRadius: '16px',
          padding: '1.75rem',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.35rem' }}>
              <span style={{ fontSize: '1.4rem' }}>📅</span>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 700, margin: 0 }}>
                Kế hoạch học tập hôm nay (Daily Plan)
              </h3>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>
              {todayPlan
                ? `Mục tiêu hôm nay: ${todayPlan.target_minutes} phút • Đã hoàn thành ${todayPlan.completed_minutes} phút`
                : 'Khởi tạo bài học và bài tập hôm nay theo lộ trình học của bạn.'}
            </p>
          </div>

          <Link href="/daily-plan" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span>🚀 {todayPlan ? 'Vào Kế hoạch ngày' : 'Bắt đầu học ngay'}</span>
          </Link>
        </div>

        {todayPlan && (
          <div>
            {/* Progress mini bar */}
            <div style={{ margin: '1rem 0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                <span>
                  Tiến độ nhiệm vụ: {todayPlan.tasks?.filter((t) => t.status === 'completed').length || 0} /{' '}
                  {todayPlan.tasks?.length || 0} hoàn thành
                </span>
                <span>
                  {todayPlan.target_minutes > 0
                    ? Math.min(100, Math.round((todayPlan.completed_minutes / todayPlan.target_minutes) * 100))
                    : 0}
                  %
                </span>
              </div>
              <div style={{ width: '100%', height: '6px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '3px', overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${todayPlan.target_minutes > 0 ? Math.min(100, Math.round((todayPlan.completed_minutes / todayPlan.target_minutes) * 100)) : 0}%`,
                    height: '100%',
                    background: 'linear-gradient(90deg, var(--accent-cyan), #10b981)',
                  }}
                />
              </div>
            </div>

            {/* Tasks preview pills */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.75rem' }}>
              {todayPlan.tasks?.map((t) => (
                <span
                  key={t.id}
                  style={{
                    padding: '0.35rem 0.75rem',
                    borderRadius: '8px',
                    background: t.status === 'completed' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                    border: t.status === 'completed' ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid var(--border-color)',
                    fontSize: '0.85rem',
                    color: t.status === 'completed' ? '#34d399' : 'var(--text-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                  }}
                >
                  <span>{t.status === 'completed' ? '✓' : '○'}</span>
                  <span>{t.title}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>({t.estimated_minutes}p)</span>
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Phase 3: Learning Path Spotlight Banner */}
      <div
        className="card"
        style={{
          marginBottom: '2rem',
          border: '1px solid rgba(56, 189, 248, 0.3)',
          background: 'linear-gradient(135deg, rgba(26, 34, 52, 0.85) 0%, rgba(18, 24, 38, 0.95) 100%)',
          boxShadow: '0 8px 32px -4px rgba(0, 0, 0, 0.35)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.35rem' }}>
              <span style={{ fontSize: '1.4rem' }}>🗺️</span>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>
                Lộ trình học cá nhân hóa (Learning Path)
              </h3>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>
              Khung 3 Milestones thích ứng theo trình độ ước lượng và thời gian học hàng tuần.
            </p>
          </div>
          {currentPath && renderPathStatusBadge(currentPath.status)}
        </div>

        {currentPath ? (
          <div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1rem',
                margin: '1.25rem 0',
                padding: '1rem',
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
              }}
            >
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>TÊN LỘ TRÌNH</div>
                <strong style={{ color: 'var(--text-primary)', fontSize: '1rem' }}>
                  {currentPath.title}
                </strong>
              </div>
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>MỤC TIÊU CEFR</div>
                <strong style={{ color: 'var(--accent-cyan)', fontSize: '1.1rem' }}>
                  {currentPath.target_level.toUpperCase()}
                </strong>
              </div>
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>THỜI LƯỢNG ƯỚC TÍNH</div>
                <strong style={{ color: 'var(--text-primary)' }}>
                  ~{currentPath.estimated_weeks} tuần ({Math.round(currentPath.total_estimated_minutes / 60)} giờ)
                </strong>
              </div>
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>PHIÊN BẢN (VERSION)</div>
                <strong style={{ color: 'var(--accent-indigo)' }}>
                  v{currentPath.current_version} {currentPath.is_user_modified ? '(Đã tùy chỉnh)' : ''}
                </strong>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <Link href="/learning-path" className="btn btn-primary">
                {currentPath.status === 'proposed'
                  ? '🔍 Xem & Duyệt lộ trình đề xuất →'
                  : currentPath.status === 'paused'
                  ? '▶️ Tiếp tục lộ trình đang tạm dừng →'
                  : '🚀 Xem chi tiết lộ trình học →'}
              </Link>
              {currentPath.status === 'proposed' && (
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  ⚠️ Lộ trình đang chờ bạn phê duyệt trước khi bắt đầu bài học.
                </span>
              )}
            </div>
          </div>
        ) : (
          <div>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
              {latestAssessment
                ? 'Bạn đã hoàn tất bài đánh giá đầu vào! Hệ thống đã sẵn sàng tạo Lộ trình học 3 Milestones thích ứng riêng cho bạn.'
                : 'Bạn có thể làm bài đánh giá đầu vào để hệ thống đo lường điểm mạnh/yếu, hoặc tạo ngay Lộ trình học tiêu chuẩn (Starter Path) theo mục tiêu hiện tại.'}
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <Link href="/learning-path" className="btn btn-primary">
                ✨ Khởi tạo lộ trình học cá nhân hóa →
              </Link>
              {!latestAssessment && (
                <Link href="/assessment" className="btn btn-secondary">
                  🎯 Làm Placement Test trước (Khuyên dùng)
                </Link>
              )}
            </div>
          </div>
        )}
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

      {/* Placement Assessment Card */}
      <div className="loop-banner" style={{ marginTop: '1rem' }}>
        <h3 className="loop-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span>🎯</span>
          <span>Đánh giá năng lực đầu vào (Placement Assessment)</span>
        </h3>

        {latestAssessment ? (
          <div>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.25rem', maxWidth: '720px' }}>
              Bạn đã hoàn thành bài kiểm tra đầu vào. Trình độ ước tính hiện tại:{' '}
              <strong style={{ color: 'var(--accent-cyan)', fontSize: '1.1rem' }}>
                {latestAssessment.overall_level.toUpperCase()}
              </strong>{' '}
              ({latestAssessment.correct_answers}/{latestAssessment.total_questions} câu đúng —{' '}
              {Math.round(latestAssessment.accuracy * 100)}%).
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <Link href={`/assessment/results/${latestAssessment.attempt_id}`} className="btn btn-primary">
                📊 Xem chi tiết kết quả &amp; giải thích đáp án
              </Link>
              <Link href="/assessment" className="btn btn-secondary">
                🔄 Làm bài kiểm tra lại
              </Link>
            </div>
          </div>
        ) : (
          <div>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.25rem', maxWidth: '720px' }}>
              Bạn đã hoàn thành thiết lập mục tiêu! Hãy làm bài kiểm tra đánh giá năng lực ban đầu (16 câu hỏi, ~20 phút) để hệ thống đo lường 4 kỹ năng cốt lõi (Từ vựng, Ngữ pháp, Nghe, Đọc) và chuẩn bị dữ liệu cho Lộ trình học thích ứng (Adaptive Learning Path).
            </p>
            <div>
              <Link href="/assessment" className="btn btn-primary">
                📝 Bắt đầu làm bài kiểm tra đầu vào ngay
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
