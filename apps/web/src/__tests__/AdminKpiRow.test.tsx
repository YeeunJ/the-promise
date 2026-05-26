import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AdminKpiRow } from '../components/admin/AdminKpiRow';
import type { Reservation } from '../types';

function makeReservation(
  id: number,
  status: Reservation['status'],
  start: string,
): Reservation {
  return {
    id,
    space: {
      id: 1,
      building: { id: 1, name: '본당', description: null },
      name: '사랑방',
      floor: 1,
      capacity: 30,
      description: null,
    },
    applicant_name: '홍길동',
    applicant_phone: '010-1234-5678',
    applicant_team: '청년부',
    team: null,
    custom_team_name: null,
    leader_phone: '010-0000-0000',
    headcount: 30,
    purpose: '정기 모임',
    start_datetime: start,
    end_datetime: start,
    status,
    admin_note: null,
    created_at: '2026-05-13T00:00:00+09:00',
  };
}

describe('AdminKpiRow', () => {
  it('2 KPI 카드 (이번 주 예약/확정 대기) 렌더', () => {
    render(<AdminKpiRow reservations={[]} weekStart="2026-05-11" weekEnd="2026-05-17" />);
    expect(screen.getByText('이번 주 예약')).toBeInTheDocument();
    expect(screen.getByText('확정 대기')).toBeInTheDocument();
  });

  it('빈 예약 목록에서 이번 주 예약 = 0, 확정 대기 = 0', () => {
    render(<AdminKpiRow reservations={[]} weekStart="2026-05-11" weekEnd="2026-05-17" />);
    expect(screen.getByTestId('admin-kpi-weekly')).toHaveTextContent('0');
    expect(screen.getByTestId('admin-kpi-pending')).toHaveTextContent('0');
  });

  it('이번 주 범위 안 confirmed + pending 만 합산', () => {
    const reservations = [
      makeReservation(1, 'confirmed', '2026-05-12T10:00:00+09:00'), // 이번 주
      makeReservation(2, 'pending', '2026-05-15T10:00:00+09:00'), // 이번 주
      makeReservation(3, 'cancelled', '2026-05-13T10:00:00+09:00'), // 이번 주 but cancelled
      makeReservation(4, 'confirmed', '2026-05-20T10:00:00+09:00'), // 다음 주
      makeReservation(5, 'confirmed', '2026-05-05T10:00:00+09:00'), // 지난 주
    ];
    render(
      <AdminKpiRow
        reservations={reservations}
        weekStart="2026-05-11"
        weekEnd="2026-05-17"
      />,
    );
    expect(screen.getByTestId('admin-kpi-weekly')).toHaveTextContent('2');
  });

  it('확정 대기 = pending 카운트 (주 무관)', () => {
    const reservations = [
      makeReservation(1, 'pending', '2026-05-12T10:00:00+09:00'),
      makeReservation(2, 'pending', '2026-06-01T10:00:00+09:00'),
      makeReservation(3, 'confirmed', '2026-05-13T10:00:00+09:00'),
    ];
    render(
      <AdminKpiRow
        reservations={reservations}
        weekStart="2026-05-11"
        weekEnd="2026-05-17"
      />,
    );
    expect(screen.getByTestId('admin-kpi-pending')).toHaveTextContent('2');
  });
});
