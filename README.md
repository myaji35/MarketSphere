# MarketSphere

전통시장 디지털 혁신 플랫폼 - AI 기반 소상공인 마케팅 자동화

## 🎯 프로젝트 개요

MarketSphere는 전통시장 소상공인이 마케팅 기술이나 노력 없이도 본업에만 집중할 수 있도록 AI가 마케팅 및 고객 관리를 대신 수행하는 플랫폼입니다.

### 주요 기능

- **AI 마케팅 자동화**: 상품 사진 1장 → AI가 홍보 문구 + 해시태그 자동 생성
- **실시간 푸시 알림**: 타임세일 버튼 클릭 → 단골 고객에게 즉시 알림
- **AI 챗봇**: 24/7 자동 응답으로 고객 문의 처리
- **상인회 대시보드**: 시장 전체 데이터 분석 및 공동 마케팅

## 🛠️ 기술 스택

- **Frontend**: Next.js 14+ (App Router), TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes, NextAuth.js v5
- **Database**: PostgreSQL 15+, Prisma ORM
- **AI Services**: OpenAI API (GPT-4 Vision)
- **Deployment**: Vercel (추천)

## 📦 설치 및 실행

### ⚡ 30초 안에 시작하기

```bash
npm install && npm run dev
```

브라우저에서 http://localhost:3000/merchant 접속 → **바로 테스트 가능!**

> ✨ **API 키 불필요** | **DB 선택적** | **자동 로그인**

📖 **자세한 가이드**: [QUICKSTART.md](./QUICKSTART.md) | [DEV-GUIDE.md](./DEV-GUIDE.md)

### 정식 설정 (프로덕션)

<details>
<summary>클릭하여 펼치기</summary>

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

`.env` 파일에서 개발 모드를 비활성화하고 실제 API 키 설정:

```env
NEXT_PUBLIC_DEV_MODE="false"
DATABASE_URL="postgresql://user:password@localhost:5432/marketsphere"
OPENAI_API_KEY="sk-your-actual-key"
CLERK_SECRET_KEY="sk_live_your-actual-key"
```

### 3. 데이터베이스 설정

```bash
# Prisma Client 생성
npm run prisma:generate

# 마이그레이션 실행
npm run prisma:migrate

# 시드 데이터 삽입 (선택)
npm run prisma:seed

# Prisma Studio 실행 (GUI)
npm run prisma:studio
```

### 4. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 접속

</details>

## 📁 프로젝트 구조

```
marketsphere/
├── app/                    # Next.js 14 App Router
│   ├── (auth)/            # 인증 그룹
│   ├── (dashboard)/       # 대시보드 그룹
│   ├── api/               # API Routes
│   ├── layout.tsx
│   └── page.tsx
├── components/            # React 컴포넌트
│   ├── ui/               # shadcn/ui 컴포넌트
│   ├── forms/
│   └── features/
├── lib/                  # 유틸리티
│   ├── prisma.ts
│   ├── utils.ts
│   └── ai/
├── prisma/
│   ├── schema.prisma     # Prisma 스키마
│   ├── migrations/
│   └── seed.ts
└── docs/                 # 문서
    ├── prd.md           # PRD
    ├── tech-stack.md    # 기술 스택
    ├── epics/           # Epic 문서
    └── stories/         # User Story 문서
```

## 📚 문서

- [PRD (Product Requirements Document)](./docs/prd.md)
- [기술 스택 상세](./docs/tech-stack.md)
- [Epic 1: 소상공인 핵심 기능](./docs/epics/epic-1-merchant-core-features.md)
- [Epic 2: 상인회 기능](./docs/epics/epic-2-merchant-association-features.md)
- [Epic 3: 이용고객 기능](./docs/epics/epic-3-customer-features.md)
- [아키텍처 리뷰](./docs/architecture-review-merchant-association-control.md)

## 🚀 배포

### Vercel 배포

```bash
# Vercel CLI 설치
npm i -g vercel

# 배포
vercel

# 프로덕션 배포
vercel --prod
```

### 환경 변수 설정

Vercel Dashboard에서 다음 환경 변수 설정:
- `DATABASE_URL`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`
- `OPENAI_API_KEY`

## 🎨 UI 컴포넌트 추가

shadcn/ui 컴포넌트 추가:

```bash
npx shadcn-ui@latest add button
npx shadcn-ui@latest add form
npx shadcn-ui@latest add input
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add toast
```

## 📝 License

MIT License

## 👥 Contributors

- PM: John
- Tech Lead: TBD
- Developers: TBD

---

**MarketSphere** - 전통시장의 디지털 혁신을 함께합니다.
