import { describe, it, expect } from 'vitest';
import { extractDateStr } from '../utils/formatDatetime';

describe('extractDateStr', () => {
  it('KST ISO 8601 문자열에서 날짜 부분만 추출한다 (happy path)', () => {
    const result = extractDateStr('2026-04-10T13:00:00+09:00');
    expect(result).toBe('2026-04-10');
  });

  it('UTC ISO 8601 문자열에서 날짜 부분만 추출한다', () => {
    const result = extractDateStr('2026-04-10T00:00:00Z');
    expect(result).toBe('2026-04-10');
  });

  it('월과 일이 한 자리인 날짜를 올바르게 추출한다 (boundary case)', () => {
    const result = extractDateStr('2026-01-01T00:00:00+09:00');
    expect(result).toBe('2026-01-01');
  });

  it('연말 날짜를 올바르게 추출한다 (boundary case)', () => {
    const result = extractDateStr('2026-12-31T23:59:59+09:00');
    expect(result).toBe('2026-12-31');
  });

  it('자정 시간대 ISO 문자열에서 날짜를 올바르게 추출한다', () => {
    const result = extractDateStr('2026-04-10T00:00:00+09:00');
    expect(result).toBe('2026-04-10');
  });

  it('반환값이 정확히 10자리 문자열이다', () => {
    const result = extractDateStr('2026-04-10T13:00:00+09:00');
    expect(result).toHaveLength(10);
  });

  it('반환값이 YYYY-MM-DD 형식이다', () => {
    const result = extractDateStr('2026-04-10T13:00:00+09:00');
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('다른 날짜의 ISO 문자열도 올바르게 처리한다', () => {
    const result = extractDateStr('2025-11-15T09:30:00+09:00');
    expect(result).toBe('2025-11-15');
  });
});
