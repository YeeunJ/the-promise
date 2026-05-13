import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ApplicantData, SpaceSelection } from '../types/booking';
import type { TimeSlotValue } from '../types';

const STORAGE_KEY = 'the-promise:booking-draft:v1';

export const BOOKING_DRAFT_STORAGE_KEY = STORAGE_KEY;

export interface BookingDraft {
  applicant: ApplicantData | null;
  space: SpaceSelection | null;
  headcount: number;
  timeSlot: TimeSlotValue;
  purpose: string;
}

export const INITIAL_BOOKING_DRAFT: BookingDraft = {
  applicant: null,
  space: null,
  headcount: 0,
  timeSlot: { date: '', startTime: '', endTime: '' },
  purpose: '',
};

export interface UseBookingDraftResult {
  draft: BookingDraft;
  maxReachedStep: number;
  updateApplicant: (data: ApplicantData) => void;
  updateSpace: (data: SpaceSelection) => void;
  updateHeadcount: (n: number) => void;
  updateTimeSlot: (slot: TimeSlotValue) => void;
  updatePurpose: (s: string) => void;
  setMaxReachedStep: (step: number) => void;
  clear: () => void;
  isComplete: boolean;
  isStepValid: (step: number) => boolean;
}

interface PersistedState {
  draft: BookingDraft;
  maxReachedStep: number;
}

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function isValidTimeSlot(v: unknown): v is TimeSlotValue {
  return (
    isPlainObject(v) &&
    typeof v.date === 'string' &&
    typeof v.startTime === 'string' &&
    typeof v.endTime === 'string'
  );
}

function isValidDraft(v: unknown): v is BookingDraft {
  if (!isPlainObject(v)) return false;
  return (
    (v.applicant === null || isPlainObject(v.applicant)) &&
    (v.space === null || isPlainObject(v.space)) &&
    typeof v.headcount === 'number' &&
    isValidTimeSlot(v.timeSlot) &&
    typeof v.purpose === 'string'
  );
}

function readPersisted(): PersistedState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null) return null;
    const parsed = JSON.parse(raw) as unknown;
    if (!isPlainObject(parsed)) return null;
    if (!isValidDraft(parsed.draft)) return null;
    if (typeof parsed.maxReachedStep !== 'number') return null;
    return { draft: parsed.draft, maxReachedStep: parsed.maxReachedStep };
  } catch {
    return null;
  }
}

function persistOrClear(draft: BookingDraft, maxReachedStep: number): void {
  const isInitial = draft === INITIAL_BOOKING_DRAFT && maxReachedStep === 1;
  try {
    if (isInitial) {
      localStorage.removeItem(STORAGE_KEY);
    } else {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ draft, maxReachedStep }));
    }
  } catch {
    // ignore quota / disabled
  }
}

function validateApplicant(a: ApplicantData | null): boolean {
  if (!a) return false;
  if (!a.name.trim()) return false;
  if (!a.phone.trim()) return false;
  if (!a.departmentName) return false;
  if (a.teamId === null && !a.customTeamName?.trim()) return false;
  return true;
}

function validateTimeSlot(t: TimeSlotValue): boolean {
  return Boolean(t.date) && Boolean(t.startTime) && Boolean(t.endTime);
}

function evaluateStep(draft: BookingDraft, step: number): boolean {
  switch (step) {
    case 1:
      return validateApplicant(draft.applicant);
    case 2:
      return draft.space !== null;
    case 3:
      return draft.headcount > 0;
    case 4:
      return validateTimeSlot(draft.timeSlot);
    case 5:
      return draft.purpose.trim().length > 0;
    default:
      return false;
  }
}

export function useBookingDraft(): UseBookingDraftResult {
  const [draft, setDraftState] = useState<BookingDraft>(
    () => readPersisted()?.draft ?? INITIAL_BOOKING_DRAFT,
  );
  const [maxReachedStep, setMaxReachedStepState] = useState<number>(
    () => readPersisted()?.maxReachedStep ?? 1,
  );

  useEffect(() => {
    persistOrClear(draft, maxReachedStep);
  }, [draft, maxReachedStep]);

  const updateApplicant = useCallback((data: ApplicantData) => {
    setDraftState((prev) => ({ ...prev, applicant: data }));
  }, []);

  const updateSpace = useCallback((data: SpaceSelection) => {
    setDraftState((prev) => ({ ...prev, space: data }));
  }, []);

  const updateHeadcount = useCallback((n: number) => {
    setDraftState((prev) => ({ ...prev, headcount: n }));
  }, []);

  const updateTimeSlot = useCallback((slot: TimeSlotValue) => {
    setDraftState((prev) => ({ ...prev, timeSlot: slot }));
  }, []);

  const updatePurpose = useCallback((s: string) => {
    setDraftState((prev) => ({ ...prev, purpose: s }));
  }, []);

  const setMaxReachedStep = useCallback((step: number) => {
    setMaxReachedStepState((prev) => Math.max(prev, step));
  }, []);

  const clear = useCallback(() => {
    setDraftState(INITIAL_BOOKING_DRAFT);
    setMaxReachedStepState(1);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  }, []);

  const isStepValid = useCallback(
    (step: number): boolean => evaluateStep(draft, step),
    [draft],
  );

  const isComplete = useMemo(
    () => [1, 2, 3, 4, 5].every((s) => evaluateStep(draft, s)),
    [draft],
  );

  return {
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
  };
}
