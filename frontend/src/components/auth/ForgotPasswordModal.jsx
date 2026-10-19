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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 text-[#261615] dark:text-[#FDEBDE]">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={handleClose}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-md bg-[#FFFDF9] dark:bg-[#201413] border-2 border-[#382322] dark:border-[#FDEBDE]/30 shadow-[8px_8px_0_#382322] dark:shadow-[8px_8px_0_#000] p-6 sm:p-7 overflow-hidden z-10 animate-fade-in">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-5 right-5 p-1.5 border-2 border-[#382322] dark:border-[#FDEBDE]/30 bg-[#FFF7F1] dark:bg-[#19100F] text-[#261615] dark:text-[#FDEBDE] hover:bg-[#FDEBDE] transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {isSent ? (
          /* Confirmation Sent View */
          <div className="text-center py-3 space-y-4 animate-fade-in">
            <div className="w-14 h-14 mx-auto bg-[#FFEBAA] border-2 border-[#382322] shadow-[3px_3px_0_#382322] flex items-center justify-center text-[#261615]">
              <CheckCircle2 className="w-7 h-7 text-[#059669]" />
            </div>

            <div>
              <h3 className="text-xl font-serif font-bold text-[#261615] dark:text-[#FDEBDE] tracking-tight">
                Reset Link Sent!
              </h3>
              <p className="text-xs sm:text-sm text-[#5C3A38] dark:text-[#D4B8A8] mt-1.5 leading-relaxed font-sans">
                If an account exists for{' '}
                <strong className="text-[#261615] dark:text-[#FDEBDE] font-bold underline decoration-[#FFEBAA]">{email}</strong>, a password
                reset link has been sent to your inbox.
              </p>
            </div>

            <div className="p-3.5 bg-[#FFF7F1] dark:bg-[#19100F] border-2 border-[#382322]/20 dark:border-[#FDEBDE]/20 text-xs text-[#5C3A38] dark:text-[#D4B8A8] text-left space-y-1 font-sans">
              <p className="text-[#261615] dark:text-[#FDEBDE] font-bold">Important notes:</p>
              <ul className="list-disc pl-4 space-y-0.5 text-xs">
                <li>The link will expire in <strong className="text-[#261615] dark:text-[#FDEBDE]">15 minutes</strong>.</li>
                <li>Check your spam or junk folder if you don't see it.</li>
              </ul>
            </div>

            <div className="flex flex-col gap-2 pt-1">
              <button
                type="button"
                onClick={handleClose}
                className="w-full py-2.5 px-4 bg-[#FFEBAA] hover:bg-[#ffe58f] text-[#261615] border-2 border-[#382322] shadow-[3px_3px_0_#382322] text-xs font-bold font-mono uppercase tracking-wider transition-all cursor-pointer active:translate-x-0.5 active:translate-y-0.5"
              >
                Back to Sign In
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="text-xs font-mono font-bold uppercase tracking-wider text-[#5C3A38] dark:text-[#D4B8A8] hover:text-[#261615] dark:hover:text-[#FDEBDE] transition-colors py-1 cursor-pointer"
              >
                Try a different email
              </button>
            </div>
          </div>
        ) : (
          /* Request Form View */
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#FFEBAA] border-2 border-[#382322] shadow-[2px_2px_0_#382322] flex items-center justify-center text-[#261615] shrink-0">
                <Mail className="w-5 h-5 text-[#261615]" />
              </div>
              <div>
                <h3 className="text-lg font-serif font-bold text-[#261615] dark:text-[#FDEBDE] tracking-tight">
                  Forgot Password?
                </h3>
                <p className="text-xs text-[#5C3A38] dark:text-[#D4B8A8] font-sans">
                  Enter your email address and we'll send a secure reset link
                </p>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold font-mono uppercase tracking-wider text-[#261615] dark:text-[#FDEBDE] block">
                Registered Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5C3A38] dark:text-[#D4B8A8]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  autoFocus
                  required
                  className="w-full pl-9 pr-3.5 py-2.5 bg-[#FFF7F1] dark:bg-[#19100F] border-2 border-[#382322] dark:border-[#FDEBDE]/30 text-[#261615] dark:text-[#FDEBDE] text-xs placeholder:text-[#5C3A38]/60 focus:outline-none shadow-[2px_2px_0_#382322]"
                />
              </div>
            </div>

            {error && (
              <div className="p-2.5 bg-[#FFE4E6] dark:bg-[#881337] border-2 border-[#382322] text-[#9F1239] dark:text-[#FECDD3] text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-[#FFEBAA] hover:bg-[#ffe58f] text-[#261615] border-2 border-[#382322] shadow-[3px_3px_0_#382322] text-xs font-bold font-mono uppercase tracking-wider transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer active:translate-x-0.5 active:translate-y-0.5"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-[#261615] border-t-transparent animate-spin" />
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
              className="w-full flex items-center justify-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider text-[#5C3A38] dark:text-[#D4B8A8] hover:text-[#261615] dark:hover:text-[#FDEBDE] transition-colors pt-1 cursor-pointer"
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
