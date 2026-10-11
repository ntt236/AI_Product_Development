import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

export default function HomePage() {
  const isSupabaseConfigured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)
  );

  return (
    <main className="container">
      <header className="header">
        <div className="hero-badge">
          <span>●</span>
          <span>Phase 0: Foundation &amp; Tooling Setup</span>
        </div>
        <h1 className="title">AI English Learning Platform</h1>
        <p className="subtitle">
          Nền tảng học tiếng Anh thích ứng thông minh (Adaptive AI English Learning Platform)
          dành cho người mất gốc và người học định hướng mục tiêu rõ ràng.
        </p>
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
        <Card title="Trạng thái nền tảng kỹ thuật">
          <ul className="status-list">
            <li className="status-item">
              <div>
                <div className="status-label">Next.js Framework</div>
                <div className="status-desc">App Router + React 19 + TypeScript strict mode</div>
              </div>
              <Badge variant="success">Hoạt động</Badge>
            </li>
            <li className="status-item">
              <div>
                <div className="status-label">Kiến trúc mã nguồn</div>
                <div className="status-desc">Modular Monolith (src/modules/, src/lib/, src/components/)</div>
              </div>
              <Badge variant="success">Chuẩn hóa</Badge>
            </li>
            <li className="status-item">
              <div>
                <div className="status-label">Code Quality &amp; Linting</div>
                <div className="status-desc">ESLint + Next.js Core Web Vitals + TypeScript check</div>
              </div>
              <Badge variant="success">Sẵn sàng</Badge>
            </li>
          </ul>
        </Card>

        <Card title="Tích hợp dịch vụ &amp; Dữ liệu">
          <ul className="status-list">
            <li className="status-item">
              <div>
                <div className="status-label">Supabase Auth &amp; Database</div>
                <div className="status-desc">
                  {isSupabaseConfigured
                    ? 'Đã phát hiện biến môi trường Supabase.'
                    : 'Chờ thiết lập thông tin kết nối trong .env.local.'}
                </div>
              </div>
              <Badge variant={isSupabaseConfigured ? 'success' : 'warning'}>
                {isSupabaseConfigured ? 'Đã kết nối' : 'Chờ credentials'}
              </Badge>
            </li>
            <li className="status-item">
              <div>
                <div className="status-label">Supabase Helper Layers</div>
                <div className="status-desc">Client Helper, Server Helper (Next.js 15 cookies), Admin Helper</div>
              </div>
              <Badge variant="success">Đã cấu hình</Badge>
            </li>
            <li className="status-item">
              <div>
                <div className="status-label">AI Provider Abstraction</div>
                <div className="status-desc">Interface adapter server-side (triển khai API ở Phase 5)</div>
              </div>
              <Badge variant="info">Đã cấu trúc</Badge>
            </li>
          </ul>
        </Card>
      </section>

      {/* Development Next Step */}
      <Card title="Kế hoạch tiếp theo (Next Step)">
        <p style={{ marginBottom: '0.75rem' }}>
          Giai đoạn <strong>Phase 0 — Foundation &amp; Tooling Setup</strong> đã hoàn thành thiết lập kỹ thuật nền tảng.
          Hệ thống đã sẵn sàng cho bước tiếp theo:
        </p>
        <ul style={{ paddingLeft: '1.25rem', color: 'var(--text-secondary)' }}>
          <li>
            <strong>Phase 1:</strong> Triển khai Authentication, Profile &amp; Onboarding flow (Supabase Auth + Database RLS).
          </li>
          <li>
            <strong>Cấu hình môi trường:</strong> Copy file <code>.env.example</code> sang <code>.env.local</code> và điền Supabase credentials thật trước khi kiểm thử tính năng kết nối DB.
          </li>
        </ul>
      </Card>

      <footer className="footer">
        AI English Learning Platform &bull; Phase 0 Foundation Completed
      </footer>
    </main>
  );
}
