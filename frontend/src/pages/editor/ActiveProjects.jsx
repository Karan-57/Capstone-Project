import React, { useState, useEffect } from 'react';
import { UploadCloud, CheckCircle2, Clock, FileVideo } from 'lucide-react';
import Button from '../../components/common/Button';
import { projectService } from '../../services/projectService';

export const ActiveProjects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProjects = async () => {
      setLoading(true);
      const data = await projectService.getEditorActive();
      setProjects(data);
      setLoading(false);
    };
    loadProjects();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight">In-Production Contracts</h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Submit rough cuts, review frame-accurate client timestamps, and trigger escrow payouts
        </p>
      </div>

      {loading ? (
        <div className="py-16 text-center text-xs text-slate-400">Loading contracts...</div>
      ) : projects.length === 0 ? (
        <div className="py-16 text-center text-xs text-slate-500">
          No active in-production contracts
        </div>
      ) : (
        <div className="space-y-4">
          {projects.map((proj) => (
            <div
              key={proj.id}
              className="glass-card p-5.5 border border-white/[0.06] space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <img
                    src={proj.clientAvatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=80'}
                    alt={proj.client}
                    className="w-11 h-11 rounded-xl object-cover border border-white/10"
                  />
                  <div>
                    <h3 className="text-base font-bold text-white">{proj.title || 'unknown'}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Creator: <span className="text-white font-medium">{proj.client || 'unknown'}</span> • Deliverable: <span className="text-purple-300">{proj.deliverableType || 'unknown'}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/25">
                    {proj.status || 'unknown'}
                  </span>
                  <span className="text-sm font-bold text-emerald-400 pl-2">
                    {proj.budget || '999'}
                  </span>
                </div>
              </div>

              {/* Progress Slider */}
              <div>
                <div className="flex justify-between text-xs text-slate-300 mb-1.5">
                  <span className="flex items-center gap-1 text-slate-400">
                    <Clock className="w-3.5 h-3.5" /> Due {proj.dueDate || 'unknown'}
                  </span>
                  <span className="font-semibold text-purple-400">{proj.progress != null ? proj.progress : 999}% Completed</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-600 to-indigo-500 rounded-full"
                    style={{ width: `${proj.progress || 0}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ActiveProjects;
