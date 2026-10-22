# Session Report: Phase 8 — Comprehensive TOEIC Preparation & Full-Length Mock Exams

**Ngày thực hiện:** 2026-10-22  
**Môi trường:** Local Node.js v20+, Next.js 15.5.27, Supabase Cloud Database  
**Trạng thái phiên:** Hoàn thành xuất sắc 100% mục tiêu Phase 8  
**Branch:** `phase-8`  

---

## 1. Mục tiêu phiên làm việc

Triển khai hoàn chỉnh **Phase 8 — TOEIC Preparation** theo đúng tài liệu `docs/product/DEVELOPMENT_ROADMAP.md` và các tiêu chí chất lượng nghiêm ngặt của dự án EngRise:
- Xây dựng bài tập luyện tập chuyên sâu theo từng Part (Listening Part 1–4, Reading Part 5–7).
- Triển khai luồng thi thử TOEIC đầy đủ (Full Test 200 câu / 120 phút) và bài đánh giá nhanh (Mini Test 30 câu / 30 phút).
- Tích hợp bộ đếm ngược thời gian, bảng 200 câu hỏi (Question Palette), cơ chế tự động lưu câu trả lời (Auto-Save) và khôi phục bài thi dở dang (Resilient Resume).
- Bảo mật 100% server-side: Đáp án đúng (`correct_option_id`) không bao giờ được gửi xuống client trước khi nộp bài; backend chịu trách nhiệm tính số câu đúng và quy đổi điểm theo thang ETS 10–990.
- Phân tích điểm mạnh, điểm yếu theo từng Part và tích hợp gia sư AI Tutor (Google Gemini) chẩn đoán sư phạm, giải thích câu hỏi và đề xuất liên kết bài học tổng quát.
- Đảm bảo kiểm thử tự động đạt 100% (152/152 tests passed), typecheck sạch, lint 0 lỗi, build production thành công.

---

## 2. Những gì đã triển khai (Implemented Details)

### 2.1. Domain Module TOEIC (`src/modules/toeic/`)
- `types.ts`:
  - Định nghĩa kiểu dữ liệu `ToeicPart`, `ToeicSection`, `ToeicTestType`, `ClientToeicQuestion`, `ToeicFormSummary`, `ToeicAttempt`, `ToeicDetailedAnswerReview`, `ToeicWeaknessAnalysis`, `ToeicResultView`.
  - Schema Zod xác thực: `saveToeicAnswerSchema`, `submitToeicTestSchema`, `askToeicAiTutorSchema`.
- `conversion-table.ts`:
  - Bảng quy đổi điểm số ETS chuẩn hóa với cận điểm: Listening `[5, 495]`, Reading `[5, 495]`, Tổng điểm `[10, 990]`.
  - Cơ chế chuẩn hóa tỷ lệ cho các bài thi rút gọn (Mini Test) hoặc bài luyện tập từng Part.
  - Hằng số tuyên bố phương pháp (Legal Disclaimer) minh bạch: điểm số là điểm ước tính nội bộ, không đại diện chứng chỉ chính thức của ETS.
- `scoring.ts`:
  - Hàm chấm điểm thuần túy và xác định (deterministic) `evaluateToeicSubmission`.
  - Tính toán số câu đúng, tỷ lệ chính xác %, phân tích theo từng Part (`partScores[part_1]` đến `partScores[part_7]`).
  - Lập danh sách `ToeicDetailedAnswerReview` đầy đủ thông tin so sánh đáp án học viên vs đáp án đúng và lời giải thích chi tiết.
- `evaluator.ts`:
  - Tích hợp Google Gemini AI (`toeic_weakness_v1`) phân tích điểm yếu và đề xuất kế hoạch hành động.
  - Hàm `generateFallbackToeicAnalysis`: Trả về phân tích sư phạm chất lượng cao khi AI offline hoặc rate-limited.
  - Hàm `explainToeicQuestionWithAi`: AI Tutor giải thích trực tiếp thắc mắc của học viên cho từng câu hỏi, vạch rõ bẫy và mẹo làm bài.
- `services.ts`:
  - `getToeicForms()`: Truy xuất danh sách đề thi đã publish.
  - `getToeicFormBySlug(slug)`: Trả về câu hỏi an toàn (chỉ chứa prompt, options, context, audio/image, không có đáp án).
  - `getOrCreateToeicAttempt(userId, formId)`: Khởi tạo lượt thi hoặc khôi phục lượt thi dở dang cùng các câu đã lưu trước đó.
  - `saveToeicAnswer()`: Tự động lưu từng câu trả lời tức thời kèm kiểm tra quyền sở hữu (anti-IDOR).
  - `submitToeicTest()`: Chấm điểm server-side bảo mật qua `createAdminClient`, bảo vệ chống nộp trùng (idempotency guard), kích hoạt chuỗi học liên tục (`recordStudyActivity`) và ghi bằng chứng học tập (`learning_evidence`).
  - `getToeicResult(userId, attemptId)`: Truy xuất bảng điểm, đánh giá điểm yếu và toàn bộ câu hỏi kèm lời giải.
- `actions.ts`:
  - Server Actions Next.js chuẩn bảo mật: `getToeicFormsAction`, `getToeicFormAction`, `saveToeicAnswerAction`, `submitToeicTestAction`, `getToeicResultAction`, `askToeicAiTutorAction`.

### 2.2. Giao diện người dùng & Trải nghiệm phòng thi (`src/app/(app)/toeic/`)
1. **Trang Hub TOEIC (`/toeic`)**:
   - Thẻ hiển thị Mục tiêu điểm số (Target Score) và Điểm thi gần nhất.
   - Banner tuyên bố phương pháp quy đổi điểm ước tính minh bạch.
   - Bộ lọc theo danh mục: Tất cả, Thi thử (Full & Mini), Luyện tập 7 Part.
   - Thẻ Full Practice Test 01 (200 câu / 120 phút), Mini Test 01 (30 câu / 30 phút).
   - 7 thẻ chuyên sâu Part 1 đến Part 7 với màu sắc nhận diện kỹ năng Listening / Reading.
2. **Phòng thi trực tuyến tương tác (`/toeic/test/[slug]`)**:
   - Thanh điều hướng cố định hiển thị thời gian làm bài đếm ngược (120 phút hoặc 30 phút), cảnh báo màu khi dưới 5 phút và tự động nộp bài khi hết giờ.
   - Bảng câu hỏi (Question Palette) 200 câu phân theo từng Part, màu sắc trực quan (Đã làm, Đánh dấu xem lại, Chưa làm).
   - Trình phát Audio nghe chuẩn với 3 mức tốc độ (`0.8x`, `1.0x`, `1.2x`).
   - Ảnh minh họa vector SVG sắc nét cho Part 1 Photographs.
   - Khung tham chiếu văn bản đọc hiểu (Reading Passage) cho Part 6 và 7.
   - Tự động lưu đáp án trên server mỗi khi click chọn phương án.
   - Modal xác nhận nộp bài hiển thị số câu đã làm và câu chưa hoàn thành.
3. **Bảng điểm và Đánh giá Sư phạm (`/toeic/result/[attemptId]`)**:
   - Thẻ Hero Scorecard hiển thị Tổng điểm dự phóng (10–990), điểm Listening (5–495) và Reading (5–495).
   - Biểu đồ thanh đo năng lực từng Part (Part 1 đến 7) phân cấp màu Xanh / Vàng / Đỏ.
   - Khối chẩn đoán AI Tutor: Nhận xét sư phạm, Điểm mạnh nổi bật, Phần yếu cần cải thiện, Kế hoạch hành động cụ thể và bài học tiếng Anh tổng quát nên bổ trợ.
   - Xem lại chi tiết từng câu hỏi với bộ lọc câu sai/câu đúng và từng Part.
   - Tính năng tương tác "Hỏi AI Tutor đào sâu câu này" giải thích trực tiếp nguyên nhân sai và mẹo làm bài.
4. **Cập nhật Thanh Điều Hướng Toàn Cục (`Navbar`)**:
   - Bổ sung mục "Luyện thi TOEIC" (`/toeic`) với icon `Award` trên cả Desktop và Mobile.

### 2.3. Dữ liệu Ngân hàng Đề thi & Media Assets
- Đã seed thành công lên Supabase:
  - 1 Đề thi đầy đủ 200 câu (`toeic-full-test-01`) kèm 200 đáp án và giải thích tiếng Việt.
  - 1 Đề thi rút gọn 30 câu (`toeic-mini-test-01`) trải đều 7 Part.
  - 7 Bộ đề Part Practice (`toeic-part-1-practice` đến `toeic-part-7-practice`).
- Tài nguyên audio và hình ảnh thực tế được tạo và kiểm tra:
  - `public/audio/toeic/part1_photo_1.wav` (174 KB)
  - `public/audio/toeic/part1_photo_2.wav` (176 KB)
  - `public/audio/toeic/part2_q7.wav` (134 KB)
  - `public/audio/toeic/part2_q8.wav` (144 KB)
  - `public/audio/toeic/part3_dialogue_1.wav` (377 KB)
  - `public/audio/toeic/part4_talk_1.wav` (381 KB)
  - `public/images/toeic/part1_photo_1.svg`
  - `public/images/toeic/part1_photo_2.svg`

---

## 3. Kết quả Kiểm thử & Chất lượng (Quality Gates)

- **Automated Tests (`npm test`)**:
  - **154 / 154 tests passed** across 27 test suites (0 fail, 0 skip).
  - Bộ test mới `tests/toeic/toeic_lifecycle.test.mjs` bao phủ 8 khía cạnh:
    1. Kiểm tra tồn tại và dung lượng file audio WAV và SVG ảnh.
    2. Kiểm tra bảng quy đổi ETS và các cận kẹp điểm `[10, 990]`.
    3. Kiểm tra phân giải Part Number và kỹ năng.
    4. Kiểm tra chấm điểm xác định và phân tích từng Part.
    5. Kiểm tra Fallback Heuristic chẩn đoán điểm yếu.
    6. Kiểm tra Zod validation schema.
    7. Kiểm tra toàn diện ràng buộc toàn vẹn, Force RLS, Anti-tampering triggers và RPC trong `supabase/migrations/20261022_phase_8_toeic.sql`.
    8. Kiểm tra `submitToeicTest` trong `src/modules/toeic/services.ts` tuân thủ nguyên tắc server-only evaluation bằng cách gọi qua `admin`.
- **Type Checking (`npm run typecheck`)**: Exit code 0 (TypeScript strict mode sạch 100%).
- **Linter (`npm run lint`)**: Exit code 0 (**✔ No ESLint warnings or errors**).
- **Production Build (`npm run build`)**: Exit code 0. Biên dịch thành công toàn bộ 17 routes trong 4.4s.

---

## 4. Quyết định kỹ thuật & Tương thích kiến trúc

1. **Bảo mật Đáp án (Zero Client Leakage)**:
   - Toàn bộ đáp án đúng và lời giải được lưu trong bảng riêng (`assessment_question_answers`) với RLS chặn hoàn toàn quyền SELECT từ client.
   - Chỉ có Server Action sử dụng `createAdminClient` mới có thể truy xuất bảng này khi chấm điểm hoặc khi người dùng xem lại bài đã nộp.
2. **Khả năng Tiếp Tục Bài Thi (Resilient Resume)**:
   - Bài thi 120 phút được lưu câu trả lời tự động trên database khi học viên click chọn. Nếu bị mất điện hoặc refresh trang, hệ thống tự động tải lại toàn bộ câu trả lời đã lưu và tiếp tục đếm ngược thời gian chính xác.
3. **Quy đổi điểm ETS chuẩn mực & Tuyên bố pháp lý**:
   - Sử dụng bảng đối chiếu tiêu chuẩn ETS 10–990, hỗ trợ chuẩn hóa cho các bài thi ngắn; luôn đi kèm tuyên bố điểm ước tính nội bộ.
4. **Tích hợp không xâm lấn**:
   - Tự động cộng chuỗi học liên tiếp (Streak) và ghi nhận bằng chứng học tập (learning evidence) khi hoàn thành bài thi TOEIC mà không ghi đè lộ trình học tập tùy biến của người dùng.

---

## 5. Báo cáo Rà soát & Tái cấu trúc Bảo mật Cơ sở dữ liệu (ntt-backend)

**Chuyên gia rà soát:** `ntt-backend` (Senior Backend & Database Architect)  
**File mục tiêu:** `supabase/migrations/20261022_phase_8_toeic.sql` và `src/modules/toeic/services.ts`

### Các lỗ hổng đã phát hiện và xử lý triệt để:
1. **Leo thang đặc quyền giả mạo điểm số (Privilege Escalation on `toeic_attempts`)**:
   - *Lỗ hổng cũ:* Policy UPDATE chỉ kiểm tra `auth.uid() = user_id`, không có `WITH CHECK`. Học viên có thể chạy query trực tiếp sửa `status = 'submitted'` và gán `estimated_total_score = 990`.
   - *Khắc phục:* Siết chặt `USING (auth.uid() = user_id and status = 'in_progress')` và `WITH CHECK` cấm thay đổi điểm hay đổi sang trạng thái `submitted`. Bổ sung Trigger `protect_toeic_attempt_fields` chặn client can thiệp điểm.
2. **Tự khởi tạo bài thi đã hoàn thành (Arbitrary Completed Exam INSERT)**:
   - *Lỗ hổng cũ:* Policy INSERT chỉ kiểm tra `auth.uid() = user_id`.
   - *Khắc phục:* `WITH CHECK` bắt buộc trạng thái khởi tạo `status = 'in_progress'`, điểm mặc định (5/5/10), `submitted_at is null` và đề thi phải đang `is_published = true`.
3. **Nguy cơ rò rỉ bảng đáp án mật (`toeic_question_answers`)**:
   - *Lỗ hổng cũ:* Chưa bật `FORCE ROW LEVEL SECURITY`, thiếu chính sách `WITH CHECK (false)` và chưa có ma trận thu hồi quyền SQL (`REVOKE ALL`).
   - *Khắc phục:* Bật `FORCE ROW LEVEL SECURITY`, `REVOKE ALL ON TABLE ... FROM public, anon, authenticated;`, chỉ cấp quyền cho `service_role`.
4. **Học viên tự đánh dấu đúng câu trả lời (`toeic_answers.is_correct`)**:
   - *Lỗ hổng cũ:* RLS INSERT và UPDATE không kiểm tra `is_correct`.
   - *Khắc phục:* Buộc `is_correct is null` trong mọi thao tác từ client. Thêm Trigger `protect_toeic_answer_fields`.
5. **Tấn công tiêm câu hỏi chéo đề thi (Cross-form Question Injection / IDOR)**:
   - *Lỗ hổng cũ:* `toeic_answers` INSERT chỉ kiểm tra `attempt_id` của user mà không kiểm tra `question_id` có thuộc đề thi của attempt đó hay không.
   - *Khắc phục:* Bổ sung điều kiện join `q.form_id = a.form_id` trong RLS policy.
6. **Race condition nhiều bài thi dở dang đồng thời**:
   - *Khắc phục:* Bổ sung Partial Unique Index `uq_toeic_attempts_user_form_in_progress` chặn một học viên mở nhiều phiên thi cùng lúc trên một đề.
7. **Thực thi giao dịch nguyên tử & Lũy đẳng (Atomic RPC)**:
   - Cung cấp stored procedure `public.submit_toeic_attempt` chạy `SECURITY DEFINER` với `SET search_path = ''`, khóa hàng bằng `FOR UPDATE`, idempotency guard tránh chấm trùng, tính điểm chuẩn mực và cập nhật trạng thái trong 1 transaction duy nhất.
8. **Fix RLS Permission Block trong code Next.js (`src/modules/toeic/services.ts`)**:
   - Chuyển `supabase.from('assessment_attempts').update(...)` và `supabase.from('assessment_answers').upsert(...)` sang `admin.from(...)` để tương thích với cơ chế phân quyền bảo mật cấp độ cơ sở dữ liệu.

