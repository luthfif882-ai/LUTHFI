import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { ClassStructure } from '../types';
import { Modal } from '../components/common/Modal';
import { Avatar } from '../components/common/Avatar';
import { Network, Edit3, Shield, Award, Users } from 'lucide-react';

export const StrukturPage: React.FC = () => {
  const { isAdmin } = useAuth();
  const { structure, updateStructureItem, classSettings } = useData();

  const [editingItem, setEditingItem] = useState<ClassStructure | null>(null);
  const [formData, setFormData] = useState<Partial<ClassStructure>>({
    role: '',
    name: '',
    description: '',
    photoUrl: ''
  });

  const handleOpenEdit = (item: ClassStructure) => {
    setEditingItem(item);
    setFormData({
      role: item.role,
      name: item.name,
      description: item.description,
      photoUrl: item.photoUrl || ''
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem || !formData.name?.trim()) return;

    await updateStructureItem(editingItem.id, formData);
    setEditingItem(null);
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold font-serif-title text-stone-900 dark:text-stone-100 flex items-center gap-2.5">
          <Network className="w-7 h-7 text-purple-600" />
          <span>Struktur Kepengurusan Kelas</span>
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1">
          Pengurus Harian Kelas Sejarah Peradaban Islam (SPI) 1A Masa Bakti Semester 1
        </p>
      </div>

      {/* Leadership Hierarchy Tree Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {structure.map((officer) => (
          <div
            key={officer.id}
            className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm flex flex-col justify-between hover:border-emerald-600/40 hover:shadow-md transition-all text-center relative group"
          >
            {isAdmin && (
              <button
                onClick={() => handleOpenEdit(officer)}
                className="absolute top-4 right-4 p-1.5 rounded-lg text-stone-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950 transition-colors"
                title="Edit pejabat kelas"
              >
                <Edit3 className="w-4 h-4" />
              </button>
            )}

            <div className="flex flex-col items-center">
              <div className="mb-4 relative">
                <Avatar
                  name={officer.name}
                  photoUrl={officer.photoUrl}
                  size="xl"
                  shape="square"
                  className="shadow-md"
                />
                <div className="absolute -bottom-2 px-3 py-0.5 rounded-full bg-emerald-800 text-amber-300 text-[10px] font-bold uppercase tracking-wider shadow-xs border border-amber-400/30">
                  Amanah
                </div>
              </div>

              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 mt-1">
                {officer.role}
              </span>

              <h2 className="text-base sm:text-lg font-bold font-serif-title text-stone-900 dark:text-stone-100 mt-1">
                {officer.name}
              </h2>

              <p className="text-xs text-stone-500 dark:text-stone-400 mt-2 leading-relaxed">
                {officer.description || 'Pengurus harian kelas SPI 1A.'}
              </p>
            </div>

            <div className="mt-5 pt-3 border-t border-stone-100 dark:border-stone-800 text-[11px] text-stone-400">
              UIN Raden Mas Said Surakarta
            </div>
          </div>
        ))}
      </div>

      {/* Organizational Guidelines Notice */}
      <div className="p-6 rounded-3xl bg-emerald-950 text-white border border-emerald-800 flex flex-col sm:flex-row items-center gap-5">
        <div className="w-12 h-12 rounded-2xl bg-amber-400/20 text-amber-300 flex items-center justify-center shrink-0">
          <Award className="w-6 h-6" />
        </div>
        <div className="space-y-1 text-center sm:text-left">
          <h3 className="font-bold font-serif-title text-base text-amber-200">
            Semboyan & Komitmen Kelas {classSettings.className}
          </h3>
          <p className="text-xs text-emerald-200/90 leading-relaxed max-w-3xl">
            "{classSettings.motto}"
          </p>
        </div>
      </div>

      {/* Edit Structure Modal */}
      {editingItem && (
        <Modal
          isOpen={!!editingItem}
          onClose={() => setEditingItem(null)}
          title="Edit Pejabat Kelas"
          subtitle={editingItem.role}
        >
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                Nama Jabatan
              </label>
              <input
                type="text"
                required
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                Nama Mahasiswa
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                Tugas / Deskripsi Singkat
              </label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-100 dark:border-stone-800">
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="px-4 py-2.5 rounded-xl text-xs font-medium text-stone-600 dark:text-stone-400 hover:bg-stone-100"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold shadow-md transition-colors"
              >
                Simpan Perubahan
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
