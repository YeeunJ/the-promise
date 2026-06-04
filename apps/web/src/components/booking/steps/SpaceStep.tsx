import { useRef } from 'react';
import type { Space, TimeSlotValue } from '../../../types';
import type { SpaceSelection } from '../../../types/booking';
import { SpaceSelector } from '../../SpaceSelector';
import { useSpaceAvailability } from '../../../hooks/useSpaceAvailability';

interface SpaceStepProps {
  value: SpaceSelection | null;
  onChange: (selection: SpaceSelection) => void;
  timeSlot: TimeSlotValue | null;
}

function spaceToSelection(space: Space): SpaceSelection {
  return {
    id: space.id,
    buildingName: space.building.name,
    floor: space.floor,
    spaceName: space.name,
  };
}

export function SpaceStep({ value, onChange, timeSlot }: SpaceStepProps): JSX.Element {
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const { availabilityMap, isLoading } = useSpaceAvailability(timeSlot);

  function handleSpaceSelect(space: Space): void {
    onChangeRef.current(spaceToSelection(space));
  }

  return (
    <section className="rounded-[18px] border border-edge-soft bg-surface p-6">
      <div className="mb-4 text-[11px] font-bold uppercase tracking-[0.08em] text-accent">
        공간 선택
      </div>
      <SpaceSelector
        value={value?.id ?? null}
        onChange={() => {
          /* selection id is managed via onSpaceSelect */
        }}
        onSpaceSelect={handleSpaceSelect}
        availabilityMap={availabilityMap}
        availabilityLoading={isLoading}
      />
    </section>
  );
}
