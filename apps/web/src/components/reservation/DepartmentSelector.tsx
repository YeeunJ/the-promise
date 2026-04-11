import { useEffect, useState } from 'react';
import { DEPARTMENTS, buildPastorDisplay } from '../../data/teams';
import type { Department, Team } from '../../data/teams';

export interface DepartmentSelection {
  departmentId: string;
  departmentName: string;
  teamId: string;
  teamName: string;
  pastorDisplay: string;
}

interface DepartmentSelectorProps {
  value: DepartmentSelection | null;
  onChange: (selection: DepartmentSelection) => void;
}

function DepartmentSelector({ value, onChange }: DepartmentSelectorProps): JSX.Element {
  const [selectedDept, setSelectedDept] = useState<Department | null>(
    value ? (DEPARTMENTS.find((d) => d.id === value.departmentId) ?? null) : null,
  );
  const [directInput, setDirectInput] = useState<string>(
    value?.departmentId === 'etc' ? value.teamName : '',
  );

  // 부모가 value를 null로 초기화할 때 내부 상태도 초기화 (선택 드리프트 방지)
  useEffect(() => {
    if (value === null) {
      setSelectedDept(null);
      setDirectInput('');
    } else {
      const dept = DEPARTMENTS.find((d) => d.id === value.departmentId);
      setSelectedDept(dept ?? null);
      if (value.departmentId === 'etc') {
        setDirectInput(value.teamName);
      }
    }
  }, [value]);

  function handleDeptClick(dept: Department) {
    setSelectedDept(dept);
    setDirectInput('');
    if (value?.departmentId !== dept.id) {
      onChange({
        departmentId: dept.id,
        departmentName: dept.name,
        teamId: '',
        teamName: '',
        pastorDisplay: '',
      });
    }
  }

  function handleTeamClick(team: Team) {
    if (!selectedDept) return;
    onChange({
      departmentId: selectedDept.id,
      departmentName: selectedDept.name,
      teamId: team.id,
      teamName: team.name,
      pastorDisplay: buildPastorDisplay(team.pastor),
    });
  }

  function handleDirectInputChange(text: string) {
    setDirectInput(text);
    onChange({
      departmentId: 'etc',
      departmentName: '기타',
      teamId: 'etc-direct',
      teamName: text,
      pastorDisplay: '',
    });
  }

  const isEtcSelected = selectedDept?.id === 'etc';
  const showTeams = selectedDept !== null && !isEtcSelected;
  const showPastor = Boolean(value?.teamId && value?.pastorDisplay && !isEtcSelected);

  return (
    <div className="space-y-4">
      {/* 부서 선택 */}
      <div>
        <p className="text-sm font-medium text-black mb-2">부서 선택</p>
        <div className="flex flex-wrap gap-2">
          {DEPARTMENTS.map((dept) => (
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
