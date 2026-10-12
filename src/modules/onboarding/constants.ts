export interface GoalOption {
  id: string;
  type: string;
  title: string;
  description: string;
  icon: string;
}

export const GOAL_OPTIONS: GoalOption[] = [
  {
    id: 'foundation',
    type: 'foundation',
    title: 'Xây dựng nền tảng',
    description: 'Dành cho người mất gốc hoặc bắt đầu từ con số 0.',
    icon: '🌱',
  },
  {
    id: 'daily_communication',
    type: 'daily_communication',
    title: 'Giao tiếp hàng ngày',
    description: 'Tự tin trò chuyện, mua sắm, hỏi đường và giao lưu xã hội.',
    icon: '💬',
  },
  {
    id: 'general_english',
    type: 'general_english',
    title: 'Tiếng Anh tổng quát',
    description: 'Phát triển hài hòa và toàn diện cả 4 kỹ năng.',
    icon: '📚',
  },
  {
    id: 'improve_speaking',
    type: 'improve_speaking',
    title: 'Cải thiện phản xạ Nói',
    description: 'Rèn luyện khả năng phát âm, ngữ điệu và phản xạ tự nhiên.',
    icon: '🗣️',
  },
  {
    id: 'improve_listening',
    type: 'improve_listening',
    title: 'Nâng cao kỹ năng Nghe',
    description: 'Nghe hiểu người bản xứ, podcast và hội thoại thực tế.',
    icon: '🎧',
  },
  {
    id: 'toeic',
    type: 'toeic',
    title: 'Luyện thi TOEIC',
    description: 'Tập trung ôn luyện đạt mục tiêu điểm số TOEIC 450 - 800+.',
    icon: '🎯',
  },
  {
    id: 'work',
    type: 'work',
    title: 'Tiếng Anh công việc',
    description: 'Giao tiếp trong môi trường làm việc, viết email và họp.',
    icon: '💼',
  },
  {
    id: 'build_vocabulary',
    type: 'build_vocabulary',
    title: 'Mở rộng Từ vựng',
    description: 'Học từ vựng theo chủ đề với phương pháp ghi nhớ dài hạn.',
    icon: '🧠',
  },
];

export const DAILY_TIME_OPTIONS = [
  { value: 15, label: '15 phút / ngày', sub: 'Nhẹ nhàng, duy trì thói quen' },
  { value: 30, label: '30 phút / ngày', sub: 'Tối ưu, tiến bộ đều đặn' },
  { value: 45, label: '45 phút / ngày', sub: 'Tập trung, tiến bộ nhanh' },
  { value: 60, label: '60 phút / ngày', sub: 'Chuyên sâu, bứt phá' },
];

export const STUDY_DAYS_OPTIONS = [
  { value: 3, label: '3 ngày / tuần', days: [1, 3, 5] },
  { value: 5, label: '5 ngày / tuần', days: [1, 2, 3, 4, 5] },
  { value: 7, label: 'Hàng ngày (7 ngày)', days: [1, 2, 3, 4, 5, 6, 7] },
];
