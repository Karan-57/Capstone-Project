import React from "react";
import { DaVinciIcon, PremiereProIcon, BlueFolder3DIcon } from "./SoftwareIcons";

export default function FloatingSoftwareIcons({ mousePos = { x: 0, y: 0 } }) {
  // Parallax multipliers (background elements move smoothly with mouse)
  const bgOffsetX = mousePos.x * 14;
  const bgOffsetY = mousePos.y * 14;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0">
      {/* 1. TOP-LEFT: Adobe Premiere Pro Cutout */}
      <div
        className="absolute top-[8%] left-[6%] md:left-[10%] transition-transform duration-700 ease-out"
        style={{
          transform: `translate3d(${bgOffsetX * 0.75}px, ${bgOffsetY * 0.75}px, 0) rotate(-6deg)`,
        }}
      >
        <div className="relative p-2 rounded-2xl bg-[#FFF9F3]/90 border-2 border-[#382322] shadow-[3px_3px_0_#382322] opacity-75 hover:opacity-100 transition-opacity scale-85 md:scale-95">
          <PremiereProIcon size={64} />
          <div className="mt-1 text-center font-mono text-[8px] font-bold tracking-widest text-[#382322] uppercase">
            PR • EDIT
          </div>
        </div>
      </div>

      {/* 2. TOP-RIGHT: DaVinci Resolve Color Grade Cutout */}
      <div
        className="absolute top-[8%] right-[6%] md:right-[12%] transition-transform duration-700 ease-out"
        style={{
          transform: `translate3d(${-bgOffsetX * 0.75}px, ${bgOffsetY * 0.75}px, 0) rotate(5deg)`,
        }}
      >
        <div className="relative p-2 rounded-2xl bg-[#FFF9F3]/90 border-2 border-[#382322] shadow-[3px_3px_0_#382322] opacity-75 hover:opacity-100 transition-opacity scale-85 md:scale-95">
          <DaVinciIcon size={64} />
          <div className="mt-1 text-center font-mono text-[8px] font-bold tracking-widest text-[#382322] uppercase">
            DV • COLOR
          </div>
        </div>
      </div>

      {/* 3. MID-LEFT: 3D Blue Project Folder */}
      <div
        className="absolute top-[40%] left-[3%] md:left-[6%] transition-transform duration-700 ease-out"
        style={{
          transform: `translate3d(${bgOffsetX * 1.1}px, ${-bgOffsetY * 1.1}px, 0) rotate(-3deg)`,
        }}
      >
        <div className="relative p-2 rounded-2xl bg-[#FFEBAA]/90 border-2 border-[#382322] shadow-[3px_3px_0_#382322] opacity-70 hover:opacity-100 transition-opacity scale-75 md:scale-85">
          <BlueFolder3DIcon size={72} />
          <div className="text-center font-mono text-[8px] font-bold tracking-widest text-[#382322] uppercase mt-0.5">
            BIN • 4K
          </div>
        </div>
      </div>

      {/* 4. MID-RIGHT: 3D Blue Project Folder */}
      <div
        className="absolute top-[44%] right-[3%] md:right-[6%] transition-transform duration-700 ease-out"
        style={{
          transform: `translate3d(${-bgOffsetX * 1.1}px, ${-bgOffsetY * 1.1}px, 0) rotate(4deg)`,
        }}
      >
        <div className="relative p-2 rounded-2xl bg-[#B1C8EA]/90 border-2 border-[#382322] shadow-[3px_3px_0_#382322] opacity-70 hover:opacity-100 transition-opacity scale-75 md:scale-85">
          <BlueFolder3DIcon size={72} />
          <div className="text-center font-mono text-[8px] font-bold tracking-widest text-[#382322] uppercase mt-0.5">
            AUDIO • STEMS
          </div>
        </div>
      </div>
    </div>
  );
}
