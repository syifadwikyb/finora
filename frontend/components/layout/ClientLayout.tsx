"use client";

import { useAuth } from "@/components/auth/AuthProvider";
import LockScreen from "@/components/auth/LockScreen";
import { useEffect, useState } from "react";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const { user, isLocked, unlock } = useAuth();
  const [pinEnabled, setPinEnabled] = useState(false);

  useEffect(() => {
    // Cek apakah PIN diaktifkan dari cookie
    const checkPinEnabled = () => {
      const enabled = document.cookie
        .split("; ")
        .find((row) => row.startsWith("finora_pin_enabled="))
        ?.split("=")[1];
      setPinEnabled(enabled === "true");
    };
    checkPinEnabled();
    // Re-check ketika cookie berubah (misalnya setelah enable/disable PIN di profil)
    window.addEventListener("focus", checkPinEnabled);
    return () => window.removeEventListener("focus", checkPinEnabled);
  }, []);

  return (
    <>
      {/* Tampilkan lock screen hanya jika PIN aktif DAN sedang terkunci */}
      {pinEnabled && isLocked && user && <LockScreen user={user} onUnlock={unlock} />}
      {children}
    </>
  );
}

