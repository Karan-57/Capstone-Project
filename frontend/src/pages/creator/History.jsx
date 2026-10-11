import React, { useState } from 'react';
import {
  History as HistoryIcon,
  ArrowDownLeft,
  ArrowUpRight,
  CheckCircle2,
  Search,
  Coins,
  ShieldCheck,
  Lock,
  Download,
  Filter,
} from 'lucide-react';
import SEO from '../../components/common/SEO';
import { useWallet } from '../../context/WalletContext';

export const History = () => {
  const { walletBalance, escrowLocked, transactions } = useWallet();
  const [filterType, setFilterType] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Calculate totals
  const totalTopUp = transactions
    .filter((t) => t.type === 'TOPUP')
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  const totalReleases = transactions
    .filter((t) => t.type === 'ESCROW_RELEASE')
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  // Filter transactions
  const filtered = transactions.filter((t) => {
    if (filterType !== 'ALL' && t.type !== filterType) {
      return false;
    }
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      t.id?.toLowerCase().includes(q) ||
      t.description?.toLowerCase().includes(q) ||
      t.type?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 pb-12">
      <SEO
        title="Financial Ledger Passbook"
        description="Immutable audit trail of creator deposits, escrow locks, and milestone releases."
      />

      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <HistoryIcon className="w-5 h-5 text-purple-400" />
            Financial Ledger Passbook
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Immutable double-entry audit trail tracking all deposits, escrow locks, and milestone releases.
          </p>
        </div>

        <span className="text-[11px] font-mono px-3 py-1 rounded-full bg-purple-950/60 text-purple-300 border border-purple-800/40 w-fit">
          Bank-Grade Audit Trail
        </span>
      </div>

      {/* Metrics Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card p-5 border border-amber-500/20 bg-gradient-to-br from-[#0B0E17] to-[#161324] relative overflow-hidden">
          <span className="text-xs text-slate-400 flex items-center gap-1.5">
            <Coins className="w-3.5 h-3.5 text-amber-400" /> Current Wallet Balance
          </span>
          <div className="text-2xl font-bold text-white mt-1 font-mono">
            ₹{walletBalance.toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] text-amber-400 mt-1 block font-medium">
            Available for production escrow
          </span>
        </div>

        <div className="glass-card p-5 border border-emerald-500/20 bg-gradient-to-br from-[#0B0E17] to-[#0E1C22]">
          <span className="text-xs text-slate-400 flex items-center gap-1.5">
            <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-400" /> Total Credits Deposited
          </span>
          <div className="text-2xl font-bold text-emerald-400 mt-1 font-mono">
            ₹{totalTopUp.toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Via instant UPI / Testnet Top-Up
          </span>
        </div>

        <div className="glass-card p-5 border border-blue-500/20 bg-gradient-to-br from-[#0B0E17] to-[#0D182A]">
          <span className="text-xs text-slate-400 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-400" /> Settled Milestone Releases
          </span>
          <div className="text-2xl font-bold text-blue-400 mt-1 font-mono">
            ₹{totalReleases.toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Released to verified video editors
          </span>
        </div>
      </div>

      {/* Passbook Table Card */}
      <div className="glass-card p-6 border border-white/[0.06] space-y-4">
        {/* Table Filters & Search */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {[
              { id: 'ALL', label: `All (${transactions.length})` },
              { id: 'TOPUP', label: 'Top-Ups' },
              { id: 'ESCROW_RELEASE', label: 'Releases' },
              { id: 'ESCROW_LOCK', label: 'Escrow Deposits' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilterType(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 cursor-pointer ${
                  filterType === tab.id
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by ID or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-[#141A28] text-xs text-white placeholder-slate-500 border border-white/[0.08] focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>
        </div>

        {/* Audit Trail Table */}
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
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    No transactions recorded in ledger passbook matching your filters.
                  </td>
                </tr>
              ) : (
                filtered.map((t) => {
                  const isDeposit = t.type === 'TOPUP';
                  const isRelease = t.type === 'ESCROW_RELEASE';
                  return (
                    <tr key={t.id} className="hover:bg-white/[0.01] transition-colors">
                      <td className="py-3.5 font-mono text-purple-300 font-semibold">{t.id}</td>
                      <td className="py-3.5">
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
                      <td className="py-3.5 text-slate-200">{t.description}</td>
                      <td className="py-3.5 text-slate-400 font-mono">{t.date}</td>
                      <td
                        className={`py-3.5 text-right font-mono font-bold ${
                          isDeposit ? 'text-emerald-400' : 'text-slate-200'
                        }`}
                      >
                        {isDeposit ? '+' : '-'}₹{Number(t.amount).toLocaleString('en-IN')}
                      </td>
                      <td className="py-3.5 text-right">
                        <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                          <CheckCircle2 className="w-3 h-3" /> {t.status || 'Cleared'}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default History;
