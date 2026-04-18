import type { Reservation } from '../types';

/**
 * 예약의 공간 정보를 "건물명 [층수 ]공간명" 형식으로 변환
 * 예: "본관 2층 세미나실" / "교육관 대강당" (floor === null 이면 층수 생략)
 */
export function formatSpaceName(space: Reservation['space']): string {
  const floorPart = space.floor !== null ? `${space.floor}층 ` : '';
  return `${space.building.name} ${floorPart}${space.name}`;
}

export function formatSpaceNameParts(space: Reservation['space']): {
  buildingFloor: string;
  roomName: string;
} {
  const buildingFloor =
    space.floor !== null
      ? `${space.building.name} ${space.floor}층`
      : space.building.name;
  return { buildingFloor, roomName: space.name };
}
