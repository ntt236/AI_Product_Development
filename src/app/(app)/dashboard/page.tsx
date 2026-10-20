import { redirect } from 'next/navigation';
import Link from 'next/link';
import {
  Flame,
  CalendarCheck,
  BookMarked,
  Compass,
  ArrowRight,
  Clock,
  Sparkles,
  ChevronRight,
  Brain,
  Play,
  RotateCw,
  Target,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUserProfile } from '@/modules/profile/services';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Navbar } from '@/components/layout/navbar';
import { GOAL_OPTIONS } from '@/modules/onboarding/constants';
import { getUserLatestAssessmentResult } from '@/modules/assessment/services';
import { getUserLearningPath } from '@/modules/learning-path/services';
import { getDailyPlan } from '@/modules/daily-plan/services';
import { getVocabularyStats } from '@/modules/vocabulary/services';
import { getUserStreak } from '@/modules/streak/services';

export const metadata = {
  title: 'Dashboard — AI English Learning Platform',
  description: 'Trung tâm học tập và tiến độ cá nhân hóa',
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

  // Fetch assessment, learning path, daily plan, vocabulary stats, and streak
  const latestAssessment = await getUserLatestAssessmentResult(user.id);
  const learningPathData = await getUserLearningPath(user.id);
  const currentPath = learningPathData.path;
  const todayPlan = await getDailyPlan(user.id);
  const vocabStats = await getVocabularyStats(user.id);
  const streak = await getUserStreak(user.id);

  const primaryGoal = goals?.find((g) => g.priority === 'primary');
  const secondaryGoals = goals?.filter((g) => g.priority === 'secondary') || [];

  const getGoalDetails = (type?: string) => {
    return GOAL_OPTIONS.find((g) => g.type === type);
  };

  // Determine current day time greeting
  const currentHour = new Date().getHours();
  const timeGreeting =
    currentHour < 12 ? 'Chào buổi sáng' : currentHour < 18 ? 'Chào buổi chiều' : 'Chào buổi tối';

  // Calculate daily plan progress
  const completedTasksCount = todayPlan?.tasks?.filter((t) => t.status === 'completed').length || 0;
  const totalTasksCount = todayPlan?.tasks?.length || 0;
  const dailyProgressPercent =
    todayPlan && todayPlan.target_minutes > 0
      ? Math.min(100, Math.round((todayPlan.completed_minutes / todayPlan.target_minutes) * 100))
      : 0;

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
    <div className="min-h-screen bg-background pb-16">
      {/* Navbar with responsive mobile menu */}
      <Navbar
        displayName={profile?.display_name || undefined}
        email={user.email}
        activePath="dashboard"
        streak={{
          currentStreak: streak.currentStreak,
          hasStudiedToday: streak.hasStudiedToday,
        }}
      />

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-8 max-w-7xl">
        {/* =========================================================================
            1. HERO GREETING & OVERVIEW BANNER
            ========================================================================= */}
        <div className="relative overflow-hidden rounded-2xl border border-sky-500/25 bg-gradient-to-r from-sky-950/40 via-card to-card p-6 sm:p-8 backdrop-blur-xl shadow-xl shadow-sky-950/20">
          <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-sky-500/10 blur-3xl pointer-events-none" />
          <div className="absolute -left-16 -bottom-16 h-64 w-64 rounded-full bg-blue-600/10 blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-sky-400/30 bg-sky-400/10 px-3 py-1 text-xs font-semibold text-sky-400">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Không gian học tập thích ứng AI</span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-foreground">
                {timeGreeting},{' '}
                <span className="bg-gradient-to-r from-sky-400 via-sky-300 to-blue-500 bg-clip-text text-transparent">
                  {profile?.display_name || user.email?.split('@')[0] || 'Học viên'}
                </span>
                !
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                Hệ thống đã sẵn sàng lộ trình học thích ứng hôm nay. Hoàn thành bài học để giữ vững chuỗi
                học tập và củng cố phản xạ từ vựng!
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-3">
              <Button asChild size="lg" className="w-full sm:w-auto shadow-lg shadow-sky-500/25">
                <Link href="/daily-plan">
                  <Play className="h-4 w-4 fill-current" />
                  <span>Vào bài học hôm nay</span>
                </Link>
              </Button>
              {vocabStats.dueWords > 0 && (
                <Button asChild variant="outline" size="lg" className="w-full sm:w-auto border-amber-500/40 hover:bg-amber-500/10 text-amber-300">
                  <Link href="/vocabulary">
                    <RotateCw className="h-4 w-4 text-amber-400" />
                    <span>Ôn từ vựng ({vocabStats.dueWords})</span>
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* =========================================================================
            2. KEY METRIC SUMMARY GRID (4 CARDS)
            ========================================================================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {/* Metric 1: Streak */}
          <Card hoverGlow className="border-border/80">
            <CardContent className="p-5 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Chuỗi học tập
                </p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-foreground">
                    {streak.currentStreak}
                  </span>
                  <span className="text-xs font-medium text-muted-foreground">ngày liên tiếp</span>
                </div>
                <div className="pt-1">
                  <Badge
                    variant={streak.hasStudiedToday ? 'success' : streak.streakStatus === 'at_risk' ? 'warning' : 'secondary'}
                    className="text-[11px]"
                  >
                    {streak.hasStudiedToday
                      ? '✓ Đã học hôm nay'
                      : streak.streakStatus === 'at_risk'
                      ? '⚠️ Cần học giữ chuỗi'
                      : 'Kỷ lục: ' + streak.longestStreak + ' ngày'}
                  </Badge>
                </div>
              </div>
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-2xl border ${
                  streak.hasStudiedToday
                    ? 'border-amber-500/40 bg-amber-500/15 text-amber-400 shadow-md shadow-amber-500/20'
                    : 'border-border bg-secondary/80 text-muted-foreground'
                }`}
              >
                <Flame className={`h-6 w-6 ${streak.hasStudiedToday ? 'fill-amber-400 animate-pulse' : ''}`} />
              </div>
            </CardContent>
          </Card>

          {/* Metric 2: Daily Target */}
          <Card hoverGlow className="border-border/80">
            <CardContent className="p-5 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Mục tiêu hôm nay
                </p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-foreground">
                    {todayPlan ? todayPlan.completed_minutes : 0}
                  </span>
                  <span className="text-xs font-medium text-muted-foreground">
                    / {todayPlan ? todayPlan.target_minutes : preferences?.daily_minutes || 30} phút
                  </span>
                </div>
                <div className="pt-1 flex items-center gap-2">
                  <span className="text-xs text-emerald-400 font-semibold">
                    {completedTasksCount}/{totalTasksCount} bài xong
                  </span>
                </div>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-500/30 bg-emerald-500/15 text-emerald-400 shadow-md shadow-emerald-500/10">
                <CalendarCheck className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>

          {/* Metric 3: Vocabulary */}
          <Card hoverGlow className="border-border/80">
            <CardContent className="p-5 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Sổ từ vựng
                </p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-foreground">
                    {vocabStats.totalWords}
                  </span>
                  <span className="text-xs font-medium text-muted-foreground">từ đã lưu</span>
                </div>
                <div className="pt-1">
                  {vocabStats.dueWords > 0 ? (
                    <Badge variant="warning" className="text-[11px] animate-pulse">
                      ⏰ {vocabStats.dueWords} từ cần ôn
                    </Badge>
                  ) : (
                    <Badge variant="success" className="text-[11px]">
                      🏆 {vocabStats.masteredWords} từ thuộc sâu
                    </Badge>
                  )}
                </div>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-sky-500/30 bg-sky-500/15 text-sky-400 shadow-md shadow-sky-500/10">
                <BookMarked className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>

          {/* Metric 4: CEFR / Learning Path Level */}
          <Card hoverGlow className="border-border/80">
            <CardContent className="p-5 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Trình độ CEFR
                </p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-sky-400">
                    {profile?.estimated_level ? profile.estimated_level.toUpperCase() : 'A1'}
                  </span>
                  <span className="text-xs font-medium text-muted-foreground">
                    {latestAssessment ? `Đúng ${Math.round(latestAssessment.accuracy * 100)}%` : 'Ước tính'}
                  </span>
                </div>
                <div className="pt-1">
                  {currentPath ? (
                    renderPathStatusBadge(currentPath.status)
                  ) : (
                    <Badge variant="default" className="text-[11px]">Chưa tạo lộ trình</Badge>
                  )}
                </div>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-indigo-500/30 bg-indigo-500/15 text-indigo-400 shadow-md shadow-indigo-500/10">
                <Compass className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* =========================================================================
            3. MAIN CONTENT: 2-COLUMN ADAPTIVE LAYOUT
            ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* -----------------------------------------------------------------------
              LEFT COLUMN (8 COLS): Daily Plan & Learning Path Roadmap
              ----------------------------------------------------------------------- */}
          <div className="lg:col-span-8 space-y-8">
            {/* Today's Learning Plan Card */}
            <Card className="border-emerald-500/25 bg-gradient-to-br from-card via-card to-emerald-950/15 shadow-lg">
              <CardHeader className="pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                      <CalendarCheck className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Kế hoạch học hôm nay</CardTitle>
                      <CardDescription>
                        {todayPlan
                          ? `Hoàn thành bài tập để đạt mục tiêu ${todayPlan.target_minutes} phút mỗi ngày`
                          : 'Tự động tạo bài học theo Lộ trình học 3 Milestones của bạn'}
                      </CardDescription>
                    </div>
                  </div>

                  <Button asChild size="sm" variant="default" className="self-start sm:self-auto">
                    <Link href="/daily-plan">
                      <span>Vào Kế hoạch ngày</span>
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="space-y-5">
                {todayPlan ? (
                  <>
                    {/* Progress Bar */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
                        <span>
                          Thời gian: {todayPlan.completed_minutes} / {todayPlan.target_minutes} phút
                        </span>
                        <span className="font-bold text-foreground">{dailyProgressPercent}%</span>
                      </div>
                      <Progress
                        value={todayPlan.completed_minutes}
                        max={todayPlan.target_minutes || 30}
                        indicatorClassName="bg-gradient-to-r from-emerald-500 to-sky-400"
                      />
                    </div>

                    {/* Task List */}
                    <div className="space-y-2.5 pt-2">
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Nhiệm vụ trong ngày ({totalTasksCount} bài)
                      </p>
                      <div className="grid grid-cols-1 gap-2.5">
                        {todayPlan.tasks?.map((task) => {
                          const isDone = task.status === 'completed';
                          return (
                            <div
                              key={task.id}
                              className={`flex items-center justify-between p-3.5 rounded-xl border transition-all ${
                                isDone
                                  ? 'border-emerald-500/30 bg-emerald-950/20 text-emerald-300'
                                  : 'border-border/80 bg-secondary/40 hover:bg-secondary/70 text-foreground'
                              }`}
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <div
                                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                                    isDone
                                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                                      : 'bg-muted text-muted-foreground border border-white/5'
                                  }`}
                                >
                                  {isDone ? '✓' : '○'}
                                </div>
                                <div className="min-w-0">
                                  <p className="text-sm font-semibold truncate leading-tight">
                                    {task.title}
                                  </p>
                                  <div className="flex items-center gap-2 mt-1">
                                    <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                                      <Clock className="h-3 w-3" />
                                      {task.estimated_minutes} phút
                                    </span>
                                    <span className="text-[11px] text-muted-foreground capitalize">
                                      • {task.skill}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <div>
                                {isDone ? (
                                  <Badge variant="success" className="text-xs">Đã hoàn thành</Badge>
                                ) : (
                                  <Button asChild size="sm" variant="outline" className="h-8 text-xs gap-1">
                                    <Link href="/daily-plan">
                                      <span>Bắt đầu</span>
                                      <ChevronRight className="h-3.5 w-3.5" />
                                    </Link>
                                  </Button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="py-6 text-center">
                    <p className="text-sm text-muted-foreground mb-4">
                      Bạn chưa tạo kế hoạch học tập cho ngày hôm nay.
                    </p>
                    <Button asChild variant="default">
                      <Link href="/daily-plan">Khởi tạo kế hoạch ngay</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Learning Path Roadmap Spotlight Card */}
            <Card className="border-sky-500/25 bg-gradient-to-br from-card via-card to-sky-950/15 shadow-lg">
              <CardHeader className="pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/15 border border-sky-500/30 text-sky-400">
                      <Compass className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Lộ trình học cá nhân hóa</CardTitle>
                      <CardDescription>
                        Khung 3 Milestones thích ứng theo trình độ và mục tiêu người học
                      </CardDescription>
                    </div>
                  </div>

                  {currentPath && renderPathStatusBadge(currentPath.status)}
                </div>
              </CardHeader>

              <CardContent className="space-y-5">
                {currentPath ? (
                  <>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl border border-border/80 bg-secondary/30">
                      <div className="space-y-1">
                        <span className="text-[11px] font-medium text-muted-foreground uppercase">Tên lộ trình</span>
                        <p className="text-sm font-bold text-foreground truncate">{currentPath.title}</p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[11px] font-medium text-muted-foreground uppercase">Mục tiêu CEFR</span>
                        <p className="text-sm font-bold text-sky-400">{currentPath.target_level.toUpperCase()}</p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[11px] font-medium text-muted-foreground uppercase">Thời lượng</span>
                        <p className="text-sm font-bold text-foreground">~{currentPath.estimated_weeks} tuần</p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[11px] font-medium text-muted-foreground uppercase">Phiên bản</span>
                        <p className="text-sm font-bold text-indigo-400">
                          v{currentPath.current_version} {currentPath.is_user_modified ? '(Tùy chỉnh)' : ''}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                      <Button asChild variant="default">
                        <Link href="/learning-path" className="gap-2">
                          <span>
                            {currentPath.status === 'proposed'
                              ? 'Duyệt lộ trình đề xuất'
                              : currentPath.status === 'paused'
                              ? 'Tiếp tục lộ trình'
                              : 'Xem toàn bộ lộ trình 3 Milestones'}
                          </span>
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </Button>
                      {currentPath.status === 'proposed' && (
                        <p className="text-xs text-amber-300 flex items-center gap-1.5">
                          ⚠️ Đang chờ bạn xem và phê duyệt trước khi học.
                        </p>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="py-6 text-center space-y-4">
                    <p className="text-sm text-muted-foreground max-w-lg mx-auto">
                      {latestAssessment
                        ? 'Bạn đã hoàn tất bài đánh giá! Hệ thống sẵn sàng tạo Lộ trình học 3 Milestones cá nhân hóa riêng cho bạn.'
                        : 'Làm bài kiểm tra đánh giá năng lực để tạo Lộ trình học thích ứng chính xác nhất với trình độ hiện tại.'}
                    </p>
                    <div className="flex flex-wrap justify-center gap-3">
                      <Button asChild variant="default">
                        <Link href="/learning-path">Khởi tạo Lộ trình học ngay</Link>
                      </Button>
                      {!latestAssessment && (
                        <Button asChild variant="outline">
                          <Link href="/assessment">Làm Placement Test trước</Link>
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* -----------------------------------------------------------------------
              RIGHT COLUMN (4 COLS): Vocabulary Widget, Assessment & Goals
              ----------------------------------------------------------------------- */}
          <div className="lg:col-span-4 space-y-8">
            {/* Spaced Repetition Vocabulary Review Widget */}
            <Card className="border-amber-500/25 bg-gradient-to-br from-card via-card to-amber-950/15 shadow-lg">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400">
                      <BookMarked className="h-4 w-4" />
                    </div>
                    <div>
                      <CardTitle className="text-base">Ôn tập ngắt quãng</CardTitle>
                      <CardDescription className="text-xs">Spaced Review Flashcards</CardDescription>
                    </div>
                  </div>
                  <Badge variant={vocabStats.dueWords > 0 ? 'warning' : 'success'}>
                    {vocabStats.dueWords > 0 ? `${vocabStats.dueWords} từ đến hạn` : 'Đã xong'}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-2 text-center">
                  <div className="p-3 rounded-xl bg-secondary/40 border border-white/5">
                    <p className="text-[11px] text-muted-foreground">Đang học</p>
                    <p className="text-lg font-bold text-foreground mt-0.5">{vocabStats.learningWords}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-secondary/40 border border-white/5">
                    <p className="text-[11px] text-muted-foreground">Đang ôn</p>
                    <p className="text-lg font-bold text-sky-400 mt-0.5">{vocabStats.reviewingWords}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-secondary/40 border border-white/5">
                    <p className="text-[11px] text-muted-foreground">Thuộc sâu</p>
                    <p className="text-lg font-bold text-emerald-400 mt-0.5">{vocabStats.masteredWords}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-secondary/40 border border-white/5">
                    <p className="text-[11px] text-muted-foreground">Tổng lưu</p>
                    <p className="text-lg font-bold text-foreground mt-0.5">{vocabStats.totalWords}</p>
                  </div>
                </div>

                <div className="pt-2">
                  <Button
                    asChild
                    variant={vocabStats.dueWords > 0 ? 'default' : 'outline'}
                    className="w-full gap-2"
                  >
                    <Link href="/vocabulary">
                      <span>{vocabStats.dueWords > 0 ? `Ôn tập ngay (${vocabStats.dueWords} từ)` : 'Mở sổ từ vựng'}</span>
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Placement Assessment Card */}
            <Card className="border-border/80">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-500/15 border border-sky-500/30 text-sky-400">
                    <Brain className="h-4 w-4" />
                  </div>
                  <div>
                    <CardTitle className="text-base">Đánh giá năng lực</CardTitle>
                    <CardDescription className="text-xs">Placement Benchmark</CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {latestAssessment ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/40 border border-white/5">
                      <div>
                        <p className="text-xs text-muted-foreground">Trình độ xác thực</p>
                        <p className="text-lg font-bold text-sky-400">
                          {latestAssessment.overall_level.toUpperCase()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">Điểm số</p>
                        <p className="text-sm font-semibold text-foreground">
                          {latestAssessment.correct_answers}/{latestAssessment.total_questions} ({Math.round(latestAssessment.accuracy * 100)}%)
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button asChild variant="outline" size="sm" className="w-full text-xs">
                        <Link href={`/assessment/results/${latestAssessment.attempt_id}`}>
                          Xem phân tích
                        </Link>
                      </Button>
                      <Button asChild variant="ghost" size="sm" className="w-full text-xs">
                        <Link href="/assessment">Test lại</Link>
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Làm bài kiểm tra 16 câu hỏi (~20 phút) để phân tích 4 kỹ năng và phát hiện điểm yếu.
                    </p>
                    <Button asChild variant="outline" size="sm" className="w-full">
                      <Link href="/assessment">Bắt đầu đánh giá</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Profile Goals & Schedule Card */}
            <Card className="border-border/80">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-400">
                    <Target className="h-4 w-4" />
                  </div>
                  <div>
                    <CardTitle className="text-base">Mục tiêu & Lịch học</CardTitle>
                    <CardDescription className="text-xs">Thiết lập cá nhân</CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-3.5 text-xs">
                <div>
                  <span className="text-muted-foreground uppercase font-semibold text-[10px]">Mục tiêu chính</span>
                  <p className="text-sm font-bold text-foreground mt-0.5">
                    {primaryGoal
                      ? getGoalDetails(primaryGoal.goal_type)?.title || primaryGoal.title
                      : 'Chưa chọn'}
                  </p>
                  {primaryGoal?.target_toeic_score && (
                    <p className="text-xs text-sky-400 mt-0.5">
                      Mục tiêu TOEIC: {primaryGoal.target_toeic_score} điểm
                    </p>
                  )}
                  {secondaryGoals.length > 0 && (
                    <div className="mt-1.5">
                      <span className="text-muted-foreground uppercase font-semibold text-[10px]">Mục tiêu bổ trợ</span>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {secondaryGoals
                          .map((g) => getGoalDetails(g.goal_type)?.title || g.title)
                          .join(', ')}
                      </p>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/60">
                  <div>
                    <span className="text-muted-foreground text-[10px] uppercase font-semibold">Thời lượng</span>
                    <p className="text-xs font-bold text-foreground mt-0.5">
                      {preferences?.daily_minutes || 30} phút / ngày
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-[10px] uppercase font-semibold">Tần suất</span>
                    <p className="text-xs font-bold text-foreground mt-0.5">
                      {preferences?.preferred_study_days?.length || 5} ngày / tuần
                    </p>
                  </div>
                </div>

                <div className="pt-2 text-right">
                  <Button asChild variant="link" size="sm" className="text-xs text-sky-400 hover:text-sky-300">
                    <Link href="/onboarding">Chỉnh sửa mục tiêu & thời gian →</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
