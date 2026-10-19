'use client';

import React, { useState, useEffect, useTransition, useRef } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import type {
  ContentItem,
  PracticeExerciseClient,
  PracticeSubmissionResult,
} from '@/modules/daily-plan/types';
import { submitPracticeAction } from '@/modules/daily-plan/actions';
import { getAITutorExplanationAction } from '@/modules/ai-tutor/actions';
import type { AITutorExplanation } from '@/modules/ai-tutor/types';

interface ListeningAudioPlayerProps {
  audioUrl: string;
  title?: string;
  showSpeedControls?: boolean;
}

function ListeningAudioPlayer({
  audioUrl,
  title,
  showSpeedControls = true,
}: ListeningAudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playbackRate, setPlaybackRate] = useState<number>(1.0);

  const changeSpeed = (rate: number) => {
    setPlaybackRate(rate);
    if (audioRef.current) {
      audioRef.current.playbackRate = rate;
    }
  };

  return (
    <div
      style={{
        background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.95), rgba(15, 23, 42, 0.95))',
        border: '1px solid rgba(56, 189, 248, 0.35)',
        borderRadius: '12px',
        padding: '1.25rem 1.5rem',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '0.75rem',
          flexWrap: 'wrap',
          gap: '0.5rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '1.25rem' }}>🎧</span>
          <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--accent-cyan)' }}>
            {title || 'Audio luyện nghe (Hội thoại tự nhiên)'}
          </span>
        </div>

        {showSpeedControls && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Tốc độ:</span>
            {[0.8, 1.0, 1.2].map((rate) => (
              <button
                key={rate}
                type="button"
                onClick={() => changeSpeed(rate)}
                style={{
                  padding: '0.2rem 0.55rem',
                  borderRadius: '6px',
                  border: '1px solid',
                  borderColor: playbackRate === rate ? 'var(--accent-cyan)' : 'var(--border-color)',
                  background: playbackRate === rate ? 'rgba(56, 189, 248, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                  color: playbackRate === rate ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {rate}x
              </button>
            ))}
          </div>
        )}
      </div>

      <audio
        ref={audioRef}
        controls
        preload="metadata"
        src={audioUrl}
        style={{ width: '100%', height: '42px', outline: 'none' }}
      >
        Trình duyệt của bạn không hỗ trợ phát thẻ audio HTML5.
      </audio>
    </div>
  );
}

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

  const [aiTutorExplanations, setAiTutorExplanations] = useState<Record<string, AITutorExplanation>>({});
  const [loadingTutorId, setLoadingTutorId] = useState<string | null>(null);
  const [aiTutorErrors, setAiTutorErrors] = useState<Record<string, string>>({});
  const [followUpTexts, setFollowUpTexts] = useState<Record<string, string>>({});

  const handleAskAITutor = async (exerciseId: string, customQuery?: string) => {
    if (!submissionResult?.submission_id || loadingTutorId === exerciseId) return;

    setLoadingTutorId(exerciseId);
    setAiTutorErrors((prev) => ({ ...prev, [exerciseId]: '' }));

    try {
      const res = await getAITutorExplanationAction({
        submissionId: submissionResult.submission_id,
        exerciseId,
        userQuery: customQuery,
      });

      if (!res.success || !res.explanation) {
        setAiTutorErrors((prev) => ({
          ...prev,
          [exerciseId]: res.error || 'Không thể kết nối với AI Tutor lúc này.',
        }));
      } else {
        setAiTutorExplanations((prev) => ({
          ...prev,
          [exerciseId]: res.explanation!,
        }));
        if (customQuery) {
          setFollowUpTexts((prev) => ({ ...prev, [exerciseId]: '' }));
        }
      }
    } catch (err: unknown) {
      setAiTutorErrors((prev) => ({
        ...prev,
        [exerciseId]: err instanceof Error ? err.message : 'Lỗi hệ thống khi gọi AI Tutor.',
      }));
    } finally {
      setLoadingTutorId(null);
    }
  };

  const handleResetForRetry = () => {
    setSelectedAnswers({});
    setSubmissionResult(null);
    setSecondsSpent(0);
    setAiTutorExplanations({});
    setAiTutorErrors({});
    setFollowUpTexts({});
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

          {/* Listening Tips & Audio Preview */}
          {(contentItem.skill === 'listening' || contentItem.body?.audio_url) && (
            <div style={{ marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '1rem' }}>
                🎧 Luyện nghe trước đoạn hội thoại
              </h2>

              {contentItem.body?.tips && contentItem.body.tips.length > 0 && (
                <div
                  style={{
                    background: 'var(--card-bg)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '12px',
                    padding: '1.25rem 1.5rem',
                    marginBottom: '1.25rem',
                  }}
                >
                  <div
                    style={{
                      fontWeight: 700,
                      color: '#fbbf24',
                      fontSize: '0.95rem',
                      marginBottom: '0.5rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                    }}
                  >
                    💡 Chiến lược nghe &amp; Bắt từ khóa cốt lõi:
                  </div>
                  <ul
                    style={{
                      margin: 0,
                      paddingLeft: '1.25rem',
                      color: 'var(--text-secondary)',
                      fontSize: '0.9rem',
                      lineHeight: 1.6,
                    }}
                  >
                    {contentItem.body.tips.map((tip, idx) => (
                      <li key={idx} style={{ marginBottom: '0.35rem' }}>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {contentItem.body?.audio_url && (
                <div style={{ marginBottom: '1.25rem' }}>
                  <ListeningAudioPlayer
                    audioUrl={contentItem.body.audio_url}
                    title="Nghe thử hội thoại mẫu (Audio Preview)"
                  />
                </div>
              )}

              <div
                style={{
                  padding: '0.85rem 1.15rem',
                  borderRadius: '8px',
                  background: 'rgba(245, 158, 11, 0.08)',
                  border: '1px dashed rgba(245, 158, 11, 0.3)',
                  fontSize: '0.85rem',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.5,
                }}
              >
                🔒 <strong>Lưu ý sư phạm:</strong> Lời thoại chi tiết (Transcript) kèm bản dịch tiếng Việt sẽ được hiển thị đầy đủ sau khi bạn nộp bài, giúp bạn tối đa hóa phản xạ nghe hiểu tự nhiên mà không phụ thuộc vào chữ viết.
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

          {/* Persistent Audio Player during practice */}
          {(contentItem.skill === 'listening' || contentItem.body?.audio_url) && contentItem.body?.audio_url && (
            <div style={{ marginBottom: '2rem' }}>
              <ListeningAudioPlayer
                audioUrl={contentItem.body.audio_url}
                title="🎧 Audio nghe hội thoại (Bạn có thể nghe lại nhiều lần khi làm bài)"
              />
            </div>
          )}

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

          {/* Listening Dialogue Transcript & Audio Replay (Revealed after submission) */}
          {(contentItem.skill === 'listening' || contentItem.body?.dialogue || contentItem.body?.transcript) && (
            <div
              style={{
                background: 'var(--card-bg)',
                border: '1px solid rgba(56, 189, 248, 0.3)',
                borderRadius: '12px',
                padding: '1.75rem',
                marginBottom: '2rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '1.35rem' }}>📜</span>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: 'var(--accent-cyan)' }}>
                  Script cuộc hội thoại &amp; Bản dịch chi tiết (Transcript)
                </h3>
              </div>

              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.25rem', lineHeight: 1.6 }}>
                Đối chiếu nội dung bạn vừa nghe với phụ đề song ngữ bên dưới để nắm chắc cách dùng từ, nối âm và ngữ cảnh giao tiếp.
              </p>

              {contentItem.body?.audio_url && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <ListeningAudioPlayer
                    audioUrl={contentItem.body.audio_url}
                    title="Nghe lại để kiểm tra đối chiếu (Audio Replay)"
                  />
                </div>
              )}

              {contentItem.body?.dialogue && contentItem.body.dialogue.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  {contentItem.body.dialogue.map((line, idx) => {
                    const isDavid = line.speaker.toLowerCase().includes('david');
                    return (
                      <div
                        key={idx}
                        style={{
                          padding: '0.85rem 1.15rem',
                          borderRadius: '8px',
                          background: isDavid ? 'rgba(56, 189, 248, 0.05)' : 'rgba(16, 185, 129, 0.05)',
                          borderLeft: `4px solid ${isDavid ? 'var(--accent-cyan)' : '#34d399'}`,
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                          <span
                            style={{
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              textTransform: 'uppercase',
                              color: isDavid ? 'var(--accent-cyan)' : '#34d399',
                              padding: '0.1rem 0.4rem',
                              borderRadius: '4px',
                              background: isDavid ? 'rgba(56, 189, 248, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                            }}
                          >
                            {line.speaker}
                          </span>
                        </div>
                        <div
                          style={{
                            fontSize: '0.95rem',
                            fontWeight: 600,
                            color: 'var(--text-primary)',
                            marginBottom: '0.2rem',
                          }}
                        >
                          {line.text}
                        </div>
                        {line.translation_vi && (
                          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                            {line.translation_vi}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : contentItem.body?.transcript ? (
                <pre
                  style={{
                    background: 'rgba(0, 0, 0, 0.25)',
                    padding: '1rem',
                    borderRadius: '8px',
                    color: 'var(--text-secondary)',
                    fontSize: '0.9rem',
                    lineHeight: 1.6,
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {contentItem.body.transcript}
                </pre>
              ) : null}
            </div>
          )}

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

                  {/* AI Tutor Section */}
                  <div style={{ marginTop: '0.85rem' }}>
                    {aiTutorExplanations[item.exercise_id] ? (
                      <div
                        style={{
                          padding: '1.25rem',
                          borderRadius: '10px',
                          background: 'rgba(56, 189, 248, 0.05)',
                          border: '1px solid rgba(56, 189, 248, 0.25)',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.75rem',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                            🤖 AI Tutor • Phân tích chuyên sâu
                          </span>
                          <Badge variant="info">Trình độ {contentItem.level.toUpperCase()}</Badge>
                        </div>

                        {/* Explanation */}
                        <div style={{ fontSize: '0.9rem', lineHeight: 1.6, color: 'var(--text-primary)' }}>
                          {aiTutorExplanations[item.exercise_id].explanation}
                        </div>

                        {/* Rule summary */}
                        <div
                          style={{
                            padding: '0.65rem 0.85rem',
                            borderRadius: '6px',
                            background: 'rgba(255, 255, 255, 0.03)',
                            borderLeft: '3px solid #34d399',
                            fontSize: '0.85rem',
                            color: '#e2e8f0',
                            lineHeight: 1.5,
                          }}
                        >
                          📐 <strong>Quy tắc cần nhớ:</strong> {aiTutorExplanations[item.exercise_id].rule_summary}
                        </div>

                        {/* Examples */}
                        {aiTutorExplanations[item.exercise_id].examples?.length > 0 && (
                          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                            <strong style={{ color: 'var(--accent-cyan)' }}>Ví dụ mở rộng:</strong>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', marginTop: '0.35rem' }}>
                              {aiTutorExplanations[item.exercise_id].examples.map((ex, exIdx) => (
                                <div key={exIdx} style={{ paddingLeft: '0.5rem', borderLeft: '2px solid rgba(56, 189, 248, 0.2)' }}>
                                  • {ex}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Next step tip */}
                        <div style={{ fontSize: '0.85rem', color: '#fbbf24', fontStyle: 'italic' }}>
                          💡 <strong>Gợi ý ôn tập:</strong> {aiTutorExplanations[item.exercise_id].next_step_tip}
                        </div>

                        {/* Follow-up question input */}
                        <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem' }}>
                          <input
                            type="text"
                            placeholder="Hỏi thêm AI Tutor về câu này..."
                            value={followUpTexts[item.exercise_id] || ''}
                            onChange={(e) =>
                              setFollowUpTexts((prev) => ({ ...prev, [item.exercise_id]: e.target.value }))
                            }
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && (followUpTexts[item.exercise_id] || '').trim()) {
                                handleAskAITutor(item.exercise_id, (followUpTexts[item.exercise_id] || '').trim());
                              }
                            }}
                            style={{
                              flex: 1,
                              padding: '0.5rem 0.85rem',
                              borderRadius: '6px',
                              background: 'rgba(0, 0, 0, 0.2)',
                              border: '1px solid var(--border-color)',
                              color: 'var(--text-primary)',
                              fontSize: '0.85rem',
                            }}
                          />
                          <button
                            type="button"
                            onClick={() =>
                              handleAskAITutor(item.exercise_id, (followUpTexts[item.exercise_id] || '').trim())
                            }
                            disabled={loadingTutorId === item.exercise_id || !(followUpTexts[item.exercise_id] || '').trim()}
                            className="btn btn-secondary"
                            style={{ padding: '0.4rem 0.85rem', fontSize: '0.85rem' }}
                          >
                            {loadingTutorId === item.exercise_id ? 'Đang gửi...' : 'Hỏi tiếp'}
                          </button>
                        </div>
                      </div>
                    ) : loadingTutorId === item.exercise_id ? (
                      <div
                        style={{
                          padding: '0.85rem 1rem',
                          borderRadius: '8px',
                          background: 'rgba(56, 189, 248, 0.06)',
                          border: '1px dashed rgba(56, 189, 248, 0.3)',
                          fontSize: '0.85rem',
                          color: 'var(--accent-cyan)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                        }}
                      >
                        <span>🤖 AI Tutor đang phân tích câu hỏi theo trình độ {contentItem.level.toUpperCase()}...</span>
                      </div>
                    ) : (
                      <div>
                        {aiTutorErrors[item.exercise_id] && (
                          <div
                            style={{
                              padding: '0.65rem 0.85rem',
                              borderRadius: '6px',
                              background: 'rgba(239, 68, 68, 0.1)',
                              border: '1px solid rgba(239, 68, 68, 0.3)',
                              color: '#f87171',
                              fontSize: '0.85rem',
                              marginBottom: '0.5rem',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                            }}
                          >
                            <span>⚠️ {aiTutorErrors[item.exercise_id]}</span>
                            <button
                              type="button"
                              onClick={() => handleAskAITutor(item.exercise_id)}
                              style={{
                                background: 'none',
                                border: 'none',
                                color: 'var(--accent-cyan)',
                                cursor: 'pointer',
                                textDecoration: 'underline',
                                fontSize: '0.85rem',
                              }}
                            >
                              Thử lại
                            </button>
                          </div>
                        )}

                        <button
                          type="button"
                          onClick={() => handleAskAITutor(item.exercise_id)}
                          style={{
                            background: 'rgba(56, 189, 248, 0.08)',
                            border: '1px solid rgba(56, 189, 248, 0.25)',
                            borderRadius: '8px',
                            padding: '0.55rem 1rem',
                            color: 'var(--accent-cyan)',
                            fontSize: '0.85rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.45rem',
                            transition: 'all 0.15s ease',
                          }}
                        >
                          🤖 Hỏi AI Tutor phân tích sâu hơn câu này
                        </button>
                      </div>
                    )}
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
