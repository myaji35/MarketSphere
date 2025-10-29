# 토스페이먼츠 구독 결제 설정 가이드

**작성일**: 2025년 10월 29일
**목적**: 상공인(상점주) 구독형 결제 시스템 구현

---

## 1. 토스페이먼츠 회원가입 및 프로젝트 생성

1. [토스페이먼츠 개발자센터](https://developers.tosspayments.com/) 접속
2. 회원가입 및 로그인
3. "내 애플리케이션" → "새 애플리케이션" 생성
4. 애플리케이션 이름: `MarketSphere`

---

## 2. API 키 발급

### 테스트 모드 (개발)

**대시보드 → API 키**에서:
- **클라이언트 키** (공개키): `test_ck_...`
- **시크릿 키** (비밀키): `test_sk_...`

`.env.local`에 추가:
```bash
NEXT_PUBLIC_TOSS_CLIENT_KEY="test_ck_..."
TOSS_SECRET_KEY="test_sk_..."
```

### 실제 운영 모드

사업자 등록 후 실제 계약 체결:
- 실 클라이언트 키: `live_ck_...`
- 실 시크릿 키: `live_sk_...`

---

## 3. 구독 플랜 정의

| 플랜 | 가격 | 주요 기능 |
|------|------|----------|
| **기본** | 월 10,000원 | AI 콘텐츠 생성, 푸시 알림, 기본 챗봇, 월 100건 AI 생성 |
| **프리미엄** | 월 20,000원 | 기본 + 고급 AI, 광고 자동 집행, 무제한 AI 생성, 우선 지원 |

---

## 4. 구독 결제 플로우

### 4.1. 빌링키 발급 (자동결제 등록)

```
1. 고객이 구독 플랜 선택
   └─ 기본 (10,000원/월) 또는 프리미엄 (20,000원/월)

2. 토스페이먼츠 결제 위젯 표시
   └─ 카드 정보 입력 (카드 번호, 유효기간, 비밀번호 앞 2자리 등)

3. 카드 인증 (authKey 발급)
   └─ 토스페이먼츠가 카드 유효성 검증

4. 서버에서 빌링키 발급 요청
   POST /v1/billing/authorizations/issue
   └─ customerKey: Clerk User ID
   └─ authKey: 카드 인증키

5. 빌링키 발급 성공
   └─ billingKey: "BIL_..." 형식

6. 첫 결제 실행
   POST /v1/billing/{billingKey}
   └─ 구독 시작 즉시 첫 달 결제

7. DB에 구독 정보 저장
   └─ Subscription 테이블 생성
   └─ status: ACTIVE
   └─ nextBillingDate: 다음 달 같은 날
```

### 4.2. 정기 결제 (매월 자동)

```
1. Cron Job 실행 (매일 오전 9시)
   └─ /api/cron/billing

2. 오늘이 결제일인 구독 조회
   └─ nextBillingDate <= 오늘

3. 각 구독별 자동 결제
   POST /v1/billing/{billingKey}
   └─ 저장된 빌링키로 카드 자동 결제

4. 결제 성공
   └─ Payment 테이블에 기록
   └─ nextBillingDate += 1개월

5. 결제 실패
   └─ 재시도 (최대 3회)
   └─ 실패 시 구독 상태: FAILED
   └─ 고객에게 이메일/푸시 알림
```

### 4.3. 구독 취소

```
1. 고객이 구독 취소 요청
   └─ "구독 취소" 버튼 클릭

2. 빌링키 삭제 요청
   DELETE /v1/billing/authorizations/{billingKey}

3. DB 업데이트
   └─ status: CANCELLED
   └─ cancelledAt: 현재 시각

4. 다음 결제일까지 서비스 이용 가능
   └─ 즉시 차단 X, endDate까지 유지
```

---

## 5. Prisma 스키마

이미 `/prisma/schema.prisma`에 구현됨:

```prisma
model Subscription {
  id                String            @id @default(uuid())
  userId            String            // Clerk User ID
  storeId           String?           // 상점 연결
  plan              SubscriptionPlan  // BASIC, PREMIUM
  status            SubscriptionStatus // PENDING, ACTIVE, CANCELLED, EXPIRED, FAILED
  billingKey        String?           @unique
  customerKey       String
  startDate         DateTime?
  endDate           DateTime?
  nextBillingDate   DateTime?
  amount            Int               // 월 결제 금액
  cancelledAt       DateTime?
  cancelReason      String?
  // ...
}

model Payment {
  id                String          @id @default(uuid())
  subscriptionId    String
  userId            String
  paymentKey        String          @unique
  orderId           String          @unique
  amount            Int
  method            String?
  status            PaymentStatus   // PENDING, DONE, CANCELLED, FAILED
  requestedAt       DateTime
  approvedAt        DateTime?
  failReason        String?
  // ...
}
```

---

## 6. API 구현 (Server Actions)

### 6.1. 구독 생성

`app/actions/subscription-actions.ts`:

```typescript
export async function createSubscription(data: {
  plan: 'BASIC' | 'PREMIUM'
  authKey: string // 토스페이먼츠 카드 인증키
  storeId?: string
}) {
  // 1. 빌링키 발급
  const billingKeyResponse = await issueBillingKey({
    customerKey: userId,
    authKey: data.authKey,
  })

  // 2. 구독 생성 (DB)
  const subscription = await prisma.subscription.create({ ... })

  // 3. 첫 결제
  const paymentResponse = await chargeBilling({
    billingKey,
    amount: 10000 or 20000,
    orderId: `order_${uuid()}`,
    orderName: 'MarketSphere 기본 구독 (첫 결제)',
  })

  // 4. 구독 활성화
  await prisma.subscription.update({
    where: { id: subscription.id },
    data: { status: 'ACTIVE' },
  })
}
```

### 6.2. 정기 결제 Cron Job

`app/api/cron/billing/route.ts`:

```typescript
export async function GET(request: NextRequest) {
  // Authorization 헤더 검증
  if (authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  await processBillingCycle()
}
```

`app/actions/subscription-actions.ts`:

```typescript
export async function processBillingCycle() {
  // 오늘 결제일인 활성 구독 조회
  const subscriptions = await prisma.subscription.findMany({
    where: {
      status: 'ACTIVE',
      nextBillingDate: { lte: new Date() },
    },
  })

  // 각 구독별 자동 결제
  for (const subscription of subscriptions) {
    await chargeBilling({
      billingKey: subscription.billingKey!,
      amount: subscription.amount,
      orderId: `order_${uuid()}`,
    })
  }
}
```

---

## 7. Vercel Cron 설정

`vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/billing",
      "schedule": "0 9 * * *"
    }
  ]
}
```

**스케줄**: 매일 오전 9시 (KST)

**주의**: Vercel Cron은 Pro 플랜 이상에서만 사용 가능

### 대안: 외부 Cron 서비스

무료 옵션:
- **cron-job.org** (무료)
- **EasyCron** (무료 티어)

설정:
```
URL: https://your-domain.com/api/cron/billing
Method: GET
Header: Authorization: Bearer your-cron-secret
Schedule: 0 9 * * * (매일 오전 9시)
```

---

## 8. Webhook 설정 (실시간 이벤트)

토스페이먼츠 대시보드 → Webhook:

**Webhook URL**: `https://your-domain.com/api/webhooks/toss`

**이벤트**:
- ✅ `PAYMENT_CONFIRMED` (결제 승인)
- ✅ `PAYMENT_CANCELLED` (결제 취소)

**구현**: `app/api/webhooks/toss/route.ts`

---

## 9. 테스트 카드 번호 (개발 모드)

| 카드사 | 카드 번호 | 결과 |
|--------|----------|------|
| 성공 | `5294-0100-0000-0003` | 결제 성공 |
| 실패 (잔액 부족) | `5294-0100-0000-0011` | 결제 실패 |
| 실패 (한도 초과) | `5294-0100-0000-0029` | 결제 실패 |

**유효기간**: 아무거나 (미래 날짜)
**비밀번호**: 앞 2자리 아무거나

---

## 10. 보안 고려사항

### 10.1. 시크릿 키 보호
- `.env.local`에만 저장 (Git 커밋 금지)
- Vercel 환경 변수에만 설정
- 클라이언트에서 절대 노출 금지

### 10.2. Cron Job 보안
```typescript
const authHeader = request.headers.get('authorization')
const CRON_SECRET = process.env.CRON_SECRET

if (authHeader !== `Bearer ${CRON_SECRET}`) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}
```

### 10.3. Webhook 검증
토스페이먼츠는 Webhook 서명 검증 제공 (선택 구현)

---

## 11. 환경 변수 전체 목록

```bash
# Toss Payments
NEXT_PUBLIC_TOSS_CLIENT_KEY="test_ck_..."
TOSS_SECRET_KEY="test_sk_..."
NEXT_PUBLIC_TOSS_SUCCESS_URL="http://localhost:3000/payment/success"
NEXT_PUBLIC_TOSS_FAIL_URL="http://localhost:3000/payment/fail"

# Cron Job 보안
CRON_SECRET="your-random-secret-key"
```

---

## 12. 실제 운영 전환 체크리스트

- [ ] 사업자 등록증 제출 (토스페이먼츠)
- [ ] 정산 계좌 등록
- [ ] 실제 API 키 발급 (`live_ck_...`, `live_sk_...`)
- [ ] 환경 변수 변경 (Vercel Production)
- [ ] Webhook URL 변경 (프로덕션 도메인)
- [ ] 결제 테스트 (실제 카드)
- [ ] 정기 결제 Cron 동작 확인
- [ ] 고객 센터 연락처 등록

---

## 13. 참고 문서

- [토스페이먼츠 공식 문서](https://docs.tosspayments.com/)
- [빌링키 발급 가이드](https://docs.tosspayments.com/guides/billing)
- [정기 결제 구현 가이드](https://docs.tosspayments.com/guides/subscription)
- [Webhook 가이드](https://docs.tosspayments.com/guides/webhook)

---

**작성자**: PM John
**최종 업데이트**: 2025년 10월 29일
