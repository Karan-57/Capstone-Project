import React, { useState } from 'react';
import { CreditCard, Sparkles, X, Check, ArrowRight, Zap, ShieldCheck } from 'lucide-react';
import { useWallet } from '../../context/WalletContext';
import { useAuth } from '../../context/AuthContext';
import { paymentService } from '../../services/paymentService';

export const WalletTopUpModal = ({ isOpen, onClose }) => {
  const { walletBalance, topUpWallet } = useWallet();
  const { currentUser } = useAuth();
  const [selectedPackage, setSelectedPackage] = useState(5000);
  const [customAmount, setCustomAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const packages = [
    { credits: 1000, price: 1000, popular: false, label: 'Starter' },
    { credits: 2500, price: 2500, popular: false, label: 'Creator' },
    { credits: 5000, price: 5000, popular: true, label: 'Pro Pack' },
    { credits: 10000, price: 10000, popular: false, label: 'Enterprise' },
  ];

  const activeAmount = customAmount ? Number(customAmount) : selectedPackage;

  const handlePayRazorpay = async () => {
    if (!activeAmount || activeAmount <= 0) return;
    setIsProcessing(true);

    try {
      // 1. Request test order from backend API via paymentService
      const orderRes = await paymentService.createOrder(activeAmount);
      const { orderId, keyId, currency } = orderRes || {};

      // 2. Dynamically load official Razorpay SDK on-demand
      await paymentService.loadRazorpaySdk();

      // 3. Open official Razorpay modal if SDK loaded in window
      if (typeof window.Razorpay === 'function') {
        const options = {
          key: keyId,
          amount: activeAmount * 100,
          currency: currency || 'INR',
          name: 'Collabo Platform',
          description: `Top-up ${activeAmount.toLocaleString('en-IN')} Platform Credits (1 Credit = ₹1)`,
          order_id: orderId,
          handler: async function (response) {
            await topUpWallet(activeAmount, 'RAZORPAY_TEST', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            setIsProcessing(false);
            onClose();
          },
          prefill: {
            name: currentUser?.name || 'Creator Client',
            email: currentUser?.email || 'creator@example.com',
            contact: '9999999999',
          },
          theme: {
            color: '#9333ea',
          },
        };
        const rzp = new window.Razorpay(options);
        rzp.open();
        return;
      }
    } catch (err) {
      console.warn('Backend order creation warning, using simulated fallback:', err.message);
    }

    // 3. Graceful simulation fallback for demo
    setTimeout(async () => {
      await topUpWallet(activeAmount, 'RAZORPAY_TEST');
      setIsProcessing(false);
      onClose();
    }, 900);
  };

  const handleInstantDemoFaucet = () => {
    topUpWallet(activeAmount || 5000, 'DEMO_FAUCET');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md glass-card p-6 border border-white/[0.12] rounded-2xl bg-[#0B0E17]/95 shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 pb-4 border-b border-white/[0.08] mb-5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500/20 to-purple-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">Top Up Wallet Credits</h3>
            <p className="text-xs text-slate-400">1 Platform Credit = ₹1.00 INR (Escrow Protected)</p>
          </div>
        </div>

        {/* Current Balance Bar */}
        <div className="p-3.5 rounded-xl bg-[#141A28] border border-white/[0.06] mb-5 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 block">Available Balance</span>
            <span className="text-base font-bold text-white font-mono">
              ₹{walletBalance.toLocaleString('en-IN')}
            </span>
          </div>
          <div className="text-right">
            <span className="text-[11px] text-slate-400 block">After Top-Up</span>
            <span className="text-base font-bold text-emerald-400 font-mono">
              ₹{(walletBalance + (activeAmount || 0)).toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        {/* Packages Grid */}
        <div className="space-y-2 mb-4">
          <label className="text-xs font-semibold text-slate-300">Select Credit Package</label>
          <div className="grid grid-cols-2 gap-2.5">
            {packages.map((pkg) => {
              const isSelected = selectedPackage === pkg.credits && !customAmount;
              return (
                <div
                  key={pkg.credits}
                  onClick={() => {
                    setSelectedPackage(pkg.credits);
                    setCustomAmount('');
                  }}
                  className={`p-3 rounded-xl border cursor-pointer transition-all relative ${
                    isSelected
                      ? 'bg-purple-900/30 border-purple-500 ring-1 ring-purple-500/40 text-white'
                      : 'bg-[#121622] border-white/[0.06] text-slate-300 hover:border-white/20'
                  }`}
                >
                  {pkg.popular && (
                    <span className="absolute -top-2 right-2 px-1.5 py-0.5 rounded-md bg-purple-600 text-[9px] font-bold text-white tracking-wider uppercase">
                      Popular
                    </span>
                  )}
                  <span className="text-[10px] text-slate-400 font-medium block uppercase tracking-wider">
                    {pkg.label}
                  </span>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="text-sm font-bold font-mono">₹{pkg.price.toLocaleString('en-IN')}</span>
                  </div>
                  <span className="text-[11px] text-purple-300 font-mono">
                    +{pkg.credits.toLocaleString()} Credits
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Custom Amount */}
        <div className="mb-5">
          <label className="text-[11px] text-slate-400 mb-1 block">Or enter custom amount (₹)</label>
          <input
            type="number"
            min="100"
            step="100"
            placeholder="e.g. 7500"
            value={customAmount}
            onChange={(e) => setCustomAmount(e.target.value)}
            className="w-full px-3.5 py-2 text-xs rounded-xl bg-[#141A28] text-white border border-white/[0.08] focus:outline-none focus:border-purple-500 font-mono"
          />
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5">
          <button
            type="button"
            disabled={isProcessing || !activeAmount || activeAmount <= 0}
            onClick={handlePayRazorpay}
            className="w-full py-2.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-500 hover:from-purple-500 hover:to-indigo-500 shadow-md shadow-purple-900/40 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <CreditCard className="w-4 h-4" />
            {isProcessing ? 'Processing Gateway...' : `Pay ₹${(activeAmount || 0).toLocaleString('en-IN')} via Razorpay Test`}
          </button>

          <button
            type="button"
            onClick={handleInstantDemoFaucet}
            className="w-full py-2 rounded-xl text-xs font-medium text-amber-300 hover:text-amber-200 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            ⚡ 1-Click Demo Faucet (+₹{(activeAmount || 5000).toLocaleString('en-IN')})
          </button>
        </div>

        {/* Trust Footnote */}
        <div className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-slate-500">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Encrypted with 256-bit TLS • Test Mode Enabled</span>
        </div>
      </div>
    </div>
  );
};

export default WalletTopUpModal;
