import React, { useState } from 'react';
import { Plus, DollarSign, Clock } from 'lucide-react';
import Button from '../../components/common/Button';
import ProjectCard from '../../components/common/ProjectCard';
import { creatorProjectsData } from '../../services/projectService';

export const Projects = () => {
  const [filter, setFilter] = useState('all');
  const [projects, setProjects] = useState(creatorProjectsData);
  const [showModal, setShowModal] = useState(false);
  const [newProject, setNewProject] = useState({
    title: '',
    category: 'Video Editing',
    budget: '₹25,000',
    tags: 'YouTube, Premiere Pro',
  });

  const filtered = projects.filter(p => {
    if (filter === 'all') return true;
    return p.status.toLowerCase().replace(' ', '-') === filter;
  });

  const handleCreate = (e) => {
    e.preventDefault();
    const created = {
      id: `proj-${Date.now()}`,
      title: newProject.title,
      tags: newProject.tags.split(',').map(t => t.trim()),
      category: newProject.category,
      iconType: 'film',
      iconBg: 'bg-purple-500/10 text-purple-400 border border-purple-500/20',
      status: 'Open',
      statusColor: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
      assignedEditor: null,
      progress: 0,
      deadline: '2026-09-30',
      budget: newProject.budget,
    };
    setProjects([created, ...projects]);
    setShowModal(false);
    setNewProject({ title: '', category: 'Video Editing', budget: '₹25,000', tags: 'YouTube, Premiere Pro' });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Manage Projects</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Monitor deliverables, revisions, and active editing milestones
          </p>
        </div>
        <Button
          variant="primary"
          icon={Plus}
          onClick={() => setShowModal(true)}
          className="self-start sm:self-auto"
        >
          Create New Project
        </Button>
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
                    src={proj.assignedEditor.avatar}
                    alt={proj.assignedEditor.name}
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
                  placeholder="e.g. 15-Minute Mystery Documentary Video"
                  value={newProject.title}
                  onChange={e => setNewProject({...newProject, title: e.target.value})}
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
                  <label className="text-xs text-slate-300 block mb-1">Tags (comma separated)</label>
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
