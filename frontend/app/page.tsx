"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/layout/Navbar";
import SummaryCard from "@/components/dashboard/SummaryCard";
import RecentTransactions from "@/components/dashboard/RecentTransactions";
import ExpenseOverview from "@/components/dashboard/ExpenseOverview";
import { DashboardData, getDashboard } from "@/lib/api";
import { AlertCircle, RefreshCw } from "lucide-react";

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getDashboard();
      setData(res.data);
    } catch (err: any) {
      console.error("Dashboard error:", err);
      setError(err.message || "Failed to load dashboard data. Make sure backend is running.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <Navbar title="Dashboard" subtitle="Manage your money, simply." />

      <main className="flex-1 p-4 md:p-8 space-y-6 max-w-7xl w-full mx-auto">
        {loading ? (
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
              className="inline-flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </button>
          </div>
        ) : data ? (
          <>
            {/* Summary Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <SummaryCard title="Total Balance" amount={data.balance} type="balance" />
              <SummaryCard title="Total Income" amount={data.totalIncome} type="income" />
              <SummaryCard title="Total Expense" amount={data.totalExpense} type="expense" />
              <SummaryCard
                title="Transactions"
                amount={data.totalTransactions}
                countValue={data.totalTransactions}
                type="count"
              />
            </div>

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
