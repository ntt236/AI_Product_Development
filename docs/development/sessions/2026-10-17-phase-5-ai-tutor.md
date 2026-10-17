# Báo Cáo Phiên Làm Việc: Triển Khai Toàn Bộ Phase 5 (AI Tutor)

**Ngày thực hiện:** 2026-10-17  
**Nhánh:** `phase-5`  
**Mục tiêu:** Triển khai toàn bộ Phase 5: AI Tutor theo đúng phạm vi và Definition of Done trong `docs/product/DEVELOPMENT_ROADMAP.md`. Cung cấp khả năng giải thích ngữ cảnh sâu sắc cho bài tập luyện tập, phân tích đúng/sai, trích xuất quy tắc cốt lõi, ví dụ mở rộng song ngữ Anh - Việt, định hướng bước học tiếp theo phù hợp với trình độ ước lượng CEFR và mục tiêu chính của học viên. Đảm bảo bảo mật đa lớp (Zero-Trust, Anti-IDOR, Server-only Secrets), giới hạn tần suất gọi (Rate Limiting), đo lường sử dụng (Usage Telemetry) và cơ chế tự phục hồi (Resilient Fallback) bảo vệ điểm số bài làm.

---

## 1. Kết quả triển khai theo Vertical Slices

### Slice 5.1 — Database Migration, Usage Telemetry & Atomic Rate Limiter
- **Tạo migration file**: [supabase/migrations/20261017_phase_5_ai_tutor.sql](file:///d:/AI_Product_Development/supabase/migrations/20261017_phase_5_ai_tutor.sql)
- **Các bảng cốt lõi**:
  - `public.ai_generations`: Lưu vết toàn bộ lịch sử gọi AI phục vụ audit, đo lường hiệu năng và chi phí (`user_id`, `feature`, `provider`, `model`, `prompt_version`, `status`, `prompt_tokens`, `completion_tokens`, `total_tokens`, `latency_ms`, `estimated_cost_usd`, `error_code`, `metadata`).
  - `public.ai_rate_limits`: Lưu số lượng yêu cầu của từng người học theo cửa sổ thời gian 5 phút (`user_id`, `window_start`, `request_count`, `unique(user_id, window_start)`).
- **Stored Procedure nguyên tử (Atomic Rate Limiter)**:
  - `public.check_and_increment_ai_rate_limit(p_user_id uuid, p_window_start timestamptz, p_max_requests integer default 10)`
  - Thực thi với `SECURITY DEFINER SET search_path = ''` và schema-qualified identifiers (`public.*`).
  - **Kiểm tra tham số phòng thủ**: Kiểm tra `p_user_id` không null, `p_window_start` không null và không nằm trong tương lai, `p_max_requests > 0`.
- **Thủ tục dọn dẹp vận hành (Operational Maintenance)**:
  - `public.cleanup_expired_ai_rate_limits(p_older_than interval default interval '1 day')`: Tự động xóa an toàn các cửa sổ rate limit cũ mà không ảnh hưởng tới các cửa sổ đang hoạt động.
- **Bảo mật RLS & Least Privilege**:
  - Bật và ép buộc RLS (`ENABLE ROW LEVEL SECURITY`, `FORCE ROW LEVEL SECURITY`).
  - Phân quyền nghiêm ngặt: Role `authenticated` chỉ có quyền SELECT lịch sử gọi của chính mình (`auth.uid() = user_id`).
  - Toàn bộ quyền INSERT, UPDATE, DELETE trực tiếp bị thu hồi hoàn toàn khỏi role `authenticated`, `anon` và `public`.
  - **Bảo mật RPC**: Quyền `EXECUTE` của stored procedure `check_and_increment_ai_rate_limit` và `cleanup_expired_ai_rate_limits` được **thu hồi hoàn toàn khỏi public/anon/authenticated và chỉ cấp duy nhất cho `service_role`**, triệt tiêu nguy cơ DoS quota của người khác hoặc né quota từ client.

### Slice 5.2 — AI Provider Abstraction & Fallback Hierarchy
- **Mã nguồn**:
  - [src/lib/ai/types.ts](file:///d:/AI_Product_Development/src/lib/ai/types.ts): Định nghĩa giao diện `AIProvider`, kiểu dữ liệu prompt có cấu trúc, validator runtime, token usage và rate limit check result.
  - [src/lib/ai/providers/gemini.ts](file:///d:/AI_Product_Development/src/lib/ai/providers/gemini.ts): Provider Google Gemini 1.5 Flash sử dụng native fetch, tích hợp `AbortController` (10s timeout), trích xuất token usage và parse JSON có cấu trúc.
  - [src/lib/ai/providers/openai.ts](file:///d:/AI_Product_Development/src/lib/ai/providers/openai.ts): Provider OpenAI GPT-4o-mini hỗ trợ `response_format: { type: 'json_object' }`, native timeout và đo lường token.
  - [src/lib/ai/providers/mock.ts](file:///d:/AI_Product_Development/src/lib/ai/providers/mock.ts): Provider giả lập xác định (deterministic mock) thông minh, tự động nhận biết ngữ cảnh câu hỏi, tạo phản hồi sư phạm chuẩn mực phục vụ phát triển offline và automated tests mà không cần tốn chi phí gọi API thật.
  - [src/lib/ai/rate-limiter.ts](file:///d:/AI_Product_Development/src/lib/ai/rate-limiter.ts): Quản lý giới hạn tần suất 10 requests / 5 phút, ưu tiên gọi PostgreSQL RPC và tự động fallback sang In-Memory bucket nếu database chưa áp dụng migration.
  - [src/lib/ai/usage-logger.ts](file:///d:/AI_Product_Development/src/lib/ai/usage-logger.ts): Ghi nhận telemetry sử dụng và độ trễ vào `ai_generations`, tuyệt đối loại bỏ các thông tin nhạy cảm.
  - [src/lib/ai/index.ts](file:///d:/AI_Product_Development/src/lib/ai/index.ts): Factory phân tầng linh hoạt (`getAIProvider()`): Gemini -> OpenAI -> Mock.

### Slice 5.3 — AI Tutor Module, Versioned Prompts & Anti-IDOR Context
- **Mã nguồn**:
  - [src/modules/ai-tutor/types.ts](file:///d:/AI_Product_Development/src/modules/ai-tutor/types.ts):
    - `ExerciseExplanationRequestSchema`: Zod schema kiểm tra đầu vào (UUID của `submissionId`, `exerciseId`, `userQuery` tối đa 300 ký tự).
    - `AITutorExplanationSchema`: Zod schema kiểm tra đầu ra của AI (`explanation`, `rule_summary`, `examples` [1..5 câu có dịch nghĩa], `next_step_tip`).
  - [src/modules/ai-tutor/prompts.ts](file:///d:/AI_Product_Development/src/modules/ai-tutor/prompts.ts):
    - Đăng ký version định danh: `TUTOR_EXERCISE_EXPLANATION_VERSION = 'tutor_exercise_explanation_v1'`.
    - Thích ứng giọng điệu theo trình độ CEFR thực tế:
      - *A1/A2*: Dùng từ ngữ giản dị, không lạm dụng thuật ngữ ngữ pháp phức tạp, dịch nghĩa chi tiết, khích lệ nhẹ nhàng.
      - *B1/B2*: Phân tích sâu sắc thái nghĩa, collocations, phân biệt các cấu trúc ngữ pháp tương đồng.
    - Định hướng ứng dụng theo mục tiêu chính của học viên (TOEIC, Giao tiếp công sở, Đời sống hàng ngày).
    - Cấu trúc yêu cầu JSON rõ ràng, bắt buộc 2 ví dụ song ngữ Anh - Việt.
  - [src/modules/ai-tutor/context.ts](file:///d:/AI_Product_Development/src/modules/ai-tutor/context.ts):
    - `getTutorLearnerContext(userId)`: Đọc trình độ CEFR từ `profiles` và mục tiêu ưu tiên từ `goals`.
    - `getVerifiedExerciseContext(userId, submissionId, exerciseId, userQuery)`:
      - **Anti-IDOR**: Xác thực quyền sở hữu bài nộp (`user_id = userId`). Nếu người dùng A cố tình truyền `submissionId` của người dùng B, hệ thống lập tức từ chối truy cập.
      - **Zero-Trust**: Trích xuất câu hỏi, câu trả lời của học viên và lời giải từ `practice_submissions.feedback` đã được server chấm thẩm quyền. Client không thể gửi đáp án hay điểm số giả mạo.
  - [src/modules/ai-tutor/services.ts](file:///d:/AI_Product_Development/src/modules/ai-tutor/services.ts):
    - Điều phối toàn bộ quy trình: Kiểm tra Zod input -> Kiểm tra Rate Limit -> Xác minh quyền sở hữu & trích xuất ngữ cảnh -> Tạo versioned prompt -> Triệu gọi AI Provider (10s timeout) -> Kiểm tra Zod output -> Ghi log telemetry -> Trả về kết quả.
    - **Cơ chế Fallback sư phạm an toàn (Resilient Fallback)**: Nếu AI provider gặp sự cố, timeout hoặc hết quota, hệ thống tự động sinh cấu trúc giải thích chuẩn mực dựa trên lời giải thích của giáo trình, ghi nhận log `status = 'fallback'` và trả về cho học viên mà không làm gián đoạn trải nghiệm học.
    - **Tính bất biến (Non-destructive Invariance)**: AI Tutor hoạt động 100% read-only đối với điểm số, tiến độ lộ trình và hồ sơ người học; tuyệt đối không bao giờ làm mất hay sai lệch bài nộp đã lưu.
  - [src/modules/ai-tutor/actions.ts](file:///d:/AI_Product_Development/src/modules/ai-tutor/actions.ts):
    - Server Action `getAITutorExplanationAction` được bảo vệ bởi Supabase SSR Auth, ngăn chặn việc gọi AI ẩn danh.

### Slice 5.4 — Giao Diện Người Dùng & Tích Hợp Thẻ AI Tutor Tương Tác
- **Mã nguồn**:
  - [src/app/(app)/daily-plan/practice/[taskId]/practice-session-view.tsx](file:///d:/AI_Product_Development/src/app/(app)/daily-plan/practice/[taskId]/practice-session-view.tsx):
    - Tích hợp nút "🤖 Hỏi AI Tutor phân tích sâu hơn câu này" vào từng thẻ câu hỏi ở màn hình kết quả luyện tập.
    - Xử lý trạng thái tải (Loading state với spinner) và chống duplicate submit khi đang gọi API.
    - Thẻ phân tích AI Tutor hiển thị trực quan:
      - Phân tích cặn kẽ vì sao câu trả lời đúng/sai và bản chất câu hỏi.
      - Hộp tóm tắt quy tắc cốt lõi (Rule summary).
      - Danh sách ví dụ mở rộng song ngữ kèm mẹo ghi nhớ.
      - Gợi ý hành động ôn tập bài học tiếp theo.
      - Khung câu hỏi mở cho phép người học gõ thắc mắc riêng để AI giải đáp thêm.
    - **Sửa triệt để lỗi hiển thị đáp án**: Hiển thị text đáp án thực tế của người học và đáp án đúng thay vì mã `opt_` thô.

### Slice 5.5 — Automated Test Suite Đa Lớp
- **Tạo test suite mới**: [tests/ai-tutor/ai_tutor_and_lifecycle.test.mjs](file:///d:/AI_Product_Development/tests/ai-tutor/ai_tutor_and_lifecycle.test.mjs)
- **Nội dung kiểm thử (22 tests)**:
  1. *Prompt Construction & Level Adaptation*: Xác thực version `tutor_exercise_explanation_v1`, thích ứng tone cho A1/A2 và B1/B2, xử lý an toàn khi thiếu profile context, tích hợp câu hỏi phụ của học viên, củng cố tích cực khi làm đúng.
  2. *Runtime Validation (Zod)*: Xác thực schema input, từ chối thiếu UUID submissionId, từ chối query vượt quá 300 ký tự chống prompt injection, xác thực schema output hợp lệ, từ chối AI output sai cấu trúc.
  3. *AI Provider & Fallback Hierarchy*: Xác thực Mock Provider sinh kết quả chuẩn schema, kiểm tra fallback tự động sang Mock khi không có API key, kiểm tra kích hoạt Gemini khi có key.
  4. *Server-Side Rate Limiter*: Cho phép 10 requests / 5 phút, chặn và trả về `retryAfterSeconds` khi vượt ngưỡng, cô lập giới hạn theo từng user ID riêng biệt.
  5. *Security & Anti-IDOR*: Từ chối truy cập bài nộp của người dùng khác, loại bỏ hoàn toàn các trường điểm số/đúng sai client cố tình gửi kèm, bảo vệ secret không ghi vào metadata/logs.
  6. *Reliability & Invariance*: Trả về fallback sư phạm chuẩn mực khi model lỗi hoặc timeout, bảo toàn tính bất biến 100% của bản ghi bài nộp và điểm số.

---

## 2. Kết quả kiểm tra chất lượng (Verification Results)

| Lệnh kiểm tra | Kết quả | Chi tiết |
|---|---|---|
| `npm test` | **PASS (Exit code 0)** | **96/96 tests passed** (100%) trên toàn bộ 7 test suites. Không có test nào bị skip hoặc fail. |
| `npx tsc --noEmit` | **PASS (Exit code 0)** | TypeScript strict mode sạch 100% lỗi cú pháp và type checking. |
| `npm run lint` | **PASS (Exit code 0)** | Next.js ESLint hoàn toàn không có warning hay error (`No ESLint warnings or errors`). |
| `git status` | Sạch sẽ | Các file thay đổi nằm đúng nhánh `phase-5`, tuân thủ cấu trúc modular. |

---

## 3. Trạng thái Database & Hướng dẫn Migration

### Trạng thái thực tế:
- Migration Phase 1 và Phase 2 đã chạy thành công trên Supabase remote trong các phiên trước.
- **Migration Phase 3, Phase 4 và Phase 5 CHƯA ĐƯỢC CHẠY trên Supabase remote**. (Tuân thủ nguyên tắc không tự ý chạy migration từ xa nếu chưa được xác thực trực tiếp).

### Hướng dẫn người dùng áp dụng Migration qua Supabase Dashboard:
Vào **Supabase Project Dashboard -> SQL Editor**, mở và chạy tuần tự 3 file migration sau:
1. `supabase/migrations/20261015_phase_3_learning_path.sql` (Lộ trình học tập Phase 3)
2. `supabase/migrations/20261016_phase_4_daily_plan_practice.sql` (Kế hoạch ngày & bài tập Phase 4)
3. `supabase/migrations/20261017_phase_5_ai_tutor.sql` (Bảng `ai_generations`, `ai_rate_limits` và RPC rate limit Phase 5)

---

## 4. Biến môi trường Server (Environment Variables)

Hệ thống hoạt động an toàn ngay cả khi chưa có API key bên ngoài (tự động sử dụng `MockAIProvider`). Để kích hoạt AI thật từ Google hoặc OpenAI, bổ sung biến môi trường server vào file `.env.local`:
```env
# Google Gemini (Khuyến nghị cho Phase 5)
GEMINI_API_KEY="your-gemini-api-key"

# Hoặc OpenAI (Dự phòng)
OPENAI_API_KEY="your-openai-api-key"
```
*Lưu ý bảo mật: Tuyệt đối không thêm tiền tố `NEXT_PUBLIC_` vào các API key này.*

---

## 5. Giới hạn đã biết & Bước tiếp theo (Next Steps)

- **Giới hạn đã biết (Known Limitations)**:
  - Nếu người dùng chưa chạy file migration `20261017_phase_5_ai_tutor.sql`, hệ thống sẽ sử dụng cơ chế In-Memory Rate Limiter và bỏ qua việc ghi log vào database mà không gây lỗi ứng dụng (graceful degradation).
  - AI Tutor hiện tập trung vào giải thích ngữ cảnh bài tập luyện tập trong ngày (Contextual Exercise Explanation flow). Tính năng Sổ tay từ vựng (Vocabulary Notebook) và Lịch ôn tập ngắt quãng (Spaced Repetition Review) thuộc phạm vi chính thức của Phase 6.
- **Bước tiếp theo**:
  - Sẵn sàng chuyển tiếp sang **Phase 6 — Vocabulary Notebook & Spaced Repetition (SRS)** theo roadmap dự án.
