"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

/**
 * BackNavigationHandler
 * 
 * Menangani perilaku tombol back hardware/browser di mobile:
 * - Menekan back → kembali ke halaman sebelumnya di history
 * - Jika sudah di halaman root (/) → keluar dari website (default browser)
 * 
 * Cara kerja:
 * Setiap kali halaman berubah, kita inject satu dummy state ke history.
 * Sehingga saat user tekan back, browser akan "pop" dummy tersebut dulu
 * dan kita bisa intercept event `popstate` untuk navigasi custom.
 */
export default function BackNavigationHandler() {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // Hanya aktif di mobile (md breakpoint ke bawah)
    if (typeof window === "undefined") return;
    if (pathname === "/login" || pathname === "/register") return;

    // Push dummy state agar popstate bisa dideteksi
    window.history.pushState({ finora_nav: true }, "", window.location.href);

    const handlePopState = (e: PopStateEvent) => {
      // Jika user menekan back dan kita di halaman root, biarkan browser keluar
      if (pathname === "/") {
        // Tidak intercept — biarkan browser keluar / menutup tab
        return;
      }

      // Jika bukan di root, navigasi ke dashboard
      e.preventDefault();
      router.push("/");
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [pathname, router]);

  return null;
}
