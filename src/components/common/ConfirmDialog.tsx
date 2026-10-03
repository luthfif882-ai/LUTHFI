import React from 'react';
import { Modal } from './Modal';
import { AlertTriangle } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  confirmLabel?: string;
  cancelText?: string;
  isDangerous?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText,
  confirmLabel,
  cancelText = 'Batal',
  isDangerous = true
}) => {
  const resolvedConfirmText = confirmLabel || confirmText || 'Hapus';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="sm">
      <div className="flex flex-col items-center text-center py-2">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${
          isDangerous ? 'bg-red-100 text-red-600 dark:bg-red-950/60 dark:text-red-400' : 'bg-amber-100 text-amber-600'
        }`}>
          <AlertTriangle className="w-6 h-6" />
        </div>
        <p className="text-sm text-stone-600 dark:text-stone-300 leading-relaxed mb-6">
          {message}
        </p>

        <div className="flex items-center gap-3 w-full">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 text-sm font-medium hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`flex-1 px-4 py-2.5 rounded-xl text-white text-sm font-medium transition-colors shadow-sm cursor-pointer ${
              isDangerous
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-emerald-700 hover:bg-emerald-800'
            }`}
          >
            {resolvedConfirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
};
