# Phase 1 백엔드 Plan

## 목표

수기로 관리하던 교회 공간 예약을 온라인으로 데이터화합니다.
백엔드는 프론트엔드가 사용할 REST API를 제공하고, 자동 승인/거절 로직을 담당합니다.

---

## 범위

### 포함

- Django 프로젝트 초기 설정 (`config/`)
- 모델 정의: `Building`, `Space`, `Reservation`
- REST API 구현
- Django 관리자 화면 등록
- 초기 데이터: 44개 공간 fixtures (39개 활성 + 5개 비활성)
- 로컬 개발 환경: Docker Compose, requirements.txt

### 제외 (Phase 2 이후)

- 알림 발송 (Celery tasks 구현 — 연동 준비만)
- 공간 CRUD 관리자 API
- 반복 예약

---

## 구현 항목

### 1. 환경 설정

| 파일 | 작업 내용 |
|------|----------|
| `requirements.txt` | Django, DRF, Celery, Redis, psycopg2 등 패키지 목록 작성 |
| `config/settings.py` | DB, Celery 브로커, CORS, 설치 앱, 타임존(Asia/Seoul) 설정 |
| `config/celery.py` | Celery 앱 초기화 |
| `config/__init__.py` | Celery 앱 자동 로드 |
| `config/urls.py` | `/api/v1/` 최상위 라우터 연결 |
| `config/wsgi.py` | gunicorn 진입점 |
| `manage.py` | Django 관리 명령어 진입점 |

### 2. 모델 (`reservations/models.py`)

| 모델 | 주요 필드 |
|------|----------|
| `Building` | `name`, `description`, `is_active`, `created_at`, `updated_at` |
| `Space` | `building(FK)`, `name`, `floor`, `capacity`, `description`, `is_active`, `created_at`, `updated_at` |
| `Reservation` | `space(FK)`, `applicant_name`, `applicant_phone`, `applicant_team`, `leader_phone`, `headcount`, `purpose`, `start_datetime`, `end_datetime`, `status`, `admin_note`, `created_at`, `updated_at` |

- `Reservation.Status` 내부 클래스로 choices 정의 (`confirmed`, `rejected`, `cancelled`, `pending`)
- `Reservation.Meta`: `db_table = "reservations"`, `ordering = ["-created_at"]`
- 중복 체크 메서드를 모델에 정의 (`has_conflict()`)
- 인덱스: `(applicant_name, applicant_phone)`, `(space_id, start_datetime, end_datetime)`

### 3. Serializer (`reservations/serializers.py`)

| Serializer | 용도 |
|------------|------|
| `BuildingSerializer` | 건물 목록 응답 |
| `SpaceSerializer` | 공간 목록 응답 (building 중첩 포함) |
| `ReservationSerializer` | 예약 상세 응답 |
| `ReservationCreateSerializer` | 예약 신청 입력 검증 + 자동 승인/거절 처리 |
| `ReservationQuerySerializer` | 예약 조회 쿼리 파라미터 검증 (`name`, `phone`) |
| `ReservationCancelSerializer` | 관리자 취소 입력 검증 (`admin_note`) |

### 4. API (`reservations/views.py`, `reservations/urls.py`)

| 엔드포인트 | 메서드 | 설명 |
|-----------|--------|------|
| `/api/v1/spaces/` | GET | 활성화된 건물 + 공간 목록 조회 |
| `/api/v1/reservations/` | GET | 이름 + 연락처로 본인 예약 조회 |
| `/api/v1/reservations/` | POST | 예약 신청 (자동 승인/거절) |
| `/api/v1/admin/login/` | POST | 관리자 로그인 (token 발급) |
| `/api/v1/admin/reservations/` | GET | 전체 예약 목록 조회 |
| `/api/v1/admin/reservations/<id>/cancel/` | POST | 예약 취소 |

### 5. 관리자 화면 (`reservations/admin.py`)

- `Building`, `Space`, `Reservation` 모델 등록
- `Reservation` list_display: `id`, `space`, `applicant_name`, `status`, `start_datetime`

### 6. 초기 데이터 (`reservations/fixtures/rooms.json`)

- 3개 건물, 44개 공간 데이터 (39개 활성 + 5개 비활성)
- `python manage.py loaddata rooms.json` 으로 삽입

### 7. 인프라 (`infra/`)

| 파일 | 작업 내용 |
|------|----------|
| `docker-compose.yml` | db(PostgreSQL), redis, api(Django), worker(Celery), web(React) 서비스 정의 |
| `init.sql` | 타임존 설정 (`SET timezone = 'Asia/Seoul'`) |

---

## 구현 순서

```
1. requirements.txt
      ↓
2. infra/docker-compose.yml + infra/init.sql
      ↓
3. config/ (settings, celery, __init__, urls, wsgi, manage.py)
      ↓
4. reservations/models.py + migrations
      ↓
5. reservations/fixtures/rooms.json
      ↓
6. reservations/serializers.py
      ↓
7. reservations/views.py + urls.py
      ↓
8. reservations/admin.py
      ↓
9. reservations/tasks.py (Celery 태스크 stub — Phase 2에서 구현)
```

> 설정 → 모델 → 데이터 → API → 관리자 순서로 아래로 쌓아올립니다.
> 각 단계가 완성되어야 다음 단계가 가능합니다.

---

## 에러 응답 형식

모든 API 에러는 아래 형식을 통일합니다.

```json
{
  "error": "time_conflict",
  "message": "해당 시간에 이미 예약이 있습니다."
}
```

| error 코드 | 상황 |
|-----------|------|
| `time_conflict` | 시간 중복으로 자동 거절 시 |
| `validation_error` | 입력값 검증 실패 |
| `not_found` | 공간/예약 없음 |
| `unauthorized` | 관리자 인증 실패 |

---

## 완료 기준

- [ ] `docker compose up -d` 실행 시 전체 서비스 정상 기동
- [ ] `python manage.py loaddata rooms.json` 실행 시 44개 공간 데이터 삽입
- [ ] 예약 신청 API: 중복 없으면 `confirmed`, 있으면 `rejected` 응답
- [ ] 예약 조회 API: 이름 + 연락처로 본인 예약 목록 반환
- [ ] 관리자 로그인 → 전체 예약 조회 → 취소 플로우 동작
- [ ] Django 관리자 화면(`/django-admin`)에서 예약 CRUD 가능
