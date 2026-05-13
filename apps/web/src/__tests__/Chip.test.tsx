import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Chip } from '../components/ui/Chip';

describe('Chip atom', () => {
  it('renders children', () => {
    render(<Chip>1교구</Chip>);
    expect(screen.getByRole('button', { name: '1교구' })).toBeInTheDocument();
  });

  it('inactive chip uses surface-2 bg + aria-pressed=false', () => {
    render(<Chip>X</Chip>);
    const btn = screen.getByRole('button');
    expect(btn.getAttribute('aria-pressed')).toBe('false');
    expect(btn.className).toContain('bg-surface-2');
  });

  it('active chip uses primary bg + aria-pressed=true', () => {
    render(<Chip active>X</Chip>);
    const btn = screen.getByRole('button');
    expect(btn.getAttribute('aria-pressed')).toBe('true');
    expect(btn.className).toContain('bg-primary');
  });

  it('disabled chip cannot be clicked', async () => {
    const onClick = vi.fn();
    render(<Chip onClick={onClick} disabled>X</Chip>);
    const btn = screen.getByRole('button') as HTMLButtonElement;
    expect(btn.disabled).toBe(true);
    await userEvent.click(btn);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('onClick fires when enabled', async () => {
    const onClick = vi.fn();
    render(<Chip onClick={onClick}>X</Chip>);
    await userEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
