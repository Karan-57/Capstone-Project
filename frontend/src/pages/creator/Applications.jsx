import React, { useState } from 'react';
import { Star, Check, X, Search } from 'lucide-react';
import Button from '../../components/common/Button';
import { initialApplicationsData } from '../../services/applicationService';

export const Applications = () => {
  const [applications, setApplications] = useState(initialApplicationsData);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const handleStatusChange = (id, newStatus) => {
    setApplications(prev =>
      prev.map(app => (app.id === id ? { ...app, status: newStatus } : app))
    );
  };

  const filtered = applications.filter(app => {
    const matchesFilter = filter === 'all' || app.status === filter;
    const matchesSearch = app.name.toLowerCase().includes(search.toLowerCase()) ||
                          app.role.toLowerCase().includes(search.toLowerCase()) ||
                          app.appliedFor.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight">Editor Proposals & Applications</h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Review video editing candidates, test reels, proposed rates, and turnaround times
        </p>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 p-1 bg-[#0A0D15]/80 rounded-xl border border-white/[0.05]">
          {['all', 'pending', 'accepted', 'rejected'].map(tab => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg capitalize transition-all ${
                filter === tab
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by editor name, role, project..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 pr-3 py-1.5 text-xs rounded-xl bg-[#0F1420] text-slate-200 border border-white/[0.08] focus:outline-none focus:border-purple-500 w-64"
          />
        </div>
      </div>

      {/* Applications List */}
      <div className="space-y-3">
        {filtered.map((app) => (
          <div
            key={app.id}
            className="glass-card p-4.5 border border-white/[0.06] flex flex-col md:flex-row md:items-center justify-between gap-4"
          >
            <div className="flex items-start gap-3.5 min-w-0">
              <img
                src={app.avatar}
                alt={app.name}
                className="w-12 h-12 rounded-full object-cover border border-white/10 shrink-0"
              />
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-sm font-bold text-white">{app.name}</h4>
                  <span className="flex items-center gap-0.5 text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                    <Star className="w-3 h-3 fill-amber-400" />
                    {app.rating}
                  </span>
                  <span className="text-xs text-slate-400">• {app.role}</span>
                </div>
                <p className="text-xs text-purple-300 mt-1">
                  Applied for: <strong className="font-semibold">{app.appliedFor}</strong>
                </p>
                <div className="flex items-center gap-4 text-xs text-slate-400 mt-2">
                  <span>Proposed Rate: <strong className="text-emerald-400">{app.price}</strong></span>
                  <span>Turnaround: <strong className="text-white">{app.duration}</strong></span>
                  <span>{app.appliedDate}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
              {app.status === 'pending' ? (
                <>
                  <Button
                    variant="accept"
                    size="sm"
                    icon={Check}
                    onClick={() => handleStatusChange(app.id, 'accepted')}
                  >
                    Accept Application
                  </Button>
                  <Button
                    variant="reject"
                    size="sm"
                    icon={X}
                    onClick={() => handleStatusChange(app.id, 'rejected')}
                  >
                    Reject
                  </Button>
                </>
              ) : (
                <span
                  className={`px-3 py-1.5 text-xs font-semibold rounded-xl capitalize ${
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
      </div>
    </div>
  );
};

export default Applications;
