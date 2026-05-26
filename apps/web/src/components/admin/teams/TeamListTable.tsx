import { useState } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import type { AdminTeam } from '../../../types';

interface TeamListTableProps {
  teams: AdminTeam[];
  onEdit: (team: AdminTeam) => void;
  onDelete: (team: AdminTeam) => void;
}

type SortKey = 'name' | 'department';
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
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  function handleSort(key: SortKey): void {
    if (key === sortKey) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  }

  const sortedTeams = [...teams].sort((a, b) => {
    let aVal: string;
    let bVal: string;
    if (sortKey === 'department') {
      aVal = a.department?.name ?? '';
      bVal = b.department?.name ?? '';
    } else {
      aVal = a.name;
      bVal = b.name;
    }
    const cmp = aVal.localeCompare(bVal, 'ko');
    return sortDir === 'asc' ? cmp : -cmp;
  });

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
            <SortableHeader label="팀명" sortKey="name" currentKey={sortKey} currentDir={sortDir} onSort={handleSort} />
            <SortableHeader label="부서" sortKey="department" currentKey={sortKey} currentDir={sortDir} onSort={handleSort} />
            <th scope="col" className="px-4 py-3 text-left font-medium">담당교역자</th>
            <th scope="col" className="px-4 py-3 text-left font-medium">연락처</th>
            <th scope="col" className="px-4 py-3 text-right font-medium">관리</th>
          </tr>
        </thead>
        <tbody>
          {sortedTeams.map((team) => (
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
                    className="text-sm font-medium text-primary bg-primary/10 border border-primary/20 px-3 py-1.5 rounded-lg hover:bg-primary/20 transition-colors"
                    aria-label={`${team.name} 수정`}
                  >
                    수정
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(team)}
                    className="text-sm font-medium text-[#DC2626] bg-red-50 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-100 transition-colors"
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
