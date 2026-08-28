"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/layout/Navbar";
import CategoryList from "@/components/categories/CategoryList";
import CategoryForm from "@/components/categories/CategoryForm";
import { Category, createCategory, deleteCategory, getCategories, updateCategory } from "@/lib/api";
import { AlertCircle, Plus, RefreshCw } from "lucide-react";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [modalLoading, setModalLoading] = useState(false);

  // Delete Confirmation state
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Toast message
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const loadCategories = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getCategories();
      setCategories(res.data);
    } catch (err: any) {
      console.error("Failed to load categories:", err);
      setError(err.message || "Failed to load categories.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleOpenAdd = () => {
    setSelectedCategory(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cat: Category) => {
    setSelectedCategory(cat);
    setIsModalOpen(true);
  };

  const handleSaveCategory = async (name: string) => {
    setModalLoading(true);
    try {
      if (selectedCategory) {
        await updateCategory(selectedCategory.id, { name });
        showToast("Category updated successfully!");
      } else {
        await createCategory({ name });
        showToast("Category created successfully!");
      }
      setIsModalOpen(false);
      loadCategories();
    } catch (err: any) {
      throw err;
    } finally {
      setModalLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    setDeleteError(null);
    try {
      await deleteCategory(deleteTarget.id);
      showToast("Category deleted successfully!");
      setDeleteTarget(null);
      loadCategories();
    } catch (err: any) {
      setDeleteError(err.message || "Failed to delete category");
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen relative">
      <Navbar title="Categories" subtitle="Manage income and expense categories." />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-emerald-700 text-white text-xs font-bold px-4 py-3 rounded-xl shadow-xl animate-in fade-in slide-in-from-bottom-3 duration-200">
          {toastMessage}
        </div>
      )}

      <main className="flex-1 p-4 md:p-8 space-y-6 max-w-7xl w-full mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">All Categories</h2>
            <p className="text-xs text-slate-500">Add or edit transaction categories</p>
          </div>
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-500/20 transition-all hover:scale-102"
          >
            <Plus className="w-4 h-4" />
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
              <h3 className="font-bold text-rose-700 dark:text-rose-400 text-base">Error Loading Data</h3>
              <p className="text-xs text-rose-600 dark:text-rose-300 mt-1">{error}</p>
            </div>
            <button
              onClick={loadCategories}
              className="inline-flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </button>
          </div>
        ) : (
          <CategoryList
            categories={categories}
            onEdit={handleOpenEdit}
            onDelete={(cat) => {
              setDeleteError(null);
              setDeleteTarget(cat);
            }}
          />
        )}
      </main>

      {/* Add / Edit Category Modal */}
      <CategoryForm
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialData={selectedCategory}
        onSubmit={handleSaveCategory}
        loading={modalLoading}
      />

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">Delete Category</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Are you sure you want to delete <span className="font-bold text-slate-900 dark:text-white">"{deleteTarget.name}"</span>?
            </p>

            {deleteError && (
              <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-600 text-xs font-semibold leading-snug">
                {deleteError}
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={deleteLoading}
                className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={deleteLoading}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold transition-colors disabled:opacity-50"
              >
                {deleteLoading ? "Deleting..." : "Confirm Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
