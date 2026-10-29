import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

/**
 * ModalPortal
 * Renders modal dialogs directly into document.body.
 * Breaks out of any parent stacking context (e.g. Header with backdrop-blur,
 * parent with overflow: hidden or CSS transforms), ensuring full-screen coverage
 * with no top gaps or off-screen placement.
 */
export const ModalPortal = ({ children }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!mounted || typeof document === 'undefined') {
    return null;
  }

  return createPortal(children, document.body);
};

export default ModalPortal;
