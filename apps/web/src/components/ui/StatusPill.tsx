import type { ReservationStatus } from '../../types';

interface StatusPillProps {
  status: ReservationStatus;
  size?: 'sm' | 'md';
}

const STATUS_LABEL: Record<ReservationStatus, string> = {
  confirmed: '확정',
  pending: '대기',
  rejected: '거절',
  cancelled: '취소',
};

const STATUS_CLASS: Record<ReservationStatus, string> = {
  confirmed: 'bg-status-confirmed-bg text-status-confirmed-fg',
  pending: 'bg-status-pending-bg text-status-pending-fg',
  rejected: 'bg-status-canceled-bg text-danger',
  cancelled: 'bg-status-canceled-bg text-status-canceled-fg',
};

const SIZE_CLASS = {
  sm: 'px-2 py-0.5 text-[10px]',
  md: 'px-2.5 py-1 text-[11px]',
};

export function StatusPill({ status, size = 'md' }: StatusPillProps): JSX.Element {
  return (
    <span
      className={`inline-flex items-center rounded-full font-bold ${SIZE_CLASS[size]} ${STATUS_CLASS[status]}`}
      data-status={status}
    >
      {STATUS_LABEL[status]}
    </span>
  );
}

export { STATUS_LABEL };
