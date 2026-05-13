import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatusPill } from '../components/ui/StatusPill';

describe('StatusPill atom', () => {
  it('confirmed shows 확정 label and confirmed status data attr', () => {
    render(<StatusPill status="confirmed" />);
    const pill = screen.getByText('확정');
    expect(pill).toBeInTheDocument();
    expect(pill.getAttribute('data-status')).toBe('confirmed');
    expect(pill.className).toContain('bg-status-confirmed-bg');
  });

  it('pending shows 대기 label', () => {
    render(<StatusPill status="pending" />);
    expect(screen.getByText('대기')).toBeInTheDocument();
  });

  it('rejected shows 거절 label', () => {
    render(<StatusPill status="rejected" />);
    expect(screen.getByText('거절')).toBeInTheDocument();
  });

  it('cancelled shows 취소 label', () => {
    render(<StatusPill status="cancelled" />);
    expect(screen.getByText('취소')).toBeInTheDocument();
  });

  it('size=sm applies smaller font', () => {
    render(<StatusPill status="confirmed" size="sm" />);
    const pill = screen.getByText('확정');
    expect(pill.className).toContain('text-[10px]');
  });

  it('default size=md applies medium font', () => {
    render(<StatusPill status="confirmed" />);
    const pill = screen.getByText('확정');
    expect(pill.className).toContain('text-[11px]');
  });
});
