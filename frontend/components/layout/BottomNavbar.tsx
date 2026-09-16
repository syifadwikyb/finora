"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ReceiptText, Tags, User } from "lucide-react";

const navItems = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Transaksi", href: "/transactions", icon: ReceiptText },
  { label: "Kategori", href: "/categories", icon: Tags },
  { label: "Profil", href: "/profile", icon: User },
];

export default function BottomNavbar() {
  const pathname = usePathname();

  // Sembunyikan pada halaman autentikasi
  if (pathname === "/login" || pathname === "/register") {
    return null;
  }

  return (
    <div className="fixed bottom-4 inset-x-0 z-40 flex justify-center px-4 md:hidden pointer-events-none">
      <nav
        aria-label="Mobile Navigation"
        className="pointer-events-auto flex items-center gap-1 p-1.5 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-full border border-slate-200/80 dark:border-slate-800 shadow-xl shadow-slate-900/10 dark:shadow-black/40"
      >
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-label={item.label}
              className={`flex items-center gap-2 rounded-full transition-all duration-300 select-none ${
                isActive
                  ? "px-4 py-2.5 bg-emerald-500 text-white shadow-md shadow-emerald-500/30"
                  : "px-3 py-2.5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-slate-800/60"
              }`}
            >
              <Icon className="w-[18px] h-[18px] shrink-0" />
              {/* Label hanya muncul saat aktif */}
              {isActive && (
                <span className="text-xs font-semibold whitespace-nowrap overflow-hidden max-w-[72px] animate-[fadeIn_0.2s_ease]">
                  {item.label}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
