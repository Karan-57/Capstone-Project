import React from 'react';
import { ShoppingCart, Smartphone, BarChart3, Film } from 'lucide-react';

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
        return 'bg-amber-500/15 text-amber-300 border border-amber-500/25';
      case 'Open':
        return 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/25';
      case 'Completed':
        return 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30';
      default:
        return 'bg-slate-800 text-slate-300 border border-white/10';
    }
  };

  return (
    <div
      onClick={() => onView && onView(project)}
      className="flex items-center justify-between p-3.5 rounded-xl bg-[#141A28]/70 hover:bg-[#182032] border border-white/[0.05] hover:border-purple-500/30 transition-all duration-200 cursor-pointer group"
    >
      <div className="flex items-center gap-3.5 min-w-0">
        {/* Project Icon */}
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${project.iconBg || 'bg-purple-500/15 text-purple-400'}`}>
          <IconComponent className="w-5 h-5" />
        </div>

        {/* Title and Tags */}
        <div className="min-w-0">
          <h4 className="text-sm font-semibold text-white truncate group-hover:text-purple-300 transition-colors">
            {project.title}
          </h4>
          <p className="text-xs text-slate-400 mt-0.5 truncate">
            {Array.isArray(project.tags) ? project.tags.join(' • ') : project.category}
          </p>
        </div>
      </div>

      {/* Right Side: Status Badge */}
      <div className="shrink-0 pl-3">
        <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusBadge(project.status)}`}>
          {project.status}
        </span>
      </div>
    </div>
  );
};

export default ProjectCard;
