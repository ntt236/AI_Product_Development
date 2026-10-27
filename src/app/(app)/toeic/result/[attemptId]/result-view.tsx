'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import type { ToeicResultView, ToeicDetailedAnswerReview } from '@/modules/toeic/types';
import { askToeicAiTutorAction } from '@/modules/toeic/actions';
import {
  Award,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Clock,
  Headphones,
  BookOpen,
  ArrowRight,
  Sparkles,
  Info,
  TrendingUp,
  AlertTriangle,
  Send,
  Loader2,
  Bot,
  RefreshCw,
} from 'lucide-react';

interface ResultViewProps {
  resultView: ToeicResultView;
}

export function ResultView({ resultView }: ResultViewProps) {
  const { attempt, form, reviews, analysis, disclaimer } = resultView;

  // Filter state for reviews
  const [statusFilter, setStatusFilter] = useState<'all' | 'incorrect' | 'correct'>('all');
  const [partFilter, setPartFilter] = useState<number | 'all'>('all');

  // AI Tutor interactive questions state: questionId -> { open: boolean, query: string, loading: boolean, response: string | null }
  const [aiChats, setAiChats] = useState<
    Record<
      string,
      {
        open: boolean;
        query: string;
        loading: boolean;
        response: string | null;
      }
    >
  >({});

  const totalQuestions = reviews.length;
  const correctCount = reviews.filter((r) => r.isCorrect).length;
  const incorrectCount = totalQuestions - correctCount;
  const accuracy = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

  const filteredReviews = reviews.filter((r) => {
    if (statusFilter === 'correct' && !r.isCorrect) return false;
    if (statusFilter === 'incorrect' && r.isCorrect) return false;
    if (partFilter !== 'all' && r.partNumber !== partFilter) return false;
    return true;
  });

  const toggleAiChat = (qId: string) => {
    setAiChats((prev) => ({
      ...prev,
      [qId]: {
        open: !prev[qId]?.open,
        query: prev[qId]?.query || 'Tại sao đáp án của tôi lại sai và phương án đúng có dấu hiệu nhận biết nào?',
        loading: false,
        response: prev[qId]?.response || null,
      },
    }));
  };

  const handleAskAiTutor = async (review: ToeicDetailedAnswerReview) => {
    const qId = review.questionId;
    const currentChat = aiChats[qId];
    const userPrompt = currentChat?.query?.trim() || 'Giải thích chi tiết bẫy câu này giúp tôi.';

    setAiChats((prev) => ({
      ...prev,
      [qId]: { ...prev[qId], loading: true, response: null },
    }));

    const res = await askToeicAiTutorAction({
      questionNumber: review.questionNumber,
      partNumber: review.partNumber,
      prompt: review.prompt,
      contextText: review.contextText,
      transcriptText: review.transcriptText,
      options: review.options,
      selectedOptionId: review.selectedOptionId,
      correctOptionId: review.correctOptionId,
      officialExplanation: review.explanation,
      userPrompt,
    });

    setAiChats((prev) => ({
      ...prev,
      [qId]: {
        ...prev[qId],
        loading: false,
        response: res.success ? (res.explanation || 'Không có phản hồi') : 'Gia sư AI hiện chưa thể phản hồi. Vui lòng thử lại sau.',
      },
    }));
  };

  const formatMinutes = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m} phút ${s > 0 ? `${s} giây` : ''}`;
  };

  return (
    <div className="space-y-8 animate-in fade-in-50 duration-300">
      {/* 1. Hero Scorecard Card */}
      <div className="relative overflow-hidden rounded-2xl border border-border/80 bg-gradient-to-br from-card via-card/90 to-background p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-sky-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="space-y-3 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <Award className="w-3.5 h-3.5" />
              <span>Bảng Điểm TOEIC Ước Tính</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
              {form.title}
            </h1>
            <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-muted-foreground pt-1">
              <span className="flex items-center gap-1.5 font-medium">
                <Clock className="w-4 h-4 text-sky-400" />
                Thời gian làm bài: {formatMinutes(attempt.timeSpentSeconds)}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                {correctCount} / {totalQuestions} câu đúng ({accuracy}%)
              </span>
            </div>
          </div>

          {/* Scaled Score Showcase */}
          <div className="flex items-center justify-center">
            <div className="flex flex-col items-center justify-center p-6 sm:p-8 rounded-2xl bg-background/80 border border-sky-500/30 shadow-xl min-w-[240px] text-center">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Tổng Điểm Dự Phóng (Scaled Score)
              </span>
              <div className="text-5xl sm:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-cyan-300 my-2">
                {attempt.estimatedTotalScore}
              </div>
              <span className="text-xs text-muted-foreground font-mono">Thang điểm ETS: 10 – 990</span>

              {/* Listening & Reading breakdown */}
              <div className="grid grid-cols-2 gap-4 w-full pt-4 mt-4 border-t border-border/60">
                <div className="space-y-0.5">
                  <div className="text-[11px] text-muted-foreground flex items-center justify-center gap-1">
                    <Headphones className="w-3 h-3 text-sky-400" />
                    Listening
                  </div>
                  <div className="text-lg font-black text-sky-400">
                    {attempt.estimatedListeningScore}
                    <span className="text-[10px] text-muted-foreground font-normal">/495</span>
                  </div>
                  <div className="text-[10px] text-muted-foreground">({attempt.listeningRawScore}/100 câu)</div>
                </div>

                <div className="space-y-0.5 border-l border-border/60">
                  <div className="text-[11px] text-muted-foreground flex items-center justify-center gap-1">
                    <BookOpen className="w-3 h-3 text-emerald-400" />
                    Reading
                  </div>
                  <div className="text-lg font-black text-emerald-400">
                    {attempt.estimatedReadingScore}
                    <span className="text-[10px] text-muted-foreground font-normal">/495</span>
                  </div>
                  <div className="text-[10px] text-muted-foreground">({attempt.readingRawScore}/100 câu)</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Legal Disclaimer */}
      <div className="rounded-xl border border-sky-500/20 bg-sky-500/5 p-4 text-xs text-muted-foreground flex items-start gap-3 shadow-sm">
        <Info className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
        <div className="space-y-1 leading-relaxed">
          <span className="font-semibold text-sky-300">Tuyên bố phương pháp quy đổi điểm:</span> {disclaimer}
        </div>
      </div>

      {/* 3. Part-by-Part Score Breakdown */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-lg font-bold text-foreground">
          <TrendingUp className="w-5 h-5 text-sky-400" />
          Phân Tích Chi Tiết Từng Part (Part 1–7)
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.values(attempt.partScores).map((part) => {
            const isHigh = part.accuracy >= 70;
            const isMid = part.accuracy >= 50 && part.accuracy < 70;

            return (
              <div
                key={part.partNumber}
                className="rounded-xl border border-border/80 bg-card p-4 space-y-3 shadow-sm hover:border-border transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Part {part.partNumber}
                  </span>
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      isHigh
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : isMid
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    }`}
                  >
                    {part.accuracy}%
                  </span>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-foreground line-clamp-1">{part.partName}</h4>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    Đúng {part.correct} / {part.total} câu
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2 rounded-full bg-muted/60 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      isHigh ? 'bg-emerald-400' : isMid ? 'bg-amber-400' : 'bg-rose-400'
                    }`}
                    style={{ width: `${part.accuracy}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. AI Tutor Weakness Analysis & Targeted Plan */}
      <div className="rounded-2xl border border-purple-500/30 bg-purple-500/5 p-6 sm:p-8 space-y-6 shadow-md">
        <div className="flex items-center gap-3 border-b border-purple-500/20 pb-4">
          <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
              Chẩn Đoán Sư Phạm & Lộ Trình Khắc Phục Điểm Yếu
              <Sparkles className="w-4 h-4 text-purple-400" />
            </h3>
            <p className="text-xs text-muted-foreground">
              Phân tích chuyên sâu từ AI Tutor dựa trên dữ liệu làm bài thực tế của bạn
            </p>
          </div>
        </div>

        {/* Diagnosis text */}
        <div className="rounded-xl bg-background/50 border border-border/50 p-4 text-sm sm:text-base text-foreground/90 leading-relaxed font-sans">
          {analysis.overallDiagnosis}
        </div>

        {/* Strong vs Weak highlights */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4 space-y-2">
            <div className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 uppercase">
              <CheckCircle2 className="w-4 h-4" />
              Điểm Mạnh Nổi Bật (Strongest Parts)
            </div>
            <ul className="text-xs sm:text-sm text-foreground/80 space-y-1 list-disc list-inside">
              {analysis.strongestParts.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl border border-rose-500/30 bg-rose-500/5 p-4 space-y-2">
            <div className="text-xs font-bold text-rose-400 flex items-center gap-1.5 uppercase">
              <AlertTriangle className="w-4 h-4" />
              Phần Yếu Cần Cải Thiện (Weakest Parts)
            </div>
            <ul className="text-xs sm:text-sm text-foreground/80 space-y-1 list-disc list-inside">
              {analysis.weakestParts.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Targeted action items */}
        <div className="space-y-2">
          <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Kế Hoạch Hành Động Đề Xuất (Targeted Action Plan):
          </div>
          <div className="space-y-2">
            {analysis.targetedActionPlan.map((action, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 p-3 rounded-lg bg-background/40 border border-border/50 text-xs sm:text-sm text-foreground/90"
              >
                <span className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <span className="leading-relaxed">{action}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recommended General English Modules (Integration without overwrite) */}
        {analysis.recommendedGeneralEnglishTopics.length > 0 && (
          <div className="pt-2 border-t border-purple-500/20 space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Bài Học Tiếng Anh Tổng Quát Nên Bổ Trợ:
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {analysis.recommendedGeneralEnglishTopics.map((topic, i) => (
                <Link
                  key={i}
                  href={topic.href}
                  className="group flex flex-col justify-between p-3.5 rounded-lg border border-border/80 bg-background/60 hover:border-purple-500/50 hover:bg-purple-500/5 transition-all"
                >
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase text-purple-400 font-mono">
                      {topic.skill}
                    </span>
                    <h5 className="text-xs font-bold text-foreground group-hover:text-purple-300 transition-colors line-clamp-2">
                      {topic.title}
                    </h5>
                  </div>
                  <div className="pt-3 flex items-center justify-end text-xs text-muted-foreground group-hover:text-purple-300 font-medium">
                    Học ngay <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 5. Detailed Question Review Section */}
      <div className="space-y-6 pt-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-4">
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-sky-400" />
              Xem Lại Toàn Bộ Câu Hỏi & Giải Thích Chi Tiết
            </h3>
            <p className="text-xs text-muted-foreground">
              Đối chiếu đáp án của bạn với lời giải chuẩn và hỏi trực tiếp AI Tutor khi có bẫy khó hiểu.
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Status Filter */}
            <div className="flex rounded-lg border border-border/80 bg-muted/40 p-0.5 text-xs font-medium">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1 rounded-md transition-all ${
                  statusFilter === 'all' ? 'bg-primary text-primary-foreground font-bold shadow-sm' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Tất cả ({totalQuestions})
              </button>
              <button
                onClick={() => setStatusFilter('incorrect')}
                className={`px-3 py-1 rounded-md transition-all ${
                  statusFilter === 'incorrect' ? 'bg-rose-500 text-white font-bold shadow-sm' : 'text-muted-foreground hover:text-rose-400'
                }`}
              >
                Câu sai ({incorrectCount})
              </button>
              <button
                onClick={() => setStatusFilter('correct')}
                className={`px-3 py-1 rounded-md transition-all ${
                  statusFilter === 'correct' ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm' : 'text-muted-foreground hover:text-emerald-400'
                }`}
              >
                Câu đúng ({correctCount})
              </button>
            </div>

            {/* Part Dropdown Filter */}
            <select
              value={partFilter}
              onChange={(e) => setPartFilter(e.target.value === 'all' ? 'all' : parseInt(e.target.value, 10))}
              className="text-xs rounded-lg border border-border/80 bg-card px-3 py-1.5 text-foreground font-medium focus:ring-1 focus:ring-primary focus:outline-none"
            >
              <option value="all">Tất cả Part</option>
              {[1, 2, 3, 4, 5, 6, 7].map((p) => (
                <option key={p} value={p}>Part {p}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Questions Review List */}
        <div className="space-y-6">
          {filteredReviews.length === 0 ? (
            <div className="text-center py-12 text-sm text-muted-foreground bg-muted/20 rounded-xl border border-border/60">
              Không có câu hỏi nào phù hợp với bộ lọc hiện tại.
            </div>
          ) : (
            filteredReviews.map((review) => {
              const chatState = aiChats[review.questionId] || {
                open: false,
                query: '',
                loading: false,
                response: null,
              };

              return (
                <div
                  key={review.questionId}
                  className={`rounded-2xl border p-5 sm:p-6 transition-all duration-200 space-y-4 shadow-sm ${
                    review.isCorrect
                      ? 'border-emerald-500/30 bg-emerald-500/5'
                      : 'border-rose-500/30 bg-rose-500/5'
                  }`}
                >
                  {/* Question Header */}
                  <div className="flex items-center justify-between border-b border-border/50 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-muted text-foreground border border-border/60 font-mono">
                        Câu #{review.questionNumber}
                      </span>
                      <span className="text-xs font-medium text-muted-foreground">
                        Part {review.partNumber} ({review.section === 'listening' ? 'Listening' : 'Reading'})
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {review.isCorrect ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Đúng
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-400 bg-rose-500/10 px-2.5 py-1 rounded-full border border-rose-500/20">
                          <XCircle className="w-3.5 h-3.5" /> Sai
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Audio Player if Listening */}
                  {review.audioUrl && (
                    <div className="rounded-lg bg-background/60 border border-sky-500/20 p-3 space-y-1">
                      <div className="text-[11px] text-sky-400 font-semibold flex items-center gap-1">
                        <Headphones className="w-3.5 h-3.5" /> Lời thoại / Audio nghe lại:
                      </div>
                      <audio controls src={review.audioUrl} className="w-full h-8 accent-sky-500" />
                    </div>
                  )}

                  {/* Image if Part 1 */}
                  {review.imageUrl && (
                    <div className="p-2 bg-background/50 rounded-lg flex justify-center">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={review.imageUrl}
                        alt="Question context"
                        className="max-h-56 rounded border border-border/60"
                      />
                    </div>
                  )}

                  {/* Reading Context Passage if available */}
                  {review.contextText && (
                    <div className="rounded-lg bg-background/60 border border-border/50 p-3 text-xs font-mono whitespace-pre-wrap leading-relaxed text-muted-foreground">
                      {review.contextText}
                    </div>
                  )}

                  {/* Question Prompt */}
                  <div className="text-sm sm:text-base font-semibold text-foreground">
                    {review.prompt}
                  </div>

                  {/* Options List */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm">
                    {review.options.map((opt) => {
                      const isSelected = review.selectedOptionId === opt.id;
                      const isCorrectAnswer = review.correctOptionId === opt.id;

                      let optClass = 'border-border/60 bg-background/40 text-muted-foreground';
                      if (isCorrectAnswer) {
                        optClass = 'border-emerald-500/60 bg-emerald-500/15 text-emerald-300 font-bold ring-1 ring-emerald-500/40';
                      } else if (isSelected && !review.isCorrect) {
                        optClass = 'border-rose-500/60 bg-rose-500/15 text-rose-300 font-medium line-through';
                      }

                      return (
                        <div
                          key={opt.id}
                          className={`p-3 rounded-xl border flex items-center justify-between gap-2 ${optClass}`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-bold">{opt.id}.</span>
                            <span>{opt.text}</span>
                          </div>
                          {isCorrectAnswer && (
                            <span className="text-[10px] uppercase font-bold text-emerald-400 shrink-0">
                              (Đáp án đúng)
                            </span>
                          )}
                          {isSelected && !review.isCorrect && (
                            <span className="text-[10px] uppercase font-bold text-rose-400 shrink-0">
                              (Bạn chọn)
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Official Vietnamese Explanation Box */}
                  <div className="rounded-xl bg-background/70 border border-border/70 p-4 space-y-1.5 text-xs sm:text-sm">
                    <div className="text-xs font-bold text-sky-400 flex items-center gap-1.5 uppercase">
                      <HelpCircle className="w-3.5 h-3.5" />
                      Giải Thích Chi Tiết:
                    </div>
                    <p className="text-foreground/90 leading-relaxed">
                      {review.explanation}
                    </p>
                  </div>

                  {/* Ask AI Tutor Section */}
                  <div className="pt-2">
                    {!chatState.open ? (
                      <button
                        onClick={() => toggleAiChat(review.questionId)}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-400 hover:text-purple-300 transition-colors"
                      >
                        <Bot className="w-4 h-4" />
                        Hỏi AI Tutor đào sâu câu này
                      </button>
                    ) : (
                      <div className="rounded-xl border border-purple-500/30 bg-purple-500/10 p-4 space-y-3 animate-in fade-in-50">
                        <div className="flex items-center justify-between">
                          <div className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
                            <Bot className="w-4 h-4" />
                            Gia Sư AI Giải Thích Trực Tiếp
                          </div>
                          <button
                            onClick={() => toggleAiChat(review.questionId)}
                            className="text-xs text-muted-foreground hover:text-foreground"
                          >
                            Đóng
                          </button>
                        </div>

                        {/* Prompt Input */}
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={chatState.query}
                            onChange={(e) =>
                              setAiChats((prev) => ({
                                ...prev,
                                [review.questionId]: { ...prev[review.questionId], query: e.target.value },
                              }))
                            }
                            placeholder="Nhập thắc mắc của bạn về câu này..."
                            className="flex-1 rounded-lg border border-border/80 bg-background px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-purple-400"
                          />
                          <button
                            disabled={chatState.loading}
                            onClick={() => handleAskAiTutor(review)}
                            className="px-3 py-2 rounded-lg bg-purple-500 hover:bg-purple-400 text-white text-xs font-bold shadow transition-all flex items-center gap-1 disabled:opacity-50"
                          >
                            {chatState.loading ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Send className="w-3.5 h-3.5" />
                            )}
                            Gửi
                          </button>
                        </div>

                        {/* AI Tutor Response Display */}
                        {chatState.response && (
                          <div className="rounded-lg bg-background/80 border border-purple-500/20 p-3.5 text-xs text-foreground/90 whitespace-pre-wrap leading-relaxed">
                            {chatState.response}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 6. Footer Actions */}
      <div className="pt-6 border-t border-border/60 flex flex-wrap items-center justify-between gap-4">
        <Link
          href="/toeic"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-border/80 bg-card hover:bg-muted text-sm font-semibold transition-colors"
        >
          <ArrowRight className="w-4 h-4 rotate-180" />
          Quay lại danh mục đề thi
        </Link>

        <Link
          href={`/toeic/test/${form.slug}`}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 text-sm font-bold shadow-md transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Làm lại bài thi này
        </Link>
      </div>
    </div>
  );
}
