import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import CollaboLogo from '../../assets/logos/CollaboLogo';
import Button from '../../components/common/Button';
import { useAuth } from '../../context/AuthContext';
import GoogleSignInButton from '../../components/common/GoogleSignInButton';
import { DEFAULT_PFP } from '../../constants/assets';

export const EditorSignup = () => {
  const [fullName, setFullName] = useState('Alex Rivera');
  const [portfolioUrl, setPortfolioUrl] = useState('https://vimeo.com/alexrivera/showreel2026');
  const [software, setSoftware] = useState('Adobe Premiere Pro & After Effects');
  const [password, setPassword] = useState('password123');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!agreedToTerms) {
      setErrorMsg("Please accept the Terms & Conditions and Privacy Policy to continue.");
      return;
    }
    login('editor', {
      name: fullName || 'Alex Rivera',
      email: 'alex@motioncraft.co',
      role: 'editor',
      title: 'Senior Motion & Video Editor',
      software,
      portfolioUrl,
      avatar: DEFAULT_PFP,
    });
    navigate('/editor/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#07090E] p-4">
      <div className="w-full max-w-md p-8 rounded-2xl glass-card border border-white/[0.08] shadow-2xl">
        <div className="flex justify-center mb-6">
          <CollaboLogo className="w-10 h-10" textClassName="text-2xl font-bold text-white tracking-tight" />
        </div>

        <div className="text-center mb-6">
          <h2 className="text-xl font-bold text-white">Join as Freelance Video Editor</h2>
          <p className="text-xs text-slate-400 mt-1">
            Get matched with premier YouTube channels, podcasters, and brand campaigns
          </p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs text-center">
            {errorMsg}
          </div>
        )}

        {/* Google 1-Click Sign-In */}
        <div className="mb-4">
          <div className="flex justify-center">
            <GoogleSignInButton
              role="editor"
              onSuccess={({ accessToken, user }) => {
                login('editor', user, accessToken);
                navigate('/editor/dashboard');
              }}
              onError={(msg) => setErrorMsg(msg)}
            />
          </div>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/[0.08]" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-[#0e1320] px-3 text-slate-400 font-medium">
                Or continue with email
              </span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-slate-300 block mb-1">Editor / Studio Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#141A28] border border-white/[0.08] text-sm text-white focus:outline-none focus:border-purple-500"
              required
            />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-300 block mb-1">Portfolio / Showreel URL</label>
            <input
              type="url"
              value={portfolioUrl}
              onChange={(e) => setPortfolioUrl(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#141A28] border border-white/[0.08] text-sm text-white focus:outline-none focus:border-purple-500"
              required
            />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-300 block mb-1">Primary Editing Software</label>
            <select
              value={software}
              onChange={(e) => setSoftware(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#141A28] border border-white/[0.08] text-sm text-white focus:outline-none focus:border-purple-500"
            >
              <option>Adobe Premiere Pro & After Effects</option>
              <option>DaVinci Resolve Studio</option>
              <option>Final Cut Pro</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-300 block mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#141A28] border border-white/[0.08] text-sm text-white focus:outline-none focus:border-purple-500"
              required
            />
          </div>

          <div className="flex items-start gap-2.5 pt-1 text-xs text-slate-300">
            <input
              type="checkbox"
              id="editorAgreeTerms"
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded border-white/20 accent-blue-600 cursor-pointer shrink-0"
            />
            <div className="leading-relaxed text-slate-400 select-none">
              <label htmlFor="editorAgreeTerms" className="cursor-pointer">
                I agree to Collabo's{' '}
              </label>
              <Link to="/terms" target="_blank" rel="noopener noreferrer" className="text-blue-400 font-medium hover:underline inline">
                Terms and Conditions
              </Link>{' '}
              <span>and </span>
              <Link to="/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-400 font-medium hover:underline inline">
                Privacy Policy
              </Link>
              <span>.</span>
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            disabled={!agreedToTerms}
            className={`w-full py-2.5 transition-all duration-200 ${
              !agreedToTerms ? 'opacity-40 cursor-not-allowed bg-slate-800 text-slate-500 border border-white/5 pointer-events-none' : ''
            }`}
          >
            Submit Editor Application
          </Button>
        </form>

        <div className="mt-6 pt-5 border-t border-white/[0.06] text-center text-xs text-slate-400">
          Already verified?{' '}
          <Link to="/auth/editor-login" className="text-purple-400 hover:underline">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default EditorSignup;
