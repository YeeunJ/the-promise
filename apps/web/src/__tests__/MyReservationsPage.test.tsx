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

  it('KPI는 예정(미래) 예약만 집계하고 지난 예약은 제외한다', async () => {
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
      // 지난 내역의 취소 1건 — 상태 카드에 포함되면 안 된다.
      return Promise.resolve({
        data: makePaginated([makeReservation({ id: 3, status: 'cancelled' })]),
      });
    });
    renderPage();

    await waitFor(() => {
      expect(screen.getByTestId('kpi-upcoming')).toHaveTextContent('2');
    });
    expect(screen.getByTestId('kpi-confirmed')).toHaveTextContent('1');
    expect(screen.getByTestId('kpi-pending')).toHaveTextContent('1');
    // 지난 내역의 취소 건은 카드 집계에서 제외된다.
    expect(screen.getByTestId('kpi-cancelled')).toHaveTextContent('0');
  });

  it('미래 예약의 취소 건은 취소 카드에 집계된다', async () => {
    seedCreds();
    mockedAxios.get.mockImplementation((url: string) => {
      if (url.includes('current')) {
        return Promise.resolve({
          data: makePaginated([
            makeReservation({ id: 1, status: 'confirmed' }),
            makeReservation({ id: 2, status: 'cancelled' }),
          ]),
        });
      }
      return Promise.resolve({ data: makePaginated([]) });
    });
    renderPage();

    await waitFor(() => {
      // 예정(활성) = confirmed 1 (취소 제외)
      expect(screen.getByTestId('kpi-upcoming')).toHaveTextContent('1');
    });
    expect(screen.getByTestId('kpi-cancelled')).toHaveTextContent('1');
  });

  it('지난 내역이 페이지 크기를 초과하면 더보기로 추가 로드된다', async () => {
    seedCreds();
    const makePast = (start: number, n: number): Reservation[] =>
      Array.from({ length: n }, (_, i) =>
        makeReservation({
          id: start + i,
          status: 'confirmed',
          start_datetime: '2020-01-01T10:00:00+09:00',
          end_datetime: '2020-01-01T11:00:00+09:00',
        }),
      );
    const firstPage = makePast(100, 20);
    const secondPage = makePast(200, 5);
    mockedAxios.get.mockImplementation(
      (url: string, config?: { params?: { page?: number } }) => {
        if (url.includes('current')) {
          return Promise.resolve({ data: makePaginated([]) });
        }
        const page = config?.params?.page ?? 1;
        return Promise.resolve({
          data: {
            count: 25,
            page,
            page_size: 20,
            total_pages: 2,
            results: page === 1 ? firstPage : secondPage,
          },
        });
      },
    );
    const user = userEvent.setup();
    renderPage();

    // 토글 버튼에 전체 건수(25) 표시
    const toggle = await screen.findByText(/지난 내역 보기 \(25건\)/);
    await user.click(toggle);

    // 더보기 버튼: 현재 20 / 전체 25
    const loadMore = await screen.findByRole('button', { name: /더보기/ });
    expect(loadMore).toHaveTextContent('20/25');
    await user.click(loadMore);

    // 전체 로드 후 더보기 버튼 사라짐
    await waitFor(() => {
      expect(
        screen.queryByRole('button', { name: /더보기/ }),
      ).not.toBeInTheDocument();
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
