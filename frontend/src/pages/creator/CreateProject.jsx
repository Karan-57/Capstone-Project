import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
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
  AlertCircle,
  Users,
  Briefcase,
  ArrowRight,
  Tag,
  CheckCircle
} from 'lucide-react';
import Button from '../../components/common/Button';
import SEO from '../../components/common/SEO';
import CustomDatePicker from '../../components/common/CustomDatePicker';
import { useAlert } from '../../context/AlertContext';
import api from '../../services/api';

// Helper to extract maximum days allowed from project duration string
const parseProjectTurnaroundMaxDays = (durationStr) => {
  if (!durationStr || typeof durationStr !== 'string') return null;
  const lower = durationStr.toLowerCase();
  if (lower.includes('month')) return 30;
  if (lower.includes('week')) {
    const match = lower.match(/(\d+)\s*week/);
    if (match) return parseInt(match[1], 10) * 7;
    return 21; // 2 - 3 weeks fallback
  }
  if (lower.includes('day')) {
    const match = lower.match(/(\d+)\s*-\s*(\d+)\s*day/);
    if (match) return parseInt(match[2], 10);
    const singleMatch = lower.match(/(\d+)\s*day/);
    if (singleMatch) return parseInt(singleMatch[1], 10);
    return 7;
  }
  return null;
};

import { FREELANCER_CONTENT_ROLES as DEFAULT_CREATOR_ROLES, generateMilestonesForRole } from '../../constants/roles.constants';

export const CreateProject = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { showAlert } = useAlert();

  // Multi-step workflow state (Step 1: Project Scope, Step 2: Post Hirings)
  const initialStep = searchParams.get('step') === '2' ? 2 : 1;
  const initialProjectId = searchParams.get('projectId') || '';
  const [step, setStep] = useState(initialStep);
  const [projectId, setProjectId] = useState(initialProjectId);
  const [projectData, setProjectData] = useState(null);

  // STEP 1 STATE - Project Scope & Manual Budget (NOT AI generated)
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [totalBudget, setTotalBudget] = useState('');
  const [budgetCurrency, setBudgetCurrency] = useState('INR');
  const [projectDuration, setProjectDuration] = useState('7 - 10 Days (Standard)');
  const [category, setCategory] = useState('');
  const [editingStyle, setEditingStyle] = useState('');
  const [expectedVideoDuration, setExpectedVideoDuration] = useState('');
  const [referenceLinks, setReferenceLinks] = useState([]);
  const [newLink, setNewLink] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');

  // Dropdown open states for Step 1
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isStyleOpen, setIsStyleOpen] = useState(false);
  const [isExpectedDurationOpen, setIsExpectedDurationOpen] = useState(false);
  const [isProjectDurationOpen, setIsProjectDurationOpen] = useState(false);
  const categoryRef = useRef(null);
  const styleRef = useRef(null);
  const expectedDurationRef = useRef(null);
  const projectDurationRef = useRef(null);

  // Reference Images (Max 3, uploaded to ImageKit)
  const [selectedImages, setSelectedImages] = useState([]);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const fileInputRef = useRef(null);

  // Step 1 Saving State
  const [isSavingStep1, setIsSavingStep1] = useState(false);
  const [isAiSuggestingScope, setIsAiSuggestingScope] = useState(false);
  const [aiScopeSuggestion, setAiScopeSuggestion] = useState(null);

  // STEP 2 STATE - Hirings, Hired Freelancers, and Role Form Modal
  const [hirings, setHirings] = useState([]);
  const [activeHirings, setActiveHirings] = useState([]);
  const [hiredFreelancers, setHiredFreelancers] = useState([]);
  const [isLoadingHirings, setIsLoadingHirings] = useState(false);

  // Available Content-Creator Roles fetched from Backend (/api/roles) with robust fallback
  const [availableRoles, setAvailableRoles] = useState(DEFAULT_CREATOR_ROLES);

  // Hiring Form Modal State
  const [isHiringModalOpen, setIsHiringModalOpen] = useState(false);
  const [isPostingHiring, setIsPostingHiring] = useState(false);
  const [isAiSuggestingHiring, setIsAiSuggestingHiring] = useState(false);
  const [aiSuggestionData, setAiSuggestionData] = useState(null);

  // Hiring Form Inputs
  const [selectedRoleId, setSelectedRoleId] = useState('');
  const [hiringRoleTitle, setHiringRoleTitle] = useState('');
  const [hiringDescription, setHiringDescription] = useState('');
  const [hiringBudget, setHiringBudget] = useState('');
  const [hiringFirstDeadline, setHiringFirstDeadline] = useState('');
  const [hiringSkills, setHiringSkills] = useState([]);
  const [hiringTools, setHiringTools] = useState([]);
  const [newHiringSkill, setNewHiringSkill] = useState('');
  const [newHiringTool, setNewHiringTool] = useState('');
  const [hiringReferences, setHiringReferences] = useState([]);
  const [newHiringRef, setNewHiringRef] = useState('');
  const [hiringNotes, setHiringNotes] = useState('');

  // Final confirmation modal
  const [showFinalModal, setShowFinalModal] = useState(false);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (categoryRef.current && !categoryRef.current.contains(e.target)) setIsCategoryOpen(false);
      if (styleRef.current && !styleRef.current.contains(e.target)) setIsStyleOpen(false);
      if (expectedDurationRef.current && !expectedDurationRef.current.contains(e.target)) setIsExpectedDurationOpen(false);
      if (projectDurationRef.current && !projectDurationRef.current.contains(e.target)) setIsProjectDurationOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch available roles on component mount
  useEffect(() => {
    api.get('/api/roles')
      .then((res) => {
        if (res.data?.roles && Array.isArray(res.data.roles) && res.data.roles.length > 0) {
          const formatted = res.data.roles.map(r => ({
            ...r,
            title: r.title || r.name,
            name: r.name || r.title
          }));
          setAvailableRoles(formatted);
        }
      })
      .catch((err) => console.warn('Could not load roles catalog:', err));
  }, []);

  // Load project hirings if projectId is already present
  useEffect(() => {
    if (projectId) {
      loadProjectHirings(projectId);
    }
  }, [projectId]);

  const loadProjectHirings = async (pid) => {
    if (!pid) return;
    setIsLoadingHirings(true);
    try {
      const res = await api.get(`/api/creator/projects/${pid}/hirings`);
      if (res.data) {
        setHirings(res.data.hirings || []);
        setActiveHirings(res.data.activeHirings || []);
        setHiredFreelancers(res.data.hiredFreelancers || []);
        if (res.data.project) {
          setProjectData(res.data.project);
          if (!title) setTitle(res.data.project.title || '');
          if (!totalBudget) setTotalBudget(String(res.data.totalBudget || ''));
          if (!category) setCategory(res.data.project.category || '');
          if (!editingStyle) setEditingStyle(res.data.project.editingStyle || '');
          if (!expectedVideoDuration) setExpectedVideoDuration(res.data.project.expectedVideoDuration || '');
          if (!projectDuration && res.data.project.duration) setProjectDuration(res.data.project.duration);
        }
      }
    } catch (err) {
      console.warn('Could not load project hirings:', err.message);
    } finally {
      setIsLoadingHirings(false);
    }
  };

  // Category Options
  const categoryOptions = [
    { id: 'YouTube Longform', label: 'YouTube Longform', desc: 'Video essays, tutorials, deep dives & episodic content', icon: Film, badge: '16:9' },
    { id: 'Shorts / TikTok / Reels', label: 'Shorts / TikTok / Reels', desc: 'High-retention vertical clips with fast hooks', icon: Smartphone, badge: '9:16' },
    { id: 'Documentary & Essay', label: 'Documentary & Essay', desc: 'Vox-style investigative cuts & archival pacing', icon: FileText, badge: 'Documentary' },
    { id: 'Commercial & Brand Ad', label: 'Commercial & Brand Ad', desc: 'High-converting product promos & marketing campaigns', icon: Sparkles, badge: 'Commercial' },
    { id: 'Podcast Multi-Cam', label: 'Podcast Multi-Cam', desc: 'Syncing multi-track audio, camera cuts & switching', icon: Radio, badge: 'Audio-Visual' },
    { id: 'Gaming & Streaming Highlights', label: 'Gaming & Streaming Highlights', desc: 'Twitch montages, meme sound FX & motion zooms', icon: Gamepad2, badge: 'Gaming' },
    { id: 'Course & Educational', label: 'Course & Educational', desc: 'Structured chapter slides, screencasts & clean pacing', icon: Tv, badge: 'E-Learning' }
  ];

  // Editing Style Options
  const editingStyleOptions = [
    { id: 'Fast Paced & Retention', label: 'Fast Paced & Retention', desc: 'Frequent cuts every 2-3s, sound effects & dynamic punch zooms', icon: Scissors },
    { id: 'Cinematic Documentary', label: 'Cinematic Documentary', desc: 'Atmospheric grading, immersive Foley sound design & storytelling', icon: Film },
    { id: 'Minimalist & Clean', label: 'Minimalist & Clean', desc: 'Subtle lower thirds, seamless L/J cuts, elegant narrative focus', icon: Palette },
    { id: 'Dynamic Motion Graphics', label: 'Dynamic Motion Graphics', desc: 'Kinetic typography, 2D/3D vector animations & custom infographics', icon: Wand2 }
  ];

  // Expected Video Duration Options
  const expectedVideoDurationOptions = [
    'Under 60 Seconds (Shorts/Reels)',
    '1 - 3 Minutes',
    '3 - 5 Minutes',
    '8 - 12 Minutes',
    '15 - 25 Minutes',
    '30+ Minutes (Deep Dive / Podcast)'
  ];

  // Project Turnaround Duration Options
  const projectDurationOptions = [
    '3 - 5 Days (Rush)',
    '7 - 10 Days (Standard)',
    '2 - 3 Weeks (Comprehensive)',
    '1 Month (Long-term)',
    'Flexible / Ongoing'
  ];

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

  // AI Suggest Budget and Turnaround Duration using current market research
  const handleAiSuggestBudgetTimeline = async () => {
    if (!category && !editingStyle && !expectedVideoDuration) {
      showAlert('Please select at least a Category, Editing Style, or Expected Video Duration first.', 'warning');
      return;
    }

    setIsAiSuggestingScope(true);
    try {
      const res = await api.post('/api/ai/suggest-budget-timeline', {
        category: category || 'Video Production',
        editingStyle: editingStyle || 'Standard Production',
        expectedVideoDuration: expectedVideoDuration || 'Standard Duration',
        currency: budgetCurrency,
        requiredSkills: []
      });

      const data = res.data?.data;
      if (data) {
        if (data.recommendedBudget) {
          setTotalBudget(String(data.recommendedBudget));
        }

        // Map estimatedDeliveryDays to closest projectDuration option
        if (data.estimatedDeliveryDays) {
          const days = Number(data.estimatedDeliveryDays);
          if (days <= 5) {
            setProjectDuration('3 - 5 Days (Rush)');
          } else if (days <= 10) {
            setProjectDuration('7 - 10 Days (Standard)');
          } else if (days <= 21) {
            setProjectDuration('2 - 3 Weeks (Comprehensive)');
          } else {
            setProjectDuration('1 Month (Long-term)');
          }
        }

        setAiScopeSuggestion(data);
        showAlert(
          `AI Market Benchmark: Suggested ${budgetCurrency === 'INR' ? '₹' : '$'}${data.recommendedBudget?.toLocaleString()} (${data.complexityScore || 'Standard'} complexity, ~${data.estimatedDeliveryDays || 7} days turnaround).`,
          'success'
        );
      }
    } catch (err) {
      console.warn('[CreateProject] AI Suggest Budget & Timeline error:', err);
      showAlert(
        err.response?.data?.message || 'Could not fetch live AI suggestions. Please specify budget and turnaround manually.',
        'warning'
      );
    } finally {
      setIsAiSuggestingScope(false);
    }
  };

  // STEP 1 SUBMISSION: Saves Project with manual budget & transitions to Step 2
  const handleSaveStep1 = async (e) => {
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
    if (!totalBudget || Number(totalBudget) <= 0) {
      showAlert('Please specify the total project budget.', 'warning');
      return;
    }

    setIsSavingStep1(true);
    try {
      let uploadedImageUrls = [];

      // Upload reference images to ImageKit if any
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
      let numericVideoDuration = 0;
      if (expectedVideoDuration.includes('60 Seconds')) numericVideoDuration = 1;
      else if (expectedVideoDuration.includes('1 - 3')) numericVideoDuration = 3;
      else if (expectedVideoDuration.includes('3 - 5')) numericVideoDuration = 5;
      else if (expectedVideoDuration.includes('8 - 12')) numericVideoDuration = 10;
      else if (expectedVideoDuration.includes('15 - 25')) numericVideoDuration = 20;
      else if (expectedVideoDuration.includes('30+')) numericVideoDuration = 35;

      const payload = {
        title: title.trim(),
        description: description.trim(),
        category: category.trim(),
        editingStyle: editingStyle.trim() || undefined,
        totalBudget: Number(totalBudget),
        currency: budgetCurrency,
        projectDuration: projectDuration.trim(),
        duration: projectDuration.trim(),
        expectedVideoDuration: expectedVideoDuration.trim(),
        videoDuration: numericVideoDuration,
        referenceLinks,
        referenceImages: uploadedImageUrls,
        additionalInstructions: additionalNotes.trim()
      };

      let currentPid = projectId;
      if (currentPid) {
        // Update existing project
        const res = await api.put(`/api/creator/projects/${currentPid}`, payload);
        if (res.data?.project) {
          setProjectData(res.data.project);
        }
      } else {
        // Create new project
        const res = await api.post('/api/creator/projects', payload);
        const createdProj = res.data?.project;
        currentPid = createdProj?._id;
        setProjectId(currentPid);
        setProjectData(createdProj);
      }

      setSearchParams({ step: '2', projectId: currentPid });
      setStep(2);
      loadProjectHirings(currentPid);
      showAlert('Project saved! Now post your hiring positions for freelancers.', 'success');
    } catch (err) {
      console.error('Error saving project step 1:', err);
      showAlert(err.response?.data?.message || err.message || 'Failed to save project', 'error');
    } finally {
      setIsSavingStep1(false);
    }
  };

  // STEP 2: OPEN HIRING MODAL WITH A SELECTED ROLE OR BLANK
  const handleOpenHiringModal = (role = null) => {
    if (role) {
      setSelectedRoleId(role.id);
      setHiringRoleTitle(role.title);
      setHiringDescription(role.description || '');
      setHiringSkills(Array.isArray(role.suggestedSkills) ? [...role.suggestedSkills] : []);
      setHiringTools(Array.isArray(role.suggestedTools) ? [...role.suggestedTools] : []);
    } else {
      setSelectedRoleId('');
      setHiringRoleTitle('');
      setHiringDescription('');
      setHiringSkills([]);
      setHiringTools([]);
    }
    setHiringBudget('');
    setHiringFirstDeadline('');
    setHiringReferences([]);
    setHiringNotes('');
    setAiSuggestionData(null);
    setIsHiringModalOpen(true);
  };

  // Role Select Dropdown Change
  const handleRoleSelectChange = (roleIdVal) => {
    setSelectedRoleId(roleIdVal);
    const found = availableRoles.find(r => r.id === roleIdVal);
    if (found) {
      setHiringRoleTitle(found.title || found.name || '');
      if (!hiringDescription) setHiringDescription(found.description || '');
      setHiringSkills(Array.isArray(found.suggestedSkills) ? [...found.suggestedSkills] : []);
      setHiringTools(Array.isArray(found.suggestedTools) ? [...found.suggestedTools] : []);
    }
    setAiSuggestionData(null);
  };

  // Inherited project attributes for all hirings within this project (with reliable fallbacks)
  const effectiveCategory = category || projectData?.category || 'Video Production';
  const effectiveStyle = editingStyle || projectData?.editingStyle || 'Standard Production';
  const effectiveDuration = expectedVideoDuration || projectData?.expectedVideoDuration || projectData?.duration || 'Standard Duration';

  const canAiSuggest = Boolean(
    (selectedRoleId || hiringRoleTitle) &&
    (hiringSkills.length > 0 || hiringTools.length > 0)
  );

  // AI Suggest Budget AND Deadline for this specific hiring role
  const handleAiSuggestHiring = async () => {
    if (!canAiSuggest) {
      if (!selectedRoleId && !hiringRoleTitle) {
        showAlert('Please select a role first.', 'warning');
      } else {
        showAlert('Please add at least one required skill or tool for this role.', 'warning');
      }
      return;
    }

    setIsAiSuggestingHiring(true);
    try {
      const res = await api.post('/api/ai/suggest-role-deadline', {
        roleTitle: hiringRoleTitle,
        roleId: selectedRoleId,
        projectTitle: title || projectData?.title || '',
        projectBudget: Number(totalBudget || projectData?.totalBudget || projectData?.budget?.amount || projectData?.budget || 0),
        category: effectiveCategory,
        editingStyle: effectiveStyle,
        expectedVideoDuration: effectiveDuration,
        skills: hiringSkills,
        tools: hiringTools,
        currency: budgetCurrency || 'INR'
      });

      const data = res.data?.data;
      if (data) {
        if (data.suggestedBudget) {
          // If remaining unallocated budget is less than suggested, cap to remaining
          let budgetToApply = Number(data.suggestedBudget);
          if (remainingBudget > 0 && budgetToApply > remainingBudget) {
            budgetToApply = remainingBudget;
          }
          setHiringBudget(String(budgetToApply));
        }
        if (data.suggestedFirstDeadline) {
          let dateToSet = data.suggestedFirstDeadline.split('T')[0];
          if (maxDeadlineDateStr && dateToSet > maxDeadlineDateStr) {
            dateToSet = maxDeadlineDateStr;
          }
          setHiringFirstDeadline(dateToSet);
        }
        setAiSuggestionData(data);
        showAlert(
          `AI recommended budget (${budgetCurrency === 'INR' ? '₹' : '$'}${Number(data.suggestedBudget).toLocaleString()}) and deadline (~${data.suggestedDeadlineDays || 4} days)!`,
          'success'
        );
      }
    } catch (err) {
      console.warn('AI suggestion fallback:', err.message);
      const fallbackDays = Math.min(maxProjectTurnaroundDays || 4, 3);
      const fallbackDate = new Date();
      fallbackDate.setDate(fallbackDate.getDate() + fallbackDays);
      const fallbackDateStr = fallbackDate.toISOString().split('T')[0];
      const boundedDateStr = maxDeadlineDateStr && fallbackDateStr > maxDeadlineDateStr ? maxDeadlineDateStr : fallbackDateStr;

      let fallbackBudget = budgetCurrency === 'USD' ? 85 : 4000;
      if (numericTotalBudget > 0) {
        fallbackBudget = Math.min(fallbackBudget, Math.max(1000, Math.round(numericTotalBudget * 0.7)));
      }
      if (remainingBudget > 0 && fallbackBudget > remainingBudget) {
        fallbackBudget = remainingBudget;
      }

      setHiringBudget(String(fallbackBudget));
      setHiringFirstDeadline(boundedDateStr);
      setAiSuggestionData({
        suggestedBudget: fallbackBudget,
        suggestedDeadlineDays: fallbackDays,
        suggestedFirstDeadline: new Date(boundedDateStr).toISOString(),
        budgetRationale: `Benchmark market rate for ${hiringRoleTitle} on ${effectiveCategory}.`,
        timelineRationale: `Calculated standard turnaround of ${fallbackDays} days for initial cut.`
      });
      showAlert('AI suggestions applied to budget and deadline!', 'success');
    } finally {
      setIsAiSuggestingHiring(false);
    }
  };

  // Add & Remove skill/tool tags in hiring modal
  const addHiringSkill = (e) => {
    e.preventDefault();
    if (newHiringSkill.trim() && !hiringSkills.includes(newHiringSkill.trim())) {
      setHiringSkills([...hiringSkills, newHiringSkill.trim()]);
      setNewHiringSkill('');
    }
  };

  const removeHiringSkill = (skill) => {
    setHiringSkills(hiringSkills.filter(s => s !== skill));
  };

  const addHiringTool = (e) => {
    e.preventDefault();
    if (newHiringTool.trim() && !hiringTools.includes(newHiringTool.trim())) {
      setHiringTools([...hiringTools, newHiringTool.trim()]);
      setNewHiringTool('');
    }
  };

  const removeHiringTool = (tool) => {
    setHiringTools(hiringTools.filter(t => t !== tool));
  };

  // Add reference link to hiring position
  const addHiringRefLink = (e) => {
    e.preventDefault();
    if (newHiringRef.trim()) {
      setHiringReferences([...hiringReferences, newHiringRef.trim()]);
      setNewHiringRef('');
    }
  };

  // Turnaround constraints for hiring first deadline
  const currentDurationStr = projectDuration || projectData?.duration || projectData?.projectDuration || '';
  const maxProjectTurnaroundDays = parseProjectTurnaroundMaxDays(currentDurationStr);

  const todayStr = new Date().toISOString().split('T')[0];
  const maxDeadlineDateStr = maxProjectTurnaroundDays
    ? new Date(Date.now() + maxProjectTurnaroundDays * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    : undefined;

  // Real-time preview of the 3-phase milestones for this role
  const previewMilestones = selectedRoleId && Number(hiringBudget) > 0
    ? generateMilestonesForRole(selectedRoleId, Number(hiringBudget), hiringFirstDeadline, hiringRoleTitle)
    : [];

  // SUBMIT NEW ROLE HIRING
  const handlePostHiringSubmit = async (e) => {
    e.preventDefault();
    if (!selectedRoleId || !hiringRoleTitle.trim()) {
      showAlert('Please select a role.', 'warning');
      return;
    }

    const enteredRoleBudget = Number(hiringBudget);
    if (!hiringBudget || enteredRoleBudget <= 0) {
      showAlert('Please specify a valid budget for this role.', 'warning');
      return;
    }

    // Validation 1: Role budget cannot exceed total project budget
    if (numericTotalBudget > 0 && enteredRoleBudget > numericTotalBudget) {
      showAlert(
        `Role budget (${budgetCurrency === 'INR' ? '₹' : '$'}${enteredRoleBudget.toLocaleString()}) cannot exceed the total project budget (${budgetCurrency === 'INR' ? '₹' : '$'}${numericTotalBudget.toLocaleString()}).`,
        'error'
      );
      return;
    }

    // Validation 2: Role budget cannot exceed the remaining unallocated project budget
    if (numericTotalBudget > 0 && enteredRoleBudget > remainingBudget) {
      showAlert(
        `Role budget exceeds remaining project budget! You only have ${budgetCurrency === 'INR' ? '₹' : '$'}${remainingBudget.toLocaleString()} available.`,
        'error'
      );
      return;
    }

    // Validation 3: Milestone deadline cannot exceed project turnaround duration
    if (hiringFirstDeadline) {
      if (hiringFirstDeadline < todayStr) {
        showAlert('First milestone deadline cannot be in the past.', 'error');
        return;
      }

      if (maxProjectTurnaroundDays && maxDeadlineDateStr && hiringFirstDeadline > maxDeadlineDateStr) {
        showAlert(
          `First milestone deadline cannot exceed the project turnaround duration (${currentDurationStr || `${maxProjectTurnaroundDays} days`}). Please pick a date on or before ${new Date(maxDeadlineDateStr).toLocaleDateString()}.`,
          'error'
        );
        return;
      }
    }

    if (!projectId) {
      showAlert('Missing project ID. Please save project first.', 'error');
      return;
    }

    setIsPostingHiring(true);
    try {
      const payload = {
        roleId: selectedRoleId,
        roleTitle: hiringRoleTitle.trim(),
        description: hiringDescription.trim(),
        requiredSkills: hiringSkills,
        requiredTools: hiringTools,
        budget: enteredRoleBudget,
        currency: budgetCurrency,
        firstDeadline: hiringFirstDeadline ? new Date(hiringFirstDeadline).toISOString() : undefined,
        references: hiringReferences,
        additionalNotes: hiringNotes.trim(),
        milestones: previewMilestones
      };

      await api.post(`/api/creator/projects/${projectId}/hirings`, payload);
      showAlert(`Hiring position "${hiringRoleTitle}" posted live! 🚀`, 'success');
      setIsHiringModalOpen(false);
      loadProjectHirings(projectId);
    } catch (err) {
      console.error('Error posting hiring position:', err);
      showAlert(err.response?.data?.message || err.message || 'Failed to post hiring position', 'error');
    } finally {
      setIsPostingHiring(false);
    }
  };

  // DELETE HIRING POSITION
  const handleDeleteHiring = async (hiringId) => {
    if (!window.confirm('Are you sure you want to remove this hiring position?')) return;
    try {
      await api.delete(`/api/creator/projects/${projectId}/hirings/${hiringId}`);
      showAlert('Hiring position removed.', 'info');
      loadProjectHirings(projectId);
    } catch (err) {
      showAlert(err.response?.data?.message || 'Failed to remove hiring position', 'error');
    }
  };

  // Compute budget allocation statistics
  const numericTotalBudget = Number(totalBudget) || (projectData?.totalBudget ? Number(projectData.totalBudget) : 0);
  const allocatedBudget = hirings.reduce((sum, h) => sum + (Number(h.budget) || 0), 0);
  const remainingBudget = Math.max(0, numericTotalBudget - allocatedBudget);
  const percentAllocated = numericTotalBudget > 0 ? Math.min(100, Math.round((allocatedBudget / numericTotalBudget) * 100)) : 0;

  const selectedCategoryObj = categoryOptions.find(c => c.id === category);
  const selectedStyleObj = editingStyleOptions.find(s => s.id === editingStyle);

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16 animate-fade-in">
      <SEO
        title={step === 1 ? 'Create Project Brief' : 'Post Hirings & Team Assembly'}
        description="Define your production scope, manual budget, and post roles to hire video editors and freelancers."
      />

      {/* Top Header & Step Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (step === 2) {
                setStep(1);
                setSearchParams({ step: '1', projectId });
              } else {
                navigate('/creator/dashboard');
              }
            }}
            className="p-2.5 rounded-xl bg-white dark:bg-[#201413] text-[#382322] dark:text-[#FDEBDE] border-2 border-[#382322] dark:border-[#FDEBDE]/30 shadow-[2px_2px_0_#382322] dark:shadow-[2px_2px_0_#000] hover:bg-[#FFEBAA] transition-colors cursor-pointer"
            title={step === 2 ? 'Back to Step 1' : 'Back to Dashboard'}
          >
            <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#382322] bg-[#FFEBAA] px-2.5 py-0.5 rounded-md border-2 border-[#382322]">
                {step === 1 ? 'Step 1 of 2: Project Scope' : 'Step 2 of 2: Post Hirings'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black font-serif text-[#261615] dark:text-[#FDEBDE] tracking-tight mt-1.5">
              {step === 1 ? 'Create New Project' : 'Assemble Team & Post Hirings'}
            </h1>
          </div>
        </div>

        {/* Step Progression Pills */}
        <div className="flex items-center gap-2 bg-white dark:bg-[#201413] p-1.5 rounded-xl border-2 border-[#382322] dark:border-[#FDEBDE]/30 shadow-[2px_2px_0_#382322] text-xs">
          <button
            type="button"
            onClick={() => {
              setStep(1);
              setSearchParams({ step: '1', projectId: projectId || '' });
            }}
            className={`px-3.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              step === 1
                ? 'bg-[#FFEBAA] text-[#261615] border-2 border-[#382322] shadow-[1.5px_1.5px_0_#382322]'
                : 'text-[#5C3A38] dark:text-[#D4B8A8] hover:text-[#261615] dark:hover:text-[#FDEBDE]'
            }`}
          >
            1. Scope & Budget
          </button>
          <button
            type="button"
            onClick={() => {
              if (projectId) {
                setStep(2);
                setSearchParams({ step: '2', projectId });
              } else {
                showAlert('Please complete Step 1 to generate your project.', 'info');
              }
            }}
            className={`px-3.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              step === 2
                ? 'bg-[#FFEBAA] text-[#261615] border-2 border-[#382322] shadow-[1.5px_1.5px_0_#382322]'
                : 'text-[#5C3A38] dark:text-[#D4B8A8] hover:text-[#261615] dark:hover:text-[#FDEBDE]'
            }`}
          >
            2. Post Hirings {hirings.length > 0 && `(${hirings.length})`}
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* STEP 1: PROJECT SCOPE & MANUAL TOTAL BUDGET (NOT AI GENERATED)            */}
      {/* ========================================================================= */}
      {step === 1 && (
        <form onSubmit={handleSaveStep1} className="space-y-7">
          {/* Section 1: Overview */}
          <div className="brutal-card p-6 md:p-7 space-y-5 rounded-2xl">
            <div className="flex items-center gap-2 pb-3 border-b-2 border-[#382322]/15 dark:border-[#FDEBDE]/15">
              <Film className="w-4 h-4 text-[#382322] dark:text-[#FFEBAA]" />
              <h3 className="text-base font-bold font-serif text-[#261615] dark:text-[#FDEBDE]">Project Scope & Brief</h3>
            </div>

            {/* Title */}
            <div>
              <label className="text-xs font-bold text-[#382322] dark:text-[#FFEBAA] block mb-1.5 font-serif uppercase tracking-wider">
                Project Title <span className="text-rose-600 dark:text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. 15-Min Cinematic Tech Documentary on Autonomous Agents"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white dark:bg-[#201413] border-2 border-[#382322] dark:border-[#FDEBDE]/30 text-sm text-[#261615] dark:text-[#FDEBDE] placeholder:text-[#382322]/40 dark:placeholder:text-[#FDEBDE]/40 shadow-[2px_2px_0_#382322] dark:shadow-[2px_2px_0_#000] focus:outline-none focus:ring-2 focus:ring-[#FFEBAA] font-medium transition-all"
              />
            </div>

            {/* Description */}
            <div>
              <label className="text-xs font-bold text-[#382322] dark:text-[#FFEBAA] block mb-1.5 font-serif uppercase tracking-wider">
                Project Brief & Storyline Description <span className="text-rose-600 dark:text-rose-400">*</span>
              </label>
              <textarea
                rows={4}
                required
                placeholder="Describe your creative vision, story outline, target audience, and key deliverables..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white dark:bg-[#201413] border-2 border-[#382322] dark:border-[#FDEBDE]/30 text-xs text-[#261615] dark:text-[#FDEBDE] placeholder:text-[#382322]/40 dark:placeholder:text-[#FDEBDE]/40 shadow-[2px_2px_0_#382322] dark:shadow-[2px_2px_0_#000] focus:outline-none focus:ring-2 focus:ring-[#FFEBAA] font-medium resize-none leading-relaxed transition-all"
              />
            </div>

            {/* Category & Editing Style Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Category Dropdown */}
              <div className="relative" ref={categoryRef}>
                <label className="text-xs font-bold text-[#382322] dark:text-[#FFEBAA] block mb-1.5 font-serif uppercase tracking-wider">
                  Category <span className="text-rose-600 dark:text-rose-400">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setIsCategoryOpen(!isCategoryOpen);
                    setIsStyleOpen(false);
                  }}
                  className={`w-full px-4 py-2.5 rounded-xl bg-white dark:bg-[#201413] border-2 border-[#382322] dark:border-[#FDEBDE]/30 shadow-[2px_2px_0_#382322] text-xs text-left flex items-center justify-between transition-all cursor-pointer ${
                    isCategoryOpen ? 'ring-2 ring-[#382322] text-[#261615] dark:text-[#FDEBDE]' : 'text-[#261615] dark:text-[#FDEBDE]'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {selectedCategoryObj ? (
                      <>
                        <div className="w-6 h-6 rounded-lg bg-[#FFEBAA] border border-[#382322] flex items-center justify-center shrink-0">
                          {React.createElement(selectedCategoryObj.icon, { className: 'w-3.5 h-3.5 text-[#382322]' })}
                        </div>
                        <span className="font-bold text-[#261615] dark:text-[#FDEBDE] truncate">{selectedCategoryObj.label}</span>
                      </>
                    ) : (
                      <span className="text-[#382322]/50 dark:text-[#FDEBDE]/50 font-medium">Select video category...</span>
                    )}
                  </div>
                  <ChevronDown className={`w-4 h-4 text-[#382322] dark:text-[#FDEBDE] shrink-0 transition-transform ${isCategoryOpen ? 'rotate-180' : ''}`} />
                </button>

                {isCategoryOpen && (
                  <div className="absolute left-0 right-0 top-full mt-2 z-30 p-2 rounded-2xl bg-[#FFF7F1] dark:bg-[#261817] border-2 border-[#382322] dark:border-[#FFEBAA]/40 shadow-[4px_4px_0_#382322] dark:shadow-[4px_4px_0_#000] space-y-1 max-h-72 overflow-y-auto">
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
                            isSelected ? 'bg-[#FFEBAA] dark:bg-[#382322] border-2 border-[#382322] text-[#261615] dark:text-[#FFEBAA] font-bold shadow-xs' : 'hover:bg-white/80 dark:hover:bg-white/10 text-[#382322] dark:text-[#FDEBDE]'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border border-[#382322] ${isSelected ? 'bg-[#382322] text-[#FFEBAA]' : 'bg-[#FAF0E6] text-[#382322]'}`}>
                              <IconComp className="w-3.5 h-3.5" />
                            </div>
                            <div className="min-w-0">
                              <span className="text-xs font-bold block">{opt.label}</span>
                              <p className="text-[11px] text-[#5C3A38] dark:text-[#D4B8A8] truncate mt-0.5">{opt.desc}</p>
                            </div>
                          </div>
                          {isSelected && <Check className="w-4 h-4 text-[#382322] dark:text-[#FFEBAA] shrink-0 ml-2" />}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Editing Style Dropdown */}
              <div className="relative" ref={styleRef}>
                <label className="text-xs font-bold text-[#382322] dark:text-[#FFEBAA] block mb-1.5 font-serif uppercase tracking-wider">
                  Editing Style
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setIsStyleOpen(!isStyleOpen);
                    setIsCategoryOpen(false);
                  }}
                  className={`w-full px-4 py-2.5 rounded-xl bg-white dark:bg-[#201413] border-2 border-[#382322] dark:border-[#FDEBDE]/30 shadow-[2px_2px_0_#382322] text-xs text-left flex items-center justify-between transition-all cursor-pointer ${
                    isStyleOpen ? 'ring-2 ring-[#382322] text-[#261615] dark:text-[#FDEBDE]' : 'text-[#261615] dark:text-[#FDEBDE]'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {selectedStyleObj ? (
                      <>
                        <div className="w-6 h-6 rounded-lg bg-[#B1C8EA] border border-[#382322] flex items-center justify-center shrink-0">
                          {React.createElement(selectedStyleObj.icon, { className: 'w-3.5 h-3.5 text-[#382322]' })}
                        </div>
                        <span className="font-bold text-[#261615] dark:text-[#FDEBDE] truncate">{selectedStyleObj.label}</span>
                      </>
                    ) : (
                      <span className="text-[#382322]/50 dark:text-[#FDEBDE]/50 font-medium">Select editing style...</span>
                    )}
                  </div>
                  <ChevronDown className={`w-4 h-4 text-[#382322] dark:text-[#FDEBDE] shrink-0 transition-transform ${isStyleOpen ? 'rotate-180' : ''}`} />
                </button>

                {isStyleOpen && (
                  <div className="absolute left-0 right-0 top-full mt-2 z-30 p-2 rounded-2xl bg-[#FFF7F1] dark:bg-[#261817] border-2 border-[#382322] dark:border-[#FFEBAA]/40 shadow-[4px_4px_0_#382322] dark:shadow-[4px_4px_0_#000] space-y-1 max-h-72 overflow-y-auto">
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
                            isSelected ? 'bg-[#FFEBAA] dark:bg-[#382322] border-2 border-[#382322] text-[#261615] dark:text-[#FFEBAA] font-bold shadow-xs' : 'hover:bg-white/80 dark:hover:bg-white/10 text-[#382322] dark:text-[#FDEBDE]'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border border-[#382322] ${isSelected ? 'bg-[#382322] text-[#FFEBAA]' : 'bg-[#FAF0E6] text-[#382322]'}`}>
                              <IconComp className="w-3.5 h-3.5" />
                            </div>
                            <div className="min-w-0">
                              <span className="text-xs font-bold block">{opt.label}</span>
                              <p className="text-[11px] text-[#5C3A38] dark:text-[#D4B8A8] truncate mt-0.5">{opt.desc}</p>
                            </div>
                          </div>
                          {isSelected && <Check className="w-4 h-4 text-[#382322] dark:text-[#FFEBAA] shrink-0 ml-2" />}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Section 2: Expected Video Duration */}
          <div className="brutal-card p-6 md:p-7 space-y-4 rounded-2xl">
            <div className="flex items-center justify-between pb-3 border-b-2 border-[#382322]/15 dark:border-[#FDEBDE]/15">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#382322] dark:text-[#FFEBAA]" />
                <h3 className="text-base font-bold font-serif text-[#261615] dark:text-[#FDEBDE]">Expected Video Duration</h3>
              </div>
              <span className="text-[11px] text-[#5C3A38] dark:text-[#D4B8A8] font-medium">Target runtime of the finished video</span>
            </div>

            <div className="relative" ref={expectedDurationRef}>
              <label className="text-xs font-bold text-[#382322] dark:text-[#FFEBAA] block mb-1.5 font-serif uppercase tracking-wider">
                Target Length <span className="text-rose-600 dark:text-rose-400">*</span>
              </label>
              <button
                type="button"
                onClick={() => setIsExpectedDurationOpen(!isExpectedDurationOpen)}
                className={`w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#201413] border-2 border-[#382322] dark:border-[#FDEBDE]/30 shadow-[2px_2px_0_#382322] text-xs text-left flex items-center justify-between transition-all cursor-pointer ${
                  isExpectedDurationOpen ? 'ring-2 ring-[#382322] text-[#261615] dark:text-[#FDEBDE]' : 'text-[#261615] dark:text-[#FDEBDE]'
                }`}
              >
                <span className={expectedVideoDuration ? 'text-[#261615] dark:text-[#FDEBDE] font-bold' : 'text-[#382322]/50 dark:text-[#FDEBDE]/50 font-medium'}>
                  {expectedVideoDuration || 'Select Expected Duration...'}
                </span>
                <ChevronDown className={`w-3.5 h-3.5 text-[#382322] dark:text-[#FDEBDE] transition-transform ${isExpectedDurationOpen ? 'rotate-180' : ''}`} />
              </button>

              {isExpectedDurationOpen && (
                <div className="absolute left-0 right-0 top-full mt-2 z-30 p-1.5 rounded-2xl bg-[#FFF7F1] dark:bg-[#261817] border-2 border-[#382322] dark:border-[#FFEBAA]/40 shadow-[4px_4px_0_#382322] dark:shadow-[4px_4px_0_#000] space-y-0.5 max-h-60 overflow-y-auto">
                  {expectedVideoDurationOptions.map((opt) => (
                    <div
                      key={opt}
                      onClick={() => {
                        setExpectedVideoDuration(opt);
                        setIsExpectedDurationOpen(false);
                      }}
                      className={`px-3 py-2 rounded-xl text-xs flex items-center justify-between cursor-pointer transition-colors ${
                        expectedVideoDuration === opt ? 'bg-[#FFEBAA] text-[#261615] border border-[#382322] font-bold' : 'hover:bg-white/80 dark:hover:bg-white/10 text-[#382322] dark:text-[#FDEBDE]'
                      }`}
                    >
                      <span>{opt}</span>
                      {expectedVideoDuration === opt && <Check className="w-3.5 h-3.5 text-[#382322]" />}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Section 3: Total Budget & Turnaround Duration with AI Market Research Suggestion */}
          <div className="brutal-card p-6 md:p-7 space-y-5 rounded-2xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b-2 border-[#382322]/15 dark:border-[#FDEBDE]/15">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                <h3 className="text-base font-bold font-serif text-[#261615] dark:text-[#FDEBDE]">Total Project Budget & Turnaround</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleAiSuggestBudgetTimeline}
                  disabled={isAiSuggestingScope}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#FFEBAA] hover:bg-[#fff2cc] text-[#261615] border-2 border-[#382322] shadow-[2px_2px_0_#382322] transition-all cursor-pointer group disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Estimate budget and turnaround duration based on category, editing style, and runtime"
                >
                  <Sparkles className={`w-3.5 h-3.5 text-[#382322] group-hover:rotate-12 transition-transform ${isAiSuggestingScope ? 'animate-spin' : ''}`} />
                  <span>{isAiSuggestingScope ? 'Analyzing Market...' : 'AI Market Suggest'}</span>
                </button>
              </div>
            </div>

            <p className="text-xs text-[#5C3A38] dark:text-[#D4B8A8] leading-relaxed font-medium">
              Define the overall financial budget for this production. Use our AI pricing engine to analyze current freelance market rates for your selected category, editing style, and duration.
            </p>

            {/* AI Market Analysis Banner if suggestion is available */}
            {aiScopeSuggestion && (
              <div className="p-3.5 rounded-xl bg-[#FFEBAA]/40 dark:bg-[#382322]/40 border-2 border-[#382322] space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#261615] dark:text-[#FFEBAA]">
                    <Sparkles className="w-3.5 h-3.5 text-[#382322] dark:text-[#FFEBAA]" />
                    <span>Live Market Benchmark ({aiScopeSuggestion.complexityScore || 'Standard'} Complexity)</span>
                  </div>
                  <span className="text-xs font-mono text-emerald-800 dark:text-emerald-300 font-bold">
                    Range: {budgetCurrency === 'INR' ? '₹' : '$'}{aiScopeSuggestion.minBudget?.toLocaleString()} - {budgetCurrency === 'INR' ? '₹' : '$'}{aiScopeSuggestion.maxBudget?.toLocaleString()}
                  </span>
                </div>
                {aiScopeSuggestion.marketAnalysis && (
                  <p className="text-[11px] text-[#261615] dark:text-[#FDEBDE] leading-relaxed">
                    {aiScopeSuggestion.marketAnalysis}
                  </p>
                )}
                {Array.isArray(aiScopeSuggestion.keyCostDrivers) && aiScopeSuggestion.keyCostDrivers.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[10px] text-[#5C3A38] dark:text-[#D4B8A8] font-bold">Cost drivers:</span>
                    {aiScopeSuggestion.keyCostDrivers.map((driver, idx) => (
                      <span key={idx} className="text-[10px] px-2 py-0.5 rounded bg-white dark:bg-[#201413] border border-[#382322] text-[#261615] dark:text-[#FDEBDE] font-semibold">
                        {driver}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Total Budget Input */}
              <div>
                <label className="text-xs font-bold text-[#382322] dark:text-[#FFEBAA] block mb-1.5 font-serif uppercase tracking-wider">
                  Total Project Budget <span className="text-rose-600 dark:text-rose-400">*</span>
                </label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#382322] dark:text-[#FFEBAA] text-xs font-bold pointer-events-none">
                    <span>{budgetCurrency === 'INR' ? '₹' : '$'}</span>
                  </div>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 25000"
                    value={totalBudget}
                    onChange={(e) => setTotalBudget(e.target.value)}
                    className="w-full pl-9 pr-16 py-2.5 rounded-xl bg-white dark:bg-[#201413] border-2 border-[#382322] dark:border-[#FDEBDE]/30 text-sm text-[#261615] dark:text-[#FFEBAA] font-bold shadow-[2px_2px_0_#382322] dark:shadow-[2px_2px_0_#000] focus:outline-none focus:ring-2 focus:ring-[#FFEBAA] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setBudgetCurrency(prev => prev === 'INR' ? 'USD' : 'INR')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 text-[10px] font-bold bg-[#FFEBAA] text-[#261615] border border-[#382322] rounded-lg transition-colors cursor-pointer"
                  >
                    {budgetCurrency}
                  </button>
                </div>
              </div>

              {/* Project Delivery Duration */}
              <div className="relative" ref={projectDurationRef}>
                <label className="text-xs font-bold text-[#382322] dark:text-[#FFEBAA] block mb-1.5 font-serif uppercase tracking-wider">
                  Project Turnaround Duration
                </label>
                <button
                  type="button"
                  onClick={() => setIsProjectDurationOpen(!isProjectDurationOpen)}
                  className={`w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#201413] border-2 border-[#382322] dark:border-[#FDEBDE]/30 shadow-[2px_2px_0_#382322] text-xs text-left flex items-center justify-between transition-all cursor-pointer ${
                    isProjectDurationOpen ? 'ring-2 ring-[#382322] text-[#261615] dark:text-[#FDEBDE]' : 'text-[#261615] dark:text-[#FDEBDE]'
                  }`}
                >
                  <span className={projectDuration ? 'text-[#261615] dark:text-[#FDEBDE] font-bold' : 'text-[#382322]/50 dark:text-[#FDEBDE]/50 font-medium'}>
                    {projectDuration || 'Select Duration...'}
                  </span>
                  <ChevronDown className={`w-3.5 h-3.5 text-[#382322] dark:text-[#FDEBDE] transition-transform ${isProjectDurationOpen ? 'rotate-180' : ''}`} />
                </button>

                {isProjectDurationOpen && (
                  <div className="absolute left-0 right-0 top-full mt-2 z-30 p-1.5 rounded-2xl bg-[#FFF7F1] dark:bg-[#261817] border-2 border-[#382322] dark:border-[#FFEBAA]/40 shadow-[4px_4px_0_#382322] dark:shadow-[4px_4px_0_#000] space-y-0.5 max-h-60 overflow-y-auto">
                    {projectDurationOptions.map((opt) => (
                      <div
                        key={opt}
                        onClick={() => {
                          setProjectDuration(opt);
                          setIsProjectDurationOpen(false);
                        }}
                        className={`px-3 py-2 rounded-xl text-xs flex items-center justify-between cursor-pointer transition-colors ${
                          projectDuration === opt ? 'bg-[#FFEBAA] text-[#261615] border border-[#382322] font-bold' : 'hover:bg-white/80 dark:hover:bg-white/10 text-[#382322] dark:text-[#FDEBDE]'
                        }`}
                      >
                        <span>{opt}</span>
                        {projectDuration === opt && <Check className="w-3.5 h-3.5 text-[#382322]" />}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Section 4: Reference Images & Moodboard */}
          <div className="bg-white dark:bg-[#201413] p-6 md:p-7 space-y-4 border-2 border-[#382322] dark:border-[#FDEBDE]/30 rounded-2xl shadow-[4px_4px_0_#382322] dark:shadow-[4px_4px_0_#FDEBDE]/20">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b-2 border-[#382322]/10 dark:border-[#FDEBDE]/10">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#382322] dark:text-[#FFEBAA]" />
                <h3 className="text-base font-bold font-serif text-[#261615] dark:text-[#FDEBDE]">Reference Images & Moodboard</h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#FFEBAA] text-[#261615] border border-[#382322]">
                  {selectedImages.length} / 3 Images
                </span>
                <span className="text-[11px] text-[#5C3A38] dark:text-[#D4B8A8]">Max 3 (PNG, JPG, WebP)</span>
              </div>
            </div>

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

            <div className="space-y-3">
              {selectedImages.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {selectedImages.map((img, idx) => (
                    <div key={img.id} className="relative group rounded-xl overflow-hidden border-2 border-[#382322] dark:border-[#FDEBDE]/30 bg-white dark:bg-[#261817] shadow-[2px_2px_0_#382322] flex flex-col">
                      <div className="aspect-video w-full overflow-hidden bg-[#FAF0E6] dark:bg-[#19100F] relative">
                        <img
                          src={img.preview}
                          alt={`Reference image ${idx + 1}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(img.id)}
                          className="absolute top-2 right-2 p-1.5 rounded-lg bg-[#261615]/80 hover:bg-rose-600 text-white transition-colors cursor-pointer shadow-md"
                          title="Remove image"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <span className="absolute bottom-2 left-2 px-1.5 py-0.5 rounded bg-[#261615]/80 text-[10px] font-mono text-[#FFEBAA]">
                          #{idx + 1}
                        </span>
                      </div>
                      <div className="p-2.5 flex items-center justify-between text-xs">
                        <span className="text-[#261615] dark:text-[#FDEBDE] font-medium truncate max-w-[120px]">{img.name}</span>
                        <span className="text-[10px] text-[#5C3A38] dark:text-[#D4B8A8] font-mono">{img.size}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

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
                      ? 'border-[#382322] bg-[#FFEBAA]/30 ring-2 ring-[#382322]/20'
                      : 'border-[#382322]/30 dark:border-[#FDEBDE]/30 hover:border-[#382322] bg-[#FAF0E6]/50 dark:bg-[#201413]/50 hover:bg-[#FFEBAA]/10'
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-[#FFEBAA] border border-[#382322] flex items-center justify-center text-[#261615] shadow-[2px_2px_0_#382322]">
                    <Upload className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#261615] dark:text-[#FDEBDE]">Click to browse or drag & drop reference images</p>
                    <p className="text-[11px] text-[#5C3A38] dark:text-[#D4B8A8] mt-0.5">Visual storyboard stills, color palettes, or thumbnail inspiration ({selectedImages.length}/3)</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Section 5: Reference Links & Notes */}
          <div className="bg-white dark:bg-[#201413] p-6 md:p-7 space-y-4 border-2 border-[#382322] dark:border-[#FDEBDE]/30 rounded-2xl shadow-[4px_4px_0_#382322] dark:shadow-[4px_4px_0_#FDEBDE]/20">
            <div className="flex items-center gap-2 pb-3 border-b-2 border-[#382322]/10 dark:border-[#FDEBDE]/10">
              <LinkIcon className="w-4 h-4 text-[#382322] dark:text-[#FFEBAA]" />
              <h3 className="text-base font-bold font-serif text-[#261615] dark:text-[#FDEBDE]">Reference Inspiration Links</h3>
            </div>

            <div className="space-y-2.5">
              {referenceLinks.map((link, idx) => (
                <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-[#FAF0E6] dark:bg-[#261817] border border-[#382322]/20 dark:border-[#FDEBDE]/20">
                  <div className="flex items-center gap-2 min-w-0">
                    <LinkIcon className="w-3.5 h-3.5 text-[#5C3A38] dark:text-[#D4B8A8] shrink-0" />
                    <span className="text-xs text-[#261615] dark:text-[#FDEBDE] font-mono truncate">{link}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeReferenceLink(idx)}
                    className="p-1 rounded-lg text-[#5C3A38] hover:text-rose-600 transition-colors cursor-pointer"
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
                  className="flex-1 px-3.5 py-2.5 text-xs rounded-xl bg-white dark:bg-[#261817] text-[#261615] dark:text-[#FDEBDE] placeholder:text-[#382322]/40 dark:placeholder:text-[#FDEBDE]/40 border-2 border-[#382322] dark:border-[#FDEBDE]/30 focus:outline-none focus:ring-1 focus:ring-[#382322] shadow-[2px_2px_0_#382322]"
                />
                <Button variant="secondary" size="sm" icon={Plus} onClick={addReferenceLink}>
                  Add Link
                </Button>
              </div>
            </div>
          </div>

          {/* Step 1 Save & Continue CTA */}
          <div className="flex items-center justify-between p-5 rounded-2xl bg-white dark:bg-[#201413] border-2 border-[#382322] dark:border-[#FDEBDE]/30 shadow-[4px_4px_0_#382322] dark:shadow-[4px_4px_0_#FDEBDE]/20">
            <button
              type="button"
              onClick={() => navigate('/creator/dashboard')}
              className="text-xs font-bold text-[#5C3A38] dark:text-[#D4B8A8] hover:text-[#261615] dark:hover:text-[#FDEBDE] transition-colors cursor-pointer"
            >
              Discard & Return
            </button>

            <button
              type="submit"
              disabled={isSavingStep1}
              className="group relative inline-flex items-center gap-2 px-8 py-3 rounded-xl text-xs font-bold uppercase tracking-wider text-[#261615] bg-[#FFEBAA] hover:bg-[#ffe38a] shadow-[3px_3px_0_#382322] border-2 border-[#382322] active:translate-x-0.5 active:translate-y-0.5 transition-all disabled:opacity-50 cursor-pointer"
            >
              <span>{isSavingStep1 ? 'Saving Project Scope...' : 'Save & Continue to Step 2: Post Hirings'}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </form>
      )}

      {/* ========================================================================= */}
      {/* STEP 2: POST HIRINGS, VIEW ACTIVE HIRINGS & HIRED FREELANCERS             */}
      {/* ========================================================================= */}
      {step === 2 && (
        <div className="space-y-7">
          {/* Top Project Summary & Budget Allocation Card */}
          <div className="bg-white dark:bg-[#201413] p-6 md:p-7 space-y-5 border-2 border-[#382322] dark:border-[#FDEBDE]/30 rounded-2xl shadow-[4px_4px_0_#382322] dark:shadow-[4px_4px_0_#FDEBDE]/20">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b-2 border-[#382322]/10 dark:border-[#FDEBDE]/10">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#261615] bg-[#FFEBAA] px-2.5 py-0.5 rounded border border-[#382322]">
                  {category || 'Production Project'}
                </span>
                <h2 className="text-xl sm:text-2xl font-black font-serif text-[#261615] dark:text-[#FDEBDE] mt-1.5">{title}</h2>
              </div>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-xs font-bold text-[#382322] dark:text-[#FFEBAA] underline underline-offset-4 self-start sm:self-auto cursor-pointer"
              >
                Edit Scope Details
              </button>
            </div>

            {/* Financial Ledger & Budget Tracker */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-[#FAF0E6] dark:bg-[#261817] border-2 border-[#382322] dark:border-[#FDEBDE]/30 shadow-[2px_2px_0_#382322]">
                <div className="text-[11px] font-bold text-[#5C3A38] dark:text-[#D4B8A8]">Total Project Budget</div>
                <div className="text-2xl font-black font-serif text-[#261615] dark:text-[#FDEBDE] mt-1">
                  {budgetCurrency === 'INR' ? '₹' : '$'}{numericTotalBudget.toLocaleString()}
                </div>
                <div className="text-[10px] text-[#5C3A38] dark:text-[#D4B8A8] mt-0.5">Set manually in Step 1</div>
              </div>

              <div className="p-4 rounded-xl bg-[#B1C8EA]/30 dark:bg-[#B1C8EA]/10 border-2 border-[#382322] dark:border-[#FDEBDE]/30 shadow-[2px_2px_0_#382322]">
                <div className="text-[11px] font-bold text-[#5C3A38] dark:text-[#D4B8A8]">Allocated for Hirings</div>
                <div className="text-2xl font-black font-serif text-[#261615] dark:text-[#FFEBAA] mt-1">
                  {budgetCurrency === 'INR' ? '₹' : '$'}{allocatedBudget.toLocaleString()}
                </div>
                <div className="text-[10px] text-[#5C3A38] dark:text-[#D4B8A8] mt-0.5">{hirings.length} role(s) defined</div>
              </div>

              <div className="p-4 rounded-xl bg-[#FFEBAA]/40 dark:bg-[#FFEBAA]/10 border-2 border-[#382322] dark:border-[#FDEBDE]/30 shadow-[2px_2px_0_#382322]">
                <div className="text-[11px] font-bold text-[#5C3A38] dark:text-[#D4B8A8]">Remaining Unallocated</div>
                <div className={`text-2xl font-black font-serif mt-1 ${remainingBudget >= 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                  {budgetCurrency === 'INR' ? '₹' : '$'}{remainingBudget.toLocaleString()}
                </div>
                <div className="text-[10px] text-[#5C3A38] dark:text-[#D4B8A8] mt-0.5">
                  {percentAllocated}% total allocated
                </div>
              </div>
            </div>

            {/* Allocation Progress Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-[11px] font-bold text-[#5C3A38] dark:text-[#D4B8A8]">
                <span>Budget Allocation Tracker</span>
                <span>{percentAllocated}% Allocated</span>
              </div>
              <div className="w-full h-3 rounded-full bg-[#FAF0E6] dark:bg-[#19100F] border border-[#382322] dark:border-[#FDEBDE]/30 overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${
                    percentAllocated > 100
                      ? 'bg-rose-500'
                      : percentAllocated > 80
                      ? 'bg-amber-400'
                      : 'bg-[#FFEBAA] border-r border-[#382322]'
                  }`}
                  style={{ width: `${Math.min(100, percentAllocated)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Section: ACTIVE HIRINGS (with '+' button) */}
          <div className="bg-white dark:bg-[#201413] p-6 md:p-7 space-y-5 border-2 border-[#382322] dark:border-[#FDEBDE]/30 rounded-2xl shadow-[4px_4px_0_#382322] dark:shadow-[4px_4px_0_#FDEBDE]/20">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b-2 border-[#382322]/10 dark:border-[#FDEBDE]/10">
              <div>
                <div className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-[#382322] dark:text-[#FFEBAA]" />
                  <h3 className="text-base font-bold font-serif text-[#261615] dark:text-[#FDEBDE]">Active Hirings & Role Openings</h3>
                </div>
                <p className="text-xs text-[#5C3A38] dark:text-[#D4B8A8] mt-0.5">
                  Post specific roles (e.g. Video Editor, Thumbnail Designer, Sound Engineer) for this project.
                </p>
              </div>

              {/* The "+" Button to Open Hiring Form */}
              <button
                type="button"
                onClick={() => handleOpenHiringModal()}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-[#261615] bg-[#FFEBAA] hover:bg-[#ffe38a] border-2 border-[#382322] shadow-[2px_2px_0_#382322] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Post New Role / Hiring</span>
              </button>
            </div>

            {/* Active Hirings List Cards */}
            {isLoadingHirings ? (
              <div className="text-center py-10 text-xs font-bold text-[#5C3A38] dark:text-[#D4B8A8]">Loading project hirings...</div>
            ) : hirings.length === 0 ? (
              <div className="p-8 border-2 border-dashed border-[#382322]/30 dark:border-[#FDEBDE]/30 rounded-2xl text-center space-y-3 bg-[#FAF0E6]/50 dark:bg-[#201413]/50">
                <div className="w-12 h-12 rounded-2xl bg-[#FFEBAA] border-2 border-[#382322] mx-auto flex items-center justify-center text-[#261615] shadow-[2px_2px_0_#382322]">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold font-serif text-[#261615] dark:text-[#FDEBDE]">No Hiring Positions Posted Yet</h4>
                  <p className="text-xs text-[#5C3A38] dark:text-[#D4B8A8] mt-1 max-w-md mx-auto">
                    Click <strong>"+ Post New Role / Hiring"</strong> above to open positions for Video Editors, Thumbnail Designers, Sound Designers, Scriptwriters, and more.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3.5">
                {hirings.map((hiring) => (
                  <div
                    key={hiring._id}
                    className="p-5 rounded-2xl bg-[#FAF0E6] dark:bg-[#261817] border-2 border-[#382322] dark:border-[#FDEBDE]/30 shadow-[3px_3px_0_#382322] space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                        <h4 className="text-sm font-bold font-serif text-[#261615] dark:text-[#FDEBDE]">{hiring.roleTitle}</h4>
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-[#FFEBAA] text-[#261615] border border-[#382322]">
                          {hiring.status === 'hired' ? 'Hired' : 'Open for Freelancers'}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-base font-extrabold font-serif text-emerald-700 dark:text-emerald-400">
                          {hiring.currency === 'INR' ? '₹' : '$'}{Number(hiring.budget).toLocaleString()}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleDeleteHiring(hiring._id)}
                          className="p-1.5 rounded-lg text-[#5C3A38] dark:text-[#D4B8A8] hover:text-rose-600 transition-colors cursor-pointer"
                          title="Remove role position"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {hiring.description && (
                      <p className="text-xs text-[#5C3A38] dark:text-[#D4B8A8] leading-relaxed">
                        {hiring.description}
                      </p>
                    )}

                    {/* Metadata tags */}
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      {hiring.firstDeadline && (
                        <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#261615] bg-[#FFEBAA] px-2.5 py-1 rounded-lg border border-[#382322]">
                          <Calendar className="w-3.5 h-3.5 text-[#261615]" />
                          <span>Deadline: {new Date(hiring.firstDeadline).toLocaleDateString()}</span>
                        </div>
                      )}

                      {Array.isArray(hiring.requiredSkills) && hiring.requiredSkills.map((sk) => (
                        <span
                          key={sk}
                          className="text-[11px] font-semibold text-[#261615] dark:text-[#FDEBDE] bg-white dark:bg-[#201413] px-2 py-0.5 rounded-md border border-[#382322]/30 dark:border-[#FDEBDE]/30"
                        >
                          {sk}
                        </span>
                      ))}

                      {Array.isArray(hiring.requiredTools) && hiring.requiredTools.map((tl) => (
                        <span
                          key={tl}
                          className="text-[11px] font-semibold text-[#261615] dark:text-[#FDEBDE] bg-[#B1C8EA]/30 dark:bg-[#B1C8EA]/20 px-2 py-0.5 rounded-md border border-[#382322]/30 dark:border-[#FDEBDE]/30"
                        >
                          {tl}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section: HIRED FREELANCERS */}
          <div className="bg-white dark:bg-[#201413] p-6 md:p-7 space-y-4 border-2 border-[#382322] dark:border-[#FDEBDE]/30 rounded-2xl shadow-[4px_4px_0_#382322] dark:shadow-[4px_4px_0_#FDEBDE]/20">
            <div className="flex items-center gap-2 pb-3 border-b-2 border-[#382322]/10 dark:border-[#FDEBDE]/10">
              <Users className="w-4 h-4 text-[#382322] dark:text-[#FFEBAA]" />
              <h3 className="text-base font-bold font-serif text-[#261615] dark:text-[#FDEBDE]">Hired Freelancers for this Project</h3>
            </div>

            {hiredFreelancers.length === 0 ? (
              <div className="p-5 rounded-xl bg-[#FAF0E6] dark:bg-[#261817] border border-[#382322]/20 dark:border-[#FDEBDE]/20 text-xs text-[#5C3A38] dark:text-[#D4B8A8] text-center">
                No freelancers hired yet. Applications will appear in your project dashboard and applications inbox once freelancers apply to your active hirings.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {hiredFreelancers.map((hf) => (
                  <div key={hf.hiringId} className="p-3.5 rounded-xl bg-[#FAF0E6] dark:bg-[#261817] border-2 border-[#382322] dark:border-[#FDEBDE]/30 shadow-[2px_2px_0_#382322] flex items-center gap-3">
                    <img
                      src={hf.freelancer?.profileImage || '/default-pfp.png'}
                      alt={hf.freelancer?.name || 'Freelancer'}
                      className="w-10 h-10 rounded-xl object-cover border-2 border-[#382322]"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-[#261615] dark:text-[#FDEBDE] truncate">{hf.freelancer?.name || 'Freelancer'}</div>
                      <div className="text-[11px] text-[#5C3A38] dark:text-[#D4B8A8] truncate">{hf.roleTitle}</div>
                      <div className="text-[10px] text-[#5C3A38] dark:text-[#D4B8A8] font-mono mt-0.5">
                        Agreed Budget: {hf.currency === 'INR' ? '₹' : '$'}{hf.budget}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Bottom Action Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-5 rounded-2xl bg-white dark:bg-[#201413] border-2 border-[#382322] dark:border-[#FDEBDE]/30 shadow-[4px_4px_0_#382322] dark:shadow-[4px_4px_0_#FDEBDE]/20">
            <button
              type="button"
              onClick={() => navigate('/creator/projects')}
              className="text-xs font-bold text-[#5C3A38] dark:text-[#D4B8A8] hover:text-[#261615] dark:hover:text-[#FDEBDE] transition-colors cursor-pointer"
            >
              View in All Projects
            </button>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Button
                variant="subtle"
                size="md"
                onClick={() => setStep(1)}
                className="flex-1 sm:flex-none text-xs"
              >
                ← Back to Scope
              </Button>
              <Button
                variant="primary"
                size="md"
                icon={CheckCircle}
                onClick={() => setShowFinalModal(true)}
                className="flex-1 sm:flex-none text-xs px-6"
              >
                Finish & Go to Workspace
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* HIRING FORM MODAL (TRIGGERED BY "+ Post New Role / Hiring")               */}
      {/* ========================================================================= */}
      {isHiringModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#261615]/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in overflow-y-auto">
          <div className="w-full max-w-2xl bg-[#FFF7F1] dark:bg-[#261817] p-6 md:p-8 border-2 border-[#382322] dark:border-[#FDEBDE]/30 rounded-2xl shadow-[8px_8px_0_#382322] dark:shadow-[8px_8px_0_#FDEBDE]/20 relative space-y-5 my-8">
            <button
              type="button"
              onClick={() => setIsHiringModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-xl bg-white dark:bg-[#201413] border-2 border-[#382322] dark:border-[#FDEBDE]/30 text-[#261615] dark:text-[#FDEBDE] hover:bg-[#FFEBAA] transition-colors cursor-pointer shadow-[2px_2px_0_#382322]"
            >
              <X className="w-4 h-4" />
            </button>

            <div>
              <span className="text-[11px] font-bold text-[#261615] uppercase tracking-wider bg-[#FFEBAA] px-2.5 py-0.5 rounded border border-[#382322]">
                New Hiring Opening
              </span>
              <h2 className="text-xl sm:text-2xl font-black font-serif text-[#261615] dark:text-[#FDEBDE] mt-1.5">
                Post Role for {title || 'Project'}
              </h2>
              <p className="text-xs text-[#5C3A38] dark:text-[#D4B8A8] mt-1">
                Select a content-creator role from the catalog, specify deliverables, skills, budget, and first milestone deadline.
              </p>
            </div>

            <form onSubmit={handlePostHiringSubmit} className="space-y-4 pt-1">
              {/* Select Role from Catalog (clean titles without parentheses) */}
              <div>
                <label className="text-xs font-bold text-[#261615] dark:text-[#FDEBDE] block mb-1.5">
                  Select Role <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={selectedRoleId}
                  onChange={(e) => handleRoleSelectChange(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-[#201413] border-2 border-[#382322] dark:border-[#FDEBDE]/30 text-xs font-semibold text-[#261615] dark:text-[#FDEBDE] shadow-[2px_2px_0_#382322] focus:outline-none focus:ring-1 focus:ring-[#382322] transition-all cursor-pointer"
                >
                  <option value="">-- Choose Role from Catalog --</option>
                  {availableRoles.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.title || r.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Role Deliverables / Description */}
              <div>
                <label className="text-xs font-bold text-[#261615] dark:text-[#FDEBDE] block mb-1.5">
                  Role Deliverables & Scope Details
                </label>
                <textarea
                  rows={3}
                  placeholder="Detail what this freelancer must deliver (e.g. 1st rough cut with sound FX, color-graded delivery, 2 revisions included)..."
                  value={hiringDescription}
                  onChange={(e) => setHiringDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#201413] border-2 border-[#382322] dark:border-[#FDEBDE]/30 text-xs text-[#261615] dark:text-[#FDEBDE] placeholder:text-[#382322]/40 dark:placeholder:text-[#FDEBDE]/40 shadow-[2px_2px_0_#382322] focus:outline-none focus:ring-1 focus:ring-[#382322] resize-none leading-relaxed"
                />
              </div>

              {/* Required Skills & Software Tags */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#261615] dark:text-[#FDEBDE] block">
                  Required Skills & Tools <span className="text-rose-500">*</span>
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {hiringSkills.map((sk) => (
                    <span
                      key={sk}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#FFEBAA] text-[#261615] border border-[#382322] text-[11px] font-bold"
                    >
                      {sk}
                      <button type="button" onClick={() => removeHiringSkill(sk)} className="hover:text-rose-600">&times;</button>
                    </span>
                  ))}
                  {hiringTools.map((tl) => (
                    <span
                      key={tl}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#B1C8EA] text-[#261615] border border-[#382322] text-[11px] font-bold"
                    >
                      {tl}
                      <button type="button" onClick={() => removeHiringTool(tl)} className="hover:text-rose-600">&times;</button>
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="text"
                    placeholder="Add specific skill/tool (e.g. DaVinci Resolve, Blender)..."
                    value={newHiringSkill}
                    onChange={(e) => setNewHiringSkill(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-lg bg-white dark:bg-[#201413] text-xs text-[#261615] dark:text-[#FDEBDE] placeholder:text-[#382322]/40 dark:placeholder:text-[#FDEBDE]/40 border-2 border-[#382322] dark:border-[#FDEBDE]/30 shadow-[2px_2px_0_#382322] focus:outline-none focus:ring-1 focus:ring-[#382322]"
                  />
                  <Button variant="secondary" size="sm" icon={Plus} onClick={addHiringSkill}>
                    Add
                  </Button>
                </div>
              </div>

              {/* Budget & First Deadline Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Role Budget */}
                <div>
                  <label className="text-xs font-bold text-[#261615] dark:text-[#FDEBDE] block mb-1.5">
                    Budget for this Role <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[#5C3A38] dark:text-[#D4B8A8]">
                      {budgetCurrency === 'INR' ? '₹' : '$'}
                    </span>
                    <input
                      type="number"
                      required
                      placeholder="e.g. 8000"
                      value={hiringBudget}
                      onChange={(e) => setHiringBudget(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 rounded-xl bg-white dark:bg-[#201413] border-2 border-[#382322] dark:border-[#FDEBDE]/30 text-xs font-bold text-[#261615] dark:text-[#FDEBDE] shadow-[2px_2px_0_#382322] focus:outline-none focus:ring-1 focus:ring-[#382322] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  </div>
                  {remainingBudget > 0 && (
                    <span className="text-[10px] font-semibold text-[#5C3A38] dark:text-[#D4B8A8] mt-1 block">
                      Remaining in project budget: {budgetCurrency === 'INR' ? '₹' : '$'}{remainingBudget.toLocaleString()}
                    </span>
                  )}
                </div>

                {/* First Cut Deadline with Custom Date Picker */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-[#261615] dark:text-[#FDEBDE]">
                      First Milestone Deadline
                    </label>
                    {maxProjectTurnaroundDays && (
                      <span className="text-[10px] text-[#382322] dark:text-[#FFEBAA] font-bold">
                        Max: {maxProjectTurnaroundDays} days
                      </span>
                    )}
                  </div>
                  <CustomDatePicker
                    value={hiringFirstDeadline}
                    onChange={(newDate) => setHiringFirstDeadline(newDate)}
                    minDate={todayStr}
                    maxDate={maxDeadlineDateStr}
                    placeholder="Pick milestone deadline..."
                  />
                  {currentDurationStr && (
                    <span className="text-[10px] text-[#5C3A38] dark:text-[#D4B8A8] mt-1 block">
                      Turnaround limit: within {currentDurationStr}
                    </span>
                  )}
                </div>
              </div>

              {/* Specific References or Notes for this Role */}
              <div>
                <label className="text-xs font-bold text-[#261615] dark:text-[#FDEBDE] block mb-1.5">
                  Specific References or Notes for this Role
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Reference video link, sound pack link, must provide source project files..."
                  value={hiringNotes}
                  onChange={(e) => setHiringNotes(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-[#201413] border-2 border-[#382322] dark:border-[#FDEBDE]/30 text-xs text-[#261615] dark:text-[#FDEBDE] placeholder:text-[#382322]/40 dark:placeholder:text-[#FDEBDE]/40 shadow-[2px_2px_0_#382322] focus:outline-none focus:ring-1 focus:ring-[#382322] resize-none"
                />
              </div>

              {/* Milestones Escrow Breakdown for this Role */}
              {previewMilestones.length > 0 && (
                <div className="p-4 rounded-2xl bg-white dark:bg-[#201413] border-2 border-[#382322] dark:border-[#FDEBDE]/30 shadow-[3px_3px_0_#382322] space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-[#FFEBAA] border border-[#382322] flex items-center justify-center">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#261615]" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold font-serif text-[#261615] dark:text-[#FDEBDE]">Role Milestones & Escrow Allocation</h4>
                        <p className="text-[11px] text-[#5C3A38] dark:text-[#D4B8A8]">
                          Tailored 3-phase verification roadmap for {hiringRoleTitle}.
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#FFEBAA] text-[#261615] border border-[#382322]">
                      3 Milestones • 100% Budget
                    </span>
                  </div>

                  <div className="space-y-2 pt-1">
                    {previewMilestones.map((m) => (
                      <div
                        key={m.id}
                        className="p-3 rounded-xl bg-[#FAF0E6] dark:bg-[#261817] border border-[#382322]/20 dark:border-[#FDEBDE]/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
                      >
                        <div className="space-y-0.5 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="w-4 h-4 rounded-full bg-[#382322] text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                              {m.index}
                            </span>
                            <span className="text-xs font-bold text-[#261615] dark:text-[#FDEBDE] truncate">
                              {m.title}
                            </span>
                            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-[#FFEBAA] text-[#261615] border border-[#382322] shrink-0">
                              {Math.round(m.percent * 100)}%
                            </span>
                          </div>
                          <p className="text-[11px] text-[#5C3A38] dark:text-[#D4B8A8] pl-6 leading-tight">
                            {m.description}
                          </p>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pl-6 sm:pl-0 pt-1 sm:pt-0 border-t sm:border-t-0 border-[#382322]/10">
                          {m.deadline && (
                            <span className="text-[10px] text-[#261615] dark:text-[#FFEBAA] font-mono font-bold">
                              Due: {new Date(m.deadline).toLocaleDateString()}
                            </span>
                          )}
                          <span className="text-xs font-mono font-bold text-emerald-700 dark:text-emerald-400">
                            {budgetCurrency === 'INR' ? '₹' : '$'}{m.amount.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* AI Budget & Deadline Suggestion Section (Bottom of Form) */}
              <div className="p-4 rounded-2xl bg-[#B1C8EA]/20 dark:bg-[#B1C8EA]/10 border-2 border-[#382322] dark:border-[#FDEBDE]/30 shadow-[3px_3px_0_#382322] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-[#FFEBAA] border border-[#382322] flex items-center justify-center">
                      <Sparkles className="w-3.5 h-3.5 text-[#261615]" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold font-serif text-[#261615] dark:text-[#FDEBDE]">AI Budget & Deadline Suggestion</h4>
                      <p className="text-[11px] text-[#5C3A38] dark:text-[#D4B8A8]">
                        Suggests fair budget & delivery date using role, skills, and project scope.
                      </p>
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border border-[#382322] ${
                    canAiSuggest
                      ? 'bg-[#FFEBAA] text-[#261615]'
                      : 'bg-white dark:bg-[#201413] text-[#5C3A38] dark:text-[#D4B8A8]'
                  }`}>
                    {canAiSuggest ? 'Ready for AI' : 'Criteria Required'}
                  </span>
                </div>

                {/* Inherited Project Scope Metadata */}
                <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-semibold text-[#261615] dark:text-[#FDEBDE] pt-0.5">
                  <span className="text-[#5C3A38] dark:text-[#D4B8A8]">Project Context:</span>
                  <span className="px-2 py-0.5 rounded bg-white dark:bg-[#201413] border border-[#382322]/30 dark:border-[#FDEBDE]/30">
                    Category: {effectiveCategory || 'From Project'}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-white dark:bg-[#201413] border border-[#382322]/30 dark:border-[#FDEBDE]/30">
                    Style: {effectiveStyle || 'From Project'}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-white dark:bg-[#201413] border border-[#382322]/30 dark:border-[#FDEBDE]/30">
                    Length: {effectiveDuration || 'From Project'}
                  </span>
                </div>

                {!canAiSuggest && (
                  <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800/40 text-[11px] text-amber-900 dark:text-amber-200 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-700 dark:text-amber-400 shrink-0 mt-0.5" />
                    <p className="leading-relaxed">
                      Select a <strong>Role</strong> and add at least one <strong>Skill or Tool</strong> to enable AI suggestions. The project category, editing style, and video length are automatically inherited.
                    </p>
                  </div>
                )}

                {/* AI Suggest Button */}
                <button
                  type="button"
                  onClick={handleAiSuggestHiring}
                  disabled={isAiSuggestingHiring || !canAiSuggest}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs bg-white hover:bg-[#FFEBAA] text-[#261615] border-2 border-[#382322] shadow-[2px_2px_0_#382322] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed group"
                >
                  <Sparkles className={`w-3.5 h-3.5 text-[#261615] group-hover:rotate-12 transition-transform ${isAiSuggestingHiring ? 'animate-spin' : ''}`} />
                  <span>{isAiSuggestingHiring ? 'AI Computing Budget & Deadline...' : '✨ Suggest Budget & First Deadline with AI'}</span>
                </button>

                {/* AI Results Display Card */}
                {aiSuggestionData && (
                  <div className="p-3.5 rounded-xl bg-white dark:bg-[#201413] border-2 border-[#382322] dark:border-[#FDEBDE]/30 shadow-[2px_2px_0_#382322] space-y-2 text-xs animate-fade-in">
                    <div className="flex items-center justify-between border-b border-[#382322]/10 dark:border-[#FDEBDE]/10 pb-2">
                      <span className="font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5 text-xs">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        AI Recommendations Applied to Inputs Above
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <div className="space-y-0.5">
                        <div className="text-[11px] font-bold text-[#5C3A38] dark:text-[#D4B8A8]">Suggested Budget:</div>
                        <div className="text-sm font-black font-serif text-emerald-700 dark:text-emerald-400">
                          {budgetCurrency === 'INR' ? '₹' : '$'}{Number(aiSuggestionData.suggestedBudget).toLocaleString()}
                        </div>
                        {aiSuggestionData.budgetRationale && (
                          <p className="text-[10px] text-[#5C3A38] dark:text-[#D4B8A8] leading-tight">{aiSuggestionData.budgetRationale}</p>
                        )}
                      </div>
                      <div className="space-y-0.5">
                        <div className="text-[11px] font-bold text-[#5C3A38] dark:text-[#D4B8A8]">Suggested First Deadline:</div>
                        <div className="text-sm font-black font-serif text-[#261615] dark:text-[#FFEBAA]">
                          ~{aiSuggestionData.suggestedDeadlineDays || 4} Days ({new Date(aiSuggestionData.suggestedFirstDeadline).toLocaleDateString()})
                        </div>
                        {aiSuggestionData.timelineRationale && (
                          <p className="text-[10px] text-[#5C3A38] dark:text-[#D4B8A8] leading-tight">{aiSuggestionData.timelineRationale}</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t-2 border-[#382322]/10 dark:border-[#FDEBDE]/10">
                <button
                  type="button"
                  onClick={() => setIsHiringModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-[#5C3A38] dark:text-[#D4B8A8] hover:text-[#261615] dark:hover:text-[#FDEBDE] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPostingHiring}
                  className="px-6 py-2.5 rounded-xl bg-[#FFEBAA] hover:bg-[#ffe38a] text-[#261615] font-bold text-xs uppercase tracking-wider border-2 border-[#382322] shadow-[3px_3px_0_#382322] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isPostingHiring ? 'Posting Opening...' : 'Post Hiring Position'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* FINAL COMPLETION MODAL                                                    */}
      {/* ========================================================================= */}
      {showFinalModal && (
        <div className="fixed inset-0 z-50 bg-[#261615]/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-lg bg-[#FFF7F1] dark:bg-[#261817] p-8 border-2 border-[#382322] dark:border-[#FDEBDE]/30 rounded-2xl shadow-[8px_8px_0_#382322] dark:shadow-[8px_8px_0_#FDEBDE]/20 relative text-center space-y-5">
            <div className="w-16 h-16 rounded-2xl bg-[#FFEBAA] border-2 border-[#382322] p-0.5 mx-auto shadow-[3px_3px_0_#382322] flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-[#261615]" />
            </div>

            <div>
              <span className="text-[11px] font-bold text-[#261615] uppercase tracking-widest bg-[#FFEBAA] px-3 py-1 rounded-full border border-[#382322]">
                Project & Team Configured
              </span>
              <h2 className="text-2xl font-black font-serif text-[#261615] dark:text-[#FDEBDE] mt-2 tracking-tight">
                Project & Hirings are Live! 🚀
              </h2>
              <p className="text-xs text-[#5C3A38] dark:text-[#D4B8A8] mt-1.5 max-w-md mx-auto leading-relaxed">
                Your production brief and {hirings.length} hiring position(s) are active on Collabo. Freelancers and editors can now discover and apply to your roles.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-[#201413] border-2 border-[#382322] dark:border-[#FDEBDE]/30 shadow-[2px_2px_0_#382322] text-left text-xs space-y-2">
              <div className="flex justify-between items-center pb-2 border-b border-[#382322]/10 dark:border-[#FDEBDE]/10">
                <span className="text-[#5C3A38] dark:text-[#D4B8A8]">Project:</span>
                <span className="font-bold text-[#261615] dark:text-[#FDEBDE] truncate max-w-[220px]">{title}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#5C3A38] dark:text-[#D4B8A8]">Total Budget:</span>
                <span className="font-extrabold font-serif text-emerald-700 dark:text-emerald-400">
                  {budgetCurrency === 'INR' ? '₹' : '$'}{numericTotalBudget.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#5C3A38] dark:text-[#D4B8A8]">Open Role Openings:</span>
                <span className="font-bold text-[#261615] dark:text-[#FFEBAA]">{hirings.length} Positions</span>
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
                onClick={() => navigate('/creator/workspace')}
                className="text-xs px-6"
              >
                Go to Workspace
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateProject;
