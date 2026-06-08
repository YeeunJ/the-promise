import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';

vi.mock('axios');
import axios from 'axios';
import { useBoardData } from '../hooks/useBoardData';
import type { BoardResponse } from '../types';

const mockedAxios = vi.mocked(axios, true);

const sample: BoardResponse = {
  now: '2026-06-08T13:38:00+09:00',
  window_minutes: 120,
  buildings: [],
};

beforeEach(() => {
  mockedAxios.get.mockReset();
});

describe('useBoardData', () => {
  it('초기 로드 시 데이터와 lastUpdated 를 설정한다', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: sample });

    const { result } = renderHook(() => useBoardData());

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.data).toEqual(sample);
    expect(result.current.error).toBeNull();
    expect(result.current.lastUpdated).toBeInstanceOf(Date);
  });

  it('실패 시 error 를 설정하고 data 는 null 로 유지한다', async () => {
    mockedAxios.get.mockRejectedValueOnce(new Error('network'));

    const { result } = renderHook(() => useBoardData());

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.data).toBeNull();
    expect(result.current.error).toBe('현황을 불러오지 못했습니다');
  });

  it('60초마다 폴링한다', async () => {
    vi.useFakeTimers();
    mockedAxios.get.mockResolvedValue({ data: sample });

    renderHook(() => useBoardData());

    await vi.waitFor(() => expect(mockedAxios.get).toHaveBeenCalledTimes(1));
    await vi.advanceTimersByTimeAsync(60_000);
    expect(mockedAxios.get).toHaveBeenCalledTimes(2);

    vi.useRealTimers();
  });

  it('언마운트 시 요청을 abort 한다', () => {
    const abortSpy = vi.spyOn(AbortController.prototype, 'abort');
    mockedAxios.get.mockReturnValue(new Promise(() => {}));

    const { unmount } = renderHook(() => useBoardData());
    unmount();

    expect(abortSpy).toHaveBeenCalled();
    abortSpy.mockRestore();
  });
});
