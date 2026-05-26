# Phase 1.5.2 백엔드 Plan — 관리자 CRUD API

## Executive Summary

| 관점 | 내용 |
|------|------|
| **Problem** | 관리자가 팀·건물·공간 마스터 데이터를 DB 직접 접근 없이 관리할 수 없음 |
| **Solution** | Token 인증 기반 Admin CRUD REST API 추가 (Team·Building·Space·Reservation 상태 변경). develop의 Pastor/Department/Team 구조 채택 |
| **UX Effect** | 관리자 웹 화면에서 데이터 추가·수정·삭제 가능, pending 예약 승인/거절 처리 가능 |
| **Core Value** | 운영 자율성 확보 — 개발자 개입 없이 마스터 데이터 유지 관리 |

## Context Anchor

| 항목 | 내용 |
|------|------|
| **WHY** | 운영팀이 팀·공간 마스터 데이터를 직접 관리하고, pending 예약을 처리할 수 있어야 함 |
| **WHO** | 교회 관리자 (슈퍼유저 또는 staff) |
| **RISK** | Building 삭제 시 활성 Space 존재 → 400 방어. Department PROTECT FK → Team 삭제 전 처리 필요 |
| **SUCCESS** | 모든 CRUD 정상 동작 + 미인증 401 + Pastor/Department/Team 구조 반영 |
| **SCOPE** | 백엔드 API만 (프론트 연동은 별도 phase) |

---

## 1. 대상 리소스 및 현황

| 모델 | 기존 Admin API | Phase 1.5.2 추가 |
|------|--------------|-----------------|
| Team | 없음 | CRUD 전체 (develop의 department FK + pastor FK + leader_phone 구조) |
| Building | 없음 | CRUD 전체 |
| Space | 없음 | CRUD 전체 |
| Reservation | 목록·취소·소프트삭제 | 상세 조회 + 상태 변경 |

### Team 모델 (develop 구조 채택)

develop 브랜치에서 이미 개편된 구조를 그대로 사용:

| 필드 | 내용 |
|------|------|
| `department` | ForeignKey(Department, PROTECT, null=True) |
| `pastor` | ForeignKey(Pastor, SET_NULL, null=True, blank=True) |
| `leader_phone` | CharField(20) |
| unique_together | `(department, name)` |

Pastor·Department 모델은 develop 브랜치 기존 작업 그대로 사용.

---

## 2. API 명세

### 2.1 Team

| Method | URL | 설명 | Auth |
|--------|-----|------|------|
| GET | `/api/admin/teams/` | 전체 목록 (비활성 포함) | Token |
| POST | `/api/admin/teams/` | 팀 생성 | Token |
| PATCH | `/api/admin/teams/<pk>/` | 팀 수정 (name, department, pastor, leader_phone) | Token |
| DELETE | `/api/admin/teams/<pk>/` | 소프트 삭제 (is_active=False) | Token |

**Request Body (POST/PATCH)**
```json
{ "name": "청년팀", "department": 1, "pastor": 2, "leader_phone": "010-1234-5678" }
```

**Response (GET 목록)**
```json
[{
  "id": 1, "name": "청년팀",
  "department": { "id": 1, "name": "청년부" },
  "pastor": { "id": 2, "name": "홍길동", "title": "목사" },
  "leader_phone": "010-1234-5678",
  "is_active": true
}]
```

---

### 2.2 Building

| Method | URL | 설명 | Auth |
|--------|-----|------|------|
| GET | `/api/admin/buildings/` | 전체 목록 (비활성 포함) | Token |
| POST | `/api/admin/buildings/` | 건물 생성 | Token |
| PATCH | `/api/admin/buildings/<pk>/` | 건물 수정 (name, description) | Token |
| DELETE | `/api/admin/buildings/<pk>/` | 소프트 삭제 (is_active=False) | Token |

**제약**: is_active 공간이 남아있는 Building 소프트 삭제 시 → 400 반환

---

### 2.3 Space

| Method | URL | 설명 | Auth |
|--------|-----|------|------|
| GET | `/api/admin/spaces/` | 전체 목록 (비활성 포함, building 정보 포함) | Token |
| POST | `/api/admin/spaces/` | 공간 생성 | Token |
| PATCH | `/api/admin/spaces/<pk>/` | 공간 수정 | Token |
| DELETE | `/api/admin/spaces/<pk>/` | 소프트 삭제 (is_active=False) | Token |

**Request Body (POST)**
```json
{ "building": 1, "name": "소예배실", "floor": 2, "capacity": 30, "description": "" }
```

---

### 2.4 Reservation 보완

| Method | URL | 설명 | Auth |
|--------|-----|------|------|
| GET | `/api/admin/reservations/<pk>/` | 예약 상세 조회 | Token |
| PATCH | `/api/admin/reservations/<pk>/status/` | 상태 변경 | Token |

**상태 변경 규칙**
- `pending` → `confirmed` 또는 `rejected`만 허용
- 다른 상태에서 변경 요청 시 400 반환
- `confirmed` 변경 전 충돌 체크 수행 (충돌 시 변경 불가 or 경고)

**Request Body (PATCH status)**
```json
{ "status": "confirmed", "admin_note": "승인합니다." }
```

---

## 3. 에러 응답 규격

기존 패턴 동일하게 유지:
```json
{ "error": "error_code", "message": "한국어 메시지" }
```

| 에러 코드 | HTTP | 상황 |
|----------|------|------|
| `not_found` | 404 | 대상 리소스 없음 |
| `validation_error` | 400 | 입력값 오류 |
| `conflict` | 400 | Building 삭제 시 활성 Space 존재, confirmed 충돌 |
| `invalid_status_transition` | 400 | 허용되지 않은 상태 변경 |
| (DRF 기본) | 401 | 미인증 |

---

## 4. 구현 범위

### 변경 파일
- `reservations/serializers.py` — Admin Write 시리얼라이저 추가
- `reservations/views.py` — Admin CRUD View 클래스 추가
- `reservations/urls.py` — URL 등록

### 신규 시리얼라이저
| 이름 | 용도 |
|------|------|
| `AdminDepartmentSerializer` | Department 중첩 응답 (id, name) |
| `AdminTeamSerializer` | Team 목록/응답 (department·pastor 중첩, is_active 포함) |
| `AdminTeamWriteSerializer` | Team 생성/수정 입력 (department FK, pastor FK, leader_phone) |
| `AdminBuildingSerializer` | Building 목록/응답 |
| `AdminBuildingWriteSerializer` | Building 생성/수정 입력 |
| `AdminSpaceSerializer` | Space 목록/응답 (building 포함) |
| `AdminSpaceWriteSerializer` | Space 생성/수정 입력 (building_id FK) |
| `AdminReservationStatusSerializer` | 상태 변경 입력 |

### 신규 View 클래스
| 클래스 | URL |
|--------|-----|
| `AdminTeamListCreateView` | `/admin/teams/` |
| `AdminTeamDetailView` | `/admin/teams/<pk>/` |
| `AdminBuildingListCreateView` | `/admin/buildings/` |
| `AdminBuildingDetailView` | `/admin/buildings/<pk>/` |
| `AdminSpaceListCreateView` | `/admin/spaces/` |
| `AdminSpaceDetailView` | `/admin/spaces/<pk>/` |
| `AdminReservationDetailView` | `/admin/reservations/<pk>/` |
| `AdminReservationStatusView` | `/admin/reservations/<pk>/status/` |

---

## 5. 성공 기준

- [ ] 미인증 요청 → 401 반환
- [ ] Team/Building/Space 생성 → 201 + 생성 객체 반환
- [ ] Team/Building/Space 수정 → 200 + 수정된 객체 반환
- [ ] Team/Building/Space 소프트 삭제 → 204, is_active=False 확인
- [ ] Building 삭제 시 활성 Space 존재 → 400 반환
- [ ] pending 예약 → confirmed/rejected 변경 성공
- [ ] non-pending 예약 상태 변경 → 400 반환

---

## 6. 비고

- 마이그레이션 없음 (모델 변경 없음)
- 기존 공개 API (`/api/teams/`, `/api/spaces/`) 영향 없음
- Reservation `status` default가 `confirmed`이므로 pending 예약은 별도 신청 플로우 필요 시 추후 검토
