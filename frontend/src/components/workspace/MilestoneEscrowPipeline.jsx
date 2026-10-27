import React, { useState, useEffect, useCallback } from 'react';
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
  Loader2,
} from 'lucide-react';
import { useWallet } from '../../context/WalletContext';
import { useAuth } from '../../context/AuthContext';
import { useAlert } from '../../context/AlertContext';
import SecurityPinModal from '../wallet/SecurityPinModal';
import { generateMilestonesForRole } from '../../constants/roles.constants';
import milestoneService from '../../services/milestoneService';

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
  hiringId = null,
}) => {
  const { fundMilestone, releaseMilestone, transactions = [] } = useWallet();
  const { currentUser } = useAuth();
  const { showAlert } = useAlert();

  const [isProcessingPin, setIsProcessingPin] = useState(false);
  const [loadingMilestones, setLoadingMilestones] = useState(false);

  // Convert raw total budget into number (uses roleBudget if provided)
  const numericBudget =
    typeof (roleBudget || totalBudget) === 'number'
      ? (roleBudget || totalBudget)
      : parseInt(String(roleBudget || totalBudget).replace(/[^0-9]/g, ''), 10) || 10000;

  // Split budget into 3 standard milestones: 30%, 40%, 30%
  const m1Amount = Math.round(numericBudget * 0.3);
  const m2Amount = Math.round(numericBudget * 0.4);
  const m3Amount = numericBudget - m1Amount - m2Amount;

  // Build fallback standard list
  const getDefaultMilestones = () => {
    if (Array.isArray(initialMilestones) && initialMilestones.length > 0) {
      return initialMilestones.map((m, idx) => ({
        ...m,
        id: m._id || m.id || `m${idx + 1}`,
        _id: m._id || m.id || `m${idx + 1}`,
        index: m.index || idx + 1,
        amount: Number(m.amount) || Math.round(numericBudget / initialMilestones.length),
        status: m.status || 'pending',
        submittedUrl: m.submittedUrl && !m.submittedUrl.includes('demo-') ? m.submittedUrl : '',
        submissionNotes: m.submissionNotes && !m.submittedUrl?.includes('demo-') ? m.submissionNotes : '',
      }));
    }
    if (roleId || roleTitle) {
      const generated = generateMilestonesForRole(roleId, numericBudget, null, roleTitle);
      return generated.map((m, idx) => ({
        ...m,
        id: `m${idx + 1}`,
        _id: `m${idx + 1}`,
        status: 'pending',
        submittedUrl: '',
        submissionNotes: '',
      }));
    }
    return [
      {
        id: 'm1',
        _id: 'm1',
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
        _id: 'm2',
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
        _id: 'm3',
        index: 3,
        title: 'Milestone 3: 4K Master Export & Short Clips',
        description: 'High-res master deliverable, final captions, and 2 vertical shorts.',
        amount: m3Amount,
        status: 'pending',
        submittedUrl: '',
        submissionNotes: '',
      },
    ];
  };

  const [milestones, setMilestones] = useState(getDefaultMilestones);

  // Authoritative fetch from MongoDB Milestone model
  const fetchAuthoritativeMilestones = useCallback(async () => {
    if (!workspaceId && !projectId && !hiringId) return;
    try {
      setLoadingMilestones(true);
      const serverMilestones = await milestoneService.getMilestones({
        workspaceId,
        projectId,
        hiringId,
        freelancerId: editorId,
      });

      if (Array.isArray(serverMilestones) && serverMilestones.length > 0) {
        const normalized = serverMilestones.map((m, idx) => ({
          ...m,
          id: m._id || m.id || `m${idx + 1}`,
          _id: m._id || m.id,
          index: m.index || idx + 1,
          amount: Number(m.amount) || 0,
          status: m.status || 'pending',
          submittedUrl: m.submittedUrl || '',
          submissionNotes: m.submissionNotes || '',
        }));
        setMilestones(normalized);
      }
    } catch (err) {
      console.warn('[MilestoneEscrowPipeline] Load milestones notice:', err.message);
    } finally {
      setLoadingMilestones(false);
    }
  }, [workspaceId, projectId, hiringId, editorId]);

  useEffect(() => {
    fetchAuthoritativeMilestones();
  }, [fetchAuthoritativeMilestones, transactions]);

  // Cross-instance synchronization (summary top bar <-> bottom milestone cards)
  useEffect(() => {
    const handleSync = (event) => {
      const eventWorkspaceId = event.detail?.workspaceId;
      if (!workspaceId || eventWorkspaceId === workspaceId) {
        fetchAuthoritativeMilestones();
      }
    };
    window.addEventListener('collabo_milestones_sync', handleSync);
    return () => window.removeEventListener('collabo_milestones_sync', handleSync);
  }, [workspaceId, fetchAuthoritativeMilestones]);

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
  const [isSubmittingCut, setIsSubmittingCut] = useState(false);

  // Open PIN modal for funding
  const handleInitiateFund = (m) => {
    if (isProcessingPin) return;

    // Sequential Check: Milestone[n-1] must be completed
    if (m.index > 1) {
      const prev = milestones.find((x) => x.index === m.index - 1);
      if (!prev || (prev.status !== 'completed' && prev.status !== 'approved')) {
        showAlert(
          `Milestone ${m.index - 1} must be completed and released before Milestone ${m.index} can be funded in escrow.`,
          'warning'
        );
        return;
      }
    }

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
    if (isProcessingPin) return;
    setPinModalConfig({
      isOpen: true,
      action: 'release',
      milestone: m,
      title: 'Authorize Milestone Payment Release',
      description: `Enter your 4-digit PIN to release ₹${m.amount.toLocaleString('en-IN')} to ${editorName}.`,
      amount: m.amount,
    });
  };

  // PIN Success handler (Instant UI update backed by MongoDB Milestone model)
  const handlePinSuccess = async (pin) => {
    const { action, milestone } = pinModalConfig;
    if (!milestone || isProcessingPin) return;

    setIsProcessingPin(true);
    try {
      if (action === 'fund') {
        const ok = await fundMilestone(
          milestone.title,
          milestone.amount,
          pin,
          workspaceId,
          projectId,
          numericBudget,
          milestone.amount,
          hiringId,
          milestone._id || milestone.id,
          milestone.index
        );
        if (ok) {
          // Optimistically update UI to funded immediately
          setMilestones((prev) =>
            prev.map((item) =>
              item.index === milestone.index || item.id === milestone.id
                ? { ...item, status: 'funded' }
                : item
            )
          );
          // Broadcast sync event so summary bars and collaborator screens refresh
          window.dispatchEvent(
            new CustomEvent('collabo_milestones_sync', {
              detail: { workspaceId, hiringId },
            })
          );
          // Re-fetch authoritative document from MongoDB
          await fetchAuthoritativeMilestones();
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
          milestone.amount,
          hiringId,
          milestone._id || milestone.id,
          milestone.index
        );
        if (ok) {
          // Optimistically update UI to completed immediately
          setMilestones((prev) =>
            prev.map((item) =>
              item.index === milestone.index || item.id === milestone.id
                ? { ...item, status: 'completed' }
                : item
            )
          );
          window.dispatchEvent(
            new CustomEvent('collabo_milestones_sync', {
              detail: { workspaceId, hiringId },
            })
          );
          await fetchAuthoritativeMilestones();
        }
      }
    } finally {
      setIsProcessingPin(false);
    }
  };

  // Editor submit cut via MongoDB Milestone model
  const handleSubmitCut = async (e) => {
    e.preventDefault();
    if (!activeSubmittingMilestone || !submissionUrl.trim() || isSubmittingCut) return;

    setIsSubmittingCut(true);
    try {
      const targetId = activeSubmittingMilestone._id || activeSubmittingMilestone.id;
      const res = await milestoneService.submitMilestoneDeliverable(targetId, {
        submittedUrl: submissionUrl.trim(),
        submissionNotes: submissionNotes.trim() || 'Deliverable cut submitted for creator review.',
      });

      showAlert(res?.message || 'Deliverable cut submitted for creator review! ✓', 'success');

      // Optimistic update
      setMilestones((prev) =>
        prev.map((item) =>
          item.index === activeSubmittingMilestone.index || item.id === activeSubmittingMilestone.id
            ? {
                ...item,
                submittedUrl: submissionUrl.trim(),
                submissionNotes: submissionNotes.trim() || 'Deliverable cut submitted for creator review.',
              }
            : item
        )
      );

      setActiveSubmittingMilestone(null);
      setSubmissionUrl('');
      setSubmissionNotes('');

      window.dispatchEvent(
        new CustomEvent('collabo_milestones_sync', {
          detail: { workspaceId, hiringId },
        })
      );
      await fetchAuthoritativeMilestones();
    } catch (err) {
      showAlert(err.response?.data?.message || 'Failed to submit deliverable cut', 'error');
    } finally {
      setIsSubmittingCut(false);
    }
  };

  // Escrow Calculations
  const totalPaid = milestones
    .filter((m) => m.status === 'completed' || m.status === 'approved')
    .reduce((sum, m) => sum + m.amount, 0);

  const totalInEscrow = milestones
    .filter((m) => m.status === 'funded')
    .reduce((sum, m) => sum + m.amount, 0);

  const completedCount = milestones.filter(
    (m) => m.status === 'completed' || m.status === 'approved'
  ).length;
  const progressPercent =
    milestones.length > 0 ? Math.round((completedCount / milestones.length) * 100) : 0;

  // Render Compact Summary Bar
  const renderSummaryBar = () => (
    <div className="p-4 sm:p-5 rounded-2xl bg-[#FFF7F1] dark:bg-[#201413] border-2 border-[#382322] dark:border-[#FDEBDE]/30 shadow-[3px_3px_0_#382322] flex flex-col gap-4 text-[#261615] dark:text-[#FDEBDE]">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 w-full">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-600/30 flex items-center justify-center text-emerald-800 dark:text-emerald-300 shrink-0">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] text-[#5C3A38] dark:text-[#D4B8A8] block font-mono font-bold uppercase tracking-wider">
              Released
            </span>
            <div className="text-base sm:text-lg font-black text-emerald-700 dark:text-emerald-400 font-mono leading-tight">
              ₹{totalPaid.toLocaleString('en-IN')}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#FFEBAA] border border-[#382322] flex items-center justify-center text-[#261615] shrink-0">
            <Lock className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] text-[#5C3A38] dark:text-[#D4B8A8] block font-mono font-bold uppercase tracking-wider">
              Locked in Escrow
            </span>
            <div className="text-base sm:text-lg font-black text-[#261615] dark:text-[#FFEBAA] font-mono leading-tight">
              ₹{totalInEscrow.toLocaleString('en-IN')}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#B1C8EA] border border-[#382322] flex items-center justify-center text-[#261615] shrink-0">
            <Coins className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] text-[#5C3A38] dark:text-[#D4B8A8] block font-mono font-bold uppercase tracking-wider">
              Total Budget
            </span>
            <div className="text-base sm:text-lg font-black text-[#261615] dark:text-[#FDEBDE] font-mono leading-tight">
              ₹{numericBudget.toLocaleString('en-IN')}
            </div>
          </div>
        </div>
      </div>

      <div className="w-full pt-3 border-t-2 border-[#382322]/10 dark:border-[#FDEBDE]/10">
        <div className="flex items-center justify-between text-xs mb-1.5 font-mono font-bold">
          <span className="text-[#5C3A38] dark:text-[#D4B8A8] text-[11px]">
            Milestones ({completedCount}/{milestones.length})
          </span>
          <span className="text-[#261615] dark:text-[#FFEBAA] text-xs">{progressPercent}%</span>
        </div>
        <div className="w-full h-2.5 rounded-full bg-[#FAF0E6] dark:bg-[#19100F] border border-[#382322]/20 overflow-hidden">
          <div
            className="h-full bg-emerald-500 border-r border-[#382322] transition-all duration-500 rounded-full"
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
        const isCompleted = m.status === 'completed' || m.status === 'approved';
        const isFunded = m.status === 'funded';
        const isPending = m.status === 'pending';
        const hasSubmission = Boolean(m.submittedUrl && m.submittedUrl.trim());

        // Sequential Funding Check: Milestone[n-1] MUST be completed!
        const prevMilestone = m.index > 1 ? milestones.find((x) => x.index === m.index - 1) : null;
        const canBeFunded =
          m.index === 1 ||
          (prevMilestone &&
            (prevMilestone.status === 'completed' || prevMilestone.status === 'approved'));

        return (
          <div
            key={m._id || m.id}
            className={`p-4 sm:p-4.5 rounded-2xl border-2 transition-all ${
              isCompleted
                ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-600/40'
                : isFunded && hasSubmission
                ? 'bg-[#FFEBAA]/40 dark:bg-[#2D1C1B] border-[#382322] dark:border-[#FFEBAA] shadow-[2px_2px_0_#382322]'
                : isFunded
                ? 'bg-[#B1C8EA]/20 dark:bg-[#201413] border-[#382322] dark:border-[#B1C8EA]/40'
                : 'bg-white dark:bg-[#1A1110] border-[#382322]/20 dark:border-[#FDEBDE]/20'
            }`}
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3.5">
              {/* Milestone Left: Step pill, Title, Single status badge, description */}
              <div className="flex items-start gap-3 min-w-0 flex-1">
                <div
                  className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 font-mono font-black text-xs border-2 border-[#382322] ${
                    isCompleted
                      ? 'bg-emerald-200 text-emerald-900'
                      : isFunded && hasSubmission
                      ? 'bg-[#FFEBAA] text-[#261615]'
                      : isFunded
                      ? 'bg-[#B1C8EA] text-[#261615]'
                      : 'bg-[#FAF0E6] text-[#5C3A38]'
                  }`}
                >
                  {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : m.index}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h4 className="text-sm font-black font-serif text-[#261615] dark:text-[#FDEBDE] tracking-tight">
                      {m.title}
                    </h4>

                    {/* Single Clean Authoritative Status Badge */}
                    {isCompleted && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-600/30">
                        <CheckCircle2 className="w-3 h-3" /> Completed
                      </span>
                    )}
                    {isFunded && hasSubmission && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-[#FFEBAA] text-[#261615] border border-[#382322]">
                        <Clock className="w-3 h-3" /> In Review
                      </span>
                    )}
                    {isFunded && !hasSubmission && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-[#B1C8EA] text-[#261615] border border-[#382322]">
                        <Lock className="w-3 h-3" /> Funded in Escrow
                      </span>
                    )}
                    {isPending && canBeFunded && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-[#FAF0E6] dark:bg-[#19100F] text-[#5C3A38] dark:text-[#D4B8A8] border border-[#382322]/20">
                        Pending Funding
                      </span>
                    )}
                    {isPending && !canBeFunded && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-[#FAF0E6]/60 dark:bg-[#19100F]/60 text-[#5C3A38]/70 dark:text-[#D4B8A8]/70 border border-dashed border-[#382322]/30">
                        <Lock className="w-3 h-3 opacity-60" /> Locked (Requires M{m.index - 1})
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-[#5C3A38] dark:text-[#D4B8A8] mt-1 leading-relaxed">
                    {m.description}
                  </p>

                  {/* Clean Deliverable Link */}
                  {hasSubmission && (
                    <div className="mt-2.5 flex items-center gap-3 flex-wrap">
                      <a
                        href={m.submittedUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono font-bold bg-[#FFEBAA] hover:bg-[#FFEBAA]/80 text-[#261615] border border-[#382322] shadow-[1px_1px_0_#382322] transition-colors"
                      >
                        <Play className="w-3 h-3 fill-[#261615]" />
                        <span>View Deliverable Cut</span>
                        <ExternalLink className="w-3 h-3 opacity-60" />
                      </a>
                      {m.submissionNotes && (
                        <span className="text-xs text-[#5C3A38] dark:text-[#D4B8A8] italic truncate max-w-sm">
                          "{m.submissionNotes}"
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Milestone Right: Clear Amount & Single Action Button */}
              <div className="flex items-center justify-between md:justify-end gap-3.5 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-[#382322]/10 dark:border-[#FDEBDE]/10">
                <div className="text-right">
                  <span className="text-base font-black text-[#261615] dark:text-[#FDEBDE] font-mono block">
                    ₹{m.amount.toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="flex items-center">
                  {isCreator ? (
                    <>
                      {isPending && canBeFunded && (
                        <button
                          type="button"
                          disabled={isProcessingPin}
                          onClick={() => handleInitiateFund(m)}
                          className="px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold bg-[#FFEBAA] hover:bg-[#FFEBAA]/80 text-[#261615] border-2 border-[#382322] shadow-[2px_2px_0_#382322] cursor-pointer flex items-center gap-1.5 transition-transform active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
                        >
                          {isProcessingPin ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              <span>Processing...</span>
                            </>
                          ) : (
                            <>
                              <Lock className="w-3.5 h-3.5" />
                              <span>Fund Escrow</span>
                            </>
                          )}
                        </button>
                      )}
                      {isPending && !canBeFunded && (
                        <span
                          className="text-xs font-mono text-[#5C3A38]/70 dark:text-[#D4B8A8]/70 px-2.5 py-1 rounded-lg bg-[#FAF0E6]/50 dark:bg-[#19100F]/50 border border-dashed border-[#382322]/20"
                          title={`Milestone ${m.index - 1} must be completed and released first`}
                        >
                          Awaiting M{m.index - 1}
                        </span>
                      )}
                      {isFunded && !hasSubmission && (
                        <span className="text-xs font-mono text-[#5C3A38] dark:text-[#D4B8A8] flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#FAF0E6] dark:bg-[#19100F] border border-[#382322]/20">
                          <Clock className="w-3 h-3 text-[#5C3A38] dark:text-[#FFEBAA]" />
                          Awaiting cut
                        </span>
                      )}
                      {isFunded && hasSubmission && (
                        <button
                          type="button"
                          disabled={isProcessingPin}
                          onClick={() => handleInitiateRelease(m)}
                          className="px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold bg-emerald-600 hover:bg-emerald-500 text-white border-2 border-emerald-900 shadow-[2px_2px_0_#064e3b] cursor-pointer flex items-center gap-1.5 transition-transform active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
                        >
                          {isProcessingPin ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              <span>Releasing...</span>
                            </>
                          ) : (
                            <>
                              <ShieldCheck className="w-3.5 h-3.5" />
                              <span>Release Funds</span>
                            </>
                          )}
                        </button>
                      )}
                      {isCompleted && (
                        <span className="text-xs font-mono font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-600/30">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Released
                        </span>
                      )}
                    </>
                  ) : (
                    <>
                      {isFunded && !hasSubmission && (
                        <button
                          type="button"
                          onClick={() => setActiveSubmittingMilestone(m)}
                          className="px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold bg-[#B1C8EA] hover:bg-[#B1C8EA]/80 text-[#261615] border-2 border-[#382322] shadow-[2px_2px_0_#382322] cursor-pointer flex items-center gap-1.5 transition-transform active:scale-95"
                        >
                          <FileVideo className="w-3.5 h-3.5" />
                          <span>Submit Cut</span>
                        </button>
                      )}
                      {isFunded && hasSubmission && (
                        <span className="text-xs font-mono font-bold text-[#261615] bg-[#FFEBAA] flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-[#382322]">
                          <Clock className="w-3 h-3" />
                          In Review
                        </span>
                      )}
                      {isCompleted && (
                        <span className="text-xs font-mono font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-600/30">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Paid
                        </span>
                      )}
                      {isPending && (
                        <span className="text-xs font-mono text-[#5C3A38] dark:text-[#D4B8A8] px-2.5 py-1">
                          {canBeFunded ? 'Awaiting funding' : `Locked (Pending M${m.index - 1})`}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-md bg-[#FFF7F1] dark:bg-[#201413] p-6 border-2 border-[#382322] dark:border-[#FDEBDE]/30 rounded-2xl shadow-[6px_6px_0_#382322] text-[#261615] dark:text-[#FDEBDE]">
            <h4 className="text-base font-black font-serif text-[#261615] dark:text-[#FDEBDE] mb-1">
              Submit Cut for {activeSubmittingMilestone.title}
            </h4>
            <p className="text-xs text-[#5C3A38] dark:text-[#D4B8A8] mb-4">
              Upload your video cut preview link (Google Drive, Vimeo, Frame.io) for creator review.
            </p>

            <form onSubmit={handleSubmitCut} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[#261615] dark:text-[#FDEBDE] font-mono font-bold mb-1">
                  Video Preview URL <span className="text-rose-500">*</span>
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://drive.google.com/... or Vimeo link"
                  value={submissionUrl}
                  onChange={(e) => setSubmissionUrl(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-[#1A1110] text-[#261615] dark:text-[#FDEBDE] border-2 border-[#382322] dark:border-[#FDEBDE]/30 focus:outline-none focus:ring-2 focus:ring-[#FFEBAA] font-mono"
                />
              </div>

              <div>
                <label className="block text-[#261615] dark:text-[#FDEBDE] font-mono font-bold mb-1">
                  Editor Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Rough cut assembly done with 2 revision passes..."
                  value={submissionNotes}
                  onChange={(e) => setSubmissionNotes(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-[#1A1110] text-[#261615] dark:text-[#FDEBDE] border-2 border-[#382322] dark:border-[#FDEBDE]/30 focus:outline-none focus:ring-2 focus:ring-[#FFEBAA] resize-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  disabled={isSubmittingCut}
                  onClick={() => setActiveSubmittingMilestone(null)}
                  className="px-3 py-1.5 rounded-xl text-xs font-mono font-bold text-[#5C3A38] dark:text-[#D4B8A8] hover:text-[#261615] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingCut}
                  className="px-4 py-2 rounded-xl font-mono font-bold text-xs text-[#261615] bg-[#FFEBAA] hover:bg-[#FFEBAA]/80 border-2 border-[#382322] shadow-[2px_2px_0_#382322] transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isSubmittingCut ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Submit Cut for Review</span>
                    </>
                  )}
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
