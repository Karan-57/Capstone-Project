import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Film,
  Calendar,
  DollarSign,
  Clock,
  Briefcase,
  CreditCard,
  FolderGit2,
  Users,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Plus,
  Trash2,
  UserX,
  ShieldCheck,
  ChevronRight,
  Layers,
  Sparkles,
  Link as LinkIcon,
  Tag,
  MessageSquare,
  Lock
} from 'lucide-react';
import SEO from '../../components/common/SEO';
import Button from '../../components/common/Button';
import { useAlert } from '../../context/AlertContext';
import { projectService } from '../../services/projectService';
import { DEFAULT_PFP } from '../../constants/assets';

export const ProjectDetails = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { showAlert } = useAlert();

  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState(null);
  const [removingHiringId, setRemovingHiringId] = useState(null);
  const [memberToRemove, setMemberToRemove] = useState(null);

  const fetchProjectDetails = async () => {
    if (!projectId) return;
    setLoading(true);
    try {
      const data = await projectService.getProjectDetails(projectId);
      setProject(data);
    } catch (err) {
      console.error('Failed to load project details:', err);
      showAlert(err.response?.data?.message || 'Failed to load project details', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectDetails();
  }, [projectId]);

  // Remove a team member handler
  const handleConfirmRemoveMember = async () => {
    if (!memberToRemove || !projectId) return;
    setRemovingHiringId(memberToRemove.hiringId);
    try {
      const res = await projectService.removeTeamMember(projectId, memberToRemove.hiringId);
      showAlert(res.message || 'Team member removed. Hiring opening reopened! 🚀', 'success');
      setMemberToRemove(null);
      await fetchProjectDetails();
    } catch (err) {
      console.error('Failed to remove member:', err);
      showAlert(
        err.response?.data?.message || err.message || 'Failed to remove team member',
        'error'
      );
    } finally {
      setRemovingHiringId(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse pb-16">
        <div className="h-10 w-48 bg-white/5 rounded-xl" />
        <div className="h-64 bg-white/5 rounded-2xl" />
        <div className="h-48 bg-white/5 rounded-2xl" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="p-12 border-2 border-dashed border-white/10 rounded-2xl text-center space-y-4">
        <Film className="w-12 h-12 text-slate-500 mx-auto" />
        <h3 className="text-lg font-bold text-white">Project Not Found</h3>
        <p className="text-xs text-slate-400">
          The requested project could not be found or you may not have access to it.
        </p>
        <Button variant="primary" size="sm" icon={ArrowLeft} onClick={() => navigate('/creator/projects')}>
          Back to Projects
        </Button>
      </div>
    );
  }

  const raw = project.rawProject || {};
  const hirings = Array.isArray(project.hirings) ? project.hirings : [];

  // 1. Multi-role hirings with assigned freelancers
  const hiredFromRoles = hirings
    .filter((h) => h.hiredFreelancerId || h.status === 'hired')
    .map((h) => {
      const freelancer =
        typeof h.hiredFreelancerId === 'object' && h.hiredFreelancerId !== null
          ? h.hiredFreelancerId
          : {
              _id: h.hiredFreelancerId,
              id: h.hiredFreelancerId,
              name: 'Assigned Freelancer',
              profileImage: DEFAULT_PFP,
            };

      const fid = freelancer._id || freelancer.id;
      const milestones = Array.isArray(h.milestones) ? h.milestones : [];
      let hasStartedWork = Boolean(
        project.roleWorkStarted?.[h._id?.toString()] ||
        milestones.some(
          (m) =>
            m.status === 'submitted' ||
            m.status === 'approved' ||
            m.status === 'funded' ||
            Boolean(m.submittedUrl && m.submittedUrl.trim())
        )
      );

      // Check localStorage for this role's milestones
      if (!hasStartedWork && fid) {
        const localRoleKey = `collabo_milestones_${project.id}_${fid}`;
        try {
          const saved = localStorage.getItem(localRoleKey);
          if (saved) {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed) && parsed.some((m) => m.status === 'approved' || m.status === 'submitted' || m.status === 'funded')) {
              hasStartedWork = true;
            }
          }
        } catch (e) {}
      }

      return {
        _id: h._id,
        hiringId: h._id,
        roleId: h.roleId || 'video_editor',
        roleTitle: h.roleTitle || 'Video Editor',
        description: h.description,
        budget: h.budget,
        currency: h.currency || 'INR',
        status: h.status || 'hired',
        freelancer,
        hiredAt: h.hiredAt || h.createdAt,
        milestones,
        hasStartedWork,
        isFromHiring: true,
      };
    });

  // 2. Lead Editor assigned directly to project (selectedEditorId / assignedEditor)
  const leadEditorUser = raw.selectedEditorId || project.assignedEditor;
  const leadEditorId = leadEditorUser?._id || leadEditorUser?.id;

  const isLeadAlreadyInHiredRoles =
    leadEditorId &&
    hiredFromRoles.some((m) => {
      const fid = m.freelancer?._id || m.freelancer?.id;
      return fid && fid.toString() === leadEditorId.toString();
    });

  let leadEditorHasStarted = Boolean(
    project.leadEditorHasStartedWork ||
    raw.status === 'in_progress' ||
    raw.status === 'completed'
  );

  // Check localStorage for lead editor escrow milestones
  if (!leadEditorHasStarted && leadEditorId) {
    const localMilestoneKey = `collabo_milestones_${project.id}_${leadEditorId}`;
    const localProjectKey = `collabo_milestones_${project.id}`;
    try {
      const localSaved = localStorage.getItem(localMilestoneKey) || localStorage.getItem(localProjectKey);
      if (localSaved) {
        const parsed = JSON.parse(localSaved);
        if (Array.isArray(parsed) && parsed.some((m) => m.status === 'approved' || m.status === 'submitted' || m.status === 'funded')) {
          leadEditorHasStarted = true;
        }
      }
    } catch (e) {}
  }

  const leadEditorMember =
    !isLeadAlreadyInHiredRoles && leadEditorId
      ? [
          {
            _id: 'selected_editor',
            hiringId: 'selected_editor',
            roleId: 'video_editor',
            roleTitle: 'Lead Video Editor',
            description: 'Primary video production and editing lead assigned to this project.',
            budget:
              project.totalBudget ||
              (typeof raw.budget === 'number'
                ? raw.budget
                : raw.budget?.fixed
                ? raw.budget.fixed
                : Number(raw.budget) || 0),
            currency: 'INR',
            status: 'hired',
            freelancer:
              typeof leadEditorUser === 'object' && leadEditorUser !== null
                ? {
                    _id: leadEditorId,
                    id: leadEditorId,
                    name: leadEditorUser.name || 'Assigned Editor',
                    username: leadEditorUser.username || '',
                    profileImage:
                      leadEditorUser.profileImage || leadEditorUser.avatar || DEFAULT_PFP,
                    email: leadEditorUser.email || '',
                    rating: leadEditorUser.rating || 5.0,
                  }
                : {
                    _id: leadEditorId,
                    id: leadEditorId,
                    name: 'Assigned Editor',
                    profileImage: DEFAULT_PFP,
                  },
            hiredAt: raw.updatedAt || raw.createdAt,
            milestones: Array.isArray(raw.milestones) ? raw.milestones : [],
            hasStartedWork: leadEditorHasStarted,
            isFromHiring: false,
            isLeadEditor: true,
          },
        ]
      : [];

  const assignedTeam = [...hiredFromRoles, ...leadEditorMember];
  const openPositions = hirings.filter((h) => !h.hiredFreelancerId && h.status !== 'hired');

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      <SEO
        title={`${project.title} - Project Management & Team`}
        description={project.description || 'Manage project scope, hired team, escrow payments, and workspace.'}
      />

      {/* Top Navigation & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/creator/projects')}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-all cursor-pointer flex items-center gap-1.5 text-xs font-semibold shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Manage Projects</span>
          </button>
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight truncate">
              {project.title}
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Production Dashboard • Category: <span className="text-purple-300 font-medium">{project.category}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-xs font-semibold px-3 py-1 rounded-xl ${project.statusColor}`}>
            {project.status}
          </span>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          PRIMARY ACTION SHORTCUTS (HIRING, PAYMENTS, WORKSPACE)
      ───────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        {/* 1. Continue Hiring */}
        <button
          type="button"
          onClick={() => navigate(`/creator/create-project?step=2&projectId=${project.id}`)}
          className="p-4 rounded-2xl bg-[#0E1322] border border-purple-500/30 hover:border-purple-500/60 hover:bg-[#12182B] text-left transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer group space-y-2 shadow-lg hover:shadow-purple-950/20"
        >
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
              <Briefcase className="w-5 h-5" />
            </div>
            <ChevronRight className="w-4 h-4 text-purple-400 group-hover:translate-x-1 transition-transform" />
          </div>
          <div>
            <div className="font-bold text-sm text-white group-hover:text-purple-300 transition-colors">
              Hiring & Roles
            </div>
            <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">
              Post new roles, review bids & invite freelancers
            </p>
          </div>
        </button>

        {/* 2. Pay Editors & Escrow */}
        <button
          type="button"
          onClick={() => navigate(`/creator/payments?projectId=${project.id}`)}
          className="p-4 rounded-2xl bg-[#0E1322] border border-emerald-500/30 hover:border-emerald-500/60 hover:bg-[#12182B] text-left transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer group space-y-2 shadow-lg hover:shadow-emerald-950/20"
        >
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
              <CreditCard className="w-5 h-5" />
            </div>
            <ChevronRight className="w-4 h-4 text-emerald-400 group-hover:translate-x-1 transition-transform" />
          </div>
          <div>
            <div className="font-bold text-sm text-white group-hover:text-emerald-300 transition-colors">
              Escrow & Payments
            </div>
            <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">
              Authorize PIN locks, approve milestones & releases
            </p>
          </div>
        </button>

        {/* 3. Open Workspace */}
        <button
          type="button"
          onClick={() => navigate(`/creator/workspace?projectId=${project.id}`)}
          className="p-4 rounded-2xl bg-[#0E1322] border border-indigo-500/30 hover:border-indigo-500/60 hover:bg-[#12182B] text-left transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer group space-y-2 shadow-lg hover:shadow-indigo-950/20"
        >
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
              <FolderGit2 className="w-5 h-5" />
            </div>
            <ChevronRight className="w-4 h-4 text-indigo-400 group-hover:translate-x-1 transition-transform" />
          </div>
          <div>
            <div className="font-bold text-sm text-white group-hover:text-indigo-300 transition-colors">
              Production Workspace
            </div>
            <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">
              Collaborative video player, frame notes & asset cloud
            </p>
          </div>
        </button>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          PROJECT OVERVIEW & SPECIFICATIONS CARD
      ───────────────────────────────────────────────────────────── */}
      <div className="glass-card p-6 border border-white/[0.08] space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.06] pb-4">
          <div className="space-y-1">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Film className="w-4 h-4 text-purple-400" />
              Project Specifications & Scope
            </h2>
            <p className="text-xs text-slate-400">
              Core production parameters configured for this project.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-[10px] text-slate-400 uppercase font-mono block">Total Budget</span>
              <span className="text-lg font-extrabold text-emerald-400 font-mono">
                {project.budget}
              </span>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <span className="text-xs font-semibold text-slate-300 block">Brief & Description:</span>
          <p className="text-xs text-slate-300 leading-relaxed bg-[#0A0D16] p-3.5 rounded-xl border border-white/[0.04]">
            {project.description || 'No detailed brief provided for this project.'}
          </p>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] space-y-1">
            <span className="text-[10px] text-slate-400 font-mono uppercase block">Editing Style</span>
            <span className="font-bold text-white block truncate">{raw.editingStyle || 'Standard Production'}</span>
          </div>

          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] space-y-1">
            <span className="text-[10px] text-slate-400 font-mono uppercase block">Expected Video Length</span>
            <span className="font-bold text-white block truncate">{raw.expectedVideoDuration || `${raw.videoDuration || 0} mins`}</span>
          </div>

          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] space-y-1">
            <span className="text-[10px] text-slate-400 font-mono uppercase block">Turnaround Duration</span>
            <span className="font-bold text-white block truncate">{raw.projectDuration || raw.duration || '7 - 10 Days'}</span>
          </div>

          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] space-y-1">
            <span className="text-[10px] text-slate-400 font-mono uppercase block">Deadline</span>
            <span className="font-bold text-amber-300 block font-mono">{project.deadline}</span>
          </div>
        </div>

        {/* Required Skills & Reference Links */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          {Array.isArray(project.tags) && project.tags.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-slate-300 block">Required Skills & Tags:</span>
              <div className="flex flex-wrap gap-1.5">
                {project.tags.map((tag, tIdx) => (
                  <span
                    key={tIdx}
                    className="px-2.5 py-1 rounded-lg text-xs font-medium bg-purple-950/40 text-purple-300 border border-purple-800/30 flex items-center gap-1"
                  >
                    <Tag className="w-3 h-3 text-purple-400" />
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {Array.isArray(raw.referenceLinks) && raw.referenceLinks.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-slate-300 block">Reference Links:</span>
              <div className="space-y-1">
                {raw.referenceLinks.map((link, lIdx) => (
                  <a
                    key={lIdx}
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1.5 truncate hover:underline"
                  >
                    <ExternalLink className="w-3 h-3 shrink-0" />
                    <span className="truncate">{link}</span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          TEAM MEMBERS & ROLE POSITIONS (WITH REMOVE MEMBER CAPABILITY)
      ───────────────────────────────────────────────────────────── */}
      <div className="glass-card p-6 border border-white/[0.08] space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.06] pb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-400" />
              Project Team & Assigned Freelancers ({assignedTeam.length})
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Manage your hired team. Members can be removed if they were just approved and haven't started work yet, which reopens the position.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate(`/creator/create-project?step=2&projectId=${project.id}`)}
            className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 shadow-md shadow-purple-900/30"
          >
            <Plus className="w-4 h-4" />
            <span>Hire Another Role</span>
          </button>
        </div>

        {/* Assigned Team Members List */}
        {assignedTeam.length > 0 ? (
          <div className="grid grid-cols-1 gap-3">
            {assignedTeam.map((member) => {
              const freelancer = member.freelancer || member.hiredFreelancerId;
              const fid = freelancer._id || freelancer.id;
              const milestones = Array.isArray(member.milestones) ? member.milestones : [];
              const hasStartedWork = Boolean(member.hasStartedWork);

              return (
                <div
                  key={member._id || member.hiringId || fid}
                  className="p-4 sm:p-5 rounded-2xl bg-[#0E1322] border border-white/[0.06] hover:border-purple-500/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <img
                      src={freelancer.profileImage || freelancer.avatar || DEFAULT_PFP}
                      alt={freelancer.name || 'Team member'}
                      onError={(e) => { e.currentTarget.src = DEFAULT_PFP; }}
                      className="w-12 h-12 rounded-2xl object-cover border-2 border-purple-500/40 shrink-0"
                    />

                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm sm:text-base font-bold text-white truncate">
                          {freelancer.name || freelancer.username || 'Team Member'}
                        </h4>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-950/60 text-purple-300 border border-purple-800/40">
                          {member.roleTitle}
                        </span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-emerald-950/60 text-emerald-300 border border-emerald-800/40 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          Hired & Active
                        </span>
                      </div>

                      <p className="text-xs text-slate-400 line-clamp-1">
                        {member.description || `Assigned to handle ${member.roleTitle} deliverables.`}
                      </p>

                      <div className="flex items-center gap-3 text-[11px] text-slate-400 pt-0.5 flex-wrap">
                        {member.hiredAt && (
                          <span>Approved: {new Date(member.hiredAt).toLocaleDateString()}</span>
                        )}
                        <span>•</span>
                        <span className={hasStartedWork ? 'text-amber-400 font-semibold' : 'text-slate-400'}>
                          Work Status: {hasStartedWork ? 'In Progress / Deliverables or Payments Active' : 'Not Started Yet'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-white/[0.06]">
                    <div className="text-left sm:text-right pr-2">
                      <span className="text-[10px] text-slate-400 uppercase font-mono block">Allocated Budget</span>
                      <span className="text-base font-extrabold text-emerald-400 font-mono">
                        ₹{Number(member.budget || 0).toLocaleString()}
                      </span>
                    </div>

                    {/* Escrow Shortcut */}
                    <button
                      type="button"
                      onClick={() => navigate(`/creator/payments?projectId=${project.id}&freelancerId=${fid}&roleId=${member.roleId || ''}&hiringId=${member.isFromHiring ? member.hiringId : ''}`)}
                      className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/40 transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>Manage Escrow</span>
                    </button>

                    {/* Remove Member Button (Only when member has NOT started work yet) */}
                    {!hasStartedWork ? (
                      <button
                        type="button"
                        onClick={() =>
                          setMemberToRemove({
                            hiringId: member.hiringId || member._id,
                            freelancerName: freelancer.name || freelancer.username || 'Team member',
                            roleTitle: member.roleTitle,
                          })
                        }
                        className="px-3 py-2 rounded-xl text-xs font-semibold bg-rose-600/15 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30 transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
                        title="Remove member and reopen role for applications"
                      >
                        <UserX className="w-3.5 h-3.5" />
                        <span>Remove Member</span>
                      </button>
                    ) : (
                      <span
                        className="text-[10px] text-amber-300 font-medium px-2.5 py-1.5 rounded-xl bg-amber-950/40 border border-amber-800/40 flex items-center gap-1 shrink-0 cursor-not-allowed"
                        title="Cannot remove: Freelancer has already started submissions, deliverables, or received milestone payments."
                      >
                        <Lock className="w-3 h-3 text-amber-400" />
                        <span>Work Started / Paid</span>
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 text-center space-y-2 border border-dashed border-white/10 rounded-2xl bg-white/[0.01]">
            <Users className="w-8 h-8 text-slate-600 mx-auto" />
            <p className="text-xs text-slate-400">
              No team members have been approved for this project yet.
            </p>
            <button
              type="button"
              onClick={() => navigate(`/creator/create-project?step=2&projectId=${project.id}`)}
              className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold transition-all inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Review Applications / Post Role</span>
            </button>
          </div>
        )}

        {/* Open Hiring Positions */}
        {openPositions.length > 0 && (
          <div className="pt-4 border-t border-white/[0.06] space-y-3">
            <h4 className="text-xs font-bold text-slate-300 flex items-center gap-2">
              <Briefcase className="w-3.5 h-3.5 text-amber-400" />
              Open Positions Awaiting Team Members ({openPositions.length})
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {openPositions.map((hiring) => (
                <div
                  key={hiring._id}
                  className="p-3.5 rounded-xl bg-[#0A0D16] border border-white/[0.05] flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-white truncate block">
                      {hiring.roleTitle}
                    </span>
                    <span className="text-[10px] text-amber-400 font-medium">
                      Status: Open for Applications
                    </span>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-xs font-mono font-bold text-emerald-400 block">
                      ₹{Number(hiring.budget || 0).toLocaleString()}
                    </span>
                    <button
                      type="button"
                      onClick={() => navigate(`/creator/create-project?step=2&projectId=${project.id}`)}
                      className="text-[10px] text-purple-400 hover:text-purple-300 font-semibold hover:underline"
                    >
                      Manage Opening →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ─────────────────────────────────────────────────────────────
          CONFIRM REMOVE TEAM MEMBER MODAL
      ───────────────────────────────────────────────────────────── */}
      {memberToRemove && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md p-6 rounded-2xl bg-[#0F1422] border border-rose-500/40 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
                <UserX className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Remove Team Member?</h3>
                <p className="text-xs text-slate-400">
                  {memberToRemove.freelancerName} ({memberToRemove.roleTitle})
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed bg-rose-950/20 border border-rose-800/30 p-3 rounded-xl">
              Are you sure you want to remove <strong>{memberToRemove.freelancerName}</strong> from the role{' '}
              <strong>"{memberToRemove.roleTitle}"</strong>?
              <br /><br />
              Since work has not started yet, doing so will <strong>reopen this hiring position</strong> immediately so other freelancers can apply.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setMemberToRemove(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-white/5 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={Boolean(removingHiringId)}
                onClick={handleConfirmRemoveMember}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 transition-all cursor-pointer shadow-md shadow-rose-950/40 flex items-center gap-1.5 disabled:opacity-50"
              >
                <UserX className="w-3.5 h-3.5" />
                <span>{removingHiringId ? 'Removing...' : 'Confirm & Reopen Role'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetails;
