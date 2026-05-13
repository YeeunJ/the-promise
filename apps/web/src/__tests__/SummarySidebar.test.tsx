import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SummarySidebar } from '../components/booking/SummarySidebar';
import type { CompletedStep } from '../utils/buildCompletedSteps';

describe('SummarySidebar', () => {
  it('빈 items: 신청 현황 헤더 + 안내 메시지만 표시', () => {
    render(<SummarySidebar items={[]} />);
    expect(screen.getByText(/신청 현황/)).toBeInTheDocument();
    expect(screen.getByText(/예약 내역이 맞는지 확인/)).toBeInTheDocument();
  });

  it('items 의 label/value 가 모두 렌더', () => {
    const items: CompletedStep[] = [
      { label: '신청자', value: '홍길동 · 교회학교 초등1부' },
      { label: '장소', value: '본당 1층 사랑방' },
      { label: '인원', value: '~30명' },
    ];
    render(<SummarySidebar items={items} />);
    expect(screen.getByText('신청자')).toBeInTheDocument();
    expect(screen.getByText('홍길동 · 교회학교 초등1부')).toBeInTheDocument();
    expect(screen.getByText('장소')).toBeInTheDocument();
    expect(screen.getByText('본당 1층 사랑방')).toBeInTheDocument();
    expect(screen.getByText('인원')).toBeInTheDocument();
    expect(screen.getByText('~30명')).toBeInTheDocument();
  });

  it('비어 있지 않은 items 와 추가 안내가 공존', () => {
    const items: CompletedStep[] = [{ label: '신청자', value: '홍길동' }];
    render(<SummarySidebar items={items} />);
    expect(screen.getByText('홍길동')).toBeInTheDocument();
    expect(screen.getByText(/예약 내역이 맞는지 확인/)).toBeInTheDocument();
  });
});
