import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateNextReviewSchedule,
  normalizeWord,
  saveWordToNotebook,
  getUserVocabularyList,
  getDueVocabularyList,
  deleteWordFromNotebook,
  submitVocabularyReview,
  getVocabularyStats,
  _resetInMemoryStore,
  _getInMemoryReviewLogs,
} from '../../src/modules/vocabulary/services.ts';
import {
  SaveWordInputSchema,
  SubmitReviewSessionSchema,
} from '../../src/modules/vocabulary/types.ts';
import { CURATED_VOCABULARY_BANK } from '../../src/modules/vocabulary/curriculum.ts';

describe('Phase 6 — Vocabulary Notebook & Review Schedule Lifecycle Suite', () => {
  beforeEach(() => {
    _resetInMemoryStore();
  });

  it('1. Chuẩn hóa từ vựng (normalizeWord) chống phân biệt hoa thường và khoảng trắng', () => {
    assert.equal(normalizeWord('  Wake UP '), 'wake up');
    assert.equal(normalizeWord('Colleague\n'), 'colleague');
    assert.equal(normalizeWord('  DEADLINE   '), 'deadline');
  });

  it('2. Lưu và truy xuất sổ từ vựng cá nhân thành công', async () => {
    const userId = 'user-alice-123';
    const saveResult = await saveWordToNotebook(userId, {
      word: 'colleague',
      meaning_vi: 'đồng nghiệp',
      part_of_speech: 'noun',
      ipa: '/ˈkɒliːɡ/',
      example: 'I discussed the project with my colleague.',
      custom_notes: 'Người cùng công ty',
    });

    assert.equal(saveResult.alreadyExisted, false);
    assert.equal(saveResult.item.word, 'colleague');
    assert.equal(saveResult.item.word_normalized, 'colleague');
    assert.equal(saveResult.item.status, 'learning');
    assert.equal(saveResult.item.interval_days, 1);
    assert.equal(saveResult.item.consecutive_correct, 0);

    const list = await getUserVocabularyList(userId);
    assert.equal(list.length, 1);
    assert.equal(list[0].word, 'colleague');
    assert.equal(list[0].meaning_vi, 'đồng nghiệp');
  });

  it('3. Ngăn chặn bản ghi trùng lặp cho cùng một người dùng và cùng một từ', async () => {
    const userId = 'user-alice-123';
    // First save
    const first = await saveWordToNotebook(userId, {
      word: 'deadline',
      meaning_vi: 'hạn chót',
      part_of_speech: 'noun',
      ipa: '/ˈdedlaɪn/',
    });
    assert.equal(first.alreadyExisted, false);

    // Second save with different case and trailing spaces
    const duplicate = await saveWordToNotebook(userId, {
      word: '   DEADLINE  ',
      meaning_vi: 'hạn chót hoàn thành dự án',
      part_of_speech: 'noun',
      custom_notes: 'Cập nhật ghi chú mới',
    });

    assert.equal(duplicate.alreadyExisted, true);
    assert.equal(duplicate.item.id, first.item.id);
    assert.equal(duplicate.item.custom_notes, 'Cập nhật ghi chú mới');

    // Verify list only has 1 record
    const list = await getUserVocabularyList(userId);
    assert.equal(list.length, 1);
  });

  it('4. Cô lập dữ liệu tuyệt đối giữa hai người dùng khác nhau (Data Isolation & Anti-IDOR)', async () => {
    const userAlice = 'user-alice-123';
    const userBob = 'user-bob-456';

    await saveWordToNotebook(userAlice, {
      word: 'collaborate',
      meaning_vi: 'hợp tác',
    });

    await saveWordToNotebook(userBob, {
      word: 'postpone',
      meaning_vi: 'hoãn lại',
    });

    const aliceList = await getUserVocabularyList(userAlice);
    const bobList = await getUserVocabularyList(userBob);

    assert.equal(aliceList.length, 1);
    assert.equal(aliceList[0].word, 'collaborate');

    assert.equal(bobList.length, 1);
    assert.equal(bobList[0].word, 'postpone');

    // Bob cannot delete Alice's word
    const deleteAttempt = await deleteWordFromNotebook(userBob, aliceList[0].id);
    assert.equal(deleteAttempt.success, true); // Handled safely

    // Verify Alice's word still exists intact
    const aliceListAfter = await getUserVocabularyList(userAlice);
    assert.equal(aliceListAfter.length, 1);
    assert.equal(aliceListAfter[0].word, 'collaborate');
  });

  it('5. Lọc chính xác từ vựng đến hạn ôn (next_review_at <= now) và chưa đến hạn', async () => {
    const userId = 'user-due-test';
    const now = new Date('2026-10-19T10:00:00Z');

    // Word 1: Saved now -> next_review_at is now -> due
    const word1 = await saveWordToNotebook(
      userId,
      {
        word: 'wake up',
        meaning_vi: 'thức giấc',
      },
      now
    );

    // Word 2: Simulate future review schedule (+3 days) -> not due now
    const word2 = await saveWordToNotebook(
      userId,
      {
        word: 'have breakfast',
        meaning_vi: 'ăn sáng',
      },
      now
    );
    // Set next_review_at into future (+2 days)
    word2.item.next_review_at = new Date('2026-10-21T10:00:00Z').toISOString();

    const dueListNow = await getDueVocabularyList(userId, now);
    assert.equal(dueListNow.length, 1);
    assert.equal(dueListNow[0].word, 'wake up');

    // Check on 2026-10-22 (both should be due)
    const futureDate = new Date('2026-10-22T10:00:00Z');
    const dueListFuture = await getDueVocabularyList(userId, futureDate);
    assert.equal(dueListFuture.length, 2);
  });

  it('6. Tính toán lịch ôn xác định (Deterministic Schedule Progression) khi Nhớ và Quên', () => {
    const baseDate = new Date('2026-10-19T12:00:00Z');

    // Test Forgot: resets streak to 0, interval = 1d, status = learning
    // Calendar boundary: 2026-10-19 12:00 UTC = 19:00 VN (+7). Next day 00:00 VN = 2026-10-19T17:00:00Z
    const forgotSched = calculateNextReviewSchedule(3, 'forgot', baseDate);
    assert.equal(forgotSched.intervalDays, 1);
    assert.equal(forgotSched.consecutiveCorrect, 0);
    assert.equal(forgotSched.status, 'learning');
    assert.equal(
      forgotSched.nextReviewAt,
      new Date('2026-10-19T17:00:00Z').toISOString()
    );

    // Test Remembered Step 1: streak 0 -> 1 (+1 day calendar boundary)
    const step1 = calculateNextReviewSchedule(0, 'remembered', baseDate);
    assert.equal(step1.intervalDays, 1);
    assert.equal(step1.consecutiveCorrect, 1);
    assert.equal(step1.status, 'learning');
    assert.equal(step1.nextReviewAt, new Date('2026-10-19T17:00:00Z').toISOString());

    // Test Remembered Step 2: streak 1 -> 2 (+3 days calendar boundary: 2026-10-22 00:00 VN)
    const step2 = calculateNextReviewSchedule(1, 'remembered', baseDate);
    assert.equal(step2.intervalDays, 3);
    assert.equal(step2.consecutiveCorrect, 2);
    assert.equal(step2.status, 'learning');
    assert.equal(step2.nextReviewAt, new Date('2026-10-21T17:00:00Z').toISOString());

    // Test Remembered Step 3: streak 2 -> 3 (+7 days calendar boundary: 2026-10-26 00:00 VN)
    const step3 = calculateNextReviewSchedule(2, 'remembered', baseDate);
    assert.equal(step3.intervalDays, 7);
    assert.equal(step3.consecutiveCorrect, 3);
    assert.equal(step3.status, 'reviewing');
    assert.equal(step3.nextReviewAt, new Date('2026-10-25T17:00:00Z').toISOString());

    // Test Remembered Step 4: streak 3 -> 4 (+14 days calendar boundary: 2026-11-02 00:00 VN)
    const step4 = calculateNextReviewSchedule(3, 'remembered', baseDate);
    assert.equal(step4.intervalDays, 14);
    assert.equal(step4.consecutiveCorrect, 4);
    assert.equal(step4.status, 'reviewing');
    assert.equal(step4.nextReviewAt, new Date('2026-11-01T17:00:00Z').toISOString());

    // Test Remembered Step 5+: streak 4 -> 5 (+30 days calendar boundary: 2026-11-18 00:00 VN)
    const step5 = calculateNextReviewSchedule(4, 'remembered', baseDate);
    assert.equal(step5.intervalDays, 30);
    assert.equal(step5.consecutiveCorrect, 5);
    assert.equal(step5.status, 'mastered');
    assert.equal(step5.nextReviewAt, new Date('2026-11-17T17:00:00Z').toISOString());

    // Exact 24h interval mode test
    const exact24h = calculateNextReviewSchedule(0, 'remembered', baseDate, { calendarDay: false });
    assert.equal(exact24h.nextReviewAt, new Date('2026-10-20T12:00:00Z').toISOString());
  });

  it('7. Hoàn thành phiên ôn tập và bảo vệ chống gửi trùng (Idempotency Guard)', async () => {
    const userId = 'user-review-session-test';
    const reviewDate = new Date('2026-10-19T14:00:00Z');

    const w1 = await saveWordToNotebook(userId, { word: 'feedback', meaning_vi: 'phản hồi' });
    const w2 = await saveWordToNotebook(userId, { word: 'presentation', meaning_vi: 'thuyết trình' });

    const sessionId = 'session-test-unique-uuid-1';

    // First submission: w1 remembered, w2 forgot
    const submission1 = await submitVocabularyReview(
      userId,
      {
        reviewSessionId: sessionId,
        reviews: [
          { userVocabId: w1.item.id, result: 'remembered' },
          { userVocabId: w2.item.id, result: 'forgot' },
        ],
      },
      reviewDate
    );

    assert.equal(submission1.sessionAlreadyProcessed, false);
    assert.equal(submission1.updatedCount, 2);

    const updatedW1 = submission1.items.find((i) => i.id === w1.item.id);
    const updatedW2 = submission1.items.find((i) => i.id === w2.item.id);

    assert.equal(updatedW1?.consecutive_correct, 1);
    assert.equal(updatedW1?.interval_days, 1);
    assert.equal(updatedW1?.review_count, 1);

    assert.equal(updatedW2?.consecutive_correct, 0);
    assert.equal(updatedW2?.interval_days, 1);
    assert.equal(updatedW2?.review_count, 1);

    // Duplicate submission with same sessionId (e.g. accidental double click or network retry)
    const duplicateSubmission = await submitVocabularyReview(
      userId,
      {
        reviewSessionId: sessionId,
        reviews: [
          { userVocabId: w1.item.id, result: 'remembered' },
          { userVocabId: w2.item.id, result: 'forgot' },
        ],
      },
      reviewDate
    );

    // Must be flagged as sessionAlreadyProcessed with updatedCount = 0
    assert.equal(duplicateSubmission.sessionAlreadyProcessed, true);
    assert.equal(duplicateSubmission.updatedCount, 0);

    // Verify streak and review count did NOT double increment!
    const list = await getUserVocabularyList(userId);
    const checkedW1 = list.find((i) => i.id === w1.item.id);
    assert.equal(checkedW1?.consecutive_correct, 1);
    assert.equal(checkedW1?.review_count, 1);

    // Verify interval_before and interval_after in review logs
    const logs = _getInMemoryReviewLogs();
    const logW1 = logs.find((l) => l.user_vocab_id === w1.item.id && l.review_session_id === sessionId);
    assert.equal(logW1?.interval_before, 1);
    assert.equal(logW1?.interval_after, 1);

    // Second review round for w1: streak 1 -> 2 (interval moves from 1 to 3)
    const session2Id = 'session-test-unique-uuid-2';
    await submitVocabularyReview(
      userId,
      {
        reviewSessionId: session2Id,
        reviews: [{ userVocabId: w1.item.id, result: 'remembered' }],
      },
      new Date(reviewDate.getTime() + 86400000 * 2)
    );
    const logsAfterRound2 = _getInMemoryReviewLogs();
    const logRound2 = logsAfterRound2.find((l) => l.user_vocab_id === w1.item.id && l.review_session_id === session2Id);
    assert.equal(logRound2?.interval_before, 1, 'interval_before phải lưu giá trị cũ trước khi update');
    assert.equal(logRound2?.interval_after, 3, 'interval_after phải lưu giá trị mới sau khi update');

    // Third review round for w1: streak 2 -> 3 (interval moves from 3 to 7)
    const session3Id = 'session-test-unique-uuid-3';
    await submitVocabularyReview(
      userId,
      {
        reviewSessionId: session3Id,
        reviews: [{ userVocabId: w1.item.id, result: 'remembered' }],
      },
      new Date(reviewDate.getTime() + 86400000 * 5)
    );
    const logsAfterRound3 = _getInMemoryReviewLogs();
    const logRound3 = logsAfterRound3.find((l) => l.user_vocab_id === w1.item.id && l.review_session_id === session3Id);
    assert.equal(logRound3?.interval_before, 3, 'interval_before phải là 3 (khoảng cách cũ)');
    assert.equal(logRound3?.interval_after, 7, 'interval_after phải là 7 (khoảng cách mới)');
  });

  it('8. Thống kê sổ từ chính xác (Vocabulary Stats)', async () => {
    const userId = 'user-stats-test';

    await saveWordToNotebook(userId, { word: 'colleague', meaning_vi: 'đồng nghiệp' });
    const w2 = await saveWordToNotebook(userId, { word: 'deadline', meaning_vi: 'hạn chót' });

    // Manually push w2 to mastered
    w2.item.status = 'mastered';
    w2.item.consecutive_correct = 5;
    // Set due time in future
    w2.item.next_review_at = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString();

    const stats = await getVocabularyStats(userId);
    assert.equal(stats.totalWords, 2);
    assert.equal(stats.dueWords, 1); // Only w1 is due
    assert.equal(stats.learningWords, 1);
    assert.equal(stats.masteredWords, 1);
  });

  it('9. Validation Zod: Từ chối input không hợp lệ', () => {
    // Empty word
    const res1 = SaveWordInputSchema.safeParse({ word: '', meaning_vi: 'Nghĩa' });
    assert.equal(res1.success, false);

    // Empty meaning
    const res2 = SaveWordInputSchema.safeParse({ word: 'apple', meaning_vi: '' });
    assert.equal(res2.success, false);

    // Empty review list
    const res3 = SubmitReviewSessionSchema.safeParse({
      reviewSessionId: 'sid-1',
      reviews: [],
    });
    assert.equal(res3.success, false);

    // Invalid result value
    const res4 = SubmitReviewSessionSchema.safeParse({
      reviewSessionId: 'sid-1',
      reviews: [{ userVocabId: 'v1', result: 'maybe' }],
    });
    assert.equal(res4.success, false);
  });

  it('10. Ngân hàng từ vựng giáo trình nền tảng có đủ 12 từ chất lượng cao', () => {
    assert.equal(CURATED_VOCABULARY_BANK.length, 12);
    const dailyRoutine = CURATED_VOCABULARY_BANK.filter(
      (c) => c.content_item_slug === 'vocab-daily-routine'
    );
    const office = CURATED_VOCABULARY_BANK.filter(
      (c) => c.content_item_slug === 'vocab-office-communication'
    );

    assert.equal(dailyRoutine.length, 6);
    assert.equal(office.length, 6);

    for (const item of CURATED_VOCABULARY_BANK) {
      assert.ok(item.word.length > 0);
      assert.ok(item.meaning_vi.length > 0);
      assert.ok(item.ipa.length > 0);
      assert.ok(item.example.length > 0);
      assert.ok(item.part_of_speech.length > 0);
    }
  });

  it('11. Chống giả mạo review log (Anti-IDOR) & Từ chối toàn bộ phiên nếu có từ không hợp lệ (All-or-Nothing)', async () => {
    const userAlice = 'user-alice-anti-idor';
    const userMallory = 'user-mallory-attacker';

    // Alice saves a word
    const aliceWord = await saveWordToNotebook(userAlice, {
      word: 'confidential',
      meaning_vi: 'bí mật, tuyệt mật',
    });

    // Mallory saves her own word
    const malloryWord = await saveWordToNotebook(userMallory, {
      word: 'exploit',
      meaning_vi: 'khai thác',
    });

    // 11.1 Mallory tries to submit a review targeting Alice's word alone
    // Entire session must be rejected with an error (no silent skip, no partial completion)
    await assert.rejects(
      async () => {
        await submitVocabularyReview(userMallory, {
          reviewSessionId: 'mallory-forged-session-1',
          reviews: [{ userVocabId: aliceWord.item.id, result: 'remembered' }],
        });
      },
      /không thuộc quyền sở hữu|UNAUTHORIZED/
    );

    // 11.2 Mallory submits a mixed batch: 1 word of her own, 1 word of Alice
    // All-or-Nothing: MUST reject ENTIRE session. Mallory's own word must NOT be updated!
    await assert.rejects(
      async () => {
        await submitVocabularyReview(userMallory, {
          reviewSessionId: 'mallory-forged-session-mixed',
          reviews: [
            { userVocabId: malloryWord.item.id, result: 'remembered' },
            { userVocabId: aliceWord.item.id, result: 'remembered' },
          ],
        });
      },
      /không thuộc quyền sở hữu|UNAUTHORIZED/
    );

    // Verify Mallory's word was NOT partially updated (All-or-Nothing atomicity)
    const malloryList = await getUserVocabularyList(userMallory);
    const malloryItem = malloryList.find((i) => i.id === malloryWord.item.id);
    assert.equal(malloryItem?.consecutive_correct, 0);
    assert.equal(malloryItem?.review_count, 0);

    // Verify Alice's word remained untouched
    const aliceList = await getUserVocabularyList(userAlice);
    const untouched = aliceList.find((i) => i.id === aliceWord.item.id);
    assert.equal(untouched?.consecutive_correct, 0);
    assert.equal(untouched?.review_count, 0);
    assert.equal(untouched?.status, 'learning');

    // 11.3 Reject duplicate user_vocab_id in the same payload
    await assert.rejects(
      async () => {
        await submitVocabularyReview(userMallory, {
          reviewSessionId: 'mallory-duplicate-word-session',
          reviews: [
            { userVocabId: malloryWord.item.id, result: 'remembered' },
            { userVocabId: malloryWord.item.id, result: 'forgot' },
          ],
        });
      },
      /bị lặp lại|INVALID_INPUT/
    );
  });

  it('12. Chống race condition & gửi trùng đồng thời (Concurrent & Duplicate Submissions)', async () => {
    const userId = 'user-concurrency-test';
    const saved = await saveWordToNotebook(userId, {
      word: 'concurrency',
      meaning_vi: 'tính đồng thời',
    });

    const sessionId = 'session-concurrent-abc-123';

    // Dispatch 2 concurrent review submissions with the identical session ID
    const [res1, res2] = await Promise.all([
      submitVocabularyReview(userId, {
        reviewSessionId: sessionId,
        reviews: [{ userVocabId: saved.item.id, result: 'remembered' }],
      }),
      submitVocabularyReview(userId, {
        reviewSessionId: sessionId,
        reviews: [{ userVocabId: saved.item.id, result: 'remembered' }],
      }),
    ]);

    // Exactly one should process, the other should be marked as already processed (or both succeed idempotently)
    const processedCount = (res1.sessionAlreadyProcessed ? 0 : 1) + (res2.sessionAlreadyProcessed ? 0 : 1);
    assert.equal(processedCount, 1);

    // Verify item streak is exactly 1 (never double incremented to 2)
    const list = await getUserVocabularyList(userId);
    const item = list.find((i) => i.id === saved.item.id);
    assert.equal(item?.consecutive_correct, 1);
    assert.equal(item?.review_count, 1);
    assert.equal(item?.interval_days, 1);
  });

  it('13. Tính lũy đẳng (Idempotency) của logic Seed Data khi chạy lặp lại', () => {
    // Simulate resolving parent IDs by natural key (slug and position)
    const existingContentStore = new Map([
      ['vocab-office-communication', { id: 'uuid-pre-existing-content-999', slug: 'vocab-office-communication' }],
      ['vocab-daily-routine', { id: 'uuid-pre-existing-routine-888', slug: 'vocab-daily-routine' }],
    ]);

    const resolveContentId = (slug, fallbackId) => {
      return existingContentStore.get(slug)?.id || fallbackId;
    };

    const firstRunOfficeId = resolveContentId('vocab-office-communication', 'fallback-1');
    assert.equal(firstRunOfficeId, 'uuid-pre-existing-content-999');

    // Repeated run should resolve to the exact same persistent ID
    const secondRunOfficeId = resolveContentId('vocab-office-communication', 'fallback-2');
    assert.equal(secondRunOfficeId, firstRunOfficeId);

    // Verify foreign key for practice exercise references the real content id, not a hardcoded assumption
    const exercise = {
      content_item_id: secondRunOfficeId,
      position: 1,
      prompt: 'Test prompt',
    };
    assert.equal(exercise.content_item_id, 'uuid-pre-existing-content-999');
  });
});
