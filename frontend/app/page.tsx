"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { useRouter } from "next/navigation";
import { useOnDataChanged } from "@/lib/dataEvents";

import {
  DashboardData,
  Category,
  Account,
  getDashboard,
  getCategories,
  getAccounts,
  createTransaction,
  createTransfer,
} from "@/lib/api";
import {
  AlertCircle,
  RefreshCw,
  Landmark,
  Tags,
  PlusCircle,
  MinusCircle,
  ArrowLeftRight,
  ArrowRight,
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import SummaryCard from "@/components/dashboard/SummaryCard";
import RecentTransactions from "@/components/dashboard/RecentTransactions";
import ExpenseOverview from "@/components/dashboard/ExpenseOverview";
import TransactionModal from "@/components/transactions/TransactionModal";
import TransferModal from "@/components/transactions/TransferModal";
import { formatCurrency } from "@/lib/utils";

// Total saldo = jumlah saldo kategori per akun (fallback ke saldo akun / balance)
const getCashBalance = (d: DashboardData) =>
  d.accountsSummary && d.accountsSummary.length > 0
    ? d.accountsSummary.reduce((acc, a) => {
      const sumCat = a.categories?.reduce((s, c) => s + Number(c.current_balance || 0), 0) || 0;
      return acc + (sumCat > 0 ? sumCat : Number(a.current_balance || 0));
    }, 0)
    : d.balance;

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Lists for modals
  const [categories, setCategories] = useState<Category[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);

  // Modal states
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [txDefaultType, setTxDefaultType] = useState<"income" | "expense">("income");
  const [txLoading, setTxLoading] = useState(false);

  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [transferLoading, setTransferLoading] = useState(false);

  // Toast message
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login");
    }
  }, [authLoading, user, router]);

  const loadSupportingData = async () => {
    try {
      const [catRes, accRes] = await Promise.all([
        getCategories().catch(() => ({ data: [] })),
        getAccounts().catch(() => ({ data: [] })),
      ]);
      setCategories(catRes.data || []);
      setAccounts(accRes.data || []);
    } catch (err) {
      console.error("Failed to load supporting data:", err);
    }
  };

  const fetchDashboardData = useCallback(async () => {
    if (!user) return;
    setDashboardLoading(true);
    setError(null);
    try {
      const res = await getDashboard();
      setData(res.data);
    } catch (err: any) {
      console.error("Dashboard error:", err);
      setError(err.message || "Failed to load dashboard data.");
    } finally {
      setDashboardLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user && !authLoading) {
      fetchDashboardData();
      loadSupportingData();
    } else if (!user) {
      setData(null);
    }
  }, [user, authLoading, fetchDashboardData]);

  // Modal Handlers
  const handleOpenTransaction = (type: "income" | "expense") => {
    setTxDefaultType(type);
    setIsTxModalOpen(true);
  };

  const handleSaveTransaction = async (formData: any) => {
    setTxLoading(true);
    try {
      await createTransaction(formData);
      showToast(`${formData.type === "income" ? "Income" : "Expense"} recorded.`);
      setIsTxModalOpen(false);
      fetchDashboardData();
      loadSupportingData();
    } catch (err: any) {
      throw err;
    } finally {
      setTxLoading(false);
    }
  };

  const quickActions = [
    {
      key: "income",
      label: "Income",
      icon: PlusCircle,
      onClick: () => handleOpenTransaction("income"),
      color: "from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 shadow-emerald-500/25",
    },
    {
      key: "expense",
      label: "Expense",
      icon: MinusCircle,
      onClick: () => handleOpenTransaction("expense"),
      color: "from-rose-600 to-rose-500 hover:from-rose-700 hover:to-rose-600 shadow-rose-500/25",
    },
    {
      key: "transfer",
      label: "Move Money",
      icon: ArrowLeftRight,
      onClick: () => setIsTransferModalOpen(true),
      color: "from-indigo-600 to-indigo-500 hover:from-indigo-700 hover:to-indigo-600 shadow-indigo-500/25",
    },
  ];

  const handleSaveTransfer = async (formData: any) => {
    setTransferLoading(true);
    try {
      await createTransfer(formData);
      showToast("Money moved successfully.");
      setIsTransferModalOpen(false);
      fetchDashboardData();
      loadSupportingData();
    } catch (err: any) {
      throw err;
    } finally {
      setTransferLoading(false);
    }
  };

  useOnDataChanged(() => {
    fetchDashboardData();
    loadSupportingData();
  });

  if (authLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-3">
        <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-medium text-slate-500">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex-1 flex flex-col min-h-screen pb-24 md:pb-8">
      <Navbar title="Dashboard" subtitle="Overview of your accounts, envelopes, and rapid actions." />

      {/* Floating Toast */}
      {toastMessage && (
        <div className="fixed bottom-24 md:bottom-6 left-4 right-4 sm:left-auto sm:right-6 z-50 bg-slate-900 text-white dark:bg-emerald-700 px-4 py-3 rounded-xl shadow-xs text-xs font-semibold text-center sm:text-left animate-in fade-in slide-in-from-bottom-2">
          {toastMessage}
        </div>
      )}

      <main className="flex-1 p-3 sm:p-4 md:p-6 lg:p-8 space-y-4 md:space-y-6 max-w-7xl w-full mx-auto">
        {/* ================= SUMMARY (Cash Balance, Income, Expenses) ================= */}
        {dashboardLoading ? (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-4 animate-pulse" aria-busy="true">
            <span className="sr-only">Loading dashboard...</span>
            <div className="col-span-2 lg:col-span-1 h-24 rounded-2xl bg-slate-200 dark:bg-slate-800" />
            <div className="h-24 rounded-2xl bg-slate-200 dark:bg-slate-800" />
            <div className="h-24 rounded-2xl bg-slate-200 dark:bg-slate-800" />
          </div>
        ) : error ? (
          <div className="p-6 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-center space-y-4 max-w-md mx-auto my-4">
            <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
            <div>
              <h3 className="font-bold text-rose-700 dark:text-rose-400 text-base">Dashboard Error</h3>
              <p className="text-xs text-rose-600 dark:text-rose-300 mt-1 break-words">{error}</p>
            </div>
            <button
              onClick={fetchDashboardData}
              className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </button>
          </div>
        ) : data ? (
          <section aria-label="Summary" className="grid grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-4">
            <div className="col-span-2 lg:col-span-1">
              <SummaryCard title="Cash Balance" amount={getCashBalance(data)} type="balance" />
            </div>
            <SummaryCard title="Total Income" amount={data.totalIncome} type="income" />
            <SummaryCard title="Total Expenses" amount={data.totalExpense} type="expense" />
          </section>
        ) : null}

        {/* ================= QUICK ACTIONS (tepat di bawah Income & Expenses) ================= */}
        <section aria-label="Quick Actions" className="space-y-2">
          <h2 className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-1">
            Quick Actions
          </h2>
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            {quickActions.map(({ key, label, icon: Icon, onClick, color }) => (
              <button
                key={key}
                type="button"
                onClick={onClick}
                className={`flex flex-col lg:flex-row items-center justify-center gap-2 lg:gap-3 px-2 py-3.5 lg:px-4 rounded-2xl bg-gradient-to-br text-white shadow-md active:scale-95 transition-all group cursor-pointer ${color}`}
              >
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <span className="text-xs lg:text-sm font-bold leading-tight text-center whitespace-nowrap">
                  {label}
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* ================= REST OF CONTENT ================= */}
        {dashboardLoading ? (
          <div className="space-y-4 animate-pulse" aria-hidden="true">
            <div className="h-48 rounded-3xl bg-slate-200 dark:bg-slate-800" />
            <div className="h-40 rounded-3xl bg-slate-200 dark:bg-slate-800" />
          </div>
        ) : !error && data ? (
          <>
            {/* Accounts & Envelopes */}
            {data.accountsSummary && data.accountsSummary.length > 0 && (
              <section
                aria-label="Accounts and Envelopes"
                className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl md:rounded-3xl p-4 sm:p-5 shadow-xs"
              >
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div className="min-w-0">
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">
                      Accounts &amp; Envelopes
                    </h3>
                    <p className="text-[11px] sm:text-xs text-slate-500 truncate">
                      Physical bank accounts and category allocations
                    </p>
                  </div>
                  <button
                    onClick={() => router.push("/accounts")}
                    className="shrink-0 text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 px-2 py-1.5 -mr-2 rounded-lg active:bg-emerald-50 dark:active:bg-emerald-950/40 cursor-pointer"
                  >
                    View All
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {data.accountsSummary.map((acc) => {
                    const categorySum =
                      acc.categories?.reduce((sum, cat) => sum + Number(cat.current_balance || 0), 0) || 0;
                    const displayBalance = categorySum > 0 ? categorySum : Number(acc.current_balance || 0);

                    return (
                      <div
                        key={acc.id}
                        className="p-3.5 rounded-xl sm:rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-2.5"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                              <Landmark className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                                {acc.name}
                              </h4>
                              <span className="text-[10px] text-slate-400 uppercase tracking-wider">{acc.type}</span>
                            </div>
                          </div>
                          <span className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white shrink-0">
                            {formatCurrency(displayBalance)}
                          </span>
                        </div>

                        <div className="pt-2 border-t border-slate-200/50 dark:border-slate-700/50 space-y-1.5">
                          <div className="flex items-center justify-between text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                            <span>Categories</span>
                            <span>{acc.categories?.length || 0}</span>
                          </div>
                          {acc.categories && acc.categories.length > 0 ? (
                            <div className="space-y-1.5">
                              {acc.categories.map((cat) => (
                                <div key={cat.id} className="flex items-center justify-between gap-2 text-xs">
                                  <span className="text-slate-600 dark:text-slate-300 flex items-center gap-1.5 min-w-0">
                                    <Tags className="w-3 h-3 text-emerald-500 shrink-0" />
                                    <span className="truncate">{cat.name}</span>
                                  </span>
                                  <span className="font-semibold text-emerald-600 dark:text-emerald-400 text-[11px] shrink-0">
                                    {formatCurrency(Number(cat.current_balance || 0))}
                                  </span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-[10px] text-slate-400 italic">No categories linked yet.</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Expense Overview (mobile & desktop) + Recent Transactions (desktop) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-5">
              <div className="hidden md:block lg:col-span-2">
                <RecentTransactions transactions={data.recentTransactions} transfers={data.recentTransfers} />
              </div>
              <div className="lg:col-span-1">
                <ExpenseOverview expenseOverview={data.expenseOverview} />
              </div>
            </div>
          </>
        ) : null}
      </main>

      {/* Transaction Modal for Income / Expense */}
      <TransactionModal
        isOpen={isTxModalOpen}
        onClose={() => setIsTxModalOpen(false)}
        defaultType={txDefaultType}
        categories={categories}
        onSubmit={handleSaveTransaction}
        loading={txLoading}
      />

      {/* Transfer Modal untuk Move Money */}
      <TransferModal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        accounts={accounts}
        categories={categories}
        onSubmit={handleSaveTransfer}
        loading={transferLoading}
      />
    </div>
  );
}