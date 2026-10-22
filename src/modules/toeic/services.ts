import 'server-only';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import type {
  ToeicFormSummary,
  ClientToeicQuestion,
  ToeicAttempt,
  ToeicResultView,
  ToeicTestType,
  ToeicSection,
} from './types';
import { evaluateToeicSubmission, RawAnswerKey, parsePartNumberFromCategory } from './scoring';
import { generateToeicWeaknessAnalysis } from './evaluator';
import { recordStudyActivity } from '@/modules/streak/services';
import { TOEIC_LEGAL_DISCLAIMER } from './conversion-table';

interface DbAssessmentRow {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  assessment_type: string;
  time_limit_seconds: number | null;
  total_questions: number;
  is_published: boolean;
}

interface DbQuestionRow {
  id: string;
  assessment_id: string;
  skill: string;
  category: string;
  difficulty: number;
  level: string;
  question_type: string;
  prompt: string;
  context_text: string | null;
  audio_url: string | null;
  options: unknown;
  position: number;
  weight: number | string | null;
}

export { parsePartNumberFromCategory } from './scoring';

/**
 * Retrieves all published TOEIC test forms (Full Tests, Mini Tests, Part Practice).
 */
export async function getToeicForms(): Promise<ToeicFormSummary[]> {
  const supabase = await createClient();

  const { data: forms, error } = await supabase
    .from('assessments')
    .select('id, slug, title, description, assessment_type, time_limit_seconds, total_questions, is_published')
    .eq('assessment_type', 'toeic')
    .eq('is_published', true)
    .order('total_questions', { ascending: false });

  if (error || !forms) {
    return [];
  }

  return (forms as unknown as DbAssessmentRow[]).map((f) => {
    let testType: ToeicTestType = 'full_test';
    let targetPart: number | null = null;

    if (f.slug.includes('mini-test')) {
      testType = 'mini_test';
    } else if (f.slug.includes('part-')) {
      testType = 'part_practice';
      const m = f.slug.match(/part-(\d)/);
      if (m) targetPart = parseInt(m[1], 10);
    }

    return {
      id: f.id,
      slug: f.slug,
      title: f.title,
      description: f.description,
      testType,
      targetPart,
      timeLimitMinutes: f.time_limit_seconds ? Math.round(f.time_limit_seconds / 60) : 120,
      totalQuestions: f.total_questions || 0,
      isPublished: f.is_published
    };
  });
}

/**
 * Retrieves a TOEIC test form by slug with client-safe questions.
 * Confidential answer keys and explanations are NEVER exposed here.
 */
export async function getToeicFormBySlug(slug: string): Promise<{
  form: ToeicFormSummary | null;
  questions: ClientToeicQuestion[];
}> {
  const supabase = await createClient();

  const { data: rawForm, error: formError } = await supabase
    .from('assessments')
    .select('id, slug, title, description, assessment_type, time_limit_seconds, total_questions, is_published')
    .eq('slug', slug)
    .eq('is_published', true)
    .maybeSingle();

  if (formError || !rawForm) {
    return { form: null, questions: [] };
  }

  const form = rawForm as unknown as DbAssessmentRow;

  let testType: ToeicTestType = 'full_test';
  let targetPart: number | null = null;
  if (form.slug.includes('mini-test')) {
    testType = 'mini_test';
  } else if (form.slug.includes('part-')) {
    testType = 'part_practice';
    const m = form.slug.match(/part-(\d)/);
    if (m) targetPart = parseInt(m[1], 10);
  }

  const formSummary: ToeicFormSummary = {
    id: form.id,
    slug: form.slug,
    title: form.title,
    description: form.description,
    testType,
    targetPart,
    timeLimitMinutes: form.time_limit_seconds ? Math.round(form.time_limit_seconds / 60) : 120,
    totalQuestions: form.total_questions,
    isPublished: form.is_published
  };

  const { data: rawQuestions, error: qError } = await supabase
    .from('assessment_questions')
    .select('id, assessment_id, skill, category, difficulty, level, question_type, prompt, context_text, audio_url, options, position, weight')
    .eq('assessment_id', form.id)
    .order('position', { ascending: true });

  if (qError || !rawQuestions) {
    return { form: formSummary, questions: [] };
  }

  const questions: ClientToeicQuestion[] = (rawQuestions as unknown as DbQuestionRow[]).map((q) => {
    const partNumber = parsePartNumberFromCategory(q.category, q.skill);
    const section: ToeicSection = partNumber <= 4 ? 'listening' : 'reading';

    // Parse options safely
    let options = Array.isArray(q.options) ? q.options : [];
    if (typeof options === 'string') {
      try { options = JSON.parse(options); } catch { options = []; }
    }

    // Check if audio or image is embedded in context_text or audio_url
    const audioUrl = q.audio_url || null;
    let imageUrl: string | null = null;
    if (q.context_text && q.context_text.startsWith('/images/')) {
      imageUrl = q.context_text;
    }

    return {
      id: q.id,
      formId: q.assessment_id,
      section,
      partNumber,
      questionNumber: q.position,
      prompt: q.prompt,
      contextText: imageUrl ? null : q.context_text,
      audioUrl,
      imageUrl,
      options,
      weight: Number(q.weight) || 1
    };
  });

  return { form: formSummary, questions };
}

/**
 * Retrieves an active in_progress attempt or creates a new one.
 * Supports seamless resume with previously saved answers.
 */
export async function getOrCreateToeicAttempt(
  userId: string,
  formId: string
): Promise<{
  attempt: ToeicAttempt;
  savedAnswers: Record<string, string>;
  isResumed: boolean;
}> {
  const supabase = await createClient();

  // 1. Look for existing in_progress attempt
  const { data: existingAttempt } = await supabase
    .from('assessment_attempts')
    .select('*')
    .eq('user_id', userId)
    .eq('assessment_id', formId)
    .eq('status', 'in_progress')
    .order('started_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existingAttempt) {
    const { data: answers } = await supabase
      .from('assessment_answers')
      .select('question_id, selected_option_id')
      .eq('attempt_id', existingAttempt.id);

    const savedAnswers: Record<string, string> = {};
    if (answers) {
      for (const a of answers) {
        if (a.selected_option_id) {
          savedAnswers[a.question_id] = a.selected_option_id;
        }
      }
    }

    const meta = existingAttempt.metadata || {};

    const attempt: ToeicAttempt = {
      id: existingAttempt.id,
      userId: existingAttempt.user_id,
      formId: existingAttempt.assessment_id,
      status: existingAttempt.status,
      testType: meta.test_type || 'full_test',
      startedAt: existingAttempt.started_at,
      submittedAt: existingAttempt.submitted_at,
      timeSpentSeconds: meta.time_spent_seconds || 0,
      listeningRawScore: meta.listening_raw_score || 0,
      readingRawScore: meta.reading_raw_score || 0,
      estimatedListeningScore: meta.estimated_listening_score || 5,
      estimatedReadingScore: meta.estimated_reading_score || 5,
      estimatedTotalScore: meta.estimated_total_score || 10,
      partScores: meta.part_scores || {},
      scoringVersion: meta.scoring_version || 'toeic_v1',
      metadata: meta
    };

    return { attempt, savedAnswers, isResumed: true };
  }

  // 2. Count questions for this form
  const { count } = await supabase
    .from('assessment_questions')
    .select('*', { count: 'exact', head: true })
    .eq('assessment_id', formId);

  const totalQuestions = count ?? 0;

  // 3. Create new attempt
  const { data: newAttempt, error: insertError } = await supabase
    .from('assessment_attempts')
    .insert({
      user_id: userId,
      assessment_id: formId,
      status: 'in_progress',
      total_questions: totalQuestions,
      answered_count: 0,
      metadata: {
        test_type: 'toeic',
        time_spent_seconds: 0
      }
    })
    .select()
    .single();

  if (insertError || !newAttempt) {
    throw new Error('Không thể khởi tạo phiên thi TOEIC: ' + (insertError?.message || 'Database error'));
  }

  const attempt: ToeicAttempt = {
    id: newAttempt.id,
    userId: newAttempt.user_id,
    formId: newAttempt.assessment_id,
    status: 'in_progress',
    testType: 'toeic',
    startedAt: newAttempt.started_at,
    timeSpentSeconds: 0,
    listeningRawScore: 0,
    readingRawScore: 0,
    estimatedListeningScore: 5,
    estimatedReadingScore: 5,
    estimatedTotalScore: 10,
    partScores: {},
    scoringVersion: 'toeic_v1',
    metadata: newAttempt.metadata
  };

  return { attempt, savedAnswers: {}, isResumed: false };
}

/**
 * Auto-saves a single question answer safely with anti-IDOR check.
 */
export async function saveToeicAnswer(params: {
  userId: string;
  attemptId: string;
  questionId: string;
  selectedOptionId: string;
  timeSpentSeconds?: number;
}): Promise<boolean> {
  const { userId, attemptId, questionId, selectedOptionId, timeSpentSeconds = 0 } = params;
  const supabase = await createClient();

  // Verify attempt ownership and in_progress status
  const { data: attempt, error: attemptError } = await supabase
    .from('assessment_attempts')
    .select('id, user_id, status')
    .eq('id', attemptId)
    .eq('user_id', userId)
    .single();

  if (attemptError || !attempt || attempt.status !== 'in_progress') {
    return false;
  }

  // Upsert answer
  const { error: upsertError } = await supabase
    .from('assessment_answers')
    .upsert(
      {
        attempt_id: attemptId,
        question_id: questionId,
        selected_option_id: selectedOptionId,
        time_spent_seconds: timeSpentSeconds
      },
      { onConflict: 'attempt_id,question_id' }
    );

  if (upsertError) {
    console.error('Failed to auto-save TOEIC answer:', upsertError);
    return false;
  }

  // Update attempt updated_at
  await supabase
    .from('assessment_attempts')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', attemptId);

  return true;
}

/**
 * Submits and evaluates a TOEIC test attempt server-side.
 * Answer keys are fetched strictly on the server using admin client.
 */
export async function submitToeicTest(params: {
  userId: string;
  attemptId: string;
  answers: Record<string, string>; // questionId -> selectedOptionId
  timeSpentSeconds: number;
}) {
  const { userId, attemptId, answers, timeSpentSeconds } = params;
  const supabase = await createClient();

  // 1. Verify attempt ownership & status (anti-IDOR)
  const { data: attempt, error: attemptError } = await supabase
    .from('assessment_attempts')
    .select('id, user_id, assessment_id, status, metadata')
    .eq('id', attemptId)
    .eq('user_id', userId)
    .single();

  if (attemptError || !attempt) {
    throw new Error('Không tìm thấy phiên làm bài hoặc bạn không có quyền truy cập.');
  }

  // Submission idempotency guard
  if (attempt.status === 'submitted') {
    return {
      attemptId,
      alreadySubmitted: true
    };
  }

  // 2. Fetch all questions for this assessment
  const { data: rawQuestions, error: qError } = await supabase
    .from('assessment_questions')
    .select('id, assessment_id, skill, category, difficulty, level, question_type, prompt, context_text, audio_url, options, position, weight')
    .eq('assessment_id', attempt.assessment_id)
    .order('position', { ascending: true });

  if (qError || !rawQuestions) {
    throw new Error('Không thể tải danh sách câu hỏi để chấm điểm.');
  }

  const clientQuestions: ClientToeicQuestion[] = (rawQuestions as unknown as DbQuestionRow[]).map((q) => {
    const partNumber = parsePartNumberFromCategory(q.category, q.skill);
    const section: ToeicSection = partNumber <= 4 ? 'listening' : 'reading';
    let options = Array.isArray(q.options) ? q.options : [];
    if (typeof options === 'string') {
      try { options = JSON.parse(options); } catch { options = []; }
    }
    return {
      id: q.id,
      formId: q.assessment_id,
      section,
      partNumber,
      questionNumber: q.position,
      prompt: q.prompt,
      contextText: q.context_text,
      audioUrl: q.audio_url,
      options,
      weight: Number(q.weight) || 1
    };
  });

  // 3. Fetch confidential answer keys using Admin Client
  const admin = createAdminClient();
  const questionIds = clientQuestions.map(q => q.id);

  const { data: answerKeyRows, error: keysError } = await admin
    .from('assessment_question_answers')
    .select('question_id, correct_option_id, explanation')
    .in('question_id', questionIds);

  if (keysError || !answerKeyRows) {
    throw new Error('Lỗi truy xuất đáp án server: ' + (keysError?.message || 'Database error'));
  }

  const answerKeysMap = new Map<string, RawAnswerKey>();
  for (const row of answerKeyRows) {
    answerKeysMap.set(row.question_id, {
      questionId: row.question_id,
      correctOptionId: row.correct_option_id,
      explanation: row.explanation,
      transcriptText: null
    });
  }

  // 4. Evaluate submission
  const outcome = evaluateToeicSubmission({
    questions: clientQuestions,
    answerKeys: answerKeysMap,
    userAnswers: answers
  });

  // 5. Update attempt in assessment_attempts
  const answeredCount = Object.values(answers).filter(Boolean).length;
  const nowIso = new Date().toISOString();

  const updatedMetadata = {
    ...(attempt.metadata || {}),
    time_spent_seconds: timeSpentSeconds,
    listening_raw_score: outcome.listeningRawScore,
    reading_raw_score: outcome.readingRawScore,
    estimated_listening_score: outcome.estimatedListeningScore,
    estimated_reading_score: outcome.estimatedReadingScore,
    estimated_total_score: outcome.estimatedTotalScore,
    part_scores: outcome.partScores,
    scoring_version: outcome.scoringVersion,
    disclaimer: outcome.disclaimer
  };

  await admin
    .from('assessment_attempts')
    .update({
      status: 'submitted',
      submitted_at: nowIso,
      score: outcome.estimatedTotalScore,
      max_score: 990,
      accuracy: outcome.overallAccuracy / 100,
      answered_count: answeredCount,
      metadata: updatedMetadata,
      updated_at: nowIso
    })
    .eq('id', attemptId);

  // 6. Save answer correctness to assessment_answers
  for (const review of outcome.reviews) {
    if (review.selectedOptionId) {
      await admin
        .from('assessment_answers')
        .upsert(
          {
            attempt_id: attemptId,
            question_id: review.questionId,
            selected_option_id: review.selectedOptionId,
            is_correct: review.isCorrect
          },
          { onConflict: 'attempt_id,question_id' }
        );
    }
  }

  // 7. Record study activity to Streak (without breaking user flow)
  try {
    await recordStudyActivity(userId, 'practice');
  } catch (streakErr) {
    console.warn('Could not record TOEIC activity to streak:', streakErr);
  }

  // 8. Record learning evidence
  try {
    await admin.from('learning_evidence').insert({
      user_id: userId,
      evidence_type: 'assessment',
      title: `Luyện thi TOEIC: ${outcome.estimatedTotalScore}/990 điểm (L: ${outcome.estimatedListeningScore}, R: ${outcome.estimatedReadingScore})`,
      summary: `Hoàn thành bài thi TOEIC với độ chính xác ${outcome.overallAccuracy}%. Nghe: ${outcome.listeningRawScore}/100, Đọc: ${outcome.readingRawScore}/100.`,
      score: outcome.estimatedTotalScore,
      max_score: 990,
      skill: 'listening',
      created_at: nowIso
    });
  } catch (evidenceErr) {
    console.warn('Could not record TOEIC learning evidence:', evidenceErr);
  }

  return {
    attemptId,
    alreadySubmitted: false,
    outcome
  };
}

/**
 * Retrieves the complete scorecard, answer review, and AI weakness breakdown for a submitted attempt.
 */
export async function getToeicResult(userId: string, attemptId: string): Promise<ToeicResultView | null> {
  const supabase = await createClient();

  // 1. Fetch attempt and check user ownership (anti-IDOR)
  const { data: attemptRow, error: attemptError } = await supabase
    .from('assessment_attempts')
    .select('*')
    .eq('id', attemptId)
    .eq('user_id', userId)
    .single();

  if (attemptError || !attemptRow) {
    return null;
  }

  // 2. Fetch Form details
  const { data: formRow } = await supabase
    .from('assessments')
    .select('id, slug, title, description, assessment_type, time_limit_seconds, total_questions, is_published')
    .eq('id', attemptRow.assessment_id)
    .single();

  if (!formRow) return null;

  let testType: ToeicTestType = 'full_test';
  let targetPart: number | null = null;
  if (formRow.slug.includes('mini-test')) {
    testType = 'mini_test';
  } else if (formRow.slug.includes('part-')) {
    testType = 'part_practice';
    const m = formRow.slug.match(/part-(\d)/);
    if (m) targetPart = parseInt(m[1], 10);
  }

  const form: ToeicFormSummary = {
    id: formRow.id,
    slug: formRow.slug,
    title: formRow.title,
    description: formRow.description,
    testType,
    targetPart,
    timeLimitMinutes: formRow.time_limit_seconds ? Math.round(formRow.time_limit_seconds / 60) : 120,
    totalQuestions: formRow.total_questions,
    isPublished: formRow.is_published
  };

  // 3. Fetch questions
  const { data: rawQuestions } = await supabase
    .from('assessment_questions')
    .select('id, assessment_id, skill, category, difficulty, level, question_type, prompt, context_text, audio_url, options, position, weight')
    .eq('assessment_id', formRow.id)
    .order('position', { ascending: true });

  const questions = ((rawQuestions || []) as unknown as DbQuestionRow[]).map((q) => {
    const partNumber = parsePartNumberFromCategory(q.category, q.skill);
    const section: ToeicSection = partNumber <= 4 ? 'listening' : 'reading';
    let options = Array.isArray(q.options) ? q.options : [];
    if (typeof options === 'string') {
      try { options = JSON.parse(options); } catch { options = []; }
    }
    const audioUrl = q.audio_url || null;
    let imageUrl: string | null = null;
    if (q.context_text && q.context_text.startsWith('/images/')) {
      imageUrl = q.context_text;
    }
    return {
      id: q.id,
      formId: q.assessment_id,
      section,
      partNumber,
      questionNumber: q.position,
      prompt: q.prompt,
      contextText: imageUrl ? null : q.context_text,
      audioUrl,
      imageUrl,
      options
    };
  });

  // 4. Fetch user answers
  const { data: answerRows } = await supabase
    .from('assessment_answers')
    .select('question_id, selected_option_id, is_correct')
    .eq('attempt_id', attemptId);

  const userAnswersMap = new Map<string, { selected: string | null; isCorrect: boolean | null }>();
  if (answerRows) {
    for (const a of answerRows) {
      userAnswersMap.set(a.question_id, {
        selected: a.selected_option_id,
        isCorrect: a.is_correct
      });
    }
  }

  // 5. Fetch explanations via admin client
  const admin = createAdminClient();
  const qIds = questions.map(q => q.id);
  const { data: explanationRows } = await admin
    .from('assessment_question_answers')
    .select('question_id, correct_option_id, explanation')
    .in('question_id', qIds);

  const keyMap = new Map<string, { correct: string; explanation: string }>();
  if (explanationRows) {
    for (const e of explanationRows) {
      keyMap.set(e.question_id, {
        correct: e.correct_option_id,
        explanation: e.explanation
      });
    }
  }

  // 6. Build Detailed Reviews
  const reviews = questions.map(q => {
    const ans = userAnswersMap.get(q.id);
    const key = keyMap.get(q.id);
    const selected = ans?.selected || null;
    const correct = key?.correct || '';
    const isCorrect = Boolean(selected && correct && selected.toUpperCase() === correct.toUpperCase());

    return {
      questionId: q.id,
      questionNumber: q.questionNumber,
      partNumber: q.partNumber,
      section: q.section,
      prompt: q.prompt,
      contextText: q.contextText,
      audioUrl: q.audioUrl,
      imageUrl: q.imageUrl,
      options: q.options,
      selectedOptionId: selected,
      correctOptionId: correct,
      isCorrect,
      explanation: key?.explanation || 'Không có giải thích chi tiết cho câu hỏi này.'
    };
  });

  const meta = attemptRow.metadata || {};

  const attempt: ToeicAttempt = {
    id: attemptRow.id,
    userId: attemptRow.user_id,
    formId: attemptRow.assessment_id,
    status: attemptRow.status,
    testType,
    startedAt: attemptRow.started_at,
    submittedAt: attemptRow.submitted_at,
    timeSpentSeconds: meta.time_spent_seconds || 0,
    listeningRawScore: meta.listening_raw_score || 0,
    readingRawScore: meta.reading_raw_score || 0,
    estimatedListeningScore: meta.estimated_listening_score || 5,
    estimatedReadingScore: meta.estimated_reading_score || 5,
    estimatedTotalScore: meta.estimated_total_score || (attemptRow.score ? Number(attemptRow.score) : 10),
    partScores: meta.part_scores || {},
    scoringVersion: meta.scoring_version || 'toeic_v1',
    metadata: meta
  };

  // 7. Generate Weakness Analysis
  const analysis = await generateToeicWeaknessAnalysis({
    partScores: attempt.partScores,
    estimatedListeningScore: attempt.estimatedListeningScore,
    estimatedReadingScore: attempt.estimatedReadingScore,
    estimatedTotalScore: attempt.estimatedTotalScore
  });

  return {
    attempt,
    form,
    reviews,
    analysis,
    disclaimer: TOEIC_LEGAL_DISCLAIMER
  };
}
