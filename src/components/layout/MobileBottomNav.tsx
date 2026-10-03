import React from 'react';
import { ActiveTab } from '../../types';
import { Home, Calendar, Users, CheckSquare, MoreHorizontal } from 'lucide-react';

interface MobileBottomNavProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  openLainnyaDrawer: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  setActiveTab,
  openLainnyaDrawer
}) => {
  const isMainTab = ['beranda', 'jadwal', 'mahasiswa', 'tugas'].includes(activeTab);

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-stone-900/95 backdrop-blur-lg border-t border-stone-200/80 dark:border-stone-800/80 pb-safe">
      <div className="grid grid-cols-5 h-16 items-center px-1">
        <button
          onClick={() => setActiveTab('beranda')}
          className={`flex flex-col items-center justify-center h-full transition-colors ${
            activeTab === 'beranda'
              ? 'text-emerald-700 dark:text-emerald-400 font-bold'
              : 'text-stone-400 dark:text-stone-400 hover:text-stone-700'
          }`}
        >
          <Home className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight">Beranda</span>
        </button>

        <button
          onClick={() => setActiveTab('jadwal')}
          className={`flex flex-col items-center justify-center h-full transition-colors ${
            activeTab === 'jadwal'
              ? 'text-emerald-700 dark:text-emerald-400 font-bold'
              : 'text-stone-400 dark:text-stone-400 hover:text-stone-700'
          }`}
        >
          <Calendar className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight">Jadwal</span>
        </button>

        <button
          onClick={() => setActiveTab('mahasiswa')}
          className={`flex flex-col items-center justify-center h-full transition-colors ${
            activeTab === 'mahasiswa'
              ? 'text-emerald-700 dark:text-emerald-400 font-bold'
              : 'text-stone-400 dark:text-stone-400 hover:text-stone-700'
          }`}
        >
          <Users className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight">Mahasiswa</span>
        </button>

        <button
          onClick={() => setActiveTab('tugas')}
          className={`flex flex-col items-center justify-center h-full transition-colors ${
            activeTab === 'tugas'
              ? 'text-emerald-700 dark:text-emerald-400 font-bold'
              : 'text-stone-400 dark:text-stone-400 hover:text-stone-700'
          }`}
        >
          <CheckSquare className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight">Tugas</span>
        </button>

        <button
          onClick={openLainnyaDrawer}
          className={`flex flex-col items-center justify-center h-full transition-colors ${
            !isMainTab
              ? 'text-emerald-700 dark:text-emerald-400 font-bold'
              : 'text-stone-400 dark:text-stone-400 hover:text-stone-700'
          }`}
        >
          <MoreHorizontal className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight">Lainnya</span>
        </button>
      </div>
    </div>
  );
};
