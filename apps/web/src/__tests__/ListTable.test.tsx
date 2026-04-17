import { describe, it, expect, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ListTable } from '../components/admin/ListTable';
import type { Reservation } from '../types';

function makeReservation(overrides: Partial<Reservation> = {}): Reservation {
  return {
    id: 1,
    space: {
      id: 1,
      name: '세미나실',
      floor: 2,
      capacity: 20,
      description: null,
      building: { id: 1, name: '본당', description: null },
    },
    applicant_name: '홍길동',
    applicant_phone: '010-1234-5678',
    applicant_team: '청년부',
    team: null,
    custom_team_name: null,
    leader_phone: '010-8765-4321',
    headcount: 10,
    purpose: '정기모임',
    start_datetime: '2026-04-16T10:00:00+09:00',
    end_datetime: '2026-04-16T12:00:00+09:00',
    status: 'confirmed',
    admin_note: null,
    created_at: '2026-04-01T09:00:00+09:00',
    ...overrides,
  };
}

describe('ListTable', () => {
  describe('테이블 헤더', () => {
    it('"전체 예약 N건" 건수를 표시한다', () => {
      const reservations = [
        makeReservation({ id: 1 }),
        makeReservation({ id: 2 }),
      ];

      render(<ListTable reservations={reservations} onCancelRequest={vi.fn()} />);

      expect(screen.getByText(/전체 예약 2건/)).toBeInTheDocument();
    });

    it('예약이 0건일 때 "전체 예약 0건"을 표시한다', () => {
      render(<ListTable reservations={[]} onCancelRequest={vi.fn()} />);

      expect(screen.getByText(/전체 예약 0건/)).toBeInTheDocument();
    });
  });

  describe('10개 컬럼 렌더링', () => {
    it('모든 컬럼 헤더를 표시한다', () => {
      render(<ListTable reservations={[]} onCancelRequest={vi.fn()} />);

      expect(screen.getByText('날짜')).toBeInTheDocument();
      expect(screen.getByText('건물')).toBeInTheDocument();
      expect(screen.getByText('장소')).toBeInTheDocument();
      expect(screen.getByText('시간')).toBeInTheDocument();
      expect(screen.getByText('이름')).toBeInTheDocument();
      expect(screen.getByText('부서')).toBeInTheDocument();
      expect(screen.getByText('인원')).toBeInTheDocument();
      expect(screen.getByText('목적')).toBeInTheDocument();
      expect(screen.getByText('상태')).toBeInTheDocument();
      expect(screen.getByText('액션')).toBeInTheDocument();
    });

    it('예약 데이터의 각 컬럼을 올바르게 렌더링한다', () => {
      const reservation = makeReservation({
        start_datetime: '2026-04-16T10:00:00+09:00',
        end_datetime: '2026-04-16T12:00:00+09:00',
        applicant_name: '홍길동',
        applicant_team: '청년부',
        headcount: 10,
        purpose: '정기모임',
        status: 'confirmed',
      });

      render(<ListTable reservations={[reservation]} onCancelRequest={vi.fn()} />);

      // 날짜: "04.16"
      expect(screen.getByText('04.16')).toBeInTheDocument();
      // 건물
      expect(screen.getByText('본당')).toBeInTheDocument();
      // 장소
      expect(screen.getByText('세미나실')).toBeInTheDocument();
      // 시간
      expect(screen.getByText('10:00-12:00')).toBeInTheDocument();
      // 이름
      expect(screen.getByText('홍길동')).toBeInTheDocument();
      // 부서
      expect(screen.getByText('청년부')).toBeInTheDocument();
      // 인원
      expect(screen.getByText('10')).toBeInTheDocument();
      // 목적
      expect(screen.getByText('정기모임')).toBeInTheDocument();
      // 상태: StatusBadge로 "확정" 표시
      expect(screen.getByText('확정')).toBeInTheDocument();
    });
  });

  describe('날짜 포맷', () => {
    it('start_datetime에서 "MM.DD" 형태로 날짜를 표시한다', () => {
      const reservation = makeReservation({
        start_datetime: '2026-01-05T09:00:00+09:00',
        end_datetime: '2026-01-05T11:00:00+09:00',
      });

      render(<ListTable reservations={[reservation]} onCancelRequest={vi.fn()} />);

      expect(screen.getByText('01.05')).toBeInTheDocument();
    });
  });

  describe('건물 컬러 배지', () => {
    it('건물명에 따른 컬러 배지를 인라인 스타일로 렌더링한다', () => {
      const reservation = makeReservation();

      render(<ListTable reservations={[reservation]} onCancelRequest={vi.fn()} />);

      const badge = screen.getByText('본당');
      expect(badge).toHaveStyle({ backgroundColor: '#EFF6FF', color: '#2563EB' });
    });

    it('알 수 없는 건물에 기본 컬러를 적용한다', () => {
      const reservation = makeReservation({
        space: {
          id: 99,
          name: '기타실',
          floor: 1,
          capacity: 10,
          description: null,
          building: { id: 99, name: '알수없는건물', description: null },
        },
      });

      render(<ListTable reservations={[reservation]} onCancelRequest={vi.fn()} />);

      const badge = screen.getByText('알수없는건물');
      expect(badge).toHaveStyle({ backgroundColor: '#F9FAFB', color: '#6B7280' });
    });
  });

  describe('정렬', () => {
    it('날짜순 오름차순으로 정렬한다', () => {
      const reservations = [
        makeReservation({ id: 1, start_datetime: '2026-04-18T10:00:00+09:00', end_datetime: '2026-04-18T12:00:00+09:00' }),
        makeReservation({ id: 2, start_datetime: '2026-04-16T10:00:00+09:00', end_datetime: '2026-04-16T12:00:00+09:00' }),
        makeReservation({ id: 3, start_datetime: '2026-04-17T10:00:00+09:00', end_datetime: '2026-04-17T12:00:00+09:00' }),
      ];

      render(<ListTable reservations={reservations} onCancelRequest={vi.fn()} />);

      const rows = screen.getAllByRole('row').slice(1); // 헤더 제외
      expect(within(rows[0]).getByText('04.16')).toBeInTheDocument();
      expect(within(rows[1]).getByText('04.17')).toBeInTheDocument();
      expect(within(rows[2]).getByText('04.18')).toBeInTheDocument();
    });

    it('같은 날짜 내에서 start_datetime 오름차순으로 정렬한다', () => {
      const reservations = [
        makeReservation({ id: 1, start_datetime: '2026-04-16T14:00:00+09:00', end_datetime: '2026-04-16T16:00:00+09:00' }),
        makeReservation({ id: 2, start_datetime: '2026-04-16T09:00:00+09:00', end_datetime: '2026-04-16T11:00:00+09:00' }),
      ];

      render(<ListTable reservations={reservations} onCancelRequest={vi.fn()} />);

      const rows = screen.getAllByRole('row').slice(1);
      expect(within(rows[0]).getByText('09:00-11:00')).toBeInTheDocument();
      expect(within(rows[1]).getByText('14:00-16:00')).toBeInTheDocument();
    });
  });

  describe('취소하기 버튼', () => {
    it('confirmed 상태에서 취소하기 버튼이 활성화된다', () => {
      const reservation = makeReservation({ status: 'confirmed' });

      render(<ListTable reservations={[reservation]} onCancelRequest={vi.fn()} />);

      const button = screen.getByRole('button', { name: '취소하기' });
      expect(button).not.toBeDisabled();
    });

    it('pending 상태에서 취소하기 버튼이 활성화된다', () => {
      const reservation = makeReservation({ status: 'pending' });

      render(<ListTable reservations={[reservation]} onCancelRequest={vi.fn()} />);

      const button = screen.getByRole('button', { name: '취소하기' });
      expect(button).not.toBeDisabled();
    });

    it('rejected 상태에서 취소하기 버튼이 비활성화된다', () => {
      const reservation = makeReservation({ status: 'rejected' });

      render(<ListTable reservations={[reservation]} onCancelRequest={vi.fn()} />);

      const button = screen.getByRole('button', { name: '취소하기' });
      expect(button).toBeDisabled();
    });

    it('cancelled 상태에서 취소하기 버튼이 비활성화된다', () => {
      const reservation = makeReservation({ status: 'cancelled' });

      render(<ListTable reservations={[reservation]} onCancelRequest={vi.fn()} />);

      const button = screen.getByRole('button', { name: '취소하기' });
      expect(button).toBeDisabled();
    });

    it('클릭 시 onCancelRequest를 reservation.id와 함께 호출한다', async () => {
      const user = userEvent.setup();
      const onCancelRequest = vi.fn();
      const reservation = makeReservation({ id: 42, status: 'confirmed' });

      render(<ListTable reservations={[reservation]} onCancelRequest={onCancelRequest} />);

      await user.click(screen.getByRole('button', { name: '취소하기' }));

      expect(onCancelRequest).toHaveBeenCalledWith(42);
      expect(onCancelRequest).toHaveBeenCalledTimes(1);
    });
  });

  describe('StatusBadge 재사용', () => {
    it('각 상태에 맞는 StatusBadge를 렌더링한다', () => {
      const reservations = [
        makeReservation({ id: 1, status: 'confirmed' }),
        makeReservation({ id: 2, status: 'pending' }),
        makeReservation({ id: 3, status: 'rejected' }),
        makeReservation({ id: 4, status: 'cancelled' }),
      ];

      render(<ListTable reservations={reservations} onCancelRequest={vi.fn()} />);

      expect(screen.getByText('확정')).toBeInTheDocument();
      expect(screen.getByText('대기')).toBeInTheDocument();
      expect(screen.getByText('거절')).toBeInTheDocument();
      expect(screen.getByText('취소')).toBeInTheDocument();
    });
  });

  describe('입력 데이터 불변성', () => {
    it('원본 reservations 배열을 변경하지 않는다', () => {
      const reservations = [
        makeReservation({ id: 1, start_datetime: '2026-04-18T10:00:00+09:00', end_datetime: '2026-04-18T12:00:00+09:00' }),
        makeReservation({ id: 2, start_datetime: '2026-04-16T10:00:00+09:00', end_datetime: '2026-04-16T12:00:00+09:00' }),
      ];
      const original = [...reservations];

      render(<ListTable reservations={reservations} onCancelRequest={vi.fn()} />);

      expect(reservations[0].id).toBe(original[0].id);
      expect(reservations[1].id).toBe(original[1].id);
    });
  });
});
