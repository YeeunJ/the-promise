import type { ReservationFormData } from '../types';

interface ApplicantFieldsProps {
  formData: Pick<ReservationFormData, 'applicant_name' | 'applicant_phone' | 'applicant_team' | 'leader_phone'>;
  errors: Partial<Record<keyof ReservationFormData, string>>;
  onTextChange: (field: 'applicant_name' | 'applicant_team') => (e: React.ChangeEvent<HTMLInputElement>) => void;
  onPhoneChange: (field: 'applicant_phone' | 'leader_phone') => (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function ApplicantFields({ formData, errors, onTextChange, onPhoneChange }: ApplicantFieldsProps): JSX.Element {
  return (
    <div className="space-y-6">
      {/* Row 1: 신청자 이름 + 연락처 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* 신청자 이름 */}
        <div className="flex flex-col gap-1">
          <label htmlFor="applicant_name" className="block text-sm font-medium text-black mb-1">
            신청자 이름 <span className="text-[#DC2626]">*</span>
          </label>
          <input
            id="applicant_name"
            type="text"
            value={formData.applicant_name}
            onChange={onTextChange('applicant_name')}
            placeholder="홍길동"
            className={`w-full rounded-xl border px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary ${
              errors.applicant_name ? 'border-[#DC2626] bg-[#DC2626]/5' : 'border-gray-300 bg-white'
            }`}
          />
          {errors.applicant_name && (
            <p className="mt-1 text-xs text-[#DC2626]">{errors.applicant_name}</p>
          )}
        </div>

        {/* 연락처 */}
        <div className="flex flex-col gap-1">
          <label htmlFor="applicant_phone" className="block text-sm font-medium text-black mb-1">
            연락처 <span className="text-[#DC2626]">*</span>
          </label>
          <input
            id="applicant_phone"
            type="text"
            value={formData.applicant_phone}
            onChange={onPhoneChange('applicant_phone')}
            placeholder="010-0000-0000"
            inputMode="numeric"
            className={`w-full rounded-xl border px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary ${
              errors.applicant_phone ? 'border-[#DC2626] bg-[#DC2626]/5' : 'border-gray-300 bg-white'
            }`}
          />
          {errors.applicant_phone && (
            <p className="mt-1 text-xs text-[#DC2626]">{errors.applicant_phone}</p>
          )}
        </div>
      </div>

      {/* Row 2: 단체명 + 책임자 연락처 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* 단체명 */}
        <div className="flex flex-col gap-1">
          <label htmlFor="applicant_team" className="block text-sm font-medium text-black mb-1">
            단체명 <span className="text-[#DC2626]">*</span>
          </label>
          <input
            id="applicant_team"
            type="text"
            value={formData.applicant_team}
            onChange={onTextChange('applicant_team')}
            placeholder="청년부"
            className={`w-full rounded-xl border px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary ${
              errors.applicant_team ? 'border-[#DC2626] bg-[#DC2626]/5' : 'border-gray-300 bg-white'
            }`}
          />
          {errors.applicant_team && (
            <p className="mt-1 text-xs text-[#DC2626]">{errors.applicant_team}</p>
          )}
        </div>

        {/* 책임자 연락처 */}
        <div className="flex flex-col gap-1">
          <label htmlFor="leader_phone" className="block text-sm font-medium text-black mb-1">
            책임자 연락처 <span className="text-[#DC2626]">*</span>
          </label>
          <input
            id="leader_phone"
            type="text"
            value={formData.leader_phone}
            onChange={onPhoneChange('leader_phone')}
            placeholder="010-0000-0000"
            inputMode="numeric"
            className={`w-full rounded-xl border px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary ${
              errors.leader_phone ? 'border-[#DC2626] bg-[#DC2626]/5' : 'border-gray-300 bg-white'
            }`}
          />
          {errors.leader_phone && (
            <p className="mt-1 text-xs text-[#DC2626]">{errors.leader_phone}</p>
          )}
        </div>
      </div>
    </div>
  );
}
