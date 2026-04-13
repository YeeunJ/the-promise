import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useOccupiedSlots } from '../hooks/useOccupiedSlots';

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

beforeEach(() => {
  mockFetch.mockReset();
});

function jsonOk(data: unknown) {
  return Promise.resolve({ ok: true, json: () => Promise.resolve(data) } as Response);
}

function jsonError(status: number) {
  return Promise.resolve({ ok: false, status } as Response);
}

describe('useOccupiedSlots', () => {
  it('spaceId가 null이면 빈 배열을 반환하고 fetch하지 않는다', () => {
    const { result } = renderHook(() => useOccupiedSlots(null, '2026-04-10'));
    expect(result.current.occupiedSlots).toEqual([]);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('date가 빈 문자열이면 빈 배열을 반환하고 fetch하지 않는다', () => {
    const { result } = renderHook(() => useOccupiedSlots(1, ''));
    expect(result.current.occupiedSlots).toEqual([]);
    expect(result.current.isLoading).toBe(false);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('spaceId와 date가 주어지면 점유 슬롯을 fetch한다', async () => {
    const data = [
      { start_datetime: '2026-04-10T10:00:00+09:00', end_datetime: '2026-04-10T12:00:00+09:00' },
    ];
    mockFetch.mockReturnValueOnce(jsonOk(data));

    const { result } = renderHook(() => useOccupiedSlots(1, '2026-04-10'));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.occupiedSlots).toEqual(data);
    expect(result.current.error).toBeNull();
    expect(mockFetch).toHaveBeenCalledWith(
      `${import.meta.env.VITE_API_BASE_URL}/api/v1/spaces/1/reservations/?date=2026-04-10`,
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    );
  });

  it('API 실패 시 에러 메시지를 설정한다', async () => {
    mockFetch.mockReturnValueOnce(jsonError(500));

    const { result } = renderHook(() => useOccupiedSlots(1, '2026-04-10'));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.occupiedSlots).toEqual([]);
    expect(result.current.error).toBe('예약 정보를 불러오지 못했습니다');
  });

  it('언마운트 시 AbortController가 abort를 호출한다', async () => {
    const abortSpy = vi.spyOn(AbortController.prototype, 'abort');
    mockFetch.mockReturnValueOnce(new Promise(() => {})); // never resolves

    const { unmount } = renderHook(() => useOccupiedSlots(1, '2026-04-10'));
    unmount();

    expect(abortSpy).toHaveBeenCalled();
    abortSpy.mockRestore();
  });

  it('유효하지 않은 API 응답 항목을 걸러낸다', async () => {
    const data = [
      { start_datetime: '2026-04-10T10:00:00+09:00', end_datetime: '2026-04-10T12:00:00+09:00' },
      { start_datetime: 'invalid', end_datetime: '2026-04-10T12:00:00+09:00' },
      null,
      { start_datetime: 123, end_datetime: '2026-04-10T12:00:00+09:00' },
    ];
    mockFetch.mockReturnValueOnce(jsonOk(data));

    const { result } = renderHook(() => useOccupiedSlots(1, '2026-04-10'));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.occupiedSlots).toEqual([
      { start_datetime: '2026-04-10T10:00:00+09:00', end_datetime: '2026-04-10T12:00:00+09:00' },
    ]);
  });

  it('spaceId 변경 시 새로 fetch한다', async () => {
    const data1 = [{ start_datetime: '2026-04-10T10:00:00+09:00', end_datetime: '2026-04-10T11:00:00+09:00' }];
    const data2 = [{ start_datetime: '2026-04-10T14:00:00+09:00', end_datetime: '2026-04-10T15:00:00+09:00' }];
    mockFetch.mockReturnValueOnce(jsonOk(data1));

    const { result, rerender } = renderHook(
      ({ spaceId, date }) => useOccupiedSlots(spaceId, date),
      { initialProps: { spaceId: 1 as number | null, date: '2026-04-10' } },
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.occupiedSlots).toEqual(data1);

    mockFetch.mockReturnValueOnce(jsonOk(data2));
    rerender({ spaceId: 2, date: '2026-04-10' });

    await waitFor(() => expect(result.current.occupiedSlots).toEqual(data2));
  });
});
