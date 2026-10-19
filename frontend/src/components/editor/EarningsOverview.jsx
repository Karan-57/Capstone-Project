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
    <div className="bg-white/95 rounded-2xl border-2 border-[#382322] shadow-[3px_3px_0_#382322] p-5 flex flex-col justify-between h-full relative overflow-hidden">
      {/* Editorial top accent tape */}
      <div className="absolute -top-1.5 right-10 w-12 h-3.5 bg-[#FFEBAA] border border-[#382322]/30 rotate-[2deg] pointer-events-none" />

      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-[#382322] text-[#FFEBAA] border-2 border-[#382322] shadow-[1.5px_1.5px_0_#382322]">
              <Wallet className="w-4 h-4" />
            </div>
            <h3 className="text-lg font-serif font-bold text-[#382322] tracking-tight">
              Earnings & Balances
            </h3>
          </div>
          <button
            onClick={() => navigate('/editor/earnings')}
            className="text-xs font-bold text-[#382322] underline decoration-2 decoration-[#FFEBAA] hover:bg-[#FFEBAA] px-2 py-0.5 rounded transition-all cursor-pointer"
          >
            Ledger History
          </button>
        </div>

        {/* Primary Balances Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          <div className="p-3.5 rounded-xl bg-[#FFEBAA] border-2 border-[#382322] shadow-[2px_2px_0_#382322] flex flex-col justify-between">
            <div>
              <span className="text-[11px] font-bold text-[#382322]/70 uppercase tracking-wider block">
                Available Credits (Ledger)
              </span>
              <div className="text-2xl font-extrabold text-[#382322] mt-1 font-mono">
                {displayAvailable}
              </div>
            </div>
            <div className="mt-3">
              <button
                disabled={(walletBalance || 0) < 50}
                onClick={() => setIsWithdrawModalOpen(true)}
                className="w-full text-xs font-bold font-mono py-2 rounded-xl bg-[#382322] hover:bg-[#4d3332] text-[#FFEBAA] border-2 border-[#382322] shadow-[1.5px_1.5px_0_#382322] active:translate-x-[1px] active:translate-y-[1px] transition-all cursor-pointer disabled:opacity-50"
              >
                Withdraw Funds
              </button>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#FDEBDE] border-2 border-[#382322] shadow-[2px_2px_0_#382322] flex flex-col justify-between">
            <div>
              <span className="text-[11px] font-bold text-[#382322]/70 uppercase tracking-wider block flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#382322]" />
                In Collabo Escrow
              </span>
              <div className="text-2xl font-extrabold text-[#382322] mt-1 font-mono">
                {displayEscrow}
              </div>
            </div>
            <span className="text-[10px] text-[#382322]/70 font-medium block mt-3">
              Auto-releases upon creator cut approval
            </span>
          </div>
        </div>

        {/* Recent Payouts */}
        <div className="space-y-2">
          <span className="text-xs font-bold font-mono text-[#382322] uppercase tracking-wider block mb-1">
            Recent Released Payments
          </span>
          {!hasRecentPayouts ? (
            <div className="p-4 rounded-xl bg-[#FDEBDE]/30 border border-dashed border-[#382322]/30 text-center">
              <p className="text-xs font-semibold text-[#382322]/70">No released payouts yet.</p>
              <span className="text-[10px] text-[#382322]/50">Payments from completed creator contracts will appear here.</span>
            </div>
          ) : ledgerPayouts.length > 0 ? (
            ledgerPayouts.map((tx) => {
              const isRelease = tx.type === 'ESCROW_RELEASE';
              return (
                <div
                  key={tx.id || tx._id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-2.5 rounded-xl bg-white border-2 border-[#382322] shadow-[1.5px_1.5px_0_#382322] gap-1"
                >
                  <div className="min-w-0 flex items-center gap-2">
                    <div className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 border border-[#382322] ${
                      isRelease ? 'bg-[#FFEBAA] text-[#382322]' : 'bg-[#B1C8EA] text-[#382322]'
                    }`}>
                      {isRelease ? <ArrowDownLeft className="w-3.5 h-3.5 stroke-[2.5]" /> : <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-[#382322] truncate">
                        {tx.milestoneTitle || (isRelease ? 'Milestone Payout' : 'Withdrawal')}
                      </p>
                      <p className="text-[11px] text-[#382322]/70 truncate">
                        {tx.date} • {tx.gateway || 'Collabo Ledger'}
                      </p>
                    </div>
                  </div>
                  <div className="text-left sm:text-right shrink-0">
                    <span className="text-xs font-bold font-mono text-[#382322]">
                      {isRelease ? '+' : '-'}₹{Number(tx.amount || 0).toLocaleString('en-IN')}
                    </span>
                    <span className="inline sm:block text-[10px] font-mono font-bold text-[#382322]/60 ml-1.5 sm:ml-0">
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
                className="flex flex-col sm:flex-row sm:items-center justify-between p-2.5 rounded-xl bg-white border-2 border-[#382322] shadow-[1.5px_1.5px_0_#382322] gap-1"
              >
                <div className="min-w-0">
                  <p className="text-xs font-bold text-[#382322] truncate">
                    {payout.project}
                  </p>
                  <p className="text-[11px] text-[#382322]/70">
                    {payout.client} • {payout.date}
                  </p>
                </div>
                <div className="text-left sm:text-right shrink-0">
                  <span className="text-xs font-bold font-mono text-[#382322]">
                    +{payout.amount}
                  </span>
                  <span className="inline sm:block text-[10px] font-mono font-bold text-[#382322]/60 ml-1.5 sm:ml-0">Cleared</span>
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
