# System Architecture — AI English Learning Platform

**Version:** 1.0  
**Status:** Draft  
**Stack:** Next.js + TypeScript + Supabase + AI APIs

---

## 1. Architecture Goal

Xây dựng hệ thống có khả năng:

- Authentication
- Assessment
- Learner Profile
- Personalized Learning Path
- Adaptive Learning
- Daily Plan
- Listening / Speaking / Reading / Writing
- Grammar / Vocabulary
- TOEIC
- AI Tutor / Analysis / Recommendation

Architecture phải dễ mở rộng và không khóa chặt vào một AI provider.

---

# 2. High-Level Architecture

```text
                         CLIENT
                           │
                           ↓
                    Next.js Application
                           │
             ┌─────────────┴─────────────┐
             ↓                           ↓
           UI Layer                Server Layer
             │                           │
             │                    Domain / Services
             │                           │
             │          ┌────────────────┼─────────────────┐
             │          ↓                ↓                 ↓
             │       Learning         Assessment          AI
             │       Services          Services         Services
             │          │                │                 │
             │          └────────────────┼─────────────────┘
             │                           ↓
             │                     Supabase
             │                ┌──────────┼──────────┐
             │                ↓          ↓          ↓
             │            PostgreSQL    Auth      Storage
             │
             └────────────────────────────────────────────
```

---

# 3. Architectural Principles

### ARCH-01 — Domain Oriented

Business logic được tổ chức theo domain thay vì gom tất cả vào component.

### ARCH-02 — Server First

Logic nhạy cảm và database access ưu tiên server-side.

### ARCH-03 — Type Safe

TypeScript xuyên suốt application.

### ARCH-04 — AI Isolated

AI nằm trong service layer, không gọi trực tiếp từ UI.

### ARCH-05 — Database Integrity

Database constraints + RLS bảo vệ dữ liệu.

### ARCH-06 — Extensible

Có thể thêm AI provider hoặc learning domain mới mà không phải viết lại core.

---

# 4. Technology Stack

## Frontend / Full-stack

```text
Next.js
TypeScript
React
```

Sử dụng Next.js App Router.

## Backend

Không cần tạo Express server riêng trong MVP.

Dùng:

```text
Next.js Route Handlers
Server Actions
Server-side Services
```

## Database

```text
Supabase PostgreSQL
```

## Authentication

```text
Supabase Auth
```

## Storage

```text
Supabase Storage
```

Dùng cho:

```text
Audio
User recordings
Learning assets
```

## AI

External AI APIs thông qua AI abstraction layer.

---

# 5. Next.js Architecture

```text
app/
├── (auth)/
├── (dashboard)/
├── learn/
├── practice/
├── assessment/
├── toeic/
├── tutor/
└── api/
```

UI route không chứa business logic phức tạp.

---

# 6. Domain Layer

Đề xuất:

```text
src/
└── domains/
    ├── auth/
    ├── learner/
    ├── assessment/
    ├── learning-path/
    ├── adaptive/
    ├── daily-plan/
    ├── grammar/
    ├── vocabulary/
    ├── listening/
    ├── speaking/
    ├── reading/
    ├── writing/
    ├── toeic/
    └── ai/
```

Mỗi domain có thể chứa:

```text
types
schemas
services
repositories
utils
```

Không bắt buộc domain nào cũng cần tất cả.

---

# 7. Application Flow

Ví dụ user hoàn thành practice:

```text
UI
 ↓
Server Action / Route Handler
 ↓
Validation
 ↓
Learning Service
 ↓
Store Result
 ↓
Create Evidence
 ↓
Adaptive Engine
 ↓
Update Mastery / Weakness
 ↓
Generate Recommendation
 ↓
Return Result
```

---

# 8. Supabase Access

Không để mọi component trực tiếp query database.

Thay vào đó:

```text
UI
 ↓
Server Action / Route Handler
 ↓
Domain Service
 ↓
Repository / Supabase Client
 ↓
PostgreSQL
```

Điều này giúp business logic tập trung và dễ test.

---

# 9. Supabase Clients

Nên phân biệt:

```text
Browser Client
Server Client
Admin / Service Role Client
```

Service Role key tuyệt đối không được expose ra client.

---

# 10. Authentication Flow

```text
User
 ↓
Supabase Auth
 ↓
Session
 ↓
Next.js Middleware / Server
 ↓
Protected Route
 ↓
Application
```

User profile application được liên kết với Supabase Auth user id.

---

# 11. Authorization

Authorization phải kiểm tra ở server.

Ví dụ:

```text
User A
→ chỉ đọc/update dữ liệu của User A
```

Supabase Row Level Security là lớp bảo vệ chính ở database.

Không dựa vào frontend để bảo vệ authorization.

---

# 12. RLS

Các bảng chứa user data cần RLS.

Ví dụ:

```text
learner_profiles
learning_paths
daily_plans
learning_events
test_attempts
speaking_sessions
writing_submissions
```

Policy concept:

```text
auth.uid() = user_id
```

Chi tiết policy nằm trong database design phase.

---

# 13. Learning Architecture

Core:

```text
Assessment
    ↓
Learner Profile
    ↓
Learning Path
    ↓
Adaptive Engine
    ↓
Daily Plan
    ↓
Activity
    ↓
Evidence
    ↓
Profile / Adaptive Update
```

Đây là core domain của product.

---

# 14. Assessment Architecture

Assessment gồm:

```text
Assessment Definition
Questions
Attempt
Answers
Results
Analysis
```

Flow:

```text
Start
 ↓
Questions
 ↓
Submit
 ↓
Validate Answers
 ↓
Calculate Score
 ↓
Generate Evidence
 ↓
Analyze
 ↓
Update Profile
```

Objective score phải được tính deterministic.

---

# 15. Adaptive Engine

Adaptive Engine không nên nằm trong React component.

Đề xuất:

```text
src/domains/adaptive/
├── services/
│   ├── mastery.service.ts
│   ├── weakness.service.ts
│   ├── priority.service.ts
│   └── recommendation.service.ts
├── rules/
└── types/
```

AI chỉ được gọi khi cần.

---

# 16. Learning Activity Architecture

Learning Activity là abstraction chung.

Ví dụ:

```text
activity_type:
lesson
practice
quiz
listening
speaking
reading
writing
review
toeic_part
```

Các module có thể tái sử dụng cùng activity/evidence framework.

---

# 17. Evidence Architecture

Mọi learning domain nên tạo evidence chuẩn hóa.

Ví dụ:

```text
Learning Event
 ↓
Evidence
 ├── skill
 ├── topic
 ├── difficulty
 ├── score
 ├── accuracy
 └── metadata
```

Adaptive Engine đọc evidence thay vì phải hiểu từng UI module.

---

# 18. AI Architecture

```text
Domain Service
      ↓
AI Service
      ↓
AI Provider Abstraction
      ↓
Provider Adapter
      ↓
External AI API
```

Ví dụ:

```text
TutorService
SpeakingService
WritingService
AssessmentAnalysisService
RecommendationService
```

Không gọi provider trực tiếp từ page/component.

---

# 19. AI Provider Abstraction

Concept:

```text
AIProvider
├── generateText()
├── generateStructured()
└── analyze()
```

Provider adapter:

```text
ProviderA
ProviderB
ProviderC
```

Business logic chỉ phụ thuộc vào interface.

---

# 20. AI Context

AI request nên nhận context có giới hạn:

```text
Current Goal
Current Level
Current Activity
Relevant Mastery
Recent Evidence
User Preferences
```

Không gửi toàn bộ database history.

---

# 21. AI Output Validation

Flow:

```text
AI Response
 ↓
Parse
 ↓
Schema Validation
 ↓
Business Validation
 ↓
Use
```

Có thể dùng Zod.

AI output không được mặc định là trusted data.

---

# 22. API Architecture

Các API nên chia theo domain:

```text
/api/auth
/api/assessment
/api/learning
/api/adaptive
/api/daily-plan
/api/grammar
/api/vocabulary
/api/listening
/api/speaking
/api/reading
/api/writing
/api/toeic
/api/ai
```

Không nhất thiết expose mọi service thành public API.

Server Actions có thể được dùng cho mutation nội bộ.

---

# 23. Storage Architecture

Supabase Storage buckets có thể gồm:

```text
learning-audio
user-recordings
learning-assets
```

User recordings cần access control.

Không đưa private audio lên public bucket nếu không cần.

---

# 24. Caching

Có thể cache:

```text
Static Learning Content
Vocabulary Data
Grammar Content
Public Audio Metadata
```

Không cache user-specific sensitive data một cách tùy tiện.

AI responses có thể cache trong một số trường hợp deterministic.

---

# 25. Background Jobs

MVP chưa bắt buộc queue system.

Sau này có thể dùng background jobs cho:

```text
AI analysis
Large content generation
Daily plan generation
Analytics
Audio processing
```

---

# 26. Error Handling

Các layer:

```text
Validation Error
Authentication Error
Authorization Error
Business Error
AI Error
Database Error
External Service Error
```

Frontend nhận error format thống nhất.

AI failure không được làm crash toàn bộ learning flow.

---

# 27. Observability

Theo dõi:

```text
Request
Latency
Error
AI provider
AI model
Token usage
Cost
Learning event
```

Không log:

```text
API keys
Passwords
Sensitive tokens
Unnecessary private user content
```

---

# 28. Security

MVP phải có:

```text
Supabase Auth
RLS
Server-side authorization
Environment variables
Input validation
AI output validation
Rate limiting cho AI endpoint
```

Không expose:

```text
SUPABASE_SERVICE_ROLE_KEY
AI API Keys
```

ra browser.

---

# 29. Testing Strategy

## Unit

Test:

```text
Mastery calculation
Priority calculation
Scoring
Prerequisite logic
Adaptive rules
```

## Integration

Test:

```text
Assessment → Profile
Activity → Evidence
Evidence → Adaptive
AI → Validation
```

## E2E

Test critical flows:

```text
Signup
Assessment
Generate Learning Path
Daily Plan
Complete Activity
Adaptive Update
TOEIC Test
```

---

# 30. Deployment Architecture

MVP:

```text
Browser
   ↓
Next.js App
   ↓
Supabase
   ↓
External AI APIs
```

Next.js có thể deploy trên platform hỗ trợ Next.js.

Supabase cung cấp:

```text
PostgreSQL
Auth
Storage
```

---

# 31. Environment Variables

Concept:

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY

SUPABASE_SERVICE_ROLE_KEY

AI_PROVIDER_API_KEY
```

Secret variables chỉ server-side.

Không commit `.env`.

---

# 32. Scalability Direction

MVP:

```text
Next.js Monolith
+
Supabase
+
AI APIs
```

Không cần microservices.

Nếu scale lớn:

```text
Next.js
 ↓
Domain Services
 ↓
Background Workers
 ↓
AI Service
 ↓
Analytics / Recommendation Infrastructure
```

Chỉ tách service khi có lý do thực tế.

---

# 33. Architecture Decision Summary

| Decision | Choice |
|---|---|
| Frontend | Next.js + React |
| Language | TypeScript |
| Backend | Next.js Server |
| Database | Supabase PostgreSQL |
| Auth | Supabase Auth |
| Storage | Supabase Storage |
| AI | External AI APIs |
| AI Architecture | Provider abstraction |
| Adaptive | Hybrid Rule + AI |
| API | Route Handlers + Server Actions |
| State | Server-first + local UI state |
| ORM | Supabase client / SQL where appropriate |
| Deployment | Next.js-compatible platform + Supabase |

---

# 34. What We Do NOT Build Yet

Chưa cần:

```text
Microservices
Kubernetes
Separate Express backend
Custom AI model training
Complex ML infrastructure
Real-time distributed architecture
```

MVP cần giữ architecture đơn giản nhưng có đường mở rộng.

---

# 35. Next Step

Sau architecture:

```text
SYSTEM_ARCHITECTURE.md
        ↓
DATABASE_SCHEMA.md
        ↓
API_DESIGN.md
        ↓
AI_ARCHITECTURE.md
        ↓
PROJECT_STRUCTURE.md
        ↓
DEVELOPMENT_ROADMAP.md
        ↓
CODEBASE
```
