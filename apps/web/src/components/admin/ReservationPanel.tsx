import { useState } from 'react';
import axios from 'axios';
import { Reservation, ReservationStatus, ADMIN_TOKEN_KEY } from '../../types/index';
import { extractDateStr, formatDatetimeRange } from '../../utils/formatDatetime';

const STATUS_LABEL: Record<ReservationStatus, string> = {
  confirmed: '확정',
  pending: '대기',
  rejected: '거절',
  cancelled: '취소',
};

const STATUS_CLASS: Record<ReservationStatus, string> = {
  confirmed: 'bg-[#008F49]/10 text-[#008F49] border border-[#008F49]/30',
  pending: 'bg-[#AAA014]/10 text-[#AAA014] border border-[#AAA014]/30',
  rejected: 'bg-[#DC2626]/10 text-[#DC2626] border border-[#DC2626]/30',
  cancelled: 'bg-[#E5E7EB] text-gray-600 border border-gray-300',
};

interface ReservationPanelProps {
  selectedDate: string | null;
  reservations: Reservation[];
  onCancelSuccess: () => void;
}

function formatSpaceName(r: Reservation): string {
  const floor = r.space.floor !== null ? `${r.space.floor}층 ` : '';
  return `${r.space.building.name} ${floor}${r.space.name}`;
}

function ReservationPanel({ selectedDate, reservations, onCancelSuccess }: ReservationPanelProps): JSX.Element {
  const [cancellingId, setCancellingId] = useState<number | null>(null);
  const [cancelError, setCancelError] = useState<string | null>(null);

  const dayReservations = selectedDate
    ? reservations.filter(r => extractDateStr(r.start_datetime) === selectedDate)
    : [];

  async function handleCancel(id: number) {
    setCancellingId(id);
    setCancelError(null);
    try {
      const token = localStorage.getItem(ADMIN_TOKEN_KEY);
      await axios.patch(
        `${import.meta.env.VITE_API_BASE_URL}/api/v1/admin/reservations/${id}/`,
        { status: 'cancelled' },
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
        <p className="text-sm text-[#BC8A5F] text-center py-8">
          날짜를 선택하면 예약 목록이 표시됩니다
        </p>
      )}

      {selectedDate && dayReservations.length === 0 && (
        <p className="text-sm text-[#BC8A5F] text-center py-8">
          해당 날짜에 예약이 없습니다
        </p>
      )}

      {selectedDate && dayReservations.length > 0 && (
        <ul className="space-y-3">
          {dayReservations.map(r => (
            <li key={r.id} className="bg-white border border-[#E5E7EB] rounded-xl p-4 space-y-2">
              <p className="text-sm font-medium text-black">{formatSpaceName(r)}</p>
              <p className="text-sm text-gray-600">
                {formatDatetimeRange(r.start_datetime, r.end_datetime)}
              </p>
              <p className="text-sm text-gray-600">
                {r.applicant_name} · {r.applicant_team}
              </p>
              <div className="flex items-center justify-between">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium ${STATUS_CLASS[r.status]}`}
                >
                  {STATUS_LABEL[r.status]}
                </span>
                <button
                  type="button"
                  disabled={!isCancellable(r.status) || cancellingId === r.id}
                  onClick={() => handleCancel(r.id)}
                  className={`rounded-xl border-2 border-[#E5E7EB] py-1.5 px-3 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {cancellingId === r.id ? '취소 중...' : '취소'}
                </button>
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
