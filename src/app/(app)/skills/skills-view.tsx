'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import type { SkillItemCatalog } from '@/modules/skills/types';
import { startSkillPracticeAction } from '@/modules/skills/actions';
import {
  Headphones,
  BookOpen,
  PenTool,
  Mic,
  Clock,
  Sparkles,
  ArrowRight,
  Filter,
} from 'lucide-react';

interface SkillsViewProps {
  catalog: SkillItemCatalog[];
}

type SkillFilter = 'all' | 'listening' | 'reading' | 'writing' | 'speaking';

export function SkillsView({ catalog }: SkillsViewProps) {
  const router = useRouter();
  const [selectedFilter, setSelectedFilter] = useState<SkillFilter>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'ready' | 'planned'>('all');
  const [isPending, startTransition] = useTransition();
  const [activeSlug, setActiveSlug] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const filteredItems = catalog.filter((item) => {
    const matchesSkill = selectedFilter === 'all' || item.skill === selectedFilter;
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    return matchesSkill && matchesStatus;
  });

  const readyCount = catalog.filter((c) => c.status === 'ready').length;
  const plannedCount = catalog.filter((c) => c.status === 'planned').length;

  const handleStartPractice = (slug: string) => {
    setActiveSlug(slug);
    setErrorMessage(null);

    startTransition(async () => {
      const res = await startSkillPracticeAction(slug);
      if (!res.success || !res.taskId) {
        setErrorMessage(res.error || 'Không thể bắt đầu bài học lúc này.');
        setActiveSlug(null);
      } else {
        router.push(`/daily-plan/practice/${res.taskId}`);
      }
    });
  };

  const getSkillIcon = (skill: string) => {
    switch (skill) {
      case 'listening':
        return <Headphones className="h-5 w-5 text-sky-400" />;
      case 'reading':
        return <BookOpen className="h-5 w-5 text-emerald-400" />;
      case 'writing':
        return <PenTool className="h-5 w-5 text-amber-400" />;
      case 'speaking':
        return <Mic className="h-5 w-5 text-purple-400" />;
      default:
        return <Sparkles className="h-5 w-5 text-sky-400" />;
    }
  };

  const getSkillLabel = (skill: string) => {
    switch (skill) {
      case 'listening':
        return 'Listening (Kỹ năng Nghe)';
      case 'reading':
        return 'Reading (Kỹ năng Đọc)';
      case 'writing':
        return 'Writing (Kỹ năng Viết)';
      case 'speaking':
        return 'Speaking (Kỹ năng Nói)';
      default:
        return skill.toUpperCase();
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-sky-500/20 bg-gradient-to-br from-slate-900/90 via-slate-900/95 to-slate-950 p-6 sm:p-8 shadow-xl">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-sky-500/30 bg-sky-500/10 px-3 py-1 text-xs font-semibold text-sky-300">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Four Skills Mastery • Tích hợp Adaptive Learning</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Luyện tập Toàn diện 4 Kỹ năng
          </h1>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            Học chuẩn hóa đủ bốn kỹ năng <strong>Listening, Reading, Writing, Speaking</strong>.
            Tất cả bài học đều được tích hợp trực tiếp vào Kế hoạch ngày, Chuỗi ngày học (Streak),
            Sổ từ vựng và AI Tutor hỗ trợ phân tích chuyên sâu.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3">
            <div className="rounded-xl border border-border/60 bg-secondary/30 p-3">
              <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Headphones className="h-3.5 w-3.5 text-sky-400" />
                Listening
              </div>
              <div className="text-sm font-bold text-foreground mt-0.5">Audio chuẩn bản xứ</div>
            </div>
            <div className="rounded-xl border border-border/60 bg-secondary/30 p-3">
              <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                <BookOpen className="h-3.5 w-3.5 text-emerald-400" />
                Reading
              </div>
              <div className="text-sm font-bold text-foreground mt-0.5">Văn bản công sở</div>
            </div>
            <div className="rounded-xl border border-border/60 bg-secondary/30 p-3">
              <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                <PenTool className="h-3.5 w-3.5 text-amber-400" />
                Writing
              </div>
              <div className="text-sm font-bold text-foreground mt-0.5">Chấm AI 4 Rubric</div>
            </div>
            <div className="rounded-xl border border-border/60 bg-secondary/30 p-3">
              <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Mic className="h-3.5 w-3.5 text-purple-400" />
                Speaking
              </div>
              <div className="text-sm font-bold text-foreground mt-0.5">Transcript-First</div>
            </div>
          </div>
        </div>
      </div>

      {errorMessage && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
          ⚠️ {errorMessage}
        </div>
      )}

      {/* Filters and Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border/70 pb-4">
        {/* Skill Category Tabs */}
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: 'all', label: 'Tất cả kỹ năng' },
            { id: 'listening', label: '🎧 Listening' },
            { id: 'reading', label: '📄 Reading' },
            { id: 'writing', label: '✍️ Writing' },
            { id: 'speaking', label: '🎙️ Speaking' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedFilter(tab.id as SkillFilter)}
              className={`rounded-lg px-3 py-1.5 text-xs sm:text-sm font-medium transition-all ${
                selectedFilter === tab.id
                  ? 'bg-sky-500 text-slate-950 font-bold shadow-md shadow-sky-500/20'
                  : 'bg-secondary/60 text-muted-foreground hover:bg-secondary hover:text-foreground'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Ready vs Planned Toggle */}
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <div className="inline-flex rounded-lg border border-border/80 bg-secondary/40 p-0.5 text-xs">
            <button
              onClick={() => setStatusFilter('all')}
              className={`rounded-md px-2.5 py-1 transition-all ${
                statusFilter === 'all'
                  ? 'bg-background text-foreground font-semibold shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Tất cả ({catalog.length})
            </button>
            <button
              onClick={() => setStatusFilter('ready')}
              className={`rounded-md px-2.5 py-1 transition-all ${
                statusFilter === 'ready'
                  ? 'bg-emerald-500/20 text-emerald-300 font-semibold shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Sẵn sàng ({readyCount})
            </button>
            <button
              onClick={() => setStatusFilter('planned')}
              className={`rounded-md px-2.5 py-1 transition-all ${
                statusFilter === 'planned'
                  ? 'bg-amber-500/20 text-amber-300 font-semibold shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Lộ trình ({plannedCount})
            </button>
          </div>
        </div>
      </div>

      {/* Skills Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredItems.map((item) => {
          const isReady = item.status === 'ready';
          const isLoading = isPending && activeSlug === item.slug;

          return (
            <div
              key={item.slug}
              className={`group relative flex flex-col justify-between rounded-xl border p-5 transition-all duration-200 ${
                isReady
                  ? 'border-border/80 bg-card hover:border-sky-500/40 hover:shadow-lg hover:shadow-sky-500/5'
                  : 'border-border/40 bg-card/40 opacity-75'
              }`}
            >
              <div>
                {/* Card Top Badges */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary/80">
                      {getSkillIcon(item.skill)}
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-muted-foreground block">
                        {getSkillLabel(item.skill)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Badge variant="default" className="text-[11px] font-medium">
                      Level {item.level}
                    </Badge>
                    {isReady ? (
                      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-400">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        Sẵn sàng học
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full border border-border/80 bg-secondary/60 px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                        Đang chuẩn bị
                      </span>
                    )}
                  </div>
                </div>

                {/* Title & Description */}
                <h3 className="text-base sm:text-lg font-bold text-foreground mb-2 group-hover:text-sky-400 transition-colors">
                  {item.title}
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 mb-4 leading-relaxed">
                  {item.description}
                </p>

                {/* Highlights */}
                {item.highlights && item.highlights.length > 0 && (
                  <div className="space-y-1.5 mb-5 rounded-lg border border-border/50 bg-secondary/20 p-3">
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Điểm nhấn bài học:
                    </div>
                    {item.highlights.map((hl, hIdx) => (
                      <div key={hIdx} className="text-xs text-foreground/85 flex items-center gap-2">
                        <span className="text-sky-400">✓</span>
                        <span>{hl}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Card Footer & Action */}
              <div className="pt-4 border-t border-border/60 flex items-center justify-between gap-3">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" />
                  <span>{item.estimatedMinutes} phút</span>
                </div>

                {isReady ? (
                  <button
                    type="button"
                    onClick={() => handleStartPractice(item.slug)}
                    disabled={isPending}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 px-3.5 py-1.5 text-xs sm:text-sm font-bold text-slate-950 transition-all shadow-sm shadow-sky-500/20 active:scale-95 disabled:opacity-50 cursor-pointer"
                  >
                    {isLoading ? (
                      <span>Đang mở bài học...</span>
                    ) : (
                      <>
                        <span>Luyện tập ngay</span>
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                ) : (
                  <span className="text-xs text-muted-foreground italic">
                    Chờ mở khóa trong lộ trình
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
