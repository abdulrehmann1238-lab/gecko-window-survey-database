import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastItem {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  durationMs?: number;
}

interface ToastContextType {
  addToast: (toast: Omit<ToastItem, 'id'>) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const addToast = useCallback((toast: Omit<ToastItem, 'id'>) => {
    const id = `toast_${Date.now()}_${Math.random()}`;
    const newToast: ToastItem = { ...toast, id };
    setToasts(prev => [newToast, ...prev].slice(0, 3));

    if (toast.type !== 'error') {
      const duration = toast.durationMs || (toast.actionLabel ? 6000 : 4000);
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      {/* Toast rendering container */}
      <div
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] flex flex-col gap-2 pointer-events-none max-w-md w-full px-4"
        role="status"
        aria-live="polite"
      >
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`pointer-events-auto bg-elevated border border-line-strong rounded-r2 p-3 shadow-sh-3 flex items-start gap-3 transition-all duration-220 text-[13px] font-ui
              ${toast.type === 'success' ? 'border-l-4 border-l-success' : ''}
              ${toast.type === 'error' ? 'border-l-4 border-l-error' : ''}
              ${toast.type === 'info' ? 'border-l-4 border-l-info' : ''}`}
          >
            {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-success shrink-0 mt-0.5" />}
            {toast.type === 'error' && <AlertCircle className="w-4 h-4 text-error shrink-0 mt-0.5" />}
            {toast.type === 'info' && <Info className="w-4 h-4 text-info shrink-0 mt-0.5" />}

            <div className="flex-1 text-ink leading-relaxed">
              {toast.message}
            </div>

            {toast.actionLabel && toast.onAction && (
              <button
                type="button"
                onClick={() => {
                  toast.onAction?.();
                  removeToast(toast.id);
                }}
                className="text-[12px] font-semibold text-primary underline ml-2 shrink-0 hover:text-primary-hover"
              >
                {toast.actionLabel}
              </button>
            )}

            <button
              type="button"
              onClick={() => removeToast(toast.id)}
              className="text-ink-3 hover:text-ink shrink-0 p-0.5"
              aria-label="Dismiss"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
