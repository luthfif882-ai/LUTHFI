import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { ActiveTab } from '../types';
import { validateBackupJSON } from '../utils/backupExport';
import { 
  ShieldCheck, 
  Users, 
  CheckSquare, 
  Bell, 
  DollarSign, 
  Camera, 
  Download, 
  Upload, 
  Database, 
  RefreshCw, 
  AlertTriangle,
  FileCheck
} from 'lucide-react';

interface AdminDashboardPageProps {
  setActiveTab: (tab: ActiveTab) => void;
}

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({ setActiveTab }) => {
  const { isAdmin, userProfile } = useAuth();
  const { 
    students, 
    schedules, 
    assignments, 
    announcements, 
    transactions, 
    payments, 
    memories, 
    exportAllData, 
    importBackup,
    seedInitialDataIfEmpty 
  } = useData();

  const [importing, setImporting] = useState(false);
  const [importStatus, setImportStatus] = useState<{ msg: string; isError: boolean } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Financial calculations
  const totalIncome = transactions.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const totalExpense = transactions.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const balance = totalIncome - totalExpense;
  const unpaidCount = payments.filter((p) => !p.isPaid).length;
  const activeAssignmentsCount = assignments.filter((a) => a.status !== 'Selesai').length;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setImporting(true);
      setImportStatus(null);
      const text = await file.text();
      const parsed = JSON.parse(text);
      const validation = validateBackupJSON(parsed);

      if (!validation.valid || !validation.data) {
        setImportStatus({ msg: validation.error || 'Format JSON tidak valid.', isError: true });
        return;
      }

      const res = await importBackup(validation.data);
      if (res.success) {
        setImportStatus({ msg: 'Cadangan berhasil dipulihkan secara online ke Firestore!', isError: false });
      } else {
        setImportStatus({ msg: res.message, isError: true });
      }
    } catch (err) {
      setImportStatus({ msg: 'Gagal memproses file JSON: ' + String(err), isError: true });
    } finally {
      setImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif-title text-stone-900 dark:text-stone-100 flex items-center gap-2.5">
            <ShieldCheck className="w-7 h-7 text-emerald-600" />
            <span>Panel Administrator SPI 1A</span>
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1">
            Pusat manajemen data, backup sistem, dan rekapitulasi kelas
          </p>
        </div>

        {!isAdmin && (
          <div className="px-3 py-1.5 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-xs font-semibold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>Mode Tamu / Member: Fitur modifikasi dibatasi</span>
          </div>
        )}
      </div>

      {/* KPI Overview Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <div 
          onClick={() => setActiveTab('mahasiswa')}
          className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs cursor-pointer hover:border-emerald-600 transition-colors"
        >
          <div className="flex items-center gap-2 text-stone-400 text-xs">
            <Users className="w-4 h-4 text-emerald-600" />
            <span>Mahasiswa</span>
          </div>
          <div className="text-xl sm:text-2xl font-bold font-serif-title text-stone-900 dark:text-stone-100 mt-2">
            {students.length}
          </div>
          <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold">Lihat direktori →</span>
        </div>

        <div 
          onClick={() => setActiveTab('tugas')}
          className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs cursor-pointer hover:border-amber-600 transition-colors"
        >
          <div className="flex items-center gap-2 text-stone-400 text-xs">
            <CheckSquare className="w-4 h-4 text-amber-500" />
            <span>Tugas Aktif</span>
          </div>
          <div className="text-xl sm:text-2xl font-bold font-serif-title text-stone-900 dark:text-stone-100 mt-2">
            {activeAssignmentsCount}
          </div>
          <span className="text-[10px] text-amber-700 dark:text-amber-400 font-semibold">Tenggat terdekat →</span>
        </div>

        <div 
          onClick={() => setActiveTab('pengumuman')}
          className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs cursor-pointer hover:border-blue-600 transition-colors"
        >
          <div className="flex items-center gap-2 text-stone-400 text-xs">
            <Bell className="w-4 h-4 text-blue-500" />
            <span>Pengumuman</span>
          </div>
          <div className="text-xl sm:text-2xl font-bold font-serif-title text-stone-900 dark:text-stone-100 mt-2">
            {announcements.length}
          </div>
          <span className="text-[10px] text-blue-700 dark:text-blue-400 font-semibold">Semua kabar →</span>
        </div>

        <div 
          onClick={() => setActiveTab('kas')}
          className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs cursor-pointer hover:border-emerald-600 transition-colors"
        >
          <div className="flex items-center gap-2 text-stone-400 text-xs">
            <DollarSign className="w-4 h-4 text-emerald-600" />
            <span>Saldo Kas</span>
          </div>
          <div className="text-sm sm:text-base font-bold font-serif-title text-stone-900 dark:text-stone-100 mt-2 truncate">
            Rp {balance.toLocaleString('id-ID')}
          </div>
          <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold">Buku kas →</span>
        </div>

        <div 
          onClick={() => setActiveTab('kas')}
          className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs cursor-pointer hover:border-rose-600 transition-colors"
        >
          <div className="flex items-center gap-2 text-stone-400 text-xs">
            <Users className="w-4 h-4 text-rose-500" />
            <span>Belum Bayar</span>
          </div>
          <div className="text-xl sm:text-2xl font-bold font-serif-title text-rose-600 dark:text-rose-400 mt-2">
            {unpaidCount}
          </div>
          <span className="text-[10px] text-rose-700 dark:text-rose-400 font-semibold">Tagihan kas →</span>
        </div>

        <div 
          onClick={() => setActiveTab('dokumentasi')}
          className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs cursor-pointer hover:border-purple-600 transition-colors"
        >
          <div className="flex items-center gap-2 text-stone-400 text-xs">
            <Camera className="w-4 h-4 text-purple-500" />
            <span>Dokumentasi</span>
          </div>
          <div className="text-xl sm:text-2xl font-bold font-serif-title text-stone-900 dark:text-stone-100 mt-2">
            {memories.length}
          </div>
          <span className="text-[10px] text-purple-700 dark:text-purple-400 font-semibold">Galeri foto →</span>
        </div>
      </div>

      {/* Backup & Restore Management (Requirement 21) */}
      <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 shadow-sm border border-stone-200 dark:border-stone-800 space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold font-serif-title text-stone-900 dark:text-stone-100">
              Cadangan & Pemulihan Data (JSON Backup)
            </h2>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Ekspor seluruh data kelas SPI 1A untuk arsip atau impor kembali ke database
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          {/* Export Button */}
          <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200/80 dark:border-stone-700 flex flex-col justify-between">
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-stone-900 dark:text-stone-100">
                Ekspor Data Kelas
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                Unduh file cadangan berformat JSON berisi data mahasiswa, jadwal, tugas, pengumuman, kas, dan struktur kelas.
              </p>
            </div>
            <button
              onClick={exportAllData}
              className="mt-4 px-4 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>Unduh Cadangan JSON</span>
            </button>
          </div>

          {/* Import Button */}
          <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200/80 dark:border-stone-700 flex flex-col justify-between">
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-stone-900 dark:text-stone-100">
                Pulihkan dari File JSON
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                Unggah file JSON cadangan. Sistem akan memvalidasi struktur data sebelum memperbarui database.
              </p>
            </div>

            <div className="mt-4">
              <input
                type="file"
                ref={fileInputRef}
                accept=".json,application/json"
                onChange={handleFileChange}
                className="hidden"
              />
              <button
                type="button"
                disabled={importing || !isAdmin}
                onClick={() => fileInputRef.current?.click()}
                className="w-full px-4 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-900 text-white text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Upload className="w-4 h-4" />
                <span>{importing ? 'Memvalidasi & Memulihkan...' : 'Pilih File JSON untuk Dipulihkan'}</span>
              </button>
            </div>
          </div>
        </div>

        {importStatus && (
          <div
            className={`p-3 rounded-2xl text-xs flex items-center gap-2 ${
              importStatus.isError
                ? 'bg-red-50 text-red-700 border border-red-200'
                : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
            }`}
          >
            <FileCheck className="w-4 h-4 shrink-0" />
            <span>{importStatus.msg}</span>
          </div>
        )}
      </div>

      {/* Database Reseeding Option */}
      <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 shadow-sm border border-stone-200 dark:border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-bold text-stone-900 dark:text-stone-100">
            Inisialisasi Data Master SPI 1A
          </h2>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
            Pastikan 23 mahasiswa dan 10 mata kuliah terisi jika database masih kosong.
          </p>
        </div>
        <button
          onClick={() => seedInitialDataIfEmpty()}
          className="px-4 py-2 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-stone-700 dark:text-stone-200 text-xs font-semibold flex items-center gap-2 transition-colors shrink-0"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Sinkronkan Data Awal</span>
        </button>
      </div>
    </div>
  );
};
