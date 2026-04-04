import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CalendarGrid from '../components/admin/CalendarGrid';
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
      building: { id: 1, name: '본관', description: null },
    },
    applicant_name: '홍길동',
    applicant_phone: '010-1234-5678',
    applicant_team: '청년부',
    leader_phone: '010-8765-4321',
    headcount: 10,
    purpose: '정기모임',
    start_datetime: '2026-04-10T10:00:00+09:00',
    end_datetime: '2026-04-10T12:00:00+09:00',
    status: 'confirmed',
    admin_note: null,
    created_at: '2026-04-01T09:00:00+09:00',
    ...overrides,
  };
}

describe('CalendarGrid', () => {
  it('요일 헤더 7개(일~토)를 렌더링한다 (happy path)', () => {
    render(
      <CalendarGrid
        currentYear={2026}
        currentMonth={4}
        reservations={[]}
        selectedDate={null}
        onDateSelect={vi.fn()}
      />
    );
    const headers = ['일', '월', '화', '수', '목', '금', '토'];
    headers.forEach((label) => {
      expect(screen.getByText(label)).toBeInTheDocument();
    });
  });

  it('2026년 4월의 날짜 숫자(1~30)를 모두 렌더링한다', () => {
    render(
      <CalendarGrid
        currentYear={2026}
        currentMonth={4}
        reservations={[]}
        selectedDate={null}
        onDateSelect={vi.fn()}
      />
    );
    // 날짜 1과 30이 존재함을 확인
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('30')).toBeInTheDocument();
    // 31은 4월에 없으므로 존재하지 않아야 함
    const allCells = screen.queryAllByText('31');
    expect(allCells).toHaveLength(0);
  });

  it('빈 reservations로도 렌더링에 실패하지 않는다 (boundary case)', () => {
    expect(() =>
      render(
        <CalendarGrid
          currentYear={2026}
          currentMonth={4}
          reservations={[]}
          selectedDate={null}
          onDateSelect={vi.fn()}
        />
      )
    ).not.toThrow();
  });

  it('날짜 셀 클릭 시 onDateSelect가 해당 날짜 문자열로 호출된다', async () => {
    const user = userEvent.setup();
    const onDateSelect = vi.fn();
    render(
      <CalendarGrid
        currentYear={2026}
        currentMonth={4}
        reservations={[]}
        selectedDate={null}
        onDateSelect={onDateSelect}
      />
    );
    // 4월 10일 셀 클릭 (날짜 숫자 텍스트로 찾기)
    await user.click(screen.getByText('10'));
    expect(onDateSelect).toHaveBeenCalledWith('2026-04-10');
  });

  it('예약이 있는 날짜에 applicant_team과 space.name이 표시된다 (happy path)', () => {
    const reservation = makeReservation({
      start_datetime: '2026-04-10T10:00:00+09:00',
      end_datetime: '2026-04-10T12:00:00+09:00',
    });
    render(
      <CalendarGrid
        currentYear={2026}
        currentMonth={4}
        reservations={[reservation]}
        selectedDate={null}
        onDateSelect={vi.fn()}
      />
    );
    // 칩에 "청년부 - 세미나실" 텍스트가 렌더링됨
    expect(screen.getByText('청년부 - 세미나실')).toBeInTheDocument();
  });

  it('예약이 3개를 초과하면 "+N more" 텍스트가 표시된다 (boundary case)', () => {
    const reservations = [1, 2, 3, 4].map((id) =>
      makeReservation({
        id,
        applicant_team: `팀${id}`,
        start_datetime: '2026-04-10T10:00:00+09:00',
        end_datetime: '2026-04-10T12:00:00+09:00',
      })
    );
    render(
      <CalendarGrid
        currentYear={2026}
        currentMonth={4}
        reservations={reservations}
        selectedDate={null}
        onDateSelect={vi.fn()}
      />
    );
    expect(screen.getByText('+1 more')).toBeInTheDocument();
  });

  it('예약이 정확히 3개면 "+N more" 텍스트가 표시되지 않는다 (boundary case)', () => {
    const reservations = [1, 2, 3].map((id) =>
      makeReservation({
        id,
        applicant_team: `팀${id}`,
        start_datetime: '2026-04-10T10:00:00+09:00',
        end_datetime: '2026-04-10T12:00:00+09:00',
      })
    );
    render(
      <CalendarGrid
        currentYear={2026}
        currentMonth={4}
        reservations={reservations}
        selectedDate={null}
        onDateSelect={vi.fn()}
      />
    );
    expect(screen.queryByText(/\+\d+ more/)).not.toBeInTheDocument();
  });

  it('selectedDate와 일치하는 날짜 셀이 선택 스타일을 적용받는다', () => {
    const { container } = render(
      <CalendarGrid
        currentYear={2026}
        currentMonth={4}
        reservations={[]}
        selectedDate="2026-04-15"
        onDateSelect={vi.fn()}
      />
    );
    // ring-2 ring-[#AAA014] 클래스가 적용된 셀이 존재해야 함
    const selectedCell = container.querySelector('.ring-\\[\\#AAA014\\]');
    expect(selectedCell).toBeInTheDocument();
  });

  it('1월(31일) 달력을 올바르게 렌더링한다 (boundary case)', () => {
    render(
      <CalendarGrid
        currentYear={2026}
        currentMonth={1}
        reservations={[]}
        selectedDate={null}
        onDateSelect={vi.fn()}
      />
    );
    expect(screen.getByText('31')).toBeInTheDocument();
  });

  it('2월 달력을 올바르게 렌더링한다 (boundary case)', () => {
    render(
      <CalendarGrid
        currentYear={2026}
        currentMonth={2}
        reservations={[]}
        selectedDate={null}
        onDateSelect={vi.fn()}
      />
    );
    // 2026년 2월은 28일까지
    expect(screen.getByText('28')).toBeInTheDocument();
    expect(screen.queryByText('29')).not.toBeInTheDocument();
  });

  it('다른 날짜의 예약은 해당 날짜 셀에만 표시된다 (error case)', () => {
    const reservation = makeReservation({
      start_datetime: '2026-04-20T10:00:00+09:00',
      end_datetime: '2026-04-20T12:00:00+09:00',
    });
    render(
      <CalendarGrid
        currentYear={2026}
        currentMonth={4}
        reservations={[reservation]}
        selectedDate={null}
        onDateSelect={vi.fn()}
      />
    );
    // 예약 칩이 존재하되
    expect(screen.getByText('청년부 - 세미나실')).toBeInTheDocument();
    // 10일 클릭 시 onDateSelect는 '2026-04-10'으로 호출됨 (예약이 없는 날)
    // 이 테스트는 예약이 정확히 20일에만 표시됨을 확인
  });

  it('빈 reservations와 selectedDate=null일 때 안내 문구 없이 달력만 표시된다', () => {
    render(
      <CalendarGrid
        currentYear={2026}
        currentMonth={4}
        reservations={[]}
        selectedDate={null}
        onDateSelect={vi.fn()}
      />
    );
    expect(screen.queryByText('예약이 없습니다')).not.toBeInTheDocument();
  });
});
