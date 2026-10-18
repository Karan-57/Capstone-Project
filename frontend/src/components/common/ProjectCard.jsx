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
        return 'bg-[#F0EDE5] text-[#A17A43] border border-[#DDD9CE]';
      case 'Open':
        return 'bg-[#F0EDE5] text-[#3C2415] border border-[#DDD9CE]';
      case 'Completed':
        return 'bg-[#EAECE7] text-[#55745C] border border-[#D5D9CF]';
      default:
        return 'bg-[#F0EDE5] text-[#77736D] border border-[#E5E0D7]';
    }
  };

  return (
    <div
      onClick={() => onView && onView(project)}
      className="p-4 rounded-2xl bg-white hover:bg-[#FAF8F5] border border-[#E5E0D7] hover:border-[#DDD9CE] hover:-translate-y-0.5 transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer group relative overflow-hidden"
    >
      <div className="flex items-center justify-between gap-3">
        {/* Project Icon / Thumbnail */}
        <div className="flex items-center gap-3.5 min-w-0">
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${project.iconBg || 'bg-[#F0EDE5] text-[#3C2415]'} group-hover:scale-105 transition-transform duration-200`}>
            <IconComponent className="w-5 h-5" />
          </div>

          <div className="min-w-0">
            <h4 className="text-sm font-semibold text-[#3C2415] truncate group-hover:text-[#5C3E28] transition-colors">
              {project.title}
            </h4>
            <p className="text-xs text-[#77736D] mt-0.5 truncate font-normal">
              {Array.isArray(project.tags) ? project.tags.join(' • ') : project.category}
            </p>
          </div>
        </div>

        {/* Status Badge with Live Dot */}
        <div className="shrink-0 flex items-center gap-2">
          <span className={`px-2.5 py-0.5 text-[11px] font-semibold rounded-full flex items-center gap-1.5 ${getStatusBadge(project.status)}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${project.status === 'In Progress' ? 'bg-[#A17A43]' : project.status === 'Completed' ? 'bg-[#55745C]' : 'bg-[#3C2415]'}`} />
            {project.status}
          </span>
        </div>
      </div>

      {/* Progress & Assigned Status Row */}
      <div className="mt-3.5 pt-3 border-t border-[#E5E0D7] flex items-center justify-between text-xs text-[#77736D]">
        <div className="flex items-center gap-2">
          {Boolean(
            project.assignedEditor ||
            (Array.isArray(project.hirings) && project.hirings.some((h) => h.hiredFreelancerId))
          ) ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#EAECE7] text-[#55745C] border border-[#D5D9CF]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#55745C]" />
              Assigned
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#F0EDE5] text-[#77736D] border border-[#E5E0D7]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#77736D]" />
              Unassigned
            </span>
          )}
        </div>

        {/* Progress bar */}
        <div className="flex items-center gap-2">
          <div className="w-16 h-1.5 rounded-full bg-[#F0EDE5] overflow-hidden">
            <div
              className="h-full bg-[#3C2415] rounded-full transition-all duration-300"
              style={{ width: `${project.progress || 20}%` }}
            />
          </div>
          <span className="text-[11px] font-mono text-[#3C2415] font-semibold">{project.progress || 20}%</span>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;
