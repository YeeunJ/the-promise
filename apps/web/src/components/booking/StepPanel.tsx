import type { ReactNode } from 'react';

interface StepPanelProps {
  stepNumber: number;
  title: string;
  isActive: boolean;
  isFilled: boolean;
  canAdvance: boolean;
  isLastStep: boolean;
  onAdvance: () => void;
  children: ReactNode;
}

export function StepPanel({
  stepNumber,
  title,
  isActive,
  isFilled,
  canAdvance,
  isLastStep,
  onAdvance,
  children,
}: StepPanelProps): JSX.Element {
  return (
    <div
      className={[
        'bg-surface rounded-2xl overflow-hidden transition-shadow',
        isActive
          ? 'border-2 border-primary shadow-design-md animate-slide-up'
          : 'border border-edge',
      ].join(' ')}
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-6 pt-5 pb-4">
        <StepBadge stepNumber={stepNumber} isActive={isActive} isFilled={isFilled} />
        <div className="flex-1 min-w-0">
          <div className="text-[11px] font-semibold text-ink-mute uppercase tracking-widest mb-0.5">
            STEP {stepNumber} / 5
          </div>
          <h2 className="text-base font-bold text-ink tracking-tight">{title}</h2>
        </div>
        {isActive && (
          <span className="text-[11px] font-semibold text-ink-soft bg-primary-50 px-2.5 py-1 rounded-full">
            입력 중
          </span>
        )}
        {!isActive && isFilled && (
          <span className="text-[11px] font-semibold text-primary bg-primary-50 px-2.5 py-1 rounded-full">
            입력 완료
          </span>
        )}
      </div>

      {/* Divider */}
      <div className="mx-6 h-px bg-edge-soft" />

      {/* Content */}
      <div className="px-6 py-5">{children}</div>

      {/* Footer — active steps only */}
      {isActive && (
        <div className="px-6 pb-6 flex items-center justify-between gap-4">
          {!canAdvance && (
            <p className="text-xs text-ink-mute">모든 항목을 입력하면 다음으로 진행할 수 있어요</p>
          )}
          <div className="ml-auto">
            <button
              type="button"
              onClick={onAdvance}
              disabled={!canAdvance}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-semibold bg-primary text-surface hover:bg-primary-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-design-primary"
            >
              {isLastStep ? '신청 완료' : '다음 단계'}
              {!isLastStep && (
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              )}
              {isLastStep && (
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

interface StepBadgeProps {
  stepNumber: number;
  isActive: boolean;
  isFilled: boolean;
}

function StepBadge({ stepNumber, isActive, isFilled }: StepBadgeProps): JSX.Element {
  if (!isActive && isFilled) {
    return (
      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
        <svg
          className="w-4 h-4 text-surface"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
        </svg>
      </div>
    );
  }

  return (
    <div
      className={[
        'w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-sm font-bold',
        isActive ? 'bg-primary text-surface' : 'bg-primary-100 text-primary',
      ].join(' ')}
    >
      {stepNumber}
    </div>
  );
}
