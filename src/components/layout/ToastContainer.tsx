import React from 'react';
import { useData } from '../../context/DataContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, dismissToast } = useData();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none p-2">
      {toasts.map((toast) => {
        const icons = {
          success: <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />,
          error: <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0" />,
          warning: <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />,
          info: <Info className="w-5 h-5 text-teal-600 dark:text-teal-400 shrink-0" />
        };

        const bgBorders = {
          success: 'bg-white/95 dark:bg-stone-900/95 border-emerald-500/30 text-stone-800 dark:text-stone-100',
          error: 'bg-white/95 dark:bg-stone-900/95 border-red-500/30 text-stone-800 dark:text-stone-100',
          warning: 'bg-white/95 dark:bg-stone-900/95 border-amber-500/30 text-stone-800 dark:text-stone-100',
          info: 'bg-white/95 dark:bg-stone-900/95 border-teal-500/30 text-stone-800 dark:text-stone-100'
        };

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center justify-between gap-3 p-3.5 rounded-2xl shadow-xl border backdrop-blur-md transition-all duration-300 transform translate-y-0 ${bgBorders[toast.type]}`}
          >
            <div className="flex items-center gap-3">
              {icons[toast.type]}
              <p className="text-xs sm:text-sm font-medium leading-snug">{toast.message}</p>
            </div>
            <button
              onClick={() => dismissToast(toast.id)}
              className="p-1 rounded-lg text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 transition-colors"
              aria-label="Tutup"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
