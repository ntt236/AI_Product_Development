import { createAdminClient } from '@/lib/supabase/admin';
import type { LearnerTutorContext, VerifiedExerciseContext } from './types';
import type { QuestionFeedbackItem } from '@/modules/daily-plan/types';

/**
 * Retrieves the learner's estimated English level and primary learning goal.
 */
export async function getTutorLearnerContext(userId: string): Promise<LearnerTutorContext> {
  const adminClient = createAdminClient();

  let level = 'A1';
  let goalTitle = 'Giao tiếp hàng ngày';
  let goalType = 'daily_communication';

  // 1. Fetch profile estimated level
  const { data: profile } = await adminClient
    .from('profiles')
    .select('estimated_level')
    .eq('id', userId)
    .maybeSingle();

  if (profile?.estimated_level) {
    level = profile.estimated_level.toUpperCase();
  }

  // 2. Fetch primary active goal
  const { data: primaryGoal } = await adminClient
    .from('goals')
    .select('title, goal_type')
    .eq('user_id', userId)
    .eq('priority', 'primary')
    .eq('status', 'active')
    .maybeSingle();

  if (primaryGoal) {
    goalTitle = primaryGoal.title || goalTitle;
    goalType = primaryGoal.goal_type || goalType;
  }

  return {
    level,
    goalTitle,
    goalType,
  };
}

/**
 * Validates ownership and extracts verified exercise context from a saved submission.
 * Anti-IDOR: Rejects if the submission does not belong to the user.
 */
export async function getVerifiedExerciseContext(
  userId: string,
  submissionId: string,
  exerciseId: string,
  userQuery?: string
): Promise<{ success: boolean; context?: VerifiedExerciseContext; error?: string }> {
  const adminClient = createAdminClient();

  // 1. Verify submission ownership (Anti-IDOR)
  const { data: submission, error: subError } = await adminClient
    .from('practice_submissions')
    .select('id, user_id, content_item_id, feedback')
    .eq('id', submissionId)
    .eq('user_id', userId)
    .maybeSingle();

  if (subError || !submission) {
    return {
      success: false,
      error: 'Bài nộp không tồn tại hoặc bạn không có quyền truy cập vào nội dung này.',
    };
  }

  // 2. Extract exercise item from verified submission feedback
  const feedbackList = (
    Array.isArray(submission.feedback) ? submission.feedback : []
  ) as QuestionFeedbackItem[];

  const feedbackItem = feedbackList.find((f) => f.exercise_id === exerciseId);

  if (!feedbackItem) {
    return {
      success: false,
      error: 'Câu hỏi không thuộc về bài nộp đã xác thực này.',
    };
  }

  // 3. Fetch content item metadata for title and skill
  let lessonTitle = 'Bài tập thực hành';
  let skill = 'grammar';

  if (submission.content_item_id) {
    const { data: contentItem } = await adminClient
      .from('content_items')
      .select('title, skill')
      .eq('id', submission.content_item_id)
      .maybeSingle();

    if (contentItem) {
      lessonTitle = contentItem.title || lessonTitle;
      skill = contentItem.skill || skill;
    }
  }

  return {
    success: true,
    context: {
      submissionId,
      exerciseId,
      lessonTitle,
      skill,
      prompt: feedbackItem.prompt,
      userAnswer: feedbackItem.user_answer || '(Bỏ trống)',
      correctAnswer: feedbackItem.correct_answer,
      isCorrect: feedbackItem.is_correct,
      teacherExplanation: feedbackItem.explanation || '',
      userQuery: userQuery?.trim() || undefined,
    },
  };
}
