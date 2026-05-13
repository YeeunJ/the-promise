import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import {
  useBookingDraft,
  BOOKING_DRAFT_STORAGE_KEY,
  INITIAL_BOOKING_DRAFT,
} from '../hooks/useBookingDraft';
import type { ApplicantData, SpaceSelection } from '../types/booking';

const validApplicant: ApplicantData = {
  name: '홍길동',
  phone: '010-1234-5678',
  departmentId: 1,
  departmentName: '교회학교',
  teamId: 2,
  teamName: '초등1부',
  customTeamName: null,
  pastorDisplay: '김교역자 목사 010-0000-0000',
};

const validSpace: SpaceSelection = {
  id: 1,
  buildingName: '본당',
  floor: 1,
  spaceName: '사랑방',
};

const validTimeSlot = {
  date: '2026-05-20',
  startTime: '2026-05-20T10:00:00',
  endTime: '2026-05-20T11:30:00',
};

describe('useBookingDraft', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('초기 상태: draft 비어있고 maxReachedStep === 1, isComplete === false', () => {
    const { result } = renderHook(() => useBookingDraft());
    expect(result.current.draft).toEqual(INITIAL_BOOKING_DRAFT);
    expect(result.current.maxReachedStep).toBe(1);
    expect(result.current.isComplete).toBe(false);
  });

  it('미입력 상태에서 모든 step 의 isStepValid 는 false', () => {
    const { result } = renderHook(() => useBookingDraft());
    [1, 2, 3, 4, 5].forEach((s) => {
      expect(result.current.isStepValid(s)).toBe(false);
    });
  });

  it('updateApplicant 호출 시 draft.applicant 갱신 + isStepValid(1) === true', () => {
    const { result } = renderHook(() => useBookingDraft());
    act(() => result.current.updateApplicant(validApplicant));
    expect(result.current.draft.applicant).toEqual(validApplicant);
    expect(result.current.isStepValid(1)).toBe(true);
  });

  it('기타 부서 + customTeamName 만으로도 step1 valid', () => {
    const { result } = renderHook(() => useBookingDraft());
    act(() =>
      result.current.updateApplicant({
        ...validApplicant,
        departmentName: '기타',
        teamId: null,
        teamName: '',
        customTeamName: '특별모임',
      }),
    );
    expect(result.current.isStepValid(1)).toBe(true);
  });

  it('teamId 와 customTeamName 모두 비어있으면 step1 invalid', () => {
    const { result } = renderHook(() => useBookingDraft());
    act(() =>
      result.current.updateApplicant({
        ...validApplicant,
        teamId: null,
        customTeamName: null,
      }),
    );
    expect(result.current.isStepValid(1)).toBe(false);
  });

  it('5개 step 모두 채우면 isComplete === true', () => {
    const { result } = renderHook(() => useBookingDraft());
    act(() => {
      result.current.updateApplicant(validApplicant);
      result.current.updateSpace(validSpace);
      result.current.updateHeadcount(30);
      result.current.updateTimeSlot(validTimeSlot);
      result.current.updatePurpose('정기 모임');
    });
    expect(result.current.isComplete).toBe(true);
    expect(result.current.isStepValid(2)).toBe(true);
    expect(result.current.isStepValid(3)).toBe(true);
    expect(result.current.isStepValid(4)).toBe(true);
    expect(result.current.isStepValid(5)).toBe(true);
  });

  it('빈 문자열만 입력된 purpose 는 step5 invalid', () => {
    const { result } = renderHook(() => useBookingDraft());
    act(() => result.current.updatePurpose('   '));
    expect(result.current.isStepValid(5)).toBe(false);
  });

  it('setMaxReachedStep 은 단조 증가 (이전 값보다 작은 입력 무시)', () => {
    const { result } = renderHook(() => useBookingDraft());
    act(() => result.current.setMaxReachedStep(3));
    expect(result.current.maxReachedStep).toBe(3);
    act(() => result.current.setMaxReachedStep(2));
    expect(result.current.maxReachedStep).toBe(3);
    act(() => result.current.setMaxReachedStep(5));
    expect(result.current.maxReachedStep).toBe(5);
  });

  it('업데이트 후 localStorage 에 자동 저장', () => {
    const { result } = renderHook(() => useBookingDraft());
    act(() => {
      result.current.updateApplicant(validApplicant);
      result.current.setMaxReachedStep(2);
    });
    const raw = localStorage.getItem(BOOKING_DRAFT_STORAGE_KEY);
    expect(raw).toBeTruthy();
    const parsed = JSON.parse(raw as string) as {
      draft: { applicant: ApplicantData | null };
      maxReachedStep: number;
    };
    expect(parsed.draft.applicant).toEqual(validApplicant);
    expect(parsed.maxReachedStep).toBe(2);
  });

  it('localStorage 에 저장된 데이터를 mount 시 복원', () => {
    localStorage.setItem(
      BOOKING_DRAFT_STORAGE_KEY,
      JSON.stringify({
        draft: {
          applicant: validApplicant,
          space: validSpace,
          headcount: 30,
          timeSlot: validTimeSlot,
          purpose: '',
        },
        maxReachedStep: 4,
      }),
    );
    const { result } = renderHook(() => useBookingDraft());
    expect(result.current.draft.applicant).toEqual(validApplicant);
    expect(result.current.draft.space).toEqual(validSpace);
    expect(result.current.draft.headcount).toBe(30);
    expect(result.current.maxReachedStep).toBe(4);
  });

  it('clear() 호출 시 draft 와 maxReachedStep 모두 초기화', () => {
    const { result } = renderHook(() => useBookingDraft());
    act(() => {
      result.current.updateApplicant(validApplicant);
      result.current.setMaxReachedStep(3);
    });
    expect(result.current.maxReachedStep).toBe(3);
    act(() => result.current.clear());
    expect(result.current.draft).toEqual(INITIAL_BOOKING_DRAFT);
    expect(result.current.maxReachedStep).toBe(1);
  });

  it('손상된 localStorage payload 는 무시하고 초기 상태로 시작', () => {
    localStorage.setItem(BOOKING_DRAFT_STORAGE_KEY, '{ not-json');
    const { result } = renderHook(() => useBookingDraft());
    expect(result.current.draft).toEqual(INITIAL_BOOKING_DRAFT);
    expect(result.current.maxReachedStep).toBe(1);
  });

  it('스키마가 다른 payload 는 무시하고 초기 상태로 시작', () => {
    localStorage.setItem(
      BOOKING_DRAFT_STORAGE_KEY,
      JSON.stringify({ foo: 'bar' }),
    );
    const { result } = renderHook(() => useBookingDraft());
    expect(result.current.draft).toEqual(INITIAL_BOOKING_DRAFT);
    expect(result.current.maxReachedStep).toBe(1);
  });
});
