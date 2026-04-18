import { useState, useEffect } from 'react';
import StepPopup from './StepPopup';
import type { CompletedStep } from '../../utils/buildCompletedSteps';
import { HEADCOUNT_OPTIONS } from '@/lib/constants';

interface HeadcountPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onBack?: () => void;
  onReset?: () => void;
  value: number;
  onConfirm: (headcount: number) => void;
  completedSteps?: CompletedStep[];
}

function HeadcountPopup({ isOpen, onClose, onBack, onReset, value, onConfirm, completedSteps }: HeadcountPopupProps): JSX.Element {
  const [selected, setSelected] = useState<number>(value);

  useEffect(() => {
    if (isOpen) setSelected(value);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  function handleConfirm() {
    if (selected > 0) onConfirm(selected);
  }

  return (
    <StepPopup
      isOpen={isOpen}
      onClose={onClose}
      onReset={onReset}
      title="인원 선택"
      subtitle="3/5"
      onBack={onBack}
      onConfirm={handleConfirm}
      canConfirm={selected > 0}
      confirmLabel="다음"
      completedSteps={completedSteps}
    >
      <p className="text-base font-semibold text-black mb-4">인원을 선택해주세요</p>
      <div className="grid grid-cols-2 gap-3">
        {HEADCOUNT_OPTIONS.map(({ value: optValue, label }) => (
          <button
            key={optValue}
            type="button"
            onClick={() => setSelected(optValue)}
            className={`rounded-xl border-2 px-4 py-4 text-center text-base font-medium transition-all duration-150 ${
              selected === optValue
                ? 'border-brand-primary bg-brand-primary/10 text-brand-primary'
                : 'border-gray-200 bg-white text-gray-700 hover:border-brand-primary/40 hover:bg-brand-primary/5'
            }`}
          >
            {label}
          </button>
        ))}
      </div>
    </StepPopup>
  );
}

export default HeadcountPopup;
