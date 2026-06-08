import { useCallback, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { FloorPlanLocation } from '../types/booking';
import { StickyHeader } from '../components/booking/StickyHeader';
import { StepPanel } from '../components/booking/StepPanel';
import { StepLockedRow } from '../components/booking/StepLockedRow';
import { SummaryRail } from '../components/booking/SummaryRail';
import { ApplicantStep } from '../components/booking/steps/ApplicantStep';
import { SpaceStep } from '../components/booking/steps/SpaceStep';
import { HeadcountStep } from '../components/booking/steps/HeadcountStep';
import { DateTimeStep } from '../components/booking/steps/DateTimeStep';
import { PurposeStep } from '../components/booking/steps/PurposeStep';
import { useStepFlow } from '../hooks/useStepFlow';

const STEPS = [
  { title: '신청자 정보' },
  { title: '날짜 및 시간' },
  { title: '장소 선택' },
  { title: '사용 인원' },
  { title: '사용 목적' },
];

export function BookingPage(): JSX.Element {
  const navigate = useNavigate();
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  // 공간 선택 단계에서 현재 보고 있는 건물+층. 평면도 표시 기준(선택 확정과 무관).
  const [viewingLocation, setViewingLocation] = useState<FloorPlanLocation | null>(null);

  const flow = useStepFlow();
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);

  function handleCancel(): void {
    setShowCancelConfirm(true);
  }

  function handleConfirmCancel(): void {
    flow.clear();
    navigate('/');
  }

  const handleComplete = useCallback((): void => {
    if (!flow.isComplete) return;
    navigate('/booking/confirm');
  }, [flow.isComplete, navigate]);

  const handleAdvance = useCallback(
    (stepIndex: number): void => {
      if (stepIndex === 4) {
        handleComplete();
      } else {
        flow.advance();
        requestAnimationFrame(() => {
          const el = stepRefs.current[stepIndex + 1];
          if (el) {
            const top = el.getBoundingClientRect().top + window.scrollY - 90;
            window.scrollTo({ top, behavior: 'smooth' });
          }
        });
      }
    },
    [flow, handleComplete],
  );

  return (
    <>
      <StickyHeader
        currentStep={flow.currentStep}
        isComplete={flow.isComplete}
        onCancel={handleCancel}
        onComplete={handleComplete}
      />

      <main className="max-w-[1200px] mx-auto px-6 pb-20 pt-7">
        <div className="grid grid-cols-[1fr_280px] gap-7 items-start">
          {/* Step list */}
          <div className="flex flex-col gap-4">
            {STEPS.map((step, i) => {
              const state = flow.getStepState(i);

              if (state === 'locked') {
                return (
                  <div key={step.title} ref={(el) => { stepRefs.current[i] = el; }}>
                    <StepLockedRow stepNumber={i + 1} title={step.title} />
                  </div>
                );
              }

              return (
                <div key={step.title} ref={(el) => { stepRefs.current[i] = el; }}>
                  <StepPanel
                    stepNumber={i + 1}
                    title={step.title}
                    isActive={state === 'active'}
                    isFilled={flow.isStepValid(i + 1)}
                    canAdvance={i === 4 ? flow.isComplete : flow.isStepValid(i + 1)}
                    isLastStep={i === 4}
                    onAdvance={() => handleAdvance(i)}
                  >
                    {i === 0 && (
                      <ApplicantStep value={flow.draft.applicant} onChange={flow.updateApplicant} />
                    )}
                    {i === 1 && (
                      <DateTimeStep value={flow.draft.timeSlot} onChange={flow.updateTimeSlot} />
                    )}
                    {i === 2 && (
                      <SpaceStep
                        value={flow.draft.space}
                        onChange={flow.updateSpace}
                        timeSlot={flow.draft.timeSlot}
                        onLocationChange={setViewingLocation}
                      />
                    )}
                    {i === 3 && (
                      <HeadcountStep value={flow.draft.headcount} onChange={flow.updateHeadcount} />
                    )}
                    {i === 4 && (
                      <PurposeStep value={flow.draft.purpose} onChange={flow.updatePurpose} />
                    )}
                  </StepPanel>
                </div>
              );
            })}
          </div>

          {/* Summary rail */}
          <SummaryRail
            draft={flow.draft}
            isStepValid={flow.isStepValid}
            viewingLocation={viewingLocation}
          />
        </div>
      </main>

      {/* Cancel confirm dialog */}
      {showCancelConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-surface rounded-2xl p-6 w-full max-w-sm mx-4 shadow-design-md">
            <h3 className="text-base font-semibold text-ink mb-2">예약 신청 취소</h3>
            <p className="text-sm text-ink-soft mb-6">
              작성 중인 내용이 모두 사라집니다.
              <br />
              정말 취소하시겠습니까?
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowCancelConfirm(false)}
                className="flex-1 py-2.5 rounded-xl border border-edge text-sm font-medium text-ink-soft hover:bg-surface-2 transition-colors"
              >
                계속 작성
              </button>
              <button
                type="button"
                onClick={handleConfirmCancel}
                className="flex-1 py-2.5 rounded-xl bg-danger text-sm font-medium text-surface hover:opacity-90 transition-opacity"
              >
                예, 취소합니다
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default BookingPage;
