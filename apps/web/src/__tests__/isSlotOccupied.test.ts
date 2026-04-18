import { describe, it, expect } from 'vitest';
import { isSlotOccupied } from '../utils/occupiedSlotHelpers';
import type { OccupiedSlot } from '../types';

const occupied: ReadonlyArray<OccupiedSlot> = [
  { start_datetime: '2026-04-10T10:00:00+09:00', end_datetime: '2026-04-10T12:00:00+09:00' },
  { start_datetime: '2026-04-10T14:00:00+09:00', end_datetime: '2026-04-10T15:30:00+09:00' },
];

describe('isSlotOccupied', () => {
  it('범위 내부 슬롯은 true를 반환한다', () => {
    expect(isSlotOccupied('2026-04-10T10:30:00+09:00', occupied)).toBe(true);
    expect(isSlotOccupied('2026-04-10T11:00:00+09:00', occupied)).toBe(true);
  });

  it('범위 시작 경계는 true를 반환한다 (반개구간 [start, end))', () => {
    expect(isSlotOccupied('2026-04-10T10:00:00+09:00', occupied)).toBe(true);
  });

  it('범위 종료 경계는 false를 반환한다 (반개구간 [start, end))', () => {
    expect(isSlotOccupied('2026-04-10T12:00:00+09:00', occupied)).toBe(false);
  });

  it('범위 외부 슬롯은 false를 반환한다', () => {
    expect(isSlotOccupied('2026-04-10T09:00:00+09:00', occupied)).toBe(false);
    expect(isSlotOccupied('2026-04-10T13:00:00+09:00', occupied)).toBe(false);
  });

  it('두 번째 범위에 속하는 슬롯도 true를 반환한다', () => {
    expect(isSlotOccupied('2026-04-10T14:00:00+09:00', occupied)).toBe(true);
    expect(isSlotOccupied('2026-04-10T15:00:00+09:00', occupied)).toBe(true);
  });

  it('빈 점유 목록이면 false를 반환한다', () => {
    expect(isSlotOccupied('2026-04-10T10:00:00+09:00', [])).toBe(false);
  });

  it('다른 오프셋이라도 동일 시각이면 올바르게 판별한다', () => {
    const mixedOffsetOccupied: ReadonlyArray<OccupiedSlot> = [
      { start_datetime: '2026-04-10T01:00:00Z', end_datetime: '2026-04-10T03:00:00Z' },
    ];
    // 2026-04-10T10:00:00+09:00 === 2026-04-10T01:00:00Z (same instant)
    expect(isSlotOccupied('2026-04-10T10:00:00+09:00', mixedOffsetOccupied)).toBe(true);
    // 2026-04-10T11:00:00+09:00 === 2026-04-10T02:00:00Z (within range)
    expect(isSlotOccupied('2026-04-10T11:00:00+09:00', mixedOffsetOccupied)).toBe(true);
    // 2026-04-10T12:00:00+09:00 === 2026-04-10T03:00:00Z (end boundary, exclusive)
    expect(isSlotOccupied('2026-04-10T12:00:00+09:00', mixedOffsetOccupied)).toBe(false);
  });
});
