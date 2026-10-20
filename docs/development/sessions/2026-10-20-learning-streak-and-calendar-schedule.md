# Báo cáo phiên làm việc: Chuỗi ngày học (Learning Streak) & Ranh giới lịch ôn tập (Calendar-day Boundary)

- **Ngày thực hiện**: 2026-10-20
- **Nhánh Git**: `phase-6`
- **Mục tiêu**:
  1. Giải đáp và chuẩn hóa cách tính "now + 1 day" theo ranh giới ngày lịch (`Asia/Ho_Chi_Minh`, UTC+7) về đúng 00:00:00 của ngày hôm sau, tránh tình trạng học vào đêm muộn (ví dụ 23:30) khiến từ vựng bị trễ sang ngày kia mới đến hạn.
  2. Thiết kế và triển khai trọn vẹn tính năng **Chuỗi ngày học liên tục (Learning Streak Engine)** từ server logic, database migration, component UI đến kiểm thử tự động, tích hợp xuyên suốt Daily Plan, Lộ trình học và Sổ từ vựng.

---

## 1. Kết quả thực hiện

### A. Ranh giới lịch ôn tập (Calendar-Day Review Boundary)
- **Vấn đề trước đây**: Khi người học hoàn thành ôn từ lúc 23:30 ngày hôm nay và khoảng cách ôn tiếp theo là +1 ngày, nếu cộng cơ học `now() + 1 day` thì mốc ôn sẽ rơi vào 23:30 ngày mai. Do đó vào sáng ngày mai, từ vựng chưa đến hạn (`next_review_at > now()`), khiến người học mở app vào buổi sáng không thấy từ để ôn.
- **Giải pháp triển khai**:
  - Viết thuật toán `calculateNextCalendarReviewDate(intervalDays, asOfDate, timeZone)` trong [src/modules/vocabulary/schedule.ts](file:///d:/AI_Product_Development/src/modules/vocabulary/schedule.ts).
  - Thuật toán xác định chính xác ngày hiện tại theo giờ Việt Nam (`Asia/Ho_Chi_Minh`, UTC+7), cộng thêm `N` ngày theo lịch, và đặt mốc giờ về đúng **`00:00:00` sáng** của ngày đích (`2026-10-20T17:00:00.000Z` cho ngày `2026-10-21 00:00:00+07:00`).
  - Hỗ trợ cả hai chế độ: `calendarDay: true` (mặc định) và `calendarDay: false` (giữ nguyên khoảng cách chính xác theo phút/giờ cho các bài test khoảng cách ngắn).

### B. Động cơ Chuỗi ngày học liên tục (Learning Streak Engine)
Được đóng gói gọn gàng trong module độc lập `src/modules/streak`:
1. [src/modules/streak/types.ts](file:///d:/AI_Product_Development/src/modules/streak/types.ts): Định nghĩa kiểu dữ liệu `StreakInfo`, `StreakUpdateResult`, `StreakStatus`, `StudyActivityType`.
2. [src/modules/streak/calculator.ts](file:///d:/AI_Product_Development/src/modules/streak/calculator.ts):
   - `getLocalDateString(date, timeZone)`: Chuyển đổi timestamp thành `YYYY-MM-DD` theo múi giờ chỉ định (`Asia/Ho_Chi_Minh`).
   - `getYesterdayDateString(dateStr)`: Tính ngày hôm trước chuẩn xác qua chuyển đổi UTC, xử lý an toàn các ranh giới đầu tháng, đầu năm và năm nhuận.
   - `computeStreakUpdate(profile, activityDate, timeZone)`: Hàm thuần túy không side-effects xác định quy tắc chuỗi:
     - **Ngày đầu tiên**: Chuỗi khởi đầu là 1 (`current_streak = 1`, `isExtended = true`).
     - **Học nhiều lần trong cùng một ngày**: Giữ nguyên chuỗi, không cộng trùng (`isAlreadyStudiedToday = true`).
     - **Học liên tiếp ngày kế tiếp**: Tăng chuỗi thêm 1 (`current_streak += 1`, cập nhật `longest_streak = max(longest, current_streak)`).
     - **Bỏ lỡ từ 1 ngày trở lên**: Đặt lại chuỗi về 1 (`current_streak = 1`), vẫn bảo toàn kỷ lục `longest_streak`.
   - `resolveStreakDisplay(profile, asOfDate, timeZone)`: Kiểm tra trạng thái học hôm nay của người dùng để trả về trạng thái hiển thị huy hiệu (`active` / `pending`).
3. [src/modules/streak/services.ts](file:///d:/AI_Product_Development/src/modules/streak/services.ts):
   - `getUserStreak(userId)`: Lấy thông tin chuỗi hiện tại của người dùng kèm cờ `hasStudiedToday`.
   - `recordStudyActivity(userId, activityType, activityDate)`: Cập nhật server-side có locking, fallback in-memory cho môi trường test tự động, ghi telemetry vào `learning_events` (non-blocking).
4. [src/modules/streak/actions.ts](file:///d:/AI_Product_Development/src/modules/streak/actions.ts): Server Action `getUserStreakAction` xác thực an toàn qua Supabase SSR Auth.

### C. Tích hợp đa kênh (Cross-Module Integration)
- **Daily Plan Practice**: Hoàn thành bài tập Daily Plan (`src/modules/daily-plan/services.ts`) tự động gọi `recordStudyActivity(userId, 'practice')`.
- **Vocabulary Review**: Nộp kết quả phiên ôn tập Flashcard (`src/modules/vocabulary/services.ts`) tự động gọi `recordStudyActivity(userId, 'vocabulary_review', reviewDate)`.
- **Database Atomic RPC**: Cập nhật hàm RPC `submit_vocabulary_review_session` trong file migration [supabase/migrations/20261020_streak_and_calendar_schedule.sql](file:///d:/AI_Product_Development/supabase/migrations/20261020_streak_and_calendar_schedule.sql) để tính ranh giới 00:00:00 UTC+7 và cập nhật `profiles.current_streak` nguyên tử trong cùng transaction Postgres.

### D. Giao diện người dùng (UI / UX)
- [src/components/layout/navbar.tsx](file:///d:/AI_Product_Development/src/components/layout/navbar.tsx):
  - Hiển thị badge trực quan trên thanh điều hướng:
    - `🔥 {streak} ngày` khi đã học trong ngày hôm nay.
    - `🕯️ {streak} ngày` kèm viền xám mờ và tooltip nhắc nhở khi chưa hoàn thành bài học hôm nay.
- [src/app/(app)/dashboard/page.tsx](file:///d:/AI_Product_Development/src/app/(app)/dashboard/page.tsx):
  - Bổ sung Thẻ Chuỗi ngày học (Streak Hero Card) nổi bật:
    - Hiển thị số ngày liên tục lớn, kỷ lục chuỗi dài nhất (`Kỷ lục: X ngày`).
    - Banner trạng thái: Xanh lá chúc mừng khi đã hoàn thành mục tiêu ngày; Vàng cam nhắc nhở khi chuỗi đang chờ duy trì.
- Đồng bộ hiển thị Streak trên tất cả các trang:
  - Dashboard: [src/app/(app)/dashboard/page.tsx](file:///d:/AI_Product_Development/src/app/(app)/dashboard/page.tsx)
  - Vocabulary: [src/app/(app)/vocabulary/page.tsx](file:///d:/AI_Product_Development/src/app/(app)/vocabulary/page.tsx)
  - Daily Plan: [src/app/(app)/daily-plan/page.tsx](file:///d:/AI_Product_Development/src/app/(app)/daily-plan/page.tsx)
  - Learning Path: [src/app/(app)/learning-path/page.tsx](file:///d:/AI_Product_Development/src/app/(app)/learning-path/page.tsx)
  - Practice Session: [src/app/(app)/daily-plan/practice/[taskId]/page.tsx](file:///d:/AI_Product_Development/src/app/(app)/daily-plan/practice/[taskId]/page.tsx)

---

## 2. Danh sách file đã tạo / chỉnh sửa

| Thao tác | Đường dẫn file | Mô tả |
| :--- | :--- | :--- |
| **Mới** | [src/modules/streak/types.ts](file:///d:/AI_Product_Development/src/modules/streak/types.ts) | Định nghĩa TypeScript types cho Streak Engine |
| **Mới** | [src/modules/streak/calculator.ts](file:///d:/AI_Product_Development/src/modules/streak/calculator.ts) | Pure functions tính toán ngày lịch UTC+7 và chuyển đổi chuỗi |
| **Mới** | [src/modules/streak/services.ts](file:///d:/AI_Product_Development/src/modules/streak/services.ts) | Business logic ghi nhận chuỗi và truy vấn hồ sơ |
| **Mới** | [src/modules/streak/actions.ts](file:///d:/AI_Product_Development/src/modules/streak/actions.ts) | Server Action kiểm tra chuỗi cho UI |
| **Mới** | [supabase/migrations/20261020_streak_and_calendar_schedule.sql](file:///d:/AI_Product_Development/supabase/migrations/20261020_streak_and_calendar_schedule.sql) | Migration thêm cột chuỗi và RPC lịch ôn ngắt quãng |
| **Mới** | [tests/streak/learning_streak.test.mjs](file:///d:/AI_Product_Development/tests/streak/learning_streak.test.mjs) | 7 bài test chuyên sâu cho chuỗi ngày học |
| **Sửa** | [src/modules/vocabulary/schedule.ts](file:///d:/AI_Product_Development/src/modules/vocabulary/schedule.ts) | Tích hợp thuật toán tính ranh giới 00:00:00 UTC+7 |
| **Sửa** | [src/modules/vocabulary/services.ts](file:///d:/AI_Product_Development/src/modules/vocabulary/services.ts) | Tự động kích hoạt chuỗi khi hoàn thành phiên ôn tập |
| **Sửa** | [src/modules/daily-plan/services.ts](file:///d:/AI_Product_Development/src/modules/daily-plan/services.ts) | Tự động kích hoạt chuỗi khi hoàn thành bài tập tương tác |
| **Sửa** | [src/modules/profile/types.ts](file:///d:/AI_Product_Development/src/modules/profile/types.ts) | Bổ sung `current_streak`, `longest_streak`, `last_study_date` |
| **Sửa** | [src/components/layout/navbar.tsx](file:///d:/AI_Product_Development/src/components/layout/navbar.tsx) | Hiển thị badge ngọn lửa trạng thái chuỗi |
| **Sửa** | [src/app/(app)/dashboard/page.tsx](file:///d:/AI_Product_Development/src/app/(app)/dashboard/page.tsx) | Thêm card Chuỗi ngày học và truyền prop streak |
| **Sửa** | [src/app/(app)/vocabulary/page.tsx](file:///d:/AI_Product_Development/src/app/(app)/vocabulary/page.tsx) | Truyền prop streak cho Navbar |
| **Sửa** | [src/app/(app)/daily-plan/page.tsx](file:///d:/AI_Product_Development/src/app/(app)/daily-plan/page.tsx) | Truyền prop streak cho Navbar |
| **Sửa** | [src/app/(app)/learning-path/page.tsx](file:///d:/AI_Product_Development/src/app/(app)/learning-path/page.tsx) | Truyền prop streak cho Navbar |
| **Sửa** | [src/app/(app)/daily-plan/practice/[taskId]/page.tsx](file:///d:/AI_Product_Development/src/app/(app)/daily-plan/practice/[taskId]/page.tsx) | Truyền prop streak cho Navbar |
| **Sửa** | [tests/vocabulary/vocabulary_review_lifecycle.test.mjs](file:///d:/AI_Product_Development/tests/vocabulary/vocabulary_review_lifecycle.test.mjs) | Cập nhật assertion kiểm tra đúng mốc 00:00:00 UTC+7 |
| **Sửa** | [docs/architecture/DATABASE_SCHEMA.md](file:///d:/AI_Product_Development/docs/architecture/DATABASE_SCHEMA.md) | Tài liệu hóa các cột streak trên `public.profiles` |
| **Sửa** | [docs/architecture/DATA_FLOWS.md](file:///d:/AI_Product_Development/docs/architecture/DATA_FLOWS.md) | Tài liệu hóa Luồng 9: Ghi nhận Chuỗi ngày học tự động |
| **Sửa** | [docs/development/PROJECT_STATE.md](file:///d:/AI_Product_Development/docs/development/PROJECT_STATE.md) | Cập nhật tổng thể tiến độ |

---

## 3. Quyết định kỹ thuật quan trọng

1. **Chuẩn hóa ranh giới ngày lịch thay vì trôi thời gian (Drifting Interval)**:
   - Nếu dùng `now() + 24 hours`, người học càng học muộn thì giờ ôn tập ngày hôm sau càng bị đẩy lùi, cuối cùng vượt sang ngày kế tiếp.
   - Làm tròn về `00:00:00` sáng (`Asia/Ho_Chi_Minh`) đảm bảo bất kỳ thời điểm nào trong ngày hôm sau người học mở ứng dụng đều thấy từ vựng sẵn sàng để ôn.
2. **Zero-Trust Streak Security**:
   - Chuỗi ngày học hoàn toàn không thể bị làm giả từ client request.
   - Client chỉ gửi hành động học tập (nộp bài tập Daily Plan hoặc nộp phiên Flashcard). Server tự trích xuất danh tính từ JWT auth cookie và tính toán thời gian `now()` phía server.
3. **Idempotent Multi-study & Timezone-Resilient Streak Calculation**:
   - Việc học nhiều lần trong cùng một ngày (`last_study_date === today`) được đánh dấu `isAlreadyStudiedToday: true` và không bao giờ làm tăng chuỗi quá 1 lần/ngày.
   - Tính toán ngày bằng chuỗi định dạng chuẩn ISO `YYYY-MM-DD` tại múi giờ mục tiêu (`Asia/Ho_Chi_Minh`), độc lập với múi giờ máy chủ cloud (thường chạy UTC).

---

## 4. Bằng chứng kiểm thử

- **Toàn bộ Test Suite**: `npm test`
  - Kết quả: **133 / 133 tests passed** trên 11 test suites (0 fail, 0 skip).
  - Bao gồm 7 test mới trong [tests/streak/learning_streak.test.mjs](file:///d:/AI_Product_Development/tests/streak/learning_streak.test.mjs):
    1. Bắt đầu chuỗi từ 0 -> 1 ngày.
    2. Học nhiều bài trong cùng 1 ngày -> Giữ nguyên chuỗi 1 ngày.
    3. Học liên tiếp ngày hôm sau -> Tăng chuỗi lên 2 ngày.
    4. Bỏ lỡ 1 ngày -> Chuỗi quay về 1, bảo lưu `longest_streak`.
    5. Xử lý chính xác bước chuyển tháng (31/01 -> 01/02) và năm nhuận.
    6. Tích hợp thực tế qua `recordStudyActivity` với mock storage.
    7. Tích hợp thực tế: Hoàn thành bài tập Daily Plan tự động kích hoạt chuỗi.
- **Kiểm tra TypeScript**: `npx tsc --noEmit` -> Exit code 0 (không có bất kỳ lỗi type nào).
- **Kiểm tra Linter**: `npm run lint` -> Exit code 0 (clean).

---

## 5. Trạng thái Migration Database

- **Code đã triển khai**: Toàn bộ UI, Server Actions, Services, Tests đã hoạt động ổn định và sẵn sàng chạy trên Local Dev.
- **Migration đã tạo**:
  - [supabase/migrations/20261020_streak_and_calendar_schedule.sql](file:///d:/AI_Product_Development/supabase/migrations/20261020_streak_and_calendar_schedule.sql)
- **Lưu ý triển khai Production / Remote Supabase**:
  - Nếu muốn đồng bộ các cột `current_streak`, `longest_streak`, `last_study_date` vào cơ sở dữ liệu Supabase đám mây, hãy copy nội dung file migration trên và chạy trong **Supabase Dashboard > SQL Editor**.

---

## 6. Lỗi còn tồn tại & Bước tiếp theo

- **Lỗi tồn tại**: Không có lỗi tồn tại.
- **Bước tiếp theo**:
  - Hướng dẫn người dùng kiểm tra giao diện và tính năng trên trình duyệt (`http://localhost:3000`).
  - Chuẩn bị bước đệm chuyển sang **Phase 7 — Speaking & Pronunciation Practice** khi người dùng có yêu cầu.
