import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SummaryRail } from '../components/booking/SummaryRail';
import type { BookingDraft } from '../hooks/useBookingDraft';

const emptyDraft: BookingDraft = {
  applicant: null,
  space: null,
  headcount: 0,
  timeSlot: { date: '', startTime: '', endTime: '' },
  purpose: '',
};

describe('SummaryRail', () => {
  it('빈 draft 에서 모든 항목 "선택 전" 표시', () => {
    render(<SummaryRail draft={emptyDraft} isStepValid={() => false} />);
    const placeholders = screen.getAllByText('선택 전');
    expect(placeholders).toHaveLength(5);
  });

  it('filledCount=0 일 때 안내 텍스트 표시', () => {
    render(<SummaryRail draft={emptyDraft} isStepValid={() => false} />);
    expect(screen.getByText(/채워질 때마다/)).toBeInTheDocument();
  });

  it('신청자 정보 표시', () => {
    const draft: BookingDraft = {
      ...emptyDraft,
      applicant: {
        name: '홍길동',
        phone: '010-1234-5678',
        departmentId: 1,
        departmentName: '청년부',
        teamId: 11,
        teamName: '1청년',
        customTeamName: null,
        pastorDisplay: '',
      },
    };
    render(<SummaryRail draft={draft} isStepValid={(s) => s === 1} />);
    expect(screen.getByText(/홍길동/)).toBeInTheDocument();
    expect(screen.getByText(/청년부/)).toBeInTheDocument();
  });

  it('인원 정보 표시 (~30명)', () => {
    const draft: BookingDraft = { ...emptyDraft, headcount: 30 };
    render(<SummaryRail draft={draft} isStepValid={(s) => s === 3} />);
    expect(screen.getByText('~30명')).toBeInTheDocument();
  });

  it('사용 목적 표시', () => {
    const draft: BookingDraft = { ...emptyDraft, purpose: '정기 예배' };
    render(<SummaryRail draft={draft} isStepValid={(s) => s === 5} />);
    expect(screen.getByText('정기 예배')).toBeInTheDocument();
  });

  it('filledCount N/5 표시', () => {
    render(<SummaryRail draft={emptyDraft} isStepValid={(s) => s <= 2} />);
    expect(screen.getByText('2/5')).toBeInTheDocument();
  });

  it('filledCount > 0 이면 안내 텍스트 숨김', () => {
    render(<SummaryRail draft={emptyDraft} isStepValid={(s) => s === 1} />);
    expect(screen.queryByText(/채워질 때마다/)).not.toBeInTheDocument();
  });

  it('장소 미선택이면 평면도 카드를 표시하지 않는다', () => {
    render(<SummaryRail draft={emptyDraft} isStepValid={() => false} />);
    expect(screen.queryByText(/평면도/)).not.toBeInTheDocument();
  });

  it('장소 선택 시 평면도 카드를 표시한다', () => {
    const draft: BookingDraft = {
      ...emptyDraft,
      space: { id: 1, buildingName: '본당', floor: 1, spaceName: '자람뜰홀' },
    };
    render(<SummaryRail draft={draft} isStepValid={(s) => s === 3} />);
    expect(screen.getByText('본당 · 1F 평면도')).toBeInTheDocument();
  });
});
