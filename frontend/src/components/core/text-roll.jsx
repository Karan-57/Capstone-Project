import React, { useState } from 'react';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';

export function TextRoll({
  children,
  className,
  duration = 0.28,
}) {
  const [isHovered, setIsHovered] = useState(false);
  const text = typeof children === 'string' ? children : String(children || '');

  return (
    <span
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn('inline-flex overflow-hidden relative select-none cursor-pointer', className)}
      aria-label={text}
    >
      <span className="sr-only">{text}</span>
      <span className="inline-flex" aria-hidden="true">
        {text.split('').map((char, index) => (
          <span key={index} className="relative inline-block overflow-hidden">
            <motion.span
              animate={{
                y: isHovered ? '-100%' : '0%',
              }}
              transition={{
                duration,
                delay: index * 0.012,
                ease: [0.25, 0.46, 0.45, 0.94],
              }}
              className="inline-block"
            >
              {char === ' ' ? '\u00A0' : char}
            </motion.span>
            <motion.span
              animate={{
                y: isHovered ? '0%' : '100%',
              }}
              transition={{
                duration,
                delay: index * 0.012,
                ease: [0.25, 0.46, 0.45, 0.94],
              }}
              className="absolute left-0 top-0 inline-block text-[#382322]"
            >
              {char === ' ' ? '\u00A0' : char}
            </motion.span>
          </span>
        ))}
      </span>
    </span>
  );
}

export default TextRoll;
