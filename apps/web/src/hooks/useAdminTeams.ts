import { useCallback, useEffect, useState } from 'react';
import type { AdminTeam } from '../types';
import { listTeams } from '../lib/adminApi/teams';
import { getAdminErrorMessage } from '../lib/adminApi/errors';

interface UseAdminTeamsParams {
  authToken: string | null;
  enabled?: boolean;
}

interface UseAdminTeamsResult {
  teams: AdminTeam[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

function filterActive(list: AdminTeam[]): AdminTeam[] {
  return list.filter((t) => t.is_active !== false);
}

export function useAdminTeams(
  params: UseAdminTeamsParams,
): UseAdminTeamsResult {
  const { authToken, enabled = true } = params;
  const isActive = enabled && authToken !== null;

  const [teams, setTeams] = useState<AdminTeam[]>([]);
  const [isLoading, setIsLoading] = useState(isActive);
  const [error, setError] = useState<string | null>(null);

  const doFetch = useCallback(async (): Promise<void> => {
    if (!isActive) return;
    setIsLoading(true);
    setError(null);
    try {
      const list = await listTeams(authToken ?? '');
      setTeams(filterActive(list));
    } catch (err: unknown) {
      setError(getAdminErrorMessage(err, '팀 목록을 불러오지 못했습니다.'));
      setTeams([]);
    } finally {
      setIsLoading(false);
    }
  }, [authToken, isActive]);

  useEffect(() => {
    if (!isActive) return;
    void doFetch();
  }, [isActive, doFetch]);

  return { teams, isLoading, error, refetch: doFetch };
}
