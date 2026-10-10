# Requirements — Assessment System

**Module:** ASSESSMENT  
**Version:** 1.0  
**Status:** Draft

## 1. Mục tiêu

Xác định trình độ tiếng Anh hiện tại và tạo dữ liệu đầu vào cho:

```text
Assessment → Learner Profile → Weakness Detection
→ Learning Path → Daily Plan → Adaptive Learning
```

Assessment không chỉ trả về một điểm tổng mà phải tạo **Skill Profile**.

---

## 2. Assessment Types

Hệ thống dự kiến có:

```text
Placement Assessment
Diagnostic Assessment
Lesson Assessment
Skill Assessment
TOEIC Practice Assessment
TOEIC Full Test
```

MVP ưu tiên:

```text
Placement Assessment
+
Lesson Assessment
```

---

## 3. Placement Assessment

Đánh giá ban đầu các thành phần:

- Vocabulary
- Grammar
- Reading
- Listening

Speaking và Writing có thể triển khai ở phase sau.

Hệ thống tham chiếu các mức:

```text
Pre-A1
A1
A2
B1
B2
C1
C2
```

Đây là **ước lượng nội bộ của sản phẩm**, không phải chứng chỉ CEFR chính thức.

---

## 4. Question Bank

Mỗi câu hỏi cần có metadata:

```text
id
skill
category
difficulty
level
question_type
content
options
correct_answer
explanation
tags
```

Ví dụ:

```text
skill: grammar
category: verb_tense
difficulty: 2
level: A2
question_type: multiple_choice
```

Question Bank phải được quản lý phía server/database; không expose toàn bộ đáp án cho client.

---

## 5. Difficulty

MVP sử dụng:

```text
1 = Very Easy
2 = Easy
3 = Medium
4 = Hard
5 = Very Hard
```

Difficulty là configuration, không hard-code trong UI.

---

## 6. Adaptive Placement Test

MVP sử dụng adaptive algorithm đơn giản:

```text
Start
 ↓
A1 / Easy
 ↓
Correct → Increase difficulty
Wrong   → Decrease or maintain difficulty
```

Ví dụ:

```text
Difficulty 2
 ↓ Correct
Difficulty 3
 ↓ Correct
Difficulty 4
 ↓ Wrong
Difficulty 3
```

Không triển khai IRT/CAT phức tạp ở MVP.

Sau này có thể nghiên cứu:

- Item Response Theory
- Computerized Adaptive Testing
- Ability Estimation

---

## 7. Stopping Rules

Assessment cần có minimum/maximum question count.

Ví dụ cấu hình:

```text
Minimum: 20
Maximum: 40
```

Test dừng khi đã có đủ evidence để ước lượng level hoặc đạt maximum.

Các giá trị phải nằm trong configuration.

---

## 8. Assessment Attempt

Mỗi lần làm test tạo một Attempt.

```text
Assessment
 ↓
Assessment Attempt
 ↓
Questions
 ↓
Answers
 ↓
Result
```

Attempt lưu:

```text
id
user_id
assessment_id
started_at
completed_at
status
score
```

Status:

```text
in_progress
completed
abandoned
```

Nếu user thoát giữa chừng, có thể resume.

---

## 9. Assessment Answer

Mỗi answer lưu:

```text
attempt_id
question_id
user_answer
is_correct
response_time
created_at
```

Có thể bổ sung sau:

```text
confidence
hint_used
```

---

## 10. Scoring

Backend chịu trách nhiệm tính:

```text
Correct = 1
Wrong = 0

Accuracy =
correct_answers / total_answers
```

Ví dụ:

```text
18 / 25 = 72%
```

Không giao việc tính score cho LLM.

---

## 11. Skill Score

Ngoài overall score, phải tính score theo skill/category.

Ví dụ:

```text
Grammar      60%
Vocabulary   80%
Reading      75%
Listening    55%
```

Skill score là dữ liệu quan trọng cho Adaptive Engine.

---

## 12. Level Estimation

Ví dụ:

```text
Vocabulary → A2
Grammar    → A1
Reading    → A2
Listening  → A1
```

Overall có thể là:

```text
A1 / A2
```

Cách mapping score → level phải được định nghĩa bằng rules/configuration.

AI không được tự quyết định raw score.

---

## 13. Confidence

Kết quả nên có confidence:

```text
Listening
Level: A2
Confidence: 0.82
```

Nếu evidence chưa đủ:

```text
Level: A2
Confidence: 0.55
```

Confidence giúp hệ thống biết khi nào cần assessment bổ sung.

---

## 14. Weakness Detection

Assessment cung cấp evidence ban đầu.

Ví dụ:

```text
Past Simple        40%
Prepositions       70%
Articles            85%
```

Có thể đánh dấu:

```text
Past Simple → Weak
```

Sau này weakness được tổng hợp từ:

```text
Assessment
+
Practice Results
+
Repeated Errors
+
Learning History
```

---

## 15. AI Role

### Backend / deterministic logic

Chịu trách nhiệm:

- Question selection
- Correct answer
- Score
- Accuracy
- Difficulty
- Attempt state
- Result calculation

### AI

Có thể hỗ trợ:

- Explain mistakes
- Analyze patterns
- Summarize weaknesses
- Generate personalized feedback
- Recommend follow-up practice

AI không thay đổi raw score.

---

## 16. AI Assessment Analysis

Flow:

```text
Assessment Result
 ↓
AI Analysis
 ↓
Strengths
Weaknesses
Patterns
Recommendations
```

Ví dụ:

> Người học có Vocabulary A2 tương đối tốt nhưng Grammar đang ở A1, đặc biệt yếu ở Past Simple và Subject-Verb Agreement. Listening cũng thấp hơn Reading.

---

## 17. Result → Learner Profile

Sau khi hoàn thành:

```text
Assessment Result
 ↓
Learner Profile
```

Profile được cập nhật:

```text
current_level
skill_levels
strengths
weaknesses
assessment_history
```

Assessment mới không xóa lịch sử cũ.

---

## 18. Reassessment

User có thể làm assessment lại.

Ví dụ:

```text
Assessment #1 → A1
Assessment #2 → A2
Assessment #3 → A2+
```

Lịch sử được dùng để hiển thị progress.

---

## 19. Assessment UX

Flow:

```text
Start Assessment
 ↓
Instructions
 ↓
Question
 ↓
Answer
 ↓
Next
 ↓
Adaptive Question
 ↓
...
 ↓
Complete
 ↓
Analyzing
 ↓
Result
```

Trong test hiển thị progress indicator.

Không hiển thị đáp án đúng ngay trong placement test.

---

## 20. Result UX

Ví dụ:

```text
Your English Profile

Overall
A2

Your Skills

Listening    A1
Speaking     --
Reading      A2
Writing      --
Vocabulary   A2
Grammar      A1
```

Tiếp theo:

```text
Your Strengths
- Basic vocabulary
- Reading comprehension

Needs Improvement
- Grammar fundamentals
- Listening

Recommended Learning Path
```

---

## 21. Database Entities

Dự kiến:

```text
assessments
assessment_questions
assessment_attempts
assessment_answers
assessment_results
skill_scores
```

Sau này có thể thêm:

```text
question_tags
assessment_configs
```

---

## 22. Security

- User chỉ xem assessment attempts của mình.
- User chỉ xem results của mình.
- Question bank không expose đáp án cho client.
- Correct answer xử lý server-side.
- AI API key không expose.
- Supabase RLS bảo vệ dữ liệu user.

---

## 23. Acceptance Criteria

- [ ] User bắt đầu được placement assessment.
- [ ] Hệ thống chọn câu hỏi theo difficulty/level.
- [ ] Difficulty thay đổi dựa trên answer.
- [ ] Từng answer được lưu.
- [ ] Backend tính score và accuracy.
- [ ] Hệ thống tạo skill scores.
- [ ] Hệ thống ước lượng level.
- [ ] Hệ thống lưu confidence.
- [ ] Hệ thống tạo strengths/weaknesses ban đầu.
- [ ] AI phân tích assessment result.
- [ ] Result cập nhật Learner Profile.
- [ ] User xem được kết quả.
- [ ] Assessment history được lưu.
- [ ] User có thể resume assessment bị gián đoạn.

---

## 24. MVP Boundary

MVP chưa triển khai:

- IRT hoàn chỉnh.
- CAT chuẩn hóa.
- Proctoring.
- Anti-cheat nâng cao.
- Speech scoring phức tạp.
- AI grading toàn bộ assessment.
- TOEIC official score prediction.

MVP tập trung:

```text
Question Bank
+
Basic Adaptive Selection
+
Scoring
+
Skill Analysis
+
Level Estimation
+
Learner Profile Update
```

---

## 25. Next Module

Sau Assessment:

```text
Assessment
 ↓
Learner Profile
 ↓
Weakness Profile
 ↓
Learning Path Recommendation
```

Module tiếp theo:

**LEARNER_PROFILE.md**
