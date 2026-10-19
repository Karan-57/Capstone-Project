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
        <div className="h-10 w-48 bg-[#382322]/10 dark:bg-[#FDEBDE]/10 rounded-none border-2 border-[#382322]/20 dark:border-[#FDEBDE]/20" />
        <div className="h-64 bg-[#382322]/10 dark:bg-[#FDEBDE]/10 rounded-none border-2 border-[#382322]/20 dark:border-[#FDEBDE]/20" />
        <div className="h-48 bg-[#382322]/10 dark:bg-[#FDEBDE]/10 rounded-none border-2 border-[#382322]/20 dark:border-[#FDEBDE]/20" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="p-12 border-2 border-[#382322] dark:border-[#FDEBDE]/30 bg-[#FFFDF9] dark:bg-[#201413] shadow-[4px_4px_0_#382322] text-center space-y-4">
        <Film className="w-12 h-12 text-[#5C3A38] dark:text-[#D4B8A8] mx-auto" />
        <h3 className="text-xl font-bold font-serif text-[#261615] dark:text-[#FDEBDE]">Project Not Found</h3>
        <p className="text-xs text-[#5C3A38] dark:text-[#D4B8A8]">
          The requested project could not be found or you may not have access to it.
        </p>
        <button
          onClick={() => navigate('/creator/projects')}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#FFEBAA] hover:bg-[#ffe58f] text-[#261615] border-2 border-[#382322] shadow-[2px_2px_0_#382322] text-xs font-bold uppercase tracking-wider cursor-pointer active:translate-x-0.5 active:translate-y-0.5"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Projects</span>
        </button>
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
    <div className="space-y-6 animate-fade-in pb-16 text-[#261615] dark:text-[#FDEBDE]">
      <SEO
        title={`${project.title} - Project Management & Team`}
        description={project.description || 'Manage project scope, hired team, escrow payments, and workspace.'}
      />

      {/* Top Navigation & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-[#FFFDF9] dark:bg-[#201413] border-2 border-[#382322] dark:border-[#FDEBDE]/30 shadow-[3px_3px_0_#382322] dark:shadow-[3px_3px_0_#000]">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/creator/projects')}
            className="p-2 bg-[#FDEBDE] dark:bg-[#2A1A19] hover:bg-[#FFEBAA] text-[#261615] dark:text-[#FDEBDE] border-2 border-[#382322] dark:border-[#FDEBDE]/30 shadow-[2px_2px_0_#382322] transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider shrink-0 active:translate-x-0.5 active:translate-y-0.5"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Manage Projects</span>
          </button>
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-serif font-bold text-[#261615] dark:text-[#FDEBDE] tracking-tight truncate">
              {project.title}
            </h1>
            <p className="text-xs text-[#5C3A38] dark:text-[#D4B8A8] mt-0.5">
              Production Dashboard • Category: <span className="font-bold underline decoration-[#FFEBAA] decoration-2">{project.category}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold font-mono uppercase tracking-wider px-3 py-1 bg-[#FFEBAA] text-[#261615] border-2 border-[#382322] shadow-[2px_2px_0_#382322]">
            {project.status}
          </span>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          PRIMARY ACTION SHORTCUTS (HIRING, PAYMENTS, WORKSPACE)
      ───────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* 1. Continue Hiring */}
        <button
          type="button"
          onClick={() => navigate(`/creator/create-project?step=2&projectId=${project.id}`)}
          className="p-5 bg-[#FFEBAA] dark:bg-[#201413] border-2 border-[#382322] dark:border-[#FDEBDE]/30 shadow-[3px_3px_0_#382322] dark:shadow-[3px_3px_0_#000] text-left transition-all hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 cursor-pointer group space-y-3"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 bg-[#FFF7F1] dark:bg-[#19100F] border-2 border-[#382322] dark:border-[#FDEBDE]/30 flex items-center justify-center text-[#261615] dark:text-[#FFEBAA]">
              <Briefcase className="w-5 h-5" />
            </div>
            <ChevronRight className="w-5 h-5 text-[#261615] dark:text-[#FFEBAA] group-hover:translate-x-1 transition-transform" />
          </div>
          <div>
            <div className="font-serif font-bold text-base text-[#261615] dark:text-[#FDEBDE]">
              Hiring & Roles
            </div>
            <p className="text-xs text-[#5C3A38] dark:text-[#D4B8A8] mt-1 line-clamp-1 font-sans">
              Post new roles, review bids & invite freelancers
            </p>
          </div>
        </button>

        {/* 2. Pay Editors & Escrow */}
        <button
          type="button"
          onClick={() => navigate(`/creator/payments?projectId=${project.id}`)}
          className="p-5 bg-[#B1C8EA] dark:bg-[#201413] border-2 border-[#382322] dark:border-[#FDEBDE]/30 shadow-[3px_3px_0_#382322] dark:shadow-[3px_3px_0_#000] text-left transition-all hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 cursor-pointer group space-y-3"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 bg-[#FFF7F1] dark:bg-[#19100F] border-2 border-[#382322] dark:border-[#FDEBDE]/30 flex items-center justify-center text-[#261615] dark:text-[#B1C8EA]">
              <CreditCard className="w-5 h-5" />
            </div>
            <ChevronRight className="w-5 h-5 text-[#261615] dark:text-[#B1C8EA] group-hover:translate-x-1 transition-transform" />
          </div>
          <div>
            <div className="font-serif font-bold text-base text-[#261615] dark:text-[#FDEBDE]">
              Escrow & Payments
            </div>
            <p className="text-xs text-[#5C3A38] dark:text-[#D4B8A8] mt-1 line-clamp-1 font-sans">
              Authorize PIN locks, approve milestones & releases
            </p>
          </div>
        </button>

        {/* 3. Open Workspace */}
        <button
          type="button"
          onClick={() => navigate(`/creator/workspace?projectId=${project.id}`)}
          className="p-5 bg-[#FDEBDE] dark:bg-[#201413] border-2 border-[#382322] dark:border-[#FDEBDE]/30 shadow-[3px_3px_0_#382322] dark:shadow-[3px_3px_0_#000] text-left transition-all hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 cursor-pointer group space-y-3"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 bg-[#FFF7F1] dark:bg-[#19100F] border-2 border-[#382322] dark:border-[#FDEBDE]/30 flex items-center justify-center text-[#261615] dark:text-[#FDEBDE]">
              <FolderGit2 className="w-5 h-5" />
            </div>
            <ChevronRight className="w-5 h-5 text-[#261615] dark:text-[#FDEBDE] group-hover:translate-x-1 transition-transform" />
          </div>
          <div>
            <div className="font-serif font-bold text-base text-[#261615] dark:text-[#FDEBDE]">
              Production Workspace
            </div>
            <p className="text-xs text-[#5C3A38] dark:text-[#D4B8A8] mt-1 line-clamp-1 font-sans">
              Collaborative video player, frame notes & asset cloud
            </p>
          </div>
        </button>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          PROJECT OVERVIEW & SPECIFICATIONS CARD
      ───────────────────────────────────────────────────────────── */}
      <div className="bg-[#FFFDF9] dark:bg-[#201413] p-6 sm:p-7 border-2 border-[#382322] dark:border-[#FDEBDE]/30 shadow-[4px_4px_0_#382322] dark:shadow-[4px_4px_0_#000] space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-[#382322]/10 dark:border-[#FDEBDE]/10 pb-4">
          <div className="space-y-1">
            <h2 className="text-lg font-serif font-bold text-[#261615] dark:text-[#FDEBDE] flex items-center gap-2">
              <Film className="w-5 h-5 text-[#261615] dark:text-[#FFEBAA]" />
              Project Specifications & Scope
            </h2>
            <p className="text-xs text-[#5C3A38] dark:text-[#D4B8A8]">
              Core production parameters configured for this project.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-left sm:text-right">
              <span className="text-[10px] text-[#5C3A38] dark:text-[#D4B8A8] uppercase font-mono font-bold block">Total Budget</span>
              <span className="text-xl font-mono font-extrabold text-[#261615] dark:text-[#FFEBAA]">
                {project.budget}
              </span>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <span className="text-xs font-bold font-mono uppercase tracking-wider text-[#261615] dark:text-[#FDEBDE] block">Brief & Description:</span>
          <p className="text-xs sm:text-sm text-[#261615] dark:text-[#FDEBDE] leading-relaxed bg-[#FFF7F1] dark:bg-[#19100F] p-4 border-2 border-[#382322]/20 dark:border-[#FDEBDE]/20">
            {project.description || 'No detailed brief provided for this project.'}
          </p>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-[#FFF7F1] dark:bg-[#19100F] border-2 border-[#382322]/20 dark:border-[#FDEBDE]/20 space-y-1">
            <span className="text-[10px] text-[#5C3A38] dark:text-[#D4B8A8] font-mono uppercase font-bold block">Editing Style</span>
            <span className="font-bold text-[#261615] dark:text-[#FDEBDE] block truncate">{raw.editingStyle || 'Standard Production'}</span>
          </div>

          <div className="p-3 bg-[#FFF7F1] dark:bg-[#19100F] border-2 border-[#382322]/20 dark:border-[#FDEBDE]/20 space-y-1">
            <span className="text-[10px] text-[#5C3A38] dark:text-[#D4B8A8] font-mono uppercase font-bold block">Expected Video Length</span>
            <span className="font-bold text-[#261615] dark:text-[#FDEBDE] block truncate">{raw.expectedVideoDuration || `${raw.videoDuration || 0} mins`}</span>
          </div>

          <div className="p-3 bg-[#FFF7F1] dark:bg-[#19100F] border-2 border-[#382322]/20 dark:border-[#FDEBDE]/20 space-y-1">
            <span className="text-[10px] text-[#5C3A38] dark:text-[#D4B8A8] font-mono uppercase font-bold block">Turnaround Duration</span>
            <span className="font-bold text-[#261615] dark:text-[#FDEBDE] block truncate">{raw.projectDuration || raw.duration || '7 - 10 Days'}</span>
          </div>

          <div className="p-3 bg-[#FFEBAA] dark:bg-[#2A1A19] border-2 border-[#382322] dark:border-[#FDEBDE]/30 space-y-1 shadow-[2px_2px_0_#382322]">
            <span className="text-[10px] text-[#261615] dark:text-[#D4B8A8] font-mono uppercase font-bold block">Deadline</span>
            <span className="font-bold text-[#261615] dark:text-[#FFEBAA] block font-mono">{project.deadline}</span>
          </div>
        </div>

        {/* Required Skills & Reference Links */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          {Array.isArray(project.tags) && project.tags.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs font-bold font-mono uppercase tracking-wider text-[#261615] dark:text-[#FDEBDE] block">Required Skills & Tags:</span>
              <div className="flex flex-wrap gap-2">
                {project.tags.map((tag, tIdx) => (
                  <span
                    key={tIdx}
                    className="px-2.5 py-1 text-xs font-bold font-mono bg-[#FFF7F1] dark:bg-[#19100F] text-[#261615] dark:text-[#FDEBDE] border-2 border-[#382322] dark:border-[#FDEBDE]/30 shadow-[1px_1px_0_#382322] flex items-center gap-1.5"
                  >
                    <Tag className="w-3 h-3 text-[#261615] dark:text-[#FFEBAA]" />
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {Array.isArray(raw.referenceLinks) && raw.referenceLinks.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs font-bold font-mono uppercase tracking-wider text-[#261615] dark:text-[#FDEBDE] block">Reference Links:</span>
              <div className="space-y-1.5">
                {raw.referenceLinks.map((link, lIdx) => (
                  <a
                    key={lIdx}
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-[#261615] dark:text-[#FFEBAA] font-medium flex items-center gap-1.5 truncate underline decoration-[#382322]/40 hover:decoration-[#382322]"
                  >
                    <ExternalLink className="w-3.5 h-3.5 shrink-0" />
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
      <div className="bg-[#FFFDF9] dark:bg-[#201413] p-6 sm:p-7 border-2 border-[#382322] dark:border-[#FDEBDE]/30 shadow-[4px_4px_0_#382322] dark:shadow-[4px_4px_0_#000] space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-[#382322]/10 dark:border-[#FDEBDE]/10 pb-4">
          <div>
            <h3 className="text-lg font-serif font-bold text-[#261615] dark:text-[#FDEBDE] flex items-center gap-2">
              <Users className="w-5 h-5 text-[#261615] dark:text-[#FFEBAA]" />
              Project Team & Assigned Freelancers ({assignedTeam.length})
            </h3>
            <p className="text-xs text-[#5C3A38] dark:text-[#D4B8A8] mt-1 font-sans">
              Manage your hired team. Members can be removed if they were just approved and haven't started work yet, which reopens the position.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate(`/creator/create-project?step=2&projectId=${project.id}`)}
            className="px-4 py-2 bg-[#FFEBAA] hover:bg-[#ffe58f] text-[#261615] border-2 border-[#382322] shadow-[2px_2px_0_#382322] text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 shrink-0 active:translate-x-0.5 active:translate-y-0.5"
          >
            <Plus className="w-4 h-4" />
            <span>Hire Another Role</span>
          </button>
        </div>

        {/* Assigned Team Members List */}
        {assignedTeam.length > 0 ? (
          <div className="grid grid-cols-1 gap-3.5">
            {assignedTeam.map((member) => {
              const freelancer = member.freelancer || member.hiredFreelancerId;
              const fid = freelancer._id || freelancer.id;
              const milestones = Array.isArray(member.milestones) ? member.milestones : [];
              const hasStartedWork = Boolean(member.hasStartedWork);

              return (
                <div
                  key={member._id || member.hiringId || fid}
                  className="p-4 sm:p-5 bg-[#FFF7F1] dark:bg-[#19100F] border-2 border-[#382322] dark:border-[#FDEBDE]/30 shadow-[3px_3px_0_#382322] dark:shadow-[3px_3px_0_#000] flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <img
                      src={freelancer.profileImage || freelancer.avatar || DEFAULT_PFP}
                      alt={freelancer.name || 'Team member'}
                      onError={(e) => { e.currentTarget.src = DEFAULT_PFP; }}
                      className="w-12 h-12 rounded-none object-cover border-2 border-[#382322] dark:border-[#FDEBDE]/40 shadow-[2px_2px_0_#382322] shrink-0"
                    />

                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm sm:text-base font-serif font-bold text-[#261615] dark:text-[#FDEBDE] truncate">
                          {freelancer.name || freelancer.username || 'Team Member'}
                        </h4>
                        <span className="text-[10px] font-bold font-mono uppercase px-2 py-0.5 bg-[#B1C8EA] text-[#261615] border-2 border-[#382322]">
                          {member.roleTitle}
                        </span>
                        <span className="text-[10px] font-bold font-mono uppercase px-2 py-0.5 bg-[#FFEBAA] text-[#261615] border-2 border-[#382322] flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-[#261615]" />
                          Hired & Active
                        </span>
                      </div>

                      <p className="text-xs text-[#5C3A38] dark:text-[#D4B8A8] line-clamp-1 font-sans">
                        {member.description || `Assigned to handle ${member.roleTitle} deliverables.`}
                      </p>

                      <div className="flex items-center gap-3 text-[11px] text-[#5C3A38] dark:text-[#D4B8A8] pt-0.5 flex-wrap font-mono">
                        {member.hiredAt && (
                          <span>Approved: {new Date(member.hiredAt).toLocaleDateString()}</span>
                        )}
                        <span>•</span>
                        <span className={hasStartedWork ? 'text-[#261615] dark:text-[#FFEBAA] font-bold underline decoration-[#FFEBAA]' : 'text-[#5C3A38] dark:text-[#D4B8A8]'}>
                          Work Status: {hasStartedWork ? 'In Progress / Deliverables Active' : 'Not Started Yet'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-3 sm:pt-0 border-t-2 sm:border-t-0 border-[#382322]/10 dark:border-[#FDEBDE]/10">
                    <div className="text-left sm:text-right pr-2">
                      <span className="text-[10px] text-[#5C3A38] dark:text-[#D4B8A8] uppercase font-mono font-bold block">Allocated Budget</span>
                      <span className="text-base font-extrabold text-[#261615] dark:text-[#FFEBAA] font-mono">
                        ₹{Number(member.budget || 0).toLocaleString()}
                      </span>
                    </div>

                    {/* Escrow Shortcut */}
                    <button
                      type="button"
                      onClick={() => navigate(`/creator/payments?projectId=${project.id}&freelancerId=${fid}&roleId=${member.roleId || ''}&hiringId=${member.isFromHiring ? member.hiringId : ''}`)}
                      className="px-3.5 py-2 text-xs font-bold font-mono uppercase tracking-wider bg-[#B1C8EA] hover:bg-[#9cbfe6] text-[#261615] border-2 border-[#382322] shadow-[2px_2px_0_#382322] transition-all flex items-center gap-1.5 cursor-pointer shrink-0 active:translate-x-0.5 active:translate-y-0.5"
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
                        className="px-3 py-2 text-xs font-bold font-mono uppercase tracking-wider bg-rose-100 dark:bg-rose-950/40 hover:bg-rose-200 text-rose-900 dark:text-rose-300 border-2 border-[#382322] dark:border-rose-500/40 shadow-[2px_2px_0_#382322] transition-all flex items-center gap-1.5 cursor-pointer shrink-0 active:translate-x-0.5 active:translate-y-0.5"
                        title="Remove member and reopen role for applications"
                      >
                        <UserX className="w-3.5 h-3.5" />
                        <span>Remove Member</span>
                      </button>
                    ) : (
                      <span
                        className="text-[10px] text-[#261615] dark:text-[#FFEBAA] font-bold font-mono uppercase px-2.5 py-1.5 bg-[#FFEBAA]/50 dark:bg-[#FFEBAA]/10 border-2 border-[#382322] dark:border-[#FFEBAA]/40 flex items-center gap-1 shrink-0 cursor-not-allowed"
                        title="Cannot remove: Freelancer has already started submissions, deliverables, or received milestone payments."
                      >
                        <Lock className="w-3 h-3 text-[#261615] dark:text-[#FFEBAA]" />
                        <span>Work Started / Paid</span>
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 text-center space-y-3 border-2 border-dashed border-[#382322]/20 dark:border-[#FDEBDE]/20 bg-[#FFF7F1] dark:bg-[#19100F]">
            <Users className="w-8 h-8 text-[#5C3A38] dark:text-[#D4B8A8] mx-auto" />
            <p className="text-xs text-[#5C3A38] dark:text-[#D4B8A8]">
              No team members have been approved for this project yet.
            </p>
            <button
              type="button"
              onClick={() => navigate(`/creator/create-project?step=2&projectId=${project.id}`)}
              className="px-4 py-2 bg-[#FFEBAA] hover:bg-[#ffe58f] text-[#261615] border-2 border-[#382322] shadow-[2px_2px_0_#382322] text-xs font-bold uppercase tracking-wider transition-all inline-flex items-center gap-1.5 cursor-pointer active:translate-x-0.5 active:translate-y-0.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Review Applications / Post Role</span>
            </button>
          </div>
        )}

        {/* Open Hiring Positions */}
        {openPositions.length > 0 && (
          <div className="pt-4 border-t-2 border-[#382322]/10 dark:border-[#FDEBDE]/10 space-y-3">
            <h4 className="text-xs font-bold font-mono uppercase tracking-wider text-[#261615] dark:text-[#FDEBDE] flex items-center gap-2">
              <Briefcase className="w-3.5 h-3.5 text-[#261615] dark:text-[#FFEBAA]" />
              Open Positions Awaiting Team Members ({openPositions.length})
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {openPositions.map((hiring) => (
                <div
                  key={hiring._id}
                  className="p-3.5 bg-[#FFF7F1] dark:bg-[#19100F] border-2 border-[#382322]/20 dark:border-[#FDEBDE]/20 flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-[#261615] dark:text-[#FDEBDE] truncate block">
                      {hiring.roleTitle}
                    </span>
                    <span className="text-[10px] text-[#5C3A38] dark:text-[#D4B8A8] font-mono">
                      Status: Open for Applications
                    </span>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-xs font-mono font-bold text-[#261615] dark:text-[#FFEBAA] block">
                      ₹{Number(hiring.budget || 0).toLocaleString()}
                    </span>
                    <button
                      type="button"
                      onClick={() => navigate(`/creator/create-project?step=2&projectId=${project.id}`)}
                      className="text-[10px] text-[#261615] dark:text-[#FFEBAA] font-bold uppercase tracking-wider hover:underline"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-md p-6 bg-[#FFFDF9] dark:bg-[#201413] border-2 border-[#382322] dark:border-[#FDEBDE]/30 shadow-[6px_6px_0_#382322] dark:shadow-[6px_6px_0_#000] space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-rose-100 dark:bg-rose-950/50 border-2 border-[#382322] dark:border-rose-500/40 flex items-center justify-center text-rose-700 dark:text-rose-400 shrink-0">
                <UserX className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-serif font-bold text-[#261615] dark:text-[#FDEBDE]">Remove Team Member?</h3>
                <p className="text-xs text-[#5C3A38] dark:text-[#D4B8A8]">
                  {memberToRemove.freelancerName} ({memberToRemove.roleTitle})
                </p>
              </div>
            </div>

            <p className="text-xs text-[#261615] dark:text-[#FDEBDE] leading-relaxed bg-[#FFF7F1] dark:bg-[#19100F] border-2 border-[#382322]/20 dark:border-[#FDEBDE]/20 p-3.5">
              Are you sure you want to remove <strong>{memberToRemove.freelancerName}</strong> from the role{' '}
              <strong>"{memberToRemove.roleTitle}"</strong>?
              <br /><br />
              Since work has not started yet, doing so will <strong>reopen this hiring position</strong> immediately so other freelancers can apply.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setMemberToRemove(null)}
                className="px-4 py-2 border-2 border-[#382322] dark:border-[#FDEBDE]/30 text-xs font-bold font-mono uppercase tracking-wider text-[#261615] dark:text-[#FDEBDE] bg-[#FFF7F1] dark:bg-[#19100F] hover:bg-[#FDEBDE] transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={Boolean(removingHiringId)}
                onClick={handleConfirmRemoveMember}
                className="px-4 py-2 text-xs font-bold font-mono uppercase tracking-wider text-[#261615] bg-[#FFEBAA] hover:bg-[#ffe58f] border-2 border-[#382322] shadow-[2px_2px_0_#382322] transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50 active:translate-x-0.5 active:translate-y-0.5"
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
