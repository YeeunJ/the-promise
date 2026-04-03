import { describe, it, expect } from 'vitest';
import {
  validateReservationForm,
  INITIAL_FORM_DATA,
  INITIAL_TIME_SLOT,
  PHONE_REGEX,
} from '../utils/reservationFormHelpers';
import type { ReservationFormData } from '../types';

const VALID_FORM: ReservationFormData = {
  space: 1,
  applicant_name: '홍길동',
  applicant_phone: '010-1234-5678',
  applicant_team: '청년부',
  leader_phone: '010-8765-4321',
  headcount: 10,
  purpose: '정기모임',
  start_datetime: '2026-04-10T10:00:00+09:00',
  end_datetime: '2026-04-10T12:00:00+09:00',
};

describe('PHONE_REGEX', () => {
  it('010-XXXX-XXXX 형식을 통과시킨다', () => {
    expect(PHONE_REGEX.test('010-1234-5678')).toBe(true);
  });

  it('하이픈 없는 형식을 거부한다', () => {
    expect(PHONE_REGEX.test('01012345678')).toBe(false);
  });

  it('010이 아닌 번호를 거부한다', () => {
    expect(PHONE_REGEX.test('011-1234-5678')).toBe(false);
  });

  it('자릿수가 부족한 경우 거부한다', () => {
    expect(PHONE_REGEX.test('010-123-5678')).toBe(false);
  });
});

describe('INITIAL_FORM_DATA', () => {
  it('space가 0이다', () => {
    expect(INITIAL_FORM_DATA.space).toBe(0);
  });

  it('headcount가 0이다', () => {
    expect(INITIAL_FORM_DATA.headcount).toBe(0);
  });

  it('모든 문자열 필드가 빈 문자열이다', () => {
    expect(INITIAL_FORM_DATA.applicant_name).toBe('');
    expect(INITIAL_FORM_DATA.applicant_phone).toBe('');
    expect(INITIAL_FORM_DATA.applicant_team).toBe('');
    expect(INITIAL_FORM_DATA.leader_phone).toBe('');
    expect(INITIAL_FORM_DATA.purpose).toBe('');
    expect(INITIAL_FORM_DATA.start_datetime).toBe('');
    expect(INITIAL_FORM_DATA.end_datetime).toBe('');
  });
});

describe('INITIAL_TIME_SLOT', () => {
  it('모든 필드가 빈 문자열이다', () => {
    expect(INITIAL_TIME_SLOT.date).toBe('');
    expect(INITIAL_TIME_SLOT.startTime).toBe('');
    expect(INITIAL_TIME_SLOT.endTime).toBe('');
  });
});

describe('validateReservationForm', () => {
  it('모든 필드가 유효하면 빈 객체를 반환한다 (happy path)', () => {
    const errors = validateReservationForm(VALID_FORM);
    expect(errors).toEqual({});
  });

  it('applicant_name이 빈 문자열이면 에러를 반환한다', () => {
    const errors = validateReservationForm({ ...VALID_FORM, applicant_name: '' });
    expect(errors.applicant_name).toBe('신청자 이름을 입력해주세요');
  });

  it('applicant_name이 공백만 있으면 에러를 반환한다', () => {
    const errors = validateReservationForm({ ...VALID_FORM, applicant_name: '   ' });
    expect(errors.applicant_name).toBe('신청자 이름을 입력해주세요');
  });

  it('applicant_phone이 빈 문자열이면 에러를 반환한다', () => {
    const errors = validateReservationForm({ ...VALID_FORM, applicant_phone: '' });
    expect(errors.applicant_phone).toBe('연락처를 입력해주세요');
  });

  it('applicant_phone 형식이 잘못되면 형식 에러를 반환한다', () => {
    const errors = validateReservationForm({ ...VALID_FORM, applicant_phone: '01012345678' });
    expect(errors.applicant_phone).toBe('010-XXXX-XXXX 형식으로 입력해주세요');
  });

  it('applicant_team이 빈 문자열이면 에러를 반환한다', () => {
    const errors = validateReservationForm({ ...VALID_FORM, applicant_team: '' });
    expect(errors.applicant_team).toBe('단체명을 입력해주세요');
  });

  it('leader_phone이 빈 문자열이면 에러를 반환한다', () => {
    const errors = validateReservationForm({ ...VALID_FORM, leader_phone: '' });
    expect(errors.leader_phone).toBe('책임자 연락처를 입력해주세요');
  });

  it('leader_phone 형식이 잘못되면 형식 에러를 반환한다', () => {
    const errors = validateReservationForm({ ...VALID_FORM, leader_phone: '010-123-456' });
    expect(errors.leader_phone).toBe('010-XXXX-XXXX 형식으로 입력해주세요');
  });

  it('space가 0이면 에러를 반환한다', () => {
    const errors = validateReservationForm({ ...VALID_FORM, space: 0 });
    expect(errors.space).toBe('장소를 선택해주세요');
  });

  it('headcount가 0이면 에러를 반환한다', () => {
    const errors = validateReservationForm({ ...VALID_FORM, headcount: 0 });
    expect(errors.headcount).toBe('인원을 선택해주세요');
  });

  it('start_datetime이 빈 문자열이면 에러를 반환한다', () => {
    const errors = validateReservationForm({ ...VALID_FORM, start_datetime: '' });
    expect(errors.start_datetime).toBe('날짜와 시간을 선택해주세요');
  });

  it('end_datetime이 빈 문자열이면 에러를 반환한다', () => {
    const errors = validateReservationForm({ ...VALID_FORM, end_datetime: '' });
    expect(errors.start_datetime).toBe('날짜와 시간을 선택해주세요');
  });

  it('여러 필드가 동시에 비어있으면 모든 에러를 반환한다', () => {
    const errors = validateReservationForm(INITIAL_FORM_DATA);
    expect(Object.keys(errors).length).toBeGreaterThan(0);
    expect(errors.applicant_name).toBeDefined();
    expect(errors.applicant_phone).toBeDefined();
    expect(errors.applicant_team).toBeDefined();
    expect(errors.leader_phone).toBeDefined();
    expect(errors.space).toBeDefined();
    expect(errors.headcount).toBeDefined();
    expect(errors.start_datetime).toBeDefined();
  });
});
