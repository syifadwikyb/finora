"use client";

import { useState, useEffect } from "react";

export default function SplashScreen({ onFinish }: { onFinish: () => void }) {
  const [phase, setPhase] = useState<"enter" | "visible" | "exit">("enter");

  useEffect(() => {
    // Fase masuk → visible setelah 100ms (memicu animasi masuk)
    const enterTimer = setTimeout(() => setPhase("visible"), 100);

    // Mulai fade-out setelah 1.8 detik
    const exitTimer = setTimeout(() => setPhase("exit"), 1800);

    // Selesai setelah animasi fade-out (total ~2.3 detik)
    const finishTimer = setTimeout(() => onFinish(), 2300);

    return () => {
      clearTimeout(enterTimer);
      clearTimeout(exitTimer);
      clearTimeout(finishTimer);
    };
  }, [onFinish]);

  return (
    <div
      className={`fixed inset-0 z-[200] flex flex-col items-center justify-center transition-all duration-500 ease-in-out ${
        phase === "exit" ? "opacity-0 scale-105" : phase === "visible" ? "opacity-100 scale-100" : "opacity-0 scale-95"
      }`}
      style={{
        background: "linear-gradient(135deg, #059669 0%, #0d9488 40%, #0f766e 70%, #064e3b 100%)",
      }}
    >
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Large blurred circle top-right */}
        <div
          className="absolute -top-20 -right-20 w-80 h-80 rounded-full opacity-20"
          style={{
            background: "radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%)",
          }}
        />
        {/* Small blurred circle bottom-left */}
        <div
          className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full opacity-15"
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
      <div
        className={`relative flex flex-col items-center transition-all duration-700 ease-out ${
          phase === "visible" ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
        style={{ transitionDelay: "200ms" }}
      >
        {/* Icon with glow */}
        <div className="relative mb-6">
          <div className="absolute inset-0 w-20 h-20 rounded-2xl bg-white/20 blur-xl scale-150" />
          <div className="relative w-20 h-20 rounded-2xl bg-white/15 backdrop-blur-sm border border-white/20 flex items-center justify-center shadow-2xl">
            <svg
              className="w-10 h-10 text-white drop-shadow-lg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
              <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
              <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
            </svg>
          </div>
        </div>

        {/* App name */}
        <h1 className="text-white text-3xl font-bold tracking-[0.2em] mb-2 drop-shadow-lg">
          FINORA
        </h1>
        <p className="text-emerald-200/70 text-sm font-medium tracking-wider">
          Personal Finance Tracker
        </p>
      </div>

      {/* Loading indicator */}
      <div
        className={`absolute bottom-20 flex flex-col items-center transition-all duration-500 ${
          phase === "visible" ? "opacity-100" : "opacity-0"
        }`}
        style={{ transitionDelay: "600ms" }}
      >
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-white/40"
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
