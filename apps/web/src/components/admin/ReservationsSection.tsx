import { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import type {
  Building,
  PaginatedResponse,
  Reservation,
  ReservationStatus,
} from '../../types';
import { getKSTDateString } from '../../utils/formatDatetime';
import { countReservationsByStatus } from '../../lib/reservationUtils';
import { useSpaceOptions } from '../../hooks/useSpaceOptions';
import {
  usePaginatedReservations,
  type PaginatedReservationsFilters,
} from '../../hooks/usePaginatedReservations';
import CalendarGrid from './CalendarGrid';
import { SpaceFilterDropdown } from './SpaceFilterDropdown';
import { ListFilterBar } from './ListFilterBar';
import { ListTable } from './ListTable';
import { CancelDialog } from './CancelDialog';
import { ReservationDetailModal } from './ReservationDetailModal';
import { SectionHeader } from './SectionHeader';
import { SegmentedControl } from './SegmentedControl';
import { ReservationStatusChips } from './ReservationStatusChips';
import { AdminKpiRow } from './AdminKpiRow';
import { AdminSideRail } from './AdminSideRail';
import { Pagination } from '../ui/Pagination';
import { StatusPill } from '../ui/StatusPill';
import { formatDate, formatTime } from '../../utils/formatDatetime';
import type { ReactNode } from 'react';

const LIST_PAGE_SIZE = 20;
const CALENDAR_PAGE_SIZE = 100;
const DAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'] as const;

interface ReservationsSectionProps {
  authToken: string;
  showToast: (message: string, type?: 'error' | 'success') => void;
}

function computeInitialListFilters(): PaginatedReservationsFilters {
  const today = new Date();
  const from = today.toISOString().slice(0, 10);
  const future = new Date(today);
  future.setDate(future.getDate() + 7);
  const to = future.toISOString().slice(0, 10);
  return {
    from_date: from,
    to_date: to,
    ordering: '-start_datetime',
  };
}

function computeMonthRange(
  year: number,
  month: number,
): { from: string; to: string } {
  const lastDay = new Date(year, month, 0).getDate();
  const mm = String(month).padStart(2, '0');
  return {
    from: `${String(year)}-${mm}-01`,
    to: `${String(year)}-${mm}-${String(lastDay).padStart(2, '0')}`,
  };
}

function formatTodayContext(todayStr: string): string {
  const [y, m, d] = todayStr.split('-');
  const date = new Date(Number(y), Number(m) - 1, Number(d));
  const dayLabel = DAY_LABELS[date.getDay()];
  return `${String(Number(m))}월 ${String(Number(d))}일 (${dayLabel})`;
}

export function ReservationsSection({
  authToken,
  showToast,
}: ReservationsSectionProps): JSX.Element {
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  const [cancelTargetId, setCancelTargetId] = useState<number | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [detailTargetId, setDetailTargetId] = useState<number | null>(null);
  const [kpiPopup, setKpiPopup] = useState<'weekly' | 'pending' | null>(null);

  // --- Calendar 모드 ---
  const [currentYear, setCurrentYear] = useState(() => new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(
    () => new Date().getMonth() + 1,
  );
  const [selectedDate, setSelectedDate] = useState<string | null>(
    () => getKSTDateString(),
  );
  const [calendarReservations, setCalendarReservations] = useState<
    Reservation[]
  >([]);
  const [isCalendarLoading, setIsCalendarLoading] = useState(false);

  // --- List 모드 ---
  const [listTab, setListTab] = useState<'current' | 'past'>('current');
  const [listPage, setListPage] = useState(1);
  const [listFilters, setListFilters] = useState<PaginatedReservationsFilters>(
    computeInitialListFilters,
  );

  // 장소 옵션 (필터용)
  const { spaces: spaceOptions } = useSpaceOptions({
    authToken,
    enabled: true,
  });

  // 건물 목록 (순서 보존, 중복 제거)
  const buildings = useMemo<Building[]>(() => {
    const seen = new Map<number, Building>();
    for (const space of spaceOptions) {
      if (!seen.has(space.building.id)) seen.set(space.building.id, space.building);
    }
    return [...seen.values()];
  }, [spaceOptions]);

  // 건물 chip 선택 시 해당 건물 공간만 드롭다운에 표시
  const spacesForDropdown = useMemo(
    () =>
      listFilters.building_id !== undefined
        ? spaceOptions.filter((s) => s.building.id === listFilters.building_id)
        : spaceOptions,
    [spaceOptions, listFilters.building_id],
  );

  // List 모드 페이징 hook
  const listEndpoint =
    listTab === 'current'
      ? `${import.meta.env.VITE_API_BASE_URL}/api/v1/admin/reservations/current/`
      : `${import.meta.env.VITE_API_BASE_URL}/api/v1/admin/reservations/past/`;

  const {
    results: listReservations,
    count: listCount,
    totalPages,
    isLoading: isListLoading,
    refetch: refetchList,
  } = usePaginatedReservations({
    endpoint: listEndpoint,
    authToken,
    filters: listFilters,
    page: listPage,
    pageSize: LIST_PAGE_SIZE,
    enabled: viewMode === 'list',
  });

  // --- Calendar fetch ---

  const fetchCalendar = useCallback(async (): Promise<void> => {
    setIsCalendarLoading(true);
    try {
      const { from, to } = computeMonthRange(currentYear, currentMonth);
      const response = await axios.get<PaginatedResponse<Reservation>>(
        `${import.meta.env.VITE_API_BASE_URL}/api/v1/admin/reservations/`,
        {
          headers: { Authorization: `Token ${authToken}` },
          params: {
            from_date: from,
            to_date: to,
            page_size: CALENDAR_PAGE_SIZE,
            ordering: '-start_datetime',
          },
        },
      );
      setCalendarReservations(response.data.results);
    } catch {
      showToast('예약 목록을 불러오는 데 실패했습니다.', 'error');
    } finally {
      setIsCalendarLoading(false);
    }
  }, [authToken, currentYear, currentMonth, showToast]);

  useEffect(() => {
    if (viewMode !== 'calendar') return;
    void fetchCalendar();
  }, [viewMode, fetchCalendar]);

  // --- 페이지 안전장치: 응답 totalPages 보다 listPage 가 크면 보정 ---
  useEffect(() => {
    if (!isListLoading && totalPages > 0 && listPage > totalPages) {
      setListPage(totalPages);
    }
  }, [isListLoading, totalPages, listPage]);

  // --- 월 이동 ---

  function handlePrevMonth(): void {
    const newYear = currentMonth === 1 ? currentYear - 1 : currentYear;
    const newMonth = currentMonth === 1 ? 12 : currentMonth - 1;
    setCurrentYear(newYear);
    setCurrentMonth(newMonth);
    const today = getKSTDateString();
    const todayYear = Number(today.slice(0, 4));
    const todayMonth = Number(today.slice(5, 7));
    if (newYear === todayYear && newMonth === todayMonth) {
      setSelectedDate(today);
    } else {
      setSelectedDate(`${String(newYear)}-${String(newMonth).padStart(2, '0')}-01`);
    }
  }

  function handleNextMonth(): void {
    const newYear = currentMonth === 12 ? currentYear + 1 : currentYear;
    const newMonth = currentMonth === 12 ? 1 : currentMonth + 1;
    setCurrentYear(newYear);
    setCurrentMonth(newMonth);
    const today = getKSTDateString();
    const todayYear = Number(today.slice(0, 4));
    const todayMonth = Number(today.slice(5, 7));
    if (newYear === todayYear && newMonth === todayMonth) {
      setSelectedDate(today);
    } else {
      setSelectedDate(`${String(newYear)}-${String(newMonth).padStart(2, '0')}-01`);
    }
  }

  function handleGoToday(): void {
    const today = getKSTDateString();
    const todayYear = Number(today.slice(0, 4));
    const todayMonth = Number(today.slice(5, 7));
    setCurrentYear(todayYear);
    setCurrentMonth(todayMonth);
    setSelectedDate(today);
  }

  // --- 취소 ---

  function handleCancelRequest(id: number): void {
    // 상세 모달을 먼저 닫아 취소 사유 입력 다이얼로그가 가려지지 않도록 한다.
    setDetailTargetId(null);
    setCancelTargetId(id);
  }

  async function handleCancelConfirm(adminNote: string): Promise<void> {
    if (cancelTargetId === null) return;
    setIsCancelling(true);
    try {
      await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/v1/admin/reservations/${String(cancelTargetId)}/cancel/`,
        { admin_note: adminNote },
        { headers: { Authorization: `Token ${authToken}` } },
      );
      showToast('예약이 취소되었습니다.', 'success');
      setDetailTargetId(null);
      if (viewMode === 'calendar') {
        await fetchCalendar();
      } else {
        await refetchList();
      }
    } catch {
      showToast('취소 처리 중 오류가 발생했습니다.', 'error');
    } finally {
      setIsCancelling(false);
      setCancelTargetId(null);
    }
  }

  // --- List 모드 핸들러 ---

  function handleTabChange(tab: 'current' | 'past'): void {
    setListTab(tab);
    setListPage(1);
  }

  function handleFiltersChange(next: PaginatedReservationsFilters): void {
    let updated = next;
    // 건물이 특정 건물로 변경될 때, 기존 공간이 해당 건물 소속이 아니면 공간 필터 초기화
    if (next.building_id !== undefined && next.building_id !== listFilters.building_id) {
      const currentSpace = spaceOptions.find((s) => s.id === listFilters.space_id);
      if (currentSpace && currentSpace.building.id !== next.building_id) {
        updated = { ...next, space_id: undefined };
      }
    }
    setListFilters(updated);
    setListPage(1);
  }

  function handleSpaceChange(spaceId: number | undefined): void {
    setListFilters({ ...listFilters, space_id: spaceId });
    setListPage(1);
  }

  function handleStatusChange(next: ReservationStatus | undefined): void {
    setListFilters({ ...listFilters, status: next });
    setListPage(1);
  }

  function handleOrderingChange(next: string): void {
    setListFilters({ ...listFilters, ordering: next });
    setListPage(1);
  }

  // 달력 사이드 패널에서 "리스트로 더 보기" 클릭 시: 해당 날짜로 필터를 적용하며
  // 리스트뷰로 전환한다. 과거 날짜면 '지난' 탭, 그 외에는 '예정' 탭으로 보낸다.
  function handleListMoreFromCalendar(date: string): void {
    setListTab(date < todayStr ? 'past' : 'current');
    setListFilters({
      from_date: date,
      to_date: date,
      ordering: '-start_datetime',
    });
    setListPage(1);
    setViewMode('list');
  }

  const detailReservation =
    calendarReservations.find((r) => r.id === detailTargetId) ??
    listReservations.find((r) => r.id === detailTargetId) ??
    null;

  const calendarStatusCount = useMemo(
    () => countReservationsByStatus(calendarReservations),
    [calendarReservations],
  );

  const todayStr = getKSTDateString();

  const headerSubtitle = useMemo<string>(() => {
    if (viewMode === 'calendar') {
      return (
        `${String(currentYear)}년 ${String(currentMonth)}월 · ` +
        `오늘 ${formatTodayContext(todayStr)}`
      );
    }
    const label = listTab === 'current' ? '예정' : '지난';
    return `${label} ${String(listCount)}건`;
  }, [
    viewMode,
    currentYear,
    currentMonth,
    listTab,
    listCount,
    todayStr,
  ]);

  function handleExportCsv(): void {
    showToast('CSV 내보내기는 준비 중입니다.', 'success');
  }

  function handleOpenSettings(): void {
    showToast('설정은 준비 중입니다.', 'success');
  }

  const headerActionBtn =
    'rounded-xl px-3 py-1.5 text-sm font-medium border border-[#E5E7EB] text-gray-700 bg-white hover:bg-gray-50 transition-colors';
  const currentOrdering: string = listFilters.ordering ?? '-start_datetime';

  // 이번 주 (월-일) 범위 계산
  const todayDate = new Date(`${todayStr}T00:00:00+09:00`);
  const dayOfWeek = (todayDate.getDay() + 6) % 7; // 월요일 기준
  const weekStartDate = new Date(todayDate);
  weekStartDate.setDate(todayDate.getDate() - dayOfWeek);
  const weekEndDate = new Date(weekStartDate);
  weekEndDate.setDate(weekStartDate.getDate() + 6);
  const weekStart = weekStartDate.toISOString().slice(0, 10);
  const weekEnd = weekEndDate.toISOString().slice(0, 10);

  const weeklyReservations = calendarReservations.filter(
    (r) =>
      (r.status === 'confirmed' || r.status === 'pending') &&
      r.start_datetime.slice(0, 10) >= weekStart &&
      r.start_datetime.slice(0, 10) <= weekEnd,
  );
  const pendingReservations = calendarReservations.filter(
    (r) => r.status === 'pending',
  );
  const kpiPopupItems = kpiPopup === 'weekly' ? weeklyReservations : pendingReservations;
  const kpiPopupTitle = kpiPopup === 'weekly' ? '이번 주 예약' : '확정 대기';

  const viewToggle = (
    <SegmentedControl
      value={viewMode}
      options={[
        { value: 'calendar', label: '달력' },
        { value: 'list', label: '리스트' },
      ]}
      onChange={setViewMode}
      ariaLabel="뷰 모드"
    />
  );

  const headerActions = (
    <>
      {viewToggle}
      <span aria-hidden="true" className="w-px h-5 bg-[#E5E7EB] mx-1" />
      <button
        type="button"
        onClick={handleOpenSettings}
        className={headerActionBtn}
      >
        ⚙ 설정
      </button>
      <button
        type="button"
        onClick={handleExportCsv}
        className={headerActionBtn}
      >
        📥 CSV
      </button>
    </>
  );

  return (
    <>
      {viewMode === 'calendar' && (
        <>
          <AdminKpiRow
            reservations={calendarReservations}
            weekStart={weekStart}
            weekEnd={weekEnd}
            onWeeklyClick={() => setKpiPopup('weekly')}
            onPendingClick={() => setKpiPopup('pending')}
          />
          <div className="mt-6" />
        </>
      )}

      <SectionHeader
        title="예약 관리"
        subtitle={headerSubtitle}
        actions={headerActions}
      />

      {viewMode === 'calendar' && (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">
          <div className="min-w-0">
            {isCalendarLoading ? (
              <div className="animate-pulse bg-gray-200 rounded h-[640px]" />
            ) : (
              <CalendarGrid
                currentYear={currentYear}
                currentMonth={currentMonth}
                reservations={calendarReservations.filter(
                  (r) => r.status === 'confirmed' || r.status === 'pending',
                )}
                selectedDate={selectedDate}
                onDateSelect={setSelectedDate}
                onPrevMonth={handlePrevMonth}
                onNextMonth={handleNextMonth}
                onGoToday={handleGoToday}
                onReservationClick={(r) => setDetailTargetId(r.id)}
                eventStats={{
                  total: calendarReservations.length,
                  confirmed: calendarStatusCount.confirmed,
                  pending: calendarStatusCount.pending,
                }}
              />
            )}
          </div>
          <div className="hidden lg:block">
            <AdminSideRail
              reservations={calendarReservations}
              selectedDate={selectedDate}
              onReservationClick={(r) => setDetailTargetId(r.id)}
              onMoreClick={handleListMoreFromCalendar}
            />
          </div>
        </div>
      )}

      {viewMode === 'list' && (
        <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-6">
          <aside aria-label="예약 필터" className="flex flex-col gap-5">
            <SidebarSection label="기간 구분">
              <SegmentedControl
                value={listTab}
                options={[
                  { value: 'current', label: '예정' },
                  { value: 'past', label: '지난' },
                ]}
                onChange={handleTabChange}
                ariaLabel="예약 기간 탭"
              />
            </SidebarSection>

            <SidebarSection label="상태">
              <ReservationStatusChips
                value={listFilters.status}
                onChange={handleStatusChange}
              />
            </SidebarSection>

            <SidebarSection label="필터">
              <ListFilterBar
                filters={listFilters}
                onFiltersChange={handleFiltersChange}
                buildings={buildings}
                isLoading={isListLoading}
                orientation="vertical"
              />
            </SidebarSection>
          </aside>

          <div className="min-w-0">
            {/* 공간 드롭다운 필터 */}
            {spacesForDropdown.length > 0 && (
              <div className="mb-3">
                <SpaceFilterDropdown
                  spaces={spacesForDropdown}
                  value={listFilters.space_id}
                  onChange={handleSpaceChange}
                />
              </div>
            )}

            {isListLoading ? (
              <div className="space-y-3">
                <div className="animate-pulse bg-gray-200 rounded h-12" />
                <div className="animate-pulse bg-gray-200 rounded h-10" />
                <div className="animate-pulse bg-gray-200 rounded h-10" />
                <div className="animate-pulse bg-gray-200 rounded h-10" />
              </div>
            ) : (
              <>
                <ListTable
                  reservations={listReservations}
                  onCancelRequest={handleCancelRequest}
                  onDetailRequest={setDetailTargetId}
                  ordering={currentOrdering}
                  onOrderingChange={handleOrderingChange}
                  searchQuery={listFilters.search}
                />

                {totalPages > 1 && (
                  <Pagination
                    page={listPage}
                    totalPages={totalPages}
                    onChange={setListPage}
                    isLoading={isListLoading}
                  />
                )}
              </>
            )}
          </div>
        </div>
      )}

      <CancelDialog
        isOpen={cancelTargetId !== null}
        onConfirm={handleCancelConfirm}
        onClose={() => setCancelTargetId(null)}
        isLoading={isCancelling}
      />

      <ReservationDetailModal
        reservation={detailReservation}
        onClose={() => setDetailTargetId(null)}
        onCancelRequest={handleCancelRequest}
      />

      {kpiPopup !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={() => setKpiPopup(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 max-h-[80vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#E5E7EB]">
              <h3 className="text-sm font-semibold text-[#1C1C1E]">
                {kpiPopupTitle}
                <span className="ml-2 text-xs font-normal text-gray-500">
                  {kpiPopupItems.length}건
                </span>
              </h3>
              <button
                type="button"
                onClick={() => setKpiPopup(null)}
                className="text-gray-400 hover:text-gray-600 text-lg leading-none"
                aria-label="닫기"
              >
                ✕
              </button>
            </div>
            <ul className="overflow-y-auto flex-1 divide-y divide-[#F3F4F6]">
              {kpiPopupItems.length === 0 && (
                <li className="px-5 py-8 text-sm text-center text-gray-400">
                  해당 예약이 없습니다.
                </li>
              )}
              {kpiPopupItems.map((r) => (
                <li key={r.id}>
                  <button
                    type="button"
                    className="w-full text-left px-5 py-3 hover:bg-gray-50 transition-colors"
                    onClick={() => {
                      setDetailTargetId(r.id);
                      setKpiPopup(null);
                    }}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-medium text-gray-700 truncate">
                        {r.applicant_team} · {r.space.building.name} {r.space.name}
                      </span>
                      <StatusPill status={r.status} size="sm" />
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5">
                      {formatDate(r.start_datetime)} {formatTime(r.start_datetime)} – {formatTime(r.end_datetime)}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

    </>
  );
}

interface SidebarSectionProps {
  label: string;
  children: ReactNode;
}

function SidebarSection({ label, children }: SidebarSectionProps): JSX.Element {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">
        {label}
      </span>
      {children}
    </div>
  );
}
