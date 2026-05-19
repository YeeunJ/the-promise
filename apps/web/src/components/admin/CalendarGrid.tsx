import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Reservation } from '../../types/index';
import { extractDateStr, getKSTDateString } from '../../utils/formatDatetime';
import { getBuildingColor } from '../../lib/adminConstants';

interface EventStats {
  total: number;
  confirmed: number;
  pending: number;
}

interface CalendarGridProps {
  currentYear: number;
  currentMonth: number;
  reservations: Reservation[];
  selectedDate: string | null;
  onDateSelect: (date: string) => void;
  onPrevMonth?: () => void;
  onNextMonth?: () => void;
  onGoToday?: () => void;
  onReservationClick?: (reservation: Reservation) => void;
  eventStats?: EventStats;
}

const DAY_HEADERS = ['일', '월', '화', '수', '목', '금', '토'] as const;

const DAY_HEADER_COLOR: Record<number, string> = {
  0: 'text-[#DC2626]',
  6: 'text-[#3B82F6]',
};

const CHIP_BASE =
  'flex items-center px-2.5 py-1 rounded-md text-xs font-medium truncate transition-colors duration-150 cursor-pointer border-l-[3px] hover:brightness-95';

function buildCalendarDays(year: number, month: number): (number | null)[] {
  const firstDay = new Date(year, month - 1, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();
  const days: (number | null)[] = Array(firstDay).fill(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(d);
  while (days.length < 42) days.push(null);
  return days;
}

function groupByDate(reservations: Reservation[]): Map<string, Reservation[]> {
  const map = new Map<string, Reservation[]>();
  for (const r of reservations) {
    const key = extractDateStr(r.start_datetime);
    const group = map.get(key);
    if (group) group.push(r);
    else map.set(key, [r]);
  }
  return map;
}

interface ChipsProps {
  dayReservations: Reservation[];
  onReservationClick?: (reservation: Reservation) => void;
}

function Chips({ dayReservations, onReservationClick }: ChipsProps): JSX.Element {
  const visible = dayReservations.slice(0, 3);
  const remaining = dayReservations.length - 3;

  return (
    <>
      {visible.map((r) => {
        const color = getBuildingColor(r.space.building.name);
        return (
          <button
            key={r.id}
            type="button"
            className={CHIP_BASE}
            style={{ backgroundColor: color.bg, borderLeftColor: color.main }}
            onClick={(e) => {
              e.stopPropagation();
              onReservationClick?.(r);
            }}
          >
            {(() => {
              const team =
                r.applicant_team && r.applicant_team !== '-'
                  ? r.applicant_team
                  : r.custom_team_name;
              return team ? `${team} - ${r.space.name}` : r.space.name;
            })()}
          </button>
        );
      })}
      {remaining > 0 && (
        <span className="text-xs text-accent font-medium pl-1">
          +{remaining} more
        </span>
      )}
    </>
  );
}

function CalendarGrid({
  currentYear,
  currentMonth,
  reservations,
  selectedDate,
  onDateSelect,
  onPrevMonth,
  onNextMonth,
  onGoToday,
  onReservationClick,
  eventStats,
}: CalendarGridProps): JSX.Element {
  const today = getKSTDateString();
  const days = buildCalendarDays(currentYear, currentMonth);
  const byDate = groupByDate(reservations);

  const showHeader =
    onPrevMonth !== undefined ||
    onNextMonth !== undefined ||
    onGoToday !== undefined ||
    eventStats !== undefined;

  return (
    <div className="bg-white rounded-xl shadow-md border border-[#E5E7EB] overflow-hidden">
      {/* 내부 헤더 — 월 + nav + 이벤트 stats */}
      {showHeader && (
        <div className="flex items-center justify-between px-5 py-3 border-b border-[#E5E7EB]">
          <div className="flex items-center gap-3">
            <div className="text-base font-extrabold tracking-tight">
              {String(currentMonth)}월
            </div>
            <div className="flex items-center gap-1">
              {onPrevMonth !== undefined && (
                <button
                  type="button"
                  aria-label="이전 달"
                  onClick={onPrevMonth}
                  className="w-7 h-7 rounded-md bg-surface-2 hover:bg-edge-soft grid place-items-center text-ink-soft"
                >
                  <ChevronLeft size={14} />
                </button>
              )}
              {onGoToday !== undefined && (
                <button
                  type="button"
                  onClick={onGoToday}
                  className="px-2.5 h-7 rounded-md bg-surface-2 hover:bg-edge-soft text-xs font-semibold text-ink-soft"
                >
                  오늘
                </button>
              )}
              {onNextMonth !== undefined && (
                <button
                  type="button"
                  aria-label="다음 달"
                  onClick={onNextMonth}
                  className="w-7 h-7 rounded-md bg-surface-2 hover:bg-edge-soft grid place-items-center text-ink-soft"
                >
                  <ChevronRight size={14} />
                </button>
              )}
            </div>
          </div>
          {eventStats !== undefined && (
            <div className="text-[11px] font-semibold text-ink-mute tabular-nums">
              이벤트 {eventStats.total}개 · 확정 {eventStats.confirmed} · 대기 {eventStats.pending}
            </div>
          )}
        </div>
      )}

      {/* 요일 헤더 */}
      <div className="grid grid-cols-7 border-b border-[#E5E7EB]">
        {DAY_HEADERS.map((label, idx) => (
          <div
            key={label}
            className={`py-3 text-center text-sm font-semibold ${DAY_HEADER_COLOR[idx] ?? 'text-black'}`}
          >
            {label}
          </div>
        ))}
      </div>

      {/* 날짜 그리드 */}
      <div className="grid grid-cols-7 divide-x divide-y divide-[#E5E7EB]">
        {days.map((day, idx) => {
          if (day === null) {
            return (
              <div
                key={`empty-${String(idx)}`}
                className="min-h-[120px] p-2 bg-[#FAFAF8]"
              />
            );
          }

          const dateStr =
            String(currentYear).padStart(4, '0') +
            '-' +
            String(currentMonth).padStart(2, '0') +
            '-' +
            String(day).padStart(2, '0');
          const isToday = dateStr === today;
          const isSelected = dateStr === selectedDate;
          const colIndex = idx % 7;
          const dayReservations = byDate.get(dateStr) ?? [];

          let cellClass =
            'min-h-[120px] p-2 flex flex-col gap-1.5 cursor-pointer transition-colors';
          if (isToday) {
            cellClass += ' bg-primary/5 ring-1 ring-inset ring-primary/30';
          } else {
            cellClass += ' hover:bg-gray-50';
          }
          if (isSelected) {
            cellClass += ' ring-2 ring-primary-dark';
          }

          let dateNumClass = 'text-sm font-medium self-start';
          if (isToday) {
            dateNumClass =
              'w-7 h-7 flex items-center justify-center rounded-full bg-primary text-white font-bold text-sm';
          } else if (colIndex === 0) {
            dateNumClass += ' text-[#DC2626]';
          } else if (colIndex === 6) {
            dateNumClass += ' text-[#3B82F6]';
          } else {
            dateNumClass += ' text-black';
          }

          return (
            <div
              key={dateStr}
              className={cellClass}
              onClick={() => onDateSelect(dateStr)}
            >
              <span className={dateNumClass}>{day}</span>
              <Chips
                dayReservations={dayReservations}
                onReservationClick={onReservationClick}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default CalendarGrid;
