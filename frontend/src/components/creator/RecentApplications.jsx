import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Check, X } from 'lucide-react';
import Button from '../common/Button';
import { DEFAULT_PFP } from '../../constants/assets';

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
    <div className="glass-card p-5.5 flex flex-col justify-between h-full">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-3.5">
          <h3 className="text-base font-semibold text-[#3C2415] tracking-tight">
            My Applications
          </h3>
          <button
            onClick={() => navigate('/creator/applications')}
            className="text-xs font-medium text-[#77736D] hover:text-[#3C2415] transition-colors"
          >
            View all
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-[#F0EDE5] rounded-xl border border-[#E5E0D7] mb-4 overflow-x-auto">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1 text-xs font-medium rounded-lg transition-all ${
              activeTab === 'all'
                ? 'bg-[#3C2415] text-[#F7F5F0] shadow-sm'
                : 'text-[#77736D] hover:text-[#3C2415]'
            }`}
          >
            All ({counts.all})
          </button>
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-3 py-1 text-xs font-medium rounded-lg transition-all ${
              activeTab === 'pending'
                ? 'bg-[#3C2415] text-[#F7F5F0] shadow-sm'
                : 'text-[#77736D] hover:text-[#3C2415]'
            }`}
          >
            Pending ({counts.pending})
          </button>
          <button
            onClick={() => setActiveTab('accepted')}
            className={`px-3 py-1 text-xs font-medium rounded-lg transition-all ${
              activeTab === 'accepted'
                ? 'bg-[#3C2415] text-[#F7F5F0] shadow-sm'
                : 'text-[#77736D] hover:text-[#3C2415]'
            }`}
          >
            Accepted ({counts.accepted})
          </button>
          <button
            onClick={() => setActiveTab('rejected')}
            className={`px-3 py-1 text-xs font-medium rounded-lg transition-all ${
              activeTab === 'rejected'
                ? 'bg-[#3C2415] text-[#F7F5F0] shadow-sm'
                : 'text-[#77736D] hover:text-[#3C2415]'
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
              className="flex items-center justify-between p-3 rounded-xl bg-[#F0EDE5]/50 border border-[#E5E0D7] hover:border-[#DDD9CE] hover:bg-[#F0EDE5] transition-all"
            >
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src={app.avatar || DEFAULT_PFP}
                  alt={app.name || 'Applicant avatar'}
                  loading="lazy"
                  onError={(e) => { e.currentTarget.src = DEFAULT_PFP; }}
                  className="w-10 h-10 rounded-full object-cover border border-[#E5E0D7] shrink-0"
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-semibold text-[#3C2415] truncate">
                      {app.name}
                    </span>
                    {app.rating && (
                      <span className="flex items-center gap-0.5 text-[11px] font-bold text-amber-600">
                        <Star className="w-3 h-3 fill-amber-500" />
                        {app.rating}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#77736D] mt-0.5">
                    {app.price} • {app.duration}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 shrink-0">
                <Button
                  variant="subtle"
                  size="xs"
                  onClick={() => navigate('/creator/profile')}
                  className="hidden sm:inline-flex bg-white hover:bg-[#F0EDE5] text-[#3C2415] border border-[#E5E0D7]"
                >
                  View Profile
                </Button>

                {app.status === 'pending' ? (
                  <>
                    <Button
                      variant="accept"
                      size="xs"
                      onClick={() => onStatusChange && onStatusChange(app.id, 'accepted')}
                      className="px-2.5 font-medium"
                    >
                      Accept
                    </Button>
                    <Button
                      variant="reject"
                      size="xs"
                      onClick={() => onStatusChange && onStatusChange(app.id, 'rejected')}
                      className="px-2.5 font-medium"
                    >
                      Reject
                    </Button>
                  </>
                ) : (
                  <span
                    className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg capitalize ${
                      app.status === 'accepted'
                        ? 'bg-[#55745C]/15 text-[#55745C] border border-[#55745C]/25'
                        : 'bg-[#A34F45]/15 text-[#A34F45] border border-[#A34F45]/25'
                    }`}
                  >
                    {app.status}
                  </span>
                )}
              </div>
            </div>
          ))}

          {filteredApplications.length === 0 && (
            <div className="py-6 text-center text-xs text-[#77736D]">
              No applications in this status.
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-[#E5E0D7]">
        <button
          onClick={() => navigate('/creator/applications')}
          className="w-full py-2 text-xs font-medium text-[#3C2415] hover:bg-[#F0EDE5] bg-white rounded-xl border border-[#E5E0D7] transition-colors"
        >
          Manage Applications
        </button>
      </div>
    </div>
  );
};

export default RecentApplications;
