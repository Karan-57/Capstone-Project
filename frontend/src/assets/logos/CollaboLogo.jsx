import React from 'react';
import LandingCollaboLogo from '../../components/landing/CollaboLogo';

export const CollaboLogo = ({
  className = "w-8 h-8",
  textClassName = "text-xl font-display font-black text-[#261615] dark:text-[#FDEBDE] tracking-tight",
  hideText = false,
  size = 32,
  variant = "isometric",
}) => {
  return (
    <div className="flex items-center gap-2.5 select-none">
      <div className="shrink-0 flex items-center justify-center">
        <LandingCollaboLogo size={size} variant={variant} animated={true} />
      </div>
      {!hideText && (
        <div className={textClassName}>
          Collabo<span className="text-[#8A5200] dark:text-[#FFEBAA]">.</span>
        </div>
      )}
    </div>
  );
};

export default CollaboLogo;
