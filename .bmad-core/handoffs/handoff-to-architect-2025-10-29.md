# Handoff to Architect (Winston)

**Date**: 2025-10-29
**From**: Bob (Scrum Master)
**To**: Winston (Architect)
**Session**: Architecture Document Continuation

---

## 🎯 Task Overview

**Task**: architecture.md 문서 작성 이어서 진행
**Current Section**: High Level Architecture (다음 작업 섹션)
**Previous Section Completed**: Introduction (Winston이 분석 완료)

---

## ✅ 완료된 작업 (Scrum Master)

### 1. Epic 0 Prerequisites 스토리 생성 완료

**생성된 스토리**:
- ✅ **US-0.0**: 프로젝트 초기화 (8 points) - READY
- ✅ **US-0.0.5**: 품질 보증 인프라 (5 points) - Draft
- ✅ **US-0.0.6**: CI/CD 파이프라인 (8 points) - Draft

**파일 위치**:
- `docs/stories/US-0.0-project-initialization.md`
- `docs/stories/US-0.0.5-quality-assurance-infrastructure.md`
- `docs/stories/US-0.0.6-ci-cd-pipeline.md`

### 2. 기술 스택 확정

**Tech Stack 문서**: `docs/tech-stack.md` (완성됨)

**주요 기술 결정**:
- Frontend: Next.js 14+ App Router, TypeScript 5+, Tailwind CSS, shadcn/ui
- Backend: Next.js API Routes, Server Actions, Clerk Auth
- Database: PostgreSQL 15+ (Cloud SQL), Prisma ORM 5.12.0
- Payment: Toss Payments (Korean gateway)
- AI: OpenAI GPT-4, Vision, LangChain
- Push: Firebase Cloud Messaging (FCM)
- Testing: Vitest (unit), Playwright (E2E), Supertest (API)
- Deployment: **Google Cloud Platform (GCP)** ← 중요!

### 3. GCP 마이그레이션 결정 승인

**Sprint Change Proposal**: 승인됨 (PO Sarah, User 모두 승인)

**변경 사항**:
- ❌ **이전 계획**: Vercel 배포
- ✅ **새 계획**: GCP Cloud Run + Cloud SQL 배포

**주요 인프라**:
- Compute: Cloud Run (컨테이너 기반, auto-scaling)
- Database: Cloud SQL PostgreSQL 15+
- Container Registry: Artifact Registry
- Scheduler: Cloud Scheduler (Cron Jobs)
- CI/CD: GitHub Actions → Artifact Registry → Cloud Run

**아키텍처 다이어그램 반영 필요**:
```
GitHub → GitHub Actions (CI/CD) → Artifact Registry
                                        ↓
                                   Cloud Run
                                        ↓
                                   Cloud SQL
```

---

## 📋 Winston의 다음 작업

### Section 2: High Level Architecture

**작성해야 할 내용**:

1. **시스템 아키텍처 다이어그램**:
   - Client (Browser/Mobile)
   - Next.js App (Cloud Run)
   - PostgreSQL (Cloud SQL)
   - External Services (Clerk, Toss Payments, OpenAI, FCM)

2. **Layer Architecture**:
   - Presentation Layer (Next.js App Router, React Server Components)
   - API Layer (Next.js API Routes, Server Actions)
   - Business Logic Layer (lib/, services/)
   - Data Access Layer (Prisma ORM)
   - Database Layer (Cloud SQL PostgreSQL)

3. **GCP Deployment Architecture**:
   - Cloud Run 설정 (auto-scaling 1-10 instances, 2 vCPU, 2GB RAM)
   - Cloud SQL 설정 (High Availability, Private IP)
   - Artifact Registry (Docker images)
   - Cloud Scheduler (Cron Jobs)
   - Load Balancing (HTTPS)

4. **Monolithic Architecture Justification**:
   - 왜 모놀리식인가? (초기 MVP, 빠른 개발, 단순한 배포)
   - 향후 마이크로서비스 전환 가능성 (Phase 2)

5. **Security Architecture**:
   - Authentication: Clerk (JWT tokens)
   - Authorization: Role-based access control (RBAC)
   - Data Protection: Prisma ORM (SQL Injection 방지)
   - Secrets Management: GCP Secret Manager + GitHub Secrets
   - Network Security: Cloud SQL Private IP, Cloud Run IAM

---

## 📚 참고 자료

### 필수 참고 문서

1. **Tech Stack**: `docs/tech-stack.md`
   - 전체 기술 스택 명세
   - GCP 인프라 구성

2. **PRD**: `docs/prd.md`
   - 비즈니스 요구사항
   - 사용자 페르소나
   - 주요 기능

3. **Prisma Schema**: `prisma/schema.prisma`
   - 데이터 모델 (MerchantAssociation, Market, Store, Product, User, Subscription, Payment)
   - 관계 구조

4. **US-0.0 Series Stories**: `docs/stories/US-0.0*.md`
   - 프로젝트 구조
   - 환경 변수
   - 테스트 전략
   - CI/CD 파이프라인

5. **Sprint Change Proposal**: (승인됨)
   - GCP 마이그레이션 근거
   - 비용 추정 (~$75-160/월)
   - 마이그레이션 체크리스트

### 아키텍처 패턴 참고

**Next.js 14 Patterns**:
- Server Components (기본)
- Client Components ('use client')
- Server Actions (mutations)
- Route Groups: (auth), (dashboard)
- API Routes: app/api/v1/**

**Prisma Patterns**:
- Singleton pattern (lib/prisma.ts)
- Transaction handling
- Relation loading strategies

**GCP Best Practices**:
- Workload Identity Federation (keyless auth)
- Cloud Run zero-downtime deployment
- Cloud SQL connection pooling
- Private networking (VPC)

---

## 🎨 다이어그램 요구사항

**Architecture 문서에 포함할 다이어그램**:

1. **High Level System Architecture** (필수):
   ```
   [Client] → [Cloud Run (Next.js)] → [Cloud SQL]
                      ↓
              [External Services]
              - Clerk Auth
              - Toss Payments
              - OpenAI API
              - Firebase FCM
   ```

2. **Layer Architecture** (필수):
   ```
   Presentation → API → Business Logic → Data Access → Database
   ```

3. **GCP Infrastructure Diagram** (필수):
   ```
   GitHub → GitHub Actions → Artifact Registry → Cloud Run
                                                      ↓
                                                 Cloud SQL
                                                      ↓
                                              Cloud Scheduler
   ```

4. **Data Flow Diagram** (권장):
   - 사용자 → 상점 등록 → 승인 프로세스
   - 상점주 → 구독 결제 → 정기 결제
   - 고객 → 타임세일 알림 → 푸시 수신

5. **Security Architecture** (권장):
   - Authentication flow (Clerk)
   - Authorization layers (RBAC)
   - Data encryption (at rest, in transit)

**다이어그램 형식**: Mermaid (마크다운 내 포함 가능)

---

## 🔑 주요 결정 사항 (반드시 반영)

1. **Deployment Platform**: GCP (Vercel 아님!)
   - Compute: Cloud Run (not Vercel Edge Functions)
   - Database: Cloud SQL (not Vercel Postgres)
   - Cron: Cloud Scheduler (not Vercel Cron)

2. **Authentication**: Clerk (NextAuth 아님!)
   - JWT 토큰 자동 관리
   - Multi-provider (Email, Google, Kakao, Naver, Phone)
   - Pre-built UI components

3. **Payment Gateway**: Toss Payments (Korean domestic)
   - Billing Key (자동 결제)
   - Subscription model (월 10,000원 기본, 20,000원 프리미엄)

4. **Database Schema**: Prisma (이미 완성됨)
   - 11개 모델 정의
   - 관계 설정 완료
   - snake_case 컬럼명 (PostgreSQL 관례)

5. **Testing Strategy**:
   - Unit: Vitest + @testing-library/react
   - E2E: Playwright (Chromium, Firefox, WebKit)
   - API: Supertest
   - Coverage: 80% 이상 필수

---

## ⚠️ 주의사항

1. **GCP 마이그레이션 반영**: 모든 다이어그램과 설명에서 Vercel이 아닌 GCP로 표기
2. **Clerk 인증**: NextAuth가 아닌 Clerk 사용 (Prisma 스키마에서 Account/Session/VerificationToken 테이블 제거됨)
3. **Monolithic Architecture**: 초기 MVP는 모놀리식, 향후 마이크로서비스 전환 가능성 언급
4. **Korean Market Focus**: 토스페이먼츠, 카카오/네이버 로그인 등 한국 시장 특화
5. **Multi-tenancy**: 상인회 → 시장 → 상점 계층 구조 (서브도메인 기반)

---

## 📝 작성 가이드

**Architecture 문서 구조** (참고):
```markdown
# MarketSphere Architecture Document

## 1. Introduction (✅ 완료)
- System Overview
- Goals and Constraints
- Stakeholders

## 2. High Level Architecture (⏳ Winston 작업 예정)
- System Architecture Diagram
- Layer Architecture
- Component Overview
- Technology Stack Summary

## 3. Detailed Architecture (⏳ 다음 단계)
- Frontend Architecture
- Backend Architecture
- Database Architecture
- External Integrations

## 4. Infrastructure & Deployment (⏳ 다음 단계)
- GCP Infrastructure
- CI/CD Pipeline
- Monitoring & Logging

## 5. Security Architecture (⏳ 다음 단계)
...
```

**작성 시 참고**:
- 다이어그램 우선 (visual communication)
- 각 레이어별 책임 명확히
- GCP 서비스 명시적으로 표기
- 비용 효율성 고려사항 포함
- 확장성 (scalability) 언급

---

## 🚀 시작하기

**Winston의 첫 단계**:

1. `docs/architecture.md` 파일 읽기 (현재 상태 확인)
2. Introduction 섹션 검토 (Winston이 이미 분석했던 부분)
3. **Section 2: High Level Architecture** 작성 시작:
   - System Architecture Diagram (Mermaid)
   - Layer Architecture 설명
   - GCP Deployment Architecture
   - Component 상호작용 설명

4. 작성 완료 후:
   - Self-review (completeness check)
   - Handoff to Scrum Master (next section 계획)

---

## 📞 Contact

**Questions?**
- Scrum Master (Bob): Story 관련 질문
- PO (Sarah): 비즈니스 요구사항 질문
- Tech Lead: 기술 스택 상세 질문

**Resources**:
- PRD: `docs/prd.md`
- Tech Stack: `docs/tech-stack.md`
- Stories: `docs/stories/`
- Prisma Schema: `prisma/schema.prisma`

---

**Good luck, Winston! 🎨**

---

**End of Handoff Document**
