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
  it('오늘 카드 + 확정 대기 카드 헤더 표시', () => {
    render(
      <AdminSideRail
        reservations={[]}
        todayDateStr="2026-05-13"
        onReservationClick={vi.fn()}
      />,
    );
    expect(screen.getByText('오늘')).toBeInTheDocument();
    expect(screen.getByText('확정 대기')).toBeInTheDocument();
  });

  it('오늘 일정이 비어있으면 안내 메시지', () => {
    render(
      <AdminSideRail
        reservations={[]}
        todayDateStr="2026-05-13"
        onReservationClick={vi.fn()}
      />,
    );
    expect(screen.getByText(/오늘 일정이 없습니다/)).toBeInTheDocument();
  });

  it('오늘 일정 표시 (confirmed 만)', () => {
    const reservations = [
      makeReservation(1, 'confirmed', '2026-05-13T10:00:00+09:00', '2026-05-13T11:00:00+09:00', '사랑방'),
      makeReservation(2, 'cancelled', '2026-05-13T14:00:00+09:00', '2026-05-13T15:00:00+09:00', '믿음방'),
    ];
    render(
      <AdminSideRail
        reservations={reservations}
        todayDateStr="2026-05-13"
        onReservationClick={vi.fn()}
      />,
    );
    expect(screen.getByText(/사랑방/)).toBeInTheDocument();
    expect(screen.queryByText(/믿음방/)).not.toBeInTheDocument();
  });

  it('확정 대기 카드: pending 만 표시', () => {
    const reservations = [
      makeReservation(1, 'pending', '2099-12-31T10:00:00+09:00', '2099-12-31T11:00:00+09:00', '사랑방'),
      makeReservation(2, 'confirmed', '2099-12-30T10:00:00+09:00', '2099-12-30T11:00:00+09:00', '믿음방'),
    ];
    render(
      <AdminSideRail
        reservations={reservations}
        todayDateStr="2026-05-13"
        onReservationClick={vi.fn()}
      />,
    );
    // pending 1건
    const pendingSection = screen.getByTestId('admin-side-rail-pending');
    expect(pendingSection.textContent).toContain('사랑방');
    expect(pendingSection.textContent).not.toContain('믿음방');
  });

  it('확정 대기 클릭 → onReservationClick(reservation)', async () => {
    const reservations = [
      makeReservation(99, 'pending', '2099-12-31T10:00:00+09:00', '2099-12-31T11:00:00+09:00'),
    ];
    const onClick = vi.fn();
    const user = userEvent.setup();
    render(
      <AdminSideRail
        reservations={reservations}
        todayDateStr="2026-05-13"
        onReservationClick={onClick}
      />,
    );
    const item = screen.getByTestId('side-rail-pending-99');
    await user.click(item);
    expect(onClick).toHaveBeenCalledWith(expect.objectContaining({ id: 99 }));
  });
});
