import { useCallback, useEffect, useState } from 'react';
import type { AdminBuilding, AdminBuildingWritePayload } from '../../../types';

interface BuildingFormModalProps {
  isOpen: boolean;
  mode: 'create' | 'edit';
  entity: AdminBuilding | null;
  isSubmitting: boolean;
  errorMessage: string | null;
  onSubmit: (payload: AdminBuildingWritePayload) => Promise<void>;
  onClose: () => void;
}

interface FormState {
  name: string;
  description: string;
}

function initialFromEntity(entity: AdminBuilding | null): FormState {
  if (entity === null) {
    return { name: '', description: '' };
  }
  return {
    name: entity.name,
    description: entity.description ?? '',
  };
}

export function BuildingFormModal({
  isOpen,
  mode,
  entity,
  isSubmitting,
  errorMessage,
  onSubmit,
  onClose,
}: BuildingFormModalProps): JSX.Element | null {
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
  const isValid = trimmedName.length > 0;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    if (!isValid || isSubmitting) return;
    const payload: AdminBuildingWritePayload = {
      name: trimmedName,
      description: trimmedDesc.length > 0 ? trimmedDesc : null,
    };
    await onSubmit(payload);
  }

  return (
    <div
      data-testid="building-form-overlay"
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="building-form-title"
    >
      <form
        onSubmit={(e) => void handleSubmit(e)}
        className="bg-white rounded-xl shadow-md border border-[#E5E7EB] max-w-md w-full mx-4 p-6"
      >
        <h3
          id="building-form-title"
          className="text-lg font-bold text-black mb-4"
        >
          {mode === 'create' ? '건물 추가' : '건물 수정'}
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
              htmlFor="building-name"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              건물명 <span className="text-red-500">*</span>
            </label>
            <input
              id="building-name"
              type="text"
              value={form.name}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, name: e.target.value }))
              }
              disabled={isSubmitting}
              required
              className="w-full border border-[#E5E7EB] rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:bg-gray-50"
            />
          </div>

          <div>
            <label
              htmlFor="building-description"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              설명
            </label>
            <textarea
              id="building-description"
              value={form.description}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, description: e.target.value }))
              }
              disabled={isSubmitting}
              rows={3}
              className="w-full border border-[#E5E7EB] rounded-xl px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:bg-gray-50"
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
            className="bg-primary text-white rounded-xl px-4 py-2 text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? '저장 중...' : mode === 'create' ? '추가' : '저장'}
          </button>
        </div>
      </form>
    </div>
  );
}
