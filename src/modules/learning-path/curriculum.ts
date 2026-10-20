import type { CEFRLevel } from '@/modules/profile/types';
import type { AssessmentSkill } from '@/modules/assessment/types';
import type { TopicItemDraft } from './types';

export const SKILL_TITLES: Record<AssessmentSkill | 'writing' | 'speaking', string> = {
  vocabulary: 'Từ vựng (Vocabulary)',
  grammar: 'Ngữ pháp (Grammar)',
  reading: 'Đọc hiểu (Reading)',
  listening: 'Nghe hiểu (Listening)',
  writing: 'Viết (Writing)',
  speaking: 'Nói (Speaking)',
};

/**
 * Curated standard topic bank by skill and level.
 * All items in Phase 3 are transparently marked as 'planned_curriculum'.
 */
export const CURRICULUM_BANK: Record<
  AssessmentSkill | 'writing' | 'speaking',
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
        content_status: 'available',
        content_item_slug: 'vocab-daily-routine',
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
        content_status: 'available',
        content_item_slug: 'vocab-office-communication',
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
        content_status: 'available',
        content_item_slug: 'grammar-present-simple',
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
        title: 'Đọc hiểu Thông báo nội bộ và Kế hoạch công việc (Workplace Announcements)',
        description: 'Kỹ năng đọc quét (Scanning) thông báo đổi giờ làm và tiệc chào đón đồng nghiệp mới.',
        skill: 'reading',
        target_level: 'a1',
        estimated_minutes: 20,
        content_status: 'available',
        content_item_slug: 'reading-workplace-announcements-messages',
      },
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
        content_status: 'available',
        content_item_slug: 'listening-daily-conversations-introducing-yourself',
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

  writing: {
    pre_a1: [
      {
        title: 'Luyện viết Câu đơn giới thiệu thông tin cá nhân',
        description: 'Cấu trúc câu khẳng định cơ bản: I am..., I live in...',
        skill: 'writing',
        target_level: 'pre_a1',
        estimated_minutes: 15,
        content_status: 'planned_curriculum',
      },
    ],
    a1: [
      {
        title: 'Luyện viết Email giới thiệu bản thân (Self-Introduction Email)',
        description: 'Viết email ngắn làm quen với nhóm học tập hoặc đồng nghiệp mới (60-100 từ).',
        skill: 'writing',
        target_level: 'a1',
        estimated_minutes: 20,
        content_status: 'available',
        content_item_slug: 'writing-introductory-email',
      },
      {
        title: 'Luyện viết Nhật ký thói quen hàng ngày (Daily Journal)',
        description: 'Miêu tả lịch sinh hoạt một ngày sử dụng các từ nối thời gian.',
        skill: 'writing',
        target_level: 'a1',
        estimated_minutes: 20,
        content_status: 'planned_curriculum',
      },
    ],
    a2: [
      {
        title: 'Luyện viết Thư yêu cầu thông tin & Đặt lịch hẹn (Inquiry Email)',
        description: 'Viết email trang trọng yêu cầu tài liệu dự án và sắp xếp cuộc họp nhóm.',
        skill: 'writing',
        target_level: 'a2',
        estimated_minutes: 25,
        content_status: 'planned_curriculum',
      },
    ],
    b1: [
      {
        title: 'Luyện viết Email giải quyết khiếu nại công việc',
        description: 'Cách phản hồi khách hàng và xử lý sự cố trong giao tiếp thương mại.',
        skill: 'writing',
        target_level: 'b1',
        estimated_minutes: 30,
        content_status: 'planned_curriculum',
      },
    ],
    b2: [
      {
        title: 'Luyện viết Báo cáo tóm tắt tiến độ dự án (Status Report)',
        description: 'Tổng kết công việc, phân tích dữ liệu và đề xuất giải pháp cải tiến.',
        skill: 'writing',
        target_level: 'b2',
        estimated_minutes: 35,
        content_status: 'planned_curriculum',
      },
    ],
    c1: [],
    c2: [],
  },

  speaking: {
    pre_a1: [
      {
        title: 'Luyện phát âm Chữ số, Ngày tháng và Đánh vần tên',
        description: 'Luyện phát âm chuẩn bảng chữ cái tiếng Anh và số đếm cơ bản.',
        skill: 'speaking',
        target_level: 'pre_a1',
        estimated_minutes: 15,
        content_status: 'planned_curriculum',
      },
    ],
    a1: [
      {
        title: 'Luyện nói Phản xạ giới thiệu bản thân (Daily Life Introduction)',
        description: 'Luyện phản xạ nói theo phương pháp Transcript-First, nhận xét độ tự nhiên từ AI.',
        skill: 'speaking',
        target_level: 'a1',
        estimated_minutes: 15,
        content_status: 'available',
        content_item_slug: 'speaking-daily-life-introduction',
      },
      {
        title: 'Luyện nói Miêu tả bức tranh & Hoạt động xung quanh',
        description: 'Thực hành miêu tả người và sự vật đang diễn ra bằng thì Hiện tại tiếp diễn.',
        skill: 'speaking',
        target_level: 'a1',
        estimated_minutes: 15,
        content_status: 'planned_curriculum',
      },
    ],
    a2: [
      {
        title: 'Luyện nói Trình bày ý kiến và Đóng góp ý tưởng cuộc họp (Meeting Opinions)',
        description: 'Thực hành các cấu trúc nêu quan điểm: "In my opinion", "I would suggest that".',
        skill: 'speaking',
        target_level: 'a2',
        estimated_minutes: 20,
        content_status: 'planned_curriculum',
      },
    ],
    b1: [
      {
        title: 'Luyện nói Phỏng vấn xin việc & Giới thiệu kinh nghiệm (Job Interview)',
        description: 'Trả lời các câu hỏi tình huống và thể hiện kỹ năng chuyên môn tự tin.',
        skill: 'speaking',
        target_level: 'b1',
        estimated_minutes: 25,
        content_status: 'planned_curriculum',
      },
    ],
    b2: [
      {
        title: 'Luyện thuyết trình Báo cáo kinh doanh ngắn (Business Presentation)',
        description: 'Mở đầu, chuyển ý mượt mà và kết luận bài thuyết trình chuyên nghiệp.',
        skill: 'speaking',
        target_level: 'b2',
        estimated_minutes: 30,
        content_status: 'planned_curriculum',
      },
    ],
    c1: [],
    c2: [],
  },
};

/**
 * Matches a Learning Path topic against published curated content items.
 * Returns the matching content item or null if no corresponding interactive content exists yet.
 */
export function matchTopicToContentItem<T extends { id: string; slug: string; title: string; skill: string }>(
  topic: { title: string; skill?: string | null; metadata?: Record<string, unknown> },
  contentItems: T[]
): T | null {
  if (!topic || !topic.title || !Array.isArray(contentItems)) {
    return null;
  }

  // 1. Check if metadata directly points to a content item slug or id
  if (topic.metadata) {
    if (typeof topic.metadata.content_item_slug === 'string') {
      const bySlug = contentItems.find((c) => c.slug === topic.metadata?.content_item_slug);
      if (bySlug) return bySlug;
    }
    if (typeof topic.metadata.content_item_id === 'string') {
      const byId = contentItems.find((c) => c.id === topic.metadata?.content_item_id);
      if (byId) return byId;
    }
  }

  const titleLower = topic.title.toLowerCase();

  return (
    contentItems.find((c) => {
      // Must match skill if specified
      if (topic.skill && c.skill !== topic.skill) {
        return false;
      }

      // 1. Vocabulary: Daily Routine
      if (
        (titleLower.includes('sinh hoạt') || titleLower.includes('routine')) &&
        c.slug.includes('daily-routine')
      ) {
        return true;
      }

      // 2. Vocabulary: Office Communication
      if (
        (titleLower.includes('nghề nghiệp') || titleLower.includes('công sở') || titleLower.includes('office')) &&
        c.slug.includes('office-communication')
      ) {
        return true;
      }

      // 3. Grammar: Present Simple
      if (
        (titleLower.includes('hiện tại đơn') || titleLower.includes('present simple')) &&
        c.slug.includes('present-simple')
      ) {
        return true;
      }

      // 4. Listening: Daily Conversations - Introducing Yourself
      if (
        (titleLower.includes('chào hỏi') ||
          titleLower.includes('thông tin cá nhân') ||
          titleLower.includes('introducing')) &&
        (c.slug.includes('introducing-yourself') || c.slug.includes('daily-conversations'))
      ) {
        return true;
      }

      // 5. Reading: Workplace Announcements & Messages
      if (
        (titleLower.includes('thông báo') ||
          titleLower.includes('kế hoạch công việc') ||
          titleLower.includes('announcement') ||
          titleLower.includes('tin nhắn')) &&
        (c.slug.includes('workplace-announcements') || c.slug.includes('reading-workplace'))
      ) {
        return true;
      }

      // 6. Writing: Introductory Email
      if (
        (titleLower.includes('viết email') ||
          titleLower.includes('email giới thiệu') ||
          titleLower.includes('introductory email')) &&
        c.slug.includes('introductory-email')
      ) {
        return true;
      }

      // 7. Speaking: Daily Life Introduction
      if (
        (titleLower.includes('luyện nói') ||
          titleLower.includes('phản xạ nói') ||
          titleLower.includes('cuộc sống thường ngày') ||
          titleLower.includes('daily life')) &&
        c.slug.includes('speaking-daily-life')
      ) {
        return true;
      }

      // 8. Exact slug match or title match
      if (c.title.toLowerCase() === titleLower || titleLower.includes(c.title.toLowerCase())) {
        return true;
      }

      return false;
    }) || null
  );
}
