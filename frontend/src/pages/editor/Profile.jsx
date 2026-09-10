import React, { useState } from 'react';
import { Star, CheckCircle2, Film, Edit3, ExternalLink, X } from 'lucide-react';
import Button from '../../components/common/Button';
import { useAuth } from '../../context/AuthContext';

export const Profile = () => {
  const { editorUser, setEditorUser } = useAuth();
  const [showEditModal, setShowEditModal] = useState(false);
  const [formData, setFormData] = useState({
    name: editorUser?.name || 'Alex Rivera',
    title: editorUser?.title || 'Senior Motion & Video Editor',
    email: editorUser?.email || 'alex@motioncraft.co',
    showreelUrl: 'https://vimeo.com/alexrivera/showreel2026',
    reelTitle: 'Alex Rivera — Commercial & YouTube Reel (4K)',
  });
  const [skills, setSkills] = useState([
    'Adobe Premiere Pro 2026',
    'After Effects',
    'DaVinci Resolve Studio',
    'Blender 3D',
    'Sound Design & iZotope',
    'Color Grading (ACES / Rec.709)',
    'Subtitles & Dynamic Hooks'
  ]);
  const [newSkillInput, setNewSkillInput] = useState('');

  const handleSaveProfile = (e) => {
    e.preventDefault();
    setEditorUser(prev => ({
      ...prev,
      name: formData.name,
      title: formData.title,
      email: formData.email,
    }));
    setShowEditModal(false);
  };

  const handleAddSkill = () => {
    if (newSkillInput.trim() && !skills.includes(newSkillInput.trim())) {
      setSkills([...skills, newSkillInput.trim()]);
      setNewSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setSkills(skills.filter(s => s !== skillToRemove));
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Profile Card */}
      <div className="glass-card p-6 border border-white/[0.06] relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-28 bg-gradient-to-r from-purple-900/40 via-blue-900/30 to-purple-800/20"></div>

        <div className="relative pt-12 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
          <div className="flex items-end gap-4">
            <img
              src={editorUser?.avatar}
              alt={editorUser?.name}
              className="w-24 h-24 rounded-2xl object-cover border-4 border-[#0F1420] shadow-xl"
            />
            <div className="mb-1">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white">{editorUser?.name}</h2>
                <CheckCircle2 className="w-4 h-4 text-purple-400 fill-purple-400/20" />
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
                  TOP RATED PRO
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {editorUser?.title} • 6+ Years Experience
              </p>
            </div>
          </div>

          <Button
            variant="subtle"
            size="sm"
            icon={Edit3}
            onClick={() => setShowEditModal(true)}
            className="self-end sm:self-auto"
          >
            Edit Showreel & Profile
          </Button>
        </div>

        <div className="mt-6 pt-5 border-t border-white/[0.05] grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-xl font-bold text-white">4.9 / 5.0</div>
            <div className="text-xs text-slate-400 flex items-center justify-center gap-1 mt-0.5">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span>(64 reviews)</span>
            </div>
          </div>
          <div>
            <div className="text-xl font-bold text-emerald-400">₹3.48L</div>
            <div className="text-xs text-slate-400 mt-0.5">Total Earned</div>
          </div>
          <div>
            <div className="text-xl font-bold text-purple-400">98%</div>
            <div className="text-xs text-slate-400 mt-0.5">On-Time Delivery</div>
          </div>
          <div>
            <div className="text-xl font-bold text-white">24</div>
            <div className="text-xs text-slate-400 mt-0.5">Jobs Completed</div>
          </div>
        </div>
      </div>

      {/* Software Proficiencies */}
      <div className="glass-card p-6 border border-white/[0.06] space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-white">Software & Tech Stack</h3>
          <span className="text-xs text-slate-400">{skills.length} verified tools</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {skills.map(tool => (
            <span
              key={tool}
              className="px-3 py-1.5 rounded-xl bg-purple-950/40 text-purple-200 border border-purple-800/30 text-xs font-medium flex items-center gap-1.5"
            >
              {tool}
            </span>
          ))}
        </div>
      </div>

      {/* Featured Showreel Embed */}
      <div className="glass-card p-6 border border-white/[0.06] space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-white">2026 Editing Showreel</h3>
          <a
            href={formData.showreelUrl}
            target="_blank"
            rel="noreferrer"
            className="text-xs text-purple-400 hover:underline flex items-center gap-1"
          >
            Watch on Vimeo <ExternalLink className="w-3 h-3" />
          </a>
        </div>
        <div
          onClick={() => window.open(formData.showreelUrl, '_blank')}
          className="aspect-video w-full rounded-xl bg-slate-900/90 border border-white/[0.06] flex flex-col items-center justify-center p-6 text-center group cursor-pointer hover:border-purple-500/40 transition-colors"
        >
          <div className="w-14 h-14 rounded-full bg-purple-600 flex items-center justify-center text-white shadow-lg shadow-purple-900/40 group-hover:scale-110 transition-transform mb-3">
            <Film className="w-6 h-6 ml-0.5" />
          </div>
          <h4 className="text-sm font-semibold text-white">{formData.reelTitle}</h4>
          <p className="text-xs text-slate-400 mt-1">Runtime: 1m 45s • High Retention Fast Cuts</p>
        </div>
      </div>

      {/* Edit Profile & Showreel Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg glass-card p-6 border border-white/[0.1] shadow-2xl animate-fade-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">Edit Editor Profile & Showreel</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.05]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="text-xs text-slate-300 block mb-1">Editor Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#141A28] border border-white/[0.08] text-sm text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1">Professional Title & Specialty</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#141A28] border border-white/[0.08] text-sm text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#141A28] border border-white/[0.08] text-sm text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1">Showreel Video URL</label>
                <input
                  type="url"
                  required
                  value={formData.showreelUrl}
                  onChange={(e) => setFormData({ ...formData, showreelUrl: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#141A28] border border-white/[0.08] text-sm text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1">Skills & Software Tags</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="Add tool or skill (e.g. Cinema 4D)..."
                    value={newSkillInput}
                    onChange={(e) => setNewSkillInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddSkill();
                      }
                    }}
                    className="flex-1 px-3 py-1.5 rounded-xl bg-[#141A28] border border-white/[0.08] text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                  <Button type="button" variant="secondary" size="xs" onClick={handleAddSkill}>
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {skills.map(skill => (
                    <span
                      key={skill}
                      className="px-2.5 py-1 rounded-lg bg-purple-950/50 text-purple-200 border border-purple-800/40 text-xs flex items-center gap-1.5"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(skill)}
                        className="text-slate-400 hover:text-rose-400"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3">
                <Button variant="ghost" onClick={() => setShowEditModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary">
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
