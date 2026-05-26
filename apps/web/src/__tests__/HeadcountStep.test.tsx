import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HeadcountStep } from '../components/booking/steps/HeadcountStep';

describe('HeadcountStep', () => {
  it('6 옵션 모두 렌더', () => {
    render(<HeadcountStep value={0} onChange={vi.fn()} />);
    expect(screen.getByRole('button', { name: /~10명/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /~20명/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /~30명/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /~50명/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /~100명/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /100명 이상/ })).toBeInTheDocument();
  });

  it('옵션 클릭 시 onChange 콜백 호출', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<HeadcountStep value={0} onChange={onChange} />);

    await user.click(screen.getByRole('button', { name: /~30명/ }));
    expect(onChange).toHaveBeenCalledWith(30);
  });

  it('value === 50 이면 해당 옵션이 selected 시각 표시 (aria-pressed=true)', () => {
    render(<HeadcountStep value={50} onChange={vi.fn()} />);
    const btn = screen.getByRole('button', { name: /~50명/ });
    expect(btn).toHaveAttribute('aria-pressed', 'true');
  });

  it('선택되지 않은 옵션은 aria-pressed=false', () => {
    render(<HeadcountStep value={50} onChange={vi.fn()} />);
    const btn = screen.getByRole('button', { name: /~10명/ });
    expect(btn).toHaveAttribute('aria-pressed', 'false');
  });
});
