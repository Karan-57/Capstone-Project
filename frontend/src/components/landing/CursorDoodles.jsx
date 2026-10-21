import React, { useEffect, useState } from "react";
import { motion, useSpring } from "motion/react";

export default function CursorDoodles() {
  const [isTouch, setIsTouch] = useState(false);
  const [enabled, setEnabled] = useState(true);

  // Check reduced motion & touch
  useEffect(() => {
    if (typeof window !== "undefined") {
      const hasTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;
      const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (hasTouch || prefersReduced) {
        setIsTouch(true);
        setEnabled(false);
      }
    }
  }, []);

  // Spring values with gentle editorial paper lag
  const springConfig = { damping: 28, stiffness: 120, mass: 0.6 };
  const mouseX = useSpring(0, springConfig);
  const mouseY = useSpring(0, springConfig);

  useEffect(() => {
    if (!enabled) return;

    const handlePointerMove = (e) => {
      // Small offset so it follows gracefully behind the pointer
      mouseX.set(e.clientX + 24);
      mouseY.set(e.clientY + 24);
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    return () => window.removeEventListener("pointermove", handlePointerMove);
  }, [enabled, mouseX, mouseY]);

  if (!enabled || isTouch) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-40 overflow-hidden select-none">
      <motion.div
        style={{
          x: mouseX,
          y: mouseY,
        }}
        className="will-change-transform opacity-70"
      >
        {/* Subtle analog ink sketch annotation that drifts with cursor */}
        <div className="flex items-center gap-1.5 -translate-x-3 -translate-y-3">
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="text-[#382322]"
          >
            {/* Hand-drawn ink star */}
            <path
              d="M12 2C12 7.5 16.5 12 22 12C16.5 12 12 16.5 12 22C12 16.5 7.5 12 2 12C7.5 12 12 7.5 12 2Z"
              fill="#382322"
            />
          </svg>
          <span className="font-hand text-[13px] font-bold text-[#382322] px-1.5 py-0.5 rounded bg-[#FFEBAA]/90 border border-[#382322]/40 shadow-xs rotate-[-3deg]">
            collabo
          </span>
        </div>
      </motion.div>
    </div>
  );
}
