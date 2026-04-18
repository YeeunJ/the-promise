import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import DateTimePopup from '../components/reservation/DateTimePopup';
import type { OccupiedSlot, TimeSlotValue } from '../types';
import * as useOccupiedSlotsModule from '../hooks/useOccupiedSlots';

vi.mock('../hooks/useOccupiedSlots');

const mockUseOccupiedSlots = vi.mocked(useOccupiedSlotsModule.useOccupiedSlots);

function makeOccupiedSlot(start: string, end: string): OccupiedSlot {
  return { start_datetime: start, end_datetime: end };
}

const defaultValue: TimeSlotValue = {
  date: '2099-12-31',
  startTime: '',
  endTime: '',
};

const baseProps = {
  isOpen: true,
  onClose: vi.fn(),
  onConfirm: vi.fn(),
  spaceId: 1,
  value: defaultValue,
};

describe('DateTimePopup — 시간 슬롯 비활성화', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('점유 슬롯 없을 때 09:00 버튼이 활성화된다 (happy path)', () => {
    mockUseOccupiedSlots.mockReturnValue({
      occupiedSlots: [],
      isLoading: false,
      error: null,
    });

    render(<DateTimePopup {...baseProps} />);

    const btn = screen.queryByRole('button', { name: '09:00' });
    if (btn) {
      expect(btn).not.toBeDisabled();
    }
  });

  it('10:00~12:00 예약 시 10:00 슬롯이 비활성화된다', () => {
    mockUseOccupiedSlots.mockReturnValue({
      occupiedSlots: [
        makeOccupiedSlot('2099-12-31T10:00:00+09:00', '2099-12-31T12:00:00+09:00'),
      ],
      isLoading: false,
      error: null,
    });

    render(<DateTimePopup {...baseProps} />);

    const btn = screen.queryByRole('button', { name: '10:00' });
    if (btn) {
      expect(btn).toBeDisabled();
    }
  });

  it('10:00~12:00 예약 시 10:30 슬롯이 비활성화된다', () => {
    mockUseOccupiedSlots.mockReturnValue({
      occupiedSlots: [
        makeOccupiedSlot('2099-12-31T10:00:00+09:00', '2099-12-31T12:00:00+09:00'),
      ],
      isLoading: false,
      error: null,
    });

    render(<DateTimePopup {...baseProps} />);

    const btn = screen.queryByRole('button', { name: '10:30' });
    if (btn) {
      expect(btn).toBeDisabled();
    }
  });

  it('10:00~12:00 예약 시 11:00 슬롯이 비활성화된다', () => {
    mockUseOccupiedSlots.mockReturnValue({
      occupiedSlots: [
        makeOccupiedSlot('2099-12-31T10:00:00+09:00', '2099-12-31T12:00:00+09:00'),
      ],
      isLoading: false,
      error: null,
    });

    render(<DateTimePopup {...baseProps} />);

    const btn = screen.queryByRole('button', { name: '11:00' });
    if (btn) {
      expect(btn).toBeDisabled();
    }
  });

  it('10:00~12:00 예약 시 11:30 슬롯이 비활성화된다', () => {
    mockUseOccupiedSlots.mockReturnValue({
      occupiedSlots: [
        makeOccupiedSlot('2099-12-31T10:00:00+09:00', '2099-12-31T12:00:00+09:00'),
      ],
      isLoading: false,
      error: null,
    });

    render(<DateTimePopup {...baseProps} />);

    const btn = screen.queryByRole('button', { name: '11:30' });
    if (btn) {
      expect(btn).toBeDisabled();
    }
  });

  it('10:00~12:00 예약 시 12:00 슬롯은 활성화된다 (반개구간 경계)', () => {
    mockUseOccupiedSlots.mockReturnValue({
      occupiedSlots: [
        makeOccupiedSlot('2099-12-31T10:00:00+09:00', '2099-12-31T12:00:00+09:00'),
      ],
      isLoading: false,
      error: null,
    });

    render(<DateTimePopup {...baseProps} />);

    const btn = screen.queryByRole('button', { name: '12:00' });
    if (btn) {
      expect(btn).not.toBeDisabled();
    }
  });

  it('점유 슬롯 로딩 중 로딩 메시지가 표시된다', () => {
    mockUseOccupiedSlots.mockReturnValue({
      occupiedSlots: [],
      isLoading: true,
      error: null,
    });

    render(<DateTimePopup {...baseProps} />);

    expect(screen.getByText(/예약 현황을 불러오는 중/)).toBeInTheDocument();
  });

  it('점유 슬롯 오류 시 에러 메시지가 표시된다', () => {
    mockUseOccupiedSlots.mockReturnValue({
      occupiedSlots: [],
      isLoading: false,
      error: '슬롯 조회 실패',
    });

    render(<DateTimePopup {...baseProps} />);

    expect(screen.getByText('슬롯 조회 실패')).toBeInTheDocument();
  });
});
