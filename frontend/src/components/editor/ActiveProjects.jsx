import React from 'react';
import { useNavigate } from 'react-router-dom';
import { UploadCloud, Clock, FileVideo } from 'lucide-react';
import Button from '../common/Button';

export const ActiveProjects = ({ projects = [] }) => {
  const navigate = useNavigate();

  return (
    <div className="glass-card p-5.5 flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-semibold text-white tracking-tight">
              In-Production Projects
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">3 active client workspaces</p>
          </div>
          <button
            onClick={() => navigate('/editor/active-projects')}
            className="text-xs font-medium text-purple-400 hover:text-purple-300 transition-colors"
          >
            View all
          </button>
        </div>

        <div className="space-y-3.5">
          {projects.map((project) => (
            <div
              key={project.id}
              className="p-4 rounded-xl bg-[#141A28]/60 border border-white/[0.04] hover:border-purple-500/30 transition-all"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-600/15 text-purple-400 flex items-center justify-center border border-purple-500/20">
                    <FileVideo className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white">
                      {project.title}
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Client: <span className="text-slate-200 font-medium">{project.client}</span> • <span className="text-purple-300">{project.deliverableType}</span>
                    </p>
                  </div>
                </div>

                <span className="px-2.5 py-0.5 text-xs font-medium rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/25">
                  {project.status}
                </span>
              </div>

              {/* Progress bar */}
              <div className="mt-3.5">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-slate-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    Due {project.dueDate} ({project.hoursRemaining}h remaining)
                  </span>
                  <span className="font-semibold text-white">{project.progress}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800/80 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-600 to-indigo-500 rounded-full transition-all duration-500"
                    style={{ width: `${project.progress}%` }}
                  ></div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="mt-3 pt-3 border-t border-white/[0.04] flex items-center justify-between">
                <span className="text-xs font-semibold text-emerald-400">
                  Escrow Secured: {project.budget}
                </span>
                <Button
                  variant="subtle"
                  size="xs"
                  icon={UploadCloud}
                  onClick={() => alert(`Open deliverable upload for: ${project.title}`)}
                  className="bg-[#1C2333] hover:bg-purple-900/30 hover:border-purple-500/40 text-purple-200"
                >
                  Upload Cut
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-white/[0.04]">
        <button
          onClick={() => navigate('/editor/active-projects')}
          className="w-full py-2 text-xs font-medium text-slate-300 hover:text-white bg-white/[0.03] hover:bg-white/[0.07] rounded-xl border border-white/[0.06] transition-colors"
        >
          Manage All Active Contracts
        </button>
      </div>
    </div>
  );
};

export default ActiveProjects;
