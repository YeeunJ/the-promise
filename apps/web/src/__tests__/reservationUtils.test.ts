import { describe, it, expect } from 'vitest';
import { isCancellable } from '../lib/reservationUtils';

describe('isCancellable', () => {
  it('confirmed 상태는 취소 가능하다', () => {
    expect(isCancellable('confirmed')).toBe(true);
  });

  it('pending 상태는 취소 가능하다', () => {
    expect(isCancellable('pending')).toBe(true);
  });

  it('cancelled 상태는 취소 불가능하다', () => {
    expect(isCancellable('cancelled')).toBe(false);
  });

  it('rejected 상태는 취소 불가능하다', () => {
    expect(isCancellable('rejected')).toBe(false);
  });
});
