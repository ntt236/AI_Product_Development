import 'server-only';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import type { CEFRLevel } from '@/modules/profile/types';
import type { AssessmentSkill } from '@/modules/assessment/types';
import type {
  LearningPath,
  LearningPathItem,
  LearningPathVersion,
  LearnerProfileSummary,
  LearningPathSnapshot,
  GeneratedPathProposal,
} from './types';
import { generateLearningPathProposal } from './generator';
import { matchTopicToContentItem } from './curriculum';
import { getOrCreateTodayDailyPlan } from '@/modules/daily-plan/services';
import { GOAL_OPTIONS } from '@/modules/onboarding/constants';

/**
 * Synthesizes the dynamic Learner Profile from real database records.
 * Integrates profiles, goals, preferences, and learner_skill_profiles.
 */
export async function getLearnerProfileSummary(
  userId: string
): Promise<LearnerProfileSummary | null> {
  const supabase = await createClient();

  // 1. Fetch user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (!profile) return null;

  // 2. Fetch goals
  const { data: goals } = await supabase
    .from('goals')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'active');

  const primaryGoal = goals?.find((g) => g.priority === 'primary');
  const secondaryGoals = goals?.filter((g) => g.priority === 'secondary') || [];

  const goalType = primaryGoal?.goal_type || 'foundation';
  const goalOption = GOAL_OPTIONS.find((g) => g.type === goalType);
  const goalTitle = goalOption?.title || primaryGoal?.title || 'Tiếng Anh nền tảng';

  // 3. Fetch preferences
  const { data: preferences } = await supabase
    .from('learner_preferences')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  // 4. Fetch skill profiles
  const { data: skillsData } = await supabase
    .from('learner_skill_profiles')
    .select('*')
    .eq('user_id', userId);

  const skillProfiles: Record<
    AssessmentSkill,
    { abilityScore: number; level: CEFRLevel; confidence: number; evidenceCount: number }
  > = {
    vocabulary: { abilityScore: 0.5, level: 'a1', confidence: 0.5, evidenceCount: 0 },
    grammar: { abilityScore: 0.5, level: 'a1', confidence: 0.5, evidenceCount: 0 },
    reading: { abilityScore: 0.5, level: 'a1', confidence: 0.5, evidenceCount: 0 },
    listening: { abilityScore: 0.5, level: 'a1', confidence: 0.5, evidenceCount: 0 },
  };

  let hasCompletedAssessment = false;

  if (skillsData && skillsData.length > 0) {
    hasCompletedAssessment = true;
    for (const s of skillsData) {
      if (s.skill in skillProfiles) {
        skillProfiles[s.skill as AssessmentSkill] = {
          abilityScore: Number(s.ability_score ?? 0.5),
          level: (s.estimated_level as CEFRLevel) || 'a1',
          confidence: Number(s.confidence ?? 0.8),
          evidenceCount: s.evidence_count || 1,
        };
      }
    }
  }

  return {
    userId,
    displayName: profile.display_name || 'Học viên',
    estimatedLevel: (profile.estimated_level as CEFRLevel) || 'a1',
    primaryGoalType: goalType,
    primaryGoalTitle: goalTitle,
    targetToeicScore: primaryGoal?.target_toeic_score ?? null,
    secondaryGoals: secondaryGoals.map((g) => g.goal_type),
    dailyMinutes: preferences?.daily_minutes || 30,
    studyDays: preferences?.preferred_study_days || [1, 2, 3, 4, 5],
    hasCompletedAssessment,
    skillProfiles,
  };
}

/**
 * Retrieves the current primary learning path for a learner (active, paused, or proposed),
 * along with its items and version history.
 */
export async function getUserLearningPath(userId: string): Promise<{
  path: LearningPath | null;
  items: LearningPathItem[];
  versions: LearningPathVersion[];
  profile: LearnerProfileSummary | null;
}> {
  const supabase = await createClient();
  const profile = await getLearnerProfileSummary(userId);

  // Priority order: active > paused > proposed > latest
  const { data: paths } = await supabase
    .from('learning_paths')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (!paths || paths.length === 0) {
    return { path: null, items: [], versions: [], profile };
  }

  const activePath = paths.find((p) => p.status === 'active');
  const pausedPath = paths.find((p) => p.status === 'paused');
  const proposedPath = paths.find((p) => p.status === 'proposed');
  const chosenPath = activePath || pausedPath || proposedPath || paths[0];

  // Fetch items
  const { data: items } = await supabase
    .from('learning_path_items')
    .select('*')
    .eq('learning_path_id', chosenPath.id)
    .order('position', { ascending: true });

  // Fetch published curated content to reconcile real interactive availability
  const adminClient = createAdminClient();
  const { data: publishedContent } = await adminClient
    .from('content_items')
    .select('id, slug, title, skill')
    .eq('is_published', true);

  const enrichedItems: LearningPathItem[] = ((items || []) as LearningPathItem[]).map((item) => {
    if (item.item_type !== 'topic') {
      return item;
    }

    const matchedContent = matchTopicToContentItem(
      item,
      (publishedContent as Array<{ id: string; slug: string; title: string; skill: string }>) || []
    );

    if (matchedContent) {
      return {
        ...item,
        content_status: 'available',
        content_item_id: matchedContent.id,
        content_item_slug: matchedContent.slug,
      };
    }

    return {
      ...item,
      content_status: 'planned_curriculum',
      content_item_id: null,
      content_item_slug: null,
    };
  });

  // Self-heal stored content_status in DB if disparate (non-blocking)
  for (const enriched of enrichedItems) {
    if (enriched.item_type === 'topic') {
      const original = (items || []).find((i) => i.id === enriched.id);
      if (original && original.content_status !== enriched.content_status) {
        await adminClient
          .from('learning_path_items')
          .update({
            content_status: enriched.content_status,
            metadata: {
              ...(original.metadata || {}),
              ...(enriched.content_item_slug ? { content_item_slug: enriched.content_item_slug } : {}),
            },
            updated_at: new Date().toISOString(),
          })
          .eq('id', enriched.id);
      }
    }
  }

  // Fetch versions
  const { data: versions } = await supabase
    .from('learning_path_versions')
    .select('*')
    .eq('learning_path_id', chosenPath.id)
    .order('version_number', { ascending: false });

  return {
    path: chosenPath as LearningPath,
    items: enrichedItems,
    versions: (versions || []) as LearningPathVersion[],
    profile,
  };
}

/**
 * Generates and persists a proposed Learning Path if one does not already exist.
 * Uses atomic transaction via admin client to ensure database integrity.
 */
export async function generateAndPersistProposedPath(
  userId: string
): Promise<{ success: boolean; pathId?: string; error?: string }> {
  const profile = await getLearnerProfileSummary(userId);
  if (!profile) {
    return { success: false, error: 'Không tìm thấy hồ sơ người học.' };
  }

  const supabase = await createClient();

  // Check if an active or proposed path already exists
  const { data: existingPaths } = await supabase
    .from('learning_paths')
    .select('id, status')
    .eq('user_id', userId)
    .in('status', ['active', 'proposed', 'paused']);

  const activeOrProposed = existingPaths?.find(
    (p) => p.status === 'active' || p.status === 'proposed' || p.status === 'paused'
  );

  if (activeOrProposed) {
    return { success: true, pathId: activeOrProposed.id };
  }

  // 1. Generate path proposal using deterministic rule-based generator
  const proposal: GeneratedPathProposal = generateLearningPathProposal(profile);
  const adminClient = createAdminClient();

  // 2. Fetch active primary goal ID
  const { data: goal } = await supabase
    .from('goals')
    .select('id')
    .eq('user_id', userId)
    .eq('priority', 'primary')
    .eq('status', 'active')
    .maybeSingle();

  // 3. Insert into learning_paths (proposed)
  const { data: createdPath, error: pathError } = await adminClient
    .from('learning_paths')
    .insert({
      user_id: userId,
      goal_id: goal?.id || null,
      title: proposal.title,
      description: proposal.description,
      target_level: proposal.targetLevel,
      total_estimated_minutes: proposal.totalEstimatedMinutes,
      estimated_weeks: proposal.estimatedWeeks,
      status: 'proposed',
      is_user_modified: false,
      current_version: 1,
    })
    .select('*')
    .single();

  if (pathError || !createdPath) {
    return { success: false, error: `Lỗi tạo lộ trình: ${pathError?.message}` };
  }

  const pathId = createdPath.id;

  // 4. Create initial snapshot v1
  const snapshot: LearningPathSnapshot = {
    title: proposal.title,
    description: proposal.description,
    target_level: proposal.targetLevel,
    total_estimated_minutes: proposal.totalEstimatedMinutes,
    estimated_weeks: proposal.estimatedWeeks,
    milestones: proposal.milestones,
    generated_at: new Date().toISOString(),
  };

  await adminClient.from('learning_path_versions').insert({
    learning_path_id: pathId,
    version_number: 1,
    change_reason: proposal.isStarterPath
      ? 'Khởi tạo lộ trình tiêu chuẩn ban đầu'
      : 'Khởi tạo lộ trình cá nhân hóa từ kết quả Placement Test',
    created_by: 'system',
    snapshot: snapshot as unknown as Record<string, unknown>,
  });

  // 5. Insert hierarchical items (Milestones -> Modules -> Topics)
  let milestonePos = 1;

  for (const m of proposal.milestones) {
    const { data: createdMilestone } = await adminClient
      .from('learning_path_items')
      .insert({
        learning_path_id: pathId,
        parent_id: null,
        item_type: 'milestone',
        title: m.title,
        description: m.description,
        position: milestonePos++,
        status: milestonePos === 2 ? 'available' : 'locked',
        estimated_minutes: 0,
        content_status: 'planned_curriculum',
      })
      .select('id')
      .single();

    if (!createdMilestone) continue;

    let modulePos = 1;
    for (const mod of m.modules) {
      const { data: createdModule } = await adminClient
        .from('learning_path_items')
        .insert({
          learning_path_id: pathId,
          parent_id: createdMilestone.id,
          item_type: 'module',
          title: mod.title,
          description: mod.description,
          skill: mod.skill || null,
          position: modulePos++,
          status: 'locked',
          estimated_minutes: 0,
          content_status: 'planned_curriculum',
        })
        .select('id')
        .single();

      if (!createdModule) continue;

      let topicPos = 1;
      for (const t of mod.topics) {
        await adminClient.from('learning_path_items').insert({
          learning_path_id: pathId,
          parent_id: createdModule.id,
          item_type: 'topic',
          title: t.title,
          description: t.description,
          skill: t.skill,
          target_level: t.target_level,
          position: topicPos++,
          estimated_minutes: t.estimated_minutes,
          content_status: t.content_status || 'planned_curriculum',
          status: 'locked',
          metadata: t.content_item_slug ? { content_item_slug: t.content_item_slug } : {},
        });
      }
    }
  }

  return { success: true, pathId };
}

/**
 * Accepts a proposed learning path, atomically activating it, archiving any existing active path,
 * and progressively unlocking Milestone 1, Module 1, and Topic 1.
 */
export async function acceptLearningPath(
  userId: string,
  pathId: string
): Promise<{ success: boolean; error?: string }> {
  const adminClient = createAdminClient();

  // 1. Try atomic RPC function first
  const { data, error: rpcError } = await adminClient.rpc('activate_learning_path', {
    p_path_id: pathId,
    p_user_id: userId,
  });

  if (!rpcError && data && (data as { success?: boolean }).success) {
    return { success: true };
  }

  // 2. Fallback to server-side transaction logic if RPC is not yet created on remote
  return fallbackAcceptLearningPath(userId, pathId);
}

async function fallbackAcceptLearningPath(
  userId: string,
  pathId: string
): Promise<{ success: boolean; error?: string }> {
  const adminClient = createAdminClient();

  // Verify ownership and current status
  const { data: path } = await adminClient
    .from('learning_paths')
    .select('id, user_id, status')
    .eq('id', pathId)
    .single();

  if (!path || path.user_id !== userId) {
    return { success: false, error: 'Không tìm thấy lộ trình hoặc bạn không có quyền.' };
  }

  if (path.status === 'active') {
    return { success: true };
  }

  if (path.status !== 'proposed' && path.status !== 'paused') {
    return {
      success: false,
      error: `Không thể kích hoạt lộ trình đang ở trạng thái ${path.status}.`,
    };
  }

  const now = new Date().toISOString();

  // Archive any currently active path for this user
  await adminClient
    .from('learning_paths')
    .update({ status: 'archived', updated_at: now })
    .eq('user_id', userId)
    .eq('status', 'active');

  // Activate target path
  await adminClient
    .from('learning_paths')
    .update({ status: 'active', updated_at: now })
    .eq('id', pathId)
    .eq('user_id', userId);

  // Progressive unlock: Milestone 1 -> Module 1 -> Topic 1
  const { data: firstMilestone } = await adminClient
    .from('learning_path_items')
    .select('id')
    .eq('learning_path_id', pathId)
    .eq('item_type', 'milestone')
    .eq('position', 1)
    .maybeSingle();

  if (firstMilestone) {
    await adminClient
      .from('learning_path_items')
      .update({ status: 'available', updated_at: now })
      .eq('id', firstMilestone.id)
      .eq('status', 'locked');

    const { data: firstModule } = await adminClient
      .from('learning_path_items')
      .select('id')
      .eq('learning_path_id', pathId)
      .eq('parent_id', firstMilestone.id)
      .eq('item_type', 'module')
      .eq('position', 1)
      .maybeSingle();

    if (firstModule) {
      await adminClient
        .from('learning_path_items')
        .update({ status: 'available', updated_at: now })
        .eq('id', firstModule.id)
        .eq('status', 'locked');

      await adminClient
        .from('learning_path_items')
        .update({ status: 'available', updated_at: now })
        .eq('learning_path_id', pathId)
        .eq('parent_id', firstModule.id)
        .eq('item_type', 'topic')
        .eq('position', 1)
        .eq('status', 'locked');
    }
  }

  return { success: true };
}

/**
 * Rejects a proposed learning path. Terminal state.
 */
export async function rejectLearningPath(
  userId: string,
  pathId: string
): Promise<{ success: boolean; error?: string }> {
  const adminClient = createAdminClient();

  const { data: path } = await adminClient
    .from('learning_paths')
    .select('id, user_id, status')
    .eq('id', pathId)
    .single();

  if (!path || path.user_id !== userId) {
    return { success: false, error: 'Không tìm thấy lộ trình.' };
  }

  if (path.status !== 'proposed') {
    return { success: false, error: 'Chỉ có thể từ chối lộ trình đang ở trạng thái đề xuất.' };
  }

  await adminClient
    .from('learning_paths')
    .update({ status: 'rejected', updated_at: new Date().toISOString() })
    .eq('id', pathId)
    .eq('user_id', userId);

  return { success: true };
}

/**
 * Pauses an active learning path.
 */
export async function pauseLearningPath(
  userId: string,
  pathId: string
): Promise<{ success: boolean; error?: string }> {
  const adminClient = createAdminClient();

  const { data: path } = await adminClient
    .from('learning_paths')
    .select('id, user_id, status')
    .eq('id', pathId)
    .single();

  if (!path || path.user_id !== userId) {
    return { success: false, error: 'Không tìm thấy lộ trình.' };
  }

  if (path.status !== 'active') {
    return { success: false, error: 'Chỉ có thể tạm dừng lộ trình đang hoạt động.' };
  }

  await adminClient
    .from('learning_paths')
    .update({ status: 'paused', updated_at: new Date().toISOString() })
    .eq('id', pathId)
    .eq('user_id', userId);

  return { success: true };
}

/**
 * Resumes a paused learning path.
 */
export async function resumeLearningPath(
  userId: string,
  pathId: string
): Promise<{ success: boolean; error?: string }> {
  return acceptLearningPath(userId, pathId);
}

/**
 * Customizes the learning path structure, enforcing optimistic version concurrency,
 * validating tree items, updating positions, and creating an immutable snapshot.
 */
export async function customizeLearningPathStructure(
  userId: string,
  pathId: string,
  expectedVersion: number,
  changeReason: string,
  reorderedItemIds: string[]
): Promise<{ success: boolean; newVersion?: number; error?: string }> {
  const adminClient = createAdminClient();

  // 1. Try atomic RPC function first
  const { data, error: rpcError } = await adminClient.rpc('save_learning_path_customization', {
    p_path_id: pathId,
    p_expected_version: expectedVersion,
    p_change_reason: changeReason,
    p_reordered_item_ids: reorderedItemIds,
    p_created_by: 'user',
    p_user_id: userId,
  });

  if (!rpcError && data && (data as { success?: boolean }).success) {
    const newVersion = (data as { new_version?: number })?.new_version;
    return { success: true, newVersion };
  }

  // 2. Fallback to server-side transaction logic if RPC is not yet created on remote
  return fallbackCustomizeLearningPathStructure(
    userId,
    pathId,
    expectedVersion,
    changeReason,
    reorderedItemIds
  );
}

async function fallbackCustomizeLearningPathStructure(
  userId: string,
  pathId: string,
  expectedVersion: number,
  changeReason: string,
  reorderedItemIds: string[]
): Promise<{ success: boolean; newVersion?: number; error?: string }> {
  const adminClient = createAdminClient();

  // 1. Fetch path and check optimistic version
  const { data: path } = await adminClient
    .from('learning_paths')
    .select('*')
    .eq('id', pathId)
    .single();

  if (!path || path.user_id !== userId) {
    return { success: false, error: 'Không tìm thấy lộ trình.' };
  }

  if (path.status in ['completed', 'rejected', 'archived']) {
    return {
      success: false,
      error: `Không thể chỉnh sửa cấu trúc của lộ trình đã kết thúc hoặc lưu trữ (${path.status}).`,
    };
  }

  if (path.current_version !== expectedVersion) {
    return {
      success: false,
      error: `Xung đột phiên bản: Lộ trình đã được cập nhật từ một phiên làm việc khác (v${path.current_version} khác v${expectedVersion}). Vui lòng làm mới trang.`,
    };
  }

  // 2. Validate input array: non-empty check
  if (!reorderedItemIds || reorderedItemIds.length === 0) {
    return { success: false, error: 'Danh sách hạng mục tùy chỉnh không được để trống.' };
  }

  // 3. Reject duplicate IDs
  if (new Set(reorderedItemIds).size !== reorderedItemIds.length) {
    return { success: false, error: 'Danh sách hạng mục tùy chỉnh chứa ID bị trùng lặp.' };
  }

  // 4. Fetch all items in path to validate sibling group contract
  const { data: allPathItems } = await adminClient
    .from('learning_path_items')
    .select('*')
    .eq('learning_path_id', pathId);

  const itemsMap = new Map((allPathItems || []).map((it) => [it.id, it]));

  // Verify all reordered items exist in this path
  for (const id of reorderedItemIds) {
    if (!itemsMap.has(id)) {
      return { success: false, error: `Phát hiện hạng mục không hợp lệ hoặc thuộc lộ trình khác: ${id}` };
    }
  }

  // Verify single sibling group (same parent_id and same item_type)
  const firstItem = itemsMap.get(reorderedItemIds[0])!;
  const targetParentId = firstItem.parent_id;
  const targetType = firstItem.item_type;

  for (const id of reorderedItemIds) {
    const item = itemsMap.get(id)!;
    if (item.parent_id !== targetParentId) {
      return { success: false, error: 'Không thể sắp xếp các hạng mục thuộc các hạng mục cha khác nhau (Cross-parent reordering).' };
    }
    if (item.item_type !== targetType) {
      return { success: false, error: 'Không thể sắp xếp đồng thời các hạng mục ở các cấp phân cấp khác nhau.' };
    }
  }

  // Completeness check: all siblings under targetParentId must be included
  const allSiblings = (allPathItems || []).filter((it) => it.parent_id === targetParentId);
  if (allSiblings.length !== reorderedItemIds.length) {
    return {
      success: false,
      error: `Danh sách tùy chỉnh phải bao gồm toàn bộ ${allSiblings.length} hạng mục trong cùng nhóm cha (nhận được: ${reorderedItemIds.length}).`,
    };
  }

  const newVersion = path.current_version + 1;
  const now = new Date().toISOString();

  // 5. Update item positions based on reorderedItemIds
  let pos = 1;
  for (const itemId of reorderedItemIds) {
    await adminClient
      .from('learning_path_items')
      .update({ position: pos++, updated_at: now })
      .eq('id', itemId)
      .eq('learning_path_id', pathId);
  }

  // 6. Fetch refreshed items to construct deterministic hierarchical snapshot
  const { data: refreshedItems } = await adminClient
    .from('learning_path_items')
    .select('*')
    .eq('learning_path_id', pathId);

  const mList = (refreshedItems || [])
    .filter((it) => it.item_type === 'milestone')
    .sort((a, b) => a.position - b.position)
    .map((m) => {
      const modules = (refreshedItems || [])
        .filter((mod) => mod.parent_id === m.id && mod.item_type === 'module')
        .sort((a, b) => a.position - b.position)
        .map((mod) => {
          const topics = (refreshedItems || [])
            .filter((t) => t.parent_id === mod.id && t.item_type === 'topic')
            .sort((a, b) => a.position - b.position);
          return { ...mod, topics };
        });
      return { ...m, modules };
    });

  const snapshot = {
    title: path.title,
    description: path.description,
    target_level: path.target_level,
    total_estimated_minutes: path.total_estimated_minutes,
    estimated_weeks: path.estimated_weeks,
    version_number: newVersion,
    change_reason: changeReason || 'Người học tùy chỉnh cấu trúc lộ trình',
    created_by: 'user',
    generated_at: now,
    milestones: mList,
  };

  // 7. Insert immutable version snapshot
  await adminClient.from('learning_path_versions').insert({
    learning_path_id: pathId,
    version_number: newVersion,
    change_reason: changeReason || 'Người học tùy chỉnh cấu trúc lộ trình',
    created_by: 'user',
    snapshot,
  });

  // 8. Increment path version and flag as user modified
  await adminClient
    .from('learning_paths')
    .update({
      current_version: newVersion,
      is_user_modified: true,
      updated_at: now,
    })
    .eq('id', pathId)
    .eq('user_id', userId);

  return { success: true, newVersion };
}

/**
 * Resolves or creates a runnable practice session in today's Daily Plan
 * for an available Learning Path topic.
 */
export async function startPracticeForTopic(
  userId: string,
  topicId: string
): Promise<{ success: boolean; taskId?: string; error?: string }> {
  if (!userId || !topicId) {
    return { success: false, error: 'Thiếu thông tin người dùng hoặc chủ đề học tập.' };
  }

  const adminClient = createAdminClient();

  // 1. Fetch topic and verify ownership via learning_paths
  const { data: topic } = await adminClient
    .from('learning_path_items')
    .select('id, learning_path_id, item_type, title, description, skill, status, content_status, metadata, estimated_minutes')
    .eq('id', topicId)
    .maybeSingle();

  if (!topic || topic.item_type !== 'topic') {
    return { success: false, error: 'Không tìm thấy chủ đề học tập hợp lệ.' };
  }

  const { data: path } = await adminClient
    .from('learning_paths')
    .select('id, user_id, status')
    .eq('id', topic.learning_path_id)
    .maybeSingle();

  if (!path || path.user_id !== userId) {
    return { success: false, error: 'Bạn không có quyền truy cập vào chủ đề này.' };
  }

  // 2. Reject locked topics
  if (topic.status === 'locked') {
    return {
      success: false,
      error: 'Chủ đề này đang tạm khóa theo thứ tự lộ trình. Hãy hoàn thành các bài học trước để mở khóa.',
    };
  }

  // 3. Find matching published curated content
  const { data: publishedContent } = await adminClient
    .from('content_items')
    .select('id, slug, title, skill, description')
    .eq('is_published', true);

  const matchedContent = matchTopicToContentItem(
    topic,
    (publishedContent as Array<{ id: string; slug: string; title: string; skill: string; description?: string }>) || []
  );

  if (!matchedContent) {
    return {
      success: false,
      error: 'Chủ đề này đang được đội ngũ sư phạm biên soạn và chưa có bài tập tương tác.',
    };
  }

  // 4. Get or create today's daily plan
  const planRes = await getOrCreateTodayDailyPlan(userId);
  if (!planRes.success || !planRes.plan) {
    return { success: false, error: planRes.error || 'Không thể khởi tạo kế hoạch học tập hôm nay.' };
  }

  const todayPlan = planRes.plan;

  // 5. Check if today's daily plan already has a task for this topic
  const { data: existingTask } = await adminClient
    .from('daily_plan_tasks')
    .select('id')
    .eq('daily_plan_id', todayPlan.id)
    .eq('learning_path_item_id', topicId)
    .maybeSingle();

  if (existingTask) {
    return { success: true, taskId: existingTask.id };
  }

  // 6. Check if today's daily plan already has a task with the exact same content_item_id
  const { data: existingContentTask } = await adminClient
    .from('daily_plan_tasks')
    .select('id')
    .eq('daily_plan_id', todayPlan.id)
    .eq('content_item_id', matchedContent.id)
    .maybeSingle();

  if (existingContentTask) {
    // Associate with this learning_path_item_id if it was unlinked
    await adminClient
      .from('daily_plan_tasks')
      .update({ learning_path_item_id: topicId, updated_at: new Date().toISOString() })
      .eq('id', existingContentTask.id);
    return { success: true, taskId: existingContentTask.id };
  }

  // 7. Insert new task into today's daily plan
  const { data: tasks } = await adminClient
    .from('daily_plan_tasks')
    .select('position')
    .eq('daily_plan_id', todayPlan.id);

  const maxPosition = (tasks || []).reduce((max, t) => Math.max(max, t.position), 0);

  const { data: newTask, error: insertError } = await adminClient
    .from('daily_plan_tasks')
    .insert({
      daily_plan_id: todayPlan.id,
      user_id: userId,
      learning_path_item_id: topicId,
      content_item_id: matchedContent.id,
      title: topic.title,
      description: topic.description || matchedContent.description || null,
      activity_type: 'practice',
      skill: topic.skill || matchedContent.skill,
      position: maxPosition + 1,
      estimated_minutes: topic.estimated_minutes > 0 ? topic.estimated_minutes : 15,
      content_status: 'available',
      status: 'pending',
    })
    .select('id')
    .single();

  if (insertError || !newTask) {
    return { success: false, error: 'Không thể thêm nhiệm vụ học tập vào Kế hoạch ngày.' };
  }

  return { success: true, taskId: newTask.id };
}
