import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  getLocalDateString,
  getYesterdayDateString,
  computeStreakUpdate,
  resolveStreakDisplay,
} from '../../src/modules/streak/calculator.js';
import {
  getUserStreak,
  recordStudyActivity,
  inMemoryStreaks,
} from '../../src/modules/streak/services.js';

describe('Learning Streak Engine & Timezone Lifecycle Suite', () => {
  beforeEach(() => {
    inMemoryStreaks.clear();
  });

  it('1. Tính toán ngày địa phương (getLocalDateString) và ngày hôm qua (getYesterdayDateString) chính xác', () => {
    // Test known UTC instant: 2026-10-20T18:00:00Z -> 2026-10-21 01:00 in Vietnam (+7)
    const dateUtc = new Date('2026-10-20T18:00:00Z');
    const localDate = getLocalDateString(dateUtc, 'Asia/Ho_Chi_Minh');
    assert.equal(localDate, '2026-10-21');

    // Test yesterday calculation
    assert.equal(getYesterdayDateString('2026-10-21'), '2026-10-20');
    assert.equal(getYesterdayDateString('2026-10-01'), '2026-09-30');
    assert.equal(getYesterdayDateString('2024-03-01'), '2024-02-29'); // Leap year
    assert.equal(getYesterdayDateString('2026-01-01'), '2025-12-31'); // Year boundary
  });

  it('2. Khởi tạo chuỗi học lần đầu tiên (First study session starts streak at 1)', () => {
    const res = computeStreakUpdate(0, 0, null, '2026-10-20');
    assert.equal(res.newStreak, 1);
    assert.equal(res.longestStreak, 1);
    assert.equal(res.lastStudyDate, '2026-10-20');
    assert.equal(res.isExtended, true);
    assert.equal(res.isAlreadyStudiedToday, false);
  });

  it('3. Học tiếp trong cùng một ngày không làm tăng trùng chuỗi (Idempotent same-day study)', () => {
    const res = computeStreakUpdate(3, 5, '2026-10-20', '2026-10-20');
    assert.equal(res.newStreak, 3);
    assert.equal(res.longestStreak, 5);
    assert.equal(res.lastStudyDate, '2026-10-20');
    assert.equal(res.isExtended, false);
    assert.equal(res.isAlreadyStudiedToday, true);
  });

  it('4. Học vào ngày kế tiếp liên tục (Consecutive day extends streak and longest record)', () => {
    // Streak 2 -> 3
    const res = computeStreakUpdate(2, 2, '2026-10-19', '2026-10-20');
    assert.equal(res.newStreak, 3);
    assert.equal(res.longestStreak, 3);
    assert.equal(res.lastStudyDate, '2026-10-20');
    assert.equal(res.isExtended, true);
    assert.equal(res.isAlreadyStudiedToday, false);

    // Over boundary of months
    const monthCross = computeStreakUpdate(5, 10, '2026-09-30', '2026-10-01');
    assert.equal(monthCross.newStreak, 6);
    assert.equal(monthCross.longestStreak, 10);
    assert.equal(monthCross.lastStudyDate, '2026-10-01');
    assert.equal(monthCross.isExtended, true);
  });

  it('5. Bỏ lỡ một hoặc nhiều ngày làm đứt chuỗi (Broken streak resets to 1, preserves longest)', () => {
    // Missed 2 days (last studied on Oct 17, today is Oct 20)
    const res = computeStreakUpdate(7, 14, '2026-10-17', '2026-10-20');
    assert.equal(res.newStreak, 1);
    assert.equal(res.longestStreak, 14); // Preserves peak performance
    assert.equal(res.lastStudyDate, '2026-10-20');
    assert.equal(res.isExtended, true);
    assert.equal(res.isAlreadyStudiedToday, false);
  });

  it('6. Phân giải trạng thái hiển thị Streak (resolveStreakDisplay) chính xác theo thời điểm trong ngày', () => {
    const today = '2026-10-20';

    // A. Not started
    const notStarted = resolveStreakDisplay(0, 0, null, today);
    assert.equal(notStarted.streakStatus, 'not_started');
    assert.equal(notStarted.currentStreak, 0);
    assert.equal(notStarted.hasStudiedToday, false);

    // B. Active today (completed an activity today)
    const activeToday = resolveStreakDisplay(4, 7, '2026-10-20', today);
    assert.equal(activeToday.streakStatus, 'active_today');
    assert.equal(activeToday.currentStreak, 4);
    assert.equal(activeToday.hasStudiedToday, true);

    // C. At risk (studied yesterday, but hasn't studied today yet)
    const atRisk = resolveStreakDisplay(4, 7, '2026-10-19', today);
    assert.equal(atRisk.streakStatus, 'at_risk');
    assert.equal(atRisk.currentStreak, 4); // Still shows 4 days alive
    assert.equal(atRisk.hasStudiedToday, false);

    // D. Broken (missed yesterday)
    const broken = resolveStreakDisplay(4, 7, '2026-10-18', today);
    assert.equal(broken.streakStatus, 'broken');
    assert.equal(broken.currentStreak, 0); // Shows 0 because yesterday was missed
    assert.equal(broken.longestStreak, 7);
    assert.equal(broken.hasStudiedToday, false);
  });

  it('7. Dịch vụ recordStudyActivity & getUserStreak tích hợp trơn tru và cô lập theo người dùng', async () => {
    const userA = 'user-streak-test-a';
    const userB = 'user-streak-test-b';

    // Day 1: User A completes practice
    const day1 = new Date('2026-10-20T10:00:00Z');
    const updateA1 = await recordStudyActivity(userA, 'practice', day1);
    assert.equal(updateA1.newStreak, 1);
    assert.equal(updateA1.isExtended, true);

    // Day 1 later: User A reviews vocabulary on the same day
    const day1Later = new Date('2026-10-20T15:00:00Z');
    const updateA2 = await recordStudyActivity(userA, 'vocabulary_review', day1Later);
    assert.equal(updateA2.newStreak, 1);
    assert.equal(updateA2.isAlreadyStudiedToday, true);

    // User B has not studied yet
    const streakB = await getUserStreak(userB);
    assert.equal(streakB.currentStreak, 0);
    assert.equal(streakB.streakStatus, 'not_started');

    // Day 2: User A practices again
    const day2 = new Date('2026-10-21T09:00:00Z');
    const updateA3 = await recordStudyActivity(userA, 'practice', day2);
    assert.equal(updateA3.newStreak, 2);
    assert.equal(updateA3.longestStreak, 2);
  });
});
