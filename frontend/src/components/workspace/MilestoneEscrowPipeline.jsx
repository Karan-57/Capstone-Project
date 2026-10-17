import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  Clock,
  Lock,
  Play,
  ExternalLink,
  FileVideo,
  Coins,
  Send,
} from 'lucide-react';
import { useWallet } from '../../context/WalletContext';
import { useAuth } from '../../context/AuthContext';
import SecurityPinModal from '../wallet/SecurityPinModal';
import { generateMilestonesForRole } from '../../constants/roles.constants';

export const MilestoneEscrowPipeline = ({
  mode = 'all', // 'all' | 'summary' | 'milestones'
  workspaceId,
  totalBudget = 10000,
  projectTotalBudget = null,
  roleBudget = null,
  isCreator = true,
  editorName = 'Editor',
  editorId = null,
  projectId = null,
  roleTitle = '',
  roleId = '',
  initialMilestones = null,
}) => {
  const { fundMilestone, releaseMilestone, transactions = [] } = useWallet();
  const { currentUser } = useAuth();

  // Convert raw total budget into number (uses roleBudget if provided)
  const numericBudget =
    typeof (roleBudget || totalBudget) === 'number'
      ? (roleBudget || totalBudget)
      : parseInt(String(roleBudget || totalBudget).replace(/[^0-9]/g, ''), 10) || 10000;

  // Split budget into 3 standard milestones: 30%, 40%, 30%
  const m1Amount = Math.round(numericBudget * 0.3);
  const m2Amount = Math.round(numericBudget * 0.4);
  const m3Amount = numericBudget - m1Amount - m2Amount;

  // Primary persistent storage key per workspace and per freelancer/role
  const memberKey = editorId ? `_${editorId}` : roleId ? `_${roleId}` : '';
  const STORAGE_KEY = `collabo_milestones_${workspaceId || 'default'}${memberKey}`;
  const LEGACY_STORAGE_KEY = !memberKey && projectId ? `collabo_milestones_${projectId}` : null;

  // Helper to load and reconcile milestone list with real wallet transactions
  const getInitialMilestones = () => {
    let savedList = null;
    try {
      const saved =
        localStorage.getItem(STORAGE_KEY) ||
        (LEGACY_STORAGE_KEY ? localStorage.getItem(LEGACY_STORAGE_KEY) : null);
      if (saved) {
        savedList = JSON.parse(saved);
      }
    } catch (e) {
      console.warn(e);
    }

    // Build default list: ALL start strictly as 'pending', with NO fake demo URLs
    let defaultList = null;
    if (Array.isArray(initialMilestones) && initialMilestones.length > 0) {
      defaultList = initialMilestones.map((m, idx) => ({
        ...m,
        id: m.id || `m${idx + 1}`,
        index: m.index || idx + 1,
        amount: Number(m.amount) || Math.round(numericBudget / initialMilestones.length),
        status: m.status || 'pending',
        submittedUrl: m.submittedUrl && !m.submittedUrl.includes('demo-') ? m.submittedUrl : '',
        submissionNotes: m.submissionNotes && !m.submittedUrl?.includes('demo-') ? m.submissionNotes : '',
      }));
    } else if (roleId || roleTitle) {
      const generated = generateMilestonesForRole(roleId, numericBudget, null, roleTitle);
      defaultList = generated.map((m) => ({
        ...m,
        status: 'pending',
        submittedUrl: '',
        submissionNotes: '',
      }));
    } else {
      defaultList = [
        {
          id: 'm1',
          index: 1,
          title: 'Milestone 1: Rough Cut & Story Assembly',
          description: 'First timeline pass, rhythm, storytelling cut, and basic clip selection.',
          amount: m1Amount,
          status: 'pending',
          submittedUrl: '',
          submissionNotes: '',
        },
        {
          id: 'm2',
          index: 2,
          title: 'Milestone 2: Sound Design & Color Grading',
          description: 'Audio leveling, SFX, music mixing, cinematic color LUT application.',
          amount: m2Amount,
          status: 'pending',
          submittedUrl: '',
          submissionNotes: '',
        },
        {
          id: 'm3',
          index: 3,
          title: 'Milestone 3: 4K Master Export & Short Clips',
          description: 'High-res master deliverable, final captions, and 2 vertical shorts.',
          amount: m3Amount,
          status: 'pending',
          submittedUrl: '',
          submissionNotes: '',
        },
      ];
    }

    let baseList = Array.isArray(savedList) && savedList.length > 0 ? savedList : defaultList;

    // Sanitize any legacy cached demo values from localStorage
    baseList = baseList.map((m, idx) => {
      const isDemoUrl = m.submittedUrl && (m.submittedUrl.includes('demo-') || m.submittedUrl.includes('demo.'));
      const cleanUrl = isDemoUrl ? '' : (m.submittedUrl || '');
      const cleanNotes = isDemoUrl ? '' : (m.submissionNotes || '');

      return {
        ...m,
        id: m.id || `m${idx + 1}`,
        index: m.index || idx + 1,
        submittedUrl: cleanUrl,
        submissionNotes: cleanNotes,
      };
    });

    // Reconcile status strictly with real wallet transactions:
    return baseList.map((m) => {
      const isM1 = m.id === 'm1' || m.index === 1 || (m.title && m.title.includes('Milestone 1'));
      const isM2 = m.id === 'm2' || m.index === 2 || (m.title && m.title.includes('Milestone 2'));
      const isM3 = m.id === 'm3' || m.index === 3 || (m.title && m.title.includes('Milestone 3'));

      // Check if an actual release transaction exists
      const hasReleasedTxn = transactions.some((t) => {
        if (t.type !== 'ESCROW_RELEASE') return false;
        const desc = (t.description || '').toLowerCase();
        const mTitle = (t.milestoneTitle || '').toLowerCase();
        const thisTitle = (m.title || '').toLowerCase();

        if (isM1 && (desc.includes('milestone 1') || desc.includes('rough cut') || mTitle.includes('milestone 1') || mTitle.includes('rough cut'))) return true;
        if (isM2 && (desc.includes('milestone 2') || desc.includes('sound design') || mTitle.includes('milestone 2') || mTitle.includes('sound design'))) return true;
        if (isM3 && (desc.includes('milestone 3') || desc.includes('4k master') || mTitle.includes('milestone 3') || mTitle.includes('4k master'))) return true;
        return thisTitle && (desc.includes(thisTitle) || mTitle.includes(thisTitle));
      });

      if (hasReleasedTxn) {
        return { ...m, status: 'approved' };
      }

      // Check if an actual escrow lock/deposit transaction exists
      const hasLockedTxn = transactions.some((t) => {
        if (t.type !== 'ESCROW_LOCK') return false;
        const desc = (t.description || '').toLowerCase();
        const mTitle = (t.milestoneTitle || '').toLowerCase();
        const thisTitle = (m.title || '').toLowerCase();

        if (isM1 && (desc.includes('milestone 1') || desc.includes('rough cut') || mTitle.includes('milestone 1') || mTitle.includes('rough cut'))) return true;
        if (isM2 && (desc.includes('milestone 2') || desc.includes('sound design') || mTitle.includes('milestone 2') || mTitle.includes('sound design'))) return true;
        if (isM3 && (desc.includes('milestone 3') || desc.includes('4k master') || mTitle.includes('milestone 3') || mTitle.includes('4k master'))) return true;
        return thisTitle && (desc.includes(thisTitle) || mTitle.includes(thisTitle));
      });

      if (hasLockedTxn) {
        return { ...m, status: m.submittedUrl ? 'submitted' : 'funded' };
      }

      // No transactions found for this milestone: MUST be pending
      return { ...m, status: 'pending' };
    });
  };

  const [milestones, setMilestones] = useState(getInitialMilestones);

  // Synchronize milestones when workspace, project, or transactions change
  useEffect(() => {
    const updated = getInitialMilestones();
    setMilestones(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      if (LEGACY_STORAGE_KEY) {
        localStorage.setItem(LEGACY_STORAGE_KEY, JSON.stringify(updated));
      }
    } catch (e) {
      console.warn(e);
    }
  }, [workspaceId, projectId, transactions]);

  // Cross-instance synchronization (summary top bar <-> bottom milestone cards for this freelancer)
  useEffect(() => {
    const handleSync = (event) => {
      const targetId = workspaceId || 'default';
      const eventWorkspaceId = event.detail?.workspaceId;
      const eventEditorId = event.detail?.editorId;

      if (eventWorkspaceId === targetId && Array.isArray(event.detail?.milestones)) {
        if (!editorId || !eventEditorId || eventEditorId.toString() === editorId.toString()) {
          setMilestones(event.detail.milestones);
        }
      }
    };
    window.addEventListener('collabo_milestones_sync', handleSync);
    return () => window.removeEventListener('collabo_milestones_sync', handleSync);
  }, [workspaceId, editorId]);

  // PIN modal control
  const [pinModalConfig, setPinModalConfig] = useState({
    isOpen: false,
    action: null, // 'fund' | 'release'
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
      if (LEGACY_STORAGE_KEY) {
        localStorage.setItem(LEGACY_STORAGE_KEY, JSON.stringify(updated));
      }
      window.dispatchEvent(
        new CustomEvent('collabo_milestones_sync', {
          detail: {
            workspaceId: workspaceId || 'default',
            editorId: editorId || null,
            milestones: updated,
          },
        })
      );
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
      title: 'Authorize Milestone Escrow Deposit',
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
      title: 'Authorize Milestone Payment Release',
      description: `Enter your 4-digit PIN to release ₹${m.amount.toLocaleString('en-IN')} to ${editorName}.`,
      amount: m.amount,
    });
  };

  // PIN Success handler
  const handlePinSuccess = async (pin) => {
    const { action, milestone } = pinModalConfig;
    if (!milestone) return;

    if (action === 'fund') {
      const ok = await fundMilestone(
        milestone.title,
        milestone.amount,
        pin,
        workspaceId,
        projectId,
        numericBudget,
        milestone.amount
      );
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
        projectId,
        numericBudget,
        milestone.amount
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
            submissionNotes: submissionNotes.trim() || 'Deliverable cut submitted for review.',
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

  // Render Compact Summary Bar (Lesser Height)
  const renderSummaryBar = () => (
    <div className="p-3.5 sm:p-4 rounded-2xl bg-[#0E1322] border border-white/[0.08] shadow-lg flex flex-col md:flex-row items-center justify-between gap-4">
      {/* Left: Escrow Funds Overview */}
      <div className="flex items-center gap-4 sm:gap-6 w-full md:w-auto justify-between md:justify-start">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block font-semibold uppercase tracking-wider">Released</span>
            <div className="text-base sm:text-lg font-bold text-emerald-400 font-mono leading-tight">
              ₹{totalPaid.toLocaleString('en-IN')}
            </div>
          </div>
        </div>

        <div className="h-7 w-px bg-white/[0.08] hidden sm:block" />

        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
            <Lock className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block font-semibold uppercase tracking-wider">Locked in Escrow</span>
            <div className="text-base sm:text-lg font-bold text-purple-300 font-mono leading-tight">
              ₹{totalInEscrow.toLocaleString('en-IN')}
            </div>
          </div>
        </div>

        <div className="h-7 w-px bg-white/[0.08] hidden sm:block" />

        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-slate-300 shrink-0">
            <Coins className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block font-semibold uppercase tracking-wider">Total Budget</span>
            <div className="text-base sm:text-lg font-bold text-white font-mono leading-tight">
              ₹{numericBudget.toLocaleString('en-IN')}
            </div>
          </div>
        </div>
      </div>

      {/* Right: Compact Progress Bar */}
      <div className="w-full md:w-64 lg:w-72 shrink-0">
        <div className="flex items-center justify-between text-xs mb-1.5 font-medium">
          <span className="text-slate-300 text-[11px]">Milestones ({completedCount}/{milestones.length})</span>
          <span className="text-purple-300 font-mono font-bold text-xs">{progressPercent}%</span>
        </div>
        <div className="w-full h-2 rounded-full bg-[#182030] overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-purple-500 via-indigo-500 to-emerald-400 transition-all duration-500 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>
    </div>
  );

  // Render Redesigned Clean Milestone Cards Container
  const renderMilestoneCards = () => (
    <div className="space-y-3">
      {milestones.map((m) => {
        const isPending = m.status === 'pending';
        const isFunded = m.status === 'funded';
        const isSubmitted = m.status === 'submitted';
        const isApproved = m.status === 'approved';

        return (
          <div
            key={m.id}
            className={`p-4 sm:p-4.5 rounded-2xl border transition-all ${
              isApproved
                ? 'bg-[#0E1524]/60 border-emerald-500/25 hover:border-emerald-500/40'
                : isSubmitted
                ? 'bg-[#141A2E]/80 border-purple-500/35 ring-1 ring-purple-500/20 shadow-md shadow-purple-950/20'
                : isFunded
                ? 'bg-[#101626]/70 border-indigo-500/25 hover:border-indigo-500/40'
                : 'bg-[#0B0E17]/50 border-white/[0.05] hover:border-white/[0.1]'
            }`}
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3.5">
              {/* Milestone Left: Step pill, Title, Clean single status badge, description */}
              <div className="flex items-start gap-3 min-w-0 flex-1">
                <div
                  className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 font-bold text-xs ${
                    isApproved
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : isSubmitted
                      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                      : isFunded
                      ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                      : 'bg-white/[0.05] text-slate-400 border border-white/10'
                  }`}
                >
                  {isApproved ? <CheckCircle2 className="w-4 h-4" /> : m.index}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h4 className="text-sm font-bold text-white tracking-tight">
                      {m.title}
                    </h4>

                    {/* Single Clean Status Badge */}
                    {isApproved && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                        Approved
                      </span>
                    )}
                    {isSubmitted && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                        <Clock className="w-3 h-3" /> In Review
                      </span>
                    )}
                    {isFunded && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                        <Lock className="w-3 h-3" /> Funded in Escrow
                      </span>
                    )}
                    {isPending && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-800 text-slate-400 border border-white/[0.06]">
                        Pending Funding
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    {m.description}
                  </p>

                  {/* Clean Deliverable Link (only when submitted or approved with actual link) */}
                  {m.submittedUrl && (
                    <div className="mt-2.5 flex items-center gap-3 flex-wrap">
                      <a
                        href={m.submittedUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 border border-purple-500/30 transition-colors"
                      >
                        <Play className="w-3 h-3 fill-purple-300" />
                        <span>View Deliverable Cut</span>
                        <ExternalLink className="w-3 h-3 opacity-60" />
                      </a>
                      {m.submissionNotes && (
                        <span className="text-xs text-slate-400 italic truncate max-w-sm">
                          "{m.submissionNotes}"
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Milestone Right: Clear Amount & Single Action Button */}
              <div className="flex items-center justify-between md:justify-end gap-3.5 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-white/[0.04]">
                <div className="text-right">
                  <span className="text-base font-extrabold text-white font-mono block">
                    ₹{m.amount.toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="flex items-center">
                  {isCreator ? (
                    <>
                      {isPending && (
                        <button
                          type="button"
                          onClick={() => handleInitiateFund(m)}
                          className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-sm cursor-pointer flex items-center gap-1.5 transition-transform active:scale-95"
                        >
                          <Lock className="w-3.5 h-3.5" />
                          <span>Fund Escrow</span>
                        </button>
                      )}
                      {isFunded && (
                        <span className="text-xs text-slate-400 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                          <Clock className="w-3 h-3 text-indigo-400" />
                          Awaiting cut
                        </span>
                      )}
                      {isSubmitted && (
                        <button
                          type="button"
                          onClick={() => handleInitiateRelease(m)}
                          className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-md shadow-emerald-950/40 cursor-pointer flex items-center gap-1.5 transition-transform active:scale-95"
                        >
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>Release Funds</span>
                        </button>
                      )}
                      {isApproved && (
                        <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Released
                        </span>
                      )}
                    </>
                  ) : (
                    <>
                      {isFunded && (
                        <button
                          type="button"
                          onClick={() => setActiveSubmittingMilestone(m)}
                          className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-500 hover:to-sky-500 text-white shadow-sm cursor-pointer flex items-center gap-1.5"
                        >
                          <FileVideo className="w-3.5 h-3.5" />
                          <span>Submit Cut</span>
                        </button>
                      )}
                      {isSubmitted && (
                        <span className="text-xs text-amber-300 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20">
                          <Clock className="w-3 h-3" />
                          In Review
                        </span>
                      )}
                      {isApproved && (
                        <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Paid
                        </span>
                      )}
                      {isPending && (
                        <span className="text-xs text-slate-500 px-2.5 py-1">
                          Awaiting funding
                        </span>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {/* Security PIN Authorization Modal */}
      <SecurityPinModal
        isOpen={pinModalConfig.isOpen}
        onClose={() => setPinModalConfig({ isOpen: false, action: null, milestone: null })}
        onSuccess={handlePinSuccess}
        actionTitle={pinModalConfig.title}
        actionDescription={pinModalConfig.description}
        amount={pinModalConfig.amount}
      />

      {/* Editor Submit Milestone Cut Modal */}
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
                  className="px-3 py-1.5 rounded-xl text-slate-400 hover:text-white bg-white/5 cursor-pointer"
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

  if (mode === 'summary') {
    return renderSummaryBar();
  }

  if (mode === 'milestones') {
    return renderMilestoneCards();
  }

  return (
    <div className="space-y-4">
      {renderSummaryBar()}
      {renderMilestoneCards()}
    </div>
  );
};

export default MilestoneEscrowPipeline;
