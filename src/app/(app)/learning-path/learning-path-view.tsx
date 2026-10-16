'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import type {
  LearningPath,
  LearningPathItem,
  LearningPathVersion,
  LearnerProfileSummary,
} from '@/modules/learning-path/types';
import {
  acceptPathAction,
  rejectPathAction,
  pausePathAction,
  resumePathAction,
  customizePathAction,
  generateProposedPathAction,
} from '@/modules/learning-path/actions';

interface LearningPathViewProps {
  initialPath: LearningPath | null;
  initialItems: LearningPathItem[];
  initialVersions: LearningPathVersion[];
  profile: LearnerProfileSummary | null;
}

export function LearningPathView({
  initialPath,
  initialItems,
  initialVersions,
  profile,
}: LearningPathViewProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'timeline' | 'history' | 'profile'>('timeline');
  const [expandedMilestones, setExpandedMilestones] = useState<Record<string, boolean>>({
    '1': true,
    '2': true,
    '3': true,
  });

  // Customization state
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [customReason, setCustomReason] = useState('Ưu tiên luyện kỹ năng theo nguyện vọng');
  const [selectedTopicInfo, setSelectedTopicInfo] = useState<LearningPathItem | null>(null);

  const allModules = initialItems
    .filter((it) => it.item_type === 'module')
    .sort((a, b) => a.position - b.position);

  const [selectedModuleId, setSelectedModuleId] = useState<string>(() => {
    const firstMod = initialItems.find((it) => it.item_type === 'module');
    return firstMod ? firstMod.id : '';
  });

  const [reorderedTopicIds, setReorderedTopicIds] = useState<string[]>([]);

  // Filter items by type
  const milestones = initialItems
    .filter((it) => it.item_type === 'milestone')
    .sort((a, b) => a.position - b.position);

  const getModulesForMilestone = (milestoneId: string) => {
    return initialItems
      .filter((it) => it.item_type === 'module' && it.parent_id === milestoneId)
      .sort((a, b) => a.position - b.position);
  };

  const getTopicsForModule = (moduleId: string) => {
    return initialItems
      .filter((it) => it.item_type === 'topic' && it.parent_id === moduleId)
      .sort((a, b) => a.position - b.position);
  };

  // Active module topics
  const effectiveModuleId = selectedModuleId || allModules[0]?.id || '';
  const currentModuleTopics = initialItems
    .filter((it) => it.item_type === 'topic' && it.parent_id === effectiveModuleId)
    .sort((a, b) => a.position - b.position);

  const displayedTopicIds =
    reorderedTopicIds.length > 0 &&
    reorderedTopicIds.every((id) => currentModuleTopics.some((t) => t.id === id)) &&
    reorderedTopicIds.length === currentModuleTopics.length
      ? reorderedTopicIds
      : currentModuleTopics.map((t) => t.id);

  const moveTopic = (index: number, direction: 'up' | 'down') => {
    const newArr = [...displayedTopicIds];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newArr.length) return;
    const temp = newArr[index];
    newArr[index] = newArr[targetIndex];
    newArr[targetIndex] = temp;
    setReorderedTopicIds(newArr);
  };

  const toggleMilestone = (milestoneId: string) => {
    setExpandedMilestones((prev) => ({
      ...prev,
      [milestoneId]: !prev[milestoneId],
    }));
  };

  // State Transition Handlers
  const handleGeneratePath = () => {
    setFeedback(null);
    startTransition(async () => {
      const res = await generateProposedPathAction();
      if (res.success) {
        setFeedback({ type: 'success', message: 'Lộ trình học đã được khởi tạo thành công!' });
        router.refresh();
      } else {
        setFeedback({ type: 'error', message: res.error || 'Lỗi khi khởi tạo lộ trình.' });
      }
    });
  };

  const handleAccept = () => {
    if (!initialPath) return;
    setFeedback(null);
    startTransition(async () => {
      const res = await acceptPathAction(initialPath.id);
      if (res.success) {
        setFeedback({ type: 'success', message: 'Bạn đã kích hoạt thành công Lộ trình học!' });
        router.refresh();
      } else {
        setFeedback({ type: 'error', message: res.error || 'Lỗi khi chấp nhận lộ trình.' });
      }
    });
  };

  const handleReject = () => {
    if (!initialPath) return;
    if (!confirm('Bạn có chắc muốn từ chối lộ trình đề xuất này không? Lộ trình sẽ được lưu vào lịch sử nhưng không thể kích hoạt lại.')) {
      return;
    }
    setFeedback(null);
    startTransition(async () => {
      const res = await rejectPathAction(initialPath.id);
      if (res.success) {
        setFeedback({ type: 'info', message: 'Đã từ chối lộ trình đề xuất.' });
        router.refresh();
      } else {
        setFeedback({ type: 'error', message: res.error || 'Lỗi khi từ chối lộ trình.' });
      }
    });
  };

  const handlePause = () => {
    if (!initialPath) return;
    setFeedback(null);
    startTransition(async () => {
      const res = await pausePathAction(initialPath.id);
      if (res.success) {
        setFeedback({ type: 'info', message: 'Đã tạm dừng lộ trình học.' });
        router.refresh();
      } else {
        setFeedback({ type: 'error', message: res.error || 'Lỗi khi tạm dừng lộ trình.' });
      }
    });
  };

  const handleResume = () => {
    if (!initialPath) return;
    setFeedback(null);
    startTransition(async () => {
      const res = await resumePathAction(initialPath.id);
      if (res.success) {
        setFeedback({ type: 'success', message: 'Đã tiếp tục lộ trình học thành công!' });
        router.refresh();
      } else {
        setFeedback({ type: 'error', message: res.error || 'Lỗi khi tiếp tục lộ trình.' });
      }
    });
  };

  const handleSaveCustomization = () => {
    if (!initialPath) return;
    if (displayedTopicIds.length === 0) {
      setFeedback({ type: 'error', message: 'Mô-đun được chọn không có chủ đề nào để tùy chỉnh.' });
      return;
    }
    setFeedback(null);

    startTransition(async () => {
      const res = await customizePathAction(
        initialPath.id,
        initialPath.current_version,
        customReason,
        displayedTopicIds
      );
      if (res.success) {
        setFeedback({
          type: 'success',
          message: `Đã lưu tùy chỉnh thành công! Lộ trình đã được cập nhật lên phiên bản v${res.newVersion}.`,
        });
        setIsCustomizing(false);
        setReorderedTopicIds([]);
        router.refresh();
      } else {
        setFeedback({ type: 'error', message: res.error || 'Lỗi khi lưu tùy chỉnh.' });
      }
    });
  };

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="success">● Đang hoạt động (Active)</Badge>;
      case 'proposed':
        return <Badge variant="info">● Đề xuất chờ duyệt (Proposed)</Badge>;
      case 'paused':
        return <Badge variant="warning">● Đang tạm dừng (Paused)</Badge>;
      case 'completed':
        return <Badge variant="success">● Đã hoàn thành (Completed)</Badge>;
      case 'rejected':
        return <Badge variant="default">● Đã từ chối (Rejected)</Badge>;
      case 'archived':
        return <Badge variant="default">● Đã lưu trữ (Archived)</Badge>;
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  };

  // If no learning path exists yet, show creation prompt
  if (!initialPath) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '3.5rem 2rem' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🗺️</div>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.75rem' }}>
          Chưa có Lộ trình học nào được tạo
        </h2>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto 2rem' }}>
          {profile?.hasCompletedAssessment
            ? 'Bạn đã hoàn thành bài kiểm tra đầu vào. Hệ thống sẽ phân tích điểm mạnh/yếu và sinh lộ trình 3 Milestones cá nhân hóa phù hợp với mục tiêu của bạn.'
            : 'Bạn chưa hoàn thành Placement Test. Bạn có thể làm bài kiểm tra để có lộ trình chính xác nhất, hoặc tạo ngay Lộ trình học tiêu chuẩn (Starter Path) theo mục tiêu hiện tại.'}
        </p>

        {feedback && (
          <div
            style={{
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              marginBottom: '1.5rem',
              maxWidth: '500px',
              margin: '0 auto 1.5rem',
              backgroundColor: feedback.type === 'error' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
              color: feedback.type === 'error' ? '#ef4444' : '#10b981',
              border: `1px solid ${feedback.type === 'error' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`,
            }}
          >
            {feedback.message}
          </div>
        )}

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={handleGeneratePath}
            disabled={isPending}
            className="btn btn-primary"
            style={{ padding: '0.75rem 1.5rem', fontSize: '1rem' }}
          >
            {isPending ? 'Đang tạo lộ trình...' : '✨ Tạo Lộ trình học cá nhân hóa'}
          </button>
          {!profile?.hasCompletedAssessment && (
            <Link href="/assessment" className="btn btn-secondary" style={{ padding: '0.75rem 1.5rem', fontSize: '1rem' }}>
              🎯 Làm bài kiểm tra đầu vào trước
            </Link>
          )}
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Feedback Banner */}
      {feedback && (
        <div
          style={{
            padding: '1rem 1.25rem',
            borderRadius: '10px',
            marginBottom: '1.5rem',
            backgroundColor:
              feedback.type === 'error'
                ? 'rgba(239, 68, 68, 0.15)'
                : feedback.type === 'success'
                ? 'rgba(16, 185, 129, 0.15)'
                : 'rgba(56, 189, 248, 0.15)',
            color:
              feedback.type === 'error'
                ? '#f87171'
                : feedback.type === 'success'
                ? '#34d399'
                : '#38bdf8',
            border: `1px solid ${
              feedback.type === 'error'
                ? 'rgba(239, 68, 68, 0.3)'
                : feedback.type === 'success'
                ? 'rgba(16, 185, 129, 0.3)'
                : 'rgba(56, 189, 248, 0.3)'
            }`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span>{feedback.message}</span>
          <button
            onClick={() => setFeedback(null)}
            style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', fontSize: '1.2rem' }}
          >
            ×
          </button>
        </div>
      )}

      {/* Main Path Header Card */}
      <div
        className="card"
        style={{
          marginBottom: '2rem',
          border: '1px solid rgba(56, 189, 248, 0.25)',
          background: 'linear-gradient(135deg, rgba(26, 34, 52, 0.9) 0%, rgba(15, 23, 42, 0.95) 100%)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <h1 style={{ fontSize: '1.85rem', fontWeight: 800, margin: 0 }}>
                {initialPath.title}
              </h1>
              {renderStatusBadge(initialPath.status)}
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', maxWidth: '800px', margin: 0 }}>
              {initialPath.description}
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span
              style={{
                fontSize: '0.8rem',
                padding: '0.35rem 0.65rem',
                borderRadius: '6px',
                background: 'rgba(99, 102, 241, 0.15)',
                color: 'var(--accent-indigo)',
                border: '1px solid rgba(99, 102, 241, 0.3)',
                fontWeight: 600,
              }}
            >
              Phiên bản v{initialPath.current_version} {initialPath.is_user_modified ? '(Đã tùy chỉnh)' : ''}
            </span>
          </div>
        </div>

        {/* Workload & CEFR Metrics */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '1rem',
            padding: '1.25rem',
            backgroundColor: 'rgba(0, 0, 0, 0.25)',
            borderRadius: '10px',
            border: '1px solid var(--border-color)',
            marginBottom: '1.5rem',
          }}
        >
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>MỤC TIÊU CEFR</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>
              {initialPath.target_level.toUpperCase()}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>THỜI LƯỢNG ƯỚC TÍNH</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              ~{initialPath.estimated_weeks} tuần
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>TỔNG KHỐI LƯỢNG HỌC</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {Math.round(initialPath.total_estimated_minutes / 60)} giờ ({initialPath.total_estimated_minutes} phút)
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>LỊCH HỌC HÀNG TUẦN</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--accent-emerald)' }}>
              {profile?.dailyMinutes || 30} phút / {profile?.studyDays?.length || 5} ngày
            </div>
          </div>
        </div>

        {/* User Sovereignty Action Bar */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            paddingTop: '1.25rem',
          }}
        >
          {initialPath.status === 'proposed' && (
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <button
                onClick={handleAccept}
                disabled={isPending}
                className="btn btn-primary"
                style={{ padding: '0.65rem 1.25rem' }}
              >
                {isPending ? 'Đang xử lý...' : '✅ Chấp nhận & Bắt đầu học (Accept)'}
              </button>
              <button
                onClick={handleReject}
                disabled={isPending}
                className="btn btn-secondary"
                style={{ padding: '0.65rem 1.25rem', color: '#f87171' }}
              >
                ❌ Từ chối (Reject)
              </button>
              <button
                onClick={() => setIsCustomizing(!isCustomizing)}
                className="btn btn-secondary"
                style={{ padding: '0.65rem 1.25rem' }}
              >
                ✏️ {isCustomizing ? 'Đóng chế độ tùy chỉnh' : 'Tùy chỉnh thứ tự'}
              </button>
            </div>
          )}

          {initialPath.status === 'active' && (
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <button
                onClick={handlePause}
                disabled={isPending}
                className="btn btn-secondary"
                style={{ padding: '0.65rem 1.25rem' }}
              >
                ⏸️ Tạm dừng học (Pause)
              </button>
              <button
                onClick={() => setIsCustomizing(!isCustomizing)}
                className="btn btn-secondary"
                style={{ padding: '0.65rem 1.25rem' }}
              >
                ✏️ {isCustomizing ? 'Đóng chế độ tùy chỉnh' : 'Tùy chỉnh thứ tự'}
              </button>
            </div>
          )}

          {initialPath.status === 'paused' && (
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <button
                onClick={handleResume}
                disabled={isPending}
                className="btn btn-primary"
                style={{ padding: '0.65rem 1.25rem' }}
              >
                ▶️ Tiếp tục lộ trình (Resume)
              </button>
            </div>
          )}

          {(initialPath.status === 'rejected' || initialPath.status === 'completed' || initialPath.status === 'archived') && (
            <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              ℹ️ Lộ trình này đang ở trạng thái kết thúc ({initialPath.status}). Bạn có thể tạo lộ trình mới từ Dashboard.
            </div>
          )}

          {/* AI Anti-Overwrite Notice */}
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            🔒 <em>Quyền kiểm soát thuộc về bạn: AI không thể tự ý ghi đè hoặc thay đổi lộ trình của bạn.</em>
          </div>
        </div>
      </div>

      {/* Customization Form Banner */}
      {isCustomizing && (
        <div
          className="card"
          style={{
            marginBottom: '2rem',
            border: '1px solid var(--accent-indigo)',
            background: 'rgba(99, 102, 241, 0.08)',
          }}
        >
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--accent-indigo)' }}>
            🛠️ Chế độ tùy chỉnh cấu trúc lộ trình
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
            Mỗi lần lưu chỉnh sửa sẽ tạo ra một phiên bản bất biến mới (version snapshot) và tăng số version hiện hành.
            Hệ thống áp dụng kiểm soát đồng thời lạc quan (optimistic locking) để bảo vệ dữ liệu khi làm việc trên nhiều tab.
          </p>

          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
              1. Chọn Mô-đun để tùy chỉnh thứ tự các Chủ đề (Topics):
            </label>
            <select
              value={effectiveModuleId}
              onChange={(e) => {
                setSelectedModuleId(e.target.value);
                setReorderedTopicIds([]);
              }}
              className="form-input"
              style={{
                width: '100%',
                padding: '0.65rem',
                borderRadius: '6px',
                background: 'rgba(0, 0, 0, 0.4)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-primary)',
              }}
            >
              {allModules.map((mod) => {
                const parentMilestone = initialItems.find((it) => it.id === mod.parent_id);
                return (
                  <option key={mod.id} value={mod.id} style={{ background: '#1e293b', color: '#fff' }}>
                    [{parentMilestone?.title || 'Milestone'}] {mod.title}
                  </option>
                );
              })}
            </select>
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
              2. Sắp xếp thứ tự các chủ đề trong mô-đun này:
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {displayedTopicIds.map((topicId, idx) => {
                const topic = initialItems.find((it) => it.id === topicId);
                if (!topic) return null;
                return (
                  <div
                    key={topicId}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.6rem 0.85rem',
                      borderRadius: '6px',
                      backgroundColor: 'rgba(0, 0, 0, 0.25)',
                      border: '1px solid var(--border-color)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span style={{ fontWeight: 700, color: 'var(--accent-cyan)', fontSize: '0.85rem' }}>
                        #{idx + 1}
                      </span>
                      <div>
                        <div style={{ fontSize: '0.88rem', fontWeight: 600 }}>{topic.title}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {topic.skill?.toUpperCase()} • {topic.estimated_minutes} phút
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.35rem' }}>
                      <button
                        type="button"
                        onClick={() => moveTopic(idx, 'up')}
                        disabled={idx === 0 || isPending}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                        title="Di chuyển lên"
                      >
                        ↑ Lên
                      </button>
                      <button
                        type="button"
                        onClick={() => moveTopic(idx, 'down')}
                        disabled={idx === displayedTopicIds.length - 1 || isPending}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                        title="Di chuyển xuống"
                      >
                        ↓ Xuống
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
              3. Lý do thay đổi (Change Reason):
            </label>
            <input
              type="text"
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
              className="form-input"
              style={{
                width: '100%',
                padding: '0.65rem',
                borderRadius: '6px',
                background: 'rgba(0, 0, 0, 0.3)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-primary)',
              }}
              placeholder="VD: Muốn đẩy kỹ năng Từ vựng lên học trước..."
            />
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              onClick={handleSaveCustomization}
              disabled={isPending || displayedTopicIds.length === 0}
              className="btn btn-primary btn-sm"
            >
              {isPending ? 'Đang lưu snapshot...' : '💾 Lưu phiên bản mới (Save New Version)'}
            </button>
            <button
              onClick={() => setIsCustomizing(false)}
              className="btn btn-secondary btn-sm"
            >
              Hủy bỏ
            </button>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
        <button
          onClick={() => setActiveTab('timeline')}
          style={{
            padding: '0.5rem 1rem',
            borderRadius: '6px',
            border: 'none',
            background: activeTab === 'timeline' ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
            color: activeTab === 'timeline' ? 'var(--accent-cyan)' : 'var(--text-secondary)',
            fontWeight: activeTab === 'timeline' ? 600 : 400,
            cursor: 'pointer',
          }}
        >
          🗺️ Tiến trình 3 Milestones ({milestones.length})
        </button>
        <button
          onClick={() => setActiveTab('profile')}
          style={{
            padding: '0.5rem 1rem',
            borderRadius: '6px',
            border: 'none',
            background: activeTab === 'profile' ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
            color: activeTab === 'profile' ? 'var(--accent-cyan)' : 'var(--text-secondary)',
            fontWeight: activeTab === 'profile' ? 600 : 400,
            cursor: 'pointer',
          }}
        >
          📊 Phân tích hồ sơ &amp; Điểm yếu
        </button>
        <button
          onClick={() => setActiveTab('history')}
          style={{
            padding: '0.5rem 1rem',
            borderRadius: '6px',
            border: 'none',
            background: activeTab === 'history' ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
            color: activeTab === 'history' ? 'var(--accent-cyan)' : 'var(--text-secondary)',
            fontWeight: activeTab === 'history' ? 600 : 400,
            cursor: 'pointer',
          }}
        >
          📜 Lịch sử phiên bản ({initialVersions.length})
        </button>
      </div>

      {/* TAB 1: 3 MILESTONES TIMELINE */}
      {activeTab === 'timeline' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {milestones.map((m, index) => {
            const isExpanded = expandedMilestones[m.id] ?? true;
            const modules = getModulesForMilestone(m.id);

            return (
              <div
                key={m.id}
                className="card"
                style={{
                  border: '1px solid var(--border-color)',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {/* Milestone Header */}
                <div
                  onClick={() => toggleMilestone(m.id)}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer',
                    userSelect: 'none',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        backgroundColor: index === 0 ? 'rgba(56, 189, 248, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                        color: index === 0 ? 'var(--accent-cyan)' : 'var(--text-muted)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                      }}
                    >
                      {index + 1}
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>
                        {m.title}
                      </h3>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: 0 }}>
                        {m.description}
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Badge variant={m.status === 'available' ? 'success' : 'default'}>
                      {m.status === 'available' ? 'Sẵn sàng' : 'Khóa'}
                    </Badge>
                    <span style={{ fontSize: '1.1rem', color: 'var(--text-muted)' }}>
                      {isExpanded ? '▲' : '▼'}
                    </span>
                  </div>
                </div>

                {/* Modules & Topics */}
                {isExpanded && (
                  <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    {modules.map((mod) => {
                      const topics = getTopicsForModule(mod.id);

                      return (
                        <div
                          key={mod.id}
                          style={{
                            padding: '1rem',
                            backgroundColor: 'rgba(0, 0, 0, 0.2)',
                            borderRadius: '8px',
                            border: '1px solid rgba(255, 255, 255, 0.05)',
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                            <div>
                              <strong style={{ fontSize: '1rem', color: 'var(--text-primary)' }}>
                                {mod.title}
                              </strong>
                              {mod.description && (
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
                                  {mod.description}
                                </p>
                              )}
                            </div>
                            {mod.skill && (
                              <Badge variant="info">
                                {mod.skill.toUpperCase()}
                              </Badge>
                            )}
                          </div>

                          {/* Topics List */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {topics.map((t) => (
                              <div
                                key={t.id}
                                onClick={() => setSelectedTopicInfo(t)}
                                style={{
                                  padding: '0.75rem 1rem',
                                  borderRadius: '6px',
                                  backgroundColor: 'rgba(255, 255, 255, 0.03)',
                                  border: '1px solid var(--border-color)',
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'center',
                                  cursor: 'pointer',
                                  transition: 'background-color 0.2s',
                                }}
                                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(56, 189, 248, 0.08)')}
                                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.03)')}
                              >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                  <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                    #{t.position}
                                  </span>
                                  <div>
                                    <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>
                                      {t.title}
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                      {t.description}
                                    </div>
                                  </div>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                    ⏱️ {t.estimated_minutes}p
                                  </span>
                                  {/* Transparency Badge */}
                                  <span
                                    style={{
                                      fontSize: '0.75rem',
                                      padding: '0.2rem 0.5rem',
                                      borderRadius: '4px',
                                      backgroundColor: 'rgba(245, 158, 11, 0.1)',
                                      color: 'var(--accent-amber)',
                                      border: '1px solid rgba(245, 158, 11, 0.25)',
                                    }}
                                  >
                                    Planned Curriculum
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 2: PROFILE & WEAKNESS ANALYSIS */}
      {activeTab === 'profile' && (
        <div className="card">
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            Phân tích năng lực người học (Learner Profile)
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
            Dữ liệu kỹ năng được tổng hợp từ bài kiểm tra đầu vào và thiết lập mục tiêu trong Onboarding.
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '1rem',
              marginBottom: '2rem',
            }}
          >
            {profile?.skillProfiles &&
              Object.entries(profile.skillProfiles).map(([skill, data]) => {
                const priorityScore = (1 - data.abilityScore) * 1.5; // illustrative heuristic
                return (
                  <div
                    key={skill}
                    style={{
                      padding: '1rem',
                      borderRadius: '8px',
                      backgroundColor: 'rgba(0, 0, 0, 0.25)',
                      border: '1px solid var(--border-color)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <strong style={{ textTransform: 'capitalize' }}>{skill}</strong>
                      <Badge variant={data.abilityScore >= 0.75 ? 'success' : data.abilityScore >= 0.5 ? 'info' : 'warning'}>
                        {data.level.toUpperCase()}
                      </Badge>
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                      Điểm năng lực: {Math.round(data.abilityScore * 100)}%
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      Độ tin cậy: {Math.round(data.confidence * 100)}% ({data.evidenceCount} bài làm)
                    </div>
                    <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--accent-cyan)' }}>
                      Priority Score: {priorityScore.toFixed(2)}
                    </div>
                  </div>
                );
              })}
          </div>

          <div
            style={{
              padding: '1rem',
              borderRadius: '8px',
              backgroundColor: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid var(--border-color)',
              fontSize: '0.85rem',
              color: 'var(--text-secondary)',
            }}
          >
            <strong>Ghi nhận giới hạn đo lường:</strong> Placement Test hiện tại bao gồm 16 câu hỏi (4 câu mỗi kỹ năng). Hệ thống kết luận điểm mạnh/yếu ở cấp độ kỹ năng tổng quát, không suy diễn vi mô ở cấp độ từng chủ đề ngữ pháp chuyên sâu khi chưa có đủ bằng chứng thực tế.
          </div>
        </div>
      )}

      {/* TAB 3: VERSION HISTORY */}
      {activeTab === 'history' && (
        <div className="card">
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            Lịch sử phiên bản (Version History &amp; Snapshots)
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
            Mỗi phiên bản là một snapshot bất biến (immutable snapshot), ghi nhận đầy đủ người thực hiện, lý do và cấu trúc tại thời điểm lưu.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {initialVersions.map((v) => (
              <div
                key={v.id}
                style={{
                  padding: '1rem 1.25rem',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(0, 0, 0, 0.25)',
                  border: '1px solid var(--border-color)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <strong style={{ color: 'var(--accent-indigo)' }}>v{v.version_number}</strong>
                    <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                      {v.change_reason}
                    </span>
                    <Badge variant={v.created_by === 'user' ? 'success' : 'default'}>
                      Tạo bởi: {v.created_by}
                    </Badge>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Thời gian lưu: {new Date(v.created_at).toLocaleString('vi-VN')}
                  </div>
                </div>

                <Badge variant="default">Snapshot OK</Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Planned Curriculum Modal / Popup */}
      {selectedTopicInfo && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem',
          }}
          onClick={() => setSelectedTopicInfo(null)}
        >
          <div
            className="card"
            style={{
              maxWidth: '520px',
              width: '100%',
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border-glow)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '1.25rem' }}>📖</span>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0 }}>
                  {selectedTopicInfo.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedTopicInfo(null)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '1.25rem', cursor: 'pointer' }}
              >
                ×
              </button>
            </div>

            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
              {selectedTopicInfo.description}
            </p>

            <div
              style={{
                padding: '1rem',
                borderRadius: '8px',
                backgroundColor: 'rgba(245, 158, 11, 0.1)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                marginBottom: '1.5rem',
              }}
            >
              <div style={{ color: 'var(--accent-amber)', fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.25rem' }}>
                ⚠️ Nội dung đang được chuẩn bị cho Phase 4
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: 0 }}>
                Hệ thống chỉ thiết lập khung chương trình (Planned Curriculum). Bài học tương tác, tài liệu luyện tập và bài tập trắc nghiệm sẽ được triển khai trong Phase 4 (Content Delivery &amp; Daily Practice).
              </p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setSelectedTopicInfo(null)}
                className="btn btn-secondary btn-sm"
              >
                Đã hiểu &amp; Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
