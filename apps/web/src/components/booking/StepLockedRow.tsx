interface StepLockedRowProps {
  stepNumber: number;
  title: string;
}

export function StepLockedRow({ stepNumber, title }: StepLockedRowProps): JSX.Element {
  return (
    <div className="flex items-center gap-3 px-5 py-4 rounded-2xl border border-dashed border-edge bg-surface-2">
      <span className="w-6 h-6 flex items-center justify-center rounded-full border border-edge text-xs font-bold text-ink-mute shrink-0">
        {stepNumber}
      </span>
      <span className="text-xs text-ink-mute uppercase tracking-widest shrink-0">
        STEP {stepNumber}
      </span>
      <span className="text-sm font-medium text-ink-mute">{title}</span>
      <svg
        className="ml-auto w-4 h-4 text-ink-mute shrink-0"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
        />
      </svg>
    </div>
  );
}
