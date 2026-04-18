import type { OccupiedSlot } from '../types';

/**
 * 주어진 슬롯(ISO 8601)이 점유 범위 목록 중 하나에 속하는지 판별한다.
 * 반개구간 [start_datetime, end_datetime) 기준으로 비교한다.
 * 내부적으로 hasOccupiedBetween에 1ms 범위를 위임한다.
 */
export function isSlotOccupied(
  slot: string,
  occupiedSlots: ReadonlyArray<OccupiedSlot>,
): boolean {
  const slotMs = new Date(slot).getTime();
  const end = new Date(slotMs + 1).toISOString();
  return hasOccupiedBetween(slot, end, occupiedSlots);
}

/**
 * 주어진 반개구간 [start, end) 범위에 점유 슬롯이 겹치는지 판별한다.
 * 두 반개구간의 겹침 조건: end_datetime > start && start_datetime < end
 */
export function hasOccupiedBetween(
  start: string,
  end: string,
  occupiedSlots: ReadonlyArray<OccupiedSlot>,
): boolean {
  const startMs = new Date(start).getTime();
  const endMs = new Date(end).getTime();
  return occupiedSlots.some(
    ({ start_datetime, end_datetime }) => {
      const occStart = new Date(start_datetime).getTime();
      const occEnd = new Date(end_datetime).getTime();
      return occEnd > startMs && occStart < endMs;
    },
  );
}

/**
 * API 응답을 OccupiedSlot[] 형태로 검증한다.
 * 유효하지 않은 항목은 건너뛴다.
 */
export function validateOccupiedSlots(data: unknown): OccupiedSlot[] {
  if (!Array.isArray(data)) return [];
  return data.filter(
    (item): item is OccupiedSlot =>
      item !== null &&
      typeof item === 'object' &&
      typeof item.start_datetime === 'string' &&
      typeof item.end_datetime === 'string' &&
      !Number.isNaN(new Date(item.start_datetime).getTime()) &&
      !Number.isNaN(new Date(item.end_datetime).getTime()),
  );
}
