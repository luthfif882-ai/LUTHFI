import React from 'react';
import { useAuth } from '../../context/AuthContext';

export const SyncBadge: React.FC = () => {
  const { syncStatus, isOnline } = useAuth();

  if (!isOnline || syncStatus === 'offline') {
    return (
      <div 
        title="Koneksi terputus. Mode offline aktif."
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300 border border-red-200 dark:border-red-900"
      >
        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
        <span className="hidden sm:inline">Offline</span>
      </div>
    );
  }

  if (syncStatus === 'saving') {
    return (
      <div 
        title="Sedang menyinkronkan data ke cloud..."
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-900"
      >
        <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
        <span className="hidden sm:inline">Menyimpan...</span>
      </div>
    );
  }

  return (
    <div 
      title="Semua data tersinkron realtime dengan cloud"
      className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
    >
      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
      <span className="hidden sm:inline">Tersinkron</span>
    </div>
  );
};
