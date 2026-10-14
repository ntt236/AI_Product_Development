'use client';

import React, { useState, useEffect, useCallback, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import type { ClientAssessmentQuestion } from '../types';
import { saveAnswerAction, submitAssessmentAction } from '../actions';
import { Badge } from '@/components/ui/badge';

interface TestRunnerProps {
  attemptId: string;
  questions: ClientAssessmentQuestion[];
  initialAnswers: Record<string, string>;
  timeLimitSeconds: number | null;
}

const SKILL_LABELS: Record<string, { label: string; icon: string }> = {
  vocabulary: { label: 'Từ vựng', icon: '📖' },
  grammar: { label: 'Ngữ pháp', icon: '📐' },
  reading: { label: 'Đọc hiểu', icon: '📰' },
  listening: { label: 'Hội thoại & Nghe', icon: '🎧' },
};

export function AssessmentTestRunner({
  attemptId,
  questions,
  initialAnswers,
  timeLimitSeconds,
}: TestRunnerProps) {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>(initialAnswers);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Time tracking
  const [secondsElapsed, setSecondsElapsed] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const currentQuestion = questions[currentIndex];
  const totalQuestions = questions.length;
  const answeredCount = Object.keys(answers).filter((k) => answers[k]).length;
  const progressPercent = Math.round((answeredCount / totalQuestions) * 100);

  // Save an answer
  const handleSelectOption = useCallback(
    async (optionId: string) => {
      if (!currentQuestion || isSubmitting) return;

      const newAnswers = { ...answers, [currentQuestion.id]: optionId };
      setAnswers(newAnswers);
      setSaveStatus('saving');

      try {
        const res = await saveAnswerAction(attemptId, currentQuestion.id, optionId, secondsElapsed);
        if (res.success) {
          setSaveStatus('saved');
        } else {
          setSaveStatus('error');
        }
      } catch {
        setSaveStatus('error');
      }
    },
    [answers, attemptId, currentQuestion, isSubmitting, secondsElapsed]
  );

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if modifier keys are pressed or modal is open
      if (e.ctrlKey || e.altKey || e.metaKey || showConfirmModal || isSubmitting) return;

      const key = e.key.toUpperCase();
      if (['A', 'B', 'C', 'D'].includes(key)) {
        e.preventDefault();
        handleSelectOption(key);
      } else if (key === '1') {
        e.preventDefault();
        handleSelectOption('A');
      } else if (key === '2') {
        e.preventDefault();
        handleSelectOption('B');
      } else if (key === '3') {
        e.preventDefault();
        handleSelectOption('C');
      } else if (key === '4') {
        e.preventDefault();
        handleSelectOption('D');
      } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        if (currentIndex < totalQuestions - 1) {
          setCurrentIndex((prev) => prev + 1);
        }
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        if (currentIndex > 0) {
          setCurrentIndex((prev) => prev - 1);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, totalQuestions, handleSelectOption, showConfirmModal, isSubmitting]);

  // Submit test
  const handleConfirmSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const res = await submitAssessmentAction(attemptId);
      if (res.success) {
        startTransition(() => {
          router.push(`/assessment/results/${attemptId}`);
        });
      } else {
        setSubmitError(res.error || 'Có lỗi khi nộp bài. Vui lòng thử lại.');
        setIsSubmitting(false);
      }
    } catch {
      setSubmitError('Lỗi kết nối máy chủ khi nộp bài.');
      setIsSubmitting(false);
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (!currentQuestion) {
    return <div className="container">Không có câu hỏi nào trong bài thi.</div>;
  }

  const skillInfo = SKILL_LABELS[currentQuestion.skill] || {
    label: currentQuestion.skill,
    icon: '📝',
  };

  return (
    <div style={{ maxWidth: '980px', margin: '0 auto', padding: '1.5rem 1rem 4rem' }}>
      {/* Top Bar: Progress & Timer */}
      <div
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: '12px',
          padding: '1rem 1.5rem',
          marginBottom: '1.5rem',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '1.25rem' }}>{skillInfo.icon}</span>
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>
              Câu hỏi {currentIndex + 1} / {totalQuestions}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Đã làm: {answeredCount}/{totalQuestions} câu ({progressPercent}%)
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ flex: '1 1 200px', maxWidth: '300px' }}>
          <div
            style={{
              width: '100%',
              height: '8px',
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              borderRadius: '999px',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${progressPercent}%`,
                height: '100%',
                backgroundColor: 'var(--accent-cyan)',
                transition: 'width 0.3s ease',
              }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>THỜI GIAN</span>
            <div style={{ fontFamily: 'monospace', fontWeight: 'bold', fontSize: '1.05rem', color: 'var(--accent-cyan)' }}>
              ⏱️ {formatTime(secondsElapsed)}
              {timeLimitSeconds && ` / ${formatTime(timeLimitSeconds)}`}
            </div>
          </div>

          <button
            onClick={() => setShowConfirmModal(true)}
            className="btn btn-primary btn-sm"
            style={{ padding: '0.5rem 1rem' }}
          >
            ✓ Nộp bài
          </button>
        </div>
      </div>

      {/* Main Question Card */}
      <div
        className="card"
        style={{
          padding: '2rem',
          borderRadius: '14px',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.25)',
        }}
      >
        {/* Question Header Metadata */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.5rem',
            paddingBottom: '1rem',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <Badge variant="info">
              {skillInfo.icon} {skillInfo.label}
            </Badge>
            <Badge variant="default">Cấp độ {currentQuestion.level.toUpperCase()}</Badge>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Độ khó: {currentQuestion.difficulty}/5
            </span>
          </div>

          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            {saveStatus === 'saving' && <span style={{ color: 'var(--accent-amber)' }}>Đang lưu...</span>}
            {saveStatus === 'saved' && <span style={{ color: 'var(--accent-emerald)' }}>✓ Đã lưu</span>}
            {saveStatus === 'error' && <span style={{ color: '#ef4444' }}>⚠️ Chưa lưu</span>}
          </div>
        </div>

        {/* Reading Passage or Context if exists */}
        {currentQuestion.context_text && (
          <div
            style={{
              padding: '1.25rem 1.5rem',
              borderRadius: '10px',
              backgroundColor: 'rgba(255, 255, 255, 0.03)',
              borderLeft: '4px solid var(--accent-cyan)',
              marginBottom: '1.75rem',
              lineHeight: 1.7,
              fontSize: '0.98rem',
              color: '#e2e8f0',
              whiteSpace: 'pre-line',
            }}
          >
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--accent-cyan)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
              {currentQuestion.skill === 'reading' ? 'Đoạn văn đọc hiểu' : 'Ngữ cảnh hội thoại'}
            </div>
            {currentQuestion.context_text}
          </div>
        )}

        {/* Question Prompt */}
        <h2
          style={{
            fontSize: '1.25rem',
            fontWeight: 600,
            lineHeight: 1.5,
            marginBottom: '1.75rem',
            color: 'var(--text-primary)',
          }}
        >
          {currentQuestion.prompt}
        </h2>

        {/* Multiple Choice Options */}
        <div style={{ display: 'grid', gap: '0.85rem', marginBottom: '2rem' }}>
          {currentQuestion.options.map((option) => {
            const isSelected = answers[currentQuestion.id] === option.id;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => handleSelectOption(option.id)}
                disabled={isSubmitting}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '1rem 1.25rem',
                  borderRadius: '10px',
                  background: isSelected
                    ? 'rgba(56, 189, 248, 0.15)'
                    : 'rgba(255, 255, 255, 0.03)',
                  border: isSelected
                    ? '2px solid var(--accent-cyan)'
                    : '1px solid rgba(255, 255, 255, 0.08)',
                  color: isSelected ? '#ffffff' : 'var(--text-primary)',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s ease',
                  fontSize: '1rem',
                }}
              >
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    backgroundColor: isSelected ? 'var(--accent-cyan)' : 'rgba(255, 255, 255, 0.08)',
                    color: isSelected ? '#0f172a' : 'var(--text-secondary)',
                    fontWeight: 700,
                    marginRight: '1rem',
                    flexShrink: 0,
                  }}
                >
                  {option.id}
                </span>
                <span style={{ flex: 1 }}>{option.text}</span>
              </button>
            );
          })}
        </div>

        {/* Navigation Footer */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingTop: '1.25rem',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          <button
            type="button"
            onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
            disabled={currentIndex === 0 || isSubmitting}
            className="btn btn-secondary btn-sm"
            style={{ opacity: currentIndex === 0 ? 0.4 : 1 }}
          >
            ← Câu trước
          </button>

          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Dùng phím <strong>1-4</strong> hoặc <strong>A-D</strong> để chọn đáp án
          </span>

          {currentIndex < totalQuestions - 1 ? (
            <button
              type="button"
              onClick={() => setCurrentIndex((prev) => Math.min(totalQuestions - 1, prev + 1))}
              disabled={isSubmitting}
              className="btn btn-primary btn-sm"
            >
              Câu tiếp theo →
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setShowConfirmModal(true)}
              disabled={isSubmitting}
              className="btn btn-primary btn-sm"
              style={{ backgroundColor: 'var(--accent-emerald)' }}
            >
              Hoàn tất &amp; Nộp bài ✓
            </button>
          )}
        </div>
      </div>

      {/* Question Quick Jump Palette */}
      <div
        style={{
          marginTop: '1.5rem',
          padding: '1.25rem',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: '12px',
        }}
      >
        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.75rem', fontWeight: 600 }}>
          DANH SÁCH CÂU HỎI
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {questions.map((q, idx) => {
            const isAnswered = Boolean(answers[q.id]);
            const isCurrent = idx === currentIndex;

            return (
              <button
                key={q.id}
                type="button"
                onClick={() => setCurrentIndex(idx)}
                disabled={isSubmitting}
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '8px',
                  border: isCurrent
                    ? '2px solid var(--accent-cyan)'
                    : isAnswered
                    ? '1px solid rgba(16, 185, 129, 0.4)'
                    : '1px solid rgba(255, 255, 255, 0.1)',
                  backgroundColor: isCurrent
                    ? 'rgba(56, 189, 248, 0.2)'
                    : isAnswered
                    ? 'rgba(16, 185, 129, 0.15)'
                    : 'rgba(255, 255, 255, 0.03)',
                  color: isCurrent
                    ? 'var(--accent-cyan)'
                    : isAnswered
                    ? 'var(--accent-emerald)'
                    : 'var(--text-muted)',
                  fontWeight: isCurrent || isAnswered ? 700 : 500,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            zIndex: 9999,
          }}
        >
          <div
            style={{
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              borderRadius: '16px',
              maxWidth: '480px',
              width: '100%',
              padding: '2rem',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)',
            }}
          >
            <h3 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--text-primary)' }}>
              Xác nhận nộp bài thi
            </h3>

            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.25rem', fontSize: '0.95rem' }}>
              Bạn đã trả lời{' '}
              <strong style={{ color: 'var(--accent-cyan)' }}>
                {answeredCount}/{totalQuestions}
              </strong>{' '}
              câu hỏi.
              {answeredCount < totalQuestions && (
                <span style={{ display: 'block', color: 'var(--accent-amber)', marginTop: '0.5rem' }}>
                  ⚠️ Còn {totalQuestions - answeredCount} câu chưa trả lời. Bạn có chắc chắn muốn nộp ngay?
                </span>
              )}
            </p>

            {submitError && (
              <div
                style={{
                  padding: '0.75rem',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  color: '#f87171',
                  fontSize: '0.9rem',
                  marginBottom: '1.25rem',
                }}
              >
                {submitError}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                disabled={isSubmitting}
                className="btn btn-secondary"
              >
                Tiếp tục làm bài
              </button>

              <button
                type="button"
                onClick={handleConfirmSubmit}
                disabled={isSubmitting || isPending}
                className="btn btn-primary"
                style={{ backgroundColor: 'var(--accent-emerald)' }}
              >
                {isSubmitting || isPending ? 'Đang chấm điểm...' : 'Xác nhận nộp bài'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
