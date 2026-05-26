# Phase 1.5.2 Gap Analysis — 관리자 CRUD API

## Context Anchor

| 항목 | 내용 |
|------|------|
| **WHY** | 운영팀이 팀·공간 마스터 데이터를 직접 관리하고, pending 예약을 처리할 수 있어야 함 |
| **WHO** | 교회 관리자 (Token 인증 사용자) |
| **RISK** | Building 삭제 시 활성 Space 존재 → 400 방어. Department PROTECT FK → Team 삭제 순서 |
| **SUCCESS** | 모든 CRUD 정상 동작 + 미인증 401 + Pastor/Department/Team 구조 + 상태 변경 제약 |
| **SCOPE** | 백엔드 API (develop의 Pastor/Department/Team 구조 채택, 마이그레이션 없음, 프론트 연동은 별도 phase) |

---

## Match Rate: **100%**

---

## 성공 기준 평가

| 기준 | 상태 | 근거 |
|------|------|------|
| 미인증 요청 → 401 | ✅ Met | 전체 Admin 엔드포인트 미인증 테스트 통과 (`test_401_without_token`) |
| Team 생성/수정/소프트삭제 | ✅ Met | `AdminTeamTest` 10개 테스트 전부 통과 |
| Team 목록에 department·pastor 중첩 | ✅ Met | `test_list_includes_department_and_leader_phone` 통과 |
| Building 생성/수정/소프트삭제 | ✅ Met | `AdminBuildingTest` 전부 통과 |
| Building 삭제 시 활성 Space → 400 | ✅ Met | `{"error":"conflict","message":"활성 공간이 있어 삭제할 수 없습니다."}` |
| Space 생성/수정/소프트삭제 | ✅ Met | `AdminSpaceTest` 전부 통과, building nested 응답 포함 |
| 예약 상세 조회 `GET /admin/reservations/<pk>/` | ✅ Met | `AdminReservationDetailViewTest` 4개 통과 |
| pending→confirmed/rejected | ✅ Met | `AdminReservationStatusViewTest` 7개 통과 |
| non-pending 상태변경 → 400 | ✅ Met | `{"error":"invalid_status_transition","message":"..."}` |
| confirmed 충돌 시 → 400 | ✅ Met | `test_confirmed_with_conflict_returns_400` 통과 |
| Validation 에러 포맷 커스텀 | ✅ Met | `_admin_validation_error()` 헬퍼로 `{"error":"validation_error","message":"..."}` 통일 |
| Space POST select_related (N+1 방지) | ✅ Met | `Space.objects.select_related("building").get(pk=ser.save().pk)` |

---

## 구현 항목 체크

### Serializers (7/7)
- [x] `AdminDepartmentSerializer` (id, name)
- [x] `AdminTeamSerializer` (id, name, department nested, pastor nested, leader_phone, is_active, created_at)
- [x] `AdminTeamWriteSerializer` (name, department FK, pastor FK, leader_phone)
- [x] `AdminBuildingSerializer` (id, name, description, is_active, created_at)
- [x] `AdminBuildingWriteSerializer` (name, description)
- [x] `AdminSpaceSerializer` (id, building nested, name, floor, capacity, description, is_active, created_at)
- [x] `AdminSpaceWriteSerializer` (building FK, name, floor, capacity, description)
- [x] `AdminReservationStatusSerializer` (status choice, admin_note)

### Views (8/8)
- [x] `AdminTeamListCreateView` — GET 전체 목록 (select_related department·pastor), POST 생성
- [x] `AdminTeamDetailView` — PATCH partial (select_related 후 응답), DELETE
- [x] `AdminBuildingListCreateView` — GET 전체 목록, POST 생성
- [x] `AdminBuildingDetailView` — PATCH, DELETE (활성 Space 체크 → conflict)
- [x] `AdminSpaceListCreateView` — GET 전체 목록 (select_related), POST 생성
- [x] `AdminSpaceDetailView` — PATCH, DELETE
- [x] `AdminReservationDeleteView.get()` — 예약 상세 조회 기존 클래스에 추가
- [x] `AdminReservationStatusView` — pending → confirmed/rejected (충돌 체크 포함)

### URLs (8/8)
- [x] `admin/teams/` — ListCreate
- [x] `admin/teams/<pk>/` — Detail (PATCH, DELETE)
- [x] `admin/buildings/` — ListCreate
- [x] `admin/buildings/<pk>/` — Detail (PATCH, DELETE)
- [x] `admin/spaces/` — ListCreate
- [x] `admin/spaces/<pk>/` — Detail (PATCH, DELETE)
- [x] `admin/reservations/<pk>/status/` — Status 변경 (PATCH)
- [x] `admin/reservations/<pk>/` — Detail (GET, DELETE)

### Tests
- [x] `AdminTeamTest` — 10개
- [x] `AdminBuildingTest` — 8개 (활성 Space 충돌 케이스 포함)
- [x] `AdminSpaceTest` — 8개
- [x] `AdminReservationDetailViewTest` — 4개
- [x] `AdminReservationStatusViewTest` — 7개
- [x] 기존 모든 테스트 유지 (TeamListViewTest, ReservationCreateTest 등)

---

## 후속 조치

| 항목 | 우선순위 | 내용 |
|------|---------|------|
| pending 예약 플로우 | 별도 phase | 현재 신청 시 자동 confirmed → pending 도입 시 StatusView 활성화 |

---

## 결론

**Match Rate: 100%** — 설계 범위 전체 구현 완료.
develop의 Pastor/Department/Team 구조를 채택하여 Team Admin CRUD를 구현.
Critical/Important 이슈 없음. 기존 테스트 전부 유지.
