import { useState } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import type { AdminBuilding } from '../../../types';

interface BuildingListTableProps {
  buildings: AdminBuilding[];
  onEdit: (building: AdminBuilding) => void;
  onDelete: (building: AdminBuilding) => void;
}

type SortDir = 'asc' | 'desc';

interface SortableHeaderProps {
  label: string;
  active: boolean;
  dir: SortDir;
  onSort: () => void;
}

function SortableHeader({ label, active, dir, onSort }: SortableHeaderProps): JSX.Element {
  return (
    <th
      scope="col"
      className="px-4 py-3 text-left font-medium cursor-pointer select-none hover:bg-gray-100"
      onClick={onSort}
    >
      <span className="inline-flex items-center gap-1">
        {label}
        {active ? (
          dir === 'asc' ? <ChevronUp size={13} /> : <ChevronDown size={13} />
        ) : (
          <ChevronDown size={13} className="opacity-30" />
        )}
      </span>
    </th>
  );
}

export function BuildingListTable({
  buildings,
  onEdit,
  onDelete,
}: BuildingListTableProps): JSX.Element {
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  function handleSort(): void {
    setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
  }

  const sortedBuildings = [...buildings].sort((a, b) => {
    const cmp = a.name.localeCompare(b.name, 'ko');
    return sortDir === 'asc' ? cmp : -cmp;
  });

  if (buildings.length === 0) {
    return (
      <div className="bg-white border border-[#E5E7EB] rounded-xl p-12 text-center">
        <p className="text-sm text-gray-500">등록된 건물이 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 text-gray-600">
          <tr>
            <SortableHeader label="건물명" active={true} dir={sortDir} onSort={handleSort} />
            <th scope="col" className="px-4 py-3 text-left font-medium">설명</th>
            <th scope="col" className="px-4 py-3 text-right font-medium">관리</th>
          </tr>
        </thead>
        <tbody>
          {sortedBuildings.map((building) => (
            <tr
              key={building.id}
              className="border-t border-[#E5E7EB] hover:bg-gray-50/50"
            >
              <td className="px-4 py-3 text-black font-medium">{building.name}</td>
              <td className="px-4 py-3 text-gray-700">
                {building.description ?? '-'}
              </td>
              <td className="px-4 py-3 text-right">
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => onEdit(building)}
                    className="text-sm font-medium text-primary bg-primary/10 border border-primary/20 px-3 py-1.5 rounded-lg hover:bg-primary/20 transition-colors"
                    aria-label={`${building.name} 수정`}
                  >
                    수정
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(building)}
                    className="text-sm font-medium text-[#DC2626] bg-red-50 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-100 transition-colors"
                    aria-label={`${building.name} 삭제`}
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
