import type { SpaceAvailabilityItem, TimeSlotValue } from '../types';

/**
 * 신청 직전, 선택한 공간이 해당 시간대에 여전히 예약 가능한지 명령형으로 재확인한다.
 * useSpaceAvailability 와 동일한 엔드포인트를 사용하되 단일 공간 결과만 평가한다.
 *
 * availability 값 의미: 'full' = 예약 가능, 'partial' / 'none' = 불가.
 * 해당 공간 항목을 찾지 못하면 판단이 불가능하므로 true(가능)로 간주하고
 * 최종 판정은 서버 검증에 위임한다.
 */
export async function checkSpaceAvailable(
  spaceId: number,
  timeSlot: TimeSlotValue,
): Promise<boolean> {
  const params = new URLSearchParams({
    start_datetime: timeSlot.startTime,
    end_datetime: timeSlot.endTime,
    show_unavailable: 'Y',
  });

  const res = await fetch(
    `${import.meta.env.VITE_API_BASE_URL}/api/v1/spaces/availability/?${params.toString()}`,
  );
  if (!res.ok) throw new Error(`HTTP ${res.status}`);

  const data: unknown = await res.json();
  if (!Array.isArray(data)) throw new Error('Invalid response');

  const item = (data as SpaceAvailabilityItem[]).find((i) => i.id === spaceId);
  if (!item) return true;
  return item.availability === 'full';
}
