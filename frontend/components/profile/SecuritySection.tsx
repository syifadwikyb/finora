"use client";

import { useState } from "react";
import {
  Fingerprint,
  KeyRound,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { User } from "firebase/auth";
import { changePassword, getAuthErrorMessage } from "@/lib/firebase";
import LockScreenSettings from "./LockScreenSettings";

interface SecuritySectionProps {
  user: User;
  displayName: string;
}

export default function SecuritySection({ user, displayName }: SecuritySectionProps) {
  // Password States
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    if (!currentPassword) {
      setPasswordError("Silakan masukkan password saat ini untuk verifikasi keamanan.");
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError("Password baru harus minimal 6 karakter.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("Konfirmasi password baru tidak cocok.");
      return;
    }

    setPasswordSaving(true);
    try {
      await changePassword(currentPassword, newPassword);
      setPasswordSuccess("Password berhasil diubah!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setPasswordSuccess(null), 3500);
    } catch (err: any) {
      setPasswordError(getAuthErrorMessage(err));
    } finally {
      setPasswordSaving(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-6">
      <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="w-9 h-9 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold">
          <KeyRound className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-bold text-base text-slate-900 dark:text-white">Security & Biometrics</h3>
          <p className="text-xs text-slate-500">Manage your credentials and device authentication</p>
        </div>
      </div>

      {/* Fingerprint / Biometric Section */}
      {/* <LockScreenSettings user={user} /> */}
      {/* Change Password Form */}
      <div className="pt-2">
        <h4 className="font-bold text-xs text-slate-900 dark:text-white mb-3">
          Change Password
        </h4>

        {user?.providerData?.some((p) => p.providerId === "password") ? (
          <>
            {passwordSuccess && (
              <div className="mb-4 bg-emerald-50 dark:bg-emerald-900/30 border-l-4 border-emerald-500 p-3 rounded-r-lg flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <p className="text-xs text-emerald-700 dark:text-emerald-300 font-medium">{passwordSuccess}</p>
              </div>
            )}

            {passwordError && (
              <div className="mb-4 bg-rose-50 dark:bg-rose-900/30 border-l-4 border-rose-500 p-3 rounded-r-lg flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <p className="text-xs text-rose-700 dark:text-rose-300 font-medium">{passwordError}</p>
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Current Password (Password Saat Ini)
                </label>
                <input
                  type="password"
                  required
                  placeholder="Masukkan password saat ini untuk verifikasi"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    New Password (Password Baru)
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Minimal 6 karakter"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-xs"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Ulangi password baru"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-xs"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={passwordSaving}
                  className="px-5 py-2.5 bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 text-white font-bold text-xs rounded-xl shadow-xs transition-all disabled:opacity-50"
                >
                  {passwordSaving ? "Updating..." : "Update Password"}
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 flex items-start gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-white dark:bg-slate-700 shadow-xs border border-slate-200 dark:border-slate-600 flex items-center justify-center shrink-0 mt-0.5">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
            </div>
            <div className="space-y-1">
              <h5 className="font-bold text-xs text-slate-900 dark:text-white">
                Akun Terhubung dengan Google
              </h5>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                Anda masuk menggunakan autentikasi Google (Single Sign-On). Manajemen kata sandi dan keamanan akun Anda dikelola secara langsung dan aman oleh Google.
              </p>
              <div className="pt-1">
                <a
                  href="https://myaccount.google.com/security"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
                >
                  Kelola Keamanan di Google Account &rarr;
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
