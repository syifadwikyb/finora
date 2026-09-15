"use client";

import { Sun, Moon, Laptop } from "lucide-react";

interface ThemeSelectorProps {
  theme: "light" | "dark" | "system";
  onThemeChange: (theme: "light" | "dark" | "system") => void;
}

export default function ThemeSelector({ theme, onThemeChange }: ThemeSelectorProps) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
      <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800 mb-5">
        <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
          <Sun className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-bold text-base text-slate-900 dark:text-white">Theme & Display</h3>
          <p className="text-xs text-slate-500">Pilih mode tampilan</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2.5">
        {[
          { id: "light", label: "Light", icon: Sun },
          { id: "dark", label: "Dark", icon: Moon },
          { id: "system", label: "System", icon: Laptop },
        ].map((item) => {
          const Icon = item.icon;
          const isSelected = theme === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onThemeChange(item.id as any)}
              className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-semibold transition-all ${isSelected
                ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 shadow-xs ring-1 ring-emerald-500"
                : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                }`}
            >
              <Icon className="w-5 h-5 mb-1.5" />
              {item.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
