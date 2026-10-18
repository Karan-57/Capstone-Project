import React from 'react';

export const CollaboLogo = ({ className = "w-8 h-8", textClassName = "text-xl font-bold text-[#3C2415] tracking-tight font-sans", hideText = false }) => {
  return (
    <div className="flex items-center gap-2.5 select-none">
      <div className={`relative flex items-center justify-center rounded-xl bg-[#3C2415] text-[#F7F5F0] shadow-sm p-1.5 shrink-0 ${className}`}>
        {/* Hexagon shape with inner circle design */}
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full text-[#F7F5F0]">
          <path
            d="M12 2L20.66 7V17L12 22L3.34 17V7L12 2Z"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="12" cy="12" r="3" fill="currentColor" />
        </svg>
      </div>
      {!hideText && (
        <div className={textClassName}>
          Collabo<span className="text-[#6E7464]">.</span>
        </div>
      )}
    </div>
  );
};

export default CollaboLogo;
