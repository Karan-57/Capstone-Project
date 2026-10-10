import React from 'react';
import { Link } from 'react-router-dom';

export const Logo = ({ size = 'md', to = '/', showText = true, className = '' }) => {
  const sizeMap = {
    sm: { icon: 'w-6 h-6', text: 'text-sm' },
    md: { icon: 'w-8 h-8', text: 'text-lg' },
    lg: { icon: 'w-10 h-10', text: 'text-2xl' },
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  const content = (
    <div className={`inline-flex items-center gap-2.5 group select-none ${className}`}>
      {/* Precision Scalable Vector SVG Brand Mark */}
      <svg
        className={`${currentSize.icon} shrink-0 transition-transform duration-300 group-hover:scale-105`}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Collabo Logo"
      >
        <defs>
          <linearGradient id="collaboGrad" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#9333EA" />
            <stop offset="50%" stopColor="#6366F1" />
            <stop offset="100%" stopColor="#3B82F6" />
          </linearGradient>
          <filter id="collaboGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#9333EA" floodOpacity="0.45" />
          </filter>
        </defs>

        {/* Outer Rounded Container */}
        <rect width="40" height="40" rx="12" fill="#0E1322" stroke="rgba(255,255,255,0.1)" strokeWidth="1.2" />

        {/* Stylized Interlocking C / Play Ribbon in SVG */}
        <path
          d="M12 20C12 15.5817 15.5817 12 20 12H24C26.2091 12 28 13.7909 28 16C28 18.2091 26.2091 20 24 20H18C15.7909 20 14 21.7909 14 24C14 26.2091 15.7909 28 18 28H28"
          stroke="url(#collaboGrad)"
          strokeWidth="3.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#collaboGlow)"
        />

        {/* Dynamic Focus Playhead Dot */}
        <circle cx="28" cy="28" r="2.5" fill="#A855F7" />
      </svg>

      {showText && (
        <span className={`font-black tracking-tight text-white ${currentSize.text} flex items-center`}>
          Collabo
          <span className="text-purple-400">.</span>
        </span>
      )}
    </div>
  );

  if (to) {
    return (
      <Link to={to} className="inline-flex items-center outline-none">
        {content}
      </Link>
    );
  }

  return content;
};

export default Logo;
