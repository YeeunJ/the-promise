interface SegmentedControlOption<T extends string> {
  value: T;
  label: string;
}

interface SegmentedControlProps<T extends string> {
  value: T;
  options: readonly SegmentedControlOption<T>[];
  onChange: (next: T) => void;
  ariaLabel: string;
  disabled?: boolean;
}

export function SegmentedControl<T extends string>({
  value,
  options,
  onChange,
  ariaLabel,
  disabled = false,
}: SegmentedControlProps<T>): JSX.Element {
  function handleClick(next: T): void {
    if (next === value) return;
    onChange(next);
  }

  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className="inline-flex items-center gap-1 rounded-xl border border-[#E5E7EB] bg-gray-50 p-1"
    >
      {options.map((opt) => {
        const isActive = opt.value === value;
        const btnClass = isActive
          ? 'bg-white text-primary shadow-sm font-semibold'
          : 'text-gray-600 hover:text-black';
        return (
          <button
            key={opt.value}
            type="button"
            aria-pressed={isActive}
            disabled={disabled}
            onClick={() => handleClick(opt.value)}
            className={`px-3 py-1.5 text-sm rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${btnClass}`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
