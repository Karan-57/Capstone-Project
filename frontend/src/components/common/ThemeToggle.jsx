import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useTheme } from '../../context/ThemeContext';

export const ThemeToggle = ({ className = '', showLabel = false }) => {
  const { theme, toggleTheme, isDark } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light studio' : 'Switch to darkroom studio'}
      className={`options-toggle relative inline-flex items-center gap-2 p-2 rounded-x1 transition-all duration-200 cursor-pointer select-none active:translate-x-[1px] active:translate-y-[1px] ${
        isDark
          ? 'bg-[#2D1C1B] text-[#FFEBAA] border-2 border-[#FFEBAA]/50 shadow-[2px_2px_0_#FFEBAA] hover:bg-[#382322]'
          : 'bg-[#FFEBAA] text-[#382322] border-2 border-[#382322] shadow-[2px_2px_0_#382322] hover:bg-[#fff2cc]'
      } ${className}`}
    >
      <div className="relative w-4 h-4 flex items-center justify-center overflow-hidden">
        <AnimatePresence mode="wait" initial={false}>
          {isDark ? (
            <motion.div
              key="moon"
              initial={{ rotate: -90, scale: 0, opacity: 0 }}
              animate={{ rotate: 0, scale: 1, opacity: 1 }}
              exit={{ rotate: 90, scale: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: 'backOut' }}
            >
              <Moon className="w-4 h-4 text-[#FFEBAA] fill-[#FFEBAA]/20" />
            </motion.div>
          ) : (
            <motion.div
              key="sun"
              initial={{ rotate: 90, scale: 0, opacity: 0 }}
              animate={{ rotate: 0, scale: 1, opacity: 1 }}
              exit={{ rotate: -90, scale: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: 'backOut' }}
            >
              <Sun className="w-4 h-4 text-[#382322]" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {showLabel && (
        <span className="text-xs font-bold uppercase tracking-wider font-mono">
          {isDark ? 'Darkroom' : 'Editorial'}
        </span>
      )}
    </button>
  );
};

export default ThemeToggle;