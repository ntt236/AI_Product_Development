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
  - Chấm điểm 100% tại backend thông qua `calculateAssessmentScore()` (idempotent, không tin cậy client).
  - Cập nhật `profiles.estimated_level` thông qua `createAdminClient()` tuân thủ ranh giới đặc quyền của Phase 1 mà không làm suy yếu trigger.
- **Database Schema**:
  - Migration Phase 1: [supabase/migrations/20261012_phase_1_auth_profile_onboarding.sql](file:///d:/AI_Product_Development/supabase/migrations/20261012_phase_1_auth_profile_onboarding.sql)
  - Migration Phase 2: [supabase/migrations/20261013_phase_2_placement_assessment.sql](file:///d:/AI_Product_Development/supabase/migrations/20261013_phase_2_placement_assessment.sql) gồm 6 bảng đánh giá (`assessments`, `assessment_questions`, `assessment_question_answers`, `assessment_attempts`, `assessment_answers`, `assessment_results`, `learner_skill_profiles`), phân quyền RLS chặt chẽ và bộ 16 câu hỏi mẫu chuẩn hóa 4 kỹ năng (Vocab, Grammar, Reading, Listening).

---

## 2. Trạng thái kiểm thử
- `npm test`: Exit code 0 (19/19 tests passed across 2 suites trong 266ms).
- `npx tsc --noEmit`: Exit code 0 (TypeScript strict hoàn toàn không có lỗi).
- `npm run lint`: Exit code 0 (No ESLint warnings or errors).
- `npm run build`: Exit code 0 (Production build thành công 10 static/dynamic routes + middleware).

---

## 3. Trạng thái Database Migration
- **Local files**:
  - `supabase/migrations/20261012_phase_1_auth_profile_onboarding.sql`
  - `supabase/migrations/20261013_phase_2_placement_assessment.sql`
- **Remote Supabase**: **CHƯA ÁP DỤNG**. File migration cục bộ chưa được chạy lên dự án Supabase remote; người dùng sẽ chạy tuần tự trên Supabase SQL Editor khi triển khai.

---

## 4. Việc cần làm tiếp theo (Next Action)
1. Người dùng chạy migration Phase 1 và Phase 2 trên Supabase SQL Editor khi sẵn sàng.
2. Kiểm thử làm bài thi trực tiếp trên giao diện dev (`/assessment`).
3. Chuyển sang triển khai **Phase 3 — Adaptive Learning Path & Weakness Detection**.


