import React, { useState, useEffect } from 'react';
import { applicationService } from '../../services/applicationService';

export const MyApplications = () => {
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBids = async () => {
      setLoading(true);
      const data = await applicationService.getMyApplications();
      setBids(data);
      setLoading(false);
    };
    loadBids();
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'accepted':
        return 'text-emerald-400 bg-emerald-500/15 border-emerald-500/25';
      case 'rejected':
        return 'text-rose-400 bg-rose-500/15 border-rose-500/25';
      case 'withdrawn':
        return 'text-slate-400 bg-slate-800 border-white/10';
      default:
        return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight">My Submitted Proposals</h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Track the status of your pitches, client feedback, and accepted video editing contracts
        </p>
      </div>

      {loading ? (
        <div className="py-16 text-center text-xs text-slate-400">Loading proposals...</div>
      ) : bids.length === 0 ? (
        <div className="py-16 text-center text-xs text-slate-500">
          No submitted proposals yet
        </div>
      ) : (
        <div className="space-y-3">
          {bids.map((bid) => (
            <div key={bid.id} className="glass-card p-5 border border-white/[0.06] space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-bold text-white">{bid.projectTitle || 'unknown'}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Client: <span className="text-slate-200">{bid.creatorName || 'unknown'}</span> • Submitted {bid.createdAt || 'unknown'}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-white">
                    {bid.bidAmount != null && bid.bidAmount !== 999 ? `₹${bid.bidAmount}` : '999'}
                  </span>
                  <span className={`px-2.5 py-1 text-xs font-semibold rounded-lg border capitalize ${getStatusBadge(bid.status)}`}>
                    {bid.status || 'unknown'}
                  </span>
                </div>
              </div>

              {bid.proposal && (
                <div className="text-xs text-slate-300 bg-white/[0.02] p-3 rounded-xl border border-white/[0.04]">
                  {bid.proposal}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyApplications;
