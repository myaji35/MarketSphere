# ⚡ 빠른 시작 가이드

## 30초 안에 시작하기

```bash
npm install && npm run dev
```

끝! 🎉

브라우저에서 http://localhost:3000/merchant 접속하세요.

## ✅ 확인사항

### 1. 개발 모드 활성화 확인

`.env` 파일을 열어서 다음 줄이 있는지 확인:

```env
NEXT_PUBLIC_DEV_MODE="true"
```

이 설정으로:

- ✅ API 키 불필요
- ✅ 데이터베이스 선택적
- ✅ 자동 로그인

### 2. 화면 상단 배너 확인

서버 실행 후 페이지 상단에 이 배너가 보여야 합니다:

```
🚧 개발 모드 - 더미 데이터로 테스트 중입니다
```

## 🎯 바로 테스트하기

### 1단계: 대시보드 접속

```
http://localhost:3000/merchant
```

→ 자동 로그인되어 대시보드가 보입니다

### 2단계: AI 콘텐츠 생성 테스트

```
http://localhost:3000/merchant/products/new
```

1. 상품명: `신선한 사과`
2. 가격: `5000`
3. 이미지 URL: `https://placehold.co/600x400/png?text=Apple`
4. **"AI 생성"** 버튼 클릭 ⚡
5. 자동으로 홍보 문구 + 해시태그 생성됨!

### 3단계: 타임세일 생성

```
http://localhost:3000/merchant/timesales/new
```

1. 제목: `사과 30% 할인`
2. 할인율: `30`
3. 시간 설정
4. **"타임세일 시작"** 클릭
5. 푸시 알림 시뮬레이션 (콘솔 확인)

## ❌ 오류 해결

### "Publishable key not valid" 오류

이미 수정되었습니다. 서버를 재시작하세요:

```bash
# Ctrl+C로 서버 종료 후
npm run dev
```

### 빌드 시 Prisma 오류

정상입니다! 데이터베이스가 없어서 발생하는 경고입니다.
`npm run dev`는 정상 작동합니다.

### 화면이 보이지 않음

1. `.env` 파일에서 `NEXT_PUBLIC_DEV_MODE="true"` 확인
2. 서버 재시작
3. 브라우저 캐시 삭제 (Ctrl/Cmd + Shift + R)

## 📊 데이터베이스 연결 (선택)

데이터베이스를 연결하면 실제로 데이터를 저장할 수 있습니다.

### PostgreSQL 설치 (macOS)

```bash
brew install postgresql@15
brew services start postgresql@15
createdb marketsphere
```

### 데이터베이스 설정

```bash
# .env 파일 수정
DATABASE_URL="postgresql://localhost:5432/marketsphere"

# 마이그레이션 실행
npm run prisma:migrate

# 테스트 데이터 삽입
npm run prisma:seed
```

이제 실제로 상품을 등록하고 조회할 수 있습니다!

## 🚀 다음 단계

- [전체 개발 가이드](./DEV-GUIDE.md)
- [프로덕션 배포](./README.md#배포)
- [API 문서](./docs/api-docs.md)

---

문제가 있나요? [GitHub Issues](https://github.com/your-repo/issues)에 등록해주세요!
