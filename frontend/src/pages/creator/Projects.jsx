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
        return 'bg-[#FFEBAA] text-[#261615] border-2 border-[#382322] shadow-[1.5px_1.5px_0_#382322]';
      case 'Open':
        return 'bg-[#B1C8EA] text-[#261615] border-2 border-[#382322] shadow-[1.5px_1.5px_0_#382322]';
      case 'Completed':
        return 'bg-emerald-100 text-emerald-900 border-2 border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-600';
      default:
        return 'bg-[#FAF0E6] dark:bg-[#201413] text-[#261615] dark:text-[#FDEBDE] border-2 border-[#382322] dark:border-[#FDEBDE]/30';
    }
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
          <h2 className="text-2xl sm:text-3xl font-black font-serif text-[#261615] dark:text-[#FDEBDE] tracking-tight">
            Manage Projects
          </h2>
          <p className="text-xs text-[#5C3A38] dark:text-[#D4B8A8] mt-1 font-medium">
            Monitor deliverables, revisions, team hirings, and active escrow milestones
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate('/creator/create-project')}
          className="p-2.5 rounded-xl bg-[#382322] hover:bg-[#261615] text-[#FFEBAA] border-2 border-[#382322] shadow-[2.5px_2.5px_0_#FFEBAA] dark:bg-[#FFEBAA] dark:hover:bg-[#fff0c2] dark:text-[#261615] dark:border-[#FFEBAA] dark:shadow-[2.5px_2.5px_0_#000] active:translate-x-[1px] active:translate-y-[1px] transition-all cursor-pointer self-start sm:self-auto flex items-center justify-center shrink-0"
          title="Create New Project"
        >
          <Plus className="w-5 h-5 stroke-[2.5]" />
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b-2 border-[#382322]/15 dark:border-[#FDEBDE]/15 pb-3 overflow-x-auto">
        {['all', 'in-progress', 'open', 'completed'].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold capitalize whitespace-nowrap transition-all cursor-pointer active:translate-x-[1px] active:translate-y-[1px] ${
              filter === tab
                ? 'bg-[#FFEBAA] text-[#261615] border-2 border-[#382322] shadow-[2px_2px_0_#382322] dark:shadow-[2px_2px_0_#000]'
                : 'text-[#5C3A38] dark:text-[#D4B8A8] hover:text-[#261615] dark:hover:text-[#FDEBDE] hover:bg-white/40 dark:hover:bg-white/10 border-2 border-transparent'
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
        <div className="p-12 border-2 border-dashed border-[#382322]/30 dark:border-[#FDEBDE]/30 bg-white/40 dark:bg-[#261817]/40 rounded-2xl text-center space-y-3">
          <Film className="w-10 h-10 text-[#5C3A38] dark:text-[#D4B8A8] mx-auto opacity-70" />
          <p className="text-base font-bold font-serif text-[#261615] dark:text-[#FDEBDE]">
            No projects found in this category
          </p>
          <p className="text-xs text-[#5C3A38] dark:text-[#D4B8A8] max-w-sm mx-auto font-medium">
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

            return (
              <div
                key={proj.id}
                onClick={() => setSelectedProject(proj)}
                className="brutal-card p-4 sm:p-5 rounded-2xl cursor-pointer group relative space-y-3.5 transition-all duration-200"
              >
                {/* Header: Icon, Title, Format Tag, Status Badge */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-[#FFEBAA] dark:bg-[#382322] text-[#261615] dark:text-[#FFEBAA] border-2 border-[#382322] dark:border-[#FFEBAA]/40 shadow-[2px_2px_0_#382322] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-200">
                      <IconComponent className="w-5 h-5" />
                    </div>

                    <div className="min-w-0">
                      <h4 className="text-base font-bold text-[#261615] dark:text-[#FDEBDE] font-serif truncate group-hover:text-[#8A5C5A] dark:group-hover:text-[#FFEBAA] transition-colors">
                        {proj.title}
                      </h4>
                      <p className="text-[11px] text-[#5C3A38] dark:text-[#D4B8A8] mt-0.5 truncate font-medium">
                        {Array.isArray(proj.tags) ? proj.tags.join(' • ') : proj.category}
                      </p>
                    </div>
                  </div>

                  <span className={`px-2.5 py-0.5 text-[11px] font-bold rounded-lg flex items-center gap-1.5 shrink-0 ${getStatusBadge(proj.status)}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${proj.status === 'In Progress' ? 'bg-[#382322] animate-pulse' : proj.status === 'Completed' ? 'bg-emerald-600' : 'bg-blue-600'}`} />
                    {proj.status}
                  </span>
                </div>

                {/* Key Metrics: Budget, Deadline, Progress */}
                <div className="pt-2 border-t border-[#382322]/15 dark:border-[#FDEBDE]/15 flex items-center justify-between gap-2 text-xs">
                  {/* Budget */}
                  <span className="font-mono font-bold text-[#261615] dark:text-[#FFEBAA] text-sm">
                    {proj.budget}
                  </span>

                  {/* Deadline with Clock icon */}
                  <span className="flex items-center gap-1.5 text-[#5C3A38] dark:text-[#D4B8A8] text-xs font-medium">
                    <Clock className="w-3.5 h-3.5 text-[#382322] dark:text-[#FFEBAA] shrink-0" />
                    <span>{proj.deadline}</span>
                  </span>

                  {/* Progress bar */}
                  <div className="flex items-center gap-1.5">
                    <div className="w-14 sm:w-16 h-2 rounded-full bg-[#382322]/15 dark:bg-black/40 overflow-hidden border border-[#382322]/20 dark:border-white/10">
                      <div
                        className="h-full bg-[#382322] dark:bg-[#FFEBAA] rounded-full transition-all duration-300"
                        style={{ width: `${proj.progress || 0}%` }}
                      />
                    </div>
                    <span className="text-[11px] font-mono text-[#5C3A38] dark:text-[#D4B8A8] font-bold">{proj.progress || 0}%</span>
                  </div>
                </div>

                {/* Direct Action Shortcut Row on the Project Card */}
                <div className="pt-2 border-t border-[#382322]/15 dark:border-[#FDEBDE]/15 grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/creator/workspace?projectId=${proj.id}`);
                    }}
                    className="px-2 py-1.5 rounded-xl bg-[#B1C8EA] hover:bg-[#c2d7f5] text-[#261615] border-2 border-[#382322] shadow-[2px_2px_0_#382322] dark:shadow-[2px_2px_0_#000] text-[11px] font-bold flex items-center justify-center gap-1.5 active:translate-x-[1px] active:translate-y-[1px] transition-all cursor-pointer"
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
                    className="px-2 py-1.5 rounded-xl bg-[#FFEBAA] hover:bg-[#fff2cc] text-[#261615] border-2 border-[#382322] shadow-[2px_2px_0_#382322] dark:shadow-[2px_2px_0_#000] text-[11px] font-bold flex items-center justify-center gap-1.5 active:translate-x-[1px] active:translate-y-[1px] transition-all cursor-pointer"
                    title="Milestone Escrow & Payments"
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>Payments</span>
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedProject(proj);
                    }}
                    className="px-2 py-1.5 rounded-xl bg-white dark:bg-[#281B1A] hover:bg-[#FAF0E6] dark:hover:bg-[#33201F] text-[#261615] dark:text-[#FDEBDE] border-2 border-[#382322] dark:border-[#FDEBDE]/40 shadow-[2px_2px_0_#382322] dark:shadow-[2px_2px_0_#000] text-[11px] font-bold flex items-center justify-center gap-1.5 active:translate-x-[1px] active:translate-y-[1px] transition-all cursor-pointer"
                    title="Open project details to view team & manage hirings"
                  >
                    <Briefcase className="w-3.5 h-3.5" />
                    <span>Details & Team</span>
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
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in overflow-y-auto">
          <div className="w-full max-w-2xl bg-[#FFF7F1] dark:bg-[#201413] p-6 sm:p-8 border-2 border-[#382322] dark:border-[#FFEBAA]/50 shadow-[6px_6px_0_#382322] dark:shadow-[6px_6px_0_#000] rounded-2xl relative space-y-6 my-8">
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setSelectedProject(null)}
              className="absolute top-5 right-5 p-2 rounded-xl bg-white dark:bg-[#281B1A] text-[#382322] dark:text-[#FDEBDE] border-2 border-[#382322] dark:border-[#FDEBDE]/30 shadow-[2px_2px_0_#382322] hover:bg-[#FFEBAA] transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header: Status, Title, Category */}
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`px-2.5 py-0.5 rounded-lg text-[11px] font-bold ${getStatusBadge(selectedProject.status)}`}>
                  {selectedProject.status}
                </span>
                <span className="text-[11px] font-bold text-[#382322] dark:text-[#261615] bg-[#FFEBAA] px-2.5 py-0.5 rounded-md border-2 border-[#382322]">
                  {selectedProject.category}
                </span>
                {selectedProject.rawProject?.editingStyle && (
                  <span className="text-[11px] font-bold text-[#382322] dark:text-[#261615] bg-[#B1C8EA] px-2.5 py-0.5 rounded-md border-2 border-[#382322]">
                    {selectedProject.rawProject.editingStyle}
                  </span>
                )}
              </div>
              <h2 className="text-xl sm:text-2xl font-black font-serif text-[#261615] dark:text-[#FDEBDE] mt-2.5 tracking-tight">
                {selectedProject.title}
              </h2>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-white dark:bg-[#261817] border-2 border-[#382322] dark:border-[#FDEBDE]/30 shadow-[2px_2px_0_#382322] text-xs">
              <div>
                <span className="text-[11px] text-[#5C3A38] dark:text-[#D4B8A8] font-bold block">Budget</span>
                <span className="text-base font-bold font-mono text-[#261615] dark:text-[#FFEBAA] mt-0.5 block">
                  {selectedProject.budget}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-[#5C3A38] dark:text-[#D4B8A8] font-bold block">Deadline</span>
                <span className="text-sm font-semibold text-[#261615] dark:text-[#FDEBDE] mt-0.5 block truncate">
                  {selectedProject.deadline}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-[#5C3A38] dark:text-[#D4B8A8] font-bold block">Runtime</span>
                <span className="text-sm font-semibold text-[#261615] dark:text-[#FFEBAA] mt-0.5 block truncate">
                  {selectedProject.rawProject?.expectedVideoDuration || 'Standard'}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-[#5C3A38] dark:text-[#D4B8A8] font-bold block">Progress</span>
                <span className="text-sm font-bold font-mono text-[#261615] dark:text-[#FDEBDE] mt-0.5 block">
                  {selectedProject.progress}%
                </span>
              </div>
            </div>

            {/* Project Brief / Storyline Description */}
            <div className="space-y-1.5">
              <h4 className="text-xs font-bold font-serif uppercase tracking-wider text-[#382322] dark:text-[#FFEBAA]">
                Project Brief
              </h4>
              <p className="text-xs text-[#261615] dark:text-[#FDEBDE] bg-white dark:bg-[#261817] p-4 rounded-xl border-2 border-[#382322] dark:border-[#FDEBDE]/20 shadow-[2px_2px_0_#382322] leading-relaxed whitespace-pre-wrap">
                {selectedProject.description || 'No detailed brief provided for this project.'}
              </p>
            </div>

            {/* Team & Hirings Status with Freelancer Role Budgets */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold font-serif uppercase tracking-wider text-[#382322] dark:text-[#FFEBAA]">
                  Freelancer Team & Roles
                </h4>
                <button
                  type="button"
                  onClick={() => navigate(`/creator/create-project?step=2&projectId=${selectedProject.id}`)}
                  className="text-xs font-bold text-[#382322] dark:text-[#FFEBAA] hover:underline transition-colors cursor-pointer"
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
                        className="p-3 rounded-xl bg-white dark:bg-[#261817] border-2 border-[#382322] dark:border-[#FDEBDE]/30 shadow-[2px_2px_0_#382322] flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          {hasHired ? (
                            <img
                              src={freelancer.profileImage || DEFAULT_PFP}
                              alt={freelancer.name || 'Freelancer'}
                              onError={(e) => { e.currentTarget.src = DEFAULT_PFP; }}
                              className="w-8 h-8 rounded-full object-cover border-2 border-[#382322] shrink-0"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-[#FFEBAA] border-2 border-[#382322] flex items-center justify-center shrink-0">
                              <Users className="w-3.5 h-3.5 text-[#382322]" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <span className="text-xs font-bold text-[#261615] dark:text-[#FDEBDE] block truncate">
                              {hiring.roleTitle}
                            </span>
                            <span className="text-[11px] text-[#5C3A38] dark:text-[#D4B8A8] font-medium block truncate">
                              {hasHired ? (freelancer.name || freelancer.username || 'Assigned') : 'Open for applications'}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2.5 shrink-0">
                          <span className="text-xs font-mono font-bold text-[#261615] dark:text-[#FFEBAA]">
                            ₹{Number(hiring.budget || 0).toLocaleString()}
                          </span>

                          {hasHired ? (
                            <div className="flex items-center gap-1.5">
                              {isM1Funded ? (
                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold bg-[#FFEBAA] text-[#261615] border-2 border-[#382322]">
                                  <Lock className="w-2.5 h-2.5 text-[#382322]" />
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
                                  className="px-2 py-1 rounded-lg text-[11px] font-bold text-rose-700 dark:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/40 border-2 border-rose-700 transition-all flex items-center gap-1 cursor-pointer"
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
                                className="px-2 py-1 rounded-lg bg-[#FFEBAA] hover:bg-[#fff2cc] text-[#261615] border-2 border-[#382322] shadow-[1.5px_1.5px_0_#382322] text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1"
                              >
                                <CreditCard className="w-3 h-3" />
                                <span>Escrow</span>
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => navigate(`/creator/create-project?step=2&projectId=${selectedProject.id}`)}
                              className="px-2.5 py-1.5 rounded-lg bg-[#B1C8EA] hover:bg-[#c2d7f5] text-[#261615] border-2 border-[#382322] shadow-[1.5px_1.5px_0_#382322] text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1"
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
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-white dark:bg-[#261817] border-2 border-[#382322] dark:border-[#FDEBDE]/30 shadow-[2px_2px_0_#382322]">
                  <div className="flex items-center gap-3">
                    <img
                      src={selectedProject.assignedEditor?.avatar || DEFAULT_PFP}
                      alt={selectedProject.assignedEditor?.name || 'Editor'}
                      className="w-10 h-10 rounded-xl object-cover border-2 border-[#382322]"
                    />
                    <div>
                      <div className="text-xs font-bold text-[#261615] dark:text-[#FDEBDE]">
                        {selectedProject.assignedEditor ? selectedProject.assignedEditor.name : 'No Editor Assigned'}
                      </div>
                      <div className="text-[11px] text-[#5C3A38] dark:text-[#D4B8A8] font-medium">
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
                        className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-rose-700 dark:text-rose-300 border-2 border-rose-700 transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <UserMinus className="w-3.5 h-3.5" />
                        <span>Remove</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => navigate(`/creator/payments?projectId=${selectedProject.id}&freelancerId=${selectedProject.assignedEditor.id}`)}
                        className="px-3 py-1.5 rounded-lg bg-[#FFEBAA] hover:bg-[#fff2cc] text-[#261615] text-xs font-bold border-2 border-[#382322] shadow-[1.5px_1.5px_0_#382322] transition-all flex items-center gap-1.5 cursor-pointer"
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
                <h4 className="text-xs font-bold font-serif uppercase tracking-wider text-[#382322] dark:text-[#FFEBAA]">
                  Skills & Software
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {selectedProject.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg bg-[#FFEBAA] text-[#261615] border-2 border-[#382322] shadow-[1.5px_1.5px_0_#382322] text-[11px] font-bold"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Primary Action Buttons */}
            <div className="pt-2 border-t-2 border-[#382322]/15 dark:border-[#FDEBDE]/15 space-y-3">
              <h4 className="text-xs font-bold font-serif text-[#261615] dark:text-[#FDEBDE]">
                Project Actions
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => navigate(`/creator/workspace?projectId=${selectedProject.id}`)}
                  className="p-3.5 rounded-xl bg-[#B1C8EA] hover:bg-[#c2d7f5] text-[#261615] border-2 border-[#382322] shadow-[2.5px_2.5px_0_#382322] text-left transition-all cursor-pointer group space-y-1 active:translate-x-[1px] active:translate-y-[1px]"
                >
                  <div className="flex items-center justify-between text-[#261615]">
                    <FolderGit2 className="w-5 h-5 group-hover:scale-105 transition-transform" />
                    <ArrowUpRight className="w-4 h-4" />
                  </div>
                  <div className="font-bold text-xs">Project Workspace</div>
                  <p className="text-[10px] text-[#382322]/80 leading-tight">
                    Review cuts & timeline assets
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => navigate(`/creator/payments?projectId=${selectedProject.id}`)}
                  className="p-3.5 rounded-xl bg-[#FFEBAA] hover:bg-[#fff2cc] text-[#261615] border-2 border-[#382322] shadow-[2.5px_2.5px_0_#382322] text-left transition-all cursor-pointer group space-y-1 active:translate-x-[1px] active:translate-y-[1px]"
                >
                  <div className="flex items-center justify-between text-[#261615]">
                    <CreditCard className="w-5 h-5 group-hover:scale-105 transition-transform" />
                    <ArrowUpRight className="w-4 h-4" />
                  </div>
                  <div className="font-bold text-xs">Escrow & Payments</div>
                  <p className="text-[10px] text-[#382322]/80 leading-tight">
                    Manage milestones & releases
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => navigate(`/creator/create-project?step=2&projectId=${selectedProject.id}`)}
                  className="p-3.5 rounded-xl bg-white dark:bg-[#281B1A] hover:bg-[#FAF0E6] dark:hover:bg-[#33201F] text-[#261615] dark:text-[#FDEBDE] border-2 border-[#382322] dark:border-[#FDEBDE]/40 shadow-[2.5px_2.5px_0_#382322] dark:shadow-[2.5px_2.5px_0_#000] text-left transition-all cursor-pointer group space-y-1 active:translate-x-[1px] active:translate-y-[1px]"
                >
                  <div className="flex items-center justify-between text-[#382322] dark:text-[#FFEBAA]">
                    <Briefcase className="w-5 h-5 group-hover:scale-105 transition-transform" />
                    <ArrowUpRight className="w-4 h-4" />
                  </div>
                  <div className="font-bold text-xs">Manage Hirings</div>
                  <p className="text-[10px] text-[#5C3A38] dark:text-[#D4B8A8] leading-tight">
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
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-md bg-[#FFF7F1] dark:bg-[#261817] p-6 rounded-2xl border-2 border-[#382322] dark:border-[#FFEBAA]/50 shadow-[5px_5px_0_#382322] dark:shadow-[5px_5px_0_#000] relative space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-900 border-2 border-rose-900 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-rose-700" />
              </div>
              <div>
                <h3 className="text-base font-bold font-serif text-[#261615] dark:text-[#FDEBDE] tracking-tight">Remove Team Member?</h3>
                <p className="text-xs text-[#5C3A38] dark:text-[#D4B8A8] font-medium">Position will be reopened</p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-white dark:bg-[#201413] border-2 border-[#382322] dark:border-[#FDEBDE]/20 text-xs text-[#261615] dark:text-[#FDEBDE] space-y-2 leading-relaxed">
              <p>
                Are you sure you want to remove <strong className="text-[#382322] dark:text-[#FFEBAA]">{memberToRemove.memberName}</strong> from the role <strong className="text-[#382322] dark:text-[#FFEBAA]">{memberToRemove.roleTitle}</strong>?
              </p>
              <p className="text-[11px] text-[#382322] bg-[#FFEBAA] border-2 border-[#382322] p-2.5 rounded-lg font-medium">
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
                variant="reject"
                size="sm"
                onClick={handleConfirmRemove}
                disabled={isRemoving}
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
