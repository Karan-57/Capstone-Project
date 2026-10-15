import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, FolderGit2, CheckCircle2, Lock } from 'lucide-react';
import Button from '../../components/common/Button';
import { SkeletonCard } from '../../components/common/Skeleton';
import SEO from '../../components/common/SEO';
import { projectService } from '../../services/projectService';
import { DEFAULT_PFP } from '../../constants/assets';

export const ActiveProjects = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProjects = async () => {
      setLoading(true);
      const data = await projectService.getEditorActive();
      setProjects(data);
      setLoading(false);
    };
    loadProjects();
  }, []);

  return (
    <div className="space-y-6">
      <SEO
        title="Active Contracts"
        description="Submit rough cuts, review frame-accurate client timestamps, and manage active production contracts."
      />

      <div>
        <h2 className="text-xl font-bold text-white tracking-tight">In-Production Contracts</h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Submit rough cuts, review frame-accurate client timestamps, and collaborate in project workspaces
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : projects.length === 0 ? (
        <div className="glass-card p-12 text-center border border-white/[0.06] rounded-2xl">
          <FolderGit2 className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <h4 className="text-sm font-semibold text-white">No active in-production contracts</h4>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            When a creator accepts your proposal, the active production contract and dedicated workspace will appear here.
          </p>
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/editor/browse')}
            className="mt-4"
          >
            Browse Open Gigs
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {projects.map((proj) => (
            <div
              key={proj.id}
              className="glass-card p-4 sm:p-5.5 border border-white/[0.06] space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="flex items-start sm:items-center gap-3 min-w-0">
                  <img
                    src={proj.clientAvatar || DEFAULT_PFP}
                    alt={proj.client || 'Client avatar'}
                    loading="lazy"
                    onError={(e) => { e.currentTarget.src = DEFAULT_PFP; }}
                    className="w-11 h-11 rounded-xl object-cover border border-white/10 shrink-0"
                  />
                  <div className="min-w-0">
                    <h3 className="text-base font-bold text-white truncate">{proj.title || 'unknown'}</h3>
                    <p className="text-xs text-slate-400 mt-0.5 truncate">
                      Creator: <span className="text-white font-medium">{proj.client || 'unknown'}</span> • Deliverable: <span className="text-purple-300">{proj.deliverableType || 'unknown'}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/25">
                    {proj.status || 'In Progress'}
                  </span>
                  <span className="text-sm font-bold text-emerald-400 pl-2">
                    {proj.budget || '999'}
                  </span>
                </div>
              </div>

              {/* Milestone-Based Progress Slider & Step Breakdown */}
              <div className="space-y-2 bg-white/[0.02] p-3.5 rounded-xl border border-white/[0.04]">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-300 gap-1">
                  <span className="flex items-center gap-1.5 text-slate-400">
                    <Clock className="w-3.5 h-3.5 shrink-0 text-slate-400" /> Due {proj.dueDate || 'Ongoing'}
                  </span>
                  <span className="font-semibold text-purple-400 font-mono">
                    {proj.clearedMilestones != null && proj.totalMilestones
                      ? `${proj.clearedMilestones}/${proj.totalMilestones} Milestones Cleared · ${proj.progress}% Completed`
                      : `${proj.progress}% Completed`}
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-600 via-indigo-500 to-emerald-400 rounded-full transition-all duration-500"
                    style={{ width: `${proj.progress || 0}%` }}
                  />
                </div>

                {/* Milestone Chips */}
                {Array.isArray(proj.milestones) && proj.milestones.length > 0 && (
                  <div className="flex items-center gap-2 pt-1.5 overflow-x-auto flex-wrap">
                    {proj.milestones.map((m, idx) => {
                      const isApproved = m.status === 'approved';
                      const isSubmitted = m.status === 'submitted';
                      const isFunded = m.status === 'funded';
                      return (
                        <div
                          key={m.id || idx}
                          className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-[11px] font-medium border transition-colors ${
                            isApproved
                              ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                              : isSubmitted
                              ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                              : isFunded
                              ? 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30'
                              : 'bg-white/[0.03] text-slate-400 border-white/[0.06]'
                          }`}
                        >
                          {isApproved ? (
                            <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                          ) : isSubmitted ? (
                            <Clock className="w-3 h-3 text-amber-400 shrink-0" />
                          ) : isFunded ? (
                            <Lock className="w-3 h-3 text-indigo-400 shrink-0" />
                          ) : (
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-600 shrink-0" />
                          )}
                          <span className="truncate max-w-[140px]">{m.title || `Milestone ${idx + 1}`}</span>
                          <span className="text-[10px] opacity-75 capitalize font-mono">
                            ({isApproved ? 'Paid' : isSubmitted ? 'Review' : isFunded ? 'Funded' : 'Pending'})
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Action row */}
              <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-t border-white/[0.04]">
                <span className="text-xs text-slate-400">
                  Deliverable tracking & communication live in workspace
                </span>
                <Button
                  variant="primary"
                  size="xs"
                  icon={FolderGit2}
                  onClick={() => navigate('/editor/workspace')}
                  className="self-start sm:self-auto"
                >
                  Open Workspace
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ActiveProjects;
