import React from 'react';
import { useNavigate } from 'react-router-dom';
import { UploadCloud, Clock, FileVideo, User, ShieldCheck } from 'lucide-react';
import Button from '../common/Button';
import { useAlert } from '../../context/AlertContext';

export const ActiveProjects = ({ projects = [] }) => {
  const navigate = useNavigate();
  const { showAlert } = useAlert();

  return (
    <div className="bg-white/95 rounded-2xl border-2 border-[#382322] shadow-[3px_3px_0_#382322] p-5 flex flex-col justify-between h-full relative overflow-hidden">
      {/* Editorial top accent tape */}
      <div className="absolute -top-1.5 right-10 w-12 h-3.5 bg-[#B1C8EA] border border-[#382322]/30 rotate-[-2deg] pointer-events-none" />

      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-serif font-bold text-[#382322] tracking-tight">
              In-Production Projects
            </h3>
            <p className="text-xs text-[#382322]/70 mt-0.5">
              {projects.length === 1 ? '1 active client workspace' : `${projects.length} active client workspaces`}
            </p>
          </div>
          <button
            onClick={() => navigate('/editor/active-projects')}
            className="text-xs font-bold text-[#382322] underline decoration-2 decoration-[#FFEBAA] hover:bg-[#FFEBAA] px-2 py-0.5 rounded transition-all cursor-pointer"
          >
            View all
          </button>
        </div>

        {projects.length === 0 ? (
          <div className="py-12 text-center text-xs font-sans text-[#382322]/60 bg-[#FDEBDE]/30 rounded-xl border border-dashed border-[#382322]/30">
            No active projects in production yet
          </div>
        ) : (
          <div className="space-y-3.5">
            {projects.map((project) => (
              <div
                key={project.id}
                className="p-3.5 sm:p-4 rounded-xl bg-[#FDEBDE]/50 border-2 border-[#382322] shadow-[2px_2px_0_#382322] hover:-translate-y-0.5 transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="flex items-start sm:items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#FFEBAA] text-[#382322] flex items-center justify-center border-2 border-[#382322] shadow-[1.5px_1.5px_0_#382322] shrink-0">
                      <FileVideo className="w-5 h-5 stroke-[2.2]" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-sm font-bold text-[#382322] truncate">
                        {project.title}
                      </h4>
                      <div className="flex items-center gap-1.5 text-xs text-[#382322]/70 mt-1 truncate">
                        <User className="w-3.5 h-3.5 text-[#382322] shrink-0" />
                        <span className="text-[#382322] font-semibold truncate">{project.client}</span>
                        <span className="text-[#382322]/40">•</span>
                        <span className="text-[#382322] font-medium">{project.deliverableType}</span>
                      </div>
                    </div>
                  </div>

                  <span className="self-start sm:self-auto px-2.5 py-0.5 text-xs font-mono font-bold rounded-lg bg-[#FFEBAA] text-[#382322] border-2 border-[#382322] shadow-[1.5px_1.5px_0_#382322] shrink-0">
                    {project.status}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="mt-3.5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs mb-1.5 gap-1">
                    <span className="text-[#382322]/70 flex items-center gap-1.5 font-medium">
                      <Clock className="w-3.5 h-3.5 text-[#382322] shrink-0" />
                      {project.dueDate} {project.hoursRemaining ? `(${project.hoursRemaining}h remaining)` : ''}
                    </span>
                    <span className="font-bold text-[#382322] font-mono">{project.progress || 0}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-[#382322]/15 border border-[#382322]/30 overflow-hidden">
                    <div
                      className="h-full bg-[#382322] rounded-full transition-all duration-500"
                      style={{ width: `${project.progress || 0}%` }}
                    ></div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="mt-3 pt-3 border-t-2 border-[#382322]/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#382322] font-mono">
                    <ShieldCheck className="w-4 h-4 text-[#382322]" />
                    <span>{project.budget} Secured</span>
                  </span>
                  <button
                    onClick={() => {
                      navigate('/editor/workspace');
                      showAlert(`Opening workspace to upload deliverable for ${project.title}`, 'info');
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#382322] hover:bg-[#4d3332] text-[#FFEBAA] border-2 border-[#382322] shadow-[2px_2px_0_#382322] text-xs font-bold active:translate-x-[1px] active:translate-y-[1px] transition-all cursor-pointer self-start sm:self-auto"
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

      <div className="mt-4 pt-3 border-t-2 border-[#382322]/10">
        <button
          onClick={() => navigate('/editor/active-projects')}
          className="w-full py-2.5 text-xs font-bold font-mono text-[#382322] bg-[#FFEBAA] hover:bg-[#ffe38a] rounded-xl border-2 border-[#382322] shadow-[2px_2px_0_#382322] active:translate-x-[1px] active:translate-y-[1px] transition-all cursor-pointer"
        >
          Manage All Active Contracts
        </button>
      </div>
    </div>
  );
};

export default ActiveProjects;
