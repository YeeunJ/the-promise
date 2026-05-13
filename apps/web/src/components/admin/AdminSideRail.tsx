import { CalendarCheck, Clock } from 'lucide-react';
import type { Reservation } from '../../types';
import { formatTime, formatTimeSlotLabel } from '../../utils/formatDatetime';

interface AdminSideRailProps {
  reservations: ReadonlyArray<Reservation>;
  todayDateStr: string;
  onReservationClick: (reservation: Reservation) => void;
}

const MAX_TODAY = 5;
const MAX_PENDING = 5;

function isOnDay(r: Reservation, day: string): boolean {
  return r.start_datetime.slice(0, 10) === day;
}

export function AdminSideRail({
  reservations,
  todayDateStr,
  onReservationClick,
}: AdminSideRailProps): JSX.Element {
  const today = reservations
    .filter((r) => r.status === 'confirmed' && isOnDay(r, todayDateStr))
    .sort((a, b) => a.start_datetime.localeCompare(b.start_datetime));

  const pending = reservations
    .filter((r) => r.status === 'pending')
    .sort((a, b) => a.created_at.localeCompare(b.created_at));

  return (
    <aside className="flex w-[340px] flex-none flex-col gap-4">
      {/* Today */}
      <section className="rounded-[18px] border border-edge-soft bg-surface p-5">
        <header className="mb-3 flex items-center gap-2">
          <CalendarCheck size={16} className="text-primary" aria-hidden="true" />
          <h2 className="m-0 text-[13px] font-bold tracking-[-0.01em] text-ink">오늘</h2>
          <span className="ml-auto text-[11px] font-extrabold tabular-nums text-ink-mute">
            {today.length}건
          </span>
        </header>
        {today.length === 0 ? (
          <p className="text-xs text-ink-mute">오늘 일정이 없습니다.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {today.slice(0, MAX_TODAY).map((r) => (
              <li
                key={r.id}
                data-testid={`side-rail-today-${r.id}`}
                onClick={() => onReservationClick(r)}
                className="cursor-pointer rounded-[10px] bg-surface-2 px-3 py-2 hover:bg-primary-50"
              >
                <div className="flex items-center gap-2 text-[12px] font-bold tabular-nums text-primary">
                  {formatTime(r.start_datetime)} — {formatTimeSlotLabel(r.end_datetime, r.start_datetime.slice(0, 10))}
                </div>
                <div className="mt-0.5 text-[12px] text-ink">
                  {r.space.building.name} · {r.space.name}
                </div>
                <div className="text-[11px] text-ink-mute">
                  {r.applicant_name} · {r.headcount}명
                </div>
              </li>
            ))}
            {today.length > MAX_TODAY && (
              <li className="text-[11px] text-ink-mute">+{today.length - MAX_TODAY}건 더 있음</li>
            )}
          </ul>
        )}
      </section>

      {/* Pending */}
      <section
        data-testid="admin-side-rail-pending"
        className="rounded-[18px] border border-edge-soft bg-surface p-5"
      >
        <header className="mb-3 flex items-center gap-2">
          <Clock size={16} className="text-warn" aria-hidden="true" />
          <h2 className="m-0 text-[13px] font-bold tracking-[-0.01em] text-ink">확정 대기</h2>
          <span className="ml-auto text-[11px] font-extrabold tabular-nums text-ink-mute">
            {pending.length}건
          </span>
        </header>
        {pending.length === 0 ? (
          <p className="text-xs text-ink-mute">대기 중인 예약이 없습니다.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {pending.slice(0, MAX_PENDING).map((r) => (
              <li
                key={r.id}
                data-testid={`side-rail-pending-${r.id}`}
                onClick={() => onReservationClick(r)}
                className="cursor-pointer rounded-[10px] bg-surface-2 px-3 py-2 hover:bg-primary-50"
              >
                <div className="text-[12px] font-bold tracking-[-0.01em] text-ink">
                  {r.space.building.name} · {r.space.name}
                </div>
                <div className="mt-0.5 text-[11px] text-ink-mute">
                  {r.start_datetime.slice(5, 10).replace('-', '.')} · {formatTime(r.start_datetime)} · {r.applicant_name}
                </div>
              </li>
            ))}
            {pending.length > MAX_PENDING && (
              <li className="text-[11px] text-ink-mute">+{pending.length - MAX_PENDING}건 더 있음</li>
            )}
          </ul>
        )}
      </section>
    </aside>
  );
}
