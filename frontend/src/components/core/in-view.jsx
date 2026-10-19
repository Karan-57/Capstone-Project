import React, { useRef } from 'react';
import { motion, useInView } from 'motion/react';
import { cn } from '../../lib/utils';

export function InView({
  children,
  className,
  variants,
  transition,
  viewOptions = { once: true, margin: '-40px 0px -40px 0px' },
  as = 'div',
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, viewOptions);

  const defaultVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const defaultTransition = {
    duration: 0.45,
    ease: [0.25, 0.1, 0.25, 1],
  };

  const MotionComponent = motion[as] || motion.div;

  return (
    <MotionComponent
      ref={ref}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={variants || defaultVariants}
      transition={transition || defaultTransition}
      className={cn(className)}
    >
      {children}
    </MotionComponent>
  );
}

export default InView;
