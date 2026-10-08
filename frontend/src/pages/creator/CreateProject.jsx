import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  ArrowLeft,
  Calendar,
  DollarSign,
  Clock,
  Link as LinkIcon,
  CheckCircle2,
  Film,
  Layers,
  FileText,
  Send,
  Plus,
  Trash2,
  Eye
} from 'lucide-react';
import Button from '../../components/common/Button';
import FolderUploadDropzone from '../../components/common/FolderUploadDropzone';

export const CreateProject = () => {
  const navigate = useNavigate();

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('YouTube Longform');
  const [editingStyle, setEditingStyle] = useState('Cinematic Storytelling');
  const [requiredSkills, setRequiredSkills] = useState(['Adobe Premiere Pro', 'Sound Design']);
  const [budgetCurrency, setBudgetCurrency] = useState('INR');
  const [budget, setBudget] = useState('25000');
  const [deadline, setDeadline] = useState('2026-09-20');
  const [duration, setDuration] = useState('10 - 15 Minutes');
  const [referenceLinks, setReferenceLinks] = useState(['https://youtube.com/watch?v=sample-aesthetic']);
  const [newLink, setNewLink] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');
  
  // Upload States
  const [referenceImages, setReferenceImages] = useState([]);
  const [sampleFiles, setSampleFiles] = useState([]);

  // Completion Dialog State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [createdProjectId, setCreatedProjectId] = useState('');
  const [aiFilledNotice, setAiFilledNotice] = useState(false);

  // Check for Collabo AI Auto-Fill payload
  React.useEffect(() => {
    const applyAutoFill = (data) => {
      if (!data) return;
      if (data.title) setTitle(data.title);
      if (data.budget) setBudget(data.budget);
      if (data.category) setCategory(data.category);
      if (data.editingStyle) setEditingStyle(data.editingStyle);
      if (data.requiredSkills) setRequiredSkills(data.requiredSkills);
      if (data.duration) setDuration(data.duration);
      if (data.deadline) setDeadline(data.deadline);
      if (data.description) setDescription(data.description);
      setAiFilledNotice(true);
      window.__collaboAutoFill = null;
    };

    if (window.__collaboAutoFill) {
      applyAutoFill(window.__collaboAutoFill);
    }

    const handleEvent = (e) => applyAutoFill(e.detail);
    window.addEventListener('collabo-ai-fill-project', handleEvent);
    return () => window.removeEventListener('collabo-ai-fill-project', handleEvent);
  }, []);

  const categories = [
    'YouTube Longform',
    'Shorts / TikTok / Reels',
    'Documentary & Essay',
    'Commercial & Brand Ad',
    'Podcast Multi-Cam',
    'Tech & Product Review',
    'Gaming Montage'
  ];

  const editingStyles = [
    'Cinematic Storytelling',
    'Fast-Paced Kinetic & Memes',
    'Alex Hormozi Retention Style',
    'Minimalist & Clean (Notion/Linear)',
    'Documentary Vox-Style Explainer',
    'Luxury & Film Grade (24fps)'
  ];

  const skillOptions = [
    'Adobe Premiere Pro',
    'After Effects',
    'DaVinci Resolve Studio',
    'Color Grading (LUTs)',
    'Sound Design & Foley',
    'Dynamic Captions',
    '3D Motion / Blender',
    'Thumbnail Design'
  ];

  const durationOptions = [
    'Under 60 Seconds (Shorts/Reels)',
    '3 - 5 Minutes',
    '8 - 12 Minutes',
    '15 - 25 Minutes',
    '30+ Minutes (Deep Dive / Podcast)'
  ];

  const toggleSkill = (skill) => {
    if (requiredSkills.includes(skill)) {
      setRequiredSkills(requiredSkills.filter(s => s !== skill));
    } else {
      setRequiredSkills([...requiredSkills, skill]);
    }
  };

  const addReferenceLink = (e) => {
    e.preventDefault();
    if (newLink.trim()) {
      setReferenceLinks([...referenceLinks, newLink.trim()]);
      setNewLink('');
    }
  };

  const removeReferenceLink = (index) => {
    setReferenceLinks(referenceLinks.filter((_, idx) => idx !== index));
  };

  const handlePublish = (e) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Please enter a project title.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      const generatedId = `PRJ-${Math.floor(1000 + Math.random() * 9000)}`;
      setCreatedProjectId(generatedId);
      setShowSuccessModal(true);
    }, 1000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16 animate-fade-in">
      {/* Top Breadcrumb & Page Title */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/creator/dashboard')}
            className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-400 hover:text-white border border-white/[0.06] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-purple-400 bg-purple-950/40 px-2 py-0.5 rounded-md border border-purple-800/30">
                New Production
              </span>
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight mt-1">
              Create Project
            </h1>
          </div>
        </div>

        {aiFilledNotice && (
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-purple-950/60 border border-purple-500/40 text-xs text-purple-200 shadow-md shadow-purple-950 animate-bounce">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>Auto-filled by <strong>Collabo AI Voice Agent</strong></span>
          </div>
        )}
      </div>

      {/* Main Project Form */}
      <form onSubmit={handlePublish} className="space-y-7">
        {/* Section 1: Basic Information */}
        <div className="glass-card p-6 md:p-7 space-y-5 border border-white/[0.08]">
          <div className="flex items-center gap-2 pb-3 border-b border-white/[0.05]">
            <Film className="w-4 h-4 text-purple-400" />
            <h3 className="text-base font-bold text-white">Project Overview</h3>
          </div>

          {/* Project Title */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              Project Title <span className="text-purple-400">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. 15-Min Cinematic Tech Documentary on Future of Autonomous AI"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-[#141A28] border border-white/[0.08] text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              Project Brief & Description <span className="text-purple-400">*</span>
            </label>
            <textarea
              rows={4}
              required
              placeholder="Describe your vision, story outline, target audience, and key pacing expectations for the video editor..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-[#141A28] border border-white/[0.08] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all resize-none leading-relaxed"
            />
          </div>

          {/* Category & Editing Style Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#141A28] border border-white/[0.08] text-xs text-white focus:outline-none focus:border-purple-500"
              >
                {categories.map((c) => (
                  <option key={c} value={c} className="bg-[#141A28] text-white">
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Editing Style
              </label>
              <select
                value={editingStyle}
                onChange={(e) => setEditingStyle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#141A28] border border-white/[0.08] text-xs text-white focus:outline-none focus:border-purple-500"
              >
                {editingStyles.map((s) => (
                  <option key={s} value={s} className="bg-[#141A28] text-white">
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Required Skills Badges */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-2">
              Required Skills & Software (Click to select)
            </label>
            <div className="flex flex-wrap gap-2">
              {skillOptions.map((skill) => {
                const isSelected = requiredSkills.includes(skill);
                return (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => toggleSkill(skill)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-xl border transition-all ${
                      isSelected
                        ? 'bg-purple-600 text-white border-purple-500 shadow-sm shadow-purple-900/40'
                        : 'bg-[#141A28]/80 text-slate-400 border-white/[0.06] hover:text-white hover:border-white/20'
                    }`}
                  >
                    {skill} {isSelected && '✓'}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Section 2: Interactive Reference Images Dropzone with Folder Animation */}
        <div className="glass-card p-6 md:p-7 space-y-4 border border-white/[0.08]">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.05]">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-400" />
              <h3 className="text-base font-bold text-white">Reference Images & Moodboard</h3>
            </div>
            <span className="text-[11px] text-slate-400">Thumbnails, color grading stills, or framing references</span>
          </div>

          <FolderUploadDropzone
            label="Upload Reference Images & Visual Moodboard"
            description="Drag and drop your thumbnail inspiration, storyboard images, or visual style screenshots"
            acceptedFileTypes="image/*"
            badgeText="IMAGES"
            onFilesSelected={(files) => setReferenceImages(files)}
          />
        </div>

        {/* Section 3: Budget, Deadline & Duration */}
        <div className="glass-card p-6 md:p-7 space-y-5 border border-white/[0.08]">
          <div className="flex items-center gap-2 pb-3 border-b border-white/[0.05]">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            <h3 className="text-base font-bold text-white">Budget, Timeline & Length</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Budget */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Total Budget
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-slate-400 text-xs font-bold">
                  <span>{budgetCurrency === 'INR' ? '₹' : '$'}</span>
                </div>
                <input
                  type="number"
                  required
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="w-full pl-8 pr-16 py-2.5 rounded-xl bg-[#141A28] border border-white/[0.08] text-sm text-white font-semibold focus:outline-none focus:border-purple-500"
                />
                <button
                  type="button"
                  onClick={() => setBudgetCurrency(prev => prev === 'INR' ? 'USD' : 'INR')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 text-[10px] font-bold bg-white/[0.06] hover:bg-white/[0.12] rounded-lg text-purple-300"
                >
                  {budgetCurrency}
                </button>
              </div>
            </div>

            {/* Deadline */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                First Cut Deadline
              </label>
              <div className="relative">
                <Calendar className="w-3.5 h-3.5 text-purple-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="date"
                  required
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#141A28] border border-white/[0.08] text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            {/* Expected Duration */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Expected Video Duration
              </label>
              <select
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-[#141A28] border border-white/[0.08] text-xs text-white focus:outline-none focus:border-purple-500"
              >
                {durationOptions.map((opt) => (
                  <option key={opt} value={opt} className="bg-[#141A28] text-white">
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Section 4: Reference Video Links */}
        <div className="glass-card p-6 md:p-7 space-y-4 border border-white/[0.08]">
          <div className="flex items-center gap-2 pb-3 border-b border-white/[0.05]">
            <LinkIcon className="w-4 h-4 text-purple-400" />
            <h3 className="text-base font-bold text-white">Reference Links</h3>
          </div>

          <div className="space-y-2.5">
            {referenceLinks.map((link, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2.5 rounded-xl bg-[#141A28]/60 border border-white/[0.05]"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <LinkIcon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="text-xs text-purple-300 truncate">{link}</span>
                </div>
                <button
                  type="button"
                  onClick={() => removeReferenceLink(idx)}
                  className="p-1 rounded-lg text-slate-400 hover:text-rose-400 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}

            <div className="flex items-center gap-2 pt-1">
              <input
                type="url"
                placeholder="Add YouTube, Vimeo, or Google Drive reference URL..."
                value={newLink}
                onChange={(e) => setNewLink(e.target.value)}
                className="flex-1 px-3.5 py-2 text-xs rounded-xl bg-[#141A28] text-white border border-white/[0.08] focus:outline-none focus:border-purple-500"
              />
              <Button
                variant="subtle"
                size="sm"
                icon={Plus}
                onClick={addReferenceLink}
              >
                Add Link
              </Button>
            </div>
          </div>
        </div>

        {/* Section 5: Sample Files & Raw Footage Assets with 3D Folder & Drop Animation */}
        <div className="glass-card p-6 md:p-7 space-y-4 border border-white/[0.08]">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.05]">
            <div className="flex items-center gap-2">
              <Film className="w-4 h-4 text-purple-400" />
              <h3 className="text-base font-bold text-white">Sample Files & Raw Project Assets</h3>
            </div>
            <span className="text-[11px] text-slate-400">Audio tracks, raw camera clips, project briefs</span>
          </div>

          <FolderUploadDropzone
            label="Drag & Drop All Raw Assets into Folder"
            description="Drag files or folder directory here. Lighting aura animates on drag, and files automatically merge into the project folder vault."
            badgeText="ASSETS"
            onFilesSelected={(files) => setSampleFiles(files)}
          />
        </div>

        {/* Section 6: Additional Notes */}
        <div className="glass-card p-6 md:p-7 space-y-4 border border-white/[0.08]">
          <div className="flex items-center gap-2 pb-3 border-b border-white/[0.05]">
            <FileText className="w-4 h-4 text-purple-400" />
            <h3 className="text-base font-bold text-white">Additional Notes / Do's & Don'ts</h3>
          </div>

          <textarea
            rows={3}
            placeholder="e.g. Please avoid copyrighted audio tracks. Target -14 LUFS loudness for dialogue. Prefer dynamic animated text captions over static subtitles."
            value={additionalNotes}
            onChange={(e) => setAdditionalNotes(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-[#141A28] border border-white/[0.08] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-all resize-none"
          />
        </div>

        {/* Submit Bar */}
        <div className="flex items-center justify-between p-5 rounded-2xl bg-[#0F1422] border border-white/[0.08]">
          <button
            type="button"
            onClick={() => navigate('/creator/dashboard')}
            className="text-xs text-slate-400 hover:text-white transition-colors"
          >
            Discard & Return
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className="group relative inline-flex items-center gap-2.5 px-8 py-3 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-500 hover:from-purple-500 hover:to-indigo-500 shadow-xl shadow-purple-900/50 hover:shadow-purple-700/70 border border-purple-400/40 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
          >
            <Send className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            <span>{isSubmitting ? 'Publishing Gig...' : 'Publish Project'}</span>
          </button>
        </div>
      </form>

      {/* COMPLETED SUCCESS TEXT BOX / MODAL */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-lg glass-card p-8 border border-purple-500/40 shadow-2xl relative text-center space-y-5">
            {/* Glowing checkmark badge */}
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-emerald-500 p-0.5 mx-auto shadow-lg shadow-purple-900/50 flex items-center justify-center">
              <div className="w-full h-full rounded-[22px] bg-[#0A0D15] flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 animate-bounce" />
              </div>
            </div>

            <div>
              <span className="text-[11px] font-bold text-purple-400 uppercase tracking-widest bg-purple-950/60 px-3 py-1 rounded-full border border-purple-800/40">
                Project Published
              </span>
              <h2 className="text-2xl font-black text-white mt-2 tracking-tight">
                Project is Live on Collabo Marketplace! 🚀
              </h2>
              <p className="text-xs text-slate-300 mt-1.5 max-w-md mx-auto leading-relaxed">
                Your video project brief has been broadcast to verified video editors. You will receive notifications when top editors submit proposals.
              </p>
            </div>

            {/* Completed Project Summary Card */}
            <div className="p-4 rounded-xl bg-[#141A28]/80 border border-white/[0.08] text-left text-xs space-y-2">
              <div className="flex justify-between items-center pb-2 border-b border-white/[0.05]">
                <span className="text-slate-400">Project ID:</span>
                <span className="font-mono text-purple-400 font-bold">{createdProjectId}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Title:</span>
                <span className="font-semibold text-white truncate max-w-[240px]">{title}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Allocated Budget:</span>
                <span className="font-bold text-emerald-400">{budgetCurrency === 'INR' ? '₹' : '$'}{budget}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">First Cut Deadline:</span>
                <span className="font-medium text-slate-200">{deadline}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Assets Attached:</span>
                <span className="text-purple-300 font-medium">Synced into Collabo Vault</span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <Button
                variant="subtle"
                onClick={() => navigate('/creator/projects')}
                className="text-xs"
              >
                View All Projects
              </Button>
              <Button
                variant="primary"
                onClick={() => navigate('/creator/dashboard')}
                className="text-xs px-6"
              >
                Back to Dashboard
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateProject;
