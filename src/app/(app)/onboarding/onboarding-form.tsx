'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  GOAL_OPTIONS,
  DAILY_TIME_OPTIONS,
  STUDY_DAYS_OPTIONS,
} from '@/modules/onboarding/constants';
import { saveOnboardingAction, type OnboardingState } from '@/modules/onboarding/actions';

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
    // Remove from secondary if was selected
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
    <div className="onboarding-container">
      {/* Header */}
      <div className="header" style={{ marginBottom: '2rem' }}>
        <h1 className="title" style={{ fontSize: '2.25rem' }}>
          Thiết lập lộ trình học tập
        </h1>
        <p className="subtitle">
          Hãy cho chúng tôi biết mục tiêu và thời gian học của bạn để tối ưu hóa kế hoạch học tập.
        </p>
      </div>

      {initialState?.isCompleted && (
        <div className="alert alert-success" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Bạn đang ở chế độ chỉnh sửa thiết lập Onboarding.</span>
          <Link href="/dashboard" className="btn btn-secondary btn-sm">
            Quay lại Dashboard
          </Link>
        </div>
      )}

      {error && <div className="alert alert-error">{error}</div>}

      {/* Step Indicators */}
      <div className="onboarding-step-indicator">
        <div className={`step-dot ${step === 1 ? 'active' : step > 1 ? 'completed' : ''}`}>
          1
        </div>
        <div className="step-line" />
        <div className={`step-dot ${step === 2 ? 'active' : step > 2 ? 'completed' : ''}`}>
          2
        </div>
        <div className="step-line" />
        <div className={`step-dot ${step === 3 ? 'active' : ''}`}>
          3
        </div>
      </div>

      {/* Step 1: Primary Goal */}
      {step === 1 && (
        <div className="card">
          <div className="card-title">
            <span>Bước 1: Chọn mục tiêu quan trọng nhất (Primary Goal)</span>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Bắt buộc</span>
          </div>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
            Hệ thống sẽ ưu tiên các bài học và kế hoạch mỗi ngày xoay quanh mục tiêu này.
          </p>

          <div className="selectable-grid">
            {GOAL_OPTIONS.map((g) => {
              const isSelected = primaryGoal === g.type;
              return (
                <div
                  key={g.id}
                  className={`selectable-card ${isSelected ? 'is-primary' : ''}`}
                  onClick={() => handleSelectPrimary(g.type)}
                  role="button"
                  tabIndex={0}
                >
                  <div className="card-icon">{g.icon}</div>
                  <div className="card-heading">
                    <span>{g.title}</span>
                    {isSelected && <span style={{ color: 'var(--accent-emerald)', fontSize: '0.9rem' }}>✓ Chính</span>}
                  </div>
                  <div className="card-desc">{g.description}</div>
                </div>
              );
            })}
          </div>

          {primaryGoal === 'toeic' && (
            <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(15, 23, 42, 0.4)', borderRadius: '8px' }}>
              <label className="form-label" htmlFor="toeicTarget">
                Mục tiêu điểm số TOEIC (10 - 990):
              </label>
              <input
                id="toeicTarget"
                type="number"
                min={10}
                max={990}
                step={5}
                className="form-input"
                style={{ maxWidth: '200px', marginTop: '0.5rem' }}
                value={targetToeicScore || 650}
                onChange={(e) => setTargetToeicScore(Number(e.target.value))}
              />
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2rem' }}>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => setStep(2)}
            >
              Tiếp tục (Bước 2: Mục tiêu phụ) →
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Secondary Goals */}
      {step === 2 && (
        <div className="card">
          <div className="card-title">
            <span>Bước 2: Chọn mục tiêu bổ trợ (Secondary Goals)</span>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Tùy chọn</span>
          </div>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
            Chọn thêm các kỹ năng khác bạn muốn cải thiện đồng thời (có thể bỏ qua).
          </p>

          <div className="selectable-grid">
            {GOAL_OPTIONS.filter((g) => g.type !== primaryGoal).map((g) => {
              const isSelected = secondaryGoals.includes(g.type);
              return (
                <div
                  key={g.id}
                  className={`selectable-card ${isSelected ? 'is-selected' : ''}`}
                  onClick={() => toggleSecondaryGoal(g.type)}
                  role="button"
                  tabIndex={0}
                >
                  <div className="card-icon">{g.icon}</div>
                  <div className="card-heading">
                    <span>{g.title}</span>
                    {isSelected && <span style={{ color: 'var(--accent-cyan)', fontSize: '0.9rem' }}>✓ Bổ trợ</span>}
                  </div>
                  <div className="card-desc">{g.description}</div>
                </div>
              );
            })}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setStep(1)}
            >
              ← Quay lại
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => setStep(3)}
            >
              Tiếp tục (Bước 3: Thời gian học) →
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Available Study Time & Preferences */}
      {step === 3 && (
        <div className="card">
          <div className="card-title">
            <span>Bước 3: Thời gian &amp; Lịch học mỗi ngày</span>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Bắt buộc</span>
          </div>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            Hệ thống Daily Plan sẽ tự động phân bổ lượng bài học phù hợp với quỹ thời gian của bạn.
          </p>

          {/* Daily Time */}
          <h4 style={{ color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
            Thời lượng học mỗi ngày:
          </h4>
          <div className="selectable-grid" style={{ marginBottom: '2rem' }}>
            {DAILY_TIME_OPTIONS.map((t) => {
              const isSelected = dailyMinutes === t.value;
              return (
                <div
                  key={t.value}
                  className={`selectable-card ${isSelected ? 'is-primary' : ''}`}
                  onClick={() => setDailyMinutes(t.value)}
                  role="button"
                  tabIndex={0}
                >
                  <div className="card-heading">
                    <span>{t.label}</span>
                    {isSelected && <span style={{ color: 'var(--accent-emerald)' }}>✓</span>}
                  </div>
                  <div className="card-desc">{t.sub}</div>
                </div>
              );
            })}
          </div>

          {/* Study Frequency */}
          <h4 style={{ color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
            Tần suất học trong tuần:
          </h4>
          <div className="selectable-grid">
            {STUDY_DAYS_OPTIONS.map((f) => {
              const isSelected = studyDays.length === f.days.length;
              return (
                <div
                  key={f.value}
                  className={`selectable-card ${isSelected ? 'is-selected' : ''}`}
                  onClick={() => setStudyDays(f.days)}
                  role="button"
                  tabIndex={0}
                >
                  <div className="card-heading">
                    <span>{f.label}</span>
                    {isSelected && <span style={{ color: 'var(--accent-cyan)' }}>✓</span>}
                  </div>
                  <div className="card-desc">Cam kết duy trì thói quen học tập</div>
                </div>
              );
            })}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2.5rem' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setStep(2)}
              disabled={isPending}
            >
              ← Quay lại
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleSubmit}
              disabled={isPending}
            >
              {isPending ? 'Đang lưu thiết lập...' : 'Hoàn tất & Tới Dashboard ✓'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
