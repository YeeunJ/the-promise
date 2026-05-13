import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Card } from '../components/ui/Card';

describe('Card atom', () => {
  it('renders children inside a div by default', () => {
    render(<Card><span data-testid="child">A</span></Card>);
    expect(screen.getByTestId('child')).toBeInTheDocument();
    const cardEl = screen.getByTestId('child').parentElement;
    expect(cardEl?.tagName).toBe('DIV');
  });

  it('selected=false uses normal border class', () => {
    render(<Card><span data-testid="child">A</span></Card>);
    const cardEl = screen.getByTestId('child').parentElement;
    expect(cardEl?.className).toContain('border-edge-soft');
    expect(cardEl?.className).not.toContain('border-2');
  });

  it('selected=true uses 2px primary border', () => {
    render(<Card selected><span data-testid="child">A</span></Card>);
    const cardEl = screen.getByTestId('child').parentElement;
    expect(cardEl?.className).toContain('border-2');
    expect(cardEl?.className).toContain('border-primary');
  });

  it('as=button renders a button element with type button', async () => {
    const onClick = vi.fn();
    render(
      <Card as="button" onClick={onClick}>
        <span data-testid="child">B</span>
      </Card>,
    );
    const btn = screen.getByRole('button');
    expect(btn.tagName).toBe('BUTTON');
    expect((btn as HTMLButtonElement).type).toBe('button');
    await userEvent.click(btn);
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
