"use client";
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { onAuthStateChangedListener, logout, auth } from "@/lib/firebase";
import { User } from "firebase/auth";
import { useRouter } from "next/navigation";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChangedListener(async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Jika sudah verified, langsung set agar dashboard tidak menendang user ke /login
          if (firebaseUser.emailVerified) {
            setUser(firebaseUser);
          }

          // Sinkronisasi data terbaru dari Firebase
          await firebaseUser.reload();

          if (firebaseUser.emailVerified) {
            setUser(auth.currentUser || firebaseUser);
          } else {
            setUser(null);
            await logout();
          }
        } catch (error) {
          console.error("Gagal menyegarkan data user:", error);
          if (firebaseUser.emailVerified) {
            setUser(firebaseUser);
          } else {
            setUser(null);
          }
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const handleLogout = async () => {
    await logout();
    setUser(null);
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout: handleLogout }}>
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