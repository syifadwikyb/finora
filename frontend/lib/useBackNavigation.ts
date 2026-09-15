"use client";

import { useEffect, useRef, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";

/**
 * Hook untuk menangani navigasi back:
 * - Dari halaman non-Dashboard → kembali ke halaman sebelumnya
 * - Dari Dashboard (/) → tekan back lagi → exit (atau konfirmasi)
 * 
 * Menggunakan history stack tracking karena Next.js App Router
 * tidak meng-expose history length secara native.
 */
export function useBackNavigation() {
  const pathname = usePathname();
  const router = useRouter();
  const historyStack = useRef<string[]>([]);
  const backPressedOnDashboard = useRef(false);
  const backPressTimestamp = useRef(0);

  // Track navigation history
  useEffect(() => {
    const stack = historyStack.current;
    // Hindari duplikasi path berturut-turut
    if (stack[stack.length - 1] !== pathname) {
      stack.push(pathname);
    }
  }, [pathname]);

  // Handle popstate (tombol back browser/hardware)
  useEffect(() => {
    const handlePopState = () => {
      const stack = historyStack.current;

      if (pathname === "/") {
        // Sudah di Dashboard
        const now = Date.now();
        if (now - backPressTimestamp.current < 2000) {
          // Double back press dalam 2 detik → close/exit
          if (typeof window !== "undefined") {
            window.close();
            // Fallback: jika window.close() tidak bekerja (tab bukan popup)
            // Biarkan browser handle default behavior
          }
        } else {
          // Pertama kali back di Dashboard: push state kembali agar user tetap di halaman
          backPressTimestamp.current = now;
          window.history.pushState(null, "", "/");
        }
      } else {
        // Bukan di Dashboard: pop stack dan navigasi ke entry sebelumnya
        if (stack.length > 1) {
          stack.pop(); // Hapus current
          const prevPath = stack[stack.length - 1] || "/";
          router.replace(prevPath);
        } else {
          // Stack kosong, kembali ke Dashboard
          router.replace("/");
        }
      }
    };

    // Push initial state agar kita bisa mendeteksi back press
    window.history.pushState(null, "", window.location.href);
    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [pathname, router]);

  return {
    canGoBack: historyStack.current.length > 1,
    isOnDashboard: pathname === "/",
  };
}
