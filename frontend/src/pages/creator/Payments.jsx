import React, { useState } from 'react';
import { CreditCard, Lock } from 'lucide-react';
import Button from '../../components/common/Button';

export const Payments = () => {
  const [escrows, setEscrows] = useState([
    {
      id: 'esc-1',
      project: 'E-Commerce Website & Promo',
      editor: 'Rahul Verma',
      amount: '₹18,000',
      status: 'In Escrow (Waiting Final Cut)',
      canRelease: true,
    },
    {
      id: 'esc-2',
      project: 'YouTube 4K Documentary Cut',
      editor: 'Aditya Joshi',
      amount: '₹28,000',
      status: 'In Escrow (Revision in Progress)',
      canRelease: false,
    },
    {
      id: 'esc-3',
      project: 'Portfolio Website',
      editor: 'Priya Mehta',
      amount: '₹20,000',
      status: 'Released',
      canRelease: false,
    },
  ]);

  const handleRelease = (id) => {
    setEscrows(prev =>
      prev.map(item => (item.id === id ? { ...item, status: 'Released', canRelease: false } : item))
    );
    alert('Payment milestone released to editor!');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight">Payments & Escrow Protection</h2>
        <p className="text-xs text-slate-400 mt-0.5">
          All creator funds are held in secure 256-bit encrypted escrow until you approve the final cut
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card p-5 border border-white/[0.06]">
          <span className="text-xs text-slate-400">Total Spent This Month</span>
          <div className="text-2xl font-bold text-white mt-1">₹45,000</div>
          <span className="text-xs text-emerald-400 mt-1 block">3 video milestones cleared</span>
        </div>
        <div className="glass-card p-5 border border-white/[0.06]">
          <span className="text-xs text-slate-400 flex items-center gap-1">
            <Lock className="w-3.5 h-3.5 text-purple-400" /> Active in Escrow
          </span>
          <div className="text-2xl font-bold text-purple-400 mt-1">₹46,000</div>
          <span className="text-xs text-slate-400 mt-1 block">Held safely for 2 projects</span>
        </div>
        <div className="glass-card p-5 border border-white/[0.06]">
          <span className="text-xs text-slate-400">Default Payment Method</span>
          <div className="text-sm font-semibold text-white mt-2 flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-slate-300" /> HDFC Visa •••• 9021
          </div>
          <span className="text-xs text-purple-400 hover:underline cursor-pointer mt-1 block">
            Manage cards
          </span>
        </div>
      </div>

      {/* Escrow Table */}
      <div className="glass-card p-6 border border-white/[0.06]">
        <h3 className="text-base font-semibold text-white mb-4">Milestone Escrow Releases</h3>
        <div className="space-y-3">
          {escrows.map((esc) => (
            <div
              key={esc.id}
              className="p-4 rounded-xl bg-[#141A28]/60 border border-white/[0.04] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div>
                <h4 className="text-sm font-bold text-white">{esc.project}</h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Assigned Editor: <span className="text-purple-300">{esc.editor}</span>
                </p>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-xs font-semibold text-white">{esc.amount}</span>
                  <span className="text-slate-500">•</span>
                  <span className={`text-[11px] font-medium ${
                    esc.status === 'Released' ? 'text-emerald-400' : 'text-amber-400'
                  }`}>
                    {esc.status}
                  </span>
                </div>
              </div>

              {esc.canRelease && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleRelease(esc.id)}
                >
                  Release Payment
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Payments;
