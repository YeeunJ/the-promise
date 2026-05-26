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

      render(<ListTable reservations={reservations} onCancelRequest={vi.fn()} onDetailRequest={vi.fn()} />);

      expect(screen.getByText(/전체 예약 2건/)).toBeInTheDocument();
    });

    it('예약이 0건일 때 "전체 예약 0건"을 표시한다', () => {
      render(<ListTable reservations={[]} onCancelRequest={vi.fn()} onDetailRequest={vi.fn()} />);

      expect(screen.getByText(/전체 예약 0건/)).toBeInTheDocument();
    });
  });

  describe('10개 컬럼 렌더링', () => {
    it('모든 컬럼 헤더를 표시한다', () => {
      render(<ListTable reservations={[]} onCancelRequest={vi.fn()} onDetailRequest={vi.fn()} />);

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

      render(<ListTable reservations={[reservation]} onCancelRequest={vi.fn()} onDetailRequest={vi.fn()} />);

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

      render(<ListTable reservations={[reservation]} onCancelRequest={vi.fn()} onDetailRequest={vi.fn()} />);

      expect(screen.getByText('01.05')).toBeInTheDocument();
    });
  });

  describe('건물 컬러 배지', () => {
    it('건물명에 따른 컬러 배지를 인라인 스타일로 렌더링한다', () => {
      const reservation = makeReservation();

      render(<ListTable reservations={[reservation]} onCancelRequest={vi.fn()} onDetailRequest={vi.fn()} />);

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

      render(<ListTable reservations={[reservation]} onCancelRequest={vi.fn()} onDetailRequest={vi.fn()} />);

      const badge = screen.getByText('알수없는건물');
      expect(badge).toHaveStyle({ backgroundColor: '#F9FAFB', color: '#6B7280' });
    });
  });

  describe('정렬 (서버 위임)', () => {
    // 정렬은 백엔드 ordering 파라미터가 책임. 컴포넌트는 받은 순서를 그대로 렌더한다.
    it('받은 reservations 순서를 그대로 유지한다 (클라이언트 측 재정렬 없음)', () => {
      const reservations = [
        makeReservation({ id: 1, start_datetime: '2026-04-18T10:00:00+09:00', end_datetime: '2026-04-18T12:00:00+09:00' }),
        makeReservation({ id: 2, start_datetime: '2026-04-16T10:00:00+09:00', end_datetime: '2026-04-16T12:00:00+09:00' }),
        makeReservation({ id: 3, start_datetime: '2026-04-17T10:00:00+09:00', end_datetime: '2026-04-17T12:00:00+09:00' }),
      ];

      render(<ListTable reservations={reservations} onCancelRequest={vi.fn()} onDetailRequest={vi.fn()} />);

      const rows = screen.getAllByRole('row').slice(1);
      expect(within(rows[0]).getByText('04.18')).toBeInTheDocument();
      expect(within(rows[1]).getByText('04.16')).toBeInTheDocument();
      expect(within(rows[2]).getByText('04.17')).toBeInTheDocument();
    });
  });

  describe('정렬 헤더 토글', () => {
    it('"날짜" 헤더가 버튼 컨트롤을 가진다 (ordering prop 있을 때)', () => {
      render(
        <ListTable
          reservations={[]}
          onCancelRequest={vi.fn()}
          onDetailRequest={vi.fn()}
          ordering="-start_datetime"
          onOrderingChange={vi.fn()}
        />,
      );

      expect(screen.getByRole('button', { name: /날짜/ })).toBeInTheDocument();
    });

    it('ordering="-start_datetime" 이면 ↓ 아이콘이 표시되고 aria-sort=descending', () => {
      render(
        <ListTable
          reservations={[]}
          onCancelRequest={vi.fn()}
          onDetailRequest={vi.fn()}
          ordering="-start_datetime"
          onOrderingChange={vi.fn()}
        />,
      );

      expect(screen.getByRole('button', { name: /날짜/ })).toHaveTextContent('↓');
      expect(
        screen.getByRole('columnheader', { name: /날짜/ }),
      ).toHaveAttribute('aria-sort', 'descending');
    });

    it('ordering="start_datetime" 이면 ↑ 아이콘이 표시되고 aria-sort=ascending', () => {
      render(
        <ListTable
          reservations={[]}
          onCancelRequest={vi.fn()}
          onDetailRequest={vi.fn()}
          ordering="start_datetime"
          onOrderingChange={vi.fn()}
        />,
      );

      expect(screen.getByRole('button', { name: /날짜/ })).toHaveTextContent('↑');
      expect(
        screen.getByRole('columnheader', { name: /날짜/ }),
      ).toHaveAttribute('aria-sort', 'ascending');
    });

    it('"날짜" 헤더 클릭 시 ordering 이 desc → asc 로 토글된다', async () => {
      const handle = vi.fn();
      render(
        <ListTable
          reservations={[]}
          onCancelRequest={vi.fn()}
          onDetailRequest={vi.fn()}
          ordering="-start_datetime"
          onOrderingChange={handle}
        />,
      );

      await userEvent.click(screen.getByRole('button', { name: /날짜/ }));
      expect(handle).toHaveBeenCalledWith('start_datetime');
    });

    it('"날짜" 헤더 클릭 시 ordering 이 asc → desc 로 토글된다', async () => {
      const handle = vi.fn();
      render(
        <ListTable
          reservations={[]}
          onCancelRequest={vi.fn()}
          onDetailRequest={vi.fn()}
          ordering="start_datetime"
          onOrderingChange={handle}
        />,
      );

      await userEvent.click(screen.getByRole('button', { name: /날짜/ }));
      expect(handle).toHaveBeenCalledWith('-start_datetime');
    });

    it('ordering prop 이 없으면 "날짜" 헤더는 일반 텍스트로 표시된다 (버튼 없음)', () => {
      render(
        <ListTable
          reservations={[]}
          onCancelRequest={vi.fn()}
          onDetailRequest={vi.fn()}
        />,
      );

      expect(
        screen.queryByRole('button', { name: /날짜/ }),
      ).not.toBeInTheDocument();
      expect(screen.getByText('날짜')).toBeInTheDocument();
    });
  });

  describe('취소하기 버튼', () => {
    it('confirmed 상태에서 취소하기 버튼이 활성화된다', () => {
      const reservation = makeReservation({ status: 'confirmed' });

      render(<ListTable reservations={[reservation]} onCancelRequest={vi.fn()} onDetailRequest={vi.fn()} />);

      const button = screen.getByRole('button', { name: '취소하기' });
      expect(button).not.toBeDisabled();
    });

    it('pending 상태에서 취소하기 버튼이 활성화된다', () => {
      const reservation = makeReservation({ status: 'pending' });

      render(<ListTable reservations={[reservation]} onCancelRequest={vi.fn()} onDetailRequest={vi.fn()} />);

      const button = screen.getByRole('button', { name: '취소하기' });
      expect(button).not.toBeDisabled();
    });

    it('rejected 상태에서 취소하기 버튼이 표시되지 않는다', () => {
      const reservation = makeReservation({ status: 'rejected' });

      render(<ListTable reservations={[reservation]} onCancelRequest={vi.fn()} onDetailRequest={vi.fn()} />);

      expect(screen.queryByRole('button', { name: '취소하기' })).not.toBeInTheDocument();
    });

    it('cancelled 상태에서 취소하기 버튼이 표시되지 않는다', () => {
      const reservation = makeReservation({ status: 'cancelled' });

      render(<ListTable reservations={[reservation]} onCancelRequest={vi.fn()} onDetailRequest={vi.fn()} />);

      expect(screen.queryByRole('button', { name: '취소하기' })).not.toBeInTheDocument();
    });

    it('클릭 시 onCancelRequest를 reservation.id와 함께 호출한다', async () => {
      const user = userEvent.setup();
      const onCancelRequest = vi.fn();
      const reservation = makeReservation({ id: 42, status: 'confirmed' });

      render(<ListTable reservations={[reservation]} onCancelRequest={onCancelRequest} onDetailRequest={vi.fn()} />);

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

      render(<ListTable reservations={reservations} onCancelRequest={vi.fn()} onDetailRequest={vi.fn()} />);

      expect(screen.getByText('확정')).toBeInTheDocument();
      expect(screen.getByText('대기')).toBeInTheDocument();
      expect(screen.getByText('거절')).toBeInTheDocument();
      expect(screen.getByText('취소')).toBeInTheDocument();
    });
  });

  describe('빈 결과 메시지', () => {
    it('reservations 가 0건이고 searchQuery 가 없으면 기본 안내가 표시된다', () => {
      render(
        <ListTable
          reservations={[]}
          onCancelRequest={vi.fn()}
          onDetailRequest={vi.fn()}
        />,
      );

      expect(screen.getByText('조회된 예약이 없습니다.')).toBeInTheDocument();
    });

    it('reservations 가 0건이고 searchQuery 가 있으면 검색어를 노출한 메시지를 표시한다', () => {
      render(
        <ListTable
          reservations={[]}
          onCancelRequest={vi.fn()}
          onDetailRequest={vi.fn()}
          searchQuery="홍길동"
        />,
      );

      expect(
        screen.getByText("검색어 '홍길동'에 해당하는 예약이 없습니다."),
      ).toBeInTheDocument();
    });

    it('reservations 가 1건 이상이면 빈 결과 메시지를 표시하지 않는다', () => {
      render(
        <ListTable
          reservations={[makeReservation()]}
          onCancelRequest={vi.fn()}
          onDetailRequest={vi.fn()}
          searchQuery="홍길동"
        />,
      );

      expect(
        screen.queryByText("검색어 '홍길동'에 해당하는 예약이 없습니다."),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByText('조회된 예약이 없습니다.'),
      ).not.toBeInTheDocument();
    });
  });

  describe('입력 데이터 불변성', () => {
    it('원본 reservations 배열을 변경하지 않는다', () => {
      const reservations = [
        makeReservation({ id: 1, start_datetime: '2026-04-18T10:00:00+09:00', end_datetime: '2026-04-18T12:00:00+09:00' }),
        makeReservation({ id: 2, start_datetime: '2026-04-16T10:00:00+09:00', end_datetime: '2026-04-16T12:00:00+09:00' }),
      ];
      const original = [...reservations];

      render(<ListTable reservations={reservations} onCancelRequest={vi.fn()} onDetailRequest={vi.fn()} />);

      expect(reservations[0].id).toBe(original[0].id);
      expect(reservations[1].id).toBe(original[1].id);
    });
  });
});
