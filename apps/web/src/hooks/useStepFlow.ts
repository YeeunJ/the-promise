import { useCallback, useEffect, useState } from 'react';
import { useBookingDraft, type UseBookingDraftResult } from './useBookingDraft';

export type StepState = 'active' | 'visible' | 'locked';

export interface UseStepFlowResult extends UseBookingDraftResult {
  currentStep: number;
  advance: () => void;
  getStepState: (i: number) => StepState;
}

export function useStepFlow(): UseStepFlowResult {
  const bookingDraft = useBookingDraft();
  const [currentStep, setCurrentStep] = useState(() =>
    Math.max(0, Math.min(bookingDraft.maxReachedStep - 1, 4)),
  );

  const { setMaxReachedStep } = bookingDraft;
  useEffect(() => {
    setMaxReachedStep(currentStep + 1);
  }, [currentStep, setMaxReachedStep]);

  const advance = useCallback(() => {
    setCurrentStep((prev) => Math.min(prev + 1, 4));
  }, []);

  function getStepState(i: number): StepState {
    if (i < currentStep) return 'visible';
    if (i === currentStep) return 'active';
    return 'locked';
  }

  return {
    ...bookingDraft,
    currentStep,
    advance,
    getStepState,
  };
}
