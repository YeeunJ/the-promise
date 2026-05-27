# Phase 1.5.1 백엔드 Plan

## 목표

네 가지 기능을 추가합니다.
1. 팀 마스터 데이터 관리 (팀 선택 시 leader_phone 자동 채움)
2. 공간 가용성 조회 API (시간대별 예약 가능 여부 정렬 반환)
3. 예약 소프트 삭제 (관리자 전용, 모든 조회에서 숨김)

---

## Feature 1 — 1박 이상 신청

### 현황 분석

`Reservation.start_datetime` / `end_datetime` 모두 `DateTimeField`이고,
현재 validation은 아래 세 가지만 검사함:
- `start_datetime` > 현재 시각
- `end_datetime` > `start_datetime`
- 30분 단위

같은 날짜로 제한하는 로직 없음. **백엔드 변경 불필요.**

---

## Feature 2 — 팀 마스터 데이터 관리

### 요구사항

- 정해진 팀(이름 + 리더 전화번호)을 DB에 저장해두고 선택 가능
- 예약 신청 시 두 가지 경로:
  1. **팀 선택** → `Team` 목록에서 선택, `applicant_team` / `leader_phone` 자동 채움
  2. **직접 입력** → 기존과 동일하게 수동 입력
- `Reservation`의 `applicant_team`, `leader_phone` 필드는 그대로 유지
  (선택/직접입력 모두 최종적으로 해당 필드에 저장)

### 모델 추가

```
Team
  - id
  - name         CharField(max_length=100, unique=True)
  - leader_phone CharField(max_length=20)
  - is_active    BooleanField(default=True)
  - created_at   DateTimeField(auto_now_add=True)
  - updated_at   DateTimeField(auto_now=True)
```

### API

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/teams/` | 팀 목록 조회 (is_active=True만) |

---

## Feature 3 — 공간 가용성 조회 API

### 요구사항

주어진 시간대에 각 공간의 예약 가능 여부를 조회하고 정렬해서 반환.

### Query Parameters

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| `start_datetime` | datetime | Y | 조회 시작일시 |
| `end_datetime` | datetime | Y | 조회 종료일시 |
| `show_unavailable` | Y/N | Y | 완전 불가능한 방 포함 여부 |
| `building_id` | int | N | 건물 필터 |
| `floor` | int | N | 층 필터 |
| `keyword` | string | N | 공간 이름 포함 검색 |

### 응답 정렬 순서

1. **완전 가능** — 해당 시간대에 confirmed 예약 없음
2. **부분 가능** — 시간이 일부 겹치는 confirmed 예약 존재
   - 겹치는 예약의 `start_datetime`, `end_datetime` 목록 함께 반환
3. **완전 불가능** — 해당 시간대 전체를 막는 confirmed 예약 존재
   - `show_unavailable=Y`일 때만 포함

### 가용성 판단 기준

요청 시간대 `[S, E)`와 confirmed 예약 `[rs, re)`가 겹치는 조건:
`rs < E AND re > S`

| 케이스 | 조건 |
|--------|------|
| 완전 가능 | 겹치는 confirmed 예약 없음 |
| 완전 불가능 | 겹치는 예약이 `rs <= S AND re >= E`를 만족하는 것이 하나 이상 |
| 부분 가능 | 겹치는 예약은 있지만 완전 불가능이 아닌 경우 |

### API

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/spaces/availability/` | 공간 가용성 조회 |

---

## Feature 4 — 예약 소프트 삭제

### 요구사항

- 예약 삭제는 **관리자 전용**
- 삭제 시 실제 row를 지우지 않고 `is_deleted` 플래그만 변경
- `is_deleted=True`인 예약은 **모든 조회(관리자 포함)에서 숨김**

### 모델 변경

`Reservation`에 필드 추가:
```
is_deleted  BooleanField(default=False)
deleted_at  DateTimeField(null=True, blank=True)
```

### API

| Method | Endpoint | 설명 |
|--------|----------|------|
| DELETE | `/api/admin/reservations/{id}/` | 예약 소프트 삭제 (관리자 전용) |

### 영향 범위

- 기존 예약 목록/상세 조회 queryset에 `is_deleted=False` 필터 추가
- Admin 페이지 queryset에도 동일하게 적용
- 충돌 체크(`has_conflict`)에서도 `is_deleted=True` 예약 제외

---

## Feature 5 — 예약 티켓 이미지 다운로드 API

### 요구사항

예약 확인 후 CGV 모바일 티켓 스타일의 PNG 이미지를 서버에서 생성해 반환.

### 사용 라이브러리

- `Pillow` — 이미지 드로잉
- `qrcode` — QR코드 생성

### 티켓 레이아웃

```
┌─────────────────────────┐
│  [교회 이름 or 로고]      │  ← 상단 헤더
│                         │
│  [공간 이름]             │  ← 메인 타이틀
│                         │
│  신청자     홍길동        │
│  연락처     010-xxxx     │
│  팀         청년부        │
│  리더연락처  010-xxxx     │
│  목적       예배          │
│  일시       2026-04-11   │
│             10:00~12:00 │
│  상태       승인됨        │
│  확인일자    2026-04-11  │
├╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌┤  ← 점선 tear line
│  [QR코드]                │
└─────────────────────────┘
```

### 포함 필드

`applicant_name`, `applicant_phone`, `applicant_team`, `leader_phone`,
`purpose`, `start_datetime`, `end_datetime`, `status`, `updated_at`, `space.name`

### QR코드

현재: 예약 ID를 QR코드로 인코딩
> TODO: 추후 예약 상세 페이지 URL로 변경 예정

### API

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/reservations/{id}/ticket/` | 예약 티켓 PNG 이미지 반환 |

- Content-Type: `image/png`
- 인증: Query parameter로 `name` + `phone` 전달, 예약 정보와 일치 여부 검증
  - 불일치 시 403 반환
  > 추후 URL 기반 QR 전환 시 인증 방식 재검토 가능
