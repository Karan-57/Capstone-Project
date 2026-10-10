import React, { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import {
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  KeyRound,
} from 'lucide-react';
import SEO from '../../components/common/SEO';
import api from '../../services/api';
import ForgotPasswordModal from '../../components/auth/ForgotPasswordModal';

export const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);

  const isMinLength = password.length >= 8;
  const isMatching = password && password === confirmPassword;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      return setError('Reset token is missing from URL. Please request a new link.');
    }
    if (!isMinLength) {
      return setError('Password must be at least 8 characters long.');
    }
    if (!isMatching) {
      return setError('Passwords do not match.');
    }

    setLoading(true);
    setError('');

    try {
      await api.post('/api/auth/reset-password', {
        token,
        password,
        confirmPassword,
      });
      setSuccess(true);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Failed to reset password. The link may have expired or is invalid.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#07090E] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <SEO
        title="Reset Password | Collabo"
        description="Set a new secure password for your Collabo creator or editor account."
      />

      {/* Ambient background glow accents */}
      <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Main Container Card */}
      <div className="w-full max-w-md bg-[#0C111D] border border-white/10 rounded-2xl shadow-2xl p-6 sm:p-8 relative z-10 animate-fade-in text-slate-100">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <Link to="/" className="inline-block">
            <span className="text-xl font-black tracking-tight text-white">
              Collabo<span className="text-purple-500">.</span>
            </span>
          </Link>
        </div>

        {success ? (
          /* Success Screen */
          <div className="text-center py-4 space-y-4 animate-fade-in">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-500/10">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                Password Reset Complete!
              </h2>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                Your password has been successfully updated. All existing active sessions have
                been revoked for security.
              </p>
            </div>

            <button
              onClick={() => navigate('/login')}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs tracking-wide transition-all shadow-lg shadow-purple-600/25 flex items-center justify-center gap-2 mt-4"
            >
              Sign In with New Password <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : !token ? (
          /* Missing Token Screen */
          <div className="text-center py-4 space-y-4">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <AlertCircle className="w-7 h-7" />
            </div>

            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                Invalid or Missing Reset Link
              </h2>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                This password reset link is invalid or incomplete. Please request a new link from
                the login page.
              </p>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <button
                onClick={() => setIsForgotModalOpen(true)}
                className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs tracking-wide transition-all"
              >
                Request New Reset Link
              </button>
              <Link
                to="/login"
                className="text-xs text-slate-400 hover:text-white transition-colors py-1 text-center"
              >
                Return to Login
              </Link>
            </div>
          </div>
        ) : (
          /* New Password Form Screen */
          <form onSubmit={handleSubmit} className="space-y-4.5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/25 flex items-center justify-center text-purple-400 shrink-0">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white tracking-tight">
                  Set New Password
                </h2>
                <p className="text-[11px] text-slate-400">
                  Choose a strong password with at least 8 characters
                </p>
              </div>
            </div>

            {/* New Password Input */}
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-slate-300">
                New Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  required
                  className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-purple-500/70"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password Input */}
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-slate-300">
                Confirm New Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your new password"
                  required
                  className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-purple-500/70"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Validation Feedback Indicators */}
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-1.5 text-[11px]">
              <div className="flex items-center gap-2">
                <div
                  className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] ${
                    isMinLength
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-white/10 text-slate-500'
                  }`}
                >
                  {isMinLength ? '✓' : '•'}
                </div>
                <span className={isMinLength ? 'text-emerald-400' : 'text-slate-400'}>
                  At least 8 characters
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] ${
                    isMatching
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-white/10 text-slate-500'
                  }`}
                >
                  {isMatching ? '✓' : '•'}
                </div>
                <span className={isMatching ? 'text-emerald-400' : 'text-slate-400'}>
                  Passwords match
                </span>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !isMinLength || !isMatching}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs tracking-wide transition-all shadow-lg shadow-purple-600/25 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  Updating Password...
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  Save New Password
                </>
              )}
            </button>

            <div className="text-center pt-2">
              <Link
                to="/login"
                className="text-xs text-slate-400 hover:text-white transition-colors"
              >
                Remembered your password? Sign In
              </Link>
            </div>
          </form>
        )}
      </div>

      <ForgotPasswordModal
        isOpen={isForgotModalOpen}
        onClose={() => setIsForgotModalOpen(false)}
      />
    </div>
  );
};

export default ResetPassword;
