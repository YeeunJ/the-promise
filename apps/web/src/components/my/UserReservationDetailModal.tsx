import { X } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { Reservation } from '../../types';
import { StatusPill, STATUS_LABEL } from '../ui/StatusPill';
import { isCancellable } from '../../lib/reservationUtils';
import { formatDateStr, formatTime, formatTimeSlotLabel } from '../../utils/formatDatetime';

interface UserReservationDetailModalProps {
  isOpen: boolean;
  reservation: Reservation;
  onClose: () => void;
  onCancel: (reservationId: number) => void;
}

interface DetailRow {
  label: string;
  value: string;
}

export function UserReservationDetailModal({
  isOpen,
  reservation,
  onClose,
  onCancel,
}: UserReservationDetailModalProps): JSX.Element | null {
  const [isConfirmingCancel, setIsConfirmingCancel] = useState(false);

  // Esc 키로 닫기 — confirm 단계에서는 confirm만 해제
  useEffect(() => {
    if (!isOpen) return;
    function onKeyDown(e: KeyboardEvent): void {
      if (e.key !== 'Escape') return;
      if (isConfirmingCancel) {
        setIsConfirmingCancel(false);
      } else {
        onClose();
      }
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose, isConfirmingCancel]);

  // 모달이 닫히면 confirm 상태 초기화
  useEffect(() => {
    if (!isOpen) setIsConfirmingCancel(false);
  }, [isOpen]);

  if (!isOpen) return null;

  const dateStr = formatDateStr(reservation.start_datetime.slice(0, 10));
  const timeRange = `${formatTime(reservation.start_datetime)} — ${formatTimeSlotLabel(
    reservation.end_datetime,
    reservation.start_datetime.slice(0, 10),
  )}`;

  const placeRows: DetailRow[] = [
    { label: '건물', value: reservation.space.building.name },
    { label: '공간', value: reservation.space.name },
    { label: '층', value: reservation.space.floor !== null ? `${reservation.space.floor}층` : '-' },
    { label: '일시', value: `${dateStr} ${timeRange}` },
  ];

  const teamLabel = reservation.applicant_team || reservation.custom_team_name || '-';
  const pastorLabel = reservation.leader_phone || '-';

  const applicantRows: DetailRow[] = [
    { label: '이름', value: reservation.applicant_name },
    { label: '연락처', value: reservation.applicant_phone },
    { label: '부서/팀', value: teamLabel },
    { label: '담당교역자', value: pastorLabel },
  ];

  const reservationRows: DetailRow[] = [
    { label: '인원', value: `${reservation.headcount}명` },
    { label: '목적', value: reservation.purpose },
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="예약 상세"
      className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(20,30,25,0.40)] p-6"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-[520px] overflow-hidden rounded-[20px] bg-surface shadow-design-lg"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Banner */}
        <header className="flex items-center justify-between bg-primary px-7 py-5 text-white">
          <div>
            <div className="mb-1 text-[11px] font-bold tracking-[0.08em] opacity-70">
              RESERVATION · #{reservation.id}
            </div>
            <div className="text-[19px] font-extrabold tracking-[-0.02em]">예약 상세</div>
          </div>
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-white/15 px-3 py-1 text-[11px] font-extrabold tracking-wide">
              {STATUS_LABEL[reservation.status]}
            </span>
            <button
              type="button"
              onClick={onClose}
              aria-label="모달 닫기"
              className="grid h-8 w-8 place-items-center rounded-full bg-white/10 hover:bg-white/20"
            >
              <X size={15} aria-hidden="true" />
            </button>
          </div>
        </header>

        {/* Body */}
        <div className="px-7 py-6">
          <DetailSection title="장소 및 일시" rows={placeRows} />
          <DetailSection title="신청자 정보" rows={applicantRows} className="mt-6" />
          <DetailSection title="예약 정보" rows={reservationRows} className="mt-6" />
          {/* Status info chip when not active */}
          {!isCancellable(reservation.status) && (
            <div className="mt-6">
              <StatusPill status={reservation.status} />
              <span className="ml-2 text-[12px] text-ink-mute">
                현재 이 예약은 취소할 수 없습니다.
              </span>
            </div>
          )}
        </div>

        {/* Footer */}
        {isConfirmingCancel && isCancellable(reservation.status) ? (
          <div
            role="alertdialog"
            aria-label="예약 취소 확인"
            className="border-t border-danger/20 bg-danger/5 px-7 py-4"
          >
            <p className="mb-3 text-[13px] font-semibold text-ink">
              이 예약을 정말 취소하시겠습니까? <span className="text-ink-mute">취소 후에는 되돌릴 수 없습니다.</span>
            </p>
            <div className="flex justify-between gap-2">
              <button
                type="button"
                onClick={() => setIsConfirmingCancel(false)}
                className="rounded-full border border-edge bg-surface px-5 py-2.5 text-[13px] font-semibold text-ink hover:bg-surface-2"
              >
                아니오
              </button>
              <button
                type="button"
                onClick={() => onCancel(reservation.id)}
                className="rounded-full border border-danger bg-danger px-5 py-2.5 text-[13px] font-semibold text-white hover:bg-danger/90"
              >
                예, 취소합니다
              </button>
            </div>
          </div>
        ) : (
          <div className="flex justify-between gap-2 bg-surface-2 px-7 py-4">
            {isCancellable(reservation.status) && (
              <button
                type="button"
                onClick={() => setIsConfirmingCancel(true)}
                className="rounded-full border border-danger/30 bg-danger/5 px-5 py-2.5 text-[13px] font-semibold text-danger hover:bg-danger/10"
              >
                예약 취소
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-edge bg-surface px-5 py-2.5 text-[13px] font-semibold text-ink hover:bg-surface-2"
            >
              닫기
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

interface DetailSectionProps {
  title: string;
  rows: ReadonlyArray<DetailRow>;
  className?: string;
}

function DetailSection({ title, rows, className = '' }: DetailSectionProps): JSX.Element {
  return (
    <section className={className}>
      <div className="mb-2 text-[11px] font-bold uppercase tracking-[0.08em] text-accent">
        {title}
      </div>
      {rows.map((row, idx) => (
        <div
          key={row.label}
          className={
            'flex items-center justify-between py-2.5 ' +
            (idx < rows.length - 1 ? 'border-b border-edge-soft' : '')
          }
        >
          <span className="text-xs font-semibold text-ink-mute">{row.label}</span>
          <span className="text-[13px] font-bold tracking-[-0.01em] text-ink">
            {row.value}
          </span>
        </div>
      ))}
    </section>
  );
}

export default UserReservationDetailModal;
