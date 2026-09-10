import React, { useState } from 'react';
import { UploadCloud, Clock } from 'lucide-react';
import Button from '../../components/common/Button';
import { editorActiveProjectsData } from '../../services/projectService';

export const ActiveProjects = () => {
  const [projects] = useState(editorActiveProjectsData);
  const [selectedProject, setSelectedProject] = useState(null);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight">In-Production Contracts</h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Submit rough cuts, review frame-accurate client timestamps, and trigger escrow payouts
        </p>
      </div>

      <div className="space-y-4">
        {projects.map((proj) => (
          <div
            key={proj.id}
            className="glass-card p-5.5 border border-white/[0.06] space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <img
                  src={proj.clientAvatar}
                  alt={proj.client}
                  className="w-11 h-11 rounded-xl object-cover border border-white/10"
                />
                <div>
                  <h3 className="text-base font-bold text-white">{proj.title}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Creator: <span className="text-white font-medium">{proj.client}</span> • Deliverable: <span className="text-purple-300">{proj.deliverableType}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/25">
                  {proj.status}
                </span>
                <span className="text-sm font-bold text-emerald-400 pl-2">
                  {proj.budget}
                </span>
              </div>
            </div>

            {/* Progress Slider */}
            <div>
              <div className="flex justify-between text-xs text-slate-300 mb-1.5">
                <span className="flex items-center gap-1 text-slate-400">
                  <Clock className="w-3.5 h-3.5" /> Due {proj.dueDate} ({proj.hoursRemaining} hours remaining)
                </span>
                <span className="font-semibold text-purple-400">{proj.progress}% Completed</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-600 to-indigo-500 rounded-full"
                  style={{ width: `${proj.progress}%` }}
                ></div>
              </div>
            </div>

            {/* Actions Bar */}
            <div className="pt-3 border-t border-white/[0.04] flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span>Escrow status: <strong className="text-emerald-400">Funded & Protected</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="subtle"
                  size="xs"
                  onClick={() => alert(`Opening revision timeline for ${proj.title}`)}
                >
                  View Notes (2)
                </Button>
                <Button
                  variant="primary"
                  size="xs"
                  icon={UploadCloud}
                  onClick={() => setSelectedProject(proj)}
                >
                  Upload Next Version
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Upload Cut Modal */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md glass-card p-6 border border-white/[0.1] shadow-2xl animate-fade-in">
            <h3 className="text-lg font-bold text-white mb-1">Deliver Project Cut</h3>
            <p className="text-xs text-slate-400 mb-4">
              Upload MP4 / ProRes or Frame.io link for <strong>{selectedProject.title}</strong>
            </p>

            <div className="border-2 border-dashed border-purple-500/30 rounded-2xl p-6 text-center bg-purple-950/10 mb-4 hover:border-purple-400 transition-colors cursor-pointer">
              <UploadCloud className="w-8 h-8 text-purple-400 mx-auto mb-2" />
              <p className="text-xs font-semibold text-white">Drag & drop video file or click to browse</p>
              <span className="text-[10px] text-slate-500 block mt-1">Supports up to 20GB (MP4, MOV, MKV)</span>
            </div>

            <div className="mb-4">
              <label className="text-xs text-slate-300 block mb-1">Version Notes / Timestamp Highlights</label>
              <textarea
                rows={3}
                placeholder="Added sound FX at 02:14, cleaned audio noise, color graded scenes..."
                className="w-full px-3 py-2 rounded-xl bg-[#141A28] border border-white/[0.08] text-xs text-white focus:outline-none focus:border-purple-500 resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5">
              <Button variant="ghost" onClick={() => setSelectedProject(null)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  alert(`Delivered new cut for ${selectedProject.title}! The creator will be notified.`);
                  setSelectedProject(null);
                }}
              >
                Submit Cut to Creator
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActiveProjects;
