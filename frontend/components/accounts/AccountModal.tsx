"use client";

import { useState } from "react";
import { X, Landmark } from "lucide-react";
import { useSettings } from "@/lib/settingsContext";

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; type: string; account_number?: string }) => Promise<void>;
  loading: boolean;
}

export default function AccountModal({
  isOpen,
  onClose,
  onSubmit,
  loading,
}: AccountModalProps) {
  const { t, appMode } = useSettings();
  const [formData, setFormData] = useState({
    name: "",
    type: "bank",
    account_number: "",
  });
  const [formError, setFormError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!formData.name.trim()) {
      setFormError(t("accounts.errNameRequired"));
      return;
    }

    try {
      await onSubmit({
        name: formData.name.trim(),
        type: formData.type,
        account_number: formData.account_number.trim() || undefined,
      });
      setFormData({ name: "", type: "bank", account_number: "" });
    } catch (err: any) {
      setFormError(err.message || t("accounts.errSave"));
    }
  };

  const fieldClass =
    "w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500";

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-md rounded-2xl p-6 shadow-2xl animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Landmark className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-base text-slate-900 dark:text-white">
                {t("accounts.addNewTitle")}
              </h3>
              <p className="text-[11px] text-slate-400">{t("accounts.modalSubtitle")}</p>
            </div>
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

        {formError && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 text-xs font-medium">
            {formError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              {t("accounts.accountName")} *
            </label>
            <input
              type="text"
              placeholder={t("accounts.namePlaceholder")}
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={fieldClass}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {t("common.type")}
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className={fieldClass}
              >
                <option value="bank">{t("accounts.type_bank")}</option>
                <option value="ewallet">{t("accounts.type_ewallet")}</option>
                <option value="cash">{t("accounts.type_cash")}</option>
                <option value="investment">{t("accounts.type_investment")}</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {t("accounts.accountNumber")}
              </label>
              <input
                type="text"
                placeholder={t("common.optional")}
                value={formData.account_number}
                onChange={(e) => setFormData({ ...formData, account_number: e.target.value })}
                className={fieldClass}
              />
            </div>
          </div>

          <p className="text-[11px] text-slate-500 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
            {appMode === "flexible" ? t("accounts.hintFlexible") : t("accounts.hintEnvelope")}
          </p>

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
              {loading ? t("common.saving") : t("accounts.save")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}