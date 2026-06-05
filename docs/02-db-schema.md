# 02. DB 스키마 설계

## 전체 구조 (ERD 요약)

도메인은 **조직(교역자·부서·팀)**, **공간(건물·공간)**, **예약** 세 갈래로 구성됩니다.

```
[조직]
pastors (교역자)
   ├──< departments (부서/교구) ──< teams (팀/소그룹) ─┐
   └──────────────────────────────< teams            │
                                                      ├──< reservations (예약)
[공간]                                                │
buildings (건물) ──< spaces (공간) ────────────────────┘
```

- 교역자 1명이 여러 부서·팀을 담당할 수 있습니다.
- 부서 하나에 여러 팀이 속합니다.
- 건물 하나에 여러 공간이 있고, 공간 하나에 여러 예약이 쌓입니다.
- 예약은 **공간(필수)**과 **팀(선택)**을 참조합니다. 팀 목록에 없으면 `custom_team_name`으로 자유 입력합니다.

---

## 테이블 상세

### `pastors` — 교역자

| 컬럼 | 타입 | 필수 | 기본값 | 설명 |
|------|------|------|--------|------|
| id | integer (PK) | O | auto | 고유 식별자 |
| name | varchar(50) | O | — | 교역자 이름 |
| title | varchar(50) | O | — | 직함 (예: "목사", "전도사") |
| phone | varchar(20) | O | — | 연락처 |
| is_active | boolean | O | true | 활성 여부 |
| created_at / updated_at | timestamptz | O | now() | 생성/수정 시각 |

---

### `departments` — 부서(교구)

| 컬럼 | 타입 | 필수 | 기본값 | 설명 |
|------|------|------|--------|------|
| id | integer (PK) | O | auto | 고유 식별자 |
| name | varchar(100) | O | — | 부서 이름 (예: "1교구", "청년부") |
| display_order | integer | O | — | 정렬 순서 (작을수록 먼저) |
| pastor_id | integer (FK) | X | null | 담당 교역자 (pastors.id, 삭제 시 NULL) |
| is_active | boolean | O | true | 활성 여부 |
| created_at / updated_at | timestamptz | O | now() | 생성/수정 시각 |

> 기본 정렬은 `display_order` 오름차순입니다.

---

### `teams` — 팀(소그룹)

| 컬럼 | 타입 | 필수 | 기본값 | 설명 |
|------|------|------|--------|------|
| id | integer (PK) | O | auto | 고유 식별자 |
| name | varchar(100) | O | — | 팀 이름 |
| department_id | integer (FK) | X | null | 소속 부서 (departments.id, 삭제 보호 PROTECT) |
| pastor_id | integer (FK) | X | null | 담당 교역자 (pastors.id, 삭제 시 NULL) |
| leader_phone | varchar(20) | O | — | 팀 리더 연락처 |
| is_active | boolean | O | true | 활성 여부 |
| created_at / updated_at | timestamptz | O | now() | 생성/수정 시각 |

> **제약**: `(department_id, name)` 조합은 유일합니다(같은 부서 안에 동명 팀 불가).
> **교역자 표시**: 팀에 교역자가 직접 지정되지 않으면 소속 부서의 교역자를 따릅니다(`get_pastor_display`).

---

### `buildings` — 건물

| 컬럼 | 타입 | 필수 | 기본값 | 설명 |
|------|------|------|--------|------|
| id | integer (PK) | O | auto | 고유 식별자 |
| name | varchar(100) | O | — | 건물 이름 (예: "본당", "가나안홀") |
| description | text | X | null | 건물 설명 |
| is_active | boolean | O | true | 예약 가능 여부 |
| created_at / updated_at | timestamptz | O | now() | 생성/수정 시각 |

---

### `spaces` — 공간

| 컬럼 | 타입 | 필수 | 기본값 | 설명 |
|------|------|------|--------|------|
| id | integer (PK) | O | auto | 고유 식별자 |
| building_id | integer (FK) | O | — | 소속 건물 (buildings.id, 삭제 보호 PROTECT) |
| name | varchar(100) | O | — | 공간 이름 (예: "자람뜰홀") |
| floor | integer | X | null | 층 (지하는 음수, 예: -1 = 지하1층) |
| capacity | integer | X | null | 수용 인원 |
| description | text | X | null | 공간 설명 |
| is_active | boolean | O | true | 예약 가능 여부 |
| created_at / updated_at | timestamptz | O | now() | 생성/수정 시각 |

> **is_active**: 공간을 "열었다 닫았다" 관리하는 플래그. 관리자 UI(공간 CRUD)에서 변경할 수 있습니다.

---

### `reservations` — 예약

| 컬럼 | 타입 | 필수 | 기본값 | 설명 |
|------|------|------|--------|------|
| id | integer (PK) | O | auto | 고유 식별자 |
| space_id | integer (FK) | O | — | 예약한 공간 (spaces.id, 삭제 보호 PROTECT) |
| applicant_name | varchar(50) | O | — | 신청자 이름 |
| applicant_phone | varchar(20) | O | — | 신청자 연락처 |
| team_id | integer (FK) | X | null | 신청 팀 (teams.id, 삭제 시 NULL) |
| custom_team_name | varchar(100) | X | '' | 팀 목록에 없을 때 자유 입력하는 팀 이름 |
| leader_phone | varchar(20) | O | — | 팀 리더 연락처 |
| headcount | integer (양수) | O | — | 사용 인원 |
| purpose | text | O | — | 사용 목적 |
| start_datetime | timestamptz | O | — | 예약 시작 시각 |
| end_datetime | timestamptz | O | — | 예약 종료 시각 |
| status | varchar(20) | O | 'confirmed' | 예약 상태 (아래 참고) |
| admin_note | text | X | null | 관리자 메모 (취소 사유 등) |
| is_deleted | boolean | O | false | soft delete 여부 |
| deleted_at | timestamptz | X | null | 삭제 처리 시각 |
| created_at / updated_at | timestamptz | O | now() | 신청/수정 시각 |

기본 정렬은 `created_at` 내림차순(최신순)입니다.

#### `status` 값 정의

| 값 | 의미 | 언제 설정되나 |
|----|------|--------------|
| `confirmed` | 승인됨 | 신청 시 시간 중복 없을 때 자동 설정 |
| `rejected` | 거절됨 | 신청 시 시간 중복 있을 때 자동 설정 |
| `cancelled` | 취소됨 | 관리자가 취소할 때 |
| `pending` | 대기 중 | 추후 관리자 승인 워크플로우용으로 예약된 값 |

#### 중복 판정 (`has_conflict`)

같은 공간에 **`confirmed` 상태이고 삭제되지 않은(`is_deleted=false`)** 예약 중 시간이 겹치는 것이 있으면 중복입니다.

```
신청 시작 < 기존 종료  AND  신청 종료 > 기존 시작
```

---

## 설계 결정 이유

### Q. 왜 조직을 교역자·부서·팀 3단계로 나눴나?

교회 조직이 "교역자 → 부서(교구) → 팀(소그룹)" 계층을 가지기 때문입니다. 신청자는 팀을 고르면 부서·담당 교역자가 자동으로 따라오므로 입력이 단순해지고, 부서/팀 단위 통계도 낼 수 있습니다. 팀이 직접 교역자를 지정하지 않으면 부서의 교역자를 상속합니다.

### Q. 왜 예약에 `team_id`와 `custom_team_name`을 같이 두나?

사전 정의된 팀은 `team_id`로 연결하고, 목록에 없는 모임은 `custom_team_name`에 자유 입력합니다. 모든 신청을 팀 목록에 강제하지 않으면서도, 정형화된 팀은 FK로 정확히 집계할 수 있습니다.

### Q. 왜 건물(buildings)과 공간(spaces)을 분리했나?

건물 정보(이름, 활성 여부)와 공간 정보(층, 수용 인원, 활성 여부)는 성격이 다릅니다. "본당 전체를 닫기"는 `buildings.is_active`, "본당 1층 사랑방만 닫기"는 `spaces.is_active`로 각각 처리합니다.

### Q. 왜 신청자를 별도 users 테이블로 분리하지 않았나?

회원가입 없이 이름+연락처로 조회하는 구조이기 때문입니다. users 테이블을 만들면 로그인 기능까지 필요해집니다. 추후 필요하면 users 테이블을 추가하고 FK를 연결하면 됩니다.

### Q. 왜 예약을 실제 삭제하지 않고 soft delete(`is_deleted`)를 쓰나?

관리자가 예약을 삭제해도 이력과 통계를 보존해야 하기 때문입니다. 실제 행을 지우는 대신 `is_deleted=true` + `deleted_at` 기록으로 처리하고, 조회·중복 판정에서 제외합니다. 공간/건물에 `on_delete=PROTECT`를 건 것도 예약이 달린 데이터가 임의로 지워지지 않게 하기 위함입니다.

### Q. `timestamptz`란?

`timestamptz` = timestamp with time zone(시간대 포함 시각). 한국(KST, UTC+9)에서만 쓰더라도 timezone 정보를 저장해두면 서버 시간대가 바뀌어도 안전합니다.

---

## 인덱스

`reservations` 테이블에 조회 성능을 위한 인덱스를 둡니다(모델 `Meta.indexes`).

```sql
-- 예약 조회: 이름 + 연락처로 조회
CREATE INDEX idx_reservations_applicant ON reservations(applicant_name, applicant_phone);

-- 중복 확인: 공간 + 시간대로 조회
CREATE INDEX idx_reservations_space_time ON reservations(space_id, start_datetime, end_datetime);
```

---

## 마이그레이션 이력

| 마이그레이션 | 내용 |
|--------------|------|
| `0001_initial` | 초기 테이블 (buildings, spaces, reservations 등) |
| `0002_team_reservation_deleted_at_...` | 예약 soft delete(`is_deleted`, `deleted_at`) 및 team 도입 |
| `0003_pastor_department_team_restructure` | 교역자·부서·팀 조직 구조 재정비 |
