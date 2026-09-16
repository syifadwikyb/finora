"use client";

import { useState, useEffect } from "react";
import { login, signInWithGoogle, getAuthErrorMessage, auth, logout } from "@/lib/firebase";
import { useAuth } from "@/components/auth/AuthProvider";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Wallet, Loader2, Mail, Lock, Eye, EyeOff, AlertCircle, CheckCircle2 } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("verified") === "true") {
        setSuccessNotice("Email Anda berhasil diverifikasi! Silakan login untuk melanjutkan.");
      }
    }
  }, []);

  useEffect(() => {
    if (!authLoading && user) {
      router.replace("/");
    }
  }, [user, authLoading, router]);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError(null);
      setSubmitting(true);
      const userCredential = await login(email, password);

      if (!userCredential.user.emailVerified) {
        await logout();
        setError("Email belum diverifikasi. Silakan periksa inbox/spam Gmail Anda, lalu klik link verifikasi.");
        setSubmitting(false);
        return;
      }

      router.replace("/");
    } catch (err: any) {
      setError(getAuthErrorMessage(err));
      setSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setError(null);
      setSubmitting(true);
      await signInWithGoogle();
      router.replace("/");
    } catch (err: any) {
      setError(getAuthErrorMessage(err));
      setSubmitting(false);
    }
  };

  return (
    <>
      {/* Fixed full-screen background — prevents color change on mobile overscroll */}
      <div className="fixed inset-0 bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-800 dark:from-slate-950 dark:via-emerald-950 dark:to-slate-950 -z-10" />
      {/* Decorative blobs */}
      <div className="fixed top-0 left-0 w-72 h-72 bg-white/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none -z-10" />
      <div className="fixed bottom-0 right-0 w-96 h-96 bg-emerald-400/20 rounded-full blur-3xl translate-x-1/3 translate-y-1/3 pointer-events-none -z-10" />
      <div className="fixed top-1/2 right-0 w-48 h-48 bg-teal-300/15 rounded-full blur-2xl translate-x-1/2 pointer-events-none -z-10" />

      {/* Scrollable content */}
      <div className="min-h-screen flex flex-col justify-center px-5 py-10 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="sm:mx-auto sm:w-full sm:max-w-md mb-8 text-center">
          <div className="flex justify-center mb-5">
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center shadow-2xl shadow-black/20">
              <Wallet className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Selamat Datang
          </h1>
          <p className="mt-2 text-emerald-100/80 text-sm">
            Masuk ke akun <span className="font-semibold text-white">Finora</span> Anda
          </p>
        </div>

        {/* Card */}
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl shadow-black/25 border border-white/20 dark:border-slate-800 p-7 sm:p-8">

            {successNotice && (
              <div className="mb-5 flex items-start gap-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 p-3.5 rounded-2xl">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
                <p className="text-xs text-emerald-700 dark:text-emerald-300 font-medium leading-relaxed">{successNotice}</p>
              </div>
            )}

            {error && (
              <div className="mb-5 flex items-start gap-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 p-3.5 rounded-2xl">
                <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 mt-0.5 shrink-0" />
                <p className="text-xs text-rose-700 dark:text-rose-400 font-medium leading-relaxed">{error}</p>
              </div>
            )}

            <form className="space-y-5" onSubmit={handleEmailLogin}>
              {/* Email Field */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500 pointer-events-none" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@email.com"
                    className="w-full pl-10 pr-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all text-sm"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500 pointer-events-none" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Masukkan password"
                    className="w-full pl-10 pr-11 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold text-sm shadow-lg shadow-emerald-500/30 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.98]"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Masuk...
                  </>
                ) : (
                  "Masuk"
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="my-5 flex items-center gap-3">
              <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
              <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">atau</span>
              <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
            </div>

            {/* Google Button */}
            <button
              onClick={handleGoogleLogin}
              disabled={submitting}
              className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold text-sm hover:bg-slate-50 dark:hover:bg-slate-750 hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-200 shadow-sm active:scale-[0.98] disabled:opacity-60"
            >
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Masuk dengan Google
            </button>

            {/* Register Link */}
            <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
              Belum punya akun?{" "}
              <Link href="/register" className="font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 transition-colors">
                Daftar sekarang
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
