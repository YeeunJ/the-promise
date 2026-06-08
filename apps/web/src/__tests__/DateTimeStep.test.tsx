import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DateTimeStep } from '../components/booking/steps/DateTimeStep';
import type { OccupiedSlot, TimeSlotValue } from '../types';
import * as useOccupiedSlotsModule from '../hooks/useOccupiedSlots';

vi.mock('../hooks/useOccupiedSlots');

const mockUseOccupiedSlots = vi.mocked(useOccupiedSlotsModule.useOccupiedSlots);

function makeOccupiedSlot(start: string, end: string): OccupiedSlot {
  return { start_datetime: start, end_datetime: end };
}

const empty: TimeSlotValue = { date: '', startTime: '', endTime: '' };
const dateOnly: TimeSlotValue = { date: '2099-12-31', startTime: '', endTime: '' };

describe('DateTimeStep', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseOccupiedSlots.mockReturnValue({
      occupiedSlots: [],
      isLoading: false,
      error: null,
    });
  });

  it('value 비어있으면 안내 메시지 표시', () => {
    render(<DateTimeStep value={empty} onChange={vi.fn()} />);
    expect(screen.getByText(/날짜를 먼저 선택/)).toBeInTheDocument();
  });

  it('날짜 선택된 상태에서 시간 슬롯 그리드 렌더', () => {
    render(<DateTimeStep value={dateOnly} onChange={vi.fn()} />);
    expect(screen.getByRole('button', { name: '07:00' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '21:30' })).toBeInTheDocument();
  });

  it('점유 슬롯은 disabled', () => {
    mockUseOccupiedSlots.mockReturnValue({
      occupiedSlots: [
        makeOccupiedSlot('2099-12-31T10:00:00+09:00', '2099-12-31T12:00:00+09:00'),
      ],
      isLoading: false,
      error: null,
    });
    render(<DateTimeStep value={dateOnly} onChange={vi.fn()} />);
    expect(screen.getByRole('button', { name: '10:00' })).toBeDisabled();
    expect(screen.getByRole('button', { name: '11:30' })).toBeDisabled();
  });

  it('시작·종료 시간 선택 → onChange 콜백 (TimeSlotValue 전체)', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<DateTimeStep value={dateOnly} onChange={onChange} />);

    await user.click(screen.getByRole('button', { name: '10:00' }));
    await user.click(screen.getByRole('button', { name: '12:00' }));

    expect(onChange).toHaveBeenCalledWith({
      date: '2099-12-31',
      startTime: '2099-12-31T10:00:00+09:00',
      endTime: '2099-12-31T12:00:00+09:00',
    });
  });

  it('날짜만 선택 시 "시작시간을 선택해주세요" 안내 표시', () => {
    render(<DateTimeStep value={dateOnly} onChange={vi.fn()} />);
    expect(screen.getByText('시작시간을 선택해주세요')).toBeInTheDocument();
  });

  it('시작시간만 선택된 상태에서 "종료시간을 선택해주세요" 안내 표시', () => {
    const startOnly: TimeSlotValue = {
      date: '2099-12-31',
      startTime: '2099-12-31T11:30:00+09:00',
      endTime: '',
    };
    render(<DateTimeStep value={startOnly} onChange={vi.fn()} />);
    expect(screen.getByText('종료시간을 선택해주세요')).toBeInTheDocument();
    expect(screen.queryByText('시작시간을 선택해주세요')).not.toBeInTheDocument();
  });

  it('시작/종료 모두 선택되면 안내 메시지 없음', () => {
    const filled: TimeSlotValue = {
      date: '2099-12-31',
      startTime: '2099-12-31T11:30:00+09:00',
      endTime: '2099-12-31T15:00:00+09:00',
    };
    render(<DateTimeStep value={filled} onChange={vi.fn()} />);
    expect(screen.queryByText('시작시간을 선택해주세요')).not.toBeInTheDocument();
    expect(screen.queryByText('종료시간을 선택해주세요')).not.toBeInTheDocument();
  });

  it('시작/종료 선택된 상태에서 duration pill 표시 (시간 + duration)', () => {
    const filled: TimeSlotValue = {
      date: '2099-12-31',
      startTime: '2099-12-31T11:30:00+09:00',
      endTime: '2099-12-31T15:00:00+09:00',
    };
    render(<DateTimeStep value={filled} onChange={vi.fn()} />);
    const pill = screen.getByTestId('time-range-pill');
    expect(pill.textContent).toMatch(/11:30/);
    expect(pill.textContent).toMatch(/15:00/);
    expect(pill.textContent).toMatch(/3h 30m/);
  });

  it('시간 슬롯이 6열 grid 로 렌더 (data-grid-cols=6)', () => {
    render(<DateTimePopupGridTestComponent />);
  });
});

// helper: 단순한 그리드 컨테이너 확인용
function DateTimePopupGridTestComponent(): JSX.Element {
  mockUseOccupiedSlots.mockReturnValue({
    occupiedSlots: [],
    isLoading: false,
    error: null,
  });
  return <DateTimeStep value={dateOnly} onChange={vi.fn()} />;
}

describe('DateTimeStep — grid layout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseOccupiedSlots.mockReturnValue({
      occupiedSlots: [],
      isLoading: false,
      error: null,
    });
  });

  it('grid 컨테이너에 data-grid-cols="6" 속성', () => {
    render(<DateTimeStep value={dateOnly} onChange={vi.fn()} />);
    const grid = screen.getByTestId('time-slot-grid');
    expect(grid).toHaveAttribute('data-grid-cols', '6');
  });
});
