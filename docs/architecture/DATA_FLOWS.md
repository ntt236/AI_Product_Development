# Data Flows Architecture — AI English Learning Platform

Tài liệu mô tả chi tiết các luồng dữ liệu (Data Flows), ranh giới xác thực và lưu vết database cho các tính năng đã thực sự triển khai trong hệ thống.

---

## 1. Authentication Flow (Đăng ký / Đăng nhập / Đăng xuất)

```text
[User Browser]
   │
   ├─ (1) Submit Register (email, password, displayName)
   │      ↓
   │   Server Action: signUpAction() [src/modules/auth/actions.ts]
   │      ├─ Zod validation: registerSchema
   │      └─ supabase.auth.signUp()
   │            ↓
   │         [Supabase Auth (auth.users)]
   │            └─ DB Trigger: on_auth_user_created [handle_new_user()]
   │                  └─ INSERT INTO public.profiles (id, display_name)
   │
   ├─ (2) Submit Login (email, password)
   │      ↓
   │   Server Action: signInAction() [src/modules/auth/actions.ts]
   │      ├─ Zod validation: loginSchema
   │      └─ supabase.auth.signInWithPassword()
   │            ↓
   │         Set HttpOnly session cookies (access_token, refresh_token)
   │
   └─ (3) Submit Logout
          ↓
       Server Action: signOutAction() [src/modules/auth/actions.ts]
          └─ supabase.auth.signOut() ➔ Clear cookies ➔ Redirect /login
```

* **Entry point**: [src/modules/auth/actions.ts](file:///d:/AI_Product_Development/src/modules/auth/actions.ts).
* **Dữ liệu đọc/ghi**:
  * Ghi `auth.users` qua Supabase GoTrue Auth API.
  * Trigger ghi `public.profiles` (`id = auth.users.id`, `display_name`).
* **Quyền truy cập & Ranh giới bảo mật**:
  * Không truyền mật khẩu qua REST thông thường.
  * `handle_new_user()` chạy dưới quyền `security definer` để khởi tạo profile an toàn.
* **Nhánh lỗi**:
  * Trùng email ➔ Báo lỗi thân thiện.
  * Sai mật khẩu / email chưa xác minh ➔ Báo lỗi cụ thể không crash hệ thống.

---

## 2. Server-side Route Protection & Session Refresh Flow (Middleware)

```text
[HTTP Request]
   │
   ↓
[src/middleware.ts] ➔ updateSession() [src/lib/supabase/middleware.ts]
   │
   ├─ Đọc session cookies từ Request
   ├─ Gọi supabase.auth.getUser() (re-validate token trên auth server)
   │
   ├─ Phân loại tuyến đường:
   │    ├─ Unauthenticated truy cập /dashboard, /onboarding, /settings...
   │    │     └─ Copy refreshed cookies ➔ 307 Redirect tới /login?redirectTo=...
   │    │
   │    ├─ Authenticated truy cập /login, /register
   │    │     └─ Copy refreshed cookies ➔ 307 Redirect tới /dashboard
   │    │
   │    └─ Các tuyến đường hợp lệ
   │          └─ Tiếp tục NextResponse.next() mang theo cookie mới
```

* **Entry point**: [src/middleware.ts](file:///d:/AI_Product_Development/src/middleware.ts).
* **Ranh giới bảo mật**: Bảo vệ 100% ở tầng server edge trước khi render trang.
* **Đặc tính**: Tự động bảo toàn và chuyển tiếp token mới khi Supabase SSR làm mới phiên (cookie forwarding).

---

## 3. Onboarding Setup Flow (Thiết lập mục tiêu & Thời gian)

```text
[User on /onboarding]
   │
   ├─ (1) Tải trạng thái hiện tại: getOnboardingState()
   │      ├─ Đọc public.profiles (onboarding_completed_at) [maybeSingle]
   │      ├─ Đọc public.goals (status = 'active')
   │      └─ Đọc public.learner_preferences [maybeSingle]
   │
   └─ (2) Gửi thiết lập mới: saveOnboardingAction()
          ├─ Zod validation: onboardingSchema
          ├─ Xác thực danh tính: supabase.auth.getUser()
          ├─ UPSERT public.learner_preferences (daily_minutes, preferred_study_days)
          ├─ UPDATE public.goals SET status = 'archived' WHERE user_id = auth.uid()
          ├─ INSERT public.goals (1 Primary Goal + N Secondary Goals)
          │    * Ràng buộc: Partial unique index (user_id) WHERE priority='primary' AND status='active'
          └─ UPDATE public.profiles SET onboarding_completed_at = now()
```

* **Entry point**: [src/modules/onboarding/actions.ts](file:///d:/AI_Product_Development/src/modules/onboarding/actions.ts).
* **Dữ liệu đọc/ghi**:
  * `public.learner_preferences`: Lưu `daily_minutes`, `preferred_study_days` (được kiểm tra ràng buộc mảng ngày hợp lệ 1..7, không trùng lặp qua hàm `validate_study_days`).
  * `public.goals`: Lưu mục tiêu học tập, cô lập qua RLS, kiểm tra `target_level` hợp lệ theo CEFR và partial unique index cho primary active goal.
  * `public.profiles`: Đánh dấu `onboarding_completed_at`.
* **Ranh giới bảo mật & Toàn vẹn**:
  * RLS bảo vệ: Chỉ user sở hữu mới đọc/ghi được (`auth.uid() = user_id`). Direct client INSERT trên `public.profiles` bị vô hiệu hóa; hồ sơ được tạo bởi trigger hoặc server admin.
  * Database trigger `protect_profile_fields` (BEFORE INSERT OR UPDATE) kiểm tra ranh giới đặc quyền `is_admin_or_service_role()`:
    * Chặn người dùng thường tự gán hoặc sửa `estimated_level`.
    * Chặn gán `onboarding_completed_at` khi INSERT profile mới.
    * Chặn hủy hoặc sửa lại `onboarding_completed_at` sau khi đã hoàn thành.
    * Yêu cầu phải có mục tiêu chính (primary active goal) và `learner_preferences` trước khi cập nhật `onboarding_completed_at`.

---

## 4. Privilege Boundary & System-Managed Fields

```text
[Client / Authenticated Request]           [Backend / Service-Role Context]
         │ (auth.role() = 'authenticated')                 │ (role = 'service_role' / postgres)
         ↓                                                 ↓
   ┌─────────────────────────────────────────────────────────────┐
   │        Trigger: protect_profile_fields()                    │
   │        Kiểm tra: is_admin_or_service_role()                 │
   └─────────────────────────────────────────────────────────────┘
         │                                                 │
   [Non-Privileged]                                   [Privileged]
         │                                                 │
   - Block INSERT/UPDATE estimated_level              - Allow assessment engine updates
   - Block altering onboarding_completed_at           - Allow migration & administrative updates
   - Block altering immutable id                      - Full system control
```

* **Quy tắc phân quyền (Privilege Boundary)**:
  * Người dùng thường (`authenticated`, `anon` hoặc JWT role không xác định / NULL) không được phép sửa đổi `estimated_level` hoặc gian lận `onboarding_completed_at`.
  * Chỉ backend service với `service_role` (ví dụ: Assessment Engine ở Phase 2) hoặc quyền quản trị viên PostgreSQL (`postgres`, `supabase_admin`) mới có thể ghi nhận hoặc điều chỉnh các trường này.

