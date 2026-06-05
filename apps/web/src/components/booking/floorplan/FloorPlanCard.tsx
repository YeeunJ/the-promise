import { getFloorPlan, floorPlanFloorLabel } from './floorPlanRegistry';

interface FloorPlanCardProps {
  buildingName: string;
  floor: number | null;
  /**
   * 현재 보고 있는 층에 선택된 장소가 있을 때만 그 방 이름을 전달한다.
   * 빈 문자열이면 강조 없이 평면도만 표시한다.
   */
  selectedSpaceName?: string;
}

/**
 * 현재 보고 있는 건물·층의 평면도를 보여주는 카드 (읽기 전용).
 * 등록된 평면도가 있으면 표시하고, 없으면 같은 자리에 "평면도 준비중입니다" 안내를 보여준다.
 * 장소 확정과 무관하게 buildingName/floor 기준으로 평면도를 고르며,
 * selectedSpaceName 이 있을 때만 해당 방을 강조한다.
 */
export function FloorPlanCard({
  buildingName,
  floor,
  selectedSpaceName = '',
}: FloorPlanCardProps): JSX.Element {
  const Plan = getFloorPlan(buildingName, floor);
  const headerLabel = `${buildingName} · ${floorPlanFloorLabel(floor)} 평면도`;

  return (
    <div className="mt-4 bg-surface rounded-2xl border border-edge shadow-design-md p-5">
      <div className="mb-3">
        <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-accent">
          Floor Plan
        </div>
        <div className="mt-0.5 text-sm font-bold text-ink">{headerLabel}</div>
      </div>

      {Plan ? (
        <Plan selectedSpaceName={selectedSpaceName} />
      ) : (
        <div className="flex items-center justify-center rounded-xl border border-dashed border-edge bg-surface-2 py-12">
          <p className="text-xs text-ink-mute">평면도 준비중입니다</p>
        </div>
      )}
    </div>
  );
}
