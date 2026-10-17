import type { LearnerTutorContext, VerifiedExerciseContext } from './types';

export const TUTOR_EXERCISE_EXPLANATION_VERSION = 'tutor_exercise_explanation_v1';
export const TUTOR_CONCEPT_EXPLANATION_VERSION = 'tutor_concept_query_v1';

export const TUTOR_EXPLANATION_SCHEMA_DESCRIPTION = `
{
  "explanation": "Phân tích vì sao đáp án của học viên đúng hoặc sai và bản chất cốt lõi của câu hỏi (Tiếng Việt)",
  "rule_summary": "Tóm tắt quy tắc ngữ pháp hoặc nghĩa/cách dùng từ vựng cốt lõi cần nhớ (Tiếng Việt kèm công thức nếu có)",
  "examples": [
    "Ví dụ minh họa 1 (Câu tiếng Anh kèm bản dịch tiếng Việt)",
    "Ví dụ minh họa 2 (Câu tiếng Anh kèm bản dịch tiếng Việt)"
  ],
  "next_step_tip": "Gợi ý hành động hoặc bài học học viên nên tập trung ôn tiếp theo (Tiếng Việt)"
}
`.trim();

export function buildExerciseExplanationPrompt(
  learner: Partial<LearnerTutorContext>,
  exercise: VerifiedExerciseContext
): {
  systemPrompt: string;
  prompt: string;
  schemaDescription: string;
  promptVersion: string;
} {
  const level = (learner.level || 'A1').toUpperCase();
  const goalTitle = learner.goalTitle || 'Giao tiếp tổng quát';
  const goalType = learner.goalType || 'daily_communication';

  let levelGuidance = 'Giải thích bằng tiếng Việt giản dị, gần gũi, dịch nghĩa cho mọi cụm từ tiếng Anh.';
  if (level.includes('A1')) {
    levelGuidance =
      'Trình độ học viên là A1 (Người mới bắt đầu). Sử dụng từ ngữ cực kỳ đơn giản, không dùng thuật ngữ ngữ pháp phức tạp. Dịch nghĩa đầy đủ cho các từ vựng.';
  } else if (level.includes('A2')) {
    levelGuidance =
      'Trình độ học viên là A2 (Sơ cấp). Giải thích cấu trúc câu rõ ràng, nêu bật các dấu hiệu nhận biết trong ngữ cảnh.';
  } else if (level.includes('B1') || level.includes('B2') || level.includes('C1') || level.includes('C2')) {
    levelGuidance =
      'Trình độ học viên là Trung cấp/Nâng cao (B1-C1). Phân tích sâu sắc thái nghĩa, các cụm từ đi liền (collocations) và phân biệt với các cấu trúc tương tự.';
  }

  let goalGuidance = 'Liên hệ với ứng dụng thực tế.';
  if (exercise.skill === 'toeic' || goalType === 'toeic') {
    goalGuidance = 'Học viên đang ôn luyện TOEIC. Hãy chỉ ra dấu hiệu nhận biết nhanh và bẫy thường gặp trong đề thi.';
  } else if (goalType === 'daily_communication') {
    goalGuidance = 'Học viên hướng tới giao tiếp hàng ngày. Hãy nhấn mạnh cách người bản xứ nói chuyện tự nhiên trong đời sống.';
  } else if (goalType === 'work') {
    goalGuidance = 'Học viên hướng tới công việc. Hãy nhấn mạnh tính chuyên nghiệp và lịch sự trong giao tiếp công sở.';
  }

  const systemPrompt = `
Bạn là Gia Sư Tiếng Anh AI (AI Tutor) tận tâm, am hiểu sư phạm, chuyên giúp người học Việt Nam hiểu cặn kẽ bản chất tiếng Anh.

HƯỚNG DẪN SƯ PHẠM:
1. ${levelGuidance}
2. ${goalGuidance}
3. Nếu học viên làm đúng: Khen ngợi ngắn gọn, củng cố vì sao đúng và mở rộng thêm kiến thức hữu ích liên quan.
4. Nếu học viên làm sai: Động viên tích cực, phân tích nhẹ nhàng vì sao câu họ chọn chưa chính xác và hướng dẫn cách suy luận ra đáp án đúng.
5. Tuyệt đối không thay đổi hay phán xét kết quả đã nộp. Không bịa đặt thông tin không có trong bài.
6. Luôn cung cấp 2 ví dụ tiếng Anh có dịch nghĩa tiếng Việt kèm theo.
`.trim();

  const prompt = `
THÔNG TIN BÀI HỌC & CÂU HỎI:
- Bài học: ${exercise.lessonTitle} (${exercise.skill})
- Trình độ học viên: ${level}
- Mục tiêu chính: ${goalTitle}
- Câu hỏi: "${exercise.prompt}"
- Câu trả lời của học viên: "${exercise.userAnswer || '(Bỏ trống)'}"
- Kết quả: ${exercise.isCorrect ? 'ĐÚNG ✓' : 'CHƯA ĐÚNG ✕'}
- Đáp án chính xác: "${exercise.correctAnswer}"
- Lời giải thích gốc từ giáo trình: "${exercise.teacherExplanation}"
${exercise.userQuery ? `- Câu hỏi thắc mắc thêm từ học viên: "${exercise.userQuery}"` : ''}

YÊU CẦU:
Hãy phân tích và giải thích cho học viên theo mẫu JSON đã quy định.
`.trim();

  return {
    systemPrompt,
    prompt,
    schemaDescription: TUTOR_EXPLANATION_SCHEMA_DESCRIPTION,
    promptVersion: TUTOR_EXERCISE_EXPLANATION_VERSION,
  };
}
