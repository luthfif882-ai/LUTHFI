import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { ActiveTab, Schedule, Assignment } from '../types';
import confetti from 'canvas-confetti';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  BookOpen, 
  Bell, 
  CheckSquare, 
  DollarSign, 
  Gift, 
  ArrowRight, 
  Sparkles,
  ChevronRight,
  AlertCircle
} from 'lucide-react';
import { Avatar } from '../components/common/Avatar';

interface BerandaPageProps {
  setActiveTab: (tab: ActiveTab) => void;
}

export const BerandaPage: React.FC<BerandaPageProps> = ({ setActiveTab }) => {
  const { userProfile } = useAuth();
  const { students, schedules, announcements, assignments, transactions, payments, classSettings } = useData();

  // Greeting by current time
  const [greeting, setGreeting] = useState('Pagi! 👋');
  const [currentTimeStr, setCurrentTimeStr] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hour = now.getHours();
      if (hour >= 4 && hour < 11) setGreeting('Pagi! 👋');
      else if (hour >= 11 && hour < 15) setGreeting('Siang! 👋');
      else if (hour >= 15 && hour < 18) setGreeting('Sore! 👋');
      else setGreeting('Malam! 👋');

      setCurrentTimeStr(now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  // Determine current day in Indonesian
  const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const todayDayName = dayNames[new Date().getDay()];

  // Today's schedule
  const todayClasses = schedules
    .filter((s) => s.day === todayDayName)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  // Find next upcoming schedule (either today after current hour or next scheduled day)
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  let nextClass: Schedule | null = null;
  for (const c of todayClasses) {
    const [h, m] = c.startTime.split(':').map(Number);
    if (h * 60 + m > currentMinutes) {
      nextClass = c;
      break;
    }
  }

  // If none remaining today, grab earliest class in schedules
  if (!nextClass && schedules.length > 0) {
    nextClass = schedules[0];
  }

  // Calculate countdown to next class
  const [countdownText, setCountdownText] = useState('');
  useEffect(() => {
    if (!nextClass) return;
    const calcCountdown = () => {
      const nowDate = new Date();
      const [h, m] = nextClass!.startTime.split(':').map(Number);
      const target = new Date();
      target.setHours(h, m, 0, 0);

      const diff = target.getTime() - nowDate.getTime();
      if (diff > 0) {
        const hoursLeft = Math.floor(diff / (1000 * 60 * 60));
        const minsLeft = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        setCountdownText(`${hoursLeft} jam ${minsLeft} menit lagi`);
      } else {
        setCountdownText('Sedang / akan segera berlangsung');
      }
    };
    calcCountdown();
    const timer = setInterval(calcCountdown, 60000);
    return () => clearInterval(timer);
  }, [nextClass]);

  // Birthday check: matches today (MM-DD)
  const currentMonthDay = `${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const birthdayStudentsToday = students.filter((s) => {
    if (!s.birthDate) return false;
    return s.birthDate.slice(5) === currentMonthDay;
  });

  // Lightweight confetti if there is someone celebrating birthday today
  useEffect(() => {
    if (birthdayStudentsToday.length > 0) {
      try {
        confetti({
          particleCount: 40,
          spread: 60,
          origin: { y: 0.7 }
        });
      } catch (e) {
        // ignore
      }
    }
  }, [birthdayStudentsToday.length]);

  // Nearest assignment (pending / in progress)
  const activeAssignments = assignments
    .filter((a) => a.status !== 'Selesai')
    .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
  const nearestAssignment = activeAssignments[0];

  // Cash statistics
  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + (t.amount || 0), 0);
  const totalExpense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + (t.amount || 0), 0);
  const balance = totalIncome - totalExpense;
  const unpaidCount = payments.filter((p) => !p.isPaid).length;

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn pb-12">
      
      {/* Hero Banner with Islamic Aesthetic */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-950 text-white p-6 sm:p-8 shadow-xl border border-emerald-700/40">
        <div className="absolute inset-0 bg-islamic-pattern opacity-15 pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/60 text-amber-300 text-xs font-semibold border border-amber-400/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Portal Resmi Kelas {classSettings.className}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-serif-title text-amber-50">
              {greeting} {userProfile?.name ? userProfile.name.split(' ')[0] : 'Sobat SPI'}
            </h1>
            <p className="text-emerald-100/90 text-xs sm:text-sm max-w-xl leading-relaxed">
              Program Studi <span className="font-semibold text-amber-200">{classSettings.department}</span> • {classSettings.semester} • {classSettings.faculty} • <span className="text-emerald-200">{classSettings.campus}</span>
            </p>
          </div>

          <div className="flex items-center gap-4 bg-emerald-950/40 backdrop-blur-xs p-4 rounded-2xl border border-emerald-600/30 self-start md:self-auto">
            <div className="text-right">
              <div className="text-xs text-emerald-200 font-medium">Hari ini</div>
              <div className="text-lg font-bold text-amber-300 font-serif-title">
                {todayDayName}
              </div>
              <div className="text-[11px] text-emerald-300/80">{currentTimeStr} WIB</div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-400/20 text-amber-300 flex items-center justify-center font-bold">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Birthday Banner if any student has birthday today */}
      {birthdayStudentsToday.length > 0 && (
        <div className="rounded-3xl bg-gradient-to-r from-pink-500/15 via-rose-500/10 to-amber-500/15 dark:from-pink-950/40 dark:to-amber-950/40 border border-pink-400/40 dark:border-pink-800 p-5 shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-pink-500 text-white flex items-center justify-center shadow-md animate-bounce">
              <Gift className="w-6 h-6" />
            </div>
            <div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-pink-100 text-pink-700 dark:bg-pink-900/60 dark:text-pink-300">
                Milad Hari Ini! 🎂
              </span>
              <h2 className="text-base sm:text-lg font-bold text-stone-900 dark:text-stone-100 mt-1">
                {birthdayStudentsToday.map((s) => s.name).join(', ')}
              </h2>
              <p className="text-xs text-stone-600 dark:text-stone-300">
                Barakallah fii umrik! Kirimkan doa dan ucapan terbaik untuk teman sekelas.
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('ulang-tahun')}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-pink-600 hover:bg-pink-700 text-white text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-2"
          >
            <span>Kirim Ucapan</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Grid Overview: Jadwal Terdekat, Tugas Terdekat, Kas Kelas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        
        {/* Card 1: Jadwal Terdekat */}
        <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 shadow-sm border border-stone-200 dark:border-stone-800 flex flex-col justify-between hover:border-emerald-500/40 transition-colors">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                  <Clock className="w-4 h-4" />
                </div>
                <h2 className="text-sm font-bold text-stone-800 dark:text-stone-200">
                  Jadwal Kuliah
                </h2>
              </div>
              <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-200/50 dark:border-emerald-800">
                {nextClass ? nextClass.day : 'Hari Ini'}
              </span>
            </div>

            {nextClass ? (
              <div className="mt-4 space-y-3">
                <div>
                  <h3 className="text-base sm:text-lg font-bold font-serif-title text-stone-900 dark:text-stone-100 line-clamp-1">
                    {nextClass.courseName}
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400 flex items-center gap-1.5 mt-1">
                    <User className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{nextClass.lecturer}</span>
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs bg-stone-50 dark:bg-stone-800/60 p-3 rounded-2xl">
                  <div className="flex items-center gap-1.5 text-stone-600 dark:text-stone-300">
                    <Clock className="w-3.5 h-3.5 text-stone-400" />
                    <span>{nextClass.startTime} - {nextClass.endTime}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-stone-600 dark:text-stone-300">
                    <MapPin className="w-3.5 h-3.5 text-amber-500" />
                    <span className="font-semibold text-emerald-700 dark:text-emerald-400">{nextClass.room}</span>
                  </div>
                </div>

                {countdownText && (
                  <div className="text-[11px] text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 px-3 py-1.5 rounded-xl border border-amber-200/60 dark:border-amber-900/60 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{countdownText}</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-8 text-center text-stone-400 text-xs">
                Belum ada jadwal perkuliahan.
              </div>
            )}
          </div>

          <button
            onClick={() => setActiveTab('jadwal')}
            className="mt-5 w-full flex items-center justify-between text-xs font-semibold text-emerald-800 dark:text-emerald-300 hover:text-emerald-950 pt-3 border-t border-stone-100 dark:border-stone-800"
          >
            <span>Buka Jadwal Lengkap</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Card 2: Tugas Terdekat */}
        <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 shadow-sm border border-stone-200 dark:border-stone-800 flex flex-col justify-between hover:border-amber-500/40 transition-colors">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300">
                  <CheckSquare className="w-4 h-4" />
                </div>
                <h2 className="text-sm font-bold text-stone-800 dark:text-stone-200">
                  Tugas Terdekat
                </h2>
              </div>
              <span className="text-[11px] font-semibold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2.5 py-1 rounded-full border border-amber-200/50 dark:border-amber-800">
                {activeAssignments.length} Tugas Aktif
              </span>
            </div>

            {nearestAssignment ? (
              <div className="mt-4 space-y-3">
                <div>
                  <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                    {nearestAssignment.subject}
                  </span>
                  <h3 className="text-base sm:text-lg font-bold font-serif-title text-stone-900 dark:text-stone-100 line-clamp-1 mt-0.5">
                    {nearestAssignment.title}
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400 line-clamp-2 mt-1">
                    {nearestAssignment.description || 'Tidak ada catatan tambahan.'}
                  </p>
                </div>

                <div className="flex items-center justify-between text-xs bg-stone-50 dark:bg-stone-800/60 p-3 rounded-2xl">
                  <div className="flex items-center gap-1.5 text-stone-600 dark:text-stone-300">
                    <Calendar className="w-3.5 h-3.5 text-stone-400" />
                    <span>
                      Deadline: {new Date(nearestAssignment.deadline).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                    {nearestAssignment.status}
                  </span>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-stone-400 text-xs">
                Belum ada tugas nih. Santai dulu! ☕
              </div>
            )}
          </div>

          <button
            onClick={() => setActiveTab('tugas')}
            className="mt-5 w-full flex items-center justify-between text-xs font-semibold text-amber-700 dark:text-amber-400 hover:text-amber-800 pt-3 border-t border-stone-100 dark:border-stone-800"
          >
            <span>Semua Tugas Kuliah</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Card 3: Kas Kelas Ringkasan */}
        <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 shadow-sm border border-stone-200 dark:border-stone-800 flex flex-col justify-between hover:border-emerald-500/40 transition-colors">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                  <DollarSign className="w-4 h-4" />
                </div>
                <h2 className="text-sm font-bold text-stone-800 dark:text-stone-200">
                  Kas Kelas SPI 1A
                </h2>
              </div>
              <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/70 px-2.5 py-1 rounded-full">
                Kas Aman
              </span>
            </div>

            <div className="mt-4 space-y-3">
              <div>
                <p className="text-xs text-stone-400">Total Saldo Terkini</p>
                <div className="text-2xl sm:text-3xl font-extrabold font-serif-title text-stone-900 dark:text-stone-100 mt-0.5">
                  Rp {balance.toLocaleString('id-ID')}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                <div className="bg-emerald-50/70 dark:bg-emerald-950/30 p-2.5 rounded-xl border border-emerald-100 dark:border-emerald-900/40">
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400">Pemasukan</span>
                  <div className="font-bold text-emerald-800 dark:text-emerald-200 mt-0.5">
                    Rp {totalIncome.toLocaleString('id-ID')}
                  </div>
                </div>
                <div className="bg-rose-50/70 dark:bg-rose-950/30 p-2.5 rounded-xl border border-rose-100 dark:border-rose-900/40">
                  <span className="text-[10px] text-rose-600 dark:text-rose-400">Pengeluaran</span>
                  <div className="font-bold text-rose-800 dark:text-rose-200 mt-0.5">
                    Rp {totalExpense.toLocaleString('id-ID')}
                  </div>
                </div>
              </div>

              {unpaidCount > 0 ? (
                <p className="text-[11px] text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{unpaidCount} mahasiswa belum bayar iuran kas</span>
                </p>
              ) : (
                <p className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 shrink-0" />
                  <span>Semua mahasiswa lunas bulan ini!</span>
                </p>
              )}
            </div>
          </div>

          <button
            onClick={() => setActiveTab('kas')}
            className="mt-5 w-full flex items-center justify-between text-xs font-semibold text-emerald-800 dark:text-emerald-300 hover:text-emerald-950 pt-3 border-t border-stone-100 dark:border-stone-800"
          >
            <span>Detail Laporan Kas</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Jadwal Hari Ini Section */}
      <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 shadow-sm border border-stone-200 dark:border-stone-800">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-bold font-serif-title text-stone-900 dark:text-stone-100">
              Jadwal Hari Ini ({todayDayName})
            </h2>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              {todayClasses.length > 0 ? `${todayClasses.length} mata kuliah dijadwalkan` : 'Tidak ada kelas hari ini. Waktunya istirahat atau nugas.'}
            </p>
          </div>
          <button
            onClick={() => setActiveTab('jadwal')}
            className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:underline"
          >
            Lihat Semua Jadwal →
          </button>
        </div>

        {todayClasses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {todayClasses.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200/80 dark:border-stone-700/80 flex flex-col justify-between gap-3 hover:border-emerald-500/50 transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400 mb-1.5">
                    <span className="font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-100/70 dark:bg-emerald-950/80 px-2 py-0.5 rounded-md">
                      {item.sks} SKS
                    </span>
                    <span className="font-mono text-stone-700 dark:text-stone-300">
                      {item.startTime} - {item.endTime}
                    </span>
                  </div>
                  <h3 className="font-bold text-stone-900 dark:text-stone-100 text-sm font-serif-title line-clamp-1">
                    {item.courseName}
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 line-clamp-1">
                    {item.lecturer}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-stone-600 dark:text-stone-300 pt-2 border-t border-stone-200/50 dark:border-stone-700/50">
                  <MapPin className="w-3.5 h-3.5 text-amber-500" />
                  <span className="font-medium">Ruang: {item.room}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-10 text-center rounded-2xl bg-stone-50 dark:bg-stone-800/40 border border-dashed border-stone-200 dark:border-stone-800">
            <BookOpen className="w-8 h-8 text-stone-400 mx-auto mb-2 opacity-60" />
            <p className="text-xs font-semibold text-stone-600 dark:text-stone-300">
              Hari ini bebas kuliah! 🎉
            </p>
            <p className="text-[11px] text-stone-400 mt-0.5">
              Gunakan waktu untuk belajar mandiri, membaca kitab sejarah, atau istirahat.
            </p>
          </div>
        )}
      </div>

      {/* Pengumuman Terbaru Section */}
      <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 shadow-sm border border-stone-200 dark:border-stone-800">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-serif-title text-stone-900 dark:text-stone-100">
                Pengumuman Terbaru
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Informasi dan kabar terhangat seputar kelas
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('pengumuman')}
            className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:underline"
          >
            Lihat Semua →
          </button>
        </div>

        {announcements.length > 0 ? (
          <div className="space-y-3">
            {announcements.slice(0, 3).map((item) => (
              <div
                key={item.id}
                onClick={() => setActiveTab('pengumuman')}
                className="cursor-pointer p-4 rounded-2xl bg-stone-50/70 dark:bg-stone-800/40 border border-stone-200/60 dark:border-stone-800 hover:bg-stone-100/60 dark:hover:bg-stone-800/80 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    {item.isPinned && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300/40">
                        PINNED
                      </span>
                    )}
                    <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                      {item.title}
                    </h3>
                  </div>
                  <p className="text-xs text-stone-600 dark:text-stone-300 line-clamp-1">
                    {item.content}
                  </p>
                </div>
                <div className="text-[11px] text-stone-400 shrink-0">
                  {item.createdAt ? new Date(item.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) : 'Baru saja'}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-xs text-stone-400">
            Belum ada pengumuman nih.
          </div>
        )}
      </div>

    </div>
  );
};
