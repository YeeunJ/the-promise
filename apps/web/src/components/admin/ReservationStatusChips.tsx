import type { ReservationStatus } from '../../types';

type StatusChipValue = ReservationStatus | undefined;

interface ReservationStatusChipsProps {
  value: StatusChipValue;
  onChange: (next: StatusChipValue) => void;
}

interface ChipOption {
  value: StatusChipValue;
  label: string;
}

const CHIPS: readonly ChipOption[] = [
  { value: undefined, label: '전체' },
  { value: 'confirmed', label: '확정' },
  { value: 'pending', label: '대기' },
  { value: 'cancelled', label: '취소' },
  { value: 'rejected', label: '거절' },
];

export function ReservationStatusChips({
  value,
  onChange,
}: ReservationStatusChipsProps): JSX.Element {
  function handleClick(next: StatusChipValue): void {
    if (next === value) return;
    onChange(next);
  }

  return (
    <div
      role="group"
      aria-label="상태 필터"
      className="flex flex-wrap gap-1.5"
    >
      {CHIPS.map((chip) => {
        const isActive = chip.value === value;
        const btnClass = isActive
          ? 'bg-primary border-primary text-white font-semibold'
          : 'bg-white border-[#E5E7EB] text-gray-600 hover:bg-gray-50';
        return (
          <button
            key={chip.label}
            type="button"
            aria-pressed={isActive}
            onClick={() => handleClick(chip.value)}
            className={`rounded-full border px-3 py-1 text-xs transition-colors ${btnClass}`}
          >
            {chip.label}
          </button>
        );
      })}
    </div>
  );
}
