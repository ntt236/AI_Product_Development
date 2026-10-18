# Project State — AI English Learning Platform

**Last Updated:** 2026-10-17  
**Active Branch:** `phase-5`  
**Current Phase:** Phase 5 — AI Tutor (Provider Abstraction, Prompt Versioning, Level-Adaptive Explanations, Anti-IDOR, Rate Limiting, Usage Telemetry, UI Integration, Migration & Automated Tests Complete)  
**Next Phase:** Phase 6 — Vocabulary Notebook & Spaced Repetition (SRS)  

---

## 1. Trạng thái mã nguồn & kiến trúc
- **Framework**: Next.js 15.5.27 (App Router), React 19, TypeScript strict mode.
- **Kiến trúc**: Modular Monolith (`src/modules/auth`, `src/modules/profile`, `src/modules/onboarding`, `src/modules/assessment`, `src/modules/learning-path`, `src/modules/daily-plan`, `src/modules/ai-tutor`, `src/lib/ai`).
- **Phase 5 — AI Tutor Implementation**:
  - **AI Provider Abstraction (`src/lib/ai/`)**:
    - Chuẩn hóa giao diện `AIProvider` hỗ trợ cả text streaming và structured JSON generation.
    - Hỗ trợ phân tầng tự động (`getAIProvider()`):
      1. Google Gemini 1.5 Flash (`src/lib/ai/providers/gemini.ts`) khi có `GEMINI_API_KEY`.
      2. OpenAI GPT-4o-mini (`src/lib/ai/providers/openai.ts`) khi có `OPENAI_API_KEY`.
      3. Mock Provider (`src/lib/ai/providers/mock.ts`) sinh phản hồi sư phạm xác định cho môi trường offline và automated tests.
    - Tích hợp timeout an toàn qua `AbortController` (10s) chống treo server.
  - **Prompt Versioning & Pedagogical Tone Adaptation (`src/modules/ai-tutor/prompts.ts`)**:
    - Prompt version xác định: `tutor_exercise_explanation_v1`.
    - Thích ứng giọng điệu sư phạm theo trình độ CEFR thực tế của người học:
      - A1/A2: Từ vựng giản dị, dịch nghĩa chi tiết, khích lệ nhẹ nhàng.
      - B1/B2: Đi sâu vào sắc thái nghĩa, collocations, phân biệt các cấu trúc tương đồng.
    - Gắn kết với mục tiêu chính của học viên (TOEIC, Giao tiếp công sở, Đời sống hàng ngày).
    - Cấu trúc đầu ra bắt buộc theo Zod Schema (`AITutorExplanationSchema`): Lời giải thích, Tóm tắt quy tắc ngữ pháp/từ vựng, 2 ví dụ minh họa song ngữ Anh - Việt, Gợi ý ôn tập tiếp theo.
  - **Anti-IDOR & Zero-Trust Exercise Context (`src/modules/ai-tutor/context.ts`)**:
    - Xác thực quyền sở hữu bài nộp: Chỉ chủ sở hữu bài nộp mới được phép yêu cầu AI giải thích.
    - Trích xuất dữ liệu câu hỏi và đáp án trực tiếp từ kết quả chấm thẩm quyền của server trong `practice_submissions`.
    - Client không thể làm sai lệch ngữ cảnh câu hỏi hoặc tự nhận đáp án đúng/sai.
  - **Server-Side Rate Limiter (`src/lib/ai/rate-limiter.ts`)**:
    - Giới hạn 10 yêu cầu / 5 phút trên mỗi `user_id`.
    - Thực thi qua stored procedure nguyên tử `check_and_increment_ai_rate_limit` trên PostgreSQL, kèm cơ chế tự phục hồi In-Memory Rate Limiter khi database RPC chưa sẵn sàng.
    - Trả về mã lỗi `RATE_LIMITED` kèm `retryAfterSeconds`.
  - **Usage Telemetry & Secret Sanitization (`src/lib/ai/usage-logger.ts`)**:
    - Ghi nhận chi tiết vào `public.ai_generations`: `user_id`, `provider`, `model`, `prompt_version`, `status`, `latency_ms`, `token_count`, `metadata`.
    - Bảo mật tuyệt đối: Không lưu trữ API keys, Authorization headers hay thông tin nhạy cảm vào database.
  - **Resilient Degradation & Non-Destructive Invariance**:
    - Khi AI Provider lỗi/timeout, hệ thống tự động trả về phản hồi sư phạm chuẩn mực dự phòng (fallback) trích xuất từ câu hỏi và lời giải thích của giáo trình.
    - **Tính bất biến**: AI Tutor hoạt động 100% read-only đối với điểm số, tiến độ lộ trình và hồ sơ người học; không bao giờ xóa hay làm mất bài nộp đã lưu.
  - **UI Integration (`src/app/(app)/daily-plan/practice/[taskId]/practice-session-view.tsx`)**:
    - Tích hợp nút "🤖 Hỏi AI Tutor phân tích sâu hơn câu này" vào từng thẻ câu hỏi ở màn hình kết quả luyện tập.
    - Giao diện phản hồi trực quan: Loading spinner, hiển thị thẻ phân tích chuyên sâu, quy tắc cốt lõi, ví dụ mở rộng song ngữ, gợi ý ôn tập và form đặt câu hỏi thắc mắc thêm.
    - Hiển thị văn bản đáp án thật của người học và đáp án chuẩn thay vì mã `opt_` thô.

---

## 2. Trạng thái Database Schema & Migration
- **Phase 1**: [supabase/migrations/20261012_phase_1_auth_profile_onboarding.sql](file:///d:/AI_Product_Development/supabase/migrations/20261012_phase_1_auth_profile_onboarding.sql) — **Đã áp dụng trên Supabase remote**.
- **Phase 2 (Cơ sở & Hardening)**: [supabase/migrations/20261013_phase_2_placement_assessment.sql](file:///d:/AI_Product_Development/supabase/migrations/20261013_phase_2_placement_assessment.sql) & [supabase/migrations/20261014_phase_2_security_hardening.sql](file:///d:/AI_Product_Development/supabase/migrations/20261014_phase_2_security_hardening.sql) — **Đã áp dụng trên Supabase remote**.
- **Phase 3 (Learning Path)**: [supabase/migrations/20261015_phase_3_learning_path.sql](file:///d:/AI_Product_Development/supabase/migrations/20261015_phase_3_learning_path.sql) — **Đã hoàn thiện mã nguồn, chờ người dùng áp dụng trên remote qua Supabase SQL Editor**.
- **Phase 4 (Daily Plan & Practice)**: [supabase/migrations/20261016_phase_4_daily_plan_practice.sql](file:///d:/AI_Product_Development/supabase/migrations/20261016_phase_4_daily_plan_practice.sql) — **Đã hoàn thiện mã nguồn, chờ người dùng áp dụng trên remote qua Supabase SQL Editor**.
- **Phase 5 (AI Tutor — Migration mới)**: [supabase/migrations/20261017_phase_5_ai_tutor.sql](file:///d:/AI_Product_Development/supabase/migrations/20261017_phase_5_ai_tutor.sql)
  - **Trạng thái**: **ĐÃ TẠO VÀ HOÀN TẤT AUDIT BẢO MẬT TRONG REPOSITORY. CHƯA CHẠY TRÊN SUPABASE REMOTE.**
  - **Bảng mới tạo**:
    - `public.ai_generations`: Lưu lịch sử gọi AI, đo độ trễ, số token, version prompt và telemetry lỗi.
    - `public.ai_rate_limits`: Lưu số lần gọi trong cửa sổ 5 phút của từng user.
  - **Stored Procedure**:
    - `public.check_and_increment_ai_rate_limit(p_user_id, p_window_start, p_max_requests)` với `SECURITY DEFINER SET search_path = ''` và kiểm tra tham số phòng thủ.
    - `public.cleanup_expired_ai_rate_limits(p_older_than)` quy trình dọn dẹp các cửa sổ hết hạn định kỳ.
  - **Bảo mật & RLS**:
    - RLS được bật và bắt buộc (FORCE ROW LEVEL SECURITY).
    - `authenticated` chỉ được phép SELECT lịch sử của chính mình (`auth.uid() = user_id`).
    - Thu hồi toàn bộ quyền INSERT/UPDATE/DELETE trực tiếp từ client trên các bảng AI.
    - **Quyền EXECUTE của các stored procedure AI Tutor được thu hồi hoàn toàn khỏi public/anon/authenticated và chỉ cấp duy nhất cho `service_role`** (triệt tiêu nguy cơ DoS quota từ client).

---

## 3. Trạng thái kiểm thử
- `npm test`: Exit code 0 (**104/104 tests passed** across 8 suites).
  - Assessment Core & Scoring Engine: 12 tests.
  - Assessment Lifecycle & IDOR: 18 tests.
  - Phase 3 Generator & Weakness Detection: 8 tests.
  - Phase 3 Lifecycle, Security & Concurrency: 18 tests.
  - Phase 4 Daily Plan Generator Suite: 5 tests.
  - Phase 4 Practice Scoring & Lifecycle Engine: 7 subtests.
  - **Learning Path Real Content Linkage & Lifecycle Suite (`tests/learning-path/content_linkage_and_lifecycle.test.mjs`)**: 8 tests (Real content matching, non-spoofed planned items, elimination of Phase 4 outdated notices, start practice task integration, progressive unlocking without reset).
  - **Phase 5 AI Tutor & Lifecycle Suite (`tests/ai-tutor/ai_tutor_and_lifecycle.test.mjs`)**: 28 tests (Prompt versioning, CEFR level adaptation, Zod runtime validation, Mock provider, Provider hierarchy fallback, Server-side rate limiter, Anti-IDOR, Secret protection, Resilient fallback, Non-destructive invariance, Concurrency bursts, Deep secret redaction, RPC permission hardening, Retention cleanup).
- `npx tsc --noEmit`: Exit code 0 (TypeScript strict mode hoàn toàn sạch lỗi).
- `npm run lint`: Exit code 0 ("No ESLint warnings or errors").
- **Phân định rõ ràng các cấp độ kiểm thử**:
  - *Automated unit & integration tests*: Đã kiểm chứng 100% logic AI Tutor, Learning Path content linkage, prompt registry, validation, rate limiting, anti-IDOR và failure handling.
  - *Kiểm thử trên Supabase Remote*: Migration Phase 3, Phase 4 và Phase 5 **CHƯA ĐƯỢC CHẠY** trên Supabase remote. Cần người dùng chạy tuần tự qua Supabase SQL Editor.

---

## 4. Việc cần làm tiếp theo (Next Action)
- Người dùng thực hiện chạy 3 migration trên Supabase Dashboard -> SQL Editor theo thứ tự:
  1. `supabase/migrations/20261015_phase_3_learning_path.sql`
  2. `supabase/migrations/20261016_phase_4_daily_plan_practice.sql`
  3. `supabase/migrations/20261017_phase_5_ai_tutor.sql`
- Cấu hình biến môi trường server nếu dùng AI thật: `GEMINI_API_KEY` (hoặc `OPENAI_API_KEY`). Nếu không cấu hình, hệ thống sẽ tự động dùng MockAIProvider cho trải nghiệm mượt mà không crash.
- Sẵn sàng chuyển tiếp sang **Phase 6 — Vocabulary Notebook & Spaced Repetition (SRS)**.

