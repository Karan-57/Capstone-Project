import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { UploadCloud, Clock, CheckCircle2, MessageSquare, X } from 'lucide-react';
import Button from '../../components/common/Button';
import { editorActiveProjectsData } from '../../services/projectService';

export const ActiveProjects = () => {
  const location = useLocation();
  const [projects, setProjects] = useState(editorActiveProjectsData);
  const [selectedProject, setSelectedProject] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const deliverId = params.get('deliver');
    return deliverId ? editorActiveProjectsData.find(p => p.id === deliverId) || null : null;
  });
  const [viewingNotesProject, setViewingNotesProject] = useState(null);
  const [versionNotes, setVersionNotes] = useState('');
  const [deliverSuccess, setDeliverSuccess] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const deliverId = params.get('deliver');
    if (deliverId) {
      const match = projects.find(p => p.id === deliverId);
      if (match) {
        const timer = setTimeout(() => setSelectedProject(match), 0);
        return () => clearTimeout(timer);
      }
    }
  }, [location.search, projects]);

  const handleDeliverCut = (e) => {
    e.preventDefault();
    if (!selectedProject) return;

    setDeliverSuccess(true);
    setProjects(prev =>
      prev.map(p =>
        p.id === selectedProject.id
          ? { ...p, status: 'In Review', progress: 100 }
          : p
      )
    );

    setTimeout(() => {
      setSelectedProject(null);
      setDeliverSuccess(false);
      setVersionNotes('');
    }, 1200);
  };

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
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
                  proj.status === 'In Review'
                    ? 'bg-purple-500/15 text-purple-300 border-purple-500/25'
                    : 'bg-amber-500/15 text-amber-300 border-amber-500/25'
                }`}>
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
                  className="h-full bg-gradient-to-r from-purple-600 to-indigo-500 rounded-full transition-all duration-500"
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
                  onClick={() => setViewingNotesProject(proj)}
                >
                  View Notes (2)
                </Button>
                <Button
                  variant="primary"
                  size="xs"
                  icon={UploadCloud}
                  onClick={() => {
                    setDeliverSuccess(false);
                    setSelectedProject(proj);
                  }}
                >
                  Upload Next Version
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Revision Notes Modal */}
      {viewingNotesProject && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md glass-card p-6 border border-white/[0.1] shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-purple-400" />
                Client Revision Notes
              </h3>
              <button
                onClick={() => setViewingNotesProject(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.05]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 mb-5 text-xs text-slate-300">
              <p className="text-slate-400">
                Timestamp feedback from <strong>{viewingNotesProject.client}</strong> for <em>{viewingNotesProject.title}</em>:
              </p>
              <div className="p-3.5 rounded-xl bg-[#141A28]/80 border border-white/[0.05] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-purple-400 font-semibold bg-purple-950/40 px-2 py-0.5 rounded border border-purple-800/30">
                    ⏱ 01:24 — 01:38
                  </span>
                  <span className="text-[10px] text-slate-400">Marked 3h ago</span>
                </div>
                <p className="text-slate-200">
                  "The intro hook pace is great, but let's punch up the bass drop and dynamic zooms right as the thumbnail pops up."
                </p>
              </div>
              <div className="p-3.5 rounded-xl bg-[#141A28]/80 border border-white/[0.05] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-purple-400 font-semibold bg-purple-950/40 px-2 py-0.5 rounded border border-purple-800/30">
                    ⏱ 08:42 — 09:10
                  </span>
                  <span className="text-[10px] text-slate-400">Marked 2h ago</span>
                </div>
                <p className="text-slate-200">
                  "Color grade here looks a bit oversaturated on the skin tones. Please pull back the warmth slightly to match scene 1."
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setViewingNotesProject(null)}>
                Close
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  const p = viewingNotesProject;
                  setViewingNotesProject(null);
                  setSelectedProject(p);
                }}
              >
                Upload Revision
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Cut Modal */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md glass-card p-6 border border-white/[0.1] shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-bold text-white">Deliver Project Cut</h3>
              <button
                onClick={() => setSelectedProject(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.05]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Upload MP4 / ProRes or Frame.io link for <strong>{selectedProject.title}</strong>
            </p>

            {deliverSuccess ? (
              <div className="py-6 text-center space-y-2">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto animate-bounce" />
                <h4 className="text-base font-bold text-white">Version Submitted to Creator!</h4>
                <p className="text-xs text-slate-400">Milestone updated to In Review. Client notified for approval.</p>
              </div>
            ) : (
              <form onSubmit={handleDeliverCut}>
                <div
                  onClick={() => document.getElementById('cut-file-input')?.click()}
                  className="border-2 border-dashed border-purple-500/30 rounded-2xl p-6 text-center bg-purple-950/10 mb-4 hover:border-purple-400 transition-colors cursor-pointer"
                >
                  <UploadCloud className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-white">Drag & drop video file or click to browse</p>
                  <span className="text-[10px] text-slate-500 block mt-1">Supports up to 20GB (MP4, MOV, MKV)</span>
                  <input id="cut-file-input" type="file" className="hidden" />
                </div>

                <div className="mb-4">
                  <label className="text-xs text-slate-300 block mb-1">Version Notes / Timestamp Highlights</label>
                  <textarea
                    rows={3}
                    required
                    value={versionNotes}
                    onChange={(e) => setVersionNotes(e.target.value)}
                    placeholder="Added sound FX at 02:14, cleaned audio noise, color graded scenes according to timestamp feedback..."
                    className="w-full px-3 py-2 rounded-xl bg-[#141A28] border border-white/[0.08] text-xs text-white focus:outline-none focus:border-purple-500 resize-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2.5">
                  <Button variant="ghost" onClick={() => setSelectedProject(null)}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary">
                    Submit Cut to Creator
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ActiveProjects;
