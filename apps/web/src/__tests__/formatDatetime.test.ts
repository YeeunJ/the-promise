import { describe, it, expect } from 'vitest';
import {
  formatDate,
  formatTime,
  formatDatetimeRange,
  generateTimeSlots,
} from '../utils/formatDatetime';

describe('formatDate', () => {
  it('ISO 8601 문자열(KST)을 "YYYY-MM-DD (요일)" 형식으로 변환한다 (happy path)', () => {
    // 2026-04-10은 금요일
    const result = formatDate('2026-04-10T10:00:00+09:00');
    expect(result).toBe('2026-04-10 (금)');
  });

  it('UTC 시간대 ISO 문자열을 KST 기준으로 올바른 날짜를 반환한다', () => {
    // 2026-04-10T00:00:00Z = 2026-04-10T09:00:00+09:00 (KST)
    const result = formatDate('2026-04-10T00:00:00Z');
    expect(result).toBe('2026-04-10 (금)');
  });

  it('자정 직전 UTC(23:59)를 KST 기준으로 다음날로 변환한다 (boundary case)', () => {
    // 2026-04-09T15:00:00Z = 2026-04-10T00:00:00+09:00 (KST, 자정)
    const result = formatDate('2026-04-09T15:00:00Z');
    expect(result).toBe('2026-04-10 (금)');
  });

  it('일요일 날짜를 올바르게 표시한다', () => {
    // 2026-04-12는 일요일
    const result = formatDate('2026-04-12T00:00:00+09:00');
    expect(result).toBe('2026-04-12 (일)');
  });

  it('토요일 날짜를 올바르게 표시한다', () => {
    // 2026-04-11은 토요일
    const result = formatDate('2026-04-11T00:00:00+09:00');
    expect(result).toBe('2026-04-11 (토)');
  });

  it('월 및 일이 한 자리일 때 두 자리 패딩이 적용된다 (boundary case)', () => {
    // 2026-01-01은 목요일
    const result = formatDate('2026-01-01T00:00:00+09:00');
    expect(result).toBe('2026-01-01 (목)');
  });
});

describe('formatTime', () => {
  it('ISO 8601 문자열을 "HH:mm" 형식으로 변환한다 (happy path)', () => {
    const result = formatTime('2026-04-10T13:30:00+09:00');
    expect(result).toBe('13:30');
  });

  it('자정 00:00을 올바르게 포맷한다 (boundary case)', () => {
    const result = formatTime('2026-04-10T00:00:00+09:00');
    expect(result).toBe('00:00');
  });

  it('23:30을 올바르게 포맷한다 (boundary case)', () => {
    const result = formatTime('2026-04-10T23:30:00+09:00');
    expect(result).toBe('23:30');
  });

  it('UTC 00:00을 KST 09:00으로 변환한다', () => {
    const result = formatTime('2026-04-10T00:00:00Z');
    expect(result).toBe('09:00');
  });

  it('한 자리 시간에 두 자리 패딩이 적용된다 (boundary case)', () => {
    const result = formatTime('2026-04-10T09:05:00+09:00');
    expect(result).toBe('09:05');
  });
});

describe('formatDatetimeRange', () => {
  it('시작과 종료 ISO 문자열을 "날짜 (요일) HH:mm ~ HH:mm" 형식으로 반환한다 (happy path)', () => {
    const result = formatDatetimeRange(
      '2026-04-10T10:00:00+09:00',
      '2026-04-10T12:00:00+09:00'
    );
    expect(result).toBe('2026-04-10 (금) 10:00 ~ 12:00');
  });

  it('시작과 종료가 동일한 시간일 때 같은 시간을 표시한다 (boundary case)', () => {
    const result = formatDatetimeRange(
      '2026-04-10T10:00:00+09:00',
      '2026-04-10T10:00:00+09:00'
    );
    expect(result).toBe('2026-04-10 (금) 10:00 ~ 10:00');
  });

  it('자정부터 23:30까지 범위를 올바르게 포맷한다 (boundary case)', () => {
    const result = formatDatetimeRange(
      '2026-04-10T00:00:00+09:00',
      '2026-04-10T23:30:00+09:00'
    );
    expect(result).toBe('2026-04-10 (금) 00:00 ~ 23:30');
  });
});

describe('generateTimeSlots', () => {
  it('날짜 문자열로 49개의 ISO 8601 슬롯 배열을 반환한다 (happy path, 마지막은 24:00 다음날 자정)', () => {
    const slots = generateTimeSlots('2026-04-10');
    expect(slots).toHaveLength(49);
  });

  it('첫 번째 슬롯이 00:00이고 마지막 슬롯이 23:30이다 (boundary case)', () => {
    const slots = generateTimeSlots('2026-04-10');
    expect(slots[0]).toBe('2026-04-10T00:00:00+09:00');
    expect(slots[47]).toBe('2026-04-10T23:30:00+09:00');
  });

  it('슬롯들이 30분 간격으로 생성된다', () => {
    const slots = generateTimeSlots('2026-04-10');
    expect(slots[1]).toBe('2026-04-10T00:30:00+09:00');
    expect(slots[2]).toBe('2026-04-10T01:00:00+09:00');
    expect(slots[3]).toBe('2026-04-10T01:30:00+09:00');
  });

  it('모든 슬롯이 +09:00 KST 타임존을 포함한다', () => {
    const slots = generateTimeSlots('2026-04-10');
    expect(slots.every((s) => s.endsWith('+09:00'))).toBe(true);
  });

  it('첫 48개 슬롯이 지정된 날짜로 시작하고, 마지막 슬롯은 다음날 자정이다', () => {
    const date = '2026-12-31';
    const slots = generateTimeSlots(date);
    expect(slots.slice(0, 48).every((s) => s.startsWith(date))).toBe(true);
    expect(slots[48]).toBe('2027-01-01T00:00:00+09:00');
  });

  it('시간과 분이 두 자리로 패딩된다 (boundary case)', () => {
    const slots = generateTimeSlots('2026-04-10');
    // 01:00 슬롯 (i=2)
    expect(slots[2]).toBe('2026-04-10T01:00:00+09:00');
    // 09:30 슬롯 (i=19)
    expect(slots[19]).toBe('2026-04-10T09:30:00+09:00');
  });
});
