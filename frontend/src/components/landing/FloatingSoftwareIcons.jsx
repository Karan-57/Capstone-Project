import React from "react";
import { DaVinciIcon, PremiereProIcon, BlueFolder3DIcon } from "./SoftwareIcons";

export default function FloatingSoftwareIcons({ mousePos = { x: 0, y: 0 } }) {
  // Parallax multipliers (background elements move slower, very smooth)
  const bgOffsetX = mousePos.x * 12;
  const bgOffsetY = mousePos.y * 12;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0">
      {/* 1. TOP-LEFT: Blurred Adobe Premiere Pro Icon */}
      <div
        className="absolute top-[8%] left-[8%] md:left-[12%] transition-transform duration-700 ease-out"
        style={{
          transform: `translate3d(${bgOffsetX * 0.8}px, ${bgOffsetY * 0.8}px, 0)`,
        }}
      >
        <div className="animate-float-slow opacity-40 hover:opacity-70 filter blur-[4px] scale-90 md:scale-110">
          <PremiereProIcon size={84} />
        </div>
      </div>

      {/* 2. TOP-RIGHT: Blurred DaVinci Resolve Icon */}
      <div
        className="absolute top-[8%] right-[8%] md:right-[14%] transition-transform duration-700 ease-out"
        style={{
          transform: `translate3d(${-bgOffsetX * 0.8}px, ${bgOffsetY * 0.8}px, 0)`,
        }}
      >
        <div className="animate-float-subtle opacity-40 hover:opacity-70 filter blur-[4px] scale-90 md:scale-110" style={{ animationDelay: "1.2s" }}>
          <DaVinciIcon size={88} />
        </div>
      </div>

      {/* 3. MID-LEFT: Blurred 3D Blue Folder */}
      <div
        className="absolute top-[38%] left-[5%] md:left-[9%] transition-transform duration-700 ease-out"
        style={{
          transform: `translate3d(${bgOffsetX * 1.1}px, ${-bgOffsetY * 1.1}px, 0)`,
        }}
      >
        <div className="animate-float-subtle opacity-35 filter blur-[3.5px] scale-80 md:scale-100" style={{ animationDelay: "2.5s" }}>
          <BlueFolder3DIcon size={96} />
        </div>
      </div>

      {/* 4. MID-RIGHT: Blurred 3D Blue Folder */}
      <div
        className="absolute top-[42%] right-[5%] md:right-[8%] transition-transform duration-700 ease-out"
        style={{
          transform: `translate3d(${-bgOffsetX * 1.1}px, ${-bgOffsetY * 1.1}px, 0)`,
        }}
      >
        <div className="animate-float-slow opacity-35 filter blur-[3.5px] scale-80 md:scale-100" style={{ animationDelay: "0.8s" }}>
          <BlueFolder3DIcon size={96} />
        </div>
      </div>
    </div>
  );
}
