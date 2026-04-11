import { useEffect, useState } from 'react';
import type { Space } from '../../types';
import StepPopup from './StepPopup';
import type { CompletedStep } from '../../utils/buildCompletedSteps';
import { SpaceSelector } from '../SpaceSelector';

export interface SpaceSelection {
  id: number;
  buildingName: string;
  floor: number | null;
  spaceName: string;
}

interface SpacePopupProps {
  isOpen: boolean;
  onClose: () => void;
  onBack?: () => void;
  onReset?: () => void;
  value: number | null;
  previousSelection: SpaceSelection | null;
  onSelected: (selection: SpaceSelection) => void;
  completedSteps?: CompletedStep[];
}

function SpacePopup({ isOpen, onClose, onBack, onReset, value, previousSelection, onSelected, completedSteps }: SpacePopupProps): JSX.Element {
  const [selectedSpaceId, setSelectedSpaceId] = useState<number | null>(value);
  const [pendingSpace, setPendingSpace] = useState<Space | null>(null);

  useEffect(() => {
    if (isOpen) {
      setSelectedSpaceId(value);
      setPendingSpace(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  function handleSpaceSelect(space: Space) {
    setSelectedSpaceId(space.id);
    setPendingSpace(space);
  }

  function handleConfirm() {
    if (pendingSpace) {
      onSelected({
        id: pendingSpace.id,
        buildingName: pendingSpace.building.name,
        floor: pendingSpace.floor,
        spaceName: pendingSpace.name,
      });
    } else if (previousSelection) {
      // 재편집 시 변경 없이 기존 값으로 진행
      onSelected(previousSelection);
    }
  }

  const canConfirm = pendingSpace !== null || previousSelection !== null;

  return (
    <StepPopup
      isOpen={isOpen}
      onClose={onClose}
      onReset={onReset}
      title="장소 선택"
      subtitle="2/5"
      onBack={onBack}
      onConfirm={handleConfirm}
      canConfirm={canConfirm}
      confirmLabel="다음"
      completedSteps={completedSteps}
    >
      <SpaceSelector
        value={selectedSpaceId}
        onChange={setSelectedSpaceId}
        onSpaceSelect={handleSpaceSelect}
      />
    </StepPopup>
  );
}

export default SpacePopup;
