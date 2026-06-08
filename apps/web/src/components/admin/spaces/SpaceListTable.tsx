import { useState } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import type { AdminSpace } from '../../../types';

interface SpaceListTableProps {
  spaces: AdminSpace[];
  onEdit: (space: AdminSpace) => void;
  onDelete: (space: AdminSpace) => void;
}

type SortKey = 'name' | 'building' | 'capacity' | 'floor';
type SortDir = 'asc' | 'desc';

interface SortableHeaderProps {
  label: string;
  sortKey: SortKey;
  currentKey: SortKey;
  currentDir: SortDir;
  onSort: (key: SortKey) => void;
}

function SortableHeader({ label, sortKey, currentKey, currentDir, onSort }: SortableHeaderProps): JSX.Element {
  const active = sortKey === currentKey;
  return (
    <th
      scope="col"
      className="px-4 py-3 text-left font-medium cursor-pointer select-none hover:bg-gray-100"
      onClick={() => onSort(sortKey)}
    >
      <span className="inline-flex items-center gap-1">
        {label}
        {active ? (
          currentDir === 'asc' ? <ChevronUp size={13} /> : <ChevronDown size={13} />
        ) : (
          <ChevronDown size={13} className="opacity-30" />
        )}
      </span>
    </th>
  );
}

function formatFloor(floor: number | null): string {
  return floor === null ? '-' : `${String(floor)}층`;
}

function formatCapacity(capacity: number | null): string {
  return capacity === null ? '-' : `${String(capacity)}명`;
}

export function SpaceListTable({
  spaces,
  onEdit,
  onDelete,
}: SpaceListTableProps): JSX.Element {
  const [sortKey, setSortKey] = useState<SortKey>('building');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  function handleSort(key: SortKey): void {
    if (key === sortKey) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  }

  const sortedSpaces = [...spaces].sort((a, b) => {
    let cmp: number;
    if (sortKey === 'building') {
      cmp = a.building.name.localeCompare(b.building.name, 'ko');
    } else if (sortKey === 'capacity') {
      const aVal = a.capacity ?? -1;
      const bVal = b.capacity ?? -1;
      cmp = aVal - bVal;
    } else if (sortKey === 'floor') {
      const aVal = a.floor ?? -1;
      const bVal = b.floor ?? -1;
      cmp = aVal - bVal;
    } else {
      cmp = a.name.localeCompare(b.name, 'ko');
    }
    return sortDir === 'asc' ? cmp : -cmp;
  });

  if (spaces.length === 0) {
    return (
      <div className="bg-white border border-[#E5E7EB] rounded-xl p-12 text-center">
        <p className="text-sm text-gray-500">등록된 공간이 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 text-gray-600">
          <tr>
            <SortableHeader label="건물" sortKey="building" currentKey={sortKey} currentDir={sortDir} onSort={handleSort} />
            <SortableHeader label="공간명" sortKey="name" currentKey={sortKey} currentDir={sortDir} onSort={handleSort} />
            <SortableHeader label="층" sortKey="floor" currentKey={sortKey} currentDir={sortDir} onSort={handleSort} />
            <SortableHeader label="정원" sortKey="capacity" currentKey={sortKey} currentDir={sortDir} onSort={handleSort} />
            <th scope="col" className="px-4 py-3 text-right font-medium">관리</th>
          </tr>
        </thead>
        <tbody>
          {sortedSpaces.map((space) => (
            <tr
              key={space.id}
              className="border-t border-[#E5E7EB] hover:bg-gray-50/50"
            >
              <td className="px-4 py-3 text-gray-700">{space.building.name}</td>
              <td className="px-4 py-3 text-black font-medium">{space.name}</td>
              <td className="px-4 py-3 text-gray-700">{formatFloor(space.floor)}</td>
              <td className="px-4 py-3 text-gray-700">{formatCapacity(space.capacity)}</td>
              <td className="px-4 py-3 text-right">
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => onEdit(space)}
                    className="text-sm font-medium text-primary bg-primary/10 border border-primary/20 px-3 py-1.5 rounded-lg hover:bg-primary/20 transition-colors"
                    aria-label={`${space.name} 수정`}
                  >
                    수정
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(space)}
                    className="text-sm font-medium text-[#DC2626] bg-red-50 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-100 transition-colors"
                    aria-label={`${space.name} 삭제`}
                  >
                    삭제
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
