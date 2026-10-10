import React, { useState } from 'react';
import { Mail, X, CheckCircle2, AlertCircle, ArrowLeft, Send } from 'lucide-react';
import api from '../../services/api';

export const ForgotPasswordModal = ({ isOpen, onClose, initialEmail = '' }) => {
  const [email, setEmail] = useState(initialEmail);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSent, setIsSent] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      return setError('Please enter your email address.');
    }

    setLoading(true);
    setError('');

    try {
      await api.post('/api/auth/forgot-password', {
        email: email.trim().toLowerCase(),
      });
      setIsSent(true);
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to send reset link. Please try again later.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setIsSent(false);
    setError('');
  };

  const handleClose = () => {
    setIsSent(false);
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity"
        onClick={handleClose}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-md bg-[#0C111D] border border-white/10 rounded-2xl shadow-2xl p-6 sm:p-7 overflow-hidden z-10 animate-fade-in text-slate-100">
        {/* Glow Ambient Accent */}
        <div className="absolute top-0 right-0 w-44 h-44 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-5 right-5 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {isSent ? (
          /* Confirmation Sent View */
          <div className="text-center py-3 space-y-4 animate-fade-in">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-lg shadow-indigo-500/10">
              <CheckCircle2 className="w-7 h-7" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">
                Reset Link Sent!
              </h3>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                If an account exists for{' '}
                <strong className="text-white font-medium">{email}</strong>, a password
                reset link has been sent to your inbox.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-xs text-slate-400 text-left space-y-1">
              <p className="text-slate-300 font-medium">Important notes:</p>
              <ul className="list-disc pl-4 space-y-0.5 text-[11px]">
                <li>The link will expire in <strong>15 minutes</strong>.</li>
                <li>Check your spam or junk folder if you don't see it.</li>
              </ul>
            </div>

            <div className="flex flex-col gap-2 pt-1">
              <button
                type="button"
                onClick={handleClose}
                className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs tracking-wide transition-all shadow-md shadow-indigo-600/20"
              >
                Back to Sign In
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="text-xs text-slate-400 hover:text-white transition-colors py-1"
              >
                Try a different email
              </button>
            </div>
          </div>
        ) : (
          /* Request Form View */
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-500/25 flex items-center justify-center text-indigo-400 shrink-0">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white tracking-tight">
                  Forgot Password?
                </h3>
                <p className="text-[11px] text-slate-400">
                  Enter your email address and we'll send a secure reset link
                </p>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-slate-300">
                Registered Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  autoFocus
                  required
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-indigo-500/70"
                />
              </div>
            </div>

            {error && (
              <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs tracking-wide transition-all shadow-lg shadow-indigo-600/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  Sending Reset Link...
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  Send Reset Link
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleClose}
              className="w-full flex items-center justify-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors pt-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordModal;
