'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
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
      <div className="card" style={{ padding: '3rem 2rem', textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📅</div>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Chưa có kế hoạch học hôm nay</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', maxWidth: '600px', margin: '0 auto 1.5rem' }}>
          {errorMessage || 'Không thể tải hoặc tạo kế hoạch học tập hàng ngày.'}
        </p>
        <Link href="/dashboard" className="btn btn-primary">
          Quay lại Dashboard
        </Link>
      </div>
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
        return <Badge variant="default">Đã bỏ qua</Badge>;
      case 'planned':
      default:
        return <Badge variant="default">Sẵn sàng học</Badge>;
    }
  };

  const renderSkillBadge = (skill?: string | null) => {
    switch (skill) {
      case 'vocabulary':
        return <Badge variant="info">Từ vựng</Badge>;
      case 'grammar':
        return <Badge variant="warning">Ngữ pháp</Badge>;
      case 'reading':
        return <Badge variant="default">Đọc hiểu</Badge>;
      case 'listening':
        return <Badge variant="success">Nghe hiểu</Badge>;
      default:
        return <Badge variant="default">{skill || 'Tổng hợp'}</Badge>;
    }
  };

  // Reorder task handler
  const handleMoveTask = (currentIndex: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= tasks.length) return;

    const newTasks = [...tasks];
    const [movedTask] = newTasks.splice(currentIndex, 1);
    newTasks.splice(targetIndex, 0, movedTask);

    // Update positions
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
        // Revert on failure
        setPlan(initialPlan);
      } else {
        setSuccessMessage('Đã cập nhật thứ tự nhiệm vụ học tập thành công.');
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
        // Update local status
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
    <div style={{ paddingBottom: '4rem' }}>
      {/* Header Banner */}
      <div className="header" style={{ textAlign: 'left', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
          <div className="hero-badge">
            <span>●</span>
            <span>Daily Practice Hub</span>
          </div>
          {plan.generation_reason?.isScheduledDay ? (
            <Badge variant="success">Đúng lịch rảnh của bạn</Badge>
          ) : (
            <Badge variant="info">Học linh hoạt</Badge>
          )}
          {renderPlanStatusBadge(plan.status)}
        </div>

        <h1 className="title" style={{ fontSize: '2.25rem', marginBottom: '0.5rem' }}>
          Kế hoạch học tập hôm nay
        </h1>
        <p className="subtitle" style={{ margin: '0' }}>
          {formatDateVi(plan.plan_date)} • Mục tiêu: <strong>{plan.target_minutes} phút</strong> • Chúc{' '}
          <strong>{userName}</strong> có một buổi học hiệu quả!
        </p>
      </div>

      {/* Notification alerts */}
      {errorMessage && (
        <div
          style={{
            padding: '1rem',
            borderRadius: '8px',
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#f87171',
            marginBottom: '1.5rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span>⚠️ {errorMessage}</span>
          <button
            onClick={() => setErrorMessage(null)}
            style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer' }}
          >
            ✕
          </button>
        </div>
      )}

      {successMessage && (
        <div
          style={{
            padding: '1rem',
            borderRadius: '8px',
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            color: '#34d399',
            marginBottom: '1.5rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span>✓ {successMessage}</span>
          <button
            onClick={() => setSuccessMessage(null)}
            style={{ background: 'none', border: 'none', color: '#34d399', cursor: 'pointer' }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Progress Card */}
      <Card title="Tiến độ học tập trong ngày">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '1.25rem' }}>
          <div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
              THỜI LƯỢNG ĐÃ HỌC
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>
              {plan.completed_minutes}{' '}
              <span style={{ fontSize: '1rem', fontWeight: 400, color: 'var(--text-secondary)' }}>
                / {plan.target_minutes} phút
              </span>
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
              NHIỆM VỤ HOÀN TẤT
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#34d399' }}>
              {completedTasksCount}{' '}
              <span style={{ fontSize: '1rem', fontWeight: 400, color: 'var(--text-secondary)' }}>
                / {tasks.length} nhiệm vụ
              </span>
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
              NGUỒN KẾ HOẠCH
            </div>
            <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              {plan.generation_reason?.activePathTitle || 'Lộ trình nền tảng khởi đầu'}
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
            <span>Tiến độ hoàn thành kế hoạch</span>
            <span>{progressPercent}%</span>
          </div>
          <div style={{ width: '100%', height: '8px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '4px', overflow: 'hidden' }}>
            <div
              style={{
                width: `${progressPercent}%`,
                height: '100%',
                background: 'linear-gradient(90deg, var(--accent-cyan), #10b981)',
                transition: 'width 0.3s ease',
              }}
            />
          </div>
        </div>
      </Card>

      {/* Task List Section */}
      <div style={{ marginTop: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, margin: 0 }}>
            Danh sách nhiệm vụ hôm nay ({tasks.length})
          </h2>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Bạn có thể dùng nút mũi tên để tùy chỉnh thứ tự bài học
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {tasks.map((task, index) => {
            const isCompleted = task.status === 'completed';
            const isSkipped = task.status === 'skipped';
            const isPendingTask = task.status === 'pending';
            const isRunnable = task.content_status === 'available';

            return (
              <div
                key={task.id}
                style={{
                  background: isCompleted
                    ? 'rgba(16, 185, 129, 0.05)'
                    : isSkipped
                    ? 'rgba(255, 255, 255, 0.02)'
                    : 'var(--card-bg)',
                  border: isCompleted
                    ? '1px solid rgba(16, 185, 129, 0.25)'
                    : isSkipped
                    ? '1px solid rgba(255, 255, 255, 0.08)'
                    : '1px solid var(--border-color)',
                  borderRadius: '12px',
                  padding: '1.25rem 1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                  transition: 'all 0.2s ease',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        background: isCompleted
                          ? '#10b981'
                          : isSkipped
                          ? 'rgba(255, 255, 255, 0.1)'
                          : 'rgba(56, 189, 248, 0.15)',
                        color: isCompleted ? '#ffffff' : isSkipped ? 'var(--text-muted)' : 'var(--accent-cyan)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.85rem',
                        fontWeight: 700,
                      }}
                    >
                      {isCompleted ? '✓' : isSkipped ? '✕' : task.position}
                    </span>

                    <div>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 600, margin: '0 0 0.25rem', color: isSkipped ? 'var(--text-muted)' : 'var(--text-primary)' }}>
                        {task.title}
                      </h3>
                      {task.description && (
                        <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                          {task.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Badges */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {renderSkillBadge(task.skill)}
                    <Badge variant="default">⏱️ {task.estimated_minutes} phút</Badge>

                    {isRunnable ? (
                      <Badge variant="success">✅ Có bài tập tương tác</Badge>
                    ) : (
                      <Badge variant="warning">📋 Giáo trình dự kiến</Badge>
                    )}

                    {isCompleted && (
                      <Badge variant="success">
                        Đã xong {task.accuracy !== null && task.accuracy !== undefined ? `(${Math.round(task.accuracy * 100)}%)` : ''}
                      </Badge>
                    )}

                    {isSkipped && <Badge variant="default">Đã bỏ qua</Badge>}
                  </div>
                </div>

                {/* Actions bottom bar */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '0.75rem', marginTop: '0.25rem' }}>
                  {/* Reordering controls for pending tasks */}
                  <div style={{ display: 'flex', gap: '0.35rem' }}>
                    {isPendingTask && (
                      <>
                        <button
                          onClick={() => handleMoveTask(index, 'up')}
                          disabled={index === 0 || isPending}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem', opacity: index === 0 ? 0.4 : 1 }}
                          title="Di chuyển lên trên"
                        >
                          ▲ Lên
                        </button>
                        <button
                          onClick={() => handleMoveTask(index, 'down')}
                          disabled={index === tasks.length - 1 || isPending}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem', opacity: index === tasks.length - 1 ? 0.4 : 1 }}
                          title="Di chuyển xuống dưới"
                        >
                          ▼ Xuống
                        </button>
                      </>
                    )}
                  </div>

                  {/* Primary Action Button */}
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {isPendingTask && (
                      <button
                        onClick={() => handleSkipTask(task.id, task.title)}
                        disabled={isPending}
                        className="btn btn-secondary btn-sm"
                        style={{ fontSize: '0.85rem' }}
                      >
                        Bỏ qua
                      </button>
                    )}

                    {isRunnable && isPendingTask && (
                      <Link
                        href={`/daily-plan/practice/${task.id}`}
                        className="btn btn-primary btn-sm"
                        style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                      >
                        <span>✍️ Bắt đầu học &amp; Luyện tập</span>
                      </Link>
                    )}

                    {isRunnable && isCompleted && (
                      <Link
                        href={`/daily-plan/practice/${task.id}`}
                        className="btn btn-secondary btn-sm"
                        style={{ fontSize: '0.85rem' }}
                      >
                        🔄 Làm lại bài tập
                      </Link>
                    )}

                    {!isRunnable && (
                      <button
                        onClick={() => setSelectedPlannedTask(task)}
                        className="btn btn-secondary btn-sm"
                        style={{ fontSize: '0.85rem' }}
                      >
                        ℹ️ Chi tiết giáo trình dự kiến
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Planned Curriculum Modal */}
      {selectedPlannedTask && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1.5rem',
            backdropFilter: 'blur(4px)',
          }}
        >
          <div
            className="card"
            style={{
              maxWidth: '540px',
              width: '100%',
              background: '#0f172a',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              borderRadius: '16px',
              padding: '2rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <span style={{ fontSize: '1.5rem' }}>📋</span>
              <h3 style={{ fontSize: '1.25rem', margin: 0, color: 'var(--text-primary)' }}>
                Nội dung giáo trình dự kiến (Planned Curriculum)
              </h3>
            </div>

            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1rem' }}>
              Chủ đề <strong>{selectedPlannedTask.title}</strong> thuộc khung lộ trình của bạn, nhưng bài tập tương tác chuyên sâu đang được chuẩn bị để phát hành đầy đủ trong Phase 5.
            </p>

            <div
              style={{
                padding: '1rem',
                borderRadius: '8px',
                background: 'rgba(245, 158, 11, 0.1)',
                border: '1px solid rgba(245, 158, 11, 0.25)',
                fontSize: '0.9rem',
                color: '#fbbf24',
                marginBottom: '1.5rem',
              }}
            >
              💡 <strong>Cam kết chất lượng:</strong> Nền tảng không tạo bài học giả hay điểm số ảo. Bạn hãy ưu tiên hoàn thành các chủ đề có nhãn <strong>&quot;✅ Có bài tập tương tác&quot;</strong> để được chấm điểm và cập nhật tiến độ thực tế!
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button
                onClick={() => setSelectedPlannedTask(null)}
                className="btn btn-primary"
              >
                Đã hiểu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
