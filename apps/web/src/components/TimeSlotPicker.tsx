import React, { useEffect, useState } from 'react';
import { TimeSlotValue } from '../types/index';
import { generateTimeSlots, formatTime } from '../utils/formatDatetime';

interface TimeSlotPickerProps {
  spaceId: number | null;
  value: TimeSlotValue;
  onChange: (value: TimeSlotValue) => void;
}

/**
 * 날짜 선택 + 30분 단위 시간 슬롯 선택 컴포넌트
 * - 첫 클릭: startTime 설정
 * - 두 번째 클릭: endTime 설정 (startTime 이후 슬롯만 선택 가능)
 * - startTime/endTime이 모두 선택된 상태에서 클릭 시 재선택 시작
 */
function TimeSlotPicker({ spaceId, value, onChange }: TimeSlotPickerProps): JSX.Element {
  const [slots, setSlots] = useState<string[]>([]);
  const [isLoading] = useState<boolean>(false);

  // 오늘 날짜 (YYYY-MM-DD)
  const today = new Date().toISOString().split('T')[0];

  // spaceId가 실제로 변경될 때만 초기화 (마운트 시 실행 방지)
  const prevSpaceIdRef = React.useRef(spaceId);
  useEffect(() => {
    if (prevSpaceIdRef.current !== spaceId) {
      prevSpaceIdRef.current = spaceId;
      onChange({ date: '', startTime: '', endTime: '' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spaceId]);

  // 날짜 변경 시 슬롯 생성
  useEffect(() => {
    if (value.date) {
      setSlots(generateTimeSlots(value.date));
    } else {
      setSlots([]);
    }
  }, [value.date]);

  function handleDateChange(e: React.ChangeEvent<HTMLInputElement>): void {
    onChange({ date: e.target.value, startTime: '', endTime: '' });
  }

  function handleSlotClick(slot: string): void {
    // startTime이 없으면 첫 선택 → startTime 설정
    if (!value.startTime) {
      onChange({ ...value, startTime: slot, endTime: '' });
      return;
    }

    // startTime과 endTime이 모두 있으면 → 재선택 시작
    if (value.startTime && value.endTime) {
      onChange({ ...value, startTime: slot, endTime: '' });
      return;
    }

    // startTime만 있고 endTime이 없는 상태 → endTime 설정
    // startTime 이후 슬롯만 선택 가능
    if (slot > value.startTime) {
      onChange({ ...value, endTime: slot });
    } else {
      // startTime 이전 슬롯 클릭 시 startTime 재설정
      onChange({ ...value, startTime: slot, endTime: '' });
    }
  }

  function getSlotStyle(slot: string): string {
    const base = 'px-2 py-1 text-sm rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-[#008F49]/20';

    // endTime 선택 중(startTime만 있는 상태)에서 startTime 이전 슬롯 비활성화
    const isSelectingEnd = value.startTime && !value.endTime;
    if (isSelectingEnd && slot < value.startTime) {
      return `${base} bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed`;
    }

    if (slot === value.startTime) {
      return `${base} bg-[#008F49] text-white border-[#008F49] cursor-pointer`;
    }

    if (slot === value.endTime) {
      return `${base} bg-[#007A3D] text-white border-[#007A3D] cursor-pointer`;
    }

    if (value.startTime && value.endTime && slot > value.startTime && slot < value.endTime) {
      return `${base} bg-[#008F49]/10 text-[#008F49] border-[#008F49]/30 cursor-pointer`;
    }

    return `${base} bg-white text-gray-700 border-gray-300 hover:bg-gray-50 cursor-pointer`;
  }

  function isSlotDisabled(slot: string): boolean {
    const isSelectingEnd = value.startTime && !value.endTime;
    return Boolean(isSelectingEnd && slot < value.startTime);
  }

  const isDateDisabled = spaceId === null;

  return (
    <div className="space-y-4">
      {/* 날짜 선택 */}
      <div>
        <label className="block text-sm font-medium text-black mb-1">
          날짜
        </label>
        {isDateDisabled && (
          <p className="text-sm text-amber-600 mb-2">먼저 장소를 선택해주세요</p>
        )}
        <input
          type="date"
          min={today}
          value={value.date}
          onChange={handleDateChange}
          disabled={isDateDisabled}
          className={`w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#008F49]/20 focus:border-[#008F49] ${
            isDateDisabled
              ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
              : 'bg-white text-gray-900 border-gray-300'
          }`}
        />
      </div>

      {/* 시간 슬롯 */}
      {value.date && !isLoading && slots.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-black mb-1">
            시간 선택
          </label>
          <p className="text-xs text-gray-500 mb-2">
            {!value.startTime && '시작 시간을 선택해주세요'}
            {value.startTime && !value.endTime && '종료 시간을 선택해주세요'}
            {value.startTime && value.endTime && (
              <>
                {formatTime(value.startTime)} ~ {formatTime(value.endTime)}
              </>
            )}
          </p>
          <div className="grid grid-cols-4 gap-1 sm:grid-cols-6 md:grid-cols-8">
            {slots.map((slot) => (
              <button
                key={slot}
                type="button"
                disabled={isSlotDisabled(slot)}
                onClick={() => handleSlotClick(slot)}
                className={getSlotStyle(slot)}
              >
                {formatTime(slot)}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default TimeSlotPicker;
