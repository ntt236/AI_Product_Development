# Project State — AI English Learning Platform

**Last Updated:** 2026-10-19  
**Active Branch:** `phase-4` (working tree)  
**Current Phase:** Phase 5 — AI Tutor & Hoàn thiện Learning Path: Triển khai bài Listening mẫu thực tế ("Daily Conversations — Introducing Yourself")  
**Next Phase:** Phase 6 — Vocabulary Notebook & Spaced Repetition (SRS)  

---

## 1. Trạng thái mã nguồn & kiến trúc
- **Framework**: Next.js 15.5.27 (App Router), React 19, TypeScript strict mode.
- **Kiến trúc**: Modular Monolith (`src/modules/auth`, `src/modules/profile`, `src/modules/onboarding`, `src/modules/assessment`, `src/modules/learning-path`, `src/modules/daily-plan`, `src/modules/ai-tutor`, `src/lib/ai`).
- **Hạng mục hoàn thiện bổ sung: Triển khai bài Listening mẫu có thể học thực tế**:
  - **Chủ đề bài học**: `Daily Conversations — Introducing Yourself` (`Luyện nghe Hội thoại chào hỏi và Hỏi thông tin cá nhân`).
  - **Tài nguyên Audio thực tế**:
    - File âm thanh chuẩn 16-bit PCM RIFF WAVE 2 giọng người nói tự nhiên (`Microsoft David Desktop` & `Microsoft Zira Desktop`) luân phiên, ngắt nghỉ tự nhiên theo chuẩn đàm thoại.
    - Lưu trữ tại: `public/audio/daily-conversations-introducing-yourself.wav` (2,253,896 bytes).
    - Phục vụ tĩnh qua route: `/audio/daily-conversations-introducing-yourself.wav`.
  - **Cơ sở dữ liệu & Nội dung bài học (`public.content_items`)**:
    - Slug: `listening-daily-conversations-introducing-yourself`, UUID: `11111111-1111-4111-a111-000000000003`.
    - Trình độ: `a1`, Kỹ năng: `listening`, Thời lượng ước tính: 20 phút.
    - Body JSONB: Mục tiêu học tập, mẹo nghe bắt từ khóa, audio URL, danh sách câu thoại (dialogue) kèm bản dịch tiếng Việt song ngữ, transcript đối chiếu.
  - **Bộ câu hỏi trắc nghiệm & Chấm điểm Server-side**:
    - 5 câu hỏi trắc nghiệm tương ứng chính xác với nội dung audio:
      1. Nơi sinh của David (London).
      2. Quê gốc của Sarah (Chicago).
      3. Nơi sinh sống hiện tại của cả hai (New York).
      4. Sở thích của Sarah (Đọc tiểu thuyết & chụp ảnh).
      5. Sở thích của David (Chơi acoustic guitar & nấu món Ý).
    - Đáp án đúng và giải thích lưu bảo mật trong `public.practice_exercise_answers` (chỉ cấp quyền SELECT cho `service_role`, client không thể truy cập).
    - Đánh giá điểm số và phân tích phản hồi 100% phía server, lưu bài nộp vào `public.practice_submissions`, ghi nhận bằng chứng học tập vào `public.learning_evidence`.
  - **Giao diện người dùng (`PracticeSessionView`)**:
    - Tích hợp component `ListeningAudioPlayer` với các tùy chọn tốc độ phát (0.8x, 1.0x, 1.2x).
    - **Bước 1 (Học)**: Hiển thị mục tiêu bài học, mẹo nghe bắt từ khóa, phát audio nghe thử, ẩn transcript để rèn luyện phản xạ nghe tự nhiên.
    - **Bước 2 (Luyện tập)**: Audio Player ghim trực quan ở đầu trang làm bài để người học vừa nghe vừa chọn đáp án.
    - **Bước 3 (Kết quả)**: Hiển thị điểm số, phân tích từng câu đúng/sai, mở khóa Script hội thoại chi tiết (Transcript) kèm bản dịch tiếng Việt từng câu thoại của David và Sarah, hỗ trợ nghe lại đối chiếu và tích hợp AI Tutor giải thích chuyên sâu.
  - **Tích hợp Learning Path & Daily Plan**:
    - Cập nhật mục `Luyện nghe Hội thoại chào hỏi và Hỏi thông tin cá nhân` trong `CURRICULUM_BANK.listening.a1` thành `content_status: 'available'`.
    - Hiển thị nhãn `✅ Khả dụng` trên giao diện Learning Path, cho phép bấm vào để học ngay.
    - Hàm tạo Daily Plan (`generateDailyPlanProposal`) tự động nhận diện và đưa bài Listening vào kế hoạch ngày của người học nếu phù hợp ngân sách thời gian mà không gây trùng lặp nhiệm vụ.
    - Các mục curriculum khác chưa có bài học tiếp tục giữ nguyên `planned_curriculum` minh bạch.

---

## 2. Trạng thái Database Schema & Migration
- **Phase 1**: [supabase/migrations/20261012_phase_1_auth_profile_onboarding.sql](file:///d:/AI_Product_Development/supabase/migrations/20261012_phase_1_auth_profile_onboarding.sql) — **Đã áp dụng**.
- **Phase 2 (Cơ sở & Hardening)**: [supabase/migrations/20261013_phase_2_placement_assessment.sql](file:///d:/AI_Product_Development/supabase/migrations/20261013_phase_2_placement_assessment.sql) & [supabase/migrations/20261014_phase_2_security_hardening.sql](file:///d:/AI_Product_Development/supabase/migrations/20261014_phase_2_security_hardening.sql) — **Đã áp dụng**.
- **Phase 3 (Learning Path)**: [supabase/migrations/20261015_phase_3_learning_path.sql](file:///d:/AI_Product_Development/supabase/migrations/20261015_phase_3_learning_path.sql) — **Đã áp dụng**.
- **Phase 4 (Daily Plan & Practice)**: [supabase/migrations/20261016_phase_4_daily_plan_practice.sql](file:///d:/AI_Product_Development/supabase/migrations/20261016_phase_4_daily_plan_practice.sql) — **Đã áp dụng**.
- **Phase 5 (AI Tutor)**: [supabase/migrations/20261017_phase_5_ai_tutor.sql](file:///d:/AI_Product_Development/supabase/migrations/20261017_phase_5_ai_tutor.sql) — **Đã tạo trong repository**.
- **Migration bổ sung (Listening Sample Lesson)**:
  - File: [supabase/migrations/20261019_phase_5_listening_sample.sql](file:///d:/AI_Product_Development/supabase/migrations/20261019_phase_5_listening_sample.sql)
  - Trạng thái: **Đã tạo và đã áp dụng trực tiếp vào database Supabase qua script `scripts/apply_listening_sample_seed.mjs`**.
  - Dữ liệu đã insert/upsert thành công: 1 content item (`listening-daily-conversations-introducing-yourself`), 5 bài tập trắc nghiệm, 5 đáp án bảo mật server-only, đồng bộ 1 topic trong `learning_path_items` thành `available`.

---

## 3. Trạng thái kiểm thử
- `npm test`: Exit code 0 (**113/113 tests passed** across 9 suites).
  - Assessment Core & Scoring Engine: 12 tests.
  - Assessment Lifecycle & IDOR: 18 tests.
  - Phase 3 Generator & Weakness Detection: 8 tests.
  - Phase 3 Lifecycle, Security & Concurrency: 18 tests.
  - Phase 4 Daily Plan Generator Suite: 5 tests.
  - Phase 4 Practice Scoring & Lifecycle Engine: 7 subtests.
  - Learning Path Real Content Linkage Suite: 8 tests.
  - Phase 5 AI Tutor & Lifecycle Suite: 28 tests.
  - **Phase 5 Listening Sample & Learning Lifecycle Suite (`tests/daily-plan/listening_practice_lifecycle.test.mjs`)**: 9 tests:
    1. Kiểm tra audio file tồn tại trên đĩa, dung lượng hợp lệ (> 100KB), đúng header RIFF WAVE.
    2. Kiểm tra routing audio qua folder `/public`.
    3. Kiểm tra 5 câu hỏi khớp 100% với lời thoại trong audio.
    4. Xác thực dữ liệu gửi cho client không làm lộ đáp án hoặc giải thích.
    5. Kiểm thử chấm điểm server-side cho trường hợp đúng 100% và đúng một phần.
    6. Kiểm tra Learning Path ánh xạ chủ đề sang `available` và slug chính xác.
    7. Xác minh các chủ đề chưa có bài học vẫn giữ nguyên `planned_curriculum`.
    8. Kiểm tra Daily Plan Generator tích hợp bài Listening mà không sinh trùng lặp task.
    9. Xác minh không ảnh hưởng đến bài Vocabulary, Grammar và AI Tutor hiện có.
- `npx tsc --noEmit`: Exit code 0 (TypeScript strict mode hoàn toàn sạch lỗi).
- `npm run lint`: Exit code 0 (ESLint hoàn toàn sạch lỗi).
- `npm run build`: Exit code 0 (Compiled & optimized production bundle thành công 12/12 routes).

---

## 4. Việc cần làm tiếp theo (Next Action)
- Người dùng có thể kiểm thử trực tiếp trên trình duyệt bằng cách chạy `npm run dev` và truy cập `/learning-path` hoặc `/daily-plan`.
- Sẵn sàng chuyển tiếp sang **Phase 6 — Vocabulary Notebook & Spaced Repetition (SRS)** theo roadmap chính thức.
