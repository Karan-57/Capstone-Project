import React from 'react';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.04,
      delayChildren: 0.05,
    },
  },
};

const wordVariants = {
  hidden: {
    opacity: 0,
    y: 12,
    filter: 'blur(6px)',
  },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      duration: 0.45,
      ease: [0.2, 0.65, 0.3, 0.9],
    },
  },
};

export function TextEffect({
  children,
  className,
  as: Component = 'h1',
  per = 'word',
}) {
  if (typeof children !== 'string') {
    return <Component className={className}>{children}</Component>;
  }

  const words = children.split(' ');

  return (
    <Component className={cn('inline-block', className)}>
      <motion.span
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="inline"
      >
        {words.map((word, wordIndex) => (
          <span key={`word-${wordIndex}`} className="inline-block whitespace-nowrap">
            <motion.span
              variants={wordVariants}
              className="inline-block mr-[0.25em]"
            >
              {word}
            </motion.span>
          </span>
        ))}
      </motion.span>
    </Component>
  );
}

export default TextEffect;
