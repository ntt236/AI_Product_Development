import type { CEFRLevel } from '@/modules/profile/types';
import type { AssessmentSkill } from '@/modules/assessment/types';
import type { TopicItemDraft } from './types';

export const SKILL_TITLES: Record<AssessmentSkill, string> = {
  vocabulary: 'Từ vựng (Vocabulary)',
  grammar: 'Ngữ pháp (Grammar)',
  reading: 'Đọc hiểu (Reading)',
  listening: 'Nghe hiểu (Listening)',
};

/**
 * Curated standard topic bank by skill and level.
 * All items in Phase 3 are transparently marked as 'planned_curriculum'.
 */
export const CURRICULUM_BANK: Record<
  AssessmentSkill,
  Record<CEFRLevel, TopicItemDraft[]>
> = {
  vocabulary: {
    pre_a1: [
      {
        title: 'Từ vựng sinh hoạt hàng ngày (Daily Routine)',
        description: 'Học 30 từ vựng cơ bản về hoạt động thức dậy, ăn uống, đi lại.',
        skill: 'vocabulary',
        target_level: 'pre_a1',
        estimated_minutes: 15,
        content_status: 'planned_curriculum',
      },
      {
        title: 'Chữ số, màu sắc và đồ dùng cơ bản',
        description: 'Nhận diện và sử dụng chính xác các nhóm từ miêu tả vật thể.',
        skill: 'vocabulary',
        target_level: 'pre_a1',
        estimated_minutes: 15,
        content_status: 'planned_curriculum',
      },
    ],
    a1: [
      {
        title: 'Từ vựng Nghề nghiệp & Nơi làm việc',
        description: 'Từ vựng chỉ nghề nghiệp, chức danh và địa điểm làm việc phổ biến.',
        skill: 'vocabulary',
        target_level: 'a1',
        estimated_minutes: 20,
        content_status: 'planned_curriculum',
      },
      {
        title: 'Từ vựng Đồ ăn, Thức uống & Đặt món',
        description: 'Giao tiếp gọi món tại nhà hàng và miêu tả khẩu vị thực phẩm.',
        skill: 'vocabulary',
        target_level: 'a1',
        estimated_minutes: 20,
        content_status: 'planned_curriculum',
      },
    ],
    a2: [
      {
        title: 'Từ vựng Du lịch & Phương tiện giao thông',
        description: 'Từ vựng tại sân bay, nhà ga, đặt phòng khách sạn và hỏi đường.',
        skill: 'vocabulary',
        target_level: 'a2',
        estimated_minutes: 25,
        content_status: 'planned_curriculum',
      },
      {
        title: 'Từ vựng Mua sắm & Thanh toán (Shopping & Finance)',
        description: 'Giá cả, mặc cả, hóa đơn và các phương thức thanh toán thẻ.',
        skill: 'vocabulary',
        target_level: 'a2',
        estimated_minutes: 20,
        content_status: 'planned_curriculum',
      },
    ],
    b1: [
      {
        title: 'Từ vựng Công sở & Thư tín Thương mại',
        description: 'Thuật ngữ email công việc, lịch hẹn, đàm phán và hợp đồng.',
        skill: 'vocabulary',
        target_level: 'b1',
        estimated_minutes: 25,
        content_status: 'planned_curriculum',
      },
      {
        title: 'Từ vựng Công nghệ & Tiếp thị số',
        description: 'Thuật ngữ số hóa, ứng dụng phần mềm và truyền thông quảng cáo.',
        skill: 'vocabulary',
        target_level: 'b1',
        estimated_minutes: 25,
        content_status: 'planned_curriculum',
      },
    ],
    b2: [
      {
        title: 'Collocations & Phrasal Verbs học thuật',
        description: 'Các cụm từ cố định và phrasal verbs thường gặp trong văn cảnh trang trọng.',
        skill: 'vocabulary',
        target_level: 'b2',
        estimated_minutes: 30,
        content_status: 'planned_curriculum',
      },
    ],
    c1: [],
    c2: [],
  },

  grammar: {
    pre_a1: [
      {
        title: 'Đại từ nhân xưng & Động từ To Be cơ bản',
        description: 'Cách dùng I/You/He/She và thể khẳng định/phủ định của To Be.',
        skill: 'grammar',
        target_level: 'pre_a1',
        estimated_minutes: 20,
        content_status: 'planned_curriculum',
      },
      {
        title: 'Danh từ số ít và số nhiều (Singular vs Plural Nouns)',
        description: 'Quy tắc thêm s/es và các danh từ bất quy tắc cơ bản.',
        skill: 'grammar',
        target_level: 'pre_a1',
        estimated_minutes: 20,
        content_status: 'planned_curriculum',
      },
    ],
    a1: [
      {
        title: 'Thì Hiện tại đơn (Present Simple Tense)',
        description: 'Diễn tả thói quen, chân lý và chia động từ ngôi thứ ba số ít.',
        skill: 'grammar',
        target_level: 'a1',
        estimated_minutes: 25,
        content_status: 'planned_curriculum',
      },
      {
        title: 'Thì Quá khứ đơn (Past Simple Tense)',
        description: 'Quy tắc thêm -ed và bảng động từ bất quy tắc thông dụng.',
        skill: 'grammar',
        target_level: 'a1',
        estimated_minutes: 25,
        content_status: 'planned_curriculum',
      },
    ],
    a2: [
      {
        title: 'Mạo từ A, An, The & Danh từ đếm được / không đếm được',
        description: 'Cách phân biệt mạo từ xác định và mạo từ không xác định chuẩn xác.',
        skill: 'grammar',
        target_level: 'a2',
        estimated_minutes: 25,
        content_status: 'planned_curriculum',
      },
      {
        title: 'Giới từ chỉ Thời gian & Nơi chốn (In, On, At)',
        description: 'Quy tắc tam giác giới từ và các ngoại lệ thường gặp trong đề thi.',
        skill: 'grammar',
        target_level: 'a2',
        estimated_minutes: 20,
        content_status: 'planned_curriculum',
      },
    ],
    b1: [
      {
        title: 'Thì Hiện tại hoàn thành (Present Perfect Tense)',
        description: 'Phân biệt Quá khứ đơn và Hiện tại hoàn thành với Since/For/Already.',
        skill: 'grammar',
        target_level: 'b1',
        estimated_minutes: 30,
        content_status: 'planned_curriculum',
      },
      {
        title: 'Câu bị động (Passive Voice) trong môi trường văn phòng',
        description: 'Cấu trúc be + V3/ed áp dụng cho thông báo và báo cáo công việc.',
        skill: 'grammar',
        target_level: 'b1',
        estimated_minutes: 25,
        content_status: 'planned_curriculum',
      },
    ],
    b2: [
      {
        title: 'Mệnh đề quan hệ rút gọn (Reduced Relative Clauses)',
        description: 'Rút gọn mệnh đề bằng V-ing, V-ed và To-V trong TOEIC Part 5 & 6.',
        skill: 'grammar',
        target_level: 'b2',
        estimated_minutes: 30,
        content_status: 'planned_curriculum',
      },
    ],
    c1: [],
    c2: [],
  },

  reading: {
    pre_a1: [
      {
        title: 'Đọc hiểu Biển báo và Chỉ dẫn công cộng',
        description: 'Nhận diện thông tin trên biển chỉ đường, thông báo cửa hàng.',
        skill: 'reading',
        target_level: 'pre_a1',
        estimated_minutes: 15,
        content_status: 'planned_curriculum',
      },
    ],
    a1: [
      {
        title: 'Đọc hiểu Tin nhắn ngắn và Đoạn chat (Text Messages)',
        description: 'Kỹ năng tìm ý chính và nắm bắt thời gian/địa điểm trong đoạn hội thoại.',
        skill: 'reading',
        target_level: 'a1',
        estimated_minutes: 20,
        content_status: 'planned_curriculum',
      },
    ],
    a2: [
      {
        title: 'Đọc quét thông tin trên Hóa đơn và Lịch trình (Scanning)',
        description: 'Phương pháp định vị nhanh từ khóa mà không cần dịch từng từ.',
        skill: 'reading',
        target_level: 'a2',
        estimated_minutes: 25,
        content_status: 'planned_curriculum',
      },
    ],
    b1: [
      {
        title: 'Đọc hiểu Email & Giác thư doanh nghiệp (Business Memos)',
        description: 'Xác định mục đích viết thư, yêu cầu hành động và đối tượng người nhận.',
        skill: 'reading',
        target_level: 'b1',
        estimated_minutes: 30,
        content_status: 'planned_curriculum',
      },
    ],
    b2: [
      {
        title: 'Đọc hiểu Đoạn văn kép (Double Passages) & Báo cáo thị trường',
        description: 'Kỹ năng đối chiếu thông tin giữa 2 văn bản liên quan trong TOEIC Part 7.',
        skill: 'reading',
        target_level: 'b2',
        estimated_minutes: 35,
        content_status: 'planned_curriculum',
      },
    ],
    c1: [],
    c2: [],
  },

  listening: {
    pre_a1: [
      {
        title: 'Luyện nghe Nhận diện Âm tiết và Chữ số',
        description: 'Nghe số điện thoại, giá tiền và phát âm bảng chữ cái tiếng Anh.',
        skill: 'listening',
        target_level: 'pre_a1',
        estimated_minutes: 15,
        content_status: 'planned_curriculum',
      },
    ],
    a1: [
      {
        title: 'Luyện nghe Hội thoại chào hỏi và Hỏi thông tin cá nhân',
        description: 'Nghe bắt từ khóa về tên, quốc tịch, tuổi và sở thích.',
        skill: 'listening',
        target_level: 'a1',
        estimated_minutes: 20,
        content_status: 'planned_curriculum',
      },
    ],
    a2: [
      {
        title: 'Luyện nghe Thông báo ngắn tại Sân bay / Siêu thị (Part 4 TOEIC)',
        description: 'Bắt ý chính về cổng bay, thời gian hoãn chuyến và sự kiện đặc biệt.',
        skill: 'listening',
        target_level: 'a2',
        estimated_minutes: 25,
        content_status: 'planned_curriculum',
      },
    ],
    b1: [
      {
        title: 'Luyện nghe Hội thoại nơi công sở (Part 3 TOEIC Dialogues)',
        description: 'Nghe hiểu vấn đề phát sinh giữa 2-3 người nói và hướng giải quyết.',
        skill: 'listening',
        target_level: 'b1',
        estimated_minutes: 30,
        content_status: 'planned_curriculum',
      },
    ],
    b2: [
      {
        title: 'Luyện nghe Giọng đa quốc gia (Mỹ, Anh, Úc, Canada)',
        description: 'Làm quen với các biến thể nối âm, nuốt âm và ngữ điệu khác nhau.',
        skill: 'listening',
        target_level: 'b2',
        estimated_minutes: 35,
        content_status: 'planned_curriculum',
      },
    ],
    c1: [],
    c2: [],
  },
};
