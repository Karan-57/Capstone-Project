import React, { useState, useEffect } from 'react';
import { ShieldCheck, Download, CheckCircle2, ArrowUpRight, Plus, Building2, Smartphone, ArrowDownLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/common/Button';
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
    <div className="space-y-6">
      <SEO
        title="Editor Earnings & Cash Out"
        description="Monitor real ledger milestone payouts, client escrow deposits, and withdrawal history."
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Earnings & Cash Out</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Monitor client escrow deposits, cleared project payments, and real bank withdrawals
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          icon={Download}
          onClick={() => showAlert('Platform ledger statement downloaded to your device', 'info')}
          className="self-start sm:self-auto"
        >
          Download Statement
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Available to Cash Out */}
        <div className="glass-card p-5 border border-white/[0.06] flex flex-col justify-between">
          <div>
            <span className="text-xs text-slate-400">Available to Cash Out</span>
            <div className="text-2xl font-bold text-white mt-1 font-mono">
              ₹{Number(walletBalance || 0).toLocaleString('en-IN')}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Ready for instant UPI / Bank transfer
            </p>
          </div>
          <Button
            variant="primary"
            size="xs"
            disabled={(walletBalance || 0) < 50}
            onClick={() => setIsWithdrawModalOpen(true)}
            className="mt-4 w-full disabled:opacity-50"
          >
            Withdraw to Bank / UPI
          </Button>
        </div>

        {/* In Escrow Protection */}
        <div className="glass-card p-5 border border-white/[0.06]">
          <span className="text-xs text-slate-400 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-purple-400" /> In Escrow Protection
          </span>
          <div className="text-2xl font-bold text-purple-400 mt-1 font-mono">
            ₹{Number(escrowLocked || 0).toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Held in platform safe; auto-clears into your wallet upon client milestone approvals
          </p>
        </div>

        {/* Lifetime Earnings & Total Withdrawn */}
        <div className="glass-card p-5 border border-white/[0.06] sm:col-span-2 lg:col-span-1 flex flex-col justify-between">
          <div>
            <span className="text-xs text-slate-400">Lifetime Career Earnings</span>
            <div className="text-2xl font-bold text-emerald-400 mt-1 font-mono">
              ₹{Number(lifetimeEarned || 0).toLocaleString('en-IN')}
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs">
            <span className="text-slate-400">Total Withdrawn:</span>
            <span className="text-slate-200 font-semibold font-mono">
              ₹{Number(totalWithdrawn || 0).toLocaleString('en-IN')}
            </span>
          </div>
        </div>
      </div>

      {/* Payout History & Transaction Ledger */}
      <div className="glass-card p-5 sm:p-6 border border-white/[0.06]">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-white">Payout History & Ledger Transactions</h3>
          <span className="text-xs text-slate-400 font-mono">
            {payoutTransactions.length} records
          </span>
        </div>

        {payoutTransactions.length === 0 ? (
          <div className="py-12 text-center space-y-3">
            <p className="text-xs text-slate-400">
              No milestone payouts or withdrawals yet. Complete your first role deliverable to receive payout funds.
            </p>
            <Button
              variant="primary"
              size="sm"
              icon={Plus}
              onClick={() => navigate('/editor/browse')}
            >
              Browse Open Roles
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {payoutTransactions.map((tx) => {
              const isRelease = tx.type === 'ESCROW_RELEASE';
              const isWithdrawal = tx.type === 'WITHDRAWAL';

              return (
                <div
                  key={tx.id || tx._id}
                  className="p-3.5 sm:p-4 rounded-xl bg-[#141A28]/60 border border-white/[0.04] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 transition-all hover:border-white/[0.08]"
                >
                  <div className="flex items-start sm:items-center gap-3 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                        isRelease
                          ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25'
                          : 'bg-amber-500/15 text-amber-400 border-amber-500/25'
                      }`}
                    >
                      {isRelease ? (
                        <ArrowDownLeft className="w-4 h-4" />
                      ) : (
                        <ArrowUpRight className="w-4 h-4" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-sm font-bold text-white truncate">
                        {tx.milestoneTitle || (isRelease ? 'Milestone Payout Cleared' : 'Bank / UPI Withdrawal')}
                      </h4>
                      <p className="text-xs text-slate-400 mt-0.5 truncate">
                        {tx.description}
                      </p>
                      <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                        {tx.date} • Gateway: {tx.gateway || 'Platform Ledger'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end sm:text-right gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/[0.04]">
                    <div>
                      <span
                        className={`text-sm font-bold font-mono block ${
                          isRelease ? 'text-emerald-400' : 'text-amber-400'
                        }`}
                      >
                        {isRelease ? '+' : '-'}₹{Number(tx.amount || 0).toLocaleString('en-IN')}
                      </span>
                      <span
                        className={`text-[10px] font-semibold uppercase font-mono px-2 py-0.5 rounded ${
                          isRelease
                            ? 'bg-emerald-500/10 text-emerald-400'
                            : 'bg-amber-500/10 text-amber-400'
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
