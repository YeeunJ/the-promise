# 03. 프로젝트 구조

## 전체 구조

pnpm workspaces 기반 모노레포입니다. JS/TS 패키지(`apps/`, `packages/`)는 pnpm이 관리하고, Python 백엔드(`apps/api/`)는 폴더로만 존재합니다.

```
ThePromise/
├── apps/
│   ├── api/                              ← Django 백엔드
│   └── web/                              ← React 프론트엔드 (Vite)
│
├── packages/
│   └── shared/                           ← 프론트엔드 공용 상수
│
├── infra/
│   ├── docker-compose.yml                ← 로컬 전체 서비스 실행
│   └── init.sql                          ← DB 초기 생성 스크립트
│
├── docs/                                 ← 프로젝트 문서 모음
├── .env.example                          ← 환경변수 항목 안내
├── package.json                          ← pnpm workspace 루트
├── pnpm-workspace.yaml                   ← workspace 패키지 경로 정의
├── Makefile                              ← 자주 쓰는 명령어 모음
└── README.md
```

---

## apps/api/ — Django 백엔드

```
apps/api/
├── config/
│   ├── __init__.py                       ← Python 패키지 선언
│   ├── settings.py                       ← Django 전체 설정 (DB, Celery, 미들웨어 등)
│   ├── celery.py                         ← Celery 앱 초기화 및 설정
│   ├── urls.py                           ← 최상위 URL 라우터 (/api/v1/ 연결)
│   └── wsgi.py                           ← 운영 서버 진입점 (gunicorn 등)
│
├── reservations/                         ← 예약 도메인 (건물/공간/예약 통합)
│   ├── migrations/
│   │   └── __init__.py                   ← Django 마이그레이션 폴더
│   ├── fixtures/
│   │   └── rooms.json                    ← 38개 공간 초기 데이터 (loaddata로 DB에 삽입)
│   ├── __init__.py
│   ├── models.py                         ← Building, Space, Reservation DB 모델 정의
│   ├── serializers.py                    ← 모델 ↔ JSON 변환 규칙 (입력 검증 포함)
│   ├── views.py                          ← API 엔드포인트 로직
│   ├── urls.py                           ← reservations 관련 URL 정의
│   ├── admin.py                          ← Django 관리자 화면(/django-admin)에 모델 등록
│   └── tasks.py                          ← Celery 비동기 태스크 (알림 발송 등)
│
├── manage.py                             ← Django 명령어 실행 (migrate, shell 등)
└── requirements.txt                      ← Python 패키지 목록
```

### 파일별 역할

| 파일 | 역할 |
|------|------|
| `config/settings.py` | DB 연결, 설치된 앱 목록, Celery 브로커 URL, CORS 설정 등 Django 전역 설정 |
| `config/celery.py` | Celery 앱 객체 생성. `config/__init__.py`에서 임포트하여 Django 시작 시 자동 로드 |
| `config/urls.py` | `/api/v1/` 접두사로 reservations URL을 연결하는 최상위 라우터 |
| `reservations/models.py` | `Building`, `Space`, `Reservation` 테이블을 Python 클래스로 정의 |
| `reservations/serializers.py` | API 요청 데이터 유효성 검사 + DB 데이터를 JSON으로 변환하는 규칙 |
| `reservations/views.py` | 예약 생성, 조회, 취소 등 API 요청을 처리하는 로직. 비즈니스 로직은 모델 메서드로 분리 |
| `reservations/urls.py` | `/reservations/`, `/admin/reservations/` 등 URL과 view 연결 |
| `reservations/admin.py` | Django 관리자 화면(`/django-admin`)에 Building, Space, Reservation 모델 등록 |
| `reservations/tasks.py` | Celery worker가 실행할 비동기 함수 모음. 예: 예약 확인 알림 발송 |
| `reservations/fixtures/rooms.json` | 38개 공간 초기 데이터. `python manage.py loaddata rooms.json`으로 DB에 삽입 |

> **왜 `spaces` 앱을 별도로 두지 않나?**
> Phase 1에서 공간 데이터는 fixtures로 초기 삽입 후 변경이 없습니다. 예약과 공간이 강하게 결합되어 있어 단일 앱으로 관리하는 게 더 단순합니다. Phase 3에서 공간 CRUD가 생기면 분리를 검토합니다.

---

## apps/web/ — React 프론트엔드 (Vite + TypeScript)

```
apps/web/
├── index.html                            ← 사용자 앱 Vite 진입점 (public/ 아닌 루트에 위치)
├── admin.html                            ← 관리자 앱 Vite 진입점 (멀티 엔트리)
├── tailwind.config.js                    ← Tailwind CSS 설정 (content 경로 지정)
├── postcss.config.js                     ← PostCSS 설정 (tailwindcss, autoprefixer)
├── vite.config.ts                        ← Vite 빌드/개발 서버 설정 (멀티 엔트리 포함)
├── public/
│   └── favicon.ico                       ← 정적 자산 (빌드 시 그대로 복사됨)
├── src/
│   ├── index.css                         ← Tailwind 지시어(@tailwind) + 전역 스타일
│   ├── pages/
│   │   ├── ReservationPage.tsx           ← 예약 신청 + 조회 탭 통합 페이지
│   │   └── AdminPage.tsx                 ← 관리자 달력 + 예약 목록 페이지 (로그인 게이트 포함)
│   ├── components/
│   │   ├── ReservationForm.tsx           ← 예약 신청 입력 폼 (전체 폼 조합)
│   │   ├── ApplicantFields.tsx           ← 신청자 정보 필드 그룹 (이름/연락처/단체명/책임자, 2컬럼 그리드)
│   │   ├── SpaceSelector.tsx             ← 3단계 장소 선택 컴포넌트 (건물→층→공간)
│   │   ├── TimeSlotPicker.tsx            ← 30분 단위 시간 선택 UI
│   │   ├── ReservationSummary.tsx        ← 예약 완료 후 내용 요약 카드
│   │   ├── LookupForm.tsx                ← 이름+연락처로 예약 조회하는 폼
│   │   ├── ReservationTable.tsx          ← 예약 목록 테이블 (모바일: 카드 리스트)
│   │   ├── AdminLoginForm.tsx            ← 관리자 로그인 폼
│   │   └── admin/
│   │       ├── CalendarGrid.tsx          ← 7×6 달력 그리드 (직접 구현, Event Chip, 모바일 dot)
│   │       └── ReservationPanel.tsx      ← 선택 날짜 예약 목록 + 취소 기능
│   ├── types/
│   │   └── index.ts                      ← 프론트엔드 공용 TypeScript 타입 정의
│   ├── utils/
│   │   ├── formatDatetime.ts             ← ISO 8601 날짜를 사람이 읽기 쉬운 형식으로 변환 (extractDateStr 포함)
│   │   ├── formatPhone.ts               ← 전화번호 형식 변환 (010-0000-0000)
│   │   └── reservationFormHelpers.ts     ← 폼 유효성 검사, 초기값 상수
│   ├── App.tsx                           ← 사용자 앱 라우터 설정
│   ├── main.tsx                          ← 사용자 앱 React 진입점 (index.html과 연결)
│   ├── AdminApp.tsx                      ← 관리자 앱 라우터 설정
│   └── admin-main.tsx                    ← 관리자 앱 React 진입점 (admin.html과 연결)
├── tsconfig.json                         ← TypeScript 컴파일 설정 (path alias @/ 포함)
└── package.json                          ← frontend 의존성 및 스크립트
```

### 파일별 역할

| 파일 | 역할 |
|------|------|
| `index.html` | 사용자 앱 Vite 빌드 진입점. `<div id="root">`와 `main.tsx` 스크립트 태그 포함. `<html lang="ko">` |
| `admin.html` | 관리자 앱 Vite 빌드 진입점. `<div id="admin-root">`와 `admin-main.tsx` 스크립트 태그 포함 |
| `vite.config.ts` | Vite 설정. `build.rollupOptions.input`에 `{ main: index.html, admin: admin.html }` 멀티 엔트리 설정 포함 |
| `src/main.tsx` | `ReactDOM.createRoot()`로 사용자 앱을 `#root`에 마운트하는 진입점. `BrowserRouter` + `App` 렌더링 |
| `src/admin-main.tsx` | `ReactDOM.createRoot()`로 관리자 앱을 `#admin-root`에 마운트하는 진입점. `BrowserRouter` + `AdminApp` 렌더링 |
| `src/App.tsx` | 사용자 앱 라우터. `/` → `ReservationPage` |
| `src/AdminApp.tsx` | 관리자 앱 라우터. `/admin.html` → `AdminPage` |
| `src/index.css` | `@tailwind base/components/utilities` 지시어와 전역 body 폰트(Pretendard) 정의. 사용자 앱·관리자 앱 공유 |
| `src/pages/` | URL 하나에 대응하는 화면 전체. 여러 컴포넌트를 조합해 한 페이지를 구성 |
| `src/components/ReservationForm.tsx` | 예약 신청 전체 폼. `ApplicantFields`, `SpaceSelector`, `TimeSlotPicker`를 조합하고 API 제출을 담당 |
| `src/components/ApplicantFields.tsx` | 신청자 이름, 연락처, 단체명, 책임자 연락처 필드 그룹. sm 이상 화면에서 2컬럼 그리드 레이아웃 |
| `src/components/SpaceSelector.tsx` | 건물→층→공간 3단계 progressive disclosure 선택 UI. 내부에서 `GET /api/v1/spaces/` 호출 |
| `src/components/TimeSlotPicker.tsx` | 날짜 선택 후 30분 단위 슬롯 버튼 그리드 표시. 시작→종료 순서로 2번 클릭해 범위 선택 |
| `src/components/ReservationSummary.tsx` | 신청 완료 후 예약 내용 요약 카드. `status`에 따라 확정/거절 배너 표시 |
| `src/components/LookupForm.tsx` | 이름+연락처 입력 폼. 제출 시 `GET /api/v1/reservations/?name=&phone=` 호출 |
| `src/components/ReservationTable.tsx` | 예약 목록을 표 형태로 표시 (데스크탑). 모바일에서는 카드 리스트로 전환 |
| `src/components/AdminLoginForm.tsx` | 관리자 로그인 폼. `POST /api/v1/admin/login/` 호출, 성공 시 `admin_token`을 localStorage에 저장 |
| `src/components/admin/CalendarGrid.tsx` | 7×6(42칸) 달력 그리드. 외부 라이브러리 없이 직접 구현. Event Chip(최대 3개), +N more 배지, 모바일 dot 인디케이터 포함 |
| `src/components/admin/ReservationPanel.tsx` | 달력에서 선택한 날짜의 예약 목록 표시. `confirmed`/`pending` 상태 예약의 취소 버튼 (`PATCH /api/v1/admin/reservations/{id}/`) 포함 |
| `src/types/index.ts` | `Reservation`, `ReservationFormData`, `Building`, `Space`, `BuildingWithSpaces`, `AdminLoginRequest`, `AdminLoginResponse`, `ADMIN_TOKEN_KEY`, `UpdateReservationStatusPayload` 타입/상수 정의 |
| `src/utils/formatDatetime.ts` | ISO 8601 날짜 문자열을 화면에 표시할 형식으로 변환하는 순수 함수. `formatDate`, `formatTime`, `formatDatetimeRange`, `generateTimeSlots`, `extractDateStr` 5개 함수 포함 |
| `src/utils/formatPhone.ts` | 전화번호 문자열을 `010-0000-0000` 형식으로 변환하는 순수 함수 2개 |
| `src/utils/reservationFormHelpers.ts` | `PHONE_REGEX`, `INITIAL_FORM_DATA`, `INITIAL_TIME_SLOT` 상수와 `validateReservationForm` 함수 |

> **`index.html`이 `public/`이 아닌 루트에 있는 이유**
> Vite는 `public/`을 정적 자산 폴더로 사용하고, `index.html`은 빌드 진입점으로 프로젝트 루트에 둡니다. `public/index.html`로 두면 Vite가 인식하지 못합니다.

> **관리자 앱(`admin.html`)이 별도 파일로 분리된 이유**
> 관리자 기능은 일반 사용자에게 노출되지 않아야 하며, 번들 크기를 분리하는 것이 바람직합니다. Vite 멀티 엔트리 설정으로 `dist/index.html`(사용자)과 `dist/admin.html`(관리자)을 각각 빌드합니다. 타입·유틸·Tailwind 설정은 두 앱이 공유합니다.

### 컴포넌트 구조도

```
[사용자 앱] App.tsx → /
│
└── ReservationPage (페이지)
    ├── 탭 UI ("예약 신청" / "내 예약 조회")
    │
    ├── [예약 신청 탭]
    │   ├── ReservationForm
    │   │   ├── ApplicantFields (이름/연락처/단체명/책임자, sm에서 2컬럼 그리드)
    │   │   ├── SpaceSelector (건물→층→공간, 내부에서 GET /api/v1/spaces/ 호출)
    │   │   └── TimeSlotPicker (날짜 + 30분 단위 슬롯)
    │   └── ReservationSummary (신청 완료 후 표시, status 배너 포함)
    │
    └── [내 예약 조회 탭]
        ├── LookupForm (이름+연락처 입력, GET /api/v1/reservations/ 호출)
        └── ReservationTable (status 배지 포함, 모바일 카드 리스트)

[관리자 앱] AdminApp.tsx → /admin.html
│
└── AdminPage (페이지, 로그인 여부에 따라 분기)
    │
    ├── [미로그인] AdminLoginForm (POST /api/v1/admin/login/, localStorage 토큰 저장)
    │
    └── [로그인 완료] 헤더 + 달력 레이아웃
        ├── CalendarGrid (GET /api/v1/admin/reservations/, 날짜 선택 시 onDateSelect 콜백)
        └── ReservationPanel (선택 날짜 예약 목록, PATCH /api/v1/admin/reservations/{id}/ 취소)
```

---

## packages/shared/ — 프론트엔드 공용 상수

```
packages/shared/
├── package.json                          ← { "name": "@the-promise/shared" }
└── constants/
    └── reservation.ts                    ← 예약 상태 코드, 시간 단위 상수
```

### 파일별 역할

| 파일 | 역할 |
|------|------|
| `constants/reservation.ts` | `HEADCOUNT_OPTIONS` (인원 드롭다운 옵션 배열), `TIME_SLOT_MINUTES` (30) 등 프론트엔드에서 쓰는 상수. 백엔드 Python과 공유 불가이므로 JS/TS 전용 |

> **왜 `rooms.ts`는 없나?**
> 공간 데이터는 DB가 단일 소스입니다. 프론트엔드는 API로 공간 목록을 조회하고, 백엔드는 `fixtures/rooms.json`으로 DB에 초기 데이터를 삽입합니다. JS 파일로 별도 정의하면 DB와 불일치할 위험이 생깁니다.

---

## infra/ — 인프라 설정

```
infra/
├── docker-compose.yml                    ← 로컬 개발용 전체 서비스 정의
└── init.sql                              ← PostgreSQL DB/유저 초기 생성 스크립트
```

### docker-compose.yml 서비스 구성

| 서비스 | 역할 | 포트 |
|--------|------|------|
| `db` | PostgreSQL 16 | 5432 |
| `redis` | Redis 7 (Celery 브로커) | 6379 |
| `api` | Django API 서버 | 8000 |
| `worker` | Celery worker (`apps/api/` 코드 공유) | — |
| `web` | React dev 서버 (Vite) | 5173 |

### 로컬 실행 명령어 (Makefile)

| 명령어 | 동작 |
|--------|------|
| `make dev` | 전체 서비스 실행 |
| `make stop` | 전체 서비스 종료 |
| `make logs` | 전체 로그 스트림 |
| `make migrate` | Django DB 마이그레이션 |
| `make seed` | 초기 공간 데이터 삽입 (rooms.json) |
| `make shell-api` | Django shell 접속 |
| `make shell-worker` | Celery worker 컨테이너 bash |

---

## API URL 구조

```
/api/v1/
    spaces/                         ← GET: 건물+공간 목록 조회 (BuildingWithSpaces[] 반환)
    reservations/                   ← POST: 예약 신청 / GET: 이름+연락처로 예약 조회
    admin/
        login/                      ← POST: 관리자 로그인 (토큰 발급)
        reservations/               ← GET: 전체 예약 조회 (인증 필요)
        reservations/<id>/          ← PATCH: 예약 상태 변경 (취소 등, 인증 필요)
```

### 엔드포인트 상세

| 메서드 | 경로 | 인증 | 설명 |
|--------|------|------|------|
| GET | `/api/v1/spaces/` | 불필요 | 건물+공간 목록 반환. 응답 타입: `BuildingWithSpaces[]`. 층 그룹핑은 클라이언트(SpaceSelector)에서 처리 |
| POST | `/api/v1/reservations/` | 불필요 | 예약 신청. 충돌 없으면 `status: "confirmed"`, 시간 충돌 시 `status: "rejected"` 자동 설정. 응답: 201 |
| GET | `/api/v1/reservations/?name=&phone=` | 불필요 | 이름+연락처로 본인 예약 조회. `name`과 `phone` 쿼리 파라미터 둘 다 필수 |
| POST | `/api/v1/admin/login/` | 불필요 | 관리자 로그인. 요청: `{ username, password }`, 응답: `{ token }`. 토큰은 클라이언트가 `localStorage`에 저장 |
| GET | `/api/v1/admin/reservations/` | Token | 전체 예약 목록 조회. 헤더: `Authorization: Token <token>`. 응답: `Reservation[]` |
| PATCH | `/api/v1/admin/reservations/{id}/` | Token | 예약 상태 변경. 헤더: `Authorization: Token <token>`. 요청 body: `{ status: 'cancelled' \| 'confirmed' \| 'rejected', admin_note?: string }` |

> **시간 슬롯 가용 여부 API (`GET /api/v1/spaces/{id}/availability/`)는 미구현 상태입니다.** Phase 2 이후 구현 예정. 현재 `TimeSlotPicker`는 모든 슬롯을 활성화 표시하며, 중복 신청이 들어오면 백엔드가 `rejected`로 자동 처리합니다.

> **Admin 인증 방식**: Django REST Framework `authtoken` 패턴의 `Token <token>` 헤더를 사용합니다. 토큰은 `AdminLoginForm`이 로그인 성공 시 `localStorage`의 `admin_token` 키에 저장합니다. `AdminPage`와 `ReservationPanel`이 API 호출마다 이 토큰을 헤더에 포함합니다.

---

## 환경변수 (.env)

`.env` 파일은 **절대 git에 올리지 않습니다.** 루트 `.env.example`에 필요한 항목을 안내합니다.

```bash
# .env.example

# Django
SECRET_KEY=your-secret-key-here
DEBUG=True
DATABASE_URL=postgresql://thepromise:thepromise@db:5432/thepromise
REDIS_URL=redis://redis:6379/0
ALLOWED_HOSTS=localhost,127.0.0.1
ADMIN_USERNAME=admin
ADMIN_PASSWORD=change-this-password

# React (Vite)
VITE_API_BASE_URL=http://localhost:8000
```

> **`VITE_` 접두사가 붙는 이유**
> Vite는 보안상 `VITE_`로 시작하는 환경변수만 클라이언트 코드에 노출합니다. 접두사 없이 정의한 변수는 브라우저에서 접근할 수 없습니다.

> **`VITE_API_BASE_URL`에 `/api/v1`을 포함하지 않는 이유**
> 각 컴포넌트(`SpaceSelector`, `ReservationForm`, `LookupForm`)가 axios 호출 시 `${VITE_API_BASE_URL}/api/v1/...` 형태로 경로를 직접 명시합니다. 환경변수에 `/api/v1`을 포함하면 URL이 이중으로 붙는 버그가 발생합니다.
