# User Story 0.1: 구독 결제 시스템

**Story ID**: US-0.1
**Epic**: Epic 0 - 비즈니스 모델 (수익화)
**Feature**: 구독형 결제 (토스페이먼츠)
**Priority**: P0 (최우선)
**Story Points**: 13
**Sprint**: Sprint 1-2 (MVP)

---

## User Story

**As a** 상공인 (상점주)
**I want to** 월 구독료를 간편하게 결제하고 자동으로 갱신되길 원한다
**So that** 서비스를 계속 사용하면서 결제를 신경 쓰지 않을 수 있다.

---

## Acceptance Criteria

### AC-1: 구독 플랜 선택
- [ ] 구독 플랜 선택 페이지 제공
  - 기본: 월 10,000원
  - 프리미엄: 월 20,000원
- [ ] 각 플랜의 기능 비교 표시
- [ ] "구독 시작" 버튼

### AC-2: 결제 정보 입력 (빌링키 발급)
- [ ] 토스페이먼츠 결제 위젯 표시
- [ ] 카드 정보 입력:
  - 카드 번호
  - 유효기간 (MM/YY)
  - 비밀번호 앞 2자리
  - CVC
- [ ] 개인정보 수집 동의 체크박스

### AC-3: 첫 결제 및 구독 시작
- [ ] 카드 인증 완료 후 빌링키 발급
- [ ] 즉시 첫 달 결제 실행
- [ ] **처리 시간**: 5초 이내
- [ ] 결제 성공 시:
  - 구독 상태: `ACTIVE`
  - 다음 결제일: 1개월 후
  - 영수증 이메일 발송
- [ ] 결제 실패 시:
  - 실패 사유 표시
  - 다시 시도 버튼

### AC-4: 구독 관리 대시보드
- [ ] 현재 구독 정보 표시:
  - 플랜 이름 (기본/프리미엄)
  - 월 결제 금액
  - 다음 결제일
  - 구독 시작일
- [ ] 결제 내역 조회 (최근 12개월)
- [ ] 구독 플랜 변경 버튼
- [ ] 구독 취소 버튼

### AC-5: 정기 결제 (자동)
- [ ] 매월 결제일에 자동 결제
- [ ] Cron Job 실행 (매일 오전 9시)
- [ ] 결제 성공 시:
  - Payment 레코드 생성
  - 다음 결제일 업데이트 (+1개월)
  - 영수증 이메일 발송
- [ ] 결제 실패 시:
  - 재시도 (최대 3회, 각 24시간 간격)
  - 3회 실패 시 구독 상태: `FAILED`
  - 결제 실패 알림 (이메일 + 푸시)

### AC-6: 구독 취소
- [ ] "구독 취소" 버튼 클릭
- [ ] 취소 사유 입력 (선택)
- [ ] 확인 팝업 표시
- [ ] 취소 처리:
  - 빌링키 삭제
  - 구독 상태: `CANCELLED`
  - 다음 결제일까지 서비스 유지
- [ ] 취소 확인 이메일 발송

---

## Technical Notes

### Frontend (Next.js 14+)

**구독 플랜 선택 페이지**:
```tsx
// app/(dashboard)/subscription/plans/page.tsx
"use client"

import { SUBSCRIPTION_PLANS } from '@/lib/toss'
import { Button } from '@/components/ui/button'

export default function PlansPage() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <PlanCard plan="BASIC" />
      <PlanCard plan="PREMIUM" />
    </div>
  )
}
```

**결제 위젯**:
```tsx
// app/(dashboard)/subscription/checkout/page.tsx
"use client"

import { useEffect, useRef } from 'react'
import { loadPaymentWidget } from '@tosspayments/payment-widget-sdk'

export default function CheckoutPage() {
  const paymentWidgetRef = useRef(null)

  useEffect(() => {
    ;(async () => {
      const paymentWidget = await loadPaymentWidget(
        process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY!,
        userId // Clerk User ID
      )

      paymentWidget.renderPaymentMethods('#payment-widget')
    })()
  }, [])

  const handlePayment = async () => {
    const authKey = await paymentWidget.requestBillingAuth('카드')

    // Server Action 호출
    const result = await createSubscription({
      plan: 'BASIC',
      authKey,
    })
  }

  return <div id="payment-widget" />
}
```

### Backend (Server Actions)

**app/actions/subscription-actions.ts** (이미 구현됨):
- `createSubscription()` - 구독 생성 및 첫 결제
- `cancelSubscription()` - 구독 취소
- `changeSubscriptionPlan()` - 플랜 변경
- `getCurrentSubscription()` - 현재 구독 조회
- `processBillingCycle()` - 정기 결제 (Cron)

### Cron Job

**Vercel Cron** (vercel.json):
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

**대안**: cron-job.org (무료)

---

## Dependencies

### Must Have Before This Story
- [ ] 토스페이먼츠 계정 생성 및 API 키 발급
- [ ] Prisma Subscription, Payment 테이블 마이그레이션 완료
- [ ] Clerk 인증 구현 (userId 필요)
- [ ] 이메일 발송 시스템 (영수증, 알림)

### External Dependencies
- [ ] 토스페이먼츠 API
- [ ] Vercel Cron (또는 외부 Cron 서비스)

---

## Testing Checklist

### Unit Tests
- [ ] `issueBillingKey()` 함수 테스트 (모킹)
- [ ] `chargeBilling()` 함수 테스트
- [ ] `createSubscription()` Server Action 테스트
- [ ] 가격 계산 로직 테스트

### Integration Tests
- [ ] 전체 구독 플로우 (플랜 선택 → 결제 → 활성화)
- [ ] 토스페이먼츠 API 실제 호출 (테스트 모드)
- [ ] 정기 결제 Cron Job 테스트
- [ ] 구독 취소 플로우

### E2E Tests
- [ ] 실제 브라우저에서 구독 시작 (테스트 카드)
- [ ] 결제 성공/실패 시나리오
- [ ] 구독 관리 페이지 접근
- [ ] 구독 취소 플로우

### Security Tests
- [ ] 시크릿 키 노출 여부 확인 (클라이언트)
- [ ] Cron Job Authorization 헤더 검증
- [ ] Webhook 서명 검증 (선택)

---

## Definition of Done

- [ ] 모든 Acceptance Criteria 충족
- [ ] 토스페이먼츠 테스트 카드로 결제 성공
- [ ] 정기 결제 Cron Job 정상 작동
- [ ] 구독 취소 정상 작동
- [ ] 코드 리뷰 완료
- [ ] 단위 테스트 커버리지 80% 이상
- [ ] E2E 테스트 통과
- [ ] 프로덕션 배포 (테스트 모드)
- [ ] 모니터링 대시보드 구축

---

## Success Metrics

### 정량적 지표
- 구독 전환율: 30% 이상 (가입 → 유료 전환)
- 결제 성공률: 95% 이상
- Cron Job 실행 성공률: 99% 이상
- 구독 유지율: 월 85% 이상

### 정성적 지표
- "결제가 간편했다" 피드백
- "자동 갱신이 편리하다" 만족도
- 결제 문의 감소

---

## Risks & Mitigation

### Risk 1: 결제 실패율 높음
**Impact**: 높음 (수익 직결)
**Probability**: 중간
**Mitigation**:
- 재시도 로직 (3회, 24시간 간격)
- 결제 실패 알림 (이메일 + 푸시)
- 카드 변경 UI 제공

### Risk 2: Cron Job 실행 실패
**Impact**: 높음
**Probability**: 낮음
**Mitigation**:
- 외부 Cron 서비스 백업 (cron-job.org)
- 실패 시 알람 (Slack, 이메일)
- 수동 실행 API 제공

### Risk 3: 토스페이먼츠 API 장애
**Impact**: 높음
**Probability**: 낮음
**Mitigation**:
- 재시도 로직 (exponential backoff)
- 장애 상황 모니터링
- 고객 공지 자동화

---

## Notes

### 비용 구조 (토스페이먼츠)
- 정기 결제 수수료: 약 2.5~3.5%
- 월 10,000원 × 3% = 300원 수수료
- 실제 수익: 9,700원/월

### 향후 개선 (V2)
- 연간 결제 옵션 (10개월 가격에 12개월)
- 무료 체험 (14일)
- 쿠폰 및 프로모션 코드
- 가족/팀 플랜 (다중 상점)

---

**작성일**: 2025년 10월 29일
**담당 개발자**: Backend Developer + Frontend Developer
**QA 담당자**: QA Lead
**예상 완료일**: Sprint 1-2 종료 (4주 후)
