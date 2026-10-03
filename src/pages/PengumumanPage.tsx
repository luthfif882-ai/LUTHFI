import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { Announcement } from '../types';
import { Modal } from '../components/common/Modal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { 
  Bell, 
  Pin, 
  Plus, 
  Edit3, 
  Trash2, 
  Search, 
  Calendar, 
  User, 
  PinOff,
  X 
} from 'lucide-react';

export const PengumumanPage: React.FC = () => {
  const { isAdmin, userProfile } = useAuth();
  const { 
    announcements, 
    addAnnouncement, 
    updateAnnouncement, 
    deleteAnnouncement, 
    togglePinAnnouncement 
  } = useData();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);

  // Modal State for Add / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [formData, setFormData] = useState<Omit<Announcement, 'id'>>({
    title: '',
    content: '',
    author: userProfile?.name || 'Pengurus Kelas',
    isPinned: false
  });

  const [deleteTarget, setDeleteTarget] = useState<Announcement | null>(null);

  const filteredAnnouncements = announcements.filter((a) => {
    const q = searchQuery.toLowerCase().trim();
    return a.title.toLowerCase().includes(q) || a.content.toLowerCase().includes(q);
  });

  const handleOpenAdd = () => {
    setEditingAnnouncement(null);
    setFormData({
      title: '',
      content: '',
      author: userProfile?.name || 'Pengurus Kelas SPI 1A',
      isPinned: false
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (ann: Announcement) => {
    setEditingAnnouncement(ann);
    setFormData({
      title: ann.title,
      content: ann.content,
      author: ann.author,
      isPinned: ann.isPinned
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) return;

    if (editingAnnouncement) {
      await updateAnnouncement(editingAnnouncement.id, formData);
    } else {
      await addAnnouncement(formData);
    }
    setIsModalOpen(false);
  };

  const handleDelete = async () => {
    if (deleteTarget) {
      await deleteAnnouncement(deleteTarget.id);
      setDeleteTarget(null);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif-title text-stone-900 dark:text-stone-100 flex items-center gap-2.5">
            <Bell className="w-7 h-7 text-amber-500" />
            <span>Pengumuman Kelas</span>
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1">
            Informasi resmi dosen, komting, dan jadwal kegiatan perkuliahan
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={handleOpenAdd}
            className="self-start sm:self-auto inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs sm:text-sm font-bold shadow-md transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Buat Pengumuman</span>
          </button>
        )}
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Cari pengumuman..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-2xl text-xs sm:text-sm bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-600 shadow-xs"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Announcements List */}
      {filteredAnnouncements.length > 0 ? (
        <div className="space-y-4">
          {filteredAnnouncements.map((ann) => (
            <div
              key={ann.id}
              className={`p-5 sm:p-6 rounded-3xl bg-white dark:bg-stone-900 border shadow-xs transition-all ${
                ann.isPinned
                  ? 'border-amber-300 dark:border-amber-800/80 bg-gradient-to-r from-amber-50/20 via-white to-white dark:from-amber-950/20 dark:to-stone-900'
                  : 'border-stone-200 dark:border-stone-800'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    {ann.isPinned && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300/40">
                        <Pin className="w-3 h-3 text-amber-600 fill-amber-600" />
                        <span>DIPASANG DI ATAS</span>
                      </span>
                    )}
                    <span className="text-xs text-stone-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {ann.createdAt ? new Date(ann.createdAt).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      }) : 'Baru saja'}
                    </span>
                  </div>

                  <h3
                    onClick={() => setSelectedAnnouncement(ann)}
                    className="text-base sm:text-lg font-bold font-serif-title text-stone-900 dark:text-stone-100 hover:text-emerald-800 dark:hover:text-emerald-300 cursor-pointer"
                  >
                    {ann.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 whitespace-pre-line leading-relaxed">
                    {ann.content}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-stone-100 dark:border-stone-800">
                  {isAdmin && (
                    <>
                      <button
                        onClick={() => togglePinAnnouncement(ann.id, ann.isPinned)}
                        className={`p-2 rounded-xl transition-colors ${
                          ann.isPinned
                            ? 'text-amber-600 bg-amber-50 dark:bg-amber-950'
                            : 'text-stone-400 hover:text-amber-600'
                        }`}
                        title={ann.isPinned ? 'Lepas Pin' : 'Pasang di Atas (Pin)'}
                      >
                        {ann.isPinned ? <PinOff className="w-4 h-4" /> : <Pin className="w-4 h-4" />}
                      </button>

                      <button
                        onClick={() => handleOpenEdit(ann)}
                        className="p-2 rounded-xl text-stone-400 hover:text-emerald-600 transition-colors"
                        title="Edit pengumuman"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => setDeleteTarget(ann)}
                        className="p-2 rounded-xl text-stone-400 hover:text-red-600 transition-colors"
                        title="Hapus pengumuman"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-stone-100 dark:border-stone-800 text-[11px] text-stone-400 flex items-center justify-between">
                <span className="flex items-center gap-1.5 font-medium text-stone-500 dark:text-stone-400">
                  <User className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Diumumkan oleh: {ann.author}</span>
                </span>
                <button
                  onClick={() => setSelectedAnnouncement(ann)}
                  className="text-emerald-700 dark:text-emerald-400 font-semibold hover:underline"
                >
                  Lihat Selengkapnya →
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-16 text-center rounded-3xl bg-white dark:bg-stone-900 border border-dashed border-stone-200 dark:border-stone-800 p-8">
          <Bell className="w-12 h-12 text-stone-300 dark:text-stone-600 mx-auto mb-3" />
          <h2 className="text-sm font-bold text-stone-700 dark:text-stone-300">
            Belum ada pengumuman
          </h2>
          <p className="text-xs text-stone-400 mt-1">
            Kabar atau edaran penting dari pengurus kelas akan tampil di sini.
          </p>
        </div>
      )}

      {/* Announcement Detail Modal */}
      {selectedAnnouncement && (
        <Modal
          isOpen={!!selectedAnnouncement}
          onClose={() => setSelectedAnnouncement(null)}
          title={selectedAnnouncement.title}
          subtitle={`Oleh ${selectedAnnouncement.author} • ${
            selectedAnnouncement.createdAt
              ? new Date(selectedAnnouncement.createdAt).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })
              : ''
          }`}
        >
          <div className="space-y-4 text-xs sm:text-sm text-stone-700 dark:text-stone-300 leading-relaxed whitespace-pre-line">
            {selectedAnnouncement.content}
          </div>
        </Modal>
      )}

      {/* Modal Add / Edit Announcement */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingAnnouncement ? 'Edit Pengumuman' : 'Buat Pengumuman Baru'}
        subtitle="Pengumuman akan disiarkan ke seluruh anggota kelas"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
              Judul Pengumuman *
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Perubahan Ruangan Kuliah Hari Jumat"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
              Isi Pengumuman *
            </label>
            <textarea
              rows={5}
              required
              placeholder="Tuliskan detail pengumuman dengan jelas..."
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
              Nama Penulis / Jabatan
            </label>
            <input
              type="text"
              required
              value={formData.author}
              onChange={(e) => setFormData({ ...formData, author: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100"
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="pinCheck"
              checked={formData.isPinned}
              onChange={(e) => setFormData({ ...formData, isPinned: e.target.checked })}
              className="w-4 h-4 rounded-md text-emerald-600 focus:ring-emerald-500 border-stone-300"
            />
            <label htmlFor="pinCheck" className="text-xs font-medium text-stone-700 dark:text-stone-300 cursor-pointer">
              Sematkan pengumuman ini di bagian paling atas (Pinned)
            </label>
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
              {editingAnnouncement ? 'Simpan Perubahan' : 'Terbitkan Pengumuman'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Hapus Pengumuman"
        message={`Apakah Anda yakin ingin menghapus pengumuman "${deleteTarget?.title}"?`}
        confirmText="Hapus Pengumuman"
      />
    </div>
  );
};
