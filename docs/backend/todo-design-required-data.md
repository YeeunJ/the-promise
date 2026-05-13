# 프론트 디자인 적용을 위한 백엔드 보완 사항 TODO

> 작성: Phase 2 프론트엔드 디자인(Refined Sage) 전면 적용 작업 중 발견된 백엔드 미구현 항목.
> 백엔드 작업자가 별도 PR로 처리하기 위해 분리 정리한 문서.
> 모든 항목은 디자인안 [`design_handoff_reservation_system/README.md`](../../design_handoff_reservation_system/README.md) 를 근거로 한다.

## 우선순위 요약

| 우선순위 | 항목 | 사용처 | 상태 |
|---------|------|-------|------|
| 높음 | 통합 검색 API (`?q=...`) | AdminTopNav 검색바 (P5) | 미구현 |
| 중 | `Space.photo_url` 필드 | Room Card 공간 사진 (P3 Step 2) | 미구현 |
| 중 | 관리자 주간 KPI 집계 API | AdminKpiRow "이번 주 예약" (P5) | 미구현 |
| 중 | 팀 응답에 담당 교역자 정보 노출 | 단체 카드 (P3 Step 1), Teams 관리 (P5) | 부분 구현 |
| 낮음 | 공간 가동률 집계 | KPI "가동률" (P5) | 미구현 |
| 낮음 | 인기 공간 집계 (`top_space`) | KPI "인기 공간" (P5) | 미구현 |
| 낮음 | `Space.weekly_count` (주간 예약 횟수) | Room Card "이번 주 N회" (P3) | 미구현 |
| 중 | 예약 응답에 `department_name` 노출 | DetailModal "부서/팀" (P4), 디자인안 의도 "청년부 · 1청년부(디모데)" | 미구현 |
| 중 | `Team.leader_phone` 데이터 정합성 | DetailModal "담당교역자" — phone 필드인데 시드 데이터에 pastor name 들어가 있음 | 데이터 이슈 |
| 중 | admin reservations `?pastor_id=` / `?pastor=` 필터 | ListFilterBar 담당교역자 select (F5 어드민 재구성) | 미구현 |
| 높음 | admin reservations 검색 범위 확장 — `team__name` / `applicant_team` / `custom_team_name` / `purpose` | ListFilterBar 검색 입력 (어드민 실무 동선) | 미구현 |
| 중 | admin reservations 정렬 컬럼 확장 — `created_at` / `headcount` / `building_name` / `applicant_name` / `status` | ListTable 컬럼 헤더 토글 | 미구현 |
| 중 | admin reservations 전화번호 검색 정규화 | ListFilterBar 검색 입력 ("010-..." vs "010..." 저장 형식 불일치) | 미구현 |
| 낮음 | admin reservations 검색어 trim/공백-only 가드 | 서버측 방어선 (프론트는 차단 중) | 미구현 |

> **시간 슬롯 예약 현황 API** (`GET /api/v1/spaces/{id}/reservations/?date=YYYY-MM-DD`) 는 이미 구현되어 있고 `useOccupiedSlots` hook 으로 정상 동작 중이므로 본 문서에서 제외.

---

## 1. 통합 검색 API (`?q=` 파라미터)

### 배경

디자인안 4.2.2 — Admin Top Nav 가운데에 `⌘K` 힌트가 붙은 검색바가 있다. 어드민 실무에서 공간/팀/신청자/목적을 한 번에 검색하는 패턴을 가정한 컴포넌트.

현재 프론트 (`apps/web/src/components/admin/AdminTopNav.tsx` 예정)는 검색바 UI 를 그리지만 onChange 는 no-op 으로 비활성화하고 placeholder 만 보여주는 형태. 백엔드 통합 검색 API 가 생기면 실제 동작 가능.

### 요청 사항

- `GET /api/v1/admin/search/?q=<keyword>` 신규 엔드포인트
- 매칭 대상 (정확한 순서대로 응답):
  1. 신청자 이름 / 전화
  2. 팀 이름 / 부서 이름
  3. 공간 이름 / 건물 이름
  4. 예약 목적 (`reservation.purpose`)
- 응답 포맷: 그룹별 결과 + 각 결과의 navigable URL 힌트
- 권한: 어드민 토큰 필요
- 응답 예시:
  ```json
  {
    "applicants": [
      { "name": "홍길동", "phone": "010-1234-5678", "reservation_count": 3, "latest_reservation_id": 102 }
    ],
    "teams": [
      { "id": 5, "name": "1청년", "department": "청년부", "active_reservation_count": 2 }
    ],
    "spaces": [
      { "id": 11, "name": "사랑방", "building": "본당", "floor": 1 }
    ],
    "reservations": [
      { "id": 87, "summary": "본당 1층 사랑방 · 5/20 (수) 10:00 · 홍길동", "status": "confirmed" }
    ]
  }
  ```

### 관련 항목
본 문서 §11 (검색 범위 확장) 은 **기존 `?search=` 필터의 매칭 필드 추가**이고, 본 §1 은 **별도 통합 검색 엔드포인트**다. 둘 다 어드민 검색 UX 를 채우기 위한 보완이며 동시에 적용해도 무방.

---

## 2. `Space.photo_url` 필드

### 배경

디자인안 2.2.1 Room Card — 공간 카드 상단에 사진(가로 비율 16:9 권장). 현재 디자인은 placeholder SVG 로 대체했지만 운영 단계에서는 실제 사진을 노출하려는 의도.

### 요청 사항

- `Space` 모델에 `photo_url: CharField(max_length=500, null=True, blank=True)` 추가
- `GET /api/v1/spaces/` 응답에 `photo_url` 포함
- 어드민 CRUD (`SpacesSection`) 에서 입력 가능 (단순 URL 입력 또는 Storage 업로드 — 결정 필요)
- 마이그레이션 시 기존 공간은 null 허용. 프론트는 null → placeholder fallback

### 의존
- 운영 파일 저장소(S3, CloudFlare R2 등) 선정. 운영 정책 결정 후 구현.

---

## 3. 관리자 주간 KPI 집계 API

### 배경

디자인안 4.2.3 — AdminKpiRow 의 4 KPI:
- 이번 주 예약 (확정/대기 합산)
- 확정 대기 (pending 카운트)
- 가동률 (공간 시간 / 예약 시간)
- 인기 공간 (이번 주 예약이 가장 많은 공간 1개)

현재 프론트는 **이번 주 예약 / 확정 대기** 는 reservations 데이터로 클라이언트 집계 가능. **가동률 / 인기 공간** 은 서버 집계 필수.

### 요청 사항

- `GET /api/v1/admin/stats/weekly/` 신규 엔드포인트
- 응답 예시:
  ```json
  {
    "week_start": "2026-05-12",
    "week_end": "2026-05-18",
    "weekly_reservation_count": 47,
    "pending_count": 8,
    "utilization_rate": 0.34,
    "top_space": { "id": 11, "name": "사랑방", "building": "본당", "count": 9 }
  }
  ```
- `utilization_rate` 정의: `해당 주의 (예약된 30분 슬롯 수) / (모든 활성 공간 × 운영 시간 30분 슬롯 수)` (정의는 백엔드 작업자가 운영팀과 협의)
- 권한: 어드민 토큰

### 의존
- 운영 시간(주 운영 기준) 정의가 어디 살아야 할지 결정 — `Space` 별 운영 시간 필드 추가 vs 전역 상수.

---

## 4. 팀 응답에 담당 교역자 정보 노출

### 배경

디자인안 2.1 Step 1 (단체 카드) — 부서/팀 선택 후 "담당 교역자 inset card with avatar circle + name + phone" 가 표시된다.

현재 `GET /api/v1/departments/` 응답의 `team.pastor_display` 는 "이름 + 직책" 만 포함. 전화번호는 별도 필드 없음. 프론트는 fallback 으로 `team.leader_phone` 을 쓰지만, 디자인안의 의도는 **목회자 본인 정보**.

### 요청 사항

- `Pastor` 모델에 `phone: CharField` 추가 (이미 있는 경우 확인 후 응답 포함)
- `GET /api/v1/departments/` 응답에서 각 team 의 `pastor` 객체에 `phone` 노출:
  ```json
  "pastor": { "id": 1, "name": "김다윗", "title": "전도사", "phone": "010-0000-0000" }
  ```
- 응답 변경에 따른 프론트 영향: `ApplicantStep` 의 담당 교역자 inset 가 풍부해짐 (현재는 `pastor_display` 만 사용)

---

## 5. 공간 가동률 집계

### 배경
디자인안 4.2.3 — KPI 카드 "가동률". 운영자 입장에서 공간 활용 효율을 보기 위한 핵심 지표.

### 요청 사항
- 상기 §3 의 `weekly stats` 응답에 포함 (별도 엔드포인트 불필요)
- 정의: `(이번 주 예약 슬롯 수) / (활성 공간 × 운영 시간 슬롯 수)`
- 운영 시간 기준은 §3 참조

---

## 6. 인기 공간 집계 (`top_space`)

### 배경
디자인안 4.2.3 — KPI "인기 공간" 카드. 이번 주 가장 많이 예약된 공간 1개를 표시.

### 요청 사항
- 상기 §3 의 `weekly stats` 응답에 `top_space` 객체 포함
- 동률 시 가장 최근 예약된 공간 우선

---

## 7. `Space.weekly_count` (주간 예약 횟수)

### 배경
디자인안 2.2.1 Room Card — 각 공간 카드 하단에 "이번 주 N회" 표기. 사용자가 인기 공간을 직관적으로 알 수 있게 함.

### 요청 사항

- `GET /api/v1/spaces/` 응답의 각 공간에 계산된 필드 추가:
  ```json
  { "id": 11, "name": "사랑방", "weekly_count": 9, ... }
  ```
- 계산: 현재 주(월–일) 의 confirmed + pending 예약 수
- 캐싱 권장 (5분 TTL 등) — 사용 빈도 높음

---

## 8. 예약 응답에 `department_name` 노출

### 배경

디자인안 §3.2 — DetailModal "신청자 정보" 섹션의 "부서/팀" 칸. 디자인 의도는 **부서 · 팀**(예: "청년부 · 1청년부(디모데)") 형태로 합쳐서 표시.

현재 `ReservationSerializer` 의 `applicant_team` 필드는 `team.name`(예: "1청년부(디모데)") 또는 `custom_team_name` 만 반환한다. `Team.department` ForeignKey 관계는 모델에 있으나 직렬화 응답에 노출되지 않음.

### 요청 사항

`ReservationSerializer` 응답에 `department_name` SerializerMethodField 추가:

```python
def get_department_name(self, obj) -> str | None:
    return obj.team.department.name if obj.team and obj.team.department else None
```

응답 예시:

```json
{
  "team": 210,
  "applicant_team": "1청년부(디모데)",
  "department_name": "청년부"
}
```

### 프론트 임시 처리

`UserReservationDetailModal` / `ReservationDetailModal` 의 `teamLabel` 은 `applicant_team` (팀 이름만) 사용. 부서까지 합치는 표시는 백엔드 보강 후 적용.

---

## 9. `Team.leader_phone` 데이터 정합성

### 배경

`Team.leader_phone` 은 `CharField(max_length=20)` — phone 번호 저장용 필드인데, 운영 시드 데이터에서 다수 행에 **목회자 이름 + 직책**("이성윤 전도사", "전희철 목사") 이 들어가 있음. 프론트의 `pastorLabel = reservation.leader_phone` fallback 이 이로 인해 "담당교역자" 칸에 우연히 사람 이름을 표시한다.

### 요청 사항

옵션 A — 데이터 정리:
- `Team.leader_phone` 에는 실제 전화번호만 저장
- 목회자 이름은 `Team.pastor`(Pastor FK) 관계로만 표현

옵션 B — 필드 분리:
- `Team.leader_name`(text) 신설 — 팀장 이름 분리 저장
- `Team.leader_phone` 은 정확히 phone 만 저장

### 의존

[§4 팀 응답에 담당 교역자 정보 노출](#4-팀-응답에-담당-교역자-정보-노출) 와 함께 작업하면 `pastor.phone` + `team.leader_phone` 분리가 자연스럽다.

---

## 10. admin reservations `?pastor_id=` / `?pastor=` 필터

### 배경

디자인안 `option-a-more.jsx` (`A_AdminList`) 의 좌측 필터 사이드바에 "담당교역자 ▾" select 가 있다. 운영자가 특정 목회자가 담당한 팀의 예약만 빠르게 필터링하기 위한 도구.

현재 `GET /api/v1/admin/reservations/` 및 `current/`, `past/` 의 `_build_admin_reservation_qs` 는 다음 필터만 지원:
- `status` / `from_date` / `to_date` / `space_id` / `building_id` / `search`(이름·연락처)

`pastor` 관련 파라미터는 미지원.

### 요청 사항

`_build_admin_reservation_qs(params)` 에 다음 분기 추가:

```python
if pastor_id := params.get("pastor_id"):
    try:
        qs = qs.filter(team__pastor_id=int(pastor_id))
    except (ValueError, TypeError):
        return None, Response(
            {"error": "validation_error", "message": "pastor_id는 정수여야 합니다."},
            status=status.HTTP_400_BAD_REQUEST,
        )
```

`OpenApiParameter(name="pastor_id", type=int, required=False)` 를 `AdminReservationListView` / `Current` / `Past` 의 schema 에도 추가.

선택 사항으로 `?pastor=<name>` (icontains) 도 함께 받으면 다른 진입점(예: 통합 검색)에서 재사용 가능.

### 프론트 임시 처리

`ListFilterBar` 의 vertical 모드 사이드바에 "담당교역자 (준비 중) ▼" disabled select 노출. `title` 속성으로 본 todo 참조 안내.

본 todo 해소 후:
- ListFilterBar 에 `pastorOptions: ApiPastor[]` prop 추가 (`GET /api/v1/departments/` 응답에서 unique pastor 추출 또는 별도 `/api/v1/pastors/` 신설)
- `filters.pastor_id` 상태 + onFiltersChange 연결
- disabled 해제

### 의존
없음. 단순 필드 분기 추가로 처리 가능.

---

## 11. admin reservations 검색(`search`) 범위 확장

### 배경

`apps/api/reservations/views.py` `_build_admin_reservation_qs` 의 현재 검색 매칭 필드:

```python
if search := params.get("search"):
    qs = qs.filter(
        Q(applicant_name__icontains=search) | Q(applicant_phone__icontains=search)
    )
```

매칭은 `applicant_name`, `applicant_phone` 두 개만. 어드민 실무에서 자주 묻는 검색이 미지원:
- 부서/팀 이름으로 찾기 (예: "청년부" 입력 시 청년부 예약 모두)
- 목적으로 찾기 (예: "기도회" 입력 시 기도회 관련 예약 모두)

어드민이 결국 페이지를 넘기며 눈으로 훑는 방식에 갇힘.

### 요청 사항

다음 필드를 OR `icontains` 매칭으로 추가:

| 추가 필드 | 비고 |
|---|---|
| `applicant_team` | deprecated text 필드. 기존 데이터 호환 위해 유지 필요 |
| `custom_team_name` | 신규 자유입력 팀명 |
| `team__name` (FK) | 등록된 Team 의 이름 |
| `purpose` | 예약 목적 |

### 구현 가이드 (참고)

```python
if search := params.get("search"):
    qs = qs.filter(
        Q(applicant_name__icontains=search)
        | Q(applicant_phone__icontains=search)
        | Q(applicant_team__icontains=search)
        | Q(custom_team_name__icontains=search)
        | Q(team__name__icontains=search)
        | Q(purpose__icontains=search)
    )
```

### 테스트 추가

`apps/api/reservations/tests.py` 의 admin 검색 테스트에 다음 시나리오:
- 팀명(text)으로 검색 → 해당 팀 예약 반환
- custom_team_name 으로 검색 → 해당 예약 반환
- FK Team.name 으로 검색 → 해당 팀 예약 반환
- purpose 로 검색 → 해당 예약 반환
- 한 검색어가 여러 필드 매칭 시에도 중복 없이 반환

### 프론트 후속 작업

검색 placeholder 를 `"이름·전화 검색"` → `"이름·부서·목적·전화 검색"` 으로 변경. 위치: `apps/web/src/components/admin/ListFilterBar.tsx`.

---

## 12. admin reservations 정렬(`ordering`) 컬럼 확장

### 배경

`_build_admin_reservation_qs` 의 ordering 화이트리스트:

```python
ordering = params.get("ordering", "-start_datetime")
if ordering not in ("start_datetime", "-start_datetime"):
    ordering = "-start_datetime"
```

허용값: `start_datetime`, `-start_datetime` 두 개만. 그 외 모든 값은 silent 하게 기본값으로 정규화.

문제:
- `ListTable` 에서 "날짜" 컬럼만 정렬 토글 활성화 가능. 다른 컬럼은 헤더 클릭해도 동작 없음
- 어드민 자주 요청 시나리오:
  - 인원 많은 순 (큰 모임 우선 확인)
  - 최근 신청 순 (`created_at`)
  - 건물별 묶음 (`space__building__name`)
  - 신청자 이름 가나다순

### 요청 사항

다음 컬럼을 화이트리스트에 추가:

| ordering 값 | 정렬 기준 | 어드민 활용 |
|---|---|---|
| `start_datetime` / `-start_datetime` | 시작 시각 (현재 지원) | 기본 |
| `created_at` / `-created_at` | 신청 시각 | 최근 신청 확인 |
| `headcount` / `-headcount` | 예상 인원 | 큰 모임 우선 |
| `space__building__name` / `-space__building__name` | 건물명 | 건물별 묶음 |
| `applicant_name` / `-applicant_name` | 신청자 이름 | 가나다 정렬 |
| `status` / `-status` | 상태 | 상태 분류 (status 필터로 대체 가능, 우선순위 낮음) |

### 구현 가이드 (참고)

```python
ALLOWED_ORDERINGS = {
    "start_datetime", "-start_datetime",
    "created_at", "-created_at",
    "headcount", "-headcount",
    "space__building__name", "-space__building__name",
    "applicant_name", "-applicant_name",
    "status", "-status",
}

ordering = params.get("ordering", "-start_datetime")
if ordering not in ALLOWED_ORDERINGS:
    ordering = "-start_datetime"
```

### 테스트 추가

각 ordering 값에 대해:
- 정상 값 전달 시 해당 정렬 적용
- 허용 외 값 전달 시 silent 정규화 (`-start_datetime` 기본값)
- ascending / descending 둘 다 동작

### 프론트 후속 작업

`ListTable` 의 다른 컬럼(건물 / 이름 / 인원 등) 헤더에도 정렬 토글 활성화. ordering 매핑은 백엔드 화이트리스트와 동일.

---

## 13. admin reservations 전화번호 검색 정규화

### 배경

`applicant_phone__icontains=search` — 사용자가 검색창에 입력한 문자열을 **그대로** icontains 매칭.

문제:
- DB 저장 형식과 사용자 입력 형식 불일치:
  - 저장: `01012345678` (하이픈 없음)
  - 입력: `010-1234-5678` 또는 `010 1234 5678`
- 정상 전화번호로 검색해도 매칭 실패 케이스 발생

### 요청 사항

서버측에서 검색어와 DB 값 모두 비숫자 문자를 제거한 뒤 비교 (또는 둘 중 하나만이라도 정규화):

```python
import re

if search := params.get("search"):
    digits_only = re.sub(r"\D", "", search)
    phone_q = (
        Q(applicant_phone__icontains=digits_only) if digits_only else Q(pk__in=[])
    )
    qs = qs.filter(
        Q(applicant_name__icontains=search)
        | phone_q
        # ... 기타 필드
    )
```

또는 `applicant_phone` 저장 시점에 항상 숫자만 저장하도록 모델/serializer 에서 normalize 하고 검색은 그대로 두는 방법도 가능.

### 테스트 추가

- `"010-1234-5678"` 으로 검색 시 `01012345678` 로 저장된 예약 매칭
- `"010 1234"` (공백 포함) 으로 검색 시 부분 매칭

---

## 14. admin reservations 검색어 trim / 공백-only 가드

### 배경

`params.get("search")` 가 빈 문자열이 아니라 공백 문자열(`"   "`) 일 경우 walrus `:= search` 는 truthy 로 평가되어 `icontains="   "` 매칭 발생. 거의 항상 0건 반환.

### 요청 사항

```python
search_raw = params.get("search") or ""
search = search_raw.strip()
if search:
    qs = qs.filter(...)
```

프론트(`usePaginatedReservations.buildParams`)에서도 trim 후 빈 값은 파라미터 자체를 미전송하지만, 외부 API 호출자(봇/스크립트 등)도 있을 수 있으므로 서버측 가드 권장.

---

## 프론트 임시 처리 현황

위 미구현 항목들의 프론트 임시 처리:

| 항목 | 프론트 임시 처리 위치 | 임시 동작 |
|------|-------------------|---------|
| 통합 검색 | `AdminTopNav` (P5 예정) | 검색바 UI 만 표시, onChange noop |
| Space.photo_url | `SpaceStep` Room Card | placeholder SVG |
| 주간 KPI | `AdminKpiRow` (P5 예정) | weekly count / pending 클라 집계, 가동률·인기 공간 `—` |
| 담당 교역자 phone | `ApplicantStep` | `pastor_display` 만 사용, phone 미노출 |
| 공간 가동률 / 인기 공간 | `AdminKpiRow` | `—` 표시 |
| weekly_count | Room Card | "이번 주 N회" 항목 미표시 |
| department_name | DetailModal | `applicant_team`(팀 이름만) 표시, 부서 prefix 미적용 |
| Team.leader_phone 정합성 | DetailModal "담당교역자" | `leader_phone` 그대로 출력 — 시드 데이터에 pastor name이 들어와 우연히 사람 이름 표시됨 |
| 담당교역자 필터 (admin reservations) | `ListFilterBar` 사이드바 | "담당교역자 (준비 중) ▼" disabled select |

본 todo 가 해소되면 위 임시 처리 위치에서 `// TODO(backend):` 주석을 검색해 정리 가능.

---

## 관련 문서

- 디자인 명세: [`design_handoff_reservation_system/README.md`](../../design_handoff_reservation_system/README.md)
- Phase 2 마스터 플랜: [`docs/frontend/phase2-design-overhaul-plan.md`](../frontend/phase2-design-overhaul-plan.md) §8
- Phase 2 진행 상황: [`docs/frontend/phase2-progress.md`](../frontend/phase2-progress.md)
- F5 어드민 재구성: [`docs/frontend/phase2-progress.md`](../frontend/phase2-progress.md) §10

> 이전에 별도로 유지되던 `todo-admin-reservation-filter.md` (§1~§4) 는 2026-05-13 본 문서 §11~§14 로 흡수 + 원본 파일 삭제. 검색/정렬/전화번호 정규화/trim 가드 4 항목 모두 본 문서에서 추적.
