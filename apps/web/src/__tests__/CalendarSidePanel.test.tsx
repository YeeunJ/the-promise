import { describe, it, expect, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CalendarSidePanel } from '../components/admin/CalendarSidePanel';
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

describe('CalendarSidePanel', () => {
  describe('날짜 미선택 시', () => {
    it('"날짜를 선택해주세요" 안내 메시지를 표시한다', () => {
      render(
        <CalendarSidePanel
          selectedDate={null}
          reservations={[]}
          onCancelRequest={vi.fn()}
        />
      );

      expect(screen.getByText('날짜를 선택해주세요')).toBeInTheDocument();
    });
  });

  describe('빈 날짜 선택 시', () => {
    it('"예약이 없습니다" 메시지를 표시한다', () => {
      render(
        <CalendarSidePanel
          selectedDate="2026-04-16"
          reservations={[]}
          onCancelRequest={vi.fn()}
        />
      );

      expect(screen.getByText('예약이 없습니다')).toBeInTheDocument();
    });
  });

  describe('날짜 헤더', () => {
    it('선택된 날짜를 "YYYY.MM.DD (요일)" 형식으로 표시하고 건수를 보여준다', () => {
      const reservations = [
        makeReservation({ id: 1 }),
        makeReservation({ id: 2, start_datetime: '2026-04-16T14:00:00+09:00' }),
      ];

      render(
        <CalendarSidePanel
          selectedDate="2026-04-16"
          reservations={reservations}
          onCancelRequest={vi.fn()}
        />
      );

      expect(screen.getByText(/2026\.04\.16/)).toBeInTheDocument();
      // "2건" appears in header count and building group count
      const countElements = screen.getAllByText(/2건/);
      expect(countElements.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('건물별 그룹핑', () => {
    const reservations = [
      makeReservation({
        id: 1,
        space: {
          id: 1,
          name: '세미나실',
          floor: 2,
          capacity: 20,
          description: null,
          building: { id: 1, name: '본당', description: null },
        },
        start_datetime: '2026-04-16T10:00:00+09:00',
        end_datetime: '2026-04-16T12:00:00+09:00',
      }),
      makeReservation({
        id: 2,
        space: {
          id: 2,
          name: '대강당',
          floor: 1,
          capacity: 100,
          description: null,
          building: { id: 2, name: '가나안홀', description: null },
        },
        start_datetime: '2026-04-16T14:00:00+09:00',
        end_datetime: '2026-04-16T16:00:00+09:00',
        applicant_team: '장년부',
      }),
      makeReservation({
        id: 3,
        space: {
          id: 3,
          name: '소강당',
          floor: 1,
          capacity: 50,
          description: null,
          building: { id: 1, name: '본당', description: null },
        },
        start_datetime: '2026-04-16T09:00:00+09:00',
        end_datetime: '2026-04-16T10:00:00+09:00',
        applicant_name: '김철수',
        applicant_team: '장년부',
      }),
    ];

    it('건물 그룹 헤더에 건물명과 건수를 표시한다', () => {
      render(
        <CalendarSidePanel
          selectedDate="2026-04-16"
          reservations={reservations}
          onCancelRequest={vi.fn()}
        />
      );

      // Building names appear in both legend and group headers
      expect(screen.getAllByText(/본당/).length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText(/가나안홀/).length).toBeGreaterThanOrEqual(1);
    });

    it('건물 범례에 해당 날짜에 예약이 있는 건물만 표시한다', () => {
      render(
        <CalendarSidePanel
          selectedDate="2026-04-16"
          reservations={reservations}
          onCancelRequest={vi.fn()}
        />
      );

      const legend = screen.getByTestId('building-legend');
      expect(within(legend).getByText('본당')).toBeInTheDocument();
      expect(within(legend).getByText('가나안홀')).toBeInTheDocument();
    });

    it('다른 날짜의 예약은 필터링하여 표시하지 않는다', () => {
      const mixedReservations = [
        makeReservation({ id: 1, start_datetime: '2026-04-16T10:00:00+09:00' }),
        makeReservation({ id: 2, start_datetime: '2026-04-17T10:00:00+09:00' }),
      ];

      render(
        <CalendarSidePanel
          selectedDate="2026-04-16"
          reservations={mixedReservations}
          onCancelRequest={vi.fn()}
        />
      );

      // "1건" appears in both header count and building group count
      const countElements = screen.getAllByText(/1건/);
      expect(countElements.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('예약 행 데이터', () => {
    it('장소, 시간, 부서, 이름, 인원, 목적을 표시한다', () => {
      const reservations = [
        makeReservation({
          id: 1,
          applicant_name: '홍길동',
          applicant_team: '청년부',
          headcount: 10,
          purpose: '정기모임',
          start_datetime: '2026-04-16T10:00:00+09:00',
          end_datetime: '2026-04-16T12:00:00+09:00',
        }),
      ];

      render(
        <CalendarSidePanel
          selectedDate="2026-04-16"
          reservations={reservations}
          onCancelRequest={vi.fn()}
        />
      );

      expect(screen.getByText('세미나실')).toBeInTheDocument();
      expect(screen.getByText('10:00-12:00')).toBeInTheDocument();
      expect(screen.getByText('청년부')).toBeInTheDocument();
      expect(screen.getByText('홍길동')).toBeInTheDocument();
      expect(screen.getByText('10')).toBeInTheDocument();
      expect(screen.getByText('정기모임')).toBeInTheDocument();
    });

    it('상태 배지를 표시한다', () => {
      const reservations = [
        makeReservation({ id: 1, status: 'confirmed' }),
      ];

      render(
        <CalendarSidePanel
          selectedDate="2026-04-16"
          reservations={reservations}
          onCancelRequest={vi.fn()}
        />
      );

      expect(screen.getByText('확정')).toBeInTheDocument();
    });
  });

  describe('취소하기 버튼', () => {
    it('confirmed 상태의 예약은 취소하기 버튼이 활성화된다', async () => {
      const onCancelRequest = vi.fn();
      const reservations = [
        makeReservation({ id: 42, status: 'confirmed' }),
      ];

      render(
        <CalendarSidePanel
          selectedDate="2026-04-16"
          reservations={reservations}
          onCancelRequest={onCancelRequest}
        />
      );

      const cancelButton = screen.getByRole('button', { name: '취소하기' });
      expect(cancelButton).not.toBeDisabled();

      await userEvent.click(cancelButton);
      expect(onCancelRequest).toHaveBeenCalledWith(42);
    });

    it('pending 상태의 예약은 취소하기 버튼이 활성화된다', async () => {
      const onCancelRequest = vi.fn();
      const reservations = [
        makeReservation({ id: 10, status: 'pending' }),
      ];

      render(
        <CalendarSidePanel
          selectedDate="2026-04-16"
          reservations={reservations}
          onCancelRequest={onCancelRequest}
        />
      );

      const cancelButton = screen.getByRole('button', { name: '취소하기' });
      expect(cancelButton).not.toBeDisabled();

      await userEvent.click(cancelButton);
      expect(onCancelRequest).toHaveBeenCalledWith(10);
    });

    it('cancelled 상태의 예약은 취소하기 버튼이 비활성화된다', () => {
      const reservations = [
        makeReservation({ id: 1, status: 'cancelled' }),
      ];

      render(
        <CalendarSidePanel
          selectedDate="2026-04-16"
          reservations={reservations}
          onCancelRequest={vi.fn()}
        />
      );

      const cancelButton = screen.getByRole('button', { name: '취소하기' });
      expect(cancelButton).toBeDisabled();
    });

    it('rejected 상태의 예약은 취소하기 버튼이 비활성화된다', () => {
      const reservations = [
        makeReservation({ id: 1, status: 'rejected' }),
      ];

      render(
        <CalendarSidePanel
          selectedDate="2026-04-16"
          reservations={reservations}
          onCancelRequest={vi.fn()}
        />
      );

      const cancelButton = screen.getByRole('button', { name: '취소하기' });
      expect(cancelButton).toBeDisabled();
    });
  });

  describe('confirmed 건수 카운트', () => {
    it('cancelled/rejected 예약은 상단 헤더 및 건물 그룹 건수에서 제외된다', () => {
      const reservations = [
        makeReservation({ id: 1, status: 'confirmed' }),
        makeReservation({ id: 2, status: 'cancelled', start_datetime: '2026-04-16T14:00:00+09:00' }),
      ];
      render(
        <CalendarSidePanel
          selectedDate="2026-04-16"
          reservations={reservations}
          onCancelRequest={vi.fn()}
        />
      );
      // 취소/거절 예약도 행(row)으로는 표시됨
      const rows = screen.getAllByTestId('reservation-row');
      expect(rows.length).toBe(2);
      // 건수 카운트는 confirmed만 → "1건", "2건" 없음
      expect(screen.queryByText('2건')).toBeNull();
      expect(screen.getAllByText('1건').length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('그룹 내 정렬', () => {
    it('같은 건물의 예약은 start_datetime 오름차순으로 정렬한다', () => {
      const reservations = [
        makeReservation({
          id: 1,
          start_datetime: '2026-04-16T14:00:00+09:00',
          end_datetime: '2026-04-16T16:00:00+09:00',
          applicant_name: '나중예약',
        }),
        makeReservation({
          id: 2,
          start_datetime: '2026-04-16T09:00:00+09:00',
          end_datetime: '2026-04-16T10:00:00+09:00',
          applicant_name: '먼저예약',
        }),
      ];

      render(
        <CalendarSidePanel
          selectedDate="2026-04-16"
          reservations={reservations}
          onCancelRequest={vi.fn()}
        />
      );

      const rows = screen.getAllByTestId('reservation-row');
      expect(within(rows[0]).getByText('먼저예약')).toBeInTheDocument();
      expect(within(rows[1]).getByText('나중예약')).toBeInTheDocument();
    });
  });
});
