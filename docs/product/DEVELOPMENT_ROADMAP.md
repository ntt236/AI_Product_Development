# DEVELOPMENT_ROADMAP.md

## Nguyên tắc
Phát triển theo vertical slice: hoàn thành một luồng có UI, dữ liệu, validation, quyền và test trước khi mở rộng. Mốc thời gian tùy quỹ thời gian và kinh nghiệm; ưu tiên đầu ra thay vì chạy theo ngày cố định.

## MVP — phải có
- Auth, profile, onboarding.
- Mục tiêu chính/phụ và thời gian học.
- Placement assessment cơ bản.
- Learner Profile: level ước lượng và kỹ năng mạnh/yếu.
- Learning Path được đề xuất và user có thể accept/edit/reject.
- Daily Plan có complete/skip.
- Một nhóm nội dung nền tảng và bài tập khách quan.
- Dashboard tiến độ cơ bản.
- AI giải thích bài tập hoặc tutor có rate limit.
- RLS, validation, logging và test luồng chính.

## Chưa cần trong MVP
- TOEIC full mock test hoàn chỉnh.
- Chấm phát âm tự động chất lượng cao.
- AI tạo toàn bộ nội dung học.
- Spaced repetition phức tạp.
- Mô hình ML tự huấn luyện, microservices, leaderboard và social learning.

## Phase 0 — Foundation
- Rà soát PRD, Vision, yêu cầu module và kiến trúc.
- Khởi tạo Next.js + TypeScript.
- Tạo Supabase project.
- Thiết lập env, lint, format, test và README.
**Done khi:** app chạy local, setup lặp lại được và secret không bị commit.

## Phase 1 — Auth, profile, onboarding
- Signup/login/logout.
- Profile, goals, primary goal và daily minutes.
- Lưu tiến trình onboarding.
**Done khi:** dữ liệu user tồn tại sau khi đăng nhập lại và user khác không thể đọc/sửa dữ liệu.

## Phase 2 — Assessment
- Question bank ban đầu.
- Start attempt, save answer, submit.
- Scoring engine deterministic.
- Lưu kết quả và skill profile.
**Done khi:** answer key không lộ ở client, submit không ghi điểm trùng và scoring có test.

## Phase 3 — Learner Profile + Learning Path
- Tổng hợp placement result.
- Đề xuất lộ trình bằng rule-based trước; AI giúp giải thích và trình bày.
- Accept/edit/reject/pause và versioning.
**Done khi:** AI không ghi đè thay đổi của người dùng.

## Phase 4 — Daily Plan + practice
- Tạo plan theo thời lượng.
- Học một nội dung và làm bài tập.
- Lưu evidence/events.
- Complete/skip/reorder hoạt động.
**Done khi:** kết quả activity cập nhật tiến độ và có ảnh hưởng hợp lý đến kế hoạch sau.

## Phase 5 — AI Tutor
- Provider abstraction.
- Prompt versioning, output validation.
- Giải thích câu sai/tutor theo context.
- Rate limit, timeout, fallback và usage logging.
**Done khi:** AI lỗi không làm mất kết quả học và API key chỉ nằm server.

## Phase 6 — Vocabulary review
- Từ vựng curated, sổ từ cá nhân, lịch review đơn giản.
**Done khi:** từ đến hạn được hiển thị chính xác, review không tạo bản ghi trùng.

## Phase 7 — Four skills
- Listening/Reading content và câu hỏi.
- Writing prompt + feedback.
- Speaking transcript trước; phân tích audio sau khi pipeline sẵn sàng.
**Done khi:** mỗi kỹ năng có ít nhất một flow hoàn chỉnh.

## Phase 8 — TOEIC
- Parts 1–7, luyện từng Part, mini test, review lỗi.
- Full test khi có đủ nội dung.
- Scoring config có version và phân tích theo Part/kỹ năng.
**Done khi:** phân biệt rõ bài luyện nội bộ và đề chính thức; scoring được kiểm thử.

## Phase 9 — Hardening & deploy
- E2E test: signup → placement → path → daily plan → practice.
- RLS test nhiều user, responsive, accessibility và performance.
- Error tracking, quy trình backup/xóa dữ liệu, deploy và smoke test.
**Done khi:** có hướng dẫn deploy, kiểm tra secrets và rollback cơ bản.

## Thứ tự ưu tiên nếu làm một mình
1. Auth + profile + goals.
2. Placement test.
3. Learner dashboard.
4. Learning path proposal + accept/edit.
5. Daily plan + một bài học mẫu.
6. AI explanation/tutor.
7. Vocabulary review.
8. Listening/reading/writing/speaking.
9. TOEIC mở rộng.

## Definition of Done
- Validation đầu vào.
- Loading/empty/error/success states.
- Quyền và RLS đúng.
- Test logic quan trọng.
- Log không chứa secret.
- Responsive cơ bản.
- Không trình bày dữ liệu demo như kết quả thật.

## Metrics MVP
- Tỷ lệ onboarding hoàn thành.
- Tỷ lệ bắt đầu/hoàn thành placement.
- Tỷ lệ accept hoặc edit learning path.
- Hoạt động học hoàn thành mỗi tuần.
- Retention 7 ngày.
- Độ chính xác bài tập theo kỹ năng.
- AI success rate, latency và chi phí trung bình/user.
