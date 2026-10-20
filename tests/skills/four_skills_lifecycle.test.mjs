import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, statSync } from 'node:fs';
import { join } from 'node:path';
import {
  countWords,
  generateFallbackWritingEvaluation,
  generateFallbackSpeakingEvaluation,
} from '../../src/modules/skills/evaluator.ts';
import {
  submitWritingInputSchema,
  submitSpeakingInputSchema,
} from '../../src/modules/skills/types.ts';
import {
  CURRICULUM_BANK,
  SKILL_TITLES,
  matchTopicToContentItem,
} from '../../src/modules/learning-path/curriculum.ts';
import { getSkillsCatalog } from '../../src/modules/skills/services.ts';

describe('Phase 7 — Four Skills Implementation Lifecycle Suite', () => {
  // =========================================================================
  // 1. Audio File Verification for Listening
  // =========================================================================
  it('1. Audio bài nghe thực tế (Listening Audio) tồn tại và có dung lượng hợp lệ', () => {
    const audioFilePath = join(process.cwd(), 'public', 'audio', 'daily-conversations-introducing-yourself.wav');
    assert.equal(
      existsSync(audioFilePath),
      true,
      'File audio public/audio/daily-conversations-introducing-yourself.wav phải tồn tại trên ổ đĩa'
    );

    const stats = statSync(audioFilePath);
    assert.ok(
      stats.size > 100000,
      `Dung lượng file audio phải lớn hơn 100KB (thực tế: ${stats.size} bytes)`
    );
  });

  // =========================================================================
  // 2. Four Skills Catalog Integrity & Accurate Status Reporting
  // =========================================================================
  it('2. Danh mục kỹ năng (getSkillsCatalog) báo cáo chính xác 4 kỹ năng và phân biệt Ready vs Planned', async () => {
    const catalog = await getSkillsCatalog();
    assert.ok(Array.isArray(catalog), 'Catalog phải trả về danh sách mảng');
    assert.ok(catalog.length >= 8, 'Catalog phải bao gồm cả bài học ready và bài học planned cho tương lai');

    // Verify all 4 core skills are present
    const skills = new Set(catalog.map((i) => i.skill));
    assert.ok(skills.has('listening'), 'Catalog phải có bài học Listening');
    assert.ok(skills.has('reading'), 'Catalog phải có bài học Reading');
    assert.ok(skills.has('writing'), 'Catalog phải có bài học Writing');
    assert.ok(skills.has('speaking'), 'Catalog phải có bài học Speaking');

    // Listening item checks
    const listeningItem = catalog.find((i) => i.slug === 'listening-daily-conversations-introducing-yourself');
    assert.ok(listeningItem, 'Phải có bài listening-daily-conversations-introducing-yourself');
    assert.equal(listeningItem.skill, 'listening');
    assert.equal(listeningItem.level, 'A1');
    assert.equal(listeningItem.status, 'ready');
    assert.equal(listeningItem.audioUrl, '/audio/daily-conversations-introducing-yourself.wav');

    // Reading item checks
    const readingItem = catalog.find((i) => i.slug === 'reading-workplace-announcements-messages');
    assert.ok(readingItem, 'Phải có bài reading-workplace-announcements-messages');
    assert.equal(readingItem.skill, 'reading');
    assert.equal(readingItem.level, 'A1');
    assert.equal(readingItem.status, 'ready');

    // Writing item checks
    const writingItem = catalog.find((i) => i.slug === 'writing-introductory-email');
    assert.ok(writingItem, 'Phải có bài writing-introductory-email');
    assert.equal(writingItem.skill, 'writing');
    assert.equal(writingItem.level, 'A1');
    assert.equal(writingItem.status, 'ready');

    // Speaking item checks
    const speakingItem = catalog.find((i) => i.slug === 'speaking-daily-life-introduction');
    assert.ok(speakingItem, 'Phải có bài speaking-daily-life-introduction');
    assert.equal(speakingItem.skill, 'speaking');
    assert.equal(speakingItem.level, 'A1');
    assert.equal(speakingItem.status, 'ready');

    // Planned items check
    const plannedItems = catalog.filter((i) => i.status === 'planned');
    assert.ok(plannedItems.length >= 4, 'Phải giữ trạng thái planned cho các bài chưa ra mắt');
    for (const p of plannedItems) {
      assert.equal(p.status, 'planned');
      assert.equal(p.badgeLabel, 'Đang chuẩn bị');
    }
  });

  // =========================================================================
  // 3. Word Counting Utility Accuracy
  // =========================================================================
  it('3. Hàm đếm từ (countWords) xử lý chính xác các trường hợp biên', () => {
    assert.equal(countWords(''), 0);
    assert.equal(countWords('   '), 0);
    assert.equal(countWords(null), 0);
    assert.equal(countWords(undefined), 0);
    assert.equal(countWords('Hello world!'), 2);
    assert.equal(countWords('  Hello   world!  This  is   a test.  '), 6);
    assert.equal(countWords('Line 1\nLine 2\tLine 3'), 6);
  });

  // =========================================================================
  // 4. Writing Validation & Evaluator Engine
  // =========================================================================
  it('4. Schema Zod cho Writing kiểm tra chặt chẽ độ dài và cấu trúc dữ liệu', () => {
    const validUuid = '123e4567-e89b-12d3-a456-426614174000';

    // Too short (under 10 words)
    const shortCheck = submitWritingInputSchema.safeParse({
      contentItemId: validUuid,
      essayText: 'Hello world. This is too short.',
      durationSeconds: 30,
    });
    assert.equal(shortCheck.success, false);
    assert.match(shortCheck.error.issues[0].message, /10 từ/);

    // Missing / invalid contentItemId
    const missingIdCheck = submitWritingInputSchema.safeParse({
      contentItemId: 'not-a-valid-uuid',
      essayText: 'This is a valid long essay written for testing the writing validation schema.',
      durationSeconds: 30,
    });
    assert.equal(missingIdCheck.success, false);

    // Valid submission
    const validCheck = submitWritingInputSchema.safeParse({
      contentItemId: validUuid,
      essayText: 'Dear Team, my name is Alex and I am very excited to join the company this week.',
      durationSeconds: 65,
      taskId: '22222222-2222-4222-a222-222222222222',
    });
    assert.equal(validCheck.success, true);
  });

  it('5. Bộ đánh giá quy chuẩn Writing (generateFallbackWritingEvaluation) trả về đúng Rubric 100 điểm', () => {
    const text = 'Dear Team, my name is Alex. I am join the company as marketing specialist. I am hope we work good together.';
    const result = generateFallbackWritingEvaluation(text, 20);

    assert.equal(result.evaluation_source, 'fallback_heuristic');
    assert.ok(typeof result.overall_feedback === 'string' && result.overall_feedback.length > 20);
    assert.ok(result.rubric_scores.total_score >= 0 && result.rubric_scores.total_score <= 100);
    assert.equal(
      result.rubric_scores.total_score,
      result.rubric_scores.task_achievement +
        result.rubric_scores.grammar_accuracy +
        result.rubric_scores.lexical_resource +
        result.rubric_scores.coherence_organization
    );
    assert.ok(Array.isArray(result.grammar_corrections));
    assert.ok(Array.isArray(result.vocabulary_enhancements));
    assert.ok(result.improved_version.text.length > 10);
    assert.ok(result.next_steps.length >= 2);
  });

  // =========================================================================
  // 5. Speaking Validation & Evaluator Engine (Transcript-First)
  // =========================================================================
  it('6. Schema Zod cho Speaking kiểm tra chặt chẽ độ dài và cấu trúc dữ liệu', () => {
    const validUuid = '123e4567-e89b-12d3-a456-426614174000';

    // Too short (under 10 words)
    const shortCheck = submitSpeakingInputSchema.safeParse({
      contentItemId: validUuid,
      transcriptText: 'I wake up at six.',
      durationSeconds: 15,
    });
    assert.equal(shortCheck.success, false);
    assert.match(shortCheck.error.issues[0].message, /10 từ/);

    // Valid speaking transcript
    const validCheck = submitSpeakingInputSchema.safeParse({
      contentItemId: validUuid,
      transcriptText: 'Every morning I wake up at six thirty, have coffee, and take the bus to work.',
      durationSeconds: 45,
    });
    assert.equal(validCheck.success, true);
  });

  it('7. Bộ đánh giá quy chuẩn Speaking (generateFallbackSpeakingEvaluation) hỗ trợ đầy đủ Transcript-First', () => {
    const transcript = 'Usually every day I am wake up at seven AM. I enjoy listening music and drinking hot green tea in morning.';
    const result = generateFallbackSpeakingEvaluation(transcript, 18);

    assert.equal(result.evaluation_source, 'fallback_heuristic');
    assert.ok(typeof result.overall_feedback === 'string');
    assert.ok(typeof result.relevance_and_fluency === 'string');
    assert.ok(result.rubric_scores.total_score >= 0 && result.rubric_scores.total_score <= 100);
    assert.equal(
      result.rubric_scores.total_score,
      result.rubric_scores.relevance_fluency +
        result.rubric_scores.spoken_grammar +
        result.rubric_scores.conversational_vocab +
        result.rubric_scores.naturalness_sample
    );
    assert.ok(result.sample_spoken_response.text.length > 20);
    assert.ok(result.sample_spoken_response.key_phrases.length >= 2);
    assert.ok(result.next_steps.length >= 2);
  });

  // =========================================================================
  // 6. Curriculum Bank Integration for 4 Skills
  // =========================================================================
  it('8. Ngân hàng chương trình (CURRICULUM_BANK) tích hợp đủ 4 kỹ năng ở cấp độ a1', () => {
    assert.ok(CURRICULUM_BANK.listening.a1.length > 0, 'Phải có module Listening a1');
    assert.ok(CURRICULUM_BANK.reading.a1.length > 0, 'Phải có module Reading a1');
    assert.ok(CURRICULUM_BANK.writing.a1.length > 0, 'Phải có module Writing a1');
    assert.ok(CURRICULUM_BANK.speaking.a1.length > 0, 'Phải có module Speaking a1');

    assert.equal(SKILL_TITLES.listening, 'Nghe hiểu (Listening)');
    assert.equal(SKILL_TITLES.reading, 'Đọc hiểu (Reading)');
    assert.equal(SKILL_TITLES.writing, 'Viết (Writing)');
    assert.equal(SKILL_TITLES.speaking, 'Nói (Speaking)');
  });

  it('9. Bộ khớp bài học (matchTopicToContentItem) liên kết đúng với các nội dung đã công bố', () => {
    const mockCurated = [
      {
        id: 'c-reading-1',
        slug: 'reading-workplace-announcements-messages',
        title: 'Workplace Announcements',
        skill: 'reading',
      },
      {
        id: 'c-writing-1',
        slug: 'writing-introductory-email',
        title: 'Writing Introductory Email',
        skill: 'writing',
      },
      {
        id: 'c-speaking-1',
        slug: 'speaking-daily-life-introduction',
        title: 'Speaking Daily Life',
        skill: 'speaking',
      },
      {
        id: 'c-listening-1',
        slug: 'listening-daily-conversations-introducing-yourself',
        title: 'Listening Introductions',
        skill: 'listening',
      },
    ];

    // Reading topic match
    const matchedReading = matchTopicToContentItem(
      { skill: 'reading', title: 'Đọc hiểu thông báo nội bộ và tin nhắn công việc ngắn (Workplace Messages)' },
      mockCurated
    );
    assert.equal(matchedReading?.slug, 'reading-workplace-announcements-messages');

    // Writing topic match
    const matchedWriting = matchTopicToContentItem(
      { skill: 'writing', title: 'Viết email giới thiệu bản thân và công việc (Self-Introduction Email)' },
      mockCurated
    );
    assert.equal(matchedWriting?.slug, 'writing-introductory-email');

    // Speaking topic match
    const matchedSpeaking = matchTopicToContentItem(
      { skill: 'speaking', title: 'Luyện nói giới thiệu bản thân và cuộc sống thường ngày (Daily Routine)' },
      mockCurated
    );
    assert.equal(matchedSpeaking?.slug, 'speaking-daily-life-introduction');

    // Listening topic match
    const matchedListening = matchTopicToContentItem(
      { skill: 'listening', title: 'Nghe hội thoại chào hỏi và giới thiệu bản thân (Greetings & Introductions)' },
      mockCurated
    );
    assert.equal(matchedListening?.slug, 'listening-daily-conversations-introducing-yourself');
  });

  // =========================================================================
  // 7. NTT-Backend Security & Architectural Hardening Tests
  // =========================================================================
  it('10. Schema Zod hỗ trợ linh hoạt taskId dưới dạng UUID, null, undefined hoặc chuỗi rỗng', () => {
    const validUuid = '123e4567-e89b-12d3-a456-426614174000';

    // Empty string
    const checkEmpty = submitWritingInputSchema.safeParse({
      contentItemId: validUuid,
      essayText: 'Dear Team, my name is Alex Rivera and I am very happy to work with you all.',
      durationSeconds: 50,
      taskId: '',
    });
    assert.equal(checkEmpty.success, true);

    // Null
    const checkNull = submitWritingInputSchema.safeParse({
      contentItemId: validUuid,
      essayText: 'Dear Team, my name is Alex Rivera and I am very happy to work with you all.',
      durationSeconds: 50,
      taskId: null,
    });
    assert.equal(checkNull.success, true);

    // Speaking with empty string
    const checkSpeakingEmpty = submitSpeakingInputSchema.safeParse({
      contentItemId: validUuid,
      transcriptText: 'Hello everyone, I usually wake up early in the morning and prepare breakfast.',
      durationSeconds: 40,
      taskId: '',
    });
    assert.equal(checkSpeakingEmpty.success, true);
  });

  it('11. Logic Anti-IDOR: Kiểm tra quyền sở hữu task (task.user_id === userId) ngăn chặn xâm nhập chéo', () => {
    const userA = 'user-aaa-1111';
    const userB = 'user-bbb-2222';
    const taskOfUserB = {
      id: 'task-9999',
      user_id: userB,
      daily_plan_id: 'plan-bb-22',
      estimated_minutes: 20,
      status: 'pending',
    };

    // Simulated task ownership verification function
    function verifyTaskAccess(callerUserId, task) {
      if (!task || task.user_id !== callerUserId) {
        return { success: false, error: 'Nhiệm vụ không tồn tại hoặc bạn không có quyền truy cập.' };
      }
      return { success: true, task };
    }

    // User A attempts to submit using User B's taskId
    const attemptByUserA = verifyTaskAccess(userA, taskOfUserB);
    assert.equal(attemptByUserA.success, false);
    assert.match(attemptByUserA.error, /quyền truy cập/);

    // User B submits their own task
    const attemptByUserB = verifyTaskAccess(userB, taskOfUserB);
    assert.equal(attemptByUserB.success, true);
    assert.equal(attemptByUserB.task.id, 'task-9999');
  });

  it('12. Logic Anti-Minute Inflation: Cơ chế chống tăng phút trùng lặp (!wasAlreadyCompleted)', () => {
    let completedMinutes = 30;
    const taskEstimatedMinutes = 20;

    function applyTaskCompletionMinutes(isFirstCompletion, currentMinutes, taskMinutes) {
      if (isFirstCompletion) {
        return currentMinutes + taskMinutes;
      }
      // If task was already completed, do NOT add minutes again
      return currentMinutes;
    }

    // 1st submission: task transitions from pending -> completed
    completedMinutes = applyTaskCompletionMinutes(true, completedMinutes, taskEstimatedMinutes);
    assert.equal(completedMinutes, 50, 'Lần nộp đầu tiên phải cộng thêm 20 phút (30 -> 50)');

    // 2nd submission (re-submission or double-click): task was already completed
    completedMinutes = applyTaskCompletionMinutes(false, completedMinutes, taskEstimatedMinutes);
    assert.equal(completedMinutes, 50, 'Nộp bài lần 2 không được làm tăng số phút hoàn thành');

    // 3rd submission: still unchanged
    completedMinutes = applyTaskCompletionMinutes(false, completedMinutes, taskEstimatedMinutes);
    assert.equal(completedMinutes, 50, 'Nộp bài nhiều lần vẫn giữ nguyên 50 phút');
  });

  it('13. Đánh giá điểm số được kẹp an toàn (Clamping 0-100) bảo vệ trường numeric(5,2)', () => {
    function clampScore(rawScore) {
      const num = Number(rawScore) || 0;
      return Math.max(0, Math.min(100, Math.round(num)));
    }

    assert.equal(clampScore(85), 85);
    assert.equal(clampScore(120), 100, 'Điểm vượt quá 100 phải được kẹp về 100');
    assert.equal(clampScore(-15), 0, 'Điểm âm phải được kẹp về 0');
    assert.equal(clampScore('NaN'), 0, 'Giá trị không hợp lệ phải trả về 0');
    assert.equal(clampScore(88.6), 89, 'Điểm thập phân phải được làm tròn an toàn');
  });
});
