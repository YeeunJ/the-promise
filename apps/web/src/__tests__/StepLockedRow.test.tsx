import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StepLockedRow } from '../components/booking/StepLockedRow';

describe('StepLockedRow', () => {
  it('stepNumber 와 title 렌더', () => {
    render(<StepLockedRow stepNumber={3} title="날짜 및 시간" />);
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('날짜 및 시간')).toBeInTheDocument();
  });

  it('STEP N 라벨 렌더', () => {
    render(<StepLockedRow stepNumber={4} title="사용 목적" />);
    expect(screen.getByText('STEP 4')).toBeInTheDocument();
  });

  it('잠금 아이콘 SVG 렌더 (aria-hidden)', () => {
    const { container } = render(<StepLockedRow stepNumber={2} title="장소 선택" />);
    const svg = container.querySelector('svg[aria-hidden="true"]');
    expect(svg).toBeInTheDocument();
  });
});
