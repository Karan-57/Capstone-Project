import React, { useId } from "react";

// High-fidelity Authentic DaVinci Resolve Logo Icon
export function DaVinciIcon({ size = 72, className = "" }) {
  const uniqueId = useId();
  const blueGradId = `dvBlueGrad-${uniqueId}`;
  const redGradId = `dvRedGrad-${uniqueId}`;
  const yellowGradId = `dvYellowGrad-${uniqueId}`;

  // Proportional outer rainbow ring border width
  const ringPadding = Math.max(1.8, Math.round(size * 0.04 * 10) / 10);

  return (
    <div
      className={`relative inline-flex items-center justify-center select-none rounded-full ${className}`}
      style={{
        width: size,
        height: size,
        // Official 360-degree chromatic color wheel ring
        background:
          "conic-gradient(from 0deg, #00d2ff 0deg, #0055ff 55deg, #7c00ff 105deg, #e600aa 145deg, #ff1a2a 180deg, #ff6600 215deg, #ffcc00 250deg, #00e640 295deg, #00ffbb 335deg, #00d2ff 360deg)",
        padding: `${ringPadding}px`,
        boxShadow: "0 10px 25px -3px rgba(0,0,0,0.35), 0 4px 10px -2px rgba(0,0,0,0.2)",
      }}
    >
      {/* Inner Dark Charcoal / Matte Black Disc */}
      <div
        className="w-full h-full rounded-full flex items-center justify-center relative overflow-hidden"
        style={{
          background:
            "radial-gradient(circle at 50% 46%, #363942 0%, #252730 65%, #17181f 100%)",
          boxShadow:
            "inset 0 1px 2px rgba(255,255,255,0.18), inset 0 2px 6px rgba(0,0,0,0.6)",
        }}
      >
        {/* Subtle Specular Top Sheen */}
        <div
          className="absolute top-0 left-0 right-0 h-[45%] pointer-events-none"
          style={{
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0) 100%)",
            borderRadius: "50% 50% 0 0",
          }}
        />

        {/* Authentic DaVinci Resolve 3-Petal Vector Pinwheel */}
        <svg
          viewBox="0 0 65 65"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-[82%] h-[82%] drop-shadow-[0_4px_8px_rgba(0,0,0,0.45)]"
        >
          <defs>
            {/* Top Blue Petal Radial Gradient */}
            <radialGradient
              id={blueGradId}
              cx="32.14"
              cy="28.27"
              fx="32.14"
              fy="28.27"
              r="8"
              gradientUnits="userSpaceOnUse"
              gradientTransform="matrix(1.058 0.089 -0.165 1.957 2.79 -28.12)"
            >
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="25%" stopColor="#38bdf8" />
              <stop offset="70%" stopColor="#0284c7" />
              <stop offset="100%" stopColor="#0369a1" />
            </radialGradient>

            {/* Bottom-Right Red Petal Radial Gradient */}
            <radialGradient
              id={redGradId}
              cx="34.08"
              cy="33.65"
              fx="34.08"
              fy="33.65"
              r="8"
              gradientUnits="userSpaceOnUse"
              gradientTransform="matrix(1.903 0.760 -0.406 1.017 -17.11 -25.82)"
            >
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="22%" stopColor="#fb7185" />
              <stop offset="65%" stopColor="#f43f5e" />
              <stop offset="100%" stopColor="#be123c" />
            </radialGradient>

            {/* Bottom-Left Yellow Petal Radial Gradient */}
            <radialGradient
              id={yellowGradId}
              cx="29.66"
              cy="35.66"
              fx="29.66"
              fy="35.66"
              r="8"
              gradientUnits="userSpaceOnUse"
              gradientTransform="matrix(-1.724 1.149 -0.522 -0.783 99.58 27.60)"
            >
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="22%" stopColor="#fef08a" />
              <stop offset="65%" stopColor="#facc15" />
              <stop offset="100%" stopColor="#ca8a04" />
            </radialGradient>
          </defs>

          <g transform="matrix(1.0325 0 0 1.0325 -1.067 0.042)">
            {/* 1. Top Cyan/Blue Petal */}
            <path
              d="m 25.002653,20.382103 c -0.0196,0.514484 0.0718,1.076908 0.223374,1.639464 0.28878,1.070354 0.76738,2.051108 1.331754,2.977508 1.28567,2.106696 2.906202,3.910326 4.664468,5.584894 0.144,0.13766 0.315414,0.253896 0.498968,0.342532 0.18382,0.0956 0.367372,0.0956 0.557324,0.0136 0.18356,-0.08194 0.347788,-0.19858 0.485652,-0.350044 0.610196,-0.63085 1.213344,-1.262652 1.790902,-1.914668 0.813336,-0.9264 1.587896,-1.879432 2.28987,-2.901844 0.63683,-0.926264 1.20721,-1.900738 1.62667,-2.957296 0.419462,-1.050136 0.623384,-2.133326 0.485652,-3.272238 -0.22964,-1.879324 -0.99689,-3.471671 -2.368332,-4.720254 -1.621578,-1.473935 -3.510396,-2.064083 -5.636032,-1.735343 -3.45726,0.53579 -5.963586,3.719255 -5.95027,7.293465 z"
              fill={`url(#${blueGradId})`}
            />

            {/* 2. Bottom-Right Coral/Red Petal */}
            <path
              d="m 42.894854,45.998033 c -0.435154,0.0132 -0.92375,-0.04062 -1.412214,-0.14436 -1.445174,-0.316356 -2.672642,-0.973434 -3.615956,-2.138388 -0.573684,-0.710394 -1.055976,-1.480258 -1.471696,-2.289948 -0.488728,-0.954048 -0.897096,-1.94805 -1.253202,-2.954234 -0.435154,-1.21709 -0.804654,-2.46077 -1.089068,-3.717812 -0.15796,-0.704236 0.0196,-1.145432 0.798484,-1.388038 0.989404,-0.309152 1.98616,-0.585556 3.00222,-0.80969 1.682184,-0.368624 3.377764,-0.605072 5.107218,-0.54678 0.488596,0.0196 0.976142,0.07204 1.458436,0.15758 1.398952,0.243786 2.58637,0.888682 3.55621,1.908228 1.656576,1.737144 2.31548,3.8099 1.90698,6.172554 -0.587076,3.376042 -3.582994,5.77747 -6.987412,5.750878 z"
              fill={`url(#${redGradId})`}
            />

            {/* 3. Bottom-Left Lemon/Yellow Petal */}
            <path
              d="m 21.105156,45.998033 c 0.435154,0.0132 0.92375,-0.04062 1.412216,-0.14436 1.445174,-0.316356 2.67264,-0.973434 3.615954,-2.138388 0.573684,-0.710394 1.055978,-1.480258 1.471698,-2.289948 0.488728,-0.954048 0.897094,-1.94805 1.253202,-2.954234 0.435154,-1.21709 0.804652,-2.46077 1.089066,-3.717812 0.15796,-0.704236 -0.0196,-1.145432 -0.798484,-1.388038 -0.989404,-0.309152 -1.986162,-0.585556 -3.002218,-0.80969 -1.682186,-0.368624 -3.377764,-0.605072 -5.107218,-0.54678 -0.488596,0.0196 -0.976144,0.07204 -1.458436,0.15758 -1.398954,0.243786 -2.586371,0.888682 -3.55621,1.908228 -1.656578,1.737144 -2.315481,3.8099 -1.906982,6.172554 0.587077,3.376042 3.582994,5.77747 6.987412,5.750878 z"
              fill={`url(#${yellowGradId})`}
            />
          </g>
        </svg>
      </div>
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
