"use client";

import { useState } from "react";
import { User } from "firebase/auth";

interface LockScreenProps {
  user: User;
  onUnlock: () => void;
}

async function hashPin(pin: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(pin);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export default function LockScreen({ user, onUnlock }: LockScreenProps) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);

  const handlePinKeyDown = (digit: string) => {
    if (pin.length < 4) {
      const newPin = pin + digit;
      setPin(newPin);
      setError(null);

      if (newPin.length === 4) {
        setTimeout(async () => {
          setVerifying(true);
          try {
            const storedHash = localStorage.getItem(`finora_lock_pin_${user.uid}`);
            if (!storedHash) {
              document.cookie = "finora_pin_verified=true; path=/; SameSite=Lax";
              onUnlock();
              return;
            }
            const inputHash = await hashPin(newPin);
            if (inputHash === storedHash) {
              localStorage.setItem(`finora_last_active_${user.uid}`, Date.now().toString());
              document.cookie = "finora_pin_verified=true; path=/; SameSite=Lax";
              onUnlock();
            } else {
              setError("Incorrect PIN. Try again.");
              setPin("");
            }
          } finally {
            setVerifying(false);
          }
        }, 150);
      }
    }
  };

  const handlePinBackspace = () => {
    setPin(pin.slice(0, -1));
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-gradient-to-b from-slate-900 via-slate-950 to-emerald-950 flex flex-col items-center justify-center p-6">
      <div className="mb-8 flex flex-col items-center">
        <div className="w-16 h-16 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-2xl shadow-emerald-500/30 mb-4">
          <svg className="w-9 h-9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
            <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
            <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
          </svg>
        </div>
        <h1 className="text-white text-xl font-bold tracking-tight">Finora</h1>
        <p className="text-emerald-300/60 text-xs mt-1">
          {user.displayName || user.email?.split("@")[0] || "User"}
        </p>
      </div>

      <div className="w-full max-w-xs space-y-6">
        <p className="text-center text-sm text-slate-400">Enter 4-digit PIN</p>

        <div className="flex justify-center gap-4">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={`w-4 h-4 rounded-full transition-all duration-200 ${
                i < pin.length
                  ? "bg-emerald-500 scale-110 shadow-lg shadow-emerald-500/50"
                  : "bg-slate-700 border border-slate-600"
              }`}
            />
          ))}
        </div>

        {error && (
          <p className="text-center text-xs text-rose-400 font-medium animate-pulse">{error}</p>
        )}

        <div className="grid grid-cols-3 gap-3 max-w-[240px] mx-auto">
          {["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "⌫"].map((key, idx) => {
            if (key === "") return <div key={idx} />;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => (key === "⌫" ? handlePinBackspace() : handlePinKeyDown(key))}
                disabled={verifying}
                className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 text-white text-xl font-semibold
                  hover:bg-white/10 active:bg-white/20 active:scale-95
                  transition-all duration-150 disabled:opacity-50
                  flex items-center justify-center mx-auto cursor-pointer"
              >
                {key}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
