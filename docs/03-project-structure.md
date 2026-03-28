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
├── index.html                            ← Vite 진입점 (public/ 아닌 루트에 위치)
├── public/
│   └── favicon.ico                       ← 정적 자산 (빌드 시 그대로 복사됨)
├── src/
│   ├── pages/
│   │   ├── ReservationPage.tsx           ← 예약 신청 + 조회 페이지
│   │   └── AdminPage.tsx                 ← 관리자 달력 + 예약 목록 페이지
│   ├── components/
│   │   ├── ReservationForm.tsx           ← 예약 신청 입력 폼
│   │   ├── TimeSlotPicker.tsx            ← 30분 단위 시간 선택 UI
│   │   └── ReservationTable.tsx          ← 예약 목록 테이블
│   ├── utils/
│   │   ├── formatDatetime.ts             ← ISO 8601 날짜를 사람이 읽기 쉬운 형식으로 변환
│   │   └── formatPhone.ts               ← 전화번호 형식 변환 (010-0000-0000)
│   ├── App.tsx                           ← 라우터 설정 (페이지 연결)
│   └── main.tsx                          ← React 앱 진입점 (index.html과 연결)
├── tsconfig.json                         ← TypeScript 컴파일 설정
└── package.json                          ← frontend 의존성 및 스크립트
```

### 파일별 역할

| 파일 | 역할 |
|------|------|
| `index.html` | Vite가 빌드 시 기준으로 삼는 HTML. `<div id="root">`와 `main.tsx` 스크립트 태그 포함 |
| `src/main.tsx` | `ReactDOM.createRoot()`로 React 앱을 `#root`에 마운트하는 진입점 |
| `src/App.tsx` | URL 경로별로 어떤 페이지 컴포넌트를 렌더링할지 라우터로 정의 |
| `src/pages/` | URL 하나에 대응하는 화면 전체. 여러 컴포넌트를 조합해 한 페이지를 구성 |
| `src/components/` | 여러 페이지에서 재사용되거나 독립적인 UI 단위. 페이지보다 작은 단위 |
| `src/components/ReservationForm.tsx` | 신청자 이름, 연락처, 팀, 공간 선택, 목적 입력 폼 |
| `src/components/TimeSlotPicker.tsx` | 30분 단위로 시작/종료 시간을 선택하는 UI |
| `src/components/ReservationTable.tsx` | 예약 목록을 표 형태로 보여주는 컴포넌트 |
| `src/utils/formatDatetime.ts` | ISO 8601 날짜 문자열을 화면에 표시할 형식으로 변환하는 순수 함수 |
| `src/utils/formatPhone.ts` | 전화번호 문자열을 `010-0000-0000` 형식으로 변환하는 순수 함수 |

> **`index.html`이 `public/`이 아닌 루트에 있는 이유**
> Vite는 `public/`을 정적 자산 폴더로 사용하고, `index.html`은 빌드 진입점으로 프로젝트 루트에 둡니다. `public/index.html`로 두면 Vite가 인식하지 못합니다.

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
| `constants/reservation.ts` | `RESERVATION_STATUS`, `TIME_SLOT_MINUTES` 등 프론트엔드에서 쓰는 상수. 백엔드 Python과 공유 불가이므로 JS/TS 전용 |

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
    spaces/                         ← 건물 + 공간 목록 조회
    reservations/                   ← 예약 생성, 조회
    admin/
        login/                      ← 관리자 로그인
        reservations/               ← 전체 예약 조회
        reservations/<id>/cancel/   ← 예약 취소
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
