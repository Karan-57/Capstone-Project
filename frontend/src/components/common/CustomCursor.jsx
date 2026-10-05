import React, { useEffect, useState } from 'react';

export const CustomCursor = () => {
  const [position, setPosition] = useState({ x: -100, y: -100 });
  const [trailerPos, setTrailerPos] = useState({ x: -100, y: -100 });
  const [hoverState, setHoverState] = useState('default'); // 'default' | 'button' | 'card' | 'input' | 'action'
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Only enable on fine pointer (desktop / mouse)
    const isTouch = window.matchMedia('(pointer: coarse)').matches;
    if (isTouch) return;

    let mouseX = -100;
    let mouseY = -100;
    let trailX = -100;
    let trailY = -100;
    let animId;

    const handleMouseMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      setPosition({ x: mouseX, y: mouseY });
      if (!visible) setVisible(true);

      // Detect element underneath
      const target = e.target;
      if (!target) return;

      const buttonEl = target.closest('button, a, [role="button"]');
      const cardEl = target.closest('.glass-card, .glass-panel, .glass-panel-interactive');
      const inputEl = target.closest('input, textarea, select');
      const actionEl = target.closest('.cta-primary, [data-cursor="action"]');

      if (actionEl) {
        setHoverState('action');
      } else if (buttonEl) {
        setHoverState('button');
      } else if (inputEl) {
        setHoverState('input');
      } else if (cardEl) {
        setHoverState('card');
      } else {
        setHoverState('default');
      }
    };

    const handleMouseLeave = () => {
      setVisible(false);
    };

    // Smooth spring trailer loop
    const renderLoop = () => {
      trailX += (mouseX - trailX) * 0.18;
      trailY += (mouseY - trailY) * 0.18;
      setTrailerPos({ x: trailX, y: trailY });
      animId = requestAnimationFrame(renderLoop);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);
    animId = requestAnimationFrame(renderLoop);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animId);
    };
  }, [visible]);

  if (!visible) return null;

  const isButton = hoverState === 'button';
  const isAction = hoverState === 'action';
  const isCard = hoverState === 'card';
  const isInput = hoverState === 'input';

  return (
    <div className="pointer-events-none fixed inset-0 z-[99999] overflow-hidden transition-opacity duration-300">
      {/* Ambient Spotlight following cursor on cards */}
      <div
        className="absolute rounded-full pointer-events-none transition-transform duration-75 ease-out"
        style={{
          width: isCard ? 380 : 180,
          height: isCard ? 380 : 180,
          left: position.x - (isCard ? 190 : 90),
          top: position.y - (isCard ? 190 : 90),
          background: isAction
            ? 'radial-gradient(circle, rgba(147, 51, 234, 0.22) 0%, rgba(99, 102, 241, 0.08) 40%, transparent 70%)'
            : isCard
            ? 'radial-gradient(circle, rgba(124, 58, 237, 0.14) 0%, rgba(99, 102, 241, 0.05) 50%, transparent 70%)'
            : 'radial-gradient(circle, rgba(124, 58, 237, 0.10) 0%, transparent 60%)',
          filter: 'blur(30px)',
        }}
      />

      {/* Outer Glass Ring / Capsule Trailer */}
      <div
        className={`absolute rounded-full backdrop-blur-[2px] transition-all duration-200 ease-out border ${
          isAction
            ? 'w-14 h-14 -ml-7 -mt-7 bg-purple-500/20 border-purple-400 shadow-[0_0_25px_rgba(168,85,247,0.6)] animate-pulse'
            : isButton
            ? 'w-12 h-12 -ml-6 -mt-6 bg-purple-500/15 border-purple-400/60 shadow-[0_0_20px_rgba(124,58,237,0.4)] scale-110'
            : isInput
            ? 'w-6 h-8 -ml-3 -mt-4 rounded-md bg-white/10 border-white/40'
            : 'w-9 h-9 -ml-4.5 -mt-4.5 bg-white/[0.04] border-white/25 shadow-lg'
        }`}
        style={{
          transform: `translate3d(${trailerPos.x}px, ${trailerPos.y}px, 0)`,
        }}
      />

      {/* Inner Iridescent 3D Dot */}
      <div
        className={`absolute rounded-full transition-all duration-75 ${
          isButton
            ? 'w-3.5 h-3.5 -ml-[7px] -mt-[7px] bg-gradient-to-tr from-purple-400 to-indigo-200 shadow-md shadow-purple-900'
            : 'w-2 h-2 -ml-1 -mt-1 bg-gradient-to-tr from-white to-purple-200 shadow-[0_0_8px_#ffffff]'
        }`}
        style={{
          transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
        }}
      />
    </div>
  );
};

export default CustomCursor;
