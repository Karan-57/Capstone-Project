import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wallet, ShieldCheck, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
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

  // Ledger-based payout and withdrawal items - capped at 3
  const ledgerPayouts = transactions
    .filter((t) => t.type === 'ESCROW_RELEASE' || t.type === 'WITHDRAWAL')
    .slice(0, 3);

  const hasRecentPayouts = ledgerPayouts.length > 0 || (earnings?.recentPayouts && earnings.recentPayouts.length > 0);

  return (
    <div className="bg-white/95 dark:bg-[#201413] rounded-2xl border-2 border-[#382322] dark:border-[#FDEBDE]/30 shadow-[3px_3px_0_#382322] dark:shadow-[3px_3px_0_#000] p-5 flex flex-col justify-between h-full relative overflow-hidden text-[#261615] dark:text-[#FDEBDE]">
      {/* Editorial top accent tape */}
      <div className="absolute -top-1.5 right-10 w-12 h-3.5 bg-[#FFEBAA] border border-[#382322]/30 rotate-[2deg] pointer-events-none" />

      <div className="flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-[#382322] text-[#FFEBAA] dark:bg-[#FFEBAA] dark:text-[#261615] border-2 border-[#382322] shadow-[1.5px_1.5px_0_#382322]">
              <Wallet className="w-4 h-4" />
            </div>
            <h3 className="text-lg font-serif font-bold text-[#261615] dark:text-[#FDEBDE] tracking-tight">
              Earnings & Balances
            </h3>
          </div>
          <button
            onClick={() => navigate('/editor/earnings')}
            className="text-xs font-bold text-[#261615] dark:text-[#FFEBAA] underline decoration-2 decoration-[#FFEBAA] hover:bg-[#FFEBAA] dark:hover:bg-[#FFEBAA]/20 px-2 py-0.5 rounded transition-all cursor-pointer font-mono"
          >
            Ledger History
          </button>
        </div>

        {/* Primary Balances Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          <div className="p-3.5 rounded-xl bg-[#FFEBAA] dark:bg-[#2A1D1C] border-2 border-[#382322] dark:border-[#FDEBDE]/30 shadow-[2px_2px_0_#382322] flex flex-col justify-between">
            <div>
              <span className="text-[11px] font-bold text-[#382322]/80 dark:text-[#FFEBAA] uppercase tracking-wider block font-mono">
                Available Credits
              </span>
              <div className="text-2xl font-extrabold text-[#261615] dark:text-[#FDEBDE] mt-1 font-mono">
                {displayAvailable}
              </div>
            </div>
            <div className="mt-3">
              <button
                disabled={(walletBalance || 0) < 50}
                onClick={() => setIsWithdrawModalOpen(true)}
                className="w-full text-xs font-bold font-mono py-2 rounded-xl bg-[#382322] hover:bg-[#4d3332] text-[#FFEBAA] dark:bg-[#FFEBAA] dark:hover:bg-[#ffe38a] dark:text-[#261615] border-2 border-[#382322] shadow-[1.5px_1.5px_0_#382322] active:translate-x-[1px] active:translate-y-[1px] transition-all cursor-pointer disabled:opacity-50"
              >
                Withdraw Funds
              </button>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#FDEBDE] dark:bg-[#1A2332] border-2 border-[#382322] dark:border-[#FDEBDE]/30 shadow-[2px_2px_0_#382322] flex flex-col justify-between">
            <div>
              <span className="text-[11px] font-bold text-[#382322]/80 dark:text-[#B1C8EA] uppercase tracking-wider block flex items-center gap-1 font-mono">
                <ShieldCheck className="w-3.5 h-3.5 text-[#261615] dark:text-[#B1C8EA]" />
                In Collabo Escrow
              </span>
              <div className="text-2xl font-extrabold text-[#261615] dark:text-[#FDEBDE] mt-1 font-mono">
                {displayEscrow}
              </div>
            </div>
            <span className="text-[10px] text-[#5C3A38] dark:text-[#D4B8A8] font-medium block mt-3 font-sans">
              Auto-releases upon creator cut approval
            </span>
          </div>
        </div>

        {/* Recent Payouts - max 3 */}
        <div className="space-y-2 flex-1">
          <span className="text-xs font-bold font-mono text-[#261615] dark:text-[#FDEBDE] uppercase tracking-wider block mb-1">
            Recent Released Payments
          </span>
          {!hasRecentPayouts ? (
            <div className="p-4 rounded-xl bg-[#FDEBDE]/30 dark:bg-[#1A1110]/50 border border-dashed border-[#382322]/30 dark:border-[#FDEBDE]/30 text-center">
              <p className="text-xs font-semibold text-[#5C3A38] dark:text-[#D4B8A8]">No released payouts yet.</p>
              <span className="text-[10px] text-[#5C3A38]/70 dark:text-[#D4B8A8]/70">Payments from completed creator contracts will appear here.</span>
            </div>
          ) : (
            <div className="space-y-2">
              {ledgerPayouts.map((tx) => {
                const isRelease = tx.type === 'ESCROW_RELEASE';
                return (
                  <div
                    key={tx.id || tx._id}
                    className="p-2.5 rounded-xl bg-[#FDEBDE]/40 dark:bg-[#1A1110] border-2 border-[#382322] dark:border-[#FDEBDE]/30 shadow-[1.5px_1.5px_0_#382322] flex items-center justify-between gap-2.5"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border ${
                          isRelease
                            ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-600/40'
                            : 'bg-[#FFEBAA] text-[#261615] border-[#382322]'
                        }`}
                      >
                        {isRelease ? <ArrowDownLeft className="w-3.5 h-3.5" /> : <ArrowUpRight className="w-3.5 h-3.5" />}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-[#261615] dark:text-[#FDEBDE] truncate">
                          {tx.milestoneTitle || (isRelease ? 'Escrow Cleared' : 'Withdrawal')}
                        </div>
                        <div className="text-[10px] text-[#5C3A38] dark:text-[#D4B8A8] font-mono truncate">
                          {tx.date || 'Recent'}
                        </div>
                      </div>
                    </div>
                    <span
                      className={`text-xs font-bold font-mono shrink-0 ${
                        isRelease ? 'text-emerald-700 dark:text-emerald-400' : 'text-[#261615] dark:text-[#FFEBAA]'
                      }`}
                    >
                      {isRelease ? '+' : '-'}₹{Number(tx.amount || 0).toLocaleString('en-IN')}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t-2 border-[#382322]/10 dark:border-[#FDEBDE]/10">
        <button
          onClick={() => navigate('/editor/earnings')}
          className="w-full py-2.5 text-xs font-bold font-mono text-[#261615] bg-[#FFEBAA] hover:bg-[#ffe38a] rounded-xl border-2 border-[#382322] shadow-[2px_2px_0_#382322] active:translate-x-[1px] active:translate-y-[1px] transition-all cursor-pointer uppercase tracking-wider"
        >
          View Full Ledger & Payout History
        </button>
      </div>

      <WithdrawModal
        isOpen={isWithdrawModalOpen}
        onClose={() => setIsWithdrawModalOpen(false)}
      />
    </div>
  );
};

export default EarningsOverview;
