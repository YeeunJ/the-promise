import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { KpiCard } from '../components/ui/KpiCard';

describe('KpiCard atom', () => {
  it('renders label and value', () => {
    render(<KpiCard label="이번 주 예약" value={37} />);
    expect(screen.getByText('이번 주 예약')).toBeInTheDocument();
    expect(screen.getByText('37')).toBeInTheDocument();
  });

  it('value can be a string', () => {
    render(<KpiCard label="인기 공간" value="자람뜰홀" />);
    expect(screen.getByText('자람뜰홀')).toBeInTheDocument();
  });

  it('renders icon when provided', () => {
    render(
      <KpiCard
        label="대기"
        value={8}
        icon={<span data-testid="kpi-icon" />}
      />,
    );
    expect(screen.getByTestId('kpi-icon')).toBeInTheDocument();
  });

  it('delta up trend uses primary color', () => {
    render(<KpiCard label="X" value={1} delta={{ value: '+2 vs 지난주', trend: 'up' }} />);
    const deltaEl = screen.getByText(/\+2 vs 지난주/);
    expect(deltaEl.className).toContain('text-primary');
  });

  it('delta down trend uses danger color', () => {
    render(<KpiCard label="X" value={1} delta={{ value: '-3', trend: 'down' }} />);
    const deltaEl = screen.getByText(/-3/);
    expect(deltaEl.className).toContain('text-danger');
  });

  it('omits delta block when not provided', () => {
    const { container } = render(<KpiCard label="X" value={1} />);
    expect(container.textContent).not.toMatch(/▲|▼|—/);
  });

  it('value has tabular-nums class for alignment', () => {
    render(<KpiCard label="X" value={42} />);
    const valueEl = screen.getByText('42');
    expect(valueEl.className).toContain('tabular-nums');
  });
});
