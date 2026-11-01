"use client";

import { useAuth } from "@/components/auth/AuthProvider";
import LockScreen from "@/components/auth/LockScreen";
import { useEffect, useState } from "react";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const { user, isLocked, unlock } = useAuth();
  const [pinEnabled, setPinEnabled] = useState(false);

  useEffect(() => {
    // Cek apakah PIN diaktifkan dari cookie atau localStorage
    const checkPinEnabled = () => {
      const cookieEnabled = document.cookie
        .split("; ")
        .find((row) => row.startsWith("finora_pin_enabled="))
        ?.split("=")[1];
      
      const localMethod = user ? localStorage.getItem(`finora_lock_method_${user.uid}`) : null;
      const isEnabled = cookieEnabled === "true" || localMethod === "pin";

      if (isEnabled && cookieEnabled !== "true") {
        document.cookie = "finora_pin_enabled=true; path=/; SameSite=Lax";
      }

      setPinEnabled(isEnabled);
    };
    checkPinEnabled();
    // Re-check ketika window fokus atau visibility change
    window.addEventListener("focus", checkPinEnabled);
    document.addEventListener("visibilitychange", checkPinEnabled);
    return () => {
      window.removeEventListener("focus", checkPinEnabled);
      document.removeEventListener("visibilitychange", checkPinEnabled);
    };
  }, [user]);

  return (
    <>
      {/* Tampilkan lock screen hanya jika PIN aktif DAN sedang terkunci */}
      {pinEnabled && isLocked && user && <LockScreen user={user} onUnlock={unlock} />}
      {children}
    </>
  );
}

