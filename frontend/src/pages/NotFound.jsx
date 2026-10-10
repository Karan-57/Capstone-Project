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
    <div className="min-h-screen bg-[#07090E] text-white flex flex-col justify-between p-6 relative overflow-hidden">
      <SEO
        title="404 - Page Not Found"
        description="The page you requested could not be found on Collabo."
      />

      {/* Background Ambient Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[350px] bg-gradient-to-tr from-purple-700/20 to-indigo-600/10 rounded-full blur-[130px] pointer-events-none" />

      {/* Top Bar with SVG Logo */}
      <header className="relative z-10 flex items-center justify-between max-w-6xl mx-auto w-full py-2">
        <Logo size="md" />
        <Button
          variant="ghost"
          size="sm"
          icon={ArrowLeft}
          onClick={() => navigate(-1)}
          className="text-slate-400 hover:text-white"
        >
          Go Back
        </Button>
      </header>

      {/* Main 404 Visual Content */}
      <main className="relative z-10 max-w-lg mx-auto text-center space-y-6 my-auto py-12">
        {/* Glow Number Badge */}
        <div className="relative inline-block">
          <h1 className="text-8xl sm:text-9xl font-black tracking-tighter bg-gradient-to-b from-white via-purple-200 to-purple-800/40 bg-clip-text text-transparent select-none">
            404
          </h1>
          <div className="absolute -top-3 -right-3 p-2 rounded-2xl bg-purple-600/20 border border-purple-500/40 animate-bounce">
            <Film className="w-6 h-6 text-purple-400" />
          </div>
        </div>

        <div className="space-y-2.5">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Lost on the Cutting Room Floor
          </h2>
          <p className="text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
            The scene or file you are looking for has been archived, moved to another timeline, or never existed in the edit.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          {currentUser ? (
            <Button
              variant="primary"
              size="md"
              icon={Home}
              onClick={() => navigate(dashboardPath)}
              className="w-full sm:w-auto px-6 py-2.5 shadow-lg shadow-purple-900/30 font-semibold"
            >
              Go to Your Dashboard
            </Button>
          ) : (
            <Button
              variant="primary"
              size="md"
              icon={Home}
              onClick={() => navigate('/')}
              className="w-full sm:w-auto px-6 py-2.5 shadow-lg shadow-purple-900/30 font-semibold"
            >
              Return Home
            </Button>
          )}

          <Button
            variant="outline"
            size="md"
            icon={Compass}
            onClick={() => navigate('/editor/browse')}
            className="w-full sm:w-auto px-5 py-2.5"
          >
            Explore Open Gigs
          </Button>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 text-center py-4 text-xs text-slate-600">
        Collabo Video Intelligence · Lost in Space? Contact{' '}
        <a href="mailto:support@collabo.app" className="text-purple-400 hover:underline">
          support@collabo.app
        </a>
      </footer>
    </div>
  );
};

export default NotFound;
