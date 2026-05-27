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

function renderBookingPage(): void {
  render(
    <MemoryRouter initialEntries={['/booking']}>
      <Routes>
        <Route path="/booking" element={<BookingPage />} />
        <Route path="/" element={<div>Landing</div>} />
        <Route path="/booking/confirm" element={<div>Confirm</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('BookingPage', () => {
  it('/booking 진입 시 step 1 (신청자 정보) active 렌더', () => {
    renderBookingPage();
    expect(screen.getByRole('heading', { name: '신청자 정보' })).toBeInTheDocument();
  });

  it('초기 진입 시 step 2~5 는 잠금 행으로 렌더 (heading 없음)', () => {
    renderBookingPage();
    expect(screen.queryByRole('heading', { name: '장소 선택' })).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: '사용 인원' })).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: '날짜 및 시간' })).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: '사용 목적' })).not.toBeInTheDocument();
  });

  it('StickyHeader 의 완료 버튼은 isComplete=false 면 disabled', () => {
    renderBookingPage();
    expect(screen.getByRole('button', { name: '완료' })).toBeDisabled();
  });

  it('SummaryRail 의 신청 현황 표시', () => {
    renderBookingPage();
    expect(screen.getByText('신청 현황')).toBeInTheDocument();
  });

  it('유효한 applicant draft 로드 시 다음 단계 버튼 활성화', () => {
    localStorage.setItem(
      BOOKING_DRAFT_STORAGE_KEY,
      JSON.stringify({
        draft: {
          applicant: {
            name: '홍길동',
            phone: '010-1234-5678',
            departmentId: 1,
            departmentName: '청년부',
            teamId: 11,
            teamName: '1청년',
            customTeamName: null,
            pastorDisplay: '',
          },
          space: null,
          headcount: 0,
          timeSlot: { date: '', startTime: '', endTime: '' },
          purpose: '',
        },
        maxReachedStep: 1,
      }),
    );
    renderBookingPage();
    expect(screen.getByRole('button', { name: /다음 단계/ })).not.toBeDisabled();
  });

  it('다음 단계 버튼 클릭 → step 2 (날짜 및 시간) 열림', async () => {
    const user = userEvent.setup();
    localStorage.setItem(
      BOOKING_DRAFT_STORAGE_KEY,
      JSON.stringify({
        draft: {
          applicant: {
            name: '홍길동',
            phone: '010-1234-5678',
            departmentId: 1,
            departmentName: '청년부',
            teamId: 11,
            teamName: '1청년',
            customTeamName: null,
            pastorDisplay: '',
          },
          space: null,
          headcount: 0,
          timeSlot: { date: '', startTime: '', endTime: '' },
          purpose: '',
        },
        maxReachedStep: 1,
      }),
    );
    renderBookingPage();
    await user.click(screen.getByRole('button', { name: /다음 단계/ }));
    expect(screen.getByRole('heading', { name: '날짜 및 시간' })).toBeInTheDocument();
  });

  it('maxReachedStep=3 이면 step 3 (장소 선택) active', () => {
    localStorage.setItem(
      BOOKING_DRAFT_STORAGE_KEY,
      JSON.stringify({
        draft: {
          applicant: null,
          space: null,
          headcount: 0,
          timeSlot: { date: '', startTime: '', endTime: '' },
          purpose: '',
        },
        maxReachedStep: 3,
      }),
    );
    renderBookingPage();
    expect(screen.getByRole('heading', { name: '장소 선택' })).toBeInTheDocument();
  });

  it('취소 버튼 클릭 → confirm dialog 표시', async () => {
    const user = userEvent.setup();
    renderBookingPage();
    await user.click(screen.getByRole('button', { name: '취소' }));
    expect(screen.getByText('예약 신청 취소')).toBeInTheDocument();
  });

  it('confirm cancel → "/" 로 navigate + draft 초기화', async () => {
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
    renderBookingPage();
    await user.click(screen.getByRole('button', { name: '취소' }));
    await user.click(screen.getByRole('button', { name: '예, 취소합니다' }));
    expect(screen.getByText('Landing')).toBeInTheDocument();
  });

  it('취소 dialog 에서 "계속 작성" 클릭 → dialog 닫힘', async () => {
    const user = userEvent.setup();
    renderBookingPage();
    await user.click(screen.getByRole('button', { name: '취소' }));
    await user.click(screen.getByRole('button', { name: '계속 작성' }));
    expect(screen.queryByText('예약 신청 취소')).not.toBeInTheDocument();
  });

  it('localStorage draft 인원 → SummaryRail 에 표시', () => {
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
    renderBookingPage();
    expect(screen.getByText('신청 현황')).toBeInTheDocument();
    expect(screen.getAllByText('~30명').length).toBeGreaterThan(0);
  });
});
