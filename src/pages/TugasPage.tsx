import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { Assignment, AssignmentStatus } from '../types';
import { Modal } from '../components/common/Modal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { 
  CheckSquare, 
  Clock, 
  Calendar, 
  AlertTriangle, 
  Plus, 
  Edit3, 
  Trash2, 
  Filter, 
  BookOpen,
  CheckCircle2,
  Hourglass
} from 'lucide-react';

export const TugasPage: React.FC = () => {
  const { isAdmin } = useAuth();
  const { assignments, addAssignment, updateAssignment, deleteAssignment } = useData();

  const [statusFilter, setStatusFilter] = useState<'Semua' | AssignmentStatus>('Semua');
  const [subjectFilter, setSubjectFilter] = useState<string>('Semua');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);
  const [formData, setFormData] = useState<Omit<Assignment, 'id'>>({
    title: '',
    subject: '',
    description: '',
    deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
    status: 'Belum dikerjakan'
  });

  // Delete Confirm State
  const [deleteTarget, setDeleteTarget] = useState<Assignment | null>(null);

  // Extract unique subjects
  const allSubjects = Array.from(new Set(assignments.map((a) => a.subject).filter(Boolean)));

  // Filtered assignments
  const filteredAssignments = assignments
    .filter((a) => {
      const matchStatus = statusFilter === 'Semua' || a.status === statusFilter;
      const matchSubject = subjectFilter === 'Semua' || a.subject === subjectFilter;
      return matchStatus && matchSubject;
    })
    .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());

  const handleOpenAdd = () => {
    setEditingAssignment(null);
    setFormData({
      title: '',
      subject: allSubjects[0] || 'Sejarah Peradaban Islam',
      description: '',
      deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
      status: 'Belum dikerjakan'
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (asg: Assignment) => {
    setEditingAssignment(asg);
    setFormData({
      title: asg.title,
      subject: asg.subject,
      description: asg.description,
      deadline: asg.deadline.slice(0, 16),
      status: asg.status
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.subject.trim()) return;

    if (editingAssignment) {
      await updateAssignment(editingAssignment.id, formData);
    } else {
      await addAssignment(formData);
    }
    setIsModalOpen(false);
  };

  const handleDelete = async () => {
    if (deleteTarget) {
      await deleteAssignment(deleteTarget.id);
      setDeleteTarget(null);
    }
  };

  // Helper to format remaining time & status badges
  const getTimeRemaining = (deadlineStr: string) => {
    const diff = new Date(deadlineStr).getTime() - Date.now();
    if (diff < 0) {
      return { text: 'Terlewat / Terlambat', isOverdue: true, isUrgent: false };
    }
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const isUrgent = diff <= 48 * 60 * 60 * 1000; // <= 48 hours

    if (days > 0) {
      return { text: `${days} hari ${hours} jam lagi`, isOverdue: false, isUrgent };
    }
    return { text: `${hours} jam lagi (Segera!)`, isOverdue: false, isUrgent: true };
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif-title text-stone-900 dark:text-stone-100">
            Tugas & Evaluasi Kuliah
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1">
            Pantau tenggat waktu tugas mandiri dan kelompok kelas SPI 1A
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={handleOpenAdd}
            className="self-start sm:self-auto inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs sm:text-sm font-bold shadow-md transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Tugas</span>
          </button>
        )}
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-stone-900 p-3 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs">
        
        {/* Status Filter */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {(['Semua', 'Belum dikerjakan', 'Sedang dikerjakan', 'Selesai'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                statusFilter === status
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Subject Filter */}
        {allSubjects.length > 0 && (
          <div className="flex items-center gap-2 text-xs">
            <Filter className="w-3.5 h-3.5 text-stone-400" />
            <select
              value={subjectFilter}
              onChange={(e) => setSubjectFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 text-xs font-medium"
            >
              <option value="Semua">Semua Mata Kuliah</option>
              {allSubjects.map((sub) => (
                <option key={sub} value={sub}>{sub}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Task List */}
      {filteredAssignments.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredAssignments.map((task) => {
            const timeInfo = getTimeRemaining(task.deadline);
            const isFinished = task.status === 'Selesai';

            return (
              <div
                key={task.id}
                className={`bg-white dark:bg-stone-900 rounded-3xl p-5 sm:p-6 shadow-sm border transition-all flex flex-col justify-between ${
                  timeInfo.isOverdue && !isFinished
                    ? 'border-red-300 dark:border-red-900/60 bg-red-50/20'
                    : timeInfo.isUrgent && !isFinished
                    ? 'border-amber-300 dark:border-amber-900/60'
                    : 'border-stone-200 dark:border-stone-800'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300">
                      {task.subject}
                    </span>

                    <div className="flex items-center gap-1">
                      {/* Status Badge */}
                      <span
                        className={`px-2.5 py-1 rounded-xl text-[11px] font-bold ${
                          isFinished
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : task.status === 'Sedang dikerjakan'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            : 'bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300'
                        }`}
                      >
                        {task.status}
                      </span>

                      {isAdmin && (
                        <>
                          <button
                            onClick={() => handleOpenEdit(task)}
                            className="p-1.5 rounded-lg text-stone-400 hover:text-emerald-600 transition-colors ml-1"
                            title="Edit tugas"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(task)}
                            className="p-1.5 rounded-lg text-stone-400 hover:text-red-600 transition-colors"
                            title="Hapus tugas"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-base sm:text-lg font-bold font-serif-title text-stone-900 dark:text-stone-100">
                      {task.title}
                    </h3>
                    <p className="text-xs text-stone-600 dark:text-stone-300 mt-1 whitespace-pre-line leading-relaxed">
                      {task.description || 'Tidak ada deskripsi detail.'}
                    </p>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-stone-100 dark:border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2 text-stone-500">
                    <Calendar className="w-3.5 h-3.5 text-stone-400" />
                    <span>
                      {new Date(task.deadline).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })} WIB
                    </span>
                  </div>

                  {/* Countdown indicator */}
                  <div className="flex items-center gap-1.5 font-medium">
                    {timeInfo.isOverdue && !isFinished ? (
                      <span className="text-red-600 dark:text-red-400 font-bold flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>Terlambat</span>
                      </span>
                    ) : timeInfo.isUrgent && !isFinished ? (
                      <span className="text-amber-600 dark:text-amber-400 font-bold flex items-center gap-1">
                        <Hourglass className="w-3.5 h-3.5 animate-pulse" />
                        <span>{timeInfo.text}</span>
                      </span>
                    ) : isFinished ? (
                      <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Tuntas</span>
                      </span>
                    ) : (
                      <span className="text-stone-500 dark:text-stone-400 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{timeInfo.text}</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-16 text-center rounded-3xl bg-white dark:bg-stone-900 border border-dashed border-stone-200 dark:border-stone-800 p-8">
          <CheckSquare className="w-12 h-12 text-stone-300 dark:text-stone-600 mx-auto mb-3" />
          <h2 className="text-sm font-bold text-stone-700 dark:text-stone-300">
            Tidak ada tugas yang sesuai filter
          </h2>
          <p className="text-xs text-stone-400 mt-1">
            Belum ada tugas nih. Nikmati waktu luangmu! ☕
          </p>
        </div>
      )}

      {/* Modal Add / Edit Assignment */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingAssignment ? 'Edit Tugas Kuliah' : 'Tambah Tugas Baru'}
        subtitle="Informasikan batas waktu dan petunjuk pengerjaan"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
              Judul Tugas *
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Resume Kitab Ulumul Quran Bab 3"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
              Mata Kuliah *
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Sejarah Peradaban Islam"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                Tenggat Waktu (Deadline)
              </label>
              <input
                type="datetime-local"
                required
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                Status Tugas
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as AssignmentStatus })}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100"
              >
                <option value="Belum dikerjakan">Belum dikerjakan</option>
                <option value="Sedang dikerjakan">Sedang dikerjakan</option>
                <option value="Selesai">Selesai</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
              Petunjuk / Deskripsi Tugas
            </label>
            <textarea
              rows={3}
              placeholder="Tuliskan format pengumpulan, jumlah halaman, dan catatan dosen..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-100 dark:border-stone-800">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2.5 rounded-xl text-xs font-medium text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold shadow-md transition-colors"
            >
              {editingAssignment ? 'Simpan Perubahan' : 'Terbitkan Tugas'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Hapus Tugas"
        message={`Apakah Anda yakin ingin menghapus tugas "${deleteTarget?.title}"?`}
        confirmText="Hapus Tugas"
      />
    </div>
  );
};
