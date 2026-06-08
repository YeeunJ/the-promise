import { useEffect, useMemo, useRef, useState } from 'react';
import { DayPicker } from 'react-day-picker';
import type { WeekdayProps } from 'react-day-picker';
import { Clock } from 'lucide-react';
import { isKoreanHoliday } from '../../../utils/koreanHolidays';
import type { TimeSlotValue } from '../../../types';
import {
  generateTimeSlots,
  formatTime,
  formatTimeSlotLabel,
  getKSTDateString,
} from '../../../utils/formatDatetime';
import { useOccupiedSlots } from '../../../hooks/useOccupiedSlots';
import {
  isSlotOccupied,
  hasOccupiedBetween,
} from '../../../utils/occupiedSlotHelpers';

interface DateTimeStepProps {
  value: TimeSlotValue;
  onChange: (value: TimeSlotValue) => void;
}

function computeDurationLabel(start: string, end: string): string {
  const ms = new Date(end).getTime() - new Date(start).getTime();
  if (ms <= 0) return '';
  const totalMin = Math.round(ms / 60_000);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

const KR_DAYS = ['일', '월', '화', '수', '목', '금', '토'] as const;

function KoreanWeekday(props: WeekdayProps) {
  const name = props.children as string;
  const colorClass = name === '일' ? 'text-red-500' : name === '토' ? 'text-blue-500' : '';
  return (
    <th {...props} className={`flex-1 text-center text-xs font-medium py-1 ${colorClass}`} />
  );
}

export function DateTimeStep({ value, onChange }: DateTimeStepProps): JSX.Element {
  const [localValue, setLocalValue] = useState<TimeSlotValue>(value);
  const { occupiedSlots, isLoading, error } = useOccupiedSlots(null, localValue.date);

  const todayStr = useMemo(() => getKSTDateString(), []);
  const today = useMemo(() => {
    const [y, m, d] = todayStr.split('-').map(Number);
    return new Date(y, m - 1, d);
  }, [todayStr]);

  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  // Sync local from incoming prop changes (e.g. draft hydration)
  const valueDateRef = useRef(value.date);
  const valueStartRef = useRef(value.startTime);
  const valueEndRef = useRef(value.endTime);
  useEffect(() => {
    if (
      value.date !== valueDateRef.current ||
      value.startTime !== valueStartRef.current ||
      value.endTime !== valueEndRef.current
    ) {
      setLocalValue(value);
      valueDateRef.current = value.date;
      valueStartRef.current = value.startTime;
      valueEndRef.current = value.endTime;
    }
  }, [value]);

  // Auto-clear if occupied slots invalidate current selection
  const localValueRef = useRef(localValue);
  localValueRef.current = localValue;
  useEffect(() => {
    if (occupiedSlots.length === 0) return;
    const current = localValueRef.current;
    const startBad = current.startTime && isSlotOccupied(current.startTime, occupiedSlots);
    const endBad = current.endTime && isSlotOccupied(current.endTime, occupiedSlots);
    if (startBad || endBad) {
      setLocalValue({ ...current, startTime: '', endTime: '' });
    }
  }, [occupiedSlots]);

  const slots = useMemo(
    () => (localValue.date ? generateTimeSlots(localValue.date) : []),
    [localValue.date],
  );

  function isPast(slot: string): boolean {
    if (localValue.date !== todayStr) return false;
    return new Date(slot).getTime() <= Date.now();
  }

  function isMidnightNextDay(slot: string): boolean {
    return slot.slice(0, 10) !== localValue.date && slot.slice(11, 16) === '00:00';
  }

  function isSlotDisabled(slot: string): boolean {
    if (isSlotOccupied(slot, occupiedSlots)) return true;
    if (isPast(slot)) return true;
    if (isMidnightNextDay(slot) && (!localValue.startTime || Boolean(localValue.endTime))) return true;
    return Boolean(localValue.startTime && !localValue.endTime && slot < localValue.startTime);
  }

  type SlotState = 'occupied' | 'past' | 'selected-start' | 'selected-end' | 'in-range' | 'available' | 'disabled-bridge';
  function resolveSlotState(slot: string): SlotState {
    if (isSlotOccupied(slot, occupiedSlots)) return 'occupied';
    if (isPast(slot)) return 'past';
    if (slot === localValue.startTime) return 'selected-start';
    if (slot === localValue.endTime) return 'selected-end';
    if (
      localValue.startTime &&
      localValue.endTime &&
      slot > localValue.startTime &&
      slot < localValue.endTime
    ) return 'in-range';
    if (isSlotDisabled(slot)) return 'disabled-bridge';
    return 'available';
  }

  const SLOT_STYLES: Record<SlotState, string> = {
    'selected-start': 'bg-primary text-white border-primary font-bold cursor-pointer',
    'selected-end': 'bg-primary text-white border-primary font-bold cursor-pointer',
    'in-range': 'bg-primary-100 text-primary border-primary/15 cursor-pointer',
    available: 'bg-primary-50 text-ink border-transparent hover:bg-primary-100 cursor-pointer',
    occupied: 'bg-edge text-ink-mute border-edge line-through cursor-not-allowed',
    past: 'bg-surface-2 text-ink-mute border-edge-soft cursor-not-allowed opacity-50',
    'disabled-bridge': 'bg-surface-2 text-ink-mute border-edge-soft cursor-not-allowed opacity-60',
  };

  function handleTimeReset(): void {
    const next = { ...localValue, startTime: '', endTime: '' };
    setLocalValue(next);
    onChangeRef.current(next);
  }

  function handleSlotClick(slot: string): void {
    if (isSlotDisabled(slot) && slot !== localValue.startTime && slot !== localValue.endTime) return;
    let next: TimeSlotValue;
    if (!localValue.startTime || localValue.endTime) {
      next = { ...localValue, startTime: slot, endTime: '' };
    } else if (slot > localValue.startTime) {
      if (hasOccupiedBetween(localValue.startTime, slot, occupiedSlots)) return;
      next = { ...localValue, endTime: slot };
    } else {
      next = { ...localValue, startTime: slot, endTime: '' };
    }
    setLocalValue(next);
    // Always propagate so an incomplete re-selection (start chosen, end cleared)
    // invalidates the parent draft and blocks advancing to the next step.
    onChangeRef.current(next);
  }

  function handleDaySelect(date: Date | undefined): void {
    if (!date) return;
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    const dateStr = `${y}-${m}-${d}`;
    const next: TimeSlotValue = { date: dateStr, startTime: '', endTime: '' };
    setLocalValue(next);
    onChangeRef.current(next);
  }

  const visibleSlots = slots;

  const dayPickerClassNames = {
    root: 'w-full',
    months: 'flex flex-col',
    month: 'w-full',
    month_caption: 'flex justify-between items-center px-2 py-3',
    caption_label: 'text-sm font-semibold text-ink',
    nav: 'flex gap-1',
    button_previous: 'w-7 h-7 flex items-center justify-center rounded-lg hover:bg-primary-50 text-ink-mute',
    button_next: 'w-7 h-7 flex items-center justify-center rounded-lg hover:bg-primary-50 text-ink-mute',
    month_grid: 'w-full border-collapse',
    weekdays: 'flex w-full',
    weekday: 'flex-1 text-center text-xs font-medium text-ink-mute py-1',
    week: 'flex w-full mt-1',
    day: 'flex-1 text-center',
    day_button: 'w-8 h-8 mx-auto flex items-center justify-center rounded-full text-sm text-ink hover:bg-primary-50 cursor-pointer transition-colors',
    selected: '[&>button]:bg-primary [&>button]:!text-white [&>button]:hover:bg-primary-dark',
    today: '[&>button]:font-extrabold [&>button]:!text-primary',
    disabled: '[&>button]:opacity-30 [&>button]:cursor-not-allowed',
    outside: '[&>button]:opacity-40',
    hidden: 'invisible',
  };

  const selectedDate = localValue.date ? new Date(localValue.date + 'T00:00:00') : undefined;

  const showRangePill = Boolean(localValue.startTime && localValue.endTime);
  const durationLabel = showRangePill
    ? computeDurationLabel(localValue.startTime, localValue.endTime)
    : '';

  const timeGuide = !localValue.date
    ? ''
    : !localValue.startTime
      ? '시작시간을 선택해주세요'
      : !localValue.endTime
        ? '종료시간을 선택해주세요'
        : '';

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-[300px_minmax(0,1fr)]">
      {/* Calendar */}
      <section className="rounded-[18px] border border-edge-soft bg-surface p-5">
        <div className="mb-3 text-[11px] font-bold uppercase tracking-[0.08em] text-accent">
          날짜
        </div>
        <DayPicker
          mode="single"
          selected={selectedDate}
          onSelect={handleDaySelect}
          disabled={{ before: today }}
          classNames={dayPickerClassNames}
          formatters={{
            formatCaption: (month) => `${month.getFullYear()}년 ${month.getMonth() + 1}월`,
            formatWeekdayName: (day) => KR_DAYS[day.getDay()],
          }}
          components={{ Weekday: KoreanWeekday }}
          modifiers={{
            holiday: isKoreanHoliday,
            sunday: (d) => d.getDay() === 0,
            saturday: (d) => d.getDay() === 6,
          }}
          modifiersClassNames={{
            sunday: '[&>button]:text-red-500',
            saturday: '[&>button]:text-blue-500',
            holiday: '[&>button]:!text-red-500 [&>button]:font-semibold',
          }}
        />
      </section>

      {/* Time grid */}
      <section className="rounded-[18px] border border-edge-soft bg-surface p-5">
        <div className="mb-3 flex items-center gap-2">
          <div className="text-[11px] font-bold uppercase tracking-[0.08em] text-accent">
            시간
          </div>
          {timeGuide && (
            <span className="text-xs font-medium text-danger">{timeGuide}</span>
          )}
          {(localValue.startTime || localValue.endTime) && (
            <button
              type="button"
              onClick={handleTimeReset}
              className="ml-auto rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold text-primary hover:bg-primary-100 transition-colors"
            >
              선택 초기화
            </button>
          )}
          {showRangePill && (
            <span
              data-testid="time-range-pill"
              className="inline-flex items-center gap-1.5 rounded-full bg-primary-100 px-3 py-1 text-xs font-bold tabular-nums text-primary"
            >
              <Clock size={12} aria-hidden="true" />
              {formatTime(localValue.startTime)} — {formatTimeSlotLabel(localValue.endTime, localValue.date)}
              <span className="mx-1 text-ink-mute">·</span>
              {durationLabel}
            </span>
          )}
        </div>

        {!localValue.date && (
          <p className="text-sm text-ink-soft">날짜를 먼저 선택해주세요.</p>
        )}

        {error && (
          <p className="mb-2 text-sm text-danger">{error}</p>
        )}
        {isLoading && (
          <p className="mb-2 text-xs text-ink-mute">예약 현황을 불러오는 중...</p>
        )}

        {localValue.date && (
          <>
            <div
              data-testid="time-slot-grid"
              data-grid-cols="6"
              className="grid grid-cols-6 gap-1.5"
            >
              {visibleSlots.map((slot) => {
                const state = resolveSlotState(slot);
                const disabled = isSlotDisabled(slot);
                const label = formatTimeSlotLabel(slot, localValue.date);
                return (
                  <button
                    key={slot}
                    type="button"
                    disabled={disabled}
                    onClick={() => handleSlotClick(slot)}
                    data-state={state}
                    className={
                      'rounded-[7px] border py-[9px] text-center text-xs tabular-nums transition-colors ' +
                      SLOT_STYLES[state]
                    }
                  >
                    {label}
                  </button>
                );
              })}
            </div>
            <div className="mt-3 flex items-center gap-4 text-base text-ink-soft">
              <div className="flex items-center gap-1.5">
                <span className="inline-block h-4 w-4 rounded-sm bg-primary" />
                선택
              </div>
              <div className="flex items-center gap-1.5">
                <span className="inline-block h-4 w-4 rounded-sm bg-primary-100" />
                가능
              </div>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
