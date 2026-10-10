# Requirements — Learning Path

**Module:** LEARNING_PATH  
**Version:** 1.0  
**Status:** Draft

---

## 1. Mục tiêu

Learning Path biến Learner Profile + Goals thành một lộ trình học có thứ tự ưu tiên.

```text
Learner Profile
      +
Goals
      +
Available Time
      ↓
AI / Recommendation Engine
      ↓
Proposed Learning Path
      ↓
User
      ↓
Accept / Modify / Reject
      ↓
Active Learning Path
```

Learning Path không phải một course cố định.

Nó là một kế hoạch có thể thay đổi khi learner có evidence mới.

---

## 2. Core Principles

### LPATH-01 — Personalized

Path phải dựa trên từng người học.

### LPATH-02 — Goal Driven

Primary Goal có priority cao nhất.

### LPATH-03 — Adaptive

Path có thể thay đổi theo performance.

### LPATH-04 — User Controlled

AI chỉ đề xuất.

User có quyền:

```text
Accept
Modify
Reject
Pause
Resume
```

### LPATH-05 — Explainable

Mỗi recommendation quan trọng nên có lý do.

Ví dụ:

> Bạn đang yếu Past Simple và mục tiêu chính là TOEIC 750, vì vậy hệ thống đề xuất ôn Past Simple trước khi chuyển sang Part 5 nâng cao.

---

# 3. Learning Path Structure

Learning Path gồm:

```text
Goal
 ↓
Milestones
 ↓
Modules
 ↓
Topics
 ↓
Lessons
 ↓
Practice
 ↓
Assessment
```

Ví dụ:

```text
TOEIC 750
│
├── Grammar Foundation
│   ├── Tenses
│   ├── Articles
│   └── Prepositions
│
├── Vocabulary
│   ├── Workplace
│   ├── Business
│   └── Travel
│
├── TOEIC Part 5
│
├── TOEIC Part 6
│
└── Full Test
```

---

# 4. Goal Mapping

Mỗi Learning Path phải liên kết với một Goal.

Ví dụ:

```text
Goal:
TOEIC 750

Current:
A2

Target:
750

Available:
30 min/day
```

Recommendation Engine dùng thông tin này để tạo path.

---

# 5. Multiple Goals

Một user có thể có:

```text
Primary Goal
+
Secondary Goals
```

Ví dụ:

```text
Primary:
TOEIC 750

Secondary:
Daily Communication
Speaking
```

Primary Goal quyết định hướng chính.

Secondary Goals được đưa vào path khi:

- Không ảnh hưởng mục tiêu chính.
- Có đủ study time.
- Có overlap về kiến thức.
- User chủ động ưu tiên.

---

# 6. Milestones

Learning Path được chia thành milestones.

Ví dụ:

```text
Milestone 1
Foundation

Milestone 2
Grammar Improvement

Milestone 3
TOEIC Part Practice

Milestone 4
Full Test

Milestone 5
Target Score
```

Mỗi milestone có:

```text
id
title
description
order
status
target
completion_percentage
```

Status:

```text
locked
available
in_progress
completed
skipped
```

---

# 7. Modules

Milestone gồm nhiều modules.

Ví dụ:

```text
Milestone: Grammar Foundation

Module:
Verb Tenses

Topics:
Present Simple
Past Simple
Present Perfect
```

Module có:

```text
id
milestone_id
title
description
order
status
```

---

# 8. Topics

Topic là đơn vị kiến thức.

Ví dụ:

```text
Past Simple
Subject-Verb Agreement
Prepositions
Travel Vocabulary
```

Topic được liên kết với:

```text
Skill
Knowledge Domain
Difficulty
Level
```

Topic không nhất thiết thuộc một course duy nhất.

---

# 9. Learning Activities

Topic có thể chứa nhiều activity:

```text
Learn
Practice
Review
Assessment
Conversation
Writing
```

Ví dụ:

```text
Past Simple
 ↓
Lesson
 ↓
Practice
 ↓
Listening Exercise
 ↓
Speaking Exercise
 ↓
Mini Assessment
```

---

# 10. Path Generation

Learning Path có thể được tạo từ:

```text
Current Level
+
Primary Goal
+
Secondary Goals
+
Skill Weaknesses
+
Knowledge Mastery
+
Available Study Time
+
Learning Preferences
+
Historical Performance
```

Flow:

```text
Learner Profile
 ↓
Identify Gap
 ↓
Prioritize Gap
 ↓
Map Gap → Content
 ↓
Order Content
 ↓
Estimate Workload
 ↓
Generate Path
```

---

# 11. Gap Analysis

Hệ thống xác định khoảng cách:

```text
Current State
      ↓
Target State
      ↓
Learning Gap
```

Ví dụ:

```text
Current:
TOEIC 450

Target:
TOEIC 750

Gap:
Grammar
Vocabulary
Reading Speed
Listening
Part 5
Part 3
Part 4
```

Gap được ưu tiên theo:

```text
Impact on Goal
+
Weakness Severity
+
Prerequisite
+
Confidence
+
User Availability
```

---

# 12. Prerequisites

Một topic có thể yêu cầu kiến thức trước.

Ví dụ:

```text
Present Simple
      ↓
Past Simple
      ↓
Present Perfect
      ↓
Conditionals
```

Hệ thống không nên đẩy user vào topic nâng cao nếu prerequisite còn quá yếu, trừ khi user chủ động override.

---

# 13. AI-Generated Learning Path

AI có thể đề xuất path dựa trên learner context.

AI input:

```text
Current Level
Goals
Skill Profile
Weaknesses
Mastery
Available Time
Preferences
Target
```

AI output cần có structured format:

```text
path_title
reason
milestones[]
modules[]
priority
estimated_duration
```

AI không trực tiếp ghi path vào database.

Flow:

```text
AI Proposal
 ↓
Validation
 ↓
User Review
 ↓
Accept / Modify / Reject
 ↓
Persist Active Path
```

---

# 14. Recommendation Reason

Mỗi recommendation nên có reason.

Ví dụ:

```text
Recommendation:
Past Simple

Reason:
Grammar is currently A1 and Past Simple
accuracy is 42%. It is also a prerequisite
for several target topics.
```

Mục tiêu là làm recommendation có thể giải thích.

---

# 15. User Actions

User có thể:

### Accept

Chấp nhận toàn bộ AI proposal.

### Modify

Chỉnh sửa:

```text
Order
Topics
Time
Goal priority
Activities
```

### Reject

Từ chối proposal.

Hệ thống có thể hỏi optional reason:

```text
Too difficult
Too much time
Not relevant
Prefer another topic
Other
```

### Pause

Tạm dừng path.

### Resume

Tiếp tục path.

### Skip

Bỏ qua một module/topic.

---

# 16. User Modification

Sau khi user sửa path:

```text
AI Proposal
 ↓
User Modification
 ↓
User-Owned Learning Path
```

AI không tự động overwrite những thay đổi của user.

Nếu AI có recommendation mới:

```text
Current Path
 ↓
New Recommendation
 ↓
User decides
```

---

# 17. Path Versioning

Learning Path cần version.

Ví dụ:

```text
Path v1
 ↓
User modifies
 ↓
Path v2
 ↓
Adaptive update
 ↓
Path v3
```

Lịch sử version giúp biết path đã thay đổi như thế nào.

---

# 18. Active Path

Một user có thể có nhiều path history nhưng MVP chỉ nên có:

```text
1 Active Learning Path
```

Các path cũ:

```text
completed
archived
replaced
```

Điều này tránh recommendation engine phải xử lý nhiều active paths cùng lúc.

---

# 19. Daily Plan Relationship

Learning Path không trực tiếp quyết định từng hoạt động trong ngày.

```text
Learning Path
      ↓
Current Milestone
      ↓
Current Module
      ↓
Adaptive Engine
      ↓
Daily Plan
```

Daily Plan sẽ quyết định:

> Hôm nay user nên làm gì?

Learning Path quyết định:

> User đang đi theo hướng nào?

---

# 20. Adaptive Relationship

Learning Path là strategic layer.

Adaptive Engine là adjustment layer.

```text
Learning Path
      ↓
Adaptive Engine
      ↓
Adjust:
- difficulty
- topic priority
- review frequency
- activity type
- next action
```

Ví dụ:

```text
Path:
Grammar → Part 5

User performance:
Grammar accuracy = 45%

Adaptive Engine:
Không chuyển Part 5 nâng cao
↓
Thêm Grammar Review
↓
Thêm targeted practice
```

---

# 21. Completion

Module/topic có thể hoàn thành dựa trên evidence.

Không nên chỉ:

```text
User clicked "Complete"
```

Mà có thể dựa trên:

```text
Lesson completion
+
Practice performance
+
Assessment result
```

Ví dụ:

```text
Past Simple

Lesson: Completed
Practice: 82%
Assessment: 80%

→ Topic mastery đạt threshold
→ Topic Completed
```

Threshold là configuration.

---

# 22. Replanning

Learning Path cần được re-evaluate khi:

```text
Assessment completed
Major weakness detected
Goal changed
Target changed
Learning behavior changes
User modifies path
Milestone completed
```

Flow:

```text
New Evidence
 ↓
Evaluate Current Path
 ↓
Identify Changes
 ↓
Generate Recommendation
 ↓
User Review
 ↓
Update Path
```

---

# 23. AI Role

AI phù hợp cho:

- Generate initial learning path.
- Explain recommendation.
- Suggest alternatives.
- Analyze learning gaps.
- Suggest milestone structure.
- Suggest activity types.
- Summarize progress.

AI không nên tự quyết định:

```text
Authentication
User permissions
Raw scores
Database integrity
Final user approval
```

---

# 24. Deterministic Logic

Backend/Recommendation Engine xử lý:

```text
Goal priority
Prerequisites
Completion state
Mastery thresholds
Time constraints
Path status
Versioning
User permissions
```

AI cung cấp intelligence/recommendation ở lớp phù hợp.

---

# 25. Database Concept

Dự kiến:

```text
learning_paths
learning_path_versions
learning_path_milestones
learning_path_modules
learning_path_topics
learning_path_activities
```

Có thể thêm:

```text
learning_path_recommendations
learning_path_changes
```

---

# 26. Acceptance Criteria

- [ ] AI có thể tạo Learning Path proposal.
- [ ] Proposal dựa trên Learner Profile.
- [ ] Proposal liên kết với Goal.
- [ ] User xem được lý do recommendation.
- [ ] User Accept được proposal.
- [ ] User Modify được proposal.
- [ ] User Reject được proposal.
- [ ] User Pause/Resume được path.
- [ ] User Skip được topic/module.
- [ ] Có versioning.
- [ ] Chỉ có một Active Path trong MVP.
- [ ] Path có milestones/modules/topics.
- [ ] Path hỗ trợ prerequisites.
- [ ] Completion dựa trên evidence.
- [ ] Path có thể được replan.
- [ ] AI không tự overwrite user modifications.

---

# 27. MVP Boundary

MVP chưa cần:

- AI tạo toàn bộ curriculum từ đầu.
- Reinforcement learning.
- Complex prerequisite graph.
- Multi-path optimization.
- Automatic path replacement không cần user approval.

MVP tập trung:

```text
Learner Profile
 ↓
Gap Analysis
 ↓
AI Proposed Path
 ↓
User Accept / Modify / Reject
 ↓
Active Learning Path
 ↓
Daily Plan
```

---

# 28. Next Module

Sau Learning Path:

```text
Learner Profile
      ↓
Learning Path
      ↓
⭐ Adaptive Learning Engine
      ↓
Daily Plan
```

Module tiếp theo:

**ADAPTIVE_LEARNING.md**
