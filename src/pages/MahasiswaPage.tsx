import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { Student } from '../types';
import { Modal } from '../components/common/Modal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { Avatar } from '../components/common/Avatar';
import { compressAndCropSquare, uploadImageToStorage } from '../utils/imageCompressor';
import { 
  Search, 
  Plus, 
  Edit3, 
  Trash2, 
  Phone, 
  Instagram, 
  Calendar, 
  Upload, 
  Camera, 
  X, 
  Sparkles,
  ExternalLink
} from 'lucide-react';

export const MahasiswaPage: React.FC = () => {
  const { isAdmin } = useAuth();
  const { students, addStudent, updateStudent, deleteStudent } = useData();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  // Modal State for Add / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [formData, setFormData] = useState<Omit<Student, 'id'>>({
    name: '',
    nim: '',
    photoUrl: '',
    whatsapp: '',
    instagram: '',
    birthDate: ''
  });

  // Photo upload handling state
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [previewPhotoUrl, setPreviewPhotoUrl] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Delete Confirm State
  const [deleteTarget, setDeleteTarget] = useState<Student | null>(null);

  // Filter students based on search query
  const filteredStudents = students.filter((s) => {
    const q = searchQuery.toLowerCase().trim();
    return s.name.toLowerCase().includes(q) || s.nim.toLowerCase().includes(q);
  });

  const handleOpenAdd = () => {
    setEditingStudent(null);
    setFormData({
      name: '',
      nim: '',
      photoUrl: '',
      whatsapp: '',
      instagram: '',
      birthDate: ''
    });
    setPreviewPhotoUrl('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (student: Student) => {
    setEditingStudent(student);
    setFormData({
      name: student.name,
      nim: student.nim,
      photoUrl: student.photoUrl || '',
      whatsapp: student.whatsapp || '',
      instagram: student.instagram || '',
      birthDate: student.birthDate || ''
    });
    setPreviewPhotoUrl(student.photoUrl || '');
    setIsModalOpen(true);
  };

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingPhoto(true);
      // 1:1 square crop, 300x300, 70% quality as required
      const compressedBlob = await compressAndCropSquare(file, 300, 0.7);
      const studentId = editingStudent?.id || formData.nim || `student_${Date.now()}`;
      const path = `students/${studentId}_${Date.now()}.jpg`;
      const url = await uploadImageToStorage(compressedBlob, path);
      setPreviewPhotoUrl(url);
      setFormData((prev) => ({ ...prev, photoUrl: url }));
    } catch (err) {
      console.error('Photo processing error:', err);
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.nim.trim()) return;

    if (editingStudent) {
      await updateStudent(editingStudent.id, formData);
    } else {
      await addStudent(formData);
    }
    setIsModalOpen(false);
  };

  const handleDelete = async () => {
    if (deleteTarget) {
      await deleteStudent(deleteTarget.id);
      setDeleteTarget(null);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold font-serif-title text-stone-900 dark:text-stone-100">
              Direktori Mahasiswa
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
              {students.length} Mahasiswa
            </span>
          </div>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1">
            Daftar lengkap anggota kelas SPI 1A Semester 1 UIN Surakarta
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={handleOpenAdd}
            className="self-start sm:self-auto inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs sm:text-sm font-bold shadow-md transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Mahasiswa</span>
          </button>
        )}
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Cari berdasarkan nama atau NIM..."
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

      {/* Student Cards Grid */}
      {filteredStudents.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredStudents.map((student, idx) => (
            <div
              key={student.id}
              className="bg-white dark:bg-stone-900 rounded-3xl p-5 shadow-sm border border-stone-200 dark:border-stone-800 flex flex-col justify-between hover:border-emerald-600/40 hover:shadow-md transition-all group"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div 
                    onClick={() => setSelectedStudent(student)}
                    className="cursor-pointer"
                  >
                    <Avatar
                      name={student.name}
                      photoUrl={student.photoUrl}
                      size="lg"
                      shape="square"
                      className="group-hover:scale-105 transition-transform"
                    />
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(student)}
                      className="p-1.5 rounded-lg text-stone-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors cursor-pointer"
                      title="Edit foto, tanggal lahir, dan kontak"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    {isAdmin && (
                      <button
                        onClick={() => setDeleteTarget(student)}
                        className="p-1.5 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
                        title="Hapus mahasiswa"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <div 
                  onClick={() => setSelectedStudent(student)}
                  className="mt-4 cursor-pointer"
                >
                  <h3 className="font-bold text-sm sm:text-base font-serif-title text-stone-900 dark:text-stone-100 group-hover:text-emerald-800 dark:group-hover:text-emerald-300 transition-colors line-clamp-1">
                    {student.name}
                  </h3>
                  <p className="text-xs font-mono font-medium text-emerald-700 dark:text-emerald-400 mt-0.5">
                    NIM: {student.nim}
                  </p>
                </div>
              </div>

              {/* Contacts & Quick Details */}
              <div className="mt-4 pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-xs text-stone-500">
                <div className="flex items-center gap-2">
                  {student.whatsapp && (
                    <a
                      href={`https://wa.me/${student.whatsapp.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 transition-colors"
                      title="Kirim WhatsApp"
                    >
                      <Phone className="w-3.5 h-3.5" />
                    </a>
                  )}
                  {student.instagram && (
                    <a
                      href={`https://instagram.com/${student.instagram.replace('@', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-lg bg-pink-50 dark:bg-pink-950/60 text-pink-700 dark:text-pink-300 hover:bg-pink-100 transition-colors"
                      title="Buka Instagram"
                    >
                      <Instagram className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>

                <button
                  onClick={() => setSelectedStudent(student)}
                  className="text-[11px] font-semibold text-stone-600 dark:text-stone-300 hover:text-emerald-700 dark:hover:text-emerald-300"
                >
                  Detail Profil →
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-16 text-center rounded-3xl bg-white dark:bg-stone-900 border border-dashed border-stone-200 dark:border-stone-800 p-8">
          <p className="text-xs font-bold text-stone-600 dark:text-stone-300">
            Tidak ada mahasiswa dengan kata kunci "{searchQuery}"
          </p>
          <button
            onClick={() => setSearchQuery('')}
            className="mt-3 text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:underline"
          >
            Reset Pencarian
          </button>
        </div>
      )}

      {/* Student Detail Modal */}
      {selectedStudent && (
        <Modal
          isOpen={!!selectedStudent}
          onClose={() => setSelectedStudent(null)}
          title="Profil Mahasiswa"
          subtitle={`SPI 1A • Angkatan 2026`}
        >
          <div className="flex flex-col items-center text-center space-y-4 py-2">
            <Avatar
              name={selectedStudent.name}
              photoUrl={selectedStudent.photoUrl}
              size="xl"
              shape="square"
              className="shadow-md"
            />
            <div>
              <h2 className="text-xl font-bold font-serif-title text-stone-900 dark:text-stone-100">
                {selectedStudent.name}
              </h2>
              <p className="text-xs font-mono font-bold text-emerald-700 dark:text-emerald-400 mt-1">
                NIM: {selectedStudent.nim}
              </p>
            </div>

            {/* Information Grid */}
            <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3 text-left pt-2">
              <div className="p-3 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200/80 dark:border-stone-700/80">
                <span className="text-[10px] text-stone-400 block uppercase font-semibold">
                  Tanggal Lahir
                </span>
                <span className="text-xs font-semibold text-stone-800 dark:text-stone-200 flex items-center gap-1.5 mt-0.5">
                  <Calendar className="w-3.5 h-3.5 text-amber-500" />
                  {selectedStudent.birthDate ? (
                    new Date(selectedStudent.birthDate).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })
                  ) : (
                    'Belum diatur'
                  )}
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200/80 dark:border-stone-700/80">
                <span className="text-[10px] text-stone-400 block uppercase font-semibold">
                  Program Studi
                </span>
                <span className="text-xs font-semibold text-stone-800 dark:text-stone-200 mt-0.5 block">
                  Sejarah Peradaban Islam
                </span>
              </div>
            </div>

            {/* Action Contact Buttons */}
            <div className="flex items-center gap-3 w-full pt-2">
              {selectedStudent.whatsapp && (
                <a
                  href={`https://wa.me/${selectedStudent.whatsapp.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs transition-colors"
                >
                  <Phone className="w-4 h-4" />
                  <span>Kirim WhatsApp</span>
                </a>
              )}
              {selectedStudent.instagram && (
                <a
                  href={`https://instagram.com/${selectedStudent.instagram.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold shadow-xs hover:opacity-95 transition-opacity"
                >
                  <Instagram className="w-4 h-4" />
                  <span>Instagram</span>
                </a>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* Modal Add / Edit Student */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingStudent ? 'Edit Data Mahasiswa' : 'Tambah Mahasiswa'}
        subtitle="Data akan tersimpan permanen di cloud Firestore"
      >
        <form onSubmit={handleSave} className="space-y-4">
          
          {/* Photo Upload & Preview */}
          <div className="flex items-center gap-4 p-3 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700">
            <Avatar
              name={formData.name || 'SPI'}
              photoUrl={previewPhotoUrl}
              size="lg"
              shape="square"
            />
            <div className="space-y-1.5 flex-1">
              <span className="text-xs font-bold text-stone-800 dark:text-stone-200 block">
                Foto Profil Mahasiswa
              </span>
              <p className="text-[11px] text-stone-400">
                Otomatis di-crop rasio 1:1 square, resize 300x300, dan dikompresi.
              </p>
              <div className="flex items-center gap-2">
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
                  className="px-3 py-1.5 rounded-lg bg-emerald-800 text-white text-[11px] font-semibold hover:bg-emerald-900 transition-colors flex items-center gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{uploadingPhoto ? 'Memproses...' : 'Pilih Foto'}</span>
                </button>
                {previewPhotoUrl && (
                  <button
                    type="button"
                    onClick={() => {
                      setPreviewPhotoUrl('');
                      setFormData((p) => ({ ...p, photoUrl: '' }));
                    }}
                    className="px-2 py-1.5 rounded-lg text-stone-500 hover:text-red-600 text-[11px]"
                  >
                    Hapus Foto
                  </button>
                )}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
              Nama Lengkap Mahasiswa *
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Muhammad Ritfiq Pradanu"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
              Nomor Induk Mahasiswa (NIM) *
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: 2661310019"
              value={formData.nim}
              onChange={(e) => setFormData({ ...formData, nim: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 font-mono"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                Tanggal Lahir (YYYY-MM-DD)
              </label>
              <input
                type="date"
                value={formData.birthDate || ''}
                onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                WhatsApp (awali 62)
              </label>
              <input
                type="text"
                placeholder="628123456789"
                value={formData.whatsapp || ''}
                onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
              Username Instagram
            </label>
            <input
              type="text"
              placeholder="Contoh: ritfiqpradanu (tanpa @)"
              value={formData.instagram || ''}
              onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
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
              disabled={uploadingPhoto}
              className="px-5 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold shadow-md transition-colors"
            >
              {editingStudent ? 'Simpan Perubahan' : 'Tambah Mahasiswa'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Hapus Mahasiswa"
        message={`Apakah Anda yakin ingin menghapus mahasiswa "${deleteTarget?.name}" (NIM: ${deleteTarget?.nim}) dari direktori kelas?`}
        confirmText="Hapus Mahasiswa"
      />
    </div>
  );
};
