"use client";
import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import { onAuthStateChangedListener, logout, auth } from "@/lib/firebase";
import { User } from "firebase/auth";
import { useRouter } from "next/navigation";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isLocked: boolean;
  unlock: () => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const IDLE_MS = 5 * 60 * 1000; // 5 minutes

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLocked, setIsLocked] = useState(false);
  const router = useRouter();

  // Listen to Firebase auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChangedListener(async (firebaseUser) => {
      if (firebaseUser) {
        try {
          if (firebaseUser.emailVerified) {
            setUser(firebaseUser);
          }
          await firebaseUser.reload();
          if (firebaseUser.emailVerified) {
            setUser(auth.currentUser || firebaseUser);
          } else {
            setUser(null);
            await logout();
          }
        } catch (error) {
          console.error("Failed to refresh user:", error);
          if (firebaseUser.emailVerified) {
            setUser(firebaseUser);
          } else {
            setUser(null);
          }
        }
      } else {
        setUser(null);
        setIsLocked(false);
        // Hapus cookie verifikasi pin saat user logout
        document.cookie = "finora_pin_verified=; path=/; max-age=0; SameSite=Lax";
        document.cookie = "finora_pin_enabled=; path=/; max-age=0; SameSite=Lax";
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  // Idle timer — lock the app after 5 min of inactivity (hanya jika PIN aktif)
  useEffect(() => {
    if (!user) return;

    let timer: ReturnType<typeof setTimeout>;

    const resetTimer = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        // Cek apakah PIN diaktifkan lewat cookie (bisa dibaca dari document.cookie)
        const pinEnabled = document.cookie
          .split("; ")
          .find((row) => row.startsWith("finora_pin_enabled="))
          ?.split("=")[1];

        if (pinEnabled === "true") {
          setIsLocked(true);
          // Reset cookie agar saat refresh wajib PIN lagi
          document.cookie = "finora_pin_verified=; path=/; max-age=0; SameSite=Lax";
        }
      }, IDLE_MS);
    };

    const events = ["mousemove", "keydown", "click", "touchstart", "scroll"];
    events.forEach((e) => window.addEventListener(e, resetTimer, { passive: true }));
    resetTimer(); // Start the timer immediately

    return () => {
      clearTimeout(timer);
      events.forEach((e) => window.removeEventListener(e, resetTimer));
    };
  }, [user]);

  const unlock = useCallback(() => {
    setIsLocked(false);
    document.cookie = "finora_pin_verified=true; path=/; SameSite=Lax";
  }, []);

  const handleLogout = async () => {
    await logout();
    setUser(null);
    setIsLocked(false);
    document.cookie = "finora_pin_verified=; path=/; max-age=0; SameSite=Lax";
    document.cookie = "finora_pin_enabled=; path=/; max-age=0; SameSite=Lax";
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ user, loading, isLocked, unlock, logout: handleLogout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
