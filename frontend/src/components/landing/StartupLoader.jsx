import React, { useEffect, useState } from "react";
import CollaboLogo from "./CollaboLogo";

export default function StartupLoader({ onComplete }) {
  const [progress, setProgress] = useState(0);
  const [fadeExit, setFadeExit] = useState(false);

  useEffect(() => {
    const startTime = Date.now();
    const duration = 1800; // ~1.8 seconds for brisk, Apple-like feel

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, Math.round((elapsed / duration) * 100));
      setProgress(pct);

      if (pct >= 100) {
        clearInterval(interval);
        setFadeExit(true);
        setTimeout(() => {
          onComplete?.();
        }, 450);
      }
    }, 25);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 z-[10000] flex flex-col items-center justify-center bg-[#fafbfc] transition-all duration-500 ease-out ${
        fadeExit ? "opacity-0 pointer-events-none scale-105" : "opacity-100"
      }`}
    >
      {/* Soft radiant background aura */}
      <div className="absolute w-[360px] h-[360px] rounded-full bg-gradient-to-tr from-cyan-400/15 via-purple-500/20 to-pink-500/15 blur-3xl animate-pulse" />

      <div className="relative z-10 flex flex-col items-center">
        {/* Animated Collabo Logo */}
        <div className="relative mb-6">
          <div className="absolute inset-0 blur-xl bg-purple-500/30 scale-125 animate-pulse" />
          <CollaboLogo size={72} variant="isometric" animated={true} />
        </div>

        {/* Brand Name */}
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 mb-2 font-display">
          Collabo<span className="text-purple-600">.</span>
        </h1>
        <p className="text-xs font-medium tracking-wide uppercase text-slate-500 mb-8">
          Where <span className="text-sky-500 font-semibold">ideas</span> meet{" "}
          <span className="text-purple-600 font-semibold">editors</span>
        </p>

        {/* Minimal Apple-style progress line */}
        <div className="w-48 h-[3px] bg-slate-200/80 rounded-full overflow-hidden relative shadow-inner">
          <div
            className="h-full bg-gradient-to-r from-sky-400 via-purple-500 to-pink-500 rounded-full transition-all duration-75 ease-out shadow-[0_0_10px_rgba(168,85,247,0.7)]"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Skip button if user clicks */}
        <button
          onClick={() => {
            setFadeExit(true);
            setTimeout(() => onComplete?.(), 200);
          }}
          className="mt-8 text-[11px] text-slate-400 hover:text-slate-600 tracking-wider uppercase transition-colors"
        >
          Skip Intro
        </button>
      </div>
    </div>
  );
}
