import type { SpaceSelection } from '../../../types/booking';
import { getFloorPlan, floorPlanFloorLabel } from './floorPlanRegistry';

interface FloorPlanCardProps {
  space: SpaceSelection;
}

/**
 * 선택한 장소의 위치를 보여주는 평면도 카드 (읽기 전용).
 * 등록된 평면도가 있으면 표시하고, 없으면 같은 자리에 "평면도 준비중입니다" 안내를 보여준다.
 */
export function FloorPlanCard({ space }: FloorPlanCardProps): JSX.Element {
  const Plan = getFloorPlan(space.buildingName, space.floor);
  const headerLabel = `${space.buildingName} · ${floorPlanFloorLabel(space.floor)} 평면도`;

  return (
    <div className="mt-4 bg-surface rounded-2xl border border-edge shadow-design-md p-5">
      <div className="mb-3">
        <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-accent">
          Floor Plan
        </div>
        <div className="mt-0.5 text-sm font-bold text-ink">{headerLabel}</div>
      </div>

      {Plan ? (
        <Plan selectedSpaceName={space.spaceName} />
      ) : (
        <div className="flex items-center justify-center rounded-xl border border-dashed border-edge bg-surface-2 py-12">
          <p className="text-xs text-ink-mute">평면도 준비중입니다</p>
        </div>
      )}
    </div>
  );
}
