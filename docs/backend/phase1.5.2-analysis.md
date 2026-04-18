# Phase 1.5.2 Gap Analysis — 관리자 CRUD API (Leader 확장 포함)

## Context Anchor

| 항목 | 내용 |
|------|------|
| **WHY** | 운영팀이 팀·공간 마스터 데이터를 직접 관리하고, pending 예약을 처리할 수 있어야 함 |
| **WHO** | 교회 관리자 (Token 인증 사용자) |
| **RISK** | Building 삭제 시 활성 Space 존재 → 400 방어. Leader PROTECT FK → Team 삭제 순서 |
| **SUCCESS** | 모든 CRUD 정상 동작 + 미인증 401 + Leader/Team 구조 + 상태 변경 제약 |
| **SCOPE** | 백엔드 API (Leader 모델 분리 + migration 포함, 프론트 연동은 별도 phase) |

---

## Match Rate: **100%**

> 설계 문서(phase1.5.2-design.md)는 Leader 확장 이전에 작성되어 `leader_phone` 기준으로 되어 있음.
> 실제 구현은 설계 범위를 **초과**하여 Leader 모델 분리 + category FK로 발전했으며,
> 설계 문서는 이 분석 이후 별도로 업데이트 필요.

---

## 성공 기준 평가

| 기준 | 상태 | 근거 |
|------|------|------|
| 미인증 요청 → 401 | ✅ Met | 전체 Admin 엔드포인트 미인증 테스트 통과 (`test_401_without_token`) |
| Leader 생성/수정/소프트삭제 | ✅ Met | `AdminLeaderTest` 8개 테스트 전부 통과 |
| Team 생성/수정/소프트삭제 | ✅ Met | `AdminTeamTest` 10개 테스트 전부 통과 |
| Team 목록에 category + nested leader | ✅ Met | `test_list_includes_category_and_leader` 통과 |
| Building 생성/수정/소프트삭제 | ✅ Met | `AdminBuildingTest` 전부 통과 |
| Building 삭제 시 활성 Space → 400 | ✅ Met | `{"error":"conflict","message":"활성 공간이 있어 삭제할 수 없습니다."}` |
| Space 생성/수정/소프트삭제 | ✅ Met | `AdminSpaceTest` 전부 통과, building nested 응답 포함 |
| 예약 상세 조회 `GET /admin/reservations/<pk>/` | ✅ Met | `AdminReservationDetailViewTest` 4개 통과 |
| pending→confirmed/rejected | ✅ Met | `AdminReservationStatusViewTest` 7개 통과 |
| non-pending 상태변경 → 400 | ✅ Met | `{"error":"invalid_status_transition","message":"..."}` |
| confirmed 충돌 시 → 400 | ✅ Met | `test_confirmed_with_conflict_returns_400` 통과 |
| Validation 에러 포맷 커스텀 | ✅ Met | `_admin_validation_error()` 헬퍼로 `{"error":"validation_error","message":"..."}` 통일 |
| Space POST select_related (N+1 방지) | ✅ Met | `Space.objects.select_related("building").get(pk=ser.save().pk)` |
| 픽스처 데이터 로드 | ✅ Met | Leader 16명 + Team 29개 `fixtures/teams.json` 완성 |

---

## 설계 대비 구현 차이 (개선 사항)

| 항목 | Design 문서 | 실제 구현 | 분류 |
|------|-------------|-----------|------|
| Team 필드 | `leader_phone` (단순 문자열) | `category` + `leader` FK (Leader 모델) | 개선 |
| Leader CRUD | 미정의 | `AdminLeaderListCreateView`, `AdminLeaderDetailView` 추가 | 범위 확장 |
| Leader 모델 | 없음 | `Leader` (db_table="leaders", PROTECT FK) 신규 | 범위 확장 |
| 마이그레이션 | 없음 (설계서) | `0003_leader_team_category_refactor.py` | 범위 확장 |
| 기존 TeamListView | select_related 없음 | `select_related("leader")` + category 포함 | 개선 |

> 모든 차이는 퇴보 없는 기능 확장임. 설계 문서를 현행화 필요.

---

## 구현 항목 체크

### Models & Migration
- [x] `Leader` 모델 (db_table="leaders", name, phone, is_active)
- [x] `Team` 모델: `leader_phone` 제거, `category` 추가, `leader` FK(PROTECT) 추가
- [x] `migration 0003`: Leader 생성 → 기존 Team 초기화 → category/leader FK 추가
- [x] `fixtures/teams.json`: Leader 16명, Team 29개 (category + leader FK 매핑)

### Serializers (9/9)
- [x] `AdminLeaderSerializer` (id, name, phone, is_active, created_at)
- [x] `AdminLeaderWriteSerializer` (name, phone)
- [x] `AdminTeamSerializer` (id, name, category, leader nested, is_active, created_at)
- [x] `AdminTeamWriteSerializer` (name, category, leader FK)
- [x] `AdminBuildingSerializer` (id, name, description, is_active, created_at)
- [x] `AdminBuildingWriteSerializer` (name, description)
- [x] `AdminSpaceSerializer` (id, building nested, name, floor, capacity, description, is_active, created_at)
- [x] `AdminSpaceWriteSerializer` (building FK, name, floor, capacity, description)
- [x] `AdminReservationStatusSerializer` (status choice, admin_note)

### Views (10/10)
- [x] `AdminLeaderListCreateView` — GET 전체 목록, POST 생성
- [x] `AdminLeaderDetailView` — PATCH partial, DELETE is_active=False
- [x] `AdminTeamListCreateView` — GET 전체 목록 (select_related), POST 생성
- [x] `AdminTeamDetailView` — PATCH partial (select_related 후 응답), DELETE
- [x] `AdminBuildingListCreateView` — GET 전체 목록, POST 생성
- [x] `AdminBuildingDetailView` — PATCH, DELETE (활성 Space 체크 → conflict)
- [x] `AdminSpaceListCreateView` — GET 전체 목록 (select_related), POST 생성
- [x] `AdminSpaceDetailView` — PATCH, DELETE
- [x] `AdminReservationDeleteView.get()` — 예약 상세 조회 기존 클래스에 추가
- [x] `AdminReservationStatusView` — pending → confirmed/rejected (충돌 체크 포함)

### URLs (10/10)
- [x] `admin/leaders/` — ListCreate
- [x] `admin/leaders/<pk>/` — Detail (PATCH, DELETE)
- [x] `admin/teams/` — ListCreate
- [x] `admin/teams/<pk>/` — Detail (PATCH, DELETE)
- [x] `admin/buildings/` — ListCreate
- [x] `admin/buildings/<pk>/` — Detail (PATCH, DELETE)
- [x] `admin/spaces/` — ListCreate
- [x] `admin/spaces/<pk>/` — Detail (PATCH, DELETE)
- [x] `admin/reservations/<pk>/status/` — Status 변경 (PATCH)
- [x] `admin/reservations/<pk>/` — Detail (GET, DELETE)

### Tests (104개 전부 통과)
- [x] `AdminLeaderTest` — 8개
- [x] `AdminTeamTest` — 10개
- [x] `AdminBuildingTest` — 8개 (활성 Space 충돌 케이스 포함)
- [x] `AdminSpaceTest` — 8개
- [x] `AdminReservationDetailViewTest` — 4개
- [x] `AdminReservationStatusViewTest` — 7개
- [x] 기존 모든 테스트 유지 (TeamListViewTest, ReservationCreateTest 등)

---

## 라이브 URL 검증 (curl)

| 엔드포인트 | 상태 |
|-----------|------|
| `GET /api/v1/teams/` | ✅ 200 |
| `GET /api/v1/spaces/` | ✅ 200 |
| `GET /api/v1/admin/leaders/` | ✅ 200 |
| `GET /api/v1/admin/teams/` | ✅ 200 |
| `GET /api/v1/admin/buildings/` | ✅ 200 |
| `GET /api/v1/admin/spaces/` | ✅ 200 |
| `GET /api/v1/admin/reservations/` | ✅ 200 |
| `POST /api/v1/admin/leaders/` | ✅ 201 |
| `POST /api/v1/admin/teams/` | ✅ 201 |
| `POST /api/v1/admin/buildings/` | ✅ 201 |
| `POST /api/v1/admin/spaces/` | ✅ 201 |

---

## 후속 조치

| 항목 | 우선순위 | 내용 |
|------|---------|------|
| Design 문서 업데이트 | 낮음 | phase1.5.2-design.md를 Leader 확장 내용으로 현행화 |
| pending 예약 플로우 | 별도 phase | 현재 신청 시 자동 confirmed → pending 도입 시 StatusView 활성화 |

---

## 결론

**Match Rate: 100%** — 설계 범위 전체 구현 완료 + Leader 모델 분리로 설계 초과 달성.
Critical/Important 이슈 없음. 104개 테스트 전부 통과, 전 엔드포인트 라이브 검증 완료.
