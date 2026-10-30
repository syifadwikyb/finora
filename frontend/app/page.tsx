"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { useRouter } from "next/navigation";

import { DashboardData, getDashboard } from "@/lib/api";
import { AlertCircle, RefreshCw, Landmark, Tags } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import SummaryCard from "@/components/dashboard/SummaryCard";
import RecentTransactions from "@/components/dashboard/RecentTransactions";
import ExpenseOverview from "@/components/dashboard/ExpenseOverview";
import { formatCurrency } from "@/lib/utils";

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login");
    }
  }, [authLoading, user, router]);

  const fetchDashboardData = async () => {
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
  };

  useEffect(() => {
    if (user && !authLoading) {
      fetchDashboardData();
    } else if (!user) {
      setData(null);
    }
  }, [user, authLoading]);

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
    <div className="flex-1 flex flex-col min-h-screen pb-16">
      <Navbar title="Dashboard" subtitle="Overview of your envelope accounts and category balances." />

      <main className="flex-1 p-4 md:p-8 space-y-6 max-w-7xl w-full mx-auto">
        {dashboardLoading ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-3">
            <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-medium text-slate-500">Loading dashboard...</p>
          </div>
        ) : error ? (
          <div className="p-6 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-center space-y-4 max-w-md mx-auto my-12">
            <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
            <div>
              <h3 className="font-bold text-rose-700 dark:text-rose-400 text-base">Dashboard Error</h3>
              <p className="text-xs text-rose-600 dark:text-rose-300 mt-1">{error}</p>
            </div>
            <button
              onClick={fetchDashboardData}
              className="inline-flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </button>
          </div>
        ) : data ? (
          <>
            {/* Summary Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <SummaryCard title="Total Cash Balance" amount={data.balance} type="balance" />
              <SummaryCard title="Total Income" amount={data.totalIncome} type="income" />
              <SummaryCard title="Total Expenses" amount={data.totalExpense} type="expense" />
              <SummaryCard
                title="Transactions"
                amount={data.totalTransactions}
                countValue={data.totalTransactions}
                type="count"
              />
            </div>

            {/* Quick Accounts & Linked Categories Overview */}
            {data.accountsSummary && data.accountsSummary.length > 0 && (
              <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-base">Accounts & Envelopes</h3>
                    <p className="text-xs text-slate-500">Physical bank accounts and linked categories</p>
                  </div>
                  <button
                    onClick={() => router.push("/accounts")}
                    className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 cursor-pointer"
                  >
                    Manage Accounts &rarr;
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {data.accountsSummary.map((acc) => (
                    <div
                      key={acc.id}
                      className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-3"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                            <Landmark className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="font-bold text-xs text-slate-900 dark:text-white">{acc.name}</h4>
                            <span className="text-[10px] text-slate-400 uppercase">{acc.type}</span>
                          </div>
                        </div>
                        <span className="text-xs font-extrabold text-slate-900 dark:text-white">
                          {formatCurrency(Number(acc.current_balance))}
                        </span>
                      </div>

                      <div className="pt-2 border-t border-slate-200/50 dark:border-slate-700/50 space-y-1.5">
                        <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          Categories ({acc.categories?.length || 0})
                        </span>
                        {acc.categories && acc.categories.length > 0 ? (
                          <div className="space-y-1">
                            {acc.categories.slice(0, 3).map((cat) => (
                              <div key={cat.id} className="flex items-center justify-between text-xs">
                                <span className="text-slate-600 dark:text-slate-300 flex items-center gap-1">
                                  <Tags className="w-3 h-3 text-emerald-500" />
                                  {cat.name}
                                </span>
                                <span className="font-semibold text-emerald-600 dark:text-emerald-400 text-[11px]">
                                  {formatCurrency(Number(cat.current_balance || 0))}
                                </span>
                              </div>
                            ))}
                            {acc.categories.length > 3 && (
                              <p className="text-[10px] text-slate-400 italic">
                                +{acc.categories.length - 3} more categories...
                              </p>
                            )}
                          </div>
                        ) : (
                          <p className="text-[11px] text-slate-400 italic">No categories linked yet.</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Main Content Grid: Recent Transactions & Expense Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <RecentTransactions transactions={data.recentTransactions} />
              </div>
              <div>
                <ExpenseOverview expenseOverview={data.expenseOverview} />
              </div>
            </div>
          </>
        ) : null}
      </main>
    </div>
  );
}
