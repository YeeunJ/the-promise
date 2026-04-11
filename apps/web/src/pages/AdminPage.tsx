import { useState, useEffect } from 'react';
import axios from 'axios';
import type { Reservation } from '../types';
import { ADMIN_TOKEN_KEY } from '../lib/constants';
import AdminLoginForm from '../components/AdminLoginForm';
import CalendarGrid from '../components/admin/CalendarGrid';
import ReservationPanel from '../components/admin/ReservationPanel';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
] as const;

function AdminPage(): JSX.Element {
  const [currentYear, setCurrentYear] = useState(() => new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(() => new Date().getMonth() + 1);
  const [isLoggedIn, setIsLoggedIn] = useState(() => !!localStorage.getItem(ADMIN_TOKEN_KEY));
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);

  async function fetchReservations(): Promise<void> {
    setIsLoading(true);
    setFetchError(null);
    try {
      const token = localStorage.getItem(ADMIN_TOKEN_KEY);
      const response = await axios.get<Reservation[]>(
        `${import.meta.env.VITE_API_BASE_URL}/api/v1/admin/reservations/`,
        { headers: { Authorization: `Token ${token}` } }
      );
      setReservations(response.data);
    } catch {
      setFetchError('예약 목록을 불러오는 데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  }

  function handlePrevMonth(): void {
    if (currentMonth === 1) {
      setCurrentYear((y) => y - 1);
      setCurrentMonth(12);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  }

  function handleNextMonth(): void {
    if (currentMonth === 12) {
      setCurrentYear((y) => y + 1);
      setCurrentMonth(1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  }

  function handleLogout(): void {
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    setIsLoggedIn(false);
    setReservations([]);
    setSelectedDate(null);
  }

  useEffect(() => {
    if (isLoggedIn) {
      fetchReservations();
    }
  }, [currentYear, currentMonth, isLoggedIn]);

  if (!isLoggedIn) {
    return <AdminLoginForm onLoginSuccess={() => setIsLoggedIn(true)} />;
  }

  return (
    <div className="min-h-screen bg-brand-cream">
      <header className="bg-white border-b border-[#E5E7EB]">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-black">어드민 대시보드</h1>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-xl px-4 py-2 text-sm font-medium border-2 border-brand-secondary text-brand-secondary hover:bg-brand-secondary hover:text-white transition-colors duration-200"
          >
            로그아웃
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex items-end justify-between mb-6">
          <div>
            <span className="block text-5xl font-black text-black leading-none">
              {MONTH_NAMES[currentMonth - 1]}
            </span>
            <span className="block text-xl font-normal text-brand-accent mt-1">
              {currentYear}
            </span>
          </div>
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
        </div>

        {fetchError && (
          <div className="mb-4 rounded-xl bg-[#DC2626]/10 border border-[#DC2626]/30 p-3 text-sm text-[#DC2626]">
            {fetchError}
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-primary border-t-transparent" />
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1 min-w-0">
              <CalendarGrid
                currentYear={currentYear}
                currentMonth={currentMonth}
                reservations={reservations}
                selectedDate={selectedDate}
                onDateSelect={setSelectedDate}
              />
            </div>
            <div className="lg:w-80 flex-shrink-0">
              <ReservationPanel
                selectedDate={selectedDate}
                reservations={reservations}
                onCancelSuccess={fetchReservations}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default AdminPage;
