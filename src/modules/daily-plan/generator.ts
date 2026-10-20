import type { AssessmentSkill } from '@/modules/assessment/types';
import type {
  ActivityType,
  ContentItem,
  DailyPlanGenerationReason,
  DailyTaskStatus,
} from './types';

export interface TaskCandidateDraft {
  learning_path_item_id?: string | null;
  content_item_id?: string | null;
  title: string;
  description?: string | null;
  activity_type: ActivityType;
  skill?: AssessmentSkill | 'speaking' | 'writing' | 'toeic' | null;
  position: number;
  estimated_minutes: number;
  content_status: 'available' | 'planned_curriculum';
  status: DailyTaskStatus;
}

export interface DailyPlanProposal {
  plan_date: string;
  target_minutes: number;
  generation_reason: DailyPlanGenerationReason;
  tasks: TaskCandidateDraft[];
}

export interface GeneratorPathItem {
  id: string;
  title: string;
  description?: string | null;
  skill?: AssessmentSkill | 'speaking' | 'writing' | 'toeic' | null;
  item_type: string;
  position: number;
  estimated_minutes: number;
  status: string; // 'available' | 'locked' | 'in_progress' | 'completed' | 'skipped'
  content_status: 'available' | 'planned_curriculum';
  parent_id?: string | null;
}

export interface GeneratorInput {
  userId: string;
  planDate: string; // YYYY-MM-DD
  dailyMinutes?: number;
  preferredStudyDays?: number[];
  primaryGoal?: string;
  activePath?: {
    id: string;
    title: string;
    status: string;
    items?: GeneratorPathItem[];
  } | null;
  curatedContentItems: ContentItem[];
}

/**
 * Returns ISO day of week: 1 = Monday, ..., 7 = Sunday
 */
export function getDayOfWeekFromDateString(dateStr: string): number {
  const parts = dateStr.split('-').map(Number);
  const date = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2]));
  const day = date.getUTCDay();
  return day === 0 ? 7 : day;
}

/**
 * Deterministic generator for Daily Learning Plans.
 * Ensures time allocation aligns with user's daily_minutes preference,
 * prioritizes unlocked topics from active Learning Path,
 * matches real runnable content items when available,
 * and leaves unavailable curriculum explicitly marked as planned_curriculum.
 */
export function generateDailyPlanProposal(input: GeneratorInput): DailyPlanProposal {
  const targetMinutes = Math.max(10, Math.min(180, input.dailyMinutes || 30));
  const studyDays = input.preferredStudyDays && input.preferredStudyDays.length > 0
    ? input.preferredStudyDays
    : [1, 2, 3, 4, 5]; // Default Mon-Fri

  const dayOfWeek = getDayOfWeekFromDateString(input.planDate);
  const isScheduledDay = studyDays.includes(dayOfWeek);

  const tasks: TaskCandidateDraft[] = [];
  let accumulatedMinutes = 0;
  let taskPosition = 1;

  // Map curated content by skill for fast matching
  const contentBySkill = new Map<string, ContentItem[]>();
  for (const item of input.curatedContentItems) {
    const list = contentBySkill.get(item.skill) || [];
    list.push(item);
    contentBySkill.set(item.skill, list);
  }

  // 1. If user has active learning path items, find unlocked topics first
  const activeItems = input.activePath?.items || [];
  const unlockedTopics = activeItems.filter(
    (i) => i.item_type === 'topic' && (i.status === 'available' || i.status === 'in_progress')
  );

  if (unlockedTopics.length > 0) {
    for (const topic of unlockedTopics) {
      if (accumulatedMinutes >= targetMinutes) break;

      // Check if this topic maps to a curated content item
      const matchingCurated = input.curatedContentItems.find((c) => {
        if (topic.skill && c.skill === topic.skill) {
          const tLower = topic.title.toLowerCase();
          // 1. Vocabulary: Daily Routine
          if (
            (tLower.includes('sinh hoạt') || tLower.includes('routine')) &&
            c.slug.includes('daily-routine')
          ) {
            return true;
          }
          // 2. Vocabulary: Office Communication
          if (
            (tLower.includes('công sở') || tLower.includes('nghề nghiệp') || tLower.includes('office')) &&
            c.slug.includes('office-communication')
          ) {
            return true;
          }
          // 3. Grammar: Present Simple
          if (
            (tLower.includes('hiện tại') || tLower.includes('present simple')) &&
            c.slug.includes('present-simple')
          ) {
            return true;
          }
          // 4. Listening: Daily Conversations
          if (
            (tLower.includes('chào hỏi') ||
              tLower.includes('thông tin cá nhân') ||
              tLower.includes('introducing')) &&
            (c.slug.includes('introducing-yourself') || c.slug.includes('daily-conversations'))
          ) {
            return true;
          }
          // 5. Reading: Workplace Announcements & Messages
          if (
            (tLower.includes('thông báo') ||
              tLower.includes('kế hoạch công việc') ||
              tLower.includes('workplace') ||
              tLower.includes('announcement')) &&
            (c.slug.includes('workplace-announcements') || c.slug.includes('reading-workplace'))
          ) {
            return true;
          }
          // 6. Writing: Introductory Email
          if (
            (tLower.includes('viết email') ||
              tLower.includes('email giới thiệu') ||
              tLower.includes('introductory email')) &&
            c.slug.includes('introductory-email')
          ) {
            return true;
          }
          // 7. Speaking: Daily Life Introduction
          if (
            (tLower.includes('luyện nói') ||
              tLower.includes('phản xạ nói') ||
              tLower.includes('cuộc sống thường ngày') ||
              tLower.includes('daily life')) &&
            c.slug.includes('speaking-daily-life')
          ) {
            return true;
          }
        }
        return false;
      });

      const isAvailable = Boolean(matchingCurated);
      const duration = topic.estimated_minutes > 0 ? topic.estimated_minutes : (matchingCurated?.estimated_minutes || 15);

      tasks.push({
        learning_path_item_id: topic.id,
        content_item_id: matchingCurated ? matchingCurated.id : null,
        title: topic.title,
        description: topic.description || matchingCurated?.description || null,
        activity_type: isAvailable ? 'practice' : 'lesson',
        skill: (topic.skill as AssessmentSkill) || matchingCurated?.skill || null,
        position: taskPosition++,
        estimated_minutes: duration,
        content_status: isAvailable ? 'available' : 'planned_curriculum',
        status: 'pending',
      });

      accumulatedMinutes += duration;
    }
  }

  // 2. If accumulated time is still below targetMinutes, add foundational available practice content
  for (const item of input.curatedContentItems) {
    if (accumulatedMinutes >= targetMinutes) break;

    // Avoid duplicate content items in the same daily plan
    const alreadyAdded = tasks.some((t) => t.content_item_id === item.id);
    if (alreadyAdded) continue;

    tasks.push({
      learning_path_item_id: null,
      content_item_id: item.id,
      title: item.title,
      description: item.description,
      activity_type: 'practice',
      skill: item.skill,
      position: taskPosition++,
      estimated_minutes: item.estimated_minutes,
      content_status: 'available',
      status: 'pending',
    });

    accumulatedMinutes += item.estimated_minutes;
  }

  // 3. Fallback: If no tasks were added at all (e.g., no curated items passed), create a standard foundation task
  if (tasks.length === 0) {
    tasks.push({
      learning_path_item_id: null,
      content_item_id: null,
      title: 'Khởi động bài học cơ bản',
      description: 'Hoạt động học tập định hướng ban đầu cho người học mới.',
      activity_type: 'lesson',
      skill: 'vocabulary',
      position: 1,
      estimated_minutes: Math.min(targetMinutes, 15),
      content_status: 'planned_curriculum',
      status: 'pending',
    });
  }

  return {
    plan_date: input.planDate,
    target_minutes: targetMinutes,
    generation_reason: {
      primaryGoal: input.primaryGoal || 'Nền tảng giao tiếp',
      studyDays,
      isScheduledDay,
      activePathTitle: input.activePath?.title,
      source: input.activePath ? 'path_curriculum' : 'starter_foundation',
      notes: isScheduledDay
        ? 'Kế hoạch học tập theo lịch rảnh đăng ký.'
        : 'Học bù hoặc học linh hoạt ngoài ngày học chính.',
    },
    tasks,
  };
}
