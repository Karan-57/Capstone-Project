import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, FolderGit2, CheckCircle2, Lock, ShieldCheck, ArrowRight } from 'lucide-react';
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
    <div className="space-y-6 text-[#261615] dark:text-[#FDEBDE] pb-16">
      <SEO
        title="Active Contracts"
        description="Submit rough cuts, review frame-accurate client timestamps, and manage active production contracts."
      />

      {/* Header Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#FFFDF9] dark:bg-[#201413] border-2 border-[#382322] dark:border-[#FDEBDE]/30 shadow-[3px_3px_0_#382322] dark:shadow-[3px_3px_0_#000]">
        <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#261615] dark:text-[#FDEBDE] tracking-tight">
          In-Production Contracts
        </h2>
        <p className="text-xs sm:text-sm text-[#5C3A38] dark:text-[#D4B8A8] mt-1 font-sans">
          Submit rough cuts, review frame-accurate client timestamps, and collaborate in project workspaces
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : projects.length === 0 ? (
        <div className="bg-[#FFFDF9] dark:bg-[#201413] p-12 text-center rounded-2xl border-2 border-[#382322] dark:border-[#FDEBDE]/30 shadow-[4px_4px_0_#382322] dark:shadow-[4px_4px_0_#000]">
          <FolderGit2 className="w-12 h-12 text-[#5C3A38] dark:text-[#D4B8A8] mx-auto mb-3 opacity-60" />
          <h4 className="text-base font-serif font-bold text-[#261615] dark:text-[#FDEBDE]">
            No active in-production contracts
          </h4>
          <p className="text-xs sm:text-sm text-[#5C3A38] dark:text-[#D4B8A8] mt-1 max-w-sm mx-auto font-sans">
            When a creator accepts your proposal, the active production contract and dedicated workspace will appear here.
          </p>
          <button
            onClick={() => navigate('/editor/browse')}
            className="mt-5 px-5 py-2.5 rounded-xl bg-[#FFEBAA] hover:bg-[#ffe58f] text-[#261615] border-2 border-[#382322] shadow-[2px_2px_0_#382322] text-xs font-bold font-mono uppercase tracking-wider transition-all cursor-pointer active:translate-x-0.5 active:translate-y-0.5 inline-flex items-center gap-2"
          >
            <span>Browse Open Gigs</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects.map((proj) => (
            <div
              key={proj.id}
              className="bg-[#FFFDF9] dark:bg-[#201413] p-5 sm:p-6 rounded-2xl border-2 border-[#382322] dark:border-[#FDEBDE]/30 shadow-[4px_4px_0_#382322] dark:shadow-[4px_4px_0_#000] space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                  <img
                    src={proj.clientAvatar || DEFAULT_PFP}
                    alt={proj.client || 'Client avatar'}
                    loading="lazy"
                    onError={(e) => { e.currentTarget.src = DEFAULT_PFP; }}
                    className="w-11 h-11 rounded-full object-cover border-2 border-[#382322] dark:border-[#FDEBDE]/30 shadow-[2px_2px_0_#382322] shrink-0"
                  />
                  <div className="min-w-0">
                    <h3 className="text-base sm:text-lg font-serif font-bold text-[#261615] dark:text-[#FDEBDE] truncate">
                      {proj.title || 'Untitled Project'}
                    </h3>
                    <p className="text-xs text-[#5C3A38] dark:text-[#D4B8A8] mt-0.5 truncate font-sans">
                      Creator: <span className="text-[#261615] dark:text-[#FDEBDE] font-bold">{proj.client || 'unknown'}</span> • Deliverable: <span className="font-semibold text-[#261615] dark:text-[#FFEBAA]">{proj.deliverableType || 'Video'}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                  <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-[#FFEBAA] text-[#261615] border-2 border-[#382322] shadow-[1.5px_1.5px_0_#382322]">
                    {proj.status || 'In Progress'}
                  </span>
                  <span className="text-base font-extrabold text-[#261615] dark:text-[#FFEBAA] font-mono pl-2">
                    {proj.budget || '₹0'}
                  </span>
                </div>
              </div>

              {/* Milestone-Based Progress Slider & Step Breakdown */}
              <div className="space-y-2.5 bg-[#FFF7F1] dark:bg-[#19100F] p-4 rounded-xl border-2 border-[#382322]/15 dark:border-[#FDEBDE]/15">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-[#5C3A38] dark:text-[#D4B8A8] gap-1 font-mono">
                  <span className="flex items-center gap-1.5 font-medium">
                    <Clock className="w-3.5 h-3.5 shrink-0 text-[#261615] dark:text-[#FFEBAA]" /> Due {proj.dueDate || 'Ongoing'}
                  </span>
                  <span className="font-bold text-[#261615] dark:text-[#FFEBAA]">
                    {proj.clearedMilestones != null && proj.totalMilestones
                      ? `${proj.clearedMilestones}/${proj.totalMilestones} Milestones Cleared · ${proj.progress}% Completed`
                      : `${proj.progress}% Completed`}
                  </span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-[#382322]/15 dark:bg-[#FDEBDE]/15 border border-[#382322]/30 dark:border-[#FDEBDE]/30 overflow-hidden">
                  <div
                    className="h-full bg-[#382322] dark:bg-[#FFEBAA] rounded-full transition-all duration-500"
                    style={{ width: `${proj.progress || 0}%` }}
                  />
                </div>

                {/* Milestone Chips */}
                {Array.isArray(proj.milestones) && proj.milestones.length > 0 && (
                  <div className="flex items-center gap-2 pt-2 overflow-x-auto flex-wrap">
                    {proj.milestones.map((m, idx) => {
                      const isApproved = m.status === 'approved';
                      const isSubmitted = m.status === 'submitted';
                      const isFunded = m.status === 'funded';
                      return (
                        <div
                          key={m.id || idx}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold border-2 transition-colors ${
                            isApproved
                              ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-600/40'
                              : isSubmitted
                              ? 'bg-[#FFEBAA] text-[#261615] border-[#382322]'
                              : isFunded
                              ? 'bg-[#B1C8EA] text-[#261615] border-[#382322]'
                              : 'bg-white dark:bg-[#201413] text-[#5C3A38] dark:text-[#D4B8A8] border-[#382322]/30 dark:border-[#FDEBDE]/30'
                          }`}
                        >
                          {isApproved ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400 shrink-0" />
                          ) : isSubmitted ? (
                            <Clock className="w-3.5 h-3.5 text-[#261615] shrink-0" />
                          ) : isFunded ? (
                            <Lock className="w-3.5 h-3.5 text-[#261615] shrink-0" />
                          ) : (
                            <span className="w-1.5 h-1.5 rounded-full bg-[#382322]/50 dark:bg-[#FDEBDE]/50 shrink-0" />
                          )}
                          <span className="truncate max-w-[140px]">{m.title || `Milestone ${idx + 1}`}</span>
                          <span className="text-[10px] opacity-75 capitalize">
                            ({isApproved ? 'Paid' : isSubmitted ? 'Review' : isFunded ? 'Funded' : 'Pending'})
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Action row */}
              <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t-2 border-[#382322]/10 dark:border-[#FDEBDE]/10">
                <span className="text-xs text-[#5C3A38] dark:text-[#D4B8A8] font-sans flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  Deliverable tracking, timestamp comments & file review live in workspace
                </span>
                <button
                  type="button"
                  onClick={() => navigate('/editor/workspace')}
                  className="px-4 py-2 rounded-xl bg-[#382322] hover:bg-[#4d3332] text-[#FFEBAA] border-2 border-[#382322] shadow-[2px_2px_0_#382322] text-xs font-bold font-mono uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 self-start sm:self-auto active:translate-x-0.5 active:translate-y-0.5"
                >
                  <FolderGit2 className="w-4 h-4" />
                  <span>Open Workspace</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ActiveProjects;
