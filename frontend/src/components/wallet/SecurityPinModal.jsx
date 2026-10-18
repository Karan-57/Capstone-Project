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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#3C2415]/40 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-sm p-6 border border-[#E5E0D7] rounded-3xl bg-white shadow-xl text-[#3C2415]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-[#77736D] hover:text-[#3C2415] hover:bg-[#F0EDE5] transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Icon & Title */}
        <div className="flex flex-col items-center text-center mb-5">
          <div className="w-12 h-12 rounded-2xl bg-[#F0EDE5] border border-[#DDD9CE] flex items-center justify-center text-[#3C2415] mb-3">
            <Lock className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-[#3C2415] tracking-tight">
            {isSettingNewPin ? 'Set Your Transaction PIN' : actionTitle}
          </h3>
          <p className="text-xs text-[#77736D] mt-1 max-w-[280px]">
            {isSettingNewPin
              ? 'Choose a 4-digit PIN to protect and authorize all future escrow movements.'
              : actionDescription}
          </p>

          {/* Amount / Recipient Pill */}
          {amount && (
            <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#F0EDE5] border border-[#E5E0D7] text-xs">
              <span className="text-[#77736D] font-medium">Authorization Amount:</span>
              <span className="text-[#3C2415] font-bold font-mono">₹{Number(amount).toLocaleString('en-IN')}</span>
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
                className={`w-12 h-14 text-center text-xl font-bold rounded-xl bg-[#F0EDE5] border ${
                  error
                    ? 'border-[#A34F45] text-[#A34F45]'
                    : digit
                    ? 'border-[#3C2415] text-[#3C2415]'
                    : 'border-[#E5E0D7] text-[#3C2415]'
                } focus:outline-none focus:border-[#3C2415] focus:ring-1 focus:ring-[#3C2415] transition-all font-mono`}
              />
            ))}
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center justify-center gap-1.5 text-xs text-[#A34F45] text-center animate-shake">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Demo Hint Banner */}
          <div className="p-2.5 rounded-xl bg-[#F0EDE5] border border-[#E5E0D7] text-center">
            <p className="text-[11px] text-[#77736D]">
              💡 Demo Mode: <span className="text-[#3C2415] font-mono font-semibold">PIN is {savedPinHint || '1234'}</span>
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-2.5 rounded-xl text-xs font-semibold text-[#F7F5F0] bg-[#3C2415] hover:bg-[#2A180E] shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2"
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
