import { Reservation, ReservationStatus } from '../../types/index';
import { extractDateStr } from '../../utils/formatDatetime';

interface CalendarGridProps {
  currentYear: number;
  currentMonth: number;
  reservations: Reservation[];
  selectedDate: string | null;
  onDateSelect: (date: string) => void;
}

const DAY_HEADERS = ['일', '월', '화', '수', '목', '금', '토'] as const;

const DAY_HEADER_COLOR: Record<number, string> = {
  0: 'text-[#DC2626]',
  6: 'text-[#3B82F6]',
};

const CHIP_CLASS: Record<ReservationStatus, string> = {
  confirmed: 'bg-[#008F49]/10 border-l-[3px] border-[#008F49] text-[#008F49] hover:bg-[#008F49]/20',
  pending:   'bg-[#AAA014]/10 border-l-[3px] border-[#AAA014] text-[#AAA014] hover:bg-[#AAA014]/20',
  rejected:  'bg-[#DC2626]/10 border-l-[3px] border-[#DC2626] text-[#DC2626] hover:bg-[#DC2626]/20',
  cancelled: 'bg-gray-100 border-l-[3px] border-gray-400 text-gray-500 hover:bg-gray-200',
};

const CHIP_BASE = 'flex items-center px-2.5 py-1 rounded-md text-xs font-medium truncate transition-colors duration-150 cursor-pointer';

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

function renderChips(dayReservations: Reservation[]): JSX.Element {
  const visible = dayReservations.slice(0, 3);
  const remaining = dayReservations.length - 3;

  return (
    <>
      {visible.map((r) => (
        <span
          key={r.id}
          className={`${CHIP_BASE} ${CHIP_CLASS[r.status]} hidden sm:flex`}
        >
          {r.applicant_team} - {r.space.name}
        </span>
      ))}
      {dayReservations.length > 0 && (
        <span className="sm:hidden w-1.5 h-1.5 rounded-full bg-[#008F49] mt-1" />
      )}
      {remaining > 0 && (
        <span className="text-xs text-[#BC8A5F] font-medium pl-1 hidden sm:inline">
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
}: CalendarGridProps): JSX.Element {
  const today = new Date().toISOString().slice(0, 10);
  const days = buildCalendarDays(currentYear, currentMonth);
  const byDate = groupByDate(reservations);

  return (
    <div className="bg-white rounded-xl shadow-md border border-[#E5E7EB] overflow-hidden">
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
                key={`empty-${idx}`}
                className="min-h-[145px] p-2 bg-[#FAFAF8]"
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

          let cellClass = 'min-h-[145px] p-2 flex flex-col gap-1.5 cursor-pointer transition-colors';
          if (isToday) {
            cellClass += ' bg-[#008F49]/5 ring-1 ring-inset ring-[#008F49]/30';
          } else {
            cellClass += ' hover:bg-gray-50';
          }
          if (isSelected) {
            cellClass += ' ring-2 ring-[#AAA014]';
          }

          let dateNumClass = 'text-sm font-medium self-start';
          if (isToday) {
            dateNumClass = 'w-7 h-7 flex items-center justify-center rounded-full bg-[#008F49] text-white font-bold text-sm';
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
              {renderChips(dayReservations)}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default CalendarGrid;
