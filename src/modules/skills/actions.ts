'use server';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getOrCreateTodayDailyPlan, recalculatePlanStatus } from '@/modules/daily-plan/services';
import { matchTopicToContentItem } from '@/modules/learning-path/curriculum';
import {
  getSkillsCatalog,
  submitWritingPractice,
  submitSpeakingPractice,
} from './services';
import {
  submitWritingInputSchema,
  submitSpeakingInputSchema,
} from './types';

export async function getSkillsCatalogAction() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Vui lòng đăng nhập để xem danh mục bài học.', catalog: [] };
    }

    const catalog = await getSkillsCatalog();
    return { success: true, catalog };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Không thể tải danh mục kỹ năng lúc này.',
      catalog: [],
    };
  }
}

export async function submitWritingPracticeAction(
  taskId: string | null | undefined,
  contentItemId: string,
  essayText: string,
  durationSeconds: number
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Phiên làm việc hết hạn. Vui lòng đăng nhập lại.' };
    }

    const cleanTaskId = taskId && typeof taskId === 'string' && taskId.trim().length > 0 ? taskId.trim() : null;

    const parseResult = submitWritingInputSchema.safeParse({
      taskId: cleanTaskId,
      contentItemId,
      essayText,
      durationSeconds,
    });

    if (!parseResult.success) {
      return {
        success: false,
        error: parseResult.error.issues[0]?.message || 'Dữ liệu bài viết không hợp lệ.',
      };
    }

    return await submitWritingPractice(
      user.id,
      parseResult.data.taskId || null,
      parseResult.data.contentItemId,
      parseResult.data.essayText,
      parseResult.data.durationSeconds
    );
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Lỗi hệ thống khi nộp bài viết.',
    };
  }
}

export async function submitSpeakingPracticeAction(
  taskId: string | null | undefined,
  contentItemId: string,
  transcriptText: string,
  durationSeconds: number
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Phiên làm việc hết hạn. Vui lòng đăng nhập lại.' };
    }

    const cleanTaskId = taskId && typeof taskId === 'string' && taskId.trim().length > 0 ? taskId.trim() : null;

    const parseResult = submitSpeakingInputSchema.safeParse({
      taskId: cleanTaskId,
      contentItemId,
      transcriptText,
      durationSeconds,
    });

    if (!parseResult.success) {
      return {
        success: false,
        error: parseResult.error.issues[0]?.message || 'Dữ liệu transcript nói không hợp lệ.',
      };
    }

    return await submitSpeakingPractice(
      user.id,
      parseResult.data.taskId || null,
      parseResult.data.contentItemId,
      parseResult.data.transcriptText,
      parseResult.data.durationSeconds
    );
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Lỗi hệ thống khi nộp transcript nói.',
    };
  }
}

export async function startSkillPracticeAction(slug: string): Promise<{
  success: boolean;
  taskId?: string;
  error?: string;
}> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Phiên làm việc hết hạn. Vui lòng đăng nhập lại.' };
    }

    const adminClient = createAdminClient();

    // 1. Find content item
    const { data: item } = await adminClient
      .from('content_items')
      .select('id, title, description, skill, estimated_minutes, slug')
      .eq('slug', slug)
      .eq('is_published', true)
      .maybeSingle();

    if (!item) {
      return { success: false, error: 'Bài học này hiện chưa sẵn sàng hoặc không tồn tại.' };
    }

    // 2. Get or create today's daily plan
    const planRes = await getOrCreateTodayDailyPlan(user.id);
    if (!planRes.success || !planRes.plan) {
      return { success: false, error: planRes.error || 'Không thể lấy kế hoạch học tập của ngày.' };
    }

    // 3. Direct DB check if task already exists in today's plan (guards against race conditions)
    const { data: directExisting } = await adminClient
      .from('daily_plan_tasks')
      .select('id')
      .eq('daily_plan_id', planRes.plan.id)
      .eq('content_item_id', item.id)
      .maybeSingle();

    if (directExisting) {
      return { success: true, taskId: directExisting.id };
    }

    // 4. Progressive Linkage: Check if user has an active learning path with a matching topic
    let matchedTopicId: string | null = null;
    try {
      const { data: activePath } = await adminClient
        .from('learning_paths')
        .select('id')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (activePath) {
        const { data: topics } = await adminClient
          .from('learning_path_items')
          .select('id, metadata, title, skill, status')
          .eq('learning_path_id', activePath.id)
          .eq('item_type', 'topic');

        if (topics) {
          for (const t of topics) {
            const matched = matchTopicToContentItem(t, [item]);
            if (matched && matched.id === item.id) {
              matchedTopicId = t.id;
              break;
            }
          }
        }
      }
    } catch {
      // Non-blocking topic resolution
    }

    // 5. Query highest position to place new task at the end
    const { data: currentTasks } = await adminClient
      .from('daily_plan_tasks')
      .select('position')
      .eq('daily_plan_id', planRes.plan.id);

    const maxPosition = (currentTasks || []).reduce((max, t) => Math.max(max, t.position), 0);

    // 6. Create task in today's plan
    const { data: newTask, error: insertError } = await adminClient
      .from('daily_plan_tasks')
      .insert({
        daily_plan_id: planRes.plan.id,
        user_id: user.id,
        learning_path_item_id: matchedTopicId,
        content_item_id: item.id,
        title: item.title,
        description: item.description,
        activity_type: 'practice',
        skill: item.skill,
        position: maxPosition + 1,
        estimated_minutes: item.estimated_minutes > 0 ? item.estimated_minutes : 15,
        content_status: 'available',
        status: 'pending',
      })
      .select('id')
      .single();

    if (insertError || !newTask) {
      return { success: false, error: 'Không thể thêm bài học vào kế hoạch ngày.' };
    }

    // 7. Recalculate plan status to reflect newly added task
    await recalculatePlanStatus(adminClient, planRes.plan.id);

    return { success: true, taskId: newTask.id };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Lỗi hệ thống khi bắt đầu bài học.',
    };
  }
}

