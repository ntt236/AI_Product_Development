# Requirements — Grammar

**Module:** GRAMMAR  
**Version:** 1.0  
**Status:** Draft

## 1. Mục tiêu

Grammar giúp người học xây dựng nền tảng ngữ pháp, luyện tập theo trình độ và nhận feedback cá nhân hóa.

```text
Learn → Practice → Evaluate → Review → Mastery
```

## 2. Grammar Content

Mỗi topic gồm:

```text
topic
level
description
rules
examples
common_errors
prerequisites
```

Ví dụ:

```text
Past Simple
Level: A1-A2
Prerequisite: Basic verbs
```

## 3. Learning Flow

```text
Topic
 ↓
Explanation
 ↓
Examples
 ↓
Guided Practice
 ↓
Independent Practice
 ↓
Mini Assessment
 ↓
Mastery Update
```

## 4. Exercise Types

MVP:

```text
Multiple Choice
Fill in the Blank
Error Correction
Sentence Ordering
Sentence Transformation
```

Sau này:

```text
Free Writing
Speaking Grammar Practice
AI-generated Exercises
```

## 5. Adaptive Integration

Grammar module gửi evidence:

```text
accuracy
difficulty
response_time
error_type
topic
```

Adaptive Engine có thể:

```text
Weak grammar
→ Review

Mastery improving
→ Harder practice

Mastery high
→ Move to next topic
```

## 6. AI Role

AI có thể:

- Giải thích grammar theo trình độ.
- Tạo ví dụ.
- Giải thích lỗi.
- Sinh practice phù hợp.
- Tạo conversation có mục tiêu grammar.

AI không phải source of truth cho scoring.

## 7. Acceptance Criteria

- [ ] Có grammar topics theo level.
- [ ] Có prerequisite.
- [ ] Có lesson/explanation.
- [ ] Có practice.
- [ ] Có mini assessment.
- [ ] Track được errors.
- [ ] Track được mastery.
- [ ] Gửi evidence cho Adaptive Engine.
- [ ] AI có thể giải thích lỗi.
- [ ] Difficulty có thể adaptive.
