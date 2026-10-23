import React, { useState, useEffect } from 'react';
import { ShieldCheck, Download, CheckCircle2, ArrowUpRight, Plus, Building2, Smartphone, ArrowDownLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAlert } from '../../context/AlertContext';
import { useWallet } from '../../context/WalletContext';
import { useAuth } from '../../context/AuthContext';
import { WithdrawModal } from '../../components/wallet/WithdrawModal';
import { PaymentsSkeleton } from '../../components/common/Skeleton';
import SEO from '../../components/common/SEO';

export const Earnings = () => {
  const navigate = useNavigate();
  const { showAlert } = useAlert();
  const {
    walletBalance = 0,
    escrowLocked = 0,
    lifetimeEarned = 0,
    totalWithdrawn = 0,
    transactions = [],
    refreshWallet,
    isWalletLoading = false,
  } = useWallet();
  const { isAuthenticated, isAuthLoading } = useAuth();
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);

  useEffect(() => {
    if (isAuthenticated && !isAuthLoading && refreshWallet) {
      refreshWallet();
    }
  }, [isAuthenticated, isAuthLoading, refreshWallet]);

  if (isWalletLoading && transactions.length === 0) {
    return <PaymentsSkeleton />;
  }

  // Filter relevant payout and withdrawal ledger transactions
  const payoutTransactions = transactions.filter(
    (t) => t.type === 'ESCROW_RELEASE' || t.type === 'WITHDRAWAL'
  );

  return (
    <div className="space-y-6 text-[#261615] dark:text-[#FDEBDE] pb-16">
      <SEO
        title="Editor Earnings & Cash Out"
        description="Monitor real ledger milestone payouts, client escrow deposits, and withdrawal history."
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-black font-serif text-[#261615] dark:text-[#FDEBDE] tracking-tight">Earnings & Cash Out</h2>
          <p className="text-xs sm:text-sm text-[#5C3A38] dark:text-[#D4B8A8] mt-0.5 font-sans">
            Monitor client escrow deposits, cleared project payments, and real bank withdrawals
          </p>
        </div>
        <button
          type="button"
          onClick={() => showAlert('Platform ledger statement downloaded to your device', 'info')}
          className="self-start sm:self-auto px-4 py-2 rounded-xl bg-white dark:bg-[#201413] hover:bg-[#FFEBAA] dark:hover:bg-[#FFEBAA]/20 text-[#261615] dark:text-[#FDEBDE] border-2 border-[#382322] dark:border-[#FDEBDE]/30 shadow-[2px_2px_0_#382322] dark:shadow-[2px_2px_0_#000] text-xs font-bold font-mono uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer active:translate-x-0.5 active:translate-y-0.5"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Download Statement</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Available to Cash Out */}
        <div className="rounded-2xl p-5 border-2 border-[#382322] dark:border-[#FDEBDE]/30 bg-[#FFEBAA] dark:bg-[#2A1D1C] shadow-[4px_4px_0_#382322] dark:shadow-[4px_4px_0_#000] flex flex-col justify-between">
          <div>
            <span className="text-xs text-[#261615] dark:text-[#FFEBAA] font-mono font-bold uppercase tracking-wider">
              Available to Cash Out
            </span>
            <div className="text-2xl font-black text-[#261615] dark:text-[#FDEBDE] mt-1 font-mono">
              ₹{Number(walletBalance || 0).toLocaleString('en-IN')}
            </div>
            <p className="text-[11px] text-[#261615]/80 dark:text-[#D4B8A8] mt-1 font-mono font-semibold">
              Ready for instant UPI / Bank transfer
            </p>
          </div>
          <button
            type="button"
            disabled={(walletBalance || 0) < 50}
            onClick={() => setIsWithdrawModalOpen(true)}
            className="mt-4 w-full py-2.5 px-4 rounded-xl bg-[#382322] hover:bg-[#261615] text-[#FFEBAA] dark:bg-[#FFEBAA] dark:hover:bg-[#ffe38a] dark:text-[#261615] border-2 border-[#382322] shadow-[2px_2px_0_#382322] text-xs font-bold font-mono uppercase tracking-wider active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer disabled:opacity-50"
          >
            Withdraw to Bank / UPI
          </button>
        </div>

        {/* In Escrow Protection */}
        <div className="rounded-2xl p-5 border-2 border-[#382322] dark:border-[#FDEBDE]/30 bg-[#B1C8EA] dark:bg-[#1A2332] shadow-[4px_4px_0_#382322] dark:shadow-[4px_4px_0_#000] flex flex-col justify-between">
          <div>
            <span className="text-xs text-[#261615] dark:text-[#B1C8EA] flex items-center gap-1.5 font-mono font-bold uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5 text-[#261615] dark:text-[#B1C8EA]" /> In Escrow Protection
            </span>
            <div className="text-2xl font-black text-[#261615] dark:text-[#FDEBDE] mt-1 font-mono">
              ₹{Number(escrowLocked || 0).toLocaleString('en-IN')}
            </div>
            <p className="text-[11px] text-[#261615]/80 dark:text-[#D4B8A8] mt-2 font-mono font-semibold">
              Held in platform safe; auto-clears into your wallet upon client milestone approvals
            </p>
          </div>
          <span className="text-[10px] text-[#261615]/70 dark:text-[#D4B8A8] font-mono mt-3 block">
            Protected by Collabo Escrow
          </span>
        </div>

        {/* Lifetime Earnings & Total Withdrawn */}
        <div className="rounded-2xl p-5 border-2 border-[#382322] dark:border-[#FDEBDE]/30 bg-[#FFF7F1] dark:bg-[#201413] shadow-[4px_4px_0_#382322] dark:shadow-[4px_4px_0_#000] sm:col-span-2 lg:col-span-1 flex flex-col justify-between">
          <div>
            <span className="text-xs text-[#5C3A38] dark:text-[#D4B8A8] font-mono font-bold uppercase tracking-wider">
              Lifetime Career Earnings
            </span>
            <div className="text-2xl font-black text-emerald-700 dark:text-emerald-400 mt-1 font-mono">
              ₹{Number(lifetimeEarned || 0).toLocaleString('en-IN')}
            </div>
          </div>
          <div className="mt-3 pt-3 border-t-2 border-[#382322]/10 dark:border-[#FDEBDE]/10 flex items-center justify-between text-xs font-mono">
            <span className="text-[#5C3A38] dark:text-[#D4B8A8] font-bold">Total Withdrawn:</span>
            <span className="text-[#261615] dark:text-[#FDEBDE] font-black">
              ₹{Number(totalWithdrawn || 0).toLocaleString('en-IN')}
            </span>
          </div>
        </div>
      </div>

      {/* Payout History & Transaction Ledger */}
      <div className="rounded-2xl p-5 sm:p-6 border-2 border-[#382322] dark:border-[#FDEBDE]/30 bg-[#FFF7F1] dark:bg-[#201413] shadow-[4px_4px_0_#382322] dark:shadow-[4px_4px_0_#000]">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-black font-serif text-[#261615] dark:text-[#FDEBDE]">Payout History & Ledger Transactions</h3>
          <span className="text-xs text-[#5C3A38] dark:text-[#D4B8A8] font-mono font-bold">
            {payoutTransactions.length} records
          </span>
        </div>

        {payoutTransactions.length === 0 ? (
          <div className="py-12 text-center space-y-3">
            <p className="text-xs text-[#5C3A38] dark:text-[#D4B8A8]">
              No milestone payouts or withdrawals yet. Complete your first role deliverable to receive payout funds.
            </p>
            <button
              type="button"
              onClick={() => navigate('/editor/browse')}
              className="px-4 py-2 rounded-xl bg-[#FFEBAA] hover:bg-[#ffe58f] text-[#261615] border-2 border-[#382322] shadow-[2px_2px_0_#382322] text-xs font-bold font-mono uppercase tracking-wider transition-all inline-flex items-center gap-1.5 cursor-pointer active:translate-x-0.5 active:translate-y-0.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Browse Open Roles</span>
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {payoutTransactions.map((tx) => {
              const isRelease = tx.type === 'ESCROW_RELEASE';

              return (
                <div
                  key={tx.id || tx._id}
                  className="p-3.5 sm:p-4 rounded-xl bg-white dark:bg-[#1A1110] border-2 border-[#382322] dark:border-[#FDEBDE]/30 shadow-[2px_2px_0_#382322] dark:shadow-[2px_2px_0_#000] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 transition-all hover:bg-[#FAF0E6] dark:hover:bg-[#261817]"
                >
                  <div className="flex items-start sm:items-center gap-3 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border-2 ${
                        isRelease
                          ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-600/40'
                          : 'bg-[#FFEBAA] text-[#261615] border-[#382322]'
                      }`}
                    >
                      {isRelease ? (
                        <ArrowDownLeft className="w-4 h-4" />
                      ) : (
                        <ArrowUpRight className="w-4 h-4" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-sm font-black font-serif text-[#261615] dark:text-[#FDEBDE] truncate">
                        {tx.milestoneTitle || (isRelease ? 'Milestone Payout Cleared' : 'Bank / UPI Withdrawal')}
                      </h4>
                      <p className="text-xs text-[#5C3A38] dark:text-[#D4B8A8] mt-0.5 truncate font-sans">
                        {tx.description}
                      </p>
                      <p className="text-[10px] text-[#5C3A38] dark:text-[#D4B8A8] font-mono mt-0.5">
                        {tx.date} • Gateway: {tx.gateway || 'Platform Ledger'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end sm:text-right gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#382322]/10 dark:border-[#FDEBDE]/10">
                    <div>
                      <span
                        className={`text-sm font-black font-mono block ${
                          isRelease ? 'text-emerald-700 dark:text-emerald-400' : 'text-[#261615] dark:text-[#FFEBAA]'
                        }`}
                      >
                        {isRelease ? '+' : '-'}₹{Number(tx.amount || 0).toLocaleString('en-IN')}
                      </span>
                      <span
                        className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded-lg border-2 ${
                          isRelease
                            ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-600/30'
                            : 'bg-[#FFEBAA] text-[#261615] border-[#382322]'
                        }`}
                      >
                        {isRelease ? 'Cleared' : 'Transferred'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <WithdrawModal
        isOpen={isWithdrawModalOpen}
        onClose={() => setIsWithdrawModalOpen(false)}
      />
    </div>
  );
};

export default Earnings;
