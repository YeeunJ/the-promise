# 02. DB 스키마 설계

## 전체 구조 (ERD 요약)

```
buildings (건물)
    └── spaces (공간)
            └── reservations (예약)
```

건물 하나에 여러 공간이 있고, 공간 하나에 여러 예약이 쌓입니다.

---

## 테이블 상세

### `buildings` — 건물

| 컬럼 | 타입 | 필수 | 기본값 | 설명 |
|------|------|------|--------|------|
| id | integer (PK) | O | auto | 고유 식별자 |
| name | varchar(100) | O | — | 건물 이름 (예: "본관", "교육관") |
| description | text | X | null | 건물 설명 |
| is_active | boolean | O | true | 해당 건물 예약 가능 여부 |
| created_at | timestamptz | O | now() | 생성 시각 |
| updated_at | timestamptz | O | now() | 수정 시각 |

> **is_active**: 건물을 예약 시스템에서 숨기고 싶을 때 false로 바꿉니다. 데이터를 삭제하지 않아도 됩니다.

---

### `spaces` — 공간

| 컬럼 | 타입 | 필수 | 기본값 | 설명 |
|------|------|------|--------|------|
| id | integer (PK) | O | auto | 고유 식별자 |
| building_id | integer (FK) | O | — | 소속 건물 (buildings.id 참조) |
| name | varchar(100) | O | — | 공간 이름 (예: "2층 세미나실 A") |
| floor | integer | X | null | 층 (참고용) |
| capacity | integer | X | null | 수용 인원 (Phase 3에서 활용) |
| description | text | X | null | 공간 설명 |
| is_active | boolean | O | true | 해당 공간 예약 가능 여부 |
| created_at | timestamptz | O | now() | 생성 시각 |
| updated_at | timestamptz | O | now() | 수정 시각 |

> **is_active**: "열렸다 닫혔다"를 이 컬럼으로 관리합니다. Phase 1에서는 관리자가 DB에서 직접 변경, Phase 3에서 관리자 UI로 변경 가능하게 만들 예정.

---

### `reservations` — 예약

| 컬럼 | 타입 | 필수 | 기본값 | 설명 |
|------|------|------|--------|------|
| id | integer (PK) | O | auto | 고유 식별자 |
| space_id | integer (FK) | O | — | 예약한 공간 (spaces.id 참조) |
| applicant_name | varchar(50) | O | — | 신청자 이름 |
| applicant_phone | varchar(20) | O | — | 신청자 연락처 |
| applicant_team | varchar(100) | O | — | 신청 팀 이름 (자유 텍스트) |
| leader_phone | varchar(20) | O | — | 책임자 연락처 |
| headcount | integer | O | — | 예상 참석 인원 |
| purpose | text | O | — | 사용 목적 |
| start_datetime | timestamptz | O | — | 예약 시작 시각 |
| end_datetime | timestamptz | O | — | 예약 종료 시각 |
| status | varchar(20) | O | 'confirmed' | 예약 상태 (아래 참고) |
| admin_note | text | X | null | 관리자 메모 (취소 사유 등) |
| created_at | timestamptz | O | now() | 신청 시각 |
| updated_at | timestamptz | O | now() | 수정 시각 |

#### `status` 값 정의

| 값 | 의미 | 언제 설정되나 |
|----|------|--------------|
| `confirmed` | 승인됨 | 신청 시 시간 중복 없을 때 자동 설정 |
| `rejected` | 거절됨 | 신청 시 시간 중복 있을 때 자동 설정 |
| `cancelled` | 취소됨 | 관리자가 취소할 때 |
| `pending` | 대기 중 | Phase 1에서는 사용 안 함. 추후 관리자 승인 워크플로우를 위해 예약해둠 |

> **왜 `pending`을 지금 넣나?**: 지금 당장 쓰지 않더라도, 나중에 "관리자가 직접 승인/거절하는 방식"으로 바꿀 때 status 값만 추가하면 됩니다. 처음부터 컬럼을 설계해두면 나중에 DB를 수정하는 작업(마이그레이션)이 필요 없어집니다.

---

## 설계 결정 이유

### Q. 왜 건물(buildings)과 공간(spaces)을 분리했나?

건물 정보(이름, 활성 여부)와 공간 정보(층, 수용 인원, 활성 여부)는 성격이 다릅니다.
"본관 전체를 비활성화"하고 싶을 때 buildings.is_active 하나만 바꾸면 되고,
"본관 2층 세미나실만 닫고 싶을 때"는 spaces.is_active만 바꾸면 됩니다.
나중에 건물을 추가할 때도 buildings 테이블에 행 하나만 추가하면 됩니다.

### Q. 왜 신청자 정보를 별도 users 테이블로 분리하지 않았나?

Phase 1 목표는 수기 장부를 온라인으로 옮기는 것입니다.
회원가입이 없는 구조로, 신청자 이름+연락처로 조회합니다.
users 테이블을 지금 만들면 회원가입/로그인 기능까지 같이 만들어야 하는데,
그건 Phase 1 범위를 넘어섭니다. 나중에 필요하면 users 테이블 추가 후 FK를 연결하면 됩니다.

### Q. 왜 `applicant_team`을 별도 테이블로 분리하지 않았나?

현재 팀 이름은 자유 텍스트 입력입니다.
Phase 3에서 사전 정의 목록으로 바꿀 때 teams 테이블을 만들고 FK를 추가하는 방향으로 확장합니다.
지금 분리하면 팀 관리 CRUD까지 만들어야 해서 Phase 1 범위를 초과합니다.

### Q. `timestamptz`란?

`timestamptz` = timestamp with time zone (시간대 포함 시각).
한국(KST, UTC+9)에서만 쓰더라도 timezone 정보를 저장해두면 나중에 해외 사용자나 서버 시간대가 바뀌어도 문제가 없습니다. 처음부터 이걸 쓰는 게 안전합니다.

---

## 인덱스

예약 조회 성능을 위해 아래 인덱스를 추가합니다.

```sql
-- 예약 조회: 이름 + 연락처로 조회
CREATE INDEX idx_reservations_applicant ON reservations(applicant_name, applicant_phone);

-- 중복 확인: 공간 + 시간대로 조회
CREATE INDEX idx_reservations_space_time ON reservations(space_id, start_datetime, end_datetime);
```

> Phase 1 규모에서는 인덱스가 없어도 느리지 않습니다. 하지만 처음부터 만들어두면 데이터가 쌓여도 느려지지 않습니다.
