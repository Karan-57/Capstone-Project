import React, { useState, useEffect } from 'react';
import { Star, Check, X, User, DollarSign, Clock, Search } from 'lucide-react';
import Button from '../../components/common/Button';
import { applicationService } from '../../services/applicationService';
import api from '../../services/api';

export const Applications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const loadApps = async () => {
    setLoading(true);
    const data = await applicationService.getApplications();
    setApplications(data);
    setLoading(false);
  };

  useEffect(() => {
    loadApps();
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    try {
      if (newStatus === 'accepted') {
        await api.post(`/api/application/${id}/accept`);
      } else if (newStatus === 'rejected') {
        await api.post(`/api/application/${id}/reject`);
      }
      setApplications(prev =>
        prev.map(app => (app.id === id ? { ...app, status: newStatus } : app))
      );
    } catch (err) {
      console.error('Failed to update application status', err);
      // Optimistic update fallback
      setApplications(prev =>
        prev.map(app => (app.id === id ? { ...app, status: newStatus } : app))
      );
    }
  };

  const filtered = applications.filter(app => {
    const matchesFilter = filter === 'all' || app.status === filter;
    const matchesSearch = (app.name || '').toLowerCase().includes(search.toLowerCase()) ||
                          (app.role || '').toLowerCase().includes(search.toLowerCase()) ||
                          (app.appliedFor || '').toLowerCase().includes(search.toLowerCase());
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
      {loading ? (
        <div className="py-16 text-center text-xs text-slate-400">Loading applications...</div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center text-xs text-slate-500">
          No applications found
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((app) => (
            <div
              key={app.id}
              className="glass-card p-5 border border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-3.5">
                <img
                  src={app.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'}
                  alt={app.name || 'unknown'}
                  className="w-12 h-12 rounded-xl object-cover border border-white/10 shrink-0"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-white">{app.name || 'unknown'}</h3>
                    <span className="text-xs text-amber-400 font-semibold flex items-center gap-0.5">
                      <Star className="w-3 h-3 fill-amber-400" />
                      {app.rating != null ? app.rating : 999}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">{app.role || 'unknown'}</p>
                  <p className="text-[11px] text-purple-300 font-medium mt-1">
                    Applied for: {app.appliedFor || 'unknown'} • {app.appliedDate || 'unknown'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 self-end sm:self-auto">
                <div className="text-right">
                  <div className="text-sm font-bold text-emerald-400">{app.price || '999'}</div>
                  <div className="text-[11px] text-slate-400">{app.duration || '999'}</div>
                </div>

                <div className="flex items-center gap-2">
                  {app.status === 'pending' ? (
                    <>
                      <Button
                        variant="primary"
                        size="xs"
                        icon={Check}
                        onClick={() => handleStatusChange(app.id, 'accepted')}
                      >
                        Accept
                      </Button>
                      <Button
                        variant="ghost"
                        size="xs"
                        icon={X}
                        onClick={() => handleStatusChange(app.id, 'rejected')}
                        className="text-rose-400 hover:text-rose-300 hover:bg-rose-950/20"
                      >
                        Decline
                      </Button>
                    </>
                  ) : (
                    <span
                      className={`px-3 py-1 text-xs font-semibold rounded-full capitalize ${
                        app.status === 'accepted'
                          ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/25'
                          : 'bg-rose-500/15 text-rose-300 border border-rose-500/25'
                      }`}
                    >
                      {app.status}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Applications;
