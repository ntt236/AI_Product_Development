'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import {
  Clock,
  ArrowUp,
  ArrowDown,
  CheckCircle2,
  Play,
  RotateCcw,
  Info,
  Calendar,
  Sparkles,
  HelpCircle,
  X,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { EmptyState, ErrorState } from '@/components/ui/state-feedback';
import type { DailyPlan, DailyPlanTask } from '@/modules/daily-plan/types';
import { reorderDailyTasksAction, skipDailyTaskAction } from '@/modules/daily-plan/actions';

interface DailyPlanViewProps {
  initialPlan: DailyPlan | null;
  error?: string;
  userName: string;
}

export function DailyPlanView({ initialPlan, error: initialError, userName }: DailyPlanViewProps) {
  const [plan, setPlan] = useState<DailyPlan | null>(initialPlan);
  const [selectedPlannedTask, setSelectedPlannedTask] = useState<DailyPlanTask | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(initialError || null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (!plan) {
    return (
      <EmptyState
        icon={<Calendar className="h-8 w-8 text-sky-400" />}
        title="Chưa có kế hoạch học hôm nay"
        description={errorMessage || 'Hệ thống chưa tạo bài học cho ngày hôm nay. Hãy bắt đầu ngay để kích hoạt chuỗi học tập!'}
        actionLabel="Quay lại Dashboard"
        actionHref="/dashboard"
        className="my-12"
      />
    );
  }

  const tasks = plan.tasks || [];
  const completedTasksCount = tasks.filter((t) => t.status === 'completed').length;
  const progressPercent =
    plan.target_minutes > 0
      ? Math.min(100, Math.round((plan.completed_minutes / plan.target_minutes) * 100))
      : 0;

  // Format date display
  const formatDateVi = (dateStr: string) => {
    try {
      const [year, month, day] = dateStr.split('-');
      return `Ngày ${day} tháng ${month}, ${year}`;
    } catch {
      return dateStr;
    }
  };

  const renderPlanStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="success">🎉 Đã hoàn thành 100%</Badge>;
      case 'partially_completed':
        return <Badge variant="warning">Hoàn thành một phần</Badge>;
      case 'in_progress':
        return <Badge variant="info">Đang thực hiện</Badge>;
      case 'skipped':
        return <Badge variant="secondary">Đã bỏ qua</Badge>;
      case 'planned':
      default:
        return <Badge variant="outline">Sẵn sàng học</Badge>;
    }
  };

  const renderSkillBadge = (skill?: string | null) => {
    switch (skill) {
      case 'vocabulary':
        return <Badge variant="info">Từ vựng</Badge>;
      case 'grammar':
        return <Badge variant="warning">Ngữ pháp</Badge>;
      case 'reading':
        return <Badge variant="secondary">Đọc hiểu</Badge>;
      case 'listening':
        return <Badge variant="success">Nghe hiểu</Badge>;
      default:
        return <Badge variant="outline">{skill || 'Tổng hợp'}</Badge>;
    }
  };

  // Reorder task handler
  const handleMoveTask = (currentIndex: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= tasks.length) return;

    const newTasks = [...tasks];
    const [movedTask] = newTasks.splice(currentIndex, 1);
    newTasks.splice(targetIndex, 0, movedTask);

    const reorderedIds = newTasks.map((t) => t.id);

    // Optimistic UI update
    setPlan((prev) =>
      prev
        ? {
            ...prev,
            tasks: newTasks.map((t, idx) => ({ ...t, position: idx + 1 })),
          }
        : null
    );

    startTransition(async () => {
      setErrorMessage(null);
      setSuccessMessage(null);
      const res = await reorderDailyTasksAction(plan.id, reorderedIds);
      if (!res.success) {
        setErrorMessage(res.error || 'Lỗi khi sắp xếp lại nhiệm vụ.');
        setPlan(initialPlan);
      } else {
        setSuccessMessage('Đã cập nhật thứ tự nhiệm vụ học tập thành công.');
        setTimeout(() => setSuccessMessage(null), 3500);
      }
    });
  };

  // Skip task handler
  const handleSkipTask = (taskId: string, taskTitle: string) => {
    if (!confirm(`Bạn có chắc chắn muốn bỏ qua nhiệm vụ "${taskTitle}" hôm nay?`)) {
      return;
    }

    startTransition(async () => {
      setErrorMessage(null);
      setSuccessMessage(null);
      const res = await skipDailyTaskAction(taskId);
      if (!res.success) {
        setErrorMessage(res.error || 'Lỗi khi bỏ qua nhiệm vụ.');
      } else {
        setSuccessMessage(`Đã bỏ qua nhiệm vụ "${taskTitle}".`);
        setTimeout(() => setSuccessMessage(null), 3500);
        setPlan((prev) =>
          prev
            ? {
                ...prev,
                tasks: prev.tasks.map((t) =>
                  t.id === taskId ? { ...t, status: 'skipped' } : t
                ),
              }
            : null
        );
      }
    });
  };

  return (
    <div className="space-y-8">
      {/* =========================================================================
          HEADER BANNER
          ========================================================================= */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-border/60">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-400">
              <Sparkles className="h-3 w-3" />
              <span>Daily Practice Hub</span>
            </span>
            {plan.generation_reason?.isScheduledDay ? (
              <Badge variant="success">Lịch rảnh của bạn</Badge>
            ) : (
              <Badge variant="info">Học linh hoạt</Badge>
            )}
            {renderPlanStatusBadge(plan.status)}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Kế hoạch học tập hôm nay
          </h1>
          <p className="text-sm text-muted-foreground">
            {formatDateVi(plan.plan_date)} • Mục tiêu: <strong className="text-foreground">{plan.target_minutes} phút</strong> • Chúc{' '}
            <strong className="text-sky-400">{userName}</strong> có một buổi học hứng khởi!
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button asChild variant="outline" size="sm">
            <Link href="/dashboard">
              <span>← Dashboard</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* Notifications */}
      {errorMessage && (
        <ErrorState
          title="Thông báo lỗi"
          message={errorMessage}
          onRetry={() => setErrorMessage(null)}
          retryLabel="Đóng"
        />
      )}

      {successMessage && (
        <div className="flex items-center justify-between p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-950/20 text-emerald-300 text-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>{successMessage}</span>
          </div>
          <button
            onClick={() => setSuccessMessage(null)}
            className="text-emerald-400 hover:text-emerald-200 text-xs px-2 py-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* =========================================================================
          PROGRESS DASHBOARD CARD
          ========================================================================= */}
      <Card className="border-border/80 bg-card/75 shadow-lg backdrop-blur-md">
        <CardContent className="p-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Thời lượng đã học
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl sm:text-3xl font-extrabold text-sky-400">
                  {plan.completed_minutes}
                </span>
                <span className="text-sm text-muted-foreground">/ {plan.target_minutes} phút</span>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Nhiệm vụ hoàn tất
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl sm:text-3xl font-extrabold text-emerald-400">
                  {completedTasksCount}
                </span>
                <span className="text-sm text-muted-foreground">/ {tasks.length} bài</span>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Nguồn kế hoạch
              </span>
              <p className="text-sm font-semibold text-foreground truncate mt-1">
                {plan.generation_reason?.activePathTitle || 'Lộ trình nền tảng khởi đầu'}
              </p>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-border/60">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Tiến độ hoàn thành kế hoạch</span>
              <span className="font-bold text-foreground">{progressPercent}%</span>
            </div>
            <Progress
              value={progressPercent}
              max={100}
              indicatorClassName="bg-gradient-to-r from-sky-400 via-emerald-400 to-emerald-500"
            />
          </div>
        </CardContent>
      </Card>

      {/* =========================================================================
          TASK LIST SECTION
          ========================================================================= */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-foreground">
              Danh sách nhiệm vụ hôm nay ({tasks.length})
            </h2>
            <p className="text-xs text-muted-foreground">
              Bạn có thể dùng nút mũi tên để linh hoạt đổi thứ tự bài học theo sở thích
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {tasks.map((task, index) => {
            const isCompleted = task.status === 'completed';
            const isSkipped = task.status === 'skipped';
            const isPendingTask = task.status === 'pending';
            const isRunnable = task.content_status === 'available';

            return (
              <div
                key={task.id}
                className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 rounded-xl border transition-all ${
                  isCompleted
                    ? 'border-emerald-500/30 bg-emerald-950/15 text-emerald-200'
                    : isSkipped
                    ? 'border-border/40 bg-secondary/20 opacity-60'
                    : 'border-border/80 bg-card/80 hover:border-sky-500/40 hover:shadow-md hover:shadow-sky-500/5'
                }`}
              >
                {/* Task info */}
                <div className="flex items-start gap-3.5 min-w-0">
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-xs font-bold ${
                      isCompleted
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                        : isSkipped
                        ? 'bg-secondary text-muted-foreground border border-white/5'
                        : 'bg-sky-500/15 text-sky-400 border border-sky-500/30'
                    }`}
                  >
                    {isCompleted ? '✓' : isSkipped ? '✕' : task.position}
                  </div>

                  <div className="space-y-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3
                        className={`text-sm sm:text-base font-semibold leading-tight ${
                          isSkipped ? 'text-muted-foreground line-through' : 'text-foreground'
                        }`}
                      >
                        {task.title}
                      </h3>
                      {renderSkillBadge(task.skill)}
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {task.estimated_minutes}p
                      </span>
                    </div>

                    {task.description && (
                      <p className="text-xs text-muted-foreground leading-relaxed max-w-2xl line-clamp-2">
                        {task.description}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-2 pt-0.5">
                      {isRunnable ? (
                        <Badge variant="success" className="text-[10px]">
                          ✓ Có bài tập tương tác
                        </Badge>
                      ) : (
                        <Badge variant="warning" className="text-[10px]">
                          📋 Giáo trình dự kiến
                        </Badge>
                      )}

                      {isCompleted && task.accuracy !== null && task.accuracy !== undefined && (
                        <span className="text-xs font-semibold text-emerald-400">
                          Chính xác: {Math.round(task.accuracy * 100)}%
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-border/40">
                  {/* Reordering arrows for pending tasks */}
                  {isPendingTask && (
                    <div className="flex items-center gap-1 pr-2 border-r border-border/60">
                      <button
                        type="button"
                        onClick={() => handleMoveTask(index, 'up')}
                        disabled={index === 0 || isPending}
                        className="flex h-7 w-7 items-center justify-center rounded-lg border border-border bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground disabled:opacity-30 disabled:pointer-events-none transition-colors"
                        title="Di chuyển lên trên"
                      >
                        <ArrowUp className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveTask(index, 'down')}
                        disabled={index === tasks.length - 1 || isPending}
                        className="flex h-7 w-7 items-center justify-center rounded-lg border border-border bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground disabled:opacity-30 disabled:pointer-events-none transition-colors"
                        title="Di chuyển xuống dưới"
                      >
                        <ArrowDown className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}

                  {/* Action buttons */}
                  {isPendingTask && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSkipTask(task.id, task.title)}
                      disabled={isPending}
                      className="text-xs text-muted-foreground hover:text-foreground"
                    >
                      Bỏ qua
                    </Button>
                  )}

                  {isRunnable && isPendingTask && (
                    <Button asChild size="sm" variant="default" className="gap-1.5 shadow-md shadow-sky-500/20">
                      <Link href={`/daily-plan/practice/${task.id}`}>
                        <Play className="h-3.5 w-3.5 fill-current" />
                        <span>Học &amp; Luyện tập</span>
                      </Link>
                    </Button>
                  )}

                  {isRunnable && isCompleted && (
                    <Button asChild size="sm" variant="outline" className="gap-1.5 text-xs">
                      <Link href={`/daily-plan/practice/${task.id}`}>
                        <RotateCcw className="h-3 w-3" />
                        <span>Làm lại bài</span>
                      </Link>
                    </Button>
                  )}

                  {!isRunnable && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedPlannedTask(task)}
                      className="text-xs gap-1 text-muted-foreground"
                    >
                      <Info className="h-3.5 w-3.5" />
                      <span>Chi tiết dự kiến</span>
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* =========================================================================
          PLANNED CURRICULUM MODAL
          ========================================================================= */}
      {selectedPlannedTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-2xl border border-amber-500/30 bg-card p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-border/60">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/15 text-amber-400">
                  <HelpCircle className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground">Giáo trình dự kiến</h3>
                  <p className="text-xs text-muted-foreground">Planned Curriculum Notice</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPlannedTask(null)}
                className="rounded-lg p-1 text-muted-foreground hover:bg-secondary hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-sm text-muted-foreground leading-relaxed">
              Chủ đề <strong className="text-foreground">{selectedPlannedTask.title}</strong> nằm trong
              khung lộ trình cá nhân hóa của bạn. Bài tập tương tác chuyên sâu đang được chuẩn hóa sư phạm
              và sẽ sớm được cập nhật.
            </p>

            <div className="p-3.5 rounded-xl border border-amber-500/30 bg-amber-500/10 text-xs text-amber-200 leading-relaxed">
              💡 <strong>Cam kết chất lượng:</strong> Nền tảng không tạo câu hỏi giả lập hoặc điểm số ảo. Hãy
              ưu tiên hoàn thành các bài có nhãn <strong>&quot;✓ Có bài tập tương tác&quot;</strong> để được
              hệ thống chấm điểm và ghi nhận tiến độ thực tế!
            </div>

            <div className="pt-2 flex justify-end">
              <Button onClick={() => setSelectedPlannedTask(null)} variant="default" size="sm">
                Đã hiểu
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
