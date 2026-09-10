import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Wallet, ShieldCheck } from 'lucide-react';
import Button from '../common/Button';

export const EarningsOverview = ({ earnings }) => {
  const navigate = useNavigate();

  const data = earnings || {
    availableBalance: '₹64,200',
    pendingEscrow: '₹22,000',
    lifetimeEarned: '₹3,48,000',
    recentPayouts: [
      { id: 'pay-1', project: 'SaaS Walkthrough Video', client: 'CloudFlow Labs', amount: '₹28,000', date: 'Yesterday' },
      { id: 'pay-2', project: 'Cinematic Travel Trailer', client: 'Nomad Stories', amount: '₹18,500', date: 'Aug 24, 2026' },
      { id: 'pay-3', project: 'YouTube Tech Review', client: 'Dave Lee Studio', amount: '₹14,000', date: 'Aug 18, 2026' }
    ]
  };

  return (
    <div className="glass-card p-5.5 flex flex-col justify-between h-full">
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
            className="text-xs font-medium text-purple-400 hover:text-purple-300 transition-colors"
          >
            History
          </button>
        </div>

        {/* Primary Balances Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="p-3.5 rounded-xl bg-[#141A28]/80 border border-white/[0.04]">
            <span className="text-[11px] font-medium text-slate-400 block">
              Available to Withdraw
            </span>
            <div className="text-xl font-bold text-white mt-1">
              {data.availableBalance}
            </div>
            <div className="mt-2">
              <Button
                variant="primary"
                size="xs"
                onClick={() => navigate('/editor/earnings?withdraw=true')}
                className="w-full text-xs py-1"
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
            <div className="text-xl font-bold text-purple-400 mt-1">
              {data.pendingEscrow}
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
          {data.recentPayouts.map((payout) => (
            <div
              key={payout.id}
              className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.03]"
            >
              <div className="min-w-0">
                <p className="text-xs font-semibold text-white truncate">
                  {payout.project}
                </p>
                <p className="text-[11px] text-slate-400">
                  {payout.client} • {payout.date}
                </p>
              </div>
              <div className="text-right shrink-0 pl-2">
                <span className="text-xs font-bold text-emerald-400">
                  +{payout.amount}
                </span>
                <span className="block text-[10px] text-slate-400">Cleared</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EarningsOverview;
