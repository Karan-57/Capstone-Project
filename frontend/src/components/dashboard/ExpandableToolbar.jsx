import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, MotionConfig } from 'motion/react';
import {
  Sparkles,
  User,
  MessageSquare,
  FolderGit2,
  Wallet,
  X,
  ChevronUp,
  SlidersHorizontal,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAuth } from '../../context/AuthContext';

export function ExpandableToolbar({ role = 'creator', className }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const items = [
    {
      label: 'Profile',
      icon: User,
      action: () => {
        navigate(`/${role}/profile`);
        setIsOpen(false);
      },
      tag: 'Studio',
    },
    {
      label: 'Direct Messages',
      icon: MessageSquare,
      action: () => {
        navigate(`/${role}/workspace`);
        setIsOpen(false);
      },
      tag: 'Chat',
    },
    {
      label: role === 'creator' ? 'Projects' : 'Browse',
      icon: FolderGit2,
      action: () => {
        navigate(role === 'creator' ? '/creator/projects' : '/editor/browse');
        setIsOpen(false);
      },
      tag: 'Files',
    },
    {
      label: role === 'creator' ? 'Payments' : 'Earnings',
      icon: Wallet,
      action: () => {
        navigate(role === 'creator' ? '/creator/payments' : '/editor/earnings');
        setIsOpen(false);
      },
      tag: 'Escrow',
    },
  ];

  return (
    <div
      ref={containerRef}
      className={cn(
        'fixed bottom-6 right-6 z-40 select-none print:hidden',
        className
      )}
    >
      <MotionConfig transition={{ type: 'spring', damping: 25, stiffness: 320 }}>
        <div className="relative flex flex-col items-end">
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.88, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.88, y: 15 }}
                className="mb-3 w-56 p-2 rounded-2xl bg-[#FFF7F1] border-2 border-[#382322] shadow-brutal-lg overflow-hidden"
              >
                <div className="px-3 py-2 border-b border-[#382322]/15 flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-widest font-bold text-[#382322]">
                    Quick Studio Menu
                  </span>
                  <span className="w-2 h-2 rounded-full bg-[#FFEBAA] border border-[#382322]" />
                </div>

                <div className="space-y-1 mt-1.5">
                  {items.map((item, idx) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={idx}
                        onClick={item.action}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs font-semibold text-[#382322] hover:bg-[#FFEBAA] hover:border-[#382322] border border-transparent transition-all group"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="p-1.5 rounded-lg bg-[#B1C8EA]/40 text-[#382322] group-hover:bg-[#382322] group-hover:text-[#FFEBAA] transition-colors">
                            <Icon className="w-3.5 h-3.5" />
                          </div>
                          <span>{item.label}</span>
                        </div>
                        <span className="text-[10px] font-mono text-[#382322]/60 uppercase group-hover:text-[#382322]">
                          {item.tag}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Trigger Button */}
          <motion.button
            whileTap={{ scale: 0.94 }}
            whileHover={{ scale: 1.05 }}
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#382322] text-[#FFEBAA] border-2 border-[#382322] shadow-brutal font-medium text-xs tracking-wide cursor-pointer group hover:bg-[#261615]"
            title="Expand Studio Shortcuts"
            aria-label="Expand studio action toolbar"
          >
            <Sparkles className="w-4 h-4 text-[#FFEBAA] group-hover:rotate-12 transition-transform" />
            <span className="font-semibold font-mono tracking-wider">
              {isOpen ? 'Close' : 'Studio Actions'}
            </span>
            <div className="w-5 h-5 rounded-full bg-[#FFEBAA] text-[#382322] flex items-center justify-center text-[10px] font-bold">
              {isOpen ? <X className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
            </div>
          </motion.button>
        </div>
      </MotionConfig>
    </div>
  );
}

export default ExpandableToolbar;
