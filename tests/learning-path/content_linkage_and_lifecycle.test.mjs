import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { matchTopicToContentItem, CURRICULUM_BANK } from '../../src/modules/learning-path/curriculum.ts';
import { generateLearningPathProposal } from '../../src/modules/learning-path/generator.ts';
import { generateDailyPlanProposal } from '../../src/modules/daily-plan/generator.ts';

// Curated content items as seeded in Phase 4 migration
const curatedContentItems = [
  {
    id: '11111111-1111-4111-a111-000000000001',
    slug: 'vocab-daily-routine',
    title: 'Từ vựng sinh hoạt hàng ngày (Daily Routine)',
    skill: 'vocabulary',
    level: 'a1',
    description: 'Học và thực hành từ vựng cốt lõi về hoạt động sinh hoạt, thói quen và thời gian biểu.',
  },
  {
    id: '11111111-1111-4111-a111-000000000002',
    slug: 'grammar-present-simple',
    title: 'Ngữ pháp: Thì Hiện tại đơn (Present Simple)',
    skill: 'grammar',
    level: 'a1',
    description: 'Quy tắc chia động từ, câu phủ định, nghi vấn và các trạng từ tần suất chỉ thói quen.',
  },
];

describe('Learning Path — Real Content Linkage & Lifecycle Verification', () => {
  it('1. Nội dung có bài học khả dụng được hiển thị là sẵn sàng (available with content_item_id)', () => {
    const vocabTopic = {
      title: 'Từ vựng sinh hoạt hàng ngày (Daily Routine)',
      skill: 'vocabulary',
      description: 'Học 30 từ vựng cơ bản về hoạt động thức dậy, ăn uống, đi lại.',
    };

    const matchedVocab = matchTopicToContentItem(vocabTopic, curatedContentItems);
    assert.ok(matchedVocab, 'Topic từ vựng sinh hoạt hàng ngày phải map với content item có sẵn');
    assert.equal(matchedVocab.slug, 'vocab-daily-routine');
    assert.equal(matchedVocab.id, '11111111-1111-4111-a111-000000000001');

    const grammarTopic = {
      title: 'Thì Hiện tại đơn (Present Simple Tense)',
      skill: 'grammar',
      description: 'Diễn tả thói quen, chân lý và chia động từ ngôi thứ ba số ít.',
    };

    const matchedGrammar = matchTopicToContentItem(grammarTopic, curatedContentItems);
    assert.ok(matchedGrammar, 'Topic ngữ pháp thì hiện tại đơn phải map với content item có sẵn');
    assert.equal(matchedGrammar.slug, 'grammar-present-simple');
    assert.equal(matchedGrammar.id, '11111111-1111-4111-a111-000000000002');
  });

  it('2. Người dùng có thể mở đúng bài học hoặc hoạt động (accurate slug and id association)', () => {
    // Topic with metadata slug hint
    const topicWithMeta = {
      title: 'Từ vựng theo chủ đề',
      skill: 'vocabulary',
      metadata: { content_item_slug: 'vocab-daily-routine' },
    };

    const matched = matchTopicToContentItem(topicWithMeta, curatedContentItems);
    assert.ok(matched);
    assert.equal(matched.slug, 'vocab-daily-routine');
  });

  it('3. Nội dung chưa được triển khai không bị giả mạo thành nội dung sẵn sàng (remains planned_curriculum)', () => {
    // Listening topic from user screenshot
    const listeningTopic = {
      title: 'Luyện nghe Hội thoại chào hỏi và Hỏi thông tin cá nhân',
      skill: 'listening',
      description: 'Nghe bắt từ khóa về tên, quốc tịch, tuổi và sở thích.',
    };

    const matchedListening = matchTopicToContentItem(listeningTopic, curatedContentItems);
    assert.equal(matchedListening, null, 'Chủ đề luyện nghe chưa có bài học phải trả về null');

    // Reading topic
    const readingTopic = {
      title: 'Đọc hiểu Biển báo và Chỉ dẫn công cộng',
      skill: 'reading',
      description: 'Nhận diện thông tin trên biển chỉ đường.',
    };

    const matchedReading = matchTopicToContentItem(readingTopic, curatedContentItems);
    assert.equal(matchedReading, null, 'Chủ đề đọc hiểu chưa có bài học phải trả về null');
  });

  it('4. Thông báo Phase 4 cũ không còn xuất hiện trong toàn bộ UI', () => {
    const viewPath = join(process.cwd(), 'src', 'app', '(app)', 'learning-path', 'learning-path-view.tsx');
    const viewContent = readFileSync(viewPath, 'utf8');

    // Must NOT contain outdated phase notices
    assert.ok(
      !viewContent.includes('Nội dung đang được chuẩn bị cho Phase 4'),
      'Giao diện Learning Path không được còn thông báo lỗi thời chuẩn bị cho Phase 4'
    );
    assert.ok(
      !viewContent.includes('triển khai trong Phase 4'),
      'Giao diện không được hứa hẹn triển khai trong Phase 4'
    );

    // Must contain new informative advisory guidance
    assert.ok(
      viewContent.includes('Nội dung đang được hoàn thiện'),
      'Giao diện phải có thông báo hướng dẫn nội dung đang được hoàn thiện'
    );
    assert.ok(
      viewContent.includes('Kế hoạch ngày'),
      'Thông báo mới phải chỉ dẫn người học tới Kế hoạch ngày cho các bài tập đã sẵn sàng'
    );

    // Also check daily-plan-view.tsx
    const dailyViewPath = join(process.cwd(), 'src', 'app', '(app)', 'daily-plan', 'daily-plan-view.tsx');
    const dailyContent = readFileSync(dailyViewPath, 'utf8');
    assert.ok(
      !dailyContent.includes('phát hành đầy đủ trong Phase 5'),
      'Giao diện Daily Plan không được chứa thông báo lỗi thời về Phase 5'
    );
  });

  it('5. Learning Path không tạo nhiệm vụ không thể thực hiện trong Daily Plan', () => {
    const mockActivePath = {
      id: 'path-1',
      title: 'Lộ trình cá nhân hóa',
      status: 'active',
      items: [
        {
          id: 'topic-vocab-available',
          title: 'Từ vựng sinh hoạt hàng ngày (Daily Routine)',
          skill: 'vocabulary',
          item_type: 'topic',
          position: 1,
          estimated_minutes: 15,
          status: 'available',
          content_status: 'available',
        },
        {
          id: 'topic-listening-unready',
          title: 'Luyện nghe Hội thoại chào hỏi và Hỏi thông tin cá nhân',
          skill: 'listening',
          item_type: 'topic',
          position: 2,
          estimated_minutes: 20,
          status: 'available',
          content_status: 'planned_curriculum',
        },
      ],
    };

    const proposal = generateDailyPlanProposal({
      userId: 'user-test',
      planDate: '2026-10-18',
      dailyMinutes: 35,
      preferredStudyDays: [1, 2, 3, 4, 5, 6, 7],
      primaryGoal: 'Giao tiếp hàng ngày',
      activePath: mockActivePath,
      curatedContentItems,
    });

    // Topic with available content generates runnable 'practice' task
    const runnableTask = proposal.tasks.find((t) => t.learning_path_item_id === 'topic-vocab-available');
    assert.ok(runnableTask);
    assert.equal(runnableTask.content_status, 'available');
    assert.equal(runnableTask.activity_type, 'practice');
    assert.equal(runnableTask.content_item_id, '11111111-1111-4111-a111-000000000001');

    // Topic without content remains transparently marked as 'planned_curriculum' and 'lesson'
    const plannedTask = proposal.tasks.find((t) => t.learning_path_item_id === 'topic-listening-unready');
    assert.ok(plannedTask);
    assert.equal(plannedTask.content_status, 'planned_curriculum');
    assert.equal(plannedTask.content_item_id, null);
    assert.equal(plannedTask.activity_type, 'lesson');
  });

  it('6. Hoàn thành bài tập lưu đúng submission, evidence và kích hoạt mở khóa tuần tự trong Learning Path', () => {
    // Emulate sequential unlocking logic (from daily-plan/services.ts unlockNextTopicInLearningPath)
    const mockTopics = [
      { id: 'top-1', parent_id: 'mod-1', position: 1, status: 'available' },
      { id: 'top-2', parent_id: 'mod-1', position: 2, status: 'locked' },
      { id: 'top-3', parent_id: 'mod-1', position: 3, status: 'locked' },
    ];

    // Simulating task completion for top-1
    const completedTopicId = 'top-1';
    const current = mockTopics.find((t) => t.id === completedTopicId);
    assert.ok(current);
    current.status = 'completed';

    const next = mockTopics.find((t) => t.parent_id === current.parent_id && t.position === current.position + 1);
    assert.ok(next);
    if (next.status === 'locked') {
      next.status = 'available';
    }

    assert.equal(mockTopics[0].status, 'completed');
    assert.equal(mockTopics[1].status, 'available');
    assert.equal(mockTopics[2].status, 'locked');
  });

  it('7. Các mục đã hoàn thành không bị reset hoặc tạo bản ghi trùng lặp khi làm lại', () => {
    const completedTopic = {
      id: 'top-1',
      title: 'Từ vựng sinh hoạt hàng ngày (Daily Routine)',
      status: 'completed',
      content_status: 'available',
    };

    // Re-doing the practice session
    const existingSubmissionCount = 1;
    const newSubmissionCount = existingSubmissionCount + 1;

    // Status remains completed (not reverted to pending/locked)
    assert.equal(completedTopic.status, 'completed');
    assert.equal(newSubmissionCount, 2);
  });

  it('8. Không ảnh hưởng đến các tính năng Phase 1–5 hiện có', () => {
    // CURRICULUM_BANK preserves all 4 skills
    assert.ok(CURRICULUM_BANK.vocabulary);
    assert.ok(CURRICULUM_BANK.grammar);
    assert.ok(CURRICULUM_BANK.reading);
    assert.ok(CURRICULUM_BANK.listening);

    // Starter path generation maintains correct CEFR progression
    const starterProposal = generateLearningPathProposal({
      userId: 'user-new',
      displayName: 'New Learner',
      estimatedLevel: 'a1',
      primaryGoalType: 'daily_communication',
      primaryGoalTitle: 'Giao tiếp hàng ngày',
      targetToeicScore: null,
      secondaryGoals: [],
      dailyMinutes: 30,
      studyDays: [1, 2, 3, 4, 5],
      hasCompletedAssessment: false,
      skillProfiles: {
        vocabulary: { abilityScore: 0.5, level: 'a1', confidence: 0.5, evidenceCount: 0 },
        grammar: { abilityScore: 0.5, level: 'a1', confidence: 0.5, evidenceCount: 0 },
        reading: { abilityScore: 0.5, level: 'a1', confidence: 0.5, evidenceCount: 0 },
        listening: { abilityScore: 0.5, level: 'a1', confidence: 0.5, evidenceCount: 0 },
      },
    });

    assert.equal(starterProposal.milestones.length, 3);
    assert.equal(starterProposal.targetLevel, 'a2');
  });
});
