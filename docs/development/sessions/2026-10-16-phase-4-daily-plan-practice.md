# Báo Cáo Phiên Làm Việc: Triển Khai Toàn Bộ Phase 4 (Daily Plan + Practice)

**Ngày thực hiện:** 2026-10-16  
**Nhánh:** `phase-4`  
**Mục tiêu:** Triển khai toàn bộ Phase 4: Kế hoạch học tập hàng ngày (Daily Plan) & Luyện tập tương tác (Practice Session) kết nối với Learning Path, phân bổ thời gian học thông minh, chấm điểm bài tập an toàn phía server, và ghi nhận bằng chứng học tập mà không ghi đè lộ trình của người học.

---

## 1. Kết quả triển khai theo Vertical Slices

### Slice 4.1 — Database Migration, Seed Nội Dung Chuẩn & RLS Isolation
- **Tạo migration file**: [supabase/migrations/20261016_phase_4_daily_plan_practice.sql](file:///d:/AI_Product_Development/supabase/migrations/20261016_phase_4_daily_plan_practice.sql)
- **Các bảng cốt lõi**:
  - `public.content_items`: Kho bài học lý thuyết/từ vựng/ngữ pháp (`slug`, `content_type`, `skill`, `target_level`, `estimated_minutes`, `is_published`, `content_status`, `metadata`).
  - `public.practice_exercises`: Câu hỏi, dạng bài (`multiple_choice`), nội dung câu hỏi (`prompt`), các lựa chọn (`options`), điểm số (`points`).
  - `public.practice_exercise_answers`: **SERVER-ONLY PRIVATE TABLE**. Lưu đáp án đúng (`correct_answer`) và lời giải thích sư phạm (`explanation`).
  - `public.daily_plans`: Kế hoạch học ngày của người học (`user_id`, `plan_date`, `target_minutes`, `status`, `generation_reason`, unique index `uq_user_daily_plan_date`).
  - `public.daily_plan_tasks`: Các bài học/nhiệm vụ trong ngày (`daily_plan_id`, `learning_path_item_id`, `content_item_id`, `activity_type`, `skill`, `position`, `estimated_minutes`, `content_status`, `status`, `skip_reason`).
  - `public.practice_submissions`: Lịch sử nộp bài luyện tập (`raw_score`, `max_score`, `score_percentage`, `time_spent_seconds`, `user_answers`, `feedback_summary`).
  - `public.learning_events` & `public.learning_evidence`: Ghi nhận sự kiện học tập và bằng chứng đánh giá năng lực theo từng kỹ năng.
- **Quy tắc nội dung thực tế & Chống bài học giả (Content Honesty)**:
  - Seed 2 nội dung bài học thực nghiệm chất lượng cao:
    1. *Từ vựng sinh hoạt hàng ngày* (`vocab-daily-routine`): 6 từ vựng cốt lõi, phiên âm IPA, nghĩa tiếng Việt và ví dụ câu minh họa.
    2. *Ngữ pháp Thì hiện tại đơn* (`grammar-present-simple`): Quy tắc, cấu trúc khẳng định/phủ định/nghi vấn, quy tắc thêm s/es và ví dụ thực tế.
  - Seed 10 câu hỏi trắc nghiệm tương tác hoàn chỉnh, đi kèm đáp án đúng và lời giải thích chi tiết trong bảng riêng biệt.
  - Các chủ đề chưa có bài tập tương tác được gắn nhãn minh bạch `planned_curriculum`, không tạo bài tập giả hay điểm ảo.
- **Bảo vệ Zero-Trust & RLS Isolation**:
  - Bảng `practice_exercise_answers` **KHÔNG CÓ SELECT POLICY** cho role `authenticated`. Client hoàn toàn không thể truy vấn đáp án trước khi làm bài.
  - Quyền INSERT/UPDATE/DELETE trên toàn bộ bảng kế hoạch và bài tập bị thu hồi khỏi role `authenticated`. Mọi thao tác ghi được thực hiện an toàn qua Server Actions / Admin Client.

### Slice 4.2 — Deterministic Daily Plan Generator Engine
- **Mã nguồn**:
  - [src/modules/daily-plan/types.ts](file:///d:/AI_Product_Development/src/modules/daily-plan/types.ts): Định nghĩa kiểu dữ liệu hoàn chỉnh, tương thích toàn bộ hệ thống.
  - [src/modules/daily-plan/generator.ts](file:///d:/AI_Product_Development/src/modules/daily-plan/generator.ts):
    - **Quản lý ngân sách thời gian**: Nhận `daily_minutes` từ cấu hình người học (mặc định 30 phút), phân bổ nhiệm vụ chính xác không vượt quá ngân sách.
    - **Nhận diện lịch học**: Khớp ngày trong tuần với `preferred_study_days` (0=CN .. 6=T7). Nếu học ngoài lịch, đánh dấu lý do `flexible_catchup`.
    - **Ưu tiên Topic từ Learning Path**: Quét các topic đang ở trạng thái `available` từ Learning Path đang kích hoạt (`active`).
    - **Minh bạch nội dung**: Nếu topic khớp với kho bài tập có sẵn (`vocab-daily-routine`, `grammar-present-simple`), gắn nhãn `available`. Các topic khác duy trì nhãn `planned_curriculum`.
    - **Tính xác định 100% (Deterministic)**: Cùng dữ liệu đầu vào luôn sinh ra cùng kế hoạch ngày.

### Slice 4.3 — Services, Server Actions, Server-Side Scoring & Evidence Persistence
- **Mã nguồn**:
  - [src/modules/daily-plan/services.ts](file:///d:/AI_Product_Development/src/modules/daily-plan/services.ts):
    - `getDailyPlan()` & `getOrCreateTodayDailyPlan()`: Tải hoặc khởi tạo tự động kế hoạch ngày hôm nay.
    - `reorderDailyTasks()`: Sắp xếp lại thứ tự nhiệm vụ trong ngày, kiểm tra tính toàn vẹn của danh sách task IDs.
    - `skipDailyTask()`: Bỏ qua nhiệm vụ, lưu lý do và tự động cập nhật trạng thái của plan.
    - `getContentItemWithExercises()`: Đọc bài học và câu hỏi, **loại bỏ hoàn toàn đáp án đúng** trước khi gửi về client.
    - `submitPracticeAnswers()`: Chấm điểm trên server, so sánh chuẩn hóa (case-insensitive, trim), tính % điểm, ghi nhận `practice_submissions`, `learning_evidence` và `learning_events`, cập nhật trạng thái nhiệm vụ `daily_plan_tasks` và tiến độ `daily_plans`, tự động mở khóa topic kế tiếp trong Learning Path (`unlockNextTopicInLearningPath`).
  - [src/modules/daily-plan/actions.ts](file:///d:/AI_Product_Development/src/modules/daily-plan/actions.ts):
    - 5 Server Actions an toàn: `getTodayDailyPlanAction`, `reorderDailyTasksAction`, `skipDailyTaskAction`, `getPracticeContentAction`, `submitPracticeAction`.
    - Runtime validation bằng Zod schema, xác thực danh tính người dùng qua `supabase.auth.getUser()`.

### Slice 4.4 — Giao Diện Người Dùng & Tích Hợp Hệ Thống
- **Mã nguồn**:
  - [src/components/layout/navbar.tsx](file:///d:/AI_Product_Development/src/components/layout/navbar.tsx): Thêm mục "📅 Kế hoạch ngày" (`/daily-plan`) trên Navbar chính.
  - [src/app/(app)/dashboard/page.tsx](file:///d:/AI_Product_Development/src/app/(app)/dashboard/page.tsx): Thêm thẻ tiêu điểm Kế hoạch hôm nay với thanh tiến độ hoàn thành, số phút mục tiêu, số bài còn lại và nút "Bắt đầu học ngay".
  - [src/app/(app)/daily-plan/page.tsx](file:///d:/AI_Product_Development/src/app/(app)/daily-plan/page.tsx) & [src/app/(app)/daily-plan/daily-plan-view.tsx](file:///d:/AI_Product_Development/src/app/(app)/daily-plan/daily-plan-view.tsx):
    - Header kế hoạch ngày với ngày học, mục tiêu phút, cờ lịch học.
    - Thanh tiến độ động (Dynamic Progress Bar) hiển thị số nhiệm vụ hoàn thành / bỏ qua / còn lại.
    - Danh sách thẻ bài học: nhãn kỹ năng, thời lượng, trạng thái (`pending`, `completed`, `skipped`), nhãn nội dung (`✅ Có bài tập tương tác` hoặc `📋 Chương trình dự kiến`).
    - Nút di chuyển vị trí lên / xuống để reorder nhiệm vụ trong ngày.
    - Nút "Bỏ qua" với modal xác nhận và nhập lý do.
    - Modal thông báo minh bạch cho các chủ đề `planned_curriculum` kèm cam kết không tạo bài học giả.
  - [src/app/(app)/daily-plan/practice/[taskId]/page.tsx](file:///d:/AI_Product_Development/src/app/(app)/daily-plan/practice/[taskId]/page.tsx) & [src/app/(app)/daily-plan/practice/[taskId]/practice-session-view.tsx](file:///d:/AI_Product_Development/src/app/(app)/daily-plan/practice/[taskId]/practice-session-view.tsx):
    - Trình học tập 3 bước mượt mà:
      1. **Bước 1: Học lý thuyết & từ vựng**: Thẻ từ vựng IPA, định nghĩa, ví dụ hoặc bảng công thức ngữ pháp trực quan.
      2. **Bước 2: Luyện tập tương tác**: Bộ câu hỏi trắc nghiệm kèm thanh tiến độ câu hỏi, hỗ trợ điều hướng câu trước/sau và chọn đáp án tức thì.
      3. **Bước 3: Kết quả & Phản hồi sư phạm**: Vòng tròn điểm số (0–100%), tỷ lệ chính xác, thời gian hoàn thành, phân tích chi tiết từng câu (câu bạn chọn, đáp án đúng, giải thích sư phạm chi tiết).

---

## 2. Kết quả kiểm thử & Kiểm chứng chất lượng

Tất cả các lệnh kiểm tra chất lượng đều vượt qua 100%:

| Lệnh | Kết quả | Chi tiết |
|---|---|---|
| `npm test` | **PASS (68/68 tests)** | 6 test suites, 0 fail, 0 skip. Thêm 12 tests mới cho Phase 4 Generator & Practice Scoring Lifecycle. |
| `npx tsc --noEmit` | **PASS** | Exit code 0, TypeScript strict mode hoàn toàn sạch lỗi. |
| `npm run lint` | **PASS** | Exit code 0, "No ESLint warnings or errors". |
| `npm run build` | **PASS** | Next.js production build thành công 12/12 routes bao gồm static và dynamic `/daily-plan`, `/daily-plan/practice/[taskId]`. |

### Chi tiết các bộ test mới được bổ sung trong Phase 4:
1. `tests/daily-plan/daily_plan_generator.test.mjs`:
   - Khớp lịch học theo `preferred_study_days` và gắn nhãn `flexible_catchup` khi học ngoài lịch.
   - Phân bổ ngân sách thời gian học chính xác theo `daily_minutes`.
   - Ưu tiên topic đã mở khóa từ Learning Path active.
   - Minh bạch nội dung: phân định rạch ròi `available` và `planned_curriculum`.
   - Tính xác định (deterministic): 100% cùng input ra cùng danh sách task.
2. `tests/daily-plan/practice_and_lifecycle.test.mjs`:
   - Chấm điểm bài tập chính xác: 100% điểm khi trả lời đúng toàn bộ.
   - Chấm điểm từng phần: phản hồi chi tiết giải thích cho từng câu sai.
   - Xử lý câu trả lời bỏ trống an toàn.
   - Chống phân biệt hoa thường và khoảng trắng thừa (`trim()`).
   - Kiểm tra tính toàn vẹn khi sắp xếp lại danh sách task (từ chối mảng thiếu hoặc ID giả mạo).
   - Tự động tính toán lại trạng thái kế hoạch ngày (`planned` -> `in_progress` -> `partially_completed` -> `completed`).

---

## 3. Danh sách tệp đã tạo hoặc chỉnh sửa trong Phase 4

- **Migration**:
  - [supabase/migrations/20261016_phase_4_daily_plan_practice.sql](file:///d:/AI_Product_Development/supabase/migrations/20261016_phase_4_daily_plan_practice.sql) *(mới)*
- **Core Module**:
  - [src/modules/daily-plan/types.ts](file:///d:/AI_Product_Development/src/modules/daily-plan/types.ts) *(mới)*
  - [src/modules/daily-plan/generator.ts](file:///d:/AI_Product_Development/src/modules/daily-plan/generator.ts) *(mới)*
  - [src/modules/daily-plan/services.ts](file:///d:/AI_Product_Development/src/modules/daily-plan/services.ts) *(mới)*
  - [src/modules/daily-plan/actions.ts](file:///d:/AI_Product_Development/src/modules/daily-plan/actions.ts) *(mới)*
- **Unit & Lifecycle Tests**:
  - [tests/daily-plan/daily_plan_generator.test.mjs](file:///d:/AI_Product_Development/tests/daily-plan/daily_plan_generator.test.mjs) *(mới)*
  - [tests/daily-plan/practice_and_lifecycle.test.mjs](file:///d:/AI_Product_Development/tests/daily-plan/practice_and_lifecycle.test.mjs) *(mới)*
- **UI Components & Pages**:
  - [src/components/layout/navbar.tsx](file:///d:/AI_Product_Development/src/components/layout/navbar.tsx) *(cập nhật)*
  - [src/app/(app)/dashboard/page.tsx](file:///d:/AI_Product_Development/src/app/(app)/dashboard/page.tsx) *(cập nhật)*
  - [src/app/(app)/daily-plan/page.tsx](file:///d:/AI_Product_Development/src/app/(app)/daily-plan/page.tsx) *(mới)*
  - [src/app/(app)/daily-plan/daily-plan-view.tsx](file:///d:/AI_Product_Development/src/app/(app)/daily-plan/daily-plan-view.tsx) *(mới)*
  - [src/app/(app)/daily-plan/practice/[taskId]/page.tsx](file:///d:/AI_Product_Development/src/app/(app)/daily-plan/practice/[taskId]/page.tsx) *(mới)*
  - [src/app/(app)/daily-plan/practice/[taskId]/practice-session-view.tsx](file:///d:/AI_Product_Development/src/app/(app)/daily-plan/practice/[taskId]/practice-session-view.tsx) *(mới)*
- **Documentation**:
  - [docs/development/PROJECT_STATE.md](file:///d:/AI_Product_Development/docs/development/PROJECT_STATE.md) *(cập nhật)*
  - [docs/architecture/DATA_FLOWS.md](file:///d:/AI_Product_Development/docs/architecture/DATA_FLOWS.md) *(cập nhật)*
  - [docs/architecture/DATABASE_SCHEMA.md](file:///d:/AI_Product_Development/docs/architecture/DATABASE_SCHEMA.md) *(cập nhật)*
  - [docs/development/sessions/2026-10-16-phase-4-daily-plan-practice.md](file:///d:/AI_Product_Development/docs/development/sessions/2026-10-16-phase-4-daily-plan-practice.md) *(mới)*

---

## 4. Trạng thái Migration và Cơ sở dữ liệu Remote

> [!IMPORTANT]
> **Tuân thủ quy tắc bảo vệ dữ liệu:** Agent không tự ý gọi REST/CLI để chạy migration trực tiếp lên Supabase remote.
> Hai migration sau đã sẵn sàng trong repository và cần được áp dụng theo thứ tự trên Supabase Dashboard -> SQL Editor:
> 1. `supabase/migrations/20261015_phase_3_learning_path.sql`
> 2. `supabase/migrations/20261016_phase_4_daily_plan_practice.sql`

---

## 5. Giới hạn đã biết (Known Limitations) & Bước hành động tiếp theo

- **Giới hạn đã biết**:
  - Kho bài tập tương tác hiện tại được tạo dựng ở mức vertical slice hoàn chỉnh gồm 2 bài học thực nghiệm (Từ vựng Daily Routine và Ngữ pháp Present Simple với 10 bài tập trắc nghiệm). Các chủ đề khác trong khung chương trình CEFR được đánh dấu `planned_curriculum` để bảo đảm trung thực và không làm sai lệch kết quả học tập.
  - Chưa tích hợp audio stream thật cho các bài nghe; hệ thống không nhận vơ audio khi chỉ có text.
- **Bước hành động tiếp theo (Next Action)**:
  - Người dùng áp dụng 2 migration Phase 3 & Phase 4 trên Supabase Dashboard.
  - Sẵn sàng chuyển giao sang **Phase 5 — Adaptive Engine & Spaced Repetition (SRS)** để sử dụng dữ liệu từ `practice_submissions`, `learning_events` và `learning_evidence` phục vụ việc tự động đề xuất ôn tập ngắt quãng và điều chỉnh độ khó bài học.
