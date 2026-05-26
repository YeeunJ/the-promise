# Phase 2 Frontend Report — UI/UX 개선 12항목

> **기간**: 2026-05-18
> **범위**: `apps/web/src/**`
> **백엔드**: 무변경

## Executive Summary

| 관점 | 내용 |
|------|------|
| **Problem** | 어드민 KPI·필터·사이드패널 UX 미흡 / 예약 폼 시간 범위 제한(07:00~21:30) / 관리 테이블 정렬 기능 부재 / 취소 다이얼로그 미흡 / 버튼 스타일 불명확 |
| **Solution** | `docs/frontend/phase2-improvements-plan.md` 12항목을 Group A(단독 파일) → Group B(연관 파일) 순으로 전면 구현 + 테스트 16건 수정 |
| **Outcome** | KPI 2카드 + 클릭 팝업 / 건물→공간 2단계 필터 / SideRail 선택 날짜 모드 / 전체 시간 범위(00:00~24:00) / 한국 공휴일 지원 / 테이블 정렬 / 취소 confirm 다이얼로그 |
| **Quality** | Vitest **628/628** 통과 · Production build 성공 |
| **Backend dependency** | #1 담당교역자 표시: 백엔드 `AdminTeam` 응답에 `pastor` 필드 미포함 → 미구현 보류 (백엔드 수정 후 연동 가능) |

---

## 1. 작업 단계 요약

### Group A — 단독 파일 (저위험)

| # | 항목 | 변경 내용 | 파일 |
|---|------|----------|------|
| **#12** | 내 예약 취소 팝업 버튼 정렬 | `flex justify-end` → `flex justify-between` (취소 confirm + 푸터 2곳) | `UserReservationDetailModal.tsx` |
| **#6** | 어드민 장소 필터 드롭다운 개선 | `spaces: Space[]` → `buildings: Building[]` prop 전환 / 드롭다운 `max-h-[280px] overflow-y-auto` / 신규 `SpaceFilterDropdown` 컴포넌트 분리 | `ListFilterBar.tsx`, `SpaceFilterDropdown.tsx` (신규) |
| **#7** | KPI 카드 수 축소 | 4카드 → 2카드 (`가동률`·`인기공간` 제거) / 그리드 `grid-cols-4` → `grid-cols-2` | `AdminKpiRow.tsx` |
| **#11** | 수정/삭제 버튼 배경색 추가 | 텍스트 링크 스타일 → 배경색 버튼 (`bg-primary/10 border-primary/20` / `bg-red-50 border-red-200`) | `TeamListTable.tsx`, `BuildingListTable.tsx`, `SpaceListTable.tsx` |
| **#2** | 예약 취소 confirm 다이얼로그 | `showCancelConfirm` 상태 추가 / X 버튼 클릭 → 다이얼로그 표시 → "계속 작성" / "예, 취소합니다" 분기 | `BookingPage.tsx` |

### Group B — 연관 파일 (함께 처리)

| # | 항목 | 변경 내용 | 파일 |
|---|------|----------|------|
| **#4** | 시간 범위 00:00~24:00 확장 | `DEFAULT_START_TIME` `'07:00'` → `'00:00'` / `DAY_END_TIME` 상수 제거 / `visibleSlots = slots` (필터 제거) | `formatDatetime.ts`, `DateTimeStep.tsx` |
| **#5** | 시간 선택 초기화 버튼 | 시간 섹션 헤더 우측 "선택 초기화" 버튼 (startTime 또는 endTime 선택 시에만 표시) | `DateTimeStep.tsx` |
| **#3** | 달력 UI 디자인 개선 | `import 'react-day-picker/style.css'` 제거 / `KoreanWeekday` 커스텀 컴포넌트 (일=빨강, 토=파랑) / 한국 공휴일 빨강 강조 | `DateTimeStep.tsx`, `koreanHolidays.ts` (신규) |
| **#8** | KPI 카드 클릭 팝업 | `kpiPopup: 'weekly' \| 'pending' \| null` 상태 / 주간·대기 예약 목록 팝업 모달 / 항목 클릭 시 DetailModal 연결 | `AdminKpiRow.tsx`, `ReservationsSection.tsx` |
| **#9** | SideRail → 선택 날짜 예약 리스트 | `todayDateStr: string` → `selectedDate: string \| null` / 단일 섹션(선택 날짜의 전체 예약) / `StatusPill` + `applicant_team` 표시 / `data-testid` `side-rail-today-{id}` → `side-rail-item-{id}` | `AdminSideRail.tsx`, `ReservationsSection.tsx` |
| **#10** | 관리 테이블 헤더 정렬 | `SortableHeader` 서브컴포넌트 (↑↓↕ 아이콘) / `sortKey`·`sortDir` 상태 / `localeCompare('ko')` 정렬 | `TeamListTable.tsx`, `BuildingListTable.tsx`, `SpaceListTable.tsx` |

### Group C — 조사 후 결정

| # | 항목 | 결과 |
|---|------|------|
| **#1** | 팀관리 담당교역자 표시 | 백엔드 `/api/v1/admin/teams/` 응답에 `pastor` 필드 미포함 확인 → **미구현 보류** (백엔드 수정 후 연동) |

### 추가 수정 사항

| 항목 | 변경 내용 | 파일 |
|------|----------|------|
| `extractDateStr` KST 수정 | raw `.slice(0, 10)` → KST 오프셋(`+KST_OFFSET_MS`) 적용 — 자정 근처 날짜 어긋남 버그 수정 | `formatDatetime.ts` |
| CalendarGrid 이벤트 표시 확장 | `confirmed` 전용 → `confirmed \|\| pending` 병행 표시 | `ReservationsSection.tsx` |
| 건물→공간 2단계 필터 상태 관리 | `buildings` 파생(spaceOptions 역산) / `spacesForDropdown` 건물 필터 / 건물 변경 시 `space_id` 자동 리셋 | `ReservationsSection.tsx` |

### 테스트 수정 (16건)

| 파일 | 수정 이유 |
|------|----------|
| `AdminKpiRow.test.tsx` | KPI 카드 4개 → 2개 |
| `AdminSideRail.test.tsx` | `todayDateStr` → `selectedDate` prop / `data-testid` 변경 반영 |
| `BookingPage.test.tsx` | 취소 버튼 클릭 → 다이얼로그 → "예, 취소합니다" 추가 클릭 / "완료" 버튼 `getAllByRole` |
| `ListFilterBar.test.tsx` | `spaces` → `buildings` prop |
| `ListTable.test.tsx` | 취소·반려 행의 취소 버튼 `not.toBeInTheDocument()` |
| `LookupLoginPage.test.tsx` | `vi.mock('axios')` 추가 / `waitFor` 비동기 처리 |
| `ReservationTable.test.tsx` | 취소·반려 항목 필터링 반영 |
| `TeamsSection.test.tsx` | 삭제 후 refetch 체인 — `waitFor({ timeout: 3000 })` |

---

## 2. 핵심 컴포넌트 변경

### AdminKpiRow (`src/components/admin/AdminKpiRow.tsx`)

```
Before: 4 KPI 카드 (이번 주 / 대기 / 가동률 / 인기공간)  grid-cols-4
After:  2 KPI 카드 (이번 주 / 대기)                      grid-cols-2
        + onWeeklyClick? / onPendingClick? props 추가
        + 카드 클릭 시 cursor-pointer + hover shadow
```

### AdminSideRail (`src/components/admin/AdminSideRail.tsx`)

```
Before: props { todayDateStr: string }
        섹션 2개 — "오늘 confirmed 예약" + "전체 pending 예약"
        data-testid: side-rail-today-{id}

After:  props { selectedDate: string | null }
        섹션 1개 — selectedDate 날짜의 예약 (confirmed + pending 혼합)
        StatusPill 표시 / applicant_team 표시
        data-testid: side-rail-item-{id}
        selectedDate null → "날짜를 선택하세요" 안내 문구
```

### ListFilterBar (`src/components/admin/ListFilterBar.tsx`)

```
Before: spaces: Space[] prop / OpenDropdown: 'space' | null
        buildingGroups 그룹핑 로직 포함

After:  buildings: Building[] prop / OpenDropdown: 'building' | null
        selectedBuilding 단순 목록
        + max-h-[280px] overflow-y-auto 스크롤 제한
```

### SpaceFilterDropdown (`src/components/admin/SpaceFilterDropdown.tsx`) — 신규

```
건물 선택 이후 공간을 선택하는 별도 드롭다운 컴포넌트
ReservationsSection에서 ListFilterBar 하단 / 테이블 상단에 배치
건물 미선택 시 숨김
```

### ReservationsSection (`src/components/admin/ReservationsSection.tsx`)

```
추가: kpiPopup: 'weekly' | 'pending' | null 상태
추가: weeklyReservations / pendingReservations 파생 목록
추가: buildings 목록 (spaceOptions 역산, 중복 제거, 순서 보존)
추가: spacesForDropdown (선택 건물 기준 필터)
추가: handleFiltersChange — building_id 변경 시 space_id 리셋
추가: handleSpaceChange — 공간 단독 필터 업데이트
추가: KPI 팝업 모달 JSX
변경: ListFilterBar에 spaces 대신 buildings 전달
추가: SpaceFilterDropdown (테이블 위)
변경: AdminSideRail에 todayDateStr 대신 selectedDate 전달
변경: CalendarGrid 이벤트: confirmed → confirmed || pending
```

### DateTimeStep (`src/components/booking/steps/DateTimeStep.tsx`)

```
제거: import 'react-day-picker/style.css'
추가: KoreanWeekday 커스텀 컴포넌트 (일=text-red-500, 토=text-blue-500)
추가: isKoreanHoliday 연동 (공휴일 셀 빨강)
추가: handleTimeReset() — startTime/endTime 빈 문자열로 초기화
변경: visibleSlots = slots (전체 00:00~24:00 표시, 기존 필터 제거)
변경: DEFAULT_START_TIME '07:00' → '00:00' (formatDatetime.ts)
```

### 관리 테이블 3종 정렬 (TeamListTable / BuildingListTable / SpaceListTable)

```
공통 추가:
  SortableHeader 서브컴포넌트 (↑↓↕ 아이콘, 활성 시 primary 색상)
  sortKey / sortDir 상태
  sortedItems = [...items].sort(...localeCompare('ko'))

정렬 컬럼:
  TeamListTable     — 팀명(name) / 부서(department.name)
  BuildingListTable — 건물명(name)
  SpaceListTable    — 공간명(name) / 건물(building_name) / 수용인원(capacity)
```

### BookingPage (`src/pages/BookingPage.tsx`)

```
추가: showCancelConfirm: boolean 상태
변경: handleCancel() → setShowCancelConfirm(true) (즉시 이동 → 확인 요청)
추가: handleConfirmCancel() → clear() + navigate('/')
추가: 취소 confirm 모달 JSX (z-50, "계속 작성" / "예, 취소합니다")
변경: Step 5 BottomBar — onNext=handleComplete / nextLabel='완료' / nextDisabled=!isComplete
```

---

## 3. 신규 파일

| 파일 | 역할 |
|------|------|
| `src/components/admin/SpaceFilterDropdown.tsx` | 건물 선택 후 공간 선택 드롭다운 — `ReservationsSection`에서 사용 |
| `src/utils/koreanHolidays.ts` | `isKoreanHoliday(date: Date): boolean` — 한국 법정 공휴일 판별 (2025~2026년 하드코딩) |

---

## 4. 품질 게이트

| 항목 | 결과 |
|------|------|
| Vitest | **628/628** 통과 (74개 테스트 파일) |
| TypeScript build (tsc -b) | 성공 |
| Vite production build | 성공 |
| 테스트 수정 건수 | 16건 (기능 변경에 따른 기대값 업데이트, 로직 변경 없음) |

---

## 5. 핵심 결정 사항

| 영역 | 결정 | 근거 |
|------|------|------|
| 장소 필터 구조 | **건물→공간 2단계 필터** — `ListFilterBar`(건물) + `SpaceFilterDropdown`(공간) 분리 | 공간 수 증가 시 단일 드롭다운 UX 저하 / 건물 변경 시 공간 자동 리셋이 자연스러움 |
| KPI 팝업 구현 위치 | `ReservationsSection` 인라인 모달 (별도 컴포넌트 없음) | 단순 목록 표시 수준 — 별도 파일 불필요 |
| SideRail 모드 전환 | `selectedDate` null → 안내 문구 / 값 있음 → 해당 날짜 예약 표시 | 오늘+pending 2섹션보다 컨텍스트가 명확하고 캘린더 인터랙션과 직결 |
| 시간 범위 전체 공개 | `visibleSlots = slots` (필터 제거) | 00:00 이른 새벽·24:00 자정 예약 시나리오 지원 필요 |
| 한국 공휴일 | `koreanHolidays.ts` 하드코딩 (2025~2026년) | 외부 공공 API 의존 없이 오프라인·테스트 환경 동작 보장 |
| 테이블 정렬 로컬 패턴 | 각 테이블 파일 내부에 로컬 `SortableHeader` 정의 | 3개 테이블의 `SortKey` 타입이 달라 공유 컴포넌트보다 로컬이 유연 |
| `extractDateStr` KST | UTC → KST 변환 후 날짜 추출 | 자정 근처(KST 23:xx) UTC 기준 날짜가 하루 어긋나는 버그 수정 |
| 담당교역자 #1 보류 | 백엔드 API 수정 대기 | `AdminTeam` 응답에 `pastor` 미포함 — 프론트 workaround보다 API 수정이 정합 |

---

## 6. 후속 작업 후보

1. **백엔드 `pastor` 필드 추가** (#1 완료) — `AdminTeam` 응답에 `pastor` 포함 시 `TeamListTable` 즉시 표시 가능
2. **한국 공휴일 자동 갱신** — `koreanHolidays.ts` 하드코딩 → 공공 API 연동 (2027년 이후 해 적용 시)
3. **어드민 테이블 서버 정렬** — 현재 client-side 정렬 → 백엔드 `ordering` 파라미터 추가 검토 (대용량 데이터 시)
4. **KPI 팝업 열린 상태에서 DetailModal 전환** — 팝업 닫힘 후 DetailModal 열리는 현재 흐름 UX 재검토
5. **React Router v7 future flag 마이그레이션** — `v7_startTransition` / `v7_relativeSplatPath` 경고 잔존

---

## 7. Post-Phase 2 QA 수정 (2026-05-19)

Phase 2 이후 수동 QA에서 발견된 프론트엔드 단독 이슈 4건을 처리했다.

### 코드 수정 (2건)

| ID | 심각도 | 파일 | 변경 내용 |
|----|--------|------|----------|
| **BUG-06** | Low | `DateTimeStep.tsx` | 시간 슬롯 하단 범례 가독성 개선 — `text-sm`→`text-base`, 스워치 `h-3.5 w-3.5`→`h-4 w-4` |
| **ADMIN-BUG-A3** | Low | `CalendarGrid.tsx` | 달력 Chips 팀명 표시 버그 — `applicant_team === '-'` 일 때 `custom_team_name`으로 폴백 |

**BUG-06 변경 상세** (`DateTimeStep.tsx` 범례 섹션):
```tsx
// Before
<div className="mt-3 flex items-center gap-4 text-sm text-ink-soft">
  <span className="inline-block h-3.5 w-3.5 rounded-sm bg-primary" />

// After
<div className="mt-3 flex items-center gap-4 text-base text-ink-soft">
  <span className="inline-block h-4 w-4 rounded-sm bg-primary" />
```
고령 사용자(50~60대) 타겟 서비스 기준 — `text-sm`(14px)은 가독성 부족.

**ADMIN-BUG-A3 변경 상세** (`CalendarGrid.tsx` Chips 라벨):
```tsx
// Before — applicant_team이 "-"(truthy)인 경우 "- - 사랑방" 출력됨
const team = r.applicant_team || r.custom_team_name;

// After
const team =
  r.applicant_team && r.applicant_team !== '-'
    ? r.applicant_team
    : r.custom_team_name;
```

### Phase 2에서 이미 해결됨 확인 (2건)

| ID | 심각도 | 해결 경위 |
|----|--------|----------|
| **ADMIN-BUG-A2** | Medium | Phase 2에서 `ReservationsSection` CalendarGrid 필터를 `confirmed`→`confirmed \|\| pending`으로 변경. `Chips` 컴포넌트는 이미 최대 3개 + "+N more" 지원. |
| **ADMIN-BUG-A4** | Low | Phase 2 `isCancellable()` 도입으로 해결. `cancelled` 상태 시 `ReservationDetailModal`에서 취소 버튼 렌더링 자체 생략. |

### 최종 품질 게이트

| 항목 | 결과 |
|------|------|
| Vitest | **628/628** 통과 (74개 테스트 파일, QA 수정 후 재검증) |
| TypeScript build (tsc -b) | 성공 |
| Vite production build | 성공 |

---

## 8. 미결 이슈 (백엔드 의존)

docs/qa 문서를 통합·삭제하면서 미해결 이슈를 여기에 보존한다.

### BUG-11 [A→B][High] — Step 4 pending 예약 슬롯 점유 미표시

- **화면**: `/booking?step=4`
- **증상**: 동일 공간·날짜에 `pending` 상태 예약이 존재해도 해당 시간 슬롯이 "가능" 상태로 표시됨
- **기대**: `pending`/`confirmed` 예약 모두 점유 슬롯으로 표시
- **선결 조건**: BUG-B1(`status` 자동 확정 버그) 해결 후 재검증 필요. 현재 모든 예약이 `confirmed`로 생성되어 `pending` 슬롯 충돌을 실제로 재현할 수 없음.
- **프론트 대응**: `useOccupiedSlots` 훅이 반환하는 슬롯 목록에 `pending` 예약이 포함되면 자동 반영됨. 백엔드 API 수정이 선행 과제.

### BUG-B1 [Critical][Backend] — 예약 생성 시 status 자동 확정

- **증상**: 예약 생성(POST) 시 충돌 없으면 `confirmed`, 충돌 있으면 `rejected`로 자동 설정됨. `pending` 상태로 생성되지 않음.
- **위치**: `serializers.py` `create()` + `models.py` `default=Status.CONFIRMED`
- **기대**: 신청 시 `status=pending` / 어드민 수동 승인→`confirmed` / 거절→`rejected`
- **영향**: 어드민 승인 워크플로우 전체가 동작 불가. BUG-11과 연동.

```python
# 현재 (잘못된 동작)
if reservation.has_conflict():
    reservation.status = Reservation.Status.REJECTED
else:
    reservation.status = Reservation.Status.CONFIRMED

# 기대 동작
reservation.status = Reservation.Status.PENDING  # 항상 대기 상태로 생성
```

### BUG-01 [High][Backend] — CORS 127.0.0.1 차단

- **증상**: `http://127.0.0.1:5173`에서 API 호출 시 CORS 오류
- **수정**: Django `CORS_ALLOWED_ORIGINS`에 `http://127.0.0.1:5173` 추가 (또는 `CORS_ALLOW_ALL_ORIGINS=True` 개발 환경 한정)

### BUG-02 [Medium][Backend] — 랜딩 공간 수 "—" 표시

- **증상**: 랜딩 페이지 공간 수 통계가 "—"으로 표시됨
- **원인**: 통계 API 미구현 또는 응답 필드 불일치 추정
- **수정**: 백엔드 통계 엔드포인트 점검 및 응답 스펙 확인 필요

---

## Appendix — 관련 문서

| 문서 | 경로 |
|------|------|
| Phase 2 구현 플랜 | `docs/frontend/phase2-improvements-plan.md` |
| Phase 1.5.1 리포트 (이전 단계) | `docs/frontend/phase1.5.1-frontend-report.md` |
| 백엔드 보완 todo | `docs/backend/todo-design-required-data.md` |

> Phase 2 구현 플랜(`phase2-improvements-plan.md`)은 본 report로 흡수 완료. 본 report가 Phase 2 최종 단일 소스.
> `docs/qa/` 하위 문서(frontend-issues.md / backend-issues.md / qa-handoff.md)는 본 report 및 `docs/backend/todo-design-required-data.md`로 통합 후 삭제.
