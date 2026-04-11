import type { ReservationStatus } from '../../types';

const STATUS_LABEL: Record<ReservationStatus, string> = {
  confirmed: '확정',
  pending: '대기',
  rejected: '거절',
  cancelled: '취소',
};

const STATUS_CLASS: Record<ReservationStatus, string> = {
  confirmed: 'bg-brand-primary/10 text-brand-primary border border-brand-primary/30',
  pending: 'bg-brand-secondary/10 text-brand-secondary border border-brand-secondary/30',
  rejected: 'bg-[#DC2626]/10 text-[#DC2626] border border-[#DC2626]/30',
  cancelled: 'bg-[#E5E7EB] text-gray-600 border border-gray-300',
};

interface StatusBadgeProps {
  status: ReservationStatus;
}

export function StatusBadge({ status }: StatusBadgeProps): JSX.Element {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium ${STATUS_CLASS[status]}`}
    >
      {STATUS_LABEL[status]}
    </span>
  );
}

export { STATUS_LABEL, STATUS_CLASS };
