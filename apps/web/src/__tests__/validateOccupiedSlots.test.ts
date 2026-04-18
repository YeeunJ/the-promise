import { describe, it, expect } from 'vitest';
import { validateOccupiedSlots } from '../utils/occupiedSlotHelpers';

describe('validateOccupiedSlots', () => {
  it('유효한 OccupiedSlot 배열을 그대로 반환한다', () => {
    const input = [
      { start_datetime: '2026-04-10T10:00:00+09:00', end_datetime: '2026-04-10T12:00:00+09:00' },
      { start_datetime: '2026-04-10T14:00:00+09:00', end_datetime: '2026-04-10T15:00:00+09:00' },
    ];
    expect(validateOccupiedSlots(input)).toEqual(input);
  });

  it('배열이 아닌 입력은 빈 배열을 반환한다', () => {
    expect(validateOccupiedSlots(null)).toEqual([]);
    expect(validateOccupiedSlots(undefined)).toEqual([]);
    expect(validateOccupiedSlots('string')).toEqual([]);
    expect(validateOccupiedSlots(42)).toEqual([]);
    expect(validateOccupiedSlots({})).toEqual([]);
  });

  it('빈 배열은 빈 배열을 반환한다', () => {
    expect(validateOccupiedSlots([])).toEqual([]);
  });

  it('start_datetime이 없는 항목을 걸러낸다', () => {
    const input = [
      { end_datetime: '2026-04-10T12:00:00+09:00' },
      { start_datetime: '2026-04-10T10:00:00+09:00', end_datetime: '2026-04-10T12:00:00+09:00' },
    ];
    expect(validateOccupiedSlots(input)).toEqual([
      { start_datetime: '2026-04-10T10:00:00+09:00', end_datetime: '2026-04-10T12:00:00+09:00' },
    ]);
  });

  it('end_datetime이 없는 항목을 걸러낸다', () => {
    const input = [
      { start_datetime: '2026-04-10T10:00:00+09:00' },
    ];
    expect(validateOccupiedSlots(input)).toEqual([]);
  });

  it('datetime이 문자열이 아닌 항목을 걸러낸다', () => {
    const input = [
      { start_datetime: 123, end_datetime: '2026-04-10T12:00:00+09:00' },
      { start_datetime: '2026-04-10T10:00:00+09:00', end_datetime: null },
    ];
    expect(validateOccupiedSlots(input)).toEqual([]);
  });

  it('파싱 불가한 datetime 문자열을 걸러낸다', () => {
    const input = [
      { start_datetime: 'not-a-date', end_datetime: '2026-04-10T12:00:00+09:00' },
      { start_datetime: '2026-04-10T10:00:00+09:00', end_datetime: 'invalid' },
    ];
    expect(validateOccupiedSlots(input)).toEqual([]);
  });

  it('null 항목을 걸러낸다', () => {
    const input = [
      null,
      { start_datetime: '2026-04-10T10:00:00+09:00', end_datetime: '2026-04-10T12:00:00+09:00' },
    ];
    expect(validateOccupiedSlots(input)).toEqual([
      { start_datetime: '2026-04-10T10:00:00+09:00', end_datetime: '2026-04-10T12:00:00+09:00' },
    ]);
  });
});
