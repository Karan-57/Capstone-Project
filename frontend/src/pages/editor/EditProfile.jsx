import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Camera, Film, Save, Plus, UploadCloud, Search, Check, X, Tag, ChevronDown } from 'lucide-react';
import Button from '../../components/common/Button';
import SEO from '../../components/common/SEO';
import { useAuth } from '../../context/AuthContext';
import { useAlert } from '../../context/AlertContext';
import { DEFAULT_PFP } from '../../constants/assets';
import api from '../../services/api';

export const EditorEditProfile = () => {
  const navigate = useNavigate();
  const { editorUser, uploadProfilePicture, updateUserProfile, setEditorUser } = useAuth();
  const { showAlert } = useAlert();
  const fileInputRef = useRef(null);
  const roleDropdownRef = useRef(null);
  const [isSaving, setIsSaving] = useState(false);

  const [name, setName] = useState(editorUser.name || 'unknown');
  const [title, setTitle] = useState(editorUser.title || 'Senior Video Editor');
  const [avatar, setAvatar] = useState(editorUser.profileImage || editorUser.avatar || DEFAULT_PFP);
  const [isUploadingImg, setIsUploadingImg] = useState(false);
  const [bio, setBio] = useState(
    editorUser.bio || ''
  );
  const [hourlyRate, setHourlyRate] = useState(editorUser.hourlyRate ? `₹${editorUser.hourlyRate}/hr` : '');
  const [perVideoRate, setPerVideoRate] = useState('');
  const [showreelUrl, setShowreelUrl] = useState('');
  const [showreelTitle, setShowreelTitle] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Content Creator Sub-Roles from backend endpoint
  const [availableRoles, setAvailableRoles] = useState([]);
  const [subRoles, setSubRoles] = useState(
    Array.isArray(editorUser.subRoles) ? editorUser.subRoles : []
  );
  const [roleSearchQuery, setRoleSearchQuery] = useState('');
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);

  useEffect(() => {
    // Fetch creator roles from backend
    api.get('/api/roles')
      .then((res) => {
        if (res.data?.roles) {
          setAvailableRoles(res.data.roles);
        }
      })
      .catch((err) => console.warn('Could not load dynamic roles:', err));
  }, []);

  // Handle clicking outside role dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (roleDropdownRef.current && !roleDropdownRef.current.contains(e.target)) {
        setIsRoleDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleSubRole = (roleTitle) => {
    if (subRoles.includes(roleTitle)) {
      setSubRoles(subRoles.filter((r) => r !== roleTitle));
    } else {
      setSubRoles([...subRoles, roleTitle]);
    }
  };

  const removeSubRole = (roleTitle) => {
    setSubRoles(subRoles.filter((r) => r !== roleTitle));
  };

  const [skills, setSkills] = useState([
    'Adobe Premiere Pro',
    'After Effects',
    'DaVinci Resolve Studio',
    'Sound Design',
    'Color Grading',
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

  const handleFileChange = async (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setIsUploadingImg(true);
      try {
        const url = await uploadProfilePicture(file);
        if (url) {
          setAvatar(url);
          showAlert('Profile picture updated from PC!', 'success');
        }
      } catch (err) {
        showAlert('Failed to upload picture from PC', 'error');
      } finally {
        setIsUploadingImg(false);
      }
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateUserProfile({
        name: name.trim(),
        bio: bio.trim(),
        subRoles: subRoles,
      });
      await api.patch('/api/portfolio', {
        title: title.trim(),
        bio: bio.trim(),
        skills: skills,
        subRoles: subRoles,
      }).catch(err => console.warn('[Portfolio Sync]:', err.message));

      setSavedSuccess(true);
      showAlert('Profile and freelancer sub-roles updated successfully!', 'success');
      setTimeout(() => {
        setSavedSuccess(false);
        navigate('/editor/profile');
      }, 1000);
    } catch (err) {
      showAlert(err.response?.data?.message || 'Failed to save editor profile', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-7 pb-16 animate-fade-in">
      <SEO
        title="Edit Editor Profile"
        description="Showcase your video editing showreel, software expertise, rates, and portfolio highlights."
      />

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
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight mt-1">
              Edit Editor Profile & Showreel
            </h1>
          </div>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Avatar */}
        <div className="glass-card p-5 sm:p-6 border border-white/[0.08] flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-4 sm:gap-5">
          <div className="relative group shrink-0">
            <img
              src={avatar || DEFAULT_PFP}
              alt={name ? `${name} avatar preview` : 'Editor avatar preview'}
              loading="lazy"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = DEFAULT_PFP;
              }}
              className="w-20 h-20 rounded-2xl object-cover border-2 border-purple-500/40"
            />
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute inset-0 bg-black/60 rounded-2xl opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white cursor-pointer"
            >
              <Camera className="w-5 h-5" />
            </button>
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Editor Avatar</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Upload custom picture from your PC or use default profile picture.
            </p>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="mt-2 text-xs font-semibold text-purple-400 hover:text-purple-300 underline underline-offset-2 flex items-center justify-center sm:justify-start gap-1 cursor-pointer"
            >
              <UploadCloud className="w-3.5 h-3.5" />
              {isUploadingImg ? 'Uploading from PC...' : 'Upload from PC'}
            </button>
          </div>
        </div>

        {/* Identity & Bio */}
        <div className="glass-card p-5 sm:p-7 space-y-4 border border-white/[0.08]">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

        {/* Content Creator Sub-Roles & Specializations */}
        <div className="glass-card p-5 sm:p-7 space-y-4 border border-white/[0.08]" ref={roleDropdownRef}>
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.05]">
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4 text-purple-400" />
              <h3 className="text-base font-bold text-white">Freelancer Creator Sub-Roles</h3>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">
              {subRoles.length} selected
            </span>
          </div>

          <p className="text-xs text-slate-400">
            Select the specific content-creation roles you specialize in. Creators search and hire freelancers by these roles.
          </p>

          {/* Selected Sub-Roles Badges */}
          {subRoles.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1">
              {subRoles.map((roleTitle) => (
                <span
                  key={roleTitle}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600/20 text-purple-200 border border-purple-500/30 text-xs font-semibold shadow-sm"
                >
                  <Check className="w-3.5 h-3.5 text-purple-400" />
                  {roleTitle}
                  <button
                    type="button"
                    onClick={() => removeSubRole(roleTitle)}
                    className="ml-1 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                    title="Remove role"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Searchable Dropdown Trigger & Input */}
          <div className="relative">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search creator roles (e.g. Thumbnail Designer, Sound Designer, Scriptwriter)..."
                value={roleSearchQuery}
                onFocus={() => setIsRoleDropdownOpen(true)}
                onChange={(e) => {
                  setRoleSearchQuery(e.target.value);
                  setIsRoleDropdownOpen(true);
                }}
                className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[#141A28] border border-white/[0.08] text-xs text-white focus:outline-none focus:border-purple-500 transition-all placeholder:text-slate-500"
              />
              <button
                type="button"
                onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1 cursor-pointer"
              >
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isRoleDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
            </div>

            {/* Dropdown Menu */}
            {isRoleDropdownOpen && (
              <div className="absolute z-30 left-0 right-0 mt-2 max-h-64 overflow-y-auto rounded-xl bg-[#0F1420] border border-purple-500/30 shadow-2xl backdrop-blur-xl p-2 space-y-1">
                {availableRoles
                  .filter((r) =>
                    r.title.toLowerCase().includes(roleSearchQuery.toLowerCase()) ||
                    r.category?.toLowerCase().includes(roleSearchQuery.toLowerCase()) ||
                    r.description?.toLowerCase().includes(roleSearchQuery.toLowerCase())
                  )
                  .map((role) => {
                    const isSelected = subRoles.includes(role.title);
                    return (
                      <button
                        key={role.id}
                        type="button"
                        onClick={() => toggleSubRole(role.title)}
                        className={`w-full flex items-center justify-between text-left px-3 py-2.5 rounded-lg text-xs transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-purple-600/25 text-purple-200 border border-purple-500/30'
                            : 'hover:bg-white/[0.05] text-slate-200'
                        }`}
                      >
                        <div className="flex-1 min-w-0 pr-3">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-white">{role.title}</span>
                            {role.category && (
                              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-white/[0.06] text-slate-400 border border-white/[0.05]">
                                {role.category}
                              </span>
                            )}
                          </div>
                          {role.description && (
                            <p className="text-[11px] text-slate-400 truncate mt-0.5">
                              {role.description}
                            </p>
                          )}
                        </div>
                        <div className="shrink-0">
                          {isSelected ? (
                            <div className="w-5 h-5 rounded-md bg-purple-600 flex items-center justify-center text-white">
                              <Check className="w-3.5 h-3.5" />
                            </div>
                          ) : (
                            <div className="w-5 h-5 rounded-md border border-white/[0.2] flex items-center justify-center text-transparent hover:border-purple-400">
                              <Plus className="w-3.5 h-3.5 text-slate-400" />
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}

                {availableRoles.filter((r) =>
                  r.title.toLowerCase().includes(roleSearchQuery.toLowerCase()) ||
                  r.category?.toLowerCase().includes(roleSearchQuery.toLowerCase()) ||
                  r.description?.toLowerCase().includes(roleSearchQuery.toLowerCase())
                ).length === 0 && (
                  <div className="text-center py-4 text-xs text-slate-400">
                    No matching roles found.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Showreel Section */}
        <div className="glass-card p-5 sm:p-7 space-y-4 border border-white/[0.08]">
          <div className="flex items-center gap-2 pb-3 border-b border-white/[0.05]">
            <Film className="w-4 h-4 text-purple-400" />
            <h3 className="text-base font-bold text-white">Featured 2026 Showreel</h3>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              Showreel Title (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. My 2026 Production Showreel"
              value={showreelTitle}
              onChange={(e) => setShowreelTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#141A28] border border-white/[0.08] text-sm text-white focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              Showreel Embed / Video URL (YouTube, Vimeo, or MP4)
            </label>
            <input
              type="url"
              placeholder="https://youtube.com/watch?v=... or MP4 URL"
              value={showreelUrl}
              onChange={(e) => setShowreelUrl(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#141A28] border border-white/[0.08] text-xs text-white focus:outline-none focus:border-purple-500"
            />
          </div>
        </div>

        {/* Skills & Software Stack */}
        <div className="glass-card p-5 sm:p-7 space-y-4 border border-white/[0.08]">
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
                  className="hover:text-rose-400 cursor-pointer"
                >
                  &times;
                </button>
              </span>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-2">
            <input
              type="text"
              placeholder="Add tool (e.g. Blender, Final Cut Pro, Boris FX)..."
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              className="flex-1 px-3.5 py-2 rounded-xl bg-[#141A28] text-xs text-white border border-white/[0.08] focus:outline-none focus:border-purple-500"
            />
            <Button variant="subtle" size="sm" icon={Plus} onClick={addSkill} className="shrink-0">
              Add Tool
            </Button>
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate('/editor/profile')}
            className="text-xs text-slate-400 hover:text-white py-2 text-center"
          >
            Cancel
          </button>
          <Button
            type="submit"
            variant="primary"
            icon={Save}
            className="px-6 py-2.5 w-full sm:w-auto"
          >
            {savedSuccess ? 'Showreel & Profile Updated ✓' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EditorEditProfile;
