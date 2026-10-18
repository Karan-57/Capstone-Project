import React from 'react';
import { useNavigate } from 'react-router-dom';
import ProjectCard from '../common/ProjectCard';

export const ActiveProjects = ({ projects = [] }) => {
  const navigate = useNavigate();

  return (
    <div className="p-5.5 rounded-2xl bg-white border border-[#E5E0D7] shadow-sm flex flex-col justify-between h-full">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-[#3C2415] tracking-tight">
            Recent Projects
          </h3>
          <button
            onClick={() => navigate('/creator/projects')}
            className="text-xs font-semibold text-[#6E7464] hover:text-[#3C2415] transition-colors cursor-pointer"
          >
            View all
          </button>
        </div>

        {/* Projects List */}
        {projects.length === 0 ? (
          <div className="py-8 text-center text-xs text-[#77736D]">
            No recent projects found.
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

      <div className="mt-4 pt-3 border-t border-[#E5E0D7]">
        <button
          onClick={() => navigate('/creator/projects')}
          className="w-full py-2.5 text-xs font-medium text-[#3C2415] hover:bg-[#F0EDE5] rounded-xl border border-[#E5E0D7] transition-colors cursor-pointer"
        >
          View All Projects
        </button>
      </div>
    </div>
  );
};

export default ActiveProjects;
