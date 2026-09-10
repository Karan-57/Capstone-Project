import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Compass, Trash2 } from 'lucide-react';
import Button from '../../components/common/Button';

export const MyApplications = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [bids, setBids] = useState([
    {
      id: 'bid-1',
      title: 'Cinematic YouTube Travel Vlog (4K 60fps)',
      creator: 'Mark Goldbridge',
      submittedDate: '2 days ago',
      rate: '₹24,000',
      status: 'Under Review',
      statusKey: 'under_review',
      statusColor: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
      note: 'Shared my Iceland cinematic sequence portfolio link.',
      canWithdraw: true,
    },
    {
      id: 'bid-2',
      title: 'High-Retention TikTok / Instagram Reels Batch (10 Videos)',
      creator: 'Sarah Jenkins',
      submittedDate: 'Yesterday',
      rate: '₹32,000',
      status: 'Shortlisted',
      statusKey: 'shortlisted',
      statusColor: 'text-purple-300 bg-purple-500/20 border-purple-500/30',
      note: 'Creator asked for a 30-second trial sample with Hormozi captions.',
      canWithdraw: false,
    },
    {
      id: 'bid-3',
      title: 'SaaS Product Walkthrough Demo',
      creator: 'CloudFlow Labs',
      submittedDate: 'Aug 28, 2026',
      rate: '₹28,000',
      status: 'Accepted & Contract Started',
      statusKey: 'accepted',
      statusColor: 'text-emerald-400 bg-emerald-500/15 border-emerald-500/25',
      note: 'Contract active. Deliverable v1 due in 18 hours.',
      canWithdraw: false,
    },
  ]);

  const handleWithdraw = (id) => {
    setBids(prev => prev.filter(b => b.id !== id));
  };

  const filteredBids = bids.filter(bid => {
    const matchesFilter = filter === 'all' || bid.statusKey === filter;
    const matchesSearch = bid.title.toLowerCase().includes(search.toLowerCase()) ||
                          bid.creator.toLowerCase().includes(search.toLowerCase()) ||
                          bid.note.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">My Submitted Proposals</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Track the status of your pitches, client feedback, and accepted video editing contracts
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          icon={Compass}
          onClick={() => navigate('/editor/browse')}
        >
          Find More Projects
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 p-1 bg-[#0A0D15]/80 rounded-xl border border-white/[0.05] overflow-x-auto">
          {[
            { id: 'all', label: 'All' },
            { id: 'under_review', label: 'Under Review' },
            { id: 'shortlisted', label: 'Shortlisted' },
            { id: 'accepted', label: 'Accepted' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg capitalize whitespace-nowrap transition-all ${
                filter === tab.id
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search proposals..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 pr-3 py-1.5 text-xs rounded-xl bg-[#0F1420] text-slate-200 border border-white/[0.08] focus:outline-none focus:border-purple-500 w-64"
          />
        </div>
      </div>

      {/* Proposals List */}
      <div className="space-y-3">
        {filteredBids.map((bid) => (
          <div key={bid.id} className="glass-card p-5 border border-white/[0.06] space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-white">{bid.title}</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Client: <span className="text-slate-200 font-medium">{bid.creator}</span> • Submitted {bid.submittedDate}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-white">{bid.rate}</span>
                <span className={`px-2.5 py-1 text-xs font-semibold rounded-lg border ${bid.statusColor}`}>
                  {bid.status}
                </span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.03] text-xs text-slate-300">
              <strong className="text-white block mb-0.5">Proposal Pitch:</strong>
              {bid.note}
            </div>

            <div className="pt-2 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">
                Platform Protection: <strong className="text-emerald-400">Escrow Ready</strong>
              </span>
              {bid.canWithdraw && (
                <Button
                  variant="subtle"
                  size="xs"
                  icon={Trash2}
                  onClick={() => handleWithdraw(bid.id)}
                  className="text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
                >
                  Withdraw Pitch
                </Button>
              )}
            </div>
          </div>
        ))}

        {filteredBids.length === 0 && (
          <div className="glass-card p-8 text-center text-xs text-slate-400 space-y-2">
            <p>No proposals match the selected filter.</p>
            <Button
              variant="outline"
              size="xs"
              onClick={() => { setFilter('all'); setSearch(''); }}
            >
              Reset Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyApplications;
