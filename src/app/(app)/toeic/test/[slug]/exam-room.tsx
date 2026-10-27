'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { ToeicFormSummary, ClientToeicQuestion, ToeicAttempt } from '@/modules/toeic/types';
import { saveToeicAnswerAction, submitToeicTestAction } from '@/modules/toeic/actions';
import {
  Clock,
  Flag,
  ChevronLeft,
  ChevronRight,
  Headphones,
  BookOpen,
  AlertTriangle,
  CheckCircle2,
  ArrowLeft,
  Send,
  Loader2,
  Layers,
} from 'lucide-react';

interface ExamRoomProps {
  form: ToeicFormSummary;
  questions: ClientToeicQuestion[];
  attempt: ToeicAttempt;
  initialSavedAnswers: Record<string, string>;
  isResumed: boolean;
}

export function ExamRoom({
  form,
  questions,
  attempt,
  initialSavedAnswers,
  isResumed,
}: ExamRoomProps) {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>(initialSavedAnswers);
  const [flagged, setFlagged] = useState<Set<string>>(new Set());
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Audio player speed state
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Time remaining in seconds
  const totalDuration = form.timeLimitMinutes * 60;
  const [timeRemaining, setTimeRemaining] = useState<number>(() => {
    if (attempt.startedAt) {
      const elapsed = Math.floor((Date.now() - new Date(attempt.startedAt).getTime()) / 1000);
      const remaining = totalDuration - elapsed;
      return remaining > 0 ? remaining : 0;
    }
    return totalDuration;
  });

  const currentQuestion = questions[currentIndex];
  const totalQuestions = questions.length;
  const answeredCount = Object.keys(answers).filter((k) => Boolean(answers[k])).length;
  const flaggedCount = flagged.size;

  // Final submission
  const handleFinalSubmit = useCallback(async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setSubmitError(null);

    const timeSpent = totalDuration - timeRemaining;

    try {
      const res = await submitToeicTestAction({
        attemptId: attempt.id,
        timeSpentSeconds: timeSpent,
        answers,
      });

      if (!res.success) {
        setSubmitError(res.error || 'Nộp bài thất bại. Vui lòng thử lại.');
        setIsSubmitting(false);
        return;
      }

      router.push(`/toeic/result/${attempt.id}`);
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : 'Lỗi mạng khi nộp bài.');
      setIsSubmitting(false);
    }
  }, [isSubmitting, totalDuration, timeRemaining, attempt.id, answers, router]);

  // Countdown timer effect
  useEffect(() => {
    if (timeRemaining <= 0) {
      handleFinalSubmit(); // Auto-submit when time expires
      return;
    }

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleFinalSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timeRemaining, handleFinalSubmit]);

  // Handle option select & auto-save
  const handleSelectOption = async (optionId: string) => {
    if (!currentQuestion) return;
    const qId = currentQuestion.id;

    setAnswers((prev) => ({ ...prev, [qId]: optionId }));
    setSaveStatus('saving');

    const res = await saveToeicAnswerAction({
      attemptId: attempt.id,
      questionId: qId,
      selectedOptionId: optionId,
    });

    if (res.success) {
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } else {
      setSaveStatus('error');
    }
  };

  // Toggle flag for review
  const handleToggleFlag = (qId: string) => {
    setFlagged((prev) => {
      const next = new Set(prev);
      if (next.has(qId)) next.delete(qId);
      else next.add(qId);
      return next;
    });
  };

  // Format timer MM:SS or HH:MM:SS
  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) {
      return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const isLowTime = timeRemaining < 300; // < 5 mins

  return (
    <div className="flex flex-col min-h-screen">
      {/* 1. Sticky Top Navigation Bar */}
      <header className="sticky top-0 z-40 border-b border-border/80 bg-background/95 backdrop-blur-md px-4 sm:px-6 py-3 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/toeic"
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
              title="Thoát ra Hub TOEIC"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-foreground line-clamp-1">
                {form.title}
              </h2>
              <div className="text-xs text-muted-foreground flex items-center gap-2">
                <span>Câu {currentIndex + 1} / {totalQuestions}</span>
                {isResumed && <span className="text-sky-400 font-medium">(Đang tiếp tục bài thi)</span>}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-6">
            {/* Countdown Timer */}
            <div
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg font-mono font-bold text-sm border shadow-inner ${
                isLowTime
                  ? 'bg-rose-500/10 text-rose-400 border-rose-500/30 animate-pulse'
                  : 'bg-muted/80 text-foreground border-border/80'
              }`}
            >
              <Clock className="w-4 h-4 text-sky-400" />
              <span>{formatTime(timeRemaining)}</span>
            </div>

            {/* Submit Button */}
            <button
              onClick={() => setShowSubmitModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-sm shadow-md transition-all active:scale-95"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Nộp bài</span>
            </button>
          </div>
        </div>
      </header>

      {/* 2. Main Exam Body */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left / Center Column: Question Detail Area */}
        <div className="lg:col-span-8 flex flex-col justify-between space-y-6">
          <div className="space-y-6">
            {/* Part Header & Instructions */}
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-sky-500/10 text-sky-400 border border-sky-500/20">
                  Part {currentQuestion?.partNumber}
                </span>
                <span className="text-xs text-muted-foreground font-medium">
                  {currentQuestion?.section === 'listening' ? 'Listening Comprehension' : 'Reading Comprehension'}
                </span>
              </div>

              {/* Auto-save status indicator */}
              <div className="text-xs flex items-center gap-1.5">
                {saveStatus === 'saving' && <span className="text-muted-foreground animate-pulse">Đang lưu...</span>}
                {saveStatus === 'saved' && <span className="text-emerald-400 flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Đã lưu</span>}
                {saveStatus === 'error' && <span className="text-rose-400">Lỗi lưu câu hỏi</span>}
              </div>
            </div>

            {/* Listening Section: Audio Player */}
            {currentQuestion?.audioUrl && (
              <div className="rounded-xl border border-sky-500/30 bg-sky-500/5 p-4 space-y-3 shadow-sm">
                <div className="flex items-center justify-between text-xs text-sky-400 font-semibold">
                  <span className="flex items-center gap-1.5">
                    <Headphones className="w-4 h-4" />
                    Audio Đoạn nghe Part {currentQuestion.partNumber}
                  </span>
                  <div className="flex items-center gap-1">
                    <span className="text-muted-foreground mr-1">Tốc độ:</span>
                    {[0.8, 1.0, 1.2].map((rate) => (
                      <button
                        key={rate}
                        onClick={() => {
                          setPlaybackRate(rate);
                          if (audioRef.current) audioRef.current.playbackRate = rate;
                        }}
                        className={`px-2 py-0.5 rounded text-xs transition-colors ${
                          playbackRate === rate ? 'bg-sky-500 text-slate-950 font-bold' : 'bg-muted/60 text-muted-foreground hover:bg-muted'
                        }`}
                      >
                        {rate}x
                      </button>
                    ))}
                  </div>
                </div>

                <audio
                  ref={audioRef}
                  controls
                  src={currentQuestion.audioUrl}
                  className="w-full h-10 accent-sky-500 rounded"
                />
              </div>
            )}

            {/* Part 1 Photograph Display */}
            {currentQuestion?.imageUrl && (
              <div className="rounded-xl border border-border/80 bg-card/60 p-4 flex flex-col items-center justify-center shadow-md">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={currentQuestion.imageUrl}
                  alt={`Part 1 Photo for Question ${currentQuestion.questionNumber}`}
                  className="max-h-80 w-auto rounded-lg shadow-sm border border-border/60"
                />
                <span className="text-xs text-muted-foreground mt-2 font-mono">
                  Photograph for Question #{currentQuestion.questionNumber}
                </span>
              </div>
            )}

            {/* Reading Context Passage (Parts 6 & 7) */}
            {currentQuestion?.contextText && (
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-5 space-y-2 shadow-sm">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
                  <BookOpen className="w-4 h-4" />
                  Văn bản đọc hiểu (Reading Passage)
                </div>
                <div className="text-sm text-foreground/90 font-mono whitespace-pre-wrap leading-relaxed bg-background/50 p-4 rounded-lg border border-border/50">
                  {currentQuestion.contextText}
                </div>
              </div>
            )}

            {/* Question Prompt */}
            <div className="space-y-4">
              <div className="text-base sm:text-lg font-bold text-foreground leading-relaxed">
                <span className="text-sky-400 font-mono mr-2">#{currentQuestion?.questionNumber}.</span>
                {currentQuestion?.prompt}
              </div>

              {/* Options Radio List */}
              <div className="space-y-2.5">
                {currentQuestion?.options.map((option) => {
                  const isSelected = answers[currentQuestion.id] === option.id;
                  return (
                    <button
                      key={option.id}
                      onClick={() => handleSelectOption(option.id)}
                      className={`w-full text-left p-4 rounded-xl border transition-all flex items-start gap-3.5 ${
                        isSelected
                          ? 'border-sky-500 bg-sky-500/10 shadow-sm ring-1 ring-sky-500/50'
                          : 'border-border/80 bg-card hover:bg-muted/50 hover:border-border'
                      }`}
                    >
                      <span
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 border ${
                          isSelected
                            ? 'bg-sky-500 text-slate-950 border-sky-500'
                            : 'border-muted-foreground/40 text-muted-foreground'
                        }`}
                      >
                        {option.id}
                      </span>
                      <span className={`text-sm sm:text-base leading-relaxed ${isSelected ? 'text-foreground font-semibold' : 'text-foreground/90'}`}>
                        {option.text}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Bottom Bar: Action Buttons */}
          <div className="pt-6 border-t border-border/60 flex items-center justify-between gap-4">
            <button
              onClick={() => handleToggleFlag(currentQuestion.id)}
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold border transition-all ${
                flagged.has(currentQuestion?.id)
                  ? 'border-amber-500/50 bg-amber-500/10 text-amber-400'
                  : 'border-border/80 bg-card text-muted-foreground hover:bg-muted'
              }`}
            >
              <Flag className="w-4 h-4" />
              {flagged.has(currentQuestion?.id) ? 'Đã đánh dấu xem lại' : 'Đánh dấu xem lại'}
            </button>

            <div className="flex items-center gap-2">
              <button
                disabled={currentIndex === 0}
                onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                className="inline-flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium border border-border/80 bg-card hover:bg-muted disabled:opacity-40 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                Câu trước
              </button>
              <button
                disabled={currentIndex === totalQuestions - 1}
                onClick={() => setCurrentIndex((prev) => Math.min(totalQuestions - 1, prev + 1))}
                className="inline-flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40 transition-colors"
              >
                Câu tiếp
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: 200 Question Palette Grid */}
        <aside className="lg:col-span-4 rounded-xl border border-border/80 bg-card p-4 sm:p-5 flex flex-col justify-between space-y-4 shadow-sm max-h-[calc(100vh-140px)] sticky top-24">
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-border/60">
              <div className="flex items-center gap-2 font-bold text-sm text-foreground">
                <Layers className="w-4 h-4 text-sky-400" />
                Bảng Câu Hỏi ({totalQuestions})
              </div>
              <div className="text-xs text-muted-foreground font-mono">
                {answeredCount}/{totalQuestions} đã làm
              </div>
            </div>

            {/* Status Legend */}
            <div className="grid grid-cols-3 gap-2 text-[11px] text-muted-foreground pb-2">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-sky-500" />
                <span>Đã làm ({answeredCount})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded border border-amber-500 bg-amber-500/20" />
                <span>Đánh dấu ({flaggedCount})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded border border-border/80 bg-muted/30" />
                <span>Chưa làm ({totalQuestions - answeredCount})</span>
              </div>
            </div>

            {/* Scrollable Question Number Grid */}
            <div className="overflow-y-auto max-h-[50vh] pr-1 space-y-4">
              {/* Group by Part */}
              {[1, 2, 3, 4, 5, 6, 7].map((partNum) => {
                const partQuestions = questions.filter((q) => q.partNumber === partNum);
                if (partQuestions.length === 0) return null;

                return (
                  <div key={partNum} className="space-y-1.5">
                    <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                      Part {partNum} ({partQuestions[0].questionNumber} - {partQuestions[partQuestions.length - 1].questionNumber})
                    </div>
                    <div className="grid grid-cols-5 sm:grid-cols-6 gap-1.5">
                      {partQuestions.map((q) => {
                        const globalIndex = questions.findIndex((item) => item.id === q.id);
                        const isCurrent = globalIndex === currentIndex;
                        const isAnswered = Boolean(answers[q.id]);
                        const isFlagged = flagged.has(q.id);

                        let btnClass = 'border-border/80 bg-muted/20 text-muted-foreground hover:bg-muted';
                        if (isCurrent) {
                          btnClass = 'ring-2 ring-primary border-primary font-bold text-foreground';
                        }
                        if (isAnswered) {
                          btnClass = isCurrent
                            ? 'bg-sky-500 text-slate-950 ring-2 ring-sky-400 font-bold'
                            : 'bg-sky-500/20 text-sky-400 border-sky-500/40 font-semibold';
                        }
                        if (isFlagged) {
                          btnClass = `${btnClass} border-amber-500 text-amber-400 font-bold`;
                        }

                        return (
                          <button
                            key={q.id}
                            onClick={() => setCurrentIndex(globalIndex)}
                            className={`h-8 rounded text-xs font-mono transition-all relative flex items-center justify-center border ${btnClass}`}
                            title={`Chuyển tới câu ${q.questionNumber}`}
                          >
                            {q.questionNumber}
                            {isFlagged && (
                              <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-amber-400" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-3 border-t border-border/60">
            <button
              onClick={() => setShowSubmitModal(true)}
              className="w-full py-2.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              Hoàn thành & Nộp bài
            </button>
          </div>
        </aside>
      </div>

      {/* 3. Submit Confirmation Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in-50">
          <div className="bg-card border border-border/80 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">Xác nhận nộp bài thi</h3>
                <p className="text-xs text-muted-foreground">Sau khi nộp, bạn sẽ nhận được bảng điểm chi tiết.</p>
              </div>
            </div>

            <div className="rounded-xl bg-muted/40 p-4 space-y-2 border border-border/60 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Số câu đã trả lời:</span>
                <span className="font-bold text-foreground">{answeredCount} / {totalQuestions}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Số câu chưa trả lời:</span>
                <span className={`font-bold ${totalQuestions - answeredCount > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {totalQuestions - answeredCount} câu
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Số câu đánh dấu xem lại:</span>
                <span className="font-bold text-amber-400">{flaggedCount} câu</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-border/40">
                <span className="text-muted-foreground">Thời gian còn lại:</span>
                <span className="font-mono font-bold text-sky-400">{formatTime(timeRemaining)}</span>
              </div>
            </div>

            {submitError && (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400">
                {submitError}
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                disabled={isSubmitting}
                onClick={() => setShowSubmitModal(false)}
                className="px-4 py-2 rounded-lg text-sm font-medium border border-border/80 bg-card hover:bg-muted transition-colors disabled:opacity-50"
              >
                Tiếp tục làm bài
              </button>
              <button
                disabled={isSubmitting}
                onClick={() => handleFinalSubmit()}
                className="px-5 py-2 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-sm shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Đang chấm điểm...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Xác nhận nộp
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ExamRoom;
