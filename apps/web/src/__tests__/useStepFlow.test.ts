import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useStepFlow } from '../hooks/useStepFlow';
import { BOOKING_DRAFT_STORAGE_KEY } from '../hooks/useBookingDraft';

beforeEach(() => {
  localStorage.clear();
});

describe('useStepFlow', () => {
  it('초기 currentStep 은 0', () => {
    const { result } = renderHook(() => useStepFlow());
    expect(result.current.currentStep).toBe(0);
  });

  it('localStorage maxReachedStep 이 있으면 currentStep 복원', () => {
    localStorage.setItem(
      BOOKING_DRAFT_STORAGE_KEY,
      JSON.stringify({
        draft: {
          applicant: null,
          space: null,
          headcount: 0,
          timeSlot: { date: '', startTime: '', endTime: '' },
          purpose: '',
        },
        maxReachedStep: 3,
      }),
    );
    const { result } = renderHook(() => useStepFlow());
    expect(result.current.currentStep).toBe(2);
  });

  it('getStepState: 초기에 step 0 active, 나머지 locked', () => {
    const { result } = renderHook(() => useStepFlow());
    expect(result.current.getStepState(0)).toBe('active');
    expect(result.current.getStepState(1)).toBe('locked');
    expect(result.current.getStepState(4)).toBe('locked');
  });

  it('advance() 후 이전 step visible, 새 step active', () => {
    const { result } = renderHook(() => useStepFlow());
    act(() => {
      result.current.advance();
    });
    expect(result.current.currentStep).toBe(1);
    expect(result.current.getStepState(0)).toBe('visible');
    expect(result.current.getStepState(1)).toBe('active');
    expect(result.current.getStepState(2)).toBe('locked');
  });

  it('advance() 는 currentStep 4 를 초과하지 않음', () => {
    const { result } = renderHook(() => useStepFlow());
    for (let i = 0; i < 10; i++) {
      act(() => {
        result.current.advance();
      });
    }
    expect(result.current.currentStep).toBe(4);
    expect(result.current.getStepState(4)).toBe('active');
  });

  it('advance() 는 maxReachedStep 을 동기화', () => {
    const { result } = renderHook(() => useStepFlow());
    act(() => {
      result.current.advance();
    });
    expect(result.current.maxReachedStep).toBe(2);
  });
});
