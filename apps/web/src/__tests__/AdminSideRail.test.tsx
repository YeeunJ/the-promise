import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AdminSideRail } from '../components/admin/AdminSideRail';
import type { Reservation } from '../types';

function makeReservation(
  id: number,
  status: Reservation['status'],
  start: string,
  end: string,
  space: string = '사랑방',
): Reservation {
  return {
    id,
    space: {
      id: 1,
      building: { id: 1, name: '본당', description: null },
      name: space,
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
    end_datetime: end,
    status,
    admin_note: null,
    created_at: '2026-05-13T00:00:00+09:00',
  };
}

describe('AdminSideRail', () => {
  it('selectedDate 없으면 날짜 선택 안내 표시', () => {
    render(
      <AdminSideRail
        reservations={[]}
        selectedDate={null}
        onReservationClick={vi.fn()}
      />,
    );
    expect(screen.getByText('날짜를 선택하세요.')).toBeInTheDocument();
  });

  it('selectedDate 있고 예약 없으면 빈 안내 표시', () => {
    render(
      <AdminSideRail
        reservations={[]}
        selectedDate="2026-05-13"
        onReservationClick={vi.fn()}
      />,
    );
    expect(screen.getByText('해당 날짜에 예약이 없습니다.')).toBeInTheDocument();
  });

  it('선택한 날짜의 예약만 표시 (모든 상태)', () => {
    const reservations = [
      makeReservation(1, 'confirmed', '2026-05-13T10:00:00+09:00', '2026-05-13T11:00:00+09:00', '사랑방'),
      makeReservation(2, 'cancelled', '2026-05-13T14:00:00+09:00', '2026-05-13T15:00:00+09:00', '믿음방'),
      makeReservation(3, 'pending', '2026-05-14T10:00:00+09:00', '2026-05-14T11:00:00+09:00', '소망방'),
    ];
    render(
      <AdminSideRail
        reservations={reservations}
        selectedDate="2026-05-13"
        onReservationClick={vi.fn()}
      />,
    );
    expect(screen.getByText(/사랑방/)).toBeInTheDocument();
    expect(screen.getByText(/믿음방/)).toBeInTheDocument();
    expect(screen.queryByText(/소망방/)).not.toBeInTheDocument();
  });

  it('항목 클릭 → onReservationClick(reservation)', async () => {
    const reservations = [
      makeReservation(99, 'confirmed', '2026-05-13T10:00:00+09:00', '2026-05-13T11:00:00+09:00'),
    ];
    const onClick = vi.fn();
    const user = userEvent.setup();
    render(
      <AdminSideRail
        reservations={reservations}
        selectedDate="2026-05-13"
        onReservationClick={onClick}
      />,
    );
    const item = screen.getByTestId('side-rail-item-99');
    await user.click(item);
    expect(onClick).toHaveBeenCalledWith(expect.objectContaining({ id: 99 }));
  });
});
