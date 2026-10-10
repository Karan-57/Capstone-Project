import React, { useState, useEffect } from 'react';
import { Star, Check, X, User, DollarSign, Clock, Search, Sparkles, Award } from 'lucide-react';
import Button from '../../components/common/Button';
import { SkeletonRow } from '../../components/common/Skeleton';
import SEO from '../../components/common/SEO';
import { applicationService } from '../../services/applicationService';
import api from '../../services/api';
import { useAlert } from '../../context/AlertContext';
import { DEFAULT_PFP } from '../../constants/assets';

export const Applications = () => {
  const { showAlert } = useAlert();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [aiPicks, setAiPicks] = useState(null);
  const [isAnalyzingAi, setIsAnalyzingAi] = useState(false);

  const loadApps = async () => {
    setLoading(true);
    const data = await applicationService.getApplications();
    setApplications(data);
    setLoading(false);
  };

  useEffect(() => {
    loadApps();
  }, []);

  const handleAiAnalyzeProposals = async () => {
    if (applications.length === 0) {
      showAlert('No proposals available to evaluate.', 'warning');
      return;
    }
    setIsAnalyzingAi(true);
    try {
      const firstApp = applications[0];
      const projectPayload = {
        title: firstApp.projectTitle || 'Video Project',
        category: firstApp.projectCategory || 'General',
        budget: firstApp.projectBudget || 'Flexible',
        requiredSkills: firstApp.projectSkills || [],
        timeline: firstApp.projectDeadline || 'Flexible'
      };

      const proposalsPayload = applications.map(app => ({
        proposalId: String(app.id),
        editorName: app.name,
        bidAmount: app.bidAmount || parseInt(String(app.price).replace(/[^0-9]/g, ''), 10) || 15000,
        deliveryDays: app.deliveryDays || parseInt(String(app.duration).replace(/[^0-9]/g, ''), 10) || 5,
        coverNote: app.coverNote || '',
        editor: {
          rating: app.rating || 0,
          totalReviews: app.totalReviews || 0,
          tools: ['Premiere Pro', 'After Effects'],
          skills: ['Video Editing', 'Pacing']
        }
      }));

      const res = await api.post('/api/ai/suggest-top-proposals', {
        project: projectPayload,
        proposals: proposalsPayload
      });

      if (res.data?.data) {
        setAiPicks(res.data.data);
        showAlert('AI evaluated candidate pool and identified Top 3 picks!', 'success');
      }
    } catch (err) {
      console.warn('Failed to rank proposals with AI:', err);
      showAlert(err.response?.data?.message || 'Unable to generate AI analysis at this moment.', 'warning');
    } finally {
      setIsAnalyzingAi(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      if (newStatus === 'accepted') {
        await api.post(`/api/application/${id}/accept`);
        showAlert('Application accepted! Project assigned and workspace initialized.', 'success');
      } else if (newStatus === 'rejected') {
        await api.post(`/api/application/${id}/reject`);
        showAlert('Application rejected.', 'info');
      }
      setApplications(prev =>
        prev.map(app => (app.id === id ? { ...app, status: newStatus } : app))
      );
    } catch (err) {
      console.error('Failed to update application status:', err);
      showAlert(err.response?.data?.message || 'Failed to update application status', 'error');
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
      <SEO
        title="Proposals & Applications"
        description="Review video editing candidates, test reels, proposed rates, and AI-curated top picks."
      />

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

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={handleAiAnalyzeProposals}
            disabled={isAnalyzingAi || applications.length === 0}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-purple-600/25 via-indigo-600/25 to-purple-500/20 hover:from-purple-600/40 hover:to-indigo-600/40 border border-purple-500/40 text-purple-300 hover:text-white shadow-sm transition-all cursor-pointer group disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Sparkles className={`w-3.5 h-3.5 text-purple-400 group-hover:rotate-12 transition-transform ${isAnalyzingAi ? 'animate-spin' : ''}`} />
            <span>{isAnalyzingAi ? 'Analyzing Pool...' : 'AI Top 3 Picks'}</span>
          </button>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by editor name, role, project..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs rounded-xl bg-[#0F1420] text-slate-200 border border-white/[0.08] focus:outline-none focus:border-purple-500 w-48 sm:w-64"
            />
          </div>
        </div>
      </div>

      {/* AI Evaluation Banner */}
      {aiPicks && (
        <div className="glass-card p-4.5 rounded-2xl border border-purple-500/30 bg-gradient-to-br from-purple-950/30 via-[#0E1322] to-indigo-950/20 space-y-2 animate-fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">AI Candidate Evaluation</h4>
            </div>
            <button
              onClick={() => setAiPicks(null)}
              className="text-[11px] text-slate-400 hover:text-white cursor-pointer"
            >
              Dismiss
            </button>
          </div>
          <p className="text-xs text-slate-200 leading-relaxed">{aiPicks.summaryEvaluation}</p>
          {aiPicks.adviceForCreator && (
            <p className="text-[11px] text-purple-300 bg-purple-900/20 border border-purple-800/30 px-3 py-1.5 rounded-xl">
              💡 <strong>Hiring Advice:</strong> {aiPicks.adviceForCreator}
            </p>
          )}
        </div>
      )}

      {/* Applications List */}
      {loading ? (
        <div className="space-y-3">
          <SkeletonRow />
          <SkeletonRow />
          <SkeletonRow />
          <SkeletonRow />
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center text-xs text-slate-500">
          No applications found
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((app) => {
            const aiPick = aiPicks?.topPicks?.find(
              (p) => p.proposalId === String(app.id) || p.editorName === app.name
            );

            return (
              <div
                key={app.id}
                className={`glass-card p-5 border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  aiPick ? 'border-purple-500/50 bg-purple-950/10 ring-1 ring-purple-500/20' : 'border-white/[0.06]'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <img
                    src={app.avatar || DEFAULT_PFP}
                    alt={app.name || 'unknown'}
                    onError={(e) => { e.currentTarget.src = DEFAULT_PFP; }}
                    className="w-12 h-12 rounded-xl object-cover border border-white/10 shrink-0"
                  />
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-bold text-white">{app.name || 'unknown'}</h3>
                      <span className="text-xs text-amber-400 font-semibold flex items-center gap-0.5">
                        <Star className="w-3 h-3 fill-amber-400" />
                        {app.rating != null ? app.rating : 0}
                      </span>
                      {aiPick && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-gradient-to-r from-purple-500/30 to-emerald-500/30 text-purple-300 border border-purple-500/40">
                          <Award className="w-3 h-3 text-purple-400" />
                          #{aiPick.rank} Top Pick ({aiPick.matchScore}% Match)
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">{app.role || 'unknown'}</p>
                    <p className="text-[11px] text-purple-300 font-medium mt-1">
                      Applied for: {app.appliedFor || 'unknown'} • {app.appliedDate || 'unknown'}
                    </p>
                    {aiPick?.whySelected && (
                      <p className="text-[11px] text-emerald-300/90 mt-1.5 italic bg-emerald-950/30 border border-emerald-800/30 px-2.5 py-1 rounded-lg">
                        ✨ {aiPick.whySelected}
                      </p>
                    )}
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
          );
        })}
        </div>
      )}
    </div>
  );
};

export default Applications;
