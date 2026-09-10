import React from 'react';
import { ShieldCheck, Download, CheckCircle2 } from 'lucide-react';
import Button from '../../components/common/Button';
import { editorEarningsData } from '../../services/paymentService';

export const Earnings = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Earnings & Bank Transfers</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Monitor client escrow deposits, cleared project payments, and withdrawal history
          </p>
        </div>
        <Button variant="outline" size="sm" icon={Download}>
          Download Invoices
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card p-5 border border-white/[0.06]">
          <span className="text-xs text-slate-400">Available to Cash Out</span>
          <div className="text-2xl font-bold text-white mt-1">{editorEarningsData.availableBalance}</div>
          <Button variant="primary" size="xs" className="mt-3 w-full">
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
          {editorEarningsData.recentPayouts.map((pay) => (
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
    </div>
  );
};

export default Earnings;
