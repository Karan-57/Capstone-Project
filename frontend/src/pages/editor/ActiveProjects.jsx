import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, FolderGit2 } from 'lucide-react';
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

              {/* Progress Slider */}
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-300 mb-1.5 gap-1">
                  <span className="flex items-center gap-1 text-slate-400">
                    <Clock className="w-3.5 h-3.5 shrink-0" /> Due {proj.dueDate || 'unknown'}
                  </span>
                  <span className="font-semibold text-purple-400">{proj.progress != null ? proj.progress : 0}% Completed</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-600 to-indigo-500 rounded-full transition-all duration-500"
                    style={{ width: `${proj.progress || 0}%` }}
                  />
                </div>
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
