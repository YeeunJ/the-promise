import { useState, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';
import type { Reservation, Space } from '../types';
import { ADMIN_TOKEN_KEY } from '../lib/constants';
import { getKSTDateString, extractDateStr } from '../utils/formatDatetime';
import { useToast } from '../hooks/useToast';
import AdminLoginForm from '../components/AdminLoginForm';
import CalendarGrid from '../components/admin/CalendarGrid';
import { CalendarSidePanel } from '../components/admin/CalendarSidePanel';
import { ListFilterBar } from '../components/admin/ListFilterBar';
import { ListTable } from '../components/admin/ListTable';
import { CancelDialog } from '../components/admin/CancelDialog';
import { Toast } from '../components/ui/Toast';

type DatePreset = '1w' | '2w' | '1m' | 'custom';


function computeInitialDateRange(): { from: string; to: string } {
  const today = new Date();
  const from = today.toISOString().slice(0, 10);
  const future = new Date(today);
  future.setDate(future.getDate() + 7);
  const to = future.toISOString().slice(0, 10);
  return { from, to };
}

function AdminPage(): JSX.Element {
  const [currentYear, setCurrentYear] = useState(() =>
    new Date().getFullYear(),
  );
  const [currentMonth, setCurrentMonth] = useState(
    () => new Date().getMonth() + 1,
  );
  const [isLoggedIn, setIsLoggedIn] = useState(
    () => !!localStorage.getItem(ADMIN_TOKEN_KEY),
  );
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(
    () => getKSTDateString(),
  );

  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  const [cancelTargetId, setCancelTargetId] = useState<number | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  const [spaceFilter, setSpaceFilter] = useState<Set<number>>(new Set());
  const [datePreset, setDatePreset] = useState<DatePreset>('1w');
  const [dateRange, setDateRange] = useState<{ from: string; to: string }>(
    computeInitialDateRange,
  );
  const [teamFilter, setTeamFilter] = useState<Set<string>>(new Set());

  const { toasts, showToast, removeToast } = useToast();

  const allSpaces = useMemo(() => {
    const spaceMap = new Map<number, Space>();
    for (const r of reservations) {
      if (!spaceMap.has(r.space.id)) {
        spaceMap.set(r.space.id, r.space);
      }
    }
    return Array.from(spaceMap.values());
  }, [reservations]);

  const filteredReservations = useMemo(() => {
    return reservations.filter((r) => {
      if (spaceFilter.size > 0 && !spaceFilter.has(r.space.id)) return false;
      const dateStr = extractDateStr(r.start_datetime);
      if (dateStr < dateRange.from || dateStr > dateRange.to) return false;
      if (teamFilter.size > 0 && !teamFilter.has(r.applicant_team))
        return false;
      return true;
    });
  }, [reservations, spaceFilter, dateRange, teamFilter]);

  const fetchReservations = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem(ADMIN_TOKEN_KEY);
      const response = await axios.get<Reservation[]>(
        `${import.meta.env.VITE_API_BASE_URL}/api/v1/admin/reservations/`,
        { headers: { Authorization: `Token ${token}` } },
      );
      setReservations(response.data);
    } catch {
      showToast('예약 목록을 불러오는 데 실패했습니다.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

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

  function handleLogout(): void {
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    setIsLoggedIn(false);
    setReservations([]);
    setSelectedDate(null);
  }

  function handleCancelRequest(id: number): void {
    setCancelTargetId(id);
  }

  async function handleCancelConfirm(adminNote: string): Promise<void> {
    if (cancelTargetId === null) return;
    setIsCancelling(true);
    try {
      const token = localStorage.getItem(ADMIN_TOKEN_KEY);
      await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/v1/admin/reservations/${cancelTargetId}/cancel/`,
        { admin_note: adminNote },
        { headers: { Authorization: `Token ${token}` } },
      );
      showToast('예약이 취소되었습니다.', 'success');
      fetchReservations();
    } catch {
      showToast('취소 처리 중 오류가 발생했습니다.', 'error');
    } finally {
      setIsCancelling(false);
      setCancelTargetId(null);
    }
  }

  useEffect(() => {
    if (isLoggedIn) {
      fetchReservations();
    }
  }, [isLoggedIn, fetchReservations]);

  if (!isLoggedIn) {
    return <AdminLoginForm onLoginSuccess={() => setIsLoggedIn(true)} />;
  }

  return (
    <div className="min-h-screen bg-brand-cream">
      <header className="bg-white border-b border-[#E5E7EB]">
        <div className="max-w-[1920px] mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-black">가나안교회 관리자</h1>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-xl px-4 py-2 text-sm font-medium border-2 border-brand-secondary text-brand-secondary hover:bg-brand-secondary hover:text-white transition-colors duration-200"
          >
            로그아웃
          </button>
        </div>
      </header>

      <main className="max-w-[1920px] mx-auto px-6 py-6">
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
              <div className="flex-[0_0_50%] min-w-0">
                <div className="animate-pulse bg-gray-200 rounded h-64" />
              </div>
              <div className="flex-[0_0_50%] min-w-0 space-y-3">
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
                <div className="flex-[0_0_50%] min-w-0">
                  <CalendarGrid
                    currentYear={currentYear}
                    currentMonth={currentMonth}
                    reservations={reservations.filter((r) => r.status === 'confirmed')}
                    selectedDate={selectedDate}
                    onDateSelect={setSelectedDate}
                  />
                </div>
                <div className="flex-[0_0_50%] min-w-0">
                  <CalendarSidePanel
                    selectedDate={selectedDate}
                    reservations={reservations}
                    onCancelRequest={handleCancelRequest}
                  />
                </div>
              </div>
            )}

            {viewMode === 'list' && (
              <>
                <ListFilterBar
                  reservations={reservations}
                  spaceFilter={spaceFilter}
                  onSpaceFilterChange={setSpaceFilter}
                  datePreset={datePreset}
                  onDatePresetChange={setDatePreset}
                  dateRange={dateRange}
                  onDateRangeChange={setDateRange}
                  teamFilter={teamFilter}
                  onTeamFilterChange={setTeamFilter}
                  spaces={allSpaces}
                />
                <ListTable
                  reservations={filteredReservations}
                  onCancelRequest={handleCancelRequest}
                />
              </>
            )}
          </>
        )}
      </main>

      <Toast toasts={toasts} onRemove={removeToast} />

      <CancelDialog
        isOpen={cancelTargetId !== null}
        onConfirm={handleCancelConfirm}
        onClose={() => setCancelTargetId(null)}
        isLoading={isCancelling}
      />
    </div>
  );
}

export default AdminPage;
