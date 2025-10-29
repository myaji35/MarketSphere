# User Story 1.2: AI 콘텐츠 생성

**Story ID**: US-1.2
**Epic**: Epic 1 - 소상공인 핵심 기능
**Feature**: 1.2.1 - AI 콘텐츠 생성 엔진
**Priority**: P0 (최우선) ⭐ 핵심 차별점
**Story Points**: 13
**Sprint**: Sprint 2-3 (MVP)

---

## User Story

**As a** 전통시장 소상공인
**I want to** 상품 사진 1장만 업로드하면 AI가 자동으로 매력적인 홍보 문구와 해시태그를 만들어주길 원한다
**So that** 마케팅 글쓰기에 시간을 쓰지 않고 본업인 장사에만 집중할 수 있다.

---

## Acceptance Criteria

### AC-1: 사진 업로드 UI
- [ ] "상품 등록" 버튼 클릭 시 카메라/갤러리 선택
- [ ] 사진 촬영 또는 기존 사진 선택 가능
- [ ] 사진 미리보기 표시 (업로드 전)
- [ ] 최대 파일 크기: 10MB
- [ ] 지원 형식: JPG, PNG, HEIC
- [ ] "AI 홍보 문구 생성" 버튼 (큰 글씨, 눈에 띄는 색상)

### AC-2: AI 콘텐츠 생성 엔진
- [ ] **입력**: 상품 사진 1장
- [ ] **출력**:
  - 홍보 문구 (50~100자, 전통시장 특유의 따뜻한 톤)
  - 해시태그 5~10개 (#신선한 #당일배송 #망원시장 등)
  - SNS 게시물 완성본 (문구 + 해시태그)
- [ ] **처리 시간**: 5초 이내
- [ ] **품질 목표**: 소상공인 만족도 85% 이상

### AC-3: AI 분석 과정 시각화
- [ ] 로딩 애니메이션 표시 (분석 중...)
- [ ] 진행 상태 텍스트:
  - "상품 이미지 분석 중..."
  - "매력적인 문구 생성 중..."
  - "해시태그 추천 중..."
- [ ] 완료 시 애니메이션 (체크 마크 ✓)

### AC-4: 생성 결과 편집 기능
- [ ] 생성된 문구 수정 가능 (텍스트 에디터)
- [ ] 해시태그 추가/삭제 가능
- [ ] "다시 생성" 버튼 (다른 버전 생성)
- [ ] "저장" 버튼 (상품 정보에 저장)
- [ ] "SNS 공유" 버튼 (인스타그램, 페이스북 연동)

### AC-5: 생성 품질 검증
- [ ] 부적절한 표현 필터링 (욕설, 과장 광고 등)
- [ ] 업종별 맞춤 톤앤매너 (청과 vs 정육 vs 수산)
- [ ] 계절 반영 (여름 → "시원한", 겨울 → "따뜻한")
- [ ] 시장 이름 자동 포함 (#망원시장)

---

## Technical Notes

### AI Architecture

#### Vision AI (이미지 분석)
- **모델**: GPT-4 Vision API 또는 Claude 3 Vision
- **분석 항목**:
  - 상품 종류 인식 (과일, 채소, 고기, 생선 등)
  - 색상 추출 (빨간 사과, 푸른 채소)
  - 신선도 평가 (윤기, 색감)
  - 분위기 파악 (풍성함, 신선함)

#### LLM (텍스트 생성)
- **모델**: GPT-4 또는 Claude 3 Sonnet
- **프롬프트 엔지니어링**:
```
당신은 전통시장 소상공인을 위한 마케팅 전문가입니다.
아래 이미지를 분석하고, 따뜻하고 친근한 톤으로 홍보 문구를 작성하세요.

이미지: {vision_analysis_result}
상점 정보: {store_name}, {category}, {market_name}
현재 날씨: {weather_data}
현재 시간: {time_of_day}

요구사항:
1. 50~100자 이내
2. 이모지 1~2개 사용 (🍎, 🥬 등)
3. 가격이나 할인이 있다면 강조
4. 전통시장 특유의 인간미 있는 표현
5. 해시태그 5~10개 (상품, 시장, 특징)

출력 형식:
{
  "description": "홍보 문구",
  "hashtags": ["#태그1", "#태그2", ...],
  "full_post": "문구 + 해시태그"
}
```

### API Implementation

**기술 스택**:
- Next.js 14+ API Route 또는 Server Action
- OpenAI API (GPT-4 Vision)
- Prisma (PostgreSQL)
- TypeScript

**Endpoint**: `POST /app/api/v1/products/generate-content/route.ts`

**Server Action 예시** (권장):
```typescript
// app/actions/ai-actions.ts
"use server"

import { openai } from "@/lib/openai"
import { prisma } from "@/lib/prisma"

export async function generateProductContent(imageUrl: string, storeId: string) {
  // Vision AI 분석
  const visionResult = await openai.chat.completions.create({
    model: "gpt-4-vision-preview",
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: "이 상품을 분석하고 매력적인 홍보 문구를 작성하세요" },
          { type: "image_url", image_url: { url: imageUrl } }
        ]
      }
    ],
  })

  // LLM 콘텐츠 생성
  const content = await generateMarketingContent(visionResult)

  return {
    description: content.description,
    hashtags: content.hashtags,
    fullPost: content.fullPost,
  }
}
```

**Request**:
```json
{
  "storeId": "store-uuid-1234",
  "imageUrl": "https://s3.amazonaws.com/products/apple-001.jpg",
  "productType": "과일",
  "priceInfo": {
    "original": 10000,
    "discount": 8000
  }
}
```

**Response**:
```json
{
  "contentId": "content-uuid-5678",
  "description": "🍎 아침에 딴 청송 사과! 아삭하고 달콤해요~ 오늘만 20% 할인!",
  "hashtags": [
    "#청송사과",
    "#망원시장",
    "#신선한과일",
    "#당일수확",
    "#전통시장",
    "#건강간식"
  ],
  "fullPost": "🍎 아침에 딴 청송 사과! 아삭하고 달콤해요~ 오늘만 20% 할인!\n\n#청송사과 #망원시장 #신선한과일 #당일수확 #전통시장 #건강간식",
  "processingTime": 4.2,
  "confidence": 0.92
}
```

### Performance Optimization

#### 캐싱 전략 (70% API 비용 절감)
```javascript
// 유사 이미지 템플릿 재사용
const imageHash = computePerceptualHash(image);
const cachedContent = await redis.get(`content:${imageHash}`);

if (cachedContent && similarity > 0.85) {
  // 캐시된 템플릿 사용 + 상점명만 교체
  return customizeTemplate(cachedContent, storeInfo);
}

// 캐시 미스 → AI 호출
const aiResult = await generateWithAI(image);
await redis.set(`content:${imageHash}`, aiResult, { EX: 86400 }); // 24시간
return aiResult;
```

#### 배치 처리
- 야간 시간대(새벽 2~5시) 일괄 처리
- 실시간 요청: GPT-4 (빠름, 비쌈)
- 배치 처리: GPT-3.5 (느림, 저렴)

---

## Dependencies

### Must Have Before This Story
- [ ] GPT-4 또는 Claude API 계정 및 키 발급
- [ ] S3 이미지 업로드 기능 (US-1.1)
- [ ] Redis 캐시 서버 설정
- [ ] 업종별 템플릿 데이터 준비

### External Dependencies
- [ ] OpenAI API (또는 Claude API)
- [ ] 날씨 API (OpenWeather 등)

---

## Testing Checklist

### Unit Tests
- [ ] Vision AI 이미지 분석 정확도 (상품 인식률 90%+)
- [ ] 프롬프트 엔지니어링 품질 (10개 샘플 테스트)
- [ ] 캐싱 로직 (히트율 70% 이상)
- [ ] 부적절한 표현 필터링

### Integration Tests
- [ ] 전체 파이프라인 (이미지 업로드 → AI 생성 → 저장)
- [ ] API 응답 시간 (5초 이내)
- [ ] 에러 핸들링 (AI API 실패 시 재시도)

### Quality Assurance
- [ ] **파일럿 테스트**: 소상공인 10명, 각 5개 상품
- [ ] 만족도 설문 (목표: 85% 이상)
- [ ] 품질 비교: 스마트스토어 TOP 100 vs AI 생성 문구
- [ ] A/B 테스트: AI 문구 vs 수동 작성 (클릭률 비교)

### Performance Tests
- [ ] 동시 요청 처리 (50 req/sec)
- [ ] API 비용 모니터링 (월 예산 초과 방지)

---

## Definition of Done

- [ ] 모든 Acceptance Criteria 충족
- [ ] AI 생성 품질: 소상공인 만족도 85% 이상
- [ ] 응답 시간: 95%ile 5초 이내
- [ ] 파일럿 테스트 완료 (10명, 50개 상품)
- [ ] 캐싱 시스템 작동 (히트율 70%+)
- [ ] API 비용 최적화 (캐싱, 배치 처리)
- [ ] 코드 리뷰 완료
- [ ] 프로덕션 배포 완료
- [ ] 모니터링 대시보드 구축 (API 비용, 응답 시간, 품질 점수)

---

## Success Metrics

### 정량적 지표
- AI 생성 사용률: 80% 이상 (수동 작성 대비)
- 평균 생성 시간: 5초 이내
- 소상공인 만족도: 85% 이상
- 콘텐츠 수정률: 30% 이하 (대부분 그대로 사용)

### 정성적 지표
- "글쓰기 부담이 사라졌다" 피드백
- "AI가 나보다 잘 쓴다" 반응
- 네이버 스마트스토어 대비 우위 입증

---

## Risks & Mitigation

### Risk 1: AI 품질 미달
**Impact**: 높음
**Probability**: 중간
**Mitigation**:
- 파일럿 테스트로 사전 검증 (10명 × 3개월)
- 다중 LLM 전략 (GPT-4 실패 → Claude 3 백업)
- Fallback: 전문가 개입 (24시간 내)

### Risk 2: API 비용 초과
**Impact**: 높음
**Probability**: 중간
**Mitigation**:
- 캐싱으로 70% 절감
- 배치 처리 (야간 일괄)
- 모델 경량화 (GPT-3.5 활용)
- 월별 예산 알람 설정

### Risk 3: 응답 시간 초과
**Impact**: 중간
**Probability**: 낮음
**Mitigation**:
- 비동기 처리 (백그라운드)
- 로딩 애니메이션으로 체감 시간 단축
- 타임아웃 10초 설정

---

## Notes

### 차별점
- **네이버 스마트스토어**: 상점주가 직접 작성 (30분 소요)
- **MarketSphere**: AI 자동 생성 (5초 소요) → **360배 빠름**

### 향후 개선 (V2)
- 음성 입력 ("오늘 사과 3000원이야" → AI가 문구 생성)
- 경쟁사 가격 분석 연동 ("주변보다 20% 저렴" 자동 추가)
- 고객 반응 학습 (클릭률 높은 문구 스타일 학습)

---

**작성일**: 2025년 10월 29일
**담당 개발자**: AI/ML Engineer + Backend Developer
**QA 담당자**: QA Lead + 소상공인 10명 (파일럿)
**예상 완료일**: Sprint 2-3 종료 (4주 후)
