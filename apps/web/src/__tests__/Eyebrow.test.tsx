import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Eyebrow } from '../components/ui/Eyebrow';

describe('Eyebrow atom', () => {
  it('renders children', () => {
    render(<Eyebrow>BASIC INFO</Eyebrow>);
    expect(screen.getByText('BASIC INFO')).toBeInTheDocument();
  });

  it('default color=accent applies accent text color', () => {
    render(<Eyebrow>X</Eyebrow>);
    const el = screen.getByText('X');
    expect(el.className).toContain('text-accent');
  });

  it('color=mute applies muted text color', () => {
    render(<Eyebrow color="mute">X</Eyebrow>);
    const el = screen.getByText('X');
    expect(el.className).toContain('text-ink-mute');
  });

  it('applies uppercase and tracking-wider', () => {
    render(<Eyebrow>uppercase me</Eyebrow>);
    const el = screen.getByText('uppercase me');
    expect(el.className).toContain('uppercase');
    expect(el.className).toContain('tracking-[0.08em]');
  });
});
