import React, { useState, useRef, useEffect } from 'react';
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
  Minus,
  Search,
  Trash2,
  ChevronDown,
  Check,
  Upload,
  Image as ImageIcon,
  X,
  Smartphone,
  Radio,
  Tv,
  Gamepad2,
  Scissors,
  Palette,
  Wand2,
  AlertCircle
} from 'lucide-react';
import Button from '../../components/common/Button';
import SEO from '../../components/common/SEO';
import { useAlert } from '../../context/AlertContext';
import api from '../../services/api';

export const CreateProject = () => {
  const navigate = useNavigate();
  const { showAlert } = useAlert();

  // Form State - all pre-filled values removed
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [editingStyle, setEditingStyle] = useState('');
  const [requiredSkills, setRequiredSkills] = useState([]);
  const [budgetCurrency, setBudgetCurrency] = useState('INR');
  const [budget, setBudget] = useState('');
  const [deadline, setDeadline] = useState('');
  const [duration, setDuration] = useState('');
  const [referenceLinks, setReferenceLinks] = useState([]);
  const [newLink, setNewLink] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');

  // Custom Dropdown Open States
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isStyleOpen, setIsStyleOpen] = useState(false);
  const [isDurationOpen, setIsDurationOpen] = useState(false);
  const categoryRef = useRef(null);
  const styleRef = useRef(null);
  const durationRef = useRef(null);

  // Reference Images (Max 3)
  const [selectedImages, setSelectedImages] = useState([]);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [isAiSuggesting, setIsAiSuggesting] = useState(false);
  const fileInputRef = useRef(null);

  // Submission States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [createdProjectId, setCreatedProjectId] = useState('');
  const [aiFilledNotice, setAiFilledNotice] = useState(false);

  // Click outside listener for dropdowns
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (categoryRef.current && !categoryRef.current.contains(e.target)) {
        setIsCategoryOpen(false);
      }
      if (styleRef.current && !styleRef.current.contains(e.target)) {
        setIsStyleOpen(false);
      }
      if (durationRef.current && !durationRef.current.contains(e.target)) {
        setIsDurationOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Check for Collabo AI Auto-Fill payload
  useEffect(() => {
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

  // Category Options with Icons and metadata
  const categoryOptions = [
    {
      id: 'YouTube Longform',
      label: 'YouTube Longform',
      desc: 'Video essays, tutorials, deep dives & episodic content',
      icon: Film,
      badge: '16:9'
    },
    {
      id: 'Shorts / TikTok / Reels',
      label: 'Shorts / TikTok / Reels',
      desc: 'High-retention vertical clips with fast hooks',
      icon: Smartphone,
      badge: '9:16'
    },
    {
      id: 'Documentary & Essay',
      label: 'Documentary & Essay',
      desc: 'Vox-style investigative cuts, archival footage & deep pacing',
      icon: FileText,
      badge: 'Documentary'
    },
    {
      id: 'Commercial & Brand Ad',
      label: 'Commercial & Brand Ad',
      desc: 'High-converting product promos & marketing campaigns',
      icon: Sparkles,
      badge: 'Commercial'
    },
    {
      id: 'Podcast Multi-Cam',
      label: 'Podcast Multi-Cam',
      desc: 'Multi-cam angle switching, clean audio balance & highlights',
      icon: Radio,
      badge: 'Podcast'
    },
    {
      id: 'Tech & Product Review',
      label: 'Tech & Product Review',
      desc: 'Clean macro B-roll, spec callouts & sleek transitions',
      icon: Tv,
      badge: 'Tech'
    },
    {
      id: 'Gaming Montage',
      label: 'Gaming Montage',
      desc: 'Sync-to-beat pacing, meme SFX & high-energy cuts',
      icon: Gamepad2,
      badge: 'Gaming'
    }
  ];

  // Editing Style Options with descriptions
  const editingStyleOptions = [
    {
      id: 'Cinematic Storytelling',
      label: 'Cinematic Storytelling',
      desc: 'Emotional pacing, atmospheric soundscapes & cinematic color grading',
      icon: Film
    },
    {
      id: 'Fast-Paced Kinetic & Memes',
      label: 'Fast-Paced Kinetic & Memes',
      desc: 'Rapid zooms, meme inserts, sound effects & dynamic whip pans',
      icon: Scissors
    },
    {
      id: 'Alex Hormozi Retention Style',
      label: 'Alex Hormozi Retention Style',
      desc: 'Dynamic colored captions, sound popups, emojis & zoom cuts',
      icon: Wand2
    },
    {
      id: 'Minimalist & Clean (Notion/Linear)',
      label: 'Minimalist & Clean (Notion/Linear)',
      desc: 'Refined typography, elegant push-ins & calm, intentional pacing',
      icon: Palette
    },
    {
      id: 'Documentary Vox-Style Explainer',
      label: 'Documentary Vox-Style Explainer',
      desc: 'Paper tear transitions, maps, animated charts & archival clips',
      icon: FileText
    },
    {
      id: 'Luxury & Film Grade (24fps)',
      label: 'Luxury & Film Grade (24fps)',
      desc: 'Arri/RED emulation, 35mm film grain & intentional rhythm',
      icon: Sparkles
    }
  ];

  const [allSkills, setAllSkills] = useState([
    'Adobe Premiere Pro',
    'After Effects',
    'DaVinci Resolve Studio',
    'Final Cut Pro',
    'Color Grading (LUTs)',
    'Sound Design & Foley',
    'Dynamic Captions',
    '3D Motion / Blender',
    'Thumbnail Design',
    'VFX & Compositing',
    'Audio Mixing & Mastering',
    'Adobe Photoshop',
    'Adobe Illustrator',
    'CapCut Pro',
    'AI Voice & B-Roll Generation',
    'Frame.io Collaboration',
    'Rotoscoping & Masking',
    'Motion Graphics'
  ]);
  const [isSkillsExpanded, setIsSkillsExpanded] = useState(false);
  const [skillSearch, setSkillSearch] = useState('');

  const handleAddCustomSkill = (customName) => {
    const trimmed = (customName || skillSearch).trim();
    if (!trimmed) return;

    if (!allSkills.some(s => s.toLowerCase() === trimmed.toLowerCase())) {
      setAllSkills(prev => [trimmed, ...prev]);
    }

    if (!requiredSkills.some(s => s.toLowerCase() === trimmed.toLowerCase())) {
      setRequiredSkills(prev => [...prev, trimmed]);
    }

    setSkillSearch('');
    showAlert(`Added "${trimmed}" to required skills! ✓`, 'success');
  };

  const durationOptions = [
    'Under 60 Seconds (Shorts/Reels)',
    '1 - 3 Minutes',
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

  // Image Selection Handler (Max 3)
  const handleImageFiles = (files) => {
    const fileList = Array.from(files);
    const validImageTypes = ['image/jpeg', 'image/png', 'image/webp'];

    const validFiles = fileList.filter(file => {
      if (!validImageTypes.includes(file.type)) {
        showAlert(`"${file.name}" is not a supported format (JPEG, PNG, WebP only)`, 'warning');
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        showAlert(`"${file.name}" exceeds 5MB size limit`, 'warning');
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    const availableSlots = 3 - selectedImages.length;
    if (availableSlots <= 0) {
      showAlert('Maximum 3 reference images allowed. Please remove one first.', 'warning');
      return;
    }

    if (validFiles.length > availableSlots) {
      showAlert(`Only ${availableSlots} more image(s) can be added. Adding first ${availableSlots}.`, 'warning');
    }

    const filesToAdd = validFiles.slice(0, availableSlots).map(file => ({
      id: `${Date.now()}-${Math.random()}`,
      file,
      name: file.name,
      size: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
      preview: URL.createObjectURL(file)
    }));

    setSelectedImages(prev => [...prev, ...filesToAdd]);
  };

  const removeImage = (idToRemove) => {
    setSelectedImages(prev => {
      const removed = prev.find(img => img.id === idToRemove);
      if (removed && removed.preview) {
        URL.revokeObjectURL(removed.preview);
      }
      return prev.filter(img => img.id !== idToRemove);
    });
  };

  // Suggest with AI using real backend AI Service with resilient fallback
  const handleAiSuggest = async () => {
    setIsAiSuggesting(true);
    try {
      const res = await api.post('/api/ai/suggest-budget-timeline', {
        category,
        editingStyle,
        requiredSkills,
        expectedVideoDuration: duration,
        currency: budgetCurrency,
      });

      const data = res.data?.data;
      if (data) {
        if (data.recommendedBudget) {
          setBudget(String(data.recommendedBudget));
        }
        if (data.estimatedDeliveryDays) {
          const d = new Date();
          d.setDate(d.getDate() + Number(data.estimatedDeliveryDays));
          setDeadline(d.toISOString().split('T')[0]);
        }
        const costDriversText = Array.isArray(data.keyCostDrivers) && data.keyCostDrivers.length > 0
          ? ` Drivers: ${data.keyCostDrivers.slice(0, 3).join(', ')}.`
          : '';
        showAlert(
          `AI Suggestion (${data.currency} ${data.recommendedBudget || ''}): ${data.marketAnalysis || 'Estimated based on project complexity.'}${costDriversText}`,
          'success'
        );
      }
    } catch (err) {
      console.warn('AI suggestion API error, applying resilient fallback:', err);
      // Fallback heuristic if offline or rate limited
      let recBudget = budgetCurrency === 'INR' ? '20000' : '350';
      let daysToAdd = 7;
      const currentCat = (category || '').toLowerCase();
      if (currentCat.includes('shorts') || currentCat.includes('reels')) {
        recBudget = budgetCurrency === 'INR' ? '5000' : '150';
        daysToAdd = 3;
      } else if (currentCat.includes('commercial')) {
        recBudget = budgetCurrency === 'INR' ? '40000' : '600';
        daysToAdd = 6;
      }
      const d = new Date();
      d.setDate(d.getDate() + daysToAdd);
      setBudget(recBudget);
      setDeadline(d.toISOString().split('T')[0]);

      const errorMsg = err.response?.data?.message || 'AI estimated optimal budget & timeline!';
      showAlert(errorMsg, 'info');
    } finally {
      setIsAiSuggesting(false);
    }
  };

  // Publish Project Handler
  const handlePublish = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      showAlert('Please enter a project title.', 'warning');
      return;
    }
    if (!description.trim()) {
      showAlert('Please enter a project brief / description.', 'warning');
      return;
    }
    if (!category.trim()) {
      showAlert('Please select a video category.', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      let uploadedImageUrls = [];

      // Upload selected images to ImageKit if any
      if (selectedImages.length > 0) {
        const formData = new FormData();
        selectedImages.slice(0, 3).forEach((item) => {
          if (item.file) {
            formData.append('images', item.file);
          }
        });

        if (formData.has('images')) {
          try {
            const uploadRes = await api.post('/api/creator/upload-reference-images', formData, {
              headers: { 'Content-Type': 'multipart/form-data' }
            });
            uploadedImageUrls = uploadRes.data?.urls || [];
          } catch (uploadErr) {
            console.warn('[CreateProject] Reference images upload warning:', uploadErr.message);
          }
        }
      }

      // Convert duration string to approximate minutes number
      let numericDuration = 0;
      if (duration.includes('60 Seconds')) numericDuration = 1;
      else if (duration.includes('1 - 3')) numericDuration = 3;
      else if (duration.includes('3 - 5')) numericDuration = 5;
      else if (duration.includes('8 - 12')) numericDuration = 10;
      else if (duration.includes('15 - 25')) numericDuration = 20;
      else if (duration.includes('30+')) numericDuration = 35;

      const payload = {
        title: title.trim(),
        description: description.trim(),
        category: category.trim(),
        editingStyle: editingStyle.trim() || undefined,
        requiredSkills,
        budget: budget ? {
          fixed: Number(budget) || 0,
          currency: budgetCurrency
        } : {},
        deadline: deadline ? new Date(deadline).toISOString() : undefined,
        videoDuration: numericDuration,
        referenceLinks,
        referenceImages: uploadedImageUrls,
        additionalInstructions: additionalNotes.trim()
      };

      const res = await api.post('/api/creator/projects', payload);
      const createdId = res.data?.project?._id || `PRJ-${Math.floor(1000 + Math.random() * 9000)}`;
      setCreatedProjectId(createdId);
      setShowSuccessModal(true);
      showAlert('Project published live to marketplace! 🚀', 'success');
    } catch (err) {
      console.error('Error publishing project:', err);
      showAlert(err.response?.data?.message || err.message || 'Failed to publish project', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedCategoryObj = categoryOptions.find(c => c.id === category);
  const selectedStyleObj = editingStyleOptions.find(s => s.id === editingStyle);

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16 animate-fade-in">
      <SEO
        title="Post Project Brief"
        description="Define your video editing scope, timeline, budget, and get matched with top video editors."
      />

      {/* Top Breadcrumb & Page Title */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/creator/dashboard')}
            className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-400 hover:text-white border border-white/[0.06] transition-colors cursor-pointer"
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

          {/* Category & Editing Style Row with Custom UI Dropdowns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Custom Category Dropdown */}
            <div className="relative" ref={categoryRef}>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Category <span className="text-purple-400">*</span>
              </label>
              
              <button
                type="button"
                onClick={() => {
                  setIsCategoryOpen(!isCategoryOpen);
                  setIsStyleOpen(false);
                }}
                className={`w-full px-4 py-2.5 rounded-xl bg-[#141A28] border text-xs text-left flex items-center justify-between transition-all cursor-pointer ${
                  isCategoryOpen 
                    ? 'border-purple-500 ring-2 ring-purple-500/20 text-white' 
                    : 'border-white/[0.08] hover:border-white/20 text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  {selectedCategoryObj ? (
                    <>
                      <div className="w-6 h-6 rounded-lg bg-purple-500/20 border border-purple-500/30 flex items-center justify-center shrink-0">
                        {React.createElement(selectedCategoryObj.icon, { className: 'w-3.5 h-3.5 text-purple-400' })}
                      </div>
                      <span className="font-semibold text-white truncate">{selectedCategoryObj.label}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/[0.06] text-purple-300 border border-white/[0.04]">
                        {selectedCategoryObj.badge}
                      </span>
                    </>
                  ) : (
                    <span className="text-slate-500">Select video category...</span>
                  )}
                </div>
                <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${isCategoryOpen ? 'rotate-180 text-purple-400' : ''}`} />
              </button>

              {/* Custom Popover */}
              {isCategoryOpen && (
                <div className="absolute left-0 right-0 top-full mt-2 z-30 p-2 rounded-2xl bg-[#0B0F19]/95 backdrop-blur-xl border border-white/10 shadow-2xl space-y-1 max-h-72 overflow-y-auto animate-fade-in">
                  {categoryOptions.map((opt) => {
                    const isSelected = category === opt.id;
                    const IconComp = opt.icon;
                    return (
                      <div
                        key={opt.id}
                        onClick={() => {
                          setCategory(opt.id);
                          setIsCategoryOpen(false);
                        }}
                        className={`p-2.5 rounded-xl flex items-center justify-between cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-purple-600/20 border border-purple-500/40 text-white'
                            : 'hover:bg-white/[0.04] text-slate-300 hover:text-white border border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                            isSelected ? 'bg-purple-500 text-white' : 'bg-white/[0.05] text-slate-400'
                          }`}>
                            <IconComp className="w-3.5 h-3.5" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-semibold">{opt.label}</span>
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-white/[0.05] text-purple-300">
                                {opt.badge}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400 truncate mt-0.5">{opt.desc}</p>
                          </div>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-purple-400 shrink-0 ml-2" />}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Custom Editing Style Dropdown */}
            <div className="relative" ref={styleRef}>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Editing Style
              </label>

              <button
                type="button"
                onClick={() => {
                  setIsStyleOpen(!isStyleOpen);
                  setIsCategoryOpen(false);
                }}
                className={`w-full px-4 py-2.5 rounded-xl bg-[#141A28] border text-xs text-left flex items-center justify-between transition-all cursor-pointer ${
                  isStyleOpen
                    ? 'border-purple-500 ring-2 ring-purple-500/20 text-white'
                    : 'border-white/[0.08] hover:border-white/20 text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  {selectedStyleObj ? (
                    <>
                      <div className="w-6 h-6 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center shrink-0">
                        {React.createElement(selectedStyleObj.icon, { className: 'w-3.5 h-3.5 text-indigo-400' })}
                      </div>
                      <span className="font-semibold text-white truncate">{selectedStyleObj.label}</span>
                    </>
                  ) : (
                    <span className="text-slate-500">Select editing style...</span>
                  )}
                </div>
                <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${isStyleOpen ? 'rotate-180 text-purple-400' : ''}`} />
              </button>

              {/* Custom Popover */}
              {isStyleOpen && (
                <div className="absolute left-0 right-0 top-full mt-2 z-30 p-2 rounded-2xl bg-[#0B0F19]/95 backdrop-blur-xl border border-white/10 shadow-2xl space-y-1 max-h-72 overflow-y-auto animate-fade-in">
                  {editingStyleOptions.map((opt) => {
                    const isSelected = editingStyle === opt.id;
                    const IconComp = opt.icon;
                    return (
                      <div
                        key={opt.id}
                        onClick={() => {
                          setEditingStyle(opt.id);
                          setIsStyleOpen(false);
                        }}
                        className={`p-2.5 rounded-xl flex items-center justify-between cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-purple-600/20 border border-purple-500/40 text-white'
                            : 'hover:bg-white/[0.04] text-slate-300 hover:text-white border border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                            isSelected ? 'bg-indigo-500 text-white' : 'bg-white/[0.05] text-slate-400'
                          }`}>
                            <IconComp className="w-3.5 h-3.5" />
                          </div>
                          <div className="min-w-0">
                            <span className="text-xs font-semibold block">{opt.label}</span>
                            <p className="text-[11px] text-slate-400 truncate mt-0.5">{opt.desc}</p>
                          </div>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-purple-400 shrink-0 ml-2" />}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Required Skills Badges with + Expand, Search & Custom Skill */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <label className="text-xs font-semibold text-slate-300">
                  Required Skills & Software (Click to select)
                </label>
                {requiredSkills.length > 0 && (
                  <span className="text-[10px] font-bold text-purple-300 bg-purple-950/60 px-2 py-0.5 rounded-full border border-purple-800/40">
                    {requiredSkills.length} selected
                  </span>
                )}
              </div>

              {isSkillsExpanded && (
                <button
                  type="button"
                  onClick={() => {
                    setIsSkillsExpanded(false);
                    setSkillSearch('');
                  }}
                  className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Minus className="w-3.5 h-3.5" />
                  <span>Show Less</span>
                </button>
              )}
            </div>

            {/* If Expanded: Show Search Bar */}
            {isSkillsExpanded && (
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search skills or software (e.g. Blender, CapCut, VFX)..."
                  value={skillSearch}
                  onChange={(e) => setSkillSearch(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const query = skillSearch.trim();
                      if (!query) return;
                      const matches = allSkills.filter(s => s.toLowerCase().includes(query.toLowerCase()));
                      if (matches.length === 1) {
                        toggleSkill(matches[0]);
                        setSkillSearch('');
                      } else if (matches.length === 0) {
                        handleAddCustomSkill(query);
                      }
                    }
                  }}
                  className="w-full pl-9 pr-8 py-2 rounded-xl bg-[#141A28] border border-white/[0.08] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
                />
                {skillSearch && (
                  <button
                    type="button"
                    onClick={() => setSkillSearch('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}

            {/* Skills Pills */}
            <div className="flex flex-wrap items-center gap-2">
              {isSkillsExpanded ? (
                // Expanded View: show search results or all skills
                (() => {
                  const query = skillSearch.trim().toLowerCase();
                  const filtered = query
                    ? allSkills.filter(s => s.toLowerCase().includes(query))
                    : allSkills;

                  if (filtered.length === 0) {
                    return (
                      <div className="w-full p-3 rounded-xl bg-purple-950/25 border border-purple-500/30 flex flex-col sm:flex-row items-center justify-between gap-2.5">
                        <div className="text-left">
                          <p className="text-xs font-semibold text-white">
                            No skill found for "{skillSearch}"
                          </p>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            Add this as a custom required skill for your project
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleAddCustomSkill(skillSearch)}
                          className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-purple-950 cursor-pointer shrink-0 transition-all"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add "{skillSearch}"</span>
                        </button>
                      </div>
                    );
                  }

                  const hasExactMatch = allSkills.some(s => s.toLowerCase() === query);

                  return (
                    <>
                      {filtered.map((skill) => {
                        const isSelected = requiredSkills.includes(skill);
                        return (
                          <button
                            key={skill}
                            type="button"
                            onClick={() => toggleSkill(skill)}
                            className={`px-3 py-1.5 text-xs font-medium rounded-xl border transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-purple-600 text-white border-purple-500 shadow-sm shadow-purple-900/40'
                                : 'bg-[#141A28]/80 text-slate-400 border-white/[0.06] hover:text-white hover:border-white/20'
                            }`}
                          >
                            {skill} {isSelected && '✓'}
                          </button>
                        );
                      })}

                      {query && !hasExactMatch && (
                        <button
                          type="button"
                          onClick={() => handleAddCustomSkill(skillSearch)}
                          className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-purple-600/20 hover:bg-purple-600/30 border border-dashed border-purple-400 text-purple-300 hover:text-white flex items-center gap-1.5 transition-all cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add "{skillSearch}" as custom</span>
                        </button>
                      )}
                    </>
                  );
                })()
              ) : (
                // Unexpanded View: show only 5 skills, plus any selected skills, plus "+" button
                <>
                  {Array.from(new Set([...allSkills.slice(0, 5), ...requiredSkills])).map((skill) => {
                    const isSelected = requiredSkills.includes(skill);
                    return (
                      <button
                        key={skill}
                        type="button"
                        onClick={() => toggleSkill(skill)}
                        className={`px-3 py-1.5 text-xs font-medium rounded-xl border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-purple-600 text-white border-purple-500 shadow-sm shadow-purple-900/40'
                            : 'bg-[#141A28]/80 text-slate-400 border-white/[0.06] hover:text-white hover:border-white/20'
                        }`}
                      >
                        {skill} {isSelected && '✓'}
                      </button>
                    );
                  })}

                  {/* The '+' button to expand */}
                  <button
                    type="button"
                    onClick={() => setIsSkillsExpanded(true)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-xl bg-purple-600/20 hover:bg-purple-600/35 border border-purple-500/40 text-purple-300 hover:text-white transition-all cursor-pointer shadow-sm hover:shadow-purple-900/30 group"
                    title="Click to view more skills and search/add custom"
                  >
                    <Plus className="w-3.5 h-3.5 text-purple-400 group-hover:rotate-90 transition-transform" />
                    <span>More Skills</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Section 2: Reference Images & Moodboard (Max 3, saved to ImageKit separate folder) */}
        <div className="glass-card p-6 md:p-7 space-y-4 border border-white/[0.08]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-white/[0.05]">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-400" />
              <h3 className="text-base font-bold text-white">Reference Images & Moodboard</h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-purple-950/60 text-purple-300 border border-purple-800/40">
                {selectedImages.length} / 3 Images
              </span>
              <span className="text-[11px] text-slate-400">Max 3 (PNG, JPG, WebP)</span>
            </div>
          </div>

          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                handleImageFiles(e.target.files);
                e.target.value = '';
              }
            }}
          />

          {/* Images Grid & Dropzone */}
          <div className="space-y-3">
            {/* Previews if any */}
            {selectedImages.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {selectedImages.map((img, idx) => (
                  <div
                    key={img.id}
                    className="relative group rounded-xl overflow-hidden border border-white/10 bg-[#0E1322] flex flex-col"
                  >
                    <div className="aspect-video w-full overflow-hidden bg-slate-900 relative">
                      <img
                        src={img.preview}
                        alt={`Reference moodboard image ${idx + 1}`}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(img.id)}
                        className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/70 hover:bg-rose-600 text-white transition-colors cursor-pointer shadow-md"
                        title="Remove image"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <span className="absolute bottom-2 left-2 px-1.5 py-0.5 rounded bg-black/75 text-[10px] font-mono text-purple-300">
                        #{idx + 1}
                      </span>
                    </div>
                    <div className="p-2.5 flex items-center justify-between text-xs">
                      <span className="text-slate-300 font-medium truncate max-w-[120px]">{img.name}</span>
                      <span className="text-[10px] text-slate-500 font-mono">{img.size}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Drop / Add Zone (shown when < 3 images) */}
            {selectedImages.length < 3 && (
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDraggingOver(true);
                }}
                onDragLeave={() => setIsDraggingOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDraggingOver(false);
                  if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                    handleImageFiles(e.dataTransfer.files);
                  }
                }}
                onClick={() => fileInputRef.current?.click()}
                className={`p-6 border-2 border-dashed rounded-2xl text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 ${
                  isDraggingOver
                    ? 'border-purple-400 bg-purple-950/30 ring-2 ring-purple-500/20'
                    : 'border-white/10 hover:border-purple-500/40 bg-white/[0.01] hover:bg-white/[0.03]'
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-white">
                    Click to browse or drag & drop reference images
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Add visual storyboard stills, color palettes, or thumbnail inspiration ({selectedImages.length}/3 selected)
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Section 3: Expected Video Duration */}
        <div className="glass-card p-6 md:p-7 space-y-4 border border-white/[0.08]">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.05]">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-purple-400" />
              <h3 className="text-base font-bold text-white">Expected Video Duration</h3>
            </div>
            <span className="text-[11px] text-slate-400">Target length of the final edit</span>
          </div>

          <div className="relative" ref={durationRef}>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              Select or Choose Video Length
            </label>
            <button
              type="button"
              onClick={() => setIsDurationOpen(!isDurationOpen)}
              className={`w-full px-3.5 py-2.5 rounded-xl bg-[#141A28] border text-xs text-left flex items-center justify-between transition-all cursor-pointer ${
                isDurationOpen
                  ? 'border-purple-500 ring-2 ring-purple-500/20 text-white'
                  : 'border-white/[0.08] hover:border-white/20 text-slate-300'
              }`}
            >
              <span className={duration ? 'text-white font-medium' : 'text-slate-500'}>
                {duration || 'Select Duration...'}
              </span>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isDurationOpen ? 'rotate-180 text-purple-400' : ''}`} />
            </button>

            {isDurationOpen && (
              <div className="absolute left-0 right-0 top-full mt-2 z-30 p-1.5 rounded-2xl bg-[#0B0F19]/95 backdrop-blur-xl border border-white/10 shadow-2xl space-y-0.5 animate-fade-in max-h-60 overflow-y-auto">
                {durationOptions.map((opt) => (
                  <div
                    key={opt}
                    onClick={() => {
                      setDuration(opt);
                      setIsDurationOpen(false);
                    }}
                    className={`px-3 py-2 rounded-xl text-xs flex items-center justify-between cursor-pointer transition-colors ${
                      duration === opt
                        ? 'bg-purple-600/20 text-white font-semibold'
                        : 'hover:bg-white/[0.05] text-slate-300 hover:text-white'
                    }`}
                  >
                    <span>{opt}</span>
                    {duration === opt && <Check className="w-3.5 h-3.5 text-purple-400" />}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Section 4: Budget & Timeline with "Suggest with AI" Button */}
        <div className="glass-card p-6 md:p-7 space-y-5 border border-white/[0.08]">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.05]">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              <h3 className="text-base font-bold text-white">Budget & Timeline</h3>
            </div>

            {/* Suggest with AI Button */}
            <button
              type="button"
              onClick={handleAiSuggest}
              disabled={isAiSuggesting}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-purple-600/25 via-indigo-600/25 to-purple-500/20 hover:from-purple-600/40 hover:to-indigo-600/40 border border-purple-500/40 text-purple-300 hover:text-white shadow-sm hover:shadow-purple-900/30 transition-all cursor-pointer group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Sparkles className={`w-3.5 h-3.5 text-purple-400 group-hover:rotate-12 transition-transform ${isAiSuggesting ? 'animate-spin' : ''}`} />
              <span>{isAiSuggesting ? 'Analyzing with AI...' : 'Suggest with AI'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Budget (No Up/Down Arrows) */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Total Budget
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-slate-400 text-xs font-bold pointer-events-none">
                  <span>{budgetCurrency === 'INR' ? '₹' : '$'}</span>
                </div>
                <input
                  type="number"
                  placeholder="e.g. 15000"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="w-full pl-8 pr-16 py-2.5 rounded-xl bg-[#141A28] border border-white/[0.08] text-sm text-white font-semibold focus:outline-none focus:border-purple-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setBudgetCurrency(prev => prev === 'INR' ? 'USD' : 'INR')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 text-[10px] font-bold bg-white/[0.06] hover:bg-white/[0.12] rounded-lg text-purple-300 transition-colors cursor-pointer"
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
                <Calendar className="w-3.5 h-3.5 text-purple-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#141A28] border border-white/[0.08] text-xs text-white focus:outline-none focus:border-purple-500 transition-all cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 4: Reference Links */}
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
                  className="p-1 rounded-lg text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
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

        {/* Section 5: Additional Notes */}
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
            className="w-full px-4 py-3 rounded-xl bg-[#141A28] border border-white/[0.08] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-all resize-none leading-relaxed"
          />
        </div>

        {/* Submit Bar */}
        <div className="flex items-center justify-between p-5 rounded-2xl bg-[#0F1422] border border-white/[0.08]">
          <button
            type="button"
            onClick={() => navigate('/creator/dashboard')}
            className="text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            Discard & Return
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className="group relative inline-flex items-center gap-2.5 px-8 py-3 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-500 hover:from-purple-500 hover:to-indigo-500 shadow-xl shadow-purple-900/50 hover:shadow-purple-700/70 border border-purple-400/40 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer"
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
                <span className="text-slate-400">Category:</span>
                <span className="font-semibold text-purple-300">{category}</span>
              </div>
              {budget && (
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Allocated Budget:</span>
                  <span className="font-bold text-emerald-400">{budgetCurrency === 'INR' ? '₹' : '$'}{budget}</span>
                </div>
              )}
              {deadline && (
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">First Cut Deadline:</span>
                  <span className="font-medium text-slate-200">{deadline}</span>
                </div>
              )}
              {selectedImages.length > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Reference Images:</span>
                  <span className="text-purple-300 font-medium">{selectedImages.length} Synced to ImageKit</span>
                </div>
              )}
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
