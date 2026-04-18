import { useEffect, useMemo, useRef, useState } from 'react';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/style.css';
import type { TimeSlotValue } from '../../types';
import StepPopup from './StepPopup';
import type { CompletedStep } from '../../utils/buildCompletedSteps';
import { generateTimeSlots, formatTime, formatTimeSlotLabel, extractTimeHHMM, DEFAULT_START_TIME, DEFAULT_END_TIME, getKSTDateString } from '../../utils/formatDatetime';
import { useOccupiedSlots } from '../../hooks/useOccupiedSlots';
import { isSlotOccupied, hasOccupiedBetween } from '../../utils/occupiedSlotHelpers';

interface DateTimePopupProps {
  isOpen: boolean;
  onClose: () => void;
  onBack?: () => void;
  onReset?: () => void;
  spaceId: number | null;
  value: TimeSlotValue;
  onConfirm: (value: TimeSlotValue) => void;
  completedSteps?: CompletedStep[];
}

type InternalStep = 'date' | 'time';

function DateTimePopup({ isOpen, onClose, onBack, onReset, spaceId, value, onConfirm, completedSteps }: DateTimePopupProps): JSX.Element {
  const [step, setStep] = useState<InternalStep>('date');
  const [localValue, setLocalValue] = useState<TimeSlotValue>(value);
  const [slots, setSlots] = useState<string[]>([]);
  const [showAllSlots, setShowAllSlots] = useState(false);

  const { occupiedSlots, isLoading: isLoadingSlots, error: slotsError } = useOccupiedSlots(spaceId, localValue.date);

  const todayStr = useMemo(() => getKSTDateString(), []);

  // DayPicker disabled 기준을 KST 날짜 자정으로 설정 (todayStr과 일관성 유지)
  const today = useMemo(() => {
    const [y, m, d] = todayStr.split('-').map(Number);
    return new Date(y, m - 1, d);
  }, [todayStr]);

  useEffect(() => {
    if (isOpen) {
      setLocalValue(value);
      setStep(value.date ? 'time' : 'date');
      setShowAllSlots(false);
    }
    // Intentional: only re-sync on open.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  useEffect(() => {
    if (localValue.date) {
      setSlots(generateTimeSlots(localValue.date));
    } else {
      setSlots([]);
    }
  }, [localValue.date]);

  // spaceId 변경 시 초기화
  const prevSpaceIdRef = useRef(spaceId);
  useEffect(() => {
    if (prevSpaceIdRef.current !== spaceId) {
      prevSpaceIdRef.current = spaceId;
      setLocalValue({ date: '', startTime: '', endTime: '' });
      setStep('date');
    }
  }, [spaceId]);

  // 점유 슬롯이 갱신되면 겹치는 선택을 초기화
  const localValueRef = useRef(localValue);
  localValueRef.current = localValue;

  useEffect(() => {
    if (occupiedSlots.length === 0) return;
    const current = localValueRef.current;
    const startOverlaps = current.startTime && isSlotOccupied(current.startTime, occupiedSlots);
    const endOverlaps = current.endTime && isSlotOccupied(current.endTime, occupiedSlots);
    if (startOverlaps || endOverlaps) {
      setLocalValue({ ...current, startTime: '', endTime: '' });
    }
  }, [occupiedSlots]);

  function handleDaySelect(date: Date | undefined) {
    if (!date) return;
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    setLocalValue({ date: `${y}-${m}-${d}`, startTime: '', endTime: '' });
    setStep('time');
  }

  function handleSlotClick(slot: string) {
    if (!localValue.startTime || localValue.endTime) {
      setLocalValue({ ...localValue, startTime: slot, endTime: '' });
      return;
    }
    if (slot > localValue.startTime) {
      if (hasOccupiedBetween(localValue.startTime, slot, occupiedSlots)) return;
      setLocalValue({ ...localValue, endTime: slot });
    } else {
      setLocalValue({ ...localValue, startTime: slot, endTime: '' });
    }
  }

  function isPast(slot: string): boolean {
    // 오늘 날짜의 슬롯만 과거 여부 확인 (미래 날짜는 항상 선택 가능)
    if (localValue.date !== todayStr) return false;
    return new Date(slot).getTime() <= Date.now();
  }

  function isMidnightNextDay(slot: string): boolean {
    return slot.slice(0, 10) !== localValue.date && slot.slice(11, 16) === '00:00';
  }

  function getSlotStyle(slot: string): string {
    const base = 'px-2 py-1 text-sm rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-brand-primary/20';
    if (isSlotOccupied(slot, occupiedSlots)) {
      return `${base} bg-gray-200 text-gray-400 border-gray-200 line-through cursor-not-allowed`;
    }
    if (isPast(slot)) {
      return `${base} bg-gray-50 text-gray-300 border-gray-200 cursor-not-allowed`;
    }
    if (isSlotDisabled(slot)) {
      return `${base} bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed`;
    }
    if (slot === localValue.startTime) {
      return `${base} bg-brand-primary text-white border-brand-primary cursor-pointer`;
    }
    if (slot === localValue.endTime) {
      return `${base} bg-[#007A3D] text-white border-[#007A3D] cursor-pointer`;
    }
    if (localValue.startTime && localValue.endTime && slot > localValue.startTime && slot < localValue.endTime) {
      return `${base} bg-brand-primary/10 text-brand-primary border-brand-primary/30 cursor-pointer`;
    }
    return `${base} bg-white text-gray-700 border-gray-300 hover:bg-gray-50 cursor-pointer`;
  }

  function isSlotDisabled(slot: string): boolean {
    if (isSlotOccupied(slot, occupiedSlots)) return true;
    if (isPast(slot)) return true;
    // 24:00 슬롯은 종료 시간으로만 선택 가능 (시작 시간 선택 단계에서는 비활성화)
    if (isMidnightNextDay(slot) && (!localValue.startTime || Boolean(localValue.endTime))) return true;
    return Boolean(localValue.startTime && !localValue.endTime && slot < localValue.startTime);
  }

  function handleConfirm() {
    if (canConfirm) onConfirm(localValue);
  }

  function handleInternalBack() {
    if (step === 'time') { setStep('date'); return; }
    onBack?.();
  }

  const canConfirm = localValue.startTime !== '' && localValue.endTime !== '';
  const visibleSlots = showAllSlots
    ? slots
    : slots.filter((s) => {
        const t = extractTimeHHMM(s);
        return t >= DEFAULT_START_TIME && t <= DEFAULT_END_TIME;
      });

  const subtitleMap: Record<InternalStep, string> = { date: '1/2', time: '2/2' };

  const selectedDate = localValue.date ? new Date(localValue.date + 'T00:00:00') : undefined;

  return (
    <StepPopup
      isOpen={isOpen}
      onClose={onClose}
      onReset={onReset}
      title="날짜 및 시간"
      subtitle={subtitleMap[step]}
      onBack={handleInternalBack}
      onConfirm={step === 'time' ? handleConfirm : undefined}
      canConfirm={step === 'time' ? canConfirm : false}
      confirmLabel="다음"
      completedSteps={completedSteps}
    >
      {/* 요약 배지 */}
      {step === 'time' && localValue.date && (
        <div className="mb-4 rounded-xl bg-gray-50 border border-[#E5E7EB] px-4 py-3">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-brand-accent font-medium w-14 flex-shrink-0">날짜</span>
            <span className="text-black font-semibold">{localValue.date}</span>
          </div>
        </div>
      )}

      {/* step: date — 달력 */}
      {step === 'date' && (
        <div>
          <p className="text-base font-semibold text-black mb-4">날짜를 선택해주세요</p>
          <div className="flex justify-center">
            <DayPicker
              mode="single"
              selected={selectedDate}
              onSelect={handleDaySelect}
              disabled={{ before: today }}
            />
          </div>
        </div>
      )}

      {/* step: time — 시간 슬롯 선택 */}
      {step === 'time' && (
        <div>
          <p className="text-base font-semibold text-black mb-2">시간을 선택해주세요</p>
          <div className="flex items-center mb-3">
            <p className="text-xs text-gray-500">
              {!localValue.startTime && '시작 시간을 선택해주세요'}
              {localValue.startTime && !localValue.endTime && '종료 시간을 선택해주세요'}
              {localValue.startTime && localValue.endTime && (
                <>{formatTime(localValue.startTime)} ~ {formatTimeSlotLabel(localValue.endTime, localValue.date)}</>
              )}
            </p>
            <div className="ml-auto flex items-center gap-2">
              {localValue.startTime && (
                <button
                  type="button"
                  onClick={() => setLocalValue({ ...localValue, startTime: '', endTime: '' })}
                  className="text-xs text-gray-500 underline whitespace-nowrap"
                >
                  선택해제
                </button>
              )}
              <button
                type="button"
                onClick={() => setShowAllSlots((prev) => !prev)}
                className="text-xs text-brand-primary underline whitespace-nowrap"
              >
                {showAllSlots ? '기본시간 보기' : '전체시간 보기'}
              </button>
            </div>
          </div>

          {slotsError && (
            <p className="text-sm text-red-500 mb-2">{slotsError}</p>
          )}

          {isLoadingSlots && (
            <p className="text-sm text-gray-400 mb-2">예약 현황을 불러오는 중...</p>
          )}

          {slots.length === 0
            ? <p className="text-sm text-gray-400">날짜를 먼저 선택해주세요</p>
            : (
              <>
                <div className="grid grid-cols-4 gap-1 sm:grid-cols-6">
                  {visibleSlots.map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      disabled={isSlotDisabled(slot)}
                      onClick={() => handleSlotClick(slot)}
                      className={getSlotStyle(slot)}
                    >
                      {formatTimeSlotLabel(slot, localValue.date)}
                    </button>
                  ))}
                </div>
                {occupiedSlots.length > 0 && (
                  <div className="flex items-center gap-2 mt-3 text-xs text-gray-500">
                    <span className="inline-block w-4 h-4 rounded bg-gray-200 border border-gray-200 line-through text-center text-[10px] leading-4">X</span>
                    <span>예약됨</span>
                  </div>
                )}
              </>
            )
          }
        </div>
      )}
    </StepPopup>
  );
}

export default DateTimePopup;
