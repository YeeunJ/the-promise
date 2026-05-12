# Phase 1.5 프론트엔드 완료 보고서 — 백엔드 API 누적 미적용분 연동

**작성일**: 2026-05-12
**브랜치**: `dev_zion` (직커밋, PR 분리 안 함)
**Match Rate**: 75% (T1·T3·T4 완료 / T2 보류)

---

## Executive Summary

| 관점 | 계획 | 실제 결과 |
|------|------|-----------|
| **Problem** | 백엔드 1.5.2/1.5.3 변경 누적으로 화면 깨짐 위험 + 신규 endpoint 미사용 + Admin CRUD UI 부재 | 해결됨 — T1/T3/T4 모두 구현. T2 만 백엔드 pending 정책 미정으로 보류 |
| **Solution** | 4 Tier 분리 (T1 호환 → T2 상태UI → T3 페이징·필터 → T4 Admin CRUD) | 달성 — T1/T3/T4 코드+테스트 완료, T2 는 사용자 결정으로 보류 |
| **UX Effect** | T1 즉시 안정화 / T3 관리자 페이지 체감 속도 개선 / T4 운영 자율성 | T1·T3 단위·통합 테스트 검증 + Playwright 자동 검증, T4 단위·통합 테스트 검증 (브라우저 수동 검증은 CORS 정리 후 사용자 측 진행) |
| **Core Value** | 백엔드가 이미 제공하는 능력을 프론트가 전부 활용 | 달성 (T2 제외) |

### Value Delivered

- **응답 포맷 호환** — `PaginatedResponse<T>` 도입, AdminPage / LookupForm 의 응답 처리 일괄 갱신
- **공통 인프라 신설** — Pagination, usePaginatedReservations, useSpaceOptions, useAdmin{Teams,Buildings,Spaces}, lib/adminApi/{errors,teams,buildings,spaces}, ConfirmDeleteDialog
- **AdminPage 슬림화** — 436줄 → 68줄 (-368). 섹션 탭 + 4개 섹션 컴포넌트로 책임 분리
- **Admin CRUD UI 3종** — Team / Building / Space 각각 ListTable + FormModal + Section 패턴
- **테스트 신규 54건** 추가 (PR-4A 4 + PR-4B 19 + PR-4C 15 + PR-4D 16). 전체 424/424 그린

---

## 1. 배경 및 목적

### 1.1 문제 정의

백엔드는 두 단계 앞서 있었다:
- **phase 1.5.2 (2026-04-18 머지)** — Admin CRUD API 8종 추가
- **phase 1.5.3 (2026-05-10 머지)** — 예약 조회 응답 포맷 breaking 변경 + 신규 endpoint(current/past) + 서버 사이드 필터·페이징

프론트엔드는 두 phase 모두 미적용 상태였다.

### 1.2 위험

1. **응답 포맷 breaking** — `/admin/reservations/`, `/reservations/` 응답이 배열 → `{count, page, ..., results}` 로 변경되어 운영 시 화면이 빈 상태로 표시될 위험
2. **운영 자율성 부재** — 마스터 데이터(Team/Building/Space) 변경 시 개발자 개입 필요

### 1.3 목표

1. 즉시 안정화 (T1)
2. 백엔드 1.5.3 의 페이징·필터·current/past 능력 전량 활용 (T3)
3. 마스터 데이터 CRUD UI 구현 (T4)
4. 백엔드 1.5.2 의 pending 상태 변경 UI (T2) — 백엔드 정책 결정 시 재개

---

## 2. 구현 내용

### 2.1 Tier 1 — 응답 포맷 호환 (1.5.3)

**커밋**: T1 호환 패치 + 시간 의존 테스트 결정론화 (`vi.setSystemTime` 도입)

| 모듈 | 변경 |
|------|------|
| `types/index.ts` | `PaginatedResponse<T>` 제네릭 추가 |
| `pages/AdminPage.tsx` | `axios.get<Reservation[]>` → `axios.get<PaginatedResponse<Reservation>>`. `params: { page_size: 100, ordering: '-start_datetime' }` |
| `components/LookupForm.tsx` | 동일 패턴 |
| `__tests__/AdminPage.test.tsx` | `paginated()` 헬퍼 + mock 갱신 + `vi.useFakeTimers + vi.setSystemTime('2026-04-16T09:00:00+09:00')` |

**검증**: AdminPage 20/20, 전체 328/329 (CalendarGrid 1건은 T1 무관 디자인 이슈, 후속에서 해소)

### 2.2 Tier 2 — 예약 상태 변경 UI (1.5.2)  *⛔ 보류*

**상태**: 사용자 결정 — 백엔드 pending 플로우 도입 미정으로 T2 보류, T3 으로 점프.

설계만 plan 에 보존. 백엔드 pending 도입 시 재개.

### 2.3 Tier 3 — 페이징·서버 필터·current/past (1.5.3)

**커밋**: PR-3A (인프라 + Public) `5d9f61e` / PR-3B (Admin) `68b3629`

| 모듈 | 변경 |
|------|------|
| `components/ui/Pagination.tsx` (신규) | 숫자 페이지 + 윈도 표시 + a11y `role="navigation"` |
| `hooks/usePaginatedReservations.ts` (신규) | admin/public 공용, `filters` JSON.stringify 정규화 |
| `components/ReservationTable.tsx` | props 전환 `reservations` → `upcoming` + `past` |
| `pages/ReservationPage.tsx` + `LookupForm` | LookupForm 책임 축소(credentials 입력). ReservationPage 가 Promise.all 로 current/past 병렬 호출 |
| `pages/AdminPage.tsx` | viewMode 별 상태 분리: `calendarReservations` (월단위 100건) + `usePaginatedReservations`(list). `filteredReservations` useMemo 제거 |
| `hooks/useSpaceOptions.ts` (신규) | `/admin/spaces/` 1회 호출, 모듈 캐시, is_active 필터 |
| `components/admin/ListFilterBar.tsx` | 시그니처 전환 — 다중 선택/팀 필터 제거, 단일 선택 장소 dropdown(건물별 그룹핑) + 기간 dropdown + 검색 |

**검증**: Playwright 자동 검증으로 endpoint 호출 정확성 확인 (calendar `from_date/to_date` / list `current`·`past` 분기 / 검색 `search=` URL 인코딩 / 장소 단일 선택 `space_id=` / 기간 변경 `to_date` 갱신). 전체 369/370 그린.

### 2.4 Tier 4 — Admin CRUD UI (1.5.2)

**커밋**: PR-4A `4518913` / PR-4B `74a7b46` / PR-4C `b41de33` / PR-4D `e71dec3`

#### PR-4A — 라우팅·레이아웃 기반

| 파일 | 변경 |
|------|------|
| `components/admin/SectionTabs.tsx` (신규) | 4개 탭 (예약/팀/건물/공간) + `aria-current` |
| `components/admin/ReservationsSection.tsx` (신규) | AdminPage 본문(50~436 line) 통째 추출. props: `authToken`, `showToast` |
| `pages/AdminPage.tsx` | **436줄 → 68줄**. 인증·section state·SectionTabs·Toast·AdminLoginForm 만 |
| `components/admin/teams|buildings|spaces/*Section.tsx` | 각각 "준비 중" placeholder |
| `__tests__/AdminPage.test.tsx` | 기존 25건 그대로 + 섹션 전환 신규 4건 (`vi.mock` 으로 섹션 stub) |

#### PR-4B — Team CRUD

| 파일 | 변경 |
|------|------|
| `types/index.ts` | `AdminTeam`, `AdminTeamWritePayload`, `AdminTeamPastor`, `AdminTeamDepartment` |
| `lib/adminApi/errors.ts` (신규) | `getAdminErrorMessage(error, fallback)`, `isAdminAuthError(error)` |
| `lib/adminApi/teams.ts` (신규) | list/create/update/delete (token 명시적 전달) |
| `hooks/useAdminTeams.ts` (신규) | list + refetch, is_active=false 클라 필터 |
| `hooks/useDepartments.ts` | 테스트용 `__resetDepartmentsCacheForTest` 추가 (재사용 보정) |
| `components/admin/teams/{TeamListTable,TeamFormModal,TeamsSection}.tsx` | CRUD 흐름 통합 |
| `components/admin/ConfirmDeleteDialog.tsx` (신규, 공통) | role="dialog" + ESC + 오버레이 + isLoading 가드 |

**보정 사항**: design 의 `useDepartmentOptions` 신설 대신 **기존 `useDepartments` 재사용**. 코드 변경 최소화.

#### PR-4C — Building CRUD

| 파일 | 변경 |
|------|------|
| `types/index.ts` | `AdminBuilding`, `AdminBuildingWritePayload` |
| `lib/adminApi/buildings.ts` (신규) | 4개 함수 |
| `hooks/useAdminBuildings.ts` (신규) | list + refetch |
| `components/admin/buildings/{BuildingListTable,BuildingFormModal,BuildingsSection}.tsx` | name(required) + description optional textarea. 삭제 시 conflict 응답 message 토스트 노출 |

#### PR-4D — Space CRUD

| 파일 | 변경 |
|------|------|
| `types/index.ts` | `AdminSpace`, `AdminSpaceWritePayload`, `AdminSpaceBuilding` |
| `lib/adminApi/spaces.ts` (신규) | 4개 함수 |
| `hooks/useAdminSpaces.ts` (신규) | `useSpaceOptions` 와 분리 (책임: filter 용 vs admin CRUD) |
| `components/admin/spaces/{SpaceListTable,SpaceFormModal,SpacesSection}.tsx` | building dropdown(useAdminBuildings) + name + floor + capacity + description. 숫자 빈문자열→`null` 변환. 건물 0개 시 "+ 공간 추가" 비활성 |

---

## 3. 성공 기준 최종 평가

| Tier | 기준 | 상태 | 근거 |
|------|------|------|------|
| T1 | 응답 포맷 호환, 빈 결과 정상 | ✅ Met | Playwright 자동 검증 통과, 전체 테스트 그린 |
| T2 | pending → confirmed/rejected UI | ⛔ Deferred | 백엔드 pending 정책 미정으로 보류 |
| T3 | current/past 분리 + 페이징 + 서버 필터 | ✅ Met | Playwright 자동 검증으로 endpoint·파라미터 정확성 확인 |
| T3 | 캘린더 월 단위 from_date/to_date | ✅ Met | PR-3B 적용 확인 |
| T3 | 페이지 보정 (응답 totalPages 초과 시) | ✅ Met | useEffect 자동 보정 |
| T4 | Team/Building/Space 생성/수정/소프트삭제 | ✅ Met | 단위·통합 테스트 검증 (PR-4B/C/D) |
| T4 | Building conflict 시 에러 메시지 | ✅ Met (1차) | `getAdminErrorMessage` 가 백엔드 `{error:'conflict', message}` 의 message 추출 후 토스트 노출 |
| T4 | validation_error 시 표시 | ~ Partial | 1차: 모달 상단 단일 `role="alert"`. 필드별 highlight 는 후속 |
| T4 | 401 처리 | ~ Partial | 1차: `isAdminAuthError` 판정 후 토스트. 로그인 리다이렉트는 후속 |
| 공통 | 테스트 통과 | ✅ Met | 신규 54건 + 전체 424/424 그린, tsc 0 에러 |
| 공통 | AdminPage 슬림화 (200줄 미만) | ✅ Met | 68줄 |

---

## 4. 주요 결정 사항

| 결정 | 선택 | 결과 |
|------|------|------|
| T2 진행 여부 | 백엔드 pending 미정 → 보류 | 후속 phase 재개 |
| T3 Pagination UI | (a) 숫자 페이지 버튼 `1 2 3 ... 마지막` | UX 단순, 키보드 접근성 확보 |
| T3 캘린더 로드 전략 | 월 단위 한번에 (`page_size=100`) | 페이징 복잡도 회피 |
| T3 LookupForm 책임 | credentials 입력 전용으로 축소 | 네트워크 호출은 ReservationPage 가 담당, 책임 분리 |
| T3 장소 필터 | 단일 선택 dropdown(건물별 그룹핑) | 백엔드 `space_id` 단일 파라미터와 1:1 매칭. 다중 선택 UX 후퇴 수용 |
| T4 Admin 메뉴 위치 | AdminPage 내부 탭 | 라우팅 변경 최소화. URL 공유 미지원 수용 |
| T4 Pastor 필드 | (c) 1차 null-only — FormModal 입력 없음 | 후속 phase 운영 피드백 보고 재검토 |
| T4 Department CRUD UI | T4 범위 외 — Team form 에서 dropdown 선택만 | 후속 phase 검토 |
| T4 Building conflict | 토스트 단순 안내 | 차단 모달은 후속 (UX 강화) |
| T4 `is_active=false` | 클라이언트 필터링 | 후속에서 "비활성 표시" 토글 |
| T4 Toast | AdminPage 가 `useToast` 보유, `showToast` props 내림 | Context Provider 도입 회피 (1차) |
| T4 AdminPage.test | 섹션 컴포넌트 `vi.mock` stub | 단위 테스트 원칙 — AdminPage 책임은 마운트/언마운트만 |
| T4 useDepartments | 기존 재사용 (design 의 useDepartmentOptions 신설 보정) | 코드 변경 최소화 |
| 사전 검증 — AdminTeam pastor | `pastor_display` 없음 발견 | design 보정 → 클라 조합 `${pastor.name} ${pastor.title}` |
| 커밋 전략 | dev_zion 직커밋, PR 분리 안 함 | 사용자 지시 |
| 코드/문서 커밋 분리 | feat / docs 별도 커밋 | memory 정책 반영 |

---

## 5. 사전 검증 (curl)

2026-05-12 admin token (`92b9b91e...`) 으로 4 endpoint 호출:

| Endpoint | 응답 | 비고 |
|----------|------|------|
| `/admin/teams/` | 비페이징 배열 (217건) | **`pastor_display` 없음** → design 보정 |
| `/admin/buildings/` | 비페이징 배열 (3건) | design 일치 |
| `/admin/spaces/` | 비페이징 배열 (45건, is_active=false 5건 포함) | design 일치 |
| `/api/v1/departments/` | 비페이징 배열 (10건, nested teams 포함) | nested teams 에는 `pastor_display` 있음 |

---

## 6. 후속 과제

| 항목 | 우선순위 | 내용 |
|------|---------|------|
| 브라우저 수동 검증 | 즉시 (사용자 측) | 5173 점유 정리 → 모든 CRUD 흐름 점검 |
| T2 재개 | 중 | 백엔드 pending 도입 결정 후 |
| Pastor 입력 활성화 | 중 | 운영팀 피드백 보고 endpoint 추가 또는 useDepartments nested 활용 |
| Department CRUD UI | 중 | 운영 필요성 명확해지면 |
| 401 → 로그인 리다이렉트 | 중 | 현재 토스트만 |
| validation_error 필드별 highlight | 낮음 | 현재 모달 상단 단일 메시지 |
| Building conflict 차단 모달 | 낮음 | 현재 토스트 |
| 검색 입력 디바운스 | 낮음 | 매 글자마다 서버 호출 |
| `is_active=false` 표시 토글 | 낮음 | 비활성 항목 노출 옵션 |
| Toast Context Provider | 낮음 | 다중 인스턴스 관리 시 |

---

## 7. 결론

Phase 1.5 프론트엔드는 백엔드 1.5.2 / 1.5.3 의 누적 변경을 4 Tier 로 분리해 적용했다. T2 만 백엔드 정책 미정으로 보류했고, 나머지(T1·T3·T4) 는 모두 완료.

- **Match Rate 75%** (T1·T3·T4 / T2 보류)
- AdminPage 436줄 → 68줄 슬림화, Admin CRUD UI 3종 도입으로 **운영 자율성 확보**
- 신규 인프라(`lib/adminApi`, `useAdmin*`, `ConfirmDeleteDialog`, FormModal 패턴, SectionTabs) 로 **후속 phase 확장 비용 절감**
- 테스트 **+54건 / 전체 424 그린**, tsc 0 에러
- 1차 정책 (pastor null-only, is_active 클라 필터, conflict 토스트만, 401 토스트만, URL 공유 미지원) 은 후속 phase 에서 운영 피드백 보고 재검토
