import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { Schedule, DayOfWeek } from '../types';
import { Modal } from '../components/common/Modal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  BookOpen, 
  Plus, 
  Edit3, 
  Trash2, 
  Sparkles,
  RefreshCw,
  Search,
  CheckCircle2,
  Layers,
  ArrowRight
} from 'lucide-react';

type DayTab = 'Semua' | DayOfWeek;

const ORDERED_DAYS: DayOfWeek[] = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];

export const JadwalPage: React.FC = () => {
  const { isAdmin } = useAuth();
  const { schedules, addSchedule, updateSchedule, deleteSchedule, restoreDefaultSchedules, showToast } = useData();

  // Detect current day
  const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const todayDayName = dayNames[new Date().getDay()] as DayOfWeek;

  // Check if today has classes
  const todayClassCount = schedules.filter((s) => s.day === todayDayName).length;
  // If today has classes, default to today. If today has 0 classes (e.g. Kamis, Sabtu, Minggu), default to 'Semua'
  const initialTab: DayTab = todayClassCount > 0 ? todayDayName : 'Semua';

  const [selectedTab, setSelectedTab] = useState<DayTab>(initialTab);
  const [searchQuery, setSearchQuery] = useState('');
  const [isRestoring, setIsRestoring] = useState(false);

  // Modal State for Add / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
  const [formData, setFormData] = useState<Omit<Schedule, 'id'>>({
    day: (selectedTab === 'Semua' ? 'Senin' : selectedTab) as DayOfWeek,
    startTime: '08:00',
    endTime: '09:40',
    courseName: '',
    room: 'FAB-E.2.3',
    lecturer: '',
    sks: 2
  });

  // Delete Confirm State
  const [deleteTarget, setDeleteTarget] = useState<Schedule | null>(null);

  // Filtered schedules based on tab and search
  const filteredSchedules = schedules.filter((s) => {
    const matchesTab = selectedTab === 'Semua' || s.day === selectedTab;
    const matchesSearch = 
      s.courseName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.lecturer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.room.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  // Total SKS calculation
  const totalSks = schedules.reduce((sum, s) => sum + (s.sks || 0), 0);

  const handleOpenAdd = (dayPreset?: DayOfWeek) => {
    setEditingSchedule(null);
    setFormData({
      day: dayPreset || (selectedTab === 'Semua' ? 'Senin' : selectedTab) as DayOfWeek,
      startTime: '08:00',
      endTime: '09:40',
      courseName: '',
      room: 'FAB-E.2.3',
      lecturer: '',
      sks: 2
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (schedule: Schedule) => {
    setEditingSchedule(schedule);
    setFormData({
      day: schedule.day,
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      courseName: schedule.courseName,
      room: schedule.room,
      lecturer: schedule.lecturer,
      sks: schedule.sks
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.courseName.trim() || !formData.room.trim() || !formData.lecturer.trim()) {
      showToast('Mohon lengkapi nama mata kuliah, ruangan, dan dosen', 'warning');
      return;
    }

    if (editingSchedule) {
      await updateSchedule(editingSchedule.id, formData);
    } else {
      await addSchedule(formData);
    }
    setIsModalOpen(false);
  };

  const handleDelete = async () => {
    if (deleteTarget) {
      await deleteSchedule(deleteTarget.id);
      setDeleteTarget(null);
    }
  };

  const handleRestore = async () => {
    setIsRestoring(true);
    await restoreDefaultSchedules();
    setIsRestoring(false);
  };

  // Group schedules by day for 'Semua' tab
  const groupedByDay = ORDERED_DAYS.map((day) => {
    const list = filteredSchedules
      .filter((s) => s.day === day)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
    return { day, list };
  }).filter((group) => selectedTab !== 'Semua' || group.list.length > 0);

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold font-serif-title text-stone-900 dark:text-stone-100">
              Jadwal Perkuliahan
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
              {schedules.length} Matkul • {totalSks} SKS
            </span>
          </div>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1">
            Jadwal resmi Semester 1 Kelas SPI 1A, Gedung Fakultas Adab dan Bahasa (FAB)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Restore / Re-seed Button */}
          <button
            onClick={handleRestore}
            disabled={isRestoring}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-200 text-xs font-semibold hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors shadow-xs"
            title="Pulihkan seluruh 10 mata kuliah resmi SPI 1A jika ada yang terhapus"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-emerald-600 ${isRestoring ? 'animate-spin' : ''}`} />
            <span>{isRestoring ? 'Memulihkan...' : 'Sinkron 10 Matkul SPI 1A'}</span>
          </button>

          <button
            onClick={() => handleOpenAdd()}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold shadow-md transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Jadwal</span>
          </button>
        </div>
      </div>

      {/* Search and Quick Filters */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Cari matkul, dosen, atau ruangan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-2xl text-xs bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-stone-100 focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
          />
        </div>

        {/* Day Tabs */}
        <div className="w-full overflow-x-auto pb-1 scrollbar-none flex items-center gap-1.5">
          {/* Semua Hari Tab */}
          <button
            onClick={() => setSelectedTab('Semua')}
            className={`flex-shrink-0 px-4 py-2 rounded-2xl text-xs font-semibold transition-all flex items-center gap-2 border ${
              selectedTab === 'Semua'
                ? 'bg-emerald-800 text-white border-emerald-900 shadow-md font-bold'
                : 'bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-stone-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Semua Hari</span>
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                selectedTab === 'Semua'
                  ? 'bg-emerald-950/60 text-emerald-200'
                  : 'bg-stone-100 dark:bg-stone-800 text-stone-500'
              }`}
            >
              {schedules.length}
            </span>
          </button>

          {/* Individual Day Tabs */}
          {ORDERED_DAYS.slice(0, 5).map((day) => {
            const isToday = day === todayDayName;
            const isSelected = selectedTab === day;
            const count = schedules.filter((s) => s.day === day).length;

            return (
              <button
                key={day}
                onClick={() => setSelectedTab(day)}
                className={`flex-shrink-0 px-4 py-2 rounded-2xl text-xs font-semibold transition-all flex items-center gap-2 border ${
                  isSelected
                    ? 'bg-emerald-800 text-white border-emerald-900 shadow-md font-bold'
                    : 'bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-stone-800'
                }`}
              >
                <span>{day}</span>
                {isToday && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-400 text-stone-900 font-extrabold uppercase">
                    Hari Ini
                  </span>
                )}
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                    isSelected
                      ? 'bg-emerald-950/60 text-emerald-200'
                      : 'bg-stone-100 dark:bg-stone-800 text-stone-500'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* If current selected tab is a day with 0 classes (e.g. Kamis), show informative banner */}
      {selectedTab !== 'Semua' && filteredSchedules.length === 0 && (
        <div className="py-12 px-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-center space-y-4 shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center mx-auto">
            <BookOpen className="w-7 h-7" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h2 className="text-base font-bold font-serif-title text-stone-900 dark:text-stone-100">
              Hari {selectedTab} Tidak Ada Perkuliahan Tatap Muka
            </h2>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Jadwal kuliah SPI 1A terjadwal aktif pada hari <strong>Senin, Selasa, Rabu, dan Jumat</strong>. Hari {selectedTab} dapat dimanfaatkan untuk belajar mandiri, kerja kelompok, atau istirahat.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => setSelectedTab('Semua')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-800 text-white text-xs font-bold hover:bg-emerald-900 transition-colors shadow-xs"
            >
              <span>Lihat Seluruh 10 Jadwal (Semua Hari)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => handleOpenAdd(selectedTab as DayOfWeek)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-700 dark:text-stone-300 text-xs font-semibold hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Jadwal Khusus Hari {selectedTab}</span>
            </button>
          </div>
        </div>
      )}

      {/* Render Schedules List */}
      {selectedTab === 'Semua' ? (
        // Grouped by day view
        <div className="space-y-6">
          {groupedByDay.map(({ day, list }) => (
            <div key={day} className="space-y-3">
              <div className="flex items-center gap-3 pb-2 border-b border-stone-200/80 dark:border-stone-800">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                <h2 className="text-sm font-bold font-serif-title text-stone-900 dark:text-stone-100 flex items-center gap-2">
                  <span>Hari {day}</span>
                  {day === todayDayName && (
                    <span className="text-[9px] px-2 py-0.5 rounded-full bg-amber-400 text-stone-900 font-extrabold uppercase">
                      Hari Ini
                    </span>
                  )}
                </h2>
                <span className="text-xs text-stone-400 font-normal">
                  ({list.length} Mata Kuliah)
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {list.map((item) => (
                  <ScheduleCard
                    key={item.id}
                    item={item}
                    isAdmin={isAdmin}
                    onEdit={handleOpenEdit}
                    onDelete={setDeleteTarget}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        // Single day view
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredSchedules.map((item) => (
            <ScheduleCard
              key={item.id}
              item={item}
              isAdmin={isAdmin}
              onEdit={handleOpenEdit}
              onDelete={setDeleteTarget}
            />
          ))}
        </div>
      )}

      {/* Modal Add / Edit */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingSchedule ? 'Edit Jadwal Kuliah' : 'Tambah Jadwal Kuliah'}
        subtitle={`Hari ${formData.day}`}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
              Hari Perkuliahan *
            </label>
            <select
              value={formData.day}
              onChange={(e) => setFormData({ ...formData, day: e.target.value as DayOfWeek })}
              className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100"
            >
              {ORDERED_DAYS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
              Nama Mata Kuliah *
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Sejarah Peradaban Islam"
              value={formData.courseName}
              onChange={(e) => setFormData({ ...formData, courseName: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                Jam Mulai *
              </label>
              <input
                type="time"
                required
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                Jam Selesai *
              </label>
              <input
                type="time"
                required
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                Ruang Kuliah *
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: FAB-E.2.3"
                value={formData.room}
                onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                Bobot SKS *
              </label>
              <input
                type="number"
                min="1"
                max="6"
                required
                value={formData.sks}
                onChange={(e) => setFormData({ ...formData, sks: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
              Dosen Pengampu *
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Moh Mahbub, M.Hum"
              value={formData.lecturer}
              onChange={(e) => setFormData({ ...formData, lecturer: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100"
            />
          </div>

          <div className="pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-medium text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold shadow-md cursor-pointer"
            >
              Simpan Jadwal
            </button>
          </div>
        </form>
      </Modal>

      {/* Confirm Delete */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Hapus Jadwal Kuliah"
        message={`Apakah Anda yakin ingin menghapus mata kuliah "${deleteTarget?.courseName}" (${deleteTarget?.day})?`}
        confirmLabel="Hapus"
      />
    </div>
  );
};

// Sub-component for individual schedule card
const ScheduleCard: React.FC<{
  item: Schedule;
  isAdmin: boolean;
  onEdit: (item: Schedule) => void;
  onDelete: (item: Schedule) => void;
}> = ({ item, isAdmin, onEdit, onDelete }) => {
  return (
    <div className="bg-white dark:bg-stone-900 rounded-3xl p-5 sm:p-6 shadow-xs border border-stone-200 dark:border-stone-800 flex flex-col justify-between hover:border-emerald-600/40 transition-all group">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300/40">
              {item.sks} SKS
            </span>
            <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300">
              {item.day}
            </span>
            <span className="flex items-center gap-1 text-xs font-mono font-medium text-stone-600 dark:text-stone-300">
              <Clock className="w-3.5 h-3.5 text-stone-400" />
              {item.startTime} – {item.endTime}
            </span>
          </div>

          <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onEdit(item)}
              className="p-1.5 rounded-lg text-stone-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors cursor-pointer"
              title="Edit jadwal"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            {isAdmin && (
              <button
                onClick={() => onDelete(item)}
                className="p-1.5 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
                title="Hapus jadwal"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        <div>
          <h3 className="text-base sm:text-lg font-bold font-serif-title text-stone-900 dark:text-stone-100 group-hover:text-emerald-800 dark:group-hover:text-emerald-300 transition-colors">
            {item.courseName}
          </h3>
          <div className="flex items-center gap-2 text-xs text-stone-500 dark:text-stone-400 mt-1">
            <User className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="truncate">{item.lecturer}</span>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 text-stone-600 dark:text-stone-300 font-medium">
          <MapPin className="w-4 h-4 text-amber-500" />
          <span>Ruang: <strong className="text-emerald-700 dark:text-emerald-400">{item.room}</strong></span>
        </div>
        <span className="text-[11px] text-stone-400">Gedung FAB</span>
      </div>
    </div>
  );
};
