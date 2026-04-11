import type { ApplicantData } from '../components/reservation/ApplicantPopup';
import type { SpaceSelection } from '../components/reservation/SpacePopup';
import type { TimeSlotValue } from '../types';
import { formatDateStr, formatTime } from './formatDatetime';
import { HEADCOUNT_OPTIONS } from '@/lib/constants';

export interface CompletedStep {
  label: string;
  value: string;
}

interface BuildCompletedStepsInput {
  applicant: ApplicantData | null;
  space: SpaceSelection | null;
  headcount: number;
  timeSlot: TimeSlotValue;
  purpose: string;
}

export function buildCompletedSteps({
  applicant,
  space,
  headcount,
  timeSlot,
  purpose,
}: BuildCompletedStepsInput): CompletedStep[] {
  const steps: CompletedStep[] = [];

  if (applicant) {
    steps.push({
      label: '신청자',
      value: `${applicant.name} · ${applicant.departmentName} ${applicant.teamName}`,
    });
  }

  if (space) {
    const floorPart = space.floor !== null ? ` ${space.floor}층` : '';
    steps.push({
      label: '장소',
      value: `${space.buildingName}${floorPart} ${space.spaceName}`,
    });
  }

  if (headcount > 0) {
    steps.push({
      label: '인원',
      value: HEADCOUNT_OPTIONS.find((o) => o.value === headcount)?.label ?? `${headcount}명`,
    });
  }

  if (timeSlot.date && timeSlot.startTime && timeSlot.endTime) {
    steps.push({
      label: '일시',
      value: `${formatDateStr(timeSlot.date)} ${formatTime(timeSlot.startTime)} ~ ${formatTime(timeSlot.endTime)}`,
    });
  }

  if (purpose.trim()) {
    steps.push({
      label: '사용 목적',
      value: purpose.trim(),
    });
  }

  return steps;
}
