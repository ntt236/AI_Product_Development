import type { CEFRLevel } from '@/modules/profile/types';
import type { AssessmentSkill } from '@/modules/assessment/types';
import type {
  LearnerProfileSummary,
  SkillPriority,
  WeaknessSeverity,
  GeneratedPathProposal,
  MilestoneDraft,
  ModuleDraft,
} from './types';
import { CURRICULUM_BANK, SKILL_TITLES } from './curriculum';

const SKILLS_ORDER: AssessmentSkill[] = ['vocabulary', 'grammar', 'listening', 'reading'];

/**
 * Maps goal weights depending on user's primary goal.
 */
export function getGoalWeights(goalType: string): Record<AssessmentSkill, number> {
  const normalized = (goalType || '').toLowerCase();

  if (normalized.includes('toeic')) {
    return {
      reading: 1.5,
      listening: 1.5,
      grammar: 1.2,
      vocabulary: 1.2,
    };
  }

  if (
    normalized.includes('communication') ||
    normalized.includes('speaking') ||
    normalized.includes('listening')
  ) {
    return {
      listening: 1.4,
      vocabulary: 1.2,
      grammar: 1.2,
      reading: 1.0,
    };
  }

  // Foundation, general english, work, or default
  return {
    vocabulary: 1.5,
    grammar: 1.5,
    reading: 1.2,
    listening: 1.2,
  };
}

/**
 * Pure, deterministic skill priority calculator for Weakness Detection.
 */
export function calculateSkillPriorities(
  profile: LearnerProfileSummary
): SkillPriority[] {
  const weights = getGoalWeights(profile.primaryGoalType);

  const priorities: SkillPriority[] = SKILLS_ORDER.map((skill) => {
    const skillData = profile.skillProfiles[skill];
    const abilityScore = skillData ? skillData.abilityScore : 0.5;
    const goalWeight = weights[skill] || 1.0;
    const priorityScore = Number(((1.0 - abilityScore) * goalWeight).toFixed(4));

    let severity: WeaknessSeverity = 'strength';
    let rationale = `Điểm năng lực ${(abilityScore * 100).toFixed(0)}% — Duy trì bài tập nâng cao.`;

    if (abilityScore < 0.5) {
      severity = 'critical';
      rationale = `Độ chính xác ${(abilityScore * 100).toFixed(0)}% — Cần ưu tiên củng cố ngay tại Milestone 1.`;
    } else if (abilityScore < 0.75) {
      severity = 'developing';
      rationale = `Độ chính xác ${(abilityScore * 100).toFixed(0)}% — Đang tiến bộ, cần rèn luyện thêm tại Milestone 2.`;
    }

    return {
      skill,
      title: SKILL_TITLES[skill],
      abilityScore,
      goalWeight,
      priorityScore,
      severity,
      rationale,
    };
  });

  // Deterministic sorting with tie-breaking rules
  return priorities.sort((a, b) => {
    // 1. Higher priority score first
    if (b.priorityScore !== a.priorityScore) {
      return b.priorityScore - a.priorityScore;
    }
    // 2. Higher goal weight first
    if (b.goalWeight !== a.goalWeight) {
      return b.goalWeight - a.goalWeight;
    }
    // 3. Fixed tie-breaking order: vocab -> grammar -> listening -> reading
    return SKILLS_ORDER.indexOf(a.skill) - SKILLS_ORDER.indexOf(b.skill);
  });
}

/**
 * Determines target level from current CEFR level.
 */
export function getNextTargetLevel(current: CEFRLevel): CEFRLevel {
  switch (current) {
    case 'pre_a1':
      return 'a1';
    case 'a1':
      return 'a2';
    case 'a2':
      return 'b1';
    case 'b1':
      return 'b2';
    case 'b2':
      return 'b2'; // Maintain B2 or advance to C1
    default:
      return 'b1';
  }
}

/**
 * Calculates total workload and estimated study weeks.
 */
export function calculateWorkload(
  milestones: MilestoneDraft[],
  dailyMinutes: number,
  studyDays: number[]
): {
  totalEstimatedMinutes: number;
  weeklyAvailableMinutes: number;
  estimatedWeeks: number;
} {
  let totalEstimatedMinutes = 0;

  for (const m of milestones) {
    for (const mod of m.modules) {
      for (const t of mod.topics) {
        totalEstimatedMinutes += t.estimated_minutes || 20;
      }
    }
  }

  const safeDaily = Math.max(10, Math.min(240, dailyMinutes || 30));
  const safeDaysCount = Math.max(1, Math.min(7, (studyDays && studyDays.length) || 5));
  const weeklyAvailableMinutes = safeDaily * safeDaysCount;

  const estimatedWeeks = Math.max(
    1,
    Math.min(52, Math.ceil(totalEstimatedMinutes / weeklyAvailableMinutes))
  );

  return {
    totalEstimatedMinutes,
    weeklyAvailableMinutes,
    estimatedWeeks,
  };
}

/**
 * Core Rule-Based Learning Path Generator.
 * Deterministic, explainable, and fully testable without AI dependency.
 */
export function generateLearningPathProposal(
  profile: LearnerProfileSummary
): GeneratedPathProposal {
  const targetLevel = getNextTargetLevel(profile.estimatedLevel);
  const skillPriorities = calculateSkillPriorities(profile);
  const isStarterPath = !profile.hasCompletedAssessment;

  const milestones: MilestoneDraft[] = [];

  // ============================================================================
  // MILESTONE 1: Củng cố kỹ năng còn yếu (hoặc Khởi động nếu chưa test)
  // ============================================================================
  const m1Modules: ModuleDraft[] = [];
  const weakestSkills = isStarterPath
    ? (['vocabulary', 'grammar'] as AssessmentSkill[])
    : skillPriorities.slice(0, 2).map((sp) => sp.skill);

  for (const skill of weakestSkills) {
    const topics = CURRICULUM_BANK[skill][profile.estimatedLevel] || [];
    if (topics.length > 0) {
      m1Modules.push({
        title: `Củng cố ${SKILL_TITLES[skill]}`,
        description: isStarterPath
          ? `Luyện tập kỹ năng nền tảng theo chuẩn ${profile.estimatedLevel.toUpperCase()}`
          : `Tập trung khắc phục lỗ hổng được xác định qua bài kiểm tra đầu vào.`,
        skill,
        topics: topics.slice(0, 2),
      });
    }
  }

  milestones.push({
    title: isStarterPath
      ? 'Milestone 1 — Khởi động năng lực cốt lõi'
      : 'Milestone 1 — Củng cố lỗ hổng kỹ năng ưu tiên',
    description: isStarterPath
      ? 'Lộ trình khởi động tiêu chuẩn theo mục tiêu của bạn. Hoàn thành bài test để cá nhân hóa chính xác hơn.'
      : `Ưu tiên tập trung vào ${weakestSkills.map((s) => SKILL_TITLES[s]).join(' và ')} để tạo nền tảng vững chắc.`,
    position: 1,
    modules: m1Modules,
  });

  // ============================================================================
  // MILESTONE 2: Phát triển năng lực phục vụ mục tiêu chính
  // ============================================================================
  const m2Modules: ModuleDraft[] = [];
  const goalSkills: AssessmentSkill[] = profile.primaryGoalType.includes('toeic')
    ? ['listening', 'reading', 'grammar']
    : ['vocabulary', 'listening', 'grammar'];

  for (const skill of goalSkills) {
    const topics =
      (CURRICULUM_BANK[skill][targetLevel] && CURRICULUM_BANK[skill][targetLevel].length > 0)
        ? CURRICULUM_BANK[skill][targetLevel]
        : CURRICULUM_BANK[skill][profile.estimatedLevel] || [];

    if (topics.length > 0) {
      m2Modules.push({
        title: `Phát triển ${SKILL_TITLES[skill]} chuẩn ${targetLevel.toUpperCase()}`,
        description: `Nâng cao năng lực chuyên sâu phục vụ mục tiêu ${profile.primaryGoalTitle}.`,
        skill,
        topics: topics.slice(0, 2),
      });
    }
  }

  milestones.push({
    title: `Milestone 2 — Xây dựng năng lực theo mục tiêu ${profile.primaryGoalTitle}`,
    description: `Tiếp cận các chủ điểm kiến thức nâng cao hướng tới mốc chuẩn ${targetLevel.toUpperCase()}.`,
    position: 2,
    modules: m2Modules,
  });

  // ============================================================================
  // MILESTONE 3: Luyện tập tích hợp và đánh giá mốc
  // ============================================================================
  const m3Modules: ModuleDraft[] = [
    {
      title: 'Luyện tập tổng hợp đa kỹ năng',
      description: 'Kết hợp các dạng bài tập ngữ cảnh thực tế theo mục tiêu học.',
      topics: [
        {
          title: `Thực hành tổng hợp ${profile.primaryGoalTitle}`,
          description: 'Bài tập đối chiếu và ứng dụng kiến thức từ Milestone 1 và Milestone 2.',
          skill: 'reading',
          target_level: targetLevel,
          estimated_minutes: 30,
          content_status: 'planned_curriculum',
        },
      ],
    },
    {
      title: 'Đánh giá mốc tiến bộ (Milestone Assessment)',
      description: 'Kiểm tra đo lường sự tiến bộ trước khi hoàn tất lộ trình hiện hành.',
      topics: [
        {
          title: `Bài kiểm tra đánh giá mốc chuẩn ${targetLevel.toUpperCase()}`,
          description: 'Bài kiểm tra mini đo lường sự cải thiện về độ chính xác và năng lực tổng quát.',
          skill: 'grammar',
          target_level: targetLevel,
          estimated_minutes: 25,
          content_status: 'planned_curriculum',
        },
      ],
    },
  ];

  milestones.push({
    title: 'Milestone 3 — Luyện tập tích hợp & Đánh giá mốc',
    description: 'Thực hành tổng hợp và làm bài đánh giá để xác nhận năng lực đầu ra.',
    position: 3,
    modules: m3Modules,
  });

  const workload = calculateWorkload(
    milestones,
    profile.dailyMinutes,
    profile.studyDays
  );

  const pathTitle = isStarterPath
    ? `Lộ trình Tiêu chuẩn: ${profile.primaryGoalTitle} (${profile.estimatedLevel.toUpperCase()} → ${targetLevel.toUpperCase()})`
    : `Lộ trình Cá nhân hóa: ${profile.primaryGoalTitle} (${profile.estimatedLevel.toUpperCase()} → ${targetLevel.toUpperCase()})`;

  const pathDesc = isStarterPath
    ? `Lộ trình học theo khung chương trình tiêu chuẩn dành cho mục tiêu ${profile.primaryGoalTitle}.`
    : `Lộ trình được tối ưu dựa trên điểm yếu kỹ năng đo được (${weakestSkills.map((s) => SKILL_TITLES[s]).join(', ')}) và thời gian học ${profile.dailyMinutes} phút/ngày.`;

  return {
    title: pathTitle,
    description: pathDesc,
    targetLevel,
    totalEstimatedMinutes: workload.totalEstimatedMinutes,
    weeklyAvailableMinutes: workload.weeklyAvailableMinutes,
    estimatedWeeks: workload.estimatedWeeks,
    isStarterPath,
    skillPriorities,
    milestones,
  };
}
