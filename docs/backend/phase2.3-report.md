# Phase 2.3 백엔드 완료 보고서 — 실시간 예약 현황 보드 API

**작성일**: 2026-06-08
**브랜치**: `develop`
**베이스**: `develop`

---

## 1. Executive Summary

| 관점 | 내용 |
|------|------|
| **문제** | 현재 진행 중·곧 시작 예약을 전체 공개로 보여줄 API 부재. 기존 `current/`는 본인조회용(name·phone 필수)이라 보드 부적합 |
| **해결** | 비로그인 공개 엔드포인트 `GET /api/v1/reservations/board/` 추가 — 진행 중 + 2시간 내 시작 예약을 건물별로 반환, 서버 `now`·`state` 포함 |
| **개인정보** | 전용 `BoardReservationSerializer`로 전화번호·인원·관리자메모를 제외 — 무인 공개 화면 노출 안전 |
| **핵심 가치** | 로비/안내 디스플레이용 실시간 현황 데이터 소스 확보 (DB 스키마 무변경) |

---

## 2. 구현 범위

### 2.1 변경 파일

| 파일 | 변경 내용 |
|------|-----------|
| `serializers.py` | `BoardSpaceSerializer`(id·name·floor), `BoardReservationSerializer`(개인정보 제외 + `state` 계산) 추가 |
| `views.py` | `ReservationBoardView` 추가 — `window_minutes`(기본 120·최대 720) 파싱, confirmed·미삭제·`start<now+window`·`end>now` 필터, `select_related` 후 건물별 그룹핑, 활성 건물 전체 + 서버 `now` 반환 |
| `urls.py` | `reservations/board/` 라우트 등록 |
| `tests.py` | `ReservationBoardViewTest` 9케이스 추가 |

> **DB 스키마 무변경** — 신규 모델·마이그레이션 없음.

---

## 3. 엔드포인트 명세 — `GET /api/v1/reservations/board/`

```
권한:   AllowAny (비로그인)
파라미터: window_minutes (기본 120, 최대 720)
필터:   status=confirmed, is_deleted=False, start_datetime < now+window, end_datetime > now
정렬:   space__floor, start_datetime

응답:
  { now, window_minutes, buildings: [ { id, name, reservations: [BoardReservation] } ] }

BoardReservation:
  id, space{id,name,floor}, applicant_team, applicant_name,
  purpose, start_datetime, end_datetime, status, state('live'|'upcoming')

state:  start<=now<end → live, now<start → upcoming  (서버 now 기준)
건물:   Building.is_active=True 전체 포함 (예약 없으면 빈 배열)
제외 필드: applicant_phone, leader_phone, headcount, admin_note
```

---

## 4. 테스트

| 케이스 | 검증 |
|--------|------|
| `test_returns_live_and_upcoming_only` | 진행 중 + 2시간 내 시작만, 지난·윈도우 밖 제외 |
| `test_state_field` | live/upcoming 정확 계산 |
| `test_excludes_cancelled_rejected_deleted` | confirmed만 |
| `test_groups_by_active_building_only` | 활성 건물 그룹핑, 비활성 제외 |
| `test_empty_active_building_included_as_empty_list` | 예약 0건 건물도 빈 배열 포함 |
| `test_window_minutes_param` | window 파라미터 동작 |
| `test_includes_now_and_window` | 응답에 now·window 포함 |
| `test_no_auth_required` | 비로그인 200 |
| `test_does_not_leak_private_fields` | 전화·메모·인원 미노출 |

---

## 5. 품질 게이트

| 항목 | 결과 |
|------|------|
| `python manage.py test reservations` | **137/137** 통과 (보드 9케이스 신규 포함) |
| 라이브 검증 | dev 서버 + 임시 예약으로 live/upcoming·건물 그룹핑·개인정보 미노출 curl 확인 |

---

## 6. 핵심 결정 사항

| 영역 | 결정 | 근거 |
|------|------|------|
| 신규 엔드포인트 | `current/` 재사용 대신 `board/` 신규 | current는 본인조회(name·phone 필수). 보드는 전체 공개·window·건물 그룹핑이 달라 별도 필요 |
| 직렬화기 분리 | `BoardReservationSerializer` 신규 | 무인 공개 화면에 전화번호·관리자메모 노출 금지 — 기존 시리얼라이저 재사용 불가 |
| 서버 now 제공 | 응답에 `now` 포함 | 디스플레이 로컬 시계 오차와 무관하게 클라이언트가 now 라인·state·시계 계산 |
| 건물 전체 반환 | 예약 0건 건물도 빈 배열로 포함 | 프론트 건물 탭·건물별 빈 상태를 추가 조회 없이 렌더 |
| window 상한 720분 | `max(1, min(window, 720))` | 비정상 큰 값 방지 |

---

## Appendix — 관련 문서

| 문서 | 경로 |
|------|------|
| Phase 2.3 백엔드 플랜 | `docs/backend/phase2.3-plan.md` |
| Phase 2.3 프론트 플랜 | `docs/frontend/phase2.3-frontend-plan.md` |
| Phase 2.3 프론트 리포트 | `docs/frontend/phase2.3-frontend-report.md` |
| API URL 구조 | `docs/03-project-structure.md` |
