# Phase 1.5.3 Design — 예약 조회 API 개편

## Context Anchor

| | |
|---|---|
| **WHY** | 예약 데이터 누적 시 전체 조회 API 부하 방지 및 UX 향상 |
| **WHO** | 관리자(Admin API), 예약 신청자(Public API) |
| **RISK** | 기존 `/admin/reservations/` 응답 포맷 변경으로 AdminPage 프론트 코드 breaking |
| **SUCCESS** | 모든 목록 API에 페이징 적용, current/past 엔드포인트 정상 동작, 기존 테스트 통과 |
| **SCOPE** | views.py / urls.py / serializers.py / tests.py. 프론트 연동 별도 phase |

---

## 1. 아키텍처 결정

**선택: Option C — 헬퍼 함수 패턴**

기존 `APIView` 스타일을 그대로 유지하면서 module-level 헬퍼 함수 2개로 중복 제거.

```
views.py
├── _build_admin_reservation_qs(params)   ← Admin 필터 로직 공통화
├── _build_public_reservation_qs(params)  ← Public 필터 로직 공통화
└── _paginate(qs, request)                ← 페이징 로직 공통화
```

기존 `_admin_validation_error(errors)` 패턴과 동일한 관례.

---

## 2. 헬퍼 함수 상세 설계

### 2.1 `_build_admin_reservation_qs(params)`

```python
def _build_admin_reservation_qs(params) -> QuerySet:
    qs = (
        Reservation.objects
        .filter(is_deleted=False)
        .select_related("space__building", "team")
    )
    # status 필터
    if status_val := params.get("status"):
        qs = qs.filter(status=status_val)
    # 날짜 범위 필터
    if from_date := params.get("from_date"):
        qs = qs.filter(start_datetime__date__gte=from_date)
    if to_date := params.get("to_date"):
        qs = qs.filter(start_datetime__date__lte=to_date)
    # 공간/건물 필터
    if space_id := params.get("space_id"):
        qs = qs.filter(space_id=space_id)
    if building_id := params.get("building_id"):
        qs = qs.filter(space__building_id=building_id)
    # 검색 (applicant_name OR applicant_phone)
    if search := params.get("search"):
        qs = qs.filter(
            Q(applicant_name__icontains=search) |
            Q(applicant_phone__icontains=search)
        )
    # 정렬 (whitelist)
    ordering = params.get("ordering", "-start_datetime")
    if ordering not in ("start_datetime", "-start_datetime"):
        ordering = "-start_datetime"
    return qs.order_by(ordering)
```

**참고:** `current` 엔드포인트는 기본 정렬을 `start_datetime`(ASC)으로,  
`past` 엔드포인트는 `-start_datetime`(DESC)으로 호출 측에서 기본값 지정.

### 2.2 `_paginate(qs, request)`

```python
def _paginate(qs, request) -> dict:
    try:
        page      = max(1, int(request.query_params.get("page", 1)))
        page_size = min(100, max(1, int(request.query_params.get("page_size", 20))))
    except (ValueError, TypeError):
        page, page_size = 1, 20

    total   = qs.count()
    offset  = (page - 1) * page_size
    results = qs[offset : offset + page_size]

    return {
        "count":       total,
        "page":        page,
        "page_size":   page_size,
        "total_pages": ceil(total / page_size) if total else 1,
        "results":     ReservationSerializer(results, many=True).data,
    }
```

### 2.3 에러 응답 포맷 통일 (`_admin_validation_error` 확장)

`is_valid(raise_exception=True)` → `is_valid()` + `_admin_validation_error(ser.errors)` 교체.

수정 대상:
- `AdminReservationStatusView.patch` (views.py)
- `ReservationListCreateView.post` (views.py)

---

## 3. 신규 뷰 설계

### 3.1 Admin 뷰

#### `AdminReservationCurrentListView`
```
GET /api/v1/admin/reservations/current/
권한: IsAuthenticated
기본 정렬: start_datetime ASC
필터: _build_admin_reservation_qs + end_datetime__gte=timezone.now()
응답: _paginate(qs, request)
```

#### `AdminReservationPastListView`
```
GET /api/v1/admin/reservations/past/
권한: IsAuthenticated
기본 정렬: -start_datetime DESC
필터: _build_admin_reservation_qs + end_datetime__lt=timezone.now()
응답: _paginate(qs, request)
```

### 3.2 Public 뷰

#### `ReservationCurrentListView`
```
GET /api/v1/reservations/current/
권한: 없음 (name+phone으로 본인 확인)
필터:
  - name (필수), phone (필수) → ReservationQuerySerializer 검증
  - end_datetime__gte=timezone.now()
기본 정렬: start_datetime ASC
응답: _paginate(qs, request)  ← public용 간소 페이징 적용
```

#### `ReservationPastListView`
```
GET /api/v1/reservations/past/
권한: 없음 (name+phone으로 본인 확인)
필터:
  - name (필수), phone (필수)
  - end_datetime__lt=timezone.now()
기본 정렬: -start_datetime DESC
응답: _paginate(qs, request)
```

---

## 4. 기존 뷰 수정

### 4.1 `AdminReservationListView`

| 항목 | 이전 | 이후 |
|---|---|---|
| 필터 | `date`, `status` | `from_date`, `to_date`, `status`, `space_id`, `building_id`, `search`, `ordering` |
| 응답 | `List[Reservation]` | `{ count, page, page_size, total_pages, results }` |
| 구현 | 인라인 | `_build_admin_reservation_qs` + `_paginate` 호출 |

> `date` 파라미터 제거 → breaking change. 기존 테스트 `test_filter_by_date` 수정 필요.

### 4.2 `ReservationListCreateView.get()`

| 항목 | 이전 | 이후 |
|---|---|---|
| 응답 | `List[Reservation]` | `{ count, page, page_size, total_pages, results }` |
| 구현 | 인라인 | `_paginate` 호출 |

### 4.3 에러 포맷 통일 수정 뷰

| 뷰 | 변경 내용 |
|---|---|
| `AdminReservationStatusView.patch` | `raise_exception=True` → `is_valid()` + `_admin_validation_error` |
| `ReservationListCreateView.post` | 동일 |

---

## 5. URL 설계

```python
# urls.py 추가 분 (기존 라우트 위에 배치 — 구체적 경로 우선)
path("reservations/current/",                      ReservationCurrentListView.as_view()),
path("reservations/past/",                         ReservationPastListView.as_view()),

path("admin/reservations/current/",                AdminReservationCurrentListView.as_view()),
path("admin/reservations/past/",                   AdminReservationPastListView.as_view()),
```

**라우팅 순서 주의:** `current/`, `past/` 는 `<int:pk>/` 보다 반드시 앞에 위치해야 함.

최종 admin 예약 URL 순서:
```python
path("admin/reservations/current/",                AdminReservationCurrentListView.as_view()),
path("admin/reservations/past/",                   AdminReservationPastListView.as_view()),
path("admin/reservations/",                        AdminReservationListView.as_view()),
path("admin/reservations/<int:pk>/cancel/",        AdminReservationCancelView.as_view()),
path("admin/reservations/<int:pk>/status/",        AdminReservationStatusView.as_view()),
path("admin/reservations/<int:pk>/",               AdminReservationDeleteView.as_view()),
```

---

## 6. 응답 포맷 스펙

### 6.1 페이징 응답 (모든 목록 API 공통)

```json
{
  "count": 142,
  "page": 2,
  "page_size": 20,
  "total_pages": 8,
  "results": [
    {
      "id": 1,
      "space": { "id": 1, "building": {...}, "name": "자람뜰홀", ... },
      "applicant_name": "홍길동",
      "applicant_phone": "01012345678",
      "team": 3,
      "custom_team_name": "",
      "applicant_team": "디모데(1청년부)",
      "leader_phone": "01098765432",
      "headcount": 10,
      "purpose": "팀 모임",
      "start_datetime": "2030-06-01T10:00:00+09:00",
      "end_datetime": "2030-06-01T12:00:00+09:00",
      "status": "confirmed",
      "admin_note": null,
      "created_at": "2026-05-01T09:00:00+09:00"
    }
  ]
}
```

### 6.2 에러 응답 (통일)

```json
{ "error": "validation_error", "message": "설명 문자열" }
```

---

## 7. 엣지 케이스 처리

| 상황 | 처리 방법 |
|---|---|
| `page` 값이 총 페이지 수 초과 | 빈 results 반환 (400 에러 아님) |
| `page`, `page_size` 비정수 입력 | 기본값(1, 20) 적용 |
| `ordering` 허용 외 값 | 기본값 적용 (400 에러 아님) |
| `from_date` > `to_date` | 빈 results 반환 (날짜 범위 논리적으로 비어있음) |
| `from_date`/`to_date` 형식 오류 | `{"error": "validation_error", "message": "날짜 형식이 올바르지 않습니다."}` 400 반환 |
| `space_id`/`building_id` 비정수 | `{"error": "validation_error", "message": "..."}` 400 반환 |
| 결과 0건 | `{ count: 0, total_pages: 1, results: [] }` |

---

## 8. 테스트 설계

### 8.1 신규 테스트 클래스

#### `AdminReservationCurrentListViewTest`
- `test_returns_only_current_reservations` — end_datetime >= now만 포함
- `test_past_reservation_excluded` — end_datetime < now 제외 확인
- `test_pagination_default` — 기본 page=1, page_size=20
- `test_pagination_page2` — 2페이지 조회
- `test_filter_by_status`
- `test_filter_by_date_range`
- `test_filter_by_space_id`
- `test_filter_by_building_id`
- `test_filter_by_search_name`
- `test_filter_by_search_phone`
- `test_ordering_asc` — 기본 start_datetime ASC
- `test_ordering_desc` — ordering=-start_datetime
- `test_401_without_token`

#### `AdminReservationPastListViewTest`
- `test_returns_only_past_reservations`
- `test_current_reservation_excluded`
- `test_default_ordering_desc` — 최근 지난 것 먼저
- `test_pagination`
- `test_401_without_token`

#### `ReservationCurrentListViewTest`
- `test_returns_current_reservations_by_name_phone`
- `test_past_excluded`
- `test_400_missing_name`
- `test_400_missing_phone`
- `test_pagination`

#### `ReservationPastListViewTest`
- `test_returns_past_reservations_by_name_phone`
- `test_current_excluded`
- `test_400_missing_name`
- `test_400_missing_phone`
- `test_pagination`

### 8.2 수정 필요한 기존 테스트

| 테스트 | 변경 내용 |
|---|---|
| `AdminReservationListViewTest.test_returns_all_reservations_with_token` | `response.data` → `response.data["results"]` |
| `AdminReservationListViewTest.test_filter_by_date` | `date=` → `from_date=` + `to_date=` |
| `AdminReservationListViewTest.test_400_when_date_format_invalid` | 파라미터명 변경 |
| `AdminReservationListViewTest.test_filter_by_status` | `response.data[0]` → `response.data["results"][0]` |
| `AdminReservationListViewTest.test_deleted_reservation_not_returned` | 동일 |
| `ReservationListViewTest` 전체 | `response.data` → `response.data["results"]` |

---

## 9. 구현 가이드

### Module Map

| ID | 모듈 | 파일 | 의존 |
|---|---|---|---|
| M1 | 헬퍼 함수 추가 | `views.py` | — |
| M2 | `AdminReservationListView` 수정 | `views.py` | M1 |
| M3 | Admin current/past 뷰 추가 | `views.py` | M1 |
| M4 | Public current/past 뷰 추가 | `views.py` | M1 |
| M5 | 에러 포맷 통일 | `views.py` | — |
| M6 | URL 등록 | `urls.py` | M3, M4 |
| M7 | 기존 테스트 수정 | `tests.py` | M2 |
| M8 | 신규 테스트 추가 | `tests.py` | M3, M4 |

### Session Guide (권장 2세션)

**Session 1 — 핵심 백엔드 (M1~M6)**
```
/pdca do phase1.5.3-reservation-query --scope M1,M2,M3,M4,M5,M6
```
- 헬퍼 함수 작성 → Admin 뷰 수정/추가 → Public 뷰 추가 → URL 등록
- 완료 기준: `docker compose exec api python manage.py runserver` 정상 기동

**Session 2 — 테스트 (M7~M8)**
```
/pdca do phase1.5.3-reservation-query --scope M7,M8
```
- 기존 테스트 수정 → 신규 테스트 추가
- 완료 기준: `python manage.py test reservations` 전체 통과

### 구현 순서 (Session 1)

1. `views.py` 상단 import에 `from math import ceil` 추가
2. `_build_admin_reservation_qs(params)` 작성 — `_admin_validation_error` 아래 배치
3. `_paginate(qs, request)` 작성
4. `AdminReservationListView.get()` 리팩터 — 헬퍼 호출로 교체, `date` → `from_date`/`to_date`
5. `AdminReservationCurrentListView` 추가
6. `AdminReservationPastListView` 추가
7. `ReservationListCreateView.get()` 페이징 적용
8. `ReservationCurrentListView` 추가
9. `ReservationPastListView` 추가
10. `AdminReservationStatusView`, `ReservationListCreateView.post` 에러 포맷 통일
11. `urls.py` — current/past route 기존 라우트 앞에 추가

### import 추가 필요

```python
# views.py
from math import ceil
from django.db.models import Q
```
