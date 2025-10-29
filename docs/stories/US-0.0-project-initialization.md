# Story 0.0: 프로젝트 초기화 및 개발 환경 설정

**Story ID**: US-0.0
**Epic**: Epic 0 - 비즈니스 모델 (수익화) - Prerequisites
**Priority**: P0 (최우선) - **BLOCKER**
**Story Points**: 3
**Sprint**: Sprint 0 (프로젝트 셋업)

---

## Status

**Draft**

---

## Story

**As a** Development Team
**I want** 프로젝트 초기 개발 환경과 기본 인프라를 설정하길 원한다
**so that** 모든 개발자가 일관된 환경에서 작업하고, 후속 스토리(US-0.1~)를 구현할 수 있다.

---

## Acceptance Criteria

### AC-1: Next.js 프로젝트 생성 및 의존성 설치
- [ ] Next.js 14+ 프로젝트가 생성되어 있음
- [ ] `package.json`의 모든 의존성이 설치됨 (`npm install` 또는 `npm ci`)
- [ ] `npm run dev` 실행 시 개발 서버가 정상 작동 (http://localhost:3000)
- [ ] TypeScript 5+ 설정 완료 (`tsconfig.json`)

### AC-2: Git 버전 관리 초기화
- [ ] Git 저장소 초기화 (`git init`)
- [ ] `.gitignore` 파일 생성 (Node, Next.js, 환경변수 제외)
- [ ] 초기 커밋 생성 ("Initial commit: Project scaffolding")
- [ ] GitHub 원격 저장소 연결 (선택 사항)

### AC-3: 환경변수 템플릿 생성
- [ ] `.env.local.example` 파일 생성
- [ ] 필수 환경변수 템플릿 포함:
  - `DATABASE_URL`
  - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
  - `CLERK_SECRET_KEY`
  - `NEXT_PUBLIC_TOSS_CLIENT_KEY`
  - `TOSS_SECRET_KEY`
  - `CRON_SECRET`
  - `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`
- [ ] `.env.local`은 `.gitignore`에 포함됨

### AC-4: README.md 초기 작성
- [ ] 프로젝트 이름 및 설명 ("MarketSphere - 전통시장 디지털 마케팅 플랫폼")
- [ ] 기술 스택 목록 (Next.js 14+, TypeScript, Prisma, Clerk 등)
- [ ] 로컬 개발 환경 설정 방법:
  - 의존성 설치 (`npm install`)
  - 환경변수 설정 (`.env.local` 복사)
  - Prisma 마이그레이션 (`npx prisma migrate dev`)
  - 개발 서버 실행 (`npm run dev`)
- [ ] 주요 npm 스크립트 설명

### AC-5: shadcn/ui 초기 설정
- [ ] shadcn/ui 초기화 완료 (`npx shadcn-ui@latest init`)
- [ ] `components.json` 설정 파일 생성됨
- [ ] 기본 컴포넌트 설치:
  - Button
  - Dialog
  - Form
  - Input
  - Label
  - Select
  - Toast
- [ ] `@/components/ui` 폴더 구조 생성됨

### AC-6: 테스트 인프라 설정
- [ ] Unit Test 프레임워크 설치 (Jest 또는 Vitest)
- [ ] E2E Test 프레임워크 설치 (Playwright)
- [ ] 테스트 설정 파일 생성 (`jest.config.js` 또는 `vitest.config.ts`, `playwright.config.ts`)
- [ ] 샘플 테스트 파일 작성 및 통과:
  - Unit Test: `__tests__/sample.test.ts` (간단한 유틸리티 함수 테스트)
  - E2E Test: `e2e/home.spec.ts` (홈페이지 접속 테스트)
- [ ] `package.json` 스크립트 추가:
  - `"test": "jest"` 또는 `"test": "vitest"`
  - `"test:e2e": "playwright test"`

### AC-7: Prisma 초기 설정 확인
- [ ] `prisma/schema.prisma` 파일 존재 확인 (이미 정의됨)
- [ ] Prisma Client 생성 (`npx prisma generate`)
- [ ] `lib/prisma.ts` 유틸리티 파일 생성 (Prisma Client 싱글톤)

---

## Tasks / Subtasks

### Task 1: 프로젝트 스캐폴딩 검증 및 의존성 설치 (AC: 1)
- [ ] 프로젝트 루트에 `package.json` 존재 확인
- [ ] Node.js 버전 확인 (v20+ 권장)
- [ ] `npm install` 실행하여 모든 의존성 설치
- [ ] `npm run dev` 실행하여 Next.js 개발 서버 정상 작동 확인
- [ ] http://localhost:3000 접속하여 기본 페이지 확인
- [ ] TypeScript 컴파일 에러 없는지 확인 (`npm run build`)

### Task 2: Git 초기화 및 .gitignore 설정 (AC: 2)
- [ ] `git init` 실행 (이미 초기화되어 있으면 스킵)
- [ ] `.gitignore` 파일 생성 또는 확인:
  ```
  # dependencies
  /node_modules
  /.pnp
  .pnp.js

  # testing
  /coverage

  # next.js
  /.next/
  /out/

  # production
  /build

  # misc
  .DS_Store
  *.pem

  # debug
  npm-debug.log*
  yarn-debug.log*
  yarn-error.log*

  # local env files
  .env*.local
  .env.local
  .env.development.local
  .env.test.local
  .env.production.local

  # vercel
  .vercel

  # typescript
  *.tsbuildinfo
  next-env.d.ts
  ```
- [ ] 초기 커밋 생성: `git add .` → `git commit -m "Initial commit: Project scaffolding"`

### Task 3: 환경변수 템플릿 생성 (AC: 3)
- [ ] `.env.local.example` 파일 생성:
  ```bash
  # Database
  DATABASE_URL="postgresql://user:password@localhost:5432/marketsphere"

  # Clerk Authentication
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
  CLERK_SECRET_KEY="sk_test_..."

  # Toss Payments
  NEXT_PUBLIC_TOSS_CLIENT_KEY="test_ck_..."
  TOSS_SECRET_KEY="test_sk_..."
  NEXT_PUBLIC_TOSS_SUCCESS_URL="http://localhost:3000/payment/success"
  NEXT_PUBLIC_TOSS_FAIL_URL="http://localhost:3000/payment/fail"

  # Cron Job Security
  CRON_SECRET="your-random-secret-key"

  # Firebase Cloud Messaging (FCM)
  FIREBASE_PROJECT_ID="your-project-id"
  FIREBASE_CLIENT_EMAIL="firebase-adminsdk@...iam.gserviceaccount.com"
  FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

  # OpenAI API (AI 콘텐츠 생성)
  OPENAI_API_KEY="sk-..."
  ```
- [ ] `.gitignore`에 `.env.local`, `.env*.local` 포함 확인

### Task 4: README.md 초기 작성 (AC: 4)
- [ ] `README.md` 파일 생성 또는 업데이트:
  ```markdown
  # MarketSphere

  전통시장 소상공인을 위한 AI 기반 디지털 마케팅 플랫폼

  ## 🚀 기술 스택

  - **Frontend**: Next.js 14+ (App Router), TypeScript 5+, Tailwind CSS 3+, shadcn/ui
  - **Backend**: Next.js 14+ API Routes, Server Actions
  - **Database**: PostgreSQL 15+ (Cloud SQL), Prisma ORM
  - **Authentication**: Clerk
  - **Payment**: Toss Payments (구독 결제)
  - **AI**: OpenAI API (GPT-4, Vision)
  - **Push Notifications**: Firebase Cloud Messaging (FCM)

  ## 📦 로컬 개발 환경 설정

  ### 1. 의존성 설치
  \`\`\`bash
  npm install
  \`\`\`

  ### 2. 환경변수 설정
  \`\`\`bash
  cp .env.local.example .env.local
  # .env.local 파일을 열어 실제 값으로 수정
  \`\`\`

  ### 3. Prisma 마이그레이션
  \`\`\`bash
  npx prisma generate
  npx prisma migrate dev
  \`\`\`

  ### 4. 개발 서버 실행
  \`\`\`bash
  npm run dev
  \`\`\`

  http://localhost:3000 으로 접속

  ## 🧪 테스트 실행

  ### Unit Tests
  \`\`\`bash
  npm run test
  \`\`\`

  ### E2E Tests
  \`\`\`bash
  npm run test:e2e
  \`\`\`

  ## 📝 주요 npm 스크립트

  - `npm run dev`: 개발 서버 실행
  - `npm run build`: 프로덕션 빌드
  - `npm run start`: 프로덕션 서버 실행
  - `npm run lint`: ESLint 실행
  - `npm run test`: 단위 테스트 실행
  - `npm run test:e2e`: E2E 테스트 실행
  - `npm run prisma:generate`: Prisma Client 생성
  - `npm run prisma:migrate`: Prisma 마이그레이션 실행
  - `npm run prisma:studio`: Prisma Studio (DB GUI) 실행

  ## 📚 문서

  - [PRD](./docs/prd.md)
  - [Tech Stack](./docs/tech-stack.md)
  - [Architecture](./docs/architecture.md)
  - [User Stories](./docs/stories/)

  ## 🤝 기여 가이드

  1. 브랜치 생성: `git checkout -b feature/US-X.X-feature-name`
  2. 커밋: `git commit -m "feat: Add feature"`
  3. 푸시: `git push origin feature/US-X.X-feature-name`
  4. Pull Request 생성

  ## 📄 라이선스

  Private - All Rights Reserved
  ```

### Task 5: shadcn/ui 초기 설정 (AC: 5)
- [ ] shadcn/ui 초기화 실행:
  ```bash
  npx shadcn-ui@latest init
  ```
  - Style: Default
  - Base color: Slate
  - CSS variables: Yes
  - React Server Components: Yes
  - TypeScript: Yes
- [ ] `components.json` 파일 생성 확인 (이미 존재)
- [ ] 기본 컴포넌트 설치:
  ```bash
  npx shadcn-ui@latest add button
  npx shadcn-ui@latest add dialog
  npx shadcn-ui@latest add form
  npx shadcn-ui@latest add input
  npx shadcn-ui@latest add label
  npx shadcn-ui@latest add select
  npx shadcn-ui@latest add toast
  ```
- [ ] `components/ui/` 폴더 생성 확인
- [ ] 샘플 페이지에서 Button 컴포넌트 import 테스트

### Task 6: 테스트 인프라 설정 (AC: 6)
- [ ] **Unit Test 프레임워크 선택 및 설치**: Vitest (권장, Next.js 14+ 호환)
  ```bash
  npm install -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom
  ```
- [ ] `vitest.config.ts` 생성:
  ```typescript
  import { defineConfig } from 'vitest/config'
  import react from '@vitejs/plugin-react'
  import path from 'path'

  export default defineConfig({
    plugins: [react()],
    test: {
      environment: 'jsdom',
      setupFiles: ['./vitest.setup.ts'],
      globals: true,
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './'),
      },
    },
  })
  ```
- [ ] `vitest.setup.ts` 생성:
  ```typescript
  import '@testing-library/jest-dom'
  ```
- [ ] 샘플 Unit Test 작성: `__tests__/lib/utils.test.ts`
  ```typescript
  import { describe, it, expect } from 'vitest'

  describe('Sample Utils Test', () => {
    it('should pass a basic test', () => {
      expect(1 + 1).toBe(2)
    })
  })
  ```
- [ ] **E2E Test 프레임워크 설치**: Playwright
  ```bash
  npm install -D @playwright/test
  npx playwright install
  ```
- [ ] `playwright.config.ts` 생성:
  ```typescript
  import { defineConfig, devices } from '@playwright/test'

  export default defineConfig({
    testDir: './e2e',
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: process.env.CI ? 1 : undefined,
    reporter: 'html',
    use: {
      baseURL: 'http://localhost:3000',
      trace: 'on-first-retry',
    },
    projects: [
      {
        name: 'chromium',
        use: { ...devices['Desktop Chrome'] },
      },
    ],
    webServer: {
      command: 'npm run dev',
      url: 'http://localhost:3000',
      reuseExistingServer: !process.env.CI,
    },
  })
  ```
- [ ] 샘플 E2E Test 작성: `e2e/home.spec.ts`
  ```typescript
  import { test, expect } from '@playwright/test'

  test('should load the home page', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/MarketSphere/)
  })
  ```
- [ ] `package.json` 스크립트 추가:
  ```json
  {
    "scripts": {
      "test": "vitest",
      "test:e2e": "playwright test"
    }
  }
  ```
- [ ] 테스트 실행 확인:
  ```bash
  npm run test
  npm run test:e2e
  ```

### Task 7: Prisma 초기 설정 확인 (AC: 7)
- [ ] `prisma/schema.prisma` 파일 존재 확인 (이미 정의됨)
- [ ] Prisma Client 생성:
  ```bash
  npx prisma generate
  ```
- [ ] `lib/prisma.ts` 파일 생성 (Prisma Client 싱글톤):
  ```typescript
  import { PrismaClient } from '@prisma/client'

  const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined
  }

  export const prisma =
    globalForPrisma.prisma ??
    new PrismaClient({
      log: ['query', 'error', 'warn'],
    })

  if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
  ```
- [ ] 다른 파일에서 `import { prisma } from '@/lib/prisma'` 사용 가능 확인

---

## Dev Notes

### Tech Stack Context
[Source: package.json, tech-stack.md, components.json]

**프로젝트 기본 정보**:
- **프로젝트 명**: marketsphere
- **버전**: 1.0.0
- **Node.js**: v20+ 권장
- **Package Manager**: npm (package-lock.json 사용)

**핵심 의존성**:
- Next.js: `^14.2.0`
- React: `^18.3.0`
- TypeScript: `^5.4.0`
- Prisma: `^5.12.0`
- Clerk (Auth): `^5.0.0`
- Toss Payments: `^0.10.0`
- OpenAI: `^4.29.0`
- LangChain: `^0.1.30`

**UI 라이브러리**:
- Tailwind CSS: `^3.4.0`
- shadcn/ui: Radix UI 기반 컴포넌트
- lucide-react: `^0.363.0` (아이콘)

**폼 처리**:
- React Hook Form: `^7.51.0`
- Zod: `^3.22.4` (스키마 검증)

**상태 관리**:
- TanStack Query: `^5.28.0` (React Query)

### Project Structure
[Source: components.json, existing file structure]

**파일 구조**:
```
marketsphere/
├── app/                      # Next.js 14 App Router
│   ├── (auth)/               # 인증 관련 페이지
│   │   ├── sign-in/
│   │   └── sign-up/
│   ├── api/                  # API Routes
│   │   ├── cron/
│   │   └── webhooks/
│   ├── actions/              # Server Actions
│   ├── layout.tsx            # Root Layout
│   ├── page.tsx              # Home Page
│   └── globals.css           # Global CSS
├── components/               # React Components
│   └── ui/                   # shadcn/ui components (자동 생성)
├── lib/                      # Utility functions
│   ├── prisma.ts             # Prisma Client 싱글톤
│   ├── toss.ts               # Toss Payments 유틸리티
│   └── utils.ts              # shadcn/ui 유틸리티
├── prisma/                   # Prisma 설정
│   ├── schema.prisma         # 데이터베이스 스키마
│   └── seed.ts               # 시드 데이터
├── public/                   # 정적 파일
├── docs/                     # 프로젝트 문서
│   ├── prd.md
│   ├── tech-stack.md
│   └── stories/              # User Stories
├── __tests__/                # Unit Tests (Vitest)
├── e2e/                      # E2E Tests (Playwright)
├── .env.local.example        # 환경변수 템플릿
├── .gitignore                # Git 제외 파일
├── components.json           # shadcn/ui 설정
├── package.json              # 의존성 정의
├── tsconfig.json             # TypeScript 설정
├── tailwind.config.ts        # Tailwind CSS 설정
├── vitest.config.ts          # Vitest 설정
├── playwright.config.ts      # Playwright 설정
└── README.md                 # 프로젝트 README
```

**Path Aliases** (tsconfig.json):
- `@/` → 프로젝트 루트
- `@/components` → `./components`
- `@/lib` → `./lib`
- `@/app` → `./app`

### Testing Standards
[Source: PO Checklist Recommendations]

**테스트 전략**:

**Unit Tests (Vitest)**:
- **위치**: `__tests__/` 폴더
- **파일명 패턴**: `*.test.ts` 또는 `*.test.tsx`
- **프레임워크**: Vitest (Next.js 14+ 호환)
- **라이브러리**: @testing-library/react, @testing-library/jest-dom
- **실행 명령어**: `npm run test`
- **커버리지 목표**: 80% 이상 (US DoD 기준)

**E2E Tests (Playwright)**:
- **위치**: `e2e/` 폴더
- **파일명 패턴**: `*.spec.ts`
- **프레임워크**: Playwright
- **브라우저**: Chromium (기본)
- **실행 명령어**: `npm run test:e2e`
- **테스트 대상**: 주요 사용자 플로우 (가입, 결제, 상점 생성 등)

**Integration Tests**:
- API Routes 및 Server Actions 테스트
- Supertest 또는 Vitest 사용
- 위치: `__tests__/api/` 또는 `__tests__/integration/`

**테스트 원칙**:
1. 모든 새로운 기능은 테스트 포함 필수
2. PR 머지 전 모든 테스트 통과 필수 (CI/CD에서 자동 실행)
3. 테스트 실패 시 배포 차단
4. E2E 테스트는 주요 사용자 플로우만 커버 (속도 vs 커버리지 밸런스)

### Environment Variables
[Source: tech-stack.md, toss-payments-setup-guide.md, clerk-setup-guide.md]

**필수 환경변수**:

**Database**:
- `DATABASE_URL`: PostgreSQL 연결 문자열 (Cloud SQL)

**Clerk (Authentication)**:
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`: 공개 키 (클라이언트)
- `CLERK_SECRET_KEY`: 비밀 키 (서버)

**Toss Payments**:
- `NEXT_PUBLIC_TOSS_CLIENT_KEY`: 공개 클라이언트 키
- `TOSS_SECRET_KEY`: 비밀 시크릿 키
- `NEXT_PUBLIC_TOSS_SUCCESS_URL`: 결제 성공 리다이렉트 URL
- `NEXT_PUBLIC_TOSS_FAIL_URL`: 결제 실패 리다이렉트 URL

**Cron Job**:
- `CRON_SECRET`: Cron Job Authorization Bearer 토큰 (랜덤 문자열)

**Firebase (Push Notifications)**:
- `FIREBASE_PROJECT_ID`: Firebase 프로젝트 ID
- `FIREBASE_CLIENT_EMAIL`: Firebase Admin SDK 이메일
- `FIREBASE_PRIVATE_KEY`: Firebase Private Key (PEM 형식)

**OpenAI (AI 기능)**:
- `OPENAI_API_KEY`: OpenAI API 키 (GPT-4, Vision)

**보안 주의사항**:
- **절대 금지**: `.env.local` 파일을 Git에 커밋하지 말 것
- **Secret Manager**: GCP Secret Manager 사용 (프로덕션)
- **클라이언트 노출**: `NEXT_PUBLIC_*` 접두사만 클라이언트에 노출됨
- **키 순환**: 정기적으로 API 키 교체 (3개월마다 권장)

### Git Workflow
[Source: README.md recommendation]

**브랜치 전략**:
- `main`: 프로덕션 브랜치 (보호됨)
- `dev`: 개발 브랜치
- `feature/US-X.X-feature-name`: 기능 브랜치 (각 User Story별)

**커밋 메시지 컨벤션** (Conventional Commits):
- `feat: Add feature` - 새 기능
- `fix: Fix bug` - 버그 수정
- `docs: Update documentation` - 문서 수정
- `style: Format code` - 코드 스타일 (기능 변경 없음)
- `refactor: Refactor code` - 리팩토링
- `test: Add tests` - 테스트 추가
- `chore: Update dependencies` - 기타 작업 (빌드, 의존성 등)

**PR 프로세스**:
1. 기능 브랜치 생성: `git checkout -b feature/US-0.0-project-init`
2. 작업 후 커밋: `git commit -m "feat: Initialize project with test infrastructure"`
3. 푸시: `git push origin feature/US-0.0-project-init`
4. GitHub에서 Pull Request 생성
5. 코드 리뷰 및 CI 통과 후 머지

### Dependencies Installation Notes
[Source: package.json]

**설치 명령어**:
- `npm install`: 새로운 의존성 추가 시 사용 (package-lock.json 업데이트)
- `npm ci`: CI/CD 또는 클린 인스톨 시 사용 (package-lock.json 기준, 속도 빠름)

**주의사항**:
- **Node.js 버전**: v20 이상 필수 (Prisma, Next.js 14 호환성)
- **npm 버전**: npm v9 이상 권장
- **M1/M2 Mac**: Rosetta 없이 네이티브 ARM 지원됨
- **Windows**: WSL2 권장 (일부 패키지 호환성 문제)

**설치 시간 예상**:
- 첫 설치: 약 3-5분 (네트워크 속도에 따라 다름)
- `npm ci`: 약 1-2분

### shadcn/ui Setup
[Source: components.json, tech-stack.md]

**설정 정보**:
- **Style**: default
- **Base Color**: slate
- **CSS Variables**: Yes (다크 모드 지원)
- **RSC**: Yes (React Server Components 사용)
- **TypeScript**: Yes
- **Tailwind Config**: `tailwind.config.ts`
- **Global CSS**: `app/globals.css`

**컴포넌트 설치 위치**:
- `components/ui/` - 자동 생성됨
- 예: `components/ui/button.tsx`

**사용 예시**:
```tsx
import { Button } from '@/components/ui/button'

export default function Page() {
  return <Button>Click me</Button>
}
```

**추가 컴포넌트 설치 방법**:
```bash
npx shadcn-ui@latest add [component-name]
```

**컴포넌트 커스터마이징**:
- `components/ui/` 내 파일 직접 수정 가능
- Tailwind CSS 클래스로 스타일링
- `tailwind.config.ts`에서 전역 테마 수정

### Previous Story Insights
[Source: N/A - First Story]

**이 스토리는 프로젝트 첫 번째 스토리입니다.**

이전 스토리가 없으므로, 다음 스토리(US-0.1)에서 참고할 교훈:
- 환경변수 `.env.local`을 절대 커밋하지 말 것
- 테스트가 통과해야 PR 머지 가능
- `npm run build` 성공 확인 후 커밋
- Prisma 마이그레이션은 `npx prisma migrate dev` 사용 (자동으로 Client 생성)

---

## Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2025-10-29 | 1.0 | Initial story creation for project initialization | Bob (Scrum Master) |

---

## Dev Agent Record

*(이 섹션은 개발 에이전트가 구현 중 작성합니다)*

### Agent Model Used

*(개발 에이전트가 기록)*

### Debug Log References

*(개발 에이전트가 기록)*

### Completion Notes List

*(개발 에이전트가 기록)*

### File List

*(개발 에이전트가 기록)*

---

## QA Results

*(이 섹션은 QA 에이전트가 검증 후 작성합니다)*
