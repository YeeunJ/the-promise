import type { AdminBuilding } from '../../../types';

interface BuildingListTableProps {
  buildings: AdminBuilding[];
  onEdit: (building: AdminBuilding) => void;
  onDelete: (building: AdminBuilding) => void;
}

export function BuildingListTable({
  buildings,
  onEdit,
  onDelete,
}: BuildingListTableProps): JSX.Element {
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
            <th scope="col" className="px-4 py-3 text-left font-medium">건물명</th>
            <th scope="col" className="px-4 py-3 text-left font-medium">설명</th>
            <th scope="col" className="px-4 py-3 text-right font-medium">관리</th>
          </tr>
        </thead>
        <tbody>
          {buildings.map((building) => (
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
                    className="text-sm font-medium text-brand-primary hover:underline"
                    aria-label={`${building.name} 수정`}
                  >
                    수정
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(building)}
                    className="text-sm font-medium text-[#DC2626] hover:underline"
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
