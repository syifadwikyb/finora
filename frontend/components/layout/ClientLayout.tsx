"use client";

import { useAuth } from "@/components/auth/AuthProvider";
import LockScreen from "@/components/auth/LockScreen";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const { user, isLocked, unlock } = useAuth();

  return (
    <>
      {isLocked && user && <LockScreen user={user} onUnlock={unlock} />}
      {children}
    </>
  );
}

