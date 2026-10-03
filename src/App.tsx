/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import { ActiveTab } from './types';
import { Navbar } from './components/layout/Navbar';
import { MobileBottomNav } from './components/layout/MobileBottomNav';
import { LainnyaDrawer } from './components/layout/LainnyaDrawer';
import { ToastContainer } from './components/layout/ToastContainer';
import { LoginModal } from './components/auth/LoginModal';

// Pages
import { BerandaPage } from './pages/BerandaPage';
import { JadwalPage } from './pages/JadwalPage';
import { MahasiswaPage } from './pages/MahasiswaPage';
import { TugasPage } from './pages/TugasPage';
import { UlangTahunPage } from './pages/UlangTahunPage';
import { KasPage } from './pages/KasPage';
import { PengumumanPage } from './pages/PengumumanPage';
import { DokumentasiPage } from './pages/DokumentasiPage';
import { StrukturPage } from './pages/StrukturPage';
import { WallPage } from './pages/WallPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { PengaturanPage } from './pages/PengaturanPage';

const AppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('beranda');
  const [isLainnyaOpen, setIsLainnyaOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const renderActivePage = () => {
    switch (activeTab) {
      case 'beranda':
        return <BerandaPage setActiveTab={setActiveTab} />;
      case 'jadwal':
        return <JadwalPage />;
      case 'mahasiswa':
        return <MahasiswaPage />;
      case 'tugas':
        return <TugasPage />;
      case 'ulang-tahun':
        return <UlangTahunPage />;
      case 'kas':
        return <KasPage />;
      case 'pengumuman':
        return <PengumumanPage />;
      case 'dokumentasi':
        return <DokumentasiPage />;
      case 'struktur':
        return <StrukturPage />;
      case 'wall':
        return <WallPage />;
      case 'admin-panel':
        return <AdminDashboardPage setActiveTab={setActiveTab} />;
      case 'pengaturan':
        return <PengaturanPage openLoginModal={() => setIsLoginModalOpen(true)} />;
      default:
        return <BerandaPage setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 flex flex-col font-sans transition-colors duration-200">
      {/* Toast Notification Container */}
      <ToastContainer />

      {/* Top Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        openLoginModal={() => setIsLoginModalOpen(true)}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 mb-16 md:mb-6">
        {renderActivePage()}
      </main>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        openLainnyaDrawer={() => setIsLainnyaOpen(true)}
      />

      {/* Mobile Lainnya Drawer Modal */}
      <LainnyaDrawer
        isOpen={isLainnyaOpen}
        onClose={() => setIsLainnyaOpen(false)}
        setActiveTab={setActiveTab}
        activeTab={activeTab}
      />

      {/* Authentication / Login Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />

      {/* Footer on Desktop */}
      <footer className="hidden md:block py-6 border-t border-stone-200/60 dark:border-stone-800/60 text-center text-xs text-stone-400">
        <p>
          SPI 1A • Program Studi Sejarah Peradaban Islam • Semester 1 • UIN Raden Mas Said Surakarta
        </p>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <AppContent />
      </DataProvider>
    </AuthProvider>
  );
}
