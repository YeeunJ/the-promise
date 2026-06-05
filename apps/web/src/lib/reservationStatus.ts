import type { ReservationStatus } from '../types';

/**
 * 예약 상태 한글 라벨.
 * StatusBadge / StatusPill 등에서 공유하는 단일 소스.
 */
export const STATUS_LABEL: Record<ReservationStatus, string> = {
  confirmed: '확정',
  pending: '대기',
  rejected: '거절',
  cancelled: '취소',
};
