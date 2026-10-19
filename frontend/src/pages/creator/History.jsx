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
    <div className="space-y-6 pb-12 text-[#261615] dark:text-[#FDEBDE] animate-fade-in">
      <SEO
        title="Financial Ledger Passbook"
        description="Immutable audit trail of creator deposits, escrow locks, and milestone releases."
      />

      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b-2 border-[#382322]/10 dark:border-[#FDEBDE]/10">
        <div>
          <h2 className="text-2xl sm:text-3xl font-serif font-black tracking-tight text-[#261615] dark:text-[#FDEBDE] flex items-center gap-2.5">
            <HistoryIcon className="w-6 h-6 text-[#261615] dark:text-[#FFEBAA]" />
            Financial Ledger Passbook
          </h2>
          <p className="text-xs sm:text-sm text-[#5C3A38] dark:text-[#D4B8A8] mt-1 font-sans">
            Immutable double-entry audit trail tracking all deposits, escrow locks, and milestone releases.
          </p>
        </div>

        <span className="text-[11px] font-mono font-bold uppercase tracking-wider px-3 py-1 bg-[#FFEBAA] text-[#261615] border-2 border-[#382322] shadow-[2px_2px_0_#382322] w-fit">
          Bank-Grade Audit Trail
        </span>
      </div>

      {/* Metrics Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#FFFDF9] dark:bg-[#201413] p-5 border-2 border-[#382322] dark:border-[#FDEBDE]/30 shadow-[4px_4px_0_#382322] dark:shadow-[4px_4px_0_#000] relative overflow-hidden">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#5C3A38] dark:text-[#FFEBAA] flex items-center gap-1.5">
            <Coins className="w-3.5 h-3.5 text-[#261615] dark:text-[#FFEBAA]" /> Current Wallet Balance
          </span>
          <div className="text-2xl sm:text-3xl font-black text-[#261615] dark:text-[#FDEBDE] mt-1.5 font-mono">
            ₹{walletBalance.toLocaleString('en-IN')}
          </div>
          <span className="text-xs text-[#8A5200] dark:text-[#FFEBAA] mt-1 block font-medium font-sans">
            Available for production escrow
          </span>
        </div>

        <div className="bg-[#FFFDF9] dark:bg-[#201413] p-5 border-2 border-[#382322] dark:border-[#FDEBDE]/30 shadow-[4px_4px_0_#382322] dark:shadow-[4px_4px_0_#000]">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#5C3A38] dark:text-[#34D399] flex items-center gap-1.5">
            <ArrowDownLeft className="w-3.5 h-3.5 text-[#059669] dark:text-[#34D399]" /> Total Credits Deposited
          </span>
          <div className="text-2xl sm:text-3xl font-black text-[#059669] dark:text-[#34D399] mt-1.5 font-mono">
            ₹{totalTopUp.toLocaleString('en-IN')}
          </div>
          <span className="text-xs text-[#5C3A38] dark:text-[#D4B8A8] mt-1 block font-sans">
            Via instant UPI / Testnet Top-Up
          </span>
        </div>

        <div className="bg-[#FFFDF9] dark:bg-[#201413] p-5 border-2 border-[#382322] dark:border-[#FDEBDE]/30 shadow-[4px_4px_0_#382322] dark:shadow-[4px_4px_0_#000]">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#5C3A38] dark:text-[#93C5FD] flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#1E40AF] dark:text-[#93C5FD]" /> Settled Milestone Releases
          </span>
          <div className="text-2xl sm:text-3xl font-black text-[#1E40AF] dark:text-[#93C5FD] mt-1.5 font-mono">
            ₹{totalReleases.toLocaleString('en-IN')}
          </div>
          <span className="text-xs text-[#5C3A38] dark:text-[#D4B8A8] mt-1 block font-sans">
            Released to verified video editors
          </span>
        </div>
      </div>

      {/* Passbook Table Card */}
      <div className="bg-[#FFFDF9] dark:bg-[#201413] p-5 sm:p-6 border-2 border-[#382322] dark:border-[#FDEBDE]/30 shadow-[4px_4px_0_#382322] dark:shadow-[4px_4px_0_#000] space-y-4">
        {/* Table Filters & Search */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            {[
              { id: 'ALL', label: `All (${transactions.length})` },
              { id: 'TOPUP', label: 'Top-Ups' },
              { id: 'ESCROW_RELEASE', label: 'Releases' },
              { id: 'ESCROW_LOCK', label: 'Escrow Deposits' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilterType(tab.id)}
                className={`px-3 py-1.5 text-xs font-bold font-mono uppercase tracking-wider transition-all shrink-0 cursor-pointer border-2 ${
                  filterType === tab.id
                    ? 'bg-[#FFEBAA] text-[#261615] border-[#382322] shadow-[2px_2px_0_#382322]'
                    : 'bg-[#FFF7F1] dark:bg-[#19100F] text-[#5C3A38] dark:text-[#D4B8A8] border-[#382322]/20 dark:border-[#FDEBDE]/20 hover:border-[#382322]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-[#5C3A38] dark:text-[#D4B8A8] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by ID or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-[#FFF7F1] dark:bg-[#19100F] text-xs text-[#261615] dark:text-[#FDEBDE] placeholder-[#5C3A38]/60 dark:placeholder-[#D4B8A8]/60 border-2 border-[#382322] dark:border-[#FDEBDE]/30 focus:outline-none shadow-[2px_2px_0_#382322]"
            />
          </div>
        </div>

        {/* Audit Trail Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b-2 border-[#382322]/20 dark:border-[#FDEBDE]/20 text-[#261615] dark:text-[#FDEBDE] font-mono uppercase tracking-wider">
                <th className="pb-3 font-bold">Transaction ID</th>
                <th className="pb-3 font-bold">Type</th>
                <th className="pb-3 font-bold">Description</th>
                <th className="pb-3 font-bold">Date</th>
                <th className="pb-3 font-bold text-right">Amount</th>
                <th className="pb-3 font-bold text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#382322]/10 dark:divide-[#FDEBDE]/10 font-sans">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#5C3A38] dark:text-[#D4B8A8]">
                    No transactions recorded in ledger passbook matching your filters.
                  </td>
                </tr>
              ) : (
                filtered.map((t) => {
                  const isDeposit = t.type === 'TOPUP';
                  const isRelease = t.type === 'ESCROW_RELEASE';
                  return (
                    <tr key={t.id} className="hover:bg-[#FFF7F1] dark:hover:bg-[#2A1B19] transition-colors">
                      <td className="py-3.5 font-mono text-[#261615] dark:text-[#FFEBAA] font-bold">{t.id}</td>
                      <td className="py-3.5">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider border ${
                            isDeposit
                              ? 'bg-[#D1FAE5] dark:bg-[#065F46]/30 text-[#065F46] dark:text-[#34D399] border-[#065F46]/30'
                              : isRelease
                              ? 'bg-[#DBEAFE] dark:bg-[#1E40AF]/30 text-[#1E40AF] dark:text-[#93C5FD] border-[#1E40AF]/30'
                              : 'bg-[#FFEBAA] text-[#261615] border-[#382322]'
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
                      <td className="py-3.5 text-[#261615] dark:text-[#FDEBDE] font-medium">{t.description}</td>
                      <td className="py-3.5 text-[#5C3A38] dark:text-[#D4B8A8] font-mono">{t.date}</td>
                      <td
                        className={`py-3.5 text-right font-mono font-bold ${
                          isDeposit ? 'text-[#059669] dark:text-[#34D399]' : 'text-[#261615] dark:text-[#FDEBDE]'
                        }`}
                      >
                        {isDeposit ? '+' : '-'}₹{Number(t.amount).toLocaleString('en-IN')}
                      </td>
                      <td className="py-3.5 text-right">
                        <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold uppercase tracking-wider text-[#059669] dark:text-[#34D399]">
                          <CheckCircle2 className="w-3.5 h-3.5" /> {t.status || 'Cleared'}
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
