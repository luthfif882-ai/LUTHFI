import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { useAuth } from '../../context/AuthContext';
import { LogIn, ShieldCheck, UserCheck, Sparkles } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const { loginWithGoogle, loginQuickDemo } = useAuth();
  const [loading, setLoading] = useState(false);
  const [customName, setCustomName] = useState('');

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      await loginWithGoogle();
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (role: 'admin' | 'member', name?: string) => {
    try {
      setLoading(true);
      await loginQuickDemo(role, name);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Masuk ke SPI 1A" subtitle="Akses portal akademik resmi kelas" maxWidth="md">
      <div className="space-y-5">
        {/* Google Real Authentication */}
        <div>
          <button
            type="button"
            disabled={loading}
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-2xl bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-stone-800 dark:text-stone-100 font-semibold text-sm hover:bg-stone-50 dark:hover:bg-stone-700/80 transition-all shadow-xs"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
            <span>Masuk dengan Akun Google</span>
          </button>
          <p className="text-[11px] text-stone-400 text-center mt-2">
            Akun terdaftar sebagai Admin otomatis mendapat hak akses pengurus kelas.
          </p>
        </div>

        <div className="relative flex items-center justify-center">
          <div className="border-t border-stone-200 dark:border-stone-800 w-full" />
          <span className="bg-white dark:bg-stone-900 px-3 text-[11px] uppercase tracking-wider text-stone-400 font-semibold absolute">
            Atau Masuk Cepat
          </span>
        </div>

        {/* Quick Role Selection for Instant Testing */}
        <div className="space-y-2.5">
          <button
            type="button"
            disabled={loading}
            onClick={() => handleQuickLogin('admin', 'Luthfi Fadhil (Admin)')}
            className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 hover:bg-emerald-100/70 transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-700 text-white flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-emerald-950 dark:text-emerald-100">
                  Masuk sebagai Admin / Pengurus
                </p>
                <p className="text-[11px] text-emerald-700/80 dark:text-emerald-300">
                  Akses penuh: kelola jadwal, tugas, mahasiswa, kas & dokumentasi
                </p>
              </div>
            </div>
            <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">Pilih →</span>
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={() => handleQuickLogin('member', 'Shafi Hanifah (Mahasiswa)')}
            className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 hover:bg-stone-100/80 transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-stone-700 text-white flex items-center justify-center">
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-stone-900 dark:text-stone-100">
                  Masuk sebagai Mahasiswa (Member)
                </p>
                <p className="text-[11px] text-stone-500 dark:text-stone-400">
                  Lihat jadwal, status tugas, kirim ucapan ultah & pesan kelas
                </p>
              </div>
            </div>
            <span className="text-[11px] font-semibold text-stone-500">Pilih →</span>
          </button>
        </div>

        {/* Custom Name Login */}
        <div className="pt-2">
          <label className="block text-xs font-semibold text-stone-600 dark:text-stone-300 mb-1.5">
            Ingin masuk dengan nama Anda sendiri?
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Contoh: Ritfiq Pradanu"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              className="flex-1 px-3.5 py-2.5 rounded-xl text-xs bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
            />
            <button
              type="button"
              disabled={loading || !customName.trim()}
              onClick={() => handleQuickLogin('member', customName)}
              className="px-4 py-2.5 rounded-xl bg-emerald-800 disabled:opacity-50 text-white text-xs font-bold hover:bg-emerald-900 transition-colors"
            >
              Masuk
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
