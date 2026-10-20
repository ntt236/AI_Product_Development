# API_DESIGN.md

## 1. Mục tiêu và nguyên tắc
Giao tiếp giữa Next.js UI, domain services, Supabase và AI provider. MVP dùng Server Actions cho mutation trong app và Route Handlers cho endpoint HTTP cần dùng rõ ràng; chưa cần Express server riêng.

- Validate mọi input bằng Zod hoặc tương đương.
- Xác thực user ở server; không tin `user_id` từ client.
- Điểm, mastery, quyền và trạng thái do server tính.
- Không gọi AI provider trực tiếp từ React component.
- Có rate limit, timeout, giới hạn payload và log lỗi.
- Mutation quan trọng phải xử lý gửi lặp an toàn.

## 2. Response convention
Thành công:
```json
{"data": {}, "meta": {"requestId": "server-generated-id"}}
```
Lỗi:
```json
{"error": {"code": "VALIDATION_ERROR", "message": "Dữ liệu không hợp lệ.", "details": []}, "meta": {"requestId": "server-generated-id"}}
```
Mã lỗi: `UNAUTHENTICATED`, `FORBIDDEN`, `VALIDATION_ERROR`, `NOT_FOUND`, `CONFLICT`, `RATE_LIMITED`, `AI_PROVIDER_ERROR`, `INTERNAL_ERROR`.

## 3. Operations theo module

| Module | Operations | Mục đích |
|---|---|---|
| Profile | `getProfile`, `updateProfile` | Hồ sơ |
| Goals | `listGoals`, `createGoal`, `updateGoal`, `setPrimaryGoal` | Mục tiêu |
| Onboarding | `saveOnboarding`, `completeOnboarding` | Hoàn thành thiết lập |
| Assessment | `startAssessment`, `saveAnswer`, `submitAssessment`, `getAssessmentResult` | Đánh giá trình độ |
| Learning Path | `generatePathProposal`, `acceptPath`, `updatePath`, `pausePath`, `resumePath` | Lộ trình |
| Daily Plan | `getDailyPlan`, `generateDailyPlan`, `completeActivity`, `skipActivity`, `updateActivityOrder` | Kế hoạch ngày |
| Content | `listContent`, `getContent`, `getExercise` | Nội dung học |
| Practice | `submitExercise`, `getAttemptFeedback` | Bài tập và feedback |
| Vocabulary | `addVocabulary`, `getDueReviews`, `submitVocabularyReview` | Từ vựng |
| AI Tutor | `sendTutorMessage` | Chat theo ngữ cảnh |
| Progress | `getDashboard`, `getSkillProgress`, `getWeaknesses` | Tiến độ |
| TOEIC (later) | `startToeicAttempt`, `saveToeicAnswer`, `submitToeicAttempt`, `getToeicAnalysis` | Luyện TOEIC |

Các tên trên là operations logic, không bắt buộc mỗi operation là một URL riêng.

## 4. Ví dụ: assessment flow

### `POST /api/assessments/:assessmentId/attempts`
Request:
```json
{"mode":"placement"}
```
Server xác thực user, kiểm tra assessment đã publish và rate limit, tạo attempt, chọn câu hỏi và **không gửi answer key**.

Response:
```json
{"data":{"attemptId":"uuid","status":"in_progress","questions":[]}}
```

### `PUT /api/assessment-attempts/:attemptId/answers/:questionId`
Request:
```json
{"answer":{"selectedOptionId":"option-id"},"timeSpentSeconds":18}
```
Server kiểm tra attempt thuộc user, còn mở, câu hỏi thuộc assessment và input hợp lệ.

### `POST /api/assessment-attempts/:attemptId/submit`
Server lấy answer key, chấm bằng scoring engine, lưu kết quả và evidence trong transaction. AI có thể diễn giải kết quả sau đó; nếu AI lỗi, điểm số vẫn phải được lưu.

## 5. AI Tutor endpoint
`POST /api/ai/tutor`
Input: `message`, `contextType`, optional `contextId`, optional `conversationId`.

Server:
1. Xác thực user và quyền truy cập context.
2. Rate limit và giới hạn độ dài.
3. Tạo context tối thiểu cần thiết.
4. Gọi adapter AI.
5. Validate output.
6. Ghi usage log và trả response an toàn.

Không cho AI tự viết SQL, thay đổi quyền, hoặc sửa learner profile trực tiếp.

## 6. Bảo mật
- Validate path/query/body.
- Kiểm tra quyền từng resource ID để tránh IDOR.
- RLS là lớp bổ sung, không thay thế kiểm tra quyền server.
- Không trả stack trace/secret cho client.
- Không trả answer key trước khi submit.
- Kiểm tra MIME type, dung lượng và quyền khi upload.
- Không log prompt chứa dữ liệu cá nhân mặc định.

## 7. Four Skills Operations & Server Actions (Phase 7)

### `getSkillsCatalogAction()`
- **Path/Type**: Server Action (`src/modules/skills/actions.ts`).
- **Input**: None (xác thực qua session cookie `auth.getUser()`).
- **Response**:
  ```json
  {
    "success": true,
    "catalog": [
      {
        "slug": "string",
        "title": "string",
        "description": "string",
        "skill": "listening | reading | writing | speaking",
        "level": "string",
        "estimatedMinutes": 20,
        "status": "ready | planned",
        "badgeLabel": "string",
        "highlights": ["string"],
        "audioUrl": "string"
      }
    ]
  }
  ```

### `startSkillPracticeAction(slug: string)`
- **Path/Type**: Server Action (`src/modules/skills/actions.ts`).
- **Input**: `{ slug: string }`.
- **Mục đích**: Tìm bài học, kiểm tra Daily Plan của ngày hôm nay, thêm task vào plan nếu chưa có (chống trùng lặp), và trả về `taskId` để client router điều hướng sang `/daily-plan/practice/[taskId]`.
- **Response**: `{ success: true, taskId: "uuid" }` hoặc `{ success: false, error: "string" }`.

### `submitWritingPracticeAction(taskId, contentItemId, essayText, durationSeconds)`
- **Path/Type**: Server Action (`src/modules/skills/actions.ts`).
- **Validation**: `submitWritingInputSchema` (tối thiểu 10 từ, tối đa 3000 ký tự).
- **Mục đích**: Chấm điểm bài viết qua AI Provider (hoặc quy chuẩn heuristic fallback), tính Rubric 4 tiêu chí (100 điểm), lưu `practice_submissions`, ghi `learning_evidence`, cập nhật Daily Plan task, Streak và mở khóa topic Learning Path.
- **Response**:
  ```json
  {
    "success": true,
    "result": {
      "submission_id": "uuid",
      "score": 82,
      "max_score": 100,
      "percentage": 82,
      "duration_seconds": 95,
      "evaluation": {
        "overall_feedback": "string",
        "rubric_scores": {
          "task_achievement": 22,
          "grammar_accuracy": 24,
          "lexical_resource": 20,
          "coherence_organization": 16,
          "total_score": 82
        },
        "grammar_corrections": [{ "error_quote": "string", "correction": "string", "explanation": "string" }],
        "vocabulary_enhancements": [{ "original": "string", "suggestion": "string", "reason": "string" }],
        "improved_version": { "text": "string", "rationale": "string" },
        "next_steps": ["string"],
        "evaluation_source": "ai_provider | fallback_heuristic"
      }
    }
  }
  ```

### `submitSpeakingPracticeAction(taskId, contentItemId, transcriptText, durationSeconds)`
- **Path/Type**: Server Action (`src/modules/skills/actions.ts`).
- **Validation**: `submitSpeakingInputSchema` (tối thiểu 10 từ, tối đa 2500 ký tự).
- **Mục đích**: Nhận xét phản xạ nói theo phương pháp Transcript-First, chấm Rubric 4 tiêu chí văn nói, cung cấp bài mẫu bản xứ kèm cụm từ đắt giá, lưu submission & evidence, cập nhật Streak.
- **Response**:
  ```json
  {
    "success": true,
    "result": {
      "submission_id": "uuid",
      "score": 84,
      "max_score": 100,
      "percentage": 84,
      "duration_seconds": 60,
      "evaluation": {
        "overall_feedback": "string",
        "relevance_and_fluency": "string",
        "rubric_scores": {
          "relevance_fluency": 22,
          "spoken_grammar": 24,
          "conversational_vocab": 22,
          "naturalness_sample": 16,
          "total_score": 84
        },
        "grammar_corrections": [{ "error_quote": "string", "correction": "string", "explanation": "string" }],
        "vocabulary_enhancements": [{ "original": "string", "suggestion": "string", "reason": "string" }],
        "sample_spoken_response": { "text": "string", "key_phrases": ["string"], "rationale": "string" },
        "next_steps": ["string"],
        "evaluation_source": "ai_provider | fallback_heuristic"
      }
    }
  }
  ```

