# Phase 1.5 프론트엔드 Design — 백엔드 API 누적 미적용분 연동

## Context Anchor

| 항목 | 내용 |
|------|------|
| **WHY** | T1 응답 포맷 호환, T3 페이징·서버 필터·current/past 활용, T4 Admin CRUD UI — 백엔드가 이미 제공하는 능력 전량 활용 |
| **WHO** | 관리자(AdminPage), 예약 신청자(ReservationPage), 운영팀(Admin CRUD 섹션) |
| **RISK** | Tier 간 의존성(T1→T3) / AdminPage 본문 추출 시 회귀 / FormModal·삭제 다이얼로그 패턴 일관성 / 캐시 무효화(CRUD 후 refetch) |
| **SUCCESS** | 4 Tier 의 모듈 인터페이스가 명세대로 동작 + 기존 화면 회귀 없음 + 테스트 갱신 |
| **SCOPE** | `apps/web/src/**` — 라우팅 변경 없음(이미 `react-router-dom@^6` 도입), 백엔드 변경 없음 |

---

## 1. Architecture Overview

**선택: 기존 코드 스타일 유지 + 책임 분리.**

기존 단일 컨테이너(AdminPage 436줄) 를 다음 구조로 분리:

```
AdminPage (인증 + section state + Toast 컨테이너만, 68줄)
└── SectionTabs (예약 / 팀 / 건물 / 공간)
    ├── ReservationsSection      (기존 AdminPage 본문 추출)
    ├── TeamsSection             (T4-B)
    ├── BuildingsSection         (T4-C)
    └── SpacesSection            (T4-D)
```

핵심 원칙:
- **AdminPage 는 인증·섹션 스위칭·Toast 만 책임**. 모든 도메인 로직은 섹션 컴포넌트로 위임
- 각 섹션은 **독립적인 fetch/state/mutation 사이클**. 다른 섹션과 데이터 공유 없음
- 비활성 섹션의 컴포넌트는 mount 되지 않음 (조건부 렌더). 다른 섹션의 API 호출 트리거 방지
- axios 호출은 `lib/adminApi/*` 에 분리. 컴포넌트 테스트의 mock 용이화
- **URL 공유 불가** (해시/쿼리 미사용) — 1차 정책

---

## 2. 디렉토리 구조 (신규/변경)

```
apps/web/src/
├── pages/
│   ├── AdminPage.tsx                                  ← 슬림화 (436→68줄)
│   └── ReservationPage.tsx                            ← lookup 흐름 갱신 (T3-M4)
├── components/
│   ├── LookupForm.tsx                                 ← 책임 축소: credentials 입력 전용 (T3-M4)
│   ├── ReservationTable.tsx                           ← props 전환: upcoming/past (T3-M3)
│   ├── ui/
│   │   └── Pagination.tsx                             ← 신규 (T3-M1)
│   └── admin/
│       ├── SectionTabs.tsx                            ← 신규 (T4-A-1)
│       ├── ReservationsSection.tsx                    ← 신규 (T4-A-2)
│       ├── ConfirmDeleteDialog.tsx                    ← 신규 (T4-B-9, 공통)
│       ├── ListFilterBar.tsx                          ← 시그니처 전환 (T3-M6)
│       ├── teams/
│       │   ├── TeamsSection.tsx
│       │   ├── TeamListTable.tsx
│       │   └── TeamFormModal.tsx
│       ├── buildings/
│       │   ├── BuildingsSection.tsx
│       │   ├── BuildingListTable.tsx
│       │   └── BuildingFormModal.tsx
│       └── spaces/
│           ├── SpacesSection.tsx
│           ├── SpaceListTable.tsx
│           └── SpaceFormModal.tsx
├── hooks/
│   ├── usePaginatedReservations.ts                    ← 신규 (T3-M2)
│   ├── useSpaceOptions.ts                             ← 신규 (T3-M5b, reservation 필터용)
│   ├── useAdminTeams.ts                               ← 신규 (T4-B-4)
│   ├── useAdminBuildings.ts                           ← 신규 (T4-C-3)
│   ├── useAdminSpaces.ts                              ← 신규 (T4-D-3, admin CRUD 용, useSpaceOptions 와 분리)
│   └── useDepartments.ts                              ← 재사용 (테스트용 reset 추가)
├── lib/
│   └── adminApi/
│       ├── errors.ts                                  ← 신규 (T4-B-3)
│       ├── teams.ts                                   ← 신규 (T4-B-2)
│       ├── buildings.ts                               ← 신규 (T4-C-2)
│       └── spaces.ts                                  ← 신규 (T4-D-2)
└── types/index.ts                                     ← 타입 추가 (T1-M3, T4-B-1, T4-C-1, T4-D-1)
```

---

## 3. 타입 설계

### 3.1 공통 응답 포맷 (T1)

```typescript
export interface PaginatedResponse<T> {
  count: number;
  page: number;
  page_size: number;
  total_pages: number;
  results: T[];
}
```

### 3.2 Admin CRUD 타입 (T4)

```typescript
// Team — pastor 객체에 pastor_display 없음 (사전 검증 반영). 표시는 클라 조합
export interface AdminTeamPastor   { id: number; name: string; title: string }
export interface AdminTeamDepartment { id: number; name: string }
export interface AdminTeam {
  id: number;
  name: string;
  department: AdminTeamDepartment | null;
  pastor: AdminTeamPastor | null;
  leader_phone: string;
  is_active: boolean;
  created_at: string;
}
export interface AdminTeamWritePayload {
  name: string;
  department: number | null;   // FK id
  pastor: number | null;       // 1차: 항상 null
  leader_phone: string;
}

// Building
export interface AdminBuilding {
  id: number;
  name: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
}
export interface AdminBuildingWritePayload {
  name: string;
  description: string | null;
}

// Space
export interface AdminSpaceBuilding {
  id: number;
  name: string;
  description: string | null;
}
export interface AdminSpace {
  id: number;
  building: AdminSpaceBuilding;
  name: string;
  floor: number | null;
  capacity: number | null;
  description: string | null;
  is_active: boolean;
  created_at: string;
}
export interface AdminSpaceWritePayload {
  building: number;  // FK id (required)
  name: string;
  floor: number | null;
  capacity: number | null;
  description: string | null;
}
```

---

## 4. 데이터 흐름

### 4.1 Public lookup (T3-M4)

```
ReservationPage
└── lookupCredentials 입력 후
    ├── GET /reservations/current/?name=&phone=&page_size=100  → upcoming
    └── GET /reservations/past/?name=&phone=&page_size=100      → past
        ↓
        ReservationTable receives { upcoming, past } props
        (클라이언트 분리 로직 제거)
```

LookupForm 책임: credentials 입력 전용. 호출은 ReservationPage 가 담당.

### 4.2 Admin AdminPage / ReservationsSection (T3-M5~M9)

```
AdminPage
└── ReservationsSection
    ├── viewMode: 'calendar'
    │   └── fetchCalendar(year, month)
    │       └── GET /admin/reservations/?from_date=YYYY-MM-01&to_date=YYYY-MM-31&page_size=100
    │           → calendarReservations: Reservation[]
    │
    └── viewMode: 'list'
        ├── listTab: 'current' | 'past'
        └── usePaginatedReservations({ endpoint, filters, page })
            ├── GET /admin/reservations/{current|past}/?page=&page_size=&space_id=&from_date=&to_date=&search=&ordering=
            └── { results, totalPages, isLoading, error, refetch }
```

- **Calendar 와 List 는 독립된 상태**. mode 전환 시 refetch.
- 페이지 안전장치: 응답 `totalPages > 0 && listPage > totalPages` 면 자동 보정.

### 4.3 Admin CRUD (T4)

```
SectionTabs → 활성 Section 마운트
└── Section (Teams / Buildings / Spaces)
    ├── useAdmin<Resource>({ authToken })      ← 마운트 시 GET
    │   └── filterActive(list)                 ← is_active=false 클라 필터
    │
    ├── 사용자 액션 "추가" → FormModal (mode='create')
    │   └── createX(token, payload)
    │       ├── 성공: showToast + refetch + 모달 닫힘
    │       └── 실패: getAdminErrorMessage → 모달 상단 alert
    │
    ├── 사용자 액션 행"수정" → FormModal (mode='edit', entity)
    │   └── updateX(token, id, payload)
    │
    └── 사용자 액션 행"삭제" → ConfirmDeleteDialog
        └── deleteX(token, id)
            ├── 성공: showToast + refetch
            └── 실패(예: Building conflict): getAdminErrorMessage → showToast
```

---

## 5. 공통 패턴

### 5.1 axios wrapper (lib/adminApi/*)

각 리소스마다 4개 함수만:
```typescript
async function listX(token: string): Promise<AdminX[]>
async function createX(token: string, payload: AdminXWritePayload): Promise<AdminX>
async function updateX(token: string, id: number, payload: Partial<AdminXWritePayload>): Promise<AdminX>
async function deleteX(token: string, id: number): Promise<void>
```

- `Authorization: Token <token>` 헤더는 wrapper 내부에서 부착
- 응답 배열 검증 (`Array.isArray(response.data) ? response.data : []`)
- 에러는 axios 가 던지는 그대로 throw. 호출 측에서 narrow

### 5.2 useAdmin<Resource> 훅

```typescript
interface UseAdminXResult {
  items: AdminX[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

function useAdminX(args: { authToken: string | null; enabled?: boolean }): UseAdminXResult
```

- 마운트 시 / `authToken` 변경 시 / `refetch()` 호출 시 fetch
- `enabled === false` 또는 `authToken === null` 이면 skip
- 1차 캐시 미적용 (단순). 단 useSpaceOptions / useDepartments 는 모듈 캐시 사용 (reservation 필터/dropdown 후보 용도)

### 5.3 FormModal (Team / Building / Space 공용 시그니처)

```typescript
interface FormModalProps<TEntity, TPayload> {
  isOpen: boolean;
  mode: 'create' | 'edit';
  entity: TEntity | null;
  isSubmitting: boolean;
  errorMessage: string | null;
  onSubmit: (payload: TPayload) => Promise<void>;
  onClose: () => void;
  // TeamFormModal: departments: ApiDepartment[]
  // SpaceFormModal: buildings: AdminBuilding[]
}
```

UX 규칙:
- 모달 헤더: `'{리소스명} 추가'` / `'{리소스명} 수정'`
- 필수 필드 빈 값이면 submit 비활성 (HTML5 `required` + JS `isValid` 조합)
- `isSubmitting` 동안 모든 입력·버튼 비활성
- `errorMessage` 가 있으면 모달 상단 `role="alert"` 빨간 영역 노출
- ESC 키 / 오버레이 클릭 시 닫힘 (단 `isSubmitting` 동안 차단)

### 5.4 ConfirmDeleteDialog (공통)

```typescript
interface ConfirmDeleteDialogProps {
  isOpen: boolean;
  title: string;            // "팀 '대림1' 을(를) 삭제하시겠습니까?"
  description?: string;
  onConfirm: () => void | Promise<void>;
  onClose: () => void;
  isLoading: boolean;
}
```

- `role="dialog"`, `aria-modal="true"`, `aria-labelledby`
- 모든 마스터 데이터 삭제는 백엔드 소프트삭제(`is_active=False`)지만 화면 문구는 단순히 "삭제"

### 5.5 에러 메시지 분기 (lib/adminApi/errors.ts)

```typescript
function getAdminErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { error?: string; message?: string } | undefined;
    if (data?.message) return data.message;
  }
  return fallback;
}

function isAdminAuthError(error: unknown): boolean {
  return axios.isAxiosError(error) && error.response?.status === 401;
}
```

- 1차 결정: 401 시 토스트만, 로그인 리다이렉트는 후속 phase

---

## 6. 핵심 컴포넌트 시그니처

### 6.1 Pagination (T3-M1)

```typescript
interface PaginationProps {
  page: number;                   // 1-indexed
  totalPages: number;
  onChange: (next: number) => void;
  isLoading?: boolean;
}
```

UI 규칙: 숫자 페이지 + 윈도 표시 (`1 2 3 ... 마지막`), a11y `role="navigation" aria-label="페이지네이션"`

### 6.2 usePaginatedReservations (T3-M2)

```typescript
interface PaginatedReservationsFilters {
  from_date?: string; to_date?: string;
  space_id?: number; building_id?: number;
  search?: string; ordering?: string;
}

interface UsePaginatedReservationsResult {
  results: Reservation[];
  count: number;
  page: number;
  totalPages: number;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}
```

- `filters` 변경 추적은 `JSON.stringify` 정규화

### 6.3 SectionTabs (T4-A-1)

```typescript
type AdminSection = 'reservations' | 'teams' | 'buildings' | 'spaces';

interface SectionTabsProps {
  active: AdminSection;
  onChange: (next: AdminSection) => void;
}
```

- `aria-current="page"`, 비활성 섹션 컴포넌트 unmount 보장

### 6.4 Section 컴포넌트 (Teams/Buildings/Spaces)

```typescript
interface SectionProps {
  authToken: string;
  showToast: (message: string, type?: 'error' | 'success') => void;
}
```

- AdminPage 가 `useToast()` 를 보유하고 `showToast` 를 props 로 내려줌 (Toast Context 미도입, 1차 결정)

---

## 7. 폼/입력 변환 규칙

| 필드 | 입력 | 전송 |
|------|------|------|
| name (required) | text | `trim()` 후 그대로 |
| description (optional) | textarea | `trim()` 결과가 빈 문자열이면 `null` |
| floor / capacity (optional) | number | 빈 문자열 → `null`, 숫자 → `Number(value)` (`Number.isFinite` 체크) |
| department / building (FK select) | string `<select>` value | `Number(value)`. 빈 문자열은 미선택으로 invalid 처리 |
| pastor (T4-B) | (입력 없음) | 항상 `null` (1차 결정) |

---

## 8. 정렬·필터·페이징 규칙 (T3)

### 캘린더 모드
- 매월 1회 fetch: `from_date=YYYY-MM-01&to_date=YYYY-MM-{lastDay}&page_size=100&ordering=-start_datetime`
- 페이징 없음. 100건 cap (월 단위 상한)

### 리스트 모드
- 기본 페이지: 1
- pageSize: 20
- 기본 필터(예정 탭): 오늘 ~ +7일
- 검색: 매 글자 즉시 호출 (디바운스 미도입 — 후속 개선 후보)
- 페이지 안전장치: `useEffect` 로 응답 `totalPages > 0 && listPage > totalPages` 면 보정

### Public lookup
- 페이징 미사용. `page_size=100` 으로 current/past 각 1회
- (사용자별 데이터 양이 적음 — 1차 가정)

---

## 9. 가정 및 위험 사항

| 가정 | 검증 | 실패 시 대응 |
|------|------|--------------|
| `/admin/teams/`, `/buildings/`, `/spaces/` 는 비페이징 배열 | T4 사전 검증 curl 완료 (2026-05-12) | (해소) — design 일치 확인 |
| `/admin/teams/` 응답에 `pastor_display` 있음 | T4 사전 검증 (없음 확인) | **해소** — 클라 조합 방식으로 보정 |
| `is_active=false` 항목도 GET 에 포함됨 | 백엔드 design 확인 + spaces 응답 5건 확인 | 1차: 클라이언트 필터링. 후속에서 "비활성 표시" 토글 검토 |
| AdminPage.test 25건이 ReservationsSection 추출 후에도 통과 | PR-4A 구현 후 실행 (그대로 통과 확인) | (해소) |
| T4-B FormModal 의 department dropdown 후보는 기존 `useDepartments` 로 충분 | 코드 확인 (이미 `/api/v1/departments/` 호출, 캐시 보유) | 신규 `useDepartmentOptions` 신설 안 함 (design 보정) |
| Toast 단일 인스턴스 (AdminPage 의 `useToast`) 가 모든 섹션에 충분 | PR-4A 구현 시 적용 | 다중 Toast Provider 필요 시 Context 도입 검토 (후속) |

---

## 10. 테스트 전략

| 레벨 | 대상 | 도구 |
|------|------|------|
| 단위 | Pagination, ListTable/FormModal 각 3종, useAdmin* 훅 | vitest + RTL + userEvent |
| 통합 | TeamsSection / BuildingsSection / SpacesSection CRUD 흐름 | axios mock (+ fetch stub for useDepartments) |
| 회귀 | AdminPage 25건 (PR-4A 후에도 통과 유지) | vitest |
| 섹션 mock | AdminPage.test 의 섹션 컴포넌트 stub 처리 (단위 테스트 원칙) | `vi.mock('../components/admin/teams/TeamsSection')` 등 |
| E2E (보류) | Playwright 자동 검증 — 로그인 후 4섹션 순회 + CRUD | 후속 (CORS 정리 후) |

---

## 11. 후속 개선 후보

| 항목 | 영향 Tier | 비고 |
|------|----------|------|
| Pastor 입력 활성화 | T4-B | 백엔드 endpoint 또는 useDepartments nested teams 활용 |
| Department CRUD UI | (신규) | 운영팀 피드백 보고 결정 |
| Building conflict 차단 모달 (UX 강화) | T4-C | 1차는 토스트 |
| validation_error 필드별 highlight | T4 공통 | 1차는 모달 상단 단일 메시지 |
| 401 → 로그인 페이지 리다이렉트 | 공통 | 1차는 토스트만 |
| 검색 입력 디바운스 | T3 | 매 글자마다 서버 호출 회피 |
| `is_active=false` 표시 토글 | T4 공통 | 비활성 항목 노출 옵션 |
| Toast Context Provider | 공통 | 다중 인스턴스 관리 시 |
| T2 재개 — 상태 변경 UI | T2 | 백엔드 pending 도입 결정 시 |
