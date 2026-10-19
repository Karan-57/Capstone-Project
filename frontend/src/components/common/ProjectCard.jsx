import React from 'react';
import { ShoppingCart, Smartphone, BarChart3, Film, Clock, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { DEFAULT_PFP } from '../../constants/assets';

const iconMap = {
  'shopping-cart': ShoppingCart,
  'smartphone': Smartphone,
  'layout': BarChart3,
  'film': Film,
};

export const ProjectCard = ({ project, onView }) => {
  const IconComponent = iconMap[project.iconType] || Film;

  const getStatusBadge = (status) => {
    switch (status) {
      case 'In Progress':
        return 'bg-[#FFEBAA] text-[#382322] border-2 border-[#382322] shadow-[1.5px_1.5px_0_#382322]';
      case 'Open':
        return 'bg-[#B1C8EA] text-[#382322] border-2 border-[#382322] shadow-[1.5px_1.5px_0_#382322]';
      case 'Completed':
        return 'bg-emerald-200 text-[#382322] border-2 border-[#382322] shadow-[1.5px_1.5px_0_#382322]';
      default:
        return 'bg-white text-[#382322] border-2 border-[#382322] shadow-[1.5px_1.5px_0_#382322]';
    }
  };

  return (
    <div
      onClick={() => onView && onView(project)}
      className="p-4 rounded-2xl bg-white border-2 border-[#382322] shadow-[3px_3px_0_#382322] hover:shadow-[4px_4px_0_#382322] hover:-translate-y-0.5 active:translate-x-[1px] active:translate-y-[1px] transition-all duration-200 cursor-pointer group relative overflow-hidden"
    >
      <div className="flex items-center justify-between gap-3">
        {/* Project Icon / Thumbnail */}
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border-2 border-[#382322] shadow-[2px_2px_0_#382322] bg-[#B1C8EA] text-[#382322] group-hover:scale-105 transition-transform duration-200">
            <IconComponent className="w-5 h-5 stroke-[2.2]" />
          </div>

          <div className="min-w-0">
            <h4 className="text-sm font-bold text-[#382322] truncate group-hover:underline decoration-2 underline-offset-2 transition-all">
              {project.title}
            </h4>
            <p className="text-xs text-[#382322]/70 mt-0.5 truncate font-medium">
              {Array.isArray(project.tags) ? project.tags.join(' • ') : project.category}
            </p>
          </div>
        </div>

        {/* Status Badge with Live Dot */}
        <div className="shrink-0 flex items-center gap-2">
          <span className={`px-2.5 py-0.5 text-[11px] font-mono font-bold rounded-lg flex items-center gap-1.5 ${getStatusBadge(project.status)}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${project.status === 'In Progress' ? 'bg-[#382322] animate-pulse' : 'bg-[#382322]'}`} />
            {project.status}
          </span>
        </div>
      </div>

      {/* Progress & Assigned Status Row */}
      <div className="mt-3.5 pt-3 border-t-2 border-[#382322]/10 flex items-center justify-between text-xs text-[#382322]/70">
        <div className="flex items-center gap-2">
          {Boolean(
            project.assignedEditor ||
            (Array.isArray(project.hirings) && project.hirings.some((h) => h.hiredFreelancerId))
          ) ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-[#FFEBAA] text-[#382322] border border-[#382322]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#382322]" />
              Assigned
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-[#FDEBDE] text-[#382322] border border-[#382322]/40">
              <span className="w-1.5 h-1.5 rounded-full bg-[#382322]/40" />
              Unassigned
            </span>
          )}
        </div>

        {/* Progress bar */}
        <div className="flex items-center gap-2">
          <div className="w-16 h-2 rounded-full bg-[#382322]/15 border border-[#382322]/30 overflow-hidden">
            <div
              className="h-full bg-[#382322] rounded-full"
              style={{ width: `${project.progress || 20}%` }}
            />
          </div>
          <span className="text-[11px] font-mono text-[#382322] font-bold">{project.progress || 20}%</span>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;
