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
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import SEO from '../../components/common/SEO';
import { useAlert } from '../../context/AlertContext';
import { useWallet } from '../../context/WalletContext';
import { projectService } from '../../services/projectService';
import WalletTopUpModal from '../../components/wallet/WalletTopUpModal';
import SecurityPinModal from '../../components/wallet/SecurityPinModal';
import MilestoneEscrowPipeline from '../../components/workspace/MilestoneEscrowPipeline';
import { DEFAULT_PFP } from '../../constants/assets';

export const Payments = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { showAlert } = useAlert();
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
    loadData();
  }, []);

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
          {/* Header of the page: plain text, NO border, NO container */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <button
                onClick={handleBackToProjectMembers}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-all cursor-pointer flex items-center gap-1.5 text-xs font-semibold shrink-0"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Team Members</span>
              </button>

              <div className="min-w-0">
                <h2 className="text-xl font-bold text-white tracking-tight">
                  Multi-Stage Escrow Pipeline
                </h2>
                <p className="text-xs text-slate-400 mt-0.5 truncate">
                  {selectedProject.title} • Member: <span className="text-white font-semibold">{effectiveFreelancerName}</span> • Role: <span className="text-purple-300 font-medium">{effectiveRoleTitle}</span> • Allocated Role Budget: <span className="text-emerald-400 font-mono font-bold">₹{effectiveBudget.toLocaleString()}</span> (Total Project: <span className="text-slate-300 font-mono">₹{effectiveTotalProjectBudget.toLocaleString()}</span>)
                </p>
              </div>
            </div>

            <button
              onClick={handleBackToAllProjects}
              className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-white/5 border border-white/[0.08] transition-colors cursor-pointer shrink-0 self-start sm:self-auto"
            >
              All Projects
            </button>
          </div>

          {/* Render the full Multi-Stage Escrow Pipeline for this specific freelancer and role */}
          <MilestoneEscrowPipeline
            workspaceId={`${selectedProject.id}_${effectiveFreelancerId}`}
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
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-all cursor-pointer flex items-center gap-1.5 text-xs font-semibold shrink-0"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>All Projects</span>
              </button>

              <div className="min-w-0">
                <h2 className="text-xl font-bold text-white tracking-tight">
                  {selectedProject.title} — Team Members & Role Budgets
                </h2>
                <p className="text-xs text-slate-400 mt-0.5 truncate">
                  Total Project Budget: <span className="text-emerald-400 font-mono font-bold">{selectedProject.budget}</span> • Select a team member to manage their milestone escrow deposits & payment releases.
                </p>
              </div>
            </div>

            <button
              onClick={() => navigate(`/creator/create-project?step=2&projectId=${selectedProject.id}`)}
              className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 shadow-md shadow-purple-900/30"
            >
              <Plus className="w-4 h-4" />
              <span>Hire New Role</span>
            </button>
          </div>

          {/* Team Members & Hirings List Container */}
          <div className="glass-card p-6 border border-white/[0.08] space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <User className="w-4 h-4 text-purple-400" />
                  Assigned Team Members & Roles ({
                    (Array.isArray(selectedProject.hirings) ? selectedProject.hirings.length : 0) +
                    (selectedProject.assignedEditor && (!Array.isArray(selectedProject.hirings) || !selectedProject.hirings.some(h => (h.hiredFreelancerId?._id || h.hiredFreelancerId)?.toString() === (selectedProject.assignedEditor.id || selectedProject.assignedEditor._id)?.toString())) ? 1 : 0)
                  })
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
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
                  <div className="p-8 text-center space-y-2 border border-dashed border-white/10 rounded-2xl">
                    <p className="text-xs text-slate-400">
                      No team members hired for this project yet.
                    </p>
                    <button
                      onClick={() => navigate(`/creator/create-project?step=2&projectId=${selectedProject.id}`)}
                      className="text-xs text-purple-400 hover:text-purple-300 font-semibold cursor-pointer"
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
                        className="p-5 rounded-2xl bg-[#0E1322] border border-white/[0.06] hover:border-purple-500/50 hover:bg-[#12182B] transition-all cursor-pointer group flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg hover:shadow-purple-950/20"
                      >
                        <div className="flex items-center gap-3.5 min-w-0">
                          {hasHired ? (
                            <img
                              src={freelancer.profileImage || freelancer.avatar || DEFAULT_PFP}
                              alt={freelancer.name || 'Team member'}
                              onError={(e) => { e.currentTarget.src = DEFAULT_PFP; }}
                              className="w-12 h-12 rounded-2xl object-cover border-2 border-purple-500/40 shrink-0"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-2xl bg-purple-950/60 border border-purple-800/40 flex items-center justify-center shrink-0">
                              <User className="w-6 h-6 text-purple-400" />
                            </div>
                          )}

                          <div className="min-w-0 space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="text-sm sm:text-base font-bold text-white group-hover:text-purple-300 transition-colors truncate">
                                {hasHired ? (freelancer.name || freelancer.username) : 'Position Open / Unassigned'}
                              </h4>
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-950/60 text-purple-300 border border-purple-800/40">
                                {item.title}
                              </span>
                              {hasHired && (
                                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-emerald-950/60 text-emerald-300 border border-emerald-800/40">
                                  Active Team Member
                                </span>
                              )}
                            </div>

                            <p className="text-xs text-slate-400 line-clamp-1">
                              {item.description}
                            </p>

                            {item.deadline && (
                              <div className="text-[11px] text-slate-400 flex items-center gap-1.5 pt-0.5">
                                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                                <span>Milestone Deadline: {new Date(item.deadline).toLocaleDateString()}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-5 shrink-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-white/[0.06]">
                          <div className="text-left sm:text-right">
                            <span className="text-[10px] text-slate-400 uppercase font-mono block">Allocated Budget</span>
                            <span className="text-base font-extrabold text-emerald-400 font-mono">
                              ₹{hiringBudgetNum.toLocaleString()}
                            </span>
                          </div>

                          {hasHired ? (
                            <button
                              type="button"
                              className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600/20 group-hover:bg-emerald-600 text-emerald-300 group-hover:text-white border border-emerald-500/40 group-hover:border-emerald-500 transition-all flex items-center gap-1.5 shrink-0"
                            >
                              <span>Open Escrow</span>
                              <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                            </button>
                          ) : (
                            <button
                              type="button"
                              className="px-4 py-2 rounded-xl text-xs font-semibold bg-purple-600/20 group-hover:bg-purple-600 text-purple-300 group-hover:text-white border border-purple-500/40 group-hover:border-purple-500 transition-all flex items-center gap-1.5 shrink-0"
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
              <h2 className="text-xl font-bold text-white tracking-tight">Payments & Escrow Protection</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Bank-grade double-entry ledger with multi-stage escrow lock & 4-digit PIN authorization.
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={() => setIsPinModalOpen(true)}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#141A28] hover:bg-[#1A2234] text-slate-200 border border-white/[0.08] transition-all cursor-pointer flex items-center gap-1.5"
              >
                <KeyRound className="w-3.5 h-3.5 text-purple-400" />
                {hasTransactionPin ? 'Change PIN' : 'Set Security PIN'}
              </button>
              <button
                onClick={() => setIsTopUpOpen(true)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-500 hover:from-purple-500 hover:to-indigo-500 text-white shadow-md shadow-purple-900/40 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Coins className="w-4 h-4 text-amber-300" />
                Top Up Credits
              </button>
            </div>
          </div>

          {/* Metric Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Wallet Balance */}
            <div className="glass-card p-5 border border-amber-500/20 bg-gradient-to-br from-[#0B0E17] to-[#161324] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl" />
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Coins className="w-3.5 h-3.5 text-amber-400" /> Available Wallet Balance
              </span>
              <div className="text-2xl font-bold text-white mt-1 font-mono">
                ₹{walletBalance.toLocaleString('en-IN')}
              </div>
              <span className="text-[11px] text-amber-400 mt-1 block font-medium">
                1 Credit = ₹1.00 (Testnet Enabled)
              </span>
            </div>

            {/* Active in Escrow */}
            <div className="glass-card p-5 border border-purple-500/20 bg-gradient-to-br from-[#0B0E17] to-[#181228] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-2xl" />
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Lock className="w-3.5 h-3.5 text-purple-400" /> Active in Escrow
              </span>
              <div className="text-2xl font-bold text-purple-400 mt-1 font-mono">
                ₹{escrowLocked.toLocaleString('en-IN')}
              </div>
              <span className="text-[11px] text-slate-400 mt-1 block">
                Locked across active production milestones
              </span>
            </div>

            {/* Settled Releases */}
            <div className="glass-card p-5 border border-emerald-500/20 bg-gradient-to-br from-[#0B0E17] to-[#0E1C22]">
              <span className="text-xs text-slate-400">Total Settled Releases</span>
              <div className="text-2xl font-bold text-emerald-400 mt-1 font-mono">
                ₹{effectiveTotalSettled.toLocaleString('en-IN')}
              </div>
              <span className="text-[11px] text-emerald-400/90 mt-1 flex items-center gap-1 font-medium">
                <ShieldCheck className="w-3.5 h-3.5" /> {effectiveClearedMilestones} milestones cleared to editors
              </span>
            </div>
          </div>

          {/* Projects Escrow Pipelines List */}
          <div className="glass-card p-6 border border-white/[0.06] space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <FolderGit2 className="w-4 h-4 text-purple-400" />
                  Projects Escrow Pipelines
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Click on any project to manage its multi-stage escrow milestones, fund deposits, or authorize payouts.
                </p>
              </div>

              <button
                onClick={() => navigate('/creator/create-project')}
                title="Create New Project"
                aria-label="Create New Project"
                className="p-2.5 rounded-xl border border-white/10 hover:border-purple-500/40 bg-white/5 hover:bg-white/10 text-white transition-all cursor-pointer flex items-center justify-center shrink-0 hover:scale-105 active:scale-95"
              >
                <Plus className="w-4 h-4 text-purple-300" />
              </button>
            </div>

            {loading ? (
              <div className="py-12 text-center text-xs text-slate-400">Loading project escrow records...</div>
            ) : projects.length === 0 ? (
              <div className="py-12 text-center space-y-3">
                <p className="text-xs text-slate-400">
                  No projects found. Create a project to initiate milestone-based escrow contracts.
                </p>
                <button
                  onClick={() => navigate('/creator/create-project')}
                  title="Create New Project"
                  aria-label="Create New Project"
                  className="p-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white transition-all cursor-pointer inline-flex items-center justify-center shadow-lg shadow-purple-900/30 hover:scale-105 active:scale-95"
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
                      className="p-4 sm:p-5 rounded-2xl bg-[#0E1322] border border-white/[0.06] hover:border-purple-500/40 hover:bg-[#11182B] transition-all cursor-pointer group flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="min-w-0 flex-1 space-y-1.5">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <h4 className="text-sm sm:text-base font-bold text-white group-hover:text-purple-300 transition-colors truncate">
                            {p.title}
                          </h4>
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${p.statusColor}`}>
                            {p.status}
                          </span>
                        </div>

                        <p className="text-xs text-slate-400 line-clamp-1">
                          {p.description || 'No description provided.'}
                        </p>

                        <div className="flex items-center gap-3 text-xs text-slate-400 pt-0.5 flex-wrap">
                          {hasEditor ? (
                            <div className="flex items-center gap-1.5 text-purple-300 font-medium">
                              <img
                                src={p.assignedEditor.avatar || DEFAULT_PFP}
                                alt={p.assignedEditor.name}
                                className="w-5 h-5 rounded-full object-cover border border-white/10 shrink-0"
                              />
                              <span>{p.assignedEditor.name}</span>
                            </div>
                          ) : (
                            <span className="text-amber-400/90 font-medium flex items-center gap-1">
                              <User className="w-3.5 h-3.5" />
                              Awaiting Freelancers
                            </span>
                          )}
                          <span>•</span>
                          <span className="text-slate-400">
                            {p.deadline ? `Due ${p.deadline}` : 'Active Pipeline'}
                          </span>
                        </div>

                        {/* Working Freelancers Sub-list inside Project Item */}
                        {Array.isArray(p.hirings) && p.hirings.length > 0 && (
                          <div className="pt-2 border-t border-white/[0.04] space-y-1">
                            <span className="text-[10px] font-semibold text-slate-400 block">
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
                                    className="px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-purple-600/20 border border-white/[0.06] hover:border-purple-500/40 text-[11px] flex items-center gap-1.5 text-slate-300 hover:text-white transition-all cursor-pointer"
                                  >
                                    <span className="font-medium">{hiring.roleTitle}</span>
                                    <span className="font-mono text-emerald-400 font-semibold">₹{Number(hiring.budget || 0).toLocaleString()}</span>
                                    {isHired ? (
                                      <span className="text-[10px] text-purple-300 font-normal">({f.name || 'Assigned'})</span>
                                    ) : (
                                      <span className="text-[10px] text-amber-400/90">(Open)</span>
                                    )}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-white/[0.06]">
                        <div className="text-left sm:text-right">
                          <span className="text-[10px] text-slate-400 uppercase font-mono block">Budget</span>
                          <span className="text-sm font-bold text-white font-mono">
                            {p.budget}
                          </span>
                        </div>

                        <button
                          type="button"
                          className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-purple-600/15 group-hover:bg-purple-600 text-purple-300 group-hover:text-white border border-purple-500/30 group-hover:border-purple-500 transition-all flex items-center gap-1.5 shrink-0"
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
