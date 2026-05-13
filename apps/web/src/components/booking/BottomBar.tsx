import { ArrowLeft, ArrowRight } from 'lucide-react';

interface BottomBarProps {
  onPrev?: () => void;
  onNext?: () => void;
  nextDisabled?: boolean;
  nextLabel?: string;
}

export function BottomBar({
  onPrev,
  onNext,
  nextDisabled = false,
  nextLabel = '다음',
}: BottomBarProps): JSX.Element {
  return (
    <div className="border-t border-edge-soft bg-canvas px-10 py-5">
      <div className="mx-auto flex max-w-[1180px] gap-3">
        {onPrev !== undefined && (
          <button
            type="button"
            onClick={onPrev}
            className={
              'inline-flex items-center justify-center gap-2 rounded-[14px] border border-edge ' +
              'bg-surface px-6 py-4 text-sm font-semibold text-ink ' +
              'transition-colors hover:bg-surface-2 ' +
              (onNext !== undefined ? 'flex-none w-[200px]' : 'flex-1')
            }
          >
            <ArrowLeft size={15} aria-hidden="true" />
            이전
          </button>
        )}
        {onNext !== undefined && (
          <button
            type="button"
            onClick={onNext}
            disabled={nextDisabled}
            className={
              'flex-1 inline-flex items-center justify-center gap-2 rounded-[14px] ' +
              'px-6 py-4 text-sm font-bold tracking-[-0.01em] text-white ' +
              'transition-colors ' +
              (nextDisabled
                ? 'bg-edge cursor-not-allowed'
                : 'bg-primary hover:bg-primary-dark shadow-design-primary')
            }
          >
            {nextLabel}
            <ArrowRight size={16} aria-hidden="true" />
          </button>
        )}
      </div>
    </div>
  );
}
