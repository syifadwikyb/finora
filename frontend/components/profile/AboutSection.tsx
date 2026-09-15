"use client";

import { Info, Sparkles } from "lucide-react";

export default function AboutSection() {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
      <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800 mb-5">
        <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
          <Info className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-bold text-base text-slate-900 dark:text-white">About Me & App</h3>
          <p className="text-xs text-slate-500">Application details</p>
        </div>
      </div>

      <div className="space-y-3 text-xs">
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <span className="text-slate-500">App Name</span>
          <span className="font-bold text-slate-900 dark:text-white">Finora Finance Tracker</span>
        </div>

        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <span className="text-slate-500">Version</span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
            <Sparkles className="w-3 h-3" /> v1.2.0 (Stable)
          </span>
        </div>

        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <span className="text-slate-500">Multi-User Database</span>
          <span className="font-semibold text-emerald-600 dark:text-emerald-400">Isolated per User</span>
        </div>

        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <span className="text-slate-500">Cloud Sync</span>
          <span className="font-semibold text-slate-700 dark:text-slate-300">Supabase & Firebase</span>
        </div>

        <p className="text-[11px] text-slate-400 pt-1 leading-relaxed">
          Finora dirancang untuk membantu Anda memantau seluruh catatan finansial, pemasukan, pengeluaran, dan kategori secara mandiri, rapi, dan aman.
        </p>
      </div>
    </div>
  );
}
