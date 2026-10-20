import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import {
  getPlacementAssessmentWithQuestions,
  getUserLatestAssessmentResult,
} from '@/modules/assessment/services';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Clock,
  RotateCcw,
  CheckCircle2,
  ArrowRight,
  BookOpen,
  Sparkles,
  ArrowLeft,
  FileCheck2,
} from 'lucide-react';

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
    <div className="min-h-screen bg-background text-foreground">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center text-sm font-bold">
              🌱
            </span>
            <span className="font-extrabold text-base tracking-tight">
              AI English Platform
            </span>
          </Link>

          <Button asChild variant="ghost" size="sm">
            <Link href="/dashboard">
              <ArrowLeft className="w-4 h-4 mr-1.5" />
              <span>Về Dashboard</span>
            </Link>
          </Button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
        {/* Header */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/10 border border-cyan-500/25 text-cyan-400">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Placement Assessment</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Đánh giá trình độ tiếng Anh đầu vào
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl leading-relaxed">
            Hệ thống sẽ đo lường toàn diện 4 kỹ năng cốt lõi để xác định cấp độ CEFR ước tính và kiến tạo Lộ trình học thích ứng dành riêng cho bạn.
          </p>
        </div>

        {/* Main Grid: Status & Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Test Overview Card */}
          <Card>
            <CardContent className="p-6 space-y-5">
              <div className="flex items-center gap-2 text-foreground font-bold text-base pb-3 border-b">
                <BookOpen className="w-5 h-5 text-cyan-400" />
                <h2>Cấu trúc &amp; Quy tắc bài thi</h2>
              </div>

              <div className="space-y-3.5 divide-y divide-border/40 text-xs">
                <div className="flex items-center justify-between pt-1">
                  <div>
                    <div className="font-semibold text-foreground">Số lượng câu hỏi</div>
                    <div className="text-muted-foreground">{assessment?.total_questions || questions.length || 16} câu hỏi trắc nghiệm khách quan</div>
                  </div>
                  <Badge variant="default">16 câu</Badge>
                </div>

                <div className="flex items-center justify-between pt-3">
                  <div>
                    <div className="font-semibold text-foreground">Kỹ năng đánh giá</div>
                    <div className="text-muted-foreground">Từ vựng, Ngữ pháp, Đọc hiểu, Nghe/Hội thoại</div>
                  </div>
                  <Badge variant="info">4 Kỹ năng</Badge>
                </div>

                <div className="flex items-center justify-between pt-3">
                  <div>
                    <div className="font-semibold text-foreground">Thời gian làm bài ước tính</div>
                    <div className="text-muted-foreground">20 - 25 phút (Tự do điều hướng giữa các câu)</div>
                  </div>
                  <Badge variant="default">~25 phút</Badge>
                </div>

                <div className="flex items-center justify-between pt-3">
                  <div>
                    <div className="font-semibold text-foreground">Lưu tiến độ &amp; Khôi phục</div>
                    <div className="text-muted-foreground">Tự động lưu từng câu. Bạn có thể tạm dừng và tiếp tục bất cứ lúc nào.</div>
                  </div>
                  <Badge variant="success">Tự động lưu</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Current State / Action Card */}
          <Card className="flex flex-col justify-between">
            <CardContent className="p-6 space-y-5 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-foreground font-bold text-base pb-3 border-b mb-4">
                  <FileCheck2 className="w-5 h-5 text-emerald-400" />
                  <h2>Trạng thái làm bài của bạn</h2>
                </div>

                {inProgressAttempt ? (
                  <div className="space-y-4">
                    <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/25 space-y-1">
                      <div className="text-xs font-semibold text-cyan-400 flex items-center gap-1.5">
                        <Clock className="w-4 h-4" />
                        <span>Bạn có một bài làm đang dang dở</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Đã hoàn thành: <strong className="text-foreground">{inProgressAttempt.answered_count} / {inProgressAttempt.total_questions}</strong> câu.
                      </p>
                    </div>

                    <Button asChild size="lg" className="w-full font-bold shadow-lg shadow-cyan-500/20">
                      <Link href="/assessment/test">
                        <span>Tiếp tục làm bài thi</span>
                        <ArrowRight className="w-4 h-4 ml-1.5" />
                      </Link>
                    </Button>
                  </div>
                ) : latestResult ? (
                  <div className="space-y-4">
                    <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/25 space-y-1">
                      <div className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Bạn đã hoàn thành bài kiểm tra đầu vào</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Trình độ ước lượng: <strong className="text-foreground font-bold">{latestResult.overall_level.toUpperCase()}</strong> | Điểm: {latestResult.correct_answers}/{latestResult.total_questions} ({Math.round(latestResult.accuracy * 100)}%)
                      </p>
                    </div>

                    <div className="space-y-2.5">
                      <Button asChild variant="secondary" className="w-full">
                        <Link href={`/assessment/results/${latestResult.attempt_id}`}>
                          Xem chi tiết kết quả &amp; giải thích đáp án
                        </Link>
                      </Button>
                      <Button asChild className="w-full">
                        <Link href="/assessment/test">
                          <RotateCcw className="w-4 h-4 mr-1.5" />
                          Làm lại bài kiểm tra
                        </Link>
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Bạn chưa thực hiện bài kiểm tra đầu vào nào. Hãy dành khoảng 20 phút tập trung để có kết quả đánh giá khách quan và lộ trình sát với năng lực nhất.
                    </p>

                    <Button asChild size="lg" className="w-full font-bold shadow-lg shadow-cyan-500/20">
                      <Link href="/assessment/test">
                        <span>Bắt đầu làm bài kiểm tra ngay</span>
                        <ArrowRight className="w-4 h-4 ml-1.5" />
                      </Link>
                    </Button>
                  </div>
                )}
              </div>

              <div className="mt-6 pt-3 border-t border-border/40 text-[11px] text-muted-foreground leading-relaxed">
                ℹ️ <strong>Lưu ý học thuật:</strong> Cấp độ CEFR trong hệ thống là chỉ số ước tính nội bộ (Pre-A1 đến B2) dựa trên thuật toán chấm điểm độc lập nhằm hỗ trợ cá nhân hóa bài học, không phải chứng chỉ quốc tế chính thức.
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
