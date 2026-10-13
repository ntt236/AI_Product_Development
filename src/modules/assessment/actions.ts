'use server';

import { createClient } from '@/lib/supabase/server';
import {
  getPlacementAssessmentWithQuestions,
  getOrCreateAssessmentAttempt,
  saveLearnerAnswer,
  submitAndScoreAssessmentAttempt,
} from './services';
import type { ClientAssessmentQuestion } from './types';

export interface StartAssessmentResponse {
  success: boolean;
  attemptId?: string;
  questions?: ClientAssessmentQuestion[];
  savedAnswers?: Record<string, string>;
  isResumed?: boolean;
  timeLimitSeconds?: number | null;
  error?: string;
}

/**
 * Initiates or resumes the placement assessment for the authenticated user.
 */
export async function startOrResumePlacementAction(): Promise<StartAssessmentResponse> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.' };
  }

  try {
    const { assessment, questions } = await getPlacementAssessmentWithQuestions();

    if (!assessment || questions.length === 0) {
      return {
        success: false,
        error: 'Bài kiểm tra đầu vào hiện chưa sẵn sàng. Vui lòng thử lại sau.',
      };
    }

    const { attempt, savedAnswers, isResumed } = await getOrCreateAssessmentAttempt(
      user.id,
      assessment.id
    );

    return {
      success: true,
      attemptId: attempt.id,
      questions,
      savedAnswers,
      isResumed,
      timeLimitSeconds: assessment.time_limit_seconds,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Lỗi hệ thống khi bắt đầu bài kiểm tra.';
    return { success: false, error: msg };
  }
}

/**
 * Saves or updates the learner's answer for a specific question during an active attempt.
 */
export async function saveAnswerAction(
  attemptId: string,
  questionId: string,
  selectedOptionId: string,
  timeSpentSeconds: number = 0
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Chưa đăng nhập.' };
  }

  if (!attemptId || !questionId || !selectedOptionId) {
    return { success: false, error: 'Dữ liệu câu trả lời không hợp lệ.' };
  }

  return await saveLearnerAnswer(
    user.id,
    attemptId,
    questionId,
    selectedOptionId,
    timeSpentSeconds
  );
}

/**
 * Submits the assessment attempt, triggering server-side evaluation and scoring.
 */
export async function submitAssessmentAction(
  attemptId: string
): Promise<{ success: boolean; attemptId?: string; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Chưa đăng nhập.' };
  }

  if (!attemptId) {
    return { success: false, error: 'Mã lượt làm bài không hợp lệ.' };
  }

  const result = await submitAndScoreAssessmentAttempt(user.id, attemptId);

  if (!result.success) {
    return { success: false, error: result.error || 'Lỗi khi chấm điểm bài thi.' };
  }

  return { success: true, attemptId };
}
