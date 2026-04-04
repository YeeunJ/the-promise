import { useState } from 'react';
import type { Reservation } from '../types';
import ReservationForm from '../components/ReservationForm';
import ReservationSummary from '../components/ReservationSummary';
import LookupForm from '../components/LookupForm';
import ReservationTable from '../components/ReservationTable';

type ActiveTab = 'apply' | 'lookup';

function ReservationPage(): JSX.Element {
  const [activeTab, setActiveTab] = useState<ActiveTab>('apply');
  const [submittedReservation, setSubmittedReservation] = useState<Reservation | null>(null);
  const [lookupResults, setLookupResults] = useState<Reservation[]>([]);

  function handleSubmitSuccess(reservation: Reservation) {
    setSubmittedReservation(reservation);
  }

  function handleReset() {
    setSubmittedReservation(null);
  }

  function handleLookupResult(reservations: Reservation[]) {
    setLookupResults(reservations);
  }

  function handleTabChange(tab: ActiveTab) {
    setActiveTab(tab);
  }

  return (
    <div className="min-h-screen bg-[#FEFAE0]">
      {/* 페이지 헤더 */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-[600px] mx-auto px-4 py-5">
          <h1 className="text-xl font-bold text-black">장소 사용 신청</h1>
        </div>
      </header>

      {/* 탭 네비게이션 */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-[600px] mx-auto px-4">
          <nav className="flex">
            <button
              type="button"
              onClick={() => handleTabChange('apply')}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'apply'
                  ? 'border-[#008F49] text-[#008F49]'
                  : 'border-transparent text-gray-500 hover:text-[#008F49]'
              }`}
            >
              예약 신청
            </button>
            <button
              type="button"
              onClick={() => handleTabChange('lookup')}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'lookup'
                  ? 'border-[#008F49] text-[#008F49]'
                  : 'border-transparent text-gray-500 hover:text-[#008F49]'
              }`}
            >
              내 예약 조회
            </button>
          </nav>
        </div>
      </div>

      {/* 탭 콘텐츠 */}
      <main className="max-w-[600px] mx-auto px-4 py-6">
        {activeTab === 'apply' && (
          <div>
            {submittedReservation === null ? (
              <ReservationForm onSubmitSuccess={handleSubmitSuccess} />
            ) : (
              <ReservationSummary
                reservation={submittedReservation}
                onReset={handleReset}
              />
            )}
          </div>
        )}

        {activeTab === 'lookup' && (
          <div className="space-y-6">
            <LookupForm onResult={handleLookupResult} />
            {lookupResults.length > 0 && (
              <ReservationTable reservations={lookupResults} />
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default ReservationPage;
