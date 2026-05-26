import { useState, useRef, useEffect } from 'react';
import { getBuildingColor } from '../../lib/adminConstants';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import type { Building } from '../../types';
import type { PaginatedReservationsFilters } from '../../hooks/usePaginatedReservations';

const SEARCH_DEBOUNCE_MS = 250;

type DatePreset = '1w' | '2w' | '1m' | 'custom';
type OpenDropdown = 'building' | 'date' | null;

interface ListFilterBarProps {
  filters: PaginatedReservationsFilters;
  onFiltersChange: (next: PaginatedReservationsFilters) => void;
  buildings: Building[];
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
  buildings,
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

  useEffect(() => {
    const external = filters.search ?? '';
    if (external !== searchInput && external !== lastDispatchedSearchRef.current) {
      setSearchInput(external);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.search]);

  useEffect(() => {
    const trimmed = debouncedSearch.trim();
    const normalized = trimmed === '' ? undefined : trimmed;
    if (normalized === (filters.search ?? undefined)) return;
    lastDispatchedSearchRef.current = normalized;
    onFiltersChange({ ...filters, search: normalized });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

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

  const selectedBuilding =
    typeof filters.building_id === 'number'
      ? (buildings.find((b) => b.id === filters.building_id) ?? null)
      : null;

  function toggleDropdown(name: OpenDropdown): void {
    setOpenDropdown((prev) => (prev === name ? null : name));
  }

  function handleBuildingSelect(buildingId: number | undefined): void {
    onFiltersChange({ ...filters, building_id: buildingId });
    setOpenDropdown(null);
  }

  function handlePresetSelect(preset: DatePreset): void {
    setDatePreset(preset);
    if (preset !== 'custom') {
      const { from, to } = computePresetRange(preset);
      onFiltersChange({ ...filters, from_date: from, to_date: to });
      setOpenDropdown(null);
    }
  }

  function handleCustomFromChange(value: string): void {
    onFiltersChange({ ...filters, from_date: value });
  }

  function handleCustomToChange(value: string): void {
    onFiltersChange({ ...filters, to_date: value });
  }

  const btnClass =
    'border border-[#E5E7EB] rounded-xl px-3 py-2 text-sm bg-white hover:bg-gray-50 transition-colors disabled:opacity-50';
  const dropdownClass =
    'absolute top-full left-0 mt-1 bg-white rounded-xl shadow-lg border border-[#E5E7EB] p-3 z-50 min-w-[180px] max-h-[280px] overflow-y-auto';

  const buildingButtonLabel = selectedBuilding ? selectedBuilding.name : '건물';

  const containerClass = isVertical
    ? 'flex flex-col gap-3 relative'
    : 'flex gap-2 relative items-center mb-3';

  return (
    <div ref={containerRef} className={containerClass}>
      {/* Building filter */}
      <div className="relative">
        <button
          type="button"
          aria-label="건물 필터"
          className={isVertical ? `${btnClass} w-full text-left` : btnClass}
          onClick={() => toggleDropdown('building')}
          disabled={isLoading}
        >
          {buildingButtonLabel} ▼
        </button>
        {openDropdown === 'building' && (
          <div className={dropdownClass} data-testid="building-dropdown">
            <button
              type="button"
              className={`block w-full text-left px-2 py-1.5 text-sm rounded hover:bg-gray-100 ${
                filters.building_id === undefined ? 'font-medium text-blue-600' : ''
              }`}
              onClick={() => handleBuildingSelect(undefined)}
            >
              전체 건물
            </button>
            {buildings.map((building) => {
              const color = getBuildingColor(building.name);
              const isSelected = filters.building_id === building.id;
              return (
                <button
                  key={building.id}
                  type="button"
                  className={`block w-full text-left px-2 py-1.5 text-sm rounded hover:bg-gray-100 mt-0.5 ${
                    isSelected ? 'font-medium' : ''
                  }`}
                  style={isSelected ? { color: color.main } : undefined}
                  onClick={() => handleBuildingSelect(building.id)}
                >
                  {building.name}
                </button>
              );
            })}
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
              <div className="mt-2 pt-2 border-t border-[#E5E7EB]">
                <div className="flex gap-2">
                  <label className="text-sm">
                    <span className="block text-xs text-gray-500 mb-0.5">시작일</span>
                    <input
                      type="date"
                      aria-label="시작일"
                      className="border border-[#E5E7EB] rounded px-2 py-1 text-sm"
                      value={filters.from_date ?? ''}
                      onChange={(e) => handleCustomFromChange(e.target.value)}
                    />
                  </label>
                  <label className="text-sm">
                    <span className="block text-xs text-gray-500 mb-0.5">종료일</span>
                    <input
                      type="date"
                      aria-label="종료일"
                      className="border border-[#E5E7EB] rounded px-2 py-1 text-sm"
                      value={filters.to_date ?? ''}
                      onChange={(e) => handleCustomToChange(e.target.value)}
                    />
                  </label>
                </div>
                <button
                  type="button"
                  onClick={() => setOpenDropdown(null)}
                  className="mt-2 w-full rounded-lg bg-blue-600 px-3 py-1.5 text-sm text-white transition-colors hover:bg-blue-700"
                >
                  적용
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Pastor filter — 백엔드 미지원 placeholder */}
      <div className="relative">
        <button
          type="button"
          aria-label="담당교역자 필터 (준비 중)"
          title="담당교역자 필터는 백엔드 보완 후 활성화됩니다"
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
      <div className={isVertical ? 'relative w-full' : 'relative min-w-[200px]'}>
        <input
          type="search"
          aria-label="이름·전화 검색"
          placeholder="이름·전화 검색"
          className="border border-[#E5E7EB] rounded-xl px-3 py-2 pr-9 text-sm bg-white w-full"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
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
