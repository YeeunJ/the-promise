import { useEffect, useId, useRef, useState } from 'react';
import type { CompletedStep } from '../../utils/buildCompletedSteps';

const CLOSE_ANIMATION_MS = 350;

interface StepPopupProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  onConfirm?: () => void;
  onBack?: () => void;
  onReset?: () => void;
  canConfirm?: boolean;
  confirmLabel?: string;
  backLabel?: string;
  completedSteps?: CompletedStep[];
}

function StepPopup({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  onConfirm,
  onBack,
  onReset,
  canConfirm = true,
  confirmLabel = '다음',
  backLabel = '이전',
  completedSteps,
}: StepPopupProps): JSX.Element | null {
  const [isClosing, setIsClosing] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const titleId = useId();

  useEffect(() => {
    return () => {
      if (closeTimerRef.current !== null) clearTimeout(closeTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (isOpen) {
      setIsClosing(false);
      const raf = requestAnimationFrame(() => setIsVisible(true));
      return () => cancelAnimationFrame(raf);
    }
    // isOpen이 외부에서 직접 false로 전환된 경우 (handleClose를 거치지 않은 경우)
    setIsVisible(false);
    setIsClosing(false);
  }, [isOpen]);

  function handleClose() {
    if (closeTimerRef.current !== null) clearTimeout(closeTimerRef.current);
    setIsClosing(true);
    closeTimerRef.current = setTimeout(() => {
      closeTimerRef.current = null;
      setIsVisible(false);
      setIsClosing(false);
      onClose();
    }, CLOSE_ANIMATION_MS);
  }

  function handleConfirm() {
    if (!canConfirm) return;
    onConfirm?.();
  }

  if (!isOpen && !isVisible) return null;

  const hasFooter = onConfirm !== undefined || onBack !== undefined;
  const hasCompletedSteps = completedSteps !== undefined && completedSteps.length > 0;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      className={`fixed inset-0 z-50 flex items-center justify-center ${
        isClosing ? 'animate-fade-out' : 'animate-fade-in'
      }`}
    >
      <div className="absolute inset-0 bg-black/50" onClick={handleClose} />

      <div
        className={`relative w-[70vw] h-[70vh] max-sm:w-[90vw] max-sm:h-[85vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden ${
          isClosing ? 'animate-slide-down-out' : 'animate-slide-up'
        }`}
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E7EB] flex-shrink-0">
          <div className="flex items-center gap-3">
            <h2 id={titleId} className="text-lg font-bold text-black">{title}</h2>
            {subtitle && (
              <span className="text-xs font-medium text-brand-accent bg-brand-accent/10 rounded-full px-2.5 py-0.5">
                {subtitle}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {onReset !== undefined && (
              <button
                type="button"
                onClick={onReset}
                aria-label="초기화"
                className="text-xs font-medium text-gray-400 hover:text-gray-600 px-2 py-1 rounded hover:bg-gray-100 transition-colors"
              >
                초기화
              </button>
            )}
            <button
              type="button"
              onClick={handleClose}
              aria-label="닫기"
              className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
            >
              <span aria-hidden="true">✕</span>
            </button>
          </div>
        </div>

        {/* 본문 (2컬럼) */}
        <div className="flex flex-1 min-h-0">
          {/* 좌측: 콘텐츠 + 푸터 */}
          <div className="flex flex-col flex-1 min-w-0">
            <div className="flex-1 overflow-y-auto px-6 py-5">
              {children}
            </div>

            {hasFooter && (
              <div className="px-6 py-4 border-t border-[#E5E7EB] flex-shrink-0 flex gap-3">
                {onBack !== undefined && (
                  <button
                    type="button"
                    onClick={onBack}
                    className="flex-shrink-0 rounded-xl border-2 border-[#E5E7EB] px-5 py-3 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    {backLabel}
                  </button>
                )}
                {onConfirm !== undefined && (
                  <button
                    type="button"
                    onClick={handleConfirm}
                    disabled={!canConfirm}
                    className="flex-1 rounded-xl bg-brand-primary px-4 py-3 text-base font-bold text-white transition-colors hover:bg-brand-secondary disabled:cursor-not-allowed disabled:bg-[#E5E7EB] disabled:text-gray-400"
                  >
                    {confirmLabel}
                  </button>
                )}
              </div>
            )}
          </div>

          {/* 우측: 신청현황 패널 */}
          {hasCompletedSteps && (
            <div className="hidden sm:flex flex-col w-56 flex-shrink-0 border-l border-[#E5E7EB] bg-gray-50 px-4 py-5">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">신청현황</p>
              <div className="space-y-3">
                {completedSteps!.map((s) => (
                  <div key={s.label} className="flex flex-col gap-0.5">
                    <span className="text-xs text-brand-accent font-medium">{s.label}</span>
                    <span className="text-sm text-black font-semibold break-words">{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default StepPopup;
