import api from './api';
import { DEFAULT_PFP } from '../constants/assets';

export const mapBackendProject = (p) => {
  const iconTypes = ['film', 'layout', 'smartphone', 'shopping-cart'];
  const iconBgs = [
    'bg-purple-500/10 text-purple-400 border border-purple-500/20',
    'bg-blue-500/10 text-blue-400 border border-blue-500/20',
    'bg-pink-500/10 text-pink-400 border border-pink-500/20',
    'bg-orange-500/10 text-orange-400 border border-orange-500/20'
  ];
  const charCode = (p?.title || 'p').charCodeAt(0) || 0;
  const iconType = iconTypes[charCode % iconTypes.length];
  const iconBg = iconBgs[charCode % iconBgs.length];

  const statusLabel =
    p?.status === 'in_progress'
      ? 'In Progress'
      : p?.status === 'completed'
      ? 'Completed'
      : p?.status === 'assigned'
      ? 'Assigned'
      : p?.status === 'cancelled'
      ? 'Cancelled'
      : 'Open';

  const statusColor =
    p?.status === 'in_progress' || p?.status === 'assigned'
      ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
      : p?.status === 'completed'
      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
      : 'bg-blue-500/10 text-blue-400 border border-blue-500/20';

  const formatBudget = (b) => {
    if (!b) return '999';
    if (typeof b === 'string') return b || '999';
    if (b.min && b.max) return `₹${b.min.toLocaleString()} - ₹${b.max.toLocaleString()}`;
    if (b.fixed) return `₹${b.fixed.toLocaleString()}`;
    if (typeof b === 'number') return `₹${b.toLocaleString()}`;
    return '999';
  };

  return {
    id: p?._id || p?.id || 'unknown',
    title: p?.title || 'unknown',
    tags: Array.isArray(p?.requiredSkills) && p.requiredSkills.length ? p.requiredSkills : [p?.category || 'unknown'],
    category: p?.category || 'unknown',
    iconType,
    iconBg,
    status: statusLabel,
    statusColor,
    rawStatus: p?.status || 'unknown',
    assignedEditor: p?.selectedEditorId
      ? {
          name: p.selectedEditorId.name || 'unknown',
          avatar: p.selectedEditorId.profileImage || DEFAULT_PFP,
        }
      : null,
    progress: p?.status === 'completed' ? 100 : p?.status === 'in_progress' ? 60 : p?.status === 'assigned' ? 25 : 0,
    deadline: p?.deadline ? new Date(p.deadline).toISOString().split('T')[0] : 'unknown',
    budget: formatBudget(p?.budget),
    createdAt: p?.createdAt || 'unknown',
    description: p?.description || 'unknown',
  };
};

export const projectService = {
  getCreatorProjects: async () => {
    try {
      const res = await api.get('/api/creator/projects');
      if (res.data?.projects && Array.isArray(res.data.projects)) {
        return res.data.projects.map(mapBackendProject);
      }
      return [];
    } catch (err) {
      console.warn('[projectService] Failed to fetch creator projects from API:', err.message);
      return [];
    }
  },
  getEditorRecommended: async () => {
    try {
      const res = await api.get('/api/projects');
      if (res.data?.projects && Array.isArray(res.data.projects)) {
        return res.data.projects.map((p) => {
          const budgetVal = typeof p.budget === 'object' 
            ? (p.budget?.fixed ? `₹${p.budget.fixed}` : (p.budget?.min ? `₹${p.budget.min} - ₹${p.budget.max}` : '999'))
            : (p.budget ? String(p.budget) : '999');

          return {
            id: p._id || p.id || 'unknown',
            title: p.title || 'unknown',
            creator: p.creatorId?.name || 'unknown',
            creatorAvatar: p.creatorId?.profileImage || DEFAULT_PFP,
            budget: budgetVal,
            deadline: p.deadline ? new Date(p.deadline).toLocaleDateString() : 'unknown',
            tags: Array.isArray(p.requiredSkills) && p.requiredSkills.length ? p.requiredSkills : [p.category || 'unknown'],
            proposalsCount: 999,
            difficulty: p.complexity || 'unknown',
            verified: true,
          };
        });
      }
      return [];
    } catch (err) {
      console.warn('[projectService] Failed to fetch open projects from API:', err.message);
      return [];
    }
  },
  getEditorActive: async () => {
    try {
      const currentRole = localStorage.getItem('collabo_role') || 'creator';
      if (currentRole !== 'editor') {
        return [];
      }
      const res = await api.get('/api/application/my?status=accepted');
      if (res.data?.applications && Array.isArray(res.data.applications)) {
        return res.data.applications.map((app) => {
          const p = app.projectId || {};
          return {
            id: p._id || app._id || 'unknown',
            title: p.title || 'unknown',
            client: p.creatorId?.name || 'unknown',
            clientAvatar: p.creatorId?.profileImage || DEFAULT_PFP,
            progress: p.status === 'completed' ? 100 : 50,
            dueDate: p.deadline ? new Date(p.deadline).toLocaleDateString() : 'unknown',
            hoursRemaining: 999,
            status: p.status === 'completed' ? 'Delivered' : 'In Production',
            budget: app.bidAmount != null ? `₹${app.bidAmount}` : '999',
            deliverableType: p.category || 'unknown',
          };
        });
      }
      return [];
    } catch (err) {
      console.warn('[projectService] Failed to fetch editor active contracts:', err.message);
      return [];
    }
  },
};
