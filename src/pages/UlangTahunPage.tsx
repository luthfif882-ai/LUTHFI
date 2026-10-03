import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { Student, BirthdayMessage } from '../types';
import { Modal } from '../components/common/Modal';
import { Avatar } from '../components/common/Avatar';
import confetti from 'canvas-confetti';
import { 
  Gift, 
  Calendar, 
  Sparkles, 
  Send, 
  Edit2, 
  Trash2, 
  Clock, 
  Check, 
  Heart,
  ChevronRight,
  ChevronLeft,
  Edit3,
  CalendarCheck
} from 'lucide-react';

const MONTH_NAMES = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

export const UlangTahunPage: React.FC = () => {
  const { userProfile, isAdmin, updateMyProfile } = useAuth();
  const { 
    students, 
    birthdayMessages, 
    addBirthdayMessage, 
    updateBirthdayMessage, 
    deleteBirthdayMessage,
    updateStudent 
  } = useData();

  const now = new Date();
  const currentMonthIdx = now.getMonth();
  const [selectedMonth, setSelectedMonth] = useState<number>(currentMonthIdx);

  // Message Sending Modal
  const [activeStudentWish, setActiveStudentWish] = useState<Student | null>(null);
  const [wishInput, setWishInput] = useState('Barakallah fii umrik, semoga sehat dan sukses selalu! 🎂');
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);

  // Edit Birthday Date Modal
  const [isEditBdayModalOpen, setIsEditBdayModalOpen] = useState(false);
  const [editingBdayStudent, setEditingBdayStudent] = useState<Student | null>(null);
  const [selectedBdayDate, setSelectedBdayDate] = useState('');

  // Today MM-DD
  const todayMMDD = `${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  // Birthday today
  const birthdaysToday = students.filter((s) => s.birthDate && s.birthDate.slice(5) === todayMMDD);

  useEffect(() => {
    if (birthdaysToday.length > 0) {
      try {
        confetti({
          particleCount: 50,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {
        // ignore
      }
    }
  }, [birthdaysToday.length]);

  // Calculate days until next birthday
  const getDaysUntilBirthday = (birthDateStr?: string) => {
    if (!birthDateStr) return 999;
    const parts = birthDateStr.split('-').map(Number);
    if (parts.length < 3) return 999;
    const [_, m, d] = parts;
    const thisYearBday = new Date(now.getFullYear(), m - 1, d);
    
    // If passed this year, check next year
    let target = thisYearBday;
    if (thisYearBday.getTime() < new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()) {
      target = new Date(now.getFullYear() + 1, m - 1, d);
    }
    const diff = target.getTime() - new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    return Math.round(diff / (1000 * 60 * 60 * 24));
  };

  // Sorted upcoming birthdays
  const upcomingBirthdays = [...students]
    .filter((s) => !!s.birthDate)
    .sort((a, b) => getDaysUntilBirthday(a.birthDate) - getDaysUntilBirthday(b.birthDate))
    .slice(0, 6);

  // Birthdays for selected month
  const monthBirthdays = students.filter((s) => {
    if (!s.birthDate) return false;
    const m = parseInt(s.birthDate.split('-')[1], 10);
    return m === selectedMonth + 1;
  });

  const handleOpenSendWish = (student: Student, existingMessage?: BirthdayMessage) => {
    setActiveStudentWish(student);
    if (existingMessage) {
      setEditingMessageId(existingMessage.id);
      setWishInput(existingMessage.message);
    } else {
      setEditingMessageId(null);
      setWishInput('Barakallah fii umrik, semoga sehat dan sukses selalu! 🎂');
    }
  };

  const handleSendWish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeStudentWish || !wishInput.trim()) return;

    if (editingMessageId) {
      await updateBirthdayMessage(editingMessageId, wishInput);
    } else {
      await addBirthdayMessage(activeStudentWish.id, wishInput);
    }
    setActiveStudentWish(null);
    setWishInput('');
    setEditingMessageId(null);
  };

  const handleOpenEditBday = (student: Student) => {
    setEditingBdayStudent(student);
    setSelectedBdayDate(student.birthDate || '2005-01-01');
    setIsEditBdayModalOpen(true);
  };

  const handleOpenMyBday = () => {
    // Find matching student by nim or first name
    const match = students.find((s) => s.nim === userProfile?.nim || (userProfile?.name && s.name.includes(userProfile.name.split(' ')[0])));
    if (match) {
      handleOpenEditBday(match);
    } else if (students.length > 0) {
      handleOpenEditBday(students[0]);
    }
  };

  const handleSaveBday = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBdayStudent || !selectedBdayDate) return;

    await updateStudent(editingBdayStudent.id, { birthDate: selectedBdayDate });

    // If matches user NIM or profile, also sync user profile birthDate
    if (userProfile && (editingBdayStudent.nim === userProfile.nim || userProfile.name.includes(editingBdayStudent.name.split(' ')[0]))) {
      await updateMyProfile({ birthDate: selectedBdayDate });
    }

    setIsEditBdayModalOpen(false);
    setEditingBdayStudent(null);
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif-title text-stone-900 dark:text-stone-100 flex items-center gap-2.5">
            <Gift className="w-7 h-7 text-pink-500" />
            <span>Milad & Ulang Tahun Mahasiswa</span>
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1">
            Kirim doa dan ucapan barakallah untuk seluruh teman sekelas SPI 1A
          </p>
        </div>

        <button
          onClick={handleOpenMyBday}
          className="self-start sm:self-auto inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-800 dark:text-stone-100 text-xs sm:text-sm font-semibold shadow-xs hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
        >
          <CalendarCheck className="w-4 h-4 text-emerald-600" />
          <span>Atur Tanggal Lahir</span>
        </button>
      </div>

      {/* Birthday Today Highlight Card */}
      {birthdaysToday.length > 0 ? (
        <div className="rounded-3xl bg-gradient-to-br from-pink-500 via-rose-500 to-amber-500 text-white p-6 sm:p-8 shadow-xl relative overflow-hidden">
          <div className="relative z-10 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-bold">
              <Sparkles className="w-4 h-4 text-amber-200" />
              <span>Milad Hari Ini! Barakallah fii Umrik</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {birthdaysToday.map((student) => {
                const wishesForStudent = birthdayMessages.filter((m) => m.recipientStudentId === student.id);

                return (
                  <div
                    key={student.id}
                    className="p-4 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar name={student.name} photoUrl={student.photoUrl} size="lg" shape="square" />
                      <div>
                        <h3 className="font-bold text-base font-serif-title text-white">
                          {student.name}
                        </h3>
                        <p className="text-xs text-white/80 font-mono">NIM: {student.nim}</p>
                        <p className="text-[11px] text-amber-200 mt-0.5">
                          {wishesForStudent.length} ucapan terkirim
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5 shrink-0">
                      <button
                        onClick={() => handleOpenSendWish(student)}
                        className="px-3.5 py-2 rounded-xl bg-white text-pink-600 hover:bg-pink-50 text-xs font-bold shadow-md transition-colors"
                      >
                        Kirim Doa ✨
                      </button>
                      <button
                        onClick={() => handleOpenEditBday(student)}
                        className="text-[10px] text-white/80 hover:text-white underline text-center"
                      >
                        Ubah Tanggal
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <div className="p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 flex items-center justify-between gap-3 text-stone-600 dark:text-stone-300">
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 rounded-xl bg-pink-50 dark:bg-pink-950/60 text-pink-500">
              <Gift className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-semibold text-stone-900 dark:text-stone-100">
                Hari ini tidak ada yang milad.
              </p>
              <p className="text-[11px] text-stone-400">
                Lihat daftar ulang tahun terdekat di bawah untuk mempersiapkan ucapan terbaik!
              </p>
            </div>
          </div>

          <button
            onClick={handleOpenMyBday}
            className="text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline shrink-0"
          >
            Edit Tanggal Lahir Saya →
          </button>
        </div>
      )}

      {/* Upcoming Birthdays Grid */}
      <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 shadow-sm border border-stone-200 dark:border-stone-800">
        <h2 className="text-base sm:text-lg font-bold font-serif-title text-stone-900 dark:text-stone-100 mb-4 flex items-center gap-2">
          <span>Ulang Tahun Terdekat</span>
          <span className="text-xs font-sans font-normal text-stone-400">• Hitung Mundur</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {upcomingBirthdays.map((student) => {
            const daysLeft = getDaysUntilBirthday(student.birthDate);
            const isToday = daysLeft === 0;
            const wishes = birthdayMessages.filter((m) => m.recipientStudentId === student.id);

            return (
              <div
                key={student.id}
                className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200/80 dark:border-stone-700/80 flex items-center justify-between gap-3 hover:border-pink-500/40 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Avatar name={student.name} photoUrl={student.photoUrl} size="md" shape="square" />
                  <div>
                    <h3 className="font-bold text-xs sm:text-sm text-stone-900 dark:text-stone-100 font-serif-title line-clamp-1">
                      {student.name}
                    </h3>
                    <p className="text-[11px] text-stone-500 dark:text-stone-400 flex items-center gap-1">
                      <span>{student.birthDate ? new Date(student.birthDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long' }) : '-'}</span>
                      <button
                        onClick={() => handleOpenEditBday(student)}
                        className="text-stone-400 hover:text-emerald-600 ml-1"
                        title="Ubah hari ulang tahun"
                      >
                        <Edit3 className="w-3 h-3" />
                      </button>
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    isToday
                      ? 'bg-pink-100 text-pink-700 dark:bg-pink-950 dark:text-pink-300'
                      : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                  }`}>
                    {isToday ? 'Hari ini! 🎂' : `${daysLeft} hari lagi`}
                  </span>
                  <div className="mt-1">
                    <button
                      onClick={() => handleOpenSendWish(student)}
                      className="text-[10px] font-bold text-pink-600 dark:text-pink-400 hover:underline"
                    >
                      Beri Ucapan ({wishes.length})
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 12-Month Calendar Browser */}
      <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 shadow-sm border border-stone-200 dark:border-stone-800">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base sm:text-lg font-bold font-serif-title text-stone-900 dark:text-stone-100">
              Kalender 12 Bulan Mahasiswa
            </h2>
            <p className="text-xs text-stone-400">
              Pilih bulan untuk melihat siapa saja yang berulang tahun
            </p>
          </div>
        </div>

        {/* Month Selector Buttons */}
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2 mb-6">
          {MONTH_NAMES.map((mName, idx) => {
            const count = students.filter(s => s.birthDate && parseInt(s.birthDate.split('-')[1], 10) === idx + 1).length;
            const isSelected = selectedMonth === idx;

            return (
              <button
                key={mName}
                onClick={() => setSelectedMonth(idx)}
                className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-between transition-all border ${
                  isSelected
                    ? 'bg-emerald-800 text-white border-emerald-900 shadow-sm'
                    : 'bg-stone-50 dark:bg-stone-800/60 text-stone-700 dark:text-stone-300 border-stone-200/80 dark:border-stone-700/80 hover:bg-stone-100'
                }`}
              >
                <span>{mName.slice(0, 3)}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  isSelected ? 'bg-emerald-950/60 text-emerald-200' : 'bg-stone-200 dark:bg-stone-700 text-stone-500'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Selected Month Student List */}
        <div>
          <h3 className="text-sm font-bold text-stone-800 dark:text-stone-200 mb-3">
            Ulang Tahun Bulan {MONTH_NAMES[selectedMonth]} ({monthBirthdays.length} Mahasiswa)
          </h3>

          {monthBirthdays.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {monthBirthdays.map((student) => {
                const [_, m, d] = (student.birthDate || '').split('-');

                return (
                  <div
                    key={student.id}
                    className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200/80 dark:border-stone-700/80 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-2.5">
                      <Avatar name={student.name} photoUrl={student.photoUrl} size="sm" shape="square" />
                      <div>
                        <p className="text-xs font-bold text-stone-900 dark:text-stone-100 font-serif-title line-clamp-1">
                          {student.name}
                        </p>
                        <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">
                          Tanggal {d} {MONTH_NAMES[selectedMonth]}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEditBday(student)}
                        className="p-1.5 rounded-lg text-stone-400 hover:text-emerald-600 transition-colors"
                        title="Edit tanggal lahir"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleOpenSendWish(student)}
                        className="p-1.5 rounded-lg text-pink-600 hover:bg-pink-50 dark:hover:bg-pink-950/50 transition-colors"
                        title="Kirim ucapan doa"
                      >
                        <Heart className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-stone-400">
              Tidak ada mahasiswa SPI 1A yang berulang tahun pada bulan {MONTH_NAMES[selectedMonth]}.
            </div>
          )}
        </div>
      </div>

      {/* Birthday Wishes Feed for Active Student */}
      {activeStudentWish && (
        <Modal
          isOpen={!!activeStudentWish}
          onClose={() => setActiveStudentWish(null)}
          title={`Ucapan Milad untuk ${activeStudentWish.name.split(' ')[0]}`}
          subtitle="Doa dan ucapan tersimpan abadi sebagai kenangan kelas"
          maxWidth="md"
        >
          <div className="space-y-4">
            <form onSubmit={handleSendWish} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                  Pesan Ucapan Anda
                </label>
                <textarea
                  rows={3}
                  required
                  value={wishInput}
                  onChange={(e) => setWishInput(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl text-xs bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                />
              </div>

              <div className="flex flex-wrap gap-1.5">
                {[
                  'Barakallah fii umrik! 🎂',
                  'Semoga dilancarkan studinya di SPI & sukses selalu! ✨',
                  'Sehat wal afiat dan tercapai segala cita-cita 🤲'
                ].map((tmpl) => (
                  <button
                    key={tmpl}
                    type="button"
                    onClick={() => setWishInput(tmpl)}
                    className="text-[10px] px-2.5 py-1 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200"
                  >
                    {tmpl}
                  </button>
                ))}
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-pink-600 hover:bg-pink-700 text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{editingMessageId ? 'Perbarui Ucapan' : 'Kirimkan Doa'}</span>
                </button>
              </div>
            </form>

            <div className="border-t border-stone-100 dark:border-stone-800 pt-3">
              <h4 className="text-xs font-bold text-stone-800 dark:text-stone-200 mb-2">
                Ucapan Teman-Teman Sekelas ({birthdayMessages.filter((m) => m.recipientStudentId === activeStudentWish.id).length})
              </h4>

              <div className="max-h-60 overflow-y-auto space-y-2.5">
                {birthdayMessages
                  .filter((m) => m.recipientStudentId === activeStudentWish.id)
                  .map((msg) => {
                    const isMyMessage = msg.senderUid === userProfile?.uid;
                    const canEdit = isMyMessage || isAdmin;

                    return (
                      <div
                        key={msg.id}
                        className="p-3 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200/60 dark:border-stone-700/60 space-y-1"
                      >
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-bold text-stone-900 dark:text-stone-100">
                            {msg.senderName} {isMyMessage && '(Anda)'}
                          </span>
                          <span className="text-stone-400">
                            {new Date(msg.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                          </span>
                        </div>
                        <p className="text-xs text-stone-700 dark:text-stone-300">{msg.message}</p>
                        
                        {canEdit && (
                          <div className="flex items-center justify-end gap-2 pt-1 text-[10px]">
                            {isMyMessage && (
                              <button
                                onClick={() => handleOpenSendWish(activeStudentWish, msg)}
                                className="text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 flex items-center gap-1"
                              >
                                <Edit2 className="w-3 h-3" /> Edit
                              </button>
                            )}
                            <button
                              onClick={() => deleteBirthdayMessage(msg.id)}
                              className="text-red-500 hover:text-red-700 flex items-center gap-1"
                            >
                              <Trash2 className="w-3 h-3" /> Hapus
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal Edit Tanggal Lahir Mahasiswa */}
      {editingBdayStudent && (
        <Modal
          isOpen={isEditBdayModalOpen}
          onClose={() => setIsEditBdayModalOpen(false)}
          title="Atur Tanggal Lahir / Milad"
          subtitle={`Ubah tanggal lahir untuk ${editingBdayStudent.name}`}
        >
          <form onSubmit={handleSaveBday} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                Pilih Mahasiswa
              </label>
              <select
                value={editingBdayStudent.id}
                onChange={(e) => {
                  const target = students.find((s) => s.id === e.target.value);
                  if (target) {
                    setEditingBdayStudent(target);
                    setSelectedBdayDate(target.birthDate || '2005-01-01');
                  }
                }}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 font-bold"
              >
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.nim})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300">
                  Tanggal Lahir (Hari, Bulan, Tahun) *
                </label>
                {selectedBdayDate && (
                  <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded-md">
                    🎂 {selectedBdayDate}
                  </span>
                )}
              </div>
              <input
                type="date"
                required
                value={selectedBdayDate}
                onChange={(e) => setSelectedBdayDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 font-mono"
              />
              <p className="text-[11px] text-stone-400 mt-1">
                Tanggal ini akan menentukan perhitungan hitung mundur milad, kalender ulang tahun kelas, dan ucapan otomatis di Beranda.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-100 dark:border-stone-800">
              <button
                type="button"
                onClick={() => setIsEditBdayModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-stone-600 dark:text-stone-400 hover:bg-stone-100"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold shadow-md transition-colors cursor-pointer"
              >
                Simpan Tanggal Lahir
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
