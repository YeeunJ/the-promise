import { useEffect, useState } from 'react';
import { useDepartments } from '../../hooks/useDepartments';
import type { ApiDepartment, ApiTeam } from '../../types';

export interface DepartmentSelection {
  departmentId: number;
  departmentName: string;
  teamId: number | null;
  teamName: string;
  customTeamName: string | null;
  pastorDisplay: string;
}

interface DepartmentSelectorProps {
  value: DepartmentSelection | null;
  onChange: (selection: DepartmentSelection) => void;
}

function DepartmentSelector({ value, onChange }: DepartmentSelectorProps): JSX.Element {
  const { departments, isLoading, error } = useDepartments();

  const [selectedDept, setSelectedDept] = useState<ApiDepartment | null>(null);
  const [directInput, setDirectInput] = useState<string>('');

  useEffect(() => {
    if (value === null) {
      setSelectedDept(null);
      setDirectInput('');
      return;
    }
    const dept = departments.find((d) => d.id === value.departmentId) ?? null;
    setSelectedDept(dept);
    if (dept?.name === '기타') {
      setDirectInput(value.customTeamName ?? '');
    }
  }, [value, departments]);

  function handleDeptClick(dept: ApiDepartment) {
    setSelectedDept(dept);
    setDirectInput('');
    if (value?.departmentId !== dept.id) {
      onChange({
        departmentId: dept.id,
        departmentName: dept.name,
        teamId: null,
        teamName: '',
        customTeamName: null,
        pastorDisplay: '',
      });
    }
  }

  function handleTeamClick(team: ApiTeam) {
    if (!selectedDept) return;
    onChange({
      departmentId: selectedDept.id,
      departmentName: selectedDept.name,
      teamId: team.id,
      teamName: team.name,
      customTeamName: null,
      pastorDisplay: team.pastor_display,
    });
  }

  function handleDirectInputChange(text: string) {
    setDirectInput(text);
    if (!selectedDept) return;
    onChange({
      departmentId: selectedDept.id,
      departmentName: selectedDept.name,
      teamId: null,
      teamName: text,
      customTeamName: text,
      pastorDisplay: '',
    });
  }

  const isEtcSelected = selectedDept?.name === '기타';
  const showTeams = selectedDept !== null && !isEtcSelected;
  const showPastor = Boolean(value?.teamId && value?.pastorDisplay && !isEtcSelected);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8 text-sm text-gray-500">
        부서 정보를 불러오는 중...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 부서 선택 */}
      <div>
        <p className="text-sm font-medium text-black mb-2">부서 선택</p>
        <div className="flex flex-wrap gap-2">
          {departments.map((dept) => (
            <button
              key={dept.id}
              type="button"
              onClick={() => handleDeptClick(dept)}
              className={`rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
                selectedDept?.id === dept.id
                  ? 'bg-brand-primary text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {dept.name}
            </button>
          ))}
        </div>
      </div>

      {/* 기타: 직접 입력 */}
      {isEtcSelected && (
        <div>
          <p className="text-sm font-medium text-black mb-2">부서/단체명 직접 입력</p>
          <textarea
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary"
            placeholder="부서/단체명을 직접 입력해 주세요"
            rows={2}
            value={directInput}
            onChange={(e) => handleDirectInputChange(e.target.value)}
            autoFocus
          />
        </div>
      )}

      {/* 소그룹/팀 선택 */}
      <div
        className={`transition-all duration-200 ease-out overflow-hidden ${
          showTeams ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0 invisible'
        }`}
      >
        {selectedDept && !isEtcSelected && (
          <div>
            <p className="text-sm font-medium text-black mb-2">소그룹 선택</p>
            <div className="flex flex-wrap gap-2">
              {selectedDept.teams.map((team) => (
                <button
                  key={team.id}
                  type="button"
                  onClick={() => handleTeamClick(team)}
                  className={`rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
                    value?.teamId === team.id
                      ? 'bg-brand-primary text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {team.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 담당 교역자 표시 */}
      <div
        className={`transition-all duration-200 ease-out overflow-hidden ${
          showPastor ? 'max-h-24 opacity-100' : 'max-h-0 opacity-0 invisible'
        }`}
      >
        {showPastor && (
          <p className="text-sm text-gray-600 mt-1">
            <span className="text-brand-accent font-medium">담당 교역자</span>{' '}
            <span className="font-semibold text-black">{value?.pastorDisplay}</span>
          </p>
        )}
      </div>
    </div>
  );
}

export default DepartmentSelector;
