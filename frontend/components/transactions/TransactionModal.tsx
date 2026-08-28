"use client";

import { Category, Transaction } from "@/lib/api";
import TransactionForm from "./TransactionForm";
import { X } from "lucide-react";

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Transaction | null;
  categories: Category[];
  onSubmit: (formData: any) => Promise<void>;
  loading: boolean;
}

export default function TransactionModal({
  isOpen,
  onClose,
  initialData,
  categories,
  onSubmit,
  loading,
}: TransactionModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-lg rounded-2xl p-6 shadow-2xl animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
          <h3 className="font-bold text-lg text-slate-900 dark:text-white">
            {initialData ? "Edit Transaction" : "Add New Transaction"}
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <TransactionForm
          initialData={initialData}
          categories={categories}
          onSubmit={onSubmit}
          onCancel={onClose}
          loading={loading}
        />
      </div>
    </div>
  );
}
