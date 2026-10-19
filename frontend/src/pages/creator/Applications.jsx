import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Star,
  Check,
  X,
  User,
  DollarSign,
  Clock,
  Search,
  Sparkles,
  Award,
  ArrowRightLeft,
  Handshake,
  History,
  MessageSquareQuote,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import Button from '../../components/common/Button';
import { SkeletonRow } from '../../components/common/Skeleton';
import SEO from '../../components/common/SEO';
import { applicationService } from '../../services/applicationService';
import api from '../../services/api';
import { useAlert } from '../../context/AlertContext';
import { DEFAULT_PFP } from '../../constants/assets';

export const Applications = () => {
  const { showAlert } = useAlert();
  const [searchParams] = useSearchParams();
  const targetAppId = searchParams.get('applicationId');
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [aiPicks, setAiPicks] = useState(null);
  const [isAnalyzingAi, setIsAnalyzingAi] = useState(false);

  // Negotiation modal state
  const [negotiatingApp, setNegotiatingApp] = useState(null);
  const [counterAmount, setCounterAmount] = useState('');
  const [counterNote, setCounterNote] = useState('');
  const [submittingNegotiation, setSubmittingNegotiation] = useState(false);
  const [showHistoryAppId, setShowHistoryAppId] = useState(null);

  const loadApps = async () => {
    setLoading(true);
    const data = await applicationService.getApplications();
    setApplications(data);
    setLoading(false);
  };

  useEffect(() => {
    loadApps();
  }, []);

  // Auto-scroll to specific counteroffer application if opened from notification
  useEffect(() => {
    if (!loading && targetAppId && applications.length > 0) {
      const timer = setTimeout(() => {
        const element = document.getElementById(`app-card-${targetAppId}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          element.classList.add('ring-2', 'ring-purple-400', 'shadow-[0_0_30px_rgba(168,85,247,0.4)]', 'transition-all', 'duration-500');
          setTimeout(() => {
            element.classList.remove('ring-2', 'ring-purple-400', 'shadow-[0_0_30px_rgba(168,85,247,0.4)]');
          }, 4000);
        }
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [loading, targetAppId, applications]);

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

      const proposalsPayload = applications.map((app) => ({
        proposalId: String(app.id),
        editorName: app.name,
        bidAmount: app.currentOffer || app.bidAmount || parseInt(String(app.price).replace(/[^0-9]/g, ''), 10) || 15000,
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
        await applicationService.acceptApplication(id);
        showAlert('Application accepted! Freelancer assigned and workspace initialized.', 'success');
      } else if (newStatus === 'rejected') {
        await applicationService.rejectApplication(id);
        showAlert('Application declined.', 'info');
      }
      await loadApps();
    } catch (err) {
      console.error('Failed to update application status:', err);
      showAlert(err.response?.data?.message || err.message || 'Failed to update application status', 'error');
    }
  };

  const openNegotiateModal = (app) => {
    setNegotiatingApp(app);
    // Suggest slightly lower or existing counter offer
    const baseAmount = app.currentOffer || app.bidAmount || 1500;
    setCounterAmount(String(baseAmount));
    setCounterNote('');
  };

  const handleNegotiateSubmit = async (e) => {
    e?.preventDefault();
    if (!negotiatingApp || !counterAmount || Number(counterAmount) <= 0) {
      showAlert('Please enter a valid counter-offer amount (₹)', 'warning');
      return;
    }
    setSubmittingNegotiation(true);
    try {
      await applicationService.negotiateApplication(negotiatingApp.id, {
        amount: Number(counterAmount),
        note: counterNote
      });
      showAlert(`Counter-offer of ₹${Number(counterAmount).toLocaleString('en-IN')} sent to freelancer!`, 'success');
      setNegotiatingApp(null);
      setCounterAmount('');
      setCounterNote('');
      await loadApps();
    } catch (err) {
      console.error('Failed to negotiate:', err);
      showAlert(err.response?.data?.message || err.message || 'Failed to submit counter-offer', 'error');
    } finally {
      setSubmittingNegotiation(false);
    }
  };

  const filtered = applications.filter((app) => {
    let matchesFilter = true;
    if (filter === 'negotiating') {
      matchesFilter = app.status === 'negotiating' || app.status === 'counter_offered';
    } else if (filter !== 'all') {
      matchesFilter = app.status === filter;
    }
    const matchesSearch =
      (app.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (app.role || '').toLowerCase().includes(search.toLowerCase()) ||
      (app.appliedFor || '').toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6 pb-16 animate-fade-in">
      <SEO
        title="Proposals & Applications"
        description="Review video editing candidates, test reels, proposed rates, and negotiate bids."
      />

      <div>
        <h2 className="text-2xl font-black font-serif text-[#261615] dark:text-[#FDEBDE] tracking-tight">Editor Proposals & Applications</h2>
        <p className="text-xs text-[#5C3A38] dark:text-[#D4B8A8] mt-0.5">
          Review candidates, evaluate proposals, accept bids or send counter-offers
        </p>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 p-1.5 bg-[#FAF0E6] dark:bg-[#201413] rounded-2xl border-2 border-[#382322] dark:border-[#FDEBDE]/30 shadow-[2px_2px_0_#382322] overflow-x-auto">
          {['all', 'pending', 'negotiating', 'accepted', 'rejected'].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl capitalize whitespace-nowrap transition-all cursor-pointer ${
                filter === tab
                  ? 'bg-[#FFEBAA] text-[#261615] border border-[#382322] shadow-[1px_1px_0_#382322]'
                  : 'text-[#5C3A38] dark:text-[#D4B8A8] hover:text-[#261615] dark:hover:text-[#FDEBDE]'
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
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider bg-[#FFEBAA] hover:bg-[#ffe38a] border-2 border-[#382322] text-[#261615] shadow-[2px_2px_0_#382322] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer group disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Sparkles className={`w-3.5 h-3.5 text-[#261615] group-hover:rotate-12 transition-transform ${isAnalyzingAi ? 'animate-spin' : ''}`} />
            <span>{isAnalyzingAi ? 'Analyzing Pool...' : 'AI Top 3 Picks'}</span>
          </button>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#5C3A38] dark:text-[#D4B8A8] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search editor, role, project..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-3.5 py-2 text-xs rounded-xl bg-white dark:bg-[#201413] text-[#261615] dark:text-[#FDEBDE] placeholder:text-[#382322]/40 dark:placeholder:text-[#FDEBDE]/40 border-2 border-[#382322] dark:border-[#FDEBDE]/30 shadow-[2px_2px_0_#382322] focus:outline-none focus:ring-1 focus:ring-[#382322] w-48 sm:w-64"
            />
          </div>
        </div>
      </div>

      {/* AI Evaluation Banner */}
      {aiPicks && (
        <div className="bg-[#B1C8EA]/20 dark:bg-[#B1C8EA]/10 p-5 rounded-2xl border-2 border-[#382322] dark:border-[#FDEBDE]/30 shadow-[4px_4px_0_#382322] space-y-2 animate-fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#261615] dark:text-[#FFEBAA]" />
              <h4 className="text-xs font-black font-serif text-[#261615] dark:text-[#FDEBDE] uppercase tracking-wider">AI Candidate Evaluation</h4>
            </div>
            <button
              onClick={() => setAiPicks(null)}
              className="text-[11px] font-bold text-[#5C3A38] dark:text-[#D4B8A8] hover:text-[#261615] dark:hover:text-[#FDEBDE] cursor-pointer"
            >
              Dismiss
            </button>
          </div>
          <p className="text-xs text-[#261615] dark:text-[#FDEBDE] leading-relaxed">{aiPicks.summaryEvaluation}</p>
          {aiPicks.adviceForCreator && (
            <p className="text-[11px] text-[#261615] dark:text-[#FFEBAA] bg-[#FFEBAA]/50 dark:bg-[#261817] border border-[#382322] px-3 py-1.5 rounded-xl font-medium">
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
        <div className="py-16 text-center text-xs font-bold text-[#5C3A38] dark:text-[#D4B8A8] bg-white dark:bg-[#201413] rounded-2xl border-2 border-[#382322] dark:border-[#FDEBDE]/30 shadow-[4px_4px_0_#382322]">
          No applications found in this category
        </div>
      ) : (
        <div className="space-y-3.5">
          {filtered.map((app) => {
            const aiPick = aiPicks?.topPicks?.find(
              (p) => p.proposalId === String(app.id) || p.editorName === app.name
            );

            const isNegotiating = app.status === 'negotiating' || app.status === 'counter_offered';
            const freelancerCountered = isNegotiating && app.lastOfferBy === 'freelancer';
            const creatorCountered = isNegotiating && app.lastOfferBy === 'creator';
            const activePrice = app.currentOffer != null ? app.currentOffer : app.bidAmount;
            const hasHistory = Array.isArray(app.negotiationHistory) && app.negotiationHistory.length > 0;
            const isHistoryOpen = showHistoryAppId === app.id;

            return (
              <div
                key={app.id}
                id={`app-card-${app.id}`}
                className={`bg-white dark:bg-[#201413] p-5 md:p-6 border-2 rounded-2xl space-y-3.5 transition-all shadow-[4px_4px_0_#382322] dark:shadow-[4px_4px_0_#FDEBDE]/20 ${
                  freelancerCountered
                    ? 'border-[#382322] bg-[#FFEBAA]/20 dark:bg-[#261817]'
                    : aiPick
                    ? 'border-[#382322] bg-[#B1C8EA]/15 dark:bg-[#261817]'
                    : 'border-[#382322] dark:border-[#FDEBDE]/30'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  {/* Left: Avatar & Candidate Info */}
                  <div className="flex items-start gap-3.5 min-w-0">
                    <img
                      src={app.avatar || DEFAULT_PFP}
                      alt={app.name || 'Candidate'}
                      onError={(e) => { e.currentTarget.src = DEFAULT_PFP; }}
                      className="w-12 h-12 rounded-xl object-cover border-2 border-[#382322] shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm font-bold font-serif text-[#261615] dark:text-[#FDEBDE] truncate">{app.name || 'Freelancer'}</h3>
                        <span className="text-xs text-[#261615] dark:text-[#FFEBAA] font-bold flex items-center gap-0.5">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                          {app.rating != null ? app.rating : 0}
                        </span>

                        {aiPick && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FFEBAA] text-[#261615] border border-[#382322]">
                            <Award className="w-3 h-3 text-[#261615]" />
                            #{aiPick.rank} Top Pick ({aiPick.matchScore}% Match)
                          </span>
                        )}

                        {isNegotiating && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#B1C8EA] text-[#261615] border border-[#382322] animate-pulse">
                            <ArrowRightLeft className="w-3 h-3" />
                            Negotiation Active
                          </span>
                        )}
                      </div>

                      <p className="text-xs font-semibold text-[#5C3A38] dark:text-[#D4B8A8] mt-0.5">{app.role || app.roleTitle || 'Video Editor'}</p>
                      <p className="text-[11px] text-[#5C3A38] dark:text-[#D4B8A8] font-medium mt-1">
                        Applied for: <span className="text-[#261615] dark:text-[#FDEBDE] font-bold">{app.appliedFor || 'Project'}</span> • {app.appliedDate || 'Recently'}
                      </p>

                      {aiPick?.whySelected && (
                        <p className="text-[11px] text-[#261615] dark:text-[#FDEBDE] mt-1.5 italic bg-[#FFEBAA]/40 dark:bg-[#FFEBAA]/10 border border-[#382322]/40 px-2.5 py-1 rounded-lg">
                          ✨ {aiPick.whySelected}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right: Rates & Action Buttons */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2.5 shrink-0">
                    <div className="text-left sm:text-right">
                      <div className="text-lg font-black font-serif text-[#261615] dark:text-[#FFEBAA]">
                        ₹{Number(activePrice || 0).toLocaleString('en-IN')}
                      </div>
                      <div className="text-[11px] font-semibold text-[#5C3A38] dark:text-[#D4B8A8]">
                        {app.deliveryDays ? `${app.deliveryDays} days turnaround` : app.duration || 'Standard'}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* State 1: Fresh Pending Application -> Accept, Decline, Negotiate */}
                      {app.status === 'pending' && (
                        <>
                          <Button
                            variant="primary"
                            size="xs"
                            icon={Check}
                            onClick={() => handleStatusChange(app.id, 'accepted')}
                            title={`Accept bid at ₹${Number(app.bidAmount || 0).toLocaleString('en-IN')}`}
                          >
                            Accept
                          </Button>
                          <button
                            type="button"
                            onClick={() => openNegotiateModal(app)}
                            className="px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider bg-[#FFEBAA] hover:bg-[#ffe38a] text-[#261615] border border-[#382322] shadow-[1px_1px_0_#382322] active:translate-x-0.5 active:translate-y-0.5 transition-all flex items-center gap-1 cursor-pointer"
                            title="Propose a counter-offer amount"
                          >
                            <Handshake className="w-3.5 h-3.5" />
                            <span>Negotiate</span>
                          </button>
                          <Button
                            variant="ghost"
                            size="xs"
                            icon={X}
                            onClick={() => handleStatusChange(app.id, 'rejected')}
                            className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/20"
                          >
                            Decline
                          </Button>
                        </>
                      )}

                      {/* State 2: Freelancer sent counter-offer -> Accept Offer, Counter Again, Decline */}
                      {freelancerCountered && (
                        <>
                          <Button
                            variant="primary"
                            size="xs"
                            icon={Check}
                            onClick={() => handleStatusChange(app.id, 'accepted')}
                            title={`Accept freelancer's counter-offer of ₹${Number(app.currentOffer).toLocaleString('en-IN')}`}
                          >
                            Accept Offer
                          </Button>
                          <button
                            type="button"
                            onClick={() => openNegotiateModal(app)}
                            className="px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider bg-[#FFEBAA] hover:bg-[#ffe38a] text-[#261615] border border-[#382322] shadow-[1px_1px_0_#382322] active:translate-x-0.5 active:translate-y-0.5 transition-all flex items-center gap-1 cursor-pointer"
                          >
                            <ArrowRightLeft className="w-3.5 h-3.5" />
                            <span>Counter</span>
                          </button>
                          <Button
                            variant="ghost"
                            size="xs"
                            icon={X}
                            onClick={() => handleStatusChange(app.id, 'rejected')}
                            className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/20"
                          >
                            Decline
                          </Button>
                        </>
                      )}

                      {/* State 3: Creator sent counter-offer, awaiting freelancer */}
                      {creatorCountered && (
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-bold text-[#261615] bg-[#FFEBAA] border border-[#382322] px-2.5 py-1 rounded-lg">
                            Counter Sent • Awaiting Response
                          </span>
                          <button
                            type="button"
                            onClick={() => openNegotiateModal(app)}
                            className="text-xs font-bold text-[#382322] dark:text-[#FFEBAA] hover:underline transition-colors cursor-pointer"
                            title="Modify counter-offer"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStatusChange(app.id, 'rejected')}
                            className="text-xs font-bold text-rose-600 hover:text-rose-700 transition-colors cursor-pointer"
                            title="Cancel negotiation"
                          >
                            Cancel
                          </button>
                        </div>
                      )}

                      {/* State 4: Final Status (Accepted or Rejected) */}
                      {app.status === 'accepted' && (
                        <span className="px-3 py-1 text-xs font-bold rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-600">
                          Hired & Assigned
                        </span>
                      )}
                      {(app.status === 'rejected' || app.status === 'withdrawn') && (
                        <span className="px-3 py-1 text-xs font-bold rounded-full bg-rose-100 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border border-rose-500 capitalize">
                          {app.status}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Freelancer's Proposal Note */}
                {app.coverNote && (
                  <div className="text-xs text-[#261615] dark:text-[#FDEBDE] bg-[#FAF0E6] dark:bg-[#261817] p-3.5 rounded-xl border border-[#382322]/20 dark:border-[#FDEBDE]/20 leading-relaxed">
                    <span className="text-[10px] uppercase font-bold text-[#5C3A38] dark:text-[#D4B8A8] block mb-0.5">Proposal Pitch</span>
                    {app.coverNote}
                  </div>
                )}

                {/* Active Counter-Offer Banner (if freelancer countered) */}
                {freelancerCountered && (
                  <div className="p-3.5 rounded-xl bg-[#FFEBAA]/60 dark:bg-[#FFEBAA]/10 border-2 border-[#382322] dark:border-[#FDEBDE]/30 flex items-start gap-2.5 text-xs text-[#261615] dark:text-[#FDEBDE]">
                    <MessageSquareQuote className="w-4 h-4 text-[#261615] dark:text-[#FFEBAA] shrink-0 mt-0.5" />
                    <div>
                      <p className="font-black font-serif text-[#261615] dark:text-[#FFEBAA]">
                        Freelancer Countered: ₹{Number(app.currentOffer).toLocaleString('en-IN')}
                      </p>
                      {app.counterNote && <p className="text-[11px] text-[#5C3A38] dark:text-[#D4B8A8] mt-0.5">"{app.counterNote}"</p>}
                    </div>
                  </div>
                )}

                {/* Negotiation History Toggle */}
                {hasHistory && (
                  <div className="pt-2 border-t border-[#382322]/10 dark:border-[#FDEBDE]/10">
                    <button
                      type="button"
                      onClick={() => setShowHistoryAppId(isHistoryOpen ? null : app.id)}
                      className="text-[11px] font-bold text-[#5C3A38] dark:text-[#D4B8A8] hover:text-[#261615] dark:hover:text-[#FDEBDE] transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <History className="w-3.5 h-3.5 text-[#382322] dark:text-[#FFEBAA]" />
                      <span>Negotiation History ({app.negotiationHistory.length} offers)</span>
                      {isHistoryOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </button>

                    {isHistoryOpen && (
                      <div className="mt-2.5 p-3 rounded-xl bg-[#FAF0E6] dark:bg-[#261817] border border-[#382322]/20 dark:border-[#FDEBDE]/20 space-y-2">
                        <div className="text-[10px] text-[#5C3A38] dark:text-[#D4B8A8]">
                          Initial Bid: <strong className="text-[#261615] dark:text-[#FDEBDE]">₹{Number(app.bidAmount || 0).toLocaleString('en-IN')}</strong> by Freelancer
                        </div>
                        {app.negotiationHistory.map((hist, idx) => (
                          <div key={idx} className="flex items-center justify-between text-xs py-1 border-t border-[#382322]/10 dark:border-[#FDEBDE]/10">
                            <span className="text-[#261615] dark:text-[#FDEBDE] font-semibold capitalize">
                              {hist.offeredBy === 'creator' ? 'You (Creator)' : `${app.name} (Freelancer)`}:
                            </span>
                            <div className="text-right">
                              <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400">
                                ₹{Number(hist.amount).toLocaleString('en-IN')}
                              </span>
                              {hist.note && <span className="text-[10px] text-[#5C3A38] dark:text-[#D4B8A8] block italic">"{hist.note}"</span>}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* COUNTER-OFFER NEGOTIATION MODAL                                          */}
      {/* ========================================================================= */}
      {negotiatingApp && (
        <div className="fixed inset-0 z-50 bg-[#261615]/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-md bg-[#FFF7F1] dark:bg-[#261817] p-6 rounded-2xl border-2 border-[#382322] dark:border-[#FDEBDE]/30 shadow-[8px_8px_0_#382322] dark:shadow-[8px_8px_0_#FDEBDE]/20 relative space-y-5">
            <button
              type="button"
              onClick={() => setNegotiatingApp(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg bg-white dark:bg-[#201413] border-2 border-[#382322] dark:border-[#FDEBDE]/30 text-[#261615] dark:text-[#FDEBDE] hover:bg-[#FFEBAA] transition-colors cursor-pointer shadow-[2px_2px_0_#382322]"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#FFEBAA] border-2 border-[#382322] flex items-center justify-center shrink-0 shadow-[2px_2px_0_#382322]">
                <Handshake className="w-5 h-5 text-[#261615]" />
              </div>
              <div>
                <h3 className="text-base font-black font-serif text-[#261615] dark:text-[#FDEBDE] tracking-tight">Negotiate Counter-Offer</h3>
                <p className="text-xs text-[#5C3A38] dark:text-[#D4B8A8]">
                  Send a counter rate to {negotiatingApp.name} for {negotiatingApp.appliedFor}
                </p>
              </div>
            </div>

            <form onSubmit={handleNegotiateSubmit} className="space-y-4">
              {/* Reference Info */}
              <div className="p-3 rounded-xl bg-white dark:bg-[#201413] border-2 border-[#382322] dark:border-[#FDEBDE]/30 shadow-[2px_2px_0_#382322] flex items-center justify-between text-xs">
                <span className="text-[#5C3A38] dark:text-[#D4B8A8] font-bold">Freelancer's Current Bid:</span>
                <span className="font-mono font-bold text-[#261615] dark:text-[#FFEBAA]">
                  ₹{Number(negotiatingApp.currentOffer || negotiatingApp.bidAmount || 0).toLocaleString('en-IN')}
                </span>
              </div>

              {/* Counter Amount */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#261615] dark:text-[#FDEBDE] block">
                  Your Counter Offer Amount (₹) <span className="text-rose-600">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5C3A38] dark:text-[#D4B8A8] font-bold text-sm">₹</span>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    required
                    placeholder="e.g. 1200"
                    value={counterAmount}
                    onChange={(e) => setCounterAmount(e.target.value)}
                    className="w-full pl-8 pr-4 py-2.5 bg-white dark:bg-[#201413] rounded-xl border-2 border-[#382322] dark:border-[#FDEBDE]/30 text-[#261615] dark:text-[#FDEBDE] text-sm font-mono font-bold shadow-[2px_2px_0_#382322] focus:outline-none focus:ring-1 focus:ring-[#382322]"
                  />
                </div>
              </div>

              {/* Note / Message */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#261615] dark:text-[#FDEBDE] block">
                  Message / Rationale <span className="text-[11px] text-[#5C3A38] dark:text-[#D4B8A8] font-normal">(Optional)</span>
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. We love your portfolio, but our project budget limit for this role is ₹1,200."
                  value={counterNote}
                  onChange={(e) => setCounterNote(e.target.value)}
                  className="w-full p-3 bg-white dark:bg-[#201413] rounded-xl border-2 border-[#382322] dark:border-[#FDEBDE]/30 text-[#261615] dark:text-[#FDEBDE] placeholder:text-[#382322]/40 dark:placeholder:text-[#FDEBDE]/40 shadow-[2px_2px_0_#382322] text-xs focus:outline-none focus:ring-1 focus:ring-[#382322] leading-relaxed resize-none"
                />
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setNegotiatingApp(null)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={submittingNegotiation}
                >
                  {submittingNegotiation ? 'Sending...' : 'Send Counter-Offer'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Applications;
