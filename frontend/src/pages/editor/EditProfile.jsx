import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Camera, Film, Save, Plus, Trash2, CheckCircle2 } from 'lucide-react';
import Button from '../../components/common/Button';
import { useAuth } from '../../context/AuthContext';

export const EditorEditProfile = () => {
  const navigate = useNavigate();
  const { editorUser } = useAuth();

  const [name, setName] = useState(editorUser.name);
  const [title, setTitle] = useState(editorUser.title);
  const [avatar, setAvatar] = useState(editorUser.avatar);
  const [bio, setBio] = useState(
    'Specializing in high-retention cinematic storytelling, fast-paced kinetic YouTube documentary edits, dynamic motion graphics, and Hollywood ACES color grading. 6+ years experience.'
  );
  const [hourlyRate, setHourlyRate] = useState('₹2,500/hr');
  const [perVideoRate, setPerVideoRate] = useState('₹24,000/video');
  const [showreelUrl, setShowreelUrl] = useState('https://vimeo.com/alexrivera/showreel2026');
  const [showreelTitle, setShowreelTitle] = useState('2026 Cinematic & YouTube Editing Showreel (4K)');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const [skills, setSkills] = useState([
    'Adobe Premiere Pro 2026',
    'After Effects',
    'DaVinci Resolve Studio',
    'Sound Design',
    'Color Grading',
    'Blender 3D'
  ]);
  const [newSkill, setNewSkill] = useState('');

  const addSkill = (e) => {
    e.preventDefault();
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const removeSkill = (skillToRemove) => {
    setSkills(skills.filter(s => s !== skillToRemove));
  };

  const handleSave = (e) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      navigate('/editor/profile');
    }, 1200);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-7 pb-16 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/editor/profile')}
            className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-400 hover:text-white border border-white/[0.06] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-purple-400 bg-purple-950/40 px-2 py-0.5 rounded-md border border-purple-800/30">
              Editor Portfolio Hub
            </span>
            <h1 className="text-2xl font-extrabold text-white tracking-tight mt-1">
              Edit Editor Profile & Showreel
            </h1>
          </div>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Avatar */}
        <div className="glass-card p-6 border border-white/[0.08] flex items-center gap-5">
          <div className="relative group">
            <img
              src={avatar}
              alt={name}
              className="w-20 h-20 rounded-2xl object-cover border-2 border-purple-500/40"
            />
            <button
              type="button"
              onClick={() => {
                const newImg = prompt('Enter image URL for new avatar:', avatar);
                if (newImg) setAvatar(newImg);
              }}
              className="absolute inset-0 bg-black/60 rounded-2xl opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white"
            >
              <Camera className="w-5 h-5" />
            </button>
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Editor Avatar</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              High resolution headshot recommended to build trust with high-paying creators.
            </p>
          </div>
        </div>

        {/* Identity & Bio */}
        <div className="glass-card p-6 md:p-7 space-y-4 border border-white/[0.08]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Full Name / Studio
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#141A28] border border-white/[0.08] text-sm text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Professional Title
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#141A28] border border-white/[0.08] text-sm text-white focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              Bio & Pitch to Clients
            </label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#141A28] border border-white/[0.08] text-xs text-white focus:outline-none focus:border-purple-500 resize-none leading-relaxed"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Hourly Rate
              </label>
              <input
                type="text"
                value={hourlyRate}
                onChange={(e) => setHourlyRate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#141A28] border border-white/[0.08] text-xs text-white focus:outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Standard Video Flat Rate
              </label>
              <input
                type="text"
                value={perVideoRate}
                onChange={(e) => setPerVideoRate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#141A28] border border-white/[0.08] text-xs text-white focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>
        </div>

        {/* Showreel Section */}
        <div className="glass-card p-6 md:p-7 space-y-4 border border-white/[0.08]">
          <div className="flex items-center gap-2 pb-3 border-b border-white/[0.05]">
            <Film className="w-4 h-4 text-purple-400" />
            <h3 className="text-base font-bold text-white">Featured 2026 Showreel</h3>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              Showreel Title
            </label>
            <input
              type="text"
              required
              value={showreelTitle}
              onChange={(e) => setShowreelTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#141A28] border border-white/[0.08] text-sm text-white focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              Showreel Embed / Video URL (Vimeo, YouTube, or MP4)
            </label>
            <input
              type="url"
              required
              value={showreelUrl}
              onChange={(e) => setShowreelUrl(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#141A28] border border-white/[0.08] text-xs text-white focus:outline-none focus:border-purple-500"
            />
          </div>
        </div>

        {/* Skills & Software Stack */}
        <div className="glass-card p-6 md:p-7 space-y-4 border border-white/[0.08]">
          <h3 className="text-base font-bold text-white">Software Tools & Proficiencies</h3>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-950/50 text-purple-300 border border-purple-800/40 text-xs font-medium"
              >
                {skill}
                <button
                  type="button"
                  onClick={() => removeSkill(skill)}
                  className="hover:text-rose-400"
                >
                  &times;
                </button>
              </span>
            ))}
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="text"
              placeholder="Add tool (e.g. Blender, Final Cut Pro, Boris FX)..."
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              className="flex-1 px-3.5 py-2 rounded-xl bg-[#141A28] text-xs text-white border border-white/[0.08] focus:outline-none focus:border-purple-500"
            />
            <Button variant="subtle" size="sm" icon={Plus} onClick={addSkill}>
              Add Tool
            </Button>
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={() => navigate('/editor/profile')}
            className="text-xs text-slate-400 hover:text-white"
          >
            Cancel
          </button>
          <Button
            type="submit"
            variant="primary"
            icon={Save}
            className="px-6 py-2.5"
          >
            {savedSuccess ? 'Showreel & Profile Updated ✓' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EditorEditProfile;
