import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Plus, DollarSign, Clock, Search, X } from 'lucide-react';
import Button from '../../components/common/Button';
import ProjectCard from '../../components/common/ProjectCard';
import { creatorProjectsData } from '../../services/projectService';

export const Projects = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [projects, setProjects] = useState(creatorProjectsData);
  const [showModal, setShowModal] = useState(() =>
    location.pathname.includes('create-project') || location.search.includes('create=true')
  );
  const [selectedProjectDetail, setSelectedProjectDetail] = useState(null);
  const [newProject, setNewProject] = useState({
    title: '',
    category: 'Video Editing',
    budget: '₹25,000',
    tags: 'YouTube, Premiere Pro',
  });

  useEffect(() => {
    if (location.pathname.includes('create-project') || location.search.includes('create=true')) {
      const timer = setTimeout(() => setShowModal(true), 0);
      return () => clearTimeout(timer);
    }
  }, [location.pathname, location.search]);

  const handleCloseModal = () => {
    setShowModal(false);
    if (location.pathname.includes('create-project')) {
      navigate('/creator/projects', { replace: true });
    }
  };

  const filtered = projects.filter(p => {
    const matchesFilter = filter === 'all' || p.status.toLowerCase().replace(' ', '-') === filter;
    const matchesSearch = !searchQuery ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (Array.isArray(p.tags) && p.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())));
    return matchesFilter && matchesSearch;
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
    handleCloseModal();
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

      {/* Filter and Search Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.06] pb-3">
        <div className="flex items-center gap-2 overflow-x-auto">
          {['all', 'in-progress', 'open', 'completed'].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all shrink-0 ${
                filter === tab
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
              }`}
            >
              {tab.replace('-', ' ')}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search projects or tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 pr-3 py-1.5 text-xs rounded-xl bg-[#0F1420] text-slate-200 border border-white/[0.08] focus:outline-none focus:border-purple-500 w-full sm:w-64"
          />
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((proj) => (
          <div key={proj.id} className="glass-card p-5 space-y-3.5 border border-white/[0.06]">
            <ProjectCard project={proj} onView={(p) => setSelectedProjectDetail(p)} />
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
                <Button variant="ghost" onClick={handleCloseModal}>
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

      {/* Project Detail Modal */}
      {selectedProjectDetail && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg glass-card p-6 border border-white/[0.1] shadow-2xl animate-fade-in">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h3 className="text-lg font-bold text-white">{selectedProjectDetail.title}</h3>
                <span className="text-xs text-slate-400 mt-0.5 block">
                  Category: {selectedProjectDetail.category} • Status: <strong className="text-emerald-400">{selectedProjectDetail.status}</strong>
                </span>
              </div>
              <button
                onClick={() => setSelectedProjectDetail(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.05]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300 mb-5">
              <div className="p-3 rounded-xl bg-[#141A28]/60 border border-white/[0.05] flex justify-between">
                <span>Budget: <strong className="text-white">{selectedProjectDetail.budget}</strong></span>
                <span>Deadline: <strong className="text-purple-300">{selectedProjectDetail.deadline}</strong></span>
              </div>

              <div className="p-3 rounded-xl bg-[#141A28]/60 border border-white/[0.05]">
                <strong className="text-white block mb-1">Tags & Skills:</strong>
                <div className="flex flex-wrap gap-1.5">
                  {Array.isArray(selectedProjectDetail.tags) && selectedProjectDetail.tags.map((t, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded-md bg-purple-950/40 text-purple-300 border border-purple-800/30 text-[11px]">
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              {selectedProjectDetail.assignedEditor && (
                <div className="p-3 rounded-xl bg-[#141A28]/60 border border-white/[0.05] flex items-center gap-3">
                  <img
                    src={selectedProjectDetail.assignedEditor.avatar}
                    alt={selectedProjectDetail.assignedEditor.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <h4 className="text-sm font-semibold text-white">{selectedProjectDetail.assignedEditor.name}</h4>
                    <span className="text-[11px] text-slate-400">Assigned Production Editor • {selectedProjectDetail.progress}% completed</span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end">
              <Button variant="primary" size="sm" onClick={() => setSelectedProjectDetail(null)}>
                Close Preview
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;
