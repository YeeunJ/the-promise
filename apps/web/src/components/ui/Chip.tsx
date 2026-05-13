import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface ChipProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className' | 'type'> {
  active?: boolean;
  children: ReactNode;
  className?: string;
}

const BASE =
  'inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold ' +
  'tracking-[-0.01em] transition-colors disabled:cursor-not-allowed disabled:opacity-50';
const NORMAL =
  'bg-surface-2 text-ink-soft border border-edge-soft hover:bg-edge-soft';
const ACTIVE = 'bg-primary text-white border border-transparent';

export function Chip({
  active = false,
  className = '',
  children,
  ...rest
}: ChipProps): JSX.Element {
  const classes = `${BASE} ${active ? ACTIVE : NORMAL} ${className}`.trim();
  return (
    <button
      type="button"
      aria-pressed={active}
      className={classes}
      {...rest}
    >
      {children}
    </button>
  );
}
