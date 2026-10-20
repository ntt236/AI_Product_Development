'use client';

import React, { useState, useTransition, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { EmptyState } from '@/components/ui/state-feedback';
import {
  BookOpen,
  Sparkles,
  Clock,
  Flame,
  Trophy,
  Search,
  Plus,
  Trash2,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Check,
  Bookmark,
  Layers,
  ArrowLeft,
  Lightbulb,
  X,
} from 'lucide-react';
import type {
  CuratedVocabularyItem,
  UserVocabularyItem,
  VocabularyStats,
  VocabularyReviewResult,
  SaveWordInput,
} from '@/modules/vocabulary/types';
import {
  saveWordAction,
  deleteWordAction,
  submitReviewSessionAction,
} from '@/modules/vocabulary/actions';
import { calculateNextReviewSchedule } from '@/modules/vocabulary/schedule';

interface VocabularyViewProps {
  initialCurated: CuratedVocabularyItem[];
  initialNotebook: UserVocabularyItem[];
  initialDue: UserVocabularyItem[];
  initialStats: VocabularyStats;
}

export function VocabularyView({
  initialCurated,
  initialNotebook,
  initialDue,
  initialStats,
}: VocabularyViewProps) {
  // Tab state
  const [activeTab, setActiveTab] = useState<'due' | 'notebook' | 'curated'>('due');

  // Data states
  const [notebook, setNotebook] = useState<UserVocabularyItem[]>(initialNotebook);
  const [dueList, setDueList] = useState<UserVocabularyItem[]>(initialDue);
  const [stats, setStats] = useState<VocabularyStats>(initialStats);

  // Transitions & loading
  const [isPending, startTransition] = useTransition();
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Search & filter for Notebook
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'learning' | 'reviewing' | 'mastered'>('all');

  // Curated topic filter
  const [curatedTopic, setCuratedTopic] = useState<'all' | 'daily' | 'office'>('all');

  // Modal: Add Custom Word
  const [showAddModal, setShowAddModal] = useState(false);
  const [newWord, setNewWord] = useState('');
  const [newMeaning, setNewMeaning] = useState('');
  const [newPartOfSpeech, setNewPartOfSpeech] = useState('');
  const [newIpa, setNewIpa] = useState('');
  const [newExample, setNewExample] = useState('');
  const [newNotes, setNewNotes] = useState('');
  const [savingWord, setSavingWord] = useState(false);

  // Review Session state
  const [isReviewing, setIsReviewing] = useState(false);
  const [reviewSessionId, setReviewSessionId] = useState<string>('');
  const [reviewQueue, setReviewQueue] = useState<UserVocabularyItem[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [sessionResults, setSessionResults] = useState<Array<{
    item: UserVocabularyItem;
    result: VocabularyReviewResult;
  }>>([]);
  const [sessionCompleted, setSessionCompleted] = useState(false);
  const [isSubmittingSession, setIsSubmittingSession] = useState(false);

  // Set of normalized words currently in notebook for quick lookup
  const savedNormalizedWords = useMemo(() => {
    return new Set(notebook.map((item) => item.word_normalized));
  }, [notebook]);

  const showNotification = (type: 'success' | 'error', text: string) => {
    setFeedbackMessage({ type, text });
    setTimeout(() => {
      setFeedbackMessage(null);
    }, 4500);
  };

  // Re-calculate stats based on current notebook
  const refreshStats = (currentItems: UserVocabularyItem[]) => {
    const nowMs = Date.now();
    let due = 0;
    let learning = 0;
    let reviewing = 0;
    let mastered = 0;

    for (const w of currentItems) {
      if (new Date(w.next_review_at).getTime() <= nowMs) {
        due += 1;
      }
      if (w.status === 'learning') learning += 1;
      else if (w.status === 'reviewing') reviewing += 1;
      else if (w.status === 'mastered') mastered += 1;
    }

    setStats({
      totalWords: currentItems.length,
      dueWords: due,
      learningWords: learning,
      reviewingWords: reviewing,
      masteredWords: mastered,
    });
  };

  // ---------------------------------------------------------------------------
  // Action Handlers
  // ---------------------------------------------------------------------------

  const handleSaveWord = async (input: SaveWordInput) => {
    setSavingWord(true);
    startTransition(async () => {
      const res = await saveWordAction(input);
      setSavingWord(false);

      if (!res.success || !res.data) {
        showNotification('error', res.error || 'Không thể lưu từ vựng.');
        return;
      }

      const { item, alreadyExisted } = res.data;
      if (alreadyExisted) {
        showNotification('success', `Từ "${item.word}" đã có trong sổ từ cá nhân của bạn.`);
      } else {
        const updated = [item, ...notebook.filter((n) => n.id !== item.id)];
        setNotebook(updated);
        // If due immediately, add to dueList
        if (new Date(item.next_review_at).getTime() <= Date.now()) {
          setDueList((prev) => [item, ...prev.filter((d) => d.id !== item.id)]);
        }
        refreshStats(updated);
        showNotification('success', `Đã thêm "${item.word}" vào sổ từ cá nhân thành công!`);
      }

      // Close modal if open
      setShowAddModal(false);
      setNewWord('');
      setNewMeaning('');
      setNewPartOfSpeech('');
      setNewIpa('');
      setNewExample('');
      setNewNotes('');
    });
  };

  const handleDeleteWord = async (vocabId: string, word: string) => {
    if (!window.confirm(`Bạn có chắc muốn xóa từ "${word}" khỏi sổ từ vựng cá nhân?`)) {
      return;
    }

    startTransition(async () => {
      const res = await deleteWordAction(vocabId);
      if (!res.success) {
        showNotification('error', res.error || 'Lỗi khi xóa từ vựng.');
        return;
      }

      const updated = notebook.filter((w) => w.id !== vocabId);
      setNotebook(updated);
      setDueList((prev) => prev.filter((w) => w.id !== vocabId));
      refreshStats(updated);
      showNotification('success', `Đã xóa từ "${word}" khỏi sổ từ.`);
    });
  };

  // ---------------------------------------------------------------------------
  // Review Session Logic
  // ---------------------------------------------------------------------------

  const startReviewSession = () => {
    if (dueList.length === 0) return;

    // Generate unique session id for idempotency
    const sid = `session-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    setReviewSessionId(sid);
    setReviewQueue([...dueList]);
    setCurrentCardIndex(0);
    setIsFlipped(false);
    setSessionResults([]);
    setSessionCompleted(false);
    setIsReviewing(true);
  };

  const handleCardRecall = (result: VocabularyReviewResult) => {
    const currentItem = reviewQueue[currentCardIndex];
    if (!currentItem) return;

    const newResults = [...sessionResults, { item: currentItem, result }];
    setSessionResults(newResults);

    if (currentCardIndex + 1 < reviewQueue.length) {
      setCurrentCardIndex((prev) => prev + 1);
      setIsFlipped(false);
    } else {
      // Completed all cards in session!
      setSessionCompleted(true);
    }
  };

  const handleCompleteReviewSession = async () => {
    if (sessionResults.length === 0 || isSubmittingSession) return;

    setIsSubmittingSession(true);
    try {
      const payload = {
        reviewSessionId,
        reviews: sessionResults.map((r) => ({
          userVocabId: r.item.id,
          result: r.result,
        })),
      };

      const res = await submitReviewSessionAction(payload);
      if (!res.success || !res.data) {
        showNotification('error', res.error || 'Lỗi khi lưu kết quả ôn tập.');
        setIsSubmittingSession(false);
        return;
      }

      const updatedItems = res.data.items;
      // Update notebook items
      const updatedMap = new Map(updatedItems.map((u) => [u.id, u]));
      const newNotebook = notebook.map((item) => updatedMap.get(item.id) || item);
      setNotebook(newNotebook);

      // Remove reviewed items from dueList
      const reviewedIds = new Set(sessionResults.map((r) => r.item.id));
      const newDue = dueList.filter((d) => !reviewedIds.has(d.id));
      setDueList(newDue);

      refreshStats(newNotebook);
      setIsReviewing(false);
      showNotification('success', `Chúc mừng! Bạn đã hoàn thành phiên ôn tập ${sessionResults.length} từ vựng.`);
    } catch {
      showNotification('error', 'Lỗi hệ thống khi lưu kết quả ôn tập.');
    } finally {
      setIsSubmittingSession(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Filtered Lists
  // ---------------------------------------------------------------------------

  const filteredNotebook = useMemo(() => {
    return notebook.filter((item) => {
      const matchesSearch =
        searchQuery === '' ||
        item.word.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.meaning_vi.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.custom_notes && item.custom_notes.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesStatus =
        statusFilter === 'all' || item.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [notebook, searchQuery, statusFilter]);

  const filteredCurated = useMemo(() => {
    return initialCurated.filter((item) => {
      if (curatedTopic === 'daily') {
        return item.content_item_slug === 'vocab-daily-routine';
      }
      if (curatedTopic === 'office') {
        return item.content_item_slug === 'vocab-office-communication';
      }
      return true;
    });
  }, [initialCurated, curatedTopic]);

  // Current Card during active review
  const currentCard = reviewQueue[currentCardIndex];

  return (
    <div className="space-y-6 pb-12">
      {/* Feedback Banner */}
      {feedbackMessage && (
        <div
          className={`p-4 rounded-xl flex items-center justify-between gap-3 text-sm font-medium border animate-in fade-in slide-in-from-top-2 duration-200 ${
            feedbackMessage.type === 'success'
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
              : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {feedbackMessage.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            ) : (
              <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
            )}
            <span>{feedbackMessage.text}</span>
          </div>
          <button
            onClick={() => setFeedbackMessage(null)}
            className="text-muted-foreground hover:text-foreground text-xs p-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <BookOpen className="w-5 h-5" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Sổ Từ Vựng Cá Nhân &amp; Ôn Tập
            </h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Quản lý kho từ vựng và củng cố phản xạ ghi nhớ với thuật toán lặp lại ngắt quãng (Spaced Repetition).
          </p>
        </div>

        <Button
          onClick={() => setShowAddModal(true)}
          className="shadow-lg shadow-cyan-500/20 shrink-0"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Thêm từ mới
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card
          className={`relative overflow-hidden transition-all ${
            stats.dueWords > 0
              ? 'border-amber-500/40 bg-gradient-to-br from-amber-500/10 via-card to-card'
              : ''
          }`}
        >
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
              <span>Cần ôn hôm nay</span>
              <Clock className={`w-4 h-4 ${stats.dueWords > 0 ? 'text-amber-400' : 'text-muted-foreground'}`} />
            </div>
            <div className={`text-2xl sm:text-3xl font-black ${stats.dueWords > 0 ? 'text-amber-400' : 'text-foreground'}`}>
              {stats.dueWords}
            </div>
            <div className="text-xs text-muted-foreground mt-1 truncate">
              {stats.dueWords > 0 ? 'Đến hạn củng cố phản xạ' : 'Đã hoàn thành phiên hôm nay'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
              <span>Tổng từ đã lưu</span>
              <Bookmark className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-cyan-400">
              {stats.totalWords}
            </div>
            <div className="text-xs text-muted-foreground mt-1 truncate">
              Trong sổ từ cá nhân
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
              <span>Đang rèn luyện</span>
              <Flame className="w-4 h-4 text-sky-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-sky-400">
              {stats.learningWords + stats.reviewingWords}
            </div>
            <div className="text-xs text-muted-foreground mt-1 truncate">
              {stats.learningWords} mới · {stats.reviewingWords} đang ôn
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
              <span>Đã thuộc sâu</span>
              <Trophy className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-400">
              {stats.masteredWords}
            </div>
            <div className="text-xs text-muted-foreground mt-1 truncate">
              Chuỗi đúng 5+ lần liên tiếp
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs Control */}
      <div className="flex items-center gap-1.5 p-1 bg-card/60 backdrop-blur border rounded-xl overflow-x-auto">
        <button
          onClick={() => {
            setActiveTab('due');
            setIsReviewing(false);
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${
            activeTab === 'due'
              ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-sm'
              : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Ôn tập đến hạn</span>
          <Badge
            variant={dueList.length > 0 ? 'warning' : 'default'}
            className="text-[10px] px-1.5 py-0 h-4"
          >
            {dueList.length}
          </Badge>
        </button>

        <button
          onClick={() => {
            setActiveTab('notebook');
            setIsReviewing(false);
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${
            activeTab === 'notebook'
              ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-sm'
              : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Sổ từ cá nhân</span>
          <Badge variant="default" className="text-[10px] px-1.5 py-0 h-4">
            {notebook.length}
          </Badge>
        </button>

        <button
          onClick={() => {
            setActiveTab('curated');
            setIsReviewing(false);
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${
            activeTab === 'curated'
              ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-sm'
              : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Từ vựng giáo trình</span>
          <Badge variant="info" className="text-[10px] px-1.5 py-0 h-4">
            {initialCurated.length}
          </Badge>
        </button>
      </div>

      {/* ===================================================================== */}
      {/* TAB 1: ÔN TẬP ĐẾN HẠN (DUE REVIEW) */}
      {/* ===================================================================== */}
      {activeTab === 'due' && (
        <div className="space-y-6">
          {!isReviewing ? (
            <div>
              {dueList.length === 0 ? (
                <EmptyState
                  icon={CheckCircle2}
                  title="Tuyệt vời! Bạn không còn từ nào cần ôn hôm nay"
                  description="Hệ thống sẽ tự động xếp lịch ôn các từ vựng này vào những ngày tới theo chu kỳ ghi nhớ. Bạn có thể duyệt lại sổ từ hoặc thêm từ vựng mới để tiếp tục rèn luyện!"
                  action={
                    <div className="flex flex-wrap items-center justify-center gap-3">
                      <Button
                        variant="secondary"
                        onClick={() => setActiveTab('notebook')}
                      >
                        <BookOpen className="w-4 h-4 mr-2" />
                        Duyệt sổ từ cá nhân ({notebook.length})
                      </Button>
                      <Button
                        onClick={() => setActiveTab('curated')}
                      >
                        <Layers className="w-4 h-4 mr-2" />
                        Khám phá từ vựng giáo trình ({initialCurated.length})
                      </Button>
                    </div>
                  }
                />
              ) : (
                <Card className="relative overflow-hidden border-cyan-500/30 bg-gradient-to-br from-card via-card to-cyan-950/20 text-center p-6 sm:p-10">
                  <div className="max-w-xl mx-auto space-y-4">
                    <div className="w-14 h-14 mx-auto rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                      <Sparkles className="w-7 h-7" />
                    </div>

                    <div>
                      <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
                        Bạn có {dueList.length} từ vựng cần củng cố hôm nay
                      </h2>
                      <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                        Mỗi từ vựng được hiển thị dưới dạng Flashcard phản xạ. Khi nhớ đúng, chu kỳ ôn tập tiếp theo sẽ tự động được kéo dài (1 ngày → 3 ngày → 7 ngày → 14 ngày → 30 ngày).
                      </p>
                    </div>

                    <div className="pt-2">
                      <Button
                        size="lg"
                        onClick={startReviewSession}
                        className="shadow-xl shadow-cyan-500/25 px-8 font-bold text-base"
                      >
                        <Flame className="w-5 h-5 mr-2" />
                        Bắt đầu phiên ôn tập ({dueList.length} từ)
                      </Button>
                    </div>

                    {/* Preview of due words */}
                    <div className="pt-8 text-left border-t border-border/50">
                      <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                        Danh sách từ đến hạn hôm nay:
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {dueList.map((w) => (
                          <span
                            key={w.id}
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs bg-muted/60 border border-border text-foreground"
                          >
                            <span className="font-semibold text-cyan-400">{w.word}</span>
                            <span className="text-muted-foreground">({w.meaning_vi})</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>
              )}
            </div>
          ) : (
            /* =============================================================== */
            /* ACTIVE REVIEW FLASHCARD SESSION */
            /* =============================================================== */
            <div className="max-w-2xl mx-auto space-y-5">
              {!sessionCompleted ? (
                <div className="space-y-5">
                  {/* Top Bar with Exit and Card Counter */}
                  <div className="flex items-center justify-between">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        if (window.confirm('Bạn có muốn tạm dừng phiên ôn tập này?')) {
                          setIsReviewing(false);
                        }
                      }}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <ArrowLeft className="w-4 h-4 mr-1.5" />
                      Thoát phiên ôn
                    </Button>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-muted-foreground">Tiến độ</span>
                      <Badge variant="info">
                        Từ {currentCardIndex + 1} / {reviewQueue.length}
                      </Badge>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <Progress
                    value={((currentCardIndex) / reviewQueue.length) * 100}
                    className="h-2"
                  />

                  {/* Flashcard container */}
                  {currentCard && (
                    <div
                      onClick={() => setIsFlipped((prev) => !prev)}
                      className={`group cursor-pointer select-none rounded-2xl p-6 sm:p-10 min-h-[340px] flex flex-col justify-between transition-all duration-300 relative border ${
                        isFlipped
                          ? 'bg-card border-cyan-500/60 shadow-xl shadow-cyan-500/10'
                          : 'bg-card/90 border-border hover:border-cyan-500/40 shadow-lg'
                      }`}
                    >
                      {/* Top bar on card */}
                      <div className="flex items-center justify-between gap-2">
                        <Badge variant={isFlipped ? 'success' : 'info'}>
                          {isFlipped ? 'Mặt sau: Nghĩa & Ví dụ' : 'Mặt trước: Thử phản xạ'}
                        </Badge>

                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <RotateCcw className="w-3.5 h-3.5" />
                          {isFlipped ? 'Bấm để lật lại' : 'Bấm vào thẻ để lật xem đáp án'}
                        </span>
                      </div>

                      {/* Main Card Content */}
                      <div className="text-center my-auto py-6">
                        <div className="text-3xl sm:text-4xl font-black text-cyan-400 tracking-tight mb-2">
                          {currentCard.word}
                        </div>

                        {currentCard.ipa && (
                          <div className="text-sm font-mono text-muted-foreground mb-1">
                            {currentCard.ipa}
                          </div>
                        )}

                        {currentCard.part_of_speech && (
                          <div className="text-xs italic text-muted-foreground/80 mb-6">
                            ({currentCard.part_of_speech})
                          </div>
                        )}

                        {/* Front: Prompt reminder */}
                        {!isFlipped ? (
                          <div className="max-w-md mx-auto p-4 rounded-xl bg-white/[0.03] border border-border/50 text-sm text-muted-foreground flex items-center justify-center gap-2">
                            <Lightbulb className="w-4 h-4 text-amber-400 shrink-0" />
                            <span>Hãy thử nhớ lại nghĩa tiếng Việt và cách sử dụng trước khi lật thẻ.</span>
                          </div>
                        ) : (
                          /* Back: Meaning and example */
                          <div className="max-w-md mx-auto space-y-3 text-left animate-in fade-in duration-200">
                            <div className="text-center text-lg sm:text-xl font-bold text-emerald-400">
                              {currentCard.meaning_vi}
                            </div>

                            {currentCard.example && (
                              <div className="p-3.5 rounded-xl bg-muted/40 border-l-4 border-cyan-400 text-sm leading-relaxed text-foreground">
                                <span className="font-semibold text-xs text-cyan-400 block mb-1">Ví dụ ngữ cảnh:</span>
                                <em>&quot;{currentCard.example}&quot;</em>
                              </div>
                            )}

                            {currentCard.custom_notes && (
                              <div className="text-xs text-amber-400 flex items-start gap-1.5 pt-1">
                                <span>📌</span>
                                <span>Ghi chú cá nhân: {currentCard.custom_notes}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Card Footer metadata */}
                      <div className="text-center text-xs text-muted-foreground border-t border-border/40 pt-3">
                        Chu kỳ hiện tại: <strong className="text-foreground">{currentCard.interval_days} ngày</strong> · Chuỗi đúng: <strong className="text-foreground">{currentCard.consecutive_correct}</strong>
                      </div>
                    </div>
                  )}

                  {/* Recall Action Buttons */}
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <button
                      onClick={() => handleCardRecall('forgot')}
                      className="p-4 rounded-xl border border-rose-500/40 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-all flex flex-col items-center justify-center gap-1 text-center"
                    >
                      <XCircle className="w-6 h-6 mb-0.5" />
                      <span className="font-bold text-sm">Chưa nhớ</span>
                      <span className="text-[11px] opacity-75">Ôn lại sau 1 ngày</span>
                    </button>

                    <button
                      onClick={() => handleCardRecall('remembered')}
                      className="p-4 rounded-xl border border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 transition-all flex flex-col items-center justify-center gap-1 text-center"
                    >
                      <CheckCircle2 className="w-6 h-6 mb-0.5" />
                      <span className="font-bold text-sm">Đã nhớ</span>
                      <span className="text-[11px] opacity-75">Tăng chu kỳ ôn tiếp</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* =============================================================== */
                /* SESSION SUMMARY & CONFIRMATION */
                /* =============================================================== */
                <Card className="p-6 sm:p-8 space-y-6">
                  <div className="text-center space-y-2">
                    <div className="w-12 h-12 mx-auto rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                      <Trophy className="w-6 h-6" />
                    </div>
                    <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
                      Tổng kết phiên ôn tập ({sessionResults.length} từ)
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Xem trước lịch ôn tập mới được cập nhật cho từng từ vựng trước khi lưu.
                    </p>
                  </div>

                  {/* Summary Counters */}
                  <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
                    <div className="text-center p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                      <div className="text-2xl font-black text-emerald-400">
                        {sessionResults.filter((r) => r.result === 'remembered').length}
                      </div>
                      <div className="text-xs font-semibold text-emerald-400 mt-0.5">Đã nhớ tốt</div>
                    </div>

                    <div className="text-center p-4 rounded-xl bg-rose-500/10 border border-rose-500/30">
                      <div className="text-2xl font-black text-rose-400">
                        {sessionResults.filter((r) => r.result === 'forgot').length}
                      </div>
                      <div className="text-xs font-semibold text-rose-400 mt-0.5">Chưa nhớ</div>
                    </div>
                  </div>

                  {/* Schedule preview table */}
                  <div className="rounded-xl border overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-muted/50 border-b text-muted-foreground">
                        <tr>
                          <th className="p-3 font-semibold">Từ vựng</th>
                          <th className="p-3 font-semibold">Kết quả</th>
                          <th className="p-3 font-semibold">Chu kỳ mới</th>
                          <th className="p-3 font-semibold">Trạng thái</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/50">
                        {sessionResults.map(({ item, result }) => {
                          const preview = calculateNextReviewSchedule(item.consecutive_correct, result);
                          return (
                            <tr key={item.id} className="hover:bg-muted/30">
                              <td className="p-3 font-semibold text-cyan-400">
                                {item.word}
                              </td>
                              <td className="p-3">
                                <Badge variant={result === 'remembered' ? 'success' : 'destructive'}>
                                  {result === 'remembered' ? 'Đã nhớ' : 'Chưa nhớ'}
                                </Badge>
                              </td>
                              <td className="p-3 font-medium">
                                {preview.intervalDays} ngày (+{preview.intervalDays}d)
                              </td>
                              <td className="p-3 capitalize text-muted-foreground">
                                {preview.status}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Submit Action */}
                  <div className="text-center pt-2">
                    <Button
                      size="lg"
                      onClick={handleCompleteReviewSession}
                      isLoading={isSubmittingSession}
                      className="w-full sm:w-auto px-8 font-bold shadow-lg shadow-cyan-500/20"
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Lưu &amp; Hoàn thành phiên ôn
                    </Button>
                  </div>
                </Card>
              )}
            </div>
          )}
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 2: SỔ TỪ CÁ NHÂN (PERSONAL NOTEBOOK) */}
      {/* ===================================================================== */}
      {activeTab === 'notebook' && (
        <div className="space-y-5">
          {/* Controls: Search & Status Filter */}
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Tìm kiếm từ hoặc nghĩa tiếng Việt..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            <div className="flex items-center gap-1.5 p-1 bg-card/60 border rounded-xl overflow-x-auto">
              {(
                [
                  { id: 'all', label: 'Tất cả' },
                  { id: 'learning', label: 'Đang học' },
                  { id: 'reviewing', label: 'Đang ôn' },
                  { id: 'mastered', label: 'Đã thuộc' },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setStatusFilter(tab.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                    statusFilter === tab.id
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                      : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Words List */}
          {filteredNotebook.length === 0 ? (
            <EmptyState
              icon={BookOpen}
              title={
                notebook.length === 0
                  ? 'Sổ từ cá nhân của bạn đang trống'
                  : 'Không tìm thấy từ vựng nào khớp bộ lọc'
              }
              description={
                notebook.length === 0
                  ? 'Bạn có thể tự thêm từ vựng mới bằng nút "Thêm từ mới" ở góc trên hoặc lưu các từ vựng tiêu chuẩn từ kho giáo trình.'
                  : 'Hãy thử đổi từ khóa tìm kiếm hoặc chọn bộ lọc "Tất cả" để xem danh sách.'
              }
              action={
                notebook.length === 0 ? (
                  <Button onClick={() => setActiveTab('curated')}>
                    <Layers className="w-4 h-4 mr-2" />
                    Khám phá từ vựng giáo trình
                  </Button>
                ) : (
                  <Button variant="secondary" onClick={() => { setSearchQuery(''); setStatusFilter('all'); }}>
                    Xóa bộ lọc
                  </Button>
                )
              }
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredNotebook.map((item) => {
                const isDue = new Date(item.next_review_at).getTime() <= Date.now();
                return (
                  <Card
                    key={item.id}
                    hoverGlow
                    className={`flex flex-col justify-between transition-all ${
                      isDue ? 'border-amber-500/40 bg-gradient-to-br from-amber-500/5 via-card to-card' : ''
                    }`}
                  >
                    <CardContent className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
                      <div>
                        {/* Word & Status Header */}
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h3 className="text-xl font-black text-cyan-400 tracking-tight">
                            {item.word}
                          </h3>

                          <div className="flex items-center gap-1.5 shrink-0">
                            {isDue && (
                              <Badge variant="warning">Đến hạn ôn</Badge>
                            )}
                            <Badge
                              variant={
                                item.status === 'mastered'
                                  ? 'success'
                                  : item.status === 'reviewing'
                                  ? 'info'
                                  : 'default'
                              }
                            >
                              {item.status === 'mastered'
                                ? 'Đã thuộc'
                                : item.status === 'reviewing'
                                ? 'Đang ôn'
                                : 'Đang học'}
                            </Badge>
                          </div>
                        </div>

                        {/* IPA & Part of Speech */}
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3 font-mono">
                          {item.ipa && <span>{item.ipa}</span>}
                          {item.part_of_speech && (
                            <span className="italic font-sans text-muted-foreground/80">
                              • {item.part_of_speech}
                            </span>
                          )}
                        </div>

                        {/* Meaning */}
                        <div className="text-sm font-semibold text-emerald-400 mb-3">
                          {item.meaning_vi}
                        </div>

                        {/* Example */}
                        {item.example && (
                          <div className="p-2.5 rounded-lg bg-muted/40 border-l-2 border-cyan-400 text-xs text-muted-foreground leading-relaxed mb-3">
                            &quot;{item.example}&quot;
                          </div>
                        )}

                        {/* Custom notes */}
                        {item.custom_notes && (
                          <div className="text-xs text-amber-400 flex items-start gap-1 mb-2">
                            <span>📌</span>
                            <span>{item.custom_notes}</span>
                          </div>
                        )}
                      </div>

                      {/* Footer: Metadata & Delete */}
                      <div className="mt-4 pt-3 border-t border-border/50 flex items-center justify-between text-[11px] text-muted-foreground">
                        <div>
                          Chu kỳ: <strong className="text-foreground">{item.interval_days}d</strong> · Đúng: <strong className="text-foreground">{item.consecutive_correct}</strong>
                        </div>

                        <button
                          onClick={() => handleDeleteWord(item.id, item.word)}
                          disabled={isPending}
                          title="Xóa khỏi sổ từ"
                          className="text-muted-foreground hover:text-rose-400 p-1 rounded transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 3: TỪ VỰNG GIÁO TRÌNH (CURATED SETS) */}
      {/* ===================================================================== */}
      {activeTab === 'curated' && (
        <div className="space-y-5">
          {/* Topic filter */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setCuratedTopic('all')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                curatedTopic === 'all'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                  : 'bg-card/60 text-muted-foreground border hover:text-foreground'
              }`}
            >
              Tất cả ({initialCurated.length})
            </button>
            <button
              onClick={() => setCuratedTopic('daily')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                curatedTopic === 'daily'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                  : 'bg-card/60 text-muted-foreground border hover:text-foreground'
              }`}
            >
              Sinh hoạt hàng ngày (6 từ)
            </button>
            <button
              onClick={() => setCuratedTopic('office')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                curatedTopic === 'office'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                  : 'bg-card/60 text-muted-foreground border hover:text-foreground'
              }`}
            >
              Giao tiếp Nơi làm việc (6 từ)
            </button>
          </div>

          {/* Curated Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCurated.map((cur) => {
              const alreadySaved = savedNormalizedWords.has(cur.word_normalized);
              return (
                <Card
                  key={cur.id}
                  hoverGlow
                  className="flex flex-col justify-between"
                >
                  <CardContent className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="text-xl font-black text-cyan-400 tracking-tight">
                          {cur.word}
                        </h3>
                        <span className="text-xs italic text-muted-foreground">
                          {cur.part_of_speech}
                        </span>
                      </div>

                      <div className="text-xs font-mono text-muted-foreground mb-3">
                        Phiên âm: <strong className="text-foreground">{cur.ipa}</strong>
                      </div>

                      <div className="text-sm font-semibold text-emerald-400 mb-3">
                        {cur.meaning_vi}
                      </div>

                      <div className="p-2.5 rounded-lg bg-muted/40 border-l-2 border-cyan-400 text-xs text-muted-foreground leading-relaxed mb-3">
                        &quot;{cur.example}&quot;
                      </div>

                      {cur.note && (
                        <div className="text-xs text-amber-400 flex items-start gap-1">
                          <span>📌</span>
                          <span>{cur.note}</span>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 pt-3 border-t border-border/50">
                      {alreadySaved ? (
                        <div className="text-xs text-emerald-400 flex items-center justify-center gap-1.5 font-semibold py-1.5">
                          <Check className="w-4 h-4" />
                          <span>Đã lưu trong sổ từ</span>
                        </div>
                      ) : (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() =>
                            handleSaveWord({
                              word: cur.word,
                              meaning_vi: cur.meaning_vi,
                              part_of_speech: cur.part_of_speech,
                              ipa: cur.ipa,
                              example: cur.example,
                              custom_notes: cur.note,
                            })
                          }
                          disabled={savingWord}
                          className="w-full text-xs font-semibold text-cyan-400 hover:text-cyan-300"
                        >
                          <Bookmark className="w-3.5 h-3.5 mr-1.5" />
                          Lưu vào sổ từ
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL: ADD CUSTOM WORD */}
      {/* ===================================================================== */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <Card className="w-full max-w-lg shadow-2xl border-cyan-500/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between pb-4 mb-4 border-b">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400">
                    <Plus className="w-5 h-5" />
                  </span>
                  <h2 className="text-lg font-bold tracking-tight">
                    Thêm từ vựng vào sổ cá nhân
                  </h2>
                </div>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-muted-foreground hover:text-foreground p-1 rounded-md"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!newWord.trim() || !newMeaning.trim()) {
                    showNotification('error', 'Vui lòng nhập Từ vựng và Nghĩa tiếng Việt.');
                    return;
                  }
                  handleSaveWord({
                    word: newWord,
                    meaning_vi: newMeaning,
                    part_of_speech: newPartOfSpeech || null,
                    ipa: newIpa || null,
                    example: newExample || null,
                    custom_notes: newNotes || null,
                  });
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-xs font-semibold mb-1.5">
                    Từ vựng tiếng Anh <span className="text-rose-400">*</span>
                  </label>
                  <Input
                    required
                    placeholder="Ví dụ: negotiate, flexible, pragmatic..."
                    value={newWord}
                    onChange={(e) => setNewWord(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1.5">
                    Nghĩa tiếng Việt <span className="text-rose-400">*</span>
                  </label>
                  <Input
                    required
                    placeholder="Ví dụ: đàm phán, thương lượng..."
                    value={newMeaning}
                    onChange={(e) => setNewMeaning(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold mb-1.5">
                      Từ loại
                    </label>
                    <Input
                      placeholder="verb, noun, adj..."
                      value={newPartOfSpeech}
                      onChange={(e) => setNewPartOfSpeech(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1.5">
                      Phiên âm IPA
                    </label>
                    <Input
                      placeholder="/nɪˈɡəʊʃieɪt/"
                      value={newIpa}
                      onChange={(e) => setNewIpa(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1.5">
                    Câu ví dụ minh họa
                  </label>
                  <Input
                    placeholder="We negotiated the contract terms yesterday."
                    value={newExample}
                    onChange={(e) => setNewExample(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1.5">
                    Ghi chú cá nhân (tùy chọn)
                  </label>
                  <Input
                    placeholder="Gợi nhớ ngữ cảnh, mẹo nhớ từ..."
                    value={newNotes}
                    onChange={(e) => setNewNotes(e.target.value)}
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setShowAddModal(false)}
                  >
                    Hủy
                  </Button>
                  <Button
                    type="submit"
                    isLoading={savingWord}
                  >
                    Lưu vào sổ từ
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
