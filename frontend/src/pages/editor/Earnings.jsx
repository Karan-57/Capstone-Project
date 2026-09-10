import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { ShieldCheck, Download, CheckCircle2, X } from 'lucide-react';
import Button from '../../components/common/Button';
import { editorEarningsData } from '../../services/paymentService';

export const Earnings = () => {
  const location = useLocation();
  const [availableBalance, setAvailableBalance] = useState(58500);
  const [payouts, setPayouts] = useState(editorEarningsData.recentPayouts);
  const [showWithdrawModal, setShowWithdrawModal] = useState(() => location.search.includes('withdraw=true'));
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('25000');
  const [selectedBank, setSelectedBank] = useState('HDFC Bank •••• 4029');
  const [withdrawSuccess, setWithdrawSuccess] = useState(false);

  useEffect(() => {
    if (location.search.includes('withdraw=true')) {
      const timer = setTimeout(() => setShowWithdrawModal(true), 0);
      return () => clearTimeout(timer);
    }
  }, [location.search]);

  const handleWithdrawSubmit = (e) => {
    e.preventDefault();
    const numAmount = parseInt(withdrawAmount, 10) || 0;
    if (numAmount <= 0 || numAmount > availableBalance) return;

    setWithdrawSuccess(true);
    setAvailableBalance(prev => prev - numAmount);
    setPayouts([
      {
        id: `pay-${Date.now()}`,
        project: `Transfer to ${selectedBank}`,
        client: 'Direct Payout Express',
        date: 'Today',
        amount: `₹${numAmount.toLocaleString('en-IN')}`,
      },
      ...payouts,
    ]);

    setTimeout(() => {
      setShowWithdrawModal(false);
      setWithdrawSuccess(false);
    }, 1200);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Earnings & Bank Transfers</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Monitor client escrow deposits, cleared project payments, and withdrawal history
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          icon={Download}
          onClick={() => setShowInvoiceModal(true)}
        >
          Download Invoices
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card p-5 border border-white/[0.06]">
          <span className="text-xs text-slate-400">Available to Cash Out</span>
          <div className="text-2xl font-bold text-white mt-1">
            ₹{availableBalance.toLocaleString('en-IN')}
          </div>
          <Button
            variant="primary"
            size="xs"
            onClick={() => setShowWithdrawModal(true)}
            className="mt-3 w-full"
          >
            Withdraw to Bank
          </Button>
        </div>

        <div className="glass-card p-5 border border-white/[0.06]">
          <span className="text-xs text-slate-400 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-purple-400" /> In Escrow Protection
          </span>
          <div className="text-2xl font-bold text-purple-400 mt-1">{editorEarningsData.pendingEscrow}</div>
          <p className="text-[11px] text-slate-400 mt-2">
            Auto-clears into your balance upon client milestone sign-off
          </p>
        </div>

        <div className="glass-card p-5 border border-white/[0.06]">
          <span className="text-xs text-slate-400">Lifetime Career Earnings</span>
          <div className="text-2xl font-bold text-emerald-400 mt-1">{editorEarningsData.lifetimeEarned}</div>
          <p className="text-[11px] text-slate-400 mt-2">
            24 completed productions on Collabo.
          </p>
        </div>
      </div>

      {/* Payout History */}
      <div className="glass-card p-6 border border-white/[0.06]">
        <h3 className="text-base font-semibold text-white mb-4">Payout History & Completed Cuts</h3>
        <div className="space-y-3">
          {payouts.map((pay) => (
            <div
              key={pay.id}
              className="p-4 rounded-xl bg-[#141A28]/60 border border-white/[0.04] flex items-center justify-between"
            >
              <div>
                <h4 className="text-sm font-bold text-white">{pay.project}</h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Client: <strong className="text-slate-200">{pay.client}</strong> • {pay.date}
                </p>
              </div>
              <div className="text-right">
                <span className="text-sm font-bold text-emerald-400">+{pay.amount}</span>
                <span className="flex items-center gap-1 text-[11px] text-slate-400 justify-end mt-0.5">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Settled
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Withdraw Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md glass-card p-6 border border-white/[0.1] shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">Withdraw Funds</h3>
              <button
                onClick={() => setShowWithdrawModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.05]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {withdrawSuccess ? (
              <div className="py-6 text-center space-y-2">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto animate-bounce" />
                <h4 className="text-base font-bold text-white">Payout Request Submitted!</h4>
                <p className="text-xs text-slate-400">
                  ₹{parseInt(withdrawAmount, 10).toLocaleString('en-IN')} is being transferred to {selectedBank}.
                </p>
              </div>
            ) : (
              <form onSubmit={handleWithdrawSubmit} className="space-y-4">
                <div className="p-3 rounded-xl bg-purple-950/20 border border-purple-800/30 flex justify-between items-center text-xs">
                  <span className="text-slate-300">Available Balance:</span>
                  <strong className="text-emerald-400 font-bold text-sm">
                    ₹{availableBalance.toLocaleString('en-IN')}
                  </strong>
                </div>

                <div>
                  <label className="text-xs text-slate-300 block mb-1">Withdraw Amount (INR)</label>
                  <input
                    type="number"
                    required
                    min="1000"
                    max={availableBalance}
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#141A28] border border-white/[0.08] text-sm text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-300 block mb-1">Destination Bank Account</label>
                  <select
                    value={selectedBank}
                    onChange={(e) => setSelectedBank(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#141A28] border border-white/[0.08] text-xs text-white focus:outline-none focus:border-purple-500"
                  >
                    <option>HDFC Bank •••• 4029 (Default Savings)</option>
                    <option>State Bank of India •••• 8812</option>
                    <option>ICICI Bank •••• 1923 (Business Current)</option>
                  </select>
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-2">
                  <Button variant="ghost" onClick={() => setShowWithdrawModal(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary">
                    Confirm Transfer
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Invoice Modal */}
      {showInvoiceModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg glass-card p-6 border border-white/[0.1] shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Download className="w-5 h-5 text-purple-400" />
                Monthly Tax Invoice Ledger
              </h3>
              <button
                onClick={() => setShowInvoiceModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.05]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300 mb-5">
              <p className="text-slate-400">Official GST-compliant service invoices generated by Collabo Escrow:</p>
              <div className="space-y-2">
                {[
                  { invoiceId: 'INV-2026-0091', date: 'Sep 01, 2026', client: 'Nexus Media Corp', amount: '₹34,000' },
                  { invoiceId: 'INV-2026-0084', date: 'Aug 24, 2026', client: 'Raw Conversations', amount: '₹16,000' },
                  { invoiceId: 'INV-2026-0078', date: 'Aug 10, 2026', client: 'CloudFlow Labs', amount: '₹28,000' },
                ].map((inv) => (
                  <div key={inv.invoiceId} className="p-3 rounded-xl bg-[#141A28]/60 border border-white/[0.05] flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-white block">{inv.invoiceId}</span>
                      <span className="text-slate-400 text-[11px]">{inv.client} • {inv.date}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <strong className="text-emerald-400">{inv.amount}</strong>
                      <Button
                        variant="subtle"
                        size="xs"
                        onClick={() => alert(`Downloading ${inv.invoiceId}.pdf`)}
                      >
                        PDF
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end">
              <Button variant="primary" size="sm" onClick={() => setShowInvoiceModal(false)}>
                Done
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Earnings;
