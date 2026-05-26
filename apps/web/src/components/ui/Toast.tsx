import type { ToastItem } from '../../hooks/useToast';

interface ToastProps {
  toasts: ToastItem[];
  onRemove: (id: string) => void;
}

const TOAST_STYLES: Record<ToastItem['type'], string> = {
  error: 'bg-[#DC2626] text-white',
  success: 'bg-[#059669] text-white',
};

export function Toast({ toasts, onRemove }: ToastProps): JSX.Element {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map(toast => (
        <div
          key={toast.id}
          data-toast-type={toast.type}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg transition-opacity duration-300 ${TOAST_STYLES[toast.type]}`}
        >
          <span className="text-sm font-medium">{toast.message}</span>
          <button
            type="button"
            onClick={() => onRemove(toast.id)}
            className="ml-2 text-white/80 hover:text-white"
            aria-label="닫기"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}
