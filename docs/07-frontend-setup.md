# 07. 프론트엔드 개발 환경 세팅 및 실행

## 사전 준비

아래 도구가 설치되어 있어야 합니다.

- Node.js 18+
- pnpm 9+ (`npm install -g pnpm`)
- Git

---

## 최초 세팅 (처음 한 번만)

### 1. 저장소 클론 및 브랜치 이동

```bash
git clone https://github.com/YeeunJ/the-promise.git
cd the-promise
git checkout develop
```

### 2. 환경변수 파일 생성

```bash
cp apps/web/.env.example apps/web/.env.local
```

`apps/web/.env.local` 파일을 열어 값을 확인하세요.

```bash
VITE_API_BASE_URL=http://localhost:8000
```

> **주의**: `VITE_API_BASE_URL` 값에 `/api/v1`을 붙이지 마세요. 각 컴포넌트에서 이미 `/api/v1/...` 경로를 붙여서 호출합니다. 이중으로 붙으면 API 요청이 실패합니다.

> `.env.local`은 git에 올라가지 않습니다. `.env.example`은 참고용으로 커밋됩니다.

### 3. 의존성 설치

프로젝트 루트에서 실행합니다.

```bash
pnpm install
```

pnpm workspaces 설정에 의해 `apps/web/`과 `packages/shared/`의 의존성이 한꺼번에 설치됩니다.

---

## 개발 서버 실행

```bash
cd apps/web
pnpm dev
```

브라우저에서 `http://localhost:5173` 에서 확인합니다.

> 백엔드(`http://localhost:8000`)가 실행 중이어야 API 연동이 정상 동작합니다. 백엔드 실행 방법은 `docs/06-backend-setup.md`를 참고하세요.

---

## 테스트 실행

```bash
cd apps/web
pnpm test
```

vitest v4.1.2로 실행됩니다. 현재 3개 파일, 56개 테스트가 정의되어 있습니다.

```
PASS  src/__tests__/formatDatetime.test.ts
PASS  src/__tests__/formatPhone.test.ts
PASS  src/__tests__/reservationFormHelpers.test.ts

Test Files  3 passed
Tests      56 passed
```

한 번 실행 후 종료하려면:

```bash
pnpm test --run
```

---

## 빌드

```bash
cd apps/web
pnpm build
```

빌드 결과물은 `apps/web/dist/`에 생성됩니다.

---

## 프로젝트 구조 요약

```
apps/web/src/
├── types/index.ts            ← 공용 TypeScript 타입 (Reservation, Space 등)
├── pages/ReservationPage.tsx ← 예약 신청/조회 탭 통합 페이지
├── components/
│   ├── ReservationForm.tsx   ← 예약 신청 폼 (전체 조합)
│   ├── ApplicantFields.tsx   ← 신청자 정보 필드 그룹
│   ├── SpaceSelector.tsx     ← 건물→층→공간 3단계 선택
│   ├── TimeSlotPicker.tsx    ← 30분 단위 시간 선택
│   ├── ReservationSummary.tsx← 신청 완료 요약 카드
│   ├── LookupForm.tsx        ← 예약 조회 폼
│   └── ReservationTable.tsx  ← 예약 목록 테이블
└── utils/
    ├── formatDatetime.ts     ← 날짜/시간 포맷 함수
    ├── formatPhone.ts        ← 전화번호 포맷 함수
    └── reservationFormHelpers.ts ← 폼 유효성 검사, 초기값
```

---

## 환경변수 설명

| 변수명 | 설명 | 예시 값 |
|--------|------|--------|
| `VITE_API_BASE_URL` | Django API 서버 주소. `/api/v1`을 포함하지 않음 | `http://localhost:8000` |

> **`VITE_` 접두사가 붙는 이유**: Vite는 보안상 `VITE_`로 시작하는 환경변수만 클라이언트(브라우저) 코드에 노출합니다. 코드에서 `import.meta.env.VITE_API_BASE_URL`로 읽습니다.

---

## 경로 alias (@/)

`tsconfig.json`에 `paths: { "@/*": ["./src/*"] }` alias가 설정되어 있습니다.

```typescript
// 절대 경로 alias 사용 (권장)
import { Reservation } from '@/types';
import { formatDate } from '@/utils/formatDatetime';

// 상대 경로 (동일하게 동작하지만 alias 권장)
import { Reservation } from '../types';
```

---

## 의존성 목록

| 패키지 | 버전 | 용도 |
|--------|------|------|
| `axios` | ^1.7.2 | HTTP API 호출 |
| `react-router-dom` | ^6.23.1 | 페이지 라우팅 |
| `tailwindcss` | ^3.4.6 | 유틸리티 CSS 프레임워크 |
| `autoprefixer` | ^10.4.19 | PostCSS 벤더 접두사 자동 처리 |
| `postcss` | ^8.4.39 | CSS 변환 도구 |
| `vitest` | ^4.1.2 | 테스트 러너 |

---

## 트러블슈팅

**`VITE_API_BASE_URL`이 undefined로 뜨는 경우**
→ `apps/web/.env.local` 파일이 있는지 확인하세요. `.env`가 아닌 `.env.local`로 만들어야 합니다.

**API 호출 시 404 에러**
→ `VITE_API_BASE_URL`에 `/api/v1`이 포함되어 있지 않은지 확인하세요. 올바른 값은 `http://localhost:8000`입니다.

**`pnpm: command not found`**
→ `npm install -g pnpm`으로 pnpm을 먼저 설치하세요.

**테스트 파일을 찾지 못하는 경우**
→ `apps/web/` 디렉토리에서 실행하고 있는지 확인하세요. 루트에서 실행하면 동작하지 않습니다.
