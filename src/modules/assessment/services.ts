import 'server-only';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import type {
  Assessment,
  ClientAssessmentQuestion,
  AssessmentAttempt,
  AssessmentAnswerRecord,
  AssessmentResult,
  QuestionAnswerKey,
  DetailedAnswerReview,
} from './types';
import { calculateAssessmentScore, type UserAnswerInput } from './scoring';

/**
 * Retrieves the published placement assessment along with client-safe questions.
 * Answers are NEVER exposed in this query.
 */
export async function getPlacementAssessmentWithQuestions(): Promise<{
  assessment: Assessment | null;
  questions: ClientAssessmentQuestion[];
}> {
  const supabase = await createClient();

  const { data: assessment, error: assessmentError } = await supabase
    .from('assessments')
    .select('*')
    .eq('slug', 'placement-test')
    .eq('is_published', true)
    .maybeSingle();

  if (assessmentError || !assessment) {
    return { assessment: null, questions: [] };
  }

  const { data: questions, error: questionsError } = await supabase
    .from('assessment_questions')
    .select('id, assessment_id, skill, category, difficulty, level, question_type, prompt, context_text, audio_url, options, position, weight')
    .eq('assessment_id', assessment.id)
    .order('position', { ascending: true });

  if (questionsError || !questions) {
    return { assessment: assessment as Assessment, questions: [] };
  }

  return {
    assessment: assessment as Assessment,
    questions: questions as ClientAssessmentQuestion[],
  };
}

/**
 * Retrieves or creates an in-progress attempt for the given user.
 * Supports resuming interrupted attempts with existing answers.
 */
export async function getOrCreateAssessmentAttempt(
  userId: string,
  assessmentId: string
): Promise<{
  attempt: AssessmentAttempt;
  savedAnswers: Record<string, string>; // questionId -> selectedOptionId
  isResumed: boolean;
}> {
  const supabase = await createClient();

  // 1. Look for existing in_progress attempt
  const { data: existingAttempt } = await supabase
    .from('assessment_attempts')
    .select('*')
    .eq('user_id', userId)
    .eq('assessment_id', assessmentId)
    .eq('status', 'in_progress')
    .order('started_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existingAttempt) {
    // Fetch saved answers for this attempt
    const { data: answers } = await supabase
      .from('assessment_answers')
      .select('question_id, selected_option_id')
      .eq('attempt_id', existingAttempt.id);

    const savedAnswers: Record<string, string> = {};
    if (answers) {
      for (const a of answers) {
        savedAnswers[a.question_id] = a.selected_option_id;
      }
    }

    return {
      attempt: existingAttempt as AssessmentAttempt,
      savedAnswers,
      isResumed: true,
    };
  }

  // 2. Count total questions for assessment
  const { count } = await supabase
    .from('assessment_questions')
    .select('*', { count: 'exact', head: true })
    .eq('assessment_id', assessmentId);

  // 3. Create fresh in_progress attempt
  const { data: newAttempt, error: createError } = await supabase
    .from('assessment_attempts')
    .insert({
      user_id: userId,
      assessment_id: assessmentId,
      status: 'in_progress',
      total_questions: count || 16,
      answered_count: 0,
      metadata: { initiated_via: 'web_dashboard' },
    })
    .select('*')
    .single();

  if (createError || !newAttempt) {
    throw new Error(`Không thể khởi tạo lượt làm bài: ${createError?.message}`);
  }

  return {
    attempt: newAttempt as AssessmentAttempt,
    savedAnswers: {},
    isResumed: false,
  };
}

/**
 * Saves a single question answer for an in-progress attempt.
 * Strictly verifies ownership and attempt status.
 */
export async function saveLearnerAnswer(
  userId: string,
  attemptId: string,
  questionId: string,
  selectedOptionId: string,
  timeSpentSeconds: number = 0
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  // 1. Verify attempt ownership & status
  const { data: attempt, error: attemptError } = await supabase
    .from('assessment_attempts')
    .select('id, user_id, status')
    .eq('id', attemptId)
    .single();

  if (attemptError || !attempt) {
    return { success: false, error: 'Không tìm thấy lượt làm bài.' };
  }

  if (attempt.user_id !== userId) {
    return { success: false, error: 'Không có quyền truy cập lượt làm bài này.' };
  }

  if (attempt.status !== 'in_progress') {
    return { success: false, error: 'Lượt làm bài đã kết thúc, không thể chỉnh sửa câu trả lời.' };
  }

  // 2. Upsert answer
  const { error: upsertError } = await supabase
    .from('assessment_answers')
    .upsert(
      {
        attempt_id: attemptId,
        question_id: questionId,
        selected_option_id: selectedOptionId.trim().toUpperCase(),
        time_spent_seconds: timeSpentSeconds,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'attempt_id,question_id' }
    );

  if (upsertError) {
    return { success: false, error: `Lỗi lưu câu trả lời: ${upsertError.message}` };
  }

  // 3. Update answered count on attempt
  const { count } = await supabase
    .from('assessment_answers')
    .select('*', { count: 'exact', head: true })
    .eq('attempt_id', attemptId);

  await supabase
    .from('assessment_attempts')
    .update({
      answered_count: count || 1,
      updated_at: new Date().toISOString(),
    })
    .eq('id', attemptId);

  return { success: true };
}

/**
 * Submits and grades an assessment attempt completely server-side.
 * Idempotent: multiple submissions for the same attempt return the identical scored result.
 */
export async function submitAndScoreAssessmentAttempt(
  userId: string,
  attemptId: string
): Promise<{ success: boolean; result?: AssessmentResult; error?: string }> {
  const supabase = await createClient();

  // 1. Verify attempt ownership and current status
  const { data: attempt, error: attemptError } = await supabase
    .from('assessment_attempts')
    .select('*')
    .eq('id', attemptId)
    .single();

  if (attemptError || !attempt) {
    return { success: false, error: 'Không tìm thấy bài làm.' };
  }

  if (attempt.user_id !== userId) {
    return { success: false, error: 'Không có quyền nộp bài làm của người khác.' };
  }

  // 2. IDEMPOTENCY CHECK: If already submitted or completed, return existing result!
  if (attempt.status === 'completed' || attempt.status === 'submitted') {
    const { data: existingResult } = await supabase
      .from('assessment_results')
      .select('*')
      .eq('attempt_id', attemptId)
      .maybeSingle();

    if (existingResult) {
      return { success: true, result: existingResult as AssessmentResult };
    }
  }

  // 3. Fetch questions and user answers
  const { data: questions, error: qError } = await supabase
    .from('assessment_questions')
    .select('id, assessment_id, skill, category, difficulty, level, question_type, prompt, context_text, audio_url, options, position, weight')
    .eq('assessment_id', attempt.assessment_id)
    .order('position', { ascending: true });

  if (qError || !questions || questions.length === 0) {
    return { success: false, error: 'Không thể tải danh sách câu hỏi để chấm điểm.' };
  }

  const { data: userAnswers, error: aError } = await supabase
    .from('assessment_answers')
    .select('question_id, selected_option_id, time_spent_seconds')
    .eq('attempt_id', attemptId);

  if (aError) {
    return { success: false, error: `Lỗi tải câu trả lời: ${aError.message}` };
  }

  // 4. Fetch official confidential answers using admin client (service_role)
  const adminClient = createAdminClient();
  const questionIds = questions.map((q) => q.id);

  const { data: officialAnswers, error: officialError } = await adminClient
    .from('assessment_question_answers')
    .select('question_id, correct_option_id, explanation')
    .in('question_id', questionIds);

  if (officialError || !officialAnswers) {
    return { success: false, error: 'Lỗi nạp bộ đáp án chính thức từ hệ thống chấm.' };
  }

  // 5. Run deterministic scoring engine
  const submissionInputs: UserAnswerInput[] = (userAnswers || []).map((a) => ({
    questionId: a.question_id,
    selectedOptionId: a.selected_option_id,
    timeSpentSeconds: a.time_spent_seconds || 0,
  }));

  const scoredResult = calculateAssessmentScore(
    questions as ClientAssessmentQuestion[],
    officialAnswers as QuestionAnswerKey[],
    submissionInputs
  );

  const now = new Date().toISOString();

  // 6. Persist scored answers (mark correctness & awarded score)
  for (const item of scoredResult.scoredAnswers) {
    await adminClient
      .from('assessment_answers')
      .update({
        is_correct: item.isCorrect,
        score_awarded: item.scoreAwarded,
        updated_at: now,
      })
      .eq('attempt_id', attemptId)
      .eq('question_id', item.questionId);
  }

  // 7. Update attempt status to completed
  await adminClient
    .from('assessment_attempts')
    .update({
      status: 'completed',
      submitted_at: now,
      completed_at: now,
      score: scoredResult.totalScore,
      max_score: scoredResult.maxScore,
      accuracy: scoredResult.accuracy,
      updated_at: now,
    })
    .eq('id', attemptId);

  // 8. Insert assessment_results record
  const { data: savedResult, error: resultError } = await adminClient
    .from('assessment_results')
    .insert({
      attempt_id: attemptId,
      user_id: userId,
      overall_level: scoredResult.overallLevel,
      total_questions: scoredResult.totalQuestions,
      correct_answers: scoredResult.correctAnswers,
      total_score: scoredResult.totalScore,
      max_score: scoredResult.maxScore,
      accuracy: scoredResult.accuracy,
      skill_scores: scoredResult.skillScores,
      strengths: scoredResult.strengths,
      weaknesses: scoredResult.weaknesses,
      recommendations: scoredResult.recommendations,
      scoring_version: scoredResult.scoringVersion,
      created_at: now,
    })
    .select('*')
    .single();

  if (resultError || !savedResult) {
    return { success: false, error: `Lỗi lưu kết quả đánh giá: ${resultError?.message}` };
  }

  // 9. Update learner_skill_profiles for each tested skill
  const skillsList = Object.keys(scoredResult.skillScores) as (keyof typeof scoredResult.skillScores)[];
  for (const skill of skillsList) {
    const summary = scoredResult.skillScores[skill];
    await adminClient
      .from('learner_skill_profiles')
      .upsert(
        {
          user_id: userId,
          skill,
          estimated_level: summary.estimatedLevel,
          ability_score: summary.accuracy,
          confidence: summary.totalQuestions >= 4 ? 0.8 : 0.5,
          last_assessed_at: now,
          updated_at: now,
        },
        { onConflict: 'user_id,skill' }
      );
  }

  // 10. Update profiles.estimated_level via adminClient (authorized server privilege boundary)
  // This smoothly adheres to the Phase 1 protect_profile_fields trigger without weakening it!
  await adminClient
    .from('profiles')
    .update({
      estimated_level: scoredResult.overallLevel,
      updated_at: now,
    })
    .eq('id', userId);

  return {
    success: true,
    result: savedResult as AssessmentResult,
  };
}

/**
 * Retrieves the full result and detailed question review for a completed attempt.
 * Only returns official answers AFTER the attempt has completed.
 */
export async function getDetailedAssessmentResult(
  userId: string,
  attemptId: string
): Promise<{
  result: AssessmentResult | null;
  attempt: AssessmentAttempt | null;
  reviews: DetailedAnswerReview[];
}> {
  const supabase = await createClient();

  // 1. Fetch attempt and verify ownership
  const { data: attempt } = await supabase
    .from('assessment_attempts')
    .select('*')
    .eq('id', attemptId)
    .single();

  if (!attempt || attempt.user_id !== userId) {
    return { result: null, attempt: null, reviews: [] };
  }

  // 2. Fetch assessment_result
  const { data: result } = await supabase
    .from('assessment_results')
    .select('*')
    .eq('attempt_id', attemptId)
    .maybeSingle();

  if (!result) {
    return { result: null, attempt: attempt as AssessmentAttempt, reviews: [] };
  }

  // 3. Fetch questions, user answers, and official answers (using admin client since answers are confidential)
  const adminClient = createAdminClient();

  const { data: questions } = await supabase
    .from('assessment_questions')
    .select('id, assessment_id, skill, category, difficulty, level, question_type, prompt, context_text, audio_url, options, position, weight')
    .eq('assessment_id', attempt.assessment_id)
    .order('position', { ascending: true });

  const { data: userAnswers } = await supabase
    .from('assessment_answers')
    .select('*')
    .eq('attempt_id', attemptId);

  const { data: officialAnswers } = await adminClient
    .from('assessment_question_answers')
    .select('*')
    .in('question_id', (questions || []).map((q) => q.id));

  const answersMap = new Map<string, AssessmentAnswerRecord>();
  for (const a of userAnswers || []) {
    answersMap.set(a.question_id, a as AssessmentAnswerRecord);
  }

  const officialMap = new Map<string, QuestionAnswerKey>();
  for (const o of officialAnswers || []) {
    officialMap.set(o.question_id, o as QuestionAnswerKey);
  }

  const reviews: DetailedAnswerReview[] = (questions || []).map((q) => {
    const userA = answersMap.get(q.id);
    const offA = officialMap.get(q.id);
    const selected = userA?.selected_option_id || null;
    const correct = offA?.correct_option_id || '';
    const isCorrect = Boolean(selected && correct && selected.toUpperCase() === correct.toUpperCase());

    return {
      question: q as ClientAssessmentQuestion,
      selectedOptionId: selected,
      correctOptionId: correct,
      isCorrect,
      explanation: offA?.explanation || 'Không có giải thích bổ sung.',
    };
  });

  return {
    result: result as AssessmentResult,
    attempt: attempt as AssessmentAttempt,
    reviews,
  };
}

/**
 * Retrieves the latest completed assessment result for dashboard display.
 */
export async function getUserLatestAssessmentResult(userId: string): Promise<AssessmentResult | null> {
  const supabase = await createClient();

  const { data: result } = await supabase
    .from('assessment_results')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  return (result as AssessmentResult) || null;
}
