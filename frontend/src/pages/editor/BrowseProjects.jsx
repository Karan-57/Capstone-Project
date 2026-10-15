import React, { useState, useEffect } from 'react';
import { Search, Clock, CheckCircle, Send, X, Sparkles } from 'lucide-react';
import Button from '../../components/common/Button';
import { SkeletonCard } from '../../components/common/Skeleton';
import SEO from '../../components/common/SEO';
import { projectService } from '../../services/projectService';
import api from '../../services/api';
import { useAlert } from '../../context/AlertContext';
import { DEFAULT_PFP } from '../../constants/assets';

export const BrowseProjects = () => {
  const { showAlert } = useAlert();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTag, setSelectedTag] = useState('All');
  const [search, setSearch] = useState('');
  const [proposalModal, setProposalModal] = useState(null);
  const [bidAmount, setBidAmount] = useState('');
  const [bidCover, setBidCover] = useState('');
  const [estimatedDays, setEstimatedDays] = useState('7');
  const [isAiSuggestingBid, setIsAiSuggestingBid] = useState(false);

  const loadProjects = async () => {
    setLoading(true);
    const data = await projectService.getEditorRecommended();
    setProjects(data);
    setLoading(false);
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const tagsList = ['All', 'Premiere Pro', 'After Effects', 'DaVinci Resolve', 'Shorts', 'Video Editing'];

  const filtered = projects.filter(p => {
    const matchesTag = selectedTag === 'All' || (p.tags && p.tags.some(t => t.toLowerCase().includes(selectedTag.toLowerCase())));
    const matchesSearch = (p.title || '').toLowerCase().includes(search.toLowerCase()) || 
                          (p.creator || '').toLowerCase().includes(search.toLowerCase());
    return matchesTag && matchesSearch;
  });

  const handleSendProposal = async (e) => {
    e.preventDefault();
    if (!bidCover.trim()) {
      showAlert('Please enter a cover note / pitch for your proposal.', 'warning');
      return;
    }
    const parsedBid = parseInt(String(bidAmount).replace(/[^0-9]/g, ''), 10);
    if (!parsedBid || parsedBid <= 0) {
      showAlert('Please enter a valid bid amount greater than 0.', 'warning');
      return;
    }

    const maxBudget = proposalModal?.rawBudget || (typeof proposalModal?.budget === 'number' ? proposalModal.budget : parseInt(String(proposalModal?.budget || '').replace(/[^0-9]/g, ''), 10)) || null;
    if (maxBudget && parsedBid > maxBudget) {
      showAlert(`Your bid (₹${parsedBid.toLocaleString('en-IN')}) cannot exceed the client's role budget of ₹${maxBudget.toLocaleString('en-IN')}.`, 'error');
      return;
    }

    const parsedDays = parseInt(String(estimatedDays).replace(/[^0-9]/g, ''), 10);
    if (!parsedDays || parsedDays <= 0) {
      showAlert('Please enter valid estimated delivery days.', 'warning');
      return;
    }

    try {
      await api.post(`/api/application/${proposalModal.projectId || proposalModal.id}/apply`, {
        proposal: bidCover.trim(),
        bidAmount: parsedBid,
        estimatedDeliveryDays: parsedDays,
        roleId: proposalModal.roleId,
        roleTitle: proposalModal.roleTitle,
        hiringId: proposalModal.hiringId,
      });
      showAlert(`Proposal successfully submitted for ${proposalModal.roleTitle || proposalModal.title}!`, 'success');
      setProposalModal(null);
      setBidAmount('');
      setBidCover('');
    } catch (err) {
      console.error('Failed to send proposal', err);
      showAlert(err.response?.data?.message || 'Failed to submit proposal', 'error');
    }
  };

  const handleAiSuggestBid = async () => {
    if (!proposalModal) return;
    setIsAiSuggestingBid(true);
    const roleBudgetNum = proposalModal.rawBudget || (typeof proposalModal.budget === 'number' ? proposalModal.budget : parseInt(String(proposalModal.budget).replace(/[^0-9]/g, ''), 10)) || null;

    try {
      const res = await api.post(`/api/ai/suggest-editor-bid/${proposalModal.projectId || proposalModal.id}`, {
        hiringId: proposalModal.hiringId,
        roleId: proposalModal.roleId,
        roleBudget: roleBudgetNum,
        project: {
          title: proposalModal.roleTitle ? `${proposalModal.roleTitle} (${proposalModal.projectTitle})` : proposalModal.title,
          category: proposalModal.category || (proposalModal.tags && proposalModal.tags[0]) || 'Video',
          budget: roleBudgetNum || proposalModal.budget,
          timeline: proposalModal.deadline
        }
      });
      const data = res.data?.data;
      if (data) {
        if (data.suggestedBidAmount) {
          const finalBid = roleBudgetNum && Number(data.suggestedBidAmount) > roleBudgetNum
            ? roleBudgetNum
            : Number(data.suggestedBidAmount);
          setBidAmount(String(finalBid));
        }
        if (data.suggestedDeliveryDays) {
          setEstimatedDays(String(data.suggestedDeliveryDays));
        }
        if (data.coverNote) {
          setBidCover(data.coverNote);
        }
        showAlert(
          `AI Tailored Bid: ₹${data.suggestedBidAmount} in ${data.suggestedDeliveryDays} days. ${data.pricingStrategy || ''}`,
          'success'
        );
      }
    } catch (err) {
      console.warn('AI bid suggestion error:', err);
      showAlert(err.response?.data?.message || 'AI coach unavailable. Please fill in your proposal details manually.', 'warning');
    } finally {
      setIsAiSuggestingBid(false);
    }
  };

  return (
    <div className="space-y-6">
      <SEO
        title="Browse Video Gigs & Roles"
        description="Discover active creator roles, submit bids with custom turnaround times, and get hired."
      />

      <div>
        <h2 className="text-xl font-bold text-white tracking-tight">Browse Open Roles & Gigs</h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Discover active roles posted by creators (Video Editors, Thumbnail Designers, Colorists), submit bids, and get hired
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 p-1 bg-[#0A0D15]/80 rounded-xl border border-white/[0.05] overflow-x-auto max-w-full">
          {tagsList.map(tag => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-all cursor-pointer ${
                selectedTag === tag
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search roles by title or creator..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-[#0F1420] text-slate-200 border border-white/[0.08] focus:outline-none focus:border-purple-500 transition-colors"
          />
        </div>
      </div>

      {/* Projects Feed */}
      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center text-xs text-slate-500">
          No open gigs found matching your filters
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filtered.map((gig) => (
            <div
              key={gig.id}
              className="glass-card p-4 sm:p-5.5 border border-white/[0.06] hover:border-purple-500/30 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <img
                      src={gig.creatorAvatar || DEFAULT_PFP}
                      alt={gig.creator || 'Creator Avatar'}
                      onError={(e) => { e.currentTarget.src = DEFAULT_PFP; }}
                      className="w-10 h-10 rounded-full object-cover border border-white/10 shrink-0 mt-0.5"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30">
                          {gig.roleTitle || 'Freelance Role'}
                        </span>
                        {gig.projectTitle && gig.projectTitle !== gig.roleTitle && (
                          <span className="text-[11px] text-slate-400 font-medium truncate">
                            in <strong className="text-slate-300">{gig.projectTitle}</strong>
                          </span>
                        )}
                      </div>
                      <h3 className="text-sm font-bold text-white leading-snug truncate">
                        {gig.roleTitle || gig.title}
                      </h3>
                      <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5 flex-wrap">
                        <span className="truncate">{gig.creator || 'unknown'}</span>
                        <CheckCircle className="w-3 h-3 text-purple-400 shrink-0" />
                        <span>•</span>
                        <span className="flex items-center gap-1 text-slate-400">
                          <Clock className="w-3 h-3 shrink-0" /> Due {gig.deadline || 'unknown'}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="text-left sm:text-right shrink-0">
                    <div className="text-base font-bold text-white font-mono">{gig.budget || '999'}</div>
                    <div className="text-[11px] text-emerald-400 font-medium">
                      Budget Allocated
                    </div>
                  </div>
                </div>

                {gig.description && (
                  <p className="text-xs text-slate-300/90 line-clamp-2 my-2.5 leading-relaxed">
                    {gig.description}
                  </p>
                )}

                <div className="flex items-center gap-1.5 flex-wrap my-3">
                  {(gig.tags || []).map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 text-[11px] font-medium rounded-md bg-purple-950/40 text-purple-300 border border-purple-800/30"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-white/[0.04] flex items-center justify-between gap-2 flex-wrap">
                <span className="text-[11px] text-slate-400 font-medium">
                  Difficulty: <strong className="text-slate-300">{gig.difficulty || 'Intermediate'}</strong>
                </span>

                <Button
                  variant="primary"
                  size="xs"
                  onClick={() => {
                    setProposalModal(gig);
                    setBidAmount(gig.rawBudget ? String(gig.rawBudget) : '');
                  }}
                >
                  Apply for this Role
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Apply / Proposal Modal */}
      {proposalModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg glass-card p-5 sm:p-6 border border-white/[0.1] shadow-2xl animate-fade-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-3 mb-2">
              <div>
                <h3 className="text-lg font-bold text-white">
                  Apply for {proposalModal.roleTitle || proposalModal.title}
                </h3>
                <p className="text-xs text-purple-300 mt-0.5">
                  Project: <span className="font-semibold text-white">{proposalModal.projectTitle || proposalModal.title}</span> • Client: {proposalModal.creator}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleAiSuggestBid}
                  disabled={isAiSuggestingBid}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-purple-600/25 via-indigo-600/25 to-purple-500/20 hover:from-purple-600/40 hover:to-indigo-600/40 border border-purple-500/40 text-purple-300 hover:text-white shadow-sm transition-all cursor-pointer group disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Auto-fill competitive bid, delivery days, and tailored cover pitch with AI"
                >
                  <Sparkles className={`w-3.5 h-3.5 text-purple-400 group-hover:rotate-12 transition-transform ${isAiSuggestingBid ? 'animate-spin' : ''}`} />
                  <span>{isAiSuggestingBid ? 'Generating...' : 'Auto-Pitch with AI'}</span>
                </button>
                <button
                  onClick={() => setProposalModal(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {(() => {
              const maxBudget = proposalModal?.rawBudget || (typeof proposalModal?.budget === 'number' ? proposalModal.budget : parseInt(String(proposalModal?.budget || '').replace(/[^0-9]/g, ''), 10)) || null;
              const numericBid = parseInt(String(bidAmount).replace(/[^0-9]/g, ''), 10);
              const isOverBudget = maxBudget && numericBid > maxBudget;

              return (
                <form onSubmit={handleSendProposal} className="space-y-4 mt-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs text-slate-300 block">Bid Amount (INR)</label>
                        {maxBudget && (
                          <span className="text-[11px] text-purple-400 font-medium">
                            Max: ₹{maxBudget.toLocaleString('en-IN')}
                          </span>
                        )}
                      </div>
                      <input
                        type="number"
                        min="1"
                        max={maxBudget || undefined}
                        required
                        placeholder={maxBudget ? `Max ₹${maxBudget}` : 'e.g. 20000'}
                        value={bidAmount}
                        onChange={(e) => {
                          const val = e.target.value;
                          setBidAmount(val);
                        }}
                        className={`w-full px-3 py-2 rounded-xl bg-[#141A28] border text-sm text-white focus:outline-none transition-colors ${
                          isOverBudget
                            ? 'border-red-500/80 focus:border-red-500'
                            : 'border-white/[0.08] focus:border-purple-500'
                        }`}
                      />
                      {isOverBudget && (
                        <p className="text-[11px] text-red-400 mt-1 font-medium">
                          Cannot bid more than the role budget (₹{maxBudget.toLocaleString('en-IN')})
                        </p>
                      )}
                    </div>
                <div>
                  <label className="text-xs text-slate-300 block mb-1">Delivery Time (Days)</label>
                  <input
                    type="number"
                    required
                    value={estimatedDays}
                    onChange={(e) => setEstimatedDays(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#141A28] border border-white/[0.08] text-sm text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1">Cover Note / Why you?</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Introduce yourself, your editing style, and why you are the best fit for this project..."
                  value={bidCover}
                  onChange={(e) => setBidCover(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#141A28] border border-white/[0.08] text-sm text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5 pt-2">
                <Button
                  variant="ghost"
                  onClick={() => setProposalModal(null)}
                  className="w-full sm:w-auto"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  icon={Send}
                  className="w-full sm:w-auto"
                  disabled={isOverBudget}
                >
                  Submit Application
                </Button>
              </div>
            </form>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
};

export default BrowseProjects;
