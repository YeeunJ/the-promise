import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import type { PaginatedResponse, Reservation } from '../types';
import ReservationForm from '../components/ReservationForm';
import ReservationSummary from '../components/ReservationSummary';
import LookupForm from '../components/LookupForm';
import ReservationTable from '../components/ReservationTable';

type ActiveTab = 'apply' | 'lookup';
type Credentials = { name: string; phone: string };

function ReservationPage(): JSX.Element {
  const [activeTab, setActiveTab] = useState<ActiveTab>('apply');
  const [submittedReservation, setSubmittedReservation] = useState<Reservation | null>(null);
  const [credentials, setCredentials] = useState<Credentials | null>(null);
  const [upcoming, setUpcoming] = useState<Reservation[]>([]);
  const [past, setPast] = useState<Reservation[]>([]);
  const [isLookupLoading, setIsLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);

  function resetLookup() {
    setCredentials(null);
    setUpcoming([]);
    setPast([]);
    setLookupError(null);
  }

  function handleTabChange(tab: ActiveTab) {
    setActiveTab(tab);
    if (tab === 'apply') {
      resetLookup();
    }
  }

  const fetchLookup = useCallback(async (creds: Credentials): Promise<void> => {
    setIsLookupLoading(true);
    setLookupError(null);
    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL as string;
      const params = { name: creds.name, phone: creds.phone, page_size: 100 };
      const [currentRes, pastRes] = await Promise.all([
        axios.get<PaginatedResponse<Reservation>>(
          `${baseUrl}/api/v1/reservations/current/`,
          { params },
        ),
        axios.get<PaginatedResponse<Reservation>>(
          `${baseUrl}/api/v1/reservations/past/`,
          { params },
        ),
      ]);
      setUpcoming(currentRes.data.results);
      setPast(pastRes.data.results);
    } catch {
      setLookupError('조회 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setIsLookupLoading(false);
    }
  }, []);

  useEffect(() => {
    if (credentials) {
      void fetchLookup(credentials);
    }
  }, [credentials, fetchLookup]);

  async function handleCancelSuccess(): Promise<void> {
    if (credentials) {
      await fetchLookup(credentials);
    }
  }

  return (
    <div className="min-h-screen bg-brand-cream flex flex-col">
      {/* 헤더 */}
      <header className="bg-white border-b border-gray-200 flex-shrink-0 sticky top-0 z-10">
        <div className="max-w-screen-xl mx-auto px-6 py-5 flex items-center">
          <div className="flex items-center gap-3">
            <span className="text-2xl font-black text-brand-primary tracking-tight">가나안교회</span>
            <span className="text-gray-300">|</span>
            <span className="text-lg font-semibold text-black">장소 사용 신청</span>
          </div>
        </div>
      </header>

      {/* 탭 */}
      <div className="bg-white border-b border-gray-200 flex-shrink-0 sticky top-0 z-10">
        <div className="max-w-screen-xl mx-auto px-6">
          <nav aria-label="페이지 탭" className="flex gap-1">
            {(['apply', 'lookup'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => handleTabChange(tab)}
                className={`px-5 py-3.5 text-sm font-semibold border-b-2 transition-colors ${
                  activeTab === tab
                    ? 'border-brand-primary text-brand-primary'
                    : 'border-transparent text-gray-500 hover:text-brand-primary'
                }`}
              >
                {tab === 'apply' ? '예약 신청' : '내 예약 조회'}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* 메인 */}
      <main className="flex-1 flex flex-col">
        {activeTab === 'apply' && (
          <div className="flex-1 flex items-center justify-center px-6 py-10">
            {submittedReservation === null ? (
              <ReservationForm onSubmitSuccess={(r) => setSubmittedReservation(r)} />
            ) : (
              <div className="w-full max-w-lg">
                <ReservationSummary
                  reservation={submittedReservation}
                  onReset={() => setSubmittedReservation(null)}
                />
              </div>
            )}
          </div>
        )}

        {activeTab === 'lookup' && (
          <div className="max-w-screen-xl mx-auto px-6 py-8">
            {credentials === null ? (
              <div className="max-w-lg mx-auto">
                <LookupForm
                  onSubmit={(c) => setCredentials(c)}
                  isLoading={isLookupLoading}
                />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">
                    {credentials.name}님의 예약 내역
                  </span>
                  <button
                    type="button"
                    onClick={resetLookup}
                    className="text-sm text-brand-primary hover:text-brand-secondary font-medium transition-colors"
                  >
                    ← 다시 조회
                  </button>
                </div>
                {lookupError !== null && (
                  <p className="text-sm text-red-600">{lookupError}</p>
                )}
                <ReservationTable
                  upcoming={upcoming}
                  past={past}
                  credentials={credentials}
                  onGoToApply={() => handleTabChange('apply')}
                  onCancelSuccess={handleCancelSuccess}
                />
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default ReservationPage;
