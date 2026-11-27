"use client";

import { useState, useEffect } from "react";
import { Account, Category, Transaction } from "@/lib/api";
import { Landmark, Plus, Trash2, PieChart, CreditCard } from "lucide-react";
import { useSettings } from "@/lib/settingsContext";

const toDigits = (text: string) => text.replace(/\D/g, "").replace(/^0+(?=\d)/, "");
const withDots = (digits: string) => digits.replace(/\B(?=(\d{3})+(?!\d))/g, ".");

interface TransactionFormProps {
  initialData?: Transaction | null;
  defaultType?: "income" | "expense";
  categories: Category[];
  accounts?: Account[];
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
  accounts = [],
  onSubmit,
  onCancel,
  loading,
}: TransactionFormProps) {
  const { t, appMode } = useSettings();
  const today = new Date().toISOString().split("T")[0];

  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<"income" | "expense">("expense");
  const [categoryId, setCategoryId] = useState("");
  const [accountId, setAccountId] = useState("");
  const [description, setDescription] = useState("");
  const [transactionDate, setTransactionDate] = useState(today);
  const [errorMsg, setErrorMsg] = useState("");

  const [allocations, setAllocations] = useState<{ category_id: string; amount: string }[]>([]);

  useEffect(() => {
    setErrorMsg("");
    if (initialData) {
      setTitle(initialData.title || "");
      setAmount(
        initialData.amount !== undefined && initialData.amount !== null
          ? String(Math.round(Number(initialData.amount)))
          : ""
      );
      setType(initialData.type || "expense");
      setCategoryId(
        initialData.category_id
          ? String(initialData.category_id)
          : categories.length > 0
            ? String(categories[0].id)
            : ""
      );
      setAccountId(
        initialData.account_id
          ? String(initialData.account_id)
          : accounts.length > 0
            ? String(accounts[0].id)
            : ""
      );
      setDescription(initialData.description || "");
      setTransactionDate(initialData.transaction_date ? initialData.transaction_date.split("T")[0] : today);

      if (initialData.type === "income" && Array.isArray(initialData.allocations) && initialData.allocations.length > 0) {
        setAllocations(
          initialData.allocations.map((a) => ({
            category_id: String(a.category_id),
            amount: a.amount !== undefined && a.amount !== null ? String(Math.round(Number(a.amount))) : "",
          }))
        );
      } else {
        setAllocations([]);
      }
    } else {
      setTitle("");
      setAmount("");
      setType(defaultType);
      setCategoryId(categories.length > 0 ? String(categories[0].id) : "");
      setAccountId(accounts.length > 0 ? String(accounts[0].id) : "");
      setDescription("");
      setTransactionDate(today);
      setAllocations([]);
    }
  }, [initialData, defaultType, categories, accounts, today]);

  const selectedCategory = categories.find((cat) => String(cat.id) === String(categoryId));
  const linkedAccount = selectedCategory?.account;

  const targetCategories = categories.filter((cat) => String(cat.id) !== String(categoryId));

  const totalIncomeNum = Number(amount) || 0;
  const allocatedSum = allocations.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
  const remainingToAllocate = totalIncomeNum - allocatedSum;

  const handleAddAllocation = () => {
    const nextCategory =
      targetCategories.find((c) => !allocations.some((a) => a.category_id === String(c.id))) ||
      targetCategories[0];

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
      setErrorMsg(t("tx.errTitle"));
      return;
    }

    const numAmount = Number(amount);
    if (!amount || isNaN(numAmount) || numAmount <= 0) {
      setErrorMsg(t("tx.errAmount"));
      return;
    }

    if (!categoryId) {
      setErrorMsg(t("tx.errCategory"));
      return;
    }

    if (!transactionDate) {
      setErrorMsg(t("tx.errDate"));
      return;
    }

    // Mode bebas: pakai akun pilihan user. Mode amplop: akun dari kategori.
    let finalAccountId: number | null = null;
    if (appMode === "flexible") {
      finalAccountId = accountId ? Number(accountId) : linkedAccount ? linkedAccount.id : null;
    } else {
      finalAccountId = linkedAccount ? linkedAccount.id : accountId ? Number(accountId) : null;
    }

    if (appMode === "envelope" && type === "income" && allocations.length > 0) {
      if (allocatedSum > numAmount) {
        setErrorMsg(
          t("tx.errAllocExceeds")
            .replace("{allocated}", allocatedSum.toLocaleString("id-ID"))
            .replace("{income}", numAmount.toLocaleString("id-ID"))
        );
        return;
      }
    }

    try {
      const formattedAllocations =
        appMode === "envelope" && type === "income"
          ? allocations
            .filter((a) => a.category_id && Number(a.amount) > 0)
            .map((a) => ({
              category_id: Number(a.category_id),
              amount: Number(a.amount),
            }))
          : undefined;

      await onSubmit({
        title: title.trim(),
        amount: numAmount,
        type,
        category_id: Number(categoryId),
        account_id: finalAccountId,
        description: description.trim() || undefined,
        transaction_date: transactionDate,
        allocations: formattedAllocations,
      });
    } catch (err: any) {
      setErrorMsg(err.message || t("tx.errSave"));
    }
  };

  const fieldClass =
    "w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500";

  const accountTypeLabel = (accType: string) => t(`accounts.type_${accType}`);

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-xs">
      {errorMsg && (
        <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 font-medium">
          {errorMsg}
        </div>
      )}

      {/* Mode Indicator Pill */}
      <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-[11px]">
        <span className="text-slate-500">{t("settings.modeTitle")}:</span>
        <span className="font-semibold text-emerald-700 dark:text-emerald-400">
          {appMode === "envelope" ? `✉️ ${t("settings.modeEnvelope")}` : `💳 ${t("settings.modeFlexible")}`}
        </span>
      </div>

      {/* Type switch */}
      <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
        <button
          type="button"
          onClick={() => setType("expense")}
          className={`py-2 rounded-lg font-semibold transition-all cursor-pointer ${type === "expense"
            ? "bg-rose-600 text-white shadow-xs"
            : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
            }`}
        >
          {t("common.expense")}
        </button>
        <button
          type="button"
          onClick={() => setType("income")}
          className={`py-2 rounded-lg font-semibold transition-all cursor-pointer ${type === "income"
            ? "bg-emerald-700 text-white shadow-xs"
            : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
            }`}
        >
          {t("common.income")}
        </button>
      </div>

      {/* Title */}
      <div>
        <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
          {t("tx.formTitle")}
        </label>
        <input
          type="text"
          placeholder={t("tx.titlePlaceholder")}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={fieldClass}
          required
        />
      </div>

      {/* Amount & Category */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
            {t("common.amount")} (Rp) *
          </label>
          <input
            type="text"
            inputMode="numeric"
            placeholder={t("tx.amountPlaceholder")}
            value={withDots(amount)}
            onChange={(e) => setAmount(toDigits(e.target.value))}
            className={fieldClass}
            required
          />
        </div>

        <div>
          <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
            {type === "income" ? t("tx.depositCategory") : t("tx.expenseCategory")}
          </label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className={fieldClass}
            required
          >
            <option value="" disabled>
              -- {t("categories.title")} --
            </option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name} {appMode === "envelope" && cat.account ? `(${cat.account.name})` : ""}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Mode bebas: pilih akun | Mode amplop: akun otomatis */}
      {appMode === "flexible" ? (
        <div>
          <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
            <span className="flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
              {type === "income" ? t("tx.destinationAccount") : t("tx.paymentAccount")}
            </span>
          </label>
          <select
            value={accountId}
            onChange={(e) => setAccountId(e.target.value)}
            className={fieldClass}
            required
          >
            <option value="" disabled>
              -- {t("accounts.title")} --
            </option>
            {accounts.map((acc) => (
              <option key={acc.id} value={acc.id}>
                {acc.name} ({accountTypeLabel(acc.type)}) - {t("tx.balance")}: Rp{" "}
                {Number(acc.current_balance || 0).toLocaleString("id-ID")}
              </option>
            ))}
          </select>
          <p className="text-[10px] text-slate-400 mt-1">
            {type === "expense" ? t("tx.hintExpenseAccount") : t("tx.hintIncomeAccount")}
          </p>
        </div>
      ) : (
        <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Landmark className="w-4 h-4 text-emerald-600 shrink-0" />
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400">{t("tx.autoAccount")}:</span>
              <p className="font-semibold text-slate-900 dark:text-white text-xs">
                {linkedAccount ? (
                  <>
                    {linkedAccount.name}{" "}
                    <span className="text-[10px] text-slate-400 font-normal">
                      ({accountTypeLabel(linkedAccount.type)}) • {t("tx.balance")}: Rp{" "}
                      {Number(linkedAccount.current_balance).toLocaleString("id-ID")}
                    </span>
                  </>
                ) : (
                  <span className="text-slate-400 font-normal">{t("categories.unlinked")}</span>
                )}
              </p>
            </div>
          </div>
          <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
            {t("tx.auto")}
          </span>
        </div>
      )}

      {/* Alokasi pemasukan (khusus mode amplop) */}
      {appMode === "envelope" && type === "income" && (
        <div className="p-3.5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-800/50 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300 font-bold">
              <PieChart className="w-4 h-4" />
              <span>{t("tx.allocateLabel")}</span>
            </div>
            <button
              type="button"
              onClick={handleAddAllocation}
              disabled={targetCategories.length === 0}
              className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-700 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-semibold transition-colors disabled:opacity-50 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              {t("tx.addSplit")}
            </button>
          </div>

          <p className="text-[11px] text-slate-600 dark:text-slate-400">{t("tx.distributeDesc")}</p>

          {targetCategories.length === 0 && (
            <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 text-[11px]">
              {t("tx.noOtherCategories")}
            </div>
          )}

          {allocations.length > 0 && (
            <div className="space-y-2 pt-1">
              {allocations.map((alloc, idx) => (
                <div
                  key={idx}
                  className="flex flex-col sm:flex-row sm:items-center gap-2 p-2.5 sm:p-0 rounded-xl bg-white/60 dark:bg-slate-800/40 sm:bg-transparent border border-emerald-100 dark:border-emerald-900/40 sm:border-0"
                >
                  <select
                    value={alloc.category_id}
                    onChange={(e) => handleUpdateAllocation(idx, "category_id", e.target.value)}
                    className="w-full sm:flex-1 sm:min-w-0 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name} {cat.account ? `(${cat.account.name})` : ""}
                      </option>
                    ))}
                  </select>

                  <div className="flex items-center gap-2 w-full sm:w-52 sm:shrink-0">
                    <div className="relative flex-1 min-w-0">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[11px] font-semibold">
                        Rp
                      </span>
                      <input
                        type="text"
                        inputMode="numeric"
                        placeholder={t("common.amount")}
                        value={withDots(alloc.amount)}
                        onChange={(e) => handleUpdateAllocation(idx, "amount", toDigits(e.target.value))}
                        className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveAllocation(idx)}
                      aria-label={t("common.delete")}
                      className="p-2 shrink-0 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}

              <div className="pt-2 border-t border-emerald-200/60 dark:border-emerald-800/60 flex items-center justify-between text-[11px]">
                <span className="text-slate-500">
                  {t("tx.allocated")}:{" "}
                  <strong className="text-slate-900 dark:text-white">
                    Rp {allocatedSum.toLocaleString("id-ID")}
                  </strong>
                </span>
                <span
                  className={
                    remainingToAllocate < 0
                      ? "text-rose-600 font-bold"
                      : "text-emerald-700 dark:text-emerald-300 font-semibold"
                  }
                >
                  {t("tx.remaining")}: Rp {remainingToAllocate.toLocaleString("id-ID")}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Date */}
      <div>
        <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
          {t("common.date")} *
        </label>
        <input
          type="date"
          value={transactionDate}
          onChange={(e) => setTransactionDate(e.target.value)}
          className={fieldClass}
          required
        />
      </div>

      {/* Description */}
      <div>
        <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
          {t("common.notes")}
        </label>
        <textarea
          rows={2}
          placeholder={t("tx.notesPlaceholder")}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className={fieldClass}
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
          {t("common.cancel")}
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-700 text-white font-semibold transition-colors disabled:opacity-50 cursor-pointer"
        >
          {loading ? t("common.saving") : initialData ? t("tx.updateTx") : t("tx.saveTx")}
        </button>
      </div>
    </form>
  );
}