"use client";

import { useState } from "react";
import MobileNavbar from "./MobileNavbar";
import { Menu, Wallet } from "lucide-react";

interface NavbarProps {
  title?: string;
  subtitle?: string;
}

export default function Navbar({ title = "Dashboard", subtitle = "Manage your money, simply." }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 py-4 md:px-8 flex items-center justify-between sticky top-0 z-10 shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileOpen(true)}
            className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            aria-label="Open navigation menu"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{title}</h1>
            <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-semibold border border-emerald-100 dark:border-emerald-900">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Finora App
          </div>
        </div>
      </header>

      <MobileNavbar isOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
    </>
  );
}
