import React from 'react';
import { Link } from 'react-router-dom';
import CollaboLogo from '../landing/CollaboLogo';

export const Logo = ({ size = 'md', to = '/', showText = true, className = '' }) => {
  const pixelSizeMap = {
    sm: 24,
    md: 32,
    lg: 40,
    xl: 48,
  };

  const textClassMap = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-2xl',
    xl: 'text-3xl',
  };

  const pixelSize = typeof size === 'number' ? size : (pixelSizeMap[size] || 32);
  const textClass = typeof size === 'string' ? (textClassMap[size] || 'text-lg') : 'text-lg';

  const content = (
    <div className={`inline-flex items-center gap-2.5 group select-none ${className}`}>
      <CollaboLogo size={pixelSize} variant="isometric" animated={true} />

      {showText && (
        <span className={`font-serif font-black tracking-tight text-[#261615] dark:text-[#FDEBDE] ${textClass} flex items-center`}>
          Collabo
          <span className="text-[#8A5200] dark:text-[#FFEBAA]">.</span>
        </span>
      )}
    </div>
  );

  if (to) {
    return (
      <Link to={to} className="focus:outline-none inline-block">
        {content}
      </Link>
    );
  }

  return content;
};

export default Logo;
