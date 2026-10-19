import React from 'react';
import { cn } from '../../lib/utils';

export function ProgressiveBlur({
  direction = 'bottom',
  blurAmount = 8,
  className,
  children,
}) {
  const gradientStops = [
    'rgba(0, 0, 0, 0) 0%',
    'rgba(0, 0, 0, 0.2) 25%',
    'rgba(0, 0, 0, 0.6) 60%',
    'rgba(0, 0, 0, 1) 100%',
  ];

  const maskDirection = direction === 'bottom' ? 'to bottom' : 'to top';
  const maskStyle = `linear-gradient(${maskDirection}, ${gradientStops.join(', ')})`;

  return (
    <div className={cn('relative overflow-hidden', className)}>
      {children}
      <div
        className="pointer-events-none absolute inset-0 z-10"
        style={{
          backdropFilter: `blur(${blurAmount}px)`,
          WebkitBackdropFilter: `blur(${blurAmount}px)`,
          maskImage: maskStyle,
          WebkitMaskImage: maskStyle,
        }}
      />
    </div>
  );
}

export default ProgressiveBlur;
