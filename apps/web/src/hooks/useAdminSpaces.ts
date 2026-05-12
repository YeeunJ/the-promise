import { useCallback, useEffect, useState } from 'react';
import type { AdminSpace } from '../types';
import { listSpaces } from '../lib/adminApi/spaces';
import { getAdminErrorMessage } from '../lib/adminApi/errors';

interface UseAdminSpacesParams {
  authToken: string | null;
  enabled?: boolean;
}

interface UseAdminSpacesResult {
  spaces: AdminSpace[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

function filterActive(list: AdminSpace[]): AdminSpace[] {
  return list.filter((s) => s.is_active !== false);
}

export function useAdminSpaces(
  params: UseAdminSpacesParams,
): UseAdminSpacesResult {
  const { authToken, enabled = true } = params;
  const isActive = enabled && authToken !== null;

  const [spaces, setSpaces] = useState<AdminSpace[]>([]);
  const [isLoading, setIsLoading] = useState(isActive);
  const [error, setError] = useState<string | null>(null);

  const doFetch = useCallback(async (): Promise<void> => {
    if (!isActive) return;
    setIsLoading(true);
    setError(null);
    try {
      const list = await listSpaces(authToken ?? '');
      setSpaces(filterActive(list));
    } catch (err: unknown) {
      setError(getAdminErrorMessage(err, '공간 목록을 불러오지 못했습니다.'));
      setSpaces([]);
    } finally {
      setIsLoading(false);
    }
  }, [authToken, isActive]);

  useEffect(() => {
    if (!isActive) return;
    void doFetch();
  }, [isActive, doFetch]);

  return { spaces, isLoading, error, refetch: doFetch };
}
