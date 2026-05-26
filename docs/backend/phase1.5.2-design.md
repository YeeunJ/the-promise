# Phase 1.5.2 백엔드 Design — 관리자 CRUD API (Leader 확장 포함)

## Context Anchor

| 항목 | 내용 |
|------|------|
| **WHY** | 운영팀이 팀·공간 마스터 데이터를 직접 관리하고, pending 예약을 처리할 수 있어야 함 |
| **WHO** | 교회 관리자 (Token 인증 사용자) |
| **RISK** | Building 삭제 시 활성 Space → 400 방어. Leader PROTECT FK → Team 삭제 전 리더 변경 필요 |
| **SUCCESS** | 모든 CRUD 정상 동작 + 미인증 401 + Leader/Team 구조 반영 + 상태 변경 제약 |
| **SCOPE** | 백엔드 API (Leader 모델 분리 + migration 포함, 프론트 연동은 별도 phase) |

---

## 1. Architecture Overview

**선택: Option C — Pragmatic Balance**

기존 코드 스타일(APIView, 단일 views.py) 유지하면서 Admin 관련 클래스를 파일 하단에 추가.
시리얼라이저도 기존 serializers.py에 Admin 전용 클래스를 추가.

```
reservations/
  models.py          ← Leader 모델 추가, Team category+leader FK 추가
  migrations/
    0003_leader_team_category_refactor.py  ← Leader 생성, Team 스키마 변경
  serializers.py     ← Admin 시리얼라이저 추가
  views.py           ← Admin CRUD View 클래스 추가
  urls.py            ← URL 패턴 추가
  fixtures/
    teams.json       ← Leader 16명 + Team 29개 초기 데이터
```

---

## 2. 모델 설계

### Leader (신규)

```python
class Leader(models.Model):
    name       = models.CharField(max_length=50)
    phone      = models.CharField(max_length=20)
    is_active  = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    class Meta:
        db_table = "leaders"
```

### Team (개편)

| 필드 | 변경 |
|------|------|
| `leader_phone` | 제거 |
| `category` | 추가 — 사역팀/교구/교회학교/찬양대/권사회/안수집사회/여전도연합회/여전도회/남선교회/청년회 |
| `leader` | 추가 — ForeignKey(Leader, PROTECT, null=True) |

---

## 3. Serializer 설계

### 3.1 Leader

```python
class AdminLeaderSerializer(ModelSerializer):
    fields = ["id", "name", "phone", "is_active", "created_at"]

class AdminLeaderWriteSerializer(ModelSerializer):
    fields = ["name", "phone"]
```

### 3.2 Team

```python
class AdminTeamSerializer(ModelSerializer):
    leader = AdminLeaderSerializer(read_only=True)
    fields = ["id", "name", "category", "leader", "is_active", "created_at"]

class AdminTeamWriteSerializer(ModelSerializer):
    fields = ["name", "category", "leader"]  # leader: FK (id)
```

### 3.3 Building

```python
class AdminBuildingSerializer(ModelSerializer):
    fields = ["id", "name", "description", "is_active", "created_at"]

class AdminBuildingWriteSerializer(ModelSerializer):
    fields = ["name", "description"]
```

### 3.4 Space

```python
class AdminSpaceSerializer(ModelSerializer):
    building = BuildingSerializer(read_only=True)
    fields = ["id", "building", "name", "floor", "capacity", "description", "is_active", "created_at"]

class AdminSpaceWriteSerializer(ModelSerializer):
    fields = ["building", "name", "floor", "capacity", "description"]
```

### 3.5 Reservation 상태 변경

```python
class AdminReservationStatusSerializer(Serializer):
    status     = ChoiceField(choices=["confirmed", "rejected"])
    admin_note = CharField(required=False, allow_blank=True, default="")
```

---

## 4. View 설계

### 4.1 공통 헬퍼

```python
def _admin_validation_error(errors):
    # DRF serializer errors → {"error": "validation_error", "message": "..."} 포맷
```

### 4.2 AdminLeaderListCreateView — `/api/admin/leaders/`

| Method | 동작 |
|--------|------|
| GET | `Leader.objects.all().order_by("name")` |
| POST | `AdminLeaderWriteSerializer` 검증 후 저장, 201 반환 |

### 4.3 AdminLeaderDetailView — `/api/admin/leaders/<pk>/`

| Method | 동작 |
|--------|------|
| PATCH | partial=True로 수정, 200 반환 |
| DELETE | `is_active=False` 저장, 204 반환 |

---

### 4.4 AdminTeamListCreateView — `/api/admin/teams/`

| Method | 동작 |
|--------|------|
| GET | `Team.objects.all().select_related("leader")` |
| POST | `AdminTeamWriteSerializer` 검증 후 저장, select_related로 재조회 후 201 반환 |

### 4.5 AdminTeamDetailView — `/api/admin/teams/<pk>/`

| Method | 동작 |
|--------|------|
| PATCH | partial=True 수정 후 select_related 재조회, 200 반환 |
| DELETE | `is_active=False` 저장, 204 반환 |

---

### 4.6 AdminBuildingListCreateView — `/api/admin/buildings/`

| Method | 동작 |
|--------|------|
| GET | `Building.objects.all()` |
| POST | 생성, 201 반환 |

### 4.7 AdminBuildingDetailView — `/api/admin/buildings/<pk>/`

| Method | 동작 |
|--------|------|
| PATCH | 수정, 200 반환 |
| DELETE | 활성 Space 존재 여부 체크 → 400 or `is_active=False` + 204 |

**DELETE 로직**
```
if building.spaces.filter(is_active=True).exists():
    return 400, {"error": "conflict", "message": "활성 공간이 있어 삭제할 수 없습니다."}
building.is_active = False
building.save()
return 204
```

---

### 4.8 AdminSpaceListCreateView — `/api/admin/spaces/`

| Method | 동작 |
|--------|------|
| GET | `Space.objects.all().select_related("building")` |
| POST | `AdminSpaceWriteSerializer` 검증 후 생성, select_related로 재조회 후 201 반환 |

### 4.9 AdminSpaceDetailView — `/api/admin/spaces/<pk>/`

| Method | 동작 |
|--------|------|
| PATCH | partial=True 수정, 200 반환 |
| DELETE | `is_active=False` + 204 |

---

### 4.10 AdminReservationDeleteView (기존 확장) — `/api/admin/reservations/<pk>/`

| Method | 동작 |
|--------|------|
| GET | 예약 상세 반환 (`ReservationSerializer`) |
| DELETE | 기존 소프트 삭제 유지 |

### 4.11 AdminReservationStatusView — `/api/admin/reservations/<pk>/status/`

| Method | 동작 |
|--------|------|
| PATCH | pending → confirmed/rejected 변경 |

**상태 변경 로직**
```
if reservation.status != "pending":
    return 400, {"error": "invalid_status_transition", "message": "pending 상태인 예약만 변경할 수 있습니다."}
if new_status == "confirmed" and reservation.has_conflict():
    return 400, {"error": "conflict", "message": "해당 시간대에 이미 확정된 예약이 있습니다."}
reservation.status = new_status
reservation.admin_note = admin_note
reservation.save()
return 200, ReservationSerializer(reservation).data
```

> **Note**: 현재 예약 신청 시 자동 confirmed 처리되므로 pending 예약 생성 없음.
> 이 API는 추후 pending 플로우 도입 시 활성화 예정.

---

## 5. URL 설계

```python
path("admin/leaders/",                             AdminLeaderListCreateView.as_view()),
path("admin/leaders/<int:pk>/",                    AdminLeaderDetailView.as_view()),
path("admin/teams/",                               AdminTeamListCreateView.as_view()),
path("admin/teams/<int:pk>/",                      AdminTeamDetailView.as_view()),
path("admin/buildings/",                           AdminBuildingListCreateView.as_view()),
path("admin/buildings/<int:pk>/",                  AdminBuildingDetailView.as_view()),
path("admin/spaces/",                              AdminSpaceListCreateView.as_view()),
path("admin/spaces/<int:pk>/",                     AdminSpaceDetailView.as_view()),
path("admin/reservations/<int:pk>/status/",        AdminReservationStatusView.as_view()),
path("admin/reservations/<int:pk>/",               AdminReservationDeleteView.as_view()),
```

---

## 6. 구현 순서

1. `models.py` — Leader 모델 추가, Team category/leader FK 추가
2. `migrations/0003` — Leader 생성, 기존 Team 초기화, Team 스키마 변경
3. `fixtures/teams.json` — Leader 16명, Team 29개 초기 데이터
4. `serializers.py` — Admin 시리얼라이저 9종 추가
5. `views.py` — Leader, Team, Building, Space, Reservation Admin View 추가
6. `urls.py` — 신규 URL 10개 등록

---

## 7. 영향 범위

| 파일 | 변경 유형 | 영향 |
|------|----------|------|
| `models.py` | 추가 + 수정 | Leader 신규, Team 스키마 변경 |
| `migrations/0003` | 신규 | Leader 생성, Team 재구성 |
| `fixtures/teams.json` | 신규 | 초기 마스터 데이터 |
| `serializers.py` | 추가 | 기존 코드 영향 없음 |
| `views.py` | 추가 + 기존 메서드 추가 | AdminReservationDeleteView.get() 추가 |
| `urls.py` | 추가 | 기존 URL 패턴 유지 |
