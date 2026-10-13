# Session Report: 2026-10-13 — Phase 2 Placement Assessment & Scoring Engine

## 1. Mục tiêu phiên làm việc
Triển khai hoàn chỉnh **Phase 2 — Hệ thống đánh giá trình độ đầu vào (Placement Assessment)** theo kiến trúc Modular Monolith và quy tắc bảo mật của dự án:
1. Xây dựng ngân hàng câu hỏi mở rộng (4 kỹ năng: Từ vựng, Ngữ pháp, Đọc hiểu, Nghe/Hội thoại).
2. Tách biệt hoàn toàn câu hỏi công khai và đáp án mật phía server (`assessment_question_answers`), đảm bảo client không thể đọc trước đáp án.
3. Quản lý lượt làm bài (`assessment_attempts`) hỗ trợ làm bài, lưu tiến độ tức thời, khôi phục bài làm dang dở (Resume) và chống sửa đổi sau khi hoàn tất.
4. Xây dựng công cụ chấm điểm tất định độc lập (`calculateAssessmentScore`), tính điểm tổng, điểm kỹ năng, ước lượng trình độ CEFR nội bộ, xác định điểm mạnh/yếu.
5. Xử lý nộp bài mang tính Idempotent và cập nhật an toàn `profiles.estimated_level` cùng `learner_skill_profiles` thông qua đặc quyền server-side của Phase 1.
6. Thiết kế giao diện trực quan: Trang giới thiệu `/assessment`, giao diện làm bài `/assessment/test`, trang báo cáo kết quả `/assessment/results/[attemptId]` và tích hợp CTA trên Dashboard `/dashboard`.
7. Viết bộ kiểm thử tự động 12 tiêu chí nghiệm thu và đạt 100% pass.

---

## 2. Các file đã tạo mới & chỉnh sửa

### A. Database Migrations
- [supabase/migrations/20261013_phase_2_placement_assessment.sql](file:///d:/AI_Product_Development/supabase/migrations/20261013_phase_2_placement_assessment.sql):
  - Tạo 7 bảng: `assessments`, `assessment_questions`, `assessment_question_answers` (private), `assessment_attempts`, `assessment_answers`, `assessment_results`, `learner_skill_profiles`.
  - Thiết lập RLS toàn diện; bảng `assessment_question_answers` bị khóa hoàn toàn với client (`authenticated`/`anon`).
  - Nạp seed data 16 câu hỏi chuẩn hóa (4 Vocab, 4 Grammar, 4 Reading, 4 Listening/Dialogue) kèm giải thích chi tiết.

### B. Module Domain & Logic
- [src/modules/assessment/types.ts](file:///d:/AI_Product_Development/src/modules/assessment/types.ts): Định nghĩa kiểu dữ liệu TypeScript nghiêm ngặt cho bài thi, câu hỏi, lượt làm bài, kết quả và giải thích.
- [src/modules/assessment/scoring.ts](file:///d:/AI_Product_Development/src/modules/assessment/scoring.ts): Thuật toán chấm điểm độc lập phía server, phân tách kỹ năng, quy đổi CEFR và trích xuất điểm mạnh/yếu.
- [src/modules/assessment/services.ts](file:///d:/AI_Product_Development/src/modules/assessment/services.ts): Nghiệp vụ đọc/ghi dữ liệu, quản lý attempt, khôi phục bài dang dở, chấm điểm idempotent và đồng bộ hồ sơ qua `createAdminClient()`.
- [src/modules/assessment/actions.ts](file:///d:/AI_Product_Development/src/modules/assessment/actions.ts): Next.js Server Actions: `startOrResumePlacementAction`, `saveAnswerAction`, `submitAssessmentAction`.
- [src/modules/assessment/components/test-runner.tsx](file:///d:/AI_Product_Development/src/modules/assessment/components/test-runner.tsx): Giao diện làm bài thi trực quan, điều hướng câu hỏi, phím tắt 1-4/A-D, modal xác nhận nộp bài.

### C. Giao diện người dùng (App Router)
- [src/app/(app)/assessment/page.tsx](file:///d:/AI_Product_Development/src/app/(app)/assessment/page.tsx): Trang giới thiệu bài thi, cấu trúc kỹ năng, nút bắt đầu / tiếp tục / xem lại kết quả cũ.
- [src/app/(app)/assessment/test/page.tsx](file:///d:/AI_Product_Development/src/app/(app)/assessment/test/page.tsx): Trang làm bài thi trực tiếp tích hợp `AssessmentTestRunner`.
- [src/app/(app)/assessment/results/[attemptId]/page.tsx](file:///d:/AI_Product_Development/src/app/(app)/assessment/results/[attemptId]/page.tsx): Báo cáo kết quả CEFR, thanh tiến độ 4 kỹ năng, phân tích điểm mạnh/yếu, gợi ý Phase 3 và accordion xem lại chi tiết 16 câu hỏi kèm đáp án & giải thích.
- [src/app/(app)/dashboard/page.tsx](file:///d:/AI_Product_Development/src/app/(app)/dashboard/page.tsx): Kích hoạt thẻ Placement Assessment sống động trên Dashboard thay cho nút disabled trước đó.

### D. Kiểm thử & Cấu hình
- [tests/assessment/scoring.test.mjs](file:///d:/AI_Product_Development/tests/assessment/scoring.test.mjs): Unit test thuật toán tính điểm.
- [tests/assessment/assessment_system.test.mjs](file:///d:/AI_Product_Development/tests/assessment/assessment_system.test.mjs): Test suite 12 tiêu chí nghiệm thu (chấm đúng/sai, skill score, id không hợp lệ, phân quyền IDOR, tính bất biến sau nộp, idempotency, bảo mật đáp án, Phase 1 profile boundary).
- [tests/run_tests.mjs](file:///d:/AI_Product_Development/tests/run_tests.mjs): Script chạy test đa nền tảng.
- [package.json](file:///d:/AI_Product_Development/package.json): Bổ sung lệnh `"test": "node tests/run_tests.mjs"`.

### E. Tài liệu kiến trúc
- [docs/architecture/DATA_FLOWS.md](file:///d:/AI_Product_Development/docs/architecture/DATA_FLOWS.md): Thêm mục 5 mô tả chi tiết luồng Placement Assessment Flow.
- [docs/architecture/DATABASE_SCHEMA.md](file:///d:/AI_Product_Development/docs/architecture/DATABASE_SCHEMA.md): Bổ sung schema chi tiết và bảng mật `assessment_question_answers`.
- [docs/development/PROJECT_STATE.md](file:///d:/AI_Product_Development/docs/development/PROJECT_STATE.md): Cập nhật trạng thái handoff Phase 2 hoàn tất sang Phase 3.

---

## 3. Quyết định kỹ thuật & Ranh giới bảo mật quan trọng

1. **Bảo mật tuyệt đối đáp án câu hỏi (Confidential Answer Key Pattern)**:
   - Các trường `prompt`, `options` nằm trong `public.assessment_questions`. Client chỉ nhận danh sách lựa chọn dạng `{ id: "A", text: "..." }`, hoàn toàn không có cờ `is_correct`.
   - Đáp án đúng và giải thích được lưu riêng trong `public.assessment_question_answers`. Bảng này có RLS bật nhưng **không có policy SELECT** cho `authenticated`/`anon`. Mọi truy vấn từ browser trực tiếp qua Supabase SDK đều nhận 0 dòng.
   - Chỉ khi bài thi được nộp thành công và chấm xong ở server, người dùng mới có thể xem giải thích thông qua Server Component `getDetailedAssessmentResult()`.

2. **Chấm điểm độc lập & Idempotent Submission**:
   - Client không gửi điểm số hoặc đáp án đúng. Server đọc câu trả lời của thí sinh từ DB và đối soát với đáp án chính thức từ `assessment_question_answers`.
   - Nếu người dùng bấm nộp bài nhiều lần liên tiếp hoặc mạng chập chờn, hệ thống kiểm tra `attempt.status === 'completed'`; nếu đã có kết quả, trả về ngay kết quả đã chấm mà không tính lại hay tạo bản ghi trùng lặp.

3. **Tương thích hoàn hảo với Trigger Phase 1**:
   - Khi bài thi hoàn tất, hệ thống cập nhật `profiles.estimated_level` và `learner_skill_profiles` bằng `createAdminClient()` (chứa token `service_role`).
   - Hàm `is_admin_or_service_role()` của trigger Phase 1 xác thực thành công vai trò `service_role`, cho phép cập nhật hợp lệ mà không cần tắt hoặc làm suy yếu trigger bảo vệ profile.

---

## 4. Kiểm thử đã chạy & Kết quả thực tế

| Lệnh kiểm thử | Kết quả | Chi tiết |
|---|---|---|
| `npm test` | **Exit code 0** (Pass) | **19/19 tests passed** trên 2 suites trong 266ms |
| `npx tsc --noEmit` | **Exit code 0** (Pass) | TypeScript strict mode hoàn toàn sạch lỗi kiểu dữ liệu |
| `npm run lint` | **Exit code 0** (Pass) | `No ESLint warnings or errors` |
| `npm run build` | **Exit code 0** (Pass) | Production build thành công 10 static/dynamic routes + middleware |

---

## 5. Phân định trạng thái & Rủi ro còn tồn tại
- **Code & Test**: Đã hoàn thiện 100%, kiểm tra tự động và build production thành công.
- **Database Remote**: **CHƯA ÁP DỤNG**. File migration [supabase/migrations/20261013_phase_2_placement_assessment.sql](file:///d:/AI_Product_Development/supabase/migrations/20261013_phase_2_placement_assessment.sql) nằm ở local và chưa chạy lên Supabase remote để đảm bảo an toàn.
- **Rủi ro còn tồn tại**:
  - Do chưa chạy trên remote Supabase, audio files cho câu hỏi listening (nếu muốn bổ sung file mp3 thật) hiện đang dùng text dialogue ngữ cảnh; có thể mở rộng audio player khi có storage bucket ở các phase sau.

---

## 6. Bước tiếp theo
1. Người dùng chạy migration Phase 1 và Phase 2 trên Supabase Dashboard SQL Editor.
2. Kiểm thử làm bài thi trực tiếp trên giao diện dev (`/assessment`).
3. Bắt đầu **Phase 3 — Adaptive Learning Path & Weakness Detection**.
