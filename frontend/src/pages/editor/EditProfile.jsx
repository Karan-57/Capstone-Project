import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Camera, Film, Save, Plus, UploadCloud, Search, Check, X, Tag, ChevronDown, Phone } from 'lucide-react';
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
  const [phoneNumber, setPhoneNumber] = useState(editorUser.phoneNumber || editorUser.phone || '');
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
        title: title.trim(),
        phone: phoneNumber.trim(),
        phoneNumber: phoneNumber.trim(),
        subRoles: subRoles,
        tools: skills,
        skills: skills,
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
    <div className="max-w-3xl mx-auto space-y-7 pb-16 animate-fade-in text-[#261615] dark:text-[#FDEBDE]">
      <SEO
        title="Edit Editor Profile"
        description="Showcase your video editing showreel, software expertise, rates, and portfolio highlights."
      />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/editor/profile')}
            className="p-2 rounded-xl bg-[#FFF7F1] dark:bg-[#201413] border-2 border-[#382322] dark:border-[#FDEBDE]/30 shadow-[2px_2px_0_#382322] text-[#261615] dark:text-[#FDEBDE] hover:bg-[#FFEBAA] transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#261615] bg-[#FFEBAA] px-2.5 py-0.5 rounded-md border-2 border-[#382322] shadow-[2px_2px_0_#382322]">
                Editor Portfolio Hub
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black font-serif text-[#261615] dark:text-[#FDEBDE] tracking-tight">
              Edit Editor Profile & Showreel
            </h1>
          </div>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Avatar */}
        <div className="bg-[#FFF7F1] dark:bg-[#201413] border-2 border-[#382322] dark:border-[#FDEBDE]/30 rounded-2xl shadow-[4px_4px_0_#382322] p-5 sm:p-6 flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-4 sm:gap-5">
          <div className="relative group shrink-0">
            <img
              src={avatar || DEFAULT_PFP}
              alt={name ? `${name} avatar preview` : 'Editor avatar preview'}
              loading="lazy"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = DEFAULT_PFP;
              }}
              className="w-20 h-20 rounded-2xl object-cover border-4 border-[#382322] dark:border-[#FFEBAA] shadow-[2px_2px_0_#382322] bg-[#FAF0E6]"
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
            <h3 className="text-sm sm:text-base font-black font-serif text-[#261615] dark:text-[#FDEBDE]">Editor Avatar</h3>
            <p className="text-xs text-[#5C3A38] dark:text-[#D4B8A8] mt-0.5">
              Upload custom picture from your computer or use default profile picture.
            </p>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="mt-2 text-xs font-mono font-bold text-[#261615] dark:text-[#FFEBAA] underline underline-offset-2 flex items-center justify-center sm:justify-start gap-1 cursor-pointer"
            >
              <UploadCloud className="w-3.5 h-3.5" />
              {isUploadingImg ? 'Uploading from PC...' : 'Upload from PC'}
            </button>
          </div>
        </div>

        {/* Identity & Bio */}
        <div className="bg-[#FFF7F1] dark:bg-[#201413] border-2 border-[#382322] dark:border-[#FDEBDE]/30 rounded-2xl shadow-[4px_4px_0_#382322] p-5 sm:p-7 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-mono font-bold text-[#261615] dark:text-[#FDEBDE] block mb-1.5">
                Full Name / Studio
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#1A1110] border-2 border-[#382322] dark:border-[#FDEBDE]/30 text-sm font-semibold text-[#261615] dark:text-[#FDEBDE] focus:outline-none focus:ring-2 focus:ring-[#FFEBAA] transition-all"
              />
            </div>

            <div>
              <label className="text-xs font-mono font-bold text-[#261615] dark:text-[#FDEBDE] block mb-1.5">
                Professional Title
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#1A1110] border-2 border-[#382322] dark:border-[#FDEBDE]/30 text-sm font-semibold text-[#261615] dark:text-[#FDEBDE] focus:outline-none focus:ring-2 focus:ring-[#FFEBAA] transition-all"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-mono font-bold text-[#261615] dark:text-[#FDEBDE] block mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-[#261615] dark:text-[#FFEBAA]" />
                Phone Number
              </span>
              <span className="text-[11px] font-normal text-[#5C3A38] dark:text-[#D4B8A8]">Optional</span>
            </label>
            <input
              type="tel"
              placeholder="+91 98765 43210"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#1A1110] border-2 border-[#382322] dark:border-[#FDEBDE]/30 text-sm font-semibold text-[#261615] dark:text-[#FDEBDE] focus:outline-none focus:ring-2 focus:ring-[#FFEBAA] transition-all placeholder:text-[#5C3A38]/50"
            />
            <p className="text-[11px] font-mono text-[#5C3A38] dark:text-[#D4B8A8] mt-1">
              Used for client communication. Manage who can view your number in Settings (Public, Hired Only, or Private).
            </p>
          </div>

          <div>
            <label className="text-xs font-mono font-bold text-[#261615] dark:text-[#FDEBDE] block mb-1.5">
              Bio & Pitch to Clients
            </label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#1A1110] border-2 border-[#382322] dark:border-[#FDEBDE]/30 text-xs font-medium text-[#261615] dark:text-[#FDEBDE] focus:outline-none focus:ring-2 focus:ring-[#FFEBAA] resize-none leading-relaxed transition-all"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-mono font-bold text-[#261615] dark:text-[#FDEBDE] block mb-1.5">
                Hourly Rate
              </label>
              <input
                type="text"
                value={hourlyRate}
                onChange={(e) => setHourlyRate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#1A1110] border-2 border-[#382322] dark:border-[#FDEBDE]/30 text-xs font-semibold text-[#261615] dark:text-[#FDEBDE] focus:outline-none focus:ring-2 focus:ring-[#FFEBAA] transition-all"
              />
            </div>
            <div>
              <label className="text-xs font-mono font-bold text-[#261615] dark:text-[#FDEBDE] block mb-1.5">
                Standard Video Flat Rate
              </label>
              <input
                type="text"
                value={perVideoRate}
                onChange={(e) => setPerVideoRate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#1A1110] border-2 border-[#382322] dark:border-[#FDEBDE]/30 text-xs font-semibold text-[#261615] dark:text-[#FDEBDE] focus:outline-none focus:ring-2 focus:ring-[#FFEBAA] transition-all"
              />
            </div>
          </div>
        </div>

        {/* Content Creator Sub-Roles & Specializations */}
        <div className="bg-[#FFF7F1] dark:bg-[#201413] border-2 border-[#382322] dark:border-[#FDEBDE]/30 rounded-2xl shadow-[4px_4px_0_#382322] p-5 sm:p-7 space-y-4" ref={roleDropdownRef}>
          <div className="flex items-center justify-between pb-3 border-b-2 border-[#382322]/15 dark:border-[#FDEBDE]/20">
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4 text-[#261615] dark:text-[#FFEBAA]" />
              <h3 className="text-base font-black font-serif text-[#261615] dark:text-[#FDEBDE]">Freelancer Creator Sub-Roles</h3>
            </div>
            <span className="text-[11px] font-mono font-bold text-[#5C3A38] dark:text-[#D4B8A8]">
              {subRoles.length} selected
            </span>
          </div>

          <p className="text-xs text-[#5C3A38] dark:text-[#D4B8A8]">
            Select the specific content-creation roles you specialize in. Creators search and hire freelancers by these roles.
          </p>

          {/* Selected Sub-Roles Badges */}
          {subRoles.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1">
              {subRoles.map((roleTitle) => (
                <span
                  key={roleTitle}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FFEBAA] text-[#261615] border-2 border-[#382322] text-xs font-mono font-bold shadow-[2px_2px_0_#382322]"
                >
                  <Check className="w-3.5 h-3.5 text-[#261615]" />
                  {roleTitle}
                  <button
                    type="button"
                    onClick={() => removeSubRole(roleTitle)}
                    className="ml-1 text-[#261615]/70 hover:text-rose-600 transition-colors cursor-pointer"
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
              <Search className="w-4 h-4 text-[#5C3A38] dark:text-[#D4B8A8] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search creator roles (e.g. Thumbnail Designer, Sound Designer, Scriptwriter)..."
                value={roleSearchQuery}
                onFocus={() => setIsRoleDropdownOpen(true)}
                onChange={(e) => {
                  setRoleSearchQuery(e.target.value);
                  setIsRoleDropdownOpen(true);
                }}
                className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-white dark:bg-[#1A1110] border-2 border-[#382322] dark:border-[#FDEBDE]/30 text-xs font-semibold text-[#261615] dark:text-[#FDEBDE] focus:outline-none focus:ring-2 focus:ring-[#FFEBAA] transition-all placeholder:text-[#5C3A38]/50"
              />
              <button
                type="button"
                onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5C3A38] dark:text-[#D4B8A8] hover:text-[#261615] p-1 cursor-pointer"
              >
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isRoleDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
            </div>

            {/* Dropdown Menu */}
            {isRoleDropdownOpen && (
              <div className="absolute z-30 left-0 right-0 mt-2 max-h-64 overflow-y-auto rounded-xl bg-[#FFF7F1] dark:bg-[#201413] border-2 border-[#382322] dark:border-[#FDEBDE]/30 shadow-[4px_4px_0_#382322] p-2 space-y-1">
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
                            ? 'bg-[#FFEBAA] text-[#261615] border border-[#382322] font-bold'
                            : 'hover:bg-[#FAF0E6] dark:hover:bg-[#19100F] text-[#261615] dark:text-[#FDEBDE]'
                        }`}
                      >
                        <div className="flex-1 min-w-0 pr-3">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-[#261615] dark:text-[#FDEBDE]">{role.title}</span>
                            {role.category && (
                              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-[#FAF0E6] dark:bg-[#19100F] text-[#5C3A38] dark:text-[#D4B8A8] border border-[#382322]/20">
                                {role.category}
                              </span>
                            )}
                          </div>
                          {role.description && (
                            <p className="text-[11px] text-[#5C3A38] dark:text-[#D4B8A8] truncate mt-0.5">
                              {role.description}
                            </p>
                          )}
                        </div>
                        <div className="shrink-0">
                          {isSelected ? (
                            <div className="w-5 h-5 rounded-md bg-[#382322] text-[#FFEBAA] flex items-center justify-center">
                              <Check className="w-3.5 h-3.5" />
                            </div>
                          ) : (
                            <div className="w-5 h-5 rounded-md border-2 border-[#382322]/30 flex items-center justify-center text-transparent hover:border-[#382322]">
                              <Plus className="w-3.5 h-3.5 text-[#5C3A38]" />
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
                  <div className="text-center py-4 text-xs font-mono text-[#5C3A38] dark:text-[#D4B8A8]">
                    No matching roles found.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Showreel Section */}
        <div className="bg-[#FFF7F1] dark:bg-[#201413] border-2 border-[#382322] dark:border-[#FDEBDE]/30 rounded-2xl shadow-[4px_4px_0_#382322] p-5 sm:p-7 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b-2 border-[#382322]/15 dark:border-[#FDEBDE]/20">
            <Film className="w-4 h-4 text-[#261615] dark:text-[#FFEBAA]" />
            <h3 className="text-base font-black font-serif text-[#261615] dark:text-[#FDEBDE]">Featured 2026 Showreel</h3>
          </div>

          <div>
            <label className="text-xs font-mono font-bold text-[#261615] dark:text-[#FDEBDE] block mb-1.5">
              Showreel Title (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. My 2026 Production Showreel"
              value={showreelTitle}
              onChange={(e) => setShowreelTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#1A1110] border-2 border-[#382322] dark:border-[#FDEBDE]/30 text-sm font-semibold text-[#261615] dark:text-[#FDEBDE] focus:outline-none focus:ring-2 focus:ring-[#FFEBAA] transition-all"
            />
          </div>

          <div>
            <label className="text-xs font-mono font-bold text-[#261615] dark:text-[#FDEBDE] block mb-1.5">
              Showreel Embed / Video URL (YouTube, Vimeo, or MP4)
            </label>
            <input
              type="url"
              placeholder="https://youtube.com/watch?v=... or MP4 URL"
              value={showreelUrl}
              onChange={(e) => setShowreelUrl(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#1A1110] border-2 border-[#382322] dark:border-[#FDEBDE]/30 text-xs font-semibold text-[#261615] dark:text-[#FDEBDE] focus:outline-none focus:ring-2 focus:ring-[#FFEBAA] transition-all"
            />
          </div>
        </div>

        {/* Skills & Software Stack */}
        <div className="bg-[#FFF7F1] dark:bg-[#201413] border-2 border-[#382322] dark:border-[#FDEBDE]/30 rounded-2xl shadow-[4px_4px_0_#382322] p-5 sm:p-7 space-y-4">
          <h3 className="text-base font-black font-serif text-[#261615] dark:text-[#FDEBDE]">Software Tools & Proficiencies</h3>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FAF0E6] dark:bg-[#19100F] text-[#261615] dark:text-[#FDEBDE] border-2 border-[#382322]/20 dark:border-[#FDEBDE]/20 text-xs font-mono font-bold shadow-sm"
              >
                {skill}
                <button
                  type="button"
                  onClick={() => removeSkill(skill)}
                  className="hover:text-rose-600 cursor-pointer"
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
              className="flex-1 px-3.5 py-2 rounded-xl bg-white dark:bg-[#1A1110] text-xs font-semibold text-[#261615] dark:text-[#FDEBDE] border-2 border-[#382322] dark:border-[#FDEBDE]/30 focus:outline-none focus:ring-2 focus:ring-[#FFEBAA] transition-all"
            />
            <Button variant="secondary" size="sm" icon={Plus} onClick={addSkill} className="shrink-0">
              Add Tool
            </Button>
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate('/editor/profile')}
            className="text-xs font-mono font-bold text-[#5C3A38] dark:text-[#D4B8A8] hover:text-[#261615] py-2 text-center cursor-pointer"
          >
            Cancel
          </button>
          <Button
            type="submit"
            variant="primary"
            icon={Save}
            disabled={isSaving}
            className="px-6 py-2.5 w-full sm:w-auto cursor-pointer"
          >
            {savedSuccess ? 'Showreel & Profile Updated ✓' : isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EditorEditProfile;
