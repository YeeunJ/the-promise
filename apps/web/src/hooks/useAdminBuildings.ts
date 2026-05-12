import { useCallback, useEffect, useState } from 'react';
import type { AdminBuilding } from '../types';
import { listBuildings } from '../lib/adminApi/buildings';
import { getAdminErrorMessage } from '../lib/adminApi/errors';

interface UseAdminBuildingsParams {
  authToken: string | null;
  enabled?: boolean;
}

interface UseAdminBuildingsResult {
  buildings: AdminBuilding[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

function filterActive(list: AdminBuilding[]): AdminBuilding[] {
  return list.filter((b) => b.is_active !== false);
}

export function useAdminBuildings(
  params: UseAdminBuildingsParams,
): UseAdminBuildingsResult {
  const { authToken, enabled = true } = params;
  const isActive = enabled && authToken !== null;

  const [buildings, setBuildings] = useState<AdminBuilding[]>([]);
  const [isLoading, setIsLoading] = useState(isActive);
  const [error, setError] = useState<string | null>(null);

  const doFetch = useCallback(async (): Promise<void> => {
    if (!isActive) return;
    setIsLoading(true);
    setError(null);
    try {
      const list = await listBuildings(authToken ?? '');
      setBuildings(filterActive(list));
    } catch (err: unknown) {
      setError(getAdminErrorMessage(err, '건물 목록을 불러오지 못했습니다.'));
      setBuildings([]);
    } finally {
      setIsLoading(false);
    }
  }, [authToken, isActive]);

  useEffect(() => {
    if (!isActive) return;
    void doFetch();
  }, [isActive, doFetch]);

  return { buildings, isLoading, error, refetch: doFetch };
}
