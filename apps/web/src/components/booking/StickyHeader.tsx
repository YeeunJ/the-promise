interface StickyHeaderProps {
  currentStep: number;
  totalSteps?: number;
  isComplete: boolean;
  onCancel: () => void;
  onComplete: () => void;
}

export function StickyHeader({
  currentStep,
  totalSteps = 5,
  isComplete,
  onCancel,
  onComplete,
}: StickyHeaderProps): JSX.Element {
  const pct = Math.round((currentStep / totalSteps) * 100);
  const stepLabel = `${totalSteps}단계 중 ${currentStep + 1}단계 진행 · ${pct}% 완료`;

  return (
    <div className="sticky top-0 z-30 bg-canvas border-b border-edge">
      <div className="max-w-[1200px] mx-auto px-6 py-3 flex items-center gap-5">
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-3 mb-1.5">
            <span className="text-sm font-bold text-ink tracking-tight">장소 사용 신청</span>
            <span className="text-xs text-ink-mute">{stepLabel}</span>
          </div>
          <div className="h-1 bg-edge-soft rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-semibold rounded-xl text-danger bg-[rgba(184,74,62,0.08)] hover:bg-[rgba(184,74,62,0.14)] transition-colors"
          >
            취소
          </button>
          <button
            type="button"
            onClick={onComplete}
            disabled={!isComplete}
            className="px-4 py-2 text-sm font-semibold rounded-xl text-surface bg-primary hover:bg-primary-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            완료
          </button>
        </div>
      </div>
    </div>
  );
}
