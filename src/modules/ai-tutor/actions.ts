'use server';

import { createClient } from '@/lib/supabase/server';
import { explainPracticeExercise } from './services';
import type { ExerciseExplanationRequest, AITutorExplanationResponse } from './types';

/**
 * Server Action for requesting an AI Tutor explanation on a practice question.
 */
export async function getAITutorExplanationAction(
  input: ExerciseExplanationRequest
): Promise<AITutorExplanationResponse> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      success: false,
      error: 'Vui lòng đăng nhập để sử dụng tính năng Gia sư AI.',
      errorCode: 'UNAUTHENTICATED',
    };
  }

  return explainPracticeExercise(user.id, input);
}
