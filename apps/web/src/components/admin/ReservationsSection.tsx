import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import type { PaginatedResponse, Reservation } from '../../types';
import { getKSTDateString } from '../../utils/formatDatetime';
import { useSpaceOptions } from '../../hooks/useSpaceOptions';
import {
  usePaginatedReservations,
  type PaginatedReservationsFilters,
} from '../../hooks/usePaginatedReservations';
import CalendarGrid from './CalendarGrid';
import { CalendarSidePanel } from './CalendarSidePanel';
import { ListFilterBar } from './ListFilterBar';
import { ListTable } from './ListTable';
import { CancelDialog } from './CancelDialog';
import { ReservationDetailModal } from './ReservationDetailModal';
import { Pagination } from '../ui/Pagination';

const LIST_PAGE_SIZE = 20;
const CALENDAR_PAGE_SIZE = 100;

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

  const isLoading =
    viewMode === 'calendar' ? isCalendarLoading : isListLoading;

  const detailReservation =
    calendarReservations.find((r) => r.id === detailTargetId) ??
    listReservations.find((r) => r.id === detailTargetId) ??
    null;

  const tabBtn = (active: boolean): string =>
    `px-4 py-2 text-sm font-medium rounded-lg ${
      active
        ? 'bg-brand-primary text-white'
        : 'bg-white text-gray-600 border border-[#E5E7EB]'
    }`;

  return (
    <>
      {/* Top Bar: View Toggle + Month Navigation */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => setViewMode('calendar')}
            className={`px-4 py-2 text-sm font-medium rounded-lg ${
              viewMode === 'calendar'
                ? 'bg-brand-primary text-white'
                : 'bg-white text-gray-600 border'
            }`}
          >
            달력 보기
          </button>
          <button
            type="button"
            onClick={() => setViewMode('list')}
            className={`px-4 py-2 text-sm font-medium rounded-lg ${
              viewMode === 'list'
                ? 'bg-brand-primary text-white'
                : 'bg-white text-gray-600 border'
            }`}
          >
            리스트 보기
          </button>
        </div>

        {viewMode === 'calendar' && (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="w-12 h-12 rounded-[14px] border-2 border-brand-secondary text-brand-secondary flex items-center justify-center hover:bg-brand-secondary hover:text-white transition-colors duration-200"
            >
              ◀
            </button>
            <button
              type="button"
              onClick={handleNextMonth}
              className="w-12 h-12 rounded-[14px] border-2 border-brand-secondary text-brand-secondary flex items-center justify-center hover:bg-brand-secondary hover:text-white transition-colors duration-200"
            >
              ▶
            </button>
          </div>
        )}
      </div>

      {/* Month Display (calendar view only) */}
      {viewMode === 'calendar' && (
        <div className="mb-6">
          <span className="block text-5xl font-black text-black leading-none">
            {currentYear}년 {currentMonth}월
          </span>
        </div>
      )}

      {/* Content Area */}
      {isLoading ? (
        viewMode === 'calendar' ? (
          <div className="flex gap-6">
            <div className="flex-[0_0_40%] min-w-0">
              <div className="animate-pulse bg-gray-200 rounded h-64" />
            </div>
            <div className="flex-[0_0_60%] min-w-0 space-y-3">
              <div className="animate-pulse bg-gray-200 rounded h-12" />
              <div className="animate-pulse bg-gray-200 rounded h-12" />
              <div className="animate-pulse bg-gray-200 rounded h-12" />
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="animate-pulse bg-gray-200 rounded h-12" />
            <div className="animate-pulse bg-gray-200 rounded h-10" />
            <div className="animate-pulse bg-gray-200 rounded h-10" />
            <div className="animate-pulse bg-gray-200 rounded h-10" />
          </div>
        )
      ) : (
        <>
          {viewMode === 'calendar' && (
            <div className="flex gap-6">
              <div className="flex-[0_0_40%] min-w-0">
                <CalendarGrid
                  currentYear={currentYear}
                  currentMonth={currentMonth}
                  reservations={calendarReservations.filter(
                    (r) => r.status === 'confirmed',
                  )}
                  selectedDate={selectedDate}
                  onDateSelect={setSelectedDate}
                />
              </div>
              <div className="flex-[0_0_60%] min-w-0">
                <CalendarSidePanel
                  selectedDate={selectedDate}
                  reservations={calendarReservations}
                  onCancelRequest={handleCancelRequest}
                  onDetailRequest={setDetailTargetId}
                />
              </div>
            </div>
          )}

          {viewMode === 'list' && (
            <>
              <div className="flex gap-2 mb-3">
                <button
                  type="button"
                  className={tabBtn(listTab === 'current')}
                  onClick={() => handleTabChange('current')}
                >
                  예정
                </button>
                <button
                  type="button"
                  className={tabBtn(listTab === 'past')}
                  onClick={() => handleTabChange('past')}
                >
                  지난
                </button>
              </div>

              <ListFilterBar
                filters={listFilters}
                onFiltersChange={handleFiltersChange}
                spaces={spaceOptions}
                isLoading={isListLoading}
              />

              <ListTable
                reservations={listReservations}
                onCancelRequest={handleCancelRequest}
                onDetailRequest={setDetailTargetId}
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
        </>
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
      />
    </>
  );
}
