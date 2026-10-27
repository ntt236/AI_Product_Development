# Báo cáo phiên làm việc: Hiệu chỉnh âm học & Phân đoạn Audio TOEIC chuẩn xác (2026-10-22)

## 1. Mục tiêu phiên làm việc
Khắc phục hiện tượng lệch audio câu hỏi trong đề thi TOEIC ETS:
- **Hiện tượng lỗi**: Câu hỏi 1 phát audio của Câu 2, Câu 2 phát Câu 3... và Câu 1 bị mất hoàn toàn ("audio lệch rồi, bị lỗi number 1 thì phát của number 2 và cứ tiếp tục lên vậy, bị thiếu number 1 rồi").
- **Mục tiêu**: Định vị chính xác mốc thời gian âm học của toàn bộ 100 câu nghe (Part 1 -> Part 4), cắt lại các tệp MP3 độc lập, cập nhật cơ sở dữ liệu Supabase và tệp dataset JSON/SQL.

---

## 2. Nguyên nhân cốt lõi (Root Cause)
1. **Phần hướng dẫn mẫu (Sample Directions) của ETS Part 1**:
   - File ghi âm gốc của ETS có đoạn đọc hướng dẫn Part 1 và câu ví dụ mẫu (Sample Question) kéo dài từ `00:00` đến `01:46` (`106.8s`).
   - Lệnh cắt trước đó đã lấy mốc `131.5s` làm mốc bắt đầu của Câu 1. Tuy nhiên, tại `131.5s`, người đọc thực tế đang đọc: *"Number 2. Look at the picture marked number 2 in your test book..."*.
   - Mốc âm học thực sự của **Number 1** bắt đầu tại `01:47` (`107.0s`): *"Number 1. Look at the picture marked number 1 in your test book. (A) They're rowing the boat together..."*.
   - Việc lấy mốc `131.5s` làm cho Câu 1 nhận audio của Câu 2, Câu 2 nhận Câu 3, và Câu 1 ("rowing the boat") bị bỏ sót hoàn toàn.

2. **Part 2 dịch chuyển do bộ lọc khoảng lặng**:
   - Bộ lọc khoảng lặng trước đó bỏ qua các khoảng lặng dưới 340s, vô tình cắt mất Câu 7 (bắt đầu tại `333.0s`), gây ra hiệu ứng dịch chuyển 1 câu tương tự trong Part 2.

---

## 3. Các bước xử lý kỹ thuật & Kết quả đạt được

### A. Phân tích âm học bằng Google Gemini AI & Khoảng lặng (Silence Intervals)
- Trích xuất các đoạn âm thanh và dùng Gemini 3.5 Flash Lite phiên âm từng câu hỏi, kết hợp phân tích khoảng lặng dừng (5.1s pause giữa các câu đơn, 8.1s pause giữa các câu nhóm):
  - **Part 1 (Q1 - Q6)**:
    - Q1: `107.0s` -> `130.5s` (`dur: 23.5s`) - "They're rowing the boat together"
    - Q2: `130.5s` -> `161.5s` (`dur: 31.0s`) - "Passengers are waiting at the airport"
    - Q3: `161.5s` -> `188.5s` (`dur: 27.0s`) - "Computer monitor under desk / Shelves filled with books"
    - Q4: `188.5s` -> `216.5s` (`dur: 28.0s`) - "Looking over some papers"
    - Q5: `216.5s` -> `242.5s` (`dur: 26.0s`) - "Helping themselves to food"
    - Q6: `242.5s` -> `270.0s` (`dur: 27.5s`) - "Standing alone on the platform"
  - **Part 2 (Q7 - Q31)**:
    - Q7: `333.0s` -> `351.8s` (`dur: 18.8s`) - "Why did you get back from your trip so early?"
    - Q8 -> Q31: Mỗi câu được cắt riêng rẽ theo 25 khoảng lặng chuẩn 5.1s tới `851.4s`.
  - **Part 3 (Q32 - Q70)**:
    - 13 đoạn hội thoại độc lập (Q32-34 đến Q68-70) từ `874.0s` đến `1952.0s`.
  - **Part 4 (Q71 - Q100)**:
    - 10 bài nói ngắn (Q71-73 đến Q98-100) từ `1980.0s` đến `2944.0s`.

### B. Thực thi cắt lại tệp và cập nhật cơ sở dữ liệu
1. Cập nhật `scripts/slice_toeic_audio.mjs` với toàn bộ mốc thời gian chuẩn xác và chạy lại FFmpeg với cờ `-acodec copy` (không làm suy giảm chất lượng âm thanh).
2. Chạy `scripts/update_sliced_audio_db.mjs`:
   - Cập nhật `audio_url` trong `data/toeic/toeic_ets_actual_test_01.json`.
   - Cập nhật trường `audio_url` của 100 câu hỏi trong bảng Supabase `assessment_questions`.
3. Chạy `scripts/export_test01_to_sql.mjs` để đồng bộ tệp migration `supabase/migrations/20261022_toeic_ets_actual_test_01.sql`.

### C. Kiểm chứng bằng chứng (Verification)
- Gọi Gemini AI kiểm tra nội dung phiên âm thực tế của các tệp audio vừa cắt:
  - `toeic_p1_q1.mp3`: *"We'll begin. Number one. Look at the picture marked number one in your test book. A. They're rowing the boat together. B. They're lifting the rubber boat. C. They're sitting at the water's edge. D. They're swimming in the lake."* -> Khớp 100% với ảnh chèo thuyền và đáp án A.
  - `toeic_p1_q2.mp3`: *"Number two. Look at the picture marked number two in your test book. A. Passengers are waiting at the airport..."* -> Khớp 100% với ảnh sân bay và đáp án C.
  - `toeic_p2_q7.mp3`: *"Number 7. Why did you get back from your trip so early? A, because the meeting got cancelled..."* -> Khớp 100% với câu hỏi và đáp án A.
- Kiểm thử tự động `npm test`: **154/154 tests passed** (0 fail, 0 skip).
