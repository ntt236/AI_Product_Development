'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { EmptyState } from '@/components/ui/state-feedback';
import {
  Compass,
  Sparkles,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Clock,
  Play,
  Pause,
  Sliders,
  BookOpen,
  Lock,
  ArrowUp,
  ArrowDown,
  Shield,
  History,
  BarChart3,
  X,
  AlertCircle,
  Info,
} from 'lucide-react';
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
  startTopicPracticeAction,
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
  const [isStartingPractice, startPracticeTransition] = useTransition();
  const [practiceError, setPracticeError] = useState<string | null>(null);

  const handleStartTopicPractice = (topicId: string) => {
    setPracticeError(null);
    startPracticeTransition(async () => {
      const res = await startTopicPracticeAction(topicId);
      if (!res.success || !res.taskId) {
        setPracticeError(res.error || 'Không thể chuẩn bị bài luyện tập cho chủ đề này.');
      } else {
        router.push(`/daily-plan/practice/${res.taskId}`);
      }
    });
  };

  const hasPlannedCurriculum = initialItems.some(
    (i: LearningPathItem) => i.item_type === 'topic' && i.content_status === 'planned_curriculum'
  );

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
        return <Badge variant="success">● Đang hoạt động</Badge>;
      case 'proposed':
        return <Badge variant="info">● Đề xuất chờ duyệt</Badge>;
      case 'paused':
        return <Badge variant="warning">● Đang tạm dừng</Badge>;
      case 'completed':
        return <Badge variant="success">● Đã hoàn thành</Badge>;
      case 'rejected':
        return <Badge variant="destructive">● Đã từ chối</Badge>;
      case 'archived':
        return <Badge variant="default">● Đã lưu trữ</Badge>;
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  };

  // If no learning path exists yet, show creation prompt
  if (!initialPath) {
    return (
      <EmptyState
        icon={Compass}
        title="Chưa có Lộ trình học nào được tạo"
        description={
          profile?.hasCompletedAssessment
            ? 'Bạn đã hoàn thành bài kiểm tra đầu vào. Hệ thống sẽ phân tích điểm mạnh/yếu và sinh lộ trình 3 Milestones cá nhân hóa phù hợp với mục tiêu của bạn.'
            : 'Bạn chưa hoàn thành Placement Test. Bạn có thể làm bài kiểm tra để có lộ trình chính xác nhất, hoặc tạo ngay Lộ trình học tiêu chuẩn (Starter Path) theo mục tiêu hiện tại.'
        }
        action={
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button
              onClick={handleGeneratePath}
              isLoading={isPending}
              size="lg"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Tạo Lộ trình học cá nhân hóa
            </Button>
            {!profile?.hasCompletedAssessment && (
              <Button asChild variant="secondary" size="lg">
                <Link href="/assessment">
                  Làm bài kiểm tra đầu vào trước
                </Link>
              </Button>
            )}
          </div>
        }
      />
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Feedback Banner */}
      {feedback && (
        <div
          className={`p-4 rounded-xl flex items-center justify-between gap-3 text-sm font-medium border animate-in fade-in duration-200 ${
            feedback.type === 'error'
              ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
              : feedback.type === 'success'
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
              : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {feedback.type === 'error' ? (
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
            ) : feedback.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            ) : (
              <Info className="w-5 h-5 text-cyan-400 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-muted-foreground hover:text-foreground text-xs p-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Path Header Card */}
      <Card className="relative overflow-hidden border-cyan-500/25 bg-gradient-to-br from-card via-card to-cyan-950/20">
        <CardContent className="p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                  {initialPath.title}
                </h1>
                {renderStatusBadge(initialPath.status)}
              </div>
              <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
                {initialPath.description}
              </p>
            </div>

            <div className="shrink-0">
              <Badge variant="info" className="px-3 py-1 font-mono text-xs">
                Phiên bản v{initialPath.current_version} {initialPath.is_user_modified ? '(Đã tùy chỉnh)' : ''}
              </Badge>
            </div>
          </div>

          {/* Workload & CEFR Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 rounded-xl bg-black/30 border">
            <div>
              <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                Mục tiêu CEFR
              </div>
              <div className="text-xl sm:text-2xl font-black text-cyan-400">
                {initialPath.target_level.toUpperCase()}
              </div>
            </div>
            <div>
              <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                Thời lượng ước tính
              </div>
              <div className="text-xl sm:text-2xl font-bold">
                ~{initialPath.estimated_weeks} tuần
              </div>
            </div>
            <div>
              <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                Tổng khối lượng
              </div>
              <div className="text-xl sm:text-2xl font-bold">
                {Math.round(initialPath.total_estimated_minutes / 60)} giờ
              </div>
            </div>
            <div>
              <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                Lịch học hàng tuần
              </div>
              <div className="text-xl sm:text-2xl font-bold text-emerald-400">
                {profile?.dailyMinutes || 30}p / {profile?.studyDays?.length || 5} ngày
              </div>
            </div>
          </div>

          {/* User Sovereignty Action Bar */}
          <div className="pt-4 border-t border-border/60 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            {initialPath.status === 'proposed' && (
              <div className="flex flex-wrap items-center gap-2.5">
                <Button
                  onClick={handleAccept}
                  isLoading={isPending}
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Chấp nhận &amp; Bắt đầu học
                </Button>
                <Button
                  variant="outline"
                  onClick={handleReject}
                  disabled={isPending}
                  className="text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
                >
                  <X className="w-4 h-4 mr-1.5" />
                  Từ chối
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => setIsCustomizing(!isCustomizing)}
                >
                  <Sliders className="w-4 h-4 mr-1.5" />
                  {isCustomizing ? 'Đóng tùy chỉnh' : 'Tùy chỉnh thứ tự'}
                </Button>
              </div>
            )}

            {initialPath.status === 'active' && (
              <div className="flex flex-wrap items-center gap-2.5">
                <Button
                  variant="secondary"
                  onClick={handlePause}
                  disabled={isPending}
                >
                  <Pause className="w-4 h-4 mr-2" />
                  Tạm dừng học (Pause)
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => setIsCustomizing(!isCustomizing)}
                >
                  <Sliders className="w-4 h-4 mr-1.5" />
                  {isCustomizing ? 'Đóng tùy chỉnh' : 'Tùy chỉnh thứ tự'}
                </Button>
              </div>
            )}

            {initialPath.status === 'paused' && (
              <div className="flex flex-wrap items-center gap-2.5">
                <Button
                  onClick={handleResume}
                  isLoading={isPending}
                >
                  <Play className="w-4 h-4 mr-2" />
                  Tiếp tục lộ trình (Resume)
                </Button>
              </div>
            )}

            {(initialPath.status === 'rejected' || initialPath.status === 'completed' || initialPath.status === 'archived') && (
              <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Info className="w-4 h-4" />
                <span>Lộ trình này đang ở trạng thái kết thúc ({initialPath.status}). Bạn có thể tạo lộ trình mới từ Dashboard.</span>
              </div>
            )}

            {/* AI Anti-Overwrite Notice */}
            <div className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-cyan-400" />
              <span>Quyền kiểm soát thuộc về bạn: AI không thể tự ý ghi đè lộ trình.</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Customization Form Banner */}
      {isCustomizing && (
        <Card className="border-indigo-500/40 bg-gradient-to-br from-indigo-950/20 via-card to-card">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-2 text-indigo-400">
              <Sliders className="w-5 h-5" />
              <h3 className="text-base font-bold tracking-tight">
                Chế độ tùy chỉnh cấu trúc lộ trình
              </h3>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Mỗi lần lưu chỉnh sửa sẽ tạo ra một phiên bản bất biến mới (version snapshot) và tăng số version hiện hành.
              Hệ thống áp dụng kiểm soát đồng thời lạc quan (optimistic locking) để bảo vệ dữ liệu khi làm việc trên nhiều tab.
            </p>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">
                1. Chọn Mô-đun để tùy chỉnh thứ tự các Chủ đề:
              </label>
              <select
                value={effectiveModuleId}
                onChange={(e) => {
                  setSelectedModuleId(e.target.value);
                  setReorderedTopicIds([]);
                }}
                className="w-full px-3 py-2 text-sm rounded-lg bg-background border text-foreground focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
              >
                {allModules.map((mod) => {
                  const parentMilestone = initialItems.find((it) => it.id === mod.parent_id);
                  return (
                    <option key={mod.id} value={mod.id} className="bg-card text-foreground">
                      [{parentMilestone?.title || 'Milestone'}] {mod.title}
                    </option>
                  );
                })}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground">
                2. Sắp xếp thứ tự các chủ đề trong mô-đun này:
              </label>
              <div className="space-y-2">
                {displayedTopicIds.map((topicId, idx) => {
                  const topic = initialItems.find((it) => it.id === topicId);
                  if (!topic) return null;
                  return (
                    <div
                      key={topicId}
                      className="flex items-center justify-between p-3 rounded-lg bg-black/25 border text-sm"
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-cyan-400 text-xs w-6">
                          #{idx + 1}
                        </span>
                        <div>
                          <div className="font-semibold text-sm">{topic.title}</div>
                          <div className="text-xs text-muted-foreground">
                            {topic.skill?.toUpperCase()} • {topic.estimated_minutes} phút
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => moveTopic(idx, 'up')}
                          disabled={idx === 0 || isPending}
                          className="h-8 px-2 text-xs"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => moveTopic(idx, 'down')}
                          disabled={idx === displayedTopicIds.length - 1 || isPending}
                          className="h-8 px-2 text-xs"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">
                3. Lý do thay đổi (Change Reason):
              </label>
              <Input
                type="text"
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                placeholder="VD: Muốn đẩy kỹ năng Từ vựng lên học trước..."
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <Button
                onClick={handleSaveCustomization}
                isLoading={isPending}
                disabled={displayedTopicIds.length === 0}
              >
                Lưu phiên bản mới (Save New Version)
              </Button>
              <Button
                variant="ghost"
                onClick={() => setIsCustomizing(false)}
              >
                Hủy bỏ
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-card/60 backdrop-blur border rounded-xl overflow-x-auto">
        <button
          onClick={() => setActiveTab('timeline')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${
            activeTab === 'timeline'
              ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-sm'
              : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
          }`}
        >
          <Compass className="w-4 h-4" />
          <span>Tiến trình 3 Milestones</span>
          <Badge variant="default" className="text-[10px] px-1.5 py-0 h-4">
            {milestones.length}
          </Badge>
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${
            activeTab === 'profile'
              ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-sm'
              : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Phân tích năng lực &amp; Điểm yếu</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${
            activeTab === 'history'
              ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-sm'
              : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Lịch sử phiên bản</span>
          <Badge variant="default" className="text-[10px] px-1.5 py-0 h-4">
            {initialVersions.length}
          </Badge>
        </button>
      </div>

      {/* TAB 1: 3 MILESTONES TIMELINE */}
      {activeTab === 'timeline' && (
        <div className="space-y-4">
          {/* Informative Advisory Banner if there are planned curriculum topics */}
          {hasPlannedCurriculum && (
            <div className="p-4 rounded-xl bg-cyan-500/5 border border-cyan-500/20 flex items-start gap-3">
              <span className="p-1 rounded-md bg-cyan-500/10 text-cyan-400 mt-0.5">
                <Info className="w-4 h-4" />
              </span>
              <div>
                <div className="text-sm font-semibold text-cyan-400 mb-0.5">
                  Nội dung đang được hoàn thiện
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Một số chủ đề trong lộ trình chưa có bài học tương tác. Bạn vẫn có thể học những nội dung đã sẵn sàng trong Kế hoạch ngày.
                </p>
              </div>
            </div>
          )}

          {milestones.map((m, index) => {
            const isExpanded = expandedMilestones[m.id] ?? true;
            const modules = getModulesForMilestone(m.id);

            return (
              <Card key={m.id} className="overflow-hidden">
                {/* Milestone Header */}
                <div
                  onClick={() => toggleMilestone(m.id)}
                  className="p-5 sm:p-6 flex items-center justify-between cursor-pointer hover:bg-muted/30 transition-colors select-none"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/25 text-cyan-400 flex items-center justify-center font-black text-sm shrink-0">
                      M{index + 1}
                    </div>
                    <div>
                      <h3 className="text-base sm:text-lg font-bold tracking-tight">
                        {m.title}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {m.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Badge variant={m.status === 'available' ? 'success' : 'default'}>
                      {m.status === 'available' ? 'Sẵn sàng' : 'Khóa'}
                    </Badge>
                    <span className="text-muted-foreground p-1">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </span>
                  </div>
                </div>

                {/* Modules & Topics */}
                {isExpanded && (
                  <CardContent className="px-5 pb-6 pt-0 space-y-4">
                    <div className="border-t border-border/50 pt-4 space-y-4">
                      {modules.map((mod) => {
                        const topics = getTopicsForModule(mod.id);

                        return (
                          <div
                            key={mod.id}
                            className="p-4 rounded-xl bg-black/20 border space-y-3"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <div>
                                <strong className="text-sm font-bold text-foreground">
                                  {mod.title}
                                </strong>
                                {mod.description && (
                                  <p className="text-xs text-muted-foreground mt-0.5">
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
                            <div className="space-y-2">
                              {topics.map((t) => (
                                <div
                                  key={t.id}
                                  onClick={() => setSelectedTopicInfo(t)}
                                  className="p-3 rounded-lg bg-card/60 border hover:border-cyan-500/40 hover:bg-cyan-500/5 transition-all flex items-center justify-between gap-3 cursor-pointer group"
                                >
                                  <div className="flex items-center gap-3">
                                    <span className="text-xs font-bold text-muted-foreground group-hover:text-cyan-400 transition-colors w-6">
                                      #{t.position}
                                    </span>
                                    <div>
                                      <div className="text-sm font-medium group-hover:text-cyan-300 transition-colors">
                                        {t.title}
                                      </div>
                                      <div className="text-xs text-muted-foreground line-clamp-1">
                                        {t.description}
                                      </div>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-3 shrink-0">
                                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                                      <Clock className="w-3.5 h-3.5" />
                                      {t.estimated_minutes}p
                                    </span>

                                    {t.status === 'completed' ? (
                                      <Badge variant="success">🎉 Đã xong</Badge>
                                    ) : t.content_status === 'available' ? (
                                      <Badge variant="info">✅ Khả dụng</Badge>
                                    ) : (
                                      <Badge variant="warning">📋 Đang chuẩn bị</Badge>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* TAB 2: PROFILE & WEAKNESS ANALYSIS */}
      {activeTab === 'profile' && (
        <Card>
          <CardContent className="p-6 sm:p-8 space-y-6">
            <div>
              <h3 className="text-lg font-bold tracking-tight">
                Phân tích năng lực người học (Learner Profile)
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                Dữ liệu kỹ năng được tổng hợp từ bài kiểm tra đầu vào và thiết lập mục tiêu trong Onboarding.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {profile?.skillProfiles &&
                Object.entries(profile.skillProfiles).map(([skill, data]) => {
                  const priorityScore = (1 - data.abilityScore) * 1.5;
                  return (
                    <div
                      key={skill}
                      className="p-4 rounded-xl bg-black/25 border space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <strong className="text-sm capitalize font-bold text-foreground">
                          {skill}
                        </strong>
                        <Badge
                          variant={
                            data.abilityScore >= 0.75
                              ? 'success'
                              : data.abilityScore >= 0.5
                              ? 'info'
                              : 'warning'
                          }
                        >
                          {data.level.toUpperCase()}
                        </Badge>
                      </div>

                      <div className="text-xs text-muted-foreground">
                        Điểm năng lực: <strong className="text-foreground">{Math.round(data.abilityScore * 100)}%</strong>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Độ tin cậy: <strong className="text-foreground">{Math.round(data.confidence * 100)}%</strong> ({data.evidenceCount} bài làm)
                      </div>
                      <div className="text-xs text-cyan-400 font-semibold pt-1">
                        Priority Score: {priorityScore.toFixed(2)}
                      </div>
                    </div>
                  );
                })}
            </div>

            <div className="p-4 rounded-xl bg-muted/40 border text-xs text-muted-foreground leading-relaxed">
              <strong className="text-foreground">Ghi nhận giới hạn đo lường:</strong> Placement Test hiện tại bao gồm 16 câu hỏi (4 câu mỗi kỹ năng). Hệ thống kết luận điểm mạnh/yếu ở cấp độ kỹ năng tổng quát, không suy diễn vi mô ở cấp độ từng chủ đề ngữ pháp chuyên sâu khi chưa có đủ bằng chứng thực tế.
            </div>
          </CardContent>
        </Card>
      )}

      {/* TAB 3: VERSION HISTORY */}
      {activeTab === 'history' && (
        <Card>
          <CardContent className="p-6 sm:p-8 space-y-6">
            <div>
              <h3 className="text-lg font-bold tracking-tight">
                Lịch sử phiên bản (Version History &amp; Snapshots)
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                Mỗi phiên bản là một snapshot bất biến (immutable snapshot), ghi nhận đầy đủ người thực hiện, lý do và cấu trúc tại thời điểm lưu.
              </p>
            </div>

            <div className="space-y-3">
              {initialVersions.map((v) => (
                <div
                  key={v.id}
                  className="p-4 rounded-xl bg-black/25 border flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <strong className="text-sm text-indigo-400 font-mono">
                        v{v.version_number}
                      </strong>
                      <span className="text-sm font-medium text-foreground">
                        {v.change_reason}
                      </span>
                      <Badge variant={v.created_by === 'user' ? 'success' : 'default'}>
                        Tạo bởi: {v.created_by}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Thời gian lưu: {new Date(v.created_at).toLocaleString('vi-VN')}
                    </div>
                  </div>

                  <Badge variant="default" className="self-start sm:self-auto">
                    Snapshot OK
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Planned Curriculum Modal / Popup */}
      {selectedTopicInfo && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200"
          onClick={() => setSelectedTopicInfo(null)}
        >
          <Card
            className="w-full max-w-lg shadow-2xl border-cyan-500/30"
            onClick={(e) => e.stopPropagation()}
          >
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400">
                    <BookOpen className="w-5 h-5" />
                  </span>
                  <h3 className="text-base font-bold tracking-tight">
                    {selectedTopicInfo.title}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedTopicInfo(null)}
                  className="text-muted-foreground hover:text-foreground p-1 rounded-md"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-sm text-muted-foreground leading-relaxed">
                {selectedTopicInfo.description}
              </p>

              {practiceError && (
                <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{practiceError}</span>
                </div>
              )}

              {selectedTopicInfo.content_status === 'available' ? (
                <>
                  <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 space-y-1">
                    <div className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Nội dung học tập &amp; Bài tập đã sẵn sàng</span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Chủ đề này đã có đầy đủ bài học và bài tập trắc nghiệm tương tác với hệ thống chấm điểm tự động.
                    </p>
                  </div>

                  {selectedTopicInfo.status === 'locked' && (
                    <div className="p-3 rounded-lg bg-muted/40 border text-xs text-muted-foreground flex items-center gap-2">
                      <Lock className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>Đang tạm khóa: Hãy hoàn thành các chủ đề trước trong lộ trình để mở khóa bài học này.</span>
                    </div>
                  )}

                  <div className="flex items-center justify-end gap-3 pt-2">
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setSelectedTopicInfo(null);
                        setPracticeError(null);
                      }}
                    >
                      Đóng
                    </Button>
                    {selectedTopicInfo.status !== 'locked' && (
                      <Button
                        onClick={() => handleStartTopicPractice(selectedTopicInfo.id)}
                        isLoading={isStartingPractice}
                      >
                        {selectedTopicInfo.status === 'completed'
                          ? 'Luyện tập lại bài học'
                          : 'Bắt đầu học & Luyện tập'}
                      </Button>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/25 space-y-1">
                    <div className="text-xs font-semibold text-amber-400 flex items-center gap-1.5">
                      <Info className="w-4 h-4" />
                      <span>Nội dung giáo trình đang được chuẩn bị</span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Chủ đề này nằm trong khung kế hoạch chuẩn đầu ra của lộ trình. Bài học tương tác và bài tập trắc nghiệm đang được đội ngũ sư phạm hoàn thiện và sẽ sớm khả dụng.
                    </p>
                  </div>

                  <div className="flex items-center justify-end pt-2">
                    <Button
                      variant="secondary"
                      onClick={() => {
                        setSelectedTopicInfo(null);
                        setPracticeError(null);
                      }}
                    >
                      Đã hiểu &amp; Đóng
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
