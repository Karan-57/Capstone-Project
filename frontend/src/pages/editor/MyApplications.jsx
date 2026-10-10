import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileCheck2 } from 'lucide-react';
import Button from '../../components/common/Button';
import { SkeletonRow } from '../../components/common/Skeleton';
import SEO from '../../components/common/SEO';
import { applicationService } from '../../services/applicationService';

export const MyApplications = () => {
  const navigate = useNavigate();
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
      <SEO
        title="My Proposals"
        description="Track the status of your video editing bids, creator reviews, and accepted contracts."
      />

      <div>
        <h2 className="text-xl font-bold text-white tracking-tight">My Submitted Proposals</h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Track the status of your pitches, client feedback, and accepted video editing contracts
        </p>
      </div>

      {loading ? (
        <div className="space-y-3">
          <SkeletonRow />
          <SkeletonRow />
          <SkeletonRow />
        </div>
      ) : bids.length === 0 ? (
        <div className="glass-card p-12 text-center border border-white/[0.06] rounded-2xl">
          <FileCheck2 className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <h4 className="text-sm font-semibold text-white">No submitted proposals yet</h4>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Browse open creator briefs in the marketplace and submit your first bid.
          </p>
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/editor/browse')}
            className="mt-4"
          >
            Browse Creator Gigs
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {bids.map((bid) => (
            <div key={bid.id} className="glass-card p-4 sm:p-5 border border-white/[0.06] space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-white truncate">{bid.projectTitle || 'unknown'}</h3>
                  <p className="text-xs text-slate-400 mt-0.5 truncate">
                    Client: <span className="text-slate-200">{bid.creatorName || 'unknown'}</span> • Submitted {bid.createdAt || 'unknown'}
                  </p>
                </div>
                <div className="flex items-center gap-3 self-start sm:self-auto shrink-0">
                  <span className="text-sm font-bold text-white">
                    {bid.bidAmount != null && bid.bidAmount !== 999 ? `₹${bid.bidAmount}` : '999'}
                  </span>
                  <span className={`px-2.5 py-1 text-xs font-semibold rounded-lg border capitalize ${getStatusBadge(bid.status)}`}>
                    {bid.status || 'pending'}
                  </span>
                </div>
              </div>

              {bid.proposal && (
                <div className="text-xs text-slate-300 bg-white/[0.02] p-3 rounded-xl border border-white/[0.04] leading-relaxed">
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
