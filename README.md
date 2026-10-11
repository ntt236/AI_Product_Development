# AI English Learning Platform

Nền tảng học tiếng Anh thích ứng thông minh (Adaptive AI English Learning Platform) dành cho người mất gốc hoặc chưa xác định rõ trình độ. Hệ thống hỗ trợ người học nắm bắt vị trí hiện tại, mục tiêu cần đạt, lý do học và theo dõi tiến độ thực tế theo từng ngày.

## 1. Core Learning Loop
```text
Assess → Learner Profile → Learning Path → Daily Plan → Practice → Evidence → Adapt → Repeat
```

* **Backend & Logic Deterministic**: Chịu trách nhiệm hoàn toàn về điểm số, quyền, trạng thái và tiến độ học tập.
* **AI Layer**: Đề xuất lộ trình (`proposed`), giải thích bài tập, phản hồi ngôn ngữ và hội thoại hỗ trợ. Người học luôn giữ quyền quyết định (Accept / Edit / Reject).

---

## 2. Tech Stack

- **Framework**: Next.js 15 (App Router) + React 19 + TypeScript (Strict mode).
- **Backend Services**: Next.js Server Actions & Route Handlers.
- **Database & Auth**: Supabase (PostgreSQL với Row Level Security + Supabase Auth).
- **Storage**: Supabase Storage (Audio, media & user recordings).
- **AI Abstraction**: External LLM APIs (Gemini/OpenAI) qua Server-side Provider Adapter layer.
- **Styling**: Vanilla CSS Design System với Dark Mode & Responsive Layout.

---

## 3. Cấu trúc thư mục (Modular Monolith)

```text
├── docs/                     # Tài liệu sản phẩm, kiến trúc & yêu cầu kỹ thuật
│   ├── architecture/         # System architecture, DB schema, API design, AI architecture
│   ├── product/              # PRD, Vision, Development Roadmap
│   └── requirements/         # Yêu cầu chi tiết từng module (Auth, Assessment, Daily Plan, ...)
├── src/
│   ├── app/                  # Next.js App Router (Routing & Thin Pages)
│   ├── components/           # UI components tái sử dụng (Button, Card, Badge, ...)
│   ├── modules/              # Domain-oriented business logic (Auth, Assessment, Learning Path, ...)
│   └── lib/                  # Tiện ích chung & tích hợp hạ tầng
│       ├── supabase/         # Client helper, Server helper, Admin helper
│       ├── ai/               # AI provider interfaces, orchestrator & adapters
│       └── utils/            # Helper utilities
├── .env.example              # Mẫu biến môi trường
├── package.json
└── tsconfig.json             # TypeScript strict mode cấu hình
```

---

## 4. Hướng dẫn cài đặt & Chạy ứng dụng

### Yêu cầu môi trường
- Node.js LTS: `v20.x` trở lên (Khuyến nghị Node.js >= 20.20.0).
- Trình quản lý gói: `npm` (hoặc `pnpm` / `yarn`).

### Các bước khởi động

1. **Cài đặt thư viện phụ thuộc:**
   ```bash
   npm install
   ```

2. **Cấu hình biến môi trường:**
   Tạo file `.env.local` từ mẫu `.env.example`:
   ```bash
   cp .env.example .env.local
   ```
   Sau đó điền thông tin Supabase project của bạn vào `.env.local`:
   ```dotenv
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```
   *(Lưu ý: Không commit `.env.local` hoặc secret keys lên Git repo).*

3. **Chạy server phát triển (Development server):**
   ```bash
   npm run dev
   ```
   Mở trình duyệt tại địa chỉ: [http://localhost:3000](http://localhost:3000).

4. **Kiểm tra chất lượng code (Lint & Typecheck):**
   ```bash
   npm run lint
   npm run typecheck
   ```

5. **Build ứng dụng production:**
   ```bash
   npm run build
   ```

---

## 5. Lộ trình phát triển (Roadmap)

- [x] **Phase 0 — Foundation & Tooling Setup**: Khởi tạo Next.js App Router, TypeScript strict, cấu trúc Modular Monolith, tích hợp Supabase helpers & AI adapter interfaces.
- [ ] **Phase 1 — Auth, Profile & Onboarding**: Đăng ký/đăng nhập Supabase Auth, thiết lập mục tiêu, sở thích học và bảo vệ routes.
- [ ] **Phase 2 — Placement Assessment**: Ngân hàng câu hỏi, kiểm tra đánh giá ban đầu và deterministic scoring engine.
- [ ] **Phase 3 — Learner Profile & Learning Path**: Bảng ma trận kỹ năng và sinh đề xuất lộ trình học tập cá nhân hóa.
- [ ] **Phase 4 — Daily Plan & Practice**: Lập kế hoạch học theo ngày và thực hành bài học mẫu.
- [ ] **Phase 5 — AI Explanation & Tutor**: Tích hợp AI provider thật (Gemini/OpenAI) giải thích câu sai và trợ lý học tập.
- [ ] **Phase 6 — Vocabulary Review**: Ôn tập từ vựng ngắt quãng (Spaced Repetition).
- [ ] **Phase 7 — 4 Skills Practice**: Luyện tập Nghe, Nói, Đọc, Viết mở rộng.
- [ ] **Phase 8 — TOEIC Training**: Luyện đề thi TOEIC chuyên sâu.
