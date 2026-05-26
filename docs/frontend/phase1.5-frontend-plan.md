# Phase 1.5 프론트엔드 Plan — 1.5.2 / 1.5.3 백엔드 변경 누적 미적용분 연동

## Executive Summary

| 관점 | 내용 |
|------|------|
| **Problem** | 백엔드 1.5.2(Admin CRUD API) 와 1.5.3(예약 조회 API 개편) 변경이 누적되어 프론트엔드에 (1) 응답 포맷 breaking 으로 화면 깨짐 위험, (2) 신규 endpoint 미사용, (3) Admin CRUD UI 부재 |
| **Solution** | 긴급도 4단계(Tier) 로 분리 — T1 호환 패치 → T2 상태 변경 UI → T3 current/past 분리·페이징·서버필터 → T4 Admin CRUD UI |
| **UX Effect** | T1 즉시 안정화 / T3 관리자 페이지 체감 속도 개선 / T4 운영 자율성 확보 |
| **Core Value** | 백엔드가 이미 제공하는 능력을 프론트에서 전부 활용 가능하게 만든다 |

## Context Anchor

| 항목 | 내용 |
|------|------|
| **WHY** | 백엔드 API 가 두 단계 앞서 있고 프론트가 따라잡지 못한 상태. 응답 포맷 breaking 은 운영 시 화면이 빈 상태로 표시될 수 있어 즉시 처리 필요 |
| **WHO** | 관리자(AdminPage), 예약 신청자(ReservationPage), 운영팀(Admin CRUD) |
| **RISK** | 부분 적용 시 응답 포맷 불일치로 기존 기능까지 깨질 수 있음. Tier 단위로 분리해 영향 범위 최소화 |
| **SUCCESS** | (1) 응답 포맷 호환 (2) current/past 분리 동작 (3) 페이징·서버필터 동작 (4) 마스터 데이터 CRUD UI 동작 |
| **SCOPE** | `apps/web/src/**` 만. 백엔드 변경 없음. 테스트도 함께 갱신 |

---

## 1. Tier 개요

| Tier | 목표 | 긴급도 | 백엔드 phase | 영향 범위 |
|------|------|--------|-------------|-----------|
| T1 | 응답 포맷 호환 — 화면 깨짐 방지 | 🔥 긴급 | 1.5.3 | AdminPage, LookupForm, 타입 |
| T2 | 예약 상태 변경 UI (pending→confirmed/rejected) | 중 | 1.5.2 | ReservationDetailModal, AdminPage |
| T3 | current/past 분리 + 서버 필터·페이징 | 중 | 1.5.3 | AdminPage, ReservationTable, Pagination |
| T4 | Admin CRUD UI — Team / Building / Space | 낮음 (운영 자율성) | 1.5.2 | AdminPage 내부 탭 + 신규 섹션 다수 |

### 의존성

```
T1 (호환 패치)
  └─► T3 (current/past + 페이징) — T1 위에서 구조 정리
T2 (상태 변경 UI) — T1 위에서 동작, T3 와 독립 (백엔드 pending 도입 여부 확인 후 진행)
T4 (Admin CRUD)  — T1~T3 와 독립, AdminPage 내부 탭으로 통합
```

---

## 2. Tier 1 — 응답 포맷 호환 (1.5.3)

### 목적
phase 1.5.3 로 인해 `/admin/reservations/`, `/reservations/` 응답이 `Reservation[]` → `{count, page, page_size, total_pages, results}` 로 변경됨. 현재 프론트는 배열을 가정하므로 화면이 비어버리거나 런타임 에러 발생.

### Scope
최소 변경으로 응답 포맷만 호환. `response.data.results` 만 추출해 기존 클라이언트 사이드 로직을 그대로 살린다. 페이징 UI / current/past 분리 / 서버 사이드 필터 전환은 T3.

### 모듈
| ID | 파일 | 변경 |
|----|------|------|
| T1-M1 | `pages/AdminPage.tsx` | `axios.get<Reservation[]>` → `axios.get<PaginatedResponse<Reservation>>`. `page_size=100` 임시 사용 |
| T1-M2 | `components/LookupForm.tsx` | 동일 패턴 |
| T1-M3 | `types/index.ts` | `PaginatedResponse<T>` 제네릭 타입 추가 |
| T1-M4 | `__tests__/AdminPage.test.tsx` | mock 응답을 페이징 객체로 갱신 |

### 성공 기준
- [x] `pnpm --filter web test` 통과 — AdminPage 20/20
- [x] AdminPage 진입 시 예약 목록 표시
- [x] 예약 조회(LookupForm) 결과 표시
- [x] 빈 결과 (`count: 0`) 케이스에서 화면 정상

---

## 3. Tier 2 — 예약 상태 변경 UI (1.5.2)  *⛔ 보류*

### 목적
백엔드는 `PATCH /api/v1/admin/reservations/<pk>/status/` 로 pending → confirmed/rejected 를 지원하나 프론트에는 UI 없음.

### 사전 확인
백엔드 design 노트: *현재 예약 신청 시 자동 confirmed 처리 → pending 도입 시 StatusView 활성화*

→ **2026-05-12 사용자 결정**: 백엔드 pending 플로우 도입 미정 → **T2 보류**, T3 으로 점프. pending 도입 결정 시 재개.

### 모듈 (보류된 계획)
| ID | 파일 | 변경 |
|----|------|------|
| T2-M1 | `components/admin/ReservationDetailModal.tsx` | pending 일 때 "승인"/"거절" 버튼 노출, admin_note 입력 |
| T2-M2 | `pages/AdminPage.tsx` | `handleStatusChange` → `PATCH /admin/reservations/<id>/status/` |
| T2-M3 | 에러 분기 | `invalid_status_transition` / `conflict` 별 Toast |
| T2-M4 | 테스트 | pending 버튼 노출/미노출, 상태 변경 흐름 |

---

## 4. Tier 3 — current/past 분리 + 서버 필터·페이징 (1.5.3 전면 활용)

### 목적
phase 1.5.3 가 제공하는 능력을 프론트가 전부 활용:
- 신규 endpoint: `/admin/reservations/{current|past}/`, `/reservations/{current|past}/`
- 서버 사이드 필터: `from_date`, `to_date`, `space_id`, `building_id`, `search`, `ordering`
- 페이징: `page`, `page_size`, `total_pages`

기존의 클라이언트 사이드 `useMemo` 필터링 / `filter(end_datetime < now)` 분리 로직 제거.

### 게이트 결정 사항 (2026-05-12)
| 항목 | 결정 |
|------|------|
| Pagination UI 스타일 | (a) 숫자 페이지 버튼 `1 2 3 ... 마지막` |
| 캘린더 뷰 데이터 로드 전략 | 월 단위 한번에 로드 (페이징 없이 `page_size=100`) |

### 모듈
| ID | 파일 | 변경 |
|----|------|------|
| T3-M1 | `components/ui/Pagination.tsx` (신규) | 숫자 페이지 + 윈도 표시 + a11y |
| T3-M2 | `hooks/usePaginatedReservations.ts` (신규) | admin/public 공용. `{results, totalPages, isLoading, error, refetch}` |
| T3-M3 | `components/ReservationTable.tsx` | props 전환: `reservations` → `upcoming`+`past` |
| T3-M4 | `pages/ReservationPage.tsx` + `LookupForm` | LookupForm 책임 축소(credentials 입력 전용). ReservationPage 가 `Promise.all` 로 current/past 병렬 호출 |
| T3-M5 | `pages/AdminPage.tsx` | viewMode 별 상태 분리 — `calendarReservations` 와 `usePaginatedReservations(list)`. listTab/listPage/listFilters state |
| T3-M5b | `hooks/useSpaceOptions.ts` (신규) | `/admin/spaces/` 1회 호출, 모듈 캐시, is_active 필터 |
| T3-M6 | `components/admin/ListFilterBar.tsx` | 다중 선택/팀 필터 제거. 단일 선택 장소 dropdown(건물별 그룹핑) + 기간 dropdown + 검색 입력 |
| T3-M7 | `pages/AdminPage.tsx` | `filteredReservations` useMemo 제거 |
| T3-M8 | ListTable 에 Pagination 통합 (totalPages>1 시) |
| T3-M9 | 캘린더 모드 월 단위 `from_date/to_date` 로드 |
| T3-M10 | 테스트 갱신·추가 |

### PR 분할
- **PR-3A** — 공통 인프라 (Pagination, usePaginatedReservations) + Public 적용 (ReservationTable, LookupForm/Page)
- **PR-3B** — Admin viewMode 분리 + 서버 필터 + current/past 탭 + Pagination 통합 + 캘린더 월단위

### 성공 기준
- [x] 사용자: "예약 조회" 결과에서 예정/지난 탭이 서버 분리 데이터로 표시 (PR-3A)
- [x] 관리자: 리스트 모드에서 페이지 이동 가능 (PR-3B)
- [x] 관리자: 공간/날짜 범위/검색 변경 시 서버 재호출 (PR-3B)
- [x] 관리자: 캘린더 모드 월 단위 from_date/to_date 로드 (PR-3B)
- [x] 빈 결과 / 마지막 페이지 초과 케이스 처리 (PR-3B, useEffect 보정)
- [x] 테스트 통과

---

## 5. Tier 4 — Admin CRUD UI (1.5.2)

### 목적
Team / Building / Space 마스터 데이터를 관리자가 웹에서 직접 CRUD. 운영 자율성 확보.

### 게이트 결정 사항 (2026-05-12)
| 항목 | 결정 |
|------|------|
| Admin 메뉴 진입 위치 | **AdminPage 내부 탭** (예약/팀/건물/공간). 라우팅 변경 최소화 |
| react-router 도입 여부 | 이미 도입(`react-router-dom@^6`). 신규 라우트 추가 없이 내부 state |
| Pastor 드롭다운 후보 출처 | **(c) 1차 null-only** — TeamFormModal 에 pastor 필드 없음. 후속 phase 에서 재검토 |
| Department CRUD UI | T4 범위 외. Team form 에서 기존 Department 선택만 |
| Building 활성 Space 존재 시 DELETE | 토스트 단순 안내 (차단 모달 없음) |
| URL 공유 | 미지원 (해시/쿼리 미사용, 내부 state) |
| `is_active=false` 항목 | 클라이언트가 필터링하여 숨김 |

### 사전 검증 (2026-05-12 curl 결과)
| Endpoint | 응답 | 비고 |
|----------|------|------|
| `/admin/teams/` | 비페이징 배열 (217건) | `pastor_display` 필드 **없음** — 표시는 클라 조합 `${pastor.name} ${pastor.title}` |
| `/admin/buildings/` | 비페이징 배열 (3건) | design 일치 |
| `/admin/spaces/` | 비페이징 배열 (45건, is_active=false 5건 포함) | design 일치 |
| `/api/v1/departments/` | 비페이징 배열 (10건, nested teams 포함) | nested teams 에는 `pastor_display` 있음 |

### PR 분할
| PR | 모듈 | 의존 | 비고 |
|----|------|------|------|
| **PR-4A** | T4-A (섹션 탭 + ReservationsSection 추출) | 없음 | 회귀 위험 가장 큼 |
| **PR-4B** | T4-B (Team CRUD) | PR-4A | pastor 필드 없음 |
| **PR-4C** | T4-C (Building CRUD) | PR-4A | conflict 분기 |
| **PR-4D** | T4-D (Space CRUD) | PR-4A + PR-4C | building dropdown |

### 모듈
**T4-A. 라우팅·레이아웃 기반**
| ID | 변경 |
|----|------|
| T4-A-1 | `components/admin/SectionTabs.tsx` (신규) — 4개 탭 |
| T4-A-2 | `components/admin/ReservationsSection.tsx` (신규) — AdminPage 본문 추출 |
| T4-A-3 | `pages/AdminPage.tsx` — 슬림화 (200줄 미만 목표) |
| T4-A-4 | Teams/Buildings/Spaces placeholder 3건 |
| T4-A-5 | AdminPage.test 섹션 전환 테스트 추가 |

**T4-B. Team CRUD**
| ID | 변경 |
|----|------|
| T4-B-1 | `types/index.ts` — `AdminTeam`, `AdminTeamWritePayload` |
| T4-B-2 | `lib/adminApi/teams.ts` — list/create/update/delete |
| T4-B-3 | `lib/adminApi/errors.ts` — `getAdminErrorMessage`, `isAdminAuthError` |
| T4-B-4 | `hooks/useAdminTeams.ts` |
| T4-B-5 | 기존 `useDepartments` 재사용 (design 의 `useDepartmentOptions` 신설 보정) |
| T4-B-6 | `TeamListTable.tsx` — pastor 표시는 클라 조합 |
| T4-B-7 | `TeamFormModal.tsx` — name + department + leader_phone (pastor 필드 없음) |
| T4-B-8 | `TeamsSection.tsx` — CRUD 흐름 통합 |
| T4-B-9 | `ConfirmDeleteDialog.tsx` 공통 신규 |
| T4-B-10 | 테스트 |

**T4-C. Building CRUD**
| ID | 변경 |
|----|------|
| T4-C-1 | `types/index.ts` — `AdminBuilding`, `AdminBuildingWritePayload` |
| T4-C-2 | `lib/adminApi/buildings.ts` |
| T4-C-3 | `hooks/useAdminBuildings.ts` |
| T4-C-4 | `BuildingListTable.tsx` |
| T4-C-5 | `BuildingFormModal.tsx` — name + description optional textarea |
| T4-C-6 | `BuildingsSection.tsx` — conflict 분기 토스트 |
| T4-C-7 | 테스트 |

**T4-D. Space CRUD**
| ID | 변경 |
|----|------|
| T4-D-1 | `types/index.ts` — `AdminSpace`, `AdminSpaceWritePayload` |
| T4-D-2 | `lib/adminApi/spaces.ts` |
| T4-D-3 | `hooks/useAdminSpaces.ts` (useSpaceOptions 와 별개) |
| T4-D-4 | `SpaceListTable.tsx` — null floor/capacity 시 `-` |
| T4-D-5 | `SpaceFormModal.tsx` — building dropdown + name + floor + capacity + description |
| T4-D-6 | `SpacesSection.tsx` |
| T4-D-7 | 테스트 |

### 성공 기준
- [x] 관리자가 Team/Building/Space 를 생성/수정/소프트삭제 가능
- [x] Building 삭제 시 활성 Space 가 있으면 적절한 에러 메시지(토스트)
- [~] 유효성 검증 에러(`validation_error`) 시 표시 — 1차: 모달 상단 단일 `role="alert"`. 필드별 highlight 는 후속
- [~] 미인증(401) 시 처리 — 1차: 토스트 노출. 로그인 리다이렉트는 후속
- [x] 테스트 통과

---

## 6. 에러 응답 처리 (공통)

백엔드 표준: `{ "error": "error_code", "message": "한국어 메시지" }`

| 에러 코드 | HTTP | 처리 |
|----------|------|------|
| `validation_error` | 400 | FormModal 상단 `role="alert"` 메시지 |
| `conflict` | 400 | 토스트 노출, 다이얼로그 닫힘 |
| `invalid_status_transition` | 400 | (T2 보류) Toast 분기 예정 |
| `not_found` | 404 | 토스트 + refetch |
| (DRF 기본) | 401 | 토스트 (로그인 리다이렉트는 후속) |

공통 헬퍼: `lib/adminApi/errors.ts`
```typescript
function getAdminErrorMessage(error: unknown, fallback: string): string
function isAdminAuthError(error: unknown): boolean
```

---

## 7. 성공 기준 (Phase 1.5 전체)

- [x] T1 — 응답 포맷 호환 완료, 회귀 없음
- [⛔] T2 — 보류 (백엔드 pending 도입 결정 시 재개)
- [x] T3 — 페이징·서버 필터·current/past 분리 완료
- [x] T4 — Admin CRUD UI 완료 (Team/Building/Space 각 PR)
- [x] 신규 테스트 추가 + 전체 회귀 통과
- [x] tsc 0 에러

---

## 8. 비고

- 모든 작업은 `apps/web/src/**` 만. 백엔드 변경 없음
- T1/T3/T4 모두 `dev_zion` 직커밋 (사용자 지시. PR 분리 안 함)
- 1차 정책 (pastor null-only, is_active 클라 필터, conflict 토스트만) 은 후속 phase 에서 재검토
- 디테일한 작업 진행 로그(세션 단위)는 git history(`feat:`, `docs:` 커밋 메시지) 에 보관
