# Data Flows Architecture — AI English Learning Platform

Tài liệu mô tả chi tiết các luồng dữ liệu (Data Flows), ranh giới xác thực và lưu vết database cho các tính năng đã thực sự triển khai trong hệ thống.

---

## 1. Authentication Flow (Đăng ký / Đăng nhập / Đăng xuất)

```text
[User Browser]
   │
   ├─ (1) Submit Register (email, password, displayName)
   │      ↓
   │   Server Action: signUpAction() [src/modules/auth/actions.ts]
   │      ├─ Zod validation: registerSchema
   │      └─ supabase.auth.signUp()
   │            ↓
   │         [Supabase Auth (auth.users)]
   │            └─ DB Trigger: on_auth_user_created [handle_new_user()]
   │                  └─ INSERT INTO public.profiles (id, display_name)
   │
   ├─ (2) Submit Login (email, password)
   │      ↓
   │   Server Action: signInAction() [src/modules/auth/actions.ts]
   │      ├─ Zod validation: loginSchema
   │      └─ supabase.auth.signInWithPassword()
   │            ↓
   │         Set HttpOnly session cookies (access_token, refresh_token)
   │
   └─ (3) Submit Logout
          ↓
       Server Action: signOutAction() [src/modules/auth/actions.ts]
          └─ supabase.auth.signOut() ➔ Clear cookies ➔ Redirect /login
```

* **Entry point**: [src/modules/auth/actions.ts](file:///d:/AI_Product_Development/src/modules/auth/actions.ts).
* **Dữ liệu đọc/ghi**:
  * Ghi `auth.users` qua Supabase GoTrue Auth API.
  * Trigger ghi `public.profiles` (`id = auth.users.id`, `display_name`).
* **Quyền truy cập & Ranh giới bảo mật**:
  * Không truyền mật khẩu qua REST thông thường.
  * `handle_new_user()` chạy dưới quyền `security definer` để khởi tạo profile an toàn.
* **Nhánh lỗi**:
  * Trùng email ➔ Báo lỗi thân thiện.
  * Sai mật khẩu / email chưa xác minh ➔ Báo lỗi cụ thể không crash hệ thống.

---

## 2. Server-side Route Protection & Session Refresh Flow (Middleware)

```text
[HTTP Request]
   │
   ↓
[src/middleware.ts] ➔ updateSession() [src/lib/supabase/middleware.ts]
   │
   ├─ Đọc session cookies từ Request
   ├─ Gọi supabase.auth.getUser() (re-validate token trên auth server)
   │
   ├─ Phân loại tuyến đường:
   │    ├─ Unauthenticated truy cập /dashboard, /onboarding, /settings...
   │    │     └─ Copy refreshed cookies ➔ 307 Redirect tới /login?redirectTo=...
   │    │
   │    ├─ Authenticated truy cập /login, /register
   │    │     └─ Copy refreshed cookies ➔ 307 Redirect tới /dashboard
   │    │
   │    └─ Các tuyến đường hợp lệ
   │          └─ Tiếp tục NextResponse.next() mang theo cookie mới
```

* **Entry point**: [src/middleware.ts](file:///d:/AI_Product_Development/src/middleware.ts).
* **Ranh giới bảo mật**: Bảo vệ 100% ở tầng server edge trước khi render trang.
* **Đặc tính**: Tự động bảo toàn và chuyển tiếp token mới khi Supabase SSR làm mới phiên (cookie forwarding).

---

## 3. Onboarding Setup Flow (Thiết lập mục tiêu & Thời gian)

```text
[User on /onboarding]
   │
   ├─ (1) Tải trạng thái hiện tại: getOnboardingState()
   │      ├─ Đọc public.profiles (onboarding_completed_at) [maybeSingle]
   │      ├─ Đọc public.goals (status = 'active')
   │      └─ Đọc public.learner_preferences [maybeSingle]
   │
   └─ (2) Gửi thiết lập mới: saveOnboardingAction()
          ├─ Zod validation: onboardingSchema
          ├─ Xác thực danh tính: supabase.auth.getUser()
          ├─ UPSERT public.learner_preferences (daily_minutes, preferred_study_days)
          ├─ UPDATE public.goals SET status = 'archived' WHERE user_id = auth.uid()
          ├─ INSERT public.goals (1 Primary Goal + N Secondary Goals)
          │    * Ràng buộc: Partial unique index (user_id) WHERE priority='primary' AND status='active'
          └─ UPDATE public.profiles SET onboarding_completed_at = now()
```

* **Entry point**: [src/modules/onboarding/actions.ts](file:///d:/AI_Product_Development/src/modules/onboarding/actions.ts).
* **Dữ liệu đọc/ghi**:
  * `public.learner_preferences`: Lưu `daily_minutes`, `preferred_study_days` (được kiểm tra ràng buộc mảng ngày hợp lệ 1..7, không trùng lặp qua hàm `validate_study_days`).
  * `public.goals`: Lưu mục tiêu học tập, cô lập qua RLS, kiểm tra `target_level` hợp lệ theo CEFR và partial unique index cho primary active goal.
  * `public.profiles`: Đánh dấu `onboarding_completed_at`.
* **Ranh giới bảo mật & Toàn vẹn**:
  * RLS bảo vệ: Chỉ user sở hữu mới đọc/ghi được (`auth.uid() = user_id`). Direct client INSERT trên `public.profiles` bị vô hiệu hóa; hồ sơ được tạo bởi trigger hoặc server admin.
  * Database trigger `protect_profile_fields` (BEFORE INSERT OR UPDATE) kiểm tra ranh giới đặc quyền `is_admin_or_service_role()`:
    * Chặn người dùng thường tự gán hoặc sửa `estimated_level`.
    * Chặn gán `onboarding_completed_at` khi INSERT profile mới.
    * Chặn hủy hoặc sửa lại `onboarding_completed_at` sau khi đã hoàn thành.
    * Yêu cầu phải có mục tiêu chính (primary active goal) và `learner_preferences` trước khi cập nhật `onboarding_completed_at`.

---

## 4. Privilege Boundary & System-Managed Fields

```text
[Client / Authenticated Request]           [Backend / Service-Role Context]
         │ (auth.role() = 'authenticated')                 │ (role = 'service_role' / postgres)
         ↓                                                 ↓
   ┌─────────────────────────────────────────────────────────────┐
   │        Trigger: protect_profile_fields()                    │
   │        Kiểm tra: is_admin_or_service_role()                 │
   └─────────────────────────────────────────────────────────────┘
         │                                                 │
   [Non-Privileged]                                   [Privileged]
         │                                                 │
   - Block INSERT/UPDATE estimated_level              - Allow assessment engine updates
   - Block altering onboarding_completed_at           - Allow migration & administrative updates
   - Block altering immutable id                      - Full system control
```

* **Quy tắc phân quyền (Privilege Boundary)**:
  * Người dùng thường (`authenticated`, `anon` hoặc JWT role không xác định / NULL) không được phép sửa đổi `estimated_level` hoặc gian lận `onboarding_completed_at`.
  * Chỉ backend service với `service_role` (ví dụ: Assessment Engine ở Phase 2) hoặc quyền quản trị viên PostgreSQL (`postgres`, `supabase_admin`) mới có thể ghi nhận hoặc điều chỉnh các trường này.

---

## 5. Placement Assessment Flow (Đánh giá năng lực đầu vào & Chấm điểm độc lập)

```text
[User Browser /assessment]
   │
   ├─ (1) Bắt đầu / Khôi phục: startOrResumePlacementAction()
   │      ├─ Đọc public.assessments (slug='placement-test', is_published=true)
   │      ├─ Đọc public.assessment_questions (KHÔNG chứa đáp án đúng)
   │      ├─ Kiểm tra/Tạo public.assessment_attempts (status='in_progress')
   │      └─ Khôi phục câu trả lời đã lưu từ public.assessment_answers
   │
   ├─ (2) Trả lời câu hỏi: saveAnswerAction()
   │      ├─ Xác thực người dùng (auth.uid())
   │      ├─ Kiểm tra quyền sở hữu attempt và status='in_progress'
   │      ├─ UPSERT public.assessment_answers (attempt_id, question_id, selected_option_id)
   │      └─ Cập nhật assessment_attempts.answered_count
   │
   └─ (3) Nộp bài & Chấm điểm: submitAssessmentAction()
          ├─ Xác thực danh tính & Kiểm tra idempotency (nếu đã completed -> trả kết quả cũ)
          ├─ Server nạp đáp án mật từ public.assessment_question_answers qua createAdminClient()
          ├─ Thuật toán calculateAssessmentScore() tính điểm tổng, độ chính xác & từng kỹ năng
          ├─ Ghi nhận kết quả:
          │    ├─ UPDATE assessment_answers (is_correct, score_awarded)
          │    ├─ UPDATE assessment_attempts (status='completed', score, accuracy, completed_at)
          │    ├─ INSERT public.assessment_results (overall_level, skill_scores, strengths, weaknesses)
          │    ├─ UPSERT public.learner_skill_profiles (cho từng kỹ năng: vocab, grammar, reading, listening)
          │    └─ UPDATE public.profiles (estimated_level qua service_role, vượt qua trigger an toàn)
          └─ Redirect tới /assessment/results/[attemptId] để xem báo cáo và giải thích chi tiết
```

* **Entry point**: [src/modules/assessment/actions.ts](file:///d:/AI_Product_Development/src/modules/assessment/actions.ts) & [src/modules/assessment/services.ts](file:///d:/AI_Product_Development/src/modules/assessment/services.ts).
* **Dữ liệu đọc/ghi**:
  * `public.assessments` & `public.assessment_questions`: Đọc câu hỏi và lựa chọn (chỉ trả nội dung an toàn, không có đáp án đúng hay explanation).
  * `public.assessment_question_answers`: Khóa hoàn toàn bởi RLS (deny all cho `anon` và `authenticated`), chỉ backend `service_role` đọc để chấm hoặc khi attempt đã `completed`.
  * `public.assessment_attempts`:
    * Client (`authenticated`) chỉ có quyền `SELECT` và `INSERT`. Đã thu hồi quyền `UPDATE` trực tiếp.
    * Trigger `protect_assessment_attempt_fields`: Bắt buộc `user_id = auth.uid()`, `status = 'in_progress'`, và cấm client tự đặt điểm số (`score`, `max_score`, `accuracy`), `answered_count` hoặc các timestamp nộp bài (`submitted_at`, `completed_at`).
    * Trạng thái bài làm chỉ được chuyển tiếp và ghi điểm bởi Server Service Role (`service_role`).
  * `public.assessment_answers`:
    * Client có quyền `SELECT` và `INSERT` (`upsert`) trên bài làm `in_progress` của chính mình.
    * Trigger `protect_assessment_answer_fields`: Ngăn client tự đặt hoặc sửa `is_correct` và `score_awarded`.
    * Trigger `update_attempt_answered_count`: Tự động đồng bộ số lượng câu đã trả lời `answered_count` trên `assessment_attempts`.
  * **Xử lý nộp đồng thời & Idempotency**:
    * Quá trình nộp bài sử dụng khóa nguyên tử có điều kiện: `UPDATE assessment_attempts SET status = 'submitted' WHERE id = :id AND user_id = :userId AND status = 'in_progress'`.
    * Nếu nhiều request gửi tới đồng thời hoặc nộp lại, chỉ request đầu tiên giành được khóa và thực thi chấm điểm. Các request tiếp theo nhận kết quả đã nộp hoặc thông báo bài đang được xử lý một cách an toàn.
  * **Bảo vệ Explanation & Answer Key**:
    * Hàm `getDetailedAssessmentResult()` kiểm tra bắt buộc `attempt.status === 'completed'` trước khi truy vấn giải thích và đáp án mật từ `assessment_question_answers`. Tuyệt đối không để rò rỉ đáp án khi bài thi chưa kết thúc.
  * `public.assessment_results`: Kết quả tổng hợp, skill breakdown và gợi ý học tập.
  * `public.learner_skill_profiles`: Hồ sơ năng lực 4 kỹ năng phục vụ Adaptive Engine ở Phase 3.
  * `public.profiles.estimated_level`: Cập nhật tự động thông qua `createAdminClient()`, tuân thủ đúng ranh giới đặc quyền của Phase 1.

---

## 5. Learning Path Generation, State Transitions & Customization Flow (Phase 3)

```text
[User Browser]
   │
   ├─ (1) Tổng hợp hồ sơ & Sinh lộ trình đề xuất (Proposed Path):
   │      ↓
   │   Server Action: generateProposedPathAction() [src/modules/learning-path/actions.ts]
   │      ├─ getUserLearningPath(userId) -> Kiểm tra nếu đã có path active/proposed/paused
   │      ├─ getLearnerProfileSummary(userId) -> Tổng hợp profiles, goals, preferences, learner_skill_profiles
   │      ├─ generateLearningPathProposal(profile) [src/modules/learning-path/generator.ts]
   │      │    ├─ Nếu chưa làm Placement Test -> Sinh Standard Starter Path
   │      │    └─ Nếu đã có test -> Weakness Detection (Priority Score = (1 - ability) * goal_weight)
   │      │         └─ Sinh 3 Milestones (Củng cố điểm yếu, Phát triển mục tiêu chính, Tích hợp & Đánh giá)
   │      │         └─ Tính dynamic workload: total_estimated_minutes, estimated_weeks
   │      ├─ INSERT public.learning_paths (status='proposed', current_version=1)
   │      ├─ INSERT public.learning_path_versions (v1 snapshot)
   │      └─ INSERT public.learning_path_items (Milestones -> Modules -> Topics, content_status='planned_curriculum')
   │
   ├─ (2) Chấp nhận / Từ chối lộ trình (User Sovereignty):
   │      ├─ acceptPathAction(pathId) [src/modules/learning-path/actions.ts]
   │      │    ├─ Kiểm tra quyền sở hữu (path.user_id === user.id)
   │      │    ├─ Kiểm tra status ('proposed' hoặc 'paused')
   │      │    ├─ UPDATE public.learning_paths SET status='archived' WHERE user_id=:userId AND status='active'
   │      │    ├─ UPDATE public.learning_paths SET status='active' WHERE id=:pathId
   │      │    └─ Progressive Unlock: Milestone 1, Module 1, và Topic 1 đồng thời mở khóa (status='available')
   │      │
   │      └─ rejectPathAction(pathId) [src/modules/learning-path/actions.ts]
   │           ├─ Kiểm tra quyền sở hữu & status='proposed'
   │           └─ UPDATE public.learning_paths SET status='rejected' (Terminal state)
   │
   ├─ (3) Tạm dừng / Tiếp tục học (Pause / Resume):
   │      ├─ pausePathAction(pathId) -> UPDATE learning_paths SET status='paused' WHERE status='active'
   │      └─ resumePathAction(pathId) -> Kích hoạt lại trạng thái active
   │
   └─ (4) Tùy chỉnh cấu trúc & Kiểm soát đồng thời lạc quan (Atomic Customization & Snapshots):
          ↓
       Server Action: customizePathAction(pathId, expectedVersion, changeReason, reorderedIds)
          ├─ Gọi RPC nguyên tử: save_learning_path_customization()
          ├─ Khóa bản ghi FOR UPDATE / kiểm tra: learning_paths.current_version === expectedVersion
          │    └─ Nếu mismatch: Rollback toàn bộ, báo lỗi xung đột phiên bản, yêu cầu refresh trang
          ├─ Xác thực reorderedIds: mọi ID phải thuộc đúng pathId (chống chèn ID từ lộ trình khác)
          ├─ Cập nhật tuần tự learning_path_items.position
          ├─ Tự động tạo snapshot JSONB từ items đã cập nhật trong DB (chống giả mạo snapshot)
          ├─ Ghi bản ghi bất biến vào learning_path_versions (bắt buộc created_by='user' đối với client)
          └─ UPDATE public.learning_paths SET current_version = newVersion, is_user_modified = true
```

* **Entry point**: [src/modules/learning-path/actions.ts](file:///d:/AI_Product_Development/src/modules/learning-path/actions.ts) & [src/modules/learning-path/services.ts](file:///d:/AI_Product_Development/src/modules/learning-path/services.ts).
* **Dữ liệu đọc/ghi**:
  * `public.learning_paths`:
    * Client (`authenticated`) chỉ có quyền `SELECT` qua RLS.
    * Mọi thao tác ghi thực hiện qua Server Action / RPC functions với kiểm tra định danh `auth.uid()` và quyền sở hữu nghiêm ngặt.
    * Partial unique index `uq_user_single_active_path` bảo đảm toàn vẹn chỉ có tối đa 1 lộ trình `active` cho mỗi user.
  * `public.learning_path_versions`:
    * Append-only table: Lưu snapshot bất biến của từng phiên bản. Client không được sửa hay xóa snapshot.
  * `public.learning_path_items`:
    * Ràng buộc composite foreign key `(learning_path_id, parent_id) REFERENCES (learning_path_id, id)` bảo đảm cây phân cấp không bao giờ bị tham chiếu chéo sang lộ trình khác.
    * Trigger `validate_learning_path_item_hierarchy()` kiểm tra toàn vẹn phân cấp Milestone -> Module -> Topic.
  * **Minh bạch nội dung (`planned_curriculum`)**: Mọi topic của lộ trình Phase 3 được đánh dấu `content_status = 'planned_curriculum'`. UI ngăn chặn tạo bài học giả lập khi nội dung thực tế sẽ được phân phối trong Phase 4.
  * **Bảo vệ chống ghi đè (AI Anti-Overwrite)**:
    * Logic sinh lộ trình là rule-based thuần túy, không phụ thuộc vào LLM.
    * Các đề xuất AI trong tương lai chỉ đóng vai trò khuyến nghị; người dùng nắm toàn quyền quyết định (User Sovereignty). Không hệ thống tự động nào được phép ghi đè lộ trình đã tùy chỉnh mà không tạo version mới và được người dùng xác nhận.

---

## 5. Daily Plan Generation & Task Management Flow (Phase 4)

```text
[User Browser / Dashboard / /daily-plan]
   │
   ├─ (1) Tải hoặc khởi tạo kế hoạch ngày:
   │      ↓
   │   Server Action: getTodayDailyPlanAction() [src/modules/daily-plan/actions.ts]
   │      ├─ Xác thực người dùng qua supabase.auth.getUser()
   │      ├─ Gọi getOrCreateTodayDailyPlan(userId) [src/modules/daily-plan/services.ts]
   │      │    ├─ Kiểm tra bảng public.daily_plans theo (user_id, plan_date)
   │      │    ├─ Nếu ĐÃ CÓ: Trả về plan cùng danh sách daily_plan_tasks (kèm join content_items)
   │      │    └─ Nếu CHƯA CÓ:
   │      │         ├─ Đọc preferences (daily_minutes, preferred_study_days, primary_goal)
   │      │         ├─ Đọc active learning path & các topic items
   │      │         ├─ Đọc kho content_items đã phát hành (is_published = true)
   │      │         ├─ Gọi generator thuần túy: generateDailyPlanProposal()
   │      │         │    ├─ Nhận diện ngày theo lịch hay học bù (flexible_catchup)
   │      │         │    ├─ Lọc các topic available, tính toán ngân sách thời gian
   │      │         │    ├─ Khớp nội dung thực tế (available) hoặc dự kiến (planned_curriculum)
   │      │         │    └─ Sinh danh sách task candidate
   │      │         ├─ INSERT INTO public.daily_plans (user_id, plan_date, target_minutes, status='planned')
   │      │         └─ INSERT INTO public.daily_plan_tasks (daily_plan_id, position, status='pending', ...)
   │      └─ Trả về DailyPlan DTO cho giao diện
   │
   ├─ (2) Thay đổi thứ tự nhiệm vụ trong ngày (Reorder):
   │      ↓
   │   Server Action: reorderDailyTasksAction(planId, taskIds)
   │      ├─ Zod validation: planId (UUID), taskIds (UUID[])
   │      ├─ Xác thực quyền sở hữu (daily_plans.user_id === user.id)
   │      ├─ Kiểm tra tính toàn vẹn: danh sách taskIds phải khớp hoàn toàn với số lượng và ID của plan
   │      ├─ Cập nhật vị trí tuần tự: UPDATE daily_plan_tasks SET position = index WHERE id = taskIds[index]
   │      └─ revalidatePath('/daily-plan')
   │
   └─ (3) Bỏ qua nhiệm vụ (Skip Task):
          ↓
       Server Action: skipDailyTaskAction(taskId, reason)
          ├─ Zod validation: taskId (UUID), reason (tùy chọn)
          ├─ Xác thực quyền sở hữu thông qua daily_plans
          ├─ UPDATE daily_plan_tasks SET status = 'skipped' WHERE id = taskId
          ├─ Tự động tính toán lại trạng thái daily_plans (partially_completed / completed / in_progress)
          └─ revalidatePath('/daily-plan')
```

* **Entry point**: [src/modules/daily-plan/actions.ts](file:///d:/AI_Product_Development/src/modules/daily-plan/actions.ts) & [src/modules/daily-plan/services.ts](file:///d:/AI_Product_Development/src/modules/daily-plan/services.ts).
* **Dữ liệu đọc/ghi**:
  * `public.daily_plans`: Tạo tự động theo ngày cho mỗi người học (`uq_user_daily_plan_date`).
  * `public.daily_plan_tasks`: Các bài học/bài tập cụ thể trong ngày, bảo đảm không trùng lặp và không vượt ngân sách thời gian.
* **Quyền truy cập & Ranh giới bảo mật**:
  * Client role `authenticated` bị thu hồi quyền INSERT/UPDATE/DELETE trực tiếp qua RLS; mọi thay đổi thực hiện qua Server Action được xác thực người dùng chặt chẽ.

---

## 6. Interactive Practice, Server-Side Scoring & Evidence Persistence Flow (Phase 4)

```text
[User Browser: /daily-plan/practice/:taskId]
   │
   ├─ (1) Tải nội dung bài học & câu hỏi thực hành:
   │      ↓
   │   Server Action: getPracticeContentAction(taskId)
   │      ├─ Xác thực người dùng và quyền sở hữu task
   │      ├─ Đọc thông tin content_item (từ vựng / ngữ pháp)
   │      ├─ Đọc danh sách câu hỏi từ public.practice_exercises (prompt, options, exercise_type)
   │      └─ 🚨 ZERO-TRUST: TUYỆT ĐỐI KHÔNG đọc bảng practice_exercise_answers ra client.
   │
   ├─ (2) Người học xem lý thuyết và hoàn thành bài tập tương tác:
   │      └─ Giao diện client lưu câu trả lời tạm thời trong React state.
   │
   └─ (3) Nộp bài và chấm điểm phía Server:
          ↓
       Server Action: submitPracticeAction(taskId, answers, timeSpentSeconds)
          ├─ Zod validation: runtime schema validation
          ├─ Xác thực người dùng và quyền sở hữu task
          ├─ Sử dụng Admin Client để truy vấn đáp án chính xác từ public.practice_exercise_answers
          ├─ Tính toán điểm số trên server:
          │    ├─ So sánh chuẩn hóa (case-insensitive, trimmed)
          │    ├─ Tính tổng số câu đúng, tỷ lệ % (0–100%) và điểm quy đổi (thang 100)
          │    └─ Xây dựng phản hồi sư phạm: từng câu hỏi kèm câu trả lời của user, đáp án đúng và lời giải thích
          ├─ Ghi nhận lịch sử làm bài vào public.practice_submissions
          ├─ Ghi nhận bằng chứng năng lực vào public.learning_evidence (chuẩn bị dữ liệu cho Adaptive Engine)
          ├─ Ghi nhận sự kiện học tập vào public.learning_events
          ├─ Cập nhật trạng thái nhiệm vụ: daily_plan_tasks SET status = 'completed'
          ├─ Cập nhật trạng thái kế hoạch ngày: recalculatePlanStatus()
          ├─ Progressive Unlocking:
          │    └─ Nếu nhiệm vụ gắn với topic trong Learning Path: Đánh dấu topic đó 'completed' và mở khóa topic kế tiếp trong module
          ├─ revalidatePath('/daily-plan'), revalidatePath('/dashboard'), revalidatePath('/learning-path')
          └─ Trả về PracticeSubmissionResult hiển thị màn hình kết quả và phản hồi sư phạm chi tiết.
```

* **Entry point**: [src/modules/daily-plan/actions.ts](file:///d:/AI_Product_Development/src/modules/daily-plan/actions.ts) & [src/modules/daily-plan/services.ts](file:///d:/AI_Product_Development/src/modules/daily-plan/services.ts).
* **Dữ liệu đọc/ghi**:
  * `public.practice_exercise_answers`: Bảng cô lập, **KHÔNG CÓ RLS POLICY CHO ROLE AUTHENTICATED**. Chỉ server truy cập để chấm điểm.
  * `public.practice_submissions`: Lưu kết quả, điểm số, thời gian làm bài.
  * `public.learning_evidence`: Thu thập bằng chứng năng lực (`ability_estimate`, `confidence_level`, `sample_count`).
  * `public.learning_events`: Nhật ký sự kiện (`daily_practice_completed`) phục vụ analytics và thích ứng lộ trình.
* **Quyền truy cập & Ranh giới bảo mật**:
  * Chống gian lận: Trình duyệt không thể xem trước đáp án bằng cách soi Network tab hoặc localStorage.
  * Server là Source of Truth duy nhất cho điểm số và trạng thái hoàn thành.

---

## 7. Contextual AI Tutor Explanation & Usage Telemetry Flow (Phase 5)

```text
[User Browser: /daily-plan/practice/:taskId (Review Card)]
   │
   ├─ (1) Người học bấm "🤖 Hỏi AI Tutor phân tích sâu hơn câu này" (hoặc nhập câu hỏi thêm)
   │      ↓
   │   Server Action: getAITutorExplanationAction(input) [src/modules/ai-tutor/actions.ts]
   │      │
   │      ├─ [Step 1] Xác thực phiên người dùng qua Supabase SSR Auth
   │      │     └─ Bắt buộc authenticated user (tránh gọi model ẩn danh lãng phí token)
   │      │
   │      ├─ [Step 2] Runtime Schema Validation (Zod)
   │      │     └─ ExerciseExplanationRequestSchema: Kiểm tra UUID submissionId, exerciseId, userQuery <= 300 ký tự
   │      │
   │      ├─ [Step 3] Server-Side Rate Limiter (checkAIRateLimit)
   │      │     ├─ Gọi atomic RPC: public.check_and_increment_ai_rate_limit(userId, windowStart, maxRequests=10)
   │      │     ├─ Nếu vượt giới hạn (10 reqs / 5 phút): Ghi nhận log RATE_LIMITED và trả về 429 + retryAfterSeconds
   │      │     └─ Cơ chế tự phục hồi: Tự động fallback sang In-Memory Rate Limiter nếu database RPC chưa sẵn sàng
   │      │
   │      ├─ [Step 4] Authorization & Verified Context Retrieval (Anti-IDOR)
   │      │     ├─ Kiểm tra quyền sở hữu bài nộp: practice_submissions WHERE id = submissionId AND user_id = userId
   │      │     ├─ Trích xuất câu hỏi, câu trả lời của học viên và đáp án từ feedback đã được server chấm
   │      │     └─ 🚨 TUYỆT ĐỐI KHÔNG tin tưởng điểm số, cờ đúng/sai hay đáp án từ client gửi lên
   │      │
   │      ├─ [Step 5] Lấy ngữ cảnh cá nhân hóa (Learner Context)
   │      │     ├─ Trình độ CEFR ước lượng hiện tại từ public.profiles (A1, A2, B1, B2...)
   │      │     └─ Mục tiêu học tập ưu tiên từ public.goals (TOEIC, Giao tiếp công sở, Đời sống...)
   │      │
   │      ├─ [Step 6] Xây dựng Prompt phiên bản hóa (Prompt Versioning)
   │      │     ├─ Version định danh: tutor_exercise_explanation_v1
   │      │     ├─ Thích ứng giọng điệu sư phạm theo CEFR level (A1/A2 dùng từ ngữ đơn giản; B1/B2 đi sâu vào collocations)
   │      │     └─ Định dạng bắt buộc: Schema JSON có cấu trúc (explanation, rule_summary, examples, next_step_tip)
   │      │
   │      ├─ [Step 7] Triệu gọi AI Provider với Bounded Timeout & Output Validation
   │      │     ├─ Quản lý Provider phân tầng: Gemini 1.5 Flash -> OpenAI GPT-4o-mini -> Mock Provider (offline/test)
   │      │     ├─ Thiết lập AbortController (timeout 10,000ms) chống treo server
   │      │     └─ Kiểm tra cấu trúc đầu ra qua Zod: AITutorExplanationSchema
   │      │
   │      ├─ [Step 8] Ghi nhật ký sử dụng & Giám sát hiệu năng (Usage Telemetry)
   │      │     ├─ Ghi vào public.ai_generations: user_id, provider, model, prompt_version, latency_ms, tokens, metadata
   │      │     └─ Bảo vệ dữ liệu nhạy cảm: Tuyệt đối không lưu API Key, Authorization Token hoặc mật khẩu vào log
   │      │
   │      └─ [Step 9] Xử lý lỗi linh hoạt & Fallback sư phạm an toàn (Resilient Fallback)
   │            ├─ Nếu AI Provider lỗi/timeout/hết quota: Trả về lời giải thích sư phạm chuẩn mực trích xuất từ giáo trình
   │            └─ 🔒 BẤT BIẾN: Thất bại của AI Tutor KHÔNG BAO GIỜ làm mất, xóa hay sai lệch điểm số bài tập đã nộp
   │
   └─ (2) Giao diện Client hiển thị Card AI Tutor giàu tương tác:
          ├─ Phân tích chuyên sâu tại sao đúng / tại sao sai
          ├─ Quy tắc ngữ pháp / từ vựng cốt lõi cần nhớ
          ├─ 2 ví dụ mở rộng song ngữ Anh - Việt
          └─ Gợi ý hành động ôn tập bài học tiếp theo
```

* **Entry point**: [src/modules/ai-tutor/actions.ts](file:///d:/AI_Product_Development/src/modules/ai-tutor/actions.ts) & [src/modules/ai-tutor/services.ts](file:///d:/AI_Product_Development/src/modules/ai-tutor/services.ts).
* **Dữ liệu đọc/ghi**:
  * Đọc: `public.practice_submissions` (xác minh quyền sở hữu và lấy câu trả lời), `public.content_items` (thông tin bài học), `public.profiles` (trình độ CEFR), `public.goals` (mục tiêu học tập).
  * Ghi: `public.ai_generations` (nhật ký sử dụng token, độ trễ và telemetry), `public.ai_rate_limits` (theo dõi tần suất gọi API).
* **Quyền truy cập & Ranh giới bảo mật**:
  * Anti-IDOR: Người dùng A không thể soi bài nộp của Người dùng B để yêu cầu AI giải thích.
  * Server-Only AI Execution: API key nằm 100% trên server env (`GEMINI_API_KEY`, `OPENAI_API_KEY`), không xuất hiện trên client.
  * Non-destructive Invariance: AI Tutor hoạt động ở chế độ Read-Only đối với điểm số, tiến độ lộ trình và hồ sơ người học. Không AI prompt nào có quyền trực tiếp cập nhật điểm số hay trình độ CEFR.

---

## 6. Listening Lesson Practice & Audio Delivery Flow (Hội thoại giới thiệu bản thân)

```text
[User Browser]
   │
   ├─ (1) Mở bài luyện nghe: GET /daily-plan/practice/[taskId]
   │      ↓
   │   Server: getContentItemWithExercises(content_item_id) [src/modules/daily-plan/services.ts]
   │      ├─ Đọc public.content_items (slug: listening-daily-conversations-introducing-yourself)
   │      ├─ Đọc public.practice_exercises (5 câu trắc nghiệm, options)
   │      └─ 🔒 BẢO MẬT: TUYỆT ĐỐI KHÔNG đọc public.practice_exercise_answers cho client
   │      ↓
   │   Client: Nhận dữ liệu bài học & câu hỏi (Chưa có đáp án đúng, chưa hiển thị transcript)
   │
   ├─ (2) Bước 1: Học lý thuyết & Nghe trước (Study Phase)
   │      ├─ Tải file audio: GET /audio/daily-conversations-introducing-yourself.wav
   │      ├─ HTML5 Audio Player (tùy chỉnh tốc độ 0.8x / 1.0x / 1.2x)
   │      ├─ Hiển thị Mục tiêu bài học & Mẹo bắt từ khóa (born in, originally from, currently live...)
   │      └─ 🔒 NGUYÊN TẮC SƯ PHẠM: Lời thoại (Transcript) được ẩn để rèn luyện phản xạ nghe tự nhiên
   │
   ├─ (3) Bước 2: Làm bài tập trắc nghiệm (Practice Phase)
   │      ├─ Audio Player duy trì cố định ở đầu trang, người học có thể nghe lại nhiều lần
   │      ├─ Người học chọn đáp án cho 5 câu hỏi (Nơi sinh David, Quê Sarah, Nơi ở New York, Sở thích...)
   │      └─ Bấm "Nộp bài" ➔ Gửi payload: { exercise_id, selected_option_id }[]
   │
   ├─ (4) Bước 3: Đánh giá & Chấm điểm phía Server (Server-Side Evaluation)
   │      ↓
   │   Server Action: submitPracticeAction() [src/modules/daily-plan/actions.ts]
   │      ├─ Xác thực người dùng qua supabase.auth.getUser()
   │      ├─ createAdminClient() truy vấn bảng bảo mật public.practice_exercise_answers
   │      ├─ Chấm điểm nguyên tử: So sánh selected_option_id với correct_option_id
   │      ├─ Ghi bài nộp vào public.practice_submissions (score, max_score, accuracy, feedback)
   │      ├─ Ghi nhận bằng chứng học tập vào public.learning_evidence (skill: 'listening')
   │      ├─ Ghi nhận sự kiện vào public.learning_events (event_type: 'practice_submitted')
   │      ├─ Cập nhật public.daily_plan_tasks (status = 'completed') & tăng completed_minutes
   │      └─ Kích hoạt mở khóa tuần tự topic tiếp theo trong public.learning_path_items
   │
   └─ (5) Bước 4: Màn hình kết quả & Mở khóa Transcript (Result Phase)
          ├─ Hiển thị điểm số đạt được (0-100%), thời gian làm bài, tỷ lệ chính xác
          ├─ Phân tích chi tiết từng câu: Đáp án bạn chọn vs Đáp án đúng kèm giải thích sư phạm
          ├─ 📜 MỞ KHÓA TRANSCRIPT: Hiển thị đầy đủ lời thoại của David & Sarah kèm bản dịch tiếng Việt song ngữ
          ├─ Audio Replay: Cho phép nghe lại đối chiếu từng câu thoại
          └─ 🤖 AI Tutor: Người học có thể nhấn "Hỏi AI Tutor phân tích sâu hơn câu này" để nhận giải thích cá nhân hóa
```

* **Entry point**: [src/app/(app)/daily-plan/practice/[taskId]/page.tsx](file:///d:/AI_Product_Development/src/app/(app)/daily-plan/practice/[taskId]/page.tsx) & [practice-session-view.tsx](file:///d:/AI_Product_Development/src/app/(app)/daily-plan/practice/[taskId]/practice-session-view.tsx).
* **Dữ liệu đọc/ghi**:
  * Đọc: `public.content_items` (kỹ năng `listening`), `public.practice_exercises`, `public.practice_exercise_answers` (chỉ qua `service_role`).
  * Ghi: `public.practice_submissions`, `public.learning_evidence` (kỹ năng `listening`), `public.learning_events`, `public.daily_plan_tasks`, `public.daily_plans`, `public.learning_path_items`.
* **Ranh giới bảo mật & Quyền truy cập**:
  * Audio file phát trực tiếp từ static assets `/public/audio/`.
  * Không gửi đáp án hoặc cờ `is_correct` cho client trước khi nộp bài.
  * Chỉ hiển thị Transcript sau khi có phản hồi nộp bài thành công từ server.
  * Người dùng khác không thể đọc hoặc chỉnh sửa bài nộp nhờ Row Level Security.
