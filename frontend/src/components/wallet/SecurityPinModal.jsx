import React, { useState, useRef, useEffect } from 'react';
import { ShieldCheck, Lock, X, AlertCircle, Loader2 } from 'lucide-react';
import { useWallet } from '../../context/WalletContext';
import ModalPortal from '../common/ModalPortal';

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
  const [isVerifying, setIsVerifying] = useState(false);
  const inputRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];

  useEffect(() => {
    if (isOpen) {
      setPin(['', '', '', '']);
      setError('');
      setIsSettingNewPin(!hasTransactionPin);
      setIsVerifying(false);
      setTimeout(() => {
        inputRefs[0].current?.focus();
      }, 100);
    }
  }, [isOpen, hasTransactionPin]);

  if (!isOpen) return null;

  const handleInputChange = (index, value) => {
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isVerifying) return;
    const fullPin = pin.join('');

    if (fullPin.length !== 4) {
      setError('Please enter all 4 digits.');
      return;
    }

    setIsVerifying(true);
    try {
      if (isSettingNewPin) {
        if (setSecurityPin) await setSecurityPin(fullPin);
        setIsSettingNewPin(false);
        if (onSuccess) await onSuccess(fullPin);
        onClose();
        return;
      }

      const isValid = await verifySecurityPin(fullPin);
      if (isValid) {
        setError('');
        if (onSuccess) await onSuccess(fullPin);
        onClose();
      } else {
        setError(`Incorrect PIN. (Demo Hint: Default is ${savedPinHint || '1234'})`);
        setPin(['', '', '', '']);
        inputRefs[0].current?.focus();
      }
    } catch (err) {
      setError(err?.message || 'Verification failed. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <ModalPortal>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-sm my-auto max-h-[88vh] overflow-y-auto glass-card brutal-card p-6 border-2 border-[#382322] dark:border-[#FDEBDE]/30 rounded-2xl bg-[#FFF7F1] dark:bg-[#201413] shadow-[6px_6px_0_#382322]">
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isVerifying}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-[#261615] dark:text-[#FDEBDE] hover:bg-[#FFEBAA] border border-[#382322]/20 transition-colors cursor-pointer disabled:opacity-50"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Icon & Title */}
        <div className="flex flex-col items-center text-center mb-5">
          <div className="w-12 h-12 rounded-2xl bg-[#FFEBAA] border-2 border-[#382322] shadow-[2px_2px_0_#382322] flex items-center justify-center text-[#261615] mb-3">
            <Lock className="w-6 h-6" />
          </div>
          <h3 className="text-base font-black font-serif text-[#261615] dark:text-[#FDEBDE] tracking-tight">
            {isSettingNewPin ? 'Set Your Transaction PIN' : actionTitle}
          </h3>
          <p className="text-xs text-[#5C3A38] dark:text-[#D4B8A8] mt-1 max-w-[280px]">
            {isSettingNewPin
              ? 'Choose a 4-digit PIN to protect and authorize all future escrow movements.'
              : actionDescription}
          </p>

          {/* Amount / Recipient Pill */}
          {amount && (
            <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#FFEBAA] border-2 border-[#382322] text-xs font-mono font-bold text-[#261615] shadow-[1px_1px_0_#382322]">
              <span className="font-medium text-[#5C3A38]">Authorization:</span>
              <span className="font-black font-mono">₹{Number(amount).toLocaleString('en-IN')}</span>
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
                disabled={isVerifying}
                value={digit}
                onChange={(e) => handleInputChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                className={`w-12 h-14 text-center text-xl font-bold rounded-xl bg-white dark:bg-[#1A1110] border-2 ${
                  error
                    ? 'border-rose-500 text-rose-600'
                    : digit
                    ? 'border-[#382322] text-[#261615] dark:text-[#FDEBDE] shadow-[2px_2px_0_#382322]'
                    : 'border-[#382322]/30 dark:border-[#FDEBDE]/30 text-[#261615] dark:text-[#FDEBDE]'
                } focus:outline-none focus:ring-2 focus:ring-[#FFEBAA] transition-all font-mono disabled:opacity-50`}
              />
            ))}
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center justify-center gap-1.5 text-xs text-rose-600 dark:text-rose-400 font-mono text-center animate-shake">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Demo Hint Banner */}
          <div className="p-2.5 rounded-xl bg-[#FAF0E6] dark:bg-[#19100F] border border-[#382322]/20 text-center">
            <p className="text-[11px] text-[#5C3A38] dark:text-[#D4B8A8] font-mono">
              💡 Demo Mode: <span className="text-[#261615] dark:text-[#FFEBAA] font-mono font-bold">PIN is {savedPinHint || '1234'}</span>
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isVerifying}
            className="w-full py-2.5 rounded-xl text-xs font-mono font-bold text-[#261615] bg-[#FFEBAA] hover:bg-[#FFEBAA]/80 border-2 border-[#382322] shadow-[3px_3px_0_#382322] transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none"
          >
            {isVerifying ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Authorizing...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>{isSettingNewPin ? 'Save & Authorize' : 'Confirm & Authorize'}</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
    </ModalPortal>
  );
};

export default SecurityPinModal;