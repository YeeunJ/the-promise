import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios from 'axios';
import ReservationTable from '../components/ReservationTable';
import type { Reservation } from '../types';

vi.mock('axios');
const mockedAxios = vi.mocked(axios);

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
    start_datetime: '2099-12-31T10:00:00+09:00',
    end_datetime: '2099-12-31T12:00:00+09:00',
    status: 'confirmed',
    admin_note: null,
    created_at: '2026-04-01T09:00:00+09:00',
    ...overrides,
  };
}

const defaultProps = {
  reservations: [] as Reservation[],
  credentials: { name: '홍길동', phone: '010-1234-5678' },
  onGoToApply: vi.fn(),
  onCancelSuccess: vi.fn(),
};

// ── Phase 1: 빈 상태(Empty State) CTA ─────────────────────────────────────
describe('ReservationTable — 빈 상태', () => {
  it('예약이 없을 때 클립보드 이모지가 표시된다 (happy path)', () => {
    render(<ReservationTable {...defaultProps} />);
    expect(screen.getByText('📋')).toBeInTheDocument();
  });

  it('예약이 없을 때 "조회된 예약이 없습니다" 제목이 표시된다', () => {
    render(<ReservationTable {...defaultProps} />);
    expect(screen.getByText('조회된 예약이 없습니다')).toBeInTheDocument();
  });

  it('예약이 없을 때 안내 문구가 표시된다', () => {
    render(<ReservationTable {...defaultProps} />);
    expect(
      screen.getByText(/이름과 연락처로 예약 내역을 찾지 못했습니다/)
    ).toBeInTheDocument();
  });

  it('예약이 없을 때 "예약 신청하러 가기" CTA 버튼이 표시된다', () => {
    render(<ReservationTable {...defaultProps} />);
    expect(
      screen.getByRole('button', { name: /예약 신청하러 가기/ })
    ).toBeInTheDocument();
  });

  it('CTA 버튼 클릭 시 onGoToApply 콜백이 호출된다', async () => {
    const user = userEvent.setup();
    const onGoToApply = vi.fn();
    render(<ReservationTable {...defaultProps} onGoToApply={onGoToApply} />);

    await user.click(screen.getByRole('button', { name: /예약 신청하러 가기/ }));

    expect(onGoToApply).toHaveBeenCalledTimes(1);
  });
});

// ── Phase 1: 조회 결과 요약 헤더 ──────────────────────────────────────────
describe('ReservationTable — 결과 요약 헤더', () => {
  it('예정된 예약이 있을 때 건수가 표시된다 (happy path)', () => {
    const reservations = [makeReservation({ id: 1 }), makeReservation({ id: 2 })];
    render(<ReservationTable {...defaultProps} reservations={reservations} />);

    expect(screen.getByText(/예정된 예약/)).toBeInTheDocument();
    expect(screen.getByText('2건')).toBeInTheDocument();
  });

  it('예약이 1건일 때 1건이 표시된다', () => {
    const reservations = [makeReservation()];
    render(<ReservationTable {...defaultProps} reservations={reservations} />);

    expect(screen.getByText('1건')).toBeInTheDocument();
  });

  it('예약이 없을 때 요약 헤더가 표시되지 않는다 (boundary case)', () => {
    render(<ReservationTable {...defaultProps} />);
    expect(screen.queryByText(/예정된 예약/)).not.toBeInTheDocument();
  });
});

// ── Phase 2: 취소 모달 문구 ───────────────────────────────────────────────
describe('ReservationTable — 취소 모달', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('confirmed 예약에 취소 버튼이 표시된다 (happy path)', () => {
    const reservations = [makeReservation({ status: 'confirmed' })];
    render(<ReservationTable {...defaultProps} reservations={reservations} />);

    // 모바일 카드 + 데스크탑 테이블 둘 다 렌더링되므로 getAllBy 사용
    expect(screen.getAllByRole('button', { name: '예약 취소' }).length).toBeGreaterThanOrEqual(1);
  });

  it('취소 버튼 클릭 시 모달이 나타난다', async () => {
    const user = userEvent.setup();
    const reservations = [makeReservation({ status: 'confirmed' })];
    render(<ReservationTable {...defaultProps} reservations={reservations} />);

    await user.click(screen.getAllByRole('button', { name: '예약 취소' })[0]);

    expect(screen.getByText('예약을 취소하시겠습니까?')).toBeInTheDocument();
  });

  it('모달에 "취소된 예약은 복구할 수 없습니다" 설명이 표시된다', async () => {
    const user = userEvent.setup();
    const reservations = [makeReservation({ status: 'confirmed' })];
    render(<ReservationTable {...defaultProps} reservations={reservations} />);

    await user.click(screen.getAllByRole('button', { name: '예약 취소' })[0]);

    expect(screen.getByText('취소된 예약은 복구할 수 없습니다.')).toBeInTheDocument();
  });

  it('모달에 [예약 유지] 버튼이 표시된다', async () => {
    const user = userEvent.setup();
    const reservations = [makeReservation({ status: 'confirmed' })];
    render(<ReservationTable {...defaultProps} reservations={reservations} />);

    await user.click(screen.getAllByRole('button', { name: '예약 취소' })[0]);

    expect(screen.getByRole('button', { name: '예약 유지' })).toBeInTheDocument();
  });

  it('모달에 [지금 취소] 버튼이 표시된다', async () => {
    const user = userEvent.setup();
    const reservations = [makeReservation({ status: 'confirmed' })];
    render(<ReservationTable {...defaultProps} reservations={reservations} />);

    await user.click(screen.getAllByRole('button', { name: '예약 취소' })[0]);

    expect(screen.getByRole('button', { name: '지금 취소' })).toBeInTheDocument();
  });

  it('[예약 유지] 클릭 시 모달이 닫힌다', async () => {
    const user = userEvent.setup();
    const reservations = [makeReservation({ status: 'confirmed' })];
    render(<ReservationTable {...defaultProps} reservations={reservations} />);

    await user.click(screen.getAllByRole('button', { name: '예약 취소' })[0]);
    await user.click(screen.getByRole('button', { name: '예약 유지' }));

    expect(screen.queryByText('예약을 취소하시겠습니까?')).not.toBeInTheDocument();
  });

  it('[지금 취소] 클릭 시 API 오류가 나면 모달에 에러 메시지가 표시된다 (error case)', async () => {
    const user = userEvent.setup();
    mockedAxios.post.mockRejectedValueOnce(new Error('network error'));

    const reservations = [makeReservation({ id: 42, status: 'confirmed' })];
    render(<ReservationTable {...defaultProps} reservations={reservations} />);

    await user.click(screen.getAllByRole('button', { name: '예약 취소' })[0]);
    await user.click(screen.getByRole('button', { name: '지금 취소' }));

    await waitFor(() => {
      expect(screen.getByText(/취소 중 오류가 발생했습니다/)).toBeInTheDocument();
    });
  });

  it('[지금 취소] 클릭 시 취소 API를 호출하고 onCancelSuccess를 호출한다', async () => {
    const user = userEvent.setup();
    mockedAxios.post.mockResolvedValueOnce({ data: {} });

    const onCancelSuccess = vi.fn();
    const reservations = [makeReservation({ id: 42, status: 'confirmed' })];
    render(
      <ReservationTable
        {...defaultProps}
        reservations={reservations}
        onCancelSuccess={onCancelSuccess}
      />
    );

    await user.click(screen.getAllByRole('button', { name: '예약 취소' })[0]);
    await user.click(screen.getByRole('button', { name: '지금 취소' }));

    await waitFor(() => {
      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.stringContaining('/reservations/42/cancel/'),
        expect.any(Object)
      );
      expect(onCancelSuccess).toHaveBeenCalledTimes(1);
    });
  });

  it('cancelled 예약은 취소 버튼이 비활성화된다 (boundary case)', () => {
    const reservations = [makeReservation({ status: 'cancelled' })];
    render(<ReservationTable {...defaultProps} reservations={reservations} />);

    const cancelBtns = screen.getAllByRole('button', { name: '예약 취소' });
    cancelBtns.forEach((btn) => expect(btn).toBeDisabled());
  });

  it('rejected 예약은 취소 버튼이 비활성화된다 (boundary case)', () => {
    const reservations = [makeReservation({ status: 'rejected' })];
    render(<ReservationTable {...defaultProps} reservations={reservations} />);

    const cancelBtns = screen.getAllByRole('button', { name: '예약 취소' });
    cancelBtns.forEach((btn) => expect(btn).toBeDisabled());
  });
});

// ── 레이아웃 안정성 ────────────────────────────────────────────────────────
describe('ReservationTable — 레이아웃 안정성', () => {
  it('데스크탑 테이블에 table-fixed 클래스가 적용된다', () => {
    const reservations = [makeReservation()];
    const { container } = render(
      <ReservationTable {...defaultProps} reservations={reservations} />
    );
    const table = container.querySelector('table');
    expect(table).not.toBeNull();
    expect(table!.className).toContain('table-fixed');
  });

  it('모바일 카드 flex 컨테이너에 min-w-0 클래스가 적용된다', () => {
    const reservations = [makeReservation()];
    const { container } = render(
      <ReservationTable {...defaultProps} reservations={reservations} />
    );
    // min-w-0 을 가진 요소가 존재해야 함
    const minW0Els = container.querySelectorAll('.min-w-0');
    expect(minW0Els.length).toBeGreaterThanOrEqual(1);
  });

  it('사용목적 셀에 overflow-hidden 클래스가 적용된다', () => {
    const reservations = [makeReservation({ purpose: '긴 사용목적 텍스트'.repeat(20) })];
    const { container } = render(
      <ReservationTable {...defaultProps} reservations={reservations} />
    );
    const overflowEls = container.querySelectorAll('.overflow-hidden');
    expect(overflowEls.length).toBeGreaterThanOrEqual(1);
  });

  // ── UI 수정: 버튼 한 줄·헤더 가운데·2줄 말줄임 ──────────────────────────

  it('티켓 다운로드 버튼에 whitespace-nowrap 클래스가 적용된다', () => {
    const reservations = [makeReservation({ status: 'confirmed' })];
    const { container } = render(
      <ReservationTable {...defaultProps} reservations={reservations} />
    );
    const ticketBtns = Array.from(container.querySelectorAll('button')).filter(
      (btn) => btn.textContent === '티켓 다운로드'
    );
    expect(ticketBtns.length).toBeGreaterThanOrEqual(1);
    ticketBtns.forEach((btn) => {
      expect(btn.className).toContain('whitespace-nowrap');
    });
  });

  it('예약 취소 버튼에 whitespace-nowrap 클래스가 적용된다', () => {
    const reservations = [makeReservation({ status: 'confirmed' })];
    const { container } = render(
      <ReservationTable {...defaultProps} reservations={reservations} />
    );
    const cancelBtns = Array.from(container.querySelectorAll('button')).filter(
      (btn) => btn.textContent === '예약 취소'
    );
    expect(cancelBtns.length).toBeGreaterThanOrEqual(1);
    cancelBtns.forEach((btn) => {
      expect(btn.className).toContain('whitespace-nowrap');
    });
  });

  it('데스크탑 테이블 헤더(<th>)에 text-center 클래스가 적용된다', () => {
    const reservations = [makeReservation()];
    const { container } = render(
      <ReservationTable {...defaultProps} reservations={reservations} />
    );
    const headers = container.querySelectorAll('th');
    expect(headers.length).toBeGreaterThanOrEqual(1);
    headers.forEach((th) => {
      expect(th.className).toContain('text-center');
    });
  });

  it('데스크탑 테이블 사용목적 <td>에 line-clamp-2 클래스가 적용된다', () => {
    const reservations = [makeReservation({ purpose: '긴 사용목적 텍스트'.repeat(20) })];
    const { container } = render(
      <ReservationTable {...defaultProps} reservations={reservations} />
    );
    const lineClamped = container.querySelectorAll('.line-clamp-2');
    expect(lineClamped.length).toBeGreaterThanOrEqual(1);
  });

  it('데스크탑 테이블에 min-w-[900px] 클래스가 적용된다', () => {
    const reservations = [makeReservation()];
    const { container } = render(
      <ReservationTable {...defaultProps} reservations={reservations} />
    );
    const table = container.querySelector('table');
    expect(table).not.toBeNull();
    expect(table!.className).toContain('min-w-[900px]');
  });

  it('데스크탑 테이블 공간 셀에 건물+층수가 별도 요소로 렌더링된다', () => {
    const reservations = [makeReservation({
      space: {
        id: 1,
        name: '수선화·장미·샤론·올리브·백합방',
        floor: 2,
        capacity: 100,
        description: null,
        building: { id: 1, name: '가나안홀', description: null },
      },
    })];
    render(<ReservationTable {...defaultProps} reservations={reservations} />);
    expect(screen.getByText('가나안홀 2층')).toBeInTheDocument();
    expect(screen.getByText('수선화·장미·샤론·올리브·백합방')).toBeInTheDocument();
  });

  it('데스크탑 테이블 상태 td에 whitespace-nowrap 클래스가 적용된다', () => {
    const reservations = [makeReservation({ status: 'confirmed' })];
    const { container } = render(
      <ReservationTable {...defaultProps} reservations={reservations} />
    );
    const tbody = container.querySelector('tbody');
    const tds = tbody!.querySelectorAll('tr td');
    // 번호(0), 공간(1), 날짜·시간(2), 인원(3), 사용목적(4), 상태(5)
    const statusTd = Array.from(tds)[5];
    expect(statusTd.className).toContain('whitespace-nowrap');
  });

  it('데스크탑 테이블 사용목적 내부 div에 line-clamp-2 클래스가 적용된다', () => {
    const reservations = [makeReservation({ purpose: '긴 사용목적 텍스트'.repeat(20) })];
    const { container } = render(
      <ReservationTable {...defaultProps} reservations={reservations} />
    );
    const tbody = container.querySelector('tbody');
    const tds = tbody!.querySelectorAll('tr td');
    const purposeTd = Array.from(tds)[4];
    expect(purposeTd.className).not.toContain('line-clamp-2');
    const innerDiv = purposeTd.querySelector('div.line-clamp-2');
    expect(innerDiv).not.toBeNull();
  });

  it('데스크탑 테이블 데이터 행(tr)에 h-[72px] 클래스가 적용된다', () => {
    const reservations = [makeReservation()];
    const { container } = render(
      <ReservationTable {...defaultProps} reservations={reservations} />
    );
    const tbody = container.querySelector('tbody');
    const rows = tbody!.querySelectorAll('tr');
    expect(rows.length).toBeGreaterThanOrEqual(1);
    rows.forEach((row) => {
      expect(row.className).toContain('h-[72px]');
    });
  });
});

// ── Phase 4: TicketButton 피드백 개선 ─────────────────────────────────────
describe('ReservationTable — TicketButton 상태 피드백', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('기본 상태에서 "티켓 다운로드" 텍스트가 표시된다 (happy path)', () => {
    const reservations = [makeReservation()];
    render(<ReservationTable {...defaultProps} reservations={reservations} />);

    expect(screen.getAllByText('티켓 다운로드').length).toBeGreaterThanOrEqual(1);
  });

  it('다운로드 중에는 "다운로드 중..." 텍스트가 표시된다', async () => {
    const user = userEvent.setup();
    let resolveDownload: () => void;
    mockedAxios.get.mockReturnValueOnce(
      new Promise((resolve) => {
        resolveDownload = () => resolve({ data: new Blob() });
      }) as ReturnType<typeof axios.get>
    );

    const reservations = [makeReservation()];
    render(<ReservationTable {...defaultProps} reservations={reservations} />);

    const ticketBtn = screen.getAllByText('티켓 다운로드')[0];
    await user.click(ticketBtn);

    expect(screen.getByText('다운로드 중...')).toBeInTheDocument();

    await act(async () => { resolveDownload!(); });
  });

  it('다운로드 실패 시 "재시도" 텍스트가 표시된다 (error case)', async () => {
    const user = userEvent.setup();
    mockedAxios.get.mockRejectedValueOnce(new Error('network error'));

    const reservations = [makeReservation()];
    render(<ReservationTable {...defaultProps} reservations={reservations} />);

    const ticketBtn = screen.getAllByText('티켓 다운로드')[0];
    await user.click(ticketBtn);

    await waitFor(() => {
      expect(screen.getAllByText('재시도').length).toBeGreaterThanOrEqual(1);
    });
  });

  it('다운로드 실패 시 인라인 에러 텍스트가 표시된다 (error case)', async () => {
    const user = userEvent.setup();
    mockedAxios.get.mockRejectedValueOnce(new Error('network error'));

    const reservations = [makeReservation()];
    render(<ReservationTable {...defaultProps} reservations={reservations} />);

    const ticketBtn = screen.getAllByText('티켓 다운로드')[0];
    await user.click(ticketBtn);

    await waitFor(() => {
      expect(screen.getByText(/다운로드 실패/)).toBeInTheDocument();
    });
  });

  it('cancelled 예약은 티켓 다운로드 버튼이 비활성화된다 (boundary case)', () => {
    const reservations = [makeReservation({ status: 'cancelled' })];
    render(<ReservationTable {...defaultProps} reservations={reservations} />);

    const ticketBtns = screen.getAllByText('티켓 다운로드');
    ticketBtns.forEach((btn) => expect(btn.closest('button')).toBeDisabled());
  });

  it('rejected 예약은 티켓 다운로드 버튼이 비활성화된다 (boundary case)', () => {
    const reservations = [makeReservation({ status: 'rejected' })];
    render(<ReservationTable {...defaultProps} reservations={reservations} />);

    const ticketBtns = screen.getAllByText('티켓 다운로드');
    ticketBtns.forEach((btn) => expect(btn.closest('button')).toBeDisabled());
  });

  it('confirmed 예약은 티켓 다운로드 버튼이 활성화된다', () => {
    const reservations = [makeReservation({ status: 'confirmed' })];
    render(<ReservationTable {...defaultProps} reservations={reservations} />);

    const ticketBtns = screen.getAllByText('티켓 다운로드');
    ticketBtns.forEach((btn) => expect(btn.closest('button')).not.toBeDisabled());
  });

  it('pending 예약은 티켓 다운로드 버튼이 활성화된다', () => {
    const reservations = [makeReservation({ status: 'pending' })];
    render(<ReservationTable {...defaultProps} reservations={reservations} />);

    const ticketBtns = screen.getAllByText('티켓 다운로드');
    ticketBtns.forEach((btn) => expect(btn.closest('button')).not.toBeDisabled());
  });
});
