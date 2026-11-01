import { formatCurrency } from "@/lib/utils";
import { ArrowDownRight, ArrowUpRight, LucideIcon, Scale, Wallet } from "lucide-react";

interface SummaryCardProps {
  title: string;
  amount: number;
  type?: "balance" | "income" | "expense" | "count";
  countValue?: number;
  icon?: LucideIcon;
}

export default function SummaryCard({ title, amount, type = "balance", countValue }: SummaryCardProps) {
  let bgColor = "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800";
  let iconBg = "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400";
  let amountColor = "text-slate-900 dark:text-white";
  let Icon = Wallet;

  if (type === "income") {
    iconBg = "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400";
    amountColor = "text-emerald-600 dark:text-emerald-400";
    Icon = ArrowUpRight;
  } else if (type === "expense") {
    iconBg = "bg-rose-100 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400";
    amountColor = "text-rose-600 dark:text-rose-400";
    Icon = ArrowDownRight;
  } else if (type === "count") {
    iconBg = "bg-indigo-100 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400";
    Icon = Scale;
  }

  return (
    <div className={`p-5 rounded-2xl border shadow-xs transition-all hover:shadow-md ${bgColor}`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {title}
        </span>
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${iconBg}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div className="flex items-baseline justify-between">
        <h2 className={`text-xl md:text-2xl font-bold tracking-tight ${amountColor}`}>
          {type === "count" ? countValue ?? amount : formatCurrency(amount)}
        </h2>
      </div>
    </div>
  );
}
