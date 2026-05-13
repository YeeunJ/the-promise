import { useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { BookingLayout } from '../components/booking/BookingLayout';
import { StepHeader } from '../components/booking/StepHeader';
import { SummarySidebar } from '../components/booking/SummarySidebar';
import { BottomBar } from '../components/booking/BottomBar';
import { ApplicantStep } from '../components/booking/steps/ApplicantStep';
import { SpaceStep } from '../components/booking/steps/SpaceStep';
import { HeadcountStep } from '../components/booking/steps/HeadcountStep';
import { DateTimeStep } from '../components/booking/steps/DateTimeStep';
import { PurposeStep } from '../components/booking/steps/PurposeStep';
import { useBookingDraft } from '../hooks/useBookingDraft';
import { buildCompletedSteps } from '../utils/buildCompletedSteps';

const TOTAL_STEPS = 5;

function clampStep(raw: string | null): number {
  if (raw === null) return 1;
  const n = Number(raw);
  if (!Number.isFinite(n) || n < 1 || n > TOTAL_STEPS) return 1;
  return Math.floor(n);
}

export function BookingPage(): JSX.Element {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentStep = clampStep(searchParams.get('step'));

  const {
    draft,
    maxReachedStep,
    updateApplicant,
    updateSpace,
    updateHeadcount,
    updateTimeSlot,
    updatePurpose,
    setMaxReachedStep,
    clear,
    isComplete,
    isStepValid,
  } = useBookingDraft();

  function goToStep(step: number): void {
    if (step < 1 || step > TOTAL_STEPS) return;
    setSearchParams({ step: String(step) }, { replace: false });
  }

  const handleNext = useCallback((): void => {
    if (currentStep >= TOTAL_STEPS) return;
    const nextStep = currentStep + 1;
    setMaxReachedStep(nextStep);
    goToStep(nextStep);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep, setMaxReachedStep]);

  const handlePrev = useCallback((): void => {
    if (currentStep > 1) goToStep(currentStep - 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep]);

  function handleCancel(): void {
    clear();
    navigate('/');
  }

  function handleComplete(): void {
    if (!isComplete) return;
    navigate('/booking/confirm');
  }

  const validSteps: boolean[] = [1, 2, 3, 4, 5].map((s) => isStepValid(s));
  const completedSteps = buildCompletedSteps({
    applicant: draft.applicant,
    space: draft.space,
    headcount: draft.headcount,
    timeSlot: draft.timeSlot,
    purpose: draft.purpose,
  });

  return (
    <BookingLayout
      header={
        <StepHeader
          currentStep={currentStep}
          maxReachedStep={maxReachedStep}
          validSteps={validSteps}
          isComplete={isComplete}
          onStepChange={goToStep}
          onCancel={handleCancel}
          onComplete={handleComplete}
        />
      }
      sidebar={<SummarySidebar items={completedSteps} />}
      bottomBar={
        <BottomBar
          onPrev={currentStep > 1 ? handlePrev : undefined}
          onNext={currentStep < TOTAL_STEPS ? handleNext : undefined}
        />
      }
    >
      {currentStep === 1 && (
        <ApplicantStep value={draft.applicant} onChange={updateApplicant} />
      )}
      {currentStep === 2 && (
        <SpaceStep value={draft.space} onChange={updateSpace} />
      )}
      {currentStep === 3 && (
        <HeadcountStep value={draft.headcount} onChange={updateHeadcount} />
      )}
      {currentStep === 4 && (
        <DateTimeStep
          value={draft.timeSlot}
          onChange={updateTimeSlot}
          spaceId={draft.space?.id ?? null}
        />
      )}
      {currentStep === 5 && (
        <PurposeStep value={draft.purpose} onChange={updatePurpose} />
      )}
    </BookingLayout>
  );
}

export default BookingPage;
