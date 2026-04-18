import { useEffect, useState } from 'react';
import axios from 'axios';
import type { BuildingWithSpaces, Space } from '../types';

interface SpaceSelectorProps {
  value: number | null;
  onChange: (spaceId: number) => void;
  onSpaceSelect?: (space: Space) => void;
}

function groupByFloor(spaces: Space[]): Map<number | null, Space[]> {
  const map = new Map<number | null, Space[]>();
  for (const space of spaces) {
    const key = space.floor;
    const group = map.get(key);
    if (group) {
      group.push(space);
    } else {
      map.set(key, [space]);
    }
  }
  return map;
}

function getSortedFloors(floorMap: Map<number | null, Space[]>): (number | null)[] {
  const floors = Array.from(floorMap.keys());
  return floors.sort((a, b) => {
    if (a === null) return 1;
    if (b === null) return -1;
    return a - b;
  });
}

function floorLabel(floor: number | null): string {
  if (floor === null) return '기타';
  return `${floor}층`;
}

function pickDefaultBuilding(buildings: BuildingWithSpaces[]): BuildingWithSpaces | null {
  if (buildings.length === 0) return null;
  return buildings.find((b) => b.name.includes('본당')) ?? buildings[0];
}

function pickDefaultFloor(floors: (number | null)[]): number | null | undefined {
  if (floors.length === 0) return undefined;
  const floor1 = floors.find((f) => f === 1);
  return floor1 !== undefined ? floor1 : floors[0];
}

export function SpaceSelector({ value, onChange, onSpaceSelect }: SpaceSelectorProps): JSX.Element {
  const [buildings, setBuildings] = useState<BuildingWithSpaces[]>([]);
  const [selectedBuildingId, setSelectedBuildingId] = useState<number | null>(null);
  const [selectedFloor, setSelectedFloor] = useState<number | null | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    axios
      .get<BuildingWithSpaces[]>(`${import.meta.env.VITE_API_BASE_URL}/api/v1/spaces/`)
      .then((res) => {
        setBuildings(res.data);
        const defaultBuilding = pickDefaultBuilding(res.data);
        if (defaultBuilding) {
          setSelectedBuildingId(defaultBuilding.id);
          const floorMap = groupByFloor(defaultBuilding.spaces);
          const floors = getSortedFloors(floorMap);
          setSelectedFloor(pickDefaultFloor(floors));
        }
      })
      .catch(() => {
        setError('장소 목록을 불러오는 데 실패했습니다. 잠시 후 다시 시도해주세요.');
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const selectedBuilding = buildings.find((b) => b.id === selectedBuildingId) ?? null;
  const floorMap = selectedBuilding ? groupByFloor(selectedBuilding.spaces) : new Map<number | null, Space[]>();
  const sortedFloors = getSortedFloors(floorMap);
  const currentFloorSpaces = selectedFloor !== undefined ? (floorMap.get(selectedFloor) ?? []) : [];

  function handleBuildingSelect(buildingId: number) {
    setSelectedBuildingId(buildingId);
    onChange(0);
    const building = buildings.find((b) => b.id === buildingId);
    if (building) {
      const fm = groupByFloor(building.spaces);
      const floors = getSortedFloors(fm);
      setSelectedFloor(pickDefaultFloor(floors));
    } else {
      setSelectedFloor(undefined);
    }
  }

  function handleFloorSelect(floor: number | null) {
    setSelectedFloor(floor);
  }

  function handleSpaceSelect(space: Space) {
    onChange(space.id);
    onSpaceSelect?.(space);
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-primary border-t-transparent" />
        <span className="ml-2 text-sm text-black">장소 목록 불러오는 중...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl bg-[#DC2626]/10 p-4 text-sm text-[#DC2626]">
        {error}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 h-full">
      {/* Zone 1: 건물 탭 (상단 가로) */}
      <div className="flex gap-2 flex-wrap w-full">
        {buildings.map((building) => (
          <button
            key={building.id}
            type="button"
            onClick={() => handleBuildingSelect(building.id)}
            className={`flex-1 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              selectedBuildingId === building.id
                ? 'bg-brand-accent text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {building.name}
          </button>
        ))}
      </div>

      {/* Zone 2+3: 층 탭(좌) + 공간 카드(우) */}
      {selectedBuildingId !== null && (
        <div className="flex gap-3 flex-1 min-h-0 overflow-hidden">
          {/* Zone 2: 층 탭 (세로 좌측) */}
          <div className="flex flex-col gap-1 flex-shrink-0 overflow-y-auto">
            {sortedFloors.map((floor) => (
              <button
                key={floor === null ? 'null' : floor}
                type="button"
                onClick={() => handleFloorSelect(floor)}
                className={`rounded-lg px-3 py-2 text-sm font-medium text-left whitespace-nowrap transition-colors ${
                  selectedFloor === floor
                    ? 'bg-brand-primary text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {floorLabel(floor)}
              </button>
            ))}
          </div>

          {/* Zone 3: 공간 카드 (우측 그리드) */}
          <div className="flex-1 overflow-y-auto">
            {selectedFloor === undefined ? (
              <p className="text-sm text-gray-400 pt-2">층을 선택해주세요</p>
            ) : currentFloorSpaces.length === 0 ? (
              <p className="text-sm text-gray-400 pt-2">이 층에 공간이 없습니다</p>
            ) : (
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {currentFloorSpaces.map((space) => (
                  <button
                    key={space.id}
                    type="button"
                    onClick={() => handleSpaceSelect(space)}
                    className={`rounded-xl border p-3 text-left transition-colors ${
                      value === space.id
                        ? 'border-brand-primary bg-brand-primary/10 text-brand-primary'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-brand-primary/30 hover:bg-brand-primary/5'
                    }`}
                  >
                    <span className="block font-medium">{space.name}</span>
                    {space.capacity !== null && (
                      <span className="text-xs text-gray-500">수용인원: {space.capacity}명</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default SpaceSelector;
