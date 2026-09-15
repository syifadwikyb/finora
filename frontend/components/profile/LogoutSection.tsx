"use client";

import { useState } from "react";
import { LogOut } from "lucide-react";

interface LogoutSectionProps {
  onLogout: () => Promise<void>;
}

export default function LogoutSection({ onLogout }: LogoutSectionProps) {
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  return (
    <>
      <div className="bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 rounded-2xl p-6 shadow-xs">
        <h3 className="font-bold text-sm text-rose-800 dark:text-rose-300 mb-1">Session & Account</h3>
        <p className="text-xs text-rose-600/80 dark:text-rose-400 mb-4">
          Keluar dari sesi akun Anda di perangkat ini.
        </p>

        <button
          type="button"
          onClick={() => setShowLogoutConfirm(true)}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-600/20 transition-all hover:scale-102"
        >
          <LogOut className="w-4 h-4" />
          Sign Out from Finora
        </button>
      </div>

      {/* Confirmation Modal Logout */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-sm rounded-2xl p-6 shadow-2xl animate-in zoom-in-95 duration-150 space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-950/80 text-rose-600 mx-auto flex items-center justify-center">
              <LogOut className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Konfirmasi Logout</h3>
              <p className="text-xs text-slate-500 mt-1">
                Apakah Anda yakin ingin keluar dari akun ini?
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 py-2.5 px-4 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={onLogout}
                className="flex-1 py-2.5 px-4 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-colors"
              >
                Ya, Keluar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
