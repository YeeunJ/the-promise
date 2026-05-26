import type { Reservation, ReservationStatus } from '../types';

export function isCancellable(status: ReservationStatus): boolean {
  return status === 'confirmed' || status === 'pending';
}

export interface ReservationStatusCount {
  confirmed: number;
  pending: number;
  cancelled: number;
  rejected: number;
  total: number;
}

export function countReservationsByStatus(
  reservations: readonly Reservation[],
): ReservationStatusCount {
  const counts: ReservationStatusCount = {
    confirmed: 0,
    pending: 0,
    cancelled: 0,
    rejected: 0,
    total: reservations.length,
  };

  for (const r of reservations) {
    counts[r.status] += 1;
  }

  return counts;
}
