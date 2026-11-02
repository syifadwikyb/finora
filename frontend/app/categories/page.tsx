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

export default function CategoriesPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [categories, setCategories] = useState<Category[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [modalLoading, setModalLoading] = useState(false);

  // Delete Confirmation state
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Toast message
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
      setError(err.message || "Failed to load categories.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && !authLoading) {
      loadData();
    }
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
        showToast("Category updated.");
      } else {
        await createCategory(data);
        showToast("New category created.");
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
      showToast("Category deleted.");
      setDeleteTarget(null);
      loadData();
    } catch (err: any) {
      showToast(err.message || "Failed to delete category");
    } finally {
      setDeleteLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-24 space-y-3">
        <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-medium text-slate-500">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex-1 flex flex-col min-h-screen relative pb-16">
      <Navbar title="Categories" subtitle="Manage envelope categories linked to your physical accounts." />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-emerald-700 text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-xl animate-in fade-in slide-in-from-bottom-3 duration-200">
          {toastMessage}
        </div>
      )}

      <main className="flex-1 p-4 md:p-8 space-y-6 max-w-7xl w-full mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Category List</h2>
            <p className="text-xs text-slate-500">
              Each category links to an account for automatic balance tracking
            </p>
          </div>

          {/* Add Category: tombol solid, animasi seperti dashboard */}
          <button
            type="button"
            onClick={handleOpenAdd}
            className="group self-start sm:self-auto inline-flex items-center gap-2.5 pl-2.5 pr-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-500/25 active:scale-95 transition-all cursor-pointer"
          >
            <span className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <FolderPlus className="w-4 h-4 text-white" />
            </span>
            Add Category
          </button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-3">
            <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-medium text-slate-500">Loading categories...</p>
          </div>
        ) : error ? (
          <div className="p-6 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-center space-y-4 max-w-md mx-auto my-12">
            <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
            <div>
              <h3 className="font-semibold text-rose-700 dark:text-rose-400 text-base">Failed to Load Categories</h3>
              <p className="text-xs text-rose-600 dark:text-rose-300 mt-1">{error}</p>
            </div>
            <button
              onClick={loadData}
              className="inline-flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
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

      {/* Add / Edit Modal */}
      <CategoryForm
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialData={selectedCategory}
        accounts={accounts}
        onSubmit={handleSaveCategory}
        loading={modalLoading}
      />

      {/* Consistent Delete Confirm Modal */}
      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Category"
        description={
          <>
            Are you sure you want to delete <span className="font-semibold text-slate-900 dark:text-white">"{deleteTarget?.name}"</span>?
          </>
        }
        confirmLabel="Delete Category"
        variant="danger"
        loading={deleteLoading}
      />
    </div>
  );
}