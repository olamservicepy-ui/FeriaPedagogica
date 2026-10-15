import React from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
}

interface ToastNotificationProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastNotification: React.FC<ToastNotificationProps> = ({ toasts, onDismiss }) => {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2.5 pointer-events-none max-w-md w-full px-4">
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success';
        const isWarning = toast.type === 'warning';
        const isError = toast.type === 'error';
        const isInfo = toast.type === 'info';

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto rounded-2xl p-4 shadow-[0_15px_35px_-5px_rgba(0,0,0,0.15)] border backdrop-blur-xl flex items-start gap-3 transition-all duration-300 animate-in slide-in-from-bottom-5 fade-in ${
              isSuccess
                ? 'bg-slate-900/95 text-white border-slate-800'
                : isWarning
                ? 'bg-amber-950/95 text-white border-amber-800'
                : isError
                ? 'bg-rose-950/95 text-white border-rose-800'
                : 'bg-slate-900/95 text-white border-slate-800'
            }`}
          >
            {/* Icon */}
            <div className="shrink-0 mt-0.5">
              {isSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
              {isWarning && <AlertTriangle className="w-5 h-5 text-amber-400" />}
              {isError && <AlertCircle className="w-5 h-5 text-rose-400" />}
              {isInfo && <Info className="w-5 h-5 text-sky-400" />}
            </div>

            {/* Message */}
            <div className="flex-1 text-xs sm:text-sm font-medium leading-snug">
              {toast.message}
            </div>

            {/* Dismiss Button */}
            <button
              onClick={() => onDismiss(toast.id)}
              className="shrink-0 text-slate-400 hover:text-white transition-colors cursor-pointer p-0.5"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
