import React from 'react';
import { useNavigate } from 'react-router-dom';
import { UploadCloud, Clock, FileVideo, User, ShieldCheck } from 'lucide-react';
import Button from '../common/Button';
import { useAlert } from '../../context/AlertContext';

export const ActiveProjects = ({ projects = [] }) => {
  const navigate = useNavigate();
  const { showAlert } = useAlert();

  return (
    <div className="p-4 sm:p-5.5 rounded-2xl bg-white border border-[#E5E0D7] shadow-sm flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-semibold text-[#3C2415] tracking-tight">
              In-Production Projects
            </h3>
            <p className="text-xs text-[#77736D] mt-0.5">
              {projects.length === 1 ? '1 active client workspace' : `${projects.length} active client workspaces`}
            </p>
          </div>
          <button
            onClick={() => navigate('/editor/active-projects')}
            className="text-xs font-semibold text-[#6E7464] hover:text-[#3C2415] transition-colors cursor-pointer"
          >
            View all
          </button>
        </div>

        {projects.length === 0 ? (
          <div className="py-12 text-center text-xs text-[#77736D]">
            No active projects in production yet
          </div>
        ) : (
          <div className="space-y-3.5">
            {projects.map((project) => (
              <div
                key={project.id}
                className="p-3.5 sm:p-4 rounded-xl bg-[#F0EDE5] border border-[#E5E0D7] hover:border-[#DDD9CE] transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="flex items-start sm:items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white text-[#3C2415] flex items-center justify-center border border-[#E5E0D7] shrink-0">
                      <FileVideo className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-sm font-semibold text-[#3C2415] truncate">
                        {project.title}
                      </h4>
                      <div className="flex items-center gap-1.5 text-xs text-[#77736D] mt-1 truncate">
                        <User className="w-3.5 h-3.5 text-[#77736D] shrink-0" />
                        <span className="text-[#3C2415] font-medium truncate">{project.client}</span>
                        <span className="text-[#DDD9CE]">•</span>
                        <span className="text-[#6E7464] font-medium">{project.deliverableType}</span>
                      </div>
                    </div>
                  </div>

                  <span className="self-start sm:self-auto px-2.5 py-0.5 text-xs font-medium rounded-full bg-white text-[#A17A43] border border-[#E5E0D7] shrink-0">
                    {project.status}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="mt-3.5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs mb-1.5 gap-1">
                    <span className="text-[#77736D] flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#77736D] shrink-0" />
                      {project.dueDate} {project.hoursRemaining ? `(${project.hoursRemaining}h remaining)` : ''}
                    </span>
                    <span className="font-semibold text-[#3C2415] font-mono">{project.progress || 0}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-[#E5E0D7] overflow-hidden">
                    <div
                      className="h-full bg-[#3C2415] rounded-full transition-all duration-500"
                      style={{ width: `${project.progress || 0}%` }}
                    ></div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="mt-3 pt-3 border-t border-[#E5E0D7] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#55745C] font-mono">
                    <ShieldCheck className="w-4 h-4 text-[#55745C]" />
                    <span>{project.budget} Secured</span>
                  </span>
                  <Button
                    variant="subtle"
                    size="xs"
                    icon={UploadCloud}
                    onClick={() => {
                      navigate('/editor/workspace');
                      showAlert(`Opening workspace to upload deliverable for ${project.title}`, 'info');
                    }}
                    className="self-start sm:self-auto"
                  >
                    Upload Cut
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-[#E5E0D7]">
        <button
          onClick={() => navigate('/editor/active-projects')}
          className="w-full py-2 text-xs font-medium text-[#3C2415] hover:bg-[#F0EDE5] rounded-xl border border-[#E5E0D7] transition-colors cursor-pointer"
        >
          Manage All Active Contracts
        </button>
      </div>
    </div>
  );
};

export default ActiveProjects;
