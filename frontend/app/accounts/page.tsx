"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import { Account, createAccount, deleteAccount, getAccounts, updateAccount } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { useSettings } from "@/lib/settingsContext";
import { Landmark, Plus, Trash2, Edit2, AlertCircle, RefreshCw, X, Wallet, Coins, Tags } from "lucide-react";
import ConfirmModal from "@/components/ui/ConfirmModal";

export default function AccountsPage() {
  const { t, appMode } = useSettings();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    type: "bank",
    account_number: "",
  });
  const [formError, setFormError] = useState("");

  // Delete confirmation modal state
  const [deleteTarget, setDeleteTarget] = useState<Account | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // View linked categories modal state
  const [viewingCategoriesAccount, setViewingCategoriesAccount] = useState<Account | null>(null);

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login");
    }
  }, [authLoading, user, router]);

  const loadAccounts = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getAccounts();
      setAccounts(res.data);
    } catch (err: any) {
      setError(err.message || t("accounts.errLoad"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && !authLoading) {
      loadAccounts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading]);

  const handleOpenAdd = () => {
    setSelectedAccount(null);
    setFormData({ name: "", type: "bank", account_number: "" });
    setFormError("");
    setIsModalOpen(true);
  };

  const handleOpenEdit = (acc: Account) => {
    setSelectedAccount(acc);
    setFormData({
      name: acc.name,
      type: acc.type || "bank",
      account_number: acc.account_number || "",
    });
    setFormError("");
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    if (!formData.name.trim()) {
      setFormError(t("accounts.errNameRequired"));
      return;
    }

    setModalLoading(true);
    try {
      if (selectedAccount) {
        await updateAccount(selectedAccount.id, {
          name: formData.name.trim(),
          type: formData.type,
          account_number: formData.account_number.trim() || undefined,
        });
        showToast(t("accounts.toastUpdated"));
      } else {
        await createAccount({
          name: formData.name.trim(),
          type: formData.type,
          account_number: formData.account_number.trim() || undefined,
          current_balance: 0,
        });
        showToast(t("accounts.toastAdded"));
      }
      setIsModalOpen(false);
      loadAccounts();
    } catch (err: any) {
      setFormError(err.message || t("accounts.errSave"));
    } finally {
      setModalLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await deleteAccount(deleteTarget.id);
      showToast(t("accounts.toastDeleted"));
      setDeleteTarget(null);
      loadAccounts();
    } catch (err: any) {
      showToast(err.message || t("accounts.errDelete"));
    } finally {
      setDeleteLoading(false);
    }
  };

  const getAccountEffectiveBalance = (acc: Account) => {
    return Number(acc.current_balance || 0);
  };

  const totalBalance = accounts.reduce((acc, curr) => acc + getAccountEffectiveBalance(curr), 0);

  if (authLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-24 space-y-3">
        <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-medium text-slate-500">{t("common.loading")}</p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex-1 flex flex-col min-h-screen relative pb-16">
      <Navbar
        title={t("accounts.title")}
        subtitle={appMode === "flexible" ? t("accounts.subtitleFlexible") : t("accounts.subtitleEnvelope")}
      />

      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-emerald-700 text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-xl">
          {toastMessage}
        </div>
      )}

      <main className="flex-1 p-4 md:p-8 space-y-6 max-w-7xl w-full mx-auto">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-emerald-900 text-white p-6 rounded-3xl shadow-lg">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-300">
              {t("accounts.totalBalance")}
            </span>
            <h2 className="text-2xl md:text-3xl font-extrabold mt-1">{formatCurrency(totalBalance)}</h2>
            <p className="text-xs text-emerald-200/80 mt-1">
              {(appMode === "flexible" ? t("accounts.totalDescFlexible") : t("accounts.totalDescEnvelope")).replace(
                "{n}",
                String(accounts.length)
              )}
            </p>
          </div>
          <button
            onClick={handleOpenAdd}
            className="self-start sm:self-auto flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-2xl shadow-md transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            {t("accounts.addAccount")}
          </button>
        </div>

        {/* Account Cards */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-3">
            <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-medium text-slate-500">{t("accounts.loading")}</p>
          </div>
        ) : error ? (
          <div className="p-6 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-center space-y-4 max-w-md mx-auto my-12">
            <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
            <p className="text-xs text-rose-600 dark:text-rose-300">{error}</p>
            <button
              onClick={loadAccounts}
              className="inline-flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              {t("common.tryAgain")}
            </button>
          </div>
        ) : accounts.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center">
            <Landmark className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <h3 className="font-semibold text-slate-800 dark:text-white text-base">{t("accounts.noAccounts")}</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">{t("accounts.addFirst")}</p>
            <button
              onClick={handleOpenAdd}
              className="px-4 py-2 bg-emerald-700 text-white rounded-xl text-xs font-semibold hover:bg-emerald-700 cursor-pointer"
            >
              {t("accounts.addNow")}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {accounts.map((acc) => {
              const Icon = acc.type === "ewallet" ? Wallet : acc.type === "cash" ? Coins : Landmark;
              const catCount = acc.categories ? acc.categories.length : 0;
              const displayBalance = getAccountEffectiveBalance(acc);

              return (
                <div
                  key={acc.id}
                  className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 shadow-xs flex flex-col justify-between hover:border-emerald-500/40 transition-colors"
                >
                  <div>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-slate-900 dark:text-white text-sm">{acc.name}</h3>
                          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                            {t(`accounts.type_${acc.type}`)} {acc.account_number ? `• ${acc.account_number}` : ""}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEdit(acc)}
                          className="p-1.5 text-slate-400 hover:text-emerald-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(acc)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="mt-5">
                      <span className="text-[11px] text-slate-400">
                        {appMode === "flexible" ? t("accounts.balanceFlexible") : t("accounts.balanceEnvelope")}
                      </span>
                      <p className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">
                        {formatCurrency(displayBalance)}
                      </p>
                    </div>
                  </div>

                  {appMode === "envelope" && (
                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
                      <span className="flex items-center gap-1 font-medium">
                        <Tags className="w-3.5 h-3.5 text-emerald-600" />
                        {catCount} {t("accounts.categoriesCount")}
                      </span>
                      <button
                        onClick={() => setViewingCategoriesAccount(acc)}
                        className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        {t("accounts.viewCategories")} &rarr;
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-md rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <h3 className="font-semibold text-slate-900 dark:text-white text-base">
                {selectedAccount ? t("accounts.editAccount") : t("accounts.addAccount")}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 text-rose-600 text-xs font-medium">{formError}</div>
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
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
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
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
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
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <p className="text-[11px] text-slate-500 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                {appMode === "flexible" ? t("accounts.hintFlexible") : t("accounts.hintEnvelope")}
              </p>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={modalLoading}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 font-medium cursor-pointer"
                >
                  {t("common.cancel")}
                </button>
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-700 text-white font-semibold transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {modalLoading ? t("common.saving") : t("accounts.save")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Modal for Delete */}
      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title={t("accounts.deleteTitle")}
        description={
          <>
            {t("accounts.deleteDescPre")}{" "}
            <span className="font-semibold text-slate-900 dark:text-white">"{deleteTarget?.name}"</span>
            {t("accounts.deleteDescPost")}
          </>
        }
        confirmLabel={t("accounts.deleteTitle")}
        variant="danger"
        loading={deleteLoading}
      />

      {/* Linked Categories Modal with Balances */}
      {viewingCategoriesAccount && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-md rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 duration-150 flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <Landmark className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">
                    {viewingCategoriesAccount.name}
                  </h3>
                  <p className="text-[11px] text-slate-400 uppercase tracking-wider">
                    {t(`accounts.type_${viewingCategoriesAccount.type}`)} • {t("accounts.linkedEnvelopes")}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setViewingCategoriesAccount(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Total Balance Summary Header */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 mb-4 shrink-0 flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">{t("accounts.totalAccountBalance")}</span>
              <span className="text-sm font-extrabold text-slate-900 dark:text-white">
                {formatCurrency(getAccountEffectiveBalance(viewingCategoriesAccount))}
              </span>
            </div>

            {/* Categories List */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {!viewingCategoriesAccount.categories || viewingCategoriesAccount.categories.length === 0 ? (
                <div className="py-8 text-center space-y-2">
                  <Tags className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto" />
                  <p className="text-xs text-slate-500">{t("accounts.noLinkedCategories")}</p>
                  <button
                    onClick={() => {
                      setViewingCategoriesAccount(null);
                      router.push("/categories");
                    }}
                    className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold hover:underline cursor-pointer"
                  >
                    {t("accounts.manageLink")} &rarr;
                  </button>
                </div>
              ) : (
                viewingCategoriesAccount.categories.map((cat) => (
                  <div
                    key={cat.id}
                    className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center justify-between hover:border-emerald-500/30 transition-colors shadow-2xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                        <Tags className="w-4 h-4" />
                      </div>
                      <span className="font-semibold text-xs text-slate-900 dark:text-white truncate">
                        {cat.name}
                      </span>
                    </div>
                    <span className="font-bold text-xs text-emerald-600 dark:text-emerald-400 shrink-0">
                      {formatCurrency(Number(cat.current_balance || 0))}
                    </span>
                  </div>
                ))
              )}
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 mt-4 flex items-center justify-between shrink-0">
              <button
                type="button"
                onClick={() => {
                  setViewingCategoriesAccount(null);
                  router.push("/categories");
                }}
                className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
              >
                {t("accounts.manageAll")} &rarr;
              </button>
              <button
                type="button"
                onClick={() => setViewingCategoriesAccount(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold cursor-pointer transition-colors"
              >
                {t("common.close")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}