# Story 0.0.6: CI/CD 파이프라인 구축

**Story ID**: US-0.0.6
**Epic**: Epic 0 - 비즈니스 모델 (수익화) - Prerequisites
**Priority**: P1 (높음)
**Story Points**: 8
**Sprint**: Sprint 0 (프로젝트 셋업)
**Dependencies**: US-0.0, US-0.0.5 완료 필수

---

## Status

**Draft**

---

## Story

**As a** Development Team
**I want** CI/CD 파이프라인을 구축하여 자동화된 테스트와 배포를 수행하길 원한다
**so that** 코드 품질을 보장하고, 프로덕션 배포를 안전하고 빠르게 수행할 수 있다.

---

## Acceptance Criteria

### AC-1: Pre-push Hook 설정

- [ ] Husky pre-push hook 추가
- [ ] 전체 테스트 스위트 실행 (`npm run test`)
- [ ] 프로덕션 빌드 검증 (`npm run build`)
- [ ] TypeScript 타입 체크 (`tsc --noEmit`)
- [ ] Hook 실패 시 push 차단

### AC-2: GitHub Actions CI 워크플로우

- [ ] `.github/workflows/ci.yml` 생성
- [ ] 트리거: Pull Request (모든 브랜치 → main/develop)
- [ ] 작업:
  - [ ] Node.js 환경 설정 (v20.x)
  - [ ] 의존성 설치 (`npm ci`)
  - [ ] Lint 검증 (`npm run lint`)
  - [ ] TypeScript 타입 체크
  - [ ] 단위 테스트 실행 (`npm run test`)
  - [ ] E2E 테스트 실행 (`npm run test:e2e`)
  - [ ] 테스트 커버리지 업로드 (Codecov)
  - [ ] 빌드 검증 (`npm run build`)
- [ ] 모든 작업 통과 시 PR 머지 허용

### AC-3: GitHub Actions CD 워크플로우 (GCP 배포)

- [ ] `.github/workflows/deploy.yml` 생성
- [ ] 트리거: Push to `main` 브랜치
- [ ] 작업:
  - [ ] GCP 인증 (Workload Identity Federation)
  - [ ] Docker 이미지 빌드
  - [ ] 이미지 Artifact Registry에 푸시
  - [ ] Cloud SQL 마이그레이션 실행 (`npx prisma migrate deploy`)
  - [ ] Cloud Run 배포 (Zero-downtime)
  - [ ] 헬스 체크 (`/api/health`)
  - [ ] 배포 실패 시 롤백
- [ ] 배포 성공 시 Slack 알림

### AC-4: 환경별 배포 전략

- [ ] **Development**: `develop` 브랜치 → GCP Dev 환경 자동 배포
- [ ] **Staging**: `staging` 브랜치 → GCP Staging 환경 자동 배포
- [ ] **Production**: `main` 브랜치 → GCP Production 환경 자동 배포
- [ ] 각 환경별 환경 변수 분리 (GitHub Secrets)

### AC-5: Pull Request 품질 게이트

- [ ] PR 템플릿 생성 (`.github/pull_request_template.md`)
- [ ] 필수 체크리스트:
  - [ ] 관련 Story/Task 번호 명시
  - [ ] 변경 사항 요약
  - [ ] 테스트 커버리지 80% 이상 유지
  - [ ] Breaking Changes 여부
  - [ ] 스크린샷 (UI 변경 시)
- [ ] 필수 리뷰어: 최소 1명 승인
- [ ] CI 통과 필수

### AC-6: 배포 모니터링 및 알림

- [ ] GitHub Actions 실패 시 Slack 알림
- [ ] Cloud Run 배포 완료 시 Slack 알림
- [ ] 배포 이력 추적 (Release Tags)

---

## Tasks / Subtasks

### Task 1: Pre-push Hook 설정 (AC: 1)

- [ ] `.husky/pre-push` 파일 생성:

  ```bash
  #!/usr/bin/env sh
  . "$(dirname -- "$0")/_/husky.sh"

  echo "🔍 Running pre-push checks..."

  echo "📝 Type checking..."
  npm run type-check || exit 1

  echo "🧪 Running tests..."
  npm run test || exit 1

  echo "🏗️  Building project..."
  npm run build || exit 1

  echo "✅ Pre-push checks passed!"
  ```

- [ ] `package.json`에 스크립트 추가:
  ```json
  {
    "scripts": {
      "type-check": "tsc --noEmit"
    }
  }
  ```
- [ ] 테스트 커밋으로 Hook 작동 확인:
  ```bash
  git add .
  git commit -m "test: Verify pre-push hook"
  git push origin feature/test-push-hook
  ```

### Task 2: GitHub Actions CI 워크플로우 (AC: 2)

- [ ] `.github/workflows/ci.yml` 생성:

  ```yaml
  name: CI

  on:
    pull_request:
      branches: [main, develop, staging]

  jobs:
    test:
      runs-on: ubuntu-latest

      strategy:
        matrix:
          node-version: [20.x]

      steps:
        - name: Checkout code
          uses: actions/checkout@v4

        - name: Setup Node.js
          uses: actions/setup-node@v4
          with:
            node-version: ${{ matrix.node-version }}
            cache: 'npm'

        - name: Install dependencies
          run: npm ci

        - name: Lint
          run: npm run lint

        - name: Type check
          run: npm run type-check

        - name: Run unit tests
          run: npm run test

        - name: Run E2E tests
          run: npm run test:e2e

        - name: Upload coverage
          uses: codecov/codecov-action@v4
          with:
            files: ./coverage/lcov.info
            fail_ci_if_error: false

        - name: Build
          run: npm run build
          env:
            DATABASE_URL: postgresql://test:test@localhost:5432/test
            NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: ${{ secrets.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY }}
  ```

- [ ] GitHub Repository Settings → Branches → Branch Protection Rules:
  - [ ] Require status checks to pass before merging
  - [ ] Require branches to be up to date before merging

### Task 3: GCP 배포 워크플로우 (AC: 3)

- [ ] GCP 프로젝트 설정:

  ```bash
  # GCP 프로젝트 생성
  gcloud projects create marketsphere-prod --name="MarketSphere Production"
  gcloud config set project marketsphere-prod

  # API 활성화
  gcloud services enable run.googleapis.com
  gcloud services enable cloudbuild.googleapis.com
  gcloud services enable artifactregistry.googleapis.com
  gcloud services enable sqladmin.googleapis.com
  ```

- [ ] Workload Identity Federation 설정:

  ```bash
  # Service Account 생성
  gcloud iam service-accounts create github-actions \
    --display-name="GitHub Actions"

  # 권한 부여
  gcloud projects add-iam-policy-binding marketsphere-prod \
    --member="serviceAccount:github-actions@marketsphere-prod.iam.gserviceaccount.com" \
    --role="roles/run.admin"

  gcloud projects add-iam-policy-binding marketsphere-prod \
    --member="serviceAccount:github-actions@marketsphere-prod.iam.gserviceaccount.com" \
    --role="roles/artifactregistry.writer"

  # Workload Identity Pool 생성
  gcloud iam workload-identity-pools create "github-pool" \
    --location="global" \
    --display-name="GitHub Actions Pool"

  # Provider 생성
  gcloud iam workload-identity-pools providers create-oidc "github-provider" \
    --location="global" \
    --workload-identity-pool="github-pool" \
    --display-name="GitHub Provider" \
    --attribute-mapping="google.subject=assertion.sub,attribute.actor=assertion.actor,attribute.repository=assertion.repository" \
    --issuer-uri="https://token.actions.githubusercontent.com"

  # Service Account에 Workload Identity 권한 부여
  gcloud iam service-accounts add-iam-policy-binding \
    github-actions@marketsphere-prod.iam.gserviceaccount.com \
    --role="roles/iam.workloadIdentityUser" \
    --member="principalSet://iam.googleapis.com/projects/PROJECT_NUMBER/locations/global/workloadIdentityPools/github-pool/attribute.repository/YOUR_GITHUB_ORG/marketsphere"
  ```

- [ ] `.github/workflows/deploy.yml` 생성:

  ```yaml
  name: Deploy to GCP

  on:
    push:
      branches: [main]

  env:
    GCP_PROJECT_ID: marketsphere-prod
    GCP_REGION: asia-northeast3
    SERVICE_NAME: marketsphere-api
    ARTIFACT_REGISTRY: asia-northeast3-docker.pkg.dev

  jobs:
    deploy:
      runs-on: ubuntu-latest

      permissions:
        contents: read
        id-token: write

      steps:
        - name: Checkout code
          uses: actions/checkout@v4

        - name: Authenticate to Google Cloud
          uses: google-github-actions/auth@v2
          with:
            workload_identity_provider: ${{ secrets.GCP_WORKLOAD_IDENTITY_PROVIDER }}
            service_account: ${{ secrets.GCP_SERVICE_ACCOUNT }}

        - name: Set up Cloud SDK
          uses: google-github-actions/setup-gcloud@v2

        - name: Configure Docker for Artifact Registry
          run: gcloud auth configure-docker ${{ env.ARTIFACT_REGISTRY }}

        - name: Build Docker image
          run: |
            docker build -t ${{ env.ARTIFACT_REGISTRY }}/${{ env.GCP_PROJECT_ID }}/${{ env.SERVICE_NAME }}:${{ github.sha }} .
            docker tag ${{ env.ARTIFACT_REGISTRY }}/${{ env.GCP_PROJECT_ID }}/${{ env.SERVICE_NAME }}:${{ github.sha }} \
              ${{ env.ARTIFACT_REGISTRY }}/${{ env.GCP_PROJECT_ID }}/${{ env.SERVICE_NAME }}:latest

        - name: Push Docker image
          run: |
            docker push ${{ env.ARTIFACT_REGISTRY }}/${{ env.GCP_PROJECT_ID }}/${{ env.SERVICE_NAME }}:${{ github.sha }}
            docker push ${{ env.ARTIFACT_REGISTRY }}/${{ env.GCP_PROJECT_ID }}/${{ env.SERVICE_NAME }}:latest

        - name: Run Prisma migrations
          run: |
            gcloud run jobs execute prisma-migrate \
              --region=${{ env.GCP_REGION }} \
              --wait

        - name: Deploy to Cloud Run
          run: |
            gcloud run deploy ${{ env.SERVICE_NAME }} \
              --image=${{ env.ARTIFACT_REGISTRY }}/${{ env.GCP_PROJECT_ID }}/${{ env.SERVICE_NAME }}:${{ github.sha }} \
              --region=${{ env.GCP_REGION }} \
              --platform=managed \
              --allow-unauthenticated \
              --set-env-vars="DATABASE_URL=${{ secrets.DATABASE_URL }}" \
              --set-env-vars="NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=${{ secrets.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY }}" \
              --set-env-vars="CLERK_SECRET_KEY=${{ secrets.CLERK_SECRET_KEY }}" \
              --min-instances=1 \
              --max-instances=10 \
              --memory=2Gi \
              --cpu=2 \
              --timeout=300

        - name: Health check
          run: |
            SERVICE_URL=$(gcloud run services describe ${{ env.SERVICE_NAME }} \
              --region=${{ env.GCP_REGION }} \
              --format='value(status.url)')

            echo "Checking health at ${SERVICE_URL}/api/health"

            for i in {1..30}; do
              STATUS=$(curl -s -o /dev/null -w "%{http_code}" ${SERVICE_URL}/api/health)
              if [ $STATUS -eq 200 ]; then
                echo "✅ Health check passed!"
                exit 0
              fi
              echo "⏳ Waiting for service to be ready... (attempt $i/30)"
              sleep 10
            done

            echo "❌ Health check failed!"
            exit 1

        - name: Notify Slack on success
          if: success()
          uses: slackapi/slack-github-action@v1
          with:
            webhook-url: ${{ secrets.SLACK_WEBHOOK_URL }}
            payload: |
              {
                "text": "✅ Deployment successful!",
                "blocks": [
                  {
                    "type": "section",
                    "text": {
                      "type": "mrkdwn",
                      "text": "*MarketSphere* deployed to production\n*Commit*: ${{ github.event.head_commit.message }}\n*Author*: ${{ github.event.head_commit.author.name }}"
                    }
                  }
                ]
              }

        - name: Notify Slack on failure
          if: failure()
          uses: slackapi/slack-github-action@v1
          with:
            webhook-url: ${{ secrets.SLACK_WEBHOOK_URL }}
            payload: |
              {
                "text": "❌ Deployment failed!",
                "blocks": [
                  {
                    "type": "section",
                    "text": {
                      "type": "mrkdwn",
                      "text": "*MarketSphere* deployment failed\n*Commit*: ${{ github.event.head_commit.message }}\n*Author*: ${{ github.event.head_commit.author.name }}\n<https://github.com/${{ github.repository }}/actions/runs/${{ github.run_id }}|View logs>"
                    }
                  }
                ]
              }
  ```

### Task 4: Dockerfile 생성 (AC: 3)

- [ ] `Dockerfile` 생성 (프로젝트 루트):

  ```dockerfile
  # Build stage
  FROM node:20-alpine AS builder

  WORKDIR /app

  # Copy package files
  COPY package*.json ./
  COPY prisma ./prisma/

  # Install dependencies
  RUN npm ci

  # Copy source code
  COPY . .

  # Generate Prisma Client
  RUN npx prisma generate

  # Build Next.js
  RUN npm run build

  # Production stage
  FROM node:20-alpine AS runner

  WORKDIR /app

  ENV NODE_ENV=production

  # Copy necessary files from builder
  COPY --from=builder /app/public ./public
  COPY --from=builder /app/.next/standalone ./
  COPY --from=builder /app/.next/static ./.next/static
  COPY --from=builder /app/prisma ./prisma
  COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

  EXPOSE 3000

  ENV PORT 3000
  ENV HOSTNAME "0.0.0.0"

  CMD ["node", "server.js"]
  ```

- [ ] `.dockerignore` 생성:
  ```
  node_modules
  .next
  .git
  .env.local
  .env*.local
  npm-debug.log*
  yarn-debug.log*
  yarn-error.log*
  coverage
  .vscode
  .idea
  ```
- [ ] `next.config.js` 업데이트 (standalone output):

  ```javascript
  /** @type {import('next').NextConfig} */
  const nextConfig = {
    output: 'standalone',
  }

  module.exports = nextConfig
  ```

### Task 5: PR 템플릿 생성 (AC: 5)

- [ ] `.github/pull_request_template.md` 생성:

  ```markdown
  ## 관련 Story/Task

  - Story: US-X.X
  - Task: #issue-number

  ## 변경 사항 요약

  <!-- 이 PR에서 변경된 내용을 간략히 설명해주세요 -->

  ## 변경 타입

  - [ ] 🎨 Feature (새 기능)
  - [ ] 🐛 Bug Fix (버그 수정)
  - [ ] 🔨 Refactor (리팩토링)
  - [ ] 📝 Docs (문서)
  - [ ] 🧪 Test (테스트)
  - [ ] ⚙️ Config (설정)
  - [ ] 🚀 Performance (성능 개선)

  ## 테스트

  - [ ] 단위 테스트 작성 및 통과
  - [ ] E2E 테스트 작성 및 통과 (필요 시)
  - [ ] 테스트 커버리지 80% 이상 유지
  - [ ] 수동 테스트 완료

  ## Breaking Changes

  - [ ] Yes (하위 호환성 깨짐)
  - [ ] No

  <!-- Breaking Changes가 있다면 설명해주세요 -->

  ## 스크린샷 (UI 변경 시)

  <!-- UI 변경이 있다면 Before/After 스크린샷을 첨부해주세요 -->

  ## 추가 정보

  <!-- 리뷰어가 알아야 할 추가 정보가 있다면 작성해주세요 -->
  ```

### Task 6: GitHub Secrets 설정 (AC: 3, 4)

- [ ] GitHub Repository Settings → Secrets and variables → Actions → New repository secret:
  - [ ] `GCP_WORKLOAD_IDENTITY_PROVIDER`
  - [ ] `GCP_SERVICE_ACCOUNT`
  - [ ] `DATABASE_URL` (Production)
  - [ ] `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` (Production)
  - [ ] `CLERK_SECRET_KEY` (Production)
  - [ ] `TOSS_SECRET_KEY` (Production)
  - [ ] `OPENAI_API_KEY` (Production)
  - [ ] `SLACK_WEBHOOK_URL` (알림용)
- [ ] Environment별 Secrets 분리:
  - [ ] Environment: `development`
  - [ ] Environment: `staging`
  - [ ] Environment: `production`

---

## Dev Notes

### Previous Story Context

[Source: US-0.0, US-0.0.5]

**US-0.0에서 완료된 항목**:

- ✅ Git 초기화
- ✅ Next.js 프로젝트 구조
- ✅ Prisma 설정

**US-0.0.5에서 완료된 항목**:

- ✅ Pre-commit Hook (ESLint + Prettier)
- ✅ 테스트 프레임워크 (Vitest + Playwright)

**US-0.0.6에서 추가되는 항목**:

- Pre-push Hook (테스트 + 빌드)
- GitHub Actions CI/CD
- GCP 배포 자동화
- PR 템플릿 및 품질 게이트

### Tech Stack

[Source: tech-stack.md, Sprint Change Proposal]

**배포 인프라**:

- **Cloud Platform**: Google Cloud Platform (GCP)
- **Container Registry**: Artifact Registry
- **Compute**: Cloud Run (컨테이너 기반)
- **Database**: Cloud SQL (PostgreSQL 15+)
- **Scheduler**: Cloud Scheduler (Cron Jobs)
- **CI/CD**: GitHub Actions

**이전 계획 (변경됨)**:

- ~~Vercel 배포~~ → GCP Cloud Run 배포로 변경 (Sprint Change Proposal 승인)

### GCP Architecture

[Source: Sprint Change Proposal, Architecture Plan]

```
┌─────────────────────────────────────────────┐
│          GitHub Repository                   │
│  (Source Code + GitHub Actions)              │
└──────────────┬──────────────────────────────┘
               │ Push to main
               ▼
┌─────────────────────────────────────────────┐
│       GitHub Actions (CI/CD)                 │
│  - Test                                      │
│  - Build Docker Image                        │
│  - Push to Artifact Registry                 │
└──────────────┬──────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────┐
│       GCP Artifact Registry                  │
│  (Docker Image Storage)                      │
└──────────────┬──────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────┐
│          Cloud Run                           │
│  - Auto-scaling (1-10 instances)             │
│  - 2 vCPU, 2GB RAM                           │
│  - HTTPS Load Balancing                      │
└──────────────┬──────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────┐
│          Cloud SQL (PostgreSQL)              │
│  - High Availability                         │
│  - Automatic Backups                         │
│  - Private IP                                │
└──────────────────────────────────────────────┘
```

### CI/CD Pipeline Flow

[Source: GitHub Actions Best Practices]

**Pull Request Flow**:

```
1. Developer creates PR
   ↓
2. GitHub Actions CI triggered
   ↓
3. CI runs:
   - Lint
   - Type check
   - Unit tests
   - E2E tests
   - Build
   ↓
4. All checks pass → PR approved by reviewer
   ↓
5. PR merged to main
```

**Deployment Flow**:

```
1. Code merged to main
   ↓
2. GitHub Actions CD triggered
   ↓
3. Build Docker image
   ↓
4. Push to Artifact Registry
   ↓
5. Run Prisma migrations (Cloud SQL)
   ↓
6. Deploy to Cloud Run
   ↓
7. Health check (/api/health)
   ↓
8. Success → Slack notification
   Failure → Rollback + Slack alert
```

### Environment Variables

[Source: US-0.0, tech-stack.md]

**GitHub Secrets 구조**:

```
Repository Secrets (공통):
- GCP_WORKLOAD_IDENTITY_PROVIDER
- GCP_SERVICE_ACCOUNT
- SLACK_WEBHOOK_URL

Environment Secrets (환경별):
Development:
- DATABASE_URL
- NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY (test_pk_...)
- CLERK_SECRET_KEY (test_sk_...)

Staging:
- DATABASE_URL
- NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY (test_pk_...)
- CLERK_SECRET_KEY (test_sk_...)

Production:
- DATABASE_URL
- NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY (live_pk_...)
- CLERK_SECRET_KEY (live_sk_...)
- TOSS_SECRET_KEY (live_sk_...)
- OPENAI_API_KEY (sk-...)
```

### GCP Cost Estimation

[Source: GCP Pricing, Sprint Change Proposal]

**월 예상 비용**:

- Cloud Run: ~$20-50 (트래픽에 따라)
- Cloud SQL: ~$50-100 (db-custom-2-8192)
- Artifact Registry: ~$5-10
- Cloud Scheduler: 무료 (3 jobs 이하)
- **Total**: ~$75-160/월

**무료 티어**:

- Cloud Run: 월 2백만 요청 무료
- Artifact Registry: 0.5GB 무료

### Security Best Practices

[Source: GCP Security Best Practices]

**Workload Identity Federation**:

- ❌ Service Account Key 파일 사용 X (보안 위험)
- ✅ Workload Identity Federation 사용 (권장)
- GitHub Actions가 GCP에 keyless 인증

**Secrets 관리**:

- ❌ `.env` 파일 Git 커밋 금지
- ✅ GitHub Secrets 사용
- ✅ GCP Secret Manager 사용 (선택)

### Deployment Strategy

[Source: Cloud Run Best Practices]

**Zero-downtime Deployment**:

- Cloud Run은 기본적으로 Blue/Green 배포
- 새 버전 배포 → 헬스 체크 통과 → 트래픽 전환
- 이전 버전 자동 종료 (gradual rollout)

**Rollback 전략**:

```bash
# 이전 버전으로 롤백
gcloud run services update-traffic marketsphere-api \
  --to-revisions=marketsphere-api-00002-abc=100 \
  --region=asia-northeast3
```

### Testing Standards

[Source: US-0.0.5, Testing Standards]

**CI에서 실행되는 테스트**:

1. **Lint**: `npm run lint`
2. **Type Check**: `npm run type-check`
3. **Unit Tests**: `npm run test` (Vitest)
4. **E2E Tests**: `npm run test:e2e` (Playwright)
5. **Build**: `npm run build`

**커버리지 요구사항**:

- Lines: 80% 이상
- Functions: 80% 이상
- Branches: 80% 이상
- Statements: 80% 이상

**E2E 테스트 전략**:

- CI에서는 Chromium 브라우저만 실행 (빠른 피드백)
- 로컬에서는 모든 브라우저 테스트 (Firefox, WebKit)

### Health Check API

[Source: US-0.0.5, API Testing]

**Health Check Route** (이미 구현됨):

```typescript
// app/api/health/route.ts
import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  })
}
```

**Cloud Run Health Check 설정**:

```bash
gcloud run services update marketsphere-api \
  --region=asia-northeast3 \
  --startup-probe-path=/api/health \
  --liveness-probe-path=/api/health
```

---

## Change Log

| Date       | Version | Description                               | Author             |
| ---------- | ------- | ----------------------------------------- | ------------------ |
| 2025-10-29 | 1.0     | Initial story creation for CI/CD pipeline | Bob (Scrum Master) |

---

## Dev Agent Record

_(이 섹션은 개발 에이전트가 구현 중 작성합니다)_

### Agent Model Used

_(개발 에이전트가 기록)_

### Debug Log References

_(개발 에이전트가 기록)_

### Completion Notes List

_(개발 에이전트가 기록)_

### File List

_(개발 에이전트가 기록)_

---

## QA Results

_(이 섹션은 QA 에이전트가 검증 후 작성합니다)_
