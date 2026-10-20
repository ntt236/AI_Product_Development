import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import type {
  ContentItem,
  DailyPlan,
  DailyPlanStatus,
  PracticeExerciseClient,
  PracticeSubmissionResult,
  QuestionFeedbackItem,
  UserPracticeAnswerInput,
} from './types';
import { generateDailyPlanProposal, type GeneratorPathItem } from './generator';
import { recordStudyActivity } from '@/modules/streak/services';

export function getTodayDateString(): string {
  return new Date().toISOString().split('T')[0];
}

/**
 * Retrieves the daily plan for a user on a given date (defaults to today).
 */
export async function getDailyPlan(
  userId: string,
  dateStr?: string
): Promise<DailyPlan | null> {
  const targetDate = dateStr || getTodayDateString();
  const supabase = await createClient();

  const { data: plan, error: planError } = await supabase
    .from('daily_plans')
    .select('*')
    .eq('user_id', userId)
    .eq('plan_date', targetDate)
    .maybeSingle();

  if (planError || !plan) {
    return null;
  }

  const { data: tasks, error: taskError } = await supabase
    .from('daily_plan_tasks')
    .select('*')
    .eq('daily_plan_id', plan.id)
    .order('position', { ascending: true });

  if (taskError) {
    return null;
  }

  return {
    ...plan,
    tasks: tasks || [],
  };
}

/**
 * Gets or atomically creates the daily plan for today based on active learning path,
 * user preferences, and available curated content.
 */
export async function getOrCreateTodayDailyPlan(
  userId: string,
  dateStr?: string
): Promise<{ success: boolean; plan?: DailyPlan; error?: string }> {
  const targetDate = dateStr || getTodayDateString();
  const adminClient = createAdminClient();

  // 1. Try to get existing plan first (idempotent)
  const existing = await getDailyPlan(userId, targetDate);
  if (existing) {
    return { success: true, plan: existing };
  }

  // 2. Fetch user preferences
  const { data: preferences } = await adminClient
    .from('learner_preferences')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  // 3. Fetch primary active goal
  const { data: goals } = await adminClient
    .from('goals')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'active');
  const primaryGoal = goals?.find((g) => g.priority === 'primary')?.title;

  // 4. Fetch active learning path with its items
  const { data: activePath } = await adminClient
    .from('learning_paths')
    .select('id, title, status')
    .eq('user_id', userId)
    .eq('status', 'active')
    .maybeSingle();

  let activePathItems: GeneratorPathItem[] = [];
  if (activePath) {
    const { data: items } = await adminClient
      .from('learning_path_items')
      .select('id, title, description, skill, item_type, position, estimated_minutes, status, content_status, parent_id')
      .eq('learning_path_id', activePath.id)
      .order('position', { ascending: true });
    activePathItems = (items || []) as unknown as GeneratorPathItem[];
  }

  // 5. Fetch published curated content items
  const { data: curatedItems } = await adminClient
    .from('content_items')
    .select('*')
    .eq('is_published', true)
    .order('created_at', { ascending: true });

  // 6. Generate proposal deterministically
  const proposal = generateDailyPlanProposal({
    userId,
    planDate: targetDate,
    dailyMinutes: preferences?.daily_minutes,
    preferredStudyDays: preferences?.preferred_study_days,
    primaryGoal,
    activePath: activePath
      ? {
          id: activePath.id,
          title: activePath.title,
          status: activePath.status,
          items: activePathItems,
        }
      : null,
    curatedContentItems: (curatedItems as ContentItem[]) || [],
  });

  // 7. Insert plan record
  const { data: createdPlan, error: insertPlanError } = await adminClient
    .from('daily_plans')
    .insert({
      user_id: userId,
      learning_path_id: activePath ? activePath.id : null,
      plan_date: targetDate,
      target_minutes: proposal.target_minutes,
      completed_minutes: 0,
      status: 'planned',
      generation_reason: proposal.generation_reason,
    })
    .select('*')
    .single();

  if (insertPlanError || !createdPlan) {
    // Check if another concurrent request already created it
    const concurrentPlan = await getDailyPlan(userId, targetDate);
    if (concurrentPlan) {
      return { success: true, plan: concurrentPlan };
    }
    return { success: false, error: 'Không thể khởi tạo kế hoạch học tập ngày.' };
  }

  // 8. Insert tasks
  const tasksToInsert = proposal.tasks.map((t) => ({
    daily_plan_id: createdPlan.id,
    user_id: userId,
    learning_path_item_id: t.learning_path_item_id || null,
    content_item_id: t.content_item_id || null,
    title: t.title,
    description: t.description || null,
    activity_type: t.activity_type,
    skill: t.skill || null,
    position: t.position,
    estimated_minutes: t.estimated_minutes,
    content_status: t.content_status,
    status: t.status,
  }));

  const { data: insertedTasks, error: insertTasksError } = await adminClient
    .from('daily_plan_tasks')
    .insert(tasksToInsert)
    .select('*')
    .order('position', { ascending: true });

  if (insertTasksError) {
    return { success: false, error: 'Không thể lưu danh sách nhiệm vụ của ngày.' };
  }

  // 9. Emit telemetry event
  await adminClient.from('learning_events').insert({
    user_id: userId,
    event_type: 'plan_generated',
    entity_type: 'daily_plan',
    entity_id: createdPlan.id,
    payload: {
      plan_date: targetDate,
      task_count: insertedTasks.length,
      target_minutes: createdPlan.target_minutes,
    },
  });

  return {
    success: true,
    plan: {
      ...createdPlan,
      tasks: insertedTasks || [],
    },
  };
}

/**
 * Reorders tasks within a daily plan. Validates ownership, task existence,
 * and sibling group completeness (no partial lists, no duplicates).
 */
export async function reorderDailyTasks(
  userId: string,
  planId: string,
  reorderedTaskIds: string[]
): Promise<{ success: boolean; error?: string }> {
  if (!reorderedTaskIds || reorderedTaskIds.length === 0) {
    return { success: false, error: 'Danh sách thứ tự không được để trống.' };
  }

  // Reject duplicates
  const uniqueIds = new Set(reorderedTaskIds);
  if (uniqueIds.size !== reorderedTaskIds.length) {
    return { success: false, error: 'Danh sách ID nhiệm vụ bị trùng lặp.' };
  }

  const adminClient = createAdminClient();

  // Verify plan ownership
  const { data: plan } = await adminClient
    .from('daily_plans')
    .select('id, user_id, status')
    .eq('id', planId)
    .maybeSingle();

  if (!plan || plan.user_id !== userId) {
    return { success: false, error: 'Không tìm thấy kế hoạch hoặc bạn không có quyền.' };
  }

  if (plan.status === 'completed' || plan.status === 'skipped') {
    return { success: false, error: 'Không thể sắp xếp lại kế hoạch đã hoàn thành hoặc bỏ qua.' };
  }

  // Fetch all tasks in this plan
  const { data: tasks } = await adminClient
    .from('daily_plan_tasks')
    .select('id, position')
    .eq('daily_plan_id', planId);

  if (!tasks || tasks.length !== reorderedTaskIds.length) {
    return {
      success: false,
      error: `Danh sách phải bao gồm đầy đủ toàn bộ ${tasks?.length || 0} nhiệm vụ của kế hoạch.`,
    };
  }

  // Ensure all submitted task IDs belong to this plan
  const planTaskIds = new Set(tasks.map((t) => t.id));
  for (const id of reorderedTaskIds) {
    if (!planTaskIds.has(id)) {
      return { success: false, error: 'Phát hiện nhiệm vụ không thuộc kế hoạch này.' };
    }
  }

  // Atomically update positions
  for (let idx = 0; idx < reorderedTaskIds.length; idx++) {
    await adminClient
      .from('daily_plan_tasks')
      .update({ position: idx + 1, updated_at: new Date().toISOString() })
      .eq('id', reorderedTaskIds[idx])
      .eq('daily_plan_id', planId);
  }

  // Log event
  await adminClient.from('learning_events').insert({
    user_id: userId,
    event_type: 'task_reordered',
    entity_type: 'daily_plan',
    entity_id: planId,
    payload: {
      new_order: reorderedTaskIds,
    },
  });

  return { success: true };
}

/**
 * Skips a pending daily task and updates plan progress accordingly.
 */
export async function skipDailyTask(
  userId: string,
  taskId: string
): Promise<{ success: boolean; error?: string }> {
  const adminClient = createAdminClient();

  // Fetch task and verify ownership
  const { data: task } = await adminClient
    .from('daily_plan_tasks')
    .select('id, user_id, daily_plan_id, status, estimated_minutes')
    .eq('id', taskId)
    .maybeSingle();

  if (!task || task.user_id !== userId) {
    return { success: false, error: 'Không tìm thấy nhiệm vụ hoặc bạn không có quyền.' };
  }

  if (task.status !== 'pending') {
    return { success: false, error: `Không thể bỏ qua nhiệm vụ đang ở trạng thái ${task.status}.` };
  }

  const now = new Date().toISOString();

  // Update task status to skipped
  await adminClient
    .from('daily_plan_tasks')
    .update({
      status: 'skipped',
      completed_at: now,
      updated_at: now,
    })
    .eq('id', taskId);

  // Recalculate parent plan status
  await recalculatePlanStatus(adminClient, task.daily_plan_id);

  // Log event
  await adminClient.from('learning_events').insert({
    user_id: userId,
    event_type: 'task_skipped',
    entity_type: 'daily_plan_task',
    entity_id: taskId,
    payload: {
      daily_plan_id: task.daily_plan_id,
    },
  });

  return { success: true };
}

/**
 * Retrieves content item and its exercises (omitting private answer keys).
 */
export async function getContentItemWithExercises(
  contentItemIdOrSlug: string
): Promise<{
  contentItem: ContentItem | null;
  exercises: PracticeExerciseClient[];
}> {
  const supabase = await createClient();

  // Check if uuid or slug
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    contentItemIdOrSlug
  );

  let query = supabase.from('content_items').select('*').eq('is_published', true);
  if (isUuid) {
    query = query.eq('id', contentItemIdOrSlug);
  } else {
    query = query.eq('slug', contentItemIdOrSlug);
  }

  const { data: item } = await query.maybeSingle();
  if (!item) {
    return { contentItem: null, exercises: [] };
  }

  const { data: exercises } = await supabase
    .from('practice_exercises')
    .select('id, content_item_id, exercise_type, prompt, context_text, options, position, weight')
    .eq('content_item_id', item.id)
    .order('position', { ascending: true });

  return {
    contentItem: item as ContentItem,
    exercises: (exercises as PracticeExerciseClient[]) || [],
  };
}

/**
 * Submits practice answers, calculates score server-side, verifies against confidential answer keys,
 * records submission, logs evidence & events, updates task and learning path progress.
 */
export async function submitPracticeAnswers(
  userId: string,
  taskId: string | null,
  contentItemId: string,
  answers: UserPracticeAnswerInput[],
  durationSeconds: number
): Promise<{ success: boolean; result?: PracticeSubmissionResult; error?: string }> {
  if (!answers || !Array.isArray(answers) || answers.length === 0) {
    return { success: false, error: 'Danh sách câu trả lời không được để trống.' };
  }

  const adminClient = createAdminClient();

  // 1. Fetch content item
  const { data: contentItem } = await adminClient
    .from('content_items')
    .select('id, title, skill, estimated_minutes')
    .eq('id', contentItemId)
    .maybeSingle();

  if (!contentItem) {
    return { success: false, error: 'Nội dung bài tập không tồn tại.' };
  }

  // 2. Fetch all questions for this content item
  const { data: exercises } = await adminClient
    .from('practice_exercises')
    .select('id, prompt, weight, position, options')
    .eq('content_item_id', contentItemId)
    .order('position', { ascending: true });

  if (!exercises || exercises.length === 0) {
    return { success: false, error: 'Không tìm thấy câu hỏi cho bài tập này.' };
  }

  // 3. Fetch confidential answer keys (SERVER-ONLY)
  const exerciseIds = exercises.map((e) => e.id);
  const { data: answerKeys } = await adminClient
    .from('practice_exercise_answers')
    .select('exercise_id, correct_option_id, explanation')
    .in('exercise_id', exerciseIds);

  const answerKeyMap = new Map<string, { correct_option_id: string; explanation: string }>();
  for (const k of answerKeys || []) {
    answerKeyMap.set(k.exercise_id, {
      correct_option_id: k.correct_option_id,
      explanation: k.explanation,
    });
  }

  // Map user answers for fast lookup
  const userAnswersMap = new Map<string, string>();
  for (const ans of answers) {
    if (ans.exercise_id && ans.selected_option_id) {
      userAnswersMap.set(ans.exercise_id, ans.selected_option_id.trim());
    }
  }

  // 4. Server-Side Evaluation Engine
  let totalScore = 0;
  let maxScore = 0;
  const breakdown: QuestionFeedbackItem[] = [];

  interface ExerciseOptionRaw {
    id: string;
    text: string;
  }

  for (const ex of exercises) {
    const weight = Number(ex.weight) || 1.0;
    maxScore += weight;

    const key = answerKeyMap.get(ex.id);
    const userAnswer = userAnswersMap.get(ex.id) || '';
    const correctAnswer = key?.correct_option_id || '';

    const isCorrect =
      Boolean(userAnswer) &&
      Boolean(correctAnswer) &&
      userAnswer.toLowerCase() === correctAnswer.toLowerCase();

    if (isCorrect) {
      totalScore += weight;
    }

    const optionList = (Array.isArray(ex.options) ? ex.options : []) as ExerciseOptionRaw[];
    const userOpt = optionList.find((o) => o.id === userAnswer);
    const correctOpt = optionList.find((o) => o.id === correctAnswer);

    const userDisplayText = userOpt ? userOpt.text : (userAnswer || '(Bỏ trống)');
    const correctDisplayText = correctOpt ? correctOpt.text : correctAnswer;

    breakdown.push({
      exercise_id: ex.id,
      prompt: ex.prompt,
      user_answer: userDisplayText,
      correct_answer: correctDisplayText,
      user_option_id: userAnswer,
      correct_option_id: correctAnswer,
      is_correct: isCorrect,
      explanation: key?.explanation || 'Không có giải thích chi tiết.',
    });
  }

  const accuracy = maxScore > 0 ? Number((totalScore / maxScore).toFixed(4)) : 0;
  const percentage = Math.round(accuracy * 100);
  const now = new Date().toISOString();

  // 5. Persist submission
  const { data: submission, error: subError } = await adminClient
    .from('practice_submissions')
    .insert({
      user_id: userId,
      daily_plan_task_id: taskId,
      content_item_id: contentItemId,
      answers,
      score: totalScore,
      max_score: maxScore,
      accuracy,
      feedback: breakdown,
      duration_seconds: Math.max(0, durationSeconds || 0),
    })
    .select('id')
    .single();

  if (subError || !submission) {
    return { success: false, error: 'Không thể lưu kết quả nộp bài.' };
  }

  // 6. Record learning evidence
  await adminClient.from('learning_evidence').insert({
    user_id: userId,
    skill: contentItem.skill,
    source_type: 'practice_exercise',
    source_id: submission.id,
    score: totalScore,
    max_score: maxScore,
    accuracy,
    duration_seconds: Math.max(0, durationSeconds || 0),
    evidence: {
      content_item_id: contentItemId,
      title: contentItem.title,
      total_questions: exercises.length,
      correct_count: breakdown.filter((b) => b.is_correct).length,
    },
  });

  // 7. Emit practice_submitted event
  await adminClient.from('learning_events').insert({
    user_id: userId,
    event_type: 'practice_submitted',
    entity_type: 'practice_submission',
    entity_id: submission.id,
    payload: {
      content_item_id: contentItemId,
      score: totalScore,
      max_score: maxScore,
      accuracy,
    },
  });

  // 8. If linked to a Daily Task, update task status & progress
  let planProgress = {
    completed_tasks: 0,
    total_tasks: 0,
    completed_minutes: 0,
    target_minutes: 30,
    plan_status: 'planned' as DailyPlanStatus,
  };

  if (taskId) {
    const { data: task } = await adminClient
      .from('daily_plan_tasks')
      .select('id, daily_plan_id, estimated_minutes, learning_path_item_id')
      .eq('id', taskId)
      .maybeSingle();

    if (task) {
      // Update task
      await adminClient
        .from('daily_plan_tasks')
        .update({
          status: 'completed',
          score: totalScore,
          accuracy,
          completed_at: now,
          updated_at: now,
        })
        .eq('id', taskId);

      // Add to completed_minutes in daily_plans
      const { data: plan } = await adminClient
        .from('daily_plans')
        .select('id, target_minutes, completed_minutes')
        .eq('id', task.daily_plan_id)
        .maybeSingle();

      if (plan) {
        const newCompletedMins = (plan.completed_minutes || 0) + (task.estimated_minutes || 0);
        await adminClient
          .from('daily_plans')
          .update({
            completed_minutes: newCompletedMins,
            updated_at: now,
          })
          .eq('id', task.daily_plan_id);
      }

      // Recalculate overall plan status
      const updatedStatus = await recalculatePlanStatus(adminClient, task.daily_plan_id);

      // Log task_completed event
      await adminClient.from('learning_events').insert({
        user_id: userId,
        event_type: 'task_completed',
        entity_type: 'daily_plan_task',
        entity_id: taskId,
        payload: {
          score: totalScore,
          accuracy,
        },
      });

      // Update user learning streak
      try {
        await recordStudyActivity(userId, 'practice');
      } catch {
        // Non-blocking streak update
      }

      // Fetch updated plan tasks to return clean progress
      const { data: allPlanTasks } = await adminClient
        .from('daily_plan_tasks')
        .select('status')
        .eq('daily_plan_id', task.daily_plan_id);

      const completedCount = allPlanTasks?.filter((t) => t.status === 'completed').length || 0;
      const totalCount = allPlanTasks?.length || 1;

      planProgress = {
        completed_tasks: completedCount,
        total_tasks: totalCount,
        completed_minutes: (plan?.completed_minutes || 0) + (task.estimated_minutes || 0),
        target_minutes: plan?.target_minutes || 30,
        plan_status: updatedStatus,
      };

      // Progressive unlocking in Learning Path if linked to a topic
      if (task.learning_path_item_id) {
        await unlockNextTopicInLearningPath(adminClient, task.learning_path_item_id);
      }
    }
  }

  return {
    success: true,
    result: {
      submission_id: submission.id,
      task_id: taskId,
      score: totalScore,
      max_score: maxScore,
      accuracy,
      percentage,
      breakdown,
      new_task_status: 'completed',
      plan_progress: planProgress,
    },
  };
}

/**
 * Helper to recalculate and update parent DailyPlan status based on its tasks.
 */
type AdminSupabaseClient = ReturnType<typeof createAdminClient>;

async function recalculatePlanStatus(adminClient: AdminSupabaseClient, planId: string): Promise<DailyPlanStatus> {
  const { data: tasks } = await adminClient
    .from('daily_plan_tasks')
    .select('status')
    .eq('daily_plan_id', planId);

  if (!tasks || tasks.length === 0) {
    return 'planned';
  }

  interface TaskStatusRow {
    status: string;
  }
  const taskRows = tasks as TaskStatusRow[];

  const allCompleted = taskRows.every((t) => t.status === 'completed');
  const allCompletedOrSkipped = taskRows.every(
    (t) => t.status === 'completed' || t.status === 'skipped'
  );
  const someDone = taskRows.some(
    (t) => t.status === 'completed' || t.status === 'in_progress' || t.status === 'skipped'
  );

  let newStatus: DailyPlanStatus = 'planned';
  if (allCompleted) {
    newStatus = 'completed';
  } else if (allCompletedOrSkipped) {
    newStatus = 'partially_completed';
  } else if (someDone) {
    newStatus = 'in_progress';
  }

  await adminClient
    .from('daily_plans')
    .update({
      status: newStatus,
      updated_at: new Date().toISOString(),
    })
    .eq('id', planId);

  return newStatus;
}

/**
 * Progressively unlocks the next topic in the learning path when the current one is completed.
 */
async function unlockNextTopicInLearningPath(adminClient: AdminSupabaseClient, completedTopicId: string) {
  // Find current topic
  const { data: currentTopic } = await adminClient
    .from('learning_path_items')
    .select('id, learning_path_id, parent_id, position, item_type')
    .eq('id', completedTopicId)
    .maybeSingle();

  if (!currentTopic || currentTopic.item_type !== 'topic') {
    return;
  }

  // Update current topic to completed
  await adminClient
    .from('learning_path_items')
    .update({ status: 'completed', updated_at: new Date().toISOString() })
    .eq('id', completedTopicId);

  // Find next topic under the same parent module with position = current.position + 1
  const { data: nextTopic } = await adminClient
    .from('learning_path_items')
    .select('id, status')
    .eq('learning_path_id', currentTopic.learning_path_id)
    .eq('parent_id', currentTopic.parent_id)
    .eq('item_type', 'topic')
    .eq('position', currentTopic.position + 1)
    .maybeSingle();

  if (nextTopic && nextTopic.status === 'locked') {
    await adminClient
      .from('learning_path_items')
      .update({ status: 'available', updated_at: new Date().toISOString() })
      .eq('id', nextTopic.id);
  }
}
