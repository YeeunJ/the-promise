import type { ComponentType } from 'react';
import { MainBuilding1F } from './MainBuilding1F';

/**
 * 평면도 컴포넌트 공통 props.
 * selectedSpaceName 은 DB 의 space.name 과 일치할 때 해당 방을 강조한다.
 */
export interface FloorPlanProps {
  selectedSpaceName: string;
}

function planKey(buildingName: string, floor: number | null): string {
  return `${buildingName}|${floor ?? 'etc'}`;
}

/** 건물명+층 → 평면도 컴포넌트. 등록되지 않은 건물/층은 조회되지 않는다. */
const FLOOR_PLANS: Record<string, ComponentType<FloorPlanProps>> = {
  [planKey('본당', 1)]: MainBuilding1F,
};

/** 등록된 평면도가 있으면 컴포넌트를, 없으면 null 을 반환한다. */
export function getFloorPlan(
  buildingName: string,
  floor: number | null,
): ComponentType<FloorPlanProps> | null {
  return FLOOR_PLANS[planKey(buildingName, floor)] ?? null;
}

/** 카드 헤더용 층 라벨. (SpaceSelector 의 floorLabel 과 표기 통일: 1F / 지하1F) */
export function floorPlanFloorLabel(floor: number | null): string {
  if (floor === null) return '기타';
  if (floor === -1) return '지하1F';
  return `${floor}F`;
}
