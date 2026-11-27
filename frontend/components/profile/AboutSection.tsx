"use client";

import { Info, Sparkles } from "lucide-react";
import { useSettings } from "@/lib/settingsContext";
import { APP_VERSION } from "@/lib/version";

export default function AboutSection() {
  const { t } = useSettings();

  const rowClass =
    "p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3";

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
      <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800 mb-5">
        <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
          <Info className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-bold text-base text-slate-900 dark:text-white">{t("prf.aboutTitle")}</h3>
          <p className="text-xs text-slate-500">{t("prf.aboutDesc")}</p>
        </div>
      </div>

      <div className="space-y-3 text-xs">
        <div className={rowClass}>
          <span className="text-slate-500">{t("prf.appName")}</span>
          <span className="font-bold text-slate-900 dark:text-white text-right">Finora Finance Tracker</span>
        </div>

        <div className={rowClass}>
          <span className="text-slate-500">{t("prf.version")}</span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
            <Sparkles className="w-3 h-3" /> v{APP_VERSION} ({t("prf.stable")})
          </span>
        </div>

        <div className={rowClass}>
          <span className="text-slate-500">{t("prf.multiUser")}</span>
          <span className="font-semibold text-emerald-600 dark:text-emerald-400 text-right">
            {t("prf.isolated")}
          </span>
        </div>

        <div className={rowClass}>
          <span className="text-slate-500">{t("prf.cloudSync")}</span>
          <span className="font-semibold text-slate-700 dark:text-slate-300 text-right">Supabase & Firebase</span>
        </div>

        <p className="text-[11px] text-slate-400 pt-1 leading-relaxed">{t("prf.aboutNote")}</p>
      </div>
    </div>
  );
}