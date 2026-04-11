import { describe, it, expect } from 'vitest';
import { hasOccupiedBetween } from '../utils/occupiedSlotHelpers';
import type { OccupiedSlot } from '../types';

const occupied: ReadonlyArray<OccupiedSlot> = [
  { start_datetime: '2026-04-10T10:00:00+09:00', end_datetime: '2026-04-10T12:00:00+09:00' },
  { start_datetime: '2026-04-10T14:00:00+09:00', end_datetime: '2026-04-10T15:30:00+09:00' },
];

describe('hasOccupiedBetween', () => {
  it('점유 슬롯이 범위 내에 시작하면 true를 반환한다', () => {
    // 09:00~13:00 범위 안에 10:00~12:00 점유 슬롯이 있음
    expect(hasOccupiedBetween('2026-04-10T09:00:00+09:00', '2026-04-10T13:00:00+09:00', occupied)).toBe(true);
  });

  it('점유 슬롯이 범위를 걸쳐 있으면 true를 반환한다 (시작이 범위 밖)', () => {
    // 11:00~13:00 범위: 10:00~12:00 점유 슬롯은 시작이 범위 밖이지만 end가 범위 안에 걸침
    expect(hasOccupiedBetween('2026-04-10T11:00:00+09:00', '2026-04-10T13:00:00+09:00', occupied)).toBe(true);
  });

  it('점유 슬롯이 범위를 완전히 포함하면 true를 반환한다', () => {
    // 10:30~11:00 범위가 10:00~12:00 점유 슬롯 안에 완전히 포함
    expect(hasOccupiedBetween('2026-04-10T10:30:00+09:00', '2026-04-10T11:00:00+09:00', occupied)).toBe(true);
  });

  it('점유 슬롯이 범위와 겹치지 않으면 false를 반환한다', () => {
    expect(hasOccupiedBetween('2026-04-10T12:00:00+09:00', '2026-04-10T14:00:00+09:00', occupied)).toBe(false);
  });

  it('빈 점유 목록이면 false를 반환한다', () => {
    expect(hasOccupiedBetween('2026-04-10T10:00:00+09:00', '2026-04-10T12:00:00+09:00', [])).toBe(false);
  });

  it('다른 오프셋이라도 올바르게 판별한다', () => {
    const mixedOccupied: ReadonlyArray<OccupiedSlot> = [
      { start_datetime: '2026-04-10T01:00:00Z', end_datetime: '2026-04-10T03:00:00Z' },
    ];
    // 2026-04-10T10:00:00+09:00 === 01:00Z, 2026-04-10T13:00:00+09:00 === 04:00Z
    expect(hasOccupiedBetween('2026-04-10T10:00:00+09:00', '2026-04-10T13:00:00+09:00', mixedOccupied)).toBe(true);
  });
});
