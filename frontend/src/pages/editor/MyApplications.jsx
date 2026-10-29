import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  FileCheck2,
  Check,
  X,
  ArrowRightLeft,
  Handshake,
  History,
  ChevronDown,
  ChevronUp,
  FolderGit2,
  Sparkles
} from 'lucide-react';
import { SkeletonRow } from '../../components/common/Skeleton';
import SEO from '../../components/common/SEO';
import { applicationService } from '../../services/applicationService';
import { useAlert } from '../../context/AlertContext';
import ModalPortal from '../../components/common/ModalPortal';

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
          element.classList.add('ring-4', 'ring-[#FFEBAA]', 'shadow-[0_0_20px_rgba(255,235,170,0.6)]', 'transition-all', 'duration-500');
          setTimeout(() => {
            element.classList.remove('ring-4', 'ring-[#FFEBAA]', 'shadow-[0_0_20px_rgba(255,235,170,0.6)]');
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
      await applicationService.submitCounterOffer(negotiatingBid.id, {
        counterAmount: Number(counterAmount),
        counterNote: counterNote.trim() || undefined,
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

  const getStatusBadge = (status) => {
    if (status === 'negotiating' || status === 'counter_offered') {
      return 'text-[#261615] bg-[#FFEBAA] border-[#382322]';
    }
    switch (status) {
      case 'accepted':
        return 'text-emerald-950 dark:text-emerald-200 bg-emerald-200 dark:bg-emerald-900/60 border-emerald-700/60';
      case 'rejected':
        return 'text-rose-950 dark:text-rose-200 bg-rose-200 dark:bg-rose-900/60 border-rose-700/60';
      case 'withdrawn':
        return 'text-stone-800 dark:text-stone-300 bg-stone-200 dark:bg-stone-800 border-stone-500/50';
      default:
        return 'text-[#261615] bg-[#B1C8EA] border-[#382322]';
    }
  };

  return (
    <div className="space-y-6 pb-16 animate-fade-in text-[#261615] dark:text-[#FDEBDE]">
      <SEO
        title="My Proposals"
        description="Track the status of your video editing bids, creator counter-offers, and contracts."
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b-2 border-[#382322]/10 dark:border-[#FDEBDE]/10">
        <div>
          <h2 className="text-2xl sm:text-3xl font-serif font-black tracking-tight text-[#261615] dark:text-[#FDEBDE]">
            My Submitted Proposals
          </h2>
          <p className="text-xs sm:text-sm text-[#5C3A38] dark:text-[#D4B8A8] mt-1 font-sans">
            Track the status of your pitches, respond to creator counter-offers, and view assigned contracts
          </p>
        </div>
        <button
          onClick={() => navigate('/editor/browse')}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#FFEBAA] hover:bg-[#ffe58f] text-[#261615] border-2 border-[#382322] shadow-[3px_3px_0_#382322] text-xs font-bold font-mono uppercase tracking-wider transition-all cursor-pointer self-start sm:self-auto active:translate-x-0.5 active:translate-y-0.5"
        >
          <Sparkles className="w-4 h-4 text-[#261615]" />
          <span>Browse More Gigs</span>
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          <SkeletonRow />
          <SkeletonRow />
          <SkeletonRow />
        </div>
      ) : bids.length === 0 ? (
        <div className="bg-[#FFFDF9] dark:bg-[#201413] p-12 text-center rounded-2xl border-2 border-[#382322] dark:border-[#FDEBDE]/30 shadow-[4px_4px_0_#382322] dark:shadow-[4px_4px_0_#000]">
          <FileCheck2 className="w-12 h-12 text-[#5C3A38] dark:text-[#D4B8A8] mx-auto mb-3 opacity-60" />
          <h4 className="text-base font-serif font-bold text-[#261615] dark:text-[#FDEBDE]">No submitted proposals yet</h4>
          <p className="text-xs sm:text-sm text-[#5C3A38] dark:text-[#D4B8A8] mt-1 max-w-sm mx-auto font-sans">
            Browse open creator briefs in the marketplace and submit your first bid.
          </p>
          <button
            onClick={() => navigate('/editor/browse')}
            className="mt-5 px-5 py-2.5 rounded-xl bg-[#FFEBAA] hover:bg-[#ffe58f] text-[#261615] border-2 border-[#382322] shadow-[3px_3px_0_#382322] text-xs font-bold font-mono uppercase tracking-wider transition-all cursor-pointer active:translate-x-0.5 active:translate-y-0.5 inline-flex items-center gap-2"
          >
            <span>Browse Creator Gigs</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
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
                className={`bg-[#FFFDF9] dark:bg-[#201413] p-5 sm:p-6 rounded-2xl border-2 transition-all space-y-4 ${
                  creatorCountered
                    ? 'border-[#382322] dark:border-[#FFEBAA] shadow-[6px_6px_0_#382322] dark:shadow-[6px_6px_0_#FFEBAA]/20 bg-gradient-to-br from-[#FFF7F1] via-[#FFFDF9] to-[#FFEBAA]/20 dark:from-[#201413] dark:via-[#2A1B19] dark:to-[#382322]'
                    : 'border-[#382322] dark:border-[#FDEBDE]/30 shadow-[4px_4px_0_#382322] dark:shadow-[4px_4px_0_#000]'
                }`}
              >
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span className="px-2.5 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider rounded-lg bg-[#FFEBAA] text-[#261615] border border-[#382322]">
                        {bid.roleTitle || 'Video Editor'}
                      </span>
                      {bid.projectTitle && (
                        <span className="text-xs text-[#5C3A38] dark:text-[#D4B8A8] font-sans">
                          on <strong className="text-[#261615] dark:text-[#FDEBDE] font-semibold underline decoration-[#FFEBAA]">{bid.projectTitle}</strong>
                        </span>
                      )}
                    </div>
                    <h3 className="text-base sm:text-lg font-serif font-bold text-[#261615] dark:text-[#FDEBDE] truncate">
                      {bid.roleTitle ? `${bid.roleTitle} — ${bid.projectTitle}` : bid.projectTitle}
                    </h3>
                    <p className="text-xs text-[#5C3A38] dark:text-[#D4B8A8] mt-0.5 truncate font-sans">
                      Client: <span className="text-[#261615] dark:text-[#FDEBDE] font-bold">{bid.creatorName || 'Creator'}</span> • Submitted {bid.createdAt || 'Recently'} {bid.estimatedDeliveryDays ? `• ${bid.estimatedDeliveryDays} days delivery` : ''}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 self-start sm:self-auto shrink-0">
                    <div className="text-right">
                      <span className="text-lg sm:text-xl font-black text-[#059669] dark:text-[#34D399] font-mono block">
                        ₹{Number(displayPrice || 0).toLocaleString('en-IN')}
                      </span>
                      {bid.currentOffer != null && bid.currentOffer !== bid.bidAmount && (
                        <span className="text-[11px] text-[#5C3A38] dark:text-[#D4B8A8] line-through block font-mono">
                          Initial: ₹{Number(bid.bidAmount || 0).toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>

                    <span className={`px-2.5 py-1 text-xs font-mono font-bold uppercase tracking-wider rounded-lg border-2 shadow-[1.5px_1.5px_0_#382322] ${getStatusBadge(bid.status, bid.lastOfferBy)}`}>
                      {isNegotiating ? 'Negotiating' : bid.status || 'pending'}
                    </span>
                  </div>
                </div>

                {/* Freelancer's original proposal message */}
                {bid.proposal && (
                  <div className="text-xs sm:text-sm text-[#382322] dark:text-[#FDEBDE]/90 bg-[#FFF7F1] dark:bg-[#19100F] p-3.5 rounded-xl border-2 border-[#382322]/15 dark:border-[#FDEBDE]/15 leading-relaxed font-sans">
                    <span className="text-[10px] uppercase font-bold font-mono tracking-wider text-[#5C3A38] dark:text-[#FFEBAA] block mb-1">
                      Your Cover Note
                    </span>
                    {bid.proposal}
                  </div>
                )}

                {/* Prominent Creator Counter-Offer Banner */}
                {creatorCountered && (
                  <div className="p-4 sm:p-5 rounded-xl bg-[#FFEBAA]/30 dark:bg-[#FFEBAA]/10 border-2 border-[#382322] dark:border-[#FFEBAA]/50 shadow-[3px_3px_0_#382322] dark:shadow-[3px_3px_0_#000] space-y-3 animate-fade-in">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#FFEBAA] border-2 border-[#382322] flex items-center justify-center shrink-0 shadow-[2px_2px_0_#382322]">
                          <Handshake className="w-5 h-5 text-[#261615]" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs sm:text-sm font-bold font-mono uppercase tracking-wider text-[#261615] dark:text-[#FDEBDE]">
                              Creator's Counter-Offer:
                            </span>
                            <span className="text-lg font-black text-[#059669] dark:text-[#34D399] font-mono">
                              ₹{Number(bid.currentOffer).toLocaleString('en-IN')}
                            </span>
                          </div>
                          {bid.counterNote ? (
                            <p className="text-xs sm:text-sm text-[#5C3A38] dark:text-[#FFEBAA] mt-1 italic font-sans">
                              "{bid.counterNote}"
                            </p>
                          ) : (
                            <p className="text-xs text-[#5C3A38] dark:text-[#D4B8A8] mt-0.5 font-sans">
                              The creator proposed this rate for the position.
                            </p>
                          )}
                        </div>
                      </div>

                      {/* 3 ACTIONS: Accept, Decline, Negotiate Again */}
                      <div className="flex items-center gap-2.5 self-end sm:self-auto shrink-0 flex-wrap">
                        <button
                          type="button"
                          onClick={() => handleAcceptOffer(bid.id, bid.currentOffer)}
                          className="px-3.5 py-1.5 rounded-xl bg-[#059669] hover:bg-[#047857] text-white border-2 border-[#382322] shadow-[2px_2px_0_#382322] text-xs font-bold font-mono uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer active:translate-x-0.5 active:translate-y-0.5"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Accept Offer</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => openCounterModal(bid)}
                          className="px-3 py-1.5 rounded-xl bg-[#FFF7F1] dark:bg-[#19100F] hover:bg-[#FDEBDE] dark:hover:bg-[#2A1B19] text-[#261615] dark:text-[#FDEBDE] border-2 border-[#382322] dark:border-[#FDEBDE]/30 shadow-[2px_2px_0_#382322] text-xs font-bold font-mono uppercase tracking-wider transition-all flex items-center gap-1 cursor-pointer active:translate-x-0.5 active:translate-y-0.5"
                        >
                          <ArrowRightLeft className="w-3.5 h-3.5" />
                          <span>Negotiate</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeclineOffer(bid.id)}
                          className="px-3 py-1.5 rounded-xl bg-[#FFF7F1] dark:bg-[#19100F] hover:bg-rose-100 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 border-2 border-[#382322] dark:border-[#FDEBDE]/30 text-xs font-bold font-mono uppercase tracking-wider transition-all flex items-center gap-1 cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Decline</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Freelancer sent counter-offer, awaiting creator */}
                {freelancerCountered && (
                  <div className="p-3.5 rounded-xl bg-[#FFEBAA]/20 dark:bg-[#FFEBAA]/10 border-2 border-[#382322]/20 dark:border-[#FFEBAA]/30 flex items-center justify-between gap-3 text-xs sm:text-sm text-[#261615] dark:text-[#FDEBDE]">
                    <div className="flex items-center gap-2">
                      <ArrowRightLeft className="w-4 h-4 text-[#8A5200] dark:text-[#FFEBAA] shrink-0" />
                      <span>
                        Your counter-offer of <strong className="font-mono font-bold text-[#059669] dark:text-[#34D399]">₹{Number(bid.currentOffer).toLocaleString('en-IN')}</strong> was submitted • Awaiting creator review
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => openCounterModal(bid)}
                      className="text-xs font-mono font-bold uppercase tracking-wider underline text-[#5C3A38] dark:text-[#FFEBAA] hover:text-[#261615] cursor-pointer shrink-0"
                    >
                      Update
                    </button>
                  </div>
                )}

                {/* Accepted State Shortcut to Workspace */}
                {bid.status === 'accepted' && (
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3.5 rounded-xl bg-[#D1FAE5]/50 dark:bg-[#065F46]/20 border-2 border-[#065F46]/30 dark:border-[#34D399]/30 gap-3">
                    <span className="text-xs sm:text-sm text-[#065F46] dark:text-[#34D399] font-bold flex items-center gap-1.5">
                      <Check className="w-4 h-4 text-[#059669]" />
                      Hired! Contract agreed at ₹{Number(displayPrice).toLocaleString('en-IN')}
                    </span>
                    <button
                      type="button"
                      onClick={() => navigate(`/editor/workspace?projectId=${bid.projectId}`)}
                      className="px-3.5 py-1.5 rounded-xl bg-[#059669] hover:bg-[#047857] text-white border-2 border-[#382322] shadow-[2px_2px_0_#382322] text-xs font-bold font-mono uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer active:translate-x-0.5 active:translate-y-0.5"
                    >
                      <FolderGit2 className="w-3.5 h-3.5" />
                      <span>Open Workspace</span>
                    </button>
                  </div>
                )}

                {/* Negotiation History Log Toggle */}
                {hasHistory && (
                  <div className="pt-2 border-t-2 border-[#382322]/10 dark:border-[#FDEBDE]/10">
                    <button
                      type="button"
                      onClick={() => setShowHistoryBidId(isHistoryOpen ? null : bid.id)}
                      className="text-xs font-bold font-mono uppercase tracking-wider text-[#5C3A38] dark:text-[#D4B8A8] hover:text-[#261615] dark:hover:text-[#FDEBDE] transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <History className="w-3.5 h-3.5 text-[#261615] dark:text-[#FFEBAA]" />
                      <span>Negotiation Log ({bid.negotiationHistory.length} offers exchanged)</span>
                      {isHistoryOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </button>

                    {isHistoryOpen && (
                      <div className="mt-3 p-4 rounded-xl bg-[#FFF7F1] dark:bg-[#19100F] border-2 border-[#382322] dark:border-[#FDEBDE]/20 shadow-[2px_2px_0_#382322] space-y-2 text-xs">
                        <div className="text-xs font-mono text-[#5C3A38] dark:text-[#D4B8A8] pb-1 border-b border-[#382322]/10 dark:border-[#FDEBDE]/10">
                          Initial Proposal: <strong className="text-[#261615] dark:text-[#FDEBDE]">₹{Number(bid.bidAmount || 0).toLocaleString('en-IN')}</strong>
                        </div>
                        {bid.negotiationHistory.map((hist, idx) => (
                          <div key={idx} className="flex items-center justify-between py-1.5 border-b last:border-b-0 border-[#382322]/10 dark:border-[#FDEBDE]/10">
                            <span className="text-[#382322] dark:text-[#FDEBDE] font-semibold capitalize font-sans">
                              {hist.offeredBy === 'creator' ? `${bid.creatorName || 'Creator'}` : 'You (Freelancer)'}:
                            </span>
                            <div className="text-right">
                              <span className="font-mono font-bold text-[#059669] dark:text-[#34D399]">
                                ₹{Number(hist.amount).toLocaleString('en-IN')}
                              </span>
                              {hist.note && <span className="text-[11px] text-[#5C3A38] dark:text-[#D4B8A8] block italic">"{hist.note}"</span>}
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

      {/* Freelancer Counter-Offer Modal */}
      {negotiatingBid && (
        <ModalPortal>
          <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-fade-in overflow-y-auto">
            <div className="w-full max-w-md my-auto max-h-[88vh] overflow-y-auto rounded-2xl bg-[#FFFDF9] dark:bg-[#201413] p-6 border-2 border-[#382322] dark:border-[#FDEBDE]/30 shadow-[8px_8px_0_#382322] dark:shadow-[8px_8px_0_#000] relative space-y-5 text-[#261615] dark:text-[#FDEBDE]">
              <button
                type="button"
                onClick={() => setNegotiatingBid(null)}
                className="absolute top-4 right-4 p-1.5 rounded-xl border-2 border-[#382322] dark:border-[#FDEBDE]/30 bg-[#FFF7F1] dark:bg-[#19100F] text-[#261615] dark:text-[#FDEBDE] hover:bg-[#FFEBAA] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#FFEBAA] border-2 border-[#382322] flex items-center justify-center shrink-0 shadow-[2px_2px_0_#382322]">
                  <ArrowRightLeft className="w-5 h-5 text-[#261615]" />
                </div>
                <div>
                  <h3 className="text-base font-serif font-bold text-[#261615] dark:text-[#FDEBDE] tracking-tight">
                    Counter Creator's Offer
                  </h3>
                  <p className="text-xs text-[#5C3A38] dark:text-[#D4B8A8] truncate max-w-[280px] font-sans">
                    {negotiatingBid.roleTitle} on {negotiatingBid.projectTitle}
                  </p>
                </div>
              </div>

              <form onSubmit={handleCounterSubmit} className="space-y-4">
                <div className="p-3 rounded-xl bg-[#FFF7F1] dark:bg-[#19100F] border-2 border-[#382322]/20 dark:border-[#FDEBDE]/20 flex items-center justify-between text-xs font-mono">
                  <span className="text-[#5C3A38] dark:text-[#D4B8A8]">Creator's Proposed Rate:</span>
                  <span className="font-bold text-[#059669] dark:text-[#34D399] text-sm">
                    ₹{Number(negotiatingBid.currentOffer || negotiatingBid.bidAmount || 0).toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold font-mono uppercase tracking-wider text-[#261615] dark:text-[#FDEBDE] block">
                    Your Counter Amount (₹) <span className="text-rose-600">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5C3A38] font-bold text-sm font-mono">₹</span>
                    <input
                      type="number"
                      min="1"
                      step="1"
                      required
                      placeholder="e.g. 1350"
                      value={counterAmount}
                      onChange={(e) => setCounterAmount(e.target.value)}
                      className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-[#FFF7F1] dark:bg-[#19100F] border-2 border-[#382322] dark:border-[#FDEBDE]/30 text-[#261615] dark:text-[#FDEBDE] text-sm font-mono font-bold focus:outline-none shadow-[2px_2px_0_#382322]"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold font-mono uppercase tracking-wider text-[#261615] dark:text-[#FDEBDE] block">
                    Add a Note to Creator <span className="text-[11px] text-[#5C3A38] dark:text-[#D4B8A8] font-normal normal-case">(Optional)</span>
                  </label>
                  <textarea
                    rows={3}
                    placeholder="e.g. I can meet you in the middle at ₹1,350 and include color grading + 2 revisions."
                    value={counterNote}
                    onChange={(e) => setCounterNote(e.target.value)}
                    className="w-full p-3 rounded-xl bg-[#FFF7F1] dark:bg-[#19100F] border-2 border-[#382322] dark:border-[#FDEBDE]/30 text-[#261615] dark:text-[#FDEBDE] text-xs focus:outline-none shadow-[2px_2px_0_#382322] leading-relaxed resize-none font-sans"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t-2 border-[#382322]/10 dark:border-[#FDEBDE]/10">
                  <button
                    type="button"
                    onClick={() => setNegotiatingBid(null)}
                    className="px-4 py-2 rounded-xl border-2 border-[#382322] dark:border-[#FDEBDE]/30 text-xs font-bold font-mono uppercase tracking-wider text-[#261615] dark:text-[#FDEBDE] bg-[#FFF7F1] dark:bg-[#19100F] hover:bg-[#FDEBDE] cursor-pointer transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2 rounded-xl bg-[#FFEBAA] hover:bg-[#ffe58f] text-[#261615] border-2 border-[#382322] shadow-[2px_2px_0_#382322] text-xs font-bold font-mono uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 active:translate-x-0.5 active:translate-y-0.5"
                  >
                    {isSubmitting ? 'Sending...' : 'Send Counter-Offer'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </ModalPortal>
      )}
    </div>
  );
};

export default MyApplications;
