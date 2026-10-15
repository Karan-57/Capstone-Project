import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  DollarSign,
  Clock,
  Briefcase,
  CreditCard,
  FolderGit2,
  ArrowUpRight,
  X,
  ExternalLink,
  Users,
  Film,
  CheckCircle2,
  Layers,
  Sparkles,
  MessageSquare,
  ShieldCheck,
  ChevronRight,
  Eye,
  Sliders
} from 'lucide-react';
import Button from '../../components/common/Button';
import ProjectCard from '../../components/common/ProjectCard';
import { SkeletonProjectCard } from '../../components/common/Skeleton';
import SEO from '../../components/common/SEO';
import { projectService } from '../../services/projectService';
import { DEFAULT_PFP } from '../../constants/assets';

export const Projects = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all');
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState(null);

  const loadProjects = async () => {
    setLoading(true);
    const data = await projectService.getCreatorProjects();
    setProjects(data || []);
    setLoading(false);
  };

  useEffect(() => {
    loadProjects();
  }, []);

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
          {filtered.map((proj) => (
            <div
              key={proj.id}
              onClick={() => navigate(`/creator/projects/${proj.id}`)}
              className="glass-card p-5 space-y-3.5 border border-white/[0.06] hover:border-purple-500/40 transition-all duration-300 cursor-pointer group shadow-lg hover:shadow-purple-950/20 relative"
            >
              <ProjectCard project={proj} onView={() => navigate(`/creator/projects/${proj.id}`)} />

              <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-white/[0.04]">
                <span className="flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                  Budget: <strong className="text-white font-semibold">{proj.budget}</strong>
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-purple-400" />
                  Deadline: {proj.deadline}
                </span>
              </div>

              {/* Freelancers & Role Budgets Sub-List */}
              {(() => {
                const hiringsList = Array.isArray(proj.hirings) ? proj.hirings : [];
                const assignedEditor = proj.assignedEditor;
                const isEditorInHirings = assignedEditor && hiringsList.some((h) => {
                  const fid = h.hiredFreelancerId?._id || h.hiredFreelancerId?.id || h.hiredFreelancerId;
                  return fid && fid.toString() === (assignedEditor.id || assignedEditor._id || '').toString();
                });

                const combinedItems = [
                  ...hiringsList.map((hiring, hIdx) => ({
                    key: hiring._id || `hiring_${hIdx}`,
                    title: hiring.roleTitle,
                    freelancer: hiring.hiredFreelancerId,
                    budget: hiring.budget,
                    roleId: hiring.roleId,
                    hiringId: hiring._id,
                    hasHired: Boolean(hiring.hiredFreelancerId),
                    isHiring: true,
                  })),
                  ...(!isEditorInHirings && assignedEditor
                    ? [
                        {
                          key: 'lead_editor',
                          title: 'Lead Video Editor',
                          freelancer: {
                            _id: assignedEditor.id,
                            id: assignedEditor.id,
                            name: assignedEditor.name,
                            username: assignedEditor.username,
                            profileImage: assignedEditor.avatar || assignedEditor.profileImage,
                          },
                          budget:
                            proj.totalBudget ||
                            (typeof proj.rawBudget === 'number'
                              ? proj.rawBudget
                              : proj.rawBudget?.fixed
                              ? proj.rawBudget.fixed
                              : 0),
                          roleId: 'video_editor',
                          hiringId: null,
                          hasHired: true,
                          isHiring: false,
                        },
                      ]
                    : []),
                ];

                if (combinedItems.length === 0) return null;

                return (
                  <div className="space-y-1.5 pt-2 border-t border-white/[0.04]">
                    <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400">
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3 text-purple-400" />
                        Assigned Freelancers & Roles ({combinedItems.length})
                      </span>
                      <span className="text-[10px] text-slate-500">Click to view escrow</span>
                    </div>
                    <div className="space-y-1">
                      {combinedItems.map((item) => {
                        const freelancer = item.freelancer;
                        const hasHired = item.hasHired && Boolean(freelancer);
                        return (
                          <div
                            key={item.key}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (hasHired) {
                                const fid = freelancer._id || freelancer.id;
                                navigate(
                                  `/creator/payments?projectId=${proj.id}&freelancerId=${fid}&roleId=${item.roleId || ''}&hiringId=${item.hiringId || ''}`
                                );
                              } else {
                                navigate(`/creator/create-project?step=2&projectId=${proj.id}`);
                              }
                            }}
                            className="p-2 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.04] hover:border-purple-500/30 flex items-center justify-between text-xs transition-all cursor-pointer group/hiring"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              {hasHired ? (
                                <img
                                  src={freelancer.profileImage || freelancer.avatar || DEFAULT_PFP}
                                  alt={freelancer.name || 'Freelancer'}
                                  onError={(e) => { e.currentTarget.src = DEFAULT_PFP; }}
                                  className="w-5 h-5 rounded-full object-cover border border-purple-500/40 shrink-0"
                                />
                              ) : (
                                <div className="w-5 h-5 rounded-full bg-purple-950/60 border border-purple-800/40 flex items-center justify-center shrink-0">
                                  <Users className="w-2.5 h-2.5 text-purple-400" />
                                </div>
                              )}
                              <div className="min-w-0">
                                <span className="font-medium text-white truncate block group-hover/hiring:text-purple-300">
                                  {item.title}
                                </span>
                                <span className="text-[10px] text-slate-400 block truncate">
                                  {hasHired ? (freelancer.name || freelancer.username || 'Assigned') : 'Open for applications'}
                                </span>
                              </div>
                            </div>

                            <div className="text-right shrink-0 ml-2">
                              <span className="font-mono font-bold text-emerald-400 block text-xs">
                                ₹{Number(item.budget || 0).toLocaleString()}
                              </span>
                              <span className="text-[9px] text-purple-400/80 group-hover/hiring:text-purple-300 flex items-center justify-end gap-0.5">
                                {hasHired ? 'Escrow →' : 'Hiring →'}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}

              {/* Direct Action Shortcut Row on the Project Card */}
              <div className="pt-2 border-t border-white/[0.04] grid grid-cols-3 gap-2">
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
                    navigate(`/creator/workspace?projectId=${proj.id}`);
                  }}
                  className="px-2 py-1.5 rounded-xl bg-indigo-600/10 hover:bg-indigo-600/25 text-indigo-300 hover:text-white border border-indigo-500/30 text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm"
                  title="Collaborative workspace"
                >
                  <FolderGit2 className="w-3.5 h-3.5" />
                  <span>Workspace</span>
                </button>
              </div>
            </div>
          ))}
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
                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                  selectedProject.status === 'In Progress'
                    ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                    : selectedProject.status === 'Completed'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-blue-500/15 text-blue-300 border border-blue-500/30'
                }`}>
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
                <span className="text-[11px] text-slate-400 block">Total Budget</span>
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
                <span className="text-[11px] text-slate-400 block">Target Runtime</span>
                <span className="text-sm font-semibold text-purple-300 mt-0.5 block truncate">
                  {selectedProject.rawProject?.expectedVideoDuration || 'Standard'}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block">Progress</span>
                <span className="text-sm font-bold text-white mt-0.5 block">
                  {selectedProject.progress}% Done
                </span>
              </div>
            </div>

            {/* Project Brief / Storyline Description */}
            <div className="space-y-1.5">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Project Brief & Description
              </h4>
              <p className="text-xs text-slate-300 bg-[#141A28]/50 p-4 rounded-xl border border-white/[0.05] leading-relaxed whitespace-pre-wrap">
                {selectedProject.description || 'No detailed brief provided for this project.'}
              </p>
            </div>

            {/* Team & Hirings Status with Freelancer Role Budgets */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Freelancer Team & Roles ({Array.isArray(selectedProject.hirings) ? selectedProject.hirings.length : (selectedProject.assignedEditor ? 1 : 0)})
                </h4>
                <button
                  type="button"
                  onClick={() => navigate(`/creator/create-project?step=2&projectId=${selectedProject.id}`)}
                  className="text-[11px] font-semibold text-purple-400 hover:text-purple-300 transition-colors"
                >
                  + Add Role
                </button>
              </div>

              {Array.isArray(selectedProject.hirings) && selectedProject.hirings.length > 0 ? (
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {selectedProject.hirings.map((hiring, hIdx) => {
                    const freelancer = hiring.hiredFreelancerId;
                    const hasHired = Boolean(freelancer);
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
                              {hasHired ? (freelancer.name || freelancer.username || 'Assigned') : 'Open for freelancer applications'}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <div className="text-right">
                            <span className="text-xs font-mono font-bold text-emerald-400 block">
                              ₹{Number(hiring.budget || 0).toLocaleString()}
                            </span>
                            <span className="text-[10px] text-slate-500 block">Role Budget</span>
                          </div>

                          {hasHired ? (
                            <button
                              type="button"
                              onClick={() => {
                                const fid = freelancer._id || freelancer.id || freelancer;
                                navigate(`/creator/payments?projectId=${selectedProject.id}&freelancerId=${fid}&roleId=${hiring.roleId || ''}&hiringId=${hiring._id || ''}`);
                              }}
                              className="px-2.5 py-1.5 rounded-lg bg-emerald-600/15 hover:bg-emerald-600/25 border border-emerald-500/30 text-emerald-300 hover:text-white text-[11px] font-semibold transition-all cursor-pointer flex items-center gap-1"
                            >
                              <CreditCard className="w-3 h-3" />
                              <span>Escrow</span>
                            </button>
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
                        {selectedProject.assignedEditor ? selectedProject.assignedEditor.name : 'No Lead Editor Assigned'}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {selectedProject.assignedEditor ? 'Lead Video Editor' : 'Open for freelancer applications'}
                      </div>
                    </div>
                  </div>

                  {selectedProject.assignedEditor && (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => navigate(`/creator/payments?projectId=${selectedProject.id}&freelancerId=${selectedProject.assignedEditor.id}`)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600/15 hover:bg-emerald-600/25 text-xs font-semibold text-emerald-300 hover:text-white border border-emerald-500/30 transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <CreditCard className="w-3.5 h-3.5" />
                        <span>Escrow</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => navigate('/creator/messages')}
                        className="px-3 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] text-xs font-semibold text-purple-300 hover:text-white transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Message</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Required Skills & Software */}
            {Array.isArray(selectedProject.tags) && selectedProject.tags.length > 0 && (
              <div className="space-y-1.5">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Required Software & Skills
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

            {/* ======================================================= */}
            {/* PRIMARY REDIRECTION & ACTION BUTTONS                    */}
            {/* ======================================================= */}
            <div className="pt-2 border-t border-white/[0.06] space-y-3">
              <h4 className="text-xs font-bold text-slate-200">
                Project Actions & Next Steps
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* 1. Continue Hiring */}
                <button
                  type="button"
                  onClick={() => navigate(`/creator/create-project?step=2&projectId=${selectedProject.id}`)}
                  className="p-3.5 rounded-xl bg-purple-600/15 hover:bg-purple-600/25 border border-purple-500/40 text-left transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer group space-y-1.5"
                >
                  <div className="flex items-center justify-between text-purple-300">
                    <Briefcase className="w-5 h-5 text-purple-400 group-hover:translate-x-0.5 transition-transform" />
                    <ArrowUpRight className="w-4 h-4 text-purple-400" />
                  </div>
                  <div className="font-bold text-xs text-white">Continue Hiring</div>
                  <p className="text-[10px] text-slate-400 leading-tight">
                    Post roles, review applications & assemble team
                  </p>
                </button>

                {/* 2. Pay Editors & Escrow */}
                <button
                  type="button"
                  onClick={() => navigate(`/creator/payments?projectId=${selectedProject.id}`)}
                  className="p-3.5 rounded-xl bg-emerald-600/15 hover:bg-emerald-600/25 border border-emerald-500/40 text-left transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer group space-y-1.5"
                >
                  <div className="flex items-center justify-between text-emerald-300">
                    <CreditCard className="w-5 h-5 text-emerald-400 group-hover:translate-x-0.5 transition-transform" />
                    <ArrowUpRight className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="font-bold text-xs text-white">Pay Editors & Escrow</div>
                  <p className="text-[10px] text-slate-400 leading-tight">
                    Inspect escrow locks, authorize milestones & releases
                  </p>
                </button>

                {/* 3. Open Workspace */}
                <button
                  type="button"
                  onClick={() => navigate(`/creator/workspace?projectId=${selectedProject.id}`)}
                  className="p-3.5 rounded-xl bg-indigo-600/15 hover:bg-indigo-600/25 border border-indigo-500/40 text-left transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer group space-y-1.5"
                >
                  <div className="flex items-center justify-between text-indigo-300">
                    <FolderGit2 className="w-5 h-5 text-indigo-400 group-hover:translate-x-0.5 transition-transform" />
                    <ArrowUpRight className="w-4 h-4 text-indigo-400" />
                  </div>
                  <div className="font-bold text-xs text-white">Project Workspace</div>
                  <p className="text-[10px] text-slate-400 leading-tight">
                    Review cuts, media assets & timeline frame comments
                  </p>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;
