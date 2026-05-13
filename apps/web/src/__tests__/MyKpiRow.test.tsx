import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MyKpiRow } from '../components/my/MyKpiRow';
import type { Reservation } from '../types';

function makeReservation(id: number, status: Reservation['status']): Reservation {
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
    start_datetime: '2099-12-31T10:00:00+09:00',
    end_datetime: '2099-12-31T11:00:00+09:00',
    status,
    admin_note: null,
    created_at: '2026-05-13T00:00:00+09:00',
  };
}

describe('MyKpiRow', () => {
  it('4 KPI 카드 렌더 (예정/확정/대기/취소)', () => {
    render(<MyKpiRow reservations={[]} />);
    expect(screen.getByText('예정')).toBeInTheDocument();
    expect(screen.getByText('확정')).toBeInTheDocument();
    expect(screen.getByText('대기')).toBeInTheDocument();
    expect(screen.getByText('취소')).toBeInTheDocument();
  });

  it('빈 배열: 모든 값 0', () => {
    render(<MyKpiRow reservations={[]} />);
    const values = screen.getAllByText('0');
    expect(values.length).toBeGreaterThanOrEqual(4);
  });

  it('상태별 카운트 정확', () => {
    const reservations = [
      makeReservation(1, 'confirmed'),
      makeReservation(2, 'confirmed'),
      makeReservation(3, 'pending'),
      makeReservation(4, 'cancelled'),
    ];
    render(<MyKpiRow reservations={reservations} />);
    // 예정 = 전체 - 취소 = 3
    expect(screen.getByTestId('kpi-upcoming')).toHaveTextContent('3');
    expect(screen.getByTestId('kpi-confirmed')).toHaveTextContent('2');
    expect(screen.getByTestId('kpi-pending')).toHaveTextContent('1');
    expect(screen.getByTestId('kpi-cancelled')).toHaveTextContent('1');
  });
});
