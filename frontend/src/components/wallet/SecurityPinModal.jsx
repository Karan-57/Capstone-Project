import React, { useState, useRef, useEffect } from 'react';
import { ShieldCheck, Lock, X, KeyRound, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useWallet } from '../../context/WalletContext';

export const SecurityPinModal = ({
  isOpen,
  onClose,
  onSuccess,
  actionTitle = 'Authorize Transaction',
  actionDescription = 'Enter your 4-digit Security PIN to confirm this financial operation.',
  amount = null,
  recipient = null,
}) => {
  const { verifySecurityPin, setSecurityPin, hasTransactionPin, savedPinHint } = useWallet();
  const [pin, setPin] = useState(['', '', '', '']);
  const [error, setError] = useState('');
  const [isSettingNewPin, setIsSettingNewPin] = useState(!hasTransactionPin);
  const inputRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];

  useEffect(() => {
    if (isOpen) {
      setPin(['', '', '', '']);
      setError('');
      setIsSettingNewPin(!hasTransactionPin);
      setTimeout(() => {
        inputRefs[0].current?.focus();
      }, 100);
    }
  }, [isOpen, hasTransactionPin]);

  if (!isOpen) return null;

  const handleInputChange = (index, value) => {
    // Only accept numeric single digit
    const cleaned = value.replace(/[^0-9]/g, '');
    if (!cleaned && value !== '') return;

    const char = cleaned.slice(-1);
    const newPin = [...pin];
    newPin[index] = char;
    setPin(newPin);
    setError('');

    if (char && index < 3) {
      inputRefs[index + 1].current?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const fullPin = pin.join('');

    if (fullPin.length !== 4) {
      setError('Please enter all 4 digits.');
      return;
    }

    if (isSettingNewPin) {
      setSecurityPin(fullPin);
      setIsSettingNewPin(false);
      if (onSuccess) onSuccess(fullPin);
      onClose();
      return;
    }

    if (verifySecurityPin(fullPin)) {
      setError('');
      if (onSuccess) onSuccess(fullPin);
      onClose();
    } else {
      setError(`Incorrect PIN. (Demo Hint: Default is ${savedPinHint || '1234'})`);
      setPin(['', '', '', '']);
      inputRefs[0].current?.focus();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-sm glass-card p-6 border border-white/[0.12] rounded-2xl bg-[#0B0E17]/95 shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Icon & Title */}
        <div className="flex flex-col items-center text-center mb-5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600/30 to-indigo-600/30 border border-purple-500/40 flex items-center justify-center text-purple-400 mb-3 shadow-lg shadow-purple-900/30">
            <Lock className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white tracking-tight">
            {isSettingNewPin ? 'Set Your Transaction PIN' : actionTitle}
          </h3>
          <p className="text-xs text-slate-400 mt-1 max-w-[280px]">
            {isSettingNewPin
              ? 'Choose a 4-digit PIN to protect and authorize all future escrow movements.'
              : actionDescription}
          </p>

          {/* Amount / Recipient Pill */}
          {amount && (
            <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-purple-900/30 border border-purple-500/30 text-xs">
              <span className="text-purple-300 font-medium">Authorization Amount:</span>
              <span className="text-white font-bold font-mono">₹{Number(amount).toLocaleString('en-IN')}</span>
            </div>
          )}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="flex items-center justify-center gap-3">
            {pin.map((digit, idx) => (
              <input
                key={idx}
                ref={inputRefs[idx]}
                type="password"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleInputChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                className={`w-12 h-14 text-center text-xl font-bold rounded-xl bg-[#141A28] border ${
                  error
                    ? 'border-rose-500/60 ring-1 ring-rose-500/40 text-rose-300'
                    : digit
                    ? 'border-purple-500 ring-1 ring-purple-500/30 text-white'
                    : 'border-white/[0.1] text-slate-300'
                } focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 transition-all font-mono`}
              />
            ))}
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center justify-center gap-1.5 text-xs text-rose-400 text-center animate-shake">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Demo Hint Banner */}
          <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-center">
            <p className="text-[11px] text-slate-400">
              💡 Demo Mode: <span className="text-purple-300 font-mono font-semibold">PIN is {savedPinHint || '1234'}</span>
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-2.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-md shadow-purple-900/40 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <ShieldCheck className="w-4 h-4" />
            {isSettingNewPin ? 'Save & Authorize' : 'Confirm & Authorize'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SecurityPinModal;
