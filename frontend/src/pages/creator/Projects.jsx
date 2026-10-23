import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Clock,
  Briefcase,
  CreditCard,
  FolderGit2,
  Film,
  ShoppingCart,
  Smartphone,
  BarChart3
} from 'lucide-react';
import Button from '../../components/common/Button';
import { SkeletonProjectCard } from '../../components/common/Skeleton';
import SEO from '../../components/common/SEO';
import { projectService } from '../../services/projectService';
import { useAlert } from '../../context/AlertContext';

const iconMap = {
  'shopping-cart': ShoppingCart,
  'smartphone': Smartphone,
  'layout': BarChart3,
  'film': Film,
};

export const Projects = () => {
  const navigate = useNavigate();
  const { showAlert } = useAlert();
  const [filter, setFilter] = useState('all');
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadProjects = async () => {
    setLoading(true);
    try {
      const data = await projectService.getCreatorProjects();
      setProjects(data || []);
    } catch (err) {
      console.error('Failed to load projects:', err);
      showAlert('Failed to load projects', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'In Progress':
        return 'bg-[#FFEBAA] text-[#261615] border-2 border-[#382322] shadow-[1.5px_1.5px_0_#382322]';
      case 'Open':
        return 'bg-[#B1C8EA] text-[#261615] border-2 border-[#382322] shadow-[1.5px_1.5px_0_#382322]';
      case 'Completed':
        return 'bg-emerald-100 text-emerald-900 border-2 border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-600';
      default:
        return 'bg-[#FAF0E6] dark:bg-[#201413] text-[#261615] dark:text-[#FDEBDE] border-2 border-[#382322] dark:border-[#FDEBDE]/30';
    }
  };

  const filtered = projects.filter((p) => {
    if (filter === 'all') return true;
    return p.status.toLowerCase().replace(' ', '-') === filter;
  });

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      <SEO
        title="Manage Projects"
        description="Monitor deliverables, milestones, team hirings, and active video editing pipelines."
      />

      {/* Header with Title and '+' Create Project Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black font-serif text-[#261615] dark:text-[#FDEBDE] tracking-tight">
            Manage Projects
          </h2>
          <p className="text-xs text-[#5C3A38] dark:text-[#D4B8A8] mt-1 font-medium">
            Monitor deliverables, revisions, team hirings, and active escrow milestones
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate('/creator/create-project')}
          className="p-2.5 rounded-xl bg-[#382322] hover:bg-[#261615] text-[#FFEBAA] border-2 border-[#382322] shadow-[2.5px_2.5px_0_#FFEBAA] dark:bg-[#FFEBAA] dark:hover:bg-[#fff0c2] dark:text-[#261615] dark:border-[#FFEBAA] dark:shadow-[2.5px_2.5px_0_#000] active:translate-x-[1px] active:translate-y-[1px] transition-all cursor-pointer self-start sm:self-auto flex items-center justify-center shrink-0"
          title="Create New Project"
        >
          <Plus className="w-5 h-5 stroke-[2.5]" />
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b-2 border-[#382322]/15 dark:border-[#FDEBDE]/15 pb-3 overflow-x-auto">
        {['all', 'in-progress', 'open', 'completed'].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold capitalize whitespace-nowrap transition-all cursor-pointer active:translate-x-[1px] active:translate-y-[1px] ${
              filter === tab
                ? 'bg-[#FFEBAA] text-[#261615] border-2 border-[#382322] shadow-[2px_2px_0_#382322] dark:shadow-[2px_2px_0_#000]'
                : 'text-[#5C3A38] dark:text-[#D4B8A8] hover:text-[#261615] dark:hover:text-[#FDEBDE] hover:bg-white/40 dark:hover:bg-white/10 border-2 border-transparent'
            }`}
          >
            {tab.replace('-', ' ')}
          </button>
        ))}
      </div>

      {/* Projects Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SkeletonProjectCard />
          <SkeletonProjectCard />
          <SkeletonProjectCard />
          <SkeletonProjectCard />
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 border-2 border-dashed border-[#382322]/30 dark:border-[#FDEBDE]/30 bg-white/40 dark:bg-[#261817]/40 rounded-2xl text-center space-y-3">
          <Film className="w-10 h-10 text-[#5C3A38] dark:text-[#D4B8A8] mx-auto opacity-70" />
          <p className="text-base font-bold font-serif text-[#261615] dark:text-[#FDEBDE]">
            No projects found in this category
          </p>
          <p className="text-xs text-[#5C3A38] dark:text-[#D4B8A8] max-w-sm mx-auto font-medium">
            Create a new production brief to hire video editors and freelancers.
          </p>
          <Button
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={() => navigate('/creator/create-project')}
          >
            Create First Project
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((proj) => {
            const IconComponent = iconMap[proj.iconType] || Film;

            return (
              <div
                key={proj.id}
                onClick={() => navigate(`/creator/projects/${proj.id}`)}
                className="brutal-card p-4 sm:p-5 rounded-2xl cursor-pointer group relative space-y-3.5 transition-all duration-200"
              >
                {/* Header: Icon, Title, Format Tag, Status Badge */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-[#FFEBAA] dark:bg-[#382322] text-[#261615] dark:text-[#FFEBAA] border-2 border-[#382322] dark:border-[#FFEBAA]/40 shadow-[2px_2px_0_#382322] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-200">
                      <IconComponent className="w-5 h-5" />
                    </div>

                    <div className="min-w-0">
                      <h4 className="text-base font-bold text-[#261615] dark:text-[#FDEBDE] font-serif truncate group-hover:text-[#8A5C5A] dark:group-hover:text-[#FFEBAA] transition-colors">
                        {proj.title}
                      </h4>
                      <p className="text-[11px] text-[#5C3A38] dark:text-[#D4B8A8] mt-0.5 truncate font-medium">
                        {Array.isArray(proj.tags) ? proj.tags.join(' • ') : proj.category}
                      </p>
                    </div>
                  </div>

                  <span className={`px-2.5 py-0.5 text-[11px] font-bold rounded-lg flex items-center gap-1.5 shrink-0 ${getStatusBadge(proj.status)}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${proj.status === 'In Progress' ? 'bg-[#382322] animate-pulse' : proj.status === 'Completed' ? 'bg-emerald-600' : 'bg-blue-600'}`} />
                    {proj.status}
                  </span>
                </div>

                {/* Key Metrics: Budget, Deadline, Progress */}
                <div className="pt-2 border-t border-[#382322]/15 dark:border-[#FDEBDE]/15 flex items-center justify-between gap-2 text-xs">
                  {/* Budget */}
                  <span className="font-mono font-bold text-[#261615] dark:text-[#FFEBAA] text-sm">
                    {proj.budget}
                  </span>

                  {/* Deadline with Clock icon */}
                  <span className="flex items-center gap-1.5 text-[#5C3A38] dark:text-[#D4B8A8] text-xs font-medium">
                    <Clock className="w-3.5 h-3.5 text-[#382322] dark:text-[#FFEBAA] shrink-0" />
                    <span>{proj.deadline}</span>
                  </span>

                  {/* Progress bar */}
                  <div className="flex items-center gap-1.5">
                    <div className="w-14 sm:w-16 h-2 rounded-full bg-[#382322]/15 dark:bg-black/40 overflow-hidden border border-[#382322]/20 dark:border-white/10">
                      <div
                        className="h-full bg-[#382322] dark:bg-[#FFEBAA] rounded-full transition-all duration-300"
                        style={{ width: `${proj.progress || 0}%` }}
                      />
                    </div>
                    <span className="text-[11px] font-mono text-[#5C3A38] dark:text-[#D4B8A8] font-bold">{proj.progress || 0}%</span>
                  </div>
                </div>

                {/* Direct Action Shortcut Row on the Project Card */}
                <div className="pt-2 border-t border-[#382322]/15 dark:border-[#FDEBDE]/15 grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/creator/workspace?projectId=${proj.id}`);
                    }}
                    className="px-2 py-1.5 rounded-xl bg-[#B1C8EA] hover:bg-[#c2d7f5] text-[#261615] border-2 border-[#382322] shadow-[2px_2px_0_#382322] dark:shadow-[2px_2px_0_#000] text-[11px] font-bold flex items-center justify-center gap-1.5 active:translate-x-[1px] active:translate-y-[1px] transition-all cursor-pointer"
                    title="Collaborative workspace"
                  >
                    <FolderGit2 className="w-3.5 h-3.5" />
                    <span>Workspace</span>
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/creator/payments?projectId=${proj.id}`);
                    }}
                    className="px-2 py-1.5 rounded-xl bg-[#FFEBAA] hover:bg-[#fff2cc] text-[#261615] border-2 border-[#382322] shadow-[2px_2px_0_#382322] dark:shadow-[2px_2px_0_#000] text-[11px] font-bold flex items-center justify-center gap-1.5 active:translate-x-[1px] active:translate-y-[1px] transition-all cursor-pointer"
                    title="Milestone Escrow & Payments"
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>Payments</span>
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/creator/projects/${proj.id}`);
                    }}
                    className="px-2 py-1.5 rounded-xl bg-white dark:bg-[#281B1A] hover:bg-[#FAF0E6] dark:hover:bg-[#33201F] text-[#261615] dark:text-[#FDEBDE] border-2 border-[#382322] dark:border-[#FDEBDE]/40 shadow-[2px_2px_0_#382322] dark:shadow-[2px_2px_0_#000] text-[11px] font-bold flex items-center justify-center gap-1.5 active:translate-x-[1px] active:translate-y-[1px] transition-all cursor-pointer"
                    title="Open project details to view team & manage hirings"
                  >
                    <Briefcase className="w-3.5 h-3.5" />
                    <span>Details & Team</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Projects;
