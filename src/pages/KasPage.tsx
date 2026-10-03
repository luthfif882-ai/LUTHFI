import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { CashTransaction, TransactionType } from '../types';
import { Modal } from '../components/common/Modal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { Avatar } from '../components/common/Avatar';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Plus, 
  Edit3, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  Users, 
  Calendar, 
  CreditCard,
  Filter,
  AlertCircle,
  Sliders,
  Clock,
  CalendarCheck,
  Check
} from 'lucide-react';

export const KasPage: React.FC = () => {
  const { isAdmin, userProfile } = useAuth();
  const { 
    transactions, 
    payments, 
    students, 
    classSettings,
    addCashTransaction, 
    updateCashTransaction,
    deleteCashTransaction, 
    toggleStudentPayment,
    updateClassSettings,
    showToast
  } = useData();

  const [activeTab, setActiveTab] = useState<'transaksi' | 'iuran'>('transaksi');
  const [filterPeriod, setFilterPeriod] = useState<string>(classSettings.activePeriod || 'Oktober 2026');
  const [paymentFilter, setPaymentFilter] = useState<'semua' | 'belum' | 'lunas'>('semua');

  // Modal State for new / edit transaction
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<CashTransaction | null>(null);
  const [txForm, setTxForm] = useState<Omit<CashTransaction, 'id'>>({
    date: new Date().toISOString().split('T')[0],
    description: '',
    amount: classSettings.defaultMonthlyFee || 10000,
    type: 'income',
    createdBy: userProfile?.name || 'Bendahara'
  });

  // Modal State for Student Payment (Custom Date, Amount & Status)
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedStudentPayment, setSelectedStudentPayment] = useState<any | null>(null);
  const [paymentForm, setPaymentForm] = useState({
    isPaid: true,
    paidAt: new Date().toISOString().split('T')[0],
    amount: classSettings.defaultMonthlyFee || 10000,
    method: 'Tunai'
  });

  // Modal State for Kas Settings (Tanggal Jatuh Tempo, Iuran Bulanan, dll.)
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [settingsForm, setSettingsForm] = useState({
    defaultMonthlyFee: classSettings.defaultMonthlyFee || 10000,
    paymentDueDay: classSettings.paymentDueDay || 10,
    activePeriod: classSettings.activePeriod || 'Oktober 2026',
    newPeriodInput: ''
  });

  const [deleteTarget, setDeleteTarget] = useState<CashTransaction | null>(null);

  // Financial calculations
  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + (t.amount || 0), 0);
  const totalExpense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + (t.amount || 0), 0);
  const balance = totalIncome - totalExpense;

  // Payments status for selected period
  const studentPaymentList = students.map((s) => {
    const record = payments.find((p) => p.studentId === s.nim && p.period === filterPeriod);
    return {
      student: s,
      paymentId: record?.id || `pay_${s.nim}_${filterPeriod.replace(/\s+/g, '_').toLowerCase()}`,
      isPaid: record ? record.isPaid : false,
      amount: record?.amount || classSettings.defaultMonthlyFee || 10000,
      paidAt: record?.paidAt
    };
  });

  const paidCount = studentPaymentList.filter((p) => p.isPaid).length;
  const unpaidList = studentPaymentList.filter((p) => !p.isPaid);
  const percentCollected = students.length > 0 ? Math.round((paidCount / students.length) * 100) : 0;

  const filteredStudentPayments = studentPaymentList.filter((p) => {
    if (paymentFilter === 'lunas') return p.isPaid;
    if (paymentFilter === 'belum') return !p.isPaid;
    return true;
  });

  const handleOpenAdd = () => {
    setEditingTx(null);
    setTxForm({
      date: new Date().toISOString().split('T')[0],
      description: '',
      amount: classSettings.defaultMonthlyFee || 10000,
      type: 'income',
      createdBy: userProfile?.name || 'Bendahara'
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (tx: CashTransaction) => {
    setEditingTx(tx);
    setTxForm({
      date: tx.date,
      description: tx.description,
      amount: tx.amount,
      type: tx.type,
      createdBy: tx.createdBy || 'Bendahara'
    });
    setIsModalOpen(true);
  };

  const handleSaveTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!txForm.description.trim() || txForm.amount <= 0) {
      showToast('Keterangan dan nominal harus diisi dengan benar', 'warning');
      return;
    }

    if (editingTx) {
      await updateCashTransaction(editingTx.id, txForm);
    } else {
      await addCashTransaction(txForm);
    }
    setIsModalOpen(false);
  };

  const handleDeleteTransaction = async () => {
    if (deleteTarget) {
      await deleteCashTransaction(deleteTarget.id);
      setDeleteTarget(null);
    }
  };

  // Open Payment Custom Date Modal
  const handleOpenPaymentModal = (item: any) => {
    setSelectedStudentPayment(item);
    setPaymentForm({
      isPaid: item.isPaid,
      paidAt: item.paidAt ? item.paidAt.split('T')[0] : new Date().toISOString().split('T')[0],
      amount: item.amount || classSettings.defaultMonthlyFee || 10000,
      method: 'Tunai'
    });
    setIsPaymentModalOpen(true);
  };

  const handleSaveStudentPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentPayment) return;

    await toggleStudentPayment(
      selectedStudentPayment.paymentId,
      !paymentForm.isPaid, // Flip so that new status matches paymentForm.isPaid
      selectedStudentPayment.student.nim,
      selectedStudentPayment.student.name,
      selectedStudentPayment.student.nim,
      filterPeriod,
      paymentForm.amount,
      paymentForm.isPaid ? paymentForm.paidAt : undefined
    );
    setIsPaymentModalOpen(false);
  };

  const handleSaveKasSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    const periods = [...classSettings.availablePeriods];
    if (settingsForm.newPeriodInput.trim() && !periods.includes(settingsForm.newPeriodInput.trim())) {
      periods.push(settingsForm.newPeriodInput.trim());
    }

    await updateClassSettings({
      defaultMonthlyFee: settingsForm.defaultMonthlyFee,
      paymentDueDay: settingsForm.paymentDueDay,
      activePeriod: settingsForm.activePeriod,
      availablePeriods: periods
    });
    setFilterPeriod(settingsForm.activePeriod);
    setIsSettingsModalOpen(false);
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif-title text-stone-900 dark:text-stone-100 flex items-center gap-2.5">
            <DollarSign className="w-7 h-7 text-emerald-600" />
            <span>Kas Kelas {classSettings.className}</span>
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1">
            Transparansi pembukuan kas, tanggal jatuh tempo, dan pencatatan iuran mahasiswa
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => setIsSettingsModalOpen(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-2xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-200 text-xs sm:text-sm font-semibold hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors shadow-xs cursor-pointer"
            title="Atur tanggal jatuh tempo kas & besaran iuran"
          >
            <Sliders className="w-4 h-4 text-amber-500" />
            <span>Pengaturan Kas</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs sm:text-sm font-bold shadow-md transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Catat Transaksi</span>
          </button>
        </div>
      </div>

      {/* Due Date & Monthly Rule Notification Banner */}
      <div className="p-4 rounded-2xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-900/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 shrink-0">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-amber-950 dark:text-amber-100 block">
              Jatuh Tempo Kas: Tanggal {classSettings.paymentDueDay} setiap bulan
            </span>
            <span className="text-[11px] text-amber-800/90 dark:text-amber-300/80">
              Besaran Iuran: Rp {classSettings.defaultMonthlyFee.toLocaleString('id-ID')} / mahasiswa • Periode aktif: {classSettings.activePeriod}
            </span>
          </div>
        </div>

        <button
          onClick={() => setIsSettingsModalOpen(true)}
          className="text-amber-800 dark:text-amber-300 font-bold hover:underline shrink-0 text-[11px] cursor-pointer"
        >
          Ubah Tanggal & Besaran →
        </button>
      </div>

      {/* Summary Cards: Saldo, Pemasukan, Pengeluaran */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Saldo */}
        <div className="p-6 rounded-3xl bg-gradient-to-br from-emerald-900 to-emerald-950 text-white shadow-lg border border-emerald-800">
          <div className="flex items-center justify-between text-xs text-emerald-200">
            <span>Saldo Kas Terkini</span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-800/80 text-[10px] font-bold">
              SPI 1A
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold font-serif-title mt-2">
            Rp {balance.toLocaleString('id-ID')}
          </div>
          <p className="text-[11px] text-emerald-300 mt-2">
            Total {transactions.length} riwayat transaksi tercatat
          </p>
        </div>

        {/* Pemasukan */}
        <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs">
          <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400">
            <span>Total Pemasukan</span>
            <div className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-bold font-serif-title text-emerald-700 dark:text-emerald-400 mt-2">
            Rp {totalIncome.toLocaleString('id-ID')}
          </div>
          <p className="text-[11px] text-stone-400 mt-1">
            Dari iuran mahasiswa & donasi
          </p>
        </div>

        {/* Pengeluaran */}
        <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs">
          <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400">
            <span>Total Pengeluaran</span>
            <div className="p-1.5 rounded-lg bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300">
              <TrendingDown className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-bold font-serif-title text-rose-600 dark:text-rose-400 mt-2">
            Rp {totalExpense.toLocaleString('id-ID')}
          </div>
          <p className="text-[11px] text-stone-400 mt-1">
            Untuk keperluan alat kelas & kegiatan
          </p>
        </div>
      </div>

      {/* Tabs: Transaksi Kas vs Status Iuran Mahasiswa */}
      <div className="flex items-center gap-2 border-b border-stone-200 dark:border-stone-800 pb-2">
        <button
          onClick={() => setActiveTab('transaksi')}
          className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'transaksi'
              ? 'bg-emerald-800 text-white shadow-xs'
              : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Riwayat Transaksi Kas</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-950/40 text-emerald-100">
            {transactions.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('iuran')}
          className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'iuran'
              ? 'bg-emerald-800 text-white shadow-xs'
              : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Status Iuran Mahasiswa</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-950/40 text-emerald-100">
            {paidCount}/{students.length}
          </span>
        </button>
      </div>

      {/* TAB 1: Riwayat Transaksi */}
      {activeTab === 'transaksi' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold font-serif-title text-stone-900 dark:text-stone-100">
              Daftar Pemasukan & Pengeluaran
            </h2>
            <button
              onClick={handleOpenAdd}
              className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:underline inline-flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Transaksi</span>
            </button>
          </div>

          {transactions.length > 0 ? (
            <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 overflow-hidden shadow-xs divide-y divide-stone-100 dark:divide-stone-800">
              {transactions
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .map((tx) => (
                  <div
                    key={tx.id}
                    className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-stone-50/70 dark:hover:bg-stone-800/40 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`p-2.5 rounded-2xl shrink-0 mt-0.5 ${
                          tx.type === 'income'
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                            : 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                        }`}
                      >
                        {tx.type === 'income' ? (
                          <TrendingUp className="w-4 h-4" />
                        ) : (
                          <TrendingDown className="w-4 h-4" />
                        )}
                      </div>

                      <div>
                        <h3 className="text-xs sm:text-sm font-bold text-stone-900 dark:text-stone-100">
                          {tx.description}
                        </h3>
                        <div className="flex flex-wrap items-center gap-2 text-[11px] text-stone-400 mt-1">
                          <span className="flex items-center gap-1 font-mono">
                            <Calendar className="w-3 h-3" />
                            {tx.date}
                          </span>
                          <span>•</span>
                          <span>Dicatat oleh: {tx.createdBy || 'Bendahara'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4 self-end sm:self-auto w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-0 border-stone-100 dark:border-stone-800">
                      <div
                        className={`text-sm sm:text-base font-bold font-mono ${
                          tx.type === 'income'
                            ? 'text-emerald-700 dark:text-emerald-400'
                            : 'text-rose-600 dark:text-rose-400'
                        }`}
                      >
                        {tx.type === 'income' ? '+' : '-'} Rp {tx.amount.toLocaleString('id-ID')}
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEdit(tx)}
                          className="p-1.5 rounded-lg text-stone-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors cursor-pointer"
                          title="Edit transaksi & tanggal"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(tx)}
                          className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                          title="Hapus transaksi"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <div className="py-12 text-center rounded-3xl bg-white dark:bg-stone-900 border border-dashed border-stone-200 dark:border-stone-800 p-8">
              <CreditCard className="w-10 h-10 text-stone-300 dark:text-stone-600 mx-auto mb-2" />
              <p className="text-xs font-semibold text-stone-600 dark:text-stone-400">
                Belum ada transaksi kas yang dicatat.
              </p>
              <button
                onClick={handleOpenAdd}
                className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-800 text-white text-xs font-bold hover:bg-emerald-900 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Catat Transaksi Pertama</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Status Iuran Mahasiswa */}
      {activeTab === 'iuran' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
            <div className="flex items-center gap-3">
              <label className="text-xs font-bold text-stone-700 dark:text-stone-300">
                Pilih Periode:
              </label>
              <select
                value={filterPeriod}
                onChange={(e) => setFilterPeriod(e.target.value)}
                className="px-3 py-1.5 rounded-xl text-xs bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 font-bold"
              >
                {classSettings.availablePeriods.map((period) => (
                  <option key={period} value={period}>
                    {period}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              {(['semua', 'belum', 'lunas'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setPaymentFilter(mode)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer ${
                    paymentFilter === mode
                      ? 'bg-emerald-800 text-white'
                      : 'text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800'
                  }`}
                >
                  {mode === 'belum' ? `Belum Lunas (${unpaidList.length})` : mode}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredStudentPayments.map((item) => (
              <div
                key={item.student.id}
                className="p-3.5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 flex items-center justify-between gap-3 shadow-xs hover:border-emerald-500/40 transition-all"
              >
                <div className="flex items-center gap-3">
                  <Avatar name={item.student.name} photoUrl={item.student.photoUrl} size="sm" shape="square" />
                  <div>
                    <h3 className="text-xs font-bold text-stone-900 dark:text-stone-100 font-serif-title line-clamp-1">
                      {item.student.name}
                    </h3>
                    <p className="text-[10px] text-stone-400 font-mono">NIM: {item.student.nim}</p>
                    {item.isPaid && item.paidAt && (
                      <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                        Dibayar: {item.paidAt.split('T')[0]}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                      item.isPaid
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                    }`}
                  >
                    {item.isPaid ? 'Lunas' : 'Belum'}
                  </span>

                  {/* Edit Payment Date Modal Button */}
                  <button
                    onClick={() => handleOpenPaymentModal(item)}
                    className="p-1.5 rounded-lg border border-stone-200 dark:border-stone-700 text-stone-500 hover:text-emerald-600 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors cursor-pointer"
                    title="Ubah tanggal kas & status pembayaran"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                  </button>

                  {/* Quick Toggle Status Button */}
                  <button
                    onClick={() =>
                      toggleStudentPayment(
                        item.paymentId,
                        item.isPaid,
                        item.student.nim,
                        item.student.name,
                        item.student.nim,
                        filterPeriod,
                        item.amount
                      )
                    }
                    className={`p-1.5 rounded-lg border text-xs font-medium transition-colors cursor-pointer ${
                      item.isPaid
                        ? 'text-stone-400 hover:text-amber-600 border-stone-200'
                        : 'text-emerald-700 bg-emerald-50 border-emerald-300 hover:bg-emerald-100'
                    }`}
                    title={item.isPaid ? 'Ubah jadi Belum Lunas' : 'Tandai Lunas'}
                  >
                    {item.isPaid ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal Add / Edit Cash Transaction */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingTx ? 'Edit Transaksi Kas' : 'Catat Transaksi Kas'}
        subtitle="Kelola tanggal transaksi, nominal, dan keterangan"
      >
        <form onSubmit={handleSaveTransaction} className="space-y-4">
          <div className="grid grid-cols-2 gap-2 p-1 bg-stone-100 dark:bg-stone-800 rounded-xl">
            <button
              type="button"
              onClick={() => setTxForm({ ...txForm, type: 'income' })}
              className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                txForm.type === 'income'
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'text-stone-600 dark:text-stone-300'
              }`}
            >
              + Pemasukan
            </button>
            <button
              type="button"
              onClick={() => setTxForm({ ...txForm, type: 'expense' })}
              className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                txForm.type === 'expense'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-stone-600 dark:text-stone-300'
              }`}
            >
              - Pengeluaran
            </button>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
              Keterangan Transaksi *
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Pembelian Spidol Whiteboard & Penghapus"
              value={txForm.description}
              onChange={(e) => setTxForm({ ...txForm, description: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                Nominal (Rp) *
              </label>
              <input
                type="number"
                min="500"
                step="500"
                required
                value={txForm.amount}
                onChange={(e) => setTxForm({ ...txForm, amount: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                Tanggal Transaksi *
              </label>
              <input
                type="date"
                required
                value={txForm.date}
                onChange={(e) => setTxForm({ ...txForm, date: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100"
              />
            </div>
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
              className="px-5 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold shadow-md transition-colors cursor-pointer"
            >
              {editingTx ? 'Simpan Perubahan' : 'Catat Transaksi'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal Edit Tanggal & Status Pembayaran Mahasiswa */}
      {selectedStudentPayment && (
        <Modal
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
          title="Atur Tanggal & Status Kas Mahasiswa"
          subtitle={`${selectedStudentPayment.student.name} • Periode ${filterPeriod}`}
        >
          <form onSubmit={handleSaveStudentPayment} className="space-y-4">
            <div className="p-3 rounded-2xl bg-stone-50 dark:bg-stone-800/60 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-stone-900 dark:text-stone-100 font-serif-title">
                  {selectedStudentPayment.student.name}
                </p>
                <p className="text-[11px] text-stone-400 font-mono">
                  NIM: {selectedStudentPayment.student.nim}
                </p>
              </div>
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                {filterPeriod}
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                Status Iuran Kas
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentForm({ ...paymentForm, isPaid: true })}
                  className={`py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    paymentForm.isPaid
                      ? 'bg-emerald-100 dark:bg-emerald-950 border-emerald-500 text-emerald-800 dark:text-emerald-200'
                      : 'border-stone-200 dark:border-stone-700 text-stone-500'
                  }`}
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>LUNAS</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentForm({ ...paymentForm, isPaid: false })}
                  className={`py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    !paymentForm.isPaid
                      ? 'bg-amber-100 dark:bg-amber-950 border-amber-500 text-amber-800 dark:text-amber-200'
                      : 'border-stone-200 dark:border-stone-700 text-stone-500'
                  }`}
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>BELUM BAYAR</span>
                </button>
              </div>
            </div>

            {paymentForm.isPaid && (
              <div className="space-y-3 p-3.5 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800">
                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1 flex items-center gap-1.5">
                    <CalendarCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Tanggal Pembayaran Kas *</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={paymentForm.paidAt}
                    onChange={(e) => setPaymentForm({ ...paymentForm, paidAt: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100"
                  />
                  <p className="text-[10px] text-stone-400 mt-1">
                    Bisa disesuaikan ke tanggal kapan mahasiswa menyerahkan uang kas.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                    Nominal Pembayaran (Rp)
                  </label>
                  <input
                    type="number"
                    min="1000"
                    step="1000"
                    value={paymentForm.amount}
                    onChange={(e) => setPaymentForm({ ...paymentForm, amount: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 font-mono"
                  />
                </div>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-100 dark:border-stone-800">
              <button
                type="button"
                onClick={() => setIsPaymentModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-stone-600 dark:text-stone-400 hover:bg-stone-100"
              >
                Batal
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold shadow-md cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Simpan Tanggal & Status</span>
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal Pengaturan Tanggal Kas & Iuran */}
      <Modal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        title="Pengaturan Kas & Tanggal Jatuh Tempo"
        subtitle="Atur tanggal jatuh tempo dan nominal iuran bulanan kelas"
      >
        <form onSubmit={handleSaveKasSettings} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
              Tanggal Jatuh Tempo Kas Setiap Bulan
            </label>
            <div className="flex items-center gap-2">
              <span className="text-xs text-stone-500 font-semibold">Setiap tanggal</span>
              <input
                type="number"
                min="1"
                max="31"
                required
                value={settingsForm.paymentDueDay}
                onChange={(e) => setSettingsForm({ ...settingsForm, paymentDueDay: Number(e.target.value) })}
                className="w-24 px-3 py-2 rounded-xl text-xs bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 font-bold text-stone-900 dark:text-stone-100"
              />
              <span className="text-xs text-stone-500 font-semibold">setiap bulan</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
              Besaran Iuran Standar (Rp / Bulan)
            </label>
            <input
              type="number"
              min="1000"
              step="1000"
              required
              value={settingsForm.defaultMonthlyFee}
              onChange={(e) => setSettingsForm({ ...settingsForm, defaultMonthlyFee: Number(e.target.value) })}
              className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
              Periode Kas Aktif
            </label>
            <select
              value={settingsForm.activePeriod}
              onChange={(e) => setSettingsForm({ ...settingsForm, activePeriod: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 font-bold"
            >
              {classSettings.availablePeriods.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
              Tambah Periode Baru (Opsional)
            </label>
            <input
              type="text"
              placeholder="Contoh: Februari 2027"
              value={settingsForm.newPeriodInput}
              onChange={(e) => setSettingsForm({ ...settingsForm, newPeriodInput: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-100 dark:border-stone-800">
            <button
              type="button"
              onClick={() => setIsSettingsModalOpen(false)}
              className="px-4 py-2.5 rounded-xl text-xs font-medium text-stone-600 dark:text-stone-400 hover:bg-stone-100"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold shadow-md transition-colors cursor-pointer"
            >
              Simpan Pengaturan
            </button>
          </div>
        </form>
      </Modal>

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteTransaction}
        title="Hapus Transaksi Kas"
        message={`Apakah Anda yakin ingin menghapus catatan transaksi "${deleteTarget?.description}" sebesar Rp ${deleteTarget?.amount.toLocaleString('id-ID')}?`}
        confirmLabel="Hapus Transaksi"
      />
    </div>
  );
};
