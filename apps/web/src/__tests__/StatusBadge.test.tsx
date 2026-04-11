import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatusBadge, STATUS_LABEL, STATUS_CLASS } from '../components/ui/StatusBadge';

describe('StatusBadge', () => {
  it('confirmed 상태에서 "확정" 텍스트를 표시한다 (happy path)', () => {
    render(<StatusBadge status="confirmed" />);
    expect(screen.getByText('확정')).toBeInTheDocument();
  });

  it('pending 상태에서 "대기" 텍스트를 표시한다', () => {
    render(<StatusBadge status="pending" />);
    expect(screen.getByText('대기')).toBeInTheDocument();
  });

  it('rejected 상태에서 "거절" 텍스트를 표시한다', () => {
    render(<StatusBadge status="rejected" />);
    expect(screen.getByText('거절')).toBeInTheDocument();
  });

  it('cancelled 상태에서 "취소" 텍스트를 표시한다', () => {
    render(<StatusBadge status="cancelled" />);
    expect(screen.getByText('취소')).toBeInTheDocument();
  });

  it('span 요소를 렌더링한다', () => {
    render(<StatusBadge status="confirmed" />);
    const badge = screen.getByText('확정');
    expect(badge.tagName).toBe('SPAN');
  });
});

describe('STATUS_LABEL', () => {
  it('모든 상태에 대한 한국어 레이블을 정의한다', () => {
    expect(STATUS_LABEL.confirmed).toBe('확정');
    expect(STATUS_LABEL.pending).toBe('대기');
    expect(STATUS_LABEL.rejected).toBe('거절');
    expect(STATUS_LABEL.cancelled).toBe('취소');
  });
});

describe('STATUS_CLASS', () => {
  it('confirmed 상태에 green 클래스를 포함한다', () => {
    expect(STATUS_CLASS.confirmed).toContain('brand-primary');
  });

  it('pending 상태에 olive 클래스를 포함한다', () => {
    expect(STATUS_CLASS.pending).toContain('brand-secondary');
  });

  it('rejected 상태에 red 클래스를 포함한다', () => {
    expect(STATUS_CLASS.rejected).toContain('#DC2626');
  });

  it('cancelled 상태에 gray 클래스를 포함한다 (boundary case)', () => {
    expect(STATUS_CLASS.cancelled).toContain('gray');
  });
});
