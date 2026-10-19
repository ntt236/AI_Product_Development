# Báo cáo phiên làm việc: Triển khai bài Listening mẫu thực tế & Tích hợp vòng đời học tập

**Thời gian:** 2026-10-19 10:00 (ICT)  
**Nhánh thực hiện:** `phase-4`  
**Mục tiêu:** Triển khai một bài Listening mẫu hoàn chỉnh, có audio thực tế, tích hợp trọn vẹn vào Learning Path và Daily Plan hiện có để kiểm chứng vòng đời học tập từ đầu đến cuối mà không phá vỡ ranh giới lộ trình của các Phase tiếp theo.

---

## 1. Kết quả thực hiện chính

### 1.1 Tạo tài nguyên Audio thực tế (High-Fidelity Dialogue Audio)
- Sử dụng công nghệ tổng hợp giọng nói hai nhân vật (`System.Speech.Synthesis`) với 2 giọng bản xứ chuẩn Mỹ: `Microsoft David Desktop` (nam) và `Microsoft Zira Desktop` (nữ).
- Đoạn hội thoại tự nhiên về chủ đề **Daily Conversations — Introducing Yourself**:
  - David: Sinh ra ở London, chuyển đến New York cách đây 2 năm để làm việc, thích chơi acoustic guitar và nấu món Ý.
  - Sarah: Quê gốc ở Chicago, hiện sống tại New York, thích đọc tiểu thuyết và chụp ảnh vào cuối tuần.
- File audio thực tế: [public/audio/daily-conversations-introducing-yourself.wav](file:///d:/AI_Product_Development/public/audio/daily-conversations-introducing-yourself.wav) (kích thước: 2,253,896 bytes, định dạng 16-bit PCM RIFF WAVE).
- Phục vụ tĩnh trực tiếp trên trình duyệt qua đường dẫn: `/audio/daily-conversations-introducing-yourself.wav`.

### 1.2 Thiết kế bài học & CSDL (Database Schema & Seed)
- Tạo migration mới: [supabase/migrations/20261019_phase_5_listening_sample.sql](file:///d:/AI_Product_Development/supabase/migrations/20261019_phase_5_listening_sample.sql).
- Dữ liệu `public.content_items`:
  - `id`: `11111111-1111-4111-a111-000000000003`
  - `slug`: `listening-daily-conversations-introducing-yourself`
  - `title`: `Luyện nghe Hội thoại chào hỏi và Hỏi thông tin cá nhân (Introducing Yourself)`
  - `content_type`: `listening`, `skill`: `listening`, `level`: `a1`, `estimated_minutes`: 20.
  - `body`: Chứa mục tiêu học tập, audio_url, thời lượng 38s, mẹo bắt từ khóa, danh sách 8 lời thoại song ngữ và transcript.
- 5 câu hỏi trắc nghiệm tương ứng trong `public.practice_exercises` & `public.practice_exercise_answers`:
  1. Nơi David sinh ra (`London` — `opt_3a`).
  2. Quê gốc của Sarah (`Chicago` — `opt_4b`).
  3. Nơi ở hiện tại của cả hai (`New York` — `opt_5c`).
  4. Sở thích của Sarah (`Đọc tiểu thuyết và chụp ảnh` — `opt_6c`).
  5. Sở thích của David (`Chơi đàn acoustic guitar và nấu món Ý` — `opt_7a`).
- Đã áp dụng trực tiếp vào database Supabase qua script [scripts/apply_listening_sample_seed.mjs](file:///d:/AI_Product_Development/scripts/apply_listening_sample_seed.mjs).

### 1.3 Bảo mật & RLS (Zero-Trust Answer Protection)
- Client chỉ nhận danh sách câu hỏi và các lựa chọn (`options`), tuyệt đối **KHÔNG** nhận `correct_option_id` hay `explanation` trước khi nộp bài.
- Bảng `practice_exercise_answers` được bảo vệ bằng RLS nghiêm ngặt: chỉ `service_role` mới có quyền truy cập.
- Chấm điểm thực hiện 100% phía server trong `submitPracticeAnswers()`:
  - So khớp `selected_option_id` với `correct_option_id`.
  - Lưu kết quả vào `public.practice_submissions`.
  - Ghi nhận `learning_evidence` với kỹ năng `listening`.
  - Cập nhật trạng thái `daily_plan_tasks` thành `completed` và kích hoạt mở khóa tuần tự topic tiếp theo trong `learning_path_items`.

### 1.4 Giao diện người dùng sư phạm (Pedagogical Listening UX)
- Component `ListeningAudioPlayer` hỗ trợ:
  - Tùy chỉnh tốc độ nghe linh hoạt: `0.8x` (chậm cho người mới bắt đầu), `1.0x` (chuẩn), `1.2x` (thử thách phản xạ).
  - Thanh tiến trình phát và điều khiển âm lượng trực quan.
- **Quy trình 3 bước hoàn chỉnh**:
  1. **Bước 1 (Học)**: Hiển thị mục tiêu bài học, mẹo nghe, audio player nghe thử. Transcript được ẩn để kích thích người học tập trung lắng nghe.
  2. **Bước 2 (Luyện tập)**: Audio Player duy trì cố định ở đầu trang, người học có thể nghe đi nghe lại nhiều lần trong khi đọc câu hỏi và chọn đáp án.
  3. **Bước 3 (Kết quả)**: Hiển thị điểm số phần trăm, phân tích từng câu đúng/sai kèm đáp án chuẩn. **Mở khóa Script chi tiết (Transcript)** với giao diện thoại phân biệt màu sắc David và Sarah kèm phụ đề tiếng Việt từng dòng. Hỗ trợ bấm nghe lại và tích hợp nút "🤖 Hỏi AI Tutor phân tích sâu hơn câu này".

### 1.5 Tích hợp Learning Path & Daily Plan
- Cập nhật `CURRICULUM_BANK.listening.a1`: topic `Luyện nghe Hội thoại chào hỏi và Hỏi thông tin cá nhân` chuyển sang `content_status: 'available'` kèm `content_item_slug`.
- Cập nhật `matchTopicToContentItem` và `generateDailyPlanProposal` để tự động nhận diện bài Listening.
- Learning Path hiển thị nhãn `✅ Khả dụng`, cho phép người học nhấn vào để mở modal và bấm "Bắt đầu học & Luyện tập".
- Daily Plan tự động đưa bài Listening vào kế hoạch ngày nếu phù hợp ngân sách thời gian mà không tạo nhiệm vụ trùng lặp.
- Các topic curriculum khác chưa có bài học tiếp tục hiển thị `planned_curriculum` minh bạch.

---

## 2. Kết quả kiểm thử & Kiểm chứng chất lượng

| Kiểm tra | Kết quả | Chi tiết |
|---|---|---|
| `npm test` | **PASS (113/113 tests)** | 9 test suites, 0 fail, 0 skipped. Bao gồm 9 tests chuyên sâu mới trong `tests/daily-plan/listening_practice_lifecycle.test.mjs`. |
| `npx tsc --noEmit` | **PASS** | Exit code 0, TypeScript strict mode hoàn toàn sạch lỗi. |
| `npm run lint` | **PASS** | Exit code 0, ESLint hoàn toàn sạch lỗi. |
| `npm run build` | **PASS** | Next.js production build thành công 12/12 routes, tối ưu hóa toàn bộ dynamic & static pages. |

---

## 3. Danh sách tệp đã tạo hoặc chỉnh sửa

- **Tệp mới**:
  - `public/audio/daily-conversations-introducing-yourself.wav` (Audio 2.25MB).
  - `scripts/generate_listening_audio.ps1` (Script tổng hợp audio giọng người nói thực tế).
  - `scripts/apply_listening_sample_seed.mjs` (Script seed dữ liệu vào Supabase DB).
  - `supabase/migrations/20261019_phase_5_listening_sample.sql` (Migration mới).
  - `tests/daily-plan/listening_practice_lifecycle.test.mjs` (Bộ test kiểm chứng vòng đời bài Listening).
  - `docs/development/sessions/2026-10-19-listening-sample-lesson.md` (Báo cáo phiên làm việc này).
- **Tệp đã chỉnh sửa**:
  - `src/modules/daily-plan/types.ts`: Thêm kiểu dữ liệu `ContentDialogueLine` và mở rộng `ContentItemBody` với `audio_url`, `tips`, `transcript`, `dialogue`.
  - `src/modules/daily-plan/generator.ts`: Bổ sung luật ánh xạ cho chủ đề Listening trong thuật toán sinh kế hoạch ngày.
  - `src/modules/learning-path/curriculum.ts`: Cập nhật `listening.a1` thành `available` và bổ sung luật so khớp trong `matchTopicToContentItem`.
  - `src/app/(app)/daily-plan/practice/[taskId]/practice-session-view.tsx`: Tích hợp `ListeningAudioPlayer`, nghe thử & mẹo ở bước Study, audio player ở bước Practice, mở khóa Transcript song ngữ ở bước Result.
  - `docs/development/PROJECT_STATE.md`: Cập nhật trạng thái dự án và kết quả kiểm thử.
  - `docs/architecture/DATA_FLOWS.md`: Bổ sung Mục 6 mô tả chi tiết luồng phân phối Audio & luyện tập bài Listening.

---

## 4. Hướng dẫn kiểm thử thủ công trên trình duyệt

1. Chạy dev server: `npm run dev`.
2. Mở trình duyệt truy cập `http://localhost:3000/learning-path`:
   - Quan sát Milestone 1 -> Module Luyện nghe A1: Thấy topic *"Luyện nghe Hội thoại chào hỏi và Hỏi thông tin cá nhân"* có nhãn `✅ Khả dụng`.
   - Các topic chưa có bài học khác (VD: *Đọc hiểu tin nhắn*, *Luyện nghe Sân bay*) vẫn giữ nhãn `📋 Đang chuẩn bị`.
   - Nhấp vào topic Listening -> Modal hiện nút `✍️ Bắt đầu học & Luyện tập`.
3. Bấm bắt đầu: Hệ thống tự động tạo nhiệm vụ trong Daily Plan và chuyển sang `/daily-plan/practice/[taskId]`:
   - **Bước 1 (Học)**: Xem mục tiêu, mẹo nghe và bấm nút Play trên Audio Player để nghe thử cuộc hội thoại giữa David và Sarah. Thấy tốc độ có thể chỉnh `0.8x`, `1.0x`, `1.2x`.
   - Bấm `Tôi đã hiểu bài • Bắt đầu làm bài tập` -> Chuyển sang **Bước 2 (Luyện tập)**.
   - **Bước 2**: Audio Player hiển thị ở trên cùng; người học vừa nghe vừa chọn đáp án cho 5 câu hỏi. Bấm `Nộp bài`.
   - **Bước 3 (Kết quả)**: Hiển thị điểm số, mở khóa toàn bộ **Script cuộc hội thoại (Transcript)** với tên David/Sarah phân biệt rõ ràng và bản dịch tiếng Việt song ngữ bên dưới. Có thể bấm `Hỏi AI Tutor` để nhận phân tích chi tiết.
