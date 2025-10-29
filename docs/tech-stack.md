# MarketSphere 기술 스택 (Tech Stack)

**작성일**: 2025년 10월 29일
**버전**: 1.0

---

## 1. 전체 아키텍처

```
┌─────────────────────────────────────────────────┐
│                   Frontend                       │
│  Next.js 14+ App Router + TypeScript             │
│  Tailwind CSS + shadcn/ui                        │
└─────────────────┬───────────────────────────────┘
                  │ REST API / tRPC
┌─────────────────┴───────────────────────────────┐
│                   Backend                        │
│  Next.js 14+ API Routes + Server Actions         │
│  NextAuth.js (Authentication)                    │
└─────────────────┬───────────────────────────────┘
                  │
┌─────────────────┴───────────────────────────────┐
│                  Database                        │
│  PostgreSQL 15+ (Supabase / Vercel Postgres)    │
│  Prisma ORM                                      │
└──────────────────────────────────────────────────┘
```

---

## 2. Frontend 기술 스택

### 2.1. Core Framework
- **Next.js 14+** (App Router)
  - React 18 Server Components
  - Server Actions for mutations
  - Built-in API routes
  - Image optimization
  - SEO 최적화

### 2.2. Styling
- **Tailwind CSS 3+**
  - Utility-first CSS
  - 반응형 디자인
  - 다크 모드 지원
- **shadcn/ui**
  - Radix UI 기반 컴포넌트
  - 접근성(a11y) 내장
  - 커스터마이징 용이

### 2.3. Language
- **TypeScript 5+**
  - 타입 안정성
  - 자동완성 및 IntelliSense
  - 런타임 에러 방지

### 2.4. State Management
- **React Context API** (전역 상태)
- **Zustand** (선택적, 복잡한 상태 관리 시)
- **Server State**: TanStack Query (React Query)

### 2.5. Form Handling
- **React Hook Form**
- **Zod** (스키마 검증)

### 2.6. UI Components (shadcn/ui)

**shadcn/ui MCP 서버 설치** (권장):
```bash
# Claude Code에서 shadcn/ui MCP 서버 설치
# .claude/config.json에 MCP 서버 추가 후
```

**수동 설치**:
```bash
npx shadcn-ui@latest init
npx shadcn-ui@latest add button
npx shadcn-ui@latest add form
npx shadcn-ui@latest add input
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add toast
npx shadcn-ui@latest add dropdown-menu
npx shadcn-ui@latest add card
npx shadcn-ui@latest add table
npx shadcn-ui@latest add tabs
npx shadcn-ui@latest add select
npx shadcn-ui@latest add label
npx shadcn-ui@latest add badge
npx shadcn-ui@latest add avatar
```

---

## 3. Backend 기술 스택

### 3.1. Runtime & Framework
- **Next.js 14+ API Routes**
  - `app/api/v1/**` 구조
  - Server Actions for mutations
  - Edge Runtime 지원

### 3.2. Authentication
- **Clerk**
  - Providers:
    - Email/Password
    - OAuth (Google, Kakao, Naver)
    - Phone (SMS)
  - JWT 토큰 자동 관리
  - Session 관리 (서버/클라이언트)
  - Role-based access control (RBAC)
  - Multi-tenancy 지원
  - 사전 제작된 UI 컴포넌트 제공

### 3.3. ORM
- **Prisma**
  - Type-safe database queries
  - 자동 마이그레이션
  - Prisma Studio (GUI)

### 3.4. Database
- **PostgreSQL 15+**
  - 호스팅 옵션:
    - **Supabase** (추천: 무료 티어, 실시간 기능)
    - **Vercel Postgres** (Vercel 통합)
    - **Neon** (서버리스 PostgreSQL)
  - Extensions:
    - `uuid-ossp` (UUID 생성)
    - `pg_trgm` (텍스트 검색)

### 3.5. File Storage
- **AWS S3** 또는 **Supabase Storage**
  - 상품 이미지 업로드
  - CDN 연동

### 3.6. AI Services
- **OpenAI API** (GPT-4, Vision)
- **Claude API** (백업)
- **Langchain** (AI 오케스트레이션)

### 3.7. Push Notifications
- **Firebase Cloud Messaging (FCM)**
- **Web Push API**

---

## 4. 데이터베이스 스키마 (Prisma)

### 4.1. Prisma 설정

**prisma/schema.prisma**:
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// 상인회 (Merchant Association)
model MerchantAssociation {
  id              String   @id @default(uuid())
  name            String
  presidentName   String?  @map("president_name")
  contactPhone    String?  @map("contact_phone")
  email           String?
  createdAt       DateTime @default(now()) @map("created_at")
  updatedAt       DateTime @updatedAt @map("updated_at")

  markets         Market[]
  admins          AssociationAdmin[]

  @@map("merchant_associations")
}

// 시장 (Market)
model Market {
  id               String   @id @default(uuid())
  marketName       String   @map("market_name")
  associationId    String   @map("association_id")
  subdomainPrefix  String   @unique @map("subdomain_prefix") // 예: mangwon
  address          String?
  latitude         Float?
  longitude        Float?
  totalStores      Int      @default(0) @map("total_stores")
  createdAt        DateTime @default(now()) @map("created_at")
  updatedAt        DateTime @updatedAt @map("updated_at")

  association      MerchantAssociation @relation(fields: [associationId], references: [id], onDelete: Cascade)
  stores           Store[]

  @@index([associationId])
  @@map("markets")
}

// 상점 (Store)
model Store {
  id               String   @id @default(uuid())
  storeName        String   @map("store_name")
  subdomain        String   // 예: kimbapchunguk
  marketId         String   @map("market_id")

  // 승인 상태
  approvalStatus   ApprovalStatus @default(PENDING) @map("approval_status")
  approvedAt       DateTime? @map("approved_at")
  approvedBy       String?   @map("approved_by")
  rejectionReason  String?   @map("rejection_reason")

  // 상점 정보
  category         String
  location         String?
  phone            String
  hours            Json?    // { open: "09:00", close: "20:00", closedDays: ["일요일"] }
  photoUrl         String?  @map("photo_url")

  createdAt        DateTime @default(now()) @map("created_at")
  updatedAt        DateTime @updatedAt @map("updated_at")

  market           Market   @relation(fields: [marketId], references: [id], onDelete: Cascade)
  products         Product[]

  @@unique([marketId, subdomain]) // 같은 시장 내 서브도메인 중복 방지
  @@index([marketId])
  @@index([approvalStatus])
  @@map("stores")
}

enum ApprovalStatus {
  PENDING   // 대기 중
  APPROVED  // 승인됨
  REJECTED  // 거부됨
  SUSPENDED // 정지됨
}

// 상품 (Product)
model Product {
  id                      String   @id @default(uuid())
  storeId                 String   @map("store_id")
  productName             String   @map("product_name")
  price                   Int
  discountPrice           Int?     @map("discount_price")
  imageUrl                String   @map("image_url")

  // AI 생성 콘텐츠
  aiGeneratedDescription  String?  @map("ai_generated_description")
  aiGeneratedHashtags     String[] @map("ai_generated_hashtags")

  stock                   Int      @default(0)
  isAvailable             Boolean  @default(true) @map("is_available")

  createdAt               DateTime @default(now()) @map("created_at")
  updatedAt               DateTime @updatedAt @map("updated_at")

  store                   Store    @relation(fields: [storeId], references: [id], onDelete: Cascade)

  @@index([storeId])
  @@map("products")
}

// 사용자 (User) - NextAuth 연동
model User {
  id            String    @id @default(uuid())
  name          String?
  email         String?   @unique
  emailVerified DateTime? @map("email_verified")
  image         String?
  phone         String?   @unique
  role          UserRole  @default(CUSTOMER)

  createdAt     DateTime  @default(now()) @map("created_at")
  updatedAt     DateTime  @updatedAt @map("updated_at")

  accounts      Account[]
  sessions      Session[]

  @@map("users")
}

enum UserRole {
  CUSTOMER           // 고객
  MERCHANT           // 상점주
  ASSOCIATION_ADMIN  // 상인회 관리자
  PLATFORM_ADMIN     // 플랫폼 관리자
}

// NextAuth 테이블
model Account {
  id                String  @id @default(uuid())
  userId            String  @map("user_id")
  type              String
  provider          String
  providerAccountId String  @map("provider_account_id")
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
  @@map("accounts")
}

model Session {
  id           String   @id @default(uuid())
  sessionToken String   @unique @map("session_token")
  userId       String   @map("user_id")
  expires      DateTime

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("sessions")
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
  @@map("verification_tokens")
}

// 상인회 관리자
model AssociationAdmin {
  id              String   @id @default(uuid())
  userId          String   @map("user_id")
  associationId   String   @map("association_id")
  role            String   @default("admin") // president, admin, manager
  permissions     Json?
  createdAt       DateTime @default(now()) @map("created_at")

  association     MerchantAssociation @relation(fields: [associationId], references: [id], onDelete: Cascade)

  @@unique([userId, associationId])
  @@index([associationId])
  @@map("association_admins")
}
```

### 4.2. Prisma 마이그레이션

```bash
# 개발 환경 마이그레이션
npx prisma migrate dev --name init

# Prisma Client 생성
npx prisma generate

# Prisma Studio 실행 (GUI)
npx prisma studio
```

---

## 5. 프로젝트 구조

```
marketsphere/
├── app/                          # Next.js 14 App Router
│   ├── (auth)/                   # 인증 그룹
│   │   ├── login/
│   │   └── register/
│   ├── (dashboard)/              # 대시보드 그룹
│   │   ├── merchant/             # 상점주 대시보드
│   │   ├── association/          # 상인회 대시보드
│   │   └── customer/             # 고객 앱
│   ├── api/                      # API Routes
│   │   ├── auth/                 # NextAuth
│   │   └── v1/
│   │       ├── stores/
│   │       ├── products/
│   │       └── admin/
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Home page
├── components/                   # React 컴포넌트
│   ├── ui/                       # shadcn/ui 컴포넌트
│   ├── forms/                    # 폼 컴포넌트
│   ├── layouts/                  # 레이아웃 컴포넌트
│   └── features/                 # 기능별 컴포넌트
├── lib/                          # 유틸리티
│   ├── prisma.ts                 # Prisma 클라이언트
│   ├── auth.ts                   # NextAuth 설정
│   ├── utils.ts                  # 유틸 함수
│   └── ai/                       # AI 서비스
│       ├── openai.ts
│       └── content-generator.ts
├── prisma/
│   ├── schema.prisma             # Prisma 스키마
│   ├── migrations/               # 마이그레이션
│   └── seed.ts                   # 시드 데이터
├── public/                       # 정적 파일
├── types/                        # TypeScript 타입
├── .env                          # 환경 변수
├── next.config.js                # Next.js 설정
├── tailwind.config.ts            # Tailwind 설정
├── tsconfig.json                 # TypeScript 설정
└── package.json
```

---

## 6. 환경 설정

### 6.1. 필수 환경 변수

**.env.local**:
```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/marketsphere"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# OAuth Providers (선택)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# AI Services
OPENAI_API_KEY="sk-..."
ANTHROPIC_API_KEY="sk-ant-..."

# File Storage
AWS_ACCESS_KEY_ID="your-aws-key"
AWS_SECRET_ACCESS_KEY="your-aws-secret"
AWS_REGION="ap-northeast-2"
AWS_S3_BUCKET="marketsphere-uploads"

# Firebase (Push Notifications)
FIREBASE_PROJECT_ID="your-project-id"
FIREBASE_CLIENT_EMAIL="your-service-account@..."
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."
```

### 6.2. package.json

```json
{
  "name": "marketsphere",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "prisma:generate": "prisma generate",
    "prisma:migrate": "prisma migrate dev",
    "prisma:studio": "prisma studio"
  },
  "dependencies": {
    "next": "^14.2.0",
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "typescript": "^5.4.0",

    "@prisma/client": "^5.12.0",
    "next-auth": "^5.0.0-beta.16",

    "@radix-ui/react-dialog": "^1.0.5",
    "@radix-ui/react-dropdown-menu": "^2.0.6",
    "@radix-ui/react-slot": "^1.0.2",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.2.0",
    "tailwindcss-animate": "^1.0.7",

    "react-hook-form": "^7.51.0",
    "zod": "^3.22.4",
    "@hookform/resolvers": "^3.3.4",

    "@tanstack/react-query": "^5.28.0",
    "axios": "^1.6.8",

    "openai": "^4.29.0",
    "langchain": "^0.1.30",

    "date-fns": "^3.6.0",
    "lucide-react": "^0.363.0"
  },
  "devDependencies": {
    "@types/node": "^20.11.0",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0",
    "tailwindcss": "^3.4.0",
    "prisma": "^5.12.0",
    "eslint": "^8.57.0",
    "eslint-config-next": "^14.2.0"
  }
}
```

---

## 7. 개발 환경 설정 가이드

### 7.1. 프로젝트 초기화

```bash
# Next.js 프로젝트 생성
npx create-next-app@latest marketsphere --typescript --tailwind --app

# shadcn/ui 설치
npx shadcn-ui@latest init

# Prisma 설치 및 초기화
npm install @prisma/client
npm install -D prisma
npx prisma init

# NextAuth 설치
npm install next-auth@beta

# React Hook Form + Zod
npm install react-hook-form zod @hookform/resolvers

# TanStack Query
npm install @tanstack/react-query
```

### 7.2. Prisma 설정

```bash
# 스키마 작성 후 마이그레이션
npx prisma migrate dev --name init

# Prisma Client 생성
npx prisma generate

# 시드 데이터 삽입 (선택)
npx prisma db seed
```

### 7.3. 로컬 개발 서버 실행

```bash
npm run dev
# http://localhost:3000
```

---

## 8. 배포 환경

### 8.1. 호스팅
- **Vercel** (추천)
  - Next.js 최적화
  - 자동 배포 (GitHub 연동)
  - Edge Functions
  - Vercel Postgres 통합

### 8.2. 데이터베이스
- **Supabase** (추천)
  - PostgreSQL 호스팅
  - 실시간 기능
  - Storage (S3 대체)
  - 무료 티어 (500MB)

### 8.3. CI/CD
- **GitHub Actions**
  - 자동 테스트
  - Vercel 배포
  - Prisma 마이그레이션

---

## 9. 성능 최적화

### 9.1. Next.js 최적화
- Server Components 활용 (기본값)
- Dynamic Import (코드 스플리팅)
- Image Optimization (`next/image`)
- Font Optimization (`next/font`)

### 9.2. 데이터베이스 최적화
- Prisma Connection Pooling
- 인덱스 최적화
- 쿼리 최적화 (N+1 문제 해결)

### 9.3. 캐싱
- React Query (클라이언트 캐싱)
- Next.js Data Cache (서버 캐싱)
- Redis (선택적)

---

## 10. 보안

### 10.1. Authentication
- NextAuth.js (세션 관리)
- JWT 토큰 암호화
- CSRF 보호

### 10.2. Authorization
- Role-based access control (RBAC)
- API route 권한 검증
- Server Actions 권한 검증

### 10.3. Data Validation
- Zod 스키마 검증 (클라이언트 + 서버)
- SQL Injection 방지 (Prisma ORM)
- XSS 방지 (React 기본 제공)

---

**최종 업데이트**: 2025년 10월 29일
**담당**: Tech Lead
