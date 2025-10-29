# Story 0.0.5: 품질 보증 인프라 구축

**Story ID**: US-0.0.5
**Epic**: Epic 0 - 비즈니스 모델 (수익화) - Prerequisites
**Priority**: P1 (높음)
**Story Points**: 5
**Sprint**: Sprint 0 (프로젝트 셋업)
**Dependencies**: US-0.0 완료 필수

---

## Status

**Draft**

---

## Story

**As a** Development Team
**I want** 코드 품질 보증을 위한 추가 도구와 프로세스를 설정하길 원한다
**so that** 코드 품질을 자동으로 검증하고, PR 단계에서 문제를 조기 발견할 수 있다.

---

## Acceptance Criteria

### AC-1: 코드 품질 도구 설정 (ESLint + Prettier)
- [ ] ESLint 설정 파일 (`.eslintrc.json`) 생성
- [ ] Prettier 설정 파일 (`.prettierrc`) 생성
- [ ] ESLint + Prettier 통합 (충돌 방지)
- [ ] `package.json` 스크립트 추가:
  - `"lint": "next lint"`
  - `"lint:fix": "next lint --fix"`
  - `"format": "prettier --write ."`
  - `"format:check": "prettier --check ."`
- [ ] 샘플 파일에서 `npm run lint` 및 `npm run format` 실행 성공

### AC-2: Pre-commit Hook 설정 (Husky + lint-staged)
- [ ] Husky 설치 및 초기화 (`npx husky-init`)
- [ ] lint-staged 설치 및 설정
- [ ] Pre-commit Hook 설정:
  - Staged 파일에 ESLint 자동 실행
  - Staged 파일에 Prettier 자동 실행
  - TypeScript 타입 체크
- [ ] 테스트 커밋으로 Hook 작동 확인

### AC-3: 테스트 커버리지 리포팅
- [ ] Vitest 커버리지 플러그인 설치 (`@vitest/coverage-v8`)
- [ ] `vitest.config.ts`에 커버리지 설정 추가:
  - 커버리지 임계값: 80%
  - 리포트 형식: HTML, JSON, LCOV
- [ ] `package.json` 스크립트 추가:
  - `"test:coverage": "vitest --coverage"`
- [ ] 커버리지 리포트 생성 확인 (`coverage/` 폴더)
- [ ] `.gitignore`에 `coverage/` 추가

### AC-4: 에러 추적 설정 (Sentry - 선택)
- [ ] Sentry 계정 생성 (또는 기존 계정 사용)
- [ ] `@sentry/nextjs` 패키지 설치
- [ ] `sentry.client.config.ts`, `sentry.server.config.ts` 생성
- [ ] 환경변수 추가: `NEXT_PUBLIC_SENTRY_DSN`
- [ ] 테스트 에러 발생 및 Sentry에서 확인

### AC-5: API 테스트 도구 설정
- [ ] Supertest 설치 (`supertest`, `@types/supertest`)
- [ ] 샘플 API Route 테스트 작성: `__tests__/api/health.test.ts`
- [ ] 테스트 실행 성공 (`npm run test`)

### AC-6: Visual Regression Testing (선택적)
- [ ] Playwright Visual Comparison 설정
- [ ] 샘플 스크린샷 테스트 작성: `e2e/visual/homepage.spec.ts`
- [ ] 베이스라인 스크린샷 생성
- [ ] Visual Diff 테스트 실행 성공

---

## Tasks / Subtasks

### Task 1: ESLint + Prettier 설정 (AC: 1)
- [ ] ESLint 설정 파일 생성: `.eslintrc.json`
  ```json
  {
    "extends": [
      "next/core-web-vitals",
      "prettier"
    ],
    "rules": {
      "@typescript-eslint/no-unused-vars": "warn",
      "@typescript-eslint/no-explicit-any": "warn",
      "react-hooks/exhaustive-deps": "warn"
    }
  }
  ```
- [ ] Prettier 설정 파일 생성: `.prettierrc`
  ```json
  {
    "semi": false,
    "singleQuote": true,
    "trailingComma": "es5",
    "printWidth": 100,
    "tabWidth": 2,
    "arrowParens": "always"
  }
  ```
- [ ] `.prettierignore` 생성:
  ```
  node_modules
  .next
  out
  coverage
  public
  ```
- [ ] ESLint + Prettier 통합 패키지 설치:
  ```bash
  npm install -D eslint-config-prettier
  ```
- [ ] `package.json` 스크립트 추가
- [ ] 샘플 파일에서 실행 테스트

### Task 2: Husky + lint-staged 설정 (AC: 2)
- [ ] Husky 설치 및 초기화:
  ```bash
  npm install -D husky
  npx husky-init && npm install
  ```
- [ ] lint-staged 설치:
  ```bash
  npm install -D lint-staged
  ```
- [ ] `package.json`에 lint-staged 설정 추가:
  ```json
  {
    "lint-staged": {
      "*.{ts,tsx}": [
        "eslint --fix",
        "prettier --write"
      ],
      "*.{json,md}": [
        "prettier --write"
      ]
    }
  }
  ```
- [ ] `.husky/pre-commit` 수정:
  ```bash
  #!/usr/bin/env sh
  . "$(dirname -- "$0")/_/husky.sh"

  npx lint-staged
  npm run build
  ```
- [ ] 테스트 커밋으로 Hook 작동 확인:
  ```bash
  git add .
  git commit -m "test: Verify pre-commit hook"
  ```

### Task 3: 테스트 커버리지 리포팅 (AC: 3)
- [ ] Vitest 커버리지 플러그인 설치:
  ```bash
  npm install -D @vitest/coverage-v8
  ```
- [ ] `vitest.config.ts` 업데이트:
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
      coverage: {
        provider: 'v8',
        reporter: ['text', 'json', 'html', 'lcov'],
        all: true,
        include: ['lib/**/*.ts', 'app/**/*.ts', 'components/**/*.tsx'],
        exclude: [
          'node_modules/',
          '__tests__/',
          'e2e/',
          '*.config.ts',
          '.next/',
        ],
        thresholds: {
          lines: 80,
          functions: 80,
          branches: 80,
          statements: 80,
        },
      },
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './'),
      },
    },
  })
  ```
- [ ] `package.json` 스크립트 추가:
  ```json
  {
    "scripts": {
      "test:coverage": "vitest --coverage"
    }
  }
  ```
- [ ] 커버리지 리포트 생성:
  ```bash
  npm run test:coverage
  ```
- [ ] `coverage/` 폴더 생성 확인
- [ ] `.gitignore`에 `coverage/` 추가

### Task 4: Sentry 설정 (AC: 4 - 선택)
- [ ] Sentry 계정 생성: https://sentry.io/signup/
- [ ] Next.js 프로젝트 생성 (Sentry 대시보드)
- [ ] Sentry Wizard 실행:
  ```bash
  npx @sentry/wizard@latest -i nextjs
  ```
- [ ] 환경변수 추가 (`.env.local.example`):
  ```
  NEXT_PUBLIC_SENTRY_DSN="https://...@....ingest.sentry.io/..."
  SENTRY_AUTH_TOKEN="sntrys_..."
  ```
- [ ] `sentry.client.config.ts` 생성 (Wizard 자동 생성)
- [ ] `sentry.server.config.ts` 생성 (Wizard 자동 생성)
- [ ] 테스트 에러 발생 (샘플 버튼 클릭 → throw Error):
  ```tsx
  // app/page.tsx
  <button onClick={() => { throw new Error('Sentry Test Error') }}>
    Test Sentry
  </button>
  ```
- [ ] Sentry 대시보드에서 에러 확인

### Task 5: API 테스트 도구 설정 (AC: 5)
- [ ] Supertest 설치:
  ```bash
  npm install -D supertest @types/supertest
  ```
- [ ] Health Check API Route 생성: `app/api/health/route.ts`
  ```typescript
  import { NextResponse } from 'next/server'

  export async function GET() {
    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
    })
  }
  ```
- [ ] API 테스트 작성: `__tests__/api/health.test.ts`
  ```typescript
  import { describe, it, expect } from 'vitest'
  import { GET } from '@/app/api/health/route'

  describe('GET /api/health', () => {
    it('should return status ok', async () => {
      const response = await GET()
      const json = await response.json()

      expect(response.status).toBe(200)
      expect(json.status).toBe('ok')
      expect(json.timestamp).toBeDefined()
    })
  })
  ```
- [ ] 테스트 실행:
  ```bash
  npm run test
  ```

### Task 6: Visual Regression Testing (AC: 6 - 선택)
- [ ] Playwright Visual Comparison 설정 (`playwright.config.ts`에 이미 포함)
- [ ] Visual 테스트 작성: `e2e/visual/homepage.spec.ts`
  ```typescript
  import { test, expect } from '@playwright/test'

  test('homepage visual regression', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveScreenshot('homepage.png')
  })
  ```
- [ ] 베이스라인 스크린샷 생성:
  ```bash
  npm run test:e2e -- --update-snapshots
  ```
- [ ] Visual Diff 테스트 실행:
  ```bash
  npm run test:e2e
  ```

---

## Dev Notes

### Previous Story Context
[Source: US-0.0]

**US-0.0에서 이미 완료된 항목**:
- ✅ Vitest (Unit Test 프레임워크)
- ✅ Playwright (E2E Test 프레임워크)
- ✅ 샘플 테스트 작성

**US-0.0.5에서 추가되는 항목**:
- 코드 품질 도구 (ESLint + Prettier)
- Pre-commit Hook (Husky + lint-staged)
- 테스트 커버리지 리포팅
- 에러 추적 (Sentry)
- API 테스트 도구 (Supertest)
- Visual Regression Testing (Playwright)

### Tech Stack
[Source: package.json, tech-stack.md]

**추가 의존성**:
- `eslint-config-prettier`: ESLint + Prettier 통합
- `husky`: Git Hooks 관리
- `lint-staged`: Staged 파일만 Lint
- `@vitest/coverage-v8`: Vitest 커버리지 리포트
- `@sentry/nextjs`: Next.js용 Sentry SDK
- `supertest`: HTTP API 테스트
- `@types/supertest`: Supertest TypeScript 타입

### Quality Assurance Philosophy
[Source: PO Checklist, DoD Requirements]

**품질 목표**:
1. **자동화**: 수동 검증 최소화 (Pre-commit Hook)
2. **조기 발견**: PR 단계에서 문제 발견 (CI/CD 통합)
3. **측정 가능**: 커버리지 80% 이상 유지
4. **모니터링**: 프로덕션 에러 실시간 추적 (Sentry)

**DoD 연계**:
- 모든 US DoD에 "단위 테스트 커버리지 80% 이상" 명시
- PR 머지 전 모든 테스트 통과 필수
- ESLint 에러 0개 (Warning은 허용)

### Git Hooks Strategy
[Source: README.md recommendation]

**Pre-commit Hook** (코드 품질):
- ESLint 자동 실행 (에러 시 커밋 차단)
- Prettier 자동 포맷팅
- TypeScript 타입 체크

**Pre-push Hook** (향후 추가 - US-0.0.6):
- 전체 테스트 실행 (`npm run test`)
- 빌드 검증 (`npm run build`)

**Hook 우회** (긴급 상황만):
```bash
git commit --no-verify -m "Emergency fix"
```

### Testing Standards
[Source: US-0.0, PO Checklist]

**커버리지 임계값**:
- Lines: 80%
- Functions: 80%
- Branches: 80%
- Statements: 80%

**커버리지 대상**:
- ✅ Include: `lib/`, `app/`, `components/`
- ❌ Exclude: `node_modules/`, `__tests__/`, `e2e/`, `*.config.ts`, `.next/`

**리포트 형식**:
- `text`: 터미널 출력
- `json`: CI/CD 통합용
- `html`: 브라우저 시각화 (`coverage/index.html`)
- `lcov`: 외부 도구 통합 (Codecov, Coveralls)

### Sentry Configuration
[Source: Tech Stack, External Service Requirements]

**Sentry DSN 획득**:
1. https://sentry.io/signup/ 에서 계정 생성
2. 프로젝트 생성 (Next.js 선택)
3. DSN 복사 (Settings > Projects > Client Keys)

**환경별 설정**:
- **Development**: `console.log` 위주 (Sentry 전송 X)
- **Staging**: Sentry에 모든 에러 전송
- **Production**: Sentry에 에러 전송 + 샘플링 (10%)

**Privacy 고려사항**:
- 사용자 이메일, 전화번호 등 PII (개인 식별 정보) 필터링
- `beforeSend` Hook으로 민감 데이터 제거

### API Testing Strategy
[Source: Testing Standards]

**Supertest vs Integration Test**:
- **Supertest**: Next.js API Routes 직접 테스트 (빠름)
- **Integration Test**: 전체 HTTP 서버 테스트 (느림, 더 현실적)

**권장 접근법**:
- Unit Test: 비즈니스 로직 (lib/, utils/)
- API Test (Supertest): API Routes 단독 테스트
- E2E Test (Playwright): 전체 사용자 플로우

**API 테스트 예시**:
```typescript
// __tests__/api/subscription.test.ts
import { POST } from '@/app/api/subscription/route'

describe('POST /api/subscription', () => {
  it('should create subscription with valid input', async () => {
    const request = new Request('http://localhost:3000/api/subscription', {
      method: 'POST',
      body: JSON.stringify({ plan: 'BASIC' }),
    })

    const response = await POST(request)
    const json = await response.json()

    expect(response.status).toBe(200)
    expect(json.success).toBe(true)
  })
})
```

---

## Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2025-10-29 | 1.0 | Initial story creation for quality assurance infrastructure | Bob (Scrum Master) |

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
