import { describe, it, expect } from 'vitest';
import { buildCompletedSteps } from '../utils/buildCompletedSteps';
import type { ApplicantData } from '../components/reservation/ApplicantPopup';
import type { SpaceSelection } from '../components/reservation/SpacePopup';
import type { TimeSlotValue } from '../types';

describe('buildCompletedSteps', () => {
  const mockApplicant: ApplicantData = {
    name: '홍길동',
    phone: '010-1234-5678',
    departmentId: 'youth',
    departmentName: '청년부',
    teamId: 'youth-1',
    teamName: '1청년부',
    pastorDisplay: '김요셉 전도사',
  };

  const mockSpace: SpaceSelection = {
    id: 1,
    buildingName: '본관',
    floor: 2,
    spaceName: '세미나실',
  };

  const mockTimeSlot: TimeSlotValue = {
    date: '2026-04-15',
    startTime: '2026-04-15T10:00:00+09:00',
    endTime: '2026-04-15T12:00:00+09:00',
  };

  it('모든 데이터가 없으면 빈 배열을 반환한다', () => {
    const result = buildCompletedSteps({
      applicant: null,
      space: null,
      headcount: 0,
      timeSlot: { date: '', startTime: '', endTime: '' },
      purpose: '',
    });
    expect(result).toEqual([]);
  });

  it('신청자 정보만 있으면 신청자 스텝만 반환한다', () => {
    const result = buildCompletedSteps({
      applicant: mockApplicant,
      space: null,
      headcount: 0,
      timeSlot: { date: '', startTime: '', endTime: '' },
      purpose: '',
    });
    expect(result).toHaveLength(1);
    expect(result[0].label).toBe('신청자');
    expect(result[0].value).toContain('홍길동');
  });

  it('장소 정보가 있으면 장소 스텝을 포함한다', () => {
    const result = buildCompletedSteps({
      applicant: mockApplicant,
      space: mockSpace,
      headcount: 0,
      timeSlot: { date: '', startTime: '', endTime: '' },
      purpose: '',
    });
    const spaceStep = result.find((s) => s.label === '장소');
    expect(spaceStep).toBeDefined();
    expect(spaceStep!.value).toContain('본관');
    expect(spaceStep!.value).toContain('세미나실');
  });

  it('인원이 0보다 크면 인원 스텝을 포함한다', () => {
    const result = buildCompletedSteps({
      applicant: null,
      space: null,
      headcount: 30,
      timeSlot: { date: '', startTime: '', endTime: '' },
      purpose: '',
    });
    const headcountStep = result.find((s) => s.label === '인원');
    expect(headcountStep).toBeDefined();
    expect(headcountStep!.value).toContain('30');
  });

  it('시간 정보가 완전하면 일시 스텝을 포함한다', () => {
    const result = buildCompletedSteps({
      applicant: null,
      space: null,
      headcount: 0,
      timeSlot: mockTimeSlot,
      purpose: '',
    });
    const timeStep = result.find((s) => s.label === '일시');
    expect(timeStep).toBeDefined();
    expect(timeStep!.value).toContain('2026');
  });

  it('목적이 있으면 목적 스텝을 포함한다', () => {
    const result = buildCompletedSteps({
      applicant: null,
      space: null,
      headcount: 0,
      timeSlot: { date: '', startTime: '', endTime: '' },
      purpose: '예배 연습',
    });
    const purposeStep = result.find((s) => s.label === '사용 목적');
    expect(purposeStep).toBeDefined();
    expect(purposeStep!.value).toBe('예배 연습');
  });

  it('모든 데이터가 있으면 5개 스텝을 반환한다', () => {
    const result = buildCompletedSteps({
      applicant: mockApplicant,
      space: mockSpace,
      headcount: 30,
      timeSlot: mockTimeSlot,
      purpose: '예배 연습',
    });
    expect(result).toHaveLength(5);
  });
});
