# Requirements — TOEIC

**Module:** TOEIC  
**Version:** 1.0  
**Status:** Draft

## 1. Mục tiêu

TOEIC module hỗ trợ:

```text
Learn
→ Practice by Part
→ Mini Test
→ Full Test
→ Score
→ Weakness Analysis
→ Personalized Recommendation
```

MVP tập trung vào TOEIC Listening & Reading.

---

## 2. TOEIC Parts

### Listening

```text
Part 1 — Photographs
Part 2 — Question-Response
Part 3 — Conversations
Part 4 — Talks
```

### Reading

```text
Part 5 — Incomplete Sentences
Part 6 — Text Completion
Part 7 — Reading Comprehension
```

---

## 3. Training Modes

User có thể chọn:

```text
Practice by Part
Practice by Skill
Timed Practice
Mini Test
Full Test
```

Ví dụ:

```text
TOEIC Part 5
→ Grammar Focus
→ 20 questions
→ Timed
```

---

## 4. Full Test

Full Test phải có:

```text
Listening
+
Reading
```

Flow:

```text
Start Test
 ↓
Listening
 ↓
Reading
 ↓
Submit
 ↓
Scoring
 ↓
Analysis
```

MVP có thể chưa cần mô phỏng mọi hành vi của kỳ thi thật.

---

## 5. Question Structure

Mỗi question nên có:

```text
id
part
question_type
difficulty
content
options
correct_answer
explanation
skill
topic
```

Question có thể liên kết:

```text
grammar_topic
vocabulary_topic
reading_skill
listening_skill
```

---

## 6. Difficulty

MVP:

```text
Easy
Medium
Hard
```

Sau này có thể dùng difficulty calibration dựa trên performance.

---

## 7. Scoring

Hệ thống cần lưu:

```text
raw_score
correct_count
incorrect_count
skipped_count
time_spent
```

TOEIC score conversion phải sử dụng một scoring configuration phù hợp với test version.

Không hard-code một công thức giả định rằng raw score luôn map trực tiếp sang official scaled score.

---

## 8. Weakness Analysis

Sau test:

```text
Score
 ↓
Part Analysis
 ↓
Skill Analysis
 ↓
Topic Analysis
 ↓
Error Analysis
 ↓
Recommendation
```

Ví dụ:

```text
Part 5: 62%
Part 3: 48%

Weakness:
Listening comprehension
Grammar
Vocabulary
```

---

## 9. AI Analysis

AI có thể tạo:

```text
Performance Summary
Weakness Explanation
Mistake Patterns
Recommended Topics
Recommended Activities
```

Ví dụ:

> Bạn đang yếu Part 3, đặc biệt ở câu hỏi về speaker intention. Hệ thống đề xuất luyện conversation listening trước khi tăng độ khó.

AI không tự tính raw score.

---

## 10. Part-specific Adaptive Learning

Mỗi Part có thể có adaptive behavior.

Ví dụ:

```text
Part 5 accuracy < threshold
→ Grammar practice

Part 3 accuracy < threshold
→ Conversation listening

Part 7 slow + inaccurate
→ Reading speed + comprehension
```

---

## 11. TOEIC + General English

TOEIC không tách biệt hoàn toàn khỏi General English.

Ví dụ:

```text
TOEIC Part 5
      ↓
Grammar weakness
      ↓
Grammar Module
      ↓
Practice
      ↓
Evidence
      ↓
Adaptive Engine
```

Điều này giúp tránh tạo hai hệ thống học riêng biệt.

---

## 12. Test History

Lưu:

```text
test_id
user_id
started_at
completed_at
score
part_scores
skill_scores
```

User có thể xem progress theo thời gian.

---

## 13. Question Review

Sau test user có thể:

```text
Review Incorrect
Review Skipped
Review Difficult
Review All
```

Mỗi câu có:

```text
Correct Answer
Explanation
Related Skill
Related Topic
```

---

## 14. Acceptance Criteria

- [ ] Có Part 1–7.
- [ ] Có practice từng Part.
- [ ] Có mini test.
- [ ] Có full test.
- [ ] Có scoring.
- [ ] Có test history.
- [ ] Có part analysis.
- [ ] Có skill/topic analysis.
- [ ] Có question review.
- [ ] AI có thể phân tích weakness.
- [ ] TOEIC weakness liên kết với General English.
- [ ] Kết quả được đưa vào Adaptive Engine.
