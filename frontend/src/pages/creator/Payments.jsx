import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Plus,
  Coins,
  KeyRound,
  ChevronRight,
  ArrowLeft,
  FolderGit2,
  User,
  Calendar,
  ArrowUpRight,
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import SEO from '../../components/common/SEO';
import { useAlert } from '../../context/AlertContext';
import { useAuth } from '../../context/AuthContext';
import { useWallet } from '../../context/WalletContext';
import { projectService } from '../../services/projectService';
import WalletTopUpModal from '../../components/wallet/WalletTopUpModal';
import SecurityPinModal from '../../components/wallet/SecurityPinModal';
import { WithdrawModal } from '../../components/wallet/WithdrawModal';
import MilestoneEscrowPipeline from '../../components/workspace/MilestoneEscrowPipeline';
import { DEFAULT_PFP } from '../../constants/assets';
import { PaymentsSkeleton } from '../../components/common/Skeleton';

export const Payments = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { showAlert } = useAlert();
  const { isAuthenticated, isAuthLoading } = useAuth();
  const {
    walletBalance,
    escrowLocked,
    totalSettledReleases,
    completedMilestonesCount,
    hasTransactionPin,
    transactions = [],
  } = useWallet();

  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);

  // Selected freelancer or role filter within project
  const [selectedFreelancer, setSelectedFreelancer] = useState(null);
  const [selectedRoleHiring, setSelectedRoleHiring] = useState(null);

  // Modals
  const [isTopUpOpen, setIsTopUpOpen] = useState(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);

  // Real-time ledger calculations for settled payouts:
  // Cross-reference ESCROW_RELEASE transactions from the double-entry ledger
  const ledgerReleases = (transactions || []).filter(
    (t) => t.type === 'ESCROW_RELEASE' && (t.status === 'SUCCESS' || !t.status)
  );
  const ledgerTotalSettled = ledgerReleases.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
  const ledgerMilestonesCleared = ledgerReleases.length;

  const effectiveTotalSettled = Math.max(ledgerTotalSettled, Number(totalSettledReleases) || 0);
  const effectiveClearedMilestones = Math.max(ledgerMilestonesCleared, Number(completedMilestonesCount) || 0);

  const loadData = async () => {
    setLoading(true);
    try {
      const allProjects = await projectService.getCreatorProjects();
      setProjects(allProjects || []);

      // If URL param specifies projectId, auto-select it
      const paramProjectId = searchParams.get('projectId');
      const paramFreelancerId = searchParams.get('freelancerId');
      const paramHiringId = searchParams.get('hiringId');

      if (paramProjectId && allProjects.length > 0) {
        const found = allProjects.find((p) => p.id === paramProjectId);
        if (found) {
          setSelectedProject(found);

          if (paramHiringId && Array.isArray(found.hirings)) {
            const hFound = found.hirings.find(h => (h._id || h.id) === paramHiringId);
            if (hFound) {
              setSelectedRoleHiring(hFound);
              if (hFound.hiredFreelancerId) {
                setSelectedFreelancer(hFound.hiredFreelancerId);
              }
            }
          } else if (paramFreelancerId && Array.isArray(found.hirings)) {
            const hFound = found.hirings.find(h => {
              const fid = h.hiredFreelancerId?._id || h.hiredFreelancerId?.id || h.hiredFreelancerId;
              return fid === paramFreelancerId;
            });
            if (hFound) {
              setSelectedRoleHiring(hFound);
              setSelectedFreelancer(hFound.hiredFreelancerId);
            }
          }
        }
      }
    } catch (err) {
      console.error('Failed to load escrow payments and projects:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated || isAuthLoading) return;
    loadData();
  }, [isAuthenticated, isAuthLoading]);

  // Keep selected state in sync with URL parameters
  useEffect(() => {
    const paramProjectId = searchParams.get('projectId');
    const paramFreelancerId = searchParams.get('freelancerId');
    const paramHiringId = searchParams.get('hiringId');

    if (!paramProjectId) {
      setSelectedProject(null);
      setSelectedFreelancer(null);
      setSelectedRoleHiring(null);
      return;
    }

    if (projects.length > 0) {
      const found = projects.find((p) => p.id === paramProjectId);
      if (found) {
        setSelectedProject(found);

        if (paramHiringId && Array.isArray(found.hirings)) {
          const hFound = found.hirings.find(h => (h._id || h.id) === paramHiringId);
          if (hFound) {
            setSelectedRoleHiring(hFound);
            setSelectedFreelancer(hFound.hiredFreelancerId || null);
            return;
          }
        }

        if (paramFreelancerId) {
          if (Array.isArray(found.hirings)) {
            const hFound = found.hirings.find(h => {
              const fid = h.hiredFreelancerId?._id || h.hiredFreelancerId?.id || h.hiredFreelancerId;
              return fid === paramFreelancerId;
            });
            if (hFound) {
              setSelectedRoleHiring(hFound);
              setSelectedFreelancer(hFound.hiredFreelancerId || null);
              return;
            }
          }
          if (found.assignedEditor && (found.assignedEditor.id === paramFreelancerId || found.assignedEditor._id === paramFreelancerId)) {
            setSelectedFreelancer(found.assignedEditor);
            setSelectedRoleHiring(null);
            return;
          }
        }

        // If no member parameter is present, clear member selection to show Level 2 (team members list)
        if (!paramFreelancerId && !paramHiringId) {
          setSelectedFreelancer(null);
          setSelectedRoleHiring(null);
        }
      }
    }
  }, [searchParams, projects]);

  const handleSelectProject = (project) => {
    setSelectedProject(project);
    setSelectedFreelancer(null);
    setSelectedRoleHiring(null);
    setSearchParams({ projectId: project.id });
  };

  const handleSelectMember = (hiring, freelancer) => {
    setSelectedRoleHiring(hiring);
    setSelectedFreelancer(freelancer);
    const newParams = { projectId: selectedProject.id };
    if (freelancer?._id || freelancer?.id) {
      newParams.freelancerId = freelancer._id || freelancer.id;
    }
    if (hiring?._id || hiring?.id) {
      newParams.hiringId = hiring._id || hiring.id;
    }
    setSearchParams(newParams);
  };

  const handleBackToProjectMembers = () => {
    setSelectedFreelancer(null);
    setSelectedRoleHiring(null);
    setSearchParams({ projectId: selectedProject.id });
  };

  const handleBackToAllProjects = () => {
    setSelectedProject(null);
    setSelectedFreelancer(null);
    setSelectedRoleHiring(null);
    setSearchParams({});
  };

  // Determine active target freelancer & budget for pipeline
  const effectiveFreelancerName = selectedFreelancer?.name || selectedRoleHiring?.hiredFreelancerId?.name || selectedProject?.assignedEditor?.name || 'Assigned Freelancer';
  const effectiveFreelancerId = selectedFreelancer?._id || selectedFreelancer?.id || selectedRoleHiring?.hiredFreelancerId?._id || selectedProject?.assignedEditor?.id || 'lead';
  const effectiveRoleTitle = selectedRoleHiring?.roleTitle || (selectedProject?.assignedEditor ? 'Lead Video Editor' : 'Project Role');
  const effectiveBudget = Number(selectedRoleHiring?.budget || selectedProject?.rawBudget || selectedProject?.totalBudget || 0);
  const effectiveTotalProjectBudget = Number(selectedProject?.totalBudget || selectedProject?.rawBudget || 0);

  // Is a specific member selected to display Level 3 (their milestone escrow pipeline)?
  const hasMemberSelected = Boolean(selectedRoleHiring || selectedFreelancer);

  if (loading) {
    return <PaymentsSkeleton />;
  }

  return (
    <div className="space-y-6 pb-12">
      <SEO
        title={
          hasMemberSelected
            ? `Milestone Escrow - ${effectiveFreelancerName} (${effectiveRoleTitle})`
            : selectedProject
            ? `Team Escrow Allocation - ${selectedProject.title}`
            : 'Payments & Escrow Protection'
        }
        description="Multi-stage escrow pipeline with bank-grade security and milestone authorization."
      />

      {/* ─────────────────────────────────────────────────────────────
          ROUTING:
          LEVEL 3: Specific Team Member's Milestones & Escrow
          LEVEL 2: Specific Project's Team Members & Allocated Budgets List
          LEVEL 1: All Projects Escrow Overview
      ───────────────────────────────────────────────────────────── */}
      {selectedProject && hasMemberSelected ? (
        /* ═════════════════════════════════════════════════════════════════
           LEVEL 3: DEDICATED MILESTONE & ESCROW VIEW FOR THIS TEAM MEMBER
        ═════════════════════════════════════════════════════════════════ */
        <div className="space-y-6">
          {/* Header of the page */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <button
                onClick={handleBackToProjectMembers}
                title="Back"
                aria-label="Back"
                className="p-2.5 rounded-xl bg-white dark:bg-[#261817] hover:bg-[#FFEBAA] text-[#261615] dark:text-[#FDEBDE] border-2 border-[#382322] dark:border-[#FDEBDE]/30 shadow-[2px_2px_0_#382322] transition-all cursor-pointer flex items-center justify-center shrink-0"
              >
                <ArrowLeft className="w-4 h-4" />

              </button>

              <div className="min-w-0">
                <h2 className="text-xl font-black font-serif text-[#261615] dark:text-[#FDEBDE] tracking-tight">
                  Multi-Stage Escrow Pipeline
                </h2>
                <p className="text-xs text-[#5C3A38] dark:text-[#D4B8A8] mt-0.5 truncate">
                  {selectedProject.title} • Member: <span className="text-[#261615] dark:text-[#FDEBDE] font-bold">{effectiveFreelancerName}</span> • Role: <span className="text-[#261615] dark:text-[#FFEBAA] font-mono font-semibold">{effectiveRoleTitle}</span> • Allocated Role Budget: <span className="text-emerald-700 dark:text-emerald-400 font-mono font-bold">₹{effectiveBudget.toLocaleString()}</span> (Total Project: <span className="text-[#261615] dark:text-[#FDEBDE] font-mono font-bold">₹{effectiveTotalProjectBudget.toLocaleString()}</span>)
                </p>
              </div>
            </div>

            <button
              onClick={handleBackToAllProjects}
              className="px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold text-[#261615] dark:text-[#FDEBDE] bg-white dark:bg-[#261817] hover:bg-[#FFEBAA] border-2 border-[#382322] dark:border-[#FDEBDE]/30 shadow-[2px_2px_0_#382322] transition-colors cursor-pointer shrink-0 self-start sm:self-auto"
            >
              All Projects
            </button>
          </div>

          {/* Render the full Multi-Stage Escrow Pipeline for this specific freelancer and role */}
          <MilestoneEscrowPipeline
            workspaceId={selectedProject.workspaceId && selectedProject.workspaceId.length === 24 ? selectedProject.workspaceId : null}
            hiringId={selectedRoleHiring?._id || selectedRoleHiring?.id || null}
            totalBudget={effectiveBudget || effectiveTotalProjectBudget}
            projectTotalBudget={effectiveTotalProjectBudget}
            roleBudget={effectiveBudget}
            isCreator={true}
            editorName={effectiveFreelancerName}
            editorId={effectiveFreelancerId !== 'lead' ? effectiveFreelancerId : null}
            projectId={selectedProject.id}
            roleTitle={effectiveRoleTitle}
            roleId={selectedRoleHiring?.roleId || ''}
            initialMilestones={selectedRoleHiring?.milestones || null}
          />
        </div>
      ) : selectedProject ? (
        /* ═════════════════════════════════════════════════════════════════
           LEVEL 2: PROJECT TEAM MEMBERS LIST & ALLOCATED BUDGETS (when projectId is in URL)
        ═════════════════════════════════════════════════════════════════ */
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <button
                onClick={handleBackToAllProjects}
                title="Back"
                aria-label="Back"
                className="p-2.5 rounded-xl bg-white dark:bg-[#261817] hover:bg-[#FFEBAA] text-[#261615] dark:text-[#FDEBDE] border-2 border-[#382322] dark:border-[#FDEBDE]/30 shadow-[2px_2px_0_#382322] transition-all cursor-pointer flex items-center justify-center shrink-0"
              >
                <ArrowLeft className="w-4 h-4" />

              </button>

              <div className="min-w-0">
                <h2 className="text-xl font-black font-serif text-[#261615] dark:text-[#FDEBDE] tracking-tight">
                  {selectedProject.title} — Team Members & Role Budgets
                </h2>
                <p className="text-xs text-[#5C3A38] dark:text-[#D4B8A8] mt-0.5 truncate">
                  Total Project Budget: <span className="text-emerald-700 dark:text-emerald-400 font-mono font-bold">{selectedProject.budget}</span> • Select a team member to manage their milestone escrow deposits & payment releases.
                </p>
              </div>
            </div>

            <button
              onClick={() => navigate(`/creator/create-project?step=2&projectId=${selectedProject.id}`)}
              className="px-3.5 py-2 rounded-xl bg-[#FFEBAA] hover:bg-[#FFEBAA]/80 text-[#261615] border-2 border-[#382322] shadow-[2px_2px_0_#382322] text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Hire New Role</span>
            </button>
          </div>

          {/* Team Members & Hirings List Container */}
          <div className="glass-card brutal-card p-6 border-2 border-[#382322] dark:border-[#FDEBDE]/30 bg-[#FFF7F1] dark:bg-[#201413] shadow-[4px_4px_0_#382322] space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-black font-serif text-[#261615] dark:text-[#FDEBDE] flex items-center gap-2">
                  <User className="w-4 h-4 text-[#382322] dark:text-[#FFEBAA]" />
                  Assigned Team Members & Roles ({
                    (Array.isArray(selectedProject.hirings) ? selectedProject.hirings.length : 0) +
                    (selectedProject.assignedEditor && (!Array.isArray(selectedProject.hirings) || !selectedProject.hirings.some(h => (h.hiredFreelancerId?._id || h.hiredFreelancerId)?.toString() === (selectedProject.assignedEditor.id || selectedProject.assignedEditor._id)?.toString())) ? 1 : 0)
                  })
                </h3>
                <p className="text-xs text-[#5C3A38] dark:text-[#D4B8A8] mt-0.5">
                  Click on any team member to open their dedicated milestone escrow pipeline.
                </p>
              </div>
            </div>

            {(() => {
              const hiringsList = Array.isArray(selectedProject.hirings) ? selectedProject.hirings : [];
              const assignedEditor = selectedProject.assignedEditor;
              const isEditorInHirings = assignedEditor && hiringsList.some((h) => {
                const fid = h.hiredFreelancerId?._id || h.hiredFreelancerId?.id || h.hiredFreelancerId;
                return fid && fid.toString() === (assignedEditor.id || assignedEditor._id || '').toString();
              });

              const combinedMembers = [
                ...hiringsList.map((hiring, hIdx) => ({
                  key: hiring._id || `hiring_${hIdx}`,
                  hiring,
                  freelancer: hiring.hiredFreelancerId,
                  hasHired: Boolean(hiring.hiredFreelancerId),
                  budget: Number(hiring.budget || 0),
                  title: hiring.roleTitle,
                  description: hiring.description || `Responsible for ${hiring.roleTitle} deliverables.`,
                  deadline: hiring.firstDeadline,
                  isLead: false,
                })),
                ...(!isEditorInHirings && assignedEditor
                  ? [
                      {
                        key: 'lead_editor',
                        hiring: null,
                        freelancer: {
                          _id: assignedEditor.id || assignedEditor._id,
                          id: assignedEditor.id || assignedEditor._id,
                          name: assignedEditor.name,
                          avatar: assignedEditor.avatar || assignedEditor.profileImage,
                          profileImage: assignedEditor.avatar || assignedEditor.profileImage,
                        },
                        hasHired: true,
                        budget:
                          selectedProject.totalBudget ||
                          (typeof selectedProject.rawBudget === 'number'
                            ? selectedProject.rawBudget
                            : selectedProject.rawBudget?.fixed
                            ? selectedProject.rawBudget.fixed
                            : 0),
                        title: 'Lead Video Editor',
                        description: 'Primary video production and editing lead.',
                        deadline: null,
                        isLead: true,
                      },
                    ]
                  : []),
              ];

              if (combinedMembers.length === 0) {
                return (
                  <div className="p-8 text-center space-y-2 border-2 border-dashed border-[#382322]/20 dark:border-[#FDEBDE]/20 bg-white/60 dark:bg-[#1A1110]/60 rounded-2xl">
                    <p className="text-xs text-[#5C3A38] dark:text-[#D4B8A8]">
                      No team members hired for this project yet.
                    </p>
                    <button
                      onClick={() => navigate(`/creator/create-project?step=2&projectId=${selectedProject.id}`)}
                      className="text-xs text-[#261615] dark:text-[#FFEBAA] font-mono font-bold underline hover:opacity-80 cursor-pointer"
                    >
                      Post a Hiring Role →
                    </button>
                  </div>
                );
              }

              return (
                <div className="grid grid-cols-1 gap-3">
                  {combinedMembers.map((item) => {
                    const freelancer = item.freelancer;
                    const hasHired = item.hasHired;
                    const hiringBudgetNum = item.budget;

                    return (
                      <div
                        key={item.key}
                        onClick={() => {
                          if (hasHired) {
                            handleSelectMember(item.hiring, freelancer);
                          } else {
                            navigate(`/creator/create-project?step=2&projectId=${selectedProject.id}`);
                          }
                        }}
                        className="p-5 rounded-2xl bg-white dark:bg-[#1A1110] border-2 border-[#382322] dark:border-[#FDEBDE]/30 hover:bg-[#FAF0E6] dark:hover:bg-[#261817] shadow-[3px_3px_0_#382322] transition-all cursor-pointer group flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                      >
                        <div className="flex items-center gap-3.5 min-w-0">
                          {hasHired ? (
                            <img
                              src={freelancer.profileImage || freelancer.avatar || DEFAULT_PFP}
                              alt={freelancer.name || 'Team member'}
                              onError={(e) => { e.currentTarget.src = DEFAULT_PFP; }}
                              className="w-12 h-12 rounded-2xl object-cover border-2 border-[#382322] shrink-0"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-2xl bg-[#FFEBAA] border-2 border-[#382322] flex items-center justify-center shrink-0 text-[#261615]">
                              <User className="w-6 h-6" />
                            </div>
                          )}

                          <div className="min-w-0 space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="text-sm sm:text-base font-black font-serif text-[#261615] dark:text-[#FDEBDE] group-hover:underline transition-colors truncate">
                                {hasHired ? (freelancer.name || freelancer.username) : 'Position Open / Unassigned'}
                              </h4>
                              <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-md bg-[#FFEBAA] text-[#261615] border border-[#382322]">
                                {item.title}
                              </span>
                              {hasHired && (
                                <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-600/30">
                                  Active Team Member
                                </span>
                              )}
                            </div>

                            <p className="text-xs text-[#5C3A38] dark:text-[#D4B8A8] line-clamp-1">
                              {item.description}
                            </p>

                            {item.deadline && (
                              <div className="text-[11px] text-[#5C3A38] dark:text-[#D4B8A8] flex items-center gap-1.5 pt-0.5 font-mono">
                                <Calendar className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                                <span>Milestone Deadline: {new Date(item.deadline).toLocaleDateString()}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-5 shrink-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-[#382322]/10 dark:border-[#FDEBDE]/10">
                          <div className="text-left sm:text-right">
                            <span className="text-[10px] text-[#5C3A38] dark:text-[#D4B8A8] uppercase font-mono font-bold block">Allocated Budget</span>
                            <span className="text-base font-black text-emerald-700 dark:text-emerald-400 font-mono">
                              ₹{hiringBudgetNum.toLocaleString()}
                            </span>
                          </div>

                          {hasHired ? (
                            <button
                              type="button"
                              className="px-4 py-2 rounded-xl text-xs font-mono font-bold bg-[#FFEBAA] text-[#261615] border-2 border-[#382322] shadow-[2px_2px_0_#382322] hover:bg-[#FFEBAA]/80 transition-all flex items-center gap-1.5 shrink-0"
                            >
                              <span>Open Escrow</span>
                              <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                            </button>
                          ) : (
                            <button
                              type="button"
                              className="px-4 py-2 rounded-xl text-xs font-mono font-bold bg-white dark:bg-[#261817] text-[#261615] dark:text-[#FDEBDE] border-2 border-[#382322] dark:border-[#FDEBDE]/30 shadow-[2px_2px_0_#382322] hover:bg-[#FFEBAA] transition-all flex items-center gap-1.5 shrink-0"
                            >
                              <span>Review Hiring</span>
                              <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>
        </div>
      ) : (
        /* ═════════════════════════════════════════════════════════════════
           LEVEL 1: PARENT PAYMENTS OVERVIEW (ALL PROJECTS ESCROW OVERVIEW)
        ═════════════════════════════════════════════════════════════════ */
        <>
          {/* Page Title & Header Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-black font-serif text-[#261615] dark:text-[#FDEBDE] tracking-tight">Payments & Escrow Protection</h2>
              <p className="text-xs text-[#5C3A38] dark:text-[#D4B8A8] mt-0.5">
                Bank-grade double-entry ledger with multi-stage escrow lock & 4-digit PIN authorization.
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={() => setIsPinModalOpen(true)}
                className="px-3.5 py-2 rounded-xl text-xs font-mono font-bold bg-white dark:bg-[#261817] hover:bg-[#FAF0E6] text-[#261615] dark:text-[#FDEBDE] border-2 border-[#382322] dark:border-[#FDEBDE]/30 shadow-[2px_2px_0_#382322] transition-all cursor-pointer flex items-center gap-1.5"
              >
                <KeyRound className="w-3.5 h-3.5 text-[#261615] dark:text-[#FFEBAA]" />
                {hasTransactionPin ? 'Change PIN' : 'Set Security PIN'}
              </button>
              <button
                onClick={() => setIsTopUpOpen(true)}
                className="px-4 py-2 rounded-xl text-xs font-mono font-bold bg-[#FFEBAA] hover:bg-[#FFEBAA]/80 text-[#261615] border-2 border-[#382322] shadow-[2px_2px_0_#382322] transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Coins className="w-4 h-4 text-[#261615]" />
                Top Up Credits
              </button>
              <button
                onClick={() => setIsWithdrawModalOpen(true)}
                className="px-4 py-2 rounded-xl text-xs font-mono font-bold bg-white dark:bg-[#201413] hover:bg-[#FAF0E6] dark:hover:bg-[#2D1C1B] text-[#261615] dark:text-[#FDEBDE] border-2 border-[#382322] dark:border-[#FDEBDE]/30 shadow-[2px_2px_0_#382322] dark:shadow-[2px_2px_0_#000] transition-all cursor-pointer flex items-center gap-1.5 active:translate-x-0.5 active:translate-y-0.5"
                title="Withdraw unspent credits from your wallet"
              >
                <ArrowUpRight className="w-4 h-4 text-[#261615] dark:text-[#FFEBAA]" />
                Withdraw Credits
              </button>
            </div>
          </div>

          {/* Metric Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Wallet Balance */}
            <div className="p-5 rounded-2xl border-2 border-[#382322] dark:border-[#FDEBDE]/30 bg-[#FFEBAA] dark:bg-[#2A1D1C] shadow-[4px_4px_0_#382322] dark:shadow-[4px_4px_0_#000] relative overflow-hidden">
              <span className="text-xs text-[#261615] dark:text-[#FFEBAA] flex items-center gap-1.5 font-mono font-bold uppercase tracking-wider">
                <Coins className="w-3.5 h-3.5 text-[#261615] dark:text-[#FFEBAA]" /> Available Wallet Balance
              </span>
              <div className="text-2xl font-black text-[#261615] dark:text-[#FDEBDE] mt-1 font-mono">
                ₹{walletBalance.toLocaleString('en-IN')}
              </div>
              <span className="text-[11px] text-[#261615]/80 dark:text-[#D4B8A8] mt-1 block font-mono font-bold">
                1 Credit = ₹1.00 (Testnet Enabled)
              </span>
            </div>

            {/* Active in Escrow */}
            <div className="p-5 rounded-2xl border-2 border-[#382322] dark:border-[#FDEBDE]/30 bg-[#B1C8EA] dark:bg-[#1A2332] shadow-[4px_4px_0_#382322] dark:shadow-[4px_4px_0_#000] relative overflow-hidden">
              <span className="text-xs text-[#261615] dark:text-[#FFEBAA] flex items-center gap-1.5 font-mono font-bold uppercase tracking-wider">
                <Lock className="w-3.5 h-3.5 text-[#261615] dark:text-[#B1C8EA]" /> Active in Escrow
              </span>
              <div className="text-2xl font-black text-[#261615] dark:text-[#FDEBDE] mt-1 font-mono">
                ₹{escrowLocked.toLocaleString('en-IN')}
              </div>
              <span className="text-[11px] text-[#261615]/80 dark:text-[#D4B8A8] mt-1 block font-mono font-bold">
                Locked across active production milestones
              </span>
            </div>

            {/* Settled Releases */}
            <div className="p-5 rounded-2xl border-2 border-[#382322] dark:border-[#FDEBDE]/30 bg-[#FFF7F1] dark:bg-[#201413] shadow-[4px_4px_0_#382322] dark:shadow-[4px_4px_0_#000]">
              <span className="text-xs text-[#5C3A38] dark:text-[#D4B8A8] block font-mono font-bold uppercase tracking-wider">Total Settled Releases</span>
              <div className="text-2xl font-black text-emerald-700 dark:text-emerald-400 mt-1 font-mono">
                ₹{effectiveTotalSettled.toLocaleString('en-IN')}
              </div>
              <span className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-1 flex items-center gap-1 font-mono font-bold">
                <ShieldCheck className="w-3.5 h-3.5" /> {effectiveClearedMilestones} milestones cleared to editors
              </span>
            </div>
          </div>

          {/* Projects Escrow Pipelines List */}
          <div className="glass-card brutal-card p-6 border-2 border-[#382322] dark:border-[#FDEBDE]/30 bg-[#FFF7F1] dark:bg-[#201413] shadow-[4px_4px_0_#382322] space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h3 className="text-base font-black font-serif text-[#261615] dark:text-[#FDEBDE] flex items-center gap-2">
                  <FolderGit2 className="w-4 h-4 text-[#382322] dark:text-[#FFEBAA]" />
                  Projects Escrow Pipelines
                </h3>
                <p className="text-xs text-[#5C3A38] dark:text-[#D4B8A8] mt-0.5">
                  Click on any project to manage its multi-stage escrow milestones, fund deposits, or authorize payouts.
                </p>
              </div>

              <button
                onClick={() => navigate('/creator/create-project')}
                title="Create New Project"
                aria-label="Create New Project"
                className="p-2.5 rounded-xl border-2 border-[#382322] bg-[#FFEBAA] hover:bg-[#FFEBAA]/80 text-[#261615] shadow-[2px_2px_0_#382322] transition-all cursor-pointer flex items-center justify-center shrink-0 hover:scale-105 active:scale-95"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {loading ? (
              <div className="py-12 text-center text-xs text-[#5C3A38] dark:text-[#D4B8A8]">Loading project escrow records...</div>
            ) : projects.length === 0 ? (
              <div className="py-12 text-center space-y-3">
                <p className="text-xs text-[#5C3A38] dark:text-[#D4B8A8]">
                  No projects found. Create a project to initiate milestone-based escrow contracts.
                </p>
                <button
                  onClick={() => navigate('/creator/create-project')}
                  title="Create New Project"
                  aria-label="Create New Project"
                  className="p-3 rounded-xl bg-[#FFEBAA] text-[#261615] border-2 border-[#382322] shadow-[3px_3px_0_#382322] transition-all cursor-pointer inline-flex items-center justify-center hover:scale-105 active:scale-95 font-bold"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {projects.map((p) => {
                  const hasEditor = Boolean(p.assignedEditor);
                  return (
                    <div
                      key={p.id}
                      onClick={() => handleSelectProject(p)}
                      className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#1A1110] border-2 border-[#382322] dark:border-[#FDEBDE]/30 hover:bg-[#FAF0E6] dark:hover:bg-[#261817] shadow-[3px_3px_0_#382322] transition-all cursor-pointer group flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="min-w-0 flex-1 space-y-1.5">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <h4 className="text-sm sm:text-base font-black font-serif text-[#261615] dark:text-[#FDEBDE] group-hover:underline transition-colors truncate">
                            {p.title}
                          </h4>
                          <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded-md ${p.statusColor}`}>
                            {p.status}
                          </span>
                        </div>

                        <p className="text-xs text-[#5C3A38] dark:text-[#D4B8A8] line-clamp-1">
                          {p.description || 'No description provided.'}
                        </p>

                        <div className="flex items-center gap-3 text-xs text-[#5C3A38] dark:text-[#D4B8A8] pt-0.5 flex-wrap">
                          {hasEditor ? (
                            <div className="flex items-center gap-1.5 text-[#261615] dark:text-[#FFEBAA] font-medium">
                              <img
                                src={p.assignedEditor.avatar || DEFAULT_PFP}
                                alt={p.assignedEditor.name}
                                className="w-5 h-5 rounded-full object-cover border border-[#382322] shrink-0"
                              />
                              <span className="font-semibold">{p.assignedEditor.name}</span>
                            </div>
                          ) : (
                            <span className="text-amber-700 dark:text-amber-400 font-medium flex items-center gap-1">
                              <User className="w-3.5 h-3.5" />
                              Awaiting Freelancers
                            </span>
                          )}
                          <span>•</span>
                          <span className="text-[#5C3A38] dark:text-[#D4B8A8] font-mono">
                            {p.deadline ? `Due ${p.deadline}` : 'Active Pipeline'}
                          </span>
                        </div>

                        {/* Working Freelancers Sub-list inside Project Item */}
                        {Array.isArray(p.hirings) && p.hirings.length > 0 && (
                          <div className="pt-2 border-t border-[#382322]/10 dark:border-[#FDEBDE]/10 space-y-1">
                            <span className="text-[10px] font-mono font-bold text-[#5C3A38] dark:text-[#D4B8A8] block">
                              Assigned Freelancer Roles ({p.hirings.length}):
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {p.hirings.map((hiring, hIdx) => {
                                const f = hiring.hiredFreelancerId;
                                const isHired = Boolean(f);
                                return (
                                  <button
                                    key={hiring._id || hIdx}
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleSelectProject(p, f, hiring);
                                    }}
                                    className="px-2.5 py-1 rounded-lg bg-[#FAF0E6] dark:bg-[#261817] hover:bg-[#FFEBAA] border border-[#382322]/20 text-[11px] flex items-center gap-1.5 text-[#261615] dark:text-[#FDEBDE] transition-all cursor-pointer font-mono"
                                  >
                                    <span className="font-semibold">{hiring.roleTitle}</span>
                                    <span className="font-mono text-emerald-700 dark:text-emerald-400 font-bold">₹{Number(hiring.budget || 0).toLocaleString()}</span>
                                    {isHired ? (
                                      <span className="text-[10px] text-[#261615] dark:text-[#FFEBAA] font-normal">({f.name || 'Assigned'})</span>
                                    ) : (
                                      <span className="text-[10px] text-amber-700 dark:text-amber-400">(Open)</span>
                                    )}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-[#382322]/10 dark:border-[#FDEBDE]/10">
                        <div className="text-left sm:text-right">
                          <span className="text-[10px] text-[#5C3A38] dark:text-[#D4B8A8] uppercase font-mono font-bold block">Budget</span>
                          <span className="text-sm font-black text-[#261615] dark:text-[#FDEBDE] font-mono">
                            {p.budget}
                          </span>
                        </div>

                        <button
                          type="button"
                          className="px-3.5 py-2 rounded-xl text-xs font-mono font-bold bg-[#FFEBAA] text-[#261615] border-2 border-[#382322] shadow-[2px_2px_0_#382322] hover:bg-[#FFEBAA]/80 transition-all flex items-center gap-1.5 shrink-0"
                        >
                          <span>Milestones</span>
                          <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}

      {/* Modals */}
      <WalletTopUpModal isOpen={isTopUpOpen} onClose={() => setIsTopUpOpen(false)} />
      <WithdrawModal
        isOpen={isWithdrawModalOpen}
        onClose={() => setIsWithdrawModalOpen(false)}
      />
      <SecurityPinModal
        isOpen={isPinModalOpen}
        onClose={() => setIsPinModalOpen(false)}
        actionTitle="Update Security PIN"
        actionDescription="Enter a 4-digit PIN to secure all your future escrow and release operations."
      />
    </div>
  );
};

export default Payments;
