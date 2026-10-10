# Requirements — Speaking

**Module:** SPEAKING  
**Version:** 1.0  
**Status:** Draft

## 1. Mục tiêu

Speaking giúp người học sử dụng tiếng Anh trong giao tiếp thực tế, đồng thời nhận feedback về pronunciation, fluency, grammar và vocabulary.

Core cycle:

```text
Listen / Prompt → Speak → Transcribe → Evaluate → Feedback → Retry
```

## 2. Speaking Modes

MVP:

```text
Guided Speaking
Roleplay
Question & Answer
Read Aloud
Repeat / Shadowing
```

Sau này:

```text
Free Conversation
Interview Simulation
TOEIC Speaking nếu cần
```

## 3. Conversation

AI có thể đóng vai:

```text
Friend
Teacher
Interviewer
Customer
Coworker
Travel Partner
```

Conversation phải có context và mục tiêu rõ ràng.

Ví dụ:

```text
Scenario:
Ordering food

Goal:
Use restaurant vocabulary
Practice polite requests
```

## 4. Evaluation Dimensions

Có thể đánh giá:

```text
Pronunciation
Fluency
Grammar
Vocabulary
Relevance
Coherence
```

Không nên biến tất cả thành một score duy nhất trong MVP.

## 5. Speech Pipeline

```text
User Audio
 ↓
Speech-to-Text
 ↓
Transcript
 ↓
Evaluation
 ↓
Feedback
 ↓
Retry
```

Có thể sử dụng external Speech-to-Text API.

## 6. AI Role

AI có thể:

- Làm conversation tutor.
- Tạo scenario.
- Đặt câu hỏi follow-up.
- Phân tích transcript.
- Gợi ý cách nói tự nhiên hơn.
- Tạo bài luyện theo weakness.

Pronunciation chuyên sâu có thể cần speech-specific service/model thay vì chỉ LLM.

## 7. Feedback

Feedback nên ưu tiên actionable feedback:

```text
You said:
"I go to restaurant yesterday."

Better:
"I went to a restaurant yesterday."

Why:
Past event → use Past Simple.
```

Không nên feedback quá nhiều lỗi cùng lúc.

## 8. Adaptive Integration

```text
Grammar errors
→ Grammar practice

Vocabulary limitation
→ Vocabulary review

Low fluency
→ Shorter speaking prompts

Good performance
→ Longer / harder conversation
```

## 9. Evidence

Track:

```text
session_duration
transcript
error_types
speaking_prompt
retry_count
evaluation
```

## 10. Acceptance Criteria

- [ ] User có thể bắt đầu speaking activity.
- [ ] Có audio recording.
- [ ] Có speech-to-text.
- [ ] Có transcript.
- [ ] Có AI feedback.
- [ ] Có guided conversation.
- [ ] Có roleplay.
- [ ] Có retry.
- [ ] Track được speaking evidence.
- [ ] Feedback có thể đưa vào Adaptive Engine.
