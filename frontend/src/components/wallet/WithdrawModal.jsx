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

export const WithdrawModal = ({ isOpen, onClose }) => {
  const { walletBalance, withdrawFunds, savedPinHint } = useWallet();
  const [method, setMethod] = useState('upi'); // 'upi' | 'bank'
  const [amount, setAmount] = useState('');
  const [upiId, setUpiId] = useState('editor@okaxis');
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity"
        onClick={handleClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-md bg-[#0C111D] border border-white/10 rounded-2xl shadow-2xl p-6 sm:p-7 overflow-hidden z-10 animate-fade-in text-slate-100">
        {/* Glow ambient accent */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-5 right-5 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {successResult ? (
          /* Success Receipt View */
          <div className="text-center py-4 space-y-4">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-500/10">
              <CheckCircle2 className="w-7 h-7" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">Withdrawal Initiated!</h3>
              <p className="text-xs text-slate-400 mt-1">
                Your test funds are being transferred via simulated instant clearing.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-2.5 text-xs text-left">
              <div className="flex justify-between">
                <span className="text-slate-400">Amount Transferred</span>
                <span className="font-bold text-emerald-400 font-mono text-sm">
                  ₹{successResult.amount.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Destination</span>
                <span className="font-medium text-white">{successResult.method}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Settlement Mode</span>
                <span className="text-slate-300">Test Simulation (Instant UTR)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Date</span>
                <span className="text-slate-300">{successResult.date}</span>
              </div>
            </div>

            <button
              onClick={handleClose}
              className="w-full py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs tracking-wide transition-all shadow-md shadow-emerald-500/20"
            >
              Done & Return to Dashboard
            </button>
          </div>
        ) : (
          /* Withdrawal Form View */
          <form onSubmit={handleSubmit} className="space-y-4.5">
            {/* Header */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                <ArrowUpRight className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white tracking-tight">
                  Withdraw to Bank / UPI
                </h3>
                <p className="text-[11px] text-slate-400">
                  Cash out your cleared platform earnings instantly
                </p>
              </div>
            </div>

            {/* Available Balance Banner */}
            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-between text-xs">
              <span className="text-slate-400">Available to Withdraw</span>
              <span className="font-bold text-emerald-400 font-mono text-sm">
                ₹{maxAvailable.toLocaleString('en-IN')}
              </span>
            </div>

            {/* Payout Method Toggle */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-slate-300">Payout Method</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setMethod('upi')}
                  className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-medium border transition-all ${
                    method === 'upi'
                      ? 'bg-blue-600/15 border-blue-500/40 text-blue-400 font-bold'
                      : 'bg-white/[0.02] border-white/[0.06] text-slate-400 hover:text-white'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" /> Instant UPI
                </button>
                <button
                  type="button"
                  onClick={() => setMethod('bank')}
                  className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-medium border transition-all ${
                    method === 'bank'
                      ? 'bg-blue-600/15 border-blue-500/40 text-blue-400 font-bold'
                      : 'bg-white/[0.02] border-white/[0.06] text-slate-400 hover:text-white'
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5" /> Bank NEFT / IMPS
                </button>
              </div>
            </div>

            {/* Method Inputs */}
            {method === 'upi' ? (
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-slate-300">UPI ID / VPA</label>
                <input
                  type="text"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="yourname@okaxis"
                  className="w-full px-3.5 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-blue-500/60"
                  required
                />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-300">Account Number</label>
                  <input
                    type="text"
                    value={bankAccount}
                    onChange={(e) => setBankAccount(e.target.value)}
                    placeholder="12-digit number"
                    className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-blue-500/60"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-300">IFSC Code</label>
                  <input
                    type="text"
                    value={ifsc}
                    onChange={(e) => setIfsc(e.target.value.toUpperCase())}
                    placeholder="HDFC0001234"
                    className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs placeholder:text-slate-500 uppercase focus:outline-none focus:border-blue-500/60"
                    required
                  />
                </div>
              </div>
            )}

            {/* Amount Input & Quick Chips */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-medium text-slate-300">Amount (Credits / ₹)</label>
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleAmountChip(0.25)}
                    className="px-2 py-0.5 rounded text-[10px] bg-white/[0.05] hover:bg-white/[0.1] text-slate-300"
                  >
                    25%
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAmountChip(0.5)}
                    className="px-2 py-0.5 rounded text-[10px] bg-white/[0.05] hover:bg-white/[0.1] text-slate-300"
                  >
                    50%
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAmountChip(1.0)}
                    className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/15 text-emerald-400 font-bold hover:bg-emerald-500/25"
                  >
                    MAX
                  </button>
                </div>
              </div>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-sm">
                  ₹
                </span>
                <input
                  type="number"
                  min="50"
                  max={maxAvailable}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="1000"
                  className="w-full pl-8 pr-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white font-mono font-bold text-sm placeholder:text-slate-600 focus:outline-none focus:border-blue-500/60"
                  required
                />
              </div>
            </div>

            {/* 4-Digit Security PIN */}
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-medium text-slate-300 flex items-center gap-1">
                  <Lock className="w-3 h-3 text-amber-400" /> Enter 4-Digit Security PIN
                </label>
                <span className="text-[10px] text-amber-400/90 font-mono">
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
                    className="w-12 h-11 text-center font-mono font-bold text-lg bg-white/[0.05] border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500/80 transition-all"
                  />
                ))}
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
              disabled={loading || maxAvailable === 0}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold text-xs tracking-wide transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-950/20 border-t-slate-950 rounded-full animate-spin" />
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
  );
};

export default WithdrawModal;
