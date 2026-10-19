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
    <div className="space-y-6 text-[#261615] dark:text-[#FDEBDE]">
      <SEO
        title="Browse Video Gigs & Roles"
        description="Discover active creator roles, submit bids with custom turnaround times, and get hired."
      />

      <div className="p-4 sm:p-5 bg-[#FFFDF9] dark:bg-[#201413] border-2 border-[#382322] dark:border-[#FDEBDE]/30 shadow-[3px_3px_0_#382322] dark:shadow-[3px_3px_0_#000]">
        <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#261615] dark:text-[#FDEBDE] tracking-tight">Browse Open Roles & Gigs</h2>
        <p className="text-xs text-[#5C3A38] dark:text-[#D4B8A8] mt-1 font-sans">
          Discover active roles posted by creators (Video Editors, Thumbnail Designers, Colorists), submit bids, and get hired.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 p-1.5 bg-[#FFFDF9] dark:bg-[#201413] border-2 border-[#382322] dark:border-[#FDEBDE]/30 shadow-[2px_2px_0_#382322] overflow-x-auto max-w-full">
          {tagsList.map(tag => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`px-3 py-1.5 text-xs font-bold font-mono uppercase tracking-wider whitespace-nowrap transition-all cursor-pointer ${
                selectedTag === tag
                  ? 'bg-[#FFEBAA] text-[#261615] border-2 border-[#382322] shadow-[1px_1px_0_#382322]'
                  : 'text-[#5C3A38] dark:text-[#D4B8A8] hover:text-[#261615] dark:hover:text-[#FDEBDE]'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 text-[#5C3A38] dark:text-[#D4B8A8] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search roles by title or creator..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-2 text-xs bg-[#FFFDF9] dark:bg-[#201413] text-[#261615] dark:text-[#FDEBDE] placeholder-[#5C3A38]/50 border-2 border-[#382322] dark:border-[#FDEBDE]/30 shadow-[2px_2px_0_#382322] focus:outline-none transition-colors"
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
        <div className="py-16 text-center text-xs text-[#5C3A38] dark:text-[#D4B8A8] bg-[#FFFDF9] dark:bg-[#201413] border-2 border-dashed border-[#382322]/20 dark:border-[#FDEBDE]/20">
          No open gigs found matching your filters.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filtered.map((gig) => (
            <div
              key={gig.id}
              className="bg-[#FFFDF9] dark:bg-[#201413] p-5 sm:p-6 border-2 border-[#382322] dark:border-[#FDEBDE]/30 shadow-[4px_4px_0_#382322] dark:shadow-[4px_4px_0_#000] transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <img
                      src={gig.creatorAvatar || DEFAULT_PFP}
                      alt={gig.creator || 'Creator Avatar'}
                      onError={(e) => { e.currentTarget.src = DEFAULT_PFP; }}
                      className="w-10 h-10 rounded-none object-cover border-2 border-[#382322] shadow-[2px_2px_0_#382322] shrink-0 mt-0.5"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                        <span className="px-2 py-0.5 text-[10px] font-bold font-mono uppercase tracking-wider bg-[#B1C8EA] text-[#261615] border-2 border-[#382322]">
                          {gig.roleTitle || 'Freelance Role'}
                        </span>
                        {gig.projectTitle && gig.projectTitle !== gig.roleTitle && (
                          <span className="text-[11px] text-[#5C3A38] dark:text-[#D4B8A8] font-medium truncate">
                            in <strong className="text-[#261615] dark:text-[#FDEBDE]">{gig.projectTitle}</strong>
                          </span>
                        )}
                      </div>
                      <h3 className="text-base font-serif font-bold text-[#261615] dark:text-[#FDEBDE] leading-snug truncate">
                        {gig.roleTitle || gig.title}
                      </h3>
                      <p className="text-xs text-[#5C3A38] dark:text-[#D4B8A8] flex items-center gap-1.5 mt-0.5 flex-wrap">
                        <span className="truncate">{gig.creator || 'unknown'}</span>
                        <CheckCircle className="w-3.5 h-3.5 text-[#261615] dark:text-[#FFEBAA] shrink-0" />
                        <span>•</span>
                        <span className="flex items-center gap-1 font-mono">
                          <Clock className="w-3 h-3 shrink-0" /> Due {gig.deadline || 'unknown'}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="text-left sm:text-right shrink-0">
                    <div className="text-base font-bold font-mono text-[#261615] dark:text-[#FFEBAA]">{gig.budget || '999'}</div>
                    <div className="text-[11px] text-[#5C3A38] dark:text-[#D4B8A8] font-bold font-mono uppercase">
                      Budget Allocated
                    </div>
                  </div>
                </div>

                {gig.description && (
                  <p className="text-xs sm:text-sm text-[#261615] dark:text-[#FDEBDE] line-clamp-2 my-2.5 leading-relaxed bg-[#FFF7F1] dark:bg-[#19100F] p-3 border-2 border-[#382322]/15 dark:border-[#FDEBDE]/15">
                    {gig.description}
                  </p>
                )}

                <div className="flex items-center gap-1.5 flex-wrap my-3">
                  {(gig.tags || []).map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 text-xs font-bold font-mono bg-[#FFF7F1] dark:bg-[#19100F] text-[#261615] dark:text-[#FDEBDE] border-2 border-[#382322] dark:border-[#FDEBDE]/30 shadow-[1px_1px_0_#382322]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t-2 border-[#382322]/10 dark:border-[#FDEBDE]/10 flex items-center justify-between gap-2 flex-wrap">
                <span className="text-xs text-[#5C3A38] dark:text-[#D4B8A8] font-mono">
                  Difficulty: <strong className="text-[#261615] dark:text-[#FDEBDE] font-bold">{gig.difficulty || 'Intermediate'}</strong>
                </span>

                <button
                  type="button"
                  onClick={() => {
                    setProposalModal(gig);
                    setBidAmount(gig.rawBudget ? String(gig.rawBudget) : '');
                  }}
                  className="px-4 py-2 bg-[#FFEBAA] hover:bg-[#ffe58f] text-[#261615] border-2 border-[#382322] shadow-[2px_2px_0_#382322] text-xs font-bold font-mono uppercase tracking-wider transition-all cursor-pointer active:translate-x-0.5 active:translate-y-0.5"
                >
                  Apply for this Role →
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Apply / Proposal Modal */}
      {proposalModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#FFFDF9] dark:bg-[#201413] p-6 border-2 border-[#382322] dark:border-[#FDEBDE]/30 shadow-[8px_8px_0_#382322] dark:shadow-[8px_8px_0_#000] animate-fade-in max-h-[90vh] overflow-y-auto text-[#261615] dark:text-[#FDEBDE]">
            <div className="flex items-start justify-between gap-3 mb-4 pb-3 border-b-2 border-[#382322]/10 dark:border-[#FDEBDE]/10">
              <div>
                <h3 className="text-lg font-serif font-bold text-[#261615] dark:text-[#FDEBDE]">
                  Apply for {proposalModal.roleTitle || proposalModal.title}
                </h3>
                <p className="text-xs text-[#5C3A38] dark:text-[#D4B8A8] mt-0.5 font-sans">
                  Project: <span className="font-bold underline decoration-[#FFEBAA]">{proposalModal.projectTitle || proposalModal.title}</span> • Client: {proposalModal.creator}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleAiSuggestBid}
                  disabled={isAiSuggestingBid}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold font-mono uppercase tracking-wider bg-[#FFEBAA] hover:bg-[#ffe58f] border-2 border-[#382322] text-[#261615] shadow-[2px_2px_0_#382322] transition-all cursor-pointer disabled:opacity-50"
                  title="Auto-fill competitive bid, delivery days, and tailored cover pitch with AI"
                >
                  <Sparkles className={`w-3.5 h-3.5 text-[#261615] ${isAiSuggestingBid ? 'animate-spin' : ''}`} />
                  <span>{isAiSuggestingBid ? 'Generating...' : 'Auto-Pitch with AI'}</span>
                </button>
                <button
                  onClick={() => setProposalModal(null)}
                  className="p-1.5 border-2 border-[#382322] dark:border-[#FDEBDE]/30 bg-[#FFF7F1] dark:bg-[#19100F] text-[#261615] dark:text-[#FDEBDE] cursor-pointer"
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
                <form onSubmit={handleSendProposal} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-bold font-mono uppercase tracking-wider text-[#261615] dark:text-[#FDEBDE] block">Bid Amount (INR)</label>
                        {maxBudget && (
                          <span className="text-[11px] text-[#5C3A38] dark:text-[#FFEBAA] font-mono font-bold">
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
                        className={`w-full px-3 py-2 bg-[#FFF7F1] dark:bg-[#19100F] border-2 text-sm text-[#261615] dark:text-[#FDEBDE] focus:outline-none transition-colors shadow-[2px_2px_0_#382322] ${
                          isOverBudget
                            ? 'border-red-600 focus:border-red-600'
                            : 'border-[#382322] dark:border-[#FDEBDE]/30'
                        }`}
                      />
                      {isOverBudget && (
                        <p className="text-[11px] text-red-600 dark:text-red-400 mt-1 font-bold">
                          Cannot bid more than the role budget (₹{maxBudget.toLocaleString('en-IN')})
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="text-xs font-bold font-mono uppercase tracking-wider text-[#261615] dark:text-[#FDEBDE] block mb-1">Delivery Time (Days)</label>
                      <input
                        type="number"
                        required
                        value={estimatedDays}
                        onChange={(e) => setEstimatedDays(e.target.value)}
                        className="w-full px-3 py-2 bg-[#FFF7F1] dark:bg-[#19100F] border-2 border-[#382322] dark:border-[#FDEBDE]/30 text-sm text-[#261615] dark:text-[#FDEBDE] focus:outline-none shadow-[2px_2px_0_#382322]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold font-mono uppercase tracking-wider text-[#261615] dark:text-[#FDEBDE] block mb-1">Cover Note / Why you?</label>
                    <textarea
                      required
                      rows={4}
                      placeholder="Introduce yourself, your editing style, and why you are the best fit for this project..."
                      value={bidCover}
                      onChange={(e) => setBidCover(e.target.value)}
                      className="w-full px-3 py-2 bg-[#FFF7F1] dark:bg-[#19100F] border-2 border-[#382322] dark:border-[#FDEBDE]/30 text-sm text-[#261615] dark:text-[#FDEBDE] focus:outline-none shadow-[2px_2px_0_#382322]"
                    />
                  </div>

                  <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-3 border-t-2 border-[#382322]/10 dark:border-[#FDEBDE]/10">
                    <button
                      type="button"
                      onClick={() => setProposalModal(null)}
                      className="w-full sm:w-auto px-4 py-2 border-2 border-[#382322] dark:border-[#FDEBDE]/30 text-xs font-bold font-mono uppercase tracking-wider text-[#261615] dark:text-[#FDEBDE] bg-[#FFF7F1] dark:bg-[#19100F] hover:bg-[#FDEBDE] transition-all cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isOverBudget}
                      className="w-full sm:w-auto px-5 py-2 bg-[#FFEBAA] hover:bg-[#ffe58f] text-[#261615] border-2 border-[#382322] shadow-[2px_2px_0_#382322] text-xs font-bold font-mono uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 active:translate-x-0.5 active:translate-y-0.5"
                    >
                      <span>Submit Application</span>
                      <Send className="w-3.5 h-3.5" />
                    </button>
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
