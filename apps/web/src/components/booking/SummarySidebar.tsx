import { Sparkles } from 'lucide-react';
import type { CompletedStep } from '../../utils/buildCompletedSteps';

interface SummarySidebarProps {
  items: ReadonlyArray<CompletedStep>;
}

export function SummarySidebar({ items }: SummarySidebarProps): JSX.Element {
  return (
    <aside className="w-[280px] flex-none rounded-[18px] border border-edge-soft bg-surface p-6">
      <div className="mb-3.5 text-[11px] font-bold uppercase tracking-[0.08em] text-accent">
        신청 현황
      </div>

      {items.length > 0 ? (
        <div className="flex flex-col gap-4">
          {items.map((item) => (
            <div key={item.label}>
              <div className="mb-1 text-[11px] font-medium text-ink-mute">
                {item.label}
              </div>
              <div className="text-sm font-semibold leading-tight tracking-[-0.01em] text-ink">
                {item.value}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs leading-relaxed text-ink-mute">
          왼쪽에서 단계별로 입력해주세요.<br />채워질 때마다 여기에 표시됩니다.
        </p>
      )}

      <div className="mt-[22px] flex gap-2 rounded-[10px] bg-surface-2 px-3.5 py-3 text-[11px] leading-relaxed text-ink-soft">
        <Sparkles size={14} className="mt-0.5 flex-shrink-0 text-accent" aria-hidden="true" />
        <span>
          예약 내역이 맞는지 확인해 주세요
        </span>
      </div>
    </aside>
  );
}
