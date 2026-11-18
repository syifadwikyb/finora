"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { useRouter } from "next/navigation";
import { useOnDataChanged } from "@/lib/dataEvents";
import { useSettings } from "@/lib/settingsContext";
import Navbar from "@/components/layout/Navbar";
import TransactionFilter from "@/components/transactions/TransactionFilter";
import TransactionTable from "@/components/transactions/TransactionTable";
import TransactionModal from "@/components/transactions/TransactionModal";
import TransferModal from "@/components/transactions/TransferModal";
import ConfirmModal from "@/components/ui/ConfirmModal";
import {
  Account,
  Category,
  Transaction,
  Transfer,
  TransactionFilters,
  createTransaction,
  createTransfer,
  updateTransfer,
  deleteTransaction,
  deleteTransfer,
  getAccounts,
  getCategories,
  getTransactions,
  getTransfers,
  updateTransaction,
} from "@/lib/api";
import { AlertCircle, ArrowLeftRight, MinusCircle, PlusCircle, RefreshCw } from "lucide-react";

// Penanda: pesan error bawaan, diterjemahkan saat render
const DEFAULT_ERROR = "__DEFAULT_ERROR__";

export default function TransactionsPage() {
  const { t } = useSettings();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Riwayat Move Money
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [transfersLoading, setTransfersLoading] = useState(true);
  const [transfersError, setTransfersError] = useState<string | null>(null);

  // Filters state
  const [filters, setFilters] = useState<TransactionFilters>({
    type: "",
    category_id: "",
    date: "",
    search: "",
  });

  // Modal & Edit state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [defaultType, setDefaultType] = useState<"income" | "expense">("expense");
  const [modalLoading, setModalLoading] = useState(false);

  // Transfer modal state
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [transferLoading, setTransferLoading] = useState(false);
  const [selectedTransfer, setSelectedTransfer] = useState<Transfer | null>(null);

  // Delete move confirmation state
  const [deleteTransferTarget, setDeleteTransferTarget] = useState<Transfer | null>(null);
  const [deleteTransferLoading, setDeleteTransferLoading] = useState(false);

  // Delete confirmation state
  const [deleteTarget, setDeleteTarget] = useState<Transaction | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Notification Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login");
    }
  }, [authLoading, user, router]);

  // Tipe filter "transfer" = hanya Move Money; income/expense = tanpa Move Money
  const onlyTransfers = filters.type === "transfer";
  const showTransactions = !onlyTransfers;
  const showTransfers = !filters.type || onlyTransfers;

  // Kategori & akun dipakai oleh TransactionModal dan TransferModal
  const loadSupportingData = async () => {
    try {
      const [catRes, accRes] = await Promise.all([
        getCategories().catch(() => ({ data: [] })),
        getAccounts().catch(() => ({ data: [] })),
      ]);
      setCategories(catRes.data || []);
      setAccounts(accRes.data || []);
    } catch (err) {
      console.error("Failed to load supporting data", err);
    }
  };

  const loadTransactions = useCallback(async () => {
    setError(null);

    // Filter "Move": tidak perlu memanggil API transaksi
    if (filters.type === "transfer") {
      setTransactions([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const res = await getTransactions(filters);
      setTransactions(res.data);
    } catch (err: any) {
      console.error("Error loading transactions:", err);
      setError(err.message || DEFAULT_ERROR);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const loadTransfers = useCallback(async () => {
    setTransfersLoading(true);
    setTransfersError(null);
    try {
      const res = await getTransfers();
      setTransfers(res.data || []);
    } catch (err: any) {
      console.error("Error loading transfers:", err);
      setTransfersError(err.message || DEFAULT_ERROR);
    } finally {
      setTransfersLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user && !authLoading) {
      loadSupportingData();
      loadTransfers();
    }
  }, [user, authLoading, loadTransfers]);

  useEffect(() => {
    if (user && !authLoading) {
      loadTransactions();
    }
  }, [user, authLoading, loadTransactions]);

  // Transfer difilter di sisi client agar konsisten dengan filter transaksi
  const filteredTransfers = useMemo(() => {
    if (!showTransfers) return [];
    const q = (filters.search || "").trim().toLowerCase();

    return transfers.filter((tf) => {
      const d = String(tf.transfer_date).slice(0, 10);
      if (filters.date && d !== filters.date) return false;
      if (filters.start_date && d < filters.start_date) return false;
      if (filters.end_date && d > filters.end_date) return false;

      if (filters.category_id) {
        const id = Number(filters.category_id);
        if (tf.from_category_id !== id && tf.to_category_id !== id) return false;
      }

      if (q) {
        const haystack = [
          tf.note,
          tf.from_category_name,
          tf.to_category_name,
          tf.from_account_name,
          tf.to_account_name,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [transfers, filters, showTransfers]);

  const handleFilterChange = useCallback((newFilters: Partial<TransactionFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  }, []);

  const handleResetFilters = () => {
    setFilters({ type: "", category_id: "", date: "", search: "" });
  };

  // Dipanggil oleh tombol Add Income / Add Expense
  const handleOpenAdd = (type: "income" | "expense") => {
    setSelectedTransaction(null);
    setDefaultType(type);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (tx: Transaction) => {
    setSelectedTransaction(tx);
    setIsModalOpen(true);
  };

  const handleSaveTransaction = async (formData: any) => {
    setModalLoading(true);
    try {
      if (selectedTransaction) {
        await updateTransaction(selectedTransaction.id, formData);
        showToast(t("txp.toastUpdated"));
      } else {
        await createTransaction(formData);
        showToast(t("txp.toastRecorded"));
      }
      setIsModalOpen(false);
      loadTransactions();
      loadSupportingData();
    } catch (err: any) {
      throw err;
    } finally {
      setModalLoading(false);
    }
  };

  const handleOpenAddTransfer = () => {
    setSelectedTransfer(null);
    setIsTransferModalOpen(true);
  };

  const handleOpenEditTransfer = (tf: Transfer) => {
    setSelectedTransfer(tf);
    setIsTransferModalOpen(true);
  };

  const handleCloseTransferModal = () => {
    setIsTransferModalOpen(false);
    setSelectedTransfer(null);
  };

  const handleSaveTransfer = async (formData: any) => {
    setTransferLoading(true);
    try {
      if (selectedTransfer) {
        await updateTransfer(selectedTransfer.id, formData);
        showToast(t("txp.toastMoveUpdated"));
      } else {
        await createTransfer(formData);
        showToast(t("txp.toastMoved"));
      }
      handleCloseTransferModal();
      loadTransfers();
      loadSupportingData();
    } catch (err: any) {
      throw err;
    } finally {
      setTransferLoading(false);
    }
  };

  const handleDeleteTransferConfirm = async () => {
    if (!deleteTransferTarget) return;
    setDeleteTransferLoading(true);
    try {
      await deleteTransfer(deleteTransferTarget.id);
      showToast(t("txp.toastMoveDeleted"));
      setDeleteTransferTarget(null);
      loadTransfers();
      loadSupportingData();
    } catch (err: any) {
      showToast(err.message || t("txp.errDeleteMove"));
    } finally {
      setDeleteTransferLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await deleteTransaction(deleteTarget.id);
      showToast(t("txp.toastTxDeleted"));
      setDeleteTarget(null);
      loadTransactions();
      loadSupportingData();
    } catch (err: any) {
      showToast(err.message || t("txp.errDeleteTx"));
    } finally {
      setDeleteLoading(false);
    }
  };

  // Tombol aksi: mobile = icon saja, desktop (sm+) = icon + keterangan
  const actions = [
    {
      key: "income",
      label: t("txp.addIncome"),
      icon: PlusCircle,
      onClick: () => handleOpenAdd("income"),
      color:
        "from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 shadow-emerald-500/25",
    },
    {
      key: "expense",
      label: t("txp.addExpense"),
      icon: MinusCircle,
      onClick: () => handleOpenAdd("expense"),
      color: "from-rose-600 to-rose-500 hover:from-rose-700 hover:to-rose-600 shadow-rose-500/25",
    },
    {
      key: "transfer",
      label: t("txp.moveMoney"),
      icon: ArrowLeftRight,
      onClick: handleOpenAddTransfer,
      color:
        "from-indigo-600 to-indigo-500 hover:from-indigo-700 hover:to-indigo-600 shadow-indigo-500/25",
    },
  ];

  // Status gabungan untuk daftar riwayat
  const isLoading = (showTransactions && loading) || (showTransfers && transfersLoading);
  const mainError = onlyTransfers ? transfersError : error;
  const retryMain = onlyTransfers ? loadTransfers : loadTransactions;
  // Di tampilan "All", kegagalan memuat Move tidak memblokir transaksi
  const moveWarning = !onlyTransfers && showTransfers && !transfersLoading && transfersError;

  const displayError = (msg: string | null) => {
    if (!msg) return "";
    if (msg !== DEFAULT_ERROR) return msg;
    return onlyTransfers ? t("txp.errLoadMove") : t("txp.errLoadTx");
  };

  useOnDataChanged(() => {
    loadTransactions();
    loadTransfers();
    loadSupportingData();
  });

  if (authLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-24 space-y-3">
        <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-medium text-slate-500">{t("common.loading")}</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex-1 flex flex-col min-h-screen relative">
      <Navbar title={t("txp.title")} subtitle={t("txp.subtitle")} />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-emerald-700 text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-xl animate-in fade-in slide-in-from-bottom-3 duration-200">
          {toastMessage}
        </div>
      )}

      <main className="flex-1 p-4 md:p-8 space-y-6 max-w-7xl w-full mx-auto">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white truncate">
              {t("txp.historyTitle")}
            </h2>
            <p className="text-xs text-slate-500 line-clamp-2">{t("txp.historySubtitle")}</p>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {actions.map(({ key, label, icon: Icon, onClick, color }) => (
              <button
                key={key}
                type="button"
                onClick={onClick}
                aria-label={label}
                title={label}
                className={`group inline-flex items-center justify-center gap-2.5 p-1.5 sm:pl-2.5 sm:pr-5 sm:py-2.5 rounded-2xl bg-gradient-to-br text-white text-xs font-bold shadow-md active:scale-95 transition-all cursor-pointer ${color}`}
              >
                <span className="w-9 h-9 sm:w-8 sm:h-8 rounded-xl bg-white/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <Icon className="w-5 h-5 sm:w-4 sm:h-4 text-white" />
                </span>
                <span className="hidden sm:inline">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Filters */}
        <TransactionFilter
          filters={filters}
          categories={categories}
          onFilterChange={handleFilterChange}
          onResetFilters={handleResetFilters}
        />

        {/* Content Table */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-3">
            <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-medium text-slate-500">{t("txp.loadingHistory")}</p>
          </div>
        ) : mainError ? (
          <div className="p-6 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-center space-y-4 max-w-md mx-auto my-12">
            <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
            <div>
              <h3 className="font-semibold text-rose-700 dark:text-rose-400 text-base">
                {t("txp.failedLoad")}
              </h3>
              <p className="text-xs text-rose-600 dark:text-rose-300 mt-1">{displayError(mainError)}</p>
            </div>
            <button
              onClick={retryMain}
              className="inline-flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              {t("common.tryAgain")}
            </button>
          </div>
        ) : (
          <>
            {moveWarning && (
              <div className="flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 text-[11px] text-amber-700 dark:text-amber-300">
                <span>{t("txp.moveWarning")}</span>
                <button
                  onClick={loadTransfers}
                  className="font-semibold underline underline-offset-2 cursor-pointer shrink-0"
                >
                  {t("common.tryAgain")}
                </button>
              </div>
            )}

            <TransactionTable
              transactions={showTransactions ? transactions : []}
              transfers={filteredTransfers}
              onEdit={handleOpenEdit}
              onDelete={(tx) => setDeleteTarget(tx)}
              onEditTransfer={handleOpenEditTransfer}
              onDeleteTransfer={(tf) => setDeleteTransferTarget(tf)}
            />
          </>
        )}
      </main>

      {/* Add / Edit Transaction Modal */}
      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialData={selectedTransaction}
        defaultType={defaultType}
        categories={categories}
        accounts={accounts}
        onSubmit={handleSaveTransaction}
        loading={modalLoading}
      />

      {/* Move Money Modal */}
      <TransferModal
        isOpen={isTransferModalOpen}
        onClose={handleCloseTransferModal}
        initialData={selectedTransfer}
        accounts={accounts}
        categories={categories}
        onSubmit={handleSaveTransfer}
        loading={transferLoading}
      />

      {/* Delete Transaction Confirm Modal */}
      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title={t("txp.deleteTxTitle")}
        description={
          <>
            {t("txp.deleteTxDescPre")}{" "}
            <span className="font-semibold text-slate-900 dark:text-white">"{deleteTarget?.title}"</span>
            {t("txp.deleteTxDescPost")}
          </>
        }
        confirmLabel={t("txp.deleteTxTitle")}
        variant="danger"
        loading={deleteLoading}
      />

      {/* Delete Move Confirm Modal */}
      <ConfirmModal
        isOpen={Boolean(deleteTransferTarget)}
        onClose={() => setDeleteTransferTarget(null)}
        onConfirm={handleDeleteTransferConfirm}
        title={t("txp.deleteMoveTitle")}
        description={
          <>
            {t("txp.deleteMoveDescPre")}{" "}
            <span className="font-semibold text-slate-900 dark:text-white">
              {deleteTransferTarget?.from_category_name}
            </span>{" "}
            {t("txp.deleteMoveDescTo")}{" "}
            <span className="font-semibold text-slate-900 dark:text-white">
              {deleteTransferTarget?.to_category_name}
            </span>
            {t("txp.deleteMoveDescPost")}
          </>
        }
        confirmLabel={t("txp.deleteMoveTitle")}
        variant="danger"
        loading={deleteTransferLoading}
      />
    </div>
  );
}