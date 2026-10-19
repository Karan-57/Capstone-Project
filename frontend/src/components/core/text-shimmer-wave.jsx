import React from 'react';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';

export function TextShimmerWave({
  children,
  className,
  duration = 2,
  spread = 2,
}) {
  const text = typeof children === 'string' ? children : String(children || '');

  return (
    <span
      className={cn(
        'relative inline-flex items-center overflow-hidden font-mono text-xs font-semibold',
        className
      )}
    >
      <span className="relative z-10 flex">
        {text.split('').map((char, i) => (
          <motion.span
            key={i}
            initial={{ opacity: 0.5, y: 0 }}
            animate={{
              opacity: [0.4, 1, 0.4],
              y: [0, -1.5, 0],
            }}
            transition={{
              duration,
              repeat: Infinity,
              delay: (i * duration) / (text.length * spread),
              ease: 'easeInOut',
            }}
            className="inline-block"
          >
            {char === ' ' ? '\u00A0' : char}
          </motion.span>
        ))}
      </span>
    </span>
  );
}

export default TextShimmerWave;
