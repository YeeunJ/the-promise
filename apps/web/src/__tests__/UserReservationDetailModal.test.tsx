import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UserReservationDetailModal } from '../components/my/UserReservationDetailModal';
import type { Reservation } from '../types';

function makeReservation(overrides: Partial<Reservation> = {}): Reservation {
  return {
    id: 42,
    space: {
      id: 1,
      building: { id: 1, name: '가나안홀', description: null },
      name: '물댄동산방',
      floor: 3,
      capacity: 20,
      description: null,
    },
    applicant_name: '홍길동',
    applicant_phone: '010-1234-5678',
    applicant_team: '청년부',
    team: 2,
    custom_team_name: null,
    leader_phone: '010-0000-0000',
    headcount: 10,
    purpose: '예배 / 기도회',
    start_datetime: '2099-12-31T13:00:00+09:00',
    end_datetime: '2099-12-31T13:30:00+09:00',
    status: 'confirmed',
    admin_note: null,
    created_at: '2026-05-13T00:00:00+09:00',
    ...overrides,
  };
}

describe('UserReservationDetailModal', () => {
  it('isOpen=false 면 렌더되지 않음', () => {
    const { container } = render(
      <UserReservationDetailModal
        isOpen={false}
        reservation={makeReservation()}
        onClose={vi.fn()}
        onCancel={vi.fn()}
      />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('isOpen=true: 헤더 배너에 reservation id + 예약 상세 + status 칩 표시', () => {
    render(
      <UserReservationDetailModal
        isOpen
        reservation={makeReservation()}
        onClose={vi.fn()}
        onCancel={vi.fn()}
      />,
    );
    expect(screen.getByText(/RESERVATION.*#42/)).toBeInTheDocument();
    expect(screen.getByText('예약 상세')).toBeInTheDocument();
    expect(screen.getByText('확정')).toBeInTheDocument();
  });

  it('3 섹션 (장소/일시 · 신청자 · 예약) 표시', () => {
    render(
      <UserReservationDetailModal
        isOpen
        reservation={makeReservation()}
        onClose={vi.fn()}
        onCancel={vi.fn()}
      />,
    );
    expect(screen.getByText('장소 및 일시')).toBeInTheDocument();
    expect(screen.getByText('신청자 정보')).toBeInTheDocument();
    expect(screen.getByText('예약 정보')).toBeInTheDocument();
    expect(screen.getByText('가나안홀')).toBeInTheDocument();
    expect(screen.getByText('물댄동산방')).toBeInTheDocument();
    expect(screen.getByText('홍길동')).toBeInTheDocument();
    expect(screen.getByText('010-1234-5678')).toBeInTheDocument();
    expect(screen.getByText('10명')).toBeInTheDocument();
  });

  it('취소 가능한 상태 (confirmed/pending) 면 취소 버튼 표시', () => {
    const onCancel = vi.fn();
    render(
      <UserReservationDetailModal
        isOpen
        reservation={makeReservation({ status: 'pending' })}
        onClose={vi.fn()}
        onCancel={onCancel}
      />,
    );
    expect(screen.getByRole('button', { name: /예약 취소/ })).toBeInTheDocument();
  });

  it('이미 취소된 예약이면 취소 버튼 미표시', () => {
    render(
      <UserReservationDetailModal
        isOpen
        reservation={makeReservation({ status: 'cancelled' })}
        onClose={vi.fn()}
        onCancel={vi.fn()}
      />,
    );
    expect(screen.queryByRole('button', { name: /예약 취소/ })).not.toBeInTheDocument();
  });

  it('닫기 버튼 클릭 → onClose', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(
      <UserReservationDetailModal
        isOpen
        reservation={makeReservation()}
        onClose={onClose}
        onCancel={vi.fn()}
      />,
    );
    await user.click(screen.getByRole('button', { name: '닫기' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('취소 버튼 클릭 → 확인 다이얼로그 표시 (onCancel 즉시 호출 안 됨)', async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    render(
      <UserReservationDetailModal
        isOpen
        reservation={makeReservation()}
        onClose={vi.fn()}
        onCancel={onCancel}
      />,
    );
    await user.click(screen.getByRole('button', { name: /예약 취소/ }));
    expect(onCancel).not.toHaveBeenCalled();
    expect(screen.getByRole('alertdialog', { name: '예약 취소 확인' })).toBeInTheDocument();
  });

  it('확인 다이얼로그에서 "예, 취소합니다" 클릭 → onCancel(reservationId)', async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    render(
      <UserReservationDetailModal
        isOpen
        reservation={makeReservation()}
        onClose={vi.fn()}
        onCancel={onCancel}
      />,
    );
    await user.click(screen.getByRole('button', { name: /예약 취소/ }));
    await user.click(screen.getByRole('button', { name: '예, 취소합니다' }));
    expect(onCancel).toHaveBeenCalledWith(42);
  });

  it('확인 다이얼로그에서 "아니오" 클릭 → 확인 단계 닫히고 onCancel 호출 안 됨', async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    render(
      <UserReservationDetailModal
        isOpen
        reservation={makeReservation()}
        onClose={vi.fn()}
        onCancel={onCancel}
      />,
    );
    await user.click(screen.getByRole('button', { name: /예약 취소/ }));
    await user.click(screen.getByRole('button', { name: '아니오' }));
    expect(onCancel).not.toHaveBeenCalled();
    expect(screen.queryByRole('alertdialog', { name: '예약 취소 확인' })).not.toBeInTheDocument();
  });
});
