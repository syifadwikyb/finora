"use client";

import { useState, useEffect } from "react";
import { Fingerprint, KeyRound } from "lucide-react";
import { User } from "firebase/auth";

type LockMethod = "none" | "pin" | "biometric";

interface LockScreenSettingsProps {
  user: User;
}

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
      setError("PIN must be 4 digits.");
      return;
    }

    if (pinInput !== confirmPinInput) {
      setError("PINs do not match.");
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
      setMessage("PIN enabled. Screen will lock after 5 minutes of inactivity.");
      setTimeout(() => setMessage(null), 4000);
    } catch {
      setError("Failed to set PIN. Try again.");
    } finally {
      setSettingPin(false);
    }
  };

  const handleEnableBiometric = async () => {
    setError(null);
    setMessage(null);

    if (typeof window === "undefined" || !window.PublicKeyCredential || !navigator.credentials) {
      setError("Your browser does not support biometric authentication.");
      return;
    }

    try {
      const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
      if (!available) {
        setError("Device does not support fingerprint or biometric authentication.");
        return;
      }

      localStorage.setItem(`finora_lock_method_${user.uid}`, "biometric");
      setLockMethod("biometric");
      setMessage("Biometrics enabled. Unlock with fingerprint after 5 min idle.");
      setTimeout(() => setMessage(null), 4000);
    } catch {
      setError("Failed to enable biometric authentication.");
    }
  };

  const handleDisableLock = () => {
    localStorage.removeItem(`finora_lock_method_${user.uid}`);
    localStorage.removeItem(`finora_lock_pin_${user.uid}`);
    setLockMethod("none");
    setPinInput("");
    setConfirmPinInput("");
    setMessage("Lock screen disabled.");
    setTimeout(() => setMessage(null), 4000);
  };

  return (
    <div className="space-y-3">
      {/* Current status */}
      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <span className="text-xs text-slate-500">Lock Method</span>
        <span className={`text-xs font-semibold ${lockMethod === "none" ? "text-slate-400" : "text-emerald-600 dark:text-emerald-400"}`}>
          {lockMethod === "none" && "Disabled"}
          {lockMethod === "pin" && "PIN Lock"}
          {lockMethod === "biometric" && "Fingerprint / Biometric"}
        </span>
      </div>

      {lockMethod === "none" ? (
        <div className="space-y-3">
          {/* Biometric Option */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Fingerprint className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-semibold text-xs text-slate-900 dark:text-white">Fingerprint Unlock</h4>
                <p className="text-[11px] text-slate-500">Fast biometric login after inactivity</p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleEnableBiometric}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs rounded-lg transition-colors cursor-pointer"
            >
              Enable
            </button>
          </div>

          {/* PIN Option */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <KeyRound className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-semibold text-xs text-slate-900 dark:text-white">4-Digit PIN</h4>
                <p className="text-[11px] text-slate-500">Alternative passcode unlock</p>
              </div>
            </div>

            <div className="space-y-2">
              <input
                type="password"
                inputMode="numeric"
                maxLength={4}
                placeholder="4-digit PIN"
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value.replace(/\D/g, "").slice(0, 4))}
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-xs text-center tracking-[0.5em] font-mono"
              />
              <input
                type="password"
                inputMode="numeric"
                maxLength={4}
                placeholder="Confirm PIN"
                value={confirmPinInput}
                onChange={(e) => setConfirmPinInput(e.target.value.replace(/\D/g, "").slice(0, 4))}
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-xs text-center tracking-[0.5em] font-mono"
              />
              <button
                type="button"
                onClick={handleSetPin}
                disabled={settingPin || pinInput.length < 4}
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs rounded-xl transition-colors disabled:opacity-50 cursor-pointer"
              >
                {settingPin ? "Saving..." : "Set PIN"}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={handleDisableLock}
          className="w-full py-2 px-4 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          Disable Lock Screen
        </button>
      )}

      {message && (
        <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-medium border border-emerald-100 dark:border-emerald-900">
          {message}
        </div>
      )}

      {error && (
        <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs font-medium border border-rose-100 dark:border-rose-900">
          {error}
        </div>
      )}
    </div>
  );
}
