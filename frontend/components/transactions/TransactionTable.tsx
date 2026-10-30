"use client";

import { Transaction } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ArrowDownLeft, ArrowUpRight, Edit2, Trash2, Landmark } from "lucide-react";

interface TransactionTableProps {
  transactions: Transaction[];
  onEdit: (transaction: Transaction) => void;
  onDelete: (transaction: Transaction) => void;
}

export default function TransactionTable({ transactions, onEdit, onDelete }: TransactionTableProps) {
  if (transactions.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center shadow-xs">
        <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">No transactions found.</p>
        <p className="text-xs text-slate-400 mt-1">Adjust filters or record a new transaction.</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-slate-500 font-semibold uppercase tracking-wider">
              <th className="py-3.5 px-4">Date</th>
              <th className="py-3.5 px-4">Title</th>
              <th className="py-3.5 px-4">Category & Account</th>
              <th className="py-3.5 px-4">Type</th>
              <th className="py-3.5 px-4 text-right">Amount</th>
              <th className="py-3.5 px-4 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {transactions.map((tx) => {
              const isIncome = tx.type === "income";
              return (
                <tr
                  key={tx.id}
                  className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <td className="py-3.5 px-4 text-slate-500 font-medium whitespace-nowrap">
                    {formatDate(tx.transaction_date)}
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white">
                    <div>
                      {tx.title}
                      {tx.description && (
                        <p className="text-[11px] font-normal text-slate-400 line-clamp-1">{tx.description}</p>
                      )}
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex flex-col gap-1 items-start">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium">
                        {tx.categories?.name || "General"}
                      </span>
                      {tx.account && (
                        <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                          <Landmark className="w-3 h-3" />
                          {tx.account.name}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-semibold capitalize ${
                        isIncome
                          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
                          : "bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300"
                      }`}
                    >
                      {isIncome ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownLeft className="w-3 h-3" />}
                      {isIncome ? "Income" : "Expense"}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right font-bold">
                    <span className={isIncome ? "text-emerald-600 dark:text-emerald-400" : "text-slate-900 dark:text-white"}>
                      {isIncome ? "+" : "-"} {formatCurrency(Number(tx.amount))}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => onEdit(tx)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors cursor-pointer"
                        title="Edit transaction"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDelete(tx)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                        title="Delete transaction"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-800">
        {transactions.map((tx) => {
          const isIncome = tx.type === "income";
          return (
            <div key={tx.id} className="p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-semibold text-slate-900 dark:text-white text-sm">{tx.title}</h4>
                  <div className="flex flex-wrap items-center gap-1.5 mt-1">
                    <span className="text-xs px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium">
                      {tx.categories?.name || "General"}
                    </span>
                    {tx.account && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium">
                        <Landmark className="w-2.5 h-2.5" />
                        {tx.account.name}
                      </span>
                    )}
                    <span className="text-xs text-slate-400">{formatDate(tx.transaction_date)}</span>
                  </div>
                </div>
                <span
                  className={`font-semibold text-sm ${
                    isIncome ? "text-emerald-600 dark:text-emerald-400" : "text-slate-900 dark:text-white"
                  }`}
                >
                  {isIncome ? "+" : "-"} {formatCurrency(Number(tx.amount))}
                </span>
              </div>

              {tx.description && <p className="text-xs text-slate-500">{tx.description}</p>}

              <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-50 dark:border-slate-800/60">
                <button
                  onClick={() => onEdit(tx)}
                  className="flex items-center gap-1 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-emerald-600 cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  Edit
                </button>
                <button
                  onClick={() => onDelete(tx)}
                  className="flex items-center gap-1 text-xs font-medium text-rose-600 hover:text-rose-700 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
