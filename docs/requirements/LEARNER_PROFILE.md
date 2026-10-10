# Requirements — Learner Profile

**Module:** LEARNER_PROFILE  
**Version:** 1.0  
**Status:** Draft

## 1. Mục tiêu

Learner Profile là **hồ sơ học tập động** của người dùng và là cầu nối:

```text
User → Onboarding → Assessment → Learner Profile
→ Learning Path → Adaptive Learning → Daily Plan
```

Profile không chỉ lưu một `level`, mà phản ánh mục tiêu, trình độ, điểm mạnh/yếu, kiến thức, hiệu suất và hành vi học tập.

## 2. Core Principles

- **Dynamic:** cập nhật khi có evidence mới.
- **Evidence-Based:** không thay đổi chỉ vì một dữ liệu đơn lẻ nếu chưa đủ evidence.
- **Skill-Levelled:** mỗi skill có thể có level khác nhau.
- **Goal-Aware:** recommendation phải dựa trên mục tiêu và priority.
- **Historical:** giữ được lịch sử để phân tích progress.

## 3. Profile Structure

```text
Identity
Goals
Current Level
Skill Profile
Knowledge Profile
Strengths
Weaknesses
Learning Preferences
Learning Behavior
Performance
Learning History
Assessment History
Progress
```

## 4. Goals

Một user có thể có nhiều goals nhưng MVP bắt buộc có đúng **1 Primary Goal**.

Ví dụ:

```text
TOEIC 750        → Primary
Communication    → Secondary
```

Goal gồm:

```text
id
user_id
type
title
priority
target
status
created_at
updated_at
```

Priority:

```text
primary
secondary
```

Goal types ban đầu:

```text
daily_communication
general_english
listening
speaking
reading
writing
vocabulary
grammar
toeic
custom
```

## 5. Current Level

```text
overall_level
overall_confidence
```

Ví dụ:

```text
overall_level: A2
overall_confidence: 0.78
```

Level có thể thay đổi khi có evidence mới.

## 6. Skill Profile

MVP:

```text
Listening
Speaking
Reading
Writing
Grammar
Vocabulary
```

Mỗi skill:

```text
skill
level
score
confidence
status
last_assessed_at
```

Ví dụ:

```text
Listening
level: A1
score: 52
confidence: 0.72

Reading
level: A2
score: 74
confidence: 0.84
```

Speaking/Writing có thể chưa có score nếu chưa được assessment.

## 7. Knowledge Profile

Mô tả kiến thức nhỏ hơn skill.

Grammar:

```text
Present Simple
Past Simple
Present Perfect
Articles
Prepositions
Subject-Verb Agreement
Modal Verbs
Conditionals
```

Vocabulary:

```text
Daily Life
Travel
Education
Work
Food
Technology
```

Knowledge item có thể có:

```text
mastery
confidence
attempt_count
correct_count
last_seen_at
```

MVP ưu tiên Grammar và Vocabulary.

## 8. Mastery

MVP dùng mastery `0.0 → 1.0`.

```text
0.00 - 0.39 → Weak
0.40 - 0.69 → Developing
0.70 - 0.84 → Good
0.85 - 1.00 → Strong
```

Đây là heuristic có thể điều chỉnh.

## 9. Strengths

Strength cần có evidence, không chỉ là text do AI tạo.

Ví dụ:

```text
Reading comprehension
Basic vocabulary
Present Simple
```

Structured evidence:

```text
skill/topic
score
confidence
evidence_count
last_updated
```

## 10. Weaknesses

Weakness cần:

```text
skill/topic
severity
confidence
evidence_count
last_detected_at
status
```

Severity:

```text
low
medium
high
critical
```

Nguồn evidence:

```text
Assessment
Practice
Lesson
TOEIC Test
Speaking
Writing
Repeated Error
```

## 11. Learning Preferences

Có thể lưu:

```text
preferred_study_duration
preferred_days
preferred_topics
preferred_activity_types
preferred_study_time
```

Preferences hỗ trợ recommendation nhưng không override hoàn toàn learning needs.

## 12. Learning Behavior

Theo dõi:

```text
session_frequency
average_session_duration
completion_rate
skip_rate
practice_frequency
review_frequency
```

Ví dụ:

```text
completion_rate: 0.82
average_session_duration: 24 min
```

## 13. Performance

Performance có thể phân tích theo:

```text
skill
topic
activity
lesson
assessment
time_period
```

Các metric:

```text
accuracy
score
streak
completion_rate
response_time
```

## 14. Learning History

Không lưu toàn bộ history trong một profile row.

Profile liên kết tới:

```text
Lessons Completed
Exercises Completed
Questions Answered
Assessments
TOEIC Tests
Speaking Sessions
Writing Submissions
Reviews
```

## 15. Assessment History

Mỗi assessment là một historical data point.

Ví dụ:

```text
Assessment #1 → A1
Assessment #2 → A2
Assessment #3 → A2+
```

Skill history cũng được giữ:

```text
Listening: A1 → A1 → A2
Reading:   A1 → A2 → B1
```

## 16. Learner State

Adaptive Engine cần state:

```text
current_level
primary_goal
priority_skill
current_focus
learning_status
```

Ví dụ:

```text
Current Level: A2
Primary Goal: TOEIC 750
Priority Skill: Grammar
Current Focus: Past Simple
Learning Status: active
```

Đây là context để quyết định **Next Best Action**.

## 17. Recommendation Context

Recommendation Engine cần đọc:

```text
Goals
Current Level
Skill Levels
Weaknesses
Strengths
Knowledge Mastery
Recent Performance
Learning Behavior
Available Study Time
Recent Activities
```

Ví dụ:

```text
A2
+
TOEIC 750
+
Grammar weakness
+
Past Simple weakness
+
30 min/day
+
recent grammar accuracy 58%
```

→ đề xuất một lesson Past Simple + practice + review.

## 18. Profile Update

Các event có thể cập nhật profile:

```text
Assessment Completed
Practice Completed
Lesson Completed
TOEIC Test Completed
Speaking Evaluated
Writing Evaluated
Review Completed
```

Flow:

```text
Learning Event
 ↓
Evidence
 ↓
Evaluation
 ↓
Update Learner Profile
 ↓
Recalculate Priority
 ↓
Adaptive Engine
```

## 19. Evidence Weighting

MVP có thể dùng rule-based weighting:

```text
Full Assessment       → High
Diagnostic Test       → High
Practice              → Medium
Single Question       → Low
Self-report           → Low
```

Sau này có thể cải tiến bằng statistical/adaptive models.

## 20. AI Role

AI có thể:

- Tóm tắt learner profile.
- Giải thích strengths/weaknesses.
- Phát hiện pattern trong lỗi.
- Đề xuất learning strategy.
- Sinh personalized feedback.

AI **không** là source of truth cho:

```text
Raw score
Question correctness
Mastery calculation
Goal priority
Authentication
Progress calculation
```

Các phần này do application/database logic xử lý.

## 21. Database Concept

Learner Profile không nhất thiết là một bảng duy nhất.

Dự kiến:

```text
profiles
goals
learner_skill_profiles
learner_knowledge_mastery
learner_strengths
learner_weaknesses
learner_preferences
learner_statistics
```

Evidence/history nằm ở domain tables:

```text
assessment_attempts
assessment_answers
lesson_attempts
exercise_attempts
speaking_sessions
writing_submissions
```

Adaptive Engine đọc các dữ liệu này để tạo learner state.

## 22. Security

- User chỉ xem profile của chính mình.
- Goals/preferences được bảo vệ bằng RLS.
- Derived data không được client tự ý ghi đè.
- Mastery/level/score phải được update bằng trusted server logic.

## 23. Acceptance Criteria

- [ ] User có Learner Profile.
- [ ] User có nhiều goals.
- [ ] Có đúng một Primary Goal.
- [ ] Có overall level và confidence.
- [ ] Có level theo skill.
- [ ] Có strengths và weaknesses.
- [ ] Có knowledge mastery.
- [ ] Có learning preferences.
- [ ] Có learning behavior/performance.
- [ ] Assessment cập nhật được profile.
- [ ] Practice tạo được evidence.
- [ ] Có lịch sử assessment/progress.
- [ ] Adaptive Engine đọc được profile context.
- [ ] User không thể tự ghi đè derived scores/mastery.

## 24. Relationship With Other Modules

```text
AUTH
 ↓
ONBOARDING
 ↓
Goals + Preferences
 ↓
ASSESSMENT
 ↓
Initial Learner Profile
 ↓
LEARNING PATH
 ↓
Learning Activities
 ↓
Performance / Evidence
 ↓
LEARNER PROFILE UPDATE
 ↓
ADAPTIVE ENGINE
 ↓
New Recommendation
```

Learner Profile là **trung tâm dữ liệu cá nhân hóa** của hệ thống.

## 25. Next Module

Module tiếp theo:

**LEARNING_PATH.md**
