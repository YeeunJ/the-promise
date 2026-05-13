import type { ReactNode } from 'react';
import { CalendarRange, Clock, Gauge, Sparkles } from 'lucide-react';
import type { Reservation } from '../../types';

interface AdminKpiRowProps {
  reservations: ReadonlyArray<Reservation>;
  weekStart: string;
  weekEnd: string;
}

interface KpiSpec {
  testId: string;
  label: string;
  value: ReactNode;
  icon: ReactNode;
}

function isWithinWeek(dateISO: string, start: string, end: string): boolean {
  const d = dateISO.slice(0, 10);
  return d >= start && d <= end;
}

export function AdminKpiRow({
  reservations,
  weekStart,
  weekEnd,
}: AdminKpiRowProps): JSX.Element {
  const weeklyCount = reservations.filter(
    (r) =>
      (r.status === 'confirmed' || r.status === 'pending') &&
      isWithinWeek(r.start_datetime, weekStart, weekEnd),
  ).length;
  const pendingCount = reservations.filter((r) => r.status === 'pending').length;

  const specs: ReadonlyArray<KpiSpec> = [
    {
      testId: 'admin-kpi-weekly',
      label: '이번 주 예약',
      value: weeklyCount,
      icon: <CalendarRange size={18} />,
    },
    {
      testId: 'admin-kpi-pending',
      label: '확정 대기',
      value: pendingCount,
      icon: <Clock size={18} />,
    },
    {
      testId: 'admin-kpi-utilization',
      label: '가동률',
      value: '—',
      icon: <Gauge size={18} />,
    },
    {
      testId: 'admin-kpi-top-space',
      label: '인기 공간',
      value: '—',
      icon: <Sparkles size={18} />,
    },
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
