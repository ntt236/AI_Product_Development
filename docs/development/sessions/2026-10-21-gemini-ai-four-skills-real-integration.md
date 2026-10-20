# Session Report: Real Gemini AI Integration & Four Skills Pedagogical Perfection

- **Date:** 2026-10-21 (Local: 2026-10-20T21:20:00+07:00)
- **Role:** AI Senior Lead Engineer & Pedagogical Architect (Pair Programming with User)
- **Primary Objective:** 
  1. Kích hoạt và tích hợp AI Google Gemini thật vào hệ thống thay thế hoàn toàn mock fallback.
  2. Sửa lỗi hiển thị và chuẩn hóa luồng học của đủ 4 kỹ năng: Listening, Reading, Writing, Speaking theo đúng yêu cầu sư phạm học tiếng Anh.

---

## 1. Bối cảnh & Nguyên nhân gốc rễ (Root Causes)

1. **AI Provider Fallback sang Mock:**
   - File cấu hình môi trường `.env.local` có `AI_PROVIDER=gemini` nhưng thiếu `GEMINI_API_KEY`. Do đó, hàm `getAIProvider()` luôn fallback về `new MockAIProvider()`.
   - Provider `GeminiProvider` trước đây đặt default model là `gemini-1.5-flash`, phiên bản này trên Google AI Studio đã nâng cấp lên thế hệ `gemini-3.5-flash-lite` và `gemini-3.5-flash`.
2. **Lỗi hiển thị bài đọc (Reading Passage Bug):**
   - Trong database, bài đọc `reading-workplace-announcements-messages` lưu trữ nội dung dưới các trường `body.passage_title`, `body.passage_text`, `body.reading_tips`, và `body.vocabulary_highlights`.
   - Trong khi đó, component `practice-session-view.tsx` lại kiểm tra cứng điều kiện `contentItem.body?.passage && contentItem.body.passage.paragraphs`. Do `passage` là undefined, toàn bộ văn bản đọc hiểu, mẹo đọc quét và sổ từ vựng đều bị ẩn, khiến người học thấy trang trắng không có nội dung để đọc.
   - Khi làm bài tập (Step 2), hộp tham khảo bài đọc thu gọn cũng không hiển thị được.
3. **Thiếu liên kết sư phạm cho Writing & Speaking:**
   - Đề bài Writing có hướng dẫn cấu trúc email (`email_template_guide`) và mẫu câu hữu ích (`useful_expressions`) nhưng chưa hiển thị trong Step 1 & Step 2.
   - Đề bài Speaking có các câu hỏi gợi ý (`suggested_cue_points`) và mẹo giao tiếp (`conversational_tips`) nhưng chưa hiển thị trong Step 1 & Step 2.

---

## 2. Giải pháp kỹ thuật & Triển khai chi tiết

### 2.1. Cấu hình & Tối ưu hóa Real Gemini Provider
- Cập nhật `.env.local`:
  - `AI_PROVIDER=gemini`
  - `GEMINI_API_KEY`: Kích hoạt API key chính thức do người dùng cung cấp.
  - `GEMINI_MODEL=gemini-3.5-flash-lite`: Sử dụng model tối ưu về tốc độ phản hồi (~2s), độ ổn định cao và không bị nghẽn demand.
- Hoàn thiện `src/lib/ai/providers/gemini.ts`:
  - Đặt default model: `gemini-3.5-flash-lite`.
  - Tăng timeout từ 10s lên 25s (`timeoutMs: 25000`) nhằm đảm bảo các prompt rubric phức tạp không bị timeout trên mạng công cộng.
  - Tăng độ bền vững khi bóc tách JSON structured output: thuật ngữ regex/substring tự động cắt từ ký tự `{` hoặc `[` đầu tiên đến `}` hoặc `]` cuối cùng, xử lý triệt để trường hợp AI trả về markdown code blocks hoặc lời dẫn.

### 2.2. Chuẩn hóa dữ liệu 4 kỹ năng trong `practice-session-view.tsx`
- **Reading**:
  - Chuẩn hóa: `passageTitle`, `passageParagraphs` (tự động phân tách đoạn văn từ `passage_text` hoặc `passage.paragraphs`), `readingTips`, `readingVocab`.
  - Step 1: Hiển thị đầy đủ bài thông báo công sở (Office Memo), thể loại, thời gian đọc gợi ý, mẹo đọc quét (Skimming & Scanning) và sổ từ vựng cốt lõi 5 từ kèm nút "Lưu vào sổ từ".
  - Step 2: Hộp văn bản tham khảo dạng thu gọn/mở rộng trong khi làm 5 câu hỏi trắc nghiệm đọc hiểu.
  - Step 3: Hiển thị điểm số, giải thích chi tiết từng câu, hộp đối chiếu lại văn bản bài đọc và nút "Hỏi AI Tutor giải thích sâu hơn" gọi Gemini thật.
- **Writing**:
  - Step 1: Hiển thị tình huống (Scenario), Checklist yêu cầu, Cấu trúc gợi ý email (Mở đầu, Thân bài, Kết thư), danh sách Mẫu câu hữu ích và Thang điểm Rubric 4 tiêu chí (100đ).
  - Step 2: Hiển thị đề bài, checklist và hộp gợi ý mẫu câu hữu ích ngay trên khu vực soạn thảo. Bộ đếm từ và ký tự trực tiếp.
  - Nộp bài: Gửi về Server Action `submitWritingPracticeAction` -> gọi `evaluateWriting()` chạy trực tiếp với Google Gemini AI.
  - Step 3: Trả về kết quả đánh giá AI thật (`evaluation_source: 'ai_provider'`):
    - Điểm số 4 tiêu chí Rubric: Task Achievement (20/25), Grammar Accuracy (28/30), Lexical Resource (20/25), Coherence & Org (18/20).
    - Nhận xét sư phạm tổng quan bằng tiếng Việt.
    - Bảng sửa lỗi ngữ pháp chi tiết (lỗi cũ vs câu sửa đúng + giải thích lý do).
    - Gợi ý nâng cấp từ vựng & diễn đạt.
    - Phiên bản bài viết tham khảo hoàn thiện (Native Version) kèm lý giải.
    - Các bước luyện tập tiếp theo.
- **Speaking (Transcript-First)**:
  - Step 1: Hiển thị câu hỏi đàm thoại, các ý gợi ý trả lời (Cue Points), mẹo nói tự nhiên (Conversational Tips) và hướng dẫn phương pháp Transcript-First.
  - Step 2: Hiển thị câu hỏi gợi ý và mẹo nói tự nhiên ngay trên khu vực nhập transcript.
  - Nộp bài: Gửi về Server Action `submitSpeakingPracticeAction` -> gọi `evaluateSpeaking()` chạy trực tiếp với Google Gemini AI.
  - Step 3: Trả về kết quả đánh giá phản xạ AI thật (`evaluation_source: 'ai_provider'`):
    - Điểm số 4 tiêu chí: Relevance & Fluency (23/25), Spoken Grammar (27/30), Conversational Vocab (18/25), Naturalness (15/20).
    - Nhận xét phản xạ & độ tự nhiên.
    - Bảng sửa lỗi ngữ pháp văn nói (ví dụ: sửa `seven oclock` thành `seven o'clock`).
    - Bài nói mẫu bản xứ tham khảo (Sample Spoken Answer) kèm các cụm từ đắt giá (`start my day`, `head to the office`, `downtime`, `unwind`) và lý do tự nhiên.
    - Gợi ý bài tập phản xạ tiếp theo.
- **Listening**:
  - Giao diện phát Audio bản xứ Mỹ chuẩn với tùy chỉnh tốc độ `0.8x`, `1.0x`, `1.2x`.
  - Giữ bảo mật Transcript trong khi làm bài; tự động mở khóa Transcript song ngữ, Audio phát lại và AI Tutor sau khi nộp bài.

---

## 3. Bằng chứng kiểm thử & Xác minh thực tế (Verification Evidence)

1. **Kiểm tra TypeScript Strict Mode:**
   - `npx tsc --noEmit` -> Exit code 0 (Hoàn toàn sạch lỗi type).
2. **Kiểm tra Linter:**
   - `npm run lint` -> Exit code 0 (`✔ No ESLint warnings or errors`).
3. **Kiểm tra Automated Test Suite:**
   - `npm test` -> **146/146 tests passed** (0 fail, 0 skip).
4. **Kiểm thử trực tiếp trên Trình duyệt bằng Browser Subagent:**
   - Đăng nhập thành công với tài khoản học viên Triều.
   - **Reading Test**: Hoàn thành bài đọc, hiển thị đầy đủ văn bản Office Memo, làm 5 câu trắc nghiệm đạt 5/5 (100%), giải thích rõ ràng từng câu. (Ảnh minh chứng: `reading_step1_1792505535402.png`, `reading_score_5_5_1792505659603.png`).
   - **Writing Test**: Soạn thảo và nộp bài viết 51 từ. Gemini AI đánh giá trả về 86/100 điểm, nhận xét chi tiết, chỉ ra lỗi lặp "I want to", đề xuất phiên bản bản xứ. (Ảnh minh chứng: `writing_gemini_result_1792505780515.png`).
   - **Speaking Test**: Soạn thảo và nộp transcript nói 51 từ. Gemini AI đánh giá trả về 83/100 điểm, nhận xét độ trôi chảy, sửa lỗi chính tả ngữ pháp nói `seven oclock`, cung cấp bài nói mẫu kèm cụm từ bản xứ. (Ảnh minh chứng: `speaking_gemini_result_1792505875423.png`).
5. **Kiểm tra bản ghi Database Supabase từ xa:**
   - `practice_submissions`: Lưu thành công các bản ghi nộp bài với `Source: ai_provider` (100% Gemini thật, không sử dụng mock hay fallback).

---

## 4. Trạng thái mã nguồn & Bàn giao

- Các file đã chỉnh sửa:
  - `.env.local`
  - `src/lib/ai/providers/gemini.ts`
  - `src/modules/skills/evaluator.ts`
  - `src/modules/ai-tutor/services.ts`
  - `src/app/(app)/daily-plan/practice/[taskId]/practice-session-view.tsx`
  - `docs/development/PROJECT_STATE.md`
  - `docs/development/sessions/2026-10-21-gemini-ai-four-skills-real-integration.md`
- Hệ thống hoạt động trơn tru, sẵn sàng cho người dùng học tập thực tế và chuẩn bị bước vào Phase 8 (Luyện thi TOEIC toàn diện).
