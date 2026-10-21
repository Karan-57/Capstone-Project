import React from "react";
import { motion, useScroll, useSpring } from "motion/react";

export default function ScrollStoryline() {
  const { scrollYProgress } = useScroll();
  const pathLength = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-full max-w-6xl pointer-events-none select-none z-0 hidden lg:block overflow-hidden">
      <svg
        className="w-full h-full"
        viewBox="0 0 1200 3600"
        fill="none"
        preserveAspectRatio="none"
      >
        {/* Faint static background guideline */}
        <path
          d="M 600 200 C 650 450, 400 700, 600 1000 C 800 1300, 350 1600, 600 1900 C 850 2200, 450 2500, 600 2800 C 700 3000, 500 3200, 600 3450"
          stroke="#382322"
          strokeWidth="2"
          strokeDasharray="5 7"
          strokeOpacity="0.12"
        />

        {/* Dynamic progressive scroll-drawn ink stroke */}
        <motion.path
          d="M 600 200 C 650 450, 400 700, 600 1000 C 800 1300, 350 1600, 600 1900 C 850 2200, 450 2500, 600 2800 C 700 3000, 500 3200, 600 3450"
          stroke="#382322"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeOpacity="0.35"
          style={{ pathLength }}
        />
      </svg>
    </div>
  );
}
