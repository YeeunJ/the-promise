# Phase 1.5.2 백엔드 Design — 관리자 CRUD API

## Context Anchor

| 항목 | 내용 |
|------|------|
| **WHY** | 운영팀이 팀·공간 마스터 데이터를 직접 관리하고, pending 예약을 처리할 수 있어야 함 |
| **WHO** | 교회 관리자 (Token 인증 사용자) |
| **RISK** | Building 삭제 시 활성 Space → 400 방어. Department PROTECT FK → Team 삭제 전 처리 필요 |
| **SUCCESS** | 모든 CRUD 정상 동작 + 미인증 401 + Pastor/Department/Team 구조 반영 + 상태 변경 제약 |
| **SCOPE** | 백엔드 API (develop의 Pastor/Department/Team 구조 채택, 마이그레이션 없음, 프론트 연동은 별도 phase) |

---

## 1. Architecture Overview

**선택: Option C — Pragmatic Balance**

기존 코드 스타일(APIView, 단일 views.py) 유지하면서 Admin 관련 클래스를 파일 하단에 추가.
시리얼라이저도 기존 serializers.py에 Admin 전용 클래스를 추가.

```
reservations/
  models.py          ← develop 구조 채택 (Pastor, Department, Team 포함)
  serializers.py     ← Admin 시리얼라이저 추가
  views.py           ← Admin CRUD View 클래스 추가
  urls.py            ← URL 패턴 추가
```

---

## 2. 모델 설계

### Team (develop 구조 채택)

develop 브랜치의 Pastor/Department 구조를 그대로 사용. 별도 모델 추가 없음.

| 필드 | 내용 |
|------|------|
| `department` | ForeignKey(Department, PROTECT, null=True) |
| `pastor` | ForeignKey(Pastor, SET_NULL, null=True, blank=True) |
| `leader_phone` | CharField(max_length=20) |
| unique_together | `(department, name)` |

---

## 3. Serializer 설계

### 3.1 Team

```python
class AdminDepartmentSerializer(ModelSerializer):
    fields = ["id", "name"]

class AdminTeamSerializer(ModelSerializer):
    department = AdminDepartmentSerializer(read_only=True)
    pastor = PastorSerializer(read_only=True)
    fields = ["id", "name", "department", "pastor", "leader_phone", "is_active", "created_at"]

class AdminTeamWriteSerializer(ModelSerializer):
    fields = ["name", "department", "pastor", "leader_phone"]
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

### 4.2 AdminTeamListCreateView — `/api/admin/teams/`

| Method | 동작 |
|--------|------|
| GET | `Team.objects.all().select_related("department", "pastor").order_by("department__name", "name")` |
| POST | `AdminTeamWriteSerializer` 검증 후 저장, select_related로 재조회 후 201 반환 |

### 4.3 AdminTeamDetailView — `/api/admin/teams/<pk>/`

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

1. `serializers.py` — Admin 시리얼라이저 추가 (AdminDepartmentSerializer, AdminTeamSerializer 등)
2. `views.py` — Team, Building, Space, Reservation Admin View 추가
3. `urls.py` — 신규 URL 등록

---

## 7. 영향 범위

| 파일 | 변경 유형 | 영향 |
|------|----------|------|
| `serializers.py` | 추가 | 기존 코드 영향 없음 |
| `views.py` | 추가 + 기존 메서드 추가 | AdminReservationDeleteView.get() 추가 |
| `urls.py` | 추가 | 기존 URL 패턴 유지 |
