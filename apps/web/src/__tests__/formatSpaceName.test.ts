import { describe, it, expect } from 'vitest';
import { formatSpaceName } from '../utils/formatSpaceName';
import type { Reservation } from '../types';

function makeSpace(overrides: Partial<Reservation['space']> = {}): Reservation['space'] {
  return {
    id: 1,
    name: '세미나실',
    floor: 2,
    capacity: 20,
    description: null,
    building: { id: 1, name: '본관', description: null },
    ...overrides,
  };
}

describe('formatSpaceName', () => {
  it('건물명 + 층수 + 공간명 형식으로 반환한다 (happy path)', () => {
    const result = formatSpaceName(makeSpace());
    expect(result).toBe('본관 2층 세미나실');
  });

  it('floor가 null이면 층수를 생략한다 (boundary case)', () => {
    const result = formatSpaceName(makeSpace({ floor: null, name: '대강당' }));
    expect(result).toBe('본관 대강당');
  });

  it('floor가 1이면 "1층"을 포함한다', () => {
    const result = formatSpaceName(makeSpace({ floor: 1, name: '로비' }));
    expect(result).toBe('본관 1층 로비');
  });

  it('다른 건물명을 올바르게 포함한다', () => {
    const result = formatSpaceName(
      makeSpace({
        building: { id: 2, name: '교육관', description: null },
        floor: 3,
        name: '교육실',
      })
    );
    expect(result).toBe('교육관 3층 교육실');
  });
});
