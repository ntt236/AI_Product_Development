# Session Report: 2026-10-12 — Phase 1 Code Review & Security Hardening

## 1. Mục tiêu phiên làm việc
- Thực hiện review toàn diện trước khi áp dụng migration Phase 1.
- Khắc phục 3 vấn đề kỹ thuật đã phát hiện:
  1. Bảo vệ `profiles.estimated_level` ở tầng database.
  2. Bảo toàn cookie khi middleware thực hiện redirect.
  3. Sử dụng `.maybeSingle()` thay vì `.single()` cho truy vấn `learner_preferences`.
- Thiết lập quy trình duy trì ngữ cảnh (`Session Continuity & Project Memory`) trong `AGENTS.md`.

---

## 2. Các file đã sửa / tạo mới
- [AGENTS.md](file:///d:/AI_Product_Development/AGENTS.md): Thêm quy chuẩn `Session Continuity and Project Memory`.
- [supabase/migrations/20261012_phase_1_auth_profile_onboarding.sql](file:///d:/AI_Product_Development/supabase/migrations/20261012_phase_1_auth_profile_onboarding.sql): Thêm trigger `protect_profile_fields` và giá trị fallback `Learner` trong trigger `handle_new_user`.
- [src/lib/supabase/middleware.ts](file:///d:/AI_Product_Development/src/lib/supabase/middleware.ts): Sao chép cookies từ `supabaseResponse` sang `NextResponse.redirect` khi chuyển hướng.
- [src/modules/onboarding/actions.ts](file:///d:/AI_Product_Development/src/modules/onboarding/actions.ts): Thay `.single()` bằng `.maybeSingle()` cho `learner_preferences` và `profiles`.
- [src/app/(app)/dashboard/page.tsx](file:///d:/AI_Product_Development/src/app/(app)/dashboard/page.tsx): Thay `.single()` bằng `.maybeSingle()` cho `learner_preferences`.
- [docs/architecture/DATA_FLOWS.md](file:///d:/AI_Product_Development/docs/architecture/DATA_FLOWS.md): Tạo tài liệu mô tả luồng Auth, Middleware và Onboarding.
- [docs/development/PROJECT_STATE.md](file:///d:/AI_Product_Development/docs/development/PROJECT_STATE.md): Khởi tạo handoff trạng thái dự án.

---

## 3. Quyết định kỹ thuật quan trọng
1. **Bảo vệ `estimated_level` bằng trigger `BEFORE UPDATE`**:
   - Thay vì chỉ dựa vào kiểm tra ở server Next.js, trigger ở database kiểm tra `auth.role() = 'authenticated'`. Nếu một người dùng thông thường gửi lệnh update `estimated_level`, PostgreSQL sẽ chặn đứng và raise exception.
   - Các thao tác hệ thống hoặc dịch vụ chấm điểm (Phase 2) sử dụng `service_role` sẽ không bị chặn.
2. **Bảo toàn Cookie SSR trong Middleware**:
   - Sử dụng `supabaseResponse.cookies.getAll().forEach(...)` gán sang `redirectResponse` để đảm bảo khi người dùng bị redirect (ví dụ sau đăng xuất, hoặc khi token hết hạn được refresh tự động), browser vẫn nhận được cookie cập nhật mới nhất.
3. **Cơ chế `.maybeSingle()` an toàn cho PostgREST**:
   - Tránh việc Supabase ném lỗi HTTP 406 / mã `PGRST116` khi người dùng mới chưa có dòng dữ liệu nào trong bảng `learner_preferences`.

---

## 4. Kiểm thử đã chạy & Kết quả thực tế
- `npm run lint`: Exit code 0 (No ESLint warnings or errors).
- `npx tsc --noEmit`: Exit code 0 (Hoàn thành với 0 lỗi kiểu dữ liệu).
- `npm run build`: Exit code 0 (Production build thành công trong 2.4s, 8 static/dynamic routes + middleware).

---

## 5. Review & Làm cứng Migration Phase 1 (`supabase/migrations/20261012_phase_1_auth_profile_onboarding.sql`)
1. **Bảo vệ trường hệ thống (`profiles.estimated_level`, `profiles.onboarding_completed_at`)**:
   - Thay thế việc kiểm tra `auth.role() = 'authenticated'` bằng ranh giới đặc quyền tường minh `is_admin_or_service_role()`:
     - Chỉ chấp nhận `postgres`, `supabase_admin` hoặc JWT role `service_role`.
     - Các role không xác định hoặc NULL đều bị coi là không có đặc quyền.
   - Mở rộng trigger thành `BEFORE INSERT OR UPDATE ON public.profiles`:
     - Chặn người dùng thường gán `estimated_level` hoặc `onboarding_completed_at` ngay từ lúc INSERT.
     - Chặn người dùng thường sửa `estimated_level` khi UPDATE.
     - Chặn hủy hoặc sửa lùi `onboarding_completed_at` sau khi đã hoàn thành.
     - Khi đánh dấu hoàn thành lần đầu, bắt buộc phải tồn tại mục tiêu chính đang hoạt động (`public.goals`) và thời gian học (`public.learner_preferences`).
     - Cho phép backend assessment engine (Phase 2+) cập nhật hợp lệ thông qua `createAdminClient()` (`service_role`).
2. **Quyền khởi tạo Profile (`public.profiles`)**:
   - Loại bỏ chính sách RLS `Users can insert own profile` để ngăn client tự insert profile tùy ý.
   - Khởi tạo profile hoàn toàn do trigger `handle_new_user` (`security definer`) xử lý.
   - Loại bỏ khối `EXCEPTION WHEN OTHERS THEN RETURN NEW` nuốt lỗi ngầm trong `handle_new_user`, giúp phát hiện lỗi hệ thống thay vì tạo tài khoản mồ côi.
   - Đảm bảo an toàn khi trùng lặp thông qua `ON CONFLICT (id) DO NOTHING`.
   - Cập nhật `src/modules/profile/services.ts` sử dụng `createAdminClient()` (chỉ chạy ở phía server) như cơ chế cứu hộ có kiểm soát nếu gặp tài khoản cũ bị thiếu profile.
3. **Ràng buộc dữ liệu chặt chẽ**:
   - Tạo hàm `validate_study_days(days smallint[])` kiểm tra: mảng từ 1 đến 7 phần tử, các giá trị thuộc đoạn 1..7 (Thứ 2 - Chủ nhật), không có phần tử trùng lặp.
   - Thêm `CHECK` constraint cho `goals.target_level`: giá trị NULL hoặc thuộc các bậc CEFR (`pre_a1`, `a1`, `a2`, `b1`, `b2`, `c1`, `c2`), khớp 100% với TypeScript schema và kiến trúc.
4. **Bảo mật RLS & Quyền hạn**:
   - `public.profiles`: Chỉ cấp SELECT và UPDATE cho chính chủ `auth.uid() = id`.
   - `public.goals`: Cấp SELECT, INSERT, UPDATE, DELETE cho `auth.uid() = user_id`.
   - `public.learner_preferences`: Cấp SELECT, INSERT, UPDATE cho `auth.uid() = user_id`.

---

## 6. Phân định trạng thái & Rủi ro còn tồn tại
- **Code & Local SQL Migration**: Đã hoàn tất, kiểm tra cú pháp và logic, tương thích hoàn toàn với Next.js và Supabase client.
- **Áp dụng lên Supabase Remote**: **Chưa áp dụng**. Migration chưa được thực thi lên database remote; không tuyên bố đã kiểm chứng live RLS/trigger trên database thực tế cho đến khi người dùng chạy migration trên Supabase Dashboard.
- **Rủi ro còn tồn tại**:
  - Khi áp dụng trên Supabase remote, cần kiểm tra xem các người dùng đã đăng ký trước đó (nếu có) có thiếu record trong `public.profiles` hay không (mặc dù code đã có cơ chế server-side admin recovery).

---

## 7. Bước tiếp theo
1. Người dùng chạy migration trên Supabase SQL Editor.
2. Kiểm thử luồng đăng ký, đăng nhập và onboarding trực tiếp với cơ sở dữ liệu thật.
3. Bắt đầu Phase 2 — Placement Assessment & Scoring Engine.

