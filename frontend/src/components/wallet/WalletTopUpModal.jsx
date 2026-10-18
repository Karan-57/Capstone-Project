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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#3C2415]/40 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md p-6 border border-[#E5E0D7] rounded-3xl bg-white shadow-xl text-[#3C2415]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-[#77736D] hover:text-[#3C2415] hover:bg-[#F0EDE5] transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 pb-4 border-b border-[#E5E0D7] mb-5">
          <div className="w-10 h-10 rounded-xl bg-[#F0EDE5] border border-[#DDD9CE] flex items-center justify-center text-[#3C2415]">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-[#3C2415] tracking-tight">Top Up Wallet Credits</h3>
            <p className="text-xs text-[#77736D]">1 Platform Credit = ₹1.00 INR (Escrow Protected)</p>
          </div>
        </div>

        {/* Current Balance Bar */}
        <div className="p-3.5 rounded-xl bg-[#F0EDE5] border border-[#E5E0D7] mb-5 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-[#77736D] block">Available Balance</span>
            <span className="text-base font-bold text-[#3C2415] font-mono">
              ₹{walletBalance.toLocaleString('en-IN')}
            </span>
          </div>
          <div className="text-right">
            <span className="text-[11px] text-[#77736D] block">After Top-Up</span>
            <span className="text-base font-bold text-[#55745C] font-mono">
              ₹{(walletBalance + (activeAmount || 0)).toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        {/* Packages Grid */}
        <div className="space-y-2 mb-4">
          <label className="text-xs font-semibold text-[#3C2415]">Select Credit Package</label>
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
                      ? 'bg-[#3C2415] border-[#3C2415] text-[#F7F5F0]'
                      : 'bg-[#F0EDE5] border-[#E5E0D7] text-[#3C2415] hover:border-[#DDD9CE]'
                  }`}
                >
                  {pkg.popular && (
                    <span className="absolute -top-2 right-2 px-1.5 py-0.5 rounded-md bg-[#55745C] text-[9px] font-bold text-white tracking-wider uppercase">
                      Popular
                    </span>
                  )}
                  <span className={`text-[10px] font-medium block uppercase tracking-wider ${isSelected ? 'text-[#DDD9CE]' : 'text-[#77736D]'}`}>
                    {pkg.label}
                  </span>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="text-sm font-bold font-mono">₹{pkg.price.toLocaleString('en-IN')}</span>
                  </div>
                  <span className={`text-[11px] font-mono ${isSelected ? 'text-[#DDD9CE]' : 'text-[#6E7464]'}`}>
                    +{pkg.credits.toLocaleString()} Credits
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Custom Amount */}
        <div className="mb-5">
          <label className="text-[11px] text-[#77736D] mb-1 block">Or enter custom amount (₹)</label>
          <input
            type="number"
            min="100"
            step="100"
            placeholder="e.g. 7500"
            value={customAmount}
            onChange={(e) => setCustomAmount(e.target.value)}
            className="w-full px-3.5 py-2 text-xs rounded-xl bg-[#F0EDE5] text-[#3C2415] border border-[#E5E0D7] focus:outline-none focus:border-[#3C2415] font-mono"
          />
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5">
          <button
            type="button"
            disabled={isProcessing || !activeAmount || activeAmount <= 0}
            onClick={handlePayRazorpay}
            className="w-full py-2.5 rounded-xl text-xs font-semibold text-[#F7F5F0] bg-[#3C2415] hover:bg-[#2A180E] shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <CreditCard className="w-4 h-4" />
            {isProcessing ? 'Processing Gateway...' : `Pay ₹${(activeAmount || 0).toLocaleString('en-IN')} via Razorpay Test`}
          </button>

          <button
            type="button"
            onClick={handleInstantDemoFaucet}
            className="w-full py-2 rounded-xl text-xs font-medium text-[#3C2415] hover:bg-[#E5E0D7] bg-[#F0EDE5] border border-[#E5E0D7] transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Zap className="w-3.5 h-3.5 text-[#A17A43]" />
            ⚡ 1-Click Demo Faucet (+₹{(activeAmount || 5000).toLocaleString('en-IN')})
          </button>
        </div>

        {/* Trust Footnote */}
        <div className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-[#77736D]">
          <ShieldCheck className="w-3.5 h-3.5 text-[#55745C]" />
          <span>Encrypted with 256-bit TLS • Test Mode Enabled</span>
        </div>
      </div>
    </div>
  );
};

export default WalletTopUpModal;
