# 상인회 통제 구조 아키텍처 검증

**작성일**: 2025년 10월 29일
**목적**: 상인회 중심의 도메인 및 통제 구조가 제대로 설계되었는지 검증

---

## 1. 요구사항 분석

### 핵심 요구사항

- **상인회가 각 시장의 도메인을 소유하고 통제**
- 개별 상공인은 시장 도메인 하위의 **서브도메인**으로 할당
- 상인회가 소속 상공인을 승인/관리하는 구조

### 계층 구조

```
MarketSphere Platform (플랫폼)
  └── 상인회 (Merchant Association)
       └── 시장 (Market) + 도메인 소유
            └── 상공인 (Merchant) - 서브도메인
```

---

## 2. 도메인 구조 설계

### 현재 설계 (US-1.1)

```
김밥천국.망원시장.marketsphere.com
[상점명].[시장명].marketsphere.com
```

### 문제점 분석

이 구조는 **기술적으로는 작동하지만**, 상인회의 **도메인 소유권**이 명확하지 않습니다.

### 권장 구조 (Option A): 시장별 독립 도메인

```
김밥천국.망원시장.com
[상점명].[시장도메인]
```

**장점**:

- 상인회가 `망원시장.com` 도메인을 직접 소유
- 브랜딩 강화 (각 시장이 독립적 브랜드)
- 상인회의 통제권 명확화

**단점**:

- 시장마다 도메인 구매 필요 (연 15,000원 × 14개 = 21만 원)
- DNS 관리 복잡도 증가

### 대안 구조 (Option B): 플랫폼 도메인 + 서브도메인

```
김밥천국.망원시장.marketsphere.com
[상점명].[시장명].marketsphere.com
```

**장점**:

- 도메인 구매 비용 절감
- 통합 DNS 관리 용이
- MarketSphere 브랜드 통일성

**단점**:

- 상인회가 도메인을 직접 소유하지 않음
- 시장별 독립성 약화

### 추천 방안 (Hybrid): 선택 가능

```
기본: [상점명].[시장명].marketsphere.com (무료)
프리미엄: [상점명].[시장도메인] (상인회가 도메인 소유)
```

**구현**:

- MVP: Option B (플랫폼 서브도메인)
- V2: Option A 추가 (상인회가 원하면 독립 도메인 지원)

---

## 3. 데이터베이스 스키마 - 상인회 통제 구조

### 현재 설계 문제점

US-1.1의 `stores` 테이블에는 `market_id`만 있고, **상인회와의 관계**가 명시되지 않음.

### 개선된 스키마

#### 3.1. merchant_associations (상인회 테이블)

```sql
CREATE TABLE merchant_associations (
  association_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  president_name VARCHAR(50),
  contact_phone VARCHAR(15),
  email VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### 3.2. markets (시장 테이블) - 개선

```sql
CREATE TABLE markets (
  market_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  market_name VARCHAR(100) NOT NULL,
  association_id UUID REFERENCES merchant_associations(association_id) ON DELETE CASCADE,

  -- 도메인 설정
  domain_type VARCHAR(20) NOT NULL DEFAULT 'subdomain', -- 'subdomain' or 'custom'
  custom_domain VARCHAR(100) UNIQUE, -- 예: 망원시장.com
  subdomain_prefix VARCHAR(50) UNIQUE NOT NULL, -- 예: mangwon-market

  -- 위치 정보
  address TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),

  -- 통계
  total_stores INT DEFAULT 0,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  CONSTRAINT check_domain CHECK (
    (domain_type = 'subdomain' AND subdomain_prefix IS NOT NULL) OR
    (domain_type = 'custom' AND custom_domain IS NOT NULL)
  )
);

CREATE INDEX idx_markets_association ON markets(association_id);
CREATE INDEX idx_markets_domain ON markets(custom_domain);
CREATE INDEX idx_markets_subdomain ON markets(subdomain_prefix);
```

#### 3.3. stores (상점 테이블) - 개선

```sql
CREATE TABLE stores (
  store_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_name VARCHAR(50) NOT NULL,
  market_id UUID REFERENCES markets(market_id) ON DELETE CASCADE,

  -- 서브도메인
  subdomain VARCHAR(50) NOT NULL, -- 예: kimbapchunguk
  full_domain VARCHAR(150) GENERATED ALWAYS AS (
    CASE
      WHEN (SELECT domain_type FROM markets WHERE market_id = stores.market_id) = 'custom'
      THEN subdomain || '.' || (SELECT custom_domain FROM markets WHERE market_id = stores.market_id)
      ELSE subdomain || '.' || (SELECT subdomain_prefix FROM markets WHERE market_id = stores.market_id) || '.marketsphere.com'
    END
  ) STORED,

  -- 승인 상태 (상인회 통제)
  approval_status VARCHAR(20) NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'rejected', 'suspended'
  approved_at TIMESTAMP,
  approved_by UUID REFERENCES users(user_id), -- 상인회 관리자

  -- 상점 정보
  category VARCHAR(20) NOT NULL,
  location VARCHAR(100),
  phone VARCHAR(15) NOT NULL,
  hours JSONB,
  photo_url TEXT,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  UNIQUE(market_id, subdomain) -- 같은 시장 내에서 서브도메인 중복 방지
);

CREATE INDEX idx_stores_market ON stores(market_id);
CREATE INDEX idx_stores_approval ON stores(approval_status);
CREATE INDEX idx_stores_full_domain ON stores(full_domain);
```

#### 3.4. association_admins (상인회 관리자 테이블)

```sql
CREATE TABLE association_admins (
  admin_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
  association_id UUID REFERENCES merchant_associations(association_id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL DEFAULT 'admin', -- 'president', 'admin', 'manager'
  permissions JSONB, -- 세부 권한 설정
  created_at TIMESTAMP DEFAULT NOW(),

  UNIQUE(user_id, association_id)
);

CREATE INDEX idx_association_admins ON association_admins(association_id);
```

---

## 4. 접근 통제 (Access Control) 설계

### 4.1. 상인회 관리자 권한

| 권한            | 설명                         | API                                                   |
| --------------- | ---------------------------- | ----------------------------------------------------- |
| **상점 승인**   | 신규 상점 가입 승인/거부     | `POST /api/v1/admin/stores/{storeId}/approve`         |
| **상점 정지**   | 위반 상점 영업 정지          | `POST /api/v1/admin/stores/{storeId}/suspend`         |
| **도메인 관리** | 시장 도메인 설정 변경        | `PUT /api/v1/admin/markets/{marketId}/domain`         |
| **통계 조회**   | 시장 전체 매출/방문자 데이터 | `GET /api/v1/admin/markets/{marketId}/stats`          |
| **공지 발송**   | 시장 전체 푸시 알림          | `POST /api/v1/admin/markets/{marketId}/notifications` |

### 4.2. 상점주 권한 제한

| 제한 사항                 | 이유             |
| ------------------------- | ---------------- |
| 서브도메인 임의 변경 불가 | 상인회 승인 필요 |
| 시장 이탈 불가            | 상인회 계약 관계 |
| 승인 전 페이지 비공개     | 품질 관리        |

### 4.3. 승인 프로세스

```
1. 상점주가 가입 신청
   ├─ 기본 정보 입력
   └─ approval_status = 'pending'

2. 상인회 관리자 대시보드에 알림
   └─ 신규 가입 승인 요청

3. 상인회 관리자가 검토
   ├─ 승인 → approval_status = 'approved', 페이지 활성화
   └─ 거부 → approval_status = 'rejected', 이유 통보

4. 승인 후 상점 페이지 공개
   └─ full_domain으로 접속 가능
```

---

## 5. API 설계 - 상인회 통제 반영

### 5.1. 상점 생성 API (수정)

**Endpoint**: `POST /api/v1/stores`

**Request**:

```json
{
  "storeName": "김밥천국",
  "marketId": "mangwon-market-uuid",
  "category": "분식",
  "location": "3번 게이트",
  "phone": "010-1234-5678",
  "hours": {
    "open": "09:00",
    "close": "20:00",
    "closedDays": ["일요일"]
  }
}
```

**Response**:

```json
{
  "storeId": "store-uuid-1234",
  "approvalStatus": "pending",
  "subdomain": "kimbapchunguk",
  "fullDomain": "kimbapchunguk.mangwon.marketsphere.com",
  "message": "가입 신청이 완료되었습니다. 망원시장 상인회의 승인을 기다려주세요.",
  "estimatedApprovalTime": "1~2영업일"
}
```

### 5.2. 상인회 승인 API (신규)

**Endpoint**: `POST /api/v1/admin/stores/{storeId}/approve`

**Authorization**: 상인회 관리자만 가능

**Request**:

```json
{
  "action": "approve", // 'approve' or 'reject'
  "reason": "상인회 회원 확인 완료" // 거부 시 필수
}
```

**Response**:

```json
{
  "storeId": "store-uuid-1234",
  "approvalStatus": "approved",
  "approvedAt": "2025-10-29T15:30:00Z",
  "approvedBy": "admin-uuid-5678",
  "message": "상점이 승인되었습니다."
}
```

### 5.3. 시장 도메인 설정 API (신규)

**Endpoint**: `PUT /api/v1/admin/markets/{marketId}/domain`

**Authorization**: 상인회 회장 또는 플랫폼 관리자

**Request**:

```json
{
  "domainType": "custom", // 'subdomain' or 'custom'
  "customDomain": "망원시장.com"
}
```

**Response**:

```json
{
  "marketId": "mangwon-market-uuid",
  "domainType": "custom",
  "customDomain": "망원시장.com",
  "dnsRecords": [
    {
      "type": "CNAME",
      "host": "망원시장.com",
      "value": "proxy.marketsphere.com"
    },
    {
      "type": "CNAME",
      "host": "*.망원시장.com",
      "value": "proxy.marketsphere.com"
    }
  ],
  "message": "DNS 레코드를 설정한 후 인증을 진행하세요."
}
```

---

## 6. 상인회 대시보드 기능 (Epic 2 연계)

### 6.1. 핵심 기능

#### 상점 관리

- [ ] 신규 가입 승인/거부
- [ ] 상점 목록 조회 (필터: 승인/대기/정지)
- [ ] 상점 상세 정보 확인
- [ ] 상점 정지/복구

#### 도메인 관리

- [ ] 현재 도메인 설정 확인
- [ ] 독립 도메인 신청 (프리미엄)
- [ ] DNS 설정 가이드

#### 통계 대시보드

- [ ] 시장 전체 매출 (일/주/월)
- [ ] 상점별 매출 순위
- [ ] 방문자 수 (앱 사용자)
- [ ] 히트맵 (인기 구역)

#### 공동 마케팅

- [ ] 시장 전체 푸시 알림 발송
- [ ] 공동 구매 이벤트 설정
- [ ] 포인트 프로모션 관리

---

## 7. 권한 매트릭스

| 기능           | 플랫폼 관리자 | 상인회 회장 | 상인회 관리자 | 상점주      |
| -------------- | ------------- | ----------- | ------------- | ----------- |
| 시장 생성      | ✅            | ❌          | ❌            | ❌          |
| 도메인 설정    | ✅            | ✅          | ❌            | ❌          |
| 상점 승인      | ✅            | ✅          | ✅            | ❌          |
| 상점 정지      | ✅            | ✅          | ✅            | ❌          |
| 통계 조회      | ✅            | ✅          | ✅            | 본인만      |
| 상점 정보 수정 | ✅            | ✅          | ✅            | 본인만      |
| 푸시 발송      | ✅            | ✅          | ✅            | 본인 단골만 |

---

## 8. 보안 고려사항

### 8.1. 도메인 인증

- 독립 도메인 사용 시 **DNS TXT 레코드**로 소유권 인증 필수
- 예: `marketsphere-verify=abc123def456`

### 8.2. 접근 제어

- JWT 토큰에 `role`, `associationId`, `marketId` 포함
- 모든 API에서 권한 검증 미들웨어 적용

### 8.3. 감사 로그

- 상점 승인/거부/정지 모든 액션 로그 기록
- 누가(who), 언제(when), 무엇을(what), 왜(why)

---

## 9. 마이그레이션 계획

### Phase 1 (MVP): 기본 구조

- 플랫폼 서브도메인만 지원 (`[상점].[시장].marketsphere.com`)
- 상인회 승인 프로세스 구현
- 기본 대시보드

### Phase 2 (V1): 독립 도메인 지원

- 상인회가 독립 도메인 신청 가능
- DNS 자동 설정 가이드
- 프리미엄 기능 (월 50,000원)

### Phase 3 (V2): 고급 통제

- 상점별 세부 권한 설정
- 상인회별 맞춤 정책 (예: 승인 자동화)
- 다단계 승인 워크플로우

---

## 10. 검증 결과

### ✅ 잘된 점

1. 데이터베이스에 `market_id` FK로 계층 구조 반영됨
2. 서브도메인 구조 설계 (`[상점].[시장].marketsphere.com`)

### ⚠️ 개선 필요

1. **상인회 테이블 누락** → `merchant_associations` 테이블 추가 필요
2. **승인 프로세스 미정의** → `approval_status` 필드 및 API 추가 필요
3. **권한 관리 부재** → 상인회 관리자 권한 시스템 구현 필요
4. **도메인 소유권 불명확** → 독립 도메인 옵션 제공 검토

### 🎯 권장 조치

1. **즉시 (Sprint 1)**:
   - `merchant_associations`, `association_admins` 테이블 추가
   - `stores.approval_status` 필드 추가
   - 상점 승인 API 구현

2. **단기 (Sprint 2-3)**:
   - 상인회 대시보드 개발
   - 승인 프로세스 UI/UX 구현
   - 권한 미들웨어 적용

3. **중기 (V1)**:
   - 독립 도메인 옵션 제공
   - DNS 자동 설정 시스템
   - 고급 통계 대시보드

---

## 11. 최종 권장 아키텍처

```
┌─────────────────────────────────────────────────┐
│ MarketSphere Platform                            │
├─────────────────────────────────────────────────┤
│                                                  │
│  ┌───────────────────────────────────────────┐  │
│  │ 상인회: 망원시장 상인회                      │  │
│  │ Domain: mangwon.marketsphere.com (기본)     │  │
│  │         또는 망원시장.com (프리미엄)         │  │
│  ├───────────────────────────────────────────┤  │
│  │                                            │  │
│  │  상점 1: kimbap.mangwon.marketsphere.com   │  │
│  │  상점 2: fruit.mangwon.marketsphere.com    │  │
│  │  상점 3: fish.mangwon.marketsphere.com     │  │
│  │  ...                                       │  │
│  │                                            │  │
│  │  [상인회 관리자] ─→ 승인/거부/정지          │  │
│  │                                            │  │
│  └───────────────────────────────────────────┘  │
│                                                  │
│  ┌───────────────────────────────────────────┐  │
│  │ 상인회: 광장시장 상인회                      │  │
│  │ Domain: gwangjang.marketsphere.com          │  │
│  └───────────────────────────────────────────┘  │
│                                                  │
└─────────────────────────────────────────────────┘
```

---

**결론**: 현재 설계는 **기술적 구조는 양호**하나, **상인회의 통제 권한이 명시적으로 반영되지 않았습니다**. 위 권장사항을 반영하여 상인회 중심의 통제 구조를 강화해야 합니다.

---

**작성자**: PM John
**검토 필요**: 개발팀, 상인회 대표
**다음 액션**: Sprint 1에 테이블 스키마 수정 반영
