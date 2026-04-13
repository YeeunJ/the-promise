import { useEffect, useState } from 'react';
import type { OccupiedSlot } from '../types';
import { validateOccupiedSlots } from '../utils/occupiedSlotHelpers';

interface UseOccupiedSlotsResult {
  occupiedSlots: OccupiedSlot[];
  isLoading: boolean;
  error: string | null;
}

export function useOccupiedSlots(
  spaceId: number | null,
  date: string,
): UseOccupiedSlotsResult {
  const [occupiedSlots, setOccupiedSlots] = useState<OccupiedSlot[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (spaceId === null || !date) {
      setOccupiedSlots([]);
      setIsLoading(false);
      setError(null);
      return;
    }

    const controller = new AbortController();
    setIsLoading(true);
    setError(null);

    fetch(`${import.meta.env.VITE_API_BASE_URL}/api/v1/spaces/${spaceId}/reservations/?date=${encodeURIComponent(date)}`, {
      signal: controller.signal,
    })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data: unknown) => {
        setOccupiedSlots(validateOccupiedSlots(data));
        setIsLoading(false);
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        setError('예약 정보를 불러오지 못했습니다');
        setOccupiedSlots([]);
        setIsLoading(false);
      });

    return () => controller.abort();
  }, [spaceId, date]);

  return { occupiedSlots, isLoading, error };
}
