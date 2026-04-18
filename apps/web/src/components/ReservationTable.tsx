import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { formatDatetimeRange } from '../utils/formatDatetime';
import { formatSpaceName, formatSpaceNameParts } from '../utils/formatSpaceName';
import { StatusBadge } from './ui/StatusBadge';
import type { Reservation } from '../types/index';

interface Credentials {
  name: string;
  phone: string;
}

interface ReservationTableProps {
  reservations: Reservation[];
  credentials: Credentials;
  onGoToApply: () => void;
  onCancelSuccess: () => void;
}

async function downloadTicket(reservationId: number, credentials: Credentials): Promise<void> {
  const response = await axios.get<Blob>(
    `${import.meta.env.VITE_API_BASE_URL}/api/v1/reservations/${reservationId}/ticket/`,
    {
      params: { name: credentials.name, phone: credentials.phone },
      responseType: 'blob',
    }
  );
  const url = URL.createObjectURL(response.data);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `ticket-${reservationId}.png`;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 100);
}

type TicketState = 'idle' | 'loading' | 'success' | 'error';

const TICKET_LABEL_MAP: Record<TicketState, string> = {
  idle: '티켓 다운로드',
  loading: '다운로드 중...',
  success: '✓',
  error: '재시도',
};

function TicketButton({
  reservationId,
  credentials,
  status,
}: {
  reservationId: number;
  credentials: Credentials;
  status: Reservation['status'];
}): JSX.Element {
  const [state, setState] = useState<TicketState>('idle');
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (state !== 'success') return;
    const timer = setTimeout(() => setState('idle'), 1500);
    return () => clearTimeout(timer);
  }, [state]);

  async function handleClick(): Promise<void> {
    setState('loading');
    try {
      await downloadTicket(reservationId, credentials);
      if (isMounted.current) setState('success');
    } catch {
      if (isMounted.current) setState('error');
    }
  }

  const isLoading = state === 'loading';
  const isError = state === 'error';
  const isSuccess = state === 'success';
  const isDisabled = status === 'cancelled' || status === 'rejected';

  return (
    <div className="flex flex-col items-start gap-0.5">
      <button
        type="button"
        onClick={handleClick}
        disabled={isLoading || isDisabled}
        title={
          isDisabled
            ? '취소된 예약은 티켓을 다운로드할 수 없습니다'
            : isError
            ? '다운로드 실패. 다시 시도해주세요.'
            : isSuccess
            ? '다운로드 완료'
            : '티켓 이미지 다운로드'
        }
        className={`whitespace-nowrap text-xs px-2 py-1 rounded-lg font-medium transition-colors disabled:cursor-not-allowed ${
          isDisabled
            ? 'bg-gray-50 text-gray-400'
            : isError
            ? 'bg-red-100 text-red-600 hover:bg-red-200'
            : isSuccess
            ? 'bg-green-100 text-green-600'
            : 'bg-brand-primary/10 text-brand-primary hover:bg-brand-primary/20 disabled:opacity-50'
        }`}
      >
        {TICKET_LABEL_MAP[state]}
      </button>
      {isError && (
        <p className="text-xs text-red-500">다운로드 실패. 다시 시도해주세요.</p>
      )}
    </div>
  );
}

function CancelButton({
  reservationId,
  status,
  credentials,
  onCancelSuccess,
}: {
  reservationId: number;
  status: Reservation['status'];
  credentials: Credentials;
  onCancelSuccess: () => void;
}): JSX.Element {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const isCancellable = status === 'confirmed' || status === 'pending';

  function closeModal(): void {
    setIsModalOpen(false);
    setCancelError(null);
  }

  async function handleConfirmCancel(): Promise<void> {
    setIsCancelling(true);
    setCancelError(null);
    try {
      await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/v1/reservations/${reservationId}/cancel/`,
        { name: credentials.name, phone: credentials.phone }
      );
      if (isMounted.current) {
        setIsModalOpen(false);
        onCancelSuccess();
      }
    } catch {
      if (isMounted.current) {
        setCancelError('취소 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
      }
    } finally {
      if (isMounted.current) setIsCancelling(false);
    }
  }

  return (
    <>
      <button
        type="button"
        disabled={!isCancellable}
        onClick={() => setIsModalOpen(true)}
        className={`whitespace-nowrap text-xs px-3 py-1.5 rounded-lg font-medium transition-colors disabled:cursor-not-allowed ${
          isCancellable
            ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200'
            : 'bg-gray-50 text-gray-400 cursor-not-allowed'
        }`}
      >
        예약 취소
      </button>

      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={closeModal}
        >
          <div
            className="bg-white rounded-2xl p-6 shadow-xl w-full max-w-sm mx-4 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-1">
              <p className="text-base font-semibold text-gray-900">예약을 취소하시겠습니까?</p>
              <p className="text-sm text-gray-500">취소된 예약은 복구할 수 없습니다.</p>
            </div>
            {cancelError !== null && (
              <p className="text-sm text-red-600">{cancelError}</p>
            )}
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={closeModal}
                className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                예약 유지
              </button>
              <button
                type="button"
                onClick={handleConfirmCancel}
                disabled={isCancelling}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                지금 취소
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function EmptyState({ onGoToApply }: { onGoToApply: () => void }): JSX.Element {
  return (
    <div className="text-center py-12 space-y-4">
      <div className="text-5xl">📋</div>
      <div>
        <p className="text-gray-700 font-medium">조회된 예약이 없습니다</p>
        <p className="text-sm text-gray-500 mt-1">
          입력하신 이름과 연락처로 예약 내역을 찾지 못했습니다.
        </p>
        <p className="text-sm text-gray-500">
          이름과 연락처를 다시 확인하거나, 신규 예약을 신청해보세요.
        </p>
      </div>
      <button
        type="button"
        onClick={onGoToApply}
        className="inline-flex items-center gap-1 text-sm font-medium text-brand-primary hover:text-brand-secondary transition-colors"
      >
        예약 신청하러 가기 →
      </button>
    </div>
  );
}

function ResultHeader({ upcomingCount }: { upcomingCount: number }): JSX.Element {
  return (
    <p className="text-sm text-gray-500 mb-3">
      예정된 예약 <span className="font-semibold text-gray-800">{upcomingCount}건</span>
    </p>
  );
}

function ReservationCard({
  reservation,
  credentials,
  onCancelSuccess,
}: {
  reservation: Reservation;
  credentials: Credentials;
  onCancelSuccess: () => void;
}): JSX.Element {
  return (
    <div className="bg-white border border-[#E5E7EB] rounded-xl p-4 shadow-sm space-y-2 overflow-hidden">
      <div className="flex items-center justify-between">
        <span className="text-xs text-brand-accent">No. {reservation.id}</span>
        <StatusBadge status={reservation.status} />
      </div>
      <div>
        <p className="text-sm font-medium text-black">
          {formatSpaceName(reservation.space)}
        </p>
        <p className="text-sm text-gray-600 mt-0.5">
          {formatDatetimeRange(reservation.start_datetime, reservation.end_datetime)}
        </p>
      </div>
      <div className="flex items-center gap-4 text-sm text-gray-600 min-w-0">
        <span className="flex-shrink-0">{reservation.headcount}명</span>
        <span className="truncate overflow-hidden">{reservation.purpose}</span>
      </div>
      <div className="flex items-center gap-2 pt-1">
        <TicketButton
          reservationId={reservation.id}
          credentials={credentials}
          status={reservation.status}
        />
        <CancelButton
          reservationId={reservation.id}
          status={reservation.status}
          credentials={credentials}
          onCancelSuccess={onCancelSuccess}
        />
      </div>
    </div>
  );
}

function ReservationList({
  reservations,
  credentials,
  onCancelSuccess,
}: {
  reservations: Reservation[];
  credentials: Credentials;
  onCancelSuccess: () => void;
}): JSX.Element {
  return (
    <>
      {/* 모바일: 카드 리스트 (md 미만) */}
      <div className="flex flex-col gap-3 md:hidden">
        {reservations.map((reservation) => (
          <ReservationCard
            key={reservation.id}
            reservation={reservation}
            credentials={credentials}
            onCancelSuccess={onCancelSuccess}
          />
        ))}
      </div>

      {/* 데스크탑: 테이블 (md 이상) */}
      <div className="hidden md:block">
        <table className="w-full table-fixed divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-center text-xs font-medium text-brand-accent uppercase tracking-wider w-[6%]">
                번호
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-brand-accent uppercase tracking-wider w-[15%]">
                공간
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-brand-accent uppercase tracking-wider w-[22%]">
                날짜·시간
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-brand-accent uppercase tracking-wider w-[7%]">
                인원
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-brand-accent uppercase tracking-wider w-[24%]">
                사용목적
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-brand-accent uppercase tracking-wider w-[8%]">
                상태
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-brand-accent uppercase tracking-wider w-[10%]">
                티켓
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-brand-accent uppercase tracking-wider w-[8%]">
                취소
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {reservations.map((reservation) => {
              const { buildingFloor, roomName } = formatSpaceNameParts(reservation.space);
              return (
              <tr key={reservation.id} className="h-[72px] hover:bg-gray-50">
                <td className="px-4 py-3 text-sm text-brand-accent text-center align-middle">
                  {reservation.id}
                </td>
                <td className="px-4 py-3 text-sm text-black text-center align-middle overflow-hidden">
                  <div className="truncate">{buildingFloor}</div>
                  <div className="truncate text-xs text-gray-500">{roomName}</div>
                </td>
                <td className="px-4 py-3 text-sm text-black whitespace-nowrap text-center align-middle">
                  {formatDatetimeRange(
                    reservation.start_datetime,
                    reservation.end_datetime
                  )}
                </td>
                <td className="px-4 py-3 text-sm text-black text-center align-middle">
                  {reservation.headcount}명
                </td>
                <td className="px-4 py-3 text-sm text-black overflow-hidden align-middle">
                  <div className="line-clamp-2">{reservation.purpose}</div>
                </td>
                <td className="px-4 py-3 text-sm text-center align-middle whitespace-nowrap">
                  <StatusBadge status={reservation.status} />
                </td>
                <td className="px-4 py-3 text-sm text-center align-middle">
                  <TicketButton
                    reservationId={reservation.id}
                    credentials={credentials}
                    status={reservation.status}
                  />
                </td>
                <td className="px-4 py-3 text-sm text-center align-middle">
                  <CancelButton
                    reservationId={reservation.id}
                    status={reservation.status}
                    credentials={credentials}
                    onCancelSuccess={onCancelSuccess}
                  />
                </td>
              </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}

function ReservationTable({
  reservations,
  credentials,
  onGoToApply,
  onCancelSuccess,
}: ReservationTableProps): JSX.Element {
  const [showPast, setShowPast] = useState(false);

  const now = new Date();
  const upcoming = reservations.filter((r) => new Date(r.end_datetime) >= now);
  const past = reservations.filter((r) => new Date(r.end_datetime) < now);

  if (reservations.length === 0) {
    return <EmptyState onGoToApply={onGoToApply} />;
  }

  return (
    <>
      {upcoming.length === 0 ? (
        <div className="text-center py-8 space-y-2">
          <p className="text-sm text-gray-500">예정된 예약이 없습니다.</p>
        </div>
      ) : (
        <>
          <ResultHeader upcomingCount={upcoming.length} />
          <ReservationList
            reservations={upcoming}
            credentials={credentials}
            onCancelSuccess={onCancelSuccess}
          />
        </>
      )}

      {past.length > 0 && (
        <div className="mt-4">
          <button
            type="button"
            onClick={() => {
              const currentScroll = window.scrollY;
              setShowPast((prev) => !prev);
              requestAnimationFrame(() => {
                window.scrollTo({ top: currentScroll, behavior: 'instant' });
              });
            }}
            className="w-full py-2.5 text-sm text-gray-500 border border-dashed border-gray-300 rounded-xl hover:border-gray-400 hover:text-gray-700 transition-colors"
          >
            {showPast
              ? `지난 내역 숨기기`
              : `지난 내역 보기 (${past.length}건)`}
          </button>

          {showPast && (
            <div className="mt-3">
              <ReservationList
                reservations={past}
                credentials={credentials}
                onCancelSuccess={onCancelSuccess}
              />
            </div>
          )}
        </div>
      )}
    </>
  );
}

export default ReservationTable;
