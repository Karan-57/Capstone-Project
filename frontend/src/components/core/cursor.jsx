import React, { useRef, useState, useEffect } from 'react';
import { motion, useSpring, useMotionValue } from 'motion/react';
import { cn } from '../../lib/utils';

export function Cursor({
  children,
  className,
  cursorClassName,
  cursorContent,
}) {
  const containerRef = useRef(null);
  const [isInside, setIsInside] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
    }
  }, []);

  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);

  const springConfig = { damping: 28, stiffness: 350, mass: 0.5 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  const handleMouseMove = (e) => {
    if (isTouchDevice || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  };

  return (
    <div
      ref={containerRef}
      onMouseEnter={() => !isTouchDevice && setIsInside(true)}
      onMouseLeave={() => !isTouchDevice && setIsInside(false)}
      onMouseMove={handleMouseMove}
      className={cn('relative overflow-hidden cursor-default', className)}
    >
      {!isTouchDevice && isInside && (
        <motion.div
          style={{
            x: smoothX,
            y: smoothY,
            pointerEvents: 'none',
          }}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5 }}
          className={cn(
            'absolute -top-4 -left-4 z-30 pointer-events-none select-none transition-opacity duration-150',
            cursorClassName
          )}
        >
          {cursorContent || (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#382322] text-[#FFEBAA] text-[11px] font-mono font-medium shadow-brutal-sm border border-[#FFEBAA] whitespace-nowrap">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FFEBAA] animate-ping" />
              <span>Studio ↗</span>
            </div>
          )}
        </motion.div>
      )}
      {children}
    </div>
  );
}

export default Cursor;
