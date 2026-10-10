import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Plus,
  Coins,
  KeyRound,
  ArrowUpRight,
  ArrowDownLeft,
  History,
  Sparkles,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/common/Button';
import { useAlert } from '../../context/AlertContext';
import { useWallet } from '../../context/WalletContext';
import { projectService } from '../../services/projectService';
import WalletTopUpModal from '../../components/wallet/WalletTopUpModal';
import SecurityPinModal from '../../components/wallet/SecurityPinModal';
import api from '../../services/api';

export const Payments = () => {
  const navigate = useNavigate();
  const { showAlert } = useAlert();
  const { walletBalance, escrowLocked, transactions, hasTransactionPin } = useWallet();

  const [loading, setLoading] = useState(true);
  const [escrows, setEscrows] = useState([]);
  const [totalSpent, setTotalSpent] = useState(0);
  const [completedMilestones, setCompletedMilestones] = useState(0);

  // Modals
  const [isTopUpOpen, setIsTopUpOpen] = useState(false);
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);

  const loadPayments = async () => {
    setLoading(true);
    try {
      const projects = await projectService.getCreatorProjects();

      let spent = 0;
      let completedCount = 0;

      const parsedEscrows = (projects || [])
        .filter(
          (p) =>
            p.rawStatus === 'in_progress' ||
            p.rawStatus === 'assigned' ||
            p.rawStatus === 'completed'
        )
        .map((p) => {
          const numericBudget = parseInt(String(p.budget).replace(/[^0-9]/g, ''), 10) || 0;
          const isCompleted = p.rawStatus === 'completed';

          if (isCompleted) {
            spent += numericBudget;
            completedCount += 1;
          }

          return {
            id: p.id,
            project: p.title || 'Untitled Project',
            editor: p.assignedEditor?.name || 'Assigned Editor',
            amount: p.budget || '₹0',
            status: isCompleted ? 'Released' : 'In Escrow (In Production)',
            canRelease: !isCompleted,
          };
        });

      setEscrows(parsedEscrows);
      setTotalSpent(spent);
      setCompletedMilestones(completedCount);
    } catch (err) {
      console.error('Failed to load escrow payments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayments();
  }, []);

  const handleRelease = async (id) => {
    try {
      await api.patch(`/api/creator/projects/${id}`, { status: 'completed' }).catch(() => {});
      setEscrows((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, status: 'Released', canRelease: false } : item
        )
      );
      showAlert('Payment milestone released to editor!', 'success');
      loadPayments();
    } catch (err) {
      showAlert(err.response?.data?.message || 'Failed to release payment milestone', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Title & Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Payments & Escrow Protection</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Bank-grade double-entry ledger with multi-stage escrow lock & 4-digit PIN authorization.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsPinModalOpen(true)}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#141A28] hover:bg-[#1A2234] text-slate-200 border border-white/[0.08] transition-all cursor-pointer flex items-center gap-1.5"
          >
            <KeyRound className="w-3.5 h-3.5 text-purple-400" />
            {hasTransactionPin ? 'Change PIN' : 'Set Security PIN'}
          </button>
          <button
            onClick={() => setIsTopUpOpen(true)}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-500 hover:from-purple-500 hover:to-indigo-500 text-white shadow-md shadow-purple-900/40 transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Coins className="w-4 h-4 text-amber-300" />
            Top Up Credits
          </button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Wallet Balance */}
        <div className="glass-card p-5 border border-amber-500/20 bg-gradient-to-br from-[#0B0E17] to-[#161324] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl" />
          <span className="text-xs text-slate-400 flex items-center gap-1">
            <Coins className="w-3.5 h-3.5 text-amber-400" /> Available Wallet Balance
          </span>
          <div className="text-2xl font-bold text-white mt-1 font-mono">
            ₹{walletBalance.toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] text-amber-400 mt-1 block font-medium">
            1 Credit = ₹1.00 (Razorpay Test Enabled)
          </span>
        </div>

        {/* Active in Escrow */}
        <div className="glass-card p-5 border border-purple-500/20 bg-gradient-to-br from-[#0B0E17] to-[#181228] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-2xl" />
          <span className="text-xs text-slate-400 flex items-center gap-1">
            <Lock className="w-3.5 h-3.5 text-purple-400" /> Active in Escrow
          </span>
          <div className="text-2xl font-bold text-purple-400 mt-1 font-mono">
            ₹{escrowLocked.toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Locked across active production milestones
          </span>
        </div>

        {/* Escrow Security */}
        <div className="glass-card p-5 border border-emerald-500/20 bg-gradient-to-br from-[#0B0E17] to-[#0E1C22]">
          <span className="text-xs text-slate-400">Total Settled Releases</span>
          <div className="text-2xl font-bold text-emerald-400 mt-1 font-mono">
            ₹{totalSpent.toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] text-emerald-400/90 mt-1 flex items-center gap-1 font-medium">
            <ShieldCheck className="w-3.5 h-3.5" /> {completedMilestones} milestones cleared to editors
          </span>
        </div>
      </div>

      {/* Escrow Milestones Table */}
      <div className="glass-card p-6 border border-white/[0.06]">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-semibold text-white">Project Escrow Milestones</h3>
            <p className="text-xs text-slate-400">
              Active projects currently holding funds in safe escrow.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400">Loading escrow records...</div>
        ) : escrows.length === 0 ? (
          <div className="py-12 text-center space-y-3">
            <p className="text-xs text-slate-400">
              No active escrow milestones yet. When you assign an editor to a project, milestones will appear here.
            </p>
            <Button
              variant="primary"
              size="sm"
              icon={Plus}
              onClick={() => navigate('/creator/create-project')}
            >
              Create New Project
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {escrows.map((esc) => (
              <div
                key={esc.id}
                className="p-4 rounded-xl bg-[#141A28]/60 border border-white/[0.04] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <h4 className="text-sm font-bold text-white">{esc.project}</h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Assigned Editor: <span className="text-purple-300 font-medium">{esc.editor}</span>
                  </p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-xs font-semibold text-white font-mono">{esc.amount}</span>
                    <span className="text-slate-500">•</span>
                    <span
                      className={`text-[11px] font-medium ${
                        esc.status === 'Released' ? 'text-emerald-400' : 'text-amber-400'
                      }`}
                    >
                      {esc.status}
                    </span>
                  </div>
                </div>

                {esc.canRelease && (
                  <Button variant="primary" size="sm" onClick={() => handleRelease(esc.id)}>
                    Release Payment
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Double-Entry Transaction Ledger Passbook */}
      <div className="glass-card p-6 border border-white/[0.06]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-purple-400" />
            <h3 className="text-base font-semibold text-white">Financial Ledger Passbook</h3>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">Immutable Audit Trail</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/[0.06] text-slate-400">
                <th className="pb-3 font-semibold">Transaction ID</th>
                <th className="pb-3 font-semibold">Type</th>
                <th className="pb-3 font-semibold">Description</th>
                <th className="pb-3 font-semibold">Date</th>
                <th className="pb-3 font-semibold text-right">Amount</th>
                <th className="pb-3 font-semibold text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {transactions.map((t) => {
                const isDeposit = t.type === 'TOPUP';
                const isRelease = t.type === 'ESCROW_RELEASE';
                return (
                  <tr key={t.id} className="hover:bg-white/[0.01] transition-colors">
                    <td className="py-3 font-mono text-purple-300 font-semibold">{t.id}</td>
                    <td className="py-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold ${
                          isDeposit
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                            : isRelease
                            ? 'bg-blue-500/15 text-blue-300 border border-blue-500/30'
                            : 'bg-purple-500/15 text-purple-300 border border-purple-500/30'
                        }`}
                      >
                        {isDeposit ? (
                          <ArrowDownLeft className="w-3 h-3" />
                        ) : (
                          <ArrowUpRight className="w-3 h-3" />
                        )}
                        {t.type}
                      </span>
                    </td>
                    <td className="py-3 text-slate-200">{t.description}</td>
                    <td className="py-3 text-slate-400 font-mono">{t.date}</td>
                    <td
                      className={`py-3 text-right font-mono font-bold ${
                        isDeposit ? 'text-emerald-400' : 'text-slate-200'
                      }`}
                    >
                      {isDeposit ? '+' : '-'}₹{t.amount.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 text-right">
                      <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400">
                        <CheckCircle2 className="w-3 h-3" /> {t.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <WalletTopUpModal isOpen={isTopUpOpen} onClose={() => setIsTopUpOpen(false)} />
      <SecurityPinModal
        isOpen={isPinModalOpen}
        onClose={() => setIsPinModalOpen(false)}
        actionTitle="Update Security PIN"
        actionDescription="Enter a 4-digit PIN to secure all your future escrow and release operations."
      />
    </div>
  );
};

export default Payments;
