export type UserRole = 'admin' | 'member';

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  nim?: string;
  photoUrl?: string;
  birthDate?: string; // Format: YYYY-MM-DD
  whatsapp?: string;
  instagram?: string;
  bio?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ClassSettings {
  className: string;
  department: string;
  semester: string;
  campus: string;
  faculty: string;
  motto: string;
  defaultMonthlyFee: number;
  paymentDueDay: number;
  activePeriod: string;
  availablePeriods: string[];
  contactPerson: string;
  updatedAt?: string;
}

export interface Student {
  id: string;
  name: string;
  nim: string;
  photoUrl?: string;
  whatsapp?: string;
  instagram?: string;
  birthDate?: string; // Format: YYYY-MM-DD
  createdAt?: string;
  updatedAt?: string;
}

export type DayOfWeek = 'Senin' | 'Selasa' | 'Rabu' | 'Kamis' | 'Jumat' | 'Sabtu' | 'Minggu';

export interface Schedule {
  id: string;
  day: DayOfWeek;
  startTime: string; // e.g. "07:00"
  endTime: string;   // e.g. "08:40"
  courseName: string;
  room: string;
  lecturer: string;
  sks: number;
  createdAt?: string;
  updatedAt?: string;
}

export type AssignmentStatus = 'Belum dikerjakan' | 'Sedang dikerjakan' | 'Selesai';

export interface Assignment {
  id: string;
  title: string;
  subject: string;
  description: string;
  deadline: string; // ISO string e.g. "2026-10-15T23:59"
  status: AssignmentStatus;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  author: string;
  authorId?: string;
  isPinned: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export type TransactionType = 'income' | 'expense';

export interface CashTransaction {
  id: string;
  date: string; // YYYY-MM-DD
  description: string;
  amount: number;
  type: TransactionType;
  createdBy?: string;
  createdAt?: string;
}

export interface CashPayment {
  id: string;
  studentId: string;
  studentName: string;
  studentNim: string;
  period: string; // e.g. "Oktober 2026"
  amount: number;
  isPaid: boolean;
  paidAt?: string;
  updatedAt?: string;
}

export interface Memory {
  id: string;
  title: string;
  caption?: string;
  date: string;
  album: string;
  imageUrl: string;
  createdBy?: string;
  createdAt?: string;
}

export interface BirthdayMessage {
  id: string;
  recipientStudentId: string;
  senderUid: string;
  senderName: string;
  message: string;
  createdAt: string;
  updatedAt?: string;
}

export interface ClassStructure {
  id: string;
  role: string; // "Ketua Kelas", "Wakil Ketua", "Sekretaris", "Bendahara"
  name: string;
  photoUrl?: string;
  description?: string;
  order: number;
  updatedAt?: string;
}

export interface MessageWall {
  id: string;
  senderUid: string;
  senderName: string;
  message: string;
  createdAt: string;
}

export type SyncStatus = 'synced' | 'saving' | 'offline';

export type ActiveTab = 
  | 'beranda'
  | 'jadwal'
  | 'mahasiswa'
  | 'tugas'
  | 'lainnya'
  | 'ulang-tahun'
  | 'kas'
  | 'pengumuman'
  | 'dokumentasi'
  | 'struktur'
  | 'wall'
  | 'admin-panel'
  | 'pengaturan';
