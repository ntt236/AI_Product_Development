import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  calculateSkillPriorities,
  generateLearningPathProposal,
  calculateWorkload,
  getGoalWeights,
  getNextTargetLevel,
} from '../../src/modules/learning-path/generator.ts';

const mockProfileA2Toeic = {
  userId: 'user-toeic-1',
  displayName: 'Nam Nguyen',
  estimatedLevel: 'a2',
  primaryGoalType: 'toeic',
  primaryGoalTitle: 'Luyện thi TOEIC',
  targetToeicScore: 750,
  secondaryGoals: ['daily_communication'],
  dailyMinutes: 30,
  studyDays: [1, 2, 3, 4, 5], // 5 days/week -> 150 mins/week
  hasCompletedAssessment: true,
  skillProfiles: {
    vocabulary: { abilityScore: 0.75, level: 'b1', confidence: 0.8, evidenceCount: 1 },
    grammar: { abilityScore: 0.50, level: 'a2', confidence: 0.8, evidenceCount: 1 },
    reading: { abilityScore: 0.25, level: 'pre_a1', confidence: 0.8, evidenceCount: 1 },
    listening: { abilityScore: 0.25, level: 'pre_a1', confidence: 0.8, evidenceCount: 1 },
  },
};

const mockProfileUnassessed = {
  userId: 'user-new-2',
  displayName: 'Lan Tran',
  estimatedLevel: 'a1',
  primaryGoalType: 'daily_communication',
  primaryGoalTitle: 'Giao tiếp hàng ngày',
  targetToeicScore: null,
  secondaryGoals: [],
  dailyMinutes: 20,
  studyDays: [1, 3, 5], // 3 days/week -> 60 mins/week
  hasCompletedAssessment: false,
  skillProfiles: {
    vocabulary: { abilityScore: 0.5, level: 'a1', confidence: 0.5, evidenceCount: 0 },
    grammar: { abilityScore: 0.5, level: 'a1', confidence: 0.5, evidenceCount: 0 },
    reading: { abilityScore: 0.5, level: 'a1', confidence: 0.5, evidenceCount: 0 },
    listening: { abilityScore: 0.5, level: 'a1', confidence: 0.5, evidenceCount: 0 },
  },
};

describe('Phase 3 Learning Path Generator & Weakness Detection Suite', () => {
  it('1. Trọng số mục tiêu được ánh xạ đúng theo Primary Goal', () => {
    const toeicWeights = getGoalWeights('toeic');
    assert.equal(toeicWeights.reading, 1.5);
    assert.equal(toeicWeights.listening, 1.5);
    assert.equal(toeicWeights.grammar, 1.2);
    assert.equal(toeicWeights.vocabulary, 1.2);

    const commWeights = getGoalWeights('daily_communication');
    assert.equal(commWeights.listening, 1.4);
    assert.equal(commWeights.vocabulary, 1.2);

    const foundationWeights = getGoalWeights('foundation');
    assert.equal(foundationWeights.vocabulary, 1.5);
    assert.equal(foundationWeights.grammar, 1.5);
  });

  it('2. Tính Priority Score và xếp hạng điểm yếu kỹ năng chính xác (Weakness Detection)', () => {
    const priorities = calculateSkillPriorities(mockProfileA2Toeic);
    assert.equal(priorities.length, 4);

    // Reading: (1 - 0.25) * 1.5 = 1.125
    // Listening: (1 - 0.25) * 1.5 = 1.125
    // Grammar: (1 - 0.50) * 1.2 = 0.60
    // Vocab: (1 - 0.75) * 1.2 = 0.30
    assert.equal(priorities[0].priorityScore, 1.125);
    assert.equal(priorities[1].priorityScore, 1.125);
    assert.equal(priorities[2].priorityScore, 0.6);
    assert.equal(priorities[3].priorityScore, 0.3);

    // Tie-break rule: Between listening and reading (both 1.125 and goalWeight 1.5)
    // Order in SKILLS_ORDER is listening before reading
    assert.equal(priorities[0].skill, 'listening');
    assert.equal(priorities[1].skill, 'reading');
    assert.equal(priorities[0].severity, 'critical');
    assert.equal(priorities[1].severity, 'critical');
    assert.equal(priorities[2].severity, 'developing');
    assert.equal(priorities[3].severity, 'strength');
  });

  it('3. Sinh lộ trình thích ứng 3 Milestones cho user TOEIC với điểm yếu Đọc & Nghe', () => {
    const proposal = generateLearningPathProposal(mockProfileA2Toeic);

    assert.equal(proposal.isStarterPath, false);
    assert.equal(proposal.targetLevel, 'b1');
    assert.equal(proposal.milestones.length, 3);

    // Milestone 1: Củng cố điểm yếu cốt lõi
    const m1 = proposal.milestones[0];
    assert.ok(m1.title.includes('Milestone 1'));
    assert.equal(m1.position, 1);
    assert.ok(m1.description.includes('Nghe hiểu') || m1.description.includes('Đọc hiểu'));

    // Milestone 2: Phát triển theo mục tiêu chính
    const m2 = proposal.milestones[1];
    assert.ok(m2.title.includes('Milestone 2'));
    assert.equal(m2.position, 2);

    // Milestone 3: Luyện tập tích hợp & đánh giá mốc
    const m3 = proposal.milestones[2];
    assert.ok(m3.title.includes('Milestone 3'));
    assert.equal(m3.position, 3);
  });

  it('4. Khởi tạo Starter Path tiêu chuẩn khi người dùng chưa làm Placement Test', () => {
    const proposal = generateLearningPathProposal(mockProfileUnassessed);

    assert.equal(proposal.isStarterPath, true);
    assert.equal(proposal.targetLevel, 'a2');
    assert.ok(proposal.title.includes('Lộ trình Tiêu chuẩn'));
    assert.ok(proposal.milestones[0].title.includes('Khởi động năng lực cốt lõi'));
  });

  it('5. Tính toán thời lượng lộ trình động (Dynamic Workload) dựa trên lịch học thực tế', () => {
    const proposal = generateLearningPathProposal(mockProfileA2Toeic);

    // Total estimated minutes must be sum of all topics
    let sumMinutes = 0;
    for (const m of proposal.milestones) {
      for (const mod of m.modules) {
        for (const t of mod.topics) {
          sumMinutes += t.estimated_minutes;
        }
      }
    }

    assert.equal(proposal.totalEstimatedMinutes, sumMinutes);
    // 30 mins * 5 days = 150 mins/week
    assert.equal(proposal.weeklyAvailableMinutes, 150);
    // Estimated weeks = ceil(sumMinutes / 150)
    assert.equal(proposal.estimatedWeeks, Math.ceil(sumMinutes / 150));
    assert.ok(proposal.estimatedWeeks >= 1 && proposal.estimatedWeeks <= 52);
  });

  it('6. Tính xác định (Deterministic): Cùng một Profile luôn tạo ra cùng một Lộ trình 100%', () => {
    const run1 = generateLearningPathProposal(mockProfileA2Toeic);
    const run2 = generateLearningPathProposal(mockProfileA2Toeic);

    assert.deepEqual(run1, run2);
  });

  it('7. Minh bạch nội dung: Mọi topic đều được đánh dấu planned_curriculum rõ ràng', () => {
    const proposal = generateLearningPathProposal(mockProfileA2Toeic);

    for (const m of proposal.milestones) {
      for (const mod of m.modules) {
        for (const t of mod.topics) {
          assert.equal(t.content_status, 'planned_curriculum');
          assert.ok(t.estimated_minutes >= 10 && t.estimated_minutes <= 180);
        }
      }
    }
  });

  it('8. Xác định cấp độ mục tiêu tiếp theo chuẩn xác theo CEFR', () => {
    assert.equal(getNextTargetLevel('pre_a1'), 'a1');
    assert.equal(getNextTargetLevel('a1'), 'a2');
    assert.equal(getNextTargetLevel('a2'), 'b1');
    assert.equal(getNextTargetLevel('b1'), 'b2');
    assert.equal(getNextTargetLevel('b2'), 'b2');
  });
});
