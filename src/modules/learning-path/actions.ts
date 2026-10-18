'use server';

import { createClient } from '@/lib/supabase/server';
import {
  getUserLearningPath,
  generateAndPersistProposedPath,
  acceptLearningPath,
  rejectLearningPath,
  pauseLearningPath,
  resumeLearningPath,
  customizeLearningPathStructure,
  startPracticeForTopic,
} from './services';
import { revalidatePath } from 'next/cache';
import type {
  LearningPath,
  LearningPathItem,
  LearningPathVersion,
  LearnerProfileSummary,
} from './types';

export interface GetLearningPathResponse {
  success: boolean;
  path?: LearningPath | null;
  items?: LearningPathItem[];
  versions?: LearningPathVersion[];
  profile?: LearnerProfileSummary | null;
  error?: string;
}

export interface LearningPathActionResponse {
  success: boolean;
  pathId?: string;
  newVersion?: number;
  error?: string;
}

/**
 * Retrieves the current learning path, items, version history, and learner profile.
 */
export async function getUserLearningPathAction(): Promise<GetLearningPathResponse> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.' };
  }

  try {
    const result = await getUserLearningPath(user.id);
    return {
      success: true,
      path: result.path,
      items: result.items,
      versions: result.versions,
      profile: result.profile,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Lỗi hệ thống khi tải lộ trình học.';
    return { success: false, error: msg };
  }
}

/**
 * Generates and stores a proposed Learning Path if none is active or proposed.
 */
export async function generateProposedPathAction(): Promise<LearningPathActionResponse> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.' };
  }

  try {
    return await generateAndPersistProposedPath(user.id);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Lỗi hệ thống khi tạo lộ trình.';
    return { success: false, error: msg };
  }
}

/**
 * Accepts and activates a proposed learning path.
 */
export async function acceptPathAction(pathId: string): Promise<LearningPathActionResponse> {
  if (!pathId || typeof pathId !== 'string') {
    return { success: false, error: 'ID lộ trình không hợp lệ.' };
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: 'Phiên đăng nhập đã hết hạn.' };
  }

  try {
    return await acceptLearningPath(user.id, pathId);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Lỗi hệ thống khi chấp nhận lộ trình.';
    return { success: false, error: msg };
  }
}

/**
 * Rejects a proposed learning path.
 */
export async function rejectPathAction(pathId: string): Promise<LearningPathActionResponse> {
  if (!pathId || typeof pathId !== 'string') {
    return { success: false, error: 'ID lộ trình không hợp lệ.' };
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: 'Phiên đăng nhập đã hết hạn.' };
  }

  try {
    return await rejectLearningPath(user.id, pathId);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Lỗi hệ thống khi từ chối lộ trình.';
    return { success: false, error: msg };
  }
}

/**
 * Pauses an active learning path.
 */
export async function pausePathAction(pathId: string): Promise<LearningPathActionResponse> {
  if (!pathId || typeof pathId !== 'string') {
    return { success: false, error: 'ID lộ trình không hợp lệ.' };
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: 'Phiên đăng nhập đã hết hạn.' };
  }

  try {
    return await pauseLearningPath(user.id, pathId);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Lỗi hệ thống khi tạm dừng lộ trình.';
    return { success: false, error: msg };
  }
}

/**
 * Resumes a paused learning path.
 */
export async function resumePathAction(pathId: string): Promise<LearningPathActionResponse> {
  if (!pathId || typeof pathId !== 'string') {
    return { success: false, error: 'ID lộ trình không hợp lệ.' };
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: 'Phiên đăng nhập đã hết hạn.' };
  }

  try {
    return await resumeLearningPath(user.id, pathId);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Lỗi hệ thống khi tiếp tục lộ trình.';
    return { success: false, error: msg };
  }
}

/**
 * Customizes the learning path structure with optimistic version concurrency.
 */
export async function customizePathAction(
  pathId: string,
  expectedVersion: number,
  changeReason: string,
  reorderedItemIds: string[]
): Promise<LearningPathActionResponse> {
  if (!pathId || typeof pathId !== 'string') {
    return { success: false, error: 'ID lộ trình không hợp lệ.' };
  }

  if (typeof expectedVersion !== 'number' || expectedVersion < 1) {
    return { success: false, error: 'Phiên bản lộ trình không hợp lệ.' };
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: 'Phiên đăng nhập đã hết hạn.' };
  }

  try {
    return await customizeLearningPathStructure(
      user.id,
      pathId,
      expectedVersion,
      changeReason,
      reorderedItemIds
    );
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Lỗi hệ thống khi tùy chỉnh lộ trình.';
    return { success: false, error: msg };
  }
}

export interface StartTopicPracticeResponse {
  success: boolean;
  taskId?: string;
  error?: string;
}

/**
 * Starts a practice session for an available Learning Path topic,
 * ensuring a corresponding task exists in today's Daily Plan.
 */
export async function startTopicPracticeAction(
  topicId: string
): Promise<StartTopicPracticeResponse> {
  if (!topicId || typeof topicId !== 'string') {
    return { success: false, error: 'ID chủ đề không hợp lệ.' };
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.' };
  }

  try {
    const res = await startPracticeForTopic(user.id, topicId);
    if (res.success) {
      revalidatePath('/learning-path');
      revalidatePath('/daily-plan');
    }
    return res;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Lỗi hệ thống khi chuẩn bị bài luyện tập.';
    return { success: false, error: msg };
  }
}
