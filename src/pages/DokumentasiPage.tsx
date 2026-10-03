import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { Memory } from '../types';
import { Modal } from '../components/common/Modal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { compressImageMax, uploadImageToStorage } from '../utils/imageCompressor';
import { 
  Camera, 
  Plus, 
  Trash2, 
  Calendar, 
  User, 
  Upload, 
  Image as ImageIcon, 
  Maximize2,
  X 
} from 'lucide-react';

const ALBUMS = ['Semua Album', 'Kuliah Perdana', 'Kumpul Kelas', 'Tugas Kelompok', 'Acara Kampus', 'Lainnya'];

export const DokumentasiPage: React.FC = () => {
  const { isAdmin, userProfile } = useAuth();
  const { memories, addMemory, deleteMemory } = useData();

  const [selectedAlbum, setSelectedAlbum] = useState('Semua Album');
  const [activeLightboxMemory, setActiveLightboxMemory] = useState<Memory | null>(null);

  // Modal State for Add Photo
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<Omit<Memory, 'id'>>({
    title: '',
    caption: '',
    date: new Date().toISOString().split('T')[0],
    album: 'Kuliah Perdana',
    imageUrl: ''
  });

  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [deleteTarget, setDeleteTarget] = useState<Memory | null>(null);

  const filteredMemories = memories.filter((m) => {
    if (selectedAlbum === 'Semua Album') return true;
    return m.album === selectedAlbum;
  });

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      // Max 1200px, 75% quality as specified in requirement 14
      const compressedBlob = await compressImageMax(file, 1200, 0.75);
      const path = `memories/memory_${Date.now()}.jpg`;
      const url = await uploadImageToStorage(compressedBlob, path);
      setPreviewUrl(url);
      setFormData((prev) => ({ ...prev, imageUrl: url }));
    } catch (err) {
      console.error('Error processing documentation image:', err);
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.imageUrl) return;

    await addMemory(formData);
    setIsModalOpen(false);
    setPreviewUrl('');
    setFormData({
      title: '',
      caption: '',
      date: new Date().toISOString().split('T')[0],
      album: 'Kuliah Perdana',
      imageUrl: ''
    });
  };

  const handleDelete = async () => {
    if (deleteTarget) {
      await deleteMemory(deleteTarget.id);
      setDeleteTarget(null);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif-title text-stone-900 dark:text-stone-100 flex items-center gap-2.5">
            <Camera className="w-7 h-7 text-blue-500" />
            <span>Dokumentasi & Kenangan</span>
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1">
            Galeri foto perjalanan dan memori bersama kelas SPI 1A
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="self-start sm:self-auto inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs sm:text-sm font-bold shadow-md transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Unggah Foto</span>
          </button>
        )}
      </div>

      {/* Album Filters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {ALBUMS.map((alb) => (
          <button
            key={alb}
            onClick={() => setSelectedAlbum(alb)}
            className={`px-4 py-2 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all border ${
              selectedAlbum === alb
                ? 'bg-emerald-800 text-white border-emerald-900 shadow-xs'
                : 'bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-stone-800'
            }`}
          >
            {alb}
          </button>
        ))}
      </div>

      {/* Photo Gallery Grid */}
      {filteredMemories.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredMemories.map((photo) => (
            <div
              key={photo.id}
              className="bg-white dark:bg-stone-900 rounded-3xl overflow-hidden shadow-sm border border-stone-200 dark:border-stone-800 flex flex-col justify-between group hover:border-emerald-600/40 transition-all"
            >
              <div 
                onClick={() => setActiveLightboxMemory(photo)}
                className="relative aspect-4/3 bg-stone-100 dark:bg-stone-800 overflow-hidden cursor-pointer"
              >
                <img
                  src={photo.imageUrl}
                  alt={photo.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-stone-950/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="p-2.5 rounded-full bg-white/80 dark:bg-stone-900/80 text-stone-900 dark:text-stone-100 shadow-md">
                    <Maximize2 className="w-5 h-5" />
                  </div>
                </div>
                <div className="absolute top-3 left-3">
                  <span className="px-2.5 py-1 rounded-xl text-[10px] font-bold bg-stone-950/60 backdrop-blur-md text-white">
                    {photo.album}
                  </span>
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-base font-serif-title text-stone-900 dark:text-stone-100 line-clamp-1">
                    {photo.title}
                  </h3>
                  {photo.caption && (
                    <p className="text-xs text-stone-600 dark:text-stone-300 mt-1 line-clamp-2 leading-relaxed">
                      {photo.caption}
                    </p>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-xs text-stone-400">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{photo.date}</span>
                  </span>

                  {isAdmin && (
                    <button
                      onClick={() => setDeleteTarget(photo)}
                      className="p-1 rounded-lg text-stone-400 hover:text-red-600 transition-colors"
                      title="Hapus foto"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-16 text-center rounded-3xl bg-white dark:bg-stone-900 border border-dashed border-stone-200 dark:border-stone-800 p-8">
          <ImageIcon className="w-12 h-12 text-stone-300 dark:text-stone-600 mx-auto mb-3" />
          <h2 className="text-sm font-bold text-stone-700 dark:text-stone-300">
            Belum ada dokumentasi di album {selectedAlbum}
          </h2>
          <p className="text-xs text-stone-400 mt-1">
            Abadikan momen berharga angkatan pertama SPI 1A di sini.
          </p>
        </div>
      )}

      {/* Lightbox Modal */}
      {activeLightboxMemory && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/90 backdrop-blur-md animate-fadeIn"
          onClick={() => setActiveLightboxMemory(null)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] bg-stone-900 rounded-3xl overflow-hidden border border-stone-800 shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setActiveLightboxMemory(null)}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-stone-950/70 text-white hover:bg-stone-950 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex-1 overflow-auto flex items-center justify-center bg-black/60">
              <img
                src={activeLightboxMemory.imageUrl}
                alt={activeLightboxMemory.title}
                className="max-w-full max-h-[70vh] object-contain"
              />
            </div>

            <div className="p-5 bg-stone-900 text-stone-100 space-y-1 border-t border-stone-800">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-900 text-emerald-300">
                  {activeLightboxMemory.album}
                </span>
                <span className="text-xs text-stone-400">
                  Tanggal: {activeLightboxMemory.date}
                </span>
              </div>
              <h2 className="text-lg font-bold font-serif-title">
                {activeLightboxMemory.title}
              </h2>
              {activeLightboxMemory.caption && (
                <p className="text-xs text-stone-300 whitespace-pre-line leading-relaxed">
                  {activeLightboxMemory.caption}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal Add Photo */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Unggah Foto Kenangan"
        subtitle="Foto dikompresi otomatis (maks 1200px) sebelum diunggah"
      >
        <form onSubmit={handleSave} className="space-y-4">
          {/* File Picker & Preview */}
          <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-stone-50 dark:bg-stone-800 border-2 border-dashed border-stone-300 dark:border-stone-700">
            {previewUrl ? (
              <div className="space-y-3 w-full text-center">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="max-h-48 rounded-xl mx-auto object-cover border border-stone-200"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline"
                >
                  Ganti Foto Lain
                </button>
              </div>
            ) : (
              <div className="text-center space-y-2">
                <Camera className="w-10 h-10 text-stone-400 mx-auto" />
                <p className="text-xs text-stone-600 dark:text-stone-300 font-semibold">
                  Pilih foto kenangan kelas dari perangkat
                </p>
                <button
                  type="button"
                  disabled={uploading}
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 rounded-xl bg-emerald-800 text-white text-xs font-bold hover:bg-emerald-900 transition-colors"
                >
                  {uploading ? 'Memproses Foto...' : 'Pilih dari Galeri'}
                </button>
              </div>
            )}
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
              Judul Foto *
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Foto Bersama di Depan Gedung Rektorat"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                Album Kategori
              </label>
              <select
                value={formData.album}
                onChange={(e) => setFormData({ ...formData, album: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100"
              >
                {ALBUMS.filter((a) => a !== 'Semua Album').map((a) => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                Tanggal Kejadian
              </label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
              Caption / Cerita Singkat
            </label>
            <textarea
              rows={3}
              placeholder="Ceritakan momen di balik foto ini..."
              value={formData.caption || ''}
              onChange={(e) => setFormData({ ...formData, caption: e.target.value })}
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
              disabled={!formData.imageUrl || uploading}
              className="px-5 py-2.5 rounded-xl bg-emerald-800 disabled:opacity-50 hover:bg-emerald-900 text-white text-xs font-bold shadow-md transition-colors"
            >
              Simpan Dokumentasi
            </button>
          </div>
        </form>
      </Modal>

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Hapus Foto Dokumentasi"
        message={`Apakah Anda yakin ingin menghapus foto "${deleteTarget?.title}"?`}
        confirmText="Hapus Foto"
      />
    </div>
  );
};
