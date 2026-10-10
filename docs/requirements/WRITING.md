# Requirements — Writing

**Module:** WRITING  
**Version:** 1.0  
**Status:** Draft

## 1. Mục tiêu

Writing giúp người học viết đúng, rõ ràng và phù hợp ngữ cảnh, từ sentence-level đến practical writing.

Core cycle:

```text
Prompt → Write → Evaluate → Feedback → Rewrite → Compare
```

## 2. Writing Levels

MVP có thể đi từ:

```text
Word / Phrase
 ↓
Sentence
 ↓
Short Paragraph
 ↓
Practical Message
```

Sau này:

```text
Essay
Formal Email
Opinion Writing
Academic Writing
```

## 3. Writing Tasks

Ví dụ:

```text
Write a sentence
Describe a picture
Reply to a message
Write an email
Describe an experience
Give an opinion
```

## 4. Evaluation Dimensions

AI có thể đánh giá:

```text
Grammar
Vocabulary
Spelling
Clarity
Coherence
Task Completion
Naturalness
```

## 5. AI Feedback

Feedback nên có:

```text
Original
Correction
Explanation
Improved Version
Next Practice
```

Ví dụ:

```text
Original:
"I am agree with you."

Correction:
"I agree with you."

Explanation:
"Agree is a verb, so do not use 'am'."
```

## 6. Rewrite Loop

Writing phải khuyến khích:

```text
Write
 ↓
Feedback
 ↓
Rewrite
 ↓
Evaluate Again
```

Mục tiêu không phải chỉ đưa đáp án đúng, mà giúp user tự sửa.

## 7. AI Role

AI có thể:

- Tạo writing prompt.
- Chấm/đánh giá theo rubric.
- Giải thích lỗi.
- Gợi ý vocabulary.
- Gợi ý cấu trúc.
- So sánh bản trước và sau.
- Tạo bài tập từ lỗi.

AI feedback nên được xem là recommendation; score quan trọng cần rubric/validation rõ ràng.

## 8. Adaptive Integration

```text
Grammar weakness
→ Grammar-focused writing

Vocabulary weakness
→ Target vocabulary task

Good sentence accuracy
→ Longer writing

Low coherence
→ Paragraph organization practice
```

## 9. Evidence

Track:

```text
prompt
submission
revision_count
error_types
evaluation
completion_time
```

Không nên lưu dữ liệu nhạy cảm không cần thiết.

## 10. Acceptance Criteria

- [ ] User có thể nhận writing prompt.
- [ ] User nhập/submits bài viết.
- [ ] AI có thể feedback.
- [ ] Có correction + explanation.
- [ ] Có rewrite.
- [ ] Có evaluation.
- [ ] Track được writing evidence.
- [ ] Feedback liên kết với Adaptive Engine.
- [ ] Có thể điều chỉnh task difficulty.
