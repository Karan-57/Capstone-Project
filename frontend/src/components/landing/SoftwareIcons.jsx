import React from "react";

// High-fidelity 3D DaVinci Resolve Icon
export function DaVinciIcon({ size = 72, className = "" }) {
  return (
    <div
      className={`relative inline-block select-none ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-[0_12px_24px_rgba(0,0,0,0.25)]"
      >
        <defs>
          <linearGradient id="dvBaseGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2c303c" />
            <stop offset="50%" stopColor="#1a1c24" />
            <stop offset="100%" stopColor="#101218" />
          </linearGradient>
          <linearGradient id="dvBorderGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4f596f" />
            <stop offset="100%" stopColor="#1a1e28" />
          </linearGradient>
          <linearGradient id="dvRedGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ff4d4d" />
            <stop offset="100%" stopColor="#d91b24" />
          </linearGradient>
          <linearGradient id="dvBlueGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00d2ff" />
            <stop offset="100%" stopColor="#0066ff" />
          </linearGradient>
          <linearGradient id="dvYellowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fff033" />
            <stop offset="100%" stopColor="#ff9900" />
          </linearGradient>
        </defs>

        {/* Squircle base */}
        <rect
          x="4"
          y="4"
          width="92"
          height="92"
          rx="24"
          fill="url(#dvBaseGrad)"
          stroke="url(#dvBorderGrad)"
          strokeWidth="3"
        />

        {/* Inner top highlight reflection */}
        <path
          d="M26 8C14 8 8 16 8 26C15 20 30 18 50 18C70 18 85 20 92 26C92 16 86 8 74 8H26Z"
          fill="white"
          fillOpacity="0.08"
        />

        {/* DaVinci Pinwheel Petals */}
        {/* Top / Cyan-Blue Petal */}
        <ellipse
          cx="50"
          cy="34"
          rx="12"
          ry="15"
          fill="url(#dvBlueGrad)"
          className="drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]"
        />
        {/* Bottom Left / Yellow-Orange Petal */}
        <ellipse
          cx="37"
          cy="62"
          rx="13"
          ry="15"
          transform="rotate(-25 37 62)"
          fill="url(#dvYellowGrad)"
          className="drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]"
        />
        {/* Bottom Right / Red-Pink Petal */}
        <ellipse
          cx="63"
          cy="62"
          rx="13"
          ry="15"
          transform="rotate(25 63 62)"
          fill="url(#dvRedGrad)"
          className="drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]"
        />
        {/* Center blending pin */}
        <circle cx="50" cy="50" r="5" fill="#181a22" opacity="0.6" />
      </svg>
    </div>
  );
}

// High-fidelity 3D Adobe Premiere Pro "Pr" Icon
export function PremiereProIcon({ size = 72, className = "" }) {
  return (
    <div
      className={`relative inline-block select-none ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-[0_12px_24px_rgba(0,0,0,0.25)]"
      >
        <defs>
          <linearGradient id="prBaseGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1b0a2a" />
            <stop offset="50%" stopColor="#11051c" />
            <stop offset="100%" stopColor="#08020e" />
          </linearGradient>
          <linearGradient id="prBorderGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#c084fc" />
            <stop offset="60%" stopColor="#7c3aed" />
            <stop offset="100%" stopColor="#2e1065" />
          </linearGradient>
          <linearGradient id="prTextGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#e9d5ff" />
            <stop offset="100%" stopColor="#c084fc" />
          </linearGradient>
        </defs>

        {/* Squircle base */}
        <rect
          x="4"
          y="4"
          width="92"
          height="92"
          rx="24"
          fill="url(#prBaseGrad)"
          stroke="url(#prBorderGrad)"
          strokeWidth="3.5"
        />

        {/* Inner subtle glow */}
        <rect
          x="8"
          y="8"
          width="84"
          height="84"
          rx="20"
          stroke="#9333ea"
          strokeWidth="1"
          strokeOpacity="0.3"
        />

        {/* "Pr" Typography */}
        <text
          x="50"
          y="68"
          fontSize="48"
          fontFamily="system-ui, -apple-system, sans-serif"
          fontWeight="800"
          fill="url(#prTextGrad)"
          textAnchor="middle"
          letterSpacing="-1.5"
          className="drop-shadow-[0_2px_8px_rgba(192,132,252,0.4)]"
        >
          Pr
        </text>
      </svg>
    </div>
  );
}

// High-fidelity 3D Blue Project Folder Icon
export function BlueFolder3DIcon({ size = 80, className = "" }) {
  return (
    <div
      className={`relative inline-block select-none ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 90"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-[0_14px_28px_rgba(37,99,235,0.3)]"
      >
        <defs>
          <linearGradient id="folderBackGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1e40af" />
            <stop offset="100%" stopColor="#1e3a8a" />
          </linearGradient>
          <linearGradient id="folderFrontGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="50%" stopColor="#2563eb" />
            <stop offset="100%" stopColor="#1d4ed8" />
          </linearGradient>
          <linearGradient id="docGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#e2e8f0" />
          </linearGradient>
        </defs>

        {/* Back Tab and Folder Body */}
        <path
          d="M8 22C8 17.5817 11.5817 14 16 14H36C39.5 14 42.5 17 45.5 20L48 23H84C88.4183 23 92 26.5817 92 31V72C92 76.4183 88.4183 80 84 80H16C11.5817 80 8 76.4183 8 72V22Z"
          fill="url(#folderBackGrad)"
        />

        {/* White documents peeking out */}
        <rect
          x="18"
          y="18"
          width="60"
          height="45"
          rx="5"
          transform="rotate(-4 18 18)"
          fill="url(#docGrad)"
          className="drop-shadow-sm opacity-90"
        />
        <rect
          x="24"
          y="16"
          width="56"
          height="45"
          rx="5"
          transform="rotate(2 24 16)"
          fill="url(#docGrad)"
          className="drop-shadow-md"
        />
        {/* Document lines */}
        <line x1="30" y1="26" x2="60" y2="26" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="30" y1="33" x2="52" y2="33" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" />

        {/* Front Folder Pocket (tilted forward 3D flap) */}
        <path
          d="M6 38C6 34.6863 8.68629 32 12 32H88C91.3137 32 94 34.6863 94 38L90 75C90 78.866 86.866 82 83 82H17C13.134 82 10 78.866 10 75L6 38Z"
          fill="url(#folderFrontGrad)"
          stroke="#60a5fa"
          strokeWidth="1.5"
        />

        {/* Front Highlight Rim */}
        <path
          d="M12 34H88"
          stroke="white"
          strokeWidth="2"
          strokeOpacity="0.45"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}
