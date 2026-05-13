import { Sparkles, Users } from 'lucide-react';
import { HEADCOUNT_OPTIONS } from '@/lib/constants';

interface HeadcountStepProps {
  value: number;
  onChange: (headcount: number) => void;
}

export function HeadcountStep({ value, onChange }: HeadcountStepProps): JSX.Element {
  return (
    <div className="space-y-5">
      <div className="flex gap-3 rounded-[14px] border border-edge-soft bg-surface-2 p-4 text-sm leading-relaxed text-ink-soft">
        <Sparkles size={16} className="mt-0.5 flex-shrink-0 text-accent" aria-hidden="true" />
        <span>
          선택한 공간의 수용 인원과 비교해 적정한 인원 그룹을 골라주세요.
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {HEADCOUNT_OPTIONS.map(({ value: optValue, label }) => {
          const isSelected = value === optValue;
          return (
            <button
              key={optValue}
              type="button"
              aria-pressed={isSelected}
              onClick={() => onChange(optValue)}
              className={
                'group relative rounded-[18px] border bg-surface p-5 text-left transition-colors ' +
                (isSelected
                  ? 'border-2 border-primary bg-primary-50 shadow-design-md'
                  : 'border-edge hover:border-primary/40 hover:bg-primary-50')
              }
            >
              <div
                className={
                  'mb-3 inline-flex h-9 w-9 items-center justify-center rounded-[10px] ' +
                  (isSelected
                    ? 'bg-primary text-white'
                    : 'bg-primary-100 text-primary')
                }
                aria-hidden="true"
              >
                <Users size={16} />
              </div>
              <div className="text-[22px] font-extrabold tabular-nums tracking-[-0.02em] text-ink">
                {label}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
