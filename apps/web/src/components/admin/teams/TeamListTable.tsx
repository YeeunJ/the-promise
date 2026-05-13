import type { AdminTeam } from '../../../types';

interface TeamListTableProps {
  teams: AdminTeam[];
  onEdit: (team: AdminTeam) => void;
  onDelete: (team: AdminTeam) => void;
}

function formatPastor(team: AdminTeam): string {
  if (team.pastor === null) return '-';
  return `${team.pastor.name} ${team.pastor.title}`;
}

function formatDepartment(team: AdminTeam): string {
  return team.department?.name ?? '-';
}

export function TeamListTable({
  teams,
  onEdit,
  onDelete,
}: TeamListTableProps): JSX.Element {
  if (teams.length === 0) {
    return (
      <div className="bg-white border border-[#E5E7EB] rounded-xl p-12 text-center">
        <p className="text-sm text-gray-500">등록된 팀이 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 text-gray-600">
          <tr>
            <th scope="col" className="px-4 py-3 text-left font-medium">팀명</th>
            <th scope="col" className="px-4 py-3 text-left font-medium">부서</th>
            <th scope="col" className="px-4 py-3 text-left font-medium">담당교역자</th>
            <th scope="col" className="px-4 py-3 text-left font-medium">연락처</th>
            <th scope="col" className="px-4 py-3 text-right font-medium">관리</th>
          </tr>
        </thead>
        <tbody>
          {teams.map((team) => (
            <tr
              key={team.id}
              className="border-t border-[#E5E7EB] hover:bg-gray-50/50"
            >
              <td className="px-4 py-3 text-black font-medium">{team.name}</td>
              <td className="px-4 py-3 text-gray-700">{formatDepartment(team)}</td>
              <td className="px-4 py-3 text-gray-700">{formatPastor(team)}</td>
              <td className="px-4 py-3 text-gray-700">{team.leader_phone}</td>
              <td className="px-4 py-3 text-right">
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => onEdit(team)}
                    className="text-sm font-medium text-primary hover:underline"
                    aria-label={`${team.name} 수정`}
                  >
                    수정
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(team)}
                    className="text-sm font-medium text-[#DC2626] hover:underline"
                    aria-label={`${team.name} 삭제`}
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
