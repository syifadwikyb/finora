"use client";

import { useState, useEffect } from "react";
import { Lock, Fingerprint, KeyRound, Shield } from "lucide-react";
import { User } from "firebase/auth";

type LockMethod = "none" | "pin" | "biometric";

interface LockScreenSettingsProps {
  user: User;
}

// Simple hash function for PIN (SHA-256)
async function hashPin(pin: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(pin);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export default function LockScreenSettings({ user }: LockScreenSettingsProps) {
  const [lockMethod, setLockMethod] = useState<LockMethod>("none");
  const [pinInput, setPinInput] = useState("");
  const [confirmPinInput, setConfirmPinInput] = useState("");
  const [settingPin, setSettingPin] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      const saved = localStorage.getItem(`finora_lock_method_${user.uid}`);
      if (saved === "pin" || saved === "biometric") {
        setLockMethod(saved);
      }
    }
  }, [user]);

  const handleSetPin = async () => {
    setError(null);
    setMessage(null);

    if (pinInput.length !== 4 || !/^\d{4}$/.test(pinInput)) {
      setError("PIN harus terdiri dari 4 digit angka.");
      return;
    }

    if (pinInput !== confirmPinInput) {
      setError("Konfirmasi PIN tidak cocok.");
      return;
    }

    setSettingPin(true);
    try {
      const hashedPin = await hashPin(pinInput);
      localStorage.setItem(`finora_lock_pin_${user.uid}`, hashedPin);
      localStorage.setItem(`finora_lock_method_${user.uid}`, "pin");
      setLockMethod("pin");
      setPinInput("");
      setConfirmPinInput("");
      setMessage("✅ PIN berhasil diatur! Lock screen akan aktif saat Anda kembali ke aplikasi.");
      setTimeout(() => setMessage(null), 4000);
    } catch {
      setError("Gagal mengatur PIN. Silakan coba lagi.");
    } finally {
      setSettingPin(false);
    }
  };

  const handleEnableBiometric = async () => {
    setError(null);
    setMessage(null);

    if (typeof window === "undefined" || !window.PublicKeyCredential || !navigator.credentials) {
      setError("Browser Anda tidak mendukung Web Authentication API.");
      return;
    }

    try {
      const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
      if (!available) {
        setError("Perangkat ini belum mendukung sensor biometrik platform.");
        return;
      }

      localStorage.setItem(`finora_lock_method_${user.uid}`, "biometric");
      setLockMethod("biometric");
      setMessage("✅ Biometrik aktif sebagai lock screen! Sidik jari akan diminta saat kembali ke aplikasi.");
      setTimeout(() => setMessage(null), 4000);
    } catch {
      setError("Gagal mengaktifkan biometrik untuk lock screen.");
    }
  };

  const handleDisableLock = () => {
    localStorage.removeItem(`finora_lock_method_${user.uid}`);
    localStorage.removeItem(`finora_lock_pin_${user.uid}`);
    setLockMethod("none");
    setPinInput("");
    setConfirmPinInput("");
    setMessage("Lock screen dinonaktifkan.");
    setTimeout(() => setMessage(null), 4000);
  };

  return (
    <div>
      {/* Current status */}
      <div className="mb-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-500">Status</span>
          <span className={`text-xs font-bold ${lockMethod === "none" ? "text-slate-400" : "text-emerald-600 dark:text-emerald-400"}`}>
            {lockMethod === "none" && "Tidak aktif"}
            {lockMethod === "pin" && "🔒 PIN Aktif"}
            {lockMethod === "biometric" && "🔒 Biometrik Aktif"}
          </span>
        </div>
      </div>

      {lockMethod === "none" ? (
        <div className="space-y-3">
          {/* PIN Option */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <KeyRound className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-xs text-slate-900 dark:text-white">Gunakan PIN</h4>
                <p className="text-[11px] text-slate-500">4 digit angka untuk membuka aplikasi</p>
              </div>
            </div>

            <div className="space-y-2">
              <input
                type="password"
                inputMode="numeric"
                maxLength={4}
                placeholder="Masukkan PIN 4 digit"
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value.replace(/\D/g, "").slice(0, 4))}
                className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-xs text-center tracking-[0.5em] font-mono"
              />
              <input
                type="password"
                inputMode="numeric"
                maxLength={4}
                placeholder="Konfirmasi PIN"
                value={confirmPinInput}
                onChange={(e) => setConfirmPinInput(e.target.value.replace(/\D/g, "").slice(0, 4))}
                className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-xs text-center tracking-[0.5em] font-mono"
              />
              <button
                type="button"
                onClick={handleSetPin}
                disabled={settingPin || pinInput.length < 4}
                className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 transition-all disabled:opacity-50"
              >
                {settingPin ? "Menyimpan..." : "Aktifkan PIN"}
              </button>
            </div>
          </div>

          {/* Biometric Option */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <Fingerprint className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-slate-900 dark:text-white">Fingerprint / Biometric Login</h4>
                  <p className="text-[11px] text-slate-500">Aktifkan autentikasi sidik jari untuk login cepat di perangkat ini.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleEnableBiometric}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] rounded-lg shadow-xs transition-all"
              >
                Aktifkan
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={handleDisableLock}
          className="w-full py-2.5 px-4 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
        >
          Nonaktifkan Lock Screen
        </button>
      )}

      {message && (
        <div className="mt-3 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-medium border border-emerald-100 dark:border-emerald-900">
          {message}
        </div>
      )}

      {error && (
        <div className="mt-3 p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs font-medium border border-rose-100 dark:border-rose-900">
          {error}
        </div>
      )}
    </div>
  );
}
