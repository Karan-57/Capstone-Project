import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Clock,
  Briefcase,
  CreditCard,
  FolderGit2,
  ArrowUpRight,
  X,
  Users,
  Film,
  Sparkles,
  Lock,
  UserMinus,
  AlertTriangle,
  ShoppingCart,
  Smartphone,
  BarChart3
} from 'lucide-react';
import Button from '../../components/common/Button';
import { SkeletonProjectCard } from '../../components/common/Skeleton';
import SEO from '../../components/common/SEO';
import { projectService } from '../../services/projectService';
import { useAlert } from '../../context/AlertContext';
import { DEFAULT_PFP } from '../../constants/assets';

const iconMap = {
  'shopping-cart': ShoppingCart,
  'smartphone': Smartphone,
  'layout': BarChart3,
  'film': Film,
};

export const Projects = () => {
  const navigate = useNavigate();
  const { showAlert } = useAlert();
  const [filter, setFilter] = useState('all');
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState(null);

  // Freelancer removal state & confirmation modal
  const [memberToRemove, setMemberToRemove] = useState(null);
  const [isRemoving, setIsRemoving] = useState(false);

  const loadProjects = async () => {
    setLoading(true);
    const data = await projectService.getCreatorProjects();
    setProjects(data || []);
    setLoading(false);
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const handleConfirmRemove = async () => {
    if (!memberToRemove) return;
    setIsRemoving(true);
    try {
      const res = await projectService.removeTeamMember(memberToRemove.projectId, memberToRemove.hiringId);
      showAlert(res.message || 'Freelancer removed. Position has been reopened!', 'success');
      setMemberToRemove(null);
      if (selectedProject && selectedProject.id === memberToRemove.projectId) {
        setSelectedProject(null);
      }
      await loadProjects();
    } catch (err) {
      console.error('Failed to remove member:', err);
      showAlert(
        err.response?.data?.message || err.message || 'Cannot remove freelancer: milestone 1 deliverables or escrow payments have commenced.',
        'error'
      );
    } finally {
      setIsRemoving(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'In Progress':
        return 'bg-amber-500/15 text-amber-300 border border-amber-500/30';
      case 'Open':
        return 'bg-blue-500/15 text-blue-300 border border-blue-500/30';
      case 'Completed':
        return 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30';
      default:
        return 'bg-slate-800 text-slate-300 border border-white/10';
    }
  };

  // Helper to extract assigned team members & milestone 1 funded check for a project
  const getProjectAssignedMembers = (proj) => {
    const assigned = [];
    if (Array.isArray(proj.hirings)) {
      proj.hirings.forEach((h) => {
        if (h.hiredFreelancerId || h.status === 'hired') {
          const freelancer =
            typeof h.hiredFreelancerId === 'object' && h.hiredFreelancerId
              ? h.hiredFreelancerId
              : { name: 'Assigned Freelancer', profileImage: DEFAULT_PFP, _id: h.hiredFreelancerId };

          const m1 = h.milestones?.[0];
          let isM1Funded =
            m1 &&
            (m1.status === 'funded' ||
              m1.status === 'in_escrow' ||
              m1.status === 'submitted' ||
              m1.status === 'approved' ||
              m1.status === 'released');

          // Local storage check fallback
          const fid = freelancer._id || freelancer.id;
          if (!isM1Funded && fid) {
            try {
              const saved = localStorage.getItem(`collabo_milestones_${proj.id}_${fid}`);
              if (saved) {
                const parsed = JSON.parse(saved);
                if (
                  Array.isArray(parsed) &&
                  parsed[0] &&
                  (parsed[0].status === 'funded' || parsed[0].status === 'submitted' || parsed[0].status === 'approved')
                ) {
                  isM1Funded = true;
                }
              }
            } catch (e) {}
          }

          assigned.push({
            hiringId: h._id,
            roleTitle: h.roleTitle || 'Freelancer',
            freelancer,
            isM1Funded,
            budget: h.budget,
          });
        }
      });
    }

    if (
      proj.assignedEditor &&
      !assigned.some((m) => (m.freelancer?._id || m.freelancer?.id) === (proj.assignedEditor._id || proj.assignedEditor.id))
    ) {
      const m1 = proj.rawProject?.milestones?.[0];
      const isM1Funded =
        m1 &&
        (m1.status === 'funded' ||
          m1.status === 'in_escrow' ||
          m1.status === 'submitted' ||
          m1.status === 'approved' ||
          m1.status === 'released');

      assigned.push({
        hiringId: 'selected_editor',
        roleTitle: 'Lead Video Editor',
        freelancer: proj.assignedEditor,
        isM1Funded,
        budget: proj.rawBudget,
      });
    }

    return assigned;
  };

  const filtered = projects.filter((p) => {
    if (filter === 'all') return true;
    return p.status.toLowerCase().replace(' ', '-') === filter;
  });

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      <SEO
        title="Manage Projects"
        description="Monitor deliverables, milestones, team hirings, and active video editing pipelines."
      />

      {/* Header with Title and '+' Create Project Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Manage Projects</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Monitor deliverables, revisions, team hirings, and active escrow milestones
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate('/creator/create-project')}
          className="p-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-900/40 transition-all cursor-pointer self-start sm:self-auto flex items-center justify-center shrink-0"
          title="Create New Project"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-white/[0.06] pb-3 overflow-x-auto">
        {['all', 'in-progress', 'open', 'completed'].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold capitalize whitespace-nowrap transition-all cursor-pointer ${
              filter === tab
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
            }`}
          >
            {tab.replace('-', ' ')}
          </button>
        ))}
      </div>

      {/* Projects Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SkeletonProjectCard />
          <SkeletonProjectCard />
          <SkeletonProjectCard />
          <SkeletonProjectCard />
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 border-2 border-dashed border-white/10 rounded-2xl text-center space-y-3">
          <Film className="w-10 h-10 text-slate-600 mx-auto" />
          <p className="text-sm font-bold text-slate-300">No projects found in this category</p>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Create a new production brief to hire video editors and freelancers.
          </p>
          <Button
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={() => navigate('/creator/create-project')}
          >
            Create First Project
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((proj) => {
            const IconComponent = iconMap[proj.iconType] || Film;
            const assignedMembers = getProjectAssignedMembers(proj);

            return (
              <div
                key={proj.id}
                onClick={() => setSelectedProject(proj)}
                className="glass-card p-4 sm:p-5 rounded-2xl border border-white/[0.06] hover:border-purple-500/40 transition-all duration-300 cursor-pointer group shadow-lg hover:shadow-purple-950/20 relative space-y-3.5"
              >
                {/* Header: Icon, Title, Format Tag, Status Badge */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${proj.iconBg || 'bg-purple-500/15 text-purple-400'} group-hover:scale-105 transition-transform duration-300 shadow-inner`}>
                      <IconComponent className="w-5 h-5" />
                    </div>

                    <div className="min-w-0">
                      <h4 className="text-sm font-bold text-white truncate group-hover:text-purple-300 transition-colors">
                        {proj.title}
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-0.5 truncate font-medium">
                        {Array.isArray(proj.tags) ? proj.tags.join(' • ') : proj.category}
                      </p>
                    </div>
                  </div>

                  <span className={`px-2.5 py-0.5 text-[11px] font-bold rounded-full flex items-center gap-1.5 shrink-0 ${getStatusBadge(proj.status)}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${proj.status === 'In Progress' ? 'bg-amber-400 animate-pulse' : proj.status === 'Completed' ? 'bg-emerald-400' : 'bg-blue-400'}`} />
                    {proj.status}
                  </span>
                </div>

                {/* Key Metrics: Budget, Deadline, Progress (No redundant labels) */}
                <div className="pt-2 border-t border-white/[0.04] flex items-center justify-between gap-2 text-xs">
                  {/* Budget */}
                  <span className="font-mono font-bold text-emerald-400 text-sm">
                    {proj.budget}
                  </span>

                  {/* Deadline with Clock icon */}
                  <span className="flex items-center gap-1.5 text-slate-300 text-xs">
                    <Clock className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                    <span>{proj.deadline}</span>
                  </span>

                  {/* Progress bar */}
                  <div className="flex items-center gap-1.5">
                    <div className="w-14 sm:w-16 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-purple-500 to-indigo-400 rounded-full"
                        style={{ width: `${proj.progress || 0}%` }}
                      />
                    </div>
                    <span className="text-[11px] font-mono text-slate-400 font-semibold">{proj.progress || 0}%</span>
                  </div>
                </div>

                {/* Assigned Freelancers Section with Milestone 1 Removal Option */}
                <div className="pt-2 border-t border-white/[0.04] space-y-1.5">
                  {assignedMembers.length === 0 ? (
                    <div className="flex items-center justify-between text-[11px] px-2.5 py-1 rounded-xl bg-white/[0.02] border border-white/[0.04] text-slate-400">
                      <span className="inline-flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                        Unassigned
                      </span>
                      <span className="text-purple-400 font-medium">Position open</span>
                    </div>
                  ) : (
                    assignedMembers.map((m, mIdx) => (
                      <div
                        key={mIdx}
                        className="flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-xl bg-white/[0.02] border border-white/[0.04]"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <img
                            src={m.freelancer.profileImage || m.freelancer.avatar || DEFAULT_PFP}
                            alt={m.freelancer.name || 'Freelancer'}
                            onError={(e) => { e.currentTarget.src = DEFAULT_PFP; }}
                            className="w-5 h-5 rounded-full object-cover border border-purple-500/40 shrink-0"
                          />
                          <span className="text-xs font-semibold text-white truncate max-w-[120px]">
                            {m.freelancer.name || 'Assigned'}
                          </span>
                          <span className="text-[10px] text-purple-300 bg-purple-950/60 border border-purple-800/30 px-1.5 py-0.2 rounded font-medium truncate">
                            {m.roleTitle}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {m.isM1Funded ? (
                            <span
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/25"
                              title="Milestone 1 is funded in escrow. Member cannot be removed."
                            >
                              <Lock className="w-2.5 h-2.5 text-amber-400" />
                              <span>M1 Funded</span>
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setMemberToRemove({
                                  projectId: proj.id,
                                  hiringId: m.hiringId,
                                  memberName: m.freelancer.name || 'Freelancer',
                                  roleTitle: m.roleTitle,
                                });
                              }}
                              className="px-2 py-0.5 text-[11px] font-semibold rounded-md text-rose-400 hover:text-white hover:bg-rose-500/20 border border-rose-500/30 transition-all flex items-center gap-1 cursor-pointer"
                              title="Remove assigned freelancer (M1 not funded)"
                            >
                              <UserMinus className="w-3 h-3" />
                              <span>Remove</span>
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Direct Action Shortcut Row on the Project Card */}
                <div className="pt-2 border-t border-white/[0.04] grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/creator/workspace?projectId=${proj.id}`);
                    }}
                    className="px-2 py-1.5 rounded-xl bg-indigo-600/10 hover:bg-indigo-600/25 text-indigo-300 hover:text-white border border-indigo-500/30 text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm"
                    title="Collaborative workspace"
                  >
                    <FolderGit2 className="w-3.5 h-3.5" />
                    <span>Workspace</span>
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/creator/payments?projectId=${proj.id}`);
                    }}
                    className="px-2 py-1.5 rounded-xl bg-emerald-600/10 hover:bg-emerald-600/25 text-emerald-300 hover:text-white border border-emerald-500/30 text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm"
                    title="Milestone Escrow & Payments"
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>Payments</span>
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/creator/create-project?step=2&projectId=${proj.id}`);
                    }}
                    className="px-2 py-1.5 rounded-xl bg-purple-600/10 hover:bg-purple-600/25 text-purple-300 hover:text-white border border-purple-500/30 text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm"
                    title="Manage role hirings"
                  >
                    <Briefcase className="w-3.5 h-3.5" />
                    <span>Hirings</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* DETAILED PROJECT MODAL (Triggered by clicking on a project)               */}
      {/* ========================================================================= */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in overflow-y-auto">
          <div className="w-full max-w-2xl glass-card p-6 sm:p-8 border border-purple-500/40 shadow-2xl relative space-y-6 my-8">
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setSelectedProject(null)}
              className="absolute top-5 right-5 p-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header: Status, Title, Category */}
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${getStatusBadge(selectedProject.status)}`}>
                  {selectedProject.status}
                </span>
                <span className="text-[11px] font-semibold text-purple-300 bg-purple-950/50 px-2 py-0.5 rounded-md border border-purple-800/30">
                  {selectedProject.category}
                </span>
                {selectedProject.rawProject?.editingStyle && (
                  <span className="text-[11px] font-semibold text-indigo-300 bg-indigo-950/50 px-2 py-0.5 rounded-md border border-indigo-800/30">
                    {selectedProject.rawProject.editingStyle}
                  </span>
                )}
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white mt-2 tracking-tight">
                {selectedProject.title}
              </h2>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-[#141A28]/80 border border-white/[0.06] text-xs">
              <div>
                <span className="text-[11px] text-slate-400 block">Budget</span>
                <span className="text-sm font-bold text-emerald-400 mt-0.5 block">
                  {selectedProject.budget}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block">Deadline</span>
                <span className="text-sm font-semibold text-white mt-0.5 block truncate">
                  {selectedProject.deadline}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block">Runtime</span>
                <span className="text-sm font-semibold text-purple-300 mt-0.5 block truncate">
                  {selectedProject.rawProject?.expectedVideoDuration || 'Standard'}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block">Progress</span>
                <span className="text-sm font-bold text-white mt-0.5 block">
                  {selectedProject.progress}%
                </span>
              </div>
            </div>

            {/* Project Brief / Storyline Description */}
            <div className="space-y-1.5">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Project Brief
              </h4>
              <p className="text-xs text-slate-300 bg-[#141A28]/50 p-4 rounded-xl border border-white/[0.05] leading-relaxed whitespace-pre-wrap">
                {selectedProject.description || 'No detailed brief provided for this project.'}
              </p>
            </div>

            {/* Team & Hirings Status with Freelancer Role Budgets */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Freelancer Team & Roles
                </h4>
                <button
                  type="button"
                  onClick={() => navigate(`/creator/create-project?step=2&projectId=${selectedProject.id}`)}
                  className="text-[11px] font-semibold text-purple-400 hover:text-purple-300 transition-colors cursor-pointer"
                >
                  + Add Role
                </button>
              </div>

              {Array.isArray(selectedProject.hirings) && selectedProject.hirings.length > 0 ? (
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {selectedProject.hirings.map((hiring, hIdx) => {
                    const freelancer = hiring.hiredFreelancerId;
                    const hasHired = Boolean(freelancer);
                    const m1 = hiring.milestones?.[0];
                    const isM1Funded =
                      m1 &&
                      (m1.status === 'funded' ||
                        m1.status === 'in_escrow' ||
                        m1.status === 'submitted' ||
                        m1.status === 'approved' ||
                        m1.status === 'released');

                    return (
                      <div
                        key={hiring._id || hIdx}
                        className="p-3 rounded-xl bg-[#141A28]/70 border border-white/[0.06] flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          {hasHired ? (
                            <img
                              src={freelancer.profileImage || DEFAULT_PFP}
                              alt={freelancer.name || 'Freelancer'}
                              onError={(e) => { e.currentTarget.src = DEFAULT_PFP; }}
                              className="w-8 h-8 rounded-full object-cover border border-purple-500/40 shrink-0"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-purple-950/60 border border-purple-800/40 flex items-center justify-center shrink-0">
                              <Users className="w-3.5 h-3.5 text-purple-400" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <span className="text-xs font-bold text-white block truncate">
                              {hiring.roleTitle}
                            </span>
                            <span className="text-[11px] text-slate-400 block truncate">
                              {hasHired ? (freelancer.name || freelancer.username || 'Assigned') : 'Open for applications'}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2.5 shrink-0">
                          <span className="text-xs font-mono font-bold text-emerald-400">
                            ₹{Number(hiring.budget || 0).toLocaleString()}
                          </span>

                          {hasHired ? (
                            <div className="flex items-center gap-1.5">
                              {isM1Funded ? (
                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/25">
                                  <Lock className="w-2.5 h-2.5 text-amber-400" />
                                  <span>M1 Funded</span>
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setMemberToRemove({
                                      projectId: selectedProject.id,
                                      hiringId: hiring._id,
                                      memberName: freelancer.name || 'Freelancer',
                                      roleTitle: hiring.roleTitle,
                                    });
                                  }}
                                  className="px-2 py-1 rounded-lg text-[11px] font-semibold text-rose-400 hover:text-white hover:bg-rose-500/20 border border-rose-500/30 transition-all flex items-center gap-1 cursor-pointer"
                                  title="Remove member (Milestone 1 not funded)"
                                >
                                  <UserMinus className="w-3 h-3" />
                                  <span>Remove</span>
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={() => {
                                  const fid = freelancer._id || freelancer.id || freelancer;
                                  navigate(`/creator/payments?projectId=${selectedProject.id}&freelancerId=${fid}&roleId=${hiring.roleId || ''}&hiringId=${hiring._id || ''}`);
                                }}
                                className="px-2 py-1 rounded-lg bg-emerald-600/15 hover:bg-emerald-600/25 border border-emerald-500/30 text-emerald-300 hover:text-white text-[11px] font-semibold transition-all cursor-pointer flex items-center gap-1"
                              >
                                <CreditCard className="w-3 h-3" />
                                <span>Escrow</span>
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => navigate(`/creator/create-project?step=2&projectId=${selectedProject.id}`)}
                              className="px-2.5 py-1.5 rounded-lg bg-purple-600/15 hover:bg-purple-600/25 border border-purple-500/30 text-purple-300 hover:text-white text-[11px] font-semibold transition-all cursor-pointer flex items-center gap-1"
                            >
                              <Briefcase className="w-3 h-3" />
                              <span>Hire</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-[#141A28]/70 border border-white/[0.06]">
                  <div className="flex items-center gap-3">
                    <img
                      src={selectedProject.assignedEditor?.avatar || DEFAULT_PFP}
                      alt={selectedProject.assignedEditor?.name || 'Editor'}
                      className="w-10 h-10 rounded-xl object-cover border border-purple-500/40"
                    />
                    <div>
                      <div className="text-xs font-bold text-white">
                        {selectedProject.assignedEditor ? selectedProject.assignedEditor.name : 'No Editor Assigned'}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {selectedProject.assignedEditor ? 'Lead Video Editor' : 'Open for applications'}
                      </div>
                    </div>
                  </div>

                  {selectedProject.assignedEditor && (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setMemberToRemove({
                            projectId: selectedProject.id,
                            hiringId: 'selected_editor',
                            memberName: selectedProject.assignedEditor.name || 'Lead Editor',
                            roleTitle: 'Lead Video Editor',
                          });
                        }}
                        className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-rose-400 hover:text-white hover:bg-rose-500/20 border border-rose-500/30 transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <UserMinus className="w-3.5 h-3.5" />
                        <span>Remove</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => navigate(`/creator/payments?projectId=${selectedProject.id}&freelancerId=${selectedProject.assignedEditor.id}`)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600/15 hover:bg-emerald-600/25 text-xs font-semibold text-emerald-300 hover:text-white border border-emerald-500/30 transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <CreditCard className="w-3.5 h-3.5" />
                        <span>Escrow</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Required Skills */}
            {Array.isArray(selectedProject.tags) && selectedProject.tags.length > 0 && (
              <div className="space-y-1.5">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Skills & Software
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {selectedProject.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg bg-purple-950/40 text-purple-300 border border-purple-800/30 text-[11px] font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Primary Action Buttons */}
            <div className="pt-2 border-t border-white/[0.06] space-y-3">
              <h4 className="text-xs font-bold text-slate-200">
                Project Actions
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => navigate(`/creator/workspace?projectId=${selectedProject.id}`)}
                  className="p-3.5 rounded-xl bg-indigo-600/15 hover:bg-indigo-600/25 border border-indigo-500/40 text-left transition-all cursor-pointer group space-y-1"
                >
                  <div className="flex items-center justify-between text-indigo-300">
                    <FolderGit2 className="w-5 h-5 text-indigo-400 group-hover:scale-105 transition-transform" />
                    <ArrowUpRight className="w-4 h-4 text-indigo-400" />
                  </div>
                  <div className="font-bold text-xs text-white">Project Workspace</div>
                  <p className="text-[10px] text-slate-400 leading-tight">
                    Review cuts & timeline assets
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => navigate(`/creator/payments?projectId=${selectedProject.id}`)}
                  className="p-3.5 rounded-xl bg-emerald-600/15 hover:bg-emerald-600/25 border border-emerald-500/40 text-left transition-all cursor-pointer group space-y-1"
                >
                  <div className="flex items-center justify-between text-emerald-300">
                    <CreditCard className="w-5 h-5 text-emerald-400 group-hover:scale-105 transition-transform" />
                    <ArrowUpRight className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="font-bold text-xs text-white">Escrow & Payments</div>
                  <p className="text-[10px] text-slate-400 leading-tight">
                    Manage milestones & releases
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => navigate(`/creator/create-project?step=2&projectId=${selectedProject.id}`)}
                  className="p-3.5 rounded-xl bg-purple-600/15 hover:bg-purple-600/25 border border-purple-500/40 text-left transition-all cursor-pointer group space-y-1"
                >
                  <div className="flex items-center justify-between text-purple-300">
                    <Briefcase className="w-5 h-5 text-purple-400 group-hover:scale-105 transition-transform" />
                    <ArrowUpRight className="w-4 h-4 text-purple-400" />
                  </div>
                  <div className="font-bold text-xs text-white">Manage Hirings</div>
                  <p className="text-[10px] text-slate-400 leading-tight">
                    Post roles & assemble team
                  </p>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* CONFIRMATION MODAL FOR REMOVING ASSIGNED FREELANCER                      */}
      {/* ========================================================================= */}
      {memberToRemove && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-md glass-card p-6 rounded-2xl border border-rose-500/40 shadow-2xl relative space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-rose-400" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white tracking-tight">Remove Team Member?</h3>
                <p className="text-xs text-slate-400">Position will be reopened</p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#0E1322] border border-white/[0.06] text-xs text-slate-300 space-y-2 leading-relaxed">
              <p>
                Are you sure you want to remove <strong className="text-white">{memberToRemove.memberName}</strong> from the role <strong className="text-purple-300">{memberToRemove.roleTitle}</strong>?
              </p>
              <p className="text-[11px] text-amber-300/90 bg-amber-500/10 border border-amber-500/20 p-2.5 rounded-lg">
                💡 <strong>Milestone Status:</strong> The first milestone has not been funded in escrow yet. Removing this freelancer will reopen the position for other applicants.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMemberToRemove(null)}
                disabled={isRemoving}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleConfirmRemove}
                disabled={isRemoving}
                className="bg-rose-600 hover:bg-rose-500 text-white font-semibold"
              >
                {isRemoving ? 'Removing...' : 'Confirm Removal'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;
