import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { createClient } from '@/lib/supabase/server';
import {
  Sparkles,
  ArrowRight,
  Compass,
  Calendar,
  BookOpen,
  Shield,
  GraduationCap,
  Zap,
} from 'lucide-react';

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
      user = null;
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-cyan-500/20 selection:text-cyan-300">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <span className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-500 flex items-center justify-center text-white font-bold text-lg shadow-md shadow-cyan-500/20">
              🌱
            </span>
            <span className="font-extrabold text-lg sm:text-xl tracking-tight bg-gradient-to-r from-foreground via-foreground to-muted-foreground bg-clip-text">
              AI English Platform
            </span>
          </Link>

          <div className="flex items-center gap-3">
            {user ? (
              <Button asChild size="sm">
                <Link href="/dashboard">
                  <span>Vào Dashboard</span>
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Link>
              </Button>
            ) : (
              <>
                <Button asChild variant="ghost" size="sm">
                  <Link href="/login">Đăng nhập</Link>
                </Button>
                <Button asChild size="sm">
                  <Link href="/register">Đăng ký ngay</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-16 sm:space-y-24">
        {/* Hero Section */}
        <section className="text-center space-y-6 max-w-3xl mx-auto pt-4 sm:pt-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-cyan-500/10 border border-cyan-500/25 text-cyan-400">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Nền tảng Học Tiếng Anh Thích Ứng Thông Minh</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-tight sm:leading-none">
            Chinh phục tiếng Anh với{' '}
            <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-400 bg-clip-text text-transparent">
              Lộ trình Cá nhân hóa
            </span>
          </h1>

          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Học đúng trình độ, không lãng phí thời gian. Kết hợp thuật toán Spaced Repetition, bài kiểm tra thích ứng chuẩn CEFR và nhiệm vụ hàng ngày được điều chỉnh theo tốc độ của bạn.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            {user ? (
              <Button asChild size="lg" className="w-full sm:w-auto px-8 font-bold text-base shadow-xl shadow-cyan-500/25">
                <Link href="/dashboard">
                  <span>Vào Không Gian Học Tập</span>
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
            ) : (
              <>
                <Button asChild size="lg" className="w-full sm:w-auto px-8 font-bold text-base shadow-xl shadow-cyan-500/25">
                  <Link href="/register">
                    <span>Bắt Đầu Miễn Phí</span>
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                </Button>
                <Button asChild variant="secondary" size="lg" className="w-full sm:w-auto px-6">
                  <Link href="/login">Đã có tài khoản? Đăng nhập</Link>
                </Button>
              </>
            )}
          </div>
        </section>

        {/* Core Loop Banner */}
        <section className="p-6 sm:p-8 rounded-2xl bg-card/60 backdrop-blur border border-border/80 shadow-xl space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h2 className="text-xs font-bold text-cyan-400 uppercase tracking-widest flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Chu trình học khép kín (Core Learning Loop)
            </h2>
            <Badge variant="info">Adaptive Engine</Badge>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 pt-2">
            {[
              { num: '1', title: 'Assess', desc: 'Kiểm tra đầu vào' },
              { num: '2', title: 'Profile', desc: 'Hồ sơ năng lực' },
              { num: '3', title: 'Path', desc: 'Lộ trình 3 mốc' },
              { num: '4', title: 'Plan', desc: 'Kế hoạch ngày' },
              { num: '5', title: 'Practice', desc: 'Luyện tương tác' },
              { num: '6', title: 'Evidence', desc: 'Ghi nhận kết quả' },
              { num: '7', title: 'Adapt', desc: 'Thích ứng thông minh' },
            ].map((step) => (
              <div
                key={step.num}
                className="p-3 rounded-xl bg-background/50 border border-border/40 text-center space-y-1 relative"
              >
                <div className="text-[11px] font-bold text-cyan-400 font-mono">
                  Bước {step.num}
                </div>
                <div className="text-sm font-bold text-foreground">
                  {step.title}
                </div>
                <div className="text-[11px] text-muted-foreground truncate">
                  {step.desc}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Feature Highlights Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card hoverGlow>
            <CardContent className="p-6 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center">
                <Compass className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold">Lộ trình học cá nhân hóa</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Đề xuất lộ trình theo mục tiêu CEFR của bạn với quyền kiểm soát tối đa: người học có thể tùy chỉnh thứ tự các chủ đề theo ý muốn.
              </p>
            </CardContent>
          </Card>

          <Card hoverGlow>
            <CardContent className="p-6 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20 flex items-center justify-center">
                <Calendar className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold">Kế hoạch học tập hàng ngày</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Nhiệm vụ rèn luyện được định lượng phù hợp với quỹ thời gian bạn chọn, giúp duy trì chuỗi học tập đều đặn và không bị quá tải.
              </p>
            </CardContent>
          </Card>

          <Card hoverGlow>
            <CardContent className="p-6 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold">Ôn tập ngắt quãng thông minh</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Tự động tối ưu khoảng cách ôn tập từ vựng dựa trên tần suất nhớ đúng, giúp kiến thức chuyển hóa vững chắc vào bộ nhớ dài hạn.
              </p>
            </CardContent>
          </Card>
        </section>

        {/* System Status Architecture Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-cyan-400" />
                  Tính năng Nền tảng Đã hoàn thiện
                </h3>
                <Badge variant="success">Hoạt động</Badge>
              </div>

              <div className="space-y-3 divide-y divide-border/40 text-xs">
                <div className="pt-2 flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-foreground">Authentication &amp; User Profile</div>
                    <div className="text-muted-foreground">Supabase Auth, SSR Middleware bảo vệ route, Onboarding</div>
                  </div>
                  <Badge variant="success">Xong</Badge>
                </div>
                <div className="pt-3 flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-foreground">Placement Assessment</div>
                    <div className="text-muted-foreground">Khảo sát năng lực 4 kỹ năng chuẩn CEFR</div>
                  </div>
                  <Badge variant="success">Xong</Badge>
                </div>
                <div className="pt-3 flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-foreground">Learning Path &amp; Daily Plan</div>
                    <div className="text-muted-foreground">3 Milestones, tùy biến thứ tự, sắp xếp thứ tự học ngày</div>
                  </div>
                  <Badge variant="success">Xong</Badge>
                </div>
                <div className="pt-3 flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-foreground">Vocabulary &amp; Spaced Repetition</div>
                    <div className="text-muted-foreground">Flashcard phản xạ, chu kỳ ghi nhớ 1d-3d-7d-14d-30d</div>
                  </div>
                  <Badge variant="success">Xong</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold flex items-center gap-2">
                  <Shield className="w-5 h-5 text-indigo-400" />
                  Kiến trúc Dữ liệu &amp; Bảo mật
                </h3>
                <Badge variant="info">An toàn</Badge>
              </div>

              <div className="space-y-3 divide-y divide-border/40 text-xs">
                <div className="pt-2 flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-foreground">Row Level Security (RLS)</div>
                    <div className="text-muted-foreground">Cô lập dữ liệu người dùng 100% bằng auth.uid()</div>
                  </div>
                  <Badge variant="success">Bật</Badge>
                </div>
                <div className="pt-3 flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-foreground">Nguyên tử hóa &amp; Idempotency</div>
                    <div className="text-muted-foreground">Postgres RPC khóa phiên ôn tập, chống ghi trùng</div>
                  </div>
                  <Badge variant="success">Bảo vệ</Badge>
                </div>
                <div className="pt-3 flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-foreground">Quyền làm chủ của người học</div>
                    <div className="text-muted-foreground">AI không tự ý ghi đè lộ trình học của người dùng</div>
                  </div>
                  <Badge variant="success">Bảo đảm</Badge>
                </div>
                <div className="pt-3 flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-foreground">Giao diện người dùng tiêu chuẩn</div>
                    <div className="text-muted-foreground">Tailwind CSS v3 + Hệ thống Component shadcn/ui</div>
                  </div>
                  <Badge variant="success">Chuẩn hóa</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 py-8 bg-card/20 text-center text-xs text-muted-foreground">
        <div className="max-w-7xl mx-auto px-4">
          AI English Learning Platform &bull; Thiết kế &amp; Chuẩn hóa bởi Triều-FE &bull; All rights reserved.
        </div>
      </footer>
    </div>
  );
}
