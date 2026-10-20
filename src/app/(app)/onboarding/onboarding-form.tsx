'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  GOAL_OPTIONS,
  DAILY_TIME_OPTIONS,
  STUDY_DAYS_OPTIONS,
} from '@/modules/onboarding/constants';
import { saveOnboardingAction, type OnboardingState } from '@/modules/onboarding/actions';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Clock,
  Calendar,
  AlertCircle,
  Check,
} from 'lucide-react';

interface OnboardingFormProps {
  initialState: OnboardingState | null;
}

export function OnboardingForm({ initialState }: OnboardingFormProps) {
  const router = useRouter();

  const [step, setStep] = useState<number>(1);
  const [primaryGoal, setPrimaryGoal] = useState<string>(
    initialState?.primaryGoal || 'foundation'
  );
  const [secondaryGoals, setSecondaryGoals] = useState<string[]>(
    initialState?.secondaryGoals || []
  );
  const [targetToeicScore, setTargetToeicScore] = useState<number | null>(
    initialState?.targetToeicScore || 650
  );
  const [dailyMinutes, setDailyMinutes] = useState<number>(
    initialState?.dailyMinutes || 30
  );
  const [studyDays, setStudyDays] = useState<number[]>(
    initialState?.studyDays || [1, 2, 3, 4, 5]
  );

  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const toggleSecondaryGoal = (goalId: string) => {
    if (goalId === primaryGoal) return;
    setSecondaryGoals((prev) =>
      prev.includes(goalId) ? prev.filter((id) => id !== goalId) : [...prev, goalId]
    );
  };

  const handleSelectPrimary = (goalId: string) => {
    setPrimaryGoal(goalId);
    setSecondaryGoals((prev) => prev.filter((id) => id !== goalId));
  };

  const handleSubmit = () => {
    setError(null);
    startTransition(async () => {
      const result = await saveOnboardingAction({
        primaryGoal,
        secondaryGoals,
        targetToeicScore: primaryGoal === 'toeic' ? targetToeicScore : null,
        dailyMinutes,
        studyDays,
      });

      if (!result.success) {
        setError(result.error || 'Lưu thông tin thất bại.');
      } else {
        router.push('/dashboard');
        router.refresh();
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/10 border border-cyan-500/25 text-cyan-400">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Cá nhân hóa trải nghiệm</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
          Thiết lập lộ trình học tập
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
          Hãy chia sẻ mục tiêu và quỹ thời gian để hệ thống kiến tạo kế hoạch học tập tối ưu nhất cho bạn.
        </p>
      </div>

      {initialState?.isCompleted && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center justify-between gap-3">
          <span>Bạn đang ở chế độ chỉnh sửa thiết lập Onboarding.</span>
          <Button asChild variant="secondary" size="sm" className="h-7 text-xs">
            <Link href="/dashboard">Về Dashboard</Link>
          </Button>
        </div>
      )}

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Step Indicators */}
      <div className="flex items-center justify-center gap-2 py-2">
        {[1, 2, 3].map((s) => (
          <React.Fragment key={s}>
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                step === s
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30 ring-2 ring-cyan-500/40 ring-offset-2 ring-offset-background'
                  : step > s
                  ? 'bg-emerald-500 text-slate-950 font-black'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {step > s ? <Check className="w-4 h-4" /> : s}
            </div>
            {s < 3 && (
              <div
                className={`w-12 h-1 rounded-full transition-all ${
                  step > s ? 'bg-emerald-500' : 'bg-muted'
                }`}
              />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Step 1: Primary Goal */}
      {step === 1 && (
        <Card className="shadow-2xl border-cyan-500/20">
          <CardContent className="p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b">
              <div>
                <h2 className="text-base sm:text-lg font-bold tracking-tight">
                  Bước 1: Chọn mục tiêu quan trọng nhất
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Hệ thống sẽ ưu tiên các bài học và kế hoạch mỗi ngày xoay quanh mục tiêu này.
                </p>
              </div>
              <Badge variant="warning">Bắt buộc</Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {GOAL_OPTIONS.map((g) => {
                const isSelected = primaryGoal === g.type;
                return (
                  <div
                    key={g.id}
                    onClick={() => handleSelectPrimary(g.type)}
                    className={`p-4 rounded-xl border cursor-pointer select-none transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'border-cyan-500 bg-cyan-500/10 shadow-md shadow-cyan-500/10'
                        : 'border-border/80 bg-card hover:border-cyan-500/40 hover:bg-white/[0.02]'
                    }`}
                  >
                    <div>
                      <div className="text-2xl mb-2">{g.icon}</div>
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <strong className="text-sm font-bold text-foreground">{g.title}</strong>
                        {isSelected && (
                          <Badge variant="success" className="text-[10px] px-1.5 py-0 h-4">
                            Chính
                          </Badge>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground leading-relaxed">{g.description}</div>
                    </div>
                  </div>
                );
              })}
            </div>

            {primaryGoal === 'toeic' && (
              <div className="p-4 rounded-xl bg-black/25 border space-y-2">
                <label className="text-xs font-semibold text-muted-foreground block" htmlFor="toeicTarget">
                  Mục tiêu điểm số TOEIC (10 - 990):
                </label>
                <Input
                  id="toeicTarget"
                  type="number"
                  min={10}
                  max={990}
                  step={5}
                  className="max-w-[180px]"
                  value={targetToeicScore || 650}
                  onChange={(e) => setTargetToeicScore(Number(e.target.value))}
                />
              </div>
            )}

            <div className="flex justify-end pt-2">
              <Button onClick={() => setStep(2)}>
                <span>Tiếp tục (Bước 2)</span>
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Secondary Goals */}
      {step === 2 && (
        <Card className="shadow-2xl border-cyan-500/20">
          <CardContent className="p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b">
              <div>
                <h2 className="text-base sm:text-lg font-bold tracking-tight">
                  Bước 2: Chọn mục tiêu bổ trợ (Secondary Goals)
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Chọn thêm các kỹ năng khác bạn muốn cải thiện đồng thời (có thể bỏ qua).
                </p>
              </div>
              <Badge variant="default">Tùy chọn</Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {GOAL_OPTIONS.filter((g) => g.type !== primaryGoal).map((g) => {
                const isSelected = secondaryGoals.includes(g.type);
                return (
                  <div
                    key={g.id}
                    onClick={() => toggleSecondaryGoal(g.type)}
                    className={`p-4 rounded-xl border cursor-pointer select-none transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'border-cyan-500 bg-cyan-500/10 shadow-md shadow-cyan-500/10'
                        : 'border-border/80 bg-card hover:border-cyan-500/40 hover:bg-white/[0.02]'
                    }`}
                  >
                    <div>
                      <div className="text-2xl mb-2">{g.icon}</div>
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <strong className="text-sm font-bold text-foreground">{g.title}</strong>
                        {isSelected && (
                          <Badge variant="info" className="text-[10px] px-1.5 py-0 h-4">
                            Bổ trợ
                          </Badge>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground leading-relaxed">{g.description}</div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between pt-2">
              <Button variant="ghost" onClick={() => setStep(1)}>
                <ArrowLeft className="w-4 h-4 mr-1.5" />
                <span>Quay lại</span>
              </Button>
              <Button onClick={() => setStep(3)}>
                <span>Tiếp tục (Bước 3)</span>
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Available Study Time & Preferences */}
      {step === 3 && (
        <Card className="shadow-2xl border-cyan-500/20">
          <CardContent className="p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b">
              <div>
                <h2 className="text-base sm:text-lg font-bold tracking-tight">
                  Bước 3: Thời gian &amp; Lịch học mỗi ngày
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Hệ thống Daily Plan sẽ tự động phân bổ lượng bài học phù hợp với quỹ thời gian của bạn.
                </p>
              </div>
              <Badge variant="warning">Bắt buộc</Badge>
            </div>

            {/* Daily Time */}
            <div className="space-y-3">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                <span>Thời lượng học mỗi ngày:</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {DAILY_TIME_OPTIONS.map((t) => {
                  const isSelected = dailyMinutes === t.value;
                  return (
                    <div
                      key={t.value}
                      onClick={() => setDailyMinutes(t.value)}
                      className={`p-3.5 rounded-xl border cursor-pointer select-none transition-all text-center ${
                        isSelected
                          ? 'border-cyan-500 bg-cyan-500/10 shadow-md shadow-cyan-500/10'
                          : 'border-border/80 bg-card hover:border-cyan-500/40 hover:bg-white/[0.02]'
                      }`}
                    >
                      <div className="font-bold text-sm text-foreground">{t.label}</div>
                      <div className="text-[11px] text-muted-foreground mt-0.5">{t.sub}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Study Frequency */}
            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-sky-400" />
                <span>Tần suất học trong tuần:</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {STUDY_DAYS_OPTIONS.map((f) => {
                  const isSelected = studyDays.length === f.days.length;
                  return (
                    <div
                      key={f.value}
                      onClick={() => setStudyDays(f.days)}
                      className={`p-3.5 rounded-xl border cursor-pointer select-none transition-all text-center ${
                        isSelected
                          ? 'border-cyan-500 bg-cyan-500/10 shadow-md shadow-cyan-500/10'
                          : 'border-border/80 bg-card hover:border-cyan-500/40 hover:bg-white/[0.02]'
                      }`}
                    >
                      <div className="font-bold text-sm text-foreground">{f.label}</div>
                      <div className="text-[11px] text-muted-foreground mt-0.5">Duy trì thói quen bền vững</div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t">
              <Button variant="ghost" onClick={() => setStep(2)} disabled={isPending}>
                <ArrowLeft className="w-4 h-4 mr-1.5" />
                <span>Quay lại</span>
              </Button>
              <Button onClick={handleSubmit} isLoading={isPending} className="font-bold shadow-lg shadow-cyan-500/20">
                <span>Hoàn tất &amp; Tới Dashboard</span>
                <Check className="w-4 h-4 ml-1.5" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
