import React, { useState, useRef, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { Avatar } from '../common/Avatar';
import { compressAndCropSquare, uploadImageToStorage } from '../../utils/imageCompressor';
import { 
  Camera, 
  Upload, 
  Trash2, 
  Sparkles, 
  Calendar, 
  User, 
  Phone, 
  Instagram, 
  Check, 
  Link as LinkIcon,
  Smile,
  ShieldCheck
} from 'lucide-react';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AVATAR_PRESETS = [
  { id: 'av1', label: 'Mahasiswa 1', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&h=300&q=80' },
  { id: 'av2', label: 'Mahasiswa 2', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&h=300&q=80' },
  { id: 'av3', label: 'Mahasiswi 1', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&h=300&q=80' },
  { id: 'av4', label: 'Mahasiswa 3', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&h=300&q=80' },
  { id: 'av5', label: 'Mahasiswi 2', url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=300&h=300&q=80' },
  { id: 'av6', label: 'Mahasiswa 4', url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=300&h=300&q=80' },
  { id: 'av7', label: 'Mahasiswi 3', url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&h=300&q=80' },
  { id: 'av8', label: 'Mahasiswa 5', url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=300&h=300&q=80' }
];

export const EditProfileModal: React.FC<EditProfileModalProps> = ({ isOpen, onClose }) => {
  const { userProfile, updateMyProfile, isAdmin } = useAuth();
  const { students, updateStudent, showToast } = useData();

  const [name, setName] = useState(userProfile?.name || '');
  const [nim, setNim] = useState(userProfile?.nim || '');
  const [birthDate, setBirthDate] = useState(userProfile?.birthDate || '');
  const [photoUrl, setPhotoUrl] = useState(userProfile?.photoUrl || '');
  const [whatsapp, setWhatsapp] = useState(userProfile?.whatsapp || '');
  const [instagram, setInstagram] = useState(userProfile?.instagram || '');
  const [bio, setBio] = useState(userProfile?.bio || '');
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showPresets, setShowPresets] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (userProfile && isOpen) {
      setName(userProfile.name || '');
      setNim(userProfile.nim || '');
      setBirthDate(userProfile.birthDate || '');
      setPhotoUrl(userProfile.photoUrl || '');
      setWhatsapp(userProfile.whatsapp || '');
      setInstagram(userProfile.instagram || '');
      setBio(userProfile.bio || '');
    }
  }, [userProfile, isOpen]);

  // If user selects a student NIM from list, auto-fill from that student
  const handleSelectStudentNim = (selectedNim: string) => {
    setNim(selectedNim);
    const matched = students.find((s) => s.nim === selectedNim);
    if (matched) {
      if (!name || name === 'Mahasiswa SPI 1A') setName(matched.name);
      if (matched.birthDate && !birthDate) setBirthDate(matched.birthDate);
      if (matched.whatsapp && !whatsapp) setWhatsapp(matched.whatsapp);
      if (matched.instagram && !instagram) setInstagram(matched.instagram);
      if (matched.photoUrl && !photoUrl) setPhotoUrl(matched.photoUrl);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      // 1:1 crop square with 300px resolution
      const compressedBlob = await compressAndCropSquare(file, 300, 0.75);
      
      const fileExt = 'jpg';
      const storagePath = `avatars/user_${userProfile?.uid || 'guest'}_${Date.now()}.${fileExt}`;
      
      try {
        const uploadedUrl = await uploadImageToStorage(compressedBlob, storagePath);
        setPhotoUrl(uploadedUrl);
        showToast('Foto profil berhasil diunggah! 📸', 'success');
      } catch (storageErr) {
        // Fallback to data URL base64 if Firebase storage is offline or denied
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64Data = reader.result as string;
          setPhotoUrl(base64Data);
          showToast('Foto profil siap digunakan (pratinjau lokal)', 'info');
        };
        reader.readAsDataURL(compressedBlob);
      }
    } catch (err) {
      console.error('Error handling profile photo:', err);
      showToast('Gagal memproses foto profil', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Nama tidak boleh kosong', 'warning');
      return;
    }

    try {
      setIsSaving(true);
      const updatedProfileData = {
        name: name.trim(),
        nim: nim.trim() || undefined,
        birthDate: birthDate || undefined,
        photoUrl: photoUrl || undefined,
        whatsapp: whatsapp.trim() || undefined,
        instagram: instagram.trim().replace(/^@/, '') || undefined,
        bio: bio.trim() || undefined
      };

      await updateMyProfile(updatedProfileData);

      // If user is linked to a student NIM, also update that student's record
      if (nim.trim()) {
        const studentRecord = students.find((s) => s.nim === nim.trim());
        if (studentRecord) {
          await updateStudent(studentRecord.id, {
            name: name.trim(),
            birthDate: birthDate || studentRecord.birthDate,
            photoUrl: photoUrl || studentRecord.photoUrl,
            whatsapp: whatsapp.trim() || studentRecord.whatsapp,
            instagram: instagram.trim().replace(/^@/, '') || studentRecord.instagram
          });
        }
      }

      showToast('Profil dan ulang tahun berhasil diperbarui! 🎉', 'success');
      onClose();
    } catch (err) {
      console.error('Error saving profile:', err);
      showToast('Gagal menyimpan profil', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Format birthDate string to Indonesian readable
  const getFormattedBirthDate = (val: string) => {
    if (!val) return '';
    try {
      const [y, m, d] = val.split('-').map(Number);
      const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
      return `${d} ${months[m - 1]} ${y}`;
    } catch {
      return val;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Profil & Ulang Tahun"
      subtitle="Atur foto profil, tanggal lahir/milad, kontak, dan biodata diri"
      maxWidth="lg"
    >
      <form onSubmit={handleSave} className="space-y-5 max-h-[80vh] overflow-y-auto pr-1">
        
        {/* Photo Profile Section */}
        <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200/80 dark:border-stone-700/80">
          <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-3">
            Foto Profil
          </label>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="relative group shrink-0">
              <Avatar
                name={name || 'Mahasiswa'}
                photoUrl={photoUrl}
                size="xl"
                shape="square"
                className="ring-4 ring-emerald-600/20 shadow-md"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="absolute inset-0 bg-black/40 rounded-3xl opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white transition-opacity cursor-pointer"
                title="Ganti Foto"
              >
                <Camera className="w-6 h-6" />
                <span className="text-[10px] font-semibold mt-1">Ubah Foto</span>
              </button>
            </div>

            <div className="space-y-2 text-center sm:text-left flex-1 w-full">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{isUploading ? 'Memproses...' : 'Upload dari HP / Laptop'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowPresets(!showPresets)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-200 dark:bg-stone-700 hover:bg-stone-300 dark:hover:bg-stone-600 text-stone-700 dark:text-stone-200 text-xs font-semibold transition-colors cursor-pointer"
                >
                  <Smile className="w-3.5 h-3.5 text-amber-500" />
                  <span>Pilih Avatar</span>
                </button>

                {photoUrl && (
                  <button
                    type="button"
                    onClick={() => setPhotoUrl('')}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Hapus</span>
                  </button>
                )}
              </div>

              <p className="text-[11px] text-stone-400">
                Format: JPG, PNG. Foto akan otomatis dipotong 1:1 dan dikompres agar hemat kuota.
              </p>
            </div>
          </div>

          {/* Preset Avatars Drawer */}
          {showPresets && (
            <div className="mt-4 pt-3 border-t border-stone-200 dark:border-stone-700 animate-fadeIn">
              <p className="text-[11px] font-bold text-stone-600 dark:text-stone-400 mb-2">
                Pilih Avatar Siap Pakai:
              </p>
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                {AVATAR_PRESETS.map((av) => (
                  <button
                    key={av.id}
                    type="button"
                    onClick={() => {
                      setPhotoUrl(av.url);
                      setShowPresets(false);
                    }}
                    className={`relative rounded-xl overflow-hidden aspect-square border-2 transition-all hover:scale-105 ${
                      photoUrl === av.url ? 'border-emerald-600 ring-2 ring-emerald-500/30' : 'border-stone-200 dark:border-stone-700'
                    }`}
                  >
                    <img src={av.url} alt={av.label} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Custom Photo URL Input */}
          <div className="mt-3">
            <input
              type="url"
              placeholder="Atau tempel link URL foto (https://...)"
              value={photoUrl.startsWith('data:') ? '' : photoUrl}
              onChange={(e) => setPhotoUrl(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-200 placeholder:text-stone-400"
            />
          </div>
        </div>

        {/* Tanggal Lahir / Hari Ulang Tahun */}
        <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-800/40 space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-stone-800 dark:text-stone-200 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-amber-600" />
              <span>Hari Ulang Tahun / Milad *</span>
            </label>
            {birthDate && (
              <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/80 px-2 py-0.5 rounded-md">
                🎂 {getFormattedBirthDate(birthDate)}
              </span>
            )}
          </div>
          
          <input
            type="date"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
          />
          <p className="text-[11px] text-stone-500 dark:text-stone-400">
            Tanggal lahir ini akan memunculkan banner ucapan milad dan doa di Beranda ketika hari ulang tahun tiba!
          </p>
        </div>

        {/* Nama Lengkap & NIM */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
              Nama Lengkap *
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
              <input
                type="text"
                required
                placeholder="Nama Anda"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl text-xs bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1 flex items-center justify-between">
              <span>NIM Mahasiswa</span>
              <span className="text-[10px] font-normal text-stone-400">Hubungkan data</span>
            </label>
            <div className="relative">
              <LinkIcon className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Contoh: 2661310004"
                value={nim}
                onChange={(e) => handleSelectStudentNim(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl text-xs bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-emerald-600 focus:outline-hidden font-mono"
              />
            </div>
          </div>
        </div>

        {/* Quick select student by name dropdown */}
        <div>
          <label className="block text-[11px] font-medium text-stone-500 dark:text-stone-400 mb-1">
            Pilih dari daftar anggota kelas SPI 1A untuk auto-sinkronisasi:
          </label>
          <select
            value={nim}
            onChange={(e) => handleSelectStudentNim(e.target.value)}
            className="w-full px-3 py-2 rounded-xl text-xs bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-200"
          >
            <option value="">-- Pilih Mahasiswa SPI 1A --</option>
            {students.map((s) => (
              <option key={s.id} value={s.nim}>
                {s.name} ({s.nim})
              </option>
            ))}
          </select>
        </div>

        {/* WhatsApp & Instagram */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
              Nomor WhatsApp
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-emerald-600 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Contoh: 628123456789"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl text-xs bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
              Akun Instagram
            </label>
            <div className="relative">
              <Instagram className="w-4 h-4 text-pink-500 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="username (tanpa @)"
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl text-xs bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100"
              />
            </div>
          </div>
        </div>

        {/* Bio / Pesan Singkat */}
        <div>
          <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
            Bio Singkat / Motto
          </label>
          <textarea
            rows={2}
            placeholder="Contoh: Mahasiswa Sejarah Peradaban Islam Semester 1..."
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100"
          />
        </div>

        {/* Action Buttons */}
        <div className="pt-4 border-t border-stone-100 dark:border-stone-800 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
          >
            Batal
          </button>

          <button
            type="submit"
            disabled={isSaving || isUploading}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold shadow-md transition-all cursor-pointer disabled:opacity-50"
          >
            <Check className="w-4 h-4" />
            <span>{isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
