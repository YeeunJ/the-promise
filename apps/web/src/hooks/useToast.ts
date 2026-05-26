import { useCallback, useEffect, useRef, useState } from 'react';

export interface ToastItem {
  id: string;
  message: string;
  type: 'error' | 'success';
}

const MAX_TOASTS = 3;
const AUTO_DISMISS_MS = 3000;

export interface UseToastReturn {
  toasts: ToastItem[];
  showToast: (message: string, type?: 'error' | 'success') => void;
  removeToast: (id: string) => void;
}

export function useToast(): UseToastReturn {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
  }, []);

  const showToast = useCallback(
    (message: string, type: 'error' | 'success' = 'error') => {
      const id = Date.now().toString() + Math.random().toString(36).slice(2);
      const newToast: ToastItem = { id, message, type };

      setToasts(prev => {
        const next = [...prev, newToast];
        if (next.length > MAX_TOASTS) {
          const removed = next[0];
          const timer = timersRef.current.get(removed.id);
          if (timer) {
            clearTimeout(timer);
            timersRef.current.delete(removed.id);
          }
          return next.slice(1);
        }
        return next;
      });

      const timer = setTimeout(() => {
        removeToast(id);
      }, AUTO_DISMISS_MS);
      timersRef.current.set(id, timer);
    },
    [removeToast],
  );

  useEffect(() => {
    const currentTimers = timersRef.current;
    return () => {
      for (const timer of currentTimers.values()) {
        clearTimeout(timer);
      }
      currentTimers.clear();
    };
  }, []);

  return { toasts, showToast, removeToast };
}
