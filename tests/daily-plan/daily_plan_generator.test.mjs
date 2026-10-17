import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  generateDailyPlanProposal,
  getDayOfWeekFromDateString,
} from '../../src/modules/daily-plan/generator.ts';

describe('Phase 4 — Daily Plan Generator Engine', () => {
  const mockCuratedContent = [
    {
      id: 'content-vocab-1',
      slug: 'vocab-daily-routine',
      title: 'Từ vựng sinh hoạt hàng ngày (Daily Routine)',
      description: 'Học 6 từ vựng cơ bản về hoạt động thức dậy, ăn uống, đi lại.',
      content_type: 'vocabulary_set',
      skill: 'vocabulary',
      level: 'a1',
      estimated_minutes: 15,
      body: {},
      is_published: true,
    },
    {
      id: 'content-grammar-1',
      slug: 'grammar-present-simple',
      title: 'Ngữ pháp: Thì Hiện tại đơn (Present Simple)',
      description: 'Quy tắc chia động từ, câu phủ định, nghi vấn thì Hiện tại đơn.',
      content_type: 'grammar',
      skill: 'grammar',
      level: 'a1',
      estimated_minutes: 15,
      body: {},
      is_published: true,
    },
  ];

  it('1. Ánh xạ ngày trong tuần chính xác (1 = Thứ 2 ... 7 = Chủ nhật)', () => {
    // 2026-10-16 is Friday -> 5
    assert.equal(getDayOfWeekFromDateString('2026-10-16'), 5);
    // 2026-10-18 is Sunday -> 7
    assert.equal(getDayOfWeekFromDateString('2026-10-18'), 7);
    // 2026-10-19 is Monday -> 1
    assert.equal(getDayOfWeekFromDateString('2026-10-19'), 1);
  });

  it('2. Phân bổ thời lượng kế hoạch khớp với daily_minutes của học viên', () => {
    const proposal30 = generateDailyPlanProposal({
      userId: 'user-1',
      planDate: '2026-10-16',
      dailyMinutes: 30,
      preferredStudyDays: [1, 2, 3, 4, 5],
      primaryGoal: 'TOEIC 650',
      activePath: null,
      curatedContentItems: mockCuratedContent,
    });

    assert.equal(proposal30.target_minutes, 30);
    assert.equal(proposal30.tasks.length, 2);
    const totalEst = proposal30.tasks.reduce((sum, t) => sum + t.estimated_minutes, 0);
    assert.equal(totalEst, 30);
  });

  it('3. Xác định đúng ngày học chính theo lịch hay học linh hoạt', () => {
    // Friday (5) is in [1, 3, 5]
    const scheduled = generateDailyPlanProposal({
      userId: 'user-1',
      planDate: '2026-10-16',
      dailyMinutes: 15,
      preferredStudyDays: [1, 3, 5],
      primaryGoal: 'Giao tiếp hàng ngày',
      activePath: null,
      curatedContentItems: mockCuratedContent,
    });
    assert.equal(scheduled.generation_reason.isScheduledDay, true);

    // Saturday (6) is NOT in [1, 3, 5]
    const offSchedule = generateDailyPlanProposal({
      userId: 'user-1',
      planDate: '2026-10-17',
      dailyMinutes: 15,
      preferredStudyDays: [1, 3, 5],
      primaryGoal: 'Giao tiếp hàng ngày',
      activePath: null,
      curatedContentItems: mockCuratedContent,
    });
    assert.equal(offSchedule.generation_reason.isScheduledDay, false);
  });

  it('4. Ưu tiên lấy topic unlocked từ Learning Path và gán content_status chuẩn xác', () => {
    const mockActivePath = {
      id: 'path-123',
      title: 'Lộ trình Tiếng Anh Giao tiếp A1',
      status: 'active',
      items: [
        {
          id: 'topic-vocab-unlocked',
          title: 'Từ vựng sinh hoạt hàng ngày (Daily Routine)',
          skill: 'vocabulary',
          item_type: 'topic',
          position: 1,
          estimated_minutes: 15,
          status: 'available',
          content_status: 'planned_curriculum',
        },
        {
          id: 'topic-reading-planned',
          title: 'Đọc hiểu biển báo công cộng',
          skill: 'reading',
          item_type: 'topic',
          position: 2,
          estimated_minutes: 15,
          status: 'available',
          content_status: 'planned_curriculum',
        },
      ],
    };

    const proposal = generateDailyPlanProposal({
      userId: 'user-1',
      planDate: '2026-10-16',
      dailyMinutes: 30,
      preferredStudyDays: [1, 2, 3, 4, 5],
      primaryGoal: 'Giao tiếp hàng ngày',
      activePath: mockActivePath,
      curatedContentItems: mockCuratedContent,
    });

    assert.equal(proposal.tasks.length, 2);

    // First task matches curated vocab -> content_status = 'available'
    const task1 = proposal.tasks[0];
    assert.equal(task1.learning_path_item_id, 'topic-vocab-unlocked');
    assert.equal(task1.content_item_id, 'content-vocab-1');
    assert.equal(task1.content_status, 'available');
    assert.equal(task1.activity_type, 'practice');

    // Second task has no curated content yet -> remains transparently 'planned_curriculum'
    const task2 = proposal.tasks[1];
    assert.equal(task2.learning_path_item_id, 'topic-reading-planned');
    assert.equal(task2.content_item_id, null);
    assert.equal(task2.content_status, 'planned_curriculum');
    assert.equal(task2.activity_type, 'lesson');
  });

  it('5. Tính tất định (Deterministic): Cùng thông số đầu vào luôn sinh kế hoạch hoàn toàn trùng khớp', () => {
    const input = {
      userId: 'user-deterministic',
      planDate: '2026-10-16',
      dailyMinutes: 30,
      preferredStudyDays: [1, 2, 3, 4, 5],
      primaryGoal: 'TOEIC 700',
      activePath: null,
      curatedContentItems: mockCuratedContent,
    };

    const run1 = generateDailyPlanProposal(input);
    const run2 = generateDailyPlanProposal(input);

    assert.deepEqual(run1, run2);
  });
});
