import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { ConfirmationPage } from '../pages/ConfirmationPage';
import { BOOKING_DRAFT_STORAGE_KEY } from '../hooks/useBookingDraft';
import type { ApplicantData, SpaceSelection } from '../types/booking';

vi.mock('axios');
import axios from 'axios';
const mockedAxios = vi.mocked(axios, true);

const filledApplicant: ApplicantData = {
  name: '홍길동',
  phone: '010-1234-5678',
  departmentId: 1,
  departmentName: '청년부',
  teamId: 11,
  teamName: '1청년',
  customTeamName: null,
  pastorDisplay: '김목사 목사',
};

const filledSpace: SpaceSelection = {
  id: 5,
  buildingName: '본당',
  floor: 1,
  spaceName: '사랑방',
};

function seedDraft(): void {
  localStorage.setItem(
    BOOKING_DRAFT_STORAGE_KEY,
    JSON.stringify({
      draft: {
        applicant: filledApplicant,
        space: filledSpace,
        headcount: 30,
        timeSlot: {
          date: '2099-12-31',
          startTime: '2099-12-31T11:30:00+09:00',
          endTime: '2099-12-31T14:00:00+09:00',
        },
        purpose: '정기 모임',
      },
      maxReachedStep: 5,
    }),
  );
}

function renderWithRouter(): void {
  render(
    <MemoryRouter initialEntries={['/booking/confirm']}>
      <Routes>
        <Route path="/booking/confirm" element={<ConfirmationPage />} />
        <Route path="/booking" element={<div>BookingPage</div>} />
        <Route path="/booking/success" element={<div>SuccessPage</div>} />
        <Route path="/" element={<div>Landing</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('ConfirmationPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('draft 미완성 시 /booking 으로 리다이렉트', () => {
    render(
      <MemoryRouter initialEntries={['/booking/confirm']}>
        <Routes>
          <Route path="/booking/confirm" element={<ConfirmationPage />} />
          <Route path="/booking" element={<div>BookingPage</div>} />
        </Routes>
      </MemoryRouter>,
    );
    expect(screen.getByText('BookingPage')).toBeInTheDocument();
  });

  it('draft 완성 시 티켓 카드 렌더 (신청자/장소/일시 표시)', () => {
    seedDraft();
    renderWithRouter();
    expect(screen.getByText('홍길동')).toBeInTheDocument();
    expect(screen.getByText(/본당.*사랑방/)).toBeInTheDocument();
    expect(screen.getByText(/11:30/)).toBeInTheDocument();
  });

  it('"수정하기" 클릭 → /booking 으로 navigate', async () => {
    seedDraft();
    const user = userEvent.setup();
    renderWithRouter();
    await user.click(screen.getByRole('button', { name: '수정하기' }));
    expect(screen.getByText('BookingPage')).toBeInTheDocument();
  });

  it('"신청하기" 클릭 성공 → /booking/success navigate + draft 초기화', async () => {
    seedDraft();
    mockedAxios.post.mockResolvedValueOnce({
      data: { id: 100, status: 'pending' },
    });
    const user = userEvent.setup();
    renderWithRouter();
    await user.click(screen.getByRole('button', { name: /신청하기/ }));

    await waitFor(() => {
      expect(screen.getByText('SuccessPage')).toBeInTheDocument();
    });
    expect(localStorage.getItem(BOOKING_DRAFT_STORAGE_KEY)).toBeNull();
  });

  it('"신청하기" 실패 (시간 키워드) → /booking?step=4&edit=1 로 navigate', async () => {
    seedDraft();
    mockedAxios.post.mockRejectedValueOnce({
      isAxiosError: true,
      response: { data: { error: 'invalid', message: '이미 예약된 시간입니다' } },
    });
    mockedAxios.isAxiosError = vi.fn().mockReturnValue(true) as never;
    const user = userEvent.setup();
    renderWithRouter();
    await user.click(screen.getByRole('button', { name: /신청하기/ }));

    await waitFor(() => {
      expect(screen.getByText('BookingPage')).toBeInTheDocument();
    });
    // 에러 메시지가 화면 어딘가에 보존되어야 한다 (다음 진입 시 확인용은 별도 처리 가능)
  });
});
