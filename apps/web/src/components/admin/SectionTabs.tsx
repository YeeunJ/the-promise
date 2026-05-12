export type AdminSection = 'reservations' | 'teams' | 'buildings' | 'spaces';

interface SectionTabsProps {
  active: AdminSection;
  onChange: (next: AdminSection) => void;
}

const TABS: { value: AdminSection; label: string }[] = [
  { value: 'reservations', label: '예약' },
  { value: 'teams', label: '팀' },
  { value: 'buildings', label: '건물' },
  { value: 'spaces', label: '공간' },
];

export function SectionTabs({ active, onChange }: SectionTabsProps): JSX.Element {
  return (
    <nav
      className="flex gap-1 border-b border-[#E5E7EB] mb-6"
      aria-label="관리 영역"
    >
      {TABS.map((tab) => {
        const isActive = tab.value === active;
        return (
          <button
            key={tab.value}
            type="button"
            onClick={() => onChange(tab.value)}
            aria-current={isActive ? 'page' : undefined}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg border-b-2 transition-colors duration-200 ${
              isActive
                ? 'border-brand-primary text-brand-primary bg-white'
                : 'border-transparent text-gray-600 hover:text-brand-primary'
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </nav>
  );
}
