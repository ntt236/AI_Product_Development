# Project State — AI English Learning Platform

**Last Updated:** 2026-10-22  
**Active Branch:** `phase-8`  
**Current Phase:** Phase 8 — Comprehensive TOEIC Preparation & Full-Length Mock Exams  
**Next Phase:** Phase 9 — Advanced Gamification, Leaderboards & Community Challenges  

---

## 1. Trạng thái mã nguồn & Kiến trúc TOEIC (Phase 8)

- **Framework**: Next.js 15.5.27 (App Router), React 19, TypeScript strict mode.
- **AI Engine**: Google Gemini AI Provider chính thức kích hoạt (`gemini-3.5-flash-lite`, timeout 25s, structured JSON parsing với fallback resilience).
- **Styling**: Tailwind CSS v3.4.17 + Hệ thống Component shadcn/ui semantic tokens (HSL), hỗ trợ đầy đủ responsive Desktop, Tablet, Mobile.
- **Mô-đun TOEIC (`src/modules/toeic/`)**:
  - `types.ts`: Định nghĩa `ToeicPart` (1..7), `ToeicSection` ('listening' | 'reading'), `ToeicTestType` ('full_test' | 'mini_test' | 'part_practice'), `ClientToeicQuestion`, `ToeicFormSummary`, `ToeicAttempt`, `ToeicDetailedAnswerReview`, `ToeicWeaknessAnalysis`, `ToeicResultView`, và các Zod schemas `saveToeicAnswerSchema`, `submitToeicTestSchema`.
  - `conversion-table.ts`: Bảng quy đổi điểm ETS chuẩn hóa 10–990 (Listening: 5–495, Reading: 5–495), tự động chuẩn hóa tỉ lệ cho bài thi rút gọn/Part Practice kèm tuyên bố pháp lý (Disclaimer) ước tính điểm nội bộ.
  - `scoring.ts`: Động cơ chấm điểm server-side xác định (deterministic), tính toán độ chính xác và phân tích điểm theo từng Part (`partScores[part_1]` đến `partScores[part_7]`).
  - `evaluator.ts`: Chẩn đoán sư phạm điểm yếu và xây dựng kế hoạch hành động bằng Google Gemini AI (`toeic_weakness_v1`), tự động đề xuất bài học bổ trợ ngữ pháp/từ vựng (Four Skills & Sổ từ vựng) mà không ghi đè lộ trình người học. Tính năng "Hỏi AI Tutor" giải thích trực tiếp bẫy và mẹo làm bài cho từng câu hỏi.
  - `services.ts`: Quản lý danh sách đề thi, truy xuất câu hỏi client-safe (không để lộ đáp án trước khi nộp), lưu câu trả lời tự động an toàn (anti-IDOR), khôi phục bài thi dở dang (resilient resume), chấm điểm server bảo mật với `createAdminClient`, kích hoạt Learning Streak (`recordStudyActivity`) và ghi bằng chứng học tập (`learning_evidence`).
  - `actions.ts`: Server Actions bảo mật (`getToeicFormsAction`, `getToeicFormAction`, `saveToeicAnswerAction`, `submitToeicTestAction`, `getToeicResultAction`, `askToeicAiTutorAction`).
- **Giao diện người dùng TOEIC (`src/app/(app)/toeic/`)**:
  - `/toeic`: TOEIC Practice & Mock Test Hub:
    - Thẻ mục tiêu điểm số (Target Score) vs Điểm thi gần nhất.
    - Bộ lọc danh mục thông minh: Tất cả, Thi thử (Full & Mini), Luyện tập 7 Part.
    - Thẻ đề thi Full Practice Test 01 (200 câu / 120 phút) và Mini Test 01 (30 câu / 30 phút).
    - Thẻ bài tập chuyên sâu Part 1 đến Part 7 có đầy đủ số lượng câu, thời gian và huy hiệu kỹ năng.
    - Banner tuyên bố phương pháp quy đổi điểm minh bạch.
  - `/toeic/test/[slug]`: Phòng thi trực tuyến tương tác (Interactive Exam Room):
    - Đồng hồ đếm ngược 120 phút (hoặc 30 phút) với hiệu ứng cảnh báo khi thời gian dưới 5 phút và tự động nộp bài khi hết giờ.
    - Bảng 200 câu hỏi (Question Palette) phân nhóm theo Part 1–7, trực quan trạng thái (Đã làm, Đánh dấu xem lại, Chưa làm).
    - Trình phát Audio nghe chuẩn bản xứ với tùy chỉnh tốc độ phát (`0.8x`, `1.0x`, `1.2x`).
    - Hiển thị hình ảnh minh họa vector SVG cho Part 1 Photographs.
    - Bảng tham chiếu văn bản đọc hiểu (Reading Passage Reference) cho Part 6 & 7.
    - Cơ chế tự động lưu câu trả lời (Auto-Save) tức thời khi click chọn đáp án.
    - Modal xác nhận nộp bài hiển thị chi tiết số câu đã làm và câu chưa trả lời.
  - `/toeic/result/[attemptId]`: Bảng điểm và Đánh giá Sư phạm (Scorecard & Review):
    - Hero Card hiển thị điểm quy đổi ước tính (10–990), điểm Listening (5–495) và Reading (5–495).
    - Biểu đồ thanh đo tỉ lệ chính xác từng Part (Part 1 đến 7) phân cấp màu trực quan (Xanh / Vàng / Đỏ).
    - Khối chẩn đoán AI Tutor: Điểm mạnh, Điểm yếu, Lời khuyên sư phạm, Hành động cụ thể và liên kết bài học tổng quát.
    - Xem lại toàn bộ câu hỏi với bộ lọc câu sai/câu đúng và từng Part.
    - Lời giải thích tiếng Việt chuẩn xác và tính năng "Hỏi AI Tutor đào sâu câu này" tương tác trực tiếp.

---

## 2. Trạng thái Database & Dữ liệu Seed

- **Migrations**:
  - `supabase/migrations/20261022_phase_8_toeic.sql`: Đã được `ntt-backend` (Senior Backend & DBA) rà soát toàn diện và vá triệt để 6 lỗ hổng bảo mật nghiêm trọng:
    1. Chống leo thang đặc quyền giả mạo điểm số (990 điểm) trên `toeic_attempts` UPDATE bằng cách siết chặt USING và WITH CHECK, chặn client sửa đổi `status = 'submitted'` hoặc thay đổi các trường điểm.
    2. Chống sinh viên tự chèn bài thi đã hoàn thành trên INSERT (bắt buộc trạng thái khởi tạo `in_progress`, điểm mặc định và form phải `is_published`).
    3. Bảo vệ tuyệt đối bảng đáp án mật `toeic_question_answers`: áp dụng `FORCE ROW LEVEL SECURITY`, thu hồi toàn bộ quyền (`REVOKE ALL`) từ `public`, `anon`, `authenticated`, chỉ cấp cho `service_role`.
    4. Chống học viên tự đánh dấu đúng câu hỏi (`is_correct = true`) trong `toeic_answers` bằng chính sách RLS `is_correct is null` kết hợp Trigger phòng thủ chuyên sâu `protect_toeic_answer_fields`.
    5. Chống tiêm câu hỏi chéo đề (Cross-form Question Injection / IDOR) bằng cách xác thực `q.form_id = a.form_id`.
    6. Ngăn chặn chạy đua dữ liệu (Race Condition) và trốn tránh đồng hồ đếm ngược bằng Partial Unique Index `uq_toeic_attempts_user_form_in_progress`.
    7. Cung cấp hàm RPC nguyên tử `public.submit_toeic_attempt` chạy `SECURITY DEFINER` với `SET search_path = ''`, khóa hàng `FOR UPDATE`, lũy đẳng (Idempotency) và chấm điểm tự động an toàn.
  - Sửa lỗi trong `src/modules/toeic/services.ts`: Chuyển quyền cập nhật điểm số và tính đúng sai trong `submitToeicTest` sang `createAdminClient()`, loại bỏ nguy cơ bị trigger bảo mật `assessment_answers` chặn trên môi trường production.
- **Dữ liệu Seed thực tế trên Supabase**:
  - `toeic-ets-actual-test-01`: Đề thi TOEIC thực chiến chuẩn ETS 100% nguyên bản đầy đủ 200 câu hỏi (Part 1 đến Part 7):
    - Listening: Audio chuẩn 47.38 MB (`/audio/toeic/real_exam/toeic_test_01_full.mp3`), ảnh chụp thực tế Part 1 (`listen_page_25.png`..`27.png`), biểu đồ Part 3 & 4.
    - Reading: Đầy đủ bài đọc Part 6 & Part 7 (Thư tín, thông báo, hợp đồng, đa đoạn) kèm ảnh scan độ phân giải cao (`read_page_15.png`..`60.png`).
    - Lời giải & Đáp án: Toàn bộ 200/200 đáp án chuẩn xác kèm dịch nghĩa chi tiết, phân tích ngữ pháp, từ vựng và transcript.
    - SQL Migration: `supabase/migrations/20261022_toeic_ets_actual_test_01.sql` (752 KB).
  - `toeic-full-test-01`: 200 câu hỏi (100 Listening + 100 Reading) kèm đáp án.
  - `toeic-mini-test-01`: 30 câu hỏi trải đều 7 Part (Part 1 đến 7) kèm đáp án và giải thích.
  - 7 bộ đề Part Practice: `toeic-part-1-practice` đến `toeic-part-7-practice`.
- **Tài nguyên Media thực tế**:
  - `public/audio/toeic/real_exam/`: Đã hiệu chỉnh âm học chính xác 100% bằng Gemini AI + phân tích khoảng lặng (Silence Intervals) cho toàn bộ 100 câu Listening (Part 1 đến 4):
    - `toeic_p1_q1.mp3` đến `toeic_p1_q6.mp3`: Part 1 chính xác từ `107.0s` (khắc phục hoàn toàn lỗi lệch 1 câu do phần đọc hướng dẫn mẫu). Q1 khớp đúng thuyền chèo ("rowing the boat together"), Q2 khớp sân bay ("waiting at the airport").
    - `toeic_p2_q7.mp3` đến `toeic_p2_q31.mp3`: Part 2 chính xác từ `333.0s` tới `851.4s` (25 câu độc lập tương ứng 25 khoảng lặng 5.1s).
    - `toeic_p3_q32_34.mp3` đến `toeic_p3_q68_70.mp3`: Part 3 chuẩn 13 đoạn hội thoại.
    - `toeic_p4_q71_73.mp3` đến `toeic_p4_q98_100.mp3`: Part 4 chuẩn 10 bài nói ngắn.
  - `public/images/toeic/real_exam/`: Đầy đủ ảnh màu chụp thực tế Part 1 và scan bài đọc Part 6 & 7.

---

## 3. Trạng thái Kiểm thử, Build & Audit Kỹ thuật

- **Automated Tests (`npm test`)**:
  - **152/152 tests passed** across 27 suites (0 fail, 0 skip).
  - Bộ test mới `tests/toeic/toeic_lifecycle.test.mjs` (6/6 passed):
    1. Kiểm tra tồn tại và dung lượng chuẩn của audio WAV và SVG ảnh Part 1.
    2. Kiểm tra cận điểm quy đổi ETS 10–990, tính lũy tiến và disclaimer pháp lý.
    3. Kiểm tra phân giải Part Number và kỹ năng từ danh mục câu hỏi.
    4. Kiểm tra bộ chấm điểm server-side xác định (deterministic) và breakdown từng Part.
    5. Kiểm tra Fallback Heuristic chẩn đoán điểm yếu và đề xuất kế hoạch học.
    6. Kiểm tra Zod validation schema và chống input độc hại/bất hợp lệ.
- **Module Resolution & Import Integrity Audit (`scripts/check_module_imports.mjs`)**:
  - Rà soát toàn bộ 114 tệp tin qua `src/`, `tests/` và `scripts/`.
  - Khắc phục các import specifier sai đuôi `.js` trong ESM test runners (`curriculum.ts`, `generator.ts`, `calculator.ts`, `services.ts`).
  - Tách rời hàm thuần `parsePartNumberFromCategory` sang `scoring.ts` để tránh kéo `server-only` vào môi trường kiểm thử hoặc client.
  - Sửa lỗi import/export và duplicate identifier `parsePartNumberFromCategory` trong `src/modules/toeic/services.ts`.
- **Type Checking (`npm run typecheck`)**: Exit code 0 (TypeScript strict mode sạch 100%).
- **Linter (`npm run lint`)**: Exit code 0 (**✔ No ESLint warnings or errors**).
- **Production Build (`npm run build`)**: Exit code 0. Biên dịch thành công 17 routes (bao gồm `/toeic`, `/toeic/test/[slug]`, `/toeic/result/[attemptId]`). First load JS shared chỉ 103 kB.

---

## 4. Trạng thái Biệt đội AI Persona & Aevum OS (Squad Mode)

- **Biệt đội nòng cốt (Unified Squad)**:
  1. **Triều-FE** (`FE-TRIEU-8D4E2A`, id: `trieu-fe`): Lead UI/UX & Frontend Architect (5+ năm kinh nghiệm, Tailwind CSS, shadcn/ui).
  2. **NTT-Backend** (`BE-NTT-9E3F1A`, id: `ntt-backend`): Senior Backend, SQL & Database Architect (8+ năm kinh nghiệm, PostgreSQL, Supabase RLS, High Concurrency).
  3. **NTT-Data** (`DATA-NTT-4F8B2C`, id: `ntt-data`): Principal Data Intelligence & Reverse Engineering (10+ năm kinh nghiệm, Web Scraping, Mobile App Decryption, Anti-bot bypass, ETL).
- **Squad Mode**: Kích hoạt thành công (`squadMode: true`) trong `active_squad.json`, `squad_mode.json` và đồng bộ qua Aevum OS Model Context Protocol (`aevum_squad_toggle_mode`).
- **Khả năng mở rộng**: Hỗ trợ bổ sung thêm nhân sự mới vào tổ đội linh hoạt theo nhu cầu dự án thông qua MCP hoặc giao diện Aevum OS.


