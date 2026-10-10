# Requirements — AI Layer

**Module:** AI  
**Version:** 1.0  
**Status:** Draft

## 1. Mục tiêu

AI là intelligence layer của sản phẩm, không phải toàn bộ backend.

AI hỗ trợ:

```text
Assessment
Tutor
Analysis
Recommendation
Content Generation
Speaking
Writing
Conversation
```

---

## 2. AI Principles

### AI-01 — AI as Assistant

AI hỗ trợ hệ thống và người học.

### AI-02 — Deterministic Where Possible

Những thứ cần chính xác phải do code/rules xử lý.

### AI-03 — Structured Output

AI response quan trọng phải dùng structured schema.

### AI-04 — Human/User Control

AI recommendation không tự động trở thành user decision.

### AI-05 — Cost Aware

Không gọi AI khi rule-based logic đã đủ.

---

## 3. AI Use Cases

### Assessment

AI có thể:

```text
Analyze open responses
Generate diagnostic questions
Explain assessment result
```

Scoring objective questions:

```text
Backend
```

---

### AI Tutor

Tutor có thể:

```text
Explain grammar
Explain vocabulary
Answer questions
Give examples
Generate practice
Roleplay
```

Tutor phải biết context:

```text
User Level
Current Goal
Current Topic
Learning History
Current Activity
```

---

### AI Recommendation

AI có thể:

```text
Explain weakness
Suggest learning strategy
Suggest activity
Suggest alternative
Explain Learning Path
```

Nhưng Adaptive Engine vẫn kiểm soát core state.

---

### Speaking

Pipeline:

```text
Audio
 ↓
Speech-to-Text
 ↓
Transcript
 ↓
AI Evaluation
 ↓
Feedback
```

AI có thể đánh giá:

```text
Grammar
Vocabulary
Fluency signals
Relevance
Naturalness
```

Pronunciation chuyên sâu có thể cần speech-specific service.

---

### Writing

Pipeline:

```text
Writing
 ↓
Rubric / Rule checks
 ↓
AI Evaluation
 ↓
Feedback
 ↓
Rewrite
```

---

### Content Generation

AI có thể tạo:

```text
Exercises
Examples
Conversation
Writing Prompts
Explanations
Hints
```

Production content cần validation trước khi đưa vào content bank.

---

## 4. AI vs Backend

### Backend / Rules

Nên xử lý:

```text
Authentication
Authorization
User permissions
Raw scoring
Correct answer validation
Mastery calculation
Learning state
Goal priority
Prerequisites
Time constraints
Database integrity
```

### AI

Nên xử lý:

```text
Natural language understanding
Explanation
Feedback
Conversation
Content generation
Pattern interpretation
Recommendation explanation
```

---

## 5. Hybrid Recommendation

Flow:

```text
Evidence
 ↓
Deterministic Metrics
 ↓
Adaptive Engine
 ↓
Candidate Actions
 ↓
AI optional analysis
 ↓
Final Recommendation
 ↓
User
```

Không gọi AI cho mọi event.

---

## 6. AI Provider Abstraction

Không hard-code toàn bộ app vào một provider.

Tạo abstraction:

```text
AIProvider
 ├── generateText()
 ├── analyze()
 ├── generateStructured()
```

Sau này có thể thay:

```text
Provider A
Provider B
Provider C
```

mà không phải sửa business logic toàn hệ thống.

---

## 7. Model Routing

Không phải task nào cũng cần model mạnh nhất.

Ví dụ:

```text
Simple Explanation
→ cheaper / faster model

Complex Tutor
→ stronger model

Structured Analysis
→ model with reliable structured output

Speech
→ speech-specific service
```

Model selection nên nằm trong configuration.

---

## 8. Structured Output

AI response quan trọng nên có schema.

Ví dụ:

```json
{
  "summary": "...",
  "weaknesses": [],
  "recommendations": [],
  "confidence": 0.82
}
```

Backend validate bằng schema trước khi sử dụng.

---

## 9. Prompt Management

Không nên để prompt rải rác trong React components.

Đề xuất:

```text
src/
└── lib/
    └── ai/
        ├── providers/
        ├── prompts/
        ├── schemas/
        └── services/
```

Prompt nên versioned.

Ví dụ:

```text
grammar-tutor.v1
speaking-evaluation.v1
writing-feedback.v1
assessment-analysis.v1
```

---

## 10. Context Management

AI context nên có giới hạn.

Không gửi toàn bộ database history vào mỗi request.

Ưu tiên:

```text
Current Activity
+
Relevant Profile
+
Recent Evidence
+
Goal
```

---

## 11. AI Memory

Không coi chat history là learner memory mặc định.

Learner memory nên được lưu dưới dạng structured data:

```text
preferences
goals
mastery
weaknesses
learning history
```

AI chỉ đọc context cần thiết.

---

## 12. Safety / Quality

AI output phải:

```text
Validate
Sanitize
Handle failure
Handle timeout
Handle rate limit
```

Nếu AI thất bại:

```text
Fallback
→ deterministic explanation / retry / alternative flow
```

Không để một AI API failure làm hỏng toàn bộ learning session.

---

## 13. Cost Control

MVP cần:

```text
Token limits
Caching where appropriate
Model routing
Retry limits
Rate limiting
```

Không gọi AI cho:

```text
Simple answer checking
Basic score calculation
Simple mastery update
```

---

## 14. Observability

Theo dõi:

```text
provider
model
latency
tokens
cost
success/failure
task_type
```

Không log API keys hoặc sensitive user content không cần thiết.

---

## 15. AI Evaluation

AI feature cần evaluation.

Ví dụ:

```text
Tutor quality
Feedback correctness
Recommendation usefulness
Content quality
Speaking evaluation consistency
Writing evaluation consistency
```

Có thể tạo test dataset nội bộ.

---

## 16. Initial AI Architecture

```text
Application
     ↓
AI Service Layer
     ↓
AI Provider Abstraction
     ↓
Provider Adapter
     ↓
External AI API
```

Các feature gọi:

```text
TutorService
AssessmentAIService
RecommendationAIService
SpeakingAIService
WritingAIService
ContentGenerationService
```

---

## 17. No Separate Training Initially

MVP không cần train foundation model riêng.

Ưu tiên:

```text
External AI API
+
Prompt Engineering
+
Structured Output
+
RAG / curated content khi cần
+
Evaluation
```

Fine-tuning/custom model chỉ được xem xét khi có:

```text
Enough quality data
Clear repeated use case
Stable evaluation dataset
Business reason
```

---

## 18. Acceptance Criteria

- [ ] AI có abstraction layer.
- [ ] Có provider adapter.
- [ ] Prompt được quản lý tập trung.
- [ ] Có structured output.
- [ ] Backend validate AI output.
- [ ] AI context được giới hạn.
- [ ] Không hard-code provider vào business logic.
- [ ] Có error handling/fallback.
- [ ] Có cost/rate control.
- [ ] Có observability.
- [ ] AI không tự quyết định critical backend state.
- [ ] Không cần train model riêng trong MVP.
