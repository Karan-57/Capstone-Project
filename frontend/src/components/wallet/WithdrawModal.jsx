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
        className="fixed inset-0 bg-[#3C2415]/40 backdrop-blur-sm transition-opacity"
        onClick={handleClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-md bg-white border border-[#E5E0D7] rounded-3xl shadow-xl p-6 sm:p-7 overflow-hidden z-10 animate-fade-in text-[#3C2415]">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-5 right-5 p-1.5 rounded-lg text-[#77736D] hover:text-[#3C2415] hover:bg-[#F0EDE5] transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {successResult ? (
          /* Success Receipt View */
          <div className="text-center py-4 space-y-4">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-[#55745C]/15 border border-[#55745C]/30 flex items-center justify-center text-[#55745C]">
              <CheckCircle2 className="w-7 h-7" />
            </div>

            <div>
              <h3 className="text-lg font-semibold text-[#3C2415] tracking-tight">Withdrawal Initiated!</h3>
              <p className="text-xs text-[#77736D] mt-1">
                Your test funds are being transferred via simulated instant clearing.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#F0EDE5] border border-[#E5E0D7] space-y-2.5 text-xs text-left">
              <div className="flex justify-between">
                <span className="text-[#77736D]">Amount Transferred</span>
                <span className="font-bold text-[#55745C] font-mono text-sm">
                  ₹{successResult.amount.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#77736D]">Destination</span>
                <span className="font-medium text-[#3C2415]">{successResult.method}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#77736D]">Settlement Mode</span>
                <span className="text-[#3C2415]">Test Simulation (Instant UTR)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#77736D]">Date</span>
                <span className="text-[#3C2415]">{successResult.date}</span>
              </div>
            </div>

            <button
              onClick={handleClose}
              className="w-full py-2.5 px-4 rounded-xl bg-[#3C2415] hover:bg-[#2A180E] text-[#F7F5F0] font-semibold text-xs tracking-wide transition-all shadow-sm"
            >
              Done & Return to Dashboard
            </button>
          </div>
        ) : (
          /* Withdrawal Form View */
          <form onSubmit={handleSubmit} className="space-y-4.5">
            {/* Header */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#F0EDE5] border border-[#DDD9CE] flex items-center justify-center text-[#55745C] shrink-0">
                <ArrowUpRight className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-[#3C2415] tracking-tight">
                  Withdraw to Bank / UPI
                </h3>
                <p className="text-[11px] text-[#77736D]">
                  Cash out your cleared platform earnings instantly
                </p>
              </div>
            </div>

            {/* Available Balance Banner */}
            <div className="p-3 rounded-xl bg-[#F0EDE5] border border-[#E5E0D7] flex items-center justify-between text-xs">
              <span className="text-[#77736D]">Available to Withdraw</span>
              <span className="font-bold text-[#55745C] font-mono text-sm">
                ₹{maxAvailable.toLocaleString('en-IN')}
              </span>
            </div>

            {/* Payout Method Toggle */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-[#3C2415]">Payout Method</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setMethod('upi')}
                  className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-medium border transition-all ${
                    method === 'upi'
                      ? 'bg-[#3C2415] border-[#3C2415] text-[#F7F5F0] font-semibold'
                      : 'bg-[#F0EDE5] border-[#E5E0D7] text-[#77736D] hover:text-[#3C2415]'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" /> Instant UPI
                </button>
                <button
                  type="button"
                  onClick={() => setMethod('bank')}
                  className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-medium border transition-all ${
                    method === 'bank'
                      ? 'bg-[#3C2415] border-[#3C2415] text-[#F7F5F0] font-semibold'
                      : 'bg-[#F0EDE5] border-[#E5E0D7] text-[#77736D] hover:text-[#3C2415]'
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5" /> Bank NEFT / IMPS
                </button>
              </div>
            </div>

            {/* Method Inputs */}
            {method === 'upi' ? (
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-[#3C2415]">UPI ID / VPA</label>
                <input
                  type="text"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="yourname@okaxis"
                  className="w-full px-3.5 py-2 rounded-xl bg-[#F0EDE5] border border-[#E5E0D7] text-[#3C2415] text-xs placeholder:text-[#77736D] focus:outline-none focus:border-[#3C2415]"
                  required
                />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-[#3C2415]">Account Number</label>
                  <input
                    type="text"
                    value={bankAccount}
                    onChange={(e) => setBankAccount(e.target.value)}
                    placeholder="12-digit number"
                    className="w-full px-3 py-2 rounded-xl bg-[#F0EDE5] border border-[#E5E0D7] text-[#3C2415] text-xs placeholder:text-[#77736D] focus:outline-none focus:border-[#3C2415]"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-[#3C2415]">IFSC Code</label>
                  <input
                    type="text"
                    value={ifsc}
                    onChange={(e) => setIfsc(e.target.value.toUpperCase())}
                    placeholder="HDFC0001234"
                    className="w-full px-3 py-2 rounded-xl bg-[#F0EDE5] border border-[#E5E0D7] text-[#3C2415] text-xs placeholder:text-[#77736D] uppercase focus:outline-none focus:border-[#3C2415]"
                    required
                  />
                </div>
              </div>
            )}

            {/* Amount Input & Quick Chips */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-medium text-[#3C2415]">Amount (Credits / ₹)</label>
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleAmountChip(0.25)}
                    className="px-2 py-0.5 rounded text-[10px] bg-[#F0EDE5] hover:bg-[#E5E0D7] text-[#3C2415] border border-[#E5E0D7]"
                  >
                    25%
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAmountChip(0.5)}
                    className="px-2 py-0.5 rounded text-[10px] bg-[#F0EDE5] hover:bg-[#E5E0D7] text-[#3C2415] border border-[#E5E0D7]"
                  >
                    50%
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAmountChip(1.0)}
                    className="px-2 py-0.5 rounded text-[10px] bg-[#55745C]/15 text-[#55745C] font-bold hover:bg-[#55745C]/25 border border-[#55745C]/25"
                  >
                    MAX
                  </button>
                </div>
              </div>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#77736D] font-mono text-sm">
                  ₹
                </span>
                <input
                  type="number"
                  min="50"
                  max={maxAvailable}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="1000"
                  className="w-full pl-8 pr-3.5 py-2.5 rounded-xl bg-[#F0EDE5] border border-[#E5E0D7] text-[#3C2415] font-mono font-bold text-sm placeholder:text-[#77736D] focus:outline-none focus:border-[#3C2415]"
                  required
                />
              </div>
            </div>

            {/* 4-Digit Security PIN */}
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-medium text-[#3C2415] flex items-center gap-1">
                  <Lock className="w-3 h-3 text-[#A17A43]" /> Enter 4-Digit Security PIN
                </label>
                <span className="text-[10px] text-[#A17A43] font-mono">
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
                    className="w-12 h-11 text-center font-mono font-bold text-lg bg-[#F0EDE5] border border-[#E5E0D7] rounded-xl text-[#3C2415] focus:outline-none focus:border-[#3C2415] transition-all"
                  />
                ))}
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-2.5 rounded-xl bg-[#A34F45]/10 border border-[#A34F45]/20 text-[#A34F45] text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || maxAvailable === 0}
              className="w-full py-2.5 px-4 rounded-xl bg-[#3C2415] hover:bg-[#2A180E] text-[#F7F5F0] font-semibold text-xs tracking-wide transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
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
