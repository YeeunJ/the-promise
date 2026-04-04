import { useState } from 'react';
import axios, { isAxiosError } from 'axios';
import type { Reservation, ReservationFormData, TimeSlotValue, ApiError } from '../types';
import { normalizePhone } from '../utils/formatPhone';
import { validateReservationForm, INITIAL_FORM_DATA, INITIAL_TIME_SLOT } from '../utils/reservationFormHelpers';
import { SpaceSelector } from './SpaceSelector';
import TimeSlotPicker from './TimeSlotPicker';
import { ApplicantFields } from './ApplicantFields';
import { HEADCOUNT_OPTIONS } from '../../../../packages/shared/constants/reservation';

interface ReservationFormProps {
  onSubmitSuccess: (reservation: Reservation) => void;
}

function ReservationForm({ onSubmitSuccess }: ReservationFormProps): JSX.Element {
  const [formData, setFormData] = useState<ReservationFormData>(INITIAL_FORM_DATA);
  const [timeSlot, setTimeSlot] = useState<TimeSlotValue>(INITIAL_TIME_SLOT);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof ReservationFormData, string>>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  function handleTextChange(field: 'purpose') {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setFormData((prev) => ({ ...prev, [field]: e.target.value }));
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    };
  }

  function handleApplicantTextChange(field: 'applicant_name' | 'applicant_team') {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({ ...prev, [field]: e.target.value }));
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    };
  }

  function handlePhoneChange(field: 'applicant_phone' | 'leader_phone') {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      const formatted = normalizePhone(e.target.value);
      setFormData((prev) => ({ ...prev, [field]: formatted }));
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    };
  }

  function handleSpaceChange(spaceId: number) {
    setFormData((prev) => ({ ...prev, space: spaceId }));
    setErrors((prev) => ({ ...prev, space: undefined }));
  }

  function handleHeadcountChange(e: React.ChangeEvent<HTMLSelectElement>) {
    setFormData((prev) => ({ ...prev, headcount: Number(e.target.value) }));
    setErrors((prev) => ({ ...prev, headcount: undefined }));
  }

  function handleTimeSlotChange(value: TimeSlotValue) {
    setTimeSlot(value);
    setFormData((prev) => ({
      ...prev,
      start_datetime: value.startTime,
      end_datetime: value.endTime,
    }));
    setErrors((prev) => ({
      ...prev,
      start_datetime: undefined,
      end_datetime: undefined,
    }));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitError(null);

    const validationErrors = validateReservationForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await axios.post<Reservation>(
        `${import.meta.env.VITE_API_BASE_URL}/api/v1/reservations/`,
        formData
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

  const spaceIdForPicker = formData.space === 0 ? null : formData.space;

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      <ApplicantFields
        formData={formData}
        errors={errors}
        onTextChange={handleApplicantTextChange}
        onPhoneChange={handlePhoneChange}
      />

      {/* 장소 */}
      <div>
        <p className="block text-sm font-medium text-black mb-1">
          장소 <span className="text-[#DC2626]">*</span>
        </p>
        <SpaceSelector value={spaceIdForPicker} onChange={handleSpaceChange} />
        {errors.space && (
          <p className="mt-1 text-xs text-[#DC2626]">{errors.space}</p>
        )}
      </div>

      {/* 인원 */}
      <div>
        <label htmlFor="headcount" className="block text-sm font-medium text-black mb-1">
          인원 <span className="text-[#DC2626]">*</span>
        </label>
        <select
          id="headcount"
          value={formData.headcount === 0 ? '' : formData.headcount}
          onChange={handleHeadcountChange}
          className={`w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#008F49]/20 focus:border-[#008F49] ${
            errors.headcount ? 'border-[#DC2626] bg-[#DC2626]/5' : 'border-gray-300 bg-white'
          }`}
        >
          <option value="">인원을 선택해주세요</option>
          {HEADCOUNT_OPTIONS.map((count: number) => (
            <option key={count} value={count}>
              ~{count}명
            </option>
          ))}
        </select>
        {errors.headcount && (
          <p className="mt-1 text-xs text-[#DC2626]">{errors.headcount}</p>
        )}
      </div>

      {/* 일시 */}
      <div>
        <p className="block text-sm font-medium text-black mb-1">
          일시 <span className="text-[#DC2626]">*</span>
        </p>
        <TimeSlotPicker
          spaceId={spaceIdForPicker}
          value={timeSlot}
          onChange={handleTimeSlotChange}
        />
        {errors.start_datetime && (
          <p className="mt-1 text-xs text-[#DC2626]">{errors.start_datetime}</p>
        )}
      </div>

      {/* 사용 목적 */}
      <div>
        <label htmlFor="purpose" className="block text-sm font-medium text-black mb-1">
          사용 목적 <span className="text-[#DC2626]">*</span>
        </label>
        <textarea
          id="purpose"
          value={formData.purpose}
          onChange={handleTextChange('purpose')}
          placeholder="예: 청년부 정기모임"
          rows={3}
          className={`w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#008F49]/20 focus:border-[#008F49] resize-none ${
            errors.purpose ? 'border-[#DC2626] bg-[#DC2626]/5' : 'border-gray-300 bg-white'
          }`}
        />
        {errors.purpose && (
          <p className="mt-1 text-xs text-[#DC2626]">{errors.purpose}</p>
        )}
      </div>

      {/* 제출 에러 메시지 */}
      {submitError && (
        <div className="rounded-xl bg-[#DC2626]/10 border border-[#DC2626]/30 p-3 text-sm text-[#DC2626]">
          {submitError}
        </div>
      )}

      {/* 제출 버튼 */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-xl bg-[#008F49] px-4 py-3 text-base font-bold text-white transition-colors hover:bg-[#AAA014] disabled:cursor-not-allowed disabled:bg-[#E5E7EB]"
      >
        {isSubmitting ? '신청 중...' : '장소 사용 신청'}
      </button>
    </form>
  );
}

export default ReservationForm;
