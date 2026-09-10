import React, { useState } from 'react';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import CollaboLogo from '../../assets/logos/CollaboLogo';
import Button from '../../components/common/Button';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

export const Login = ({ initialRole }) => {
  const [searchParams] = useSearchParams();
  const { role: contextRole, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Determine starting role from prop, URL search param ?role=..., or context
  const paramRole = searchParams.get('role');
  const roleFromUrl = paramRole === 'editor' || paramRole === 'creator' ? paramRole : null;
  const defaultRole = initialRole || roleFromUrl || contextRole || 'creator';

  const [activeRole, setActiveRole] = useState(defaultRole);
  const [email, setEmail] = useState(() =>
    defaultRole === 'creator' ? 'creator@collabo.io' : 'alex@motioncraft.co'
  );
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Update default email when toggling active role
  const handleRoleSelect = (role) => {
    setActiveRole(role);
    setErrorMsg('');
    if (role === 'creator') {
      setEmail('creator@collabo.io');
    } else {
      setEmail('alex@motioncraft.co');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');

    try {
      // Attempt backend login if server is running
      try {
        const response = await api.post('/api/auth/login', { email, password });
        if (response?.data?.accessToken) {
          login(activeRole, { email }, response.data.accessToken);
        } else {
          login(activeRole, { email });
        }
      } catch (err) {
        console.warn('Backend login fallback to client session:', err?.response?.data?.message || err.message);
        login(activeRole, { email });
      }

      // Route to original requested location or role dashboard
      const targetPath =
        location.state?.from?.pathname ||
        (activeRole === 'editor' ? '/editor/dashboard' : '/creator/dashboard');

      navigate(targetPath, { replace: true });
    } catch (error) {
      setErrorMsg(error?.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemo = (demoRole) => {
    setActiveRole(demoRole);
    login(demoRole);
    navigate(demoRole === 'editor' ? '/editor/dashboard' : '/creator/dashboard');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#07090E] p-4 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-gradient-to-r from-purple-900/20 via-indigo-900/20 to-sky-900/20 blur-[120px] pointer-events-none rounded-full" />

      {/* Top Bar Navigation back to landing */}
      <div className="w-full max-w-md flex items-center justify-between mb-4 px-1 relative z-10">
        <Link
          to="/"
          className="text-xs font-medium text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors"
        >
          <span>←</span>
          <span>Back to Home</span>
        </Link>
        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
          Unified Authentication
        </span>
      </div>

      <div className="w-full max-w-md p-8 rounded-2xl glass-card border border-white/[0.08] shadow-2xl relative z-10 backdrop-blur-xl bg-[#0F1420]/85">
        {/* Brand Logo */}
        <div className="flex justify-center mb-5">
          <CollaboLogo className="w-10 h-10" textClassName="text-2xl font-bold text-white tracking-tight" />
        </div>

        {/* ─── ROLE SELECTOR TABS (Creator Space ↔ Editor Pro) ─── */}
        <div className="relative mb-6 p-1 bg-[#141A28] rounded-xl flex items-center border border-white/[0.06]">
          <button
            type="button"
            onClick={() => handleRoleSelect('creator')}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer ${
              activeRole === 'creator'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-900/40 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>🎬</span>
            <span>Creator Space</span>
          </button>

          <button
            type="button"
            onClick={() => handleRoleSelect('editor')}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer ${
              activeRole === 'editor'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-900/40 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>✂️</span>
            <span>Editor Pro</span>
          </button>
        </div>

        {/* Card Header Info */}
        <div className="text-center mb-6">
          {activeRole === 'editor' ? (
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-950/60 text-blue-300 text-[11px] font-semibold mb-2 border border-blue-500/20">
                Editor Pro Portal
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">Editor Sign In</h2>
              <p className="text-xs text-slate-400 mt-1">
                Access high-ticket creator editing projects and manage contracts
              </p>
            </div>
          ) : (
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-950/60 text-purple-300 text-[11px] font-semibold mb-2 border border-purple-500/20">
                Creator Studio
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">Creator Sign In</h2>
              <p className="text-xs text-slate-400 mt-1">
                Access your creator dashboard to hire top video editors
              </p>
            </div>
          )}
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs text-center">
            {errorMsg}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-slate-300 block mb-1">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#141A28] border border-white/[0.08] text-sm text-white focus:outline-none focus:border-purple-500 placeholder:text-slate-500 transition-colors"
              required
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-medium text-slate-300">Password</label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-[11px] text-slate-400 hover:text-slate-200 transition-colors"
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#141A28] border border-white/[0.08] text-sm text-white focus:outline-none focus:border-purple-500 placeholder:text-slate-500 transition-colors"
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
              ? 'Signing In...'
              : activeRole === 'editor'
              ? 'Sign In as Video Editor'
              : 'Sign In as Creator'}
          </Button>
        </form>

        {/* Quick Demo Instant Access */}
        <div className="mt-5 pt-4 border-t border-white/[0.06] flex items-center justify-between gap-2 text-xs">
          <span className="text-slate-500 font-medium text-[11px]">Instant Demo:</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleQuickDemo('creator')}
              className="px-2.5 py-1 rounded-lg bg-purple-950/40 text-purple-300 hover:text-white hover:bg-purple-900/60 border border-purple-800/30 text-[11px] font-medium transition-colors cursor-pointer"
            >
              Demo Creator ➔
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('editor')}
              className="px-2.5 py-1 rounded-lg bg-blue-950/40 text-blue-300 hover:text-white hover:bg-blue-900/60 border border-blue-800/30 text-[11px] font-medium transition-colors cursor-pointer"
            >
              Demo Editor ➔
            </button>
          </div>
        </div>

        {/* Footer Navigation Links */}
        <div className="mt-5 pt-4 border-t border-white/[0.06] text-center text-xs text-slate-400 space-y-2">
          <div>
            Don't have an account?{' '}
            <Link
              to={`/signup?role=${activeRole}`}
              className="text-purple-400 hover:text-purple-300 font-medium underline underline-offset-2"
            >
              Create {activeRole === 'editor' ? 'editor' : 'creator'} account
            </Link>
          </div>
          <div>
            {activeRole === 'creator' ? (
              <span>
                Are you a video editor?{' '}
                <button
                  type="button"
                  onClick={() => handleRoleSelect('editor')}
                  className="text-blue-400 hover:text-blue-300 font-medium hover:underline cursor-pointer"
                >
                  Switch to Editor Login
                </button>
              </span>
            ) : (
              <span>
                Looking to hire editors?{' '}
                <button
                  type="button"
                  onClick={() => handleRoleSelect('creator')}
                  className="text-purple-400 hover:text-purple-300 font-medium hover:underline cursor-pointer"
                >
                  Switch to Creator Login
                </button>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
