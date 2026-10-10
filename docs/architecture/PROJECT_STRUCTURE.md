# PROJECT_STRUCTURE.md

## 1. Cấu trúc đề xuất
```text
ai-english-platform/
├── docs/
│   ├── product/
│   ├── requirements/
│   └── architecture/
├── public/
│   ├── images/
│   └── audio/
├── src/
│   ├── app/
│   │   ├── (marketing)/page.tsx
│   │   ├── (auth)/login/page.tsx
│   │   ├── (auth)/register/page.tsx
│   │   ├── (app)/dashboard/page.tsx
│   │   ├── (app)/onboarding/page.tsx
│   │   ├── (app)/assessment/page.tsx
│   │   ├── (app)/learning-path/page.tsx
│   │   ├── (app)/today/page.tsx
│   │   ├── (app)/vocabulary/page.tsx
│   │   ├── (app)/tutor/page.tsx
│   │   └── api/
│   ├── components/
│   │   ├── ui/
│   │   ├── layout/
│   │   └── shared/
│   ├── modules/
│   │   ├── auth/
│   │   ├── onboarding/
│   │   ├── assessment/
│   │   ├── learner-profile/
│   │   ├── learning-path/
│   │   ├── daily-plan/
│   │   ├── content/
│   │   ├── practice/
│   │   ├── vocabulary/
│   │   ├── tutor/
│   │   ├── progress/
│   │   └── toeic/
│   ├── lib/
│   │   ├── supabase/client.ts
│   │   ├── supabase/server.ts
│   │   ├── ai/
│   │   ├── validation/
│   │   ├── errors/
│   │   └── utils/
│   └── types/
├── supabase/
│   ├── migrations/
│   └── seed.sql
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── .env.example
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```
Đây là cấu trúc đích; không cần tạo tất cả thư mục rỗng ngay. Next.js hỗ trợ `src/app` hoặc `app` ở root, hãy chọn một cách và nhất quán.

## 2. Phân lớp
- `app/`: route, layout và composition; giữ mỏng.
- `components/`: UI tái sử dụng, tránh chứa business logic lớn.
- `modules/`: nghiệp vụ theo domain; có thể chứa service, schema, types, repository và UI liên quan.
- `lib/supabase/`: tạo Supabase clients cho browser/server.
- `lib/ai/`: adapter, context builder, prompts, validation và usage logging.
- `supabase/migrations/`: schema changes có version; không chỉ sửa database thủ công.
- `tests/`: unit, integration và e2e.

## 3. Quy tắc import
- UI không gọi trực tiếp AI provider.
- Domain services không import React components.
- Không đưa service-role client vào code chạy client.
- Tránh circular imports; dùng alias `@/*` nếu đã cấu hình.

## 4. `.env.example`
```dotenv
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
AI_PROVIDER=
OPENAI_API_KEY=
GEMINI_API_KEY=
```
Chỉ giữ API key của provider đang dùng. Service-role key và AI keys chỉ ở server; không đặt `NEXT_PUBLIC_` trước secret. Không commit `.env.local`.

## 5. Bắt đầu trong Antigravity IDE
1. Khởi tạo Next.js với TypeScript, App Router và ESLint.
2. Tạo project Supabase và điền environment variables.
3. Làm auth/profile flow tối thiểu.
4. Tạo migration đầu tiên cho profile/goals/preferences.
5. Kiểm tra RLS với hai tài khoản thử nghiệm.
6. Sau đó mới thêm assessment, learning path và AI.
