# Requirements — Authentication & User Management

**Module:** AUTH  
**Version:** 1.0  
**Status:** Draft

## 1. Mục tiêu

Cho phép người dùng tạo tài khoản, đăng nhập, đăng xuất và quản lý thông tin cá nhân một cách an toàn.

## 2. Functional Requirements

### AUTH-01 — Registration

User có thể đăng ký bằng:
- Email
- Password

Sau khi đăng ký:
1. Tạo account trong Supabase Auth.
2. Tạo user profile tương ứng trong database.
3. Chuyển user tới onboarding nếu chưa hoàn thành onboarding.

### AUTH-02 — Login

User có thể đăng nhập bằng email/password.

Hệ thống phải:
- Validate input.
- Hiển thị lỗi rõ ràng.
- Tạo authenticated session.
- Redirect user tới trang phù hợp.

### AUTH-03 — Logout

User có thể đăng xuất từ application.

Sau logout:
- Session được kết thúc.
- User không thể truy cập protected pages.

### AUTH-04 — Protected Routes

Các khu vực yêu cầu đăng nhập:

```text
/dashboard
/assessment
/learning
/practice
/progress
/tutor
/settings
```

Unauthenticated user phải được redirect về login.

### AUTH-05 — User Profile

Profile cơ bản:

```text
id
email
display_name
avatar_url
created_at
updated_at
onboarding_completed
```

### AUTH-06 — Password Security

Password không được lưu trực tiếp trong application database.

Supabase Auth chịu trách nhiệm authentication credentials.

### AUTH-07 — Authorization

Mỗi user chỉ được truy cập dữ liệu thuộc tài khoản của mình.

Database phải sử dụng Row Level Security (RLS).

## 3. Non-Functional Requirements

- Authentication phải hoạt động ổn định trên desktop và mobile web.
- Không expose secret key ở client.
- Supabase service-role key chỉ được sử dụng phía server.
- API phải kiểm tra authenticated user trước khi truy cập dữ liệu riêng tư.

## 4. Acceptance Criteria

- [ ] User đăng ký thành công.
- [ ] User đăng nhập thành công.
- [ ] User đăng xuất thành công.
- [ ] Protected routes không thể truy cập khi chưa đăng nhập.
- [ ] User profile được tạo sau registration.
- [ ] User chỉ đọc/sửa được dữ liệu của chính mình.
- [ ] RLS được bật cho các bảng chứa dữ liệu cá nhân.
