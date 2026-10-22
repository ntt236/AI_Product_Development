'use server';

import { createClient } from '@/lib/supabase/server';
import {
  getToeicForms,
  getToeicFormBySlug,
  getOrCreateToeicAttempt,
  saveToeicAnswer,
  submitToeicTest,
  getToeicResult,
} from './services';
import {
  saveToeicAnswerSchema,
  submitToeicTestSchema,
} from './types';
import { explainToeicQuestionWithAi } from './evaluator';

export async function getToeicFormsAction() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Vui lòng đăng nhập để xem danh sách đề thi TOEIC.', forms: [] };
    }

    const forms = await getToeicForms();
    return { success: true, forms };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Không thể tải danh sách đề thi lúc này.',
      forms: [],
    };
  }
}

export async function getToeicFormAction(slug: string) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Vui lòng đăng nhập để bắt đầu bài thi.' };
    }

    const result = await getToeicFormBySlug(slug);
    if (!result.form) {
      return { success: false, error: 'Không tìm thấy đề thi TOEIC này hoặc chưa được mở.' };
    }

    // Retrieve or initialize in-progress attempt
    const attemptData = await getOrCreateToeicAttempt(user.id, result.form.id);

    return {
      success: true,
      form: result.form,
      questions: result.questions,
      attempt: attemptData.attempt,
      savedAnswers: attemptData.savedAnswers,
      isResumed: attemptData.isResumed,
    };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Không thể khởi tạo bài thi.',
    };
  }
}

export async function saveToeicAnswerAction(input: {
  attemptId: string;
  questionId: string;
  selectedOptionId: string;
  timeSpentSeconds?: number;
}) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Phiên làm việc hết hạn.' };
    }

    const parsed = saveToeicAnswerSchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message || 'Dữ liệu không hợp lệ.' };
    }

    const ok = await saveToeicAnswer({
      userId: user.id,
      attemptId: parsed.data.attemptId,
      questionId: parsed.data.questionId,
      selectedOptionId: parsed.data.selectedOptionId,
      timeSpentSeconds: parsed.data.timeSpentSeconds,
    });

    return { success: ok };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Không thể tự động lưu câu trả lời.',
    };
  }
}

export async function submitToeicTestAction(input: {
  attemptId: string;
  timeSpentSeconds: number;
  answers: Record<string, string>;
}) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Phiên làm việc hết hạn. Vui lòng đăng nhập lại.' };
    }

    const parsed = submitToeicTestSchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message || 'Dữ liệu nộp bài không hợp lệ.' };
    }

    const result = await submitToeicTest({
      userId: user.id,
      attemptId: parsed.data.attemptId,
      timeSpentSeconds: parsed.data.timeSpentSeconds,
      answers: parsed.data.answers,
    });

    return {
      success: true,
      attemptId: result.attemptId,
      alreadySubmitted: result.alreadySubmitted,
      outcome: result.outcome,
    };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Lỗi trong quá trình chấm điểm bài thi.',
    };
  }
}

export async function getToeicResultAction(attemptId: string) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Vui lòng đăng nhập để xem bảng điểm.' };
    }

    const result = await getToeicResult(user.id, attemptId);
    if (!result) {
      return { success: false, error: 'Không tìm thấy kết quả lượt thi hoặc bạn không có quyền xem.' };
    }

    return {
      success: true,
      data: result,
    };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Không thể tải bảng kết quả TOEIC.',
    };
  }
}

export async function askToeicAiTutorAction(params: {
  questionNumber: number;
  partNumber: number;
  prompt: string;
  contextText?: string | null;
  transcriptText?: string | null;
  options: { id: string; text: string }[];
  selectedOptionId: string | null;
  correctOptionId: string;
  officialExplanation: string;
  userPrompt: string;
}) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Vui lòng đăng nhập để hỏi AI Tutor.' };
    }

    const explanation = await explainToeicQuestionWithAi(params);
    return { success: true, explanation };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Không thể kết nối với AI Tutor lúc này.',
    };
  }
}
