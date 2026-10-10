import React, { useState, useEffect } from 'react';
import { Plus, DollarSign, Clock } from 'lucide-react';
import Button from '../../components/common/Button';
import ProjectCard from '../../components/common/ProjectCard';
import { SkeletonProjectCard } from '../../components/common/Skeleton';
import SEO from '../../components/common/SEO';
import { projectService, mapBackendProject } from '../../services/projectService';
import api from '../../services/api';
import { useAlert } from '../../context/AlertContext';
import { DEFAULT_PFP } from '../../constants/assets';

export const Projects = () => {
  const { showAlert } = useAlert();
  const [filter, setFilter] = useState('all');
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newProject, setNewProject] = useState({
    title: '',
    category: 'Video Editing',
    budget: '999',
    tags: 'unknown',
    description: 'unknown'
  });

  const loadProjects = async () => {
    setLoading(true);
    const data = await projectService.getCreatorProjects();
    setProjects(data);
    setLoading(false);
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const filtered = projects.filter(p => {
    if (filter === 'all') return true;
    return p.status.toLowerCase().replace(' ', '-') === filter;
  });

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const skills = newProject.tags ? newProject.tags.split(',').map(t => t.trim()) : ['unknown'];
      const budgetNum = parseInt(newProject.budget.replace(/[^0-9]/g, ''), 10) || 999;
      
      const res = await api.post('/api/creator/projects', {
        title: newProject.title.trim() || 'unknown',
        description: newProject.description?.trim() || 'unknown',
        category: newProject.category || 'unknown',
        requiredSkills: skills,
        budget: { fixed: budgetNum },
      });

      if (res.data?.project) {
        setProjects(prev => [mapBackendProject(res.data.project), ...prev]);
        showAlert('Project created successfully!', 'success');
      } else {
        await loadProjects();
      }
      setShowModal(false);
      setNewProject({ title: '', category: 'Video Editing', budget: '999', tags: 'unknown', description: 'unknown' });
    } catch (err) {
      console.error('Failed to create project', err);
      showAlert(err.response?.data?.message || 'Failed to create project', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <SEO
        title="Manage Projects"
        description="Monitor deliverables, milestones, and active video editing pipelines."
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Manage Projects</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Monitor deliverables, revisions, and active editing milestones
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-white/[0.06] pb-3">
        {['all', 'in-progress', 'open', 'completed'].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all ${
              filter === tab
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
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
        <div className="py-16 text-center text-xs text-slate-500">
          No projects found in this category
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((proj) => (
            <div key={proj.id} className="glass-card p-5 space-y-3.5 border border-white/[0.06]">
              <ProjectCard project={proj} />
              <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-white/[0.04]">
                <span className="flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                  Budget: <strong className="text-white font-semibold">{proj.budget}</strong>
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-purple-400" />
                  Deadline: {proj.deadline}
                </span>
              </div>
              {proj.assignedEditor && (
                <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <img
                      src={proj.assignedEditor.avatar || DEFAULT_PFP}
                      alt={proj.assignedEditor.name || 'Assigned Editor Avatar'}
                      onError={(e) => { e.currentTarget.src = DEFAULT_PFP; }}
                      className="w-7 h-7 rounded-full object-cover"
                    />
                    <span className="text-xs text-slate-300">
                      Editor: <strong className="text-white">{proj.assignedEditor.name}</strong>
                    </span>
                  </div>
                  <span className="text-xs font-semibold text-purple-400">
                    {proj.progress}% Done
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Create Project Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg glass-card p-6 border border-white/[0.1] shadow-2xl animate-fade-in">
            <h3 className="text-lg font-bold text-white mb-2">Post a New Creator Project</h3>
            <p className="text-xs text-slate-400 mb-5">Fill out your project specifications for video editors.</p>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="text-xs text-slate-300 block mb-1">Project Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. YouTube Video Edit"
                  value={newProject.title}
                  onChange={e => setNewProject({...newProject, title: e.target.value})}
                  className="w-full px-3 py-2 rounded-xl bg-[#141A28] border border-white/[0.08] text-sm text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1">Description</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Details and scope..."
                  value={newProject.description}
                  onChange={e => setNewProject({...newProject, description: e.target.value})}
                  className="w-full px-3 py-2 rounded-xl bg-[#141A28] border border-white/[0.08] text-sm text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-300 block mb-1">Budget (INR)</label>
                  <input
                    type="text"
                    required
                    value={newProject.budget}
                    onChange={e => setNewProject({...newProject, budget: e.target.value})}
                    className="w-full px-3 py-2 rounded-xl bg-[#141A28] border border-white/[0.08] text-sm text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-300 block mb-1">Skills (comma separated)</label>
                  <input
                    type="text"
                    value={newProject.tags}
                    onChange={e => setNewProject({...newProject, tags: e.target.value})}
                    className="w-full px-3 py-2 rounded-xl bg-[#141A28] border border-white/[0.08] text-sm text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3">
                <Button variant="ghost" onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary">
                  Publish Project
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;
