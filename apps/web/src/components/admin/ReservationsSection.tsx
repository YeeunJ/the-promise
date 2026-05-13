import { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import type {
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
    setListFilters(next);
    setListPage(1);
  }

  function handleStatusChange(next: ReservationStatus | undefined): void {
    setListFilters({ ...listFilters, status: next });
    setListPage(1);
  }

  function handleOrderingChange(
    next: 'start_datetime' | '-start_datetime',
  ): void {
    setListFilters({ ...listFilters, ordering: next });
    setListPage(1);
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
  const currentOrdering: 'start_datetime' | '-start_datetime' =
    listFilters.ordering === 'start_datetime'
      ? 'start_datetime'
      : '-start_datetime';

  // 이번 주 (월-일) 범위 계산
  const todayDate = new Date(`${todayStr}T00:00:00+09:00`);
  const dayOfWeek = (todayDate.getDay() + 6) % 7; // 월요일 기준
  const weekStartDate = new Date(todayDate);
  weekStartDate.setDate(todayDate.getDate() - dayOfWeek);
  const weekEndDate = new Date(weekStartDate);
  weekEndDate.setDate(weekStartDate.getDate() + 6);
  const weekStart = weekStartDate.toISOString().slice(0, 10);
  const weekEnd = weekEndDate.toISOString().slice(0, 10);

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
                  (r) => r.status === 'confirmed',
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
              todayDateStr={todayStr}
              onReservationClick={(r) => setDetailTargetId(r.id)}
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
                spaces={spaceOptions}
                isLoading={isListLoading}
                orientation="vertical"
              />
            </SidebarSection>
          </aside>

          <div className="min-w-0">
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
