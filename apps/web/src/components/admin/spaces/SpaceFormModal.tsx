import { useCallback, useEffect, useState } from 'react';
import type {
  AdminBuilding,
  AdminSpace,
  AdminSpaceWritePayload,
} from '../../../types';

interface SpaceFormModalProps {
  isOpen: boolean;
  mode: 'create' | 'edit';
  entity: AdminSpace | null;
  buildings: AdminBuilding[];
  isSubmitting: boolean;
  errorMessage: string | null;
  onSubmit: (payload: AdminSpaceWritePayload) => Promise<void>;
  onClose: () => void;
}

interface FormState {
  buildingId: string;
  name: string;
  floor: string;
  capacity: string;
  description: string;
}

function initialFromEntity(entity: AdminSpace | null): FormState {
  if (entity === null) {
    return { buildingId: '', name: '', floor: '', capacity: '', description: '' };
  }
  return {
    buildingId: String(entity.building.id),
    name: entity.name,
    floor: entity.floor === null ? '' : String(entity.floor),
    capacity: entity.capacity === null ? '' : String(entity.capacity),
    description: entity.description ?? '',
  };
}

function parseOptionalNumber(value: string): number | null {
  const trimmed = value.trim();
  if (trimmed.length === 0) return null;
  const num = Number(trimmed);
  return Number.isFinite(num) ? num : null;
}

export function SpaceFormModal({
  isOpen,
  mode,
  entity,
  buildings,
  isSubmitting,
  errorMessage,
  onSubmit,
  onClose,
}: SpaceFormModalProps): JSX.Element | null {
  const [form, setForm] = useState<FormState>(() => initialFromEntity(entity));

  useEffect(() => {
    if (isOpen) {
      setForm(initialFromEntity(entity));
    }
  }, [isOpen, entity]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isSubmitting) {
        onClose();
      }
    },
    [onClose, isSubmitting],
  );

  useEffect(() => {
    if (!isOpen) return;
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  const trimmedName = form.name.trim();
  const trimmedDesc = form.description.trim();
  const isValid = form.buildingId.length > 0 && trimmedName.length > 0;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    if (!isValid || isSubmitting) return;
    const payload: AdminSpaceWritePayload = {
      building: Number(form.buildingId),
      name: trimmedName,
      floor: parseOptionalNumber(form.floor),
      capacity: parseOptionalNumber(form.capacity),
      description: trimmedDesc.length > 0 ? trimmedDesc : null,
    };
    await onSubmit(payload);
  }

  function handleOverlayClick(e: React.MouseEvent<HTMLDivElement>): void {
    if (e.target === e.currentTarget && !isSubmitting) {
      onClose();
    }
  }

  return (
    <div
      data-testid="space-form-overlay"
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="space-form-title"
    >
      <form
        onSubmit={(e) => void handleSubmit(e)}
        className="bg-white rounded-xl shadow-md border border-[#E5E7EB] max-w-md w-full mx-4 p-6"
      >
        <h3
          id="space-form-title"
          className="text-lg font-bold text-black mb-4"
        >
          {mode === 'create' ? '공간 추가' : '공간 수정'}
        </h3>

        {errorMessage !== null && (
          <div
            role="alert"
            className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-3 py-2 mb-4"
          >
            {errorMessage}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label
              htmlFor="space-building"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              건물 <span className="text-red-500">*</span>
            </label>
            <select
              id="space-building"
              value={form.buildingId}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, buildingId: e.target.value }))
              }
              disabled={isSubmitting}
              required
              className="w-full border border-[#E5E7EB] rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/30 disabled:bg-gray-50"
            >
              <option value="">선택하세요</option>
              {buildings.map((b) => (
                <option key={b.id} value={String(b.id)}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="space-name"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              공간명 <span className="text-red-500">*</span>
            </label>
            <input
              id="space-name"
              type="text"
              value={form.name}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, name: e.target.value }))
              }
              disabled={isSubmitting}
              required
              className="w-full border border-[#E5E7EB] rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/30 disabled:bg-gray-50"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="space-floor"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                층
              </label>
              <input
                id="space-floor"
                type="number"
                value={form.floor}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, floor: e.target.value }))
                }
                disabled={isSubmitting}
                className="w-full border border-[#E5E7EB] rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/30 disabled:bg-gray-50"
              />
            </div>
            <div>
              <label
                htmlFor="space-capacity"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                정원
              </label>
              <input
                id="space-capacity"
                type="number"
                min={0}
                value={form.capacity}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, capacity: e.target.value }))
                }
                disabled={isSubmitting}
                className="w-full border border-[#E5E7EB] rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/30 disabled:bg-gray-50"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="space-description"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              설명
            </label>
            <textarea
              id="space-description"
              value={form.description}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, description: e.target.value }))
              }
              disabled={isSubmitting}
              rows={3}
              className="w-full border border-[#E5E7EB] rounded-xl px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-brand-primary/30 disabled:bg-gray-50"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="border-2 border-[#E5E7EB] rounded-xl px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            닫기
          </button>
          <button
            type="submit"
            disabled={!isValid || isSubmitting}
            className="bg-brand-primary text-white rounded-xl px-4 py-2 text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? '저장 중...' : mode === 'create' ? '추가' : '저장'}
          </button>
        </div>
      </form>
    </div>
  );
}
