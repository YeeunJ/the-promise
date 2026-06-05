import { useCallback, useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeftRight } from 'lucide-react';
import type { PaginatedResponse, Reservation } from '../types';
import ReservationTable from '../components/ReservationTable';
import { MyKpiRow } from '../components/my/MyKpiRow';
import { UserReservationDetailModal } from '../components/my/UserReservationDetailModal';
import { useLookupCredentials } from '../hooks/useLookupCredentials';
import type { LookupCredentials } from '../hooks/useLookupCredentials';

// 예정(미래) 예약은 KPI 집계 정확성을 위해 한 번에 충분히 가져온다.
const CURRENT_PAGE_SIZE = 100;
// 지난 내역은 양이 많을 수 있어 20건씩 "더보기"로 점진 로드한다.
const PAST_PAGE_SIZE = 20;

export function MyReservationsPage(): JSX.Element {
  const navigate = useNavigate();
  const { credentials, clearCredentials } = useLookupCredentials();
  const [upcoming, setUpcoming] = useState<Reservation[]>([]);
  const [past, setPast] = useState<Reservation[]>([]);
  const [pastPage, setPastPage] = useState(1);
  const [pastTotalCount, setPastTotalCount] = useState(0);
  const [isLoadingMorePast, setIsLoadingMorePast] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [detailReservation, setDetailReservation] = useState<Reservation | null>(null);
  const [cancelError, setCancelError] = useState<string | null>(null);

  const fetchLookup = useCallback(async (creds: LookupCredentials): Promise<void> => {
    setIsLoading(true);
    setLookupError(null);
    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL as string;
      const auth = { name: creds.name, phone: creds.phone };
      const [currentRes, pastRes] = await Promise.all([
        axios.get<PaginatedResponse<Reservation>>(
          `${baseUrl}/api/v1/reservations/current/`,
          { params: { ...auth, page_size: CURRENT_PAGE_SIZE } },
        ),
        axios.get<PaginatedResponse<Reservation>>(
          `${baseUrl}/api/v1/reservations/past/`,
          { params: { ...auth, page: 1, page_size: PAST_PAGE_SIZE } },
        ),
      ]);
      setUpcoming(currentRes.data.results);
      setPast(pastRes.data.results);
      setPastTotalCount(pastRes.data.count);
      setPastPage(1);
    } catch {
      setLookupError('조회 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleLoadMorePast = useCallback(async (): Promise<void> => {
    if (credentials === null) return;
    setIsLoadingMorePast(true);
    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL as string;
      const nextPage = pastPage + 1;
      const res = await axios.get<PaginatedResponse<Reservation>>(
        `${baseUrl}/api/v1/reservations/past/`,
        {
          params: {
            name: credentials.name,
            phone: credentials.phone,
            page: nextPage,
            page_size: PAST_PAGE_SIZE,
          },
        },
      );
      setPast((prev) => [...prev, ...res.data.results]);
      setPastTotalCount(res.data.count);
      setPastPage(nextPage);
    } catch {
      setLookupError('지난 내역을 더 불러오지 못했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setIsLoadingMorePast(false);
    }
  }, [credentials, pastPage]);

  useEffect(() => {
    if (credentials !== null) {
      void fetchLookup(credentials);
    }
  }, [credentials, fetchLookup]);

  const handleCancelSuccess = useCallback(async (): Promise<void> => {
    if (credentials !== null) {
      await fetchLookup(credentials);
    }
  }, [credentials, fetchLookup]);

  function handleResetLookup(): void {
    clearCredentials();
    navigate('/my/login');
  }

  function handleRowClick(reservation: Reservation): void {
    setDetailReservation(reservation);
  }

  async function handleCancelFromModal(reservationId: number): Promise<void> {
    if (credentials === null) return;
    setCancelError(null);
    try {
      await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/v1/reservations/${reservationId}/cancel/`,
        { name: credentials.name, phone: credentials.phone },
      );
      setDetailReservation(null);
      await fetchLookup(credentials);
    } catch {
      setCancelError('취소 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    }
  }

  if (credentials === null) {
    return <Navigate to="/my/login" replace />;
  }

  return (
    <div className="mx-auto w-full max-w-[1180px] px-10 py-10">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <div className="mb-1 text-[11px] font-bold uppercase tracking-[0.08em] text-accent">
            MY RESERVATIONS
          </div>
          <h1 className="m-0 text-2xl font-extrabold tracking-[-0.025em] text-ink">
            {credentials.name}님의 예약 내역
          </h1>
        </div>
        <button
          type="button"
          onClick={handleResetLookup}
          className="inline-flex items-center gap-1.5 rounded-full border border-edge bg-surface px-4 py-2 text-[13px] font-semibold text-ink hover:bg-surface-2"
        >
          <ArrowLeftRight size={14} aria-hidden="true" />
          다시 조회
        </button>
      </header>

      <MyKpiRow reservations={upcoming} />

      {lookupError !== null && (
        <p role="alert" className="mt-4 text-sm text-danger">
          {lookupError}
        </p>
      )}

      <div className="mt-6 rounded-[18px] border border-edge-soft bg-surface p-6">
        {isLoading ? (
          <div className="h-32 animate-pulse rounded bg-edge-soft" aria-label="로딩 중" />
        ) : (
          <ReservationTable
            upcoming={upcoming}
            past={past}
            credentials={credentials}
            onGoToApply={() => navigate('/booking')}
            onCancelSuccess={() => void handleCancelSuccess()}
            onRowClick={handleRowClick}
            totalPastCount={pastTotalCount}
            hasMorePast={past.length < pastTotalCount}
            isLoadingMorePast={isLoadingMorePast}
            onLoadMorePast={() => void handleLoadMorePast()}
          />
        )}
      </div>

      {detailReservation !== null && (
        <UserReservationDetailModal
          isOpen
          reservation={detailReservation}
          onClose={() => setDetailReservation(null)}
          onCancel={(id) => void handleCancelFromModal(id)}
        />
      )}

      {cancelError !== null && (
        <div
          role="alert"
          className="fixed bottom-6 right-6 z-50 rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger shadow-design-md"
        >
          {cancelError}
        </div>
      )}
    </div>
  );
}

export default MyReservationsPage;
