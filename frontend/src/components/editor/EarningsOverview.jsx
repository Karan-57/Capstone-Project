import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wallet, ShieldCheck, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import Button from '../common/Button';
import { useWallet } from '../../context/WalletContext';
import { WithdrawModal } from '../wallet/WithdrawModal';

export const EarningsOverview = ({ earnings }) => {
  const navigate = useNavigate();
  const { walletBalance = 0, escrowLocked = 0, transactions = [] } = useWallet();
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);

  // Real ledger-based balances with fallback to prop
  const displayAvailable = walletBalance != null
    ? `₹${Number(walletBalance).toLocaleString('en-IN')}`
    : (earnings?.availableBalance || '₹0');

  const displayEscrow = escrowLocked != null
    ? `₹${Number(escrowLocked).toLocaleString('en-IN')}`
    : (earnings?.pendingEscrow || '₹0');

  // Ledger-based payout and withdrawal items
  const ledgerPayouts = transactions
    .filter((t) => t.type === 'ESCROW_RELEASE' || t.type === 'WITHDRAWAL')
    .slice(0, 4);

  const hasRecentPayouts = ledgerPayouts.length > 0 || (earnings?.recentPayouts && earnings.recentPayouts.length > 0);

  return (
    <div className="glass-card p-4 sm:p-5.5 flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded-lg bg-emerald-500/20 text-emerald-400">
              <Wallet className="w-4 h-4" />
            </div>
            <h3 className="text-base font-semibold text-white tracking-tight">
              Earnings & Balances
            </h3>
          </div>
          <button
            onClick={() => navigate('/editor/earnings')}
            className="text-xs font-medium text-purple-400 hover:text-purple-300 transition-colors cursor-pointer"
          >
            Ledger History
          </button>
        </div>

        {/* Primary Balances Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          <div className="p-3.5 rounded-xl bg-[#141A28]/80 border border-white/[0.04] flex flex-col justify-between">
            <div>
              <span className="text-[11px] font-medium text-slate-400 block">
                Available Credits (Ledger)
              </span>
              <div className="text-xl font-bold text-white mt-1 font-mono">
                {displayAvailable}
              </div>
            </div>
            <div className="mt-3">
              <Button
                variant="primary"
                size="xs"
                disabled={(walletBalance || 0) < 50}
                onClick={() => setIsWithdrawModalOpen(true)}
                className="w-full text-xs py-1.5 disabled:opacity-50"
              >
                Withdraw Funds
              </Button>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#141A28]/80 border border-white/[0.04]">
            <span className="text-[11px] font-medium text-slate-400 block flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              In Collabo Escrow
            </span>
            <div className="text-xl font-bold text-purple-400 mt-1 font-mono">
              {displayEscrow}
            </div>
            <span className="text-[10px] text-slate-400 block mt-2">
              Auto-releases upon creator cut approval
            </span>
          </div>
        </div>

        {/* Recent Payouts */}
        <div className="space-y-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Recent Released Payments
          </span>
          {!hasRecentPayouts ? (
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.03] text-center">
              <p className="text-xs text-slate-400">No released payouts yet.</p>
              <span className="text-[10px] text-slate-500">Payments from completed creator contracts will appear here.</span>
            </div>
          ) : ledgerPayouts.length > 0 ? (
            ledgerPayouts.map((tx) => {
              const isRelease = tx.type === 'ESCROW_RELEASE';
              return (
                <div
                  key={tx.id || tx._id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.03] gap-1"
                >
                  <div className="min-w-0 flex items-center gap-2">
                    <div className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 ${
                      isRelease ? 'bg-emerald-500/15 text-emerald-400' : 'bg-amber-500/15 text-amber-400'
                    }`}>
                      {isRelease ? <ArrowDownLeft className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-white truncate">
                        {tx.milestoneTitle || (isRelease ? 'Milestone Payout' : 'Withdrawal')}
                      </p>
                      <p className="text-[11px] text-slate-400 truncate">
                        {tx.date} • {tx.gateway || 'Collabo Ledger'}
                      </p>
                    </div>
                  </div>
                  <div className="text-left sm:text-right shrink-0">
                    <span className={`text-xs font-bold font-mono ${isRelease ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {isRelease ? '+' : '-'}₹{Number(tx.amount || 0).toLocaleString('en-IN')}
                    </span>
                    <span className="inline sm:block text-[10px] text-slate-400 ml-1.5 sm:ml-0 font-mono">
                      {isRelease ? 'Cleared' : 'Transferred'}
                    </span>
                  </div>
                </div>
              );
            })
          ) : (
            (earnings?.recentPayouts || []).map((payout) => (
              <div
                key={payout.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.03] gap-1"
              >
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-white truncate">
                    {payout.project}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    {payout.client} • {payout.date}
                  </p>
                </div>
                <div className="text-left sm:text-right shrink-0">
                  <span className="text-xs font-bold text-emerald-400">
                    +{payout.amount}
                  </span>
                  <span className="inline sm:block text-[10px] text-slate-400 ml-1.5 sm:ml-0">Cleared</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <WithdrawModal
        isOpen={isWithdrawModalOpen}
        onClose={() => setIsWithdrawModalOpen(false)}
      />
    </div>
  );
};

export default EarningsOverview;
