"use client";

import { Category } from "@/lib/api";
import { Edit2, FolderOpen, Tags, Trash2, Landmark, Globe } from "lucide-react";
import { useSettings } from "@/lib/settingsContext";

interface CategoryListProps {
  categories: Category[];
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
}

export default function CategoryList({ categories, onEdit, onDelete }: CategoryListProps) {
  const { t, appMode } = useSettings();

  if (categories.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center shadow-xs flex flex-col items-center justify-center">
        <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-3">
          <FolderOpen className="w-6 h-6" />
        </div>
        <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
          {t("categories.noCategories")}
        </p>
        <p className="text-xs text-slate-400 mt-1">
          {appMode === "flexible" ? t("categories.emptyDescFlexible") : t("categories.emptyDescEnvelope")}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {categories.map((cat) => (
        <div
          key={cat.id}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs hover:shadow-md transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <Tags className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h4 className="font-semibold text-sm text-slate-900 dark:text-white truncate">{cat.name}</h4>
              {cat.account ? (
                <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-0.5">
                  <Landmark className="w-3 h-3" />
                  {cat.account.name}
                </span>
              ) : (
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded font-medium flex items-center gap-1 mt-0.5">
                  <Globe className="w-2.5 h-2.5" />
                  {t("categories.universalBadge")}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              type="button"
              onClick={() => onEdit(cat)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors cursor-pointer"
              title={t("categories.editTooltip")}
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => onDelete(cat)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
              title={t("categories.deleteTooltip")}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}