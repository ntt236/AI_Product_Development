# Báo Cáo Phiên Làm Việc: Audit & Bảo Mật Migration Phase 2 (Placement Assessment)

**Ngày thực hiện:** 2026-10-14  
**Nhánh:** `phase-2`  
**Mục tiêu:** Kiểm toán toàn diện, phát hiện lỗ hổng và siết chặt bảo mật cho migration Phase 2 (`assessment_attempts`, `assessment_answers`, RLS, triggers, Server Actions, kiểm soát lộ đề/giải thích và race condition khi nộp bài).

---

## 1. Tóm tắt các vấn đề đã phát hiện và xử lý

1. **Ngăn chặn client tự gán điểm và tự hoàn thành bài làm (`assessment_attempts`):**
   - **Vấn đề ban đầu:** Quyền `UPDATE` và `INSERT` của role `authenticated` trên bảng `assessment_attempts` có thể bị kẻ tấn công khai thác để gửi thẳng `score`, `accuracy`, `status = 'completed'` hoặc giả mạo `answered_count`.
   - **Xử lý:**
     - Tạo hàm trigger `protect_assessment_attempt_fields()`:
       - Khi `INSERT`: Bắt buộc `user_id = auth.uid()`, `status = 'in_progress'`, `answered_count = 0`, và các trường điểm số/thời gian (`score`, `max_score`, `accuracy`, `submitted_at`, `completed_at`) bắt buộc phải là `NULL`.
       - Khi `UPDATE`: Thu hồi toàn bộ quyền sửa đổi điểm số, thời gian và trạng thái từ client thường. Chỉ `service_role` (hệ thống chấm server) mới có quyền chuyển trạng thái hoặc ghi nhận điểm.
     - **Thu hồi quyền trực tiếp:** `REVOKE UPDATE ON public.assessment_attempts FROM authenticated;` (Client chỉ có quyền SELECT và INSERT bài làm mới).

2. **Ngăn chặn client tự chấm điểm và sửa câu trả lời (`assessment_answers`):**
   - **Vấn đề ban đầu:** Role `authenticated` có thể truyền kèm `is_correct = true` và `score_awarded = 1` khi gọi `saveAnswerAction`.
   - **Xử lý:**
     - Tạo hàm trigger `protect_assessment_answer_fields()`: Chặn mọi request từ client cố tình ghi hoặc sửa `is_correct` và `score_awarded`. Các trường này chỉ được ghi nhận khi `is_admin_or_service_role()` trả về true.
     - Bắt buộc bài làm (`assessment_attempts`) phải đang ở trạng thái `in_progress` mới cho phép ghi/sửa câu trả lời.

3. **Tự động đồng bộ `answered_count`:**
   - **Xử lý:** Tạo trigger `update_attempt_answered_count()` trên bảng `assessment_answers` (`AFTER INSERT OR DELETE`), tự động đếm và cập nhật `answered_count` vào `assessment_attempts`. Loại bỏ hoàn toàn sự phụ thuộc vào client.

4. **Kiểm tra ranh giới Server Action & Service Role (`createAdminClient`):**
   - **Vấn đề ban đầu:** Mọi hàm sử dụng admin client cần đảm bảo đã xác thực danh tính người dùng và kiểm tra quyền sở hữu attempt trên server trước khi chạm vào dữ liệu đặc quyền.
   - **Xử lý:**
     - Trong `submitAndScoreAssessmentAttempt()`: Xác thực người dùng hiện tại qua `supabase.auth.getUser()`, kiểm tra `attempt.user_id === userId`.
     - Chỉ dùng `adminClient` cho các tác vụ cần quyền: nạp đáp án mật (`assessment_question_answers`), cập nhật kết quả chấm (`assessment_answers`, `assessment_attempts`, `assessment_results`, `learner_skill_profiles`, `profiles.estimated_level`).

5. **Xử lý nộp đồng thời (Race Condition) và Tính lặp lại (Idempotency):**
   - **Xử lý:** Áp dụng khóa nguyên tử có điều kiện:
     ```typescript
     const { data: lockedAttempt } = await adminClient
       .from('assessment_attempts')
       .update({ status: 'submitted', submitted_at: now, updated_at: now })
       .eq('id', attemptId)
       .eq('user_id', userId)
       .eq('status', 'in_progress')
       .select('*')
       .maybeSingle();
     ```
     Nếu 2 request nộp bài cùng lúc, chỉ duy nhất 1 request giành được khóa để chạy bộ chấm điểm. Request còn lại sẽ đợi hoặc nhận ngay kết quả đã nộp mà không bị tính điểm trùng lặp.

6. **Bảo vệ Đáp án đúng và Explanation trước khi hoàn thành:**
   - **Xử lý:**
     - `assessment_question_answers` được RLS deny all với mọi client.
     - `getDetailedAssessmentResult()` bổ sung điều kiện chặn tuyệt đối:
       ```typescript
       if (!attempt || attempt.user_id !== userId || attempt.status !== 'completed') {
         return { result: null, attempt: null, reviews: [] };
       }
       ```
       Client đang làm bài không thể xem trước giải thích hay đáp án qua bất kỳ endpoint nào.

---

## 2. Các file đã chỉnh sửa

1. [supabase/migrations/20261013_phase_2_placement_assessment.sql](file:///d:/AI_Product_Development/supabase/migrations/20261013_phase_2_placement_assessment.sql):
   - Bổ sung helper `is_admin_or_service_role()`.
   - Bổ sung trigger `protect_assessment_attempt_fields()`.
   - Bổ sung trigger `protect_assessment_answer_fields()`.
   - Bổ sung trigger `update_attempt_answered_count()`.
   - Siết chặt RLS policies và thu hồi quyền `UPDATE` trên `assessment_attempts` từ `authenticated`.
2. [src/modules/assessment/services.ts](file:///d:/AI_Product_Development/src/modules/assessment/services.ts):
   - Loại bỏ client update trên `assessment_attempts.answered_count` trong `saveLearnerAnswer()`.
   - Bổ sung atomic status locking trong `submitAndScoreAssessmentAttempt()`.
   - Siết chặt kiểm tra `attempt.status === 'completed'` trong `getDetailedAssessmentResult()`.
3. [tests/assessment/assessment_system.test.mjs](file:///d:/AI_Product_Development/tests/assessment/assessment_system.test.mjs):
   - Bổ sung test suite mô phỏng và kiểm tra các quy tắc bảo mật database (Test 13 -> 18).
4. [docs/architecture/DATA_FLOWS.md](file:///d:/AI_Product_Development/docs/architecture/DATA_FLOWS.md):
   - Cập nhật ranh giới bảo mật, luồng chấm điểm và cơ chế xử lý nộp bài an toàn.
5. [docs/development/PROJECT_STATE.md](file:///d:/AI_Product_Development/docs/development/PROJECT_STATE.md):
   - Cập nhật trạng thái Phase 1 đã áp dụng, Phase 2 sẵn sàng áp dụng.

---

## 3. Kết quả kiểm thử thực tế

| Lệnh | Trạng thái | Ghi chú |
| :--- | :--- | :--- |
| `npm test` | **PASS (Exit 0)** | 25/25 tests pass qua 3 suites (bao gồm 6 tests bảo mật mới) |
| `npx tsc --noEmit` | **PASS (Exit 0)** | Strict type checking sạch hoàn toàn |
| `npm run lint` | **PASS (Exit 0)** | Không có lỗi hoặc cảnh báo ESLint |
| `npm run build` | **PASS (Exit 0)** | Build production thành công 10 dynamic/static routes và Middleware |

---

## 4. Trạng thái Migration & Lưu ý khi áp dụng

- **Phase 1 Migration:** Đã được người dùng áp dụng trước đó trên Supabase remote. Không áp dụng lại.
- **Phase 2 Migration:** Toàn bộ các thay đổi bảo mật đã được tích hợp trực tiếp và đồng bộ vào file duy nhất `supabase/migrations/20261013_phase_2_placement_assessment.sql`.
- **Rủi ro còn lại & Khuyến nghị:**
  - Vì việc kiểm thử hiện tại được thực hiện thông qua unit tests, automated integration tests và static analysis trong môi trường Node.js/TypeScript, các policy RLS và DB Trigger cần được kiểm chứng trên database Supabase thật sau khi người dùng chạy migration.
  - Sau khi apply migration trên Supabase SQL Editor, tiến hành đăng nhập bằng tài khoản test và thực hiện 1 lượt làm bài để xác nhận Supabase Auth JWT mapping chính xác với `is_admin_or_service_role()`.
