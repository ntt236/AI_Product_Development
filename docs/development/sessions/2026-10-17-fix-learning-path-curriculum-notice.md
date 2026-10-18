# Báo cáo phiên làm việc: Sửa thông báo lỗi thời Phase 4 & Hoàn thiện liên kết nội dung Learning Path

**Thời gian:** 2026-10-17 23:15 (ICT)  
**Nhánh thực hiện:** `phase-5`  
**Mục tiêu:** Loại bỏ thông báo chuẩn bị Phase 4 đã lỗi thời trên giao diện Learning Path, phân loại và liên kết chính xác các chủ đề với nội dung bài học thực tế, cập nhật UI và hoàn thiện luồng học tập từ Learning Path sang Practice.

---

## 1. Nguyên nhân thông báo Phase 4 vẫn xuất hiện
1. **Hardcoded text trong giao diện**:
   - Trong `src/app/(app)/learning-path/learning-path-view.tsx` (dòng 1013–1018), modal chi tiết topic trước đây được viết cứng câu thông báo: *"⚠️ Nội dung đang được chuẩn bị cho Phase 4... sẽ được triển khai trong Phase 4 (Content Delivery & Daily Practice)"*.
   - Trên mỗi thẻ topic (dòng 827), huy hiệu (badge) trạng thái bị hardcode là `"Planned Curriculum"` thay vì phản ánh `content_status` thực tế.
2. **Thiếu cơ chế liên kết động giữa Learning Path Item và Content Item**:
   - Khi tạo lộ trình học trong Phase 3, kho bài học Phase 4 chưa tồn tại, do đó các mục được lưu mặc định là `planned_curriculum`.
   - Khi Phase 4 được triển khai với 2 bài học tương tác thực tế (`vocab-daily-routine` và `grammar-present-simple`), module `learning-path` chưa có hàm đối chiếu (reconcile) giữa `learning_path_items` và bảng `public.content_items`.

---

## 2. Phân loại nội dung học tập thực tế trong kho dữ liệu
Dựa trên dữ liệu schema và migrations thực tế của Phase 4 (`supabase/migrations/20261016_phase_4_daily_plan_practice.sql`):

### Nhóm 1: Đã có nội dung học tập thực sự & có thể thực hiện ngay
1. **Từ vựng sinh hoạt hàng ngày (Daily Routine)**:
   - Thuộc kỹ năng: `vocabulary` (Trình độ A1/Pre-A1).
   - Bản ghi: `content_items` với slug `vocab-daily-routine` (ID: `11111111-1111-4111-a111-000000000001`).
   - Bài tập: 5 câu hỏi trắc nghiệm tương tác trong `public.practice_exercises` kèm đáp án và lời giải chi tiết.
2. **Thì Hiện tại đơn (Present Simple Tense)**:
   - Thuộc kỹ năng: `grammar` (Trình độ A1).
   - Bản ghi: `content_items` với slug `grammar-present-simple` (ID: `11111111-1111-4111-a111-000000000002`).
   - Bài tập: 5 câu hỏi trắc nghiệm tương tác trong `public.practice_exercises` kèm đáp án và lời giải chi tiết.

### Nhóm 2: Chỉ có kế hoạch học tập, chưa có nội dung thực thi (Planned Curriculum)
- **Kỹ năng Luyện nghe (Listening)**: Ví dụ bài *"Luyện nghe Hội thoại chào hỏi và Hỏi thông tin cá nhân"* (như trong ảnh chụp màn hình của người dùng).
- **Kỹ năng Đọc hiểu (Reading)**: Ví dụ bài *"Đọc hiểu Biển báo và Chỉ dẫn công cộng"*.
- **Các bài từ vựng và ngữ pháp nâng cao khác**: Đồ ăn, nghề nghiệp, quá khứ đơn, mạo từ...
- **Xử lý**: Giữ nguyên trạng thái `planned_curriculum`, minh bạch với người dùng là bài học đang được chuẩn bị; **tuyệt đối không tạo dữ liệu giả hoặc liên kết tới trang trống**.

---

## 3. Các thay đổi và giải pháp kỹ thuật đã triển khai

### A. Cơ chế ánh xạ chuẩn xác `matchTopicToContentItem` (`src/modules/learning-path/curriculum.ts`)
- Xây dựng hàm chuẩn đối chiếu một topic trong lộ trình với kho `content_items` đã phát hành (`is_published = true`).
- Đối chiếu chính xác theo `skill`, từ khóa định danh (`sinh hoạt`/`routine` -> `vocab-daily-routine`, `hiện tại đơn`/`present simple` -> `grammar-present-simple`) hoặc `content_item_slug` từ metadata.

### B. Đối chiếu & tự phục hồi trạng thái động (`src/modules/learning-path/services.ts`)
- Trong `getUserLearningPath`: Đối chiếu danh sách `learning_path_items` với `content_items`. Nếu topic khớp bài học thật, gắn `content_status: 'available'`, `content_item_id` và tự động cập nhật nhẹ nhàng vào DB (self-healing) nếu bản ghi cũ còn lưu `planned_curriculum`.
- Bổ sung hàm dịch vụ `startPracticeForTopic(userId, topicId)`:
  - Kiểm tra quyền sở hữu lộ trình và kiểm tra trạng thái khóa (`locked`).
  - Lấy hoặc tạo kế hoạch học tập hôm nay (`todayDailyPlan`).
  - Tìm hoặc thêm nhiệm vụ tương ứng vào `daily_plan_tasks` với `activity_type: 'practice'`.
  - Trả về `taskId` để điều hướng vào phòng luyện tập.

### C. Server Action mới (`src/modules/learning-path/actions.ts`)
- Export `startTopicPracticeAction(topicId)` có xác thực `user.id`, bọc lỗi và tự động revalidate path `/learning-path` và `/daily-plan`.

### D. Nâng cấp giao diện Learning Path (`src/app/(app)/learning-path/learning-path-view.tsx`)
1. **Loại bỏ hoàn toàn thông báo Phase 4**:
   - Thay thế bằng banner thông báo chuẩn mực ở đầu trang:
     *"💡 Nội dung đang được hoàn thiện: Một số chủ đề trong lộ trình chưa có bài học tương tác. Bạn vẫn có thể học những nội dung đã sẵn sàng trong Kế hoạch ngày."* (chỉ hiển thị khi còn topic thuộc diện `planned_curriculum`).
2. **Huy hiệu trạng thái topic động**:
   - Hoàn thành: `🎉 Đã xong`.
   - Có bài tập: `✅ Khả dụng`.
   - Chưa có bài: `📋 Đang chuẩn bị`.
3. **Modal chi tiết topic thông minh**:
   - **Với mục Khả dụng**: Hiển thị rõ *"✅ Nội dung học tập & Bài tập đã sẵn sàng"*. Nếu chủ đề chưa bị khóa, hiển thị nút bấm `[✍️ Bắt đầu học & Luyện tập]` (hoặc `[🔄 Luyện tập lại bài học]`) điều hướng trực tiếp vào giao diện bài tập. Nếu đang khóa, hiển thị ghi chú nhắc nhở hoàn thành các bài trước.
   - **Với mục Đang chuẩn bị**: Hiển thị *"📋 Nội dung giáo trình đang được chuẩn bị: Chủ đề này nằm trong khung kế hoạch chuẩn đầu ra của lộ trình..."*, kèm nút `[Đã hiểu & Đóng]`, không có nút bắt đầu giả tạo.
   - Việc mở xem modal **không bao giờ** tự ý đánh dấu hoàn thành bài học.

### E. Đồng bộ thông báo trong Daily Plan (`src/app/(app)/daily-plan/daily-plan-view.tsx`)
- Sửa thông báo modal planned task từ *"phát hành đầy đủ trong Phase 5"* thành *"đang được đội ngũ sư phạm hoàn thiện và sẽ sớm khả dụng"*.

---

## 4. Danh sách tệp đã thay đổi
1. `src/modules/learning-path/types.ts`: Bổ sung `content_item_id` và `content_item_slug` vào type.
2. `src/modules/learning-path/curriculum.ts`: Gắn slug cho topic có nội dung, export `matchTopicToContentItem`.
3. `src/modules/learning-path/services.ts`: Dynamic reconciliation trong `getUserLearningPath` và hàm `startPracticeForTopic`.
4. `src/modules/learning-path/actions.ts`: Bổ sung Server Action `startTopicPracticeAction`.
5. `src/app/(app)/learning-path/learning-path-view.tsx`: Gỡ thông báo Phase 4 cũ, thêm banner hướng dẫn, badge động và nút bắt đầu bài tập.
6. `src/app/(app)/daily-plan/daily-plan-view.tsx`: Xóa bỏ câu chữ nhắc tới Phase 5 cũ trong modal.
7. `tests/learning-path/content_linkage_and_lifecycle.test.mjs`: Test suite mới gồm 8 kịch bản kiểm thử toàn diện.
8. `docs/development/PROJECT_STATE.md`: Cập nhật trạng thái kiểm thử 104/104 tests.

---

## 5. Kết quả kiểm tra chất lượng
- **TypeScript strict check (`npx tsc --noEmit`)**: **Pass 100% (0 lỗi)**.
- **ESLint (`npm run lint`)**: **Pass 100% (No warnings or errors)**.
- **Automated Test Suites (`node tests/run_tests.mjs`)**: **104/104 tests passed across 22 test suites (0 failed)**.
- **Build test (`npm run build`)**: Lệnh `next build` gặp lock file `.next/trace` do máy trạm của người dùng đang chạy Next dev server nền (`node.exe` chiếm giữ `.next`), mã nguồn đã được xác nhận type-check và lint hoàn hảo.
