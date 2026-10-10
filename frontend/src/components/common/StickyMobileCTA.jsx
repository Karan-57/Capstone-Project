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
    <div className="md:hidden fixed bottom-4 left-4 right-4 z-40 animate-fade-in">
      <div className="glass-card p-2.5 rounded-2xl border border-purple-500/30 bg-[#0A0D18]/90 backdrop-blur-xl shadow-2xl flex items-center justify-between gap-3">
        {isCreator ? (
          <>
            <div className="min-w-0 pl-1.5">
              <p className="text-xs font-bold text-white truncate">Need a Video Edit?</p>
              <p className="text-[10px] text-purple-300">Hire top verified editors</p>
            </div>
            <button
              onClick={() => navigate('/creator/create-project')}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-900/40 flex items-center gap-1.5 shrink-0 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Post Project
            </button>
          </>
        ) : isEditor ? (
          <>
            <div className="min-w-0 pl-1.5">
              <p className="text-xs font-bold text-white truncate">Open Video Gigs</p>
              <p className="text-[10px] text-purple-300">Bid and earn with escrow</p>
            </div>
            <button
              onClick={() => navigate('/editor/browse')}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-900/40 flex items-center gap-1.5 shrink-0 cursor-pointer"
            >
              <Compass className="w-3.5 h-3.5" />
              Find Gigs
            </button>
          </>
        ) : (
          <>
            <div className="min-w-0 pl-1.5">
              <p className="text-xs font-bold text-white truncate">Start Collaborating</p>
              <p className="text-[10px] text-purple-300">Creators & editors workspace</p>
            </div>
            <button
              onClick={() => navigate('/signup')}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-900/40 flex items-center gap-1.5 shrink-0 cursor-pointer"
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
