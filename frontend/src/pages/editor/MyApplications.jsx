import React, { useState } from 'react';

export const MyApplications = () => {
  const [bids] = useState([
    {
      id: 'bid-1',
      title: 'Cinematic YouTube Travel Vlog (4K 60fps)',
      creator: 'Mark Goldbridge',
      submittedDate: '2 days ago',
      rate: '₹24,000',
      status: 'Under Review',
      statusColor: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
      note: 'Shared my Iceland cinematic sequence portfolio link.',
    },
    {
      id: 'bid-2',
      title: 'High-Retention TikTok / Instagram Reels Batch (10 Videos)',
      creator: 'Sarah Jenkins',
      submittedDate: 'Yesterday',
      rate: '₹32,000',
      status: 'Shortlisted',
      statusColor: 'text-purple-300 bg-purple-500/20 border-purple-500/30',
      note: 'Creator asked for a 30-second trial sample with Hormozi captions.',
    },
    {
      id: 'bid-3',
      title: 'SaaS Product Walkthrough Demo',
      creator: 'CloudFlow Labs',
      submittedDate: 'Aug 28, 2026',
      rate: '₹28,000',
      status: 'Accepted & Contract Started',
      statusColor: 'text-emerald-400 bg-emerald-500/15 border-emerald-500/25',
      note: 'Contract active. Deliverable v1 due in 18 hours.',
    },
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight">My Submitted Proposals</h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Track the status of your pitches, client feedback, and accepted video editing contracts
        </p>
      </div>

      <div className="space-y-3">
        {bids.map((bid) => (
          <div key={bid.id} className="glass-card p-5 border border-white/[0.06] space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-white">{bid.title}</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Client: <span className="text-slate-200">{bid.creator}</span> • Submitted {bid.submittedDate}
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
              <strong className="text-white block mb-0.5">Proposal Note:</strong>
              {bid.note}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyApplications;
