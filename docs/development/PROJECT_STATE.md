# Project State — AI English Learning Platform

**Last Updated:** 2026-10-21  
**Active Branch:** `phase-7`  
**Current Phase:** Phase 7 — Four Skills Implementation (Listening, Reading, Writing, Speaking) with Real Google Gemini AI  
**Next Phase:** Phase 8 — Comprehensive TOEIC Preparation & Full-Length Mock Exams  

---

## 1. Trạng thái mã nguồn & Kiến trúc Bốn Kỹ năng (Four Skills)

- **Framework**: Next.js 15.5.27 (App Router), React 19, TypeScript strict mode.
- **AI Engine**: Google Gemini AI Provider chính thức kích hoạt (`gemini-3.5-flash-lite`, timeout 25s, structured JSON parsing với fallback resilience). Không còn sử dụng mock trong runtime.
- **Styling**: Tailwind CSS v3.4.17 + Hệ thống Component shadcn/ui semantic tokens (HSL), hỗ trợ đầy đủ responsive Desktop, Tablet, Mobile.
- **Mô-đun Four Skills (`src/modules/skills/`)**:
  - `types.ts`: Định nghĩa `SkillItemCatalog`, `WritingEvaluationResult`, `SpeakingEvaluationResult`, Zod schemas `submitWritingInputSchema`, `submitSpeakingInputSchema`.
  - `evaluator.ts`: AI structured evaluator tích hợp rate limit (15 req/5 min), prompt versioning (`writing_eval_v1`, `speaking_eval_v1`), token usage logging và fallback quy chuẩn xác định (`generateFallbackWritingEvaluation`, `generateFallbackSpeakingEvaluation`).
  - `services.ts`: `getSkillsCatalog()`, `submitWritingPractice()`, `submitSpeakingPractice()` cập nhật tiến độ, tính chuỗi học liên tiếp (Streak), ghi nhận learning evidence và mở khóa lũy tiến Learning Path.
  - `actions.ts`: Server Actions an toàn `getSkillsCatalogAction`, `submitWritingPracticeAction`, `submitSpeakingPracticeAction`, `startSkillPracticeAction`.
- **Triển khai chi tiết từng kỹ năng**:
  1. **Listening**:
     - Sử dụng file audio thực tế có thể phát được: `public/audio/daily-conversations-introducing-yourself.wav` (336 KB, giọng bản xứ Mỹ chuẩn).
     - Giao diện phát audio chuyên nghiệp với tùy chỉnh tốc độ phát (`0.8x`, `1.0x`, `1.2x`).
     - Câu hỏi trắc nghiệm bám sát nội dung nghe; chấm điểm server-side; lời thoại chi tiết (Transcript song ngữ) và giải thích chỉ hiển thị sau khi nộp bài hợp lệ.
  2. **Reading**:
     - Bài đọc công sở thực tế (`reading-workplace-announcements-messages`) với thể loại memo/announcement và mục tiêu từ vựng.
     - 5 câu hỏi trắc nghiệm đọc hiểu gắn liền với nội dung bài đọc; bảng tham khảo bài đọc có thể thu gọn/mở rộng trong khi làm bài.
     - Chấm điểm an toàn ở server; không để lộ đáp án (`correct_option_id`) trước khi nộp.
  3. **Writing**:
     - Đề bài thực tế (`writing-introductory-email`) với hướng dẫn tình huống, danh sách checklist yêu cầu cần đạt và mục tiêu 50-150 từ.
     - Trình soạn thảo tương tác với bộ đếm từ và ký tự trực tiếp; cảnh báo nộp bài dưới 10 từ.
     - Chấm điểm AI theo Rubric 4 tiêu chí chuẩn hóa (Task Achievement, Grammar Accuracy, Lexical Resource, Coherence/Organization) tổng 100 điểm kèm tuyên bố rõ ràng không đại diện chứng chỉ CEFR chính thức.
     - Phản hồi chi tiết: nhận xét sư phạm, bảng sửa lỗi ngữ pháp (lỗi cũ vs câu sửa đúng + giải thích tiếng Việt), gợi ý nâng cấp từ vựng, phiên bản tham khảo hoàn thiện (Native Version) kèm lý giải và các bước luyện tập tiếp theo.
  4. **Speaking (Interactive Live Voice Studio, Device Selector & Real-time Speech-to-Text)**:
     - Giao diện Phòng Thu Âm Luyện Nói Trực Tiếp (`Phòng Thu Âm Luyện Nói Trực Tiếp (Voice Studio)`):
       - Cho phép người học nhấn nút Micro và nói trực tiếp vào micro của trình duyệt (`navigator.mediaDevices.getUserMedia` với Auto Gain Control & Noise Suppression).
       - Thu âm chuẩn WAV (Uncompressed 16-bit PCM Audio) qua Web Audio API: tương thích 100% mọi trình duyệt, nhận diện chính xác thời lượng (`00:10`), loại bỏ hoàn toàn lỗi mất tiếng hoặc `Infinity` duration của WebM live stream.
       - Thước đo âm lượng thời gian thực (Real-time Live Microphone Volume Meter): hiển thị trực quan mức tín hiệu thu được từ micro (`0-100%`) để người học nhận biết micro có đang hoạt động hay bị tắt tiếng (mute).
       - Cảnh báo âm lượng thông minh (Silence Warning): tự động phát hiện nếu micro gửi tín hiệu im lặng (peak volume < 1%) và hướng dẫn người học kiểm tra thiết bị.
       - Nhận diện lời nói theo thời gian thực (Real-time Speech-to-Text) qua Web Speech API: hỗ trợ chuyển đổi ngôn ngữ linh hoạt (`en-US` và `vi-VN` thử mic), tự động nối tiếp khi người học ngắt quãng.
       - Sau khi dừng nói: Trình phát Audio HTML5 (`<audio controls src={recordedAudioUrl}>`) hiển thị đầy đủ thời lượng và dung lượng file (ví dụ: `944 KB (WAV chuẩn)`), kèm nút "🔄 Thu âm lại bản mới".
       - Học viên có thể xem và chỉnh sửa nhanh transcript trước khi gửi bài cho AI đánh giá.
       - Trình phát âm mẫu bản xứ (Native TTS Audio): Cho phép học viên nghe giọng đọc chuẩn của đoạn văn mẫu qua `window.speechSynthesis`.
       - AI Gemini chấm điểm phản xạ tự nhiên (0-25), ngữ pháp văn nói (0-30), từ vựng giao tiếp (0-25), độ tự nhiên bản xứ (0-20), sửa lỗi ngữ pháp giao tiếp chi tiết và đưa ra lời khuyên luyện phản xạ.
- **Trang Hub Kỹ năng (`/skills`)**:
  - Giao diện danh mục Four Skills với bộ lọc theo từng kỹ năng (`Tất cả`, `Listening`, `Reading`, `Writing`, `Speaking`) và trạng thái (`Sẵn sàng học` vs `Đang chuẩn bị lộ trình`).
  - Nút "Luyện tập ngay" kích hoạt Server Action `startSkillPracticeAction` tự động tích hợp bài học vào Kế hoạch ngày hôm nay mà không gây trùng lặp.
- **Tích hợp hệ thống học tập cốt lõi**:
  - **Learning Path**: Curriculum bank cập nhật đủ 4 kỹ năng ở cấp độ A1; tự động mở khóa topic tiếp theo khi hoàn thành bài tập.
  - **Daily Plan**: Hỗ trợ đầy đủ các task kỹ năng `listening`, `reading`, `writing`, `speaking`; cộng dồn số phút hoàn thành (`completed_minutes`) và cập nhật trạng thái kế hoạch ngày.
  - **Learning Streak**: Mọi submission thành công (Reading, Listening, Writing, Speaking) tự động kích hoạt `recordStudyActivity` ghi nhận chuỗi ngày học liên tục.
  - **AI Tutor**: Hỗ trợ hỏi đáp đào sâu, giải thích ngữ pháp và quy tắc cho từng câu hỏi đọc/nghe hiểu sau khi nộp bài.

---

## 2. Trạng thái Database Schema & Supabase

- **Migrations hiện có**:
  - `supabase/migrations/20261019_phase_6_vocabulary_review.sql`
  - `supabase/migrations/20261020_streak_and_calendar_schedule.sql`
  - `supabase/migrations/20261021_phase_7_four_skills.sql` (File DDL tham khảo tương thích cho Phase 7)
- **Dữ liệu thực tế trên Supabase**:
  - `content_items`: Đã seed thành công các bài học Four Skills:
    - `listening-daily-conversations-introducing-yourself` (`content_type: 'listening'`, `skill: 'listening'`)
    - `reading-workplace-announcements-messages` (`content_type: 'reading'`, `skill: 'reading'`)
    - `writing-introductory-email` (`content_type: 'practice'`, `skill: 'writing'`)
    - `speaking-daily-life-introduction` (`content_type: 'practice'`, `skill: 'speaking'`)
  - `practice_exercises` & `practice_exercise_answers`: 5 câu hỏi đọc hiểu kèm đáp án và giải thích bảo mật server-side.
  - `practice_submissions` & `learning_evidence`: Lưu kết quả, điểm số, rubric AI và bằng chứng học tập an toàn.

---

## 3. Trạng thái Kiểm thử, Build & Audit Kỹ thuật (Bởi NTT-Backend)

- **Automated Tests (`npm test`)**:
  - **146/146 tests passed** across 26 suites (0 fail, 0 skip).
  - Bao gồm bộ test `tests/skills/four_skills_lifecycle.test.mjs` (13/13 passed) kiểm tra:
    1. Tồn tại và dung lượng file audio thật (> 100KB).
    2. Danh mục `getSkillsCatalog` đủ 4 kỹ năng và phân biệt Ready vs Planned.
    3. Hàm đếm từ `countWords` chuẩn xác với các ký tự biên.
    4. Validation Zod và bounds checking cho Writing.
    5. Bộ chấm quy chuẩn Writing Rubric 100 điểm và fallback heuristic.
    6. Validation Zod và bounds checking cho Speaking Transcript-First.
    7. Bộ chấm quy chuẩn Speaking Rubric 100 điểm và native sample response.
    8. Curriculum bank tích hợp đủ 4 kỹ năng ở cấp độ A1.
    9. Bộ khớp `matchTopicToContentItem` chính xác giữa topic và content item.
    10. Schema Zod hỗ trợ linh hoạt `taskId` rỗng (`""`), `null`, `undefined` mà không lỗi UUID format.
    11. **Anti-IDOR**: Xác minh quyền sở hữu `taskId` (`user_id = userId`) ngăn chặn tấn công chéo người dùng.
    12. **Anti-Minute Inflation**: Chống tăng trùng lặp số phút hoàn thành (`completed_minutes`) khi nộp bài nhiều lần.
    13. **Score Clamping**: Điểm số luôn được kẹp an toàn trong khoảng `[0, 100]`.
- **Type Checking (`npm run typecheck`)**: Exit code 0 (TypeScript strict mode sạch 100%).
- **Linter (`npm run lint`)**: Exit code 0 (**✔ No ESLint warnings or errors**).
- **Production Build (`npm run build`)**: Exit code 0. Biên dịch thành công toàn bộ 14 routes trong 5.2s (bao gồm `/skills`, `/daily-plan/practice/[taskId]`, `/vocabulary`, `/learning-path`, `/dashboard`, `/assessment`). First load JS shared chỉ 103 kB.

---

## 4. Việc cần làm tiếp theo (Next Action)

- Chuyển sang **Phase 8 — Comprehensive TOEIC Preparation & Full-Length Mock Exams** theo lộ trình chính thức:
  - Cấu trúc Part 1-7 chuẩn format đề thi TOEIC.
  - Đồng hồ bấm giờ thi thử (2 giờ / 200 câu) và bảng quy đổi điểm TOEIC 10-990.
  - Phân tích điểm mạnh/yếu theo từng Part và đề xuất lộ trình ôn luyện trọng tâm.

