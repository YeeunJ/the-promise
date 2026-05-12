import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import axios from 'axios';
import { usePaginatedReservations } from '../hooks/usePaginatedReservations';
import type { PaginatedResponse, Reservation } from '../types';

vi.mock('axios');
const mockedAxios = vi.mocked(axios);

function makeReservation(id: number): Reservation {
  return {
    id,
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
    team: null,
    custom_team_name: null,
    leader_phone: '010-8765-4321',
    headcount: 10,
    purpose: '정기모임',
    start_datetime: '2099-12-31T10:00:00+09:00',
    end_datetime: '2099-12-31T12:00:00+09:00',
    status: 'confirmed',
    admin_note: null,
    created_at: '2026-04-01T09:00:00+09:00',
  };
}

function paginated(
  results: Reservation[],
  overrides: Partial<PaginatedResponse<Reservation>> = {},
): PaginatedResponse<Reservation> {
  return {
    count: results.length,
    page: 1,
    page_size: 20,
    total_pages: 1,
    results,
    ...overrides,
  };
}

describe('usePaginatedReservations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('초기 호출 시 페이징 응답을 results 와 totalPages 에 반영한다', async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: paginated([makeReservation(1), makeReservation(2)], {
        count: 42,
        page: 1,
        total_pages: 3,
        page_size: 20,
      }),
    });

    const { result } = renderHook(() =>
      usePaginatedReservations({
        endpoint: '/api/v1/admin/reservations/current/',
        authToken: 'tk',
        filters: {},
        page: 1,
        pageSize: 20,
      }),
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.results).toHaveLength(2);
    expect(result.current.count).toBe(42);
    expect(result.current.totalPages).toBe(3);
    expect(result.current.error).toBeNull();
  });

  it('빈 결과(count=0)면 results=[], totalPages=1 로 반영한다', async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: paginated([], { count: 0, total_pages: 1 }),
    });

    const { result } = renderHook(() =>
      usePaginatedReservations({
        endpoint: '/api/v1/admin/reservations/current/',
        filters: {},
        page: 1,
        pageSize: 20,
      }),
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.results).toEqual([]);
    expect(result.current.count).toBe(0);
    expect(result.current.totalPages).toBe(1);
  });

  it('네트워크 에러 시 error 메시지를 설정한다', async () => {
    mockedAxios.get.mockRejectedValueOnce(new Error('network error'));

    const { result } = renderHook(() =>
      usePaginatedReservations({
        endpoint: '/api/v1/admin/reservations/current/',
        filters: {},
        page: 1,
        pageSize: 20,
      }),
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).not.toBeNull();
    expect(result.current.results).toEqual([]);
  });

  it('enabled=false 면 호출하지 않는다', async () => {
    const { result } = renderHook(() =>
      usePaginatedReservations({
        endpoint: '/api/v1/admin/reservations/current/',
        filters: {},
        page: 1,
        pageSize: 20,
        enabled: false,
      }),
    );

    // 호출이 발생하지 않음을 확인 (약간 기다린 뒤 검사)
    await new Promise((r) => setTimeout(r, 50));
    expect(mockedAxios.get).not.toHaveBeenCalled();
    expect(result.current.results).toEqual([]);
    expect(result.current.isLoading).toBe(false);
  });

  it('authToken 이 있으면 Authorization 헤더로 전달한다', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: paginated([]) });

    renderHook(() =>
      usePaginatedReservations({
        endpoint: '/api/v1/admin/reservations/current/',
        authToken: 'abc123',
        filters: {},
        page: 1,
        pageSize: 20,
      }),
    );

    await waitFor(() => {
      expect(mockedAxios.get).toHaveBeenCalled();
    });

    const [, config] = mockedAxios.get.mock.calls[0];
    expect(config?.headers).toMatchObject({ Authorization: 'Token abc123' });
  });

  it('publicCredentials 가 있으면 name/phone params 에 포함한다', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: paginated([]) });

    renderHook(() =>
      usePaginatedReservations({
        endpoint: '/api/v1/reservations/current/',
        publicCredentials: { name: '홍길동', phone: '01012345678' },
        filters: {},
        page: 1,
        pageSize: 100,
      }),
    );

    await waitFor(() => {
      expect(mockedAxios.get).toHaveBeenCalled();
    });

    const [, config] = mockedAxios.get.mock.calls[0];
    expect(config?.params).toMatchObject({
      name: '홍길동',
      phone: '01012345678',
      page: 1,
      page_size: 100,
    });
  });

  it('filters 와 page/pageSize 를 params 에 포함한다', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: paginated([]) });

    renderHook(() =>
      usePaginatedReservations({
        endpoint: '/api/v1/admin/reservations/current/',
        filters: {
          from_date: '2026-05-01',
          to_date: '2026-05-31',
          building_id: 2,
          search: '염',
          ordering: '-start_datetime',
        },
        page: 2,
        pageSize: 20,
      }),
    );

    await waitFor(() => {
      expect(mockedAxios.get).toHaveBeenCalled();
    });

    const [, config] = mockedAxios.get.mock.calls[0];
    expect(config?.params).toMatchObject({
      from_date: '2026-05-01',
      to_date: '2026-05-31',
      building_id: 2,
      search: '염',
      ordering: '-start_datetime',
      page: 2,
      page_size: 20,
    });
  });

  it('page 가 변경되면 재호출한다', async () => {
    mockedAxios.get.mockResolvedValue({ data: paginated([]) });

    const { rerender } = renderHook(
      (props: { page: number }) =>
        usePaginatedReservations({
          endpoint: '/api/v1/admin/reservations/current/',
          filters: {},
          page: props.page,
          pageSize: 20,
        }),
      { initialProps: { page: 1 } },
    );

    await waitFor(() => {
      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
    });

    rerender({ page: 2 });

    await waitFor(() => {
      expect(mockedAxios.get).toHaveBeenCalledTimes(2);
    });
  });

  it('refetch() 호출 시 동일 params 로 재호출한다', async () => {
    mockedAxios.get.mockResolvedValue({ data: paginated([]) });

    const { result } = renderHook(() =>
      usePaginatedReservations({
        endpoint: '/api/v1/admin/reservations/current/',
        filters: {},
        page: 1,
        pageSize: 20,
      }),
    );

    await waitFor(() => {
      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
    });

    await act(async () => {
      await result.current.refetch();
    });

    expect(mockedAxios.get).toHaveBeenCalledTimes(2);
  });
});
