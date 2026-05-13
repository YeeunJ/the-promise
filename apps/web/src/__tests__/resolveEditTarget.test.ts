import { describe, it, expect } from 'vitest';
import { resolveEditTarget } from '../lib/resolveEditTarget';

describe('resolveEditTarget', () => {
  it('null → 1 (applicant)', () => {
    expect(resolveEditTarget(null)).toBe(1);
  });

  it('빈 문자열 → 1', () => {
    expect(resolveEditTarget('')).toBe(1);
  });

  it('과거 시각 / 시간 / 날짜 키워드 → 4 (datetime)', () => {
    expect(resolveEditTarget('과거 시각은 선택할 수 없습니다')).toBe(4);
    expect(resolveEditTarget('이미 예약된 시간입니다')).toBe(4);
    expect(resolveEditTarget('유효하지 않은 날짜')).toBe(4);
  });

  it('공간 / 장소 키워드 → 2 (space)', () => {
    expect(resolveEditTarget('해당 공간은 사용할 수 없습니다')).toBe(2);
    expect(resolveEditTarget('장소 정보가 잘못되었습니다')).toBe(2);
  });

  it('인원 키워드 → 3 (headcount)', () => {
    expect(resolveEditTarget('수용 인원을 초과합니다')).toBe(3);
  });

  it('목적 키워드 → 5 (purpose)', () => {
    expect(resolveEditTarget('사용 목적을 입력하세요')).toBe(5);
  });

  it('알 수 없는 메시지 → 1', () => {
    expect(resolveEditTarget('알 수 없는 오류')).toBe(1);
  });
});
