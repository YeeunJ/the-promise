import type { ReactNode } from 'react';

interface SectionHeaderProps {
  title: string;
  subtitle?: ReactNode;
  actions?: ReactNode;
}

export function SectionHeader({
  title,
  subtitle,
  actions,
}: SectionHeaderProps): JSX.Element {
  return (
    <div className="flex items-start justify-between gap-4 mb-5">
      <div className="flex items-stretch gap-3 min-w-0">
        {/* 좌측 primary 컬러바 액센트 */}
        <span
          aria-hidden="true"
          className="w-1 rounded-full bg-primary shrink-0 self-stretch"
        />
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-black leading-tight truncate">
            {title}
          </h1>
          {subtitle !== undefined && subtitle !== null && (
            <div
              data-testid="section-header-subtitle"
              className="text-sm text-gray-500 mt-1"
            >
              {subtitle}
            </div>
          )}
        </div>
      </div>
      {actions !== undefined && actions !== null && (
        <div className="flex items-center gap-2 shrink-0">{actions}</div>
      )}
    </div>
  );
}
