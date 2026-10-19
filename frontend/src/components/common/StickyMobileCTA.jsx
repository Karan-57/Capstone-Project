import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Plus, Compass, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const StickyMobileCTA = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAuth();

  // Don't obscure workspace chat, auth inputs, or legal reading pages
  const hidePaths = ['/workspace', '/messages', '/login', '/signup', '/auth', '/privacy', '/terms'];
  if (hidePaths.some((p) => location.pathname.includes(p))) {
    return null;
  }

  const isCreator = currentUser?.role === 'creator';
  const isEditor = currentUser?.role === 'editor';

  return (
    <div className="md:hidden fixed bottom-4 left-4 right-4 z-40 animate-fade-in text-[#261615] dark:text-[#FDEBDE]">
      <div className="p-3 bg-[#FFFDF9] dark:bg-[#201413] border-2 border-[#382322] dark:border-[#FDEBDE]/30 shadow-[4px_4px_0_#382322] dark:shadow-[4px_4px_0_#000] flex items-center justify-between gap-3">
        {isCreator ? (
          <>
            <div className="min-w-0 pl-1">
              <p className="text-xs font-serif font-bold text-[#261615] dark:text-[#FDEBDE] truncate">Need a Video Edit?</p>
              <p className="text-[10px] text-[#5C3A38] dark:text-[#D4B8A8] font-sans">Hire top verified editors</p>
            </div>
            <button
              onClick={() => navigate('/creator/create-project')}
              title="Create New Project"
              aria-label="Create New Project"
              className="p-2 bg-[#FFEBAA] hover:bg-[#ffe58f] text-[#261615] border-2 border-[#382322] shadow-[2px_2px_0_#382322] flex items-center justify-center shrink-0 cursor-pointer active:translate-x-0.5 active:translate-y-0.5 transition-all"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
            </button>
          </>
        ) : isEditor ? (
          <>
            <div className="min-w-0 pl-1">
              <p className="text-xs font-serif font-bold text-[#261615] dark:text-[#FDEBDE] truncate">Open Video Gigs</p>
              <p className="text-[10px] text-[#5C3A38] dark:text-[#D4B8A8] font-sans">Bid and earn with escrow</p>
            </div>
            <button
              onClick={() => navigate('/editor/browse')}
              className="px-3.5 py-1.5 text-xs font-bold font-mono uppercase tracking-wider bg-[#FFEBAA] hover:bg-[#ffe58f] text-[#261615] border-2 border-[#382322] shadow-[2px_2px_0_#382322] flex items-center gap-1.5 shrink-0 cursor-pointer active:translate-x-0.5 active:translate-y-0.5 transition-all"
            >
              <Compass className="w-3.5 h-3.5" />
              Find Gigs
            </button>
          </>
        ) : (
          <>
            <div className="min-w-0 pl-1">
              <p className="text-xs font-serif font-bold text-[#261615] dark:text-[#FDEBDE] truncate">Start Collaborating</p>
              <p className="text-[10px] text-[#5C3A38] dark:text-[#D4B8A8] font-sans">Creators & editors workspace</p>
            </div>
            <button
              onClick={() => navigate('/signup')}
              className="px-3.5 py-1.5 text-xs font-bold font-mono uppercase tracking-wider bg-[#FFEBAA] hover:bg-[#ffe58f] text-[#261615] border-2 border-[#382322] shadow-[2px_2px_0_#382322] flex items-center gap-1.5 shrink-0 cursor-pointer active:translate-x-0.5 active:translate-y-0.5 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Get Started
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default StickyMobileCTA;
