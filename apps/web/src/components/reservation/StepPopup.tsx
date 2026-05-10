import { useEffect, useId, useRef, useState } from 'react';
import type { CompletedStep } from '../../utils/buildCompletedSteps';

const CLOSE_ANIMATION_MS = 350;
const TOTAL_STEPS = 5;

interface StepPopupProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  onConfirm?: () => void;
  onBack?: () => void;
  onReset?: () => void;
  canConfirm?: boolean;
  confirmLabel?: string;
  backLabel?: string;
  completedSteps?: CompletedStep[];
  globalStep?: number;
  maxStep?: number;
  stepLabels?: string[];
  onStepNavigate?: (step: number) => void;
}

function StepPopup({
  isOpen,
  onClose,
  title,
  children,
  onConfirm,
  onBack,
  onReset,
  canConfirm = true,
  confirmLabel = '다음',
  backLabel = '이전',
  completedSteps,
  globalStep,
  maxStep,
  stepLabels,
  onStepNavigate,
}: StepPopupProps): JSX.Element | null {
  const [isClosing, setIsClosing] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
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
      setShowCancelConfirm(false);
      const raf = requestAnimationFrame(() => setIsVisible(true));
      return () => cancelAnimationFrame(raf);
    }
    setIsVisible(false);
    setIsClosing(false);
    setShowCancelConfirm(false);
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

  function handleCancelRequest() {
    setShowCancelConfirm(true);
  }

  function handleCancelConfirm() {
    setShowCancelConfirm(false);
    onReset?.();
  }

  function handleCancelAbort() {
    setShowCancelConfirm(false);
  }

  if (!isOpen && !isVisible) return null;

  const hasFooter = onConfirm !== undefined || onBack !== undefined;
  const hasCompletedSteps = completedSteps !== undefined && completedSteps.length > 0;
  const hasStepIndicator = globalStep !== undefined && maxStep !== undefined && stepLabels !== undefined;

  const visibleSteps = hasStepIndicator ? Array.from({ length: maxStep! }, (_, i) => i + 1) : [];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      className={`fixed inset-0 z-50 flex items-center justify-center ${
        isClosing ? 'animate-fade-out' : 'animate-fade-in'
      }`}
    >
      <div className="absolute inset-0 bg-black/50" />

      <div
        className={`relative w-[70vw] h-[70vh] max-sm:w-[90vw] max-sm:h-[85vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden ${
          isClosing ? 'animate-slide-down-out' : 'animate-slide-up'
        }`}
      >
        {/* 헤더 */}
        <div className="flex flex-col px-6 pt-4 border-b border-[#E5E7EB] flex-shrink-0">
          <div className="flex items-center justify-between pb-3">
            <div className="flex items-center gap-3">
              <h2 id={titleId} className="text-lg font-bold text-black">{title}</h2>
              {globalStep !== undefined && (
                <span className="text-xs font-medium text-brand-accent bg-brand-accent/10 rounded-full px-2.5 py-0.5">
                  {globalStep}/{TOTAL_STEPS}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {onReset !== undefined && !showCancelConfirm && (
                <button
                  type="button"
                  onClick={handleCancelRequest}
                  aria-label="예약 취소하기"
                  className="text-xs font-medium text-gray-400 hover:text-red-500 px-2 py-1 rounded hover:bg-red-50 transition-colors"
                >
                  예약 취소하기
                </button>
              )}
              {showCancelConfirm && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-600">예약을 취소하시겠습니까?</span>
                  <button
                    type="button"
                    onClick={handleCancelConfirm}
                    className="text-xs font-semibold text-white bg-red-500 hover:bg-red-600 px-2.5 py-1 rounded transition-colors"
                  >
                    확인
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelAbort}
                    className="text-xs font-medium text-gray-500 hover:text-gray-700 px-2 py-1 rounded hover:bg-gray-100 transition-colors"
                  >
                    아니오
                  </button>
                </div>
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

          {/* 단계 화살표 인디케이터 */}
          {hasStepIndicator && visibleSteps.length > 0 && (
            <div className="flex items-center pb-3 overflow-x-auto">
              {visibleSteps.map((step, idx) => {
                const isActive = step === globalStep;
                const isVisited = step < globalStep!;
                const isClickable = step < globalStep! && onStepNavigate !== undefined;
                const label = stepLabels![step - 1] ?? `단계 ${step}`;

                return (
                  <div key={step} className="flex items-center flex-shrink-0">
                    {idx > 0 && (
                      <div className="w-3 h-full flex items-center justify-center text-gray-300 text-xs mx-0.5">
                        ›
                      </div>
                    )}
                    <button
                      type="button"
                      disabled={!isClickable}
                      onClick={() => isClickable && onStepNavigate!(step)}
                      className={`
                        relative flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full transition-colors
                        ${isActive
                          ? 'bg-brand-primary text-white'
                          : isVisited
                          ? 'bg-brand-primary/10 text-brand-primary hover:bg-brand-primary/20 cursor-pointer'
                          : 'bg-gray-100 text-gray-400 cursor-default'
                        }
                      `}
                    >
                      <span className={`
                        w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0
                        ${isActive ? 'bg-white/20 text-white' : isVisited ? 'bg-brand-primary text-white' : 'bg-gray-300 text-white'}
                      `}>
                        {step}
                      </span>
                      <span className="whitespace-nowrap max-sm:hidden">{label}</span>
                    </button>
                  </div>
                );
              })}
            </div>
          )}
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
