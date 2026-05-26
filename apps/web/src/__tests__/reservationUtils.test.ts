import { describe, it, expect } from 'vitest';
import {
  isCancellable,
  countReservationsByStatus,
} from '../lib/reservationUtils';
import type { Reservation, ReservationStatus } from '../types';

function makeReservation(
  id: number,
  status: ReservationStatus,
): Reservation {
  return {
    id,
    space: {
      id: 1,
      name: '대예배실',
      floor: 1,
      capacity: 500,
      description: null,
      building: { id: 1, name: '본당', description: null },
    },
    applicant_name: '홍길동',
    applicant_phone: '010-0000-0000',
    applicant_team: '청년1팀',
    team: null,
    custom_team_name: null,
    leader_phone: '010-1111-1111',
    headcount: 10,
    purpose: '기도회',
    start_datetime: '2026-05-01T10:00:00+09:00',
    end_datetime: '2026-05-01T11:00:00+09:00',
    status,
    admin_note: null,
    created_at: '2026-04-25T12:00:00+09:00',
  };
}

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

describe('countReservationsByStatus', () => {
  it('빈 배열이면 모든 상태가 0', () => {
    const result = countReservationsByStatus([]);
    expect(result).toEqual({
      confirmed: 0,
      pending: 0,
      cancelled: 0,
      rejected: 0,
      total: 0,
    });
  });

  it('상태별 건수를 정확히 집계한다', () => {
    const reservations: Reservation[] = [
      makeReservation(1, 'confirmed'),
      makeReservation(2, 'confirmed'),
      makeReservation(3, 'cancelled'),
      makeReservation(4, 'pending'),
      makeReservation(5, 'confirmed'),
    ];

    const result = countReservationsByStatus(reservations);
    expect(result).toEqual({
      confirmed: 3,
      pending: 1,
      cancelled: 1,
      rejected: 0,
      total: 5,
    });
  });

  it('total은 모든 상태 건수의 합과 같다', () => {
    const reservations: Reservation[] = [
      makeReservation(1, 'confirmed'),
      makeReservation(2, 'rejected'),
      makeReservation(3, 'cancelled'),
    ];

    const result = countReservationsByStatus(reservations);
    expect(result.total).toBe(
      result.confirmed + result.pending + result.cancelled + result.rejected,
    );
    expect(result.total).toBe(3);
  });
});
