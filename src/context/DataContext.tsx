import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import {
  collection,
  onSnapshot,
  doc,
  setDoc,
  deleteDoc,
  updateDoc,
  getDocs,
  writeBatch
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase/config';
import { useAuth } from './AuthContext';
import {
  Student,
  Schedule,
  Assignment,
  Announcement,
  CashTransaction,
  CashPayment,
  Memory,
  ClassStructure,
  MessageWall,
  BirthdayMessage,
  ClassSettings
} from '../types';
import {
  INITIAL_STUDENTS,
  INITIAL_SCHEDULES,
  INITIAL_STRUCTURE,
  INITIAL_ANNOUNCEMENTS,
  INITIAL_ASSIGNMENTS,
  INITIAL_TRANSACTIONS,
  DEFAULT_CLASS_SETTINGS
} from '../data/initialData';
import { downloadBackupJSON, BackupData } from '../utils/backupExport';

interface ToastNotification {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

interface DataContextType {
  students: Student[];
  schedules: Schedule[];
  assignments: Assignment[];
  announcements: Announcement[];
  transactions: CashTransaction[];
  payments: CashPayment[];
  memories: Memory[];
  structure: ClassStructure[];
  wallMessages: MessageWall[];
  birthdayMessages: BirthdayMessage[];
  isLoading: boolean;
  toasts: ToastNotification[];
  dismissToast: (id: string) => void;
  showToast: (message: string, type?: ToastNotification['type']) => void;

  // Student CRUD
  addStudent: (data: Omit<Student, 'id'>) => Promise<string>;
  updateStudent: (id: string, data: Partial<Student>) => Promise<void>;
  deleteStudent: (id: string) => Promise<void>;

  // Schedule CRUD
  addSchedule: (data: Omit<Schedule, 'id'>) => Promise<string>;
  updateSchedule: (id: string, data: Partial<Schedule>) => Promise<void>;
  deleteSchedule: (id: string) => Promise<void>;

  // Assignment CRUD
  addAssignment: (data: Omit<Assignment, 'id'>) => Promise<string>;
  updateAssignment: (id: string, data: Partial<Assignment>) => Promise<void>;
  deleteAssignment: (id: string) => Promise<void>;

  // Announcement CRUD
  addAnnouncement: (data: Omit<Announcement, 'id'>) => Promise<string>;
  updateAnnouncement: (id: string, data: Partial<Announcement>) => Promise<void>;
  deleteAnnouncement: (id: string) => Promise<void>;
  togglePinAnnouncement: (id: string, currentPin: boolean) => Promise<void>;

  // Cash Management
  addCashTransaction: (data: Omit<CashTransaction, 'id'>) => Promise<string>;
  updateCashTransaction: (id: string, data: Partial<CashTransaction>) => Promise<void>;
  deleteCashTransaction: (id: string) => Promise<void>;
  toggleStudentPayment: (paymentId: string, currentStatus: boolean, studentId: string, studentName: string, studentNim: string, period: string, amount: number, customPaidAt?: string) => Promise<void>;

  // Class Settings
  classSettings: ClassSettings;
  updateClassSettings: (settings: Partial<ClassSettings>) => Promise<void>;

  // Memories
  addMemory: (data: Omit<Memory, 'id'>) => Promise<string>;
  deleteMemory: (id: string) => Promise<void>;

  // Structure
  updateStructureItem: (id: string, data: Partial<ClassStructure>) => Promise<void>;

  // Wall
  addWallMessage: (message: string) => Promise<string>;
  deleteWallMessage: (id: string) => Promise<void>;

  // Birthday Wishes
  addBirthdayMessage: (recipientStudentId: string, message: string) => Promise<string>;
  updateBirthdayMessage: (id: string, newMessage: string) => Promise<void>;
  deleteBirthdayMessage: (id: string) => Promise<void>;

  // Backup & Restore
  exportAllData: () => void;
  importBackup: (backup: BackupData) => Promise<{ success: boolean; message: string }>;
  seedInitialDataIfEmpty: () => Promise<void>;
  restoreDefaultSchedules: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { userProfile, isAdmin, setSyncStatus } = useAuth();

  const [students, setStudents] = useState<Student[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [transactions, setTransactions] = useState<CashTransaction[]>([]);
  const [payments, setPayments] = useState<CashPayment[]>([]);
  const [memories, setMemories] = useState<Memory[]>([]);
  const [structure, setStructure] = useState<ClassStructure[]>([]);
  const [wallMessages, setWallMessages] = useState<MessageWall[]>([]);
  const [birthdayMessages, setBirthdayMessages] = useState<BirthdayMessage[]>([]);
  const [classSettings, setClassSettings] = useState<ClassSettings>(DEFAULT_CLASS_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);

  // Toast notification management
  const [toasts, setToasts] = useState<ToastNotification[]>([]);
  const initialLoadDone = useRef(false);

  const showToast = (message: string, type: ToastNotification['type'] = 'info') => {
    const id = Date.now().toString() + Math.random().toString().slice(2, 6);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      dismissToast(id);
    }, 4000);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Seed data function: runs ONLY if students collection is genuinely empty
  const seedInitialDataIfEmpty = async () => {
    try {
      const studentsSnap = await getDocs(collection(db, 'students'));
      if (studentsSnap.empty) {
        if (isAdmin) {
          console.log('Admin seeding initial class data for SPI 1A to Firestore...');
          setSyncStatus('saving');
          const batch = writeBatch(db);

          // Seed 23 Students
          INITIAL_STUDENTS.forEach((student, index) => {
            const docId = student.nim || `student_${index + 1}`;
            const ref = doc(db, 'students', docId);
            batch.set(ref, {
              ...student,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            });
          });

          // Seed 10 Schedules
          INITIAL_SCHEDULES.forEach((sched, index) => {
            const docId = `sched_${index + 1}`;
            const ref = doc(db, 'schedules', docId);
            batch.set(ref, {
              ...sched,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            });
          });

          // Seed Class Structure
          INITIAL_STRUCTURE.forEach((item, index) => {
            const docId = `struct_${index + 1}`;
            const ref = doc(db, 'class_structure', docId);
            batch.set(ref, {
              ...item,
              updatedAt: new Date().toISOString()
            });
          });

          // Seed Initial Announcements
          INITIAL_ANNOUNCEMENTS.forEach((ann, index) => {
            const docId = `ann_${index + 1}`;
            const ref = doc(db, 'announcements', docId);
            batch.set(ref, ann);
          });

          // Seed Initial Assignments
          INITIAL_ASSIGNMENTS.forEach((asg, index) => {
            const docId = `asg_${index + 1}`;
            const ref = doc(db, 'assignments', docId);
            batch.set(ref, {
              ...asg,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            });
          });

          // Seed Initial Cash Transactions
          INITIAL_TRANSACTIONS.forEach((tx, index) => {
            const docId = `tx_${index + 1}`;
            const ref = doc(db, 'cash_transactions', docId);
            batch.set(ref, {
              ...tx,
              createdAt: new Date().toISOString()
            });
          });

          // Seed Initial Payments for current month
          INITIAL_STUDENTS.forEach((student, index) => {
            const docId = `pay_${student.nim}_okt26`;
            const ref = doc(db, 'cash_payments', docId);
            const isPaid = index < 10;
            batch.set(ref, {
              studentId: student.nim,
              studentName: student.name,
              studentNim: student.nim,
              period: 'Oktober 2026',
              amount: 10000,
              isPaid: isPaid,
              paidAt: isPaid ? new Date().toISOString() : null,
              updatedAt: new Date().toISOString()
            });
          });

          await batch.commit();
          setSyncStatus('synced');
          showToast('Data awal kelas SPI 1A berhasil disiapkan 🎉', 'success');
        } else {
          // Unauthenticated or member: load initial data into state
          setStudents(INITIAL_STUDENTS.map((s, idx) => ({ ...s, id: s.nim || `student_${idx}` })));
          setSchedules(INITIAL_SCHEDULES.map((s, idx) => ({ ...s, id: `sched_${idx}` })));
          setStructure(INITIAL_STRUCTURE.map((s, idx) => ({ ...s, id: `struct_${idx}` })));
          setAnnouncements(INITIAL_ANNOUNCEMENTS.map((a, idx) => ({ ...a, id: `ann_${idx}` })));
          setAssignments(INITIAL_ASSIGNMENTS.map((a, idx) => ({ ...a, id: `asg_${idx}` })));
          setTransactions(INITIAL_TRANSACTIONS.map((t, idx) => ({ ...t, id: `tx_${idx}` })));
        }
      }
    } catch (err) {
      console.warn('Seeding check or execution skipped or handled locally:', err);
      if (students.length === 0) {
        setStudents(INITIAL_STUDENTS.map((s, idx) => ({ ...s, id: s.nim || `student_${idx}` })));
        setSchedules(INITIAL_SCHEDULES.map((s, idx) => ({ ...s, id: `sched_${idx}` })));
        setStructure(INITIAL_STRUCTURE.map((s, idx) => ({ ...s, id: `struct_${idx}` })));
        setAnnouncements(INITIAL_ANNOUNCEMENTS.map((a, idx) => ({ ...a, id: `ann_${idx}` })));
        setAssignments(INITIAL_ASSIGNMENTS.map((a, idx) => ({ ...a, id: `asg_${idx}` })));
        setTransactions(INITIAL_TRANSACTIONS.map((t, idx) => ({ ...t, id: `tx_${idx}` })));
      }
    }
  };

  // Realtime Listeners for all collections
  useEffect(() => {
    let unsubs: (() => void)[] = [];

    const subscribeToCollections = () => {
      try {
        // Students
        const unsubStudents = onSnapshot(
          collection(db, 'students'),
          (snapshot) => {
            if (snapshot.empty) {
              setStudents(INITIAL_STUDENTS.map((s, idx) => ({ ...s, id: s.nim || `student_${idx + 1}` })));
            } else {
              const list: Student[] = [];
              snapshot.forEach((d) => list.push({ id: d.id, ...d.data() } as Student));
              setStudents(list);
            }
            if (initialLoadDone.current && !snapshot.metadata.hasPendingWrites) {
              snapshot.docChanges().forEach((change) => {
                if (change.type === 'added') showToast(`Mahasiswa baru: ${change.doc.data().name}`, 'info');
              });
            }
          },
          (err) => {
            console.warn('students snapshot:', err);
            setStudents(INITIAL_STUDENTS.map((s, idx) => ({ ...s, id: s.nim || `student_${idx + 1}` })));
          }
        );
        unsubs.push(unsubStudents);

        // Schedules
        const unsubSchedules = onSnapshot(
          collection(db, 'schedules'),
          (snapshot) => {
            if (snapshot.empty) {
              setSchedules(INITIAL_SCHEDULES.map((s, idx) => ({ ...s, id: `sched_${idx + 1}` })));
              // Automatically write to Firestore if empty so all devices sync
              const batch = writeBatch(db);
              INITIAL_SCHEDULES.forEach((sched, index) => {
                const docId = `sched_${index + 1}`;
                const ref = doc(db, 'schedules', docId);
                batch.set(ref, {
                  ...sched,
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString()
                });
              });
              batch.commit().catch(() => {});
            } else {
              const list: Schedule[] = [];
              snapshot.forEach((d) => list.push({ id: d.id, ...d.data() } as Schedule));
              if (list.length === 0) {
                setSchedules(INITIAL_SCHEDULES.map((s, idx) => ({ ...s, id: `sched_${idx + 1}` })));
              } else {
                setSchedules(list);
              }
            }
            if (initialLoadDone.current && !snapshot.metadata.hasPendingWrites) {
              snapshot.docChanges().forEach((change) => {
                if (change.type === 'modified') showToast(`Jadwal diperbarui: ${change.doc.data().courseName}`, 'info');
              });
            }
          },
          (err) => {
            console.warn('schedules snapshot:', err);
            setSchedules(INITIAL_SCHEDULES.map((s, idx) => ({ ...s, id: `sched_${idx + 1}` })));
          }
        );
        unsubs.push(unsubSchedules);

        // Assignments
        const unsubAssignments = onSnapshot(
          collection(db, 'assignments'),
          (snapshot) => {
            if (snapshot.empty) {
              setAssignments(INITIAL_ASSIGNMENTS.map((a, idx) => ({ ...a, id: `asg_${idx + 1}` })));
            } else {
              const list: Assignment[] = [];
              snapshot.forEach((d) => list.push({ id: d.id, ...d.data() } as Assignment));
              setAssignments(list);
            }
          },
          (err) => {
            console.warn('assignments snapshot:', err);
            setAssignments(INITIAL_ASSIGNMENTS.map((a, idx) => ({ ...a, id: `asg_${idx + 1}` })));
          }
        );
        unsubs.push(unsubAssignments);

        // Announcements
        const unsubAnnouncements = onSnapshot(
          collection(db, 'announcements'),
          (snapshot) => {
            if (snapshot.empty) {
              setAnnouncements(INITIAL_ANNOUNCEMENTS.map((a, idx) => ({ ...a, id: `ann_${idx + 1}` })));
            } else {
              const list: Announcement[] = [];
              snapshot.forEach((d) => list.push({ id: d.id, ...d.data() } as Announcement));
              list.sort((a, b) => {
                if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
                return new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime();
              });
              setAnnouncements(list);
            }
            if (initialLoadDone.current && !snapshot.metadata.hasPendingWrites) {
              snapshot.docChanges().forEach((change) => {
                if (change.type === 'added') showToast(`Pengumuman baru: ${change.doc.data().title}`, 'info');
              });
            }
          },
          (err) => {
            console.warn('announcements snapshot:', err);
            setAnnouncements(INITIAL_ANNOUNCEMENTS.map((a, idx) => ({ ...a, id: `ann_${idx + 1}` })));
          }
        );
        unsubs.push(unsubAnnouncements);

        // Cash Transactions
        const unsubTransactions = onSnapshot(
          collection(db, 'cash_transactions'),
          (snapshot) => {
            if (snapshot.empty) {
              setTransactions(INITIAL_TRANSACTIONS.map((t, idx) => ({ ...t, id: `tx_${idx + 1}` })));
            } else {
              const list: CashTransaction[] = [];
              snapshot.forEach((d) => list.push({ id: d.id, ...d.data() } as CashTransaction));
              list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
              setTransactions(list);
            }
          },
          (err) => {
            console.warn('cash_transactions snapshot:', err);
            setTransactions(INITIAL_TRANSACTIONS.map((t, idx) => ({ ...t, id: `tx_${idx + 1}` })));
          }
        );
        unsubs.push(unsubTransactions);

        // Cash Payments
        const unsubPayments = onSnapshot(
          collection(db, 'cash_payments'),
          (snapshot) => {
            const list: CashPayment[] = [];
            snapshot.forEach((d) => list.push({ id: d.id, ...d.data() } as CashPayment));
            setPayments(list);
          },
          (err) => console.warn('cash_payments snapshot:', err)
        );
        unsubs.push(unsubPayments);

        // Memories
        const unsubMemories = onSnapshot(
          collection(db, 'memories'),
          (snapshot) => {
            const list: Memory[] = [];
            snapshot.forEach((d) => list.push({ id: d.id, ...d.data() } as Memory));
            list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            setMemories(list);
          },
          (err) => console.warn('memories snapshot:', err)
        );
        unsubs.push(unsubMemories);

        // Class Structure
        const unsubStructure = onSnapshot(
          collection(db, 'class_structure'),
          (snapshot) => {
            if (snapshot.empty) {
              setStructure(INITIAL_STRUCTURE.map((s, idx) => ({ ...s, id: `struct_${idx + 1}` })));
            } else {
              const list: ClassStructure[] = [];
              snapshot.forEach((d) => list.push({ id: d.id, ...d.data() } as ClassStructure));
              list.sort((a, b) => (a.order || 0) - (b.order || 0));
              setStructure(list);
            }
          },
          (err) => {
            console.warn('class_structure snapshot:', err);
            setStructure(INITIAL_STRUCTURE.map((s, idx) => ({ ...s, id: `struct_${idx + 1}` })));
          }
        );
        unsubs.push(unsubStructure);

        // Message Wall
        const unsubWall = onSnapshot(
          collection(db, 'messages_wall'),
          (snapshot) => {
            const list: MessageWall[] = [];
            snapshot.forEach((d) => list.push({ id: d.id, ...d.data() } as MessageWall));
            list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            setWallMessages(list);
          },
          (err) => handleFirestoreError(err, OperationType.GET, 'messages_wall')
        );
        unsubs.push(unsubWall);

        // Birthday Messages
        const unsubBirthdays = onSnapshot(
          collection(db, 'birthday_messages'),
          (snapshot) => {
            const list: BirthdayMessage[] = [];
            snapshot.forEach((d) => list.push({ id: d.id, ...d.data() } as BirthdayMessage));
            list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            setBirthdayMessages(list);
          },
          (err) => handleFirestoreError(err, OperationType.GET, 'birthday_messages')
        );
        unsubs.push(unsubBirthdays);

        // Class Settings
        const unsubSettings = onSnapshot(
          doc(db, 'class_settings', 'general'),
          (docSnap) => {
            if (docSnap.exists()) {
              setClassSettings(docSnap.data() as ClassSettings);
            }
          },
          (err) => console.warn('class_settings snapshot:', err)
        );
        unsubs.push(unsubSettings);

        setIsLoading(false);
        setTimeout(() => {
          initialLoadDone.current = true;
        }, 1200);
      } catch (err) {
        console.warn('Realtime subscription setup notice:', err);
        setIsLoading(false);
      }
    };

    subscribeToCollections();
    seedInitialDataIfEmpty();

    return () => {
      unsubs.forEach((unsub) => unsub());
    };
  }, []);

  // CRUD Operations
  const addStudent = async (data: Omit<Student, 'id'>): Promise<string> => {
    setSyncStatus('saving');
    const docId = data.nim || `student_${Date.now()}`;
    const payload = {
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    try {
      await setDoc(doc(db, 'students', docId), payload);
      setSyncStatus('synced');
      showToast('Data mahasiswa berhasil ditambahkan', 'success');
      return docId;
    } catch (err) {
      setSyncStatus('offline');
      // Optimistic fallback
      setStudents(prev => [...prev, { ...payload, id: docId }]);
      return docId;
    }
  };

  const updateStudent = async (id: string, data: Partial<Student>) => {
    setSyncStatus('saving');
    const payload = { ...data, updatedAt: new Date().toISOString() };
    setStudents(prev => prev.map(s => s.id === id ? { ...s, ...payload } : s));
    try {
      await setDoc(doc(db, 'students', id), payload, { merge: true });
      setSyncStatus('synced');
      showToast('Data mahasiswa berhasil diperbarui', 'success');
    } catch (err) {
      console.warn('updateStudent sync error:', err);
      if (!navigator.onLine) setSyncStatus('offline');
      else setSyncStatus('synced');
      showToast('Data mahasiswa diperbarui', 'info');
    }
  };

  const deleteStudent = async (id: string) => {
    setSyncStatus('saving');
    setStudents(prev => prev.filter(s => s.id !== id));
    try {
      await deleteDoc(doc(db, 'students', id));
      setSyncStatus('synced');
      showToast('Mahasiswa telah dihapus', 'info');
    } catch (err) {
      console.warn('deleteStudent sync error:', err);
      if (!navigator.onLine) setSyncStatus('offline');
      else setSyncStatus('synced');
    }
  };

  const addSchedule = async (data: Omit<Schedule, 'id'>): Promise<string> => {
    setSyncStatus('saving');
    const docId = `sched_${Date.now()}`;
    const payload = {
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setSchedules(prev => [...prev, { ...payload, id: docId }]);
    try {
      await setDoc(doc(db, 'schedules', docId), payload);
      setSyncStatus('synced');
      showToast('Jadwal kuliah berhasil disimpan', 'success');
      return docId;
    } catch (err) {
      console.warn('addSchedule sync error:', err);
      if (!navigator.onLine) setSyncStatus('offline');
      else setSyncStatus('synced');
      return docId;
    }
  };

  const updateSchedule = async (id: string, data: Partial<Schedule>) => {
    setSyncStatus('saving');
    const payload = { ...data, updatedAt: new Date().toISOString() };
    // Optimistic update in state immediately so UI reflects change without delay
    setSchedules(prev => prev.map(s => s.id === id ? { ...s, ...payload } : s));
    try {
      // Use setDoc with merge: true so it creates the doc if not existing or updates it
      await setDoc(doc(db, 'schedules', id), payload, { merge: true });
      setSyncStatus('synced');
      showToast('Jadwal kuliah telah diperbarui ✨', 'success');
    } catch (err) {
      console.warn('updateSchedule error:', err);
      if (!navigator.onLine) {
        setSyncStatus('offline');
      } else {
        setSyncStatus('synced');
      }
      showToast('Jadwal kuliah diperbarui (tersimpan lokal)', 'info');
    }
  };

  const deleteSchedule = async (id: string) => {
    setSyncStatus('saving');
    setSchedules(prev => prev.filter(s => s.id !== id));
    try {
      await deleteDoc(doc(db, 'schedules', id));
      setSyncStatus('synced');
      showToast('Jadwal kuliah dihapus', 'info');
    } catch (err) {
      console.warn('deleteSchedule sync error:', err);
      if (!navigator.onLine) setSyncStatus('offline');
      else setSyncStatus('synced');
    }
  };

  const addAssignment = async (data: Omit<Assignment, 'id'>): Promise<string> => {
    setSyncStatus('saving');
    const docId = `asg_${Date.now()}`;
    const payload = {
      ...data,
      createdBy: userProfile?.name || 'Admin',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    try {
      await setDoc(doc(db, 'assignments', docId), payload);
      setSyncStatus('synced');
      showToast('Tugas kuliah berhasil dibuat', 'success');
      return docId;
    } catch (err) {
      setSyncStatus('offline');
      setAssignments(prev => [...prev, { ...payload, id: docId }]);
      return docId;
    }
  };

  const updateAssignment = async (id: string, data: Partial<Assignment>) => {
    setSyncStatus('saving');
    const payload = { ...data, updatedAt: new Date().toISOString() };
    setAssignments(prev => prev.map(a => a.id === id ? { ...a, ...payload } : a));
    try {
      await setDoc(doc(db, 'assignments', id), payload, { merge: true });
      setSyncStatus('synced');
      showToast('Status tugas diperbarui', 'success');
    } catch (err) {
      console.warn('updateAssignment sync error:', err);
      if (!navigator.onLine) setSyncStatus('offline');
      else setSyncStatus('synced');
    }
  };

  const deleteAssignment = async (id: string) => {
    setSyncStatus('saving');
    setAssignments(prev => prev.filter(a => a.id !== id));
    try {
      await deleteDoc(doc(db, 'assignments', id));
      setSyncStatus('synced');
      showToast('Tugas dihapus', 'info');
    } catch (err) {
      console.warn('deleteAssignment sync error:', err);
      if (!navigator.onLine) setSyncStatus('offline');
      else setSyncStatus('synced');
    }
  };

  const addAnnouncement = async (data: Omit<Announcement, 'id'>): Promise<string> => {
    setSyncStatus('saving');
    const docId = `ann_${Date.now()}`;
    const payload = {
      ...data,
      author: userProfile?.name || data.author || 'Pengurus Kelas',
      authorId: userProfile?.uid,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setAnnouncements(prev => [payload as Announcement, ...prev]);
    try {
      await setDoc(doc(db, 'announcements', docId), payload);
      setSyncStatus('synced');
      showToast('Pengumuman berhasil dipublikasikan', 'success');
      return docId;
    } catch (err) {
      console.warn('addAnnouncement sync error:', err);
      if (!navigator.onLine) setSyncStatus('offline');
      else setSyncStatus('synced');
      return docId;
    }
  };

  const updateAnnouncement = async (id: string, data: Partial<Announcement>) => {
    setSyncStatus('saving');
    const payload = { ...data, updatedAt: new Date().toISOString() };
    setAnnouncements(prev => prev.map(a => a.id === id ? { ...a, ...payload } : a));
    try {
      await setDoc(doc(db, 'announcements', id), payload, { merge: true });
      setSyncStatus('synced');
      showToast('Pengumuman telah diperbarui', 'success');
    } catch (err) {
      console.warn('updateAnnouncement sync error:', err);
      if (!navigator.onLine) setSyncStatus('offline');
      else setSyncStatus('synced');
    }
  };

  const deleteAnnouncement = async (id: string) => {
    setSyncStatus('saving');
    setAnnouncements(prev => prev.filter(a => a.id !== id));
    try {
      await deleteDoc(doc(db, 'announcements', id));
      setSyncStatus('synced');
      showToast('Pengumuman dihapus', 'info');
    } catch (err) {
      console.warn('deleteAnnouncement sync error:', err);
      if (!navigator.onLine) setSyncStatus('offline');
      else setSyncStatus('synced');
    }
  };

  const togglePinAnnouncement = async (id: string, currentPin: boolean) => {
    await updateAnnouncement(id, { isPinned: !currentPin });
  };

  const addCashTransaction = async (data: Omit<CashTransaction, 'id'>): Promise<string> => {
    setSyncStatus('saving');
    const docId = `tx_${Date.now()}`;
    const payload = {
      ...data,
      createdBy: userProfile?.name || 'Bendahara',
      createdAt: new Date().toISOString()
    };
    setTransactions(prev => [{ ...payload, id: docId }, ...prev]);
    try {
      await setDoc(doc(db, 'cash_transactions', docId), payload);
      setSyncStatus('synced');
      showToast('Transaksi kas dicatat', 'success');
      return docId;
    } catch (err) {
      console.warn('addCashTransaction sync error:', err);
      if (!navigator.onLine) setSyncStatus('offline');
      else setSyncStatus('synced');
      return docId;
    }
  };

  const deleteCashTransaction = async (id: string) => {
    setSyncStatus('saving');
    setTransactions(prev => prev.filter(t => t.id !== id));
    try {
      await deleteDoc(doc(db, 'cash_transactions', id));
      setSyncStatus('synced');
      showToast('Transaksi kas dihapus', 'info');
    } catch (err) {
      console.warn('deleteCashTransaction sync error:', err);
      if (!navigator.onLine) setSyncStatus('offline');
      else setSyncStatus('synced');
    }
  };

  const updateCashTransaction = async (id: string, data: Partial<CashTransaction>) => {
    setSyncStatus('saving');
    setTransactions(prev => prev.map(t => t.id === id ? { ...t, ...data } : t));
    try {
      await setDoc(doc(db, 'cash_transactions', id), data, { merge: true });
      setSyncStatus('synced');
      showToast('Transaksi kas diperbarui', 'success');
    } catch (err) {
      console.warn('updateCashTransaction sync error:', err);
      if (!navigator.onLine) setSyncStatus('offline');
      else setSyncStatus('synced');
    }
  };

  const updateClassSettings = async (settings: Partial<ClassSettings>) => {
    setSyncStatus('saving');
    const updated = { ...classSettings, ...settings, updatedAt: new Date().toISOString() };
    setClassSettings(updated);
    try {
      await setDoc(doc(db, 'class_settings', 'general'), updated, { merge: true });
      setSyncStatus('synced');
      showToast('Pengaturan kelas berhasil disimpan', 'success');
    } catch (err) {
      setSyncStatus('offline');
      console.warn('Class settings sync:', err);
    }
  };

  const toggleStudentPayment = async (
    paymentId: string,
    currentStatus: boolean,
    studentId: string,
    studentName: string,
    studentNim: string,
    period: string,
    amount: number,
    customPaidAt?: string
  ) => {
    setSyncStatus('saving');
    const newStatus = !currentStatus;
    const docId = paymentId || `pay_${studentNim}_${period.replace(/\s+/g, '_').toLowerCase()}`;
    const payload: CashPayment = {
      id: docId,
      studentId,
      studentName,
      studentNim,
      period,
      amount,
      isPaid: newStatus,
      paidAt: newStatus ? (customPaidAt || new Date().toISOString()) : undefined,
      updatedAt: new Date().toISOString()
    };
    try {
      await setDoc(doc(db, 'cash_payments', docId), payload);
      setSyncStatus('synced');
      showToast(`Status kas ${studentName}: ${newStatus ? 'LUNAS' : 'BELUM BAYAR'}`, 'success');
    } catch (err) {
      setSyncStatus('offline');
      setPayments(prev => {
        const exists = prev.some(p => p.id === docId);
        if (exists) return prev.map(p => p.id === docId ? payload : p);
        return [...prev, payload];
      });
    }
  };

  const restoreDefaultSchedules = async () => {
    setSyncStatus('saving');
    try {
      const batch = writeBatch(db);
      INITIAL_SCHEDULES.forEach((sched, index) => {
        const docId = `sched_${index + 1}`;
        const ref = doc(db, 'schedules', docId);
        batch.set(ref, {
          ...sched,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      });
      await batch.commit();
      setSyncStatus('synced');
      setSchedules(INITIAL_SCHEDULES.map((s, idx) => ({ ...s, id: `sched_${idx + 1}` })));
      showToast('10 Jadwal perkuliahan SPI 1A berhasil dipulihkan! 📚', 'success');
    } catch (err) {
      console.warn('Error restoring schedules to Firestore, restoring locally:', err);
      setSchedules(INITIAL_SCHEDULES.map((s, idx) => ({ ...s, id: `sched_${idx + 1}` })));
      showToast('Jadwal perkuliahan dimuat dari data cadangan lokal', 'info');
    }
  };

  const addMemory = async (data: Omit<Memory, 'id'>): Promise<string> => {
    setSyncStatus('saving');
    const docId = `mem_${Date.now()}`;
    const payload = {
      ...data,
      createdBy: userProfile?.name || 'Mahasiswa SPI 1A',
      createdAt: new Date().toISOString()
    };
    try {
      await setDoc(doc(db, 'memories', docId), payload);
      setSyncStatus('synced');
      showToast('Foto dokumentasi berhasil ditambahkan 📸', 'success');
      return docId;
    } catch (err) {
      setSyncStatus('offline');
      setMemories(prev => [{ ...payload, id: docId }, ...prev]);
      return docId;
    }
  };

  const deleteMemory = async (id: string) => {
    setSyncStatus('saving');
    try {
      await deleteDoc(doc(db, 'memories', id));
      setSyncStatus('synced');
      showToast('Dokumentasi telah dihapus', 'info');
    } catch (err) {
      setSyncStatus('offline');
      setMemories(prev => prev.filter(m => m.id !== id));
    }
  };

  const updateStructureItem = async (id: string, data: Partial<ClassStructure>) => {
    setSyncStatus('saving');
    const payload = { ...data, updatedAt: new Date().toISOString() };
    try {
      await setDoc(doc(db, 'class_structure', id), payload, { merge: true });
      setSyncStatus('synced');
      showToast('Struktur kelas diperbarui', 'success');
    } catch (err) {
      setSyncStatus('offline');
      setStructure(prev => prev.map(s => s.id === id ? { ...s, ...payload } : s));
    }
  };

  const addWallMessage = async (message: string): Promise<string> => {
    setSyncStatus('saving');
    const docId = `wall_${Date.now()}`;
    const payload: MessageWall = {
      id: docId,
      senderUid: userProfile?.uid || 'guest',
      senderName: userProfile?.name || 'Mahasiswa SPI 1A',
      message: message.trim(),
      createdAt: new Date().toISOString()
    };
    try {
      await setDoc(doc(db, 'messages_wall', docId), payload);
      setSyncStatus('synced');
      showToast('Pesan & kesan terkirim ke dinding kelas 💌', 'success');
      return docId;
    } catch (err) {
      setSyncStatus('offline');
      setWallMessages(prev => [payload, ...prev]);
      return docId;
    }
  };

  const deleteWallMessage = async (id: string) => {
    setSyncStatus('saving');
    try {
      await deleteDoc(doc(db, 'messages_wall', id));
      setSyncStatus('synced');
      showToast('Pesan telah dihapus', 'info');
    } catch (err) {
      setSyncStatus('offline');
      setWallMessages(prev => prev.filter(w => w.id !== id));
    }
  };

  const addBirthdayMessage = async (recipientStudentId: string, message: string): Promise<string> => {
    setSyncStatus('saving');
    const docId = `bday_${Date.now()}`;
    const payload: BirthdayMessage = {
      id: docId,
      recipientStudentId,
      senderUid: userProfile?.uid || 'guest',
      senderName: userProfile?.name || 'Teman Sekelas',
      message: message.trim(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    try {
      await setDoc(doc(db, 'birthday_messages', docId), payload);
      setSyncStatus('synced');
      showToast('Ucapan ulang tahun berhasil dikirim! 🎂', 'success');
      return docId;
    } catch (err) {
      setSyncStatus('offline');
      setBirthdayMessages(prev => [payload, ...prev]);
      return docId;
    }
  };

  const updateBirthdayMessage = async (id: string, newMessage: string) => {
    setSyncStatus('saving');
    const payload = { message: newMessage.trim(), updatedAt: new Date().toISOString() };
    try {
      await updateDoc(doc(db, 'birthday_messages', id), payload);
      setSyncStatus('synced');
      showToast('Ucapan ulang tahun diperbarui', 'success');
    } catch (err) {
      setSyncStatus('offline');
      setBirthdayMessages(prev => prev.map(b => b.id === id ? { ...b, ...payload } : b));
    }
  };

  const deleteBirthdayMessage = async (id: string) => {
    setSyncStatus('saving');
    try {
      await deleteDoc(doc(db, 'birthday_messages', id));
      setSyncStatus('synced');
      showToast('Ucapan telah dihapus', 'info');
    } catch (err) {
      setSyncStatus('offline');
      setBirthdayMessages(prev => prev.filter(b => b.id !== id));
    }
  };

  // Export full backup
  const exportAllData = () => {
    const backup: BackupData = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      app: 'SPI 1A - UIN Raden Mas Said Surakarta',
      data: {
        students,
        schedules,
        assignments,
        announcements,
        cash_transactions: transactions,
        cash_payments: payments,
        memories,
        class_structure: structure,
        messages_wall: wallMessages,
        birthday_messages: birthdayMessages
      }
    };
    downloadBackupJSON(backup);
    showToast('Cadangan data kelas berhasil diunduh 📁', 'success');
  };

  // Import backup with validation
  const importBackup = async (backup: BackupData): Promise<{ success: boolean; message: string }> => {
    if (!isAdmin) {
      return { success: false, message: 'Hanya Admin yang dapat memulihkan cadangan data.' };
    }
    setSyncStatus('saving');
    try {
      const batch = writeBatch(db);

      if (backup.data.students && Array.isArray(backup.data.students)) {
        backup.data.students.forEach((s) => {
          const ref = doc(db, 'students', s.id || s.nim || `student_${Date.now()}`);
          batch.set(ref, s);
        });
      }
      if (backup.data.schedules && Array.isArray(backup.data.schedules)) {
        backup.data.schedules.forEach((s) => {
          const ref = doc(db, 'schedules', s.id || `sched_${Date.now()}`);
          batch.set(ref, s);
        });
      }
      if (backup.data.assignments && Array.isArray(backup.data.assignments)) {
        backup.data.assignments.forEach((a) => {
          const ref = doc(db, 'assignments', a.id || `asg_${Date.now()}`);
          batch.set(ref, a);
        });
      }
      if (backup.data.announcements && Array.isArray(backup.data.announcements)) {
        backup.data.announcements.forEach((a) => {
          const ref = doc(db, 'announcements', a.id || `ann_${Date.now()}`);
          batch.set(ref, a);
        });
      }
      if (backup.data.cash_transactions && Array.isArray(backup.data.cash_transactions)) {
        backup.data.cash_transactions.forEach((t) => {
          const ref = doc(db, 'cash_transactions', t.id || `tx_${Date.now()}`);
          batch.set(ref, t);
        });
      }
      if (backup.data.cash_payments && Array.isArray(backup.data.cash_payments)) {
        backup.data.cash_payments.forEach((p) => {
          const ref = doc(db, 'cash_payments', p.id || `pay_${p.studentNim}_${Date.now()}`);
          batch.set(ref, p);
        });
      }
      if (backup.data.class_structure && Array.isArray(backup.data.class_structure)) {
        backup.data.class_structure.forEach((cs) => {
          const ref = doc(db, 'class_structure', cs.id || `struct_${Date.now()}`);
          batch.set(ref, cs);
        });
      }

      await batch.commit();
      setSyncStatus('synced');
      showToast('Cadangan data berhasil dipulihkan secara online!', 'success');
      return { success: true, message: 'Data kelas berhasil dipulihkan.' };
    } catch (err) {
      setSyncStatus('offline');
      return { success: false, message: 'Gagal memulihkan ke Firestore: ' + String(err) };
    }
  };

  return (
    <DataContext.Provider
      value={{
        students,
        schedules,
        assignments,
        announcements,
        transactions,
        payments,
        memories,
        structure,
        wallMessages,
        birthdayMessages,
        isLoading,
        toasts,
        dismissToast,
        showToast,
        addStudent,
        updateStudent,
        deleteStudent,
        addSchedule,
        updateSchedule,
        deleteSchedule,
        addAssignment,
        updateAssignment,
        deleteAssignment,
        addAnnouncement,
        updateAnnouncement,
        deleteAnnouncement,
        togglePinAnnouncement,
        addCashTransaction,
        updateCashTransaction,
        deleteCashTransaction,
        toggleStudentPayment,
        classSettings,
        updateClassSettings,
        addMemory,
        deleteMemory,
        updateStructureItem,
        addWallMessage,
        deleteWallMessage,
        addBirthdayMessage,
        updateBirthdayMessage,
        deleteBirthdayMessage,
        exportAllData,
        importBackup,
        seedInitialDataIfEmpty,
        restoreDefaultSchedules
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
