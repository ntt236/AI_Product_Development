'use client';

import React, { useState, useEffect, useTransition } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import type {
  ContentItem,
  PracticeExerciseClient,
  PracticeSubmissionResult,
} from '@/modules/daily-plan/types';
import { submitPracticeAction } from '@/modules/daily-plan/actions';

interface PracticeSessionViewProps {
  task: {
    id: string;
    title: string;
    skill?: string | null;
    estimated_minutes: number;
    status: string;
  };
  contentItem: ContentItem;
  exercises: PracticeExerciseClient[];
}

type SessionStep = 'study' | 'practice' | 'result';

export function PracticeSessionView({
  task,
  contentItem,
  exercises,
}: PracticeSessionViewProps) {
  const [step, setStep] = useState<SessionStep>('study');
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [submissionResult, setSubmissionResult] = useState<PracticeSubmissionResult | null>(null);
  const [secondsSpent, setSecondsSpent] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Timer while practicing
  useEffect(() => {
    if (step !== 'practice') return;
    const interval = setInterval(() => {
      setSecondsSpent((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [step]);

  const handleSelectOption = (exerciseId: string, optionId: string) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [exerciseId]: optionId,
    }));
  };

  const answeredCount = Object.keys(selectedAnswers).length;
  const totalCount = exercises.length;

  const handleSubmit = () => {
    if (answeredCount < totalCount) {
      if (!confirm(`Bạn mới trả lời ${answeredCount}/${totalCount} câu hỏi. Bạn có chắc muốn nộp bài ngay?`)) {
        return;
      }
    }

    const payload = Object.entries(selectedAnswers).map(([exerciseId, optionId]) => ({
      exercise_id: exerciseId,
      selected_option_id: optionId,
    }));

    setErrorMessage(null);

    startTransition(async () => {
      const res = await submitPracticeAction(
        task.id,
        contentItem.id,
        payload,
        secondsSpent
      );

      if (!res.success || !res.result) {
        setErrorMessage(res.error || 'Lỗi khi nộp bài. Vui lòng thử lại.');
      } else {
        setSubmissionResult(res.result);
        setStep('result');
      }
    });
  };

  const handleResetForRetry = () => {
    setSelectedAnswers({});
    setSubmissionResult(null);
    setSecondsSpent(0);
    setStep('practice');
  };

  return (
    <div style={{ maxWidth: '820px', margin: '0 auto', paddingBottom: '5rem' }}>
      {/* Top breadcrumb & back */}
      <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link href="/daily-plan" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          ← Quay lại Kế hoạch ngày
        </Link>

        {/* Step indicator pills */}
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => setStep('study')}
            disabled={step === 'result'}
            style={{
              padding: '0.35rem 0.85rem',
              borderRadius: '20px',
              fontSize: '0.85rem',
              fontWeight: 600,
              border: 'none',
              cursor: step === 'result' ? 'not-allowed' : 'pointer',
              background: step === 'study' ? 'var(--accent-cyan)' : 'rgba(255, 255, 255, 0.08)',
              color: step === 'study' ? '#0f172a' : 'var(--text-secondary)',
            }}
          >
            1. Nội dung bài học
          </button>
          <button
            onClick={() => setStep('practice')}
            disabled={step === 'result'}
            style={{
              padding: '0.35rem 0.85rem',
              borderRadius: '20px',
              fontSize: '0.85rem',
              fontWeight: 600,
              border: 'none',
              cursor: step === 'result' ? 'not-allowed' : 'pointer',
              background: step === 'practice' ? 'var(--accent-cyan)' : 'rgba(255, 255, 255, 0.08)',
              color: step === 'practice' ? '#0f172a' : 'var(--text-secondary)',
            }}
          >
            2. Làm bài tập ({answeredCount}/{totalCount})
          </button>
          {step === 'result' && (
            <span
              style={{
                padding: '0.35rem 0.85rem',
                borderRadius: '20px',
                fontSize: '0.85rem',
                fontWeight: 600,
                background: '#10b981',
                color: '#ffffff',
              }}
            >
              3. Kết quả &amp; Giải thích
            </span>
          )}
        </div>
      </div>

      {errorMessage && (
        <div
          style={{
            padding: '1rem',
            borderRadius: '8px',
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#f87171',
            marginBottom: '1.5rem',
          }}
        >
          ⚠️ {errorMessage}
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 1: NỘI DUNG BÀI HỌC (STUDY CONTENT) */}
      {/* ========================================================================= */}
      {step === 'study' && (
        <div>
          <div className="card" style={{ padding: '2rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
              <Badge variant="info">{contentItem.skill.toUpperCase()}</Badge>
              <Badge variant="default">Cấp độ {contentItem.level.toUpperCase()}</Badge>
              <Badge variant="default">⏱️ {contentItem.estimated_minutes} phút</Badge>
            </div>

            <h1 style={{ fontSize: '1.85rem', fontWeight: 700, margin: '0 0 0.5rem' }}>
              {contentItem.title}
            </h1>
            <p style={{ color: 'var(--text-secondary)', margin: 0, lineHeight: 1.6 }}>
              {contentItem.description}
            </p>

            {contentItem.body?.overview && (
              <div
                style={{
                  marginTop: '1.25rem',
                  padding: '1rem',
                  borderRadius: '8px',
                  background: 'rgba(56, 189, 248, 0.08)',
                  border: '1px solid rgba(56, 189, 248, 0.2)',
                  color: 'var(--text-primary)',
                  lineHeight: 1.6,
                }}
              >
                💡 <strong>Mục tiêu bài học:</strong> {contentItem.body.overview}
              </div>
            )}
          </div>

          {/* Vocabulary Cards */}
          {contentItem.body?.words && contentItem.body.words.length > 0 && (
            <div style={{ marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '1rem' }}>
                📖 Sổ từ vựng cốt lõi ({contentItem.body.words.length} từ)
              </h2>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1rem' }}>
                {contentItem.body.words.map((w, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: 'var(--card-bg)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '12px',
                      padding: '1.25rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.5rem',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                      <span style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>
                        {w.word}
                      </span>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                        {w.part_of_speech}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                      Phiên âm: <strong style={{ color: 'var(--text-primary)' }}>{w.ipa}</strong>
                    </div>

                    <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#34d399' }}>
                      Ý nghĩa: {w.meaning_vi}
                    </div>

                    <div
                      style={{
                        padding: '0.65rem 0.85rem',
                        background: 'rgba(255, 255, 255, 0.03)',
                        borderRadius: '6px',
                        borderLeft: '3px solid var(--accent-cyan)',
                        fontSize: '0.85rem',
                        lineHeight: 1.5,
                        color: 'var(--text-primary)',
                      }}
                    >
                      Ví dụ: <em>&quot;{w.example}&quot;</em>
                    </div>

                    {w.note && (
                      <div style={{ fontSize: '0.8rem', color: '#fbbf24' }}>
                        📌 Lưu ý: {w.note}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Grammar Rules */}
          {contentItem.body?.rules && contentItem.body.rules.length > 0 && (
            <div style={{ marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '1rem' }}>
                📐 Cấu trúc &amp; Quy tắc ngữ pháp
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {contentItem.body.rules.map((rule, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: 'var(--card-bg)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '12px',
                      padding: '1.5rem',
                    }}
                  >
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0 0 0.5rem', color: 'var(--accent-cyan)' }}>
                      {rule.name}
                    </h3>

                    <div
                      style={{
                        padding: '0.75rem 1rem',
                        borderRadius: '8px',
                        background: 'rgba(56, 189, 248, 0.1)',
                        border: '1px solid rgba(56, 189, 248, 0.25)',
                        fontSize: '1rem',
                        fontWeight: 600,
                        color: 'var(--accent-cyan)',
                        fontFamily: 'monospace',
                        marginBottom: '0.75rem',
                      }}
                    >
                      {rule.formula}
                    </div>

                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6, margin: '0 0 0.75rem' }}>
                      {rule.explanation}
                    </p>

                    {rule.examples && rule.examples.length > 0 && (
                      <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '0.75rem 1rem', borderRadius: '6px' }}>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                          VÍ DỤ THỰC TẾ:
                        </div>
                        {rule.examples.map((ex, exIdx) => (
                          <div key={exIdx} style={{ fontSize: '0.9rem', color: 'var(--text-primary)', margin: '0.2rem 0' }}>
                            • {ex}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action button */}
          <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
            <button
              onClick={() => setStep('practice')}
              className="btn btn-primary"
              style={{ padding: '0.85rem 2rem', fontSize: '1.1rem' }}
            >
              Tôi đã hiểu bài • Bắt đầu làm bài tập ({exercises.length} câu) ➔
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 2: LÀM BÀI TẬP TƯƠNG TÁC (INTERACTIVE PRACTICE) */}
      {/* ========================================================================= */}
      {step === 'practice' && (
        <div>
          {/* Practice Header with Progress & Timer */}
          <div
            style={{
              padding: '1.25rem 1.5rem',
              borderRadius: '12px',
              background: 'var(--card-bg)',
              border: '1px solid var(--border-color)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '2rem',
            }}
          >
            <div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>TIẾN ĐỘ TRẢ LỜI</div>
              <strong style={{ fontSize: '1.25rem', color: 'var(--accent-cyan)' }}>
                {answeredCount} / {totalCount} câu hỏi
              </strong>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>THỜI GIAN LÀM BÀI</div>
              <strong style={{ fontSize: '1.25rem', color: '#fbbf24' }}>
                {Math.floor(secondsSpent / 60)}:{(secondsSpent % 60).toString().padStart(2, '0')}
              </strong>
            </div>
          </div>

          {/* Exercise Questions List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {exercises.map((ex, index) => {
              const selectedOption = selectedAnswers[ex.id];

              return (
                <div
                  key={ex.id}
                  style={{
                    background: 'var(--card-bg)',
                    border: selectedOption
                      ? '1px solid rgba(56, 189, 248, 0.4)'
                      : '1px solid var(--border-color)',
                    borderRadius: '12px',
                    padding: '1.5rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    <Badge variant="default">Câu {index + 1}</Badge>
                    {selectedOption && <Badge variant="success">Đã chọn</Badge>}
                  </div>

                  <h3 style={{ fontSize: '1.1rem', fontWeight: 600, lineHeight: 1.5, margin: '0 0 1rem' }}>
                    {ex.prompt}
                  </h3>

                  {ex.context_text && (
                    <div
                      style={{
                        padding: '0.75rem 1rem',
                        borderRadius: '6px',
                        background: 'rgba(255, 255, 255, 0.03)',
                        borderLeft: '3px solid var(--border-color)',
                        fontSize: '0.85rem',
                        color: 'var(--text-secondary)',
                        marginBottom: '1rem',
                      }}
                    >
                      {ex.context_text}
                    </div>
                  )}

                  {/* Options */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                    {ex.options.map((opt) => {
                      const isSelected = selectedOption === opt.id;

                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => handleSelectOption(ex.id, opt.id)}
                          style={{
                            textAlign: 'left',
                            padding: '0.85rem 1.15rem',
                            borderRadius: '8px',
                            background: isSelected
                              ? 'rgba(56, 189, 248, 0.15)'
                              : 'rgba(255, 255, 255, 0.03)',
                            border: isSelected
                              ? '2px solid var(--accent-cyan)'
                              : '1px solid var(--border-color)',
                            color: isSelected ? 'var(--accent-cyan)' : 'var(--text-primary)',
                            fontSize: '0.95rem',
                            fontWeight: isSelected ? 600 : 400,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            transition: 'all 0.15s ease',
                          }}
                        >
                          <span>{opt.text}</span>
                          <span
                            style={{
                              width: '18px',
                              height: '18px',
                              borderRadius: '50%',
                              border: isSelected
                                ? '5px solid var(--accent-cyan)'
                                : '2px solid var(--text-muted)',
                              background: isSelected ? '#ffffff' : 'transparent',
                            }}
                          />
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Submit button */}
          <div style={{ marginTop: '2.5rem', textAlign: 'center', display: 'flex', justifyContent: 'center', gap: '1rem' }}>
            <button
              onClick={() => setStep('study')}
              className="btn btn-secondary"
            >
              ← Xem lại lý thuyết
            </button>

            <button
              onClick={handleSubmit}
              disabled={isPending || answeredCount === 0}
              className="btn btn-primary"
              style={{ padding: '0.75rem 2rem', fontSize: '1.05rem' }}
            >
              {isPending ? 'Đang chấm điểm...' : '🚀 Nộp bài & Xem kết quả'}
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 3: KẾT QUẢ & GIẢI THÍCH CHI TIẾT (RESULT & FEEDBACK) */}
      {/* ========================================================================= */}
      {step === 'result' && submissionResult && (
        <div>
          {/* Result Score Card */}
          <div
            className="card"
            style={{
              padding: '2.5rem',
              textAlign: 'center',
              background: 'linear-gradient(180deg, rgba(16, 185, 129, 0.15), rgba(15, 23, 42, 0.95))',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: '16px',
              marginBottom: '2rem',
            }}
          >
            <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>
              {submissionResult.percentage >= 80 ? '🌟' : submissionResult.percentage >= 50 ? '👍' : '💪'}
            </div>

            <h2 style={{ fontSize: '1.75rem', fontWeight: 700, margin: '0 0 0.5rem' }}>
              {submissionResult.percentage >= 80
                ? 'Xuất sắc! Bạn nắm rất vững bài học'
                : submissionResult.percentage >= 50
                ? 'Làm tốt lắm! Hãy xem lại các câu chưa chính xác'
                : 'Cần ôn tập thêm! Hãy xem kỹ phần giải thích chi tiết'}
            </h2>

            <div style={{ fontSize: '3.5rem', fontWeight: 800, color: '#34d399', margin: '0.5rem 0' }}>
              {submissionResult.percentage}%
            </div>

            <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', margin: '0 0 1.5rem' }}>
              Đạt <strong>{submissionResult.score} / {submissionResult.max_score} điểm</strong> ({submissionResult.breakdown.filter((b) => b.is_correct).length}/{submissionResult.breakdown.length} câu đúng) trong thời gian{' '}
              <strong>{Math.floor(secondsSpent / 60)} phút {secondsSpent % 60} giây</strong>.
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <Link href="/daily-plan" className="btn btn-primary" style={{ padding: '0.75rem 1.75rem' }}>
                📅 Hoàn tất &amp; Về Kế hoạch ngày
              </Link>
              <button onClick={handleResetForRetry} className="btn btn-secondary">
                🔄 Làm lại bài tập
              </button>
            </div>
          </div>

          {/* Detailed Question Review */}
          <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '1rem' }}>
            🔍 Chi tiết từng câu &amp; Giải thích đáp án
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {submissionResult.breakdown.map((item, idx) => {
              const currentEx = exercises.find((e) => e.id === item.exercise_id);
              const userOpt = currentEx?.options?.find(
                (o) => o.id === item.user_answer || o.id === item.user_option_id
              );
              const correctOpt = currentEx?.options?.find(
                (o) => o.id === item.correct_answer || o.id === item.correct_option_id
              );

              const displayUserAnswer =
                userOpt?.text ||
                (item.user_answer && !item.user_answer.startsWith('opt_')
                  ? item.user_answer
                  : undefined) ||
                (item.user_answer ? item.user_answer : '(Bỏ trống)');

              const displayCorrectAnswer =
                correctOpt?.text ||
                (item.correct_answer && !item.correct_answer.startsWith('opt_')
                  ? item.correct_answer
                  : undefined) ||
                item.correct_answer;

              return (
                <div
                  key={idx}
                  style={{
                    background: 'var(--card-bg)',
                    border: item.is_correct
                      ? '1px solid rgba(16, 185, 129, 0.3)'
                      : '1px solid rgba(239, 68, 68, 0.3)',
                    borderRadius: '12px',
                    padding: '1.5rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <Badge variant={item.is_correct ? 'success' : 'default'}>
                      {item.is_correct ? '✓ Câu đúng' : '✕ Câu sai'}
                    </Badge>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Câu {idx + 1}</span>
                  </div>

                  <p style={{ fontSize: '1.05rem', fontWeight: 600, margin: '0 0 0.75rem', lineHeight: 1.5 }}>
                    {item.prompt}
                  </p>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.5rem', marginBottom: '1rem', fontSize: '0.9rem' }}>
                    <div style={{ padding: '0.5rem 0.75rem', borderRadius: '6px', background: item.is_correct ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)' }}>
                      Câu bạn chọn: <strong style={{ color: item.is_correct ? '#34d399' : '#f87171' }}>{displayUserAnswer}</strong>
                    </div>

                    {!item.is_correct && (
                      <div style={{ padding: '0.5rem 0.75rem', borderRadius: '6px', background: 'rgba(16, 185, 129, 0.1)' }}>
                        Đáp án đúng: <strong style={{ color: '#34d399' }}>{displayCorrectAnswer}</strong>
                      </div>
                    )}
                  </div>

                  {/* Explanation box */}
                  <div
                    style={{
                      padding: '0.85rem 1rem',
                      borderRadius: '8px',
                      background: 'rgba(255, 255, 255, 0.03)',
                      borderLeft: '3px solid var(--accent-cyan)',
                      fontSize: '0.85rem',
                      color: 'var(--text-secondary)',
                      lineHeight: 1.6,
                    }}
                  >
                    💡 <strong>Giải thích chi tiết:</strong> {item.explanation}
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
            <Link href="/daily-plan" className="btn btn-primary" style={{ padding: '0.75rem 2rem' }}>
              Quay lại danh sách Kế hoạch ngày ➔
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
