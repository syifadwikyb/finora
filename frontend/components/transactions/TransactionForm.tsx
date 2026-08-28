"use client";

import { useState, useEffect } from "react";
import { Category, Transaction } from "@/lib/api";

interface TransactionFormProps {
  initialData?: Transaction | null;
  categories: Category[];
  onSubmit: (formData: {
    title: string;
    amount: number;
    type: "income" | "expense";
    category_id: number;
    description?: string;
    transaction_date: string;
  }) => Promise<void>;
  onCancel: () => void;
  loading: boolean;
}

export default function TransactionForm({
  initialData,
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

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setAmount(String(initialData.amount));
      setType(initialData.type);
      setCategoryId(String(initialData.category_id));
      setDescription(initialData.description || "");
      setTransactionDate(initialData.transaction_date ? initialData.transaction_date.split("T")[0] : today);
    } else {
      setTitle("");
      setAmount("");
      setType("expense");
      setCategoryId(categories.length > 0 ? String(categories[0].id) : "");
      setDescription("");
      setTransactionDate(today);
    }
  }, [initialData, categories]);

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
      setErrorMsg("Category is required");
      return;
    }

    if (!transactionDate) {
      setErrorMsg("Transaction date is required");
      return;
    }

    try {
      await onSubmit({
        title: title.trim(),
        amount: numAmount,
        type,
        category_id: Number(categoryId),
        description: description.trim() || undefined,
        transaction_date: transactionDate,
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

      {/* Type switch */}
      <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
        <button
          type="button"
          onClick={() => setType("income")}
          className={`py-2 rounded-lg font-bold transition-all ${
            type === "income"
              ? "bg-emerald-600 text-white shadow-xs"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
          }`}
        >
          Income
        </button>
        <button
          type="button"
          onClick={() => setType("expense")}
          className={`py-2 rounded-lg font-bold transition-all ${
            type === "expense"
              ? "bg-rose-600 text-white shadow-xs"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
          }`}
        >
          Expense
        </button>
      </div>

      {/* Title */}
      <div>
        <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Title *</label>
        <input
          type="text"
          placeholder="e.g. Makan Siang, Gaji Bulanan"
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
          <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Category *</label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            required
          >
            <option value="" disabled>
              Select category
            </option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Transaction Date */}
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
        <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Description (Optional)</label>
        <textarea
          rows={2}
          placeholder="Additional notes..."
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
          className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-colors disabled:opacity-50"
        >
          {loading ? "Saving..." : initialData ? "Update Transaction" : "Create Transaction"}
        </button>
      </div>
    </form>
  );
}
