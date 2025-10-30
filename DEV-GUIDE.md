# MarketSphere 개발 가이드

## 🚀 빠른 시작 (API 키 없이 화면 테스트)

중요 API 키 없이도 모든 화면을 테스트할 수 있습니다!

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

`.env` 파일이 이미 생성되어 있으며, **개발 모드가 활성화**되어 있습니다:

```env
# 개발 모드 활성화 (더미 데이터 사용)
NEXT_PUBLIC_DEV_MODE="true"
```

이 설정으로 다음 API 키들이 **없어도** 동작합니다:

- ❌ OPENAI_API_KEY (AI 기능 - 더미 데이터 사용)
- ❌ CLERK_SECRET_KEY (인증 - 더미 사용자로 자동 로그인)
- ❌ DATABASE_URL (PostgreSQL - 아래 3번 참조)

### 3. 데이터베이스 설정

개발용 PostgreSQL이 없다면 **건너뛰어도** 됩니다.
대신 화면만 테스트하려면:

```bash
# 데이터베이스 없이 실행 (UI 테스트만)
npm run dev
```

PostgreSQL이 있다면:

```bash
# Prisma 클라이언트 생성
npm run prisma:generate

# 마이그레이션 실행
npm run prisma:migrate

# 테스트 데이터 삽입
npm run prisma:seed
```

### 4. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 http://localhost:3000 접속

**⚠️ 참고**:

- 빌드 시 Prisma 연결 오류가 표시될 수 있지만 정상입니다
- 개발 서버(`npm run dev`)는 문제없이 실행됩니다
- 데이터베이스 없이도 화면 확인 가능합니다

## 📱 테스트 가능한 페이지

### 상점주 대시보드

```
http://localhost:3000/merchant
```

- ✅ 개발 모드: 더미 사용자로 자동 로그인
- ✅ 상점 현황 대시보드 확인
- ✅ 상품 관리 기능 테스트

### 상품 등록 (AI 콘텐츠 생성)

```
http://localhost:3000/merchant/products/new
```

- ✅ 개발 모드: OpenAI API 없이 더미 콘텐츠 생성
- 이미지 URL 입력 후 "AI 생성" 버튼 클릭
- 자동으로 홍보 문구 + 해시태그 생성됨

### 타임세일 생성

```
http://localhost:3000/merchant/timesales/new
```

- ✅ 개발 모드: 푸시 알림 시뮬레이션
- 버튼 클릭으로 타임세일 생성
- 단골 고객 알림 발송 (콘솔 로그로 확인)

### 상점 공개 페이지

```
http://localhost:3000/stores/kimbapchunguk
```

- ✅ 데이터베이스 없이도 레이아웃 확인 가능
- 시드 데이터가 있으면 실제 상품 표시

## 🔧 개발 모드 기능

개발 모드(`NEXT_PUBLIC_DEV_MODE="true"`)에서는:

### 1. AI 기능 - 더미 데이터 사용

```
✓ AI 콘텐츠 생성: 미리 정의된 홍보 문구 반환
✓ 이미지 보정 분석: 더미 분석 결과 반환
✓ 날씨 기반 마케팅: 더미 마케팅 메시지 생성
```

### 2. 인증 - 자동 로그인

```
✓ Clerk 설정 없이 더미 사용자로 자동 로그인
✓ userId: test_merchant_id_1
✓ 상점 데이터가 있으면 바로 대시보드 접근
```

### 3. 시각적 표시

```
🚧 개발 모드 - 더미 데이터로 테스트 중입니다
```

화면 상단에 노란색 배너로 개발 모드임을 표시

## 📦 프로덕션 모드 전환

실제 API를 사용하려면:

### 1. `.env` 파일 수정

```env
# 개발 모드 비활성화
NEXT_PUBLIC_DEV_MODE="false"

# 실제 API 키 설정
OPENAI_API_KEY="sk-your-actual-key"
CLERK_SECRET_KEY="sk_live_your-actual-key"
DATABASE_URL="postgresql://user:pass@host:5432/db"
```

### 2. Clerk 설정

1. https://clerk.com 회원가입
2. 새 애플리케이션 생성
3. API 키 복사:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - `CLERK_SECRET_KEY`

### 3. OpenAI API 설정

1. https://platform.openai.com 가입
2. API 키 생성
3. `.env`에 `OPENAI_API_KEY` 설정

## 🎯 테스트 시나리오

### 시나리오 1: 상품 등록 플로우

1. `/merchant/products/new` 접속
2. 상품명: "신선한 사과"
3. 가격: 5000원
4. 이미지 URL: `https://placehold.co/600x400/png?text=Apple`
5. "AI 생성" 버튼 클릭 → 자동으로 홍보 문구 생성
6. "상품 등록" 클릭

### 시나리오 2: 타임세일 생성

1. `/merchant/timesales/new` 접속
2. 제목: "사과 30% 할인"
3. 할인율: 30%
4. 시작/종료 시간 설정
5. "타임세일 시작" 클릭

### 시나리오 3: 상점 페이지 확인

1. `/stores/kimbapchunguk` 접속
2. 상품 목록 확인
3. 타임세일 배너 확인

## 🐛 문제 해결

### Q: 개발 모드인데도 인증 화면으로 이동해요

```bash
# .env 파일 확인
cat .env | grep DEV_MODE
# NEXT_PUBLIC_DEV_MODE="true" 인지 확인

# 서버 재시작
npm run dev
```

### Q: AI 생성이 안 돼요

```bash
# 콘솔 로그 확인
# "⚠️ OPENAI_API_KEY가 설정되지 않았습니다. 더미 데이터를 반환합니다."
# 메시지가 보이면 정상
```

### Q: 데이터베이스 연결 오류

```bash
# 개발 모드에서는 DB 없이도 UI 테스트 가능
# 단, 상품 등록/조회는 DB 필요

# PostgreSQL 없이 UI만 보려면:
# 1. /merchant 접속 → 레이아웃 확인
# 2. /merchant/products/new → 폼 UI 확인 (등록은 실패)
```

## 📚 추가 문서

- [PRD](./prd.md) - 제품 요구사항
- [README](./README.md) - 프로젝트 개요
- [Tech Stack](./docs/tech-stack.md) - 기술 스택

## 💡 팁

1. **빠른 화면 테스트**: DB 설정 없이 바로 `npm run dev`
2. **AI 기능 테스트**: 이미지 URL만 넣으면 더미 데이터로 체험 가능
3. **실제 데이터 테스트**: PostgreSQL 설정 후 `npm run prisma:seed`

---

Happy Coding! 🚀
