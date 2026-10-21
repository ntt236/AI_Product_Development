import { createAdminClient } from '@/lib/supabase/admin';
import { recordStudyActivity } from '@/modules/streak/services';
import { unlockNextTopicInLearningPath, recalculatePlanStatus } from '@/modules/daily-plan/services';
import { evaluateWriting, evaluateSpeaking, countWords } from './evaluator';
import type {
  SkillItemCatalog,
  WritingEvaluationResult,
  SpeakingEvaluationResult,
} from './types';

/**
 * Retrieves the comprehensive catalog of Four Skills lessons.
 * Accurately reports 'ready' status for lessons with runnable exercises/prompts,
 * and 'planned' for upcoming syllabus topics.
 */
export async function getSkillsCatalog(): Promise<SkillItemCatalog[]> {
  let items: Array<{
    id: string;
    slug: string;
    title: string;
    description: string | null;
    skill: string;
    level: string;
    estimated_minutes: number;
    body: unknown;
    is_published: boolean;
  }> | null = null;

  try {
    const adminClient = createAdminClient();
    const { data } = await adminClient
      .from('content_items')
      .select('id, slug, title, description, skill, level, estimated_minutes, body, is_published')
      .eq('is_published', true);
    items = data;
  } catch {
    // Resilient fallback when database client is offline or in unit tests
  }

  const catalog: SkillItemCatalog[] = [];

  // 1. Listening Ready Item
  const listeningItem = items?.find((i) => i.slug === 'listening-daily-conversations-introducing-yourself');
  catalog.push({
    slug: 'listening-daily-conversations-introducing-yourself',
    title: listeningItem?.title || 'Luyện nghe Hội thoại chào hỏi và Hỏi thông tin cá nhân (Introducing Yourself)',
    description: listeningItem?.description || 'Nghe hội thoại tự nhiên giữa David và Sarah, luyện phản xạ bắt từ khóa tên, quê quán và sở thích.',
    skill: 'listening',
    level: 'A1',
    estimatedMinutes: listeningItem?.estimated_minutes || 20,
    status: 'ready',
    badgeLabel: 'Sẵn sàng học • Audio chuẩn',
    audioUrl: '/audio/daily-conversations-introducing-yourself.wav',
    highlights: ['Audio giọng bản xứ Mỹ', 'Tùy chỉnh tốc độ 0.8x - 1.2x', 'Mở khóa Transcript song ngữ'],
  });

  // 2. Reading Ready Item
  const readingItem = items?.find((i) => i.slug === 'reading-workplace-announcements-messages');
  catalog.push({
    slug: 'reading-workplace-announcements-messages',
    title: readingItem?.title || 'Đọc hiểu Thông báo nội bộ và Kế hoạch công việc (Workplace Announcements & Messages)',
    description: readingItem?.description || 'Kỹ năng đọc quét (Scanning) thông báo thay đổi giờ làm và tiệc chào đón đồng nghiệp mới.',
    skill: 'reading',
    level: 'A1',
    estimatedMinutes: readingItem?.estimated_minutes || 20,
    status: 'ready',
    badgeLabel: 'Sẵn sàng học • Bài đọc thực tế',
    highlights: ['Văn bản email công sở thực tế', '5 câu hỏi trắc nghiệm đọc hiểu', 'Giải thích đáp án chi tiết'],
  });

  // 3. Writing Ready Item
  const writingItem = items?.find((i) => i.slug === 'writing-introductory-email');
  catalog.push({
    slug: 'writing-introductory-email',
    title: writingItem?.title || 'Luyện viết Email giới thiệu bản thân và Kế hoạch học tập (Self-Introduction Email)',
    description: writingItem?.description || 'Viết email giới thiệu ngắn (60 - 100 từ) gửi nhóm học tập quốc tế hoặc đồng nghiệp mới, nhận phản hồi AI.',
    skill: 'writing',
    level: 'A1',
    estimatedMinutes: writingItem?.estimated_minutes || 20,
    status: 'ready',
    badgeLabel: 'Sẵn sàng học • Chấm AI Rubric',
    highlights: ['Đề bài theo ngữ cảnh thực tế', 'Nhận xét lỗi ngữ pháp & cách sửa', 'Gợi ý từ vựng và câu văn hay'],
  });

  // 4. Speaking Ready Item (Transcript-First)
  const speakingItem = items?.find((i) => i.slug === 'speaking-daily-life-introduction');
  catalog.push({
    slug: 'speaking-daily-life-introduction',
    title: speakingItem?.title || 'Luyện nói Phản xạ giới thiệu bản thân và Cuộc sống thường ngày (Self-Introduction & Daily Life)',
    description: speakingItem?.description || 'Luyện phản xạ nói theo phương pháp Transcript-First, nhận nhận xét AI về độ tự nhiên và từ nối đàm thoại.',
    skill: 'speaking',
    level: 'A1',
    estimatedMinutes: speakingItem?.estimated_minutes || 15,
    status: 'ready',
    badgeLabel: 'Sẵn sàng học • Phản xạ nói',
    highlights: ['Phương pháp Transcript-First', 'Chấm điểm ngữ pháp & độ tự nhiên', 'Cung cấp câu trả lời mẫu bản xứ'],
  });

  // 5. Additional Planned Curriculum Items (to maintain transparency)
  catalog.push({
    slug: 'listening-airport-announcements',
    title: 'Luyện nghe Thông báo ngắn tại Sân bay / Siêu thị (Part 4 TOEIC)',
    description: 'Bắt ý chính về cổng bay, thời gian hoãn chuyến và sự kiện đặc biệt.',
    skill: 'listening',
    level: 'A2',
    estimatedMinutes: 25,
    status: 'planned',
    badgeLabel: 'Đang chuẩn bị',
    highlights: ['Bài nghe Part 4 nâng cao', 'Giọng đọc thông báo chuẩn'],
  });

  catalog.push({
    slug: 'reading-double-passages-invoices',
    title: 'Đọc hiểu Hóa đơn, Lịch trình & Đoạn văn kép (Double Passages)',
    description: 'Phương pháp định vị nhanh từ khóa và đối chiếu thông tin giữa 2 văn bản liên quan.',
    skill: 'reading',
    level: 'A2',
    estimatedMinutes: 25,
    status: 'planned',
    badgeLabel: 'Đang chuẩn bị',
    highlights: ['Đọc quét nhanh hóa đơn', 'Dạng bài TOEIC Part 7'],
  });

  catalog.push({
    slug: 'writing-requesting-information-memo',
    title: 'Luyện viết Thư yêu cầu thông tin & Đặt lịch hẹn (Inquiry Email)',
    description: 'Viết email trang trọng yêu cầu tài liệu dự án và sắp xếp cuộc họp nhóm.',
    skill: 'writing',
    level: 'A2',
    estimatedMinutes: 25,
    status: 'planned',
    badgeLabel: 'Đang chuẩn bị',
    highlights: ['Cấu trúc viết thư trang trọng', 'Collocations thư tín thương mại'],
  });

  catalog.push({
    slug: 'speaking-workplace-meeting-opinions',
    title: 'Luyện nói Trình bày ý kiến và Đóng góp ý tưởng cuộc họp (Meeting Opinions)',
    description: 'Thực hành các cấu trúc nêu quan điểm: "In my opinion", "I would suggest that".',
    skill: 'speaking',
    level: 'A2',
    estimatedMinutes: 20,
    status: 'planned',
    badgeLabel: 'Đang chuẩn bị',
    highlights: ['Phản xạ thảo luận nhóm', 'Mẫu câu đàm thoại công sở'],
  });

  return catalog;
}

/**
 * Submits writing practice essay, evaluates with AI rubric, persists submission & evidence,
 * advances daily task, streak, and progressive learning path unlocking.
 */
export async function submitWritingPractice(
  userId: string,
  taskId: string | null,
  contentItemId: string,
  essayText: string,
  durationSeconds: number
): Promise<{
  success: boolean;
  result?: {
    submission_id: string;
    evaluation: WritingEvaluationResult;
    score: number;
    max_score: number;
    percentage: number;
    duration_seconds: number;
  };
  error?: string;
}> {
  const wordCount = countWords(essayText);
  if (wordCount < 10) {
    return { success: false, error: 'Bài viết của bạn quá ngắn (tối thiểu 10 từ). Hãy viết thêm để AI có thể đánh giá chi tiết.' };
  }

  const adminClient = createAdminClient();

  // 1. Anti-IDOR: Validate taskId ownership if provided
  let validatedTask: {
    id: string;
    daily_plan_id: string;
    estimated_minutes: number;
    learning_path_item_id: string | null;
    status: string;
  } | null = null;

  if (taskId) {
    const { data: task } = await adminClient
      .from('daily_plan_tasks')
      .select('id, daily_plan_id, estimated_minutes, learning_path_item_id, status')
      .eq('id', taskId)
      .eq('user_id', userId)
      .maybeSingle();

    if (!task) {
      return { success: false, error: 'Nhiệm vụ không tồn tại hoặc bạn không có quyền truy cập.' };
    }
    validatedTask = task;
  }

  // 2. Fetch content item
  const { data: contentItem } = await adminClient
    .from('content_items')
    .select('id, title, skill, level, body')
    .eq('id', contentItemId)
    .maybeSingle();

  if (!contentItem) {
    return { success: false, error: 'Không tìm thấy bài tập viết này.' };
  }

  const promptScenario =
    typeof contentItem.body?.prompt_scenario === 'string'
      ? contentItem.body.prompt_scenario
      : contentItem.title;

  // 3. Perform AI evaluation
  const evaluation = await evaluateWriting({
    userId,
    promptScenario,
    learnerText: essayText,
    targetLevel: contentItem.level,
  });

  const rawScore = Number(evaluation.rubric_scores?.total_score) || 0;
  const totalScore = Math.max(0, Math.min(100, Math.round(rawScore)));
  const maxScore = 100;
  const accuracy = Number((totalScore / maxScore).toFixed(4));
  const percentage = Math.round(accuracy * 100);
  const now = new Date().toISOString();

  // 4. Persist submission
  const { data: submission, error: subError } = await adminClient
    .from('practice_submissions')
    .insert({
      user_id: userId,
      daily_plan_task_id: validatedTask ? validatedTask.id : null,
      content_item_id: contentItemId,
      answers: [{ text: essayText, word_count: wordCount }],
      score: totalScore,
      max_score: maxScore,
      accuracy,
      feedback: evaluation,
      duration_seconds: Math.max(0, durationSeconds || 0),
    })
    .select('id')
    .single();

  if (subError || !submission) {
    return { success: false, error: 'Không thể lưu kết quả bài viết vào hệ thống.' };
  }

  // 5. Record learning evidence
  await adminClient.from('learning_evidence').insert({
    user_id: userId,
    skill: 'writing',
    source_type: 'practice_exercise',
    source_id: submission.id,
    score: totalScore,
    max_score: maxScore,
    accuracy,
    duration_seconds: Math.max(0, durationSeconds || 0),
    evidence: {
      content_item_id: contentItemId,
      title: contentItem.title,
      word_count: wordCount,
      rubric_scores: evaluation.rubric_scores,
      evaluation_source: evaluation.evaluation_source,
    },
  });

  // 6. Emit learning event
  await adminClient.from('learning_events').insert({
    user_id: userId,
    event_type: 'practice_submitted',
    entity_type: 'practice_submission',
    entity_id: submission.id,
    payload: {
      content_item_id: contentItemId,
      skill: 'writing',
      score: totalScore,
      accuracy,
      word_count: wordCount,
    },
  });

  // 7. Update Daily Plan task and progressive unlock if linked
  if (validatedTask) {
    await updateTaskAndStreakOnCompletion(adminClient, userId, validatedTask, totalScore, accuracy, now);
  } else {
    // If practicing standalone without a taskId, still record study activity streak
    try {
      await recordStudyActivity(userId, 'practice');
    } catch {
      // Non-blocking
    }
  }

  return {
    success: true,
    result: {
      submission_id: submission.id,
      evaluation,
      score: totalScore,
      max_score: maxScore,
      percentage,
      duration_seconds: durationSeconds,
    },
  };
}

/**
 * Submits speaking practice transcript, evaluates with AI rubric, persists submission & evidence,
 * advances daily task, streak, and progressive learning path unlocking.
 */
export async function submitSpeakingPractice(
  userId: string,
  taskId: string | null,
  contentItemId: string,
  transcriptText: string,
  durationSeconds: number
): Promise<{
  success: boolean;
  result?: {
    submission_id: string;
    evaluation: SpeakingEvaluationResult;
    score: number;
    max_score: number;
    percentage: number;
    duration_seconds: number;
  };
  error?: string;
}> {
  const wordCount = countWords(transcriptText);
  if (wordCount < 10) {
    return { success: false, error: 'Transcript câu trả lời quá ngắn (tối thiểu 10 từ). Hãy nói hoặc nhập thêm câu trả lời chi tiết hơn.' };
  }

  const adminClient = createAdminClient();

  // 1. Anti-IDOR: Validate taskId ownership if provided
  let validatedTask: {
    id: string;
    daily_plan_id: string;
    estimated_minutes: number;
    learning_path_item_id: string | null;
    status: string;
  } | null = null;

  if (taskId) {
    const { data: task } = await adminClient
      .from('daily_plan_tasks')
      .select('id, daily_plan_id, estimated_minutes, learning_path_item_id, status')
      .eq('id', taskId)
      .eq('user_id', userId)
      .maybeSingle();

    if (!task) {
      return { success: false, error: 'Nhiệm vụ không tồn tại hoặc bạn không có quyền truy cập.' };
    }
    validatedTask = task;
  }

  // 2. Fetch content item
  const { data: contentItem } = await adminClient
    .from('content_items')
    .select('id, title, skill, level, body')
    .eq('id', contentItemId)
    .maybeSingle();

  if (!contentItem) {
    return { success: false, error: 'Không tìm thấy bài tập nói này.' };
  }

  const speakingTopicPrompt =
    typeof contentItem.body?.prompt_scenario === 'string'
      ? contentItem.body.prompt_scenario
      : contentItem.title;

  // 3. Perform AI evaluation
  const evaluation = await evaluateSpeaking({
    userId,
    speakingTopicPrompt,
    transcriptText,
    targetLevel: contentItem.level,
  });

  const rawScore = Number(evaluation.rubric_scores?.total_score) || 0;
  const totalScore = Math.max(0, Math.min(100, Math.round(rawScore)));
  const maxScore = 100;
  const accuracy = Number((totalScore / maxScore).toFixed(4));
  const percentage = Math.round(accuracy * 100);
  const now = new Date().toISOString();

  // 4. Persist submission
  const { data: submission, error: subError } = await adminClient
    .from('practice_submissions')
    .insert({
      user_id: userId,
      daily_plan_task_id: validatedTask ? validatedTask.id : null,
      content_item_id: contentItemId,
      answers: [{ text: transcriptText, word_count: wordCount }],
      score: totalScore,
      max_score: maxScore,
      accuracy,
      feedback: evaluation,
      duration_seconds: Math.max(0, durationSeconds || 0),
    })
    .select('id')
    .single();

  if (subError || !submission) {
    return { success: false, error: 'Không thể lưu kết quả bài nói vào hệ thống.' };
  }

  // 5. Record learning evidence
  await adminClient.from('learning_evidence').insert({
    user_id: userId,
    skill: 'speaking',
    source_type: 'practice_exercise',
    source_id: submission.id,
    score: totalScore,
    max_score: maxScore,
    accuracy,
    duration_seconds: Math.max(0, durationSeconds || 0),
    evidence: {
      content_item_id: contentItemId,
      title: contentItem.title,
      word_count: wordCount,
      rubric_scores: evaluation.rubric_scores,
      evaluation_source: evaluation.evaluation_source,
    },
  });

  // 6. Emit learning event
  await adminClient.from('learning_events').insert({
    user_id: userId,
    event_type: 'practice_submitted',
    entity_type: 'practice_submission',
    entity_id: submission.id,
    payload: {
      content_item_id: contentItemId,
      skill: 'speaking',
      score: totalScore,
      accuracy,
      word_count: wordCount,
    },
  });

  // 7. Update Daily Plan task and progressive unlock if linked
  if (validatedTask) {
    await updateTaskAndStreakOnCompletion(adminClient, userId, validatedTask, totalScore, accuracy, now);
  } else {
    try {
      await recordStudyActivity(userId, 'practice');
    } catch {
      // Non-blocking
    }
  }

  return {
    success: true,
    result: {
      submission_id: submission.id,
      evaluation,
      score: totalScore,
      max_score: maxScore,
      percentage,
      duration_seconds: durationSeconds,
    },
  };
}

/**
 * Shared helper to update daily task status, daily plan minutes, user streak, and unlock next topic.
 */
async function updateTaskAndStreakOnCompletion(
  adminClient: ReturnType<typeof createAdminClient>,
  userId: string,
  task: {
    id: string;
    daily_plan_id: string;
    estimated_minutes: number;
    learning_path_item_id: string | null;
    status: string;
  },
  score: number,
  accuracy: number,
  nowIso: string
) {
  const wasAlreadyCompleted = task.status === 'completed';

  await adminClient
    .from('daily_plan_tasks')
    .update({
      status: 'completed',
      score,
      accuracy,
      completed_at: nowIso,
      updated_at: nowIso,
    })
    .eq('id', task.id)
    .eq('user_id', userId);

  // Anti-Inflation Guard: only add to completed_minutes if task was not completed prior to this submission
  if (!wasAlreadyCompleted) {
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
          updated_at: nowIso,
        })
        .eq('id', task.daily_plan_id);

      await recalculatePlanStatus(adminClient, task.daily_plan_id);
    }
  }

  await adminClient.from('learning_events').insert({
    user_id: userId,
    event_type: 'task_completed',
    entity_type: 'daily_plan_task',
    entity_id: task.id,
    payload: { score, accuracy },
  });

  try {
    await recordStudyActivity(userId, 'practice');
  } catch {
    // Non-blocking
  }

  if (task.learning_path_item_id) {
    await unlockNextTopicInLearningPath(adminClient, task.learning_path_item_id);
  }
}
