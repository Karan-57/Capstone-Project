import React from 'react';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';

const defaultContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05,
    },
  },
};

const defaultItemVariants = {
  hidden: { opacity: 0, y: 16, filter: 'blur(4px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      type: 'spring',
      stiffness: 280,
      damping: 24,
    },
  },
};

export function AnimatedGroup({
  children,
  className,
  variants,
  preset = 'fade-up',
  as = 'div',
}) {
  const container = variants?.container || defaultContainerVariants;
  const item = variants?.item || defaultItemVariants;

  const MotionComponent = motion[as] || motion.div;

  return (
    <MotionComponent
      initial="hidden"
      animate="visible"
      variants={container}
      className={cn(className)}
    >
      {React.Children.map(children, (child) => {
        if (!React.isValidElement(child)) return child;
        return (
          <motion.div variants={item} className="h-full">
            {child}
          </motion.div>
        );
      })}
    </MotionComponent>
  );
}

export default AnimatedGroup;
