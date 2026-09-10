import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import CollaboLogo from '../../assets/logos/CollaboLogo';
import Button from '../../components/common/Button';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

export const Signup = ({ initialRole }) => {
  const [searchParams] = useSearchParams();
  const { role: contextRole, login } = useAuth();
  const navigate = useNavigate();

  const paramRole = searchParams.get('role');
  const roleFromUrl = paramRole === 'editor' || paramRole === 'creator' ? paramRole : null;
  const defaultRole = initialRole || roleFromUrl || contextRole || 'creator';

  const [activeRole, setActiveRole] = useState(defaultRole);

  // Creator fields
  const [creatorName, setCreatorName] = useState('Jason Vance');
  const [creatorEmail, setCreatorEmail] = useState('jason@studio.io');

  // Editor fields
  const [editorName, setEditorName] = useState('Alex Rivera');
  const [editorEmail, setEditorEmail] = useState('alex@motioncraft.co');
  const [portfolioUrl, setPortfolioUrl] = useState('https://vimeo.com/alexrivera/showreel2026');
  const [software, setSoftware] = useState('Adobe Premiere Pro & After Effects');

  // Shared
  const [password, setPassword] = useState('password123');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');

    try {
      const email = activeRole === 'creator' ? creatorEmail : editorEmail;
      const username = activeRole === 'creator' ? creatorName : editorName;

      // Attempt backend registration if server is running
      try {
        await api.post('/api/auth/register', {
          username,
          email,
          password,
        });
      } catch (err) {
        console.warn('Backend register fallback to client session:', err?.response?.data?.message || err.message);
      }

      // Complete client login & route
      login(activeRole, { name: username, email });
      navigate(activeRole === 'editor' ? '/editor/dashboard' : '/creator/dashboard');
    } catch (error) {
      setErrorMsg(error?.message || 'Signup failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#07090E] p-4 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-gradient-to-r from-purple-900/20 via-indigo-900/20 to-sky-900/20 blur-[120px] pointer-events-none rounded-full" />

      {/* Top Bar Navigation */}
      <div className="w-full max-w-md flex items-center justify-between mb-4 px-1 relative z-10">
        <Link
          to="/"
          className="text-xs font-medium text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors"
        >
          <span>←</span>
          <span>Back to Home</span>
        </Link>
        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
          Account Registration
        </span>
      </div>

      <div className="w-full max-w-md p-8 rounded-2xl glass-card border border-white/[0.08] shadow-2xl relative z-10 backdrop-blur-xl bg-[#0F1420]/85">
        {/* Brand Logo */}
        <div className="flex justify-center mb-5">
          <CollaboLogo className="w-10 h-10" textClassName="text-2xl font-bold text-white tracking-tight" />
        </div>

        {/* ─── ROLE SELECTOR TABS ─── */}
        <div className="relative mb-6 p-1 bg-[#141A28] rounded-xl flex items-center border border-white/[0.06]">
          <button
            type="button"
            onClick={() => setActiveRole('creator')}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer ${
              activeRole === 'creator'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-900/40 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>🎬</span>
            <span>Join as Creator</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveRole('editor')}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer ${
              activeRole === 'editor'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-900/40 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>✂️</span>
            <span>Join as Editor</span>
          </button>
        </div>

        {/* Card Header Info */}
        <div className="text-center mb-6">
          {activeRole === 'editor' ? (
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">Join as Freelance Editor</h2>
              <p className="text-xs text-slate-400 mt-1">
                Get matched with premier YouTube channels, podcasters, and brand campaigns
              </p>
            </div>
          ) : (
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">Join as a Creator</h2>
              <p className="text-xs text-slate-400 mt-1">
                Build your team of elite video editors and scale your channel
              </p>
            </div>
          )}
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs text-center">
            {errorMsg}
          </div>
        )}

        {/* Signup Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {activeRole === 'creator' ? (
            <>
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">Full Name / Channel</label>
                <input
                  type="text"
                  value={creatorName}
                  onChange={(e) => setCreatorName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#141A28] border border-white/[0.08] text-sm text-white focus:outline-none focus:border-purple-500 transition-colors"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">Email Address</label>
                <input
                  type="email"
                  value={creatorEmail}
                  onChange={(e) => setCreatorEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#141A28] border border-white/[0.08] text-sm text-white focus:outline-none focus:border-purple-500 transition-colors"
                  required
                />
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">Editor / Studio Name</label>
                <input
                  type="text"
                  value={editorName}
                  onChange={(e) => setEditorName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#141A28] border border-white/[0.08] text-sm text-white focus:outline-none focus:border-purple-500 transition-colors"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">Email Address</label>
                <input
                  type="email"
                  value={editorEmail}
                  onChange={(e) => setEditorEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#141A28] border border-white/[0.08] text-sm text-white focus:outline-none focus:border-purple-500 transition-colors"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">Portfolio / Showreel URL</label>
                <input
                  type="url"
                  value={portfolioUrl}
                  onChange={(e) => setPortfolioUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#141A28] border border-white/[0.08] text-sm text-white focus:outline-none focus:border-purple-500 transition-colors"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">Primary Editing Software</label>
                <select
                  value={software}
                  onChange={(e) => setSoftware(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#141A28] border border-white/[0.08] text-sm text-white focus:outline-none focus:border-purple-500 transition-colors"
                >
                  <option>Adobe Premiere Pro & After Effects</option>
                  <option>DaVinci Resolve Studio</option>
                  <option>Final Cut Pro</option>
                </select>
              </div>
            </>
          )}

          <div>
            <label className="text-xs font-medium text-slate-300 block mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#141A28] border border-white/[0.08] text-sm text-white focus:outline-none focus:border-purple-500 transition-colors"
              required
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            disabled={isLoading}
            className={`w-full py-2.5 text-sm font-semibold transition-all ${
              activeRole === 'editor'
                ? 'bg-blue-600 hover:bg-blue-500 border-blue-500/30'
                : 'bg-purple-600 hover:bg-purple-500'
            }`}
          >
            {isLoading
              ? 'Creating Account...'
              : activeRole === 'editor'
              ? 'Submit Editor Application'
              : 'Create Creator Account'}
          </Button>
        </form>

        {/* Footer Navigation */}
        <div className="mt-6 pt-5 border-t border-white/[0.06] text-center text-xs text-slate-400 space-y-2">
          <div>
            Already registered?{' '}
            <Link
              to={`/login?role=${activeRole}`}
              className="text-purple-400 hover:text-purple-300 font-medium underline underline-offset-2"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
