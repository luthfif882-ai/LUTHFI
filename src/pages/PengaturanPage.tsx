import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { Avatar } from '../components/common/Avatar';
import { compressAndCropSquare, uploadImageToStorage } from '../utils/imageCompressor';
import { 
  Settings, 
  User, 
  Sun, 
  Moon, 
  ShieldCheck, 
  LogOut, 
  LogIn, 
  Info, 
  Check, 
  Database,
  Wifi,
  Sparkles,
  Camera,
  Calendar,
  Sliders,
  DollarSign,
  Upload,
  Trash2
} from 'lucide-react';

interface PengaturanPageProps {
  openLoginModal: () => void;
}

export const PengaturanPage: React.FC<PengaturanPageProps> = ({ openLoginModal }) => {
  const { 
    userProfile, 
    isAdmin, 
    logout, 
    theme, 
    toggleTheme, 
    updateMyProfile,
    isOnline,
    syncStatus 
  } = useAuth();

  const { classSettings, updateClassSettings } = useData();

  // Profile Form State
  const [editName, setEditName] = useState(userProfile?.name || '');
  const [editNim, setEditNim] = useState(userProfile?.nim || '');
  const [editBirthDate, setEditBirthDate] = useState(userProfile?.birthDate || '');
  const [editPhotoUrl, setEditPhotoUrl] = useState(userProfile?.photoUrl || '');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [savedProfileSuccess, setSavedProfileSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (userProfile) {
      setEditName(userProfile.name || '');
      setEditNim(userProfile.nim || '');
      setEditBirthDate(userProfile.birthDate || '');
      setEditPhotoUrl(userProfile.photoUrl || '');
    }
  }, [userProfile]);

  // Class Settings Form State (Admin)
  const [settingsForm, setSettingsForm] = useState(classSettings);
  const [savedSettingsSuccess, setSavedSettingsSuccess] = useState(false);

  useEffect(() => {
    setSettingsForm(classSettings);
  }, [classSettings]);

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingPhoto(true);
      const compressedBlob = await compressAndCropSquare(file, 300, 0.7);
      const path = `avatars/user_${userProfile?.uid || 'guest'}_${Date.now()}.jpg`;
      const url = await uploadImageToStorage(compressedBlob, path);
      setEditPhotoUrl(url);
      await updateMyProfile({ photoUrl: url });
      setSavedProfileSuccess(true);
      setTimeout(() => setSavedProfileSuccess(false), 3000);
    } catch (err) {
      console.error('Profile photo upload error:', err);
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleRemovePhoto = async () => {
    setEditPhotoUrl('');
    await updateMyProfile({ photoUrl: '' });
    setSavedProfileSuccess(true);
    setTimeout(() => setSavedProfileSuccess(false), 3000);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim()) return;

    await updateMyProfile({
      name: editName.trim(),
      nim: editNim.trim() || undefined,
      birthDate: editBirthDate || undefined,
      photoUrl: editPhotoUrl || undefined
    });
    setSavedProfileSuccess(true);
    setTimeout(() => setSavedProfileSuccess(false), 3000);
  };

  const handleSaveClassSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateClassSettings(settingsForm);
    setSavedSettingsSuccess(true);
    setTimeout(() => setSavedSettingsSuccess(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8 animate-fadeIn pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold font-serif-title text-stone-900 dark:text-stone-100 flex items-center gap-2.5">
          <Settings className="w-7 h-7 text-stone-500" />
          <span>Pengaturan & Akun</span>
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1">
          Kelola profil pengguna, tanggal lahir, foto profil, dan konfigurasi kelas
        </p>
      </div>

      {/* User Profile Card */}
      <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 shadow-sm border border-stone-200 dark:border-stone-800 space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
          <h2 className="text-base font-bold font-serif-title text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <User className="w-4 h-4 text-emerald-600" />
            <span>Profil Pengguna & Tanggal Lahir</span>
          </h2>
          {userProfile && (
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 uppercase">
              Role: {userProfile.role}
            </span>
          )}
        </div>

        {userProfile ? (
          <form onSubmit={handleSaveProfile} className="space-y-5">
            {/* Avatar & Photo Editor */}
            <div className="flex flex-col sm:flex-row items-center gap-5 p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200/80 dark:border-stone-700/80">
              <div className="relative group">
                <Avatar
                  name={editName || userProfile.name}
                  photoUrl={editPhotoUrl}
                  size="xl"
                  shape="square"
                  className="shadow-md"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 bg-stone-950/40 rounded-2xl flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Ganti foto profil"
                >
                  <Camera className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-1.5 text-center sm:text-left flex-1">
                <span className="text-xs font-bold text-stone-800 dark:text-stone-200 block">
                  Foto Profil Pengguna
                </span>
                <p className="text-[11px] text-stone-400 max-w-sm">
                  Format gambar akan otomatis dipotong 1:1, resize 300x300 piksel, dan dikompresi agar hemat kuota.
                </p>

                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handlePhotoSelect}
                    className="hidden"
                  />
                  <button
                    type="button"
                    disabled={uploadingPhoto}
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3.5 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{uploadingPhoto ? 'Mengunggah...' : 'Ganti Foto Profil'}</span>
                  </button>
                  {editPhotoUrl && (
                    <button
                      type="button"
                      onClick={handleRemovePhoto}
                      className="px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:text-red-600 text-xs font-semibold transition-colors flex items-center gap-1.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Hapus Foto</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Profile Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                  Nama Tampilan *
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                  Nomor Induk Mahasiswa (NIM)
                </label>
                <input
                  type="text"
                  placeholder="2661310004"
                  value={editNim}
                  onChange={(e) => setEditNim(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-pink-500" />
                  <span>Hari & Tanggal Ulang Tahun</span>
                </label>
                <input
                  type="date"
                  value={editBirthDate}
                  onChange={(e) => setEditBirthDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100"
                />
                <p className="text-[10px] text-stone-400 mt-1">
                  Ulang tahunmu akan tampil di kalender kelas dan mendapatkan ucapan milad dari kawan sekelas.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                  Email Akun
                </label>
                <input
                  type="email"
                  disabled
                  value={userProfile.email}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-stone-100 dark:bg-stone-800/40 border border-stone-200 dark:border-stone-700 text-stone-500 cursor-not-allowed"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                {savedProfileSuccess && '✓ Profil dan foto berhasil diperbarui!'}
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold shadow-md transition-colors"
                >
                  Simpan Profil
                </button>
                <button
                  type="button"
                  onClick={logout}
                  className="px-4 py-2.5 rounded-xl border border-red-200 text-red-600 text-xs font-semibold hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors flex items-center gap-1.5"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Keluar</span>
                </button>
              </div>
            </div>
          </form>
        ) : (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700">
            <div>
              <p className="text-xs sm:text-sm font-bold text-stone-800 dark:text-stone-200">
                Anda belum masuk ke akun kelas
              </p>
              <p className="text-xs text-stone-400 mt-0.5">
                Masuk untuk mengubah foto profil, mengatur tanggal ulang tahun, atau mengelola kelas.
              </p>
            </div>
            <button
              onClick={openLoginModal}
              className="px-4 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold shadow-xs transition-colors shrink-0"
            >
              Masuk Sekarang
            </button>
          </div>
        )}
      </div>

      {/* Class Settings Card (Pengaturan Tanggal Kas, Iuran, dan Identitas Kelas) */}
      <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 shadow-sm border border-stone-200 dark:border-stone-800 space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
          <div>
            <h2 className="text-base font-bold font-serif-title text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-amber-500" />
              <span>Pengaturan Kelas & Keuangan Kas</span>
            </h2>
            <p className="text-xs text-stone-400 mt-0.5">
              Atur tanggal kas, jatuh tempo bulanan, besaran iuran, dan identitas kelas
            </p>
          </div>
          {isAdmin ? (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
              Admin Edit Mode
            </span>
          ) : (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-500">
              Hanya Baca (Member)
            </span>
          )}
        </div>

        <form onSubmit={handleSaveClassSettings} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                Nama Kelas
              </label>
              <input
                type="text"
                disabled={!isAdmin}
                value={settingsForm.className}
                onChange={(e) => setSettingsForm({ ...settingsForm, className: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 disabled:opacity-75"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                Program Studi
              </label>
              <input
                type="text"
                disabled={!isAdmin}
                value={settingsForm.department}
                onChange={(e) => setSettingsForm({ ...settingsForm, department: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 disabled:opacity-75"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                Semester Perkuliahan
              </label>
              <input
                type="text"
                disabled={!isAdmin}
                value={settingsForm.semester}
                onChange={(e) => setSettingsForm({ ...settingsForm, semester: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 disabled:opacity-75"
              />
            </div>

            {/* Tanggal Kas & Nominal Pengaturan */}
            <div>
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1 flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                <span>Besaran Iuran Kas Bulanan (Rp)</span>
              </label>
              <input
                type="number"
                min="0"
                step="1000"
                disabled={!isAdmin}
                value={settingsForm.defaultMonthlyFee}
                onChange={(e) => setSettingsForm({ ...settingsForm, defaultMonthlyFee: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 disabled:opacity-75 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-amber-500" />
                <span>Tanggal Jatuh Tempo Kas Setiap Bulan</span>
              </label>
              <input
                type="number"
                min="1"
                max="31"
                disabled={!isAdmin}
                value={settingsForm.paymentDueDay}
                onChange={(e) => setSettingsForm({ ...settingsForm, paymentDueDay: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 disabled:opacity-75"
              />
              <span className="text-[10px] text-stone-400 mt-1 block">
                Contoh: Tanggal {settingsForm.paymentDueDay} setiap bulan
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                Periode Kas Aktif Saat Ini
              </label>
              <input
                type="text"
                disabled={!isAdmin}
                value={settingsForm.activePeriod}
                onChange={(e) => setSettingsForm({ ...settingsForm, activePeriod: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 disabled:opacity-75"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
              Semboyan & Komitmen Kelas
            </label>
            <textarea
              rows={2}
              disabled={!isAdmin}
              value={settingsForm.motto}
              onChange={(e) => setSettingsForm({ ...settingsForm, motto: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 disabled:opacity-75"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
              Narahubung & Kontak Kelas
            </label>
            <input
              type="text"
              disabled={!isAdmin}
              value={settingsForm.contactPerson}
              onChange={(e) => setSettingsForm({ ...settingsForm, contactPerson: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 disabled:opacity-75"
            />
          </div>

          {isAdmin && (
            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                {savedSettingsSuccess && '✓ Pengaturan kelas berhasil disimpan ke cloud!'}
              </span>

              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold shadow-md transition-colors"
              >
                Simpan Pengaturan Kelas
              </button>
            </div>
          )}
        </form>
      </div>

      {/* Theme Preference Card */}
      <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 shadow-sm border border-stone-200 dark:border-stone-800 flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold font-serif-title text-stone-900 dark:text-stone-100">
            Tema Tampilan
          </h2>
          <p className="text-xs text-stone-400 mt-0.5">
            Pilih antara mode terang (Light) atau mode gelap (Dark)
          </p>
        </div>

        <button
          onClick={toggleTheme}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs font-bold text-stone-800 dark:text-stone-200 hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors"
        >
          {theme === 'dark' ? (
            <>
              <Sun className="w-4 h-4 text-amber-400" />
              <span>Mode Terang</span>
            </>
          ) : (
            <>
              <Moon className="w-4 h-4 text-stone-600" />
              <span>Mode Gelap</span>
            </>
          )}
        </button>
      </div>

      {/* System Status & Cloud Backend Details */}
      <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 shadow-sm border border-stone-200 dark:border-stone-800 space-y-3">
        <h2 className="text-base font-bold font-serif-title text-stone-900 dark:text-stone-100 flex items-center gap-2">
          <Database className="w-4 h-4 text-emerald-600" />
          <span>Status Sistem & Backend Firebase</span>
        </h2>

        <div className="divide-y divide-stone-100 dark:divide-stone-800 text-xs">
          <div className="py-2.5 flex items-center justify-between">
            <span className="text-stone-500">Database Utama:</span>
            <span className="font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>Google Cloud Firestore (Enterprise)</span>
            </span>
          </div>
          <div className="py-2.5 flex items-center justify-between">
            <span className="text-stone-500">Sinkronisasi Realtime:</span>
            <span className="font-semibold text-emerald-700 dark:text-emerald-400">
              onSnapshot Listener Aktif
            </span>
          </div>
          <div className="py-2.5 flex items-center justify-between">
            <span className="text-stone-500">Konektivitas Jaringan:</span>
            <span className={`font-semibold ${isOnline ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-600'}`}>
              {isOnline ? '🟢 Terhubung Online' : '🔴 Mode Offline'}
            </span>
          </div>
          <div className="py-2.5 flex items-center justify-between">
            <span className="text-stone-500">Status Sinkron:</span>
            <span className="font-semibold uppercase tracking-wider text-[11px] text-stone-700 dark:text-stone-300">
              {syncStatus}
            </span>
          </div>
        </div>
      </div>

      {/* About Application */}
      <div className="p-6 rounded-3xl bg-stone-100/70 dark:bg-stone-800/40 border border-stone-200 dark:border-stone-800 text-center space-y-2">
        <div className="w-10 h-10 rounded-2xl bg-emerald-800 text-amber-300 flex items-center justify-center font-serif-title font-bold text-lg mx-auto shadow-sm">
          SPI
        </div>
        <h3 className="font-serif-title font-bold text-sm text-stone-900 dark:text-stone-100">
          Aplikasi Resmi Kelas {classSettings.className}
        </h3>
        <p className="text-xs text-stone-500 dark:text-stone-400 max-w-md mx-auto leading-relaxed">
          Program Studi {classSettings.department} • {classSettings.semester} • {classSettings.campus}.
        </p>
        <p className="text-[10px] text-stone-400 pt-1">
          Dibuat dengan ❤️ untuk kebersamaan dan kemudahan akademik angkatan 2026.
        </p>
      </div>
    </div>
  );
};
