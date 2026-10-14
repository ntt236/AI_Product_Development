# Project State — AI English Learning Platform

**Last Updated:** 2026-10-13  
**Active Branch:** `phase-2`  
**Current Phase:** Phase 2 — Placement Assessment & Scoring Engine (Code, UI & Tests Complete)  
**Next Phase:** Phase 3 — Adaptive Learning Path & Weakness Detection  

---

## 1. Trạng thái mã nguồn & kiến trúc
- **Framework**: Next.js 15.5.27 (App Router), React 19, TypeScript strict mode.
- **Kiến trúc**: Modular Monolith (`src/modules/auth`, `src/modules/profile`, `src/modules/onboarding`, `src/modules/assessment`).
- **Bảo mật**:
  - Middleware Edge route protection với cookie forwarding an toàn (`@supabase/ssr`).
  - Phân tách ngân hàng câu hỏi công khai (`assessment_questions`) và bảng đáp án mật phía server (`assessment_question_answers`).
  - Khóa RLS tuyệt đối trên bảng đáp án mật: client không có quyền SELECT/UPDATE/INSERT/DELETE.
  - Thu hồi trực tiếp quyền UPDATE trên `assessment_attempts` đối với client (`authenticated`).
  - Trigger `protect_assessment_attempt_fields`: Ngăn client tự đặt/sửa điểm (`score`, `max_score`, `accuracy`), trạng thái hoặc timestamps.
  - Trigger `protect_assessment_answer_fields`: Ngăn client tự gán `is_correct` và `score_awarded`.
  - Trigger `update_attempt_answered_count`: Tự động đồng bộ số câu đã trả lời.
  - Chống race condition & idempotency: Atomic status transition lock (`in_progress` -> `submitted`) bằng điều kiện `eq('status', 'in_progress')`.
  - Cổng kiểm soát `getDetailedAssessmentResult`: Bắt buộc attempt phải `completed` mới cho phép truy xuất explanation và đáp án chính thức.
  - Chấm điểm 100% tại backend thông qua `calculateAssessmentScore()` (idempotent, không tin cậy client).
  - Cập nhật `profiles.estimated_level` thông qua `createAdminClient()` tuân thủ ranh giới đặc quyền của Phase 1.
- **Database Schema**:
  - Migration Phase 1: [supabase/migrations/20261012_phase_1_auth_profile_onboarding.sql](file:///d:/AI_Product_Development/supabase/migrations/20261012_phase_1_auth_profile_onboarding.sql) — **Đã áp dụng trên Supabase remote**.
  - Migration Phase 2 (Cơ sở): [supabase/migrations/20261013_phase_2_placement_assessment.sql](file:///d:/AI_Product_Development/supabase/migrations/20261013_phase_2_placement_assessment.sql) — **Đã áp dụng trên Supabase remote**.
  - Migration Phase 2 Hardening: [supabase/migrations/20261014_phase_2_security_hardening.sql](file:///d:/AI_Product_Development/supabase/migrations/20261014_phase_2_security_hardening.sql) — **Đã áp dụng thành công trên Supabase remote**.

---

## 2. Trạng thái kiểm thử
- `npm test`: Exit code 0 (25/25 tests passed across 3 suites).
- `npx tsc --noEmit`: Exit code 0 (TypeScript strict mode hoàn toàn sạch lỗi).
- `npm run lint`: Exit code 0 (No ESLint warnings or errors).
- `npm run build`: Exit code 0 (Production build thành công cho tất cả static & dynamic routes).
- **Kiểm thử trực tiếp trên Supabase Remote**:
  - Đã xác minh quyền truy cập bảng: `assessment_question_answers` và `assessment_results` từ chối triệt để client `anon` (HTTP 401 code 42501).
  - Đã xác minh luồng kiểm tra thực tế: Tạo attempt, lưu 16 câu hỏi qua trigger đồng bộ `answered_count`, nộp bài atomic qua service role, ghi nhận kết quả và cập nhật `profiles.estimated_level` thành công.

---

## 3. Trạng thái Database Migration
- **Phase 1**: **ĐÃ ÁP DỤNG**.
- **Phase 2 (Cơ sở & Hardening)**: **ĐÃ ÁP DỤNG TOÀN DIỆN**. Toàn bộ cơ chế bảo vệ (Triggers, RLS, Grants) đã được kích hoạt trên database thật.

---

## 4. Việc cần làm tiếp theo (Next Action)
- Phase 2 đã hoàn tất toàn diện về chức năng và bảo mật.
- Sẵn sàng chuyển sang triển khai **Phase 3 — Adaptive Learning Path & Weakness Detection**.


