"use client";

import { useState, useEffect } from "react";
import { Category, Transaction } from "@/lib/api";
import { Landmark, Plus, Trash2, PieChart } from "lucide-react";

interface TransactionFormProps {
  initialData?: Transaction | null;
  defaultType?: "income" | "expense";
  categories: Category[];
  onSubmit: (formData: {
    title: string;
    amount: number;
    type: "income" | "expense";
    category_id?: number | null;
    account_id?: number | null;
    description?: string;
    transaction_date: string;
    allocations?: { category_id: number; amount: number }[];
  }) => Promise<void>;
  onCancel: () => void;
  loading: boolean;
}

export default function TransactionForm({
  initialData,
  defaultType = "expense",
  categories,
  onSubmit,
  onCancel,
  loading,
}: TransactionFormProps) {
  const today = new Date().toISOString().split("T")[0];

  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<"income" | "expense">("expense");
  const [categoryId, setCategoryId] = useState("");
  const [description, setDescription] = useState("");
  const [transactionDate, setTransactionDate] = useState(today);
  const [errorMsg, setErrorMsg] = useState("");

  const [allocations, setAllocations] = useState<{ category_id: string; amount: string }[]>([]);

  useEffect(() => {
    setErrorMsg("");
    if (initialData) {
      setTitle(initialData.title || "");
      setAmount(initialData.amount !== undefined && initialData.amount !== null ? String(initialData.amount) : "");
      setType(initialData.type || "expense");
      setCategoryId(initialData.category_id ? String(initialData.category_id) : (categories.length > 0 ? String(categories[0].id) : ""));
      setDescription(initialData.description || "");
      setTransactionDate(initialData.transaction_date ? initialData.transaction_date.split("T")[0] : today);
      
      // Pertahankan history alokasi kategori yang sudah terhubung sebelumnya
      if (initialData.type === "income" && Array.isArray(initialData.allocations) && initialData.allocations.length > 0) {
        setAllocations(
          initialData.allocations.map((a) => ({
            category_id: String(a.category_id),
            amount: a.amount !== undefined && a.amount !== null ? String(a.amount) : "",
          }))
        );
      } else {
        setAllocations([]);
      }
    } else {
      // Form tambah transaksi baru: bersih tanpa memuat nominal atau data transaksi lama
      setTitle("");
      setAmount("");
      setType(defaultType);
      setCategoryId(categories.length > 0 ? String(categories[0].id) : "");
      setDescription("");
      setTransactionDate(today);
      setAllocations([]);
    }
  }, [initialData, defaultType, categories, today]);

  const selectedCategory = categories.find((cat) => String(cat.id) === String(categoryId));
  const linkedAccount = selectedCategory?.account;

  const targetCategories = categories.filter((cat) => String(cat.id) !== String(categoryId));

  const totalIncomeNum = Number(amount) || 0;
  const allocatedSum = allocations.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
  const remainingToAllocate = totalIncomeNum - allocatedSum;

  const handleAddAllocation = () => {
    const nextCategory = targetCategories.find(
      (c) => !allocations.some((a) => a.category_id === String(c.id))
    ) || targetCategories[0];

    if (!nextCategory) return;
    setAllocations([...allocations, { category_id: String(nextCategory.id), amount: "" }]);
  };

  const handleUpdateAllocation = (index: number, field: "category_id" | "amount", value: string) => {
    const updated = [...allocations];
    updated[index][field] = value;
    setAllocations(updated);
  };

  const handleRemoveAllocation = (index: number) => {
    setAllocations(allocations.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!title.trim()) {
      setErrorMsg("Title is required");
      return;
    }

    const numAmount = Number(amount);
    if (!amount || isNaN(numAmount) || numAmount <= 0) {
      setErrorMsg("Amount must be greater than 0");
      return;
    }

    if (!categoryId) {
      setErrorMsg("Please select a category");
      return;
    }

    if (!transactionDate) {
      setErrorMsg("Transaction date is required");
      return;
    }

    if (type === "income" && allocations.length > 0) {
      if (allocatedSum > numAmount) {
        setErrorMsg(`Total allocated (Rp ${allocatedSum.toLocaleString("id-ID")}) exceeds income amount (Rp ${numAmount.toLocaleString("id-ID")})`);
        return;
      }
    }

    try {
      const formattedAllocations = allocations
        .filter((a) => a.category_id && Number(a.amount) > 0)
        .map((a) => ({
          category_id: Number(a.category_id),
          amount: Number(a.amount),
        }));

      await onSubmit({
        title: title.trim(),
        amount: numAmount,
        type,
        category_id: Number(categoryId),
        account_id: linkedAccount ? linkedAccount.id : null,
        description: description.trim() || undefined,
        transaction_date: transactionDate,
        allocations: type === "income" ? formattedAllocations : undefined,
      });
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to save transaction");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-xs">
      {errorMsg && (
        <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 font-medium">
          {errorMsg}
        </div>
      )}

      {/* Type switch: Expense first */}
      <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
        <button
          type="button"
          onClick={() => setType("expense")}
          className={`py-2 rounded-lg font-semibold transition-all cursor-pointer ${
            type === "expense"
              ? "bg-rose-600 text-white shadow-xs"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
          }`}
        >
          Expense (Money Out)
        </button>
        <button
          type="button"
          onClick={() => setType("income")}
          className={`py-2 rounded-lg font-semibold transition-all cursor-pointer ${
            type === "income"
              ? "bg-emerald-600 text-white shadow-xs"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
          }`}
        >
          Income (Money In)
        </button>
      </div>

      {/* Title */}
      <div>
        <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Title *</label>
        <input
          type="text"
          placeholder="e.g. Lunch, Groceries, Salary, Utilities"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          required
        />
      </div>

      {/* Amount & Category */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Amount (Rp) *</label>
          <input
            type="number"
            placeholder="e.g. 50000"
            min="1"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            required
          />
        </div>

        <div>
          <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
            {type === "income" ? "Deposit Category" : "Expense Category"} *
          </label>
          <select
            value={categoryId}
            onChange={(e) => {
              setCategoryId(e.target.value);
            }}
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            required
          >
            <option value="" disabled>-- Select Category --</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name} {cat.account ? `(${cat.account.name})` : ""}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Auto-detected account preview */}
      <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Landmark className="w-4 h-4 text-emerald-600 shrink-0" />
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400">Linked Account:</span>
            <p className="font-semibold text-slate-900 dark:text-white text-xs">
              {linkedAccount ? (
                <>
                  {linkedAccount.name}{" "}
                  <span className="text-[10px] text-slate-400 font-normal">
                    ({linkedAccount.type}) • Balance: Rp {Number(linkedAccount.current_balance).toLocaleString("id-ID")}
                  </span>
                </>
              ) : (
                <span className="text-slate-400 font-normal">
                  Category not linked to a specific account
                </span>
              )}
            </p>
          </div>
        </div>
        <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
          Auto
        </span>
      </div>

      {/* Allocation section for income */}
      {type === "income" && (
        <div className="p-3.5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-800/50 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300 font-bold">
              <PieChart className="w-4 h-4" />
              <span>Allocate to other categories</span>
            </div>
            <button
              type="button"
              onClick={handleAddAllocation}
              disabled={targetCategories.length === 0}
              className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-semibold transition-colors disabled:opacity-50 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Split
            </button>
          </div>

          <p className="text-[11px] text-slate-600 dark:text-slate-400">
            Distribute funds to spending categories. Remaining balance stays in {selectedCategory?.name || "the source category"}.
          </p>

          {targetCategories.length === 0 && (
            <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 text-[11px]">
              No other categories available to allocate to.
            </div>
          )}

          {allocations.length > 0 && (
            <div className="space-y-2 pt-1">
              {allocations.map((alloc, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <select
                    value={alloc.category_id}
                    onChange={(e) => handleUpdateAllocation(idx, "category_id", e.target.value)}
                    className="flex-1 px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name} {cat.account ? `(${cat.account.name})` : ""}
                      </option>
                    ))}
                  </select>

                  <div className="w-32 sm:w-40 relative">
                    <span className="absolute left-2.5 top-1.5 text-slate-400 text-[11px]">Rp</span>
                    <input
                      type="number"
                      placeholder="Amount"
                      min="1"
                      value={alloc.amount}
                      onChange={(e) => handleUpdateAllocation(idx, "amount", e.target.value)}
                      className="w-full pl-8 pr-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveAllocation(idx)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}

              <div className="pt-2 border-t border-emerald-200/60 dark:border-emerald-800/60 flex items-center justify-between text-[11px]">
                <span className="text-slate-500">
                  Allocated: <strong className="text-slate-900 dark:text-white">Rp {allocatedSum.toLocaleString("id-ID")}</strong>
                </span>
                <span className={remainingToAllocate < 0 ? "text-rose-600 font-bold" : "text-emerald-700 dark:text-emerald-300 font-semibold"}>
                  Remaining: Rp {remainingToAllocate.toLocaleString("id-ID")}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Date */}
      <div>
        <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Date *</label>
        <input
          type="date"
          value={transactionDate}
          onChange={(e) => setTransactionDate(e.target.value)}
          className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          required
        />
      </div>

      {/* Description */}
      <div>
        <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Notes (Optional)</label>
        <textarea
          rows={2}
          placeholder="Add short note..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition-colors disabled:opacity-50 cursor-pointer"
        >
          {loading ? "Saving..." : initialData ? "Update Transaction" : "Save Transaction"}
        </button>
      </div>
    </form>
  );
}
