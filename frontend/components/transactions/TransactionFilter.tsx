"use client";

import { useState, useEffect } from "react";
import { Category, TransactionFilters } from "@/lib/api";
import { Filter, Search, X } from "lucide-react";

interface TransactionFilterProps {
  filters: TransactionFilters;
  categories: Category[];
  onFilterChange: (newFilters: Partial<TransactionFilters>) => void;
  onResetFilters: () => void;
}

export default function TransactionFilter({
  filters,
  categories,
  onFilterChange,
  onResetFilters,
}: TransactionFilterProps) {
  const activeType = filters.type || "";
  const [searchTerm, setSearchTerm] = useState(filters.search || "");

  // Sync internal search state if filters.search is cleared from outside
  useEffect(() => {
    setSearchTerm(filters.search || "");
  }, [filters.search]);

  // Debounce logic: wait 500ms after user stops typing before triggering API request
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm !== (filters.search || "")) {
        onFilterChange({ search: searchTerm });
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm, filters.search, onFilterChange]);

  const handleReset = () => {
    setSearchTerm("");
    onResetFilters();
  };

  const hasActiveFilters =
    Boolean(filters.type) ||
    Boolean(filters.category_id) ||
    Boolean(filters.date) ||
    Boolean(filters.start_date) ||
    Boolean(filters.end_date) ||
    Boolean(searchTerm);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs space-y-4">
      {/* Top Bar: Type selector & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Type selector: 4 kolom sama lebar di mobile */}
        <div className="grid grid-cols-4 sm:flex items-center gap-1 sm:gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl w-full sm:w-fit">
          <button
            onClick={() => onFilterChange({ type: "" })}
            className={`px-2 sm:px-3 py-1.5 rounded-lg text-xs font-semibold text-center transition-all ${activeType === ""
              ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
          >
            All
          </button>
          <button
            onClick={() => onFilterChange({ type: "income" })}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${activeType === "income"
              ? "bg-emerald-700 text-white shadow-xs"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
          >
            Income
          </button>
          <button
            onClick={() => onFilterChange({ type: "expense" })}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${activeType === "expense"
              ? "bg-rose-600 text-white shadow-xs"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
          >
            Expense
          </button>
          <button
            onClick={() => onFilterChange({ type: "transfer" })}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${activeType === "transfer"
              ? "bg-indigo-600 text-white shadow-xs"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
          >
            Move
          </button>
        </div>

        {/* Debounced Search Bar */}
        <div className="relative w-full sm:flex-1 sm:max-w-xs">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search transactions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Bottom Bar: Category, Single Date & Range Date */}
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3 sm:space-y-0 sm:flex sm:flex-wrap sm:items-center sm:gap-3">
        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
          <Filter className="w-3.5 h-3.5" />
          Filter:
        </div>

        {/* Category dropdown */}
        <select
          value={filters.category_id || ""}
          onChange={(e) => onFilterChange({ category_id: e.target.value })}
          className="w-full sm:w-auto px-3 py-2 sm:py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:border-emerald-500"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>

        {/* Date Range: 2 kolom sama lebar di mobile, "s/d" di desktop */}
        <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center sm:gap-1.5">
          <label className="block min-w-0">
            <span className="sm:hidden block mb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              From
            </span>
            <input
              type="date"
              value={filters.start_date || ""}
              onChange={(e) => onFilterChange({ date: "", start_date: e.target.value })}
              className="w-full min-w-0 px-3 py-2 sm:py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:border-emerald-500"
            />
          </label>

          <span className="hidden sm:inline text-xs text-slate-400">s/d</span>

          <label className="block min-w-0">
            <span className="sm:hidden block mb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              To
            </span>
            <input
              type="date"
              value={filters.end_date || ""}
              onChange={(e) => onFilterChange({ date: "", end_date: e.target.value })}
              className="w-full min-w-0 px-3 py-2 sm:py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:border-emerald-500"
            />
          </label>
        </div>

        {/* Reset Button */}
        {hasActiveFilters && (
          <button
            onClick={handleReset}
            className="w-full sm:w-auto flex items-center justify-center gap-1 px-2.5 py-2 sm:py-1.5 rounded-lg text-xs font-semibold text-rose-600 bg-rose-50/60 sm:bg-transparent hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors sm:ml-auto"
          >
            <X className="w-3.5 h-3.5" />
            Reset
          </button>
        )}
      </div>
    </div>
  );
}