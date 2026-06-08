import { useEffect, useState } from 'react';
import axios from 'axios';
import type { BoardResponse } from '../types';

const POLL_INTERVAL_MS = 60_000;

export interface UseBoardDataResult {
  data: BoardResponse | null;
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

/**
 * 실시간 현황 보드 데이터를 60초마다 폴링한다.
 * 폴링 중 오류가 나도 직전 데이터는 유지하고 error 만 갱신한다.
 */
export function useBoardData(windowMinutes?: number): UseBoardDataResult {
  const [data, setData] = useState<BoardResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    const baseUrl = import.meta.env.VITE_API_BASE_URL as string;
    const params = windowMinutes ? { window_minutes: windowMinutes } : undefined;

    const fetchBoard = async (): Promise<void> => {
      try {
        const res = await axios.get<BoardResponse>(`${baseUrl}/api/v1/reservations/board/`, {
          params,
          signal: controller.signal,
        });
        if (!active) return;
        setData(res.data);
        setLastUpdated(new Date());
        setError(null);
      } catch (err: unknown) {
        if (axios.isCancel(err) || !active) return;
        setError('현황을 불러오지 못했습니다');
      } finally {
        if (active) setIsLoading(false);
      }
    };

    void fetchBoard();
    const interval = setInterval(() => void fetchBoard(), POLL_INTERVAL_MS);

    return () => {
      active = false;
      clearInterval(interval);
      controller.abort();
    };
  }, [windowMinutes]);

  return { data, isLoading, error, lastUpdated };
}
