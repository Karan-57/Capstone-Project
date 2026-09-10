import React from 'react';
import { useNavigate } from 'react-router-dom';
import ProjectCard from '../common/ProjectCard';

export const ActiveProjects = ({ projects = [] }) => {
  const navigate = useNavigate();

  return (
    <div className="glass-card p-6 flex flex-col justify-between h-full">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-white tracking-tight">
            Recent Projects
          </h3>
          <button
            onClick={() => navigate('/creator/projects')}
            className="text-xs font-medium text-purple-400 hover:text-purple-300 transition-colors"
          >
            View all
          </button>
        </div>

        {/* Projects List */}
        <div className="space-y-3">
          {projects.slice(0, 3).map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onView={() => navigate('/creator/projects')}
            />
          ))}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-white/[0.04]">
        <button
          onClick={() => navigate('/creator/projects')}
          className="w-full py-2 text-xs font-medium text-slate-300 hover:text-white bg-white/[0.03] hover:bg-white/[0.07] rounded-xl border border-white/[0.06] transition-colors"
        >
          View All Projects
        </button>
      </div>
    </div>
  );
};

export default ActiveProjects;
