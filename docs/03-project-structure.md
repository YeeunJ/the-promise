# 03. 프로젝트 구조

## 전체 구조

pnpm workspaces 기반 모노레포입니다. JS/TS 패키지(`apps/web`, `packages/`)는 pnpm이 관리하고, Python 백엔드(`apps/api/`)는 폴더로만 존재합니다.

```
the-promise/
├── apps/
│   ├── api/                              ← Django 백엔드
│   └── web/                              ← React 프론트엔드 (Vite, 사용자 + 관리자 앱)
│
├── packages/
│   └── shared/                           ← 프론트엔드 공용 상수
│
├── infra/
│   ├── docker-compose.yml                ← 로컬 전체 서비스 실행
│   └── init.sql                          ← DB/유저 초기 생성 스크립트
│
├── .github/
│   └── workflows/                        ← CI(ci.yml) + 배포(deploy.yml)
│
├── docs/                                 ← 프로젝트 문서 모음
├── .env.example                          ← 환경변수 항목 안내
├── package.json                          ← pnpm workspace 루트 + dev 스크립트
├── pnpm-workspace.yaml                   ← workspace 패키지 경로 정의
├── Makefile                              ← 자주 쓰는 docker 명령어 모음
├── CLAUDE.md                             ← 작업 규칙
└── README.md
```

---

## apps/api/ — Django 백엔드

```
apps/api/
├── config/
│   ├── __init__.py                       ← Celery 앱 임포트 (Django 시작 시 자동 로드)
│   ├── settings.py                       ← Django 전역 설정 (DB, DRF, CORS, Celery, whitenoise)
│   ├── celery.py                         ← Celery 앱 초기화 및 설정
│   ├── urls.py                           ← 최상위 URL 라우터 (/api/v1/, 스키마 문서)
│   └── wsgi.py                           ← 운영 서버 진입점 (gunicorn)
│
├── reservations/                         ← 예약 도메인 (건물/공간/예약/조직 통합)
│   ├── migrations/
│   │   ├── 0001_initial.py
│   │   ├── 0002_team_reservation_deleted_at_reservation_is_deleted.py
│   │   └── 0003_pastor_department_team_restructure.py
│   ├── fixtures/
│   │   ├── rooms.json                    ← 공간 초기 데이터
│   │   ├── departments.json              ← 부서(교구) 초기 데이터
│   │   ├── pastors.json                  ← 교역자 초기 데이터
│   │   └── teams.json                    ← 팀(소그룹) 초기 데이터
│   ├── static/fonts/NanumGothic.ttf      ← QR 티켓 이미지 렌더링용 한글 폰트
│   ├── models.py                         ← Building, Space, Reservation, Pastor, Department, Team
│   ├── serializers.py                    ← 모델 ↔ JSON 변환 규칙 (입력 검증 포함)
│   ├── views.py                          ← API 엔드포인트 로직 (APIView 모음)
│   ├── urls.py                           ← /api/v1/ 하위 URL 정의
│   ├── admin.py                          ← Django 관리자 화면(/django-admin)에 모델 등록
│   ├── tasks.py                          ← Celery 비동기 태스크 (알림 발송 등)
│   ├── ticket.py                         ← 예약 QR 티켓 이미지 생성
│   ├── tests.py                          ← 도메인 단위 테스트
│   ├── test_department_inactive_team.py  ← 부서/비활성 팀 테스트
│   └── test_ticket_image.py             ← 티켓 이미지 생성 테스트
│
├── Dockerfile                            ← 컨테이너 빌드 (migrate + collectstatic + gunicorn)
├── manage.py                             ← Django 명령어 실행 (migrate, shell 등)
└── requirements.txt                      ← Python 패키지 목록
```

### 파일별 역할

| 파일 | 역할 |
|------|------|
| `config/settings.py` | DB 연결, 설치된 앱, DRF/CORS/whitenoise, Celery 브로커 URL 등 전역 설정 |
| `config/celery.py` | Celery 앱 객체 생성. `config/__init__.py`에서 임포트하여 Django 시작 시 자동 로드 |
| `config/urls.py` | `/api/v1/` 라우터 + `django-admin/` + drf-spectacular 스키마/Swagger/Redoc |
| `reservations/models.py` | `Building`, `Space`, `Reservation`, `Pastor`, `Department`, `Team` 테이블 정의 |
| `reservations/serializers.py` | API 요청 유효성 검사 + DB 데이터를 JSON으로 변환하는 규칙 |
| `reservations/views.py` | 예약/공간/조직 CRUD, 티켓, 관리자 기능 등 API 요청 처리 로직 |
| `reservations/urls.py` | `/api/v1/` 하위 엔드포인트와 view 연결 |
| `reservations/admin.py` | Django 관리자 화면에 모델 등록 |
| `reservations/tasks.py` | Celery worker가 실행할 비동기 함수 모음 (예: 예약 확인 알림) |
| `reservations/ticket.py` | 예약 정보를 QR 티켓 이미지로 렌더링 (NanumGothic 폰트 사용) |
| `reservations/fixtures/*.json` | 공간/부서/교역자/팀 초기 데이터. `loaddata`로 DB에 삽입 |

> **왜 `spaces`/`organizations` 앱을 별도로 두지 않나?**
> 예약·공간·조직(부서/팀/교역자) 데이터가 강하게 결합되어 있어 단일 `reservations` 앱으로 관리하는 게 더 단순합니다. 비즈니스 로직은 별도 `services.py` 없이 모델 메서드와 view에 둡니다. 도메인이 더 커지면 앱 분리를 검토합니다.

---

## apps/web/ — React 프론트엔드 (Vite + TypeScript)

**사용자 앱과 관리자 앱이 별도 진입점(멀티 페이지)으로 분리**되어 있습니다. Vite가 `index.html`(사용자)과 `admin.html`(관리자)을 각각 빌드합니다.

```
apps/web/
├── index.html                            ← 사용자 앱 진입 (#root, /src/main.tsx)
├── admin.html                            ← 관리자 앱 진입 (#admin-root, /src/admin-main.tsx)
├── public/
│   └── favicon.ico                       ← 정적 자산 (빌드 시 그대로 복사됨)
├── src/
│   ├── main.tsx                          ← 사용자 앱 마운트 (BrowserRouter + App)
│   ├── admin-main.tsx                    ← 관리자 앱 마운트 (BrowserRouter + AdminApp)
│   ├── App.tsx                           ← 사용자 라우터
│   ├── AdminApp.tsx                      ← 관리자 라우터
│   ├── index.css                         ← tokens.css import + Tailwind 디렉티브
│   ├── pages/                            ← URL 하나에 대응하는 화면 전체
│   ├── components/                       ← 재사용 UI 단위 (도메인별 하위 폴더)
│   ├── hooks/                            ← 커스텀 React 훅 (데이터 패칭, 상태 흐름)
│   ├── lib/                              ← API 클라이언트, 도메인 상수/로직
│   ├── utils/                            ← 순수 함수 (포맷/계산 헬퍼)
│   ├── types/                            ← 공용 TypeScript 타입
│   ├── data/                             ← 정적 옵션 데이터 (목적/팀 등)
│   ├── styles/
│   │   └── tokens.css                    ← Refined Sage 디자인 토큰 (CSS 변수)
│   └── __tests__/                        ← vitest 단위 테스트 + setup.ts
├── vite.config.ts                        ← 멀티 진입점, @→src alias, /api 프록시, vitest 설정
├── tailwind.config.js                    ← Refined Sage 토큰, 그림자/애니메이션
├── postcss.config.js                     ← tailwindcss + autoprefixer
├── vercel.json                           ← SPA rewrites (/admin* → admin.html)
├── tsconfig.json                         ← TypeScript 설정 (@/* path alias)
└── package.json                          ← frontend 의존성 및 스크립트
```

### src/pages/ — 화면

| 페이지 | 역할 |
|--------|------|
| `LandingPage.tsx` | 시작/랜딩 화면 |
| `BookingPage.tsx` | 5단계 예약 신청 흐름 (신청자 → 일시 → 장소 → 인원 → 목적) |
| `ConfirmationPage.tsx` | 신청 내용 최종 확인 |
| `BookingSuccessPage.tsx` / `BookingFailedPage.tsx` | 신청 성공/실패 결과 |
| `LookupLoginPage.tsx` | 내 예약 조회 로그인 (공용 PC 대응 재로그인) |
| `MyReservationsPage.tsx` | 내 예약 목록 |
| `BoardPage.tsx` | 실시간 예약 현황 보드 — 현재/다가올 예약 타임라인 (전체화면 공개, `/board`) |
| `AdminPage.tsx` | 관리자 페이지 (달력/예약 목록/건물·공간·팀 관리) |

### src/components/ — UI 단위

| 디렉토리 | 역할 |
|----------|------|
| `components/` (루트) | `AppShell`(사용자 레이아웃), `SpaceSelector`, `TimeSlotPicker`, `ReservationTable`, `ReservationSummary`, 로그인/조회 폼 등 |
| `components/ui/` | 디자인 시스템 프리미티브 — `Button`, `Card`, `Chip`, `Input`, `KpiCard`, `Pagination`, `StatusBadge`, `Toast` 등 |
| `components/booking/` | 예약 신청 흐름 UI — `StepPanel`, `StickyHeader`, `SummaryRail` |
| `components/booking/steps/` | 5단계 각 화면 — `ApplicantStep`, `DateTimeStep`, `SpaceStep`, `HeadcountStep`, `PurposeStep` |
| `components/booking/floorplan/` | 장소 평면도 미리보기 — `FloorPlanCard`, `MainBuilding1F`(인라인 SVG 도면), `floorPlanRegistry`(건물·층→도면 매핑) |
| `components/my/` | 내 예약 화면 — `MyKpiRow`, `UserReservationDetailModal` |
| `components/board/` | 실시간 현황 보드 — `BoardTimeline`(공간별 타임라인), `BoardRow`, `BuildingTabs`(건물 탭·자동전환·페이지 네비), `BoardEmpty`(빈 상태) |
| `components/admin/` | 관리자 화면 — 달력(`CalendarGrid`), 목록(`ListTable`), 상세/취소 모달, 상단/사이드 내비 등 |
| `components/admin/buildings/` · `spaces/` · `teams/` | 건물·공간·팀 CRUD 섹션(목록 테이블 + 폼 모달) |

> **`components/reservation/`(팝업형)는 구버전입니다.** 현재 신청 흐름은 `components/booking/`의 단계형 패널로 재구성되었습니다.

### src/hooks/ · lib/ · utils/ · types/ · data/

| 디렉토리 | 대표 파일 | 역할 |
|----------|-----------|------|
| `hooks/` | `useBookingDraft`, `useStepFlow`, `useSpaceAvailability`, `useDepartments`, `usePaginatedReservations`, `useAdminBuildings/Spaces/Teams`, `useToast`, `useBoardData`(현황 보드 60초 폴링), `useBoardClock`(서버 시각 기준 초 단위 시계) | 예약 흐름 상태, 데이터 패칭, 관리자 CRUD, 현황 보드 훅 |
| `lib/` | `constants`, `adminConstants`, `reservationUtils`, `checkSpaceAvailability`, `boardLayout`(보드 타임라인 위치·페이지 계산) | 도메인 상수/로직 |
| `lib/adminApi/` | `buildings`, `spaces`, `teams`, `errors` | 관리자 CRUD API 호출 |
| `utils/` | `formatDatetime`, `formatPhone`, `formatSpaceName`, `koreanHolidays`, `buildCompletedSteps` | 포맷/계산 순수 함수 |
| `types/` | `index.ts`(공용), `booking.ts`(예약 흐름 도메인) | 공용 TypeScript 타입 |
| `data/` | `purposes.ts`, `teams.ts` | 정적 옵션 데이터(아이콘 포함) |

> **테스트**: `src/__tests__/`에 컴포넌트·훅·유틸 단위 테스트가 vitest로 다수 존재하며, `setup.ts`가 공통 설정을 담당합니다.

### 라우팅

`App.tsx` (사용자) — `/board`(전체화면 공개 보드)를 제외한 모든 경로가 `AppShell` 레이아웃 하위:

| path | 컴포넌트 |
|------|----------|
| `/` | LandingPage |
| `/booking` | BookingPage |
| `/booking/confirm` | ConfirmationPage |
| `/booking/success` · `/booking/failed` | BookingSuccessPage · BookingFailedPage |
| `/my/login` | LookupLoginPage |
| `/my` | MyReservationsPage |
| `/board` | BoardPage (전체화면 · `AppShell` 레이아웃 미적용, 로비 디스플레이용) |
| `*` | `/`로 리다이렉트 |

`AdminApp.tsx` (관리자, `admin.html` 진입) — `/`, `/admin.html` → `AdminPage`.

> **사용자/관리자 앱을 왜 분리하나?**
> 관리자 화면은 일반 사용자에게 노출될 필요가 없고 번들 크기·접근 경로를 분리하는 게 유리합니다. Vite 멀티 진입점으로 빌드하고, `vercel.json`에서 `/admin*` 경로를 `admin.html`로 rewrite합니다.

---

## packages/shared/ — 프론트엔드 공용 상수

```
packages/shared/
├── package.json                          ← { "name": "@the-promise/shared" }
└── constants/
    └── reservation.ts                    ← HEADCOUNT_OPTIONS, TIME_SLOT_MINUTES 등
```

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

| 서비스 | 역할 | 포트 (호스트:컨테이너) |
|--------|------|------------------------|
| `db` | PostgreSQL 16 | 5433:5432 |
| `redis` | Redis 7 (Celery 브로커) | 6379 |
| `api` | Django API 서버 | 8000 |
| `worker` | Celery worker (`apps/api/` 코드 공유) | — |
| `web` | React dev 서버 (Vite) | 5173 |

> **호스트 포트가 5433인 이유**: 로컬에 다른 PostgreSQL(5432)이 떠 있어도 충돌하지 않도록 호스트 측 포트를 5433으로 매핑합니다. 컨테이너 내부는 5432입니다.

---

## 로컬 실행 명령어

루트 `package.json` 스크립트와 `Makefile`을 함께 제공합니다.

| 명령어 | 동작 |
|--------|------|
| `pnpm dev` | docker compose로 전체 서비스 실행 |
| `pnpm dev:infra` | db + redis만 기동 |
| `pnpm dev:api` (`:win`) | Django 개발 서버 (venv Python) |
| `pnpm dev:web` | Vite 프론트엔드 dev 서버 |
| `pnpm dev:local` (`:win`) | infra + api + web 동시 실행 |
| `pnpm build:frontend` | 프론트엔드 프로덕션 빌드 |
| `make migrate` / `make seed` | Django 마이그레이션 / 초기 데이터 삽입 |
| `make shell-api` / `make shell-worker` | API / worker 컨테이너 접속 |

---

## API URL 구조

```
/api/v1/
    departments/                            ← 부서(교구) 목록
    teams/                                  ← 팀(소그룹) 목록
    spaces/                                 ← 건물 + 공간 목록
    spaces/availability/                    ← 시간대별 공간 예약 가용성
    spaces/<id>/reservations/               ← 특정 공간의 예약 목록
    reservations/                           ← 예약 생성
    reservations/current/                   ← 현재(예정) 예약 조회
    reservations/past/                      ← 지난 예약 조회
    reservations/board/                     ← 실시간 현황 보드 (진행 중 + 2시간 내 시작, 건물별·공개)
    reservations/<id>/ticket/               ← 예약 QR 티켓 이미지
    reservations/<id>/cancel/               ← 예약 취소
    admin/
        login/                              ← 관리자 로그인
        buildings/  ·  buildings/<id>/      ← 건물 CRUD
        spaces/     ·  spaces/<id>/         ← 공간 CRUD
        teams/      ·  teams/<id>/          ← 팀 CRUD
        reservations/                       ← 전체 예약 조회
        reservations/current/  ·  past/     ← 현재/지난 예약 조회
        reservations/<id>/cancel/           ← 예약 취소
        reservations/<id>/status/           ← 예약 상태 변경
        reservations/<id>/  (DELETE)        ← 예약 삭제

/api/schema/                                ← OpenAPI 스키마 (drf-spectacular)
/api/schema/swagger-ui/  ·  /redoc/         ← API 문서 UI
/django-admin/                              ← Django 관리자
```

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
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

> **`VITE_` 접두사가 붙는 이유**
> Vite는 보안상 `VITE_`로 시작하는 환경변수만 클라이언트 코드에 노출합니다. 접두사 없이 정의한 변수는 브라우저에서 접근할 수 없습니다.

> **⚠️ `VITE_API_BASE_URL` 표기 주의**
> 루트 `.env.example`은 `/api/v1` 접미사를 포함하지만, `apps/web/.env.example`과 docker-compose의 `web` 서비스 환경변수는 `http://localhost:8000`(접미사 없음)으로 설정돼 있습니다. 코드가 어느 쪽을 기대하는지에 맞춰 통일이 필요합니다.
