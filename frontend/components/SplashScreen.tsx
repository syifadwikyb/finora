"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

export default function SplashScreen({ onFinish }: { onFinish: () => void }) {
  const [phase, setPhase] = useState<"enter" | "visible" | "exit">("enter");

  useEffect(() => {
    // Fase masuk → visible setelah 100ms (memicu animasi masuk)
    const enterTimer = setTimeout(() => setPhase("visible"), 100);

    // Mulai fade-out setelah 1.8 detik
    const exitTimer = setTimeout(() => setPhase("exit"), 2400);

    // Selesai setelah animasi fade-out (total ~2.3 detik)
    const finishTimer = setTimeout(() => onFinish(), 2900);

    return () => {
      clearTimeout(enterTimer);
      clearTimeout(exitTimer);
      clearTimeout(finishTimer);
    };
  }, [onFinish]);

  return (
    <div
      className={`fixed inset-0 z-[200] flex flex-col items-center justify-center transition-all duration-500 ease-in-out bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-800 dark:from-slate-950 dark:via-emerald-950 dark:to-slate-950 ${phase === "exit" ? "opacity-0 scale-105" : phase === "visible" ? "opacity-100 scale-100" : "opacity-0 scale-95"
        }`}
    >
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Large blurred circle top-right */}
        <div
          className="absolute -top-20 -right-20 w-80 h-80 rounded-full opacity-20 dark:opacity-10"
          style={{
            background: "radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%)",
          }}
        />
        {/* Small blurred circle bottom-left */}
        <div
          className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full opacity-15 dark:opacity-10"
          style={{
            background: "radial-gradient(circle, rgba(52,211,153,0.5) 0%, transparent 70%)",
          }}
        />
        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.5) 1px, transparent 0)`,
            backgroundSize: "32px 32px",
          }}
        />
      </div>

      {/* Logo container */}
      <div className="relative flex flex-col items-center">
        {/* Logo: muncul dengan efek zoom-in */}
        <div className="relative mb-6">
          <div className="absolute inset-0 rounded-full bg-white/25 dark:bg-emerald-400/20 blur-2xl scale-150 animate-pulse" />
          <Image
            src="/finora_logo.png"
            alt="Finora"
            width={96}
            height={96}
            priority
            className="relative w-24 h-24 object-contain drop-shadow-2xl"
          />
        </div>

        {/* Nama: muncul setelah logo */}
        <h1
          className={`text-white text-3xl font-bold tracking-[0.2em] mb-2 drop-shadow-lg transition-all duration-700 ease-out ${phase === "enter" ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"
            }`}
          style={{ transitionDelay: "500ms" }}
        >
          FINORA
        </h1>

        {/* Slogan: muncul paling akhir */}
        <p
          className={`text-emerald-200/70 dark:text-emerald-300/60 text-sm font-medium tracking-wider transition-all duration-700 ease-out ${phase === "enter" ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"
            }`}
          style={{ transitionDelay: "800ms" }}
        >
          Personal Finance Tracker
        </p>
      </div>

      {/* Loading indicator */}
      <div
        className={`absolute bottom-20 flex flex-col items-center transition-all duration-500 ${phase === "visible" ? "opacity-100" : "opacity-0"
          }`}
        style={{ transitionDelay: "600ms" }}
      >
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-white/40 dark:bg-emerald-300/50"
              style={{
                animation: `splashDot 1.4s ease-in-out ${i * 0.2}s infinite`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Inline keyframe animation for dots */}
      <style jsx>{`
        @keyframes splashDot {
          0%, 80%, 100% {
            transform: scale(0.6);
            opacity: 0.4;
          }
          40% {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
