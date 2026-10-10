# Requirements — Daily Plan

**Module:** DAILY_PLAN  
**Version:** 1.0  
**Status:** Draft

---

## 1. Mục tiêu

Daily Plan biến:

```text
Learning Path
+
Adaptive State
+
Primary Goal
+
Current Weaknesses
+
Available Study Time
+
Recent Learning Activity
```

thành một kế hoạch học cụ thể cho **hôm nay**.

Câu hỏi Daily Plan phải trả lời:

> **Hôm nay user nên học gì, theo thứ tự nào, trong bao lâu và tại sao?**

---

# 2. Core Principles

### DAILY-01 — Personalized

Mỗi user có Daily Plan khác nhau.

### DAILY-02 — Adaptive

Plan thay đổi theo performance và evidence mới.

### DAILY-03 — Time-Aware

Plan phải phù hợp với thời gian user thực tế có thể học.

### DAILY-04 — Goal-Aware

Primary Goal được ưu tiên.

### DAILY-05 — Actionable

Plan phải biến thành các action có thể bắt đầu ngay.

### DAILY-06 — Flexible

User có thể chỉnh sửa hoặc bỏ qua activity.

---

# 3. Daily Plan Structure

Một Daily Plan gồm:

```text
Date
Available Time
Main Goal
Focus
Activities
Estimated Duration
Priority
Reason
Completion Status
```

Ví dụ:

```text
Date: Monday

Available Time: 30 min

Focus:
Grammar + Listening

Activities:
1. Past Simple Review      8 min
2. Listening Practice     10 min
3. Speaking Practice       7 min
4. Vocabulary Review       5 min
```

---

# 4. Daily Plan Generation

Flow:

```text
Learner Profile
      ↓
Learning Path
      ↓
Adaptive State
      ↓
Available Time
      ↓
Candidate Activities
      ↓
Priority Ranking
      ↓
Daily Plan
```

---

# 5. Inputs

Daily Plan cần:

```text
Primary Goal
Secondary Goals
Current Level
Skill Profile
Weaknesses
Knowledge Mastery
Current Learning Path Position
Current Adaptive State
Recent Activities
Review Items
Available Study Time
Learning Preferences
```

---

# 6. Available Study Time

User có thể chọn:

```text
15 min
30 min
45 min
60 min
90+ min
```

Hoặc nhập custom duration.

Ví dụ:

```text
Available:
30 minutes
```

System không nên tạo plan vượt quá thời gian này.

Có thể có một buffer nhỏ cho transition, nhưng tổng estimated learning time không được vượt quá giới hạn user chọn.

---

# 7. Activity Selection

Candidate activities có thể gồm:

```text
Learn
Practice
Review
Listening
Speaking
Reading
Writing
Grammar
Vocabulary
TOEIC Part Practice
TOEIC Full Test
Assessment
```

Adaptive Engine quyết định activity nào có priority cao.

---

# 8. Priority

Mỗi activity có thể được chấm priority dựa trên:

```text
Goal Relevance
+
Weakness Severity
+
Prerequisite Importance
+
Review Urgency
+
Recent Performance
+
Learning Path Position
+
User Preference
```

Ví dụ:

```text
Past Simple Review
Priority: High

Reason:
Weakness + prerequisite + TOEIC relevance
```

---

# 9. Daily Focus

Mỗi ngày nên có một focus chính.

Ví dụ:

```text
Today's Focus:
Improve Grammar Accuracy
```

Hoặc:

```text
Today's Focus:
TOEIC Part 5
```

Không nên đưa quá nhiều unrelated priorities vào cùng một ngày.

---

# 10. Skill Distribution

Không bắt buộc mỗi ngày phải học cả:

```text
Listening
Speaking
Reading
Writing
```

Adaptive system có thể phân bổ theo nhu cầu.

Ví dụ:

```text
Monday:
Grammar + Listening

Tuesday:
Speaking + Vocabulary

Wednesday:
Reading + TOEIC Part 5
```

---

# 11. Complete Learning Cycle

Daily Plan nên ưu tiên complete learning cycle khi phù hợp:

```text
Learn
 ↓
Practice
 ↓
Apply
 ↓
Evaluate
 ↓
Review
```

Ví dụ:

```text
Past Simple

Learn       → 8 min
Practice    → 8 min
Speaking    → 7 min
Review      → 5 min
```

Không bắt buộc mọi topic đều phải đi qua toàn bộ cycle trong một ngày.

---

# 12. Daily Plan Example — General English

```text
30 MINUTES

1. Grammar Lesson
   Past Simple
   8 min

2. Grammar Practice
   10 questions
   7 min

3. Listening
   Daily conversation
   8 min

4. Vocabulary Review
   10 words
   5 min
```

---

# 13. Daily Plan Example — TOEIC

```text
45 MINUTES

1. Vocabulary Review
   Workplace vocabulary
   8 min

2. Grammar
   Part 5 targeted practice
   12 min

3. Listening
   Part 2
   10 min

4. Reading
   Part 5 mini set
   10 min

5. Review mistakes
   5 min
```

---

# 14. Daily Plan Example — Communication

```text
30 MINUTES

1. Vocabulary
   Restaurant
   5 min

2. Listening
   Restaurant dialogue
   8 min

3. Speaking
   Roleplay
   10 min

4. Feedback
   Pronunciation + Grammar
   7 min
```

---

# 15. AI Role

AI có thể:

- Generate plan explanation.
- Suggest activity combinations.
- Suggest alternative activities.
- Personalize instructions.
- Generate speaking/writing prompts.
- Summarize today's objective.

AI không cần tự quyết định mọi activity.

Recommended:

```text
Rule-Based Candidate Selection
        ↓
Adaptive Priority
        ↓
AI optional refinement
        ↓
Daily Plan
```

---

# 16. Rule-Based Constraints

Backend phải đảm bảo:

```text
Total Duration <= Available Time
```

Ngoài ra:

```text
Activity must be available
Topic must satisfy prerequisites
Completed content should not be unnecessarily repeated
Primary Goal must receive sufficient priority
```

---

# 17. Review Scheduling

Daily Plan có thể chứa review items:

```text
Due Review
Upcoming Review
Weak Topic Review
Recently Failed Topic
```

Ví dụ:

```text
Review:
Past Simple — due today

Review:
10 vocabulary words — due today
```

MVP có thể dùng rule đơn giản:

```text
1 day
3 days
7 days
14 days
30 days
```

Sau này có thể thay bằng FSRS/SM-2 hoặc model khác.

---

# 18. Plan Status

Daily Plan:

```text
generated
active
completed
partially_completed
skipped
expired
```

Mỗi activity:

```text
pending
in_progress
completed
skipped
```

---

# 19. User Actions

User có thể:

```text
Start
Pause
Complete
Skip
Replace
Reorder
```

Ví dụ:

```text
Listening
↓
User không muốn học
↓
Replace
↓
Speaking Practice
```

User modification không nên phá hỏng Learning Path.

Nó chỉ thay đổi execution của ngày đó.

---

# 20. Missed Activities

Nếu user không hoàn thành Daily Plan:

Không nên mặc định:

```text
Yesterday incomplete
→ Today double workload
```

Thay vào đó:

```text
Missed Activity
 ↓
Check importance
 ↓
Reschedule / Drop / Replace
```

Adaptive Engine quyết định.

---

# 21. Streak

MVP có thể hỗ trợ streak:

```text
1 day
2 days
3 days
...
```

Nhưng streak không được trở thành mục tiêu quan trọng hơn learning outcome.

Không nên tạo áp lực bằng cách phạt user quá mạnh khi bỏ một ngày.

---

# 22. Daily Progress

User có thể thấy:

```text
Today's Progress

Completed:
3 / 4 activities

Time:
23 / 30 min

Focus:
Grammar

Accuracy:
78%
```

Progress không chỉ dựa vào số activity hoàn thành.

Có thể hiển thị performance nếu có evidence.

---

# 23. Daily Summary

Cuối ngày có thể tạo summary:

```text
Today you:

✓ Completed Past Simple lesson
✓ Scored 78% in practice
✓ Completed listening practice

Needs improvement:
Listening Part 2

Tomorrow:
Continue Part 2 practice
```

AI có thể tạo summary từ structured data.

---

# 24. Daily Reflection

Optional:

```text
How difficult was today?

Easy
Okay
Hard
Very Hard
```

User feedback có thể trở thành evidence cho Adaptive Engine.

Không nên để self-report override objective performance.

---

# 25. Replanning During the Day

Daily Plan có thể được recalculated nếu:

```text
User finishes early
User has less time
User performs much better than expected
User performs much worse than expected
User skips an important activity
```

Ví dụ:

```text
Original:
30 min

User only has:
15 min

→ Generate compressed plan
```

---

# 26. End-of-Day Adaptation

Flow:

```text
Daily Plan
 ↓
Activities
 ↓
Evidence
 ↓
Performance
 ↓
Adaptive Engine
 ↓
Learner Profile Update
 ↓
Tomorrow's Candidate Plan
```

---

# 27. Database Concept

Dự kiến:

```text
daily_plans
daily_plan_activities
daily_plan_completions
daily_plan_feedback
```

Có thể liên kết:

```text
learning_paths
learning_path_modules
learning_activities
learning_events
```

---

# 28. API Concept

Sau này có thể có:

```text
GET  /api/daily-plan
POST /api/daily-plan/generate
PATCH /api/daily-plan/activities/:id
POST /api/daily-plan/activities/:id/complete
POST /api/daily-plan/activities/:id/skip
POST /api/daily-plan/activities/:id/replace
POST /api/daily-plan/feedback
```

API cụ thể sẽ được thiết kế ở architecture phase.

---

# 29. Acceptance Criteria

- [ ] Hệ thống tạo được Daily Plan.
- [ ] Plan dựa trên Learner Profile.
- [ ] Plan dựa trên Learning Path.
- [ ] Plan dựa trên Adaptive State.
- [ ] Plan tôn trọng Primary Goal.
- [ ] Plan tôn trọng Available Time.
- [ ] Tổng thời lượng không vượt Available Time.
- [ ] Có priority/reason cho activity quan trọng.
- [ ] User có thể start/complete/skip.
- [ ] User có thể replace activity.
- [ ] User có thể reorder activity.
- [ ] Missed activities được xử lý hợp lý.
- [ ] Activity completion tạo learning evidence.
- [ ] Evidence được gửi lại Adaptive Engine.
- [ ] Daily Plan có thể được replanning.
- [ ] Có daily progress.
- [ ] Có optional daily summary.
- [ ] Có optional user feedback.

---

# 30. MVP Boundary

MVP cần:

```text
Personalized Daily Plan
+
Time Constraint
+
Goal Priority
+
Weakness Priority
+
Basic Review
+
Activity Completion
+
Evidence Collection
+
Adaptive Feedback
```

Chưa cần:

```text
Complex calendar optimization
AI autonomous scheduling
Advanced reinforcement learning
Long-term habit prediction
Complex gamification
```

---

# 31. Relationship With Other Modules

```text
LEARNER PROFILE
       ↓
LEARNING PATH
       ↓
ADAPTIVE ENGINE
       ↓
DAILY PLAN
       ↓
LEARNING ACTIVITIES
       ↓
LEARNING EVIDENCE
       ↓
LEARNER PROFILE
       ↺
```

Daily Plan là **execution layer** của hệ thống adaptive learning.

---

# 32. Next Module

Sau Daily Plan, bắt đầu thiết kế các learning domains:

```text
LISTENING
SPEAKING
READING
WRITING
GRAMMAR
VOCABULARY
TOEIC
```

Sau khi hoàn thiện các requirements này, chuyển sang:

```text
ARCHITECTURE
 ↓
DATABASE
 ↓
API
 ↓
AI ARCHITECTURE
 ↓
CODEBASE
```
