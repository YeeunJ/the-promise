import { useState, useEffect, useCallback } from 'react';

interface CancelDialogProps {
  isOpen: boolean;
  onConfirm: (adminNote: string) => void;
  onClose: () => void;
  isLoading: boolean;
}

export function CancelDialog({ isOpen, onConfirm, onClose, isLoading }: CancelDialogProps): JSX.Element | null {
  const [adminNote, setAdminNote] = useState('');

  // isOpen이 false가 되면 textarea 초기화
  useEffect(() => {
    if (!isOpen) {
      setAdminNote('');
    }
  }, [isOpen]);

  // ESC 키 핸들러
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    },
    [onClose],
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  function handleConfirm() {
    onConfirm(adminNote);
  }

  function handleOverlayClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }

  return (
    <div
      data-testid="cancel-dialog-overlay"
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
      onClick={handleOverlayClick}
    >
      <div
        data-testid="cancel-dialog-body"
        className="bg-white rounded-xl shadow-md border border-[#E5E7EB] max-w-md w-full mx-4 p-6"
      >
        <h3 className="text-lg font-bold text-black mb-4">
          이 예약을 취소하시겠습니까?
        </h3>

        <textarea
          value={adminNote}
          onChange={(e) => setAdminNote(e.target.value)}
          placeholder="취소 사유를 입력해주세요 (선택)"
          className="w-full border border-[#E5E7EB] rounded-xl p-3 text-sm text-gray-700 resize-none focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
          rows={3}
        />

        <div className="flex justify-end gap-3 mt-4">
          <button
            type="button"
            onClick={onClose}
            className="border-2 border-[#E5E7EB] rounded-xl px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            닫기
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isLoading}
            className="bg-[#DC2626] text-white rounded-xl px-4 py-2 text-sm font-medium hover:bg-[#B91C1C] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? '처리 중...' : '취소하기'}
          </button>
        </div>
      </div>
    </div>
  );
}
