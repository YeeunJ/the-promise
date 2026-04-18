import { useState, useEffect, useRef } from 'react';
import StepPopup from './StepPopup';
import type { CompletedStep } from '../../utils/buildCompletedSteps';
import { PURPOSE_OPTIONS } from '../../data/purposes';

interface PurposePopupProps {
  isOpen: boolean;
  onClose: () => void;
  onBack?: () => void;
  onReset?: () => void;
  value: string;
  onConfirm: (purpose: string) => void;
  completedSteps?: CompletedStep[];
}

function PurposePopup({ isOpen, onClose, onBack, onReset, value, onConfirm, completedSteps }: PurposePopupProps): JSX.Element {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [customText, setCustomText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const focusTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => { if (focusTimerRef.current !== null) clearTimeout(focusTimerRef.current); };
  }, []);

  useEffect(() => {
    if (isOpen) {
      // 기존 값에서 역으로 selectedId 복원
      const match = PURPOSE_OPTIONS.find((o) => o.label === value);
      if (match) {
        setSelectedId(match.id);
        setCustomText('');
      } else if (value) {
        setSelectedId('etc');
        setCustomText(value);
      } else {
        setSelectedId(null);
        setCustomText('');
      }
    }
    // Intentional: only re-sync on open.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  useEffect(() => {
    if (selectedId === 'etc') {
      focusTimerRef.current = setTimeout(() => {
        textareaRef.current?.focus();
        textareaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }, 200);
    }
    return () => { if (focusTimerRef.current !== null) clearTimeout(focusTimerRef.current); };
  }, [selectedId]);

  function handleCardClick(id: string) {
    setSelectedId(id);
  }

  function handleConfirmClick() {
    if (!selectedId) return;
    if (selectedId === 'etc') {
      if (customText.trim()) onConfirm(customText.trim());
    } else {
      const label = PURPOSE_OPTIONS.find((o) => o.id === selectedId)?.label ?? '';
      onConfirm(label);
    }
  }

  const canConfirm = selectedId === 'etc' ? customText.trim() !== '' : selectedId !== null;

  return (
    <StepPopup
      isOpen={isOpen}
      onClose={onClose}
      onReset={onReset}
      title="사용 목적"
      subtitle="5/5"
      onBack={onBack}
      onConfirm={handleConfirmClick}
      canConfirm={canConfirm}
      confirmLabel="완료"
      completedSteps={completedSteps}
    >
      <div>
        <p className="text-base font-semibold text-black mb-4">사용 목적을 선택해주세요</p>

        <div className="grid grid-cols-3 gap-2">
          {PURPOSE_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => handleCardClick(opt.id)}
              className={`rounded-xl border-2 px-2 py-3 flex flex-col items-center gap-2 text-center transition-all duration-150 ${
                selectedId === opt.id
                  ? 'border-brand-primary bg-brand-primary/10 text-brand-primary'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-brand-primary/40 hover:bg-brand-primary/5'
              }`}
            >
              <span className="text-xl" aria-hidden="true">{opt.icon}</span>
              <span className="text-sm font-medium">{opt.label}</span>
            </button>
          ))}
        </div>

        {/* 기타 선택 시 직접 입력 */}
        <div
          className={`transition-all duration-200 ease-out overflow-hidden ${
            selectedId === 'etc' ? 'max-h-40 opacity-100 mt-4' : 'max-h-0 opacity-0 pointer-events-none'
          }`}
        >
          <textarea
            ref={textareaRef}
            rows={3}
            value={customText}
            onChange={(e) => setCustomText(e.target.value)}
            placeholder="직접 입력해주세요..."
            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary resize-none"
          />
        </div>

      </div>
    </StepPopup>
  );
}

export default PurposePopup;
