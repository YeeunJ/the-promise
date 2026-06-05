import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ReservationsSection } from '../components/admin/ReservationsSection';
import { __resetSpaceOptionsCacheForTest } from '../hooks/useSpaceOptions';
import { getKSTDateString } from '../utils/formatDatetime';
import type { Reservation } from '../types';

vi.mock('axios');
import axios from 'axios';
const mockedAxios = vi.mocked(axios, true);

function makeReservation(overrides: Partial<Reservation> = {}): Reservation {
  const today = getKSTDateString();
  return {
    id: 1,
    space: {
      id: 1,
      building: { id: 1, name: '본당', description: null },
      name: '사랑방',
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
    start_datetime: `${today}T10:00:00+09:00`,
    end_datetime: `${today}T11:00:00+09:00`,
    status: 'confirmed',
    admin_note: null,
    created_at: '2026-05-13T00:00:00+09:00',
    ...overrides,
  };
}

function mockApi(reservations: Reservation[]): void {
  mockedAxios.get.mockImplementation((url: string) => {
    if (url.includes('/admin/spaces/')) {
      return Promise.resolve({ data: [] });
    }
    // 캘린더 fetch (/admin/reservations/)
    return Promise.resolve({
      data: {
        count: reservations.length,
        page: 1,
        page_size: 100,
        total_pages: 1,
        results: reservations,
      },
    });
  });
}

describe('ReservationsSection — 취소 흐름', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    __resetSpaceOptionsCacheForTest();
  });

  it('예약 취소 클릭 시 상세 모달이 닫히고 취소 사유 다이얼로그가 표시된다', async () => {
    const reservation = makeReservation({ id: 7, status: 'confirmed' });
    mockApi([reservation]);
    const user = userEvent.setup();

    render(<ReservationsSection authToken="token" showToast={vi.fn()} />);

    // 사이드 레일에서 예약 클릭 → 상세 모달 열기
    const item = await screen.findByTestId('side-rail-item-7');
    await user.click(item);
    expect(await screen.findByText('예약 상세')).toBeInTheDocument();

    // 상세 모달의 "예약 취소" 클릭
    await user.click(screen.getByRole('button', { name: '예약 취소' }));

    // 상세 모달은 닫히고, 취소 사유 다이얼로그가 가려지지 않고 표시됨
    await waitFor(() => {
      expect(screen.queryByText('예약 상세')).not.toBeInTheDocument();
    });
    expect(
      screen.getByText('이 예약을 취소하시겠습니까?'),
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText('취소 사유를 입력해주세요 (선택)'),
    ).toBeInTheDocument();
  });
});
