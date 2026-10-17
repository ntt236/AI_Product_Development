# Project State — AI English Learning Platform

**Last Updated:** 2026-10-16  
**Active Branch:** `phase-4`  
**Current Phase:** Phase 4 — Daily Plan + Practice (Code, UI, Content Seeding, Server Scoring, Migration & Tests Complete)  
**Next Phase:** Phase 5 — Adaptive Engine & Spaced Repetition (SRS)  

---

## 1. Trạng thái mã nguồn & kiến trúc
- **Framework**: Next.js 15.5.27 (App Router), React 19, TypeScript strict mode.
- **Kiến trúc**: Modular Monolith (`src/modules/auth`, `src/modules/profile`, `src/modules/onboarding`, `src/modules/assessment`, `src/modules/learning-path`, `src/modules/daily-plan`).
- **Phase 4 — Daily Plan + Practice Implementation**:
  - **Deterministic Daily Plan Generator (`src/modules/daily-plan/generator.ts`)**:
    - Phân bổ ngân sách thời gian học (`daily_minutes`) chính xác, không tạo nhiệm vụ vượt quá ngân sách.
    - Nhận diện ngày học theo lịch (`preferred_study_days`) hoặc ngày học linh hoạt ngoài lịch (`flexible_catchup`).
    - Ưu tiên các topic đã mở khóa (`status = 'available'`) từ Learning Path đang kích hoạt (`status = 'active'`).
    - Khớp chính xác với kho bài học thực nghiệm (`content_items`), gán nhãn trung thực `available` (có bài tập tương tác) hoặc `planned_curriculum` (chương trình dự kiến, bài tập sắp ra mắt).
    - Hoàn toàn xác định (deterministic rule-based): Cùng dữ liệu đầu vào luôn sinh ra cùng kế hoạch 100%.
  - **Foundational Curated Content & Anti-Fake Rules**:
    - Seed dữ liệu bài học thực tế, kiểm chứng chất lượng cao: Từ vựng sinh hoạt hàng ngày (`vocab-daily-routine` với 6 từ vựng, phiên âm IPA, nghĩa tiếng Việt, câu ví dụ) và Ngữ pháp Thì hiện tại đơn (`grammar-present-simple` với quy tắc, công thức, cách chia động từ, ví dụ).
    - 10 bài tập trắc nghiệm thực tế, có phương án lựa chọn và lời giải thích sư phạm chi tiết.
    - Tuyệt đối không tạo bài tập giả lập, không tạo điểm số ảo, không nhận vơ bài nghe khi chỉ có văn bản/transcript.
  - **Server-Side Scoring & Zero-Trust Answer Protection (`src/modules/daily-plan/services.ts`)**:
    - Đáp án đúng (`practice_exercise_answers`) được lưu trữ tại bảng riêng biệt, **KHÔNG CẤP QUYỀN SELECT CHO AUTHENTICATED ROLE**. Trình duyệt client không bao giờ nhận được đáp án trước khi nộp bài.
    - Server Action `submitPracticeAction()` xác thực runtime bằng Zod, chỉ server tính điểm, đánh giá đúng/sai từng câu và trả về phản hồi/giải thích sau khi đã chấm.
  - **Evidence, Event Persistence & Progress Lifecycle**:
    - Ghi nhận chi tiết bài làm vào `practice_submissions` (điểm số, tỷ lệ % đúng, thời gian làm bài, chi tiết từng câu).
    - Tự động ghi nhận bằng chứng học tập vào `learning_evidence` và sự kiện vào `learning_events` (chuẩn bị dữ liệu cho Adaptive Engine Phase 5).
    - Tự động cập nhật trạng thái nhiệm vụ hàng ngày (`daily_plan_tasks`: `pending` -> `in_progress` -> `completed` / `skipped`).
    - Tự động tính toán lại trạng thái kế hoạch ngày (`daily_plans`: `planned` -> `in_progress` -> `partially_completed` / `completed`).
    - Progressive Learning Path Unlocking: Khi hoàn thành bài tập của topic trong Learning Path, topic đó tự động chuyển sang `completed` và mở khóa topic kế tiếp trong module.
  - **Task Management (Reorder & Skip)**:
    - Cho phép đổi thứ tự nhiệm vụ học trong ngày (`reorderDailyTasksAction`) với kiểm tra toàn vẹn danh sách task IDs.
    - Cho phép bỏ qua nhiệm vụ (`skipDailyTaskAction`) kèm lý do người dùng ghi nhận vào database.
- **UI Integration**:
  - **Navigation Bar**: Thêm mục "📅 Kế hoạch ngày" (`/daily-plan`) trên toàn hệ thống.
  - **Dashboard**: Thêm thẻ tiêu điểm kế hoạch học tập hôm nay (Today's Daily Plan) hiển thị số phút mục tiêu, tiến độ hoàn thành, số nhiệm vụ còn lại và nút truy cập nhanh.
  - **Trang `/daily-plan`**: Giao diện tổng quan kế hoạch ngày, thanh tiến độ học trực quan, danh sách thẻ nhiệm vụ (skill, thời lượng, trạng thái, nhãn nội dung), nút di chuyển thứ tự lên/xuống, nút bỏ qua và modal thông tin minh bạch cho chủ đề `planned_curriculum`.
  - **Trang `/daily-plan/practice/[taskId]`**: Trình học tập và luyện tập 3 bước (Học lý thuyết/từ vựng -> Làm bài tập tương tác -> Nhận điểm số, phản hồi sư phạm và phân tích chi tiết từng câu).

---

## 2. Trạng thái Database Schema & Migration
- **Phase 1**: [supabase/migrations/20261012_phase_1_auth_profile_onboarding.sql](file:///d:/AI_Product_Development/supabase/migrations/20261012_phase_1_auth_profile_onboarding.sql) — **Đã áp dụng trên Supabase remote**.
- **Phase 2 (Cơ sở & Hardening)**: [supabase/migrations/20261013_phase_2_placement_assessment.sql](file:///d:/AI_Product_Development/supabase/migrations/20261013_phase_2_placement_assessment.sql) & [supabase/migrations/20261014_phase_2_security_hardening.sql](file:///d:/AI_Product_Development/supabase/migrations/20261014_phase_2_security_hardening.sql) — **Đã áp dụng trên Supabase remote**.
- **Phase 3 (Learning Path)**: [supabase/migrations/20261015_phase_3_learning_path.sql](file:///d:/AI_Product_Development/supabase/migrations/20261015_phase_3_learning_path.sql) — **Đã hoàn thiện mã nguồn, chờ người dùng áp dụng trên remote qua Supabase SQL Editor**.
- **Phase 4 (Daily Plan & Practice — Migration mới)**: [supabase/migrations/20261016_phase_4_daily_plan_practice.sql](file:///d:/AI_Product_Development/supabase/migrations/20261016_phase_4_daily_plan_practice.sql)
  - **Trạng thái**: **ĐÃ TẠO VÀ HOÀN TẤT AUDIT BẢO MẬT TRONG REPOSITORY. CHƯA CHẠY TRÊN SUPABASE REMOTE.**
  - **Bảng mới tạo**:
    - `public.content_items`: Kho bài học lý thuyết/từ vựng/ngữ pháp có cờ `is_published` và `content_status`.
    - `public.practice_exercises`: Danh sách bài tập, câu hỏi, các lựa chọn đáp án (JSONB).
    - `public.practice_exercise_answers`: **SERVER-ONLY PRIVATE TABLE**. Lưu đáp án đúng và lời giải thích. Không cấp quyền SELECT cho authenticated, triệt tiêu nguy cơ lộ đề bài qua F12 Network tab.
    - `public.daily_plans`: Kế hoạch ngày của từng người học theo ngày (`user_id`, `plan_date`, composite unique constraint `uq_user_daily_plan_date`).
    - `public.daily_plan_tasks`: Các nhiệm vụ học cụ thể trong ngày (`daily_plan_id`, `position`, `status`, `estimated_minutes`, `activity_type`, `skill`).
    - `public.practice_submissions`: Lịch sử nộp bài luyện tập, điểm số, tỷ lệ chính xác, chi tiết câu trả lời.
    - `public.learning_events` & `public.learning_evidence`: Ghi nhận sự kiện học tập và bằng chứng đánh giá năng lực theo từng kỹ năng.
  - **Bảo mật & RLS**:
    - Áp dụng Least Privilege: Thu hồi toàn bộ quyền INSERT/UPDATE/DELETE trực tiếp từ role `authenticated` trên các bảng kế hoạch và bài tập.
    - Toàn bộ thao tác ghi, chấm điểm và chuyển trạng thái được thực hiện an toàn qua Server Actions / Admin Client.
    - RPC functions chạy với `SECURITY DEFINER SET search_path = ''` và schema-qualified identifiers (`public.*`).

---

## 3. Trạng thái kiểm thử
- `npm test`: Exit code 0 (**68/68 tests passed** across 6 suites).
  - Assessment Core & Scoring Engine: 12 tests.
  - Assessment Lifecycle & IDOR: 18 tests.
  - Phase 3 Generator & Weakness Detection: 8 tests.
  - Phase 3 Lifecycle, Security & Concurrency: 18 tests.
  - Phase 4 Daily Plan Generator Suite: 5 tests (mapping ngày trong tuần, quản lý ngân sách thời gian, ưu tiên topic mở khóa, minh bạch nội dung, tính xác định 100%).
  - Phase 4 Practice Scoring & Lifecycle Engine: 7 subtests (chấm điểm tuyệt đối 100%, chấm điểm từng phần có phản hồi, xử lý bỏ trống câu trả lời, không phân biệt hoa thường, tái sắp xếp task hợp lệ & phát hiện ID giả mạo, cập nhật tự động trạng thái kế hoạch).
- `npx tsc --noEmit`: Exit code 0 (TypeScript strict mode hoàn toàn sạch lỗi).
- `npm run lint`: Exit code 0 ("No ESLint warnings or errors").
- `npm run build`: Exit code 0 (Next.js production build thành công 12/12 static & dynamic routes bao gồm `/daily-plan` và `/daily-plan/practice/[taskId]`).
- **Phân định rõ ràng các cấp độ kiểm thử**:
  - *Unit & Logic tests*: Đã kiểm chứng 100% thuật toán sinh kế hoạch ngày, chấm điểm server-side, tính toán tiến độ, kiểm soát thứ tự nhiệm vụ và kiểm soát lỗi đầu vào.
  - *Kiểm thử trên Supabase Remote*: Migration Phase 3 và Phase 4 **CHƯA ĐƯỢC CHẠY** trên Supabase remote. Các ràng buộc DB, RLS policies và triggers sẽ được kích hoạt khi người dùng chạy tuần tự 2 file migration qua Supabase SQL Editor.

---

## 4. Việc cần làm tiếp theo (Next Action)
- Người dùng thực hiện chạy 2 migration trên Supabase Dashboard -> SQL Editor theo thứ tự:
  1. `supabase/migrations/20261015_phase_3_learning_path.sql`
  2. `supabase/migrations/20261016_phase_4_daily_plan_practice.sql`
- Tiến hành trải nghiệm thực tế luồng: Đăng nhập -> Xem Lộ trình -> Kích hoạt Lộ trình -> Xem Kế hoạch ngày -> Luyện tập bài tập Từ vựng / Ngữ pháp -> Xem kết quả phản hồi sư phạm -> Xem tiến độ cập nhật trên Dashboard.
- Sẵn sàng chuyển tiếp sang **Phase 5 — Adaptive Engine & Spaced Repetition (SRS)**.
