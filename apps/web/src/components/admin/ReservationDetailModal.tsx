import { useEffect, useCallback } from 'react';
import type { Reservation } from '../../types';
import { extractDateStr, formatTime } from '../../utils/formatDatetime';
import { isCancellable } from '../../lib/reservationUtils';
import { StatusBadge } from '../ui/StatusBadge';

interface ReservationDetailModalProps {
  reservation: Reservation | null;
  onClose: () => void;
  onCancelRequest?: (reservationId: number) => void;
}

const DAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'];

function formatFullDatetime(start: string, end: string): string {
  const dateStr = extractDateStr(start);
  const [y, m, d] = dateStr.split('-');
  const date = new Date(Number(y), Number(m) - 1, Number(d));
  const day = DAY_LABELS[date.getDay()];
  return `${y}.${m}.${d} (${day})  ${formatTime(start)} – ${formatTime(end)}`;
}

interface FieldRowProps {
  label: string;
  value: string | number | null | undefined;
}

function FieldRow({ label, value }: FieldRowProps): JSX.Element {
  return (
    <div className="flex gap-3 py-2 border-b border-[#F3F4F6] last:border-0">
      <span className="w-24 shrink-0 text-xs font-medium text-gray-500">{label}</span>
      <span className="text-sm text-gray-800 break-all">{value ?? '-'}</span>
    </div>
  );
}

export function ReservationDetailModal({
  reservation,
  onClose,
  onCancelRequest,
}: ReservationDetailModalProps): JSX.Element | null {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose],
  );

  useEffect(() => {
    if (reservation) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [reservation, handleKeyDown]);

  if (!reservation) return null;

  function handleOverlayClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) onClose();
  }

  const teamDisplay = reservation.applicant_team || reservation.custom_team_name || '-';

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
      onClick={handleOverlayClick}
    >
      <div className="bg-white rounded-xl shadow-md border border-[#E5E7EB] w-full max-w-lg mx-4 flex flex-col max-h-[90vh]">
        {/* 헤더 */}
        <div className="px-6 py-4 border-b border-[#E5E7EB] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h3 className="text-base font-bold text-black">예약 상세</h3>
            <StatusBadge status={reservation.status} />
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl leading-none"
          >
            ✕
          </button>
        </div>

        {/* 본문 */}
        <div className="px-6 py-4 overflow-y-auto flex-1">
          {/* 장소/일시 섹션 */}
          <div className="mb-4">
            <p className="text-xs font-semibold text-gray-400 uppercase mb-2">장소 및 일시</p>
            <FieldRow label="건물" value={reservation.space.building.name} />
            <FieldRow label="공간" value={reservation.space.name} />
            <FieldRow label="층" value={reservation.space.floor != null ? `${reservation.space.floor}층` : '-'} />
            <FieldRow
              label="일시"
              value={formatFullDatetime(reservation.start_datetime, reservation.end_datetime)}
            />
          </div>

          {/* 신청자 섹션 */}
          <div className="mb-4">
            <p className="text-xs font-semibold text-gray-400 uppercase mb-2">신청자 정보</p>
            <FieldRow label="이름" value={reservation.applicant_name} />
            <FieldRow label="연락처" value={reservation.applicant_phone} />
            <FieldRow label="부서/팀" value={teamDisplay} />
            <FieldRow label="담당교역자" value={reservation.leader_phone || '-'} />
          </div>

          {/* 예약 정보 섹션 */}
          <div className="mb-4">
            <p className="text-xs font-semibold text-gray-400 uppercase mb-2">예약 정보</p>
            <FieldRow label="인원" value={`${reservation.headcount}명`} />
            <FieldRow label="목적" value={reservation.purpose} />
          </div>

          {/* 관리자 메모 */}
          {reservation.admin_note && (
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase mb-2">관리자 메모</p>
              <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3">
                {reservation.admin_note}
              </p>
            </div>
          )}
        </div>

        {/* 푸터 */}
        <div className="px-6 py-4 border-t border-[#E5E7EB] flex justify-end gap-2">
          {onCancelRequest !== undefined && isCancellable(reservation.status) && (
            <button
              type="button"
              onClick={() => onCancelRequest(reservation.id)}
              className="rounded-xl border border-danger/30 bg-danger/5 px-5 py-2 text-sm font-medium text-danger hover:bg-danger/10 transition-colors"
            >
              예약 취소
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="border-2 border-[#E5E7EB] rounded-xl px-5 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
