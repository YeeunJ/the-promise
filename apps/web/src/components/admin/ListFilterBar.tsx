import { useState, useRef, useEffect, useMemo } from 'react';
import { getBuildingColor } from '../../lib/adminConstants';
import type { Reservation, Space } from '../../types';

type DatePreset = '1w' | '2w' | '1m' | 'custom';

interface ListFilterBarProps {
  reservations: Reservation[];
  spaceFilter: Set<number>;
  onSpaceFilterChange: (filter: Set<number>) => void;
  datePreset: DatePreset;
  onDatePresetChange: (preset: DatePreset) => void;
  dateRange: { from: string; to: string };
  onDateRangeChange: (range: { from: string; to: string }) => void;
  teamFilter: Set<string>;
  onTeamFilterChange: (filter: Set<string>) => void;
  spaces: Space[];
}

const DATE_PRESET_LABELS: Record<DatePreset, string> = {
  '1w': '1주 이내',
  '2w': '2주 이내',
  '1m': '한달 이내',
  custom: '날짜선택',
};

function computeDateRange(preset: Exclude<DatePreset, 'custom'>): {
  from: string;
  to: string;
} {
  const today = new Date();
  const from = today.toISOString().slice(0, 10);
  const future = new Date(today);
  if (preset === '1w') future.setDate(future.getDate() + 7);
  else if (preset === '2w') future.setDate(future.getDate() + 14);
  else future.setMonth(future.getMonth() + 1);
  const to = future.toISOString().slice(0, 10);
  return { from, to };
}

type OpenDropdown = 'space' | 'date' | 'team' | null;

export function ListFilterBar({
  reservations,
  spaceFilter,
  onSpaceFilterChange,
  datePreset,
  onDatePresetChange,
  dateRange,
  onDateRangeChange,
  teamFilter,
  onTeamFilterChange,
  spaces,
}: ListFilterBarProps) {
  const [openDropdown, setOpenDropdown] = useState<OpenDropdown>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpenDropdown(null);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Group spaces by building
  const buildingGroups = useMemo(() => {
    const groups = new Map<string, Space[]>();
    for (const space of spaces) {
      const name = space.building.name;
      const list = groups.get(name) ?? [];
      list.push(space);
      groups.set(name, list);
    }
    return groups;
  }, [spaces]);

  // Extract unique teams from reservations
  const teams = useMemo(() => {
    const set = new Set<string>();
    for (const r of reservations) {
      set.add(r.applicant_team);
    }
    return [...set].sort();
  }, [reservations]);

  function toggleDropdown(name: OpenDropdown) {
    setOpenDropdown((prev) => (prev === name ? null : name));
  }

  // --- Space filter handlers ---
  function handleSpaceToggle(spaceId: number) {
    const next = new Set(spaceFilter);
    if (next.has(spaceId)) next.delete(spaceId);
    else next.add(spaceId);
    onSpaceFilterChange(next);
  }

  function handleSelectAllSpaces() {
    onSpaceFilterChange(new Set(spaces.map((s) => s.id)));
  }

  function handleDeselectAllSpaces() {
    onSpaceFilterChange(new Set());
  }

  function handleBuildingSelect(buildingName: string) {
    const buildingSpaces = buildingGroups.get(buildingName) ?? [];
    const next = new Set(spaceFilter);
    for (const s of buildingSpaces) next.add(s.id);
    onSpaceFilterChange(next);
  }

  // --- Date filter handlers ---
  function handleDatePresetSelect(preset: DatePreset) {
    onDatePresetChange(preset);
    if (preset !== 'custom') {
      onDateRangeChange(computeDateRange(preset));
    }
  }

  // --- Team filter handlers ---
  function handleTeamToggle(team: string) {
    const next = new Set(teamFilter);
    if (next.has(team)) next.delete(team);
    else next.add(team);
    onTeamFilterChange(next);
  }

  const btnClass =
    'border border-[#E5E7EB] rounded-xl px-3 py-2 text-sm bg-white hover:bg-gray-50 transition-colors';
  const dropdownClass =
    'absolute top-full left-0 mt-1 bg-white rounded-xl shadow-lg border border-[#E5E7EB] p-3 z-50 min-w-[200px]';

  return (
    <div ref={containerRef} className="flex gap-2 relative">
      {/* Space filter */}
      <div className="relative">
        <button
          type="button"
          className={btnClass}
          onClick={() => toggleDropdown('space')}
        >
          장소{spaceFilter.size > 0 ? ` ${spaceFilter.size}` : ''} ▼
        </button>
        {openDropdown === 'space' && (
          <div className={dropdownClass}>
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-sm">전체 장소</span>
              <div className="flex gap-1">
                <button
                  type="button"
                  data-testid="space-select-all"
                  className="text-xs text-blue-600 hover:underline"
                  onClick={handleSelectAllSpaces}
                >
                  전체선택
                </button>
                <span className="text-xs text-gray-300">/</span>
                <button
                  type="button"
                  data-testid="space-deselect-all"
                  className="text-xs text-blue-600 hover:underline"
                  onClick={handleDeselectAllSpaces}
                >
                  전체해제
                </button>
              </div>
            </div>
            {[...buildingGroups.entries()].map(
              ([buildingName, buildingSpaces]) => {
                const color = getBuildingColor(buildingName);
                return (
                  <div key={buildingName} className="mb-2 last:mb-0">
                    <div className="flex items-center justify-between mb-1">
                      <span
                        className="text-xs font-medium px-1.5 py-0.5 rounded"
                        style={{
                          color: color.main,
                          backgroundColor: color.bg,
                          border: `1px solid ${color.border}`,
                        }}
                      >
                        {buildingName}
                      </span>
                      <button
                        type="button"
                        data-testid={`building-select-${buildingName}`}
                        className="text-xs text-blue-600 hover:underline"
                        onClick={() => handleBuildingSelect(buildingName)}
                      >
                        전체선택
                      </button>
                    </div>
                    {buildingSpaces.map((space) => (
                      <label
                        key={space.id}
                        className="flex items-center gap-2 py-0.5 pl-2 text-sm cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          className="accent-brand-primary"
                          checked={spaceFilter.has(space.id)}
                          onChange={() => handleSpaceToggle(space.id)}
                        />
                        {space.name}
                      </label>
                    ))}
                  </div>
                );
              },
            )}
          </div>
        )}
      </div>

      {/* Date filter */}
      <div className="relative">
        <button
          type="button"
          className={btnClass}
          onClick={() => toggleDropdown('date')}
        >
          {DATE_PRESET_LABELS[datePreset]} ▼
        </button>
        {openDropdown === 'date' && (
          <div className={dropdownClass}>
            {(['1w', '2w', '1m', 'custom'] as DatePreset[]).map((preset) => (
              <button
                key={preset}
                type="button"
                className={`block w-full text-left px-2 py-1.5 text-sm rounded hover:bg-gray-100 ${
                  datePreset === preset ? 'font-medium text-blue-600' : ''
                }`}
                onClick={() => handleDatePresetSelect(preset)}
              >
                {DATE_PRESET_LABELS[preset]}
              </button>
            ))}
            {datePreset === 'custom' && (
              <div className="mt-2 pt-2 border-t border-[#E5E7EB] flex gap-2">
                <label className="text-sm">
                  <span className="block text-xs text-gray-500 mb-0.5">
                    시작일
                  </span>
                  <input
                    type="date"
                    aria-label="시작일"
                    className="border border-[#E5E7EB] rounded px-2 py-1 text-sm"
                    value={dateRange.from}
                    onChange={(e) =>
                      onDateRangeChange({ ...dateRange, from: e.target.value })
                    }
                  />
                </label>
                <label className="text-sm">
                  <span className="block text-xs text-gray-500 mb-0.5">
                    종료일
                  </span>
                  <input
                    type="date"
                    aria-label="종료일"
                    className="border border-[#E5E7EB] rounded px-2 py-1 text-sm"
                    value={dateRange.to}
                    onChange={(e) =>
                      onDateRangeChange({ ...dateRange, to: e.target.value })
                    }
                  />
                </label>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Team filter */}
      <div className="relative">
        <button
          type="button"
          className={btnClass}
          onClick={() => toggleDropdown('team')}
        >
          그룹 ▼
        </button>
        {openDropdown === 'team' && (
          <div className={dropdownClass}>
            {teams.map((team) => (
              <label
                key={team}
                className="flex items-center gap-2 py-0.5 text-sm cursor-pointer"
              >
                <input
                  type="checkbox"
                  className="accent-brand-primary"
                  checked={teamFilter.has(team)}
                  onChange={() => handleTeamToggle(team)}
                />
                {team}
              </label>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
