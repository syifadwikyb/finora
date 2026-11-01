"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import TransactionFilter from "@/components/transactions/TransactionFilter";
import TransactionTable from "@/components/transactions/TransactionTable";
import TransactionModal from "@/components/transactions/TransactionModal";
import ConfirmModal from "@/components/ui/ConfirmModal";
import {
  Category,
  Transaction,
  TransactionFilters,
  createTransaction,
  deleteTransaction,
  getCategories,
  getTransactions,
  updateTransaction,
} from "@/lib/api";
import { AlertCircle, Plus, RefreshCw } from "lucide-react";

export default function TransactionsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
  const [modalLoading, setModalLoading] = useState(false);

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

  const loadCategories = async () => {
    try {
      const res = await getCategories();
      setCategories(res.data);
    } catch (err) {
      console.error("Failed to load categories", err);
    }
  };

  const loadTransactions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getTransactions(filters);
      setTransactions(res.data);
    } catch (err: any) {
      console.error("Error loading transactions:", err);
      setError(err.message || "Failed to load transactions.");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    if (user && !authLoading) {
      loadCategories();
    }
  }, [user, authLoading]);

  useEffect(() => {
    if (user && !authLoading) {
      loadTransactions();
    }
  }, [user, authLoading, loadTransactions]);

  const handleFilterChange = (newFilters: Partial<TransactionFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const handleResetFilters = () => {
    setFilters({ type: "", category_id: "", date: "", search: "" });
  };

  const handleOpenAdd = () => {
    setSelectedTransaction(null);
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
        showToast("Transaction updated.");
      } else {
        await createTransaction(formData);
        showToast("Transaction recorded.");
      }
      setIsModalOpen(false);
      loadTransactions();
    } catch (err: any) {
      throw err;
    } finally {
      setModalLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await deleteTransaction(deleteTarget.id);
      showToast("Transaction deleted.");
      setDeleteTarget(null);
      loadTransactions();
    } catch (err: any) {
      showToast(err.message || "Failed to delete transaction");
    } finally {
      setDeleteLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-24 space-y-3">
        <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-medium text-slate-500">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex-1 flex flex-col min-h-screen relative">
      <Navbar title="Transactions" subtitle="Track and manage your expenses and income." />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-emerald-700 text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-xl animate-in fade-in slide-in-from-bottom-3 duration-200">
          {toastMessage}
        </div>
      )}

      <main className="flex-1 p-4 md:p-8 space-y-6 max-w-7xl w-full mx-auto">
        {/* Filters */}
        <TransactionFilter
          filters={filters}
          categories={categories}
          onFilterChange={handleFilterChange}
          onResetFilters={handleResetFilters}
        />

        {/* Content Table */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-3">
            <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-medium text-slate-500">Loading transactions...</p>
          </div>
        ) : error ? (
          <div className="p-6 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-center space-y-4 max-w-md mx-auto my-12">
            <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
            <div>
              <h3 className="font-semibold text-rose-700 dark:text-rose-400 text-base">Failed to Load</h3>
              <p className="text-xs text-rose-600 dark:text-rose-300 mt-1">{error}</p>
            </div>
            <button
              onClick={loadTransactions}
              className="inline-flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </button>
          </div>
        ) : (
          <TransactionTable
            transactions={transactions}
            onEdit={handleOpenEdit}
            onDelete={(tx) => setDeleteTarget(tx)}
          />
        )}
      </main>

      {/* Add / Edit Transaction Modal */}
      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialData={selectedTransaction}
        categories={categories}
        onSubmit={handleSaveTransaction}
        loading={modalLoading}
      />

      {/* Consistent Delete Confirm Modal */}
      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Transaction"
        description={
          <>
            Are you sure you want to delete <span className="font-semibold text-slate-900 dark:text-white">"{deleteTarget?.title}"</span>? The related account balance will automatically adjust.
          </>
        }
        confirmLabel="Delete Transaction"
        variant="danger"
        loading={deleteLoading}
      />
    </div>
  );
}
