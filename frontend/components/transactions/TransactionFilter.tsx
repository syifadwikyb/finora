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
        {/* Type selector */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl w-fit">
          <button
            onClick={() => onFilterChange({ type: "" })}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${activeType === ""
              ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
          >
            All
          </button>
          <button
            onClick={() => onFilterChange({ type: "income" })}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${activeType === "income"
              ? "bg-emerald-600 text-white shadow-xs"
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
        </div>

        {/* Debounced Search Bar */}
        <div className="relative flex-1 max-w-xs">
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
      <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
          <Filter className="w-3.5 h-3.5" />
          Filter:
        </div>

        {/* Category dropdown */}
        <select
          value={filters.category_id || ""}
          onChange={(e) => onFilterChange({ category_id: e.target.value })}
          className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:border-emerald-500"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>

        {/* Date Range: Start Date s/d End Date */}
        <div className="flex items-center gap-1.5">
          <input
            type="date"
            placeholder="Start Date"
            value={filters.start_date || ""}
            onChange={(e) => onFilterChange({ date: "", start_date: e.target.value })}
            className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:border-emerald-500"
          />
          <span className="text-xs text-slate-400">s/d</span>
          <input
            type="date"
            placeholder="End Date"
            value={filters.end_date || ""}
            onChange={(e) => onFilterChange({ date: "", end_date: e.target.value })}
            className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Reset Button */}
        {hasActiveFilters && (
          <button
            onClick={handleReset}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors ml-auto"
          >
            <X className="w-3.5 h-3.5" />
            Reset
          </button>
        )}
      </div>
    </div>
  );
}
