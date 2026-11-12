import Link from "next/link";
import { Transaction, Transfer } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ArrowDownLeft, ArrowLeftRight, ArrowUpRight, ChevronRight, Receipt } from "lucide-react";

interface RecentTransactionsProps {
  transactions: Transaction[];
  transfers?: Transfer[];
}

type ActivityItem =
  | { kind: "transaction"; key: string; time: number; tx: Transaction }
  | { kind: "transfer"; key: string; time: number; tf: Transfer };

const toTime = (value?: string) => (value ? new Date(value).getTime() || 0 : 0);

export default function RecentTransactions({ transactions, transfers = [] }: RecentTransactionsProps) {
  const items: ActivityItem[] = [
    ...transactions.map((tx) => ({
      kind: "transaction" as const,
      key: `tx-${tx.id}`,
      time: toTime(tx.transaction_date),
      tx,
    })),
    ...transfers.map((tf) => ({
      kind: "transfer" as const,
      key: `tf-${tf.id}`,
      time: toTime(tf.transfer_date),
      tf,
    })),
  ]
    .sort((a, b) => b.time - a.time)
    .slice(0, 5);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col h-full">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
        <div>
          <h3 className="font-bold text-slate-900 dark:text-white text-base">Recent Transactions</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Latest financial activities</p>
        </div>
        <Link
          href="/transactions"
          className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 flex items-center gap-1 group"
        >
          View All
          <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-8 text-center">
          <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-3">
            <Receipt className="w-6 h-6" />
          </div>
          <p className="text-sm font-medium text-slate-600 dark:text-slate-300">No transactions yet.</p>
          <p className="text-xs text-slate-400 mt-1">Add your first transaction to get started.</p>
          <Link
            href="/transactions"
            className="mt-4 px-4 py-2 bg-emerald-700 hover:bg-emerald-700 text-white text-xs font-medium rounded-lg transition-colors"
          >
            Add Transaction
          </Link>
        </div>
      ) : (
        <div className="space-y-3 flex-1">
          {items.map((item) => {
            if (item.kind === "transfer") {
              const { tf } = item;
              const sameAccount = tf.from_account_name === tf.to_account_name;
              const route = sameAccount
                ? `${tf.from_category_name || "—"} → ${tf.to_category_name || "—"}`
                : `${tf.from_account_name || "—"} → ${tf.to_account_name || "—"}`;

              return (
                <div
                  key={item.key}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors border border-transparent hover:border-slate-100 dark:hover:border-slate-800"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
                      <ArrowLeftRight className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-semibold text-sm text-slate-900 dark:text-white line-clamp-1">
                        {tf.note || "Money transfer"}
                      </h4>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-medium truncate">
                          {route}
                        </span>
                        <span className="text-xs text-slate-400 shrink-0">{formatDate(tf.transfer_date)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right pl-2 shrink-0">
                    <span className="font-bold text-sm text-indigo-600 dark:text-indigo-400">
                      {formatCurrency(Number(tf.amount))}
                    </span>
                  </div>
                </div>
              );
            }

            const { tx } = item;
            const isIncome = tx.type === "income";
            return (
              <div
                key={item.key}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors border border-transparent hover:border-slate-100 dark:hover:border-slate-800"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isIncome
                      ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400"
                      : "bg-rose-100 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400"
                      }`}
                  >
                    {isIncome ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownLeft className="w-5 h-5" />}
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-slate-900 dark:text-white line-clamp-1">{tx.title}</h4>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium">
                        {tx.categories?.name || "Uncategorized"}
                      </span>
                      <span className="text-xs text-slate-400">{formatDate(tx.transaction_date)}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right pl-2 shrink-0">
                  <span
                    className={`font-bold text-sm ${isIncome ? "text-emerald-600 dark:text-emerald-400" : "text-slate-900 dark:text-white"
                      }`}
                  >
                    {isIncome ? "+" : "-"} {formatCurrency(Number(tx.amount))}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
