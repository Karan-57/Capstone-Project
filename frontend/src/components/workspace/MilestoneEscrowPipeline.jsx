import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
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
  ChevronDown,
  ChevronUp,
  RotateCcw,
  AlertCircle,
  History,
  X,
} from 'lucide-react';
import { useWallet } from '../../context/WalletContext';
import { useAuth } from '../../context/AuthContext';
import { useAlert } from '../../context/AlertContext';
import SecurityPinModal from '../wallet/SecurityPinModal';
import { generateMilestonesForRole } from '../../constants/roles.constants';
import milestoneService from '../../services/milestoneService';
import ModalPortal from '../common/ModalPortal';

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
  const { fundMilestone, releaseMilestone, refundMilestoneEscrow, transactions = [] } = useWallet();
  const { currentUser } = useAuth();
  const { showAlert } = useAlert();
  const [searchParams] = useSearchParams();
  const urlMilestoneId = searchParams.get('milestoneId');

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
  const activePinActionRef = useRef(null);
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

  // Accordion open/collapse states for delivery lists (per milestone ID)
  const [expandedMilestones, setExpandedMilestones] = useState({});

  const toggleExpandMilestone = (mId) => {
    setExpandedMilestones((prev) => ({
      ...prev,
      [mId]: !prev[mId],
    }));
  };

  // Creator revision request modal
  const [revisionModalMilestone, setRevisionModalMilestone] = useState(null);
  const [revisionTitle, setRevisionTitle] = useState('Revision Requested');
  const [revisionDescription, setRevisionDescription] = useState('');
  const [isSubmittingRevision, setIsSubmittingRevision] = useState(false);

  // View revision request details modal (for both Freelancer & Creator)
  const [viewingRevisionModal, setViewingRevisionModal] = useState(null); // { milestone, delivery, versionNum }

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

    activePinActionRef.current = { action: 'fund', milestone: m };
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
    activePinActionRef.current = { action: 'release', milestone: m };
    setPinModalConfig({
      isOpen: true,
      action: 'release',
      milestone: m,
      title: 'Authorize Milestone Payment Release',
      description: `Enter your 4-digit PIN to release ₹${m.amount.toLocaleString('en-IN')} to ${editorName}.`,
      amount: m.amount,
    });
  };

  // Open PIN modal for refunding escrow to wallet (0 deliveries)
  const handleInitiateRefund = (m) => {
    if (isProcessingPin) return;
    if (m.deliveries && m.deliveries.length > 0) {
      showAlert('Cannot recall escrow: Freelancer has already made deliverable submissions.', 'warning');
      return;
    }
    activePinActionRef.current = { action: 'refund', milestone: m };
    setPinModalConfig({
      isOpen: true,
      action: 'refund',
      milestone: m,
      title: 'Recall Escrow to Wallet',
      description: `Return ₹${m.amount.toLocaleString('en-IN')} from escrow for "${m.title}" back to your available wallet balance.`,
      amount: m.amount,
    });
  };

  // PIN Success handler (Instant UI update backed by MongoDB Milestone model)
  const handlePinSuccess = async (pin) => {
    const action = pinModalConfig.action || activePinActionRef.current?.action;
    const milestone = pinModalConfig.milestone || activePinActionRef.current?.milestone;
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
      } else if (action === 'refund') {
        const ok = await refundMilestoneEscrow({
          milestoneTitle: milestone.title,
          amount: milestone.amount,
          pin,
          workspaceId,
          projectId,
          hiringId,
          milestoneId: milestone._id || milestone.id,
          milestoneIndex: milestone.index,
        });
        if (ok) {
          // Optimistically reset UI to pending immediately
          setMilestones((prev) =>
            prev.map((item) =>
              item.index === milestone.index || item.id === milestone.id
                ? { ...item, status: 'pending' }
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
        submissionNotes: submissionNotes.trim() || '',
      });

      showAlert(res?.message || 'Deliverable cut submitted successfully! ✓', 'success');

      // Optimistic update
      setMilestones((prev) =>
        prev.map((item) =>
          item.index === activeSubmittingMilestone.index || item.id === activeSubmittingMilestone.id
            ? {
                ...item,
                submittedUrl: submissionUrl.trim(),
                submissionNotes: submissionNotes.trim() || '',
              }
            : item
        )
      );

      setActiveSubmittingMilestone(null);
      setSubmissionUrl('');
      setSubmissionNotes('');

      // Auto expand to show the newly submitted iteration
      setExpandedMilestones((prev) => ({
        ...prev,
        [targetId]: true,
      }));

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

  // Creator submit revision request
  const handleRequestRevision = async (e) => {
    e.preventDefault();
    if (!revisionModalMilestone || !revisionDescription.trim() || isSubmittingRevision) return;

    setIsSubmittingRevision(true);
    try {
      const targetId = revisionModalMilestone._id || revisionModalMilestone.id;
      const res = await milestoneService.requestMilestoneRevision(targetId, {
        title: revisionTitle.trim() || 'Revision Requested',
        description: revisionDescription.trim(),
      });

      showAlert(res?.message || 'Revision requested successfully! Freelancer notified.', 'success');

      setRevisionModalMilestone(null);
      setRevisionTitle('Revision Requested');
      setRevisionDescription('');

      // Auto expand to display revision notes
      setExpandedMilestones((prev) => ({
        ...prev,
        [targetId]: true,
      }));

      window.dispatchEvent(
        new CustomEvent('collabo_milestones_sync', {
          detail: { workspaceId, hiringId },
        })
      );
      await fetchAuthoritativeMilestones();
    } catch (err) {
      showAlert(err.response?.data?.message || 'Failed to request revision', 'error');
    } finally {
      setIsSubmittingRevision(false);
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

        const deliveriesList = Array.isArray(m.deliveries) && m.deliveries.length > 0
          ? m.deliveries
          : hasSubmission
          ? [
              {
                version: 1,
                submittedUrl: m.submittedUrl,
                notes: m.submissionNotes,
                submittedAt: m.submittedAt,
                status: 'pending_review',
              },
            ]
          : [];

        const latestDelivery = deliveriesList.length > 0 ? deliveriesList[deliveriesList.length - 1] : null;
        const isRevisionRequested = latestDelivery?.status === 'revision_requested';
        const mKey = m._id || m.id;
        const isTargetedMilestone = urlMilestoneId && mKey.toString() === urlMilestoneId.toString();
        const isExpanded =
          expandedMilestones[mKey] !== undefined
            ? Boolean(expandedMilestones[mKey])
            : Boolean(isRevisionRequested || isTargetedMilestone);

        return (
          <div
            key={mKey}
            className={`p-4 sm:p-4.5 rounded-2xl border-2 transition-all ${
              isCompleted
                ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-600/40'
                : isRevisionRequested
                ? 'bg-amber-50/60 dark:bg-amber-950/20 border-amber-500/50 shadow-[2px_2px_0_#d97706]'
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
                      : isRevisionRequested
                      ? 'bg-amber-300 text-amber-950'
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
                    {isRevisionRequested && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 border border-amber-600/40">
                        <RotateCcw className="w-3 h-3" /> Revision Requested
                      </span>
                    )}
                    {isFunded && hasSubmission && !isRevisionRequested && (
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

                  {/* Clean Deliverable / Iteration Quick Bar */}
                  {hasSubmission && (
                    <div className="mt-2.5 flex items-center gap-2.5 flex-wrap">
                      <a
                        href={m.submittedUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono font-bold bg-[#FFEBAA] hover:bg-[#FFEBAA]/80 text-[#261615] border border-[#382322] shadow-[1px_1px_0_#382322] transition-colors"
                      >
                        <Play className="w-3 h-3 fill-[#261615]" />
                        <span>Delivery {deliveriesList.length > 1 ? `v${deliveriesList.length}` : ''}</span>
                        <ExternalLink className="w-3 h-3 opacity-60" />
                      </a>

                      {/* Dropdown toggle arrow to view all deliveries & revisions */}
                      <button
                        type="button"
                        onClick={() => toggleExpandMilestone(mKey)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono font-semibold bg-white dark:bg-[#1A1110] hover:bg-[#FAF0E6] dark:hover:bg-[#201413] text-[#261615] dark:text-[#FDEBDE] border border-[#382322]/30 shadow-[1px_1px_0_#382322]/20 cursor-pointer transition-all"
                      >
                        <History className="w-3.5 h-3.5 text-[#5C3A38] dark:text-[#D4B8A8]" />
                        <span>{deliveriesList.length} {deliveriesList.length === 1 ? 'Delivery' : 'Deliveries'}</span>
                        {isExpanded ? (
                          <ChevronUp className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5" />
                        )}
                      </button>

                      {m.submissionNotes && m.submissionNotes !== 'Deliverable cut submitted for creator review.' && (
                        <span className="text-xs text-[#5C3A38] dark:text-[#D4B8A8] italic truncate max-w-sm">
                          "{m.submissionNotes}"
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Milestone Right: Clear Amount & Single Action Button */}
              <div className="flex flex-wrap sm:flex-nowrap items-center justify-between md:justify-end gap-2.5 sm:gap-3.5 pt-2 md:pt-0 border-t md:border-t-0 border-[#382322]/10 dark:border-[#FDEBDE]/10">
                <div className="text-right">
                  <span className="text-base font-black text-[#261615] dark:text-[#FDEBDE] font-mono block">
                    ₹{m.amount.toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="flex items-center gap-2">
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
                        <div className="flex flex-wrap items-center gap-2 justify-end">
                          <span className="text-xs font-mono text-[#5C3A38] dark:text-[#D4B8A8] flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#FAF0E6] dark:bg-[#19100F] border border-[#382322]/20 whitespace-nowrap">
                            <Clock className="w-3 h-3 text-[#5C3A38] dark:text-[#FFEBAA]" />
                            Awaiting cut
                          </span>
                          <button
                            type="button"
                            disabled={isProcessingPin}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleInitiateRefund(m);
                            }}
                            className="px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-mono font-bold bg-white dark:bg-[#1A1110] hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-700 dark:text-rose-400 border-2 border-rose-600/40 shadow-[2px_2px_0_#be123c] cursor-pointer flex items-center gap-1.5 transition-transform active:scale-95 disabled:opacity-50 whitespace-nowrap"
                            title="Recall escrow deposit back to your wallet (0 cuts delivered)"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Return to Wallet</span>
                          </button>
                        </div>
                      )}
                      {isFunded && hasSubmission && (
                        <div className="flex items-center gap-2">
                          {/* Ask for Revision button (available when not already in revision requested) */}
                          {!isRevisionRequested && (
                            <button
                              type="button"
                              onClick={() => {
                                setRevisionModalMilestone(m);
                                setRevisionTitle(`Revision for ${m.title}`);
                                setRevisionDescription('');
                              }}
                              className="px-3 py-1.5 rounded-xl text-xs font-mono font-bold bg-white dark:bg-[#1A1110] hover:bg-amber-100 dark:hover:bg-amber-950/60 text-amber-900 dark:text-amber-300 border-2 border-amber-600/40 shadow-[2px_2px_0_#d97706] cursor-pointer flex items-center gap-1.5 transition-transform active:scale-95"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              <span>Request Revision</span>
                            </button>
                          )}

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
                        </div>
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
                      {isFunded && hasSubmission && isRevisionRequested && (
                        <button
                          type="button"
                          onClick={() => {
                            setActiveSubmittingMilestone(m);
                            setSubmissionUrl('');
                            setSubmissionNotes('');
                          }}
                          className="px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold bg-amber-400 hover:bg-amber-300 text-amber-950 border-2 border-[#382322] shadow-[2px_2px_0_#382322] cursor-pointer flex items-center gap-1.5 transition-transform active:scale-95"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Submit Revision</span>
                        </button>
                      )}
                      {isFunded && hasSubmission && !isRevisionRequested && (
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

            {/* Accordion Expandable Deliveries & Revisions Drawer */}
            {isExpanded && deliveriesList.length > 0 && (
              <div className="mt-4 pt-3.5 border-t border-[#382322]/15 dark:border-[#FDEBDE]/15 space-y-2.5 animate-fadeIn">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#5C3A38] dark:text-[#D4B8A8] flex items-center gap-1.5">
                    <History className="w-3.5 h-3.5" /> Delivery Iterations ({deliveriesList.length})
                  </span>
                  {isRevisionRequested && !isCreator && (
                    <button
                      type="button"
                      onClick={() => {
                        setActiveSubmittingMilestone(m);
                        setSubmissionUrl('');
                        setSubmissionNotes('');
                      }}
                      className="text-xs font-mono font-bold text-amber-700 dark:text-amber-300 hover:underline flex items-center gap-1"
                    >
                      <RotateCcw className="w-3 h-3" /> Submit Revision (v{deliveriesList.length + 1})
                    </button>
                  )}
                </div>

                <div className="space-y-2">
                  {deliveriesList.map((del, dIdx) => {
                    const versionNum = del.version || dIdx + 1;
                    const isLatest = dIdx === deliveriesList.length - 1;
                    const hasRevision = Boolean(del.revisionRequest?.description);

                    return (
                      <div
                        key={del._id || dIdx}
                        className={`p-3 rounded-xl border text-xs ${
                          isLatest && isRevisionRequested
                            ? 'bg-amber-100/40 dark:bg-amber-950/40 border-amber-500/50'
                            : isLatest
                            ? 'bg-white dark:bg-[#1A1110] border-[#382322]/30 dark:border-[#FDEBDE]/20 shadow-[1px_1px_0_#382322]/10'
                            : 'bg-white/60 dark:bg-[#1A1110]/50 border-[#382322]/15 dark:border-[#FDEBDE]/10 opacity-80'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded-md font-mono font-bold text-[10px] bg-[#382322] text-white">
                              v{versionNum}
                            </span>
                            {del.submittedAt && (
                              <span className="text-[11px] font-mono text-[#5C3A38] dark:text-[#D4B8A8]">
                                {new Date(del.submittedAt).toLocaleDateString('en-IN', {
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                            )}
                            {del.status === 'revision_requested' && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-200 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200">
                                Revision Requested
                              </span>
                            )}
                            {del.status === 'approved' && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-200 text-emerald-900">
                                Approved
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            {/* Step 2: Open button with redirect icon */}
                            <a
                              href={del.submittedUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-mono font-bold bg-[#FFEBAA] hover:bg-[#FFEBAA]/80 text-[#261615] border border-[#382322] shadow-[1px_1px_0_#382322] transition-colors"
                            >
                              <span>Open</span>
                              <ExternalLink className="w-3 h-3 opacity-70" />
                            </a>

                            {/* Step 3 & 4: Button to the right of Open */}
                            {isCreator ? (
                              hasRevision ? (
                                <button
                                  type="button"
                                  onClick={() => setViewingRevisionModal({ milestone: m, delivery: del, versionNum })}
                                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-mono font-bold bg-amber-100 hover:bg-amber-200 dark:bg-amber-950/60 text-amber-950 dark:text-amber-200 border border-amber-600/40 shadow-[1px_1px_0_#d97706] cursor-pointer transition-all"
                                >
                                  <RotateCcw className="w-3 h-3 text-amber-700 dark:text-amber-300" />
                                  <span>View Request</span>
                                </button>
                              ) : isLatest && !isCompleted ? (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setRevisionModalMilestone(m);
                                    setRevisionTitle(`Revision for ${m.title} (v${versionNum})`);
                                    setRevisionDescription('');
                                  }}
                                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-mono font-bold bg-white dark:bg-[#1A1110] hover:bg-amber-100 dark:hover:bg-amber-950/60 text-amber-900 dark:text-amber-300 border border-amber-600/50 shadow-[1px_1px_0_#d97706] cursor-pointer transition-all"
                                >
                                  <RotateCcw className="w-3 h-3" />
                                  <span>Request Revision</span>
                                </button>
                              ) : null
                            ) : (
                              hasRevision ? (
                                <button
                                  type="button"
                                  onClick={() => setViewingRevisionModal({ milestone: m, delivery: del, versionNum })}
                                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-mono font-bold bg-amber-300 hover:bg-amber-200 text-amber-950 border border-[#382322] shadow-[1px_1px_0_#382322] cursor-pointer transition-all"
                                >
                                  <RotateCcw className="w-3 h-3" />
                                  <span>View Request</span>
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  disabled
                                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-mono font-semibold bg-gray-100 dark:bg-zinc-800 text-gray-400 dark:text-zinc-500 border border-gray-300 dark:border-zinc-700 cursor-not-allowed opacity-60"
                                  title="No revision requested for this version"
                                >
                                  <RotateCcw className="w-3 h-3 opacity-40" />
                                  <span>View Request</span>
                                </button>
                              )
                            )}
                          </div>
                        </div>

                        {del.notes && del.notes !== 'Deliverable cut submitted for creator review.' && (
                          <div className="mt-1.5 text-xs text-[#5C3A38] dark:text-[#D4B8A8] pl-2 border-l-2 border-[#382322]/20">
                            <span className="font-semibold">Notes:</span> {del.notes}
                          </div>
                        )}

                        {/* Revision request details card if attached */}
                        {hasRevision && (
                          <div className="mt-2.5 p-2.5 rounded-lg bg-amber-100/70 dark:bg-amber-950/70 border border-amber-500/40 text-amber-950 dark:text-amber-200 text-xs">
                            <div className="flex items-center gap-1.5 font-bold mb-1">
                              <AlertCircle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                              <span>{del.revisionRequest.title || 'Creator Revision Feedback'}:</span>
                            </div>
                            <p className="whitespace-pre-line text-[11px] leading-relaxed">
                              {del.revisionRequest.description}
                            </p>
                            {del.revisionRequest.requestedAt && (
                              <span className="block mt-1 text-[10px] opacity-70 font-mono">
                                Requested on {new Date(del.revisionRequest.requestedAt).toLocaleString()}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
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
        <ModalPortal>
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-sm animate-fadeIn overflow-y-auto">
          <div className="relative w-full max-w-md my-auto max-h-[88vh] overflow-y-auto bg-[#FFF7F1] dark:bg-[#201413] p-6 border-2 border-[#382322] dark:border-[#FDEBDE]/30 rounded-2xl shadow-[6px_6px_0_#382322] text-[#261615] dark:text-[#FDEBDE]">
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
                      <span>Submit Cut</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
        </ModalPortal>
      )}
      {/* Creator Ask for Revision Modal */}
      {revisionModalMilestone && (
        <ModalPortal>
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-sm animate-fadeIn overflow-y-auto">
          <div className="relative w-full max-w-md my-auto max-h-[88vh] overflow-y-auto bg-[#FFF7F1] dark:bg-[#201413] p-6 border-2 border-[#382322] dark:border-[#FDEBDE]/30 rounded-2xl shadow-[6px_6px_0_#382322] text-[#261615] dark:text-[#FDEBDE]">
            <div className="flex items-center gap-2 mb-1">
              <RotateCcw className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              <h4 className="text-base font-black font-serif text-[#261615] dark:text-[#FDEBDE]">
                Request Revision
              </h4>
            </div>
            <p className="text-xs text-[#5C3A38] dark:text-[#D4B8A8] mb-4">
              Describe the changes you want for <span className="font-bold">{revisionModalMilestone.title}</span>.
            </p>

            <form onSubmit={handleRequestRevision} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[#261615] dark:text-[#FDEBDE] font-mono font-bold mb-1">
                  Revision Subject / Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Make the video shorter & adjust pacing"
                  value={revisionTitle}
                  onChange={(e) => setRevisionTitle(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-[#1A1110] text-[#261615] dark:text-[#FDEBDE] border-2 border-[#382322] dark:border-[#FDEBDE]/30 focus:outline-none focus:ring-2 focus:ring-[#FFEBAA] font-mono"
                />
              </div>

              <div>
                <label className="block text-[#261615] dark:text-[#FDEBDE] font-mono font-bold mb-1">
                  What changes do you want? <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Describe clearly what changes you want the freelancer to make (e.g. make the video shorter, remove the second scene, fix background music)..."
                  value={revisionDescription}
                  onChange={(e) => setRevisionDescription(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-[#1A1110] text-[#261615] dark:text-[#FDEBDE] border-2 border-[#382322] dark:border-[#FDEBDE]/30 focus:outline-none focus:ring-2 focus:ring-[#FFEBAA] resize-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  disabled={isSubmittingRevision}
                  onClick={() => setRevisionModalMilestone(null)}
                  className="px-3 py-1.5 rounded-xl text-xs font-mono font-bold text-[#5C3A38] dark:text-[#D4B8A8] hover:text-[#261615] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingRevision}
                  className="px-4 py-2 rounded-xl font-mono font-bold text-xs text-amber-950 bg-amber-400 hover:bg-amber-300 border-2 border-[#382322] shadow-[2px_2px_0_#382322] transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isSubmittingRevision ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Sending Request...</span>
                    </>
                  ) : (
                    <>
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Request Revision</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
        </ModalPortal>
      )}

      {/* View Revision Request Modal (for Freelancer & Creator) */}
      {viewingRevisionModal && (
        <ModalPortal>
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-sm animate-fadeIn overflow-y-auto">
          <div className="relative w-full max-w-lg my-auto max-h-[88vh] overflow-y-auto bg-[#FFF7F1] dark:bg-[#201413] p-6 border-2 border-[#382322] dark:border-[#FDEBDE]/30 rounded-2xl shadow-[6px_6px_0_#382322] text-[#261615] dark:text-[#FDEBDE]">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-3 mb-4 pb-3 border-b-2 border-[#382322]/10 dark:border-[#FDEBDE]/10">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-400 border-2 border-[#382322] flex items-center justify-center text-amber-950 shrink-0 shadow-[2px_2px_0_#382322]">
                  <RotateCcw className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-black font-serif text-[#261615] dark:text-[#FDEBDE] leading-tight">
                    Revision Request (v{viewingRevisionModal.versionNum})
                  </h4>
                  <span className="text-[11px] font-mono text-[#5C3A38] dark:text-[#D4B8A8]">
                    {viewingRevisionModal.milestone?.title}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setViewingRevisionModal(null)}
                className="p-1 rounded-lg hover:bg-[#382322]/10 dark:hover:bg-[#FDEBDE]/10 text-[#5C3A38] dark:text-[#D4B8A8] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Revision Content */}
            <div className="space-y-3.5 text-xs">
              {viewingRevisionModal.delivery?.revisionRequest?.title && (
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#5C3A38] dark:text-[#D4B8A8] block mb-1">
                    Subject
                  </span>
                  <div className="p-2.5 rounded-xl bg-white dark:bg-[#1A1110] border border-[#382322]/20 font-bold text-sm text-[#261615] dark:text-[#FDEBDE]">
                    {viewingRevisionModal.delivery.revisionRequest.title}
                  </div>
                </div>
              )}

              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#5C3A38] dark:text-[#D4B8A8] block mb-1">
                  Requested Changes & Feedback
                </span>
                <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border-2 border-amber-500/40 text-[#261615] dark:text-[#FDEBDE] whitespace-pre-line text-xs leading-relaxed font-sans shadow-inner">
                  {viewingRevisionModal.delivery?.revisionRequest?.description || 'No detailed feedback provided.'}
                </div>
              </div>

              {viewingRevisionModal.delivery?.revisionRequest?.requestedAt && (
                <div className="text-[10px] font-mono text-[#5C3A38] dark:text-[#D4B8A8] text-right">
                  Requested on {new Date(viewingRevisionModal.delivery.revisionRequest.requestedAt).toLocaleString()}
                </div>
              )}

              {/* Modal Action Buttons */}
              <div className="pt-3 border-t border-[#382322]/10 dark:border-[#FDEBDE]/10 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setViewingRevisionModal(null)}
                  className="px-4 py-2 rounded-xl text-xs font-mono font-bold text-[#5C3A38] dark:text-[#D4B8A8] hover:text-[#261615] dark:hover:text-[#FDEBDE] cursor-pointer"
                >
                  Close
                </button>

                {!isCreator && (
                  <button
                    type="button"
                    onClick={() => {
                      const targetM = viewingRevisionModal.milestone;
                      setViewingRevisionModal(null);
                      setActiveSubmittingMilestone(targetM);
                      setSubmissionUrl('');
                      setSubmissionNotes('');
                    }}
                    className="px-4 py-2 rounded-xl font-mono font-bold text-xs text-amber-950 bg-amber-400 hover:bg-amber-300 border-2 border-[#382322] shadow-[2px_2px_0_#382322] transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                  >
                    <FileVideo className="w-3.5 h-3.5" />
                    <span>Deliver v{viewingRevisionModal.versionNum + 1}</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
        </ModalPortal>
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
