import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import ReservationPanel from '../components/admin/ReservationPanel';
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

describe('ReservationPanel', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('selectedDate가 null이면 "날짜를 선택하면 예약 목록이 표시됩니다" 안내 메시지를 표시한다', () => {
    render(
      <ReservationPanel
        selectedDate={null}
        reservations={[]}
        onCancelSuccess={vi.fn()}
      />
    );
    expect(screen.getByText('날짜를 선택하면 예약 목록이 표시됩니다')).toBeInTheDocument();
  });

  it('selectedDate가 null이면 헤더에 "예약 목록"을 표시한다', () => {
    render(
      <ReservationPanel
        selectedDate={null}
        reservations={[]}
        onCancelSuccess={vi.fn()}
      />
    );
    expect(screen.getByText('예약 목록')).toBeInTheDocument();
  });

  it('selectedDate가 설정되고 예약이 없으면 "해당 날짜에 예약이 없습니다"를 표시한다 (boundary case)', () => {
    render(
      <ReservationPanel
        selectedDate="2026-04-10"
        reservations={[]}
        onCancelSuccess={vi.fn()}
      />
    );
    expect(screen.getByText('해당 날짜에 예약이 없습니다')).toBeInTheDocument();
  });

  it('selectedDate에 해당하는 예약을 렌더링한다 (happy path)', () => {
    const reservation = makeReservation();
    render(
      <ReservationPanel
        selectedDate="2026-04-10"
        reservations={[reservation]}
        onCancelSuccess={vi.fn()}
      />
    );
    expect(screen.getByText('홍길동 · 청년부')).toBeInTheDocument();
  });

  it('selectedDate에 해당하지 않는 예약은 렌더링하지 않는다 (error case)', () => {
    const reservation = makeReservation({
      start_datetime: '2026-04-15T10:00:00+09:00',
      end_datetime: '2026-04-15T12:00:00+09:00',
    });
    render(
      <ReservationPanel
        selectedDate="2026-04-10"
        reservations={[reservation]}
        onCancelSuccess={vi.fn()}
      />
    );
    expect(screen.queryByText('홍길동 · 청년부')).not.toBeInTheDocument();
    expect(screen.getByText('해당 날짜에 예약이 없습니다')).toBeInTheDocument();
  });

  it('공간명이 "건물 층수 공간이름" 형식으로 표시된다', () => {
    const reservation = makeReservation();
    render(
      <ReservationPanel
        selectedDate="2026-04-10"
        reservations={[reservation]}
        onCancelSuccess={vi.fn()}
      />
    );
    expect(screen.getByText('본관 2층 세미나실')).toBeInTheDocument();
  });

  it('층수가 null인 경우 층수 없이 공간명이 표시된다 (boundary case)', () => {
    const reservation = makeReservation({
      space: {
        id: 1,
        name: '대강당',
        floor: null,
        capacity: 200,
        description: null,
        building: { id: 1, name: '교육관', description: null },
      },
    });
    render(
      <ReservationPanel
        selectedDate="2026-04-10"
        reservations={[reservation]}
        onCancelSuccess={vi.fn()}
      />
    );
    expect(screen.getByText('교육관 대강당')).toBeInTheDocument();
  });

  it('날짜 범위가 "YYYY-MM-DD (요일) HH:mm ~ HH:mm" 형식으로 표시된다', () => {
    const reservation = makeReservation();
    render(
      <ReservationPanel
        selectedDate="2026-04-10"
        reservations={[reservation]}
        onCancelSuccess={vi.fn()}
      />
    );
    expect(screen.getByText('2026-04-10 (금) 10:00 ~ 12:00')).toBeInTheDocument();
  });

  it('confirmed 상태의 예약에 "확정" 배지를 표시한다', () => {
    const reservation = makeReservation({ status: 'confirmed' });
    render(
      <ReservationPanel
        selectedDate="2026-04-10"
        reservations={[reservation]}
        onCancelSuccess={vi.fn()}
      />
    );
    expect(screen.getByText('확정')).toBeInTheDocument();
  });

  it('pending 상태의 예약에 "대기" 배지를 표시한다', () => {
    const reservation = makeReservation({ status: 'pending' });
    render(
      <ReservationPanel
        selectedDate="2026-04-10"
        reservations={[reservation]}
        onCancelSuccess={vi.fn()}
      />
    );
    expect(screen.getByText('대기')).toBeInTheDocument();
  });

  it('rejected 상태의 예약에 "거절" 배지를 표시한다', () => {
    const reservation = makeReservation({ status: 'rejected' });
    render(
      <ReservationPanel
        selectedDate="2026-04-10"
        reservations={[reservation]}
        onCancelSuccess={vi.fn()}
      />
    );
    expect(screen.getByText('거절')).toBeInTheDocument();
  });

  it('cancelled 상태의 예약에 "취소" 배지를 표시한다', () => {
    const reservation = makeReservation({ status: 'cancelled' });
    render(
      <ReservationPanel
        selectedDate="2026-04-10"
        reservations={[reservation]}
        onCancelSuccess={vi.fn()}
      />
    );
    // "취소" 텍스트가 배지와 버튼 두 군데 표시됨 (cancelled 상태에서는 둘 다 "취소")
    const cancelTexts = screen.getAllByText('취소');
    expect(cancelTexts.length).toBeGreaterThanOrEqual(1);
    // span 배지가 존재함을 클래스로 확인
    const badge = cancelTexts.find(
      (el) => el.tagName === 'SPAN'
    );
    expect(badge).toBeInTheDocument();
  });

  it('confirmed/pending 상태의 예약은 취소 버튼이 활성화된다', () => {
    const confirmed = makeReservation({ id: 1, status: 'confirmed' });
    const pending = makeReservation({
      id: 2,
      status: 'pending',
      start_datetime: '2026-04-10T13:00:00+09:00',
      end_datetime: '2026-04-10T14:00:00+09:00',
    });
    render(
      <ReservationPanel
        selectedDate="2026-04-10"
        reservations={[confirmed, pending]}
        onCancelSuccess={vi.fn()}
      />
    );
    const cancelButtons = screen.getAllByRole('button', { name: '취소' });
    cancelButtons.forEach((btn) => {
      expect(btn).not.toBeDisabled();
    });
  });

  it('rejected/cancelled 상태의 예약은 취소 버튼이 비활성화된다 (boundary case)', () => {
    const rejected = makeReservation({ id: 1, status: 'rejected' });
    const cancelled = makeReservation({
      id: 2,
      status: 'cancelled',
      start_datetime: '2026-04-10T13:00:00+09:00',
      end_datetime: '2026-04-10T14:00:00+09:00',
    });
    render(
      <ReservationPanel
        selectedDate="2026-04-10"
        reservations={[rejected, cancelled]}
        onCancelSuccess={vi.fn()}
      />
    );
    const cancelButtons = screen.getAllByRole('button', { name: '취소' });
    cancelButtons.forEach((btn) => {
      expect(btn).toBeDisabled();
    });
  });

  it('selectedDate가 "YYYY.MM.DD" 형식으로 헤더에 표시된다', () => {
    render(
      <ReservationPanel
        selectedDate="2026-04-10"
        reservations={[]}
        onCancelSuccess={vi.fn()}
      />
    );
    expect(screen.getByText('2026.04.10')).toBeInTheDocument();
  });

  it('여러 예약이 있을 때 모두 렌더링된다 (happy path)', () => {
    const reservations = [
      makeReservation({ id: 1, applicant_name: '홍길동', applicant_team: '청년부' }),
      makeReservation({
        id: 2,
        applicant_name: '김철수',
        applicant_team: '장년부',
        start_datetime: '2026-04-10T14:00:00+09:00',
        end_datetime: '2026-04-10T16:00:00+09:00',
      }),
    ];
    render(
      <ReservationPanel
        selectedDate="2026-04-10"
        reservations={reservations}
        onCancelSuccess={vi.fn()}
      />
    );
    expect(screen.getByText('홍길동 · 청년부')).toBeInTheDocument();
    expect(screen.getByText('김철수 · 장년부')).toBeInTheDocument();
  });
});
