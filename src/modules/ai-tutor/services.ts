import { getAIProvider, checkAIRateLimit, logAIUsage } from '@/lib/ai';
import {
  ExerciseExplanationRequestSchema,
  AITutorExplanationSchema,
  type ExerciseExplanationRequest,
  type AITutorExplanation,
  type AITutorExplanationResponse,
} from './types';
import {
  buildExerciseExplanationPrompt,
  TUTOR_EXERCISE_EXPLANATION_VERSION,
} from './prompts';
import { getTutorLearnerContext, getVerifiedExerciseContext } from './context';

/**
 * Generates an AI Tutor explanation for a verified practice question submission.
 *
 * Rules:
 * - Anti-IDOR: Rejects if the submission does not belong to the authenticated user.
 * - Anti-Tamper: Uses authoritative question prompt and teacher explanation from database.
 * - Rate limited server-side to prevent quota abuse.
 * - Bounded fallback: If the AI provider fails, returns a validated fallback without crashing.
 * - Never alters authoritative assessment scores or exercise completion records.
 */
export async function explainPracticeExercise(
  userId: string,
  rawInput: ExerciseExplanationRequest
): Promise<AITutorExplanationResponse> {
  // 1. Runtime Input Validation
  const parsed = ExerciseExplanationRequestSchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || 'Dữ liệu yêu cầu không hợp lệ.',
      errorCode: 'VALIDATION_ERROR',
    };
  }

  const { submissionId, exerciseId, userQuery } = parsed.data;

  // 2. Server-Side Rate Limiting
  const rateLimit = await checkAIRateLimit(userId);
  if (!rateLimit.allowed) {
    const errorMsg = `Bạn đã gửi quá nhiều yêu cầu đến AI Tutor (giới hạn ${rateLimit.maxRequests} lần/5 phút). Vui lòng thử lại sau ${rateLimit.retryAfterSeconds || 60} giây.`;

    await logAIUsage({
      userId,
      feature: 'exercise_explanation',
      provider: 'system',
      model: 'rate-limiter',
      promptVersion: TUTOR_EXERCISE_EXPLANATION_VERSION,
      status: 'error',
      latencyMs: 1,
      errorCode: 'RATE_LIMITED',
    });

    return {
      success: false,
      error: errorMsg,
      errorCode: 'RATE_LIMITED',
      retryAfterSeconds: rateLimit.retryAfterSeconds,
    };
  }

  // 3. Authorization and Verified Context Retrieval (Anti-IDOR)
  const contextRes = await getVerifiedExerciseContext(userId, submissionId, exerciseId, userQuery);
  if (!contextRes.success || !contextRes.context) {
    return {
      success: false,
      error: contextRes.error || 'Không tìm thấy ngữ cảnh câu hỏi.',
      errorCode: 'FORBIDDEN_OR_NOT_FOUND',
    };
  }

  const exerciseContext = contextRes.context;
  const learnerContext = await getTutorLearnerContext(userId);

  // 4. Build Versioned Prompt
  const promptPackage = buildExerciseExplanationPrompt(learnerContext, exerciseContext);

  // 5. Invoke AI Provider with Performance Telemetry
  const provider = getAIProvider();
  const startMs = Date.now();

  try {
    const aiResult = await provider.generateStructuredOutput<AITutorExplanation>({
      prompt: promptPackage.prompt,
      systemPrompt: promptPackage.systemPrompt,
      schemaDescription: promptPackage.schemaDescription,
      temperature: 0.2,
      maxTokens: 1200,
      timeoutMs: 25000,
      validator: (data): data is AITutorExplanation => {
        return AITutorExplanationSchema.safeParse(data).success;
      },
    });

    const latencyMs = Date.now() - startMs;

    // Log success usage
    await logAIUsage({
      userId,
      feature: 'exercise_explanation',
      provider: provider.providerName,
      model: aiResult.model,
      promptVersion: promptPackage.promptVersion,
      status: 'success',
      latencyMs,
      tokenCount: aiResult.tokenCount,
      metadata: {
        submission_id: submissionId,
        exercise_id: exerciseId,
        is_correct: exerciseContext.isCorrect,
      },
    });

    return {
      success: true,
      explanation: aiResult.data,
      promptVersion: promptPackage.promptVersion,
      model: aiResult.model,
      isFallback: false,
    };
  } catch (err: unknown) {
    const latencyMs = Date.now() - startMs;
    const errorMessage = err instanceof Error ? err.message : String(err);

    // 6. Safe Pedagogical Fallback when AI Provider is unavailable/times out
    const fallbackExplanation: AITutorExplanation = {
      explanation: exerciseContext.isCorrect
        ? `Làm tốt lắm! Bạn đã trả lời chính xác: "${exerciseContext.correctAnswer}". ${exerciseContext.teacherExplanation}`
        : `Bạn đã chọn "${exerciseContext.userAnswer}". Đáp án chính xác là "${exerciseContext.correctAnswer}". ${exerciseContext.teacherExplanation}`,
      rule_summary: `Quy tắc cốt lõi: Hãy chú ý ngữ cảnh và cấu trúc trong câu "${exerciseContext.prompt}".`,
      examples: [
        `Ví dụ 1: Cấu trúc với "${exerciseContext.correctAnswer}" rất phổ biến trong giao tiếp hàng ngày.`,
        `Ví dụ 2: Hãy ghi nhớ mẹo nhận biết từ lời giải thích: ${exerciseContext.teacherExplanation.slice(0, 80)}...`,
      ],
      next_step_tip: `Hãy tiếp tục luyện tập thêm các câu hỏi trong bài "${exerciseContext.lessonTitle}" để củng cố phản xạ nhé!`,
    };

    // Log fallback telemetry
    await logAIUsage({
      userId,
      feature: 'exercise_explanation',
      provider: provider.providerName,
      model: provider.defaultModel,
      promptVersion: promptPackage.promptVersion,
      status: 'fallback',
      latencyMs,
      errorCode: errorMessage.split(':')[0] || 'AI_PROVIDER_ERROR',
      metadata: {
        submission_id: submissionId,
        exercise_id: exerciseId,
        error_detail: errorMessage.slice(0, 200),
      },
    });

    return {
      success: true,
      explanation: fallbackExplanation,
      promptVersion: promptPackage.promptVersion,
      model: `${provider.defaultModel} (fallback)`,
      isFallback: true,
    };
  }
}
