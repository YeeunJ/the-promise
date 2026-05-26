import { describe, it, expect } from 'vitest';
import { formatPhone, normalizePhone } from '../utils/formatPhone';

describe('formatPhone', () => {
  it('11자리 숫자 문자열을 010-XXXX-XXXX 형식으로 변환한다 (happy path)', () => {
    expect(formatPhone('01012345678')).toBe('010-1234-5678');
  });

  it('이미 하이픈이 있는 문자열에서 숫자만 추출하여 포맷한다', () => {
    expect(formatPhone('010-1234-5678')).toBe('010-1234-5678');
  });

  it('10자리 숫자를 3-3-4 형식으로 변환한다', () => {
    expect(formatPhone('0101234567')).toBe('010-123-4567');
  });

  it('10자리 미만 숫자는 그대로 반환한다 (boundary case)', () => {
    expect(formatPhone('010')).toBe('010');
  });

  it('빈 문자열을 그대로 반환한다 (boundary case)', () => {
    expect(formatPhone('')).toBe('');
  });

  it('숫자 외 문자가 섞인 경우 숫자만 추출하여 포맷한다', () => {
    expect(formatPhone('010.1234.5678')).toBe('010-1234-5678');
  });

  it('공백이 포함된 경우 숫자만 추출하여 포맷한다', () => {
    expect(formatPhone('010 1234 5678')).toBe('010-1234-5678');
  });
});

describe('normalizePhone', () => {
  it('완성된 11자리 입력을 010-XXXX-XXXX 형식으로 반환한다 (happy path)', () => {
    expect(normalizePhone('01012345678')).toBe('010-1234-5678');
  });

  it('3자리 이하 입력은 숫자만 반환한다 (boundary case)', () => {
    expect(normalizePhone('010')).toBe('010');
    expect(normalizePhone('01')).toBe('01');
  });

  it('4~7자리 입력은 010-XXXX 형식으로 하이픈 삽입 (boundary case)', () => {
    expect(normalizePhone('0101')).toBe('010-1');
    expect(normalizePhone('010123')).toBe('010-123');
    expect(normalizePhone('0101234')).toBe('010-1234');
  });

  it('8~11자리 입력은 010-XXXX-XXXX 형식으로 두 번째 하이픈 삽입', () => {
    expect(normalizePhone('01012345')).toBe('010-1234-5');
    expect(normalizePhone('010123456')).toBe('010-1234-56');
    expect(normalizePhone('0101234567')).toBe('010-1234-567');
    expect(normalizePhone('01012345678')).toBe('010-1234-5678');
  });

  it('11자리 초과 입력은 11자리로 잘린다 (boundary case)', () => {
    expect(normalizePhone('010123456789')).toBe('010-1234-5678');
  });

  it('빈 문자열을 빈 문자열로 반환한다 (boundary case)', () => {
    expect(normalizePhone('')).toBe('');
  });

  it('숫자 외 문자가 포함되어도 정상적으로 포맷한다', () => {
    expect(normalizePhone('010-1234-5678')).toBe('010-1234-5678');
  });

  it('하이픈 입력 중간 단계를 올바르게 처리한다', () => {
    // 사용자가 "010-" 까지 입력하면 digits = "010" (3자리) → "010" 반환
    expect(normalizePhone('010-')).toBe('010');
    // 사용자가 "010-1" 입력 → digits = "0101" (4자리) → "010-1"
    expect(normalizePhone('010-1')).toBe('010-1');
  });
});
