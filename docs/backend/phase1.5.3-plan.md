# Phase 1.5.3 Plan — 예약 조회 API 개편

## Executive Summary

| 관점 | 내용 |
|---|---|
| **Problem** | 관리자·사용자 예약 목록 API에 페이징이 없고 현재/지난 예약 구분이 불가능하여 프론트엔드에서 전량 로드 후 클라이언트 필터링 필요 |
| **Solution** | 현재/지난 예약 별도 엔드포인트 신설 + offset 페이징 + 필터 보강(범위·공간·검색·정렬) |
| **UX Effect** | 관리자 페이지 로딩 속도 개선, 사용자는 본인 예약을 현재/지난으로 즉시 분리 확인 |
| **Core Value** | 데이터 증가에도 API 응답 크기를 일정하게 유지, 운영 안정성 확보 |

## Context Anchor

| | |
|---|---|
| **WHY** | 예약 데이터 누적 시 전체 조회 API 부하 방지 및 UX 향상 |
| **WHO** | 관리자(Admin API), 예약 신청자(Public API) |
| **RISK** | 기존 `/admin/reservations/` 호출하는 프론트 코드 페이징 응답 포맷 변경 시 깨짐 |
| **SUCCESS** | 모든 목록 API에 페이징 적용, current/past 엔드포인트 정상 동작, 기존 테스트 통과 |
| **SCOPE** | 백엔드 views/urls/serializers/tests만. 프론트 연동은 별도 phase |

---

## 1. 변경 범위

### 1.1 신규 엔드포인트

| Method | URL | 설명 |
|---|---|---|
| GET | `/api/v1/admin/reservations/current/` | 현재 예약 목록 (end_datetime ≥ now) |
| GET | `/api/v1/admin/reservations/past/` | 지난 예약 목록 (end_datetime < now) |
| GET | `/api/v1/reservations/current/` | 사용자 현재 예약 (name+phone 필수) |
| GET | `/api/v1/reservations/past/` | 사용자 지난 예약 (name+phone 필수) |

### 1.2 수정 엔드포인트

| Method | URL | 변경 내용 |
|---|---|---|
| GET | `/api/v1/admin/reservations/` | 페이징 추가 + 필터 보강 |
| GET | `/api/v1/reservations/` | 페이징 추가 |

---

## 2. 현재/지난 예약 기준

```
현재 예약: end_datetime >= timezone.now()   ← 진행 중 또는 앞으로 있는 예약
지난 예약: end_datetime <  timezone.now()   ← 이미 종료된 예약
```

- `is_deleted=False` 조건은 모든 엔드포인트에 공통 적용
- current 기본 정렬: `start_datetime` ASC (가장 임박한 것 먼저)
- past 기본 정렬: `-start_datetime` DESC (가장 최근 지난 것 먼저)

---

## 3. 페이징 스펙

### 3.1 요청 파라미터

| 파라미터 | 타입 | 기본값 | 최대 |
|---|---|---|---|
| `page` | int | 1 | — |
| `page_size` | int | 20 | 100 |

### 3.2 응답 포맷

```json
{
  "count": 142,
  "page": 2,
  "page_size": 20,
  "total_pages": 8,
  "results": [ ...ReservationSerializer... ]
}
```

### 3.3 공통 PaginatedReservationSerializer

모든 목록 API에서 재사용할 응답 시리얼라이저 추가.

---

## 4. 필터 스펙

### 4.1 Admin 엔드포인트 (current / past / base 공통)

| 파라미터 | 타입 | 설명 |
|---|---|---|
| `status` | string | confirmed / rejected / cancelled / pending |
| `from_date` | date | 시작일 필터 (YYYY-MM-DD, start_datetime__date ≥) |
| `to_date` | date | 종료일 필터 (YYYY-MM-DD, start_datetime__date ≤) |
| `space_id` | int | 공간 ID |
| `building_id` | int | 건물 ID (space__building_id) |
| `search` | string | applicant_name 또는 applicant_phone 부분 일치 |
| `ordering` | string | `start_datetime` / `-start_datetime` |
| `page` | int | 페이지 번호 |
| `page_size` | int | 페이지 크기 |

> 기존 `date` 파라미터는 **제거**하고 `from_date` / `to_date`로 교체

### 4.2 Public 엔드포인트 (current / past / base)

| 파라미터 | 타입 | 설명 |
|---|---|---|
| `name` | string | **(필수)** 신청자 이름 |
| `phone` | string | **(필수)** 신청자 연락처 |
| `page` | int | 페이지 번호 |
| `page_size` | int | 페이지 크기 |

---

## 5. 에러 응답 포맷 통일

현재 뷰마다 에러 포맷이 달라 프론트엔드에서 일관된 처리가 불가능한 상태.

### 5.1 현황

| 유형 | 현재 포맷 | 발생 위치 |
|---|---|---|
| 비즈니스 로직 에러 | `{"error": "...", "message": "..."}` | 대부분의 커스텀 에러 |
| 인증 실패 | `{"detail": "..."}` | DRF IsAuthenticated 기본값 |
| Serializer validation (`raise_exception=True`) | `{"field": ["..."]}` | AdminReservationStatusView 등 |

### 5.2 통일 방향

모든 에러를 `{"error": "error_code", "message": "설명"}` 포맷으로 통일.

- `is_valid(raise_exception=True)` → `is_valid()` + `_admin_validation_error(ser.errors)` 패턴으로 교체
- 인증 에러(401)는 DRF 기본값 유지 (프론트에서 `detail` 키로 이미 처리 가능)

### 5.3 수정 대상 뷰

| 뷰 | 현재 방식 | 수정 방향 |
|---|---|---|
| `AdminReservationStatusView` | `raise_exception=True` | `_admin_validation_error` 패턴으로 |
| `ReservationListCreateView.post` | `raise_exception=True` | 동일 |

---

## 7. 파일 변경 목록

| 파일 | 변경 종류 | 내용 |
|---|---|---|
| `apps/api/reservations/views.py` | 수정 | 신규 뷰 4개 추가, 기존 2개 수정 |
| `apps/api/reservations/urls.py` | 수정 | 신규 route 4개 추가 |
| `apps/api/reservations/serializers.py` | 수정 | `PaginatedResponseSerializer` 추가, `ReservationQuerySerializer` 수정 |
| `apps/api/reservations/tests.py` | 수정 | 신규 뷰 테스트 추가, 기존 테스트 페이징 응답 포맷에 맞게 수정 |

---

## 8. 구현 순서

1. **serializers.py** — `PaginatedResponseSerializer` 추가
2. **views.py** — 공통 헬퍼 함수 `_paginate_queryset()` 추가
3. **views.py** — `AdminReservationListView` 필터 보강 + 페이징 적용
4. **views.py** — `AdminReservationCurrentListView`, `AdminReservationPastListView` 신규 추가
5. **views.py** — `ReservationListCreateView.get()` 페이징 적용
6. **views.py** — `ReservationCurrentListView`, `ReservationPastListView` 신규 추가
7. **urls.py** — 신규 route 등록
8. **tests.py** — 기존 테스트 수정 + 신규 테스트 추가

---

## 9. 주요 설계 결정

### 7.1 기존 `/admin/reservations/` 유지 여부
- **유지** (전체 조회 + 페이징 + 강화된 필터로 업그레이드)
- 단, 응답 포맷이 `List → PaginatedResponse`로 변경되므로 **breaking change**
- 프론트엔드 AdminPage는 별도 phase에서 연동

### 7.2 `date` 파라미터 제거
- 기존 `date` (단일 날짜) → `from_date` / `to_date` (범위) 로 교체
- 기존 tests.py의 `test_filter_by_date` 수정 필요

### 7.3 공통 헬퍼 패턴
- `_paginate_queryset(qs, request)` 유틸 함수로 중복 제거
- 반환: `(page_data: dict, status_code)`

### 7.4 ordering 보안
- 허용 값: `start_datetime`, `-start_datetime` (whitelist)
- 허용 외 값 입력 시 기본값 적용 (400 에러 아님)

---

## 10. 테스트 커버리지

### 신규 테스트 클래스
- `AdminReservationCurrentListViewTest` — current 필터, 페이징, 정렬
- `AdminReservationPastListViewTest` — past 필터, 페이징, 정렬
- `ReservationCurrentListViewTest` — name+phone 필수, 페이징
- `ReservationPastListViewTest` — name+phone 필수, 페이징

### 수정 필요한 기존 테스트
- `AdminReservationListViewTest` — 응답 포맷이 `response.data` → `response.data["results"]`로 변경
- `test_filter_by_date` → `test_filter_by_date_range` 으로 대체

---

## 11. 리스크

| 리스크 | 영향도 | 대응 |
|---|---|---|
| 기존 AdminPage 프론트 코드 깨짐 | 중 | 프론트 연동 phase에서 처리, 백엔드만 먼저 배포 가능 |
| `date` 파라미터 제거 breaking change | 중 | 기존 테스트 수정으로 회귀 방지 |
| now() 기준 테스트 flakiness | 저 | `timezone.make_aware(datetime(2030, ...))` 고정 시간 활용 |
