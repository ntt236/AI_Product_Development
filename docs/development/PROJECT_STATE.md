# Project State — AI English Learning Platform

**Last Updated:** 2026-10-20  
**Active Branch:** `phase-6`  
**Current Phase:** Phase 6 — Vocabulary Review + Learning Streak Engine + Comprehensive UI/UX Redesign (Triều-FE Design System)  
**Next Phase:** Phase 7 — Speaking & Pronunciation Practice (Roadmap-aligned)  

---

## 1. Trạng thái mã nguồn & kiến trúc
- **Framework**: Next.js 15.5.27 (App Router), React 19, TypeScript strict mode.
- **Styling & Design System**: Tailwind CSS v3.4.17 (PostCSS + Autoprefixer) + Hệ thống UI Component chuẩn hóa theo phong cách shadcn/ui:
  - `tailwind.config.ts`: Cấu hình semantic design tokens HSL (`background`, `foreground`, `card`, `primary`, `secondary`, `muted`, `accent`, `destructive`, `border`, `input`, `ring`), radius tokens, responsive breakpoints, keyframe animations (`fade-in`, `slide-in-from-top`).
  - `src/app/globals.css`: Kiến trúc CSS layers `@tailwind base; components; utilities;`, dark-mode HSL variables, radial glow backgrounds, scrollbar tùy biến, glass-panel utilities.
  - `src/lib/utils.ts`: Tiện ích gộp class `cn()` sử dụng `clsx` và `tailwind-merge`.
  - `src/components/ui/`: Thư viện components tái sử dụng:
    - `button.tsx`: CVA variants (`default`, `secondary`, `outline`, `ghost`, `destructive`, `success`, `link`), sizes (`default`, `sm`, `lg`, `icon`), tích hợp `asChild` và `isLoading` spinner.
    - `card.tsx`: `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`, tùy chọn `hoverGlow`.
    - `badge.tsx`: CVA variants (`default`, `secondary`, `success`, `warning`, `info`, `destructive`, `outline`).
    - `input.tsx`: Input trường dữ liệu với focus ring và trạng thái error.
    - `progress.tsx`: Thanh tiến độ với gradient indicators mượt mà.
    - `state-feedback.tsx`: Chuẩn hóa 5 trạng thái giao diện: `LoadingState`, `EmptyState`, `ErrorState`, `SuccessState`, `Skeleton`.
    - `logout-button.tsx`: Nút đăng xuất đồng bộ giao diện.
- **Giao diện người dùng đã được hiện đại hóa toàn diện**:
  - `src/components/layout/navbar.tsx`: Header dính hiệu ứng kính mờ (glassmorphism), active route pill indicators, huy hiệu chuỗi học animated `🔥 X ngày`, avatar người dùng và mobile drawer cho thiết bị di động.
  - `src/app/page.tsx`: Landing page hiện đại với hero banner, sơ đồ 7 bước Core Learning Loop, lưới tính năng nổi bật và thẻ kiến trúc an toàn.
  - `src/app/(app)/dashboard/page.tsx`: Trung tâm học tập thiết kế lại với lời chào theo buổi, lưới 4 thẻ chỉ số tiến độ cốt lõi, bố cục 2 cột cân đối, danh sách nhiệm vụ Daily Plan với reorder, Learning Path spotlight, widget Spaced Repetition và thẻ mục tiêu cá nhân.
  - `src/app/(app)/daily-plan/`: Shell trang và view kế hoạch ngày với thẻ bài tập kéo thả/di chuyển, huy hiệu kỹ năng, modal giáo trình đang chuẩn bị, loại bỏ 100% inline style.
  - `src/app/(app)/learning-path/`: Lộ trình học 3 Milestones với timeline trực quan, accordion thu gọn/mở rộng mô-đun, chế độ tùy chỉnh thứ tự bài học với kiểm soát snapshot bất biến, phân tích hồ sơ năng lực 4 kỹ năng và lịch sử phiên bản.
  - `src/app/(app)/vocabulary/`: Sổ từ vựng và ôn tập phản xạ với Flashcard lật 3D 2 mặt, nút Chưa nhớ / Đã nhớ phân màu trực quan, bảng tổng kết lịch ôn tập ngắt quãng tự động, bộ lọc tìm kiếm sổ từ cá nhân và kho từ vựng giáo trình tiêu chuẩn.
  - `src/app/(auth)/login/` & `register/`: Form đăng nhập / đăng ký tối giản, sạch sẽ, bảo mật với icon trực quan.
  - `src/app/(app)/assessment/`: Trang giới thiệu và kích hoạt bài kiểm tra đầu vào chuẩn CEFR.
  - `src/app/(app)/onboarding/`: Quy trình 3 bước thiết lập mục tiêu và thời gian học với thanh tiến trình số, thẻ lựa chọn có hiệu ứng phát sáng.
- **Kiến trúc Backend & Modules**: Modular Monolith:
  - `src/modules/auth`, `src/modules/profile`, `src/modules/onboarding`, `src/modules/assessment`, `src/modules/learning-path`, `src/modules/daily-plan`, `src/modules/ai-tutor`, `src/modules/vocabulary`, `src/modules/streak`.

---

## 2. Trạng thái Database Schema & Migration
- **Phase 1 đến 5**: Đã hoàn thành và kiểm thử.
- **Phase 6 (Vocabulary Review & Learning Streak)**:
  - [supabase/migrations/20261019_phase_6_vocabulary_review.sql](file:///d:/AI_Product_Development/supabase/migrations/20261019_phase_6_vocabulary_review.sql)
  - [supabase/migrations/20261020_streak_and_calendar_schedule.sql](file:///d:/AI_Product_Development/supabase/migrations/20261020_streak_and_calendar_schedule.sql)
  - RPC nguyên tử `submit_vocabulary_review_session` với bảo vệ chống gửi trùng, `SET search_path = ''`, khóa bản ghi nguyên tử và cập nhật streak đồng thời.

---

## 3. Trạng thái kiểm thử & Bằng chứng thực tế
- `npm test`: Exit code 0 (**133/133 tests passed** across 11 suites, 0 fail, 0 skip).
- `npx tsc --noEmit`: Exit code 0 (TypeScript strict mode hoàn toàn sạch lỗi, 0 error).
- `npm run lint`: Exit code 0 (**✔ No ESLint warnings or errors**).

---

## 4. Việc cần làm tiếp theo (Next Action)
- Triển khai chạy thử toàn diện trên trình duyệt (Desktop, Tablet, Mobile) và xác nhận độ hoàn thiện thẩm mỹ.
- Sẵn sàng chuyển tiếp sang **Phase 7 — Speaking & Pronunciation Practice** theo roadmap chính thức khi có yêu cầu.
