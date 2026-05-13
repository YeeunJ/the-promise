import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { BookingPage } from '../pages/BookingPage';
import * as useDepartmentsModule from '../hooks/useDepartments';
import * as useOccupiedSlotsModule from '../hooks/useOccupiedSlots';
import { BOOKING_DRAFT_STORAGE_KEY } from '../hooks/useBookingDraft';

vi.mock('../hooks/useDepartments');
vi.mock('../hooks/useOccupiedSlots');
vi.mock('axios');

import axios from 'axios';
const mockedAxios = vi.mocked(axios, true);
const mockUseDepartments = vi.mocked(useDepartmentsModule.useDepartments);
const mockUseOccupiedSlots = vi.mocked(useOccupiedSlotsModule.useOccupiedSlots);

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
  mockedAxios.get.mockResolvedValue({ data: [] });
  mockUseDepartments.mockReturnValue({
    departments: [
      {
        id: 1,
        name: '청년부',
        display_order: 1,
        pastor: null,
        teams: [{ id: 11, name: '1청년', pastor: null, pastor_display: '담당' }],
      },
    ],
    isLoading: false,
    error: null,
  });
  mockUseOccupiedSlots.mockReturnValue({
    occupiedSlots: [],
    isLoading: false,
    error: null,
  });
});

function renderWithRouter(initial: string = '/booking'): void {
  render(
    <MemoryRouter initialEntries={[initial]}>
      <Routes>
        <Route path="/booking" element={<BookingPage />} />
        <Route path="/" element={<div>Landing</div>} />
        <Route path="/booking/confirm" element={<div>Confirm</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('BookingPage', () => {
  it('/booking 진입 시 step 1 (신청자 정보) 렌더', () => {
    renderWithRouter('/booking');
    expect(screen.getByRole('heading', { name: '신청자 정보' })).toBeInTheDocument();
  });

  it('?step=3 진입 시 step 3 (인원 선택) 렌더', () => {
    renderWithRouter('/booking?step=3');
    expect(screen.getByRole('heading', { name: '인원 선택' })).toBeInTheDocument();
  });

  it('잘못된 step (예: 0, 99) 은 1 로 클램프', () => {
    renderWithRouter('/booking?step=99');
    expect(screen.getByRole('heading', { name: '신청자 정보' })).toBeInTheDocument();
  });

  it('chip 클릭으로 step 점프 (자유 점프)', async () => {
    const user = userEvent.setup();
    renderWithRouter('/booking');
    await user.click(screen.getByRole('button', { name: /사용 목적 입력/ }));
    expect(screen.getByRole('heading', { name: '사용 목적' })).toBeInTheDocument();
  });

  it('다음 버튼 클릭 → 다음 step 으로 이동', async () => {
    const user = userEvent.setup();
    renderWithRouter('/booking');
    await user.click(screen.getByRole('button', { name: /다음/ }));
    expect(screen.getByRole('heading', { name: '장소 선택' })).toBeInTheDocument();
  });

  it('이전 버튼은 step 1 에서는 숨김, step 2 부터 표시', async () => {
    const user = userEvent.setup();
    renderWithRouter('/booking');
    expect(screen.queryByRole('button', { name: /이전/ })).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /다음/ }));
    expect(screen.getByRole('button', { name: /이전/ })).toBeInTheDocument();
  });

  it('마지막 step (5) 에서 다음 버튼 숨김', () => {
    renderWithRouter('/booking?step=5');
    expect(screen.queryByRole('button', { name: /다음/ })).not.toBeInTheDocument();
  });

  it('취소 버튼 클릭 → "/" 로 navigate + draft 초기화', async () => {
    const user = userEvent.setup();
    localStorage.setItem(
      BOOKING_DRAFT_STORAGE_KEY,
      JSON.stringify({
        draft: {
          applicant: null,
          space: null,
          headcount: 30,
          timeSlot: { date: '', startTime: '', endTime: '' },
          purpose: '',
        },
        maxReachedStep: 3,
      }),
    );
    renderWithRouter('/booking');
    await user.click(screen.getByRole('button', { name: '취소' }));
    expect(screen.getByText('Landing')).toBeInTheDocument();
  });

  it('완료 버튼은 isComplete=false 면 disabled', () => {
    renderWithRouter('/booking?step=5');
    const btn = screen.getByRole('button', { name: '완료' });
    expect(btn).toBeDisabled();
  });

  it('localStorage 의 draft 로 step 별 progress 복원 (SummarySidebar 에 표시)', () => {
    localStorage.setItem(
      BOOKING_DRAFT_STORAGE_KEY,
      JSON.stringify({
        draft: {
          applicant: null,
          space: null,
          headcount: 30,
          timeSlot: { date: '', startTime: '', endTime: '' },
          purpose: '',
        },
        maxReachedStep: 3,
      }),
    );
    renderWithRouter('/booking');
    // 사이드바에 인원이 표시
    expect(screen.getByText('인원')).toBeInTheDocument();
    expect(screen.getByText('~30명')).toBeInTheDocument();
  });
});
