"use client";

import { Globe } from "lucide-react";
import { Language, useSettings } from "@/lib/settingsContext";

export default function LanguageSelector() {
  const { language, setLanguage, t } = useSettings();

  const languages: { id: Language; label: string; flag: string }[] = [
    { id: "id", label: t("settings.langIndonesian"), flag: "🇮🇩" },
    { id: "en", label: t("settings.langEnglish"), flag: "🇬🇧" },
  ];

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
      <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800 mb-5">
        <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
          <Globe className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-bold text-base text-slate-900 dark:text-white">
            {t("settings.langTitle")}
          </h3>
          <p className="text-xs text-slate-500">
            {t("settings.langDesc")}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {languages.map((item) => {
          const isSelected = language === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setLanguage(item.id)}
              className={`flex items-center justify-center gap-2.5 p-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                isSelected
                  ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 shadow-xs ring-1 ring-emerald-500"
                  : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50"
              }`}
            >
              <span className="text-base">{item.flag}</span>
              {item.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

