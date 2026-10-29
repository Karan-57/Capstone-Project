import React, { useState } from 'react';
import {
  X,
  ArrowUpRight,
  ShieldCheck,
  Building2,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  Lock,
  Sparkles,
} from 'lucide-react';
import { useWallet } from '../../context/WalletContext';
import ModalPortal from '../common/ModalPortal';

export const WithdrawModal = ({ isOpen, onClose }) => {
  const { walletBalance, withdrawFunds, savedPinHint } = useWallet();
  const [method, setMethod] = useState('upi'); // 'upi' | 'bank'
  const [amount, setAmount] = useState('');
  const [upiId, setUpiId] = useState('user@okaxis');
  const [bankAccount, setBankAccount] = useState('987654321012');
  const [ifsc, setIfsc] = useState('HDFC0001234');
  const [pin, setPin] = useState(['1', '2', '3', '4']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successResult, setSuccessResult] = useState(null);

  if (!isOpen) return null;

  const numericAmount = Number(amount);
  const maxAvailable = walletBalance || 0;

  const handleAmountChip = (pct) => {
    const val = Math.floor(maxAvailable * pct);
    setAmount(String(val));
    setError('');
  };

  const handlePinChange = (idx, val) => {
    const cleaned = val.replace(/[^0-9]/g, '').slice(-1);
    const newPin = [...pin];
    newPin[idx] = cleaned;
    setPin(newPin);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!numericAmount || numericAmount <= 0) {
      return setError('Please enter a valid withdrawal amount.');
    }
    if (numericAmount > maxAvailable) {
      return setError(`Amount exceeds available balance of ₹${maxAvailable.toLocaleString('en-IN')}`);
    }
    if (numericAmount < 50) {
      return setError('Minimum withdrawal is ₹50 (50 credits).');
    }

    const fullPin = pin.join('');
    if (fullPin.length !== 4) {
      return setError('Please enter your 4-digit security PIN.');
    }

    setLoading(true);
    setError('');

    try {
      const ok = await withdrawFunds({
        amount: numericAmount,
        pin: fullPin,
        upiId: method === 'upi' ? upiId : null,
        bankAccountNumber: method === 'bank' ? bankAccount : null,
        ifscCode: method === 'bank' ? ifsc : null,
      });

      if (ok) {
        setSuccessResult({
          amount: numericAmount,
          method: method === 'upi' ? `UPI: ${upiId}` : `Bank: ••••${bankAccount.slice(-4)} (${ifsc})`,
          date: new Date().toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          }),
        });
      }
    } catch (err) {
      setError(err.message || 'Withdrawal failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSuccessResult(null);
    setAmount('');
    setError('');
    onClose();
  };

  return (
    <ModalPortal>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={handleClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-md my-auto max-h-[88vh] overflow-y-auto bg-[#FFF7F1] dark:bg-[#201413] border-2 border-[#382322] dark:border-[#FDEBDE]/30 rounded-2xl shadow-[6px_6px_0_#382322] p-6 sm:p-7 z-10 animate-fade-in text-[#261615] dark:text-[#FDEBDE]">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-5 right-5 p-1.5 rounded-lg text-[#261615] dark:text-[#FDEBDE] hover:bg-[#FFEBAA] border border-[#382322]/20 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {successResult ? (
          /* Success Receipt View */
          <div className="text-center py-4 space-y-4">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 border-2 border-emerald-600/40 flex items-center justify-center text-emerald-800 dark:text-emerald-300 shadow-[2px_2px_0_#382322]">
              <CheckCircle2 className="w-7 h-7" />
            </div>

            <div>
              <h3 className="text-lg font-black font-serif text-[#261615] dark:text-[#FDEBDE] tracking-tight">Withdrawal Initiated!</h3>
              <p className="text-xs text-[#5C3A38] dark:text-[#D4B8A8] mt-1">
                Your test funds are being transferred via simulated instant clearing.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#FAF0E6] dark:bg-[#19100F] border-2 border-[#382322]/20 dark:border-[#FDEBDE]/20 space-y-2.5 text-xs text-left">
              <div className="flex justify-between">
                <span className="text-[#5C3A38] dark:text-[#D4B8A8] font-mono font-bold">Amount Transferred</span>
                <span className="font-black text-emerald-700 dark:text-emerald-400 font-mono text-sm">
                  ₹{successResult.amount.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#5C3A38] dark:text-[#D4B8A8] font-mono font-bold">Destination</span>
                <span className="font-bold text-[#261615] dark:text-[#FDEBDE]">{successResult.method}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#5C3A38] dark:text-[#D4B8A8] font-mono font-bold">Settlement Mode</span>
                <span className="text-[#261615] dark:text-[#FDEBDE] font-mono">Test Simulation (Instant UTR)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#5C3A38] dark:text-[#D4B8A8] font-mono font-bold">Date</span>
                <span className="text-[#261615] dark:text-[#FDEBDE] font-mono">{successResult.date}</span>
              </div>
            </div>

            <button
              onClick={handleClose}
              className="w-full py-2.5 px-4 rounded-xl bg-[#FFEBAA] hover:bg-[#FFEBAA]/80 text-[#261615] font-mono font-bold text-xs tracking-wide transition-all border-2 border-[#382322] shadow-[3px_3px_0_#382322]"
            >
              Done & Return to Dashboard
            </button>
          </div>
        ) : (
          /* Withdrawal Form View */
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Header */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#FFEBAA] border-2 border-[#382322] shadow-[2px_2px_0_#382322] flex items-center justify-center text-[#261615] shrink-0">
                <ArrowUpRight className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black font-serif text-[#261615] dark:text-[#FDEBDE] tracking-tight">
                  Withdraw to Bank / UPI
                </h3>
                <p className="text-[11px] text-[#5C3A38] dark:text-[#D4B8A8]">
                  Cash out your available platform wallet credits instantly
                </p>
              </div>
            </div>

            {/* Available Balance Banner */}
            <div className="p-3 rounded-xl bg-[#FAF0E6] dark:bg-[#19100F] border-2 border-[#382322]/20 dark:border-[#FDEBDE]/20 flex items-center justify-between text-xs">
              <span className="text-[#5C3A38] dark:text-[#D4B8A8] font-mono font-bold">Available to Withdraw</span>
              <span className="font-black text-emerald-700 dark:text-emerald-400 font-mono text-sm">
                ₹{maxAvailable.toLocaleString('en-IN')}
              </span>
            </div>

            {/* Payout Method Toggle */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-mono font-bold text-[#261615] dark:text-[#FDEBDE]">Payout Method</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setMethod('upi')}
                  className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-mono font-bold border-2 transition-all ${
                    method === 'upi'
                      ? 'bg-[#FFEBAA] border-[#382322] text-[#261615] shadow-[2px_2px_0_#382322]'
                      : 'bg-white dark:bg-[#1A1110] border-[#382322]/30 dark:border-[#FDEBDE]/30 text-[#5C3A38] dark:text-[#D4B8A8]'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" /> Instant UPI
                </button>
                <button
                  type="button"
                  onClick={() => setMethod('bank')}
                  className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-mono font-bold border-2 transition-all ${
                    method === 'bank'
                      ? 'bg-[#FFEBAA] border-[#382322] text-[#261615] shadow-[2px_2px_0_#382322]'
                      : 'bg-white dark:bg-[#1A1110] border-[#382322]/30 dark:border-[#FDEBDE]/30 text-[#5C3A38] dark:text-[#D4B8A8]'
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5" /> Bank NEFT / IMPS
                </button>
              </div>
            </div>

            {/* Method Inputs */}
            {method === 'upi' ? (
              <div className="space-y-1">
                <label className="text-[11px] font-mono font-bold text-[#261615] dark:text-[#FDEBDE]">UPI ID / VPA</label>
                <input
                  type="text"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="yourname@okaxis"
                  className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-[#1A1110] border-2 border-[#382322] dark:border-[#FDEBDE]/30 text-[#261615] dark:text-[#FDEBDE] font-mono text-xs focus:outline-none focus:ring-2 focus:ring-[#FFEBAA]"
                  required
                />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[11px] font-mono font-bold text-[#261615] dark:text-[#FDEBDE]">Account Number</label>
                  <input
                    type="text"
                    value={bankAccount}
                    onChange={(e) => setBankAccount(e.target.value)}
                    placeholder="12-digit number"
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#1A1110] border-2 border-[#382322] dark:border-[#FDEBDE]/30 text-[#261615] dark:text-[#FDEBDE] font-mono text-xs focus:outline-none focus:ring-2 focus:ring-[#FFEBAA]"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-mono font-bold text-[#261615] dark:text-[#FDEBDE]">IFSC Code</label>
                  <input
                    type="text"
                    value={ifsc}
                    onChange={(e) => setIfsc(e.target.value.toUpperCase())}
                    placeholder="HDFC0001234"
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#1A1110] border-2 border-[#382322] dark:border-[#FDEBDE]/30 text-[#261615] dark:text-[#FDEBDE] uppercase font-mono text-xs focus:outline-none focus:ring-2 focus:ring-[#FFEBAA]"
                    required
                  />
                </div>
              </div>
            )}

            {/* Amount Input & Quick Chips */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-mono font-bold text-[#261615] dark:text-[#FDEBDE]">Amount (Credits / ₹)</label>
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleAmountChip(0.25)}
                    className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#FAF0E6] dark:bg-[#261817] hover:bg-[#FFEBAA] text-[#261615] dark:text-[#FDEBDE] border border-[#382322]/20"
                  >
                    25%
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAmountChip(0.5)}
                    className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#FAF0E6] dark:bg-[#261817] hover:bg-[#FFEBAA] text-[#261615] dark:text-[#FDEBDE] border border-[#382322]/20"
                  >
                    50%
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAmountChip(1.0)}
                    className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#FFEBAA] text-[#261615] border border-[#382322] shadow-[1px_1px_0_#382322]"
                  >
                    MAX
                  </button>
                </div>
              </div>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#261615] dark:text-[#FDEBDE] font-mono text-sm font-bold">
                  ₹
                </span>
                <input
                  type="number"
                  min="50"
                  max={maxAvailable}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="1000"
                  className="w-full pl-8 pr-3.5 py-2.5 rounded-xl bg-white dark:bg-[#1A1110] border-2 border-[#382322] dark:border-[#FDEBDE]/30 text-[#261615] dark:text-[#FDEBDE] font-mono font-bold text-sm focus:outline-none focus:ring-2 focus:ring-[#FFEBAA]"
                  required
                />
              </div>
            </div>

            {/* 4-Digit Security PIN */}
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-mono font-bold text-[#261615] dark:text-[#FDEBDE] flex items-center gap-1">
                  <Lock className="w-3 h-3 text-[#261615] dark:text-[#FFEBAA]" /> Enter 4-Digit Security PIN
                </label>
                <span className="text-[10px] text-[#5C3A38] dark:text-[#D4B8A8] font-mono">
                  Demo PIN: {savedPinHint || '1234'}
                </span>
              </div>
              <div className="flex gap-2 justify-center">
                {pin.map((digit, idx) => (
                  <input
                    key={idx}
                    id={`withdraw-pin-${idx}`}
                    type="password"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => {
                      handlePinChange(idx, e.target.value);
                      if (e.target.value && idx < 3) {
                        document.getElementById(`withdraw-pin-${idx + 1}`)?.focus();
                      }
                    }}
                    className="w-12 h-11 text-center font-mono font-bold text-lg bg-white dark:bg-[#1A1110] border-2 border-[#382322] dark:border-[#FDEBDE]/30 rounded-xl text-[#261615] dark:text-[#FDEBDE] focus:outline-none focus:ring-2 focus:ring-[#FFEBAA] transition-all"
                  />
                ))}
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-2.5 rounded-xl bg-rose-500/10 border-2 border-rose-500 text-rose-600 dark:text-rose-400 text-xs font-mono flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || maxAvailable === 0}
              className="w-full py-2.5 px-4 rounded-xl bg-[#FFEBAA] hover:bg-[#FFEBAA]/80 text-[#261615] font-mono font-bold text-xs tracking-wide transition-all border-2 border-[#382322] shadow-[3px_3px_0_#382322] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-[#261615]/20 border-t-[#261615] rounded-full animate-spin" />
                  Processing Simulated Payout...
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  Confirm & Transfer ₹{numericAmount ? numericAmount.toLocaleString('en-IN') : '0'}
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
    </ModalPortal>
  );
};

export default WithdrawModal;
