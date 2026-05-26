import { useEffect, useState } from 'react';
import type { SpaceAvailabilityItem, TimeSlotValue } from '../types';

interface UseSpaceAvailabilityResult {
  availabilityMap: Map<number, SpaceAvailabilityItem>;
  isLoading: boolean;
  error: string | null;
}

export function useSpaceAvailability(timeSlot: TimeSlotValue | null): UseSpaceAvailabilityResult {
  const [availabilityMap, setAvailabilityMap] = useState<Map<number, SpaceAvailabilityItem>>(
    new Map(),
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasFullSlot =
    timeSlot !== null &&
    timeSlot.date !== '' &&
    timeSlot.startTime !== '' &&
    timeSlot.endTime !== '';

  useEffect(() => {
    if (!hasFullSlot || timeSlot === null) {
      setAvailabilityMap(new Map());
      setIsLoading(false);
      setError(null);
      return;
    }

    const startDatetime = timeSlot.startTime;
    const endDatetime = timeSlot.endTime;

    const controller = new AbortController();
    setIsLoading(true);
    setError(null);

    const params = new URLSearchParams({
      start_datetime: startDatetime,
      end_datetime: endDatetime,
      show_unavailable: 'Y',
    });

    fetch(
      `${import.meta.env.VITE_API_BASE_URL}/api/v1/spaces/availability/?${params.toString()}`,
      { signal: controller.signal },
    )
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data: unknown) => {
        if (!Array.isArray(data)) throw new Error('Invalid response');
        const map = new Map<number, SpaceAvailabilityItem>();
        for (const item of data as SpaceAvailabilityItem[]) {
          map.set(item.id, item);
        }
        setAvailabilityMap(map);
        setIsLoading(false);
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        setError('예약 가능 여부를 불러오지 못했습니다');
        setAvailabilityMap(new Map());
        setIsLoading(false);
      });

    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasFullSlot, timeSlot?.startTime, timeSlot?.endTime]);

  return { availabilityMap, isLoading, error };
}
