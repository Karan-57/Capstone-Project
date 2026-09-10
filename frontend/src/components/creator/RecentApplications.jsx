import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star } from 'lucide-react';
import Button from '../common/Button';

export const RecentApplications = ({ applications = [], onStatusChange }) => {
  const [activeTab, setActiveTab] = useState('all');
  const navigate = useNavigate();

  const counts = {
    all: applications.length,
    pending: applications.filter(a => a.status === 'pending').length,
    accepted: applications.filter(a => a.status === 'accepted').length,
    rejected: applications.filter(a => a.status === 'rejected').length,
  };

  const filteredApplications = applications.filter(app => {
    if (activeTab === 'all') return true;
    return app.status === activeTab;
  });

  return (
    <div className="glass-card p-6 flex flex-col justify-between h-full">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-3.5">
          <h3 className="text-base font-semibold text-white tracking-tight">
            My Applications
          </h3>
          <button
            onClick={() => navigate('/creator/applications')}
            className="text-xs font-medium text-purple-400 hover:text-purple-300 transition-colors"
          >
            View all
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-[#0A0D15]/80 rounded-xl border border-white/[0.05] mb-4 overflow-x-auto">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1 text-xs font-medium rounded-lg transition-all ${
              activeTab === 'all'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All ({counts.all})
          </button>
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-3 py-1 text-xs font-medium rounded-lg transition-all ${
              activeTab === 'pending'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Pending ({counts.pending})
          </button>
          <button
            onClick={() => setActiveTab('accepted')}
            className={`px-3 py-1 text-xs font-medium rounded-lg transition-all ${
              activeTab === 'accepted'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Accepted ({counts.accepted})
          </button>
          <button
            onClick={() => setActiveTab('rejected')}
            className={`px-3 py-1 text-xs font-medium rounded-lg transition-all ${
              activeTab === 'rejected'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Rejected ({counts.rejected})
          </button>
        </div>

        {/* Applications List */}
        <div className="space-y-3">
          {filteredApplications.slice(0, 3).map((app) => (
            <div
              key={app.id}
              className="flex items-center justify-between p-3 rounded-xl bg-[#141A28]/50 border border-white/[0.04] hover:border-white/[0.1] transition-all"
            >
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src={app.avatar}
                  alt={app.name}
                  className="w-10 h-10 rounded-full object-cover border border-white/10 shrink-0"
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-semibold text-white truncate">
                      {app.name}
                    </span>
                    {app.rating && (
                      <span className="flex items-center gap-0.5 text-[11px] font-bold text-amber-400">
                        <Star className="w-3 h-3 fill-amber-400" />
                        {app.rating}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {app.price} • {app.duration}
                  </p>
                </div>
              </div>

              {/* Action Buttons matching screenshot */}
              <div className="flex items-center gap-2 shrink-0">
                <Button
                  variant="subtle"
                  size="xs"
                  onClick={() => navigate('/creator/profile')}
                  className="hidden sm:inline-flex bg-[#1E2638] hover:bg-[#253047] text-slate-300"
                >
                  View Profile
                </Button>

                {app.status === 'pending' ? (
                  <>
                    <Button
                      variant="accept"
                      size="xs"
                      onClick={() => onStatusChange && onStatusChange(app.id, 'accepted')}
                      className="px-2.5 bg-emerald-600 hover:bg-emerald-500 font-medium"
                    >
                      Accept
                    </Button>
                    <Button
                      variant="reject"
                      size="xs"
                      onClick={() => onStatusChange && onStatusChange(app.id, 'rejected')}
                      className="px-2.5 bg-rose-600 hover:bg-rose-500 font-medium"
                    >
                      Reject
                    </Button>
                  </>
                ) : (
                  <span
                    className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg capitalize ${
                      app.status === 'accepted'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    }`}
                  >
                    {app.status}
                  </span>
                )}
              </div>
            </div>
          ))}

          {filteredApplications.length === 0 && (
            <div className="py-6 text-center text-xs text-slate-400">
              No applications in this status.
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-white/[0.04]">
        <button
          onClick={() => navigate('/creator/applications')}
          className="w-full py-2 text-xs font-medium text-slate-300 hover:text-white bg-white/[0.03] hover:bg-white/[0.07] rounded-xl border border-white/[0.06] transition-colors"
        >
          Manage Applications
        </button>
      </div>
    </div>
  );
};

export default RecentApplications;
