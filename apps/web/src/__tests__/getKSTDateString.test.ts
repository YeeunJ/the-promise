import { describe, it, expect, vi, afterEach } from 'vitest';
import { getKSTDateString } from '../utils/formatDatetime';

afterEach(() => {
  vi.useRealTimers();
});

describe('getKSTDateString', () => {
  it('YYYY-MM-DD 형식 문자열을 반환한다 (happy path)', () => {
    const result = getKSTDateString();
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('UTC 23:30 (KST 08:30 다음날)에서 KST 날짜를 올바르게 반환한다 (boundary case)', () => {
    // 2026-04-08 23:30 UTC = 2026-04-09 08:30 KST
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-04-08T23:30:00Z'));
    expect(getKSTDateString()).toBe('2026-04-09');
  });

  it('UTC 14:59 (KST 23:59)에서 KST 날짜를 올바르게 반환한다 (boundary case)', () => {
    // 2026-04-08 14:59 UTC = 2026-04-08 23:59 KST
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-04-08T14:59:00Z'));
    expect(getKSTDateString()).toBe('2026-04-08');
  });

  it('UTC 15:00 (KST 00:00 다음날)에서 KST 날짜를 올바르게 반환한다 (boundary case)', () => {
    // 2026-04-08 15:00 UTC = 2026-04-09 00:00 KST
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-04-08T15:00:00Z'));
    expect(getKSTDateString()).toBe('2026-04-09');
  });
});
