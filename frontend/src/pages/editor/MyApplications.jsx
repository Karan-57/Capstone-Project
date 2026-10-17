import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  FileCheck2,
  Check,
  X,
  ArrowRightLeft,
  Handshake,
  MessageSquareQuote,
  History,
  ChevronDown,
  ChevronUp,
  FolderGit2,
  Sparkles
} from 'lucide-react';
import Button from '../../components/common/Button';
import { SkeletonRow } from '../../components/common/Skeleton';
import SEO from '../../components/common/SEO';
import { applicationService } from '../../services/applicationService';
import { useAlert } from '../../context/AlertContext';

export const MyApplications = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const targetAppId = searchParams.get('applicationId');
  const { showAlert } = useAlert();
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);

  // Negotiation state
  const [negotiatingBid, setNegotiatingBid] = useState(null);
  const [counterAmount, setCounterAmount] = useState('');
  const [counterNote, setCounterNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showHistoryBidId, setShowHistoryBidId] = useState(null);

  const loadBids = async () => {
    setLoading(true);
    const data = await applicationService.getMyApplications();
    setBids(data);
    setLoading(false);
  };

  useEffect(() => {
    loadBids();
  }, []);

  // Auto-scroll to specific counteroffer if opened from notification
  useEffect(() => {
    if (!loading && targetAppId && bids.length > 0) {
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
  }, [loading, targetAppId, bids]);

  const handleAcceptOffer = async (bidId, amount) => {
    try {
      await applicationService.acceptApplication(bidId);
      showAlert(`Offer accepted at ₹${Number(amount).toLocaleString('en-IN')}! You are now assigned to the project.`, 'success');
      await loadBids();
    } catch (err) {
      console.error('Failed to accept counter-offer:', err);
      showAlert(err.response?.data?.message || err.message || 'Failed to accept offer', 'error');
    }
  };

  const handleDeclineOffer = async (bidId) => {
    try {
      await applicationService.rejectApplication(bidId);
      showAlert('Offer declined.', 'info');
      await loadBids();
    } catch (err) {
      console.error('Failed to decline offer:', err);
      showAlert(err.response?.data?.message || err.message || 'Failed to decline offer', 'error');
    }
  };

  const openCounterModal = (bid) => {
    setNegotiatingBid(bid);
    const base = bid.currentOffer || bid.bidAmount || 1500;
    setCounterAmount(String(base));
    setCounterNote('');
  };

  const handleCounterSubmit = async (e) => {
    e?.preventDefault();
    if (!negotiatingBid || !counterAmount || Number(counterAmount) <= 0) {
      showAlert('Please enter a valid counter amount (₹)', 'warning');
      return;
    }
    setIsSubmitting(true);
    try {
      await applicationService.negotiateApplication(negotiatingBid.id, {
        amount: Number(counterAmount),
        note: counterNote,
      });
      showAlert(`Counter-offer of ₹${Number(counterAmount).toLocaleString('en-IN')} sent to creator!`, 'success');
      setNegotiatingBid(null);
      setCounterAmount('');
      setCounterNote('');
      await loadBids();
    } catch (err) {
      console.error('Failed to submit counter:', err);
      showAlert(err.response?.data?.message || err.message || 'Failed to submit counter-offer', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status, lastOfferBy) => {
    if (status === 'negotiating' || status === 'counter_offered') {
      return 'text-amber-400 bg-amber-500/15 border-amber-500/30';
    }
    switch (status) {
      case 'accepted':
        return 'text-emerald-400 bg-emerald-500/15 border-emerald-500/25';
      case 'rejected':
        return 'text-rose-400 bg-rose-500/15 border-rose-500/25';
      case 'withdrawn':
        return 'text-slate-400 bg-slate-800 border-white/10';
      default:
        return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
    }
  };

  return (
    <div className="space-y-6 pb-16 animate-fade-in">
      <SEO
        title="My Proposals"
        description="Track the status of your video editing bids, creator counter-offers, and contracts."
      />

      <div>
        <h2 className="text-xl font-bold text-white tracking-tight">My Submitted Proposals</h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Track the status of your pitches, respond to creator counter-offers, and view assigned contracts
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
        <div className="space-y-3.5">
          {bids.map((bid) => {
            const isNegotiating = bid.status === 'negotiating' || bid.status === 'counter_offered';
            const creatorCountered = isNegotiating && bid.lastOfferBy === 'creator';
            const freelancerCountered = isNegotiating && bid.lastOfferBy === 'freelancer';
            const displayPrice = bid.currentOffer != null ? bid.currentOffer : bid.bidAmount;
            const hasHistory = Array.isArray(bid.negotiationHistory) && bid.negotiationHistory.length > 0;
            const isHistoryOpen = showHistoryBidId === bid.id;

            return (
              <div
                key={bid.id}
                id={`app-card-${bid.id}`}
                className={`glass-card p-5 border transition-all rounded-2xl space-y-3.5 ${
                  creatorCountered
                    ? 'border-purple-500/50 bg-gradient-to-r from-purple-950/20 via-[#0E1322] to-[#0A0D16] ring-1 ring-purple-500/30 shadow-lg shadow-purple-950/20'
                    : 'border-white/[0.06] hover:border-purple-500/30'
                }`}
              >
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30">
                        {bid.roleTitle || 'Video Editor'}
                      </span>
                      {bid.projectTitle && (
                        <span className="text-xs text-slate-400">
                          on <strong className="text-slate-200">{bid.projectTitle}</strong>
                        </span>
                      )}
                    </div>
                    <h3 className="text-sm font-bold text-white truncate">
                      {bid.roleTitle ? `${bid.roleTitle} — ${bid.projectTitle}` : bid.projectTitle}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5 truncate">
                      Client: <span className="text-slate-200 font-semibold">{bid.creatorName || 'Creator'}</span> • Submitted {bid.createdAt || 'Recently'} {bid.estimatedDeliveryDays ? `• ${bid.estimatedDeliveryDays} days delivery` : ''}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 self-start sm:self-auto shrink-0">
                    <div className="text-right">
                      <span className="text-base font-extrabold text-emerald-400 font-mono block">
                        ₹{Number(displayPrice || 0).toLocaleString('en-IN')}
                      </span>
                      {bid.currentOffer != null && bid.currentOffer !== bid.bidAmount && (
                        <span className="text-[10px] text-slate-400 line-through block">
                          Initial: ₹{Number(bid.bidAmount || 0).toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>

                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-lg border capitalize ${getStatusBadge(bid.status, bid.lastOfferBy)}`}>
                      {isNegotiating ? 'Negotiating' : bid.status || 'pending'}
                    </span>
                  </div>
                </div>

                {/* Freelancer's original proposal message */}
                {bid.proposal && (
                  <div className="text-xs text-slate-300 bg-white/[0.02] p-3 rounded-xl border border-white/[0.04] leading-relaxed">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block mb-0.5">Your Cover Note</span>
                    {bid.proposal}
                  </div>
                )}

                {/* ========================================================================= */}
                {/* PROMINENT CREATOR COUNTER-OFFER BANNER & ACTIONS                          */}
                {/* ========================================================================= */}
                {creatorCountered && (
                  <div className="p-4 rounded-xl bg-gradient-to-r from-purple-900/30 to-indigo-900/20 border border-purple-500/40 space-y-3 animate-fade-in">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center shrink-0">
                          <Handshake className="w-4 h-4 text-purple-300" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-bold text-white">
                              Creator's Counter-Offer:
                            </span>
                            <span className="text-base font-extrabold text-emerald-300 font-mono">
                              ₹{Number(bid.currentOffer).toLocaleString('en-IN')}
                            </span>
                          </div>
                          {bid.counterNote ? (
                            <p className="text-xs text-purple-200/90 mt-1 italic">
                              "{bid.counterNote}"
                            </p>
                          ) : (
                            <p className="text-[11px] text-slate-400 mt-0.5">
                              The creator proposed this rate for the position.
                            </p>
                          )}
                        </div>
                      </div>

                      {/* 3 ACTIONS: Accept, Decline, Negotiate Again */}
                      <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                        <Button
                          variant="primary"
                          size="xs"
                          icon={Check}
                          onClick={() => handleAcceptOffer(bid.id, bid.currentOffer)}
                          className="bg-emerald-600 hover:bg-emerald-500 font-semibold"
                        >
                          Accept Offer
                        </Button>
                        <button
                          type="button"
                          onClick={() => openCounterModal(bid)}
                          className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-purple-600/20 hover:bg-purple-600/30 text-purple-200 hover:text-white border border-purple-500/40 transition-all flex items-center gap-1 cursor-pointer"
                        >
                          <ArrowRightLeft className="w-3.5 h-3.5" />
                          <span>Negotiate Again</span>
                        </button>
                        <Button
                          variant="ghost"
                          size="xs"
                          icon={X}
                          onClick={() => handleDeclineOffer(bid.id)}
                          className="text-rose-400 hover:text-rose-300 hover:bg-rose-950/20"
                        >
                          Decline
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Freelancer sent counter-offer, awaiting creator */}
                {freelancerCountered && (
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-between gap-3 text-xs text-amber-200">
                    <div className="flex items-center gap-2">
                      <ArrowRightLeft className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>
                        Your counter-offer of <strong>₹{Number(bid.currentOffer).toLocaleString('en-IN')}</strong> was submitted • Awaiting creator's review
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => openCounterModal(bid)}
                      className="text-xs text-amber-300 hover:text-white underline font-semibold cursor-pointer shrink-0"
                    >
                      Update
                    </button>
                  </div>
                )}

                {/* Accepted State Shortcut to Workspace */}
                {bid.status === 'accepted' && (
                  <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25">
                    <span className="text-xs text-emerald-300 font-semibold flex items-center gap-1.5">
                      <Check className="w-4 h-4 text-emerald-400" />
                      Hired! Contract agreed at ₹{Number(displayPrice).toLocaleString('en-IN')}
                    </span>
                    <button
                      type="button"
                      onClick={() => navigate(`/editor/workspace?projectId=${bid.projectId}`)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                    >
                      <FolderGit2 className="w-3.5 h-3.5" />
                      <span>Open Workspace</span>
                    </button>
                  </div>
                )}

                {/* Negotiation History Log Toggle */}
                {hasHistory && (
                  <div className="pt-2 border-t border-white/[0.04]">
                    <button
                      type="button"
                      onClick={() => setShowHistoryBidId(isHistoryOpen ? null : bid.id)}
                      className="text-[11px] font-semibold text-slate-400 hover:text-purple-300 transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <History className="w-3.5 h-3.5 text-purple-400" />
                      <span>Negotiation Log ({bid.negotiationHistory.length} offers exchanged)</span>
                      {isHistoryOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </button>

                    {isHistoryOpen && (
                      <div className="mt-2.5 p-3 rounded-xl bg-[#0B0E17]/80 border border-white/[0.05] space-y-2 text-xs">
                        <div className="text-[10px] text-slate-400">
                          Initial Proposal: <strong className="text-white">₹{Number(bid.bidAmount || 0).toLocaleString('en-IN')}</strong>
                        </div>
                        {bid.negotiationHistory.map((hist, idx) => (
                          <div key={idx} className="flex items-center justify-between py-1 border-t border-white/[0.03]">
                            <span className="text-slate-300 capitalize">
                              {hist.offeredBy === 'creator' ? `${bid.creatorName || 'Creator'}` : 'You (Freelancer)'}:
                            </span>
                            <div className="text-right">
                              <span className="font-mono font-bold text-emerald-400">
                                ₹{Number(hist.amount).toLocaleString('en-IN')}
                              </span>
                              {hist.note && <span className="text-[10px] text-slate-400 block italic">"{hist.note}"</span>}
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
      {/* FREELANCER COUNTER-OFFER MODAL                                           */}
      {/* ========================================================================= */}
      {negotiatingBid && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-md glass-card p-6 rounded-2xl border border-purple-500/40 shadow-2xl relative space-y-5">
            <button
              type="button"
              onClick={() => setNegotiatingBid(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center shrink-0">
                <ArrowRightLeft className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white tracking-tight">Counter Creator's Offer</h3>
                <p className="text-xs text-slate-400 truncate max-w-[280px]">
                  {negotiatingBid.roleTitle} on {negotiatingBid.projectTitle}
                </p>
              </div>
            </div>

            <form onSubmit={handleCounterSubmit} className="space-y-4">
              <div className="p-3 rounded-xl bg-[#141A28]/80 border border-white/[0.06] flex items-center justify-between text-xs">
                <span className="text-slate-400">Creator's Proposed Rate:</span>
                <span className="font-mono font-bold text-white">
                  ₹{Number(negotiatingBid.currentOffer || negotiatingBid.bidAmount || 0).toLocaleString('en-IN')}
                </span>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-200 block">
                  Your Counter Amount (₹) <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">₹</span>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    required
                    placeholder="e.g. 1350"
                    value={counterAmount}
                    onChange={(e) => setCounterAmount(e.target.value)}
                    className="w-full pl-8 pr-4 py-2.5 bg-[#0A0D15] rounded-xl border border-white/[0.1] text-white text-sm font-mono font-bold focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-200 block">
                  Add a Note to Creator <span className="text-[11px] text-slate-400 font-normal">(Optional)</span>
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. I can meet you in the middle at ₹1,350 and include color grading + 2 revisions."
                  value={counterNote}
                  onChange={(e) => setCounterNote(e.target.value)}
                  className="w-full p-3 bg-[#0A0D15] rounded-xl border border-white/[0.1] text-slate-200 text-xs focus:outline-none focus:border-purple-500 leading-relaxed resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setNegotiatingBid(null)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={isSubmitting}
                  className="bg-purple-600 hover:bg-purple-500 text-white"
                >
                  {isSubmitting ? 'Sending...' : 'Send Counter-Offer'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyApplications;
