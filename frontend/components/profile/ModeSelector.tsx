"use client";

import { Sliders, Layers, CreditCard } from "lucide-react";
import { AppMode, useSettings } from "@/lib/settingsContext";

export default function ModeSelector() {
  const { appMode, setAppMode, t } = useSettings();

  const modes: { id: AppMode; label: string; desc: string; icon: any }[] = [
    {
      id: "envelope",
      label: t("settings.modeEnvelope"),
      desc: t("settings.modeEnvelopeDesc"),
      icon: Layers,
    },
    {
      id: "flexible",
      label: t("settings.modeFlexible"),
      desc: t("settings.modeFlexibleDesc"),
      icon: CreditCard,
    },
  ];

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
      <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800 mb-5">
        <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
          <Sliders className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-bold text-base text-slate-900 dark:text-white">
            {t("settings.modeTitle")}
          </h3>
          <p className="text-xs text-slate-500">
            {t("settings.modeDesc")}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {modes.map((item) => {
          const Icon = item.icon;
          const isSelected = appMode === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setAppMode(item.id)}
              className={`flex flex-col text-left p-4 rounded-xl border transition-all cursor-pointer ${
                isSelected
                  ? "border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/40 shadow-xs ring-1 ring-emerald-500"
                  : "border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50"
              }`}
            >
              <div className="flex items-center gap-2.5 mb-2">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    isSelected
                      ? "bg-emerald-600 text-white"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <span className="font-bold text-xs text-slate-900 dark:text-white">
                  {item.label}
                </span>
              </div>
              <p className="text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
                {item.desc}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

