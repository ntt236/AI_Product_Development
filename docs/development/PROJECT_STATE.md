# Project State — AI English Learning Platform

**Last Updated:** 2026-10-15  
**Active Branch:** `phase-3`  
**Current Phase:** Phase 3 — Learner Profile & Adaptive Learning Path (Code, UI, Migration & Tests Complete)  
**Next Phase:** Phase 4 — Content Delivery, Daily Practice & SRS Engine  

---

## 1. Trạng thái mã nguồn & kiến trúc
- **Framework**: Next.js 15.5.27 (App Router), React 19, TypeScript strict mode.
- **Kiến trúc**: Modular Monolith (`src/modules/auth`, `src/modules/profile`, `src/modules/onboarding`, `src/modules/assessment`, `src/modules/learning-path`).
- **Phase 3 — Learner Profile & Adaptive Learning Path**:
  - **Learner Profile Synthesis**: `getLearnerProfileSummary()` tổng hợp đa nguồn từ `profiles`, `goals`, `learner_preferences`, và `learner_skill_profiles`.
  - **Weakness Detection**: Logic rule-based thuần túy tính toán `Priority Score = (1 - ability_score) * goal_weight` với quy tắc tie-breaking xác định (Vocabulary -> Grammar -> Listening -> Reading).
  - **Khung 3 Milestones Thích ứng**:
    - Milestone 1: Củng cố kỹ năng cốt lõi / Điểm yếu ưu tiên.
    - Milestone 2: Phát triển năng lực phục vụ Primary Goal (TOEIC / Giao tiếp / Nền tảng).
    - Milestone 3: Luyện tập tích hợp và đánh giá tiến độ.
  - **Starter Path Fallback**: Nếu học viên chưa làm Placement Test, hệ thống sinh lộ trình tiêu chuẩn theo mục tiêu và hiển thị thông báo khuyến nghị làm bài test để cá nhân hóa sâu hơn.
  - **Dynamic Workload**: Tính toán tự động tổng thời lượng và số tuần dự kiến dựa trên `daily_minutes` và `preferred_study_days` của người học.
  - **User Sovereignty & State Machine**:
    - Lộ trình mới luôn ở trạng thái `proposed`.
    - Người học có toàn quyền `Accept`, `Reject`, `Pause`, `Resume` và `Customize`.
    - Trạng thái `rejected` và `completed` là terminal state, không thể tự kích hoạt lại.
    - Invariant: Tối đa 1 lộ trình `active` cho mỗi user. Khi kích hoạt path mới, path active cũ tự động chuyển sang `archived`.
  - **Versioning & Optimistic Concurrency**:
    - Mọi thay đổi cấu trúc đều yêu cầu `expected_version` khớp với `current_version`.
    - Tự động tạo bản ghi bất biến (immutable snapshot) trong `learning_path_versions` với `created_by: 'user' | 'system'`.
  - **AI Anti-Overwrite**: Thuật toán sinh lộ trình hoàn toàn là deterministic rule-based. AI trong tương lai chỉ đóng vai trò đề xuất / giải thích và không thể tự ý ghi đè lựa chọn của người dùng.
  - **Minh bạch nội dung (`planned_curriculum`)**: Mọi topic trong Phase 3 đều được đánh dấu rõ ràng `planned_curriculum` kèm thông báo bài học sẽ sẵn sàng trong Phase 4, ngăn chặn tạo trải nghiệm giả lập.
- **UI Integration**:
  - Navigation Bar: Thêm mục "🗺️ Lộ trình học" (`/learning-path`) trên toàn hệ thống.
  - Dashboard: Thêm thẻ tiêu điểm Lộ trình học cá nhân hóa hiển thị động theo trạng thái (`proposed`, `active`, `paused`, `not_assessed`).
  - Trang `/learning-path`: Giao diện chi tiết hỗ trợ timeline 3 milestones, tab phân tích hồ sơ & điểm yếu, tab lịch sử phiên bản snapshot, chế độ tùy chỉnh cấu trúc và modal thông báo planned curriculum.

---

## 2. Trạng thái Database Schema & Migration
- **Phase 1**: [supabase/migrations/20261012_phase_1_auth_profile_onboarding.sql](file:///d:/AI_Product_Development/supabase/migrations/20261012_phase_1_auth_profile_onboarding.sql) — **Đã áp dụng trên Supabase remote**.
- **Phase 2 (Cơ sở & Hardening)**: [supabase/migrations/20261013_phase_2_placement_assessment.sql](file:///d:/AI_Product_Development/supabase/migrations/20261013_phase_2_placement_assessment.sql) & [supabase/migrations/20261014_phase_2_security_hardening.sql](file:///d:/AI_Product_Development/supabase/migrations/20261014_phase_2_security_hardening.sql) — **Đã áp dụng trên Supabase remote**.
- **Phase 3 (Migration mới)**: [supabase/migrations/20261015_phase_3_learning_path.sql](file:///d:/AI_Product_Development/supabase/migrations/20261015_phase_3_learning_path.sql)
  - **Trạng thái**: **ĐÃ TẠO VÀ HOÀN TẤT AUDIT SQL INTEGRITY & SECURITY HARDENING TRONG REPOSITORY. CHƯA CHẠY TRÊN SUPABASE REMOTE.**
  - **Bảo vệ toàn vẹn & Hardening**:
    - `SECURITY DEFINER SET search_path = ''`: Toàn bộ helper, trigger và RPC functions được thiết lập search path rỗng với schema-qualified identifiers (`public.*`, `auth.*`), triệt tiêu rủi ro search-path hijacking. Các parser syntax constructs (`COALESCE`, `NULLIF`, `TRIM`) và system functions (`now()`, `jsonb_build_object()`, `jsonb_agg()`, `array_length()`, `unnest()`, `count()`) tuân thủ cú pháp chuẩn PostgreSQL không bị schema-qualify sai quy cách.
    - Check Constraint `estimated_minutes`: Bảng `public.learning_path_items` thiết lập constraint `check ((item_type = 'topic' and estimated_minutes between 5 and 180) or (item_type in ('milestone', 'module') and estimated_minutes >= 0))`, hoàn toàn đồng bộ với logic khởi tạo dữ liệu trong `services.ts` (Milestone & Module mang 0 phút, Topic mang thời lượng học cụ thể 5–180 phút).
    - Sibling-Group Contract: `save_learning_path_customization` bắt buộc mảng `p_reordered_item_ids` đại diện cho một nhóm đồng cấp hoàn chỉnh (`parent_id` và `item_type` đồng nhất). Cấm trùng lặp, cấm sắp xếp chéo cha, cấm bỏ sót hạng mục. Mọi biến PL/pgSQL đều được khai báo đầy đủ (`v_found_count`, `v_distinct_count`, `v_total_sibling_count`, v.v.).
    - Deterministic Hierarchical Snapshot: Snapshot JSON bất biến được xây dựng trực tiếp từ database rows theo thứ tự phân cấp Milestone -> Module -> Topic (`position asc`), loại trừ rủi ro nhận JSON giả mạo từ client.
    - Race condition serialization: `activate_learning_path` thực hiện khóa dòng người dùng (`PERFORM 1 FROM public.learning_paths WHERE user_id = v_caller_id FOR UPDATE`), đồng thời bẫy lỗi `unique_violation` từ partial unique index `uq_user_single_active_path`.
    - Progressive Unlocking: Kích hoạt đồng thời Milestone 1, Module 1, và Topic 1 sang `available`; các hạng mục kế tiếp duy trì `locked`.
    - Least Privilege RLS: Thu hồi INSERT/UPDATE/DELETE từ `authenticated` trên cả 3 bảng; client chỉ có quyền SELECT; thao tác ghi qua Server Actions và RPCs.
    - Quyền Function: `REVOKE EXECUTE FROM public, anon` trên toàn bộ functions; chỉ cấp quyền cần thiết cho `authenticated` và `service_role`.

---

## 3. Trạng thái kiểm thử
- `npm test`: Exit code 0 (**51/51 tests passed** across 4 suites: Phase 2 Assessment + Scoring Engine + Phase 3 Generator/Weakness + Phase 3 Lifecycle/Concurrency).
- `npx tsc --noEmit`: Exit code 0 (TypeScript strict mode hoàn toàn sạch lỗi).
- `npm run lint`: Exit code 0 (0 warnings, 0 errors).
- `npm run build`: Exit code 0 (Production build thành công cho tất cả static & dynamic routes bao gồm `/learning-path` và `/dashboard`).
- **Phân định rõ ràng các cấp độ kiểm thử**:
  - *Unit & Logic tests*: Đã kiểm chứng 100% logic Priority Score, Weakness Ranking, Dynamic Workload, Starter Path fallback và tính xác định (deterministic).
  - *Lifecycle & Concurrency tests*: Đã kiểm chứng mô phỏng toàn bộ luồng State Machine, Progressive Unlocking (Milestone 1 -> Module 1 -> Topic 1), IDOR, chống chèn ID lộ trình khác, kiểm soát đồng thời lạc quan (`expected_version`), từ chối ID trùng lặp, từ chối danh sách thiếu (omitted siblings), từ chối sắp xếp chéo cha (cross-parent), và từ chối đột biến bảng trực tiếp.
  - *Kiểm thử trên Supabase Remote*: Migration Phase 3 **CHƯA ĐƯỢC CHẠY** trên Supabase remote. Do đó, các RLS policies và RPC functions của Phase 3 chưa được kiểm thử trên database thật cho đến khi người dùng chạy migration qua SQL Editor.

---

## 4. Việc cần làm tiếp theo (Next Action)
- Người dùng review nội dung SQL và chạy migration Phase 3 [supabase/migrations/20261015_phase_3_learning_path.sql](file:///d:/AI_Product_Development/supabase/migrations/20261015_phase_3_learning_path.sql) trên Supabase Dashboard -> SQL Editor.
- Tiến hành kiểm thử trực tiếp trên ứng dụng với tài khoản học viên thực tế.
- Chuyển sang chuẩn bị cho **Phase 4 — Content Delivery, Daily Practice & SRS Engine**.
