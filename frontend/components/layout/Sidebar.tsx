"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ReceiptText, Tags, Wallet } from "lucide-react";

const navItems = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Transactions", href: "/transactions", icon: ReceiptText },
  { label: "Categories", href: "/categories", icon: Tags },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex flex-col w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 min-h-screen p-4 sticky top-0">
      <div className="flex items-center gap-3 px-3 py-4 border-b border-slate-100 dark:border-slate-800 mb-6">
        <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-bold text-xl shadow-md shadow-emerald-500/20">
          <Wallet className="w-5 h-5" />
        </div>
        <div>
          <h1 className="font-bold text-lg tracking-tight text-slate-900 dark:text-white">FINORA</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">Personal Finance</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 font-semibold"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800/50"
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400"}`} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-400 px-3">
        Finora &copy; 2026
      </div>
    </aside>
  );
}
