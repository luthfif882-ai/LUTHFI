import React from 'react';
import { Modal } from '../common/Modal';
import { ActiveTab } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { 
  Gift, 
  DollarSign, 
  Bell, 
  Camera, 
  Network, 
  MessageSquare, 
  ShieldCheck, 
  Settings 
} from 'lucide-react';

interface LainnyaDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  setActiveTab: (tab: ActiveTab) => void;
  activeTab: ActiveTab;
}

export const LainnyaDrawer: React.FC<LainnyaDrawerProps> = ({
  isOpen,
  onClose,
  setActiveTab,
  activeTab
}) => {
  const { isAdmin } = useAuth();

  const menuItems: { id: ActiveTab; label: string; icon: React.ReactNode; desc: string; adminOnly?: boolean }[] = [
    { id: 'ulang-tahun', label: 'Ulang Tahun', icon: <Gift className="w-5 h-5 text-pink-500" />, desc: 'Kalender & kirim ucapan ulang tahun' },
    { id: 'kas', label: 'Kas Kelas', icon: <DollarSign className="w-5 h-5 text-emerald-600" />, desc: 'Laporan saldo & status iuran mahasiswa' },
    { id: 'pengumuman', label: 'Pengumuman', icon: <Bell className="w-5 h-5 text-amber-500" />, desc: 'Kabar penting & info dosen' },
    { id: 'dokumentasi', label: 'Dokumentasi', icon: <Camera className="w-5 h-5 text-blue-500" />, desc: 'Galeri kenangan perkuliahan' },
    { id: 'struktur', label: 'Struktur Kelas', icon: <Network className="w-5 h-5 text-purple-500" />, desc: 'Susunan pengurus kelas SPI 1A' },
    { id: 'wall', label: 'Pesan & Kesan', icon: <MessageSquare className="w-5 h-5 text-teal-500" />, desc: 'Dinding apresiasi & kesan mahasiswa' },
    { id: 'admin-panel', label: 'Admin Dashboard', icon: <ShieldCheck className="w-5 h-5 text-emerald-600" />, desc: 'Kelola data & cadangan backup JSON', adminOnly: false },
    { id: 'pengaturan', label: 'Pengaturan & Akun', icon: <Settings className="w-5 h-5 text-stone-500" />, desc: 'Tema, identitas profil, dan sistem' },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Menu Lainnya" subtitle="Fitur lengkap kelas SPI 1A" maxWidth="md">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 py-1">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => {
              setActiveTab(item.id);
              onClose();
            }}
            className={`flex items-start gap-3.5 p-3.5 rounded-2xl text-left transition-all border ${
              activeTab === item.id
                ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800 shadow-xs'
                : 'bg-stone-50/70 dark:bg-stone-800/40 border-stone-200/80 dark:border-stone-800 hover:bg-stone-100 dark:hover:bg-stone-800'
            }`}
          >
            <div className="p-2 rounded-xl bg-white dark:bg-stone-800 shadow-xs border border-stone-100 dark:border-stone-700">
              {item.icon}
            </div>
            <div>
              <div className="text-xs sm:text-sm font-bold text-stone-900 dark:text-stone-100">
                {item.label}
              </div>
              <div className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5 line-clamp-1">
                {item.desc}
              </div>
            </div>
          </button>
        ))}
      </div>
    </Modal>
  );
};
