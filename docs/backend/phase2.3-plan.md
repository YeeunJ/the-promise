# Phase 2.3 백엔드 구현 플랜 — 실시간 예약 현황 보드 API

**작성일**: 2026-06-08
**브랜치**: `develop`
**베이스**: `develop`

---

## 1. 배경 및 목표

| 항목 | 내용 |
|------|------|
| 문제 | 현재 진행 중·곧 시작 예약을 전체 공개로 보여줄 API가 없음. 기존 `reservations/current/`는 본인조회용(name·phone 필수)이라 보드에 부적합 |
| 목표 | 비로그인 공개 엔드포인트 `GET /api/v1/reservations/board/` 신규 — 진행 중 + 앞으로 2시간 내 시작 예약을 건물별로 반환 |
| 소비처 | 프론트 `/board` 페이지 (로비 디스플레이) — [phase2.3-frontend-plan.md](../frontend/phase2.3-frontend-plan.md) |

---

## 2. 엔드포인트 설계 — `GET /api/v1/reservations/board/`

| 요소 | 내용 |
|------|------|
| 권한 | 없음 (AllowAny, 비로그인) |
| 파라미터 | `window_minutes` (기본 120, 최대 720) |
| 필터 | `status=confirmed`, `is_deleted=False`, `start_datetime < now+window`, `end_datetime > now` |
| 쿼리 | `select_related("space__building")` → 건물별 그룹핑 (N+1 방지) |
| 정렬 | `space__floor`, `start_datetime` |

### 응답 형태

```json
{
  "now": "<서버 ISO>",
  "window_minutes": 120,
  "buildings": [
    { "id": 1, "name": "본당", "reservations": [
      { "id": 12, "space": {"id": 3, "name": "그루터기홀", "floor": 2},
        "applicant_team": "청년부", "applicant_name": "김믿음", "purpose": "정기모임",
        "start_datetime": "...", "end_datetime": "...", "status": "confirmed", "state": "live" }
    ] },
    { "id": 2, "name": "가나안홀", "reservations": [] }
  ]
}
```

- 활성 건물(`Building.is_active=True`) 전체를 포함 — 예약 없으면 빈 배열(프론트 탭/빈 상태용).
- `state`: 서버 `now` 기준 `start<=now<end` → `live`, `now<start` → `upcoming`.

> **⚠ 개인정보**: 무인 공개 화면이므로 전용 `BoardReservationSerializer`로 **전화번호·인원·관리자메모를 노출하지 않는다.** 기존 `ReservationSerializer`(전화/메모 포함) 재사용 금지.

---

## 3. 변경/신규 파일

| 파일 | 작업 |
|------|------|
| `reservations/serializers.py` | `BoardSpaceSerializer`(id·name·floor), `BoardReservationSerializer`(개인정보 제외, `state` SerializerMethodField) 추가 |
| `reservations/views.py` | `ReservationBoardView(APIView)` 추가 — window 파싱·필터·건물 그룹핑·`now` 포함 |
| `reservations/urls.py` | `reservations/board/` 라우트 추가 (`current/`·`past/` 다음, `<int:pk>` 패턴 앞) |
| `reservations/tests.py` | `ReservationBoardViewTest` 추가 |

---

## 4. 테스트 계획 (`tests.py`, 기존 `BaseTestCase` 패턴)

`timezone.now()` 상대 시각으로 예약 생성 후 검증:

- 진행 중 + 2시간 내 시작만 반환 / 지난·윈도우 밖 예약 제외
- `cancelled`·`rejected`·`is_deleted` 제외 (confirmed만)
- `window_minutes` 파라미터 동작
- 응답에 `now`·활성 건물(빈 배열 포함)·`state` 포함
- 비활성 건물 제외
- 비로그인 200
- **전화번호·관리자메모·인원 미노출** (개인정보 회귀 방지)

---

## 5. 제약 사항

- DB 스키마 무변경 — 신규 모델·마이그레이션 없음. 기존 `Reservation`/`Space`/`Building` 재사용.
- 기존 엔드포인트·시리얼라이저 무변경 (신규만 추가).
