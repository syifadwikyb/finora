"use client";

import { useState, useEffect } from "react";
import { Account, Category } from "@/lib/api";
import { useSettings } from "@/lib/settingsContext";
import { X, Landmark } from "lucide-react";

interface CategoryFormProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Category | null;
  accounts: Account[];
  onSubmit: (data: { name: string; account_id?: number | null }) => Promise<void>;
  loading: boolean;
}

export default function CategoryForm({
  isOpen,
  onClose,
  initialData,
  accounts,
  onSubmit,
  loading,
}: CategoryFormProps) {
  const { t, appMode } = useSettings();
  const [name, setName] = useState("");
  const [accountId, setAccountId] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setAccountId(initialData.account_id ? String(initialData.account_id) : "");
    } else {
      setName("");
      setAccountId("");
    }
    setErrorMsg("");
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!name.trim()) {
      setErrorMsg(t("categories.errNameRequired"));
      return;
    }

    try {
      await onSubmit({
        name: name.trim(),
        account_id: accountId ? Number(accountId) : null,
      });
    } catch (err: any) {
      setErrorMsg(err.message || t("categories.errSave"));
    }
  };

  const fieldClass =
    "w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500";

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-md rounded-2xl p-6 shadow-2xl animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
          <div>
            <h3 className="font-semibold text-base text-slate-900 dark:text-white">
              {initialData ? t("categories.editTitle") : t("categories.newTitle")}
            </h3>
            <p className="text-[11px] text-slate-400">
              {appMode === "flexible" ? t("categories.formSubtitleFlexible") : t("categories.formSubtitleEnvelope")}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t("common.close")}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 font-medium">
              {errorMsg}
            </div>
          )}

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              {t("categories.name")} *
            </label>
            <input
              type="text"
              placeholder={t("categories.namePlaceholder")}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={fieldClass}
              required
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center justify-between gap-2">
              <span className="flex items-center gap-1.5">
                <Landmark className="w-3.5 h-3.5 text-emerald-600" />
                {t("categories.linkedAccountLabel")}
              </span>
              <span className="text-[10px] text-slate-400 font-normal text-right">
                {t("categories.linkedAccountHint")}
              </span>
            </label>
            <select value={accountId} onChange={(e) => setAccountId(e.target.value)} className={fieldClass}>
              <option value="">-- {t("categories.universalOption")} --</option>
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.name} ({t(`accounts.type_${acc.type}`)}) • Rp{" "}
                  {Number(acc.current_balance).toLocaleString("id-ID")}
                </option>
              ))}
            </select>
            <p className="text-[10px] text-slate-400 mt-1">{t("categories.universalDesc")}</p>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
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
              {loading
                ? t("common.saving")
                : initialData
                  ? t("categories.update")
                  : t("categories.save")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}