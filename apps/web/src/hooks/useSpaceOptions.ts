import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import type { Space } from '../types';

interface UseSpaceOptionsParams {
  authToken: string | null;
  enabled?: boolean;
}

interface UseSpaceOptionsResult {
  spaces: Space[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

let cachedSpaces: Space[] | null = null;

function filterActive(list: Space[]): Space[] {
  // is_active === false 인 것만 제외. 필드 자체 부재(undefined)는 통과 — 보수적 처리
  return list.filter((s) => s.is_active !== false);
}

export function useSpaceOptions(
  params: UseSpaceOptionsParams,
): UseSpaceOptionsResult {
  const { authToken, enabled = true } = params;

  const isActive = enabled && authToken !== null;

  const [spaces, setSpaces] = useState<Space[]>(
    cachedSpaces !== null ? filterActive(cachedSpaces) : [],
  );
  const [isLoading, setIsLoading] = useState(
    isActive && cachedSpaces === null,
  );
  const [error, setError] = useState<string | null>(null);

  const doFetch = useCallback(
    async (force = false): Promise<void> => {
      if (!isActive) return;
      if (!force && cachedSpaces !== null) {
        setSpaces(filterActive(cachedSpaces));
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await axios.get<unknown>(
          `${import.meta.env.VITE_API_BASE_URL}/api/v1/admin/spaces/`,
          {
            headers: { Authorization: `Token ${authToken ?? ''}` },
          },
        );
        const list = Array.isArray(response.data)
          ? (response.data as Space[])
          : [];
        cachedSpaces = list;
        setSpaces(filterActive(list));
      } catch {
        setError('공간 목록을 불러오지 못했습니다');
        setSpaces([]);
      } finally {
        setIsLoading(false);
      }
    },
    [authToken, isActive],
  );

  useEffect(() => {
    if (!isActive) return;
    void doFetch(false);
  }, [isActive, doFetch]);

  const refetch = useCallback(async (): Promise<void> => {
    await doFetch(true);
  }, [doFetch]);

  return { spaces, isLoading, error, refetch };
}

// 테스트 전용 export — 모듈 단위 캐시 초기화
export function __resetSpaceOptionsCacheForTest(): void {
  cachedSpaces = null;
}
