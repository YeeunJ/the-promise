import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { MyReservationsPage } from '../pages/MyReservationsPage';
import { LOOKUP_CREDENTIALS_STORAGE_KEY } from '../hooks/useLookupCredentials';
import type { PaginatedResponse, Reservation } from '../types';

vi.mock('axios');
import axios from 'axios';
const mockedAxios = vi.mocked(axios, true);

function makeReservation(overrides: Partial<Reservation> = {}): Reservation {
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
    start_datetime: '2099-12-31T10:00:00+09:00',
    end_datetime: '2099-12-31T11:00:00+09:00',
    status: 'confirmed',
    admin_note: null,
    created_at: '2026-05-13T00:00:00+09:00',
    ...overrides,
  };
}

function makePaginated(results: Reservation[]): PaginatedResponse<Reservation> {
  return {
    count: results.length,
    page: 1,
    page_size: 100,
    total_pages: 1,
    results,
  };
}

function seedCreds(): void {
  sessionStorage.setItem(
    LOOKUP_CREDENTIALS_STORAGE_KEY,
    JSON.stringify({ name: '홍길동', phone: '010-1234-5678' }),
  );
}

function renderPage(initial: string = '/my'): void {
  render(
    <MemoryRouter initialEntries={[initial]}>
      <Routes>
        <Route path="/my" element={<MyReservationsPage />} />
        <Route path="/my/login" element={<div>LookupLoginPage</div>} />
        <Route path="/booking" element={<div>BookingPage</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('MyReservationsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
  });

  it('credentials 없으면 /my/login redirect', () => {
    renderPage();
    expect(screen.getByText('LookupLoginPage')).toBeInTheDocument();
  });

  it('credentials 있으면 KPI 4개 + 인사말 렌더', async () => {
    seedCreds();
    mockedAxios.get.mockResolvedValue({ data: makePaginated([]) });
    renderPage();

    await waitFor(() => {
      expect(screen.getByText(/홍길동님의 예약 내역/)).toBeInTheDocument();
    });
    expect(screen.getByText('예정')).toBeInTheDocument();
    expect(screen.getByText('확정')).toBeInTheDocument();
    expect(screen.getByText('대기')).toBeInTheDocument();
    expect(screen.getByText('취소')).toBeInTheDocument();
  });

  it('current/past API 응답으로 KPI 값 반영', async () => {
    seedCreds();
    mockedAxios.get.mockImplementation((url: string) => {
      if (url.includes('current')) {
        return Promise.resolve({
          data: makePaginated([
            makeReservation({ id: 1, status: 'confirmed' }),
            makeReservation({ id: 2, status: 'pending' }),
          ]),
        });
      }
      return Promise.resolve({
        data: makePaginated([makeReservation({ id: 3, status: 'cancelled' })]),
      });
    });
    renderPage();

    await waitFor(() => {
      expect(screen.getByTestId('kpi-upcoming')).toHaveTextContent('2');
      expect(screen.getByTestId('kpi-confirmed')).toHaveTextContent('1');
      expect(screen.getByTestId('kpi-pending')).toHaveTextContent('1');
      expect(screen.getByTestId('kpi-cancelled')).toHaveTextContent('1');
    });
  });

  it('다시 조회 클릭 → credentials 클리어 + /my/login navigate', async () => {
    seedCreds();
    mockedAxios.get.mockResolvedValue({ data: makePaginated([]) });
    const user = userEvent.setup();
    renderPage();

    await waitFor(() => {
      expect(screen.getByText(/다시 조회/)).toBeInTheDocument();
    });
    await user.click(screen.getByRole('button', { name: /다시 조회/ }));
    expect(screen.getByText('LookupLoginPage')).toBeInTheDocument();
    expect(sessionStorage.getItem(LOOKUP_CREDENTIALS_STORAGE_KEY)).toBeNull();
  });
});
