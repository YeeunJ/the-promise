import { useState } from 'react';
import axios from 'axios';
import type { Reservation, ReservationStatus } from '../../types/index';
import { ADMIN_TOKEN_KEY } from '../../lib/constants';
import { extractDateStr, formatDatetimeRange } from '../../utils/formatDatetime';
import { formatSpaceName } from '../../utils/formatSpaceName';
import { StatusBadge } from '../ui/StatusBadge';

interface ReservationPanelProps {
  selectedDate: string | null;
  reservations: Reservation[];
  onCancelSuccess: () => void;
}

function ReservationPanel({ selectedDate, reservations, onCancelSuccess }: ReservationPanelProps): JSX.Element {
  const [cancellingId, setCancellingId] = useState<number | null>(null);
  const [confirmingId, setConfirmingId] = useState<number | null>(null);
  const [cancelError, setCancelError] = useState<string | null>(null);

  const dayReservations = selectedDate
    ? reservations.filter(r => extractDateStr(r.start_datetime) === selectedDate)
    : [];

  function handleCancelClick(id: number) {
    setConfirmingId(id);
  }

  function handleCancelConfirm() {
    if (confirmingId !== null) {
      void executeCancellation(confirmingId);
      setConfirmingId(null);
    }
  }

  function handleCancelAbort() {
    setConfirmingId(null);
  }

  async function executeCancellation(id: number) {
    setCancellingId(id);
    setCancelError(null);
    try {
      const token = localStorage.getItem(ADMIN_TOKEN_KEY);
      await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/v1/admin/reservations/${id}/cancel/`,
        { admin_note: '' },
        { headers: { Authorization: `Token ${token}` } }
      );
      onCancelSuccess();
    } catch {
      setCancelError('취소 처리 중 오류가 발생했습니다.');
    } finally {
      setCancellingId(null);
    }
  }

  const isCancellable = (status: ReservationStatus) =>
    status === 'confirmed' || status === 'pending';

  return (
    <div className="bg-white rounded-xl shadow-md border border-[#E5E7EB] p-4 h-fit">
      <h2 className="text-base font-bold text-black mb-4">
        {selectedDate ? selectedDate.replace(/-/g, '.') : '예약 목록'}
      </h2>

      {!selectedDate && (
        <p className="text-sm text-brand-accent text-center py-8">
          날짜를 선택하면 예약 목록이 표시됩니다
        </p>
      )}

      {selectedDate && dayReservations.length === 0 && (
        <p className="text-sm text-brand-accent text-center py-8">
          해당 날짜에 예약이 없습니다
        </p>
      )}

      {selectedDate && dayReservations.length > 0 && (
        <ul className="space-y-3">
          {dayReservations.map(r => (
            <li key={r.id} className="bg-white border border-[#E5E7EB] rounded-xl p-4 space-y-2">
              <p className="text-sm font-medium text-black">{formatSpaceName(r.space)}</p>
              <p className="text-sm text-gray-600">
                {formatDatetimeRange(r.start_datetime, r.end_datetime)}
              </p>
              <p className="text-sm text-gray-600">
                {r.applicant_name} · {r.applicant_team}
              </p>
              <div className="flex items-center justify-between">
                <StatusBadge status={r.status} />
                {confirmingId === r.id ? (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-600">정말 취소하시겠습니까?</span>
                    <button
                      type="button"
                      onClick={handleCancelConfirm}
                      className="rounded-xl bg-[#DC2626] py-1.5 px-3 text-xs font-medium text-white hover:bg-[#B91C1C] transition-colors"
                    >
                      확인
                    </button>
                    <button
                      type="button"
                      onClick={handleCancelAbort}
                      className="rounded-xl border-2 border-[#E5E7EB] py-1.5 px-3 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                    >
                      아니오
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    disabled={!isCancellable(r.status) || cancellingId === r.id}
                    onClick={() => handleCancelClick(r.id)}
                    className="rounded-xl border-2 border-[#E5E7EB] py-1.5 px-3 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {cancellingId === r.id ? '취소 중...' : '취소'}
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {cancelError && (
        <p className="text-xs text-[#DC2626] mt-2">{cancelError}</p>
      )}
    </div>
  );
}

export default ReservationPanel;
