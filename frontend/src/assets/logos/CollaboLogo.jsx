import React from 'react';

export const CollaboLogo = ({ className = "w-8 h-8", textClassName = "text-xl font-bold text-white tracking-tight" }) => {
  return (
    <div className="flex items-center gap-2.5 select-none">
      <div className={`relative flex items-center justify-center rounded-xl bg-gradient-to-tr from-purple-700 via-indigo-600 to-purple-500 shadow-md shadow-purple-900/30 p-1.5 ${className}`}>
        {/* Hexagon shape with inner circle design */}
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full text-white">
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
      <div className={textClassName}>
        Collabo<span className="text-purple-500">.</span>
      </div>
    </div>
  );
};

export default CollaboLogo;
