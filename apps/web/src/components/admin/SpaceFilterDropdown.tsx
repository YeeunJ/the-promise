import { useState, useRef, useEffect } from 'react';
import { getBuildingColor } from '../../lib/adminConstants';
import type { Space } from '../../types';

interface SpaceFilterDropdownProps {
  spaces: Space[];
  value: number | undefined;
  onChange: (spaceId: number | undefined) => void;
}

export function SpaceFilterDropdown({
  spaces,
  value,
  onChange,
}: SpaceFilterDropdownProps): JSX.Element {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent): void {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const selectedSpace = spaces.find((s) => s.id === value) ?? null;
  const buttonLabel = selectedSpace ? selectedSpace.name : '전체 장소';

  // Group spaces by building for display
  const buildingGroups = spaces.reduce<Map<string, Space[]>>((acc, space) => {
    const list = acc.get(space.building.name) ?? [];
    list.push(space);
    acc.set(space.building.name, list);
    return acc;
  }, new Map());

  function handleSelect(spaceId: number | undefined): void {
    onChange(spaceId);
    setIsOpen(false);
  }

  return (
    <div ref={containerRef} className="relative inline-block">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((prev) => !prev)}
        className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-sm transition-colors ${
          value !== undefined
            ? 'border-primary bg-primary-50 text-primary font-medium'
            : 'border-[#E5E7EB] bg-white text-gray-700 hover:bg-gray-50'
        }`}
      >
        {buttonLabel}
        <span className="text-xs opacity-60">▼</span>
      </button>

      {isOpen && (
        <div
          role="listbox"
          className="absolute top-full left-0 mt-1 z-50 min-w-[200px] max-h-[320px] overflow-y-auto rounded-xl border border-[#E5E7EB] bg-white shadow-lg p-2"
        >
          <button
            type="button"
            role="option"
            aria-selected={value === undefined}
            onClick={() => handleSelect(undefined)}
            className={`block w-full text-left px-3 py-1.5 text-sm rounded-lg hover:bg-gray-100 ${
              value === undefined ? 'font-medium text-primary' : 'text-gray-700'
            }`}
          >
            전체 장소
          </button>

          {[...buildingGroups.entries()].map(([buildingName, buildingSpaces]) => {
            const color = getBuildingColor(buildingName);
            return (
              <div key={buildingName} className="mt-2">
                <div className="px-2 mb-1">
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
                {buildingSpaces.map((space) => (
                  <button
                    key={space.id}
                    type="button"
                    role="option"
                    aria-selected={value === space.id}
                    onClick={() => handleSelect(space.id)}
                    className={`block w-full text-left px-3 pl-5 py-1.5 text-sm rounded-lg hover:bg-gray-100 ${
                      value === space.id ? 'font-medium text-primary' : 'text-gray-700'
                    }`}
                  >
                    {space.name}
                  </button>
                ))}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
