import React, { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  Clock,
  Lock,
  ArrowRight,
  Play,
  ExternalLink,
  AlertCircle,
  FileVideo,
  Coins,
  Send,
  Sparkles,
} from 'lucide-react';
import { useWallet } from '../../context/WalletContext';
import { useAuth } from '../../context/AuthContext';
import SecurityPinModal from '../wallet/SecurityPinModal';

export const MilestoneEscrowPipeline = ({
  workspaceId,
  totalBudget = 10000,
  isCreator = true,
  editorName = 'Editor',
  editorId = null,
  projectId = null,
}) => {
  const { walletBalance, fundMilestone, releaseMilestone } = useWallet();
  const { currentUser } = useAuth();

  // Convert raw total budget into number
  const numericBudget =
    typeof totalBudget === 'number'
      ? totalBudget
      : parseInt(String(totalBudget).replace(/[^0-9]/g, ''), 10) || 10000;

  // Split budget into 3 standard milestones: 30%, 40%, 30%
  const m1Amount = Math.round(numericBudget * 0.3);
  const m2Amount = Math.round(numericBudget * 0.4);
  const m3Amount = numericBudget - m1Amount - m2Amount;

  // Persistent storage key per workspace
  const STORAGE_KEY = `collabo_milestones_${workspaceId || 'default'}`;

  const [milestones, setMilestones] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn(e);
    }
    return [
      {
        id: 'm1',
        index: 1,
        title: 'Milestone 1: Rough Cut & Story Assembly',
        description: 'First timeline pass, rhythm, storytelling cut, and basic clip selection.',
        amount: m1Amount,
        status: 'approved', // Pre-seeded as approved so demo starts with immediate visible progress!
        submittedUrl: 'https://vimeo.com/demo-rough-cut',
        submissionNotes: 'Completed assembly timeline with all A-roll synced and trimmed.',
      },
      {
        id: 'm2',
        index: 2,
        title: 'Milestone 2: Sound Design & Color Grading',
        description: 'Audio leveling, SFX, music mixing, cinematic color LUT application.',
        amount: m2Amount,
        status: 'submitted', // In Review: Creator can approve & release right away!
        submittedUrl: 'https://drive.google.com/demo-color-grade',
        submissionNotes: 'Color grade completed matching reference teal & orange tone. Cinematic sound fx added.',
      },
      {
        id: 'm3',
        index: 3,
        title: 'Milestone 3: 4K Master Export & Short Clips',
        description: 'High-res master deliverable, final captions, and 2 vertical shorts.',
        amount: m3Amount,
        status: 'pending', // Pending funding
        submittedUrl: '',
        submissionNotes: '',
      },
    ];
  });

  // PIN modal control
  const [pinModalConfig, setPinModalConfig] = useState({
    isOpen: false,
    action: null, // 'fund' or 'release'
    milestone: null,
  });

  // Editor submission modal
  const [activeSubmittingMilestone, setActiveSubmittingMilestone] = useState(null);
  const [submissionUrl, setSubmissionUrl] = useState('');
  const [submissionNotes, setSubmissionNotes] = useState('');

  const syncMilestones = (updated) => {
    setMilestones(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn(e);
    }
  };

  // Open PIN modal for funding
  const handleInitiateFund = (m) => {
    setPinModalConfig({
      isOpen: true,
      action: 'fund',
      milestone: m,
      title: `Authorize Milestone Escrow Deposit`,
      description: `Enter your 4-digit PIN to lock ₹${m.amount.toLocaleString('en-IN')} in Escrow for ${m.title}.`,
      amount: m.amount,
    });
  };

  // Open PIN modal for release
  const handleInitiateRelease = (m) => {
    setPinModalConfig({
      isOpen: true,
      action: 'release',
      milestone: m,
      title: `Authorize Milestone Payment Release`,
      description: `Enter your 4-digit PIN to release ₹${m.amount.toLocaleString('en-IN')} to ${editorName}.`,
      amount: m.amount,
    });
  };

  // PIN Success handler
  const handlePinSuccess = async (pin) => {
    const { action, milestone } = pinModalConfig;
    if (!milestone) return;

    if (action === 'fund') {
      const ok = await fundMilestone(milestone.title, milestone.amount, pin, workspaceId, projectId);
      if (ok) {
        const updated = milestones.map((item) =>
          item.id === milestone.id ? { ...item, status: 'funded' } : item
        );
        syncMilestones(updated);
      }
    } else if (action === 'release') {
      const ok = await releaseMilestone(
        milestone.title,
        milestone.amount,
        pin,
        editorName,
        editorId,
        workspaceId,
        projectId
      );
      if (ok) {
        const updated = milestones.map((item) =>
          item.id === milestone.id ? { ...item, status: 'approved' } : item
        );
        syncMilestones(updated);
      }
    }
  };

  // Editor submit cut
  const handleSubmitCut = (e) => {
    e.preventDefault();
    if (!activeSubmittingMilestone || !submissionUrl.trim()) return;

    const updated = milestones.map((item) =>
      item.id === activeSubmittingMilestone.id
        ? {
            ...item,
            status: 'submitted',
            submittedUrl: submissionUrl.trim(),
            submissionNotes: submissionNotes.trim() || 'Cut submitted for review.',
          }
        : item
    );

    syncMilestones(updated);
    setActiveSubmittingMilestone(null);
    setSubmissionUrl('');
    setSubmissionNotes('');
  };

  // Escrow Calculations
  const totalPaid = milestones
    .filter((m) => m.status === 'approved')
    .reduce((sum, m) => sum + m.amount, 0);

  const totalInEscrow = milestones
    .filter((m) => m.status === 'funded' || m.status === 'submitted')
    .reduce((sum, m) => sum + m.amount, 0);

  const completedCount = milestones.filter((m) => m.status === 'approved').length;
  const progressPercent = Math.round((completedCount / milestones.length) * 100);

  return (
    <div className="space-y-4">
      {/* Overview Stat Header */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#0E1322] to-[#121829] border border-white/[0.08] shadow-lg">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <h4 className="text-sm font-bold text-white tracking-tight">
                Multi-Stage Escrow Pipeline
              </h4>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                Bank-Grade Ledger
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Funds are held safely in third-party escrow and only released milestone-by-milestone upon Creator PIN authorization.
            </p>
          </div>

          <div className="flex items-center gap-3 self-stretch sm:self-auto justify-between sm:justify-end">
            <div className="text-left sm:text-right">
              <span className="text-[10px] text-slate-400 block uppercase font-mono">Released to Editor</span>
              <span className="text-sm font-bold text-emerald-400 font-mono">
                ₹{totalPaid.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="h-7 w-px bg-white/10" />
            <div className="text-left sm:text-right">
              <span className="text-[10px] text-slate-400 block uppercase font-mono">Locked in Escrow</span>
              <span className="text-sm font-bold text-purple-300 font-mono">
                ₹{totalInEscrow.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div>
          <div className="flex items-center justify-between text-[11px] mb-1.5 font-medium">
            <span className="text-slate-300">Milestone Completion ({completedCount}/3)</span>
            <span className="text-purple-300 font-mono">{progressPercent}%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-[#182030] overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-500 via-indigo-500 to-emerald-400 transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Milestone Cards List */}
      <div className="space-y-3">
        {milestones.map((m) => {
          const isPending = m.status === 'pending';
          const isFunded = m.status === 'funded';
          const isSubmitted = m.status === 'submitted';
          const isApproved = m.status === 'approved';

          return (
            <div
              key={m.id}
              className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                isApproved
                  ? 'bg-[#0E1524]/70 border-emerald-500/30'
                  : isSubmitted
                  ? 'bg-[#141A2E] border-purple-500/40 ring-1 ring-purple-500/20 shadow-md shadow-purple-950/30'
                  : isFunded
                  ? 'bg-[#101626] border-indigo-500/30'
                  : 'bg-[#0B0E17]/60 border-white/[0.05]'
              }`}
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                {/* Milestone Info */}
                <div className="space-y-1 max-w-xl">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="w-5 h-5 rounded-full bg-white/[0.06] border border-white/[0.1] text-[10px] font-bold text-slate-300 flex items-center justify-center">
                      {m.index}
                    </span>
                    <h5 className="text-xs sm:text-sm font-bold text-white tracking-tight">
                      {m.title}
                    </h5>

                    {/* Status Badge */}
                    {isApproved && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                        <CheckCircle2 className="w-3 h-3" /> Approved & Released
                      </span>
                    )}
                    {isSubmitted && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                        <Clock className="w-3 h-3" /> Cut Delivered • Review Pending
                      </span>
                    )}
                    {isFunded && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                        <Lock className="w-3 h-3" /> Funded • Safe in Escrow
                      </span>
                    )}
                    {isPending && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-800 text-slate-400 border border-white/[0.06]">
                        Pending Funding
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed pl-7">{m.description}</p>
                </div>

                {/* Amount & Actions */}
                <div className="flex items-center gap-3 sm:flex-col sm:items-end w-full sm:w-auto justify-between sm:justify-start pt-2 sm:pt-0 border-t sm:border-t-0 border-white/[0.06]">
                  <span className="text-sm font-bold text-white font-mono">
                    ₹{m.amount.toLocaleString('en-IN')}
                  </span>

                  {/* Creator Actions */}
                  {isCreator && (
                    <div className="flex items-center gap-2">
                      {isPending && (
                        <button
                          type="button"
                          onClick={() => handleInitiateFund(m)}
                          className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-sm cursor-pointer flex items-center gap-1.5"
                        >
                          <Lock className="w-3.5 h-3.5" />
                          Fund Milestone (PIN)
                        </button>
                      )}

                      {isSubmitted && (
                        <button
                          type="button"
                          onClick={() => handleInitiateRelease(m)}
                          className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-md shadow-emerald-950/40 cursor-pointer flex items-center gap-1.5 animate-pulse"
                        >
                          <ShieldCheck className="w-3.5 h-3.5" />
                          Approve & Release (PIN)
                        </button>
                      )}

                      {isFunded && (
                        <span className="text-xs text-indigo-300 flex items-center gap-1 font-medium">
                          <Lock className="w-3 h-3" /> Awaiting Editor Cut
                        </span>
                      )}

                      {isApproved && (
                        <span className="text-xs text-emerald-400 flex items-center gap-1 font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Settled
                        </span>
                      )}
                    </div>
                  )}

                  {/* Editor Actions */}
                  {!isCreator && (
                    <div className="flex items-center gap-2">
                      {isFunded && (
                        <button
                          type="button"
                          onClick={() => setActiveSubmittingMilestone(m)}
                          className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-500 hover:to-sky-500 text-white shadow-sm cursor-pointer flex items-center gap-1.5"
                        >
                          <FileVideo className="w-3.5 h-3.5" />
                          Submit Milestone Cut
                        </button>
                      )}

                      {isSubmitted && (
                        <span className="text-xs text-amber-300 font-medium flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Under Client Review
                        </span>
                      )}

                      {isApproved && (
                        <span className="text-xs text-emerald-400 font-medium flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Paid to Wallet
                        </span>
                      )}

                      {isPending && (
                        <span className="text-xs text-slate-500">Awaiting Creator Funding</span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Submitted Review Box (If Cut Delivered) */}
              {m.submittedUrl && (
                <div className="mt-3.5 pt-3 border-t border-white/[0.06] flex items-center justify-between flex-wrap gap-2 text-xs">
                  <div className="flex items-center gap-2 text-slate-300">
                    <FileVideo className="w-4 h-4 text-purple-400 shrink-0" />
                    <span className="text-slate-400">Review Cut:</span>
                    <a
                      href={m.submittedUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-300 hover:text-purple-200 underline flex items-center gap-1 max-w-[240px] truncate"
                    >
                      {m.submittedUrl}
                      <ExternalLink className="w-3 h-3 shrink-0" />
                    </a>
                  </div>
                  {m.submissionNotes && (
                    <p className="text-[11px] text-slate-400 italic">"{m.submissionNotes}"</p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Security PIN Authorization Modal */}
      <SecurityPinModal
        isOpen={pinModalConfig.isOpen}
        onClose={() => setPinModalConfig({ isOpen: false, action: null, milestone: null })}
        onSuccess={handlePinSuccess}
        actionTitle={pinModalConfig.title}
        actionDescription={pinModalConfig.description}
        amount={pinModalConfig.amount}
      />

      {/* Editor Submit Milestone Modal */}
      {activeSubmittingMilestone && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-md glass-card p-6 border border-white/[0.12] rounded-2xl bg-[#0B0E17]/95 shadow-2xl">
            <h4 className="text-base font-bold text-white mb-1">
              Submit Cut for {activeSubmittingMilestone.title}
            </h4>
            <p className="text-xs text-slate-400 mb-4">
              Upload your video cut preview link (Google Drive, Vimeo, Frame.io) for creator review.
            </p>

            <form onSubmit={handleSubmitCut} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Video Preview URL <span className="text-rose-400">*</span>
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://drive.google.com/... or Vimeo link"
                  value={submissionUrl}
                  onChange={(e) => setSubmissionUrl(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#141A28] text-white border border-white/[0.08] focus:outline-none focus:border-purple-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Editor Notes</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Rough cut assembly done with 2 revision passes..."
                  value={submissionNotes}
                  onChange={(e) => setSubmissionNotes(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#141A28] text-white border border-white/[0.08] focus:outline-none focus:border-purple-500 resize-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setActiveSubmittingMilestone(null)}
                  className="px-3 py-1.5 rounded-xl text-slate-400 hover:text-white bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl font-semibold text-white bg-blue-600 hover:bg-blue-500 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Send className="w-3.5 h-3.5" />
                  Submit Cut for Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MilestoneEscrowPipeline;
