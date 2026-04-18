import { useState } from 'react';
import axios, { isAxiosError } from 'axios';
import type { Reservation, ReservationFormData, TimeSlotValue, ApiError } from '../types';
import { INITIAL_TIME_SLOT } from '../utils/reservationFormHelpers';
import { buildCompletedSteps } from '../utils/buildCompletedSteps';
import type { CompletedStep } from '../utils/buildCompletedSteps';
import { formatTime, formatTimeSlotLabel } from '../utils/formatDatetime';
import ApplicantPopup from './reservation/ApplicantPopup';
import type { ApplicantData } from './reservation/ApplicantPopup';
import SpacePopup from './reservation/SpacePopup';
import type { SpaceSelection } from './reservation/SpacePopup';
import HeadcountPopup from './reservation/HeadcountPopup';
import DateTimePopup from './reservation/DateTimePopup';
import PurposePopup from './reservation/PurposePopup';
import type { ActivePopup as ActivePopupStep } from '../types';

type ActivePopup = ActivePopupStep | null;
const POPUP_SEQUENCE: Exclude<ActivePopup, null>[] = ['applicant', 'space', 'headcount', 'datetime', 'purpose'];

const STEP_LABELS = [
  '신청자 정보 입력',
  '장소 선택',
  '사용 인원 입력',
  '날짜 및 시간 선택',
  '사용 목적 입력',
];

interface ReservationFormProps {
  onSubmitSuccess: (reservation: Reservation) => void;
}

function ReservationForm({ onSubmitSuccess }: ReservationFormProps): JSX.Element {
  const [applicant, setApplicant] = useState<ApplicantData | null>(null);
  const [spaceSelection, setSpaceSelection] = useState<SpaceSelection | null>(null);
  const [headcount, setHeadcount] = useState<number>(0);
  const [timeSlot, setTimeSlot] = useState<TimeSlotValue>(INITIAL_TIME_SLOT);
  const [purpose, setPurpose] = useState<string>('');
  const [activePopup, setActivePopup] = useState<ActivePopup>(null);
  const [isReviewing, setIsReviewing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  function goNext() {
    if (activePopup === null) return;
    const idx = POPUP_SEQUENCE.indexOf(activePopup);
    const next = idx + 1;
    setActivePopup(next < POPUP_SEQUENCE.length ? POPUP_SEQUENCE[next] : null);
  }

  function goBack() {
    if (activePopup === null) return;
    const idx = POPUP_SEQUENCE.indexOf(activePopup);
    setActivePopup(idx > 0 ? POPUP_SEQUENCE[idx - 1] : null);
  }

  function resolveEditTarget(errorMessage: string | null): Exclude<ActivePopup, null> {
    if (!errorMessage) return 'applicant';
    if (errorMessage.includes('과거') || errorMessage.includes('시간') || errorMessage.includes('날짜')) return 'datetime';
    if (errorMessage.includes('공간') || errorMessage.includes('장소')) return 'space';
    if (errorMessage.includes('인원')) return 'headcount';
    if (errorMessage.includes('목적')) return 'purpose';
    return 'applicant';
  }

  function startFlow() {
    setSubmitError(null);
    setActivePopup('applicant');
  }

  function handleReset() {
    setApplicant(null);
    setSpaceSelection(null);
    setHeadcount(0);
    setTimeSlot(INITIAL_TIME_SLOT);
    setPurpose('');
    setSubmitError(null);
    setIsReviewing(false);
    setActivePopup(null);
  }

  async function handleSubmit(purposeVal: string) {
    if (!applicant || !spaceSelection || headcount === 0 || !timeSlot.startTime || !timeSlot.endTime || !purposeVal.trim()) return;

    setIsSubmitting(true);
    setSubmitError(null);

    const formData: ReservationFormData = {
      space: spaceSelection.id,
      applicant_name: applicant.name,
      applicant_phone: applicant.phone,
      applicant_team: `${applicant.departmentName} > ${applicant.teamName}`,
      leader_phone: applicant.pastorDisplay || '직접 문의',
      headcount,
      purpose: purposeVal.trim(),
      start_datetime: timeSlot.startTime,
      end_datetime: timeSlot.endTime,
    };

    try {
      const response = await axios.post<Reservation>(
        `${import.meta.env.VITE_API_BASE_URL}/api/v1/reservations/`,
        formData,
      );
      onSubmitSuccess(response.data);
    } catch (err) {
      if (isAxiosError(err) && err.response?.data) {
        const data = err.response.data as ApiError;
        setSubmitError(data.message ?? '예약 신청 중 오류가 발생했습니다. 다시 시도해주세요.');
      } else {
        setSubmitError('예약 신청 중 오류가 발생했습니다. 다시 시도해주세요.');
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  const completedSteps: CompletedStep[] = buildCompletedSteps({
    applicant,
    space: spaceSelection,
    headcount,
    timeSlot,
    purpose,
  });

  return (
    <>
      {/* 두 컬럼 카드 */}
      <div className="w-full max-w-[860px] flex rounded-3xl overflow-hidden shadow-[0_8px_40px_rgba(0,0,0,0.12)]">

        {/* 좌측: 초록 안내 패널 */}
        <div className="w-[300px] flex-none bg-brand-primary flex flex-col items-center justify-center px-7 py-12 text-center">
          <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center text-2xl mb-3.5">
            🏛️
          </div>
          <p className="text-white font-extrabold text-xl tracking-tight mb-1">장소 사용 신청</p>
          <p className="text-white/70 text-xs mb-7">5단계로 간편하게 신청하세요</p>

          <div className="flex flex-col self-stretch">
            {STEP_LABELS.map((label, i) => (
              <div
                key={label}
                className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-white/[0.12] mb-1.5"
              >
                <div className="w-6 h-6 rounded-full bg-white/[0.28] flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0">
                  {i + 1}
                </div>
                <span className="text-[13px] font-semibold text-white/[0.92] text-left">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 우측: CTA 또는 검토 패널 */}
        <div className="flex-1 bg-brand-cream flex flex-col items-center justify-center px-[52px] py-16">
          {!isReviewing ? (
            <div className="w-full flex flex-col items-center gap-4">
              <p className="text-sm font-semibold text-[#9a7f5a] tracking-wide">준비가 되셨나요?</p>
              <button
                type="button"
                onClick={startFlow}
                className="w-full rounded-[18px] bg-brand-accent px-6 py-8 text-[22px] font-black text-white shadow-[0_6px_28px_rgba(188,138,95,0.50)] transition-all hover:bg-[#a8784f] hover:-translate-y-0.5 hover:shadow-[0_10px_36px_rgba(188,138,95,0.65)] active:bg-[#946840] active:translate-y-0"
              >
                장소 사용 신청하기
              </button>
            </div>
          ) : (
            applicant && spaceSelection && (
              <div className="w-full">
                <ReviewPanel
                  applicant={applicant}
                  spaceSelection={spaceSelection}
                  headcount={headcount}
                  timeSlot={timeSlot}
                  purpose={purpose}
                  submitError={submitError}
                  isSubmitting={isSubmitting}
                  onEdit={() => { setIsReviewing(false); setActivePopup(resolveEditTarget(submitError)); }}
                  onSubmit={() => void handleSubmit(purpose)}
                />
              </div>
            )
          )}
        </div>
      </div>

      {/* 팝업들 (fixed overlay) */}
      <ApplicantPopup
        isOpen={activePopup === 'applicant'}
        onClose={() => setActivePopup(null)}
        onReset={handleReset}
        value={applicant}
        onConfirm={(data) => { setApplicant(data); goNext(); }}
        completedSteps={completedSteps}
      />
      <SpacePopup
        isOpen={activePopup === 'space'}
        onClose={() => setActivePopup(null)}
        onBack={goBack}
        onReset={handleReset}
        value={spaceSelection?.id ?? null}
        previousSelection={spaceSelection}
        onSelected={(sel) => { setSpaceSelection(sel); goNext(); }}
        completedSteps={completedSteps}
      />
      <HeadcountPopup
        isOpen={activePopup === 'headcount'}
        onClose={() => setActivePopup(null)}
        onBack={goBack}
        onReset={handleReset}
        value={headcount}
        onConfirm={(val) => { setHeadcount(val); goNext(); }}
        completedSteps={completedSteps}
      />
      <DateTimePopup
        isOpen={activePopup === 'datetime'}
        onClose={() => setActivePopup(null)}
        onBack={goBack}
        onReset={handleReset}
        spaceId={spaceSelection?.id ?? null}
        value={timeSlot}
        onConfirm={(val) => { setTimeSlot(val); goNext(); }}
        completedSteps={completedSteps}
      />
      <PurposePopup
        isOpen={activePopup === 'purpose'}
        onClose={() => setActivePopup(null)}
        onBack={goBack}
        onReset={handleReset}
        value={purpose}
        onConfirm={(val) => { setPurpose(val); setActivePopup(null); setIsReviewing(true); }}
        completedSteps={completedSteps}
      />
    </>
  );
}

interface ReviewPanelProps {
  applicant: ApplicantData;
  spaceSelection: SpaceSelection;
  headcount: number;
  timeSlot: TimeSlotValue;
  purpose: string;
  submitError: string | null;
  isSubmitting: boolean;
  onEdit: () => void;
  onSubmit: () => void;
}

function ReviewPanel({
  applicant,
  spaceSelection,
  headcount,
  timeSlot,
  purpose,
  submitError,
  isSubmitting,
  onEdit,
  onSubmit,
}: ReviewPanelProps): JSX.Element {
  const spaceLabel = `${spaceSelection.buildingName}${spaceSelection.floor !== null ? ` ${spaceSelection.floor}층` : ''} ${spaceSelection.spaceName}`;
  const datetimeLabel = `${timeSlot.date} ${formatTime(timeSlot.startTime)} ~ ${formatTimeSlotLabel(timeSlot.endTime, timeSlot.date)}`;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-md overflow-hidden">
      <div className="bg-brand-primary px-5 py-4">
        <p className="text-white font-bold text-base">신청 내용 확인</p>
        <p className="text-white/70 text-xs mt-0.5">아래 내용을 확인하고 신청해주세요</p>
      </div>

      <div className="px-5 py-4 space-y-3">
        <ReviewRow label="신청자" value={`${applicant.name} (${applicant.phone})`} />
        <ReviewRow label="단체" value={`${applicant.departmentName} > ${applicant.teamName}`} />
        <ReviewRow label="장소" value={spaceLabel} />
        <ReviewRow label="인원" value={`${headcount}명`} />
        <ReviewRow label="일시" value={datetimeLabel} />
        <ReviewRow label="목적" value={purpose} />
      </div>

      {submitError && (
        <div className="mx-5 mb-3 rounded-xl bg-[#DC2626]/10 border border-[#DC2626]/30 p-3 text-sm text-[#DC2626]">
          {submitError}
        </div>
      )}

      <div className="px-5 pb-5 flex gap-3">
        <button
          type="button"
          onClick={onEdit}
          className={`flex-1 rounded-xl border px-4 py-3 text-sm font-medium transition-colors ${
            submitError
              ? 'border-brand-primary bg-brand-primary text-white hover:bg-brand-primary/90'
              : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          수정하기
        </button>
        <button
          type="button"
          disabled={isSubmitting}
          onClick={onSubmit}
          className="flex-1 rounded-xl bg-brand-accent px-4 py-3 text-sm font-bold text-white hover:bg-[#a8784f] active:bg-[#946840] transition-colors disabled:opacity-60"
        >
          {isSubmitting ? '신청 중...' : '신청하기'}
        </button>
      </div>
    </div>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 text-sm">
      <span className="text-brand-accent font-medium w-14 flex-shrink-0">{label}</span>
      <span className="text-black font-semibold break-words">{value}</span>
    </div>
  );
}

export default ReservationForm;
