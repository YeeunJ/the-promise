import type { ReactNode } from 'react';

interface BookingLayoutProps {
  header: ReactNode;
  sidebar?: ReactNode;
  bottomBar?: ReactNode;
  children: ReactNode;
}

export function BookingLayout({
  header,
  sidebar,
  bottomBar,
  children,
}: BookingLayoutProps): JSX.Element {
  return (
    <div className="flex h-full flex-col bg-canvas">
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-[1180px] px-10 py-10">
          {header}
          <div className="flex gap-6">
            <div className="min-w-0 flex-1">{children}</div>
            {sidebar !== undefined && <div className="flex-none">{sidebar}</div>}
          </div>
        </div>
      </div>
      {bottomBar !== undefined && <div className="flex-none">{bottomBar}</div>}
    </div>
  );
}
