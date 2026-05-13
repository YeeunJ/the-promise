import type { ReactNode } from 'react';

interface EyebrowProps {
  children: ReactNode;
  color?: 'accent' | 'mute';
  className?: string;
}

const COLOR_CLASS = {
  accent: 'text-accent',
  mute: 'text-ink-mute',
};

export function Eyebrow({ children, color = 'accent', className = '' }: EyebrowProps): JSX.Element {
  return (
    <span
      className={`text-[11px] font-bold uppercase tracking-[0.08em] ${COLOR_CLASS[color]} ${className}`.trim()}
    >
      {children}
    </span>
  );
}
