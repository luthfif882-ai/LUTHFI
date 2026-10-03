import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { ActiveTab } from '../../types';
import { SyncBadge } from '../common/SyncBadge';
import { EditProfileModal } from '../profile/EditProfileModal';
import { 
  Home, 
  Calendar, 
  Users, 
  CheckSquare, 
  MoreHorizontal, 
  Sun, 
  Moon, 
  ShieldCheck, 
  User, 
  LogOut, 
  LogIn, 
  Gift, 
  DollarSign, 
  Bell, 
  Camera, 
  Network, 
  MessageSquare, 
  Settings,
  ChevronDown
} from 'lucide-react';
import { Avatar } from '../common/Avatar';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  openLoginModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, openLoginModal }) => {
  const { userProfile, isAdmin, logout, theme, toggleTheme } = useAuth();
  const { classSettings } = useData();
  const [isLainnyaOpen, setIsLainnyaOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);

  const mainNavItems: { id: ActiveTab; label: string; icon: React.ReactNode }[] = [
    { id: 'beranda', label: 'Beranda', icon: <Home className="w-4 h-4" /> },
    { id: 'jadwal', label: 'Jadwal', icon: <Calendar className="w-4 h-4" /> },
    { id: 'mahasiswa', label: 'Mahasiswa', icon: <Users className="w-4 h-4" /> },
    { id: 'tugas', label: 'Tugas', icon: <CheckSquare className="w-4 h-4" /> },
  ];

  const secondaryNavItems: { id: ActiveTab; label: string; icon: React.ReactNode; desc: string }[] = [
    { id: 'ulang-tahun', label: 'Ulang Tahun', icon: <Gift className="w-4 h-4 text-pink-500" />, desc: 'Kalender & ucapan ultah' },
    { id: 'kas', label: 'Kas Kelas', icon: <DollarSign className="w-4 h-4 text-emerald-500" />, desc: 'Laporan & iuran mahasiswa' },
    { id: 'pengumuman', label: 'Pengumuman', icon: <Bell className="w-4 h-4 text-amber-500" />, desc: 'Kabar penting perkuliahan' },
    { id: 'dokumentasi', label: 'Dokumentasi', icon: <Camera className="w-4 h-4 text-blue-500" />, desc: 'Foto kenangan angkatan' },
    { id: 'struktur', label: 'Struktur Kelas', icon: <Network className="w-4 h-4 text-purple-500" />, desc: 'Pengurus harian kelas' },
    { id: 'wall', label: 'Pesan & Kesan', icon: <MessageSquare className="w-4 h-4 text-teal-500" />, desc: 'Dinding apresiasi kelas' },
    { id: 'admin-panel', label: 'Admin Dashboard', icon: <ShieldCheck className="w-4 h-4 text-emerald-600" />, desc: 'Kelola data & cadangan' },
    { id: 'pengaturan', label: 'Pengaturan', icon: <Settings className="w-4 h-4 text-stone-500" />, desc: 'Preferensi & akun' },
  ];

  const handleSelectLainnya = (tab: ActiveTab) => {
    setActiveTab(tab);
    setIsLainnyaOpen(false);
  };

  const isSecondaryActive = secondaryNavItems.some((item) => item.id === activeTab);

  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-stone-900/90 backdrop-blur-md border-b border-stone-200/80 dark:border-stone-800/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Brand Logo & Class Title */}
          <div 
            onClick={() => setActiveTab('beranda')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-br from-emerald-800 to-emerald-950 text-amber-300 flex items-center justify-center font-serif-title font-bold text-lg sm:text-xl shadow-md border border-amber-400/30 group-hover:scale-105 transition-transform">
              SPI
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif-title text-base sm:text-lg font-bold text-stone-900 dark:text-stone-100 tracking-tight">
                  {classSettings.className || 'SPI 1A'}
                </span>
                <span className="px-2 py-0.5 text-[10px] font-semibold tracking-wider rounded-md bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300/40 uppercase">
                  {classSettings.semester || 'Sem. 1'}
                </span>
              </div>
              <p className="text-[11px] text-stone-500 dark:text-stone-400 truncate max-w-[170px] sm:max-w-xs">
                {classSettings.campus || 'UIN Raden Mas Said Surakarta'}
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 bg-stone-100/70 dark:bg-stone-800/60 p-1.5 rounded-2xl border border-stone-200/60 dark:border-stone-700/60">
            {mainNavItems.map((item) => {
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                    active
                      ? 'bg-emerald-800 text-white shadow-xs font-semibold'
                      : 'text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white hover:bg-stone-200/50 dark:hover:bg-stone-700/50'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              );
            })}

            {/* Lainnya Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsLainnyaOpen(!isLainnyaOpen)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                  isSecondaryActive
                    ? 'bg-emerald-800 text-white shadow-xs font-semibold'
                    : 'text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white hover:bg-stone-200/50 dark:hover:bg-stone-700/50'
                }`}
              >
                <MoreHorizontal className="w-4 h-4" />
                <span>Lainnya</span>
                <ChevronDown className="w-3.5 h-3.5 opacity-70" />
              </button>

              {isLainnyaOpen && (
                <>
                  <div
                    className="fixed inset-0 z-30"
                    onClick={() => setIsLainnyaOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white dark:bg-stone-900 shadow-2xl border border-stone-200 dark:border-stone-800 py-2 z-40 animate-fadeIn">
                    <div className="px-3 py-1.5 text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                      Fitur Kelas
                    </div>
                    {secondaryNavItems.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => handleSelectLainnya(item.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2 text-left text-xs transition-colors ${
                          activeTab === item.id
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-semibold'
                            : 'text-stone-700 dark:text-stone-200 hover:bg-stone-50 dark:hover:bg-stone-800/60'
                        }`}
                      >
                        <div className="p-1.5 rounded-lg bg-stone-100 dark:bg-stone-800">
                          {item.icon}
                        </div>
                        <div>
                          <div className="font-medium">{item.label}</div>
                          <div className="text-[10px] text-stone-400 font-normal">{item.desc}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </nav>

          {/* Right Action Icons: Sync status, Theme switch, Profile / Login */}
          <div className="flex items-center gap-2 sm:gap-3">
            <SyncBadge />

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
              title={theme === 'dark' ? 'Ganti ke Mode Terang' : 'Ganti ke Mode Gelap'}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-stone-600" />
              )}
            </button>

            {/* User Profile / Login */}
            {userProfile ? (
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-2xl hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                >
                  <Avatar name={userProfile.name} photoUrl={userProfile.photoUrl} size="sm" shape="circle" />
                  <span className="hidden lg:inline text-xs font-medium text-stone-800 dark:text-stone-200 max-w-[100px] truncate">
                    {userProfile.name.split(' ')[0]}
                  </span>
                  {isAdmin && (
                    <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-300/50">
                      <ShieldCheck className="w-3 h-3 text-emerald-600" /> Admin
                    </span>
                  )}
                  <ChevronDown className="w-3.5 h-3.5 text-stone-400 hidden sm:block" />
                </button>

                {isProfileOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-30"
                      onClick={() => setIsProfileOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-stone-900 shadow-2xl border border-stone-200 dark:border-stone-800 py-2 z-40 animate-fadeIn">
                      <div className="px-4 py-2 border-b border-stone-100 dark:border-stone-800">
                        <p className="text-xs font-semibold text-stone-900 dark:text-stone-100 truncate">
                          {userProfile.name}
                        </p>
                        <p className="text-[11px] text-stone-400 truncate">{userProfile.email}</p>
                        <span className="inline-block mt-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 uppercase">
                          Role: {userProfile.role}
                        </span>
                      </div>

                      <button
                        onClick={() => {
                          setIsEditProfileOpen(true);
                          setIsProfileOpen(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-stone-800 dark:text-stone-100 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors font-semibold"
                      >
                        <Camera className="w-4 h-4 text-emerald-600" />
                        <span>Edit Foto & Ulang Tahun</span>
                      </button>

                      <button
                        onClick={() => {
                          setActiveTab('pengaturan');
                          setIsProfileOpen(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-stone-700 dark:text-stone-200 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
                      >
                        <User className="w-4 h-4 text-stone-400" />
                        <span>Profil & Pengaturan</span>
                      </button>

                      {isAdmin && (
                        <button
                          onClick={() => {
                            setActiveTab('admin-panel');
                            setIsProfileOpen(false);
                          }}
                          className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-emerald-700 dark:text-emerald-400 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors font-medium"
                        >
                          <ShieldCheck className="w-4 h-4 text-emerald-600" />
                          <span>Admin Dashboard</span>
                        </button>
                      )}

                      <div className="border-t border-stone-100 dark:border-stone-800 my-1" />

                      <button
                        onClick={() => {
                          logout();
                          setIsProfileOpen(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Keluar (Logout)</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <button
                onClick={openLoginModal}
                className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs sm:text-sm font-semibold shadow-sm transition-all"
              >
                <LogIn className="w-4 h-4" />
                <span>Masuk</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
      />
    </header>
  );
};
