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
    <div className="min-h-screen bg-[#FFF7F1] dark:bg-[#19100F] text-[#261615] dark:text-[#FDEBDE] flex flex-col items-center justify-center p-4 relative overflow-hidden transition-colors">
      <SEO
        title="Reset Password | Collabo"
        description="Set a new secure password for your Collabo creator or editor account."
      />

      {/* Main Container Card */}
      <div className="w-full max-w-md bg-[#FFFDF9] dark:bg-[#201413] border-2 border-[#382322] dark:border-[#FDEBDE]/30 shadow-[8px_8px_0_#382322] dark:shadow-[8px_8px_0_#000] p-6 sm:p-8 relative z-10 animate-fade-in text-[#261615] dark:text-[#FDEBDE]">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <Link to="/" className="inline-block">
            <span className="text-2xl font-serif font-black tracking-tight text-[#261615] dark:text-[#FDEBDE]">
              Collabo<span className="text-[#8A5200] dark:text-[#FFEBAA]">.</span>
            </span>
          </Link>
        </div>

        {success ? (
          /* Success Screen */
          <div className="text-center py-4 space-y-4 animate-fade-in">
            <div className="w-16 h-16 mx-auto bg-[#FFEBAA] border-2 border-[#382322] shadow-[3px_3px_0_#382322] flex items-center justify-center text-[#261615]">
              <CheckCircle2 className="w-8 h-8 text-[#059669]" />
            </div>

            <div>
              <h2 className="text-xl font-serif font-bold text-[#261615] dark:text-[#FDEBDE] tracking-tight">
                Password Reset Complete!
              </h2>
              <p className="text-xs sm:text-sm text-[#5C3A38] dark:text-[#D4B8A8] mt-1.5 leading-relaxed font-sans">
                Your password has been successfully updated. All existing active sessions have
                been revoked for security.
              </p>
            </div>

            <button
              onClick={() => navigate('/login')}
              className="w-full py-3 px-4 bg-[#FFEBAA] hover:bg-[#ffe58f] text-[#261615] border-2 border-[#382322] shadow-[3px_3px_0_#382322] text-xs font-bold font-mono uppercase tracking-wider transition-all flex items-center justify-center gap-2 mt-4 cursor-pointer active:translate-x-0.5 active:translate-y-0.5"
            >
              <span>Sign In with New Password</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : !token ? (
          /* Missing Token Screen */
          <div className="text-center py-4 space-y-4">
            <div className="w-14 h-14 mx-auto bg-[#FFE4E6] dark:bg-[#881337] border-2 border-[#382322] flex items-center justify-center text-rose-600 dark:text-rose-300">
              <AlertCircle className="w-7 h-7" />
            </div>

            <div>
              <h2 className="text-lg font-serif font-bold text-[#261615] dark:text-[#FDEBDE] tracking-tight">
                Invalid or Missing Reset Link
              </h2>
              <p className="text-xs sm:text-sm text-[#5C3A38] dark:text-[#D4B8A8] mt-1.5 leading-relaxed font-sans">
                This password reset link is invalid or incomplete. Please request a new link from
                the login page.
              </p>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <button
                onClick={() => setIsForgotModalOpen(true)}
                className="w-full py-2.5 px-4 bg-[#FFEBAA] hover:bg-[#ffe58f] text-[#261615] border-2 border-[#382322] shadow-[3px_3px_0_#382322] text-xs font-bold font-mono uppercase tracking-wider transition-all cursor-pointer active:translate-x-0.5 active:translate-y-0.5"
              >
                Request New Reset Link
              </button>
              <Link
                to="/login"
                className="text-xs font-mono font-bold uppercase tracking-wider text-[#5C3A38] dark:text-[#D4B8A8] hover:text-[#261615] dark:hover:text-[#FDEBDE] transition-colors py-1 text-center"
              >
                Return to Login
              </Link>
            </div>
          </div>
        ) : (
          /* New Password Form Screen */
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#FFEBAA] border-2 border-[#382322] shadow-[2px_2px_0_#382322] flex items-center justify-center text-[#261615] shrink-0">
                <KeyRound className="w-5 h-5 text-[#261615]" />
              </div>
              <div>
                <h2 className="text-lg font-serif font-bold text-[#261615] dark:text-[#FDEBDE] tracking-tight">
                  Set New Password
                </h2>
                <p className="text-xs text-[#5C3A38] dark:text-[#D4B8A8] font-sans">
                  Choose a strong password with at least 8 characters
                </p>
              </div>
            </div>

            {/* New Password Input */}
            <div className="space-y-1">
              <label className="text-xs font-bold font-mono uppercase tracking-wider text-[#261615] dark:text-[#FDEBDE] block">
                New Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5C3A38] dark:text-[#D4B8A8]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  required
                  className="w-full pl-9 pr-10 py-2.5 bg-[#FFF7F1] dark:bg-[#19100F] border-2 border-[#382322] dark:border-[#FDEBDE]/30 text-[#261615] dark:text-[#FDEBDE] text-xs placeholder:text-[#5C3A38]/60 focus:outline-none shadow-[2px_2px_0_#382322]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5C3A38] dark:text-[#D4B8A8] hover:text-[#261615] dark:hover:text-[#FDEBDE]"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password Input */}
            <div className="space-y-1">
              <label className="text-xs font-bold font-mono uppercase tracking-wider text-[#261615] dark:text-[#FDEBDE] block">
                Confirm New Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5C3A38] dark:text-[#D4B8A8]" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your new password"
                  required
                  className="w-full pl-9 pr-10 py-2.5 bg-[#FFF7F1] dark:bg-[#19100F] border-2 border-[#382322] dark:border-[#FDEBDE]/30 text-[#261615] dark:text-[#FDEBDE] text-xs placeholder:text-[#5C3A38]/60 focus:outline-none shadow-[2px_2px_0_#382322]"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5C3A38] dark:text-[#D4B8A8] hover:text-[#261615] dark:hover:text-[#FDEBDE]"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Validation Feedback Indicators */}
            <div className="p-3 bg-[#FFF7F1] dark:bg-[#19100F] border-2 border-[#382322]/20 dark:border-[#FDEBDE]/20 space-y-1.5 text-xs font-sans">
              <div className="flex items-center gap-2">
                <div
                  className={`w-4 h-4 flex items-center justify-center text-[10px] font-bold border border-[#382322] ${
                    isMinLength
                      ? 'bg-[#D1FAE5] text-[#065F46]'
                      : 'bg-[#FAF0E6] text-[#5C3A38]'
                  }`}
                >
                  {isMinLength ? '✓' : '•'}
                </div>
                <span className={isMinLength ? 'text-[#065F46] dark:text-[#34D399] font-bold' : 'text-[#5C3A38] dark:text-[#D4B8A8]'}>
                  At least 8 characters
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className={`w-4 h-4 flex items-center justify-center text-[10px] font-bold border border-[#382322] ${
                    isMatching
                      ? 'bg-[#D1FAE5] text-[#065F46]'
                      : 'bg-[#FAF0E6] text-[#5C3A38]'
                  }`}
                >
                  {isMatching ? '✓' : '•'}
                </div>
                <span className={isMatching ? 'text-[#065F46] dark:text-[#34D399] font-bold' : 'text-[#5C3A38] dark:text-[#D4B8A8]'}>
                  Passwords match
                </span>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-2.5 bg-[#FFE4E6] dark:bg-[#881337] border-2 border-[#382322] text-[#9F1239] dark:text-[#FECDD3] text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !isMinLength || !isMatching}
              className="w-full py-2.5 px-4 bg-[#FFEBAA] hover:bg-[#ffe58f] text-[#261615] border-2 border-[#382322] shadow-[3px_3px_0_#382322] text-xs font-bold font-mono uppercase tracking-wider transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer active:translate-x-0.5 active:translate-y-0.5"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-[#261615] border-t-transparent animate-spin" />
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
                className="text-xs font-mono font-bold uppercase tracking-wider text-[#5C3A38] dark:text-[#D4B8A8] hover:text-[#261615] dark:hover:text-[#FDEBDE] transition-colors"
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
