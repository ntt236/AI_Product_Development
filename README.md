# AI English Learning Platform

Nền tảng học tiếng Anh thích ứng dành cho người mất gốc hoặc chưa biết trình độ. Mục tiêu là giúp người học hiểu mình đang ở đâu, cần học gì tiếp theo và tiến bộ ra sao.

## Core loop
**Assess → Learner Profile → Learning Path → Daily Plan → Learn/Practice → Evidence → Adapt → Repeat**

AI đề xuất và giải thích; người học có quyền chấp nhận, sửa hoặc từ chối. Backend chịu trách nhiệm điểm số, quyền, trạng thái và tiến độ.

## Tech stack
- Next.js + React + TypeScript
- Supabase Auth
- Supabase Database (PostgreSQL nằm bên dưới Supabase; không cần dựng database server riêng)
- Supabase Storage
- External AI APIs qua adapter phía server
- Zod hoặc thư viện tương đương để validate dữ liệu

## Tài liệu
- `docs/product/PRD.md`: yêu cầu sản phẩm
- `docs/product/VISION.md`: tầm nhìn
- `docs/product/DEVELOPMENT_ROADMAP.md`: thứ tự phát triển
- `docs/requirements/`: yêu cầu từng module
- `docs/architecture/`: kiến trúc hệ thống, database, API, AI

Giữ nguyên tài liệu hiện có và chuyển vào thư mục tương ứng; không tạo bản trùng chỉ vì đổi vị trí.

## MVP
1. Auth, profile và onboarding.
2. Placement assessment.
3. Learner profile cơ bản.
4. Learning path có thể accept/edit.
5. Daily plan và một vòng học tập hoàn chỉnh.
6. AI giải thích bài tập/tutor.
7. Vocabulary review cơ bản.
8. Mở rộng TOEIC và các kỹ năng theo roadmap.

## Local setup
1. Cài Node.js LTS phù hợp với phiên bản Next.js đã chọn.
2. Khởi tạo app và cài dependencies.
3. Tạo project Supabase.
4. Copy `.env.example` thành `.env.local`.
5. Điền Supabase URL/public key và AI key phía server.
6. Chạy migrations theo thứ tự.
7. Chạy development server.

Lệnh cụ thể cần được ghi lại sau khi khởi tạo project và chọn package manager. Không commit `.env.local`, AI keys hoặc Supabase service-role key.

## Security baseline
- Bật RLS cho dữ liệu người dùng.
- Kiểm tra quyền sở hữu resource ở server.
- Không đưa service-role key/AI keys ra client.
- Không trả answer key trước khi nộp bài.
- Validate input và AI output.
- Rate limit các tính năng AI.
- Test RLS bằng nhiều tài khoản.

## Development principle
Làm từng vertical slice có dữ liệu thật, validation, quyền và test. Không triển khai mọi module cùng lúc; không cần tự huấn luyện model ở giai đoạn đầu.
