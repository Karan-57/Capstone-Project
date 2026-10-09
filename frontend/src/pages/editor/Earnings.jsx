import React from 'react';
import { ShieldCheck, Download, CheckCircle2 } from 'lucide-react';
import Button from '../../components/common/Button';
import { editorEarningsData } from '../../services/paymentService';
import { useAlert } from '../../context/AlertContext';

export const Earnings = () => {
  const { showAlert } = useAlert();

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
          onClick={() => showAlert('Invoices downloaded to your device', 'info')}
          className="self-start sm:self-auto"
        >
          Download Invoices
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="glass-card p-5 border border-white/[0.06] flex flex-col justify-between">
          <div>
            <span className="text-xs text-slate-400">Available to Cash Out</span>
            <div className="text-2xl font-bold text-white mt-1">{editorEarningsData.availableBalance}</div>
          </div>
          <Button
            variant="primary"
            size="xs"
            onClick={() => showAlert('Payout transfer initiated to linked Bank Account', 'success')}
            className="mt-4 w-full"
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

        <div className="glass-card p-5 border border-white/[0.06] sm:col-span-2 lg:col-span-1">
          <span className="text-xs text-slate-400">Lifetime Career Earnings</span>
          <div className="text-2xl font-bold text-emerald-400 mt-1">{editorEarningsData.lifetimeEarned}</div>
          <p className="text-[11px] text-slate-400 mt-2">
            All completed productions settled on Collabo platform
          </p>
        </div>
      </div>

      {/* Payout History */}
      <div className="glass-card p-5 sm:p-6 border border-white/[0.06]">
        <h3 className="text-base font-semibold text-white mb-4">Payout History & Completed Cuts</h3>
        <div className="space-y-3">
          {editorEarningsData.recentPayouts.map((pay) => (
            <div
              key={pay.id}
              className="p-3.5 sm:p-4 rounded-xl bg-[#141A28]/60 border border-white/[0.04] flex flex-col sm:flex-row sm:items-center justify-between gap-2"
            >
              <div className="min-w-0">
                <h4 className="text-sm font-bold text-white truncate">{pay.project}</h4>
                <p className="text-xs text-slate-400 mt-0.5 truncate">
                  Client: <strong className="text-slate-200">{pay.client}</strong> • {pay.date}
                </p>
              </div>
              <div className="flex items-center justify-between sm:justify-end sm:text-right gap-3 shrink-0">
                <span className="text-sm font-bold text-emerald-400">+{pay.amount}</span>
                <span className="flex items-center gap-1 text-[11px] text-slate-400">
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
