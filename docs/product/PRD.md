# PRD v1.0 — AI English Learning Platform

**Tên tạm thời:** AI English Learning Platform  
**Phiên bản:** 1.0  
**Loại sản phẩm:** Web Application  
**Định hướng:** AI-powered Adaptive English Learning Platform  
**Trạng thái:** Product Definition / Ready for Architecture

---

## 1. Tổng quan sản phẩm

### 1.1. Product Vision

Xây dựng một nền tảng học tiếng Anh sử dụng AI để giúp người học:

> **Biết mình đang ở đâu → biết mình cần học gì → biết tại sao cần học → biết mình đã tiến bộ như thế nào → và luôn biết nên làm gì tiếp theo.**

Hệ thống không cung cấp một lộ trình cố định cho tất cả mọi người. Thay vào đó, hệ thống xây dựng **Learner Profile** cho từng người học và liên tục điều chỉnh nội dung, độ khó, kỹ năng và hoạt động học dựa trên:

- Trình độ hiện tại
- Mục tiêu
- Điểm yếu
- Kết quả học tập
- Hành vi học tập
- Thời gian có thể học
- Sở thích của người học

---

## 2. Problem Statement

Người học tiếng Anh thường gặp các vấn đề:

### Vấn đề 1 — Không biết trình độ thật sự

Người học có thể biết một số từ vựng nhưng không biết mình đang ở A1, A2 hay B1. Đặc biệt với người mất gốc, họ thường không biết mình yếu ở từ vựng, ngữ pháp, nghe, nói hay kiến thức nền.

### Vấn đề 2 — Không biết nên học gì

Các khóa học truyền thống thường đưa ra một chương trình cố định trong khi hai người có cùng mục tiêu có thể có trình độ và điểm yếu hoàn toàn khác nhau.

### Vấn đề 3 — Học nhưng không biết mình đang tiến bộ

Người học cần biết:

- Mình đã học bao nhiêu?
- Kỹ năng nào tiến bộ?
- Kỹ năng nào đang yếu?
- Nội dung nào thường sai?
- Vì sao mình sai?
- Tiếp theo nên học gì?

### Vấn đề 4 — AI thường chỉ đóng vai trò chatbot

Nhiều sản phẩm dùng AI để chat, dịch, sửa câu hoặc sinh bài tập nhưng chưa đưa AI vào toàn bộ vòng đời học tập.

Sản phẩm này hướng tới việc AI trở thành một phần của **Learning System**.

---

## 3. Target Users

### 3.1. Người mất gốc

Bao gồm:

- Gần như không biết tiếng Anh.
- Biết một ít từ vựng nhưng không biết ghép câu.
- Đã từng học nhưng quên phần lớn kiến thức.

### 3.2. Người không biết trình độ

Hệ thống xác định:

- Overall Level
- Listening
- Speaking
- Reading
- Writing
- Vocabulary
- Grammar

### 3.3. Người muốn giao tiếp

Các chủ đề:

- Giao tiếp hàng ngày
- Du lịch
- Mua sắm
- Gọi điện
- Hỏi đường
- Nhà hàng
- Trường học
- Công việc
- Small Talk

### 3.4. Người muốn phát triển toàn diện

- Listening
- Speaking
- Reading
- Writing
- Vocabulary
- Grammar

### 3.5. Người học TOEIC

- TOEIC Listening
- TOEIC Reading
- Luyện từng Part
- Full Test
- Phân tích điểm yếu
- Theo dõi điểm số

### 3.6. Người có nhiều mục tiêu

Ví dụ:

```text
Primary Goal:
TOEIC 750

Secondary Goal:
Giao tiếp hàng ngày

Secondary Goal:
Improve Speaking
```

Hệ thống phải phân bổ thời gian giữa các mục tiêu.

---

## 4. Product Goals

### 4.1. Goal chính

> **Hiểu người học → đánh giá người học → xây dựng lộ trình → đưa ra kế hoạch hàng ngày → theo dõi kết quả → phát hiện điểm yếu → thích ứng.**

### 4.2. Goal của người dùng

Người học có thể trả lời:

**Tôi đang ở đâu?**

```text
Overall: A2

Listening: B1
Speaking: A2
Reading: A2
Writing: A1
Vocabulary: A2
Grammar: A1
```

**Tôi cần học gì?**

```text
1. Past Simple
2. Food Vocabulary
3. Listening Practice
4. Speaking Practice
```

**Tại sao phải học?**

Hệ thống giải thích dựa trên dữ liệu lỗi và hiệu suất.

**Tôi đã tiến bộ chưa?**

Theo dõi tiến bộ theo kỹ năng, mục tiêu và thời gian.

**Tiếp theo nên làm gì?**

Đưa ra Next Best Action.

---

## 5. Product Principles

### Principle 1 — Adaptive First

Sản phẩm ưu tiên khả năng thích ứng:

```text
Learner
→ Evidence
→ Analysis
→ Recommendation
→ Learning
→ Evidence
→ Adapt
```

### Principle 2 — AI recommends, User decides

AI:

- Phân tích
- Đề xuất
- Giải thích
- Tạo bài tập
- Đánh giá
- Gợi ý

Người dùng có quyền:

- Accept
- Edit
- Reject
- Skip
- Free Practice
- Change Priority

### Principle 3 — Deterministic Logic First

Những thứ có thể tính toán chính xác phải do hệ thống xử lý:

- Score
- Accuracy
- Completion
- Time
- Streak
- Progress
- Spaced Repetition scheduling

AI chủ yếu chịu trách nhiệm:

- Analysis
- Explanation
- Recommendation
- Generation
- Feedback
- Conversation

### Principle 4 — Content ≠ Application Logic

Nội dung học phải được tách khỏi code:

```text
Content Database
      ↓
Learning Engine
      ↓
Application
```

---

## 6. Core Learning Loop

```text
ASSESS
   ↓
UNDERSTAND
   ↓
PLAN
   ↓
LEARN
   ↓
PRACTICE
   ↓
APPLY
   ↓
EVALUATE
   ↓
FEEDBACK
   ↓
REVIEW
   ↓
ADAPT
   ↓
NEXT ACTION
   ↓
LEARN AGAIN
```

---

## 7. User Onboarding

Flow:

```text
Register
   ↓
Choose Goals
   ↓
Choose Available Study Time
   ↓
Adaptive Placement Test
   ↓
Learner Profile
   ↓
AI Analysis
   ↓
Learning Path Recommendations
   ↓
User Customization
   ↓
Daily Learning Plan
```

---

## 8. Goal Management

Mỗi người dùng có thể có nhiều mục tiêu.

Mỗi Goal có:

- Target
- Priority
- Deadline
- Available time
- Current progress
- Target level/score

Ví dụ:

```text
Goal 1
TOEIC 750
Priority: High

Goal 2
Daily Communication
Priority: Medium

Goal 3
Improve Speaking
Priority: Medium
```

---

## 9. Assessment System

### 9.1. Adaptive Placement Test

Hệ thống sử dụng Adaptive Testing.

```text
Question 1 — A1
      ↓ Correct
Question 2 — A2
      ↓ Correct
Question 3 — B1
      ↓ Wrong
Question 4 — A2
```

Độ khó được điều chỉnh dựa trên kết quả.

### 9.2. Assessment Areas

#### Grammar

- Sentence structure
- Tenses
- Articles
- Prepositions
- Modal verbs
- Conditionals
- Clauses

#### Vocabulary

- Word meaning
- Context
- Usage
- Collocation

#### Reading

- Main idea
- Detail
- Inference
- Vocabulary in context

#### Listening

- Word recognition
- Sentence comprehension
- Main idea
- Detail

#### Speaking

- Pronunciation
- Fluency
- Grammar
- Vocabulary
- Coherence

#### Writing

- Grammar
- Vocabulary
- Organization
- Coherence
- Task completion

---

## 10. Level System

Sử dụng hệ thống level tham chiếu CEFR:

```text
Pre-A1
A1
A2
B1
B2
C1
C2
```

Hiển thị cả:

### Overall Level

```text
Your Level

A2
Elementary
```

### Skill Profile

```text
Listening    B1
Speaking     A2
Reading      A2
Writing      A1
Vocabulary   A2
Grammar      A1
```

Hệ thống không tuyên bố bài kiểm tra nội bộ là chứng chỉ CEFR chính thức.

---

## 11. Learner Profile

Learner Profile là một model động.

```text
LearnerProfile

Overall Level
Skill Levels

Goals
Goal Priorities

Strengths
Weaknesses

Grammar Knowledge
Vocabulary Knowledge

Learning History
Performance

Study Time
Learning Frequency

Preferred Topics

Completed Activities
Skipped Activities

Review Items
```

Profile được cập nhật theo thời gian.

---

## 12. Learning Path

AI đưa ra nhiều lựa chọn.

### Path A — Communication Focus

```text
Daily Communication
Speaking
Listening
Vocabulary
```

### Path B — Foundation Recovery

```text
Grammar Foundation
Core Vocabulary
Sentence Structure
Basic Listening
```

### Path C — Balanced English

```text
Listening
Speaking
Reading
Writing
Grammar
Vocabulary
```

Người dùng có thể:

- Accept
- Customize
- Reject
- Choose another

AI giải thích lý do đề xuất.

---

## 13. Adaptive Learning Engine

### Input

```text
Learner Profile
+
Assessment
+
Learning History
+
Performance
+
Goals
+
Goal Priority
+
Available Time
+
User Behavior
```

### Output

```text
Next Best Activity
Daily Plan
Learning Path
Review Recommendation
Difficulty
Content Recommendation
```

---

## 14. Daily Learning

Trọng tâm giao diện:

> **What should I learn today?**

Ví dụ:

```text
Good morning!

Today's Learning Plan

1. Grammar — Past Simple
   15 min

2. Listening — Ordering Food
   10 min

3. Vocabulary Review
   10 min

4. Speaking Practice
   15 min

Total: 50 min
```

---

## 15. Multiple Goals & Time Allocation

Nếu người dùng có 45 phút:

```text
TOEIC          25 min
Communication  15 min
Vocabulary      5 min
```

Nếu chỉ có 20 phút:

```text
TOEIC          10 min
Vocabulary      5 min
Speaking        5 min
```

Adaptive Engine phải điều chỉnh kế hoạch.

---

## 16. Lesson System

Mỗi lesson:

```text
Introduce
   ↓
Learn
   ↓
Practice
   ↓
Apply
   ↓
Assess
   ↓
Feedback
   ↓
Review
   ↓
Next Action
```

Ví dụ lesson **Ordering Food**:

- Vocabulary và expressions
- Practice exercises
- AI roleplay
- Assessment
- AI feedback
- Review
- Next recommendation

---

## 17. Vocabulary System

Mỗi vocabulary item có:

- Word
- Meaning
- Pronunciation
- IPA
- Audio
- Part of Speech
- Example
- Collocations
- Synonyms
- Antonyms
- Difficulty
- Topic

Learning lifecycle:

```text
Learn
 ↓
Practice
 ↓
Review
 ↓
Mastery
```

---

## 18. Spaced Repetition

Hệ thống sử dụng Spaced Repetition để xác định thời điểm ôn lại.

Ví dụ:

```text
Day 1  → Learn
Day 2  → Review
Day 4  → Review
Day 8  → Review
Day 16 → Review
```

Khoảng thời gian thực tế được điều chỉnh dựa trên kết quả người học.

---

## 19. Grammar System

```text
Topic
 ↓
Concept
 ↓
Explanation
 ↓
Examples
 ↓
Practice
 ↓
Assessment
 ↓
Weakness
```

Ví dụ:

```text
Verb Tenses
 ├── Present Simple
 ├── Present Continuous
 ├── Past Simple
 ├── Past Continuous
 ├── Present Perfect
 └── ...
```

---

## 20. Listening

Bao gồm:

- Lesson
- Audio
- Vocabulary
- Comprehension
- Dictation
- Multiple choice
- Fill in the blank
- Conversation

AI có thể:

- Tạo bài luyện
- Giải thích transcript
- Phân tích lỗi
- Điều chỉnh độ khó

---

## 21. Speaking

Bao gồm:

- Pronunciation
- Reading aloud
- Repeat
- Free speaking
- Conversation
- Roleplay

AI phân tích:

```text
Pronunciation
Fluency
Grammar
Vocabulary
Coherence
```

Ví dụ:

```text
Fluency       72
Grammar       65
Vocabulary    70
Pronunciation 68

Main weakness:
Past tense usage
```

Sau đó hệ thống đề xuất bài luyện phù hợp.

---

## 22. Reading

Bao gồm:

- Short passages
- Articles
- Conversations
- Stories
- Comprehension
- Vocabulary in context
- Inference

Adaptive Engine điều chỉnh:

- Text difficulty
- Vocabulary
- Length
- Question difficulty

---

## 23. Writing

Flow:

```text
Prompt
 ↓
User writes
 ↓
AI Evaluation
 ↓
Corrections
 ↓
Explanation
 ↓
Improved Version
 ↓
Practice
```

AI feedback phân biệt:

- Grammar
- Vocabulary
- Structure
- Coherence
- Naturalness

Mục tiêu không chỉ sửa câu mà còn giải thích vì sao sai.

---

## 24. AI Tutor

Có hai dạng.

### 24.1. Dedicated AI Tutor

Chatbot riêng để người dùng hỏi:

```text
What does "although" mean?
Why is this sentence wrong?
Can you explain Past Simple?
Let's practice speaking.
```

### 24.2. Contextual AI

AI xuất hiện ngay trong lesson và biết context hiện tại:

- Explain vocabulary
- Give examples
- Roleplay
- Ask questions
- Correct answers
- Generate extra practice

---

## 25. AI Conversation

Conversation phải adaptive dựa trên:

```text
User Level
Current Vocabulary
Grammar Level
Goal
Topic
Previous Mistakes
```

Ví dụ A1:

```text
AI:
Hello! What's your name?
```

Ví dụ B1:

```text
AI:
Imagine you're meeting a new colleague
on your first day at work.
Start a short conversation.
```

---

## 26. AI Exercise Generation

AI có thể tạo:

- Vocabulary exercises
- Grammar exercises
- Listening questions
- Reading questions
- Writing prompts
- Speaking scenarios
- Conversation practice

Flow:

```text
Learning Engine
      ↓
AI Generation
      ↓
Validation
      ↓
Content Object
      ↓
User
```

Không mặc định AI-generated content là chính xác.

---

## 27. AI Recommendation

AI phân tích:

```text
Assessment
Performance
Weakness
Goal
Behavior
```

Để đưa ra:

- Recommended Topic
- Recommended Skill
- Recommended Difficulty
- Recommended Activity
- Recommended Review

Ví dụ:

> Người học có Listening B1 nhưng Speaking A2. Trong 7 ngày gần đây Speaking ít được luyện. Hệ thống ưu tiên Speaking.

---

## 28. Progress Tracking

### Learning Progress

- Lessons completed
- Exercises completed
- Study time
- Learning streak

### Skill Progress

```text
Listening
Speaking
Reading
Writing
Vocabulary
Grammar
```

### Goal Progress

```text
TOEIC
Communication
General English
```

---

## 29. Weakness Detection

Weakness dựa trên nhiều evidence:

```text
Assessment
+
Exercise Results
+
Repeated Errors
+
Learning History
+
AI Feedback
```

Ví dụ:

```text
Grammar:
Past Simple → Weak

Vocabulary:
Travel → Strong
Food → Medium

Listening:
Fast conversation → Weak

Speaking:
Fluency → Weak
```

---

## 30. Free Practice

Người dùng không bị khóa vào Daily Plan.

Có thể:

```text
Practice Speaking
Practice Grammar
Practice TOEIC
Practice Vocabulary
Chat with AI
```

Hoạt động ngoài plan vẫn được ghi nhận vào Learner Profile nếu có dữ liệu phù hợp.

---

## 31. TOEIC Module

TOEIC là một product pillar nhưng nên triển khai sau core adaptive learning để tránh scope MVP quá lớn.

### Listening

```text
Part 1
Part 2
Part 3
Part 4
```

### Reading

```text
Part 5
Part 6
Part 7
```

Người dùng có thể:

- Practice by Part
- Practice by Difficulty
- Review Mistakes
- Full Test

---

## 32. TOEIC AI Analysis

AI phân tích:

```text
Score
Accuracy
Time
Weak Parts
Weak Question Types
Vocabulary Weakness
Grammar Weakness
Repeated Mistakes
```

Ví dụ:

```text
Weakness:

Part 5
- Verb tense
- Word form

Part 3
- Listening for details

Recommendation:

Practice:
Verb Form — 20 questions
Listening Part 3 — 10 questions
```

Không trình bày AI-generated questions như câu hỏi chính thức của ETS.

---

## 33. Hybrid Content Strategy

Sản phẩm sử dụng:

```text
Curated Content
+
AI Generated Content
```

### Curated Content

Dùng cho:

- Core Vocabulary
- Grammar Foundation
- Foundation lessons
- CEFR-oriented materials
- TOEIC structure
- Core learning materials

### AI Generated

Dùng cho:

- Personalized exercises
- Extra practice
- Roleplay
- Writing prompts
- Explanations
- Conversation
- Personalized review

---

## 34. AI Architecture Principle

Không xây toàn bộ hệ thống xoay quanh một AI provider.

```text
Application
     ↓
AI Service
     ↓
AI Provider Interface
     ↓
Provider A / Provider B / Local Model
```

Ví dụ:

```text
AIService.generateTutorResponse()
AIService.analyzeAssessment()
AIService.generateLearningPath()
AIService.evaluateWriting()
AIService.evaluateSpeaking()
```

Mục tiêu là có thể thay đổi AI provider mà không phải viết lại toàn bộ hệ thống.

---

## 35. AI Responsibility vs Backend Responsibility

| Backend / Deterministic Logic | AI |
|---|---|
| Score | Explain score |
| Accuracy | Analyze weakness |
| Time | Recommend |
| Progress calculation | Generate content |
| User data | Tutor |
| Spaced repetition scheduling | Feedback |
| Goal priority | Conversation |
| Learning history | Personalized explanation |

---

## 36. MVP Scope

MVP phải chứng minh được **Adaptive Learning Loop**.

### Authentication

- Register
- Login
- User Profile

### Goals

- Create goal
- Primary / Secondary goal
- Priority
- Available study time

### Assessment

- Placement test
- Adaptive difficulty
- Overall level
- Skill profile

### Learner Profile

- Level
- Strength
- Weakness
- Goals
- Learning history

### Learning

- Vocabulary
- Grammar
- Listening
- Reading
- Speaking
- Writing

### Adaptive Learning

- Learning Path
- Daily Plan
- Recommendation
- Basic weakness detection

### Lesson

```text
Learn
Practice
Apply
Assess
Feedback
Review
Next Action
```

### AI

- Assessment analysis
- Learning recommendation
- AI Tutor cơ bản
- AI exercise generation
- Writing feedback cơ bản

### Progress

- Study time
- Completion
- Accuracy
- Skill progress
- Weakness

---

## 37. V1 Scope

Sau khi MVP chứng minh core loop:

- AI Tutor nâng cao
- AI Conversation
- Speaking Evaluation
- Writing Evaluation nâng cao
- Spaced Repetition hoàn chỉnh
- Personalized Exercise Engine
- Advanced Recommendation

---

## 38. V2 Scope

- TOEIC Part 1–7
- Full TOEIC Test
- TOEIC Score Analysis
- Advanced Analytics
- Gamification
- Achievement
- Streak
- Leaderboard

---

## 39. V3 — Future

Có thể mở rộng:

- Advanced Adaptive Engine
- Advanced Speech AI
- Personalized AI Tutor
- Mobile App
- Social Learning
- Community
- Subscription
- Advanced TOEIC Prediction
- Specialized AI Models

---

## 40. Non-Goals của MVP

MVP không cố gắng làm ngay:

- Mạng xã hội học tiếng Anh.
- Marketplace giáo viên.
- Livestream.
- Mobile app native.
- Gamification phức tạp.
- Fine-tune model riêng.
- Xây foundation model riêng.
- TOEIC full ecosystem ngay từ đầu.

Mục tiêu đầu tiên:

> **Chứng minh hệ thống có thể hiểu người học và thay đổi việc học dựa trên người học.**

---

## 41. Success Metrics

### Activation

Tỷ lệ user:

```text
Register
→ Complete Assessment
→ Receive Learning Path
→ Start First Lesson
```

### Engagement

Theo dõi:

- Daily Active Learners
- Weekly Active Learners
- Average Study Time
- Lessons / Session

### Learning

- Assessment Improvement
- Skill Improvement
- Accuracy Improvement
- Weakness Reduction

### Adaptive Effectiveness

Theo dõi:

- Recommendation Acceptance Rate
- Recommendation Completion Rate
- Recommended vs Non-recommended Performance
- Weakness Improvement

---

## 42. Acceptance Criteria — Core Product

### AC-01

User có thể đăng ký và tạo learning goals.

### AC-02

User có thể hoàn thành placement test.

### AC-03

Hệ thống tạo được learner profile.

### AC-04

Hệ thống xác định overall level và skill levels.

### AC-05

AI có thể phân tích learner profile.

### AC-06

Hệ thống tạo ít nhất 2 learning path recommendations.

### AC-07

User có thể chọn / customize / reject learning path.

### AC-08

Hệ thống tạo daily learning plan.

### AC-09

Daily plan thay đổi dựa trên performance.

### AC-10

User có thể học lesson theo lifecycle:

```text
Learn
→ Practice
→ Apply
→ Assess
→ Feedback
→ Review
```

### AC-11

Hệ thống lưu kết quả học tập.

### AC-12

Hệ thống phát hiện weakness.

### AC-13

Hệ thống đưa ra Next Best Action.

### AC-14

User có thể free practice.

### AC-15

AI Tutor hoạt động trong và ngoài lesson.

---

## 43. Core User Journey

```text
Register
   ↓
Choose Goals
   ↓
Study Time
   ↓
Placement Test
   ↓
Learner Model
   ↓
AI Analysis
   ↓
Learning Path
   ↓
Daily Plan
   ↓
Learning
   ↓
Practice
   ↓
Evaluate
   ↓
Feedback
   ↓
Update Model
   ↓
Weakness Detection
   ↓
New Recommendation
   ↓
LOOP
```

---

## 44. Product Architecture ở mức khái niệm

```text
┌─────────────────────────────────────┐
│             Frontend                │
│                                     │
│ Dashboard / Lessons / Practice      │
│ Assessment / Progress / AI Tutor    │
└──────────────────┬──────────────────┘
                   ↓
┌─────────────────────────────────────┐
│              Backend                │
│                                     │
│ Auth                                │
│ User                                │
│ Assessment                          │
│ Learning                            │
│ Progress                            │
│ Recommendation                      │
│ Content                             │
└───────────┬─────────────────┬───────┘
            ↓                 ↓
┌──────────────────┐   ┌─────────────────┐
│ Learning Engine  │   │   AI Service    │
│                  │   │                 │
│ Adaptive Engine  │   │ Tutor           │
│ Scoring          │   │ Analysis        │
│ Recommendation   │   │ Generation      │
│ Progress         │   │ Evaluation      │
└─────────┬────────┘   └────────┬────────┘
          ↓                     ↓
     ┌──────────┐        ┌──────────────┐
     │ Database │        │ AI Providers │
     └──────────┘        └──────────────┘
```

---

## 45. Core Domain Models

Dự kiến:

```text
User
UserProfile

Goal
LearningPlan
DailyPlan

Assessment
AssessmentAttempt
AssessmentQuestion
AssessmentAnswer

LearnerProfile
SkillProfile
Weakness

Course
Module
Lesson
Activity

Vocabulary
GrammarTopic

PracticeAttempt
LearningSession

Progress
SkillProgress

ReviewItem
ReviewSchedule

Recommendation

Conversation
ConversationMessage

AIInteraction

TOEICTest
TOEICQuestion
TOEICAttempt
```

Đây chưa phải Database Schema cuối cùng.

---

## 46. Product Risks

### Risk 1 — Scope quá lớn

Sản phẩm bao gồm:

```text
4 Skills
+
Vocabulary
+
Grammar
+
AI
+
Adaptive Learning
+
TOEIC
```

**Giải pháp:** MVP tập trung vào Adaptive Learning Loop.

### Risk 2 — Phụ thuộc AI quá nhiều

Không giao các phép tính quan trọng cho LLM.

**Giải pháp:** Deterministic Learning Engine + AI Intelligence Layer.

### Risk 3 — AI tạo nội dung sai

Flow:

```text
Generate
 ↓
Validate
 ↓
Store
 ↓
Use
```

### Risk 4 — Recommendation không thực sự adaptive

Recommendation phải dựa trên:

```text
Performance
+
Weakness
+
Goals
+
Behavior
+
Time
```

---

## 47. Definition of Done — Product MVP

MVP không được coi là hoàn thành chỉ vì website chạy được.

MVP hoàn thành khi người dùng có thể đi qua:

```text
Register
↓
Assessment
↓
Learner Profile
↓
AI Analysis
↓
Learning Path
↓
Daily Plan
↓
Lesson
↓
Practice
↓
Assessment
↓
Feedback
↓
Progress Update
↓
Weakness Detection
↓
New Recommendation
```

Recommendation sau phải có khả năng thay đổi dựa trên dữ liệu học tập mới.

Đây là bằng chứng rằng **Adaptive Learning thực sự hoạt động**.

---

## 48. Product North Star

> **Percentage of active learners who complete their recommended learning activity and show measurable improvement over time.**

Nói đơn giản:

> **Người học có thực sự học đúng thứ hệ thống đề xuất và tiến bộ hay không?**

---

## 49. Product Statement

> **AI English Learning Platform là nền tảng học tiếng Anh cá nhân hóa sử dụng AI và Adaptive Learning để đánh giá trình độ, xác định điểm mạnh và điểm yếu, xây dựng lộ trình học phù hợp, đề xuất kế hoạch học tập hàng ngày và liên tục điều chỉnh trải nghiệm học dựa trên sự tiến bộ và hành vi của từng người học.**

---

## 50. Trạng thái PRD

```text
Product Vision              ✅
Target Users                ✅
Problem Statement           ✅
Product Goals               ✅
Product Principles          ✅
Core Learning Loop          ✅
Onboarding                  ✅
Assessment                  ✅
Learner Model               ✅
Adaptive Learning           ✅
Learning Path               ✅
Daily Plan                  ✅
4 Skills                    ✅
Vocabulary                  ✅
Grammar                     ✅
AI Tutor                    ✅
AI Conversation             ✅
AI Generation               ✅
AI Recommendation           ✅
Progress                    ✅
Weakness Detection          ✅
TOEIC                       ✅
Hybrid Content              ✅
MVP Scope                   ✅
Roadmap                     ✅
Success Metrics             ✅
Acceptance Criteria         ✅
Product Risks               ✅
```

---

## 51. Recommended Technology Direction

Đây là phần định hướng kỹ thuật, chưa phải Architecture Specification cuối cùng.

### Frontend

**React + TypeScript**

Có thể dùng:

- React
- TypeScript
- Vite hoặc Next.js
- Tailwind CSS
- React Query / TanStack Query
- React Hook Form

### Backend

Có hai hướng phù hợp:

**Hướng A — Supabase-centric**

```text
React / Next.js
       ↓
Supabase
 ├── PostgreSQL
 ├── Auth
 ├── Storage
 └── Row Level Security
       ↓
AI API / Backend Functions
```

**Hướng B — Custom Backend**

```text
React
  ↓
Node.js + TypeScript
  ↓
API
  ↓
PostgreSQL / MongoDB
  ↓
AI Providers
```

### Database Recommendation

**Ưu tiên PostgreSQL/Supabase cho dự án này.**

Lý do:

- Dữ liệu có quan hệ rõ ràng giữa User → Goal → Assessment → Lesson → Activity → Attempt → Progress.
- Có nhiều dữ liệu cần query và thống kê.
- Cần transaction và consistency.
- PostgreSQL phù hợp với Learning/Progress/Assessment data.
- Supabase cung cấp Authentication, Database, Storage và Row Level Security trong cùng hệ thống.
- Dễ triển khai MVP hơn việc tự xây toàn bộ backend infrastructure.

MongoDB vẫn có thể sử dụng, nhưng không phải lựa chọn đầu tiên cho domain này.

### AI Layer

Không gọi AI trực tiếp từ frontend.

```text
React
   ↓
Backend / Server
   ↓
AI Service
   ↓
AI Provider
```

API key và logic AI phải nằm phía server.

### Storage

Audio, recording và các file học tập nên được lưu ở object storage thay vì nhét trực tiếp vào database.

---

## 52. Recommended Initial Stack

Nếu mục tiêu là **làm thật, dễ phát triển và phù hợp với một project cá nhân/university project**, stack khởi đầu được đề xuất:

```text
Frontend
React
TypeScript
Tailwind CSS

Backend
Node.js
TypeScript

Database / Backend Platform
Supabase
PostgreSQL
Supabase Auth
Supabase Storage

AI
AI Provider API
AI Service abstraction

Deployment
Frontend → Vercel hoặc tương đương
Backend → Serverless / Node hosting
Database → Supabase
```

Một lựa chọn đơn giản hơn:

```text
Next.js
+
TypeScript
+
Supabase
+
AI API
```

vì Next.js có thể đảm nhiệm cả frontend và một phần server-side logic, giúp giảm số lượng project phải quản lý.

---

## 53. Important Architecture Decision

Không nên bắt đầu bằng:

```text
React
+
MongoDB
+
AI API
```

rồi sau đó mới nghĩ hệ thống hoạt động thế nào.

Nên đi theo:

```text
PRD
 ↓
Requirements
 ↓
User Flow
 ↓
Domain Model
 ↓
System Architecture
 ↓
Database Schema
 ↓
API Contract
 ↓
AI Architecture
 ↓
Implementation
```

PRD này là **Source of Truth cấp Product**. Các tài liệu Architecture và Requirements sau này phải bám vào PRD.

---

# Next Step

Sau PRD v1.0, bước tiếp theo là tạo:

```text
/docs
├── product/
│   ├── PRD.md
│   ├── VISION.md
│   └── ROADMAP.md
│
├── requirements/
│   ├── AUTH.md
│   ├── ASSESSMENT.md
│   ├── LEARNING.md
│   ├── ADAPTIVE_ENGINE.md
│   ├── VOCABULARY.md
│   ├── GRAMMAR.md
│   ├── LISTENING.md
│   ├── SPEAKING.md
│   ├── READING.md
│   ├── WRITING.md
│   ├── AI.md
│   └── TOEIC.md
│
└── architecture/
    ├── SYSTEM.md
    ├── DATABASE.md
    ├── API.md
    └── AI_ARCHITECTURE.md
```

**PRD không phải Database Schema hay Architecture Specification.** Những phần đó sẽ được thiết kế ở bước tiếp theo dựa trên PRD này.
