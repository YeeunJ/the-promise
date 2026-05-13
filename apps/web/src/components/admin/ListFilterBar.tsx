import { useState, useRef, useEffect, useMemo } from 'react';
import { getBuildingColor } from '../../lib/adminConstants';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import type { Space } from '../../types';
import type { PaginatedReservationsFilters } from '../../hooks/usePaginatedReservations';

const SEARCH_DEBOUNCE_MS = 250;

type DatePreset = '1w' | '2w' | '1m' | 'custom';
type OpenDropdown = 'space' | 'date' | null;

interface ListFilterBarProps {
  filters: PaginatedReservationsFilters;
  onFiltersChange: (next: PaginatedReservationsFilters) => void;
  spaces: Space[];
  isLoading?: boolean;
  orientation?: 'horizontal' | 'vertical';
}

const DATE_PRESET_LABELS: Record<DatePreset, string> = {
  '1w': '1주 이내',
  '2w': '2주 이내',
  '1m': '한달 이내',
  custom: '날짜선택',
};

function formatDateOnly(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function computePresetRange(preset: Exclude<DatePreset, 'custom'>): {
  from: string;
  to: string;
} {
  const today = new Date();
  const from = formatDateOnly(today);
  const future = new Date(today);
  if (preset === '1w') future.setDate(future.getDate() + 7);
  else if (preset === '2w') future.setDate(future.getDate() + 14);
  else future.setMonth(future.getMonth() + 1);
  const to = formatDateOnly(future);
  return { from, to };
}

export function ListFilterBar({
  filters,
  onFiltersChange,
  spaces,
  isLoading = false,
  orientation = 'horizontal',
}: ListFilterBarProps): JSX.Element {
  const isVertical = orientation === 'vertical';
  const [openDropdown, setOpenDropdown] = useState<OpenDropdown>(null);
  const [datePreset, setDatePreset] = useState<DatePreset>('1w');
  const containerRef = useRef<HTMLDivElement>(null);

  const [searchInput, setSearchInput] = useState<string>(filters.search ?? '');
  const debouncedSearch = useDebouncedValue(searchInput, SEARCH_DEBOUNCE_MS);
  const lastDispatchedSearchRef = useRef<string | undefined>(filters.search);

  // 외부 filters.search 와 내부 input 동기화 (탭/필터 전환 등 외부 리셋 대응)
  useEffect(() => {
    const external = filters.search ?? '';
    if (external !== searchInput && external !== lastDispatchedSearchRef.current) {
      setSearchInput(external);
    }
    // 의도적으로 filters.search 만 의존 — searchInput 자체 변경은 사용자 입력
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.search]);

  // 디바운스된 입력이 변하면 onFiltersChange 호출 (trim 후 빈값은 undefined)
  useEffect(() => {
    const trimmed = debouncedSearch.trim();
    const normalized = trimmed === '' ? undefined : trimmed;
    if (normalized === (filters.search ?? undefined)) return;
    lastDispatchedSearchRef.current = normalized;
    onFiltersChange({ ...filters, search: normalized });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent): void {
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

  const selectedSpace = useMemo(() => {
    if (typeof filters.space_id !== 'number') return null;
    return spaces.find((s) => s.id === filters.space_id) ?? null;
  }, [filters.space_id, spaces]);

  function toggleDropdown(name: OpenDropdown): void {
    setOpenDropdown((prev) => (prev === name ? null : name));
  }

  function handleSpaceSelect(spaceId: number | undefined): void {
    onFiltersChange({ ...filters, space_id: spaceId });
    setOpenDropdown(null);
  }

  function handlePresetSelect(preset: DatePreset): void {
    setDatePreset(preset);
    if (preset !== 'custom') {
      const { from, to } = computePresetRange(preset);
      onFiltersChange({ ...filters, from_date: from, to_date: to });
    }
  }

  function handleCustomFromChange(value: string): void {
    onFiltersChange({ ...filters, from_date: value });
  }

  function handleCustomToChange(value: string): void {
    onFiltersChange({ ...filters, to_date: value });
  }

  function handleSearchChange(value: string): void {
    setSearchInput(value);
  }

  const btnClass =
    'border border-[#E5E7EB] rounded-xl px-3 py-2 text-sm bg-white hover:bg-gray-50 transition-colors disabled:opacity-50';
  const dropdownClass =
    'absolute top-full left-0 mt-1 bg-white rounded-xl shadow-lg border border-[#E5E7EB] p-3 z-50 min-w-[220px]';

  const spaceButtonLabel = selectedSpace
    ? `장소: ${selectedSpace.name}`
    : '장소';

  const containerClass = isVertical
    ? 'flex flex-col gap-3 relative'
    : 'flex gap-2 relative items-center mb-3';

  return (
    <div ref={containerRef} className={containerClass}>
      {/* Space filter (single select) */}
      <div className={isVertical ? 'relative' : 'relative'}>
        <button
          type="button"
          aria-label="장소 필터"
          className={isVertical ? `${btnClass} w-full text-left` : btnClass}
          onClick={() => toggleDropdown('space')}
          disabled={isLoading}
        >
          {spaceButtonLabel} ▼
        </button>
        {openDropdown === 'space' && (
          <div className={dropdownClass} data-testid="space-dropdown">
            <button
              type="button"
              className={`block w-full text-left px-2 py-1.5 text-sm rounded hover:bg-gray-100 ${
                filters.space_id === undefined
                  ? 'font-medium text-blue-600'
                  : ''
              }`}
              onClick={() => handleSpaceSelect(undefined)}
            >
              전체 장소
            </button>
            {[...buildingGroups.entries()].map(
              ([buildingName, buildingSpaces]) => {
                const color = getBuildingColor(buildingName);
                return (
                  <div key={buildingName} className="mt-2 first:mt-1">
                    <div className="mb-1">
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
                    </div>
                    {buildingSpaces.map((space) => {
                      const isSelected = filters.space_id === space.id;
                      return (
                        <button
                          key={space.id}
                          type="button"
                          className={`block w-full text-left px-2 py-1 pl-4 text-sm rounded hover:bg-gray-100 ${
                            isSelected ? 'font-medium text-blue-600' : ''
                          }`}
                          onClick={() => handleSpaceSelect(space.id)}
                        >
                          {space.name}
                        </button>
                      );
                    })}
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
          aria-label="기간 필터"
          className={isVertical ? `${btnClass} w-full text-left` : btnClass}
          onClick={() => toggleDropdown('date')}
          disabled={isLoading}
        >
          {DATE_PRESET_LABELS[datePreset]} ▼
        </button>
        {openDropdown === 'date' && (
          <div className={dropdownClass} data-testid="date-dropdown">
            {(['1w', '2w', '1m', 'custom'] as DatePreset[]).map((preset) => (
              <button
                key={preset}
                type="button"
                className={`block w-full text-left px-2 py-1.5 text-sm rounded hover:bg-gray-100 ${
                  datePreset === preset ? 'font-medium text-blue-600' : ''
                }`}
                onClick={() => handlePresetSelect(preset)}
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
                    value={filters.from_date ?? ''}
                    onChange={(e) => handleCustomFromChange(e.target.value)}
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
                    value={filters.to_date ?? ''}
                    onChange={(e) => handleCustomToChange(e.target.value)}
                  />
                </label>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Pastor filter — 백엔드 API 미지원 (todo §10). UI 만 placeholder */}
      <div className="relative">
        <button
          type="button"
          aria-label="담당교역자 필터 (준비 중)"
          title="담당교역자 필터는 백엔드 보완 후 활성화됩니다 (백엔드 todo §10)"
          className={
            isVertical
              ? `${btnClass} w-full text-left opacity-60 cursor-not-allowed`
              : `${btnClass} opacity-60 cursor-not-allowed`
          }
          disabled
        >
          담당교역자 (준비 중) ▼
        </button>
      </div>

      {/* Search input */}
      <div
        className={
          isVertical ? 'relative w-full' : 'relative min-w-[200px]'
        }
      >
        <input
          type="search"
          aria-label="이름·전화 검색"
          placeholder="이름·전화 검색"
          className={
            isVertical
              ? 'border border-[#E5E7EB] rounded-xl px-3 py-2 pr-9 text-sm bg-white w-full'
              : 'border border-[#E5E7EB] rounded-xl px-3 py-2 pr-9 text-sm bg-white w-full'
          }
          value={searchInput}
          onChange={(e) => handleSearchChange(e.target.value)}
        />
        {isLoading && (
          <span
            data-testid="search-spinner"
            aria-hidden="true"
            className="absolute right-2.5 top-1/2 -translate-y-1/2 inline-block w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"
          />
        )}
      </div>
    </div>
  );
}
