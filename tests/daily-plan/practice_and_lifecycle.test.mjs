import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

describe('Phase 4 — Practice Scoring & Daily Task Lifecycle Engine', () => {
  // Mock questions and server-only answer keys
  const mockExercises = [
    {
      id: 'ex-1',
      prompt: 'My alarm rings at 6:30 AM, but I usually ________ before that.',
      weight: 1.0,
      position: 1,
      options: [
        { id: 'opt_1a', text: 'wake up' },
        { id: 'opt_1b', text: 'commute' },
      ],
    },
    {
      id: 'ex-2',
      prompt: 'It takes me 45 minutes to ________ to downtown every morning.',
      weight: 1.0,
      position: 2,
      options: [
        { id: 'opt_2a', text: 'prepare' },
        { id: 'opt_2b', text: 'commute' },
      ],
    },
    {
      id: 'ex-3',
      prompt: 'Sarah likes to ________ on the sofa with a warm cup of tea.',
      weight: 1.0,
      position: 3,
      options: [
        { id: 'opt_3a', text: 'wake up' },
        { id: 'opt_3c', text: 'relax' },
      ],
    },
  ];

  const mockServerAnswers = new Map([
    ['ex-1', { correct_option_id: 'opt_1a', explanation: 'wake up nghĩa là thức giấc.' }],
    ['ex-2', { correct_option_id: 'opt_2b', explanation: 'commute là đi lại làm việc.' }],
    ['ex-3', { correct_option_id: 'opt_3c', explanation: 'relax là thư giãn.' }],
  ]);

  /**
   * Pure evaluation function replicating the server-side scoring logic in services.ts
   */
  function evaluatePractice(exercises, serverAnswers, userAnswers) {
    const userMap = new Map();
    for (const a of userAnswers) {
      if (a.exercise_id && a.selected_option_id) {
        userMap.set(a.exercise_id, a.selected_option_id.trim().toLowerCase());
      }
    }

    let totalScore = 0;
    let maxScore = 0;
    const breakdown = [];

    for (const ex of exercises) {
      const weight = ex.weight || 1.0;
      maxScore += weight;

      const key = serverAnswers.get(ex.id);
      const userAns = userMap.get(ex.id) || '';
      const correctAns = (key?.correct_option_id || '').toLowerCase();

      const isCorrect = Boolean(userAns) && Boolean(correctAns) && userAns === correctAns;
      if (isCorrect) {
        totalScore += weight;
      }

      const optList = ex.options || [];
      const userOpt = optList.find((o) => o.id.toLowerCase() === userAns);
      const correctOpt = optList.find((o) => o.id.toLowerCase() === correctAns);

      breakdown.push({
        exercise_id: ex.id,
        prompt: ex.prompt,
        user_answer: userOpt ? userOpt.text : userAns,
        correct_answer: correctOpt ? correctOpt.text : (key?.correct_option_id || ''),
        user_option_id: userAns,
        correct_option_id: key?.correct_option_id || '',
        is_correct: isCorrect,
        explanation: key?.explanation || '',
      });
    }

    const accuracy = maxScore > 0 ? Number((totalScore / maxScore).toFixed(4)) : 0;
    const percentage = Math.round(accuracy * 100);

    return { totalScore, maxScore, accuracy, percentage, breakdown };
  }

  it('1. Chấm điểm bài tập chính xác 100% khi đúng toàn bộ', () => {
    const userAnswers = [
      { exercise_id: 'ex-1', selected_option_id: 'opt_1a' },
      { exercise_id: 'ex-2', selected_option_id: 'opt_2b' },
      { exercise_id: 'ex-3', selected_option_id: 'opt_3c' },
    ];

    const result = evaluatePractice(mockExercises, mockServerAnswers, userAnswers);

    assert.equal(result.totalScore, 3.0);
    assert.equal(result.maxScore, 3.0);
    assert.equal(result.accuracy, 1.0);
    assert.equal(result.percentage, 100);
    assert.equal(result.breakdown.every((b) => b.is_correct), true);
  });

  it('2. Tính điểm chính xác khi có câu trả lời sai và cung cấp giải thích chi tiết', () => {
    const userAnswers = [
      { exercise_id: 'ex-1', selected_option_id: 'opt_1a' }, // Đúng
      { exercise_id: 'ex-2', selected_option_id: 'wrong_opt' }, // Sai
      { exercise_id: 'ex-3', selected_option_id: 'opt_3c' }, // Đúng
    ];

    const result = evaluatePractice(mockExercises, mockServerAnswers, userAnswers);

    assert.equal(result.totalScore, 2.0);
    assert.equal(result.maxScore, 3.0);
    assert.equal(result.percentage, 67);

    assert.equal(result.breakdown[1].is_correct, false);
    assert.equal(result.breakdown[1].correct_answer, 'commute');
    assert.equal(result.breakdown[1].correct_option_id, 'opt_2b');
    assert.match(result.breakdown[1].explanation, /commute là đi lại làm việc/);
  });

  it('3. Xử lý câu chưa trả lời hoặc nộp mảng rỗng mà không bị crash', () => {
    const userAnswers = [
      { exercise_id: 'ex-1', selected_option_id: 'opt_1a' },
      // ex-2 và ex-3 bị bỏ trống
    ];

    const result = evaluatePractice(mockExercises, mockServerAnswers, userAnswers);

    assert.equal(result.totalScore, 1.0);
    assert.equal(result.maxScore, 3.0);
    assert.equal(result.accuracy, 0.3333);
    assert.equal(result.breakdown[1].is_correct, false);
    assert.equal(result.breakdown[2].is_correct, false);
  });

  it('4. Không phân biệt chữ hoa / chữ thường khi so khớp ID đáp án', () => {
    const userAnswers = [
      { exercise_id: 'ex-1', selected_option_id: 'OPT_1A' },
      { exercise_id: 'ex-2', selected_option_id: 'Opt_2B' },
      { exercise_id: 'ex-3', selected_option_id: '  opt_3c  ' }, // Có khoảng trắng
    ];

    const result = evaluatePractice(mockExercises, mockServerAnswers, userAnswers);

    assert.equal(result.totalScore, 3.0);
    assert.equal(result.accuracy, 1.0);
  });

  describe('Validation sắp xếp lại nhiệm vụ (Task Reordering Validation)', () => {
    const existingTaskIds = ['task-a', 'task-b', 'task-c'];

    function validateReorder(reorderedIds) {
      if (!reorderedIds || reorderedIds.length === 0) {
        return { valid: false, error: 'Danh sách thứ tự không được để trống.' };
      }
      const unique = new Set(reorderedIds);
      if (unique.size !== reorderedIds.length) {
        return { valid: false, error: 'Danh sách ID nhiệm vụ bị trùng lặp.' };
      }
      if (reorderedIds.length !== existingTaskIds.length) {
        return { valid: false, error: 'Danh sách phải bao gồm đầy đủ toàn bộ nhiệm vụ.' };
      }
      for (const id of reorderedIds) {
        if (!existingTaskIds.includes(id)) {
          return { valid: false, error: 'Phát hiện nhiệm vụ không thuộc kế hoạch này.' };
        }
      }
      return { valid: true };
    }

    it('Cho phép hoán đổi vị trí hợp lệ', () => {
      const res = validateReorder(['task-c', 'task-a', 'task-b']);
      assert.equal(res.valid, true);
    });

    it('Từ chối danh sách chứa ID trùng lặp', () => {
      const res = validateReorder(['task-a', 'task-b', 'task-a']);
      assert.equal(res.valid, false);
      assert.match(res.error, /trùng lặp/);
    });

    it('Từ chối danh sách thiếu nhiệm vụ (omitted task)', () => {
      const res = validateReorder(['task-a', 'task-b']);
      assert.equal(res.valid, false);
      assert.match(res.error, /đầy đủ/);
    });

    it('Từ chối danh sách chứa ID lạ không thuộc kế hoạch', () => {
      const res = validateReorder(['task-a', 'task-b', 'task-stranger']);
      assert.equal(res.valid, false);
      assert.match(res.error, /không thuộc kế hoạch/);
    });
  });

  describe('Cập nhật trạng thái kế hoạch tổng thể (Plan Status Recalculation)', () => {
    function computePlanStatus(taskStatuses) {
      if (!taskStatuses || taskStatuses.length === 0) return 'planned';
      const allCompleted = taskStatuses.every((s) => s === 'completed');
      const allDoneOrSkipped = taskStatuses.every((s) => s === 'completed' || s === 'skipped');
      const someDone = taskStatuses.some(
        (s) => s === 'completed' || s === 'in_progress' || s === 'skipped'
      );

      if (allCompleted) return 'completed';
      if (allDoneOrSkipped) return 'partially_completed';
      if (someDone) return 'in_progress';
      return 'planned';
    }

    it('Chuyển sang "completed" khi toàn bộ nhiệm vụ đã hoàn thành', () => {
      assert.equal(computePlanStatus(['completed', 'completed', 'completed']), 'completed');
    });

    it('Chuyển sang "partially_completed" khi một số hoàn thành và phần còn lại bị bỏ qua', () => {
      assert.equal(computePlanStatus(['completed', 'skipped', 'completed']), 'partially_completed');
    });

    it('Chuyển sang "in_progress" khi đang làm dở một số nhiệm vụ', () => {
      assert.equal(computePlanStatus(['completed', 'pending', 'pending']), 'in_progress');
    });

    it('Giữ "planned" khi toàn bộ nhiệm vụ còn pending', () => {
      assert.equal(computePlanStatus(['pending', 'pending']), 'planned');
    });
  });
});
