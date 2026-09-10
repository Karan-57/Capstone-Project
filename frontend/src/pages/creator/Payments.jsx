import React, { useState } from 'react';
import { CreditCard, Lock, CheckCircle2, X, Plus, ShieldCheck } from 'lucide-react';
import Button from '../../components/common/Button';

export const Payments = () => {
  const [escrows, setEscrows] = useState([
    {
      id: 'esc-1',
      project: 'E-Commerce Website & Promo',
      editor: 'Rahul Verma',
      amountNum: 18000,
      amount: '₹18,000',
      status: 'In Escrow (Waiting Final Cut)',
      canRelease: true,
    },
    {
      id: 'esc-2',
      project: 'YouTube 4K Documentary Cut',
      editor: 'Aditya Joshi',
      amountNum: 28000,
      amount: '₹28,000',
      status: 'In Escrow (Revision in Progress)',
      canRelease: false,
    },
    {
      id: 'esc-3',
      project: 'Portfolio Website',
      editor: 'Priya Mehta',
      amountNum: 20000,
      amount: '₹20,000',
      status: 'Released',
      canRelease: false,
    },
  ]);

  const [cards, setCards] = useState([
    { id: 'c-1', bank: 'HDFC Bank', type: 'Visa', last4: '9021', expiry: '08/29', isDefault: true },
    { id: 'c-2', bank: 'ICICI Bank', type: 'Mastercard', last4: '4118', expiry: '11/27', isDefault: false },
  ]);

  const [selectedEscrow, setSelectedEscrow] = useState(null);
  const [releaseSuccess, setReleaseSuccess] = useState(null);
  const [showCardsModal, setShowCardsModal] = useState(false);
  const [showAddCard, setShowAddCard] = useState(false);
  const [newCard, setNewCard] = useState({ bank: '', type: 'Visa', last4: '', expiry: '' });

  const totalSpent = escrows
    .filter(e => e.status === 'Released')
    .reduce((sum, e) => sum + e.amountNum, 25000);

  const activeEscrow = escrows
    .filter(e => e.status !== 'Released')
    .reduce((sum, e) => sum + e.amountNum, 0);

  const handleConfirmRelease = () => {
    if (!selectedEscrow) return;

    setEscrows(prev =>
      prev.map(item =>
        item.id === selectedEscrow.id
          ? { ...item, status: 'Released', canRelease: false }
          : item
      )
    );

    setReleaseSuccess(selectedEscrow);
    setSelectedEscrow(null);

    setTimeout(() => {
      setReleaseSuccess(null);
    }, 4000);
  };

  const handleAddCard = (e) => {
    e.preventDefault();
    if (!newCard.bank || !newCard.last4) return;

    const card = {
      id: `c-${Date.now()}`,
      bank: newCard.bank,
      type: newCard.type || 'Visa',
      last4: newCard.last4.slice(-4),
      expiry: newCard.expiry || '12/28',
      isDefault: false,
    };

    setCards(prev => [...prev, card]);
    setShowAddCard(false);
    setNewCard({ bank: '', type: 'Visa', last4: '', expiry: '' });
  };

  const setDefaultCard = (id) => {
    setCards(prev => prev.map(c => ({ ...c, isDefault: c.id === id })));
  };

  const defaultCard = cards.find(c => c.isDefault) || cards[0];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight">Payments & Escrow Protection</h2>
        <p className="text-xs text-slate-400 mt-0.5">
          All creator funds are held in secure 256-bit encrypted escrow until you approve the final cut
        </p>
      </div>

      {releaseSuccess && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-emerald-300">
                Milestone Payment Released!
              </p>
              <p className="text-xs text-slate-300">
                Successfully transferred {releaseSuccess.amount} to {releaseSuccess.editor} for "{releaseSuccess.project}".
              </p>
            </div>
          </div>
          <button
            onClick={() => setReleaseSuccess(null)}
            className="text-slate-400 hover:text-white text-xs"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card p-5 border border-white/[0.06]">
          <span className="text-xs text-slate-400">Total Spent This Month</span>
          <div className="text-2xl font-bold text-white mt-1">₹{totalSpent.toLocaleString('en-IN')}</div>
          <span className="text-xs text-emerald-400 mt-1 block">
            {escrows.filter(e => e.status === 'Released').length} video milestones cleared
          </span>
        </div>
        <div className="glass-card p-5 border border-white/[0.06]">
          <span className="text-xs text-slate-400 flex items-center gap-1">
            <Lock className="w-3.5 h-3.5 text-purple-400" /> Active in Escrow
          </span>
          <div className="text-2xl font-bold text-purple-400 mt-1">₹{activeEscrow.toLocaleString('en-IN')}</div>
          <span className="text-xs text-slate-400 mt-1 block">
            Held safely for {escrows.filter(e => e.status !== 'Released').length} projects
          </span>
        </div>
        <div className="glass-card p-5 border border-white/[0.06]">
          <span className="text-xs text-slate-400">Default Payment Method</span>
          <div className="text-sm font-semibold text-white mt-2 flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-slate-300" /> {defaultCard?.bank} {defaultCard?.type} •••• {defaultCard?.last4}
          </div>
          <button
            onClick={() => setShowCardsModal(true)}
            className="text-xs text-purple-400 hover:text-purple-300 hover:underline cursor-pointer mt-1 block font-medium"
          >
            Manage cards ({cards.length})
          </button>
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
                  onClick={() => setSelectedEscrow(esc)}
                >
                  Release Payment
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Escrow Release Confirmation Modal */}
      {selectedEscrow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="glass-card w-full max-w-md p-6 border border-white/10 shadow-2xl relative">
            <button
              onClick={() => setSelectedEscrow(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Approve & Release Payment</h3>
                <p className="text-xs text-slate-400">Funds transfer immediately to editor wallet</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#0F1420] border border-white/[0.06] space-y-3 mb-5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Project:</span>
                <span className="text-white font-medium">{selectedEscrow.project}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Editor:</span>
                <span className="text-purple-300 font-semibold">{selectedEscrow.editor}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Amount to Release:</span>
                <span className="text-emerald-400 font-bold text-sm">{selectedEscrow.amount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Transfer Fee:</span>
                <span className="text-slate-400">₹0 (Free via Collabo Escrow)</span>
              </div>
            </div>

            <p className="text-xs text-slate-400 mb-5">
              By releasing this milestone, you confirm that you have reviewed the delivered cuts and approve payment to {selectedEscrow.editor}.
            </p>

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setSelectedEscrow(null)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white"
                onClick={handleConfirmRelease}
              >
                Confirm Release
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Manage Cards Modal */}
      {showCardsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="glass-card w-full max-w-lg p-6 border border-white/10 shadow-2xl relative">
            <button
              onClick={() => {
                setShowCardsModal(false);
                setShowAddCard(false);
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-600/20 text-purple-400 flex items-center justify-center border border-purple-500/30">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Payment Methods</h3>
                  <p className="text-xs text-slate-400">Manage billing cards for escrow deposits</p>
                </div>
              </div>
              {!showAddCard && (
                <Button
                  variant="subtle"
                  size="xs"
                  icon={Plus}
                  onClick={() => setShowAddCard(true)}
                >
                  Add Card
                </Button>
              )}
            </div>

            {showAddCard ? (
              <form onSubmit={handleAddCard} className="space-y-4 p-4 rounded-xl bg-[#0F1420] border border-white/[0.06] mb-4">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Add New Card</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Bank Name</label>
                    <input
                      type="text"
                      placeholder="e.g. HDFC, Axis, SBI"
                      value={newCard.bank}
                      onChange={(e) => setNewCard({ ...newCard, bank: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-[#141A28] border border-white/[0.08] text-white focus:outline-none focus:border-purple-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Card Network</label>
                    <select
                      value={newCard.type}
                      onChange={(e) => setNewCard({ ...newCard, type: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-[#141A28] border border-white/[0.08] text-white focus:outline-none focus:border-purple-500"
                    >
                      <option value="Visa">Visa</option>
                      <option value="Mastercard">Mastercard</option>
                      <option value="RuPay">RuPay</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Card Number (Last 4 digits)</label>
                    <input
                      type="text"
                      placeholder="e.g. 5521"
                      maxLength={4}
                      value={newCard.last4}
                      onChange={(e) => setNewCard({ ...newCard, last4: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-[#141A28] border border-white/[0.08] text-white focus:outline-none focus:border-purple-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Expiry (MM/YY)</label>
                    <input
                      type="text"
                      placeholder="e.g. 09/28"
                      value={newCard.expiry}
                      onChange={(e) => setNewCard({ ...newCard, expiry: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-[#141A28] border border-white/[0.08] text-white focus:outline-none focus:border-purple-500"
                      required
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="xs"
                    type="button"
                    onClick={() => setShowAddCard(false)}
                  >
                    Cancel
                  </Button>
                  <Button variant="primary" size="xs" type="submit">
                    Save Card
                  </Button>
                </div>
              </form>
            ) : null}

            <div className="space-y-3 mb-6">
              {cards.map((c) => (
                <div
                  key={c.id}
                  className={`p-3.5 rounded-xl border flex items-center justify-between transition-all ${
                    c.isDefault
                      ? 'bg-purple-950/20 border-purple-700/40'
                      : 'bg-[#141A28]/60 border-white/[0.05]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-white/[0.05] border border-white/10 flex items-center justify-center text-slate-300">
                      <CreditCard className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-white">{c.bank} ({c.type})</h4>
                        {c.isDefault && (
                          <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/20 px-1.5 py-0.5 rounded">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                        •••• •••• •••• {c.last4} • Exp {c.expiry}
                      </p>
                    </div>
                  </div>

                  {!c.isDefault && (
                    <Button
                      variant="subtle"
                      size="xs"
                      onClick={() => setDefaultCard(c.id)}
                    >
                      Make Default
                    </Button>
                  )}
                </div>
              ))}
            </div>

            <Button
              variant="outline"
              className="w-full"
              onClick={() => setShowCardsModal(false)}
            >
              Done
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Payments;
