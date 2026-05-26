import type { ReactNode } from 'react';

interface KpiDelta {
  value: string;
  trend: 'up' | 'down' | 'neutral';
}

interface KpiCardProps {
  label: string;
  value: string | number;
  icon?: ReactNode;
  delta?: KpiDelta;
  className?: string;
}

const DELTA_COLOR = {
  up: 'text-primary',
  down: 'text-danger',
  neutral: 'text-ink-mute',
};

const DELTA_ARROW = {
  up: '▲',
  down: '▼',
  neutral: '—',
};

export function KpiCard({ label, value, icon, delta, className = '' }: KpiCardProps): JSX.Element {
  return (
    <div
      className={`bg-surface rounded-[14px] border border-edge-soft shadow-design-md p-5 ${className}`.trim()}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1 min-w-0">
          <span className="text-[11px] font-semibold text-ink-mute uppercase tracking-wider">
            {label}
          </span>
          <span className="text-[26px] font-extrabold tracking-[-0.02em] tabular-nums text-ink">
            {value}
          </span>
        </div>
        {icon !== undefined && (
          <div className="w-10 h-10 rounded-[10px] bg-primary-50 flex items-center justify-center text-primary flex-shrink-0" aria-hidden="true">
            {icon}
          </div>
        )}
      </div>
      {delta !== undefined && (
        <div className={`mt-2 text-[11px] font-semibold tabular-nums ${DELTA_COLOR[delta.trend]}`}>
          <span aria-hidden="true">{DELTA_ARROW[delta.trend]}</span> {delta.value}
        </div>
      )}
    </div>
  );
}
