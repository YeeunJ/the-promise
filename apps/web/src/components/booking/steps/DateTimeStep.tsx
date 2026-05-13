import { useEffect, useMemo, useRef, useState } from 'react';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/style.css';
import { Clock } from 'lucide-react';
import type { TimeSlotValue } from '../../../types';
import {
  generateTimeSlots,
  formatTime,
  formatTimeSlotLabel,
  extractTimeHHMM,
  DEFAULT_START_TIME,
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
  spaceId: number | null;
}

const DAY_END_TIME = '21:30';

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

export function DateTimeStep({ value, onChange, spaceId }: DateTimeStepProps): JSX.Element {
  const [localValue, setLocalValue] = useState<TimeSlotValue>(value);
  const { occupiedSlots, isLoading, error } = useOccupiedSlots(spaceId, localValue.date);

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

  // Reset selection when space changes
  const prevSpaceIdRef = useRef(spaceId);
  useEffect(() => {
    if (prevSpaceIdRef.current !== spaceId) {
      prevSpaceIdRef.current = spaceId;
      setLocalValue({ date: '', startTime: '', endTime: '' });
    }
  }, [spaceId]);

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
    if (next.date && next.startTime && next.endTime) {
      onChangeRef.current(next);
    }
  }

  function handleDaySelect(date: Date | undefined): void {
    if (!date) return;
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    setLocalValue({ date: `${y}-${m}-${d}`, startTime: '', endTime: '' });
  }

  const visibleSlots = useMemo(
    () =>
      slots.filter((s) => {
        const t = extractTimeHHMM(s);
        return t >= DEFAULT_START_TIME && t <= DAY_END_TIME;
      }),
    [slots],
  );

  const selectedDate = localValue.date ? new Date(localValue.date + 'T00:00:00') : undefined;

  const showRangePill = Boolean(localValue.startTime && localValue.endTime);
  const durationLabel = showRangePill
    ? computeDurationLabel(localValue.startTime, localValue.endTime)
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
        />
      </section>

      {/* Time grid */}
      <section className="rounded-[18px] border border-edge-soft bg-surface p-5">
        <div className="mb-3 flex items-center gap-2">
          <div className="text-[11px] font-bold uppercase tracking-[0.08em] text-accent">
            시간
          </div>
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
            <div className="mt-3 flex items-center gap-4 text-[11px] text-ink-soft">
              <div className="flex items-center gap-1.5">
                <span className="inline-block h-2.5 w-2.5 rounded-sm bg-primary" />
                선택
              </div>
              <div className="flex items-center gap-1.5">
                <span className="inline-block h-2.5 w-2.5 rounded-sm bg-primary-100" />
                가능
              </div>
              <div className="flex items-center gap-1.5">
                <span className="inline-block h-2.5 w-2.5 rounded-sm bg-edge" />
                예약됨
              </div>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
