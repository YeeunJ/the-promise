import { CalendarCheck } from 'lucide-react';
import type { Reservation } from '../../types';
import { formatDateStr, formatTime, formatTimeSlotLabel } from '../../utils/formatDatetime';
import { StatusPill } from '../ui/StatusPill';

interface AdminSideRailProps {
  reservations: ReadonlyArray<Reservation>;
  selectedDate: string | null;
  onReservationClick: (reservation: Reservation) => void;
}

const MAX_ITEMS = 8;

export function AdminSideRail({
  reservations,
  selectedDate,
  onReservationClick,
}: AdminSideRailProps): JSX.Element {
  const dateItems = selectedDate
    ? reservations
        .filter((r) => r.start_datetime.slice(0, 10) === selectedDate)
        .sort((a, b) => a.start_datetime.localeCompare(b.start_datetime))
    : [];

  const dateLabel = selectedDate ? formatDateStr(selectedDate) : '-';

  return (
    <aside className="flex w-[340px] flex-none flex-col gap-4">
      <section className="rounded-[18px] border border-edge-soft bg-surface p-5">
        <header className="mb-3 flex items-center gap-2">
          <CalendarCheck size={16} className="text-primary" aria-hidden="true" />
          <h2 className="m-0 text-[13px] font-bold tracking-[-0.01em] text-ink">
            {dateLabel}
          </h2>
          <span className="ml-auto text-[11px] font-extrabold tabular-nums text-ink-mute">
            {dateItems.length}건
          </span>
        </header>
        {!selectedDate && (
          <p className="text-xs text-ink-mute">날짜를 선택하세요.</p>
        )}
        {selectedDate && dateItems.length === 0 && (
          <p className="text-xs text-ink-mute">해당 날짜에 예약이 없습니다.</p>
        )}
        {dateItems.length > 0 && (
          <ul className="flex flex-col gap-2">
            {dateItems.slice(0, MAX_ITEMS).map((r) => (
              <li
                key={r.id}
                data-testid={`side-rail-item-${r.id}`}
                onClick={() => onReservationClick(r)}
                className="cursor-pointer rounded-[10px] bg-surface-2 px-3 py-2 hover:bg-primary-50"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 text-[12px] font-bold tabular-nums text-primary">
                    {formatTime(r.start_datetime)} — {formatTimeSlotLabel(r.end_datetime, r.start_datetime.slice(0, 10))}
                  </div>
                  <StatusPill status={r.status} size="sm" />
                </div>
                <div className="mt-0.5 text-[12px] text-ink">
                  {r.space.building.name} · {r.space.name}
                </div>
                <div className="text-[11px] text-ink-mute">
                  {r.applicant_team} · {r.applicant_name} · {r.headcount}명
                </div>
              </li>
            ))}
            {dateItems.length > MAX_ITEMS && (
              <li className="text-[11px] text-ink-mute">
                +{dateItems.length - MAX_ITEMS}건 더 있음
              </li>
            )}
          </ul>
        )}
      </section>
    </aside>
  );
}
