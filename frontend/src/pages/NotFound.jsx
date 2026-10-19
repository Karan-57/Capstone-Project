import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, ArrowLeft, Film, Compass, Sparkles } from 'lucide-react';
import Button from '../components/common/Button';
import SEO from '../components/common/SEO';
import Logo from '../components/common/Logo';
import { useAuth } from '../context/AuthContext';

export const NotFound = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const dashboardPath = currentUser?.role === 'editor' ? '/editor/dashboard' : '/creator/dashboard';

  return (
    <div className="min-h-screen bg-[#FFF7F1] dark:bg-[#19100F] text-[#261615] dark:text-[#FDEBDE] flex flex-col justify-between p-6 relative overflow-hidden transition-colors">
      <SEO
        title="404 - Page Not Found"
        description="The page you requested could not be found on Collabo."
      />

      {/* Top Bar with Logo */}
      <header className="relative z-10 flex items-center justify-between max-w-6xl mx-auto w-full py-2">
        <Logo size="md" />
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 border-2 border-[#382322] dark:border-[#FDEBDE]/30 bg-[#FFFDF9] dark:bg-[#201413] text-xs font-bold font-mono uppercase tracking-wider text-[#261615] dark:text-[#FDEBDE] hover:bg-[#FFEBAA] dark:hover:bg-[#FFEBAA] dark:hover:text-[#261615] shadow-[2px_2px_0_#382322] transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Go Back</span>
        </button>
      </header>

      {/* Main 404 Visual Content */}
      <main className="relative z-10 max-w-lg mx-auto text-center space-y-6 my-auto py-12">
        {/* Number Badge */}
        <div className="relative inline-block">
          <h1 className="text-8xl sm:text-9xl font-serif font-black tracking-tighter text-[#261615] dark:text-[#FDEBDE] select-none">
            404
          </h1>
          <div className="absolute -top-3 -right-3 p-2.5 bg-[#FFEBAA] border-2 border-[#382322] shadow-[3px_3px_0_#382322] animate-bounce">
            <Film className="w-6 h-6 text-[#261615]" />
          </div>
        </div>

        <div className="space-y-2.5">
          <h2 className="text-2xl sm:text-3xl font-serif font-black text-[#261615] dark:text-[#FDEBDE] tracking-tight">
            Lost on the Cutting Room Floor
          </h2>
          <p className="text-xs sm:text-sm text-[#5C3A38] dark:text-[#D4B8A8] max-w-md mx-auto leading-relaxed font-sans">
            The scene or file you are looking for has been archived, moved to another timeline, or never existed in the edit.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          <button
            onClick={() => navigate(currentUser ? dashboardPath : '/')}
            className="w-full sm:w-auto px-6 py-2.5 bg-[#FFEBAA] hover:bg-[#ffe58f] text-[#261615] border-2 border-[#382322] shadow-[3px_3px_0_#382322] text-xs font-bold font-mono uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer active:translate-x-0.5 active:translate-y-0.5 transition-all"
          >
            <Home className="w-4 h-4" />
            <span>{currentUser ? 'Go to Your Dashboard' : 'Return Home'}</span>
          </button>

          <button
            onClick={() => navigate('/editor/browse')}
            className="w-full sm:w-auto px-5 py-2.5 bg-[#FFFDF9] dark:bg-[#201413] hover:bg-[#FDEBDE] dark:hover:bg-[#2A1B19] text-[#261615] dark:text-[#FDEBDE] border-2 border-[#382322] dark:border-[#FDEBDE]/30 shadow-[3px_3px_0_#382322] text-xs font-bold font-mono uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer active:translate-x-0.5 active:translate-y-0.5 transition-all"
          >
            <Compass className="w-4 h-4" />
            <span>Explore Open Gigs</span>
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 text-center py-4 text-xs font-mono text-[#5C3A38] dark:text-[#D4B8A8]">
        Collabo Video Intelligence · Need assistance? Contact{' '}
        <a href="mailto:support@collabo.app" className="underline font-bold text-[#261615] dark:text-[#FFEBAA]">
          support@collabo.app
        </a>
      </footer>
    </div>
  );
};

export default NotFound;
