import React from 'react';
import { useNavigate } from 'react-router-dom';
import ProjectCard from '../common/ProjectCard';

export const ActiveProjects = ({ projects = [] }) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white/95 rounded-2xl border-2 border-[#382322] shadow-[3px_3px_0_#382322] p-5 flex flex-col justify-between h-full relative">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-serif font-bold text-[#382322] tracking-tight">
            Recent Projects
          </h3>
          <button
            onClick={() => navigate('/creator/projects')}
            className="text-xs font-bold text-[#382322] underline decoration-2 decoration-[#FFEBAA] hover:bg-[#FFEBAA] px-2 py-0.5 rounded transition-all cursor-pointer"
          >
            View all ({projects.length})
          </button>
        </div>

        {/* Projects List */}
        {projects.length === 0 ? (
          <div className="py-8 text-center text-xs text-[#382322]/60 bg-[#FDEBDE]/30 rounded-xl border border-dashed border-[#382322]/30">
            No projects in workspace yet.
          </div>
        ) : (
          <div className="space-y-3">
            {projects.slice(0, 3).map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onView={() => navigate('/creator/projects')}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ActiveProjects;
