import type { AdminSpace } from '../../../types';

interface SpaceListTableProps {
  spaces: AdminSpace[];
  onEdit: (space: AdminSpace) => void;
  onDelete: (space: AdminSpace) => void;
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
            <th scope="col" className="px-4 py-3 text-left font-medium">건물</th>
            <th scope="col" className="px-4 py-3 text-left font-medium">공간명</th>
            <th scope="col" className="px-4 py-3 text-left font-medium">층</th>
            <th scope="col" className="px-4 py-3 text-left font-medium">정원</th>
            <th scope="col" className="px-4 py-3 text-right font-medium">관리</th>
          </tr>
        </thead>
        <tbody>
          {spaces.map((space) => (
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
                    className="text-sm font-medium text-brand-primary hover:underline"
                    aria-label={`${space.name} 수정`}
                  >
                    수정
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(space)}
                    className="text-sm font-medium text-[#DC2626] hover:underline"
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
