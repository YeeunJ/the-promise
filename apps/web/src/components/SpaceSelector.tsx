import { useEffect, useState } from 'react';
import axios from 'axios';
import type { BuildingWithSpaces, Space } from '../types';

interface SpaceSelectorProps {
  value: number | null;
  onChange: (spaceId: number) => void;
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
  // null("기타")은 마지막에 정렬
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

export function SpaceSelector({ value, onChange }: SpaceSelectorProps): JSX.Element {
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
  // selectedFloor가 undefined면 아직 선택 전, null이면 "기타" 선택
  const currentFloorSpaces =
    selectedFloor !== undefined ? (floorMap.get(selectedFloor) ?? []) : [];

  function handleBuildingSelect(buildingId: number) {
    setSelectedBuildingId(buildingId);
    setSelectedFloor(undefined);
    onChange(0);
  }

  function handleFloorSelect(floor: number | null) {
    setSelectedFloor(floor);
  }

  function handleSpaceSelect(spaceId: number) {
    onChange(spaceId);
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
        <span className="ml-2 text-sm text-gray-500">장소 목록 불러오는 중...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-md bg-red-50 p-4 text-sm text-red-600">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 1단계: 건물 선택 */}
      <div>
        <p className="mb-2 text-sm font-medium text-gray-700">건물 선택</p>
        <div className="flex flex-wrap gap-2">
          {buildings.map((building) => (
            <button
              key={building.id}
              type="button"
              onClick={() => handleBuildingSelect(building.id)}
              className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                selectedBuildingId === building.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {building.name}
            </button>
          ))}
        </div>
      </div>

      {/* 2단계: 층 선택 */}
      {selectedBuildingId !== null && (
        <div>
          <p className="mb-2 text-sm font-medium text-gray-700">층 선택</p>
          <div className="flex flex-wrap gap-2">
            {sortedFloors.map((floor) => (
              <button
                key={floor === null ? 'null' : floor}
                type="button"
                onClick={() => handleFloorSelect(floor)}
                className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                  selectedFloor === floor
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {floorLabel(floor)}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 3단계: 공간 선택 */}
      {selectedFloor !== undefined && (
        <div>
          <p className="mb-2 text-sm font-medium text-gray-700">공간 선택</p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {currentFloorSpaces.map((space) => (
              <button
                key={space.id}
                type="button"
                onClick={() => handleSpaceSelect(space.id)}
                className={`rounded-md border p-3 text-left transition-colors ${
                  value === space.id
                    ? 'border-blue-600 bg-blue-50 text-blue-800'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-blue-300 hover:bg-blue-50'
                }`}
              >
                <span className="block font-medium">{space.name}</span>
                {space.capacity !== null && (
                  <span className="text-xs text-gray-500">수용인원: {space.capacity}명</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default SpaceSelector;
