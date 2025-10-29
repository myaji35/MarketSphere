# Clerk 인증 설정 가이드

**작성일**: 2025년 10월 29일

---

## 1. Clerk 프로젝트 생성

1. [Clerk 대시보드](https://dashboard.clerk.com/)에 접속
2. "Create Application" 클릭
3. 애플리케이션 이름: `MarketSphere`
4. 로그인 방법 선택:
   - ✅ Email
   - ✅ Phone (SMS)
   - ✅ Google
   - ✅ Kakao (Custom OAuth)
   - ✅ Naver (Custom OAuth)

---

## 2. API 키 복사

Clerk 대시보드 → API Keys에서:

```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."
```

`.env.local`에 추가

---

## 3. 한국어 지원

`app/layout.tsx`에 한국어 로컬라이제이션 추가됨:

```tsx
import { ClerkProvider } from '@clerk/nextjs'
import { koKR } from '@clerk/localizations'

export default function RootLayout({ children }) {
  return (
    <ClerkProvider localization={koKR}>
      {/* ... */}
    </ClerkProvider>
  )
}
```

---

## 4. 사용자 역할 (Role) 설정

### Clerk 메타데이터 활용

Clerk의 `publicMetadata`에 역할 저장:

```typescript
// Clerk Webhook 또는 가입 후 설정
await clerkClient.users.updateUserMetadata(userId, {
  publicMetadata: {
    role: 'MERCHANT', // CUSTOMER, MERCHANT, ASSOCIATION_ADMIN, PLATFORM_ADMIN
  },
})
```

### 역할 확인

```typescript
import { currentUser } from '@clerk/nextjs/server'

const user = await currentUser()
const role = user?.publicMetadata.role // 'MERCHANT'
```

---

## 5. Prisma User 테이블 수정

Clerk는 자체 사용자 테이블을 사용하므로, Prisma `User` 테이블 수정:

```prisma
model User {
  id            String   @id // Clerk User ID (외부 ID)
  email         String?  @unique
  name          String?
  phone         String?
  role          UserRole @default(CUSTOMER)

  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  stores        Store[]
  favorites     Favorite[]
  pushTokens    PushToken[]

  @@map("users")
}
```

**중요**: Clerk User ID를 Prisma User.id로 사용

---

## 6. Webhook 설정 (사용자 동기화)

Clerk → Webhooks → Add Endpoint:

**URL**: `https://your-domain.com/api/webhooks/clerk`

**Events**:
- `user.created`
- `user.updated`
- `user.deleted`

### Webhook 핸들러 구현

`app/api/webhooks/clerk/route.ts`:

```typescript
import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET

  if (!WEBHOOK_SECRET) {
    throw new Error('CLERK_WEBHOOK_SECRET is not set')
  }

  const headerPayload = headers()
  const svix_id = headerPayload.get('svix-id')
  const svix_timestamp = headerPayload.get('svix-timestamp')
  const svix_signature = headerPayload.get('svix-signature')

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error: Missing svix headers', { status: 400 })
  }

  const payload = await req.json()
  const body = JSON.stringify(payload)

  const wh = new Webhook(WEBHOOK_SECRET)

  let evt

  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as any
  } catch (err) {
    console.error('Error verifying webhook:', err)
    return new Response('Error: Verification error', { status: 400 })
  }

  const eventType = evt.type

  if (eventType === 'user.created') {
    const { id, email_addresses, phone_numbers, first_name, last_name } = evt.data

    await prisma.user.create({
      data: {
        id, // Clerk User ID
        email: email_addresses[0]?.email_address,
        phone: phone_numbers[0]?.phone_number,
        name: `${first_name || ''} ${last_name || ''}`.trim(),
        role: 'CUSTOMER', // 기본 역할
      },
    })
  } else if (eventType === 'user.updated') {
    const { id, email_addresses, phone_numbers, first_name, last_name } = evt.data

    await prisma.user.update({
      where: { id },
      data: {
        email: email_addresses[0]?.email_address,
        phone: phone_numbers[0]?.phone_number,
        name: `${first_name || ''} ${last_name || ''}`.trim(),
      },
    })
  } else if (eventType === 'user.deleted') {
    await prisma.user.delete({
      where: { id: evt.data.id },
    })
  }

  return new Response('Webhook received', { status: 200 })
}
```

---

## 7. 권한 확인 (Server Actions)

```typescript
// app/actions/store-actions.ts
"use server"

import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export async function createStore(data: CreateStoreInput) {
  const { userId } = auth()

  if (!userId) {
    throw new Error('Unauthorized')
  }

  // 역할 확인
  const user = await prisma.user.findUnique({
    where: { id: userId },
  })

  if (user?.role !== 'MERCHANT') {
    throw new Error('Only merchants can create stores')
  }

  // 상점 생성
  const store = await prisma.store.create({
    data: {
      ...data,
      ownerId: userId,
    },
  })

  return store
}
```

---

## 8. 클라이언트 컴포넌트에서 사용

```tsx
"use client"

import { useUser, useAuth } from '@clerk/nextjs'
import { UserButton } from '@clerk/nextjs'

export function Header() {
  const { isSignedIn, user } = useUser()
  const { signOut } = useAuth()

  if (!isSignedIn) {
    return <a href="/sign-in">로그인</a>
  }

  return (
    <div>
      <p>{user.fullName}님 환영합니다</p>
      <UserButton afterSignOutUrl="/" />
    </div>
  )
}
```

---

## 9. 추가 설정

### 9.1. 전화번호 인증 (SMS)

Clerk Dashboard → User & Authentication → Phone:
- SMS Provider: Twilio (권장)
- 한국 번호: +82 지원

### 9.2. 소셜 로그인

**Google**:
- Clerk Dashboard → Social Connections → Google
- 자동 구성 (Clerk에서 제공)

**Kakao / Naver** (Custom OAuth):
1. Kakao/Naver Developers에서 앱 생성
2. Redirect URI: `https://your-domain.clerk.accounts.dev/v1/oauth_callback`
3. Clerk Dashboard → Social Connections → Add custom provider

---

## 10. 배포 시 주의사항

### 환경 변수 (Vercel)

```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_live_..."
CLERK_SECRET_KEY="sk_live_..."
CLERK_WEBHOOK_SECRET="whsec_..."
```

### 도메인 설정

Clerk Dashboard → Domains:
- Production: `marketsphere.com`
- Development: `localhost:3000`

---

## 11. Prisma 스키마 업데이트

기존 NextAuth 테이블 제거:

```prisma
// 삭제: Account, Session, VerificationToken 모델
// Clerk가 인증을 자체 관리하므로 불필요
```

마이그레이션:

```bash
npx prisma migrate dev --name switch-to-clerk
```

---

## 12. 참고 자료

- [Clerk Documentation](https://clerk.com/docs)
- [Clerk Next.js Quickstart](https://clerk.com/docs/quickstarts/nextjs)
- [Clerk + Prisma Integration](https://clerk.com/docs/integrations/databases/prisma)

---

**완료 체크리스트**:
- [ ] Clerk 프로젝트 생성
- [ ] API 키 환경 변수 설정
- [ ] Webhook 엔드포인트 구현
- [ ] Prisma User 테이블 수정
- [ ] 마이그레이션 실행
- [ ] 로그인/회원가입 테스트
- [ ] 역할(Role) 설정 테스트

---

**작성자**: PM John
**최종 업데이트**: 2025년 10월 29일
