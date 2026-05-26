import type { ReservationFormData, TimeSlotValue } from '../types';

// 010-XXXX-XXXX 형식 검사
export const PHONE_REGEX = /^010-\d{4}-\d{4}$/;

export const INITIAL_FORM_DATA: ReservationFormData = {
  space: 0,
  applicant_name: '',
  applicant_phone: '',
  team: null,
  custom_team_name: null,
  leader_phone: '',
  headcount: 0,
  purpose: '',
  start_datetime: '',
  end_datetime: '',
};

export const INITIAL_TIME_SLOT: TimeSlotValue = {
  date: '',
  startTime: '',
  endTime: '',
};

export function validateReservationForm(
  formData: ReservationFormData
): Partial<Record<keyof ReservationFormData, string>> {
  const nextErrors: Partial<Record<keyof ReservationFormData, string>> = {};

  if (!formData.applicant_name.trim()) {
    nextErrors.applicant_name = '신청자 이름을 입력해주세요';
  }

  if (!formData.applicant_phone.trim()) {
    nextErrors.applicant_phone = '연락처를 입력해주세요';
  } else if (!PHONE_REGEX.test(formData.applicant_phone)) {
    nextErrors.applicant_phone = '010-XXXX-XXXX 형식으로 입력해주세요';
  }

  if (formData.team === null && !formData.custom_team_name?.trim()) {
    nextErrors.team = '단체를 선택하거나 입력해주세요';
  }

  if (!formData.leader_phone.trim()) {
    nextErrors.leader_phone = '담당 교역자를 확인해주세요';
  }

  if (formData.space === 0) {
    nextErrors.space = '장소를 선택해주세요';
  }

  if (formData.headcount === 0) {
    nextErrors.headcount = '인원을 선택해주세요';
  }

  if (!formData.start_datetime || !formData.end_datetime) {
    nextErrors.start_datetime = '날짜와 시간을 선택해주세요';
  }

  if (!formData.purpose.trim()) {
    nextErrors.purpose = '사용 목적을 입력해주세요';
  }

  return nextErrors;
}
