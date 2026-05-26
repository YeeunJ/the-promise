import { Building2, LogOut, Search } from 'lucide-react';
import type { AdminSection } from './SectionTabs';

interface AdminTopNavProps {
  section: AdminSection;
  onSectionChange: (next: AdminSection) => void;
  onLogout: () => void;
}

const TABS: ReadonlyArray<{ value: AdminSection; label: string }> = [
  { value: 'reservations', label: '예약' },
  { value: 'teams', label: '팀' },
  { value: 'buildings', label: '건물' },
  { value: 'spaces', label: '공간' },
];

export function AdminTopNav({
  section,
  onSectionChange,
  onLogout,
}: AdminTopNavProps): JSX.Element {
  return (
    <header className="border-b border-edge-soft bg-surface">
      <div className="mx-auto flex max-w-[1920px] items-center gap-5 px-10 py-[14px]">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <div
            className="grid h-7 w-7 place-items-center rounded-[7px] bg-primary text-white"
            aria-hidden="true"
          >
            <Building2 size={16} strokeWidth={1.8} />
          </div>
          <span className="text-[17px] font-extrabold tracking-[-0.02em] text-primary">
            가나안교회
          </span>
          <span className="rounded-md bg-accent-soft px-2 py-0.5 text-[10px] font-extrabold tracking-[0.08em] text-[#8C6428]">
            ADMIN
          </span>
        </div>

        <div className="h-4 w-px bg-edge" aria-hidden="true" />

        {/* Tabs */}
        <nav aria-label="관리 영역" className="flex items-center gap-1">
          {TABS.map((tab) => {
            const isActive = tab.value === section;
            return (
              <button
                key={tab.value}
                type="button"
                onClick={() => onSectionChange(tab.value)}
                aria-current={isActive ? 'page' : undefined}
                className={
                  'rounded-[10px] px-4 py-2 text-[13px] font-semibold tracking-[-0.01em] transition-colors ' +
                  (isActive
                    ? 'bg-primary-100 text-primary'
                    : 'text-ink-soft hover:text-primary hover:bg-primary-50')
                }
              >
                {tab.label}
              </button>
            );
          })}
        </nav>

        <div className="flex-1" />

        {/* Search (disabled — backend pending).
            비기능 표시이므로 textbox role 없는 div 로 처리. 통합 검색 API 도착 시 input 으로 교체. */}
        <div
          role="search"
          aria-disabled="true"
          className="relative flex w-[280px] max-w-[40vw] cursor-not-allowed items-center rounded-full border border-edge bg-surface-2 py-2 pl-9 pr-12"
        >
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-mute"
            aria-hidden="true"
          />
          <span
            data-testid="admin-search-placeholder"
            className="select-none text-[13px] text-ink-mute"
          >
            공간·팀·신청자 통합 검색 (준비 중)
          </span>
          <kbd
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md bg-surface px-1.5 py-0.5 text-[10px] font-bold text-ink-mute"
            aria-hidden="true"
          >
            ⌘K
          </kbd>
        </div>

        {/* Logout */}
        <button
          type="button"
          onClick={onLogout}
          className="inline-flex items-center gap-1.5 rounded-[10px] border border-edge bg-surface px-4 py-2 text-[13px] font-semibold text-ink hover:bg-surface-2"
        >
          <LogOut size={14} aria-hidden="true" />
          로그아웃
        </button>
      </div>
    </header>
  );
}
