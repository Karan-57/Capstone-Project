import React, { useState } from "react";
import { DaVinciIcon, PremiereProIcon, BlueFolder3DIcon } from "./SoftwareIcons";

export default function HeroCardsShowcase({ mousePos = { x: 0, y: 0 } }) {
  // Controlled hover state to dynamically elevate z-index and 3D depth
  const [hoveredCard, setHoveredCard] = useState(null);

  // Parallax tilt calculation (subtle, editorial, capped for stability)
  const tiltX = Math.max(-5, Math.min(5, mousePos.y * 5));
  const tiltY = Math.max(-6, Math.min(6, -mousePos.x * 6));

  return (
    <div className="relative w-full max-w-5xl mx-auto flex items-end justify-center pt-8 pb-14 perspective-1000 select-none pointer-events-auto">
      {/* 3D Perspective Container: smooth subtle tilt without lagging transitions */}
      <div
        className="flex items-end justify-center -space-x-6 sm:-space-x-8 md:-space-x-12 transition-transform duration-200 ease-out will-change-transform"
        style={{
          transform: `rotateX(${tiltX}deg) rotateY(${tiltY}deg)`,
          transformStyle: "preserve-3d",
        }}
      >
        {/* ─── CARD 1: Video Timeline / DAW UI (Leftmost, base z-10) ─── */}
        <div
          onMouseEnter={() => setHoveredCard(0)}
          onMouseLeave={() => setHoveredCard(null)}
          className={`relative flex-shrink-0 transition-[z-index,transform] duration-200 ease-out hover:z-50 ${
            hoveredCard === 0 ? "z-50" : "z-10"
          }`}
          style={{
            transform: `rotate(-8deg) translateY(6px) translateZ(${hoveredCard === 0 ? 35 : 0}px)`,
            transformOrigin: "bottom center",
            zIndex: hoveredCard === 0 ? 50 : 10,
          }}
        >
          {/* Analog Washi Tape */}
          <div className="absolute -top-2 left-6 w-12 h-3.5 bg-[#FFEBAA] border border-[#382322]/40 rotate-[-4deg] z-20 pointer-events-none shadow-xs" />

          <div
            className={`w-44 sm:w-52 md:w-60 h-64 sm:h-72 md:h-80 rounded-2xl bg-[#171212] border-2 border-[#382322] overflow-hidden transition-all duration-200 cursor-pointer ${
              hoveredCard === 0
                ? "-translate-y-4 shadow-[8px_8px_0_#382322] scale-[1.03]"
                : "shadow-[4px_4px_0_#382322]"
            }`}
          >
            {/* Header Bar */}
            <div className="flex items-center justify-between px-3.5 py-2.5 bg-[#231A19] border-b-2 border-[#382322] pointer-events-none">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-500" />
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
              </div>
              <span className="text-[10px] font-mono text-[#FDEBDE]/80">00:03:42:18</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#FFEBAA] text-[#382322] font-bold">4K 60</span>
            </div>

            {/* Timeline tracks preview */}
            <div className="p-3 space-y-2 pointer-events-none">
              {/* Track 1 (Purple video clip) */}
              <div className="h-10 rounded-lg bg-[#2E1E38] border border-purple-400/40 p-1.5 relative overflow-hidden flex items-center">
                <div className="w-3/4 h-full rounded bg-purple-600/80 flex items-center px-2">
                  <span className="text-[9px] text-purple-100 font-semibold truncate">Cinematic_B-Roll_01.mov</span>
                </div>
                <div className="absolute inset-x-0 bottom-1 flex items-center justify-around opacity-40">
                  {[...Array(14)].map((_, i) => (
                    <div key={i} className="w-[1.5px] bg-purple-200" style={{ height: `${(i % 5) * 4 + 4}px` }} />
                  ))}
                </div>
              </div>

              {/* Track 2 (Orange/Amber B-roll) */}
              <div className="h-9 rounded-lg bg-[#3A2214] border border-amber-400/40 p-1.5 relative overflow-hidden flex items-center">
                <div className="w-1/2 ml-8 h-full rounded bg-amber-600/80 flex items-center px-2">
                  <span className="text-[9px] text-amber-100 font-semibold truncate">SoundFX_Transition</span>
                </div>
              </div>

              {/* Track 3 (Green Master Audio) */}
              <div className="h-11 rounded-lg bg-[#142A1E] border border-emerald-400/40 p-1.5 relative overflow-hidden flex items-center">
                <div className="w-full h-full rounded bg-emerald-600/70 flex items-center justify-between px-2">
                  <span className="text-[9px] text-emerald-100 font-medium">Master_Dialog_Stereo.wav</span>
                  <span className="text-[8px] font-mono text-emerald-300 font-bold">-6.2 dB</span>
                </div>
                {/* Waveform visual */}
                <div className="absolute inset-x-0 bottom-1 flex items-center justify-around opacity-80">
                  {[...Array(24)].map((_, i) => (
                    <div key={i} className="w-[2px] bg-emerald-300 rounded-full" style={{ height: `${(Math.sin(i) * 0.5 + 0.5) * 16 + 3}px` }} />
                  ))}
                </div>
              </div>

              {/* Track 4 (Blue Ambient Layer) */}
              <div className="h-8 rounded-lg bg-[#15253A] border border-sky-400/30 p-1 flex items-center">
                <div className="w-4/5 h-full rounded bg-sky-600/50 flex items-center px-2">
                  <span className="text-[8px] text-sky-200">Atmosphere_Lofi.mp3</span>
                </div>
              </div>
            </div>

            {/* Red Playhead line */}
            <div className="absolute top-8 bottom-0 left-1/2 w-[2px] bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)] pointer-events-none">
              <div className="w-2.5 h-2.5 -ml-[4.5px] -mt-1 bg-rose-500 rotate-45" />
            </div>
          </div>
        </div>

        {/* ─── CARD 2: 3D Blue Project Folder (Base z-20) ─── */}
        <div
          onMouseEnter={() => setHoveredCard(1)}
          onMouseLeave={() => setHoveredCard(null)}
          className={`relative flex-shrink-0 transition-[z-index,transform] duration-200 ease-out hover:z-50 ${
            hoveredCard === 1 ? "z-50" : "z-20"
          }`}
          style={{
            transform: `rotate(-4deg) translateY(14px) translateZ(${hoveredCard === 1 ? 35 : 0}px)`,
            transformOrigin: "bottom center",
            zIndex: hoveredCard === 1 ? 50 : 20,
          }}
        >
          {/* Editorial Stamp */}
          <div className="absolute -top-2.5 right-6 px-2 py-0.5 bg-[#FFEBAA] border border-[#382322] rounded-xs font-mono text-[8px] font-bold text-[#382322] uppercase tracking-wider rotate-[3deg] z-20 shadow-xs pointer-events-none">
            RAW FOOTAGE
          </div>

          <div
            className={`w-44 sm:w-52 md:w-60 h-64 sm:h-72 md:h-80 rounded-2xl bg-[#FFF9F3] border-2 border-[#382322] flex flex-col items-center justify-center p-4 transition-all duration-200 cursor-pointer ${
              hoveredCard === 1
                ? "-translate-y-4 shadow-[8px_8px_0_#382322] scale-[1.03]"
                : "shadow-[4px_4px_0_#382322]"
            }`}
          >
            <div
              className={`transition-transform duration-300 pointer-events-none ${
                hoveredCard === 1 ? "scale-110" : ""
              }`}
            >
              <BlueFolder3DIcon size={130} />
            </div>
            <span className="mt-3 text-xs font-bold text-[#382322] tracking-tight pointer-events-none">
              Project Assets
            </span>
            <span className="text-[10px] font-medium text-[#382322]/70 pointer-events-none">
              142 items • 8.4 GB
            </span>
          </div>
        </div>

        {/* ─── CARD 3: Video Editing / Equalizer Timeline (Center Hero Card, base z-30) ─── */}
        <div
          onMouseEnter={() => setHoveredCard(2)}
          onMouseLeave={() => setHoveredCard(null)}
          className={`relative flex-shrink-0 transition-[z-index,transform] duration-200 ease-out hover:z-50 ${
            hoveredCard === 2 ? "z-50" : "z-30"
          }`}
          style={{
            transform: `rotate(0deg) translateY(-8px) translateZ(${hoveredCard === 2 ? 35 : 0}px)`,
            transformOrigin: "bottom center",
            zIndex: hoveredCard === 2 ? 50 : 30,
          }}
        >
          {/* Centered Editorial Tape */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-16 h-4 bg-[#FFEBAA] border border-[#382322]/40 rotate-[-1deg] z-20 pointer-events-none shadow-xs" />

          <div
            className={`w-48 sm:w-56 md:w-64 h-68 sm:h-76 md:h-84 rounded-2xl bg-[#140D0C] border-2 border-[#382322] overflow-hidden transition-all duration-200 cursor-pointer ${
              hoveredCard === 2
                ? "-translate-y-4 shadow-[9px_9px_0_#382322] scale-[1.03]"
                : "shadow-[5px_5px_0_#382322]"
            }`}
          >
            {/* Workstation Header */}
            <div className="flex items-center justify-between px-4 py-2.5 bg-[#231615] border-b-2 border-[#382322] pointer-events-none">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#FFEBAA] animate-pulse border border-[#382322]" />
                <span className="text-[11px] font-bold text-[#FDEBDE]">Editor Workspace</span>
              </div>
              <span className="text-[9.5px] text-[#FFEBAA] font-mono font-bold">Render: 100%</span>
            </div>

            {/* Equalizer Waveform & Curves Display */}
            <div className="p-3 pointer-events-none">
              <div className="h-24 rounded-xl bg-[#0B0605] border border-[#382322] p-2 relative overflow-hidden flex flex-col justify-between">
                {/* Audio spectrum curve */}
                <svg className="w-full h-full" viewBox="0 0 200 80" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="curveGlowBrutal" x1="0%" y1="0%" x2="1" y2="0">
                      <stop offset="0%" stopColor="#B1C8EA" />
                      <stop offset="50%" stopColor="#FFEBAA" />
                      <stop offset="100%" stopColor="#34D399" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M0 60 Q 30 10, 60 40 T 120 20 T 170 45 T 200 30"
                    fill="none"
                    stroke="url(#curveGlowBrutal)"
                    strokeWidth="3"
                    className="filter drop-shadow-[0_0_6px_rgba(255,235,170,0.6)]"
                  />
                  <circle cx="60" cy="40" r="4" fill="#FFEBAA" stroke="#382322" strokeWidth="1" />
                  <circle cx="120" cy="20" r="4" fill="#B1C8EA" stroke="#382322" strokeWidth="1" />
                  <circle cx="170" cy="45" r="4" fill="#34D399" stroke="#382322" strokeWidth="1" />
                </svg>
                <div className="flex justify-between text-[8px] text-[#FDEBDE]/60 font-mono font-bold">
                  <span>32 Hz</span>
                  <span>1 kHz</span>
                  <span>16 kHz</span>
                </div>
              </div>

              {/* Editing Multi-Tracks */}
              <div className="mt-2.5 space-y-1.5">
                <div className="h-6 rounded bg-[#271615] border border-[#FFEBAA]/30 px-2 flex items-center justify-between">
                  <span className="text-[8.5px] text-[#FFEBAA] font-semibold">Video 1 [Main Cut]</span>
                  <span className="text-[7.5px] text-[#FDEBDE]/70 font-mono">4K Prores</span>
                </div>
                <div className="h-6 rounded bg-[#1A2638] border border-[#B1C8EA]/30 px-2 flex items-center justify-between">
                  <span className="text-[8.5px] text-[#B1C8EA] font-semibold">Color Grade LUT [Film 04]</span>
                  <span className="text-[7.5px] text-emerald-300 font-bold">Active</span>
                </div>
                <div className="h-6 rounded bg-[#162B1D] border border-emerald-400/30 px-2 flex items-center justify-between">
                  <span className="text-[8.5px] text-emerald-200 font-semibold">Sound Design & Mix</span>
                  <span className="text-[7.5px] text-[#FDEBDE]/70 font-mono">24-bit</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ─── CARD 4: Glossy 3D DaVinci Resolve Card (Base z-20) ─── */}
        <div
          onMouseEnter={() => setHoveredCard(3)}
          onMouseLeave={() => setHoveredCard(null)}
          className={`relative flex-shrink-0 transition-[z-index,transform] duration-200 ease-out hover:z-50 ${
            hoveredCard === 3 ? "z-50" : "z-20"
          }`}
          style={{
            transform: `rotate(4deg) translateY(12px) translateZ(${hoveredCard === 3 ? 35 : 0}px)`,
            transformOrigin: "bottom center",
            zIndex: hoveredCard === 3 ? 50 : 20,
          }}
        >
          {/* DaVinci Corner Stamp */}
          <div className="absolute -top-2 left-6 px-2 py-0.5 bg-[#B1C8EA] border border-[#382322] rounded-xs font-mono text-[8px] font-bold text-[#382322] uppercase tracking-wider rotate-[-2deg] z-20 shadow-xs pointer-events-none">
            COLOR LAB
          </div>

          <div
            className={`w-44 sm:w-52 md:w-60 h-64 sm:h-72 md:h-80 rounded-2xl bg-[#FFF9F3] border-2 border-[#382322] flex flex-col items-center justify-center p-4 transition-all duration-200 cursor-pointer ${
              hoveredCard === 3
                ? "-translate-y-4 shadow-[8px_8px_0_#382322] scale-[1.03]"
                : "shadow-[4px_4px_0_#382322]"
            }`}
          >
            <div
              className={`transition-transform duration-300 pointer-events-none ${
                hoveredCard === 3 ? "scale-110" : ""
              }`}
            >
              <DaVinciIcon size={120} />
            </div>
            <span className="mt-4 text-xs font-bold text-[#382322] tracking-tight pointer-events-none">
              DaVinci Resolve
            </span>
            <span className="text-[10px] font-medium text-[#382322]/70 pointer-events-none">
              Color Grading Suite
            </span>
          </div>
        </div>

        {/* ─── CARD 5: Glossy 3D Premiere Pro Card (Rightmost, base z-10) ─── */}
        <div
          onMouseEnter={() => setHoveredCard(4)}
          onMouseLeave={() => setHoveredCard(null)}
          className={`relative flex-shrink-0 transition-[z-index,transform] duration-200 ease-out hover:z-50 ${
            hoveredCard === 4 ? "z-50" : "z-10"
          }`}
          style={{
            transform: `rotate(9deg) translateY(6px) translateZ(${hoveredCard === 4 ? 35 : 0}px)`,
            transformOrigin: "bottom center",
            zIndex: hoveredCard === 4 ? 50 : 10,
          }}
        >
          {/* Analog Washi Tape */}
          <div className="absolute -top-2 right-6 w-12 h-3.5 bg-[#FFEBAA] border border-[#382322]/40 rotate-[3deg] z-20 pointer-events-none shadow-xs" />

          <div
            className={`w-44 sm:w-52 md:w-60 h-64 sm:h-72 md:h-80 rounded-2xl bg-[#1C121F] border-2 border-[#382322] flex flex-col items-center justify-center p-4 transition-all duration-200 cursor-pointer ${
              hoveredCard === 4
                ? "-translate-y-4 shadow-[8px_8px_0_#382322] scale-[1.03]"
                : "shadow-[4px_4px_0_#382322]"
            }`}
          >
            <div
              className={`transition-transform duration-300 pointer-events-none ${
                hoveredCard === 4 ? "scale-110" : ""
              }`}
            >
              <PremiereProIcon size={120} />
            </div>
            <span className="mt-4 text-xs font-bold text-[#FDEBDE] tracking-tight pointer-events-none">
              Premiere Pro
            </span>
            <span className="text-[10px] font-medium text-purple-300/80 pointer-events-none">
              Non-linear Video Suite
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
