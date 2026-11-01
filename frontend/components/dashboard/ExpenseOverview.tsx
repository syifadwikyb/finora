import { formatCurrency } from "@/lib/utils";
import { PieChart } from "lucide-react";

interface ExpenseOverviewProps {
  expenseOverview: {
    categoryName: string;
    totalAmount: number;
    percentage: number;
  }[];
}

export default function ExpenseOverview({ expenseOverview }: ExpenseOverviewProps) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col h-full">
      <div className="pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
        <h3 className="font-bold text-slate-900 dark:text-white text-base">Expense Overview</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">Expense distribution by category</p>
      </div>

      {expenseOverview.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-8 text-center">
          <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-3">
            <PieChart className="w-6 h-6" />
          </div>
          <p className="text-sm font-medium text-slate-600 dark:text-slate-300">No expense records yet.</p>
          <p className="text-xs text-slate-400 mt-1">Expenses will be grouped here automatically.</p>
        </div>
      ) : (
        <div className="space-y-4 flex-1">
          {expenseOverview.map((item, idx) => {
            const colors = [
              "bg-emerald-500",
              "bg-indigo-500",
              "bg-amber-500",
              "bg-sky-500",
              "bg-rose-500",
              "bg-purple-500",
            ];
            const barColor = colors[idx % colors.length];

            return (
              <div key={item.categoryName} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">{item.categoryName}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 dark:text-white">{formatCurrency(item.totalAmount)}</span>
                    <span className="text-slate-400 font-medium w-9 text-right">{item.percentage}%</span>
                  </div>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${barColor} transition-all duration-500`}
                    style={{ width: `${Math.max(item.percentage, 3)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
