import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import CollaboLogo from '../../assets/logos/CollaboLogo';
import Button from '../../components/common/Button';
import { useAuth } from '../../context/AuthContext';
import GoogleSignInButton from '../../components/common/GoogleSignInButton';
import { DEFAULT_PFP } from '../../constants/assets';

export const CreatorLogin = () => {
  const [email, setEmail] = useState('creator@collabo.io');
  const [password, setPassword] = useState('password123');
  const [errorMsg, setErrorMsg] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    login('creator', {
      name: 'Jason Vance',
      email: email || 'creator@collabo.io',
      role: 'creator',
      channel: 'Tech & Lifestyle',
      avatar: DEFAULT_PFP,
    });
    navigate('/creator/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#07090E] p-4">
      <div className="w-full max-w-md p-8 rounded-2xl glass-card border border-white/[0.08] shadow-2xl">
        <div className="flex justify-center mb-6">
          <CollaboLogo className="w-10 h-10" textClassName="text-2xl font-bold text-white tracking-tight" />
        </div>

        <div className="text-center mb-6">
          <h2 className="text-xl font-bold text-white">Creator Sign In</h2>
          <p className="text-xs text-slate-400 mt-1">
            Access your creator dashboard to hire top video editors
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
              role="creator"
              onSuccess={({ accessToken, user }) => {
                login('creator', user, accessToken);
                navigate('/creator/dashboard');
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
            <label className="text-xs font-medium text-slate-300 block mb-1">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#141A28] border border-white/[0.08] text-sm text-white focus:outline-none focus:border-purple-500"
              required
            />
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

          <Button type="submit" variant="primary" className="w-full py-2.5">
            Sign In as Creator
          </Button>
        </form>

        <div className="mt-6 pt-5 border-t border-white/[0.06] text-center text-xs text-slate-400 space-y-2">
          <div>
            Don't have an account?{' '}
            <Link to="/auth/creator-signup" className="text-purple-400 hover:underline">
              Create one
            </Link>
          </div>
          <div>
            Are you a video editor?{' '}
            <Link to="/auth/editor-login" className="text-purple-400 hover:underline">
              Switch to Editor Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatorLogin;
