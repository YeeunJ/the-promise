# Phase 2 UI/UX 개선 플랜

> 이 문서는 코딩 에이전트가 추가 컨텍스트 없이 구현할 수 있도록 작성된 상세 구현 플랜이다.
> **구현 원칙**: CLAUDE.md 준수 — 이 플랜의 승인 없이 코드 수정 금지.

---

## 개선 항목 목록

| # | 항목 | 파일 | 난이도 |
|---|------|------|--------|
| 1 | 팀관리 담당교역자 표시 | `useAdminTeams.ts`, `TeamListTable.tsx` | Medium |
| 2 | 예약 취소 confirm 다이얼로그 | `BookingPage.tsx` | Low |
| 3 | 달력 UI 디자인 개선 | `DateTimeStep.tsx` | Medium |
| 4 | 시간 범위 00:00~24:00으로 확장 | `formatDatetime.ts`, `DateTimeStep.tsx` | Low |
| 5 | 시간 선택 초기화 버튼 추가 | `DateTimeStep.tsx` | Low |
| 6 | 어드민 장소 필터 드롭다운 스크롤 제한 | `ListFilterBar.tsx` | Low |
| 7 | 어드민 KPI 가동률/인기공간 카드 제거 | `AdminKpiRow.tsx` | Low |
| 8 | KPI 카드 클릭 시 예약 리스트 팝업 | `AdminKpiRow.tsx`, `ReservationsSection.tsx` | Medium |
| 9 | 달력 우측 패널 → 선택 날짜 예약 리스트 | `AdminSideRail.tsx`, `ReservationsSection.tsx` | Medium |
| 10 | 팀/건물/공간 관리 테이블 헤더 정렬 기능 | `TeamListTable.tsx`, `BuildingListTable.tsx`, `SpaceListTable.tsx` | Medium |
| 11 | 수정/삭제 버튼 배경색 추가 | `TeamListTable.tsx`, `BuildingListTable.tsx`, `SpaceListTable.tsx` | Low |
| 12 | 내 예약 취소 팝업 버튼 정렬 수정 | `UserReservationDetailModal.tsx` | Low |

---

## 항목별 상세 구현 플랜

---

### #1 팀관리 — 담당교역자 표시

**현재 상태**
- `TeamListTable.tsx`에 담당교역자 컬럼이 이미 존재함 (line 38 헤더, line 51 데이터)
- `formatPastor(team)` 함수: `team.pastor === null`이면 `'-'` 반환, 아니면 `${team.pastor.name} ${team.pastor.title}` 반환
- 모든 팀에서 `'-'`만 표시되는 문제 → API가 `pastor` 필드를 응답에 포함하지 않을 가능성

**진단 절차**
1. `apps/web/src/hooks/useAdminTeams.ts`에서 `listTeams()` 호출 후 응답 데이터 구조 확인
2. `apps/web/src/api/admin.ts`(또는 유사 파일)에서 `AdminTeam` 타입 정의의 `pastor` 필드 확인
3. 백엔드 `/api/v1/admin/teams/` 응답 JSON에 `pastor` 필드가 없으면 프론트엔드 임시 workaround 적용

**프론트엔드 임시 Workaround (백엔드 수정 전)**

`TeamsSection.tsx`는 이미 `useDepartments()` 훅을 통해 부서 목록(+ 담당교역자 정보)을 가져온다. 이를 활용해 `team.department` 정보로 교역자를 역참조한다.

```typescript
// TeamsSection.tsx — 기존 departments 데이터를 TeamListTable에 전달
// 기존: <TeamListTable teams={teams} ... />
// 변경: departments prop 추가

// TeamListTable.tsx
interface TeamListTableProps {
  teams: AdminTeam[]
  departments?: Department[]  // 추가
  // ...기존 props
}

// formatPastor 수정
function formatPastor(team: AdminTeam, departments?: Department[]): string {
  if (team.pastor) {
    return `${team.pastor.name} ${team.pastor.title}`
  }
  // fallback: departments에서 해당 부서 찾기
  if (departments && team.department?.id) {
    const dept = departments.find(d => d.id === team.department!.id)
    if (dept?.pastor) {
      return `${dept.pastor.name} ${dept.pastor.title}`
    }
  }
  return '-'
}
```

**수정 파일**
- `apps/web/src/components/admin/teams/TeamListTable.tsx` — `departments` prop 추가, `formatPastor` 수정
- `apps/web/src/components/admin/teams/TeamsSection.tsx` — `departments` prop 전달

**주의**: 백엔드가 `pastor` 필드를 이미 반환하고 있다면 위 workaround 불필요. 먼저 실제 API 응답을 확인할 것.

---

### #2 예약 신청 취소 버튼 Confirm 다이얼로그

**현재 상태**
- `apps/web/src/pages/BookingPage.tsx` line 61-64의 `handleCancel()`:
  ```typescript
  const handleCancel = useCallback(() => {
    clear()
    navigate('/')
  }, [clear, navigate])
  ```
- confirm 없이 즉시 홈으로 이동

**구현 방법**

```typescript
// BookingPage.tsx에 상태 추가
const [showCancelConfirm, setShowCancelConfirm] = useState(false)

// handleCancel 수정
const handleCancel = useCallback(() => {
  setShowCancelConfirm(true)
}, [])

const handleConfirmCancel = useCallback(() => {
  clear()
  navigate('/')
}, [clear, navigate])
```

**다이얼로그 UI** — 기존 `UserReservationDetailModal.tsx`의 confirm 다이얼로그 스타일 참고

```tsx
{showCancelConfirm && (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
    <div className="bg-white rounded-2xl p-6 w-full max-w-sm mx-4 shadow-xl">
      <h3 className="text-base font-semibold text-[#1C1C1E] mb-2">예약 신청 취소</h3>
      <p className="text-sm text-[#6B7280] mb-6">
        작성 중인 내용이 모두 사라집니다.<br />정말 취소하시겠습니까?
      </p>
      <div className="flex gap-3">
        <button
          onClick={() => setShowCancelConfirm(false)}
          className="flex-1 py-2.5 rounded-xl border border-[#E5E7EB] text-sm font-medium text-[#6B7280] hover:bg-[#F9FAFB]"
        >
          계속 작성
        </button>
        <button
          onClick={handleConfirmCancel}
          className="flex-1 py-2.5 rounded-xl bg-[#DC2626] text-sm font-medium text-white hover:bg-[#B91C1C]"
        >
          예, 취소합니다
        </button>
      </div>
    </div>
  </div>
)}
```

**수정 파일**
- `apps/web/src/pages/BookingPage.tsx`

---

### #3 달력 UI 디자인 개선 (react-day-picker 커스텀)

**현재 상태**
- `apps/web/src/components/booking/steps/DateTimeStep.tsx`
- line 8: `import 'react-day-picker/style.css'` — 기본 스타일 사용
- line 188-195: `<DayPicker mode="single" ... />`

**구현 방법**

기본 CSS import를 제거하고 `classNames` prop으로 Tailwind 클래스를 주입한다.

```typescript
// import 제거
// import 'react-day-picker/style.css'  ← 삭제

// DayPicker classNames 정의
const dayPickerClassNames = {
  root: 'w-full',
  months: 'flex flex-col',
  month: 'w-full',
  caption: 'flex justify-between items-center px-2 py-3',
  caption_label: 'text-sm font-semibold text-[#1C1C1E]',
  nav: 'flex gap-1',
  nav_button: 'w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[#F3F4F6] text-[#6B7280]',
  nav_button_previous: '',
  nav_button_next: '',
  table: 'w-full border-collapse',
  head_row: 'flex mb-1',
  head_cell: 'flex-1 text-center text-xs font-medium text-[#9CA3AF] py-1',
  row: 'flex w-full mt-1',
  cell: 'flex-1 text-center',
  day: 'w-8 h-8 mx-auto flex items-center justify-center rounded-full text-sm text-[#1C1C1E] hover:bg-[#F3F4F6] cursor-pointer transition-colors',
  day_selected: '!bg-[#4D7C64] !text-white hover:!bg-[#3D6B54]',
  day_today: 'font-semibold text-[#4D7C64]',
  day_disabled: 'text-[#D1D5DB] cursor-not-allowed hover:bg-transparent',
  day_outside: 'text-[#D1D5DB]',
  day_range_middle: '',
  day_hidden: 'invisible',
}
```

```tsx
<DayPicker
  mode="single"
  selected={selectedDate}
  onSelect={handleDaySelect}
  disabled={{ before: today }}
  classNames={dayPickerClassNames}
  showOutsideDays
/>
```

**수정 파일**
- `apps/web/src/components/booking/steps/DateTimeStep.tsx`

**주의**: react-day-picker v9의 `classNames` prop key 이름이 v8과 다를 수 있으므로, 현재 설치된 버전 확인 후 key 이름 조정 필요. `package.json`에서 버전 확인.
- v8: `day_selected`, `day_today` 등
- v9: `selected`, `today` 등 (접두어 없음)

---

### #4 시간 범위 00:00~24:00으로 확장

**현재 상태**
- `apps/web/src/utils/formatDatetime.ts` line 5: `export const DEFAULT_START_TIME = '07:00'`
- `apps/web/src/components/booking/steps/DateTimeStep.tsx` line 26: `const DAY_END_TIME = '21:30'`
- `DateTimeStep.tsx` line 166-173의 `visibleSlots` 필터: `t >= DEFAULT_START_TIME && t <= DAY_END_TIME`
- `generateTimeSlots(date)`: 이미 00:00~23:30 + 24:00(다음날 00:00) = 49개 슬롯 생성

**구현 방법**

```typescript
// formatDatetime.ts
// line 5 변경:
export const DEFAULT_START_TIME = '00:00'  // '07:00' → '00:00'
// line 6는 그대로:
export const DEFAULT_END_TIME = '23:30'
```

```typescript
// DateTimeStep.tsx
// line 26 제거 또는 수정:
// const DAY_END_TIME = '21:30'  ← 삭제

// visibleSlots 필터 변경 (line 166-173 근처):
// 기존:
// const visibleSlots = allSlots.filter(t => t >= DEFAULT_START_TIME && t <= DAY_END_TIME)
// 변경:
const visibleSlots = allSlots  // 필터 제거 — 전체 49개 슬롯 표시
```

**수정 파일**
- `apps/web/src/utils/formatDatetime.ts`
- `apps/web/src/components/booking/steps/DateTimeStep.tsx`

**주의**: `DEFAULT_START_TIME` 변경이 다른 파일에 영향을 주는지 확인. `grep -r "DEFAULT_START_TIME"` 실행하여 사용처 파악 후 부작용 없는지 검토.

---

### #5 시간 선택 초기화 버튼 추가

**현재 상태**
- `DateTimeStep.tsx`에 시간 선택 초기화 기능 없음
- `localValue` 상태: `{ startTime: string, endTime: string }`

**구현 방법**

시간 선택 섹션 헤더 오른쪽에 "초기화" 버튼 추가.

```tsx
{/* 시간 섹션 헤더에 추가 */}
<div className="flex items-center justify-between mb-3">
  <h3 className="text-sm font-semibold text-[#1C1C1E]">시간 선택</h3>
  {(localValue.startTime || localValue.endTime) && (
    <button
      type="button"
      onClick={() => setLocalValue(prev => ({ ...prev, startTime: '', endTime: '' }))}
      className="text-xs text-[#6B7280] hover:text-[#1C1C1E] flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-[#F3F4F6] transition-colors"
    >
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
        <path d="M10 2L2 10M2 2l8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
      선택 초기화
    </button>
  )}
</div>
```

**수정 파일**
- `apps/web/src/components/booking/steps/DateTimeStep.tsx`

---

### #6 어드민 장소 필터 드롭다운 스크롤 제한

**현재 상태**
- `apps/web/src/components/admin/ListFilterBar.tsx` line 144:
  ```typescript
  const dropdownClass = 'absolute top-full left-0 mt-1 bg-white rounded-xl shadow-lg border border-[#E5E7EB] p-3 z-50 min-w-[220px]'
  ```
- `max-height` 없어서 항목 많으면 화면 밖으로 넘침

**구현 방법**

```typescript
// line 144 변경:
const dropdownClass = 'absolute top-full left-0 mt-1 bg-white rounded-xl shadow-lg border border-[#E5E7EB] p-3 z-50 min-w-[220px] max-h-[320px] overflow-y-auto'
```

**수정 파일**
- `apps/web/src/components/admin/ListFilterBar.tsx`

---

### #7 어드민 KPI 가동률/인기공간 카드 제거

**현재 상태**
- `apps/web/src/components/admin/AdminKpiRow.tsx`의 `specs` 배열: 4개 항목
  - `admin-kpi-weekly` (이번 주 예약)
  - `admin-kpi-pending` (확정 대기)
  - `admin-kpi-utilization` (가동률, 항상 '—')
  - `admin-kpi-top-space` (인기 공간, 항상 '—')
- 그리드: `grid-cols-4`

**구현 방법**

```typescript
// AdminKpiRow.tsx — specs 배열에서 마지막 2개 제거
const specs: ReadonlyArray<KpiSpec> = [
  {
    testId: 'admin-kpi-weekly',
    label: '이번 주 예약',
    value: weeklyCount ?? '—',
    // ...기존 속성 유지
  },
  {
    testId: 'admin-kpi-pending',
    label: '확정 대기',
    value: pendingCount ?? '—',
    // ...기존 속성 유지
  },
  // 가동률, 인기공간 항목 삭제
]
```

그리드 클래스 변경:
```typescript
// 기존: className="grid grid-cols-4 gap-4"
// 변경: className="grid grid-cols-2 gap-4"
```

**수정 파일**
- `apps/web/src/components/admin/AdminKpiRow.tsx`

---

### #8 KPI 카드 클릭 시 예약 리스트 팝업

**현재 상태**
- `AdminKpiRow` 카드는 클릭 불가
- `ReservationsSection.tsx`가 예약 데이터를 보유

**구현 방법**

**Step 1**: `AdminKpiRow.tsx`에 onClick props 추가

```typescript
interface AdminKpiRowProps {
  weeklyCount: number | null
  pendingCount: number | null
  onWeeklyClick?: () => void   // 추가
  onPendingClick?: () => void  // 추가
}
```

```tsx
// 이번 주 예약 카드에 클릭 핸들러 추가
<div
  onClick={onWeeklyClick}
  className={`... ${onWeeklyClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}
>
```

**Step 2**: `ReservationsSection.tsx`에 팝업 상태 추가

```typescript
const [kpiPopup, setKpiPopup] = useState<'weekly' | 'pending' | null>(null)

// 이번 주 예약 필터 (오늘 기준 이번 주 월~일)
const weeklyReservations = reservations.filter(r => {
  const rDate = new Date(r.start_datetime)
  const startOfWeek = /* 이번 주 월요일 */
  const endOfWeek = /* 이번 주 일요일 */
  return rDate >= startOfWeek && rDate <= endOfWeek
})

// 확정 대기 필터
const pendingReservations = reservations.filter(r => r.status === 'pending')
```

**Step 3**: KPI Detail 팝업 컴포넌트 (인라인으로 ReservationsSection에 추가)

```tsx
{kpiPopup && (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setKpiPopup(null)}>
    <div className="bg-white rounded-2xl w-full max-w-lg mx-4 shadow-xl max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
      <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E7EB]">
        <h3 className="text-base font-semibold text-[#1C1C1E]">
          {kpiPopup === 'weekly' ? '이번 주 예약' : '확정 대기'}
        </h3>
        <button onClick={() => setKpiPopup(null)} className="text-[#6B7280] hover:text-[#1C1C1E]">✕</button>
      </div>
      <div className="overflow-y-auto flex-1 p-4 space-y-2">
        {(kpiPopup === 'weekly' ? weeklyReservations : pendingReservations).map(r => (
          <div
            key={r.id}
            onClick={() => { onReservationClick(r); setKpiPopup(null) }}
            className="p-3 rounded-xl border border-[#E5E7EB] hover:bg-[#F9FAFB] cursor-pointer"
          >
            <div className="flex justify-between items-start">
              <span className="text-sm font-medium text-[#1C1C1E]">{r.team_name || r.custom_team_name}</span>
              <span className="text-xs text-[#6B7280]">{/* 날짜 */}</span>
            </div>
            <div className="text-xs text-[#6B7280] mt-1">{r.space_name} · {/* 시간 */}</div>
          </div>
        ))}
        {(kpiPopup === 'weekly' ? weeklyReservations : pendingReservations).length === 0 && (
          <p className="text-sm text-[#9CA3AF] text-center py-8">예약이 없습니다.</p>
        )}
      </div>
    </div>
  </div>
)}
```

**수정 파일**
- `apps/web/src/components/admin/AdminKpiRow.tsx`
- `apps/web/src/components/admin/ReservationsSection.tsx`

---

### #9 달력 우측 패널 — 선택 날짜 예약 리스트로 교체

**현재 상태**
- `apps/web/src/components/admin/AdminSideRail.tsx`:
  - props: `reservations`, `todayDateStr`, `onReservationClick`
  - "오늘" 섹션: 오늘 confirmed 예약 목록
  - "확정 대기" 섹션: 전체 pending 예약 목록
- `ReservationsSection.tsx`에 `selectedDate` 상태 이미 존재 (CalendarGrid의 `onDateSelect` 콜백으로 업데이트)

**구현 방법**

**AdminSideRail.tsx 전면 재설계**:

```typescript
interface AdminSideRailProps {
  reservations: AdminReservation[]
  selectedDate: string | null   // 변경: todayDateStr 제거, selectedDate로 교체
  onReservationClick: (r: AdminReservation) => void
}
```

```tsx
export function AdminSideRail({ reservations, selectedDate, onReservationClick }: AdminSideRailProps) {
  const dateReservations = selectedDate
    ? reservations.filter(r => {
        const rDate = r.start_datetime.slice(0, 10)
        return rDate === selectedDate
      })
    : []

  return (
    <aside className="w-72 flex-shrink-0 bg-white rounded-2xl border border-[#E5E7EB] p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[#1C1C1E]">
          {selectedDate
            ? new Date(selectedDate + 'T00:00:00').toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' })
            : '날짜를 선택하세요'}
        </h3>
        {selectedDate && (
          <span className="text-xs text-[#6B7280]">{dateReservations.length}건</span>
        )}
      </div>

      {!selectedDate ? (
        <p className="text-sm text-[#9CA3AF] text-center py-8">달력에서 날짜를 선택하면<br />해당 날짜의 예약이 표시됩니다.</p>
      ) : dateReservations.length === 0 ? (
        <p className="text-sm text-[#9CA3AF] text-center py-8">예약이 없습니다.</p>
      ) : (
        <div className="space-y-2 overflow-y-auto flex-1">
          {dateReservations.map(r => (
            <button
              key={r.id}
              onClick={() => onReservationClick(r)}
              className="w-full text-left p-3 rounded-xl border border-[#E5E7EB] hover:bg-[#F3F4F6] transition-colors"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-[#1C1C1E] truncate">
                  {r.team_name || r.custom_team_name || '팀 미지정'}
                </span>
                <StatusBadge status={r.status} />
              </div>
              <div className="text-xs text-[#6B7280]">
                {r.space_name} · {r.start_datetime.slice(11, 16)}~{r.end_datetime.slice(11, 16)}
              </div>
            </button>
          ))}
        </div>
      )}
    </aside>
  )
}
```

**ReservationsSection.tsx 변경**: `AdminSideRail`에 `todayDateStr` 대신 `selectedDate` 전달

```tsx
// 기존:
<AdminSideRail
  reservations={reservations}
  todayDateStr={todayDateStr}
  onReservationClick={handleReservationClick}
/>
// 변경:
<AdminSideRail
  reservations={reservations}
  selectedDate={selectedDate}  // 이미 존재하는 state
  onReservationClick={handleReservationClick}
/>
```

**수정 파일**
- `apps/web/src/components/admin/AdminSideRail.tsx` (전면 재작성)
- `apps/web/src/components/admin/ReservationsSection.tsx` (props 변경)

---

### #10 팀/건물/공간 관리 테이블 헤더 정렬 기능

**현재 상태**
- 3개 테이블 모두 정렬 기능 없음
- `TeamListTable.tsx`, `BuildingListTable.tsx`, `SpaceListTable.tsx`

**구현 방법**

각 테이블에 동일한 패턴으로 client-side 정렬 추가.

**공통 패턴** (각 테이블에 동일하게 적용):

```typescript
type SortKey = 'name' | 'createdAt'  // 테이블별로 적절한 키 사용
type SortDir = 'asc' | 'desc'

// 컴포넌트 내부에 상태 추가
const [sortKey, setSortKey] = useState<SortKey>('name')
const [sortDir, setSortDir] = useState<SortDir>('asc')

const handleSort = (key: SortKey) => {
  if (sortKey === key) {
    setSortDir(prev => prev === 'asc' ? 'desc' : 'asc')
  } else {
    setSortKey(key)
    setSortDir('asc')
  }
}

const sortedItems = [...items].sort((a, b) => {
  const aVal = a[sortKey] ?? ''
  const bVal = b[sortKey] ?? ''
  const cmp = String(aVal).localeCompare(String(bVal), 'ko')
  return sortDir === 'asc' ? cmp : -cmp
})
```

**SortableHeader 서브컴포넌트** (각 파일 내부에 로컬로 정의):

```tsx
function SortableHeader({
  label,
  sortKey: key,
  currentKey,
  dir,
  onSort,
}: {
  label: string
  sortKey: SortKey
  currentKey: SortKey
  dir: SortDir
  onSort: (k: SortKey) => void
}) {
  const isActive = currentKey === key
  return (
    <th
      className="px-4 py-3 text-left text-xs font-medium text-[#6B7280] cursor-pointer select-none hover:text-[#1C1C1E] group"
      onClick={() => onSort(key)}
    >
      <div className="flex items-center gap-1">
        {label}
        <span className={`text-[10px] ${isActive ? 'text-[#4D7C64]' : 'text-[#D1D5DB] group-hover:text-[#9CA3AF]'}`}>
          {isActive ? (dir === 'asc' ? '↑' : '↓') : '↕'}
        </span>
      </div>
    </th>
  )
}
```

**각 테이블의 정렬 컬럼**:
- `TeamListTable`: 팀명(`name`), 부서(`department.name`)
- `BuildingListTable`: 건물명(`name`), 정렬순서(`order`)
- `SpaceListTable`: 공간명(`name`), 건물(`building_name`), 수용인원(`capacity`)

**수정 파일**
- `apps/web/src/components/admin/teams/TeamListTable.tsx`
- `apps/web/src/components/admin/buildings/BuildingListTable.tsx`
- `apps/web/src/components/admin/spaces/SpaceListTable.tsx`

---

### #11 수정/삭제 버튼 배경색 추가

**현재 상태**
- 3개 테이블 모두 텍스트 색상만 사용:
  ```typescript
  // 수정 버튼
  className="text-sm font-medium text-primary hover:underline"
  // 삭제 버튼
  className="text-sm font-medium text-[#DC2626] hover:underline"
  ```

**구현 방법**

모든 3개 테이블의 수정/삭제 버튼 클래스 변경:

```typescript
// 수정 버튼
className="text-sm font-medium text-primary bg-primary/10 border border-primary/20 px-3 py-1.5 rounded-lg hover:bg-primary/20 transition-colors"

// 삭제 버튼
className="text-sm font-medium text-[#DC2626] bg-red-50 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-100 transition-colors"
```

**수정 파일**
- `apps/web/src/components/admin/teams/TeamListTable.tsx` (line 56-68 근처)
- `apps/web/src/components/admin/buildings/BuildingListTable.tsx` (line 44-58 근처)
- `apps/web/src/components/admin/spaces/SpaceListTable.tsx` (line 55-67 근처)

**주의**: `text-primary`의 실제 색상값을 Tailwind config에서 확인. `bg-primary/10` 등 불투명도 유틸리티가 동작하는지 확인.

---

### #12 내 예약 취소 팝업 버튼 정렬 수정

**현재 상태**
- `apps/web/src/components/my/UserReservationDetailModal.tsx` line 139:
  ```tsx
  <div className="flex justify-end gap-2">
  ```
- 두 버튼 모두 오른쪽 정렬됨

**구현 방법**

```tsx
// line 139 변경:
// 기존:
<div className="flex justify-end gap-2">
// 변경:
<div className="flex justify-between gap-2">
```

이렇게 하면 "아니오(돌아가기)" 버튼은 왼쪽, "예, 취소합니다" 버튼은 오른쪽으로 배치된다.

버튼 각각에 `flex-1` 또는 고정 너비가 적절한지도 확인:
```tsx
// 자연스러운 정렬을 위해 각 버튼 확인
// 아니오 버튼: 왼쪽 배치 유지
// 예, 취소합니다 버튼: 오른쪽 배치 유지
```

**수정 파일**
- `apps/web/src/components/my/UserReservationDetailModal.tsx`

---

## 구현 순서 권장사항

**Group A — 단독 파일, 낮은 위험 (먼저 처리)**
1. #12 UserReservationDetailModal 버튼 정렬 (1줄 변경)
2. #6 ListFilterBar 스크롤 제한 (1줄 변경)
3. #7 AdminKpiRow 카드 2개 제거
4. #11 버튼 배경색 (3개 파일, 반복 패턴)
5. #2 BookingPage 취소 confirm (상태 + JSX 추가)

**Group B — 연관 파일 있음 (함께 처리)**
6. #4 + #5 DateTimeStep 시간 범위 + 초기화 버튼 (같은 파일)
7. #3 달력 UI 디자인 (같은 파일, 버전 확인 후)
8. #8 + #9 KPI 팝업 + 사이드 패널 (ReservationsSection 공유)
9. #10 테이블 정렬 (3개 파일, 동일 패턴)

**Group C — 조사 필요 (마지막)**
10. #1 담당교역자 표시 (API 응답 확인 후 결정)

---

## 검증 체크리스트

구현 완료 후 아래 항목 수동 확인:

- [ ] #1: 팀 목록에서 담당교역자 컬럼에 이름이 표시됨
- [ ] #2: 예약 신청 중 상단 X 버튼 클릭 → confirm 다이얼로그 표시 → "계속 작성" 클릭 시 예약 유지
- [ ] #3: 달력이 Tailwind 스타일로 표시됨 (기본 react-day-picker CSS 없음)
- [ ] #4: 시간 선택에서 00:00 슬롯이 표시됨, 24:00도 표시됨
- [ ] #5: 시간 선택 후 "선택 초기화" 버튼 표시됨, 클릭 시 시간 초기화됨
- [ ] #6: 공간 필터 드롭다운에 많은 항목이 있을 때 스크롤 가능
- [ ] #7: 어드민 KPI 카드가 2개만 표시됨 (이번 주 예약, 확정 대기)
- [ ] #8: KPI 카드 클릭 → 해당 예약 리스트 팝업 표시됨
- [ ] #9: 달력에서 날짜 클릭 → 우측 패널에 해당 날짜 예약 목록 표시됨
- [ ] #10: 팀/건물/공간 목록 테이블 헤더 클릭 시 오름/내림차순 정렬됨
- [ ] #11: 수정/삭제 버튼에 배경색이 표시됨
- [ ] #12: 취소 확인 팝업에서 "아니오" 버튼 왼쪽, "예, 취소합니다" 버튼 오른쪽 배치

---

## 관련 파일 경로 요약

```
apps/web/src/
├── pages/
│   └── BookingPage.tsx                          (#2)
├── components/
│   ├── admin/
│   │   ├── AdminKpiRow.tsx                      (#7, #8)
│   │   ├── AdminSideRail.tsx                    (#9)
│   │   ├── ListFilterBar.tsx                    (#6)
│   │   ├── ReservationsSection.tsx              (#8, #9)
│   │   ├── buildings/
│   │   │   └── BuildingListTable.tsx            (#10, #11)
│   │   ├── spaces/
│   │   │   └── SpaceListTable.tsx               (#10, #11)
│   │   └── teams/
│   │       ├── TeamListTable.tsx                (#1, #10, #11)
│   │       └── TeamsSection.tsx                 (#1)
│   ├── booking/
│   │   └── steps/
│   │       └── DateTimeStep.tsx                 (#3, #4, #5)
│   └── my/
│       └── UserReservationDetailModal.tsx       (#12)
└── utils/
    └── formatDatetime.ts                        (#4)
```
