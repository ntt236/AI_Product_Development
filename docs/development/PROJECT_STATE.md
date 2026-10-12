# Project State — AI English Learning Platform

**Last Updated:** 2026-10-12  
**Active Branch:** `phase-1`  
**Current Phase:** Phase 1 — Authentication, Profile & Onboarding (Code & Review Complete)  
**Next Phase:** Phase 2 — Placement Assessment & Scoring Engine  

---

## 1. Trạng thái mã nguồn & kiến trúc
- **Framework**: Next.js 15.5.27 (App Router), React 19, TypeScript strict mode.
- **Kiến trúc**: Modular Monolith (`src/modules/auth`, `src/modules/profile`, `src/modules/onboarding`).
- **Bảo mật**: Middleware Edge route protection với cookie forwarding an toàn (`@supabase/ssr`).
- **Database Schema**: 
  - Đã làm cứng migration [supabase/migrations/20261012_phase_1_auth_profile_onboarding.sql](file:///d:/AI_Product_Development/supabase/migrations/20261012_phase_1_auth_profile_onboarding.sql):
    - Khóa trường hệ thống `estimated_level` và `onboarding_completed_at` ở cả INSERT và UPDATE bằng trigger `protect_profile_fields` với ranh giới đặc quyền tường minh `is_admin_or_service_role()`.
    - Loại bỏ quyền direct client INSERT trên `public.profiles`; quản lý tạo profile 100% qua trigger `handle_new_user` (loại bỏ catch-all silent swallow, giữ `on conflict do nothing`) và server recovery client (`createAdminClient`).
    - Bổ sung ràng buộc dữ liệu: `preferred_study_days` (1..7, không trùng lặp qua `validate_study_days`), `goals.target_level` (CEFR levels: pre_a1 đến c2).
    - RLS 100% trên cả 3 bảng (`profiles`, `goals`, `learner_preferences`).

---

## 2. Trạng thái kiểm thử
- `npx tsc --noEmit`: Exit code 0 (TypeScript strict).
- `npm run lint`: Exit code 0 (No ESLint warnings or errors).
- `npm run build`: Exit code 0 (Production build thành công 8 static/dynamic routes + middleware).

---

## 3. Trạng thái Database Migration
- **Local file**: `supabase/migrations/20261012_phase_1_auth_profile_onboarding.sql` (Đã hoàn thiện và kiểm tra kỹ thuật).
- **Remote Supabase**: **CHƯA ÁP DỤNG**. File migration cục bộ chưa được chạy lên dự án Supabase remote; cần người dùng chạy trên Supabase SQL Editor khi triển khai.

---

## 4. Việc cần làm tiếp theo (Next Action)
1. Người dùng áp dụng file migration cục bộ đã được làm cứng lên Supabase Remote qua SQL Editor.
2. Kiểm tra tương tác thực tế với Supabase remote khi có kết nối.
3. Chuyển sang triển khai **Phase 2 — Placement Assessment & Scoring Engine**.

