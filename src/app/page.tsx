import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { createClient } from '@/lib/supabase/server';

export default async function HomePage() {
  const isSupabaseConfigured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)
  );

  let user = null;
  if (isSupabaseConfigured) {
    try {
      const supabase = await createClient();
      const { data } = await supabase.auth.getUser();
      user = data.user;
    } catch {
      // In case credentials are not connected yet
      user = null;
    }
  }

  return (
    <main className="container">
      {/* Top Navigation */}
      <header className="navbar">
        <Link href="/" className="nav-brand">
          <span>🌱</span>
          <span>AI English Platform</span>
        </Link>
        <div className="nav-user">
          {user ? (
            <Link href="/dashboard" className="btn btn-primary btn-sm">
              Đi tới Dashboard →
            </Link>
          ) : (
            <>
              <Link href="/login" className="btn btn-secondary btn-sm">
                Đăng nhập
              </Link>
              <Link href="/register" className="btn btn-primary btn-sm">
                Đăng ký
              </Link>
            </>
          )}
        </div>
      </header>

      <header className="header">
        <div className="hero-badge">
          <span>●</span>
          <span>Phase 1: Authentication, Profile &amp; Onboarding</span>
        </div>
        <h1 className="title">AI English Learning Platform</h1>
        <p className="subtitle">
          Nền tảng học tiếng Anh thích ứng thông minh (Adaptive AI English Learning Platform)
          dành cho người mất gốc và người học định hướng mục tiêu rõ ràng.
        </p>

        <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          {user ? (
            <Link href="/dashboard" className="btn btn-primary">
              Vào Không Gian Học Tập (Dashboard) →
            </Link>
          ) : (
            <>
              <Link href="/register" className="btn btn-primary">
                Bắt Đầu Học Ngay (Đăng Ký Miễn Phí) →
              </Link>
              <Link href="/login" className="btn btn-secondary">
                Đã có tài khoản? Đăng nhập
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Core Loop */}
      <section className="loop-banner">
        <h2 className="loop-title">Core Learning Loop</h2>
        <div className="loop-steps">
          <span className="loop-step">1. Assess</span>
          <span className="loop-arrow">→</span>
          <span className="loop-step">2. Learner Profile</span>
          <span className="loop-arrow">→</span>
          <span className="loop-step">3. Learning Path</span>
          <span className="loop-arrow">→</span>
          <span className="loop-step">4. Daily Plan</span>
          <span className="loop-arrow">→</span>
          <span className="loop-step">5. Practice</span>
          <span className="loop-arrow">→</span>
          <span className="loop-step">6. Evidence</span>
          <span className="loop-arrow">→</span>
          <span className="loop-step">7. Adapt</span>
        </div>
      </section>

      {/* System Status Grid */}
      <section className="grid">
        <Card title="Trạng thái Phase 1: Auth &amp; Onboarding">
          <ul className="status-list">
            <li className="status-item">
              <div>
                <div className="status-label">Authentication Flow</div>
                <div className="status-desc">Supabase Auth (Sign Up, Sign In, Sign Out, Session Cookies)</div>
              </div>
              <Badge variant="success">Hoàn thành</Badge>
            </li>
            <li className="status-item">
              <div>
                <div className="status-label">Bảo vệ Route (Middleware)</div>
                <div className="status-desc">Server-side route protection cho /dashboard, /onboarding</div>
              </div>
              <Badge variant="success">Hoạt động</Badge>
            </li>
            <li className="status-item">
              <div>
                <div className="status-label">Onboarding &amp; Profile</div>
                <div className="status-desc">3 bước: Mục tiêu chính, mục tiêu phụ, thời lượng học mỗi ngày</div>
              </div>
              <Badge variant="success">Hoàn thành</Badge>
            </li>
          </ul>
        </Card>

        <Card title="Cơ sở dữ liệu &amp; Bảo mật">
          <ul className="status-list">
            <li className="status-item">
              <div>
                <div className="status-label">SQL Migration Phase 1</div>
                <div className="status-desc">Bảng profiles, goals, learner_preferences + Triggers + RLS</div>
              </div>
              <Badge variant="info">Sẵn sàng áp dụng</Badge>
            </li>
            <li className="status-item">
              <div>
                <div className="status-label">Row Level Security (RLS)</div>
                <div className="status-desc">Cô lập dữ liệu người dùng 100% bằng chính sách auth.uid()</div>
              </div>
              <Badge variant="success">Đã cấu hình</Badge>
            </li>
            <li className="status-item">
              <div>
                <div className="status-label">Bước tiếp theo</div>
                <div className="status-desc">Phase 2: Placement Assessment &amp; Scoring Engine</div>
              </div>
              <Badge variant="default">Kế hoạch tiếp</Badge>
            </li>
          </ul>
        </Card>
      </section>

      <footer className="footer">
        AI English Learning Platform &bull; Phase 1 Implemented
      </footer>
    </main>
  );
}
