"use client";

import { useMemo } from "react";
import { Transaction, Transfer } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  ArrowDownLeft,
  ArrowLeftRight,
  ArrowRight,
  ArrowUpRight,
  Edit2,
  Landmark,
  Trash2,
} from "lucide-react";

interface TransactionTableProps {
  transactions: Transaction[];
  // Riwayat Move Money; digabung dan diurutkan bersama transaksi
  transfers?: Transfer[];
  onEdit: (transaction: Transaction) => void;
  onDelete: (transaction: Transaction) => void;
}

type Entry =
  | { kind: "transaction"; key: string; date: string; created: string; id: number; tx: Transaction }
  | { kind: "transfer"; key: string; date: string; created: string; id: number; tf: Transfer };

// Nama akun asal -> tujuan (atau "Within X" jika akunnya sama)
const accountRoute = (tf: Transfer) => {
  if (!tf.from_account_name && !tf.to_account_name) return null;
  if (tf.from_account_name && tf.from_account_name === tf.to_account_name) {
    return `Within ${tf.from_account_name}`;
  }
  return `${tf.from_account_name || "-"} → ${tf.to_account_name || "-"}`;
};

export default function TransactionTable({
  transactions,
  transfers = [],
  onEdit,
  onDelete,
}: TransactionTableProps) {
  // Gabungkan transaksi + transfer, urut tanggal terbaru dulu
  const entries = useMemo<Entry[]>(() => {
    const list: Entry[] = [
      ...transactions.map((tx) => ({
        kind: "transaction" as const,
        key: `tx-${tx.id}`,
        date: String(tx.transaction_date).slice(0, 10),
        created: tx.created_at || "",
        id: tx.id,
        tx,
      })),
      ...transfers.map((tf) => ({
        kind: "transfer" as const,
        key: `tf-${tf.id}`,
        date: String(tf.transfer_date).slice(0, 10),
        created: tf.created_at || "",
        id: tf.id,
        tf,
      })),
    ];
    return list.sort(
      (a, b) => b.date.localeCompare(a.date) || b.created.localeCompare(a.created) || b.id - a.id
    );
  }, [transactions, transfers]);

  if (entries.length === 0) {
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
            {entries.map((entry) => {
              /* ============ BARIS MOVE MONEY ============ */
              if (entry.kind === "transfer") {
                const tf = entry.tf;
                const route = accountRoute(tf);
                return (
                  <tr
                    key={entry.key}
                    className="bg-indigo-50/30 dark:bg-indigo-950/10 hover:bg-indigo-50/60 dark:hover:bg-indigo-950/20 transition-colors"
                  >
                    <td className="py-3.5 px-4 text-slate-500 font-medium whitespace-nowrap">
                      {formatDate(tf.transfer_date)}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white">
                      <div>
                        Move Money
                        {tf.note && (
                          <p className="text-[11px] font-normal text-slate-400 line-clamp-1">{tf.note}</p>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col gap-1 items-start">
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 font-medium">
                          <span className="truncate max-w-[110px]">{tf.from_category_name || "Unknown"}</span>
                          <ArrowRight className="w-3 h-3 shrink-0" />
                          <span className="truncate max-w-[110px]">{tf.to_category_name || "Unknown"}</span>
                        </span>
                        {route && (
                          <span className="inline-flex items-center gap-1 text-[10px] text-indigo-600 dark:text-indigo-400 font-medium">
                            <Landmark className="w-3 h-3" />
                            {route}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-semibold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
                        <ArrowLeftRight className="w-3 h-3" />
                        Move
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold">
                      <span className="text-indigo-600 dark:text-indigo-400">
                        {formatCurrency(Number(tf.amount))}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center text-slate-300 dark:text-slate-600">—</td>
                  </tr>
                );
              }

              /* ============ BARIS TRANSAKSI ============ */
              const tx = entry.tx;
              const isIncome = tx.type === "income";
              return (
                <tr
                  key={entry.key}
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
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-semibold capitalize ${isIncome
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
        {entries.map((entry) => {
          /* ============ KARTU MOVE MONEY ============ */
          if (entry.kind === "transfer") {
            const tf = entry.tf;
            const route = accountRoute(tf);
            return (
              <div key={entry.key} className="p-4 space-y-2 bg-indigo-50/30 dark:bg-indigo-950/10">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                      <ArrowLeftRight className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-semibold text-slate-900 dark:text-white text-sm">Move Money</h4>
                      <div className="flex items-center gap-1.5 mt-1 text-xs font-medium text-indigo-700 dark:text-indigo-300 min-w-0">
                        <span className="truncate">{tf.from_category_name || "Unknown"}</span>
                        <ArrowRight className="w-3 h-3 shrink-0" />
                        <span className="truncate">{tf.to_category_name || "Unknown"}</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-1.5 mt-1">
                        {route && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center gap-1 font-medium">
                            <Landmark className="w-2.5 h-2.5" />
                            {route}
                          </span>
                        )}
                        <span className="text-xs text-slate-400">{formatDate(tf.transfer_date)}</span>
                      </div>
                    </div>
                  </div>
                  <span className="font-semibold text-sm text-indigo-600 dark:text-indigo-400 shrink-0">
                    {formatCurrency(Number(tf.amount))}
                  </span>
                </div>

                {tf.note && <p className="text-xs text-slate-500 pl-12">{tf.note}</p>}
              </div>
            );
          }

          /* ============ KARTU TRANSAKSI ============ */
          const tx = entry.tx;
          const isIncome = tx.type === "income";
          return (
            <div key={entry.key} className="p-4 space-y-3">
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
                  className={`font-semibold text-sm ${isIncome ? "text-emerald-600 dark:text-emerald-400" : "text-slate-900 dark:text-white"
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