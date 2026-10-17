'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import {
  getOrCreateTodayDailyPlan,
  reorderDailyTasks,
  skipDailyTask,
  getContentItemWithExercises,
  submitPracticeAnswers,
} from './services';
import type {
  ContentItem,
  DailyPlan,
  PracticeExerciseClient,
  PracticeSubmissionResult,
} from './types';

export interface DailyPlanResponse {
  success: boolean;
  plan?: DailyPlan;
  error?: string;
}

export interface PracticeContentResponse {
  success: boolean;
  contentItem?: ContentItem | null;
  exercises?: PracticeExerciseClient[];
  error?: string;
}

export interface PracticeSubmitResponse {
  success: boolean;
  result?: PracticeSubmissionResult;
  error?: string;
}

const reorderSchema = z.object({
  planId: z.string().uuid('ID kế hoạch không hợp lệ.'),
  reorderedTaskIds: z
    .array(z.string().uuid('ID nhiệm vụ không hợp lệ.'))
    .min(1, 'Danh sách nhiệm vụ không được để trống.'),
});

const skipTaskSchema = z.object({
  taskId: z.string().uuid('ID nhiệm vụ không hợp lệ.'),
});

const submitPracticeSchema = z.object({
  taskId: z.string().uuid('ID nhiệm vụ không hợp lệ.').nullable().optional(),
  contentItemId: z.string().uuid('ID nội dung không hợp lệ.'),
  answers: z
    .array(
      z.object({
        exercise_id: z.string().uuid('ID câu hỏi không hợp lệ.'),
        selected_option_id: z.string().min(1, 'Đáp án lựa chọn không được để trống.'),
      })
    )
    .min(1, 'Phải nộp ít nhất 1 câu trả lời.'),
  durationSeconds: z.number().int().min(0).default(0),
});

/**
 * Gets or creates today's daily plan for the authenticated user.
 */
export async function getTodayDailyPlanAction(dateStr?: string): Promise<DailyPlanResponse> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.' };
  }

  try {
    return await getOrCreateTodayDailyPlan(user.id, dateStr);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Lỗi hệ thống khi tải kế hoạch học tập.';
    return { success: false, error: msg };
  }
}

/**
 * Reorders tasks in a daily plan.
 */
export async function reorderDailyTasksAction(
  planId: string,
  reorderedTaskIds: string[]
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.' };
  }

  const parsed = reorderSchema.safeParse({ planId, reorderedTaskIds });
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || 'Dữ liệu không hợp lệ.' };
  }

  try {
    const res = await reorderDailyTasks(user.id, planId, reorderedTaskIds);
    if (res.success) {
      revalidatePath('/daily-plan');
      revalidatePath('/dashboard');
    }
    return res;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Lỗi hệ thống khi sắp xếp lại nhiệm vụ.';
    return { success: false, error: msg };
  }
}

/**
 * Skips a pending daily task.
 */
export async function skipDailyTaskAction(
  taskId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.' };
  }

  const parsed = skipTaskSchema.safeParse({ taskId });
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || 'Dữ liệu không hợp lệ.' };
  }

  try {
    const res = await skipDailyTask(user.id, taskId);
    if (res.success) {
      revalidatePath('/daily-plan');
      revalidatePath('/dashboard');
    }
    return res;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Lỗi hệ thống khi bỏ qua nhiệm vụ.';
    return { success: false, error: msg };
  }
}

/**
 * Loads a content item with its exercises (safe for client, no answers exposed).
 */
export async function getPracticeContentAction(
  contentItemIdOrSlug: string
): Promise<PracticeContentResponse> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.' };
  }

  try {
    const { contentItem, exercises } = await getContentItemWithExercises(contentItemIdOrSlug);
    if (!contentItem) {
      return { success: false, error: 'Không tìm thấy nội dung bài học.' };
    }
    return { success: true, contentItem, exercises };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Lỗi hệ thống khi tải bài tập.';
    return { success: false, error: msg };
  }
}

/**
 * Submits practice answers for server-side evaluation and scoring.
 */
export async function submitPracticeAction(
  taskId: string | null | undefined,
  contentItemId: string,
  answers: Array<{ exercise_id: string; selected_option_id: string }>,
  durationSeconds: number
): Promise<PracticeSubmitResponse> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.' };
  }

  const parsed = submitPracticeSchema.safeParse({
    taskId: taskId || null,
    contentItemId,
    answers,
    durationSeconds,
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || 'Dữ liệu nộp bài không hợp lệ.' };
  }

  try {
    const res = await submitPracticeAnswers(
      user.id,
      taskId || null,
      contentItemId,
      answers,
      durationSeconds
    );

    if (res.success) {
      revalidatePath('/daily-plan');
      revalidatePath('/dashboard');
      revalidatePath('/learning-path');
    }

    return res;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Lỗi hệ thống khi nộp bài tập.';
    return { success: false, error: msg };
  }
}
