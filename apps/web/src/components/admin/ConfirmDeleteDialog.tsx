import { useCallback, useEffect } from 'react';

interface ConfirmDeleteDialogProps {
  isOpen: boolean;
  title: string;
  description?: string;
  onConfirm: () => void | Promise<void>;
  onClose: () => void;
  isLoading: boolean;
}

export function ConfirmDeleteDialog({
  isOpen,
  title,
  description,
  onConfirm,
  onClose,
  isLoading,
}: ConfirmDeleteDialogProps): JSX.Element | null {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isLoading) {
        onClose();
      }
    },
    [onClose, isLoading],
  );

  useEffect(() => {
    if (!isOpen) return;
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  function handleOverlayClick(e: React.MouseEvent<HTMLDivElement>): void {
    if (e.target === e.currentTarget && !isLoading) {
      onClose();
    }
  }

  return (
    <div
      data-testid="confirm-delete-overlay"
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-delete-title"
    >
      <div className="bg-white rounded-xl shadow-md border border-[#E5E7EB] max-w-md w-full mx-4 p-6">
        <h3
          id="confirm-delete-title"
          className="text-lg font-bold text-black mb-2"
        >
          {title}
        </h3>
        {description !== undefined && description.length > 0 && (
          <p className="text-sm text-gray-600 mb-4">{description}</p>
        )}
        <div className="flex justify-end gap-3 mt-4">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="border-2 border-[#E5E7EB] rounded-xl px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            닫기
          </button>
          <button
            type="button"
            onClick={() => {
              void onConfirm();
            }}
            disabled={isLoading}
            className="bg-[#DC2626] text-white rounded-xl px-4 py-2 text-sm font-medium hover:bg-[#B91C1C] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? '처리 중...' : '삭제'}
          </button>
        </div>
      </div>
    </div>
  );
}
