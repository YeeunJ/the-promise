import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';

interface PagerState {
  show: boolean;
  page: number;
  count: number;
  onPrev: () => void;
  onNext: () => void;
}

interface BuildingTabsProps {
  buildingNames: string[];
  selIdx: number; // -1 = 전체
  onSelectAll: () => void;
  onSelectBuilding: (index: number) => void;
  autoOn: boolean;
  onToggleAuto: () => void;
  pager: PagerState;
  clock: string;
}

export function BuildingTabs({
  buildingNames,
  selIdx,
  onSelectAll,
  onSelectBuilding,
  autoOn,
  onToggleAuto,
  pager,
  clock,
}: BuildingTabsProps): JSX.Element {
  return (
    <div className="mb-4 flex flex-wrap items-center gap-3.5">
      <div className="inline-flex gap-1 rounded-xl border border-edge-soft bg-surface p-1 shadow-design-md">
        <TabButton active={selIdx === -1} onClick={onSelectAll}>
          전체
        </TabButton>
        {buildingNames.map((name, i) => (
          <TabButton key={name} active={selIdx === i} onClick={() => onSelectBuilding(i)}>
            {name}
          </TabButton>
        ))}
      </div>

      <div className="inline-flex items-center gap-2.5">
        <button
          type="button"
          onClick={onToggleAuto}
          aria-label="자동 전환 켜기/끄기"
          className={`inline-flex items-center gap-1.5 rounded-[10px] border border-edge-soft bg-surface px-3 py-2 text-[12px] font-semibold ${
            autoOn ? 'text-ink-soft' : 'text-ink-mute'
          }`}
        >
          {autoOn ? <Pause size={13} className="text-primary" /> : <Play size={13} className="text-ink-mute" />}
          {autoOn ? '5초 자동 전환' : '자동 전환 꺼짐'}
        </button>
        <span className="inline-flex items-center gap-[5px]">
          {buildingNames.map((name, i) => (
            <span
              key={name}
              className={`h-[7px] rounded-full transition-all ${
                selIdx === i ? 'w-5 bg-primary' : 'w-[7px] bg-edge'
              }`}
            />
          ))}
        </span>
      </div>

      <div className="ml-auto flex items-center gap-3">
        {pager.show && (
          <span className="inline-flex items-center gap-1 rounded-full border border-edge-soft bg-surface p-[3px] shadow-design-md">
            <PagerButton onClick={pager.onPrev} label="이전 페이지">
              <ChevronLeft size={14} />
            </PagerButton>
            <span className="min-w-[40px] text-center text-[12px] font-extrabold tabular-nums text-ink">
              {pager.page + 1} / {pager.count}
            </span>
            <PagerButton onClick={pager.onNext} label="다음 페이지">
              <ChevronRight size={14} />
            </PagerButton>
          </span>
        )}

        <span className="inline-flex items-center gap-[6px] text-[12px] font-semibold text-ink-soft">
          <span className="h-[7px] w-[7px] rounded-full bg-primary" />
          실시간
        </span>

        <span className="inline-flex items-baseline gap-[9px] rounded-full border border-edge-soft bg-primary-100 px-[15px] py-2">
          <span className="text-[11px] font-bold tracking-[0.06em] text-ink-soft">현재 시각</span>
          <span className="min-w-[118px] text-right text-[17px] font-extrabold tracking-[-0.01em] tabular-nums text-primary">
            {clock}
          </span>
        </span>
      </div>
    </div>
  );
}

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

function TabButton({ active, onClick, children }: TabButtonProps): JSX.Element {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-[9px] px-4 py-2 text-[13px] font-bold transition-all ${
        active ? 'bg-primary text-white shadow-design-primary' : 'bg-transparent text-ink-soft hover:bg-surface-2 hover:text-ink'
      }`}
    >
      {children}
    </button>
  );
}

interface PagerButtonProps {
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}

function PagerButton({ onClick, label, children }: PagerButtonProps): JSX.Element {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="grid h-[26px] w-[26px] place-items-center rounded-full text-ink-soft hover:bg-surface-2 hover:text-ink"
    >
      {children}
    </button>
  );
}
