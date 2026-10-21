import React, { useEffect, useState } from "react";
import CollaboLogo from "./CollaboLogo";

export default function StartupLoader({ onComplete }) {
  const [progress, setProgress] = useState(0);
  const [fadeExit, setFadeExit] = useState(false);

  useEffect(() => {
    const startTime = Date.now();
    const duration = 1600; // ~1.6 seconds for brisk, tactile feel

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, Math.round((elapsed / duration) * 100));
      setProgress(pct);

      if (pct >= 100) {
        clearInterval(interval);
        setFadeExit(true);
        setTimeout(() => {
          onComplete?.();
        }, 350);
      }
    }, 25);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 z-[10000] flex flex-col items-center justify-center bg-[#FDEBDE] transition-all duration-400 ease-out select-none ${
        fadeExit ? "opacity-0 pointer-events-none scale-102" : "opacity-100"
      }`}
    >
      {/* Subtle warm paper glow */}
      <div className="absolute w-[400px] h-[400px] rounded-full bg-[#FFEBAA]/40 blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center p-8 rounded-3xl bg-[#FFF9F3] border-2 border-[#382322] shadow-[6px_6px_0_#382322] max-w-sm w-full mx-4">
        {/* Animated Collabo Logo */}
        <div className="relative mb-5">
          <CollaboLogo size={68} variant="isometric" animated={true} />
        </div>

        {/* Brand Name */}
        <h1 className="text-3xl font-extrabold tracking-tight text-[#382322] mb-1 font-display">
          Collabo<span className="text-[#382322]">.</span>
        </h1>
        <p className="text-[12px] font-medium tracking-wide text-[#382322]/80 mb-6 font-display italic">
          Where <span className="font-bold underline decoration-[#B1C8EA] decoration-2">ideas</span> meet{" "}
          <span className="font-bold underline decoration-[#FFEBAA] decoration-2">editors</span>
        </p>

        {/* Minimal Editorial Progress Meter */}
        <div className="w-52 h-3.5 bg-[#FDEBDE] rounded-full border-2 border-[#382322] overflow-hidden p-0.5 relative shadow-inner">
          <div
            className="h-full bg-[#FFEBAA] border-r-2 border-[#382322] rounded-full transition-all duration-75 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex items-center justify-between w-52 mt-2 font-mono text-[10px] text-[#382322]/70 font-semibold uppercase">
          <span>Booting Studio</span>
          <span>{progress}%</span>
        </div>

        {/* Skip button if user clicks */}
        <button
          onClick={() => {
            setFadeExit(true);
            setTimeout(() => onComplete?.(), 150);
          }}
          className="mt-6 text-[11px] font-bold text-[#382322]/60 hover:text-[#382322] tracking-wider uppercase transition-colors cursor-pointer"
        >
          Skip Intro →
        </button>
      </div>
    </div>
  );
}
