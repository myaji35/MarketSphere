# User Story 1.1: 상점 페이지 생성

**Story ID**: US-1.1
**Epic**: Epic 1 - 소상공인 핵심 기능
**Feature**: 1.1 - 원스톱 상점 페이지
**Priority**: P0 (최우선)
**Story Points**: 5
**Sprint**: Sprint 1 (MVP)

---

## User Story

**As a** 전통시장 소상공인 (신규 가입자)
**I want to** 5분 이내에 간단한 정보만 입력하면 내 상점 가입 신청이 완료되길 원한다
**So that** 복잡한 설정 없이 빠르게 상인회 승인을 받고 온라인 영업을 시작할 수 있다.

**참고**: 가입 신청 후 상인회의 승인이 필요합니다 (1~2영업일 소요 예상).

---

## Acceptance Criteria

### AC-1: 기본 정보 입력 폼

- [ ] 상점명 입력 필드 (필수, 2~30자)
- [ ] 업종 선택 드롭다운 (청과, 정육, 수산, 반찬 등 15개 카테고리)
- [ ] 위치 정보 입력 (시장명 선택 + 상점 위치)
- [ ] 연락처 입력 (전화번호, 필수)
- [ ] 영업시간 설정 (시작/종료 시간, 휴무일 선택)
- [ ] 상점 대표 사진 업로드 (선택)

### AC-2: 자동 서브도메인 생성

- [ ] 입력한 상점명 기반 서브도메인 자동 생성
  - 예: "김밥천국" 입력 → `김밥천국.망원시장.marketsphere.com`
- [ ] 한글 → 영문 자동 변환 (김밥천국 → kimbapchunguk)
- [ ] 중복 시 자동으로 숫자 부여 (kimbapchunguk2)
- [ ] 서브도메인 미리보기 표시

### AC-3: 가입 신청 완료

- [ ] 입력 완료 후 "가입 신청" 버튼 클릭
- [ ] 3초 이내 신청 완료
- [ ] 생성 예정 페이지 URL 표시 (예: `kimbapchunguk.mangwon.marketsphere.com`)
- [ ] 승인 대기 안내 메시지 표시
  - "가입 신청이 완료되었습니다"
  - "망원시장 상인회의 승인을 기다려주세요 (1~2영업일)"
  - "승인 완료 시 푸시 알림으로 알려드립니다"
- [ ] 승인 상태: `pending` (대기 중)

### AC-4: 상인회 승인 후 페이지 활성화

- [ ] 상인회 관리자가 상점 승인
- [ ] 승인 상태: `pending` → `approved`
- [ ] 상점주에게 푸시 알림 발송
- [ ] 상점 페이지 공개 (URL 접속 가능)
- [ ] 상점주 대시보드에 "승인 완료" 배지 표시

### AC-5: 모바일 최적화

- [ ] 모바일 화면에서 입력 폼 정상 작동
- [ ] 키보드 자동 올라오기 (입력 필드 선택 시)
- [ ] 큰 버튼 (최소 44x44px)
- [ ] 세로 스크롤로 모든 필드 접근 가능

### AC-6: 설정 시간 목표

- [ ] 전체 입력 프로세스 5분 이내 완료 가능
- [ ] 필수 필드만 입력 시 2분 이내 완료
- [ ] 진행률 표시 (1/5, 2/5... 완료)

---

## Technical Notes

### Frontend

- **Framework**: Next.js 14+ (App Router) + TypeScript
- **Styling**: Tailwind CSS 3+
- **UI Components**: shadcn/ui (Radix UI 기반)
- **Form Handling**: React Hook Form + Zod (스키마 검증)
- **Form Validation**:
  - 실시간 유효성 검사 (전화번호 형식 등)
  - 에러 메시지 한글로 명확히 표시
- **UX**:
  - 단계별 입력 (한 화면에 너무 많은 필드 X)
  - 자동 저장 (페이지 이탈 시 복구 가능)

**UI 컴포넌트 예시**:

```tsx
// components/forms/store-registration-form.tsx
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'

const storeSchema = z.object({
  storeName: z.string().min(2, '상점명은 2자 이상이어야 합니다').max(30),
  phone: z.string().regex(/^010-\d{4}-\d{4}$/, '올바른 전화번호 형식이 아닙니다'),
  // ...
})
```

### Backend

- **Framework**: Next.js 14+ API Routes
- **Authentication**: NextAuth.js v5
- **Database**: PostgreSQL 15+ (Supabase / Vercel Postgres)
- **ORM**: Prisma
- **API Endpoint**: `POST /app/api/v1/stores/route.ts`

**Server Action 예시** (권장):

```typescript
// app/actions/store-actions.ts
'use server'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function createStore(data: CreateStoreInput) {
  const session = await auth()
  if (!session) throw new Error('Unauthorized')

  const store = await prisma.store.create({
    data: {
      storeName: data.storeName,
      marketId: data.marketId,
      subdomain: generateSubdomain(data.storeName),
      approvalStatus: 'PENDING',
      // ...
    },
  })

  revalidatePath('/dashboard/stores')
  return { success: true, storeId: store.id }
}
```

- **Request Body**:

```json
{
  "storeName": "김밥천국",
  "category": "분식",
  "marketId": "mangwon-market",
  "location": "3번 게이트 근처",
  "phone": "010-1234-5678",
  "hours": {
    "open": "09:00",
    "close": "20:00",
    "closedDays": ["일요일"]
  },
  "photoUrl": "https://s3.amazonaws.com/..."
}
```

- **Response**:

```json
{
  "storeId": "store-uuid-1234",
  "subdomain": "kimbapchunguk",
  "fullDomain": "kimbapchunguk.mangwon.marketsphere.com",
  "approvalStatus": "pending",
  "message": "가입 신청이 완료되었습니다. 망원시장 상인회의 승인을 기다려주세요.",
  "estimatedApprovalTime": "1~2영업일",
  "createdAt": "2025-10-29T10:00:00Z"
}
```

### Database Schema

**merchant_associations 테이블**:

```sql
CREATE TABLE merchant_associations (
  association_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  president_name VARCHAR(50),
  contact_phone VARCHAR(15),
  created_at TIMESTAMP DEFAULT NOW()
);
```

**markets 테이블**:

```sql
CREATE TABLE markets (
  market_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  market_name VARCHAR(100) NOT NULL,
  association_id UUID REFERENCES merchant_associations(association_id),
  subdomain_prefix VARCHAR(50) UNIQUE NOT NULL, -- 예: mangwon
  address TEXT,
  total_stores INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**stores 테이블** (승인 프로세스 추가):

```sql
CREATE TABLE stores (
  store_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_name VARCHAR(50) NOT NULL,
  subdomain VARCHAR(50) NOT NULL, -- 예: kimbapchunguk
  market_id UUID REFERENCES markets(market_id) ON DELETE CASCADE,

  -- 승인 상태 (상인회 통제)
  approval_status VARCHAR(20) NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'rejected', 'suspended'
  approved_at TIMESTAMP,
  approved_by UUID REFERENCES users(user_id),
  rejection_reason TEXT,

  -- 상점 정보
  category VARCHAR(20) NOT NULL,
  location VARCHAR(100),
  phone VARCHAR(15) NOT NULL,
  hours JSONB,
  photo_url TEXT,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  UNIQUE(market_id, subdomain) -- 같은 시장 내 서브도메인 중복 방지
);

CREATE INDEX idx_stores_market_id ON stores(market_id);
CREATE INDEX idx_stores_subdomain ON stores(subdomain);
CREATE INDEX idx_stores_approval_status ON stores(approval_status);
```

**full_domain 계산 로직** (애플리케이션 레벨):

```javascript
function getFullDomain(store, market) {
  return `${store.subdomain}.${market.subdomain_prefix}.marketsphere.com`
}
// 예: kimbapchunguk.mangwon.marketsphere.com
```

---

## Dependencies

### Must Have Before This Story

- [ ] 상인회(Merchant Association) 데이터베이스 설정 완료
- [ ] 시장(Market) 데이터베이스 설정 완료 (association_id 포함)
- [ ] 업종 카테고리 마스터 데이터 입력
- [ ] S3 이미지 업로드 기능 구현
- [ ] 서브도메인 DNS 설정 (와일드카드 \*.marketsphere.com)

### Blockers

- 없음

---

## Testing Checklist

### Unit Tests

- [ ] 서브도메인 생성 로직 (한글 → 영문 변환)
- [ ] 중복 서브도메인 처리
- [ ] 전화번호 유효성 검사
- [ ] 영업시간 형식 검증

### Integration Tests

- [ ] 상점 가입 신청 API 정상 작동
- [ ] 데이터베이스 저장 확인 (approval_status = 'pending')
- [ ] 승인 전 페이지 접속 시 "승인 대기 중" 메시지 표시
- [ ] 승인 후 서브도메인 접속 가능 확인

### E2E Tests

- [ ] 신규 사용자 온보딩 플로우 (가입 → 상점 생성 → 페이지 확인)
- [ ] 모바일 기기에서 전체 프로세스 테스트 (iOS, Android)
- [ ] 5분 이내 완료 시나리오 검증

### UX Tests

- [ ] 소상공인 5명 대상 사용성 테스트
- [ ] 평균 완료 시간 측정 (목표: 5분 이내)
- [ ] 만족도 설문 (목표: 4.0/5.0 이상)

---

## Definition of Done

- [ ] 모든 Acceptance Criteria 충족
- [ ] 코드 리뷰 완료 (최소 2명)
- [ ] 단위 테스트 커버리지 80% 이상
- [ ] E2E 테스트 통과
- [ ] 모바일 기기 테스트 완료 (iOS 14+, Android 10+)
- [ ] 사용성 테스트 완료 (5분 이내 달성)
- [ ] 프로덕션 배포 완료
- [ ] 모니터링 알람 설정 (에러율, 응답 시간)

---

## Notes

### 참고 사항

- 네이버 스마트스토어는 초기 설정에 평균 30분 소요
- 우리는 5분 목표 → **6배 빠른 온보딩**
- 복잡한 결제/배송 설정 없음 (오프라인 거래 전제)
- **상인회 승인 프로세스**:
  - 목적: 시장 소속 상인 확인, 품질 관리
  - 소요 시간: 1~2영업일 (목표: 당일 처리)
  - 거부 사유: 시장 비소속, 중복 가입, 정보 불충분

### 향후 개선 사항 (V2)

- 음성 입력 기능 (영업시간 등)
- QR 코드로 위치 자동 입력
- 상점 템플릿 선택 (업종별 최적화)

---

**작성일**: 2025년 10월 29일
**담당 개발자**: TBD
**QA 담당자**: TBD
**예상 완료일**: Sprint 1 종료 (2주 후)
