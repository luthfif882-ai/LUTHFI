import { Student, Schedule, ClassStructure, Announcement, Assignment, CashTransaction } from '../types';

export const INITIAL_STUDENTS: Omit<Student, 'id'>[] = [
  { name: 'Muhammad Ritfiq Pradanu', nim: '2661310019', birthDate: '2005-03-14', whatsapp: '6281234567801', instagram: 'ritfiqpradanu' },
  { name: 'Shafi Hanifah', nim: '2661310016', birthDate: '2005-08-20', whatsapp: '6281234567802', instagram: 'shafihanifah' },
  { name: 'Faza Fauzan Adhima', nim: '2661310021', birthDate: '2005-11-05', whatsapp: '6281234567803', instagram: 'fazafauzan' },
  { name: 'Dewi Sarikit Indriyana', nim: '2661310003', birthDate: '2005-06-12', whatsapp: '6281234567804', instagram: 'dewisarikit' },
  { name: 'Isna Haulatunnisa', nim: '2661310014', birthDate: '2005-09-28', whatsapp: '6281234567805', instagram: 'isnahaula' },
  { name: 'Ahmad Kurniawan', nim: '2661310007', birthDate: '2005-04-18', whatsapp: '6281234567806', instagram: 'ahmad_kurniawan' },
  { name: 'Aprilia Nurul Aini', nim: '2661310001', birthDate: '2005-04-09', whatsapp: '6281234567807', instagram: 'aprilianurul' },
  { name: 'Lalita Ra\'if Nariswari', nim: '2661310002', birthDate: '2005-07-22', whatsapp: '6281234567808', instagram: 'lalitanariswari' },
  { name: 'Luthfi Fadhil Prayuda', nim: '2661310004', birthDate: '2005-10-02', whatsapp: '6281234567809', instagram: 'luthfifadhil' },
  { name: 'Dito Akhir Novelindo', nim: '2661310005', birthDate: '2005-12-15', whatsapp: '6281234567810', instagram: 'ditoakhir' },
  { name: 'Rara Alfiana', nim: '2661310006', birthDate: '2005-01-30', whatsapp: '6281234567811', instagram: 'raraalfiana' },
  { name: 'Ega Mawarni', nim: '2661310008', birthDate: '2005-05-14', whatsapp: '6281234567812', instagram: 'egamawarni' },
  { name: 'Diva Mulia Ardana Putra', nim: '2661310009', birthDate: '2005-02-19', whatsapp: '6281234567813', instagram: 'divamulia' },
  { name: 'Naufal Aly Ramadhani', nim: '2661310010', birthDate: '2005-10-25', whatsapp: '6281234567814', instagram: 'naufalaly' },
  { name: 'Muhammad Fauzan', nim: '2661310011', birthDate: '2005-03-08', whatsapp: '6281234567815', instagram: 'fauzan_m' },
  { name: 'Anggi Sentikasari', nim: '2661310012', birthDate: '2005-07-04', whatsapp: '6281234567816', instagram: 'anggisentika' },
  { name: 'Salsabila Khoirunnisa Azizah', nim: '2661310013', birthDate: '2005-09-17', whatsapp: '6281234567817', instagram: 'salsabilakh' },
  { name: 'Azellyansyah Ridho Al Fairus', nim: '2661310015', birthDate: '2005-11-20', whatsapp: '6281234567818', instagram: 'azellyansyah' },
  { name: 'Bilal Najmuddin As-Shobir', nim: '2661310017', birthDate: '2005-06-30', whatsapp: '6281234567819', instagram: 'bilalshobir' },
  { name: 'Qoonitah', nim: '2661310018', birthDate: '2005-08-11', whatsapp: '6281234567820', instagram: 'qoonitah' },
  { name: 'Iqbal Dwi Putranto', nim: '2661310020', birthDate: '2005-05-23', whatsapp: '6281234567821', instagram: 'iqbaldwi' },
  { name: 'Hafidh Putra Argiansyah', nim: '2661310022', birthDate: '2005-02-02', whatsapp: '6281234567822', instagram: 'hafidhputra' },
  { name: 'Yahya Haidar', nim: '2661310023', birthDate: '2005-12-04', whatsapp: '6281234567823', instagram: 'yahyahaidar' },
];

export const INITIAL_SCHEDULES: Omit<Schedule, 'id'>[] = [
  {
    day: 'Senin',
    startTime: '07:00',
    endTime: '08:40',
    courseName: "Ulumul Qur'an",
    room: 'FAB-P.3.4',
    lecturer: 'Hamdan Maghribi',
    sks: 2
  },
  {
    day: 'Senin',
    startTime: '10:20',
    endTime: '12:00',
    courseName: 'Pengantar Ilmu Sejarah',
    room: 'FAB-E.2.3',
    lecturer: 'Nor Huda',
    sks: 2
  },
  {
    day: 'Selasa',
    startTime: '08:40',
    endTime: '10:20',
    courseName: 'Ilmu Kalam',
    room: 'FAB-E.1.3',
    lecturer: 'Aly Mashar',
    sks: 2
  },
  {
    day: 'Selasa',
    startTime: '10:20',
    endTime: '12:00',
    courseName: 'Islam dan Budaya Jawa',
    room: 'FAB-P.3.8',
    lecturer: 'Muh Fajar Shodiq',
    sks: 2
  },
  {
    day: 'Selasa',
    startTime: '14:40',
    endTime: '16:20',
    courseName: 'Pendidikan Kewarganegaraan',
    room: 'FAB-E.2.3',
    lecturer: 'Moh Ashif Fuadi',
    sks: 2
  },
  {
    day: 'Rabu',
    startTime: '08:40',
    endTime: '10:20',
    courseName: 'Ulumul Hadis',
    room: 'FAB-E.2.3',
    lecturer: 'Lukmanul Khakim',
    sks: 2
  },
  {
    day: 'Rabu',
    startTime: '13:00',
    endTime: '14:40',
    courseName: 'Bahasa Indonesia',
    room: 'FAB-P.3.4',
    lecturer: 'Dwi Kurniasih',
    sks: 2
  },
  {
    day: 'Rabu',
    startTime: '14:40',
    endTime: '16:20',
    courseName: 'Pancasila',
    room: 'FAB-E.1.4',
    lecturer: 'Mokhammad Fadhil',
    sks: 2
  },
  {
    day: 'Jumat',
    startTime: '08:40',
    endTime: '10:20',
    courseName: 'Sejarah Peradaban Islam',
    room: 'FAB-P.2.6',
    lecturer: 'Moh Mahbub',
    sks: 2
  },
  {
    day: 'Jumat',
    startTime: '13:00',
    endTime: '14:40',
    courseName: 'Ilmu Fikih',
    room: 'FAB-E.2.1',
    lecturer: 'Rahmad Setyawan',
    sks: 2
  }
];

export const INITIAL_STRUCTURE: Omit<ClassStructure, 'id'>[] = [
  {
    role: 'Ketua Kelas (Komting)',
    name: 'Muhammad Ritfiq Pradanu',
    description: 'Mengkoordinasi seluruh kegiatan akademik dan non-akademik kelas SPI 1A serta narahubung dosen.',
    order: 1
  },
  {
    role: 'Wakil Ketua Kelas',
    name: 'Faza Fauzan Adhima',
    description: 'Mendampingi ketua kelas dan bertanggung jawab atas kelancaran komunikasi antar mahasiswa.',
    order: 2
  },
  {
    role: 'Sekretaris',
    name: 'Shafi Hanifah',
    description: 'Mengelola administrasi kelas, presensi perkuliahan, dan pengarsipan materi dosen.',
    order: 3
  },
  {
    role: 'Bendahara',
    name: 'Dewi Sarikit Indriyana',
    description: 'Mengelola keuangan kas kelas, pencatatan iuran bulanan, dan transparansi laporan kas.',
    order: 4
  }
];

export const INITIAL_ANNOUNCEMENTS: Omit<Announcement, 'id'>[] = [
  {
    title: 'Selamat Datang di Portal Resmi Kelas SPI 1A UIN Surakarta',
    content: 'Ahlan wa sahlan rekan-rekan mahasiswa Sejarah Peradaban Islam Semester 1. Aplikasi ini digunakan untuk memantau jadwal kuliah, tugas, kas, data mahasiswa, dan pengumuman penting lainnya. Mari kita jaga kekompakan!',
    author: 'Pengurus Kelas SPI 1A',
    isPinned: true,
    createdAt: new Date().toISOString()
  },
  {
    title: 'Pengumpulan Makalah Kelompok Sejarah Peradaban Islam',
    content: 'Dosen pengampu Bapak Moh Mahbub mengingatkan bahwa batas pengumpulan draft makalah Bab Daulah Umayyah dikumpulkan pada pertemuan ke-6 dalam format cetak dan softcopy.',
    author: 'Komting Ritfiq',
    isPinned: false,
    createdAt: new Date().toISOString()
  }
];

export const INITIAL_ASSIGNMENTS: Omit<Assignment, 'id'>[] = [
  {
    title: 'Resume Kitab Ulumul Quran Bab Asbabun Nuzul',
    subject: "Ulumul Qur'an",
    description: 'Membuat ringkasan 2 halaman A4 dengan referensi minimal 2 literatur pendukung. Diketik rapi font Times New Roman 12 spasi 1.5.',
    deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'Sedang dikerjakan',
    createdBy: 'Hamdan Maghribi'
  },
  {
    title: 'Analisis Historiografi Islam Klasik',
    subject: 'Pengantar Ilmu Sejarah',
    description: 'Analisis perbandingan metodologi penulisan sejarah antara Ath-Thabari dan Ibnu Khaldun.',
    deadline: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'Belum dikerjakan',
    createdBy: 'Nor Huda'
  }
];

export const INITIAL_TRANSACTIONS: Omit<CashTransaction, 'id'>[] = [
  {
    date: new Date().toISOString().split('T')[0],
    description: 'Kas awal semester ganjil (Iuran Mahasiswa)',
    amount: 230000,
    type: 'income',
    createdBy: 'Bendahara Dewi'
  },
  {
    date: new Date().toISOString().split('T')[0],
    description: 'Pembelian Spidol & Penghapus Whiteboard Kelas',
    amount: 35000,
    type: 'expense',
    createdBy: 'Bendahara Dewi'
  }
];

export const DEFAULT_CLASS_SETTINGS = {
  className: 'SPI 1A',
  department: 'Sejarah Peradaban Islam',
  semester: 'Semester 1',
  campus: 'UIN Raden Mas Said Surakarta',
  faculty: 'Fakultas Adab dan Bahasa',
  motto: 'Meneladani sejarah, menegakkan peradaban, menggapai masa depan berlandaskan akhlak mulia dan kecendekiaan Islam.',
  defaultMonthlyFee: 10000,
  paymentDueDay: 10,
  activePeriod: 'Oktober 2026',
  availablePeriods: ['September 2026', 'Oktober 2026', 'November 2026', 'Desember 2026', 'Januari 2027'],
  contactPerson: 'Muhammad Ritfiq Pradanu (Komting) - 081234567801'
};
