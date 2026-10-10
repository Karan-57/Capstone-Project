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
        return 'bg-amber-500/15 text-amber-300 border border-amber-500/30';
      case 'Open':
        return 'bg-blue-500/15 text-blue-300 border border-blue-500/30';
      case 'Completed':
        return 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30';
      default:
        return 'bg-slate-800 text-slate-300 border border-white/10';
    }
  };

  return (
    <div
      onClick={() => onView && onView(project)}
      className="p-4 rounded-2xl bg-[#0F1422]/60 hover:bg-[#141A2B]/80 border border-white/[0.06] hover:border-purple-500/40 hover:-translate-y-1 transition-all duration-300 shadow-lg hover:shadow-purple-950/30 cursor-pointer group relative overflow-hidden"
    >
      <div className="flex items-center justify-between gap-3">
        {/* Project Icon / Thumbnail */}
        <div className="flex items-center gap-3.5 min-w-0">
          <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${project.iconBg || 'bg-purple-500/15 text-purple-400'} group-hover:scale-105 transition-transform duration-300 shadow-inner`}>
            <IconComponent className="w-5 h-5" />
          </div>

          <div className="min-w-0">
            <h4 className="text-sm font-bold text-white truncate group-hover:text-purple-300 transition-colors">
              {project.title}
            </h4>
            <p className="text-xs text-slate-400 mt-0.5 truncate font-medium">
              {Array.isArray(project.tags) ? project.tags.join(' • ') : project.category}
            </p>
          </div>
        </div>

        {/* Status Badge with Live Dot */}
        <div className="shrink-0 flex items-center gap-2">
          <span className={`px-2.5 py-0.5 text-[11px] font-bold rounded-full flex items-center gap-1.5 ${getStatusBadge(project.status)}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${project.status === 'In Progress' ? 'bg-amber-400 animate-pulse' : project.status === 'Completed' ? 'bg-emerald-400' : 'bg-blue-400'}`} />
            {project.status}
          </span>
        </div>
      </div>

      {/* Progress & Assigned Editor Row */}
      <div className="mt-3.5 pt-3 border-t border-white/[0.04] flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-2">
          {project.assignedEditor ? (
            <div className="flex items-center gap-1.5">
              <img
                src={project.assignedEditor.avatar || DEFAULT_PFP}
                alt={project.assignedEditor.name || 'Assigned editor'}
                loading="lazy"
                onError={(e) => { e.currentTarget.src = DEFAULT_PFP; }}
                className="w-5 h-5 rounded-full object-cover border border-purple-500/40"
              />
              <span className="text-slate-300 text-[11px] truncate max-w-[100px]">{project.assignedEditor.name}</span>
            </div>
          ) : (
            <span className="text-[11px] text-slate-500">Unassigned</span>
          )}
        </div>

        {/* Progress bar */}
        <div className="flex items-center gap-2">
          <div className="w-16 h-1.5 rounded-full bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-indigo-400 rounded-full"
              style={{ width: `${project.progress || 20}%` }}
            />
          </div>
          <span className="text-[11px] font-mono text-slate-300 font-semibold">{project.progress || 20}%</span>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;
