import React from 'react';
import { useNavigate } from 'react-router-dom';
import { UploadCloud, Clock, FileVideo, User, ShieldCheck } from 'lucide-react';
import { useAlert } from '../../context/AlertContext';

export const ActiveProjects = ({ projects = [] }) => {
  const navigate = useNavigate();
  const { showAlert } = useAlert();
  const displayProjects = projects.slice(0, 3);

  return (
    <div className="bg-white/95 dark:bg-[#201413] rounded-2xl border-2 border-[#382322] dark:border-[#FDEBDE]/30 shadow-[3px_3px_0_#382322] dark:shadow-[3px_3px_0_#000] p-5 flex flex-col justify-between h-full relative overflow-hidden text-[#261615] dark:text-[#FDEBDE]">
      {/* Editorial top accent tape */}
      <div className="absolute -top-1.5 right-10 w-12 h-3.5 bg-[#B1C8EA] border border-[#382322]/30 rotate-[-2deg] pointer-events-none" />

      <div className="flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-serif font-bold text-[#261615] dark:text-[#FDEBDE] tracking-tight">
              In-Production Projects
            </h3>
            <p className="text-xs text-[#5C3A38] dark:text-[#D4B8A8] mt-0.5 font-sans">
              {projects.length === 1 ? '1 active client workspace' : `${projects.length} active client workspaces`}
            </p>
          </div>
          <button
            onClick={() => navigate('/editor/active-projects')}
            className="text-xs font-bold text-[#261615] dark:text-[#FFEBAA] underline decoration-2 decoration-[#FFEBAA] hover:bg-[#FFEBAA] dark:hover:bg-[#FFEBAA]/20 px-2 py-0.5 rounded transition-all cursor-pointer font-mono"
          >
            View all
          </button>
        </div>

        {displayProjects.length === 0 ? (
          <div className="flex-1 min-h-[180px] flex items-center justify-center text-center text-xs font-sans text-[#5C3A38] dark:text-[#D4B8A8] bg-[#FDEBDE]/30 dark:bg-[#1A1110]/50 rounded-xl border border-dashed border-[#382322]/30 dark:border-[#FDEBDE]/30 p-6">
            No active projects in production yet
          </div>
        ) : (
          <div className="space-y-3.5 flex-1">
            {displayProjects.map((project) => (
              <div
                key={project.id}
                className="p-3.5 sm:p-4 rounded-xl bg-[#FDEBDE]/50 dark:bg-[#1A1110] border-2 border-[#382322] dark:border-[#FDEBDE]/30 shadow-[2px_2px_0_#382322] dark:shadow-[2px_2px_0_#000] hover:-translate-y-0.5 transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="flex items-start sm:items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#FFEBAA] text-[#261615] flex items-center justify-center border-2 border-[#382322] shadow-[1.5px_1.5px_0_#382322] shrink-0">
                      <FileVideo className="w-5 h-5 stroke-[2.2]" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-sm font-bold text-[#261615] dark:text-[#FDEBDE] truncate">
                        {project.title}
                      </h4>
                      <div className="flex items-center gap-1.5 text-xs text-[#5C3A38] dark:text-[#D4B8A8] mt-1 truncate">
                        <User className="w-3.5 h-3.5 text-[#261615] dark:text-[#FFEBAA] shrink-0" />
                        <span className="text-[#261615] dark:text-[#FDEBDE] font-semibold truncate">{project.client}</span>
                        <span className="text-[#382322]/40 dark:text-[#FDEBDE]/30">•</span>
                        <span className="text-[#5C3A38] dark:text-[#D4B8A8] font-medium">{project.deliverableType}</span>
                      </div>
                    </div>
                  </div>

                  <span className="self-start sm:self-auto px-2.5 py-0.5 text-xs font-mono font-bold rounded-lg bg-[#FFEBAA] text-[#261615] border-2 border-[#382322] shadow-[1.5px_1.5px_0_#382322] shrink-0">
                    {project.status}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="mt-3.5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs mb-1.5 gap-1 font-mono">
                    <span className="text-[#5C3A38] dark:text-[#D4B8A8] flex items-center gap-1.5 font-medium">
                      <Clock className="w-3.5 h-3.5 text-[#261615] dark:text-[#FFEBAA] shrink-0" />
                      {project.dueDate} {project.hoursRemaining ? `(${project.hoursRemaining}h remaining)` : ''}
                    </span>
                    <span className="font-bold text-[#261615] dark:text-[#FFEBAA]">{project.progress || 0}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-[#382322]/15 dark:bg-[#FDEBDE]/15 border border-[#382322]/30 dark:border-[#FDEBDE]/30 overflow-hidden">
                    <div
                      className="h-full bg-[#382322] dark:bg-[#FFEBAA] rounded-full transition-all duration-500"
                      style={{ width: `${project.progress || 0}%` }}
                    />
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="mt-3 pt-3 border-t-2 border-[#382322]/10 dark:border-[#FDEBDE]/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#261615] dark:text-[#FDEBDE] font-mono">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>{project.budget} Secured</span>
                  </span>
                  <button
                    onClick={() => {
                      navigate('/editor/workspace');
                      showAlert(`Opening workspace to upload deliverable for ${project.title}`, 'info');
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#382322] hover:bg-[#4d3332] text-[#FFEBAA] border-2 border-[#382322] shadow-[2px_2px_0_#382322] text-xs font-bold active:translate-x-[1px] active:translate-y-[1px] transition-all cursor-pointer self-start sm:self-auto font-mono"
                  >
                    <UploadCloud className="w-3.5 h-3.5" />
                    <span>Upload Cut</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-4 pt-3 border-t-2 border-[#382322]/10 dark:border-[#FDEBDE]/10">
        <button
          onClick={() => navigate('/editor/active-projects')}
          className="w-full py-2.5 text-xs font-bold font-mono text-[#261615] bg-[#FFEBAA] hover:bg-[#ffe38a] rounded-xl border-2 border-[#382322] shadow-[2px_2px_0_#382322] active:translate-x-[1px] active:translate-y-[1px] transition-all cursor-pointer uppercase tracking-wider"
        >
          Manage All Active Contracts
        </button>
      </div>
    </div>
  );
};

export default ActiveProjects;
