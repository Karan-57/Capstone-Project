import React from "react";

export default function CollaboLogo({
  size = 48,
  variant = "isometric", // "isometric" for landing, "hex" for dashboard
  animated = true,
  className = "",
}) {
  if (variant === "hex") {
    // Hexagonal isometric badge from Creator/Editor Dashboard
    return (
      <div
        className={`relative inline-flex items-center justify-center ${className}`}
        style={{ width: size, height: size }}
      >
        <svg
          width={size}
          height={size}
          viewBox="0 0 44 44"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={animated ? "transition-transform duration-300 hover:scale-105" : ""}
        >
          <defs>
            <linearGradient id="hexGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="50%" stopColor="#818cf8" />
              <stop offset="100%" stopColor="#c084fc" />
            </linearGradient>
            <filter id="hexGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="2" floodColor="#818cf8" floodOpacity="0.4" />
            </filter>
          </defs>
          {/* Outer Hexagon */}
          <path
            d="M22 3L38 12.2V30.6L22 39.8L6 30.6V12.2L22 3Z"
            stroke="url(#hexGrad)"
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#hexGlow)"
          />
          {/* Inner 3D Cube / Core */}
          <path
            d="M22 14L30 18.6V27.8L22 32.4L14 27.8V18.6L22 14Z"
            fill="url(#hexGrad)"
            fillOpacity="0.2"
            stroke="url(#hexGrad)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path d="M22 23.2V32.4" stroke="url(#hexGrad)" strokeWidth="1.8" />
          <path d="M22 23.2L30 18.6" stroke="url(#hexGrad)" strokeWidth="1.8" />
          <path d="M22 23.2L14 18.6" stroke="url(#hexGrad)" strokeWidth="1.8" />
        </svg>
      </div>
    );
  }

  // Landing Page 3D Isometric Wireframe Cube
  return (
    <div
      className={`relative inline-flex items-center justify-center select-none ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={animated ? "transition-transform duration-500 hover:scale-110" : ""}
      >
        <defs>
          <linearGradient id="cubeGradLanding" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="45%" stopColor="#818cf8" />
            <stop offset="75%" stopColor="#a855f7" />
            <stop offset="100%" stopColor="#ec4899" />
          </linearGradient>
          <filter id="cubeSoftGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Outer cube silhouette */}
        <path
          d="M32 4L56 18V46L32 60L8 46V18L32 4Z"
          stroke="url(#cubeGradLanding)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#cubeSoftGlow)"
        />

        {/* Central Y axes */}
        <path d="M32 32V60" stroke="url(#cubeGradLanding)" strokeWidth="2.2" strokeLinecap="round" />
        <path d="M32 32L56 18" stroke="url(#cubeGradLanding)" strokeWidth="2.2" strokeLinecap="round" />
        <path d="M32 32L8 18" stroke="url(#cubeGradLanding)" strokeWidth="2.2" strokeLinecap="round" />

        {/* Top face wireframe subdivisions */}
        <path d="M20 11L44 25" stroke="url(#cubeGradLanding)" strokeWidth="1.2" strokeOpacity="0.65" />
        <path d="M44 11L20 25" stroke="url(#cubeGradLanding)" strokeWidth="1.2" strokeOpacity="0.65" />

        {/* Left face wireframe subdivisions */}
        <path d="M8 32L32 46" stroke="url(#cubeGradLanding)" strokeWidth="1.2" strokeOpacity="0.65" />
        <path d="M20 25V53" stroke="url(#cubeGradLanding)" strokeWidth="1.2" strokeOpacity="0.65" />

        {/* Right face wireframe subdivisions */}
        <path d="M56 32L32 46" stroke="url(#cubeGradLanding)" strokeWidth="1.2" strokeOpacity="0.65" />
        <path d="M44 25V53" stroke="url(#cubeGradLanding)" strokeWidth="1.2" strokeOpacity="0.65" />

        {/* Inner subtle core */}
        <circle cx="32" cy="32" r="3" fill="url(#cubeGradLanding)" opacity="0.85" />
      </svg>
    </div>
  );
}
