"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ReceiptText, Tags, Wallet, X } from "lucide-react";

interface MobileNavbarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navItems = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Transactions", href: "/transactions", icon: ReceiptText },
  { label: "Categories", href: "/categories", icon: Tags },
];

export default function MobileNavbar({ isOpen, onClose }: MobileNavbarProps) {
  const pathname = usePathname();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden bg-slate-900/60 backdrop-blur-xs flex">
      <div className="w-4/5 max-w-xs bg-white dark:bg-slate-900 h-full p-5 flex flex-col shadow-xl animate-in slide-in-from-left duration-200">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-bold shadow-md shadow-emerald-500/20">
              <Wallet className="w-5 h-5" />
            </div>
            <span className="font-bold text-lg text-slate-900 dark:text-white">FINORA</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="space-y-1.5 flex-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 font-semibold"
                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400"}`} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-400">
          "Manage your money, simply."
        </div>
      </div>
      <div className="flex-1" onClick={onClose} />
    </div>
  );
}
