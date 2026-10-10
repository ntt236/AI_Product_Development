# Requirements — Reading

**Module:** READING  
**Version:** 1.0  
**Status:** Draft

## 1. Mục tiêu

Reading giúp người học tăng comprehension, vocabulary, reading speed và khả năng xử lý các dạng câu hỏi.

Core cycle:

```text
Preview → Read → Understand → Answer → Review → Evaluate
```

## 2. Content

Reading content gồm:

```text
title
content
level
topic
difficulty
estimated_time
vocabulary
questions
```

Có thể hỗ trợ:

```text
Short Text
Dialogue
Article
Email
Announcement
Notice
Story
```

## 3. Exercise Types

MVP:

```text
Main Idea
Detail
Inference
Vocabulary in Context
Reference
True / False
Multiple Choice
```

## 4. Reading Skills

Theo dõi:

```text
Comprehension
Vocabulary
Inference
Detail Recognition
Reading Speed
```

## 5. Difficulty

Có thể dựa trên:

```text
CEFR
Text Length
Vocabulary Difficulty
Sentence Complexity
Question Difficulty
Time Limit
```

## 6. AI Role

AI có thể:

- Giải thích passage.
- Giải thích vocabulary.
- Giải thích câu hỏi.
- Tạo câu hỏi.
- Tạo passage theo level.
- Điều chỉnh difficulty.
- Phân tích reading mistakes.

Content dùng trong production nên có quality control; không để AI-generated content đi thẳng vào kho chính mà không validation.

## 7. Adaptive Integration

```text
Low comprehension
→ Shorter / easier texts

Good comprehension
→ Longer / harder texts

Vocabulary weakness
→ Vocabulary review

Slow reading
→ Timed practice
```

## 8. TOEIC Integration

Có thể tái sử dụng reading engine cho:

```text
TOEIC Part 5
TOEIC Part 6
TOEIC Part 7
```

TOEIC scoring và test structure nằm trong `TOEIC.md`.

## 9. Evidence

Track:

```text
accuracy
time_spent
reading_speed
question_type
errors
difficulty
```

## 10. Acceptance Criteria

- [ ] Có reading content.
- [ ] Có nhiều level/difficulty.
- [ ] Có câu hỏi.
- [ ] Có explanation.
- [ ] Track được performance.
- [ ] Có timed practice.
- [ ] Có vocabulary support.
- [ ] Có adaptive difficulty.
- [ ] Có thể tái sử dụng cho TOEIC.
