'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import type { ToeicFormSummary } from '@/modules/toeic/types';
import {
  Award,
  Clock,
  HelpCircle,
  Headphones,
  BookOpen,
  ArrowRight,
  TrendingUp,
  Zap,
  Layers,
  Sparkles,
  Info,
} from 'lucide-react';

interface ToeicHubViewProps {
  forms: ToeicFormSummary[];
  targetScore: number;
  latestAttempt: {
    id: string;
    score: number;
    submittedAt: string;
    metadata: Record<string, unknown>;
  } | null;
}

export function ToeicHubView({ forms, targetScore, latestAttempt }: ToeicHubViewProps) {
  const [filter, setFilter] = useState<'all' | 'mock' | 'parts'>('all');

  const fullTests = forms.filter((f) => f.testType === 'full_test');
  const miniTests = forms.filter((f) => f.testType === 'mini_test');
  const partPractices = forms.filter((f) => f.testType === 'part_practice').sort((a, b) => (a.targetPart || 0) - (b.targetPart || 0));

  const filteredForms = forms.filter((f) => {
    if (filter === 'mock') return f.testType === 'full_test' || f.testType === 'mini_test';
    if (filter === 'parts') return f.testType === 'part_practice';
    return true;
  });

  const getPartDetails = (partNum: number | null | undefined) => {
    switch (partNum) {
      case 1:
        return {
          title: 'Part 1: Photographs',
          section: 'Listening',
          icon: Headphones,
          color: 'text-sky-400 bg-sky-500/10 border-sky-500/20',
          desc: 'Quan sát hình ảnh và nghe 4 câu miêu tả để chọn câu mô tả đúng nhất.',
        };
      case 2:
        return {
          title: 'Part 2: Question-Response',
          section: 'Listening',
          icon: Headphones,
          color: 'text-sky-400 bg-sky-500/10 border-sky-500/20',
          desc: 'Nghe 1 câu hỏi hoặc phát biểu và chọn câu hồi đáp phù hợp nhất trong 3 lựa chọn.',
        };
      case 3:
        return {
          title: 'Part 3: Short Conversations',
          section: 'Listening',
          icon: Headphones,
          color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
          desc: 'Lắng nghe các đoạn đối thoại giữa 2–3 người và trả lời các câu hỏi liên quan.',
        };
      case 4:
        return {
          title: 'Part 4: Short Talks',
          section: 'Listening',
          icon: Headphones,
          color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
          desc: 'Nghe các bài phát biểu, thông báo ngắn tại sân bay/công sở và trả lời câu hỏi.',
        };
      case 5:
        return {
          title: 'Part 5: Incomplete Sentences',
          section: 'Reading',
          icon: BookOpen,
          color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
          desc: 'Điền từ thích hợp vào chỗ trống để kiểm tra ngữ pháp và từ vựng công sở.',
        };
      case 6:
        return {
          title: 'Part 6: Text Completion',
          section: 'Reading',
          icon: BookOpen,
          color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
          desc: 'Hoàn thành các chỗ trống trong đoạn văn bản gồm từ loại và câu phù hợp ngữ cảnh.',
        };
      case 7:
        return {
          title: 'Part 7: Reading Comprehension',
          section: 'Reading',
          icon: BookOpen,
          color: 'text-teal-400 bg-teal-500/10 border-teal-500/20',
          desc: 'Đọc hiểu văn bản đơn, email thông báo và văn bản kép/ba đoạn trích thực tế.',
        };
      default:
        return {
          title: 'TOEIC Practice',
          section: 'General',
          icon: Award,
          color: 'text-primary bg-primary/10 border-primary/20',
          desc: 'Luyện tập đề thi chuẩn format.',
        };
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in-50 duration-300">
      {/* 1. Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-border/80 bg-gradient-to-r from-card via-card/90 to-background p-6 sm:p-8 shadow-xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-sky-500/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Phase 8 — TOEIC Preparation</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
              Luyện thi TOEIC & Thi thử ETS 10–990
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              Mô phỏng chân thực bài thi TOEIC 120 phút (200 câu), chế độ luyện tập 7 Part chuyên sâu, lưu bài tự động, chấm điểm server bảo mật và phân tích điểm yếu bằng AI Tutor.
            </p>
          </div>

          {/* Target Score Card */}
          <div className="flex flex-row md:flex-col items-center justify-between sm:justify-start gap-4 p-4 sm:p-5 rounded-xl bg-background/60 border border-border/80 shadow-md min-w-[220px]">
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground flex items-center gap-1.5 font-medium">
                <TrendingUp className="w-4 h-4 text-sky-400" />
                Mục tiêu điểm số
              </div>
              <div className="text-2xl sm:text-3xl font-black text-foreground">
                {targetScore} <span className="text-xs font-normal text-muted-foreground">/ 990</span>
              </div>
            </div>

            {latestAttempt && (
              <div className="border-l md:border-l-0 md:border-t border-border/60 pl-4 md:pl-0 md:pt-3 space-y-1">
                <div className="text-xs text-muted-foreground font-medium">Điểm thi gần nhất</div>
                <div className="text-lg font-bold text-sky-400 flex items-center gap-2">
                  {latestAttempt.score} điểm
                  <Link
                    href={`/toeic/result/${latestAttempt.id}`}
                    className="text-xs text-sky-400/80 hover:text-sky-300 underline font-normal"
                  >
                    Xem lại
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. Legal Disclaimer Alert */}
      <div className="rounded-xl border border-sky-500/20 bg-sky-500/5 p-4 text-xs text-muted-foreground flex items-start gap-3">
        <Info className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
        <div className="space-y-1 leading-relaxed">
          <span className="font-semibold text-sky-300">Tuyên bố phương pháp quy đổi điểm:</span> Kết quả điểm số trên EngRise là điểm ước tính dựa trên thang đối chiếu chuẩn ETS (10–990), phục vụ đánh giá năng lực và cá nhân hóa lộ trình học tập nội bộ. EngRise không tuyên bố đây là chứng chỉ TOEIC® chính thức do ETS hoặc IIG cấp.
        </div>
      </div>

      {/* 3. Section Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/60 pb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filter === 'all'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
          >
            Tất cả ({forms.length})
          </button>
          <button
            onClick={() => setFilter('mock')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filter === 'mock'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
          >
            Thi thử Full & Mini ({fullTests.length + miniTests.length})
          </button>
          <button
            onClick={() => setFilter('parts')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filter === 'parts'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
          >
            Luyện tập 7 Part ({partPractices.length})
          </button>
        </div>

        <div className="text-xs text-muted-foreground">
          Đang hiển thị <span className="font-semibold text-foreground">{filteredForms.length}</span> bộ đề & bài tập
        </div>
      </div>

      {/* 4. MOCK TESTS SECTION (Full & Mini) */}
      {(filter === 'all' || filter === 'mock') && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-lg font-bold text-foreground">
            <Zap className="w-5 h-5 text-amber-400" />
            Đề Thi Thử TOEIC (Mock Test)
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Full Practice Test 01 */}
            {fullTests.map((test) => (
              <div
                key={test.id}
                className="group relative flex flex-col justify-between rounded-xl border border-border/80 bg-card p-6 shadow-md hover:border-sky-500/50 hover:shadow-lg transition-all duration-300"
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20 font-medium">
                      Mô phỏng 100% đề thi thật
                    </Badge>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
                      <Clock className="w-4 h-4 text-sky-400" />
                      {test.timeLimitMinutes} phút
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-foreground group-hover:text-sky-400 transition-colors">
                      {test.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                      {test.description}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-2">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-muted/60 text-xs text-muted-foreground font-medium">
                      <HelpCircle className="w-3.5 h-3.5 text-sky-400" />
                      {test.totalQuestions} câu hỏi
                    </span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-muted/60 text-xs text-muted-foreground font-medium">
                      <Headphones className="w-3.5 h-3.5 text-sky-400" />
                      Listening 100 câu
                    </span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-muted/60 text-xs text-muted-foreground font-medium">
                      <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
                      Reading 100 câu
                    </span>
                  </div>
                </div>

                <div className="pt-6 mt-4 border-t border-border/60 flex items-center justify-between">
                  <div className="text-xs text-muted-foreground">Thang điểm: 10 – 990</div>
                  <Link
                    href={`/toeic/test/${test.slug}`}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold text-sm shadow-md transition-all group-hover:translate-x-0.5"
                  >
                    Vào phòng thi 120 phút
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}

            {/* Mini Test 01 */}
            {miniTests.map((test) => (
              <div
                key={test.id}
                className="group relative flex flex-col justify-between rounded-xl border border-border/80 bg-card p-6 shadow-md hover:border-emerald-500/50 hover:shadow-lg transition-all duration-300"
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 font-medium">
                      Đánh giá nhanh 30 phút
                    </Badge>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
                      <Clock className="w-4 h-4 text-emerald-400" />
                      {test.timeLimitMinutes} phút
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-foreground group-hover:text-emerald-400 transition-colors">
                      {test.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                      {test.description}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-2">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-muted/60 text-xs text-muted-foreground font-medium">
                      <HelpCircle className="w-3.5 h-3.5 text-emerald-400" />
                      {test.totalQuestions} câu hỏi
                    </span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-muted/60 text-xs text-muted-foreground font-medium">
                      <Layers className="w-3.5 h-3.5 text-emerald-400" />
                      Đủ 7 Part từ Part 1 đến 7
                    </span>
                  </div>
                </div>

                <div className="pt-6 mt-4 border-t border-border/60 flex items-center justify-between">
                  <div className="text-xs text-muted-foreground">Dự phóng điểm & chẩn đoán</div>
                  <Link
                    href={`/toeic/test/${test.slug}`}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-sm shadow-md transition-all group-hover:translate-x-0.5"
                  >
                    Làm bài Mini Test
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. PART PRACTICE SECTION (Parts 1 to 7) */}
      {(filter === 'all' || filter === 'parts') && (
        <div className="space-y-4 pt-4">
          <div className="flex items-center gap-2 text-lg font-bold text-foreground">
            <Layers className="w-5 h-5 text-sky-400" />
            Luyện Tập Chuyên Sâu Từng Part (Part 1–7)
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {partPractices.map((practice) => {
              const details = getPartDetails(practice.targetPart);
              const Icon = details.icon;

              return (
                <div
                  key={practice.id}
                  className="group flex flex-col justify-between rounded-xl border border-border/80 bg-card p-5 shadow-sm hover:border-primary/50 hover:shadow-md transition-all duration-200"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border ${details.color}`}>
                        <Icon className="w-3.5 h-3.5" />
                        {details.section}
                      </span>
                      <span className="text-xs text-muted-foreground font-mono flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {practice.timeLimitMinutes}p
                      </span>
                    </div>

                    <div>
                      <h4 className="text-base font-bold text-foreground group-hover:text-primary transition-colors">
                        {details.title}
                      </h4>
                      <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2 leading-relaxed">
                        {details.desc}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-muted-foreground pt-1 font-medium">
                      <span>• {practice.totalQuestions} câu hỏi</span>
                      <span>• Có giải thích chi tiết</span>
                    </div>
                  </div>

                  <div className="pt-4 mt-3 border-t border-border/60 flex items-center justify-end">
                    <Link
                      href={`/toeic/test/${practice.slug}`}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary/80 group-hover:translate-x-1 transition-all"
                    >
                      Luyện tập ngay
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
