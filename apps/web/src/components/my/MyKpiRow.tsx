import { CalendarClock, CheckCircle2, Clock, XCircle } from 'lucide-react';
import type { ReactNode } from 'react';
import type { Reservation } from '../../types';
import { countReservationsByStatus } from '../../lib/reservationUtils';

interface MyKpiRowProps {
  reservations: ReadonlyArray<Reservation>;
}

interface KpiSpec {
  testId: string;
  label: string;
  value: number;
  icon: ReactNode;
}

export function MyKpiRow({ reservations }: MyKpiRowProps): JSX.Element {
  const counts = countReservationsByStatus(reservations);
  const upcoming = counts.total - counts.cancelled - counts.rejected;

  const specs: ReadonlyArray<KpiSpec> = [
    { testId: 'kpi-upcoming', label: '예정', value: upcoming, icon: <CalendarClock size={18} /> },
    { testId: 'kpi-confirmed', label: '확정', value: counts.confirmed, icon: <CheckCircle2 size={18} /> },
    { testId: 'kpi-pending', label: '대기', value: counts.pending, icon: <Clock size={18} /> },
    { testId: 'kpi-cancelled', label: '취소', value: counts.cancelled, icon: <XCircle size={18} /> },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {specs.map((s) => (
        <article
          key={s.testId}
          data-testid={s.testId}
          className="rounded-[14px] border border-edge-soft bg-surface p-5 shadow-design-md"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 flex-col gap-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-mute">
                {s.label}
              </span>
              <span className="text-[26px] font-extrabold tabular-nums tracking-[-0.02em] text-ink">
                {s.value}
              </span>
            </div>
            <div
              className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-[10px] bg-primary-50 text-primary"
              aria-hidden="true"
            >
              {s.icon}
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
