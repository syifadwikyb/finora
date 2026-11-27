"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/layout/Navbar";
import CategoryList from "@/components/categories/CategoryList";
import CategoryForm from "@/components/categories/CategoryForm";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { Account, Category, createCategory, deleteCategory, getAccounts, getCategories, updateCategory } from "@/lib/api";
import { AlertCircle, FolderPlus, RefreshCw } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { useRouter } from "next/navigation";
import { useSettings } from "@/lib/settingsContext";

export default function CategoriesPage() {
  const { t, appMode } = useSettings();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [categories, setCategories] = useState<Category[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [modalLoading, setModalLoading] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

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

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [catRes, accRes] = await Promise.all([
        getCategories(),
        getAccounts().catch(() => ({ data: [] })),
      ]);
      setCategories(catRes.data);
      setAccounts(accRes.data || []);
    } catch (err: any) {
      console.error("Failed to load categories:", err);
      setError(err.message || t("categories.errLoad"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && !authLoading) {
      loadData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading]);

  const handleOpenAdd = () => {
    setSelectedCategory(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cat: Category) => {
    setSelectedCategory(cat);
    setIsModalOpen(true);
  };

  const handleSaveCategory = async (data: { name: string; account_id?: number | null }) => {
    setModalLoading(true);
    try {
      if (selectedCategory) {
        await updateCategory(selectedCategory.id, data);
        showToast(t("categories.toastUpdated"));
      } else {
        await createCategory(data);
        showToast(t("categories.toastCreated"));
      }
      setIsModalOpen(false);
      loadData();
    } catch (err: any) {
      throw err;
    } finally {
      setModalLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await deleteCategory(deleteTarget.id);
      showToast(t("categories.toastDeleted"));
      setDeleteTarget(null);
      loadData();
    } catch (err: any) {
      showToast(err.message || t("categories.errDelete"));
    } finally {
      setDeleteLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-24 space-y-3">
        <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-medium text-slate-500">{t("common.loading")}</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex-1 flex flex-col min-h-screen relative pb-16">
      <Navbar
        title={t("nav.categories")}
        subtitle={
          appMode === "flexible" ? t("categories.pageSubtitleFlexible") : t("categories.pageSubtitleEnvelope")
        }
      />

      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-emerald-700 text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-xl animate-in fade-in slide-in-from-bottom-3 duration-200">
          {toastMessage}
        </div>
      )}

      <main className="flex-1 p-4 md:p-8 space-y-6 max-w-7xl w-full mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">{t("categories.listTitle")}</h2>
            <p className="text-xs text-slate-500">
              {appMode === "flexible" ? t("categories.listSubtitleFlexible") : t("categories.listSubtitleEnvelope")}
            </p>
          </div>

          <button
            type="button"
            onClick={handleOpenAdd}
            className="group self-start sm:self-auto inline-flex items-center gap-2.5 pl-2.5 pr-5 py-2.5 rounded-2xl bg-emerald-700 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-500/25 active:scale-95 transition-all cursor-pointer"
          >
            <span className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <FolderPlus className="w-4 h-4 text-white" />
            </span>
            {t("categories.addCategory")}
          </button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-3">
            <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-medium text-slate-500">{t("categories.loading")}</p>
          </div>
        ) : error ? (
          <div className="p-6 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-center space-y-4 max-w-md mx-auto my-12">
            <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
            <div>
              <h3 className="font-semibold text-rose-700 dark:text-rose-400 text-base">
                {t("categories.failedLoad")}
              </h3>
              <p className="text-xs text-rose-600 dark:text-rose-300 mt-1">{error}</p>
            </div>
            <button
              onClick={loadData}
              className="inline-flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              {t("common.tryAgain")}
            </button>
          </div>
        ) : (
          <CategoryList
            categories={categories}
            onEdit={handleOpenEdit}
            onDelete={(cat) => setDeleteTarget(cat)}
          />
        )}
      </main>

      <CategoryForm
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialData={selectedCategory}
        accounts={accounts}
        onSubmit={handleSaveCategory}
        loading={modalLoading}
      />

      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title={t("categories.deleteTitle")}
        description={
          <>
            {t("categories.deleteDescPre")}{" "}
            <span className="font-semibold text-slate-900 dark:text-white">"{deleteTarget?.name}"</span>
            {t("categories.deleteDescPost")}
          </>
        }
        confirmLabel={t("categories.deleteTitle")}
        variant="danger"
        loading={deleteLoading}
      />
    </div>
  );
}