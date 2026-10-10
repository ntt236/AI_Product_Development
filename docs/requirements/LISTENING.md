# Requirements — Listening

**Module:** LISTENING  
**Version:** 1.0  
**Status:** Draft

## 1. Mục tiêu

Listening giúp người học phát triển khả năng hiểu tiếng Anh qua audio, từ nội dung đơn giản đến hội thoại và nội dung theo mục tiêu TOEIC.

```text
Listen → Understand → Check → Practice → Re-listen → Evaluate
```

## 2. Content Structure

Một listening item có thể gồm:

```text
audio
transcript
level
topic
duration
speaker_count
difficulty
questions
```

Transcript có thể được ẩn trong lần nghe đầu.

## 3. Learning Flow

```text
Preview
 ↓
First Listen
 ↓
Comprehension
 ↓
Questions
 ↓
Transcript Check
 ↓
Second Listen
 ↓
Feedback
```

## 4. Exercise Types

MVP:

```text
Multiple Choice
True / False
Fill in Missing Words
Main Idea
Specific Information
Speaker Intent
```

Sau này:

```text
Dictation
Shadowing
Listen and Repeat
```

## 5. Difficulty

Có thể dựa trên:

```text
CEFR Level
Speech Speed
Vocabulary Difficulty
Accent
Audio Length
Number of Speakers
Question Difficulty
```

## 6. Evaluation

Theo dõi:

```text
accuracy
audio_completion
replay_count
response_time
question_type
```

Replay nhiều hoặc accuracy thấp chỉ là signal, không tự động kết luận user yếu.

## 7. Transcript

Hỗ trợ:

```text
Show / Hide
Highlight phrase
Explain vocabulary
Explain grammar
```

## 8. AI Role

AI có thể:

- Giải thích transcript.
- Tạo comprehension questions.
- Tạo vocabulary context.
- Phân tích lỗi.
- Tạo listening practice phù hợp.

## 9. Adaptive Integration

```text
Listening weakness
→ Easier audio

Improving
→ Increase difficulty

Repeated vocabulary failure
→ Vocabulary review

Good comprehension
→ Reduce scaffolding
```

## 10. TOEIC Integration

Có thể cung cấp nền tảng cho:

```text
TOEIC Part 1
TOEIC Part 2
TOEIC Part 3
TOEIC Part 4
```

TOEIC-specific rules/scoring nằm trong `TOEIC.md`.

## 11. Acceptance Criteria

- [ ] Có audio content.
- [ ] Có transcript.
- [ ] Có listening questions.
- [ ] Có nhiều difficulty.
- [ ] Có scoring.
- [ ] Track được listening evidence.
- [ ] Có transcript support.
- [ ] Adaptive Engine thay đổi difficulty.
- [ ] Content có thể tái sử dụng cho TOEIC.
