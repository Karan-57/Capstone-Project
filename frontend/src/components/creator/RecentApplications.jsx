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
    <div className="bg-[#FFFDF9] dark:bg-[#201413] p-5.5 border-2 border-[#382322] dark:border-[#FDEBDE]/30 shadow-[4px_4px_0_#382322] dark:shadow-[4px_4px_0_#000] flex flex-col justify-between h-full">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-serif font-bold text-[#261615] dark:text-[#FDEBDE] tracking-tight">
            Recent Applications
          </h3>
          <button
            onClick={() => navigate('/creator/applications')}
            className="text-xs font-bold uppercase tracking-wider text-[#261615] dark:text-[#FFEBAA] hover:underline cursor-pointer"
          >
            View all →
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-[#FFF7F1] dark:bg-[#19100F] border-2 border-[#382322]/20 dark:border-[#FDEBDE]/20 mb-4 overflow-x-auto">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1 text-xs font-bold font-mono uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'all'
                ? 'bg-[#FFEBAA] text-[#261615] border-2 border-[#382322] shadow-[1px_1px_0_#382322]'
                : 'text-[#5C3A38] dark:text-[#D4B8A8] hover:text-[#261615] dark:hover:text-[#FDEBDE]'
            }`}
          >
            All ({counts.all})
          </button>
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-3 py-1 text-xs font-bold font-mono uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'pending'
                ? 'bg-[#FFEBAA] text-[#261615] border-2 border-[#382322] shadow-[1px_1px_0_#382322]'
                : 'text-[#5C3A38] dark:text-[#D4B8A8] hover:text-[#261615] dark:hover:text-[#FDEBDE]'
            }`}
          >
            Pending ({counts.pending})
          </button>
          <button
            onClick={() => setActiveTab('accepted')}
            className={`px-3 py-1 text-xs font-bold font-mono uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'accepted'
                ? 'bg-[#FFEBAA] text-[#261615] border-2 border-[#382322] shadow-[1px_1px_0_#382322]'
                : 'text-[#5C3A38] dark:text-[#D4B8A8] hover:text-[#261615] dark:hover:text-[#FDEBDE]'
            }`}
          >
            Accepted ({counts.accepted})
          </button>
          <button
            onClick={() => setActiveTab('rejected')}
            className={`px-3 py-1 text-xs font-bold font-mono uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'rejected'
                ? 'bg-[#FFEBAA] text-[#261615] border-2 border-[#382322] shadow-[1px_1px_0_#382322]'
                : 'text-[#5C3A38] dark:text-[#D4B8A8] hover:text-[#261615] dark:hover:text-[#FDEBDE]'
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
              className="flex items-center justify-between p-3.5 bg-[#FFF7F1] dark:bg-[#19100F] border-2 border-[#382322] dark:border-[#FDEBDE]/30 shadow-[2px_2px_0_#382322] dark:shadow-[2px_2px_0_#000] transition-all"
            >
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src={app.avatar || DEFAULT_PFP}
                  alt={app.name || 'Applicant avatar'}
                  loading="lazy"
                  onError={(e) => { e.currentTarget.src = DEFAULT_PFP; }}
                  className="w-10 h-10 rounded-none object-cover border-2 border-[#382322] dark:border-[#FDEBDE]/40 shadow-[1px_1px_0_#382322] shrink-0"
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-bold text-[#261615] dark:text-[#FDEBDE] truncate">
                      {app.name}
                    </span>
                    {app.rating && (
                      <span className="flex items-center gap-0.5 text-[11px] font-bold text-[#261615] dark:text-[#FFEBAA]">
                        <Star className="w-3 h-3 fill-[#FFEBAA] text-[#382322]" />
                        {app.rating}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#5C3A38] dark:text-[#D4B8A8] mt-0.5 font-mono">
                    {app.price} • {app.duration}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 shrink-0">
                {app.status === 'pending' ? (
                  <>
                    <button
                      onClick={() => onStatusChange && onStatusChange(app.id, 'accepted')}
                      className="px-3 py-1.5 bg-[#FFEBAA] hover:bg-[#ffe58f] text-[#261615] border-2 border-[#382322] shadow-[1px_1px_0_#382322] text-xs font-bold font-mono uppercase tracking-wider cursor-pointer active:translate-x-0.5 active:translate-y-0.5"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => onStatusChange && onStatusChange(app.id, 'rejected')}
                      className="px-3 py-1.5 bg-rose-100 hover:bg-rose-200 text-rose-900 border-2 border-[#382322] shadow-[1px_1px_0_#382322] text-xs font-bold font-mono uppercase tracking-wider cursor-pointer active:translate-x-0.5 active:translate-y-0.5"
                    >
                      Reject
                    </button>
                  </>
                ) : (
                  <span
                    className={`px-2.5 py-1 text-[10px] font-bold font-mono uppercase tracking-wider border-2 border-[#382322] ${
                      app.status === 'accepted'
                        ? 'bg-[#FFEBAA] text-[#261615]'
                        : 'bg-rose-100 text-rose-900'
                    }`}
                  >
                    {app.status}
                  </span>
                )}
              </div>
            </div>
          ))}

          {filteredApplications.length === 0 && (
            <div className="py-6 text-center text-xs text-[#5C3A38] dark:text-[#D4B8A8]">
              No applications in this status.
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t-2 border-[#382322]/10 dark:border-[#FDEBDE]/10">
        <button
          onClick={() => navigate('/creator/applications')}
          className="w-full py-2.5 text-xs font-bold font-mono uppercase tracking-wider text-[#261615] dark:text-[#FDEBDE] bg-[#FFF7F1] dark:bg-[#19100F] hover:bg-[#FDEBDE] border-2 border-[#382322] dark:border-[#FDEBDE]/30 shadow-[2px_2px_0_#382322] transition-all cursor-pointer active:translate-x-0.5 active:translate-y-0.5"
        >
          Manage Applications →
        </button>
      </div>
    </div>
  );
};

export default RecentApplications;
