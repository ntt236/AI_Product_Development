# Session Report: Phase 7 — Four Skills Implementation (Listening, Reading, Writing, Speaking)

**Ngày thực hiện:** 2026-10-20 / 2026-10-21  
**Môi trường:** Local Node.js v20+, Next.js 15.5.27, Supabase Cloud Database  
**Trạng thái phiên:** Hoàn thành xuất sắc 100% mục tiêu Phase 7  
**Branch:** `phase-7`  

---

## 1. Mục tiêu phiên làm việc

Triển khai hoàn chỉnh **Phase 7 — Four Skills** theo đúng tài liệu `docs/product/DEVELOPMENT_ROADMAP.md` và yêu cầu chính thức của dự án:
- Hoàn thiện trải nghiệm học đủ 4 kỹ năng: **Listening, Reading, Writing, Speaking**.
- Tích hợp chặt chẽ với hệ thống hiện tại: **Learning Path**, **Daily Plan**, **AI Tutor**, **Vocabulary Review**, **Learning Streak** và **Learning Evidence**.
- Không tạo ứng dụng mới; tuân thủ kiến trúc Modular Monolith và giữ nguyên thiết kế UI/UX hiện đại (Tailwind + shadcn semantic design tokens).

---

## 2. Những gì đã triển khai (Implemented Details)

### 2.1. Domain Module Four Skills (`src/modules/skills/`)
- `types.ts`:
  - `SkillItemCatalog`: Mô hình dữ liệu cho danh mục kỹ năng, hỗ trợ phân loại `status: 'ready' | 'planned'`.
  - `WritingEvaluationResult`: Kết quả đánh giá bài viết có cấu trúc (`overall_feedback`, `rubric_scores`, `grammar_corrections`, `vocabulary_enhancements`, `improved_version`, `next_steps`, `evaluation_source`).
  - `SpeakingEvaluationResult`: Kết quả đánh giá phản xạ nói (`overall_feedback`, `relevance_and_fluency`, `rubric_scores`, `grammar_corrections`, `vocabulary_enhancements`, `sample_spoken_response`, `next_steps`, `evaluation_source`).
  - Zod schemas: `submitWritingInputSchema` (kiểm tra tối thiểu 10 từ, tối đa 3000 ký tự) và `submitSpeakingInputSchema` (kiểm tra tối thiểu 10 từ, tối đa 2500 ký tự).
- `evaluator.ts`:
  - Đánh giá bài viết và bài nói qua AI Provider với rate limit (15 requests / 5 phút), prompt versioning (`writing_eval_v1`, `speaking_eval_v1`), token usage logging.
  - Fallback quy chuẩn xác định (`generateFallbackWritingEvaluation`, `generateFallbackSpeakingEvaluation`): Đảm bảo hệ thống luôn trả về rubric 100 điểm, lỗi ngữ pháp và bài mẫu hoàn thiện ngay cả khi AI provider offline, rate limit hoặc timeout.
  - Hàm `countWords`: Xử lý chính xác các trường hợp khoảng trắng, tab, xuống dòng.
- `services.ts`:
  - `getSkillsCatalog()`: Truy xuất danh mục 4 kỹ năng với các bài học ready (A1) và bài học planned (A2).
  - `submitWritingPractice()`: Chấm điểm bài viết, lưu `practice_submissions`, ghi `learning_evidence` kỹ năng `writing`, cập nhật Daily Plan task, tính chuỗi học `recordStudyActivity` và mở khóa bài tiếp theo trong Learning Path.
  - `submitSpeakingPractice()`: Chấm điểm phản xạ nói transcript-first, lưu submission, evidence kỹ năng `speaking`, cập nhật task và streak.
- `actions.ts`:
  - `getSkillsCatalogAction()`: Server Action an toàn lấy danh mục bài học.
  - `startSkillPracticeAction(slug)`: Server Action kết nối giữa Hub kỹ năng và Kế hoạch ngày; tự động thêm bài tập vào Daily Plan nếu chưa có để đảm bảo tính đồng bộ và chống tạo task trùng.
  - `submitWritingPracticeAction()`: Server Action nộp bài viết có Zod validation.
  - `submitSpeakingPracticeAction()`: Server Action nộp transcript nói có Zod validation.

### 2.2. Chi tiết 4 Kỹ năng (Four Skills Slices)
1. **Listening**:
   - Sử dụng audio thực tế phát được: `public/audio/daily-conversations-introducing-yourself.wav` (336 KB, giọng bản xứ Mỹ chuẩn).
   - Component `ListeningAudioPlayer` với các tùy chọn tốc độ phát `0.8x`, `1.0x`, `1.2x`.
   - Audio hiển thị xuyên suốt khi đọc lý thuyết và khi làm bài tập trắc nghiệm.
   - Script cuộc hội thoại (Transcript) và bản dịch song ngữ được khóa an toàn trước khi nộp, chỉ hiển thị sau khi server chấm điểm thành công.
2. **Reading**:
   - Bài đọc văn bản công sở thực tế (`reading-workplace-announcements-messages`): Thể loại memo thông báo nội bộ, ~185 từ, danh sách từ vựng trọng tâm và mẹo đọc quét Scanning.
   - 5 câu hỏi trắc nghiệm đọc hiểu gắn liền với văn bản.
   - Trong quá trình làm bài, có bảng tham chiếu văn bản đọc hiểu (Reading Passage Reference Box) có thể thu gọn / mở rộng để người học tra cứu đối chiếu dễ dàng.
   - Đáp án đúng và giải thích được bảo mật server-side (`practice_exercise_answers`).
3. **Writing**:
   - Bài viết tình huống (`writing-introductory-email`): Viết email giới thiệu bản thân gửi đồng nghiệp mới, mục tiêu 50-150 từ.
   - Step 1: Hiển thị tình huống, checklist yêu cầu, rubric 4 tiêu chí (Task, Grammar, Lexical, Coherence).
   - Step 2: Trình soạn thảo textarea tương tác với bộ đếm từ và ký tự trực tiếp; cảnh báo nếu dưới 10 từ.
   - Step 3: Thẻ kết quả Hero hiển thị tổng điểm / 100, 4 thanh đo Rubric chi tiết, nhận xét tổng quan sư phạm, bảng sửa lỗi ngữ pháp (lỗi cũ vs câu sửa đúng + giải thích tiếng Việt), gợi ý nâng cấp từ vựng, phiên bản tham khảo hoàn thiện (Native Version) kèm lý do cải tiến và các bước tiếp theo.
   - Tuyên bố minh bạch: Điểm số dựa trên thang 4 tiêu chí bài tập, không phải chứng chỉ CEFR chính thức.
4. **Speaking (Transcript-First)**:
   - Bài luyện phản xạ nói (`speaking-daily-life-introduction`): Giới thiệu bản thân và thói quen hàng ngày, thời lượng mục tiêu 60-90s, độ dài 40-120 từ.
   - Step 1: Đọc câu hỏi gợi ý (cue points), cấu trúc câu đàm thoại và ghi chú phương pháp Transcript-First.
   - Step 2: Người học luyện nói to, sau đó nhập lại transcript trung thực vào hệ thống.
   - Step 3: AI phân tích độ tự nhiên văn nói, tính liên kết câu hỏi, sửa ngữ pháp văn nói, nâng cấp cụm từ đàm thoại bản xứ và cung cấp bài nói mẫu (Sample Spoken Answer) kèm các cụm từ đắt giá.

### 2.3. Hub Kỹ năng (`/skills`) & Giao diện tích hợp
- Tạo `src/app/(app)/skills/page.tsx` và `src/app/(app)/skills/skills-view.tsx`.
- Bộ lọc danh mục theo kỹ năng: `Tất cả`, `Listening`, `Reading`, `Writing`, `Speaking`.
- Bộ lọc theo trạng thái: `Tất cả`, `Sẵn sàng học` (Ready), `Đang chuẩn bị lộ trình` (Planned).
- Thẻ bài học hiển thị huy hiệu, thời lượng, điểm nhấn bài học (Highlights), và nút "Luyện tập ngay" kích hoạt `startSkillPracticeAction`.
- Cập nhật Navbar (`src/components/layout/navbar.tsx`): Thêm mục **4 Kỹ năng** với icon `Headphones`.

### 2.4. Tích hợp AI Provider Mock
- Cập nhật `src/lib/ai/providers/mock.ts` hỗ trợ structured output cho Writing và Speaking evaluation, đảm bảo 100% kiểm thử CI và môi trường offline chạy độc lập không phụ thuộc mạng bên ngoài.

---

## 3. Database & Dữ liệu Seed trên Supabase

- Tạo file migration: [supabase/migrations/20261021_phase_7_four_skills.sql](file:///d:/AI_Product_Development/supabase/migrations/20261021_phase_7_four_skills.sql).
- Chạy script seed `scripts/apply_phase_7_seed.mjs` trên Supabase:
  - `reading-workplace-announcements-messages` (`content_items`, `skill: 'reading'`).
  - 5 câu hỏi đọc hiểu (`practice_exercises`) và 5 đáp án bí mật (`practice_exercise_answers`).
  - `writing-introductory-email` (`content_items`, `content_type: 'practice'`, `skill: 'writing'`).
  - `speaking-daily-life-introduction` (`content_items`, `content_type: 'practice'`, `skill: 'speaking'`).
  - Xác nhận bài nghe `listening-daily-conversations-introducing-yourself` với file audio `public/audio/daily-conversations-introducing-yourself.wav` đã hoạt động.

---

## 4. Kết quả kiểm thử thực tế (Verification Evidence)

1. **Automated Test Suite (`npm test`)**:
   - **142/142 tests passed** across 26 suites (0 failed, 0 skipped, thời gian chạy: ~1.2s).
   - Thêm mới bộ test [tests/skills/four_skills_lifecycle.test.mjs](file:///d:/AI_Product_Development/tests/skills/four_skills_lifecycle.test.mjs) với 9 bài test bao phủ toàn bộ vòng đời Four Skills.
2. **TypeScript Compilation (`npm run typecheck`)**:
   - Exit code 0 (TypeScript strict mode hoàn toàn sạch lỗi, 0 error).
3. **Linter (`npm run lint`)**:
   - Exit code 0 (**✔ No ESLint warnings or errors**).
4. **Next.js Production Build (`npm run build`)**:
   - Exit code 0 (Compiled successfully in 7.7s).
   - Đã sinh thành công toàn bộ 14 routes (bao gồm `/skills`, `/daily-plan/practice/[taskId]`, `/vocabulary`, `/dashboard`, `/learning-path`, `/assessment`, `/login`, `/register`).
   - First load JS shared chỉ 103 kB.

---

## 4.1. Audit & Hardening Kiến trúc Backend (Bởi NTT-Backend)

Trong phiên rà soát kỹ thuật độc lập bởi **NTT-Backend (Principal Backend & Architecture Engineer, Aevum)**, hệ thống backend đã được kiểm tra toàn diện về bảo mật IDOR, tính toàn vẹn dữ liệu, chống chạy đua (race condition), và cơ chế chuyển đổi trạng thái:

1. **Khắc phục Lỗ hổng IDOR (Insecure Direct Object Reference) trong Nộp bài**:
   - *Phát hiện*: Trong `submitPracticeAnswers` (`daily-plan/services.ts`), `submitWritingPractice` và `submitSpeakingPractice` (`skills/services.ts`), khi client truyền `taskId`, hệ thống dùng `adminClient` truy vấn `daily_plan_tasks` bằng `id = taskId` mà không kiểm tra `user_id = userId`. Điều này có thể cho phép người dùng độc hại gửi `taskId` của người khác để hoàn thành thay, can thiệp vào tiến độ và mở khóa bài học của tài khoản khác.
   - *Khắc phục*: Đặt lớp xác thực quyền sở hữu `eq('id', taskId).eq('user_id', userId)` ngay tại đầu vào. Nếu `taskId` không thuộc về người dùng, hệ thống lập tức từ chối với lỗi bảo mật 403 rõ ràng: *"Nhiệm vụ không tồn tại hoặc bạn không có quyền truy cập."*

2. **Chống lỗi Phồng số phút học tập (Minute Inflation Bug)**:
   - *Phát hiện*: Khi nộp lại bài hoặc người dùng bấm đúp gửi submission, số phút `estimated_minutes` của task liên tục được cộng dồn vào `daily_plans.completed_minutes` mà không kiểm tra xem task đã `completed` trước đó hay chưa.
   - *Khắc phục*: Bổ sung điều kiện kiểm tra trạng thái trước đó `const wasAlreadyCompleted = task.status === 'completed'`. Chỉ cộng số phút học vào `daily_plans` nếu task chưa từng hoàn thành trước đó, bảo toàn tính lũy đẳng (idempotent).

3. **Liên kết Tự động Lộ trình Học tập (Four Skills ➔ Learning Path Auto-Linkage)**:
   - *Phát hiện*: Khi bắt đầu bài học từ Hub 4 Kỹ năng (`/skills`), task tạo mới chưa được liên kết `learning_path_item_id`. Do đó khi hoàn thành bài, hệ thống không mở khóa được chủ đề tương ứng trong Learning Path.
   - *Khắc phục*: Trong `startSkillPracticeAction`, tự động dò tìm chủ đề tương ứng trong lộ trình đang hoạt động (`active`) của người học qua `matchTopicToContentItem` và gán `learning_path_item_id`. Đồng thời gọi `recalculatePlanStatus` cập nhật trạng thái kế hoạch ngày khi có task mới được thêm vào.

4. **Chống xung đột Race Condition khi thêm Task từ Hub**:
   - Bổ sung truy vấn trực tiếp xuống DB `select id from daily_plan_tasks where daily_plan_id = ... and content_item_id = ...` trước khi insert, triệt tiêu nguy cơ sinh trùng task khi người dùng bấm đúp nút "Luyện tập ngay".

5. **Hardening Migration Script với Dynamic Natural Key Resolution**:
   - Cập nhật `supabase/migrations/20261021_phase_7_four_skills.sql` và `scripts/apply_phase_7_seed.mjs`: Thay thế toàn bộ hardcoded UUIDs trong bảng `practice_exercise_answers` bằng khối `DO $$` phân giải động qua khóa tự nhiên `(content_item_id, position)`, ngăn chặn 100% nguy cơ Foreign Key Violation khi chạy trên các database có sẵn.

6. **Kẹp an toàn Điểm số (Score Clamping 0–100)**:
   - Toàn bộ điểm số AI evaluation được kẹp chặt trong khoảng `[0, 100]` và làm tròn số nguyên an toàn trước khi lưu vào PostgreSQL, bảo vệ trường `numeric(5,2)` khỏi lỗi tràn số.

7. **Mở rộng Test Suite lên 146 tests (26 suites pass 100%)**:
   - Bổ sung các bài test kiểm chứng: Anti-IDOR (Test 11), Anti-Minute Inflation (Test 12), Zod Schema Resilience cho `taskId` (Test 10), và Score Clamping (Test 13).

---

## 5. Hướng dẫn kiểm thử thủ công từng kỹ năng

1. **Kiểm thử Hub Kỹ năng (`/skills`)**:
   - Đăng nhập hệ thống, truy cập thanh điều hướng trên cùng, bấm chọn mục **"4 Kỹ năng"**.
   - Bấm chuyển đổi các tab lọc: *Listening*, *Reading*, *Writing*, *Speaking*.
   - Kiểm tra các bài học A1 có huy hiệu xanh lá "Sẵn sàng học", các bài A2 có huy hiệu "Đang chuẩn bị".
2. **Kiểm thử Listening**:
   - Trên bài học "Luyện nghe Hội thoại chào hỏi (Introducing Yourself)", bấm **Luyện tập ngay**.
   - Hệ thống chuyển hướng vào `/daily-plan/practice/[taskId]`.
   - Nghe thử audio, chỉnh tốc độ `0.8x`, `1.0x`, `1.2x`.
   - Bấm "Tôi đã hiểu bài • Bắt đầu làm bài tập" ➔ Trả lời các câu hỏi ➔ Bấm "Nộp bài".
   - Kiểm tra: Điểm số hiển thị chính xác, lời thoại chi tiết (Transcript song ngữ) được mở khóa, có thể bấm "Hỏi AI Tutor phân tích sâu hơn".
3. **Kiểm thử Reading**:
   - Tại Hub `/skills`, bấm **Luyện tập ngay** bài "Đọc hiểu Thông báo nội bộ (Workplace Announcements)".
   - Step 1: Đọc văn bản memo nội bộ, từ vựng cốt lõi và chiến lược đọc quét.
   - Step 2: Bấm làm bài tập; thử mở/thu gọn bảng văn bản tham chiếu (Reading Passage Reference Box) trong khi chọn đáp án trắc nghiệm.
   - Step 3: Nộp bài, kiểm tra đáp án đúng/sai, giải thích chi tiết và đối chiếu văn bản.
4. **Kiểm thử Writing**:
   - Bấm **Luyện tập ngay** bài "Luyện viết Email giới thiệu bản thân (Self-Introduction Email)".
   - Step 1: Xem tình huống và checklist yêu cầu.
   - Step 2: Nhập thử bài viết ngắn dưới 10 từ ➔ Kiểm tra hệ thống cảnh báo và ngăn nộp.
   - Soạn bài viết hoàn chỉnh (khoảng 50-80 từ) ➔ Bấm "Nộp bài & Nhận xét AI".
   - Step 3: Kiểm tra hiển thị tổng điểm / 100, 4 thước đo Rubric, nhận xét sư phạm, bảng sửa lỗi ngữ pháp, gợi ý từ vựng và phiên bản hoàn thiện tham khảo.
5. **Kiểm thử Speaking (Transcript-First)**:
   - Bấm **Luyện tập ngay** bài "Luyện nói Phản xạ giới thiệu bản thân (Self-Introduction & Daily Life)".
   - Step 1: Xem các câu hỏi gợi ý và ghi chú phương pháp Transcript-First.
   - Step 2: Nhập transcript câu trả lời đã luyện nói (trên 40 từ) ➔ Bấm "Nộp transcript & Nhận xét AI".
   - Step 3: Kiểm tra nhận xét phản xạ tự nhiên, sửa ngữ pháp văn nói, nâng cấp cụm từ đàm thoại và bài nói mẫu bản xứ.
6. **Kiểm thử tích hợp hệ thống**:
   - Sau khi hoàn thành bất kỳ bài nào, quay lại `/daily-plan` ➔ Kiểm tra task chuyển trạng thái `completed`, số phút học tăng lên.
   - Kiểm tra badge **Chuỗi ngày học (Streak)** trên Navbar và Dashboard tăng lên hoặc ghi nhận đã học hôm nay.

---

## 6. Việc còn lại trước khi bắt đầu Phase 8

Hệ thống đã sẵn sàng 100% để bước vào **Phase 8 — Comprehensive TOEIC Preparation & Full-Length Mock Exams**:
- Chuẩn bị ngân hàng câu hỏi TOEIC Parts 1 đến 7.
- Xây dựng công cụ thi thử bấm giờ 2 tiếng (200 câu) kèm bảng quy đổi điểm chuẩn TOEIC 10-990.
- Module phân tích điểm mạnh/yếu theo từng Part và gợi ý bài ôn trọng tâm.
