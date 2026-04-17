import type { ReservationStatus } from '../types';

export function isCancellable(status: ReservationStatus): boolean {
  return status === 'confirmed' || status === 'pending';
}
