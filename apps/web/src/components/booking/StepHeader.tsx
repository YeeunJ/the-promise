import { Check, ChevronRight } from 'lucide-react';

export const STEP_TITLES: readonly string[] = [
  '신청자 정보',
  '장소 선택',
  '인원 선택',
  '날짜 및 시간',
  '사용 목적',
];

export const STEP_CHIP_LABELS: readonly string[] = [
  '신청자 정보 입력',
  '장소 선택',
  '사용 인원 입력',
  '날짜 및 시간 선택',
  '사용 목적 입력',
];

const TOTAL_STEPS = 5;

interface StepHeaderProps {
  currentStep: number;
  maxReachedStep: number;
  validSteps: ReadonlyArray<boolean>;
  isComplete?: boolean;
  onStepChange: (step: number) => void;
  onCancel: () => void;
  onComplete: () => void;
}

type ChipState = 'current' | 'reached-valid' | 'reached-invalid' | 'unreached';

function resolveChipState(
  stepNumber: number,
  currentStep: number,
  maxReachedStep: number,
  isValid: boolean,
): ChipState {
  if (stepNumber === currentStep) return 'current';
  if (stepNumber <= maxReachedStep) {
    return isValid ? 'reached-valid' : 'reached-invalid';
  }
  return 'unreached';
}

const CHIP_STYLES: Record<ChipState, string> = {
  current:
    'bg-primary text-white border border-transparent ' +
    'shadow-design-primary font-extrabold',
  'reached-valid':
    'bg-primary-100 text-primary border border-primary/20 font-bold',
  'reached-invalid':
    'bg-primary-50 text-primary border border-primary/15 font-bold',
  unreached:
    'bg-transparent text-ink-mute border border-edge font-bold ' +
    'hover:bg-surface-2',
};

const DOT_STYLES: Record<ChipState, string> = {
  current: 'bg-white/20 text-white',
  'reached-valid': 'bg-primary text-white',
  'reached-invalid': 'bg-surface text-ink-mute border border-edge',
  unreached: 'bg-surface text-ink-mute border border-edge',
};

export function StepHeader({
  currentStep,
  maxReachedStep,
  validSteps,
  isComplete = false,
  onStepChange,
  onCancel,
  onComplete,
}: StepHeaderProps): JSX.Element {
  function handleChipClick(stepNumber: number): void {
    if (stepNumber === currentStep) return;
    onStepChange(stepNumber);
  }

  return (
    <div className="mb-7">
      {/* Title row + actions */}
      <div className="mb-4 flex items-center gap-3">
        <h1 className="m-0 text-2xl font-extrabold tracking-[-0.025em] text-ink">
          {STEP_TITLES[currentStep - 1]}
        </h1>
        <span className="rounded-full bg-accent-soft/70 px-2.5 py-[3px] text-[11px] font-extrabold tracking-[0.04em] tabular-nums text-[#8C6428]">
          {currentStep} / {TOTAL_STEPS}
        </span>
        <div className="flex-1" />
        <button
          type="button"
          onClick={onCancel}
          className={
            'rounded-[10px] border-none bg-danger px-[18px] py-[9px] ' +
            'text-[13px] font-bold tracking-[-0.01em] text-white ' +
            'shadow-design-danger transition-colors hover:bg-[#A04036]'
          }
        >
          취소
        </button>
        <button
          type="button"
          onClick={onComplete}
          disabled={!isComplete}
          className={
            'inline-flex items-center gap-1.5 rounded-[10px] border-none px-[22px] py-[9px] ' +
            'text-[13px] font-bold tracking-[-0.01em] transition-colors ' +
            (isComplete
              ? 'bg-primary text-white shadow-design-primary hover:bg-primary-dark cursor-pointer'
              : 'bg-edge-soft text-ink-mute cursor-not-allowed')
          }
        >
          {isComplete && <Check size={14} aria-hidden="true" />}
          완료
        </button>
      </div>

      {/* Chip nav */}
      <div className="flex flex-wrap items-center gap-1.5">
        {STEP_CHIP_LABELS.map((label, idx) => {
          const stepNumber = idx + 1;
          const state = resolveChipState(
            stepNumber,
            currentStep,
            maxReachedStep,
            validSteps[idx] ?? false,
          );
          const isLast = idx === STEP_CHIP_LABELS.length - 1;
          return (
            <div key={label} className="inline-flex items-center gap-1.5">
              <button
                type="button"
                data-state={state}
                aria-current={state === 'current' ? 'step' : undefined}
                onClick={() => handleChipClick(stepNumber)}
                className={
                  'inline-flex items-center gap-2 rounded-full py-[7px] pl-[7px] pr-3.5 ' +
                  'text-xs tracking-[-0.01em] transition-all ' +
                  CHIP_STYLES[state]
                }
              >
                <span
                  className={
                    'grid h-[22px] w-[22px] place-items-center rounded-full ' +
                    'text-[11px] font-extrabold tabular-nums ' +
                    DOT_STYLES[state]
                  }
                  aria-hidden="true"
                >
                  {state === 'reached-valid' ? (
                    <Check size={11} />
                  ) : (
                    stepNumber
                  )}
                </span>
                {label}
              </button>
              {!isLast && (
                <ChevronRight
                  size={12}
                  className="text-ink-mute opacity-50"
                  aria-hidden="true"
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
