# Requirements — Adaptive Learning Engine

**Module:** ADAPTIVE_LEARNING  
**Version:** 1.0  
**Status:** Draft

---

## 1. Mục tiêu

Adaptive Learning Engine là lớp quyết định cách hệ thống điều chỉnh trải nghiệm học dựa trên dữ liệu thực tế của từng người học.

```text
Learner Profile
      +
Learning Path
      +
Learning Evidence
      ↓
Adaptive Engine
      ↓
Next Best Action
      ↓
Learning Activity
      ↓
New Evidence
      ↓
Adaptive Engine
```

Mục tiêu không phải tạo một course cố định, mà là liên tục trả lời:

> **"Với dữ liệu hiện tại, user nên làm gì tiếp theo để tiến bộ hiệu quả nhất?"**

---

# 2. Core Principles

### ADAPT-01 — Evidence Based

Mọi adaptation phải dựa trên evidence.

### ADAPT-02 — Hybrid Intelligence

Sử dụng:

```text
Deterministic Rules
+
Statistical Signals
+
AI Recommendations
```

Không để LLM tự quyết định toàn bộ learning state.

### ADAPT-03 — Continuous

Adaptive Engine được chạy lại khi có evidence mới.

### ADAPT-04 — Goal Aware

Recommendation phải ưu tiên Primary Goal.

### ADAPT-05 — User Controlled

User có quyền chấp nhận, bỏ qua hoặc thay đổi recommendation.

### ADAPT-06 — Explainable

Recommendation quan trọng cần có lý do.

---

# 3. Adaptive Learning Loop

Core loop:

```text
Assess
 ↓
Profile
 ↓
Plan
 ↓
Learn
 ↓
Practice
 ↓
Evaluate
 ↓
Update Evidence
 ↓
Adapt
 ↓
Next Best Action
 ↓
Learn Again
```

Đây là learning cycle trung tâm của sản phẩm.

---

# 4. Learning Evidence

Evidence có thể đến từ:

```text
Placement Assessment
Diagnostic Test
Lesson
Exercise
Quiz
TOEIC Practice
TOEIC Full Test
Speaking Practice
Writing Practice
Review
User Behavior
```

Mỗi evidence nên có:

```text
source
skill
topic
difficulty
result
accuracy
response_time
created_at
```

Không phải mọi evidence đều có tất cả fields.

---

# 5. Evidence Weight

MVP có thể dùng rule-based weighting:

```text
Full Assessment       → High
Diagnostic Assessment → High
Topic Assessment      → High
Practice Set          → Medium
Single Question       → Low
Self Report           → Low
```

Evidence mới hơn có thể được ưu tiên hơn evidence quá cũ.

---

# 6. Performance Signals

Adaptive Engine theo dõi:

```text
Accuracy
Consistency
Difficulty
Response Time
Completion Rate
Repeated Errors
Mastery
Recent Performance
Historical Performance
```

Ví dụ:

```text
Past Simple

Recent accuracy: 42%
Historical accuracy: 68%
Repeated errors: 5
```

→ Có dấu hiệu regression hoặc chưa mastery ổn định.

---

# 7. Mastery Model

MVP sử dụng mastery score:

```text
0.0 → 1.0
```

Ví dụ:

```text
Past Simple = 0.42
Articles = 0.81
```

Mastery có thể cập nhật sau mỗi relevant learning event.

MVP không cần machine learning để tính mastery.

---

# 8. Mastery Update

Một heuristic đơn giản:

```text
New Mastery
=
Old Mastery × historical_weight
+
New Evidence × evidence_weight
```

Ví dụ conceptually:

```text
Old mastery = 0.60
New practice = 0.80

New mastery > 0.60
```

Các weight cụ thể nên nằm trong configuration.

Không hard-code trong UI.

---

# 9. Weakness Detection

Weakness được xác định từ nhiều tín hiệu:

```text
Low Accuracy
+
Repeated Errors
+
Low Mastery
+
Recent Failure
+
Assessment Evidence
```

Ví dụ:

```text
Grammar
Past Simple
Accuracy: 42%
Mastery: 0.39
Repeated errors: 6
```

→ Weakness severity: High.

---

# 10. Strength Detection

Tương tự weakness:

```text
High Accuracy
+
High Mastery
+
Consistent Performance
```

Ví dụ:

```text
Reading
Accuracy: 88%
Mastery: 0.87
Consistency: High
```

→ Strong area.

---

# 11. Difficulty Adaptation

Hệ thống có thể thay đổi difficulty.

```text
Performance High
 ↓
Increase Difficulty

Performance Medium
 ↓
Maintain

Performance Low
 ↓
Decrease Difficulty
```

Ví dụ:

```text
Easy
 ↓ 90%
Medium
 ↓ 85%
Hard
 ↓ 55%
Medium
```

Không nên tăng/giảm difficulty chỉ dựa trên một câu hỏi.

Cần threshold hoặc recent performance window.

---

# 12. Topic Priority

Không phải weakness nào cũng có priority bằng nhau.

Priority có thể dựa trên:

```text
Goal Relevance
+
Weakness Severity
+
Prerequisite Importance
+
Recent Performance
+
Confidence
+
User Availability
```

Ví dụ:

```text
Past Simple
Goal relevance: High
Weakness: High
Prerequisite: High

→ Priority: Very High
```

---

# 13. Review Adaptation

Adaptive Engine quyết định khi nào cần review.

Ví dụ:

```text
Mastery thấp
→ Review soon

Mastery trung bình
→ Review later

Mastery cao
→ Space review
```

MVP có thể sử dụng review intervals đơn giản.

Sau này có thể tích hợp:

```text
Spaced Repetition
SM-2
FSRS
```

Không bắt buộc triển khai ngay.

---

# 14. Activity Type Adaptation

Hệ thống không chỉ thay đổi topic.

Có thể thay đổi loại activity.

Ví dụ:

```text
User đọc tốt
nhưng nghe kém

→ giảm Reading
→ tăng Listening
```

Hoặc:

```text
Grammar hiểu lý thuyết
nhưng Speaking mắc lỗi

→ tăng Speaking Practice
```

---

# 15. Skill Balancing

Adaptive Engine không nhất thiết phân bổ thời gian đều:

```text
Listening 25%
Speaking 25%
Reading 25%
Writing 25%
```

Mà có thể:

```text
Listening 40%
Grammar   30%
Speaking  20%
Reading   10%
```

nếu đó là cách phù hợp với Goal + Weakness.

---

# 16. Goal-Aware Adaptation

Ví dụ user có:

```text
Primary:
TOEIC 750

Secondary:
Daily Communication
```

Nếu TOEIC gần deadline:

```text
TOEIC priority ↑
Communication priority ↓
```

Nếu user thay đổi Primary Goal:

```text
Communication → Primary
TOEIC → Secondary
```

Adaptive Engine phải recalibrate recommendation.

---

# 17. Time-Aware Adaptation

User có thể thay đổi thời gian học:

```text
30 min/day
```

Nhưng hôm nay chỉ có:

```text
15 min
```

System nên tạo:

```text
15-minute micro plan
```

thay vì cố nhồi toàn bộ lesson 30 phút.

---

# 18. Behavior-Aware Adaptation

Hệ thống quan sát:

```text
User thường bỏ lesson dài
User hoàn thành speaking tốt
User thường học buổi tối
User skip vocabulary exercises
```

Có thể điều chỉnh:

```text
Activity Duration
Activity Type
Study Time
Recommendation Style
```

Nhưng behavior không được tự động thay đổi Goal của user.

---

# 19. Next Best Action

Adaptive Engine tạo một recommendation chính:

```text
Next Best Action
```

Ví dụ:

```text
Action:
Practice Past Simple

Reason:
Your recent accuracy is 48%
and this topic is important for
your TOEIC goal.
```

Các loại action:

```text
Learn
Practice
Review
Assessment
Speaking
Writing
Listening
Reading
Take Break
```

---

# 20. Recommendation Score

MVP có thể tính priority score bằng rule-based formula.

Conceptually:

```text
Priority Score =
Goal Relevance
+
Weakness
+
Prerequisite
+
Recency
+
Confidence Gap
```

Mỗi factor được normalize.

Ví dụ:

```text
Past Simple:
Goal Relevance = 0.9
Weakness        = 0.8
Prerequisite    = 0.9
Recency         = 0.7
Confidence Gap  = 0.8

Priority Score ≈ High
```

Formula cụ thể sẽ được thiết kế trong architecture phase.

---

# 21. AI Role

AI được dùng ở các lớp phù hợp:

### AI Analysis

```text
Performance Data
 ↓
AI
 ↓
Pattern / Explanation
```

### AI Recommendation

```text
Learner Context
 ↓
AI
 ↓
Suggested Strategy
```

### AI Tutor

```text
User Question
 ↓
AI
 ↓
Explanation / Practice
```

AI không được trực tiếp thay đổi:

```text
Raw Scores
Authentication
User Permissions
Database Integrity
Final Goal Priority
```

---

# 22. Hybrid Decision Flow

Recommended architecture:

```text
User Evidence
      ↓
Deterministic Evaluation
      ↓
Update Metrics
      ↓
Rule-Based Adaptive Engine
      ↓
Candidate Actions
      ↓
AI Analysis / Ranking (when useful)
      ↓
Recommendation
      ↓
User
      ↓
Accept / Skip / Modify
```

Không phải request nào cũng cần gọi AI.

Điều này giúp:

- Giảm chi phí.
- Tăng tốc độ.
- Dễ debug.
- Dễ kiểm soát.
- Tăng tính ổn định.

---

# 23. Adaptation Triggers

Adaptive Engine được trigger khi:

```text
Assessment Completed
Lesson Completed
Practice Completed
Quiz Completed
TOEIC Test Completed
Speaking Evaluated
Writing Evaluated
Repeated Error Detected
Goal Changed
Available Time Changed
User Skips Recommendation
```

---

# 24. Adaptation Frequency

Không cần recalculate toàn bộ hệ thống sau từng UI event.

MVP có thể:

```text
After meaningful learning event
```

Ví dụ:

```text
Complete Practice Set
→ Adapt

Complete Lesson
→ Adapt

Click Next
→ Không nhất thiết Adapt
```

---

# 25. User Override

Nếu AI đề xuất:

```text
Practice Grammar
```

user có thể:

```text
Skip
```

Sau đó hệ thống có thể đề xuất:

```text
Listening Practice
```

Nhưng skip không có nghĩa hệ thống xóa weakness.

Weakness vẫn tồn tại cho tới khi evidence mới thay đổi nó.

---

# 26. Adaptation Safety

Không nên có hành vi:

```text
User làm sai 1 câu
→ đổi toàn bộ Learning Path
```

Thay vào đó:

```text
Single Error
→ small signal

Repeated Errors
→ stronger signal

Assessment
→ strong signal
```

Điều này giúp tránh recommendation dao động quá mạnh.

---

# 27. Exploration vs Exploitation

Về dài hạn Adaptive Engine có thể cân bằng:

```text
Exploit
→ học điểm yếu quan trọng nhất

Explore
→ thử nội dung khác để thu thập thêm evidence
```

MVP ưu tiên:

```text
Exploit
```

Sau này có thể nghiên cứu:

- Bandit algorithms
- Reinforcement learning
- Personalized recommendation models

Không cần triển khai ngay.

---

# 28. Adaptive State

Có thể biểu diễn state:

```text
current_level
primary_goal
priority_skill
priority_topic
difficulty
mastery
confidence
recommended_action
```

Ví dụ:

```text
Level: A2
Goal: TOEIC 750
Skill: Grammar
Topic: Past Simple
Difficulty: Medium
Mastery: 0.42
Confidence: 0.81
Action: Practice
```

---

# 29. Database Concept

Adaptive Engine có thể sử dụng:

```text
learner_skill_profiles
learner_knowledge_mastery
learner_weaknesses
learning_events
learning_evidence
recommendations
adaptive_states
```

Không nhất thiết lưu toàn bộ calculation trong database nếu có thể derive lại.

---

# 30. Recommendation History

Hệ thống nên lưu recommendation history:

```text
recommendation
reason
created_at
status
user_action
```

Status:

```text
pending
accepted
skipped
rejected
completed
expired
```

Điều này giúp phân tích:

```text
AI recommended X
→ User skipped
→ Why?
→ What did user do instead?
```

---

# 31. Acceptance Criteria

- [ ] Evidence được thu thập từ learning activities.
- [ ] Evidence được đánh giá bằng deterministic logic.
- [ ] Mastery có thể được cập nhật.
- [ ] Weakness có thể được phát hiện.
- [ ] Difficulty có thể thích ứng.
- [ ] Topic priority có thể thay đổi.
- [ ] Review frequency có thể thay đổi.
- [ ] Activity type có thể thay đổi.
- [ ] Goal priority được tôn trọng.
- [ ] Available study time được tôn trọng.
- [ ] Next Best Action được tạo.
- [ ] Recommendation có reason.
- [ ] User có thể accept/skip/modify.
- [ ] AI không tự động overwrite user decisions.
- [ ] Recommendation history được lưu.
- [ ] Adaptive system không phản ứng quá mạnh với một lỗi đơn lẻ.

---

# 32. MVP Boundary

MVP tập trung:

```text
Rule-Based Adaptation
+
Learner Profile
+
Learning Evidence
+
Basic Mastery
+
Weakness Detection
+
Difficulty Adaptation
+
Topic Priority
+
Next Best Action
+
Optional AI Analysis
```

Chưa cần:

```text
Reinforcement Learning
Complex ML Models
Bandits
IRT
Full Spaced Repetition Optimization
Autonomous AI Curriculum
```

---

# 33. Long-Term Evolution

Có thể tiến hóa:

```text
MVP
Rule-Based
   ↓
Hybrid
Rules + AI
   ↓
Data-Driven
Statistical Models
   ↓
Advanced Adaptive System
ML / Recommendation Models
```

Không cần train model riêng ngay từ đầu.

---

# 34. Relationship With Other Modules

```text
ASSESSMENT
      ↓
LEARNER PROFILE
      ↓
LEARNING PATH
      ↓
ADAPTIVE ENGINE
      ↓
DAILY PLAN
      ↓
LEARNING ACTIVITY
      ↓
EVIDENCE
      ↓
LEARNER PROFILE UPDATE
      ↓
ADAPTIVE ENGINE
```

Đây là vòng lặp cốt lõi của sản phẩm.

---

# 35. Next Module

Sau Adaptive Learning:

**DAILY_PLAN.md**

Daily Plan sẽ biến:

```text
Learning Path
+
Adaptive State
+
Available Time
```

thành:

> **"Hôm nay bạn nên học gì?"**
